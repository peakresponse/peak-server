const _ = require('lodash');
const {Model} = require('sequelize');

class NemsisModel extends Model {
  getFirstNemsisValue(path) {
    const element = _.get(this.data, path);
    return Array.isArray(element) ? element[0]?._text : element?._text;
  }

  addNemsisValue(path, newValue) {
    this.data = this.data || {};
    let value = _.get(this.data, path);
    if (Array.isArray(value)) {
      if (_.find(value, {_text: newValue})) return;
      value.push({_text: newValue});
    } else if (value) {
      if (value._text === newValue) return;
      value = [value];
      value.push({_text: newValue});
      _.set(this.data, path, value);
    } else {
      _.set(this.data, path, {_text: newValue});
    }
    this.changed('data', true);
  }

  setNemsisValue(path, newValue) {
    this.data = this.data || {};
    _.set(this.data, path, {_text: newValue});
    this.changed('data', true);
  }

  getNemsisAttributeValue(path, attribute) {
    path = [...path, '_attributes', attribute];
    return _.get(this.data, path);
  }

  setNemsisAttributeValue(path, attribute, newValue) {
    path = [...path, '_attributes', attribute];
    _.set(this.data, path, newValue);
    this.changed('data', true);
  }
};

module.exports = {NemsisModel};
