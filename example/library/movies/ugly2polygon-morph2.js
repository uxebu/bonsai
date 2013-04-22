/**
 * ugly 2 polygon morph
 */

var shape = new Path()
  .moveTo(469.95, 196.45)
  .quadraticCurveBy(94.45, 220.10, 5.10, 184.80)
  .quadraticCurveBy(-89.40, -35.30, -131.65, -5.10)
  .quadraticCurveBy(-42.25, 30.15, -116.20, -3.30)
  .quadraticCurveBy(-73.95, -33.45, 70.30, -76.55)
  .quadraticCurveBy(144.25, -43.15, -11.70, -126.05)
  .quadraticCurveBy(-156.00, -82.90, -48.85, -72.30)
  .quadraticCurveBy(107.15, 10.60, 122.85, -55.50)
  .quadraticCurveBy(15.70, -66.10, 110.15, 154.00)
  .closePath()
  .attr({
    fillColor: 0x33FF00FF,
    strokeWidth: 20,
    strokeColor: 'black'
  })
  .addTo(stage);

var targetPath = new Star(400,400,300,5,1)
  .attr({
    strokeWidth: 444 / 20,
    strokeColor: 0x000000FF,
    fillColor: 'pink',
    cap: 'round',
    join: 'round'
  });

shape.morphTo(targetPath, '3s');
