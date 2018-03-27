(function() {
  var CompositeDisposable, Disposable, Emitter, SearchInput, ref,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  module.exports = SearchInput = (function() {
    SearchInput.prototype.literalModeDeactivator = null;

    SearchInput.prototype.onDidChange = function(fn) {
      return this.emitter.on('did-change', fn);
    };

    SearchInput.prototype.onDidConfirm = function(fn) {
      return this.emitter.on('did-confirm', fn);
    };

    SearchInput.prototype.onDidCancel = function(fn) {
      return this.emitter.on('did-cancel', fn);
    };

    SearchInput.prototype.onDidCommand = function(fn) {
      return this.emitter.on('did-command', fn);
    };

    function SearchInput(vimState) {
      var editorContainer, optionsContainer, ref1;
      this.vimState = vimState;
      this.emitter = new Emitter;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.container = document.createElement('div');
      this.container.className = 'vim-mode-plus-search-container';
      this.container.innerHTML = "<div class='options-container'>\n  <span class='inline-block-tight btn btn-primary'>.*</span>\n</div>\n<div class='editor-container'>\n</div>";
      ref1 = this.container.getElementsByTagName('div'), optionsContainer = ref1[0], editorContainer = ref1[1];
      this.regexSearchStatus = optionsContainer.firstElementChild;
      this.editor = atom.workspace.buildTextEditor({
        mini: true
      });
      this.editorElement = this.editor.element;
      this.editorElement.classList.add('vim-mode-plus-search');
      editorContainer.appendChild(this.editorElement);
      this.editor.onDidChange((function(_this) {
        return function() {
          if (_this.finished) {
            return;
          }
          return _this.emitter.emit('did-change', _this.editor.getText());
        };
      })(this));
      this.panel = atom.workspace.addBottomPanel({
        item: this.container,
        visible: false
      });
      this.vimState.onDidFailToPushToOperationStack((function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      this.registerCommands();
    }

    SearchInput.prototype.destroy = function() {
      var ref1, ref2;
      this.disposables.dispose();
      this.editor.destroy();
      if ((ref1 = this.panel) != null) {
        ref1.destroy();
      }
      return ref2 = {}, this.editor = ref2.editor, this.panel = ref2.panel, this.editorElement = ref2.editorElement, this.vimState = ref2.vimState, ref2;
    };

    SearchInput.prototype.handleEvents = function() {
      return atom.commands.add(this.editorElement, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        'core:backspace': (function(_this) {
          return function() {
            return _this.backspace();
          };
        })(this),
        'vim-mode-plus:input-cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this)
      });
    };

    SearchInput.prototype.focus = function(options1) {
      var cancel, ref1;
      this.options = options1 != null ? options1 : {};
      this.finished = false;
      if (this.options.classList != null) {
        (ref1 = this.editorElement.classList).add.apply(ref1, this.options.classList);
      }
      this.panel.show();
      this.editorElement.focus();
      this.focusSubscriptions = new CompositeDisposable;
      this.focusSubscriptions.add(this.handleEvents());
      cancel = this.cancel.bind(this);
      this.vimState.editorElement.addEventListener('click', cancel);
      this.focusSubscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.vimState.editorElement.removeEventListener('click', cancel);
        };
      })(this)));
      return this.focusSubscriptions.add(atom.workspace.onDidChangeActivePaneItem(cancel));
    };

    SearchInput.prototype.unfocus = function() {
      var ref1, ref2, ref3, ref4, ref5;
      this.finished = true;
      if (((ref1 = this.options) != null ? ref1.classList : void 0) != null) {
        (ref2 = this.editorElement.classList).remove.apply(ref2, this.options.classList);
      }
      this.regexSearchStatus.classList.add('btn-primary');
      if ((ref3 = this.literalModeDeactivator) != null) {
        ref3.dispose();
      }
      if ((ref4 = this.focusSubscriptions) != null) {
        ref4.dispose();
      }
      atom.workspace.getActivePane().activate();
      this.editor.setText('');
      return (ref5 = this.panel) != null ? ref5.hide() : void 0;
    };

    SearchInput.prototype.updateOptionSettings = function(arg) {
      var useRegexp;
      useRegexp = (arg != null ? arg : {}).useRegexp;
      return this.regexSearchStatus.classList.toggle('btn-primary', useRegexp);
    };

    SearchInput.prototype.setCursorWord = function() {
      return this.editor.insertText(this.vimState.editor.getWordUnderCursor());
    };

    SearchInput.prototype.activateLiteralMode = function() {
      if (this.literalModeDeactivator != null) {
        return this.literalModeDeactivator.dispose();
      } else {
        this.literalModeDeactivator = new CompositeDisposable();
        this.editorElement.classList.add('literal-mode');
        return this.literalModeDeactivator.add(new Disposable((function(_this) {
          return function() {
            _this.editorElement.classList.remove('literal-mode');
            return _this.literalModeDeactivator = null;
          };
        })(this)));
      }
    };

    SearchInput.prototype.isVisible = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.isVisible() : void 0;
    };

    SearchInput.prototype.cancel = function() {
      if (this.finished) {
        return;
      }
      this.emitter.emit('did-cancel');
      return this.unfocus();
    };

    SearchInput.prototype.backspace = function() {
      if (this.editor.getText().length === 0) {
        return this.cancel();
      }
    };

    SearchInput.prototype.confirm = function(landingPoint) {
      if (landingPoint == null) {
        landingPoint = null;
      }
      this.emitter.emit('did-confirm', {
        input: this.editor.getText(),
        landingPoint: landingPoint
      });
      return this.unfocus();
    };

    SearchInput.prototype.stopPropagation = function(oldCommands) {
      var fn, fn1, name, newCommands;
      newCommands = {};
      fn1 = function(fn) {
        var commandName;
        if (indexOf.call(name, ':') >= 0) {
          commandName = name;
        } else {
          commandName = "vim-mode-plus:" + name;
        }
        return newCommands[commandName] = function(event) {
          event.stopImmediatePropagation();
          return fn(event);
        };
      };
      for (name in oldCommands) {
        fn = oldCommands[name];
        fn1(fn);
      }
      return newCommands;
    };

    SearchInput.prototype.emitDidCommand = function(name, options) {
      if (options == null) {
        options = {};
      }
      options.name = name;
      options.input = this.editor.getText();
      return this.emitter.emit('did-command', options);
    };

    SearchInput.prototype.registerCommands = function() {
      return atom.commands.add(this.editorElement, this.stopPropagation({
        "search-confirm": (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        "search-land-to-start": (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        "search-land-to-end": (function(_this) {
          return function() {
            return _this.confirm('end');
          };
        })(this),
        "search-cancel": (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        "search-visit-next": (function(_this) {
          return function() {
            return _this.emitDidCommand('visit', {
              direction: 'next'
            });
          };
        })(this),
        "search-visit-prev": (function(_this) {
          return function() {
            return _this.emitDidCommand('visit', {
              direction: 'prev'
            });
          };
        })(this),
        "select-occurrence-from-search": (function(_this) {
          return function() {
            return _this.emitDidCommand('occurrence', {
              operation: 'SelectOccurrence'
            });
          };
        })(this),
        "change-occurrence-from-search": (function(_this) {
          return function() {
            return _this.emitDidCommand('occurrence', {
              operation: 'ChangeOccurrence'
            });
          };
        })(this),
        "add-occurrence-pattern-from-search": (function(_this) {
          return function() {
            return _this.emitDidCommand('occurrence');
          };
        })(this),
        "project-find-from-search": (function(_this) {
          return function() {
            return _this.emitDidCommand('project-find');
          };
        })(this),
        "search-insert-wild-pattern": (function(_this) {
          return function() {
            return _this.editor.insertText('.*?');
          };
        })(this),
        "search-activate-literal-mode": (function(_this) {
          return function() {
            return _this.activateLiteralMode();
          };
        })(this),
        "search-set-cursor-word": (function(_this) {
          return function() {
            return _this.setCursorWord();
          };
        })(this),
        'core:move-up': (function(_this) {
          return function() {
            return _this.editor.setText(_this.vimState.searchHistory.get('prev'));
          };
        })(this),
        'core:move-down': (function(_this) {
          return function() {
            return _this.editor.setText(_this.vimState.searchHistory.get('next'));
          };
        })(this)
      }));
    };

    return SearchInput;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NlYXJjaC1pbnB1dC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDBEQUFBO0lBQUE7O0VBQUEsTUFBNkMsT0FBQSxDQUFRLE1BQVIsQ0FBN0MsRUFBQyxxQkFBRCxFQUFVLDJCQUFWLEVBQXNCOztFQUV0QixNQUFNLENBQUMsT0FBUCxHQUNNOzBCQUNKLHNCQUFBLEdBQXdCOzswQkFFeEIsV0FBQSxHQUFhLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsRUFBMUI7SUFBUjs7MEJBQ2IsWUFBQSxHQUFjLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGFBQVosRUFBMkIsRUFBM0I7SUFBUjs7MEJBQ2QsV0FBQSxHQUFhLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsRUFBMUI7SUFBUjs7MEJBQ2IsWUFBQSxHQUFjLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGFBQVosRUFBMkIsRUFBM0I7SUFBUjs7SUFFRCxxQkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BQ2YsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJO01BQ25CLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QixDQUFqQjtNQUVBLElBQUMsQ0FBQSxTQUFELEdBQWEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDYixJQUFDLENBQUEs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aUJBLGdCQUFBLEVBQWtCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQWdCLEtBQUMsQ0FBQSxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQXhCLENBQTRCLE1BQTVCLENBQWhCO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBakJsQjtPQURnQyxDQUFsQztJQURnQjs7Ozs7QUF4SXBCIiwic291cmNlc0NvbnRlbnQiOlsie0VtaXR0ZXIsIERpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU2VhcmNoSW5wdXRcbiAgbGl0ZXJhbE1vZGVEZWFjdGl2YXRvcjogbnVsbFxuXG4gIG9uRGlkQ2hhbmdlOiAoZm4pIC0+IEBlbWl0dGVyLm9uICdkaWQtY2hhbmdlJywgZm5cbiAgb25EaWRDb25maXJtOiAoZm4pIC0+IEBlbWl0dGVyLm9uICdkaWQtY29uZmlybScsIGZuXG4gIG9uRGlkQ2FuY2VsOiAoZm4pIC0+IEBlbWl0dGVyLm9uICdkaWQtY2FuY2VsJywgZm5cbiAgb25EaWRDb21tYW5kOiAoZm4pIC0+IEBlbWl0dGVyLm9uICdkaWQtY29tbWFuZCcsIGZuXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG5cbiAgICBAY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBAY29udGFpbmVyLmNsYXNzTmFtZSA9ICd2aW0tbW9kZS1wbHVzLXNlYXJjaC1jb250YWluZXInXG4gICAgQGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9J29wdGlvbnMtY29udGFpbmVyJz5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2lubGluZS1ibG9jay10aWdodCBidG4gYnRuLXByaW1hcnknPi4qPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPSdlZGl0b3ItY29udGFpbmVyJz5cbiAgICAgIDwvZGl2PlxuICAgICAgXCJcIlwiXG5cbiAgICBbb3B0aW9uc0NvbnRhaW5lciwgZWRpdG9yQ29udGFpbmVyXSA9IEBjb250YWluZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2RpdicpXG4gICAgQHJlZ2V4U2VhcmNoU3RhdHVzID0gb3B0aW9uc0NvbnRhaW5lci5maXJzdEVsZW1lbnRDaGlsZFxuICAgIEBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3IobWluaTogdHJ1ZSlcbiAgICBAZWRpdG9yRWxlbWVudCA9IEBlZGl0b3IuZWxlbWVudFxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3ZpbS1tb2RlLXBsdXMtc2VhcmNoJylcbiAgICBlZGl0b3JDb250YWluZXIuYXBwZW5kQ2hpbGQoQGVkaXRvckVsZW1lbnQpXG4gICAgQGVkaXRvci5vbkRpZENoYW5nZSA9PlxuICAgICAgcmV0dXJuIGlmIEBmaW5pc2hlZFxuICAgICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZScsIEBlZGl0b3IuZ2V0VGV4dCgpKVxuXG4gICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoaXRlbTogQGNvbnRhaW5lciwgdmlzaWJsZTogZmFsc2UpXG5cbiAgICBAdmltU3RhdGUub25EaWRGYWlsVG9QdXNoVG9PcGVyYXRpb25TdGFjayA9PlxuICAgICAgQGNhbmNlbCgpXG5cbiAgICBAcmVnaXN0ZXJDb21tYW5kcygpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQGVkaXRvci5kZXN0cm95KClcbiAgICBAcGFuZWw/LmRlc3Ryb3koKVxuICAgIHtAZWRpdG9yLCBAcGFuZWwsIEBlZGl0b3JFbGVtZW50LCBAdmltU3RhdGV9ID0ge31cblxuICBoYW5kbGVFdmVudHM6IC0+XG4gICAgYXRvbS5jb21tYW5kcy5hZGQgQGVkaXRvckVsZW1lbnQsXG4gICAgICAnY29yZTpjb25maXJtJzogPT4gQGNvbmZpcm0oKVxuICAgICAgJ2NvcmU6Y2FuY2VsJzogPT4gQGNhbmNlbCgpXG4gICAgICAnY29yZTpiYWNrc3BhY2UnOiA9PiBAYmFja3NwYWNlKClcbiAgICAgICd2aW0tbW9kZS1wbHVzOmlucHV0LWNhbmNlbCc6ID0+IEBjYW5jZWwoKVxuXG4gIGZvY3VzOiAoQG9wdGlvbnM9e30pIC0+XG4gICAgQGZpbmlzaGVkID0gZmFsc2VcblxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoQG9wdGlvbnMuY2xhc3NMaXN0Li4uKSBpZiBAb3B0aW9ucy5jbGFzc0xpc3Q/XG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBlZGl0b3JFbGVtZW50LmZvY3VzKClcblxuICAgIEBmb2N1c1N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBmb2N1c1N1YnNjcmlwdGlvbnMuYWRkIEBoYW5kbGVFdmVudHMoKVxuICAgIGNhbmNlbCA9IEBjYW5jZWwuYmluZCh0aGlzKVxuICAgIEB2aW1TdGF0ZS5lZGl0b3JFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FuY2VsKVxuICAgICMgQ2FuY2VsIG9uIG1vdXNlIGNsaWNrXG4gICAgQGZvY3VzU3Vic2NyaXB0aW9ucy5hZGQgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEB2aW1TdGF0ZS5lZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FuY2VsKVxuXG4gICAgIyBDYW5jZWwgb24gdGFiIHN3aXRjaFxuICAgIEBmb2N1c1N1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0oY2FuY2VsKSlcblxuICB1bmZvY3VzOiAtPlxuICAgIEBmaW5pc2hlZCA9IHRydWVcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKEBvcHRpb25zLmNsYXNzTGlzdC4uLikgaWYgQG9wdGlvbnM/LmNsYXNzTGlzdD9cbiAgICBAcmVnZXhTZWFyY2hTdGF0dXMuY2xhc3NMaXN0LmFkZCAnYnRuLXByaW1hcnknXG4gICAgQGxpdGVyYWxNb2RlRGVhY3RpdmF0b3I/LmRpc3Bvc2UoKVxuXG4gICAgQGZvY3VzU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlKClcbiAgICBAZWRpdG9yLnNldFRleHQgJydcbiAgICBAcGFuZWw/LmhpZGUoKVxuXG4gIHVwZGF0ZU9wdGlvblNldHRpbmdzOiAoe3VzZVJlZ2V4cH09e30pIC0+XG4gICAgQHJlZ2V4U2VhcmNoU3RhdHVzLmNsYXNzTGlzdC50b2dnbGUoJ2J0bi1wcmltYXJ5JywgdXNlUmVnZXhwKVxuXG4gIHNldEN1cnNvcldvcmQ6IC0+XG4gICAgQGVkaXRvci5pbnNlcnRUZXh0KEB2aW1TdGF0ZS5lZGl0b3IuZ2V0V29yZFVuZGVyQ3Vyc29yKCkpXG5cbiAgYWN0aXZhdGVMaXRlcmFsTW9kZTogLT5cbiAgICBpZiBAbGl0ZXJhbE1vZGVEZWFjdGl2YXRvcj9cbiAgICAgIEBsaXRlcmFsTW9kZURlYWN0aXZhdG9yLmRpc3Bvc2UoKVxuICAgIGVsc2VcbiAgICAgIEBsaXRlcmFsTW9kZURlYWN0aXZhdG9yID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbGl0ZXJhbC1tb2RlJylcblxuICAgICAgQGxpdGVyYWxNb2RlRGVhY3RpdmF0b3IuYWRkIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2xpdGVyYWwtbW9kZScpXG4gICAgICAgIEBsaXRlcmFsTW9kZURlYWN0aXZhdG9yID0gbnVsbFxuXG4gIGlzVmlzaWJsZTogLT5cbiAgICBAcGFuZWw/LmlzVmlzaWJsZSgpXG5cbiAgY2FuY2VsOiAtPlxuICAgIHJldHVybiBpZiBAZmluaXNoZWRcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2FuY2VsJylcbiAgICBAdW5mb2N1cygpXG5cbiAgYmFja3NwYWNlOiAtPlxuICAgIEBjYW5jZWwoKSBpZiBAZWRpdG9yLmdldFRleHQoKS5sZW5ndGggaXMgMFxuXG4gIGNvbmZpcm06IChsYW5kaW5nUG9pbnQ9bnVsbCkgLT5cbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY29uZmlybScsIHtpbnB1dDogQGVkaXRvci5nZXRUZXh0KCksIGxhbmRpbmdQb2ludH0pXG4gICAgQHVuZm9jdXMoKVxuXG4gIHN0b3BQcm9wYWdhdGlvbjogKG9sZENvbW1hbmRzKSAtPlxuICAgIG5ld0NvbW1hbmRzID0ge31cbiAgICBmb3IgbmFtZSwgZm4gb2Ygb2xkQ29tbWFuZHNcbiAgICAgIGRvIChmbikgLT5cbiAgICAgICAgaWYgJzonIGluIG5hbWVcbiAgICAgICAgICBjb21tYW5kTmFtZSA9IG5hbWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNvbW1hbmROYW1lID0gXCJ2aW0tbW9kZS1wbHVzOiN7bmFtZX1cIlxuICAgICAgICBuZXdDb21tYW5kc1tjb21tYW5kTmFtZV0gPSAoZXZlbnQpIC0+XG4gICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgICAgICBmbihldmVudClcbiAgICBuZXdDb21tYW5kc1xuXG5cbiAgZW1pdERpZENvbW1hbmQ6IChuYW1lLCBvcHRpb25zPXt9KSAtPlxuICAgIG9wdGlvbnMubmFtZSA9IG5hbWVcbiAgICBvcHRpb25zLmlucHV0ID0gQGVkaXRvci5nZXRUZXh0KClcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY29tbWFuZCcsIG9wdGlvbnMpXG5cbiAgcmVnaXN0ZXJDb21tYW5kczogLT5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBAZWRpdG9yRWxlbWVudCwgQHN0b3BQcm9wYWdhdGlvbihcbiAgICAgIFwic2VhcmNoLWNvbmZpcm1cIjogPT4gQGNvbmZpcm0oKVxuICAgICAgXCJzZWFyY2gtbGFuZC10by1zdGFydFwiOiA9PiBAY29uZmlybSgpXG4gICAgICBcInNlYXJjaC1sYW5kLXRvLWVuZFwiOiA9PiBAY29uZmlybSgnZW5kJylcbiAgICAgIFwic2VhcmNoLWNhbmNlbFwiOiA9PiBAY2FuY2VsKClcblxuICAgICAgXCJzZWFyY2gtdmlzaXQtbmV4dFwiOiA9PiBAZW1pdERpZENvbW1hbmQoJ3Zpc2l0JywgZGlyZWN0aW9uOiAnbmV4dCcpXG4gICAgICBcInNlYXJjaC12aXNpdC1wcmV2XCI6ID0+IEBlbWl0RGlkQ29tbWFuZCgndmlzaXQnLCBkaXJlY3Rpb246ICdwcmV2JylcblxuICAgICAgXCJzZWxlY3Qtb2NjdXJyZW5jZS1mcm9tLXNlYXJjaFwiOiA9PiBAZW1pdERpZENvbW1hbmQoJ29jY3VycmVuY2UnLCBvcGVyYXRpb246ICdTZWxlY3RPY2N1cnJlbmNlJylcbiAgICAgIFwiY2hhbmdlLW9jY3VycmVuY2UtZnJvbS1zZWFyY2hcIjogPT4gQGVtaXREaWRDb21tYW5kKCdvY2N1cnJlbmNlJywgb3BlcmF0aW9uOiAnQ2hhbmdlT2NjdXJyZW5jZScpXG4gICAgICBcImFkZC1vY2N1cnJlbmNlLXBhdHRlcm4tZnJvbS1zZWFyY2hcIjogPT4gQGVtaXREaWRDb21tYW5kKCdvY2N1cnJlbmNlJylcbiAgICAgIFwicHJvamVjdC1maW5kLWZyb20tc2VhcmNoXCI6ID0+IEBlbWl0RGlkQ29tbWFuZCgncHJvamVjdC1maW5kJylcblxuICAgICAgXCJzZWFyY2gtaW5zZXJ0LXdpbGQtcGF0dGVyblwiOiA9PiBAZWRpdG9yLmluc2VydFRleHQoJy4qPycpXG4gICAgICBcInNlYXJjaC1hY3RpdmF0ZS1saXRlcmFsLW1vZGVcIjogPT4gQGFjdGl2YXRlTGl0ZXJhbE1vZGUoKVxuICAgICAgXCJzZWFyY2gtc2V0LWN1cnNvci13b3JkXCI6ID0+IEBzZXRDdXJzb3JXb3JkKClcbiAgICAgICdjb3JlOm1vdmUtdXAnOiA9PiBAZWRpdG9yLnNldFRleHQgQHZpbVN0YXRlLnNlYXJjaEhpc3RvcnkuZ2V0KCdwcmV2JylcbiAgICAgICdjb3JlOm1vdmUtZG93bic6ID0+IEBlZGl0b3Iuc2V0VGV4dCBAdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5nZXQoJ25leHQnKVxuICAgIClcbiJdfQ==
