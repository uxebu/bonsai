/**
 * Entry module for building bonsai for the iframe environment.
 */
define([
  '../player',
  '../../message_channel',
  '../context/worker/bootstrap',
  '../context/worker/context',
  '../../renderer/svg/svg',
  '../../tools'
], function(player, MessageChannel, bootstrapWorker, WorkerRunnerContext, SvgRenderer, tools) {
  'use strict';

  if(typeof importScripts != 'undefined') {
    // init worker bootstrap
    var messageChannel;

    function notifyRenderer(message) {
      postMessage(message);
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
  } else {
    window['bonsai'] = player;

    var workerLocation = 'bonsai.js';
    var scripts = document.getElementsByTagName('script');
    for (var i = 0, m = scripts.length; i < m; i++) {
      if(/bonsai[.](?:min[.])?js(?:$|\?|#)/.test(scripts[i].src)) {
        workerLocation = scripts[i].src;
      }
    }

    player.Renderer = SvgRenderer;
    player.setup({
      baseUrl: tools.baseUri(document),
      runnerContext: WorkerRunnerContext,
      runnerUrl: workerLocation
    });
  }
});
