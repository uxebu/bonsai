define(function() {
  'use strict';

  var eventTypeMap = {
    click: 'click',
    dblclick: 'dblclick',
    keypress: 'key',
    keyup: 'keyup',
    keydown: 'keydown',
    mouseup: 'pointerup',
    mousedown: 'pointerdown',
    mousemove: 'pointermove',
    mouseover: 'mouseover',
    mouseout: 'mouseout',
    touchcancel: 'pointerup',
    touchstart: 'pointerdown',
    touchmove: 'pointermove',
    touchend: 'pointerup'
  };

  /** @const */
  var NO_MODIFIER = 0, ALT_KEY = 1 << 0, CTRL_KEY = 1 << 1, META_KEY = 1 << 2, SHIFT_KEY = 1 << 3;

  /**
   * Represents a keyboard event.
   *
   * @param {string} type The event type
   * @param {number} keyCode The scan code of the key
   * @param {number} charCode The unicode code point of the key (only relevant
   *    for "keypress" events)
   * @param {number} [modifiers] Modifiers pressed during the key event
   * @param {string} [targetValue] The current value of an associated input
   * @constructor
   */
  function KeyboardEvent(type, keyCode, charCode, modifiers, targetValue) {
    this.type = type;
    this.charCode = charCode;
    this.keyCode = keyCode;
    this.inputValue = targetValue;

    this.altKey = !!(modifiers & ALT_KEY);
    this.ctrlKey = !!(modifiers & CTRL_KEY);
    this.metaKey = !!(modifiers & META_KEY);
    this.shiftKey = !!(modifiers & SHIFT_KEY);
  }

  /**
   * Creates a KeyboardEvent from a DOM keyboard event
   *
   * @param {KeyboardEvent} domEvent
   * @return {KeyboardEvent}
   */
  KeyboardEvent.fromDomKeyboardEvent = function(domEvent) {
    var modifiers =
      (domEvent.altKey ? ALT_KEY : 0) |
      (domEvent.ctrlKey ? CTRL_KEY : 0) |
      (domEvent.metaKey ? META_KEY : 0) |
      (domEvent.shiftKey ? SHIFT_KEY : 0);
    return new KeyboardEvent(
      eventTypeMap[domEvent.type],
      domEvent.keyCode,
      domEvent.charCode,
      modifiers,
      domEvent.target.value
    );
  };
  KeyboardEvent.NO_MODIFIER = NO_MODIFIER;
  KeyboardEvent.ALT_KEY = ALT_KEY;
  KeyboardEvent.CTRL_KEY = CTRL_KEY;
  KeyboardEvent.META_KEY = META_KEY;
  KeyboardEvent.SHIFT_KEY = SHIFT_KEY;

  KeyboardEvent.prototype.clone = function(type) {
    var modifiers = (this.altKey ? ALT_KEY : 0) |
      (this.ctrlKey ? CTRL_KEY : 0) |
      (this.metaKey ? META_KEY : 0) |
      (this.shiftKey ? SHIFT_KEY : 0);

    return new KeyboardEvent(
      type || this.type,
      this.keyCode,
      this.charCode,
      modifiers,
      this.inputValue
    );
  };

  /**
   * Represents a pointer event (either mouse or touch)
   *
   * @param {string} type The event type
   * @param {number} stageX The x offset relative to the bonsai stage
   * @param {number} stageY The y offset relative to the bonsai stage
   * @param {number} clientX The x offset relative to the viewport
   * @param {number} clientY The y offset relative to the viewport
   * @constructor
   */
  function PointerEvent(type, stageX, stageY, clientX, clientY) {
    this.type = type;
    this.stageX = this.x = stageX;
    this.stageY = this.y = stageY;
    this.clientX = clientX;
    this.clientY = clientY;
    this.deltaX = this.deltaY = this.diffX = this.diffY =
      this.isLeft = this.isRight = this.isMiddle =
      this.touchId = undefined;
  }

  /**
   * Creates a PointerEvent from a DOM MouseEvent
   *
   * @param {MouseEvent} domEvent
   * @param {number} stageX The x offset of the stage relative to the viewport
   * @param {number} stageY The y offset of the stage relative to the viewport
   * @returns {PointerEvent}
   */
  PointerEvent.fromDomMouseEvent = function(domEvent, stageX, stageY) {
    var clientX = domEvent.clientX, clientY = domEvent.clientY;
    var pointerEvent = new PointerEvent(
      eventTypeMap[domEvent.type],
      clientX - stageX,
      clientY - stageY,
      clientX,
      clientY
    );
    var button = domEvent.button;
    pointerEvent.isLeft = button === 0;
    pointerEvent.isMiddle = button === 1;
    pointerEvent.isRight = button === 2;

    return pointerEvent;
  };

  /**
   * Creates a PointerEvent from a DOM Touch / TouchEvent pair
   *
   * @param {Touch} domTouch The single touch to create an event for
   * @param {TouchEvent} domEvent The touch event the touch belongs to
   * @param {number} stageX The x offset of the stage relative to the viewport.
   * @param {number} stageY The y offset of the stage relative to the viewport.
   * @return {PointerEvent}
   */
  PointerEvent.fromDomTouch = function(domTouch, domEvent, stageX, stageY) {
    var clientX = domTouch.clientX, clientY = domTouch.clientY;
    var pointerEvent = new PointerEvent(
      eventTypeMap[domEvent.type],
      clientX - stageX,
      clientY - stageY,
      clientX,
      clientY
    );
    pointerEvent.touchId = domTouch.identifier;
    return pointerEvent;
  };

  /**
   * Clones the PointerEvent instance. Optionally sets the type property to a
   * different value.
   *
   * @param {string} [type] Optional new event .type
   * @return {PointerEvent}
   */
  PointerEvent.prototype.clone = function(type) {
    var clone = new PointerEvent(
      type || this.type,
      this.x,
      this.y,
      this.clientX,
      this.clientY
    );
    clone.deltaX = this.deltaX;
    clone.deltaY = this.deltaY;
    clone.diffX = this.diffX;
    clone.diffY = this.diffY;
    clone.isLeft = this.isLeft;
    clone.isRight = this.isRight;
    clone.isMiddle = this.isMiddle;
    clone.isLeft = this.isLeft;
    clone.touchId = this.touchId;
    return clone;
  };

  return {
    KeyboardEvent: KeyboardEvent,
    PointerEvent: PointerEvent
  };
});
