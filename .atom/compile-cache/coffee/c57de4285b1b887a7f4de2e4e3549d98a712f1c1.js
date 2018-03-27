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
      this.subscribe(settings.observe('highlightSearch', function(newValue) {
        if (newValue) {
          return globalState.set('highlightSearchPattern', globalState.get('lastSearchPattern'));
        } else {
          return globalState.set('highlightSearchPattern', null);
        }
      }));
      return this.subscribe.apply(this, settings.observeConditionalKeymaps());
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
    subscribe: function() {
      var args, ref2;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref2 = this.subscriptions).add.apply(ref2, args);
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
      return VimState.forEach(function(vimState) {
        return vimState.flashManager.destroyDemoModeMarkers();
      });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwrSkFBQTtJQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosTUFBNkMsT0FBQSxDQUFRLE1BQVIsQ0FBN0MsRUFBQywyQkFBRCxFQUFhLHFCQUFiLEVBQXNCOztFQUV0QixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHNCQUFSOztFQUNuQixXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsT0FBbUQsT0FBQSxDQUFRLFNBQVIsQ0FBbkQsRUFBQyxzQ0FBRCxFQUFrQixnQ0FBbEIsRUFBZ0M7O0VBRWhDLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQVEsUUFBUSxDQUFDLE1BQWpCO0lBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFJO01BQ3hCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLE9BQUEsR0FBVSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtNQUNWLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLENBQVg7TUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSx3QkFBRCxDQUFBO01BRUEsSUFBRyxJQUFJLENBQUMsVUFBTCxDQUFBLENBQUg7UUFDRSxRQUFRLENBQUMsR0FBVCxDQUFhLGlCQUFiLEVBQWdDLElBQWhDLEVBREY7O01BR0EsSUFB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QjtRQUFBLElBQUEsRUFBTSxJQUFOO1FBQ0EsY0FBQSxFQUFnQixJQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLElBQXJCLENBRGhCO1FBRUEsY0FBQSxFQUFnQixJQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLElBQXJCLENBRmhCO1FBR0EsZ0JBQUEsRUFBa0IsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLElBQXZCLENBSGxCO1FBSUEsZ0JBQUEsRUFBa0IsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLElBQXZCLENBSmxCOztJQURrQixDQWxQcEI7O0FBWkYiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG57RGlzcG9zYWJsZSwgRW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuU3RhdHVzQmFyTWFuYWdlciA9IHJlcXVpcmUgJy4vc3RhdHVzLWJhci1tYW5hZ2VyJ1xuZ2xvYmFsU3RhdGUgPSByZXF1aXJlICcuL2dsb2JhbC1zdGF0ZSdcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblZpbVN0YXRlID0gcmVxdWlyZSAnLi92aW0tc3RhdGUnXG57Zm9yRWFjaFBhbmVBeGlzLCBhZGRDbGFzc0xpc3QsIHJlbW92ZUNsYXNzTGlzdH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzogc2V0dGluZ3MuY29uZmlnXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN0YXR1c0Jhck1hbmFnZXIgPSBuZXcgU3RhdHVzQmFyTWFuYWdlclxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIHNlcnZpY2UgPSBAcHJvdmlkZVZpbU1vZGVQbHVzKClcbiAgICBAc3Vic2NyaWJlKEJhc2UuaW5pdChzZXJ2aWNlKSlcbiAgICBAcmVnaXN0ZXJDb21tYW5kcygpXG4gICAgQHJlZ2lzdGVyVmltU3RhdGVDb21tYW5kcygpXG5cbiAgICBpZiBhdG9tLmluU3BlY01vZGUoKVxuICAgICAgc2V0dGluZ3Muc2V0KCdzdHJpY3RBc3NlcnRpb24nLCB0cnVlKVxuXG4gICAgaWYgYXRvbS5pbkRldk1vZGUoKVxuICAgICAgZGV2ZWxvcGVyID0gbmV3IChyZXF1aXJlICcuL2RldmVsb3BlcicpXG4gICAgICBAc3Vic2NyaWJlKGRldmVsb3Blci5pbml0KHNlcnZpY2UpKVxuXG4gICAgQHN1YnNjcmliZSBAb2JzZXJ2ZVZpbU1vZGUgLT5cbiAgICAgIG1lc3NhZ2UgPSBcIlwiXCJcbiAgICAgICAgIyMgTWVzc2FnZSBieSB2aW0tbW9kZS1wbHVzOiB2aW0tbW9kZSBkZXRlY3RlZCFcbiAgICAgICAgVG8gdXNlIHZpbS1tb2RlLXBsdXMsIHlvdSBtdXN0ICoqZGlzYWJsZSB2aW0tbW9kZSoqIG1hbnVhbGx5LlxuICAgICAgICBcIlwiXCJcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKG1lc3NhZ2UsIGRpc21pc3NhYmxlOiB0cnVlKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIHJldHVybiBpZiBlZGl0b3IuaXNNaW5pKClcbiAgICAgIHZpbVN0YXRlID0gbmV3IFZpbVN0YXRlKGVkaXRvciwgQHN0YXR1c0Jhck1hbmFnZXIsIGdsb2JhbFN0YXRlKVxuICAgICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWFkZC12aW0tc3RhdGUnLCB2aW1TdGF0ZSlcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lKEBkZW1heGltaXplUGFuZS5iaW5kKHRoaXMpKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIC0+XG4gICAgICBpZiBzZXR0aW5ncy5nZXQoJ2F1dG9tYXRpY2FsbHlFc2NhcGVJbnNlcnRNb2RlT25BY3RpdmVQYW5lSXRlbUNoYW5nZScpXG4gICAgICAgIFZpbVN0YXRlLmZvckVhY2ggKHZpbVN0YXRlKSAtPlxuICAgICAgICAgIHZpbVN0YXRlLmFjdGl2YXRlKCdub3JtYWwnKSBpZiB2aW1TdGF0ZS5tb2RlIGlzICdpbnNlcnQnXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9uRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0gKGl0ZW0pID0+XG4gICAgICBpZiBhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IoaXRlbSlcbiAgICAgICAgIyBTdGlsbCB0aGVyZSBpcyBwb3NzaWJpbGl0eSBlZGl0b3IgaXMgZGVzdHJveWVkIGFuZCBkb24ndCBoYXZlIGNvcnJlc3BvbmRpbmdcbiAgICAgICAgIyB2aW1TdGF0ZSAjMTk2LlxuICAgICAgICBAZ2V0RWRpdG9yU3RhdGUoaXRlbSk/LmhpZ2hsaWdodFNlYXJjaC5yZWZyZXNoKClcblxuICAgIEBzdWJzY3JpYmUgc2V0dGluZ3Mub2JzZXJ2ZSAnaGlnaGxpZ2h0U2VhcmNoJywgKG5ld1ZhbHVlKSAtPlxuICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgIyBSZS1zZXR0aW5nIHZhbHVlIHRyaWdnZXIgaGlnaGxpZ2h0U2VhcmNoIHJlZnJlc2hcbiAgICAgICAgZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0U2VhcmNoUGF0dGVybicpKVxuICAgICAgZWxzZVxuICAgICAgICBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBudWxsKVxuXG4gICAgQHN1YnNjcmliZShzZXR0aW5ncy5vYnNlcnZlQ29uZGl0aW9uYWxLZXltYXBzKCkuLi4pXG5cbiAgb2JzZXJ2ZVZpbU1vZGU6IChmbikgLT5cbiAgICBmbigpIGlmIGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKCd2aW0tbW9kZScpXG4gICAgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSAocGFjaykgLT5cbiAgICAgIGZuKCkgaWYgcGFjay5uYW1lIGlzICd2aW0tbW9kZSdcblxuICAjICogYGZuYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIHZpbVN0YXRlIGluc3RhbmNlIHdhcyBjcmVhdGVkLlxuICAjICBVc2FnZTpcbiAgIyAgIG9uRGlkQWRkVmltU3RhdGUgKHZpbVN0YXRlKSAtPiBkbyBzb21ldGhpbmcuLlxuICAjIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9uRGlkQWRkVmltU3RhdGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1hZGQtdmltLXN0YXRlJywgZm4pXG5cbiAgIyAqIGBmbmAge0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2l0aCBhbGwgY3VycmVudCBhbmQgZnV0dXJlIHZpbVN0YXRlXG4gICMgIFVzYWdlOlxuICAjICAgb2JzZXJ2ZVZpbVN0YXRlcyAodmltU3RhdGUpIC0+IGRvIHNvbWV0aGluZy4uXG4gICMgUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb2JzZXJ2ZVZpbVN0YXRlczogKGZuKSAtPlxuICAgIFZpbVN0YXRlLmZvckVhY2goZm4pXG4gICAgQG9uRGlkQWRkVmltU3RhdGUoZm4pXG5cbiAgY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uRm9yRWRpdG9yczogLT5cbiAgICBmb3IgZWRpdG9yIGluIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICAgIEBnZXRFZGl0b3JTdGF0ZShlZGl0b3IpLmNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbnMoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgVmltU3RhdGUuZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICB2aW1TdGF0ZS5kZXN0cm95KClcbiAgICBWaW1TdGF0ZS5jbGVhcigpXG5cbiAgc3Vic2NyaWJlOiAoYXJncy4uLikgLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoYXJncy4uLilcblxuICB1bnN1YnNjcmliZTogKGFyZykgLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUoYXJnKVxuXG4gIHJlZ2lzdGVyQ29tbWFuZHM6IC0+XG4gICAgQHN1YnNjcmliZSBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsXG4gICAgICAndmltLW1vZGUtcGx1czpjbGVhci1oaWdobGlnaHQtc2VhcmNoJzogLT4gZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbnVsbClcbiAgICAgICd2aW0tbW9kZS1wbHVzOnRvZ2dsZS1oaWdobGlnaHQtc2VhcmNoJzogLT4gc2V0dGluZ3MudG9nZ2xlKCdoaWdobGlnaHRTZWFyY2gnKVxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6Y2xlYXItcGVyc2lzdGVudC1zZWxlY3Rpb24nOiA9PiBAY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uRm9yRWRpdG9ycygpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAndmltLW1vZGUtcGx1czptYXhpbWl6ZS1wYW5lJzogPT4gQG1heGltaXplUGFuZSgpXG4gICAgICAndmltLW1vZGUtcGx1czplcXVhbGl6ZS1wYW5lcyc6ID0+IEBlcXVhbGl6ZVBhbmVzKClcblxuICBkZW1heGltaXplUGFuZTogLT5cbiAgICBpZiBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZT9cbiAgICAgIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgQHVuc3Vic2NyaWJlKEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlKVxuICAgICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUgPSBudWxsXG5cbiAgbWF4aW1pemVQYW5lOiAtPlxuICAgIGlmIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlP1xuICAgICAgQGRlbWF4aW1pemVQYW5lKClcbiAgICAgIHJldHVyblxuXG4gICAgZ2V0VmlldyA9IChtb2RlbCkgLT4gYXRvbS52aWV3cy5nZXRWaWV3KG1vZGVsKVxuICAgIGNsYXNzUGFuZU1heGltaXplZCA9ICd2aW0tbW9kZS1wbHVzLS1wYW5lLW1heGltaXplZCdcbiAgICBjbGFzc0hpZGVUYWJCYXIgPSAndmltLW1vZGUtcGx1cy0taGlkZS10YWItYmFyJ1xuICAgIGNsYXNzSGlkZVN0YXR1c0JhciA9ICd2aW0tbW9kZS1wbHVzLS1oaWRlLXN0YXR1cy1iYXInXG4gICAgY2xhc3NBY3RpdmVQYW5lQXhpcyA9ICd2aW0tbW9kZS1wbHVzLS1hY3RpdmUtcGFuZS1heGlzJ1xuXG4gICAgd29ya3NwYWNlRWxlbWVudCA9IGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgcGFuZUVsZW1lbnQgPSBnZXRWaWV3KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKSlcblxuICAgIHdvcmtzcGFjZUNsYXNzTmFtZXMgPSBbY2xhc3NQYW5lTWF4aW1pemVkXVxuICAgIHdvcmtzcGFjZUNsYXNzTmFtZXMucHVzaChjbGFzc0hpZGVUYWJCYXIpIGlmIHNldHRpbmdzLmdldCgnaGlkZVRhYkJhck9uTWF4aW1pemVQYW5lJylcbiAgICB3b3Jrc3BhY2VDbGFzc05hbWVzLnB1c2goY2xhc3NIaWRlU3RhdHVzQmFyKSBpZiBzZXR0aW5ncy5nZXQoJ2hpZGVTdGF0dXNCYXJPbk1heGltaXplUGFuZScpXG5cbiAgICBhZGRDbGFzc0xpc3Qod29ya3NwYWNlRWxlbWVudCwgd29ya3NwYWNlQ2xhc3NOYW1lcy4uLilcblxuICAgIGZvckVhY2hQYW5lQXhpcyAoYXhpcykgLT5cbiAgICAgIHBhbmVBeGlzRWxlbWVudCA9IGdldFZpZXcoYXhpcylcbiAgICAgIGlmIHBhbmVBeGlzRWxlbWVudC5jb250YWlucyhwYW5lRWxlbWVudClcbiAgICAgICAgYWRkQ2xhc3NMaXN0KHBhbmVBeGlzRWxlbWVudCwgY2xhc3NBY3RpdmVQYW5lQXhpcylcblxuICAgIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlID0gbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgIGZvckVhY2hQYW5lQXhpcyAoYXhpcykgLT5cbiAgICAgICAgcmVtb3ZlQ2xhc3NMaXN0KGdldFZpZXcoYXhpcyksIGNsYXNzQWN0aXZlUGFuZUF4aXMpXG4gICAgICByZW1vdmVDbGFzc0xpc3Qod29ya3NwYWNlRWxlbWVudCwgd29ya3NwYWNlQ2xhc3NOYW1lcy4uLilcblxuICAgIEBzdWJzY3JpYmUoQG1heGltaXplUGFuZURpc3Bvc2FibGUpXG5cbiAgZXF1YWxpemVQYW5lczogLT5cbiAgICBzZXRGbGV4U2NhbGUgPSAobmV3VmFsdWUsIGJhc2UpIC0+XG4gICAgICBiYXNlID89IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5nZXRDb250YWluZXIoKS5nZXRSb290KClcbiAgICAgIGJhc2Uuc2V0RmxleFNjYWxlKG5ld1ZhbHVlKVxuICAgICAgZm9yIGNoaWxkIGluIGJhc2UuY2hpbGRyZW4gPyBbXVxuICAgICAgICBzZXRGbGV4U2NhbGUobmV3VmFsdWUsIGNoaWxkKVxuXG4gICAgc2V0RmxleFNjYWxlKDEpXG5cbiAgcmVnaXN0ZXJWaW1TdGF0ZUNvbW1hbmRzOiAtPlxuICAgICMgYWxsIGNvbW1hbmRzIGhlcmUgaXMgZXhlY3V0ZWQgd2l0aCBjb250ZXh0IHdoZXJlICd0aGlzJyBib3VuZCB0byAndmltU3RhdGUnXG4gICAgY29tbWFuZHMgPVxuICAgICAgJ2FjdGl2YXRlLW5vcm1hbC1tb2RlJzogLT4gQGFjdGl2YXRlKCdub3JtYWwnKVxuICAgICAgJ2FjdGl2YXRlLWxpbmV3aXNlLXZpc3VhbC1tb2RlJzogLT4gQGFjdGl2YXRlKCd2aXN1YWwnLCAnbGluZXdpc2UnKVxuICAgICAgJ2FjdGl2YXRlLWNoYXJhY3Rlcndpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJylcbiAgICAgICdhY3RpdmF0ZS1ibG9ja3dpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgJ3Jlc2V0LW5vcm1hbC1tb2RlJzogLT4gQHJlc2V0Tm9ybWFsTW9kZSh1c2VySW52b2NhdGlvbjogdHJ1ZSlcbiAgICAgICdzZXQtcmVnaXN0ZXItbmFtZSc6IC0+IEByZWdpc3Rlci5zZXROYW1lKCkgIyBcIlxuICAgICAgJ3NldC1yZWdpc3Rlci1uYW1lLXRvLV8nOiAtPiBAcmVnaXN0ZXIuc2V0TmFtZSgnXycpXG4gICAgICAnc2V0LXJlZ2lzdGVyLW5hbWUtdG8tKic6IC0+IEByZWdpc3Rlci5zZXROYW1lKCcqJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1jaGFyYWN0ZXJ3aXNlJzogLT4gQGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyKHdpc2U6ICdjaGFyYWN0ZXJ3aXNlJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1saW5ld2lzZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcih3aXNlOiAnbGluZXdpc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLW9jY3VycmVuY2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIob2NjdXJyZW5jZTogdHJ1ZSwgb2NjdXJyZW5jZVR5cGU6ICdiYXNlJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1zdWJ3b3JkLW9jY3VycmVuY2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIob2NjdXJyZW5jZTogdHJ1ZSwgb2NjdXJyZW5jZVR5cGU6ICdzdWJ3b3JkJylcbiAgICAgICdyZXBlYXQnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuUmVjb3JkZWQoKVxuICAgICAgJ3JlcGVhdC1maW5kJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRGaW5kKClcbiAgICAgICdyZXBlYXQtZmluZC1yZXZlcnNlJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRGaW5kKHJldmVyc2U6IHRydWUpXG4gICAgICAncmVwZWF0LXNlYXJjaCc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5DdXJyZW50U2VhcmNoKClcbiAgICAgICdyZXBlYXQtc2VhcmNoLXJldmVyc2UnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudFNlYXJjaChyZXZlcnNlOiB0cnVlKVxuICAgICAgJ3NldC1jb3VudC0wJzogLT4gQHNldENvdW50KDApXG4gICAgICAnc2V0LWNvdW50LTEnOiAtPiBAc2V0Q291bnQoMSlcbiAgICAgICdzZXQtY291bnQtMic6IC0+IEBzZXRDb3VudCgyKVxuICAgICAgJ3NldC1jb3VudC0zJzogLT4gQHNldENvdW50KDMpXG4gICAgICAnc2V0LWNvdW50LTQnOiAtPiBAc2V0Q291bnQoNClcbiAgICAgICdzZXQtY291bnQtNSc6IC0+IEBzZXRDb3VudCg1KVxuICAgICAgJ3NldC1jb3VudC02JzogLT4gQHNldENvdW50KDYpXG4gICAgICAnc2V0LWNvdW50LTcnOiAtPiBAc2V0Q291bnQoNylcbiAgICAgICdzZXQtY291bnQtOCc6IC0+IEBzZXRDb3VudCg4KVxuICAgICAgJ3NldC1jb3VudC05JzogLT4gQHNldENvdW50KDkpXG5cbiAgICBjaGFycyA9IFszMi4uMTI2XS5tYXAgKGNvZGUpIC0+IFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZSlcbiAgICBmb3IgY2hhciBpbiBjaGFyc1xuICAgICAgZG8gKGNoYXIpIC0+XG4gICAgICAgIGNoYXJGb3JLZXltYXAgPSBpZiBjaGFyIGlzICcgJyB0aGVuICdzcGFjZScgZWxzZSBjaGFyXG4gICAgICAgIGNvbW1hbmRzW1wic2V0LWlucHV0LWNoYXItI3tjaGFyRm9yS2V5bWFwfVwiXSA9IC0+XG4gICAgICAgICAgQGVtaXREaWRTZXRJbnB1dENoYXIoY2hhcilcblxuICAgIGdldEVkaXRvclN0YXRlID0gQGdldEVkaXRvclN0YXRlLmJpbmQodGhpcylcblxuICAgIGJpbmRUb1ZpbVN0YXRlID0gKG9sZENvbW1hbmRzKSAtPlxuICAgICAgbmV3Q29tbWFuZHMgPSB7fVxuICAgICAgZm9yIG5hbWUsIGZuIG9mIG9sZENvbW1hbmRzXG4gICAgICAgIGRvIChmbikgLT5cbiAgICAgICAgICBuZXdDb21tYW5kc1tcInZpbS1tb2RlLXBsdXM6I3tuYW1lfVwiXSA9IChldmVudCkgLT5cbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICBpZiB2aW1TdGF0ZSA9IGdldEVkaXRvclN0YXRlKEBnZXRNb2RlbCgpKVxuICAgICAgICAgICAgICBmbi5jYWxsKHZpbVN0YXRlLCBldmVudClcbiAgICAgIG5ld0NvbW1hbmRzXG5cbiAgICBAc3Vic2NyaWJlIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yOm5vdChbbWluaV0pJywgYmluZFRvVmltU3RhdGUoY29tbWFuZHMpKVxuXG4gIGNvbnN1bWVTdGF0dXNCYXI6IChzdGF0dXNCYXIpIC0+XG4gICAgQHN0YXR1c0Jhck1hbmFnZXIuaW5pdGlhbGl6ZShzdGF0dXNCYXIpXG4gICAgQHN0YXR1c0Jhck1hbmFnZXIuYXR0YWNoKClcbiAgICBAc3Vic2NyaWJlIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAc3RhdHVzQmFyTWFuYWdlci5kZXRhY2goKVxuXG4gIGNvbnN1bWVEZW1vTW9kZTogKHtvbldpbGxBZGRJdGVtLCBvbkRpZFN0YXJ0LCBvbkRpZFN0b3AsIG9uRGlkUmVtb3ZlSG92ZXJ9KSAtPlxuICAgIEBzdWJzY3JpYmUoXG4gICAgICBvbkRpZFN0YXJ0KC0+IGdsb2JhbFN0YXRlLnNldCgnZGVtb01vZGVJc0FjdGl2ZScsIHRydWUpKVxuICAgICAgb25EaWRTdG9wKC0+IGdsb2JhbFN0YXRlLnNldCgnZGVtb01vZGVJc0FjdGl2ZScsIGZhbHNlKSlcbiAgICAgIG9uRGlkUmVtb3ZlSG92ZXIoQGRlc3Ryb3lBbGxEZW1vTW9kZUZsYXNoZU1hcmtlcnMuYmluZCh0aGlzKSlcbiAgICAgIG9uV2lsbEFkZEl0ZW0oKHtpdGVtLCBldmVudH0pID0+XG4gICAgICAgIGlmIGV2ZW50LmJpbmRpbmcuY29tbWFuZC5zdGFydHNXaXRoKCd2aW0tbW9kZS1wbHVzOicpXG4gICAgICAgICAgY29tbWFuZEVsZW1lbnQgPSBpdGVtLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NvbW1hbmQnKVswXVxuICAgICAgICAgIGNvbW1hbmRFbGVtZW50LnRleHRDb250ZW50ID0gY29tbWFuZEVsZW1lbnQudGV4dENvbnRlbnQucmVwbGFjZSgvXnZpbS1tb2RlLXBsdXM6LywgJycpXG5cbiAgICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2tpbmQnLCAncHVsbC1yaWdodCcpXG4gICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSBAZ2V0S2luZEZvckNvbW1hbmQoZXZlbnQuYmluZGluZy5jb21tYW5kKVxuICAgICAgICBpdGVtLmFwcGVuZENoaWxkKGVsZW1lbnQpXG4gICAgICApXG4gICAgKVxuXG4gIGRlc3Ryb3lBbGxEZW1vTW9kZUZsYXNoZU1hcmtlcnM6IC0+XG4gICAgVmltU3RhdGUuZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICB2aW1TdGF0ZS5mbGFzaE1hbmFnZXIuZGVzdHJveURlbW9Nb2RlTWFya2VycygpXG5cbiAgZ2V0S2luZEZvckNvbW1hbmQ6IChjb21tYW5kKSAtPlxuICAgIGlmIGNvbW1hbmQuc3RhcnRzV2l0aCgndmltLW1vZGUtcGx1cycpXG4gICAgICBjb21tYW5kID0gY29tbWFuZC5yZXBsYWNlKC9edmltLW1vZGUtcGx1czovLCAnJylcbiAgICAgIGlmIGNvbW1hbmQuc3RhcnRzV2l0aCgnb3BlcmF0b3ItbW9kaWZpZXInKVxuICAgICAgICBraW5kID0gJ29wLW1vZGlmaWVyJ1xuICAgICAgZWxzZVxuICAgICAgICBCYXNlLmdldEtpbmRGb3JDb21tYW5kTmFtZShjb21tYW5kKSA/ICd2bXAtb3RoZXInXG4gICAgZWxzZVxuICAgICAgJ25vbi12bXAnXG5cbiAgIyBTZXJ2aWNlIEFQSVxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0R2xvYmFsU3RhdGU6IC0+XG4gICAgZ2xvYmFsU3RhdGVcblxuICBnZXRFZGl0b3JTdGF0ZTogKGVkaXRvcikgLT5cbiAgICBWaW1TdGF0ZS5nZXRCeUVkaXRvcihlZGl0b3IpXG5cbiAgcHJvdmlkZVZpbU1vZGVQbHVzOiAtPlxuICAgIEJhc2U6IEJhc2VcbiAgICBnZXRHbG9iYWxTdGF0ZTogQGdldEdsb2JhbFN0YXRlLmJpbmQodGhpcylcbiAgICBnZXRFZGl0b3JTdGF0ZTogQGdldEVkaXRvclN0YXRlLmJpbmQodGhpcylcbiAgICBvYnNlcnZlVmltU3RhdGVzOiBAb2JzZXJ2ZVZpbVN0YXRlcy5iaW5kKHRoaXMpXG4gICAgb25EaWRBZGRWaW1TdGF0ZTogQG9uRGlkQWRkVmltU3RhdGUuYmluZCh0aGlzKVxuIl19
