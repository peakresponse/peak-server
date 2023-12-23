const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const xmljs = require('xml-js');

const nemsisPublic = require('../lib/nemsis/public');
const helpers = require('./helpers');

const router = express.Router();

router.get(
  '/public/:nemsisVersion/:xsd',
  helpers.async(async (req, res) => {
    const repo = nemsisPublic.getNemsisPublicRepo(req.params.nemsisVersion);
    const xsdJSONPath = repo.xsdJSONPath(req.params.xsd);
    try {
      await fs.access(xsdJSONPath);
      res.sendFile(xsdJSONPath);
    } catch {
      const data = await fs.readFile(repo.xsdPath(req.params.xsd));
      const xml = data.toString();
      const json = xmljs.xml2js(xml, { compact: true });
      await fs.writeFile(xsdJSONPath, JSON.stringify(json), 'utf8');
      res.json(json);
    }
  }),
);

router.get(
  '/*',
  helpers.async(async (req, res) => {
    const data = await fs.readFile(path.resolve(__dirname, path.join('../nemsis', req.path.replace('.json', '.xsd'))));
    const xml = data.toString();
    const json = xmljs.xml2js(xml, { compact: true });
    await fs.writeFile(path.resolve(__dirname, path.join('../nemsis', req.path)), JSON.stringify(json), 'utf8');
    res.json(json);
  }),
);

module.exports = router;
