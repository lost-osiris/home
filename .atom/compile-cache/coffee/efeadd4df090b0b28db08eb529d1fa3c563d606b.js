
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
          var editor, filePath, projectPath;
          if (options.sort_imports) {
            editor = atom.workspace.getActiveTextEditor();
            filePath = editor.getPath();
            projectPath = atom.project.relativizePath(filePath)[0];
            return _this.run("isort", ["-sp", projectPath, tempFile], {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2F1dG9wZXA4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxvQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7dUJBRXJCLElBQUEsR0FBTTs7dUJBQ04sSUFBQSxHQUFNOzt1QkFDTixjQUFBLEdBQWdCOzt1QkFFaEIsT0FBQSxHQUFTO01BQ1AsTUFBQSxFQUFRLElBREQ7Ozt1QkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7YUFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUwsRUFBaUIsQ0FDZixRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBREksRUFFZixJQUZlLEVBR3dDLCtCQUF2RCxHQUFBLENBQUMsbUJBQUQsRUFBc0IsRUFBQSxHQUFHLE9BQU8sQ0FBQyxlQUFqQyxDQUFBLEdBQUEsTUFIZSxFQUkrQiwyQkFBOUMsR0FBQSxDQUFDLGVBQUQsRUFBaUIsRUFBQSxHQUFHLE9BQU8sQ0FBQyxXQUE1QixDQUFBLEdBQUEsTUFKZSxFQUsrQixzQkFBOUMsR0FBQSxDQUFDLFVBQUQsRUFBWSxFQUFBLEdBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQWYsQ0FBb0IsR0FBcEIsQ0FBRCxDQUFkLENBQUEsR0FBQSxNQUxlLENBQWpCLEVBTUs7UUFBQSxJQUFBLEVBQU07VUFDUCxJQUFBLEVBQU0sb0NBREM7U0FBTjtPQU5MLENBU0UsQ0FBQyxJQVRILENBU1EsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ0osY0FBQTtVQUFBLElBQUcsT0FBTyxDQUFDLFlBQVg7WUFDRSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO1lBQ1QsUUFBQSxHQUFXLE1BQU0sQ0FBQyxPQUFQLENBQUE7WUFDWCxXQUFBLEdBQWMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQTRCLFFBQTVCLENBQXNDLENBQUEsQ0FBQTttQkFFcEQsS0FBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLEVBQ0UsQ0FBQyxLQUFELEVBQVEsV0FBUixFQUFxQixRQUFyQixDQURGLEVBRUU7Y0FBQSxJQUFBLEVBQU07Z0JBQ0osSUFBQSxFQUFNLHlDQURGO2VBQU47YUFGRixDQUtBLENBQUMsSUFMRCxDQUtNLFNBQUE7cUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO1lBREksQ0FMTixFQUxGO1dBQUEsTUFBQTttQkFjRSxLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVYsRUFkRjs7UUFESTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FUUjtJQURROzs7O0tBVjRCO0FBUHhDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vaGhhdHRvL2F1dG9wZXA4XG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEF1dG9wZXA4IGV4dGVuZHMgQmVhdXRpZmllclxuXG4gIG5hbWU6IFwiYXV0b3BlcDhcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDhcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgUHl0aG9uOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBydW4oXCJhdXRvcGVwOFwiLCBbXG4gICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBcIi1pXCJcbiAgICAgIFtcIi0tbWF4LWxpbmUtbGVuZ3RoXCIsIFwiI3tvcHRpb25zLm1heF9saW5lX2xlbmd0aH1cIl0gaWYgb3B0aW9ucy5tYXhfbGluZV9sZW5ndGg/XG4gICAgICBbXCItLWluZGVudC1zaXplXCIsXCIje29wdGlvbnMuaW5kZW50X3NpemV9XCJdIGlmIG9wdGlvbnMuaW5kZW50X3NpemU/XG4gICAgICBbXCItLWlnbm9yZVwiLFwiI3tvcHRpb25zLmlnbm9yZS5qb2luKCcsJyl9XCJdIGlmIG9wdGlvbnMuaWdub3JlP1xuICAgICAgXSwgaGVscDoge1xuICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDhcIlxuICAgICAgfSlcbiAgICAgIC50aGVuKD0+XG4gICAgICAgIGlmIG9wdGlvbnMuc29ydF9pbXBvcnRzXG4gICAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgICAgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgICAgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZmlsZVBhdGgpWzBdXG5cbiAgICAgICAgICBAcnVuKFwiaXNvcnRcIixcbiAgICAgICAgICAgIFtcIi1zcFwiLCBwcm9qZWN0UGF0aCwgdGVtcEZpbGVdLFxuICAgICAgICAgICAgaGVscDoge1xuICAgICAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS90aW1vdGh5Y3Jvc2xleS9pc29ydFwiXG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbig9PlxuICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICAgIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgIClcbiJdfQ==
