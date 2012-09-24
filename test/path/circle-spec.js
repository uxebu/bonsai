define([
  'bonsai/runner/path/circle'
], function(Circle) {

  describe('Circle', function() {
    it('Creates and mutates an circle', function() {
      var radius = 100;
      var s = new Circle(0, 0, radius);
      expect(s.segments()).toEqual([
        ['moveTo', 100, 0],
        ['arcTo', 100, 100, 0, 0, 0, -100, 0],
        ['arcTo', 100, 100, 0, 0, 0, 100, 0]
      ]);
      s.attr('radius', 50);
      expect(s.segments()).toEqual([
        ['moveTo', 50, 0],
        ['arcTo', 50, 50, 0, 0, 0, -50, 0],
        ['arcTo', 50, 50, 0, 0, 0, 50, 0]
      ]);
    });
  });

});
