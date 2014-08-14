/**
 * @fileOverview API Socket 'version' call, returns API version.
 */
var ControllerBase = require('nodeon-base').ControllerBase;

/**
 * The API Socket 'version' call, returns API version.
 *
 * @contructor
 * @extends {app.ControllerBase}
 */
var Version = module.exports = ControllerBase.extendSingleton();

/**
 * Returns the API version.
 *
 * @param {socketio.Socket} socket The socket.io socket instance.
 * @param {*} data Data sent from the client.
 * @param {Function} resp Callback with response to client.
 */
Version.prototype.get = function(socket, data, resp) {
  resp('api-0.1');
};
