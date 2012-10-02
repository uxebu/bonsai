var vol = 0.0;
var tick = new Audio('assets/tick16.m4a').addTo(stage);
stage.on('tick', function() {
  vol += 0.01;
  //tick.play().attr({ volume: Math.min(vol, 1) });
});
