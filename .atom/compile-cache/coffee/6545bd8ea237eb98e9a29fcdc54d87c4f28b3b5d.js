(function() {
  module.exports = function(projectPath) {
    var babel, babelCoreUsed, callback, path, projectBabelCore;
    path = require('path');
    callback = this.async();
    process.chdir(projectPath);
    projectBabelCore = path.normalize(path.join(projectPath, '/node_modules/babel-core'));
    try {
      babel = require(projectBabelCore);
    } catch (error) {
      projectBabelCore = '../node_modules/babel-core';
      babel = require(projectBabelCore);
    }
    babelCoreUsed = "Using babel-core at\n" + (require.resolve(projectBabelCore));
    return process.on('message', function(mObj) {
      var err, msgRet;
      if (mObj.command === 'transpile') {
        try {
          babel.transformFile(mObj.pathTo.sourceFile, mObj.babelOptions, (function(_this) {
            return function(err, result) {
              var msgRet;
              msgRet = {};
              msgRet.reqId = mObj.reqId;
              if (err) {
                msgRet.err = {};
                if (err.loc) {
                  msgRet.err.loc = err.loc;
                }
                if (err.codeFrame) {
                  msgRet.err.codeFrame = err.codeFrame;
                } else {
                  msgRet.err.codeFrame = "";
                }
                msgRet.err.message = err.message;
              }
              if (result) {
                msgRet.result = result;
                msgRet.result.ast = null;
              }
              msgRet.babelVersion = babel.version;
              msgRet.babelCoreUsed = babelCoreUsed;
              emit("transpile:" + mObj.reqId, msgRet);
              if (!mObj.pathTo.sourceFileInProject) {
                return callback();
              }
            };
          })(this));
        } catch (error) {
          err = error;
          msgRet = {};
          msgRet.reqId = mObj.reqId;
          msgRet.err = {};
          msgRet.err.message = err.message;
          msgRet.err.stack = err.stack;
          msgRet.babelCoreUsed = babelCoreUsed;
          emit("transpile:" + mObj.reqId, msgRet);
          callback();
        }
      }
      if (mObj.command === 'transpileCode') {
        try {
          msgRet = babel.transform(mObj.code, mObj.babelOptions);
          msgRet.babelVersion = babel.version;
          msgRet.babelCoreUsed = babelCoreUsed;
          emit("transpile:" + mObj.reqId, msgRet);
          if (!mObj.pathTo.sourceFileInProject) {
            callback();
          }
        } catch (error) {
          err = error;
          msgRet = {};
          msgRet.reqId = mObj.reqId;
          msgRet.err = {};
          msgRet.err.message = err.message;
          msgRet.err.stack = err.stack;
          msgRet.babelVersion = babel.version;
          msgRet.babelCoreUsed = babelCoreUsed;
          emit("transpile:" + mObj.reqId, msgRet);
          callback();
        }
      }
      if (mObj.command === 'stop') {
        return callback();
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWJhYmVsL2xpYi90cmFuc3BpbGVyLXRhc2suY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxXQUFEO0FBQ2YsUUFBQTtJQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjtJQUNQLFFBQUEsR0FBVyxJQUFDLENBQUEsS0FBRCxDQUFBO0lBQ1gsT0FBTyxDQUFDLEtBQVIsQ0FBYyxXQUFkO0lBRUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLFNBQUwsQ0FBZ0IsSUFBSSxDQUFDLElBQUwsQ0FBVyxXQUFYLEVBQXdCLDBCQUF4QixDQUFoQjtBQUNuQjtNQUNFLEtBQUEsR0FBUSxPQUFBLENBQVEsZ0JBQVIsRUFEVjtLQUFBLGFBQUE7TUFJRSxnQkFBQSxHQUFtQjtNQUNuQixLQUFBLEdBQVEsT0FBQSxDQUFRLGdCQUFSLEVBTFY7O0lBT0EsYUFBQSxHQUFnQix1QkFBQSxHQUF1QixDQUFDLE9BQU8sQ0FBQyxPQUFSLENBQWdCLGdCQUFoQixDQUFEO1dBRXZDLE9BQU8sQ0FBQyxFQUFSLENBQVcsU0FBWCxFQUFzQixTQUFDLElBQUQ7QUFDcEIsVUFBQTtNQUFBLElBQUcsSUFBSSxDQUFDLE9BQUwsS0FBZ0IsV0FBbkI7QUFDRTtVQUNFLEtBQUssQ0FBQyxhQUFOLENBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBaEMsRUFBNEMsSUFBSSxDQUFDLFlBQWpELEVBQStELENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsR0FBRCxFQUFLLE1BQUw7QUFFN0Qsa0JBQUE7Y0FBQSxNQUFBLEdBQVM7Y0FDVCxNQUFNLENBQUMsS0FBUCxHQUFlLElBQUksQ0FBQztjQUNwQixJQUFHLEdBQUg7Z0JBQ0UsTUFBTSxDQUFDLEdBQVAsR0FBYTtnQkFDYixJQUFHLEdBQUcsQ0FBQyxHQUFQO2tCQUFnQixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQVgsR0FBaUIsR0FBRyxDQUFDLElBQXJDOztnQkFDQSxJQUFHLEdBQUcsQ0FBQyxTQUFQO2tCQUNFLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBWCxHQUF1QixHQUFHLENBQUMsVUFEN0I7aUJBQUEsTUFBQTtrQkFFSyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVgsR0FBdUIsR0FGNUI7O2dCQUdBLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBWCxHQUFxQixHQUFHLENBQUMsUUFOM0I7O2NBT0EsSUFBRyxNQUFIO2dCQUNFLE1BQU0sQ0FBQyxNQUFQLEdBQWdCO2dCQUNoQixNQUFNLENBQUMsTUFBTSxDQUFDLEdBQWQsR0FBb0IsS0FGdEI7O2NBR0EsTUFBTSxDQUFDLFlBQVAsR0FBc0IsS0FBSyxDQUFDO2NBQzVCLE1BQU0sQ0FBQyxhQUFQLEdBQXVCO2NBQ3ZCLElBQUEsQ0FBSyxZQUFBLEdBQWEsSUFBSSxDQUFDLEtBQXZCLEVBQWdDLE1BQWhDO2NBR0EsSUFBRyxDQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW5CO3VCQUNFLFFBQUEsQ0FBQSxFQURGOztZQW5CNkQ7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9ELEVBREY7U0FBQSxhQUFBO1VBc0JNO1VBQ0osTUFBQSxHQUFTO1VBQ1QsTUFBTSxDQUFDLEtBQVAsR0FBZSxJQUFJLENBQUM7VUFDcEIsTUFBTSxDQUFDLEdBQVAsR0FBYTtVQUNiLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBWCxHQUFxQixHQUFHLENBQUM7VUFDekIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFYLEdBQW1CLEdBQUcsQ0FBQztVQUN2QixNQUFNLENBQUMsYUFBUCxHQUF1QjtVQUN2QixJQUFBLENBQUssWUFBQSxHQUFhLElBQUksQ0FBQyxLQUF2QixFQUFnQyxNQUFoQztVQUNBLFFBQUEsQ0FBQSxFQTlCRjtTQURGOztNQWtDQSxJQUFHLElBQUksQ0FBQyxPQUFMLEtBQWdCLGVBQW5CO0FBQ0U7VUFDRSxNQUFBLEdBQVMsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsSUFBSSxDQUFDLElBQXJCLEVBQTJCLElBQUksQ0FBQyxZQUFoQztVQUVULE1BQU0sQ0FBQyxZQUFQLEdBQXNCLEtBQUssQ0FBQztVQUM1QixNQUFNLENBQUMsYUFBUCxHQUF1QjtVQUN2QixJQUFBLENBQUssWUFBQSxHQUFhLElBQUksQ0FBQyxLQUF2QixFQUFnQyxNQUFoQztVQUdBLElBQUcsQ0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFuQjtZQUNFLFFBQUEsQ0FBQSxFQURGO1dBUkY7U0FBQSxhQUFBO1VBVU07VUFDSixNQUFBLEdBQVM7VUFDVCxNQUFNLENBQUMsS0FBUCxHQUFlLElBQUksQ0FBQztVQUNwQixNQUFNLENBQUMsR0FBUCxHQUFhO1VBQ2IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFYLEdBQXFCLEdBQUcsQ0FBQztVQUN6QixNQUFNLENBQUMsR0FBRyxDQUFDLEtBQVgsR0FBbUIsR0FBRyxDQUFDO1VBQ3ZCLE1BQU0sQ0FBQyxZQUFQLEdBQXNCLEtBQUssQ0FBQztVQUM1QixNQUFNLENBQUMsYUFBUCxHQUF1QjtVQUN2QixJQUFBLENBQUssWUFBQSxHQUFhLElBQUksQ0FBQyxLQUF2QixFQUFnQyxNQUFoQztVQUNBLFFBQUEsQ0FBQSxFQW5CRjtTQURGOztNQXVCQSxJQUFHLElBQUksQ0FBQyxPQUFMLEtBQWdCLE1BQW5CO2VBQ0UsUUFBQSxDQUFBLEVBREY7O0lBMURvQixDQUF0QjtFQWZlO0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiIyBsYW5ndWFnZS1iYWJlbCB0cmFuc3BpbGVzIHJ1biBoZXJlLlxuIyBUaGlzIHJ1bnMgYXMgYSBzZXBhcmF0ZSB0YXNrIHNvIHRoYXQgdHJhbnNwaWxlcyBjYW4gaGF2ZSB0aGVpciBvd24gZW52aXJvbm1lbnQuXG5tb2R1bGUuZXhwb3J0cyA9IChwcm9qZWN0UGF0aCkgLT5cbiAgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG4gIGNhbGxiYWNrID0gQGFzeW5jKCkgI2FzeW5jIHRhc2tcbiAgcHJvY2Vzcy5jaGRpcihwcm9qZWN0UGF0aClcbiAgIyByZXF1aXJlIGJhYmVsLWNvcmUgcGFja2FnZSBmb3IgdGhpcyBwcm9qZWN0XG4gIHByb2plY3RCYWJlbENvcmUgPSBwYXRoLm5vcm1hbGl6ZSggcGF0aC5qb2luKCBwcm9qZWN0UGF0aCwgJy9ub2RlX21vZHVsZXMvYmFiZWwtY29yZScpKVxuICB0cnlcbiAgICBiYWJlbCA9IHJlcXVpcmUgcHJvamVjdEJhYmVsQ29yZVxuICBjYXRjaFxuICAgICMgYmFiZWwgY29yZSB2ZXJzaW9uIG5vdCBmb3VuZCByZXZlcnQgdG8gdGhlIGdsb2JhbFxuICAgIHByb2plY3RCYWJlbENvcmUgPSAnLi4vbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUnXG4gICAgYmFiZWwgPSByZXF1aXJlIHByb2plY3RCYWJlbENvcmVcblxuICBiYWJlbENvcmVVc2VkID0gXCJVc2luZyBiYWJlbC1jb3JlIGF0XFxuI3tyZXF1aXJlLnJlc29sdmUgcHJvamVjdEJhYmVsQ29yZX1cIlxuXG4gIHByb2Nlc3Mub24gJ21lc3NhZ2UnLCAobU9iaikgLT5cbiAgICBpZiBtT2JqLmNvbW1hbmQgaXMgJ3RyYW5zcGlsZSdcbiAgICAgIHRyeVxuICAgICAgICBiYWJlbC50cmFuc2Zvcm1GaWxlIG1PYmoucGF0aFRvLnNvdXJjZUZpbGUsIG1PYmouYmFiZWxPcHRpb25zLCAoZXJyLHJlc3VsdCkgPT5cbiAgICAgICAgICAjIGZpZGRseSBmb3JtYXRpbmcgYSByZXR1cm5cbiAgICAgICAgICBtc2dSZXQgPSB7fVxuICAgICAgICAgIG1zZ1JldC5yZXFJZCA9IG1PYmoucmVxSWQgIyBzZW5kIGJhY2sgdG8gcmVxSWRcbiAgICAgICAgICBpZiBlcnJcbiAgICAgICAgICAgIG1zZ1JldC5lcnIgPSB7fVxuICAgICAgICAgICAgaWYgZXJyLmxvYyB0aGVuIG1zZ1JldC5lcnIubG9jID0gZXJyLmxvY1xuICAgICAgICAgICAgaWYgZXJyLmNvZGVGcmFtZVxuICAgICAgICAgICAgICBtc2dSZXQuZXJyLmNvZGVGcmFtZSA9IGVyci5jb2RlRnJhbWVcbiAgICAgICAgICAgIGVsc2UgbXNnUmV0LmVyci5jb2RlRnJhbWUgPSBcIlwiXG4gICAgICAgICAgICBtc2dSZXQuZXJyLm1lc3NhZ2UgPSBlcnIubWVzc2FnZVxuICAgICAgICAgIGlmIHJlc3VsdFxuICAgICAgICAgICAgbXNnUmV0LnJlc3VsdCA9IHJlc3VsdFxuICAgICAgICAgICAgbXNnUmV0LnJlc3VsdC5hc3QgPSBudWxsOyAjIGFzdCBzZWVtcyB0byBjcmVhdGUgYSBKU09OIGNpcmN1bGFyIHJlZiBvbiBlbWl0XG4gICAgICAgICAgbXNnUmV0LmJhYmVsVmVyc2lvbiA9IGJhYmVsLnZlcnNpb25cbiAgICAgICAgICBtc2dSZXQuYmFiZWxDb3JlVXNlZCA9IGJhYmVsQ29yZVVzZWRcbiAgICAgICAgICBlbWl0IFwidHJhbnNwaWxlOiN7bU9iai5yZXFJZH1cIiwgbXNnUmV0XG4gICAgICAgICAgIyBpZiB0aGlzIGZpbGUgdHJhbnNwaWxhdGlvbiBpc24ndCBpbiBhIEF0b20gcHJvamVjdCBmb2xkZXIgdGhlbiB0ZXJtIHRoaXMgdGFza1xuICAgICAgICAgICMgYXMgdGhpcyBpcyBub3JtYWxseSBhbiBBZC1ob2MgZmlsZSB0cmFuc3BpbGUuXG4gICAgICAgICAgaWYgbm90IG1PYmoucGF0aFRvLnNvdXJjZUZpbGVJblByb2plY3RcbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgIGNhdGNoIGVyclxuICAgICAgICBtc2dSZXQgPSB7fVxuICAgICAgICBtc2dSZXQucmVxSWQgPSBtT2JqLnJlcUlkICMgc2VuZCBiYWNrIHRvIHJlcUlkXG4gICAgICAgIG1zZ1JldC5lcnIgPSB7fVxuICAgICAgICBtc2dSZXQuZXJyLm1lc3NhZ2UgPSBlcnIubWVzc2FnZVxuICAgICAgICBtc2dSZXQuZXJyLnN0YWNrID0gZXJyLnN0YWNrXG4gICAgICAgIG1zZ1JldC5iYWJlbENvcmVVc2VkID0gYmFiZWxDb3JlVXNlZFxuICAgICAgICBlbWl0IFwidHJhbnNwaWxlOiN7bU9iai5yZXFJZH1cIiwgbXNnUmV0XG4gICAgICAgIGNhbGxiYWNrKClcblxuICAgICMgdXNlZCBmb3IgcHJldmlld1xuICAgIGlmIG1PYmouY29tbWFuZCBpcyAndHJhbnNwaWxlQ29kZSdcbiAgICAgIHRyeVxuICAgICAgICBtc2dSZXQgPSBiYWJlbC50cmFuc2Zvcm0gbU9iai5jb2RlLCBtT2JqLmJhYmVsT3B0aW9uc1xuICAgICAgICAjIGZpZGRseSBmb3JtYXRpbmcgYSByZXR1cm5cbiAgICAgICAgbXNnUmV0LmJhYmVsVmVyc2lvbiA9IGJhYmVsLnZlcnNpb25cbiAgICAgICAgbXNnUmV0LmJhYmVsQ29yZVVzZWQgPSBiYWJlbENvcmVVc2VkXG4gICAgICAgIGVtaXQgXCJ0cmFuc3BpbGU6I3ttT2JqLnJlcUlkfVwiLCBtc2dSZXRcbiAgICAgICAgIyBpZiB0aGlzIGZpbGUgdHJhbnNwaWxhdGlvbiBpc24ndCBpbiBhIEF0b20gcHJvamVjdCBmb2xkZXIgdGhlbiB0ZXJtIHRoaXMgdGFza1xuICAgICAgICAjIGFzIHRoaXMgaXMgbm9ybWFsbHkgYW4gQWQtaG9jIGZpbGUgdHJhbnNwaWxlLlxuICAgICAgICBpZiBub3QgbU9iai5wYXRoVG8uc291cmNlRmlsZUluUHJvamVjdFxuICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgIGNhdGNoIGVyclxuICAgICAgICBtc2dSZXQgPSB7fVxuICAgICAgICBtc2dSZXQucmVxSWQgPSBtT2JqLnJlcUlkICMgc2VuZCBiYWNrIHRvIHJlcUlkXG4gICAgICAgIG1zZ1JldC5lcnIgPSB7fVxuICAgICAgICBtc2dSZXQuZXJyLm1lc3NhZ2UgPSBlcnIubWVzc2FnZVxuICAgICAgICBtc2dSZXQuZXJyLnN0YWNrID0gZXJyLnN0YWNrXG4gICAgICAgIG1zZ1JldC5iYWJlbFZlcnNpb24gPSBiYWJlbC52ZXJzaW9uXG4gICAgICAgIG1zZ1JldC5iYWJlbENvcmVVc2VkID0gYmFiZWxDb3JlVXNlZFxuICAgICAgICBlbWl0IFwidHJhbnNwaWxlOiN7bU9iai5yZXFJZH1cIiwgbXNnUmV0XG4gICAgICAgIGNhbGxiYWNrKClcblxuICAgICNzdG9wIGlzc3VlZCBzdG9wIHByb2Nlc3NcbiAgICBpZiBtT2JqLmNvbW1hbmQgaXMgJ3N0b3AnXG4gICAgICBjYWxsYmFjaygpXG4iXX0=
