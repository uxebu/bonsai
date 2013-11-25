define(['./display_element'], function(DisplayElement) {
  'use strict';

  function DOMElement(dom, parentGroup, parentLayer) {
    DisplayElement.call(this, dom, parentGroup, parentLayer);
  }

  DOMElement.prototype = Object.create(DisplayElement.prototype);

  return DOMElement;

});