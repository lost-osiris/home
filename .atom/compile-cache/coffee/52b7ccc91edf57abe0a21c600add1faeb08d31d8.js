
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2NyeXN0YWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLG1CQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztzQkFDckIsSUFBQSxHQUFNOztzQkFDTixJQUFBLEdBQU07O3NCQUVOLE9BQUEsR0FBUztNQUNQLE9BQUEsRUFBUyxLQURGOzs7c0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFFUixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsU0FBSjtlQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixJQUFDLENBQUEsb0JBQUQsQ0FDZCxTQURjLEVBRWQ7VUFDQSxJQUFBLEVBQU0seUJBRE47VUFFQSxPQUFBLEVBQVMsU0FGVDtTQUZjLENBQWhCLEVBREY7T0FBQSxNQUFBO2VBU0UsSUFBQyxDQUFBLEdBQUQsQ0FBSyxTQUFMLEVBQWdCLENBQ2QsTUFEYyxFQUVkLFFBRmMsRUFHZCxRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLENBSEcsQ0FBaEIsRUFJSztVQUFDLGdCQUFBLEVBQWtCLElBQW5CO1NBSkwsQ0FLRSxDQUFDLElBTEgsQ0FLUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtVQURJO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUxSLEVBVEY7O0lBRlE7Ozs7S0FSMkI7QUFQdkMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNwZXJ2ZGovc3R5bGlzaC1oYXNrZWxsXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIENyeXN0YWwgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiQ3J5c3RhbFwiXG4gIGxpbms6IFwiaHR0cDovL2NyeXN0YWwtbGFuZy5vcmdcIlxuXG4gIG9wdGlvbnM6IHtcbiAgICBDcnlzdGFsOiBmYWxzZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICAjIFNlZW1zIHRoYXQgQ3J5c3RhbCBkb3Nlbid0IGhhdmUgV2luZG93cyBzdXBwb3J0IHlldC5cbiAgICBpZiBAaXNXaW5kb3dzXG4gICAgICBAUHJvbWlzZS5yZWplY3QoQGNvbW1hbmROb3RGb3VuZEVycm9yKFxuICAgICAgICAnY3J5c3RhbCdcbiAgICAgICAge1xuICAgICAgICBsaW5rOiBcImh0dHA6Ly9jcnlzdGFsLWxhbmcub3JnXCJcbiAgICAgICAgcHJvZ3JhbTogXCJjcnlzdGFsXCJcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICBlbHNlXG4gICAgICBAcnVuKFwiY3J5c3RhbFwiLCBbXG4gICAgICAgICd0b29sJyxcbiAgICAgICAgJ2Zvcm1hdCcsXG4gICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0KVxuICAgICAgICBdLCB7aWdub3JlUmV0dXJuQ29kZTogdHJ1ZX0pXG4gICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICApXG4iXX0=
