bonsai.Shape.prototype.clone = function() {
  return new bonsai.Shape().
      segments(this.segments()).
      attr(this.attr());
};

var animation = new bonsai.Animation('5s', {x: 200});

var rect = bonsai.Shape.rect(0, 0, 150, 150)
      .attr({
            fillColor:'red',
            rotation: Math.PI/180*35,
            x:150,
            y:150
          }),
    cloneMe = rect.clone().attr({x: 300}).animate(animation);



stage.addChild(rect);
stage.addChild(cloneMe);