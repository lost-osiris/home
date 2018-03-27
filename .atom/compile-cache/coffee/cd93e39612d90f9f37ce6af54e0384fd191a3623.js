
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
        cs_fixer_config_file: true,
        allow_risky: true,
        level: true,
        fixers: true
      }
    };

    PHPCSFixer.prototype.beautify = function(text, language, options, context) {
      var configFiles, phpCsFixerOptions, runOptions, version;
      this.debug('php-cs-fixer', options);
      version = options.cs_fixer_version;
      configFiles = ['.php_cs', '.php_cs.dist'];
      if (!options.cs_fixer_config_file) {
        options.cs_fixer_config_file = (context != null) && (context.filePath != null) ? this.findFile(path.dirname(context.filePath), configFiles) : void 0;
      }
      if (!options.cs_fixer_config_file) {
        options.cs_fixer_config_file = this.findFile(atom.project.getPaths()[0], configFiles);
      }
      phpCsFixerOptions = ["fix", options.rules ? "--rules=" + options.rules : void 0, options.cs_fixer_config_file ? "--config=" + options.cs_fixer_config_file : void 0, options.allow_risky ? "--allow-risky=" + options.allow_risky : void 0, "--using-cache=no"];
      if (version === 1) {
        phpCsFixerOptions = ["fix", options.level ? "--level=" + options.level : void 0, options.fixers ? "--fixers=" + options.fixers : void 0, options.cs_fixer_config_file ? "--config-file=" + options.cs_fixer_config_file : void 0];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3BocC1jcy1maXhlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsNEJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt5QkFFckIsSUFBQSxHQUFNOzt5QkFDTixJQUFBLEdBQU07O3lCQUNOLGNBQUEsR0FBZ0I7O3lCQUVoQixPQUFBLEdBQ0U7TUFBQSxHQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sSUFBUDtRQUNBLGFBQUEsRUFBZSxJQURmO1FBRUEsZ0JBQUEsRUFBa0IsSUFGbEI7UUFHQSxvQkFBQSxFQUFzQixJQUh0QjtRQUlBLFdBQUEsRUFBYSxJQUpiO1FBS0EsS0FBQSxFQUFPLElBTFA7UUFNQSxNQUFBLEVBQVEsSUFOUjtPQURGOzs7eUJBU0YsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsRUFBMEIsT0FBMUI7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxjQUFQLEVBQXVCLE9BQXZCO01BQ0EsT0FBQSxHQUFVLE9BQU8sQ0FBQztNQUNsQixXQUFBLEdBQWMsQ0FBQyxTQUFELEVBQVksY0FBWjtNQUdkLElBQUcsQ0FBSSxPQUFPLENBQUMsb0JBQWY7UUFDRSxPQUFPLENBQUMsb0JBQVIsR0FBa0MsaUJBQUEsSUFBYSwwQkFBaEIsR0FBdUMsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFJLENBQUMsT0FBTCxDQUFhLE9BQU8sQ0FBQyxRQUFyQixDQUFWLEVBQTBDLFdBQTFDLENBQXZDLEdBQUEsT0FEakM7O01BSUEsSUFBRyxDQUFJLE9BQU8sQ0FBQyxv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QUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIUjtJQW5DUTs7OztLQWhCOEI7QUFSMUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBIUENTRml4ZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXG5cbiAgbmFtZTogJ1BIUC1DUy1GaXhlcidcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6XG4gICAgUEhQOlxuICAgICAgcnVsZXM6IHRydWVcbiAgICAgIGNzX2ZpeGVyX3BhdGg6IHRydWVcbiAgICAgIGNzX2ZpeGVyX3ZlcnNpb246IHRydWVcbiAgICAgIGNzX2ZpeGVyX2NvbmZpZ19maWxlOiB0cnVlXG4gICAgICBhbGxvd19yaXNreTogdHJ1ZVxuICAgICAgbGV2ZWw6IHRydWVcbiAgICAgIGZpeGVyczogdHJ1ZVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMsIGNvbnRleHQpIC0+XG4gICAgQGRlYnVnKCdwaHAtY3MtZml4ZXInLCBvcHRpb25zKVxuICAgIHZlcnNpb24gPSBvcHRpb25zLmNzX2ZpeGVyX3ZlcnNpb25cbiAgICBjb25maWdGaWxlcyA9IFsnLnBocF9jcycsICcucGhwX2NzLmRpc3QnXVxuXG4gICAgIyBGaW5kIGEgY29uZmlnIGZpbGUgaW4gdGhlIHdvcmtpbmcgZGlyZWN0b3J5IGlmIGEgY3VzdG9tIG9uZSB3YXMgbm90IHByb3ZpZGVkXG4gICAgaWYgbm90IG9wdGlvbnMuY3NfZml4ZXJfY29uZmlnX2ZpbGVcbiAgICAgIG9wdGlvbnMuY3NfZml4ZXJfY29uZmlnX2ZpbGUgPSBpZiBjb250ZXh0PyBhbmQgY29udGV4dC5maWxlUGF0aD8gdGhlbiBAZmluZEZpbGUocGF0aC5kaXJuYW1lKGNvbnRleHQuZmlsZVBhdGgpLCBjb25maWdGaWxlcylcblxuICAgICMgVHJ5IGFnYWluIHRvIGZpbmQgYSBjb25maWcgZmlsZSBpbiB0aGUgcHJvamVjdCByb290XG4gICAgaWYgbm90IG9wdGlvbnMuY3NfZml4ZXJfY29uZmlnX2ZpbGVcbiAgICAgIG9wdGlvbnMuY3NfZml4ZXJfY29uZmlnX2ZpbGUgPSBAZmluZEZpbGUoYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF0sIGNvbmZpZ0ZpbGVzKVxuXG4gICAgcGhwQ3NGaXhlck9wdGlvbnMgPSBbXG4gICAgICBcImZpeFwiXG4gICAgICBcIi0tcnVsZXM9I3tvcHRpb25zLnJ1bGVzfVwiIGlmIG9wdGlvbnMucnVsZXNcbiAgICAgIFwiLS1jb25maWc9I3tvcHRpb25zLmNzX2ZpeGVyX2NvbmZpZ19maWxlfVwiIGlmIG9wdGlvbnMuY3NfZml4ZXJfY29uZmlnX2ZpbGVcbiAgICAgIFwiLS1hbGxvdy1yaXNreT0je29wdGlvbnMuYWxsb3dfcmlza3l9XCIgaWYgb3B0aW9ucy5hbGxvd19yaXNreVxuICAgICAgXCItLXVzaW5nLWNhY2hlPW5vXCJcbiAgICBdXG4gICAgaWYgdmVyc2lvbiBpcyAxXG4gICAgICBwaHBDc0ZpeGVyT3B0aW9ucyA9IFtcbiAgICAgICAgXCJmaXhcIlxuICAgICAgICBcIi0tbGV2ZWw9I3tvcHRpb25zLmxldmVsfVwiIGlmIG9wdGlvbnMubGV2ZWxcbiAgICAgICAgXCItLWZpeGVycz0je29wdGlvbnMuZml4ZXJzfVwiIGlmIG9wdGlvbnMuZml4ZXJzXG4gICAgICAgIFwiLS1jb25maWctZmlsZT0je29wdGlvbnMuY3NfZml4ZXJfY29uZmlnX2ZpbGV9XCIgaWYgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZVxuICAgICAgXVxuICAgIHJ1bk9wdGlvbnMgPSB7XG4gICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlXG4gICAgICBoZWxwOiB7XG4gICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcIlxuICAgICAgfVxuICAgIH1cblxuICAgICMgRmluZCBwaHAtY3MtZml4ZXIucGhhciBzY3JpcHRcbiAgICBAUHJvbWlzZS5hbGwoW1xuICAgICAgQHdoaWNoKG9wdGlvbnMuY3NfZml4ZXJfcGF0aCkgaWYgb3B0aW9ucy5jc19maXhlcl9wYXRoXG4gICAgICBAd2hpY2goJ3BocC1jcy1maXhlcicpXG4gICAgXSkudGhlbigocGF0aHMpID0+XG4gICAgICBAZGVidWcoJ3BocC1jcy1maXhlciBwYXRocycsIHBhdGhzKVxuICAgICAgXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbiAgICAgICMgR2V0IGZpcnN0IHZhbGlkLCBhYnNvbHV0ZSBwYXRoXG4gICAgICBwaHBDU0ZpeGVyUGF0aCA9IF8uZmluZChwYXRocywgKHApIC0+IHAgYW5kIHBhdGguaXNBYnNvbHV0ZShwKSApXG4gICAgICBAdmVyYm9zZSgncGhwQ1NGaXhlclBhdGgnLCBwaHBDU0ZpeGVyUGF0aClcbiAgICAgIEBkZWJ1ZygncGhwQ1NGaXhlclBhdGgnLCBwaHBDU0ZpeGVyUGF0aCwgcGF0aHMpXG5cbiAgICAgICMgQ2hlY2sgaWYgUEhQLUNTLUZpeGVyIHBhdGggd2FzIGZvdW5kXG4gICAgICBpZiBwaHBDU0ZpeGVyUGF0aD9cbiAgICAgICAgIyBGb3VuZCBQSFAtQ1MtRml4ZXIgcGF0aFxuICAgICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dClcblxuICAgICAgICBpZiBAaXNXaW5kb3dzXG4gICAgICAgICAgQHJ1bihcInBocFwiLCBbcGhwQ1NGaXhlclBhdGgsIHBocENzRml4ZXJPcHRpb25zLCB0ZW1wRmlsZV0sIHJ1bk9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbig9PlxuICAgICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAcnVuKHBocENTRml4ZXJQYXRoLCBbcGhwQ3NGaXhlck9wdGlvbnMsIHRlbXBGaWxlXSwgcnVuT3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICAgIClcbiAgICAgIGVsc2VcbiAgICAgICAgQHZlcmJvc2UoJ3BocC1jcy1maXhlciBub3QgZm91bmQhJylcbiAgICAgICAgIyBDb3VsZCBub3QgZmluZCBQSFAtQ1MtRml4ZXIgcGF0aFxuICAgICAgICBAUHJvbWlzZS5yZWplY3QoQGNvbW1hbmROb3RGb3VuZEVycm9yKFxuICAgICAgICAgICdwaHAtY3MtZml4ZXInXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclwiXG4gICAgICAgICAgICBwcm9ncmFtOiBcInBocC1jcy1maXhlci5waGFyXCJcbiAgICAgICAgICAgIHBhdGhPcHRpb246IFwiUEhQIC0gQ1MgRml4ZXIgUGF0aFwiXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgIClcbiJdfQ==
