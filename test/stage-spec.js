define([
  'bonsai/tools',
  'bonsai/runner/stage',
  'bonsai/runner/environment',
  'bonsai/runner/display_object',
  'bonsai/event_emitter',
  'common/mock',
  'common/displaylist-owner'
], function(tools, Stage, Environment, DisplayObject, EventEmitter, mock, testDisplayList) {
  function makeStage() {
    var messageChannel = mock.createMessageProxy();
    return new Stage(messageChannel);
  }

  describe('stage', function() {

    testDisplayList(function(displayList) {
      return new Stage(mock.createMessageProxy(), displayList);
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

      describe('sendMessage', function() {
        var messageProxy, stage;
        function getFirstArg() {
          return messageProxy.notifyRenderer.mostRecentCall.args[0];
        }
        beforeEach(function(argument) {
          messageProxy = mock.createMessageProxy();
          stage = new Stage(messageProxy);
        });

        it('should send an uncategorized message when called with one argument', function() {
          var message = {};

          stage.sendMessage(message);
          var arg = getFirstArg();

          expect(arg.command).toBe('message');
          expect(arg.data).toBe(message);
          expect(arg.category).toBeFalsy();
        });

        it('should send a categorized message when called with two arguments', function() {
          var message = {};
          var messageCategory = 'arbitrary';

          stage.sendMessage(messageCategory, message);
          var arg = getFirstArg();

          expect(arg.command).toBe('message');
          expect(arg.data).toBe(message);
          expect(arg.category).toBe(messageCategory);
        });

      });

      describe('message events', function() {
        var messageProxy, stage;
        beforeEach(function(argument) {
          messageProxy = mock.createMessageProxy();
          stage = new Stage(messageProxy);
        });

        it('should emit uncategorized messages to uncategorized listeners only', function() {
          var uncategorizedListener = jasmine.createSpy('uncategorized');
          var undefinedCategoryListener = jasmine.createSpy('undefined');
          var messageData = {};
          stage.on('message', uncategorizedListener);
          stage.on('message:undefined', undefinedCategoryListener);

          stage.handleEvent({command: 'message', data: messageData});

          expect(uncategorizedListener).toHaveBeenCalledWith(messageData);
          expect(undefinedCategoryListener).not.toHaveBeenCalled();
        });

        it('should emit messages with category "null" to categorized listeners only', function() {
          var uncategorizedListener = jasmine.createSpy('uncategorized');
          var nullCategoryListener = jasmine.createSpy('null');
          var messageData = {};
          stage.on('message', uncategorizedListener);
          stage.on('message:null', nullCategoryListener);

          stage.handleEvent({command: 'message', data: messageData, category: null});

          expect(uncategorizedListener).not.toHaveBeenCalled();
          expect(nullCategoryListener).toHaveBeenCalledWith(messageData);
        });

        it('should emit categorized messages to categorized listeners only', function() {
          var uncategorizedListener = jasmine.createSpy('uncategorized');
          var categorizedListener = jasmine.createSpy('categorized');
          var messageData = {};
          var category = 'arbitrary';
          stage.on('message', uncategorizedListener);
          stage.on('message:' + category, categorizedListener);

          stage.handleEvent({command: 'message', data: messageData, category: category});

          expect(uncategorizedListener).not.toHaveBeenCalled();
          expect(categorizedListener).toHaveBeenCalledWith(messageData);
        });

      });

    });

  });

});
