define([
  'bonsai/runner/path/ellipse'
], function(Ellipse) {

  describe('Ellipse', function() {
    it('Creates and mutates an ellipse', function() {
      var radiusX = 100,
          radiusY = 150;
      var s = new Ellipse(0, 0, radiusX, radiusY);
      expect(s.segments()).toEqual([
        ['moveTo', 100, 0],
        ['arcTo', 100, 150, 0, 0, 0, -100, 0],
        ['arcTo', 100, 150, 0, 0, 0, 100, 0]
      ]);
      s.attr('radiusX', 110).attr('radiusY', 99);
      expect(s.segments()).toEqual([
        ['moveTo', 110, 0],
        ['arcTo', 110, 99, 0, 0, 0, -110, 0],
        ['arcTo', 110, 99, 0, 0, 0, 110, 0]
      ]);
    });
  });

});
