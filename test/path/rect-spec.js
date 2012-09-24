define([
  'bonsai/runner/path/rect'
], function(Rect) {

  describe('rect', function() {
    it('Creates a regular rectangle with specified width/height', function() {
      var s = new Rect(0, 0, 100, 200); // 100x200
      expect(s.segments()).toEqual([
        ['moveTo', 0, 0],
        ['lineBy', 100, 0],
        ['lineBy', 0, 200],
        ['lineBy', -100, 0],
        ['closePath']
      ]);
    });
    it('Creates a regular rectangle with a radius', function() {
      var s = new Rect(0, 0, 100, 200, 5); // 100x200
      expect(s.segments()).toEqual([
        ['moveTo', 0, 5],
        ['arcBy', 5, 5, 0, 0, 1, 5, -5],
        ['lineBy', 90, 0],
        ['arcBy', 5, 5, 0, 0, 1, 5, 5],
        ['lineBy', 0, 190],
        ['arcBy', 5, 5, 0, 0, 1, -5, 5],
        ['lineBy', -90, 0],
        ['arcBy', 5, 5, 0, 0, 1, -5, -5],
        ['closePath']
      ]);
    });
    it('Creates a regular rectangle with per-corner radius', function() {
      var s = new Rect(0, 0, 100, 200, [1,11,12,13]); // 100x200
      expect(s.segments()).toEqual([
        ['moveTo', 0, 1],
        ['arcBy', 1, 1, 0, 0, 1, 1, -1],
        ['lineBy', 88, 0],
        ['arcBy', 11, 11, 0, 0, 1, 11, 11],
        ['lineBy', 0, 177],
        ['arcBy', 12, 12, 0, 0, 1, -12, 12],
        ['lineBy', -75, 0],
        ['arcBy', 13, 13, 0, 0, 1, -13, -13],
        ['closePath']
      ]);
    });
  });

});
