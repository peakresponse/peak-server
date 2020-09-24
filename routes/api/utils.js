const express = require('express');
const fetch = require('node-fetch');
const HttpStatus = require('http-status-codes');

const helpers = require('../helpers');
const interceptors = require('../interceptors');

const router = express.Router();

router.get(
  '/geocode',
  interceptors.requireLogin(),
  helpers.async(async (req, res) => {
    let data = await (
      await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${req.query.lat},${req.query.lng}&key=${process.env.GOOGLE_MAPS_SERVER_API_KEY}`
      )
    ).json();
    if (data.status === 'OK') {
      const { results } = data;
      data = {};
      for (const result of results) {
        for (const addressComponent of result.address_components) {
          const { types } = addressComponent;
          if (types.includes('postal_code')) {
            data.zip = addressComponent.long_name;
          } else if (types.includes('locality')) {
            data.city = addressComponent.long_name;
          } else if (types.includes('administrative_area_level_2')) {
            data.county = addressComponent.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            data.state = addressComponent.long_name;
          }
        }
        break;
      }
      res.json(data);
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
    }
  })
);

module.exports = router;
