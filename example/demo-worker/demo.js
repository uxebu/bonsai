stage.play();
stage.frames({
  0: function(){},
  '5s': function(){}
});

// bs.Path.rect returns a {DisplayObject}
var rectPath = bonsai.Path.rect(150, 150, 150, 150).canvasArcTo(30, 30, 20, 20, 30);
rectPath.attributes({fill:'red'});

var counter = 1;
var interval = setInterval(function() {

  rectPath.addChild('l15,5').attributes({transform:'r90'});
  counter++;

  if (counter === 30) {
    //rectPath.remove();
    clearInterval(interval);
    interval = null;
  }

}, 100);

// add [DisplayObjectInstance] to [Stage]
stage.addChild(rectPath);
