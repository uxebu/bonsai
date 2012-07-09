var rect = new bonsai.Shape().rect(-50, -50, 100, 100).attr({
  fillColor: 'red',
  x: 200,
  y: 200
});

stage.addChild(rect);

rect.animate('5s', {
  rotation: 10 * Math.PI * 2
}, {easing: 'cubicIn', repeat: Infinity});


/*stage.addChild(
  bonsai.Shape.rect(200, 200, 100, 100).
    attr({fillColor:'red'}).
    animate('5s', {rotation: 10 * Math.PI * 2}, {easing: 'cubicIn', repeat: Infinity})
);*/
