
/*
Requires https://github.com/OCamlPro/ocp-indent
 */

(function() {
  "use strict";
  var Beautifier, OCPIndent,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = OCPIndent = (function(superClass) {
    extend(OCPIndent, superClass);

    function OCPIndent() {
      return OCPIndent.__super__.constructor.apply(this, arguments);
    }

    OCPIndent.prototype.name = "ocp-indent";

    OCPIndent.prototype.link = "https://www.typerex.org/ocp-indent.html";

    OCPIndent.prototype.isPreInstalled = false;

    OCPIndent.prototype.options = {
      OCaml: true
    };

    OCPIndent.prototype.beautify = function(text, language, options) {
      return this.run("ocp-indent", [this.tempFile("input", text)], {
        help: {
          link: "https://www.typerex.org/ocp-indent.html"
        }
      });
    };

    return OCPIndent;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL29jcC1pbmRlbnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLHFCQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt3QkFDckIsSUFBQSxHQUFNOzt3QkFDTixJQUFBLEdBQU07O3dCQUNOLGNBQUEsR0FBZ0I7O3dCQUVoQixPQUFBLEdBQVM7TUFDUCxLQUFBLEVBQU8sSUFEQTs7O3dCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxZQUFMLEVBQW1CLENBQ2pCLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQURpQixDQUFuQixFQUVLO1FBQ0QsSUFBQSxFQUFNO1VBQ0osSUFBQSxFQUFNLHlDQURGO1NBREw7T0FGTDtJQURROzs7O0tBVDZCO0FBUHpDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vT0NhbWxQcm8vb2NwLWluZGVudFxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBPQ1BJbmRlbnQgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwib2NwLWluZGVudFwiXG4gIGxpbms6IFwiaHR0cHM6Ly93d3cudHlwZXJleC5vcmcvb2NwLWluZGVudC5odG1sXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIE9DYW1sOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBydW4oXCJvY3AtaW5kZW50XCIsIFtcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBdLCB7XG4gICAgICAgIGhlbHA6IHtcbiAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vd3d3LnR5cGVyZXgub3JnL29jcC1pbmRlbnQuaHRtbFwiXG4gICAgICAgIH1cbiAgICAgIH0pXG4iXX0=
