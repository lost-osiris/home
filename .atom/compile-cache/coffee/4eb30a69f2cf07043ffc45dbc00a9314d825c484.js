(function() {
  var EventEmitter, Host, fs;

  fs = require('fs-plus');

  EventEmitter = require("events").EventEmitter;

  module.exports = Host = (function() {
    function Host(configPath1, emitter1) {
      var data, err, k, settings, v;
      this.configPath = configPath1;
      this.emitter = emitter1;
      if (!fs.existsSync(this.configPath)) {
        return;
      }
      try {
        data = fs.readFileSync(this.configPath, "utf8");
        settings = JSON.parse(data);
        for (k in settings) {
          v = settings[k];
          this[k] = v;
        }
      } catch (error) {
        err = error;
        console.log("load " + this.configPath + ", " + err);
      }
      if (this.port == null) {
        this.port = "";
      }
      this.port = this.port.toString();
      if (this.ignore) {
        this.ignore = this.ignore.join(", ");
      }
      if (this.watch) {
        this.watch = this.watch.join(", ");
      }
    }

    Host.prototype.saveJSON = function() {
      var configPath, emitter, val;
      configPath = this.configPath;
      emitter = this.emitter;
      this.configPath = void 0;
      this.emitter = void 0;
      if (this.ignore == null) {
        this.ignore = ".remote-sync.json,.git/**";
      }
      this.ignore = this.ignore.split(',');
      this.ignore = (function() {
        var i, len, ref, results;
        ref = this.ignore;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          val = ref[i];
          if (val) {
            results.push(val.trim());
          }
        }
        return results;
      }).call(this);
      if (this.watch == null) {
        this.watch = "";
      }
      this.watch = this.watch.split(',');
      this.watch = (function() {
        var i, len, ref, results;
        ref = this.watch;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          val = ref[i];
          if (val) {
            results.push(val.trim());
          }
        }
        return results;
      }).call(this);
      if (this.transport == null) {
        this.transport = "scp";
      }
      return fs.writeFile(configPath, JSON.stringify(this, null, 2), function(err) {
        if (err) {
          return console.log("Failed saving file " + configPath);
        } else {
          return emitter.emit('configured');
        }
      });
    };

    return Host;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3JlbW90ZS1zeW5jL2xpYi9tb2RlbC9ob3N0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLFlBQUEsR0FBZSxPQUFBLENBQVEsUUFBUixDQUFpQixDQUFDOztFQUVqQyxNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MsY0FBQyxXQUFELEVBQWMsUUFBZDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsYUFBRDtNQUFhLElBQUMsQ0FBQSxVQUFEO01BQ3pCLElBQVUsQ0FBQyxFQUFFLENBQUMsVUFBSCxDQUFjLElBQUMsQ0FBQSxVQUFmLENBQVg7QUFBQSxlQUFBOztBQUNBO1FBQ0UsSUFBQSxHQUFPLEVBQUUsQ0FBQyxZQUFILENBQWdCLElBQUMsQ0FBQSxVQUFqQixFQUE2QixNQUE3QjtRQUNQLFFBQUEsR0FBVyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVg7QUFDWCxhQUFBLGFBQUE7O1VBQ0UsSUFBSyxDQUFBLENBQUEsQ0FBTCxHQUFVO0FBRFosU0FIRjtPQUFBLGFBQUE7UUFLTTtRQUNKLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBQSxHQUFRLElBQUMsQ0FBQSxVQUFULEdBQW9CLElBQXBCLEdBQXdCLEdBQXBDLEVBTkY7OztRQVFBLElBQUMsQ0FBQSxPQUFPOztNQUNSLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFOLENBQUE7TUFDUixJQUFnQyxJQUFDLENBQUEsTUFBakM7UUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLElBQWIsRUFBVjs7TUFDQSxJQUErQixJQUFDLENBQUEsS0FBaEM7UUFBQSxJQUFDLENBQUEsS0FBRCxHQUFVLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLElBQVosRUFBVjs7SUFiVzs7bUJBZWIsUUFBQSxHQUFVLFNBQUE7QUFDUixVQUFBO01BQUEsVUFBQSxHQUFhLElBQUMsQ0FBQTtNQUNkLE9BQUEsR0FBVSxJQUFDLENBQUE7TUFFWCxJQUFDLENBQUEsVUFBRCxHQUFjO01BQ2QsSUFBQyxDQUFBLE9BQUQsR0FBVzs7UUFFWCxJQUFDLENBQUEsU0FBUzs7TUFDVixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFjLEdBQWQ7TUFDVixJQUFDLENBQUEsTUFBRDs7QUFBVztBQUFBO2FBQUEscUNBQUE7O2NBQW1DO3lCQUFuQyxHQUFHLENBQUMsSUFBSixDQUFBOztBQUFBOzs7O1FBRVgsSUFBQyxDQUFBLFFBQVU7O01BQ1gsSUFBQyxDQUFBLEtBQUQsR0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBYSxHQUFiO01BQ1gsSUFBQyxDQUFBLEtBQUQ7O0FBQVk7QUFBQTthQUFBLHFDQUFBOztjQUFrQzt5QkFBbEMsR0FBRyxDQUFDLElBQUosQ0FBQTs7QUFBQTs7OztRQUVaLElBQUMsQ0FBQSxZQUFXOzthQUVaLEVBQUUsQ0FBQyxTQUFILENBQWEsVUFBYixFQUF5QixJQUFJLENBQUMsU0FBTCxDQUFlLElBQWYsRUFBcUIsSUFBckIsRUFBMkIsQ0FBM0IsQ0FBekIsRUFBd0QsU0FBQyxHQUFEO1FBQ3RELElBQUcsR0FBSDtpQkFDRSxPQUFPLENBQUMsR0FBUixDQUFZLHFCQUFBLEdBQXNCLFVBQWxDLEVBREY7U0FBQSxNQUFBO2lCQUdFLE9BQU8sQ0FBQyxJQUFSLENBQWEsWUFBYixFQUhGOztNQURzRCxDQUF4RDtJQWpCUTs7Ozs7QUFwQloiLCJzb3VyY2VzQ29udGVudCI6WyJmcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5FdmVudEVtaXR0ZXIgPSByZXF1aXJlKFwiZXZlbnRzXCIpLkV2ZW50RW1pdHRlclxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBIb3N0XG4gIGNvbnN0cnVjdG9yOiAoQGNvbmZpZ1BhdGgsIEBlbWl0dGVyKSAtPlxuICAgIHJldHVybiBpZiAhZnMuZXhpc3RzU3luYyBAY29uZmlnUGF0aFxuICAgIHRyeVxuICAgICAgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyBAY29uZmlnUGF0aCwgXCJ1dGY4XCJcbiAgICAgIHNldHRpbmdzID0gSlNPTi5wYXJzZShkYXRhKVxuICAgICAgZm9yIGssIHYgb2Ygc2V0dGluZ3NcbiAgICAgICAgdGhpc1trXSA9IHZcbiAgICBjYXRjaCBlcnJcbiAgICAgIGNvbnNvbGUubG9nIFwibG9hZCAje0Bjb25maWdQYXRofSwgI3tlcnJ9XCJcblxuICAgIEBwb3J0Pz0gXCJcIlxuICAgIEBwb3J0ID0gQHBvcnQudG9TdHJpbmcoKVxuICAgIEBpZ25vcmUgPSBAaWdub3JlLmpvaW4oXCIsIFwiKSBpZiBAaWdub3JlXG4gICAgQHdhdGNoICA9IEB3YXRjaC5qb2luKFwiLCBcIikgaWYgQHdhdGNoXG5cbiAgc2F2ZUpTT046IC0+XG4gICAgY29uZmlnUGF0aCA9IEBjb25maWdQYXRoXG4gICAgZW1pdHRlciA9IEBlbWl0dGVyXG5cbiAgICBAY29uZmlnUGF0aCA9IHVuZGVmaW5lZFxuICAgIEBlbWl0dGVyID0gdW5kZWZpbmVkXG5cbiAgICBAaWdub3JlPz0gXCIucmVtb3RlLXN5bmMuanNvbiwuZ2l0LyoqXCJcbiAgICBAaWdub3JlID0gQGlnbm9yZS5zcGxpdCgnLCcpXG4gICAgQGlnbm9yZSA9ICh2YWwudHJpbSgpIGZvciB2YWwgaW4gQGlnbm9yZSB3aGVuIHZhbClcblxuICAgIEB3YXRjaCAgPz0gXCJcIlxuICAgIEB3YXRjaCAgID0gQHdhdGNoLnNwbGl0KCcsJylcbiAgICBAd2F0Y2ggICA9ICh2YWwudHJpbSgpIGZvciB2YWwgaW4gQHdhdGNoIHdoZW4gdmFsKVxuXG4gICAgQHRyYW5zcG9ydD89XCJzY3BcIlxuXG4gICAgZnMud3JpdGVGaWxlIGNvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KHRoaXMsIG51bGwsIDIpLCAoZXJyKSAtPlxuICAgICAgaWYgZXJyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbGVkIHNhdmluZyBmaWxlICN7Y29uZmlnUGF0aH1cIilcbiAgICAgIGVsc2VcbiAgICAgICAgZW1pdHRlci5lbWl0ICdjb25maWd1cmVkJ1xuIl19
