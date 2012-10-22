define([
  '../../../message_channel',
  '../../../event_emitter',
  '../../../tools'
], function (MessageChannel, EventEmitter, tools) {
  'use strict';

  /**
   *
   * @param {string} runnerUrl The url to the bootstrap file.
   * @param {HTMLDocument} [doc=document] The document to append the iframe to.
   */
  function IFrameContext(runnerUrl, doc) {
    this.runnerUrl = runnerUrl;
    this.doc = doc;
  }

  IFrameContext.prototype = tools.mixin({
    MessageChannel: MessageChannel,

    destroy: function() {
      // freeze stage
      this.notifyRunner({command: 'freeze'});

      // destroy message channel
      this.messageChannel.destroy();
      delete this.messageChannel;

      this.removeAllListeners();

      // destroy iframe contents
      var frame = this.frame;
      frame.contentDocument.documentElement.innerHTML = '';
      frame.parentNode.removeChild(frame);
      delete this.frame;
    },

    init: function(options) {
      var doc = this.doc || document;
      var frame = this.frame = doc.createElement('iframe');
      (doc.body || doc.documentElement).appendChild(frame);
      frame.style.display = 'none';

      var frameWindow = this.frameWindow = frame.contentWindow;
      var frameDoc = this.frameDocument = frame.contentDocument;
      frameDoc.open();

      // Add messageChannel to global context in frame so that it can be caught by _dev/_build iframe
      this.messageChannel = frameWindow.messageChannel =
        new this.MessageChannel(tools.hitch(this, this.notify), function() {});

      frameWindow.options = options;
      frameWindow.isBonsaiMovie = true;

      var context = this;
      this.messageChannel.on('message', function(msg) {
        if (msg.command === 'scriptLoaded') {
          context.emit('scriptLoaded', msg.url);
        }
      });

      if (this.runnerUrl.indexOf('function __bonsaiRunnerCode__') > -1) {
        var runnerCode = this.runnerUrl.substring(
          this.runnerUrl.indexOf("{") + 1,
          this.runnerUrl.lastIndexOf("}")
        );
        frameDoc.write('<script>' + runnerCode + '</script>');
      } else {
        frameDoc.write('<script src="' + this.runnerUrl + '"></script>');
      }

      // TODO: y on first load fails in /library
      frameDoc.close();

      this.doc = this.init = null;
      return this;
    },

    notify: function(message) {
      this.emit('message', message);
    },

    notifyRunner: function(message) {
      this.messageChannel.notify(message);
    },

    notifyRunnerAsync: function(message) {
      setTimeout(tools.hitch(this, this.notifyRunner, message), 1);
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

  return IFrameContext;
});
