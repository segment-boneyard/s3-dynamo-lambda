
resource "aws_lambda_function" "segment-s3-dynamo" {
	filename = "build.zip"
	function_name = "segment-s3-dynamo"
	handler = "segment.handler"
	role = "${aws_iam_role.segment-s3-dynamo-lambda.arn}"
}