/**
 * @fileOverview An extension of the base Controller, which adds CRUD handlers
 *   and routes.
 */
var crude = require('crude');

var ControllerBase = require('nodeon-base').ControllerBase;

/**
 * The CRUD controller.
 *
 * @constructor
 * @extends {crude, ControllerBase}
 */
var ControllerCrud = module.exports = crude.extend();

// mixin Controller
ControllerCrud.mixin(ControllerBase);

/**
 * Helper for stubbing CRUD ops that we don't want executed.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 */
ControllerCrud.prototype.show404 = function(req, res) {
  res.status(404).render('404');
};
