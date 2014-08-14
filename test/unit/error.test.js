/**
 * @fileOverview Signed Error Objects tests.
 */
// var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
// var __ = require('lodash');

var tester = require('../lib/tester.lib');

chai.config.includeStack = true;

// lib to test
var appError = require('../../back/util/error');

describe.only('Error Objects', function () {

  tester.init();

  describe.only('API Surface', function() {
    function testError (instance) {
      expect(instance).to.be.instanceOf(appError.BaseError);
      expect(instance).to.be.instanceOf(Error);
      expect(instance.error).to.be.true;
      expect(instance.stack).to.have.length.above(100);
    }

    it('Signed Error instances should be instances of Error', function() {
      var error = new appError.Error();

      expect(error).to.be.instanceOf(appError.Error);
      expect(error).to.be.instanceOf(Error);
      expect(error).to.have.property('name', 'AppBaseError');
      expect(error).to.have.keys([
        'name',
        'message',
        'srcError',
        'error',
      ]);
    });
    it('Validation Error should be instance of BaseError, Error', function(){
      var validationError = new appError.Validation();
      testError(validationError);
      expect(validationError).to.have.property('name', 'AppValidationError');
      expect(validationError.toApi).to.be.a('function');
      expect(validationError).to.have.keys([
        'name',
        'message',
        'srcError',
        'error',
        'errors',
      ]);
    });
    it('Unknown Error should be instance of BaseError, Error', function(){
      var unknownError = new appError.Unknown();
      testError(unknownError);
      expect(unknownError).to.have.property('name', 'AppUnknownError');
      expect(unknownError.toApi).to.be.a('function');
      expect(unknownError).to.have.keys([
        'name',
        'message',
        'srcError',
        'error',
      ]);

    });
    it('Database Error should be instance of BaseError, Error', function(){
      var databaseError = new appError.Database();
      testError(databaseError);
      expect(databaseError).to.have.property('name', 'AppDatabaseError');
      expect(databaseError.toApi).to.be.a('function');
      expect(databaseError).to.have.keys([
        'name',
        'message',
        'srcError',
        'error',
        'type',
      ]);
    });
    it('Authentication Error should be instance of BaseError, Error', function(){
      var authenticationError = new appError.Authentication();
      testError(authenticationError);
      expect(authenticationError).to.have.property('name', 'AppAuthenticationError');
      expect(authenticationError.toApi).to.be.a('function');
      expect(authenticationError).to.have.keys([
        'name',
        'message',
        'srcError',
        'error',
        'type',
      ]);
    });
    it('JSON Error should be instance of BaseError, Error', function(){
      var jsonError = new appError.JSON();
      testError(jsonError);
      expect(jsonError).to.have.property('name', 'AppJSONError');
      expect(jsonError.toApi).to.be.a('function');
      expect(jsonError).to.have.keys([
        'name',
        'message',
        'srcError',
        'error',
        'JSONexception',
      ]);
    });
  });

  describe('Error Expectations', function () {
    it('the .toApi method should operate as expected', function () {
      var error = new appError.Error();
      var apiRes = error.toApi();

      expect(apiRes).to.have.keys([
        'name',
        'message',
        'error',
      ]);

      expect(apiRes.stack).to.be.an('undefined');
    });
    it('Message propagates using Ctor', function () {
      var error = new appError.Error('message');

      expect(error.message).to.equal('message');
    });
  });
});
