/**
 * stepping feet
 */

var bs = bonsai,
    lines = new Path(),
    darkFoot = new Path(),
    lightFoot = new Path(),
    feet = new Group(),
    i;

darkFoot
  .moveTo(0,205)
  .lineTo(0,225)
  .lineTo(40,225)
  .lineTo(40,205)
  .lineTo(0,205)
  .attr({fillColor: "rgb(40,40,40)"});

lightFoot
  .moveTo(0,165)
  .lineTo(0,185)
  .lineTo(40,185)
  .lineTo(40,165)
  .lineTo(0,165)
  .attr({fillColor: "rgb(230,230,150)"});

feet.addChild(darkFoot);
feet.addChild(lightFoot);

stage.addChild(feet);

function line(x) {
  this.moveTo(x, 0)
      .verticalLineTo(411)
      .horizontalLineTo(x+20)
      .verticalLineTo(0)
      .lineTo(x, 0);
  return line;
};

for (i=0; i<14; i++) {
  line.call(lines, i*40);
}

stage.addChild(lines.attr({
  fillColor: "rgb(51,51,51)"
}));

// animations
(function animate() {
  lightFoot.animate('9s', {x: 508});
  darkFoot.animate('9s', {x: 508});

  setTimeout(function() {
    lightFoot.animate('9s', {x: 0});
    darkFoot.animate('9s', {x: 0});
    setTimeout(animate, 9000);
  }, 9000);
})();
