(function() {
  var Base, CompositeDisposable, Disposable, Emitter, VimState, forEachPaneAxis, globalState, ref, settings,
    slice = [].slice;

  ref = require('atom'), Disposable = ref.Disposable, Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  globalState = require('./global-state');

  settings = require('./settings');

  VimState = require('./vim-state');

  forEachPaneAxis = null;

  module.exports = {
    config: settings.config,
    getStatusBarManager: function() {
      return this.statusBarManager != null ? this.statusBarManager : this.statusBarManager = new (require('./status-bar-manager'));
    },
    activate: function(state) {
      var developer, getEditorState;
      this.subscriptions = new CompositeDisposable;
      this.emitter = new Emitter;
      getEditorState = this.getEditorState.bind(this);
      this.subscribe.apply(this, Base.init(getEditorState));
      this.registerCommands();
      this.registerVimStateCommands();
      settings.notifyDeprecatedParams();
      if (atom.inSpecMode()) {
        settings.set('strictAssertion', true);
      }
      if (atom.inDevMode()) {
        developer = new (require('./developer'));
        this.subscribe(developer.init(getEditorState));
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
          if (!editor.isMini()) {
            return _this.createVimState(editor);
          }
        };
      })(this)));
      this.subscribe(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          return _this.demaximizePane();
        };
      })(this)));
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
          var ref1, vimState;
          if (atom.workspace.isTextEditor(item) && !item.isMini()) {
            vimState = _this.getEditorState(item);
            if (vimState == null) {
              return;
            }
            if (globalState.get('highlightSearchPattern')) {
              return vimState.highlightSearch.refresh();
            } else {
              return (ref1 = vimState.getProp('highlightSearch')) != null ? ref1.refresh() : void 0;
            }
          }
        };
      })(this)));
      this.subscribe(globalState.onDidChange(function(arg1) {
        var name, newValue;
        name = arg1.name, newValue = arg1.newValue;
        if (name === 'highlightSearchPattern') {
          if (newValue) {
            return VimState.forEach(function(vimState) {
              return vimState.highlightSearch.refresh();
            });
          } else {
            return VimState.forEach(function(vimState) {
              if (vimState.__highlightSearch) {
                return vimState.highlightSearch.clearMarkers();
              }
            });
          }
        }
      }));
      this.subscribe(settings.observe('highlightSearch', function(newValue) {
        if (newValue) {
          return globalState.set('highlightSearchPattern', globalState.get('lastSearchPattern'));
        } else {
          return globalState.set('highlightSearchPattern', null);
        }
      }));
      this.subscribe.apply(this, settings.observeConditionalKeymaps());
      if (settings.get('debug')) {
        return developer != null ? developer.reportRequireCache({
          excludeNodModules: false
        }) : void 0;
      }
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
      if (VimState != null) {
        VimState.forEach(fn);
      }
      return this.onDidAddVimState(fn);
    },
    clearPersistentSelectionForEditors: function() {
      var editor, i, len, ref1, results;
      ref1 = atom.workspace.getTextEditors();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        editor = ref1[i];
        results.push(this.getEditorState(editor).clearPersistentSelections());
      }
      return results;
    },
    deactivate: function() {
      this.subscriptions.dispose();
      if (VimState != null) {
        VimState.forEach(function(vimState) {
          return vimState.destroy();
        });
      }
      return VimState != null ? VimState.clear() : void 0;
    },
    subscribe: function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.subscriptions).add.apply(ref1, args);
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
      var activePane, activePaneElement, addClassList, root, workspaceClassList;
      if (this.maximizePaneDisposable != null) {
        this.demaximizePane();
        return;
      }
      this.maximizePaneDisposable = new CompositeDisposable;
      addClassList = (function(_this) {
        return function(element, classList) {
          var ref1;
          classList = classList.map(function(className) {
            return "vim-mode-plus--" + className;
          });
          (ref1 = element.classList).add.apply(ref1, classList);
          return _this.maximizePaneDisposable.add(new Disposable(function() {
            var ref2;
            return (ref2 = element.classList).remove.apply(ref2, classList);
          }));
        };
      })(this);
      workspaceClassList = ['pane-maximized'];
      if (settings.get('hideTabBarOnMaximizePane')) {
        workspaceClassList.push('hide-tab-bar');
      }
      if (settings.get('hideStatusBarOnMaximizePane')) {
        workspaceClassList.push('hide-status-bar');
      }
      addClassList(atom.views.getView(atom.workspace), workspaceClassList);
      activePane = atom.workspace.getActivePane();
      activePaneElement = atom.views.getView(activePane);
      addClassList(activePaneElement, ['active-pane']);
      if (forEachPaneAxis == null) {
        forEachPaneAxis = require('./utils').forEachPaneAxis;
      }
      root = activePane.getContainer().getRoot();
      forEachPaneAxis(root, function(axis) {
        var paneAxisElement;
        paneAxisElement = atom.views.getView(axis);
        if (paneAxisElement.contains(activePaneElement)) {
          return addClassList(paneAxisElement, ['active-pane-axis']);
        }
      });
      return this.subscribe(this.maximizePaneDisposable);
    },
    equalizePanes: function() {
      var setFlexScale;
      setFlexScale = function(root, newValue) {
        var child, i, len, ref1, ref2, results;
        root.setFlexScale(newValue);
        ref2 = (ref1 = root.children) != null ? ref1 : [];
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          child = ref2[i];
          results.push(setFlexScale(child, newValue));
        }
        return results;
      };
      return setFlexScale(atom.workspace.getActivePane().getContainer().getRoot(), 1);
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
      var statusBarManager;
      statusBarManager = this.getStatusBarManager();
      statusBarManager.initialize(statusBar);
      statusBarManager.attach();
      return this.subscribe(new Disposable(function() {
        return statusBarManager.detach();
      }));
    },
    consumeDemoMode: function(arg1) {
      var onDidRemoveHover, onDidStart, onDidStop, onWillAddItem;
      onWillAddItem = arg1.onWillAddItem, onDidStart = arg1.onDidStart, onDidStop = arg1.onDidStop, onDidRemoveHover = arg1.onDidRemoveHover;
      return this.subscribe(onDidStart(function() {
        return globalState.set('demoModeIsActive', true);
      }), onDidStop(function() {
        return globalState.set('demoModeIsActive', false);
      }), onDidRemoveHover(this.destroyAllDemoModeFlasheMarkers.bind(this)), onWillAddItem((function(_this) {
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
    destroyAllDemoModeFlasheMarkers: function() {
      return VimState != null ? VimState.forEach(function(vimState) {
        return vimState.flashManager.destroyDemoModeMarkers();
      }) : void 0;
    },
    getKindForCommand: function(command) {
      var kind, ref1;
      if (command.startsWith('vim-mode-plus')) {
        command = command.replace(/^vim-mode-plus:/, '');
        if (command.startsWith('operator-modifier')) {
          return kind = 'op-modifier';
        } else {
          return (ref1 = Base.getKindForCommandName(command)) != null ? ref1 : 'vmp-other';
        }
      } else {
        return 'non-vmp';
      }
    },
    createVimState: function(editor) {
      var vimState;
      vimState = new VimState(editor, this.getStatusBarManager(), globalState);
      return this.emitter.emit('did-add-vim-state', vimState);
    },
    createVimStateIfNecessary: function(editor) {
      var vimState;
      if (VimState.has(editor)) {
        return;
      }
      vimState = new VimState(editor, this.getStatusBarManager(), globalState);
      return this.emitter.emit('did-add-vim-state', vimState);
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
        registerCommandFromSpec: Base.registerCommandFromSpec,
        getGlobalState: this.getGlobalState,
        getEditorState: this.getEditorState,
        observeVimStates: this.observeVimStates.bind(this),
        onDidAddVimState: this.onDidAddVimState.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxR0FBQTtJQUFBOztFQUFBLE1BQTZDLE9BQUEsQ0FBUSxNQUFSLENBQTdDLEVBQUMsMkJBQUQsRUFBYSxxQkFBYixFQUFzQjs7RUFFdEIsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxlQUFBLEdBQWtCOztFQUVsQixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUFRLFFBQVEsQ0FBQyxNQUFqQjtJQUVBLG1CQUFBLEVBQXFCLFNBQUE7NkNBQ25CLElBQUMsQ0FBQSxtQkFBRCxJQUFDLENBQUEsbUJBQW9CLElBQUksQ0FBQyxPQUFBLENBQVEsc0JBQVIsQ0FBRDtJQUROLENBRnJCO0lBS0EsUUFBQSxFQUFVLFNBQUMsS0FBRDtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLGNBQUEsR0FBaUIsSUFBQyxDQUFBLGNBQWMsQ0FBQyxJQUFoQixDQUFxQixJQUFyQjtNQUNqQixJQUFDLENBQUEsU0FBRCxhQUFXLElBQUksQ0FBQyxJQUFMLENBQVUsY0FBVixDQUFYO01BQ0EsSUFBQyxDQUFBLGdCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsd0JBQUQsQ0FBQTtNQUVBLFFBQVEsQ0FBQyxzQkFBVCxDQUFBO01BRUEsSUFBRyxJQUFJLENBQUMsVUFBTCxDQUFBLENBQUg7UUFDRSxRQUFRLENBQUMsR0FBVCxDQUFhLGlCQUFiLEVBQWdDLElBQWhDLEVBREY7O01BR0Es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LENBblFoQjtJQXVRQSx5QkFBQSxFQUEyQixTQUFDLE1BQUQ7QUFDekIsVUFBQTtNQUFBLElBQVUsUUFBUSxDQUFDLEdBQVQsQ0FBYSxNQUFiLENBQVY7QUFBQSxlQUFBOztNQUNBLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FBUyxNQUFULEVBQWlCLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQWpCLEVBQXlDLFdBQXpDO2FBQ2YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsbUJBQWQsRUFBbUMsUUFBbkM7SUFIeUIsQ0F2UTNCO0lBOFFBLGNBQUEsRUFBZ0IsU0FBQTthQUNkO0lBRGMsQ0E5UWhCO0lBaVJBLGNBQUEsRUFBZ0IsU0FBQyxNQUFEO2FBQ2QsUUFBUSxDQUFDLFdBQVQsQ0FBcUIsTUFBckI7SUFEYyxDQWpSaEI7SUFvUkEsa0JBQUEsRUFBb0IsU0FBQTthQUNsQjtRQUFBLElBQUEsRUFBTSxJQUFOO1FBQ0EsdUJBQUEsRUFBeUIsSUFBSSxDQUFDLHVCQUQ5QjtRQUVBLGNBQUEsRUFBZ0IsSUFBQyxDQUFBLGNBRmpCO1FBR0EsY0FBQSxFQUFnQixJQUFDLENBQUEsY0FIakI7UUFJQSxnQkFBQSxFQUFrQixJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FKbEI7UUFLQSxnQkFBQSxFQUFrQixJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FMbEI7O0lBRGtCLENBcFJwQjs7QUFURiIsInNvdXJjZXNDb250ZW50IjpbIntEaXNwb3NhYmxlLCBFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5nbG9iYWxTdGF0ZSA9IHJlcXVpcmUgJy4vZ2xvYmFsLXN0YXRlJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuVmltU3RhdGUgPSByZXF1aXJlICcuL3ZpbS1zdGF0ZSdcbmZvckVhY2hQYW5lQXhpcyA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6IHNldHRpbmdzLmNvbmZpZ1xuXG4gIGdldFN0YXR1c0Jhck1hbmFnZXI6IC0+XG4gICAgQHN0YXR1c0Jhck1hbmFnZXIgPz0gbmV3IChyZXF1aXJlICcuL3N0YXR1cy1iYXItbWFuYWdlcicpXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAgZ2V0RWRpdG9yU3RhdGUgPSBAZ2V0RWRpdG9yU3RhdGUuYmluZCh0aGlzKVxuICAgIEBzdWJzY3JpYmUoQmFzZS5pbml0KGdldEVkaXRvclN0YXRlKS4uLilcbiAgICBAcmVnaXN0ZXJDb21tYW5kcygpXG4gICAgQHJlZ2lzdGVyVmltU3RhdGVDb21tYW5kcygpXG5cbiAgICBzZXR0aW5ncy5ub3RpZnlEZXByZWNhdGVkUGFyYW1zKClcblxuICAgIGlmIGF0b20uaW5TcGVjTW9kZSgpXG4gICAgICBzZXR0aW5ncy5zZXQoJ3N0cmljdEFzc2VydGlvbicsIHRydWUpXG5cbiAgICBpZiBhdG9tLmluRGV2TW9kZSgpXG4gICAgICBkZXZlbG9wZXIgPSBuZXcgKHJlcXVpcmUgJy4vZGV2ZWxvcGVyJylcbiAgICAgIEBzdWJzY3JpYmUoZGV2ZWxvcGVyLmluaXQoZ2V0RWRpdG9yU3RhdGUpKVxuXG4gICAgQHN1YnNjcmliZSBAb2JzZXJ2ZVZpbU1vZGUgLT5cbiAgICAgIG1lc3NhZ2UgPSBcIlwiXCJcbiAgICAgICAgIyMgTWVzc2FnZSBieSB2aW0tbW9kZS1wbHVzOiB2aW0tbW9kZSBkZXRlY3RlZCFcbiAgICAgICAgVG8gdXNlIHZpbS1tb2RlLXBsdXMsIHlvdSBtdXN0ICoqZGlzYWJsZSB2aW0tbW9kZSoqIG1hbnVhbGx5LlxuICAgICAgICBcIlwiXCJcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKG1lc3NhZ2UsIGRpc21pc3NhYmxlOiB0cnVlKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIEBjcmVhdGVWaW1TdGF0ZShlZGl0b3IpIHVubGVzcyBlZGl0b3IuaXNNaW5pKClcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSA9PlxuICAgICAgQGRlbWF4aW1pemVQYW5lKClcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSAtPlxuICAgICAgaWYgc2V0dGluZ3MuZ2V0KCdhdXRvbWF0aWNhbGx5RXNjYXBlSW5zZXJ0TW9kZU9uQWN0aXZlUGFuZUl0ZW1DaGFuZ2UnKVxuICAgICAgICBWaW1TdGF0ZS5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgICAgICB2aW1TdGF0ZS5hY3RpdmF0ZSgnbm9ybWFsJykgaWYgdmltU3RhdGUubW9kZSBpcyAnaW5zZXJ0J1xuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vbkRpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtIChpdGVtKSA9PlxuICAgICAgaWYgYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKGl0ZW0pIGFuZCBub3QgaXRlbS5pc01pbmkoKVxuICAgICAgICAjIFN0aWxsIHRoZXJlIGlzIHBvc3NpYmlsaXR5IGVkaXRvciBpcyBkZXN0cm95ZWQgYW5kIGRvbid0IGhhdmUgY29ycmVzcG9uZGluZ1xuICAgICAgICAjIHZpbVN0YXRlICMxOTYuXG4gICAgICAgIHZpbVN0YXRlID0gQGdldEVkaXRvclN0YXRlKGl0ZW0pXG4gICAgICAgIHJldHVybiB1bmxlc3MgdmltU3RhdGU/XG4gICAgICAgIGlmIGdsb2JhbFN0YXRlLmdldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicpXG4gICAgICAgICAgdmltU3RhdGUuaGlnaGxpZ2h0U2VhcmNoLnJlZnJlc2goKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgdmltU3RhdGUuZ2V0UHJvcCgnaGlnaGxpZ2h0U2VhcmNoJyk/LnJlZnJlc2goKVxuXG4gICAgIyBAc3Vic2NyaWJlICBnbG9iYWxTdGF0ZS5nZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nKVxuICAgICMgUmVmcmVzaCBoaWdobGlnaHQgYmFzZWQgb24gZ2xvYmFsU3RhdGUuaGlnaGxpZ2h0U2VhcmNoUGF0dGVybiBjaGFuZ2VzLlxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIEBzdWJzY3JpYmUgZ2xvYmFsU3RhdGUub25EaWRDaGFuZ2UgKHtuYW1lLCBuZXdWYWx1ZX0pIC0+XG4gICAgICBpZiBuYW1lIGlzICdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJ1xuICAgICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICAgIFZpbVN0YXRlLmZvckVhY2ggKHZpbVN0YXRlKSAtPlxuICAgICAgICAgICAgdmltU3RhdGUuaGlnaGxpZ2h0U2VhcmNoLnJlZnJlc2goKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgVmltU3RhdGUuZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICAgICAgICAjIGF2b2lkIHBvcHVsYXRlIHByb3AgdW5uZWNlc3NhcmlseSBvbiB2aW1TdGF0ZS5yZXNldCBvbiBzdGFydHVwXG4gICAgICAgICAgICBpZiB2aW1TdGF0ZS5fX2hpZ2hsaWdodFNlYXJjaFxuICAgICAgICAgICAgICB2aW1TdGF0ZS5oaWdobGlnaHRTZWFyY2guY2xlYXJNYXJrZXJzKClcblxuICAgIEBzdWJzY3JpYmUgc2V0dGluZ3Mub2JzZXJ2ZSAnaGlnaGxpZ2h0U2VhcmNoJywgKG5ld1ZhbHVlKSAtPlxuICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgIyBSZS1zZXR0aW5nIHZhbHVlIHRyaWdnZXIgaGlnaGxpZ2h0U2VhcmNoIHJlZnJlc2hcbiAgICAgICAgZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0U2VhcmNoUGF0dGVybicpKVxuICAgICAgZWxzZVxuICAgICAgICBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBudWxsKVxuXG4gICAgQHN1YnNjcmliZShzZXR0aW5ncy5vYnNlcnZlQ29uZGl0aW9uYWxLZXltYXBzKCkuLi4pXG5cbiAgICBpZiBzZXR0aW5ncy5nZXQoJ2RlYnVnJylcbiAgICAgIGRldmVsb3Blcj8ucmVwb3J0UmVxdWlyZUNhY2hlKGV4Y2x1ZGVOb2RNb2R1bGVzOiBmYWxzZSlcblxuICBvYnNlcnZlVmltTW9kZTogKGZuKSAtPlxuICAgIGZuKCkgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUoJ3ZpbS1tb2RlJylcbiAgICBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlIChwYWNrKSAtPlxuICAgICAgZm4oKSBpZiBwYWNrLm5hbWUgaXMgJ3ZpbS1tb2RlJ1xuXG4gICMgKiBgZm5gIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdoZW4gdmltU3RhdGUgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQuXG4gICMgIFVzYWdlOlxuICAjICAgb25EaWRBZGRWaW1TdGF0ZSAodmltU3RhdGUpIC0+IGRvIHNvbWV0aGluZy4uXG4gICMgUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWRBZGRWaW1TdGF0ZTogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWFkZC12aW0tc3RhdGUnLCBmbilcblxuICAjICogYGZuYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aXRoIGFsbCBjdXJyZW50IGFuZCBmdXR1cmUgdmltU3RhdGVcbiAgIyAgVXNhZ2U6XG4gICMgICBvYnNlcnZlVmltU3RhdGVzICh2aW1TdGF0ZSkgLT4gZG8gc29tZXRoaW5nLi5cbiAgIyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvYnNlcnZlVmltU3RhdGVzOiAoZm4pIC0+XG4gICAgVmltU3RhdGU/LmZvckVhY2goZm4pXG4gICAgQG9uRGlkQWRkVmltU3RhdGUoZm4pXG5cbiAgY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uRm9yRWRpdG9yczogLT5cbiAgICBmb3IgZWRpdG9yIGluIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICAgIEBnZXRFZGl0b3JTdGF0ZShlZGl0b3IpLmNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbnMoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgVmltU3RhdGU/LmZvckVhY2ggKHZpbVN0YXRlKSAtPlxuICAgICAgdmltU3RhdGUuZGVzdHJveSgpXG4gICAgVmltU3RhdGU/LmNsZWFyKClcblxuICBzdWJzY3JpYmU6IChhcmdzLi4uKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChhcmdzLi4uKVxuXG4gIHVuc3Vic2NyaWJlOiAoYXJnKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zLnJlbW92ZShhcmcpXG5cbiAgcmVnaXN0ZXJDb21tYW5kczogLT5cbiAgICBAc3Vic2NyaWJlIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yOm5vdChbbWluaV0pJyxcbiAgICAgICd2aW0tbW9kZS1wbHVzOmNsZWFyLWhpZ2hsaWdodC1zZWFyY2gnOiAtPiBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBudWxsKVxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6dG9nZ2xlLWhpZ2hsaWdodC1zZWFyY2gnOiAtPiBzZXR0aW5ncy50b2dnbGUoJ2hpZ2hsaWdodFNlYXJjaCcpXG4gICAgICAndmltLW1vZGUtcGx1czpjbGVhci1wZXJzaXN0ZW50LXNlbGVjdGlvbic6ID0+IEBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25Gb3JFZGl0b3JzKClcblxuICAgIEBzdWJzY3JpYmUgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICd2aW0tbW9kZS1wbHVzOm1heGltaXplLXBhbmUnOiA9PiBAbWF4aW1pemVQYW5lKClcbiAgICAgICd2aW0tbW9kZS1wbHVzOmVxdWFsaXplLXBhbmVzJzogPT4gQGVxdWFsaXplUGFuZXMoKVxuXG4gIGRlbWF4aW1pemVQYW5lOiAtPlxuICAgIGlmIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlP1xuICAgICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICBAdW5zdWJzY3JpYmUoQG1heGltaXplUGFuZURpc3Bvc2FibGUpXG4gICAgICBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZSA9IG51bGxcblxuICBtYXhpbWl6ZVBhbmU6IC0+XG4gICAgaWYgQG1heGltaXplUGFuZURpc3Bvc2FibGU/XG4gICAgICBAZGVtYXhpbWl6ZVBhbmUoKVxuICAgICAgcmV0dXJuXG5cbiAgICBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBhZGRDbGFzc0xpc3QgPSAoZWxlbWVudCwgY2xhc3NMaXN0KSA9PlxuICAgICAgY2xhc3NMaXN0ID0gY2xhc3NMaXN0Lm1hcCAoY2xhc3NOYW1lKSAtPlxuICAgICAgICBcInZpbS1tb2RlLXBsdXMtLSN7Y2xhc3NOYW1lfVwiXG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NMaXN0Li4uKVxuICAgICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUuYWRkIG5ldyBEaXNwb3NhYmxlIC0+XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc0xpc3QuLi4pXG5cbiAgICB3b3Jrc3BhY2VDbGFzc0xpc3QgPSBbJ3BhbmUtbWF4aW1pemVkJ11cbiAgICB3b3Jrc3BhY2VDbGFzc0xpc3QucHVzaCgnaGlkZS10YWItYmFyJykgaWYgc2V0dGluZ3MuZ2V0KCdoaWRlVGFiQmFyT25NYXhpbWl6ZVBhbmUnKVxuICAgIHdvcmtzcGFjZUNsYXNzTGlzdC5wdXNoKCdoaWRlLXN0YXR1cy1iYXInKSBpZiBzZXR0aW5ncy5nZXQoJ2hpZGVTdGF0dXNCYXJPbk1heGltaXplUGFuZScpXG4gICAgYWRkQ2xhc3NMaXN0KGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksIHdvcmtzcGFjZUNsYXNzTGlzdClcblxuICAgIGFjdGl2ZVBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBhY3RpdmVQYW5lRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhY3RpdmVQYW5lKVxuICAgIGFkZENsYXNzTGlzdChhY3RpdmVQYW5lRWxlbWVudCwgWydhY3RpdmUtcGFuZSddKVxuXG4gICAgZm9yRWFjaFBhbmVBeGlzID89IHJlcXVpcmUoJy4vdXRpbHMnKS5mb3JFYWNoUGFuZUF4aXNcbiAgICByb290ID0gYWN0aXZlUGFuZS5nZXRDb250YWluZXIoKS5nZXRSb290KClcbiAgICBmb3JFYWNoUGFuZUF4aXMgcm9vdCwgKGF4aXMpIC0+XG4gICAgICBwYW5lQXhpc0VsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXhpcylcbiAgICAgIGlmIHBhbmVBeGlzRWxlbWVudC5jb250YWlucyhhY3RpdmVQYW5lRWxlbWVudClcbiAgICAgICAgYWRkQ2xhc3NMaXN0KHBhbmVBeGlzRWxlbWVudCwgWydhY3RpdmUtcGFuZS1heGlzJ10pXG5cbiAgICBAc3Vic2NyaWJlKEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlKVxuXG4gIGVxdWFsaXplUGFuZXM6IC0+XG4gICAgc2V0RmxleFNjYWxlID0gKHJvb3QsIG5ld1ZhbHVlKSAtPlxuICAgICAgcm9vdC5zZXRGbGV4U2NhbGUobmV3VmFsdWUpXG4gICAgICBmb3IgY2hpbGQgaW4gcm9vdC5jaGlsZHJlbiA/IFtdXG4gICAgICAgIHNldEZsZXhTY2FsZShjaGlsZCwgbmV3VmFsdWUpXG5cbiAgICBzZXRGbGV4U2NhbGUoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmdldENvbnRhaW5lcigpLmdldFJvb3QoKSwgMSlcblxuICByZWdpc3RlclZpbVN0YXRlQ29tbWFuZHM6IC0+XG4gICAgIyBhbGwgY29tbWFuZHMgaGVyZSBpcyBleGVjdXRlZCB3aXRoIGNvbnRleHQgd2hlcmUgJ3RoaXMnIGJvdW5kIHRvICd2aW1TdGF0ZSdcbiAgICBjb21tYW5kcyA9XG4gICAgICAnYWN0aXZhdGUtbm9ybWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ25vcm1hbCcpXG4gICAgICAnYWN0aXZhdGUtbGluZXdpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgICAnYWN0aXZhdGUtY2hhcmFjdGVyd2lzZS12aXN1YWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnKVxuICAgICAgJ2FjdGl2YXRlLWJsb2Nrd2lzZS12aXN1YWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICAncmVzZXQtbm9ybWFsLW1vZGUnOiAtPiBAcmVzZXROb3JtYWxNb2RlKHVzZXJJbnZvY2F0aW9uOiB0cnVlKVxuICAgICAgJ3NldC1yZWdpc3Rlci1uYW1lJzogLT4gQHJlZ2lzdGVyLnNldE5hbWUoKSAjIFwiXG4gICAgICAnc2V0LXJlZ2lzdGVyLW5hbWUtdG8tXyc6IC0+IEByZWdpc3Rlci5zZXROYW1lKCdfJylcbiAgICAgICdzZXQtcmVnaXN0ZXItbmFtZS10by0qJzogLT4gQHJlZ2lzdGVyLnNldE5hbWUoJyonKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLWNoYXJhY3Rlcndpc2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIod2lzZTogJ2NoYXJhY3Rlcndpc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLWxpbmV3aXNlJzogLT4gQGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyKHdpc2U6ICdsaW5ld2lzZScpXG4gICAgICAnb3BlcmF0b3ItbW9kaWZpZXItb2NjdXJyZW5jZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcihvY2N1cnJlbmNlOiB0cnVlLCBvY2N1cnJlbmNlVHlwZTogJ2Jhc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLXN1YndvcmQtb2NjdXJyZW5jZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcihvY2N1cnJlbmNlOiB0cnVlLCBvY2N1cnJlbmNlVHlwZTogJ3N1YndvcmQnKVxuICAgICAgJ3JlcGVhdCc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5SZWNvcmRlZCgpXG4gICAgICAncmVwZWF0LWZpbmQnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudEZpbmQoKVxuICAgICAgJ3JlcGVhdC1maW5kLXJldmVyc2UnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudEZpbmQocmV2ZXJzZTogdHJ1ZSlcbiAgICAgICdyZXBlYXQtc2VhcmNoJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRTZWFyY2goKVxuICAgICAgJ3JlcGVhdC1zZWFyY2gtcmV2ZXJzZSc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5DdXJyZW50U2VhcmNoKHJldmVyc2U6IHRydWUpXG4gICAgICAnc2V0LWNvdW50LTAnOiAtPiBAc2V0Q291bnQoMClcbiAgICAgICdzZXQtY291bnQtMSc6IC0+IEBzZXRDb3VudCgxKVxuICAgICAgJ3NldC1jb3VudC0yJzogLT4gQHNldENvdW50KDIpXG4gICAgICAnc2V0LWNvdW50LTMnOiAtPiBAc2V0Q291bnQoMylcbiAgICAgICdzZXQtY291bnQtNCc6IC0+IEBzZXRDb3VudCg0KVxuICAgICAgJ3NldC1jb3VudC01JzogLT4gQHNldENvdW50KDUpXG4gICAgICAnc2V0LWNvdW50LTYnOiAtPiBAc2V0Q291bnQoNilcbiAgICAgICdzZXQtY291bnQtNyc6IC0+IEBzZXRDb3VudCg3KVxuICAgICAgJ3NldC1jb3VudC04JzogLT4gQHNldENvdW50KDgpXG4gICAgICAnc2V0LWNvdW50LTknOiAtPiBAc2V0Q291bnQoOSlcblxuICAgIGNoYXJzID0gWzMyLi4xMjZdLm1hcCAoY29kZSkgLT4gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKVxuICAgIGZvciBjaGFyIGluIGNoYXJzXG4gICAgICBkbyAoY2hhcikgLT5cbiAgICAgICAgY2hhckZvcktleW1hcCA9IGlmIGNoYXIgaXMgJyAnIHRoZW4gJ3NwYWNlJyBlbHNlIGNoYXJcbiAgICAgICAgY29tbWFuZHNbXCJzZXQtaW5wdXQtY2hhci0je2NoYXJGb3JLZXltYXB9XCJdID0gLT5cbiAgICAgICAgICBAZW1pdERpZFNldElucHV0Q2hhcihjaGFyKVxuXG4gICAgZ2V0RWRpdG9yU3RhdGUgPSBAZ2V0RWRpdG9yU3RhdGUuYmluZCh0aGlzKVxuXG4gICAgYmluZFRvVmltU3RhdGUgPSAob2xkQ29tbWFuZHMpIC0+XG4gICAgICBuZXdDb21tYW5kcyA9IHt9XG4gICAgICBmb3IgbmFtZSwgZm4gb2Ygb2xkQ29tbWFuZHNcbiAgICAgICAgZG8gKGZuKSAtPlxuICAgICAgICAgIG5ld0NvbW1hbmRzW1widmltLW1vZGUtcGx1czoje25hbWV9XCJdID0gKGV2ZW50KSAtPlxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIGlmIHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUoQGdldE1vZGVsKCkpXG4gICAgICAgICAgICAgIGZuLmNhbGwodmltU3RhdGUsIGV2ZW50KVxuICAgICAgbmV3Q29tbWFuZHNcblxuICAgIEBzdWJzY3JpYmUgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLCBiaW5kVG9WaW1TdGF0ZShjb21tYW5kcykpXG5cbiAgY29uc3VtZVN0YXR1c0JhcjogKHN0YXR1c0JhcikgLT5cbiAgICBzdGF0dXNCYXJNYW5hZ2VyID0gQGdldFN0YXR1c0Jhck1hbmFnZXIoKVxuICAgIHN0YXR1c0Jhck1hbmFnZXIuaW5pdGlhbGl6ZShzdGF0dXNCYXIpXG4gICAgc3RhdHVzQmFyTWFuYWdlci5hdHRhY2goKVxuICAgIEBzdWJzY3JpYmUgbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgIHN0YXR1c0Jhck1hbmFnZXIuZGV0YWNoKClcblxuICBjb25zdW1lRGVtb01vZGU6ICh7b25XaWxsQWRkSXRlbSwgb25EaWRTdGFydCwgb25EaWRTdG9wLCBvbkRpZFJlbW92ZUhvdmVyfSkgLT5cbiAgICBAc3Vic2NyaWJlKFxuICAgICAgb25EaWRTdGFydCgtPiBnbG9iYWxTdGF0ZS5zZXQoJ2RlbW9Nb2RlSXNBY3RpdmUnLCB0cnVlKSlcbiAgICAgIG9uRGlkU3RvcCgtPiBnbG9iYWxTdGF0ZS5zZXQoJ2RlbW9Nb2RlSXNBY3RpdmUnLCBmYWxzZSkpXG4gICAgICBvbkRpZFJlbW92ZUhvdmVyKEBkZXN0cm95QWxsRGVtb01vZGVGbGFzaGVNYXJrZXJzLmJpbmQodGhpcykpXG4gICAgICBvbldpbGxBZGRJdGVtKCh7aXRlbSwgZXZlbnR9KSA9PlxuICAgICAgICBpZiBldmVudC5iaW5kaW5nLmNvbW1hbmQuc3RhcnRzV2l0aCgndmltLW1vZGUtcGx1czonKVxuICAgICAgICAgIGNvbW1hbmRFbGVtZW50ID0gaXRlbS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjb21tYW5kJylbMF1cbiAgICAgICAgICBjb21tYW5kRWxlbWVudC50ZXh0Q29udGVudCA9IGNvbW1hbmRFbGVtZW50LnRleHRDb250ZW50LnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sICcnKVxuXG4gICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdraW5kJywgJ3B1bGwtcmlnaHQnKVxuICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gQGdldEtpbmRGb3JDb21tYW5kKGV2ZW50LmJpbmRpbmcuY29tbWFuZClcbiAgICAgICAgaXRlbS5hcHBlbmRDaGlsZChlbGVtZW50KVxuICAgICAgKVxuICAgIClcblxuICBkZXN0cm95QWxsRGVtb01vZGVGbGFzaGVNYXJrZXJzOiAtPlxuICAgIFZpbVN0YXRlPy5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgIHZpbVN0YXRlLmZsYXNoTWFuYWdlci5kZXN0cm95RGVtb01vZGVNYXJrZXJzKClcblxuICBnZXRLaW5kRm9yQ29tbWFuZDogKGNvbW1hbmQpIC0+XG4gICAgaWYgY29tbWFuZC5zdGFydHNXaXRoKCd2aW0tbW9kZS1wbHVzJylcbiAgICAgIGNvbW1hbmQgPSBjb21tYW5kLnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sICcnKVxuICAgICAgaWYgY29tbWFuZC5zdGFydHNXaXRoKCdvcGVyYXRvci1tb2RpZmllcicpXG4gICAgICAgIGtpbmQgPSAnb3AtbW9kaWZpZXInXG4gICAgICBlbHNlXG4gICAgICAgIEJhc2UuZ2V0S2luZEZvckNvbW1hbmROYW1lKGNvbW1hbmQpID8gJ3ZtcC1vdGhlcidcbiAgICBlbHNlXG4gICAgICAnbm9uLXZtcCdcblxuICBjcmVhdGVWaW1TdGF0ZTogKGVkaXRvcikgLT5cbiAgICB2aW1TdGF0ZSA9IG5ldyBWaW1TdGF0ZShlZGl0b3IsIEBnZXRTdGF0dXNCYXJNYW5hZ2VyKCksIGdsb2JhbFN0YXRlKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1hZGQtdmltLXN0YXRlJywgdmltU3RhdGUpXG5cbiAgY3JlYXRlVmltU3RhdGVJZk5lY2Vzc2FyeTogKGVkaXRvcikgLT5cbiAgICByZXR1cm4gaWYgVmltU3RhdGUuaGFzKGVkaXRvcilcbiAgICB2aW1TdGF0ZSA9IG5ldyBWaW1TdGF0ZShlZGl0b3IsIEBnZXRTdGF0dXNCYXJNYW5hZ2VyKCksIGdsb2JhbFN0YXRlKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1hZGQtdmltLXN0YXRlJywgdmltU3RhdGUpXG5cbiAgIyBTZXJ2aWNlIEFQSVxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0R2xvYmFsU3RhdGU6IC0+XG4gICAgZ2xvYmFsU3RhdGVcblxuICBnZXRFZGl0b3JTdGF0ZTogKGVkaXRvcikgLT5cbiAgICBWaW1TdGF0ZS5nZXRCeUVkaXRvcihlZGl0b3IpXG5cbiAgcHJvdmlkZVZpbU1vZGVQbHVzOiAtPlxuICAgIEJhc2U6IEJhc2VcbiAgICByZWdpc3RlckNvbW1hbmRGcm9tU3BlYzogQmFzZS5yZWdpc3RlckNvbW1hbmRGcm9tU3BlY1xuICAgIGdldEdsb2JhbFN0YXRlOiBAZ2V0R2xvYmFsU3RhdGVcbiAgICBnZXRFZGl0b3JTdGF0ZTogQGdldEVkaXRvclN0YXRlXG4gICAgb2JzZXJ2ZVZpbVN0YXRlczogQG9ic2VydmVWaW1TdGF0ZXMuYmluZCh0aGlzKVxuICAgIG9uRGlkQWRkVmltU3RhdGU6IEBvbkRpZEFkZFZpbVN0YXRlLmJpbmQodGhpcylcbiJdfQ==
