define(['../../color'], function(color) {
  'use strict';

  /**
   * Animation translations for shape segments
   * @ignore
   */

  return {
    segments: {
      setupTo: function(values) {
        var segments = values.segments;

        for (var i = 0, l = segments.length; i < l; ++i) {
          var segment = segments[i];
          for (var s = 0, sl = segment.length; s < sl; ++s) {
            if (!isNaN(segment[s])) {
              values['segment_' + i + '_' + s] = segment[s];
            }
          }
        }
      },
      setupFrom: function(values) {
        var segments = values.segments;
        this._segments = segments;
        for (var i = 0, l = segments.length; i < l; ++i) {
          var segment = segments[i];
          for (var s = 0, sl = segment.length; s < sl; ++s) {
            if (!isNaN(segment[s])) {
              values['segment_' + i + '_' + s] = segment[s];
            }
          }
        }

        delete values.segments;
      },
      step: function(values) {

        var segments = this._segments;

        for (var i = 0, l = segments.length; i < l; ++i) {

          var segment = segments[i];

          for (var s = 0, sl = segment.length; s < sl; ++s) {
            if (!isNaN(values['segment_' + i + '_' + s])) {
              segment[s] = values['segment_' + i + '_' + s];
              delete values['segment_' + i + '_' + s];
            }
          }
        }

        values.segments = segments;
      }
    }
  };
});
