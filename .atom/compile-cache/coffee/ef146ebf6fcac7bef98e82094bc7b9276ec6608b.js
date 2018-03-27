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
          var ref1;
          if (atom.workspace.isTextEditor(item) && !item.isMini()) {
            return (ref1 = _this.getEditorState(item)) != null ? ref1.highlightSearch.refresh() : void 0;
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
      var classActivePaneAxis, classHideStatusBar, classHideTabBar, classPaneMaximized, getView, paneElement, ref1, workspaceClassNames, workspaceElement;
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
      (ref1 = workspaceElement.classList).add.apply(ref1, workspaceClassNames);
      if (forEachPaneAxis == null) {
        forEachPaneAxis = require('./utils').forEachPaneAxis;
      }
      forEachPaneAxis(function(axis) {
        var paneAxisElement;
        paneAxisElement = getView(axis);
        if (paneAxisElement.contains(paneElement)) {
          return paneAxisElement.classList.add(classActivePaneAxis);
        }
      });
      this.maximizePaneDisposable = new Disposable(function() {
        var ref2;
        forEachPaneAxis(function(axis) {
          return getView(axis).classList.remove(classActivePaneAxis);
        });
        return (ref2 = workspaceElement.classList).remove.apply(ref2, workspaceClassNames);
      });
      return this.subscribe(this.maximizePaneDisposable);
    },
    equalizePanes: function() {
      var setFlexScale;
      setFlexScale = function(newValue, base) {
        var child, i, len, ref1, ref2, results;
        if (base == null) {
          base = atom.workspace.getActivePane().getContainer().getRoot();
        }
        base.setFlexScale(newValue);
        ref2 = (ref1 = base.children) != null ? ref1 : [];
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          child = ref2[i];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxR0FBQTtJQUFBOztFQUFBLE1BQTZDLE9BQUEsQ0FBUSxNQUFSLENBQTdDLEVBQUMsMkJBQUQsRUFBYSxxQkFBYixFQUFzQjs7RUFFdEIsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxlQUFBLEdBQWtCOztFQUVsQixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUFRLFFBQVEsQ0FBQyxNQUFqQjtJQUVBLG1CQUFBLEVBQXFCLFNBQUE7NkNBQ25CLElBQUMsQ0FBQSxtQkFBRCxJQUFDLENBQUEsbUJBQW9CLElBQUksQ0FBQyxPQUFBLENBQVEsc0JBQVIsQ0FBRDtJQUROLENBRnJCO0lBS0EsUUFBQSxFQUFVLFNBQUMsS0FBRDtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLGNBQUEsR0FBaUIsSUFBQyxDQUFBLGNBQWMsQ0FBQyxJQUFoQixDQUFxQixJQUFyQjtNQUNqQixJQUFDLENBQUEsU0FBRCxhQUFXLElBQUksQ0FBQyxJQUFMLENBQVUsY0FBVixDQUFYO01BQ0EsSUFBQyxDQUFBLGdCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsd0JBQUQsQ0FBQTtNQUVBLFFBQVEsQ0FBQyxzQkFBVCxDQUFBO01BRUEsSUFBRyxJQUFJLENBQUMsVUFBTCxDQUFBLENBQUg7UUFDRSxRQUFRLENBQUMsR0FBVCxDQUFhLGlCQUFiLEVBQWdDLElBQWhDLEVBREY7O01BR0Es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Q0E5UWhCO0lBaVJBLGtCQUFBLEVBQW9CLFNBQUE7YUFDbEI7UUFBQSxJQUFBLEVBQU0sSUFBTjtRQUNBLHVCQUFBLEVBQXlCLElBQUksQ0FBQyx1QkFEOUI7UUFFQSxjQUFBLEVBQWdCLElBQUMsQ0FBQSxjQUZqQjtRQUdBLGNBQUEsRUFBZ0IsSUFBQyxDQUFBLGNBSGpCO1FBSUEsZ0JBQUEsRUFBa0IsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLElBQXZCLENBSmxCO1FBS0EsZ0JBQUEsRUFBa0IsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLElBQXZCLENBTGxCOztJQURrQixDQWpScEI7O0FBVEYiLCJzb3VyY2VzQ29udGVudCI6WyJ7RGlzcG9zYWJsZSwgRW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuZ2xvYmFsU3RhdGUgPSByZXF1aXJlICcuL2dsb2JhbC1zdGF0ZSdcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblZpbVN0YXRlID0gcmVxdWlyZSAnLi92aW0tc3RhdGUnXG5mb3JFYWNoUGFuZUF4aXMgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOiBzZXR0aW5ncy5jb25maWdcblxuICBnZXRTdGF0dXNCYXJNYW5hZ2VyOiAtPlxuICAgIEBzdGF0dXNCYXJNYW5hZ2VyID89IG5ldyAocmVxdWlyZSAnLi9zdGF0dXMtYmFyLW1hbmFnZXInKVxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIGdldEVkaXRvclN0YXRlID0gQGdldEVkaXRvclN0YXRlLmJpbmQodGhpcylcbiAgICBAc3Vic2NyaWJlKEJhc2UuaW5pdChnZXRFZGl0b3JTdGF0ZSkuLi4pXG4gICAgQHJlZ2lzdGVyQ29tbWFuZHMoKVxuICAgIEByZWdpc3RlclZpbVN0YXRlQ29tbWFuZHMoKVxuXG4gICAgc2V0dGluZ3Mubm90aWZ5RGVwcmVjYXRlZFBhcmFtcygpXG5cbiAgICBpZiBhdG9tLmluU3BlY01vZGUoKVxuICAgICAgc2V0dGluZ3Muc2V0KCdzdHJpY3RBc3NlcnRpb24nLCB0cnVlKVxuXG4gICAgaWYgYXRvbS5pbkRldk1vZGUoKVxuICAgICAgZGV2ZWxvcGVyID0gbmV3IChyZXF1aXJlICcuL2RldmVsb3BlcicpXG4gICAgICBAc3Vic2NyaWJlKGRldmVsb3Blci5pbml0KGdldEVkaXRvclN0YXRlKSlcblxuICAgIEBzdWJzY3JpYmUgQG9ic2VydmVWaW1Nb2RlIC0+XG4gICAgICBtZXNzYWdlID0gXCJcIlwiXG4gICAgICAgICMjIE1lc3NhZ2UgYnkgdmltLW1vZGUtcGx1czogdmltLW1vZGUgZGV0ZWN0ZWQhXG4gICAgICAgIFRvIHVzZSB2aW0tbW9kZS1wbHVzLCB5b3UgbXVzdCAqKmRpc2FibGUgdmltLW1vZGUqKiBtYW51YWxseS5cbiAgICAgICAgXCJcIlwiXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhtZXNzYWdlLCBkaXNtaXNzYWJsZTogdHJ1ZSlcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICBAY3JlYXRlVmltU3RhdGUoZWRpdG9yKSB1bmxlc3MgZWRpdG9yLmlzTWluaSgpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gPT5cbiAgICAgIEBkZW1heGltaXplUGFuZSgpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gLT5cbiAgICAgIGlmIHNldHRpbmdzLmdldCgnYXV0b21hdGljYWxseUVzY2FwZUluc2VydE1vZGVPbkFjdGl2ZVBhbmVJdGVtQ2hhbmdlJylcbiAgICAgICAgVmltU3RhdGUuZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICAgICAgdmltU3RhdGUuYWN0aXZhdGUoJ25vcm1hbCcpIGlmIHZpbVN0YXRlLm1vZGUgaXMgJ2luc2VydCdcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub25EaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbSAoaXRlbSkgPT5cbiAgICAgIGlmIGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihpdGVtKSBhbmQgbm90IGl0ZW0uaXNNaW5pKClcbiAgICAgICAgIyBTdGlsbCB0aGVyZSBpcyBwb3NzaWJpbGl0eSBlZGl0b3IgaXMgZGVzdHJveWVkIGFuZCBkb24ndCBoYXZlIGNvcnJlc3BvbmRpbmdcbiAgICAgICAgIyB2aW1TdGF0ZSAjMTk2LlxuICAgICAgICBAZ2V0RWRpdG9yU3RhdGUoaXRlbSk/LmhpZ2hsaWdodFNlYXJjaC5yZWZyZXNoKClcblxuICAgICMgQHN1YnNjcmliZSAgZ2xvYmFsU3RhdGUuZ2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJylcbiAgICAjIFJlZnJlc2ggaGlnaGxpZ2h0IGJhc2VkIG9uIGdsb2JhbFN0YXRlLmhpZ2hsaWdodFNlYXJjaFBhdHRlcm4gY2hhbmdlcy5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBAc3Vic2NyaWJlIGdsb2JhbFN0YXRlLm9uRGlkQ2hhbmdlICh7bmFtZSwgbmV3VmFsdWV9KSAtPlxuICAgICAgaWYgbmFtZSBpcyAnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybidcbiAgICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgICBWaW1TdGF0ZS5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgICAgICAgIHZpbVN0YXRlLmhpZ2hsaWdodFNlYXJjaC5yZWZyZXNoKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFZpbVN0YXRlLmZvckVhY2ggKHZpbVN0YXRlKSAtPlxuICAgICAgICAgICAgIyBhdm9pZCBwb3B1bGF0ZSBwcm9wIHVubmVjZXNzYXJpbHkgb24gdmltU3RhdGUucmVzZXQgb24gc3RhcnR1cFxuICAgICAgICAgICAgaWYgdmltU3RhdGUuX19oaWdobGlnaHRTZWFyY2hcbiAgICAgICAgICAgICAgdmltU3RhdGUuaGlnaGxpZ2h0U2VhcmNoLmNsZWFyTWFya2VycygpXG5cbiAgICBAc3Vic2NyaWJlIHNldHRpbmdzLm9ic2VydmUgJ2hpZ2hsaWdodFNlYXJjaCcsIChuZXdWYWx1ZSkgLT5cbiAgICAgIGlmIG5ld1ZhbHVlXG4gICAgICAgICMgUmUtc2V0dGluZyB2YWx1ZSB0cmlnZ2VyIGhpZ2hsaWdodFNlYXJjaCByZWZyZXNoXG4gICAgICAgIGdsb2JhbFN0YXRlLnNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIGdsb2JhbFN0YXRlLmdldCgnbGFzdFNlYXJjaFBhdHRlcm4nKSlcbiAgICAgIGVsc2VcbiAgICAgICAgZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbnVsbClcblxuICAgIEBzdWJzY3JpYmUoc2V0dGluZ3Mub2JzZXJ2ZUNvbmRpdGlvbmFsS2V5bWFwcygpLi4uKVxuICAgIFxuICAgIGlmIHNldHRpbmdzLmdldCgnZGVidWcnKVxuICAgICAgZGV2ZWxvcGVyPy5yZXBvcnRSZXF1aXJlQ2FjaGUoZXhjbHVkZU5vZE1vZHVsZXM6IGZhbHNlKVxuXG4gIG9ic2VydmVWaW1Nb2RlOiAoZm4pIC0+XG4gICAgZm4oKSBpZiBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZSgndmltLW1vZGUnKVxuICAgIGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZVBhY2thZ2UgKHBhY2spIC0+XG4gICAgICBmbigpIGlmIHBhY2submFtZSBpcyAndmltLW1vZGUnXG5cbiAgIyAqIGBmbmAge0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbiB2aW1TdGF0ZSBpbnN0YW5jZSB3YXMgY3JlYXRlZC5cbiAgIyAgVXNhZ2U6XG4gICMgICBvbkRpZEFkZFZpbVN0YXRlICh2aW1TdGF0ZSkgLT4gZG8gc29tZXRoaW5nLi5cbiAgIyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbkRpZEFkZFZpbVN0YXRlOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtYWRkLXZpbS1zdGF0ZScsIGZuKVxuXG4gICMgKiBgZm5gIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdpdGggYWxsIGN1cnJlbnQgYW5kIGZ1dHVyZSB2aW1TdGF0ZVxuICAjICBVc2FnZTpcbiAgIyAgIG9ic2VydmVWaW1TdGF0ZXMgKHZpbVN0YXRlKSAtPiBkbyBzb21ldGhpbmcuLlxuICAjIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9ic2VydmVWaW1TdGF0ZXM6IChmbikgLT5cbiAgICBWaW1TdGF0ZT8uZm9yRWFjaChmbilcbiAgICBAb25EaWRBZGRWaW1TdGF0ZShmbilcblxuICBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25Gb3JFZGl0b3JzOiAtPlxuICAgIGZvciBlZGl0b3IgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKVxuICAgICAgQGdldEVkaXRvclN0YXRlKGVkaXRvcikuY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9ucygpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBWaW1TdGF0ZT8uZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICB2aW1TdGF0ZS5kZXN0cm95KClcbiAgICBWaW1TdGF0ZT8uY2xlYXIoKVxuXG4gIHN1YnNjcmliZTogKGFyZ3MuLi4pIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkKGFyZ3MuLi4pXG5cbiAgdW5zdWJzY3JpYmU6IChhcmcpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMucmVtb3ZlKGFyZylcblxuICByZWdpc3RlckNvbW1hbmRzOiAtPlxuICAgIEBzdWJzY3JpYmUgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLFxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6Y2xlYXItaGlnaGxpZ2h0LXNlYXJjaCc6IC0+IGdsb2JhbFN0YXRlLnNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIG51bGwpXG4gICAgICAndmltLW1vZGUtcGx1czp0b2dnbGUtaGlnaGxpZ2h0LXNlYXJjaCc6IC0+IHNldHRpbmdzLnRvZ2dsZSgnaGlnaGxpZ2h0U2VhcmNoJylcbiAgICAgICd2aW0tbW9kZS1wbHVzOmNsZWFyLXBlcnNpc3RlbnQtc2VsZWN0aW9uJzogPT4gQGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbkZvckVkaXRvcnMoKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6bWF4aW1pemUtcGFuZSc6ID0+IEBtYXhpbWl6ZVBhbmUoKVxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6ZXF1YWxpemUtcGFuZXMnOiA9PiBAZXF1YWxpemVQYW5lcygpXG5cbiAgZGVtYXhpbWl6ZVBhbmU6IC0+XG4gICAgaWYgQG1heGltaXplUGFuZURpc3Bvc2FibGU/XG4gICAgICBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgIEB1bnN1YnNjcmliZShAbWF4aW1pemVQYW5lRGlzcG9zYWJsZSlcbiAgICAgIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlID0gbnVsbFxuXG4gIG1heGltaXplUGFuZTogLT5cbiAgICBpZiBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZT9cbiAgICAgIEBkZW1heGltaXplUGFuZSgpXG4gICAgICByZXR1cm5cblxuICAgIGdldFZpZXcgPSAobW9kZWwpIC0+IGF0b20udmlld3MuZ2V0Vmlldyhtb2RlbClcbiAgICBjbGFzc1BhbmVNYXhpbWl6ZWQgPSAndmltLW1vZGUtcGx1cy0tcGFuZS1tYXhpbWl6ZWQnXG4gICAgY2xhc3NIaWRlVGFiQmFyID0gJ3ZpbS1tb2RlLXBsdXMtLWhpZGUtdGFiLWJhcidcbiAgICBjbGFzc0hpZGVTdGF0dXNCYXIgPSAndmltLW1vZGUtcGx1cy0taGlkZS1zdGF0dXMtYmFyJ1xuICAgIGNsYXNzQWN0aXZlUGFuZUF4aXMgPSAndmltLW1vZGUtcGx1cy0tYWN0aXZlLXBhbmUtYXhpcydcblxuICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBnZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgIHBhbmVFbGVtZW50ID0gZ2V0VmlldyhhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkpXG5cbiAgICB3b3Jrc3BhY2VDbGFzc05hbWVzID0gW2NsYXNzUGFuZU1heGltaXplZF1cbiAgICB3b3Jrc3BhY2VDbGFzc05hbWVzLnB1c2goY2xhc3NIaWRlVGFiQmFyKSBpZiBzZXR0aW5ncy5nZXQoJ2hpZGVUYWJCYXJPbk1heGltaXplUGFuZScpXG4gICAgd29ya3NwYWNlQ2xhc3NOYW1lcy5wdXNoKGNsYXNzSGlkZVN0YXR1c0JhcikgaWYgc2V0dGluZ3MuZ2V0KCdoaWRlU3RhdHVzQmFyT25NYXhpbWl6ZVBhbmUnKVxuXG4gICAgd29ya3NwYWNlRWxlbWVudC5jbGFzc0xpc3QuYWRkKHdvcmtzcGFjZUNsYXNzTmFtZXMuLi4pXG5cbiAgICBmb3JFYWNoUGFuZUF4aXMgPz0gcmVxdWlyZSgnLi91dGlscycpLmZvckVhY2hQYW5lQXhpc1xuICAgIGZvckVhY2hQYW5lQXhpcyAoYXhpcykgLT5cbiAgICAgIHBhbmVBeGlzRWxlbWVudCA9IGdldFZpZXcoYXhpcylcbiAgICAgIGlmIHBhbmVBeGlzRWxlbWVudC5jb250YWlucyhwYW5lRWxlbWVudClcbiAgICAgICAgcGFuZUF4aXNFbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NBY3RpdmVQYW5lQXhpcylcblxuICAgIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlID0gbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgIGZvckVhY2hQYW5lQXhpcyAoYXhpcykgLT5cbiAgICAgICAgZ2V0VmlldyhheGlzKS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzQWN0aXZlUGFuZUF4aXMpXG4gICAgICB3b3Jrc3BhY2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUod29ya3NwYWNlQ2xhc3NOYW1lcy4uLilcblxuICAgIEBzdWJzY3JpYmUoQG1heGltaXplUGFuZURpc3Bvc2FibGUpXG5cbiAgZXF1YWxpemVQYW5lczogLT5cbiAgICBzZXRGbGV4U2NhbGUgPSAobmV3VmFsdWUsIGJhc2UpIC0+XG4gICAgICBiYXNlID89IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5nZXRDb250YWluZXIoKS5nZXRSb290KClcbiAgICAgIGJhc2Uuc2V0RmxleFNjYWxlKG5ld1ZhbHVlKVxuICAgICAgZm9yIGNoaWxkIGluIGJhc2UuY2hpbGRyZW4gPyBbXVxuICAgICAgICBzZXRGbGV4U2NhbGUobmV3VmFsdWUsIGNoaWxkKVxuXG4gICAgc2V0RmxleFNjYWxlKDEpXG5cbiAgcmVnaXN0ZXJWaW1TdGF0ZUNvbW1hbmRzOiAtPlxuICAgICMgYWxsIGNvbW1hbmRzIGhlcmUgaXMgZXhlY3V0ZWQgd2l0aCBjb250ZXh0IHdoZXJlICd0aGlzJyBib3VuZCB0byAndmltU3RhdGUnXG4gICAgY29tbWFuZHMgPVxuICAgICAgJ2FjdGl2YXRlLW5vcm1hbC1tb2RlJzogLT4gQGFjdGl2YXRlKCdub3JtYWwnKVxuICAgICAgJ2FjdGl2YXRlLWxpbmV3aXNlLXZpc3VhbC1tb2RlJzogLT4gQGFjdGl2YXRlKCd2aXN1YWwnLCAnbGluZXdpc2UnKVxuICAgICAgJ2FjdGl2YXRlLWNoYXJhY3Rlcndpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJylcbiAgICAgICdhY3RpdmF0ZS1ibG9ja3dpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgJ3Jlc2V0LW5vcm1hbC1tb2RlJzogLT4gQHJlc2V0Tm9ybWFsTW9kZSh1c2VySW52b2NhdGlvbjogdHJ1ZSlcbiAgICAgICdzZXQtcmVnaXN0ZXItbmFtZSc6IC0+IEByZWdpc3Rlci5zZXROYW1lKCkgIyBcIlxuICAgICAgJ3NldC1yZWdpc3Rlci1uYW1lLXRvLV8nOiAtPiBAcmVnaXN0ZXIuc2V0TmFtZSgnXycpXG4gICAgICAnc2V0LXJlZ2lzdGVyLW5hbWUtdG8tKic6IC0+IEByZWdpc3Rlci5zZXROYW1lKCcqJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1jaGFyYWN0ZXJ3aXNlJzogLT4gQGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyKHdpc2U6ICdjaGFyYWN0ZXJ3aXNlJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1saW5ld2lzZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcih3aXNlOiAnbGluZXdpc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLW9jY3VycmVuY2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIob2NjdXJyZW5jZTogdHJ1ZSwgb2NjdXJyZW5jZVR5cGU6ICdiYXNlJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1zdWJ3b3JkLW9jY3VycmVuY2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIob2NjdXJyZW5jZTogdHJ1ZSwgb2NjdXJyZW5jZVR5cGU6ICdzdWJ3b3JkJylcbiAgICAgICdyZXBlYXQnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuUmVjb3JkZWQoKVxuICAgICAgJ3JlcGVhdC1maW5kJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRGaW5kKClcbiAgICAgICdyZXBlYXQtZmluZC1yZXZlcnNlJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRGaW5kKHJldmVyc2U6IHRydWUpXG4gICAgICAncmVwZWF0LXNlYXJjaCc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5DdXJyZW50U2VhcmNoKClcbiAgICAgICdyZXBlYXQtc2VhcmNoLXJldmVyc2UnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudFNlYXJjaChyZXZlcnNlOiB0cnVlKVxuICAgICAgJ3NldC1jb3VudC0wJzogLT4gQHNldENvdW50KDApXG4gICAgICAnc2V0LWNvdW50LTEnOiAtPiBAc2V0Q291bnQoMSlcbiAgICAgICdzZXQtY291bnQtMic6IC0+IEBzZXRDb3VudCgyKVxuICAgICAgJ3NldC1jb3VudC0zJzogLT4gQHNldENvdW50KDMpXG4gICAgICAnc2V0LWNvdW50LTQnOiAtPiBAc2V0Q291bnQoNClcbiAgICAgICdzZXQtY291bnQtNSc6IC0+IEBzZXRDb3VudCg1KVxuICAgICAgJ3NldC1jb3VudC02JzogLT4gQHNldENvdW50KDYpXG4gICAgICAnc2V0LWNvdW50LTcnOiAtPiBAc2V0Q291bnQoNylcbiAgICAgICdzZXQtY291bnQtOCc6IC0+IEBzZXRDb3VudCg4KVxuICAgICAgJ3NldC1jb3VudC05JzogLT4gQHNldENvdW50KDkpXG5cbiAgICBjaGFycyA9IFszMi4uMTI2XS5tYXAgKGNvZGUpIC0+IFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZSlcbiAgICBmb3IgY2hhciBpbiBjaGFyc1xuICAgICAgZG8gKGNoYXIpIC0+XG4gICAgICAgIGNoYXJGb3JLZXltYXAgPSBpZiBjaGFyIGlzICcgJyB0aGVuICdzcGFjZScgZWxzZSBjaGFyXG4gICAgICAgIGNvbW1hbmRzW1wic2V0LWlucHV0LWNoYXItI3tjaGFyRm9yS2V5bWFwfVwiXSA9IC0+XG4gICAgICAgICAgQGVtaXREaWRTZXRJbnB1dENoYXIoY2hhcilcblxuICAgIGdldEVkaXRvclN0YXRlID0gQGdldEVkaXRvclN0YXRlLmJpbmQodGhpcylcblxuICAgIGJpbmRUb1ZpbVN0YXRlID0gKG9sZENvbW1hbmRzKSAtPlxuICAgICAgbmV3Q29tbWFuZHMgPSB7fVxuICAgICAgZm9yIG5hbWUsIGZuIG9mIG9sZENvbW1hbmRzXG4gICAgICAgIGRvIChmbikgLT5cbiAgICAgICAgICBuZXdDb21tYW5kc1tcInZpbS1tb2RlLXBsdXM6I3tuYW1lfVwiXSA9IChldmVudCkgLT5cbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICBpZiB2aW1TdGF0ZSA9IGdldEVkaXRvclN0YXRlKEBnZXRNb2RlbCgpKVxuICAgICAgICAgICAgICBmbi5jYWxsKHZpbVN0YXRlLCBldmVudClcbiAgICAgIG5ld0NvbW1hbmRzXG5cbiAgICBAc3Vic2NyaWJlIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yOm5vdChbbWluaV0pJywgYmluZFRvVmltU3RhdGUoY29tbWFuZHMpKVxuXG4gIGNvbnN1bWVTdGF0dXNCYXI6IChzdGF0dXNCYXIpIC0+XG4gICAgc3RhdHVzQmFyTWFuYWdlciA9IEBnZXRTdGF0dXNCYXJNYW5hZ2VyKClcbiAgICBzdGF0dXNCYXJNYW5hZ2VyLmluaXRpYWxpemUoc3RhdHVzQmFyKVxuICAgIHN0YXR1c0Jhck1hbmFnZXIuYXR0YWNoKClcbiAgICBAc3Vic2NyaWJlIG5ldyBEaXNwb3NhYmxlIC0+XG4gICAgICBzdGF0dXNCYXJNYW5hZ2VyLmRldGFjaCgpXG5cbiAgY29uc3VtZURlbW9Nb2RlOiAoe29uV2lsbEFkZEl0ZW0sIG9uRGlkU3RhcnQsIG9uRGlkU3RvcCwgb25EaWRSZW1vdmVIb3Zlcn0pIC0+XG4gICAgQHN1YnNjcmliZShcbiAgICAgIG9uRGlkU3RhcnQoLT4gZ2xvYmFsU3RhdGUuc2V0KCdkZW1vTW9kZUlzQWN0aXZlJywgdHJ1ZSkpXG4gICAgICBvbkRpZFN0b3AoLT4gZ2xvYmFsU3RhdGUuc2V0KCdkZW1vTW9kZUlzQWN0aXZlJywgZmFsc2UpKVxuICAgICAgb25EaWRSZW1vdmVIb3ZlcihAZGVzdHJveUFsbERlbW9Nb2RlRmxhc2hlTWFya2Vycy5iaW5kKHRoaXMpKVxuICAgICAgb25XaWxsQWRkSXRlbSgoe2l0ZW0sIGV2ZW50fSkgPT5cbiAgICAgICAgaWYgZXZlbnQuYmluZGluZy5jb21tYW5kLnN0YXJ0c1dpdGgoJ3ZpbS1tb2RlLXBsdXM6JylcbiAgICAgICAgICBjb21tYW5kRWxlbWVudCA9IGl0ZW0uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY29tbWFuZCcpWzBdXG4gICAgICAgICAgY29tbWFuZEVsZW1lbnQudGV4dENvbnRlbnQgPSBjb21tYW5kRWxlbWVudC50ZXh0Q29udGVudC5yZXBsYWNlKC9edmltLW1vZGUtcGx1czovLCAnJylcblxuICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgna2luZCcsICdwdWxsLXJpZ2h0JylcbiAgICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IEBnZXRLaW5kRm9yQ29tbWFuZChldmVudC5iaW5kaW5nLmNvbW1hbmQpXG4gICAgICAgIGl0ZW0uYXBwZW5kQ2hpbGQoZWxlbWVudClcbiAgICAgIClcbiAgICApXG5cbiAgZGVzdHJveUFsbERlbW9Nb2RlRmxhc2hlTWFya2VyczogLT5cbiAgICBWaW1TdGF0ZT8uZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICB2aW1TdGF0ZS5mbGFzaE1hbmFnZXIuZGVzdHJveURlbW9Nb2RlTWFya2VycygpXG5cbiAgZ2V0S2luZEZvckNvbW1hbmQ6IChjb21tYW5kKSAtPlxuICAgIGlmIGNvbW1hbmQuc3RhcnRzV2l0aCgndmltLW1vZGUtcGx1cycpXG4gICAgICBjb21tYW5kID0gY29tbWFuZC5yZXBsYWNlKC9edmltLW1vZGUtcGx1czovLCAnJylcbiAgICAgIGlmIGNvbW1hbmQuc3RhcnRzV2l0aCgnb3BlcmF0b3ItbW9kaWZpZXInKVxuICAgICAgICBraW5kID0gJ29wLW1vZGlmaWVyJ1xuICAgICAgZWxzZVxuICAgICAgICBCYXNlLmdldEtpbmRGb3JDb21tYW5kTmFtZShjb21tYW5kKSA/ICd2bXAtb3RoZXInXG4gICAgZWxzZVxuICAgICAgJ25vbi12bXAnXG5cbiAgY3JlYXRlVmltU3RhdGU6IChlZGl0b3IpIC0+XG4gICAgdmltU3RhdGUgPSBuZXcgVmltU3RhdGUoZWRpdG9yLCBAZ2V0U3RhdHVzQmFyTWFuYWdlcigpLCBnbG9iYWxTdGF0ZSlcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtYWRkLXZpbS1zdGF0ZScsIHZpbVN0YXRlKVxuXG4gIGNyZWF0ZVZpbVN0YXRlSWZOZWNlc3Nhcnk6IChlZGl0b3IpIC0+XG4gICAgcmV0dXJuIGlmIFZpbVN0YXRlLmhhcyhlZGl0b3IpXG4gICAgdmltU3RhdGUgPSBuZXcgVmltU3RhdGUoZWRpdG9yLCBAZ2V0U3RhdHVzQmFyTWFuYWdlcigpLCBnbG9iYWxTdGF0ZSlcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtYWRkLXZpbS1zdGF0ZScsIHZpbVN0YXRlKVxuXG4gICMgU2VydmljZSBBUElcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGdldEdsb2JhbFN0YXRlOiAtPlxuICAgIGdsb2JhbFN0YXRlXG5cbiAgZ2V0RWRpdG9yU3RhdGU6IChlZGl0b3IpIC0+XG4gICAgVmltU3RhdGUuZ2V0QnlFZGl0b3IoZWRpdG9yKVxuXG4gIHByb3ZpZGVWaW1Nb2RlUGx1czogLT5cbiAgICBCYXNlOiBCYXNlXG4gICAgcmVnaXN0ZXJDb21tYW5kRnJvbVNwZWM6IEJhc2UucmVnaXN0ZXJDb21tYW5kRnJvbVNwZWNcbiAgICBnZXRHbG9iYWxTdGF0ZTogQGdldEdsb2JhbFN0YXRlXG4gICAgZ2V0RWRpdG9yU3RhdGU6IEBnZXRFZGl0b3JTdGF0ZVxuICAgIG9ic2VydmVWaW1TdGF0ZXM6IEBvYnNlcnZlVmltU3RhdGVzLmJpbmQodGhpcylcbiAgICBvbkRpZEFkZFZpbVN0YXRlOiBAb25EaWRBZGRWaW1TdGF0ZS5iaW5kKHRoaXMpXG4iXX0=
