/**
 * @fileOverview PubSub Utilities and globals.
 */

var psutil = module.exports = {};

/** @enum {string} Available pubsub channels */
psutil.Channel = {
  // When a dummy has finished being dummy and is now ready to dummy.
  DUMMY: 'dummy',
};
