stage.play();
stage.frames({
  0: function(){},
  '5s': function(){}
});

// bs.Shape.rect returns a {DisplayObject}
var rectShape = bonsai.Shape.rect(150, 150, 150, 150).canvasArcTo(30, 30, 20, 20, 30);
rectShape.attributes({fill:'red'});

var counter = 1;
var interval = setInterval(function() {

  rectShape.addChild('l15,5').attributes({transform:'r90'});
  counter++;

  if (counter === 30) {
    //rectShape.remove();
    clearInterval(interval);
    interval = null;
  }

}, 100);

// add [DisplayObjectInstance] to [Stage]
stage.addChild(rectShape);
