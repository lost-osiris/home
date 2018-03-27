
/*
Requires https://github.com/jaspervdj/stylish-haskell
 */

(function() {
  "use strict";
  var Beautifier, StylishHaskell,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = StylishHaskell = (function(superClass) {
    extend(StylishHaskell, superClass);

    function StylishHaskell() {
      return StylishHaskell.__super__.constructor.apply(this, arguments);
    }

    StylishHaskell.prototype.name = "stylish-haskell";

    StylishHaskell.prototype.link = "https://github.com/jaspervdj/stylish-haskell";

    StylishHaskell.prototype.options = {
      Haskell: true
    };

    StylishHaskell.prototype.beautify = function(text, language, options) {
      return this.run("stylish-haskell", [this.tempFile("input", text)], {
        help: {
          link: "https://github.com/jaspervdj/stylish-haskell"
        }
      });
    };

    return StylishHaskell;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3N0eWxpc2gtaGFza2VsbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsMEJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7OzZCQUNyQixJQUFBLEdBQU07OzZCQUNOLElBQUEsR0FBTTs7NkJBRU4sT0FBQSxHQUFTO01BQ1AsT0FBQSxFQUFTLElBREY7Ozs2QkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjthQUNSLElBQUMsQ0FBQSxHQUFELENBQUssaUJBQUwsRUFBd0IsQ0FDdEIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBRHNCLENBQXhCLEVBRUs7UUFDRCxJQUFBLEVBQU07VUFDSixJQUFBLEVBQU0sOENBREY7U0FETDtPQUZMO0lBRFE7Ozs7S0FSa0M7QUFQOUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNwZXJ2ZGovc3R5bGlzaC1oYXNrZWxsXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFN0eWxpc2hIYXNrZWxsIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcInN0eWxpc2gtaGFza2VsbFwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2phc3BlcnZkai9zdHlsaXNoLWhhc2tlbGxcIlxuXG4gIG9wdGlvbnM6IHtcbiAgICBIYXNrZWxsOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBydW4oXCJzdHlsaXNoLWhhc2tlbGxcIiwgW1xuICAgICAgQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dClcbiAgICAgIF0sIHtcbiAgICAgICAgaGVscDoge1xuICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2phc3BlcnZkai9zdHlsaXNoLWhhc2tlbGxcIlxuICAgICAgICB9XG4gICAgICB9KVxuIl19
