const i18n = require('i18n');
const querystring = require('querystring');
const url = require('url');
const WebSocket = require('ws');
const models = require('./models');

const agencyServer = new WebSocket.Server({ noServer: true });

agencyServer.on('connection', async (ws, req) => {
  // eslint-disable-next-line no-param-reassign
  ws.info = { userId: req.user.id, agencyId: req.agency.id };
  const scenes = await req.agency.getActiveScenes();
  const agency = req.agency.toJSON();
  agency.message = req.agency.getLocalizedInvitationMessage(req);
  const data = JSON.stringify({
    agency,
    scenes: scenes.map((s) => s.toJSON()),
  });
  ws.send(data);
});

const sceneServer = new WebSocket.Server({ noServer: true });

sceneServer.on('connection', async (ws, req) => {
  // eslint-disable-next-line no-param-reassign
  ws.info = { userId: req.user.id, sceneId: req.scene.id };
  const responders = await req.scene.getLatestResponders({
    include: [
      { model: models.User, as: 'user' },
      { model: models.Agency, as: 'agency' },
    ],
  });
  const patients = await req.scene.getPatients({
    include: [
      { model: models.Agency, as: 'transportAgency' },
      { model: models.Facility, as: 'transportFacility' },
      { model: models.PatientObservation, as: 'observations' },
    ],
  });
  const data = JSON.stringify({
    scene: req.scene.toJSON(),
    responders: await Promise.all(responders.map((r) => r.toFullJSON())),
    patients: await Promise.all(patients.map((p) => p.toFullJSON())),
  });
  ws.send(data);
});

const dispatchSceneUpdate = async (sceneId) => {
  const scene = await models.Scene.findByPk(sceneId);
  let data = JSON.stringify({
    scene: scene.toJSON(),
  });
  /// dispatch to all clients watching this specific scene
  for (const ws of sceneServer.clients) {
    if (ws.info.sceneId === sceneId) {
      ws.send(data);
    }
  }
  /// dispatch to all clients watching the agency
  const agencyIds = [scene.createdByAgencyId];
  data = JSON.stringify({
    scenes: [scene.toJSON()],
  });
  /// TODO if an MCI, append all agencies in surrounding counties
  for (const ws of agencyServer.clients) {
    if (agencyIds.includes(ws.info.agencyId)) {
      ws.send(data);
    }
  }
};

const dispatchSceneRespondersUpdate = async (responderIds) => {
  const responders = await models.Responder.findAll({
    where: {
      id: responderIds,
    },
    include: [
      { model: models.User, as: 'user' },
      { model: models.Agency, as: 'agency' },
    ],
  });
  if (responders.length === 0) {
    return;
  }
  const [{ sceneId }] = responders;
  const scene = await models.Scene.findByPk(sceneId);
  const data = JSON.stringify({
    scene: scene.toJSON(),
    responders: await Promise.all(responders.map((r) => r.toFullJSON())),
  });
  for (const ws of sceneServer.clients) {
    if (ws.info.sceneId === sceneId) {
      ws.send(data);
    }
  }
};

const dispatchPatientUpdate = async (patientId) => {
  let scene;
  let patient;
  let data;
  await models.sequelize.transaction(async (transaction) => {
    patient = await models.Patient.findByPk(patientId, { transaction });
    scene = await patient.getScene({ transaction });
    data = JSON.stringify({
      scene: scene.toJSON(),
      patients: [await patient.toFullJSON({ transaction })],
    });
  });
  for (const ws of sceneServer.clients) {
    if (ws.info.sceneId === scene.id) {
      ws.send(data);
    }
  }
};

const configure = (server, app) => {
  server.on('upgrade', (req, socket, head) => {
    i18n.init(req);
    app.sessionParser(req, {}, async () => {
      const query = querystring.parse(url.parse(req.url).query);
      /// ensure agency specified
      const subdomains = req.headers.host.split('.');
      let agency;
      if (subdomains.length > process.env.BASE_HOST.split('.').length) {
        agency = subdomains[0].trim();
      } else if (
        req.headers['X-Agency-Subdomain'] ||
        req.headers['x-agency-subdomain']
      ) {
        agency = (
          req.headers['X-Agency-Subdomain'] || req.headers['x-agency-subdomain']
        ).trim();
      }
      if (agency) {
        req.agency = await models.Agency.findOne({
          where: { subdomain: agency },
        });
      }
      if (!req.agency) {
        socket.destroy();
        return;
      }
      /// ensure user logged in
      if (req.session?.passport?.user) {
        req.user = await models.User.findByPk(req.session.passport.user);
      }
      if (!req.user) {
        socket.destroy();
        return;
      }
      /// ensure user is actively employed by agency (or is superuser admin)
      if (!req.user.isAdmin) {
        const employment = await models.Employment.findOne({
          where: { userId: req.user.id, agencyId: req.agency.id },
        });
        if (!employment?.isActive) {
          socket.destroy();
          return;
        }
      }
      /// connect based on pathname
      const { pathname } = url.parse(req.url);
      switch (pathname) {
        case '/agency':
          agencyServer.handleUpgrade(req, socket, head, (ws) => {
            agencyServer.emit('connection', ws, req);
          });
          break;
        case '/scene':
          /// ensure active scene
          if (query.id) {
            req.scene = await models.Scene.findByPk(query.id);
          }
          if (!req.scene) {
            socket.destroy();
            return;
          }
          sceneServer.handleUpgrade(req, socket, head, (ws) => {
            sceneServer.emit('connection', ws, req);
          });
          break;
        default:
          socket.destroy();
      }
    });
  });
};

module.exports = {
  configure,
  dispatchSceneUpdate,
  dispatchSceneRespondersUpdate,
  dispatchPatientUpdate,
};
