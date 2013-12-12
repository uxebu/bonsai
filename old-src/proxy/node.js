define(function() {
  'use strict';

  /**
   * Proxy for node server
   * @param {Object} config
   * @param {string} config.url The uri of the node service
   * @param messageCallback
   */
  function NodeClientProxy(config) {
    this.config = config;
  }

  NodeClientProxy.prototype = {
    destroy: function() {
      this._conn.close();
      delete this._conn;
      return this;
    },

    init: function(readyCallback) {
      var config = this.config;
      this._conn = io.connect(config.runnerUrl);
      this.send(config);
      readyCallback();
    },

    receive: function(listener) {
      this._conn.on('message', listener);
    },

    send: function(data) {
      this._conn.emit('message', data);
    }
  };

  function NodeServerProxy(socket) {
    this._socket = socket;
  }

  NodeServerProxy.prototype = {
    receive: function(listener) {
      this._socket.on('message', listener);
    },

    send: function(data) {
      this._socket.emit('message', data);
    }
  };

  return {
    Client: NodeClientProxy,
    Server: NodeServerProxy
  };
});
