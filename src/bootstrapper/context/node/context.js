'use strict';

var fs = require('fs');
var path = require('path');
var requirejs = require('./requirejs');

requirejs.requirejs([
  'bonsai/event_emitter',
  'bonsai/tools',
  'bonsai/message_channel',
  'bonsai/runner/stage',
  'bonsai/bootstrapper/context/script_loader'
], function(EventEmitter, tools, MessageChannel, Stage, makeScriptLoader) {
  function NodeContext(vm, _, __, baseUrl) {
    this.vm = vm;
    this.baseUrl = baseUrl;
    this.messageChannel = null;
    this.vmContext = null;
    this.timeouts = [];
    this.intervals = [];

    this.timeouts.remove = this.intervals.remove = function(id) {
      var i = this.indexOf(id);
      if (i !== -1) {
        this.splice(i, 1);
      }
    };
  }

  NodeContext.prototype = tools.mixin({
    MessageChannel: MessageChannel,

    destroy: function() {
      // freeze stage
      this.notifyRunner({command: 'freeze'});

      // destroy message channel
      this.messageChannel.destroy();
      delete this.messageChannel;

      this.removeAllListeners();

      this.timeouts.forEach(clearTimeout);
      this.intervals.forEach(clearInterval);
      this.timeouts = this.intervals = null;

      delete this.vmContext;
      delete this.vm;
      delete this.scriptLoader;
    },

    init: function(options) {

      var messageChannel = this.messageChannel =
        new this.MessageChannel(tools.hitch(this, this.notify), function() {});
      var self = this;

      var vmContext = this.vmContext = this.vm.createContext({
        clearInterval: function(id) {
          self.intervals.remove(id);
          return clearInterval(id);
        },
        clearTimeout: function(id) {
          self.timeouts.remove(id);
          return clearTimeout(id);
        },
        setInterval: function() {
          var id = setInterval.apply(null, arguments);
          self.intervals.push(id);
          return id;
        },
        setTimeout: function() {
          var callback = arguments[0];
          arguments[0] = function() {
            self.timeouts.remove(id);
            return callback.apply(this, arguments);
          }
          var id = setTimeout.apply(null, arguments);
          self.timeouts.push(id);
          return id;
        }
      });

      var scriptLoader = this.scriptLoader = makeScriptLoader(
        this._importScript.bind(null, this.vm, vmContext)
      );
      var stage = this.initVmContext(vmContext, messageChannel, scriptLoader);

      this.initStage(stage);
      this.startMovie(stage);
    },

    initStage: function(stage) {
      var context = this;
      var env = stage.env;
      stage.loadSubMovie = function(movieUrl, callback, movieInstance) {
        movieUrl = this.assetBaseUrl.resolveUri(movieUrl);

        var subMovie = movieInstance || new env.Movie();
        var subEnvironment = stage.getSubMovieEnvironment(subMovie, movieUrl);
        var subEnvExports = subEnvironment.exports;
        var functionArgNames = [];
        var functionArgValues = [];

        subMovie.root = this;

        /*
         We want to pass all subEnvExports so that they're directly accessible within
         the scope of the subMovie script.
         E.g. so a user can type Shape.rect() instead of bonsai.Shape.rect()
         Essentially, we're constructing an argument list. If done manually
         it would look like this:
         Function('bonsai', 'Path', 'gradient', ...)
         .call(subMovie, subEnvExports.Shape, subEnvExports.gradient, ...)
         */

        for (var i in subEnvExports) {
          functionArgNames.push(i);
          functionArgValues.push(subEnvExports[i]);
        }

        context._loadUrl(movieUrl, function(err, code) {
          if (err) {
            callback.call(subMovie, err);
          } else {
            functionArgNames.push(code); // Actual code to execute
            Function.apply(null, functionArgNames).apply(subMovie, functionArgValues);
            callback.call(subMovie, null, subMovie);
          }
        });
      }
    },

    initVmContext: function(context, messageChannel, scriptLoader) {
      var stage = context.stage = new Stage(messageChannel);

      // expose bonsain API in vm context
      var env = stage.env.exports;
      tools.mixin(context, env);
      context.exports = {}; // for plugins

      context.load = function(url, cb) { return scriptLoader.load(url, cb); };
      context.wait = function() { return scriptLoader.wait(); };
      context.done = function() { return scriptLoader.done(); };

      // expose node's require and requirejs
      context.nodeRequire = require;
      context.require = requirejs.createForVmContext(context);

      context.console = console;
      return stage;
    },

    startMovie: function(stage) {
      stage.unfreeze();
      this.messageChannel.notifyRenderer({command: 'isReady'});
    },

    notify: function(message) {
      this.emit('message', message);
    },

    notifyRunner: function(message) {
      if (message.command == 'exposePluginExports') {
        tools.mixin(this.vmContext, this.vmContext.exports);
      }
      this.messageChannel.notify(message);
    },

    notifyRunnerAsync: function(message) {
      process.nextTick(this.notifyRunner.bind(this, message));
    },

    run: function(code) {
      this.vm.runInContext(code, this.vmContext);
    },

    load: function(url) {
      this.scriptLoader.load(url, this.emit.bind(this, 'scriptLoaded', url));
    },

    _loadUrl: function(url, callback) {
      fs.readFile(url, 'utf-8', callback);
    },

    _importScript: function(vm, vmContext, url, callback) {
      fs.readFile(url, 'utf-8', function(error, script) {
        if (error) {
          callback(error);
        } else {
          vm.runInContext(script, vmContext, url);
          callback(null);
        }
      });
    }
  }, EventEmitter);

  module.exports = NodeContext;
});
