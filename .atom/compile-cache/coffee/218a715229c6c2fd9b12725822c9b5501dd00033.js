
/*
Requires https://www.gnu.org/software/emacs/
 */

(function() {
  "use strict";
  var Beautifier, FortranBeautifier, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('../beautifier');

  path = require("path");

  module.exports = FortranBeautifier = (function(superClass) {
    extend(FortranBeautifier, superClass);

    function FortranBeautifier() {
      return FortranBeautifier.__super__.constructor.apply(this, arguments);
    }

    FortranBeautifier.prototype.name = "Fortran Beautifier";

    FortranBeautifier.prototype.link = "https://www.gnu.org/software/emacs/";

    FortranBeautifier.prototype.isPreInstalled = false;

    FortranBeautifier.prototype.options = {
      Fortran: true
    };

    FortranBeautifier.prototype.beautify = function(text, language, options) {
      var args, emacs_path, emacs_script_path, tempFile;
      this.debug('fortran-beautifier', options);
      emacs_path = options.emacs_path;
      emacs_script_path = options.emacs_script_path;
      if (!emacs_script_path) {
        emacs_script_path = path.resolve(__dirname, "emacs-fortran-formating-script.lisp");
      }
      this.debug('fortran-beautifier', 'emacs script path: ' + emacs_script_path);
      args = ['--batch', '-l', emacs_script_path, '-f', 'f90-batch-indent-region', tempFile = this.tempFile("temp", text)];
      if (emacs_path) {
        return this.run(emacs_path, args, {
          ignoreReturnCode: false
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      } else {
        return this.run("emacs", args, {
          ignoreReturnCode: false
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      }
    };

    return FortranBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2ZvcnRyYW4tYmVhdXRpZmllci9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsbUNBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztnQ0FDckIsSUFBQSxHQUFNOztnQ0FDTixJQUFBLEdBQU07O2dDQUNOLGNBQUEsR0FBZ0I7O2dDQUVoQixPQUFBLEdBQVM7TUFDUCxPQUFBLEVBQVMsSUFERjs7O2dDQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sb0JBQVAsRUFBNkIsT0FBN0I7TUFFQSxVQUFBLEdBQWEsT0FBTyxDQUFDO01BQ3JCLGlCQUFBLEdBQW9CLE9BQU8sQ0FBQztNQUU1QixJQUFHLENBQUksaUJBQVA7UUFDRSxpQkFBQSxHQUFvQixJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IscUNBQXhCLEVBRHRCOztNQUdBLElBQUMsQ0FBQSxLQUFELENBQU8sb0JBQVAsRUFBNkIscUJBQUEsR0FBd0IsaUJBQXJEO01BRUEsSUFBQSxHQUFPLENBQ0wsU0FESyxFQUVMLElBRkssRUFHTCxpQkFISyxFQUlMLElBSkssRUFLTCx5QkFMSyxFQU1MLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsQ0FOTjtNQVNQLElBQUcsVUFBSDtlQUNFLElBQUMsQ0FBQSxHQUFELENBQUssVUFBTCxFQUFpQixJQUFqQixFQUF1QjtVQUFDLGdCQUFBLEVBQWtCLEtBQW5CO1NBQXZCLENBQ0UsQ0FBQyxJQURILENBQ1EsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7VUFESTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEUixFQURGO09BQUEsTUFBQTtlQU1FLElBQUMsQ0FBQSxHQUFELENBQUssT0FBTCxFQUFjLElBQWQsRUFBb0I7VUFBQyxnQkFBQSxFQUFrQixLQUFuQjtTQUFwQixDQUNFLENBQUMsSUFESCxDQUNRLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO1VBREk7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRFIsRUFORjs7SUFwQlE7Ozs7S0FUcUM7QUFSakQiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vd3d3LmdudS5vcmcvc29mdHdhcmUvZW1hY3MvXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuLi9iZWF1dGlmaWVyJylcbnBhdGggPSByZXF1aXJlKFwicGF0aFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEZvcnRyYW5CZWF1dGlmaWVyIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIkZvcnRyYW4gQmVhdXRpZmllclwiXG4gIGxpbms6IFwiaHR0cHM6Ly93d3cuZ251Lm9yZy9zb2Z0d2FyZS9lbWFjcy9cIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgRm9ydHJhbjogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBAZGVidWcoJ2ZvcnRyYW4tYmVhdXRpZmllcicsIG9wdGlvbnMpXG5cbiAgICBlbWFjc19wYXRoID0gb3B0aW9ucy5lbWFjc19wYXRoXG4gICAgZW1hY3Nfc2NyaXB0X3BhdGggPSBvcHRpb25zLmVtYWNzX3NjcmlwdF9wYXRoXG5cbiAgICBpZiBub3QgZW1hY3Nfc2NyaXB0X3BhdGhcbiAgICAgIGVtYWNzX3NjcmlwdF9wYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJlbWFjcy1mb3J0cmFuLWZvcm1hdGluZy1zY3JpcHQubGlzcFwiKVxuXG4gICAgQGRlYnVnKCdmb3J0cmFuLWJlYXV0aWZpZXInLCAnZW1hY3Mgc2NyaXB0IHBhdGg6ICcgKyBlbWFjc19zY3JpcHRfcGF0aClcblxuICAgIGFyZ3MgPSBbXG4gICAgICAnLS1iYXRjaCdcbiAgICAgICctbCdcbiAgICAgIGVtYWNzX3NjcmlwdF9wYXRoXG4gICAgICAnLWYnXG4gICAgICAnZjkwLWJhdGNoLWluZGVudC1yZWdpb24nXG4gICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dClcbiAgICAgIF1cblxuICAgIGlmIGVtYWNzX3BhdGhcbiAgICAgIEBydW4oZW1hY3NfcGF0aCwgYXJncywge2lnbm9yZVJldHVybkNvZGU6IGZhbHNlfSlcbiAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgIClcbiAgICBlbHNlXG4gICAgICBAcnVuKFwiZW1hY3NcIiwgYXJncywge2lnbm9yZVJldHVybkNvZGU6IGZhbHNlfSlcbiAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgIClcbiJdfQ==
