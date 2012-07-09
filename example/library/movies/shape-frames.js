/**
 * Using the timeline's frames() method, frame numbers only
 *
 * Should show a red square, then turn to blue, then to green.
 */
var rectShape = bonsai.Shape.rect(150, 150, 150, 150).attr({fillColor: 'red', lineColor: 'green', lineWidth: 5});

stage.addChild(rectShape);

stage.frames({
  120: function(){
    console.log('blue');
    rectShape.attr({fillColor: 'blue'});
  },
  240: function(){
    console.log('green');
    rectShape.attr({fillColor: 'green'});
  },
  360: function(){
    console.log('yellow');
    rectShape.attr({fillColor: 'yellow'});
  }
});
