define([
  '../../../event_emitter',
  '../../../tools',
  '../../../uri'
], function (EventEmitter, tools, URI) {
  'use strict';

  function WorkerContext(runnerUrl, doc, baseUrl) {
    this.runnerUrl = runnerUrl;
    this.baseUrl = baseUrl;
  }

  var proto = WorkerContext.prototype = tools.mixin({
    destroy: function() {
      var worker = this._worker;
      worker.terminate();
      delete worker.onmessage;
      delete this._worker;
    },

    init: function(options) {
      var runnerUrl = URI.parse(this.runnerUrl);
      if ((''+runnerUrl).indexOf('blob') === -1) {
        runnerUrl.fragment = encodeURIComponent(JSON.stringify(options));
      }
      var worker = this._worker = new Worker(runnerUrl);
      var runnerContext = this;
      worker.onmessage = function(event) {
        var msg = event.data;
        runnerContext.emit('message', msg);
        if (msg.command === 'scriptLoaded') {
          runnerContext.emit('scriptLoaded', msg.url);
        }
      };
    },

    notifyRunner: function(message) {
      this._worker.postMessage(message);
    },

    run: function(code) {
      this.notifyRunner({
        command: 'runScript',
        code: code
      });
    },

    load: function(url) {
      this.notifyRunner({
        command: 'loadScript',
        url: url
      });
    }
  }, EventEmitter);

  proto.notifyRunnerAsync = proto.notifyRunner;

  return WorkerContext;
});
