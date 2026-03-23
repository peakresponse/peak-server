const { StatusCodes } = require('http-status-codes');
const inflection = require('inflection');
const _ = require('lodash');

function async(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch((err) => {
      // console.error(err.name, err);
      if (err.name === 'SchemaValidationError' || err.name === 'SequelizeValidationError') {
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          status: StatusCodes.UNPROCESSABLE_ENTITY,
          messages: err.errors.map((e) => _.pick(e, ['path', 'message', 'value'])),
        });
      } else if (err.name === 'SequelizeUniqueConstraintError') {
        res.status(StatusCodes.CONFLICT).json({
          status: StatusCodes.CONFLICT,
          messages: err.errors.map((e) => {
            const message = _.pick(e, ['path', 'message', 'value']);
            message.id = e.instance?.id;
            message.model = e.instance?.constructor.name;
            return message;
          }),
        });
      } else {
        next(err);
      }
    });
  };
}

function setPaginationHeaders(req, res, pageParam, pages, total) {
  let baseURL = `${process.env.BASE_URL}${req.baseUrl}${req.path}?`;
  if (req.subdomains.length > 0) {
    const subdomain = req.subdomains[0].trim();
    const scheme = baseURL.substring(0, baseURL.indexOf('://') + 3);
    baseURL = `${scheme}${subdomain}.${baseURL.substring(scheme.length)}`;
  }
  const query = _.clone(req.query);
  const page = parseInt(pageParam, 10);
  let Link = '';
  if (page < pages) {
    query.page = page + 1;
    Link += `<${baseURL}${new URLSearchParams(query).toString()}>; rel="next"`;
  }
  if (page < pages - 1) {
    if (Link.length > 0) {
      Link += ',';
    }
    query.page = pages;
    Link += `<${baseURL}${new URLSearchParams(query).toString()}>; rel="last"`;
  }
  if (page > 2) {
    if (Link.length > 0) {
      Link += ',';
    }
    query.page = 1;
    Link += `<${baseURL}${new URLSearchParams(query).toString()}>; rel="first"`;
  }
  if (page > 1) {
    if (Link.length > 0) {
      Link += ',';
    }
    query.page = page - 1;
    Link += `<${baseURL}${new URLSearchParams(query).toString()}>; rel="prev"`;
  }
  const headers = {
    'X-Total-Count': total,
    Link,
  };
  res.set(headers);
}

function register(req, res, next) {
  let minApiLevel = parseInt(process.env.API_LEVEL_MIN, 10);
  minApiLevel = Number.isNaN(minApiLevel) ? 1 : minApiLevel;
  req.apiLevel = parseInt(req.header('X-API-Level'), 10);
  if (Number.isNaN(req.apiLevel)) {
    req.apiLevel = 1;
  }
  if (req.apiLevel < minApiLevel) {
    res.status(StatusCodes.BAD_REQUEST).end();
    return;
  }

  res.locals.inflection = inflection;

  const hasError = (name) => _.find(res.locals.errors, (e) => e.path === name) !== undefined;
  res.locals.hasError = hasError;

  const errorMessages = (name) =>
    _.uniq(
      _.compact(
        _.map(
          _.filter(res.locals.errors, (e) => e.path === name),
          (e) => e.message,
        ),
      ),
    );
  res.locals.errorMessages = errorMessages;

  res.locals.renderErrorMessages = (name, classes) => {
    const messages = errorMessages(name);
    if (messages.length > 0) {
      const cls = classes || [];
      cls.unshift('invalid-feedback');
      return `<div class="${cls.join(' ')}">${inflection.capitalize(messages.join(', '))}.</div>`;
    }
    return '';
  };

  next();
}

module.exports = {
  async,
  register,
  setPaginationHeaders,
};
