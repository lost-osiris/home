(function() {
  var async, minimatch;

  minimatch = null;

  async = null;

  module.exports = {
    run: function(logger, transport, path, targetPath, callback) {
      if (!minimatch) {
        minimatch = require("minimatch");
      }
      if (!async) {
        async = require("async");
      }
      logger.log("Downloading all files: " + path);
      return transport.fetchFileTree(path, function(err, files) {
        if (err) {
          return logger.error(err);
        }
        return async.mapSeries(files, function(file, callback) {
          return transport.download(file, targetPath, callback);
        }, function(err) {
          if (err) {
            return logger.error;
          }
          if (err) {
            return logger.error(err);
          }
          logger.log("Downloaded all files: " + path);
          return typeof callback === "function" ? callback() : void 0;
        });
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3JlbW90ZS1zeW5jL2xpYi9jb21tYW5kcy9Eb3dubG9hZEFsbENvbW1hbmQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxTQUFBLEdBQVk7O0VBQ1osS0FBQSxHQUFROztFQUdSLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxHQUFBLEVBQUksU0FBQyxNQUFELEVBQVMsU0FBVCxFQUFvQixJQUFwQixFQUEwQixVQUExQixFQUFzQyxRQUF0QztNQUNGLElBQW1DLENBQUksU0FBdkM7UUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLFdBQVIsRUFBWjs7TUFDQSxJQUEyQixDQUFJLEtBQS9CO1FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSLEVBQVI7O01BRUEsTUFBTSxDQUFDLEdBQVAsQ0FBVyx5QkFBQSxHQUEwQixJQUFyQzthQUVBLFNBQVMsQ0FBQyxhQUFWLENBQXdCLElBQXhCLEVBQThCLFNBQUMsR0FBRCxFQUFNLEtBQU47UUFDNUIsSUFBMkIsR0FBM0I7QUFBQSxpQkFBTyxNQUFNLENBQUMsS0FBUCxDQUFhLEdBQWIsRUFBUDs7ZUFFQSxLQUFLLENBQUMsU0FBTixDQUFnQixLQUFoQixFQUF1QixTQUFDLElBQUQsRUFBTyxRQUFQO2lCQUNyQixTQUFTLENBQUMsUUFBVixDQUFtQixJQUFuQixFQUF5QixVQUF6QixFQUFxQyxRQUFyQztRQURxQixDQUF2QixFQUVFLFNBQUMsR0FBRDtVQUNBLElBQXVCLEdBQXZCO0FBQUEsbUJBQU8sTUFBTSxDQUFDLE1BQWQ7O1VBQ0EsSUFBMkIsR0FBM0I7QUFBQSxtQkFBTyxNQUFNLENBQUMsS0FBUCxDQUFhLEdBQWIsRUFBUDs7VUFDQSxNQUFNLENBQUMsR0FBUCxDQUFXLHdCQUFBLEdBQXlCLElBQXBDO2tEQUNBO1FBSkEsQ0FGRjtNQUg0QixDQUE5QjtJQU5FLENBQUo7O0FBTEYiLCJzb3VyY2VzQ29udGVudCI6WyJtaW5pbWF0Y2ggPSBudWxsXG5hc3luYyA9IG51bGxcblxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIHJ1bjoobG9nZ2VyLCB0cmFuc3BvcnQsIHBhdGgsIHRhcmdldFBhdGgsIGNhbGxiYWNrKSAtPlxuICAgIG1pbmltYXRjaCA9IHJlcXVpcmUgXCJtaW5pbWF0Y2hcIiBpZiBub3QgbWluaW1hdGNoXG4gICAgYXN5bmMgPSByZXF1aXJlIFwiYXN5bmNcIiBpZiBub3QgYXN5bmNcblxuICAgIGxvZ2dlci5sb2cgXCJEb3dubG9hZGluZyBhbGwgZmlsZXM6ICN7cGF0aH1cIlxuXG4gICAgdHJhbnNwb3J0LmZldGNoRmlsZVRyZWUgcGF0aCwgKGVyciwgZmlsZXMpIC0+XG4gICAgICByZXR1cm4gbG9nZ2VyLmVycm9yIGVyciBpZiBlcnJcblxuICAgICAgYXN5bmMubWFwU2VyaWVzIGZpbGVzLCAoZmlsZSwgY2FsbGJhY2spIC0+XG4gICAgICAgIHRyYW5zcG9ydC5kb3dubG9hZCBmaWxlLCB0YXJnZXRQYXRoLCBjYWxsYmFja1xuICAgICAgLCAoZXJyKSAtPlxuICAgICAgICByZXR1cm4gbG9nZ2VyLmVycm9yIGlmIGVyclxuICAgICAgICByZXR1cm4gbG9nZ2VyLmVycm9yIGVyciBpZiBlcnJcbiAgICAgICAgbG9nZ2VyLmxvZyBcIkRvd25sb2FkZWQgYWxsIGZpbGVzOiAje3BhdGh9XCJcbiAgICAgICAgY2FsbGJhY2s/KClcbiJdfQ==
