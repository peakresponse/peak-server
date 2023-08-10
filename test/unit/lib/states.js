const assert = require('assert');

const States = require('../../../lib/states');

describe('lib', () => {
  describe('states', () => {
    it('has a list of State objects', () => {
      assert.deepStrictEqual(States.all.length, 57);
      assert.deepStrictEqual(States.all[0], {
        code: '01',
        abbr: 'AL',
        name: 'Alabama',
        gnsid: '01779775',
      });
    });

    it('has a mapping of State code to value object', () => {
      assert.deepStrictEqual(States.codeMapping['01'], {
        code: '01',
        abbr: 'AL',
        name: 'Alabama',
        gnsid: '01779775',
      });
    });

    it('has a mapping of State abbreviation to value object', () => {
      assert.deepStrictEqual(States.abbrMapping.AL, {
        code: '01',
        abbr: 'AL',
        name: 'Alabama',
        gnsid: '01779775',
      });
    });

    it('has a mapping of State name to value object', () => {
      assert.deepStrictEqual(States.nameMapping.Alabama, {
        code: '01',
        abbr: 'AL',
        name: 'Alabama',
        gnsid: '01779775',
      });
    });
  });
});
