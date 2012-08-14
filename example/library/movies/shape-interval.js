// bs.Path.rect returns a {DisplayObject}
var rectPath = bonsai.Path.rect(0, 0, 150, 150).attr({x:150,y:150});
rectPath.attr({fillColor:'red', strokeWidth:1});

var counter = 1;

// interval-example shows that animations can be done wrong

var interval = setInterval(function() {

  rectPath.lineBy(15,5).attr({x:counter*5,rotation:counter/3});
  counter++;

  if (counter === 60) {
    rectPath.remove();
    clearInterval(interval);
    interval = null;
  }

}, 100);

stage.addChild(rectPath);
