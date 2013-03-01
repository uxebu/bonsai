/**
 * SVGRenderer's event handling methods
 *
 * @requires module:renderer
 */
define([
  '../../tools'
], function(tools) {
  'use strict';

  /** @const */
  var ELEMENT_NODE = 1;

  var TOUCH_SUPPORT = typeof document == 'undefined' ? false : 'createTouch' in document;
  var rMultiEvent = /drag|pointerup|pointerdown|pointermove/;
  var rPointerEvent = /click|pointer/;

  function cloneBasicEvent(e) {
    return tools.mixin({}, e);
  }

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
   * Determines whether a DOM node is an SVG element
   * @param {Node} node
   * @return {boolean}
   */
  function isSvgElement(node) {
    return 'ownerSVGElement' in node;
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

  // These are mixed-in into the svg-renderer's prototype.

  return {

    handleSingleTouch: function(touchEvent, touchData, isMulti) {

      // Handle a single touch from DomEvent.touches (touch-capable devices)

      var event = this._getBasicEventData(touchEvent),
          clientX = event.clientX,
          clientY = event.clientY,
          prefix = isMulti ? 'multi:' : '',
          target = findBonsaiObject(touchEvent.target),
          targetId = getBonsaiIdOf(target),
          type = touchEvent.type,
          trueTarget = document.elementFromPoint(touchEvent.pageX, touchEvent.pageY),
          trueTargetId = trueTarget ? getBonsaiIdOf(trueTarget) : 0;

      event.touchId = touchEvent.identifier;
      event.touchIndex = touchEvent.index;

      switch (type) {
        case 'touchstart':
          touchData.startX = clientX;
          touchData.startY = clientY;
          event = cloneBasicEvent(event);
          event.type = prefix + 'pointerdown';
          this.emit('userevent', event, targetId);
          break;
        case 'touchmove':
          event.diffX = clientX - touchData.startX;
          event.diffY = clientY - touchData.startY;
          touchData.touchMoveHappened = true;
          event = cloneBasicEvent(event);
          event.type = prefix + 'drag';
          this.emit('userevent', event, targetId);
          event = cloneBasicEvent(event);
          event.type = prefix + 'pointermove';
          this.emit('userevent', event, trueTargetId);
          break;
        case 'touchend':
          event = cloneBasicEvent(event);
          event.type = prefix + 'pointerup';
          this.emit('userevent', event, targetId);
          if (target !== trueTarget) {
            event = cloneBasicEvent(event);
            this.emit('userevent', event, trueTargetId);
          }
          if (!isMulti && !touchData.touchMoveHappened) {
            // If the touch hasn't moved then it is a click (only for the first finger):
            event = cloneBasicEvent(event);
            event.type = 'click';
            this.emit('userevent', event, targetId);
          }
      }
    },

    handleTouchEvent: function(domEvent) {

      var allTouches = [].slice.call(domEvent.touches),
          changedTouches = domEvent.changedTouches,
          touchData = this.touchData || (this.touchData = {}),
          type = domEvent.type,
          identifier,
          singleTouchData,
          touch;

      if (changedTouches && changedTouches.length) {
        // Go through new touch events and fire individually:
        for (var i = 0, l = changedTouches.length; i < l; ++i) {
          touch = changedTouches[i];
          // Handle each touch individually:
          identifier = touch.identifier;
          touch.type = type;
          touch.index = allTouches.indexOf(touch);

          singleTouchData = touchData[identifier] || (touchData[identifier] = {});
          this.handleSingleTouch(touch, singleTouchData, true);

          // Fire the non-multi event for the very first event in the touch-list
          if (i === 0) {
            this.handleSingleTouch(touch, singleTouchData, false);
          }
        }
      }
    },

    handleEvent: function(domEvent) {

      var target = domEvent.target;

      // only prevent default for SVG elements, not for embedded html
      if (!this.allowEventDefaults && isSvgElement(target)) {
        // event killing is needed to prevent native scrolling etc. within bonsai movies
        domEvent.preventDefault();
      }

      target = findBonsaiObject(domEvent.target);

      var type = domEvent.type, data = this;
      var targetId = getBonsaiIdOf(target);
      if (targetId < 0) {
        targetId = 0;
      }

      var relatedTarget;

      var event = this._getBasicEventData(domEvent),
          clientX = event.clientX,
          clientY = event.clientY;

      var last = data._lastEventPos || [clientX, clientY];
      var start = data._startEventPos || [clientX, clientY];

      if (/^touch/.test(domEvent.type)) {
        this.handleTouchEvent(domEvent);
        return;
      }

      switch (type) {

        case 'dblclick':
          type = 'doubleclick';
          break;
        case 'click':
          break;

        case 'mousewheel':
          // TODO: Ensure support
          event.delta = domEvent.wheelDelta;
          break;

        case 'touchend':
        case 'mouseup':
          targetId = data._dragId;
          event.diffX = clientX - start[0];
          event.diffY = clientY - start[1];
          delete data._currentTouch;
          delete data._dragId;
          delete data._startEventPos;
          delete data._lastEventPos;
          type = 'pointerup';
          break;

        case 'touchstart':
          if (data._currentTouch) {
            // Don't allow other touches while once has yet to end.
            return;
          }
          data._currentTouch = domEvent.touches[0].identifier;
        case 'mousedown':
          data._dragId = targetId;
          data._startEventPos = [clientX, clientY];
          type = 'pointerdown';
          break;

        case 'touchmove':
          if (domEvent.touches[0].identifier !== data._currentTouch) {
            return;
          }
        case 'mousemove':
          // Regular mousemove event (not dragging)
          (event = cloneBasicEvent(event)).type = 'pointermove';
          this.emit('userevent', event, targetId);
          // must call multi too (for cross-platform)
          (event = cloneBasicEvent(event)).type = 'multi:pointermove';
          this.emit('userevent', event, targetId);

          targetId = data._dragId;
          type = 'drag';
          event.diffX = clientX - start[0];
          event.diffY = clientY - start[1];
          event.deltaX = clientX - last[0];
          event.deltaY = clientY - last[1];
          break;
        case 'keypress':
          type = 'key';
          var charCode = domEvent.charCode;
          if (!charCode) {
            charCode = domEvent.keyCode;
          }
          if (domEvent.shiftKey) {
            charCode = (String.fromCharCode(charCode)).toUpperCase().charCodeAt(0);
          }
          event.charCode = charCode;
        case 'keyup':
        case 'keydown':
          if (target && !target._isBSDOMElement && document.activeElement !== document.body) {
            // There is another currently focused element (outside of the stage), exit:
            return;
          }
          event.keyCode = domEvent.keyCode;
          event.ctrlKey = domEvent.ctrlKey;
          event.altKey = domEvent.altKey;
          event.metaKey = domEvent.metaKey;
          event.shiftKey = domEvent.shiftKey;
          // Pass focused element's value to bonsai
          event.inputValue = domEvent.target.value;
          break;

        case 'mouseover':
          relatedTarget = domEvent.relatedTarget || domEvent.fromElement;
          relatedTarget = findBonsaiObject(relatedTarget);
          break;
        case 'mouseout':
          relatedTarget = domEvent.relatedTarget || domEvent.toElement;
          relatedTarget = findBonsaiObject(relatedTarget);
          break;
      }

      data._lastEventPos = [clientX, clientY];
      event.type = type;

      if (rPointerEvent.test(type)) {
        // Guide: http://unixpapa.com/js/mouse.html
        event.isRight = domEvent.which ? domEvent.which === 3 : domEvent.button === 2;
        event.isMiddle = domEvent.which ? domEvent.which === 2 : domEvent.button === 4;
        event.isLeft = domEvent.which ? domEvent.which === 1 :
          domEvent.button === 1 || domEvent.button === 0;
      }

      this.emit('userevent', event, targetId, relatedTarget && getBonsaiIdOf(relatedTarget));

      if (!TOUCH_SUPPORT && rMultiEvent.test(type)) {
        // If we're on a non-touch platform (e.g. regular desktop)
        // then fire the mutli: event so we get cross-platform support:
        event = cloneBasicEvent(event);
        event.type = 'multi:' + type;
        this.emit('userevent', event, targetId);
      }
    },

    _getBasicEventData: function(e) {

      var stageOffset = this.getOffset(),
          clientX = e.clientX || (e.touches && e.touches.length && e.touches[0].clientX) || 0,
          clientY = e.clientY || (e.touches && e.touches.length && e.touches[0].clientY) || 0,
          stageX = clientX - stageOffset.left,
          stageY = clientY - stageOffset.top;

      return {
        stageX: stageX,
        stageY: stageY,
        x: stageX,
        y: stageY,
        clientX: clientX,
        clientY: clientY
      };
    }
  };
});
