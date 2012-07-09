// Used in the bonsai slides (initially for BBDEvCon)

Shape.rect(50, 50, 350, 350)
  .addTo(stage)
  .attr({lineColor: 'black', lineWidth: 4})
  .attr({fillGradient: gradient.linear('bottom', ['red', 'yellow'])})


new Bitmap('assets/redpanda.jpg')
  .addTo(stage)
  .attr({x: 100, y: 100})


new Text('bonsai')
  .addTo(stage)
  .attr({x: 105, y: 200})
  .attr({textLineColor: 'white', lineWidth: 2})
  .attr({textFillColor: color('blue').lighter(.3)})
  .attr({filters: new filter.DropShadow([5,5,5,'#FFF'])})
  .attr({fontSize: 50, fontWeight: 'bold'})
