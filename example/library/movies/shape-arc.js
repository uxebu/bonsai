
// x, y, radius, aStartAngle, aEndAngle, anticlockwise

var attr = {
  strokeWidth: 1
};

// arc test (smiley)
new Arc(150, 150, 100, 0, 2*Math.PI, 0).attr(attr).addTo(stage);
new Arc(150, 150, 80, 0, Math.PI, 0).attr(attr).addTo(stage);
new Arc(110, 100, 20, 0, Math.PI / 2, 1).attr(attr).addTo(stage);
new Arc(190, 100, 20, 0, Math.PI / (2/3), 0).attr(attr).addTo(stage);
new Arc(150, 150, 30, 0, Math.PI, 0).attr(attr).addTo(stage);
new Arc(150, 150, 150, 0, 0, 0).attr(attr).addTo(stage);

// compare to canvas api
// http://jsbin.com/canvas/86/edit#preview

// draw a donat-charts easily
var color = bonsai.color('orange');
var anti, donat;
var i = 0;
var attr = {
  strokeWidth: 15,
  strokeColor:color //strokeColor?
};
var antiAttr = {
  strokeWidth: 15,
  strokeColor:'#eee'
};

(function donatChart() {
  setTimeout(donatChart, 30);

  stage.removeChild(donat);
  donat = new Arc(400, 150, 60, 0, i+=0.1, 0).attr(attr);
  stage.addChild(donat);

  stage.removeChild(anti);
  anti = new Arc(400, 150, 60, 0, i, 1).attr(antiAttr);
  stage.addChild(anti);

  if (i >= Math.PI*2) {
    i = 0;
    antiAttr.strokeColor = attr.strokeColor;
    attr.strokeColor = color.randomize(['hue'], 0, 10);
  }
})();

new Arc(400, 350, 60, 0, 1)
  .attr({strokeWidth: 20, strokeColor: 'red'}) // should be strokeColor!
  .addTo(stage);
new Arc(400, 350, 60, 1.1, 3)
  .attr({strokeWidth: 40, strokeColor: 'blue'}) // should be strokeColor!
  .addTo(stage);
new Arc(400, 350, 80, Math.PI, 4)
  .attr({strokeWidth: 1, strokeColor: 'green'}) // should be strokeColor!
  .addTo(stage);
new Arc(400, 350, 90, 0, Math.PI*2 - 0.1)
  .attr({strokeWidth: 1, strokeColor: 'grey'}) // should be strokeColor!
  .addTo(stage);

// pizza slice
new Path(550,150)
  .lineBy(60, 0)
  .arc(550, 150, 60, 0, Math.PI*0.3)
  .closePath()
  .attr('fillColor', 'red')
  .addTo(stage);



// whould be cool to have sth like
// var donat = bonsai.Path.arc(400, 150, 60, 0, 0, 0).attr(attr);
// donat.animate('1sec', { angle2:'100%' }, { easing:xx})
