define(['pixi'], function(pixi) {
  'use strict';

  /*
  Object {type: "saturate", value: 5}
  Object {type: "hueRotate", value: 90}
  Object {type: "brightness", value: 2}
  Object {type: "contrast", value: 2}
  Object {type: "opacity", value: 0.5}
  Object {type: "dropShadowByOffset", value: Array[4]}
   */

  var filterMap = {
    blur: function(value) {
      var filter = new pixi.BlurFilter();
      filter.blur = value;
      return filter;
    },
    grayscale: function(value) {
      var filter = new pixi.GrayFilter();
      filter.gray = value;
      return filter;
    },
    // TODO: convert SVG's 20-matrix pixi's to 16-matrix
    colorMatrix: function(matrix) {
      var filter = new pixi.ColorMatrixFilter();
      filter.matrix = matrix.splice(0, 16);
      return filter;
    },
    invert: function(value) {
      var filter = new pixi.InvertFilter();
      filter.invert = value;
      return filter;
    },
    sepia: function(value) {
      var filter = new pixi.SepiaFilter();
      filter.sepia = value;
      return filter;
    }
  };

  return function(message, renderObjects) {
    var i, filter, applyFilters = [];
    var filters = message.attributes && message.attributes.filters;
    if (filters == null) return;
    var renderObject = renderObjects[message.id];
    for (i = 0; (filter = filters[i++]);) {
      if (filterMap[filter.type]) {
        applyFilters.push(filterMap[filter.type](filter.value));
      }
    }
    if (applyFilters.length) {
      renderObject.pixiObject.filters = applyFilters;
    }
  };

});
