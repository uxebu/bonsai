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

        var runData = {
          urls: ['assets/red_box.js', 'assets/yellow.js'],
          code: function() {

            new Rect(100, 0, 100, 100).addTo(stage).attr({
              fillColor: 'blue'
            });

            redBoxFromPlugin().addTo(stage);

            new Movie('green.js', function(err, subMovie) {
              if (err) {
                console.log('Error: ' + err);
                return;
              }
              subMovie.attr({
                x: 100,
                y: 100,
                origin: new Point(50, 50)
              }).addTo(stage);
              tools.forEach(stage.children(), function(child) {
                child.animate('4s', {
                  rotation: Math.PI * 2
                }, {
                  repeat: Infinity
                })
              });
              new Bitmap('redpanda.jpg', function(err) {
                if (err) {
                  console.log('Error: ' + err);
                  return;
                }
                this.addTo(stage).attr({
                  x: 50,
                  y: 50,
                  width: 100,
                  height: 100,
                  opacity: 0
                }).animate('.5s', {
                    opacity: 1
                  });
                stage.sendMessage('success', {done: true});
              });
            });
          }
        };
        it('can load a complex example', function() {
          bonsaiRun(runData);
          runs(function() {
            expect(retBonsaiRun.done).toBe(true);
          });
        });
        it('can load a complex example for the IframeRunnerContext', function() {
          var prevContext = bonsai.RunnerContext;
          bonsai.setup({
            runnerContext: bonsai.IframeRunnerContext
          });
          bonsaiRun(runData);
          runs(function() {
            expect(retBonsaiRun.done).toBe(true);
          });
          bonsai.RunnerContext = prevContext;
        });
      });
    });
  });
});
