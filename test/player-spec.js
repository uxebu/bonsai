require([
  'bonsai/bootstrapper/player',
  'bonsai/uri',
  './runner.js'
], function (player, URI) {
  'use strict';

  var MockAssetControllerConstructor,
      MockRendererConstructor,
      MockRunnerContextConstructor,
      MockRendererController,
      MockRendererControllerConstructor;

  function resetMocksOnPlayer() {
    player.AssetController = MockAssetControllerConstructor = jasmine.createSpy('AssetController');
    player.Renderer = MockRendererConstructor = jasmine.createSpy('Renderer');
    player.RunnerContext = MockRunnerContextConstructor = jasmine.createSpy('RunnerContext');
    player.RendererController = MockRendererControllerConstructor = jasmine.createSpy('RendererController');

    MockRendererController = Object.create(MockRendererControllerConstructor.prototype);
    MockRendererController.initRenderer = jasmine
      .createSpy('RendererController#initRenderer')
      .andReturn(MockRendererController);

    MockRendererController.runnerContext = MockRunnerContextConstructor;

    MockRunnerContextConstructor.once = jasmine
      .createSpy('RunnerContext#once');

    MockRendererControllerConstructor.andReturn(MockRendererController);
  }

  describe('player', function () {
    beforeEach(resetMocksOnPlayer);
    function createMockNode() {
      return {
        offsetWidth: 50,
        offsetHeight: 20,
        ownerDocument: {
          defaultView: {
            getComputedStyle: function() {
              return {
                paddingTop: 1,
                paddingRight: 2,
                paddingBottom: 3,
                paddingLeft: 4
              }
            }
          }
        }
      }
    }

    it('has a semver version number', function() {
      expect(player.version).toMatch(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+)?/);
    });

    it('has a defaultRunnerOptions property which is an object', function() {
      expect(player.defaultRunnerOptions).toBeInstanceOf(Object);
    });

    describe('.baseUrl()', function () {
      it('returns an instance of URI', function () {
        expect(player.baseUrl()).toBeInstanceOf(URI);
      });
    });

    describe('.setup()', function () {
      it('sets runner url and RunnerContext implementation on the player', function () {
        var RunnerContext = function () {};
        var runnerUrl = 'arbitrary/url';

        player.setup({
          runnerUrl:runnerUrl,
          runnerContext:RunnerContext
        });

        expect(player.runnerUrl).toBe(runnerUrl);
        expect(player.RunnerContext).toBe(RunnerContext);
      });

      it('sets only the runner url when no runner option is passed', function () {
        var runnerUrl = 'another/arbitrary/url';
        var currentRunner = player.RunnerContext;

        player.setup({
          runnerUrl:runnerUrl
        });

        expect(player.runnerUrl).toBe(runnerUrl);
        expect(player.RunnerContext).toBe(currentRunner);
      });

      it('sets only the runner when no runnerUrl option is passed', function () {
        var currentUrl = player.runnerUrl;
        var RunnerContext = function () {};

        player.setup({
          runnerContext:RunnerContext
        });

        expect(player.runnerUrl).toBe(currentUrl);
        expect(player.RunnerContext).toBe(RunnerContext);
      });
    });

    // Helper function to test `createStage`, `run`, and `runCode`
    function testStageCreation(funcSetup) {
      return function () {
        it('returns an instance of `player.RendererController`', function () {
          expect(funcSetup(createMockNode())).toBeInstanceOf(player.RendererController);
        });

        it('passes node, width, height and fpsLog arguments to the renderer', function () {
          var node = createMockNode(), width = 162, height = 100, options = {fpsLog: true};
          funcSetup(node, width, height, options);

          expect(MockRendererConstructor).toHaveBeenCalledWith(node, width, height, options.fpsLog);
        });

        it('passes an url and a document to the runner', function () {
          var runnerUrl = 'an/arbitrary/url';
          player.setup({runnerUrl:runnerUrl});
          funcSetup(createMockNode(), 0, 0);

          var args = MockRunnerContextConstructor.mostRecentCall.args;
          expect(args[0]).toBe(runnerUrl);
          expect(args[1].createElement).toBeOfType('function');
          expect(args[1].documentElement).toBeOfType('object');
          expect(args[1].documentElement.appendChild).toBeOfType('function');
        });

        it('invokes RendererController with instances of .Renderer, .AssetController and .Runner as well as the options object', function () {
          funcSetup(createMockNode(), 10, 20);

          var args = MockRendererControllerConstructor.mostRecentCall.args;
          expect(args[0]).toBeInstanceOf(MockRendererConstructor);
          expect(args[1]).toBeInstanceOf(MockAssetControllerConstructor);
          expect(args[2]).toBeInstanceOf(MockRunnerContextConstructor);
          expect(args[3]).toBeInstanceOf(Object /* these are the options */);
          expect(args[3]).toHaveProperties('baseUrl');
        });

        describe('defaultRunnerOptions', function() {
          var originalOptions;
          beforeEach(function() {
            originalOptions = player.defaultRunnerOptions;
            player.defaultRunnerOptions = {
              arbitraryString: 'arbitrary string',
              arbitraryObject: {},
              aProperty: {}
            };
          });
          afterEach(function() {
            player.defaultRunnerOptions = originalOptions;
          });

          it('adds all default options to the options object before passing them to the RendererController', function() {
            funcSetup(createMockNode(), 20, 30, {});
            var optionsPassedToController = MockRendererControllerConstructor.mostRecentCall.args[3];
            expect(optionsPassedToController.arbitraryString).toBe(player.defaultRunnerOptions.arbitraryString);
            expect(optionsPassedToController.arbitraryObject).toBe(player.defaultRunnerOptions.arbitraryObject);
          });

          it('does not overwrite properties in options', function() {
            var overwrittenOptionValue = {};
            funcSetup(createMockNode(), 10, 20, {aProperty: overwrittenOptionValue});
            var optionsPassedToController = MockRendererControllerConstructor.mostRecentCall.args[3];
            expect(optionsPassedToController.aProperty).toBe(overwrittenOptionValue);
          });

          it('should work if no options have been passed', function() {
            funcSetup(createMockNode(), 50, 60);
            var optionsPassedToController = MockRendererControllerConstructor.mostRecentCall.args[3];
            expect(optionsPassedToController.arbitraryString).toBe(player.defaultRunnerOptions.arbitraryString);
            expect(optionsPassedToController.arbitraryObject).toBe(player.defaultRunnerOptions.arbitraryObject);
          });
        });

        describe('options', function() {
          it('should pass a baseUrl as a string, equal to the base url of the player', function() {
            funcSetup(createMockNode(), 50, 60);
            var optionsPassedToController = MockRendererControllerConstructor.mostRecentCall.args[3];
            expect(optionsPassedToController.baseUrl).toBe(String(player.baseUrl()));
          });

          it('should resolve a passed baseUrl against the base url of the player and forward it as a string', function() {
            var baseUrl = '../some/./arbitrary.url';
            funcSetup(createMockNode(), 50, 60, {baseUrl: baseUrl});
            var optionsPassedToController = MockRendererControllerConstructor.mostRecentCall.args[3];
            expect(optionsPassedToController.baseUrl).toBe(String(player.baseUrl().resolveUri(baseUrl)));
          });

          it('should resolve a passed assetBaseUrl against the base url of the player and forward it as a string', function() {
            var assetBaseUrl = '../some/./arbitrary.url';
            funcSetup(createMockNode(), 50, 60, {assetBaseUrl: assetBaseUrl});
            var optionsPassedToController = MockRendererControllerConstructor.mostRecentCall.args[3];
            expect(optionsPassedToController.assetBaseUrl).toBe(String(player.baseUrl().resolveUri(assetBaseUrl)));
          });

          it('should resolve a passed url against the base url of the player and forward it as a string', function() {
            var url = '../some/./arbitrary.url';
            funcSetup(createMockNode(), 50, 60, {url: url});
            var optionsPassedToController = MockRendererControllerConstructor.mostRecentCall.args[3];
            expect(optionsPassedToController.url).toBe(String(player.baseUrl().resolveUri(url)));
          });

          it('should resolve a passed array of urls against the base url of the player and forward it as an array of strings', function() {
            var urls = ['../some/./arbitrary.url', 'http://an/absolute.url'];
            funcSetup(createMockNode(), 50, 60, {urls: urls});
            var optionsPassedToController = MockRendererControllerConstructor.mostRecentCall.args[3];
            expect(optionsPassedToController.urls).toEqual([
              player.baseUrl().resolveUri(urls[0]).toString(),
              urls[1]
            ]);
          });
        });
      }
    }

    describe('.createRenderer()', testStageCreation(function (node, width, height, options) {
      return player.createRenderer.apply(player, arguments);
    }));

    describe('.run()', function () {
      testStageCreation(function(node, width, height, options) {
        if (!options) {
          options = {};
        }
        options.width = width;
        options.height = height;

        return player.run(node, options);
      })();

    });

  });

});
