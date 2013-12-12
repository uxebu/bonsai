module.exports = function(grunt) {
  grunt.registerTask('test', 'Runs unit tests', function() {
    var done = this.async();

    // Test libraries
    var Mocha = require('mocha');
    var requirejs = require('requirejs');
    var chai = require('chai');
    var sinonChai = require("sinon-chai");
    var sinon = require('sinon');

    // mocha configuration
    var mocha = new Mocha({
      reporter: 'dot',
      slow: 20, // tests are considered slow after 20ms
      timeout: 200, // async tests time out after 200ms
      ui: 'bdd',
      useInlineDiffs: true
    });

    // chai assertion configuration
    chai.use(sinonChai);
    chai.Assertion.includeStack = true;

    var testModules = grunt.file.expand('test/unit/**/*.js').map(function(name) {
      return name.slice(0, -3);
    });

    // configure require.js
    requirejs.config({
      baseUrl: __dirname,
      paths: {
        bonsai: 'src'
      }
    });
    var define = requirejs.define;

    // expose chai.expect as module
    define('expect', function() {
      return chai.expect;
    });

    // expose sinon as module
    define('sinon', sinon);

    //HACK: force BDD functions to be registered in a BDD module
    var bdd = {};
    define('bdd', bdd);
    mocha.suite.emit('pre-require', bdd, null, mocha);

    requirejs(testModules, function() {
      mocha.run(function() {
        done();
      });
    });
  });
};
