"use babel";
// Borrowed from Atom core's spec.

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.beforeEach = beforeEach;
exports.afterEach = afterEach;

var conditionPromise = _asyncToGenerator(function* (condition) {
  var startTime = Date.now();

  while (true) {
    yield timeoutPromise(100);

    if (yield condition()) {
      return;
    }

    if (Date.now() - startTime > 5000) {
      throw new Error("Timed out waiting on condition");
    }
  }
});

exports.conditionPromise = conditionPromise;
exports.timeoutPromise = timeoutPromise;
exports.emitterEventPromise = emitterEventPromise;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function beforeEach(fn) {
  global.beforeEach(function () {
    var result = fn();
    if (result instanceof Promise) {
      waitsForPromise(function () {
        return result;
      });
    }
  });
}

function afterEach(fn) {
  global.afterEach(function () {
    var result = fn();
    if (result instanceof Promise) {
      waitsForPromise(function () {
        return result;
      });
    }
  });
}

;["it", "fit", "ffit", "fffit"].forEach(function (name) {
  module.exports[name] = function (description, fn) {
    global[name](description, function () {
      var result = fn();
      if (result instanceof Promise) {
        waitsForPromise(function () {
          return result;
        });
      }
    });
  };
});

function timeoutPromise(timeout) {
  return new Promise(function (resolve) {
    global.setTimeout(resolve, timeout);
  });
}

function waitsForPromise(fn) {
  var promise = fn();
  global.waitsFor("spec promise to resolve", function (done) {
    promise.then(done, function (error) {
      jasmine.getEnv().currentSpec.fail(error);
      done();
    });
  });
}

