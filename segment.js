
/**
 * Module dependencies
 */

var datemath = require('date-math');
var through2 = require('through2');
var pipe = require('multipipe');
var Batch = require('batch');
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
  var batch = new Batch();

  console.log('Recieved S3 event, downloading file...');

   /**
   * Request S3 file stream, then:
   *
   * - unzip stream
   * - decode Buffer chunks to String
   * - buffer strings to newlines
   * - emit parsed events
   * - push each event into batch for flush to dynamo
   * - close stream and wait on batch to finish
   */

  pipe(
    s3.getObject({ Bucket: bucket, Key: key }).createReadStream(),
    zlib.createGunzip(),
    stringify(),
    split(parse)
  ).on('data', handleEvent)
   .on('error', handleError)
   .on('end', close);

  /**
   * The segment event handler
   *
   * Takes a segment event and insert/incrs a record in Dynamo like so:
   *
   * [<event_name>.<hour>] = count
   *
   * @param {Object} event
   * @param {Object} context
   */

  function handleEvent(event) {
    if (event.type !== 'track') return;
    var Hour = String(datemath.hour.floor(new Date(event.timestamp)).getTime());
    var Name = event.event;

    console.log('Event:', Name);

    batch.push(function(done) {
      dynamo.updateItem({
        Key: {
          Name: { S: Name },
          Timestamp: { N: Hour }
        },
        TableName: 'Events',
        AttributeUpdates: {
          Count: {
            Value: { N: '1'},
            Action: 'ADD'
          }
        }
      }, function(err) {
        if (err) return done(err);
        console.log('Flushed:', Name);
        done();
      });
    });
  }

  // decode Buffer chunks to strings
  function stringify() {
    return through2(function(data, _, cb) {
      cb(null, data.toString('utf8'));
    });
  }

  // take lines emitted from `split` and parse them
  function parse(str) {
    return str === '' ? null : JSON.parse(str.trim());
  }

  // handle stream errors (just bail, for now :p)
  function handleError(err) {
    console.log('Error:', err);
    console.log('Exiting...');
    context.done(err);
  }

  // handle the end of the stream
  // wait for batch to finish then terminate the lambda session
  function close() {
    batch.end(function(err) {
      if (err) return context.done(err);
      console.log('Finished Flush!')
      context.done();
    });
  }
}
