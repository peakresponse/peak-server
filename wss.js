'use strict'

const models = require('./models');
const WebSocket = require('ws');
const wss = new WebSocket.Server({noServer: true});

wss.on('connection', function(ws, request) {
  models.Patient.findAll({
    order: [['priority', 'ASC'], ['updated_at', 'ASC']]
  }).then(function(records) {
    ws.send(JSON.stringify(records.map(r => r.toJSON())));
  });
});

module.exports = wss;
