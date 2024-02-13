const fs = require('fs/promises');
const _ = require('lodash');

const models = require('../../models');

const { serializeError } = require('../utils');

class EsoClient {
  constructor(authUrl, apiUrl) {
    this.authUrl = authUrl;
    this.apiUrl = apiUrl;
  }

  async authenticate() {
    if (this.credentials) {
      // TODO check if credentials still valid, if so, simply return
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
    if (response.status !== 200) {
      throw new Error(payload?.error);
    }
    return payload;
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
    const filePath = await report.downloadAssetFile('emsDataSetFile');
    const payload = await fs.readFile(filePath, 'utf8');

    const client = new EsoClient(trigger.export.authUrl, trigger.export.apiUrl);
    client.credentials = trigger.credentials;
    client.username = trigger.username || trigger.export.username;
    client.password = trigger.password || trigger.export.password;
    log.result = await client.submitEmsDataSet(payload, (report.version ?? report.createdByAgency.version).baseNemsisVersion);
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
