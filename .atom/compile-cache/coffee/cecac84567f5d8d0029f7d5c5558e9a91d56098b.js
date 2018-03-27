
/*
 */

(function() {
  var Beautifier, Lua, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require("path");

  "use strict";

  Beautifier = require('../beautifier');

  module.exports = Lua = (function(superClass) {
    extend(Lua, superClass);

    function Lua() {
      return Lua.__super__.constructor.apply(this, arguments);
    }

    Lua.prototype.name = "Lua beautifier";

    Lua.prototype.link = "https://github.com/Glavin001/atom-beautify/blob/master/src/beautifiers/lua-beautifier/beautifier.pl";

    Lua.prototype.options = {
      Lua: true
    };

    Lua.prototype.beautify = function(text, language, options) {
      var lua_beautifier;
      lua_beautifier = path.resolve(__dirname, "beautifier.pl");
      return this.run("perl", [lua_beautifier, '<', this.tempFile("input", text)]);
    };

    return Lua;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2x1YS1iZWF1dGlmaWVyL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztBQUFBO0FBQUEsTUFBQSxxQkFBQTtJQUFBOzs7RUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVA7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O2tCQUNyQixJQUFBLEdBQU07O2tCQUNOLElBQUEsR0FBTTs7a0JBRU4sT0FBQSxHQUFTO01BQ1AsR0FBQSxFQUFLLElBREU7OztrQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7TUFBQSxjQUFBLEdBQWlCLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixlQUF4QjthQUNqQixJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUwsRUFBYSxDQUNYLGNBRFcsRUFFWCxHQUZXLEVBR1gsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBSFcsQ0FBYjtJQUZROzs7O0tBUnVCO0FBUG5DIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4jIyNcbnBhdGggPSByZXF1aXJlKFwicGF0aFwiKVxuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4uL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEx1YSBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJMdWEgYmVhdXRpZmllclwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0dsYXZpbjAwMS9hdG9tLWJlYXV0aWZ5L2Jsb2IvbWFzdGVyL3NyYy9iZWF1dGlmaWVycy9sdWEtYmVhdXRpZmllci9iZWF1dGlmaWVyLnBsXCJcblxuICBvcHRpb25zOiB7XG4gICAgTHVhOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIGx1YV9iZWF1dGlmaWVyID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJiZWF1dGlmaWVyLnBsXCIpXG4gICAgQHJ1bihcInBlcmxcIiwgW1xuICAgICAgbHVhX2JlYXV0aWZpZXIsXG4gICAgICAnPCcsXG4gICAgICBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KVxuICAgICAgXSlcbiJdfQ==
