var eye = new Circle(10,-35,7)
 .attr('fillColor', '#fff');
var on  = 'l 60 0 L 60 0 A 60 60 0 1 1 48.54 -35.26';
var off = 'l 60 0 L 60 0 A 60 60 0 1 1 60 -0.0001';
var pm = new bonsai.Path().attr('fillColor', 'red');

var pacman = new Group()
 .attr({'y': 100, 'rotation': 0.1}).addTo(stage);
pacman.addChild.call(pacman, [pm, eye]);

var i = 0;
(function loop(e) {
  setTimeout(loop, 150);
  pm.path(i%2 ? on : off);
  pacman.attr('x', i);
  i++;
})();
