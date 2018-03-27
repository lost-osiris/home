(function() {
  var Base, CompositeDisposable, Disposable, Emitter, StatusBarManager, VimState, _, addClassList, forEachPaneAxis, globalState, ref, ref1, removeClassList, settings,
    slice = [].slice;

  _ = require('underscore-plus');

  ref = require('atom'), Disposable = ref.Disposable, Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  StatusBarManager = require('./status-bar-manager');

  globalState = require('./global-state');

  settings = require('./settings');

  VimState = require('./vim-state');

  ref1 = require('./utils'), forEachPaneAxis = ref1.forEachPaneAxis, addClassList = ref1.addClassList, removeClassList = ref1.removeClassList;

  module.exports = {
    config: settings.config,
    activate: function(state) {
      var developer, service;
      this.subscriptions = new CompositeDisposable;
      this.statusBarManager = new StatusBarManager;
      this.emitter = new Emitter;
      service = this.provideVimModePlus();
      this.subscribe(Base.init(service));
      this.registerCommands();
      this.registerVimStateCommands();
      if (atom.inSpecMode()) {
        settings.set('strictAssertion', true);
      }
      if (atom.inDevMode()) {
        developer = new (require('./developer'));
        this.subscribe(developer.init(service));
      }
      this.subscribe(this.observeVimMode(function() {
        var message;
        message = "## Message by vim-mode-plus: vim-mode detected!\nTo use vim-mode-plus, you must **disable vim-mode** manually.";
        return atom.notifications.addWarning(message, {
          dismissable: true
        });
      }));
      this.subscribe(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var vimState;
          if (editor.isMini()) {
            return;
          }
          vimState = new VimState(editor, _this.statusBarManager, globalState);
          return _this.emitter.emit('did-add-vim-state', vimState);
        };
      })(this)));
      this.subscribe(atom.workspace.onDidChangeActivePane(this.demaximizePane.bind(this)));
      this.subscribe(atom.workspace.onDidChangeActivePaneItem(function() {
        if (settings.get('automaticallyEscapeInsertModeOnActivePaneItemChange')) {
          return VimState.forEach(function(vimState) {
            if (vimState.mode === 'insert') {
              return vimState.activate('normal');
            }
          });
        }
      }));
      this.subscribe(atom.workspace.onDidStopChangingActivePaneItem((function(_this) {
        return function(item) {
          var ref2;
          if (atom.workspace.isTextEditor(item)) {
            return (ref2 = _this.getEditorState(item)) != null ? ref2.highlightSearch.refresh() : void 0;
          }
        };
      })(this)));
      return this.subscribe(settings.observe('highlightSearch', function(newValue) {
        if (newValue) {
          return globalState.set('highlightSearchPattern', globalState.get('lastSearchPattern'));
        } else {
          return globalState.set('highlightSearchPattern', null);
        }
      }));
    },
    observeVimMode: function(fn) {
      if (atom.packages.isPackageActive('vim-mode')) {
        fn();
      }
      return atom.packages.onDidActivatePackage(function(pack) {
        if (pack.name === 'vim-mode') {
          return fn();
        }
      });
    },
    onDidAddVimState: function(fn) {
      return this.emitter.on('did-add-vim-state', fn);
    },
    observeVimStates: function(fn) {
      VimState.forEach(fn);
      return this.onDidAddVimState(fn);
    },
    clearPersistentSelectionForEditors: function() {
      var editor, i, len, ref2, results;
      ref2 = atom.workspace.getTextEditors();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        editor = ref2[i];
        results.push(this.getEditorState(editor).clearPersistentSelections());
      }
      return results;
    },
    deactivate: function() {
      this.subscriptions.dispose();
      VimState.forEach(function(vimState) {
        return vimState.destroy();
      });
      return VimState.clear();
    },
    subscribe: function(arg) {
      return this.subscriptions.add(arg);
    },
    unsubscribe: function(arg) {
      return this.subscriptions.remove(arg);
    },
    registerCommands: function() {
      this.subscribe(atom.commands.add('atom-text-editor:not([mini])', {
        'vim-mode-plus:clear-highlight-search': function() {
          return globalState.set('highlightSearchPattern', null);
        },
        'vim-mode-plus:toggle-highlight-search': function() {
          return settings.toggle('highlightSearch');
        },
        'vim-mode-plus:clear-persistent-selection': (function(_this) {
          return function() {
            return _this.clearPersistentSelectionForEditors();
          };
        })(this)
      }));
      return this.subscribe(atom.commands.add('atom-workspace', {
        'vim-mode-plus:maximize-pane': (function(_this) {
          return function() {
            return _this.maximizePane();
          };
        })(this),
        'vim-mode-plus:equalize-panes': (function(_this) {
          return function() {
            return _this.equalizePanes();
          };
        })(this)
      }));
    },
    demaximizePane: function() {
      if (this.maximizePaneDisposable != null) {
        this.maximizePaneDisposable.dispose();
        this.unsubscribe(this.maximizePaneDisposable);
        return this.maximizePaneDisposable = null;
      }
    },
    maximizePane: function() {
      var classActivePaneAxis, classHideStatusBar, classHideTabBar, classPaneMaximized, getView, paneElement, workspaceClassNames, workspaceElement;
      if (this.maximizePaneDisposable != null) {
        this.demaximizePane();
        return;
      }
      getView = function(model) {
        return atom.views.getView(model);
      };
      classPaneMaximized = 'vim-mode-plus--pane-maximized';
      classHideTabBar = 'vim-mode-plus--hide-tab-bar';
      classHideStatusBar = 'vim-mode-plus--hide-status-bar';
      classActivePaneAxis = 'vim-mode-plus--active-pane-axis';
      workspaceElement = getView(atom.workspace);
      paneElement = getView(atom.workspace.getActivePane());
      workspaceClassNames = [classPaneMaximized];
      if (settings.get('hideTabBarOnMaximizePane')) {
        workspaceClassNames.push(classHideTabBar);
      }
      if (settings.get('hideStatusBarOnMaximizePane')) {
        workspaceClassNames.push(classHideStatusBar);
      }
      addClassList.apply(null, [workspaceElement].concat(slice.call(workspaceClassNames)));
      forEachPaneAxis(function(axis) {
        var paneAxisElement;
        paneAxisElement = getView(axis);
        if (paneAxisElement.contains(paneElement)) {
          return addClassList(paneAxisElement, classActivePaneAxis);
        }
      });
      this.maximizePaneDisposable = new Disposable(function() {
        forEachPaneAxis(function(axis) {
          return removeClassList(getView(axis), classActivePaneAxis);
        });
        return removeClassList.apply(null, [workspaceElement].concat(slice.call(workspaceClassNames)));
      });
      return this.subscribe(this.maximizePaneDisposable);
    },
    equalizePanes: function() {
      var setFlexScale;
      setFlexScale = function(newValue, base) {
        var child, i, len, ref2, ref3, results;
        if (base == null) {
          base = atom.workspace.getActivePane().getContainer().getRoot();
        }
        base.setFlexScale(newValue);
        ref3 = (ref2 = base.children) != null ? ref2 : [];
        results = [];
        for (i = 0, len = ref3.length; i < len; i++) {
          child = ref3[i];
          results.push(setFlexScale(newValue, child));
        }
        return results;
      };
      return setFlexScale(1);
    },
    registerVimStateCommands: function() {
      var bindToVimState, char, chars, commands, fn1, getEditorState, i, j, len, results;
      commands = {
        'activate-normal-mode': function() {
          return this.activate('normal');
        },
        'activate-linewise-visual-mode': function() {
          return this.activate('visual', 'linewise');
        },
        'activate-characterwise-visual-mode': function() {
          return this.activate('visual', 'characterwise');
        },
        'activate-blockwise-visual-mode': function() {
          return this.activate('visual', 'blockwise');
        },
        'reset-normal-mode': function() {
          return this.resetNormalMode({
            userInvocation: true
          });
        },
        'set-register-name': function() {
          return this.register.setName();
        },
        'set-register-name-to-_': function() {
          return this.register.setName('_');
        },
        'set-register-name-to-*': function() {
          return this.register.setName('*');
        },
        'operator-modifier-characterwise': function() {
          return this.emitDidSetOperatorModifier({
            wise: 'characterwise'
          });
        },
        'operator-modifier-linewise': function() {
          return this.emitDidSetOperatorModifier({
            wise: 'linewise'
          });
        },
        'operator-modifier-occurrence': function() {
          return this.emitDidSetOperatorModifier({
            occurrence: true,
            occurrenceType: 'base'
          });
        },
        'operator-modifier-subword-occurrence': function() {
          return this.emitDidSetOperatorModifier({
            occurrence: true,
            occurrenceType: 'subword'
          });
        },
        'repeat': function() {
          return this.operationStack.runRecorded();
        },
        'repeat-find': function() {
          return this.operationStack.runCurrentFind();
        },
        'repeat-find-reverse': function() {
          return this.operationStack.runCurrentFind({
            reverse: true
          });
        },
        'repeat-search': function() {
          return this.operationStack.runCurrentSearch();
        },
        'repeat-search-reverse': function() {
          return this.operationStack.runCurrentSearch({
            reverse: true
          });
        },
        'set-count-0': function() {
          return this.setCount(0);
        },
        'set-count-1': function() {
          return this.setCount(1);
        },
        'set-count-2': function() {
          return this.setCount(2);
        },
        'set-count-3': function() {
          return this.setCount(3);
        },
        'set-count-4': function() {
          return this.setCount(4);
        },
        'set-count-5': function() {
          return this.setCount(5);
        },
        'set-count-6': function() {
          return this.setCount(6);
        },
        'set-count-7': function() {
          return this.setCount(7);
        },
        'set-count-8': function() {
          return this.setCount(8);
        },
        'set-count-9': function() {
          return this.setCount(9);
        }
      };
      chars = (function() {
        results = [];
        for (i = 32; i <= 126; i++){ results.push(i); }
        return results;
      }).apply(this).map(function(code) {
        return String.fromCharCode(code);
      });
      fn1 = function(char) {
        var charForKeymap;
        charForKeymap = char === ' ' ? 'space' : char;
        return commands["set-input-char-" + charForKeymap] = function() {
          return this.emitDidSetInputChar(char);
        };
      };
      for (j = 0, len = chars.length; j < len; j++) {
        char = chars[j];
        fn1(char);
      }
      getEditorState = this.getEditorState.bind(this);
      bindToVimState = function(oldCommands) {
        var fn, fn2, name, newCommands;
        newCommands = {};
        fn2 = function(fn) {
          return newCommands["vim-mode-plus:" + name] = function(event) {
            var vimState;
            event.stopPropagation();
            if (vimState = getEditorState(this.getModel())) {
              return fn.call(vimState, event);
            }
          };
        };
        for (name in oldCommands) {
          fn = oldCommands[name];
          fn2(fn);
        }
        return newCommands;
      };
      return this.subscribe(atom.commands.add('atom-text-editor:not([mini])', bindToVimState(commands)));
    },
    consumeStatusBar: function(statusBar) {
      this.statusBarManager.initialize(statusBar);
      this.statusBarManager.attach();
      return this.subscribe(new Disposable((function(_this) {
        return function() {
          return _this.statusBarManager.detach();
        };
      })(this)));
    },
    consumeDemoMode: function(arg1) {
      var onDidStart, onDidStop, onWillAddItem;
      onWillAddItem = arg1.onWillAddItem, onDidStart = arg1.onDidStart, onDidStop = arg1.onDidStop;
      return this.subscribe(onDidStart(function() {
        return globalState.set('demoModeIsActive', true);
      }), onDidStop(function() {
        return globalState.set('demoModeIsActive', false);
      }), onWillAddItem((function(_this) {
        return function(arg2) {
          var commandElement, element, event, item;
          item = arg2.item, event = arg2.event;
          if (event.binding.command.startsWith('vim-mode-plus:')) {
            commandElement = item.getElementsByClassName('command')[0];
            commandElement.textContent = commandElement.textContent.replace(/^vim-mode-plus:/, '');
          }
          element = document.createElement('span');
          element.classList.add('kind', 'pull-right');
          element.textContent = _this.getKindForCommand(event.binding.command);
          return item.appendChild(element);
        };
      })(this)));
    },
    getKindForCommand: function(command) {
      var kind, ref2;
      if (command.startsWith('vim-mode-plus')) {
        command = command.replace(/^vim-mode-plus:/, '');
        if (command.startsWith('operator-modifier')) {
          return kind = 'op-modifier';
        } else {
          return (ref2 = Base.getKindForCommandName(command)) != null ? ref2 : 'vmp-other';
        }
      } else {
        return 'non-vmp';
      }
    },
    getGlobalState: function() {
      return globalState;
    },
    getEditorState: function(editor) {
      return VimState.getByEditor(editor);
    },
    provideVimModePlus: function() {
      return {
        Base: Base,
        getGlobalState: this.getGlobalState.bind(this),
        getEditorState: this.getEditorState.bind(this),
        observeVimStates: this.observeVimStates.bind(this),
        onDidAddVimState: this.onDidAddVimState.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwrSkFBQTtJQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosTUFBNkMsT0FBQSxDQUFRLE1BQVIsQ0FBN0MsRUFBQywyQkFBRCxFQUFhLHFCQUFiLEVBQXNCOztFQUV0QixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHNCQUFSOztFQUNuQixXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsT0FBbUQsT0FBQSxDQUFRLFNBQVIsQ0FBbkQsRUFBQyxzQ0FBRCxFQUFrQixnQ0FBbEIsRUFBZ0M7O0VBRWhDLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQVEsUUFBUSxDQUFDLE1BQWpCO0lBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFJO01BQ3hCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLE9BQUEsR0FBVSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtNQUNWLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLENBQVg7TUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSx3QkFBRCxDQUFBO01BRUEsSUFBRyxJQUFJLENBQUMsVUFBTCxDQUFBLENBQUg7UUFDRSxRQUFRLENBQUMsR0FBVCxDQUFhLGlCQUFiLEVBQWdDLElBQWhDLEVBREY7O01BR0EsSUFB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Qjs7SUFEa0IsQ0EzT3BCOztBQVpGIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxue0Rpc3Bvc2FibGUsIEVtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcblN0YXR1c0Jhck1hbmFnZXIgPSByZXF1aXJlICcuL3N0YXR1cy1iYXItbWFuYWdlcidcbmdsb2JhbFN0YXRlID0gcmVxdWlyZSAnLi9nbG9iYWwtc3RhdGUnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5WaW1TdGF0ZSA9IHJlcXVpcmUgJy4vdmltLXN0YXRlJ1xue2ZvckVhY2hQYW5lQXhpcywgYWRkQ2xhc3NMaXN0LCByZW1vdmVDbGFzc0xpc3R9ID0gcmVxdWlyZSAnLi91dGlscydcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6IHNldHRpbmdzLmNvbmZpZ1xuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdGF0dXNCYXJNYW5hZ2VyID0gbmV3IFN0YXR1c0Jhck1hbmFnZXJcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG5cbiAgICBzZXJ2aWNlID0gQHByb3ZpZGVWaW1Nb2RlUGx1cygpXG4gICAgQHN1YnNjcmliZShCYXNlLmluaXQoc2VydmljZSkpXG4gICAgQHJlZ2lzdGVyQ29tbWFuZHMoKVxuICAgIEByZWdpc3RlclZpbVN0YXRlQ29tbWFuZHMoKVxuXG4gICAgaWYgYXRvbS5pblNwZWNNb2RlKClcbiAgICAgIHNldHRpbmdzLnNldCgnc3RyaWN0QXNzZXJ0aW9uJywgdHJ1ZSlcblxuICAgIGlmIGF0b20uaW5EZXZNb2RlKClcbiAgICAgIGRldmVsb3BlciA9IG5ldyAocmVxdWlyZSAnLi9kZXZlbG9wZXInKVxuICAgICAgQHN1YnNjcmliZShkZXZlbG9wZXIuaW5pdChzZXJ2aWNlKSlcblxuICAgIEBzdWJzY3JpYmUgQG9ic2VydmVWaW1Nb2RlIC0+XG4gICAgICBtZXNzYWdlID0gXCJcIlwiXG4gICAgICAgICMjIE1lc3NhZ2UgYnkgdmltLW1vZGUtcGx1czogdmltLW1vZGUgZGV0ZWN0ZWQhXG4gICAgICAgIFRvIHVzZSB2aW0tbW9kZS1wbHVzLCB5b3UgbXVzdCAqKmRpc2FibGUgdmltLW1vZGUqKiBtYW51YWxseS5cbiAgICAgICAgXCJcIlwiXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhtZXNzYWdlLCBkaXNtaXNzYWJsZTogdHJ1ZSlcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICByZXR1cm4gaWYgZWRpdG9yLmlzTWluaSgpXG4gICAgICB2aW1TdGF0ZSA9IG5ldyBWaW1TdGF0ZShlZGl0b3IsIEBzdGF0dXNCYXJNYW5hZ2VyLCBnbG9iYWxTdGF0ZSlcbiAgICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1hZGQtdmltLXN0YXRlJywgdmltU3RhdGUpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZShAZGVtYXhpbWl6ZVBhbmUuYmluZCh0aGlzKSlcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSAtPlxuICAgICAgaWYgc2V0dGluZ3MuZ2V0KCdhdXRvbWF0aWNhbGx5RXNjYXBlSW5zZXJ0TW9kZU9uQWN0aXZlUGFuZUl0ZW1DaGFuZ2UnKVxuICAgICAgICBWaW1TdGF0ZS5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgICAgICB2aW1TdGF0ZS5hY3RpdmF0ZSgnbm9ybWFsJykgaWYgdmltU3RhdGUubW9kZSBpcyAnaW5zZXJ0J1xuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vbkRpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtIChpdGVtKSA9PlxuICAgICAgaWYgYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKGl0ZW0pXG4gICAgICAgICMgU3RpbGwgdGhlcmUgaXMgcG9zc2liaWxpdHkgZWRpdG9yIGlzIGRlc3Ryb3llZCBhbmQgZG9uJ3QgaGF2ZSBjb3JyZXNwb25kaW5nXG4gICAgICAgICMgdmltU3RhdGUgIzE5Ni5cbiAgICAgICAgQGdldEVkaXRvclN0YXRlKGl0ZW0pPy5oaWdobGlnaHRTZWFyY2gucmVmcmVzaCgpXG5cbiAgICBAc3Vic2NyaWJlIHNldHRpbmdzLm9ic2VydmUgJ2hpZ2hsaWdodFNlYXJjaCcsIChuZXdWYWx1ZSkgLT5cbiAgICAgIGlmIG5ld1ZhbHVlXG4gICAgICAgICMgUmUtc2V0dGluZyB2YWx1ZSB0cmlnZ2VyIGhpZ2hsaWdodFNlYXJjaCByZWZyZXNoXG4gICAgICAgIGdsb2JhbFN0YXRlLnNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIGdsb2JhbFN0YXRlLmdldCgnbGFzdFNlYXJjaFBhdHRlcm4nKSlcbiAgICAgIGVsc2VcbiAgICAgICAgZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbnVsbClcblxuICBvYnNlcnZlVmltTW9kZTogKGZuKSAtPlxuICAgIGZuKCkgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUoJ3ZpbS1tb2RlJylcbiAgICBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlIChwYWNrKSAtPlxuICAgICAgZm4oKSBpZiBwYWNrLm5hbWUgaXMgJ3ZpbS1tb2RlJ1xuXG4gICMgKiBgZm5gIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdoZW4gdmltU3RhdGUgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQuXG4gICMgIFVzYWdlOlxuICAjICAgb25EaWRBZGRWaW1TdGF0ZSAodmltU3RhdGUpIC0+IGRvIHNvbWV0aGluZy4uXG4gICMgUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWRBZGRWaW1TdGF0ZTogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWFkZC12aW0tc3RhdGUnLCBmbilcblxuICAjICogYGZuYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aXRoIGFsbCBjdXJyZW50IGFuZCBmdXR1cmUgdmltU3RhdGVcbiAgIyAgVXNhZ2U6XG4gICMgICBvYnNlcnZlVmltU3RhdGVzICh2aW1TdGF0ZSkgLT4gZG8gc29tZXRoaW5nLi5cbiAgIyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvYnNlcnZlVmltU3RhdGVzOiAoZm4pIC0+XG4gICAgVmltU3RhdGUuZm9yRWFjaChmbilcbiAgICBAb25EaWRBZGRWaW1TdGF0ZShmbilcblxuICBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25Gb3JFZGl0b3JzOiAtPlxuICAgIGZvciBlZGl0b3IgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKVxuICAgICAgQGdldEVkaXRvclN0YXRlKGVkaXRvcikuY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9ucygpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBWaW1TdGF0ZS5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgIHZpbVN0YXRlLmRlc3Ryb3koKVxuICAgIFZpbVN0YXRlLmNsZWFyKClcblxuICBzdWJzY3JpYmU6IChhcmcpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkKGFyZylcblxuICB1bnN1YnNjcmliZTogKGFyZykgLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUoYXJnKVxuXG4gIHJlZ2lzdGVyQ29tbWFuZHM6IC0+XG4gICAgQHN1YnNjcmliZSBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsXG4gICAgICAndmltLW1vZGUtcGx1czpjbGVhci1oaWdobGlnaHQtc2VhcmNoJzogLT4gZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbnVsbClcbiAgICAgICd2aW0tbW9kZS1wbHVzOnRvZ2dsZS1oaWdobGlnaHQtc2VhcmNoJzogLT4gc2V0dGluZ3MudG9nZ2xlKCdoaWdobGlnaHRTZWFyY2gnKVxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6Y2xlYXItcGVyc2lzdGVudC1zZWxlY3Rpb24nOiA9PiBAY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uRm9yRWRpdG9ycygpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAndmltLW1vZGUtcGx1czptYXhpbWl6ZS1wYW5lJzogPT4gQG1heGltaXplUGFuZSgpXG4gICAgICAndmltLW1vZGUtcGx1czplcXVhbGl6ZS1wYW5lcyc6ID0+IEBlcXVhbGl6ZVBhbmVzKClcblxuICBkZW1heGltaXplUGFuZTogLT5cbiAgICBpZiBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZT9cbiAgICAgIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgQHVuc3Vic2NyaWJlKEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlKVxuICAgICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUgPSBudWxsXG5cbiAgbWF4aW1pemVQYW5lOiAtPlxuICAgIGlmIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlP1xuICAgICAgQGRlbWF4aW1pemVQYW5lKClcbiAgICAgIHJldHVyblxuXG4gICAgZ2V0VmlldyA9IChtb2RlbCkgLT4gYXRvbS52aWV3cy5nZXRWaWV3KG1vZGVsKVxuICAgIGNsYXNzUGFuZU1heGltaXplZCA9ICd2aW0tbW9kZS1wbHVzLS1wYW5lLW1heGltaXplZCdcbiAgICBjbGFzc0hpZGVUYWJCYXIgPSAndmltLW1vZGUtcGx1cy0taGlkZS10YWItYmFyJ1xuICAgIGNsYXNzSGlkZVN0YXR1c0JhciA9ICd2aW0tbW9kZS1wbHVzLS1oaWRlLXN0YXR1cy1iYXInXG4gICAgY2xhc3NBY3RpdmVQYW5lQXhpcyA9ICd2aW0tbW9kZS1wbHVzLS1hY3RpdmUtcGFuZS1heGlzJ1xuXG4gICAgd29ya3NwYWNlRWxlbWVudCA9IGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgcGFuZUVsZW1lbnQgPSBnZXRWaWV3KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKSlcblxuICAgIHdvcmtzcGFjZUNsYXNzTmFtZXMgPSBbY2xhc3NQYW5lTWF4aW1pemVkXVxuICAgIHdvcmtzcGFjZUNsYXNzTmFtZXMucHVzaChjbGFzc0hpZGVUYWJCYXIpIGlmIHNldHRpbmdzLmdldCgnaGlkZVRhYkJhck9uTWF4aW1pemVQYW5lJylcbiAgICB3b3Jrc3BhY2VDbGFzc05hbWVzLnB1c2goY2xhc3NIaWRlU3RhdHVzQmFyKSBpZiBzZXR0aW5ncy5nZXQoJ2hpZGVTdGF0dXNCYXJPbk1heGltaXplUGFuZScpXG5cbiAgICBhZGRDbGFzc0xpc3Qod29ya3NwYWNlRWxlbWVudCwgd29ya3NwYWNlQ2xhc3NOYW1lcy4uLilcblxuICAgIGZvckVhY2hQYW5lQXhpcyAoYXhpcykgLT5cbiAgICAgIHBhbmVBeGlzRWxlbWVudCA9IGdldFZpZXcoYXhpcylcbiAgICAgIGlmIHBhbmVBeGlzRWxlbWVudC5jb250YWlucyhwYW5lRWxlbWVudClcbiAgICAgICAgYWRkQ2xhc3NMaXN0KHBhbmVBeGlzRWxlbWVudCwgY2xhc3NBY3RpdmVQYW5lQXhpcylcblxuICAgIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlID0gbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgIGZvckVhY2hQYW5lQXhpcyAoYXhpcykgLT5cbiAgICAgICAgcmVtb3ZlQ2xhc3NMaXN0KGdldFZpZXcoYXhpcyksIGNsYXNzQWN0aXZlUGFuZUF4aXMpXG4gICAgICByZW1vdmVDbGFzc0xpc3Qod29ya3NwYWNlRWxlbWVudCwgd29ya3NwYWNlQ2xhc3NOYW1lcy4uLilcblxuICAgIEBzdWJzY3JpYmUoQG1heGltaXplUGFuZURpc3Bvc2FibGUpXG5cbiAgZXF1YWxpemVQYW5lczogLT5cbiAgICBzZXRGbGV4U2NhbGUgPSAobmV3VmFsdWUsIGJhc2UpIC0+XG4gICAgICBiYXNlID89IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5nZXRDb250YWluZXIoKS5nZXRSb290KClcbiAgICAgIGJhc2Uuc2V0RmxleFNjYWxlKG5ld1ZhbHVlKVxuICAgICAgZm9yIGNoaWxkIGluIGJhc2UuY2hpbGRyZW4gPyBbXVxuICAgICAgICBzZXRGbGV4U2NhbGUobmV3VmFsdWUsIGNoaWxkKVxuXG4gICAgc2V0RmxleFNjYWxlKDEpXG5cbiAgcmVnaXN0ZXJWaW1TdGF0ZUNvbW1hbmRzOiAtPlxuICAgICMgYWxsIGNvbW1hbmRzIGhlcmUgaXMgZXhlY3V0ZWQgd2l0aCBjb250ZXh0IHdoZXJlICd0aGlzJyBib3VuZCB0byAndmltU3RhdGUnXG4gICAgY29tbWFuZHMgPVxuICAgICAgJ2FjdGl2YXRlLW5vcm1hbC1tb2RlJzogLT4gQGFjdGl2YXRlKCdub3JtYWwnKVxuICAgICAgJ2FjdGl2YXRlLWxpbmV3aXNlLXZpc3VhbC1tb2RlJzogLT4gQGFjdGl2YXRlKCd2aXN1YWwnLCAnbGluZXdpc2UnKVxuICAgICAgJ2FjdGl2YXRlLWNoYXJhY3Rlcndpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJylcbiAgICAgICdhY3RpdmF0ZS1ibG9ja3dpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgJ3Jlc2V0LW5vcm1hbC1tb2RlJzogLT4gQHJlc2V0Tm9ybWFsTW9kZSh1c2VySW52b2NhdGlvbjogdHJ1ZSlcbiAgICAgICdzZXQtcmVnaXN0ZXItbmFtZSc6IC0+IEByZWdpc3Rlci5zZXROYW1lKCkgIyBcIlxuICAgICAgJ3NldC1yZWdpc3Rlci1uYW1lLXRvLV8nOiAtPiBAcmVnaXN0ZXIuc2V0TmFtZSgnXycpXG4gICAgICAnc2V0LXJlZ2lzdGVyLW5hbWUtdG8tKic6IC0+IEByZWdpc3Rlci5zZXROYW1lKCcqJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1jaGFyYWN0ZXJ3aXNlJzogLT4gQGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyKHdpc2U6ICdjaGFyYWN0ZXJ3aXNlJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1saW5ld2lzZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcih3aXNlOiAnbGluZXdpc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLW9jY3VycmVuY2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIob2NjdXJyZW5jZTogdHJ1ZSwgb2NjdXJyZW5jZVR5cGU6ICdiYXNlJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1zdWJ3b3JkLW9jY3VycmVuY2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIob2NjdXJyZW5jZTogdHJ1ZSwgb2NjdXJyZW5jZVR5cGU6ICdzdWJ3b3JkJylcbiAgICAgICdyZXBlYXQnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuUmVjb3JkZWQoKVxuICAgICAgJ3JlcGVhdC1maW5kJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRGaW5kKClcbiAgICAgICdyZXBlYXQtZmluZC1yZXZlcnNlJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRGaW5kKHJldmVyc2U6IHRydWUpXG4gICAgICAncmVwZWF0LXNlYXJjaCc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5DdXJyZW50U2VhcmNoKClcbiAgICAgICdyZXBlYXQtc2VhcmNoLXJldmVyc2UnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudFNlYXJjaChyZXZlcnNlOiB0cnVlKVxuICAgICAgJ3NldC1jb3VudC0wJzogLT4gQHNldENvdW50KDApXG4gICAgICAnc2V0LWNvdW50LTEnOiAtPiBAc2V0Q291bnQoMSlcbiAgICAgICdzZXQtY291bnQtMic6IC0+IEBzZXRDb3VudCgyKVxuICAgICAgJ3NldC1jb3VudC0zJzogLT4gQHNldENvdW50KDMpXG4gICAgICAnc2V0LWNvdW50LTQnOiAtPiBAc2V0Q291bnQoNClcbiAgICAgICdzZXQtY291bnQtNSc6IC0+IEBzZXRDb3VudCg1KVxuICAgICAgJ3NldC1jb3VudC02JzogLT4gQHNldENvdW50KDYpXG4gICAgICAnc2V0LWNvdW50LTcnOiAtPiBAc2V0Q291bnQoNylcbiAgICAgICdzZXQtY291bnQtOCc6IC0+IEBzZXRDb3VudCg4KVxuICAgICAgJ3NldC1jb3VudC05JzogLT4gQHNldENvdW50KDkpXG5cbiAgICBjaGFycyA9IFszMi4uMTI2XS5tYXAgKGNvZGUpIC0+IFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZSlcbiAgICBmb3IgY2hhciBpbiBjaGFyc1xuICAgICAgZG8gKGNoYXIpIC0+XG4gICAgICAgIGNoYXJGb3JLZXltYXAgPSBpZiBjaGFyIGlzICcgJyB0aGVuICdzcGFjZScgZWxzZSBjaGFyXG4gICAgICAgIGNvbW1hbmRzW1wic2V0LWlucHV0LWNoYXItI3tjaGFyRm9yS2V5bWFwfVwiXSA9IC0+XG4gICAgICAgICAgQGVtaXREaWRTZXRJbnB1dENoYXIoY2hhcilcblxuICAgIGdldEVkaXRvclN0YXRlID0gQGdldEVkaXRvclN0YXRlLmJpbmQodGhpcylcblxuICAgIGJpbmRUb1ZpbVN0YXRlID0gKG9sZENvbW1hbmRzKSAtPlxuICAgICAgbmV3Q29tbWFuZHMgPSB7fVxuICAgICAgZm9yIG5hbWUsIGZuIG9mIG9sZENvbW1hbmRzXG4gICAgICAgIGRvIChmbikgLT5cbiAgICAgICAgICBuZXdDb21tYW5kc1tcInZpbS1tb2RlLXBsdXM6I3tuYW1lfVwiXSA9IChldmVudCkgLT5cbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICBpZiB2aW1TdGF0ZSA9IGdldEVkaXRvclN0YXRlKEBnZXRNb2RlbCgpKVxuICAgICAgICAgICAgICBmbi5jYWxsKHZpbVN0YXRlLCBldmVudClcbiAgICAgIG5ld0NvbW1hbmRzXG5cbiAgICBAc3Vic2NyaWJlIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yOm5vdChbbWluaV0pJywgYmluZFRvVmltU3RhdGUoY29tbWFuZHMpKVxuXG4gIGNvbnN1bWVTdGF0dXNCYXI6IChzdGF0dXNCYXIpIC0+XG4gICAgQHN0YXR1c0Jhck1hbmFnZXIuaW5pdGlhbGl6ZShzdGF0dXNCYXIpXG4gICAgQHN0YXR1c0Jhck1hbmFnZXIuYXR0YWNoKClcbiAgICBAc3Vic2NyaWJlIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAc3RhdHVzQmFyTWFuYWdlci5kZXRhY2goKVxuXG4gIGNvbnN1bWVEZW1vTW9kZTogKHtvbldpbGxBZGRJdGVtLCBvbkRpZFN0YXJ0LCBvbkRpZFN0b3B9KSAtPlxuICAgIEBzdWJzY3JpYmUoXG4gICAgICBvbkRpZFN0YXJ0KC0+IGdsb2JhbFN0YXRlLnNldCgnZGVtb01vZGVJc0FjdGl2ZScsIHRydWUpKVxuICAgICAgb25EaWRTdG9wKC0+IGdsb2JhbFN0YXRlLnNldCgnZGVtb01vZGVJc0FjdGl2ZScsIGZhbHNlKSlcbiAgICAgIG9uV2lsbEFkZEl0ZW0oKHtpdGVtLCBldmVudH0pID0+XG4gICAgICAgIGlmIGV2ZW50LmJpbmRpbmcuY29tbWFuZC5zdGFydHNXaXRoKCd2aW0tbW9kZS1wbHVzOicpXG4gICAgICAgICAgY29tbWFuZEVsZW1lbnQgPSBpdGVtLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NvbW1hbmQnKVswXVxuICAgICAgICAgIGNvbW1hbmRFbGVtZW50LnRleHRDb250ZW50ID0gY29tbWFuZEVsZW1lbnQudGV4dENvbnRlbnQucmVwbGFjZSgvXnZpbS1tb2RlLXBsdXM6LywgJycpXG5cbiAgICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2tpbmQnLCAncHVsbC1yaWdodCcpXG4gICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSBAZ2V0S2luZEZvckNvbW1hbmQoZXZlbnQuYmluZGluZy5jb21tYW5kKVxuICAgICAgICBpdGVtLmFwcGVuZENoaWxkKGVsZW1lbnQpXG4gICAgICApXG4gICAgKVxuXG4gIGdldEtpbmRGb3JDb21tYW5kOiAoY29tbWFuZCkgLT5cbiAgICBpZiBjb21tYW5kLnN0YXJ0c1dpdGgoJ3ZpbS1tb2RlLXBsdXMnKVxuICAgICAgY29tbWFuZCA9IGNvbW1hbmQucmVwbGFjZSgvXnZpbS1tb2RlLXBsdXM6LywgJycpXG4gICAgICBpZiBjb21tYW5kLnN0YXJ0c1dpdGgoJ29wZXJhdG9yLW1vZGlmaWVyJylcbiAgICAgICAga2luZCA9ICdvcC1tb2RpZmllcidcbiAgICAgIGVsc2VcbiAgICAgICAgQmFzZS5nZXRLaW5kRm9yQ29tbWFuZE5hbWUoY29tbWFuZCkgPyAndm1wLW90aGVyJ1xuICAgIGVsc2VcbiAgICAgICdub24tdm1wJ1xuXG4gICMgU2VydmljZSBBUElcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGdldEdsb2JhbFN0YXRlOiAtPlxuICAgIGdsb2JhbFN0YXRlXG5cbiAgZ2V0RWRpdG9yU3RhdGU6IChlZGl0b3IpIC0+XG4gICAgVmltU3RhdGUuZ2V0QnlFZGl0b3IoZWRpdG9yKVxuXG4gIHByb3ZpZGVWaW1Nb2RlUGx1czogLT5cbiAgICBCYXNlOiBCYXNlXG4gICAgZ2V0R2xvYmFsU3RhdGU6IEBnZXRHbG9iYWxTdGF0ZS5iaW5kKHRoaXMpXG4gICAgZ2V0RWRpdG9yU3RhdGU6IEBnZXRFZGl0b3JTdGF0ZS5iaW5kKHRoaXMpXG4gICAgb2JzZXJ2ZVZpbVN0YXRlczogQG9ic2VydmVWaW1TdGF0ZXMuYmluZCh0aGlzKVxuICAgIG9uRGlkQWRkVmltU3RhdGU6IEBvbkRpZEFkZFZpbVN0YXRlLmJpbmQodGhpcylcbiJdfQ==
