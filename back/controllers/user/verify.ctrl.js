/**
 * @fileOverview Email verification endpoint.
 */
var log = require('logg').getLogger('app.ctrl.Verify');
var ControllerBase = require('nodeon-base').ControllerBase;

var UserEnt = require('../../entities/user/user.ent');

/**
 * The Verification endpoint.
 *
 * @contructor
 * @extends {app.ControllerBase}
 */
var Verify = module.exports = ControllerBase.extendSingleton(function() {
  this.use.push(this._useVerifyEmail.bind(this));
});

/**
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 */
Verify.prototype._useVerifyEmail = function(req, res) {
  var verifyToken = req.params.verifyToken;
  var uid = req.params.uid;
  var self = this;
  if (!verifyToken) {
    return this._showFailed(req, res, 'No validation token was provided');
  }

  var userEnt = UserEnt.getInstance();

  userEnt.verifyToken(verifyToken, uid).then(function() {
    self.addFlashSuccess(req, {
      verified: true
    });
    res.redirect('/');
  }).catch(function(err) {
    log.error('_useVerifyEmail() :: Entity error:', err);
    self._showFailed(req, res, 'Ops! An error has occured, please try again.');
  });
};

/**
 * Handle failed verifications.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {string} errMessage Error message.
 */
Verify.prototype._showFailed = function(req, res, errMessage) {
  res.status(401).render('user/verify-fail', {
    errorMsg: errMessage,
  });
};
