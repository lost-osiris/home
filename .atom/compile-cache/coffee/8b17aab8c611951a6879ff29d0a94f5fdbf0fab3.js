(function() {
  var continuationLine, emptyLine, objectLiteralLine;

  emptyLine = /^\s*$/;

  objectLiteralLine = /^\s*[\w'"]+\s*\:\s*/m;

  continuationLine = /[\{\(;,]\s*$/;

  module.exports = {
    activate: function(state) {
      atom.commands.add('atom-text-editor', {
        'es6-javascript:end-line': (function(_this) {
          return function() {
            return _this.endLine(';', false);
          };
        })(this)
      });
      atom.commands.add('atom-text-editor', {
        'es6-javascript:end-line-comma': (function(_this) {
          return function() {
            return _this.endLine(',', false);
          };
        })(this)
      });
      atom.commands.add('atom-text-editor', {
        'es6-javascript:end-new-line': (function(_this) {
          return function() {
            return _this.endLine('', true);
          };
        })(this)
      });
      return atom.commands.add('atom-text-editor', {
        'es6-javascript:wrap-block': (function(_this) {
          return function() {
            return _this.wrapBlock();
          };
        })(this)
      });
    },
    endLine: function(terminator, insertNewLine) {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      return editor.getCursors().forEach(function(cursor) {
        var line;
        line = cursor.getCurrentBufferLine();
        editor.moveToEndOfLine();
        if (!terminator) {
          terminator = objectLiteralLine.test(line) ? ',' : ';';
        }
        if (!continuationLine.test(line) && !emptyLine.test(line)) {
          editor.insertText(terminator);
        }
        if (insertNewLine) {
          return editor.insertNewlineBelow();
        }
      });
    },
    wrapBlock: function() {
      var editor, rangesToWrap;
      editor = atom.workspace.getActiveTextEditor();
      rangesToWrap = editor.getSelectedBufferRanges().filter(function(r) {
        return !r.isEmpty();
      });
      if (rangesToWrap.length) {
        rangesToWrap.sort(function(a, b) {
          if (a.start.row > b.start.row) {
            return -1;
          } else {
            return 1;
          }
        }).forEach(function(range) {
          var text;
          text = editor.getTextInBufferRange(range);
          if (/^\s*\{\s*/.test(text) && /\s*\}\s*/.test(text)) {
            return editor.setTextInBufferRange(range, text.replace(/\{\s*/, '').replace(/\s*\}/, ''));
          } else {
            return editor.setTextInBufferRange(range, '{\n' + text + '\n}');
          }
        });
        return editor.autoIndentSelectedRows();
      } else {
        editor.insertText('{\n\n}');
        editor.selectUp(2);
        editor.autoIndentSelectedRows();
        editor.moveRight();
        editor.moveUp();
        return editor.moveToEndOfLine();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2VzNi1qYXZhc2NyaXB0L2xpYi9lczYtamF2YXNjcmlwdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFNBQUEsR0FBWTs7RUFDWixpQkFBQSxHQUFvQjs7RUFDcEIsZ0JBQUEsR0FBbUI7O0VBRW5CLE1BQU0sQ0FBQyxPQUFQLEdBRUU7SUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFEO01BQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGtCQUFsQixFQUNFO1FBQUEseUJBQUEsRUFBMkIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsT0FBRCxDQUFTLEdBQVQsRUFBYyxLQUFkO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNCO09BREY7TUFFQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0Isa0JBQWxCLEVBQ0U7UUFBQSwrQkFBQSxFQUFpQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxPQUFELENBQVMsR0FBVCxFQUFjLEtBQWQ7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakM7T0FERjtNQUVBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFBbEIsRUFDRTtRQUFBLDZCQUFBLEVBQStCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBUyxFQUFULEVBQWEsSUFBYjtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQjtPQURGO2FBRUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGtCQUFsQixFQUNFO1FBQUEsMkJBQUEsRUFBNkIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsU0FBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCO09BREY7SUFQUSxDQUFWO0lBVUEsT0FBQSxFQUFTLFNBQUMsVUFBRCxFQUFhLGFBQWI7QUFDUCxVQUFBO01BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTthQUNULE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxPQUFwQixDQUE0QixTQUFDLE1BQUQ7QUFDMUIsWUFBQTtRQUFBLElBQUEsR0FBTyxNQUFNLENBQUMsb0JBQVAsQ0FBQTtRQUNQLE1BQU0sQ0FBQyxlQUFQLENBQUE7UUFFQSxJQUFHLENBQUMsVUFBSjtVQUVFLFVBQUEsR0FBZ0IsaUJBQWlCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FBSCxHQUFxQyxHQUFyQyxHQUE4QyxJQUY3RDs7UUFJQSxJQUFpQyxDQUFDLGdCQUFnQixDQUFDLElBQWpCLENBQXNCLElBQXRCLENBQUQsSUFBaUMsQ0FBQyxTQUFTLENBQUMsSUFBVixDQUFlLElBQWYsQ0FBbkU7VUFBQSxNQUFNLENBQUMsVUFBUCxDQUFrQixVQUFsQixFQUFBOztRQUNBLElBQStCLGFBQS9CO2lCQUFBLE1BQU0sQ0FBQyxrQkFBUCxDQUFBLEVBQUE7O01BVDBCLENBQTVCO0lBRk8sQ0FWVDtJQXdCQSxTQUFBLEVBQVcsU0FBQTtBQUNULFVBQUE7TUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO01BQ1QsWUFBQSxHQUFlLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQWdDLENBQUMsTUFBakMsQ0FBd0MsU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDLENBQUMsT0FBRixDQUFBO01BQVIsQ0FBeEM7TUFDZixJQUFHLFlBQVksQ0FBQyxNQUFoQjtRQUNFLFlBQVksQ0FBQyxJQUFiLENBQWtCLFNBQUMsQ0FBRCxFQUFJLENBQUo7VUFDVCxJQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBUixHQUFjLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBekI7bUJBQWtDLENBQUMsRUFBbkM7V0FBQSxNQUFBO21CQUEwQyxFQUExQzs7UUFEUyxDQUFsQixDQUVDLENBQUMsT0FGRixDQUVVLFNBQUMsS0FBRDtBQUNSLGNBQUE7VUFBQSxJQUFBLEdBQU8sTUFBTSxDQUFDLG9CQUFQLENBQTRCLEtBQTVCO1VBQ1AsSUFBSSxXQUFXLENBQUMsSUFBWixDQUFpQixJQUFqQixDQUFBLElBQTBCLFVBQVUsQ0FBQyxJQUFYLENBQWdCLElBQWhCLENBQTlCO21CQUVFLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixLQUE1QixFQUFtQyxJQUFJLENBQUMsT0FBTCxDQUFhLE9BQWIsRUFBc0IsRUFBdEIsQ0FBeUIsQ0FBQyxPQUExQixDQUFrQyxPQUFsQyxFQUEyQyxFQUEzQyxDQUFuQyxFQUZGO1dBQUEsTUFBQTttQkFLRSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsS0FBNUIsRUFBbUMsS0FBQSxHQUFRLElBQVIsR0FBZSxLQUFsRCxFQUxGOztRQUZRLENBRlY7ZUFXQSxNQUFNLENBQUMsc0JBQVAsQ0FBQSxFQVpGO09BQUEsTUFBQTtRQWVFLE1BQU0sQ0FBQyxVQUFQLENBQWtCLFFBQWxCO1FBQ0EsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBaEI7UUFDQSxNQUFNLENBQUMsc0JBQVAsQ0FBQTtRQUNBLE1BQU0sQ0FBQyxTQUFQLENBQUE7UUFDQSxNQUFNLENBQUMsTUFBUCxDQUFBO2VBQ0EsTUFBTSxDQUFDLGVBQVAsQ0FBQSxFQXBCRjs7SUFIUyxDQXhCWDs7QUFORiIsInNvdXJjZXNDb250ZW50IjpbImVtcHR5TGluZSA9IC9eXFxzKiQvXG5vYmplY3RMaXRlcmFsTGluZSA9IC9eXFxzKltcXHcnXCJdK1xccypcXDpcXHMqL21cbmNvbnRpbnVhdGlvbkxpbmUgPSAvW1xce1xcKDssXVxccyokL1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsXG4gICAgICAnZXM2LWphdmFzY3JpcHQ6ZW5kLWxpbmUnOiA9PiBAZW5kTGluZSgnOycsIGZhbHNlKVxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdlczYtamF2YXNjcmlwdDplbmQtbGluZS1jb21tYSc6ID0+IEBlbmRMaW5lKCcsJywgZmFsc2UpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ2VzNi1qYXZhc2NyaXB0OmVuZC1uZXctbGluZSc6ID0+IEBlbmRMaW5lKCcnLCB0cnVlKVxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdlczYtamF2YXNjcmlwdDp3cmFwLWJsb2NrJzogPT4gQHdyYXBCbG9jaygpXG5cbiAgZW5kTGluZTogKHRlcm1pbmF0b3IsIGluc2VydE5ld0xpbmUpIC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgZWRpdG9yLmdldEN1cnNvcnMoKS5mb3JFYWNoKChjdXJzb3IpIC0+XG4gICAgICBsaW5lID0gY3Vyc29yLmdldEN1cnJlbnRCdWZmZXJMaW5lKClcbiAgICAgIGVkaXRvci5tb3ZlVG9FbmRPZkxpbmUoKVxuXG4gICAgICBpZiAhdGVybWluYXRvclxuICAgICAgICAjIGd1ZXNzIHRoZSBiZXN0IHRlcm1pbmF0b3JcbiAgICAgICAgdGVybWluYXRvciA9IGlmIG9iamVjdExpdGVyYWxMaW5lLnRlc3QobGluZSkgdGhlbiAnLCcgZWxzZSAnOydcblxuICAgICAgZWRpdG9yLmluc2VydFRleHQodGVybWluYXRvcikgaWYgIWNvbnRpbnVhdGlvbkxpbmUudGVzdChsaW5lKSBhbmQgIWVtcHR5TGluZS50ZXN0KGxpbmUpXG4gICAgICBlZGl0b3IuaW5zZXJ0TmV3bGluZUJlbG93KCkgaWYgaW5zZXJ0TmV3TGluZVxuICAgIClcblxuICB3cmFwQmxvY2s6ICgpIC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcmFuZ2VzVG9XcmFwID0gZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKCkuZmlsdGVyKChyKSAtPiAhci5pc0VtcHR5KCkpXG4gICAgaWYgcmFuZ2VzVG9XcmFwLmxlbmd0aFxuICAgICAgcmFuZ2VzVG9XcmFwLnNvcnQoKGEsIGIpIC0+XG4gICAgICAgIHJldHVybiBpZiBhLnN0YXJ0LnJvdyA+IGIuc3RhcnQucm93IHRoZW4gLTEgZWxzZSAxXG4gICAgICApLmZvckVhY2goKHJhbmdlKSAtPlxuICAgICAgICB0ZXh0ID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICBpZiAoL15cXHMqXFx7XFxzKi8udGVzdCh0ZXh0KSAmJiAvXFxzKlxcfVxccyovLnRlc3QodGV4dCkpXG4gICAgICAgICAgIyB1bndyYXAgZWFjaCBzZWxlY3Rpb24gZnJvbSBpdHMgYmxvY2tcbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UsIHRleHQucmVwbGFjZSgvXFx7XFxzKi8sICcnKS5yZXBsYWNlKC9cXHMqXFx9LywgJycpKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyB3cmFwIGVhY2ggc2VsZWN0aW9uIGluIGEgYmxvY2tcbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UsICd7XFxuJyArIHRleHQgKyAnXFxufScpXG4gICAgICApXG4gICAgICBlZGl0b3IuYXV0b0luZGVudFNlbGVjdGVkUm93cygpXG4gICAgZWxzZVxuICAgICAgIyBjcmVhdGUgYW4gZW1wdHkgYmxvY2sgYXQgZWFjaCBjdXJzb3JcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCd7XFxuXFxufScpXG4gICAgICBlZGl0b3Iuc2VsZWN0VXAoMilcbiAgICAgIGVkaXRvci5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKClcbiAgICAgIGVkaXRvci5tb3ZlUmlnaHQoKVxuICAgICAgZWRpdG9yLm1vdmVVcCgpXG4gICAgICBlZGl0b3IubW92ZVRvRW5kT2ZMaW5lKClcbiJdfQ==
