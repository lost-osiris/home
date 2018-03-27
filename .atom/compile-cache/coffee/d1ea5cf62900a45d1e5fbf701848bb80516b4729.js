(function() {
  "use strict";
  var Beautifier, ESLintFixer, Path, allowUnsafeNewFunction,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  Path = require('path');

  allowUnsafeNewFunction = require('loophole').allowUnsafeNewFunction;

  module.exports = ESLintFixer = (function(superClass) {
    extend(ESLintFixer, superClass);

    function ESLintFixer() {
      return ESLintFixer.__super__.constructor.apply(this, arguments);
    }

    ESLintFixer.prototype.name = "ESLint Fixer";

    ESLintFixer.prototype.link = "https://github.com/eslint/eslint";

    ESLintFixer.prototype.options = {
      JavaScript: false
    };

    ESLintFixer.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var editor, filePath, projectPath, result;
        editor = atom.workspace.getActiveTextEditor();
        filePath = editor.getPath();
        projectPath = atom.project.relativizePath(filePath)[0];
        result = null;
        return allowUnsafeNewFunction(function() {
          var CLIEngine, cli, err, importPath;
          importPath = Path.join(projectPath, 'node_modules', 'eslint');
          try {
            CLIEngine = require(importPath).CLIEngine;
            cli = new CLIEngine({
              fix: true,
              cwd: projectPath
            });
            result = cli.executeOnText(text).results[0];
            return resolve(result.output);
          } catch (error) {
            err = error;
            return reject(err);
          }
        });
      });
    };

    return ESLintFixer;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2VzbGludC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEscURBQUE7SUFBQTs7O0VBRUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDTix5QkFBMEIsT0FBQSxDQUFRLFVBQVI7O0VBRTNCLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7OzBCQUNyQixJQUFBLEdBQU07OzBCQUNOLElBQUEsR0FBTTs7MEJBRU4sT0FBQSxHQUFTO01BQ1AsVUFBQSxFQUFZLEtBREw7OzswQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDbEIsWUFBQTtRQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7UUFDVCxRQUFBLEdBQVcsTUFBTSxDQUFDLE9BQVAsQ0FBQTtRQUNYLFdBQUEsR0FBYyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWIsQ0FBNEIsUUFBNUIsQ0FBc0MsQ0FBQSxDQUFBO1FBRXBELE1BQUEsR0FBUztlQUNULHNCQUFBLENBQXVCLFNBQUE7QUFDckIsY0FBQTtVQUFBLFVBQUEsR0FBYSxJQUFJLENBQUMsSUFBTCxDQUFVLFdBQVYsRUFBdUIsY0FBdkIsRUFBdUMsUUFBdkM7QUFDYjtZQUNFLFNBQUEsR0FBWSxPQUFBLENBQVEsVUFBUixDQUFtQixDQUFDO1lBRWhDLEdBQUEsR0FBVSxJQUFBLFNBQUEsQ0FBVTtjQUFBLEdBQUEsRUFBSyxJQUFMO2NBQVcsR0FBQSxFQUFLLFdBQWhCO2FBQVY7WUFDVixNQUFBLEdBQVMsR0FBRyxDQUFDLGFBQUosQ0FBa0IsSUFBbEIsQ0FBdUIsQ0FBQyxPQUFRLENBQUEsQ0FBQTttQkFFekMsT0FBQSxDQUFRLE1BQU0sQ0FBQyxNQUFmLEVBTkY7V0FBQSxhQUFBO1lBT007bUJBQ0osTUFBQSxDQUFPLEdBQVAsRUFSRjs7UUFGcUIsQ0FBdkI7TUFOa0IsQ0FBVDtJQURIOzs7O0tBUitCO0FBTjNDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcblxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5QYXRoID0gcmVxdWlyZSgncGF0aCcpXG57YWxsb3dVbnNhZmVOZXdGdW5jdGlvbn0gPSByZXF1aXJlICdsb29waG9sZSdcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBFU0xpbnRGaXhlciBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJFU0xpbnQgRml4ZXJcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9lc2xpbnQvZXNsaW50XCJcblxuICBvcHRpb25zOiB7XG4gICAgSmF2YVNjcmlwdDogZmFsc2VcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVQYXRoKVswXVxuXG4gICAgICByZXN1bHQgPSBudWxsXG4gICAgICBhbGxvd1Vuc2FmZU5ld0Z1bmN0aW9uIC0+XG4gICAgICAgIGltcG9ydFBhdGggPSBQYXRoLmpvaW4ocHJvamVjdFBhdGgsICdub2RlX21vZHVsZXMnLCAnZXNsaW50JylcbiAgICAgICAgdHJ5XG4gICAgICAgICAgQ0xJRW5naW5lID0gcmVxdWlyZShpbXBvcnRQYXRoKS5DTElFbmdpbmVcblxuICAgICAgICAgIGNsaSA9IG5ldyBDTElFbmdpbmUoZml4OiB0cnVlLCBjd2Q6IHByb2plY3RQYXRoKVxuICAgICAgICAgIHJlc3VsdCA9IGNsaS5leGVjdXRlT25UZXh0KHRleHQpLnJlc3VsdHNbMF1cblxuICAgICAgICAgIHJlc29sdmUgcmVzdWx0Lm91dHB1dFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICByZWplY3QoZXJyKVxuICAgIClcbiJdfQ==
