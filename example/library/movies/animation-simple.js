/**
 * Animated attributes
 */
var rectShape = bonsai.Shape.rect(150, 150, 150, 150).attr({fillColor: 'red',lineColor: 'green', lineWidth: 5,});

stage.addChild(rectShape);

rectShape.animate('1s', { x: 300 });
