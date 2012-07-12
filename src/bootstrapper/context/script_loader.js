/**
 * Script loader provides load, wait and done methods designed to be used
 * and exposed by the various runner contexts [iframe, worker]
 */
define(function() {
  'use strict';
  /**
   * Makes a scriptLoader module
   * @param {Function} loadFn Function which loads the passed URL and calls the
   *                          passed callback upon completion. `loadFn` will be
   *                          called like `loadFn(scriptUrl, callbackFn)`
   */
  return function(loadFn) {
    return {
      isLoading: false,
      isWaiting: 0,
      waitingCallbacks: [],
      queue: [],

      load: function(url, cb) {

        var me = this,
            queue = this.queue,
            waitingCallbacks = this.waitingCallbacks;

        if (this.isLoading || this.isWaiting) {
          // Do it later:
          queue.push([url, cb]);
        } else {

          this.isLoading = true;

          loadFn(url, function(err) {
            if (err) {
              cb(err);
              return;
            }
            if (cb) {
              if (me.isWaiting) {
                // If we're waiting then we shouldn't fire the cb until
                // done() has been called.
                waitingCallbacks.push(cb);
              } else {
                cb(null);
              }
            }
            me.isLoading = false;
            if (queue.length) {
              me.load.apply(me, queue.shift());
            }
          });

        }
      },
      wait: function() {
        this.isWaiting++;
      },
      done: function() {
        this.isWaiting--;
        if (!this.isWaiting) {
          // Call any queued callbacks:
          for (var i = 0, l = this.waitingCallbacks.length; i < l; ++i) {
            this.waitingCallbacks[i](null);
          }
        }
        if (this.queue.length) {
          this.load.apply(this, this.queue.shift());
        }
      }
    };
  };
});
