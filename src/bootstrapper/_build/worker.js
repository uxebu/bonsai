/**
 * Entry module for building bonsai for the iframe environment.
 */
define([
  '../player',
  '../../message_channel',
  '../context/worker/bootstrap',
  '../context/worker/context',
  '../../renderer/svg/svg',
  '../../tools',
  '../util'
], function(player, MessageChannel, bootstrapWorker, WorkerRunnerContext, SvgRenderer, tools, bootstrapUtil) {
  'use strict';

  if(typeof importScripts != 'undefined') {
    // init worker bootstrap
    var messageChannel;

    var notifyRenderer = function(message) {postMessage(message);};
    var onMessage = function(message) {messageChannel.notify(message.data);};
    var disconnect = function() {
      removeEventListener('message', onMessage);
      messageChannel = null;
    };

    messageChannel = new MessageChannel(notifyRenderer, disconnect);
    addEventListener('message', onMessage);
    bootstrapWorker(messageChannel);
  } else {
    window['bonsai'] = player;

    var scripts = tools.map(document.getElementsByTagName('script'), function(script) {
      return script.src;
    });

    player.Renderer = SvgRenderer;
    player.setup({
      baseUrl: tools.baseUri(document),
      runnerContext: WorkerRunnerContext,
      runnerUrl: bootstrapUtil.chooseRunnerUrl(scripts) || 'bonsai.js'
    });
  }
});
