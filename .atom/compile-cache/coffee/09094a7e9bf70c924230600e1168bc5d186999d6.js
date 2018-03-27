
/*
Requires [dfmt](https://github.com/Hackerpilot/dfmt)
 */

(function() {
  "use strict";
  var Beautifier, Dfmt,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Dfmt = (function(superClass) {
    extend(Dfmt, superClass);

    function Dfmt() {
      return Dfmt.__super__.constructor.apply(this, arguments);
    }

    Dfmt.prototype.name = "dfmt";

    Dfmt.prototype.link = "https://github.com/Hackerpilot/dfmt";

    Dfmt.prototype.options = {
      D: false
    };

    Dfmt.prototype.beautify = function(text, language, options) {
      return this.run("dfmt", [this.tempFile("input", text)]);
    };

    return Dfmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2RmbXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBR0E7QUFIQSxNQUFBLGdCQUFBO0lBQUE7OztFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OzttQkFDckIsSUFBQSxHQUFNOzttQkFDTixJQUFBLEdBQU07O21CQUVOLE9BQUEsR0FBUztNQUNQLENBQUEsRUFBRyxLQURJOzs7bUJBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUwsRUFBYSxDQUNYLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQURXLENBQWI7SUFEUTs7OztLQVJ3QjtBQU5wQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgW2RmbXRdKGh0dHBzOi8vZ2l0aHViLmNvbS9IYWNrZXJwaWxvdC9kZm10KVxuIyMjXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRGZtdCBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJkZm10XCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vSGFja2VycGlsb3QvZGZtdFwiXG5cbiAgb3B0aW9uczoge1xuICAgIEQ6IGZhbHNlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBydW4oXCJkZm10XCIsIFtcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBdKVxuIl19
