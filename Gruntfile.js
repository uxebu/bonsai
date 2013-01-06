module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
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
      },
      all: ['Grunfile.js', 'src/**/*.js', 'test/**/(!goog.math.Matrix)*.js']
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
          specs: ['test/**/*-spec.js', '!test/compare-spec.js', '!test/build-spec.js'],
          helpers: ['test/jasmine-matchers.js', 'test/jasmine.helper.js'],
          template: 'requirejs',
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

    },
    'saucelabs-jasmine': {
      test: {
        username: 'uxebu', // if not provided it'll default to ENV SAUCE_USERNAME (if applicable)
        key: null, // if not provided it'll default to ENV SAUCE_ACCESS_KEY (if applicable)
        urls: ['http://localhost:8001/_SpecRunner.html'],
        tunnelTimeout: 5,
        testname: 'bonsaijs',
        browsers: [{
          browserName: 'firefox'
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

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('release', ['clean', 'closure-compiler']);
  grunt.registerTask('run-server', ['connect', 'watch']);
  grunt.registerTask('test', ['connect:test', 'jasmine:test']);
  grunt.registerTask('test-saucelabs', ['connect:test', 'jasmine:test:build', 'saucelabs-jasmine:test']);
};
