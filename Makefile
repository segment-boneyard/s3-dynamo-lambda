

provision: build
	terraform apply ./terraform

build:
	npm install
	zip -r build.zip segment.js node_modules



