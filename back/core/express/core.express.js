/**
 * @fileOverview Base Ctor for express instances, provides helpers, wrappers.
 */
var cip = require('cip');
var config = require('config');
var Promise = require('bluebird');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// var log = require('logg').getLogger('app.base.express');

var globals = require('./globals');

/**
 * Base Ctor for express instances, provides helpers, wrappers.
 *
 * @constructor
 */
var ExpressApp = module.exports = cip.extend(function() {
  /** @type {?express} The express instance */
  this.app = null;

  /** @type {?app.core.SessionStore} Instance of Session Store */
  this.sessionStore = null;
});


/**
 * Basic setup of express instance.
 *
 * @return {Promise} a promise.
 */
ExpressApp.prototype.baseSetup = Promise.method(function() {
  // Discover proper port, Heroku exports it in an env
  var port;
  if (globals.isHeroku) {
    port = process.env.PORT;
  } else {
    port = config.webserver.port;
  }

  // Setup express
  this.app.set('port', port);
  // remove x-powered-by header
  this.app.set('x-powered-by', false);

  this.app.use(cookieParser());
  this.app.use(bodyParser.json());
});
