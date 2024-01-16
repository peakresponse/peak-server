const fs = require('fs/promises');
const { NemsisClient } = require('../nemsis/webService');

const models = require('../../models');

async function execute(triggerId, reportId) {
  try {
    let report = await models.Report.findByPk(reportId, {
      include: ['version'],
    });
    if (report.isCanonical) {
      report = await report.getCurrent({ include: ['version'] });
    }
    await report.regenerate();
    const filePath = await report.downloadAssetFile('emsDataSetFile');
    const payload = await fs.readFile(filePath, 'utf8');

    const trigger = await models.ExportTrigger.findByPk(triggerId, {
      include: ['export'],
    });
    const client = await NemsisClient.create(trigger.export.wsdlUrl);
    client.setEndpoint(trigger.export.apiUrl);
    client.username = trigger.username || trigger.export.username;
    client.password = trigger.password || trigger.export.password;
    client.organization = trigger.organization || trigger.export.organization;
    const response = await client.submitEmsDataSet(payload, report.version.baseNemsisVersion);
    console.log(JSON.stringify(response));
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  execute,
};
