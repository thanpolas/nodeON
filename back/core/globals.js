/**
 * @fileOverview A hash containing global required environmental values.
 *
 */
var os = require('os');

var config = require('config');
var helpers = require('nodeon-helpers');
// var log = require('logg').getLogger('app.core.globals');

var globals = module.exports = {};

/** @type {?Object} Application Boot options */
globals.bootOpts = null;

/**
 * The supported environments
 *
 * @enum {string}
 */
globals.Environments = {
  DEVELOPMENT: 'development',
  DEV_API: 'dev_api',
  HEROKU: 'heroku',
  HEROKUDEV: 'heroku_dev',
};

/**
 * The roles this application can assume.
 *
 * @enum {string}
 */
globals.Roles = {
  API: 'api',
  WEBSITE: 'website',
};

/** @enum {string} Websocket namespaces */
globals.WebsocketNamespace = {
  ROOT: '/',
  WEBSITE: '/website',
  API: '/api',
};


/** @type {boolean} If application runs directly from shell, gets set on app */
globals.isStandAlone = true;

/** @type {string} a unique identifier string for this node process. */
globals.serverId = os.hostname() + '-' + process.pid + '-' +
  helpers.generateRandomString(6);

/**
 * Returns the current environemnt based on shell enviornment variable NODE_ENV
 * defaults to development.
 *
 * @return {app.core.globals.Environments} One of the supported environments.
 */
globals.getEnvironment = function() {
  var env = process.env.NODE_ENV || globals.Environments.DEVELOPMENT;

  for (var envIter in globals.Environments) {
    if (env === globals.Environments[envIter]) {
      return env;
    }
  }

  return globals.Environments.DEVELOPMENT;
};

/**
 * Matches the environment to a role.
 *
 * @param {app.core.globals.Environments=} optEnv optionally define an environment.
 * @return {app.core.globals.Roles} The current role.
 */
globals.getRole = function(optEnv) {
  var role = null;

  switch(optEnv || globals.getEnvironment()) {
  case globals.Environments.DEVELOPMENT:
    role = globals.Roles.WEB;
    break;
  case globals.Environments.DEV_API:
    role = globals.Roles.API;
    break;
  default:
    role = globals.Roles.WEB;
    break;
  }

  return role;
};

/**
 * The current environment canonicalized based on supported envs.
 * @type {app.core.globals.Environments}
 */
globals.env = globals.getEnvironment();

globals.role = globals.getRole(globals.env);

/** @type {boolean} If we are on development environment */
globals.isDev = [
  globals.Environments.DEVELOPMENT,
].indexOf(globals.env) >= 0;

/** @type {boolean} If the server is running in API mode */
globals.isApi = globals.role === globals.Roles.API;

/** @type {boolean} Determines if we are on heroku. */
globals.isHeroku = false;
if ([
  globals.Environments.HEROKUDEV,
  globals.Environments.HEROKU,
].indexOf(globals.env) >= 0) {
  globals.isHeroku = true;
}

/** @type {Object} Global variables available to views */
globals.viewGlobals = {
  ga: config.ga,
  env: globals.env,
};

/**
 * Get the Role from websocket namespace.
 *
 * @param {app.core.globals.WebsocketNamespace} namespace The websocket namespace.
 * @return {app.core.globals.Roles} The role.
 */
globals.getRoleFromNS = function (namespace) {
  var role;
  switch(namespace) {
  case globals.WebsocketNamespace.WEBSITE:
    role = globals.Roles.WEBSITE;
    break;
  case globals.WebsocketNamespace.API:
    role = globals.Roles.API;
    break;
  default:
    role = globals.Roles.WEBSITE;
    break;
  }

  return role;
};
