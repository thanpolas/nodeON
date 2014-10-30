/**
 * @fileOverview Authentication Middleware, using the Passport package.
 * @see http://passportjs.org/guide/
 */
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var appError = require('nodeon-error');
var MiddlewareBase = require('nodeon-base').MiddlewareBase;
var ControllerBase = require('nodeon-base').ControllerBase;

var log = require('logg').getLogger('app.midd.Auth');

var UserModel = require('../models/user.model');
var userModel = UserModel.getInstance();
var globals = require('../core/globals');

/** @type {Object.<app.midd.Auth} Auth middleware instances. */
var singletons = {};

/**
 * The Auth Middleware.
 *
 * @event `login`: A Login happened, the `udo` is provided.
 *
 * @param {app.core.globals.Roles} role The role to assume, can be 'api', 'website'.
 * @contructor
 * @extends {app.Middleware}
 */
var Auth = module.exports = MiddlewareBase.extend(function (role) {
  if (!role) {
    role = globals.Roles.WEBSITE;
  }
  if (singletons[role]) {
    singletons[role].zit = 1;
    return singletons[role];
  }
  singletons[role] = this;
});

/**
 * Initialize Authentication Middleware.
 *
 * @param {Express} app The express instance.
 */
Auth.prototype.init = function(app) {
  log.fine('init() :: Initializing...');

  // passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.serializeUser(this.serializeUser.bind(this));
  passport.deserializeUser(this.deserializeUser.bind(this));


  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  }, this._localAuth.bind(this)));
};

/**
 * Passport middleware, serialize a UDO.
 *
 * @param  {mongoose.Document} user A mongoose document.
 * @param  {Function(Error=)} done callback.
 * @private
 */
Auth.prototype.serializeUser = function(user, done) {
  log.finer('serializeUser() :: Init...', user.email);
  done(null, user.toObject({
    // Have all virtuals populated in the returned UDO.
    getters: true
  }));
};

/**
 * Passport middleware, serialize a user object.
 *
 * @param  {Object} udo The User Data Object.
 * @param  {Function(Error=, Object)} done callback.
 * @private
 */
Auth.prototype.deserializeUser = function(udo, done) {
  log.finer('deserializeUser() :: Init. Email:', udo.email);
  done(null, udo);
};

/**
 * The local authentication mechanism.
 *
 * @param  {string} email The email.
 * @param  {string} password The pass in plain text.
 * @param  {Function(Error=, Mongoose.Document)} done The callback.
 * @private
 */
Auth.prototype._localAuth = function(email, password, done) {
  var self = this;
  log.fine('_localAuth() :: Init. ', email);
  userModel.Model.findOne({email: email}, function(err, udo) {
    var error;
    if (err) {
      log.warn('_localAuth() :: Query error:', err);
      error = new appError.Authentication('An error occured, please retry');

      error.type = appError.Authentication.Type.Mongo;
      error.srcError = err;
      return done(error);
    }
    if (!udo) {
      log.fine('_localAuth() :: User not found:', email);
      error = new appError.Authentication('Email / Password combination is wrong.');
      error.type = appError.Authentication.Type.EMAIL;
      return done(null, false, error);
    }

    log.finer('_localAuth() :: Found user, comparing...');
    udo.verifyPassword(password)
      .then(function() {
        log.fine('_localAuth() :: User Logged in.');
        self.emit('login', udo);
        done(null, udo);
      }).catch(function() {
        log.fine('_localAuth() :: Wrong password for:', email);
        error = new appError.Authentication('Email / Password combination is wrong.');
        error.type = appError.Authentication.Type.PASSWORD;
        return done(null, false, error);
      });
  });
};


/**
 * Auth and privileges middleware, ensures client can access the resource.
 *
 * Options is an object supporting the following keys:
 * @param {Object} opts An optional hash of options.
 *   @param {string} resource REQUIRED Free text to describe the resource that requires
 *       proper credentials, will be used for logging purposes.
 *   @param {boolean} isAdmin Set to true to only allow Admin users.
 *   @param {boolean} noAccess Do not allow anyone to enter.
 *   @param {boolean} socket If this is a socket middleware.
 */
Auth.prototype.requiresAuth = function(opts) {
  var resource = '';
  if (typeof opts === 'string') {
    resource = opts;
  } else {
    resource = opts.resource;
  }
  if (!resource) {
    throw new Error('No resource defined for requiresAuth() middleware');
  }
  log.finer('requiresAuth() :: Init. Resource:', resource);

  var udo = {};

  var loginRoute = '/login';

  function logError(transport, reason) {
    log.warn('requiresAuth() :: FAIL. Transport:', transport,
      ':: Reason:', reason,
      ':: Resource:', opts.resource,
      ':: uid:', udo.id,
      ':: isAdmin:', opts.isAdmin,
      ':: email:', udo.email
    );
  }

  function expressAuth(req, res, next) {
    function onFail(reason) {
      logError('expressAuth', reason);
      var err = new appError.Authentication();
      err.message = 'You are not authenticated';
      err.type = appError.Authentication.Type.SESSION;
      var ctrl = new ControllerBase();
      if (req.is('json')) {
        res.status(401).json(err.toApi());
      } else {
        ctrl.addFlashError(req, err);
        res.redirect(loginRoute);
        return next(err.message);
      }

    }
    udo = req.user || {};
    var ownUid = udo.id;

    // log.fine('requiresAuth() :: Check. Resource:', opts.resource, ownUid, udo);
    // Make udo available to views
    res.locals.udo = udo;

    resolveAuth(ownUid, onFail, next);
  }

  /**
   * @param {socketio.Socket} socket The socket instance.
   * @param {*} data Data sent from the client.
   * @param {Function} resp Callback with response to client.
   * @param {Function} next pass control.
   * @private
   */
  function socketAuth(socket, data, resp, next) {
    function onFail(reason) {
      logError('socket', reason);
      var err = new appError.Authentication();
      err.message = 'Not Allowed';
      err.type = appError.Authentication.Type.SOCKET;

      resp(err);
      return next(err);
    }
    udo = socket.udo || {};
    resolveAuth(socket.udo.id, onFail, next);
  }

  /**
   * The main authentication resolver decoupled by transport (web/websocket).
   *
   * @param {string} ownUid The user id.
   * @param {Function} onFail On Fail callback.
   * @param {Function} next next callback.
   */
  function resolveAuth(ownUid, onFail, next) {

    if (!ownUid) {
      return onFail('Not Authed');
    }

    if (opts.noAccess) {
      return onFail('no access');
    }

    if (opts.isAdmin) {
      if (!udo.isAdmin) {
        onFail('No Access');
        return;
      }
    }

    next();
  }

  return opts.socket ? socketAuth : expressAuth;
};
