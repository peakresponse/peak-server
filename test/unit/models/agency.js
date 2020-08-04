'use strict'

const assert = require('assert');
const nock = require('nock');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', function() {
  describe('Agency', function() {
    describe('generateSubdomain()', function() {
      beforeEach(async function() {
        await helpers.loadFixtures(['users', 'states', 'agencies', 'demographics/dem-agencies']);
      });

      it('should generate a unique, unused subdomain from a short name (less than 4 words)', async function() {
        const agency = await models.Agency.findByPk("6b7ceef6-0be4-4791-848d-f115e8f15182");
        const subdomain = await agency.generateSubdomain();
        assert.equal(subdomain, "humboldtbayfire");
      });

      it('should generate a unique, unused subdomain from an acronym of the name (more than 3 words)', async function() {
        const agency = await models.Agency.findByPk("5de082f2-3242-43be-bc2b-6e9396815b4f");
        const subdomain = await agency.generateSubdomain();
        assert.equal(subdomain, "bbfpd");
      });

      it('should add a numberic suffix if the generated name is taken', async function() {
        const agency = await models.Agency.findByPk("2d9824fc-5d56-43cb-b7f0-e748a1c1ef4d");
        const subdomain = await agency.generateSubdomain();
        assert.equal(subdomain, "bmacc1");
      });
    });
  });
});
