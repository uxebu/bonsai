// The explicit version to create a text on the screen.
// That has a gradient fill style.
var text = new Text('Say hello Text 1');
text.attr({
  x: 10, y: 10, textFillColor: 'red',
  fontFamily: 'Arial', fontSize: '20px',
  textFillGradient: gradient.radial(['white', 'black'], 100)
});
stage.addChild(text);

// Upside down text.
// fontSize can also be a pure number, nice for animating it.
// Note that the point that the text rotates around is the upper left corner
// of the unrotated text, so the left top corner of the "S"!
new Text('Say hello Text 2')
  .attr({x: 500, y: 40, textFillColor: 'blue',
    fontFamily: 'Arial', fontSize: 40, rotation: Math.PI
  })
  .addTo(stage);

// Rotating text.
var text = new Text('Say hello Text 3');
text.attr({
  x: 100, y: 80, textFillColor: 'green',
  fontFamily: 'Arial', fontSize: '20px'
});
stage.addChild(text);
text.animate('10s', {rotation: Math.PI*3});

// A little fancier animation.
var text = new Text('Say hello Text 4');
text.attr({
  x: 200, y: 300, textFillColor: 'black', opacity: 0.5,
  fontFamily: 'Arial', fontSize: 20, fontWeight: 'bold'
});
stage.addChild(text);
text.animate('5s', {rotation: Math.PI*1.5, y:600,fontSize:250}, {easing:'elasticOut'});


new Text('selectable:false')
  .addTo(stage)
  .attr({x:100, y:100, fontSize:50, selectable:false})

new Text('hohoho')
  .addTo(stage)
  .attr({x:300,y:300,textFillColor:'red', fontSize:20})
  .attr({text:'this text is updated via attr({text:...})'})
