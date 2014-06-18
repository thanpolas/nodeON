/**
 * @fileOverview An extension of the base Controller, which adds CRUD handlers
 *   and routes.
 */
var crude = require('crude');

var ControllerBase = require('./controller-base');

/**
 * The CRUD controller.
 *
 * @constructor
 * @extends {crude, ControllerBase}
 */
var ControllerCrud = module.exports = crude.extend();

// mixin Controller
ControllerCrud.mixin(ControllerBase);
