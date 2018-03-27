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

    VueBeautifier.prototype.link = "https://github.com/Glavin001/atom-beautify/blob/master/src/beautifiers/vue-beautifier.coffee";

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3Z1ZS1iZWF1dGlmaWVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSx3Q0FBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBQ2IsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSOztFQUNiLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7RUFFSixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozs0QkFDckIsSUFBQSxHQUFNOzs0QkFDTixJQUFBLEdBQU07OzRCQUVOLE9BQUEsR0FDRTtNQUFBLEdBQUEsRUFBSyxJQUFMOzs7NEJBRUYsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixhQUFXLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ2xCLFlBQUE7UUFBQSxNQUFBLEdBQVM7ZUFFVCxPQUFBLENBQVEsSUFBSSxDQUFDLE9BQUwsQ0FBYSxNQUFiLEVBQXFCLFNBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxJQUFmLEVBQXFCLElBQXJCO0FBQzNCLGNBQUE7VUFBQSxJQUFBLCtEQUErQyxDQUFBLENBQUE7QUFFL0Msa0JBQU8sSUFBUDtBQUFBLGlCQUNPLFVBRFA7QUFFSSxzQkFBTyxJQUFQO0FBQUEscUJBQ08sS0FEUDtBQUFBLHFCQUNjLE1BRGQ7eUJBRUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkLEVBQW9CLElBQUEsR0FBTyxPQUFBLENBQVEsY0FBUixDQUFBLENBQXdCLElBQXhCLEVBQThCLE9BQTlCLENBQVAsR0FBZ0QsSUFBcEU7QUFGSixxQkFHTyxNQUhQO3lCQUlJLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxFQUFvQixJQUFBLEdBQU8sT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixJQUE1QixFQUFrQyxPQUFsQyxDQUFQLEdBQW9ELElBQXhFO0FBSko7eUJBTUk7QUFOSjtBQURHO0FBRFAsaUJBU08sUUFUUDtxQkFVSSxLQUFLLENBQUMsT0FBTixDQUFjLElBQWQsRUFBb0IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxhQUFSLENBQUEsQ0FBdUIsSUFBdkIsRUFBNkIsT0FBN0IsQ0FBUCxHQUErQyxJQUFuRTtBQVZKLGlCQVdPLE9BWFA7QUFZSSxzQkFBTyxJQUFQO0FBQUEscUJBQ08sTUFEUDtBQUFBLHFCQUNlLE1BRGY7a0JBRUksT0FBQSxHQUFVLENBQUMsQ0FBQyxLQUFGLENBQVEsT0FBUixFQUNSO29CQUFBLE1BQUEsRUFBUSxJQUFSO29CQUNBLElBQUEsRUFBTSxNQUROO29CQUVBLElBQUEsRUFBTSxVQUZOO21CQURRO3lCQUlWLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxFQUFvQixVQUFVLENBQUMsR0FBWCxDQUFlLE9BQWYsQ0FBd0IsQ0FBQSxDQUFBLENBQTVDO0FBTkoscUJBT08sTUFQUDtrQkFRSSxPQUFBLEdBQVUsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxPQUFSLEVBQ1Y7b0JBQUEsTUFBQSxFQUFRLElBQVI7b0JBQ0EsSUFBQSxFQUFNLE1BRE47b0JBRUEsSUFBQSxFQUFNLFVBRk47bUJBRFU7eUJBSVYsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkLEVBQW9CLFVBQVUsQ0FBQyxHQUFYLENBQWUsT0FBZixDQUF3QixDQUFBLENBQUEsQ0FBNUM7QUFaSixxQkFhTyxNQWJQO3lCQWNJLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxFQUFvQixJQUFBLEdBQU8sT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQyxHQUF2QixDQUEyQixJQUEzQixFQUFpQyxPQUFqQyxDQUFQLEdBQW1ELElBQXZFO0FBZEo7eUJBZ0JJO0FBaEJKO0FBWko7UUFIMkIsQ0FBckIsQ0FBUjtNQUhrQixDQUFUO0lBREg7Ozs7S0FQaUM7QUFMN0MiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5wcmV0dHlkaWZmID0gcmVxdWlyZShcInByZXR0eWRpZmZcIilcbl8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFZ1ZUJlYXV0aWZpZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiVnVlIEJlYXV0aWZpZXJcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9HbGF2aW4wMDEvYXRvbS1iZWF1dGlmeS9ibG9iL21hc3Rlci9zcmMvYmVhdXRpZmllcnMvdnVlLWJlYXV0aWZpZXIuY29mZmVlXCJcblxuICBvcHRpb25zOlxuICAgIFZ1ZTogdHJ1ZVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgcmVnZXhwID0gLyg8KHRlbXBsYXRlfHNjcmlwdHxzdHlsZSlbXj5dKj4pKChcXHN8XFxTKSo/KTxcXC9cXDI+L2dpXG5cbiAgICAgIHJlc29sdmUodGV4dC5yZXBsYWNlKHJlZ2V4cCwgKG1hdGNoLCBiZWdpbiwgdHlwZSwgdGV4dCkgLT5cbiAgICAgICAgbGFuZyA9IC9sYW5nXFxzKj1cXHMqWydcIl0oXFx3KylbXCInXS8uZXhlYyhiZWdpbik/WzFdXG5cbiAgICAgICAgc3dpdGNoIHR5cGVcbiAgICAgICAgICB3aGVuIFwidGVtcGxhdGVcIlxuICAgICAgICAgICAgc3dpdGNoIGxhbmdcbiAgICAgICAgICAgICAgd2hlbiBcInB1Z1wiLCBcImphZGVcIlxuICAgICAgICAgICAgICAgIG1hdGNoLnJlcGxhY2UodGV4dCwgXCJcXG5cIiArIHJlcXVpcmUoXCJwdWctYmVhdXRpZnlcIikodGV4dCwgb3B0aW9ucykgKyBcIlxcblwiKVxuICAgICAgICAgICAgICB3aGVuIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIG1hdGNoLnJlcGxhY2UodGV4dCwgXCJcXG5cIiArIHJlcXVpcmUoXCJqcy1iZWF1dGlmeVwiKS5odG1sKHRleHQsIG9wdGlvbnMpICsgXCJcXG5cIilcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1hdGNoXG4gICAgICAgICAgd2hlbiBcInNjcmlwdFwiXG4gICAgICAgICAgICBtYXRjaC5yZXBsYWNlKHRleHQsIFwiXFxuXCIgKyByZXF1aXJlKFwianMtYmVhdXRpZnlcIikodGV4dCwgb3B0aW9ucykgKyBcIlxcblwiKVxuICAgICAgICAgIHdoZW4gXCJzdHlsZVwiXG4gICAgICAgICAgICBzd2l0Y2ggbGFuZ1xuICAgICAgICAgICAgICB3aGVuIFwic2Fzc1wiLCBcInNjc3NcIlxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBfLm1lcmdlIG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICBzb3VyY2U6IHRleHRcbiAgICAgICAgICAgICAgICAgIGxhbmc6IFwic2Nzc1wiXG4gICAgICAgICAgICAgICAgICBtb2RlOiBcImJlYXV0aWZ5XCJcbiAgICAgICAgICAgICAgICBtYXRjaC5yZXBsYWNlKHRleHQsIHByZXR0eWRpZmYuYXBpKG9wdGlvbnMpWzBdKVxuICAgICAgICAgICAgICB3aGVuIFwibGVzc1wiXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IF8ubWVyZ2Ugb3B0aW9ucyxcbiAgICAgICAgICAgICAgICBzb3VyY2U6IHRleHRcbiAgICAgICAgICAgICAgICBsYW5nOiBcImxlc3NcIlxuICAgICAgICAgICAgICAgIG1vZGU6IFwiYmVhdXRpZnlcIlxuICAgICAgICAgICAgICAgIG1hdGNoLnJlcGxhY2UodGV4dCwgcHJldHR5ZGlmZi5hcGkob3B0aW9ucylbMF0pXG4gICAgICAgICAgICAgIHdoZW4gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgbWF0Y2gucmVwbGFjZSh0ZXh0LCBcIlxcblwiICsgcmVxdWlyZShcImpzLWJlYXV0aWZ5XCIpLmNzcyh0ZXh0LCBvcHRpb25zKSArIFwiXFxuXCIpXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtYXRjaFxuICAgICAgKSlcbiAgICApXG4iXX0=
