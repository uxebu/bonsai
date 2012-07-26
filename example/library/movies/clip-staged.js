// clipping object that was added to the stage previously
// expected behaviour: an error is thrown

var clippingObject = Path.rect(0, 0, 50, 50).attr('fillColor', 'red').addTo(stage);

// target object
Path.rect(50, 50, 300, 300).attr({fillColor: 'blue'}).addTo(stage)
  .attr('clip', clippingObject);

// debug border
Path.rect(50, 50, 300, 300).attr({strokeColor:'gray', strokeWidth:1}).addTo(stage);
