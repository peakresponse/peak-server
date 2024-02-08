const express = require('express');
const fs = require('fs');
const { StatusCodes } = require('http-status-codes');
const mime = require('mime-types');
const { mkdirp } = require('mkdirp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const helpers = require('../helpers');
const interceptors = require('../interceptors');
const s3 = require('../../lib/aws/s3');

const router = express.Router();

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
      const url = await s3.getSignedUploadUrl({
        ContentType: response.content_type,
        Key: `uploads/${response.signed_id}`,
      });
      response.direct_upload = {
        url,
        headers: {
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
  }),
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
      res.status(StatusCodes.OK).end();
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
    }
  }),
);

router.get(
  '/:path([^?]+)',
  helpers.async(async (req, res) => {
    // if not logged in, check if path allows unauthorized access
    if (!req.user) {
      const unauthorizedPaths = (process.env.ASSET_UNAUTHORIZED_PATHS || '').split(',');
      let allowed = false;
      for (const unauthorizedPath of unauthorizedPaths) {
        if (unauthorizedPath && req.params.path.startsWith(`${unauthorizedPath}/`)) {
          allowed = true;
          break;
        }
      }
      if (!allowed) {
        res.status(StatusCodes.UNAUTHORIZED).end();
        return;
      }
    }
    const assetPrefix = process.env.ASSET_PATH_PREFIX || '';
    const keyPath = path.join(assetPrefix, req.params.path);
    if (process.env.AWS_S3_BUCKET) {
      const url = await s3.getSignedDownloadUrl({
        Key: keyPath,
      });
      res.redirect(url);
    } else {
      res.redirect(path.join('/assets', keyPath));
    }
  }),
);

module.exports = router;
