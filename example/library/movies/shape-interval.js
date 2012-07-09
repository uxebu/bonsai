// bs.Shape.rect returns a {DisplayObject}
var rectShape = bonsai.Shape.rect(0, 0, 150, 150).attr({x:150,y:150});
rectShape.attr({fillColor:'red', lineWidth:1});

var counter = 1;

// interval-example shows that animations can be done wrong

var interval = setInterval(function() {

  rectShape.lineBy(15,5).attr({x:counter*5,rotation:counter/3});
  counter++;

  if (counter === 60) {
    rectShape.remove();
    clearInterval(interval);
    interval = null;
  }

}, 100);

stage.addChild(rectShape);
