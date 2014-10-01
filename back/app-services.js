/**
 * @fileOverview The services to boot.
 */
var fs = require('fs');

var cip = require('cip');
var __ = require('lodash');
var sequence = require('when/sequence');
var config = require('config');

var log = require('logg').getLogger('app.boot.services');

require('./util/validator');
require('./core/feature-toggle.core');

var Email = require('./services/email');
var initdb = require('./scripts/initdb');
var expressApp = require('./core/express/core.express').getInstance();
var database = require('./core/database.core').getInstance();

/**
 * Boot the services of the application.
 *
 * @constructor
 */
var AppServices = module.exports = cip.extendSingleton(function () {
  this.options = {};

  /** @type {null|Express} The express instance */
  this.express = null;
});

/**
 * Set options.
 *
 * @param {Object=} optOptions User defined options.
 * @return {Object} Default options or user preferences.
 */
AppServices.prototype.setup = function(optOptions) {
  var userOpts = {};
  if (__.isObject(optOptions)) {
    userOpts = optOptions;
  }

  /** @type {Object} define default options */
  this.options = __.defaults(userOpts, {
    // launch webserver
    webserver: true,

    // boot email facilities
    email: true,

    // log to console
    // Env: APP_NOLOG
    log: true,

    // Run initdb
    // ENV: NOINITDB
    initDb: true,

    // Stub email facilities
    // Env: APP_STUBMAIL
    stubMail: false,

    // Use security (CSRF, XSS) middleware.
    // Env: APP_NOSECURITY
    security: true,
  });
};

/**
 * Triggers after all databases are connected.
 *
 * @return {BPromise} a promise.
 */
AppServices.prototype.initServices = function() {
  log.info('initServices() :: Init...');

  var email = Email.getInstance();
  if (this.options.stubMail || process.env.NODE_STUBMAIL) {
    config.mandrill.apikey = config.mandrill.apikeyStub;
  }

  var boot = [
    database.init.bind(database),
  ];
  if (this.options.initdb && !process.env.NOINITDB) {
    boot.push(initdb.start.bind(initdb));
  }
  if (this.options.webserver) {
    boot.push(expressApp.init.bind(expressApp, this.options));
  }
  if (this.options.email) {
    boot.push(email.init);
  }

  var self = this;
  return sequence(boot, this.options).then(function() {
    log.info('initServices() :: Init finish.');
    self.express = expressApp.app;

    // if run as root, downgrade to the owner of this file
    if (process.getuid() === 0) {
      fs.stat(__filename, function(err, stats) {
        if (err) { return console.error(err); }
        process.setuid(stats.uid);
      });
    }
  });
};
