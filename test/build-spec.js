define(function() {
  jasmine.getEnv().defaultTimeoutInterval = 10000;
  describe('Bonsai build', function(){
    var dummyNode = document.getElementById('dummyNode');

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

    describe('bonsai', function() {

      it('is an object', function() {
        expect(bonsai).toBeOfType('object');
      });

      it('provides several properties', function() {
        expect(bonsai).toHaveProperties(
          'run', 'runnerUrl', 'setup', 'version',
          'IframeRunnerContext', 'WorkerRunnerContext'
        );
      });

      describe('runnerUrl', function() {
        it('is a string', function() {
          expect(bonsai.runnerUrl).toBeOfType('string');
        });
        it('contains the complete bonsai-code as a iife / blob-url', function() {
          expect(bonsai.runnerUrl).toStartWithEither('(function', 'blob');
        });
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
        it('executes bonsai-code passed within "code" option', function() {
          bonsaiRun({
            any: 'data',
            code: 'stage.sendMessage("success", { foo: 10 });'
          });
          runs(function() {
            expect(retBonsaiRun.foo).toEqual(10);
          });
        });
        it('can load requirejs through "urls"', function() {
          bonsaiRun({
            urls: ['../lib/requirejs/require.js'],
            // require + define can't be serialized in worker
            code: 'stage.sendMessage("success", {require: typeof require, define: typeof define});'
          });
          runs(function() {
            expect(retBonsaiRun.require).toBe('function');
            expect(retBonsaiRun.define).toBe('function');
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
      });
    });
  });
});
