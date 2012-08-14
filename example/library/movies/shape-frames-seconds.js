/**
 * Using the timeline's frames() method, using seconds as unit
 *
 * Should show a red square, then turn to blue, then to green.
 */
var rectPath = bonsai.Path.rect(150, 150, 150, 150).attr({fillColor: 'red', strokeColor: 'green', strokeWidth: 5});

stage.addChild(rectPath);

stage.frames({
  '2s': function(){
    rectPath.attr({fillColor: 'blue', opacity: 0.5});
  },
  '4s': function(){
    rectPath.attr({fillColor: 'green', opacity:1});
  },
  '6s': function(){
    rectPath.attr({fillColor: 'yellow'});
  }
});
