define([
  '../../tools'
],
function(tools) {
  var max = Math.max;
  var forEach = tools.forEach;

  var eventTypesForRoot = [
    'click',
    'dblclick',
    'mousedown',
    'mouseenter',
    'mouseleave',
    'mousemove',
    'mouseout',
    'mouseover',
    'mouseup',
    'touchcancel',
    'touchend',
    'touchmove',
    'touchstart'
  ];

  var eventTypesForDocument = ['keydown', 'keypress', 'keyup'];

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

  function EventHandler(renderer) {
    this.hadTouchCancel = false;
    this.hadTouchMove = false;
    this.isMultiTouch = false;
    this.lastClickFromTouchTime = 0;
    this.mouseDragId = undefined;
    this.mouseDragStartX = undefined;
    this.mouseDragStartY = undefined;
    this.mouseMoveLastX = undefined;
    this.mouseMoveLastY = undefined;
    this.renderer = renderer;
    this.touchStates = {};
  }

  EventHandler.prototype = {
    connect: function(rootNode) {
      forEach(eventTypesForRoot, function(eventType) {
        root.addEventListener(eventType, this, false);
      }, this);
      var document = rootNode.ownerDocument;
      forEach(eventTypesForDocument, function(eventType) {
        document.addEventListener(eventType, this, false);
      });
    },

    disconnect: function(rootNode) {
      forEach(eventTypesForRoot, function(eventType) {
        root.removeEventListener(eventType, this, false);
      }, this);
      var document = rootNode.ownerDocument;
      forEach(eventTypesForDocument, function(eventType) {
        document.removeEventListener(eventType, this, false);
      });
    },

    handleEvent: function(domEvent) {
      var renderer = this.renderer;
      var domEventTarget = domEvent.target, domEventType = domEvent.type;

      var targetId = renderer.getBonsaiIdFor(domEventTarget);
      if (targetId < 0) { return; }

      var isMouseEvent = isMouseEventType(domEventType);
      var isTouchEvent = isTouchEventType(domEventType);

      if (isMouseEvent || isTouchEvent) {
        var stageOffset = renderer.getOffset();
        var stageX = stageOffset.left, stageY = stageOffset.top;
        var pointerEvent;

        if (isMouseEvent) {
          var relatedTargetId, relatedTarget = domEvent.relatedTarget;
          if (relatedTarget) {
            relatedTargetId = renderer.getBonsaiIdFor(relatedTarget);
          }
          pointerEvent = PointerEvent
            .fromDomMouseEvent(domEvent, stageX, stageY);

          this.handleMouseEvent(pointerEvent, targetId, relatedTargetId);
        } else { // touch event
          var domTouch, touchTargetId;
          var changedTouches = domEvent.changedTouches;
          var numTouches = changedTouches.length;

          if (domEventType === 'touchstart') {
            this.isMultiTouch =
              this.isMultiTouch || numTouches > 1 || domEvent.touches.length;
          } else if (domEventType === 'touchmove') {
            this.hadTouchMove = true;
            // event killing is needed to prevent native scrolling etc.
            // within bonsai movies
            if (!renderer.allowEventDefaults) {
              domEvent.preventDefault();
            }
          }

          for (var i = 0; i < numTouches; i += 1) {
            domTouch = changedTouches[i];
            pointerEvent = PointerEvent
              .fromDomTouch(domTouch, domEvent, stageX, stageY);
            touchTargetId = renderer.getBonsaiIdFor(domTouch.target, domEventTarget, targetId);
            this.handleTouchEvent(pointerEvent, touchTargetId);
          }

          if (domEventType === 'touchend' && domEvent.touches.length === 0) { // last finger raised
            if (!(this.isMultiTouch || this.hadTouchMove || this.hadTouchCancel)) {
              this.triggerClickFromTouch(domEvent, pointerEvent);
              domEvent.preventDefault(); // prevent default click
            }
            this.isMultiTouch = this.hadTouchMove = this.hadTouchCancel = false;
          }
        }
      } else if (isKeyboardEventType(domEventType)) {
//TODO: check this bailout
//        if (!target || target._isBSDOMElement || ownerDocument.activeElement === ownerDocument.body) {} else {
//          // There is another currently focused element (outside of the stage), exit:
//          return;
//        }
        var keyboardEvent = KeyboardEvent.fromDomKeyboardEvent(domEvent);
        this.emit('userevent', keyboardEvent, targetId);
      }
    },

    handleMouseEvent: function(pointerEvent, targetId, relatedTargetId) {

    },

    triggerClickFromTouch: function(domEvent, pointerEvent) {
      var domTimeStamp = domEvent.timeStamp;
      var isDoubleClick = domTimeStamp - this.lastClickFromTouchTime < 300;
      var clickType = isDoubleClick ? 'dblclick' : 'click';
      this.lastClickFromTouchTime = isDoubleClick ? 0 : domTimeStamp;
      this.renderer.emit('userevent', pointerEvent.clone(clickType), touchTargetId);
    }
  };

  return EventHandler;
});
