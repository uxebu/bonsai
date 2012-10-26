/**
 * collision detection moving
 */

// move the circles (with your mouse)...

// the circle moves on the blue line. if it collides with
// the other circle anywhere during that move, the circles
// will turn red and a red dot will appear on the center
// point where the one circle will be when it first collides

var hit = null;
function update(){
  A.attr('strokeColor','green');
  B.attr('strokeColor','green');
  if (hit) hit = hit.destroy();
  
  var Ax = A.attr('x');
  var Ay = A.attr('y');
  
  var Bx = B.attr('x');
  var By = B.attr('y');
  
  var combinedRadius = 100; // both are 50

  var dx = AAx-Ax;
  var dy = AAy-Ay;
  
  var fx = Ax - Bx;
  var fy = Ay - By;
  
  // http://stackoverflow.com/questions/1073336/circle-line-collision-detection
  // http://mathworld.wolfram.com/Circle-LineIntersection.html
  var a = (dx*dx+dy*dy);
  var b = 2 * (fx*dx+fy*dy);
  var c = (fx*fx+fy*fy) - (combinedRadius*combinedRadius);
  var discriminant = (b*b)-(4*a*c);
  
  // if discriminant = <0, there are no intersections of B on A-AA
  if (discriminant <= 0) return;

  // get t1 and t2 to determine where on A-AA the collisions occur
  discriminant = Math.sqrt(discriminant);
  var t1 = (-b + discriminant) / (2*a);
  var t2 = (-b - discriminant) / (2*a);

  // start is A, end is AA, check if eiter t is on A-AA
  if ((t1 < 0 || t1 > 1) && (t2 < 0 || t2 > 1)) return;
  
  // nearest collision to A?
  var t = t1 < t2 && t1 > 0 ? t1 : t2 > 0 ? t2 : t1;
  
  A.attr('strokeColor','red');
  B.attr('strokeColor','red');
  hit = new Circle(Ax+(dx*t), Ay+(dy*t), 5).fill('red').addTo(stage);
}

var AAx = 400;
var AAy = 300;

// want this circle below everything else
var Bbig = new Circle(300,400,100).stroke('#555', 1).attr('opacity',.2).addTo(stage);

var line = new Path().moveTo(150,150).lineTo(AAx,AAy).stroke('blue',3).addTo(stage);
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

var B = new Circle(300,400,50).stroke('green', 1).addTo(stage).on('pointerdown', function(){
  var x = this.attr('x');
  var y = this.attr('y');
  var drag,up;
  this.on('drag', drag=function(e){
    this.attr({x:x+e.diffX, y:y+e.diffY});
    Bbig.attr({x:x+e.diffX, y:y+e.diffY});
    update();
  });
  this.on('pointerup', up=function(){
    this.removeListener('drag',drag);
    this.removeListener('up',up);
  });
});
