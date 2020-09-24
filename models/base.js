const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const { Model } = require('sequelize');

class Base extends Model {
  // MARK: - file attachment helpers

  static assetUrl(pathPrefix, file) {
    if (file) {
      if (process.env.AWS_S3_BUCKET) {
        // TODO
      } else {
        return path.resolve('/uploads', pathPrefix, file);
      }
    }
    return null;
  }

  static handleAssetFile(pathPrefix, prevFile, newFile, options) {
    const handle = () => {
      if (process.env.AWS_S3_BUCKET) {
        // TODO
      } else {
        if (prevFile) {
          fs.removeSync(
            pathPrefix.resolve(
              __dirname,
              '../public/uploads',
              pathPrefix,
              prevFile
            )
          );
        }
        if (newFile) {
          fs.moveSync(
            path.resolve(__dirname, '../tmp/uploads', newFile),
            path.resolve(__dirname, '../public/uploads', pathPrefix, newFile),
            { overwrite: true }
          );
        }
      }
    };
    if (options.transaction) {
      options.transaction.afterCommit(() => handle());
    } else {
      handle();
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

  getNemsisAttributeValue(keyPath, attribute) {
    const attrPath = [...keyPath, '_attributes', attribute];
    return _.get(this.data, attrPath);
  }

  setNemsisAttributeValue(keyPath, attribute, newValue) {
    const attrPath = [...keyPath, '_attributes', attribute];
    _.set(this.data, attrPath, newValue);
    this.changed('data', true);
  }
}

module.exports = { Base };
