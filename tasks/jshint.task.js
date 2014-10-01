/**
 * @fileOverview The jshint task operation.
 */
module.exports = function(grunt) {
  grunt.config('jshint', {
    options: {
      jshintrc: true,
    },
    backend: ['back/**/*.js'],
    frontend: {
      // options: {
      //   jshintrc: 'front/static/scripts/.jshintrc',
      // },
      src: ['front/static/scripts/**/*.js'],
    },
  });
};
