define(['../context/pender/bootstrap'], function(bootstrapPender) {
  /**
   * @type {Object}
   * @method on(type, callback) Takes a callback for an event type string.
   *    Only listeners for the 'message' event will be registered.
   * @method notifyRenderer(messageObject) Sends a method object to the renderer.
   *    Message objects are compatible with the structured clone algorithm.
   */
  var messageChannel = Pender.BonsaiMessageChannel;
  var readFile = function(url, callback) {
    callback(Pender.readFile(url));
    // or whatever reads a file in Pender
  };
  var global = this;
  bootstrapPender(messageChannel, readFile, global);
});
