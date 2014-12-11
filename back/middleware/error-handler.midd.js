/**
 * @fileOverview Master Express Error Handler.
 */
var appError = require('nodeon-error');
var helpers = require('nodeon-helpers');

var log = require('logg').getLogger('app.midd.errorHandler');

var err = module.exports = {};

/**
 * The master Error Handler.
 *
 * @param {Error} err The error thrown.
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Function(Error=)} next passing control to the next middleware.
 */
/*jshint unused:false */
err.handle = function (err, req, res, next) {
  var status = 500;
  var error;

  if (typeof err === 'string') {
    var tmpErr = new appError(err);
    error = tmpErr.toApi();
  } else {
    status = err.status || status;
    if (typeof err.toApi === 'function') {
      error = err.toApi();
    } else {
      error = err;
    }
  }

  res.status(status);
  log.warn('handle() :: Handling error, status:', status, 'Message:',
    error.message);
  log.finest('handle() :: Raw error object:', err);

  // figure out what the client accepts
  if (helpers.isRequestJson(req)) {
    res.json(error);
  } else {
    res.render('error/500', {error: error});
  }
};
