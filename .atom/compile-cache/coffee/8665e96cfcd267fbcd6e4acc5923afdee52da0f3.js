
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

    PHPCSFixer.prototype.isPreInstalled = false;

    PHPCSFixer.prototype.options = {
      PHP: true
    };

    PHPCSFixer.prototype.beautify = function(text, language, options, context) {
      var configFile, phpCsFixerOptions, runOptions, version;
      this.debug('php-cs-fixer', options);
      version = options.cs_fixer_version;
      configFile = (context != null) && (context.filePath != null) ? this.findFile(path.dirname(context.filePath), '.php_cs') : void 0;
      phpCsFixerOptions = ["fix", options.rules ? "--rules=" + options.rules : void 0, configFile ? "--config=" + configFile : void 0, "--using-cache=no"];
      if (version === 1) {
        phpCsFixerOptions = ["fix", options.level ? "--level=" + options.level : void 0, options.fixers ? "--fixers=" + options.fixers : void 0, configFile ? "--config-file=" + configFile : void 0];
      }
      runOptions = {
        ignoreReturnCode: true,
        help: {
          link: "https://github.com/FriendsOfPHP/PHP-CS-Fixer"
        }
      };
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
            tempFile = _this.tempFile("temp", text);
            if (_this.isWindows) {
              return _this.run("php", [phpCSFixerPath, phpCsFixerOptions, tempFile], runOptions).then(function() {
                return _this.readFile(tempFile);
              });
            } else {
              return _this.run(phpCSFixerPath, [phpCsFixerOptions, tempFile], runOptions).then(function() {
                return _this.readFile(tempFile);
              });
            }
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
    };

    return PHPCSFixer;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3BocC1jcy1maXhlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsNEJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt5QkFFckIsSUFBQSxHQUFNOzt5QkFDTixJQUFBLEdBQU07O3lCQUNOLGNBQUEsR0FBZ0I7O3lCQUVoQixPQUFBLEdBQ0U7TUFBQSxHQUFBLEVBQUssSUFBTDs7O3lCQUVGLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCLEVBQTBCLE9BQTFCO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sY0FBUCxFQUF1QixPQUF2QjtNQUNBLE9BQUEsR0FBVSxPQUFPLENBQUM7TUFFbEIsVUFBQSxHQUFnQixpQkFBQSxJQUFhLDBCQUFoQixHQUF1QyxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBTyxDQUFDLFFBQXJCLENBQVYsRUFBMEMsU0FBMUMsQ0FBdkMsR0FBQTtNQUNiLGlCQUFBLEdBQW9CLENBQ2xCLEtBRGtCLEVBRVksT0FBTyxDQUFDLEtBQXRDLEdBQUEsVUFBQSxHQUFXLE9BQU8sQ0FBQyxLQUFuQixHQUFBLE1BRmtCLEVBR1UsVUFBNUIsR0FBQSxXQUFBLEdBQVksVUFBWixHQUFBLE1BSGtCLEVBSWxCLGtCQUprQjtNQU1wQixJQUFHLE9BQUEsS0FBVyxDQUFkO1FBQ0UsaUJBQUEsR0FBb0IsQ0FDbEIsS0FEa0IsRUFFWSxPQUFPLENBQUMsS0FBdEMsR0FBQSxVQUFBLEdBQVcsT0FBTyxDQUFDLEtBQW5CLEdBQUEsTUFGa0IsRUFHYyxPQUFPLENBQUMsTUFBeEMsR0FBQSxXQUFBLEdBQVksT0FBTyxDQUFDLE1BQXBCLEdBQUEsTUFIa0IsRUFJZSxVQUFqQyxHQUFBLGdCQUFBLEdBQWlCLFVBQWpCLEdBQUEsTUFKa0IsRUFEdEI7O01BT0EsVUFBQSxHQUFhO1FBQ1gsZ0JBQUEsRUFBa0IsSUFEUDtRQUVYLElBQUEsRUFBTTtVQUNKLElBQUEsRUFBTSw4Q0FERjtTQUZLOzthQVFiLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLENBQ3NCLE9BQU8sQ0FBQyxhQUF6QyxHQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sT0FBTyxDQUFDLGFBQWYsQ0FBQSxHQUFBLE1BRFcsRUFFWCxJQUFDLENBQUEsS0FBRCxDQUFPLGNBQVAsQ0FGVyxDQUFiLENBR0UsQ0FBQyxJQUhILENBR1EsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7QUFDTixjQUFBO1VBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTyxvQkFBUCxFQUE2QixLQUE3QjtVQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjtVQUVKLGNBQUEsR0FBaUIsQ0FBQyxDQUFDLElBQUYsQ0FBTyxLQUFQLEVBQWMsU0FBQyxDQUFEO21CQUFPLENBQUEsSUFBTSxJQUFJLENBQUMsVUFBTCxDQUFnQixDQUFoQjtVQUFiLENBQWQ7VUFDakIsS0FBQyxDQUFBLE9BQUQsQ0FBUyxnQkFBVCxFQUEyQixjQUEzQjtVQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sZ0JBQVAsRUFBeUIsY0FBekIsRUFBeUMsS0FBekM7VUFHQSxJQUFHLHNCQUFIO1lBRUUsUUFBQSxHQUFXLEtBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQjtZQUVYLElBQUcsS0FBQyxDQUFBLFNBQUo7cUJBQ0UsS0FBQyxDQUFBLEdBQUQsQ0FBSyxLQUFMLEVBQVksQ0FBQyxjQUFELEVBQWlCLGlCQUFqQixFQUFvQyxRQUFwQyxDQUFaLEVBQTJELFVBQTNELENBQ0UsQ0FBQyxJQURILENBQ1EsU0FBQTt1QkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7Y0FESSxDQURSLEVBREY7YUFBQSxNQUFBO3FCQU1FLEtBQUMsQ0FBQSxHQUFELENBQUssY0FBTCxFQUFxQixDQUFDLGlCQUFELEVBQW9CLFFBQXBCLENBQXJCLEVBQW9ELFVBQXBELENBQ0UsQ0FBQyxJQURILENBQ1EsU0FBQTt1QkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7Y0FESSxDQURSLEVBTkY7YUFKRjtXQUFBLE1BQUE7WUFlRSxLQUFDLENBQUEsT0FBRCxDQUFTLHlCQUFUO21CQUVBLEtBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixLQUFDLENBQUEsb0JBQUQsQ0FDZCxjQURjLEVBRWQ7Y0FDRSxJQUFBLEVBQU0sOENBRFI7Y0FFRSxPQUFBLEVBQVMsbUJBRlg7Y0FHRSxVQUFBLEVBQVkscUJBSGQ7YUFGYyxDQUFoQixFQWpCRjs7UUFUTTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIUjtJQTFCUTs7OztLQVQ4QjtBQVIxQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5wYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUEhQQ1NGaXhlciBleHRlbmRzIEJlYXV0aWZpZXJcblxuICBuYW1lOiAnUEhQLUNTLUZpeGVyJ1xuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczpcbiAgICBQSFA6IHRydWVcblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zLCBjb250ZXh0KSAtPlxuICAgIEBkZWJ1ZygncGhwLWNzLWZpeGVyJywgb3B0aW9ucylcbiAgICB2ZXJzaW9uID0gb3B0aW9ucy5jc19maXhlcl92ZXJzaW9uXG5cbiAgICBjb25maWdGaWxlID0gaWYgY29udGV4dD8gYW5kIGNvbnRleHQuZmlsZVBhdGg/IHRoZW4gQGZpbmRGaWxlKHBhdGguZGlybmFtZShjb250ZXh0LmZpbGVQYXRoKSwgJy5waHBfY3MnKVxuICAgIHBocENzRml4ZXJPcHRpb25zID0gW1xuICAgICAgXCJmaXhcIlxuICAgICAgXCItLXJ1bGVzPSN7b3B0aW9ucy5ydWxlc31cIiBpZiBvcHRpb25zLnJ1bGVzXG4gICAgICBcIi0tY29uZmlnPSN7Y29uZmlnRmlsZX1cIiBpZiBjb25maWdGaWxlXG4gICAgICBcIi0tdXNpbmctY2FjaGU9bm9cIlxuICAgIF1cbiAgICBpZiB2ZXJzaW9uIGlzIDFcbiAgICAgIHBocENzRml4ZXJPcHRpb25zID0gW1xuICAgICAgICBcImZpeFwiXG4gICAgICAgIFwiLS1sZXZlbD0je29wdGlvbnMubGV2ZWx9XCIgaWYgb3B0aW9ucy5sZXZlbFxuICAgICAgICBcIi0tZml4ZXJzPSN7b3B0aW9ucy5maXhlcnN9XCIgaWYgb3B0aW9ucy5maXhlcnNcbiAgICAgICAgXCItLWNvbmZpZy1maWxlPSN7Y29uZmlnRmlsZX1cIiBpZiBjb25maWdGaWxlXG4gICAgICBdXG4gICAgcnVuT3B0aW9ucyA9IHtcbiAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgIGhlbHA6IHtcbiAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclwiXG4gICAgICB9XG4gICAgfVxuXG4gICAgIyBGaW5kIHBocC1jcy1maXhlci5waGFyIHNjcmlwdFxuICAgIEBQcm9taXNlLmFsbChbXG4gICAgICBAd2hpY2gob3B0aW9ucy5jc19maXhlcl9wYXRoKSBpZiBvcHRpb25zLmNzX2ZpeGVyX3BhdGhcbiAgICAgIEB3aGljaCgncGhwLWNzLWZpeGVyJylcbiAgICBdKS50aGVuKChwYXRocykgPT5cbiAgICAgIEBkZWJ1ZygncGhwLWNzLWZpeGVyIHBhdGhzJywgcGF0aHMpXG4gICAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuICAgICAgIyBHZXQgZmlyc3QgdmFsaWQsIGFic29sdXRlIHBhdGhcbiAgICAgIHBocENTRml4ZXJQYXRoID0gXy5maW5kKHBhdGhzLCAocCkgLT4gcCBhbmQgcGF0aC5pc0Fic29sdXRlKHApIClcbiAgICAgIEB2ZXJib3NlKCdwaHBDU0ZpeGVyUGF0aCcsIHBocENTRml4ZXJQYXRoKVxuICAgICAgQGRlYnVnKCdwaHBDU0ZpeGVyUGF0aCcsIHBocENTRml4ZXJQYXRoLCBwYXRocylcblxuICAgICAgIyBDaGVjayBpZiBQSFAtQ1MtRml4ZXIgcGF0aCB3YXMgZm91bmRcbiAgICAgIGlmIHBocENTRml4ZXJQYXRoP1xuICAgICAgICAjIEZvdW5kIFBIUC1DUy1GaXhlciBwYXRoXG4gICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0KVxuXG4gICAgICAgIGlmIEBpc1dpbmRvd3NcbiAgICAgICAgICBAcnVuKFwicGhwXCIsIFtwaHBDU0ZpeGVyUGF0aCwgcGhwQ3NGaXhlck9wdGlvbnMsIHRlbXBGaWxlXSwgcnVuT3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBydW4ocGhwQ1NGaXhlclBhdGgsIFtwaHBDc0ZpeGVyT3B0aW9ucywgdGVtcEZpbGVdLCBydW5PcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICAgICAgKVxuICAgICAgZWxzZVxuICAgICAgICBAdmVyYm9zZSgncGhwLWNzLWZpeGVyIG5vdCBmb3VuZCEnKVxuICAgICAgICAjIENvdWxkIG5vdCBmaW5kIFBIUC1DUy1GaXhlciBwYXRoXG4gICAgICAgIEBQcm9taXNlLnJlamVjdChAY29tbWFuZE5vdEZvdW5kRXJyb3IoXG4gICAgICAgICAgJ3BocC1jcy1maXhlcidcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXCJcbiAgICAgICAgICAgIHByb2dyYW06IFwicGhwLWNzLWZpeGVyLnBoYXJcIlxuICAgICAgICAgICAgcGF0aE9wdGlvbjogXCJQSFAgLSBDUyBGaXhlciBQYXRoXCJcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgKVxuIl19
