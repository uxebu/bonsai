'use strict';

var requirejs = require('../context/node/requirejs').requirejs;
var NodeContext = require('../context/node/context');
var vm = require('vm');

// requirejs is sync in node
requirejs([
  'bonsai/bootstrapper/player',
  'bonsai/renderer/noop/noop'
], function(player, NoopRenderer) {
  module.exports = player;
  player.requirejs = requirejs;

  player.Renderer = NoopRenderer;
  player.setup({
    baseUrl: require.main.filename,
    runnerContext: NodeContext.bind(null, vm),
    runnerUrl: null
  });
});
