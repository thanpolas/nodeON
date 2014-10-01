/**
 * @fileOverview The mochaTest task operation.
 */
module.exports = function(grunt) {
  grunt.config('mochaTest', {
    web: {
      options: {
        ui: 'bdd',
        reporter: 'spec',
      },
      src: [ 'test/website/*.js' ],
    },
    user: {
      options: {
        ui: 'bdd',
        reporter: 'spec',
      },
      src: [ 'test/user/*.js' ],
    },
  });
};
