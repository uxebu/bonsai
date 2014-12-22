/**
 * A special Renderer for SVG.
 *
 * @requires module:renderer
 */
define([
  '../../event_emitter',
  '../../tools',
  '../../color',
  '../../runner/path/curved_path',
  'pixi',
  '../../asset/asset_controller'
], function(EventEmitter, tools, color, curvedPath, pixi, AssetController) {
  'use strict';

  console.log(pixi);

  var pathGraphicsMap = {
    'moveTo': 'moveTo',
    'curveTo': 'bezierCurveTo'
  };

  function _mapPathToPixiGraphicsCalls(paths, graphics) {
    var curvedPaths = curvedPath.toCurves(paths);
    var i, path;
    for (i = 0; (path = curvedPaths[i++]);) {
      if (path[0] !== 'closePath') {
        graphics[pathGraphicsMap[path[0]]].apply(graphics, path.splice(1));
      }
    }
  }

  function _renderPathMessage(message, renderObjects, stage) {
    var graphics = new pixi.Graphics();
    graphics.beginFill(0x00FF00);
    _mapPathToPixiGraphicsCalls(message.data, graphics);
    // end the fill
    graphics.endFill();
    stage.addChild(graphics);
    return graphics;
  }

  function _applyGeometry(matrix, renderObject) {
    renderObject.worldTransform.a = matrix.a;
    renderObject.worldTransform.b = matrix.b;
    renderObject.worldTransform.c = matrix.c;
    renderObject.worldTransform.d = matrix.d;
    renderObject.worldTransform.tx = matrix.tx;
    renderObject.worldTransform.ty = matrix.ty;
  }

  /**
   * The CanvasPixiRenderer constructor
   *
   * @constructor
   * @param {HTMLElement} node The element to append the pixi root node to.
   * @param {number} width The width to apply to the root node.
   *    Falsy means 'no width applied'.
   * @param {number} height The height to apply to the root node.
   *    Falsy means 'no height applied'.
   * @param {boolean} [allowEventDefaults=false] Whether not to preventDefault()
   *    browser events;
   * @param {Function|boolean} [fpsLog=false] Whether to log the frame rate.
   *    true displays the frame rate in the rendering, a function will be called
   *    with the framerate.
   */
  function CanvasPixiRenderer(node, width, height, options) {

    // create an new instance of a pixi stage
    this.stage = new pixi.Stage(0xdddddd);

    // create a renderer instance.
    this.subRenderer = pixi.autoDetectRenderer(width, height);

    // add the renderer view element to the DOM
    node.appendChild(this.subRenderer.view);

    // render stage
    this.subRenderer.render(this.stage);

  }

  CanvasPixiRenderer.prototype = tools.mixin({

    destroy: function() {
      this.subRenderer.destroy();
    },

    getOffset: function() {
      return {left: 0, top: 0};
    },

    config: function(data) {

      var item = data.item,
          value = data.value;

      switch (item) {
        case 'crispEdges':
          break;
        case 'backgroundColor':
          // Extract alpha value because PIXI does not support it
          this.stage.setBackgroundColor(color(value).toString().substr(0, 8));
          this.subRenderer.render(this.stage);
          break;
        case 'disableContextMenu':
          break;
      }

    },

    render: function(messages) {
      var i, message, attributes, renderObject, renderObjects = {};

      for (i = 0; (message = messages[i++]);) {
        attributes = message.attributes;
        renderObject = _renderPathMessage(message, renderObjects, this.stage);
        attributes && _applyGeometry(attributes.matrix, renderObject);
      }

      // draw on every frame by default for now
      this.subRenderer.render(this.stage);

      // we're okay to accept new drawing instructions
      this.emit('canRender');
    }

  }, EventEmitter);

  return CanvasPixiRenderer;

});
