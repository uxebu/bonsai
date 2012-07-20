/**
 * Animated attributes
 */
var shape1 = bonsai.Path.rect(0, 50, 100, 100).attr({fillColor: 'red'});
var shape2 = bonsai.Path.rect(0, 200, 100, 100).attr({fillColor: 'green'});
var shape3 = bonsai.Path.rect(0, 350, 100, 100).attr({fillColor: 'blue'});

stage.children([shape1,shape2,shape3]);

shape1.animate('3000ms', { x: 300 }, { easing: 'linear' });
shape2.animate('3000ms', { x: 300 }, { easing: 'expoOut' });
shape3.animate('3000ms', { x: 300 }, { easing: 'elasticOut' });
