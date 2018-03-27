(function() {
  var CompositeDisposable, Emitter, Input, ref;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  module.exports = Input = (function() {
    Input.prototype.onDidChange = function(fn) {
      return this.emitter.on('did-change', fn);
    };

    Input.prototype.onDidConfirm = function(fn) {
      return this.emitter.on('did-confirm', fn);
    };

    Input.prototype.onDidCancel = function(fn) {
      return this.emitter.on('did-cancel', fn);
    };

    function Input(vimState) {
      this.vimState = vimState;
      this.editorElement = this.vimState.editorElement;
      this.vimState.onDidFailToPushToOperationStack((function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      this.emitter = new Emitter;
    }

    Input.prototype.destroy = function() {
      var ref1;
      return ref1 = {}, this.vimState = ref1.vimState, ref1;
    };

    Input.prototype.focus = function(options) {
      var chars, charsMax, classNames, hideCursor, ref1;
      if (options == null) {
        options = {};
      }
      charsMax = options.charsMax, hideCursor = options.hideCursor;
      if (charsMax == null) {
        charsMax = 1;
      }
      chars = [];
      this.disposables = new CompositeDisposable();
      classNames = ["vim-mode-plus-input-char-waiting", "is-focused"];
      if (hideCursor) {
        classNames.push('hide-cursor');
      }
      this.disposables.add((ref1 = this.vimState).swapClassName.apply(ref1, classNames));
      this.disposables.add(this.vimState.onDidSetInputChar((function(_this) {
        return function(char) {
          var text;
          if (charsMax === 1) {
            return _this.confirm(char);
          } else {
            chars.push(char);
            text = chars.join('');
            _this.emitter.emit('did-change', text);
            if (chars.length >= charsMax) {
              return _this.confirm(text);
            }
          }
        };
      })(this)));
      return this.disposables.add(atom.commands.add(this.editorElement, {
        'core:cancel': (function(_this) {
          return function(event) {
            event.stopImmediatePropagation();
            return _this.cancel();
          };
        })(this),
        'core:confirm': (function(_this) {
          return function(event) {
            event.stopImmediatePropagation();
            return _this.confirm(chars.join(''));
          };
        })(this)
      }));
    };

    Input.prototype.confirm = function(char) {
      var ref1;
      if ((ref1 = this.disposables) != null) {
        ref1.dispose();
      }
      return this.emitter.emit('did-confirm', char);
    };

    Input.prototype.cancel = function() {
      var ref1;
      if ((ref1 = this.disposables) != null) {
        ref1.dispose();
      }
      return this.emitter.emit('did-cancel');
    };

    return Input;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2lucHV0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxxQkFBRCxFQUFVOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQ007b0JBQ0osV0FBQSxHQUFhLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsRUFBMUI7SUFBUjs7b0JBQ2IsWUFBQSxHQUFjLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGFBQVosRUFBMkIsRUFBM0I7SUFBUjs7b0JBQ2QsV0FBQSxHQUFhLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsRUFBMUI7SUFBUjs7SUFFQSxlQUFDLFFBQUQ7TUFBQyxJQUFDLENBQUEsV0FBRDtNQUNYLElBQUMsQ0FBQSxnQkFBaUIsSUFBQyxDQUFBLFNBQWxCO01BQ0YsSUFBQyxDQUFBLFFBQVEsQ0FBQywrQkFBVixDQUEwQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3hDLEtBQUMsQ0FBQSxNQUFELENBQUE7UUFEd0M7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFDO01BRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO0lBSko7O29CQU1iLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTthQUFBLE9BQWMsRUFBZCxFQUFDLElBQUMsQ0FBQSxnQkFBQSxRQUFGLEVBQUE7SUFETzs7b0JBR1QsS0FBQSxHQUFPLFNBQUMsT0FBRDtBQUNMLFVBQUE7O1FBRE0sVUFBUTs7TUFDYiwyQkFBRCxFQUFXOztRQUNYLFdBQVk7O01BQ1osS0FBQSxHQUFRO01BRVIsSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxtQkFBQSxDQUFBO01BQ25CLFVBQUEsR0FBYSxDQUFDLGtDQUFELEVBQXNDLFlBQXRDO01BQ2IsSUFBa0MsVUFBbEM7UUFBQSxVQUFVLENBQUMsSUFBWCxDQUFnQixhQUFoQixFQUFBOztNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixRQUFBLElBQUMsQ0FBQSxRQUFELENBQVMsQ0FBQyxhQUFWLGFBQXdCLFVBQXhCLENBQWpCO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsaUJBQVYsQ0FBNEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7QUFDM0MsY0FBQTtVQUFBLElBQUcsUUFBQSxLQUFZLENBQWY7bUJBQ0UsS0FBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULEVBREY7V0FBQSxNQUFBO1lBR0UsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYO1lBQ0EsSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsRUFBWDtZQUNQLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLFlBQWQsRUFBNEIsSUFBNUI7WUFDQSxJQUFHLEtBQUssQ0FBQyxNQUFOLElBQWdCLFFBQW5CO3FCQUNFLEtBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxFQURGO2FBTkY7O1FBRDJDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QixDQUFqQjthQVVBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLGFBQW5CLEVBQ2Y7UUFBQSxhQUFBLEVBQWUsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxLQUFEO1lBQ2IsS0FBSyxDQUFDLHdCQUFOLENBQUE7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBQTtVQUZhO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFmO1FBR0EsY0FBQSxFQUFnQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEtBQUQ7WUFDZCxLQUFLLENBQUMsd0JBQU4sQ0FBQTttQkFDQSxLQUFDLENBQUEsT0FBRCxDQUFTLEtBQUssQ0FBQyxJQUFOLENBQVcsRUFBWCxDQUFUO1VBRmM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSGhCO09BRGUsQ0FBakI7SUFuQks7O29CQTJCUCxPQUFBLEdBQVMsU0FBQyxJQUFEO0FBQ1AsVUFBQTs7WUFBWSxDQUFFLE9BQWQsQ0FBQTs7YUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxhQUFkLEVBQTZCLElBQTdCO0lBRk87O29CQUlULE1BQUEsR0FBUSxTQUFBO0FBQ04sVUFBQTs7WUFBWSxDQUFFLE9BQWQsQ0FBQTs7YUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxZQUFkO0lBRk07Ozs7O0FBaERWIiwic291cmNlc0NvbnRlbnQiOlsie0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgSW5wdXRcbiAgb25EaWRDaGFuZ2U6IChmbikgLT4gQGVtaXR0ZXIub24gJ2RpZC1jaGFuZ2UnLCBmblxuICBvbkRpZENvbmZpcm06IChmbikgLT4gQGVtaXR0ZXIub24gJ2RpZC1jb25maXJtJywgZm5cbiAgb25EaWRDYW5jZWw6IChmbikgLT4gQGVtaXR0ZXIub24gJ2RpZC1jYW5jZWwnLCBmblxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAdmltU3RhdGUub25EaWRGYWlsVG9QdXNoVG9PcGVyYXRpb25TdGFjayA9PlxuICAgICAgQGNhbmNlbCgpXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gIGRlc3Ryb3k6IC0+XG4gICAge0B2aW1TdGF0ZX0gPSB7fVxuXG4gIGZvY3VzOiAob3B0aW9ucz17fSkgLT5cbiAgICB7Y2hhcnNNYXgsIGhpZGVDdXJzb3J9ID0gb3B0aW9uc1xuICAgIGNoYXJzTWF4ID89IDFcbiAgICBjaGFycyA9IFtdXG5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgY2xhc3NOYW1lcyA9IFtcInZpbS1tb2RlLXBsdXMtaW5wdXQtY2hhci13YWl0aW5nXCIsICBcImlzLWZvY3VzZWRcIl1cbiAgICBjbGFzc05hbWVzLnB1c2goJ2hpZGUtY3Vyc29yJykgaWYgaGlkZUN1cnNvclxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHZpbVN0YXRlLnN3YXBDbGFzc05hbWUoY2xhc3NOYW1lcy4uLilcbiAgICBAZGlzcG9zYWJsZXMuYWRkIEB2aW1TdGF0ZS5vbkRpZFNldElucHV0Q2hhciAoY2hhcikgPT5cbiAgICAgIGlmIGNoYXJzTWF4IGlzIDFcbiAgICAgICAgQGNvbmZpcm0oY2hhcilcbiAgICAgIGVsc2VcbiAgICAgICAgY2hhcnMucHVzaChjaGFyKVxuICAgICAgICB0ZXh0ID0gY2hhcnMuam9pbignJylcbiAgICAgICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZScsIHRleHQpXG4gICAgICAgIGlmIGNoYXJzLmxlbmd0aCA+PSBjaGFyc01heFxuICAgICAgICAgIEBjb25maXJtKHRleHQpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkIEBlZGl0b3JFbGVtZW50LFxuICAgICAgJ2NvcmU6Y2FuY2VsJzogKGV2ZW50KSA9PlxuICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgICBAY2FuY2VsKClcbiAgICAgICdjb3JlOmNvbmZpcm0nOiAoZXZlbnQpID0+XG4gICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICAgIEBjb25maXJtKGNoYXJzLmpvaW4oJycpKVxuXG4gIGNvbmZpcm06IChjaGFyKSAtPlxuICAgIEBkaXNwb3NhYmxlcz8uZGlzcG9zZSgpXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNvbmZpcm0nLCBjaGFyKVxuXG4gIGNhbmNlbDogLT5cbiAgICBAZGlzcG9zYWJsZXM/LmRpc3Bvc2UoKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jYW5jZWwnKVxuIl19
