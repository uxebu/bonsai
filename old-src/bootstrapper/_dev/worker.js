/*
 * Module is used to initialize the worker runner during development
 * time (for build see: `_build/worker.js`)
 *
 * This file also loads `requirejs` into the worker context.
 */
'use strict';

// worker / runner environment
if (typeof importScripts !== 'undefined') {

  (function() {
    var options = JSON.parse(decodeURIComponent(location.hash.slice(1)));
    // load requirejs into worker env
    importScripts(options.requireUrl);

    require.config(options.requireConfig);

    require([
      'bonsai/message_channel',
      'bonsai/bootstrapper/context/worker/bootstrap'
    ], function(MessageChannel, bootstrapWorker) {
      // init worker bootstrap
      var messageChannel;

      function notifyRenderer(message) {
        self.postMessage(message);
      }

      function onMessage(message) {
        messageChannel.notify(message.data);
      }

      function disconnect() {
        removeEventListener('message', onMessage);
        messageChannel = null;
      }

      messageChannel = new MessageChannel(notifyRenderer, disconnect);
      addEventListener('message', onMessage);
      bootstrapWorker(messageChannel);
    });

  }());
} else {
  define([
    '../player',
    '../../tools',
    '../context/worker/context',
    '../../uri',
    '../../renderer/svg/svg',
    '../../require_config',
    'module'
  ], function(player, tools, WorkerContext, URI, SvgRenderer, requireConfig, module) {

    var runnerUrl = URI.parse(module.uri);
    var baseUrl = URI.parse(tools.baseUri(document));

    player.Renderer = SvgRenderer;
    player.setup({
      baseUrl: baseUrl.toString(),
      runnerContext: WorkerContext,
      runnerUrl: runnerUrl.toString()
    });
    player.defaultRunnerOptions.requireUrl =
      baseUrl.resolveUri(requireConfig.url).toString();
    var config = requireConfig.config;
    if (config && config.baseUrl) {
      config.baseUrl = baseUrl.resolveUri(config.baseUrl).toString();
    }
    player.defaultRunnerOptions.requireConfig = config;

    window['bonsai'] = player;
    return player;
  });
}
