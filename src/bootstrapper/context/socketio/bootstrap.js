var requirejs = require('../../lib/node_modules/requirejs'),
    fs = require('fs'),
    io = require('../../lib/node_modules/socket.io').listen(8081);

requirejs.config({
  nodeRequire: require,
  baseUrl: '../'
});

io.set('log level', 1); // No logging

io.sockets.on('connection', function init(socket) {

  function init(options) {
    socket.removeListener('message', init);
    requirejs([
      '../stage',
      '../proxy/node'
    ], function(Stage, messageProxy) {
      messageProxy = new messageProxy.Server(socket);
      // loader method to retrieve movies from urls -- specified here, b/c is
      // specific to environment.
      var loadUrl = function(url, callback) {
        var responseText = fs.readFileSync('../../example/library/' + url, ['utf-8']);
        callback(responseText);
      };
      new Stage(messageProxy, options, loadUrl);
      messageProxy.send({command: 'ready'});
    });
  }

  socket.on('message', init);
});