function emitterEventPromise(emitter, event) {
  var timeout = arguments.length <= 2 || arguments[2] === undefined ? 15000 : arguments[2];

  return new Promise(function (resolve, reject) {
    var timeoutHandle = setTimeout(function () {
      reject(new Error("Timed out waiting for '" + event + "' event"));
    }, timeout);
    emitter.once(event, function () {
      clearTimeout(timeoutHandle);
      resolve();
    });
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvYXN5bmMtc3BlYy1oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7O0lBZ0NXLGdCQUFnQixxQkFBL0IsV0FBZ0MsU0FBUyxFQUFFO0FBQ2hELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTs7QUFFNUIsU0FBTyxJQUFJLEVBQUU7QUFDWCxVQUFNLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFekIsUUFBSSxNQUFNLFNBQVMsRUFBRSxFQUFFO0FBQ3JCLGFBQU07S0FDUDs7QUFFRCxRQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLEdBQUcsSUFBSSxFQUFFO0FBQ2pDLFlBQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQTtLQUNsRDtHQUNGO0NBQ0Y7Ozs7Ozs7O0FBM0NNLFNBQVMsVUFBVSxDQUFDLEVBQUUsRUFBRTtBQUM3QixRQUFNLENBQUMsVUFBVSxDQUFDLFlBQVc7QUFDM0IsUUFBTSxNQUFNLEdBQUcsRUFBRSxFQUFFLENBQUE7QUFDbkIsUUFBSSxNQUFNLFlBQVksT0FBTyxFQUFFO0FBQzdCLHFCQUFlLENBQUM7ZUFBTSxNQUFNO09BQUEsQ0FBQyxDQUFBO0tBQzlCO0dBQ0YsQ0FBQyxDQUFBO0NBQ0g7O0FBRU0sU0FBUyxTQUFTLENBQUMsRUFBRSxFQUFFO0FBQzVCLFFBQU0sQ0FBQyxTQUFTLENBQUMsWUFBVztBQUMxQixRQUFNLE1BQU0sR0FBRyxFQUFFLEVBQUUsQ0FBQTtBQUNuQixRQUFJLE1BQU0sWUFBWSxPQUFPLEVBQUU7QUFDN0IscUJBQWUsQ0FBQztlQUFNLE1BQU07T0FBQSxDQUFDLENBQUE7S0FDOUI7R0FDRixDQUFDLENBQUE7Q0FDSDs7QUFFRCxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVMsSUFBSSxFQUFFO0FBQ3JELFFBQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBUyxXQUFXLEVBQUUsRUFBRSxFQUFFO0FBQy9DLFVBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsWUFBVztBQUNuQyxVQUFNLE1BQU0sR0FBRyxFQUFFLEVBQUUsQ0FBQTtBQUNuQixVQUFJLE1BQU0sWUFBWSxPQUFPLEVBQUU7QUFDN0IsdUJBQWUsQ0FBQztpQkFBTSxNQUFNO1NBQUEsQ0FBQyxDQUFBO09BQzlCO0tBQ0YsQ0FBQyxDQUFBO0dBQ0gsQ0FBQTtDQUNGLENBQUMsQ0FBQTs7QUFrQkssU0FBUyxjQUFjLENBQUMsT0FBTyxFQUFFO0FBQ3RDLFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBUyxPQUFPLEVBQUU7QUFDbkMsVUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUE7R0FDcEMsQ0FBQyxDQUFBO0NBQ0g7O0FBRUQsU0FBUyxlQUFlLENBQUMsRUFBRSxFQUFFO0FBQzNCLE1BQU0sT0FBTyxHQUFHLEVBQUUsRUFBRSxDQUFBO0FBQ3BCLFFBQU0sQ0FBQyxRQUFRLENBQUMseUJBQXlCLEVBQUUsVUFBUyxJQUFJLEVBQUU7QUFDeEQsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBUyxLQUFLLEVBQUU7QUFDakMsYUFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDeEMsVUFBSSxFQUFFLENBQUE7S0FDUCxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSDs7QUFFTSxTQUFTLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQW1CO01BQWpCLE9BQU8seURBQUcsS0FBSzs7QUFDakUsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdEMsUUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLFlBQU07QUFDckMsWUFBTSxDQUFDLElBQUksS0FBSyw2QkFBMkIsS0FBSyxhQUFVLENBQUMsQ0FBQTtLQUM1RCxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQ1gsV0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsWUFBTTtBQUN4QixrQkFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQzNCLGFBQU8sRUFBRSxDQUFBO0tBQ1YsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0giLCJmaWxlIjoiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9hc3luYy1zcGVjLWhlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG4vLyBCb3Jyb3dlZCBmcm9tIEF0b20gY29yZSdzIHNwZWMuXG5cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVFYWNoKGZuKSB7XG4gIGdsb2JhbC5iZWZvcmVFYWNoKGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGZuKClcbiAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHJlc3VsdClcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZnRlckVhY2goZm4pIHtcbiAgZ2xvYmFsLmFmdGVyRWFjaChmdW5jdGlvbigpIHtcbiAgICBjb25zdCByZXN1bHQgPSBmbigpXG4gICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiByZXN1bHQpXG4gICAgfVxuICB9KVxufVxuXG47W1wiaXRcIiwgXCJmaXRcIiwgXCJmZml0XCIsIFwiZmZmaXRcIl0uZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gIG1vZHVsZS5leHBvcnRzW25hbWVdID0gZnVuY3Rpb24oZGVzY3JpcHRpb24sIGZuKSB7XG4gICAgZ2xvYmFsW25hbWVdKGRlc2NyaXB0aW9uLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGZuKClcbiAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiByZXN1bHQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufSlcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbmRpdGlvblByb21pc2UoY29uZGl0aW9uKSB7XG4gIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KClcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIGF3YWl0IHRpbWVvdXRQcm9taXNlKDEwMClcblxuICAgIGlmIChhd2FpdCBjb25kaXRpb24oKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKERhdGUubm93KCkgLSBzdGFydFRpbWUgPiA1MDAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaW1lZCBvdXQgd2FpdGluZyBvbiBjb25kaXRpb25cIilcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVvdXRQcm9taXNlKHRpbWVvdXQpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICBnbG9iYWwuc2V0VGltZW91dChyZXNvbHZlLCB0aW1lb3V0KVxuICB9KVxufVxuXG5mdW5jdGlvbiB3YWl0c0ZvclByb21pc2UoZm4pIHtcbiAgY29uc3QgcHJvbWlzZSA9IGZuKClcbiAgZ2xvYmFsLndhaXRzRm9yKFwic3BlYyBwcm9taXNlIHRvIHJlc29sdmVcIiwgZnVuY3Rpb24oZG9uZSkge1xuICAgIHByb21pc2UudGhlbihkb25lLCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgamFzbWluZS5nZXRFbnYoKS5jdXJyZW50U3BlYy5mYWlsKGVycm9yKVxuICAgICAgZG9uZSgpXG4gICAgfSlcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVtaXR0ZXJFdmVudFByb21pc2UoZW1pdHRlciwgZXZlbnQsIHRpbWVvdXQgPSAxNTAwMCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHRpbWVvdXRIYW5kbGUgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoYFRpbWVkIG91dCB3YWl0aW5nIGZvciAnJHtldmVudH0nIGV2ZW50YCkpXG4gICAgfSwgdGltZW91dClcbiAgICBlbWl0dGVyLm9uY2UoZXZlbnQsICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SGFuZGxlKVxuICAgICAgcmVzb2x2ZSgpXG4gICAgfSlcbiAgfSlcbn1cbiJdfQ==