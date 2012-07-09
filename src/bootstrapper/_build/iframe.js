/**
* Entry module for building bonsai for the iframe environment.
*/
define([
  '../player',
  '../context/iframe/bootstrap',
  '../context/iframe/context',
  '../../renderer/svg/svg',
  '../../tools'
], function(player, bootstrapIframe, IframeRunnerContext, SvgRenderer, tools) {
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

    var envUrl = 'bonsai.js';
    var scripts = document.getElementsByTagName('script');
    for (var i=0, m = scripts.length; i < m; i++) {
      if(/bonsai[.](?:iframe[.])?(?:min[.])?js(?:$|\?|#)/.test(scripts[i].src)) {
        envUrl = scripts[i].src;
      }
    }

    player.Renderer = SvgRenderer;
    player.setup({
      baseUrl: tools.baseUri(document),
      runnerContext: IframeRunnerContext,
      runnerUrl: envUrl
    });
  }
});
