define([
  '../../../runner/stage',
  '../script_loader',
  '../../../tools',
  '../../../runner/require_wrapper'
], function(Stage, makeScriptLoader, tools, requireWrapper) {
  'use strict';

  return function(messageChannel, iframeWindow) {

    var doc = iframeWindow.document;

    var loader = makeScriptLoader(function(url, cb) {
      var script = doc.createElement('script');
      script.src = url;
      script.onload = function() { cb(null); };
      script.onerror = function() { cb('Could not load: ' + url); };
      doc.documentElement.appendChild(script);
    });

    var stage = new Stage(messageChannel);
    var env = stage.env.exports;

    // Expose bonsai API in iframe window
    tools.mixin(iframeWindow, env);

    // wrap AMD loader (requirejs was loaded and configured in dev-mode already)
    if (!iframeWindow.require) {
      Object.defineProperty(iframeWindow, 'require', requireWrapper);
    }

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
      }
    });

    stage.unfreeze();
    messageChannel.notifyRenderer({command:"isReady"});
  };
});
