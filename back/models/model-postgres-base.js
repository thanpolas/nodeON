/**
 * @fileOverview The base Model Class for all PostGres models to extend from.
 */
var Model = require('./model-base');

/**
 * The sequelize instance is only available through
 * the Conn class (core/database), which requires this class.
 * To avoid the cyclic reference Conn calls the 'setSequelize' static function
 * to set the sequelize instance in this local var.
 * @type {Sequelize}
 */
var sequelize = null;

/**
 * The base Model Class for all PostGres models to extend from.
 *
 * @constructor
 * @extends {app.Model}
 */
var ModelPostgres = module.exports = Model.extend(function() {
  /** @type {?Sequelize} The singleton instance of Sequelize */
  Object.defineProperty(this, 'sequelize', {
    get: function() {
      return sequelize;
    }
  });

  /** @type {?Sequelize.Model} The result of `sequelize.define()` */
  this.Model = null;
});

/**
 * Set the sequelize instance.
 *
 * @param {Sequelize} seq the instance.
 * @static
 */
ModelPostgres.setSequelize = function(seq) {
  sequelize = seq;
};
