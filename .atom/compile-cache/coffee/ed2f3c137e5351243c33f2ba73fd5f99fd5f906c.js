
/*
Requires https://github.com/nrc/rustfmt
 */

(function() {
  "use strict";
  var Beautifier, Rustfmt, path, versionCheckState,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  versionCheckState = false;

  module.exports = Rustfmt = (function(superClass) {
    extend(Rustfmt, superClass);

    function Rustfmt() {
      return Rustfmt.__super__.constructor.apply(this, arguments);
    }

    Rustfmt.prototype.name = "rustfmt";

    Rustfmt.prototype.link = "https://github.com/nrc/rustfmt";

    Rustfmt.prototype.options = {
      Rust: true
    };

    Rustfmt.prototype.beautify = function(text, language, options, context) {
      var cwd, help, p, program;
      cwd = context.filePath && path.dirname(context.filePath);
      program = options.rustfmt_path || "rustfmt";
      help = {
        link: "https://github.com/nrc/rustfmt",
        program: "rustfmt",
        pathOption: "Rust - Rustfmt Path"
      };
      p = versionCheckState === program ? this.Promise.resolve() : this.run(program, ["--version"], {
        help: help
      }).then(function(stdout) {
        if (/^0\.(?:[0-4]\.[0-9])/.test(stdout.trim())) {
          versionCheckState = false;
          throw new Error("rustfmt version 0.5.0 or newer required");
        } else {
          versionCheckState = program;
          return void 0;
        }
      });
      return p.then((function(_this) {
        return function() {
          return _this.run(program, [], {
            cwd: cwd,
            help: help,
            onStdin: function(stdin) {
              return stdin.end(text);
            }
          });
        };
      })(this));
    };

    return Rustfmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3J1c3RmbXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLDRDQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsaUJBQUEsR0FBb0I7O0VBRXBCLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3NCQUNyQixJQUFBLEdBQU07O3NCQUNOLElBQUEsR0FBTTs7c0JBRU4sT0FBQSxHQUFTO01BQ1AsSUFBQSxFQUFNLElBREM7OztzQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixFQUEwQixPQUExQjtBQUNSLFVBQUE7TUFBQSxHQUFBLEdBQU0sT0FBTyxDQUFDLFFBQVIsSUFBcUIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxPQUFPLENBQUMsUUFBckI7TUFDM0IsT0FBQSxHQUFVLE9BQU8sQ0FBQyxZQUFSLElBQXdCO01BQ2xDLElBQUEsR0FBTztRQUNMLElBQUEsRUFBTSxnQ0FERDtRQUVMLE9BQUEsRUFBUyxTQUZKO1FBR0wsVUFBQSxFQUFZLHFCQUhQOztNQVNQLENBQUEsR0FBTyxpQkFBQSxLQUFxQixPQUF4QixHQUNGLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFBLENBREUsR0FHRixJQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsRUFBYyxDQUFDLFdBQUQsQ0FBZCxFQUE2QjtRQUFBLElBQUEsRUFBTSxJQUFOO09BQTdCLENBQ0UsQ0FBQyxJQURILENBQ1EsU0FBQyxNQUFEO1FBQ0osSUFBRyxzQkFBc0IsQ0FBQyxJQUF2QixDQUE0QixNQUFNLENBQUMsSUFBUCxDQUFBLENBQTVCLENBQUg7VUFDRSxpQkFBQSxHQUFvQjtBQUNwQixnQkFBVSxJQUFBLEtBQUEsQ0FBTSx5Q0FBTixFQUZaO1NBQUEsTUFBQTtVQUlFLGlCQUFBLEdBQW9CO2lCQUNwQixPQUxGOztNQURJLENBRFI7YUFVRixDQUFDLENBQUMsSUFBRixDQUFPLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDTCxLQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsRUFBYyxFQUFkLEVBQWtCO1lBQ2hCLEdBQUEsRUFBSyxHQURXO1lBRWhCLElBQUEsRUFBTSxJQUZVO1lBR2hCLE9BQUEsRUFBUyxTQUFDLEtBQUQ7cUJBQ1AsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWO1lBRE8sQ0FITztXQUFsQjtRQURLO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFQO0lBekJROzs7O0tBUjJCO0FBVnZDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vbnJjL3J1c3RmbXRcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5wYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbnZlcnNpb25DaGVja1N0YXRlID0gZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBSdXN0Zm10IGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcInJ1c3RmbXRcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9ucmMvcnVzdGZtdFwiXG5cbiAgb3B0aW9uczoge1xuICAgIFJ1c3Q6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMsIGNvbnRleHQpIC0+XG4gICAgY3dkID0gY29udGV4dC5maWxlUGF0aCBhbmQgcGF0aC5kaXJuYW1lIGNvbnRleHQuZmlsZVBhdGhcbiAgICBwcm9ncmFtID0gb3B0aW9ucy5ydXN0Zm10X3BhdGggb3IgXCJydXN0Zm10XCJcbiAgICBoZWxwID0ge1xuICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vbnJjL3J1c3RmbXRcIlxuICAgICAgcHJvZ3JhbTogXCJydXN0Zm10XCJcbiAgICAgIHBhdGhPcHRpb246IFwiUnVzdCAtIFJ1c3RmbXQgUGF0aFwiXG4gICAgfVxuXG4gICAgIyAwLjUuMCBpcyBhIHJlbGF0aXZlbHkgbmV3IHZlcnNpb24gYXQgdGhlIHBvaW50IG9mIHdyaXRpbmcsXG4gICAgIyBidXQgaXMgZXNzZW50aWFsIGZvciB0aGlzIHRvIHdvcmsgd2l0aCBzdGRpbi5cbiAgICAjID0+IENoZWNrIGZvciBpdCBzcGVjaWZpY2FsbHkuXG4gICAgcCA9IGlmIHZlcnNpb25DaGVja1N0YXRlID09IHByb2dyYW1cbiAgICAgIEBQcm9taXNlLnJlc29sdmUoKVxuICAgIGVsc2VcbiAgICAgIEBydW4ocHJvZ3JhbSwgW1wiLS12ZXJzaW9uXCJdLCBoZWxwOiBoZWxwKVxuICAgICAgICAudGhlbigoc3Rkb3V0KSAtPlxuICAgICAgICAgIGlmIC9eMFxcLig/OlswLTRdXFwuWzAtOV0pLy50ZXN0KHN0ZG91dC50cmltKCkpXG4gICAgICAgICAgICB2ZXJzaW9uQ2hlY2tTdGF0ZSA9IGZhbHNlXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJydXN0Zm10IHZlcnNpb24gMC41LjAgb3IgbmV3ZXIgcmVxdWlyZWRcIilcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB2ZXJzaW9uQ2hlY2tTdGF0ZSA9IHByb2dyYW1cbiAgICAgICAgICAgIHVuZGVmaW5lZFxuICAgICAgICApXG5cbiAgICBwLnRoZW4oPT5cbiAgICAgIEBydW4ocHJvZ3JhbSwgW10sIHtcbiAgICAgICAgY3dkOiBjd2RcbiAgICAgICAgaGVscDogaGVscFxuICAgICAgICBvblN0ZGluOiAoc3RkaW4pIC0+XG4gICAgICAgICAgc3RkaW4uZW5kIHRleHRcbiAgICAgIH0pXG4gICAgKVxuIl19
