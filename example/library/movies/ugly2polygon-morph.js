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
  });


var targetPath = new Path()
  .moveTo(154.35, 217.65)
  .lineBy(34.55, -77.20)
  .lineBy(20.70, -46.20)
  .lineBy(33.60, 3.60)
  .lineBy(84.10, 9.00)
  .lineBy(16.75, 1.80)
  .lineBy(13.90, 66.15)
  .lineBy(14.00, 66.20)
  .lineBy(-14.70, 8.40)
  .lineBy(-73.20, 42.05)
  .lineBy(-29.40, 16.90)
  .lineBy(-37.60, -34.00)
  .lineBy(-62.70, -56.70)
  .lineBy(34.55, -77.20)
  .lineBy(20.70, -46.20)
  .lineBy(33.60, 3.60)
  .lineBy(84.10, 9.00)
  .lineBy(16.75, 1.80)
  .lineBy(13.90, 66.15)
  .lineBy(14.00, 66.20)
  .lineBy(-14.70, 8.40)
  .lineBy(-73.20, 42.05)
  .lineBy(-29.40, 16.90)
  .lineBy(-37.60, -34.00)
  .lineBy(-62.70, -56.70)
  .attr({
    strokeWidth: 444 / 20,
    strokeColor: 0x000000FF,
    fillColor: 'pink',
    cap: 'round',
    join: 'round'
  });

shape.addTo(stage);
shape.morphTo(targetPath, '3s');
