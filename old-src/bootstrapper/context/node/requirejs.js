'use strict';

// this module provides a pre-configured requirejs context

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var requirejs = require('requirejs');
requirejs.config({
  paths: {
    bonsai: path.resolve(__dirname, '..', '..', '..')
  }
});

function getConfig(requirejs) {
  return requirejs.s.contexts._.config;
}
var requireJsFile = require.resolve('requirejs');
// in node 0.7+ existsSync is no fs
var exists = fs.existsSync || path.existsSync;

exports.requirejs = requirejs;
exports.createForVmContext = function(vmContext) {
  delete require.cache[requireJsFile]; // make sure we get a fresh instance

  var vmContextRequire = require('requirejs');
  vmContextRequire.config(getConfig(requirejs));
  vmContextRequire.load = function (context, moduleName, url) {
    var contents, err;

    if (exists(url)) {
      contents = '(function(require, nodeRequire, define){' +
        fs.readFileSync(url, 'utf8') +
      '}(require, nodeRequire, require.define))';

      try {
        vm.runInContext(contents, vmContext, fs.realpathSync(url));
      } catch (e) {
        err = new Error('Evaluating ' + url + ' as module "' +
          moduleName + '" failed with error: ' + e);
        err.originalError = e;
        err.moduleName = moduleName;
        err.fileName = url;
        return vmContextRequire.onError(err);
      }
    } else {
      vmContextRequire.define(moduleName, function () {
        try {
          return (context.config.nodeRequire || vmContextRequire.nodeRequire)(moduleName);
        } catch (e) {
          err = new Error('Calling node\'s require("' +
            moduleName + '") failed with error: ' + e);
          err.originalError = e;
          err.moduleName = moduleName;
          return vmContextRequire.onError(err);
        }
      });
    }

    //Support anonymous modules.
    context.completeLoad(moduleName);
  };

  delete require.cache[requireJsFile]; // make sure nobody else gets our instance

  return vmContextRequire;
};

