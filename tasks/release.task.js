/**
 * @fileOverview The release task operation.
 */
module.exports = function(grunt) {
  grunt.config('release', {
    options: {
      bump: true, //default: true
      file: 'package.json', //default: package.json
      add: true, //default: true
      commit: true, //default: true
      tag: true, //default: true
      push: true, //default: true
      pushTags: true, //default: true
      npm: false, //default: true
      tagName: 'v<%= version %>', //default: '<%= version %>'
      commitMessage: 'releasing v<%= version %>', //default: 'release <%= version %>'
      tagMessage: 'v<%= version %>' //default: 'Version <%= version %>'
    },
  });
};
