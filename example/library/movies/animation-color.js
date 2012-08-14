/**
 * Animated Color
 */
var rect = bonsai.Path.rect(150, 150, 150, 150).attr({fillColor: 'red', strokeColor: 'green'});

stage.addChild(rect);

rect.animate('3s', {fillColor: 'blue', strokeColor: 'yellow', strokeWidth: 70});
