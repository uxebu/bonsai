module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: ['Grunfile.js', 'src/**/*.js', 'test/**/*.js', '!test/goog.math.Matrix.js'],
      options: {
        eqnull: true,
        browser: true,
        newcap: false,
        predef: [
          'afterEach',
          'beforeEach',
          'describe',
          'expect',
          'it',
          'jasmine',
          'require',
          'spyOn',
          'console',
          'runs',
          'xdescribe',
          'xit',
          'waitsFor'
        ]
      }
    },
    'closure-compiler': {
      'release-max': {
        js: ['src/**/*.js', '!src/bootstrapper/_dev/*', '!src/bootstrapper/context/socketio/*', '!src/bootstrapper/context/node/*'],
        jsOutputFile: 'dist/bonsai.js',
        options: {
          transform_amd_modules: null,
          process_common_js_modules: null,
          common_js_module_path_prefix: 'src',
          common_js_entry_module: 'bootstrapper/_build/common.js',
          compilation_level: 'SIMPLE_OPTIMIZATIONS',
          //create_source_map: '%outname%.map',
          //source_map_format: 'V3',
          output_wrapper: '"(function __bonsaiRunnerCode__(){%output%}());"' // '\n//@ sourceMappingURL=bonsai.js.map"'
        }
      },
      'release-min': {
        js: 'dist/bonsai.js',
        jsOutputFile: 'dist/bonsai.min.js',
        options: {}
      }
    },
    jasmine: {
      test: {
        src: ['src/**/*.js', '!src/bootstrapper/_build/*', '!src/bootstrapper/_dev/*', '!src/bootstrapper/context/socketio/*', '!src/bootstrapper/context/node/*'],
        options: {
          host: 'http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/',
          outfile: '_spec_runner.html',
          specs: ['test/**/*-spec.js', '!test/compare-spec.js', '!test/build-spec.js'],
          helpers: ['test/jasmine-matchers.js', 'test/jasmine.helper.js'],
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            requireConfig: {
              baseUrl: './src/',
              paths: {
                bonsai: '.',
                common: '../test/common'
              }
            }
          }
        }
      }
    },
    connect: {
      'test': {
        options: {
          hostname: 'localhost',
          port: 8001
        }
      }
    },
    watch: {
      js: {
        files: '<%= jshint.all %>',
        tasks: ['test']
      }
    },
    'saucelabs-jasmine': {
      test: {
        username: null, // if not set, defaults to ENV SAUCE_USERNAME
        key: null, // if not set, defaults to ENV SAUCE_ACCESS_KEY
        urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/<%= jasmine.test.options.outfile %>'],
        tunnelTimeout: 5,
        testReadyTimeout: 1000*10,
        testname: 'bonsaijs',
        browsers: [{
          browserName: 'chrome'
        }],
        onTestComplete: function() {
          var done = this.async();
          setTimeout(function() {
            done(true);
          });
        }
      }
    },
    clean: {
      release: ['dist/*']
    }
  });

  grunt.loadNpmTasks('grunt-closure-compiler');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-saucelabs');

  grunt.registerTask('default', ['jshint', 'test']);
  grunt.registerTask('release', ['clean', 'closure-compiler']);
  grunt.registerTask('run-server', ['connect', 'jasmine:test:build', 'watch']);
  grunt.registerTask('test', ['connect:test', 'jasmine:test']);
  grunt.registerTask('test-saucelabs', ['connect:test', 'jasmine:test:build', 'saucelabs-jasmine:test']);
};
