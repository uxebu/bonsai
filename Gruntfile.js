module.exports = function(grunt) {
  grunt.registerTask('test', 'Runs unit tests', function() {
    var done = this.async();

    // Test libraries
    var Mocha = require('mocha');
    var requirejs = require('requirejs');
    var chai = require('chai');
    var sinonChai = require("sinon-chai");

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

    //HACK: force BDD globals to be registered
    mocha.suite.emit('pre-require', global, null, mocha);

    // expose global expect function
    global.expect = chai.expect;

    requirejs(testModules, function() {
      mocha.run(function() {
        done();
      });
    });
  });
};
