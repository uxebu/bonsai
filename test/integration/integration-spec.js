define(['./test-data'], function(testData) {
  jasmine.getEnv().defaultTimeoutInterval = 10000;
  describe('Bonsai integration', function(){

    var dummyNode = document.getElementById('dummyNode');

    ['Build', 'DevIframe', 'DevWorker'].forEach(function(testEnv) {
      var bonsaiScope = testEnv == 'DevIframe' || testEnv == 'DevWorker' ?
        'bonsai' + testEnv :
        'bonsai';
      var bonsai = window[bonsaiScope];
      var retBonsaiRun;
      var stage;

      var bonsaiRun = function(runObj) {
        stage = bonsai.run(dummyNode, runObj);
        stage.on('message:success', function(data) {
          retBonsaiRun = data;
        });
        waitsFor(function() {
          return !!retBonsaiRun;
        }, '"bonsai.run" execution failed', 5000);
      };

      beforeEach(function() {
        retBonsaiRun = null;
        // bonsai namespace is filled up after first invocation
        stage = bonsai.run(dummyNode, { code: '1;'});
      });
      afterEach(function() {
        stage.destroy();
      });

      describe(testEnv, function() {
        it('is an object', function() {
          expect(bonsai).toBeOfType('object');
        });

        it('provides several properties', function() {
          expect(bonsai).toHaveProperties(
            'run', 'runnerUrl', 'setup', 'version'
          );
        });

        describe('run', function() {
          it('executes bonsai-code passed within "code" option', function() {
            bonsaiRun({
              code: 'stage.sendMessage("success", {foo: 10});'
            });
            runs(function() {
              expect(retBonsaiRun.foo).toEqual(10);
            });
          });
          it('allows passing bonsai-code within "code" as a function', function() {
            bonsaiRun({
              code: function() {
                stage.sendMessage("success", {foo: "works"});
              }
            });
            runs(function() {
              expect(retBonsaiRun.foo).toEqual('works');
            });
          });
          it('can load requirejs through "urls"', function() {
            bonsaiRun({
              urls: ['../../lib/requirejs/require.js'],
              // require + define can't be serialized in worker
              code: 'stage.sendMessage("success", {require: typeof require, define: typeof define});'
            });
            runs(function() {
              expect(retBonsaiRun.require).toBe('function');
              expect(retBonsaiRun.define).toBe('function');
            });
          });
          it('finishes loading require-module before executing "code"', function() {
            bonsaiRun({
              urls: ['../../lib/requirejs/require.js', './dummy-require.js'],
              code: 'stage.sendMessage("success", false);'
            });
            runs(function() {
              expect(retBonsaiRun).toBe(true);
            });
          });
          it('sets the framerate through "framerate"', function() {
            bonsaiRun({
              framerate: 10,
              code: 'stage.sendMessage("success", {framerate: stage.framerate});'
            });
            runs(function() {
              expect(retBonsaiRun.framerate).toBe(10);
            });
          });
          it('allows to pass additional data', function() {
            bonsaiRun({
              any: 'data',
              code: 'stage.sendMessage("success", { options: stage.options });'
            });
            runs(function() {
              expect(retBonsaiRun.options.any).toEqual('data');
            });
          });
          it('can load another js file and use its exposed property', function() {
            bonsaiRun({
              urls: ['assets/red_box.js'],
              code: function() {
                stage.sendMessage("success", {redBoxFromPlugin: typeof redBoxFromPlugin});
              }
            });
            runs(function() {
              expect(retBonsaiRun.redBoxFromPlugin).toBe('function');
            });
          });
          it('can load a complex example', function() {
            bonsaiRun(testData.complexRunData);
            runs(function() {
              expect(retBonsaiRun.done).toBe(true);
            });
          });
        });
      });

    });

    var retBonsaiRun;
    var stage;
    beforeEach(function() {
      retBonsaiRun = null;
      // bonsai namespace is filled up after first invocation
      stage = bonsai.run(dummyNode, { code: '1;'});
    });
    afterEach(function() {
      stage.destroy();
    });

    var bonsaiRun = function(runObj) {
      stage = bonsai.run(dummyNode, runObj);
      stage.on('message:success', function(data) {
        retBonsaiRun = data;
      });
      waitsFor(function() {
        return !!retBonsaiRun;
      }, '"bonsai.run" execution failed', 1000);
    };

    describe('Build', function() {

      it('provides available runner contexts', function() {
        expect(bonsai).toHaveProperties(
          'IframeRunnerContext', 'WorkerRunnerContext'
        );
      });

      describe('setup', function() {
        it('can set the "runnerUrl"', function() {
          var prevRunnerUrl = bonsai.runnerUrl;
          bonsai.setup({
            runnerUrl: './dummy.js'
          }).run(dummyNode);
          expect(bonsai.runnerUrl).toBe('./dummy.js');
          bonsai.setup({
            runnerUrl: prevRunnerUrl
          });
        });
        it('can set the "runnerContext"', function() {
          var prevRunnerContext = bonsai.RunnerContext;
          bonsai.setup({
            runnerContext: bonsai.IframeRunnerContext
          });
          expect(bonsai.RunnerContext).toBe(bonsai.IframeRunnerContext);
          bonsai.RunnerContext = prevRunnerContext;
        });
      });

      describe('run', function() {
        it('can load a complex example in the IframeRunnerContext', function() {
          var prevContext = bonsai.RunnerContext;
          bonsai.setup({
            runnerContext: bonsai.IframeRunnerContext
          });
          bonsaiRun(testData.complexRunData);
          runs(function() {
            expect(retBonsaiRun.done).toBe(true);
          });
          bonsai.RunnerContext = prevContext;
        });
      });
    });
  });
});
