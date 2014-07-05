/**
 * @fileOverview CSRF, XSS and rest security features.
 */

var lusca = require('lusca');

var globals = require('../core/globals');

/** @type {?Function} Cache the middleware */
var middleware = null;

/**
 * Return a security policies middleware or noop.
 *
 * @return {Function} Middleware to use for security policy.
 */
module.exports = function () {
  if (middleware) {
    return middleware;
  }
  if (globals.bootOpts.security) {
    middleware = lusca({
      csrf: true,
      csp: false,
      xframe: 'DENY',
      p3p: false,
      hsts: false,
      xssProtection: true
    });
  } else {
    middleware = function(req, res, next) {next();};
  }

  return middleware;
};
