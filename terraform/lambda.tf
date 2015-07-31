
resource "aws_lambda_function" "segment-s3-dynamo" {
	filename = "lambda.zip"
	function_name = "segment-s3-dynamo"
	handler = "exports.handler"
}