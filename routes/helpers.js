const HttpStatus = require('http-status-codes');
const inflection = require('inflection');
const _ = require('lodash');
const querystring = require('querystring');

module.exports.async = (handler) => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch((error) => {
      if (error.name === 'SequelizeValidationError') {
        /// if we've got a schema validation error, extract the individual errors
        let originalError = error;
        if (error.errors.length === 1 && error.errors[0].path === 'schema') {
          originalError = error.errors[0].original;
        }
        res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          messages: originalError.errors.map((e) => _.pick(e, ['path', 'message', 'value'])),
        });
      } else {
        // console.log(error);
        next(error);
      }
    });
  };
};

module.exports.setPaginationHeaders = (req, res, pageParam, pages, total) => {
  let baseURL = `${process.env.BASE_URL}${req.baseUrl}${req.path}?`;
  if (req.subdomains.length > 0) {
    const subdomain = req.subdomains[0].trim();
    const scheme = baseURL.substring(0, baseURL.indexOf('://') + 3);
    baseURL = `${scheme}${subdomain}.${baseURL.substring(scheme.length)}`;
  }
  const query = _.clone(req.query);
  const page = parseInt(pageParam, 10);
  let link = '';
  if (page < pages) {
    query.page = page + 1;
    link += `<${baseURL}${querystring.stringify(query)}>; rel="next"`;
  }
  if (page < pages - 1) {
    if (link.length > 0) {
      link += ',';
    }
    query.page = pages;
    link += `<${baseURL}${querystring.stringify(query)}>; rel="last"`;
  }
  if (page > 2) {
    if (link.length > 0) {
      link += ',';
    }
    query.page = 1;
    link += `<${baseURL}${querystring.stringify(query)}>; rel="first"`;
  }
  if (page > 1) {
    if (link.length > 0) {
      link += ',';
    }
    query.page = page - 1;
    link += `<${baseURL}${querystring.stringify(query)}>; rel="prev"`;
  }
  const headers = {
    'X-Total-Count': total,
    Link: link,
  };
  res.set(headers);
};

module.exports.register = (req, res, next) => {
  res.locals.inflection = inflection;

  const hasError = (name) => {
    return _.find(res.locals.errors, (e) => e.path === name) !== undefined;
  };
  res.locals.hasError = hasError;

  const errorMessages = (name) => {
    return _.uniq(
      _.compact(
        _.map(
          _.filter(res.locals.errors, (e) => e.path === name),
          (e) => e.message
        )
      )
    );
  };
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
};
