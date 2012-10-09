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

var targetPath = new Path();
//targetPath.addTo(stage);
targetPath.moveTo(154.35, 217.65);
targetPath.lineBy(34.55, -77.20);
targetPath.lineBy(20.70, -46.20);
targetPath.lineBy(33.60, 3.60);
targetPath.lineBy(84.10, 9.00);
targetPath.lineBy(16.75, 1.80);
targetPath.lineBy(13.90, 66.15);
targetPath.lineBy(14.00, 66.20);
targetPath.lineBy(-14.70, 8.40);
targetPath.lineBy(-73.20, 42.05);
targetPath.lineBy(-29.40, 16.90);
targetPath.lineBy(-37.60, -34.00);
targetPath.lineBy(-62.70, -56.70);
targetPath.lineBy(34.55, -77.20);
targetPath.lineBy(20.70, -46.20);
targetPath.lineBy(33.60, 3.60);
targetPath.lineBy(84.10, 9.00);
targetPath.lineBy(16.75, 1.80);
targetPath.lineBy(13.90, 66.15);
targetPath.lineBy(14.00, 66.20);
targetPath.lineBy(-14.70, 8.40);
targetPath.lineBy(-73.20, 42.05);
targetPath.lineBy(-29.40, 16.90);
targetPath.lineBy(-37.60, -34.00);
targetPath.lineBy(-62.70, -56.70);
targetPath.attr({
  strokeWidth: 444 / 20,
  strokeColor: 0x000000FF,
  fillColor: 'pink',
  cap: 'round',
  join: 'round'
});

shape.addTo(stage);

shape.morphTo(targetPath, '3s');
//*/
