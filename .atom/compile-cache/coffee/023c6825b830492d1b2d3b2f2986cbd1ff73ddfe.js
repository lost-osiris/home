(function() {
  "use strict";
  var BashBeautify, Beautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = BashBeautify = (function(superClass) {
    extend(BashBeautify, superClass);

    function BashBeautify() {
      return BashBeautify.__super__.constructor.apply(this, arguments);
    }

    BashBeautify.prototype.name = "beautysh";

    BashBeautify.prototype.link = "https://github.com/bemeurer/beautysh";

    BashBeautify.prototype.isPreInstalled = false;

    BashBeautify.prototype.options = {
      Bash: {
        indent_size: true
      }
    };

    BashBeautify.prototype.beautify = function(text, language, options) {
      var file;
      file = this.tempFile("input", text);
      return this.run('beautysh', ['-i', options.indent_size, '-f', file], {
        help: {
          link: "https://github.com/bemeurer/beautysh"
        }
      }).then((function(_this) {
        return function() {
          return _this.readFile(file);
        };
      })(this));
    };

    return BashBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2JlYXV0eXNoLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSx3QkFBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7MkJBQ3JCLElBQUEsR0FBTTs7MkJBQ04sSUFBQSxHQUFNOzsyQkFDTixjQUFBLEdBQWdCOzsyQkFFaEIsT0FBQSxHQUFTO01BQ1AsSUFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLElBQWI7T0FGSzs7OzJCQUtULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTtNQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkI7YUFDUCxJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUwsRUFBaUIsQ0FBRSxJQUFGLEVBQVEsT0FBTyxDQUFDLFdBQWhCLEVBQTZCLElBQTdCLEVBQW1DLElBQW5DLENBQWpCLEVBQTREO1FBQUEsSUFBQSxFQUFNO1VBQUUsSUFBQSxFQUFNLHNDQUFSO1NBQU47T0FBNUQsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRE47SUFGUTs7OztLQVZnQztBQUg1QyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBCYXNoQmVhdXRpZnkgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiYmVhdXR5c2hcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9iZW1ldXJlci9iZWF1dHlzaFwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6IHtcbiAgICBCYXNoOlxuICAgICAgaW5kZW50X3NpemU6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgZmlsZSA9IEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgQHJ1bignYmVhdXR5c2gnLCBbICctaScsIG9wdGlvbnMuaW5kZW50X3NpemUsICctZicsIGZpbGUgXSwgaGVscDogeyBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9iZW1ldXJlci9iZWF1dHlzaFwiIH0pXG4gICAgLnRoZW4oPT4gQHJlYWRGaWxlIGZpbGUpXG4iXX0=
