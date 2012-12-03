/**
* Entry module for building bonsai for  a common environment.
*
* It takes care to select the best-suited runner (iframe or worker) environment.
*/
define([
  '../player',
  '../../message_channel',
  '../context/iframe/bootstrap',
  '../context/iframe/context',
  '../context/worker/bootstrap',
  '../context/worker/context',
  '../../renderer/svg/svg',
  '../../tools',
  '../util'
], function(player, MessageChannel, bootstrapIframe, IframeRunnerContext, bootstrapWorker, WorkerRunnerContext, SvgRenderer, tools, bootstrapUtil) {
  'use strict';

  if(typeof window != 'undefined' && window.messageChannel) {

    // This needs to execute async (setTimeout:1) so that
    // IFrameContext.init finishes before this executes:
    setTimeout(function() {
      var messageChannel = window.messageChannel;
      delete window.messageChannel;
      bootstrapIframe(messageChannel, window);
    }, 1);

  } else if(typeof importScripts != 'undefined') {
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

    player.Renderer = SvgRenderer;
    player.IframeRunnerContext = IframeRunnerContext;
    player.WorkerRunnerContext = WorkerRunnerContext;

    var originalPlayerRun = player.run;
    player.run = tools.hitch(player, function(node, url, options) {
      var baseUrl = player._baseUrl || tools.baseUri(document);
      var iife = [
        '(function(baseUrl, requireConfig){this.baseUrl = baseUrl;this.requireConfig=requireConfig;', 
        '(' + __bonsaiRunnerCode__ + ')();})',
        '("' + baseUrl +'", ' + JSON.stringify(require.s.contexts._.config) + ');'
      ].join('');
      var runnerUrl = player.runnerUrl || bootstrapUtil.getUrl(iife);
      player.setup({
        baseUrl: baseUrl,
        runnerContext: player.RunnerContext || (runnerUrl ? WorkerRunnerContext : IframeRunnerContext),
        runnerUrl: runnerUrl || iife
      });
      return originalPlayerRun.apply(player, arguments);
    });

  }
});
