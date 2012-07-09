var fs          = require('fs'),
    path        = require('path'),
    webdriverjs = require('webdriverjs');

module.exports = function (options, callback) {
  var duration = options.duration,
      port     = options.port || '9222',
      url      = options.url;

  var client = webdriverjs.remote({
    host: 'localhost',
    logLevel: 'silent',
    port: 4444
  });

  client.init({
    browserName: 'chrome',
    'chrome.switches': [
      '--enable-memory-info',
      '--remote-debugging-port=' + port
    ]
  });

  var devClient = webdriverjs.remote({
    host: 'localhost',
    logLevel: 'silent',
    port: 4444
  });

  devClient
    .init({ browserName: 'chrome' })
    .url('http://localhost:' + port)
    .click('.frontend_ref', function() {
      client
        .url(url)
        .pause(1e3)
        .execute('console.profile(); return 0;')
        .pause(duration)
        .execute('console.profileEnd(); return console.profiles;', function(result) {
          var profile = result.value[0];
          callback(profile);
          devClient.end();
        })
        .end();
    });
};
