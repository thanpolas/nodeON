/**
 * @fileOverview User Forgot Password endpoint.
 */
var __ = require('lodash');
var validator = require('validator');
var appError = require('nodeon-error');
var log = require('logg').getLogger('app.ctrl.Forgot');
var ControllerBase = require('nodeon-base').ControllerBase;

var ForgotEnt = require('../../entities/user/user-forgot.ent');

/**
 * The forgot password controller
 *
 * @extends {app.ControllerBase}
 * @constructor
 */
var Forgot = module.exports = ControllerBase.extendSingleton(function() {
  this.use.push(this._forgotView.bind(this));
  this.post = [
    this._forgotSubmit.bind(this),
  ];

  this.resetView = [
    this._resetView.bind(this),
  ];

  this.resetSubmit = [
    this._resetSubmit.bind(this),
  ];

  this.forgotEnt = ForgotEnt.getInstance();
});

/**
 * Forgot Password view.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 */
Forgot.prototype._forgotView = function(req, res) {
  var viewParams = this.checkFlashError(req, res);
  viewParams = __.assign(viewParams, this.checkFlashSuccess(req, res));
  res.render('user/forgot', viewParams);
};

/**
 * Forgot password submission.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @private
 */
Forgot.prototype._forgotSubmit = function(req, res) {
  if (typeof req.body.email !== 'string') {
    res.render('user/forgot', {
      error: true,
      errorMsg: 'Please provide a proper email',
    });
    return;
  }
  var email = validator.toWebstring(req.body.email, 120);
  log.fine('_forgotSubmit() :: Starting Forgot Password Op for:', email);
  this.forgotEnt.forgot(email)
    .then(function() {
      res.render('user/forgot-done', {email: email});
    }).catch(function(err) {
      log.fine('_forgotSubmit() :: Error:', err);
      res.render('user/forgot', {
        error: true,
        errorMsg: err.message,
      });
    });
};

/**
 * Show the password restore view.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @private
 */
Forgot.prototype._resetView = function(req, res) {
  var resetToken = req.params.resetToken;
  var uid = req.params.uid;
  this.forgotEnt.verifyResetToken(resetToken, uid)
    .then(function(udo) {
      res.render('user/forgot-reset', {
        udo: udo,
        resetToken: resetToken,
        uid: uid,
      });
    }).catch(function() {
      res.status(401).render('user/forgot-error');
    });
};

/**
 * Handle a reset password submission.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @private
 */
Forgot.prototype._resetSubmit = function(req, res) {
  var resetToken = req.params.resetToken;
  var uid = req.params.uid;
  if (typeof req.body.password !== 'string') {
    res.render('user/forgot-reset', {
      error: true,
      errorMsg: 'A not valid password was provided',
    });
    return;
  }
  var self = this;
  this.forgotEnt.resetPassword(resetToken, uid, req.body.password)
    .then(function(udo) {
      log.fine('_resetSubmit() :: Operation complete for:', udo.email);
      self.addFlashSuccess(req, {resetPassword: true});
      res.redirect('/login');
    }).catch(function(err) {
      if (err instanceof appError.Authentication) {
        res.status(401).render('user/forgot-error');
        return;
      }
      res.status(400).render('user/forgot-reset', {
        error: true,
        errorMsg: err.message,
      });
    });
};
