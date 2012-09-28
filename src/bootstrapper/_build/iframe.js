/**
* Entry module for building bonsai for the iframe environment.
*/
define([
  '../player',
  '../context/iframe/bootstrap',
  '../context/iframe/context',
  '../../renderer/svg/svg',
  '../../tools',
  '../util'
], function(player, bootstrapIframe, IframeRunnerContext, SvgRenderer, tools, bootstrapUtil) {
  'use strict';

  if(typeof window != 'undefined' && window.messageChannel) {

    // This needs to execute async (setTimeout:1) so that
    // IFrameContext.init finishes before this executes:
    setTimeout(function() {
      var messageChannel = window.messageChannel;
      delete window.messageChannel;
      bootstrapIframe(messageChannel, window);
    }, 1);

  } else {
    window['bonsai'] = player;

    var scripts = tools.map(document.getElementsByTagName('script'), function(script) {
      return script.src;
    });

    player.Renderer = SvgRenderer;
    player.setup({
      baseUrl: tools.baseUri(document),
      runnerContext: IframeRunnerContext,
      runnerUrl: bootstrapUtil.getBlobUrl(__bonsaiRunnerCode__) || bootstrapUtil.chooseRunnerUrl(scripts, /iframe/) || 'bonsai.js'
    });
  }
});
