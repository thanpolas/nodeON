/**
 * @fileOverview The base Controller Class all controllers extend from.
 */
// var __ = require('lodash');

var log = require('logg').getLogger('app.ControllerBase');
var cip = require('cip');
var __ = require('lodash');

var globals = require('../core/globals');

/**
 * The base Controller Class all controllers extend from.
 *
 * @constructor
 */
var Controller = module.exports = cip.extend(function() {
  /**
   * An array of controlling funcs that will handle requests.
   *
   * If more than two are pushed, all except the last one must use
   * the next() call.
   *
   * @type {Array.<Function(Object, Object, Function(Error=)=)}
   */
  this.use = [];

});

/**
 * Return the client's IP
 *
 * @param  {Object} req The request object.
 * @return {string} The client's ip.
 */
Controller.prototype.getIp = function(req) {
  var ip = req.connection.remoteAddress;
  if (globals.isHeroku) {
    ip = this.getIpFromProxy(req);
  }
  return ip;
};

/**
 * Return the client's IP when it's behind a proxy
 *
 * @param  {Object} req The request object.
 * @return {string} The client's ip.
 */
Controller.prototype.getIpFromProxy = function(req) {
  return req.headers['x-forwarded-for'].split(',')[0];
};

/**
 * Determine if the client is behind a proxy
 *
 * @param  {Object} req The request object.
 * @return {string} The client's ip.
 */
Controller.prototype.hasProxy = function(req) {
  var proxyHeader = req.headers['x-forwarded-for'];
  if (!proxyHeader) {
    return false;
  }

  var parts = proxyHeader.split(', ');
  if (globals.isHeroku)  {
    if (parts.length > 1) {
      return true;
    } else {
      return false;
    }
  }

  return true;
};


/**
 * Check if an error was passed through session flash.
 *
 * @param {Object} req The request Object.
 * @param {express.Result} res Express response object.
 */
Controller.prototype.checkFlashError = function(req, res) {
  res.locals.error =  !!req.flash('error').shift();
  if (res.locals.error) {
    var errObj = req.flash('errorObj').shift();
    if (!(errObj instanceof Object)) {
      errObj = {};
    }
    res.locals.errorMsg = req.flash('errorMsg').shift();
    res.locals.errorObj = errObj;

    log.fine('checkFlashError() :: session-flash error. path:', req.url,
      'Message:', errObj.message);
  }
};

/**
 * Check if an success message was passed through session flash.
 *
 * @param {Object} req The request Object.
 * @param {express.Result} res Express response object.
 */
Controller.prototype.checkFlashSuccess = function(req, res) {
  res.locals.success =  !!req.flash('success').shift();
  if (res.locals.success) {
    var successObj = req.flash('successObj').shift();
    if (!__.isObject(successObj)) {
      successObj = {};
    }
    res.locals.successObj = successObj;

    log.fine('checkFlashSuccess() :: session-flash success. path:', req.url,
      successObj);
  }
};


/**
 * Add the error to the session flash.
 *
 * @param {Object} req The request Object.
 * @param {Error} err an instance or child of Error.
 */
Controller.prototype.addFlashError = function(req, err) {
  req.flash('error', true);
  req.flash('errorMsg', err.message);
  req.flash('errorObj', err);
};



/**
 * Add the success message / object to the session flash.
 *
 * @param {Object} req The request Object.
 * @param {Object=} obj Any Object.
 */
Controller.prototype.addFlashSuccess = function(req, obj) {
  req.flash('success', true);
  req.flash('successObj', obj);
};
