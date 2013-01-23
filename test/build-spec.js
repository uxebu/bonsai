define(function() {
  jasmine.getEnv().defaultTimeoutInterval = 10000;
  describe('Bonsai build', function(){
    var dummyNode = document.getElementById('dummyNode');

    var stage;
    beforeEach(function() {
      // bonsai namespace is filled up after first invocation
      stage = bonsai.run(dummyNode, { code: '1;'});
    });
    afterEach(function() {
      stage.destroy();
    });

    bonsai.run(dummyNode, {});

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
          var loaded = false;
          var retData;
          stage = bonsai.run(dummyNode, {
            code: 'stage.sendMessage("success", {foo: 10});'
          });
          stage.on('message:success', function(data) {
            loaded = true;
            retData = data;
          });
          waitsFor(function() {
            return loaded;
          }, '"bonsai.run" execution failed', 1000);
          runs(function() {
            expect(retData.foo).toBe(10);
          });
        });
        it('allows to load requirejs through "urls"', function() {
          var retData;
          stage = bonsai.run(dummyNode, {
            urls: ['../lib/requirejs/require.js'],
            // require + define can't be serialized in worker
            code: 'stage.sendMessage("success", {require: typeof require, define: typeof define});'
          });
          stage.on('message:success', function(data) {
            retData = data;
          });
          waitsFor(function() {
            return !!retData;
          }, '"bonsai.run" execution failed', 1000);
          runs(function() {
            expect(retData.require).toBe('function');
            expect(retData.define).toBe('function');
          });
        });
      });
    });
  });
});
