const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../../models');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/geocode',
  interceptors.requireLogin,
  helpers.async(async (req, res) => {
    let data = await (
      await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${req.query.lat},${req.query.lng}&key=${process.env.GOOGLE_MAPS_SERVER_API_KEY}`,
      )
    ).json();
    if (data.status === 'OK') {
      const { results } = data;
      data = {};
      for (const result of results) {
        result.address_components.reverse();
        /* eslint-disable no-await-in-loop */
        for (const addressComponent of result.address_components) {
          const { types } = addressComponent;
          if (types.includes('postal_code')) {
            data.zip = addressComponent.short_name;
          } else if (types.includes('locality')) {
            data.cityId = await models.City.getCode(addressComponent.long_name, data.stateId);
            data.city = (await models.City.findByPk(data.cityId))?.toJSON();
          } else if (types.includes('administrative_area_level_2')) {
            data.countyId = await models.County.getCode(addressComponent.long_name, data.stateId);
            data.county = (await models.County.findByPk(data.countyId))?.toJSON();
          } else if (types.includes('administrative_area_level_1')) {
            data.stateId = models.State.getCodeForAbbr(addressComponent.short_name);
            data.state = (await models.State.findByPk(data.stateId))?.toJSON();
          } else if (types.includes('street_number')) {
            data.address1 = data.address1 ?? '';
            data.address1 = `${addressComponent.short_name} ${data.address1}`.trim();
          } else if (types.includes('route')) {
            data.address1 = data.address1 ?? '';
            data.address1 = `${data.address1} ${addressComponent.short_name}`.trim();
          }
        }
        /* eslint-enable no-await-in-loop */
        break;
      }
      res.json(data);
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
    }
  }),
);

module.exports = router;
