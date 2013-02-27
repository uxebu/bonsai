define(function() {
  'use strict';

  /** @const */
  var NO_MODIFIER = 0, ALT_KEY = 1 << 0, CTRL_KEY = 1 << 1, META_KEY = 1 << 2, SHIFT_KEY = 1 << 3;

  /**
   * Represents a keyboard event.
   *
   * @param {string} type The event type
   * @param {number} keyCode The scan code of the key
   * @param {number} [modifiers] Modifiers pressed during the key event
   * @param {string} [targetValue] The current value of an associated input
   * @constructor
   */
  function KeyboardEvent(type, keyCode, modifiers, targetValue) {
    this.type = type;
    this.keyCode = keyCode;
    this.inputValue = targetValue;

    this.altKey = !!(modifiers & ALT_KEY);
    this.ctrlKey = !!(modifiers & CTRL_KEY);
    this.metaKey = !!(modifiers & META_KEY);
    this.shiftKey = !!(modifiers & SHIFT_KEY);
  }

  /**
   * Creates a KeyboardEvent from a DOM event
   *
   * @param {string} type The event type
   * @param {Object} keys A keyboard event
   * @param {string} [targetValue] The current value of an associated input
   * @returns {KeyboardEvent}
   */
  KeyboardEvent.fromDomEvent = function(type, keys, targetValue) {
    var modifiers =
      !!keys.altKey * ALT_KEY |
      !!keys.ctrlKey * CTRL_KEY |
      !!keys.metaKey * META_KEY |
      !!keys.shiftKey * SHIFT_KEY;
    return new KeyboardEvent(undefined, keys.keyCode, modifiers, targetValue);
  };
  KeyboardEvent.NO_MODIFIER = NO_MODIFIER;
  KeyboardEvent.ALT_KEY = ALT_KEY;
  KeyboardEvent.CTRL_KEY = CTRL_KEY;
  KeyboardEvent.META_KEY = META_KEY;
  KeyboardEvent.SHIFT_KEY = SHIFT_KEY;

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
      this.touchId = this.touchIndex = undefined;
  }
  /**
   * Creates a PointerEvent from a DOM MouseEvent or TouchEvent
   *
   * @param {string} domType The type of the DOM event
   * @param {Object} clientOffsets An object with "clientX" and "clientY" properties
   * @param {number} stageClientX The x offset of the stage relative to the viewport.
   * @param {number} stageClientY The y offset of the stage relative to the viewport.
   * @return {PointerEvent}
   */
  PointerEvent.fromDomEvent = function(domType, clientOffsets, stageClientX, stageClientY) {
    var clientX = clientOffsets.clientX;
    var clientY = clientOffsets.clientY;
    return new PointerEvent(undefined, clientX - stageClientX, clientY - stageClientY, clientX, clientY);
  };

  return {
    KeyboardEvent: KeyboardEvent,
    PointerEvent: PointerEvent
  };
});
