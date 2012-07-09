// combine clip and mask

var group = new Group()
  .addTo(stage);
Shape.rect(0, 0, 700, 700)
  .addTo(group)
  .attr({fillColor: 'red'})
new Text('bonsai')
  .addTo(group)
  .attr({fontSize: 100, fontWeight: 'bold'})
  .attr({x: 120, y: 220});

var mask = Shape.circle(350, 270, 250)
  .attr({fillGradient: gradient.radial(['white', 'black'])})

// mask out a circle with a gradient
group.attr({mask: mask});
// clip the mask using a rect, so we have masked+clipped
var clipRect = Shape.rect(-400, -300, 200, 700);
mask.attr({clip: clipRect});

clipRect.animate('4s', {x: 300}, {repeat:Infinity}); 
