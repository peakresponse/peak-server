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
const interceptors = require('./routes/interceptors');
const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const passwordsRouter = require('./routes/passwords');
const registrationsRouter = require('./routes/registrations');
const adminRouter = require('./routes/admin');
const apiRouter = require('./routes/api');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
if (process.env.NODE_ENV != 'test') {
  app.use(logger(process.env.EXPRESS_LOG_LEVEL));
}
app.use(fileUpload({
  useTempFiles: !process.env.AWS_S3_BUCKET
}));
app.use(bodyParser.raw({type: ['image/*', 'video/*', 'audio/*'], limit: '10mb'}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('trust proxy', 1);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/client', express.static(path.join(__dirname, 'dist')));
app.use('/libraries/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/libraries/cleave', express.static(path.join(__dirname, 'node_modules/cleave.js/dist')));
app.use('/libraries/fontawesome', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free')));
app.use('/libraries/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/libraries/qrcode', express.static(path.join(__dirname, 'node_modules/qrcode/build')));

// set up session handler with an app reference so can be used by websocket server
app.sessionParser = cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  secret: process.env.SESSION_SECRET,
  secure: process.env.NODE_ENV == 'production'
});
app.use(app.sessionParser);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

i18n.configure({
  locales: ['en'],
  directory: path.join(__dirname, 'locales')
});

app.use(helpers.assetHelpers);
app.use(i18n.init);
app.use(function(req, res, next) {
  res.locals.flash = req.flash();
  res.locals.currentUser = req.user;
  next();
});

app.use('/login', loginRouter);
app.use('/passwords', passwordsRouter);
app.use('/register', registrationsRouter);
app.use('/admin', interceptors.requireAdmin);
app.use('/admin', adminRouter);
app.use('/api', interceptors.requireLogin);
app.use('/api', apiRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.currentUser = null;
  res.locals.flash = {};
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.title = "Error!";

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
