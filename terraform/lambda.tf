
/**
 * Our S3-dynamo lambda function which updates hourly event
 * counts in dynamo
 */

resource "aws_lambda_function" "segment-s3-dynamo" {
	filename = "${var.lambda_build}"
	function_name = "segment-s3-dynamo"
	handler = "index.handler"
	role = "${aws_iam_role.segment-s3-dynamo-lambda.arn}"
	timeout = "60"
}
