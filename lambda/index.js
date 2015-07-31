
/**
 * The main event handler
 */

exports.handler = function(event, context) {
  console.log('event: ', event)
  context.done();
}