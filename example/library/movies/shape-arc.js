
// x, y, radius, aStartAngle, aEndAngle, anticlockwise

var attr = {
  lineWidth: 1
};

// arc test (smiley)
bonsai.Shape.arc(150, 150, 100, 0, 2*Math.PI, 0).attr(attr).addTo(stage);
bonsai.Shape.arc(150, 150, 80, 0, Math.PI, 0).attr(attr).addTo(stage);
bonsai.Shape.arc(110, 100, 20, 0, Math.PI / 2, 1).attr(attr).addTo(stage);
bonsai.Shape.arc(190, 100, 20, 0, Math.PI / (2/3), 0).attr(attr).addTo(stage);
bonsai.Shape.arc(150, 150, 30, 0, Math.PI, 0).attr(attr).addTo(stage);
bonsai.Shape.arc(150, 150, 150, 0, 0, 0).attr(attr).addTo(stage);

// compare to canvas api
// http://jsbin.com/canvas/86/edit#preview

// draw a donat-charts easily
var color = bonsai.color('orange');
var anti, donat;
var i = 0;
var attr = {
  lineWidth: 15,
  lineColor:color //lineColor?
};
var antiAttr = {
  lineWidth: 15,
  lineColor:'#eee'
};

(function donatChart() {
  setTimeout(donatChart, 30);

  stage.removeChild(donat);
  donat = bonsai.Shape.arc(400, 150, 60, 0, i+=0.1, 0).attr(attr);
  stage.addChild(donat);
  
  stage.removeChild(anti);
  anti = bonsai.Shape.arc(400, 150, 60, 0, i, 1).attr(antiAttr);
  stage.addChild(anti);
  
  if (i >= Math.PI*2) {
    i = 0;
    antiAttr.lineColor = attr.lineColor;
    attr.lineColor = color.randomize(['hue'], 0, 10);
  }
})();

bonsai.Shape.arc(400, 350, 60, 0, 1)
  .attr({lineWidth: 20, lineColor: 'red'}) // should be lineColor!
  .addTo(stage);
bonsai.Shape.arc(400, 350, 60, 1.1, 3)
  .attr({lineWidth: 40, lineColor: 'blue'}) // should be lineColor!
  .addTo(stage);
bonsai.Shape.arc(400, 350, 80, Math.PI, 4)
  .attr({lineWidth: 1, lineColor: 'green'}) // should be lineColor!
  .addTo(stage);
bonsai.Shape.arc(400, 350, 90, 0, Math.PI*2 - 0.1)
  .attr({lineWidth: 1, lineColor: 'grey'}) // should be lineColor!
  .addTo(stage);

// pizza slice
new bonsai.Shape(550,150)
  .lineBy(60, 0)
  .arc(550, 150, 60, 0, Math.PI*0.3)
  .closePath()
  .attr('fillColor', 'red')
  .addTo(stage);



// whould be cool to have sth like
// var donat = bonsai.Shape.arc(400, 150, 60, 0, 0, 0).attr(attr);
// donat.animate('1sec', { angle2:'100%' }, { easing:xx})
