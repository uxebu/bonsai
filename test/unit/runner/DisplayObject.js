define(['bdd', 'expect', 'bonsai/runner/DisplayObject'], function(bdd, expect, DisplayObject) {
  var describe = bdd.describe, it = bdd.it;

  describe('DisplayObject', function() {
    it('should fail', function() {
      expect(true).to.equal(true);
    });
  });
});
