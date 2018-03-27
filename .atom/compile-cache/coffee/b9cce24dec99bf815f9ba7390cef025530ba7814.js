
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  "use strict";
  var Autopep8, Beautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Autopep8 = (function(superClass) {
    extend(Autopep8, superClass);

    function Autopep8() {
      return Autopep8.__super__.constructor.apply(this, arguments);
    }

    Autopep8.prototype.name = "autopep8";

    Autopep8.prototype.link = "https://github.com/hhatto/autopep8";

    Autopep8.prototype.isPreInstalled = false;

    Autopep8.prototype.options = {
      Python: true
    };

    Autopep8.prototype.beautify = function(text, language, options) {
      var tempFile;
      return this.run("autopep8", [tempFile = this.tempFile("input", text), "-i", options.max_line_length != null ? ["--max-line-length", "" + options.max_line_length] : void 0, options.indent_size != null ? ["--indent-size", "" + options.indent_size] : void 0, options.ignore != null ? ["--ignore", "" + (options.ignore.join(','))] : void 0], {
        help: {
          link: "https://github.com/hhatto/autopep8"
        }
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

    return Autopep8;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2F1dG9wZXA4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxvQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7dUJBRXJCLElBQUEsR0FBTTs7dUJBQ04sSUFBQSxHQUFNOzt1QkFDTixjQUFBLEdBQWdCOzt1QkFFaEIsT0FBQSxHQUFTO01BQ1AsTUFBQSxFQUFRLElBREQ7Ozt1QkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7YUFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUwsRUFBaUIsQ0FDZixRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBREksRUFFZixJQUZlLEVBR3dDLCtCQUF2RCxHQUFBLENBQUMsbUJBQUQsRUFBc0IsRUFBQSxHQUFHLE9BQU8sQ0FBQyxlQUFqQyxDQUFBLEdBQUEsTUFIZSxFQUkrQiwyQkFBOUMsR0FBQSxDQUFDLGVBQUQsRUFBaUIsRUFBQSxHQUFHLE9BQU8sQ0FBQyxXQUE1QixDQUFBLEdBQUEsTUFKZSxFQUsrQixzQkFBOUMsR0FBQSxDQUFDLFVBQUQsRUFBWSxFQUFBLEdBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQWYsQ0FBb0IsR0FBcEIsQ0FBRCxDQUFkLENBQUEsR0FBQSxNQUxlLENBQWpCLEVBTUs7UUFBQSxJQUFBLEVBQU07VUFDUCxJQUFBLEVBQU0sb0NBREM7U0FBTjtPQU5MLENBU0UsQ0FBQyxJQVRILENBU1EsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ0osSUFBRyxPQUFPLENBQUMsWUFBWDttQkFDRSxLQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsRUFDRSxDQUFDLFFBQUQsQ0FERixFQUVFO2NBQUEsSUFBQSxFQUFNO2dCQUNKLElBQUEsRUFBTSx5Q0FERjtlQUFOO2FBRkYsQ0FLQSxDQUFDLElBTEQsQ0FLTSxTQUFBO3FCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtZQURJLENBTE4sRUFERjtXQUFBLE1BQUE7bUJBVUUsS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBVkY7O1FBREk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBVFI7SUFEUTs7OztLQVY0QjtBQVB4QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL2hoYXR0by9hdXRvcGVwOFxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBBdXRvcGVwOCBleHRlbmRzIEJlYXV0aWZpZXJcblxuICBuYW1lOiBcImF1dG9wZXA4XCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vaGhhdHRvL2F1dG9wZXA4XCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIFB5dGhvbjogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBAcnVuKFwiYXV0b3BlcDhcIiwgW1xuICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KVxuICAgICAgXCItaVwiXG4gICAgICBbXCItLW1heC1saW5lLWxlbmd0aFwiLCBcIiN7b3B0aW9ucy5tYXhfbGluZV9sZW5ndGh9XCJdIGlmIG9wdGlvbnMubWF4X2xpbmVfbGVuZ3RoP1xuICAgICAgW1wiLS1pbmRlbnQtc2l6ZVwiLFwiI3tvcHRpb25zLmluZGVudF9zaXplfVwiXSBpZiBvcHRpb25zLmluZGVudF9zaXplP1xuICAgICAgW1wiLS1pZ25vcmVcIixcIiN7b3B0aW9ucy5pZ25vcmUuam9pbignLCcpfVwiXSBpZiBvcHRpb25zLmlnbm9yZT9cbiAgICAgIF0sIGhlbHA6IHtcbiAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vaGhhdHRvL2F1dG9wZXA4XCJcbiAgICAgIH0pXG4gICAgICAudGhlbig9PlxuICAgICAgICBpZiBvcHRpb25zLnNvcnRfaW1wb3J0c1xuICAgICAgICAgIEBydW4oXCJpc29ydFwiLFxuICAgICAgICAgICAgW3RlbXBGaWxlXSxcbiAgICAgICAgICAgIGhlbHA6IHtcbiAgICAgICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vdGltb3RoeWNyb3NsZXkvaXNvcnRcIlxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICApXG4iXX0=
