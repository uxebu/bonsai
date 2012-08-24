define([
  './display_layer',
  './utils'
], function(DisplayLayer, utils) {
  'use strict';

  var createSVGElement = utils.createSVGElement;

  /**
   * A layer representing <svg>
   */
  function SVGLayer(displayGroup) {
    DisplayLayer.call(this, displayGroup);
    this.appendee = this.rootGroup;
  }

  SVGLayer.prototype = Object.create(DisplayLayer.prototype);

  SVGLayer.prototype._makeDOM = function(width, height) {
    var svg = createSVGElement('svg');
    svg.style.pointerEvents = 'none';
    // TODO: We require a pixel width/height for this to work in safari.
    svg.setAttribute('width', 1000);
    svg.setAttribute('height', 1000)
    var group = createSVGElement('g');
    group.style.pointerEvents = 'auto';
    svg.appendChild(group);
    if (width && height) {
      svg.setAttribute('viewBox', '-0.5 -0.5 ' + width + ' ' + height);
    }
    this.rootGroup = group;
    // Expose the <g> as the newLayer so any SVGElements are appended
    // to it. The actual <Svg> can be accessed as `newLayer.root`
    return svg; 
  };

  SVGLayer.prototype.isEmpty = function() {
    return this.dom.childNodes.length === 1 &&
      this.dom.firstChild.childNodes.length === 0; // <defs> or <g>
  };

  return SVGLayer;

});