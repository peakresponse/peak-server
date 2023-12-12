const AWS = require('aws-sdk');

const s3options = {};
if (process.env.AWS_ACCESS_KEY_ID) {
  s3options.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
}
if (process.env.AWS_SECRET_ACCESS_KEY) {
  s3options.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
}
if (process.env.AWS_S3_BUCKET_REGION) {
  s3options.region = process.env.AWS_S3_BUCKET_REGION;
}
const s3 = new AWS.S3(s3options);

function getSignedUploadUrl({ ContentType, Key }) {
  return s3.getSignedUrlPromise('putObject', {
    ACL: 'private',
    Bucket: process.env.AWS_S3_BUCKET,
    ContentType,
    Key,
    ServerSideEncryption: 'AES256',
  });
}

function getSignedDownloadUrl({ Key }) {
  return s3.getSignedUrlPromise('getObject', {
    Bucket: process.env.AWS_S3_BUCKET,
    Expires: 60,
    Key,
  });
}

function getObject({ Key }) {
  return s3
    .getObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key,
    })
    .promise();
}

function deleteObject({ Key }) {
  return s3
    .deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key,
    })
    .promise();
}

function copyObject({ CopySource, Key }) {
  return s3
    .copyObject({
      ACL: 'private',
      Bucket: process.env.AWS_S3_BUCKET,
      CopySource,
      Key,
      ServerSideEncryption: 'AES256',
    })
    .promise();
}

function putBucketCors({ CORSConfiguration }) {
  return s3
    .putBucketCors({
      Bucket: process.env.AWS_S3_BUCKET,
      CORSConfiguration,
    })
    .promise();
}

function putBucketLifecycleConfiguration({ LifecycleConfiguration }) {
  return s3
    .putBucketLifecycleConfiguration({
      Bucket: process.env.AWS_S3_BUCKET,
      LifecycleConfiguration,
    })
    .promise();
}

module.exports = {
  copyObject,
  deleteObject,
  getObject,
  getSignedDownloadUrl,
  getSignedUploadUrl,
  putBucketCors,
  putBucketLifecycleConfiguration,
};
