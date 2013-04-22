/**
 * clip simple
 */

// simple clipping object (no animations, not added to the stage previously)
// expected behaviour: a small blue rect at the left, top corner

var clippingObject = new Rect(0, 0, 50, 50);

// target object
new Rect(50, 50, 300, 300).attr({fillColor: 'blue'}).addTo(stage)
  .attr('clip', clippingObject);

// debug border
new Rect(50, 50, 300, 300).attr({strokeColor:'gray', strokeWidth:1}).addTo(stage);
