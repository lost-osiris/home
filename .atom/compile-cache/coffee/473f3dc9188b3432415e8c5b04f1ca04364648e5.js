(function() {
  var CompositeDisposable, Disposable, Emitter, SearchInput, ref, registerElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  registerElement = require('./utils').registerElement;

  SearchInput = (function(superClass) {
    extend(SearchInput, superClass);

    function SearchInput() {
      return SearchInput.__super__.constructor.apply(this, arguments);
    }

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

    SearchInput.prototype.createdCallback = function() {
      var editorContainer, optionsContainer, ref1;
      this.className = "vim-mode-plus-search-container";
      this.emitter = new Emitter;
      this.innerHTML = "<div class='options-container'>\n  <span class='inline-block-tight btn btn-primary'>.*</span>\n</div>\n<div class='editor-container'>\n  <atom-text-editor mini class='editor vim-mode-plus-search'></atom-text-editor>\n</div>";
      ref1 = this.getElementsByTagName('div'), optionsContainer = ref1[0], editorContainer = ref1[1];
      this.regexSearchStatus = optionsContainer.firstElementChild;
      this.editorElement = editorContainer.firstElementChild;
      this.editor = this.editorElement.getModel();
      this.editor.setMini(true);
      this.editor.onDidChange((function(_this) {
        return function() {
          if (_this.finished) {
            return;
          }
          return _this.emitter.emit('did-change', _this.editor.getText());
        };
      })(this));
      this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
      return this;
    };

    SearchInput.prototype.destroy = function() {
      var ref1, ref2;
      this.disposables.dispose();
      this.editor.destroy();
      if ((ref1 = this.panel) != null) {
        ref1.destroy();
      }
      ref2 = {}, this.editor = ref2.editor, this.panel = ref2.panel, this.editorElement = ref2.editorElement, this.vimState = ref2.vimState;
      return this.remove();
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

    SearchInput.prototype.initialize = function(vimState) {
      this.vimState = vimState;
      this.vimState.onDidFailToPushToOperationStack((function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.registerCommands();
      return this;
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

  })(HTMLElement);

  module.exports = registerElement('vim-mode-plus-search-input', {
    prototype: SearchInput.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NlYXJjaC1pbnB1dC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJFQUFBO0lBQUE7Ozs7RUFBQSxNQUE2QyxPQUFBLENBQVEsTUFBUixDQUE3QyxFQUFDLHFCQUFELEVBQVUsMkJBQVYsRUFBc0I7O0VBQ3JCLGtCQUFtQixPQUFBLENBQVEsU0FBUjs7RUFFZDs7Ozs7OzswQkFDSixzQkFBQSxHQUF3Qjs7MEJBRXhCLFdBQUEsR0FBYSxTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxZQUFaLEVBQTBCLEVBQTFCO0lBQVI7OzBCQUNiLFlBQUEsR0FBYyxTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLEVBQTNCO0lBQVI7OzBCQUNkLFdBQUEsR0FBYSxTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxZQUFaLEVBQTBCLEVBQTFCO0lBQVI7OzBCQUNiLFlBQUEsR0FBYyxTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLEVBQTNCO0lBQVI7OzBCQUVkLGVBQUEsR0FBaUIsU0FBQTtBQUNmLFVBQUE7TUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhO01BQ2IsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BRWYsSUFBQyxDQUFBLFNBQUQsR0FBYTtNQVFiLE9BQXNDLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixLQUF0QixDQUF0QyxFQUFDLDBCQUFELEVBQW1CO01BQ25CLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixnQkFBZ0IsQ0FBQztNQUN0QyxJQUFDLENBQUEsYUFBRCxHQUFpQixlQUFlLENBQUM7TUFDakMsSUFBQyxDQUFBLE1BQUQs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R0FBeEIsQ0FBNEIsTUFBNUIsQ0FBaEI7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FqQmxCO09BRGdDLENBQWxDO0lBRGdCOzs7O0tBeElNOztFQThKMUIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsZUFBQSxDQUFnQiw0QkFBaEIsRUFDZjtJQUFBLFNBQUEsRUFBVyxXQUFXLENBQUMsU0FBdkI7R0FEZTtBQWpLakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RW1pdHRlciwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue3JlZ2lzdGVyRWxlbWVudH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5jbGFzcyBTZWFyY2hJbnB1dCBleHRlbmRzIEhUTUxFbGVtZW50XG4gIGxpdGVyYWxNb2RlRGVhY3RpdmF0b3I6IG51bGxcblxuICBvbkRpZENoYW5nZTogKGZuKSAtPiBAZW1pdHRlci5vbiAnZGlkLWNoYW5nZScsIGZuXG4gIG9uRGlkQ29uZmlybTogKGZuKSAtPiBAZW1pdHRlci5vbiAnZGlkLWNvbmZpcm0nLCBmblxuICBvbkRpZENhbmNlbDogKGZuKSAtPiBAZW1pdHRlci5vbiAnZGlkLWNhbmNlbCcsIGZuXG4gIG9uRGlkQ29tbWFuZDogKGZuKSAtPiBAZW1pdHRlci5vbiAnZGlkLWNvbW1hbmQnLCBmblxuXG4gIGNyZWF0ZWRDYWxsYmFjazogLT5cbiAgICBAY2xhc3NOYW1lID0gXCJ2aW0tbW9kZS1wbHVzLXNlYXJjaC1jb250YWluZXJcIlxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIEBpbm5lckhUTUwgPSBcIlwiXCJcbiAgICA8ZGl2IGNsYXNzPSdvcHRpb25zLWNvbnRhaW5lcic+XG4gICAgICA8c3BhbiBjbGFzcz0naW5saW5lLWJsb2NrLXRpZ2h0IGJ0biBidG4tcHJpbWFyeSc+Lio8L3NwYW4+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz0nZWRpdG9yLWNvbnRhaW5lcic+XG4gICAgICA8YXRvbS10ZXh0LWVkaXRvciBtaW5pIGNsYXNzPSdlZGl0b3IgdmltLW1vZGUtcGx1cy1zZWFyY2gnPjwvYXRvbS10ZXh0LWVkaXRvcj5cbiAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgICBbb3B0aW9uc0NvbnRhaW5lciwgZWRpdG9yQ29udGFpbmVyXSA9IEBnZXRFbGVtZW50c0J5VGFnTmFtZSgnZGl2JylcbiAgICBAcmVnZXhTZWFyY2hTdGF0dXMgPSBvcHRpb25zQ29udGFpbmVyLmZpcnN0RWxlbWVudENoaWxkXG4gICAgQGVkaXRvckVsZW1lbnQgPSBlZGl0b3JDb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGRcbiAgICBAZWRpdG9yID0gQGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKVxuICAgIEBlZGl0b3Iuc2V0TWluaSh0cnVlKVxuXG4gICAgQGVkaXRvci5vbkRpZENoYW5nZSA9PlxuICAgICAgcmV0dXJuIGlmIEBmaW5pc2hlZFxuICAgICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZScsIEBlZGl0b3IuZ2V0VGV4dCgpKVxuXG4gICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoaXRlbTogdGhpcywgdmlzaWJsZTogZmFsc2UpXG4gICAgdGhpc1xuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIEBlZGl0b3IuZGVzdHJveSgpXG4gICAgQHBhbmVsPy5kZXN0cm95KClcbiAgICB7QGVkaXRvciwgQHBhbmVsLCBAZWRpdG9yRWxlbWVudCwgQHZpbVN0YXRlfSA9IHt9XG4gICAgQHJlbW92ZSgpXG5cbiAgaGFuZGxlRXZlbnRzOiAtPlxuICAgIGF0b20uY29tbWFuZHMuYWRkIEBlZGl0b3JFbGVtZW50LFxuICAgICAgJ2NvcmU6Y29uZmlybSc6ID0+IEBjb25maXJtKClcbiAgICAgICdjb3JlOmNhbmNlbCc6ID0+IEBjYW5jZWwoKVxuICAgICAgJ2NvcmU6YmFja3NwYWNlJzogPT4gQGJhY2tzcGFjZSgpXG4gICAgICAndmltLW1vZGUtcGx1czppbnB1dC1jYW5jZWwnOiA9PiBAY2FuY2VsKClcblxuICBmb2N1czogKEBvcHRpb25zPXt9KSAtPlxuICAgIEBmaW5pc2hlZCA9IGZhbHNlXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKEBvcHRpb25zLmNsYXNzTGlzdC4uLikgaWYgQG9wdGlvbnMuY2xhc3NMaXN0P1xuICAgIEBwYW5lbC5zaG93KClcbiAgICBAZWRpdG9yRWxlbWVudC5mb2N1cygpXG5cbiAgICBAZm9jdXNTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZm9jdXNTdWJzY3JpcHRpb25zLmFkZCBAaGFuZGxlRXZlbnRzKClcbiAgICBjYW5jZWwgPSBAY2FuY2VsLmJpbmQodGhpcylcbiAgICBAdmltU3RhdGUuZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbmNlbClcbiAgICAjIENhbmNlbCBvbiBtb3VzZSBjbGlja1xuICAgIEBmb2N1c1N1YnNjcmlwdGlvbnMuYWRkIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAdmltU3RhdGUuZWRpdG9yRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbmNlbClcblxuICAgICMgQ2FuY2VsIG9uIHRhYiBzd2l0Y2hcbiAgICBAZm9jdXNTdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKGNhbmNlbCkpXG5cbiAgdW5mb2N1czogLT5cbiAgICBAZmluaXNoZWQgPSB0cnVlXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShAb3B0aW9ucy5jbGFzc0xpc3QuLi4pIGlmIEBvcHRpb25zPy5jbGFzc0xpc3Q/XG4gICAgQHJlZ2V4U2VhcmNoU3RhdHVzLmNsYXNzTGlzdC5hZGQgJ2J0bi1wcmltYXJ5J1xuICAgIEBsaXRlcmFsTW9kZURlYWN0aXZhdG9yPy5kaXNwb3NlKClcblxuICAgIEBmb2N1c1N1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5hY3RpdmF0ZSgpXG4gICAgQGVkaXRvci5zZXRUZXh0ICcnXG4gICAgQHBhbmVsPy5oaWRlKClcblxuICB1cGRhdGVPcHRpb25TZXR0aW5nczogKHt1c2VSZWdleHB9PXt9KSAtPlxuICAgIEByZWdleFNlYXJjaFN0YXR1cy5jbGFzc0xpc3QudG9nZ2xlKCdidG4tcHJpbWFyeScsIHVzZVJlZ2V4cClcblxuICBzZXRDdXJzb3JXb3JkOiAtPlxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dChAdmltU3RhdGUuZWRpdG9yLmdldFdvcmRVbmRlckN1cnNvcigpKVxuXG4gIGFjdGl2YXRlTGl0ZXJhbE1vZGU6IC0+XG4gICAgaWYgQGxpdGVyYWxNb2RlRGVhY3RpdmF0b3I/XG4gICAgICBAbGl0ZXJhbE1vZGVEZWFjdGl2YXRvci5kaXNwb3NlKClcbiAgICBlbHNlXG4gICAgICBAbGl0ZXJhbE1vZGVEZWFjdGl2YXRvciA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2xpdGVyYWwtbW9kZScpXG5cbiAgICAgIEBsaXRlcmFsTW9kZURlYWN0aXZhdG9yLmFkZCBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdsaXRlcmFsLW1vZGUnKVxuICAgICAgICBAbGl0ZXJhbE1vZGVEZWFjdGl2YXRvciA9IG51bGxcblxuICBpc1Zpc2libGU6IC0+XG4gICAgQHBhbmVsPy5pc1Zpc2libGUoKVxuXG4gIGNhbmNlbDogLT5cbiAgICByZXR1cm4gaWYgQGZpbmlzaGVkXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNhbmNlbCcpXG4gICAgQHVuZm9jdXMoKVxuXG4gIGJhY2tzcGFjZTogLT5cbiAgICBAY2FuY2VsKCkgaWYgQGVkaXRvci5nZXRUZXh0KCkubGVuZ3RoIGlzIDBcblxuICBjb25maXJtOiAobGFuZGluZ1BvaW50PW51bGwpIC0+XG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNvbmZpcm0nLCB7aW5wdXQ6IEBlZGl0b3IuZ2V0VGV4dCgpLCBsYW5kaW5nUG9pbnR9KVxuICAgIEB1bmZvY3VzKClcblxuICBzdG9wUHJvcGFnYXRpb246IChvbGRDb21tYW5kcykgLT5cbiAgICBuZXdDb21tYW5kcyA9IHt9XG4gICAgZm9yIG5hbWUsIGZuIG9mIG9sZENvbW1hbmRzXG4gICAgICBkbyAoZm4pIC0+XG4gICAgICAgIGlmICc6JyBpbiBuYW1lXG4gICAgICAgICAgY29tbWFuZE5hbWUgPSBuYW1lXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjb21tYW5kTmFtZSA9IFwidmltLW1vZGUtcGx1czoje25hbWV9XCJcbiAgICAgICAgbmV3Q29tbWFuZHNbY29tbWFuZE5hbWVdID0gKGV2ZW50KSAtPlxuICAgICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICAgICAgZm4oZXZlbnQpXG4gICAgbmV3Q29tbWFuZHNcblxuICBpbml0aWFsaXplOiAoQHZpbVN0YXRlKSAtPlxuICAgIEB2aW1TdGF0ZS5vbkRpZEZhaWxUb1B1c2hUb09wZXJhdGlvblN0YWNrID0+XG4gICAgICBAY2FuY2VsKClcblxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG5cbiAgICBAcmVnaXN0ZXJDb21tYW5kcygpXG4gICAgdGhpc1xuXG4gIGVtaXREaWRDb21tYW5kOiAobmFtZSwgb3B0aW9ucz17fSkgLT5cbiAgICBvcHRpb25zLm5hbWUgPSBuYW1lXG4gICAgb3B0aW9ucy5pbnB1dCA9IEBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNvbW1hbmQnLCBvcHRpb25zKVxuXG4gIHJlZ2lzdGVyQ29tbWFuZHM6IC0+XG4gICAgYXRvbS5jb21tYW5kcy5hZGQgQGVkaXRvckVsZW1lbnQsIEBzdG9wUHJvcGFnYXRpb24oXG4gICAgICBcInNlYXJjaC1jb25maXJtXCI6ID0+IEBjb25maXJtKClcbiAgICAgIFwic2VhcmNoLWxhbmQtdG8tc3RhcnRcIjogPT4gQGNvbmZpcm0oKVxuICAgICAgXCJzZWFyY2gtbGFuZC10by1lbmRcIjogPT4gQGNvbmZpcm0oJ2VuZCcpXG4gICAgICBcInNlYXJjaC1jYW5jZWxcIjogPT4gQGNhbmNlbCgpXG5cbiAgICAgIFwic2VhcmNoLXZpc2l0LW5leHRcIjogPT4gQGVtaXREaWRDb21tYW5kKCd2aXNpdCcsIGRpcmVjdGlvbjogJ25leHQnKVxuICAgICAgXCJzZWFyY2gtdmlzaXQtcHJldlwiOiA9PiBAZW1pdERpZENvbW1hbmQoJ3Zpc2l0JywgZGlyZWN0aW9uOiAncHJldicpXG5cbiAgICAgIFwic2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2hcIjogPT4gQGVtaXREaWRDb21tYW5kKCdvY2N1cnJlbmNlJywgb3BlcmF0aW9uOiAnU2VsZWN0T2NjdXJyZW5jZScpXG4gICAgICBcImNoYW5nZS1vY2N1cnJlbmNlLWZyb20tc2VhcmNoXCI6ID0+IEBlbWl0RGlkQ29tbWFuZCgnb2NjdXJyZW5jZScsIG9wZXJhdGlvbjogJ0NoYW5nZU9jY3VycmVuY2UnKVxuICAgICAgXCJhZGQtb2NjdXJyZW5jZS1wYXR0ZXJuLWZyb20tc2VhcmNoXCI6ID0+IEBlbWl0RGlkQ29tbWFuZCgnb2NjdXJyZW5jZScpXG4gICAgICBcInByb2plY3QtZmluZC1mcm9tLXNlYXJjaFwiOiA9PiBAZW1pdERpZENvbW1hbmQoJ3Byb2plY3QtZmluZCcpXG5cbiAgICAgIFwic2VhcmNoLWluc2VydC13aWxkLXBhdHRlcm5cIjogPT4gQGVkaXRvci5pbnNlcnRUZXh0KCcuKj8nKVxuICAgICAgXCJzZWFyY2gtYWN0aXZhdGUtbGl0ZXJhbC1tb2RlXCI6ID0+IEBhY3RpdmF0ZUxpdGVyYWxNb2RlKClcbiAgICAgIFwic2VhcmNoLXNldC1jdXJzb3Itd29yZFwiOiA9PiBAc2V0Q3Vyc29yV29yZCgpXG4gICAgICAnY29yZTptb3ZlLXVwJzogPT4gQGVkaXRvci5zZXRUZXh0IEB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LmdldCgncHJldicpXG4gICAgICAnY29yZTptb3ZlLWRvd24nOiA9PiBAZWRpdG9yLnNldFRleHQgQHZpbVN0YXRlLnNlYXJjaEhpc3RvcnkuZ2V0KCduZXh0JylcbiAgICApXG5cbm1vZHVsZS5leHBvcnRzID0gcmVnaXN0ZXJFbGVtZW50ICd2aW0tbW9kZS1wbHVzLXNlYXJjaC1pbnB1dCcsXG4gIHByb3RvdHlwZTogU2VhcmNoSW5wdXQucHJvdG90eXBlXG4iXX0=
