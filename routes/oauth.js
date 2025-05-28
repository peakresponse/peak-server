const express = require('express');
const fs = require('fs');
const path = require('path');
const { StatusCodes } = require('http-status-codes');

const models = require('../models');
const oauth = require('../lib/oauth');
const rollbar = require('../lib/rollbar');

const interceptors = require('./interceptors');

const router = express.Router();

let designWebpackStats;
function getDesignWebpackStats() {
  if (!designWebpackStats || process.env.NODE_ENV !== 'production') {
    designWebpackStats = JSON.parse(fs.readFileSync(path.join(__dirname, '../angular/projects/design/webpack-stats.json')));
  }
  return designWebpackStats;
}

router.post('/token', async (req, res) => {
  try {
    const request = new oauth.Request(req);
    const response = new oauth.Response(res);
    await oauth.server.token(request, response);
    res.json(response.body);
  } catch (error) {
    rollbar.error(error, req);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
});

router.get('/authorize', interceptors.requireLogin, async (req, res) => {
  const locals = { ...req.query };
  locals.client = await models.Client.findOne({
    where: {
      clientId: req.query.client_id,
    },
  });
  const cancelUri = new URL(locals.client.redirectUri);
  locals.cancelUri = `${cancelUri.protocol}//${cancelUri.host}`;
  locals.designWebpackStats = getDesignWebpackStats();
  res.render('oauth/authorize', locals);
});

router.post('/authorize', interceptors.requireLogin, async (req, res) => {
  try {
    const request = new oauth.Request(req);
    const response = new oauth.Response(res);
    await oauth.server.authorize(request, response);
    res.setHeader('Location', response.headers.location);
    res.status(response.status).end();
  } catch (error) {
    rollbar.error(error, req);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
});

module.exports = router;
