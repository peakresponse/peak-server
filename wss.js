const i18n = require('i18n');
const url = require('url');
const WebSocket = require('ws');
const models = require('./models');

const incidentsServer = new WebSocket.Server({ noServer: true });
incidentsServer.on('connection', async (ws, req) => {
  // eslint-disable-next-line no-param-reassign
  ws.info = { userId: req.user.id, agencyId: req.agency.id, assignmentId: req.assignment.id, vehicleId: req.assignment.vehicleId };
});

async function dispatchIncidentUpdate(incidentId) {
  const incident = await models.Incident.findByPk(incidentId, {
    include: [
      { model: models.Scene, as: 'scene', include: ['city', 'state'] },
      {
        model: models.Dispatch,
        as: 'dispatches',
        include: 'vehicle',
      },
    ],
  });
  if (!incident) {
    return;
  }
  const json = {
    City: incident.scene.city?.toJSON(),
    Dispatch: incident.dispatches.map((d) => d.toJSON()),
    Incident: incident.toJSON(),
    Scene: incident.scene.toJSON(),
    State: incident.scene.state?.toJSON(),
    Vehicle: incident.dispatches.map((d) => d.vehicle.toJSON()),
  };
  const data = JSON.stringify(json);
  for (const ws of incidentsServer.clients) {
    if (incident.dispatches.find((d) => d.vehicleId === ws.info.vehicleId)) {
      ws.send(data);
    } else if (incident.dispatches.find((d) => d.vehicle.createdByAgencyId === ws.info.agencyId)) {
      ws.send(data);
    }
  }
}

const sceneServer = new WebSocket.Server({ noServer: true });

sceneServer.on('connection', async (ws, req) => {
  // eslint-disable-next-line no-param-reassign
  ws.info = { userId: req.user.id, sceneId: req.scene.id };
  let payload;
  await models.sequelize.transaction(async (transaction) => {
    const scene = await models.Scene.findByPk(req.scene.id, {
      include: ['current', 'city', 'incident', 'state'],
      transaction,
    });
    const responders = await scene.getResponders({
      include: ['user', 'agency', 'vehicle'],
      transaction,
    });
    const reports = await scene.incident.getReports({
      include: ['patient', 'disposition'],
      transaction,
      order: [['id', 'ASC']],
    });
    payload = await models.Report.createPayload(reports, { transaction });
    // during MCI, rewrite all Reports to refer to latest Scene
    for (const report of payload.Report) {
      report.sceneId = scene.currentId;
    }
    payload.Agency = responders.map((r) => r.agency.toJSON());
    payload.City = scene.city?.toJSON();
    payload.Incident = scene.incident.toJSON();
    payload.Responder = responders.map((r) => r.toJSON());
    payload.Scene = scene.toJSON();
    payload.State = scene.state?.toJSON();
    payload.User = responders.map((r) => r.user.toJSON());
    payload.Vehicle = responders
      .map((r) => r.vehicle)
      .filter((v) => v)
      .map((v) => v.toJSON());
  });
  const data = JSON.stringify(payload);
  ws.send(data);
});

async function dispatchSceneUpdate(sceneId) {
  let payload = {};
  await models.sequelize.transaction(async (transaction) => {
    const scene = await models.Scene.findByPk(sceneId, { transaction });
    const responders = await scene.getResponders({
      include: ['user', 'agency', 'vehicle'],
      transaction,
    });
    payload.Agency = responders.map((r) => r.agency.toJSON());
    payload.Responder = responders.map((r) => r.toJSON());
    payload.Scene = scene.toJSON();
    payload.User = responders.map((r) => r.user.toJSON());
    payload.Vehicle = responders
      .map((r) => r.vehicle)
      .filter((v) => v)
      .map((v) => v.toJSON());
  });
  payload = JSON.stringify(payload);
  // dispatch to all clients watching this specific scene
  for (const ws of sceneServer.clients) {
    if (ws.info.sceneId === sceneId) {
      ws.send(payload);
    }
  }
  // dispatch to all clients watching dispatched incidents
  const incidents = await models.Incident.scope({ method: ['scene', sceneId] }).findAll();
  await Promise.all(incidents.map((i) => dispatchIncidentUpdate(i.id)));
}

async function dispatchReportUpdate(reportId) {
  let report;
  let incident;
  let scene;
  let payload;
  await models.sequelize.transaction(async (transaction) => {
    report = await models.Report.findByPk(reportId, {
      include: ['disposition', { model: models.Incident, as: 'incident', include: ['dispatches'] }, 'patient', 'scene'],
      transaction,
    });
    incident = report.incident;
    scene = await report.scene.getCanonical({ transaction });
    payload = await models.Report.createPayload([report], { transaction });
    // during MCI, rewrite all Reports to refer to latest Scene
    for (const rep of payload.Report) {
      rep.sceneId = scene.currentId;
    }
    payload = JSON.stringify(payload);
  });
  for (const ws of sceneServer.clients) {
    if (ws.info.sceneId === scene.id) {
      ws.send(payload);
    }
  }
  for (const ws of incidentsServer.clients) {
    if (incident.dispatches.find((d) => d.vehicleId === ws.info.vehicleId)) {
      ws.send(payload);
    }
  }
}

function configure(server, app) {
  server.on('upgrade', (req, socket, head) => {
    i18n.init(req);
    app.sessionParser(req, {}, async () => {
      const params = new URLSearchParams(url.parse(req.url).query);
      /// ensure agency specified
      const subdomains = req.headers.host.split('.');
      let agency;
      if (req.headers['X-Agency-Subdomain'] || req.headers['x-agency-subdomain']) {
        agency = (req.headers['X-Agency-Subdomain'] || req.headers['x-agency-subdomain']).trim();
      } else if (subdomains.length > parseInt(process.env.EXPRESS_SUBDOMAIN_OFFSET, 10)) {
        agency = subdomains[0].trim();
      }
      if (agency) {
        req.agency = await models.Agency.findOne({
          where: { subdomain: agency, isDraft: false },
        });
      }
      if (!req.agency) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
      /// ensure user logged in
      if (req.session?.passport?.user) {
        req.user = await models.User.findByPk(req.session.passport.user);
      }
      if (!req.user) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
      /// ensure user is actively employed by agency (or is superuser admin)
      if (!req.user.isAdmin) {
        const employment = await models.Employment.scope('finalOrNew').findOne({
          where: { userId: req.user.id, createdByAgencyId: req.agency.id },
        });
        if (!employment?.isActive) {
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }
      }
      /// connect based on pathname
      const { pathname } = url.parse(req.url);
      switch (pathname) {
        case '/incidents':
          if (params.get('assignmentId')) {
            req.assignment = await models.Assignment.findByPk(params.get('assignmentId'));
          }
          if (!req.assignment) {
            socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
            socket.destroy();
            return;
          }
          incidentsServer.handleUpgrade(req, socket, head, (ws) => {
            incidentsServer.emit('connection', ws, req);
          });
          break;
        case '/scene':
          /// ensure active scene
          if (params.get('id')) {
            req.scene = await models.Scene.findByPk(params.get('id'), {
              include: ['city', 'incident', 'state'],
            });
          }
          if (!req.scene) {
            socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
            socket.destroy();
            return;
          }
          sceneServer.handleUpgrade(req, socket, head, (ws) => {
            sceneServer.emit('connection', ws, req);
          });
          break;
        default:
          socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
          socket.destroy();
      }
    });
  });
}

module.exports = {
  configure,
  dispatchIncidentUpdate,
  dispatchReportUpdate,
  dispatchSceneUpdate,
};
