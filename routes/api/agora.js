const express = require('express');
const { RtcRole, RtcTokenBuilder } = require('agora-token');

const models = require('../../models');
const helpers = require('../helpers');
const interceptors = require('../interceptors');

const { Roles } = models.Employment;

const router = express.Router();

router.get(
  '/token',
  interceptors.requireAgency(Roles.USER),
  helpers.async(async (req, res) => {
    const { channelName } = req.query;
    const token = RtcTokenBuilder.buildTokenWithRtm(
      process.env.AGORA_APP_ID,
      process.env.AGORA_APP_CERTIFICATE,
      channelName,
      req.user.id,
      RtcRole.PUBLISHER,
      60 /* min */ * 60 /* sec/min */,
    );
    res.json({ token });
  }),
);

module.exports = router;
