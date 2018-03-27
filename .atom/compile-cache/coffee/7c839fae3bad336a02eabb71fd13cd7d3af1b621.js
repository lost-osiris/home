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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwrSkFBQTtJQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosTUFBNkMsT0FBQSxDQUFRLE1BQVIsQ0FBN0MsRUFBQywyQkFBRCxFQUFhLHFCQUFiLEVBQXNCOztFQUV0QixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHNCQUFSOztFQUNuQixXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsT0FBbUQsT0FBQSxDQUFRLFNBQVIsQ0FBbkQsRUFBQyxzQ0FBRCxFQUFrQixnQ0FBbEIsRUFBZ0M7O0VBRWhDLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQVEsUUFBUSxDQUFDLE1BQWpCO0lBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFJO01BQ3hCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLE9BQUEsR0FBVSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtNQUNWLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLENBQVg7TUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSx3QkFBRCxDQUFBO01BRUEsSUFBRyxJQUFJLENBQUMsVUFBTCxDQUFBLENBQUg7UUFDRSxRQUFRLENBQUMsR0FBVCxDQUFhLGlCQUFiLEVBQWdDLElBQWhDLEVBREY7O01BR0EsSUFB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LFNBQUQsQ0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsOEJBQWxCLEVBQWtELGNBQUEsQ0FBZSxRQUFmLENBQWxELENBQVg7SUFsRHdCLENBL0kxQjtJQW1NQSxnQkFBQSxFQUFrQixTQUFDLFNBQUQ7TUFDaEIsSUFBQyxDQUFBLGdCQUFnQixDQUFDLFVBQWxCLENBQTZCLFNBQTdCO01BQ0EsSUFBQyxDQUFBLGdCQUFnQixDQUFDLE1BQWxCLENBQUE7YUFDQSxJQUFDLENBQUEsU0FBRCxDQUFlLElBQUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDeEIsS0FBQyxDQUFBLGdCQUFnQixDQUFDLE1BQWxCLENBQUE7UUFEd0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FBZjtJQUhnQixDQW5NbEI7SUEyTUEsY0FBQSxFQUFnQixTQUFBO2FBQ2Q7SUFEYyxDQTNNaEI7SUE4TUEsY0FBQSxFQUFnQixTQUFDLE1BQUQ7YUFDZCxRQUFRLENBQUMsV0FBVCxDQUFxQixNQUFyQjtJQURjLENBOU1oQjtJQWlOQSxrQkFBQSxFQUFvQixTQUFBO2FBQ2xCO1FBQUEsSUFBQSxFQUFNLElBQU47UUFDQSxjQUFBLEVBQWdCLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsQ0FEaEI7UUFFQSxjQUFBLEVBQWdCLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsQ0FGaEI7UUFHQSxnQkFBQSxFQUFrQixJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FIbEI7UUFJQSxnQkFBQSxFQUFrQixJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FKbEI7O0lBRGtCLENBak5wQjs7QUFaRiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbntEaXNwb3NhYmxlLCBFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5TdGF0dXNCYXJNYW5hZ2VyID0gcmVxdWlyZSAnLi9zdGF0dXMtYmFyLW1hbmFnZXInXG5nbG9iYWxTdGF0ZSA9IHJlcXVpcmUgJy4vZ2xvYmFsLXN0YXRlJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuVmltU3RhdGUgPSByZXF1aXJlICcuL3ZpbS1zdGF0ZSdcbntmb3JFYWNoUGFuZUF4aXMsIGFkZENsYXNzTGlzdCwgcmVtb3ZlQ2xhc3NMaXN0fSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOiBzZXR0aW5ncy5jb25maWdcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3RhdHVzQmFyTWFuYWdlciA9IG5ldyBTdGF0dXNCYXJNYW5hZ2VyXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAgc2VydmljZSA9IEBwcm92aWRlVmltTW9kZVBsdXMoKVxuICAgIEBzdWJzY3JpYmUoQmFzZS5pbml0KHNlcnZpY2UpKVxuICAgIEByZWdpc3RlckNvbW1hbmRzKClcbiAgICBAcmVnaXN0ZXJWaW1TdGF0ZUNvbW1hbmRzKClcblxuICAgIGlmIGF0b20uaW5TcGVjTW9kZSgpXG4gICAgICBzZXR0aW5ncy5zZXQoJ3N0cmljdEFzc2VydGlvbicsIHRydWUpXG5cbiAgICBpZiBhdG9tLmluRGV2TW9kZSgpXG4gICAgICBkZXZlbG9wZXIgPSBuZXcgKHJlcXVpcmUgJy4vZGV2ZWxvcGVyJylcbiAgICAgIEBzdWJzY3JpYmUoZGV2ZWxvcGVyLmluaXQoc2VydmljZSkpXG5cbiAgICBAc3Vic2NyaWJlIEBvYnNlcnZlVmltTW9kZSAtPlxuICAgICAgbWVzc2FnZSA9IFwiXCJcIlxuICAgICAgICAjIyBNZXNzYWdlIGJ5IHZpbS1tb2RlLXBsdXM6IHZpbS1tb2RlIGRldGVjdGVkIVxuICAgICAgICBUbyB1c2UgdmltLW1vZGUtcGx1cywgeW91IG11c3QgKipkaXNhYmxlIHZpbS1tb2RlKiogbWFudWFsbHkuXG4gICAgICAgIFwiXCJcIlxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcobWVzc2FnZSwgZGlzbWlzc2FibGU6IHRydWUpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgcmV0dXJuIGlmIGVkaXRvci5pc01pbmkoKVxuICAgICAgdmltU3RhdGUgPSBuZXcgVmltU3RhdGUoZWRpdG9yLCBAc3RhdHVzQmFyTWFuYWdlciwgZ2xvYmFsU3RhdGUpXG4gICAgICBAZW1pdHRlci5lbWl0KCdkaWQtYWRkLXZpbS1zdGF0ZScsIHZpbVN0YXRlKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmUoQGRlbWF4aW1pemVQYW5lLmJpbmQodGhpcykpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gLT5cbiAgICAgIGlmIHNldHRpbmdzLmdldCgnYXV0b21hdGljYWxseUVzY2FwZUluc2VydE1vZGVPbkFjdGl2ZVBhbmVJdGVtQ2hhbmdlJylcbiAgICAgICAgVmltU3RhdGUuZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICAgICAgdmltU3RhdGUuYWN0aXZhdGUoJ25vcm1hbCcpIGlmIHZpbVN0YXRlLm1vZGUgaXMgJ2luc2VydCdcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub25EaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbSAoaXRlbSkgPT5cbiAgICAgIGlmIGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihpdGVtKVxuICAgICAgICAjIFN0aWxsIHRoZXJlIGlzIHBvc3NpYmlsaXR5IGVkaXRvciBpcyBkZXN0cm95ZWQgYW5kIGRvbid0IGhhdmUgY29ycmVzcG9uZGluZ1xuICAgICAgICAjIHZpbVN0YXRlICMxOTYuXG4gICAgICAgIEBnZXRFZGl0b3JTdGF0ZShpdGVtKT8uaGlnaGxpZ2h0U2VhcmNoLnJlZnJlc2goKVxuXG4gICAgQHN1YnNjcmliZSBzZXR0aW5ncy5vYnNlcnZlICdoaWdobGlnaHRTZWFyY2gnLCAobmV3VmFsdWUpIC0+XG4gICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICAjIFJlLXNldHRpbmcgdmFsdWUgdHJpZ2dlciBoaWdobGlnaHRTZWFyY2ggcmVmcmVzaFxuICAgICAgICBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBnbG9iYWxTdGF0ZS5nZXQoJ2xhc3RTZWFyY2hQYXR0ZXJuJykpXG4gICAgICBlbHNlXG4gICAgICAgIGdsb2JhbFN0YXRlLnNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIG51bGwpXG5cbiAgb2JzZXJ2ZVZpbU1vZGU6IChmbikgLT5cbiAgICBmbigpIGlmIGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKCd2aW0tbW9kZScpXG4gICAgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSAocGFjaykgLT5cbiAgICAgIGZuKCkgaWYgcGFjay5uYW1lIGlzICd2aW0tbW9kZSdcblxuICAjICogYGZuYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIHZpbVN0YXRlIGluc3RhbmNlIHdhcyBjcmVhdGVkLlxuICAjICBVc2FnZTpcbiAgIyAgIG9uRGlkQWRkVmltU3RhdGUgKHZpbVN0YXRlKSAtPiBkbyBzb21ldGhpbmcuLlxuICAjIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9uRGlkQWRkVmltU3RhdGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1hZGQtdmltLXN0YXRlJywgZm4pXG5cbiAgIyAqIGBmbmAge0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2l0aCBhbGwgY3VycmVudCBhbmQgZnV0dXJlIHZpbVN0YXRlXG4gICMgIFVzYWdlOlxuICAjICAgb2JzZXJ2ZVZpbVN0YXRlcyAodmltU3RhdGUpIC0+IGRvIHNvbWV0aGluZy4uXG4gICMgUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb2JzZXJ2ZVZpbVN0YXRlczogKGZuKSAtPlxuICAgIFZpbVN0YXRlLmZvckVhY2goZm4pXG4gICAgQG9uRGlkQWRkVmltU3RhdGUoZm4pXG5cbiAgY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uRm9yRWRpdG9yczogLT5cbiAgICBmb3IgZWRpdG9yIGluIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICAgIEBnZXRFZGl0b3JTdGF0ZShlZGl0b3IpLmNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbnMoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgVmltU3RhdGUuZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICB2aW1TdGF0ZS5kZXN0cm95KClcbiAgICBWaW1TdGF0ZS5jbGVhcigpXG5cbiAgc3Vic2NyaWJlOiAoYXJnKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChhcmcpXG5cbiAgdW5zdWJzY3JpYmU6IChhcmcpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMucmVtb3ZlKGFyZylcblxuICByZWdpc3RlckNvbW1hbmRzOiAtPlxuICAgIEBzdWJzY3JpYmUgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLFxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6Y2xlYXItaGlnaGxpZ2h0LXNlYXJjaCc6IC0+IGdsb2JhbFN0YXRlLnNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIG51bGwpXG4gICAgICAndmltLW1vZGUtcGx1czp0b2dnbGUtaGlnaGxpZ2h0LXNlYXJjaCc6IC0+IHNldHRpbmdzLnRvZ2dsZSgnaGlnaGxpZ2h0U2VhcmNoJylcbiAgICAgICd2aW0tbW9kZS1wbHVzOmNsZWFyLXBlcnNpc3RlbnQtc2VsZWN0aW9uJzogPT4gQGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbkZvckVkaXRvcnMoKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6bWF4aW1pemUtcGFuZSc6ID0+IEBtYXhpbWl6ZVBhbmUoKVxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6ZXF1YWxpemUtcGFuZXMnOiA9PiBAZXF1YWxpemVQYW5lcygpXG5cbiAgZGVtYXhpbWl6ZVBhbmU6IC0+XG4gICAgaWYgQG1heGltaXplUGFuZURpc3Bvc2FibGU/XG4gICAgICBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgIEB1bnN1YnNjcmliZShAbWF4aW1pemVQYW5lRGlzcG9zYWJsZSlcbiAgICAgIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlID0gbnVsbFxuXG4gIG1heGltaXplUGFuZTogLT5cbiAgICBpZiBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZT9cbiAgICAgIEBkZW1heGltaXplUGFuZSgpXG4gICAgICByZXR1cm5cblxuICAgIGdldFZpZXcgPSAobW9kZWwpIC0+IGF0b20udmlld3MuZ2V0Vmlldyhtb2RlbClcbiAgICBjbGFzc1BhbmVNYXhpbWl6ZWQgPSAndmltLW1vZGUtcGx1cy0tcGFuZS1tYXhpbWl6ZWQnXG4gICAgY2xhc3NIaWRlVGFiQmFyID0gJ3ZpbS1tb2RlLXBsdXMtLWhpZGUtdGFiLWJhcidcbiAgICBjbGFzc0hpZGVTdGF0dXNCYXIgPSAndmltLW1vZGUtcGx1cy0taGlkZS1zdGF0dXMtYmFyJ1xuICAgIGNsYXNzQWN0aXZlUGFuZUF4aXMgPSAndmltLW1vZGUtcGx1cy0tYWN0aXZlLXBhbmUtYXhpcydcblxuICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBnZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgIHBhbmVFbGVtZW50ID0gZ2V0VmlldyhhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkpXG5cbiAgICB3b3Jrc3BhY2VDbGFzc05hbWVzID0gW2NsYXNzUGFuZU1heGltaXplZF1cbiAgICB3b3Jrc3BhY2VDbGFzc05hbWVzLnB1c2goY2xhc3NIaWRlVGFiQmFyKSBpZiBzZXR0aW5ncy5nZXQoJ2hpZGVUYWJCYXJPbk1heGltaXplUGFuZScpXG4gICAgd29ya3NwYWNlQ2xhc3NOYW1lcy5wdXNoKGNsYXNzSGlkZVN0YXR1c0JhcikgaWYgc2V0dGluZ3MuZ2V0KCdoaWRlU3RhdHVzQmFyT25NYXhpbWl6ZVBhbmUnKVxuXG4gICAgYWRkQ2xhc3NMaXN0KHdvcmtzcGFjZUVsZW1lbnQsIHdvcmtzcGFjZUNsYXNzTmFtZXMuLi4pXG5cbiAgICBmb3JFYWNoUGFuZUF4aXMgKGF4aXMpIC0+XG4gICAgICBwYW5lQXhpc0VsZW1lbnQgPSBnZXRWaWV3KGF4aXMpXG4gICAgICBpZiBwYW5lQXhpc0VsZW1lbnQuY29udGFpbnMocGFuZUVsZW1lbnQpXG4gICAgICAgIGFkZENsYXNzTGlzdChwYW5lQXhpc0VsZW1lbnQsIGNsYXNzQWN0aXZlUGFuZUF4aXMpXG5cbiAgICBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZSA9IG5ldyBEaXNwb3NhYmxlIC0+XG4gICAgICBmb3JFYWNoUGFuZUF4aXMgKGF4aXMpIC0+XG4gICAgICAgIHJlbW92ZUNsYXNzTGlzdChnZXRWaWV3KGF4aXMpLCBjbGFzc0FjdGl2ZVBhbmVBeGlzKVxuICAgICAgcmVtb3ZlQ2xhc3NMaXN0KHdvcmtzcGFjZUVsZW1lbnQsIHdvcmtzcGFjZUNsYXNzTmFtZXMuLi4pXG5cbiAgICBAc3Vic2NyaWJlKEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlKVxuXG4gIGVxdWFsaXplUGFuZXM6IC0+XG4gICAgc2V0RmxleFNjYWxlID0gKG5ld1ZhbHVlLCBiYXNlKSAtPlxuICAgICAgYmFzZSA/PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuZ2V0Q29udGFpbmVyKCkuZ2V0Um9vdCgpXG4gICAgICBiYXNlLnNldEZsZXhTY2FsZShuZXdWYWx1ZSlcbiAgICAgIGZvciBjaGlsZCBpbiBiYXNlLmNoaWxkcmVuID8gW11cbiAgICAgICAgc2V0RmxleFNjYWxlKG5ld1ZhbHVlLCBjaGlsZClcblxuICAgIHNldEZsZXhTY2FsZSgxKVxuXG4gIHJlZ2lzdGVyVmltU3RhdGVDb21tYW5kczogLT5cbiAgICAjIGFsbCBjb21tYW5kcyBoZXJlIGlzIGV4ZWN1dGVkIHdpdGggY29udGV4dCB3aGVyZSAndGhpcycgYm91bmQgdG8gJ3ZpbVN0YXRlJ1xuICAgIGNvbW1hbmRzID1cbiAgICAgICdhY3RpdmF0ZS1ub3JtYWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgnbm9ybWFsJylcbiAgICAgICdhY3RpdmF0ZS1saW5ld2lzZS12aXN1YWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgndmlzdWFsJywgJ2xpbmV3aXNlJylcbiAgICAgICdhY3RpdmF0ZS1jaGFyYWN0ZXJ3aXNlLXZpc3VhbC1tb2RlJzogLT4gQGFjdGl2YXRlKCd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZScpXG4gICAgICAnYWN0aXZhdGUtYmxvY2t3aXNlLXZpc3VhbC1tb2RlJzogLT4gQGFjdGl2YXRlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgICdyZXNldC1ub3JtYWwtbW9kZSc6IC0+IEByZXNldE5vcm1hbE1vZGUodXNlckludm9jYXRpb246IHRydWUpXG4gICAgICAnc2V0LXJlZ2lzdGVyLW5hbWUnOiAtPiBAcmVnaXN0ZXIuc2V0TmFtZSgpICMgXCJcbiAgICAgICdzZXQtcmVnaXN0ZXItbmFtZS10by1fJzogLT4gQHJlZ2lzdGVyLnNldE5hbWUoJ18nKVxuICAgICAgJ3NldC1yZWdpc3Rlci1uYW1lLXRvLSonOiAtPiBAcmVnaXN0ZXIuc2V0TmFtZSgnKicpXG4gICAgICAnb3BlcmF0b3ItbW9kaWZpZXItY2hhcmFjdGVyd2lzZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcih3aXNlOiAnY2hhcmFjdGVyd2lzZScpXG4gICAgICAnb3BlcmF0b3ItbW9kaWZpZXItbGluZXdpc2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIod2lzZTogJ2xpbmV3aXNlJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1vY2N1cnJlbmNlJzogLT4gQGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyKG9jY3VycmVuY2U6IHRydWUsIG9jY3VycmVuY2VUeXBlOiAnYmFzZScpXG4gICAgICAnb3BlcmF0b3ItbW9kaWZpZXItc3Vid29yZC1vY2N1cnJlbmNlJzogLT4gQGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyKG9jY3VycmVuY2U6IHRydWUsIG9jY3VycmVuY2VUeXBlOiAnc3Vid29yZCcpXG4gICAgICAncmVwZWF0JzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1blJlY29yZGVkKClcbiAgICAgICdyZXBlYXQtZmluZCc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5DdXJyZW50RmluZCgpXG4gICAgICAncmVwZWF0LWZpbmQtcmV2ZXJzZSc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5DdXJyZW50RmluZChyZXZlcnNlOiB0cnVlKVxuICAgICAgJ3JlcGVhdC1zZWFyY2gnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudFNlYXJjaCgpXG4gICAgICAncmVwZWF0LXNlYXJjaC1yZXZlcnNlJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRTZWFyY2gocmV2ZXJzZTogdHJ1ZSlcbiAgICAgICdzZXQtY291bnQtMCc6IC0+IEBzZXRDb3VudCgwKVxuICAgICAgJ3NldC1jb3VudC0xJzogLT4gQHNldENvdW50KDEpXG4gICAgICAnc2V0LWNvdW50LTInOiAtPiBAc2V0Q291bnQoMilcbiAgICAgICdzZXQtY291bnQtMyc6IC0+IEBzZXRDb3VudCgzKVxuICAgICAgJ3NldC1jb3VudC00JzogLT4gQHNldENvdW50KDQpXG4gICAgICAnc2V0LWNvdW50LTUnOiAtPiBAc2V0Q291bnQoNSlcbiAgICAgICdzZXQtY291bnQtNic6IC0+IEBzZXRDb3VudCg2KVxuICAgICAgJ3NldC1jb3VudC03JzogLT4gQHNldENvdW50KDcpXG4gICAgICAnc2V0LWNvdW50LTgnOiAtPiBAc2V0Q291bnQoOClcbiAgICAgICdzZXQtY291bnQtOSc6IC0+IEBzZXRDb3VudCg5KVxuXG4gICAgY2hhcnMgPSBbMzIuLjEyNl0ubWFwIChjb2RlKSAtPiBTdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGUpXG4gICAgZm9yIGNoYXIgaW4gY2hhcnNcbiAgICAgIGRvIChjaGFyKSAtPlxuICAgICAgICBjaGFyRm9yS2V5bWFwID0gaWYgY2hhciBpcyAnICcgdGhlbiAnc3BhY2UnIGVsc2UgY2hhclxuICAgICAgICBjb21tYW5kc1tcInNldC1pbnB1dC1jaGFyLSN7Y2hhckZvcktleW1hcH1cIl0gPSAtPlxuICAgICAgICAgIEBlbWl0RGlkU2V0SW5wdXRDaGFyKGNoYXIpXG5cbiAgICBnZXRFZGl0b3JTdGF0ZSA9IEBnZXRFZGl0b3JTdGF0ZS5iaW5kKHRoaXMpXG5cbiAgICBiaW5kVG9WaW1TdGF0ZSA9IChvbGRDb21tYW5kcykgLT5cbiAgICAgIG5ld0NvbW1hbmRzID0ge31cbiAgICAgIGZvciBuYW1lLCBmbiBvZiBvbGRDb21tYW5kc1xuICAgICAgICBkbyAoZm4pIC0+XG4gICAgICAgICAgbmV3Q29tbWFuZHNbXCJ2aW0tbW9kZS1wbHVzOiN7bmFtZX1cIl0gPSAoZXZlbnQpIC0+XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgaWYgdmltU3RhdGUgPSBnZXRFZGl0b3JTdGF0ZShAZ2V0TW9kZWwoKSlcbiAgICAgICAgICAgICAgZm4uY2FsbCh2aW1TdGF0ZSwgZXZlbnQpXG4gICAgICBuZXdDb21tYW5kc1xuXG4gICAgQHN1YnNjcmliZSBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsIGJpbmRUb1ZpbVN0YXRlKGNvbW1hbmRzKSlcblxuICBjb25zdW1lU3RhdHVzQmFyOiAoc3RhdHVzQmFyKSAtPlxuICAgIEBzdGF0dXNCYXJNYW5hZ2VyLmluaXRpYWxpemUoc3RhdHVzQmFyKVxuICAgIEBzdGF0dXNCYXJNYW5hZ2VyLmF0dGFjaCgpXG4gICAgQHN1YnNjcmliZSBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQHN0YXR1c0Jhck1hbmFnZXIuZGV0YWNoKClcblxuICAjIFNlcnZpY2UgQVBJXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBnZXRHbG9iYWxTdGF0ZTogLT5cbiAgICBnbG9iYWxTdGF0ZVxuXG4gIGdldEVkaXRvclN0YXRlOiAoZWRpdG9yKSAtPlxuICAgIFZpbVN0YXRlLmdldEJ5RWRpdG9yKGVkaXRvcilcblxuICBwcm92aWRlVmltTW9kZVBsdXM6IC0+XG4gICAgQmFzZTogQmFzZVxuICAgIGdldEdsb2JhbFN0YXRlOiBAZ2V0R2xvYmFsU3RhdGUuYmluZCh0aGlzKVxuICAgIGdldEVkaXRvclN0YXRlOiBAZ2V0RWRpdG9yU3RhdGUuYmluZCh0aGlzKVxuICAgIG9ic2VydmVWaW1TdGF0ZXM6IEBvYnNlcnZlVmltU3RhdGVzLmJpbmQodGhpcylcbiAgICBvbkRpZEFkZFZpbVN0YXRlOiBAb25EaWRBZGRWaW1TdGF0ZS5iaW5kKHRoaXMpXG4iXX0=
