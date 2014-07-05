/**
 * @fileOverview The main routes of the web app.
 */
var log = require('logg').getLogger('app.router.web');

var HomeCtrl = require('../controllers/index.ctrl');
var redirectMidd = require('../middleware/redirect.midd').getInstance();

var securityMidd = require('../middleware/security.midd');
var featureMidd = require('../middleware/feature.midd');
var RegisterCtrl = require('../controllers/user/register.ctrl');
var LoginCtrl = require('../controllers/user/login.ctrl');
var VerifyCtrl = require('../controllers/user/verify.ctrl');
var ProfileCtrl = require('../controllers/user/editProfile.ctrl');
var ForgotCtrl = require('../controllers/user/forgot.ctrl');

var globals = require('../core/globals');

var router = module.exports = {};

/**
 * Initialize routes.
 *
 * @param {express} app Express instance.
 */
router.init = function(app) {
  log.fine('init() :: initializing routes...');
  var homeCtrl = HomeCtrl.getInstance();
  var registerCtrl = RegisterCtrl.getInstance();
  var loginCtrl = LoginCtrl.getInstance();
  var verifyCtrl = VerifyCtrl.getInstance();
  var profileCtrl = ProfileCtrl.getInstance();
  var forgotCtrl = ForgotCtrl.getInstance();

  // redirect to www if on heroku (production)
  if (globals.isHeroku) {
    log.fine('init() :: Adding heroku force redirect to www');
    app.get('/', redirectMidd.forceWww.bind(redirectMidd));
  }

  app.get('/', homeCtrl.use);

  app.get('/tpl/:tpl', function(req, res) {
    var template = req.route.params.tpl;
    var tplBare = template.split('.')[0];
    res.render('tpl/' + tplBare);
  });

  var manageSecurity = securityMidd();

  // blanket middleware for User API ops
  var userMiddleware = [
    featureMidd.has('user'),
    manageSecurity,
  ];

  // user related routes
  app.post('/register', userMiddleware.concat(registerCtrl.use));
  app.get('/register', userMiddleware.concat([registerCtrl.use]));

  app.post('/login', userMiddleware.concat(loginCtrl.login));
  app.get('/logout', userMiddleware.concat(loginCtrl.logout));
  app.get('/login', userMiddleware.concat([loginCtrl.use]));

  app.get('/verify/:verifyToken/:uid?', userMiddleware.concat(verifyCtrl.use));

  app.get('/profile', userMiddleware.concat([profileCtrl.use]));
  app.post('/profile', userMiddleware.concat(profileCtrl.post));

  app.get('/forgot', userMiddleware.concat([forgotCtrl.use]));
  app.post('/forgot', userMiddleware.concat(forgotCtrl.post));
  app.get('/forgot/:resetToken/:uid', userMiddleware.concat([forgotCtrl.resetView]));
  app.post('/forgot/:resetToken/:uid', userMiddleware.concat(forgotCtrl.resetSubmit));
};
