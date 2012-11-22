define([
  '../../../runner/stage',
  '../script_loader'
], function(Stage, makeScriptLoader) {
  'use strict';

  function runCode(code, parameterMap) {
    var parameters = [], args = [];
    for (var parameterName in parameterMap) {
      parameters.push(parameterName);
      args.push(parameterMap[parameterName]);
    }

    return Function.apply(null, parameters.concat(code)).apply(null, args);
  }

  return function(messageChannel, loadFile, global) {
    var stage = new Stage(messageChannel);
    var exports = stage.env.exports;
    var loader = makeScriptLoader(function(url, callback) {
      loadFile(url, function(data) {
        return runCode(data, exports);
      });
    });

    global.wait = function() { return loader.wait(); };
    global.done = function() { return loader.done(); };
  /*
    This does not seem to be used anywhere, so I propose to throw it out
    global.load = function(url, callback) { return loader.load() };
  */

    global.run = function(node, url, options) {
      //TODO: run all the things here with runCode
      runCode(options.code, exports);

      //TODO: make run unusable after the first call?

      stage.unfreeze();
    };

    //TODO: needed?
    //messageChannel.notifyRenderer({command:"isReady"});

    return stage;
  }
});
