/**
 * Animated attributes
 */
var shape = bonsai.Shape.rect(0, 0, 100, 100).attr({fillColor: 'red'});

var animation = new bonsai.KeyframeAnimation('4s', {
    '0s': {x: 0, y: 0},
    '1s': {y: 0, x: 400},
    '2s': {x: 400, y: 400},
    '3s': {x: 0, y: 400},
    to: {x: 0, y: 0}
}, {repeat:Infinity});

stage.addChild(shape);
shape.animate(animation);

// Animate the fillColor, lineColor and position.

var animation = new bonsai.KeyframeAnimation('4s', {
    from: {x: 400, y: 0,   fillColor: 'blue',  lineColor:'black'},
    '1s': {x: 0,   y: 0,   fillColor: 'yellow',lineColor:'red'},
    '2s': {x: 0,   y: 400, fillColor: 'green', lineColor:'green'},
    '3s': {x: 400, y: 400, fillColor: 'red',   lineColor:'yellow'},
    to:   {x: 400, y: 0,   fillColor: 'black', lineColor:'blue'}
}, {repeat:Infinity});
Shape.rect(0, 0, 100, 100)
  .addTo(stage)
  .attr({lineWidth:15})
  .animate(animation);
