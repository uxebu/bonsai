define(function() {
  'use strict';

  var bubbleEvents = {
    mouseover: true,
    mouseout: true,
    mousewheel: true,
    pointerup: true,
    pointerdown: true,
    pointermove: true,
    click: true,
    doubleclick: true,
    'multi:pointerdown': true,
    'multi:pointermove': true,
    'multi:pointerup': true
  };

  function emitOn(displayObject) {
    var eventType = this.type;
    var isBubbling = bubbleEvents[eventType];
    do {
      displayObject.emit(eventType, this);
      displayObject = displayObject.parent;
    } while (isBubbling && !this._isStopped && displayObject);
  }

  function stopEvent() {
    this._isStopped = true;
  }

  function uiEvent(eventObject) {
    eventObject.emitOn = emitOn;
    eventObject.stop = stopEvent;
    return eventObject;
  }

  return uiEvent;
});
