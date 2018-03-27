
/*
Requires https://github.com/avh4/elm-format
 */

(function() {
  "use strict";
  var Beautifier, ElmFormat,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = ElmFormat = (function(superClass) {
    extend(ElmFormat, superClass);

    function ElmFormat() {
      return ElmFormat.__super__.constructor.apply(this, arguments);
    }

    ElmFormat.prototype.name = "elm-format";

    ElmFormat.prototype.link = "https://github.com/avh4/elm-format";

    ElmFormat.prototype.options = {
      Elm: true
    };

    ElmFormat.prototype.beautify = function(text, language, options) {
      var tempfile;
      return tempfile = this.tempFile("input", text, ".elm").then((function(_this) {
        return function(name) {
          return _this.run("elm-format", ['--yes', name], {
            help: {
              link: 'https://github.com/avh4/elm-format#installation-'
            }
          }).then(function() {
            return _this.readFile(name);
          });
        };
      })(this));
    };

    return ElmFormat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2VsbS1mb3JtYXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBR0E7QUFIQSxNQUFBLHFCQUFBO0lBQUE7OztFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt3QkFDckIsSUFBQSxHQUFNOzt3QkFDTixJQUFBLEdBQU07O3dCQUVOLE9BQUEsR0FBUztNQUNQLEdBQUEsRUFBSyxJQURFOzs7d0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO2FBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixFQUF5QixNQUF6QixDQUNYLENBQUMsSUFEVSxDQUNMLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO2lCQUNKLEtBQUMsQ0FBQSxHQUFELENBQUssWUFBTCxFQUFtQixDQUNqQixPQURpQixFQUVqQixJQUZpQixDQUFuQixFQUlFO1lBQUUsSUFBQSxFQUFNO2NBQUUsSUFBQSxFQUFNLGtEQUFSO2FBQVI7V0FKRixDQU1BLENBQUMsSUFORCxDQU1NLFNBQUE7bUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWO1VBREksQ0FOTjtRQURJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURLO0lBREg7Ozs7S0FSNkI7QUFOekMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9hdmg0L2VsbS1mb3JtYXRcbiMjI1xuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEVsbUZvcm1hdCBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJlbG0tZm9ybWF0XCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYXZoNC9lbG0tZm9ybWF0XCJcblxuICBvcHRpb25zOiB7XG4gICAgRWxtOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIHRlbXBmaWxlID0gQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dCwgXCIuZWxtXCIpXG4gICAgLnRoZW4gKG5hbWUpID0+XG4gICAgICBAcnVuKFwiZWxtLWZvcm1hdFwiLCBbXG4gICAgICAgICctLXllcycsXG4gICAgICAgIG5hbWVcbiAgICAgICAgXSxcbiAgICAgICAgeyBoZWxwOiB7IGxpbms6ICdodHRwczovL2dpdGh1Yi5jb20vYXZoNC9lbG0tZm9ybWF0I2luc3RhbGxhdGlvbi0nIH0gfVxuICAgICAgKVxuICAgICAgLnRoZW4gKCkgPT5cbiAgICAgICAgQHJlYWRGaWxlKG5hbWUpXG4iXX0=
