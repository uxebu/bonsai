/**
 *
 *
 * @exports renderer_controller
 */
define([
  '../tools',
  '../event_emitter',
  '../uri'
],
function(tools, EventEmitter, URI) {
  'use strict';

  var hitch = tools.hitch;

  /**
   * Encapsulates Renderer [resides in same script context as Bootstrapper]
   *
   * @class
   * @mixes EventEmitter
   * @param {Renderer} renderer The renderer to use.
   * @param {AssetController} assetController The RunnerContext controller to use.
   * @param {RunnerContext} runnerContext The runner-context to use.
   * @param {URI} baseUrl The base URL to use to resolve resource paths.
   */
  function RendererController(renderer, assetController, runnerContext, options) {

    this.renderer = renderer;
    this.assetController = assetController;
    this.runnerContext = runnerContext;
    this._movieOptions = this._cleanOptions(options);
    this.baseUrl = URI.parse(options.baseUrl);

    runnerContext.on('message', this, this.handleEvent);

    // Bind to assetController, tunnel assetLoaded event through to RunnerContext:
    assetController.on('assetLoadSuccess', this, function(data) {
      this.post('assetLoadSuccess', data);
    });
    assetController.on('assetLoadError', this, function(data) {
      this.post('assetLoadError', data);
    });

    // Bind to renderer, tunnel user events through to RunnerContext:
    this.renderer.on('userevent', this, function(event, targetId) {
      this.post('userevent', {
        event: event,
        targetId: targetId
      });
    });

    this.renderer.on('canRender', tools.hitch(this, this.postAsync, 'canRender'));

    runnerContext.init(options);

  }

  var proto = RendererController.prototype = {

    _onRunnerContextReady: function() {

      var options = this._movieOptions,
          rendererController = this,
          runnerContext = this.runnerContext;

      // Runs/Loads the scripts within the RunnerContext (iframe/worker/..)

      if (options.url) {
        (options.urls || (options.urls = [])).push(options.url);
      }

      if (options.plugins && options.plugins.length) {
        loadAll(options.plugins, function() {
          runnerContext.notifyRunner({
            command: 'exposePluginExports'
          });
          if (options.urls) {
            loadAll(options.urls, function() {
              if (options.code) {
                runnerContext.run(options.code);
              }
              rendererController.emit('load');
            });
          } else {
            if (options.code) {
              runnerContext.run(options.code);
            }
          }
        });
      } else if (options.urls) {
        loadAll(options.urls, function() {
          if (options.code) {
            runnerContext.run(options.code);
          }
          rendererController.emit('load');
        });
      } else if (options.code) {
        runnerContext.run(options.code);
        rendererController.emit('load');
      }

      function loadAll(urls, cb) {
        var nUrls = urls.length,
            nLoaded = 0;
        tools.forEach(urls, function(url) {
          runnerContext.load(rendererController.baseUrl.resolveUri(url).toString());
        });
        runnerContext.on('scriptLoaded', function(url) {
          if (++nLoaded === nUrls) {
            cb();
          }
        });
      }
    },

    initRenderer: function() {
      this._sendOptions();
      return this;
    },

    /**
     * Creates a clean set of options for the RunnerContext.
     *
     * @param {Object} options Options for the RunnerContext.
     * @param {boolean} [options.pluginDebug] Whether to debug plugins.
     * @param {string} [options.pluginUrl] URL to lookup plugins.
     * @param {Array} [options.plugins] Array of plugins to load.
     * @param {number} [options.framerate] The desired frame rate.
     * @returns {Object}
     */
    _cleanOptions: function(options) {
      options || (options = {});
      var renderer = this.renderer;
      options.framerate = +options.framerate || void 0;
      options.width = renderer.width;
      options.height = renderer.height;
      return options;
    },


    /**
     * Terminates RunnerContext and renderer.
     *
     * Use this before deleting references to the instance. Otherwise the
     * RunnerContext will not be terminated and the rendering is not removed.
     */
    destroy: function() {
      this.renderer.destroy();
      delete this.renderer;
      this.runnerContext.destroy();
      delete this.runnerContext;
      return this;
    },

    /**
     * This method is called when a debug message is received.
     *
     * @param items
     */
    debug: function (items) {
      console.log.apply(console, ['RUNNER DEBUG:'].concat(items));
    },

    /**
     * Freezes the movie, i.e. stops playback and all animations.
     *
     * @returns {this} The instance.
     */
    freeze: function() {
      return this.post('freeze');
    },

    /**
     * Event handling method. Used to communicate with the RunnerContext.
     *
     * @private
     * @param {MessageEvent} The message event to handle.
     */
    handleEvent: function(message) {
      var messageData = message.data;
      switch (message.command) {
        case 'render':
          this.currentFrame = message.frame;
          this.renderer.render(messageData);
          break;
        case 'renderConfig':
          this.renderer.config(messageData);
          break;
        case 'play':
        case 'stop':
        case 'freeze':
        case 'unfreeze':
          this.emit(message.command, messageData);
          break;
        case 'debug':
          this.debug(messageData);
          break;
        case 'loadAsset':
          this.assetController.load(messageData);
          break;
        case 'destroyAsset':
          this.assetController.destroy(messageData.id);
          break;
        case 'message':
          if ('category' in message) {
            this.emit('message:' + message.category, messageData);
          } else {
            this.emit('message', messageData);
          }
          break;
        case 'isReady':
          this.isRunnerListening = true;
          this._sendOptions();
          this._onRunnerContextReady();
          this.emit('start');
          break;
      }
    },

    _sendOptions: function() {
      if (this.isRunnerListening) {
        if (!this.isReady) {
          this._sendEnvData();
          this.isReady = true;
        }
        var options = tools.mixin({}, this._movieOptions);
        // Make sure we transport an already-toString'd version of the URI instance
        options.baseUrl = options.baseUrl && options.baseUrl.toString();
        options.assetBaseUrl = options.assetBaseUrl && options.assetBaseUrl.toString();
        this.post('options', options);
      }

      return this;
    },

    /**
     * Continues playback. If frame is passed, jump to that frame before.
     *
     * @param {number|string} [frame] A frame number or time expression.
     * @returns {this}
     */
    play: function(frame) {
      return this.post('play', frame);
    },

    /**
     * Posts a command to the RunnerContext.
     *
     * @param {String} command A command name
     * @param {mixed} [data] Data to post alongside the command.
     * @returns {this}
     */
    post: function(command, data) {
      this.runnerContext.notifyRunner({command: command, data: data});

      return this;
    },

    /**
     * Like #post: Posts a command to the RunnerContext. Guaranteed to be asynchronous.
     *
     * @param {String} command A command name
     * @param {mixed} [data] Data to post alongside the command.
     * @returns {this}
     */
    postAsync: function(command, data) {
      this.runnerContext.notifyRunnerAsync({command: command, data: data});
      return this;
    },

    /**
     * Setups sender and sends env data to the RunnerContext
     */
    _sendEnvData: function() {

      if (!this._isEnvSenderSetup) {
        if (typeof window !== 'undefined') {
          var listener = tools.hitch(this, this._sendEnvData);
          window.addEventListener('resize', listener, false);
          window.addEventListener('scroll', listener, false);
        }
        this._isEnvSenderSetup = true;
      }

      var offset = this.renderer.getOffset();

      if (typeof window !== 'undefined') {
        this.post('env', {
          windowHeight: window.innerHeight,
          windowWidth: window.innerWidth,
          windowScrollX: Math.max(
            document.body.scrollLeft,
            document.documentElement.scrollLeft
          ),
          windowScrollY: Math.max(
            document.body.scrollTop,
            document.documentElement.scrollTop
          ),
          offsetX: offset.left,
          offsetY: offset.top
        });
      }
    },

    /**
     * Sends a message to the RunnerContext / stage
     *
     * @param [category=null] The message category
     * @param messageData
     * @returns {this} The instance
     */
    sendMessage: function(category, messageData) {
      if (arguments.length < 2) {
        this.post('message', category);
      } else {
        this.runnerContext.notifyRunner({
          command: 'message',
          category: category,
          data: messageData
        });
      }
      return this;
    },

    /**
     * Stops playback. If frame is passed, go to that frame before.
     *
     * @param {number|string} [frame] A frame number or time expression.
     * @returns {this}
     */
    stop: function(frame) {
      return this.post('stop', frame);
    },

    /**
     * Unfreezes the movie, i.e. starts playback and continues all animations.
     *
     * @returns {this} The instance.
     */
    unfreeze: function() {
      return this.post('unfreeze');
    }
  };

  tools.mixin(proto, EventEmitter);

  return RendererController;
});
