
/*
Requires [puppet-link](http://puppet-lint.com/)
 */

(function() {
  "use strict";
  var Beautifier, PuppetFix,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PuppetFix = (function(superClass) {
    extend(PuppetFix, superClass);

    function PuppetFix() {
      return PuppetFix.__super__.constructor.apply(this, arguments);
    }

    PuppetFix.prototype.name = "puppet-lint";

    PuppetFix.prototype.link = "http://puppet-lint.com/";

    PuppetFix.prototype.options = {
      Puppet: true
    };

    PuppetFix.prototype.cli = function(options) {
      if (options.puppet_path == null) {
        return new Error("'puppet-lint' path is not set!" + " Please set this in the Atom Beautify package settings.");
      } else {
        return options.puppet_path;
      }
    };

    PuppetFix.prototype.beautify = function(text, language, options) {
      var tempFile;
      return this.run("puppet-lint", ['--fix', tempFile = this.tempFile("input", text)], {
        ignoreReturnCode: true,
        help: {
          link: "http://puppet-lint.com/"
        }
      }).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return PuppetFix;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3B1cHBldC1maXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBR0E7QUFIQSxNQUFBLHFCQUFBO0lBQUE7OztFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt3QkFFckIsSUFBQSxHQUFNOzt3QkFDTixJQUFBLEdBQU07O3dCQUVOLE9BQUEsR0FBUztNQUNQLE1BQUEsRUFBUSxJQUREOzs7d0JBSVQsR0FBQSxHQUFLLFNBQUMsT0FBRDtNQUNILElBQU8sMkJBQVA7QUFDRSxlQUFXLElBQUEsS0FBQSxDQUFNLGdDQUFBLEdBQ2YseURBRFMsRUFEYjtPQUFBLE1BQUE7QUFJRSxlQUFPLE9BQU8sQ0FBQyxZQUpqQjs7SUFERzs7d0JBT0wsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO2FBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxhQUFMLEVBQW9CLENBQ2xCLE9BRGtCLEVBRWxCLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FGTyxDQUFwQixFQUdLO1FBQ0QsZ0JBQUEsRUFBa0IsSUFEakI7UUFFRCxJQUFBLEVBQU07VUFDSixJQUFBLEVBQU0seUJBREY7U0FGTDtPQUhMLENBU0UsQ0FBQyxJQVRILENBU1EsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtRQURJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVRSO0lBRFE7Ozs7S0FoQjZCO0FBTnpDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBbcHVwcGV0LWxpbmtdKGh0dHA6Ly9wdXBwZXQtbGludC5jb20vKVxuIyMjXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUHVwcGV0Rml4IGV4dGVuZHMgQmVhdXRpZmllclxuICAjIHRoaXMgaXMgd2hhdCBkaXNwbGF5cyBhcyB5b3VyIERlZmF1bHQgQmVhdXRpZmllciBpbiBMYW5ndWFnZSBDb25maWdcbiAgbmFtZTogXCJwdXBwZXQtbGludFwiXG4gIGxpbms6IFwiaHR0cDovL3B1cHBldC1saW50LmNvbS9cIlxuXG4gIG9wdGlvbnM6IHtcbiAgICBQdXBwZXQ6IHRydWVcbiAgfVxuXG4gIGNsaTogKG9wdGlvbnMpIC0+XG4gICAgaWYgbm90IG9wdGlvbnMucHVwcGV0X3BhdGg/XG4gICAgICByZXR1cm4gbmV3IEVycm9yKFwiJ3B1cHBldC1saW50JyBwYXRoIGlzIG5vdCBzZXQhXCIgK1xuICAgICAgICBcIiBQbGVhc2Ugc2V0IHRoaXMgaW4gdGhlIEF0b20gQmVhdXRpZnkgcGFja2FnZSBzZXR0aW5ncy5cIilcbiAgICBlbHNlXG4gICAgICByZXR1cm4gb3B0aW9ucy5wdXBwZXRfcGF0aFxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQHJ1bihcInB1cHBldC1saW50XCIsIFtcbiAgICAgICctLWZpeCdcbiAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dClcbiAgICAgIF0sIHtcbiAgICAgICAgaWdub3JlUmV0dXJuQ29kZTogdHJ1ZVxuICAgICAgICBoZWxwOiB7XG4gICAgICAgICAgbGluazogXCJodHRwOi8vcHVwcGV0LWxpbnQuY29tL1wiXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAudGhlbig9PlxuICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICApXG4iXX0=
