require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const i18n = require('i18n');
const bodyParser = require('body-parser');

const helpers = require('./routes/helpers');
const routes = require('./routes');
const { NemsisServer } = require('./lib/nemsis/webService');
const rollbar = require('./lib/rollbar');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
if (process.env.NODE_ENV !== 'test') {
  app.use(logger(process.env.EXPRESS_LOG_LEVEL));
}
app.use(
  fileUpload({
    useTempFiles: !process.env.AWS_S3_BUCKET,
  }),
);
app.use(bodyParser.raw({ type: ['text/xml', 'image/*', 'video/*', 'audio/*'], limit: '10mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.set('subdomain offset', process.env.EXPRESS_SUBDOMAIN_OFFSET || 2);
app.set('trust proxy', 1);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/angular', express.static(path.join(__dirname, 'angular/dist')));
app.use('/libraries/bootstrap', express.static(path.join(__dirname, 'angular/node_modules/bootstrap/dist')));
app.use('/libraries/fontawesome', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free')));
app.use('/libraries/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/libraries/smoothscroll', express.static(path.join(__dirname, 'node_modules/smoothscroll-polyfill/dist')));

// set up session handler with an app reference so can be used by websocket server
app.sessionParser = cookieSession({
  domain: process.env.NODE_ENV === 'test' ? undefined : process.env.BASE_HOST,
  maxAge: 24 * 60 * 60 * 1000,
  secret: process.env.SESSION_SECRET,
  secure: process.env.NODE_ENV === 'production',
});
app.use(app.sessionParser);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

i18n.configure({
  locales: ['en'],
  objectNotation: true,
  directory: path.join(__dirname, 'locales'),
});

app.use(helpers.register);
app.use(i18n.init);
app.use((req, res, next) => {
  res.locals.flash = req.flash();
  res.locals.currentUser = req.user;
  next();
});

// configure NEMSIS soap endpoint
const nemsisServer = new NemsisServer('/soap/nemsis');
nemsisServer.configure(app);

// configure remaining routes
app.use(routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  if (!res.headersSent) {
    // set locals, only providing error in development
    res.locals.currentUser = null;
    res.locals.flash = {};
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.locals.title = 'Error!';

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  }
  // allow error to pass to following Rollbar handler
  next(err, req, res);
});

// log unhandled errors with Rollbar
app.use(rollbar.errorHandler());

module.exports = app;
