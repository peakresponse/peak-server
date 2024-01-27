const ftp = require('basic-ftp');
const express = require('express');
const fs = require('fs/promises');
const { StatusCodes } = require('http-status-codes');
const { DateTime } = require('luxon');
const path = require('path');
const tmp = require('tmp-promise');
const xmljs = require('xml-js');
const { v4: uuid } = require('uuid');

const models = require('../../models');
const { dispatchIncidentUpdate } = require('../../wss');

const router = express.Router();

const FILE_REGEX = /\\([^\\]+)$/;

async function parseXmlFile(filePath) {
  const file = await fs.readFile(filePath);
  const doc = xmljs.xml2js(file, { compact: true });
  // note these files are NEMSIS 2.2 XML files
  const record = doc?.EMSDataSet?.Header?.Record;
  const pcrNo = record?.E01?.E01_01?._text;
  const incidentNo = record?.E02?.E02_02?._text;
  const unitNo = record?.E02?.E02_12?._text;
  const address = record?.E08?.E08_11_0?.E08_11?._text;
  const city = record?.E08?.E08_11_0?.E08_12?._text;
  const county = record?.E08?.E08_13?._text;
  const state = record?.E08?.E08_11_0?.E08_14?._text;
  let zip = record?.E08?.E08_11_0?.E08_15?._text;
  if (zip?.endsWith('-')) {
    zip = zip.substring(0, zip.length - 1);
  }
  let dispatchedAt = record?.E05?.E05_04?._text;
  if (dispatchedAt) {
    // convert from Eastern local time to UTC
    dispatchedAt = DateTime.fromISO(dispatchedAt).setZone('America/New_York', { keepLocalTime: true }).setZone('UTC').toISO();
  }
  const data = {
    pcrNo,
    incidentNo,
    unitNo,
    address,
    city,
    county,
    state,
    zip,
    dispatchedAt,
  };
  return data;
}
router.parseXmlFile = parseXmlFile;

router.post('/cad', async (req, res) => {
  // check for watcher notification message
  const { message } = req.body ?? {};
  if (!message) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).end();
    return;
  }
  // check for authenticated user
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED).end();
    return;
  }
  // find corresponding dispatcher record for the user
  const psap = await models.Psap.findByPk('3151', { rejectOnEmpty: true });
  const dispatcher = await models.Dispatcher.findOne({
    where: {
      psapId: psap.id,
      userId: req.user.id,
    },
  });
  if (!dispatcher) {
    res.status(StatusCodes.FORBIDDEN).end();
    return;
  }
  // server is IP restricted, simulate in CI
  const isTesting = process.env.NODE_ENV === 'test' && process.env.CI;
  // set up a ftps client
  const client = new ftp.Client();
  // set up temp dir for downloads
  const tmpDir = await tmp.dir({ unsafeCleanup: true });
  try {
    // connect to server with files
    const options = {
      host: process.env.HYANNIS_HOST,
      port: process.env.HYANNIS_PORT,
      user: process.env.HYANNIS_USERNAME,
      password: process.env.HYANNIS_PASSWORD,
      secure: true,
      secureOptions: {
        rejectUnauthorized: false,
      },
    };
    if (!isTesting) {
      await client.access(options);
    }
    const newIncidentIds = [];
    await models.sequelize.transaction(async (transaction) => {
      const hyannis = await models.Agency.scope('claimed').findOne({
        where: {
          stateUniqueId: '3110',
          stateId: '25',
        },
        transaction,
      });
      const lines = message.split('\n');
      const vehicles = {};
      const incidents = {};
      for (const line of lines) {
        const m = line.match(FILE_REGEX);
        if (m) {
          const [, fileName] = m;
          // download file via ftps
          const filePath = path.resolve(tmpDir.path, fileName);
          if (isTesting) {
            // copy from test dir
            // eslint-disable-next-line no-await-in-loop
            await fs.copyFile(path.resolve(__dirname, '../../test/integration/webhooks/hyannis', fileName), filePath);
          } else {
            // eslint-disable-next-line no-await-in-loop
            await client.downloadTo(filePath, `/REDNMX/${fileName}`);
          }
          // parse and extract
          // eslint-disable-next-line no-await-in-loop
          const data = await parseXmlFile(filePath);
          if (!data.incidentNo || !data.unitNo) {
            // eslint-disable-next-line no-continue
            continue;
          }
          if (!vehicles[data.unitNo]) {
            // eslint-disable-next-line no-await-in-loop
            const [vehicle] = await models.Vehicle.findOrCreate({
              where: {
                createdByAgencyId: hyannis.id,
                number: data.unitNo,
              },
              defaults: {
                createdById: req.user.id,
                updatedById: req.user.id,
              },
              transaction,
            });
            vehicles[data.unitNo] = vehicle;
          }
          if (!incidents[data.incidentNo]) {
            // eslint-disable-next-line no-await-in-loop
            const [incident] = await models.Incident.findOrBuild({
              where: {
                number: data.incidentNo,
              },
              defaults: {
                psapId: psap.id,
                createdById: req.user.id,
                updatedById: req.user.id,
              },
              transaction,
            });
            if (incident.isNewRecord) {
              const newScene = {
                id: uuid(),
                canonicalId: uuid(),
                address1: data.address?.trim(),
                zip: data.zip?.trim(),
              };
              // eslint-disable-next-line no-await-in-loop
              newScene.cityId = await models.City.getCode(data.city, '25', { transaction });
              newScene.countyId = '25001';
              newScene.stateId = '25';
              // eslint-disable-next-line no-await-in-loop
              const [scene] = await models.Scene.createOrUpdate(req.user, null, newScene, { transaction });
              incident.sceneId = scene.canonicalId;
              // eslint-disable-next-line no-await-in-loop
              await incident.save({ transaction });
              newIncidentIds.push(incident.id);
            }
            incidents[data.incidentNo] = incident;
          }
          if (vehicles[data.unitNo] && incidents[data.incidentNo]) {
            // eslint-disable-next-line no-await-in-loop
            const dispatch = await models.Dispatch.scope('canonical').findOne({
              where: {
                incidentId: incidents[data.incidentNo].id,
                vehicleId: vehicles[data.unitNo].id,
              },
              transaction,
            });
            if (!dispatch) {
              // eslint-disable-next-line no-await-in-loop
              await models.Dispatch.createOrUpdate(
                req.user,
                null,
                {
                  id: uuid(),
                  canonicalId: uuid(),
                  incidentId: incidents[data.incidentNo].id,
                  vehicleId: vehicles[data.unitNo].id,
                  dispatchedAt: data.dispatchedAt,
                },
                { transaction },
              );
            }
          }
        }
      }
    });
    res.status(StatusCodes.OK).end();
    await Promise.all(newIncidentIds.map((id) => dispatchIncidentUpdate(id)));
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  } finally {
    // close ftps connection
    client.close();
    // clean up all downloaded tmp files
    tmpDir.cleanup();
  }
});

module.exports = router;
