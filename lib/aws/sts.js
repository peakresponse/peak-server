const { STSClient, GetSessionTokenCommand } = require('@aws-sdk/client-sts');

async function getTemporaryCredentialsForMobileApp() {
  const client = new STSClient({
    credentials: {
      accessKeyId: process.env.AWS_MOBILEAPP_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_MOBILEAPP_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_MOBILEAPP_REGION,
  });
  const response = await client.send(
    new GetSessionTokenCommand({
      DurationSeconds: 86400,
    }),
  );
  return response.Credentials;
}

module.exports = {
  getTemporaryCredentialsForMobileApp,
};
