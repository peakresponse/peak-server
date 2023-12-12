const {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutBucketCorsCommand,
  PutBucketLifecycleConfigurationCommand,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl: getSignedS3Url } = require('@aws-sdk/s3-request-presigner');
// const { getSignedUrl: getSignedCloudFrontUrl } = require('@aws-sdk/cloudfront-signer');
const fs = require('fs');

let client;
let signerClient;
if (process.env.AWS_S3_ENDPOINT) {
  const options = {
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
    endpoint: process.env.AWS_S3_ENDPOINT,
    region: process.env.AWS_S3_REGION,
    forcePathStyle: true,
  };
  client = new S3Client(options);
  if (process.env.AWS_S3_SIGNER_ENDPOINT) {
    signerClient = new S3Client({
      ...options,
      endpoint: process.env.AWS_S3_SIGNER_ENDPOINT,
    });
  }
}

function copyObject({ CopySource, Key }) {
  return client.send(
    new CopyObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      CopySource,
      Key,
    })
  );
}

function deleteObject({ Key }) {
  return client.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key,
    })
  );
}

async function deleteObjects({ Prefix }) {
  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix,
    })
  );
  if (response.Contents) {
    return client.send(
      new DeleteObjectsCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Delete: {
          Objects: response.Contents.map((obj) => ({ Key: obj.Key })),
        },
      })
    );
  }
  return Promise.resolve();
}

function getObject({ Key }) {
  return client.send(
    new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key,
    })
  );
}

function getSignedUploadUrl({ ContentType, Key }) {
  return getSignedS3Url(
    signerClient ?? client,
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      ContentType,
      Key,
    })
  );
}

function getSignedDownloadUrl({ Key }) {
  return getSignedS3Url(
    signerClient ?? client,
    new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key,
    }),
    { expiresIn: 60 }
  );
}

async function objectExists({ Key }) {
  try {
    const response = await client.send(
      new HeadObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key,
      })
    );
    return response !== null;
  } catch (err) {
    return false;
  }
}

function putBucketCors({ CORSConfiguration }) {
  return client.send(
    new PutBucketCorsCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      CORSConfiguration,
    })
  );
}

function putBucketLifecycleConfiguration({ LifecycleConfiguration }) {
  return client.send(
    new PutBucketLifecycleConfigurationCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      LifecycleConfiguration,
    })
  );
}

function putObject({ Key, filePath }) {
  return client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key,
      Body: fs.createReadStream(filePath),
    })
  );
}

module.exports = {
  copyObject,
  deleteObject,
  deleteObjects,
  getObject,
  getSignedDownloadUrl,
  getSignedUploadUrl,
  objectExists,
  putBucketCors,
  putBucketLifecycleConfiguration,
  putObject,
};
