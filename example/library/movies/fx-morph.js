/*
This is a demonstration of morphing between two shapes originally
of different segment lengths. The toCurves method is passed the intended
number of curves. We insert NULL curves to satisfy this -- i.e. curves
that don't do anything, but can be animated by the Animation class
(via the segments translations)
*/

var a = new Rect(10, 10, 600, 450).attr('fillColor', 'red');
var b = new Star(250, 250, 250, 5).attr('fillColor', 'blue');
// Create a bg image of which we animate the opacity to visible.
var img = new Bitmap('assets/redpanda.jpg')
  .attr({width: 100, height: 100, opacity:0});
a.attr({
  fillGradient: gradient.radial(['green', 'black'], 100),
  filters: filter.blur(0),
  fillImage: img, fillRepeat: 6
});
var anim = new Animation('3s', {opacity:1}, {clock:stage});
img.animate(anim);

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
  y: b.attr('y'),
  filters: new filter.Blur(5)
});

animation.setSubject(a);
a.addTo(stage);

animation.play();
//animation.pause(); anim.pause();
