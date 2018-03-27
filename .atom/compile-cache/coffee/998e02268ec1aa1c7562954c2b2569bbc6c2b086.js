
/*
Requires https://github.com/FriendsOfPHP/phpcbf
 */

(function() {
  "use strict";
  var Beautifier, PHPCBF,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PHPCBF = (function(superClass) {
    extend(PHPCBF, superClass);

    function PHPCBF() {
      return PHPCBF.__super__.constructor.apply(this, arguments);
    }

    PHPCBF.prototype.name = "PHPCBF";

    PHPCBF.prototype.link = "http://php.net/manual/en/install.php";

    PHPCBF.prototype.isPreInstalled = false;

    PHPCBF.prototype.options = {
      _: {
        standard: [
          "standard", function(standard) {
            if (standard) {
              return standard;
            } else {
              return "PEAR";
            }
          }
        ]
      },
      PHP: true
    };

    PHPCBF.prototype.beautify = function(text, language, options) {
      var isWin, standardFile, standardFiles, tempFile;
      this.debug('phpcbf', options);
      standardFiles = ['phpcs.xml', 'phpcs.xml.dist', 'phpcs.ruleset.xml', 'ruleset.xml'];
      standardFile = this.findFile(atom.project.getPaths()[0], standardFiles);
      if (standardFile) {
        options.standard = standardFile;
      }
      isWin = this.isWindows;
      if (isWin) {
        return this.Promise.all([options.phpcbf_path ? this.which(options.phpcbf_path) : void 0, this.which('phpcbf')]).then((function(_this) {
          return function(paths) {
            var _, exec, isExec, path, phpcbfPath, tempFile;
            _this.debug('phpcbf paths', paths);
            _ = require('lodash');
            path = require('path');
            phpcbfPath = _.find(paths, function(p) {
              return p && path.isAbsolute(p);
            });
            _this.verbose('phpcbfPath', phpcbfPath);
            _this.debug('phpcbfPath', phpcbfPath, paths);
            if (phpcbfPath != null) {
              isExec = path.extname(phpcbfPath) !== '';
              exec = isExec ? phpcbfPath : "php";
              return _this.run(exec, [!isExec ? phpcbfPath : void 0, "--no-patch", options.standard ? "--standard=" + options.standard : void 0, tempFile = _this.tempFile("temp", text)], {
                ignoreReturnCode: true,
                help: {
                  link: "http://php.net/manual/en/install.php"
                },
                onStdin: function(stdin) {
                  return stdin.end();
                }
              }).then(function() {
                return _this.readFile(tempFile);
              });
            } else {
              _this.verbose('phpcbf not found!');
              return _this.Promise.reject(_this.commandNotFoundError('phpcbf', {
                link: "https://github.com/squizlabs/PHP_CodeSniffer",
                program: "phpcbf.phar",
                pathOption: "PHPCBF Path"
              }));
            }
          };
        })(this));
      } else {
        return this.run("phpcbf", ["--no-patch", options.standard ? "--standard=" + options.standard : void 0, tempFile = this.tempFile("temp", text)], {
          ignoreReturnCode: true,
          help: {
            link: "https://github.com/squizlabs/PHP_CodeSniffer"
          },
          onStdin: function(stdin) {
            return stdin.end();
          }
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      }
    };

    return PHPCBF;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3BocGNiZi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsa0JBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3FCQUNyQixJQUFBLEdBQU07O3FCQUNOLElBQUEsR0FBTTs7cUJBQ04sY0FBQSxHQUFnQjs7cUJBRWhCLE9BQUEsR0FBUztNQUNQLENBQUEsRUFDRTtRQUFBLFFBQUEsRUFBVTtVQUFDLFVBQUQsRUFBYSxTQUFDLFFBQUQ7WUFDckIsSUFBSSxRQUFKO3FCQUNFLFNBREY7YUFBQSxNQUFBO3FCQUNnQixPQURoQjs7VUFEcUIsQ0FBYjtTQUFWO09BRks7TUFNUCxHQUFBLEVBQUssSUFORTs7O3FCQVNULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sUUFBUCxFQUFpQixPQUFqQjtNQUNBLGFBQUEsR0FBZ0IsQ0FBQyxXQUFELEVBQWMsZ0JBQWQsRUFBZ0MsbUJBQWhDLEVBQXFELGFBQXJEO01BQ2hCLFlBQUEsR0FBZSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBQXdCLENBQUEsQ0FBQSxDQUFsQyxFQUFzQyxhQUF0QztNQUVmLElBQW1DLFlBQW5DO1FBQUEsT0FBTyxDQUFDLFFBQVIsR0FBbUIsYUFBbkI7O01BRUEsS0FBQSxHQUFRLElBQUMsQ0FBQTtNQUNULElBQUcsS0FBSDtlQUVFLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLENBQ29CLE9BQU8sQ0FBQyxXQUF2QyxHQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sT0FBTyxDQUFDLFdBQWYsQ0FBQSxHQUFBLE1BRFcsRUFFWCxJQUFDLENBQUEsS0FBRCxDQUFPLFFBQVAsQ0FGVyxDQUFiLENBR0UsQ0FBQyxJQUhILENBR1EsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxLQUFEO0FBQ04sZ0JBQUE7WUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLGNBQVAsRUFBdUIsS0FBdkI7WUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7WUFDSixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7WUFFUCxVQUFBLEdBQWEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxLQUFQLEVBQWMsU0FBQyxDQUFEO3FCQUFPLENBQUEsSUFBTSxJQUFJLENBQUMsVUFBTCxDQUFnQixDQUFoQjtZQUFiLENBQWQ7WUFDYixLQUFDLENBQUEsT0FBRCxDQUFTLFlBQVQsRUFBdUIsVUFBdkI7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLFlBQVAsRUFBcUIsVUFBckIsRUFBaUMsS0FBakM7WUFFQSxJQUFHLGtCQUFIO2NBSUUsTUFBQSxHQUFTLElBQUksQ0FBQyxPQUFMLENBQWEsVUFBYixDQUFBLEtBQThCO2NBQ3ZDLElBQUEsR0FBVSxNQUFILEdBQWUsVUFBZixHQUErQjtxQkFFdEMsS0FBQyxDQUFBLEdBQUQsQ0FBSyxJQUFMLEVBQVcsQ0FDVCxDQUFrQixNQUFsQixHQUFBLFVBQUEsR0FBQSxNQURTLEVBRVQsWUFGUyxFQUcyQixPQUFPLENBQUMsUUFBNUMsR0FBQSxhQUFBLEdBQWMsT0FBTyxDQUFDLFFBQXRCLEdBQUEsTUFIUyxFQUlULFFBQUEsR0FBVyxLQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsQ0FKRixDQUFYLEVBS0s7Z0JBQ0QsZ0JBQUEsRUFBa0IsSUFEakI7Z0JBRUQsSUFBQSxFQUFNO2tCQUNKLElBQUEsRUFBTSxzQ0FERjtpQkFGTDtnQkFLRCxPQUFBLEVBQVMsU0FBQyxLQUFEO3lCQUNQLEtBQUssQ0FBQyxHQUFOLENBQUE7Z0JBRE8sQ0FMUjtlQUxMLENBYUUsQ0FBQyxJQWJILENBYVEsU0FBQTt1QkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7Y0FESSxDQWJSLEVBUEY7YUFBQSxNQUFBO2NBd0JFLEtBQUMsQ0FBQSxPQUFELENBQVMsbUJBQVQ7cUJBRUEsS0FBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLEtBQUMsQ0FBQSxvQkFBRCxDQUNkLFFBRGMsRUFFZDtnQkFDQSxJQUFBLEVBQU0sOENBRE47Z0JBRUEsT0FBQSxFQUFTLGFBRlQ7Z0JBR0EsVUFBQSxFQUFZLGFBSFo7ZUFGYyxDQUFoQixFQTFCRjs7VUFUTTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIUixFQUZGO09BQUEsTUFBQTtlQWtERSxJQUFDLENBQUEsR0FBRCxDQUFLLFFBQUwsRUFBZSxDQUNiLFlBRGEsRUFFdUIsT0FBTyxDQUFDLFFBQTVDLEdBQUEsYUFBQSxHQUFjLE9BQU8sQ0FBQyxRQUF0QixHQUFBLE1BRmEsRUFHYixRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLENBSEUsQ0FBZixFQUlLO1VBQ0QsZ0JBQUEsRUFBa0IsSUFEakI7VUFFRCxJQUFBLEVBQU07WUFDSixJQUFBLEVBQU0sOENBREY7V0FGTDtVQUtELE9BQUEsRUFBUyxTQUFDLEtBQUQ7bUJBQ1AsS0FBSyxDQUFDLEdBQU4sQ0FBQTtVQURPLENBTFI7U0FKTCxDQVlFLENBQUMsSUFaSCxDQVlRLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO1VBREk7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBWlIsRUFsREY7O0lBUlE7Ozs7S0FkMEI7QUFQdEMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvcGhwY2JmXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBIUENCRiBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJQSFBDQkZcIlxuICBsaW5rOiBcImh0dHA6Ly9waHAubmV0L21hbnVhbC9lbi9pbnN0YWxsLnBocFwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6IHtcbiAgICBfOlxuICAgICAgc3RhbmRhcmQ6IFtcInN0YW5kYXJkXCIsIChzdGFuZGFyZCkgLT5cbiAgICAgICAgaWYgKHN0YW5kYXJkKSB0aGVuIFxcXG4gICAgICAgICAgc3RhbmRhcmQgZWxzZSBcIlBFQVJcIlxuICAgICAgXVxuICAgIFBIUDogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBAZGVidWcoJ3BocGNiZicsIG9wdGlvbnMpXG4gICAgc3RhbmRhcmRGaWxlcyA9IFsncGhwY3MueG1sJywgJ3BocGNzLnhtbC5kaXN0JywgJ3BocGNzLnJ1bGVzZXQueG1sJywgJ3J1bGVzZXQueG1sJ11cbiAgICBzdGFuZGFyZEZpbGUgPSBAZmluZEZpbGUoYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF0sIHN0YW5kYXJkRmlsZXMpXG5cbiAgICBvcHRpb25zLnN0YW5kYXJkID0gc3RhbmRhcmRGaWxlIGlmIHN0YW5kYXJkRmlsZVxuXG4gICAgaXNXaW4gPSBAaXNXaW5kb3dzXG4gICAgaWYgaXNXaW5cbiAgICAgICMgRmluZCBwaHBjYmYucGhhciBzY3JpcHRcbiAgICAgIEBQcm9taXNlLmFsbChbXG4gICAgICAgIEB3aGljaChvcHRpb25zLnBocGNiZl9wYXRoKSBpZiBvcHRpb25zLnBocGNiZl9wYXRoXG4gICAgICAgIEB3aGljaCgncGhwY2JmJylcbiAgICAgIF0pLnRoZW4oKHBhdGhzKSA9PlxuICAgICAgICBAZGVidWcoJ3BocGNiZiBwYXRocycsIHBhdGhzKVxuICAgICAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuICAgICAgICBwYXRoID0gcmVxdWlyZSAncGF0aCdcbiAgICAgICAgIyBHZXQgZmlyc3QgdmFsaWQsIGFic29sdXRlIHBhdGhcbiAgICAgICAgcGhwY2JmUGF0aCA9IF8uZmluZChwYXRocywgKHApIC0+IHAgYW5kIHBhdGguaXNBYnNvbHV0ZShwKSApXG4gICAgICAgIEB2ZXJib3NlKCdwaHBjYmZQYXRoJywgcGhwY2JmUGF0aClcbiAgICAgICAgQGRlYnVnKCdwaHBjYmZQYXRoJywgcGhwY2JmUGF0aCwgcGF0aHMpXG4gICAgICAgICMgQ2hlY2sgaWYgcGhwY2JmIHBhdGggd2FzIGZvdW5kXG4gICAgICAgIGlmIHBocGNiZlBhdGg/XG4gICAgICAgICAgIyBGb3VuZCBwaHBjYmYgcGF0aFxuXG4gICAgICAgICAgIyBDaGVjayBpZiBwaHBjYmYgaXMgYW4gZXhlY3V0YWJsZVxuICAgICAgICAgIGlzRXhlYyA9IHBhdGguZXh0bmFtZShwaHBjYmZQYXRoKSBpc250ICcnXG4gICAgICAgICAgZXhlYyA9IGlmIGlzRXhlYyB0aGVuIHBocGNiZlBhdGggZWxzZSBcInBocFwiXG5cbiAgICAgICAgICBAcnVuKGV4ZWMsIFtcbiAgICAgICAgICAgIHBocGNiZlBhdGggdW5sZXNzIGlzRXhlY1xuICAgICAgICAgICAgXCItLW5vLXBhdGNoXCJcbiAgICAgICAgICAgIFwiLS1zdGFuZGFyZD0je29wdGlvbnMuc3RhbmRhcmR9XCIgaWYgb3B0aW9ucy5zdGFuZGFyZFxuICAgICAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXG4gICAgICAgICAgICBdLCB7XG4gICAgICAgICAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgICAgICAgICAgaGVscDoge1xuICAgICAgICAgICAgICAgIGxpbms6IFwiaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2luc3RhbGwucGhwXCJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBvblN0ZGluOiAoc3RkaW4pIC0+XG4gICAgICAgICAgICAgICAgc3RkaW4uZW5kKClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbig9PlxuICAgICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAdmVyYm9zZSgncGhwY2JmIG5vdCBmb3VuZCEnKVxuICAgICAgICAgICMgQ291bGQgbm90IGZpbmQgcGhwY2JmIHBhdGhcbiAgICAgICAgICBAUHJvbWlzZS5yZWplY3QoQGNvbW1hbmROb3RGb3VuZEVycm9yKFxuICAgICAgICAgICAgJ3BocGNiZidcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3NxdWl6bGFicy9QSFBfQ29kZVNuaWZmZXJcIlxuICAgICAgICAgICAgcHJvZ3JhbTogXCJwaHBjYmYucGhhclwiXG4gICAgICAgICAgICBwYXRoT3B0aW9uOiBcIlBIUENCRiBQYXRoXCJcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKVxuICAgICAgKVxuICAgIGVsc2VcbiAgICAgIEBydW4oXCJwaHBjYmZcIiwgW1xuICAgICAgICBcIi0tbm8tcGF0Y2hcIlxuICAgICAgICBcIi0tc3RhbmRhcmQ9I3tvcHRpb25zLnN0YW5kYXJkfVwiIGlmIG9wdGlvbnMuc3RhbmRhcmRcbiAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXG4gICAgICAgIF0sIHtcbiAgICAgICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlXG4gICAgICAgICAgaGVscDoge1xuICAgICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vc3F1aXpsYWJzL1BIUF9Db2RlU25pZmZlclwiXG4gICAgICAgICAgfVxuICAgICAgICAgIG9uU3RkaW46IChzdGRpbikgLT5cbiAgICAgICAgICAgIHN0ZGluLmVuZCgpXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICApXG4iXX0=
