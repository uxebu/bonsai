/**
 * bounding box
 */

var box = new Arc(400, 400, 150, 1, 3, 1).addTo(stage).stroke('red',2).getBoundingBox();
console.log(box);
new Rect(box.left+400, box.top+400, box.width, box.height).stroke('green', 2).addTo(stage);

function Tracker(path) {
  this.trackee = path;
  this.group = new Group().addTo(path.parent);
  this.box = new Rect(0, 0, 1000, 1000).addTo(this.group).stroke('#000', 2);
  this.vert1 = new Path().addTo(this.group).moveTo(0, 0).lineTo(0, 1000).stroke('#F00', 2);
  this.vert2 = new Path().addTo(this.group).moveTo(0, 0).lineTo(0, 1000).stroke('#F00', 2);
  this.horz1 = new Path().addTo(this.group).moveTo(0, 0).lineTo(1000, 0).stroke('#00F', 2);
  this.horz2 = new Path().addTo(this.group).moveTo(0, 0).lineTo(1000, 0).stroke('#00F', 2);
  stage.on('advance', this, this.track);
}

Tracker.prototype = {
  track: function() {
    var box = this.trackee.getBoundingBox( this.trackee.attr('matrix') );
    this.vert1.attr('x', box.left);
    this.vert2.attr('x', box.right);
    this.horz1.attr('y', box.top);
    this.horz2.attr('y', box.bottom);
  }
}

var star = Path.star(100, 100, 50, 5, 3);

star.fill('yellow').stroke('black', 1);
star.addTo(stage);
new Tracker(star);

anim();


function anim() {
  star.morphTo(
    new Star(
      Math.random() * 400 + 200,
      Math.random() * 400 + 200,
      Math.random() * 80 + 20,
      0 | Math.random() * 5 + 5,
      Math.random() * 3 + .2
    ).fill('random').stroke('random', 1).attr('rotation', Math.random() * Math.PI*2),
    '2s',
    {
      onEnd: anim,
      easing: 'sineInOut'
    }
  );
}
