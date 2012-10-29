/**
 * collision detection both
 *
 * when both bodies are moving...
 */


// move the circles (with your mouse)...
// blue lines are the movement vectors for each circle
// orange line is the delta vector A_AA - B_BB and is
// used in computation. For that vector B is not moving.

// when the orange line intersects with the grey bigger circle,
// both circles will collide when moving at a (certain) constant
// speed over their blue lines

var hit = null;
function update(){
  A.attr('strokeColor','green');
  B.attr('strokeColor','green');
  if (hit) hit = hit.destroy();

  // end point of AB_AABB
  var ADx = Ax+((AAx-Ax)-(BBx-Bx));
  var ADy = Ay+((AAy-Ay)-(BBy-By));

  var combinedRadius = 100; // both are 50

  var dx = ADx-Ax;
  var dy = ADy-Ay;

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

var Ax = 150;
var Ay = 150;
var AAx = 400;
var AAy = 300;

var Bx = 300;
var By = 400;
var BBx = 200;
var BBy = 100;

// want this circle below everything else
var Bbig = new Circle(300,400,100).stroke('#555', 1).attr('opacity',.2).addTo(stage);

var A_AA = new Path().moveTo(Ax,Ay).lineTo(AAx,AAy).stroke('blue',3).addTo(stage);
var A = new Circle(Ax,Ay,50).stroke('green', 1).addTo(stage).on('pointerdown', function(){
  var x = Ax;
  var y = Ay;
  var drag,up;
  this.on('drag', drag=function(e){
    Ax = x+e.diffX;
    Ay = y+e.diffY;
    this.attr({x:Ax, y:Ay});

    var segs = A_AA.segments();
    segs[0] = ['moveTo', Ax, Ay];
    A_AA.segments(segs);

    segs = AB_AABB.segments();
    segs[0] = ['moveTo', Ax, Ay];
    segs[1] = ['lineBy', (AAx-Ax)-(BBx-Bx), (AAy-Ay)-(BBy-By)];
    AB_AABB.segments(segs);

    update();
  });
  this.on('pointerup', up=function(){
    this.removeListener('drag',drag);
    this.removeListener('up',up);
  });
});

var B_BB = new Path().moveTo(Bx,By).lineTo(BBx,BBy).stroke('blue',3).addTo(stage);
var B = new Circle(Bx,By,50).stroke('green', 1).addTo(stage).on('pointerdown', function(){
  var x = this.attr('x');
  var y = this.attr('y');
  var drag,up;
  this.on('drag', drag=function(e){
    Bx = x+e.diffX;
    By = y+e.diffY;
    this.attr({x:Bx, y:By});
    Bbig.attr({x:x+e.diffX, y:y+e.diffY});

    var segs = B_BB.segments();
    segs[0] = ['moveTo', Bx, By];
    B_BB.segments(segs);

    segs = AB_AABB.segments();
    segs[1] = ['lineBy', (AAx-Ax)-(BBx-Bx), (AAy-Ay)-(BBy-By)];
    AB_AABB.segments(segs);

    update();
  });
  this.on('pointerup', up=function(){
    this.removeListener('drag',drag);
    this.removeListener('up',up);
  });
});

// delta vector
var AB_AABB = new Path().moveTo(Ax,Ay)
  .lineBy((AAx-Ax)-(BBx-Bx), (AAy-Ay)-(BBy-By))
  .stroke('orange',2).addTo(stage);

update();