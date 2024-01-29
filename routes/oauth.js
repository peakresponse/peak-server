const express = require('express');
const { StatusCodes } = require('http-status-codes');

const models = require('../models');
const oauth = require('../lib/oauth');

const interceptors = require('./interceptors');

const router = express.Router();

router.post('/token', async (req, res) => {
  try {
    const request = new oauth.Request(req);
    const response = new oauth.Response(res);
    await oauth.server.token(request, response);
    res.json(response.body);
  } catch (error) {
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
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
});

module.exports = router;
