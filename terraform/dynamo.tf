
/**
 * The Segment Dynamo table which will keep track of 
 * event counts over time.
 */

resource "aws_dynamodb_table" "segment-s3-dynamo" {
    name = "Events"
    read_capacity = 20
    write_capacity = 20
    hash_key = "Name"
    range_key = "Timestamp"
    attribute {
      name = "Name"
      type = "S"
    }
    attribute {
      name = "Timestamp"
      type = "N"
    }
}