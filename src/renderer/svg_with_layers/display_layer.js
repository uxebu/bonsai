define([], function() {
  'use strict';

  /**
   * A single layer appended to a DisplayGroup
   * NOTE: Should be inherited and not instantiated directly.
   */
  function DisplayLayer(displayGroup) {

    var width = displayGroup && displayGroup.width || 0,
        height = displayGroup && displayGroup.height || 0;

    this.parentDisplayGroup = displayGroup;
    this.dom = this._makeDOM(width, height);

    this.dom.style.position = 'absolute';
    this.dom.style.top = '0';
    this.dom.style.left = '0';

    if (width) {
      this.dom.style.width = width + 'px';
    }
    if (height) {
      this.dom.style.height = height + 'px';
    }

  }

  DisplayLayer.prototype.isEmpty = function() {
    throw 'isEmpty should be implemented by subclass';
  };

  return DisplayLayer;

});