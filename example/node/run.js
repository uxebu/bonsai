/*
  Runs a bikeshed movie within a node process
*/

var bikeshed = require('../../src/bootstrapper/_dev/node');
console.log(bikeshed.run(null, {url: '../library/movies/animation-circles.js'}));
