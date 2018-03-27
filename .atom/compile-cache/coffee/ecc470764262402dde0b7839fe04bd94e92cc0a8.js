(function() {
  "use strict";
  var Beautifier, VueBeautifier, _, prettydiff,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  prettydiff = require("prettydiff");

  _ = require('lodash');

  module.exports = VueBeautifier = (function(superClass) {
    extend(VueBeautifier, superClass);

    function VueBeautifier() {
      return VueBeautifier.__super__.constructor.apply(this, arguments);
    }

    VueBeautifier.prototype.name = "Vue Beautifier";

    VueBeautifier.prototype.options = {
      Vue: true
    };

    VueBeautifier.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var regexp;
        regexp = /(<(template|script|style)[^>]*>)((\s|\S)*?)<\/\2>/gi;
        return resolve(text.replace(regexp, function(match, begin, type, text) {
          var lang, ref;
          lang = (ref = /lang\s*=\s*['"](\w+)["']/.exec(begin)) != null ? ref[1] : void 0;
          switch (type) {
            case "template":
              switch (lang) {
                case "pug":
                case "jade":
                  return match.replace(text, "\n" + require("pug-beautify")(text, options) + "\n");
                case void 0:
                  return match.replace(text, "\n" + require("js-beautify").html(text, options) + "\n");
                default:
                  return match;
              }
              break;
            case "script":
              return match.replace(text, "\n" + require("js-beautify")(text, options) + "\n");
            case "style":
              switch (lang) {
                case "sass":
                case "scss":
                  options = _.merge(options, {
                    source: text,
                    lang: "scss",
                    mode: "beautify"
                  });
                  return match.replace(text, prettydiff.api(options)[0]);
                case "less":
                  options = _.merge(options, {
                    source: text,
                    lang: "less",
                    mode: "beautify"
                  });
                  return match.replace(text, prettydiff.api(options)[0]);
                case void 0:
                  return match.replace(text, "\n" + require("js-beautify").css(text, options) + "\n");
                default:
                  return match;
              }
          }
        }));
      });
    };

    return VueBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3Z1ZS1iZWF1dGlmaWVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSx3Q0FBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBQ2IsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSOztFQUNiLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7RUFFSixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozs0QkFDckIsSUFBQSxHQUFNOzs0QkFFTixPQUFBLEdBQ0U7TUFBQSxHQUFBLEVBQUssSUFBTDs7OzRCQUVGLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNsQixZQUFBO1FBQUEsTUFBQSxHQUFTO2VBRVQsT0FBQSxDQUFRLElBQUksQ0FBQyxPQUFMLENBQWEsTUFBYixFQUFxQixTQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsSUFBZixFQUFxQixJQUFyQjtBQUMzQixjQUFBO1VBQUEsSUFBQSwrREFBK0MsQ0FBQSxDQUFBO0FBRS9DLGtCQUFPLElBQVA7QUFBQSxpQkFDTyxVQURQO0FBRUksc0JBQU8sSUFBUDtBQUFBLHFCQUNPLEtBRFA7QUFBQSxxQkFDYyxNQURkO3lCQUVJLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxFQUFvQixJQUFBLEdBQU8sT0FBQSxDQUFRLGNBQVIsQ0FBQSxDQUF3QixJQUF4QixFQUE4QixPQUE5QixDQUFQLEdBQWdELElBQXBFO0FBRkoscUJBR08sTUFIUDt5QkFJSSxLQUFLLENBQUMsT0FBTixDQUFjLElBQWQsRUFBb0IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxhQUFSLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsSUFBNUIsRUFBa0MsT0FBbEMsQ0FBUCxHQUFvRCxJQUF4RTtBQUpKO3lCQU1JO0FBTko7QUFERztBQURQLGlCQVNPLFFBVFA7cUJBVUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkLEVBQW9CLElBQUEsR0FBTyxPQUFBLENBQVEsYUFBUixDQUFBLENBQXVCLElBQXZCLEVBQTZCLE9BQTdCLENBQVAsR0FBK0MsSUFBbkU7QUFWSixpQkFXTyxPQVhQO0FBWUksc0JBQU8sSUFBUDtBQUFBLHFCQUNPLE1BRFA7QUFBQSxxQkFDZSxNQURmO2tCQUVJLE9BQUEsR0FBVSxDQUFDLENBQUMsS0FBRixDQUFRLE9BQVIsRUFDUjtvQkFBQSxNQUFBLEVBQVEsSUFBUjtvQkFDQSxJQUFBLEVBQU0sTUFETjtvQkFFQSxJQUFBLEVBQU0sVUFGTjttQkFEUTt5QkFJVixLQUFLLENBQUMsT0FBTixDQUFjLElBQWQsRUFBb0IsVUFBVSxDQUFDLEdBQVgsQ0FBZSxPQUFmLENBQXdCLENBQUEsQ0FBQSxDQUE1QztBQU5KLHFCQU9PLE1BUFA7a0JBUUksT0FBQSxHQUFVLENBQUMsQ0FBQyxLQUFGLENBQVEsT0FBUixFQUNWO29CQUFBLE1BQUEsRUFBUSxJQUFSO29CQUNBLElBQUEsRUFBTSxNQUROO29CQUVBLElBQUEsRUFBTSxVQUZOO21CQURVO3lCQUlWLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxFQUFvQixVQUFVLENBQUMsR0FBWCxDQUFlLE9BQWYsQ0FBd0IsQ0FBQSxDQUFBLENBQTVDO0FBWkoscUJBYU8sTUFiUDt5QkFjSSxLQUFLLENBQUMsT0FBTixDQUFjLElBQWQsRUFBb0IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxhQUFSLENBQXNCLENBQUMsR0FBdkIsQ0FBMkIsSUFBM0IsRUFBaUMsT0FBakMsQ0FBUCxHQUFtRCxJQUF2RTtBQWRKO3lCQWdCSTtBQWhCSjtBQVpKO1FBSDJCLENBQXJCLENBQVI7TUFIa0IsQ0FBVDtJQURIOzs7O0tBTmlDO0FBTDdDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxucHJldHR5ZGlmZiA9IHJlcXVpcmUoXCJwcmV0dHlkaWZmXCIpXG5fID0gcmVxdWlyZSgnbG9kYXNoJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBWdWVCZWF1dGlmaWVyIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlZ1ZSBCZWF1dGlmaWVyXCJcblxuICBvcHRpb25zOlxuICAgIFZ1ZTogdHJ1ZVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgcmVnZXhwID0gLyg8KHRlbXBsYXRlfHNjcmlwdHxzdHlsZSlbXj5dKj4pKChcXHN8XFxTKSo/KTxcXC9cXDI+L2dpXG5cbiAgICAgIHJlc29sdmUodGV4dC5yZXBsYWNlKHJlZ2V4cCwgKG1hdGNoLCBiZWdpbiwgdHlwZSwgdGV4dCkgLT5cbiAgICAgICAgbGFuZyA9IC9sYW5nXFxzKj1cXHMqWydcIl0oXFx3KylbXCInXS8uZXhlYyhiZWdpbik/WzFdXG5cbiAgICAgICAgc3dpdGNoIHR5cGVcbiAgICAgICAgICB3aGVuIFwidGVtcGxhdGVcIlxuICAgICAgICAgICAgc3dpdGNoIGxhbmdcbiAgICAgICAgICAgICAgd2hlbiBcInB1Z1wiLCBcImphZGVcIlxuICAgICAgICAgICAgICAgIG1hdGNoLnJlcGxhY2UodGV4dCwgXCJcXG5cIiArIHJlcXVpcmUoXCJwdWctYmVhdXRpZnlcIikodGV4dCwgb3B0aW9ucykgKyBcIlxcblwiKVxuICAgICAgICAgICAgICB3aGVuIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIG1hdGNoLnJlcGxhY2UodGV4dCwgXCJcXG5cIiArIHJlcXVpcmUoXCJqcy1iZWF1dGlmeVwiKS5odG1sKHRleHQsIG9wdGlvbnMpICsgXCJcXG5cIilcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1hdGNoXG4gICAgICAgICAgd2hlbiBcInNjcmlwdFwiXG4gICAgICAgICAgICBtYXRjaC5yZXBsYWNlKHRleHQsIFwiXFxuXCIgKyByZXF1aXJlKFwianMtYmVhdXRpZnlcIikodGV4dCwgb3B0aW9ucykgKyBcIlxcblwiKVxuICAgICAgICAgIHdoZW4gXCJzdHlsZVwiXG4gICAgICAgICAgICBzd2l0Y2ggbGFuZ1xuICAgICAgICAgICAgICB3aGVuIFwic2Fzc1wiLCBcInNjc3NcIlxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBfLm1lcmdlIG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICBzb3VyY2U6IHRleHRcbiAgICAgICAgICAgICAgICAgIGxhbmc6IFwic2Nzc1wiXG4gICAgICAgICAgICAgICAgICBtb2RlOiBcImJlYXV0aWZ5XCJcbiAgICAgICAgICAgICAgICBtYXRjaC5yZXBsYWNlKHRleHQsIHByZXR0eWRpZmYuYXBpKG9wdGlvbnMpWzBdKVxuICAgICAgICAgICAgICB3aGVuIFwibGVzc1wiXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IF8ubWVyZ2Ugb3B0aW9ucyxcbiAgICAgICAgICAgICAgICBzb3VyY2U6IHRleHRcbiAgICAgICAgICAgICAgICBsYW5nOiBcImxlc3NcIlxuICAgICAgICAgICAgICAgIG1vZGU6IFwiYmVhdXRpZnlcIlxuICAgICAgICAgICAgICAgIG1hdGNoLnJlcGxhY2UodGV4dCwgcHJldHR5ZGlmZi5hcGkob3B0aW9ucylbMF0pXG4gICAgICAgICAgICAgIHdoZW4gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgbWF0Y2gucmVwbGFjZSh0ZXh0LCBcIlxcblwiICsgcmVxdWlyZShcImpzLWJlYXV0aWZ5XCIpLmNzcyh0ZXh0LCBvcHRpb25zKSArIFwiXFxuXCIpXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtYXRjaFxuICAgICAgKSlcbiAgICApXG4iXX0=
