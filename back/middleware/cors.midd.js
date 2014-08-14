/**
 * @fileOverview Granular CORS control Middleware.
 */
var MiddlewareBase = require('nodeon-base').MiddlewareBase;

// var log = require('logg').getLogger('app.midd.Cors');

/**
 * The Cors Middleware.
 *
 * @contructor
 * @extends {app.Middleware}
 */
var Cors = module.exports = MiddlewareBase.extendSingleton();

/**
 * CORS Middleware
 *
 * @see http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Function(Error=)} next passing control to the next middleware.
 */
Cors.prototype.allowCrossDomain = function(req, res, next) {
  var acceptHeaders = 'Content-Type, Authorization, X-Api-Token, ' +
    'x-requested-with, Accept';
  res.header('Access-Control-Allow-Origin', '*');// config.webserverUrl);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', acceptHeaders);

  // intercept OPTIONS method
  if (req.method === 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
};
