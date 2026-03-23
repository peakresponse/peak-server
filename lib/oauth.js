const _ = require('lodash');
const OAuth2Server = require('@node-oauth/oauth2-server');

const models = require('../models');
const cache = require('./cache');

function getAccessToken(accessToken) {
  return models.Token.findOne({
    where: {
      accessToken,
    },
    include: ['client', 'user'],
  });
}

async function getAuthorizationCode(authorizationCode) {
  const data = cache.get(`oauth_prc_${authorizationCode}`);
  if (data) {
    const client = await models.Client.findByPk(data.clientId);
    const user = await models.User.findByPk(data.userId);
    if (client && user) {
      data.expiresAt = new Date(data.expiresAt);
      data.code = authorizationCode;
      data.client = client;
      data.user = user;
      return data;
    }
  }
  return null;
}

async function getClient(clientId, clientSecret) {
  const client = await models.Client.findOne({
    where: {
      clientId,
    },
  });
  if (client && (!clientSecret || client.authenticate(clientSecret))) {
    return client;
  }
  return null;
}

function getRefreshToken(refreshToken) {
  return models.Token.findOne({
    where: {
      refreshToken,
    },
    include: ['client', 'user'],
  });
}

function getUserFromClient(client) {
  return models.User.findByPk(client.userId);
}

function revokeAuthorizationCode(code) {
  const key = `oauth_prc_${code.authorizationCode}`;
  const data = cache.get(key);
  if (data) {
    return cache.del(key) === 1;
  }
  return false;
}

async function revokeToken(token) {
  try {
    const record = await models.Token.findByPk(token.id);
    await record.destroy();
    return true;
  } catch {
    return false;
  }
}

function saveAuthorizationCode(code, client, user) {
  const data = JSON.parse(JSON.stringify(code));
  data.clientId = client.id;
  data.userId = user.id;
  const now = new Date();
  cache.set(`oauth_prc_${code.authorizationCode}`, data, Math.round((code.expiresAt.getTime() - now.getTime()) / 1000));
  const obj = { ...code };
  obj.client = client;
  obj.user = user;
  return obj;
}

async function saveToken(token, client, user) {
  const data = _.pick(token, ['accessToken', 'accessTokenExpiresAt', 'refreshToken', 'refreshTokenExpiresAt']);
  data.clientId = client.id;
  data.userId = user.id;
  const obj = await models.Token.create(data);
  obj.client = client;
  obj.user = user;
  return obj;
}

const model = {
  getAccessToken,
  getAuthorizationCode,
  getClient,
  getRefreshToken,
  getUserFromClient,
  revokeAuthorizationCode,
  revokeToken,
  saveAuthorizationCode,
  saveToken,
};

const server = new OAuth2Server({
  model,
  allowEmptyState: true,
  authenticateHandler: {
    handle(req) {
      return req.user;
    },
  },
});

module.exports = {
  model,
  server,
  Request: OAuth2Server.Request,
  Response: OAuth2Server.Response,
};
