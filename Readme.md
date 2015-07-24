
# S3-Dynamo-Lambda connector

More easily than ever, you can host an entire analytics pipeline without having to worry about individual instances or who will run your analytics code. Here's how.

##

    $ make build

    $ aws lambda create-function \
      --region us-west-2 \
      --function-name S3-Dynamo \
      --zip-file file://file-path/build.zip \
      --role role-arn \
      --handler Worker.handler \
      --runtime nodejs \
      --profile adminuser \
      --timeout 10 \
      --memory-size 1024

    $ aws lambda add-permission \
      --function-name S3-Dynamo \
      --region us-west-2 \
      --statement-id  \
      --action "lambda:InvokeFunction" \
      --principal s3.amazonaws.com \
      --source-arn arn:aws:s3:::sourcebucket \
      --source-account bucket-owner-account-id \
      --profile adminuser

## TODO

 - cloudformation/tf
 - script iam users
 - code
