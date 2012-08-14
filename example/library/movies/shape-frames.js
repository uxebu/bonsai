/**
 * Using the timeline's frames() method, frame numbers only
 *
 * Should show a red square, then turn to blue, then to green.
 */
var rectPath = bonsai.Path.rect(150, 150, 150, 150).attr({fillColor: 'red', strokeColor: 'green', strokeWidth: 5});

stage.addChild(rectPath);

stage.frames({
  120: function(){
    console.log('blue');
    rectPath.attr({fillColor: 'blue'});
  },
  240: function(){
    console.log('green');
    rectPath.attr({fillColor: 'green'});
  },
  360: function(){
    console.log('yellow');
    rectPath.attr({fillColor: 'yellow'});
  }
});
