
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

    FortranBeautifier.prototype.link = "https://github.com/Glavin001/atom-beautify/blob/master/src/beautifiers/fortran-beautifier/emacs-fortran-formating-script.lisp";

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2ZvcnRyYW4tYmVhdXRpZmllci9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsbUNBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztnQ0FDckIsSUFBQSxHQUFNOztnQ0FDTixJQUFBLEdBQU07O2dDQUVOLE9BQUEsR0FBUztNQUNQLE9BQUEsRUFBUyxJQURGOzs7Z0NBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxvQkFBUCxFQUE2QixPQUE3QjtNQUVBLFVBQUEsR0FBYSxPQUFPLENBQUM7TUFDckIsaUJBQUEsR0FBb0IsT0FBTyxDQUFDO01BRTVCLElBQUcsQ0FBSSxpQkFBUDtRQUNFLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixxQ0FBeEIsRUFEdEI7O01BR0EsSUFBQyxDQUFBLEtBQUQsQ0FBTyxvQkFBUCxFQUE2QixxQkFBQSxHQUF3QixpQkFBckQ7TUFFQSxJQUFBLEdBQU8sQ0FDTCxTQURLLEVBRUwsSUFGSyxFQUdMLGlCQUhLLEVBSUwsSUFKSyxFQUtMLHlCQUxLLEVBTUwsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQixDQU5OO01BU1AsSUFBRyxVQUFIO2VBQ0UsSUFBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMLEVBQWlCLElBQWpCLEVBQXVCO1VBQUMsZ0JBQUEsRUFBa0IsS0FBbkI7U0FBdkIsQ0FDRSxDQUFDLElBREgsQ0FDUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtVQURJO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURSLEVBREY7T0FBQSxNQUFBO2VBTUUsSUFBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLEVBQWMsSUFBZCxFQUFvQjtVQUFDLGdCQUFBLEVBQWtCLEtBQW5CO1NBQXBCLENBQ0UsQ0FBQyxJQURILENBQ1EsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7VUFESTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEUixFQU5GOztJQXBCUTs7OztLQVJxQztBQVJqRCIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly93d3cuZ251Lm9yZy9zb2Z0d2FyZS9lbWFjcy9cbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4uL2JlYXV0aWZpZXInKVxucGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRm9ydHJhbkJlYXV0aWZpZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiRm9ydHJhbiBCZWF1dGlmaWVyXCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vR2xhdmluMDAxL2F0b20tYmVhdXRpZnkvYmxvYi9tYXN0ZXIvc3JjL2JlYXV0aWZpZXJzL2ZvcnRyYW4tYmVhdXRpZmllci9lbWFjcy1mb3J0cmFuLWZvcm1hdGluZy1zY3JpcHQubGlzcFwiXG5cbiAgb3B0aW9uczoge1xuICAgIEZvcnRyYW46IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQGRlYnVnKCdmb3J0cmFuLWJlYXV0aWZpZXInLCBvcHRpb25zKVxuXG4gICAgZW1hY3NfcGF0aCA9IG9wdGlvbnMuZW1hY3NfcGF0aFxuICAgIGVtYWNzX3NjcmlwdF9wYXRoID0gb3B0aW9ucy5lbWFjc19zY3JpcHRfcGF0aFxuXG4gICAgaWYgbm90IGVtYWNzX3NjcmlwdF9wYXRoXG4gICAgICBlbWFjc19zY3JpcHRfcGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiZW1hY3MtZm9ydHJhbi1mb3JtYXRpbmctc2NyaXB0Lmxpc3BcIilcblxuICAgIEBkZWJ1ZygnZm9ydHJhbi1iZWF1dGlmaWVyJywgJ2VtYWNzIHNjcmlwdCBwYXRoOiAnICsgZW1hY3Nfc2NyaXB0X3BhdGgpXG5cbiAgICBhcmdzID0gW1xuICAgICAgJy0tYmF0Y2gnXG4gICAgICAnLWwnXG4gICAgICBlbWFjc19zY3JpcHRfcGF0aFxuICAgICAgJy1mJ1xuICAgICAgJ2Y5MC1iYXRjaC1pbmRlbnQtcmVnaW9uJ1xuICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXG4gICAgICBdXG5cbiAgICBpZiBlbWFjc19wYXRoXG4gICAgICBAcnVuKGVtYWNzX3BhdGgsIGFyZ3MsIHtpZ25vcmVSZXR1cm5Db2RlOiBmYWxzZX0pXG4gICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICApXG4gICAgZWxzZVxuICAgICAgQHJ1bihcImVtYWNzXCIsIGFyZ3MsIHtpZ25vcmVSZXR1cm5Db2RlOiBmYWxzZX0pXG4gICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICApXG4iXX0=
