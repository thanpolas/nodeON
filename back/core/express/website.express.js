/**
 * @fileOverview Website express instance and configuration.
 */
var path = require('path');

var cip = require('cip');
var express = require('express');
var flash = require('connect-flash');
var BPromise = require('bluebird');

var log = require('logg').getLogger('app.core.express.website');

var globals = require('../globals');
var SessionStore = require('../session-store.core');
var AuthMidd = require('../../middleware/auth.midd');
var authMidd = new AuthMidd(globals.Roles.WEBSITE);
var corsMidd = require('../../middleware/cors.midd').getInstance();
var webRouter = require('../../routes/web.router');

var WebExpress = module.exports = cip.extendSingleton(function () {
  /** @type {express} The express instance */
  this.app = express();

  /** @type {?app.core.SessionStore} Instance of Session Store */
  this.sessionStore = null;
});

/**
 * Initialize the API express instance.
 *
 * @param {Object} opts Options as defined in app.init().
 * @return {BPromise(express)} a promise with the express instance.
 */
WebExpress.prototype.init = BPromise.method(function(opts) {
  log.info('init() :: Initializing webserver...');

  this.app.set('views', path.join(__dirname + '/../../../front/templates/'));
  this.app.set('view engine', 'jade');
  // remove x-powered-by header
  this.app.set('x-powered-by', false);

  // enable CORS for current development flow.
  this.app.use(corsMidd.allowCrossDomain.bind(corsMidd));

  // Session store
  this.sessionStore = new SessionStore(globals.Roles.WEBSITE);
  var sessConnectBPromise = this.sessionStore.connect();
  this.app.use(this.sessionStore.use());

  // use flashing for passing messages to next page view
  this.app.use(flash());
  this.app.use(express.static(path.join(__dirname, '/../../../front/static')));

  // initialize authentication
  authMidd.init(this.app);

  // add the routes
  webRouter.init(this.app, opts);

  // setup view globals
  this.app.locals.glob = globals.viewGlobals;

  return BPromise.all([
    sessConnectBPromise,
  ])
  .bind(this)
  .then(function () {
    return this.app;
  });
});
