
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

    PuppetFix.prototype.isPreInstalled = false;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3B1cHBldC1maXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBR0E7QUFIQSxNQUFBLHFCQUFBO0lBQUE7OztFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt3QkFFckIsSUFBQSxHQUFNOzt3QkFDTixJQUFBLEdBQU07O3dCQUNOLGNBQUEsR0FBZ0I7O3dCQUVoQixPQUFBLEdBQVM7TUFDUCxNQUFBLEVBQVEsSUFERDs7O3dCQUlULEdBQUEsR0FBSyxTQUFDLE9BQUQ7TUFDSCxJQUFPLDJCQUFQO0FBQ0UsZUFBVyxJQUFBLEtBQUEsQ0FBTSxnQ0FBQSxHQUNmLHlEQURTLEVBRGI7T0FBQSxNQUFBO0FBSUUsZUFBTyxPQUFPLENBQUMsWUFKakI7O0lBREc7O3dCQU9MLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTthQUFBLElBQUMsQ0FBQSxHQUFELENBQUssYUFBTCxFQUFvQixDQUNsQixPQURrQixFQUVsQixRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBRk8sQ0FBcEIsRUFHSztRQUNELGdCQUFBLEVBQWtCLElBRGpCO1FBRUQsSUFBQSxFQUFNO1VBQ0osSUFBQSxFQUFNLHlCQURGO1NBRkw7T0FITCxDQVNFLENBQUMsSUFUSCxDQVNRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7UUFESTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FUUjtJQURROzs7O0tBakI2QjtBQU56QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgW3B1cHBldC1saW5rXShodHRwOi8vcHVwcGV0LWxpbnQuY29tLylcbiMjI1xuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFB1cHBldEZpeCBleHRlbmRzIEJlYXV0aWZpZXJcbiAgIyB0aGlzIGlzIHdoYXQgZGlzcGxheXMgYXMgeW91ciBEZWZhdWx0IEJlYXV0aWZpZXIgaW4gTGFuZ3VhZ2UgQ29uZmlnXG4gIG5hbWU6IFwicHVwcGV0LWxpbnRcIlxuICBsaW5rOiBcImh0dHA6Ly9wdXBwZXQtbGludC5jb20vXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIFB1cHBldDogdHJ1ZVxuICB9XG5cbiAgY2xpOiAob3B0aW9ucykgLT5cbiAgICBpZiBub3Qgb3B0aW9ucy5wdXBwZXRfcGF0aD9cbiAgICAgIHJldHVybiBuZXcgRXJyb3IoXCIncHVwcGV0LWxpbnQnIHBhdGggaXMgbm90IHNldCFcIiArXG4gICAgICAgIFwiIFBsZWFzZSBzZXQgdGhpcyBpbiB0aGUgQXRvbSBCZWF1dGlmeSBwYWNrYWdlIHNldHRpbmdzLlwiKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBvcHRpb25zLnB1cHBldF9wYXRoXG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBAcnVuKFwicHVwcGV0LWxpbnRcIiwgW1xuICAgICAgJy0tZml4J1xuICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KVxuICAgICAgXSwge1xuICAgICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlXG4gICAgICAgIGhlbHA6IHtcbiAgICAgICAgICBsaW5rOiBcImh0dHA6Ly9wdXBwZXQtbGludC5jb20vXCJcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC50aGVuKD0+XG4gICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgIClcbiJdfQ==
