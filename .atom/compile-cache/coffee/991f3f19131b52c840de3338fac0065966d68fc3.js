(function() {
  "use strict";
  var Beautifier, VueBeautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = VueBeautifier = (function(superClass) {
    extend(VueBeautifier, superClass);

    function VueBeautifier() {
      return VueBeautifier.__super__.constructor.apply(this, arguments);
    }

    VueBeautifier.prototype.name = "Vue Beautifier";

    VueBeautifier.prototype.link = "https://github.com/Glavin001/atom-beautify/blob/master/src/beautifiers/vue-beautifier.coffee";

    VueBeautifier.prototype.options = {
      Vue: true
    };

    VueBeautifier.prototype.beautify = function(text, language, options) {
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var _, prettydiff, regexp, results;
          prettydiff = require("prettydiff");
          _ = require('lodash');
          regexp = /(^<(template|script|style)[^>]*>)((\s|\S)*?)^<\/\2>/gim;
          results = text.replace(regexp, function(match, begin, type, text) {
            var beautifiedText, lang, ref, replaceText, result;
            lang = (ref = /lang\s*=\s*['"](\w+)["']/.exec(begin)) != null ? ref[1] : void 0;
            replaceText = text;
            text = text.trim();
            beautifiedText = ((function() {
              switch (type) {
                case "template":
                  switch (lang) {
                    case "pug":
                    case "jade":
                      return require("pug-beautify")(text, options);
                    case void 0:
                      return require("js-beautify").html(text, options);
                    default:
                      return void 0;
                  }
                  break;
                case "script":
                  return require("js-beautify")(text, options);
                case "style":
                  switch (lang) {
                    case "scss":
                      options = _.merge(options, {
                        source: text,
                        lang: "scss",
                        mode: "beautify"
                      });
                      return prettydiff.api(options)[0];
                    case "less":
                      options = _.merge(options, {
                        source: text,
                        lang: "less",
                        mode: "beautify"
                      });
                      return prettydiff.api(options)[0];
                    case void 0:
                      return require("js-beautify").css(text, options);
                    default:
                      return void 0;
                  }
              }
            })());
            result = beautifiedText ? match.replace(replaceText, "\n" + (beautifiedText.trim()) + "\n") : match;
            _this.verbose("Vue part", match, begin, type, text, lang, result);
            return result;
          });
          _this.verbose("Vue final results", results);
          return resolve(results);
        };
      })(this));
    };

    return VueBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3Z1ZS1iZWF1dGlmaWVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSx5QkFBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7NEJBQ3JCLElBQUEsR0FBTTs7NEJBQ04sSUFBQSxHQUFNOzs0QkFFTixPQUFBLEdBQ0U7TUFBQSxHQUFBLEVBQUssSUFBTDs7OzRCQUVGLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ2xCLGNBQUE7VUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVI7VUFDYixDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7VUFDSixNQUFBLEdBQVM7VUFFVCxPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxNQUFiLEVBQXFCLFNBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxJQUFmLEVBQXFCLElBQXJCO0FBQzdCLGdCQUFBO1lBQUEsSUFBQSwrREFBK0MsQ0FBQSxDQUFBO1lBQy9DLFdBQUEsR0FBYztZQUNkLElBQUEsR0FBTyxJQUFJLENBQUMsSUFBTCxDQUFBO1lBQ1AsY0FBQSxHQUFpQjtBQUFDLHNCQUFPLElBQVA7QUFBQSxxQkFDWCxVQURXO0FBRWQsMEJBQU8sSUFBUDtBQUFBLHlCQUNPLEtBRFA7QUFBQSx5QkFDYyxNQURkOzZCQUVJLE9BQUEsQ0FBUSxjQUFSLENBQUEsQ0FBd0IsSUFBeEIsRUFBOEIsT0FBOUI7QUFGSix5QkFHTyxNQUhQOzZCQUlJLE9BQUEsQ0FBUSxhQUFSLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsSUFBNUIsRUFBa0MsT0FBbEM7QUFKSjs2QkFNSTtBQU5KO0FBREc7QUFEVyxxQkFTWCxRQVRXO3lCQVVkLE9BQUEsQ0FBUSxhQUFSLENBQUEsQ0FBdUIsSUFBdkIsRUFBNkIsT0FBN0I7QUFWYyxxQkFXWCxPQVhXO0FBWWQsMEJBQU8sSUFBUDtBQUFBLHlCQUNPLE1BRFA7c0JBRUksT0FBQSxHQUFVLENBQUMsQ0FBQyxLQUFGLENBQVEsT0FBUixFQUNSO3dCQUFBLE1BQUEsRUFBUSxJQUFSO3dCQUNBLElBQUEsRUFBTSxNQUROO3dCQUVBLElBQUEsRUFBTSxVQUZOO3VCQURROzZCQUtWLFVBQVUsQ0FBQyxHQUFYLENBQWUsT0FBZixDQUF3QixDQUFBLENBQUE7QUFQNUIseUJBUU8sTUFSUDtzQkFTSSxPQUFBLEdBQVUsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxPQUFSLEVBQ1I7d0JBQUEsTUFBQSxFQUFRLElBQVI7d0JBQ0EsSUFBQSxFQUFNLE1BRE47d0JBRUEsSUFBQSxFQUFNLFVBRk47dUJBRFE7NkJBS1YsVUFBVSxDQUFDLEdBQVgsQ0FBZSxPQUFmLENBQXdCLENBQUEsQ0FBQTtBQWQ1Qix5QkFlTyxNQWZQOzZCQWdCSSxPQUFBLENBQVEsYUFBUixDQUFzQixDQUFDLEdBQXZCLENBQTJCLElBQTNCLEVBQWlDLE9BQWpDO0FBaEJKOzZCQWtCSTtBQWxCSjtBQVpjO2dCQUFEO1lBZ0NqQixNQUFBLEdBQVksY0FBSCxHQUF1QixLQUFLLENBQUMsT0FBTixDQUFjLFdBQWQsRUFBMkIsSUFBQSxHQUFJLENBQUMsY0FBYyxDQUFDLElBQWYsQ0FBQSxDQUFELENBQUosR0FBMkIsSUFBdEQsQ0FBdkIsR0FBdUY7WUFDaEcsS0FBQyxDQUFBLE9BQUQsQ0FBUyxVQUFULEVBQXFCLEtBQXJCLEVBQTRCLEtBQTVCLEVBQW1DLElBQW5DLEVBQXlDLElBQXpDLEVBQStDLElBQS9DLEVBQXFELE1BQXJEO0FBQ0EsbUJBQU87VUF0Q3NCLENBQXJCO1VBd0NWLEtBQUMsQ0FBQSxPQUFELENBQVMsbUJBQVQsRUFBOEIsT0FBOUI7aUJBQ0EsT0FBQSxDQUFRLE9BQVI7UUE5Q2tCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO0lBREg7Ozs7S0FQaUM7QUFIN0MiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVnVlQmVhdXRpZmllciBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJWdWUgQmVhdXRpZmllclwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0dsYXZpbjAwMS9hdG9tLWJlYXV0aWZ5L2Jsb2IvbWFzdGVyL3NyYy9iZWF1dGlmaWVycy92dWUtYmVhdXRpZmllci5jb2ZmZWVcIlxuXG4gIG9wdGlvbnM6XG4gICAgVnVlOiB0cnVlXG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBwcmV0dHlkaWZmID0gcmVxdWlyZShcInByZXR0eWRpZmZcIilcbiAgICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuICAgICAgcmVnZXhwID0gLyhePCh0ZW1wbGF0ZXxzY3JpcHR8c3R5bGUpW14+XSo+KSgoXFxzfFxcUykqPylePFxcL1xcMj4vZ2ltXG5cbiAgICAgIHJlc3VsdHMgPSB0ZXh0LnJlcGxhY2UocmVnZXhwLCAobWF0Y2gsIGJlZ2luLCB0eXBlLCB0ZXh0KSA9PlxuICAgICAgICBsYW5nID0gL2xhbmdcXHMqPVxccypbJ1wiXShcXHcrKVtcIiddLy5leGVjKGJlZ2luKT9bMV1cbiAgICAgICAgcmVwbGFjZVRleHQgPSB0ZXh0XG4gICAgICAgIHRleHQgPSB0ZXh0LnRyaW0oKVxuICAgICAgICBiZWF1dGlmaWVkVGV4dCA9IChzd2l0Y2ggdHlwZVxuICAgICAgICAgIHdoZW4gXCJ0ZW1wbGF0ZVwiXG4gICAgICAgICAgICBzd2l0Y2ggbGFuZ1xuICAgICAgICAgICAgICB3aGVuIFwicHVnXCIsIFwiamFkZVwiXG4gICAgICAgICAgICAgICAgcmVxdWlyZShcInB1Zy1iZWF1dGlmeVwiKSh0ZXh0LCBvcHRpb25zKVxuICAgICAgICAgICAgICB3aGVuIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIHJlcXVpcmUoXCJqcy1iZWF1dGlmeVwiKS5odG1sKHRleHQsIG9wdGlvbnMpXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB1bmRlZmluZWRcbiAgICAgICAgICB3aGVuIFwic2NyaXB0XCJcbiAgICAgICAgICAgIHJlcXVpcmUoXCJqcy1iZWF1dGlmeVwiKSh0ZXh0LCBvcHRpb25zKVxuICAgICAgICAgIHdoZW4gXCJzdHlsZVwiXG4gICAgICAgICAgICBzd2l0Y2ggbGFuZ1xuICAgICAgICAgICAgICB3aGVuIFwic2Nzc1wiXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IF8ubWVyZ2Uob3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGV4dFxuICAgICAgICAgICAgICAgICAgbGFuZzogXCJzY3NzXCJcbiAgICAgICAgICAgICAgICAgIG1vZGU6IFwiYmVhdXRpZnlcIlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBwcmV0dHlkaWZmLmFwaShvcHRpb25zKVswXVxuICAgICAgICAgICAgICB3aGVuIFwibGVzc1wiXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IF8ubWVyZ2Uob3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGV4dFxuICAgICAgICAgICAgICAgICAgbGFuZzogXCJsZXNzXCJcbiAgICAgICAgICAgICAgICAgIG1vZGU6IFwiYmVhdXRpZnlcIlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBwcmV0dHlkaWZmLmFwaShvcHRpb25zKVswXVxuICAgICAgICAgICAgICB3aGVuIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIHJlcXVpcmUoXCJqcy1iZWF1dGlmeVwiKS5jc3ModGV4dCwgb3B0aW9ucylcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZFxuICAgICAgICApXG4gICAgICAgIHJlc3VsdCA9IGlmIGJlYXV0aWZpZWRUZXh0IHRoZW4gbWF0Y2gucmVwbGFjZShyZXBsYWNlVGV4dCwgXCJcXG4je2JlYXV0aWZpZWRUZXh0LnRyaW0oKX1cXG5cIikgZWxzZSBtYXRjaFxuICAgICAgICBAdmVyYm9zZShcIlZ1ZSBwYXJ0XCIsIG1hdGNoLCBiZWdpbiwgdHlwZSwgdGV4dCwgbGFuZywgcmVzdWx0KVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICApXG4gICAgICBAdmVyYm9zZShcIlZ1ZSBmaW5hbCByZXN1bHRzXCIsIHJlc3VsdHMpXG4gICAgICByZXNvbHZlKHJlc3VsdHMpXG4gICAgKVxuIl19
