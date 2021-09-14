const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../../models');
const helpers = require('../helpers');
const interceptors = require('../interceptors');
const { dispatchPatientUpdate } = require('../../wss');

const router = express.Router();

router.get(
  '/',
  interceptors.requireLogin(),
  helpers.async(async (req, res) => {
    const options = {
      order: [
        ['priority', 'ASC'],
        ['updated_at', 'ASC'],
      ],
      include: [
        { model: models.Agency, as: 'transportAgency' },
        { model: models.Facility, as: 'transportFacility' },
      ],
    };
    const { sceneId } = req.query;
    if (sceneId) {
      options.where = { sceneId };
    } else if (!req.user.isAdmin) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).end();
      return;
    }
    const records = await models.Patient.scope('canonical').findAll(options);
    /// reduce payload size by only including a dependency on its first reference
    const agencies = [];
    const facilities = [];
    res.json(
      records.map((r) => {
        const data = r.toJSON();
        if (r.transportAgencyId) {
          if (!agencies.includes(r.transportAgencyId)) {
            agencies.push(r.transportAgencyId);
          } else {
            delete data.transportAgency;
          }
        }
        if (r.transportFacilityId) {
          if (!facilities.includes(r.transportFacilityId)) {
            facilities.push(r.transportFacilityId);
          } else {
            delete data.transportFacility;
          }
        }
        return data;
      })
    );
  })
);

router.post(
  '/',
  interceptors.requireAgency(),
  helpers.async(async (req, res) => {
    let patient;
    let created;
    await models.sequelize.transaction(async (transaction) => {
      [patient, created] = await models.Patient.createOrUpdate(req.user, req.agency, req.body, { transaction });
      res.status(created ? HttpStatus.CREATED : HttpStatus.OK).json(await patient.toFullJSON({ transaction }));
    });
    await dispatchPatientUpdate(patient.canonicalId);
  })
);

router.get(
  '/:id',
  interceptors.requireLogin(),
  helpers.async(async (req, res) => {
    let patient = await models.Patient.findByPk(req.params.id);
    if (!patient) {
      patient = await models.Patient.findOne({
        where: { pin: req.params.id },
      });
    }
    if (patient) {
      res.json(await patient.toFullJSON());
    } else {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  })
);

module.exports = router;
