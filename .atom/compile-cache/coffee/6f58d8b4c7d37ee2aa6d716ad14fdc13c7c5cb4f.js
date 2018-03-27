
/*
Requires clang-format (https://clang.llvm.org)
 */

(function() {
  "use strict";
  var Beautifier, ClangFormat, fs, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  fs = require('fs');

  module.exports = ClangFormat = (function(superClass) {
    extend(ClangFormat, superClass);

    function ClangFormat() {
      return ClangFormat.__super__.constructor.apply(this, arguments);
    }

    ClangFormat.prototype.name = "clang-format";

    ClangFormat.prototype.link = "https://clang.llvm.org/docs/ClangFormat.html";

    ClangFormat.prototype.options = {
      "C++": false,
      "C": false,
      "Objective-C": false,
      "GLSL": true
    };


    /*
      Dump contents to a given file
     */

    ClangFormat.prototype.dumpToFile = function(name, contents) {
      if (name == null) {
        name = "atom-beautify-dump";
      }
      if (contents == null) {
        contents = "";
      }
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          return fs.open(name, "w", function(err, fd) {
            _this.debug('dumpToFile', name, err, fd);
            if (err) {
              return reject(err);
            }
            return fs.write(fd, contents, function(err) {
              if (err) {
                return reject(err);
              }
              return fs.close(fd, function(err) {
                if (err) {
                  return reject(err);
                }
                return resolve(name);
              });
            });
          });
        };
      })(this));
    };

    ClangFormat.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var currDir, currFile, dumpFile, editor, fullPath, ref;
        editor = typeof atom !== "undefined" && atom !== null ? (ref = atom.workspace) != null ? ref.getActiveTextEditor() : void 0 : void 0;
        if (editor != null) {
          fullPath = editor.getPath();
          currDir = path.dirname(fullPath);
          currFile = path.basename(fullPath);
          dumpFile = path.join(currDir, ".atom-beautify." + currFile);
          return resolve(dumpFile);
        } else {
          return reject(new Error("No active editor found!"));
        }
      }).then((function(_this) {
        return function(dumpFile) {
          return _this.run("clang-format", [_this.dumpToFile(dumpFile, text), ["--style=file"]], {
            help: {
              link: "https://clang.llvm.org/docs/ClangFormat.html"
            }
          })["finally"](function() {
            return fs.unlink(dumpFile);
          });
        };
      })(this));
    };

    return ClangFormat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2NsYW5nLWZvcm1hdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsaUNBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7MEJBRXJCLElBQUEsR0FBTTs7MEJBQ04sSUFBQSxHQUFNOzswQkFFTixPQUFBLEdBQVM7TUFDUCxLQUFBLEVBQU8sS0FEQTtNQUVQLEdBQUEsRUFBSyxLQUZFO01BR1AsYUFBQSxFQUFlLEtBSFI7TUFJUCxNQUFBLEVBQVEsSUFKRDs7OztBQU9UOzs7OzBCQUdBLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBOEIsUUFBOUI7O1FBQUMsT0FBTzs7O1FBQXNCLFdBQVc7O0FBQ25ELGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVjtpQkFDbEIsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFSLEVBQWMsR0FBZCxFQUFtQixTQUFDLEdBQUQsRUFBTSxFQUFOO1lBQ2pCLEtBQUMsQ0FBQSxLQUFELENBQU8sWUFBUCxFQUFxQixJQUFyQixFQUEyQixHQUEzQixFQUFnQyxFQUFoQztZQUNBLElBQXNCLEdBQXRCO0FBQUEscUJBQU8sTUFBQSxDQUFPLEdBQVAsRUFBUDs7bUJBQ0EsRUFBRSxDQUFDLEtBQUgsQ0FBUyxFQUFULEVBQWEsUUFBYixFQUF1QixTQUFDLEdBQUQ7Y0FDckIsSUFBc0IsR0FBdEI7QUFBQSx1QkFBTyxNQUFBLENBQU8sR0FBUCxFQUFQOztxQkFDQSxFQUFFLENBQUMsS0FBSCxDQUFTLEVBQVQsRUFBYSxTQUFDLEdBQUQ7Z0JBQ1gsSUFBc0IsR0FBdEI7QUFBQSx5QkFBTyxNQUFBLENBQU8sR0FBUCxFQUFQOzt1QkFDQSxPQUFBLENBQVEsSUFBUjtjQUZXLENBQWI7WUFGcUIsQ0FBdkI7VUFIaUIsQ0FBbkI7UUFEa0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7SUFERDs7MEJBZVosUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFhUixhQUFXLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ2xCLFlBQUE7UUFBQSxNQUFBLHNGQUF3QixDQUFFLG1CQUFqQixDQUFBO1FBQ1QsSUFBRyxjQUFIO1VBQ0UsUUFBQSxHQUFXLE1BQU0sQ0FBQyxPQUFQLENBQUE7VUFDWCxPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiO1VBQ1YsUUFBQSxHQUFXLElBQUksQ0FBQyxRQUFMLENBQWMsUUFBZDtVQUNYLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsaUJBQUEsR0FBa0IsUUFBckM7aUJBQ1gsT0FBQSxDQUFRLFFBQVIsRUFMRjtTQUFBLE1BQUE7aUJBT0UsTUFBQSxDQUFXLElBQUEsS0FBQSxDQUFNLHlCQUFOLENBQVgsRUFQRjs7TUFGa0IsQ0FBVCxDQVdYLENBQUMsSUFYVSxDQVdMLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxRQUFEO0FBRUosaUJBQU8sS0FBQyxDQUFBLEdBQUQsQ0FBSyxjQUFMLEVBQXFCLENBQzFCLEtBQUMsQ0FBQSxVQUFELENBQVksUUFBWixFQUFzQixJQUF0QixDQUQwQixFQUUxQixDQUFDLGNBQUQsQ0FGMEIsQ0FBckIsRUFHRjtZQUFBLElBQUEsRUFBTTtjQUNQLElBQUEsRUFBTSw4Q0FEQzthQUFOO1dBSEUsQ0FLSCxFQUFDLE9BQUQsRUFMRyxDQUtPLFNBQUE7bUJBQ1YsRUFBRSxDQUFDLE1BQUgsQ0FBVSxRQUFWO1VBRFUsQ0FMUDtRQUZIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVhLO0lBYkg7Ozs7S0E5QitCO0FBVDNDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBjbGFuZy1mb3JtYXQgKGh0dHBzOi8vY2xhbmcubGx2bS5vcmcpXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuZnMgPSByZXF1aXJlKCdmcycpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQ2xhbmdGb3JtYXQgZXh0ZW5kcyBCZWF1dGlmaWVyXG5cbiAgbmFtZTogXCJjbGFuZy1mb3JtYXRcIlxuICBsaW5rOiBcImh0dHBzOi8vY2xhbmcubGx2bS5vcmcvZG9jcy9DbGFuZ0Zvcm1hdC5odG1sXCJcblxuICBvcHRpb25zOiB7XG4gICAgXCJDKytcIjogZmFsc2VcbiAgICBcIkNcIjogZmFsc2VcbiAgICBcIk9iamVjdGl2ZS1DXCI6IGZhbHNlXG4gICAgXCJHTFNMXCI6IHRydWVcbiAgfVxuXG4gICMjI1xuICAgIER1bXAgY29udGVudHMgdG8gYSBnaXZlbiBmaWxlXG4gICMjI1xuICBkdW1wVG9GaWxlOiAobmFtZSA9IFwiYXRvbS1iZWF1dGlmeS1kdW1wXCIsIGNvbnRlbnRzID0gXCJcIikgLT5cbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBmcy5vcGVuKG5hbWUsIFwid1wiLCAoZXJyLCBmZCkgPT5cbiAgICAgICAgQGRlYnVnKCdkdW1wVG9GaWxlJywgbmFtZSwgZXJyLCBmZClcbiAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxuICAgICAgICBmcy53cml0ZShmZCwgY29udGVudHMsIChlcnIpIC0+XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxuICAgICAgICAgIGZzLmNsb3NlKGZkLCAoZXJyKSAtPlxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxuICAgICAgICAgICAgcmVzb2x2ZShuYW1lKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgICMgTk9URTogT25lIG1heSB3b25kZXIgd2h5IHRoaXMgY29kZSBnb2VzIGEgbG9uZyB3YXkgdG8gY29uc3RydWN0IGEgZmlsZVxuICAgICMgcGF0aCBhbmQgZHVtcCBjb250ZW50IHVzaW5nIGEgY3VzdG9tIGBkdW1wVG9GaWxlYC4gV291bGRuJ3QgaXQgYmUgZWFzaWVyXG4gICAgIyB0byB1c2UgYEB0ZW1wRmlsZWAgaW5zdGVhZD8gVGhlIHJlYXNvbiBoZXJlIGlzIHRvIHdvcmsgYXJvdW5kIHRoZVxuICAgICMgY2xhbmctZm9ybWF0IGNvbmZpZyBmaWxlIGxvY2F0aW5nIG1lY2hhbmlzbS4gQXMgaW5kaWNhdGVkIGluIHRoZSBtYW51YWwsXG4gICAgIyBjbGFuZy1mb3JtYXQgKHdpdGggYC0tc3R5bGUgZmlsZWApIHRyaWVzIHRvIGxvY2F0ZSBhIGAuY2xhbmctZm9ybWF0YFxuICAgICMgY29uZmlnIGZpbGUgaW4gZGlyZWN0b3J5IGFuZCBwYXJlbnQgZGlyZWN0b3JpZXMgb2YgdGhlIGlucHV0IGZpbGUsXG4gICAgIyBhbmQgcmV0cmVhdCB0byBkZWZhdWx0IHN0eWxlIGlmIG5vdCBmb3VuZC4gUHJvamVjdHMgb2Z0ZW4gbWFrZXMgdXNlIG9mXG4gICAgIyB0aGlzIHJ1bGUgdG8gZGVmaW5lIHRoZWlyIG93biBzdHlsZSBpbiBpdHMgdG9wIGRpcmVjdG9yeS4gVXNlcnMgb2Z0ZW5cbiAgICAjIHB1dCBhIGAuY2xhbmctZm9ybWF0YCBpbiB0aGVpciAkSE9NRSB0byBkZWZpbmUgaGlzL2hlciBzdHlsZS4gVG8gaG9ub3JcbiAgICAjIHRoaXMgcnVsZSwgd2UgSEFWRSBUTyBnZW5lcmF0ZSB0aGUgdGVtcCBmaWxlIGluIFRIRSBTQU1FIGRpcmVjdG9yeSBhc1xuICAgICMgdGhlIGVkaXRpbmcgZmlsZS4gSG93ZXZlciwgdGhpcyBtZWNoYW5pc20gaXMgbm90IGRpcmVjdGx5IHN1cHBvcnRlZCBieVxuICAgICMgYXRvbS1iZWF1dGlmeSBhdCB0aGUgbW9tZW50LiBTbyB3ZSBpbnRyb2R1Y2UgbG90cyBvZiBjb2RlIGhlcmUuXG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgZWRpdG9yID0gYXRvbT8ud29ya3NwYWNlPy5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGlmIGVkaXRvcj9cbiAgICAgICAgZnVsbFBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIGN1cnJEaXIgPSBwYXRoLmRpcm5hbWUoZnVsbFBhdGgpXG4gICAgICAgIGN1cnJGaWxlID0gcGF0aC5iYXNlbmFtZShmdWxsUGF0aClcbiAgICAgICAgZHVtcEZpbGUgPSBwYXRoLmpvaW4oY3VyckRpciwgXCIuYXRvbS1iZWF1dGlmeS4je2N1cnJGaWxlfVwiKVxuICAgICAgICByZXNvbHZlIGR1bXBGaWxlXG4gICAgICBlbHNlXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJObyBhY3RpdmUgZWRpdG9yIGZvdW5kIVwiKSlcbiAgICApXG4gICAgLnRoZW4oKGR1bXBGaWxlKSA9PlxuICAgICAgIyBjb25zb2xlLmxvZyhcImNsYW5nLWZvcm1hdFwiLCBkdW1wRmlsZSlcbiAgICAgIHJldHVybiBAcnVuKFwiY2xhbmctZm9ybWF0XCIsIFtcbiAgICAgICAgQGR1bXBUb0ZpbGUoZHVtcEZpbGUsIHRleHQpXG4gICAgICAgIFtcIi0tc3R5bGU9ZmlsZVwiXVxuICAgICAgICBdLCBoZWxwOiB7XG4gICAgICAgICAgbGluazogXCJodHRwczovL2NsYW5nLmxsdm0ub3JnL2RvY3MvQ2xhbmdGb3JtYXQuaHRtbFwiXG4gICAgICAgIH0pLmZpbmFsbHkoIC0+XG4gICAgICAgICAgZnMudW5saW5rKGR1bXBGaWxlKVxuICAgICAgICApXG4gICAgKVxuIl19
