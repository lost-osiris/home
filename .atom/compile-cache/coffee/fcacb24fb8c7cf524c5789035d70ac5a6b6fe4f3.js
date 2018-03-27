
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  "use strict";
  var Beautifier, ErlTidy,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = ErlTidy = (function(superClass) {
    extend(ErlTidy, superClass);

    function ErlTidy() {
      return ErlTidy.__super__.constructor.apply(this, arguments);
    }

    ErlTidy.prototype.name = "erl_tidy";

    ErlTidy.prototype.link = "http://erlang.org/doc/man/erl_tidy.html";

    ErlTidy.prototype.options = {
      Erlang: true
    };

    ErlTidy.prototype.beautify = function(text, language, options) {
      var tempFile;
      tempFile = void 0;
      return this.tempFile("input", text).then((function(_this) {
        return function(path) {
          tempFile = path;
          return _this.run("erl", [["-eval", 'erl_tidy:file("' + tempFile + '")'], ["-noshell", "-s", "init", "stop"]], {
            help: {
              link: "http://erlang.org/doc/man/erl_tidy.html"
            }
          });
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return ErlTidy;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2VybF90aWR5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxtQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7c0JBRXJCLElBQUEsR0FBTTs7c0JBQ04sSUFBQSxHQUFNOztzQkFFTixPQUFBLEdBQVM7TUFDUCxNQUFBLEVBQVEsSUFERDs7O3NCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTtNQUFBLFFBQUEsR0FBVzthQUNYLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQUF3QixDQUFDLElBQXpCLENBQThCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO1VBQzVCLFFBQUEsR0FBVztpQkFDWCxLQUFDLENBQUEsR0FBRCxDQUFLLEtBQUwsRUFBWSxDQUNWLENBQUMsT0FBRCxFQUFVLGlCQUFBLEdBQW9CLFFBQXBCLEdBQStCLElBQXpDLENBRFUsRUFFVixDQUFDLFVBQUQsRUFBYSxJQUFiLEVBQW1CLE1BQW5CLEVBQTJCLE1BQTNCLENBRlUsQ0FBWixFQUlFO1lBQUUsSUFBQSxFQUFNO2NBQUUsSUFBQSxFQUFNLHlDQUFSO2FBQVI7V0FKRjtRQUY0QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUIsQ0FRQyxDQUFDLElBUkYsQ0FRTyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ0wsS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO1FBREs7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUlA7SUFGUTs7OztLQVQyQjtBQVB2QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL2hoYXR0by9hdXRvcGVwOFxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBFcmxUaWR5IGV4dGVuZHMgQmVhdXRpZmllclxuXG4gIG5hbWU6IFwiZXJsX3RpZHlcIlxuICBsaW5rOiBcImh0dHA6Ly9lcmxhbmcub3JnL2RvYy9tYW4vZXJsX3RpZHkuaHRtbFwiXG5cbiAgb3B0aW9uczoge1xuICAgIEVybGFuZzogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICB0ZW1wRmlsZSA9IHVuZGVmaW5lZFxuICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpLnRoZW4oKHBhdGgpID0+XG4gICAgICB0ZW1wRmlsZSA9IHBhdGhcbiAgICAgIEBydW4oXCJlcmxcIiwgW1xuICAgICAgICBbXCItZXZhbFwiLCAnZXJsX3RpZHk6ZmlsZShcIicgKyB0ZW1wRmlsZSArICdcIiknXVxuICAgICAgICBbXCItbm9zaGVsbFwiLCBcIi1zXCIsIFwiaW5pdFwiLCBcInN0b3BcIl1cbiAgICAgICAgXSxcbiAgICAgICAgeyBoZWxwOiB7IGxpbms6IFwiaHR0cDovL2VybGFuZy5vcmcvZG9jL21hbi9lcmxfdGlkeS5odG1sXCIgfSB9XG4gICAgICAgIClcbiAgICApLnRoZW4oPT5cbiAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICApXG4iXX0=
