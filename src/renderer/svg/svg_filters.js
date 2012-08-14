/**
 * This module contains filters used by svg renderers.
 * Implementation details can be found here
 * https://dvcs.w3.org/hg/FXTF/raw-file/916184271e55/filters/master/SVGFilter.html
 *
 * @exports svg_filters
 */
define([
  '../../color'
], function(color) {
  'use strict';

  // prototype caching
  var unshift = [].unshift;
  var push = [].push;
  var concat = [].concat;

  var isWindowEnv = typeof window !== 'undefined';

  // check availability of Filters in current environment
  var isFEColorMatrixEnabled = isWindowEnv && 'SVGFEColorMatrixElement' in window;
  var isFEDropShadowEnabled = isWindowEnv && 'SVGFEDropShadowElement' in window;
  var isFEMergeEnabled = isWindowEnv && 'SVGFEMergeElement' in window;
  var isFEBlendEnabled = isWindowEnv && 'SVGFEBlendElement' in window;
  var isFECompositeEnabled = isWindowEnv && 'SVGFECompositeElement' in window;
  var isCSSDropShadowEnabled = isWindowEnv && 'webkitSvgShadow' in window.document.documentElement.style;

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

    innerShadowByAngle: function(values) {
      var rad = values[0],
          dist = values[1];
      return this.innerShadowByOffset([
        // offsetX
        dist * Math.cos(rad),
        // offsetY
        dist * Math.sin(rad),
        // blurRadius
        values[2],
        // color
        values[3]
      ]);
    },

    innerShadowByOffset: function(values) {
      var offsetX = values[0];
      var offsetY = values[1];
      var blurRadius = values[2];
      var bsColor = color(values[3]);
      var filters = [];

      var offset = createElement('feOffset', {
        dx: offsetX,
        dy: offsetY,
        result: 'offset'
      });
      filters.push(offset);

      var blur = createElement('feGaussianBlur', {
        'stdDeviation': blurRadius,
        'in': 'offset',
        'result': 'blur'
      });
      filters.push(blur);

      // invert the drop shadow
      var composite1 = createElement('feComposite', {
        'in': 'SourceGraphic',
        'in2': 'blur',
        'operator': 'out',
        'result': 'composite1'
      });
      filters.push(composite1);

      // apply color
      var flood = createElement('feFlood', {
        'flood-color': bsColor.rgb(),
        'flood-opacity': bsColor.alpha(),
        'in': 'composite1',
        'result': 'flood'
      });
      filters.push(flood);

      // clip color inside shadow
      var composite2 = createElement('feComposite', {
        'in': 'flood',
        'in2': 'composite1',
        'operator': 'in',
        'result': 'composite2'
      });
      filters.push(composite2);

      // merge shadow and source-graphic
      var composite3 = createElement('feComposite', {
        'in': 'composite2',
        'in2': 'SourceGraphic',
        'operator': 'over',
        'result': 'composite3'
      });
      filters.push(composite3);

      return filters;
    },

    dropShadowByAngle: function(values) {
      var rad = values[0],
          dist = values[1];
      return this.dropShadowByOffset([
        // offsetX
        dist * Math.cos(rad),
        // offsetY
        dist * Math.sin(rad),
        // blurRadius
        values[2],
        // color
        values[3]
      ]);
    },

    dropShadowByOffset: function(values) {
      var offsetX = values[0];
      var offsetY = values[1];
      var blurRadius = values[2];
      var bsColor = color(values[3]);
      var isBlack = bsColor.int32() === 255;
      var filters = [];

      // use `feDropShadow` filter primitive in case it's supported.
      // The expectation is that user agents can optimize the handling
      // by not having to do all the steps separately.
      if (isFEDropShadowEnabled) {
        return createElement('feDropShadow', {
          stdDeviation: blurRadius,
          dx: offsetX,
          dy: offsetY,
          'flood-color': bsColor.rgb(),
          'flood-opacity': bsColor.alpha()
        });
      }

      var blur = createElement('feGaussianBlur', {
        'stdDeviation': blurRadius,
        'in': 'SourceAlpha',
        'result': 'blur'
      });
      filters.push(blur);

      // optimize performance by dropping a flood-color of rgba(0,0,0,1)
      if (!isBlack) {
        var flood = createElement('feFlood', {
          'flood-color': bsColor.rgb(),
          'flood-opacity': bsColor.alpha(),
          'in': 'blur',
          'result': 'flood'
        });
        filters.push(flood);
      }

      var composite1 = createElement('feComposite', {
        'in': isBlack ? 'blur' : 'flood',
        'in2': 'blur',
        'operator': 'in',
        'result': 'composite1'
      });
      filters.push(composite1);

      var offset = createElement('feOffset', {
        dx: offsetX,
        dy: offsetY,
        result: 'offset'
      });
      filters.push(offset);

      var composite2 = createElement('feComposite', {
        'in': 'SourceGraphic',
        'in2': 'offset',
        'operator': 'over',
        'result': 'composite2'
      });
      filters.push(composite2);

      return filters;
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

  /*
   * Checks whether a filterList contains a flatten filter.
   */
  function containsFlattenFilter(filters) {
    filters = filters || [];
    for (var filter, i = 0, len = filters.length; i < len; i += 1) {
      filter = filters[i];
      if (isFEMergeEnabled && filter instanceof window.SVGFEMergeElement) {
        return true;
      }
      if (isFEBlendEnabled && filter instanceof window.SVGFEBlendElement) {
        return true;
      }
      if (isFECompositeEnabled && filter instanceof window.SVGFECompositeElement) {
        return true;
      }
    }
    return false;
  }

  /**
   * Creates an array of SVG Filters (filterList)
   *
   * @param {Array} list A list of instructions
   * @returns {Array} The SVG Filters
   */
  function filterElementsFromList(list) {
    list = list || [];
    var item, filters, filterList = [];
    for (var i = 0, len = list.length; i < len; i += 1) {
      item = list[i];
      if (typeof filterDefs[item.type] !== 'function') {
        continue;
      }
      // force `filters` to be of type `array`
      filters = concat.call([], filterDefs[item.type](item.value));
      // Check for flatten filters and put them at the start of the filterList.
      // Otherwise other filters would be "eaten" by "SourceGraphic".
      if (containsFlattenFilter(filters) && i > 0) {
        unshift.apply(filterList, filters);
      } else {
        push.apply(filterList, filters);
      }
    }
    return filterList;
  }

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
    containsFlattenFilter: containsFlattenFilter,
    filterElementsFromList: filterElementsFromList,
    isFEColorMatrixEnabled: isFEColorMatrixEnabled
  };


  return svgFilters;
});
