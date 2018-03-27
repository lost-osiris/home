(function() {
  var Input, REGISTERS, RegisterManager,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Input = require('./input');

  REGISTERS = /(?:[a-zA-Z*+%_".])/;

  module.exports = RegisterManager = (function() {
    function RegisterManager(vimState) {
      var ref;
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement;
      this.data = this.vimState.globalState.get('register');
      this.subscriptionBySelection = new Map;
      this.clipboardBySelection = new Map;
      this.vimState.onDidDestroy(this.destroy);
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
      var ref, ref1;
      return (ref = (ref1 = this.get(name, selection)) != null ? ref1.text : void 0) != null ? ref : '';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3JlZ2lzdGVyLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpQ0FBQTtJQUFBOztFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7RUFFUixTQUFBLEdBQVk7O0VBaUJaLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyx5QkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEOztNQUNaLE1BQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxhQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsb0JBQUE7TUFDWCxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQXRCLENBQTBCLFVBQTFCO01BQ1IsSUFBQyxDQUFBLHVCQUFELEdBQTJCLElBQUk7TUFDL0IsSUFBQyxDQUFBLG9CQUFELEdBQXdCLElBQUk7TUFFNUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUF4QjtJQU5XOzs4QkFRYixLQUFBLEdBQU8sU0FBQTtNQUNMLElBQUMsQ0FBQSxJQUFELEdBQVE7YUFDUixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUF6QixDQUFnQyxlQUFoQyxFQUFpRCxLQUFqRDtJQUZLOzs4QkFJUCxPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsdUJBQXVCLENBQUMsT0FBekIsQ0FBaUMsU0FBQyxVQUFEO2VBQy9CLFVBQVUsQ0FBQyxPQUFYLENBQUE7TUFEK0IsQ0FBakM7TUFFQSxJQUFDLENBQUEsdUJBQXVCLENBQUMsS0FBekIsQ0FBQTtNQUNBLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxLQUF0QixDQUFBO2FBQ0EsTUFBb0QsRUFBcEQsRUFBQyxJQUFD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LE1BQUE7ZUFHRSxnQkFIRjs7SUFEVzs7Ozs7QUE5SWYiLCJzb3VyY2VzQ29udGVudCI6WyJJbnB1dCA9IHJlcXVpcmUgJy4vaW5wdXQnXG5cblJFR0lTVEVSUyA9IC8vLyAoXG4gID86IFthLXpBLVoqKyVfXCIuXVxuKSAvLy9cblxuIyBUT0RPOiBWaW0gc3VwcG9ydCBmb2xsb3dpbmcgcmVnaXN0ZXJzLlxuIyB4OiBjb21wbGV0ZSwgLTogcGFydGlhbGx5XG4jICBbeF0gMS4gVGhlIHVubmFtZWQgcmVnaXN0ZXIgXCJcIlxuIyAgWyBdIDIuIDEwIG51bWJlcmVkIHJlZ2lzdGVycyBcIjAgdG8gXCI5XG4jICBbIF0gMy4gVGhlIHNtYWxsIGRlbGV0ZSByZWdpc3RlciBcIi1cbiMgIFt4XSA0LiAyNiBuYW1lZCByZWdpc3RlcnMgXCJhIHRvIFwieiBvciBcIkEgdG8gXCJaXG4jICBbLV0gNS4gdGhyZWUgcmVhZC1vbmx5IHJlZ2lzdGVycyBcIjosIFwiLiwgXCIlXG4jICBbIF0gNi4gYWx0ZXJuYXRlIGJ1ZmZlciByZWdpc3RlciBcIiNcbiMgIFsgXSA3LiB0aGUgZXhwcmVzc2lvbiByZWdpc3RlciBcIj1cbiMgIFsgXSA4LiBUaGUgc2VsZWN0aW9uIGFuZCBkcm9wIHJlZ2lzdGVycyBcIiosIFwiKyBhbmQgXCJ+XG4jICBbeF0gOS4gVGhlIGJsYWNrIGhvbGUgcmVnaXN0ZXIgXCJfXG4jICBbIF0gMTAuIExhc3Qgc2VhcmNoIHBhdHRlcm4gcmVnaXN0ZXIgXCIvXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFJlZ2lzdGVyTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG4gICAgQGRhdGEgPSBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KCdyZWdpc3RlcicpXG4gICAgQHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uID0gbmV3IE1hcFxuICAgIEBjbGlwYm9hcmRCeVNlbGVjdGlvbiA9IG5ldyBNYXBcblxuICAgIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kpXG5cbiAgcmVzZXQ6IC0+XG4gICAgQG5hbWUgPSBudWxsXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnd2l0aC1yZWdpc3RlcicsIGZhbHNlKVxuXG4gIGRlc3Ryb3k6ID0+XG4gICAgQHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLmZvckVhY2ggKGRpc3Bvc2FibGUpIC0+XG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5jbGVhcigpXG4gICAgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLmNsZWFyKClcbiAgICB7QHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLCBAY2xpcGJvYXJkQnlTZWxlY3Rpb259ID0ge31cblxuICBpc1ZhbGlkTmFtZTogKG5hbWUpIC0+XG4gICAgUkVHSVNURVJTLnRlc3QobmFtZSlcblxuICBnZXRUZXh0OiAobmFtZSwgc2VsZWN0aW9uKSAtPlxuICAgIEBnZXQobmFtZSwgc2VsZWN0aW9uKT8udGV4dCA/ICcnXG5cbiAgcmVhZENsaXBib2FyZDogKHNlbGVjdGlvbj1udWxsKSAtPlxuICAgIGlmIHNlbGVjdGlvbj8uZWRpdG9yLmhhc011bHRpcGxlQ3Vyc29ycygpIGFuZCBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgIEBjbGlwYm9hcmRCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgIGVsc2VcbiAgICAgIGF0b20uY2xpcGJvYXJkLnJlYWQoKVxuXG4gIHdyaXRlQ2xpcGJvYXJkOiAoc2VsZWN0aW9uPW51bGwsIHRleHQpIC0+XG4gICAgaWYgc2VsZWN0aW9uPy5lZGl0b3IuaGFzTXVsdGlwbGVDdXJzb3JzKCkgYW5kIG5vdCBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgIGRpc3Bvc2FibGUgPSBzZWxlY3Rpb24ub25EaWREZXN0cm95ID0+XG4gICAgICAgIEBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5kZWxldGUoc2VsZWN0aW9uKVxuICAgICAgICBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uZGVsZXRlKHNlbGVjdGlvbilcbiAgICAgIEBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBkaXNwb3NhYmxlKVxuXG4gICAgaWYgKHNlbGVjdGlvbiBpcyBudWxsKSBvciBzZWxlY3Rpb24uaXNMYXN0U2VsZWN0aW9uKClcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHRleHQpXG4gICAgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIHRleHQpIGlmIHNlbGVjdGlvbj9cblxuICBnZXRSZWdpc3Rlck5hbWVUb1VzZTogKG5hbWUpIC0+XG4gICAgaWYgbmFtZT8gYW5kIG5vdCBAaXNWYWxpZE5hbWUobmFtZSlcbiAgICAgIHJldHVybiBudWxsXG5cbiAgICBuYW1lID89IEBuYW1lID8gJ1wiJ1xuICAgIGlmIG5hbWUgaXMgJ1wiJyBhbmQgQHZpbVN0YXRlLmdldENvbmZpZygndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInKVxuICAgICAgJyonXG4gICAgZWxzZVxuICAgICAgbmFtZVxuXG4gIGdldDogKG5hbWUsIHNlbGVjdGlvbikgLT5cbiAgICBuYW1lID0gQGdldFJlZ2lzdGVyTmFtZVRvVXNlKG5hbWUpXG4gICAgcmV0dXJuIHVubGVzcyBuYW1lP1xuXG4gICAgc3dpdGNoIG5hbWVcbiAgICAgIHdoZW4gJyonLCAnKycgdGhlbiB0ZXh0ID0gQHJlYWRDbGlwYm9hcmQoc2VsZWN0aW9uKVxuICAgICAgd2hlbiAnJScgdGhlbiB0ZXh0ID0gQGVkaXRvci5nZXRVUkkoKVxuICAgICAgd2hlbiAnXycgdGhlbiB0ZXh0ID0gJycgIyBCbGFja2hvbGUgYWx3YXlzIHJldHVybnMgbm90aGluZ1xuICAgICAgZWxzZVxuICAgICAgICB7dGV4dCwgdHlwZX0gPSBAZGF0YVtuYW1lLnRvTG93ZXJDYXNlKCldID8ge31cbiAgICB0eXBlID89IEBnZXRDb3B5VHlwZSh0ZXh0ID8gJycpXG4gICAge3RleHQsIHR5cGV9XG5cbiAgIyBQcml2YXRlOiBTZXRzIHRoZSB2YWx1ZSBvZiBhIGdpdmVuIHJlZ2lzdGVyLlxuICAjXG4gICMgbmFtZSAgLSBUaGUgbmFtZSBvZiB0aGUgcmVnaXN0ZXIgdG8gZmV0Y2guXG4gICMgdmFsdWUgLSBUaGUgdmFsdWUgdG8gc2V0IHRoZSByZWdpc3RlciB0bywgd2l0aCBmb2xsb3dpbmcgcHJvcGVydGllcy5cbiAgIyAgdGV4dDogdGV4dCB0byBzYXZlIHRvIHJlZ2lzdGVyLlxuICAjICB0eXBlOiAob3B0aW9uYWwpIGlmIG9tbWl0ZWQgYXV0b21hdGljYWxseSBzZXQgZnJvbSB0ZXh0LlxuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICBzZXQ6IChuYW1lLCB2YWx1ZSkgLT5cbiAgICBuYW1lID0gQGdldFJlZ2lzdGVyTmFtZVRvVXNlKG5hbWUpXG4gICAgcmV0dXJuIHVubGVzcyBuYW1lP1xuXG4gICAgdmFsdWUudHlwZSA/PSBAZ2V0Q29weVR5cGUodmFsdWUudGV4dClcblxuICAgIHNlbGVjdGlvbiA9IHZhbHVlLnNlbGVjdGlvblxuICAgIGRlbGV0ZSB2YWx1ZS5zZWxlY3Rpb25cblxuICAgIHN3aXRjaCBuYW1lXG4gICAgICB3aGVuICcqJywgJysnIHRoZW4gQHdyaXRlQ2xpcGJvYXJkKHNlbGVjdGlvbiwgdmFsdWUudGV4dClcbiAgICAgIHdoZW4gJ18nLCAnJScgdGhlbiBudWxsXG4gICAgICBlbHNlXG4gICAgICAgIGlmIC9eW0EtWl0kLy50ZXN0KG5hbWUpXG4gICAgICAgICAgbmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIGlmIEBkYXRhW25hbWVdP1xuICAgICAgICAgICAgQGFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZGF0YVtuYW1lXSA9IHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZGF0YVtuYW1lXSA9IHZhbHVlXG5cbiAgYXBwZW5kOiAobmFtZSwgdmFsdWUpIC0+XG4gICAgcmVnaXN0ZXIgPSBAZGF0YVtuYW1lXVxuICAgIGlmICdsaW5ld2lzZScgaW4gW3JlZ2lzdGVyLnR5cGUsIHZhbHVlLnR5cGVdXG4gICAgICBpZiByZWdpc3Rlci50eXBlIGlzbnQgJ2xpbmV3aXNlJ1xuICAgICAgICByZWdpc3Rlci50eXBlID0gJ2xpbmV3aXNlJ1xuICAgICAgICByZWdpc3Rlci50ZXh0ICs9ICdcXG4nXG4gICAgICBpZiB2YWx1ZS50eXBlIGlzbnQgJ2xpbmV3aXNlJ1xuICAgICAgICB2YWx1ZS50ZXh0ICs9ICdcXG4nXG4gICAgcmVnaXN0ZXIudGV4dCArPSB2YWx1ZS50ZXh0XG5cbiAgc2V0TmFtZTogKG5hbWUpIC0+XG4gICAgaWYgbmFtZT9cbiAgICAgIEBuYW1lID0gbmFtZVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnd2l0aC1yZWdpc3RlcicsIHRydWUpXG4gICAgICBAdmltU3RhdGUuaG92ZXIuc2V0KCdcIicgKyBAbmFtZSlcbiAgICBlbHNlXG4gICAgICBpbnB1dFVJID0gbmV3IElucHV0KEB2aW1TdGF0ZSlcbiAgICAgIGlucHV0VUkub25EaWRDb25maXJtIChuYW1lKSA9PlxuICAgICAgICBpZiBAaXNWYWxpZE5hbWUobmFtZSlcbiAgICAgICAgICBAc2V0TmFtZShuYW1lKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHZpbVN0YXRlLmhvdmVyLnJlc2V0KClcbiAgICAgIGlucHV0VUkub25EaWRDYW5jZWwgPT4gQHZpbVN0YXRlLmhvdmVyLnJlc2V0KClcbiAgICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoJ1wiJylcbiAgICAgIGlucHV0VUkuZm9jdXMoMSlcblxuICBnZXRDb3B5VHlwZTogKHRleHQpIC0+XG4gICAgaWYgdGV4dC5lbmRzV2l0aChcIlxcblwiKSBvciB0ZXh0LmVuZHNXaXRoKFwiXFxyXCIpXG4gICAgICAnbGluZXdpc2UnXG4gICAgZWxzZVxuICAgICAgJ2NoYXJhY3Rlcndpc2UnXG4iXX0=
