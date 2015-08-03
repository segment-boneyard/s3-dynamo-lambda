variable "aws_account_id" {}
variable "aws_region" {
	default = "us-east-1"
}
variable "bucket_name" {}
variable "lambda_build" {
	default = "../build.zip"
}