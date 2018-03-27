
/*
Requires http://hhvm.com/
 */

(function() {
  "use strict";
  var Beautifier, HhFormat,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = HhFormat = (function(superClass) {
    extend(HhFormat, superClass);

    function HhFormat() {
      return HhFormat.__super__.constructor.apply(this, arguments);
    }

    HhFormat.prototype.name = "hh_format";

    HhFormat.prototype.link = "http://hhvm.com/";

    HhFormat.prototype.options = {
      PHP: false
    };

    HhFormat.prototype.beautify = function(text, language, options) {
      return this.run("hh_format", [this.tempFile("input", text)], {
        help: {
          link: "http://hhvm.com/"
        }
      }).then(function(output) {
        if (output.trim()) {
          return output;
        } else {
          return this.Promise.resolve(new Error("hh_format returned an empty output."));
        }
      });
    };

    return HhFormat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2hoX2Zvcm1hdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsb0JBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3VCQUNyQixJQUFBLEdBQU07O3VCQUNOLElBQUEsR0FBTTs7dUJBRU4sT0FBQSxHQUNFO01BQUEsR0FBQSxFQUFLLEtBQUw7Ozt1QkFFRixRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjthQUNSLElBQUMsQ0FBQSxHQUFELENBQUssV0FBTCxFQUFrQixDQUNoQixJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FEZ0IsQ0FBbEIsRUFHQTtRQUNFLElBQUEsRUFBTTtVQUNKLElBQUEsRUFBTSxrQkFERjtTQURSO09BSEEsQ0FPRSxDQUFDLElBUEgsQ0FPUSxTQUFDLE1BQUQ7UUFHTixJQUFHLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBSDtpQkFDRSxPQURGO1NBQUEsTUFBQTtpQkFHRSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBcUIsSUFBQSxLQUFBLENBQU0scUNBQU4sQ0FBckIsRUFIRjs7TUFITSxDQVBSO0lBRFE7Ozs7S0FQNEI7QUFQeEMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHA6Ly9oaHZtLmNvbS9cbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgSGhGb3JtYXQgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiaGhfZm9ybWF0XCJcbiAgbGluazogXCJodHRwOi8vaGh2bS5jb20vXCJcblxuICBvcHRpb25zOlxuICAgIFBIUDogZmFsc2VcblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBydW4oXCJoaF9mb3JtYXRcIiwgW1xuICAgICAgQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dClcbiAgICBdLFxuICAgIHtcbiAgICAgIGhlbHA6IHtcbiAgICAgICAgbGluazogXCJodHRwOi8vaGh2bS5jb20vXCJcbiAgICAgIH1cbiAgICB9KS50aGVuKChvdXRwdXQpIC0+XG4gICAgICAjIGhoX2Zvcm1hdCBjYW4gZXhpdCB3aXRoIHN0YXR1cyAwIGFuZCBubyBvdXRwdXQgZm9yIHNvbWUgZmlsZXMgd2hpY2hcbiAgICAgICMgaXQgZG9lc24ndCBmb3JtYXQuICBJbiB0aGF0IGNhc2Ugd2UganVzdCByZXR1cm4gb3JpZ2luYWwgdGV4dC5cbiAgICAgIGlmIG91dHB1dC50cmltKClcbiAgICAgICAgb3V0cHV0XG4gICAgICBlbHNlXG4gICAgICAgIEBQcm9taXNlLnJlc29sdmUobmV3IEVycm9yKFwiaGhfZm9ybWF0IHJldHVybmVkIGFuIGVtcHR5IG91dHB1dC5cIikpXG4gICAgKVxuIl19
