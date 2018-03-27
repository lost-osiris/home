
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
            return _this.run(rubocopPath, ["--auto-correct", "--config", configFile, tempFile = _this.tempFile("temp", text)], {
              ignoreReturnCode: true
            }).then(function() {
              return _this.readFile(tempFile);
            });
          } else {
            return _this.run("rubocop", ["--auto-correct", "--config", configFile, tempFile = _this.tempFile("temp", text)], {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3J1Ym9jb3AuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLG1CQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztzQkFDckIsSUFBQSxHQUFNOztzQkFDTixJQUFBLEdBQU07O3NCQUVOLE9BQUEsR0FBUztNQUNQLElBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxJQUFiO1FBQ0EsWUFBQSxFQUFjLElBRGQ7T0FGSzs7O3NCQU1ULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO2FBQ1IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsQ0FDcUIsT0FBTyxDQUFDLFlBQXhDLEdBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxPQUFPLENBQUMsWUFBZixDQUFBLEdBQUEsTUFEVyxFQUVYLElBQUMsQ0FBQSxLQUFELENBQU8sU0FBUCxDQUZXLENBQWIsQ0FHRSxDQUFDLElBSEgsQ0FHUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtBQUNOLGNBQUE7VUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLGVBQVAsRUFBd0IsS0FBeEI7VUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7VUFDSixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7VUFFUCxXQUFBLEdBQWMsQ0FBQyxDQUFDLElBQUYsQ0FBTyxLQUFQLEVBQWMsU0FBQyxDQUFEO21CQUFPLENBQUEsSUFBTSxJQUFJLENBQUMsVUFBTCxDQUFnQixDQUFoQjtVQUFiLENBQWQ7VUFDZCxLQUFDLENBQUEsT0FBRCxDQUFTLGFBQVQsRUFBd0IsV0FBeEI7VUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLGFBQVAsRUFBc0IsV0FBdEIsRUFBbUMsS0FBbkM7VUFFQSxVQUFBLEdBQWEsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQUF3QixDQUFBLENBQUEsQ0FBbEMsRUFBc0MsY0FBdEM7VUFFYixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7VUFFTCxJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsVUFBZCxDQUFIO1lBQ0UsS0FBQyxDQUFBLEtBQUQsQ0FBTyxTQUFQLEVBQWtCLE1BQWxCLEVBQTBCLEVBQUUsQ0FBQyxZQUFILENBQWdCLFVBQWhCLEVBQTRCLE1BQTVCLENBQTFCLEVBREY7V0FBQSxNQUFBO1lBR0UsSUFBQSxHQUFPLE9BQUEsQ0FBUSxtQkFBUjtZQUVQLE1BQUEsR0FBUztjQUNQLHdCQUFBLEVBQ0U7Z0JBQUEsT0FBQSxFQUFTLE9BQU8sQ0FBQyxXQUFqQjtlQUZLOztZQUtULFVBQUEsR0FBYSxLQUFDLENBQUEsUUFBRCxDQUFVLGdCQUFWLEVBQTRCLElBQUksQ0FBQyxRQUFMLENBQWMsTUFBZCxDQUE1QjtZQUNiLEtBQUMsQ0FBQSxLQUFELENBQU8sU0FBUCxFQUFrQixNQUFsQixFQUEwQixVQUExQixFQVhGOztVQWNBLElBQUcsbUJBQUg7bUJBQ0UsS0FBQyxDQUFBLEdBQUQsQ0FBSyxXQUFMLEVBQWtCLENBQ2hCLGdCQURnQixFQUVoQixVQUZnQixFQUVKLFVBRkksRUFHaEIsUUFBQSxHQUFXLEtBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQixDQUhLLENBQWxCLEVBSUs7Y0FBQyxnQkFBQSxFQUFrQixJQUFuQjthQUpMLENBS0UsQ0FBQyxJQUxILENBS1EsU0FBQTtxQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7WUFESSxDQUxSLEVBREY7V0FBQSxNQUFBO21CQVVFLEtBQUMsQ0FBQSxHQUFELENBQUssU0FBTCxFQUFnQixDQUNkLGdCQURjLEVBRWQsVUFGYyxFQUVGLFVBRkUsRUFHZCxRQUFBLEdBQVcsS0FBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLENBSEcsQ0FBaEIsRUFJSztjQUFDLGdCQUFBLEVBQWtCLElBQW5CO2FBSkwsQ0FLRSxDQUFDLElBTEgsQ0FLUSxTQUFBO3FCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtZQURJLENBTFIsRUFWRjs7UUEzQk07TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSFI7SUFEUTs7OztLQVYyQjtBQVB2QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL2JiYXRzb3YvcnVib2NvcFxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBSdWJvY29wIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlJ1Ym9jb3BcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9iYmF0c292L3J1Ym9jb3BcIlxuXG4gIG9wdGlvbnM6IHtcbiAgICBSdWJ5OlxuICAgICAgaW5kZW50X3NpemU6IHRydWVcbiAgICAgIHJ1Ym9jb3BfcGF0aDogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBAUHJvbWlzZS5hbGwoW1xuICAgICAgQHdoaWNoKG9wdGlvbnMucnVib2NvcF9wYXRoKSBpZiBvcHRpb25zLnJ1Ym9jb3BfcGF0aFxuICAgICAgQHdoaWNoKCdydWJvY29wJylcbiAgICBdKS50aGVuKChwYXRocykgPT5cbiAgICAgIEBkZWJ1ZygncnVib2NvcCBwYXRocycsIHBhdGhzKVxuICAgICAgXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbiAgICAgIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuICAgICAgIyBHZXQgZmlyc3QgdmFsaWQsIGFic29sdXRlIHBhdGhcbiAgICAgIHJ1Ym9jb3BQYXRoID0gXy5maW5kKHBhdGhzLCAocCkgLT4gcCBhbmQgcGF0aC5pc0Fic29sdXRlKHApIClcbiAgICAgIEB2ZXJib3NlKCdydWJvY29wUGF0aCcsIHJ1Ym9jb3BQYXRoKVxuICAgICAgQGRlYnVnKCdydWJvY29wUGF0aCcsIHJ1Ym9jb3BQYXRoLCBwYXRocylcblxuICAgICAgY29uZmlnRmlsZSA9IHBhdGguam9pbihhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXSwgXCIucnVib2NvcC55bWxcIilcblxuICAgICAgZnMgPSByZXF1aXJlICdmcydcblxuICAgICAgaWYgZnMuZXhpc3RzU3luYyhjb25maWdGaWxlKVxuICAgICAgICBAZGVidWcoXCJydWJvY29wXCIsIGNvbmZpZywgZnMucmVhZEZpbGVTeW5jKGNvbmZpZ0ZpbGUsICd1dGY4JykpXG4gICAgICBlbHNlXG4gICAgICAgIHlhbWwgPSByZXF1aXJlKFwieWFtbC1mcm9udC1tYXR0ZXJcIilcbiAgICAgICAgIyBHZW5lcmF0ZSBjb25maWcgZmlsZVxuICAgICAgICBjb25maWcgPSB7XG4gICAgICAgICAgXCJTdHlsZS9JbmRlbnRhdGlvbldpZHRoXCI6XG4gICAgICAgICAgICBcIldpZHRoXCI6IG9wdGlvbnMuaW5kZW50X3NpemVcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbmZpZ0ZpbGUgPSBAdGVtcEZpbGUoXCJydWJvY29wLWNvbmZpZ1wiLCB5YW1sLnNhZmVEdW1wKGNvbmZpZykpXG4gICAgICAgIEBkZWJ1ZyhcInJ1Ym9jb3BcIiwgY29uZmlnLCBjb25maWdGaWxlKVxuXG4gICAgICAjIENoZWNrIGlmIFBIUC1DUy1GaXhlciBwYXRoIHdhcyBmb3VuZFxuICAgICAgaWYgcnVib2NvcFBhdGg/XG4gICAgICAgIEBydW4ocnVib2NvcFBhdGgsIFtcbiAgICAgICAgICBcIi0tYXV0by1jb3JyZWN0XCJcbiAgICAgICAgICBcIi0tY29uZmlnXCIsIGNvbmZpZ0ZpbGVcbiAgICAgICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dClcbiAgICAgICAgICBdLCB7aWdub3JlUmV0dXJuQ29kZTogdHJ1ZX0pXG4gICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICApXG4gICAgICBlbHNlXG4gICAgICAgIEBydW4oXCJydWJvY29wXCIsIFtcbiAgICAgICAgICBcIi0tYXV0by1jb3JyZWN0XCJcbiAgICAgICAgICBcIi0tY29uZmlnXCIsIGNvbmZpZ0ZpbGVcbiAgICAgICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dClcbiAgICAgICAgICBdLCB7aWdub3JlUmV0dXJuQ29kZTogdHJ1ZX0pXG4gICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICApXG4pXG4iXX0=
