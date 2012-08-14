// sth to discuss:
// 1) how can I change the mouse cursor?
// 2) how can I access my parent display object in an event-callback like ´drag´
// 3) how can I access siblings?
// 4) how can I change the order? (toBack/toFront)

// css
var pointStyle = {
  fillColor:'#ccc',
  strokeColor:'#aaa',
  strokeWidth:1,
  filters:filter.DropShadow(1,1,2, '#ccc')
};
var lineStyle = {
  strokeWidth:1,
  strokeColor: '#aaa'
};

function drawPointAtOrigin(x, y) {

  var connectedPoints = [];

  var group = new Group().addTo(stage).attr({
    x: x || 0,
    y: y || 0
  });

  var line = new Path().attr(lineStyle).addTo(group);

  var circle = Path.circle(50, 50, 7).attr(pointStyle).attr({
    x:0,
    y:0
  }).on('drag', function(data) {
    group.attr({x: data.x, y:data.y});
    group.updateConnections();
  }).addTo(group);

  group.updateConnections = function() {
    var thisAttr = this.attr(); //circle
    connectedPoints.forEach(function(aPoint) {
      var attr = aPoint.attr(); //circle
      line.clear().moveTo(0,0).lineTo(attr.x - thisAttr.x, attr.y - thisAttr.y);
    });
    this.delegates.forEach(function(delegate) {
      delegate.updateConnections();
    });
  };
  group.delegates = [];
  group.connect = function(anotherPoint) {
    connectedPoints.push(anotherPoint);
    anotherPoint.delegates.push(this);
    this.updateConnections();
  };

  return group;
}

// linear (first order)
var point1 = drawPointAtOrigin(100, 50);
var point2 = drawPointAtOrigin(100, 300);
point1.connect(point2);
