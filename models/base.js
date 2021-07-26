const _ = require('lodash');
const AWS = require('aws-sdk');
const fs = require('fs-extra');
const path = require('path');
const { Model } = require('sequelize');
const uuid = require('uuid/v4');

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

class Base extends Model {
  constructor(value, options) {
    super(value, options);
    if (!this.getNemsisAttributeValue([], 'UUID')) {
      this.setNemsisAttributeValue([], 'UUID', uuid());
    }
  }

  // MARK: - file attachment helpers

  static assetUrl(pathPrefix, file) {
    if (file) {
      return path.resolve('/api/assets/', pathPrefix, file);
    }
    return null;
  }

  static async handleAssetFile(pathPrefix, prevFile, newFile, options) {
    const handle = async () => {
      if (process.env.AWS_S3_BUCKET) {
        if (prevFile) {
          await s3
            .deleteObject({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: path.join(pathPrefix, prevFile),
            })
            .promise();
        }
        if (newFile) {
          await s3
            .copyObject({
              ACL: 'private',
              Bucket: process.env.AWS_S3_BUCKET,
              CopySource: path.join(process.env.AWS_S3_BUCKET, 'uploads', newFile),
              Key: path.join(pathPrefix, newFile),
              ServerSideEncryption: 'AES256',
            })
            .promise();
          await s3
            .deleteObject({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: path.join('uploads', newFile),
            })
            .promise();
        }
      } else {
        if (prevFile) {
          fs.removeSync(path.resolve(__dirname, '../public/assets', pathPrefix, prevFile));
        }
        if (newFile) {
          fs.moveSync(
            path.resolve(__dirname, '../tmp/uploads', newFile),
            path.resolve(__dirname, '../public/assets', pathPrefix, newFile),
            { overwrite: true }
          );
        }
      }
    };
    if (options.transaction) {
      options.transaction.afterCommit(() => handle());
    } else {
      await handle();
    }
  }

  // MARK: - NEMSIS data helpers

  static firstValueOf(element) {
    return Array.isArray(element) ? element[0]?._text : element?._text;
  }

  static geometryFor(latlng) {
    let value = null;
    if (latlng) {
      const [lat, lng] = latlng.split(',');
      if (lat && lng) {
        value = {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        };
      }
    }
    return value;
  }

  getFirstNemsisValue(keyPath) {
    const element = _.get(this.data, keyPath);
    return Array.isArray(element) ? element[0]?._text : element?._text;
  }

  addNemsisValue(keyPath, newValue) {
    this.data = this.data || {};
    let value = _.get(this.data, keyPath);
    if (Array.isArray(value)) {
      if (_.find(value, { _text: newValue })) return;
      value.push({ _text: newValue });
    } else if (value) {
      if (value._text === newValue) return;
      value = [value];
      value.push({ _text: newValue });
      _.set(this.data, keyPath, value);
    } else {
      _.set(this.data, keyPath, { _text: newValue });
    }
    this.changed('data', true);
  }

  setNemsisValue(keyPath, newValue) {
    this.data = this.data || {};
    _.set(this.data, keyPath, { _text: newValue });
    this.changed('data', true);
  }

  setFieldAndNemsisValue(key, keyPath, newValue) {
    this.setDataValue(key, newValue);
    this.setNemsisValue(keyPath, newValue);
  }

  getNemsisAttributeValue(keyPath, attribute) {
    const attrPath = [...keyPath, '_attributes', attribute];
    return _.get(this.data, attrPath);
  }

  setNemsisAttributeValue(keyPath, attribute, newValue) {
    this.data = this.data || {};
    const attrPath = [...keyPath, '_attributes', attribute];
    _.set(this.data, attrPath, newValue);
    this.changed('data', true);
  }
}

module.exports = { Base };
