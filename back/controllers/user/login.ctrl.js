/**
 * @fileOverview Handle authentication requests, the login view.
 */

var util = require('util');

var __ = require('lodash');
var passport = require('passport');
var appError = require('nodeon-error');
var log = require('logg').getLogger('app.ctrl.Login');
var ControllerBase = require('nodeon-base').ControllerBase;

var globals = require('../../core/globals');
var AuthMidd = require('../../middleware/auth.midd');
var authMidd = new AuthMidd(globals.Roles.WEBSITE);

/**
 * The authentication controller.
 *
 * @contructor
 * @extends {app.ControllerBase}
 */
var Login = module.exports = ControllerBase.extendSingleton(function(){
  var auth = authMidd.requiresAuth({
    resource:'logout',
  });

  // Add the request handling middleware controllers
  this.use.push(this._showLogin.bind(this));

  /** @type {string} The login view */
  this.viewLogin = 'user/login';

  this.login = [
    this._login.bind(this)
  ];

  this.logout = [
    auth,
    this._logout.bind(this),
  ];
});

/**
 * Login Handler.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Function(Error=)} next passing control to the next middleware.
 * @private
 */
Login.prototype._login = function(req, res, next) {
  var self = this;
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      log.warn('_login() :: Operation Error:', err);
      return self._loginError(res, err);
    }

    if (!user) {
      return self._loginNoUser(res, info);
    }

    // successful login
    self._performLogin(req, res, user);
  })(req, res, next);
};

/**
 * Handle an error on login operation
 *
 * @param {Object} res The response Object.
 * @param {app.error.Abstract} err The error object
 * @private
 */
Login.prototype._loginError = function(res, err) {
  res.status(401).render(this.viewLogin, {
    error: true,
    errorMessage: err.message
  });
};

/**
 * Handle no returned UDO on login (wrong credentials?)
 *
 * @param {Object} res The response Object.
 * @param {app.error.Abstract} err The error object
 * @private
 */
Login.prototype._loginNoUser = function(res, err) {
  var normErr = this.loginGetError(err);
  res.status(400).render(this.viewLogin, {
    error: true,
    errorMsg: normErr.message,
  });
};

/**
 * Handle no returned UDO on login (wrong credentials?)
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {mongoose.Document} udo the UDO.
 * @private
 */
Login.prototype._performLogin = function(req, res, udo) {
  log.finer('_performLogin() :: Performing login for:', udo.email);
  var self = this;
  // store credentials to session
  req.login(udo, function(err) {
    if (err) {
      log.warn('_login() :: Session Login Error:', err);
      return res.render(self.viewLogin, {
        error: true,
        errorMsg: 'An error occured, please try again.',
      });
    }
    log.finest('_performLogin() :: Done', udo.email);
    res.redirect('/');
  });
};

/**
 * Show the login form.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Function(Error=)} next passing control to the next middleware.
 * @private
 */
Login.prototype._showLogin = function(req, res) {
  var viewParams = this.checkFlashError(req, res);
  viewParams = __.assign(viewParams, this.checkFlashSuccess(req, res));
  log.fine('_showLogin() :: viewParams:', viewParams);
  res.render(this.viewLogin, viewParams);
};

/**
 * Normalize login errors.
 *
 * @param {Error} err any error object
 * @return {app.error.Abstract} A child of cc errors.
 * @static
 */
Login.prototype.loginGetError = function(err) {
  var errMsg = 'An error occured, please try again';
  var normErr;
  if (err instanceof appError.Authentication) {
    log.fine('loginGetError() :: Auth middleware error:', err.message,
      'type:', err.type);
    normErr = err;
  } else {
    log.warn('loginGetError() :: Unknown error type', util.inspect(err));
    normErr = new appError.Unknown(err);
    normErr.message = errMsg;
  }

  return normErr;
};

/**
 * Handle a logout.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @private
 */
Login.prototype._logout = function(req, res) {
  req.logout();
  this.addFlashSuccess(req, {logout: true});
  res.redirect('/login');
};
