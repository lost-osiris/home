
/*
Requires https://github.com/google/yapf
 */

(function() {
  "use strict";
  var Beautifier, Yapf,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Yapf = (function(superClass) {
    extend(Yapf, superClass);

    function Yapf() {
      return Yapf.__super__.constructor.apply(this, arguments);
    }

    Yapf.prototype.name = "yapf";

    Yapf.prototype.link = "https://github.com/google/yapf";

    Yapf.prototype.options = {
      Python: false
    };

    Yapf.prototype.beautify = function(text, language, options) {
      var tempFile;
      return this.run("yapf", ["-i", tempFile = this.tempFile("input", text)], {
        help: {
          link: "https://github.com/google/yapf"
        },
        ignoreReturnCode: true
      }).then((function(_this) {
        return function() {
          if (options.sort_imports) {
            return _this.run("isort", [tempFile], {
              help: {
                link: "https://github.com/timothycrosley/isort"
              }
            }).then(function() {
              return _this.readFile(tempFile);
            });
          } else {
            return _this.readFile(tempFile);
          }
        };
      })(this));
    };

    return Yapf;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3lhcGYuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLGdCQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OzttQkFFckIsSUFBQSxHQUFNOzttQkFDTixJQUFBLEdBQU07O21CQUVOLE9BQUEsR0FBUztNQUNQLE1BQUEsRUFBUSxLQUREOzs7bUJBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO2FBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxNQUFMLEVBQWEsQ0FDWCxJQURXLEVBRVgsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQUZBLENBQWIsRUFHSztRQUFBLElBQUEsRUFBTTtVQUNQLElBQUEsRUFBTSxnQ0FEQztTQUFOO1FBRUEsZ0JBQUEsRUFBa0IsSUFGbEI7T0FITCxDQU1FLENBQUMsSUFOSCxDQU1RLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNKLElBQUcsT0FBTyxDQUFDLFlBQVg7bUJBQ0UsS0FBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLEVBQ0UsQ0FBQyxRQUFELENBREYsRUFFRTtjQUFBLElBQUEsRUFBTTtnQkFDSixJQUFBLEVBQU0seUNBREY7ZUFBTjthQUZGLENBS0EsQ0FBQyxJQUxELENBS00sU0FBQTtxQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7WUFESSxDQUxOLEVBREY7V0FBQSxNQUFBO21CQVVFLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQVZGOztRQURJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQU5SO0lBRFE7Ozs7S0FUd0I7QUFQcEMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUveWFwZlxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBZYXBmIGV4dGVuZHMgQmVhdXRpZmllclxuXG4gIG5hbWU6IFwieWFwZlwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS95YXBmXCJcblxuICBvcHRpb25zOiB7XG4gICAgUHl0aG9uOiBmYWxzZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBAcnVuKFwieWFwZlwiLCBbXG4gICAgICBcIi1pXCJcbiAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dClcbiAgICAgIF0sIGhlbHA6IHtcbiAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL3lhcGZcIlxuICAgICAgfSwgaWdub3JlUmV0dXJuQ29kZTogdHJ1ZSlcbiAgICAgIC50aGVuKD0+XG4gICAgICAgIGlmIG9wdGlvbnMuc29ydF9pbXBvcnRzXG4gICAgICAgICAgQHJ1bihcImlzb3J0XCIsXG4gICAgICAgICAgICBbdGVtcEZpbGVdLFxuICAgICAgICAgICAgaGVscDoge1xuICAgICAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS90aW1vdGh5Y3Jvc2xleS9pc29ydFwiXG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbig9PlxuICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICAgIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgIClcbiJdfQ==
