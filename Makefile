

provision: build
	terraform apply ./terraform

build:
	cd lambda && zip -r ../build.zip .



