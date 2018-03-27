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

    Input.prototype.focus = function(charsMax) {
      var chars;
      if (charsMax == null) {
        charsMax = 1;
      }
      chars = [];
      this.disposables = new CompositeDisposable();
      this.disposables.add(this.vimState.swapClassName("vim-mode-plus-input-char-waiting", "is-focused"));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2lucHV0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxxQkFBRCxFQUFVOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQ007b0JBQ0osV0FBQSxHQUFhLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsRUFBMUI7SUFBUjs7b0JBQ2IsWUFBQSxHQUFjLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGFBQVosRUFBMkIsRUFBM0I7SUFBUjs7b0JBQ2QsV0FBQSxHQUFhLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsRUFBMUI7SUFBUjs7SUFFQSxlQUFDLFFBQUQ7TUFBQyxJQUFDLENBQUEsV0FBRDtNQUNYLElBQUMsQ0FBQSxnQkFBaUIsSUFBQyxDQUFBLFNBQWxCO01BQ0YsSUFBQyxDQUFBLFFBQVEsQ0FBQywrQkFBVixDQUEwQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3hDLEtBQUMsQ0FBQSxNQUFELENBQUE7UUFEd0M7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFDO01BRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO0lBSko7O29CQU1iLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTthQUFBLE9BQWMsRUFBZCxFQUFDLElBQUMsQ0FBQSxnQkFBQSxRQUFGLEVBQUE7SUFETzs7b0JBR1QsS0FBQSxHQUFPLFNBQUMsUUFBRDtBQUNMLFVBQUE7O1FBRE0sV0FBUzs7TUFDZixLQUFBLEdBQVE7TUFFUixJQUFDLENBQUEsV0FBRCxHQUFtQixJQUFBLG1CQUFBLENBQUE7TUFDbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsYUFBVixDQUF3QixrQ0FBeEIsRUFBNkQsWUFBN0QsQ0FBakI7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxpQkFBVixDQUE0QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtBQUMzQyxjQUFBO1VBQUEsSUFBRyxRQUFBLEtBQVksQ0FBZjttQkFDRSxLQUFDLENBQUEsT0FBRCxDQUFTLElBQVQsRUFERjtXQUFBLE1BQUE7WUFHRSxLQUFLLENBQUMsSUFBTixDQUFXLElBQVg7WUFDQSxJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxFQUFYO1lBQ1AsS0FBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsWUFBZCxFQUE0QixJQUE1QjtZQUNBLElBQUcsS0FBSyxDQUFDLE1BQU4sSUFBZ0IsUUFBbkI7cUJBQ0UsS0FBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULEVBREY7YUFORjs7UUFEMkM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVCLENBQWpCO2FBVUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsYUFBbkIsRUFDZjtRQUFBLGFBQUEsRUFBZSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEtBQUQ7WUFDYixLQUFLLENBQUMsd0JBQU4sQ0FBQTttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFBO1VBRmE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWY7UUFHQSxjQUFBLEVBQWdCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsS0FBRDtZQUNkLEtBQUssQ0FBQyx3QkFBTixDQUFBO21CQUNBLEtBQUMsQ0FBQSxPQUFELENBQVMsS0FBSyxDQUFDLElBQU4sQ0FBVyxFQUFYLENBQVQ7VUFGYztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIaEI7T0FEZSxDQUFqQjtJQWZLOztvQkF1QlAsT0FBQSxHQUFTLFNBQUMsSUFBRDtBQUNQLFVBQUE7O1lBQVksQ0FBRSxPQUFkLENBQUE7O2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsYUFBZCxFQUE2QixJQUE3QjtJQUZPOztvQkFJVCxNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7O1lBQVksQ0FBRSxPQUFkLENBQUE7O2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsWUFBZDtJQUZNOzs7OztBQTVDViIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIElucHV0XG4gIG9uRGlkQ2hhbmdlOiAoZm4pIC0+IEBlbWl0dGVyLm9uICdkaWQtY2hhbmdlJywgZm5cbiAgb25EaWRDb25maXJtOiAoZm4pIC0+IEBlbWl0dGVyLm9uICdkaWQtY29uZmlybScsIGZuXG4gIG9uRGlkQ2FuY2VsOiAoZm4pIC0+IEBlbWl0dGVyLm9uICdkaWQtY2FuY2VsJywgZm5cblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG4gICAgQHZpbVN0YXRlLm9uRGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2sgPT5cbiAgICAgIEBjYW5jZWwoKVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICBkZXN0cm95OiAtPlxuICAgIHtAdmltU3RhdGV9ID0ge31cblxuICBmb2N1czogKGNoYXJzTWF4PTEpIC0+XG4gICAgY2hhcnMgPSBbXVxuXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHZpbVN0YXRlLnN3YXBDbGFzc05hbWUoXCJ2aW0tbW9kZS1wbHVzLWlucHV0LWNoYXItd2FpdGluZ1wiLCAgXCJpcy1mb2N1c2VkXCIpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAdmltU3RhdGUub25EaWRTZXRJbnB1dENoYXIgKGNoYXIpID0+XG4gICAgICBpZiBjaGFyc01heCBpcyAxXG4gICAgICAgIEBjb25maXJtKGNoYXIpXG4gICAgICBlbHNlXG4gICAgICAgIGNoYXJzLnB1c2goY2hhcilcbiAgICAgICAgdGV4dCA9IGNoYXJzLmpvaW4oJycpXG4gICAgICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UnLCB0ZXh0KVxuICAgICAgICBpZiBjaGFycy5sZW5ndGggPj0gY2hhcnNNYXhcbiAgICAgICAgICBAY29uZmlybSh0ZXh0KVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBAZWRpdG9yRWxlbWVudCxcbiAgICAgICdjb3JlOmNhbmNlbCc6IChldmVudCkgPT5cbiAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgICAgQGNhbmNlbCgpXG4gICAgICAnY29yZTpjb25maXJtJzogKGV2ZW50KSA9PlxuICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgICBAY29uZmlybShjaGFycy5qb2luKCcnKSlcblxuICBjb25maXJtOiAoY2hhcikgLT5cbiAgICBAZGlzcG9zYWJsZXM/LmRpc3Bvc2UoKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jb25maXJtJywgY2hhcilcblxuICBjYW5jZWw6IC0+XG4gICAgQGRpc3Bvc2FibGVzPy5kaXNwb3NlKClcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2FuY2VsJylcbiJdfQ==
