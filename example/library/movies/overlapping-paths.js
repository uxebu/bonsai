// http://jsbin.com/ociyiw/24/edit

new Rect(100, 100, 100, 100).fill("yellow").attr({opacity:0.5}).addTo(stage);
new Rect(160, 100, 100, 100).fill("green").attr({opacity:0.5}).addTo(stage);

var group = new Group().addTo(stage).attr({
  y:120,
  opacity:0.5
});
new Rect(100, 100, 100, 100).fill("yellow").addTo(group);
new Rect(160, 100, 100, 100).fill("green").addTo(group);
