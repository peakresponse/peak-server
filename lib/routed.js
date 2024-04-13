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
      if (expiresAt > DateTime.now().minus(60000)) {
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

async function dispatchSceneUpdate(sceneId, includeTreated) {
  const scene = await models.Scene.findByPk(sceneId, {
    include: [
      { model: models.Incident, as: 'incident' },
      { model: models.Scene, as: 'current' },
      { model: models.Agency, as: 'createdByAgency', include: { model: models.Region, as: 'region' } },
    ],
  });
  // check if MCI
  if (!scene?.isMCI) {
    return Promise.resolve();
  }
  // check if Scene was created by and Agency in a Region with Routed
  if (!scene?.createdByAgency?.region?.routedUrl) {
    return Promise.resolve();
  }
  // make sure we're working with the canonical scene record
  if (scene?.canonicalId) {
    return dispatchSceneUpdate(scene.canonicalId, includeTreated);
  }
  // make sure there's a valid Incident record (which is associated only with the canonical record)
  if (!scene?.incident?.number) {
    return Promise.resolve();
  }
  const {
    current,
    createdByAgency: { region },
  } = scene;
  // if so, pick and transform to Routed attribute names
  const data = {
    incidentNumber: scene.incident?.number,
    startedAt: scene.createdAt?.toISOString(),
    isExternallyUpdated: true,
  };
  if (current?.updatedAttributes?.includes('address1') || current?.updatedDataAttributes?.includes('/eScene.15')) {
    data.address1 = scene.address1;
  }
  if (current?.updatedAttributes?.includes('address2') || current?.updatedDataAttributes?.includes('/eScene.16')) {
    data.address2 = scene.address2;
  }
  if (current?.updatedAttributes?.includes('cityId') || current?.updatedDataAttributes?.includes('/eScene.17')) {
    data.city = scene.cityId;
  }
  if (current?.updatedAttributes?.includes('stateId') || current?.updatedDataAttributes?.includes('/eScene.18')) {
    data.stateId = scene.stateId;
  }
  if (current?.updatedAttributes?.includes('zip') || current?.updatedDataAttributes?.includes('/eScene.19')) {
    data.zip = scene.zip;
  }
  if (current?.updatedAttributes?.includes('closedAt')) {
    data.endedAt = scene.closedAt;
  }
  if (current?.updatedAttributes?.includes('approxPriorityPatientsCounts')) {
    data.estimatedRedCount = scene.approxPriorityPatientsCounts[models.Patient.Priority.IMMEDIATE];
    data.estimatedYellowCount = scene.approxPriorityPatientsCounts[models.Patient.Priority.DELAYED];
    data.estimatedGreenCount = scene.approxPriorityPatientsCounts[models.Patient.Priority.MINIMAL];
    data.estimatedZebraCount = scene.approxPriorityPatientsCounts[models.Patient.Priority.DECEASED];
  }
  if (includeTreated) {
    const reports = await scene.incident.getReports({
      include: ['patient'],
    });
    reports.forEach((report) => {
      switch (report.patient?.priority) {
        case models.Patient.Priority.IMMEDIATE:
          data.treatedRedCount = (data.treatedRedCount ?? 0) + 1;
          break;
        case models.Patient.Priority.DELAYED:
          data.treatedYellowCount = (data.treatedYellowCount ?? 0) + 1;
          break;
        case models.Patient.Priority.MINIMAL:
          data.treatedGreenCount = (data.treatedGreenCount ?? 0) + 1;
          break;
        case models.Patient.Priority.DECEASED:
          data.treatedZebraCount = (data.treatedZebraCount ?? 0) + 1;
          break;
        default:
          break;
      }
    });
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
  return Promise.resolve();
}

module.exports = {
  authenticate,
  submit,
  dispatchSceneUpdate,
};
