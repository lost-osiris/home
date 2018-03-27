
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
      var isWin, tempFile;
      this.debug('phpcbf', options);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3BocGNiZi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsa0JBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3FCQUNyQixJQUFBLEdBQU07O3FCQUNOLElBQUEsR0FBTTs7cUJBRU4sT0FBQSxHQUFTO01BQ1AsQ0FBQSxFQUNFO1FBQUEsUUFBQSxFQUFVO1VBQUMsVUFBRCxFQUFhLFNBQUMsUUFBRDtZQUNyQixJQUFJLFFBQUo7cUJBQ0UsU0FERjthQUFBLE1BQUE7cUJBQ2dCLE9BRGhCOztVQURxQixDQUFiO1NBQVY7T0FGSztNQU1QLEdBQUEsRUFBSyxJQU5FOzs7cUJBU1QsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxRQUFQLEVBQWlCLE9BQWpCO01BRUEsS0FBQSxHQUFRLElBQUMsQ0FBQTtNQUNULElBQUcsS0FBSDtlQUVFLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLENBQ29CLE9BQU8sQ0FBQyxXQUF2QyxHQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sT0FBTyxDQUFDLFdBQWYsQ0FBQSxHQUFBLE1BRFcsRUFFWCxJQUFDLENBQUEsS0FBRCxDQUFPLFFBQVAsQ0FGVyxDQUFiLENBR0UsQ0FBQyxJQUhILENBR1EsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxLQUFEO0FBQ04sZ0JBQUE7WUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLGNBQVAsRUFBdUIsS0FBdkI7WUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7WUFDSixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7WUFFUCxVQUFBLEdBQWEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxLQUFQLEVBQWMsU0FBQyxDQUFEO3FCQUFPLENBQUEsSUFBTSxJQUFJLENBQUMsVUFBTCxDQUFnQixDQUFoQjtZQUFiLENBQWQ7WUFDYixLQUFDLENBQUEsT0FBRCxDQUFTLFlBQVQsRUFBdUIsVUFBdkI7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLFlBQVAsRUFBcUIsVUFBckIsRUFBaUMsS0FBakM7WUFFQSxJQUFHLGtCQUFIO2NBSUUsTUFBQSxHQUFTLElBQUksQ0FBQyxPQUFMLENBQWEsVUFBYixDQUFBLEtBQThCO2NBQ3ZDLElBQUEsR0FBVSxNQUFILEdBQWUsVUFBZixHQUErQjtxQkFFdEMsS0FBQyxDQUFBLEdBQUQsQ0FBSyxJQUFMLEVBQVcsQ0FDVCxDQUFrQixNQUFsQixHQUFBLFVBQUEsR0FBQSxNQURTLEVBRVQsWUFGUyxFQUcyQixPQUFPLENBQUMsUUFBNUMsR0FBQSxhQUFBLEdBQWMsT0FBTyxDQUFDLFFBQXRCLEdBQUEsTUFIUyxFQUlULFFBQUEsR0FBVyxLQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsQ0FKRixDQUFYLEVBS0s7Z0JBQ0QsZ0JBQUEsRUFBa0IsSUFEakI7Z0JBRUQsSUFBQSxFQUFNO2tCQUNKLElBQUEsRUFBTSxzQ0FERjtpQkFGTDtnQkFLRCxPQUFBLEVBQVMsU0FBQyxLQUFEO3lCQUNQLEtBQUssQ0FBQyxHQUFOLENBQUE7Z0JBRE8sQ0FMUjtlQUxMLENBYUUsQ0FBQyxJQWJILENBYVEsU0FBQTt1QkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7Y0FESSxDQWJSLEVBUEY7YUFBQSxNQUFBO2NBd0JFLEtBQUMsQ0FBQSxPQUFELENBQVMsbUJBQVQ7cUJBRUEsS0FBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLEtBQUMsQ0FBQSxvQkFBRCxDQUNkLFFBRGMsRUFFZDtnQkFDQSxJQUFBLEVBQU0sOENBRE47Z0JBRUEsT0FBQSxFQUFTLGFBRlQ7Z0JBR0EsVUFBQSxFQUFZLGFBSFo7ZUFGYyxDQUFoQixFQTFCRjs7VUFUTTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIUixFQUZGO09BQUEsTUFBQTtlQWtERSxJQUFDLENBQUEsR0FBRCxDQUFLLFFBQUwsRUFBZSxDQUNiLFlBRGEsRUFFdUIsT0FBTyxDQUFDLFFBQTVDLEdBQUEsYUFBQSxHQUFjLE9BQU8sQ0FBQyxRQUF0QixHQUFBLE1BRmEsRUFHYixRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLENBSEUsQ0FBZixFQUlLO1VBQ0QsZ0JBQUEsRUFBa0IsSUFEakI7VUFFRCxJQUFBLEVBQU07WUFDSixJQUFBLEVBQU0sOENBREY7V0FGTDtVQUtELE9BQUEsRUFBUyxTQUFDLEtBQUQ7bUJBQ1AsS0FBSyxDQUFDLEdBQU4sQ0FBQTtVQURPLENBTFI7U0FKTCxDQVlFLENBQUMsSUFaSCxDQVlRLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO1VBREk7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBWlIsRUFsREY7O0lBSlE7Ozs7S0FiMEI7QUFQdEMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvcGhwY2JmXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBIUENCRiBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJQSFBDQkZcIlxuICBsaW5rOiBcImh0dHA6Ly9waHAubmV0L21hbnVhbC9lbi9pbnN0YWxsLnBocFwiXG5cbiAgb3B0aW9uczoge1xuICAgIF86XG4gICAgICBzdGFuZGFyZDogW1wic3RhbmRhcmRcIiwgKHN0YW5kYXJkKSAtPlxuICAgICAgICBpZiAoc3RhbmRhcmQpIHRoZW4gXFxcbiAgICAgICAgICBzdGFuZGFyZCBlbHNlIFwiUEVBUlwiXG4gICAgICBdXG4gICAgUEhQOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBkZWJ1ZygncGhwY2JmJywgb3B0aW9ucylcblxuICAgIGlzV2luID0gQGlzV2luZG93c1xuICAgIGlmIGlzV2luXG4gICAgICAjIEZpbmQgcGhwY2JmLnBoYXIgc2NyaXB0XG4gICAgICBAUHJvbWlzZS5hbGwoW1xuICAgICAgICBAd2hpY2gob3B0aW9ucy5waHBjYmZfcGF0aCkgaWYgb3B0aW9ucy5waHBjYmZfcGF0aFxuICAgICAgICBAd2hpY2goJ3BocGNiZicpXG4gICAgICBdKS50aGVuKChwYXRocykgPT5cbiAgICAgICAgQGRlYnVnKCdwaHBjYmYgcGF0aHMnLCBwYXRocylcbiAgICAgICAgXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbiAgICAgICAgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG4gICAgICAgICMgR2V0IGZpcnN0IHZhbGlkLCBhYnNvbHV0ZSBwYXRoXG4gICAgICAgIHBocGNiZlBhdGggPSBfLmZpbmQocGF0aHMsIChwKSAtPiBwIGFuZCBwYXRoLmlzQWJzb2x1dGUocCkgKVxuICAgICAgICBAdmVyYm9zZSgncGhwY2JmUGF0aCcsIHBocGNiZlBhdGgpXG4gICAgICAgIEBkZWJ1ZygncGhwY2JmUGF0aCcsIHBocGNiZlBhdGgsIHBhdGhzKVxuICAgICAgICAjIENoZWNrIGlmIHBocGNiZiBwYXRoIHdhcyBmb3VuZFxuICAgICAgICBpZiBwaHBjYmZQYXRoP1xuICAgICAgICAgICMgRm91bmQgcGhwY2JmIHBhdGhcblxuICAgICAgICAgICMgQ2hlY2sgaWYgcGhwY2JmIGlzIGFuIGV4ZWN1dGFibGVcbiAgICAgICAgICBpc0V4ZWMgPSBwYXRoLmV4dG5hbWUocGhwY2JmUGF0aCkgaXNudCAnJ1xuICAgICAgICAgIGV4ZWMgPSBpZiBpc0V4ZWMgdGhlbiBwaHBjYmZQYXRoIGVsc2UgXCJwaHBcIlxuXG4gICAgICAgICAgQHJ1bihleGVjLCBbXG4gICAgICAgICAgICBwaHBjYmZQYXRoIHVubGVzcyBpc0V4ZWNcbiAgICAgICAgICAgIFwiLS1uby1wYXRjaFwiXG4gICAgICAgICAgICBcIi0tc3RhbmRhcmQ9I3tvcHRpb25zLnN0YW5kYXJkfVwiIGlmIG9wdGlvbnMuc3RhbmRhcmRcbiAgICAgICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0KVxuICAgICAgICAgICAgXSwge1xuICAgICAgICAgICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlXG4gICAgICAgICAgICAgIGhlbHA6IHtcbiAgICAgICAgICAgICAgICBsaW5rOiBcImh0dHA6Ly9waHAubmV0L21hbnVhbC9lbi9pbnN0YWxsLnBocFwiXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgb25TdGRpbjogKHN0ZGluKSAtPlxuICAgICAgICAgICAgICAgIHN0ZGluLmVuZCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICAgICAgKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHZlcmJvc2UoJ3BocGNiZiBub3QgZm91bmQhJylcbiAgICAgICAgICAjIENvdWxkIG5vdCBmaW5kIHBocGNiZiBwYXRoXG4gICAgICAgICAgQFByb21pc2UucmVqZWN0KEBjb21tYW5kTm90Rm91bmRFcnJvcihcbiAgICAgICAgICAgICdwaHBjYmYnXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9zcXVpemxhYnMvUEhQX0NvZGVTbmlmZmVyXCJcbiAgICAgICAgICAgIHByb2dyYW06IFwicGhwY2JmLnBoYXJcIlxuICAgICAgICAgICAgcGF0aE9wdGlvbjogXCJQSFBDQkYgUGF0aFwiXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIClcbiAgICAgIClcbiAgICBlbHNlXG4gICAgICBAcnVuKFwicGhwY2JmXCIsIFtcbiAgICAgICAgXCItLW5vLXBhdGNoXCJcbiAgICAgICAgXCItLXN0YW5kYXJkPSN7b3B0aW9ucy5zdGFuZGFyZH1cIiBpZiBvcHRpb25zLnN0YW5kYXJkXG4gICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0KVxuICAgICAgICBdLCB7XG4gICAgICAgICAgaWdub3JlUmV0dXJuQ29kZTogdHJ1ZVxuICAgICAgICAgIGhlbHA6IHtcbiAgICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3NxdWl6bGFicy9QSFBfQ29kZVNuaWZmZXJcIlxuICAgICAgICAgIH1cbiAgICAgICAgICBvblN0ZGluOiAoc3RkaW4pIC0+XG4gICAgICAgICAgICBzdGRpbi5lbmQoKVxuICAgICAgICB9KVxuICAgICAgICAudGhlbig9PlxuICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgKVxuIl19
