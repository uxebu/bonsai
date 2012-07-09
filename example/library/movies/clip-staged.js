// clipping object that was added to the stage previously
// expected behaviour: an error is thrown

var clippingObject = Shape.rect(0, 0, 50, 50).attr('fillColor', 'red').addTo(stage);

// target object
Shape.rect(50, 50, 300, 300).attr({fillColor: 'blue'}).addTo(stage)
  .attr('clip', clippingObject);

// debug border
Shape.rect(50, 50, 300, 300).attr({lineColor:'gray', lineWidth:1}).addTo(stage);