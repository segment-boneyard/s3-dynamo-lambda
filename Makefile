

provision: build
	terraform apply -target="aws_lambda_function.segment-s3-dynamo" \
		-target="aws_dynamodb_table.segment-s3-dynamo" \
		-target="aws_iam_role.segment-s3-dynamo-lambda" ./terraform
	terraform apply ./terraform 

build: clean
	npm install
	zip -r build.zip index.js node_modules

clean:
	rm -f build.zip

update: build
	terraform destroy -target=aws_lambda_function.segment-s3-dynamo ./terraform
	terraform apply ./terraform

.PHONY: provision build clean update