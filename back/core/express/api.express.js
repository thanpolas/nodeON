/**
 * @fileOverview API express instance and configuration.
 */
var path = require('path');

var express = require('express');
var flash = require('connect-flash');
var errorhandler = require('errorhandler');
var Promise = require('bluebird');

var log = require('logg').getLogger('app.core.express.api');

var webserver = require('./webserver.core');
var socketServer = require('./websocketServer.core').getInstance();
var session = require('./session-store.core').getInstance();
var authMidd = require('../middleware/auth.midd').getInstance();
var corsMidd = require('../middleware/cors.midd').getInstance();
var webRouter = require('../routes/web.router');
var globals = require('./globals');
var ExpressApp = require('./base.express.js');

var ApiExpress = module.exports = ExpressApp.extendSingleton(function () {

});

/**
 * Kick off the webserver...
 *
 * @param {Object} opts Options as defined in app.init().
 * @return {Promise(express)} a promise with the express instance.
 */
ApiExpress.prototype.init = Promise.method(function(opts) {
  log.info('init() :: Initializing webserver...');

  if (this.app !== null) {
    return this.app;
  }

  this.app = express();

  // Setup express
  this.baseSetup();

  this.app.set('views', __dirname + '/../../front/templates');
  this.app.set('view engine', 'jade');

  // enable CORS for current development flow.
  this.app.use(corsMidd.allowCrossDomain.bind(corsMidd));

  // Session store
  var sessConnectPromise = session.connect();
  this.app.use(session.use());

  // use flashing for passing messages to next page view
  this.app.use(flash());
  this.app.use(express.static(path.join(__dirname, '/../../front/static')));

  // initialize authentication
  authMidd.init(this.app);

  // initialize webserver
  webserver.init(this.app);

  // add the routes
  webRouter.init(this.app, opts);

  // Init websockets
  socketServer.init(webserver.http);

  // development only
  if (globals.isDev) {
    this.app.use(errorhandler());
  }

  // setup view globals
  this.app.locals.glob = globals.viewGlobals;

  return Promise.all([
    webserver.start(this.app),
    sessConnectPromise,
  ]);
});
