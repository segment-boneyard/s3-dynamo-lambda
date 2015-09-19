
/**
 * The Segment Dynamo table which will keep track of 
 * event counts over time.
 * 
 * Keys will be tuples in the form:
 *   
 *   <UserId, Timestamp>
 */

resource "aws_dynamodb_table" "segment-s3-dynamo" {
    name = "Events"
    read_capacity = 20
    write_capacity = 20
    hash_key = "UserId"
    range_key = "Timestamp"
    attribute {
      name = "UserId"
      type = "S"
    }
    attribute {
      name = "Timestamp"
      type = "N"
    }
}