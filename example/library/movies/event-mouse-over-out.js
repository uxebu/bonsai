function animate(element, property, from) {
  if (!element || element === stage.root) return;
  var anim = {};
  anim[property] = element.initialValues[property];
  element
    .attr(property, from)
    .animate('.5s', anim);
}

tools.forEach(Array(4), function(_, i) {
  var initialFill = 'hsl(' + 90 * i + ', 100%, 50%)';
  var initialStroke = 'black'
  var rect = new Rect((i % 2) * 101, i > 1 ? 121 : 20, 100, 100)
    .fill(initialFill)
    .attr({
      strokeWidth: 2,
      strokeColor: initialStroke
    })
    .on('mouseover', function(event) {
      animate(this, 'fillColor', 'white');
      animate(event.relatedTarget, 'fillColor', 'black');
    })
    .on('mouseout', function(event) {
      animate(this, 'strokeColor', 'red');
      animate(event.relatedTarget, 'strokeColor', 'yellow');
    })
    .addTo(stage);
  rect.initialValues = {
    fillColor: initialFill,
    strokeColor: initialStroke
  };
});
