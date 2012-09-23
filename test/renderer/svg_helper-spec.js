define([
  'bonsai/renderer/svg/svg_helper'
], function(svgHelper) {
  describe('svgHelper', function() {

    var valueFromSignatureForType = svgHelper.valueFromSignatureForType;

    describe('has a function `valueFromSignatureForType`', function() {
      it('is a function', function() {
        expect(typeof valueFromSignatureForType).toBe('function');
      });
      it('returns `null` when type is not found', function() {
        expect(valueFromSignatureForType('', '')).toBe(null);
      });
      it('returns `null` when type was found but not the corresponding value', function() {
        expect(valueFromSignatureForType('test', 'test')).toBe(null);
      });
      it('returns `aValue` when type `aType` and corresponding value were found', function() {
        expect(valueFromSignatureForType('aType(aValue)', 'aType')).toBe('aValue');
      });
    });
  });
});
