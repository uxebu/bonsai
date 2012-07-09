/**
 * Using the timeline's frames() method, using seconds as unit
 *
 * Should show a red square, then turn to blue, then to green.
 */
var rectShape = bonsai.Shape.rect(150, 150, 150, 150).attr({fillColor: 'red', lineColor: 'green', lineWidth: 5});

stage.addChild(rectShape);

stage.frames({
  '2s': function(){
    rectShape.attr({fillColor: 'blue', opacity: 0.5});
  },
  '4s': function(){
    rectShape.attr({fillColor: 'green', opacity:1});
  },
  '6s': function(){
    rectShape.attr({fillColor: 'yellow'});
  }
});
