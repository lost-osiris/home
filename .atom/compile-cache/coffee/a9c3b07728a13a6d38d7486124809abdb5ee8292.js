(function() {
  var Base, CompositeDisposable, Disposable, Emitter, VimState, forEachPaneAxis, globalState, paneUtils, ref, settings,
    slice = [].slice;

  ref = require('atom'), Disposable = ref.Disposable, Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  globalState = require('./global-state');

  settings = require('./settings');

  VimState = require('./vim-state');

  forEachPaneAxis = null;

  paneUtils = null;

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
      this.demaximizePane();
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
        "vim-mode-plus:maximize-pane": (function(_this) {
          return function() {
            return _this.maximizePane();
          };
        })(this),
        "vim-mode-plus:equalize-panes": (function(_this) {
          return function() {
            return _this.equalizePanes();
          };
        })(this),
        "vim-mode-plus:exchange-pane": (function(_this) {
          return function() {
            return _this.exchangePane();
          };
        })(this),
        "vim-mode-plus:move-pane-to-very-top": (function(_this) {
          return function() {
            return _this.movePaneToVery("top");
          };
        })(this),
        "vim-mode-plus:move-pane-to-very-bottom": (function(_this) {
          return function() {
            return _this.movePaneToVery("bottom");
          };
        })(this),
        "vim-mode-plus:move-pane-to-very-left": (function(_this) {
          return function() {
            return _this.movePaneToVery("left");
          };
        })(this),
        "vim-mode-plus:move-pane-to-very-right": (function(_this) {
          return function() {
            return _this.movePaneToVery("right");
          };
        })(this)
      }));
    },
    exchangePane: function() {
      if (paneUtils == null) {
        paneUtils = require("./pane-utils");
      }
      return paneUtils.exchangePane();
    },
    demaximizePane: function() {
      if (this.maximizePaneDisposable != null) {
        this.maximizePaneDisposable.dispose();
        return this.maximizePaneDisposable = null;
      }
    },
    maximizePane: function() {
      if (this.maximizePaneDisposable != null) {
        this.demaximizePane();
        return;
      }
      if (paneUtils == null) {
        paneUtils = require("./pane-utils");
      }
      return this.maximizePaneDisposable = paneUtils.maximizePane();
    },
    equalizePanes: function() {
      if (paneUtils == null) {
        paneUtils = require("./pane-utils");
      }
      return paneUtils.equalizePanes();
    },
    movePaneToVery: function(direction) {
      if (paneUtils == null) {
        paneUtils = require("./pane-utils");
      }
      return paneUtils.movePaneToVery(direction);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnSEFBQTtJQUFBOztFQUFBLE1BQTZDLE9BQUEsQ0FBUSxNQUFSLENBQTdDLEVBQUMsMkJBQUQsRUFBYSxxQkFBYixFQUFzQjs7RUFFdEIsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxlQUFBLEdBQWtCOztFQUNsQixTQUFBLEdBQVk7O0VBRVosTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFBUSxRQUFRLENBQUMsTUFBakI7SUFFQSxtQkFBQSxFQUFxQixTQUFBOzZDQUNuQixJQUFDLENBQUEsbUJBQUQsSUFBQyxDQUFBLG1CQUFvQixJQUFJLENBQUMsT0FBQSxDQUFRLHNCQUFSLENBQUQ7SUFETixDQUZyQjtJQUtBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFFZixjQUFBLEdBQWlCLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBaEIsQ0FBcUIsSUFBckI7TUFDakIsSUFBQyxDQUFBLFNBQUQsYUFBVyxJQUFJLENBQUMsSUFBTCxDQUFVLGNBQVYsQ0FBWDtNQUNBLElBQUMsQ0FBQSxnQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLHdCQUFELENBQUE7TUFFQSxRQUFRLENBQUMsc0JBQVQsQ0FBQTtNQUVBLElBQUcsSUFBSSxDQUFDLFVBQUwsQ0FBQSxDQUFIO1FBQ0UsUUFBUSxDQUFDLEdBQVQsQ0FBYSxpQkFBYixFQUFnQyxJ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a0IsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLElBQXZCLENBTGxCOztJQURrQixDQXRRcEI7O0FBVkYiLCJzb3VyY2VzQ29udGVudCI6WyJ7RGlzcG9zYWJsZSwgRW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuZ2xvYmFsU3RhdGUgPSByZXF1aXJlICcuL2dsb2JhbC1zdGF0ZSdcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblZpbVN0YXRlID0gcmVxdWlyZSAnLi92aW0tc3RhdGUnXG5mb3JFYWNoUGFuZUF4aXMgPSBudWxsXG5wYW5lVXRpbHMgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOiBzZXR0aW5ncy5jb25maWdcblxuICBnZXRTdGF0dXNCYXJNYW5hZ2VyOiAtPlxuICAgIEBzdGF0dXNCYXJNYW5hZ2VyID89IG5ldyAocmVxdWlyZSAnLi9zdGF0dXMtYmFyLW1hbmFnZXInKVxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIGdldEVkaXRvclN0YXRlID0gQGdldEVkaXRvclN0YXRlLmJpbmQodGhpcylcbiAgICBAc3Vic2NyaWJlKEJhc2UuaW5pdChnZXRFZGl0b3JTdGF0ZSkuLi4pXG4gICAgQHJlZ2lzdGVyQ29tbWFuZHMoKVxuICAgIEByZWdpc3RlclZpbVN0YXRlQ29tbWFuZHMoKVxuXG4gICAgc2V0dGluZ3Mubm90aWZ5RGVwcmVjYXRlZFBhcmFtcygpXG5cbiAgICBpZiBhdG9tLmluU3BlY01vZGUoKVxuICAgICAgc2V0dGluZ3Muc2V0KCdzdHJpY3RBc3NlcnRpb24nLCB0cnVlKVxuXG4gICAgaWYgYXRvbS5pbkRldk1vZGUoKVxuICAgICAgZGV2ZWxvcGVyID0gbmV3IChyZXF1aXJlICcuL2RldmVsb3BlcicpXG4gICAgICBAc3Vic2NyaWJlKGRldmVsb3Blci5pbml0KGdldEVkaXRvclN0YXRlKSlcblxuICAgIEBzdWJzY3JpYmUgQG9ic2VydmVWaW1Nb2RlIC0+XG4gICAgICBtZXNzYWdlID0gXCJcIlwiXG4gICAgICAgICMjIE1lc3NhZ2UgYnkgdmltLW1vZGUtcGx1czogdmltLW1vZGUgZGV0ZWN0ZWQhXG4gICAgICAgIFRvIHVzZSB2aW0tbW9kZS1wbHVzLCB5b3UgbXVzdCAqKmRpc2FibGUgdmltLW1vZGUqKiBtYW51YWxseS5cbiAgICAgICAgXCJcIlwiXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhtZXNzYWdlLCBkaXNtaXNzYWJsZTogdHJ1ZSlcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICBAY3JlYXRlVmltU3RhdGUoZWRpdG9yKSB1bmxlc3MgZWRpdG9yLmlzTWluaSgpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gPT5cbiAgICAgIEBkZW1heGltaXplUGFuZSgpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gLT5cbiAgICAgIGlmIHNldHRpbmdzLmdldCgnYXV0b21hdGljYWxseUVzY2FwZUluc2VydE1vZGVPbkFjdGl2ZVBhbmVJdGVtQ2hhbmdlJylcbiAgICAgICAgVmltU3RhdGUuZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICAgICAgdmltU3RhdGUuYWN0aXZhdGUoJ25vcm1hbCcpIGlmIHZpbVN0YXRlLm1vZGUgaXMgJ2luc2VydCdcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub25EaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbSAoaXRlbSkgPT5cbiAgICAgIGlmIGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihpdGVtKSBhbmQgbm90IGl0ZW0uaXNNaW5pKClcbiAgICAgICAgIyBTdGlsbCB0aGVyZSBpcyBwb3NzaWJpbGl0eSBlZGl0b3IgaXMgZGVzdHJveWVkIGFuZCBkb24ndCBoYXZlIGNvcnJlc3BvbmRpbmdcbiAgICAgICAgIyB2aW1TdGF0ZSAjMTk2LlxuICAgICAgICB2aW1TdGF0ZSA9IEBnZXRFZGl0b3JTdGF0ZShpdGVtKVxuICAgICAgICByZXR1cm4gdW5sZXNzIHZpbVN0YXRlP1xuICAgICAgICBpZiBnbG9iYWxTdGF0ZS5nZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nKVxuICAgICAgICAgIHZpbVN0YXRlLmhpZ2hsaWdodFNlYXJjaC5yZWZyZXNoKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZpbVN0YXRlLmdldFByb3AoJ2hpZ2hsaWdodFNlYXJjaCcpPy5yZWZyZXNoKClcblxuICAgICMgQHN1YnNjcmliZSAgZ2xvYmFsU3RhdGUuZ2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJylcbiAgICAjIFJlZnJlc2ggaGlnaGxpZ2h0IGJhc2VkIG9uIGdsb2JhbFN0YXRlLmhpZ2hsaWdodFNlYXJjaFBhdHRlcm4gY2hhbmdlcy5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBAc3Vic2NyaWJlIGdsb2JhbFN0YXRlLm9uRGlkQ2hhbmdlICh7bmFtZSwgbmV3VmFsdWV9KSAtPlxuICAgICAgaWYgbmFtZSBpcyAnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybidcbiAgICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgICBWaW1TdGF0ZS5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgICAgICAgIHZpbVN0YXRlLmhpZ2hsaWdodFNlYXJjaC5yZWZyZXNoKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFZpbVN0YXRlLmZvckVhY2ggKHZpbVN0YXRlKSAtPlxuICAgICAgICAgICAgIyBhdm9pZCBwb3B1bGF0ZSBwcm9wIHVubmVjZXNzYXJpbHkgb24gdmltU3RhdGUucmVzZXQgb24gc3RhcnR1cFxuICAgICAgICAgICAgaWYgdmltU3RhdGUuX19oaWdobGlnaHRTZWFyY2hcbiAgICAgICAgICAgICAgdmltU3RhdGUuaGlnaGxpZ2h0U2VhcmNoLmNsZWFyTWFya2VycygpXG5cbiAgICBAc3Vic2NyaWJlIHNldHRpbmdzLm9ic2VydmUgJ2hpZ2hsaWdodFNlYXJjaCcsIChuZXdWYWx1ZSkgLT5cbiAgICAgIGlmIG5ld1ZhbHVlXG4gICAgICAgICMgUmUtc2V0dGluZyB2YWx1ZSB0cmlnZ2VyIGhpZ2hsaWdodFNlYXJjaCByZWZyZXNoXG4gICAgICAgIGdsb2JhbFN0YXRlLnNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIGdsb2JhbFN0YXRlLmdldCgnbGFzdFNlYXJjaFBhdHRlcm4nKSlcbiAgICAgIGVsc2VcbiAgICAgICAgZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbnVsbClcblxuICAgIEBzdWJzY3JpYmUoc2V0dGluZ3Mub2JzZXJ2ZUNvbmRpdGlvbmFsS2V5bWFwcygpLi4uKVxuXG4gICAgaWYgc2V0dGluZ3MuZ2V0KCdkZWJ1ZycpXG4gICAgICBkZXZlbG9wZXI/LnJlcG9ydFJlcXVpcmVDYWNoZShleGNsdWRlTm9kTW9kdWxlczogZmFsc2UpXG5cbiAgb2JzZXJ2ZVZpbU1vZGU6IChmbikgLT5cbiAgICBmbigpIGlmIGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKCd2aW0tbW9kZScpXG4gICAgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSAocGFjaykgLT5cbiAgICAgIGZuKCkgaWYgcGFjay5uYW1lIGlzICd2aW0tbW9kZSdcblxuICAjICogYGZuYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIHZpbVN0YXRlIGluc3RhbmNlIHdhcyBjcmVhdGVkLlxuICAjICBVc2FnZTpcbiAgIyAgIG9uRGlkQWRkVmltU3RhdGUgKHZpbVN0YXRlKSAtPiBkbyBzb21ldGhpbmcuLlxuICAjIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9uRGlkQWRkVmltU3RhdGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1hZGQtdmltLXN0YXRlJywgZm4pXG5cbiAgIyAqIGBmbmAge0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2l0aCBhbGwgY3VycmVudCBhbmQgZnV0dXJlIHZpbVN0YXRlXG4gICMgIFVzYWdlOlxuICAjICAgb2JzZXJ2ZVZpbVN0YXRlcyAodmltU3RhdGUpIC0+IGRvIHNvbWV0aGluZy4uXG4gICMgUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb2JzZXJ2ZVZpbVN0YXRlczogKGZuKSAtPlxuICAgIFZpbVN0YXRlPy5mb3JFYWNoKGZuKVxuICAgIEBvbkRpZEFkZFZpbVN0YXRlKGZuKVxuXG4gIGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbkZvckVkaXRvcnM6IC0+XG4gICAgZm9yIGVkaXRvciBpbiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpXG4gICAgICBAZ2V0RWRpdG9yU3RhdGUoZWRpdG9yKS5jbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25zKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBkZW1heGltaXplUGFuZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBWaW1TdGF0ZT8uZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICB2aW1TdGF0ZS5kZXN0cm95KClcbiAgICBWaW1TdGF0ZT8uY2xlYXIoKVxuXG4gIHN1YnNjcmliZTogKGFyZ3MuLi4pIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkKGFyZ3MuLi4pXG5cbiAgdW5zdWJzY3JpYmU6IChhcmcpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMucmVtb3ZlKGFyZylcblxuICByZWdpc3RlckNvbW1hbmRzOiAtPlxuICAgIEBzdWJzY3JpYmUgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLFxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6Y2xlYXItaGlnaGxpZ2h0LXNlYXJjaCc6IC0+IGdsb2JhbFN0YXRlLnNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIG51bGwpXG4gICAgICAndmltLW1vZGUtcGx1czp0b2dnbGUtaGlnaGxpZ2h0LXNlYXJjaCc6IC0+IHNldHRpbmdzLnRvZ2dsZSgnaGlnaGxpZ2h0U2VhcmNoJylcbiAgICAgICd2aW0tbW9kZS1wbHVzOmNsZWFyLXBlcnNpc3RlbnQtc2VsZWN0aW9uJzogPT4gQGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbkZvckVkaXRvcnMoKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgXCJ2aW0tbW9kZS1wbHVzOm1heGltaXplLXBhbmVcIjogPT4gQG1heGltaXplUGFuZSgpXG4gICAgICBcInZpbS1tb2RlLXBsdXM6ZXF1YWxpemUtcGFuZXNcIjogPT4gQGVxdWFsaXplUGFuZXMoKVxuICAgICAgXCJ2aW0tbW9kZS1wbHVzOmV4Y2hhbmdlLXBhbmVcIjogPT4gQGV4Y2hhbmdlUGFuZSgpXG4gICAgICBcInZpbS1tb2RlLXBsdXM6bW92ZS1wYW5lLXRvLXZlcnktdG9wXCI6ID0+IEBtb3ZlUGFuZVRvVmVyeShcInRvcFwiKVxuICAgICAgXCJ2aW0tbW9kZS1wbHVzOm1vdmUtcGFuZS10by12ZXJ5LWJvdHRvbVwiOiA9PiBAbW92ZVBhbmVUb1ZlcnkoXCJib3R0b21cIilcbiAgICAgIFwidmltLW1vZGUtcGx1czptb3ZlLXBhbmUtdG8tdmVyeS1sZWZ0XCI6ID0+IEBtb3ZlUGFuZVRvVmVyeShcImxlZnRcIilcbiAgICAgIFwidmltLW1vZGUtcGx1czptb3ZlLXBhbmUtdG8tdmVyeS1yaWdodFwiOiA9PiBAbW92ZVBhbmVUb1ZlcnkoXCJyaWdodFwiKVxuXG4gIGV4Y2hhbmdlUGFuZTogLT5cbiAgICBwYW5lVXRpbHMgPz0gcmVxdWlyZShcIi4vcGFuZS11dGlsc1wiKVxuICAgIHBhbmVVdGlscy5leGNoYW5nZVBhbmUoKVxuXG4gIGRlbWF4aW1pemVQYW5lOiAtPlxuICAgIGlmIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlP1xuICAgICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZSA9IG51bGxcblxuICBtYXhpbWl6ZVBhbmU6IC0+XG4gICAgaWYgQG1heGltaXplUGFuZURpc3Bvc2FibGU/XG4gICAgICBAZGVtYXhpbWl6ZVBhbmUoKVxuICAgICAgcmV0dXJuXG5cbiAgICBwYW5lVXRpbHMgPz0gcmVxdWlyZShcIi4vcGFuZS11dGlsc1wiKVxuICAgIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlID0gcGFuZVV0aWxzLm1heGltaXplUGFuZSgpXG5cbiAgZXF1YWxpemVQYW5lczogLT5cbiAgICBwYW5lVXRpbHMgPz0gcmVxdWlyZShcIi4vcGFuZS11dGlsc1wiKVxuICAgIHBhbmVVdGlscy5lcXVhbGl6ZVBhbmVzKClcblxuICBtb3ZlUGFuZVRvVmVyeTogKGRpcmVjdGlvbikgLT5cbiAgICBwYW5lVXRpbHMgPz0gcmVxdWlyZShcIi4vcGFuZS11dGlsc1wiKVxuICAgIHBhbmVVdGlscy5tb3ZlUGFuZVRvVmVyeShkaXJlY3Rpb24pXG5cbiAgcmVnaXN0ZXJWaW1TdGF0ZUNvbW1hbmRzOiAtPlxuICAgICMgYWxsIGNvbW1hbmRzIGhlcmUgaXMgZXhlY3V0ZWQgd2l0aCBjb250ZXh0IHdoZXJlICd0aGlzJyBib3VuZCB0byAndmltU3RhdGUnXG4gICAgY29tbWFuZHMgPVxuICAgICAgJ2FjdGl2YXRlLW5vcm1hbC1tb2RlJzogLT4gQGFjdGl2YXRlKCdub3JtYWwnKVxuICAgICAgJ2FjdGl2YXRlLWxpbmV3aXNlLXZpc3VhbC1tb2RlJzogLT4gQGFjdGl2YXRlKCd2aXN1YWwnLCAnbGluZXdpc2UnKVxuICAgICAgJ2FjdGl2YXRlLWNoYXJhY3Rlcndpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJylcbiAgICAgICdhY3RpdmF0ZS1ibG9ja3dpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgJ3Jlc2V0LW5vcm1hbC1tb2RlJzogLT4gQHJlc2V0Tm9ybWFsTW9kZSh1c2VySW52b2NhdGlvbjogdHJ1ZSlcbiAgICAgICdzZXQtcmVnaXN0ZXItbmFtZSc6IC0+IEByZWdpc3Rlci5zZXROYW1lKCkgIyBcIlxuICAgICAgJ3NldC1yZWdpc3Rlci1uYW1lLXRvLV8nOiAtPiBAcmVnaXN0ZXIuc2V0TmFtZSgnXycpXG4gICAgICAnc2V0LXJlZ2lzdGVyLW5hbWUtdG8tKic6IC0+IEByZWdpc3Rlci5zZXROYW1lKCcqJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1jaGFyYWN0ZXJ3aXNlJzogLT4gQGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyKHdpc2U6ICdjaGFyYWN0ZXJ3aXNlJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1saW5ld2lzZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcih3aXNlOiAnbGluZXdpc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLW9jY3VycmVuY2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIob2NjdXJyZW5jZTogdHJ1ZSwgb2NjdXJyZW5jZVR5cGU6ICdiYXNlJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1zdWJ3b3JkLW9jY3VycmVuY2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIob2NjdXJyZW5jZTogdHJ1ZSwgb2NjdXJyZW5jZVR5cGU6ICdzdWJ3b3JkJylcbiAgICAgICdyZXBlYXQnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuUmVjb3JkZWQoKVxuICAgICAgJ3JlcGVhdC1maW5kJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRGaW5kKClcbiAgICAgICdyZXBlYXQtZmluZC1yZXZlcnNlJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRGaW5kKHJldmVyc2U6IHRydWUpXG4gICAgICAncmVwZWF0LXNlYXJjaCc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5DdXJyZW50U2VhcmNoKClcbiAgICAgICdyZXBlYXQtc2VhcmNoLXJldmVyc2UnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudFNlYXJjaChyZXZlcnNlOiB0cnVlKVxuICAgICAgJ3NldC1jb3VudC0wJzogLT4gQHNldENvdW50KDApXG4gICAgICAnc2V0LWNvdW50LTEnOiAtPiBAc2V0Q291bnQoMSlcbiAgICAgICdzZXQtY291bnQtMic6IC0+IEBzZXRDb3VudCgyKVxuICAgICAgJ3NldC1jb3VudC0zJzogLT4gQHNldENvdW50KDMpXG4gICAgICAnc2V0LWNvdW50LTQnOiAtPiBAc2V0Q291bnQoNClcbiAgICAgICdzZXQtY291bnQtNSc6IC0+IEBzZXRDb3VudCg1KVxuICAgICAgJ3NldC1jb3VudC02JzogLT4gQHNldENvdW50KDYpXG4gICAgICAnc2V0LWNvdW50LTcnOiAtPiBAc2V0Q291bnQoNylcbiAgICAgICdzZXQtY291bnQtOCc6IC0+IEBzZXRDb3VudCg4KVxuICAgICAgJ3NldC1jb3VudC05JzogLT4gQHNldENvdW50KDkpXG5cbiAgICBjaGFycyA9IFszMi4uMTI2XS5tYXAgKGNvZGUpIC0+IFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZSlcbiAgICBmb3IgY2hhciBpbiBjaGFyc1xuICAgICAgZG8gKGNoYXIpIC0+XG4gICAgICAgIGNoYXJGb3JLZXltYXAgPSBpZiBjaGFyIGlzICcgJyB0aGVuICdzcGFjZScgZWxzZSBjaGFyXG4gICAgICAgIGNvbW1hbmRzW1wic2V0LWlucHV0LWNoYXItI3tjaGFyRm9yS2V5bWFwfVwiXSA9IC0+XG4gICAgICAgICAgQGVtaXREaWRTZXRJbnB1dENoYXIoY2hhcilcblxuICAgIGdldEVkaXRvclN0YXRlID0gQGdldEVkaXRvclN0YXRlLmJpbmQodGhpcylcblxuICAgIGJpbmRUb1ZpbVN0YXRlID0gKG9sZENvbW1hbmRzKSAtPlxuICAgICAgbmV3Q29tbWFuZHMgPSB7fVxuICAgICAgZm9yIG5hbWUsIGZuIG9mIG9sZENvbW1hbmRzXG4gICAgICAgIGRvIChmbikgLT5cbiAgICAgICAgICBuZXdDb21tYW5kc1tcInZpbS1tb2RlLXBsdXM6I3tuYW1lfVwiXSA9IChldmVudCkgLT5cbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICBpZiB2aW1TdGF0ZSA9IGdldEVkaXRvclN0YXRlKEBnZXRNb2RlbCgpKVxuICAgICAgICAgICAgICBmbi5jYWxsKHZpbVN0YXRlLCBldmVudClcbiAgICAgIG5ld0NvbW1hbmRzXG5cbiAgICBAc3Vic2NyaWJlIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yOm5vdChbbWluaV0pJywgYmluZFRvVmltU3RhdGUoY29tbWFuZHMpKVxuXG4gIGNvbnN1bWVTdGF0dXNCYXI6IChzdGF0dXNCYXIpIC0+XG4gICAgc3RhdHVzQmFyTWFuYWdlciA9IEBnZXRTdGF0dXNCYXJNYW5hZ2VyKClcbiAgICBzdGF0dXNCYXJNYW5hZ2VyLmluaXRpYWxpemUoc3RhdHVzQmFyKVxuICAgIHN0YXR1c0Jhck1hbmFnZXIuYXR0YWNoKClcbiAgICBAc3Vic2NyaWJlIG5ldyBEaXNwb3NhYmxlIC0+XG4gICAgICBzdGF0dXNCYXJNYW5hZ2VyLmRldGFjaCgpXG5cbiAgY29uc3VtZURlbW9Nb2RlOiAoe29uV2lsbEFkZEl0ZW0sIG9uRGlkU3RhcnQsIG9uRGlkU3RvcCwgb25EaWRSZW1vdmVIb3Zlcn0pIC0+XG4gICAgQHN1YnNjcmliZShcbiAgICAgIG9uRGlkU3RhcnQoLT4gZ2xvYmFsU3RhdGUuc2V0KCdkZW1vTW9kZUlzQWN0aXZlJywgdHJ1ZSkpXG4gICAgICBvbkRpZFN0b3AoLT4gZ2xvYmFsU3RhdGUuc2V0KCdkZW1vTW9kZUlzQWN0aXZlJywgZmFsc2UpKVxuICAgICAgb25EaWRSZW1vdmVIb3ZlcihAZGVzdHJveUFsbERlbW9Nb2RlRmxhc2hlTWFya2Vycy5iaW5kKHRoaXMpKVxuICAgICAgb25XaWxsQWRkSXRlbSgoe2l0ZW0sIGV2ZW50fSkgPT5cbiAgICAgICAgaWYgZXZlbnQuYmluZGluZy5jb21tYW5kLnN0YXJ0c1dpdGgoJ3ZpbS1tb2RlLXBsdXM6JylcbiAgICAgICAgICBjb21tYW5kRWxlbWVudCA9IGl0ZW0uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY29tbWFuZCcpWzBdXG4gICAgICAgICAgY29tbWFuZEVsZW1lbnQudGV4dENvbnRlbnQgPSBjb21tYW5kRWxlbWVudC50ZXh0Q29udGVudC5yZXBsYWNlKC9edmltLW1vZGUtcGx1czovLCAnJylcblxuICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgna2luZCcsICdwdWxsLXJpZ2h0JylcbiAgICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IEBnZXRLaW5kRm9yQ29tbWFuZChldmVudC5iaW5kaW5nLmNvbW1hbmQpXG4gICAgICAgIGl0ZW0uYXBwZW5kQ2hpbGQoZWxlbWVudClcbiAgICAgIClcbiAgICApXG5cbiAgZGVzdHJveUFsbERlbW9Nb2RlRmxhc2hlTWFya2VyczogLT5cbiAgICBWaW1TdGF0ZT8uZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICB2aW1TdGF0ZS5mbGFzaE1hbmFnZXIuZGVzdHJveURlbW9Nb2RlTWFya2VycygpXG5cbiAgZ2V0S2luZEZvckNvbW1hbmQ6IChjb21tYW5kKSAtPlxuICAgIGlmIGNvbW1hbmQuc3RhcnRzV2l0aCgndmltLW1vZGUtcGx1cycpXG4gICAgICBjb21tYW5kID0gY29tbWFuZC5yZXBsYWNlKC9edmltLW1vZGUtcGx1czovLCAnJylcbiAgICAgIGlmIGNvbW1hbmQuc3RhcnRzV2l0aCgnb3BlcmF0b3ItbW9kaWZpZXInKVxuICAgICAgICBraW5kID0gJ29wLW1vZGlmaWVyJ1xuICAgICAgZWxzZVxuICAgICAgICBCYXNlLmdldEtpbmRGb3JDb21tYW5kTmFtZShjb21tYW5kKSA/ICd2bXAtb3RoZXInXG4gICAgZWxzZVxuICAgICAgJ25vbi12bXAnXG5cbiAgY3JlYXRlVmltU3RhdGU6IChlZGl0b3IpIC0+XG4gICAgdmltU3RhdGUgPSBuZXcgVmltU3RhdGUoZWRpdG9yLCBAZ2V0U3RhdHVzQmFyTWFuYWdlcigpLCBnbG9iYWxTdGF0ZSlcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtYWRkLXZpbS1zdGF0ZScsIHZpbVN0YXRlKVxuXG4gIGNyZWF0ZVZpbVN0YXRlSWZOZWNlc3Nhcnk6IChlZGl0b3IpIC0+XG4gICAgcmV0dXJuIGlmIFZpbVN0YXRlLmhhcyhlZGl0b3IpXG4gICAgdmltU3RhdGUgPSBuZXcgVmltU3RhdGUoZWRpdG9yLCBAZ2V0U3RhdHVzQmFyTWFuYWdlcigpLCBnbG9iYWxTdGF0ZSlcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtYWRkLXZpbS1zdGF0ZScsIHZpbVN0YXRlKVxuXG4gICMgU2VydmljZSBBUElcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGdldEdsb2JhbFN0YXRlOiAtPlxuICAgIGdsb2JhbFN0YXRlXG5cbiAgZ2V0RWRpdG9yU3RhdGU6IChlZGl0b3IpIC0+XG4gICAgVmltU3RhdGUuZ2V0QnlFZGl0b3IoZWRpdG9yKVxuXG4gIHByb3ZpZGVWaW1Nb2RlUGx1czogLT5cbiAgICBCYXNlOiBCYXNlXG4gICAgcmVnaXN0ZXJDb21tYW5kRnJvbVNwZWM6IEJhc2UucmVnaXN0ZXJDb21tYW5kRnJvbVNwZWNcbiAgICBnZXRHbG9iYWxTdGF0ZTogQGdldEdsb2JhbFN0YXRlXG4gICAgZ2V0RWRpdG9yU3RhdGU6IEBnZXRFZGl0b3JTdGF0ZVxuICAgIG9ic2VydmVWaW1TdGF0ZXM6IEBvYnNlcnZlVmltU3RhdGVzLmJpbmQodGhpcylcbiAgICBvbkRpZEFkZFZpbVN0YXRlOiBAb25EaWRBZGRWaW1TdGF0ZS5iaW5kKHRoaXMpXG4iXX0=
