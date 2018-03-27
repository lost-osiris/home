(function() {
  "use strict";
  var Beautifier, Remark,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Remark = (function(superClass) {
    extend(Remark, superClass);

    function Remark() {
      return Remark.__super__.constructor.apply(this, arguments);
    }

    Remark.prototype.name = "Remark";

    Remark.prototype.link = "https://github.com/wooorm/remark";

    Remark.prototype.options = {
      _: {
        gfm: true,
        yaml: true,
        commonmark: true,
        footnotes: true,
        pedantic: true,
        breaks: true,
        entities: true,
        setext: true,
        closeAtx: true,
        looseTable: true,
        spacedTable: true,
        fence: true,
        fences: true,
        bullet: true,
        listItemIndent: true,
        incrementListMarker: true,
        rule: true,
        ruleRepetition: true,
        ruleSpaces: true,
        strong: true,
        emphasis: true,
        position: true
      },
      Markdown: true
    };

    Remark.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var cleanMarkdown, err, remark;
        try {
          remark = require('remark');
          cleanMarkdown = remark().process(text, options).toString();
          return resolve(cleanMarkdown);
        } catch (error) {
          err = error;
          this.error("Remark error: " + err);
          return reject(err);
        }
      });
    };

    return Remark;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3JlbWFyay5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEsa0JBQUE7SUFBQTs7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3FCQUNyQixJQUFBLEdBQU07O3FCQUNOLElBQUEsR0FBTTs7cUJBQ04sT0FBQSxHQUFTO01BQ1AsQ0FBQSxFQUFHO1FBQ0QsR0FBQSxFQUFLLElBREo7UUFFRCxJQUFBLEVBQU0sSUFGTDtRQUdELFVBQUEsRUFBWSxJQUhYO1FBSUQsU0FBQSxFQUFXLElBSlY7UUFLRCxRQUFBLEVBQVUsSUFMVDtRQU1ELE1BQUEsRUFBUSxJQU5QO1FBT0QsUUFBQSxFQUFVLElBUFQ7UUFRRCxNQUFBLEVBQVEsSUFSUDtRQVNELFFBQUEsRUFBVSxJQVRUO1FBVUQsVUFBQSxFQUFZLElBVlg7UUFXRCxXQUFBLEVBQWEsSUFYWjtRQVlELEtBQUEsRUFBTyxJQVpOO1FBYUQsTUFBQSxFQUFRLElBYlA7UUFjRCxNQUFBLEVBQVEsSUFkUDtRQWVELGNBQUEsRUFBZ0IsSUFmZjtRQWdCRCxtQkFBQSxFQUFxQixJQWhCcEI7UUFpQkQsSUFBQSxFQUFNLElBakJMO1FBa0JELGNBQUEsRUFBZ0IsSUFsQmY7UUFtQkQsVUFBQSxFQUFZLElBbkJYO1FBb0JELE1BQUEsRUFBUSxJQXBCUDtRQXFCRCxRQUFBLEVBQVUsSUFyQlQ7UUFzQkQsUUFBQSxFQUFVLElBdEJUO09BREk7TUF5QlAsUUFBQSxFQUFVLElBekJIOzs7cUJBNEJULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNsQixZQUFBO0FBQUE7VUFDRSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7VUFDVCxhQUFBLEdBQWdCLE1BQUEsQ0FBQSxDQUFRLENBQUMsT0FBVCxDQUFpQixJQUFqQixFQUF1QixPQUF2QixDQUErQixDQUFDLFFBQWhDLENBQUE7aUJBQ2hCLE9BQUEsQ0FBUSxhQUFSLEVBSEY7U0FBQSxhQUFBO1VBSU07VUFDSixJQUFDLENBQUEsS0FBRCxDQUFPLGdCQUFBLEdBQWlCLEdBQXhCO2lCQUNBLE1BQUEsQ0FBTyxHQUFQLEVBTkY7O01BRGtCLENBQVQ7SUFESDs7OztLQS9CMEI7QUFIdEMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUmVtYXJrIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlJlbWFya1wiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3dvb29ybS9yZW1hcmtcIlxuICBvcHRpb25zOiB7XG4gICAgXzoge1xuICAgICAgZ2ZtOiB0cnVlXG4gICAgICB5YW1sOiB0cnVlXG4gICAgICBjb21tb25tYXJrOiB0cnVlXG4gICAgICBmb290bm90ZXM6IHRydWVcbiAgICAgIHBlZGFudGljOiB0cnVlXG4gICAgICBicmVha3M6IHRydWVcbiAgICAgIGVudGl0aWVzOiB0cnVlXG4gICAgICBzZXRleHQ6IHRydWVcbiAgICAgIGNsb3NlQXR4OiB0cnVlXG4gICAgICBsb29zZVRhYmxlOiB0cnVlXG4gICAgICBzcGFjZWRUYWJsZTogdHJ1ZVxuICAgICAgZmVuY2U6IHRydWVcbiAgICAgIGZlbmNlczogdHJ1ZVxuICAgICAgYnVsbGV0OiB0cnVlXG4gICAgICBsaXN0SXRlbUluZGVudDogdHJ1ZVxuICAgICAgaW5jcmVtZW50TGlzdE1hcmtlcjogdHJ1ZVxuICAgICAgcnVsZTogdHJ1ZVxuICAgICAgcnVsZVJlcGV0aXRpb246IHRydWVcbiAgICAgIHJ1bGVTcGFjZXM6IHRydWVcbiAgICAgIHN0cm9uZzogdHJ1ZVxuICAgICAgZW1waGFzaXM6IHRydWVcbiAgICAgIHBvc2l0aW9uOiB0cnVlXG4gICAgfVxuICAgIE1hcmtkb3duOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIHRyeVxuICAgICAgICByZW1hcmsgPSByZXF1aXJlICdyZW1hcmsnXG4gICAgICAgIGNsZWFuTWFya2Rvd24gPSByZW1hcmsoKS5wcm9jZXNzKHRleHQsIG9wdGlvbnMpLnRvU3RyaW5nKClcbiAgICAgICAgcmVzb2x2ZSBjbGVhbk1hcmtkb3duXG4gICAgICBjYXRjaCBlcnJcbiAgICAgICAgQGVycm9yKFwiUmVtYXJrIGVycm9yOiAje2Vycn1cIilcbiAgICAgICAgcmVqZWN0KGVycilcbiAgICApXG4iXX0=
