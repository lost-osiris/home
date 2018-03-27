
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

    Sqlformat.prototype.isPreInstalled = false;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3NxbGZvcm1hdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEscUJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3dCQUNyQixJQUFBLEdBQU07O3dCQUNOLElBQUEsR0FBTTs7d0JBQ04sY0FBQSxHQUFnQjs7d0JBRWhCLE9BQUEsR0FBUztNQUNQLEdBQUEsRUFBSyxJQURFOzs7d0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLLFdBQUwsRUFBa0IsQ0FDaEIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBRGdCLEVBRWhCLFlBRmdCLEVBRzJCLDJCQUEzQyxHQUFBLGlCQUFBLEdBQWtCLE9BQU8sQ0FBQyxXQUExQixHQUFBLE1BSGdCLEVBSXFCLDBCQUFBLElBQXFCLE9BQU8sQ0FBQyxRQUFSLEtBQW9CLFdBQTlFLEdBQUEsYUFBQSxHQUFjLE9BQU8sQ0FBQyxRQUF0QixHQUFBLE1BSmdCLEVBSzJCLDZCQUFBLElBQXdCLE9BQU8sQ0FBQyxXQUFSLEtBQXVCLFdBQTFGLEdBQUEsZ0JBQUEsR0FBaUIsT0FBTyxDQUFDLFdBQXpCLEdBQUEsTUFMZ0IsQ0FBbEIsRUFNSztRQUFBLElBQUEsRUFBTTtVQUNQLElBQUEsRUFBTSwwQ0FEQztTQUFOO09BTkw7SUFEUTs7OztLQVQ2QjtBQVB6QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL2FuZGlhbGJyZWNodC9zcWxwYXJzZVxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTcWxmb3JtYXQgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwic3FsZm9ybWF0XCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYW5kaWFsYnJlY2h0L3NxbHBhcnNlXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIFNRTDogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBAcnVuKFwic3FsZm9ybWF0XCIsIFtcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBcIi0tcmVpbmRlbnRcIlxuICAgICAgXCItLWluZGVudF93aWR0aD0je29wdGlvbnMuaW5kZW50X3NpemV9XCIgaWYgb3B0aW9ucy5pbmRlbnRfc2l6ZT9cbiAgICAgIFwiLS1rZXl3b3Jkcz0je29wdGlvbnMua2V5d29yZHN9XCIgaWYgKG9wdGlvbnMua2V5d29yZHM/ICYmIG9wdGlvbnMua2V5d29yZHMgIT0gJ3VuY2hhbmdlZCcpXG4gICAgICBcIi0taWRlbnRpZmllcnM9I3tvcHRpb25zLmlkZW50aWZpZXJzfVwiIGlmIChvcHRpb25zLmlkZW50aWZpZXJzPyAmJiBvcHRpb25zLmlkZW50aWZpZXJzICE9ICd1bmNoYW5nZWQnKVxuICAgICAgXSwgaGVscDoge1xuICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9hbmRpYWxicmVjaHQvc3FscGFyc2VcIlxuICAgICAgfSlcbiJdfQ==
