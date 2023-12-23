const express = require('express');
const HttpStatus = require('http-status-codes');

const router = express.Router();
const models = require('../models');
const helpers = require('./helpers');

/* GET the forgot password form */
router.get('/forgot', (req, res) => {
  res.render('passwords/forgot');
});

/* POST email to forgot password for reset */
router.post(
  '/forgot',
  helpers.async(async (req, res) => {
    const user = await models.User.findOne({
      where: { email: req.body.email },
    });
    if (user) {
      await user.sendPasswordResetEmail(req.agency);
      if (req.header('Content-Type') === 'application/json') {
        res.status(HttpStatus.OK).json({ message: res.__('passwords.forgot.success') });
      } else {
        res.render('passwords/forgot', { isSent: true });
      }
    } else {
      res.locals.errors = [{ path: 'email', message: res.__('passwords.forgot.notFound') }];
      if (req.header('Content-Type') === 'application/json') {
        res.status(HttpStatus.NOT_FOUND).json({ messages: res.locals.errors });
      } else {
        res.status(HttpStatus.NOT_FOUND).render('passwords/forgot');
      }
    }
  }),
);

/* GET the reset password form */
router.get(
  '/reset/:token',
  helpers.async(async (req, res) => {
    const user = await models.User.findOne({
      where: { passwordResetToken: req.params.token },
    });
    if (user) {
      res.render('passwords/reset', {
        token: req.params.token,
        isExpired: user.passwordResetTokenExpiresAt.getTime() < Date.now(),
      });
    } else {
      res.render('passwords/reset', {
        isInvalid: true,
      });
    }
  }),
);

/* POST the new password */
router.post(
  '/reset/:token',
  helpers.async(async (req, res) => {
    try {
      const user = await models.User.findOne({
        where: { passwordResetToken: req.params.token },
      });
      if (user) {
        /// check token expiration
        if (user.passwordResetTokenExpiresAt.getTime() < Date.now()) {
          res.status(HttpStatus.GONE).json({ messages: [{ path: 'password', message: res.__('passwords.reset.expired') }] });
          return;
        }
        /// update password
        try {
          await user.update({ password: req.body.password });
          if (req.header('Content-Type') === 'application/json') {
            res.status(HttpStatus.OK).json({ message: res.__('passwords.reset.success') });
          } else {
            res.render('passwords/reset', {
              isSaved: true,
            });
          }
        } catch (err) {
          res.locals.errors = err.errors;
          if (req.header('Content-Type') === 'application/json') {
            res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({ messages: res.locals.errors });
          } else {
            res.status(HttpStatus.UNPROCESSABLE_ENTITY).render('passwords/reset', {
              token: req.params.token,
              isExpired: user.passwordResetTokenExpiresAt.getTime() < Date.now(),
            });
          }
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      if (req.header('Content-Type') === 'application/json') {
        res.status(HttpStatus.NOT_FOUND).json({ messages: [{ path: 'password', message: res.__('passwords.reset.invalid') }] });
      } else {
        res.status(HttpStatus.NOT_FOUND).render('passwords/reset', {
          isInvalid: true,
        });
      }
    }
  }),
);

module.exports = router;
