/**
 * collision detection line
 */

// move the circles (with your mouse)...

function update(){
  // pythagoras (A^2+B^2=C^2, where C is the distance between A and B)
  var distance = Math.sqrt(Math.pow(A.attr('x')-B.attr('x'), 2)+Math.pow(A.attr('y')-B.attr('y'), 2));
  // note: A and B have radius of 50
  if (distance < 100) {
    A.attr('strokeColor', 'red');
    B.attr('strokeColor', 'red');
  } else {
    A.attr('strokeColor', 'green');
    B.attr('strokeColor', 'green');
  }
}

var line = new Path().moveTo(150,150).lineTo(400,400).stroke('blue',3).addTo(stage);
var A = new Circle(150,150,50).stroke('green', 1).addTo(stage).on('pointerdown', function(){
  var x = this.attr('x');
  var y = this.attr('y');
  var drag,up;
  this.on('drag', drag=function(e){
    this.attr({x:x+e.diffX, y:y+e.diffY});
    var segs = line.segments();
    segs[0] = ['moveTo', x+e.diffX, y+e.diffY];
    line.segments(segs);
    update();
  });
  this.on('pointerup', up=function(){
    this.removeListener('drag',drag);
    this.removeListener('up',up);
  });
});
var B = new Circle(400,400,50).stroke('green', 1).addTo(stage).on('pointerdown', function(){
  var x = this.attr('x');
  var y = this.attr('y');
  var drag,up;
  this.on('drag', drag=function(e){
    this.attr({x:x+e.diffX, y:y+e.diffY});
    var segs = line.segments();
    segs[1] = ['lineTo', x+e.diffX, y+e.diffY];
    line.segments(segs);
    update();
  });
  this.on('pointerup', up=function(){
    this.removeListener('drag',drag);
    this.removeListener('up',up);
  });
});

