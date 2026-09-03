import boto3
from botocore.exceptions import ClientError
from boto3.s3.transfer import S3UploadFailedError
from src.config.conf import bucket_name
import os
from src.exceptions.database import S3UploadError
from src.config.conf import aws_key, aws_secret_key, aws_region

async def upload_file_to_bucket(file_name : str, bucket_name_param : str = bucket_name):
    key = os.path.basename(file_name)
    session = boto3.Session(
        aws_access_key_id = aws_key,
        aws_secret_access_key = aws_secret_key,
        region_name = aws_region
    )
    resource = session.resource('s3')

    try:
        bucket = resource.Bucket(bucket_name_param)
        obj = bucket.Object(key)

        # Upload the file
        obj.upload_file(file_name)
        print(
            f"Uploaded file {file_name} into bucket {bucket.name} with key {obj.key}."
        )

        # Construct and return the url where it is stored
        return f"https://{bucket.name}.s3.amazonaws.com/{key}"
    except (S3UploadFailedError, ClientError) as err:
        raise S3UploadError(f"Couldn't upload file {file_name} to {bucket_name_param}: {err}") from err