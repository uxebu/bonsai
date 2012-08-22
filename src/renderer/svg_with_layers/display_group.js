define([
  './display_layer',
  './svg_layer',
  './dom_layer',
  './utils'
], function(DisplayLayer, SVGLayer, DOMLayer, utils) {
  'use strict';

  var createSVGElement = utils.createSVGElement;

  /**
   * A DisplayGroup is the renderer's DisplayObject container. A DisplayGroup
   * will contain layers, either SVG or DOM, which will contain the group's
   * children. A DisplayGroup can contain other DisplayGroups.
   * DisplayGroup is generally analogous to `bonsai.Group`
   */
  function DisplayGroup(displayGroup, id) {
    this.id = id;
    this.layers = [];
    this.isDisplayGroup = true;
    this.tx = 0;
    this.ty = 0;
    DisplayLayer.call(this, displayGroup);
    this.appendee = this.dom;
  }

  var proto = DisplayGroup.prototype = Object.create(DisplayLayer.prototype);

  proto._makeDOM = function() {
    var dom = document.createElement('div');
    dom.setAttribute('data-bonsai-type', 'displayGroup');
    dom.setAttribute('data-bonsai-id', this.id);
    dom.style.position = 'relative';
    return dom;
  };

  proto.getResourcesSVGLayer = function() {
    var defs = createSVGElement('defs');
    var svgLayer = this.getSVGLayer();
    svgLayer.dom.appendChild(defs);
    svgLayer.defs = defs;
    svgLayer.isResourcesSVG = true;
    return svgLayer;
  };

  /** 
   * Retrieves SVG layer, either if it's already at the top of creates a 
   * new one
   */
  proto.getSVGLayer = function() {
    var topMost = this.layers[this.layers.length - 1];
    if (topMost && topMost instanceof SVGLayer && !topMost.isResourcesSVG) {
      return topMost;
    } else {
      return this.addLayer('svg');
    }
  };

  /** 
   * Retrieves DOM layer, either if it's already at the top of creates a 
   * new one
   */
  proto.getDOMLayer = function() {
    var topMost = this.layers[this.layers.length - 1];
    if (topMost && topMost instanceof DOMLayer) {
      return topMost;
    } else {
      return this.addLayer('dom');
    }
  };

  /** 
   * Executes a callback on every layer of the passed type
   */
  proto.forEachLayerOfType = function(type, callback) {
    for (var i = 0, l = this.layers.length; i < l; ++i) {
      if (this.layers[i].rootLayerType === type) {
        callback(this.layers[i]);
      }
    }
  };

  /** 
   * Removes a layer
   */
  proto.removeLayer = function(layerElement) {
    for (var i = 0, l = this.layers.length; i < l; ++i) {
      if (this.layers[i] === layerElement) {
        this.dom.removeChild(layerElement.dom);
        this.layers.splice(i, 1);
      }
    }
  };

  /**
   * Adds a layer of the passed type
   * Supported types: 'svg', 'dom'
   */
  proto.addLayer = function(type) {

    var newLayer = this.createLayer(type);

    this.dom.appendChild(newLayer.dom);
    this.layers.push(newLayer);

    // Update position of all layers:
    this.translatePosition(this.tx, this.ty);

    return newLayer;
  };

  proto.createLayer = function(type) {
    if (type === 'dom') {
      return new DOMLayer(this);
    } else if (type === 'svg') {
      return new SVGLayer(this);
    }
  };

  proto.insertLayerBefore = function(type, layer) {

    var newLayer = this.createLayer(type);
    if (layer) {
      var index = this.layers.indexOf(layer);
      this.layers.splice(index, 0, newLayer);
      this.dom.insertBefore(newLayer.dom, layer.dom);
    } else {
      this.layers.push(newLayer);
      this.dom.appendChild(newLayer.dom);
    }

    this.translatePosition(this.tx, this.ty);

    return newLayer;

  },

  proto.insertLayerAfter = function(type, layer) {
    var index = this.layers.indexOf(layer);
    return this.insertLayerBefore(type, this.layers[index + 1]);
  };

  proto.translatePosition = function(x, y) {
    var layer;
    this.tx = x;
    this.ty = y;
    for (var i = 0, l = this.layers.length; i < l; ++i) {
      layer = this.layers[i];
      //console.log(layer, layer.rootLayerType);
      if (layer instanceof DOMLayer) {
        layer.dom.style.left = x + 'px';
        layer.dom.style.top = y + 'px';
      } else if (layer instanceof SVGLayer) {
        layer.appendee.setAttribute(
          'transform',
          'matrix(1,0,0,1,' + x + ',' + y + ')'
        );
      }
    }
  };

  return DisplayGroup;

});