define(function() {
  'use strict';

  var hasSupport, svgRect;

  function initSvgRect(svgElement) {
    svgRect = svgElement.createSVGRect();
    svgRect.width = svgRect.height = 1;
  }

  function checkSupport(svgElement) {
    initSvgRect(svgElement);
    svgRect.x = svgRect.y = 0;
    try { // Gecko throws an error
      // Opera/Presto needs the second argument. Older WebKits return null.
      hasSupport = !!svgElement.getIntersectionList(svgRect, null);
    } catch (e) {
      hasSupport = false;
    }

    if (!hasSupport) { svgRect = null; } // clean up
  }

  return function(svgElement, x, y) {
    if (hasSupport === undefined) {
      checkSupport(svgElement);
    }

    if (!hasSupport) {
      return null;
    }

    svgRect.x = x;
    svgRect.y = y;

    // second argument needed for Opera/Presto
    var elementsUnderPoint = svgElement.getIntersectionList(svgRect, null);
    var numElements = elementsUnderPoint.length;

    if (!numElements) { return null; }

    // getIntersectionList() returns in document order. Reversing brings the
    // topmost element to index 0.
    var result = Array(numElements);
    for (var i = 0; i < numElements; i += 1) {
      result[i] = elementsUnderPoint[numElements - 1 - i];
    }

    return result;
  };
});
