/**
 * A special Renderer for SVG.
 *
 * @requires module:renderer
 */
define([
  '../../event_emitter',
  '../../tools',
  '../../color',
  './pixijs/handle_message_stage',
  './pixijs/handle_message_path',
  './pixijs/handle_message_group',
  'pixi'
], function(EventEmitter, tools, color, handleMessageStage, handleMessagePath,
  handleMessageGroup, pixi) {
  'use strict';

  var _messageHandler = {
    handleStage: handleMessageStage,
    handlePath: handleMessagePath,
    handleGroup: handleMessageGroup
  };

  function _applyGeometry(matrix, renderObject) {
    var pixiObject = renderObject.pixiObject;
    pixiObject.worldTransform.a = matrix.a;
    pixiObject.worldTransform.b = matrix.b;
    pixiObject.worldTransform.c = matrix.c;
    pixiObject.worldTransform.d = matrix.d;
    pixiObject.worldTransform.tx = matrix.tx;
    pixiObject.worldTransform.ty = matrix.ty;
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

    // rendered objects
    this._renderObjects = {
      0: _messageHandler.handleStage.createRenderObject({type: 'Stage', id: 0})
    };

    // create a renderer instance.
    this._subRenderer = pixi.autoDetectRenderer(width, height);

    // add the renderer view element to the DOM
    node.appendChild(this._subRenderer.view);

    // render stage
    this._subRenderer.render(this._renderObjects[0].pixiObject);

  }

  CanvasPixiRenderer.prototype = tools.mixin({

    destroy: function() {
      this._subRenderer.destroy();
    },

    getOffset: function() {
      return {left: 0, top: 0};
    },

    config: function(data) {

      var stage;
      var item = data.item;
      var value = data.value;

      switch (item) {
        case 'crispEdges':
          break;
        case 'backgroundColor':
          stage = this._renderObjects[0].pixiObject;
          // Extract alpha value because PIXI does not support it
          stage.setBackgroundColor(color(value).toString().substr(0, 8));
          this._subRenderer.render(stage);
          break;
        case 'disableContextMenu':
          break;
      }

    },

    render: function(messages) {
      var i, message, type, renderObject, messageHandler;
      var renderObjects = this._renderObjects;
      var stage = renderObjects[0].pixiObject;

      for (i = 0; (message = messages[i++]);) {
        type = message.type || renderObjects[message.id].type;
        messageHandler = _messageHandler['handle' + type];
        if (message.detach) {
          messageHandler.remove(renderObjects[message.id], stage);
        } else if (renderObjects[message.id]) {
          messageHandler.update(message, renderObjects);
          _applyGeometry(message.attributes.matrix, renderObjects[message.id]);
        } else {
          renderObject = renderObjects[message.id] = messageHandler.createRenderObject(message);
          messageHandler.update(message, renderObjects);
          _applyGeometry(message.attributes.matrix, renderObject);
          messageHandler.addChild(renderObject, renderObjects[message.parent]);
        }
      }

      // draw on every frame by default for now
      this._subRenderer.render(stage);

      // we're okay to accept new drawing instructions
      this.emit('canRender');
    }

  }, EventEmitter);

  return CanvasPixiRenderer;

});
