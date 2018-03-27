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
        "class": 'platformio-ide-terminal-dialog'
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
            style: 'width: 50%;'
          });
          return _this.label('Enter (\u21B5) to confirm', {
            style: 'width: 50%; text-align: right;'
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi9kaWFsb2cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpQ0FBQTtJQUFBOzs7RUFBQSxNQUF5QixPQUFBLENBQVEsc0JBQVIsQ0FBekIsRUFBQyxtQ0FBRCxFQUFpQjs7RUFFakIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUNKLE1BQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxHQUFEO0FBQ1IsVUFBQTtNQURVLHdCQUFELE1BQVc7YUFDcEIsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sZ0NBQVA7T0FBTCxFQUE4QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDNUMsS0FBQyxDQUFBLEtBQUQsQ0FBTyxNQUFQLEVBQWU7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE1BQVA7WUFBZSxNQUFBLEVBQVEsWUFBdkI7V0FBZjtVQUNBLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUEyQixJQUFBLGNBQUEsQ0FBZTtZQUFBLElBQUEsRUFBTSxJQUFOO1dBQWYsQ0FBM0I7VUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLHNCQUFQLEVBQStCO1lBQUEsS0FBQSxFQUFPLGFBQVA7V0FBL0I7aUJBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTywyQkFBUCxFQUFvQztZQUFBLEtBQUEsRUFBTyxnQ0FBUDtXQUFwQztRQUo0QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUM7SUFEUTs7cUJBT1YsVUFBQSxHQUFZLFNBQUMsR0FBRDtBQUNWLFVBQUE7MkJBRFcsTUFBeUMsSUFBeEMsNEJBQVcsd0NBQWlCO01BQ3hDLElBQW1DLFNBQW5DO1FBQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQXFCLFNBQXJCLEVBQUE7O01BQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxPQUFuQixFQUNFO1FBQUEsY0FBQSxFQUFnQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxTQUFELENBQVcsS0FBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQUEsQ0FBWDtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQjtRQUNBLGFBQUEsRUFBZSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEZjtPQURGO01BSUEsSUFBQSxDQUFPLFFBQVA7UUFDRSxJQUFDLENBQUEsVUFBVSxDQUFDLEVBQVosQ0FBZSxNQUFmLEVBQXVCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLEtBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QixFQURGOztNQUdBLElBQUcsZUFBSDtRQUNFLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFBLENBQXNCLENBQUMsT0FBdkIsQ0FBK0IsZUFBL0I7ZUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBQSxDQUFzQixDQUFDLFNBQXZCLENBQUEsRUFGRjs7SUFUVTs7cUJBYVosTUFBQSxHQUFRLFNBQUE7TUFDTixJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtRQUFBLElBQUEsRUFBTSxJQUFJLENBQUMsT0FBWDtPQUE3QjtNQUNULElBQUMsQ0FBQSxVQUFVLENBQUMsS0FBWixDQUFBO2FBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQUEsQ0FBc0IsQ0FBQyxzQkFBdkIsQ0FBQTtJQUhNOztxQkFLUixLQUFBLEdBQU8sU0FBQTtBQUNMLFVBQUE7TUFBQSxjQUFBLEdBQWlCLElBQUMsQ0FBQTtNQUNsQixJQUFDLENBQUEsS0FBRCxHQUFTOztRQUNULGNBQWMsQ0FBRSxPQUFoQixDQUFBOzthQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBQThCLENBQUMsUUFBL0IsQ0FBQTtJQUpLOztxQkFNUCxNQUFBLEdBQVEsU0FBQTthQUNOLElBQUMsQ0FBQSxLQUFELENBQUE7SUFETTs7OztLQWhDVztBQUhyQiIsInNvdXJjZXNDb250ZW50IjpbIntUZXh0RWRpdG9yVmlldywgVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRGlhbG9nIGV4dGVuZHMgVmlld1xuICBAY29udGVudDogKHtwcm9tcHR9ID0ge30pIC0+XG4gICAgQGRpdiBjbGFzczogJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLWRpYWxvZycsID0+XG4gICAgICBAbGFiZWwgcHJvbXB0LCBjbGFzczogJ2ljb24nLCBvdXRsZXQ6ICdwcm9tcHRUZXh0J1xuICAgICAgQHN1YnZpZXcgJ21pbmlFZGl0b3InLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSlcbiAgICAgIEBsYWJlbCAnRXNjYXBlIChFc2MpIHRvIGV4aXQnLCBzdHlsZTogJ3dpZHRoOiA1MCU7J1xuICAgICAgQGxhYmVsICdFbnRlciAoXFx1MjFCNSkgdG8gY29uZmlybScsIHN0eWxlOiAnd2lkdGg6IDUwJTsgdGV4dC1hbGlnbjogcmlnaHQ7J1xuXG4gIGluaXRpYWxpemU6ICh7aWNvbkNsYXNzLCBwbGFjZWhvbGRlclRleHQsIHN0YXlPcGVufSA9IHt9KSAtPlxuICAgIEBwcm9tcHRUZXh0LmFkZENsYXNzKGljb25DbGFzcykgaWYgaWNvbkNsYXNzXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgQGVsZW1lbnQsXG4gICAgICAnY29yZTpjb25maXJtJzogPT4gQG9uQ29uZmlybShAbWluaUVkaXRvci5nZXRUZXh0KCkpXG4gICAgICAnY29yZTpjYW5jZWwnOiA9PiBAY2FuY2VsKClcblxuICAgIHVubGVzcyBzdGF5T3BlblxuICAgICAgQG1pbmlFZGl0b3Iub24gJ2JsdXInLCA9PiBAY2xvc2UoKVxuXG4gICAgaWYgcGxhY2Vob2xkZXJUZXh0XG4gICAgICBAbWluaUVkaXRvci5nZXRNb2RlbCgpLnNldFRleHQgcGxhY2Vob2xkZXJUZXh0XG4gICAgICBAbWluaUVkaXRvci5nZXRNb2RlbCgpLnNlbGVjdEFsbCgpXG5cbiAgYXR0YWNoOiAtPlxuICAgIEBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcy5lbGVtZW50KVxuICAgIEBtaW5pRWRpdG9yLmZvY3VzKClcbiAgICBAbWluaUVkaXRvci5nZXRNb2RlbCgpLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oKVxuXG4gIGNsb3NlOiAtPlxuICAgIHBhbmVsVG9EZXN0cm95ID0gQHBhbmVsXG4gICAgQHBhbmVsID0gbnVsbFxuICAgIHBhbmVsVG9EZXN0cm95Py5kZXN0cm95KClcbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuYWN0aXZhdGUoKVxuXG4gIGNhbmNlbDogLT5cbiAgICBAY2xvc2UoKVxuIl19
