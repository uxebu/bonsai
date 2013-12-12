define([
  'bonsai/runner/path/arc'
], function(Arc) {

  describe('Arc', function() {
    it('Creates and mutates a regular arc', function() {
      var radius = 100,
          start = 0,
          end = Math.PI;
      var s = new Arc(0, 0, radius, start, end);
      expect(s.segments()).toEqual([
        ['moveTo', radius, 0],
        ['arcTo', radius, radius, 0, 1, 1, -radius, radius*Math.sin(end)]
      ]);
      s.attr('radius', 210);
      radius = 210;
      expect(s.segments()).toEqual([
        ['moveTo', radius, 0],
        ['arcTo', radius, radius, 0, 1, 1, -radius, radius*Math.sin(end)]
      ]);
    });
  });

});
