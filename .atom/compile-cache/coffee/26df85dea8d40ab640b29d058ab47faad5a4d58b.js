
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

    ClangFormat.prototype.isPreInstalled = false;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2NsYW5nLWZvcm1hdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsaUNBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7MEJBRXJCLElBQUEsR0FBTTs7MEJBQ04sSUFBQSxHQUFNOzswQkFDTixjQUFBLEdBQWdCOzswQkFFaEIsT0FBQSxHQUFTO01BQ1AsS0FBQSxFQUFPLEtBREE7TUFFUCxHQUFBLEVBQUssS0FGRTtNQUdQLGFBQUEsRUFBZSxLQUhSO01BSVAsTUFBQSxFQUFRLElBSkQ7Ozs7QUFPVDs7OzswQkFHQSxVQUFBLEdBQVksU0FBQyxJQUFELEVBQThCLFFBQTlCOztRQUFDLE9BQU87OztRQUFzQixXQUFXOztBQUNuRCxhQUFXLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVY7aUJBQ2xCLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUixFQUFjLEdBQWQsRUFBbUIsU0FBQyxHQUFELEVBQU0sRUFBTjtZQUNqQixLQUFDLENBQUEsS0FBRCxDQUFPLFlBQVAsRUFBcUIsSUFBckIsRUFBMkIsR0FBM0IsRUFBZ0MsRUFBaEM7WUFDQSxJQUFzQixHQUF0QjtBQUFBLHFCQUFPLE1BQUEsQ0FBTyxHQUFQLEVBQVA7O21CQUNBLEVBQUUsQ0FBQyxLQUFILENBQVMsRUFBVCxFQUFhLFFBQWIsRUFBdUIsU0FBQyxHQUFEO2NBQ3JCLElBQXNCLEdBQXRCO0FBQUEsdUJBQU8sTUFBQSxDQUFPLEdBQVAsRUFBUDs7cUJBQ0EsRUFBRSxDQUFDLEtBQUgsQ0FBUyxFQUFULEVBQWEsU0FBQyxHQUFEO2dCQUNYLElBQXNCLEdBQXRCO0FBQUEseUJBQU8sTUFBQSxDQUFPLEdBQVAsRUFBUDs7dUJBQ0EsT0FBQSxDQUFRLElBQVI7Y0FGVyxDQUFiO1lBRnFCLENBQXZCO1VBSGlCLENBQW5CO1FBRGtCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO0lBREQ7OzBCQWVaLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBYVIsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNsQixZQUFBO1FBQUEsTUFBQSxzRkFBd0IsQ0FBRSxtQkFBakIsQ0FBQTtRQUNULElBQUcsY0FBSDtVQUNFLFFBQUEsR0FBVyxNQUFNLENBQUMsT0FBUCxDQUFBO1VBQ1gsT0FBQSxHQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYjtVQUNWLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBTCxDQUFjLFFBQWQ7VUFDWCxRQUFBLEdBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQW1CLGlCQUFBLEdBQWtCLFFBQXJDO2lCQUNYLE9BQUEsQ0FBUSxRQUFSLEVBTEY7U0FBQSxNQUFBO2lCQU9FLE1BQUEsQ0FBVyxJQUFBLEtBQUEsQ0FBTSx5QkFBTixDQUFYLEVBUEY7O01BRmtCLENBQVQsQ0FXWCxDQUFDLElBWFUsQ0FXTCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsUUFBRDtBQUVKLGlCQUFPLEtBQUMsQ0FBQSxHQUFELENBQUssY0FBTCxFQUFxQixDQUMxQixLQUFDLENBQUEsVUFBRCxDQUFZLFFBQVosRUFBc0IsSUFBdEIsQ0FEMEIsRUFFMUIsQ0FBQyxjQUFELENBRjBCLENBQXJCLEVBR0Y7WUFBQSxJQUFBLEVBQU07Y0FDUCxJQUFBLEVBQU0sOENBREM7YUFBTjtXQUhFLENBS0gsRUFBQyxPQUFELEVBTEcsQ0FLTyxTQUFBO21CQUNWLEVBQUUsQ0FBQyxNQUFILENBQVUsUUFBVjtVQURVLENBTFA7UUFGSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FYSztJQWJIOzs7O0tBL0IrQjtBQVQzQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgY2xhbmctZm9ybWF0IChodHRwczovL2NsYW5nLmxsdm0ub3JnKVxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcbmZzID0gcmVxdWlyZSgnZnMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIENsYW5nRm9ybWF0IGV4dGVuZHMgQmVhdXRpZmllclxuXG4gIG5hbWU6IFwiY2xhbmctZm9ybWF0XCJcbiAgbGluazogXCJodHRwczovL2NsYW5nLmxsdm0ub3JnL2RvY3MvQ2xhbmdGb3JtYXQuaHRtbFwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6IHtcbiAgICBcIkMrK1wiOiBmYWxzZVxuICAgIFwiQ1wiOiBmYWxzZVxuICAgIFwiT2JqZWN0aXZlLUNcIjogZmFsc2VcbiAgICBcIkdMU0xcIjogdHJ1ZVxuICB9XG5cbiAgIyMjXG4gICAgRHVtcCBjb250ZW50cyB0byBhIGdpdmVuIGZpbGVcbiAgIyMjXG4gIGR1bXBUb0ZpbGU6IChuYW1lID0gXCJhdG9tLWJlYXV0aWZ5LWR1bXBcIiwgY29udGVudHMgPSBcIlwiKSAtPlxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIGZzLm9wZW4obmFtZSwgXCJ3XCIsIChlcnIsIGZkKSA9PlxuICAgICAgICBAZGVidWcoJ2R1bXBUb0ZpbGUnLCBuYW1lLCBlcnIsIGZkKVxuICAgICAgICByZXR1cm4gcmVqZWN0KGVycikgaWYgZXJyXG4gICAgICAgIGZzLndyaXRlKGZkLCBjb250ZW50cywgKGVycikgLT5cbiAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycikgaWYgZXJyXG4gICAgICAgICAgZnMuY2xvc2UoZmQsIChlcnIpIC0+XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycikgaWYgZXJyXG4gICAgICAgICAgICByZXNvbHZlKG5hbWUpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgKVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgIyBOT1RFOiBPbmUgbWF5IHdvbmRlciB3aHkgdGhpcyBjb2RlIGdvZXMgYSBsb25nIHdheSB0byBjb25zdHJ1Y3QgYSBmaWxlXG4gICAgIyBwYXRoIGFuZCBkdW1wIGNvbnRlbnQgdXNpbmcgYSBjdXN0b20gYGR1bXBUb0ZpbGVgLiBXb3VsZG4ndCBpdCBiZSBlYXNpZXJcbiAgICAjIHRvIHVzZSBgQHRlbXBGaWxlYCBpbnN0ZWFkPyBUaGUgcmVhc29uIGhlcmUgaXMgdG8gd29yayBhcm91bmQgdGhlXG4gICAgIyBjbGFuZy1mb3JtYXQgY29uZmlnIGZpbGUgbG9jYXRpbmcgbWVjaGFuaXNtLiBBcyBpbmRpY2F0ZWQgaW4gdGhlIG1hbnVhbCxcbiAgICAjIGNsYW5nLWZvcm1hdCAod2l0aCBgLS1zdHlsZSBmaWxlYCkgdHJpZXMgdG8gbG9jYXRlIGEgYC5jbGFuZy1mb3JtYXRgXG4gICAgIyBjb25maWcgZmlsZSBpbiBkaXJlY3RvcnkgYW5kIHBhcmVudCBkaXJlY3RvcmllcyBvZiB0aGUgaW5wdXQgZmlsZSxcbiAgICAjIGFuZCByZXRyZWF0IHRvIGRlZmF1bHQgc3R5bGUgaWYgbm90IGZvdW5kLiBQcm9qZWN0cyBvZnRlbiBtYWtlcyB1c2Ugb2ZcbiAgICAjIHRoaXMgcnVsZSB0byBkZWZpbmUgdGhlaXIgb3duIHN0eWxlIGluIGl0cyB0b3AgZGlyZWN0b3J5LiBVc2VycyBvZnRlblxuICAgICMgcHV0IGEgYC5jbGFuZy1mb3JtYXRgIGluIHRoZWlyICRIT01FIHRvIGRlZmluZSBoaXMvaGVyIHN0eWxlLiBUbyBob25vclxuICAgICMgdGhpcyBydWxlLCB3ZSBIQVZFIFRPIGdlbmVyYXRlIHRoZSB0ZW1wIGZpbGUgaW4gVEhFIFNBTUUgZGlyZWN0b3J5IGFzXG4gICAgIyB0aGUgZWRpdGluZyBmaWxlLiBIb3dldmVyLCB0aGlzIG1lY2hhbmlzbSBpcyBub3QgZGlyZWN0bHkgc3VwcG9ydGVkIGJ5XG4gICAgIyBhdG9tLWJlYXV0aWZ5IGF0IHRoZSBtb21lbnQuIFNvIHdlIGludHJvZHVjZSBsb3RzIG9mIGNvZGUgaGVyZS5cbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICBlZGl0b3IgPSBhdG9tPy53b3Jrc3BhY2U/LmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgaWYgZWRpdG9yP1xuICAgICAgICBmdWxsUGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgY3VyckRpciA9IHBhdGguZGlybmFtZShmdWxsUGF0aClcbiAgICAgICAgY3VyckZpbGUgPSBwYXRoLmJhc2VuYW1lKGZ1bGxQYXRoKVxuICAgICAgICBkdW1wRmlsZSA9IHBhdGguam9pbihjdXJyRGlyLCBcIi5hdG9tLWJlYXV0aWZ5LiN7Y3VyckZpbGV9XCIpXG4gICAgICAgIHJlc29sdmUgZHVtcEZpbGVcbiAgICAgIGVsc2VcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIk5vIGFjdGl2ZSBlZGl0b3IgZm91bmQhXCIpKVxuICAgIClcbiAgICAudGhlbigoZHVtcEZpbGUpID0+XG4gICAgICAjIGNvbnNvbGUubG9nKFwiY2xhbmctZm9ybWF0XCIsIGR1bXBGaWxlKVxuICAgICAgcmV0dXJuIEBydW4oXCJjbGFuZy1mb3JtYXRcIiwgW1xuICAgICAgICBAZHVtcFRvRmlsZShkdW1wRmlsZSwgdGV4dClcbiAgICAgICAgW1wiLS1zdHlsZT1maWxlXCJdXG4gICAgICAgIF0sIGhlbHA6IHtcbiAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vY2xhbmcubGx2bS5vcmcvZG9jcy9DbGFuZ0Zvcm1hdC5odG1sXCJcbiAgICAgICAgfSkuZmluYWxseSggLT5cbiAgICAgICAgICBmcy51bmxpbmsoZHVtcEZpbGUpXG4gICAgICAgIClcbiAgICApXG4iXX0=
