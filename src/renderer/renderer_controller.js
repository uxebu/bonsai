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
  var forEach = tools.forEach;

  /**
   * Encapsulates Renderer [resides in same script context as Bootstrapper]
   *
   * @class
   * @mixes EventEmitter
   * @param {Renderer} renderer The renderer to use.
   * @param {AssetController} assetController The RunnerContext controller to use.
   * @param {RunnerContext} runnerContext The runner-context to use.
   * @param {AnimationFrame} animationFrame The clock that is used for animations.
   * @param {URI} baseUrl The base URL to use to resolve resource paths.
   */
  function RendererController(renderer, assetController, runnerContext, animationFrame, options) {

    this.renderer = renderer;
    this.assetController = assetController;
    this.runnerContext = runnerContext;
    this._movieOptions = this._cleanOptionsRef(options || {});
    this.baseUrl = URI.parse(options.baseUrl);
    this._animationFrame = animationFrame;
    this.isReady = false;
    this.isRunnerReady = false;
    this.areRunnerDependenciesLoaded = false;
    this._drawingInstructions = [];
    this._pendingMessages = [];
    this._runnerFrameMessage = this._cleanRunnerFrameMessageRef({
      userevents: []
    });

    animationFrame.setFrameCallback(hitch(this, this._handleFrame));

    // Bind to assetController, tunnel assetLoaded event through to RunnerContext:
    assetController.on('assetLoadSuccess', this, function(data) {
      this.post('assetLoadSuccess', data);
    });
    assetController.on('assetLoadError', this, function(data) {
      this.post('assetLoadError', data);
    });

    if (renderer.isReady) {
      this._setupLoadedAndEmitStart();
    } else {
      renderer.on('ready', this, function() {
        this._setupLoadedAndEmitStart();
      });
    }
    renderer.on('userevent', this, function onUserevent(event, targetId, relatedTargetId, underPointerIds) {
      this._runnerFrameMessage.userevents.push({
        event: event,
        targetId: targetId,
        relatedTargetId: relatedTargetId,
        objectsUnderPointerIds: underPointerIds
      });
      animationFrame.request();
    });

    runnerContext.init(options);
    runnerContext.on('message', this, this.handleEvent);

  }

  var proto = RendererController.prototype = {

    _loadRunnerDependencies: function() {

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
              rendererController._onRunnerDependenciesLoaded();
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
          rendererController._onRunnerDependenciesLoaded();
        });
      } else if (options.code) {
        runnerContext.run(options.code);
        rendererController._onRunnerDependenciesLoaded();
      }

      function loadAll(urls, cb) {
        var nUrls = urls.length,
            nLoaded = 0;
        runnerContext.on('scriptLoaded', function(url) {
          if (++nLoaded === nUrls) {
            cb();
          }
        });
        forEach(urls, function(url) {
          runnerContext.load(rendererController.baseUrl.resolveUri(url).toString());
        });
      }
    },

    initRenderer: function() {
      this._postOptions();
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
    _cleanOptionsRef: function(options) {
      var renderer = this.renderer;
      options.framerate = +options.framerate || void 0;
      options.width = renderer.width;
      options.height = renderer.height;
      return options;
    },

    _cleanRunnerFrameMessageRef: function(runnerFrameMessage) {
      runnerFrameMessage.userevents.length = 0;
      return runnerFrameMessage;
    },

    _onRunnerDependenciesLoaded: function() {
      this.areRunnerDependenciesLoaded = true;
      this._setupLoadedAndEmitStart();
      // emit load event
      this.emit('load');
    },

    _handleFrame: function(time) {
      // 1. Render current frame
      if (this._drawingInstructions.length)
        this.renderer.render(this._drawingInstructions);
      // 2. Request for new computed frame instructions from Runner
      this.post('requestFrameInstructions', this._runnerFrameMessage);
      // 2. Cleanup frame based messages
      this._cleanRunnerFrameMessageRef(this._runnerFrameMessage);
    },

    /**
     * Terminates RunnerContext and renderer.
     *
     * Use this before deleting references to the instance. Otherwise the
     * RunnerContext will not be terminated and the rendering is not removed.
     */
    destroy: function() {
      this._animationFrame.cancel();
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
      this._animationFrame.cancel();
      return this;
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
          this._drawingInstructions = messageData;
          this._animationFrame.request();
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
          this.isRunnerReady = true;
          this._postOptions();
          this._loadRunnerDependencies();
          break;
      }
    },

    _postOptions: function() {
      if (this.isRunnerReady) {
        var options = tools.mixin({}, this._movieOptions);
        // Make sure we transport an already-toString'd version of the URI instance
        options.baseUrl = options.baseUrl && options.baseUrl.toString();
        options.assetBaseUrl = options.assetBaseUrl && options.assetBaseUrl.toString();
        this.post('options', options);
      }

      return this;
    },

    /**
     * All necessary dependencies are loaded and setup is finished. Both,
     * Renderer and Runner are ready to go. Let's start the Movie.
     * @return {undefined}
     */
    _setupLoadedAndEmitStart: function() {
      var renderer = this.renderer;
      var animationFrame = this._animationFrame;

      if (!renderer.isReady() || !this.areRunnerDependenciesLoaded)
        return;

      this.isReady = true;

      this._sendEnvData();

      // First time requesting a frame from Renderer
      animationFrame.request();

      this.emit('start');
    },

    /**
     * Continues playback. If frame is passed, jump to that frame before.
     *
     * @param {number|string} [frame] A frame number or time expression.
     * @returns {this}
     */
    play: function(frame) {
      this.unfreeze();
      return this;
    },

    /**
     * Posts a command to the RunnerContext.
     *
     * @param {String} command A command name
     * @param {*} [data] Data to post alongside the command.
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
          var listener = hitch(this, this._sendEnvData);
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
      var pendingMessages = this._pendingMessages;

      /*
        Before the runner context has loaded and is ready, pendingMessage is an
        array. Afterwards, pendingMessage is set to null and the test will fail.
      */
      if (pendingMessages) {
        // the context is not ready yet, queue all messages;
        // pendingMessages is set to null as soon as the context can receive
        pendingMessages.push(arguments);
        return this;
      }

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
      this.freeze();
      return this;
    },

    /**
     * Unfreezes the movie, i.e. starts playback and continues all animations.
     *
     * @returns {this} The instance.
     */
    unfreeze: function() {
      if (this.isReady)
        this._animationFrame.request();
      return this;
    }
  };

  tools.mixin(proto, EventEmitter);

  return RendererController;
});
