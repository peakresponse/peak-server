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
      throw new Error(payload?.error);
    }
    // generate an absolute timestamp for expiration
    payload.expires_at = new Date(Date.now() + (payload.expires_in - 300) * 1000).toISOString();
    this.credentials = payload;
    return payload;
  }

  async submitEmsDataSet(payload) {
    const Authorization = `Bearer ${this.credentials.access_token}`;
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization,
        'Content-Type': 'application/xml; charset=UTF-8',
      },
      body: payload,
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
    if (version.startsWith('3.5.0')) {
      const { path: destPath, cleanup } = await tmp.file();
      await nemsisTranslation.translateEmsDataSet(version, filePath, '3.4.0', destPath);
      payload = await fs.readFile(destPath, 'utf8');
      cleanup();
    } else {
      throw new Error(`Unsupported report NEMSIS version: ${version}`);
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
