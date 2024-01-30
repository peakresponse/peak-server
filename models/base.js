const _ = require('lodash');
const fs = require('fs-extra');
const inflection = require('inflection');
const jsonpatch = require('fast-json-patch');
const { mkdirp } = require('mkdirp');
const path = require('path');
const { Model, Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const s3 = require('../lib/aws/s3');
const nemsisXsd = require('../lib/nemsis/xsd');

class Base extends Model {
  // MARK: - helpers for non-versioned (live/draft only) NEMSIS backed models
  static addDraftScopes() {
    this.addScope('draft', {
      where: {
        isDraft: true,
      },
    });

    this.addScope('final', {
      where: {
        isDraft: false,
      },
    });

    this.addScope('finalOrNew', {
      where: {
        [Op.or]: {
          isDraft: false,
          [Op.and]: {
            isDraft: true,
            draftParentId: null,
          },
        },
      },
    });
  }

  async toNemsisJSON(options) {
    const payload = _.pick(this, ['id', 'isDraft', 'data', 'isValid', 'validationErrors', 'createdAt', 'updatedAt', 'archivedAt']);
    if (!this.isDraft) {
      const draft = this.draft || (await this.getDraft(options));
      if (draft) {
        payload.draft = await draft.toNemsisJSON(options);
      }
    }
    return payload;
  }

  async updateDraft(values, options) {
    if (this.isDraft) {
      return this.update(values, options);
    }
    if (!options?.transaction) {
      return this.constructor.sequelize.transaction((transaction) => this.updateDraft(values, { ...options, transaction }));
    }
    let draft = this.draft || (await this.getDraft(options));
    if (!draft) {
      const mergedValues = _.assign(
        { ...this.get() },
        {
          isDraft: true,
          draftParentId: this.id,
        },
      );
      delete mergedValues.id;
      delete mergedValues.draft;
      draft = await this.constructor.create(mergedValues, options);
    }
    return draft.update(values, options);
  }

  async commitDraft(options) {
    if (!options?.transaction) {
      return this.constructor.sequelize.transaction((transaction) => this.commitDraft({ ...options, transaction }));
    }
    let draft;
    let draftParent;
    if (this.isDraft) {
      draft = this;
      if (this.draftParentId) {
        draftParent = this.draftParent || (await this.getDraftParent(options));
      }
    } else {
      draft = this.draft || (await this.getDraft(options));
      draftParent = this;
    }
    if (draft && draftParent) {
      // apply draft values to parent
      const newValues = { ...draft.get() };
      delete newValues.id;
      delete newValues.isDraft;
      delete newValues.draftParent;
      delete newValues.draftParentId;
      await draftParent.update(newValues, options);
      // delete the draft
      return draft.destroy(options);
    }
    if (draft) {
      // simply flip isDraft to false
      return draft.update({ isDraft: false }, options);
    }
    return Promise.resolve();
  }

  // MARK: - record versioning helpers
  static async createOrUpdate(model, user, agency, data, createAttrs, updateAttrs, options) {
    if (!options?.transaction) {
      return model.sequelize.transaction((transaction) =>
        Base.createOrUpdate(model, user, agency, data, createAttrs, updateAttrs, { ...options, transaction }),
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
      filteredData = _.pick(data, ['id', 'canonicalId', 'parentId', 'updatedAt'].concat(updateAttrs));
      // get a list of the updated attributes
      updatedAttributes = _.keys(filteredData);
      // check for data patch
      if (data.data_patch && updateAttrs.includes('data')) {
        updatedAttributes.push('data');
        filteredData.data = jsonpatch.applyPatch(parent.data || {}, data.data_patch).newDocument;
      }
      // merge the new attributes into the parent attributes
      filteredData = _.assign({ ...parent.get(), secondParentId: null }, filteredData);
      // update or create a new canonical record
      if (filteredData.canonicalId && filteredData.canonicalId !== parent.canonicalId) {
        created = true;
        // create the new canonical record (use case: Report transfer)
        filteredData.createdAt = filteredData.updatedAt;
        filteredData.createdById = user.id;
        filteredData.createdByAgencyId = agency?.id;
        canonical = model.build({ ...filteredData, id: filteredData.canonicalId, canonicalId: null });
      } else {
        created = false;
        canonical = await model.findByPk(filteredData.canonicalId, {
          transaction: options.transaction,
          lock: options.transaction?.LOCK?.UPDATE,
          rejectOnEmpty: true,
        });
      }
    } else {
      created = true;
      // this is creating an entirely new record
      filteredData = _.pick(data, ['id', 'canonicalId', 'createdAt'].concat(createAttrs).concat(updateAttrs));
      updatedAttributes = _.keys(filteredData);
      // set createdBy with this user/agency
      filteredData.createdById = user.id;
      filteredData.createdByAgencyId = agency?.id;
      // create the canonical record
      canonical = model.build({ ...filteredData, id: data.canonicalId, canonicalId: null });
    }
    // create the canonical record
    canonical.updatedAt = data.updatedAt ?? new Date();
    canonical.updatedById = user.id;
    canonical.updatedByAgencyId = agency?.id;
    if (created) {
      await canonical.save({ silent: true, transaction: options.transaction });
    }
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
    record.updatedAt = data.updatedAt ?? new Date();
    record.updatedById = user.id;
    record.updatedByAgencyId = agency?.id;
    await record.save({ silent: true, transaction: options.transaction });
    // update the canonical record, handling merging parallel/out-of-order updates
    if (!created && canonical.currentId !== data.parentId) {
      // create a diff of the new record from its parent
      const versions = [record];
      let current = await canonical.getCurrent({ transaction: options.transaction });
      const currentJson = jsonpatch.deepClone(current.toJSON());
      versions.push(current);
      // TODO, handle finding lowest common ancestor in more complex merges
      while (current && current.id !== data.parentId) {
        // eslint-disable-next-line no-await-in-loop
        current = await current.getParent({ transaction: options.transaction });
        if (current) {
          versions.push(current);
        }
      }
      versions.sort((a, b) => a.updatedAt - b.updatedAt);
      let prev = versions.shift();
      let json = jsonpatch.deepClone(prev.toJSON());
      while (versions.length > 0) {
        // apply diffs
        current = versions.shift();
        if (current === record) {
          const patch = jsonpatch.compare(JSON.parse(JSON.stringify(parent.toJSON())), JSON.parse(JSON.stringify(record.toJSON())));
          json = jsonpatch.applyPatch(json, patch).newDocument;
        } else {
          const patch = jsonpatch.compare(JSON.parse(JSON.stringify(prev.toJSON())), JSON.parse(JSON.stringify(current.toJSON())));
          json = jsonpatch.applyPatch(json, patch).newDocument;
          prev = current;
        }
      }
      json.id = uuidv4();
      json.parentId = canonical.currentId;
      json.secondParentId = record.id;
      json.canonicalId = canonical.id;
      json.currentId = null;
      json.updatedAt = new Date();
      json.updatedById = user.id;
      json.updatedByAgencyId = agency?.id;
      record = model.build(json);
      const patch = jsonpatch.compare(JSON.parse(JSON.stringify(currentJson)), json);
      record.updatedAttributes = _.uniq(
        patch.map((p) => {
          let attr = p.path.substring(1);
          const index = attr.indexOf('/');
          if (index > 0) {
            attr = attr.substring(0, index);
          }
          return attr;
        }),
      );
      await record.save({ silent: true, transaction: options.transaction });
      filteredData = json;
    }
    if (!created) {
      canonical.set(_.pick(filteredData, updateAttrs));
    }
    canonical.currentId = record.id;
    await canonical.save({ silent: true, transaction: options.transaction });
    for (const attr of updateAttrs.filter((a) => a.endsWith('Ids'))) {
      const ids = data[attr];
      if (ids) {
        const prefix = attr.substring(0, attr.length - 3);
        // eslint-disable-next-line no-await-in-loop
        await record[`set${inflection.capitalize(prefix)}s`](ids, { transaction: options.transaction });
        // eslint-disable-next-line no-await-in-loop
        await canonical[`set${inflection.capitalize(prefix)}s`](ids, { transaction: options.transaction });
      }
    }
    return [record, created];
  }

  // MARK: - file attachment helpers

  assetUrl(attribute) {
    const pathPrefix = `${inflection.transform(this.constructor.name, ['tableize', 'dasherize'])}/${
      this.currentId ?? this.id
    }/${inflection.transform(attribute, ['underscore', 'dasherize'])}`;
    const file = this.get(attribute);
    if (file) {
      return path.resolve('/api/assets/', pathPrefix, file);
    }
    return null;
  }

  getAssetFilePrefix(attribute) {
    const assetPrefix = process.env.ASSET_PATH_PREFIX || '';
    const modelPrefix = inflection.transform(this.constructor.name, ['tableize', 'dasherize']);
    const attrPrefix = inflection.transform(attribute, ['underscore', 'dasherize']);
    return path.join(assetPrefix, modelPrefix, this.id, attrPrefix);
  }

  async downloadAssetFile(attribute, isNewInTransaction) {
    const file = this.get(attribute);
    const filePrefix = this.getAssetFilePrefix(attribute);
    const tmpDir = path.resolve(__dirname, '../tmp/downloads');
    const tmpFilePath = path.resolve(tmpDir, filePrefix, file);
    await mkdirp(path.dirname(tmpFilePath));
    if (process.env.AWS_S3_BUCKET) {
      let Key;
      if (isNewInTransaction) {
        Key = path.join('uploads', file);
      } else {
        Key = path.join(filePrefix, file);
      }
      const data = await s3.getObject({
        Key,
      });
      await fs.promises.writeFile(tmpFilePath, data.Body);
    } else {
      let filePath;
      if (isNewInTransaction) {
        filePath = path.resolve(__dirname, '../tmp/uploads', file);
      } else {
        filePath = path.resolve(__dirname, '../public/assets', filePrefix, file);
      }
      await fs.promises.copyFile(filePath, tmpFilePath);
    }
    return tmpFilePath;
  }

  static async uploadAssetFile(filePath) {
    const destFileName = `${uuidv4()}${path.extname(filePath)}`;
    if (process.env.AWS_S3_BUCKET) {
      await s3.putObject({ Key: path.join('uploads', destFileName), filePath });
    } else {
      await fs.promises.copyFile(filePath, path.resolve(__dirname, '../tmp/uploads', destFileName));
    }
    return destFileName;
  }

  async handleAssetFile(attribute, options) {
    if (!this.changed(attribute)) {
      return;
    }
    const filePrefix = this.getAssetFilePrefix(attribute);
    const prevFile = this.previous(attribute);
    const newFile = this.get(attribute);
    const handle = async () => {
      if (process.env.AWS_S3_BUCKET) {
        if (prevFile) {
          await s3.deleteObject({
            Key: path.join(filePrefix, prevFile),
          });
        }
        if (newFile) {
          await s3.copyObject({
            CopySource: path.join(process.env.AWS_S3_BUCKET, 'uploads', newFile),
            Key: path.join(filePrefix, newFile),
          });
          await s3.deleteObject({
            Key: path.join('uploads', newFile),
          });
        }
      } else {
        if (prevFile) {
          fs.removeSync(path.resolve(__dirname, '../public/assets', filePrefix, prevFile));
        }
        if (newFile) {
          const uploadPath = path.resolve(__dirname, '../tmp/uploads', newFile);
          if (fs.pathExistsSync(uploadPath)) {
            fs.ensureDirSync(path.resolve(__dirname, '../public/assets'));
            fs.moveSync(uploadPath, path.resolve(__dirname, '../public/assets', filePrefix, newFile), {
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

  setNemsisValue(keyPath, newValue, required = false) {
    this.data = this.data || {};
    if (newValue) {
      _.set(this.data, keyPath, { _text: newValue });
    } else if (required) {
      _.set(this.data, keyPath, { _attributes: { 'xsi:nil': 'true', NV: '7701003' } });
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

  syncNemsisId(options, keyPath = []) {
    if (!this.id) {
      if (!this.isDraft || !this.draftParentId) {
        this.setDataValue('id', this.getNemsisAttributeValue(keyPath, 'UUID'));
      }
      options.fields = options.fields || [];
      if (!this.id) {
        this.id = uuidv4();
        if (!this.getNemsisAttributeValue(keyPath, 'UUID') || (this.isDraft && !this.draftParentId)) {
          this.setNemsisAttributeValue(keyPath, 'UUID', this.id);
          if (options.fields.indexOf('data') < 0) {
            options.fields.push('data');
          }
        }
      }
      if (options.fields.indexOf('id') < 0) {
        options.fields.push('id');
      }
    } else if (!this.getNemsisAttributeValue(keyPath, 'UUID')) {
      this.setNemsisAttributeValue(keyPath, 'UUID', this.id);
      options.fields = options.fields || [];
      if (options.fields.indexOf('data') < 0) {
        options.fields.push('data');
      }
    }
  }

  syncFieldAndNemsisAttributeValue(key, keyPath, attribute, options) {
    if (this.changed(key)) {
      this.setNemsisAttributeValue(keyPath, attribute, this.getDataValue(key));
      options.fields = options.fields || [];
      if (options.fields.indexOf('data') < 0) {
        options.fields.push('data');
      }
    } else {
      this.setDataValue(key, this.getNemsisAttributeValue(keyPath, attribute) ?? null);
      if (this.changed(key)) {
        options.fields = options.fields || [];
        if (options.fields.indexOf(key) < 0) {
          options.fields.push(key);
        }
      }
    }
  }

  syncFieldAndNemsisValue(key, keyPath, options, required = false) {
    if (this.changed(key)) {
      this.setNemsisValue(keyPath, this.getDataValue(key), required);
      options.fields = options.fields || [];
      if (options.fields.indexOf('data') < 0) {
        options.fields.push('data');
      }
    } else {
      const value = this.getFirstNemsisValue(keyPath) ?? null;
      this.setDataValue(key, value);
      if (this.changed(key)) {
        options.fields = options.fields || [];
        if (options.fields.indexOf(key) < 0) {
          options.fields.push(key);
        }
      }
      if (!value && required) {
        if (!_.get(this.data, keyPath)) {
          _.set(this.data, keyPath, {
            _attributes: {
              NV: '7701003',
              'xsi:nil': 'true',
            },
          });
          this.changed('data', true);
          options.fields = options.fields || [];
          if (options.fields.indexOf('data') < 0) {
            options.fields.push('data');
          }
        }
      }
    }
  }

  static get xsdPath() {
    return null;
  }

  static get rootTag() {
    return null;
  }

  static get groupTag() {
    return null;
  }

  async getData(version) {
    const { xsdPath, rootTag, groupTag } = this.constructor;
    const doc = nemsisXsd.generate(version.nemsisVersion, xsdPath, rootTag, groupTag, this.data);
    // remove the xml namespace attributes
    delete doc[rootTag]._attributes.xmlns;
    delete doc[rootTag]._attributes['xmlns:xsi'];
    // return the updated data
    let data = groupTag ? doc[rootTag][groupTag] : doc[rootTag];
    if (Array.isArray(data)) {
      [data] = data;
    }
    return data;
  }

  async xsdValidate(options) {
    const { transaction } = options ?? {};
    const { xsdPath, rootTag, groupTag } = this.constructor;
    const version = this.version ?? (await this.getVersion({ transaction }));
    if (version?.nemsisVersion) {
      const xmlValidationErrorReport = await nemsisXsd.validateElement(version.nemsisVersion, xsdPath, rootTag, groupTag, this.data);
      this.validationErrors = xmlValidationErrorReport?.$json ?? null;
      this.isValid = this.validationErrors === null;
      options.fields = options.fields || [];
      if (this.changed('validationErrors')) {
        if (options.fields.indexOf('validationErrors') < 0) {
          options.fields.push('validationErrors');
        }
      }
      if (this.changed('isValid')) {
        if (options.fields.indexOf('isValid') < 0) {
          options.fields.push('isValid');
        }
      }
    }
  }
}

module.exports = { Base };
