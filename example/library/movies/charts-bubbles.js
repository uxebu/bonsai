// Inspired by http://morph.com.au/blog/wp-content/uploads/2010/08/Infographic-The-Geosocial-Universe-Hi-Res.jpg
var bs = bonsai;

function bubble(color, x, y, size){
  var group = new Group();
  new Circle(x, y, size)
    .attr({fillColor: color, scaleY: 0.3})
    .addTo(group);
  new Arc(x, y, size/2, Math.PI, Math.PI*2)
    .attr({strokeWidth: size, strokeColor: color, opacity:0.5})
    .addTo(group);
  stage.addChild(group);
  return group;
};

bubble('blue', 150, 250, 100);
bubble('green', 420, 280, 50);
bubble('orange', 620, 180, 80);
bubble('red', 300, 400, 200);
