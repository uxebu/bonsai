/*

This is a demonstration of morphing between two shapes originally
of different segment lengths. The toCurves method is passed the intended
number of curves. We insert NULL curves to satisfy this -- i.e. curves
that don't do anything, but can be animated by the Animation class
(via the segments translations)


*/

var a = new Rect(10, 10, 400, 150).attr('fillColor', 'red');
var b = new Star(100, 100, 100, 5).attr('fillColor', 'blue');

var numberOfCurves = Math.max(
  a.attr('segments').length,
  b.attr('segments').length
);

a.toCurves(numberOfCurves);
b.toCurves(numberOfCurves);

var animation = new Animation('3s', {
  // Animate the path
  segments: b.attr('segments'),
  // Animate the position too
  x: b.attr('x'),
  y: b.attr('y')
});

animation.setSubject(a);
a.addTo(stage);

animation.play();
