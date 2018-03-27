
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
      PHP: {
        rules: true,
        cs_fixer_path: true,
        cs_fixer_version: true,
        allow_risky: true,
        level: true,
        fixers: true
      }
    };

    PHPCSFixer.prototype.beautify = function(text, language, options, context) {
      var configFile, phpCsFixerOptions, runOptions, version;
      this.debug('php-cs-fixer', options);
      version = options.cs_fixer_version;
      configFile = (context != null) && (context.filePath != null) ? this.findFile(path.dirname(context.filePath), '.php_cs') : void 0;
      phpCsFixerOptions = ["fix", options.rules ? "--rules=" + options.rules : void 0, configFile ? "--config=" + configFile : void 0, options.allow_risky ? "--allow-risky=" + options.allow_risky : void 0, "--using-cache=no"];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3BocC1jcy1maXhlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsNEJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt5QkFFckIsSUFBQSxHQUFNOzt5QkFDTixJQUFBLEdBQU07O3lCQUNOLGNBQUEsR0FBZ0I7O3lCQUVoQixPQUFBLEdBQ0U7TUFBQSxHQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sSUFBUDtRQUNBLGFBQUEsRUFBZSxJQURmO1FBRUEsZ0JBQUEsRUFBa0IsSUFGbEI7UUFHQSxXQUFBLEVBQWEsSUFIYjtRQUlBLEtBQUEsRUFBTyxJQUpQO1FBS0EsTUFBQSxFQUFRLElBTFI7T0FERjs7O3lCQVFGLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCLEVBQTBCLE9BQTFCO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sY0FBUCxFQUF1QixPQUF2QjtNQUNBLE9BQUEsR0FBVSxPQUFPLENBQUM7TUFFbEIsVUFBQSxHQUFnQixpQkFBQSxJQUFhLDBCQUFoQixHQUF1QyxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBTyxDQUFDLFFBQXJCLENBQVYsRUFBMEMsU0FBMUMsQ0FBdkMsR0FBQTtNQUNiLGlCQUFBLEdBQW9CLENBQ2xCLEtBRGtCLEVBRVksT0FBTyxDQUFDLEtBQXRDLEdBQUEsVUFBQSxHQUFXLE9BQU8sQ0FBQyxLQUFuQixHQUFBLE1BRmtCLEVBR1UsVUFBNUIsR0FBQSxXQUFBLEdBQVksVUFBWixHQUFBLE1BSGtCLEVBSXdCLE9BQU8sQ0FBQyxXQUFsRCxHQUFBLGdCQUFBLEdBQWlCLE9BQU8sQ0FBQyxXQUF6QixHQUFBLE1BSmtCLEVBS2xCLGtCQUxrQjtNQU9wQixJQUFHLE9BQUEsS0FBVyxDQUFkO1FBQ0UsaUJBQUEsR0FBb0IsQ0FDbEIsS0FEa0IsRUFFWSxPQUFPLENBQUMsS0FBdEMsR0FBQSxVQUFBLEdBQVcsT0FBTyxDQUFDLEtBQW5CLEdBQUEsTUFGa0IsRUFHYyxPQUFPLENBQUMsTUFBeEMsR0FBQSxXQUFBLEdBQVksT0FBTyxDQUFDLE1BQXBCLEdBQUEsTUFIa0IsRUFJZSxVQUFqQyxHQUFBLGdCQUFBLEdBQWlCLFVBQWpCLEdBQUEsTUFKa0IsRUFEdEI7O01BT0EsVUFBQSxHQUFhO1FBQ1gsZ0JBQUEsRUFBa0IsSUFEUDtRQUVYLElBQUEsRUFBTTtVQUNKLElBQUEsRUFBTSw4Q0FERjtTQUZLOzthQVFiLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLENBQ3NCLE9BQU8sQ0FBQyxhQUF6QyxHQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sT0FBTyxDQUFDLGFBQWYsQ0FBQSxHQUFBLE1BRFcsRUFFWCxJQUFDLENBQUEsS0FBRCxDQUFPLGNBQVAsQ0FGVyxDQUFiLENBR0UsQ0FBQyxJQUhILENBR1EsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7QUFDTixjQUFBO1VBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTyxvQkFBUCxFQUE2QixLQUE3QjtVQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjtVQUVKLGNBQUEsR0FBaUIsQ0FBQyxDQUFDLElBQUYsQ0FBTyxLQUFQLEVBQWMsU0FBQyxDQUFEO21CQUFPLENBQUEsSUFBTSxJQUFJLENBQUMsVUFBTCxDQUFnQixDQUFoQjtVQUFiLENBQWQ7VUFDakIsS0FBQyxDQUFBLE9BQUQsQ0FBUyxnQkFBVCxFQUEyQixjQUEzQjtVQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sZ0JBQVAsRUFBeUIsY0FBekIsRUFBeUMsS0FBekM7VUFHQSxJQUFHLHNCQUFIO1lBRUUsUUFBQSxHQUFXLEtBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQjtZQUVYLElBQUcsS0FBQyxDQUFBLFNBQUo7cUJBQ0UsS0FBQyxDQUFBLEdBQUQsQ0FBSyxLQUFMLEVBQVksQ0FBQyxjQUFELEVBQWlCLGlCQUFqQixFQUFvQyxRQUFwQyxDQUFaLEVBQTJELFVBQTNELENBQ0UsQ0FBQyxJQURILENBQ1EsU0FBQTt1QkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7Y0FESSxDQURSLEVBREY7YUFBQSxNQUFBO3FCQU1FLEtBQUMsQ0FBQSxHQUFELENBQUssY0FBTCxFQUFxQixDQUFDLGlCQUFELEVBQW9CLFFBQXBCLENBQXJCLEVBQW9ELFVBQXBELENBQ0UsQ0FBQyxJQURILENBQ1EsU0FBQTt1QkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7Y0FESSxDQURSLEVBTkY7YUFKRjtXQUFBLE1BQUE7WUFlRSxLQUFDLENBQUEsT0FBRCxDQUFTLHlCQUFUO21CQUVBLEtBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixLQUFDLENBQUEsb0JBQUQsQ0FDZCxjQURjLEVBRWQ7Y0FDRSxJQUFBLEVBQU0sOENBRFI7Y0FFRSxPQUFBLEVBQVMsbUJBRlg7Y0FHRSxVQUFBLEVBQVkscUJBSGQ7YUFGYyxDQUFoQixFQWpCRjs7UUFUTTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIUjtJQTNCUTs7OztLQWY4QjtBQVIxQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5wYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUEhQQ1NGaXhlciBleHRlbmRzIEJlYXV0aWZpZXJcblxuICBuYW1lOiAnUEhQLUNTLUZpeGVyJ1xuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczpcbiAgICBQSFA6XG4gICAgICBydWxlczogdHJ1ZVxuICAgICAgY3NfZml4ZXJfcGF0aDogdHJ1ZVxuICAgICAgY3NfZml4ZXJfdmVyc2lvbjogdHJ1ZVxuICAgICAgYWxsb3dfcmlza3k6IHRydWVcbiAgICAgIGxldmVsOiB0cnVlXG4gICAgICBmaXhlcnM6IHRydWVcblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zLCBjb250ZXh0KSAtPlxuICAgIEBkZWJ1ZygncGhwLWNzLWZpeGVyJywgb3B0aW9ucylcbiAgICB2ZXJzaW9uID0gb3B0aW9ucy5jc19maXhlcl92ZXJzaW9uXG5cbiAgICBjb25maWdGaWxlID0gaWYgY29udGV4dD8gYW5kIGNvbnRleHQuZmlsZVBhdGg/IHRoZW4gQGZpbmRGaWxlKHBhdGguZGlybmFtZShjb250ZXh0LmZpbGVQYXRoKSwgJy5waHBfY3MnKVxuICAgIHBocENzRml4ZXJPcHRpb25zID0gW1xuICAgICAgXCJmaXhcIlxuICAgICAgXCItLXJ1bGVzPSN7b3B0aW9ucy5ydWxlc31cIiBpZiBvcHRpb25zLnJ1bGVzXG4gICAgICBcIi0tY29uZmlnPSN7Y29uZmlnRmlsZX1cIiBpZiBjb25maWdGaWxlXG4gICAgICBcIi0tYWxsb3ctcmlza3k9I3tvcHRpb25zLmFsbG93X3Jpc2t5fVwiIGlmIG9wdGlvbnMuYWxsb3dfcmlza3lcbiAgICAgIFwiLS11c2luZy1jYWNoZT1ub1wiXG4gICAgXVxuICAgIGlmIHZlcnNpb24gaXMgMVxuICAgICAgcGhwQ3NGaXhlck9wdGlvbnMgPSBbXG4gICAgICAgIFwiZml4XCJcbiAgICAgICAgXCItLWxldmVsPSN7b3B0aW9ucy5sZXZlbH1cIiBpZiBvcHRpb25zLmxldmVsXG4gICAgICAgIFwiLS1maXhlcnM9I3tvcHRpb25zLmZpeGVyc31cIiBpZiBvcHRpb25zLmZpeGVyc1xuICAgICAgICBcIi0tY29uZmlnLWZpbGU9I3tjb25maWdGaWxlfVwiIGlmIGNvbmZpZ0ZpbGVcbiAgICAgIF1cbiAgICBydW5PcHRpb25zID0ge1xuICAgICAgaWdub3JlUmV0dXJuQ29kZTogdHJ1ZVxuICAgICAgaGVscDoge1xuICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXCJcbiAgICAgIH1cbiAgICB9XG5cbiAgICAjIEZpbmQgcGhwLWNzLWZpeGVyLnBoYXIgc2NyaXB0XG4gICAgQFByb21pc2UuYWxsKFtcbiAgICAgIEB3aGljaChvcHRpb25zLmNzX2ZpeGVyX3BhdGgpIGlmIG9wdGlvbnMuY3NfZml4ZXJfcGF0aFxuICAgICAgQHdoaWNoKCdwaHAtY3MtZml4ZXInKVxuICAgIF0pLnRoZW4oKHBhdGhzKSA9PlxuICAgICAgQGRlYnVnKCdwaHAtY3MtZml4ZXIgcGF0aHMnLCBwYXRocylcbiAgICAgIF8gPSByZXF1aXJlICdsb2Rhc2gnXG4gICAgICAjIEdldCBmaXJzdCB2YWxpZCwgYWJzb2x1dGUgcGF0aFxuICAgICAgcGhwQ1NGaXhlclBhdGggPSBfLmZpbmQocGF0aHMsIChwKSAtPiBwIGFuZCBwYXRoLmlzQWJzb2x1dGUocCkgKVxuICAgICAgQHZlcmJvc2UoJ3BocENTRml4ZXJQYXRoJywgcGhwQ1NGaXhlclBhdGgpXG4gICAgICBAZGVidWcoJ3BocENTRml4ZXJQYXRoJywgcGhwQ1NGaXhlclBhdGgsIHBhdGhzKVxuXG4gICAgICAjIENoZWNrIGlmIFBIUC1DUy1GaXhlciBwYXRoIHdhcyBmb3VuZFxuICAgICAgaWYgcGhwQ1NGaXhlclBhdGg/XG4gICAgICAgICMgRm91bmQgUEhQLUNTLUZpeGVyIHBhdGhcbiAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXG5cbiAgICAgICAgaWYgQGlzV2luZG93c1xuICAgICAgICAgIEBydW4oXCJwaHBcIiwgW3BocENTRml4ZXJQYXRoLCBwaHBDc0ZpeGVyT3B0aW9ucywgdGVtcEZpbGVdLCBydW5PcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICAgICAgKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHJ1bihwaHBDU0ZpeGVyUGF0aCwgW3BocENzRml4ZXJPcHRpb25zLCB0ZW1wRmlsZV0sIHJ1bk9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbig9PlxuICAgICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgICAgICApXG4gICAgICBlbHNlXG4gICAgICAgIEB2ZXJib3NlKCdwaHAtY3MtZml4ZXIgbm90IGZvdW5kIScpXG4gICAgICAgICMgQ291bGQgbm90IGZpbmQgUEhQLUNTLUZpeGVyIHBhdGhcbiAgICAgICAgQFByb21pc2UucmVqZWN0KEBjb21tYW5kTm90Rm91bmRFcnJvcihcbiAgICAgICAgICAncGhwLWNzLWZpeGVyJ1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcIlxuICAgICAgICAgICAgcHJvZ3JhbTogXCJwaHAtY3MtZml4ZXIucGhhclwiXG4gICAgICAgICAgICBwYXRoT3B0aW9uOiBcIlBIUCAtIENTIEZpeGVyIFBhdGhcIlxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICApXG4iXX0=
