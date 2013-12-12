define([], function() {
  'use strict';

  /**
   * Animation translations for cornerRadius
   * @ignore
   */

  return {
    cornerRadius: {
      toNumeric: function(cornerRadius) {
        cornerRadius = cornerRadius || 0;
        return [
          cornerRadius[0] || cornerRadius,
          cornerRadius[1] || cornerRadius,
          cornerRadius[2] || cornerRadius,
          cornerRadius[3] || cornerRadius
        ];
      },
      toAttr: function(numbers) {
        return numbers;
      }
    }
  };
});
