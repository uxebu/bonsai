define([
  'bonsai/renderer/svg/svg_filters'
], function(svgFilters) {
  describe('svgFilters', function() {

    // the real typeof
    var toString = {}.toString;

    // a SVGElement
    function createSVGElement(name) {
      return document.createElementNS('http://www.w3.org/2000/svg', name);
    }

    describe('has a property `filterElementsFromList`', function() {
      it('is a function', function() {
        expect(typeof svgFilters.filterElementsFromList).toBe('function');
      });
      it('returns an empty array by default', function() {
        expect(svgFilters.filterElementsFromList() instanceof Array).toBeTruthy();
      });
      it('returns an empty array when the instructions are unknown', function() {
        var instructions = [{ type: 'megaFilter', value: 'big-number' }];
        expect(svgFilters.filterElementsFromList(instructions)).toEqual([]);
      });
      it('returns an empty array when the instructions are invalid', function() {
        var instructions = [{ typo: 'typo' }];
        expect(svgFilters.filterElementsFromList(instructions)).toEqual([]);
      });
      it('returns an SVGFE…Element at index 0 when instructions are valid', function() {
        var instructions = [{ type: 'sepia', value: 1 }];
        var filter = svgFilters.filterElementsFromList(instructions)[0];
        expect(toString.call(filter)).toMatch(/^\[object SVGFE\w+Element\]/);
      });
      it('returns an SVGFE…Element at index 1 when multiple instructions are passed', function() {
        var instructions = [{ type: 'sepia', value: 1 }, { type: 'sepia', value: 1 }];
        var filter = svgFilters.filterElementsFromList(instructions)[1];
        expect(toString.call(filter)).toMatch(/^\[object SVGFE\w+Element\]/);
      });
    });

    describe('has a property `containsFlattenFilter`', function() {
      it('is a function', function() {
        expect(typeof svgFilters.containsFlattenFilter).toBe('function');
      });
      it('returns false by default', function() {
        expect(svgFilters.containsFlattenFilter()).toBeFalsy();
      });
      it('returns false when the passed filters do not flatten.', function() {
        var filterList = ['aFilter'];
        expect(svgFilters.containsFlattenFilter(filterList)).toBeFalsy();
      });
      it('returns true when the passed filters contain a flatten filter.', function() {
        var filterList = [createSVGElement('feMerge')];
        expect(svgFilters.containsFlattenFilter(filterList)).toBeTruthy();
      });
    });
  });
});
