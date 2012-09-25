define([
  'bonsai/renderer/svg_with_layers/renderer'
], function(Renderer) {

  function nodeTester(type, customTestFn) {
    return function(id) {
      var children = [].slice.call(arguments);
      return {
        // If the first argument is a number then we assume its the ID and 
        // therefore remote it from the children array
        id: typeof id === 'number' ? children.shift() : null,
        type: type,
        testFn: function(el) {
          return customTestFn && (
            // Also test ID if it was passed
            this.id === null || this.id === +el.getAttribute('data-bs-id')
          );
        },
        children: children
      }
    };
  }

  // Node testers:
  var
    _DisplayGroup = nodeTester('DisplayGroup', function(el){
      return el.getAttribute('data-bs-type') == 'displayGroup';
    }),
    _SVGLayer = nodeTester('SVGLayer', function(el) {
      return el instanceof window.SVGSVGElement;
    }),
    _SVGGroup = nodeTester('SVGGroup', function(el) {
      return el instanceof window.SVGGElement;
    }),
    _SVGDefs = nodeTester('SVGDefs', function(el) {
      return el instanceof window.SVGDefsElement;
    }),
    _SVGPath = nodeTester('SVGPath', function(el) {
      return el instanceof window.SVGPathElement;
    }),
    _DOMLayer = nodeTester('DOMLayer', function(el) {
      return el.getAttribute('data-bs-type') == 'domLayer';
    }),
    _DOMElement = nodeTester('DOMElement', function(el) {
      return el instanceof window.HTMLElement;
    });



  /** 
   * Tests the real DOM node structure made by the renderer against the 
   * specification structure (second argument)
   * @args One or more frames.
   *  Last argument is the specNode (to compare the actual DOM against)
   */
  function testStructure(frames/*,...*/, specNode) {

    var args = [].slice.call(arguments);
    specNode = args.pop();
    var frames = args;

    var pnode = document.createElement('div');
    var renderer = new Renderer(pnode, 100, 100);
    frames.forEach(function(frameRenderMessages) {
      renderer.render(frameRenderMessages);
    });

    var node = renderer.display.root.dom;
    testNode(node, specNode);
  }

  /** 
   * Tests a single renderer-generated DOM node against a specNode
   */
  function testNode(node, specNode, _position) {
    _position = _position || '';
    expect(node).toMatchTestNode(specNode, _position);
    if (specNode && node) {
      var nodeChildren = [].slice.call(node.childNodes).filter(function(c) {
        return c.nodeType === 1;
      });
      for (var i = 0, l = Math.max(nodeChildren.length, specNode.children.length); i < l; ++i) {
        testNode(nodeChildren[i], specNode.children[i], _position + i + ':');
      }
    }
  }

  /**********************************************************************
   * These tests test the DOM structure produced by the layered renderer
   *********************************************************************/

  describe('Layered Renderer - Hierarchy & Node structure', function() {

    beforeEach(function() {
      this.addMatchers({
        // Custom matcher for testing a DOM node against a specification nodeTest
        toMatchTestNode: function(nodeTest, _position) {
          this.message = function() {
            if (nodeTest && this.actual) {
              var el = document.createElement('div');
              el.appendChild(this.actual.cloneNode(false));
            }
            if (nodeTest) {
              var id = nodeTest.id ? ' (id:' + nodeTest.id + ')' : '';
              return [
                'Expected a ' + nodeTest.type + id + ' @ position(' + _position + ') but instead got ' + (this.actual && el.innerHTML),
                'Expected something other than a ' + nodeTest.type + id + ' @ position(' + _position + ') but instead got ' + (this.actual && el.innerHTML),
              ];
            } else {
              return [
                'Expected nodeTest @ position(' + _position + ') (Specification to be defined)',
                'Expected nodeTest @ position(' + _position + ') (Specification to be defined)',
              ];
            }
          };
          return !!( nodeTest && this.actual && nodeTest.testFn(this.actual) );

        }
      });
    });

    describe('Insertion and Removal', function() {

      it('Generates raw structure - No message', function() {

        // Raw structure includes a single SVGRoot (this is to later
        // be filled with referenced gradients/patterns/offStageElements)

        testStructure(
          [], // empty message
          _DisplayGroup(
            _SVGLayer(
              _SVGGroup(),
              _SVGDefs()
            )
          )
        );

      });

      it('Generates basic structure (single path drawn)', function() {

        testStructure(
          [
            {
              type: 'Path',
              id: 1,
              attributes: {},
              parent: 0
            }
          ],
          _DisplayGroup(
            _SVGLayer(
              _SVGGroup(),
              _SVGDefs()
            ),
            _SVGLayer(
              _SVGGroup(
                _SVGPath()
              )
            )
          )
        );

      });

      it('Generates group with path as child', function() {

        testStructure(
          [
            {
              type: 'Group',
              id: 1,
              parent: 0
            },
            {
              type: 'Path',
              id: 2,
              attributes: {},
              parent: 1
            }
          ],
          _DisplayGroup(
            _SVGLayer(
              _SVGGroup(),
              _SVGDefs()
            ),
            _DisplayGroup(
              _SVGLayer(
                _SVGGroup(
                  _SVGPath()
                )
              )
            )
          )
        );

      });

      it('Generates deeply nested groups with path in each', function() {

        testStructure(
          [
            { type: 'Group', id: 1, parent: 0 },
            { type: 'Path', id: 2, attributes: {}, parent: 1 },
            { type: 'Group', id: 3, parent: 1 },
            { type: 'Path', id: 4, attributes: {}, parent: 3 },
            { type: 'Group', id: 5, parent: 3 },
            { type: 'Path', id: 6, attributes: {}, parent: 5 },
            { type: 'Group', id: 7, parent: 5 },
            { type: 'Path', id: 8, attributes: {}, parent: 7 }
          ],
          _DisplayGroup(
            _SVGLayer(
              _SVGGroup(),
              _SVGDefs()
            ),
            _DisplayGroup(
              _SVGLayer(_SVGGroup(_SVGPath())),
              _DisplayGroup(
                _SVGLayer(_SVGGroup(_SVGPath())),
                _DisplayGroup(
                  _SVGLayer(_SVGGroup(_SVGPath())),
                  _DisplayGroup(
                    _SVGLayer(_SVGGroup(_SVGPath()))
                  )
                )
              )
            )
          )
        );

      });

      it('Removes groups', function() {

        testStructure(
          [
            { type: 'Group', id: 1, parent: 0 },
            { type: 'Group', id: 2, parent: 0 },
            { type: 'Group', id: 3, parent: 0 }
          ],
          [
            // Remove:
            { type: 'Group', id: 1, detach: true }
          ],
          _DisplayGroup(
            _SVGLayer(
              _SVGGroup(),
              _SVGDefs()
            ),
            _DisplayGroup(2),
            _DisplayGroup(3)
          )
        );

      });

      it('Adds and removes arbitrary groups', function() {
        testStructure(
          [
            { type: 'Group', id: 1, parent: 0 },
            { type: 'Group', id: 2, parent: 0 },
            { type: 'Group', id: 3, parent: 0 }
          ],
          [
            { type: 'Group', id: 1, detach: true },
            { type: 'Group', id: 3, detach: true }
          ],
          [
            { type: 'Group', id: 4, parent: 0 },
            { type: 'Group', id: 5, parent: 0 },
            { type: 'Group', id: 6, parent: 0 }
          ],

          _DisplayGroup(
            _SVGLayer(
              _SVGGroup(),
              _SVGDefs()
            ),
            _DisplayGroup(2),
            _DisplayGroup(4),
            _DisplayGroup(5),
            _DisplayGroup(6)
          )
        );
      });

      it('Removes DOMElements from Groups but keeps groups', function() {

        testStructure(
          [
            { type: 'Group', id: 1, parent: 0 },
            { type: 'Group', id: 2, parent: 0 }
          ],
          [
            { type: 'DOMElement', id: 3, parent: 1, attributes: {nodeName:'div'} },
            { type: 'DOMElement', id: 4, parent: 2, attributes: {nodeName:'div'} },
          ],
          [
            // Remove:
            { type: 'DOMElement', id: 3, detach: true },
            { type: 'DOMElement', id: 4, detach: true }
          ],
          _DisplayGroup(
            _SVGLayer(
              _SVGGroup(),
              _SVGDefs()
            ),
            _DisplayGroup(1),
            _DisplayGroup(2)
          )
        );

      });

    });

    describe('Moving objects', function() {

      it('Moves path position from group A to [nested] group B', function() {

        testStructure(
          [
            { type: 'Group', id: 1, parent: 0 },
            { type: 'Path', id: 2, attributes: {}, parent: 1 },
            { type: 'Group', id: 3, parent: 1 }
          ],
          [
            { type: 'Path', id: 2, attributes: {}, parent: 3 }
          ],
          _DisplayGroup(
            _SVGLayer(
              _SVGGroup(),
              _SVGDefs()
            ),
            _DisplayGroup(
              _DisplayGroup(
                _SVGLayer(_SVGGroup(_SVGPath()))
              )
            )
          )
        );

      });

      it('Moves path position from group A to [adjacent] group B', function() {

        testStructure(
          [
            { type: 'Group', id: 1, parent: 0 },
            { type: 'Group', id: 2, parent: 0 },
            { type: 'Path', id: 3, attributes: {}, parent: 1 }
          ],
          [
            { type: 'Path', id: 3, attributes: {}, parent: 2 }
          ],
          _DisplayGroup(
            _SVGLayer(
              _SVGGroup(),
              _SVGDefs()
            ),
            _DisplayGroup(),
            _DisplayGroup(
              _SVGLayer(_SVGGroup(_SVGPath()))
            )
          )
        );

      });

      it('Moves groups as instructed', function() {

        testStructure(
          [
            { type: 'Group', id: 1, parent: 0 },
            { type: 'Group', id: 2, parent: 0 },
            { type: 'Group', id: 3, parent: 0 }
          ],
          [
            { type: 'Group', id: 1, parent: 3 }
          ],
          [
            { type: 'Group', id: 1, parent: 2 },
            { type: 'Group', id: 2, parent: 3 }
          ],
          _DisplayGroup(
            _SVGLayer(
              _SVGGroup(),
              _SVGDefs()
            ),
            _DisplayGroup(3,
              _DisplayGroup(2,
                _DisplayGroup(1)
              )
            )
          )
        );

      });

      it('Moves Path from before DOMElement to after DOMElement', function() {
        testStructure(
          [
            { type: 'Path', id: 6, attributes: {}, parent: 0 },
            { type: 'DOMElement', id: 9, parent: 0, attributes: {nodeName:'p'} }
          ],
          [
            { type: 'Path', id: 6, attributes: {}, parent: 0 }
          ],
          _DisplayGroup(
            _SVGLayer(
              _SVGGroup(),
              _SVGDefs()
            ),
            _DOMLayer(
              _DOMElement(9)
            ),
            _SVGLayer(
              _SVGGroup(
                _SVGPath(6)
              )
            )
          )
        );
      });

      it('Moves Path from after DOMElement to before DOMElement', function() {
        testStructure(
          [
            { type: 'DOMElement', id: 9, parent: 0, attributes: {nodeName:'p'} },
            { type: 'Path', id: 6, attributes: {}, parent: 0 }
          ],
          [
            { type: 'Path', id: 6, attributes: {}, parent: 0, next: 9 }
          ],
          _DisplayGroup(
            _SVGLayer(
              _SVGGroup(),
              _SVGDefs()
            ),
            _SVGLayer(
              _SVGGroup(
                _SVGPath(6)
              )
            ),
            _DOMLayer(
              _DOMElement(9)
            )
          )
        );
      });

    });

  });

});
