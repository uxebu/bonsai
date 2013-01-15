define(function() {
  'use strict';

  /**
   * Animation translations for shape segments
   * @ignore
   */

  return {
    strokeDash: {
      toNumeric: function(strokeDashes, isEndValues) {
        var numbers = [];
        if (!isEndValues) {
          this.strokeDash = strokeDashes;
        }
        for (var i = 0, l = strokeDashes.length; i < l; ++i) {
          var strokeDash = strokeDashes[i];
          if (!isNaN(strokeDash)) {
            numbers.push(strokeDash);
          }
        }
        return numbers;
      },
      toAttr: function(numbers) {
        var strokeDashes = numbers;
        for (var i = 0, l = strokeDashes.length; i < l; i++) {
          var strokeDash = strokeDashes[i];
          if (isNaN(strokeDash)) {
            strokeDashes[i] = 0;
          }
        }

        return strokeDashes;
      }
    }
  };
});

