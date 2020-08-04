'use strict';

const express = require('express');
const fs = require('fs');
const HttpStatus = require('http-status-codes');
const path = require('path');
const xmljs = require('xml-js');

const router = express.Router();

router.get('/*', function(req, res, next) {
  fs.readFile(path.resolve(__dirname, path.join('../nemsis', req.path.replace('.json', '.xsd'))), (err, data) => {
    if (err) {
      return res.status(HttpStatus.NOT_FOUND).end();
    }
    let xml = data.toString();
    let json = xmljs.xml2js(xml, {compact: true});
    fs.writeFile(path.resolve(__dirname, path.join('../nemsis', req.path)), JSON.stringify(json), 'utf8', err => {
      if (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
      }
      res.json(json);
    });
  });
});

module.exports = router;
