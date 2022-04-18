const _ = require('lodash');
const AWS = require('aws-sdk');
const fs = require('fs-extra');
const inflection = require('inflection');
const jsonpatch = require('fast-json-patch');
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
  // MARK: - record versioning helpers
  static async createOrUpdate(model, user, agency, data, createAttrs, updateAttrs, options) {
    if (!options?.transaction) {
      return model.sequelize.transaction((transaction) =>
        Base.createOrUpdate(model, user, agency, data, createAttrs, updateAttrs, { ...options, transaction })
      );
    }
    // find or create the new historical record
    if (!data.id || (!data.canonicalId && !data.parentId)) {
      throw new Error();
    }
    let record = await model.findByPk(data.id, { transaction: options.transaction });
    if (record) {
      // assume this is a repeated request, handle as immutable and idempotent
      return [record, false];
    }
    let filteredData;
    let updatedAttributes;
    let updatedDataAttributes;
    let canonical;
    let parent;
    let created;
    if (data.parentId) {
      // this is updating the parent to create a new version and update canonical record
      parent = await model.findByPk(data.parentId, { transaction: options.transaction, rejectOnEmpty: true });
      // sanitize the data by picking only the attributes allowed to be updated
      filteredData = _.pick(data, ['id', 'canonicalId', 'parentId'].concat(updateAttrs));
      // get a list of the updated attributes
      updatedAttributes = _.keys(filteredData);
      // check for data patch
      if (data.data_patch && updateAttrs.includes('data')) {
        updatedAttributes.push('data');
        filteredData.data = jsonpatch.applyPatch(parent.data || {}, data.data_patch).newDocument;
      }
      // merge the new attributes into the parent attributes
      filteredData = _.assign({ ...parent.get() }, filteredData);
      // update or create a new canonical record
      if (filteredData.canonicalId && filteredData.canonicalId !== parent.canonicalId) {
        created = true;
        // create the new canonical record (use case: Report transfer)
        canonical = model.build({ ...filteredData, id: filteredData.canonicalId, canonicalId: null });
      } else {
        created = false;
        // update the canonical record
        canonical = await model.findByPk(filteredData.canonicalId, { transaction: options.transaction, rejectOnEmpty: true });
        // TODO - handle merging parallel and out-of-order updates
        canonical.set(_.pick(filteredData, updateAttrs));
      }
    } else {
      created = true;
      // this is creating an entirely new record
      filteredData = _.pick(data, ['id', 'canonicalId'].concat(createAttrs).concat(updateAttrs));
      updatedAttributes = _.keys(filteredData);
      // set createdBy with this user/agency
      filteredData.createdById = user.id;
      filteredData.createdByAgencyId = agency?.id;
      // create the canonical record
      canonical = model.build({ ...filteredData, id: data.canonicalId, canonicalId: null });
    }
    // create/update the canonical record
    canonical.updatedById = user.id;
    canonical.updatedByAgencyId = agency?.id;
    await canonical.save({ transaction: options.transaction });
    // create the historical record
    record = model.build(filteredData);
    record.updatedAttributes = updatedAttributes;
    if (updatedAttributes.includes('data')) {
      const diff = data.data_patch ? data.data_patch : jsonpatch.compare(parent?.data || {}, data.data);
      updatedDataAttributes = diff
        .map((d) => {
          if (d.path.endsWith('/_text') || d.path.endsWith('/_attributes')) {
            return d.path.substring(0, d.path.lastIndexOf('/'));
          }
          return d.path;
        })
        .filter((p, i, array) => array.indexOf(p) === i);
    }
    record.updatedDataAttributes = updatedDataAttributes;
    record.updatedById = user.id;
    record.updatedByAgencyId = agency?.id;
    await record.save({ transaction: options.transaction });
    await canonical.update({ currentId: record.id }, { transaction: options.transaction });
    return [record, created];
  }

  // MARK: - file attachment helpers

  assetUrl(attribute) {
    const pathPrefix = `${inflection.transform(this.constructor.name, ['tableize', 'dasherize'])}/${
      this?.currentId ?? this.id
    }/${inflection.transform(attribute, ['underscore', 'dasherize'])}`;
    const file = this.get(attribute);
    if (file) {
      return path.resolve('/api/assets/', pathPrefix, file);
    }
    return null;
  }

  async handleAssetFile(attribute, options) {
    if (!this.changed(attribute)) {
      return;
    }
    const pathPrefix = `${inflection.transform(this.constructor.name, ['tableize', 'dasherize'])}/${
      this.id
    }/${inflection.transform(attribute, ['underscore', 'dasherize'])}`;
    const assetPrefix = process.env.ASSET_PATH_PREFIX || '';
    const prevFile = this.previous(attribute);
    const newFile = this.get(attribute);
    const handle = async () => {
      if (process.env.AWS_S3_BUCKET) {
        if (prevFile) {
          await s3
            .deleteObject({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: path.join(assetPrefix, pathPrefix, prevFile),
            })
            .promise();
        }
        if (newFile) {
          await s3
            .copyObject({
              ACL: 'private',
              Bucket: process.env.AWS_S3_BUCKET,
              CopySource: path.join(process.env.AWS_S3_BUCKET, 'uploads', newFile),
              Key: path.join(assetPrefix, pathPrefix, newFile),
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
          fs.removeSync(path.resolve(__dirname, '../public/assets', assetPrefix, pathPrefix, prevFile));
        }
        if (newFile) {
          const uploadPath = path.resolve(__dirname, '../tmp/uploads', newFile);
          if (fs.pathExistsSync(uploadPath)) {
            fs.ensureDirSync(path.resolve(__dirname, '../public/assets'));
            fs.moveSync(uploadPath, path.resolve(__dirname, '../public/assets', assetPrefix, pathPrefix, newFile), {
              overwrite: true,
            });
          }
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
    if (newValue) {
      _.set(this.data, keyPath, { _text: newValue });
    } else {
      _.unset(this.data, keyPath);
    }
    this.changed('data', true);
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

  syncNemsisId(options) {
    if (!this.id) {
      this.setDataValue('id', this.getNemsisAttributeValue([], 'UUID'));
      options.fields = options.fields || [];
      if (!this.id) {
        this.id = uuid();
        this.setNemsisAttributeValue([], 'UUID', this.id);
        if (options.fields.indexOf('data') < 0) {
          options.fields.push('data');
        }
      }
      if (options.fields.indexOf('id') < 0) {
        options.fields.push('id');
      }
    } else if (!this.getNemsisAttributeValue([], 'UUID')) {
      this.setNemsisAttributeValue([], 'UUID', this.id);
      options.fields = options.fields || [];
      if (options.fields.indexOf('data') < 0) {
        options.fields.push('data');
      }
    }
  }

  syncFieldAndNemsisValue(key, keyPath, options) {
    if (this.changed(key)) {
      this.setNemsisValue(keyPath, this.getDataValue(key));
      options.fields = options.fields || [];
      if (options.fields.indexOf('data') < 0) {
        options.fields.push('data');
      }
    } else {
      this.setDataValue(key, this.getFirstNemsisValue(keyPath) ?? null);
      if (this.changed(key)) {
        options.fields = options.fields || [];
        if (options.fields.indexOf(key) < 0) {
          options.fields.push(key);
        }
      }
    }
  }
}

module.exports = { Base };
