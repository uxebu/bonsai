define([
  'bonsai/renderer/renderer_controller',
  'bonsai/uri',
  'bonsai/event_emitter',
  'bonsai/tools'
], function(RendererController, URI, EventEmitter, tools) {
  var mockAssetController, mockRenderer, mockRunner, baseUri;

  function resetMocks() {
    mockAssetController = tools.mixin({
      load: jasmine.createSpy('assetController.load')
    }, EventEmitter);

    mockRenderer = tools.mixin({
      width: 234,
      height: 567,
      getOffset: function() { return {left: 23, top: 81}; },
      destroy: jasmine.createSpy('renderer.destroy'),
      render: jasmine.createSpy('renderer.render'),
      config: jasmine.createSpy('renderer.config')
    }, EventEmitter);

    mockRunner = tools.mixin({
      init: jasmine.createSpy('runner.init').andCallFake(function() {
        this.emit('message', {command: 'init', data: 'listening'});
      }),
      notifyRunner: jasmine.createSpy('runner.notifyRunner'),
      notifyRunnerAsync: jasmine.createSpy('runner.notifyRunnerAsync'),
      destroy: jasmine.createSpy('runner.destroy')
    }, EventEmitter);

    baseUri = new URI();
  }

  function createRendererController() {
    return new RendererController(mockRenderer, mockAssetController, mockRunner, baseUri);
  }

  describe('RendererController', function () {
    beforeEach(resetMocks);
    beforeEach(function() {
      this.addMatchers({
        /**
         * Checks whether a spy has been called with a certain command
         *
         * @param {string} command The expected command.
         * @param {Object} [data] The expected data. Matched with `toEqual`
         */
        toHaveBeenCalledWithCommand: function(command, data) {
          var spy = this.actual;
          if (!jasmine.isSpy(spy)) {
            throw new Error('Expected a spy, but got ' + jasmine.pp(spy) + '.');
          }

          var argsForCall = spy.argsForCall, hasData = arguments.length > 1;
          for (var i = 0, len = argsForCall.length; i < len; i += 1) {
            var arg = argsForCall[i][0];
            if (arg && arg.command === command) {
              if (hasData) {
                if (data === arg.data) {
                  return true;
                }
                for (var key in data) {
                  if (data[key] !== arg.data[key]) {
                    return false;
                  }
                }
              }
              return true;
            }
          }

          return false;
        },

        toHaveBeenCalledWithEnvCommand: function() {
          var spy = this.actual;
          if (!jasmine.isSpy(spy)) {
            throw new Error('Expected a spy, but got ' + jasmine.pp(spy) + '.');
          }

          var argsForCall = spy.argsForCall;
          var offset = mockRenderer.getOffset();
          for (var i = 0, len = argsForCall.length; i < len; i += 1) {
            var arg = argsForCall[i][0];
            if (arg && arg.command === 'env') {
              var data = arg.data;
              if (data.windowHeight !== window.innerHeight) { return false; }
              if (data.windowWidth !== window.innerWidth) { return false; }
              if (data.windowScrollX !== Math.max(
                  document.body.scrollLeft,
                  document.documentElement.scrollLeft
                )) { return false; }
              if (data.windowScrollY !== Math.max(
                  document.body.scrollTop,
                  document.documentElement.scrollTop
                )) { return false; }
              if (data.offsetX !== offset.left) { return false; }

              return data.offsetY === offset.top;
            }
          }

          return false;
        }
      });
    });

    describe('Constructor', function () {
      it('takes four arguments: renderer, asset controller, runner, and base uri', function () {
        expect(
          function () {
            new RendererController(mockRenderer, mockAssetController, mockRunner, baseUri);
          }).not.toThrow();
      });
    });

    describe('Startup methods', function() {

      function checkRunnerNotification(funcStartup) {
        it('passes default options to the runner', function() {
          funcStartup();

          var message = mockRunner.notifyRunner.mostRecentCall.args[0];
          expect(message.data.framerate).toBeUndefined();
          expect(message.data.pluginDebug).toBe(false);
          expect(message.data.plugins).toBeUndefined();
          expect(message.data.pluginUrl).toBe(baseUri.resolveUri('').toString());
          expect(message.data.width).toBe(mockRenderer.width);
          expect(message.data.height).toBe(mockRenderer.height);
        });

        it('passes a numeric framerate to the runner', function() {
          var framerate = 63;
          funcStartup({
            framerate: framerate
          });

          var message = mockRunner.notifyRunner.mostRecentCall.args[0];
          expect(message.data.framerate).toBe(framerate);
        });

        it('does not pass an invalid framerate to the runner', function() {
          var framerate = 'a string is not a valid frame rate';
          funcStartup({
            framerate: framerate
          });

          var message = mockRunner.notifyRunner.mostRecentCall.args[0];
          expect(message.data.framerate).toBeUndefined();
        });

        it('passes a truthy pluginDebug option to the runner', function() {
          funcStartup({
            pluginDebug: {something: 'truthy'}
          });

          var message = mockRunner.notifyRunner.mostRecentCall.args[0];
          expect(message.data.pluginDebug).toBe(true);
        });

        it('passes a falsy pluginDebug option to the runner', function() {
          funcStartup({
            pluginDebug: 0
          });

          var message = mockRunner.notifyRunner.mostRecentCall.args[0];
          expect(message.data.pluginDebug).toBe(false);
        });

        it('passes specified plugins to the runner', function() {
          var plugins = ['arbitrary plugin', 'another arbitrary plugin'];
          funcStartup({
            plugins: plugins
          });

          var message = mockRunner.notifyRunner.mostRecentCall.args[0];
          expect(message.data.plugins).toBe(plugins);
        });

        it('resolves the pluginUrl option relative to the baseUrl', function() {
          var pluginUrl = 'arbitrary/path/';
          funcStartup({
            pluginUrl: pluginUrl
          });

          var message = mockRunner.notifyRunner.mostRecentCall.args[0];
          expect(message.data.pluginUrl).toBe(baseUri.resolveUri(pluginUrl).toString());
        });

        it('passes an absolute pluginUrl as is', function() {
          var pluginUrl = 'https://example.org/fully-qualified-url/';
          funcStartup({
            pluginUrl: pluginUrl
          });

          var message = mockRunner.notifyRunner.mostRecentCall.args[0];
          expect(message.data.pluginUrl).toBe(pluginUrl);
        });
      }
    });

    describe('#destroy', function() {
      it('calls the destroy method of the runner and deletes the reference to it', function() {
        var rendererController = createRendererController();
        rendererController.destroy();
        expect(mockRunner.destroy).toHaveBeenCalled();
        expect(rendererController).not.toHaveProperties('runner');
      });

      it('calls the destroy method of the renderer and deletes the reference to it', function() {
        var rendererController = createRendererController();
        rendererController.destroy();
        expect(mockRenderer.destroy).toHaveBeenCalled();
        expect(rendererController).not.toHaveProperties('renderer');
      });
    });

    describe('#handleEvent', function() {

      it('responds to a "render" command by setting .currentFrame to ' +
        'message.frame and passing message.data to the "render" method of ' +
        'the renderer', function() {

        var frameNumber = 123;
        var renderMessages = [];
        var rendererController = createRendererController();
        rendererController.handleEvent({
          command: 'render',
          frame: frameNumber,
          data: renderMessages
        });

        expect(rendererController.currentFrame).toBe(frameNumber);
        expect(mockRenderer.render).toHaveBeenCalledWith(renderMessages);
      });

      it('responds to a "renderConfig" command by passing the message data to ' +
        'the config method of the renderer', function() {

        var configData = {};
        createRendererController().handleEvent({
          command: 'renderConfig',
          data: configData
        });

        expect(mockRenderer.config).toHaveBeenCalledWith(configData);
      });

      describe('Playback state', function() {
        tools.forEach(['play', 'stop', 'freeze', 'unfreeze'], function(state) {
          it('emits a "' + state + '" event when receiving a "' + state + '" command', function() {
            var rendererController = createRendererController();
            var listener = jasmine.createSpy();
            rendererController.on(state, listener);

            var messageData = {};
            rendererController.handleEvent({command: state, data: messageData});

            expect(listener).toHaveBeenCalledWith(messageData);
          });
        });
      });

      it('Handles a "debug" command by passing the data to its "debug" method', function() {
        var rendererController = createRendererController();
        rendererController.debug = jasmine.createSpy('debug');

        var debugData = ['messages', 'here'];
        rendererController.handleEvent({command: 'debug', data: debugData});

        expect(rendererController.debug).toHaveBeenCalledWith(debugData);
      });

      it('forwards data of a "loadAsset" command to the "load" method of the assetController', function() {
        var assetData = {};
        createRendererController().handleEvent({
          command: 'loadAsset',
          data: assetData
        });

        expect(mockAssetController.load).toHaveBeenCalledWith(assetData);
      });
    });

    describe('playback control', function() {
      tools.forEach(['play', 'stop', 'freeze', 'unfreeze'], function(method) {
        it('returns the stage controller instance', function() {
          var rendererController = createRendererController();
          expect(rendererController[method]()).toBe(rendererController);
        });

        it('sends a "' + method + '" command to the "notifyRunner" method of ' +
          'the runner when calling the "' + method + '" method', function() {

          var frame = 12;
          createRendererController()[method](frame);
          expect(mockRunner.notifyRunner).toHaveBeenCalledWithCommand(method, frame);
        });
      });
    });

    describe('#post', function() {
      it('calls the "notifyRunner" method of the runner with a command object', function() {
        var command = 'arbitrary command';
        var commandData = {arbitrary: 'data'};
        createRendererController().post(command, commandData);

        expect(mockRunner.notifyRunner).toHaveBeenCalledWithCommand(command, commandData);
      });
    });

    describe('sendMessage', function() {
      var rendererController;
      beforeEach(function() {
        rendererController = createRendererController();
      });
      function getFirstArg() {
        return mockRunner.notifyRunner.mostRecentCall.args[0];
      }

      it('should send an uncategorized message when called with one argument', function() {
        var message = {};

        rendererController.sendMessage(message);
        var arg = getFirstArg();

        expect(arg.command).toBe('message');
        expect(arg.data).toBe(message);
        expect(arg.category).toBeFalsy();
      });

      it('should send a categorized message when called with two arguments', function() {
        var message = {};
        var messageCategory = 'arbitrary';

        rendererController.sendMessage(messageCategory, message);
        var arg = getFirstArg();

        expect(arg.command).toBe('message');
        expect(arg.data).toBe(message);
        expect(arg.category).toBe(messageCategory);
      });

    });

    describe('message events', function() {
      var rendererController;
      beforeEach(function() {
        rendererController = createRendererController();
      });

      it('should emit uncategorized messages to uncategorized listeners only', function() {
        var uncategorizedListener = jasmine.createSpy('uncategorized');
        var undefinedCategoryListener = jasmine.createSpy('undefined');
        var messageData = {};
        rendererController.on('message', uncategorizedListener);
        rendererController.on('message:undefined', undefinedCategoryListener);

        rendererController.handleEvent({command: 'message', data: messageData});

        expect(uncategorizedListener).toHaveBeenCalledWith(messageData);
        expect(undefinedCategoryListener).not.toHaveBeenCalled();
      });

      it('should emit a message with category "null" to categorized listeners only', function() {
        var uncategorizedListener = jasmine.createSpy('uncategorized');
        var nullCategoryListener = jasmine.createSpy('null');
        var messageData = {};
        rendererController.on('message', uncategorizedListener);
        rendererController.on('message:null', nullCategoryListener);

        rendererController.handleEvent({command: 'message', data: messageData, category: null});

        expect(uncategorizedListener).not.toHaveBeenCalled();
        expect(nullCategoryListener).toHaveBeenCalledWith(messageData);
      });

      it('should emit categorized messages to categorized listeners only', function() {
        var uncategorizedListener = jasmine.createSpy('uncategorized');
        var categorizedListener = jasmine.createSpy('categorized');
        var messageData = {};
        var category = 'arbitrary';
        rendererController.on('message', uncategorizedListener);
        rendererController.on('message:' + category, categorizedListener);

        rendererController.handleEvent({command: 'message', data: messageData, category: category});

        expect(uncategorizedListener).not.toHaveBeenCalled();
        expect(categorizedListener).toHaveBeenCalledWith(messageData);
      });

    });
  });

});
