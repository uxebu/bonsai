define([], function() {
  'use strict';

  /**
   * Animation translations for cornerRadius
   * @ignore
   */

  return {
    cornerRadius: {
      setup: function(values) {
        var cornerRadius = values.cornerRadius;
        cornerRadius = cornerRadius || 0;
        values.cornerRadius0 = cornerRadius[0] || cornerRadius;
        values.cornerRadius1 = cornerRadius[1] || cornerRadius;
        values.cornerRadius2 = cornerRadius[2] || cornerRadius;
        values.cornerRadius3 = cornerRadius[3] || cornerRadius;
      },
      step: function(values) {
        values.cornerRadius = [
          values.cornerRadius0,
          values.cornerRadius1,
          values.cornerRadius2,
          values.cornerRadius3
        ];
        delete values.cornerRadius0;
        delete values.cornerRadius1;
        delete values.cornerRadius2;
        delete values.cornerRadius3;
      }
    }
  };
});
