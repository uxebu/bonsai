// simple clipping object (no animations, not added to the stage previously)
// expected behaviour: a small blue rect at the left, top corner

var clippingObject = Path.rect(0, 0, 50, 50);

// target object
Path.rect(50, 50, 300, 300).attr({fillColor: 'blue'}).addTo(stage)
  .attr('clip', clippingObject);

// debug border
Path.rect(50, 50, 300, 300).attr({strokeColor:'gray', strokeWidth:1}).addTo(stage);
