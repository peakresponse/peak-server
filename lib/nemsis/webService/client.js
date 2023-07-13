const soap = require('soap');

class NemsisClient {
  constructor(url) {
    this.url = url;
    this.username = '';
    this.password = '';
    this.organization = '';
  }

  async init() {
    this.client = await soap.createClientAsync(this.url);
    this.client.setEndpoint(new URL(this.url).origin);
  }

  static async create(url) {
    const client = new NemsisClient(url);
    await client.init();
    return client;
  }

  async submitData(payload, requestDataSchema, schemaVersion, additionalInfo) {
    const args = {
      username: this.username,
      password: this.password,
      organization: this.organization,
      requestType: 'SubmitData',
      submitPayload: {
        payloadOfXmlElement: { $xml: payload },
      },
      requestDataSchema,
      schemaVersion,
      additionalInfo,
    };
    const [result /* , rawResponse, soapHeader, rawRequest */] = await this.client.SubmitDataAsync(args, { forever: false });
    return result;
  }

  submitDemDataSet(submitPayload, schemaVersion, additionalInfo) {
    return this.submitData(submitPayload, 62, schemaVersion, additionalInfo);
  }

  submitEmsDataSet(submitPayload, schemaVersion, additionalInfo) {
    return this.submitData(submitPayload, 61, schemaVersion, additionalInfo);
  }

  submitStateDataSet(submitPayload, schemaVersion, additionalInfo) {
    return this.submitData(submitPayload, 65, schemaVersion, additionalInfo);
  }
}

module.exports = { NemsisClient };
