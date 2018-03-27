
/*
 */

(function() {
  var Beautifier, Lua, format, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require("path");

  "use strict";

  Beautifier = require('../beautifier');

  format = require('./beautifier');

  module.exports = Lua = (function(superClass) {
    extend(Lua, superClass);

    function Lua() {
      return Lua.__super__.constructor.apply(this, arguments);
    }

    Lua.prototype.name = "Lua beautifier";

    Lua.prototype.link = "https://github.com/Glavin001/atom-beautify/blob/master/src/beautifiers/lua-beautifier/beautifier.coffee";

    Lua.prototype.options = {
      Lua: true
    };

    Lua.prototype.beautify = function(text, language, options) {
      options.eol = this.getDefaultLineEnding('\r\n', '\n', options.end_of_line);
      return new this.Promise(function(resolve, reject) {
        var error;
        try {
          return resolve(format(text, options.indent_char.repeat(options.indent_size), this.warn, options));
        } catch (error1) {
          error = error1;
          return reject(error);
        }
      });
    };

    return Lua;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2x1YS1iZWF1dGlmaWVyL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztBQUFBO0FBQUEsTUFBQSw2QkFBQTtJQUFBOzs7RUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVA7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLE1BQUEsR0FBUyxPQUFBLENBQVEsY0FBUjs7RUFFVCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztrQkFDckIsSUFBQSxHQUFNOztrQkFDTixJQUFBLEdBQU07O2tCQUVOLE9BQUEsR0FBUztNQUNQLEdBQUEsRUFBSyxJQURFOzs7a0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7TUFDUixPQUFPLENBQUMsR0FBUixHQUFjLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixFQUE2QixJQUE3QixFQUFrQyxPQUFPLENBQUMsV0FBMUM7YUFDVixJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNYLFlBQUE7QUFBQTtpQkFDRSxPQUFBLENBQVEsTUFBQSxDQUFPLElBQVAsRUFBYSxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQXBCLENBQTJCLE9BQU8sQ0FBQyxXQUFuQyxDQUFiLEVBQThELElBQUMsQ0FBQSxJQUEvRCxFQUFxRSxPQUFyRSxDQUFSLEVBREY7U0FBQSxjQUFBO1VBRU07aUJBQ0osTUFBQSxDQUFPLEtBQVAsRUFIRjs7TUFEVyxDQUFUO0lBRkk7Ozs7S0FSdUI7QUFSbkMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiMjI1xucGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi4vYmVhdXRpZmllcicpXG5mb3JtYXQgPSByZXF1aXJlICcuL2JlYXV0aWZpZXInXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTHVhIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIkx1YSBiZWF1dGlmaWVyXCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vR2xhdmluMDAxL2F0b20tYmVhdXRpZnkvYmxvYi9tYXN0ZXIvc3JjL2JlYXV0aWZpZXJzL2x1YS1iZWF1dGlmaWVyL2JlYXV0aWZpZXIuY29mZmVlXCJcblxuICBvcHRpb25zOiB7XG4gICAgTHVhOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIG9wdGlvbnMuZW9sID0gQGdldERlZmF1bHRMaW5lRW5kaW5nKCdcXHJcXG4nLCdcXG4nLG9wdGlvbnMuZW5kX29mX2xpbmUpXG4gICAgbmV3IEBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICB0cnlcbiAgICAgICAgcmVzb2x2ZSBmb3JtYXQgdGV4dCwgb3B0aW9ucy5pbmRlbnRfY2hhci5yZXBlYXQob3B0aW9ucy5pbmRlbnRfc2l6ZSksIEB3YXJuLCBvcHRpb25zXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICByZWplY3QgZXJyb3JcbiJdfQ==
