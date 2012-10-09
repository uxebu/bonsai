function getXYAtLength(percent, a, b, c, d) {
 var pow = Math.pow;
 var t = percent;
 return pow(1-t,3)*a + 3*pow(1-t, 2)*t*b + 3*(1-t)*pow(t,2)*c + pow(t,3)*d;
}

function getPointAtLength(percent, points) {
 var pow = Math.pow;
 var per = percent;
 var p = points;
 var x = getXYAtLength(percent, p[0], p[2], p[4], p[6]);
 var y = getXYAtLength(percent, p[1], p[3], p[5], p[7]);
    return {x:x,y:y};
}

var path = ['M',20,20, 'C',140,1110, 490,310, 180,480].join(' ');
var bezier = new Path(path).attr('strokeColor','#000').addTo(stage);
var circle = new Circle(20,20,5).attr('fillColor', '#000').addTo(stage);

var points = bezier.segments().join().split(",").filter(function(e){
 return !isNaN(+e);
});

var i = 0;
(function loop(){
  setTimeout(loop, 116);
  var point = getPointAtLength(i, points);
  circle.attr('x', point.x);
  circle.attr('y', point.y);
  i += 0.1;
  if (i>=1) { i = 0; }
})();

