
/*
Requires https://github.com/jaspervdj/stylish-haskell
 */

(function() {
  "use strict";
  var Beautifier, Crystal,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Crystal = (function(superClass) {
    extend(Crystal, superClass);

    function Crystal() {
      return Crystal.__super__.constructor.apply(this, arguments);
    }

    Crystal.prototype.name = "Crystal";

    Crystal.prototype.link = "http://crystal-lang.org";

    Crystal.prototype.isPreInstalled = false;

    Crystal.prototype.options = {
      Crystal: false
    };

    Crystal.prototype.beautify = function(text, language, options) {
      var tempFile;
      if (this.isWindows) {
        return this.Promise.reject(this.commandNotFoundError('crystal', {
          link: "http://crystal-lang.org",
          program: "crystal"
        }));
      } else {
        return this.run("crystal", ['tool', 'format', tempFile = this.tempFile("temp", text)], {
          ignoreReturnCode: true
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      }
    };

    return Crystal;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2NyeXN0YWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLG1CQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztzQkFDckIsSUFBQSxHQUFNOztzQkFDTixJQUFBLEdBQU07O3NCQUNOLGNBQUEsR0FBZ0I7O3NCQUVoQixPQUFBLEdBQVM7TUFDUCxPQUFBLEVBQVMsS0FERjs7O3NCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBRVIsVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLFNBQUo7ZUFDRSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsSUFBQyxDQUFBLG9CQUFELENBQ2QsU0FEYyxFQUVkO1VBQ0EsSUFBQSxFQUFNLHlCQUROO1VBRUEsT0FBQSxFQUFTLFNBRlQ7U0FGYyxDQUFoQixFQURGO09BQUEsTUFBQTtlQVNFLElBQUMsQ0FBQSxHQUFELENBQUssU0FBTCxFQUFnQixDQUNkLE1BRGMsRUFFZCxRQUZjLEVBR2QsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQixDQUhHLENBQWhCLEVBSUs7VUFBQyxnQkFBQSxFQUFrQixJQUFuQjtTQUpMLENBS0UsQ0FBQyxJQUxILENBS1EsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7VUFESTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FMUixFQVRGOztJQUZROzs7O0tBVDJCO0FBUHZDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vamFzcGVydmRqL3N0eWxpc2gtaGFza2VsbFxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBDcnlzdGFsIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIkNyeXN0YWxcIlxuICBsaW5rOiBcImh0dHA6Ly9jcnlzdGFsLWxhbmcub3JnXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIENyeXN0YWw6IGZhbHNlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgICMgU2VlbXMgdGhhdCBDcnlzdGFsIGRvc2VuJ3QgaGF2ZSBXaW5kb3dzIHN1cHBvcnQgeWV0LlxuICAgIGlmIEBpc1dpbmRvd3NcbiAgICAgIEBQcm9taXNlLnJlamVjdChAY29tbWFuZE5vdEZvdW5kRXJyb3IoXG4gICAgICAgICdjcnlzdGFsJ1xuICAgICAgICB7XG4gICAgICAgIGxpbms6IFwiaHR0cDovL2NyeXN0YWwtbGFuZy5vcmdcIlxuICAgICAgICBwcm9ncmFtOiBcImNyeXN0YWxcIlxuICAgICAgICB9KVxuICAgICAgKVxuICAgIGVsc2VcbiAgICAgIEBydW4oXCJjcnlzdGFsXCIsIFtcbiAgICAgICAgJ3Rvb2wnLFxuICAgICAgICAnZm9ybWF0JyxcbiAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXG4gICAgICAgIF0sIHtpZ25vcmVSZXR1cm5Db2RlOiB0cnVlfSlcbiAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgIClcbiJdfQ==
