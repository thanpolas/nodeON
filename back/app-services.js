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

var Email = require('./modules/email');
var initdb = require('../tasks/initdb.task');
var expressApp = require('./core/expressApp.core');
var database = require('./core/database.core').getInstance();

/**
 * Boot the services of the application.
 *
 * @param {Object=} optOptions Options for booting.
 * @constructor
 */
var AppServices = module.exports = cip.extendSingleton(function (optOptions) {
  this.options = this.setOptions(optOptions);

  /** @type {null|Express} The express instance */
  this.express = null;

  if (this.options.stubMail || process.env.NODE_STUBMAIL) {
    config.mandrill.apikey = config.mandrill.apikeyStub;
  }

});

/**
 * Set options.
 *
 * @param {Object=} optOptions User defined options.
 * @return {Object} Default options or user preferences.
 */
AppServices.prototype.setOptions = function(optOptions) {
  var userOpts = {};
  if (__.isObject(optOptions)) {
    userOpts = optOptions;
  }

  /** @type {Object} define default options */
  return __.defaults(userOpts, {
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
 * @param {Object} opts Options as defined in app.init().
 * @return {Promise} a promise.
 */
AppServices.prototype.initServices = function(opts) {
  log.info('initServices() :: Init...');
  var email = Email.getInstance();

  var boot = [
    database.init(),
  ];
  if (opts.initdb && !process.env.NOINITDB) {
    boot.push(initdb.start.bind(initdb));
  }
  if (opts.webserver) {
    boot.push(expressApp.init.bind(null, opts));
  }
  if (opts.email) {
    boot.push(email.init);
  }

  var self = this;
  return sequence(boot, opts).then(function() {
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
