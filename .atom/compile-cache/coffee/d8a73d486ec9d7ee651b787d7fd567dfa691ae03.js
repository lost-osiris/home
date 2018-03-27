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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3Nhc3MtY29udmVydC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTs7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7OzBCQUNyQixJQUFBLEdBQU07OzBCQUNOLElBQUEsR0FBTTs7MEJBRU4sT0FBQSxHQUVFO01BQUEsR0FBQSxFQUFLLEtBQUw7TUFDQSxJQUFBLEVBQU0sS0FETjtNQUVBLElBQUEsRUFBTSxLQUZOOzs7MEJBSUYsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsRUFBMEIsT0FBMUI7QUFDUixVQUFBO01BQUEsSUFBQSxHQUFPLFFBQVEsQ0FBQyxXQUFULENBQUE7YUFFUCxJQUFDLENBQUEsR0FBRCxDQUFLLGNBQUwsRUFBcUIsQ0FDbkIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBRG1CLEVBRW5CLFFBRm1CLEVBRVQsSUFGUyxFQUVILE1BRkcsRUFFSyxJQUZMLENBQXJCO0lBSFE7Ozs7S0FWK0I7QUFIM0MiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgU2Fzc0NvbnZlcnQgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiU2Fzc0NvbnZlcnRcIlxuICBsaW5rOiBcImh0dHA6Ly9zYXNzLWxhbmcuY29tL2RvY3VtZW50YXRpb24vZmlsZS5TQVNTX1JFRkVSRU5DRS5odG1sI3N5bnRheFwiXG5cbiAgb3B0aW9uczpcbiAgICAjIFRPRE86IEFkZCBzdXBwb3J0IGZvciBvcHRpb25zXG4gICAgQ1NTOiBmYWxzZVxuICAgIFNhc3M6IGZhbHNlXG4gICAgU0NTUzogZmFsc2VcblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zLCBjb250ZXh0KSAtPlxuICAgIGxhbmcgPSBsYW5ndWFnZS50b0xvd2VyQ2FzZSgpXG5cbiAgICBAcnVuKFwic2Fzcy1jb252ZXJ0XCIsIFtcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpLFxuICAgICAgXCItLWZyb21cIiwgbGFuZywgXCItLXRvXCIsIGxhbmdcbiAgICBdKVxuIl19
