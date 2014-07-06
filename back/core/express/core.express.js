/**
 * @fileOverview The core express instance, requires all others.
 */
var config = require('config');
var cip = require('cip');
var Promise = require('bluebird');
var express = require('express');
var vhost = require('vhost');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');

var webserver = require('../webserver.core');
var SocketServer = require('../websocketServer.core');
var socketServer = SocketServer.getInstance();
var globals = require('../globals');
var ExpressApi = require('./api.express');
var ExpressWebsite = require('./website.express');

var log = require('logg').getLogger('app.core.express');

/**
 * The core express instance, requires all others.
 *
 * @constructor
 */
var ExpressApp = module.exports = cip.extendSingleton(function() {
  /** @type {express} The express instance */
  this.app = express();

  this.expressApi = ExpressApi.getInstance();
  this.expressWebsite = ExpressWebsite.getInstance();
});

/**
 * Kick off the webserver...
 *
 * @param {Object} opts Options as defined in app.init().
 * @return {Promise} a promise.
 */
ExpressApp.prototype.init = Promise.method(function(opts) {
  // initialize webserver
  webserver.init(this.app);

  // Init websockets
  socketServer.init(webserver.http);

  return Promise.all([
    this.expressApi.init(opts),
    this.expressWebsite.init(opts),
  ])
  .bind(this)
  .then(function (res) {
    log.fine('init() :: All express instances initialized, moving on with main');
    // body...
    var appApi = res[0];
    var appWebserver = res[1];

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

    this.app.use(vhost(config.hostname.api, appApi));
    this.app.use(vhost(config.hostname.website, appWebserver));

    // development only
    if (globals.isDev) {
      this.app.use(errorhandler());
    }

    return webserver.start(this.app);
  });
});
