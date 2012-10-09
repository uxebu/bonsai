var shape = new Path();
shape.moveTo(469.95, 196.45);
shape.quadraticCurveBy(94.45, 220.10, 5.10, 184.80);
shape.quadraticCurveBy(-89.40, -35.30, -131.65, -5.10);
shape.quadraticCurveBy(-42.25, 30.15, -116.20, -3.30);
shape.quadraticCurveBy(-73.95, -33.45, 70.30, -76.55);
shape.quadraticCurveBy(144.25, -43.15, -11.70, -126.05);
shape.quadraticCurveBy(-156.00, -82.90, -48.85, -72.30);
shape.quadraticCurveBy(107.15, 10.60, 122.85, -55.50);
shape.quadraticCurveBy(15.70, -66.10, 110.15, 154.00);
shape.closePath();
shape.attr({
  fillColor: 0x33FF00FF,
  strokeWidth: 20,
  strokeColor: 'black'
});
stage.addChild(shape);

var targetPath = new Star(400,400,300,5,1);
//  .addTo(stage);
targetPath.attr({
  strokeWidth: 444 / 20,
  strokeColor: 0x000000FF,
  fillColor: 'pink',
  cap: 'round',
  join: 'round'
});

shape.morphTo(targetPath, '3s');
//*/
