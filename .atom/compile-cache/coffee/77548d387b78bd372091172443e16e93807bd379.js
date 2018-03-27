
/*
Requires http://uncrustify.sourceforge.net/
 */

(function() {
  "use strict";
  var Beautifier, Uncrustify, _, cfg, expandHomeDir, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('../beautifier');

  cfg = require("./cfg");

  path = require("path");

  expandHomeDir = require('expand-home-dir');

  _ = require('lodash');

  module.exports = Uncrustify = (function(superClass) {
    extend(Uncrustify, superClass);

    function Uncrustify() {
      return Uncrustify.__super__.constructor.apply(this, arguments);
    }

    Uncrustify.prototype.name = "Uncrustify";

    Uncrustify.prototype.link = "https://github.com/uncrustify/uncrustify";

    Uncrustify.prototype.isPreInstalled = false;

    Uncrustify.prototype.options = {
      Apex: true,
      C: true,
      "C++": true,
      "C#": true,
      "Objective-C": true,
      D: true,
      Pawn: true,
      Vala: true,
      Java: true,
      Arduino: true
    };

    Uncrustify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var basePath, configPath, editor, expandedConfigPath, projectPath;
        configPath = options.configPath;
        if (!configPath) {
          return cfg(options, function(error, cPath) {
            if (error) {
              throw error;
            }
            return resolve(cPath);
          });
        } else {
          editor = atom.workspace.getActiveTextEditor();
          if (editor != null) {
            basePath = path.dirname(editor.getPath());
            projectPath = atom.workspace.project.getPaths()[0];
            expandedConfigPath = expandHomeDir(configPath);
            configPath = path.resolve(projectPath, expandedConfigPath);
            return resolve(configPath);
          } else {
            return reject(new Error("No Uncrustify Config Path set! Please configure Uncrustify with Atom Beautify."));
          }
        }
      }).then((function(_this) {
        return function(configPath) {
          var lang, outputFile;
          lang = "C";
          switch (language) {
            case "Apex":
              lang = "Apex";
              break;
            case "C":
              lang = "C";
              break;
            case "C++":
              lang = "CPP";
              break;
            case "C#":
              lang = "CS";
              break;
            case "Objective-C":
            case "Objective-C++":
              lang = "OC+";
              break;
            case "D":
              lang = "D";
              break;
            case "Pawn":
              lang = "PAWN";
              break;
            case "Vala":
              lang = "VALA";
              break;
            case "Java":
              lang = "JAVA";
              break;
            case "Arduino":
              lang = "CPP";
          }
          return _this.run("uncrustify", ["-c", configPath, "-f", _this.tempFile("input", text), "-o", outputFile = _this.tempFile("output", text), "-l", lang], {
            help: {
              link: "http://sourceforge.net/projects/uncrustify/"
            }
          }).then(function() {
            return _this.readFile(outputFile);
          });
        };
      })(this));
    };

    return Uncrustify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3VuY3J1c3RpZnkvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBR0E7QUFIQSxNQUFBLG1EQUFBO0lBQUE7OztFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDYixHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVI7O0VBQ04sSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGlCQUFSOztFQUNoQixDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0VBRUosTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7eUJBQ3JCLElBQUEsR0FBTTs7eUJBQ04sSUFBQSxHQUFNOzt5QkFDTixjQUFBLEdBQWdCOzt5QkFFaEIsT0FBQSxHQUFTO01BQ1AsSUFBQSxFQUFNLElBREM7TUFFUCxDQUFBLEVBQUcsSUFGSTtNQUdQLEtBQUEsRUFBTyxJQUhBO01BSVAsSUFBQSxFQUFNLElBSkM7TUFLUCxhQUFBLEVBQWUsSUFMUjtNQU1QLENBQUEsRUFBRyxJQU5JO01BT1AsSUFBQSxFQUFNLElBUEM7TUFRUCxJQUFBLEVBQU0sSUFSQztNQVNQLElBQUEsRUFBTSxJQVRDO01BVVAsT0FBQSxFQUFTLElBVkY7Ozt5QkFhVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUVSLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDbEIsWUFBQTtRQUFBLFVBQUEsR0FBYSxPQUFPLENBQUM7UUFDckIsSUFBQSxDQUFPLFVBQVA7aUJBRUUsR0FBQSxDQUFJLE9BQUosRUFBYSxTQUFDLEtBQUQsRUFBUSxLQUFSO1lBQ1gsSUFBZSxLQUFmO0FBQUEsb0JBQU0sTUFBTjs7bUJBQ0EsT0FBQSxDQUFRLEtBQVI7VUFGVyxDQUFiLEVBRkY7U0FBQSxNQUFBO1VBT0UsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtVQUNULElBQUcsY0FBSDtZQUNFLFFBQUEsR0FBVyxJQUFJLENBQUMsT0FBTCxDQUFhLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBYjtZQUNYLFdBQUEsR0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUF2QixDQUFBLENBQWtDLENBQUEsQ0FBQTtZQUdoRCxrQkFBQSxHQUFxQixhQUFBLENBQWMsVUFBZDtZQUNyQixVQUFBLEdBQWEsSUFBSSxDQUFDLE9BQUwsQ0FBYSxXQUFiLEVBQTBCLGtCQUExQjttQkFDYixPQUFBLENBQVEsVUFBUixFQVBGO1dBQUEsTUFBQTttQkFTRSxNQUFBLENBQVcsSUFBQSxLQUFBLENBQU0sZ0ZBQU4sQ0FBWCxFQVRGO1dBUkY7O01BRmtCLENBQVQsQ0FxQlgsQ0FBQyxJQXJCVSxDQXFCTCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsVUFBRDtBQUlKLGNBQUE7VUFBQSxJQUFBLEdBQU87QUFDUCxrQkFBTyxRQUFQO0FBQUEsaUJBQ08sTUFEUDtjQUVJLElBQUEsR0FBTztBQURKO0FBRFAsaUJBR08sR0FIUDtjQUlJLElBQUEsR0FBTztBQURKO0FBSFAsaUJBS08sS0FMUDtjQU1JLElBQUEsR0FBTztBQURKO0FBTFAsaUJBT08sSUFQUDtjQVFJLElBQUEsR0FBTztBQURKO0FBUFAsaUJBU08sYUFUUDtBQUFBLGlCQVNzQixlQVR0QjtjQVVJLElBQUEsR0FBTztBQURXO0FBVHRCLGlCQVdPLEdBWFA7Y0FZSSxJQUFBLEdBQU87QUFESjtBQVhQLGlCQWFPLE1BYlA7Y0FjSSxJQUFBLEdBQU87QUFESjtBQWJQLGlCQWVPLE1BZlA7Y0FnQkksSUFBQSxHQUFPO0FBREo7QUFmUCxpQkFpQk8sTUFqQlA7Y0FrQkksSUFBQSxHQUFPO0FBREo7QUFqQlAsaUJBbUJPLFNBbkJQO2NBb0JJLElBQUEsR0FBTztBQXBCWDtpQkFzQkEsS0FBQyxDQUFBLEdBQUQsQ0FBSyxZQUFMLEVBQW1CLENBQ2pCLElBRGlCLEVBRWpCLFVBRmlCLEVBR2pCLElBSGlCLEVBSWpCLEtBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQUppQixFQUtqQixJQUxpQixFQU1qQixVQUFBLEdBQWEsS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBQW9CLElBQXBCLENBTkksRUFPakIsSUFQaUIsRUFRakIsSUFSaUIsQ0FBbkIsRUFTSztZQUFBLElBQUEsRUFBTTtjQUNQLElBQUEsRUFBTSw2Q0FEQzthQUFOO1dBVEwsQ0FZRSxDQUFDLElBWkgsQ0FZUSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsVUFBVjtVQURJLENBWlI7UUEzQkk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBckJLO0lBRkg7Ozs7S0FsQjhCO0FBVjFDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwOi8vdW5jcnVzdGlmeS5zb3VyY2Vmb3JnZS5uZXQvXG4jIyNcblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi4vYmVhdXRpZmllcicpXG5jZmcgPSByZXF1aXJlKFwiLi9jZmdcIilcbnBhdGggPSByZXF1aXJlKFwicGF0aFwiKVxuZXhwYW5kSG9tZURpciA9IHJlcXVpcmUoJ2V4cGFuZC1ob21lLWRpcicpXG5fID0gcmVxdWlyZSgnbG9kYXNoJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBVbmNydXN0aWZ5IGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlVuY3J1c3RpZnlcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS91bmNydXN0aWZ5L3VuY3J1c3RpZnlcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgQXBleDogdHJ1ZVxuICAgIEM6IHRydWVcbiAgICBcIkMrK1wiOiB0cnVlXG4gICAgXCJDI1wiOiB0cnVlXG4gICAgXCJPYmplY3RpdmUtQ1wiOiB0cnVlXG4gICAgRDogdHJ1ZVxuICAgIFBhd246IHRydWVcbiAgICBWYWxhOiB0cnVlXG4gICAgSmF2YTogdHJ1ZVxuICAgIEFyZHVpbm86IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgIyBjb25zb2xlLmxvZygndW5jcnVzdGlmeS5iZWF1dGlmeScsIGxhbmd1YWdlLCBvcHRpb25zKVxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIGNvbmZpZ1BhdGggPSBvcHRpb25zLmNvbmZpZ1BhdGhcbiAgICAgIHVubGVzcyBjb25maWdQYXRoXG4gICAgICAgICMgTm8gY3VzdG9tIGNvbmZpZyBwYXRoXG4gICAgICAgIGNmZyBvcHRpb25zLCAoZXJyb3IsIGNQYXRoKSAtPlxuICAgICAgICAgIHRocm93IGVycm9yIGlmIGVycm9yXG4gICAgICAgICAgcmVzb2x2ZSBjUGF0aFxuICAgICAgZWxzZVxuICAgICAgICAjIEhhcyBjdXN0b20gY29uZmlnIHBhdGhcbiAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIGlmIGVkaXRvcj9cbiAgICAgICAgICBiYXNlUGF0aCA9IHBhdGguZGlybmFtZShlZGl0b3IuZ2V0UGF0aCgpKVxuICAgICAgICAgIHByb2plY3RQYXRoID0gYXRvbS53b3Jrc3BhY2UucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICAgICAgIyBjb25zb2xlLmxvZyhiYXNlUGF0aCk7XG4gICAgICAgICAgIyBFeHBhbmQgSG9tZSBEaXJlY3RvcnkgaW4gQ29uZmlnIFBhdGhcbiAgICAgICAgICBleHBhbmRlZENvbmZpZ1BhdGggPSBleHBhbmRIb21lRGlyKGNvbmZpZ1BhdGgpXG4gICAgICAgICAgY29uZmlnUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9qZWN0UGF0aCwgZXhwYW5kZWRDb25maWdQYXRoKVxuICAgICAgICAgIHJlc29sdmUgY29uZmlnUGF0aFxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIk5vIFVuY3J1c3RpZnkgQ29uZmlnIFBhdGggc2V0ISBQbGVhc2UgY29uZmlndXJlIFVuY3J1c3RpZnkgd2l0aCBBdG9tIEJlYXV0aWZ5LlwiKSlcbiAgICApXG4gICAgLnRoZW4oKGNvbmZpZ1BhdGgpID0+XG5cblxuICAgICAgIyBTZWxlY3QgVW5jcnVzdGlmeSBsYW5ndWFnZVxuICAgICAgbGFuZyA9IFwiQ1wiICMgRGVmYXVsdCBpcyBDXG4gICAgICBzd2l0Y2ggbGFuZ3VhZ2VcbiAgICAgICAgd2hlbiBcIkFwZXhcIlxuICAgICAgICAgIGxhbmcgPSBcIkFwZXhcIlxuICAgICAgICB3aGVuIFwiQ1wiXG4gICAgICAgICAgbGFuZyA9IFwiQ1wiXG4gICAgICAgIHdoZW4gXCJDKytcIlxuICAgICAgICAgIGxhbmcgPSBcIkNQUFwiXG4gICAgICAgIHdoZW4gXCJDI1wiXG4gICAgICAgICAgbGFuZyA9IFwiQ1NcIlxuICAgICAgICB3aGVuIFwiT2JqZWN0aXZlLUNcIiwgXCJPYmplY3RpdmUtQysrXCJcbiAgICAgICAgICBsYW5nID0gXCJPQytcIlxuICAgICAgICB3aGVuIFwiRFwiXG4gICAgICAgICAgbGFuZyA9IFwiRFwiXG4gICAgICAgIHdoZW4gXCJQYXduXCJcbiAgICAgICAgICBsYW5nID0gXCJQQVdOXCJcbiAgICAgICAgd2hlbiBcIlZhbGFcIlxuICAgICAgICAgIGxhbmcgPSBcIlZBTEFcIlxuICAgICAgICB3aGVuIFwiSmF2YVwiXG4gICAgICAgICAgbGFuZyA9IFwiSkFWQVwiXG4gICAgICAgIHdoZW4gXCJBcmR1aW5vXCJcbiAgICAgICAgICBsYW5nID0gXCJDUFBcIlxuXG4gICAgICBAcnVuKFwidW5jcnVzdGlmeVwiLCBbXG4gICAgICAgIFwiLWNcIlxuICAgICAgICBjb25maWdQYXRoXG4gICAgICAgIFwiLWZcIlxuICAgICAgICBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KVxuICAgICAgICBcIi1vXCJcbiAgICAgICAgb3V0cHV0RmlsZSA9IEB0ZW1wRmlsZShcIm91dHB1dFwiLCB0ZXh0KVxuICAgICAgICBcIi1sXCJcbiAgICAgICAgbGFuZ1xuICAgICAgICBdLCBoZWxwOiB7XG4gICAgICAgICAgbGluazogXCJodHRwOi8vc291cmNlZm9yZ2UubmV0L3Byb2plY3RzL3VuY3J1c3RpZnkvXCJcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICBAcmVhZEZpbGUob3V0cHV0RmlsZSlcbiAgICAgICAgKVxuICAgIClcbiJdfQ==
