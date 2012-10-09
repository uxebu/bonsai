var button = new Group().addTo(stage);

button.bg = new Rect(50, 50, 100, 40, 5).attr({
	fillGradient: gradient.radial(['#19D600', '#0F8000'], 100, 50, -20),
	strokeColor: '#CCC',
	strokeWidth: 0
}).addTo(button);

button
	.on('mouseover', function() {
		button.bg.animate('.2s', {
			fillGradient: gradient.radial(['#9CFF8F', '#0F8000'], 100, 50, -20),
			strokeWidth: 3
		})
	})
	.on('mouseout', function() {
		button.bg.animate('.2s', {
			fillGradient: gradient.radial(['#19D600', '#0F8000'], 100, 50, -20),
			strokeWidth: 0
		})
	})
	.on('click', function() {
		alert('Thanks for clicking me.');
	})

button.text = new Text('Button').attr({
  x: 70,
  y: 63,
  fontFamily: 'Arial',
  fontSize: '20px',
  textFillColor: 'white',
  filters: ['blur', filter.dropShadow(1,1,1,255)]
}).addTo(button);
