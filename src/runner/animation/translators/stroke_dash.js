define(function() {
  'use strict';

  /**
   * Animation translations for shape segments
   * @ignore
   */

  return {
    strokeDash: {
      toNumeric: function(strokeDashes, isEndValues) {
        var numbers = [], i = 0, len = strokeDashes.length;
        for (i; i < len; ++i) {
          if (!isNaN(strokeDashes[i])) {
            numbers.push(strokeDashes[i]);
          }
        }
        return numbers;
      },
      toAttr: function(strokeDashes) {
        var i = 0, len = strokeDashes.length;
        for (i; i < len; ++i) {
          if (isNaN(strokeDashes[i])) {
            strokeDashes[i] = 0;
          }
        }

        return strokeDashes;
      }
    }
  };
});

