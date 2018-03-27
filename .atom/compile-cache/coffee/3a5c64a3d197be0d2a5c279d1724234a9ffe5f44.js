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
      var cursorBufferPosition, cursorPosition, selectedText;
      if (!this.bracketMatcherBackticks()) {
        return true;
      }
      cursorBufferPosition = this.editor.getCursorBufferPosition();
      if ('punctuation.definition.quasi.begin.js' === this.editor.scopeDescriptorForBufferPosition(cursorBufferPosition).getScopesArray().slice(-1).toString()) {
        return true;
      }
      selectedText = this.editor.getSelectedText();
      cursorPosition = this.editor.getCursorBufferPosition();
      this.editor.insertText("`" + selectedText + "`");
      this.editor.setCursorBufferPosition(cursorPosition);
      this.editor.moveRight();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWJhYmVsL2xpYi9kaWQtaW5zZXJ0LXRleHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxhQUFBO0lBQUE7Ozs7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MsdUJBQUMsTUFBRDtNQUFDLElBQUMsQ0FBQSxTQUFEOztNQUNaLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBQyxDQUFBLE1BQWYsRUFBdUIsWUFBdkIsRUFBcUMsSUFBQyxDQUFBLFVBQXRDO0lBRFc7OzRCQUliLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxPQUFQO01BQ1YsSUFBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQUEsQ0FBZjtBQUFBLGVBQU8sS0FBUDs7TUFFQSxJQUFLLElBQUEsS0FBUSxJQUFiO1FBQ0UsSUFBRyxDQUFDLElBQUMsQ0FBQSwyQkFBRCxDQUFBLENBQUo7QUFBd0MsaUJBQU8sTUFBL0M7O1FBQ0EsSUFBRyxDQUFDLElBQUMsQ0FBQSwwQkFBRCxDQUFBLENBQUo7QUFBdUMsaUJBQU8sTUFBOUM7U0FGRjtPQUFBLE1BR0ssSUFBSyxJQUFBLEtBQVEsR0FBYjtRQUNILElBQUcsQ0FBQyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQUo7QUFBMkIsaUJBQU8sTUFBbEM7U0FERzs7YUFFTDtJQVJVOzs0QkFXWix1QkFBQSxHQUF5QixTQUFBO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGlCQUE5QixDQUFBLElBQ0wsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNDQUFoQixDQURLLElBRUwsYUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhCLENBQVIsRUFBQSxJQUFBO0lBSHFCOzs0QkFPekIsMkJBQUEsR0FBNkIsU0FBQTtBQUMzQixVQUFBO01B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QUFBLFVBQUE7YUFDbEIsTUFBTyxDQUFBLFVBQUEsQ0FBUCxHQUFxQixTQUFBO0FBQ25CLFlBQUE7UUFEb0I7UUFDcEIsSUFBTyxNQUFNLENBQUMsS0FBUCxDQUFhLElBQWIsRUFBbUIsSUFBbkIsQ0FBQSxLQUE0QixLQUFuQztpQkFDRSxRQUFRLENBQUMsS0FBVCxDQUFlLElBQWYsRUFBcUIsSUFBckIsRUFERjs7TUFEbUI7SUFGVDs7Ozs7QUEzRWhCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRGlkSW5zZXJ0VGV4dFxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IpIC0+XG4gICAgQGFkdmlzZUJlZm9yZShAZWRpdG9yLCAnaW5zZXJ0VGV4dCcsIEBpbnNlcnRUZXh0KVxuXG4gICMgcGF0Y2hlZCBUZXh0RWRpdG9yOjppbnNlcnRUZXh0XG4gIGluc2VydFRleHQ6ICh0ZXh0LCBvcHRpb25zKSA9PlxuICAgIHJldHVybiB0cnVlIGlmIEBlZGl0b3IuaGFzTXVsdGlwbGVDdXJzb3JzKCkgIyBmb3IgdGltZSBiZWluZ1xuXG4gICAgaWYgKCB0ZXh0IGlzIFwiXFxuXCIpXG4gICAgICBpZiAhQGluc2VydE5ld2xpbmVCZXR3ZWVuSlNYVGFncygpIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICBpZiAhQGluc2VydE5ld2xpbmVBZnRlckJhY2t0aWNrKCkgdGhlbiByZXR1cm4gZmFsc2VcbiAgICBlbHNlIGlmICggdGV4dCBpcyBcImBcIilcbiAgICAgIGlmICFAaW5zZXJ0QmFja1RpY2soKSB0aGVuIHJldHVybiBmYWxzZVxuICAgIHRydWVcblxuICAjIGNoZWNrIGJyYWNrZXQtbWF0Y2hlciBwYWNrYWdlIGNvbmZpZyB0byBkZXRlcm1pbmUgYmFja3RpY2sgaW5zZXJ0aW9uXG4gIGJyYWNrZXRNYXRjaGVyQmFja3RpY2tzOiAoKSAtPlxuICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZShcImJyYWNrZXQtbWF0Y2hlclwiKSBhbmRcbiAgICAgIGF0b20uY29uZmlnLmdldChcImJyYWNrZXQtbWF0Y2hlci5hdXRvY29tcGxldGVCcmFja2V0c1wiKSBhbmRcbiAgICAgIFwiYGBcIiBpbiBhdG9tLmNvbmZpZy5nZXQoXCJicmFja2V0LW1hdGNoZXIuYXV0b2NvbXBsZXRlQ2hhcmFjdGVyc1wiKVxuXG4gICMgaWYgYSBuZXdMaW5lIGlzIGVudGVyZWQgYmV0d2VlbiBhIEpTWCB0YWcgb3BlbiBhbmQgY2xvc2UgbWFya2VkXyA8ZGl2Pl88L2Rpdj5cbiAgIyB0aGVuIGFkZCBhbm90aGVyIG5ld0xpbmUgYW5kIHJlcG9zaXRpb24gY3Vyc29yXG4gIGluc2VydE5ld2xpbmVCZXR3ZWVuSlNYVGFnczogKCkgLT5cbiAgICBjdXJzb3JCdWZmZXJQb3NpdGlvbiA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIHJldHVybiB0cnVlIHVubGVzcyBjdXJzb3JCdWZmZXJQb3NpdGlvbi5jb2x1bW4gPiAwXG4gICAgcmV0dXJuIHRydWUgdW5sZXNzICdKU1hFbmRUYWdTdGFydCcgaXMgQGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihjdXJzb3JCdWZmZXJQb3NpdGlvbikuZ2V0U2NvcGVzQXJyYXkoKS5zbGljZSgtMSkudG9TdHJpbmcoKVxuICAgIGN1cnNvckJ1ZmZlclBvc2l0aW9uLmNvbHVtbi0tXG4gICAgcmV0dXJuIHRydWUgdW5sZXNzICdKU1hTdGFydFRhZ0VuZCcgaXMgQGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihjdXJzb3JCdWZmZXJQb3NpdGlvbikuZ2V0U2NvcGVzQXJyYXkoKS5zbGljZSgtMSkudG9TdHJpbmcoKVxuICAgIGluZGVudExlbmd0aCA9IEBlZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coY3Vyc29yQnVmZmVyUG9zaXRpb24ucm93KVxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dChcIlxcblxcblwiKVxuICAgIEBlZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cgY3Vyc29yQnVmZmVyUG9zaXRpb24ucm93KzEsIGluZGVudExlbmd0aCsxLCB7IHByZXNlcnZlTGVhZGluZ1doaXRlc3BhY2U6IGZhbHNlIH1cbiAgICBAZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93IGN1cnNvckJ1ZmZlclBvc2l0aW9uLnJvdysyLCBpbmRlbnRMZW5ndGgsIHsgcHJlc2VydmVMZWFkaW5nV2hpdGVzcGFjZTogZmFsc2UgfVxuICAgIEBlZGl0b3IubW92ZVVwKClcbiAgICBAZWRpdG9yLm1vdmVUb0VuZE9mTGluZSgpXG4gICAgZmFsc2VcblxuICAjIGlmIGEgbmV3bGluZSBpcyBlbnRlcmVkIGFmdGVyIHRoZSBvcGVuaW5nIGJhY2t0aWNrXG4gICMgaW5kZW50IGN1cnNvciBhbmQgYWRkIGEgY2xvc2luZyBiYWNrdGlja1xuICBpbnNlcnROZXdsaW5lQWZ0ZXJCYWNrdGljazogKCkgLT5cbiAgICBjdXJzb3JCdWZmZXJQb3NpdGlvbiA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIHJldHVybiB0cnVlIHVubGVzcyBjdXJzb3JCdWZmZXJQb3NpdGlvbi5jb2x1bW4gPiAwXG4gICAgYmV0d2VlbkJhY2tUaWNrcyA9ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnF1YXNpLmVuZC5qcycgaXMgQGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihjdXJzb3JCdWZmZXJQb3NpdGlvbikuZ2V0U2NvcGVzQXJyYXkoKS5zbGljZSgtMSkudG9TdHJpbmcoKVxuICAgIGN1cnNvckJ1ZmZlclBvc2l0aW9uLmNvbHVtbi0tXG4gICAgcmV0dXJuIHRydWUgdW5sZXNzICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnF1YXNpLmJlZ2luLmpzJyBpcyBAZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKGN1cnNvckJ1ZmZlclBvc2l0aW9uKS5nZXRTY29wZXNBcnJheSgpLnNsaWNlKC0xKS50b1N0cmluZygpXG4gICAgaW5kZW50TGVuZ3RoID0gQGVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3JCdWZmZXJQb3NpdGlvbi5yb3cpXG4gICAgcmV0dXJuIHRydWUgdW5sZXNzIEBicmFja2V0TWF0Y2hlckJhY2t0aWNrcygpXG4gICAgaWYgKGJldHdlZW5CYWNrVGlja3MpXG4gICAgICBAZWRpdG9yLmluc2VydFRleHQoXCJcXG5cXG5cIilcbiAgICAgIEBlZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cgY3Vyc29yQnVmZmVyUG9zaXRpb24ucm93KzEsIGluZGVudExlbmd0aCsxLCB7IHByZXNlcnZlTGVhZGluZ1doaXRlc3BhY2U6IGZhbHNlIH1cbiAgICAgIEBlZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cgY3Vyc29yQnVmZmVyUG9zaXRpb24ucm93KzIsIGluZGVudExlbmd0aCwgeyBwcmVzZXJ2ZUxlYWRpbmdXaGl0ZXNwYWNlOiBmYWxzZSB9XG4gICAgICBAZWRpdG9yLm1vdmVVcCgpXG4gICAgICBAZWRpdG9yLm1vdmVUb0VuZE9mTGluZSgpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5pbnNlcnRUZXh0KFwiXFxuXFx0XCIpXG4gICAgICBAZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93IGN1cnNvckJ1ZmZlclBvc2l0aW9uLnJvdysxLCBpbmRlbnRMZW5ndGgrMSwgeyBwcmVzZXJ2ZUxlYWRpbmdXaGl0ZXNwYWNlOiBmYWxzZSB9XG4gICAgZmFsc2VcblxuICAjIHRoZSBhdG9tIGJyYWNrZXQgbWF0Y2hlciBkb2Vzbid0IGN1cnJlbnRseSAoIHYxLjE1KSBhZGQgYSBjbG9zaW5nIGJhY2t0aWNrIHdoZW4gdGhlIG9wZW5pbmdcbiAgIyBiYWNrdGljayBhcHBlYXJzIGFmdGVyIGEgd29yZCBjaGFyYWN0ZXIgYXMgaXMgdGhlIGNhc2UgaW4gYSB0YWduYW1lYGAgc2VxdWVuY2VcbiAgIyB0aGlzIHJlbWVkaWVzIHRoYXRcbiAgaW5zZXJ0QmFja1RpY2s6ICgpIC0+XG4gICAgcmV0dXJuIHRydWUgdW5sZXNzIEBicmFja2V0TWF0Y2hlckJhY2t0aWNrcygpXG4gICAgY3Vyc29yQnVmZmVyUG9zaXRpb24gPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICByZXR1cm4gdHJ1ZSBpZiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5xdWFzaS5iZWdpbi5qcycgaXMgQGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihjdXJzb3JCdWZmZXJQb3NpdGlvbikuZ2V0U2NvcGVzQXJyYXkoKS5zbGljZSgtMSkudG9TdHJpbmcoKVxuICAgIHNlbGVjdGVkVGV4dCA9IEBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KClcbiAgICBjdXJzb3JQb3NpdGlvbiA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dChcImBcIiArIHNlbGVjdGVkVGV4dCArIFwiYFwiKVxuICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oY3Vyc29yUG9zaXRpb24pXG4gICAgQGVkaXRvci5tb3ZlUmlnaHQoKVxuICAgIGZhbHNlXG5cblxuICAjIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2F0b20vdW5kZXJzY29yZS1wbHVzL2Jsb2IvbWFzdGVyL3NyYy91bmRlcnNjb3JlLXBsdXMuY29mZmVlXG4gIGFkdmlzZUJlZm9yZTogKG9iamVjdCwgbWV0aG9kTmFtZSwgYWR2aWNlKSAtPlxuICAgIG9yaWdpbmFsID0gb2JqZWN0W21ldGhvZE5hbWVdXG4gICAgb2JqZWN0W21ldGhvZE5hbWVdID0gKGFyZ3MuLi4pIC0+XG4gICAgICB1bmxlc3MgYWR2aWNlLmFwcGx5KHRoaXMsIGFyZ3MpID09IGZhbHNlXG4gICAgICAgIG9yaWdpbmFsLmFwcGx5KHRoaXMsIGFyZ3MpXG4iXX0=
