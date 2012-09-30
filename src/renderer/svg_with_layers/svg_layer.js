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
    var svg = this.svg = createSVGElement('svg');
    width = width || 1000;
    height = height || 1000;
    svg.style.pointerEvents = 'none';
    // TODO: We require a pixel width/height for this to work in safari.
    var group = createSVGElement('g');
    group.style.pointerEvents = 'auto';
    svg.appendChild(group);
    if (width && height) {
      // SVG will not show its descendents outside of its viewport, so, we
      // need to ensure that the SVG layer's viewport is extended to the 
      // very-edges of the stage. We do this by position it far up top-left,
      // giving it very large dimensions, applying its intended position
      // to the main appendee (the <g>):
      svg.style.left = -1e4 + 'px';
      svg.style.top = -1e4 + 'px';
      svg.setAttribute('width', (1e4 + width));
      svg.setAttribute('height', (1e4 + height));
      group.setAttribute(
        'transform',
        'matrix(1,0,0,1,' + 1e4 + ',' + 1e4 + ')'
      );
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