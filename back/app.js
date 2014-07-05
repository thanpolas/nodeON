/*
 * APP
 * Your amazing app
 * http://www.app.app
 *
 * Copyright (c) 2014 Thanasis Polychronakis
 * Licensed under the MIT OSS
 */

/**
 * Module dependencies.
 */
var util = require('util');
var fs = require('fs');

var Promise = require('bluebird');
var sequence = require('when/sequence');
var log = require('logg').getLogger('app.bootstrap');
var config = require('config');

var initdb = require('../tasks/initdb.task');
var expressApp = require('./core/expressApp.core');
var database = require('./core/database.core').getInstance();
var logger = require('./util/logger');
require('./util/validator');
require('./core/feature-toggle.core');
var globals = require('./core/globals');
var Email = require('./modules/email');

var app = module.exports = {};

/** @type {null|Express} The express instance */
app.express = null;

// define stand alone status
globals.isStandAlone = require.main === module;

var initialized = false;

/**
 * Master bootstrap module.
 *
 * Available options to pass on the first arg:
 * {
 *   // don't launch a webserver
 *   noweb: false,
 *
 *   // don't boot email facilities
 *   noEmail: false,
 *
 *   // don't log to console
 *   // Env: APP_NOLOG
 *   nolog: true,
 *
 *   // don't run initdb
 *   // ENV: NOINITDB
 *   noInitDb: false,
 *
 *   // Stub email facilities
 *   // Env: APP_STUBMAIL
 *   stubMail: false,
 *
 *   // Do not use security (CSRF, XSS) middleware.
 *   // Env: APP_NOSECURITY
 *   noSecurity: false,
 *
 *   // The role to assume, trumps environment variable.
 *   role: globals.Roles.WEB,
 * }
 *
 * @param {Object=} optOpts init params.
 * @return {Promise} A dissaster.
 */
app.init = function(optOpts) {
  if (initialized) { return Promise.resolve(); }
  initialized = true;

  var opts = optOpts || {};

  // Initialize logging facilities
  logger.init();

  if (opts.nolog || process.env.NODE_NOLOG) {
    logger.removeConsole();
  }

  if (opts.stubMail || process.env.NODE_STUBMAIL) {
    config.mandrill.apikey = config.mandrill.apikeyStub;
  }

  if (process.env.NODE_NOSECURITY) {
    opts.noSecurity = true;
  }

  // check role override
  if (opts.role) {
    globals.role = opts.role;
  }

  log.info('Initializing... standAlone:', globals.isStandAlone,
    ':: System NODE_ENV:', process.env.NODE_ENV, ':: App Environment:', globals.env,
    ':: Server ID:', globals.serverId, ':: On Heroku:', globals.isHeroku,
    ':: CSRF:', !opts.noSecurity);

  // Global exception handler
  process.on('uncaughtException', app.onNodeFail);

  return database.init()
    .then(app._initServices.bind(null, opts))
      .catch(function(err){
        log.error('Error on boot:', err);
        process.exit(-1);
      });
};

/**
 * Triggers after all databases are connected.
 *
 * @param {Object} opts Options as defined in app.init().
 * @return {Promise} a promise.
 * @private
 */
app._initServices = function(opts) {
  log.info('_initServices() :: Databases connected, booting Application...');
  var email = Email.getInstance();

  var boot = [];
  if (process.env.NOINITDB) {
    opts.noInitDb = true;
  }
  if (!opts.noInitDb) {
    boot.push(initdb.start.bind(initdb));
  }
  if (!opts.noweb) {
    boot.push(expressApp.init.bind(null, opts));
  }
  if (!opts.noEmail) {
    boot.push(email.init);
  }

  return sequence(boot, opts).then(function() {
    log.info('Init finish.');
    app.express = expressApp.app;

    // if run as root, downgrade to the owner of this file
    if (process.getuid() === 0) {
      fs.stat(__filename, function(err, stats) {
        if (err) { return console.error(err); }
        process.setuid(stats.uid);
      });
    }
  });
};

/**
 * Catch-all for all unhandled exceptions
 *
 * @param {Error} err An error object.
 */
app.onNodeFail = function(err) {
  log.error('onNodeFail() :: Unhandled Exception. Error:', util.inspect(err), err);
  process.exit(1);
};

// ignition
if (globals.isStandAlone) {
  // reset runtime config settings
  config.resetRuntime(app.init);
}
