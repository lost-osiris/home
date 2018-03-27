
/*
Requires https://github.com/threedaymonk/htmlbeautifier
 */

(function() {
  "use strict";
  var Beautifier, HTMLBeautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = HTMLBeautifier = (function(superClass) {
    extend(HTMLBeautifier, superClass);

    function HTMLBeautifier() {
      return HTMLBeautifier.__super__.constructor.apply(this, arguments);
    }

    HTMLBeautifier.prototype.name = "HTML Beautifier";

    HTMLBeautifier.prototype.link = "https://github.com/threedaymonk/htmlbeautifier";

    HTMLBeautifier.prototype.options = {
      ERB: {
        indent_size: true
      }
    };

    HTMLBeautifier.prototype.beautify = function(text, language, options) {
      var tempFile;
      console.log('erb', options);
      return this.run("htmlbeautifier", ["--tab-stops", options.indent_size, tempFile = this.tempFile("temp", text)]).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return HTMLBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2h0bWxiZWF1dGlmaWVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSwwQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7NkJBQ3JCLElBQUEsR0FBTTs7NkJBQ04sSUFBQSxHQUFNOzs2QkFDTixPQUFBLEdBQVM7TUFDUCxHQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsSUFBYjtPQUZLOzs7NkJBS1QsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxLQUFaLEVBQW1CLE9BQW5CO2FBQ0EsSUFBQyxDQUFBLEdBQUQsQ0FBSyxnQkFBTCxFQUF1QixDQUNyQixhQURxQixFQUNOLE9BQU8sQ0FBQyxXQURGLEVBRXJCLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsQ0FGVSxDQUF2QixDQUlFLENBQUMsSUFKSCxDQUlRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7UUFESTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKUjtJQUZROzs7O0tBUmtDO0FBUDlDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vdGhyZWVkYXltb25rL2h0bWxiZWF1dGlmaWVyXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEhUTUxCZWF1dGlmaWVyIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIkhUTUwgQmVhdXRpZmllclwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3RocmVlZGF5bW9uay9odG1sYmVhdXRpZmllclwiXG4gIG9wdGlvbnM6IHtcbiAgICBFUkI6XG4gICAgICBpbmRlbnRfc2l6ZTogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBjb25zb2xlLmxvZygnZXJiJywgb3B0aW9ucylcbiAgICBAcnVuKFwiaHRtbGJlYXV0aWZpZXJcIiwgW1xuICAgICAgXCItLXRhYi1zdG9wc1wiLCBvcHRpb25zLmluZGVudF9zaXplXG4gICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dClcbiAgICAgIF0pXG4gICAgICAudGhlbig9PlxuICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICApXG4iXX0=
