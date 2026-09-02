import boto3
from botocore.exceptions import ClientError
from boto3.s3.transfer import S3UploadFailedError
from src.config.conf import bucket_name
import os
from src.exceptions.database import S3UploadError

async def upload_file_to_bucket(file_name : str, bucket : str = bucket_name):
    key = os.path.basename(file_name)
    resource = boto3.resource("s3")
    bucket = resource.Bucket(bucket)
    obj = bucket.Object(key)
    try:
        # Upload the file
        obj.upload_file(file_name, key)
        print(
            f"Uploaded file {file_name} into bucket {bucket.name} with key {obj.key}."
        )

        # Construct and return the url where it is stored
        return f"https://{bucket}.s3.amazonaws.com/{key}"
    except (S3UploadFailedError, ClientError) as err:
        raise S3UploadError(f"Couldn't upload file {file_name} to {bucket}: {err}") from err