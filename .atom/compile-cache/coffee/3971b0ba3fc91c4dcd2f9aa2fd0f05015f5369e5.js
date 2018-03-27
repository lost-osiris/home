(function() {
  var CompositeDisposable, Input, REGISTERS, RegisterManager;

  CompositeDisposable = require('atom').CompositeDisposable;

  Input = require('./input');

  REGISTERS = /(?:[a-zA-Z*+%_".])/;

  module.exports = RegisterManager = (function() {
    function RegisterManager(vimState) {
      var ref;
      this.vimState = vimState;
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement, this.globalState = ref.globalState;
      this.data = this.globalState.get('register');
      this.subscriptionBySelection = new Map;
      this.clipboardBySelection = new Map;
    }

    RegisterManager.prototype.reset = function() {
      this.name = null;
      return this.editorElement.classList.toggle('with-register', false);
    };

    RegisterManager.prototype.destroy = function() {
      var ref;
      this.subscriptionBySelection.forEach(function(disposable) {
        return disposable.dispose();
      });
      this.subscriptionBySelection.clear();
      this.clipboardBySelection.clear();
      return ref = {}, this.subscriptionBySelection = ref.subscriptionBySelection, this.clipboardBySelection = ref.clipboardBySelection, ref;
    };

    RegisterManager.prototype.isValidName = function(name) {
      return REGISTERS.test(name);
    };

    RegisterManager.prototype.getText = function(name, selection) {
      var ref;
      return (ref = this.get(name, selection).text) != null ? ref : '';
    };

    RegisterManager.prototype.readClipboard = function(selection) {
      if (selection == null) {
        selection = null;
      }
      if ((selection != null ? selection.editor.hasMultipleCursors() : void 0) && this.clipboardBySelection.has(selection)) {
        return this.clipboardBySelection.get(selection);
      } else {
        return atom.clipboard.read();
      }
    };

    RegisterManager.prototype.writeClipboard = function(selection, text) {
      var disposable;
      if (selection == null) {
        selection = null;
      }
      if ((selection != null ? selection.editor.hasMultipleCursors() : void 0) && !this.clipboardBySelection.has(selection)) {
        disposable = selection.onDidDestroy((function(_this) {
          return function() {
            _this.subscriptionBySelection["delete"](selection);
            return _this.clipboardBySelection["delete"](selection);
          };
        })(this));
        this.subscriptionBySelection.set(selection, disposable);
      }
      if ((selection === null) || selection.isLastSelection()) {
        atom.clipboard.write(text);
      }
      if (selection != null) {
        return this.clipboardBySelection.set(selection, text);
      }
    };

    RegisterManager.prototype.getRegisterNameToUse = function(name) {
      var ref;
      if ((name != null) && !this.isValidName(name)) {
        return null;
      }
      if (name == null) {
        name = (ref = this.name) != null ? ref : '"';
      }
      if (name === '"' && this.vimState.getConfig('useClipboardAsDefaultRegister')) {
        return '*';
      } else {
        return name;
      }
    };

    RegisterManager.prototype.get = function(name, selection) {
      var ref, ref1, text, type;
      name = this.getRegisterNameToUse(name);
      if (name == null) {
        return;
      }
      switch (name) {
        case '*':
        case '+':
          text = this.readClipboard(selection);
          break;
        case '%':
          text = this.editor.getURI();
          break;
        case '_':
          text = '';
          break;
        default:
          ref1 = (ref = this.data[name.toLowerCase()]) != null ? ref : {}, text = ref1.text, type = ref1.type;
      }
      if (type == null) {
        type = this.getCopyType(text != null ? text : '');
      }
      return {
        text: text,
        type: type
      };
    };

    RegisterManager.prototype.set = function(name, value) {
      var selection;
      name = this.getRegisterNameToUse(name);
      if (name == null) {
        return;
      }
      if (value.type == null) {
        value.type = this.getCopyType(value.text);
      }
      selection = value.selection;
      delete value.selection;
      switch (name) {
        case '*':
        case '+':
          return this.writeClipboard(selection, value.text);
        case '_':
        case '%':
          return null;
        default:
          if (/^[A-Z]$/.test(name)) {
            name = name.toLowerCase();
            if (this.data[name] != null) {
              return this.append(name, value);
            } else {
              return this.data[name] = value;
            }
          } else {
            return this.data[name] = value;
          }
      }
    };

    RegisterManager.prototype.append = function(name, value) {
      var register;
      register = this.data[name];
      if ('linewise' === register.type || 'linewise' === value.type) {
        if (register.type !== 'linewise') {
          register.type = 'linewise';
          register.text += '\n';
        }
        if (value.type !== 'linewise') {
          value.text += '\n';
        }
      }
      return register.text += value.text;
    };

    RegisterManager.prototype.setName = function(name) {
      var inputUI;
      if (name != null) {
        this.name = name;
        this.editorElement.classList.toggle('with-register', true);
        return this.vimState.hover.set('"' + this.name);
      } else {
        inputUI = new Input(this.vimState);
        inputUI.onDidConfirm((function(_this) {
          return function(name) {
            if (_this.isValidName(name)) {
              return _this.setName(name);
            } else {
              return _this.vimState.hover.reset();
            }
          };
        })(this));
        inputUI.onDidCancel((function(_this) {
          return function() {
            return _this.vimState.hover.reset();
          };
        })(this));
        this.vimState.hover.set('"');
        return inputUI.focus(1);
      }
    };

    RegisterManager.prototype.getCopyType = function(text) {
      if (text.endsWith("\n") || text.endsWith("\r")) {
        return 'linewise';
      } else {
        return 'characterwise';
      }
    };

    return RegisterManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3JlZ2lzdGVyLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7RUFFUixTQUFBLEdBQVk7O0VBaUJaLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyx5QkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osTUFBMEMsSUFBQyxDQUFBLFFBQTNDLEVBQUMsSUFBQyxDQUFBLGFBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxvQkFBQSxhQUFYLEVBQTBCLElBQUMsQ0FBQSxrQkFBQTtNQUMzQixJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixVQUFqQjtNQUNSLElBQUMsQ0FBQSx1QkFBRCxHQUEyQixJQUFJO01BQy9CLElBQUMsQ0FBQSxvQkFBRCxHQUF3QixJQUFJO0lBSmpCOzs4QkFNYixLQUFBLEdBQU8sU0FBQTtNQUNMLElBQUMsQ0FBQSxJQUFELEdBQVE7YUFDUixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUF6QixDQUFnQyxlQUFoQyxFQUFpRCxLQUFqRDtJQUZLOzs4QkFJUCxPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsdUJBQXVCLENBQUMsT0FBekIsQ0FBaUMsU0FBQyxVQUFEO2VBQy9CLFVBQVUsQ0FBQyxPQUFYLENBQUE7TUFEK0IsQ0FBakM7TUFFQSxJQUFDLENBQUEsdUJBQXVCLENBQUMsS0FBekIsQ0FBQTtNQUNBLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxLQUF0QixDQUFBO2FBQ0EsTUFBb0QsRUFBcEQsRUFBQyxJQUFDLENBQUEsOEJBQUEsdUJBQUYs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SUFEVzs7Ozs7QUE3SWYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuSW5wdXQgPSByZXF1aXJlICcuL2lucHV0J1xuXG5SRUdJU1RFUlMgPSAvLy8gKFxuICA/OiBbYS16QS1aKislX1wiLl1cbikgLy8vXG5cbiMgVE9ETzogVmltIHN1cHBvcnQgZm9sbG93aW5nIHJlZ2lzdGVycy5cbiMgeDogY29tcGxldGUsIC06IHBhcnRpYWxseVxuIyAgW3hdIDEuIFRoZSB1bm5hbWVkIHJlZ2lzdGVyIFwiXCJcbiMgIFsgXSAyLiAxMCBudW1iZXJlZCByZWdpc3RlcnMgXCIwIHRvIFwiOVxuIyAgWyBdIDMuIFRoZSBzbWFsbCBkZWxldGUgcmVnaXN0ZXIgXCItXG4jICBbeF0gNC4gMjYgbmFtZWQgcmVnaXN0ZXJzIFwiYSB0byBcInogb3IgXCJBIHRvIFwiWlxuIyAgWy1dIDUuIHRocmVlIHJlYWQtb25seSByZWdpc3RlcnMgXCI6LCBcIi4sIFwiJVxuIyAgWyBdIDYuIGFsdGVybmF0ZSBidWZmZXIgcmVnaXN0ZXIgXCIjXG4jICBbIF0gNy4gdGhlIGV4cHJlc3Npb24gcmVnaXN0ZXIgXCI9XG4jICBbIF0gOC4gVGhlIHNlbGVjdGlvbiBhbmQgZHJvcCByZWdpc3RlcnMgXCIqLCBcIisgYW5kIFwiflxuIyAgW3hdIDkuIFRoZSBibGFjayBob2xlIHJlZ2lzdGVyIFwiX1xuIyAgWyBdIDEwLiBMYXN0IHNlYXJjaCBwYXR0ZXJuIHJlZ2lzdGVyIFwiL1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBSZWdpc3Rlck1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAZ2xvYmFsU3RhdGV9ID0gQHZpbVN0YXRlXG4gICAgQGRhdGEgPSBAZ2xvYmFsU3RhdGUuZ2V0KCdyZWdpc3RlcicpXG4gICAgQHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uID0gbmV3IE1hcFxuICAgIEBjbGlwYm9hcmRCeVNlbGVjdGlvbiA9IG5ldyBNYXBcblxuICByZXNldDogLT5cbiAgICBAbmFtZSA9IG51bGxcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCd3aXRoLXJlZ2lzdGVyJywgZmFsc2UpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uZm9yRWFjaCAoZGlzcG9zYWJsZSkgLT5cbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLmNsZWFyKClcbiAgICBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uY2xlYXIoKVxuICAgIHtAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24sIEBjbGlwYm9hcmRCeVNlbGVjdGlvbn0gPSB7fVxuXG4gIGlzVmFsaWROYW1lOiAobmFtZSkgLT5cbiAgICBSRUdJU1RFUlMudGVzdChuYW1lKVxuXG4gIGdldFRleHQ6IChuYW1lLCBzZWxlY3Rpb24pIC0+XG4gICAgQGdldChuYW1lLCBzZWxlY3Rpb24pLnRleHQgPyAnJ1xuXG4gIHJlYWRDbGlwYm9hcmQ6IChzZWxlY3Rpb249bnVsbCkgLT5cbiAgICBpZiBzZWxlY3Rpb24/LmVkaXRvci5oYXNNdWx0aXBsZUN1cnNvcnMoKSBhbmQgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pXG4gICAgICBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICBlbHNlXG4gICAgICBhdG9tLmNsaXBib2FyZC5yZWFkKClcblxuICB3cml0ZUNsaXBib2FyZDogKHNlbGVjdGlvbj1udWxsLCB0ZXh0KSAtPlxuICAgIGlmIHNlbGVjdGlvbj8uZWRpdG9yLmhhc011bHRpcGxlQ3Vyc29ycygpIGFuZCBub3QgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pXG4gICAgICBkaXNwb3NhYmxlID0gc2VsZWN0aW9uLm9uRGlkRGVzdHJveSA9PlxuICAgICAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uZGVsZXRlKHNlbGVjdGlvbilcbiAgICAgICAgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLmRlbGV0ZShzZWxlY3Rpb24pXG4gICAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgZGlzcG9zYWJsZSlcblxuICAgIGlmIChzZWxlY3Rpb24gaXMgbnVsbCkgb3Igc2VsZWN0aW9uLmlzTGFzdFNlbGVjdGlvbigpXG4gICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSh0ZXh0KVxuICAgIEBjbGlwYm9hcmRCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCB0ZXh0KSBpZiBzZWxlY3Rpb24/XG5cbiAgZ2V0UmVnaXN0ZXJOYW1lVG9Vc2U6IChuYW1lKSAtPlxuICAgIGlmIG5hbWU/IGFuZCBub3QgQGlzVmFsaWROYW1lKG5hbWUpXG4gICAgICByZXR1cm4gbnVsbFxuXG4gICAgbmFtZSA/PSBAbmFtZSA/ICdcIidcbiAgICBpZiBuYW1lIGlzICdcIicgYW5kIEB2aW1TdGF0ZS5nZXRDb25maWcoJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJylcbiAgICAgICcqJ1xuICAgIGVsc2VcbiAgICAgIG5hbWVcblxuICBnZXQ6IChuYW1lLCBzZWxlY3Rpb24pIC0+XG4gICAgbmFtZSA9IEBnZXRSZWdpc3Rlck5hbWVUb1VzZShuYW1lKVxuICAgIHJldHVybiB1bmxlc3MgbmFtZT9cblxuICAgIHN3aXRjaCBuYW1lXG4gICAgICB3aGVuICcqJywgJysnIHRoZW4gdGV4dCA9IEByZWFkQ2xpcGJvYXJkKHNlbGVjdGlvbilcbiAgICAgIHdoZW4gJyUnIHRoZW4gdGV4dCA9IEBlZGl0b3IuZ2V0VVJJKClcbiAgICAgIHdoZW4gJ18nIHRoZW4gdGV4dCA9ICcnICMgQmxhY2tob2xlIGFsd2F5cyByZXR1cm5zIG5vdGhpbmdcbiAgICAgIGVsc2VcbiAgICAgICAge3RleHQsIHR5cGV9ID0gQGRhdGFbbmFtZS50b0xvd2VyQ2FzZSgpXSA/IHt9XG4gICAgdHlwZSA/PSBAZ2V0Q29weVR5cGUodGV4dCA/ICcnKVxuICAgIHt0ZXh0LCB0eXBlfVxuXG4gICMgUHJpdmF0ZTogU2V0cyB0aGUgdmFsdWUgb2YgYSBnaXZlbiByZWdpc3Rlci5cbiAgI1xuICAjIG5hbWUgIC0gVGhlIG5hbWUgb2YgdGhlIHJlZ2lzdGVyIHRvIGZldGNoLlxuICAjIHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNldCB0aGUgcmVnaXN0ZXIgdG8sIHdpdGggZm9sbG93aW5nIHByb3BlcnRpZXMuXG4gICMgIHRleHQ6IHRleHQgdG8gc2F2ZSB0byByZWdpc3Rlci5cbiAgIyAgdHlwZTogKG9wdGlvbmFsKSBpZiBvbW1pdGVkIGF1dG9tYXRpY2FsbHkgc2V0IGZyb20gdGV4dC5cbiAgI1xuICAjIFJldHVybnMgbm90aGluZy5cbiAgc2V0OiAobmFtZSwgdmFsdWUpIC0+XG4gICAgbmFtZSA9IEBnZXRSZWdpc3Rlck5hbWVUb1VzZShuYW1lKVxuICAgIHJldHVybiB1bmxlc3MgbmFtZT9cblxuICAgIHZhbHVlLnR5cGUgPz0gQGdldENvcHlUeXBlKHZhbHVlLnRleHQpXG5cbiAgICBzZWxlY3Rpb24gPSB2YWx1ZS5zZWxlY3Rpb25cbiAgICBkZWxldGUgdmFsdWUuc2VsZWN0aW9uXG5cbiAgICBzd2l0Y2ggbmFtZVxuICAgICAgd2hlbiAnKicsICcrJyB0aGVuIEB3cml0ZUNsaXBib2FyZChzZWxlY3Rpb24sIHZhbHVlLnRleHQpXG4gICAgICB3aGVuICdfJywgJyUnIHRoZW4gbnVsbFxuICAgICAgZWxzZVxuICAgICAgICBpZiAvXltBLVpdJC8udGVzdChuYW1lKVxuICAgICAgICAgIG5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBpZiBAZGF0YVtuYW1lXT9cbiAgICAgICAgICAgIEBhcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGRhdGFbbmFtZV0gPSB2YWx1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGRhdGFbbmFtZV0gPSB2YWx1ZVxuXG4gIGFwcGVuZDogKG5hbWUsIHZhbHVlKSAtPlxuICAgIHJlZ2lzdGVyID0gQGRhdGFbbmFtZV1cbiAgICBpZiAnbGluZXdpc2UnIGluIFtyZWdpc3Rlci50eXBlLCB2YWx1ZS50eXBlXVxuICAgICAgaWYgcmVnaXN0ZXIudHlwZSBpc250ICdsaW5ld2lzZSdcbiAgICAgICAgcmVnaXN0ZXIudHlwZSA9ICdsaW5ld2lzZSdcbiAgICAgICAgcmVnaXN0ZXIudGV4dCArPSAnXFxuJ1xuICAgICAgaWYgdmFsdWUudHlwZSBpc250ICdsaW5ld2lzZSdcbiAgICAgICAgdmFsdWUudGV4dCArPSAnXFxuJ1xuICAgIHJlZ2lzdGVyLnRleHQgKz0gdmFsdWUudGV4dFxuXG4gIHNldE5hbWU6IChuYW1lKSAtPlxuICAgIGlmIG5hbWU/XG4gICAgICBAbmFtZSA9IG5hbWVcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ3dpdGgtcmVnaXN0ZXInLCB0cnVlKVxuICAgICAgQHZpbVN0YXRlLmhvdmVyLnNldCgnXCInICsgQG5hbWUpXG4gICAgZWxzZVxuICAgICAgaW5wdXRVSSA9IG5ldyBJbnB1dChAdmltU3RhdGUpXG4gICAgICBpbnB1dFVJLm9uRGlkQ29uZmlybSAobmFtZSkgPT5cbiAgICAgICAgaWYgQGlzVmFsaWROYW1lKG5hbWUpXG4gICAgICAgICAgQHNldE5hbWUobmFtZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEB2aW1TdGF0ZS5ob3Zlci5yZXNldCgpXG4gICAgICBpbnB1dFVJLm9uRGlkQ2FuY2VsID0+IEB2aW1TdGF0ZS5ob3Zlci5yZXNldCgpXG4gICAgICBAdmltU3RhdGUuaG92ZXIuc2V0KCdcIicpXG4gICAgICBpbnB1dFVJLmZvY3VzKDEpXG5cbiAgZ2V0Q29weVR5cGU6ICh0ZXh0KSAtPlxuICAgIGlmIHRleHQuZW5kc1dpdGgoXCJcXG5cIikgb3IgdGV4dC5lbmRzV2l0aChcIlxcclwiKVxuICAgICAgJ2xpbmV3aXNlJ1xuICAgIGVsc2VcbiAgICAgICdjaGFyYWN0ZXJ3aXNlJ1xuIl19
