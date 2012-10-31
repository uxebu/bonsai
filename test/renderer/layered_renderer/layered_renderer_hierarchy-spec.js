define([
  'bonsai/renderer/svg_with_layers/renderer'
], function(Renderer) {

  function nodeTester(type, customTestFn) {
    return function(attr, children) {
      // if first arg is an array, then it's assumed to be 'children'
      // otherwise, children is assumed to be empty.
      if (arguments.length === 1) {
        if (jasmine.isArray_(attr)) {
          children = attr;
          attr = {};
        }
      }
      if (!children) {
        children = [];
      }
      return {
        attr: attr,
        type: type,
        testFn: function(el) {
          var matched = true;
          if (attr) for (var i in attr) {
            var expectedValue = attr[i];
            if (i === 'id') {
              matched = matched && expectedValue === +el.getAttribute('data-bs-id');
            } else if (i === 'position') {
              // Custom tester for the 'position' attr. We test CSS transforms:
              matched = matched &&
                RegExp(
                  'matrix\\([^)]+' + expectedValue[0] + ', ?' + expectedValue[1] + '\\)'
                ).test(el.style.transform);
            } else {
              matched = matched && expectedValue === el.getAttribute(i)
            }
          }
          return matched && customTestFn(el);
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

  /**
   * Matrix helper for positioning-tests
   */
  function TranslationMatrix(tx, ty) {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = tx;
    this.ty = ty;
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
              var attr = jasmine.pp(nodeTest.attr);
              return [
                'Expected a ' + nodeTest.type + ' (' + attr + ') @ position(' + _position + ') but instead got ' + (this.actual && el.innerHTML),
                'Expected something other than a ' + nodeTest.type + ' (' + attr + ') @ position(' + _position + ') but instead got ' + (this.actual && el.innerHTML),
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
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ])
          ])
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
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _SVGLayer([
              _SVGGroup([
                _SVGPath()
              ])
            ])
          ])
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
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _DisplayGroup([
              _SVGLayer([
                _SVGGroup([
                  _SVGPath()
                ])
              ])
            ])
          ])
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
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _DisplayGroup([
              _SVGLayer([_SVGGroup([_SVGPath()])]),
              _DisplayGroup([
                _SVGLayer([_SVGGroup([_SVGPath()])]),
                _DisplayGroup([
                  _SVGLayer([_SVGGroup([_SVGPath()])]),
                  _DisplayGroup([
                    _SVGLayer([_SVGGroup([_SVGPath()])])
                  ])
                ])
              ])
            ])
          ])
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
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _DisplayGroup(2),
            _DisplayGroup(3)
          ])
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

          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _DisplayGroup({id: 2}),
            _DisplayGroup({id: 4}),
            _DisplayGroup({id: 5}),
            _DisplayGroup({id: 6})
          ])
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
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _DisplayGroup(1),
            _DisplayGroup(2)
          ])
        );

      });

      it('Deep Group structure', function() {

        testStructure(
          [
            { type: 'Group', id: 1, parent: 0 },
            { type: 'Group', id: 2, parent: 1 },
            { type: 'Group', id: 3, parent: 2 },
            { type: 'Group', id: 4, parent: 3 },
            { type: 'Group', id: 5, parent: 4 },
            { type: 'Group', id: 6, parent: 5 },
            { type: 'Group', id: 7, parent: 6 },
            { type: 'Group', id: 8, parent: 7 },
            { type: 'Group', id: 9, parent: 8 }
          ],
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _DisplayGroup({id: 1}, [
              _DisplayGroup({id: 2}, [
                _DisplayGroup({id: 3}, [
                  _DisplayGroup({id: 4}, [
                    _DisplayGroup({id: 5}, [
                      _DisplayGroup({id: 6}, [
                        _DisplayGroup({id: 7}, [
                          _DisplayGroup({id: 8}, [
                            _DisplayGroup({id: 9})
                          ])
                        ])
                      ])
                    ])
                  ])
                ])
              ])
            ])
          ])
        );

      });

      it('Deep Group structure - moving half the structure', function() {

        testStructure(
          [
            { type: 'Group', id: 1, parent: 0 },
            { type: 'Group', id: 2, parent: 1 },
            { type: 'Group', id: 3, parent: 2 },
            { type: 'Group', id: 4, parent: 3 },
            { type: 'Group', id: 5, parent: 4 },
            { type: 'Group', id: 6, parent: 5 },
            { type: 'Group', id: 7, parent: 6 },
            { type: 'Group', id: 8, parent: 7 },
            { type: 'Group', id: 9, parent: 8 }
          ],
          [
            { type: 'Group', id: 5, parent: 0, next: 1 }
          ],
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _DisplayGroup({id: 5}, [
              _DisplayGroup({id: 6}, [
                _DisplayGroup({id: 7}, [
                  _DisplayGroup({id: 8}, [
                    _DisplayGroup({id: 9})
                  ])
                ])
              ])
            ]),
            _DisplayGroup({id: 1}, [
              _DisplayGroup({id: 2}, [
                _DisplayGroup({id: 3}, [
                  _DisplayGroup({id: 4}, [

                  ])
                ])
              ])
            ])
          ])
        );

      });

      it('Deep Group structure - removal of every other node', function() {

        testStructure(
          [
            { type: 'Group', id: 1, parent: 0 },
            { type: 'Group', id: 2, parent: 1 },
            { type: 'Group', id: 3, parent: 2 },
            { type: 'Group', id: 4, parent: 3 },
            { type: 'Group', id: 5, parent: 4 },
            { type: 'Group', id: 6, parent: 5 },
            { type: 'Group', id: 7, parent: 6 },
            { type: 'Group', id: 8, parent: 7 },
            { type: 'Group', id: 9, parent: 8 }
          ],
          [
            { type: 'Group', id: 8, detach: true },
            { type: 'Group', id: 6, detach: true }
          ],
          [
            { type: 'Group', id: 4, detach: true },
            { type: 'Group', id: 2, detach: true }
          ],
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _DisplayGroup({id: 1})
          ])
        );

      });

      it('Inserts DOMElement between two paths', function() {
        testStructure(
          [
            { type: 'Path', id: 1, attributes: {}, parent: 0 },
            { type: 'Path', id: 2, attributes: {}, parent: 0 },
            { type: 'DOMElement', id: 3, next: 2, parent: 0, attributes: {nodeName:'p'} }
          ],
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _SVGLayer([
              _SVGGroup([
                _SVGPath({id: 1})
              ])
            ]),
            _DOMLayer([
              _DOMElement({id: 3})
            ]),
            _SVGLayer([
              _SVGGroup([
                _SVGPath({id: 2})
              ])
            ])
          ])
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
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _DisplayGroup([
              _DisplayGroup([
                _SVGLayer([_SVGGroup([_SVGPath()])])
              ])
            ])
          ])
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
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _DisplayGroup(),
            _DisplayGroup([
              _SVGLayer([_SVGGroup([_SVGPath()])])
            ])
          ])
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
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _DisplayGroup({id: 3}, [
              _DisplayGroup({id: 2}, [
                _DisplayGroup({id: 1})
              ])
            ])
          ])
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
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _DOMLayer([
              _DOMElement({id: 9})
            ]),
            _SVGLayer([
              _SVGGroup([
                _SVGPath({id: 6})
              ])
            ])
          ])
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
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _SVGLayer([
              _SVGGroup([
                _SVGPath({id: 6})
              ])
            ]),
            _DOMLayer([
              _DOMElement({id: 9})
            ])
          ])
        );
      });

    });

    describe('Positioning', function() {

      it('Positions group\'s children correctly', function() {
        testStructure(
          [
            { type: 'Group', id: 1, parent: 0 },
            { type: 'Group', id: 2, parent: 1, attributes: { matrix: new TranslationMatrix(100, 300) } },
            { type: 'Path', id: 3, attributes: {}, parent: 2 }
          ],
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _DisplayGroup({id: 1}, [
              _DisplayGroup({id: 2, position: [100, 300]}, [
                _SVGLayer([
                  _SVGGroup([
                    _SVGPath({id: 3})
                  ])
                ])
              ])
            ])
          ])
        );
      });

      it('Positions group\'s children correctly, added at later frame', function() {
        testStructure(
          [
            { type: 'Group', id: 1, parent: 0 },
            { type: 'Group', id: 2, parent: 1, attributes: { matrix: new TranslationMatrix(100, 499) } }
          ],
          [
            { type: 'Path', id: 3, attributes: {}, parent: 2 }
          ],
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _DisplayGroup({id: 1}, [
              _DisplayGroup({id: 2, position: [100, 499]}, [
                _SVGLayer([
                  _SVGGroup([
                    _SVGPath({id: 3})
                  ])
                ])
              ])
            ])
          ])
        );
      });

      it('Positions deeply nested groups correctly', function() {
        testStructure(
          [
            { type: 'Group', id: 1, parent: 0 },
            { type: 'Group', id: 2, parent: 1, attributes: { matrix: new TranslationMatrix(1, 6) } },
            { type: 'Group', id: 3, parent: 2, attributes: { matrix: new TranslationMatrix(2, 7) } },
            { type: 'Group', id: 4, parent: 3, attributes: { matrix: new TranslationMatrix(3, 8) } },
            { type: 'Group', id: 5, parent: 4, attributes: { matrix: new TranslationMatrix(4, 9) } },
            { type: 'Group', id: 6, parent: 5, attributes: { matrix: new TranslationMatrix(5, 0) } }
          ],
          [
            { type: 'Group', id: 3, attributes: { matrix: new TranslationMatrix(111, 222) } }
          ],
          _DisplayGroup([
            _SVGLayer([
              _SVGGroup(),
              _SVGDefs()
            ]),
            _DisplayGroup({id: 1}, [
              _DisplayGroup({id: 2, position: [1, 6]}, [
                _DisplayGroup({id: 3, position: [111, 222]}, [
                  _DisplayGroup({id: 4, position: [3, 8]}, [
                    _DisplayGroup({id: 5, position: [4, 9]}, [
                      _DisplayGroup({id: 6, position: [5, 0]})
                    ])
                  ])
                ])
              ])
            ])
          ])
        );
      });

    });

  });

});
