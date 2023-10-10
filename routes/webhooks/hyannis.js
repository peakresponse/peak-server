const express = require('express');
const HttpStatus = require('http-status-codes');
// const { DateTime } = require('luxon');
// const { v4: uuidv4 } = require('uuid');

const models = require('../../models');
const { dispatchIncidentUpdate } = require('../../wss');

const router = express.Router();

const FILE_REGEX = /\\([^\\]+)$/;

router.post('/cad', async (req, res) => {
  const { message } = req.body ?? {};
  if (!message) {
    res.status(HttpStatus.UNPROCESSABLE_ENTITY).end();
    return;
  }
  if (!req.user) {
    res.status(HttpStatus.UNAUTHORIZED).end();
    return;
  }
  const psap = await models.Psap.findByPk('3151', { rejectOnEmpty: true });
  const dispatcher = await models.Dispatcher.findOne({
    where: {
      psapId: psap.id,
      userId: req.user.id,
    },
  });
  if (!dispatcher) {
    res.status(HttpStatus.FORBIDDEN).end();
    return;
  }
  const newIncidentIds = [];
  const lines = message.split('\n');
  for (const line of lines) {
    const m = line.match(FILE_REGEX);
    if (m) {
      const [, file] = m;
      console.log(file);
    }
  }
  res.status(HttpStatus.OK).end();
  await Promise.all(newIncidentIds.map((id) => dispatchIncidentUpdate(id)));
});

module.exports = router;
