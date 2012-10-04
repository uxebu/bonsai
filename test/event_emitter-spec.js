define([
  'bonsai/event_emitter',
  'bonsai/tools'
], function(EventEmitter, tools) {

  function comparableListener(context, listener, times) {
    if (arguments.length === 1) {
      listener = context;
      context = null;
    }
    return {context: context, listener: listener, times: times || Infinity};
  }

  describe('EventEmitter', function() {
    var TYPE = 'hello';
    var emitter = tools.mixin({}, EventEmitter);

    beforeEach(function() {
      delete emitter._events;
    });

    describe('addListener', function() {

      it('should have an "on" method that aliases its "addListener()" method',
        function() {
          expect(emitter.on).toBe(emitter.addListener);
        }
      );

      it('should add listeners when invoked', function() {
        emitter.addListener(TYPE, function() {});
        expect(emitter.listeners(TYPE).length).toBe(1);
      });

      it('should allow duplicate listeners', function() {
        function listener() {}
        emitter.addListener(TYPE, listener);
        emitter.addListener(TYPE, listener);
        expect(emitter.listeners(TYPE).length).toBe(2);
      });

      it('should allow duplicate listeners even when previously added with once()',
        function() {
          function listener() {}
          emitter.once(TYPE, listener);
          emitter.addListener(TYPE, listener);
          expect(emitter.listeners(TYPE).length).toBe(2);
        }
      );
    });

    describe('emit', function() {
      it('should call a simple listener in the context of the emitter', function() {
        function listener() {
          listener.context = this;
        }

        emitter.on(TYPE, listener);
        emitter.emit(TYPE);

        expect(listener.context).toBe(emitter);
      });

      it('should call a function in a context, if given', function() {
        var context = {};
        function listener() {
          listener.context = this;
        }

        emitter.on(TYPE, context, listener);
        emitter.emit(TYPE);

        expect(listener.context).toBe(context);
      });

      describe('listener is a string', function() {
        it('should resolve the method lazily on context ' +
          '(i.e. when the listener is executed, not when it\'s added)', function() {
          var context = {}, listenerName = 'arbitrary name';
          emitter.on(TYPE, context, listenerName);

          /*
           To check whether a method is resolved lazily, we're setting the
           listener function AFTER adding the listener to the event emitter.
          */
          context[listenerName] = jasmine.createSpy(listenerName);
          emitter.emit(TYPE);

          expect(context[listenerName]).toHaveBeenCalled();
        });

        it('should call the method in the correct context', function() {
          var context = {}, listenerName = 'arbitrary name';
          context[listenerName] = function listener() {
            listener.context = this;
          };

          emitter.on(TYPE, context, listenerName);
          emitter.emit(TYPE);

          expect(context[listenerName].context).toBe(context);
        });
      });

      it('should pass an argument to listeners', function() {
        function listener(a) {
          expect(a).toBe('a');
        }

        emitter.on(TYPE, listener);
        emitter.emit(TYPE, 'a');
      });

      it('should pass two argument to listeners', function() {
        function listener(a, b) {
          expect(a).toBe('a');
          expect(b).toBe(2);
        }

        emitter.on(TYPE, listener);
        emitter.emit(TYPE, 'a', 2);
      });

      it('should pass three arguments to listeners', function() {
        function listener(a, b, c) {
          expect(a).toBe('a');
          expect(b).toBe(2);
          expect(c).toBeNull();
        }

        emitter.on(TYPE, listener);
        emitter.emit(TYPE, 'a', 2, null);
      });

      it('should execute all listeners when the listeners array is modified during emit',
        function() {
          function a() {
            listenersCalled++;
            emitter.removeAllListeners(TYPE);
          }
          function b() {
            listenersCalled++;
            emitter.removeAllListeners(TYPE);
          }
          function c() {
            listenersCalled++;
            emitter.removeAllListeners(TYPE);
          }

          var listenersCalled = 0;

          emitter.on(TYPE, a);
          emitter.on(TYPE, b);
          emitter.on(TYPE, c);
          emitter.emit(TYPE);

          expect(listenersCalled).toBe(3);
        }
      );

      it('should call all callbacks', function() {
        var callbacks_called = [], e = emitter;

        function callback1() {
          callbacks_called.push('callback1');
          e.on('foo', callback2);
          e.on('foo', callback3);
          e.removeListener('foo', callback1);
        }

        function callback2() {
          callbacks_called.push('callback2');
          e.removeListener('foo', callback2);
        }

        function callback3() {
          callbacks_called.push('callback3');
          e.removeListener('foo', callback3);
        }

        e.on('foo', callback1);
        expect(e.listeners('foo').length).toBe(1);

        e.emit('foo');
        expect(e.listeners('foo').length).toBe(2);
        expect(callbacks_called).toEqual(['callback1']);

        e.emit('foo');
        expect(e.listeners('foo').length).toBe(0);
        expect(callbacks_called).toEqual(['callback1', 'callback2', 'callback3']);

        e.emit('foo');
        expect(e.listeners('foo').length).toBe(0);
        expect(callbacks_called).toEqual(['callback1', 'callback2', 'callback3']);

        e.on('foo', callback1);
        e.on('foo', callback2);
        expect(e.listeners('foo').length).toBe(2);
        e.removeAllListeners('foo');
        expect(e.listeners('foo').length).toBe(0);

        /*
          Verify that removing callbacks while in emit allows emits to
          propagate to all listeners
        */
        callbacks_called = [];

        e.on('foo', callback2);
        e.on('foo', callback3);
        expect(e.listeners('foo').length).toBe(2);

        e.emit('foo');
        expect(callbacks_called).toEqual(['callback2', 'callback3']);
        expect(e.listeners('foo').length).toBe(0);
      });

      it('should pass different numbers of arguments', function() {
        var e = emitter, num_args_emited = [];

        e.on('numArgs', function() {
          var numArgs = arguments.length;
          num_args_emited.push(numArgs);
        });

        e.emit('numArgs');
        e.emit('numArgs', null);
        e.emit('numArgs', null, null);
        e.emit('numArgs', null, null, null);
        e.emit('numArgs', null, null, null, null);
        e.emit('numArgs', null, null, null, null, null);

        expect(num_args_emited).toEqual([0, 1, 2, 3, 4, 5]);
      });
    });

    describe('once', function() {
      it('should invoke listeners added through `once()` only once',
        function() {
          var e = emitter, times_hello_emited = 0;

          e.once('hello', function(a, b) {
            times_hello_emited++;
          });

          e.emit('hello', 'a', 'b');
          e.emit('hello', 'a', 'b');
          e.emit('hello', 'a', 'b');
          e.emit('hello', 'a', 'b');

          expect(times_hello_emited).toBe(1);
        }
      );

      it('should not invoke a listener added through `once` and removed afterwards',
        function() {

          var remove = jasmine.createSpy('remove');

          var e = emitter;
          e.once('foo', remove);
          e.removeListener('foo', remove);
          e.emit('foo');

          expect(remove).not.toHaveBeenCalled();
        }
      );
    });

    describe('removeListener', function() {
      function listener1() {

      }
      function listener2() {

      }

      it('should remove registered listeners', function() {
        var e1 = emitter;
        e1.on('hello', listener1);
        e1.removeListener('hello', listener1);
        expect(e1.listeners('hello')).toEqual([]);
      });

      it('should not remove other listeners when removing an unregistered listener',
        function() {
          var e2 = emitter;
          e2.on('hello', listener1);
          e2.removeListener('hello', listener2);
          expect(e2.listeners('hello')).toEqual([comparableListener(listener1)]);
        }
      );

      it('should not remove other listeners when removing a registered listener',
        function() {
          var e3 = emitter;
          e3.on('hello', listener1);
          e3.on('hello', listener2);
          e3.removeListener('hello', listener1);
          expect(e3.listeners('hello')).toEqual([comparableListener(listener2)]);
        }
      );
    });

    describe('removeAllListeners', function() {
      function listener() {}

      it('should only remove listeners for one event type when called with parameter',
        function() {
          var e1 = emitter;
          e1.on('foo', listener);
          e1.on('bar', listener);
          e1.removeAllListeners('foo');
          expect(e1.listeners('foo')).toEqual([]);
          expect(e1.listeners('bar')).toEqual([comparableListener(listener)]);
        }
      );

      it('should remove all listeners without parameter',
        function() {
          var e1 = emitter;
          e1.on('foo', listener);
          e1.on('bar', listener);
          e1.removeAllListeners();
          expect(e1.listeners('foo')).toEqual([]);
          expect(e1.listeners('bar')).toEqual([]);
        }
      );
    });
  });
});
