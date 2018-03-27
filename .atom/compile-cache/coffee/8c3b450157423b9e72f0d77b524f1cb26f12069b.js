
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

    ElmFormat.prototype.isPreInstalled = false;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2VsbS1mb3JtYXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBR0E7QUFIQSxNQUFBLHFCQUFBO0lBQUE7OztFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt3QkFDckIsSUFBQSxHQUFNOzt3QkFDTixJQUFBLEdBQU07O3dCQUNOLGNBQUEsR0FBZ0I7O3dCQUVoQixPQUFBLEdBQVM7TUFDUCxHQUFBLEVBQUssSUFERTs7O3dCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTthQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsRUFBeUIsTUFBekIsQ0FDWCxDQUFDLElBRFUsQ0FDTCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtpQkFDSixLQUFDLENBQUEsR0FBRCxDQUFLLFlBQUwsRUFBbUIsQ0FDakIsT0FEaUIsRUFFakIsSUFGaUIsQ0FBbkIsRUFJRTtZQUFFLElBQUEsRUFBTTtjQUFFLElBQUEsRUFBTSxrREFBUjthQUFSO1dBSkYsQ0FNQSxDQUFDLElBTkQsQ0FNTSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsSUFBVjtVQURJLENBTk47UUFESTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FESztJQURIOzs7O0tBVDZCO0FBTnpDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vYXZoNC9lbG0tZm9ybWF0XG4jIyNcblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBFbG1Gb3JtYXQgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiZWxtLWZvcm1hdFwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2F2aDQvZWxtLWZvcm1hdFwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6IHtcbiAgICBFbG06IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgdGVtcGZpbGUgPSBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0LCBcIi5lbG1cIilcbiAgICAudGhlbiAobmFtZSkgPT5cbiAgICAgIEBydW4oXCJlbG0tZm9ybWF0XCIsIFtcbiAgICAgICAgJy0teWVzJyxcbiAgICAgICAgbmFtZVxuICAgICAgICBdLFxuICAgICAgICB7IGhlbHA6IHsgbGluazogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hdmg0L2VsbS1mb3JtYXQjaW5zdGFsbGF0aW9uLScgfSB9XG4gICAgICApXG4gICAgICAudGhlbiAoKSA9PlxuICAgICAgICBAcmVhZEZpbGUobmFtZSlcbiJdfQ==
