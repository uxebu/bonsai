stage = new Group().addTo(stage);

stage.attr({x:240, y:240});

var star = new Star(25, 25, 10,5).attr({
  fillColor:'white'
});

var bmp = new Bitmap('assets/blue.png')
  .addTo(stage)
  .attr({mask:star, origin:{x:25, y:25}})

bmp.animate('1s', {scale:10}, {repeat:Infinity});

