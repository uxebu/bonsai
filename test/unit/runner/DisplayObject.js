define([
  'bdd',
  'expect',
  'sinon',
  'bonsai/runner/DisplayObject'
], function(bdd, expect, sinon, DisplayObject) {
  var beforeEach = bdd.beforeEach, describe = bdd.describe, it = bdd.it;

  describe('DisplayObject', function() {

    describe('Attribute system:', function() {
      function setAttributes(attributes) {
        displayObject._attributes = attributes;
      }
      var displayObject;
      beforeEach(function() {
        displayObject = new DisplayObject();
      });

      it('gets an existing attribute', function() {
        setAttributes({arbitrary: 1234});
        expect(displayObject.attr('arbitrary')).to.equal(1234);
      });

      it('sets an existing attribute', function() {
        setAttributes({arbitrary: undefined});
        displayObject.attr('arbitrary', 1234);
        expect(displayObject.attr('arbitrary')).to.equal(1234);
      });

      it('returns the display object when setting', function() {
        expect(displayObject.attr('arbitrary', 1234)).to.equal(displayObject);
      });

      it('does not set non-existant attributes', function() {
        setAttributes({});
        displayObject.attr('arbitrary', 1234);
        expect(displayObject.attr('arbitrary')).to.equal(undefined);
      });

      it('uses the return value of existing setters to set the value of the attribute', function() {
        setAttributes({
          arbitrary: undefined,
          set_arbitrary: function() { return 1234; }
        });
        displayObject.attr('arbitrary', 5678);
        expect(displayObject.attr('arbitrary')).to.equal(1234);
      });

      it('invokes setters without assigning the value if the attribute name does not exist', function() {
        var setArbitrary = sinon.spy(function() {
          return 5678;
        });
        setAttributes({
          set_arbitrary: setArbitrary
        });
        displayObject.attr('arbitrary', 1234);

        expect(setArbitrary).to.have.been.called;
        expect(displayObject.attr('arbitrary')).to.equal(undefined);
      });

      it('passes the new value, the old value, and the display object to setters', function() {
        var setArbitrary = sinon.spy();
        setAttributes({
          arbitrary: 1234,
          set_arbitrary: setArbitrary
        });

        displayObject.attr('arbitrary', 5678);
        expect(setArbitrary).to.have.been.calledWith(5678, 1234, displayObject);
      });

      it('returns an object containing all attributes when called without arguments', function() {
        setAttributes({
          foo: 1,
          bar: 4,
          baz: 3
        });

        expect(displayObject.attr()).to.deep.equal({
          foo: 1,
          bar: 4,
          baz: 3
        });
      });

      it('updates attributes from a passed-in object as single parameter', function() {
        setAttributes({
          foo: undefined,
          bar: undefined,
          set_bar: function(value) { return value + 2; },
          baz: undefined,
          set_bazoong: function(value) { this.baz = value; }
        });

        displayObject.attr({
          foo: 1,
          bar: 2,
          bazoong: 3
        });

        expect(displayObject.attr()).to.deep.equal({
          foo: 1,
          bar: 4,
          baz: 3
        });
      });
    });

  });
});
