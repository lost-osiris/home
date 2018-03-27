
/*
Requires https://github.com/FriendsOfPHP/PHP-CS-Fixer
 */

(function() {
  "use strict";
  var Beautifier, PHPCSFixer, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  module.exports = PHPCSFixer = (function(superClass) {
    extend(PHPCSFixer, superClass);

    function PHPCSFixer() {
      return PHPCSFixer.__super__.constructor.apply(this, arguments);
    }

    PHPCSFixer.prototype.name = 'PHP-CS-Fixer';

    PHPCSFixer.prototype.link = "https://github.com/FriendsOfPHP/PHP-CS-Fixer";

    PHPCSFixer.prototype.options = {
      PHP: true
    };

    PHPCSFixer.prototype.beautify = function(text, language, options, context) {
      var configFile, tempFile;
      this.debug('php-cs-fixer', options);
      configFile = (context != null) && (context.filePath != null) ? this.findFile(path.dirname(context.filePath), '.php_cs') : void 0;
      if (this.isWindows) {
        return this.Promise.all([options.cs_fixer_path ? this.which(options.cs_fixer_path) : void 0, this.which('php-cs-fixer')]).then((function(_this) {
          return function(paths) {
            var _, phpCSFixerPath, tempFile;
            _this.debug('php-cs-fixer paths', paths);
            _ = require('lodash');
            phpCSFixerPath = _.find(paths, function(p) {
              return p && path.isAbsolute(p);
            });
            _this.verbose('phpCSFixerPath', phpCSFixerPath);
            _this.debug('phpCSFixerPath', phpCSFixerPath, paths);
            if (phpCSFixerPath != null) {
              return _this.run("php", [phpCSFixerPath, "fix", options.level ? "--level=" + options.level : void 0, options.fixers ? "--fixers=" + options.fixers : void 0, configFile ? "--config-file=" + configFile : void 0, tempFile = _this.tempFile("temp", text)], {
                ignoreReturnCode: true,
                help: {
                  link: "https://github.com/FriendsOfPHP/PHP-CS-Fixer"
                }
              }).then(function() {
                return _this.readFile(tempFile);
              });
            } else {
              _this.verbose('php-cs-fixer not found!');
              return _this.Promise.reject(_this.commandNotFoundError('php-cs-fixer', {
                link: "https://github.com/FriendsOfPHP/PHP-CS-Fixer",
                program: "php-cs-fixer.phar",
                pathOption: "PHP - CS Fixer Path"
              }));
            }
          };
        })(this));
      } else {
        return this.run("php-cs-fixer", ["fix", options.level ? "--level=" + options.level : void 0, options.fixers ? "--fixers=" + options.fixers : void 0, configFile ? "--config-file=" + configFile : void 0, tempFile = this.tempFile("temp", text)], {
          ignoreReturnCode: true,
          help: {
            link: "https://github.com/FriendsOfPHP/PHP-CS-Fixer"
          }
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      }
    };

    return PHPCSFixer;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3BocC1jcy1maXhlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsNEJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt5QkFFckIsSUFBQSxHQUFNOzt5QkFDTixJQUFBLEdBQU07O3lCQUVOLE9BQUEsR0FDRTtNQUFBLEdBQUEsRUFBSyxJQUFMOzs7eUJBRUYsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsRUFBMEIsT0FBMUI7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxjQUFQLEVBQXVCLE9BQXZCO01BRUEsVUFBQSxHQUFnQixpQkFBQSxJQUFhLDBCQUFoQixHQUF1QyxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBTyxDQUFDLFFBQXJCLENBQVYsRUFBMEMsU0FBMUMsQ0FBdkMsR0FBQTtNQUViLElBQUcsSUFBQyxDQUFBLFNBQUo7ZUFFRSxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxDQUNzQixPQUFPLENBQUMsYUFBekMsR0FBQSxJQUFDLENBQUEsS0FBRCxDQUFPLE9BQU8sQ0FBQyxhQUFmLENBQUEsR0FBQSxNQURXLEVBRVgsSUFBQyxDQUFBLEtBQUQsQ0FBTyxjQUFQLENBRlcsQ0FBYixDQUdFLENBQUMsSUFISCxDQUdRLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsS0FBRDtBQUNOLGdCQUFBO1lBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTyxvQkFBUCxFQUE2QixLQUE3QjtZQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjtZQUVKLGNBQUEsR0FBaUIsQ0FBQyxDQUFDLElBQUYsQ0FBTyxLQUFQLEVBQWMsU0FBQyxDQUFEO3FCQUFPLENBQUEsSUFBTSxJQUFJLENBQUMsVUFBTCxDQUFnQixDQUFoQjtZQUFiLENBQWQ7WUFDakIsS0FBQyxDQUFBLE9BQUQsQ0FBUyxnQkFBVCxFQUEyQixjQUEzQjtZQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sZ0JBQVAsRUFBeUIsY0FBekIsRUFBeUMsS0FBekM7WUFFQSxJQUFHLHNCQUFIO3FCQUVFLEtBQUMsQ0FBQSxHQUFELENBQUssS0FBTCxFQUFZLENBQ1YsY0FEVSxFQUVWLEtBRlUsRUFHb0IsT0FBTyxDQUFDLEtBQXRDLEdBQUEsVUFBQSxHQUFXLE9BQU8sQ0FBQyxLQUFuQixHQUFBLE1BSFUsRUFJc0IsT0FBTyxDQUFDLE1BQXhDLEdBQUEsV0FBQSxHQUFZLE9BQU8sQ0FBQyxNQUFwQixHQUFBLE1BSlUsRUFLdUIsVUFBakMsR0FBQSxnQkFBQSxHQUFpQixVQUFqQixHQUFBLE1BTFUsRUFNVixRQUFBLEdBQVcsS0FBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLENBTkQsQ0FBWixFQU9LO2dCQUNELGdCQUFBLEVBQWtCLElBRGpCO2dCQUVELElBQUEsRUFBTTtrQkFDSixJQUFBLEVBQU0sOENBREY7aUJBRkw7ZUFQTCxDQWFFLENBQUMsSUFiSCxDQWFRLFNBQUE7dUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO2NBREksQ0FiUixFQUZGO2FBQUEsTUFBQTtjQW1CRSxLQUFDLENBQUEsT0FBRCxDQUFTLHlCQUFUO3FCQUVBLEtBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixLQUFDLENBQUEsb0JBQUQsQ0FDZCxjQURjLEVBRWQ7Z0JBQ0EsSUFBQSxFQUFNLDhDQUROO2dCQUVBLE9BQUEsRUFBUyxtQkFGVDtnQkFHQSxVQUFBLEVBQVkscUJBSFo7ZUFGYyxDQUFoQixFQXJCRjs7VUFSTTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIUixFQUZGO09BQUEsTUFBQTtlQTRDRSxJQUFDLENBQUEsR0FBRCxDQUFLLGNBQUwsRUFBcUIsQ0FDbkIsS0FEbUIsRUFFVyxPQUFPLENBQUMsS0FBdEMsR0FBQSxVQUFBLEdBQVcsT0FBTyxDQUFDLEtBQW5CLEdBQUEsTUFGbUIsRUFHYSxPQUFPLENBQUMsTUFBeEMsR0FBQSxXQUFBLEdBQVksT0FBTyxDQUFDLE1BQXBCLEdBQUEsTUFIbUIsRUFJYyxVQUFqQyxHQUFBLGdCQUFBLEdBQWlCLFVBQWpCLEdBQUEsTUFKbUIsRUFLbkIsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQixDQUxRLENBQXJCLEVBTUs7VUFDRCxnQkFBQSxFQUFrQixJQURqQjtVQUVELElBQUEsRUFBTTtZQUNKLElBQUEsRUFBTSw4Q0FERjtXQUZMO1NBTkwsQ0FZRSxDQUFDLElBWkgsQ0FZUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtVQURJO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVpSLEVBNUNGOztJQUxROzs7O0tBUjhCO0FBUjFDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQSFBDU0ZpeGVyIGV4dGVuZHMgQmVhdXRpZmllclxuXG4gIG5hbWU6ICdQSFAtQ1MtRml4ZXInXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcIlxuXG4gIG9wdGlvbnM6XG4gICAgUEhQOiB0cnVlXG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucywgY29udGV4dCkgLT5cbiAgICBAZGVidWcoJ3BocC1jcy1maXhlcicsIG9wdGlvbnMpXG5cbiAgICBjb25maWdGaWxlID0gaWYgY29udGV4dD8gYW5kIGNvbnRleHQuZmlsZVBhdGg/IHRoZW4gQGZpbmRGaWxlKHBhdGguZGlybmFtZShjb250ZXh0LmZpbGVQYXRoKSwgJy5waHBfY3MnKVxuXG4gICAgaWYgQGlzV2luZG93c1xuICAgICAgIyBGaW5kIHBocC1jcy1maXhlci5waGFyIHNjcmlwdFxuICAgICAgQFByb21pc2UuYWxsKFtcbiAgICAgICAgQHdoaWNoKG9wdGlvbnMuY3NfZml4ZXJfcGF0aCkgaWYgb3B0aW9ucy5jc19maXhlcl9wYXRoXG4gICAgICAgIEB3aGljaCgncGhwLWNzLWZpeGVyJylcbiAgICAgIF0pLnRoZW4oKHBhdGhzKSA9PlxuICAgICAgICBAZGVidWcoJ3BocC1jcy1maXhlciBwYXRocycsIHBhdGhzKVxuICAgICAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuICAgICAgICAjIEdldCBmaXJzdCB2YWxpZCwgYWJzb2x1dGUgcGF0aFxuICAgICAgICBwaHBDU0ZpeGVyUGF0aCA9IF8uZmluZChwYXRocywgKHApIC0+IHAgYW5kIHBhdGguaXNBYnNvbHV0ZShwKSApXG4gICAgICAgIEB2ZXJib3NlKCdwaHBDU0ZpeGVyUGF0aCcsIHBocENTRml4ZXJQYXRoKVxuICAgICAgICBAZGVidWcoJ3BocENTRml4ZXJQYXRoJywgcGhwQ1NGaXhlclBhdGgsIHBhdGhzKVxuICAgICAgICAjIENoZWNrIGlmIFBIUC1DUy1GaXhlciBwYXRoIHdhcyBmb3VuZFxuICAgICAgICBpZiBwaHBDU0ZpeGVyUGF0aD9cbiAgICAgICAgICAjIEZvdW5kIFBIUC1DUy1GaXhlciBwYXRoXG4gICAgICAgICAgQHJ1bihcInBocFwiLCBbXG4gICAgICAgICAgICBwaHBDU0ZpeGVyUGF0aFxuICAgICAgICAgICAgXCJmaXhcIlxuICAgICAgICAgICAgXCItLWxldmVsPSN7b3B0aW9ucy5sZXZlbH1cIiBpZiBvcHRpb25zLmxldmVsXG4gICAgICAgICAgICBcIi0tZml4ZXJzPSN7b3B0aW9ucy5maXhlcnN9XCIgaWYgb3B0aW9ucy5maXhlcnNcbiAgICAgICAgICAgIFwiLS1jb25maWctZmlsZT0je2NvbmZpZ0ZpbGV9XCIgaWYgY29uZmlnRmlsZVxuICAgICAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXG4gICAgICAgICAgICBdLCB7XG4gICAgICAgICAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgICAgICAgICAgaGVscDoge1xuICAgICAgICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcIlxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICAgICAgKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHZlcmJvc2UoJ3BocC1jcy1maXhlciBub3QgZm91bmQhJylcbiAgICAgICAgICAjIENvdWxkIG5vdCBmaW5kIFBIUC1DUy1GaXhlciBwYXRoXG4gICAgICAgICAgQFByb21pc2UucmVqZWN0KEBjb21tYW5kTm90Rm91bmRFcnJvcihcbiAgICAgICAgICAgICdwaHAtY3MtZml4ZXInXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXCJcbiAgICAgICAgICAgIHByb2dyYW06IFwicGhwLWNzLWZpeGVyLnBoYXJcIlxuICAgICAgICAgICAgcGF0aE9wdGlvbjogXCJQSFAgLSBDUyBGaXhlciBQYXRoXCJcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKVxuICAgICAgKVxuICAgIGVsc2VcbiAgICAgIEBydW4oXCJwaHAtY3MtZml4ZXJcIiwgW1xuICAgICAgICBcImZpeFwiXG4gICAgICAgIFwiLS1sZXZlbD0je29wdGlvbnMubGV2ZWx9XCIgaWYgb3B0aW9ucy5sZXZlbFxuICAgICAgICBcIi0tZml4ZXJzPSN7b3B0aW9ucy5maXhlcnN9XCIgaWYgb3B0aW9ucy5maXhlcnNcbiAgICAgICAgXCItLWNvbmZpZy1maWxlPSN7Y29uZmlnRmlsZX1cIiBpZiBjb25maWdGaWxlXG4gICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0KVxuICAgICAgICBdLCB7XG4gICAgICAgICAgaWdub3JlUmV0dXJuQ29kZTogdHJ1ZVxuICAgICAgICAgIGhlbHA6IHtcbiAgICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcIlxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgIClcbiJdfQ==
