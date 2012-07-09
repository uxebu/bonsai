define([
  '../../tools',
  '../filter/builtin',
  '../../color'
], function(tools, filter, color) {
  'use strict';

  var prefix = 'filter_';

  function setupFilterValues(value, i, values) {

    if (value != null) {

      if (value instanceof filter.BaseFilter) {

        if (tools.isArray(value.value)) {

          for (var vi = 0, vl = value.value.length; vi < vl; ++vi) {
            if (
              (
                value.type === 'dropShadowByOffset' ||
                value.type === 'dropShadowByAngle'
              ) && vi === 3
            ) {
              // Color
              var c = color(value.value[vi]);
              values[prefix + i + '_' + vi + '_r'] = c.r();
              values[prefix + i + '_' + vi + '_g'] = c.g();
              values[prefix + i + '_' + vi + '_b'] = c.b();
              values[prefix + i + '_' + vi + '_a'] = c.a();
            } else {
              values[prefix + i + '_' + vi] = value.value[vi];
            }
          }
        } else {
          values[prefix + i] = value.value;
        }
      } else {
        values[prefix + i] = value;
      }
    }
  }

  /**
   * Animation translations for filter arrays
   */
  return {
    filters: {
      setupTo: function(values) {

        var value;

        if (!tools.isArray(values.filters)) {
          values.filters = [values.filters];
        }
        for (var i = 0, m = values.filters.length; i < m; i++) {
          setupFilterValues(values.filters[i], i, values);
        }

        // Save amount of filters that we're animating
        this._to = values.filters;

        delete values.filters;
      },
      setupFrom: function(values) {

        for (var i = 0, m = this._to.length; i < m; i++) {
          setupFilterValues(values.filters[i], i, values);
        }
        this._filters = values.filters;
        delete values.filters;
      },
      step: function(values) {

        for (var i = 0, m = this._to.length; i < m; i++) {

          if (this._to[i] == null) {
            continue;
          }

          if (values[prefix + i] != null) {
            this._filters[i].value = values[prefix + i];
            delete values[prefix + i];
          } else {

            for (var vi = 0, vl = this._to[i].value.length; vi < vl; ++vi) {

              if (
                (
                  this._to[i].type === 'dropShadowByOffset' ||
                  this._to[i].type === 'dropShadowByAngle'
                ) && vi === 3
              ) {
                var c = Number(new color.RGBAColor(
                  values[prefix + i + '_' + vi + '_r'],
                  values[prefix + i + '_' + vi + '_g'],
                  values[prefix + i + '_' + vi + '_b'],
                  values[prefix + i + '_' + vi + '_a']
                ));
                delete values[prefix + i + '_' + vi + '_r'];
                delete values[prefix + i + '_' + vi + '_g'];
                delete values[prefix + i + '_' + vi + '_b'];
                delete values[prefix + i + '_' + vi + '_a'];
                this._filters[i].value[vi] = c;
              } else {
                this._filters[i].value[vi] = values[prefix + i + '_' + vi];
                delete values[prefix + i + '_' + vi];
              }
            }
          }
        }

        values.filters = this._filters;
      }
    }
  };
});
