/**
 * This module contains filters used by svg renderers.
 *
 * @exports svg_filters
 */
define([
  '../../color'
], function(color) {
  'use strict';

  var isFEColorMatrixEnabled = typeof window !== 'undefined' && 'SVGFEColorMatrixElement' in window;

  function range(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function createElement(name, attributes, parentNode) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', name);
    if (attributes) {
      for (var key in attributes) {
        node.setAttribute(key, attributes[key]);
      }
    }
    if (parentNode) {
      parentNode.appendChild(node);
    }
    return node;
  }

  /**
   * The filter definitions.
   *
   * This is pure svg.
   */
  var filterDefs = {

    blur: function(value) {
      var filter = createElement('feGaussianBlur', {
        stdDeviation: value
      });
      return filter;
    },

    brightness: function(value) {
      var filter = createElement('feComponentTransfer');

      ['R','G','B'].forEach(function(aColor) {
        createElement('feFunc' + aColor, {
          type: 'linear',
          slope: value
        }, filter);
      });

      return filter;
    },

    contrast: function(value) {
      var value2 = -(0.5 * value + 0.5);
      var filter = createElement('feComponentTransfer');

      ['R','G','B'].forEach(function(aColor) {
        createElement('feFunc' + aColor, {
          type: 'linear',
          slope: value,
          intercept: value2
        }, filter);
      });

      return filter;
    },

    dropShadowByAngle: function(values) {
      var rad = values[0],
          dist = values[1];
      return this.dropShadowByOffset([
        dist * Math.cos(rad),
        dist * Math.sin(rad),
        values[2],
        values[3]
      ]);
    },

    /**
     *
     * @TODO: Use feDropShadow instead? Where is it implemented?
     */
    dropShadowByOffset: function(values) {
      var offsetX = values[0];
      var offsetY = values[1];
      var blurRadius = values[2];
      var bsColor = color(values[3]);
      var filter = [];

      var blur = createElement('feGaussianBlur', {
        stdDeviation: blurRadius
      });
      filter.push(blur);

      var offset = createElement('feOffset', {
        dx: offsetX,
        dy: offsetY,
        result: 'offsetblur'
      });
      filter.push(offset);

      var flood = createElement('feFlood', {
        'flood-color': bsColor.rgb(),
        'flood-opacity': bsColor.alpha(),
        result: 'flood'
      });
      filter.push(flood);

      var comp = createElement('feComposite', {
        in2: 'offsetblur',
        operator: 'in'
      });
      filter.push(comp);

      var merge = createElement('feMerge');
      createElement('feMergeNode', null, merge);
      createElement('feMergeNode', {
        'in': 'SourceGraphic'
      }, merge);
      filter.push(merge);

      return filter;
    },

    grayscale: function(value) {
      value = range(value, 0, 1);
      return filterDefs.saturate(value);
    },

    hueRotate: function(value) {
      value = range(value, 0, 360);
      var filter = createElement('feColorMatrix', {
        type: 'hueRotate',
        values: value
      });
      return filter;
    },

    invert: function(value) {
      value = range(value, 0, 1);
      var value2 = 1 - value;
      var filter = createElement('feComponentTransfer');

      ['R','G','B'].forEach(function(aColor) {
        createElement('feFunc' + aColor, {
          type: 'table',
          tableValues: value + ' ' + value2
        }, filter);
      });

      return filter;
    },

    opacity: function(value) {
      value = range(value, 0, 1);
      var filter = createElement('feComponentTransfer');

      createElement('feFuncA', {
        type: 'table',
        tableValues: '0 ' + value
      }, filter);

      return filter;
    },

    saturate: function(value) {
      value = 1 - value;
      var filter = createElement('feColorMatrix', {
        type: 'saturate',
        values: value
      });
      return filter;
    },

    sepia: function(value) {
      value = range(value, 0, 1);
      value = 1 - value;
      var matrix = [
        (0.393 + 0.607 * value), (0.769 - 0.769 * value), (0.189 - 0.189 * value), 0, 0,
        (0.349 - 0.349 * value), (0.686 + 0.314 * value), (0.168 - 0.168 * value), 0, 0,
        (0.272 - 0.272 * value), (0.534 - 0.534 * value), (0.131 + 0.869 * value), 0, 0,
        0, 0, 0, 1, 0
      ];
      var filter = createElement('feColorMatrix', {
        type: 'matrix',
        values: matrix.join(' ')
      });

      return filter;
    },

    colorMatrix: function(value) {
      return createElement('feColorMatrix', {
        type: 'matrix',
        values: value.join(' ')
      });
    }

  };

  var svgFilters = {
    /**
     * Creates a filter
     *
     * @param {string} name The filter function name
     * @param {mixed} value The value of that filter
     *
     * @returns {SVGElement} The SVG Filter
     */
    create: function(name, value) {
      return filterDefs[name](value);
    },

    isFEColorMatrixEnabled: isFEColorMatrixEnabled
  };


  return svgFilters;
});
