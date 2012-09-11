require([
  'bonsai/tools',
  'bonsai/runner/stage',
  'bonsai/runner/environment',
  'bonsai/runner/display_object',
  'bonsai/event_emitter',
  './displaylist-owner-common',
  './runner.js'
], function(tools, Stage, Environment, DisplayObject, EventEmitter, testDisplayList) {
  function createMockMessageChannel() {
    return tools.mixin({notifyRenderer: function() {}}, EventEmitter);
  }

  function makeStage() {
    var messageChannel = createMockMessageChannel();
    return new Stage(messageChannel);
  }

  describe('stage', function() {

    testDisplayList(function(displayList) {
      return new Stage(createMockMessageChannel(), displayList);
    }, true);

    describe('setFramerate', function() {

      var stage = makeStage();

      it('Exists', function() {
        expect(stage.setFramerate).toBeOfType('function');
      });

      it('Sets the framerate', function() {
        stage.setFramerate(40);
        expect(stage.framerate).toBe(40);
      });

    });

    describe('setRendering', function() {
      var stage = makeStage();
      it('Exists', function() {
        expect(stage.setRendering).toBeOfType('function');
      });
    });

    describe('setBackgroundColor', function() {
      var stage = makeStage();
      it('Exists', function() {
        expect(stage.setBackgroundColor).toBeOfType('function');
      });
    });

    describe('getSubMovieEnvironment', function() {
      it('returns an Environment instance for a new subMovie', function() {
        var subMovie = {};
        var subMovieUrl = 'test/123.js';
        var env = makeStage().getSubMovieEnvironment(subMovie, subMovieUrl);
        expect(env instanceof Environment).toBe(true);
        expect(env.exports.stage).toBe(subMovie);
      });
    })

    describe('proxy -> commands', function() {
      var proxy = tools.mixin({
        // Create a basic proxy that can register a listener and will
        // then trigger it:
        runMessageListener: function(data) {
          this.emit('message', data);
        },
        notifyRenderer: function() {}
      }, EventEmitter);

      describe('command:play/stop/freeze/unfreeze', function() {

        var stage = new Stage(proxy),
            playMessage = { command: 'play', data: 1 },
            stopMessage = { command: 'stop', data: 2 },
            freezeMessage = { command: 'freeze', data: 3 },
            unfreezeMessage = { command: 'unfreeze', data: 4 };

        stage.play = jasmine.createSpy('play');
        stage.stop = jasmine.createSpy('stop');
        stage.freeze = jasmine.createSpy('freeze');
        stage.unfreeze = jasmine.createSpy('unfreeze');

        proxy.runMessageListener(playMessage);
        it('Calls play when the command is sent', function() {
          expect(stage.play).toHaveBeenCalledWith(playMessage.data);
        });
        proxy.runMessageListener(stopMessage);
        it('Calls stop when the command is sent', function() {
          expect(stage.stop).toHaveBeenCalledWith(stopMessage.data);
        });
        proxy.runMessageListener(freezeMessage);
        it('Calls freeze when the command is sent', function() {
          expect(stage.freeze).toHaveBeenCalledWith(freezeMessage.data);
        });
        proxy.runMessageListener(unfreezeMessage);
        it('Calls unfreeze when the command is sent', function() {
          expect(stage.unfreeze).toHaveBeenCalledWith(unfreezeMessage.data);
        });

      });

      describe('command:userevent & bubbling', function() {

        var stage = new Stage(proxy),
            dParent = new DisplayObject,
            dChild = new DisplayObject;

        dParent.id = 1;
        dChild.id = 2;
        dChild.parent = dParent;

        stage.registry.displayObjects = {
          1: dParent,
          2: dChild
        };

        it('Triggers correct event on child and parent [bubbles]', function() {

          var fakeEventChildHandler = jasmine.createSpy('fakeEventChildHandler'),
              fakeEventParentHandler = jasmine.createSpy('fakeEventParentHandler'),
              eventObject = {
                type: 'click'
              };

          dChild.on('click', fakeEventChildHandler);
          dParent.on('click', fakeEventParentHandler);

          proxy.runMessageListener({
            command: 'userevent',
            data: {
              targetId: 2,
              event: eventObject
            }
          });

          expect(fakeEventChildHandler).toHaveBeenCalledWith(eventObject);
          expect(fakeEventParentHandler).toHaveBeenCalledWith(eventObject);

        });

        it('Triggers correct event on child but does not bubble (non-bubbling event)', function() {

          var fakeEventChildHandler = jasmine.createSpy('fakeEventChildHandler'),
              fakeEventParentHandler = jasmine.createSpy('fakeEventParentHandler'),
              eventObject = {
                type: 'fakeNonBubbling'
              };

          dChild.on('fakeNonBubbling', fakeEventChildHandler);
          dParent.on('fakeNonBubbling', fakeEventParentHandler);

          proxy.runMessageListener({
            command: 'userevent',
            data: {
              targetId: 2,
              event: eventObject
            }
          });

          expect(fakeEventChildHandler).toHaveBeenCalledWith(eventObject);
          expect(fakeEventParentHandler).not.toHaveBeenCalled(); // should not be called

        });

      });

    });

  });

});
