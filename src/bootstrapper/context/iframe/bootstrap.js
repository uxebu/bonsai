define([
  '../../../runner/stage',
  '../script_loader',
  '../../../tools'
], function(Stage, makeScriptLoader, tools) {
  'use strict';

  function exposePlugins(isGlobal, target, mixin) {
    for (var i in mixin) {
      if (i === 'stage') {
        continue; // don't allow stage to be overwritten
      }
      if (isGlobal) {
        // Make sure any global assignment errors don't prevent other
        // properties from being exposed. (e.g. trying to expose `Infinity`)
        var descriptor = Object.getOwnPropertyDescriptor(target, i);
        if (!descriptor || descriptor.writable) {
          target[i] = mixin[i];
        }
      } else {
        target[i] = mixin[i];
      }
    }
  }

  return function(messageChannel, iframeWindow) {

    var doc = iframeWindow.document;

    var loader = makeScriptLoader(function(url, cb) {
      var script = doc.createElement('script');
      script.src = url;
      script.onload = function() { cb(null); };
      script.onerror = function() { cb('Could not load: ' + url); };
      doc.documentElement.appendChild(script);
    });

    iframeWindow.load = function(url, cb) { return loader.load(url, cb); };
    iframeWindow.wait = function() { return loader.wait(); };
    iframeWindow.done = function() { return loader.done(); };

    var stage = new Stage(messageChannel);
    var env = stage.env.exports;

    // Expose bonsai API in iframe window
    tools.mixin(iframeWindow, env);
    var globalExports = iframeWindow.exports = {}; // for plugins

    // As per the boostrap's contract, it must provide stage.loadSubMovie
    stage.loadSubMovie = function(movieUrl, callback, movieInstance) {

      var iframe = doc.createElement('iframe');
      doc.documentElement.appendChild(iframe);
      var subWindow = iframe.contentWindow;
      var subMovie = movieInstance || new env.Movie();
      var subEnvironment = stage.getSubMovieEnvironment(subMovie, movieUrl);

      // Need to call open()/close() before exposing anything on the window
      // (Opera would initiate a separate script context if we did it after)
      subWindow.document.open();
      subWindow.document.close();

      // Expose bonsai on sub-movie:
      tools.mixin(subWindow, subEnvironment.exports);

      // Expose top-level plugin exports on every sub-movie:
      exposePlugins(false, subWindow.bonsai, globalExports);
      exposePlugins(true, subWindow, globalExports);

      subWindow.stage = subMovie;
      subMovie.root = this;

      var subLoader = makeScriptLoader(function(url, cb) {
        var script = subWindow.document.createElement('script');
        script.src = url;
        script.onload = function() { cb(null); };
        script.onerror = function() { cb('Could not load: ' + url); };
        subWindow.document.documentElement.appendChild(script);
      });

      subLoader.load(stage.assetBaseUrl.resolveUri(movieUrl), function(err) {
        if (err) {
          callback.call(subMovie, err);
        } else {
          callback.call(subMovie, null, subMovie);
        }
      });

    };

    messageChannel.on('message', function(message) {
      if (message.command === 'loadScript') {
        loader.load(message.url, function() {
          messageChannel.notify({
            command: 'scriptLoaded',
            url: message.url
          })
        });
      } else if (message.command === 'runScript') {
        loader.load('data:text/javascript,' + encodeURIComponent(message.code));
      } else if (message.command === 'exposePluginExports') {
        exposePlugins(false, env, globalExports);
        exposePlugins(true, iframeWindow, globalExports);
      }
    });

    stage.unfreeze();
    messageChannel.notifyRenderer({command:"isReady"});
  };
});
