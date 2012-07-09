/**
 * Animated Color
 */
var rect = bonsai.Shape.rect(150, 150, 150, 150).attr({fillColor: 'red', lineColor: 'green'});

stage.addChild(rect);

rect.animate('3s', {fillColor: 'blue', lineColor: 'yellow', lineWidth: 70});