const AWS = require('aws-sdk');
const fs = require('fs-extra');
const HttpStatus = require('http-status-codes');
const inflection = require('inflection');
const _ = require('lodash');
const path = require('path');
const querystring = require('querystring');

module.exports.async = (handler) => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch((error) => {
      if (error.name === 'SequelizeValidationError') {
        /// if we've got a schema validation error, extract the individual errors
        let originalError = error;
        if (error.errors.length === 1 && error.errors[0].path === 'schema') {
          originalError = error.errors[0].original;
        }
        res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          messages: originalError.errors.map((e) => _.pick(e, ['path', 'message', 'value'])),
        });
      } else {
        next(error);
      }
    });
  };
};

module.exports.setPaginationHeaders = (req, res, pageParam, pages, total) => {
  const baseURL = `${process.env.BASE_URL}${req.baseUrl}${req.path}?`;
  const query = _.clone(req.query);
  const page = parseInt(pageParam, 10);
  let link = '';
  if (page < pages) {
    query.page = page + 1;
    link += `<${baseURL}${querystring.stringify(query)}>; rel="next"`;
  }
  if (page < pages - 1) {
    if (link.length > 0) {
      link += ',';
    }
    query.page = pages;
    link += `<${baseURL}${querystring.stringify(query)}>; rel="last"`;
  }
  if (page > 2) {
    if (link.length > 0) {
      link += ',';
    }
    query.page = 1;
    link += `<${baseURL}${querystring.stringify(query)}>; rel="first"`;
  }
  if (page > 1) {
    if (link.length > 0) {
      link += ',';
    }
    query.page = page - 1;
    link += `<${baseURL}${querystring.stringify(query)}>; rel="prev"`;
  }
  const headers = {
    'X-Total-Count': total,
    Link: link,
  };
  res.set(headers);
};

module.exports.register = (req, res, next) => {
  res.locals.inflection = inflection;

  const hasError = (name) => {
    return _.find(res.locals.errors, (e) => e.path === name) !== undefined;
  };
  res.locals.hasError = hasError;

  const errorMessages = (name) => {
    return _.uniq(
      _.compact(
        _.map(
          _.filter(res.locals.errors, (e) => e.path === name),
          (e) => e.message
        )
      )
    );
  };
  res.locals.errorMessages = errorMessages;

  res.locals.renderErrorMessages = (name, classes) => {
    const messages = errorMessages(name);
    if (messages.length > 0) {
      const cls = classes || [];
      cls.unshift('invalid-feedback');
      return `<div class="${cls.join(' ')}">${inflection.capitalize(messages.join(', '))}.</div>`;
    }
    return '';
  };

  res.locals.assetUrl = (urlPath) => {
    return `${process.env.ASSET_HOST}${urlPath}`;
  };
  next();
};

/* eslint-disable no-param-reassign */
module.exports.handleUpload = (record, paramName, newValue, destDir) => {
  return new Promise((resolve, reject) => {
    if (record[paramName] === newValue) {
      resolve(record);
      return;
    }
    if (process.env.AWS_S3_BUCKET) {
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_S3_BUCKET_REGION,
      });
      if (newValue) {
        /// move out of tmp
        const params = {
          CopySource: path.join('/', process.env.AWS_S3_BUCKET, 'uploads', newValue),
          Bucket: process.env.AWS_S3_BUCKET,
          Key: path.join(destDir, newValue),
          ACL: 'public-read',
        };
        s3.copyObject(params, (err) => {
          if (err) {
            reject(err);
          } else if (record[paramName]) {
            /// delete existing file, if any
            s3.deleteObject(
              {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: record[paramName],
              },
              () => {
                /// done! update pictureUrl with hostname
                record[paramName] = path.join(destDir, newValue);
                resolve(record);
              }
            );
          } else {
            /// done! update pictureUrl with hostname
            record[paramName] = path.join(destDir, newValue);
            resolve(record);
          }
        });
      } else if (record[paramName]) {
        s3.deleteObject(
          {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: record[paramName],
          },
          () => {
            /// done! update pictureUrl with hostname
            record[paramName] = null;
            resolve(record);
          }
        );
      } else {
        record[paramName] = null;
        resolve(record);
      }
    } else if (newValue) {
      const tmpPath = path.resolve(__dirname, '../tmp/uploads', newValue);
      const destPath = path.resolve(__dirname, '../public/uploads', destDir, newValue);
      fs.move(tmpPath, destPath, { overwrite: true }, (err) => {
        if (err) {
          reject(err);
        } else {
          const prevValue = record[paramName];
          if (prevValue) {
            fs.removeSync(path.resolve('../public', prevValue));
          }
          record[paramName] = path.join('/uploads', destDir, newValue);
          resolve(record);
        }
      });
    } else {
      const prevValue = record[paramName];
      if (prevValue) {
        fs.removeSync(path.resolve('../public', prevValue));
      }
      record[paramName] = null;
      resolve(record);
    }
  });
};
