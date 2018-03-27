
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

    R.prototype.isPreInstalled = false;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2Zvcm1hdFIvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0FBQUEsTUFBQSxtQkFBQTtJQUFBOzs7RUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVA7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O2dCQUNyQixJQUFBLEdBQU07O2dCQUNOLElBQUEsR0FBTTs7Z0JBQ04sY0FBQSxHQUFnQjs7Z0JBRWhCLE9BQUEsR0FBUztNQUNQLENBQUEsRUFBRyxJQURJOzs7Z0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsWUFBQSxHQUFlLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixXQUF4QjthQUNmLElBQUMsQ0FBQSxHQUFELENBQUssU0FBTCxFQUFnQixDQUNkLFlBRGMsRUFFZCxPQUFPLENBQUMsV0FGTSxFQUdkLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQUhjLEVBSWQsR0FKYyxFQUtkLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQUxjLENBQWhCO0lBRlE7Ozs7S0FUcUI7QUFSakMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIFtmb3JtYXRSXShodHRwczovL2dpdGh1Yi5jb20veWlodWkvZm9ybWF0UilcbiMjI1xucGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUiBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJmb3JtYXRSXCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20veWlodWkvZm9ybWF0UlwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6IHtcbiAgICBSOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIHJfYmVhdXRpZmllciA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiZm9ybWF0Ui5yXCIpXG4gICAgQHJ1bihcIlJzY3JpcHRcIiwgW1xuICAgICAgcl9iZWF1dGlmaWVyLFxuICAgICAgb3B0aW9ucy5pbmRlbnRfc2l6ZSxcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpLFxuICAgICAgJz4nLFxuICAgICAgQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dClcbiAgICAgIF0pXG4iXX0=
