/*
 * Module is used to initialize the iframe runner during development
 * time (for build see: `_build/iframe.js`):
 *
 *    frameDoc.write('<script src="' + THIS.FILE + '"></script>');
 *
 * Requirement: within this iframe `requirejs` needs to be injected.
 */

if (window.parent !== window && window.isBonsaiMovie) {

  // This needs to execute async (setTimeout:1) so that
  // IFrameContext.init finishes before this executes:
  setTimeout(function() {

    var options = window.options;
    delete window.options;

    var s = document.createElement('script');
    s.onload = function() {
      require.config(options.requireConfig);
      require([
        'bonsai/bootstrapper/context/iframe/bootstrap'
      ], function(bootstrapIframe) {
        var messageChannel = window.messageChannel;
        delete window.messageChannel;
        bootstrapIframe(messageChannel, window);
      });
    };
    s.src = options.requireUrl;
    document.documentElement.appendChild(s);

  }, 1);

} else {
  define([
    '../player',
    '../../tools',
    '../context/iframe/context',
    '../../renderer/svg/svg',
    '../../require_config',
    'module'
  ], function(player, tools, IFrameRunnerContext, SvgRenderer, requireConfig, module) {
    'use strict';

    player.Renderer = SvgRenderer;
    player.setup({
      baseUrl: tools.baseUri(document),
      runnerContext: IFrameRunnerContext,
      runnerUrl: module.uri
    });
    player.defaultRunnerOptions.requireConfig = requireConfig.config;
    player.defaultRunnerOptions.requireUrl = requireConfig.url;

    window['bonsai'] = player;
    return player;
  });
}

