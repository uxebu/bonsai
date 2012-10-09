define([
  '../renderer/renderer_controller',
  '../asset/asset_controller',
  '../tools',
  '../uri',
  '../version'
],
function(RendererController, AssetController, tools, URI, version) {
  'use strict';

  var player = {
    version: version,

    AssetController: AssetController,
    RendererController: RendererController,

    defaultRunnerOptions: {},
    _addDefaultRunnerOptions: function(options) {
      var defaultRunnerOptions = this.defaultRunnerOptions;
      for (var key in defaultRunnerOptions) {
        if (!(key in options)) {
          options[key] = defaultRunnerOptions[key];
        }
      }
    },

    _baseUrl: null,
    baseUrl: function() {
      return this._baseUrl || (this._baseUrl = URI.parse(tools.baseUri(document)));
    },

    createRenderer: function(node, width, height, options) {
      if (!options) {
        options = {};
      }

      // Only pass a resolved baseUrl if the user passed a baseUrl via run/setup:
      this._addDefaultRunnerOptions(options);
      var baseUrl = this.baseUrl();
      options.baseUrl = 'baseUrl' in options ?
        baseUrl.resolveUri(options.baseUrl).toString() :
        baseUrl.toString();
      if ('assetBaseUrl' in options) {
        options.assetBaseUrl = baseUrl.resolveUri(options.assetBaseUrl).toString();
      }
      if ('url' in options) {
        options.url = baseUrl.resolveUri(options.url).toString();
      }
      if (tools.isArray(options.urls)) {
        options.urls = tools.forEach(options.urls, function(url, i, urls) {
          urls[i] = baseUrl.resolveUri(url).toString();
        });
      }
      if (typeof options.code === 'function') {
        options.code = '(' + options.code.toString() + '());';
      }

      var doc = typeof document === 'undefined' ? null : document;
      var context = new this.RunnerContext(this.runnerUrl, doc, options.baseUrl);
      var renderer = new this.Renderer(node, width, height, {
        allowEventDefaults: options.allowEventDefaults,
        fpsLog: options.fpsLog,
        disableContextMenu: options.disableContextMenu
      });
      var assetController = new this.AssetController();

      return new this.RendererController(renderer, assetController, context, options);
    },

    /**
     * Loads a bonsai movie and embeds it into a HTML document.
     *
     * @param {HTMLElement} node The html element to replace with the movie
     * @param {string} url The URL to the bonsai script to load
     * @param {Number} [options.width] The width of the movie
     * @param {Number} [options.height] The height of the movie
     * @param {Number} [options.framerate=30] The framerate (fps) of the movie
     * @param {Array} [options.plugins] Array of plugins URLs
     * @param {Array} [options.urls] Array of movie URLs (runs after plugins)
     * @param {Array} [options.code] Movie code (runs after URLs)
     * @returns {Movie}
     */
    run: function(node, url, options) {

      if (url && typeof url != 'string') {
        options = url;
      } else {
        options || (options = {});
        options.url = url;
      }

      var size = this._getSize(node, options.width, options.height),
          rendererController = this.createRenderer(node, size.width, size.height, options),
          runnerContext = rendererController.runnerContext;

      rendererController.initRenderer();

      return rendererController;
    },

    /**
     * Change the infrastructure setup for all following calls to `run()`
     *
     * @param {Function} [options.runner] The runner to instantiate.
     * @param {string} [options.runnerUrl] The url that the runner should use
     *    for bootstrapping.
     * @returns {this} The instance.
     */
    setup: function(options) {
      if ('runnerContext' in options) {
        this.RunnerContext = options.runnerContext;
      }
      if ('runnerUrl' in options) {
        this.runnerUrl = options.runnerUrl;
      }
      if ('baseUrl' in options) {
        this._baseUrl = URI.parse(options.baseUrl);
      }
      if ('renderer' in options) {
        this.Renderer = options.renderer;
      }
      return this;
    },

    _getSize: function(domNode, width, height) {
      var computedStyle, defaultView;
      if (!width || !height) {
        if (domNode) {
          defaultView = domNode.ownerDocument.defaultView;
          computedStyle = defaultView.getComputedStyle(domNode, null);

          if (!width) {
            width = domNode.clientWidth -
              parseInt(computedStyle.paddingLeft) -
              parseInt(computedStyle.paddingRight);
          }

          if (!height) {
            height = domNode.clientWidth -
              parseInt(computedStyle.paddingLeft) -
              parseInt(computedStyle.paddingRight);
          }
        } else {
          width = height = 0;
        }
      }

      return {width: width, height: height};
    }
  };

  return player;
});
