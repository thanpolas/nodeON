/**
 * @fileOverview Initialize webserver services, express, routes, etc
 */
var path = require('path');

var config = require('config');
var Promise = require('bluebird');
var express = require('express');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var log = require('logg').getLogger('app.core.express');
var errorhandler = require('errorhandler');
var bodyParser = require('body-parser');

var webserver = require('./webserver.core');
var socketServer = require('./websocketServer.core').getInstance();
var session = require('./session-store.core').getInstance();
var authMidd = require('../middleware/auth.midd').getInstance();
var corsMidd = require('../middleware/cors.midd').getInstance();
var webRouter = require('../routes/web.router');
var globals = require('./globals');

var expressApp = module.exports = {};

/** @type {?express} The express instance */
expressApp.app = null;

/** @type {app.core.SessionStore} Instance of Session Store */
expressApp.sessionStore = null;


/**
 * Kick off the webserver...
 *
 *
 * @param {Object} opts Options as defined in app.init().
 * @return {Promise} a promise.
 */
expressApp.init = Promise.method(function(opts) {
  log.info('init() :: Initializing webserver...');

  if (expressApp.app !== null) {
    return;
  }

  var app = expressApp.app = express();

  // Discover proper port, Heroku exports it in an env
  var port;
  if (globals.isHeroku) {
    port = process.env.PORT;
  } else {
    port = globals.isApi ? config.webserver.apiPort : config.webserver.port;
  }

  // Setup express
  app.set('port', port);
  app.set('views', __dirname + '/../../front/templates');
  app.set('view engine', 'jade');
  // remove x-powered-by header
  app.set('x-powered-by', false);

  // enable CORS for current development flow.
  app.use(corsMidd.allowCrossDomain.bind(corsMidd));

  app.use(cookieParser());
  app.use(bodyParser());

  // Session store
  var sessConnectPromise = session.connect();
  app.use(session.use());

  // use flashing for passing messages to next page view
  app.use(flash());
  app.use(express.static(path.join(__dirname, '/../../front/static')));

  // initialize authentication
  authMidd.init(app);

  // initialize webserver
  webserver.init(app);

  // add the routes
  webRouter.init(app, opts);

  // Init websockets
  socketServer.init(webserver.http);

  // development only
  if (globals.isDev) {
    app.use(errorhandler());
  }

  // setup view globals
  app.locals.glob = globals.viewGlobals;

  return Promise.all([
    webserver.start(app),
    sessConnectPromise,
  ]);
});
