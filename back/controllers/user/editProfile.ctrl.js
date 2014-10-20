/**
 * @fileOverview User Profile editing.
 */
var validator = require('validator');
var log = require('logg').getLogger('app.ctrl.EditProfile');
var ControllerBase = require('nodeon-base').ControllerBase;

var globals = require('../../core/globals');
var UserEntity = require('../../entities/user/user.ent');
var AuthMidd = require('../../middleware/auth.midd');
var authMidd = new AuthMidd(globals.Roles.WEBSITE);

/**
 * User Profile Editing.
 *
 * @contructor
 * @extends {app.ControllerBase}
 */
var Profile = module.exports = ControllerBase.extendSingleton(function(){
  var auth = authMidd.requiresAuth({
    resource:'profile',
  });
  this.use.push(auth);
  this.use.push(this._getProfile.bind(this));
  this.post = [
    auth,
    this._submitProfile.bind(this),
  ];
});

/**
 * Handle Profile Submission.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @private
 */
Profile.prototype._submitProfile = function(req, res) {
  var userEntity = UserEntity.getInstance();

  // perform basic sanitizations, validation happens in model.
  var params = {};
  if (typeof req.body.firstName === 'string') {
    params.firstName = validator.toWebstring(req.body.firstName, 40);
  }
  if (typeof req.body.lastName === 'string') {
    params.lastName = validator.toWebstring(req.body.lastName, 40);
  }
  if (typeof req.body.companyName === 'string') {
    params.companyName = validator.toWebstring(req.body.companyName, 60);
  }
  if (typeof req.body.email === 'string') {
    params.email = validator.toWebstring(req.body.email, 120);
  }

  if (typeof req.body.oldPassword === 'string') {
    params.oldPassword = validator.toString(req.body.oldPassword);
    params.newPassword = validator.toString(req.body.newPassword);
  }
  log.info('_profileEntry() :: Profile edit for:', req.user.email);
  userEntity.editProfile(params, req.user)
    .then(this._profileDone.bind(this, req, res))
    .catch(function(err) {
      log.warn('_profileEntry() :: Profile edit fail:', err);
      res.status(400).render('user/profile', {
        error: true,
        errorMessage: err.message
      });
      return;
    });
};

/**
 * Display the Profile edit form
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @private
 */
Profile.prototype._getProfile = function(req, res) {
  res.render('user/profile');
};

/**
 * Profile edit success.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @private
 */
Profile.prototype._profileDone = function(req, res) {
  this.addFlashSuccess(req, {profileDone: true});
  res.redirect('/');
};
