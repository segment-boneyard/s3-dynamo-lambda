
# S3-Dynamo-Lambda connector

With Segment's S3 integration, you can host an entire analytics pipeline without having to worry about individual instances or hosting your own infrastructure. Here's how to set up an integration which automatically tallies events in Dynamo every hour without requiring any hosting on your side.

## Getting Started

First you'll want to download and install [terraform][]. We'll use it to automatically provision and setup our infrastructure using the files in this repo's [./terraform][] directory.

If you haven't already, you'll want to create an AWS Account. For the rest of this setup process won't have to create **any** AWS infrastructure manually. Our terraform scripts will take care of all of it for you.

[terraform]: https://terraform.io/downloads.html
[./terraform]: https://github.com/segmentio/s3-dynamo-lambda/tree/master/terraform
[direnv]: http://direnv.net/

## Setting up your project

Before running the Terraform script, you'll want to download your Access Keys from the AWS Security Credentials dashboard. You'll typically want to add them to your `.bashrc`, or use a tool like [`direnv`][direnv] to add them to your environment variables:

    export AWS_ACCESS_KEY_ID="xxxxxxxxx"
    export AWS_SECRET_ACCESS_KEY="xxxxxxxx"
    export AWS_REGION="us-east-1"

Next, clone this repo:

    git clone git@github.com:segmentio/s3-dynamo-lambda.git

Terraform also needs to know a few specific variables, which you'll want to save in a `terraform.tfvars` file in the top-level directory of the repo you just cloned. You'll need to supply the name of the bucket you'd like to add, your AWS Account ID (a 12-digit number found under in your AWS Security Crednetials dashboard), and the region where you want to add your infrastructure (Segment's S3 worker is only us-east-1 for now, so stick with us-east-1). It should look something like this:

    bucket_name = "your-desired-bucket-name"
    aws_account_id = "386218347676"
    aws_region = "us-east-1"

From there, just run `make`. This will spin up your S3 bucket, Lambda function, and Dynamo instance, all with the appropriate permissions.  

    $ make

You'll also **need to enable an event notification for your bucket** (which hasn't been added to terraform yet). You can enable it in the AWS S3 Console, [following the instructions in the AWS docs](http://docs.aws.amazon.com/AmazonS3/latest/UG/SettingBucketNotifications.html#SettingBucketNotifications-enable-events). You'll want to trigger an event for all ObjectCreated events, and route it to the Lambda function that terraform has created.

Finally, you'll want to add your bucket to the S3 integration for your Segment project: 

![](https://cloudup.com/cSdeplmW4Vs+)

And, that's it. You're done! A totally hosted analytics pipeline, updated every hour, on the hour. Your DynamoDB table of event counts can be found here: [https://console.aws.amazon.com/dynamodb/home?region=us-east-1#explore:name=Events](https://console.aws.amazon.com/dynamodb/home?region=us-east-1#explore:name=Events)

When the next hour strikes, query away my friend!

## Background: The Lambda function

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

