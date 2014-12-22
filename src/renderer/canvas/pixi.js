/**
 * A special Renderer for SVG.
 *
 * @requires module:renderer
 */
define([
  '../../event_emitter',
  '../../tools',
  '../../color',
  '../../segment_helper',
  'pixi',
  '../../asset/asset_controller'
], function(EventEmitter, tools, color, segmentHelper, pixi, AssetController) {
  'use strict';

  console.log(pixi);

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
    this.stage = new pixi.Stage(0xFFFFFF);

    // create a renderer instance.
    this.subRenderer = pixi.autoDetectRenderer(width, height);

    //var target = new pixi.Point();

    // add the renderer view element to the DOM
    node.appendChild(this.subRenderer.view);

    // render stage
    this.subRenderer.render(this.stage);

  }

  CanvasPixiRenderer.prototype = tools.mixin({

    destroy: function() {},

    getOffset: function() {
      return {left: 0, top: 0};
    },

    render: function(messages) {
      var i, message, id, type;
      // Go through messages to identify deleted and changed objects, and then
      // draw the object using the draw[ObjectType] method:
      for (i = 0; (message = messages[i++]);) {
        id = message.id;
        type = message.type;

        if (type === 'bitmap_hidden') {
          continue;
        }

      }

      this.emit('canRender');
    }

  }, EventEmitter);

  return CanvasPixiRenderer;

});
