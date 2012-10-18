// flash dropshadow to bonsai dropshadow
// distance + rad = offset[X,Y]

var rad = 0;
var distance = 5;
var text = new Text('hello').addTo(stage).attr({x:50, y:50});

(function loop(){
  setTimeout(loop, 16);
  var x = distance * Math.cos(rad);
  var y = distance * Math.sin(rad);
  text.attr('filters', [filter.dropShadow(x, y, 0.79788453, 0x000000FF)]);
  rad += 0.05;
})();
