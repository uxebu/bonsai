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
  './pixijs/handle_message_group',
  './pixijs/handle_message_path',
  './pixijs/handle_message_bitmap',
  'pixi'
], function(EventEmitter, tools, color, handleMessageStage, handleMessageGroup,
  handleMessagePath, handleMessageBitmap, pixi) {
  'use strict';

  var _messageHandler = {
    handleStage: handleMessageStage,
    handleGroup: handleMessageGroup,
    handlePath: handleMessagePath,
    handleBitmap: handleMessageBitmap
  };

  function CanvasPixiRenderer(node, width, height, options) {

    // rendered objects
    this._renderObjects = {
      0: _messageHandler.handleStage.createRenderObject({type: 'Stage', id: 0})
    };

    // create a renderer instance.
    this._subRenderer = pixi.autoDetectRenderer(width, height, {
      antialias: true
    });

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

          messageHandler.detach(message, renderObjects);

        } else if (renderObjects[message.id]) {

          messageHandler.updateAttributes(message, renderObjects);
          messageHandler.updateFilter(message, renderObjects);
          messageHandler.updateGeometry(message, renderObjects);
          messageHandler.updateParent(message, renderObjects);

        } else {

          renderObject = renderObjects[message.id] = messageHandler.createRenderObject(message);
          messageHandler.updateAttributes(message, renderObjects);
          messageHandler.updateFilter(message, renderObjects);
          messageHandler.updateGeometry(message, renderObjects);
          messageHandler.updateParent(message, renderObjects);
          messageHandler.processToDoList(message, renderObjects);

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
