const assert = require('assert');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const path = require('path');
const uuid = require('uuid/v4');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('PatientObservation', () => {
    describe('validate', () => {
      it('ensures a valid transport state', async () => {
        const observation = models.PatientObservation.build();
        observation.isTransported = true;
        // isTransported true is not valid if there is no agency+facility or left independently
        await assert.rejects(async () => await observation.validate());
        observation.transportAgencyId = 1;
        await assert.rejects(async () => await observation.validate());
        observation.transportFacilityId = 1;
        // valid once agency+facility set
        await observation.validate();
        assert(true);

        // cannot be left independently with either a transport agency or facility set
        observation.isTransportedLeftIndependently = true;
        observation.transportAgencyId = 1;
        await assert.rejects(async () => await observation.validate());
        observation.transportFacilityId = 1;
        await assert.rejects(async () => await observation.validate());
        observation.transportAgencyId = null;
        await assert.rejects(async () => await observation.validate());
        observation.transportFacilityId = null;
        await observation.validate();
        assert(true);
      });
    });
  });
});
