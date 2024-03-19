const fs = require('fs/promises');
const { StatusCodes } = require('http-status-codes');
const _ = require('lodash');
const tmp = require('tmp-promise');

const models = require('../../models');
const nemsisTranslation = require('../nemsis/translation');

const { serializeError } = require('../utils');

class EsoClient {
  constructor(authUrl, apiUrl) {
    this.authUrl = authUrl;
    this.apiUrl = apiUrl;
  }

  async authenticate() {
    // re-use non-expired credentials
    if (this.credentials?.expires_at) {
      const expiresAt = new Date(this.credentials.expires_at);
      if (expiresAt.getTime() > Date.now()) {
        return this.credentials;
      }
    }
    // perform Basic auth against identity server
    const token = Buffer.from(`${this.username}:${this.password}`, 'ascii').toString('base64');
    const response = await fetch(this.authUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: 'grant_type=client_credentials&scope=api:reference+api:patientcarerecord',
    });
    const payload = await response.json();
    if (response.status !== StatusCodes.OK) {
      throw new Error(`${response.status}: ${payload?.error}`);
    }
    // generate an absolute timestamp for expiration
    payload.expires_at = new Date(Date.now() + (payload.expires_in - 300) * 1000).toISOString();
    this.credentials = payload;
    return payload;
  }

  static filterPayloadElement(payload, element) {
    return payload.replace(new RegExp(`<${element}[^/>]*(/>|>[^<]*</${element}>)`), '');
  }

  static filterPayload(payload) {
    let newPayload = payload;
    // remove unsupported eDisposition fields
    for (let i = 9; i <= 11; i += 1) {
      newPayload = EsoClient.filterPayloadElement(newPayload, `eDisposition.${`${i}`.padStart(2, '0')}`);
    }
    // remove unsupported ePatient fields
    newPayload = EsoClient.filterPayloadElement(newPayload, 'ePatient.01');
    for (let i = 5; i <= 12; i += 1) {
      newPayload = EsoClient.filterPayloadElement(newPayload, `ePatient.${`${i}`.padStart(2, '0')}`);
    }
    newPayload = EsoClient.filterPayloadElement(newPayload, 'ePatient.14');
    for (let i = 18; i <= 21; i += 1) {
      newPayload = EsoClient.filterPayloadElement(newPayload, `ePatient.${`${i}`.padStart(2, '0')}`);
    }
    // remove unsupported eProcedure fields
    for (let i = 7; i <= 13; i += 1) {
      newPayload = EsoClient.filterPayloadElement(newPayload, `eProcedures.${`${i}`.padStart(2, '0')}`);
    }
    // remove unsupported eResponse fields
    for (let i = 4; i <= 13; i += 1) {
      newPayload = EsoClient.filterPayloadElement(newPayload, `eResponse.${`${i}`.padStart(2, '0')}`);
    }
    for (let i = 15; i <= 24; i += 1) {
      newPayload = EsoClient.filterPayloadElement(newPayload, `eResponse.${`${i}`.padStart(2, '0')}`);
    }
    // fix invalid timestamps (temp for now)
    newPayload = newPayload.replace(/(\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d)\.\d+Z/g, '$1-00:00');
    return newPayload;
  }

  async submitEmsDataSet(payload) {
    const Authorization = `Bearer ${this.credentials.access_token}`;
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization,
        'Content-Type': 'application/xml; charset=UTF-8',
      },
      body: EsoClient.filterPayload(payload),
    });
    const text = await response.text();
    if (response.status !== StatusCodes.CREATED) {
      throw new Error(text);
    }
    return text;
  }
}

async function execute(exportId, exportTriggerId, reportId) {
  const log = models.ExportLog.build({
    exportId,
    exportTriggerId,
    reportId,
  });
  try {
    const trigger = await models.ExportTrigger.findByPk(exportTriggerId, {
      include: ['export'],
    });
    log.params = {
      export: _.pick(trigger.export, ['type', 'authUrl', 'apiUrl', 'username']),
      exportTrigger: _.pick(trigger, ['type', 'debounceTime', 'username']),
    };
    let report = await models.Report.findByPk(reportId, {
      include: ['version', { model: models.Agency, as: 'createdByAgency', include: ['version'] }],
    });
    if (report.isCanonical) {
      report = await report.getCurrent({ include: ['version', { model: models.Agency, as: 'createdByAgency', include: ['version'] }] });
      log.reportId = report.id;
    }
    await report.regenerate();
    // download report, convert to 3.4.0 as needed
    const filePath = await report.downloadAssetFile('emsDataSetFile');
    const version = report.version ?? report.createdByAgency.version;
    let payload;
    if (version.baseNemsisVersion === '3.5.0') {
      const { path: destPath, cleanup } = await tmp.file();
      await nemsisTranslation.translateEmsDataSet(version.nemsisVersion, filePath, '3.4.0', destPath);
      payload = await fs.readFile(destPath, 'utf8');
      cleanup();
    } else {
      throw new Error(`Unsupported report NEMSIS version: ${version.baseNemsisVersion}`);
    }
    // set up ESO Client and submit
    const client = new EsoClient(trigger.export.authUrl, trigger.export.apiUrl);
    client.credentials = trigger.credentials;
    client.username = trigger.username || trigger.export.username;
    client.password = trigger.password || trigger.export.password;
    await trigger.update({ credentials: await client.authenticate() });
    log.result = await client.submitEmsDataSet(payload);
    log.isError = false;
  } catch (err) {
    log.result = serializeError(err);
    log.isError = true;
  }
  await log.save();
}

module.exports = {
  execute,
  EsoClient,
};
