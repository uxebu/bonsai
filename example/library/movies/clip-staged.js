/**
 * clip staged
 */

// clipping object that was added to the stage previously
// expected behaviour: an error is thrown

var clippingObject = new Rect(0, 0, 50, 50).attr('fillColor', 'red').addTo(stage);

// target object
new Rect(50, 50, 300, 300).attr({fillColor: 'blue'}).addTo(stage)
  .attr('clip', clippingObject);

// debug border
new Rect(50, 50, 300, 300).attr({strokeColor:'gray', strokeWidth:1}).addTo(stage);
