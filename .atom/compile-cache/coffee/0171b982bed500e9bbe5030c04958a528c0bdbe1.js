
/*
Requires https://github.com/bbatsov/rubocop
 */

(function() {
  "use strict";
  var Beautifier, Rubocop,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Rubocop = (function(superClass) {
    extend(Rubocop, superClass);

    function Rubocop() {
      return Rubocop.__super__.constructor.apply(this, arguments);
    }

    Rubocop.prototype.name = "Rubocop";

    Rubocop.prototype.link = "https://github.com/bbatsov/rubocop";

    Rubocop.prototype.isPreInstalled = false;

    Rubocop.prototype.options = {
      Ruby: {
        indent_size: true,
        rubocop_path: true
      }
    };

    Rubocop.prototype.beautify = function(text, language, options) {
      return this.Promise.all([options.rubocop_path ? this.which(options.rubocop_path) : void 0, this.which('rubocop')]).then((function(_this) {
        return function(paths) {
          var _, config, configFile, fs, path, rubocopPath, tempFile, yaml;
          _this.debug('rubocop paths', paths);
          _ = require('lodash');
          path = require('path');
          rubocopPath = _.find(paths, function(p) {
            return p && path.isAbsolute(p);
          });
          _this.verbose('rubocopPath', rubocopPath);
          _this.debug('rubocopPath', rubocopPath, paths);
          configFile = path.join(atom.project.getPaths()[0], ".rubocop.yml");
          fs = require('fs');
          if (fs.existsSync(configFile)) {
            _this.debug("rubocop", config, fs.readFileSync(configFile, 'utf8'));
          } else {
            yaml = require("yaml-front-matter");
            config = {
              "Style/IndentationWidth": {
                "Width": options.indent_size
              }
            };
            configFile = _this.tempFile("rubocop-config", yaml.safeDump(config));
            _this.debug("rubocop", config, configFile);
          }
          if (rubocopPath != null) {
            return _this.run(rubocopPath, ["--auto-correct", "--config", configFile, tempFile = _this.tempFile("temp", text, '.rb')], {
              ignoreReturnCode: true
            }).then(function() {
              return _this.readFile(tempFile);
            });
          } else {
            return _this.run("rubocop", ["--auto-correct", "--config", configFile, tempFile = _this.tempFile("temp", text, '.rb')], {
              ignoreReturnCode: true
            }).then(function() {
              return _this.readFile(tempFile);
            });
          }
        };
      })(this));
    };

    return Rubocop;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3J1Ym9jb3AuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLG1CQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztzQkFDckIsSUFBQSxHQUFNOztzQkFDTixJQUFBLEdBQU07O3NCQUNOLGNBQUEsR0FBZ0I7O3NCQUVoQixPQUFBLEdBQVM7TUFDUCxJQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsSUFBYjtRQUNBLFlBQUEsRUFBYyxJQURkO09BRks7OztzQkFNVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjthQUNSLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLENBQ3FCLE9BQU8sQ0FBQyxZQUF4QyxHQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sT0FBTyxDQUFDLFlBQWYsQ0FBQSxHQUFBLE1BRFcsRUFFWCxJQUFDLENBQUEsS0FBRCxDQUFPLFNBQVAsQ0FGVyxDQUFiLENBR0UsQ0FBQyxJQUhILENBR1EsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7QUFDTixjQUFBO1VBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTyxlQUFQLEVBQXdCLEtBQXhCO1VBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSO1VBQ0osSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSO1VBRVAsV0FBQSxHQUFjLENBQUMsQ0FBQyxJQUFGLENBQU8sS0FBUCxFQUFjLFNBQUMsQ0FBRDttQkFBTyxDQUFBLElBQU0sSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsQ0FBaEI7VUFBYixDQUFkO1VBQ2QsS0FBQyxDQUFBLE9BQUQsQ0FBUyxhQUFULEVBQXdCLFdBQXhCO1VBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTyxhQUFQLEVBQXNCLFdBQXRCLEVBQW1DLEtBQW5DO1VBRUEsVUFBQSxHQUFhLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBd0IsQ0FBQSxDQUFBLENBQWxDLEVBQXNDLGNBQXRDO1VBRWIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSO1VBRUwsSUFBRyxFQUFFLENBQUMsVUFBSCxDQUFjLFVBQWQsQ0FBSDtZQUNFLEtBQUMsQ0FBQSxLQUFELENBQU8sU0FBUCxFQUFrQixNQUFsQixFQUEwQixFQUFFLENBQUMsWUFBSCxDQUFnQixVQUFoQixFQUE0QixNQUE1QixDQUExQixFQURGO1dBQUEsTUFBQTtZQUdFLElBQUEsR0FBTyxPQUFBLENBQVEsbUJBQVI7WUFFUCxNQUFBLEdBQVM7Y0FDUCx3QkFBQSxFQUNFO2dCQUFBLE9BQUEsRUFBUyxPQUFPLENBQUMsV0FBakI7ZUFGSzs7WUFLVCxVQUFBLEdBQWEsS0FBQyxDQUFBLFFBQUQsQ0FBVSxnQkFBVixFQUE0QixJQUFJLENBQUMsUUFBTCxDQUFjLE1BQWQsQ0FBNUI7WUFDYixLQUFDLENBQUEsS0FBRCxDQUFPLFNBQVAsRUFBa0IsTUFBbEIsRUFBMEIsVUFBMUIsRUFYRjs7VUFjQSxJQUFHLG1CQUFIO21CQUNFLEtBQUMsQ0FBQSxHQUFELENBQUssV0FBTCxFQUFrQixDQUNoQixnQkFEZ0IsRUFFaEIsVUFGZ0IsRUFFSixVQUZJLEVBR2hCLFFBQUEsR0FBVyxLQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsRUFBd0IsS0FBeEIsQ0FISyxDQUFsQixFQUlLO2NBQUMsZ0JBQUEsRUFBa0IsSUFBbkI7YUFKTCxDQUtFLENBQUMsSUFMSCxDQUtRLFNBQUE7cUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO1lBREksQ0FMUixFQURGO1dBQUEsTUFBQTttQkFVRSxLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUwsRUFBZ0IsQ0FDZCxnQkFEYyxFQUVkLFVBRmMsRUFFRixVQUZFLEVBR2QsUUFBQSxHQUFXLEtBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQixFQUF3QixLQUF4QixDQUhHLENBQWhCLEVBSUs7Y0FBQyxnQkFBQSxFQUFrQixJQUFuQjthQUpMLENBS0UsQ0FBQyxJQUxILENBS1EsU0FBQTtxQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7WUFESSxDQUxSLEVBVkY7O1FBM0JNO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhSO0lBRFE7Ozs7S0FYMkI7QUFQdkMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9iYmF0c292L3J1Ym9jb3BcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUnVib2NvcCBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJSdWJvY29wXCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYmJhdHNvdi9ydWJvY29wXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIFJ1Ynk6XG4gICAgICBpbmRlbnRfc2l6ZTogdHJ1ZVxuICAgICAgcnVib2NvcF9wYXRoOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBQcm9taXNlLmFsbChbXG4gICAgICBAd2hpY2gob3B0aW9ucy5ydWJvY29wX3BhdGgpIGlmIG9wdGlvbnMucnVib2NvcF9wYXRoXG4gICAgICBAd2hpY2goJ3J1Ym9jb3AnKVxuICAgIF0pLnRoZW4oKHBhdGhzKSA9PlxuICAgICAgQGRlYnVnKCdydWJvY29wIHBhdGhzJywgcGF0aHMpXG4gICAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuICAgICAgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG4gICAgICAjIEdldCBmaXJzdCB2YWxpZCwgYWJzb2x1dGUgcGF0aFxuICAgICAgcnVib2NvcFBhdGggPSBfLmZpbmQocGF0aHMsIChwKSAtPiBwIGFuZCBwYXRoLmlzQWJzb2x1dGUocCkgKVxuICAgICAgQHZlcmJvc2UoJ3J1Ym9jb3BQYXRoJywgcnVib2NvcFBhdGgpXG4gICAgICBAZGVidWcoJ3J1Ym9jb3BQYXRoJywgcnVib2NvcFBhdGgsIHBhdGhzKVxuXG4gICAgICBjb25maWdGaWxlID0gcGF0aC5qb2luKGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdLCBcIi5ydWJvY29wLnltbFwiKVxuXG4gICAgICBmcyA9IHJlcXVpcmUgJ2ZzJ1xuXG4gICAgICBpZiBmcy5leGlzdHNTeW5jKGNvbmZpZ0ZpbGUpXG4gICAgICAgIEBkZWJ1ZyhcInJ1Ym9jb3BcIiwgY29uZmlnLCBmcy5yZWFkRmlsZVN5bmMoY29uZmlnRmlsZSwgJ3V0ZjgnKSlcbiAgICAgIGVsc2VcbiAgICAgICAgeWFtbCA9IHJlcXVpcmUoXCJ5YW1sLWZyb250LW1hdHRlclwiKVxuICAgICAgICAjIEdlbmVyYXRlIGNvbmZpZyBmaWxlXG4gICAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgICBcIlN0eWxlL0luZGVudGF0aW9uV2lkdGhcIjpcbiAgICAgICAgICAgIFwiV2lkdGhcIjogb3B0aW9ucy5pbmRlbnRfc2l6ZVxuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnRmlsZSA9IEB0ZW1wRmlsZShcInJ1Ym9jb3AtY29uZmlnXCIsIHlhbWwuc2FmZUR1bXAoY29uZmlnKSlcbiAgICAgICAgQGRlYnVnKFwicnVib2NvcFwiLCBjb25maWcsIGNvbmZpZ0ZpbGUpXG5cbiAgICAgICMgQ2hlY2sgaWYgUEhQLUNTLUZpeGVyIHBhdGggd2FzIGZvdW5kXG4gICAgICBpZiBydWJvY29wUGF0aD9cbiAgICAgICAgQHJ1bihydWJvY29wUGF0aCwgW1xuICAgICAgICAgIFwiLS1hdXRvLWNvcnJlY3RcIlxuICAgICAgICAgIFwiLS1jb25maWdcIiwgY29uZmlnRmlsZVxuICAgICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0LCAnLnJiJylcbiAgICAgICAgICBdLCB7aWdub3JlUmV0dXJuQ29kZTogdHJ1ZX0pXG4gICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICApXG4gICAgICBlbHNlXG4gICAgICAgIEBydW4oXCJydWJvY29wXCIsIFtcbiAgICAgICAgICBcIi0tYXV0by1jb3JyZWN0XCJcbiAgICAgICAgICBcIi0tY29uZmlnXCIsIGNvbmZpZ0ZpbGVcbiAgICAgICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dCwgJy5yYicpXG4gICAgICAgICAgXSwge2lnbm9yZVJldHVybkNvZGU6IHRydWV9KVxuICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgICAgKVxuKVxuIl19
