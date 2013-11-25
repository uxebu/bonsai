define(['./display_element'], function(DisplayElement) {
  'use strict';

  function SVGElement(dom, parentGroup, parentLayer) {
    DisplayElement.call(this, dom, parentGroup, parentLayer);
  }

  SVGElement.prototype = Object.create(DisplayElement.prototype);

  return SVGElement;

});