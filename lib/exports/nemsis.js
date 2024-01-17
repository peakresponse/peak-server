const fs = require('fs/promises');
const _ = require('lodash');

const models = require('../../models');

const { NemsisClient } = require('../nemsis/webService');
const { serializeError } = require('../utils');

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
      export: _.pick(trigger.export, ['type', 'wsdlUrl', 'apiUrl', 'username', 'organization']),
      exportTrigger: _.pick(trigger.toJSON(), ['type', 'debounceTime', 'username', 'organization']),
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

    const client = await NemsisClient.create(trigger.export.wsdlUrl);
    client.setEndpoint(trigger.export.apiUrl);
    client.username = trigger.username || trigger.export.username;
    client.password = trigger.password || trigger.export.password;
    client.organization = trigger.organization || trigger.export.organization;
    log.result = await client.submitEmsDataSet(payload, (report.version ?? report.createdByAgency.version).baseNemsisVersion);
    log.result.message = log.result?.requestHandle;
    log.isError = false;
  } catch (err) {
    log.result = serializeError(err);
    log.isError = true;
  }
  await log.save();
}

module.exports = {
  execute,
};
