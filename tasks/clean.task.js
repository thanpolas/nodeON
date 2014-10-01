/**
 * @fileOverview The clean task operation.
 */
module.exports = function(grunt) {
  grunt.config('clean', {
    deploy: [
      'front/static/scripts',
      'front/static/components',
    ],
  });
};
