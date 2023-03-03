const fs = require('fs');
const path = require('path');

const States = {
  all: [],
  codeMapping: {},
  nameMapping: {},
  abbrMapping: {},
};
// state codes, downloaded from: https://www.census.gov/library/reference/code-lists/ansi/ansi-codes-for-states.html
// manually modified to include border states data from: https://thefactfile.org/u-s-states-and-their-border-states/
const psv = fs.readFileSync(path.resolve(__dirname, './states.txt')).toString();
const lines = psv.split('\n');
// remove header row
lines.shift();

for (const line of lines) {
  // parse each line
  const tokens = line.split('|');
  if (tokens.length >= 4) {
    const value = {
      code: tokens[0],
      abbr: tokens[1],
      name: tokens[2],
      gnsid: tokens[3],
    };
    States.all.push(value);
    States.codeMapping[value.code] = value;
    States.nameMapping[value.name] = value;
    States.abbrMapping[value.abbr] = value;
  }
}

Object.freeze(States);

module.exports = States;
