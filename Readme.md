
# S3-Dynamo-Lambda connector

With Segment's S3 integration, you can host an entire analytics pipeline without having to worry about individual instances or hosting your own infrastructure. Here's how to set up an integration which automatically tallies events in Dynamo every hour without requiring any hosting on your side.

## Getting Started

First you'll want to download and install [terraform][]. We'll use it to automatically provision and setup our infrastructure using the files in the [./terraform][] directory.

If you haven't already, you'll want to create an AWS account and download your API Keys for making requests. You'll typically want to add them to your `.bashrc` or use a tool like [`direnv`][direnv] to add them to your environment variables

[terraform]: https://terraform.io/downloads.html
[./terraform]: https://github.com/segmentio/s3-dynamo-lambda/tree/master/terraform
[direnv]: http://direnv.net/

## Setting up your project

Before connecting to your AWS account, you'll want to make sure that you've exported the following variables with the credentials for your account.

    export AWS_ACCESS_KEY_ID="xxxxxxxxx"
    export AWS_SECRET_ACCESS_KEY="xxxxxxxx"
    export AWS_REGION="us-east-1"

Next clone this repo, then you'll be ready to set up your project specific settings

    git clone git@github.com:segmentio/s3-dynamo-lambda.git

Terraform will also ask you for specific variables as well, which you'll want to save in a `terraform.tfvars` file in your project directory. You'll need to supply the name of the bucket you'd like to add, your aws account id (a 12-digit number found under your account), and the region where you want to add your infrastructure. It should look something like this

    bucket_name = "your-desired-bucket-name"
    aws_account_id = "386218347676"
    aws_region = "us-east-1"

From there, just run `make`. This will spin up your S3 bucket, Lambda function, and Dynamo instance, all with the appropriate permissions.  

    $ make

The last thing you'll need to do is enable an event notification for your bucket, which haven't been setup for terraform yet. You can enable it in the AWS console, following the instructions found [here](http://docs.aws.amazon.com/AmazonS3/latest/UG/SettingBucketNotifications.html#SettingBucketNotifications-enable-events).

Finally, you'll want to [add your bucket to the S3 integration for your Segment project](https://segment.com/docs/integrations/amazon-s3/). 

![](https://cloudup.com/cSdeplmW4Vs+)

And, that's it. You're done! A totally hosted analytics pipeline. Query away my friend!

## The Lambda function

We've stored our example lambda function in the [segment.js](https://github.com/segmentio/s3-dynamo-lambda/blob/master/segment.js) file. It reads from our S3 event logs, splits the line separated json, and adds the counts of different events into Dynamo.

If you want to update the lambda function, simply change the code around and then run `make update`. The meat of the event interactions happens in our `handleEvent` function.

## Testing

If you're testing the lambda function, it's easiest to use the CLI. 

    aws lambda invoke \                    
      --invocation-type RequestResponse \
      --function-name segment-s3-dynamo \
      --region us-east-1 \
      --log-type Tail \
      --payload file://file.json \
      output.txt

Where your payload file looks something like:

```json
{
  "Records": [
    {
      "s3": {
        "object": {
          "key": "{FILE_PATH}"
        },
        "bucket": {
          "arn": "arn:aws:s3:::{YOUR_BUCKET}",
          "name": "{YOUR_BUCKET}"
        }
      }
    }
  ]
}
```

