/**
 * animation morph
 */

// note: in the current api you cant use new Star as the starting shape...
var a = Path.star(100, 100, 100, 5).attr({
  fillColor: 'red',
  opacity: .5
});
var b = new Star(250, 250, 200, 10).attr({
  fillColor: 'blue'
});

a.addTo(stage);

a.morphTo(b, '3s');
