/**
 * @fileOverview The core express instance, requires all others.
 */
var config = require('config');
var cip = require('cip');
var BPromise = require('bluebird');
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

  /** @type {?app.core.ExpressApi} The express API instance */
  this.expressApi = null;

  if (config.usevhosts) {
    this.expressApi = ExpressApi.getInstance();
  }

  this.expressWebsite = ExpressWebsite.getInstance();
});

/**
 * Kick off the webserver...
 *
 * @param {Object} opts Options as defined in app.init().
 * @return {BPromise} a promise.
 */
ExpressApp.prototype.init = BPromise.method(function(opts) {
  // initialize webserver
  webserver.init(this.app);

  var boot = [
    this.expressWebsite.init(opts),
  ];

  if (config.usevhosts) {
    boot.push(this.expressApi.init(opts));
  }

  return BPromise.all(boot)
  .bind(this)
  .then(function (res) {
    log.fine('init() :: All express instances initialized, moving on with main');
    // body...
    var appApi = res[1];
    var appWebserver = res[0];

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

    // Init websockets
    socketServer.init(webserver.http);
    // listen for websocket connections
    socketServer.listen(globals.WebsocketNamespace.WEBSITE);

    if (config.usevhosts) {
      socketServer.listen(globals.WebsocketNamespace.API);
      this.app.use(vhost(config.hostname.api, appApi));
    }

    this.app.use(vhost(config.hostname.website, appWebserver));

    // development only
    if (globals.isDev) {
      this.app.use(errorhandler());
    }

    return webserver.start(this.app);
  });
});
