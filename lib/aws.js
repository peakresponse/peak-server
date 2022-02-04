const AWS = require('aws-sdk');

async function getTemporaryCredentialsForMobileApp() {
  const sts = new AWS.STS({
    accessKeyId: process.env.AWS_MOBILEAPP_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_MOBILEAPP_SECRET_ACCESS_KEY,
  });
  const response = await sts.getSessionToken({ DurationSeconds: 86400 }).promise();
  return response.Credentials;
}

module.exports = {
  getTemporaryCredentialsForMobileApp,
};
