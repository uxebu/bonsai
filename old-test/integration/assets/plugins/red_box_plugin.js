wait();

setTimeout(function() {
  exports.redBoxFromPlugin = function() {
    return new Rect(0, 0, 100, 100).attr({
      fillColor: 'red'
    });
  };
  done();
}, 100);
