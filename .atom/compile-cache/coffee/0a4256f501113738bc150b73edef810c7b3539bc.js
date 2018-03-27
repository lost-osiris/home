
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

    Lua.prototype.link = "https://www.perl.org/";

    Lua.prototype.isPreInstalled = false;

    Lua.prototype.options = {
      Lua: true
    };

    Lua.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var error;
        try {
          return resolve(format(text, options.indent_char.repeat(options.indent_size)));
        } catch (error1) {
          error = error1;
          return reject(error);
        }
      });
    };

    return Lua;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2x1YS1iZWF1dGlmaWVyL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztBQUFBO0FBQUEsTUFBQSw2QkFBQTtJQUFBOzs7RUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVA7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLE1BQUEsR0FBUyxPQUFBLENBQVEsY0FBUjs7RUFFVCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztrQkFDckIsSUFBQSxHQUFNOztrQkFDTixJQUFBLEdBQU07O2tCQUNOLGNBQUEsR0FBZ0I7O2tCQUVoQixPQUFBLEdBQVM7TUFDUCxHQUFBLEVBQUssSUFERTs7O2tCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO2FBQ0osSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDWCxZQUFBO0FBQUE7aUJBQ0UsT0FBQSxDQUFRLE1BQUEsQ0FBTyxJQUFQLEVBQWEsT0FBTyxDQUFDLFdBQVcsQ0FBQyxNQUFwQixDQUEyQixPQUFPLENBQUMsV0FBbkMsQ0FBYixDQUFSLEVBREY7U0FBQSxjQUFBO1VBRU07aUJBQ0osTUFBQSxDQUFPLEtBQVAsRUFIRjs7TUFEVyxDQUFUO0lBREk7Ozs7S0FUdUI7QUFSbkMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiMjI1xucGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi4vYmVhdXRpZmllcicpXG5mb3JtYXQgPSByZXF1aXJlICcuL2JlYXV0aWZpZXInXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTHVhIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIkx1YSBiZWF1dGlmaWVyXCJcbiAgbGluazogXCJodHRwczovL3d3dy5wZXJsLm9yZy9cIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgTHVhOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIG5ldyBAUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgdHJ5XG4gICAgICAgIHJlc29sdmUgZm9ybWF0IHRleHQsIG9wdGlvbnMuaW5kZW50X2NoYXIucmVwZWF0IG9wdGlvbnMuaW5kZW50X3NpemVcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIHJlamVjdCBlcnJvclxuIl19
