define([
  '../../../tools',
  '../../filter/builtin',
  '../../../color'
], function(tools, filter, color) {
  'use strict';

  /**
   * Animation translations for filter arrays
   * @ignore
   */
  return {
    filters: {
      toNumeric: function(filters, isEndValues) {

        var numbers = [];

        if (!tools.isArray(filters)) {
          filters = [filters];
        }

        if (!isEndValues) {
          this.filters = filters;
        }

        for (var i = 0, m = filters.length; i < m; i++) {
          var filter = filters[i];
          if (filter != null) {

            if (typeof filter == 'number') {
              // Allow e.g. thing.animate(.., { filters: [1,2,3]}) 
              // i.e. passing just the args to already-declared filters
              numbers.push(filter);
            } else if (tools.isArray(filter.value)) {

              for (var vi = 0, vl = filter.value.length; vi < vl; ++vi) {
                if (
                  (
                    filter.type === 'dropShadowByOffset' ||
                    filter.type === 'dropShadowByAngle'
                  ) && vi === 3
                ) {
                  // Color
                  var c = color(filter.value[vi]);
                  numbers.push(
                    c.r(),
                    c.g(),
                    c.b(),
                    c.a()
                  );
                } else {
                  numbers.push(filter.value[vi]);
                }
              }
            } else {
              numbers.push(filter.value);
            }
          }
        }

        return numbers;
      },
      toAttr: function(numbers) {

        var filters = this.filters;
        var n = 0;

        for (var i = 0, m = filters.length; i < m; i++) {
          var filter = filters[i];
          if (filter != null) {

            if (tools.isArray(filter.value)) {

              for (var vi = 0, vl = filter.value.length; vi < vl; ++vi) {
                if (
                  (
                    filter.type === 'dropShadowByOffset' ||
                    filter.type === 'dropShadowByAngle'
                  ) && vi === 3
                ) {
                  var c = Number(new color.RGBAColor(
                    numbers[n++],
                    numbers[n++],
                    numbers[n++],
                    numbers[n++]
                  ));
                  filter.value[vi] = c;
                } else {
                  filter.value[vi] = numbers[n++];
                }
              }
            } else {
              filter.value = numbers[n++];
            }
          }
        }

        return filters;
      }
    }
  };
});
