const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const xmljs = require('xml-js');

const helpers = require('./helpers');

const router = express.Router();

router.get(
  '/*',
  helpers.async(async (req, res) => {
    const data = await fs.readFile(path.resolve(__dirname, path.join('../nemsis', req.path.replace('.json', '.xsd'))));
    const xml = data.toString();
    const json = xmljs.xml2js(xml, { compact: true });
    await fs.writeFile(path.resolve(__dirname, path.join('../nemsis', req.path)), JSON.stringify(json), 'utf8');
    res.json(json);
  })
);

module.exports = router;
