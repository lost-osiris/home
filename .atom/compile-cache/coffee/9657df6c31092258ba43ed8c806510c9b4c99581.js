
/*
Requires [formatR](https://github.com/yihui/formatR)
 */

(function() {
  var Beautifier, R, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require("path");

  "use strict";

  Beautifier = require('../beautifier');

  module.exports = R = (function(superClass) {
    extend(R, superClass);

    function R() {
      return R.__super__.constructor.apply(this, arguments);
    }

    R.prototype.name = "formatR";

    R.prototype.link = "https://github.com/yihui/formatR";

    R.prototype.options = {
      R: true
    };

    R.prototype.beautify = function(text, language, options) {
      var r_beautifier;
      r_beautifier = path.resolve(__dirname, "formatR.r");
      return this.run("Rscript", [r_beautifier, options.indent_size, this.tempFile("input", text), '>', this.tempFile("input", text)]);
    };

    return R;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2Zvcm1hdFIvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0FBQUEsTUFBQSxtQkFBQTtJQUFBOzs7RUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVA7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O2dCQUNyQixJQUFBLEdBQU07O2dCQUNOLElBQUEsR0FBTTs7Z0JBRU4sT0FBQSxHQUFTO01BQ1AsQ0FBQSxFQUFHLElBREk7OztnQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7TUFBQSxZQUFBLEdBQWUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLFdBQXhCO2FBQ2YsSUFBQyxDQUFBLEdBQUQsQ0FBSyxTQUFMLEVBQWdCLENBQ2QsWUFEYyxFQUVkLE9BQU8sQ0FBQyxXQUZNLEVBR2QsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBSGMsRUFJZCxHQUpjLEVBS2QsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBTGMsQ0FBaEI7SUFGUTs7OztLQVJxQjtBQVJqQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgW2Zvcm1hdFJdKGh0dHBzOi8vZ2l0aHViLmNvbS95aWh1aS9mb3JtYXRSKVxuIyMjXG5wYXRoID0gcmVxdWlyZShcInBhdGhcIilcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBSIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcImZvcm1hdFJcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS95aWh1aS9mb3JtYXRSXCJcblxuICBvcHRpb25zOiB7XG4gICAgUjogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICByX2JlYXV0aWZpZXIgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImZvcm1hdFIuclwiKVxuICAgIEBydW4oXCJSc2NyaXB0XCIsIFtcbiAgICAgIHJfYmVhdXRpZmllcixcbiAgICAgIG9wdGlvbnMuaW5kZW50X3NpemUsXG4gICAgICBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KSxcbiAgICAgICc+JyxcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBdKVxuIl19
