const _ = require('lodash');
const { StatusCodes } = require('http-status-codes');
const { DateTime } = require('luxon');

const models = require('../models');

const rollbar = require('./rollbar');

async function authenticate({ routedUrl, routedClientId, routedClientSecret, routedCredentials }) {
  // check if existing credentials are valid
  if (routedCredentials) {
    // eslint-disable-next-line camelcase
    const { access_token, expires_at } = routedCredentials;
    // eslint-disable-next-line camelcase
    if (access_token && expires_at) {
      const expiresAt = DateTime.fromISO(expires_at);
      if (expiresAt < DateTime.now().minus(60000)) {
        return routedCredentials;
      }
    }
  }
  // if not, authenticate
  const url = new URL('/oauth/token', routedUrl);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: routedClientId,
      client_secret: routedClientSecret,
    }),
  });
  // const payload = await response.json();
  if (response.status !== StatusCodes.OK) {
    throw new Error(`${response.status}`);
  }
  // generate an absolute timestamp for expiration
  const payload = await response.json();
  payload.expires_at = new Date(Date.now() + (payload.expires_in - 300) * 1000).toISOString();
  return payload;
}

async function submit(routedUrl, credentials, data) {
  const url = new URL('/api/mcis', routedUrl);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${credentials.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.status !== StatusCodes.CREATED && response.status !== StatusCodes.OK) {
    throw new Error(`${response.status}`);
  }
  return response.json();
}

async function dispatchSceneUpdate(sceneId) {
  const scene = await models.Scene.findByPk(sceneId, {
    include: [
      { model: models.Incident, as: 'incident' },
      { model: models.Scene, as: 'current' },
      { model: models.Agency, as: 'createdByAgency', include: { model: models.Region, as: 'region' } },
    ],
  });
  if (scene.isMCI) {
    // check if Scene was created by and Agency in a Region with Routed
    if (!scene.createdByAgency?.region?.routedUrl) {
      return;
    }
    const {
      createdByAgency: { region },
    } = scene;
    // determine if any attributes relevant to Routed have been updated
    const attributes = _.intersection(
      ['address1', 'address2', 'cityId', 'stateId', 'zip', 'createdAt', 'closedAt', 'approxPriorityPatientsCounts'],
      scene.current?.updatedAttributes ?? [],
    );
    if (attributes.length) {
      // if so, pick and transform to Routed attribute names
      const data = _.pick(scene, attributes);
      data.incidentNumber = scene.incident?.number;
      data.startedAt = scene.createdAt?.toISOString();
      if (data.incidentNumber) {
        if (data.cityId) {
          data.city = data.cityId;
          delete data.cityId;
        }
        if (data.stateId) {
          data.state = data.stateId;
          delete data.stateId;
        }
        if (data.closedAt) {
          data.endedAt = data.closedAt;
          delete data.closedAt;
        }
        if (data.approxPriorityPatientsCounts) {
          data.estimatedRedCount = data.approxPriorityPatientsCounts[models.Patient.Priority.IMMEDIATE];
          data.estimatedYellowCount = data.approxPriorityPatientsCounts[models.Patient.Priority.DELAYED];
          data.estimatedGreenCount = data.approxPriorityPatientsCounts[models.Patient.Priority.MINIMAL];
          data.estimatedZebraCount = data.approxPriorityPatientsCounts[models.Patient.Priority.DECEASED];
          delete data.approxPriorityPatientsCounts;
        }
      }
      // send to Routed
      try {
        const credentials = await authenticate(region);
        // cache credentials in region
        await region.update({ routedCredentials: credentials });
        // submit data to Routed
        await submit(region.routedUrl, credentials, data);
      } catch (err) {
        rollbar.error(err, { sceneId });
      }
    }
  }
}

module.exports = {
  authenticate,
  submit,
  dispatchSceneUpdate,
};
