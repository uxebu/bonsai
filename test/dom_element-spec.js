define([
  'bonsai/runner/dom_element'
], function(DOMElement) {

  var toString = {}.toString;

  //spyOn(bonsai, 'Group').andCallThrough();

  describe('DOMElement', function () {

    describe('basically', function () {
      it('returns an instance of DOMElement', function() {
        expect(new DOMElement() instanceof DOMElement).toBeTruthy();
      });
    });

    // TODO: this should also be covert by a general plugin interface
    describe('has a property `type`', function () {
      it('returns a string', function() {
        expect(new DOMElement().nodeName).toBeOfType('string');
      });
    });

    describe('has a property named `nodeName`', function () {
      it('returns a string', function() {
        expect(new DOMElement().nodeName).toBeOfType('string');
      });
    });

    describe('has a property named `domAttributes`', function () {
      it('returns an object', function() {
        expect(toString.call(new DOMElement()._domAttributes) === '[object Object]').toBeTruthy();
      });
    });

    describe('has a property named `cssStyles`', function () {
      it('returns an object', function() {
        expect(toString.call(new DOMElement()._cssStyles) === '[object Object]').toBeTruthy();
      });
    });

    describe('has a method `setAttribute`', function() {
      it('returns the current instance of DOMElement', function() {
        expect(new DOMElement().setAttribute() instanceof DOMElement).toBeTruthy();
      });
      it('creates a new entry in the `domAttributes` object', function() {
        expect(new DOMElement().setAttribute('key', 'value')._domAttributes.key).toEqual('value');
      });
    });

    describe('has a method `setStyle`', function() {
      it('returns the current instance of DOMElement', function() {
        expect(new DOMElement().setStyle() instanceof DOMElement).toBeTruthy();
      });
      it('creates a new entry in the `setStyle` object', function() {
        expect(new DOMElement().setStyle('key', 'value')._cssStyles.key).toEqual('value');
      });
    });

    describe('setAttributes', function() {
      it('Sets multiple attributes', function() {
        expect(new DOMElement().setAttributes({a:1,b:'foo'})._domAttributes).toEqual({a:1,b:'foo'});
      });
    });

    describe('setStyles', function() {
      it('Sets multiple styles', function() {
        expect(new DOMElement().setStyles({a:1,b:'foo'})._cssStyles).toEqual({a:1,b:'foo'});
      });
    });

    describe('getStyle', function() {
      it('Gets a style', function() {
        expect(new DOMElement().setStyle('a', 1).getStyle('a')).toBe(1);
        expect(new DOMElement().setStyle('font-size', '323em').getStyle('font-size')).toBe('323em');
        expect(new DOMElement().getStyle('undefined-thing')).toBe(void 0);
      });
    });

    describe('getAttribute', function() {
      it('Gets an attribute', function() {
        expect(new DOMElement().setAttribute('a', 1).getAttribute('a')).toBe(1);
        expect(new DOMElement().setAttribute('value', '323em').getAttribute('value')).toBe('323em');
        expect(new DOMElement().getAttribute('undefined-thing')).toBe(void 0);
      });
    });

    describe('composeRenderMessage', function() {
      it('Outputs prefixxed styles', function() {
        var d = new DOMElement().setStyles({
          a: 1
        });
        expect(d.composeRenderMessage().attributes.css_a).toEqual(1);
        // Should not show css_a value becuase it's already been
        // sent (removed from `mutated` map)
        expect(d.composeRenderMessage().attributes.css_a).toEqual(undefined);
      });
      it('Outputs prefixxed attributes', function() {

        var d = new DOMElement().setAttributes({
          x: 1
        });
        expect(d.composeRenderMessage().attributes.dom_x).toEqual(1);
        // Should not show dom_x value becuase it's already been
        // sent (removed from `mutated` map)
        expect(d.composeRenderMessage().attributes.dom_x).toEqual(undefined);
      });
    });

  });

});