(function() {
  var DidInsertText,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  module.exports = DidInsertText = (function() {
    function DidInsertText(editor) {
      this.editor = editor;
      this.insertText = bind(this.insertText, this);
      this.adviseBefore(this.editor, 'insertText', this.insertText);
    }

    DidInsertText.prototype.insertText = function(text, options) {
      if (this.editor.hasMultipleCursors()) {
        return true;
      }
      if (text === "\n") {
        if (!this.insertNewlineBetweenJSXTags()) {
          return false;
        }
        if (!this.insertNewlineAfterBacktick()) {
          return false;
        }
      } else if (text === "`") {
        if (!this.insertBackTick()) {
          return false;
        }
      }
      return true;
    };

    DidInsertText.prototype.bracketMatcherBackticks = function() {
      return atom.packages.isPackageActive("bracket-matcher") && atom.config.get("bracket-matcher.autocompleteBrackets") && indexOf.call(atom.config.get("bracket-matcher.autocompleteCharacters"), "``") >= 0;
    };

    DidInsertText.prototype.insertNewlineBetweenJSXTags = function() {
      var cursorBufferPosition, indentLength;
      cursorBufferPosition = this.editor.getCursorBufferPosition();
      if (!(cursorBufferPosition.column > 0)) {
        return true;
      }
      if ('JSXEndTagStart' !== this.editor.scopeDescriptorForBufferPosition(cursorBufferPosition).getScopesArray().slice(-1).toString()) {
        return true;
      }
      cursorBufferPosition.column--;
      if ('JSXStartTagEnd' !== this.editor.scopeDescriptorForBufferPosition(cursorBufferPosition).getScopesArray().slice(-1).toString()) {
        return true;
      }
      indentLength = this.editor.indentationForBufferRow(cursorBufferPosition.row);
      this.editor.insertText("\n\n");
      this.editor.setIndentationForBufferRow(cursorBufferPosition.row + 1, indentLength + 1, {
        preserveLeadingWhitespace: false
      });
      this.editor.setIndentationForBufferRow(cursorBufferPosition.row + 2, indentLength, {
        preserveLeadingWhitespace: false
      });
      this.editor.moveUp();
      this.editor.moveToEndOfLine();
      return false;
    };

    DidInsertText.prototype.insertNewlineAfterBacktick = function() {
      var betweenBackTicks, cursorBufferPosition, indentLength;
      cursorBufferPosition = this.editor.getCursorBufferPosition();
      if (!(cursorBufferPosition.column > 0)) {
        return true;
      }
      betweenBackTicks = 'punctuation.definition.quasi.end.js' === this.editor.scopeDescriptorForBufferPosition(cursorBufferPosition).getScopesArray().slice(-1).toString();
      cursorBufferPosition.column--;
      if ('punctuation.definition.quasi.begin.js' !== this.editor.scopeDescriptorForBufferPosition(cursorBufferPosition).getScopesArray().slice(-1).toString()) {
        return true;
      }
      indentLength = this.editor.indentationForBufferRow(cursorBufferPosition.row);
      if (!this.bracketMatcherBackticks()) {
        return true;
      }
      if (betweenBackTicks) {
        this.editor.insertText("\n\n");
        this.editor.setIndentationForBufferRow(cursorBufferPosition.row + 1, indentLength + 1, {
          preserveLeadingWhitespace: false
        });
        this.editor.setIndentationForBufferRow(cursorBufferPosition.row + 2, indentLength, {
          preserveLeadingWhitespace: false
        });
        this.editor.moveUp();
        this.editor.moveToEndOfLine();
      } else {
        this.editor.insertText("\n\t");
        this.editor.setIndentationForBufferRow(cursorBufferPosition.row + 1, indentLength + 1, {
          preserveLeadingWhitespace: false
        });
      }
      return false;
    };

    DidInsertText.prototype.insertBackTick = function() {
      var cursorBufferPosition;
      if (!this.bracketMatcherBackticks()) {
        return true;
      }
      cursorBufferPosition = this.editor.getCursorBufferPosition();
      if ('punctuation.definition.quasi.begin.js' === this.editor.scopeDescriptorForBufferPosition(cursorBufferPosition).getScopesArray().slice(-1).toString()) {
        return true;
      }
      this.editor.insertText("``");
      this.editor.moveLeft();
      return false;
    };

    DidInsertText.prototype.adviseBefore = function(object, methodName, advice) {
      var original;
      original = object[methodName];
      return object[methodName] = function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        if (advice.apply(this, args) !== false) {
          return original.apply(this, args);
        }
      };
    };

    return DidInsertText;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWJhYmVsL2xpYi9kaWQtaW5zZXJ0LXRleHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxhQUFBO0lBQUE7Ozs7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MsdUJBQUMsTUFBRDtNQUFDLElBQUMsQ0FBQSxTQUFEOztNQUNaLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBQyxDQUFBLE1BQWYsRUFBdUIsWUFBdkIsRUFBcUMsSUFBQyxDQUFBLFVBQXRDO0lBRFc7OzRCQUliLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxPQUFQO01BQ1YsSUFBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQUEsQ0FBZjtBQUFBLGVBQU8sS0FBUDs7TUFFQSxJQUFLLElBQUEsS0FBUSxJQUFiO1FBQ0UsSUFBRyxDQUFDLElBQUMsQ0FBQSwyQkFBRCxDQUFBLENBQUo7QUFBd0MsaUJBQU8sTUFBL0M7O1FBQ0EsSUFBRyxDQUFDLElBQUMsQ0FBQSwwQkFBRCxDQUFBLENBQUo7QUFBdUMsaUJBQU8sTUFBOUM7U0FGRjtPQUFBLE1BR0ssSUFBSyxJQUFBLEtBQVEsR0FBYjtRQUNILElBQUcsQ0FBQyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQUo7QUFBMkIsaUJBQU8sTUFBbEM7U0FERzs7YUFFTDtJQVJVOzs0QkFXWix1QkFBQSxHQUF5QixTQUFBO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGlCQUE5QixDQUFBLElBQ0wsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNDQUFoQixDQURLLElBRUwsYUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhCLENBQVIsRUFBQSxJQUFBO0lBSHFCOzs0QkFPekIsMkJBQUEsR0FBNkIsU0FBQTtBQUMzQixVQUFBO01B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ZixFQUFxQixJQUFyQixFQURGOztNQURtQjtJQUZUOzs7OztBQXhFaEIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBEaWRJbnNlcnRUZXh0XG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvcikgLT5cbiAgICBAYWR2aXNlQmVmb3JlKEBlZGl0b3IsICdpbnNlcnRUZXh0JywgQGluc2VydFRleHQpXG5cbiAgIyBwYXRjaGVkIFRleHRFZGl0b3I6Omluc2VydFRleHRcbiAgaW5zZXJ0VGV4dDogKHRleHQsIG9wdGlvbnMpID0+XG4gICAgcmV0dXJuIHRydWUgaWYgQGVkaXRvci5oYXNNdWx0aXBsZUN1cnNvcnMoKSAjIGZvciB0aW1lIGJlaW5nXG5cbiAgICBpZiAoIHRleHQgaXMgXCJcXG5cIilcbiAgICAgIGlmICFAaW5zZXJ0TmV3bGluZUJldHdlZW5KU1hUYWdzKCkgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgIGlmICFAaW5zZXJ0TmV3bGluZUFmdGVyQmFja3RpY2soKSB0aGVuIHJldHVybiBmYWxzZVxuICAgIGVsc2UgaWYgKCB0ZXh0IGlzIFwiYFwiKVxuICAgICAgaWYgIUBpbnNlcnRCYWNrVGljaygpIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgdHJ1ZVxuXG4gICMgY2hlY2sgYnJhY2tldC1tYXRjaGVyIHBhY2thZ2UgY29uZmlnIHRvIGRldGVybWluZSBiYWNrdGljayBpbnNlcnRpb25cbiAgYnJhY2tldE1hdGNoZXJCYWNrdGlja3M6ICgpIC0+XG4gICAgcmV0dXJuIGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKFwiYnJhY2tldC1tYXRjaGVyXCIpIGFuZFxuICAgICAgYXRvbS5jb25maWcuZ2V0KFwiYnJhY2tldC1tYXRjaGVyLmF1dG9jb21wbGV0ZUJyYWNrZXRzXCIpIGFuZFxuICAgICAgXCJgYFwiIGluIGF0b20uY29uZmlnLmdldChcImJyYWNrZXQtbWF0Y2hlci5hdXRvY29tcGxldGVDaGFyYWN0ZXJzXCIpXG5cbiAgIyBpZiBhIG5ld0xpbmUgaXMgZW50ZXJlZCBiZXR3ZWVuIGEgSlNYIHRhZyBvcGVuIGFuZCBjbG9zZSBtYXJrZWRfIDxkaXY+XzwvZGl2PlxuICAjIHRoZW4gYWRkIGFub3RoZXIgbmV3TGluZSBhbmQgcmVwb3NpdGlvbiBjdXJzb3JcbiAgaW5zZXJ0TmV3bGluZUJldHdlZW5KU1hUYWdzOiAoKSAtPlxuICAgIGN1cnNvckJ1ZmZlclBvc2l0aW9uID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgcmV0dXJuIHRydWUgdW5sZXNzIGN1cnNvckJ1ZmZlclBvc2l0aW9uLmNvbHVtbiA+IDBcbiAgICByZXR1cm4gdHJ1ZSB1bmxlc3MgJ0pTWEVuZFRhZ1N0YXJ0JyBpcyBAZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKGN1cnNvckJ1ZmZlclBvc2l0aW9uKS5nZXRTY29wZXNBcnJheSgpLnNsaWNlKC0xKS50b1N0cmluZygpXG4gICAgY3Vyc29yQnVmZmVyUG9zaXRpb24uY29sdW1uLS1cbiAgICByZXR1cm4gdHJ1ZSB1bmxlc3MgJ0pTWFN0YXJ0VGFnRW5kJyBpcyBAZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKGN1cnNvckJ1ZmZlclBvc2l0aW9uKS5nZXRTY29wZXNBcnJheSgpLnNsaWNlKC0xKS50b1N0cmluZygpXG4gICAgaW5kZW50TGVuZ3RoID0gQGVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3JCdWZmZXJQb3NpdGlvbi5yb3cpXG4gICAgQGVkaXRvci5pbnNlcnRUZXh0KFwiXFxuXFxuXCIpXG4gICAgQGVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyBjdXJzb3JCdWZmZXJQb3NpdGlvbi5yb3crMSwgaW5kZW50TGVuZ3RoKzEsIHsgcHJlc2VydmVMZWFkaW5nV2hpdGVzcGFjZTogZmFsc2UgfVxuICAgIEBlZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cgY3Vyc29yQnVmZmVyUG9zaXRpb24ucm93KzIsIGluZGVudExlbmd0aCwgeyBwcmVzZXJ2ZUxlYWRpbmdXaGl0ZXNwYWNlOiBmYWxzZSB9XG4gICAgQGVkaXRvci5tb3ZlVXAoKVxuICAgIEBlZGl0b3IubW92ZVRvRW5kT2ZMaW5lKClcbiAgICBmYWxzZVxuXG4gICMgaWYgYSBuZXdsaW5lIGlzIGVudGVyZWQgYWZ0ZXIgdGhlIG9wZW5pbmcgYmFja3RpY2tcbiAgIyBpbmRlbnQgY3Vyc29yIGFuZCBhZGQgYSBjbG9zaW5nIGJhY2t0aWNrXG4gIGluc2VydE5ld2xpbmVBZnRlckJhY2t0aWNrOiAoKSAtPlxuICAgIGN1cnNvckJ1ZmZlclBvc2l0aW9uID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgcmV0dXJuIHRydWUgdW5sZXNzIGN1cnNvckJ1ZmZlclBvc2l0aW9uLmNvbHVtbiA+IDBcbiAgICBiZXR3ZWVuQmFja1RpY2tzID0gJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24ucXVhc2kuZW5kLmpzJyBpcyBAZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKGN1cnNvckJ1ZmZlclBvc2l0aW9uKS5nZXRTY29wZXNBcnJheSgpLnNsaWNlKC0xKS50b1N0cmluZygpXG4gICAgY3Vyc29yQnVmZmVyUG9zaXRpb24uY29sdW1uLS1cbiAgICByZXR1cm4gdHJ1ZSB1bmxlc3MgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24ucXVhc2kuYmVnaW4uanMnIGlzIEBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oY3Vyc29yQnVmZmVyUG9zaXRpb24pLmdldFNjb3Blc0FycmF5KCkuc2xpY2UoLTEpLnRvU3RyaW5nKClcbiAgICBpbmRlbnRMZW5ndGggPSBAZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KGN1cnNvckJ1ZmZlclBvc2l0aW9uLnJvdylcbiAgICByZXR1cm4gdHJ1ZSB1bmxlc3MgQGJyYWNrZXRNYXRjaGVyQmFja3RpY2tzKClcbiAgICBpZiAoYmV0d2VlbkJhY2tUaWNrcylcbiAgICAgIEBlZGl0b3IuaW5zZXJ0VGV4dChcIlxcblxcblwiKVxuICAgICAgQGVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyBjdXJzb3JCdWZmZXJQb3NpdGlvbi5yb3crMSwgaW5kZW50TGVuZ3RoKzEsIHsgcHJlc2VydmVMZWFkaW5nV2hpdGVzcGFjZTogZmFsc2UgfVxuICAgICAgQGVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyBjdXJzb3JCdWZmZXJQb3NpdGlvbi5yb3crMiwgaW5kZW50TGVuZ3RoLCB7IHByZXNlcnZlTGVhZGluZ1doaXRlc3BhY2U6IGZhbHNlIH1cbiAgICAgIEBlZGl0b3IubW92ZVVwKClcbiAgICAgIEBlZGl0b3IubW92ZVRvRW5kT2ZMaW5lKClcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLmluc2VydFRleHQoXCJcXG5cXHRcIilcbiAgICAgIEBlZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cgY3Vyc29yQnVmZmVyUG9zaXRpb24ucm93KzEsIGluZGVudExlbmd0aCsxLCB7IHByZXNlcnZlTGVhZGluZ1doaXRlc3BhY2U6IGZhbHNlIH1cbiAgICBmYWxzZVxuXG4gICMgdGhlIGF0b20gYnJhY2tldCBtYXRjaGVyIGRvZXNuJ3QgY3VycmVudGx5ICggdjEuMTUpIGFkZCBhIGNsb3NpbmcgYmFja3RpY2sgd2hlbiB0aGUgb3BlbmluZ1xuICAjIGJhY2t0aWNrIGFwcGVhcnMgYWZ0ZXIgYSB3b3JkIGNoYXJhY3RlciBhcyBpcyB0aGUgY2FzZSBpbiBhIHRhZ25hbWVgYCBzZXF1ZW5jZVxuICAjIHRoaXMgcmVtZWRpZXMgdGhhdFxuICBpbnNlcnRCYWNrVGljazogKCkgLT5cbiAgICByZXR1cm4gdHJ1ZSB1bmxlc3MgQGJyYWNrZXRNYXRjaGVyQmFja3RpY2tzKClcbiAgICBjdXJzb3JCdWZmZXJQb3NpdGlvbiA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIHJldHVybiB0cnVlIGlmICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnF1YXNpLmJlZ2luLmpzJyBpcyBAZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKGN1cnNvckJ1ZmZlclBvc2l0aW9uKS5nZXRTY29wZXNBcnJheSgpLnNsaWNlKC0xKS50b1N0cmluZygpXG4gICAgQGVkaXRvci5pbnNlcnRUZXh0KFwiYGBcIilcbiAgICBAZWRpdG9yLm1vdmVMZWZ0KClcbiAgICBmYWxzZVxuXG5cbiAgIyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL3VuZGVyc2NvcmUtcGx1cy9ibG9iL21hc3Rlci9zcmMvdW5kZXJzY29yZS1wbHVzLmNvZmZlZVxuICBhZHZpc2VCZWZvcmU6IChvYmplY3QsIG1ldGhvZE5hbWUsIGFkdmljZSkgLT5cbiAgICBvcmlnaW5hbCA9IG9iamVjdFttZXRob2ROYW1lXVxuICAgIG9iamVjdFttZXRob2ROYW1lXSA9IChhcmdzLi4uKSAtPlxuICAgICAgdW5sZXNzIGFkdmljZS5hcHBseSh0aGlzLCBhcmdzKSA9PSBmYWxzZVxuICAgICAgICBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmdzKVxuIl19
