define([
  './tools'
], function(tools) {

  'use strict';

  var slice = [].slice,
      split = ''.split;

  function Listener(context, listener, times) {
    this.context = context;
    this.listener = listener;
    this.times = times || Infinity;
  }

  /**
   * Returns an name that won't collide with names on Object.prototype.
   *
   * This is a single function to give minifiers the opportunity to inline it.
   *
   * @param {string} name
   * @returns {string}
   */
  function typeName(name) {
    return ':' + name;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * This module contains mixin methods for handling events.
   *
   * @mixin
   * @name EventEmitter
   * @example
   *
   * // assign `EventEmitter` methods to `MyClass.prototype`
   * tools.mixin(MyClass.prototype, EventEmitter);
   */
  var EventEmitter = /** @lends EventEmitter */ {

    /**
     * Registers a single listener for the specified event type(s).
     * Listeners are executed with the `this` binding of the host object.
     *
     * @param {String} type The event type.
     * @param [context=null] The context to call the listener in.
     *  Defaults to the event emitter itself.
     * @param {Function} listener The function called when the event occurs.
     * @returns {Object} The host object.
     * @example
     *
     * // register a listener for an event type
     * object.addListener('blur', listener);
     *
     * // register a listener for multiple event types
     * object.addListener('blur focus', listener);
     */
    addListener: function(type, context, listener) {
      if (arguments.length === 2) {
        listener = context;
        context = null;
      }
      var isListenerInstance = listener instanceof Listener;

      var listenerType = typeof listener;
      if (listenerType != 'function' && listenerType != 'string' && !isListenerInstance) {
        throw TypeError('Expected function or string, instead got ' + listenerType + '.');
      }

      /*
        We actually support passing Listener instances to addListener, but only
        for internal use (at the moment only used by `once()`).
       */
      if (!isListenerInstance) {
        listener = new Listener(context, listener);
      }

      var events = this._events || (this._events = {}),
          index = -1,
          types = split.call(type, ' '),
          length = types.length;

      while (++index < length) {
        type = typeName(types[index]);
        (events[type] || (events[type] = [])).push(listener);
      }
      return this;
    },

    /**
     * Executes all registered listeners of the specified event type after
     * the current execution block completes (i.e. asynchronously)
     *
     * @param {String} type The event type.
     * @param {Mixed} [args1, ...] Any number of arguments to pass to the listener.
     * @returns {Object} The host object.
     */
    emitAsync: function(type) {
      var me = this, args = arguments;
      setTimeout(function() {
        me.emit.apply(me, args);
      }, 1);
    },

    /**
     * Executes all registered listeners of the specified event type.
     *
     * @param {String} type The event type.
     * @param {Mixed} [args1, ...] Any number of arguments to pass to the listener.
     * @returns {Object} The host object.
     */
    emit: function(type) {
      // find listeners
      var events = this._events;
      var listeners = events && events[typeName(type)];
      var numListeners = listeners && listeners.length;

      // exit early if no listeners
      if (!listeners || !numListeners) {
        return this;
      }

      /*
        `emit()` is optimized for good runtime, as it is called often.

        Copying arguments into an array gives reasonable performance in all, and
        excellent performance in some browsers:
          http://jsperf.com/emit-sliced-arguments-vs-switch

        The previously used switch-block optimization was dropped to avoid
        redundant code.
       */
      var i;
      var numArgs = arguments.length, args = Array(numArgs - 1);
      for (i = 1; i < numArgs; i += 1) {
        args[i - 1] = arguments[i];
      }

      // shallow clone `listeners` so executed listeners can't affect the current iteration
      var listenersToCall = Array(numListeners);
      for (i = 0; i < numListeners; i += 1) {
        listenersToCall[i] = listeners[i];
      }

      // call all listeners, remove listeners that have exhausted their number of calls
      var context, listener, listenerFunc, listenerTimes;
      for (i = 0; (listener = listenersToCall[i]); i += 1) {
        listener = listenersToCall[i];
        context = listener.context;
        listenerFunc = listener.listener;

        if (typeof listenerFunc === 'string') {
          listenerFunc = context[listenerFunc];
        }
        listenerFunc.apply(context || this, args);

        listenerTimes = listener.times -= 1;
        if (listenerTimes <= 0) {
          this.removeListener(type, context, listener.listener);
        }
      }

      return this;
    },

    /**
     * Returns an array of event listeners for a given type that can be
     * manipulated to add or remove listeners.
     *
     * @param {String} type The event type.
     * @returns {Array} The listeners array.
     */
    listeners: function(type) {
      var events = this._events || (this._events = {});
      type = typeName(type);
      return events[type] || (events[type] = []);
    },

    /**
     * Registers a listener that will only be executed one time.
     *
     * @param {String} type The event type.
     * @param [context=null] The context to call the listener in.
     *  Defaults to the event emitter itself.
     * @param {Function} listener The function called when the event occurs.
     * @returns {Object} The host object.
     */
    once: function(type, context, listener) {
      if (arguments.length === 2) {
        listener = context;
        context = null;
      }

      return this.addListener(type, new Listener(context, listener, 1));
    },

    /**
     * Unregisters a single listener for the specified event type(s).
     *
     * @param {String} type The event type.
     * @param [context=null] The context the listener was registered with.
     * @param {Function} listener The function to unregister.
     * @returns {Object} The host object.
     * @example
     *
     * // unregister a listener for an event type
     * object.removeListener('blur', listener);
     *
     * // unregister a listener for multiple event types
     * object.removeListener('blur focus', listener);
     */
    removeListener: function(type, context, listener) {
      if (arguments.length === 2) {
        listener = context;
        context = null;
      }

      var found,
          listenerObject,
          listenerIndex,
          listeners,
          events = this._events || {},
          typesIndex = -1,
          types = split.call(type, ' '),
          length = types.length;

      while (++typesIndex < length) {
        found = false;
        listeners = events[typeName(types[typesIndex])] || [];

        for (listenerIndex = 0; (listenerObject = listeners[listenerIndex]); listenerIndex += 1) {
          if (found) {
            listeners[listenerIndex - 1] = listenerObject;
          } else {
            found =
              listenerObject.listener === listener &&
              listenerObject.context === context;
          }
        }
        if (found) {
          listeners.length -= 1;
        }
      }
      return this;
    },

    /**
     * Unregisters all listeners or those for the specified event type(s).
     *
     * @param {String} [type] The event type. Unregisters all listeners if no
     *  event type is given.
     * @returns {Object} The host object.
     * @example
     *
     * // unregister all listeners
     * object.removeAllListeners();
     *
     * // unregister all listeners for an event type
     * object.removeAllListeners('click');
     *
     * // unregister all listeners for multiple event types
     * object.removeAllListeners('click mousedown touch');
     */
    removeAllListeners: function(type) {
      var events = this._events || {},
          extendNames = true,
          index = -1,
          types = type && split.call(type, ' ') ||
            ((extendNames = false), tools.keys(events)),
          length = types.length;

      while (++index < length) {
        (
          events[extendNames ? typeName(types[index]) : types[index]] || []
        ).length = 0;
      }
      return this;
    }
  };

  /**
   * An alias for `addListener`.
   *
   * @name on
   * @memberOf EventEmitter
   * @method
   * @param {String} type The event type.
   * @param {Function} listener The function called when the event occurs.
   * @returns {Object} The host object.
   */
  EventEmitter.on = EventEmitter.addListener;

  return EventEmitter;
});
