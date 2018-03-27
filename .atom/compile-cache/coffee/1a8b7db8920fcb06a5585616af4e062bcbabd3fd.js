(function() {
  var Dialog, TextEditorView, View, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), TextEditorView = ref.TextEditorView, View = ref.View;

  module.exports = Dialog = (function(superClass) {
    extend(Dialog, superClass);

    function Dialog() {
      return Dialog.__super__.constructor.apply(this, arguments);
    }

    Dialog.content = function(arg) {
      var prompt;
      prompt = (arg != null ? arg : {}).prompt;
      return this.div({
        "class": 'terminal-plus-dialog'
      }, (function(_this) {
        return function() {
          _this.label(prompt, {
            "class": 'icon',
            outlet: 'promptText'
          });
          _this.subview('miniEditor', new TextEditorView({
            mini: true
          }));
          _this.label('Escape (Esc) to exit', {
            style: 'float: left;'
          });
          return _this.label('Enter (\u21B5) to confirm', {
            style: 'float: right;'
          });
        };
      })(this));
    };

    Dialog.prototype.initialize = function(arg) {
      var iconClass, placeholderText, ref1, stayOpen;
      ref1 = arg != null ? arg : {}, iconClass = ref1.iconClass, placeholderText = ref1.placeholderText, stayOpen = ref1.stayOpen;
      if (iconClass) {
        this.promptText.addClass(iconClass);
      }
      atom.commands.add(this.element, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.onConfirm(_this.miniEditor.getText());
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this)
      });
      if (!stayOpen) {
        this.miniEditor.on('blur', (function(_this) {
          return function() {
            return _this.close();
          };
        })(this));
      }
      if (placeholderText) {
        this.miniEditor.getModel().setText(placeholderText);
        return this.miniEditor.getModel().selectAll();
      }
    };

    Dialog.prototype.attach = function() {
      this.panel = atom.workspace.addModalPanel({
        item: this.element
      });
      this.miniEditor.focus();
      return this.miniEditor.getModel().scrollToCursorPosition();
    };

    Dialog.prototype.close = function() {
      var panelToDestroy;
      panelToDestroy = this.panel;
      this.panel = null;
      if (panelToDestroy != null) {
        panelToDestroy.destroy();
      }
      return atom.workspace.getActivePane().activate();
    };

    Dialog.prototype.cancel = function() {
      return this.close();
    };

    return Dialog;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmFsLXBsdXMvbGliL2RpYWxvZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGlDQUFBO0lBQUE7OztFQUFBLE1BQXlCLE9BQUEsQ0FBUSxzQkFBUixDQUF6QixFQUFDLG1DQUFELEVBQWlCOztFQUVqQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osTUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLEdBQUQ7QUFDUixVQUFBO01BRFUsd0JBQUQsTUFBVzthQUNwQixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxzQkFBUDtPQUFMLEVBQW9DLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNsQyxLQUFDLENBQUEsS0FBRCxDQUFPLE1BQVAsRUFBZTtZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sTUFBUDtZQUFlLE1BQUEsRUFBUSxZQUF2QjtXQUFmO1VBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBUyxZQUFULEVBQTJCLElBQUEsY0FBQSxDQUFlO1lBQUEsSUFBQSxFQUFNLElBQU47V0FBZixDQUEzQjtVQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sc0JBQVAsRUFBK0I7WUFBQSxLQUFBLEVBQU8sY0FBUDtXQUEvQjtpQkFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLDJCQUFQLEVBQW9DO1lBQUEsS0FBQSxFQUFPLGVBQVA7V0FBcEM7UUFKa0M7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBDO0lBRFE7O3FCQU9WLFVBQUEsR0FBWSxTQUFDLEdBQUQ7QUFDVixVQUFBOzJCQURXLE1BQXlDLElBQXhDLDRCQUFXLHdDQUFpQjtNQUN4QyxJQUFtQyxTQUFuQztRQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFxQixTQUFyQixFQUFBOztNQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsT0FBbkIsRUFDRTtRQUFBLGNBQUEsRUFBZ0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsU0FBRCxDQUFXLEtBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBLENBQVg7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEI7UUFDQSxhQUFBLEVBQWUsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRGY7T0FERjtNQUlBLElBQUEsQ0FBTyxRQUFQO1FBQ0UsSUFBQyxDQUFBLFVBQVUsQ0FBQyxFQUFaLENBQWUsTUFBZixFQUF1QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxLQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkIsRUFERjs7TUFHQSxJQUFHLGVBQUg7UUFDRSxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBQSxDQUFzQixDQUFDLE9BQXZCLENBQStCLGVBQS9CO2VBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQUEsQ0FBc0IsQ0FBQyxTQUF2QixDQUFBLEVBRkY7O0lBVFU7O3FCQWFaLE1BQUEsR0FBUSxTQUFBO01BQ04sSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7UUFBQSxJQUFBLEVBQU0sSUFBSSxDQUFDLE9BQVg7T0FBN0I7TUFDVCxJQUFDLENBQUEsVUFBVSxDQUFDLEtBQVosQ0FBQTthQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFBLENBQXNCLENBQUMsc0JBQXZCLENBQUE7SUFITTs7cUJBS1IsS0FBQSxHQUFPLFNBQUE7QUFDTCxVQUFBO01BQUEsY0FBQSxHQUFpQixJQUFDLENBQUE7TUFDbEIsSUFBQyxDQUFBLEtBQUQsR0FBUzs7UUFDVCxjQUFjLENBQUUsT0FBaEIsQ0FBQTs7YUFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQSxDQUE4QixDQUFDLFFBQS9CLENBQUE7SUFKSzs7cUJBTVAsTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsS0FBRCxDQUFBO0lBRE07Ozs7S0FoQ1c7QUFIckIiLCJzb3VyY2VzQ29udGVudCI6WyJ7VGV4dEVkaXRvclZpZXcsIFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIERpYWxvZyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6ICh7cHJvbXB0fSA9IHt9KSAtPlxuICAgIEBkaXYgY2xhc3M6ICd0ZXJtaW5hbC1wbHVzLWRpYWxvZycsID0+XG4gICAgICBAbGFiZWwgcHJvbXB0LCBjbGFzczogJ2ljb24nLCBvdXRsZXQ6ICdwcm9tcHRUZXh0J1xuICAgICAgQHN1YnZpZXcgJ21pbmlFZGl0b3InLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSlcbiAgICAgIEBsYWJlbCAnRXNjYXBlIChFc2MpIHRvIGV4aXQnLCBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgIEBsYWJlbCAnRW50ZXIgKFxcdTIxQjUpIHRvIGNvbmZpcm0nLCBzdHlsZTogJ2Zsb2F0OiByaWdodDsnXG5cbiAgaW5pdGlhbGl6ZTogKHtpY29uQ2xhc3MsIHBsYWNlaG9sZGVyVGV4dCwgc3RheU9wZW59ID0ge30pIC0+XG4gICAgQHByb21wdFRleHQuYWRkQ2xhc3MoaWNvbkNsYXNzKSBpZiBpY29uQ2xhc3NcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBAZWxlbWVudCxcbiAgICAgICdjb3JlOmNvbmZpcm0nOiA9PiBAb25Db25maXJtKEBtaW5pRWRpdG9yLmdldFRleHQoKSlcbiAgICAgICdjb3JlOmNhbmNlbCc6ID0+IEBjYW5jZWwoKVxuXG4gICAgdW5sZXNzIHN0YXlPcGVuXG4gICAgICBAbWluaUVkaXRvci5vbiAnYmx1cicsID0+IEBjbG9zZSgpXG5cbiAgICBpZiBwbGFjZWhvbGRlclRleHRcbiAgICAgIEBtaW5pRWRpdG9yLmdldE1vZGVsKCkuc2V0VGV4dCBwbGFjZWhvbGRlclRleHRcbiAgICAgIEBtaW5pRWRpdG9yLmdldE1vZGVsKCkuc2VsZWN0QWxsKClcblxuICBhdHRhY2g6IC0+XG4gICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzLmVsZW1lbnQpXG4gICAgQG1pbmlFZGl0b3IuZm9jdXMoKVxuICAgIEBtaW5pRWRpdG9yLmdldE1vZGVsKCkuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbigpXG5cbiAgY2xvc2U6IC0+XG4gICAgcGFuZWxUb0Rlc3Ryb3kgPSBAcGFuZWxcbiAgICBAcGFuZWwgPSBudWxsXG4gICAgcGFuZWxUb0Rlc3Ryb3k/LmRlc3Ryb3koKVxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5hY3RpdmF0ZSgpXG5cbiAgY2FuY2VsOiAtPlxuICAgIEBjbG9zZSgpXG4iXX0=
