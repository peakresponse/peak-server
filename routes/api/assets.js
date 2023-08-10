const AWS = require('aws-sdk');
const express = require('express');
const fs = require('fs');
const HttpStatus = require('http-status-codes');
const mime = require('mime-types');
const { mkdirp } = require('mkdirp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

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

router.post(
  '/',
  interceptors.requireLogin,
  helpers.async(async (req, res) => {
    const id = uuidv4();
    const response = req.body.blob;
    response.id = id;
    response.key = id;
    response.metadata = {};
    response.created_at = new Date();
    if (!response.signed_id) {
      response.signed_id = `${id}.${mime.extension(response.content_type)}`;
    }
    if (process.env.AWS_S3_BUCKET) {
      /// store in S3, in tmp uploads dir
      const url = await s3.getSignedUrlPromise('putObject', {
        ACL: 'private',
        Bucket: process.env.AWS_S3_BUCKET,
        ContentType: response.content_type,
        Key: `uploads/${response.signed_id}`,
        ServerSideEncryption: 'AES256',
      });
      response.direct_upload = {
        url,
        headers: {
          'x-amz-acl': 'private',
          'x-amz-server-side-encryption': 'AES256',
          'Content-Type': response.content_type,
        },
      };
    } else {
      response.direct_upload = {
        url: `/api/assets/${response.signed_id}`,
        headers: {
          'Content-Type': response.content_type,
        },
      };
    }
    res.json(response);
  })
);

router.put(
  '/:path([^?]+)',
  interceptors.requireLogin,
  helpers.async(async (req, res) => {
    const tmpDir = path.resolve(__dirname, '../../tmp/uploads');
    const tmpFile = path.resolve(tmpDir, `${req.params.path}`);
    try {
      await mkdirp(path.dirname(tmpFile));
      await fs.promises.writeFile(tmpFile, req.body);
      res.status(HttpStatus.OK).end();
    } catch (err) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
    }
  })
);

router.get(
  '/:path([^?]+)',
  interceptors.requireLogin,
  helpers.async(async (req, res) => {
    const assetPrefix = process.env.ASSET_PATH_PREFIX || '';
    const keyPath = path.join(assetPrefix, req.params.path);
    if (process.env.AWS_S3_BUCKET) {
      const url = await s3.getSignedUrlPromise('getObject', {
        Bucket: process.env.AWS_S3_BUCKET,
        Expires: 60,
        Key: keyPath,
      });
      res.redirect(url);
    } else {
      res.redirect(path.join('/assets', keyPath));
    }
  })
);

module.exports = router;
