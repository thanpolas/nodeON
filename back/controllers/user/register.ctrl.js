/**
 * @fileOverview POST /register User registration
 */
var validator = require('validator');
var log = require('logg').getLogger('app.ctrl.Register');
var ControllerBase = require('nodeon-base').ControllerBase;

var UserEntity = require('../../entities/user/user.ent');

/**
 * The registration API.
 *
 * @contructor
 * @extends {app.ControllerBase}
 */
var Register = module.exports = ControllerBase.extendSingleton(function(){
  // Add the request handling middleware controllers
  this.use.push(this._useRegister.bind(this));
});

/**
 * Handle Register request. If method is GET render the signup form.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @private
 */
Register.prototype._useRegister = function(req, res) {
  if (req.method === 'GET') {
    this._getRegister(req, res);
    return;
  }

  var userEntity = UserEntity.getInstance();

  // perform basic sanitizations, validation happens in model.
  var params = {
    firstName: validator.toWebstring(req.body.firstName, 40),
    lastName: validator.toWebstring(req.body.lastName, 40),
    companyName: validator.toWebstring(req.body.companyName, 60),
    email: validator.toWebstring(req.body.email, 120),
    password: validator.toString(req.body.password),
  };

  log.info('_useRegister() :: New user register:', params.email);

  userEntity.register(params)
    .then(this._newUser.bind(this, req, res))
    .catch(function(err) {
      log.warn('_useRegister() :: New user fail:', err.message);
      res.status(400).render('user/register', {
        error: true,
        errorMessage: err.message,
      });
      return;
    });
};

/**
 * Display the signup form
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @private
 */
Register.prototype._getRegister = function(req, res) {
  res.render('user/register');
};

/**
 * Handle a new user save, this is the User Model Save callback.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {mongoose.Document} udo The user document.
 * @private
 */
Register.prototype._newUser = function(req, res, udo) {
  log.fine('_newUser() :: New user created:', udo.email);

  var self = this;
  req.login(udo, function(err) {
    if (err) {
      log.warn('_newUser() :: Session Login Error:', err);
      res.render(self.viewLogin, {
        error: true,
        errorMsg: 'You have successfully registered but unfortunately an' +
          ' error has occured. Please try to login and check your email for' +
          ' the verification email we have sent you.',
      });

      return;
    }
    self.addFlashSuccess(req, {newUser: true});
    res.redirect('/');
  });
};
