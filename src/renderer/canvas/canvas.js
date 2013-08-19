/**
 *  A Renderer for Canvas using CAAT framework
 */
define([
  '../../segment_helper',
  '../../event_emitter',
  '../../tools'
], function(segmentHelper, EventEmitter, tools) {
  'use strict';

  var exportToPath = segmentHelper.exportToPath;

  var defaultAttrs = {

  };

  function Canvas(node, width, height) {
    var canvasNode = this.canvasNode = document.createElement('canvas');
    var rootContainer = this.rootContainer = document.createElement('div');
    rootContainer.style.paddingLeft = '0';
    rootContainer.style.paddingTop = '0';
  
    if (width) {
      canvasNode.setAttribute('width', width);
    }
    if (height) {
      canvasNode.setAttribute('height', height);
    }
    var director = this.director = new CAAT.Foundation.Director().initialize(
      width,
      height,
      canvasNode
    );
    this.scene = director.createScene().setId(0);

    rootContainer.appendChild(canvasNode);
    node.appendChild(rootContainer);
  };

  function CanvasRenderer(node, width, height, options) {
    options = options || {};
    this.width = width;
    this.height = height;

    var canvas = this.canvas = new Canvas(node, width, height);
    CAAT.loop(1);
  };

  var proto = CanvasRenderer.prototype = tools.mixin({}, EventEmitter);

  proto.render = function(messages) {
    var i,
        drawName,
        id,
        actor,
        type,
        canvas = this.canvas,
        scene = canvas.scene,
        message;

    for (i = 0; (message = messages[i++]);) {
      id = message.id;
      type = message.type;

      actor = scene.findActorById(id);

      if (this[drawName = 'draw' + type]) {
          actor = this[drawName](actor, message);
          this.drawAll(actor, message);
      }
    }

    this.emit('canRender');
  };

  // helper  for generating the caat paths to use for drawing shapes
  var pathHelper = function(shapeData) {
    var path = new CAAT.PathUtil.Path(),
        init = shapeData[0],
        lastX = 0,
        lastY = 0,
        len;
    shapeData = shapeData.slice(1);
    len = shapeData.length;

    path.beginPath(init[1], init[2]);
    for (var i = 0; i < len; i++) {
      var action = shapeData[i];
      // TODO: not only use addLineTo
      // map functions
      path.addLineTo(lastX=(action[0] == 'lineTo'?action[1]:lastX+action[1]), lastY=(action[0] == 'lineTo'?action[2]:lastY+action[2]));
    }
    path.closePath();

    return path
  };

  proto.drawPath = function(actor, message) {
    var shapeData = message.data,
        canvas = this.canvas,
        scene = canvas.scene;
    // to generalize: we need different actors for different draw actions
    // map actors and have a single function that creates a specific actor and adds it to the scene
    if (!actor) {
      actor = new CAAT.Foundation.UI.PathActor().setId(message.id);
      scene.addChild(actor);
    }
    actor.setPath(
      pathHelper(shapeData)
    );

    return actor;
  };

  proto.drawAll = function(actor, message) {
    var attr = message.attributes;
    if (attr.matrix) {
      actor.setPosition(attr.matrix.tx, attr.matrix.ty);
    }
  };

  proto.drawBitmap = function(actor, message) {
    var attributes = message.attributes,
        canvas = this.canvas,
        scene = canvas.scene;

    if (!actor) {
      actor = new CAAT.Foundation.Actor().setId(message.id);
      scene.addChild(actor);
    }

    var naturalWidth = attributes.naturalWidth;
    var naturalHeight = attributes.naturalHeight;

    var ratio = naturalHeight / naturalWidth;

    var img = new Image();
    img.src = message.attributes.absoluteUrl;

    if (attributes.width == null && attributes.height == null) {
      attributes.width = naturalWidth;
      attributes.height = naturalHeight;
    }

    if (attributes.height == null) {
      attributes.height = (attributes.width || 0) * ratio;
    }

    if (attributes.width == null) {
      attributes.width = (attributes.height || 0) / ratio;
    }

    attributes.height && img.setAttribute('height', attributes.height);
    attributes.width && img.setAttribute('width', attributes.width);

    img.onload = function() {
      actor.setBackgroundImage(this, true);
    };
    return actor;
  };

  proto.drawText = function(actor, text) {
    var canvas = this.canvas,
        scene = canvas.scene;

    if (!actor) {
      actor = new CAAT.Foundation.UI.TextActor();
      scene.addChild(actor);
    }
    actor.setText(text);
  };

  proto.drawTextSpan = function(actor, message) {
    console.log(message);
  };

  proto.destroy = function() {
    var canvas = this.canvas;
    canvas.canvasNode.parentNode && canvas.canvasNode.parentNode.removeChild(canvas.canvasNode);
    delete this.canvas;
  };

  proto.getOffset = function() {
    return {
      left: 0,
      top: 0
    };
  };

  return CanvasRenderer;

});
