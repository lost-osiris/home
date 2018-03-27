
/*
Requires [perltidy](http://perltidy.sourceforge.net)
 */

(function() {
  "use strict";
  var Beautifier, PerlTidy,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PerlTidy = (function(superClass) {
    extend(PerlTidy, superClass);

    function PerlTidy() {
      return PerlTidy.__super__.constructor.apply(this, arguments);
    }

    PerlTidy.prototype.name = "Perltidy";

    PerlTidy.prototype.link = "http://perltidy.sourceforge.net/";

    PerlTidy.prototype.options = {
      Perl: true
    };

    PerlTidy.prototype.cli = function(options) {
      if (options.perltidy_path == null) {
        return new Error("'Perl Perltidy Path' not set!" + " Please set this in the Atom Beautify package settings.");
      } else {
        return options.perltidy_path;
      }
    };

    PerlTidy.prototype.beautify = function(text, language, options) {
      var ref;
      return this.run("perltidy", ['--standard-output', '--standard-error-output', '--quiet', ((ref = options.perltidy_profile) != null ? ref.length : void 0) ? "--profile=" + options.perltidy_profile : void 0, this.tempFile("input", text)], {
        help: {
          link: "http://perltidy.sourceforge.net/"
        }
      });
    };

    return PerlTidy;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3Blcmx0aWR5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUdBO0FBSEEsTUFBQSxvQkFBQTtJQUFBOzs7RUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7dUJBQ3JCLElBQUEsR0FBTTs7dUJBQ04sSUFBQSxHQUFNOzt1QkFFTixPQUFBLEdBQVM7TUFDUCxJQUFBLEVBQU0sSUFEQzs7O3VCQUlULEdBQUEsR0FBSyxTQUFDLE9BQUQ7TUFDSCxJQUFPLDZCQUFQO0FBQ0UsZUFBVyxJQUFBLEtBQUEsQ0FBTSwrQkFBQSxHQUNmLHlEQURTLEVBRGI7T0FBQSxNQUFBO0FBSUUsZUFBTyxPQUFPLENBQUMsY0FKakI7O0lBREc7O3VCQU9MLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTthQUFBLElBQUMsQ0FBQSxHQUFELENBQUssVUFBTCxFQUFpQixDQUNmLG1CQURlLEVBRWYseUJBRmUsRUFHZixTQUhlLGlEQUlvRCxDQUFFLGdCQUFyRSxHQUFBLFlBQUEsR0FBYSxPQUFPLENBQUMsZ0JBQXJCLEdBQUEsTUFKZSxFQUtmLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQUxlLENBQWpCLEVBTUs7UUFBQSxJQUFBLEVBQU07VUFDUCxJQUFBLEVBQU0sa0NBREM7U0FBTjtPQU5MO0lBRFE7Ozs7S0FmNEI7QUFOeEMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIFtwZXJsdGlkeV0oaHR0cDovL3Blcmx0aWR5LnNvdXJjZWZvcmdlLm5ldClcbiMjI1xuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBlcmxUaWR5IGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlBlcmx0aWR5XCJcbiAgbGluazogXCJodHRwOi8vcGVybHRpZHkuc291cmNlZm9yZ2UubmV0L1wiXG5cbiAgb3B0aW9uczoge1xuICAgIFBlcmw6IHRydWVcbiAgfVxuXG4gIGNsaTogKG9wdGlvbnMpIC0+XG4gICAgaWYgbm90IG9wdGlvbnMucGVybHRpZHlfcGF0aD9cbiAgICAgIHJldHVybiBuZXcgRXJyb3IoXCInUGVybCBQZXJsdGlkeSBQYXRoJyBub3Qgc2V0IVwiICtcbiAgICAgICAgXCIgUGxlYXNlIHNldCB0aGlzIGluIHRoZSBBdG9tIEJlYXV0aWZ5IHBhY2thZ2Ugc2V0dGluZ3MuXCIpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIG9wdGlvbnMucGVybHRpZHlfcGF0aFxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQHJ1bihcInBlcmx0aWR5XCIsIFtcbiAgICAgICctLXN0YW5kYXJkLW91dHB1dCdcbiAgICAgICctLXN0YW5kYXJkLWVycm9yLW91dHB1dCdcbiAgICAgICctLXF1aWV0J1xuICAgICAgXCItLXByb2ZpbGU9I3tvcHRpb25zLnBlcmx0aWR5X3Byb2ZpbGV9XCIgaWYgb3B0aW9ucy5wZXJsdGlkeV9wcm9maWxlPy5sZW5ndGhcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBdLCBoZWxwOiB7XG4gICAgICAgIGxpbms6IFwiaHR0cDovL3Blcmx0aWR5LnNvdXJjZWZvcmdlLm5ldC9cIlxuICAgICAgfSlcbiJdfQ==
