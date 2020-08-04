'use strict';

const Email = require('email-templates');
const nodemailer = require('nodemailer');
const path = require('path');

let transport = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.NODE_ENV == 'production',
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
};
if (process.env.NODE_ENV == 'test') {
  transport = require('nodemailer-mock').createTransport(transport);
}

const email = new Email({
  message: {
    from: `${process.env.APP_NAME} <${process.env.SMTP_FROM_EMAIL_ADDRESS}>`
  },
  send: true,
  transport,
  views: {
    options: {
      extension: 'ejs'
    }
  },
  juice: true,
  juiceResources: {
    preserveImportant: true,
    webResources: {
      relativeTo: __dirname
    }
  }
});

module.exports = email;
