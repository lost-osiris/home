(function() {
  "use strict";
  var Beautifier, CoffeeFormatter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = CoffeeFormatter = (function(superClass) {
    extend(CoffeeFormatter, superClass);

    function CoffeeFormatter() {
      return CoffeeFormatter.__super__.constructor.apply(this, arguments);
    }

    CoffeeFormatter.prototype.name = "Coffee Formatter";

    CoffeeFormatter.prototype.link = "https://github.com/Glavin001/Coffee-Formatter";

    CoffeeFormatter.prototype.options = {
      CoffeeScript: true
    };

    CoffeeFormatter.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var CF, curr, i, len, lines, p, result, resultArr;
        CF = require("coffee-formatter");
        lines = text.split("\n");
        resultArr = [];
        i = 0;
        len = lines.length;
        while (i < len) {
          curr = lines[i];
          p = CF.formatTwoSpaceOperator(curr);
          p = CF.formatOneSpaceOperator(p);
          p = CF.shortenSpaces(p);
          resultArr.push(p);
          i++;
        }
        result = resultArr.join("\n");
        return resolve(result);
      });
    };

    return CoffeeFormatter;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2NvZmZlZS1mb3JtYXR0ZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLDJCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozs4QkFFckIsSUFBQSxHQUFNOzs4QkFDTixJQUFBLEdBQU07OzhCQUVOLE9BQUEsR0FBUztNQUNQLFlBQUEsRUFBYyxJQURQOzs7OEJBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFFUixhQUFXLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBRWxCLFlBQUE7UUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLGtCQUFSO1FBQ0wsS0FBQSxHQUFRLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWDtRQUNSLFNBQUEsR0FBWTtRQUNaLENBQUEsR0FBSTtRQUNKLEdBQUEsR0FBTSxLQUFLLENBQUM7QUFFWixlQUFNLENBQUEsR0FBSSxHQUFWO1VBQ0UsSUFBQSxHQUFPLEtBQU0sQ0FBQSxDQUFBO1VBQ2IsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxzQkFBSCxDQUEwQixJQUExQjtVQUNKLENBQUEsR0FBSSxFQUFFLENBQUMsc0JBQUgsQ0FBMEIsQ0FBMUI7VUFDSixDQUFBLEdBQUksRUFBRSxDQUFDLGFBQUgsQ0FBaUIsQ0FBakI7VUFDSixTQUFTLENBQUMsSUFBVixDQUFlLENBQWY7VUFDQSxDQUFBO1FBTkY7UUFPQSxNQUFBLEdBQVMsU0FBUyxDQUFDLElBQVYsQ0FBZSxJQUFmO2VBQ1QsT0FBQSxDQUFRLE1BQVI7TUFoQmtCLENBQVQ7SUFGSDs7OztLQVRtQztBQUgvQyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBDb2ZmZWVGb3JtYXR0ZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXG5cbiAgbmFtZTogXCJDb2ZmZWUgRm9ybWF0dGVyXCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vR2xhdmluMDAxL0NvZmZlZS1Gb3JtYXR0ZXJcIlxuXG4gIG9wdGlvbnM6IHtcbiAgICBDb2ZmZWVTY3JpcHQ6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG5cbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpIC0+XG5cbiAgICAgIENGID0gcmVxdWlyZShcImNvZmZlZS1mb3JtYXR0ZXJcIilcbiAgICAgIGxpbmVzID0gdGV4dC5zcGxpdChcIlxcblwiKVxuICAgICAgcmVzdWx0QXJyID0gW11cbiAgICAgIGkgPSAwXG4gICAgICBsZW4gPSBsaW5lcy5sZW5ndGhcblxuICAgICAgd2hpbGUgaSA8IGxlblxuICAgICAgICBjdXJyID0gbGluZXNbaV1cbiAgICAgICAgcCA9IENGLmZvcm1hdFR3b1NwYWNlT3BlcmF0b3IoY3VycilcbiAgICAgICAgcCA9IENGLmZvcm1hdE9uZVNwYWNlT3BlcmF0b3IocClcbiAgICAgICAgcCA9IENGLnNob3J0ZW5TcGFjZXMocClcbiAgICAgICAgcmVzdWx0QXJyLnB1c2ggcFxuICAgICAgICBpKytcbiAgICAgIHJlc3VsdCA9IHJlc3VsdEFyci5qb2luKFwiXFxuXCIpXG4gICAgICByZXNvbHZlIHJlc3VsdFxuXG4gICAgKVxuIl19
