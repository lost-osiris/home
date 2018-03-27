(function() {
  "use strict";
  var Beautifier, LatexBeautify, fs, path, temp,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  fs = require("fs");

  temp = require("temp").track();

  module.exports = LatexBeautify = (function(superClass) {
    extend(LatexBeautify, superClass);

    function LatexBeautify() {
      return LatexBeautify.__super__.constructor.apply(this, arguments);
    }

    LatexBeautify.prototype.name = "Latex Beautify";

    LatexBeautify.prototype.link = "https://github.com/cmhughes/latexindent.pl";

    LatexBeautify.prototype.options = {
      LaTeX: true
    };

    LatexBeautify.prototype.buildConfigFile = function(options) {
      var config, delim, i, indentChar, len, ref;
      indentChar = options.indent_char;
      if (options.indent_with_tabs) {
        indentChar = "\\t";
      }
      config = "defaultIndent: \"" + indentChar + "\"\nalwaysLookforSplitBraces: " + (+options.always_look_for_split_braces) + "\nalwaysLookforSplitBrackets: " + (+options.always_look_for_split_brackets) + "\nindentPreamble: " + (+options.indent_preamble) + "\nremoveTrailingWhitespace: " + (+options.remove_trailing_whitespace) + "\nlookForAlignDelims:\n";
      ref = options.align_columns_in_environments;
      for (i = 0, len = ref.length; i < len; i++) {
        delim = ref[i];
        config += "\t" + delim + ": 1\n";
      }
      return config;
    };

    LatexBeautify.prototype.setUpDir = function(dirPath, text, config) {
      this.texFile = path.join(dirPath, "latex.tex");
      fs.writeFile(this.texFile, text, function(err) {
        if (err) {
          return reject(err);
        }
      });
      this.configFile = path.join(dirPath, "localSettings.yaml");
      fs.writeFile(this.configFile, config, function(err) {
        if (err) {
          return reject(err);
        }
      });
      this.logFile = path.join(dirPath, "indent.log");
      return fs.writeFile(this.logFile, "", function(err) {
        if (err) {
          return reject(err);
        }
      });
    };

    LatexBeautify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        return temp.mkdir("latex", function(err, dirPath) {
          if (err) {
            return reject(err);
          }
          return resolve(dirPath);
        });
      }).then((function(_this) {
        return function(dirPath) {
          var run;
          _this.setUpDir(dirPath, text, _this.buildConfigFile(options));
          return run = _this.run("latexindent", ["-o", "-s", "-l", "-c=" + dirPath, _this.texFile, _this.texFile], {
            help: {
              link: "https://github.com/cmhughes/latexindent.pl"
            }
          });
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.readFile(_this.texFile);
        };
      })(this));
    };

    return LatexBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2xhdGV4LWJlYXV0aWZ5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSx5Q0FBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLEtBQWhCLENBQUE7O0VBR1AsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7NEJBQ3JCLElBQUEsR0FBTTs7NEJBQ04sSUFBQSxHQUFNOzs0QkFFTixPQUFBLEdBQVM7TUFDUCxLQUFBLEVBQU8sSUFEQTs7OzRCQU1ULGVBQUEsR0FBaUIsU0FBQyxPQUFEO0FBQ2YsVUFBQTtNQUFBLFVBQUEsR0FBYSxPQUFPLENBQUM7TUFDckIsSUFBRyxPQUFPLENBQUMsZ0JBQVg7UUFDRSxVQUFBLEdBQWEsTUFEZjs7TUFHQSxNQUFBLEdBQVMsbUJBQUEsR0FDbUIsVUFEbkIsR0FDOEIsZ0NBRDlCLEdBRTJCLENBQUMsQ0FBQyxPQUFPLENBQUMsNEJBQVYsQ0FGM0IsR0FFa0UsZ0NBRmxFLEdBRzZCLENBQUMsQ0FBQyxPQUFPLENBQUMsOEJBQVYsQ0FIN0IsR0FHc0Usb0JBSHRFLEdBSWlCLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBVixDQUpqQixHQUkyQyw4QkFKM0MsR0FLMkIsQ0FBQyxDQUFDLE9BQU8sQ0FBQywwQkFBVixDQUwzQixHQUtnRTtBQUd6RTtBQUFBLFdBQUEscUNBQUE7O1FBQ0UsTUFBQSxJQUFVLElBQUEsR0FBSyxLQUFMLEdBQVc7QUFEdkI7QUFFQSxhQUFPO0lBZlE7OzRCQXFCakIsUUFBQSxHQUFVLFNBQUMsT0FBRCxFQUFVLElBQVYsRUFBZ0IsTUFBaEI7TUFDUixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixXQUFuQjtNQUNYLEVBQUUsQ0FBQyxTQUFILENBQWEsSUFBQyxDQUFBLE9BQWQsRUFBdUIsSUFBdkIsRUFBNkIsU0FBQyxHQUFEO1FBQzNCLElBQXNCLEdBQXRCO0FBQUEsaUJBQU8sTUFBQSxDQUFPLEdBQVAsRUFBUDs7TUFEMkIsQ0FBN0I7TUFFQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixvQkFBbkI7TUFDZCxFQUFFLENBQUMsU0FBSCxDQUFhLElBQUMsQ0FBQSxVQUFkLEVBQTBCLE1BQTFCLEVBQWtDLFNBQUMsR0FBRDtRQUNoQyxJQUFzQixHQUF0QjtBQUFBLGlCQUFPLE1BQUEsQ0FBTyxHQUFQLEVBQVA7O01BRGdDLENBQWxDO01BRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsWUFBbkI7YUFDWCxFQUFFLENBQUMsU0FBSCxDQUFhLElBQUMsQ0FBQSxPQUFkLEVBQXVCLEVBQXZCLEVBQTJCLFNBQUMsR0FBRDtRQUN6QixJQUFzQixHQUF0QjtBQUFBLGlCQUFPLE1BQUEsQ0FBTyxHQUFQLEVBQVA7O01BRHlCLENBQTNCO0lBUlE7OzRCQVlWLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO2FBQ0osSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVY7ZUFDWCxJQUFJLENBQUMsS0FBTCxDQUFXLE9BQVgsRUFBb0IsU0FBQyxHQUFELEVBQU0sT0FBTjtVQUNsQixJQUFzQixHQUF0QjtBQUFBLG1CQUFPLE1BQUEsQ0FBTyxHQUFQLEVBQVA7O2lCQUNBLE9BQUEsQ0FBUSxPQUFSO1FBRmtCLENBQXBCO01BRFcsQ0FBVCxDQU1KLENBQUMsSUFORyxDQU1FLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFEO0FBQ0osY0FBQTtVQUFBLEtBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixFQUF5QixLQUFDLENBQUEsZUFBRCxDQUFpQixPQUFqQixDQUF6QjtpQkFDQSxHQUFBLEdBQU0sS0FBQyxDQUFBLEdBQUQsQ0FBSyxhQUFMLEVBQW9CLENBQ3hCLElBRHdCLEVBRXhCLElBRndCLEVBR3hCLElBSHdCLEVBSXhCLEtBQUEsR0FBUSxPQUpnQixFQUt4QixLQUFDLENBQUEsT0FMdUIsRUFNeEIsS0FBQyxDQUFBLE9BTnVCLENBQXBCLEVBT0g7WUFBQSxJQUFBLEVBQU07Y0FDUCxJQUFBLEVBQU0sNENBREM7YUFBTjtXQVBHO1FBRkY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTkYsQ0FtQkosQ0FBQyxJQW5CRyxDQW1CRyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ0wsS0FBQyxDQUFBLFFBQUQsQ0FBVSxLQUFDLENBQUEsT0FBWDtRQURLO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQW5CSDtJQURJOzs7O0tBM0NpQztBQVA3QyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcbmZzID0gcmVxdWlyZShcImZzXCIpXG50ZW1wID0gcmVxdWlyZShcInRlbXBcIikudHJhY2soKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTGF0ZXhCZWF1dGlmeSBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJMYXRleCBCZWF1dGlmeVwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2NtaHVnaGVzL2xhdGV4aW5kZW50LnBsXCJcblxuICBvcHRpb25zOiB7XG4gICAgTGFUZVg6IHRydWVcbiAgfVxuXG4gICMgVGhlcmUgYXJlIHRvbyBtYW55IG9wdGlvbnMgd2l0aCBsYXRleG1rLCBJIGhhdmUgdHJpZWQgdG8gc2xpbSB0aGlzIGRvd24gdG8gdGhlIG1vc3QgdXNlZnVsIG9uZXMuXG4gICMgVGhpcyBtZXRob2QgY3JlYXRlcyBhIGNvbmZpZ3VyYXRpb24gZmlsZSBmb3IgbGF0ZXhpbmRlbnQuXG4gIGJ1aWxkQ29uZmlnRmlsZTogKG9wdGlvbnMpIC0+XG4gICAgaW5kZW50Q2hhciA9IG9wdGlvbnMuaW5kZW50X2NoYXJcbiAgICBpZiBvcHRpb25zLmluZGVudF93aXRoX3RhYnNcbiAgICAgIGluZGVudENoYXIgPSBcIlxcXFx0XCJcbiAgICAjICt0cnVlID0gMSBhbmQgK2ZhbHNlID0gMFxuICAgIGNvbmZpZyA9IFwiXCJcIlxuICAgICAgICAgICAgIGRlZmF1bHRJbmRlbnQ6IFxcXCIje2luZGVudENoYXJ9XFxcIlxuICAgICAgICAgICAgIGFsd2F5c0xvb2tmb3JTcGxpdEJyYWNlczogI3srb3B0aW9ucy5hbHdheXNfbG9va19mb3Jfc3BsaXRfYnJhY2VzfVxuICAgICAgICAgICAgIGFsd2F5c0xvb2tmb3JTcGxpdEJyYWNrZXRzOiAjeytvcHRpb25zLmFsd2F5c19sb29rX2Zvcl9zcGxpdF9icmFja2V0c31cbiAgICAgICAgICAgICBpbmRlbnRQcmVhbWJsZTogI3srb3B0aW9ucy5pbmRlbnRfcHJlYW1ibGV9XG4gICAgICAgICAgICAgcmVtb3ZlVHJhaWxpbmdXaGl0ZXNwYWNlOiAjeytvcHRpb25zLnJlbW92ZV90cmFpbGluZ193aGl0ZXNwYWNlfVxuICAgICAgICAgICAgIGxvb2tGb3JBbGlnbkRlbGltczpcXG5cbiAgICAgICAgICAgICBcIlwiXCJcbiAgICBmb3IgZGVsaW0gaW4gb3B0aW9ucy5hbGlnbl9jb2x1bW5zX2luX2Vudmlyb25tZW50c1xuICAgICAgY29uZmlnICs9IFwiXFx0I3tkZWxpbX06IDFcXG5cIlxuICAgIHJldHVybiBjb25maWdcblxuICAjIExhdGV4aW5kZW50IGFjY2VwdHMgY29uZmlndXJhdGlvbiBfZmlsZXNfIG9ubHkuXG4gICMgVGhpcyBmaWxlIGhhcyB0byBiZSBuYW1lZCBsb2NhbFNldHRpbmdzLnlhbWwgYW5kIGJlIGluIHRoZSBzYW1lIGZvbGRlciBhcyB0aGUgdGV4IGZpbGUuXG4gICMgSXQgYWxzbyBpbnNpc3RzIG9uIGNyZWF0aW5nIGEgbG9nIGZpbGUgc29tZXdoZXJlLlxuICAjIFNvIHdlIHNldCB1cCBhIGRpcmVjdG9yeSB3aXRoIGFsbCB0aGUgZmlsZXMgaW4gcGxhY2UuXG4gIHNldFVwRGlyOiAoZGlyUGF0aCwgdGV4dCwgY29uZmlnKSAtPlxuICAgIEB0ZXhGaWxlID0gcGF0aC5qb2luKGRpclBhdGgsIFwibGF0ZXgudGV4XCIpXG4gICAgZnMud3JpdGVGaWxlIEB0ZXhGaWxlLCB0ZXh0LCAoZXJyKSAtPlxuICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxuICAgIEBjb25maWdGaWxlID0gcGF0aC5qb2luKGRpclBhdGgsIFwibG9jYWxTZXR0aW5ncy55YW1sXCIpXG4gICAgZnMud3JpdGVGaWxlIEBjb25maWdGaWxlLCBjb25maWcsIChlcnIpIC0+XG4gICAgICByZXR1cm4gcmVqZWN0KGVycikgaWYgZXJyXG4gICAgQGxvZ0ZpbGUgPSBwYXRoLmpvaW4oZGlyUGF0aCwgXCJpbmRlbnQubG9nXCIpXG4gICAgZnMud3JpdGVGaWxlIEBsb2dGaWxlLCBcIlwiLCAoZXJyKSAtPlxuICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxuXG4gICNCZWF1dGlmaWVyIGRvZXMgbm90IGN1cnJlbnRseSBoYXZlIGEgbWV0aG9kIGZvciBjcmVhdGluZyBkaXJlY3Rvcmllcywgc28gd2UgY2FsbCB0ZW1wIGRpcmVjdGx5LlxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgdGVtcC5ta2RpcihcImxhdGV4XCIsIChlcnIsIGRpclBhdGgpIC0+XG4gICAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcbiAgICAgICAgcmVzb2x2ZShkaXJQYXRoKVxuICAgICAgKVxuICAgIClcbiAgICAudGhlbigoZGlyUGF0aCk9PlxuICAgICAgQHNldFVwRGlyKGRpclBhdGgsIHRleHQsIEBidWlsZENvbmZpZ0ZpbGUob3B0aW9ucykpXG4gICAgICBydW4gPSBAcnVuIFwibGF0ZXhpbmRlbnRcIiwgW1xuICAgICAgICBcIi1vXCIgICAgICAgICAgICAjT3V0cHV0IHRvIHRoZSBzYW1lIGxvY2F0aW9uIGFzIGZpbGUsIC13IGNyZWF0ZXMgYSBiYWNrdXAgZmlsZSwgd2hlcmVhcyB0aGlzIGRvZXMgbm90XG4gICAgICAgIFwiLXNcIiAgICAgICAgICAgICNTaWxlbnQgbW9kZVxuICAgICAgICBcIi1sXCIgICAgICAgICAgICAjVGVsbCBsYXRleGluZGVudCB3ZSBoYXZlIGEgbG9jYWwgY29uZmlndXJhdGlvbiBmaWxlXG4gICAgICAgIFwiLWM9XCIgKyBkaXJQYXRoICNUZWxsIGxhdGV4aW5kZW50IHRvIHBsYWNlIHRoZSBsb2cgZmlsZSBpbiB0aGlzIGRpcmVjdG9yeVxuICAgICAgICBAdGV4RmlsZVxuICAgICAgICBAdGV4RmlsZVxuICAgICAgXSwgaGVscDoge1xuICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9jbWh1Z2hlcy9sYXRleGluZGVudC5wbFwiXG4gICAgICB9XG4gICAgKVxuICAgIC50aGVuKCA9PlxuICAgICAgQHJlYWRGaWxlKEB0ZXhGaWxlKVxuICAgIClcbiJdfQ==
