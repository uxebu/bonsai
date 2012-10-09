/**
 * Animated attributes
 */
var shape = new Rect(0, 0, 100, 100).attr({fillColor: 'red'});

var animation = new KeyframeAnimation('4s', {
    '0s': {x: 0, y: 0},
    '1s': {y: 0, x: 400},
    '2s': {x: 400, y: 400},
    '3s': {x: 0, y: 400},
    to: {x: 0, y: 0}
}, {repeat:Infinity});

stage.addChild(shape);
shape.animate(animation);

// Animate the fillColor, strokeColor and position.

var animation = new KeyframeAnimation('4s', {
    from: {x: 400, y: 0,   fillColor: 'blue',  strokeColor:'black'},
    '1s': {x: 0,   y: 0,   fillColor: 'yellow',strokeColor:'red'},
    '2s': {x: 0,   y: 400, fillColor: 'green', strokeColor:'green'},
    '3s': {x: 400, y: 400, fillColor: 'red',   strokeColor:'yellow'},
    to:   {x: 400, y: 0,   fillColor: 'black', strokeColor:'blue'}
}, {repeat:Infinity});
Path.rect(0, 0, 100, 100)
  .addTo(stage)
  .attr({strokeWidth:15})
  .animate(animation);
