module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        eqnull: true,
        browser: true,
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
    clean: {
      release: ['dist/*']
    }
  });

  grunt.loadNpmTasks('grunt-closure-compiler');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('release', ['clean', 'closure-compiler']);
};
