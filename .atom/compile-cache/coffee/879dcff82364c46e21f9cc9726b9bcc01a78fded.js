
/*
Requires https://github.com/andialbrecht/sqlparse
 */

(function() {
  "use strict";
  var Beautifier, Sqlformat,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Sqlformat = (function(superClass) {
    extend(Sqlformat, superClass);

    function Sqlformat() {
      return Sqlformat.__super__.constructor.apply(this, arguments);
    }

    Sqlformat.prototype.name = "sqlformat";

    Sqlformat.prototype.link = "https://github.com/andialbrecht/sqlparse";

    Sqlformat.prototype.options = {
      SQL: true
    };

    Sqlformat.prototype.beautify = function(text, language, options) {
      return this.run("sqlformat", [this.tempFile("input", text), "--reindent", options.indent_size != null ? "--indent_width=" + options.indent_size : void 0, (options.keywords != null) && options.keywords !== 'unchanged' ? "--keywords=" + options.keywords : void 0, (options.identifiers != null) && options.identifiers !== 'unchanged' ? "--identifiers=" + options.identifiers : void 0], {
        help: {
          link: "https://github.com/andialbrecht/sqlparse"
        }
      });
    };

    return Sqlformat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3NxbGZvcm1hdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEscUJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3dCQUNyQixJQUFBLEdBQU07O3dCQUNOLElBQUEsR0FBTTs7d0JBRU4sT0FBQSxHQUFTO01BQ1AsR0FBQSxFQUFLLElBREU7Ozt3QkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjthQUNSLElBQUMsQ0FBQSxHQUFELENBQUssV0FBTCxFQUFrQixDQUNoQixJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FEZ0IsRUFFaEIsWUFGZ0IsRUFHMkIsMkJBQTNDLEdBQUEsaUJBQUEsR0FBa0IsT0FBTyxDQUFDLFdBQTFCLEdBQUEsTUFIZ0IsRUFJcUIsMEJBQUEsSUFBcUIsT0FBTyxDQUFDLFFBQVIsS0FBb0IsV0FBOUUsR0FBQSxhQUFBLEdBQWMsT0FBTyxDQUFDLFFBQXRCLEdBQUEsTUFKZ0IsRUFLMkIsNkJBQUEsSUFBd0IsT0FBTyxDQUFDLFdBQVIsS0FBdUIsV0FBMUYsR0FBQSxnQkFBQSxHQUFpQixPQUFPLENBQUMsV0FBekIsR0FBQSxNQUxnQixDQUFsQixFQU1LO1FBQUEsSUFBQSxFQUFNO1VBQ1AsSUFBQSxFQUFNLDBDQURDO1NBQU47T0FOTDtJQURROzs7O0tBUjZCO0FBUHpDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vYW5kaWFsYnJlY2h0L3NxbHBhcnNlXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNxbGZvcm1hdCBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJzcWxmb3JtYXRcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9hbmRpYWxicmVjaHQvc3FscGFyc2VcIlxuXG4gIG9wdGlvbnM6IHtcbiAgICBTUUw6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQHJ1bihcInNxbGZvcm1hdFwiLCBbXG4gICAgICBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KVxuICAgICAgXCItLXJlaW5kZW50XCJcbiAgICAgIFwiLS1pbmRlbnRfd2lkdGg9I3tvcHRpb25zLmluZGVudF9zaXplfVwiIGlmIG9wdGlvbnMuaW5kZW50X3NpemU/XG4gICAgICBcIi0ta2V5d29yZHM9I3tvcHRpb25zLmtleXdvcmRzfVwiIGlmIChvcHRpb25zLmtleXdvcmRzPyAmJiBvcHRpb25zLmtleXdvcmRzICE9ICd1bmNoYW5nZWQnKVxuICAgICAgXCItLWlkZW50aWZpZXJzPSN7b3B0aW9ucy5pZGVudGlmaWVyc31cIiBpZiAob3B0aW9ucy5pZGVudGlmaWVycz8gJiYgb3B0aW9ucy5pZGVudGlmaWVycyAhPSAndW5jaGFuZ2VkJylcbiAgICAgIF0sIGhlbHA6IHtcbiAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYW5kaWFsYnJlY2h0L3NxbHBhcnNlXCJcbiAgICAgIH0pXG4iXX0=
