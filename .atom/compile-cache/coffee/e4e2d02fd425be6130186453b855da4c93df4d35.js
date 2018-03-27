
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  "use strict";
  var Autopep8, Beautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Autopep8 = (function(superClass) {
    extend(Autopep8, superClass);

    function Autopep8() {
      return Autopep8.__super__.constructor.apply(this, arguments);
    }

    Autopep8.prototype.name = "autopep8";

    Autopep8.prototype.link = "https://github.com/hhatto/autopep8";

    Autopep8.prototype.options = {
      Python: true
    };

    Autopep8.prototype.beautify = function(text, language, options) {
      var tempFile;
      return this.run("autopep8", [tempFile = this.tempFile("input", text), "-i", options.max_line_length != null ? ["--max-line-length", "" + options.max_line_length] : void 0, options.indent_size != null ? ["--indent-size", "" + options.indent_size] : void 0, options.ignore != null ? ["--ignore", "" + (options.ignore.join(','))] : void 0], {
        help: {
          link: "https://github.com/hhatto/autopep8"
        }
      }).then((function(_this) {
        return function() {
          if (options.sort_imports) {
            return _this.run("isort", [tempFile], {
              help: {
                link: "https://github.com/timothycrosley/isort"
              }
            }).then(function() {
              return _this.readFile(tempFile);
            });
          } else {
            return _this.readFile(tempFile);
          }
        };
      })(this));
    };

    return Autopep8;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2F1dG9wZXA4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxvQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7dUJBRXJCLElBQUEsR0FBTTs7dUJBQ04sSUFBQSxHQUFNOzt1QkFFTixPQUFBLEdBQVM7TUFDUCxNQUFBLEVBQVEsSUFERDs7O3VCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTthQUFBLElBQUMsQ0FBQSxHQUFELENBQUssVUFBTCxFQUFpQixDQUNmLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FESSxFQUVmLElBRmUsRUFHd0MsK0JBQXZELEdBQUEsQ0FBQyxtQkFBRCxFQUFzQixFQUFBLEdBQUcsT0FBTyxDQUFDLGVBQWpDLENBQUEsR0FBQSxNQUhlLEVBSStCLDJCQUE5QyxHQUFBLENBQUMsZUFBRCxFQUFpQixFQUFBLEdBQUcsT0FBTyxDQUFDLFdBQTVCLENBQUEsR0FBQSxNQUplLEVBSytCLHNCQUE5QyxHQUFBLENBQUMsVUFBRCxFQUFZLEVBQUEsR0FBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBZixDQUFvQixHQUFwQixDQUFELENBQWQsQ0FBQSxHQUFBLE1BTGUsQ0FBakIsRUFNSztRQUFBLElBQUEsRUFBTTtVQUNQLElBQUEsRUFBTSxvQ0FEQztTQUFOO09BTkwsQ0FTRSxDQUFDLElBVEgsQ0FTUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDSixJQUFHLE9BQU8sQ0FBQyxZQUFYO21CQUNFLEtBQUMsQ0FBQSxHQUFELENBQUssT0FBTCxFQUNFLENBQUMsUUFBRCxDQURGLEVBRUU7Y0FBQSxJQUFBLEVBQU07Z0JBQ0osSUFBQSxFQUFNLHlDQURGO2VBQU47YUFGRixDQUtBLENBQUMsSUFMRCxDQUtNLFNBQUE7cUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO1lBREksQ0FMTixFQURGO1dBQUEsTUFBQTttQkFVRSxLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVYsRUFWRjs7UUFESTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FUUjtJQURROzs7O0tBVDRCO0FBUHhDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vaGhhdHRvL2F1dG9wZXA4XG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEF1dG9wZXA4IGV4dGVuZHMgQmVhdXRpZmllclxuXG4gIG5hbWU6IFwiYXV0b3BlcDhcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDhcIlxuXG4gIG9wdGlvbnM6IHtcbiAgICBQeXRob246IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQHJ1bihcImF1dG9wZXA4XCIsIFtcbiAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dClcbiAgICAgIFwiLWlcIlxuICAgICAgW1wiLS1tYXgtbGluZS1sZW5ndGhcIiwgXCIje29wdGlvbnMubWF4X2xpbmVfbGVuZ3RofVwiXSBpZiBvcHRpb25zLm1heF9saW5lX2xlbmd0aD9cbiAgICAgIFtcIi0taW5kZW50LXNpemVcIixcIiN7b3B0aW9ucy5pbmRlbnRfc2l6ZX1cIl0gaWYgb3B0aW9ucy5pbmRlbnRfc2l6ZT9cbiAgICAgIFtcIi0taWdub3JlXCIsXCIje29wdGlvbnMuaWdub3JlLmpvaW4oJywnKX1cIl0gaWYgb3B0aW9ucy5pZ25vcmU/XG4gICAgICBdLCBoZWxwOiB7XG4gICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2hoYXR0by9hdXRvcGVwOFwiXG4gICAgICB9KVxuICAgICAgLnRoZW4oPT5cbiAgICAgICAgaWYgb3B0aW9ucy5zb3J0X2ltcG9ydHNcbiAgICAgICAgICBAcnVuKFwiaXNvcnRcIixcbiAgICAgICAgICAgIFt0ZW1wRmlsZV0sXG4gICAgICAgICAgICBoZWxwOiB7XG4gICAgICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3RpbW90aHljcm9zbGV5L2lzb3J0XCJcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgICAgKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgKVxuIl19
