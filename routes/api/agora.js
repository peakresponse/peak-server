const express = require('express');
const { RtcRole, RtcTokenBuilder, RtmTokenBuilder } = require('agora-token');

const models = require('../../models');
const helpers = require('../helpers');
const interceptors = require('../interceptors');

const { Roles } = models.Employment;

const router = express.Router();

router.get(
  '/rtm-token',
  interceptors.requireAgency(Roles.USER),
  helpers.async(async (req, res) => {
    const { channelName } = req.query;
    const token = RtmTokenBuilder.buildToken(
      process.env.AGORA_APP_ID,
      process.env.AGORA_APP_CERTIFICATE,
      channelName,
      12 /* hr */ * 60 /* min/hr */ * 60 /* sec/min */,
    );
    res.json({ token });
  }),
);

router.get(
  '/rtc-token',
  interceptors.requireAgency(Roles.USER),
  helpers.async(async (req, res) => {
    const { channelName } = req.query;
    const token = RtcTokenBuilder.buildTokenWithUid(
      process.env.AGORA_APP_ID,
      process.env.AGORA_APP_CERTIFICATE,
      channelName,
      0,
      RtcRole.PUBLISHER,
      12 /* hr */ * 60 /* min/hr */ * 60 /* sec/min */,
    );
    res.json({ token });
  }),
);

module.exports = router;
