var star = new Star(240, 240, 10,5).attr({
  fillColor:'blue'
}).addTo(stage);

star.animate('1s', {scale:10}, {repeat:Infinity});


