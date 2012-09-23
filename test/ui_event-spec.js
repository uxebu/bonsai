define([
  'bonsai/runner/ui_event',
  'common/mock'
], function(uiEvent, mock) {
  describe('uiEvent', function() {
    describe('scaffolding', function() {
      it('returns the same object', function() {
        var eventObject = {};
        expect(uiEvent(eventObject)).toBe(eventObject);
      });

      it('Adds an "emitOn" method to the event object', function() {
        expect(uiEvent({}).emitOn).toBeOfType('function');
      });

      it('Adds an "stop" method to the event object', function() {
        expect(uiEvent({}).stop).toBeOfType('function');
      });
    });

    describe('emitOn', function() {
      it('calls emit on the passed in object with the event object as parameter', function() {
        var eventType = 'arbitrary';
        var eventObject = uiEvent({type: eventType});
        var displayObject = mock.createDisplayObject();
        eventObject.emitOn(displayObject);

        expect(displayObject.emit).toHaveBeenCalledWith(eventType, eventObject);
      });

      it('walks a chain of parents correctly', function() {
        var eventType = 'click'; // a bubbling event
        var eventObject = uiEvent({type: eventType});
        var displayObject = mock.createDisplayObject();
        displayObject.parent = mock.createDisplayObject();
        displayObject.parent.emit.andCallFake(function(type, event) {
          event.stop();
        });
        displayObject.parent.parent = mock.createDisplayObject();
        displayObject.parent.parent.parent = mock.createDisplayObject();
        eventObject.emitOn(displayObject);

        expect(displayObject.emit).toHaveBeenCalledWith(eventType, eventObject);
        expect(displayObject.parent.emit).toHaveBeenCalledWith(eventType, eventObject);
        expect(displayObject.parent.parent.emit).not.toHaveBeenCalled();
        expect(displayObject.parent.parent.parent.emit).not.toHaveBeenCalled();
      });

      it('stops walking a chain of parents when stopped', function() {
        var eventType = 'click'; // a bubbling event
        var eventObject = uiEvent({type: eventType});
        var displayObject = mock.createDisplayObject();
        displayObject.parent = mock.createDisplayObject();
        displayObject.parent.parent = mock.createDisplayObject();
        displayObject.parent.parent.parent = mock.createDisplayObject();
        eventObject.emitOn(displayObject);

        expect(displayObject.emit).toHaveBeenCalledWith(eventType, eventObject);
        expect(displayObject.parent.emit).toHaveBeenCalledWith(eventType, eventObject);
        expect(displayObject.parent.parent.emit).toHaveBeenCalledWith(eventType, eventObject);
        expect(displayObject.parent.parent.parent.emit).toHaveBeenCalledWith(eventType, eventObject);
      });

      it('does not walk a parent chain for non-bubbling events', function() {
        var eventType = 'arbitrary';
        var eventObject = uiEvent({type: eventType});
        var displayObject = mock.createDisplayObject();
        displayObject.parent = mock.createDisplayObject();
        eventObject.emitOn(displayObject);
        expect(displayObject.emit).toHaveBeenCalledWith(eventType, eventObject);
        expect(displayObject.parent.emit).not.toHaveBeenCalled();

      });
    });
  });
});
