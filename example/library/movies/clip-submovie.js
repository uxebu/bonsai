// Submovie as clipping object
// expected behaviour: an small blue rect at the left, top corner

var clippingObject = new Movie().frames({
  0: function() {
    this.addChild( Path.rect(0, 0, 50, 50).attr('fillColor', 'red') );
  },
  1: function() { this.stop(); }
});

// target object
Path.rect(50, 50, 300, 300).attr({fillColor: 'blue'}).addTo(stage)
  .attr('clip', clippingObject);

// debug border
Path.rect(50, 50, 300, 300).attr({strokeColor:'gray', strokeWidth:1}).addTo(stage);
