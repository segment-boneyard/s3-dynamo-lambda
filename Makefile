

provision: build
	terraform apply ./terraform

build: clean
	npm install
	zip -r build.zip segment.js node_modules

clean:
	rm -f build.zip

update: build
	terraform destroy -target=aws_lambda_function.segment-s3-dynamo ./terraform
	terraform apply ./terraform

.PHONY: provision build clean update