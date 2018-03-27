
/*
Requires http://golang.org/cmd/gofmt/
 */

(function() {
  "use strict";
  var Beautifier, Gofmt,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Gofmt = (function(superClass) {
    extend(Gofmt, superClass);

    function Gofmt() {
      return Gofmt.__super__.constructor.apply(this, arguments);
    }

    Gofmt.prototype.name = "gofmt";

    Gofmt.prototype.link = "https://golang.org/cmd/gofmt/";

    Gofmt.prototype.options = {
      Go: true
    };

    Gofmt.prototype.beautify = function(text, language, options) {
      return this.run("gofmt", [this.tempFile("input", text)]);
    };

    return Gofmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2dvZm10LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxpQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7b0JBQ3JCLElBQUEsR0FBTTs7b0JBQ04sSUFBQSxHQUFNOztvQkFFTixPQUFBLEdBQVM7TUFDUCxFQUFBLEVBQUksSUFERzs7O29CQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLEVBQWMsQ0FDWixJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FEWSxDQUFkO0lBRFE7Ozs7S0FSeUI7QUFQckMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHA6Ly9nb2xhbmcub3JnL2NtZC9nb2ZtdC9cbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgR29mbXQgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiZ29mbXRcIlxuICBsaW5rOiBcImh0dHBzOi8vZ29sYW5nLm9yZy9jbWQvZ29mbXQvXCJcblxuICBvcHRpb25zOiB7XG4gICAgR286IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQHJ1bihcImdvZm10XCIsIFtcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBdKVxuIl19
