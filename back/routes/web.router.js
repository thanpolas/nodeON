/**
 * @fileOverview The main routes of the web app.
 */
var log = require('logg').getLogger('app.webRouter');

var lusca = require('lusca');
var HomeCtrl = require('../controllers/index.ctrl');
var redirectMidd = require('../middleware/redirect.midd').getInstance();

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
 * @param {Object} opts Options as defined in app.init().
 */
router.init = function(app , opts) {
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

  //
  // Security Policies
  // CSRF, xss, rest
  var manageSecurity = function(req, res, next) {next();};
  if (!opts.nosecurity) {
    manageSecurity = lusca({
      csrf: true,
      csp: false,
      xframe: 'DENY',
      p3p: false,
      hsts: false,
      xssProtection: true
    });
  }

  // blanket middleware for manage ops
  var manageMiddleware = [
    featureMidd.has('user'),
    manageSecurity,
  ];

  app.get('/', homeCtrl.use);

  app.get('/tpl/:tpl', function(req, res) {
    var template = req.route.params.tpl;
    var tplBare = template.split('.')[0];
    res.render('tpl/' + tplBare);
  });

  // user related routes
  app.post('/register', manageMiddleware.concat(registerCtrl.use));
  app.get('/register', manageMiddleware.concat([registerCtrl.use]));

  app.post('/login', manageMiddleware.concat(loginCtrl.login));
  app.get('/logout', manageMiddleware.concat(loginCtrl.logout));
  app.get('/login', manageMiddleware.concat([loginCtrl.use]));

  app.get('/verify/:verifyToken/:uid?', manageMiddleware.concat(verifyCtrl.use));

  app.get('/profile', manageMiddleware.concat([profileCtrl.use]));
  app.post('/profile', manageMiddleware.concat(profileCtrl.post));

  app.get('/forgot', manageMiddleware.concat([forgotCtrl.use]));
  app.post('/forgot', manageMiddleware.concat(forgotCtrl.post));
  app.get('/forgot/:resetToken/:uid', manageMiddleware.concat([forgotCtrl.resetView]));
  app.post('/forgot/:resetToken/:uid', manageMiddleware.concat(forgotCtrl.resetSubmit));
};
