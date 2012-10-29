define(function() {
  'use strict';

  function createSpy(name) {
    return jasmine.createSpy(name);
  }

  function createEventEmitter() {
    return {
      on: createSpy('on'),
      addListener: createSpy('addListener'),
      removeListener: createSpy('removeListener')
    };
  }

  var displayObjectId = 0;
  return {
    createDisplayList: function(children) {
      return {
        children: children || [],
        add: createSpy('add'),
        clear: createSpy('clear'),
        remove: createSpy('remove')
      };
    },

    createDisplayObject: function() {
      return {
        _attributes: {},
        id: displayObjectId += 1,
        _activate: createSpy('_activate'),
        _deactivate: createSpy('_activate'),
        emit: createSpy('emit'),
        markUpdate: createSpy('markUpdate')
      };
    },

    createEventEmitter: createEventEmitter,

    createMessageProxy: function() {
      var messageProxy = createEventEmitter();
      messageProxy.notifyRenderer = jasmine.createSpy('notifyRenderer');
      return messageProxy;
    },

    createStage: function() {
      return {
        registry: {
          displayObjects: {},
          movies: {
            add: jasmine.createSpy('add'),
            remove: jasmine.createSpy('remove')
          },
          needsDraw: {},
          needsInsertion: {}
        }
      };
    }
  };
});
