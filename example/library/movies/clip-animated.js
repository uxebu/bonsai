// animated clipping object
// expected behaviour: a small blue rect at the left, top corner that animates

var clippingObject = Path.rect(0, 0, 50, 50).attr('fillColor', 'red')
  .animate('1s', { rotation: Math.PI*2 }, {repeat:Infinity});

// target object
Path.rect(50, 50, 300, 300).attr({fillColor: 'blue'}).addTo(stage)
  .attr('clip', clippingObject);

// debug border
Path.rect(50, 50, 300, 300).attr({lineColor:'gray', lineWidth:1}).addTo(stage);
