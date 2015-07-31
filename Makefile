

dist: build
	terraform apply ./terraform

build:
	zip -r build.zip lambda



