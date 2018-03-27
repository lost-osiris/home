
/*
 */

(function() {
  "use strict";
  var Beautifier, Gherkin, Lexer, logger,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  Lexer = require('gherkin').Lexer('en');

  logger = require('../logger')(__filename);

  module.exports = Gherkin = (function(superClass) {
    extend(Gherkin, superClass);

    function Gherkin() {
      return Gherkin.__super__.constructor.apply(this, arguments);
    }

    Gherkin.prototype.name = "Gherkin formatter";

    Gherkin.prototype.link = "https://github.com/Glavin001/atom-beautify/blob/master/src/beautifiers/gherkin.coffee";

    Gherkin.prototype.options = {
      gherkin: true
    };

    Gherkin.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var i, len, lexer, line, loggerLevel, recorder, ref;
        recorder = {
          lines: [],
          tags: [],
          comments: [],
          last_obj: null,
          indent_to: function(indent_level) {
            if (indent_level == null) {
              indent_level = 0;
            }
            return options.indent_char.repeat(options.indent_size * indent_level);
          },
          write_blank: function() {
            return this.lines.push('');
          },
          write_indented: function(content, indent) {
            var i, len, line, ref, results;
            if (indent == null) {
              indent = 0;
            }
            ref = content.trim().split("\n");
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              line = ref[i];
              results.push(this.lines.push("" + (this.indent_to(indent)) + (line.trim())));
            }
            return results;
          },
          write_comments: function(indent) {
            var comment, i, len, ref, results;
            if (indent == null) {
              indent = 0;
            }
            ref = this.comments.splice(0, this.comments.length);
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              comment = ref[i];
              results.push(this.write_indented(comment, indent));
            }
            return results;
          },
          write_tags: function(indent) {
            if (indent == null) {
              indent = 0;
            }
            if (this.tags.length > 0) {
              return this.write_indented(this.tags.splice(0, this.tags.length).join(' '), indent);
            }
          },
          comment: function(value, line) {
            logger.verbose({
              token: 'comment',
              value: value.trim(),
              line: line
            });
            return this.comments.push(value);
          },
          tag: function(value, line) {
            logger.verbose({
              token: 'tag',
              value: value,
              line: line
            });
            return this.tags.push(value);
          },
          feature: function(keyword, name, description, line) {
            logger.verbose({
              token: 'feature',
              keyword: keyword,
              name: name,
              description: description,
              line: line
            });
            this.write_comments(0);
            this.write_tags(0);
            this.write_indented(keyword + ": " + name, '');
            if (description) {
              return this.write_indented(description, 1);
            }
          },
          background: function(keyword, name, description, line) {
            logger.verbose({
              token: 'background',
              keyword: keyword,
              name: name,
              description: description,
              line: line
            });
            this.write_blank();
            this.write_comments(1);
            this.write_indented(keyword + ": " + name, 1);
            if (description) {
              return this.write_indented(description, 2);
            }
          },
          scenario: function(keyword, name, description, line) {
            logger.verbose({
              token: 'scenario',
              keyword: keyword,
              name: name,
              description: description,
              line: line
            });
            this.write_blank();
            this.write_comments(1);
            this.write_tags(1);
            this.write_indented(keyword + ": " + name, 1);
            if (description) {
              return this.write_indented(description, 2);
            }
          },
          scenario_outline: function(keyword, name, description, line) {
            logger.verbose({
              token: 'outline',
              keyword: keyword,
              name: name,
              description: description,
              line: line
            });
            this.write_blank();
            this.write_comments(1);
            this.write_tags(1);
            this.write_indented(keyword + ": " + name, 1);
            if (description) {
              return this.write_indented(description, 2);
            }
          },
          examples: function(keyword, name, description, line) {
            logger.verbose({
              token: 'examples',
              keyword: keyword,
              name: name,
              description: description,
              line: line
            });
            this.write_blank();
            this.write_comments(2);
            this.write_tags(2);
            this.write_indented(keyword + ": " + name, 2);
            if (description) {
              return this.write_indented(description, 3);
            }
          },
          step: function(keyword, name, line) {
            logger.verbose({
              token: 'step',
              keyword: keyword,
              name: name,
              line: line
            });
            this.write_comments(2);
            return this.write_indented("" + keyword + name, 2);
          },
          doc_string: function(content_type, string, line) {
            var three_quotes;
            logger.verbose({
              token: 'doc_string',
              content_type: content_type,
              string: string,
              line: line
            });
            three_quotes = '"""';
            this.write_comments(2);
            return this.write_indented("" + three_quotes + content_type + "\n" + string + "\n" + three_quotes, 3);
          },
          row: function(cells, line) {
            logger.verbose({
              token: 'row',
              cells: cells,
              line: line
            });
            this.write_comments(3);
            return this.write_indented("| " + (cells.join(' | ')) + " |", 3);
          },
          eof: function() {
            logger.verbose({
              token: 'eof'
            });
            return this.write_comments(2);
          }
        };
        lexer = new Lexer(recorder);
        lexer.scan(text);
        loggerLevel = typeof atom !== "undefined" && atom !== null ? atom.config.get('atom-beautify.general.loggerLevel') : void 0;
        if (loggerLevel === 'verbose') {
          ref = recorder.lines;
          for (i = 0, len = ref.length; i < len; i++) {
            line = ref[i];
            logger.verbose("> " + line);
          }
        }
        return resolve(recorder.lines.join("\n"));
      });
    };

    return Gherkin;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2doZXJraW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0FBQUE7RUFHQTtBQUhBLE1BQUEsa0NBQUE7SUFBQTs7O0VBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUixDQUFrQixDQUFDLEtBQW5CLENBQXlCLElBQXpCOztFQUNSLE1BQUEsR0FBUyxPQUFBLENBQVEsV0FBUixDQUFBLENBQXFCLFVBQXJCOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3NCQUNyQixJQUFBLEdBQU07O3NCQUNOLElBQUEsR0FBTTs7c0JBRU4sT0FBQSxHQUFTO01BQ1AsT0FBQSxFQUFTLElBREY7OztzQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDbEIsWUFBQTtRQUFBLFFBQUEsR0FBVztVQUNULEtBQUEsRUFBTyxFQURFO1VBRVQsSUFBQSxFQUFNLEVBRkc7VUFHVCxRQUFBLEVBQVUsRUFIRDtVQUtULFFBQUEsRUFBVSxJQUxEO1VBT1QsU0FBQSxFQUFXLFNBQUMsWUFBRDs7Y0FBQyxlQUFlOztBQUN6QixtQkFBTyxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQXBCLENBQTJCLE9BQU8sQ0FBQyxXQUFSLEdBQXNCLFlBQWpEO1VBREUsQ0FQRjtVQVVULFdBQUEsRUFBYSxTQUFBO21CQUNYLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLEVBQVo7VUFEVyxDQVZKO1VBYVQsY0FBQSxFQUFnQixTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ2QsZ0JBQUE7O2NBRHdCLFNBQVM7O0FBQ2pDO0FB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LFlBQTlELEVBQThFLENBQTlFO1VBTFUsQ0FsRkg7VUF5RlQsR0FBQSxFQUFLLFNBQUMsS0FBRCxFQUFRLElBQVI7WUFDSCxNQUFNLENBQUMsT0FBUCxDQUFlO2NBQUMsS0FBQSxFQUFPLEtBQVI7Y0FBZSxLQUFBLEVBQU8sS0FBdEI7Y0FBNkIsSUFBQSxFQUFNLElBQW5DO2FBQWY7WUFJQSxJQUFDLENBQUEsY0FBRCxDQUFnQixDQUFoQjttQkFDQSxJQUFDLENBQUEsY0FBRCxDQUFnQixJQUFBLEdBQUksQ0FBQyxLQUFLLENBQUMsSUFBTixDQUFXLEtBQVgsQ0FBRCxDQUFKLEdBQXVCLElBQXZDLEVBQTRDLENBQTVDO1VBTkcsQ0F6Rkk7VUFpR1QsR0FBQSxFQUFLLFNBQUE7WUFDSCxNQUFNLENBQUMsT0FBUCxDQUFlO2NBQUMsS0FBQSxFQUFPLEtBQVI7YUFBZjttQkFFQSxJQUFDLENBQUEsY0FBRCxDQUFnQixDQUFoQjtVQUhHLENBakdJOztRQXVHWCxLQUFBLEdBQVksSUFBQSxLQUFBLENBQU0sUUFBTjtRQUNaLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtRQUVBLFdBQUEsa0RBQWMsSUFBSSxDQUFFLE1BQU0sQ0FBQyxHQUFiLENBQWlCLG1DQUFqQjtRQUNkLElBQUcsV0FBQSxLQUFlLFNBQWxCO0FBQ0U7QUFBQSxlQUFBLHFDQUFBOztZQUNFLE1BQU0sQ0FBQyxPQUFQLENBQWUsSUFBQSxHQUFLLElBQXBCO0FBREYsV0FERjs7ZUFJQSxPQUFBLENBQVEsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFmLENBQW9CLElBQXBCLENBQVI7TUFoSGtCLENBQVQ7SUFESDs7OztLQVIyQjtBQVJ2QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcbkxleGVyID0gcmVxdWlyZSgnZ2hlcmtpbicpLkxleGVyKCdlbicpXG5sb2dnZXIgPSByZXF1aXJlKCcuLi9sb2dnZXInKShfX2ZpbGVuYW1lKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEdoZXJraW4gZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiR2hlcmtpbiBmb3JtYXR0ZXJcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9HbGF2aW4wMDEvYXRvbS1iZWF1dGlmeS9ibG9iL21hc3Rlci9zcmMvYmVhdXRpZmllcnMvZ2hlcmtpbi5jb2ZmZWVcIlxuXG4gIG9wdGlvbnM6IHtcbiAgICBnaGVya2luOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIHJlY29yZGVyID0ge1xuICAgICAgICBsaW5lczogW11cbiAgICAgICAgdGFnczogW11cbiAgICAgICAgY29tbWVudHM6IFtdXG5cbiAgICAgICAgbGFzdF9vYmo6IG51bGxcblxuICAgICAgICBpbmRlbnRfdG86IChpbmRlbnRfbGV2ZWwgPSAwKSAtPlxuICAgICAgICAgIHJldHVybiBvcHRpb25zLmluZGVudF9jaGFyLnJlcGVhdChvcHRpb25zLmluZGVudF9zaXplICogaW5kZW50X2xldmVsKVxuXG4gICAgICAgIHdyaXRlX2JsYW5rOiAoKSAtPlxuICAgICAgICAgIEBsaW5lcy5wdXNoKCcnKVxuXG4gICAgICAgIHdyaXRlX2luZGVudGVkOiAoY29udGVudCwgaW5kZW50ID0gMCkgLT5cbiAgICAgICAgICBmb3IgbGluZSBpbiBjb250ZW50LnRyaW0oKS5zcGxpdChcIlxcblwiKVxuICAgICAgICAgICAgQGxpbmVzLnB1c2goXCIje0BpbmRlbnRfdG8oaW5kZW50KX0je2xpbmUudHJpbSgpfVwiKVxuXG4gICAgICAgIHdyaXRlX2NvbW1lbnRzOiAoaW5kZW50ID0gMCkgLT5cbiAgICAgICAgICBmb3IgY29tbWVudCBpbiBAY29tbWVudHMuc3BsaWNlKDAsIEBjb21tZW50cy5sZW5ndGgpXG4gICAgICAgICAgICBAd3JpdGVfaW5kZW50ZWQoY29tbWVudCwgaW5kZW50KVxuXG4gICAgICAgIHdyaXRlX3RhZ3M6IChpbmRlbnQgPSAwKSAtPlxuICAgICAgICAgIGlmIEB0YWdzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChAdGFncy5zcGxpY2UoMCwgQHRhZ3MubGVuZ3RoKS5qb2luKCcgJyksIGluZGVudClcblxuICAgICAgICBjb21tZW50OiAodmFsdWUsIGxpbmUpIC0+XG4gICAgICAgICAgbG9nZ2VyLnZlcmJvc2Uoe3Rva2VuOiAnY29tbWVudCcsIHZhbHVlOiB2YWx1ZS50cmltKCksIGxpbmU6IGxpbmV9KVxuICAgICAgICAgIEBjb21tZW50cy5wdXNoKHZhbHVlKVxuXG4gICAgICAgIHRhZzogKHZhbHVlLCBsaW5lKSAtPlxuICAgICAgICAgIGxvZ2dlci52ZXJib3NlKHt0b2tlbjogJ3RhZycsIHZhbHVlOiB2YWx1ZSwgbGluZTogbGluZX0pXG4gICAgICAgICAgQHRhZ3MucHVzaCh2YWx1ZSlcblxuICAgICAgICBmZWF0dXJlOiAoa2V5d29yZCwgbmFtZSwgZGVzY3JpcHRpb24sIGxpbmUpIC0+XG4gICAgICAgICAgbG9nZ2VyLnZlcmJvc2Uoe3Rva2VuOiAnZmVhdHVyZScsIGtleXdvcmQ6IGtleXdvcmQsIG5hbWU6IG5hbWUsIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbiwgbGluZTogbGluZX0pXG5cbiAgICAgICAgICBAd3JpdGVfY29tbWVudHMoMClcbiAgICAgICAgICBAd3JpdGVfdGFncygwKVxuICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChcIiN7a2V5d29yZH06ICN7bmFtZX1cIiwgJycpXG4gICAgICAgICAgQHdyaXRlX2luZGVudGVkKGRlc2NyaXB0aW9uLCAxKSBpZiBkZXNjcmlwdGlvblxuXG4gICAgICAgIGJhY2tncm91bmQ6IChrZXl3b3JkLCBuYW1lLCBkZXNjcmlwdGlvbiwgbGluZSkgLT5cbiAgICAgICAgICBsb2dnZXIudmVyYm9zZSh7dG9rZW46ICdiYWNrZ3JvdW5kJywga2V5d29yZDoga2V5d29yZCwgbmFtZTogbmFtZSwgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLCBsaW5lOiBsaW5lfSlcblxuICAgICAgICAgIEB3cml0ZV9ibGFuaygpXG4gICAgICAgICAgQHdyaXRlX2NvbW1lbnRzKDEpXG4gICAgICAgICAgQHdyaXRlX2luZGVudGVkKFwiI3trZXl3b3JkfTogI3tuYW1lfVwiLCAxKVxuICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChkZXNjcmlwdGlvbiwgMikgaWYgZGVzY3JpcHRpb25cblxuICAgICAgICBzY2VuYXJpbzogKGtleXdvcmQsIG5hbWUsIGRlc2NyaXB0aW9uLCBsaW5lKSAtPlxuICAgICAgICAgIGxvZ2dlci52ZXJib3NlKHt0b2tlbjogJ3NjZW5hcmlvJywga2V5d29yZDoga2V5d29yZCwgbmFtZTogbmFtZSwgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLCBsaW5lOiBsaW5lfSlcblxuICAgICAgICAgIEB3cml0ZV9ibGFuaygpXG4gICAgICAgICAgQHdyaXRlX2NvbW1lbnRzKDEpXG4gICAgICAgICAgQHdyaXRlX3RhZ3MoMSlcbiAgICAgICAgICBAd3JpdGVfaW5kZW50ZWQoXCIje2tleXdvcmR9OiAje25hbWV9XCIsIDEpXG4gICAgICAgICAgQHdyaXRlX2luZGVudGVkKGRlc2NyaXB0aW9uLCAyKSBpZiBkZXNjcmlwdGlvblxuXG4gICAgICAgIHNjZW5hcmlvX291dGxpbmU6IChrZXl3b3JkLCBuYW1lLCBkZXNjcmlwdGlvbiwgbGluZSkgLT5cbiAgICAgICAgICBsb2dnZXIudmVyYm9zZSh7dG9rZW46ICdvdXRsaW5lJywga2V5d29yZDoga2V5d29yZCwgbmFtZTogbmFtZSwgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLCBsaW5lOiBsaW5lfSlcblxuICAgICAgICAgIEB3cml0ZV9ibGFuaygpXG4gICAgICAgICAgQHdyaXRlX2NvbW1lbnRzKDEpXG4gICAgICAgICAgQHdyaXRlX3RhZ3MoMSlcbiAgICAgICAgICBAd3JpdGVfaW5kZW50ZWQoXCIje2tleXdvcmR9OiAje25hbWV9XCIsIDEpXG4gICAgICAgICAgQHdyaXRlX2luZGVudGVkKGRlc2NyaXB0aW9uLCAyKSBpZiBkZXNjcmlwdGlvblxuXG4gICAgICAgIGV4YW1wbGVzOiAoa2V5d29yZCwgbmFtZSwgZGVzY3JpcHRpb24sIGxpbmUpIC0+XG4gICAgICAgICAgbG9nZ2VyLnZlcmJvc2Uoe3Rva2VuOiAnZXhhbXBsZXMnLCBrZXl3b3JkOiBrZXl3b3JkLCBuYW1lOiBuYW1lLCBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sIGxpbmU6IGxpbmV9KVxuXG4gICAgICAgICAgQHdyaXRlX2JsYW5rKClcbiAgICAgICAgICBAd3JpdGVfY29tbWVudHMoMilcbiAgICAgICAgICBAd3JpdGVfdGFncygyKVxuICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChcIiN7a2V5d29yZH06ICN7bmFtZX1cIiwgMilcbiAgICAgICAgICBAd3JpdGVfaW5kZW50ZWQoZGVzY3JpcHRpb24sIDMpIGlmIGRlc2NyaXB0aW9uXG5cbiAgICAgICAgc3RlcDogKGtleXdvcmQsIG5hbWUsIGxpbmUpIC0+XG4gICAgICAgICAgbG9nZ2VyLnZlcmJvc2Uoe3Rva2VuOiAnc3RlcCcsIGtleXdvcmQ6IGtleXdvcmQsIG5hbWU6IG5hbWUsIGxpbmU6IGxpbmV9KVxuXG4gICAgICAgICAgQHdyaXRlX2NvbW1lbnRzKDIpXG4gICAgICAgICAgQHdyaXRlX2luZGVudGVkKFwiI3trZXl3b3JkfSN7bmFtZX1cIiwgMilcblxuICAgICAgICBkb2Nfc3RyaW5nOiAoY29udGVudF90eXBlLCBzdHJpbmcsIGxpbmUpIC0+XG4gICAgICAgICAgbG9nZ2VyLnZlcmJvc2Uoe3Rva2VuOiAnZG9jX3N0cmluZycsIGNvbnRlbnRfdHlwZTogY29udGVudF90eXBlLCBzdHJpbmc6IHN0cmluZywgbGluZTogbGluZX0pXG4gICAgICAgICAgdGhyZWVfcXVvdGVzID0gJ1wiXCJcIidcblxuICAgICAgICAgIEB3cml0ZV9jb21tZW50cygyKVxuICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChcIiN7dGhyZWVfcXVvdGVzfSN7Y29udGVudF90eXBlfVxcbiN7c3RyaW5nfVxcbiN7dGhyZWVfcXVvdGVzfVwiLCAzKVxuXG4gICAgICAgIHJvdzogKGNlbGxzLCBsaW5lKSAtPlxuICAgICAgICAgIGxvZ2dlci52ZXJib3NlKHt0b2tlbjogJ3JvdycsIGNlbGxzOiBjZWxscywgbGluZTogbGluZX0pXG5cbiAgICAgICAgICAjIFRPRE86IG5lZWQgdG8gY29sbGVjdCByb3dzIHNvIHRoYXQgd2UgY2FuIGFsaWduIHRoZSB2ZXJ0aWNhbCBwaXBlcyB0byB0aGUgd2lkZXN0IGNvbHVtbnNcbiAgICAgICAgICAjIFNlZSBHaGVya2luOjpGb3JtYXR0ZXI6OlByZXR0eUZvcm1hdHRlciN0YWJsZShyb3dzKVxuICAgICAgICAgIEB3cml0ZV9jb21tZW50cygzKVxuICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChcInwgI3tjZWxscy5qb2luKCcgfCAnKX0gfFwiLCAzKVxuXG4gICAgICAgIGVvZjogKCkgLT5cbiAgICAgICAgICBsb2dnZXIudmVyYm9zZSh7dG9rZW46ICdlb2YnfSlcbiAgICAgICAgICAjIElmIHRoZXJlIHdlcmUgYW55IGNvbW1lbnRzIGxlZnQsIHRyZWF0IHRoZW0gYXMgc3RlcCBjb21tZW50cy5cbiAgICAgICAgICBAd3JpdGVfY29tbWVudHMoMilcbiAgICAgIH1cblxuICAgICAgbGV4ZXIgPSBuZXcgTGV4ZXIocmVjb3JkZXIpXG4gICAgICBsZXhlci5zY2FuKHRleHQpXG5cbiAgICAgIGxvZ2dlckxldmVsID0gYXRvbT8uY29uZmlnLmdldCgnYXRvbS1iZWF1dGlmeS5nZW5lcmFsLmxvZ2dlckxldmVsJylcbiAgICAgIGlmIGxvZ2dlckxldmVsIGlzICd2ZXJib3NlJ1xuICAgICAgICBmb3IgbGluZSBpbiByZWNvcmRlci5saW5lc1xuICAgICAgICAgIGxvZ2dlci52ZXJib3NlKFwiPiAje2xpbmV9XCIpXG5cbiAgICAgIHJlc29sdmUgcmVjb3JkZXIubGluZXMuam9pbihcIlxcblwiKVxuICAgIClcbiJdfQ==
