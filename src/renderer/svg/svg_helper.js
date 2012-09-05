/**
 * This module contains general helpers for the svg renderer
 *
 * @exports svg_helper
 */
define([
], function() {
  'use strict';

  var hasOwn = {}.hasOwnProperty;
  var helpers = {

    filterToSignature: function filterToSignature(filter) {
      return filter.type + '(' + filter.value + ')';
    },

    gradientToSignature: function gradientToSignature(gradient) {
      // Create a gradient signature so we can cache the usage of gradients
      // and re-use them (signatures will be stored in `this.definitions`)
      switch (gradient.type) {
        case 'linear-gradient':
          return 'linear-gradient' + [
            gradient.direction,
            gradient.stops,
            helpers.matrixToString(gradient.matrix),
            gradient.spreadMethod
          ].join(':');
        case 'radial-gradient':
          return 'radial-gradient' + [
            gradient.cx,
            gradient.cy,
            gradient.radius,
            gradient.stops,
            helpers.matrixToString(gradient.matrix),
            gradient.spreadMethod
          ].join(':');
      }
    },

    valueFromSignatureForType: function valueFromSignatureForType(signature, type) {
      var found = new RegExp(type + '\\((.+)\\)').exec(signature);
      return found && found[1];
    },

    matrixToString: function matrixToString(matrix) {
      return matrix ? 'matrix(' + [
        matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty
      ].join(',') + ')' : '';
    },

    /**
     * Basic module for adding/removing css classes (style bulks)
     */
    cssClasses: (function() {

      // return early when document context is not available
      if (typeof document === 'undefined') {
        return;
      }

      // The renderer maintains a <style> element (in the <HEAD> of the document).
      // To this <style> the renderer appends items specified in `classes` variable
      // with uniquely generated class-names (bs-[DATE]-[UID]), to avoid conflicts.
      // Classes can be added to SVG elements by calling
      //    cssClasses.add(element, internalName)
      // `internalName` is, e.g. 'nonSelectable' (any defined in `classes`)

      var classes = {
        nonSelectable: '-webkit-touch-callout: none;' +
                        '-webkit-user-select: none;' +
                        '-khtml-user-select: none;' +
                        '-moz-user-select: none;' +
                        '-moz-user-select: -moz-none;' +
                        '-ms-user-select: none;' +
                        '-o-user-select: none;' +
                        'user-select: none;',
        selectable: '-webkit-touch-callout: default;' +
          '-webkit-user-select: text;' +
          '-khtml-user-select: text;' +
          '-moz-user-select: text;' +
          '-ms-user-select: text;' +
          '-o-user-select: text;' +
          'user-select: text;'
      };

      var classNameMap = {};
      var classNameUID = 0;
      // get <head/> if available, otherwise <body/>
      var headElement = (document.getElementsByTagName('head') || [document.body])[0];
      var styleText = [];
      // append a style tag to the <head/>
      var styleElement = headElement.appendChild(document.createElement('style'));


      for (var i in classes) {
        ++classNameUID;
        classNameMap[i] = 'bs-' + (+new Date()) + '-' + classNameUID;
        if (hasOwn.call(classes, i)) {
          styleText.push(
            '.' + classNameMap[i] + '{' + classes[i] + '}\n'
          );
        }
      }

      styleElement.appendChild(document.createTextNode(styleText.join('')));

      return {

        add: function(element, internalClassName) {
          var existingClasses = element.getAttribute('class') || '';
          element.setAttribute(
            'class', existingClasses + ' ' + classNameMap[internalClassName]
          );
        },
        remove: function(element, internalClassName) {

          element.setAttribute(
            'class',
            (element.getAttribute('class') || '').replace(classNameMap[internalClassName], '')
          );
        }
      };
    }())
  };

  return helpers;
});
