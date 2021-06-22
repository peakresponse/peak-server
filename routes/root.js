const express = require('express');
const fetch = require('node-fetch');
const HttpStatus = require('http-status-codes');
const moment = require('moment');
const querystring = require('querystring');
const xmljs = require('xml-js');

const cache = require('../lib/cache');
const mailer = require('../emails/mailer');
const helpers = require('./helpers');
const interceptors = require('./interceptors');

const router = express.Router();

router.get('/privacy', (req, res) => {
  res.render('privacy');
});

router.get('/terms', (req, res) => {
  res.render('terms');
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('info', 'You have been logged out.');
  res.redirect('/');
});

if (process.env.MARKETING_ENABLED) {
  router.post(
    '/contact-us',
    helpers.async(async (req, res) => {
      // don't allow spammers to use our own domain
      const domain = process.env.MARKETING_EMAIL.substring(process.env.MARKETING_EMAIL.indexOf('@'));
      if (req.body.email.indexOf(domain) >= 0) {
        res.status(HttpStatus.UNPROCESSABLE_ENTITY).end();
        return;
      }
      // validate reCAPTCHA response
      let response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: querystring.stringify({
          secret: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
          response: req.body['g-recaptcha-response'],
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      response = await response.json();
      if (!response.success) {
        res.status(HttpStatus.UNPROCESSABLE_ENTITY).end();
        return;
      }
      await mailer.send({
        template: 'contact',
        message: {
          to: process.env.MARKETING_EMAIL,
          replyTo: req.body.email,
        },
        locals: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          message: req.body.message,
          feedback: req.body.feedback ? 'Yes!' : 'No',
          pilot: req.body.pilot ? 'Yes!' : 'No',
        },
      });
      res.status(HttpStatus.NO_CONTENT).end();
    })
  );

  router.get('/', async (req, res, next) => {
    if (req.subdomains.length > 0) {
      next();
    } else {
      let articles = cache.get('root-index-articles');
      if (articles === undefined) {
        articles = [];
        cache.set('root-index-articles', articles);
        try {
          const response = await fetch(process.env.MARKETING_BLOG_FEED);
          const xml = await response.text();
          const json = xmljs.xml2js(xml, { compact: true });
          for (const item of json.rss.channel.item) {
            const article = {
              title: item.title._cdata,
              pubDate: moment(item.pubDate._text).format('MMMM D, YYYY'),
              link: item.link._text,
              content: item['content:encoded']._cdata,
            };
            // extract first image from content as thumbnail
            let match = article.content.match(/<img[^>]+>/);
            if (match) {
              match = match[0].match(/src="([^"]+)"/);
              if (match) {
                [, article.image] = match;
              }
            }
            // extract first paragraph
            article.content = article.content.substring(article.content.indexOf('<p>') + 3, article.content.indexOf('</p>'));
            // remove any links in the paragraph
            article.content = article.content.replace(/<a [^>]+>([^<]+)<\/a>/, '$1');
            articles.push(article);
            if (articles.length === 3) {
              break;
            }
          }
          cache.set('root-index-articles', articles, 30 * 60);
        } catch (err) {
          // console.log(err);
        }
      }
      res.render('index', { articles });
    }
  });
}

router.get('/*', interceptors.requireLogin(), (req, res) => {
  res.render('dashboard');
});

module.exports = router;
