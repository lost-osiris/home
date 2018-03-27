(function() {
  var CompositeDisposable, Input, REGISTERS, RegisterManager,
    slice = [].slice;

  CompositeDisposable = require('atom').CompositeDisposable;

  Input = require('./input');

  REGISTERS = /(?:[a-zA-Z*+%_".])/;

  RegisterManager = (function() {
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
      return this.vimState.toggleClassList('with-register', this.hasName());
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

    RegisterManager.prototype.get = function(name, selection) {
      var ref, ref1, text, type;
      if (name == null) {
        name = this.getName();
      }
      if (name === '"') {
        name = this.vimState.getConfig('defaultRegister');
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

    RegisterManager.prototype.set = function() {
      var args, name, ref, selection, value;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      ref = [], name = ref[0], value = ref[1];
      switch (args.length) {
        case 1:
          value = args[0];
          break;
        case 2:
          name = args[0], value = args[1];
      }
      if (name == null) {
        name = this.getName();
      }
      if (!this.isValidName(name)) {
        return;
      }
      if (name === '"') {
        name = this.vimState.getConfig('defaultRegister');
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
            return this.append(name.toLowerCase(), value);
          } else {
            return this.data[name] = value;
          }
      }
    };

    RegisterManager.prototype.append = function(name, value) {
      var register;
      if (!(register = this.data[name])) {
        this.data[name] = value;
        return;
      }
      if ('linewise' === register.type || 'linewise' === value.type) {
        if (register.type !== 'linewise') {
          register.text += '\n';
          register.type = 'linewise';
        }
        if (value.type !== 'linewise') {
          value.text += '\n';
        }
      }
      return register.text += value.text;
    };

    RegisterManager.prototype.getName = function() {
      var ref;
      return (ref = this.name) != null ? ref : this.vimState.getConfig('defaultRegister');
    };

    RegisterManager.prototype.isDefaultName = function() {
      return this.getName() === this.vimState.getConfig('defaultRegister');
    };

    RegisterManager.prototype.hasName = function() {
      return this.name != null;
    };

    RegisterManager.prototype.setName = function(name) {
      var inputUI;
      if (name == null) {
        name = null;
      }
      if (name != null) {
        if (this.isValidName(name)) {
          return this.name = name;
        }
      } else {
        this.vimState.hover.set('"');
        inputUI = new Input(this.vimState);
        inputUI.onDidConfirm((function(_this) {
          return function(name1) {
            _this.name = name1;
            _this.vimState.toggleClassList('with-register', true);
            return _this.vimState.hover.set('"' + _this.name);
          };
        })(this));
        inputUI.onDidCancel((function(_this) {
          return function() {
            return _this.vimState.hover.reset();
          };
        })(this));
        return inputUI.focus(1);
      }
    };

    RegisterManager.prototype.getCopyType = function(text) {
      if (text.lastIndexOf("\n") === text.length - 1) {
        return 'linewise';
      } else if (text.lastIndexOf("\r") === text.length - 1) {
        return 'linewise';
      } else {
        return 'characterwise';
      }
    };

    return RegisterManager;

  })();

  module.exports = RegisterManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3JlZ2lzdGVyLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxzREFBQTtJQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztFQUVSLFNBQUEsR0FBWTs7RUFpQk47SUFDUyx5QkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osTUFBMEMsSUFBQyxDQUFBLFFBQTNDLEVBQUMsSUFBQyxDQUFBLGFBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxvQkFBQSxhQUFYLEVBQTBCLElBQUMsQ0FBQSxrQkFBQTtNQUMzQixJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixVQUFqQjtNQUNSLElBQUMsQ0FBQSx1QkFBRCxHQUEyQixJQUFJO01BQy9CLElBQUMsQ0FBQSxvQkFBRCxHQUF3QixJQUFJO0lBSmpCOzs4QkFNYixLQUFBLEdBQU8sU0FBQTtNQUNMLElBQUMsQ0FBQSxJQUFELEdBQVE7YUFDUixJQUFDLENBQUEsUUFBUSxDQUFDLGVBQVYsQ0FBMEIsZUFBMUIsRUFBMkMsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUEzQztJQUZLOzs4QkFJUCxPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsdUJBQXVCLENBQUMsT0FBekIsQ0FBaUMsU0FBQyxVQUFEO2VBQy9CLFVBQVUsQ0FBQyxPQUFYLENBQUE7TUFEK0IsQ0FBakM7TUFFQSxJQUFDLENBQUEsdUJBQXVCLENBQUMsS0FBekIsQ0FBQTtNQUNBLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxLQUF0QixDQUFBO2FBQ0EsTUFBb0QsRUFBcEQsRUFBQyxJQUFDLENBQUEsOEJBQUEsdUJBQUYs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LENBQWMsQ0FBZCxFQVhGOztJQURPOzs4QkFjVCxXQUFBLEdBQWEsU0FBQyxJQUFEO01BQ1gsSUFBRyxJQUFJLENBQUMsV0FBTCxDQUFpQixJQUFqQixDQUFBLEtBQTBCLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBM0M7ZUFDRSxXQURGO09BQUEsTUFFSyxJQUFHLElBQUksQ0FBQyxXQUFMLENBQWlCLElBQWpCLENBQUEsS0FBMEIsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUEzQztlQUNILFdBREc7T0FBQSxNQUFBO2VBR0gsZ0JBSEc7O0lBSE07Ozs7OztFQVFmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBdEpqQiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5JbnB1dCA9IHJlcXVpcmUgJy4vaW5wdXQnXG5cblJFR0lTVEVSUyA9IC8vLyAoXG4gID86IFthLXpBLVoqKyVfXCIuXVxuKSAvLy9cblxuIyBUT0RPOiBWaW0gc3VwcG9ydCBmb2xsb3dpbmcgcmVnaXN0ZXJzLlxuIyB4OiBjb21wbGV0ZSwgLTogcGFydGlhbGx5XG4jICBbeF0gMS4gVGhlIHVubmFtZWQgcmVnaXN0ZXIgXCJcIlxuIyAgWyBdIDIuIDEwIG51bWJlcmVkIHJlZ2lzdGVycyBcIjAgdG8gXCI5XG4jICBbIF0gMy4gVGhlIHNtYWxsIGRlbGV0ZSByZWdpc3RlciBcIi1cbiMgIFt4XSA0LiAyNiBuYW1lZCByZWdpc3RlcnMgXCJhIHRvIFwieiBvciBcIkEgdG8gXCJaXG4jICBbLV0gNS4gdGhyZWUgcmVhZC1vbmx5IHJlZ2lzdGVycyBcIjosIFwiLiwgXCIlXG4jICBbIF0gNi4gYWx0ZXJuYXRlIGJ1ZmZlciByZWdpc3RlciBcIiNcbiMgIFsgXSA3LiB0aGUgZXhwcmVzc2lvbiByZWdpc3RlciBcIj1cbiMgIFsgXSA4LiBUaGUgc2VsZWN0aW9uIGFuZCBkcm9wIHJlZ2lzdGVycyBcIiosIFwiKyBhbmQgXCJ+XG4jICBbeF0gOS4gVGhlIGJsYWNrIGhvbGUgcmVnaXN0ZXIgXCJfXG4jICBbIF0gMTAuIExhc3Qgc2VhcmNoIHBhdHRlcm4gcmVnaXN0ZXIgXCIvXG5cbmNsYXNzIFJlZ2lzdGVyTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBnbG9iYWxTdGF0ZX0gPSBAdmltU3RhdGVcbiAgICBAZGF0YSA9IEBnbG9iYWxTdGF0ZS5nZXQoJ3JlZ2lzdGVyJylcbiAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24gPSBuZXcgTWFwXG4gICAgQGNsaXBib2FyZEJ5U2VsZWN0aW9uID0gbmV3IE1hcFxuXG4gIHJlc2V0OiAtPlxuICAgIEBuYW1lID0gbnVsbFxuICAgIEB2aW1TdGF0ZS50b2dnbGVDbGFzc0xpc3QoJ3dpdGgtcmVnaXN0ZXInLCBAaGFzTmFtZSgpKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLmZvckVhY2ggKGRpc3Bvc2FibGUpIC0+XG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5jbGVhcigpXG4gICAgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLmNsZWFyKClcbiAgICB7QHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLCBAY2xpcGJvYXJkQnlTZWxlY3Rpb259ID0ge31cblxuICBpc1ZhbGlkTmFtZTogKG5hbWUpIC0+XG4gICAgUkVHSVNURVJTLnRlc3QobmFtZSlcblxuICBnZXRUZXh0OiAobmFtZSwgc2VsZWN0aW9uKSAtPlxuICAgIEBnZXQobmFtZSwgc2VsZWN0aW9uKS50ZXh0ID8gJydcblxuICByZWFkQ2xpcGJvYXJkOiAoc2VsZWN0aW9uPW51bGwpIC0+XG4gICAgaWYgc2VsZWN0aW9uPy5lZGl0b3IuaGFzTXVsdGlwbGVDdXJzb3JzKCkgYW5kIEBjbGlwYm9hcmRCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKVxuICAgICAgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG4gICAgZWxzZVxuICAgICAgYXRvbS5jbGlwYm9hcmQucmVhZCgpXG5cbiAgd3JpdGVDbGlwYm9hcmQ6IChzZWxlY3Rpb249bnVsbCwgdGV4dCkgLT5cbiAgICBpZiBzZWxlY3Rpb24/LmVkaXRvci5oYXNNdWx0aXBsZUN1cnNvcnMoKSBhbmQgbm90IEBjbGlwYm9hcmRCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKVxuICAgICAgZGlzcG9zYWJsZSA9IHNlbGVjdGlvbi5vbkRpZERlc3Ryb3kgPT5cbiAgICAgICAgQHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLmRlbGV0ZShzZWxlY3Rpb24pXG4gICAgICAgIEBjbGlwYm9hcmRCeVNlbGVjdGlvbi5kZWxldGUoc2VsZWN0aW9uKVxuICAgICAgQHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIGRpc3Bvc2FibGUpXG5cbiAgICBpZiAoc2VsZWN0aW9uIGlzIG51bGwpIG9yIHNlbGVjdGlvbi5pc0xhc3RTZWxlY3Rpb24oKVxuICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUodGV4dClcbiAgICBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgdGV4dCkgaWYgc2VsZWN0aW9uP1xuXG4gIGdldDogKG5hbWUsIHNlbGVjdGlvbikgLT5cbiAgICBuYW1lID89IEBnZXROYW1lKClcbiAgICBuYW1lID0gQHZpbVN0YXRlLmdldENvbmZpZygnZGVmYXVsdFJlZ2lzdGVyJykgaWYgbmFtZSBpcyAnXCInXG5cbiAgICBzd2l0Y2ggbmFtZVxuICAgICAgd2hlbiAnKicsICcrJyB0aGVuIHRleHQgPSBAcmVhZENsaXBib2FyZChzZWxlY3Rpb24pXG4gICAgICB3aGVuICclJyB0aGVuIHRleHQgPSBAZWRpdG9yLmdldFVSSSgpXG4gICAgICB3aGVuICdfJyB0aGVuIHRleHQgPSAnJyAjIEJsYWNraG9sZSBhbHdheXMgcmV0dXJucyBub3RoaW5nXG4gICAgICBlbHNlXG4gICAgICAgIHt0ZXh0LCB0eXBlfSA9IEBkYXRhW25hbWUudG9Mb3dlckNhc2UoKV0gPyB7fVxuICAgIHR5cGUgPz0gQGdldENvcHlUeXBlKHRleHQgPyAnJylcbiAgICB7dGV4dCwgdHlwZX1cblxuICAjIFByaXZhdGU6IFNldHMgdGhlIHZhbHVlIG9mIGEgZ2l2ZW4gcmVnaXN0ZXIuXG4gICNcbiAgIyBuYW1lICAtIFRoZSBuYW1lIG9mIHRoZSByZWdpc3RlciB0byBmZXRjaC5cbiAgIyB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBzZXQgdGhlIHJlZ2lzdGVyIHRvLCB3aXRoIGZvbGxvd2luZyBwcm9wZXJ0aWVzLlxuICAjICB0ZXh0OiB0ZXh0IHRvIHNhdmUgdG8gcmVnaXN0ZXIuXG4gICMgIHR5cGU6IChvcHRpb25hbCkgaWYgb21taXRlZCBhdXRvbWF0aWNhbGx5IHNldCBmcm9tIHRleHQuXG4gICNcbiAgIyBSZXR1cm5zIG5vdGhpbmcuXG4gIHNldDogKGFyZ3MuLi4pIC0+XG4gICAgW25hbWUsIHZhbHVlXSA9IFtdXG4gICAgc3dpdGNoIGFyZ3MubGVuZ3RoXG4gICAgICB3aGVuIDEgdGhlbiBbdmFsdWVdID0gYXJnc1xuICAgICAgd2hlbiAyIHRoZW4gW25hbWUsIHZhbHVlXSA9IGFyZ3NcblxuICAgIG5hbWUgPz0gQGdldE5hbWUoKVxuICAgIHJldHVybiB1bmxlc3MgQGlzVmFsaWROYW1lKG5hbWUpXG4gICAgbmFtZSA9IEB2aW1TdGF0ZS5nZXRDb25maWcoJ2RlZmF1bHRSZWdpc3RlcicpIGlmIG5hbWUgaXMgJ1wiJ1xuICAgIHZhbHVlLnR5cGUgPz0gQGdldENvcHlUeXBlKHZhbHVlLnRleHQpXG5cbiAgICBzZWxlY3Rpb24gPSB2YWx1ZS5zZWxlY3Rpb25cbiAgICBkZWxldGUgdmFsdWUuc2VsZWN0aW9uXG4gICAgc3dpdGNoIG5hbWVcbiAgICAgIHdoZW4gJyonLCAnKycgdGhlbiBAd3JpdGVDbGlwYm9hcmQoc2VsZWN0aW9uLCB2YWx1ZS50ZXh0KVxuICAgICAgd2hlbiAnXycsICclJyB0aGVuIG51bGxcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgL15bQS1aXSQvLnRlc3QobmFtZSlcbiAgICAgICAgICBAYXBwZW5kKG5hbWUudG9Mb3dlckNhc2UoKSwgdmFsdWUpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZGF0YVtuYW1lXSA9IHZhbHVlXG5cbiAgIyBQcml2YXRlOiBhcHBlbmQgYSB2YWx1ZSBpbnRvIGEgZ2l2ZW4gcmVnaXN0ZXJcbiAgIyBsaWtlIHNldFJlZ2lzdGVyLCBidXQgYXBwZW5kcyB0aGUgdmFsdWVcbiAgYXBwZW5kOiAobmFtZSwgdmFsdWUpIC0+XG4gICAgdW5sZXNzIHJlZ2lzdGVyID0gQGRhdGFbbmFtZV1cbiAgICAgIEBkYXRhW25hbWVdID0gdmFsdWVcbiAgICAgIHJldHVyblxuXG4gICAgaWYgJ2xpbmV3aXNlJyBpbiBbcmVnaXN0ZXIudHlwZSwgdmFsdWUudHlwZV1cbiAgICAgIGlmIHJlZ2lzdGVyLnR5cGUgaXNudCAnbGluZXdpc2UnXG4gICAgICAgIHJlZ2lzdGVyLnRleHQgKz0gJ1xcbidcbiAgICAgICAgcmVnaXN0ZXIudHlwZSA9ICdsaW5ld2lzZSdcbiAgICAgIGlmIHZhbHVlLnR5cGUgaXNudCAnbGluZXdpc2UnXG4gICAgICAgIHZhbHVlLnRleHQgKz0gJ1xcbidcbiAgICByZWdpc3Rlci50ZXh0ICs9IHZhbHVlLnRleHRcblxuICBnZXROYW1lOiAtPlxuICAgIEBuYW1lID8gQHZpbVN0YXRlLmdldENvbmZpZygnZGVmYXVsdFJlZ2lzdGVyJylcblxuICBpc0RlZmF1bHROYW1lOiAtPlxuICAgIEBnZXROYW1lKCkgaXMgQHZpbVN0YXRlLmdldENvbmZpZygnZGVmYXVsdFJlZ2lzdGVyJylcblxuICBoYXNOYW1lOiAtPlxuICAgIEBuYW1lP1xuXG4gIHNldE5hbWU6IChuYW1lPW51bGwpIC0+XG4gICAgaWYgbmFtZT9cbiAgICAgIEBuYW1lID0gbmFtZSBpZiBAaXNWYWxpZE5hbWUobmFtZSlcbiAgICBlbHNlXG4gICAgICBAdmltU3RhdGUuaG92ZXIuc2V0KCdcIicpXG5cbiAgICAgIGlucHV0VUkgPSBuZXcgSW5wdXQoQHZpbVN0YXRlKVxuICAgICAgaW5wdXRVSS5vbkRpZENvbmZpcm0gKEBuYW1lKSA9PlxuICAgICAgICBAdmltU3RhdGUudG9nZ2xlQ2xhc3NMaXN0KCd3aXRoLXJlZ2lzdGVyJywgdHJ1ZSlcbiAgICAgICAgQHZpbVN0YXRlLmhvdmVyLnNldCgnXCInICsgQG5hbWUpXG4gICAgICBpbnB1dFVJLm9uRGlkQ2FuY2VsID0+XG4gICAgICAgIEB2aW1TdGF0ZS5ob3Zlci5yZXNldCgpXG4gICAgICBpbnB1dFVJLmZvY3VzKDEpXG5cbiAgZ2V0Q29weVR5cGU6ICh0ZXh0KSAtPlxuICAgIGlmIHRleHQubGFzdEluZGV4T2YoXCJcXG5cIikgaXMgdGV4dC5sZW5ndGggLSAxXG4gICAgICAnbGluZXdpc2UnXG4gICAgZWxzZSBpZiB0ZXh0Lmxhc3RJbmRleE9mKFwiXFxyXCIpIGlzIHRleHQubGVuZ3RoIC0gMVxuICAgICAgJ2xpbmV3aXNlJ1xuICAgIGVsc2VcbiAgICAgICdjaGFyYWN0ZXJ3aXNlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlZ2lzdGVyTWFuYWdlclxuIl19
