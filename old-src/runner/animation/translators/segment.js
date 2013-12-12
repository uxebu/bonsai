define(['../../../color'], function(color) {
  'use strict';

  /**
   * Animation translations for shape segments
   * @ignore
   */

  return {
    segments: {
      toNumeric: function(segments, isEndValues) {
        var numbers = [];
        if (!isEndValues) {
          this.segments = segments;
        }
        for (var i = 0, l = segments.length; i < l; ++i) {
          var segment = segments[i];
          for (var s = 0, sl = segment.length; s < sl; ++s) {
            if (!isNaN(segment[s])) {
              numbers.push(segment[s]);
            }
          }
        }
        return numbers;
      },
      toAttr: function(numbers) {

        var segments = this.segments;
        var n = 0;

        for (var i = 0, l = segments.length; i < l; ++i) {

          var segment = segments[i];

          for (var s = 0, sl = segment.length; s < sl; ++s) {
            if (!isNaN(segment[s])) {
              segment[s] = numbers[n++];
            }
          }
        }

        return segments;
      }
    }
  };
});
