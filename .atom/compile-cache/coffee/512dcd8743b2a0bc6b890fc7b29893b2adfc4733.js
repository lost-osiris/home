(function() {
  "use strict";
  var Beautifier, SassConvert,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = SassConvert = (function(superClass) {
    extend(SassConvert, superClass);

    function SassConvert() {
      return SassConvert.__super__.constructor.apply(this, arguments);
    }

    SassConvert.prototype.name = "SassConvert";

    SassConvert.prototype.link = "http://sass-lang.com/documentation/file.SASS_REFERENCE.html#syntax";

    SassConvert.prototype.isPreInstalled = false;

    SassConvert.prototype.options = {
      CSS: false,
      Sass: false,
      SCSS: false
    };

    SassConvert.prototype.beautify = function(text, language, options, context) {
      var lang;
      lang = language.toLowerCase();
      return this.run("sass-convert", [this.tempFile("input", text), "--from", lang, "--to", lang]);
    };

    return SassConvert;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3Nhc3MtY29udmVydC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTs7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7OzBCQUNyQixJQUFBLEdBQU07OzBCQUNOLElBQUEsR0FBTTs7MEJBQ04sY0FBQSxHQUFnQjs7MEJBRWhCLE9BQUEsR0FFRTtNQUFBLEdBQUEsRUFBSyxLQUFMO01BQ0EsSUFBQSxFQUFNLEtBRE47TUFFQSxJQUFBLEVBQU0sS0FGTjs7OzBCQUlGLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCLEVBQTBCLE9BQTFCO0FBQ1IsVUFBQTtNQUFBLElBQUEsR0FBTyxRQUFRLENBQUMsV0FBVCxDQUFBO2FBRVAsSUFBQyxDQUFBLEdBQUQsQ0FBSyxjQUFMLEVBQXFCLENBQ25CLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQURtQixFQUVuQixRQUZtQixFQUVULElBRlMsRUFFSCxNQUZHLEVBRUssSUFGTCxDQUFyQjtJQUhROzs7O0tBWCtCO0FBSDNDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNhc3NDb252ZXJ0IGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlNhc3NDb252ZXJ0XCJcbiAgbGluazogXCJodHRwOi8vc2Fzcy1sYW5nLmNvbS9kb2N1bWVudGF0aW9uL2ZpbGUuU0FTU19SRUZFUkVOQ0UuaHRtbCNzeW50YXhcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOlxuICAgICMgVE9ETzogQWRkIHN1cHBvcnQgZm9yIG9wdGlvbnNcbiAgICBDU1M6IGZhbHNlXG4gICAgU2FzczogZmFsc2VcbiAgICBTQ1NTOiBmYWxzZVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMsIGNvbnRleHQpIC0+XG4gICAgbGFuZyA9IGxhbmd1YWdlLnRvTG93ZXJDYXNlKClcblxuICAgIEBydW4oXCJzYXNzLWNvbnZlcnRcIiwgW1xuICAgICAgQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dCksXG4gICAgICBcIi0tZnJvbVwiLCBsYW5nLCBcIi0tdG9cIiwgbGFuZ1xuICAgIF0pXG4iXX0=
