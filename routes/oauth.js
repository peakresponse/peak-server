const express = require('express');
const HttpStatus = require('http-status-codes');

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
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
  }
});

router.get('/authorize', interceptors.requireLogin(), (req, res) => {
  // TODO: render an authorization approval page
  res.status(HttpStatus.OK).end();
});

router.post('/authorize', interceptors.requireLogin(), async (req, res) => {
  try {
    const request = new oauth.Request(req);
    const response = new oauth.Response(res);
    await oauth.server.authorize(request, response);
    res.setHeader('Location', response.headers.location);
    res.status(response.status).end();
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
  }
});

module.exports = router;
