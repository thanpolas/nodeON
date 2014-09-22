/**
 * @fileOverview Logging facilities, logfiles.
 */

// Nodejs libs.
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var util = require('util');

var logg = require('logg');
var config = require('config');
var file = require('nodeon-file');

var initialized = false;

var logger = module.exports = new EventEmitter();

/**
 * Initialize
 */
logger.init = function() {
  if (initialized) {return;}
  initialized = true;

  logger.setLevel();


  // intercept log messages before they reach the console
  logg.removeConsole();
  logg.rootLogger.registerWatcher(logger.interceptLogMessages);

  if (config.logger.console) {
    logg.addConsole();
  }

  if (config.logger.saveToFile) {
    console.log('Logs will be saved to:', config.logger.filename);
  }

  // hook on logger
  try {
    logg.on('', logger._handleLog);
    // initialize syslog
  } catch(ex) {
    console.error('Logger failed:', util.inspect(ex));
  }

};


/**
 * set the minimum logging level to logg.
 *
 */
logger.setLevel = function() {
  logg.rootLogger.setLogLevel(config.logger.level);
};

/**
 * Handle a captured log event.
 *
 * Sample logRecord object:
 *
 * level: 100
 * name: 'app.ctrl.process'
 * rawArgs: [ '_masterLoop() :: Loop: 2 processing: 0 concurrent jobs: 1' ]
 * date: Tue Apr 16 2013 18:29:52 GMT+0300 (EEST)
 * message: '_masterLoop() :: Loop: 2 processing: 0 concurrent jobs: 1' }
 *
 *
 * @param  {Object} logRecord As seen above.
 * @private
 */
logger._handleLog = function(logRecord) {

  // log level check.
  if (config.logger.level > logRecord.level) {
    return;
  }

  // relay the record
  logger.emit('message', logRecord);

  var message = logg.formatRecord(logRecord, true);

  if (config.logger.file) {
    logger._saveToFile(message);
  }

};

/**
 * Append a log message to the log file.
 *
 * @param  {string} message the message.
 * @private
 */
logger._saveToFile = function(message) {
  if (!file.isFile(config.logger.filename)) {
    // try to create it...
    try {
      file.write(config.logger.filename, '');
    } catch(ex) {
      console.error('\n\n********************\nFailed to write to log file! File: ', config.logger.filename, '\n\n');
      return;
    }
  }
  fs.appendFile(config.logger.filename, message);
};

/**
 * Intercepts and reformats log messages if they contain as instance of Error.
 *
 * @param {Object} logRecord The Log Record.
 */
logger.interceptLogMessages = function(logRecord) {
  var errorStacks = [];
  var foundErrors = false;
  logRecord.rawArgs.forEach(function (arg, index) {
    if (logger.isError(arg)) {
      errorStacks.push(arg.stack);
      logRecord.rawArgs[index] = arg.message;
      foundErrors = true;
    }
  });

  if (foundErrors) {
    var log = logg.getLogger(logRecord.name);
    errorStacks.forEach(function (stack) {
      log.finest('Error Stack for:', logRecord.rawArgs[0], ':', stack);
    });
  }

  logRecord.message = logRecord.getFormattedMessage();
};

// Special treatment for objects that may look like errors.
logger.isError = function (o) {
  return o && typeof o === 'object' && (o instanceof Error || o.message && o.stack);
};
