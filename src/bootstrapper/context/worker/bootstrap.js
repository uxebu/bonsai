define([
  '../../../runner/stage',
  '../script_loader',
  '../../../tools'
], function(Stage, makeScriptLoader, tools) {
  'use strict';

  function loadUrl(url, successCallback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function() {
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
        successCallback(this.responseText);
      } else {
        errorCallback(xhr.status + ' (' + xhr.statusText + ')');
      }
    };
    xhr.onerror = errorCallback;
    xhr.send(null);
  }

  return function(messageChannel) {

    if (!('console' in self)) {
      self.console = {
        log: function () {
          try {
            messageChannel.notifyRenderer({
              command: 'debug',
              data: [].map.call(arguments, function(item) {
                return typeof item == 'function' ? String(item) : item;
              })
            });
          } catch (e) {
            messageChannel.notifyRenderer({
              command: 'debug',
              data: 'Error logging argument: (' + e + ')'
            });
          }
        }
      };
    }

    var loader = makeScriptLoader(function(url, cb) {
      try {
        importScripts(url);
        cb(null);
      } catch(e) {
        console.log('>>ERROR WORKER', e);
      }
    });

    self.load = function(url, cb) { return loader.load(url, cb); };
    self.wait = function() { return loader.wait(); };
    self.done = function() { return loader.done(); };

    var stage = new Stage(messageChannel);
    var env = stage.env.exports;
    // Expose bonsai API in iframe window
    tools.mixin(self, env);
    self.exports = {}; // for plugins

    messageChannel.on('message', function(message) {
      if (message.command === 'loadScript') {
        loader.load(message.url, function() {
          //console.log('scriptLoaded', message.url)
          messageChannel.notifyRenderer({
            command: 'scriptLoaded',
            url: message.url
          });
        });
      } else if (message.command === 'runScript') {
        Function(message.code)();
      } else if (message.command === 'exposePluginExports') {
        // Don't allow anything to overwrite the bonsai stage:
        if ('stage' in self.exports) {
          delete self.exports.stage;
        }
        // Expose exports [plugins] globally
        tools.mixin(self, self.exports);
      }
    });

    // As per the boostrap's contract, it must provide stage.loadSubMovie
    stage.loadSubMovie = function(movieUrl, callback, movieInstance) {

      movieUrl = this.assetBaseUrl.resolveUri(movieUrl);

      var subMovie = movieInstance || new env.Movie();
      var subEnvironment = stage.getSubMovieEnvironment(subMovie, movieUrl);
      var subEnvExports = subEnvironment.exports;
      var functionArgNames = [];
      var functionArgValues = [];

      subMovie.root = this;

      /*
      We want to pass all subEnvExports so that they're directly accessible within
      the scope of the subMovie script.
      E.g. so a user can type Shape.rect() instead of bonsai.Shape.rect()
      Essentially, we're constructing an argument list. If done manually
      it would look like this:
        Function('bonsai', 'Shape', 'gradient', ...)
          .call(subMovie, subEnvExports.Shape, subEnvExports.gradient, ...)
      */

      for (var i in subEnvExports) {
        functionArgNames.push(i);
        functionArgValues.push(subEnvExports[i]);
      }

      loadUrl(movieUrl, function(code) {
        functionArgNames.push(code); // Actual code to execute
        Function.apply(null, functionArgNames).apply(subMovie, functionArgValues);
        callback.call(subMovie, null, subMovie);
      }, function(error) {
        callback.call(subMovie, error + ':' + movieUrl);
      });

    };

    stage.unfreeze();
    messageChannel.notifyRenderer({command:"isReady"});
  };
});
