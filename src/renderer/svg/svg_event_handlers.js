/**
 * SVGRenderer's event handling methods
 *
 * @requires module:renderer
 */
define([
  '../../tools',
  '../event',
  './check_intersection'
], function(tools, event, checkIntersection) {
  'use strict';

  var max = Math.max;

  /** @const */
  var ELEMENT_NODE = 1;
  var TOUCH_SUPPORT = null;

  var KeyboardEvent = event.KeyboardEvent, PointerEvent = event.PointerEvent;

  /**
   * Returns the bonsai id of a DOM node
   *
   * @param {Node} node A DOM node
   * @return {number} The bonsai id of the dom node or -1
   */
  function getBonsaiIdOf(node) {
    var id = node && node.nodeType === ELEMENT_NODE && node.getAttribute('data-bs-id');
    return id ? +id : -1; // string '0' evaluates to true
  }

  /**
   * Determines whether an event type is a keyboard event type.
   *
   * @param {string} type The event type
   * @return {boolean}
   */
  function isKeyboardEventType(type) {
    return type === 'keydown' || type === 'keypress' || type === 'keyup';
  }

  /**
   * Determines whether an event type is a mouse event type.
   *
   * @param {string} type The event type
   * @return {boolean}
   */
  function isMouseEventType(type) {
    return type === 'click' || type === 'dblclick' ||
      type === 'mousedown' || type === 'mousemove' || type === 'mouseout' ||
      type === 'mouseover' || type === 'mouseup' || type === 'mousewheel';
  }

  /**
   * Determines whether an event type is a touch event type.
   *
   * @param {string} type The event type
   * @return {boolean}
   */
  function isTouchEventType(type) {
    return type === 'touchstart' || type === 'touchend' ||
      type === 'touchmove' || type === 'touchcancel';
  }

  /**
   * Finds the first object that is a bonsai object out of the passed node and
   * its ancestors.
   *
   * @param {Node} node The node to start the search with
   * @return {Node}
   */
  function findBonsaiObject(node) {
    while (node && (node.nodeType !== ELEMENT_NODE || !node.hasAttribute('data-bs-id'))) {
      node = node.parentNode;
    }
    return node;
  }

  /**
   * @param {EventEmitter} emitter The event emitter to emit the event on
   * @param {PointerEvent} event The pointer event to dispatch
   * @param {number} targetId The bonsai id of the event target
   * @param {number} [relatedTargetId] The bonsai id of the related target, if any
   * @param {Array} [objectsUnderPointerIds] An array of element ids under the mouse pointer
   */
  function emitMouseEvent(emitter, event, targetId, relatedTargetId, objectsUnderPointerIds) {
    emitter.emit('userevent', event, targetId, relatedTargetId, objectsUnderPointerIds);
    if (!TOUCH_SUPPORT) {
      // If we're on a non-touch platform (e.g. regular desktop)
      // then fire the mutli: event so we get cross-platform support:
      emitter.emit('userevent', event.clone('multi:' + event.type), targetId, relatedTargetId, objectsUnderPointerIds);
    }
  }

  /**
   * @param {EventEmitter} emitter The event emitter to emit the event on
   * @param {PointerEvent} event The pointer event to dispatch
   * @param {number} targetId The bonsai id of the event target
   * @param {boolean} isMultiTouch Whether the touch is part of a multitouch gesture
   * @param {Array} [objectsUnderPointerIds] An array of element ids under the finger tip
   */
  function emitTouchEvent(emitter, event, targetId, isMultiTouch, objectsUnderPointerIds) {
    var type = event.type;
    event.type = 'multi:' + type;
    emitter.emit('userevent', event, targetId, null, objectsUnderPointerIds);
    if (!isMultiTouch) {
      emitter.emit('userevent', event.clone(type), targetId, null, objectsUnderPointerIds);
    }
  }

  function getTouchTargetId(domTouch, domEventTarget, targetId) {
    return domTouch.target === domEventTarget ?
      targetId : max(0, getBonsaiIdOf(findBonsaiObject(domTouch.target)));
  }

  // These are mixed-in into the svg-renderer's prototype.

  return {
    handleEvent: function(domEvent) {
      var domEventTarget = domEvent.target, domEventType = domEvent.type;
      if (TOUCH_SUPPORT === null) {
        TOUCH_SUPPORT = 'createTouch' in domEventTarget.ownerDocument;
      }

      var target = findBonsaiObject(domEventTarget);
      var targetId = getBonsaiIdOf(target);
      var isMouseEvent = isMouseEventType(domEventType);
      var isTouchEvent = isTouchEventType(domEventType);
      if (targetId < 0) { targetId = 0; }

      if (isMouseEvent || isTouchEvent) {
        var stageOffset = this.getOffset();
        var stageX = stageOffset.left, stageY = stageOffset.top;
        var pointerEvent;
        if (isMouseEvent) {
          pointerEvent = PointerEvent
            .fromDomMouseEvent(domEvent, stageX, stageY);
          var relatedTarget = findBonsaiObject(domEvent.relatedTarget || domEvent.fromElement);
          this.handleMouseEvent(pointerEvent, targetId, relatedTarget && getBonsaiIdOf(relatedTarget));
        } else {
          TOUCH_SUPPORT = true;

          var domTouch, touchTargetId;
          var changedTouches = domEvent.changedTouches;
          var numTouches = changedTouches.length;

          if (domEventType === 'touchstart') {
            this._isMultiTouch =
              this._isMultiTouch || numTouches > 1 || domEvent.touches.length > 1;
          } else if (domEventType === 'touchmove') {
            //if (this.consistentPointerMoveTargets) {
              //TODO: get first element under pointer that does not have pointer-events: none set
              //TODO: implement setting logic for this option
            //}
            this._hadTouchMove = true;
            // only prevent default for SVG elements, not for embedded html
            if (!this.allowEventDefaults) {
              // event killing is needed to prevent native scrolling etc. within bonsai movies
              domEvent.preventDefault();
            }
          } else if (domEventType === 'touchcancel') {
            this._hadTouchCancel = true;
          }

          for (var i = 0; i < numTouches; i += 1) {
            domTouch = changedTouches[i];
            pointerEvent = PointerEvent.fromDomTouch(domTouch, domEvent, stageX, stageY);
            touchTargetId = getTouchTargetId(domTouch, domEventTarget, targetId);
            this.handleTouchEvent(pointerEvent, touchTargetId);
          }

          if (domEventType === 'touchend' && domEvent.touches.length === 0) { // last finger is raised
            if (!(this._isMultiTouch || this._hadTouchMove || this._hadTouchCancel)) {
              var domTimeStamp = domEvent.timeStamp;
              var isDoubleClick = domTimeStamp - (this._lastClickFromTouch || 0) < 300;
              var clickType = isDoubleClick ? 'dblclick' : 'click';
              this._lastClickFromTouch =  isDoubleClick ? 0 : domTimeStamp;
              emitMouseEvent(this, pointerEvent.clone(clickType), touchTargetId);
              domEvent.preventDefault(); // prevent the default click
            }
            this._isMultiTouch = this._hadTouchCancel = false;
          }
        }
      } else if (isKeyboardEventType(domEventType)) {
//        var ownerDocument = domEventTarget.ownerDocument;

//        if (!target || target._isBSDOMElement || ownerDocument.activeElement === ownerDocument.body) {} else {
//          // There is another currently focused element (outside of the stage), exit:
//          return;
//        }

        var keyboardEvent = KeyboardEvent.fromDomKeyboardEvent(domEvent);
        this.emit('userevent', keyboardEvent, targetId);
      }
    },

    handleMouseEvent: function(pointerEvent, targetId, relatedTargetId) {
      var type = pointerEvent.type, x = pointerEvent.x, y = pointerEvent.y;
      if (!type) { return; }

      var objectUnderPointerIds;
      if (this.objectsUnderPointer) {
        objectUnderPointerIds = this.getElementIdsUnderPointer(x, y);
      }

      if (type === 'pointerdown') {
        this._mouseDragId = targetId;
        this._mouseDragStartX = x;
        this._mouseDragStartY = y;
      } else if (type === 'pointermove') {
        pointerEvent.deltaX = x - this._mouseMoveLastX;
        pointerEvent.deltaY = y - this._mouseMoveLastY;
        var dragId = this._mouseDragId;
        if (dragId === +dragId) { // emit drag events if the mouse is down.
          var dragEvent = pointerEvent.clone('drag');
          dragEvent.diffX = x - this._mouseDragStartX;
          dragEvent.diffY = y - this._mouseDragStartY;
          emitMouseEvent(this, dragEvent, dragId, null, objectUnderPointerIds);
        }
      } else if (type === 'pointerup') {
        this._mouseDragId = this._mouseDragStartX = this._mouseDragStartY = undefined;
      }
      this._mouseMoveLastX = x;
      this._mouseMoveLastY = y;
      emitMouseEvent(this, pointerEvent, targetId, relatedTargetId, objectUnderPointerIds);
    },

    /**
     *
     * @param {PointerEvent} pointerEvent
     * @param {number} targetId
     */
    handleTouchEvent: function(pointerEvent, targetId) {
      var type = pointerEvent.type, touchId = pointerEvent.touchId;

      if (!type) { return; }

      var x = pointerEvent.x, y = pointerEvent.y;

      var objectUnderPointerIds;
      if (this.objectsUnderPointer) {
        objectUnderPointerIds = this.getElementIdsUnderPointer(x, y);
      }

      var isMultiTouch = this._isMultiTouch;
      var touchStates = this._touchStates || (this._touchStates = {});

      if (type === 'pointerup') {
        delete touchStates[touchId];
      } else {
        var touchData = touchStates[touchId] || (touchStates[touchId] = {});
        if (type === 'pointerdown') {
          touchData.dragStartX = x;
          touchData.dragStartY = y;
          touchData.dragId = targetId;
        } else if (type === 'pointermove') {
          pointerEvent.diffX = x - touchData.dragStartX;
          pointerEvent.diffY = y - touchData.dragStartY;
          pointerEvent.deltaX = x - touchData.lastX;
          pointerEvent.deltaY = y - touchData.lastY;
          emitTouchEvent(this, pointerEvent.clone('drag'), targetId, isMultiTouch, objectUnderPointerIds);
        }
        touchData.lastX = x;
        touchData.lastY = y;
      }
      emitTouchEvent(this, pointerEvent, targetId, isMultiTouch, objectUnderPointerIds);
    },

    getElementIdsUnderPointer: function(x, y) {
      var elements = checkIntersection(this.svg.root, x, y);
      if (!elements) { return null; }
      var ids = [], hasIds = false;
      for (var i  = 0, element; (element = elements[i]); i += 1) {
        var id = getBonsaiIdOf(element);
        if (id > 0 && ids.indexOf(id) !== 1) {
          hasIds = true;
          ids.push(id);
        }
      }

      return hasIds ? ids : null;
    }
  };
});
