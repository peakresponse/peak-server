'use strict'

const fs = require('fs');
const path = require('path');

/// state codes, downloaded from: https://www.census.gov/library/reference/code-lists/ansi/ansi-codes-for-states.html
const stateCodes = {
  values: [],
  codeMapping: {},
  nameMapping: {}
};
const psv = fs.readFileSync(path.resolve(__dirname, 'state.txt')).toString();
const lines = psv.split('\n');
/// remove header row
lines.shift();
for (let line of lines) {
  /// parse each line
  const tokens = line.split('|');
  const value = {
    code: tokens[0],
    abbr: tokens[1],
    name: tokens[2],
    gnsid: tokens[3],
  };
  stateCodes.values.push(value);
  stateCodes.codeMapping[value.code] = value;
  stateCodes.nameMapping[value.name] = value;
}
module.exports = stateCodes;
