/**
 * @fileOverview GET / Home page.
 */
// var log = require('logg').getLogger('app.ctrl.Homepage');

var ControllerBase = require('nodeon-base').ControllerBase;

/**
 * The home page.
 *
 * @contructor
 * @extends {app.ControllerBase}
 */
var Home = module.exports = ControllerBase.extendSingleton(function(){
  this.use.push(this._useIndex.bind(this));
});

/**
 * The index page.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 */
Home.prototype._useIndex = function(req, res) {
  res.render('index', {
    ip: this.getIp(req),
  });
};
