define([
  'bonsai/segment_helper'
], function(segmentHelper) {
  describe('segmentHelper', function() {

    var parseCommandList = segmentHelper.parseCommandList;
    var parsePath = segmentHelper.parsePath;

    describe('parseCommandList', function() {
      it('should return an empty Array when called with an empty Array', function() {
        expect(parseCommandList([])).toEqual([]);
      });

      it('should throw ParserError on unknown commands', function() {
        expect(function() { parseCommandList(['nusuchcmd']); }).toThrow();
      });

      it('should throw ParserError on wrong parameter count', function() {
        expect(function() { parseCommandList(['moveTo', 0]); }).toThrow();
      });

      it('should throw ParserError on non numeric coordinate values', function() {
        expect(function() { parseCommandList(['moveTo', 0, 'foo']); }).toThrow();
      });

      it('should create a single segment for a single command group', function() {
        expect(parseCommandList(['moveTo', 0, 5]).length).toBe(1);
      });

      it('should create a segment for a each command group', function() {
        expect(parseCommandList(['moveTo', 0, 5, 'moveTo', 10, 20]).length).toBe(2);
      });
    });

    describe('parseSvgPath', function() {
      it('should return an empty Array when called with an empty String', function() {
        expect(parsePath('')).toEqual([]);
      });

      it('should throw ParserError on unknown commands', function() {
        expect(function() { parsePath('J'); }).toThrow();
      });

      it('should throw ParserError on wrong parameter count', function() {
        expect(function() { parsePath('m0'); }).toThrow();
      });

      it('should throw ParserError on non numeric coordinate values', function() {
        expect(function() { parsePath('m0,foo'); }).toThrow();
      });

      it('should create a single segment for a single command group', function() {
        expect(parsePath('m0,5')).toEqual([
          [ 'moveBy', 0, 5 ]
        ] );
      });

      it('should create a segment for a each command group', function() {
        expect(parsePath('m0,5L10,20l20 30C 20,30,20,10 30 20H2V10v2h1Q-30,100 50,150A15 25 180 0 0 130 130 z')).toEqual([
          [ 'moveBy', 0, 5 ],
          [ 'lineTo', 10, 20 ],
          [ 'lineBy', 20, 30 ],
          [ 'curveTo', 20, 30, 20, 10, 30, 20 ],
          [ 'horizontalLineTo', 2 ],
          [ 'verticalLineTo', 10 ],
          [ 'verticalLineBy', 2 ],
          [ 'horizontalLineBy', 1 ],
          [ 'quadraticCurveTo', -30, 100, 50, 150 ],
          [ 'arcTo', 15, 25, 180, 0, 0, 130, 130 ],
          [ 'closePath' ]
        ]);
      });
    });
  });
});
