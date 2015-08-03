
/**
 * Module dependencies
 */

var through2 = require('through2');
var datemath = require('date-math');
var AWS = require('aws-sdk');
var split = require('split');
var zlib = require('zlib');

var dynamo = new AWS.DynamoDB({ region: 'us-east-1' });
var s3 = new AWS.S3();

/**
 * The main event handler.
 *
 * Streams file from S3 and invokes `handleEvent` on each event in the file
 *
 * @param {Object} s3Event
 * @param {Object} context
 */

exports.handler = function(s3Event, context) {
  var bucket = s3Event.Records[0].s3.bucket.name;
  var key = s3Event.Records[0].s3.object.key;

  s3.getObject({ Bucket: bucket, Key: key })
    .createReadStream()
    .pipe(zlib.createGunzip())
    .pipe(through2(function(data, _, cb) {
       cb(null, data.toString('utf8'));
     }))
    .pipe(split(function(str) {
      return str === '' ? null : JSON.parse(str.trim());
    }))
    .on('data', handleEvent)
    .on('error', function(err) {
      context.done(err);
    })
    .on('end', function() {
      context.succeed({ result: 'Finished Upload.' });
    });
}

/**
 * The segment event handler
 *
 * Takes a segment event and insert/incrs a record in Dynamo:
 *
 * [<event_name>.<hour>] = count
 *
 * @param {Object} event
 * @param {Object} context
 */

function handleEvent(event) {
 if (event.type !== 'track') return;
 var hour = String(datemath.hour.floor(new Date(event.timestamp)).getTime());
 var name = event.event;

 var params = {
   Key: {
     Name: {
       S: name
     },
     Timestamp: {
       N: hour
     }
   },
   TableName: 'Events',
   AttributeUpdates: {
     Count: {
       Value: {
         N: '1'
       },
       Action: 'ADD'
     }
   }
 };

 dynamo.updateItem(params, function(err) {
   if (err) console.log('error:', err);
 });
}

