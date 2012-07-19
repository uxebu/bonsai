wait();

setTimeout(function() {
  exports.redBoxFromPlugin = function() {
    return Path.rect(0, 0, 100, 100).attr({
      fillColor: 'red'
    });
  };
  done();
}, 100);
