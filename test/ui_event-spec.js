require([
  'bonsai/runner/ui_event',
  './runner.js'
], function(uiEvent) {
  function createMockDisplayObject() {
    return {emit: jasmine.createSpy('emit')};
  }

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
        var mockDisplayObject = createMockDisplayObject();
        eventObject.emitOn(mockDisplayObject);

        expect(mockDisplayObject.emit).toHaveBeenCalledWith(eventType, eventObject);
      });

      it('walks a chain of parents correctly', function() {
        var eventType = 'click'; // a bubbling event
        var eventObject = uiEvent({type: eventType});
        var mockDisplayObject = createMockDisplayObject();
        mockDisplayObject.parent = createMockDisplayObject();
        mockDisplayObject.parent.emit.andCallFake(function(type, event) {
          event.stop();
        });
        mockDisplayObject.parent.parent = createMockDisplayObject();
        mockDisplayObject.parent.parent.parent = createMockDisplayObject();

        eventObject.emitOn(mockDisplayObject);

        expect(mockDisplayObject.emit).toHaveBeenCalledWith(eventType, eventObject);
        expect(mockDisplayObject.parent.emit).toHaveBeenCalledWith(eventType, eventObject);
        expect(mockDisplayObject.parent.parent.emit).not.toHaveBeenCalled();
        expect(mockDisplayObject.parent.parent.parent.emit).not.toHaveBeenCalled();
      });

      it('stops walking a chain of parents when stopped', function() {
        var eventType = 'click'; // a bubbling event
        var eventObject = uiEvent({type: eventType});
        var mockDisplayObject = createMockDisplayObject();
        mockDisplayObject.parent = createMockDisplayObject();
        mockDisplayObject.parent.parent = createMockDisplayObject();
        mockDisplayObject.parent.parent.parent = createMockDisplayObject();

        eventObject.emitOn(mockDisplayObject);

        expect(mockDisplayObject.emit).toHaveBeenCalledWith(eventType, eventObject);
        expect(mockDisplayObject.parent.emit).toHaveBeenCalledWith(eventType, eventObject);
        expect(mockDisplayObject.parent.parent.emit).toHaveBeenCalledWith(eventType, eventObject);
        expect(mockDisplayObject.parent.parent.parent.emit).toHaveBeenCalledWith(eventType, eventObject);
      });

      it('does not walk a parent chain for non-bubbling events', function() {
        var eventType = 'arbitrary';
        var eventObject = uiEvent({type: eventType});
        var mockDisplayObject = createMockDisplayObject();
        mockDisplayObject.parent = createMockDisplayObject();

        eventObject.emitOn(mockDisplayObject);
        expect(mockDisplayObject.emit).toHaveBeenCalledWith(eventType, eventObject);
        expect(mockDisplayObject.parent.emit).not.toHaveBeenCalled();

      });
    });
  });
});
