define([
  './display_layer'
], function(DisplayLayer) {
  'use strict';

  /**
   * A layer representing <div>
   */
  function DOMLayer(displayGroup) {
    DisplayLayer.call(this, displayGroup);
    this.appendee = this.dom;
  }

  DOMLayer.prototype = Object.create(DisplayLayer.prototype);
  
  DOMLayer.prototype._makeDOM = function() {
    var dom = document.createElement('div');
    dom.setAttribute('data-bs-type', 'domLayer');
    return dom;
  };

  DOMLayer.prototype.isEmpty = function() {
    return this.dom.childNodes.length === 0;
  };

  return DOMLayer;

});