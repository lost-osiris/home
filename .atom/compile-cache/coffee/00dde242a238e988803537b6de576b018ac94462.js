(function() {
  var CompositeDisposable, Delegato, Disposable, Emitter, LazyLoadedLibs, ModeManager, Range, VimState, jQuery, lazyRequire, ref, settings,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Delegato = require('delegato');

  jQuery = null;

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable, Range = ref.Range;

  settings = require('./settings');

  ModeManager = require('./mode-manager');

  LazyLoadedLibs = {};

  lazyRequire = function(file) {
    if (!(file in LazyLoadedLibs)) {
      if (atom.inDevMode() && settings.get('debug')) {
        console.log("# lazy-require: " + file);
      }
      LazyLoadedLibs[file] = require(file);
    }
    return LazyLoadedLibs[file];
  };

  module.exports = VimState = (function() {
    var fileToLoad, propName, ref1;

    VimState.vimStatesByEditor = new Map;

    VimState.getByEditor = function(editor) {
      return this.vimStatesByEditor.get(editor);
    };

    VimState.has = function(editor) {
      return this.vimStatesByEditor.has(editor);
    };

    VimState["delete"] = function(editor) {
      return this.vimStatesByEditor["delete"](editor);
    };

    VimState.forEach = function(fn) {
      return this.vimStatesByEditor.forEach(fn);
    };

    VimState.clear = function() {
      return this.vimStatesByEditor.clear();
    };

    Delegato.includeInto(VimState);

    VimState.delegatesProperty('mode', 'submode', {
      toProperty: 'modeManager'
    });

    VimState.delegatesMethods('isMode', 'activate', {
      toProperty: 'modeManager'
    });

    VimState.delegatesMethods('flash', 'flashScreenRange', {
      toProperty: 'flashManager'
    });

    VimState.delegatesMethods('subscribe', 'getCount', 'setCount', 'hasCount', 'addToClassList', {
      toProperty: 'operationStack'
    });

    VimState.defineLazyProperty = function(name, fileToLoad, instantiate) {
      if (instantiate == null) {
        instantiate = true;
      }
      return Object.defineProperty(this.prototype, name, {
        get: function() {
          var name1;
          return this[name1 = "__" + name] != null ? this[name1] : this[name1] = (function(_this) {
            return function() {
              if (instantiate) {
                return new (lazyRequire(fileToLoad))(_this);
              } else {
                return lazyRequire(fileToLoad);
              }
            };
          })(this)();
        }
      });
    };

    VimState.prototype.getProp = function(name) {
      if (this["__" + name] != null) {
        return this[name];
      }
    };

    VimState.defineLazyProperty('swrap', './selection-wrapper', false);

    VimState.defineLazyProperty('utils', './utils', false);

    VimState.lazyProperties = {
      mark: './mark-manager',
      register: './register-manager',
      hover: './hover-manager',
      hoverSearchCounter: './hover-manager',
      searchHistory: './search-history-manager',
      highlightSearch: './highlight-search-manager',
      persistentSelection: './persistent-selection-manager',
      occurrenceManager: './occurrence-manager',
      mutationManager: './mutation-manager',
      flashManager: './flash-manager',
      searchInput: './search-input',
      operationStack: './operation-stack',
      cursorStyleManager: './cursor-style-manager'
    };

    ref1 = VimState.lazyProperties;
    for (propName in ref1) {
      fileToLoad = ref1[propName];
      VimState.defineLazyProperty(propName, fileToLoad);
    }

    VimState.prototype.reportRequireCache = function(arg) {
      var cachedPath, cachedPaths, excludeNodModules, focus, i, inspect, len, packPath, path, results;
      focus = arg.focus, excludeNodModules = arg.excludeNodModules;
      inspect = require('util').inspect;
      path = require('path');
      packPath = atom.packages.getLoadedPackage("vim-mode-plus").path;
      cachedPaths = Object.keys(require.cache).filter(function(p) {
        return p.startsWith(packPath + path.sep);
      }).map(function(p) {
        return p.replace(packPath, '');
      });
      results = [];
      for (i = 0, len = cachedPaths.length; i < len; i++) {
        cachedPath = cachedPaths[i];
        if (excludeNodModules && cachedPath.search(/node_modules/) >= 0) {
          continue;
        }
        if (focus && cachedPath.search(RegExp("" + focus)) >= 0) {
          cachedPath = '*' + cachedPath;
        }
        results.push(console.log(cachedPath));
      }
      return results;
    };

    function VimState(editor1, statusBarManager, globalState) {
      var startInsertScopes;
      this.editor = editor1;
      this.statusBarManager = statusBarManager;
      this.globalState = globalState;
      this.destroy = bind(this.destroy, this);
      this.editorElement = this.editor.element;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.modeManager = new ModeManager(this);
      this.previousSelection = {};
      this.observeSelections();
      this.editorElement.classList.add('vim-mode-plus');
      startInsertScopes = this.getConfig('startInInsertModeScopes');
      if (this.getConfig('startInInsertMode') || startInsertScopes.length && this.utils.matchScopes(this.editorElement, startInsertScopes)) {
        this.activate('insert');
      } else {
        this.activate('normal');
      }
      this.editor.onDidDestroy(this.destroy);
      this.constructor.vimStatesByEditor.set(this.editor, this);
    }

    VimState.prototype.getConfig = function(param) {
      return settings.get(param);
    };

    VimState.prototype.getBlockwiseSelections = function() {
      return this.swrap.getBlockwiseSelections(this.editor);
    };

    VimState.prototype.getLastBlockwiseSelection = function() {
      return this.swrap.getLastBlockwiseSelections(this.editor);
    };

    VimState.prototype.getBlockwiseSelectionsOrderedByBufferPosition = function() {
      return this.swrap.getBlockwiseSelectionsOrderedByBufferPosition(this.editor);
    };

    VimState.prototype.clearBlockwiseSelections = function() {
      return this.swrap.clearBlockwiseSelections(this.editor);
    };

    VimState.prototype.swapClassName = function() {
      var classNames, oldMode, ref2;
      classNames = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      oldMode = this.mode;
      this.editorElement.classList.remove('vim-mode-plus', oldMode + "-mode");
      (ref2 = this.editorElement.classList).add.apply(ref2, classNames);
      return new Disposable((function(_this) {
        return function() {
          var classToAdd, ref3, ref4;
          (ref3 = _this.editorElement.classList).remove.apply(ref3, classNames);
          classToAdd = ['vim-mode-plus', 'is-focused'];
          if (_this.mode === oldMode) {
            classToAdd.push(oldMode + "-mode");
          }
          return (ref4 = _this.editorElement.classList).add.apply(ref4, classToAdd);
        };
      })(this));
    };

    VimState.prototype.onDidChangeSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidChange(fn));
    };

    VimState.prototype.onDidConfirmSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidConfirm(fn));
    };

    VimState.prototype.onDidCancelSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCancel(fn));
    };

    VimState.prototype.onDidCommandSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCommand(fn));
    };

    VimState.prototype.onDidSetTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-set-target', fn));
    };

    VimState.prototype.emitDidSetTarget = function(operator) {
      return this.emitter.emit('did-set-target', operator);
    };

    VimState.prototype.onWillSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('will-select-target', fn));
    };

    VimState.prototype.emitWillSelectTarget = function() {
      return this.emitter.emit('will-select-target');
    };

    VimState.prototype.onDidSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-select-target', fn));
    };

    VimState.prototype.emitDidSelectTarget = function() {
      return this.emitter.emit('did-select-target');
    };

    VimState.prototype.onDidFailSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-fail-select-target', fn));
    };

    VimState.prototype.emitDidFailSelectTarget = function() {
      return this.emitter.emit('did-fail-select-target');
    };

    VimState.prototype.onWillFinishMutation = function(fn) {
      return this.subscribe(this.emitter.on('on-will-finish-mutation', fn));
    };

    VimState.prototype.emitWillFinishMutation = function() {
      return this.emitter.emit('on-will-finish-mutation');
    };

    VimState.prototype.onDidFinishMutation = function(fn) {
      return this.subscribe(this.emitter.on('on-did-finish-mutation', fn));
    };

    VimState.prototype.emitDidFinishMutation = function() {
      return this.emitter.emit('on-did-finish-mutation');
    };

    VimState.prototype.onDidSetOperatorModifier = function(fn) {
      return this.subscribe(this.emitter.on('did-set-operator-modifier', fn));
    };

    VimState.prototype.emitDidSetOperatorModifier = function(options) {
      return this.emitter.emit('did-set-operator-modifier', options);
    };

    VimState.prototype.onDidFinishOperation = function(fn) {
      return this.subscribe(this.emitter.on('did-finish-operation', fn));
    };

    VimState.prototype.emitDidFinishOperation = function() {
      return this.emitter.emit('did-finish-operation');
    };

    VimState.prototype.onDidResetOperationStack = function(fn) {
      return this.subscribe(this.emitter.on('did-reset-operation-stack', fn));
    };

    VimState.prototype.emitDidResetOperationStack = function() {
      return this.emitter.emit('did-reset-operation-stack');
    };

    VimState.prototype.onDidConfirmSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-confirm-select-list', fn));
    };

    VimState.prototype.onDidCancelSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-cancel-select-list', fn));
    };

    VimState.prototype.onWillActivateMode = function(fn) {
      return this.subscribe(this.modeManager.onWillActivateMode(fn));
    };

    VimState.prototype.onDidActivateMode = function(fn) {
      return this.subscribe(this.modeManager.onDidActivateMode(fn));
    };

    VimState.prototype.onWillDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.onWillDeactivateMode(fn));
    };

    VimState.prototype.preemptWillDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.preemptWillDeactivateMode(fn));
    };

    VimState.prototype.onDidDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.onDidDeactivateMode(fn));
    };

    VimState.prototype.onDidFailToPushToOperationStack = function(fn) {
      return this.emitter.on('did-fail-to-push-to-operation-stack', fn);
    };

    VimState.prototype.emitDidFailToPushToOperationStack = function() {
      return this.emitter.emit('did-fail-to-push-to-operation-stack');
    };

    VimState.prototype.onDidDestroy = function(fn) {
      return this.emitter.on('did-destroy', fn);
    };

    VimState.prototype.onDidSetMark = function(fn) {
      return this.emitter.on('did-set-mark', fn);
    };

    VimState.prototype.onDidSetInputChar = function(fn) {
      return this.emitter.on('did-set-input-char', fn);
    };

    VimState.prototype.emitDidSetInputChar = function(char) {
      return this.emitter.emit('did-set-input-char', char);
    };

    VimState.prototype.isAlive = function() {
      return this.constructor.has(this.editor);
    };

    VimState.prototype.destroy = function() {
      var ref2, ref3;
      if (!this.isAlive()) {
        return;
      }
      this.constructor["delete"](this.editor);
      this.subscriptions.dispose();
      if (this.editor.isAlive()) {
        this.resetNormalMode();
        this.reset();
        if ((ref2 = this.editorElement.component) != null) {
          ref2.setInputEnabled(true);
        }
        this.editorElement.classList.remove('vim-mode-plus', 'normal-mode');
      }
      ref3 = {}, this.hover = ref3.hover, this.hoverSearchCounter = ref3.hoverSearchCounter, this.operationStack = ref3.operationStack, this.searchHistory = ref3.searchHistory, this.cursorStyleManager = ref3.cursorStyleManager, this.modeManager = ref3.modeManager, this.register = ref3.register, this.editor = ref3.editor, this.editorElement = ref3.editorElement, this.subscriptions = ref3.subscriptions, this.occurrenceManager = ref3.occurrenceManager, this.previousSelection = ref3.previousSelection, this.persistentSelection = ref3.persistentSelection;
      return this.emitter.emit('did-destroy');
    };

    VimState.prototype.haveSomeNonEmptySelection = function() {
      return this.editor.getSelections().some(function(selection) {
        return !selection.isEmpty();
      });
    };

    VimState.prototype.checkSelection = function(event) {
      var $selection, i, len, ref2, ref3, ref4, wise;
      if (atom.workspace.getActiveTextEditor() !== this.editor) {
        return;
      }
      if ((ref2 = this.getProp('operationStack')) != null ? ref2.isProcessing() : void 0) {
        return;
      }
      if (this.mode === 'insert') {
        return;
      }
      if (this.editorElement !== ((ref3 = event.target) != null ? typeof ref3.closest === "function" ? ref3.closest('atom-text-editor') : void 0 : void 0)) {
        return;
      }
      if (event.type.startsWith('vim-mode-plus')) {
        return;
      }
      if (this.haveSomeNonEmptySelection()) {
        this.editorElement.component.updateSync();
        wise = this.swrap.detectWise(this.editor);
        if (this.isMode('visual', wise)) {
          ref4 = this.swrap.getSelections(this.editor);
          for (i = 0, len = ref4.length; i < len; i++) {
            $selection = ref4[i];
            $selection.saveProperties();
          }
          return this.cursorStyleManager.refresh();
        } else {
          return this.activate('visual', wise);
        }
      } else {
        if (this.mode === 'visual') {
          return this.activate('normal');
        }
      }
    };

    VimState.prototype.observeSelections = function() {
      var checkSelection;
      checkSelection = this.checkSelection.bind(this);
      this.editorElement.addEventListener('mouseup', checkSelection);
      this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.removeEventListener('mouseup', checkSelection);
        };
      })(this)));
      this.subscriptions.add(atom.commands.onDidDispatch(checkSelection));
      this.editorElement.addEventListener('focus', checkSelection);
      return this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.removeEventListener('focus', checkSelection);
        };
      })(this)));
    };

    VimState.prototype.clearSelections = function() {
      return this.editor.setCursorBufferPosition(this.editor.getCursorBufferPosition());
    };

    VimState.prototype.resetNormalMode = function(arg) {
      var ref2, ref3, userInvocation;
      userInvocation = (arg != null ? arg : {}).userInvocation;
      if ((ref2 = this.getProp('swrap')) != null) {
        ref2.clearBlockwiseSelections();
      }
      if (userInvocation != null ? userInvocation : false) {
        switch (false) {
          case !this.editor.hasMultipleCursors():
            this.clearSelections();
            break;
          case !(this.hasPersistentSelections() && this.getConfig('clearPersistentSelectionOnResetNormalMode')):
            this.clearPersistentSelections();
            break;
          case !((ref3 = this.getProp('occurrenceManager')) != null ? ref3.hasPatterns() : void 0):
            this.occurrenceManager.resetPatterns();
        }
        if (this.getConfig('clearHighlightSearchOnResetNormalMode')) {
          this.globalState.set('highlightSearchPattern', null);
        }
      } else {
        this.clearSelections();
      }
      return this.activate('normal');
    };

    VimState.prototype.init = function() {
      return this.saveOriginalCursorPosition();
    };

    VimState.prototype.reset = function() {
      var ref2, ref3, ref4, ref5, ref6;
      if ((ref2 = this.getProp('register')) != null) {
        ref2.reset();
      }
      if ((ref3 = this.getProp('searchHistory')) != null) {
        ref3.reset();
      }
      if ((ref4 = this.getProp('hover')) != null) {
        ref4.reset();
      }
      if ((ref5 = this.getProp('operationStack')) != null) {
        ref5.reset();
      }
      return (ref6 = this.getProp('mutationManager')) != null ? ref6.reset() : void 0;
    };

    VimState.prototype.isVisible = function() {
      var ref2;
      return ref2 = this.editor, indexOf.call(this.utils.getVisibleEditors(), ref2) >= 0;
    };

    VimState.prototype.updatePreviousSelection = function() {
      var end, head, properties, ref2, ref3, ref4, start, tail;
      if (this.isMode('visual', 'blockwise')) {
        properties = (ref2 = this.getLastBlockwiseSelection()) != null ? ref2.getProperties() : void 0;
      } else {
        properties = this.swrap(this.editor.getLastSelection()).getProperties();
      }
      if (!properties) {
        return;
      }
      head = properties.head, tail = properties.tail;
      if (head.isGreaterThanOrEqual(tail)) {
        ref3 = [tail, head], start = ref3[0], end = ref3[1];
        head = end = this.utils.translatePointAndClip(this.editor, end, 'forward');
      } else {
        ref4 = [head, tail], start = ref4[0], end = ref4[1];
        tail = end = this.utils.translatePointAndClip(this.editor, end, 'forward');
      }
      this.mark.set('<', start);
      this.mark.set('>', end);
      return this.previousSelection = {
        properties: {
          head: head,
          tail: tail
        },
        submode: this.submode
      };
    };

    VimState.prototype.hasPersistentSelections = function() {
      var ref2;
      return (ref2 = this.getProp('persistentSelection')) != null ? ref2.hasMarkers() : void 0;
    };

    VimState.prototype.getPersistentSelectionBufferRanges = function() {
      var ref2, ref3;
      return (ref2 = (ref3 = this.getProp('persistentSelection')) != null ? ref3.getMarkerBufferRanges() : void 0) != null ? ref2 : [];
    };

    VimState.prototype.clearPersistentSelections = function() {
      var ref2;
      return (ref2 = this.getProp('persistentSelection')) != null ? ref2.clearMarkers() : void 0;
    };

    VimState.prototype.scrollAnimationEffect = null;

    VimState.prototype.requestScrollAnimation = function(from, to, options) {
      if (jQuery == null) {
        jQuery = require('atom-space-pen-views').jQuery;
      }
      return this.scrollAnimationEffect = jQuery(from).animate(to, options);
    };

    VimState.prototype.finishScrollAnimation = function() {
      var ref2;
      if ((ref2 = this.scrollAnimationEffect) != null) {
        ref2.finish();
      }
      return this.scrollAnimationEffect = null;
    };

    VimState.prototype.saveOriginalCursorPosition = function() {
      var point, ref2, selection;
      this.originalCursorPosition = null;
      if ((ref2 = this.originalCursorPositionByMarker) != null) {
        ref2.destroy();
      }
      if (this.mode === 'visual') {
        selection = this.editor.getLastSelection();
        point = this.swrap(selection).getBufferPositionFor('head', {
          from: ['property', 'selection']
        });
      } else {
        point = this.editor.getCursorBufferPosition();
      }
      this.originalCursorPosition = point;
      return this.originalCursorPositionByMarker = this.editor.markBufferPosition(point, {
        invalidate: 'never'
      });
    };

    VimState.prototype.restoreOriginalCursorPosition = function() {
      return this.editor.setCursorBufferPosition(this.getOriginalCursorPosition());
    };

    VimState.prototype.getOriginalCursorPosition = function() {
      return this.originalCursorPosition;
    };

    VimState.prototype.getOriginalCursorPositionByMarker = function() {
      return this.originalCursorPositionByMarker.getStartBufferPosition();
    };

    return VimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3ZpbS1zdGF0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9JQUFBO0lBQUE7Ozs7RUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0VBQ1gsTUFBQSxHQUFTOztFQUVULE1BQW9ELE9BQUEsQ0FBUSxNQUFSLENBQXBELEVBQUMscUJBQUQsRUFBVSwyQkFBVixFQUFzQiw2Q0FBdEIsRUFBMkM7O0VBRTNDLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFDWCxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUVkLGNBQUEsR0FBaUI7O0VBRWpCLFdBQUEsR0FBYyxTQUFDLElBQUQ7SUFDWixJQUFBLENBQUEsQ0FBTyxJQUFBLElBQVEsY0FBZixDQUFBO01BRUUsSUFBRyxJQUFJLENBQUMsU0FBTCxDQUFBLENBQUEsSUFBcUIsUUFBUSxDQUFDLEdBQVQsQ0FBYSxPQUFiLENBQXhCO1FBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxrQkFBQSxHQUFtQixJQUEvQixFQURGOztNQUlBLGNBQWUsQ0FBQSxJQUFBLENBQWYsR0FBdUIsT0FBQSxDQUFRLElBQVIsRUFOekI7O1dBT0EsY0FBZSxDQUFBLElBQUE7RUFSSDs7RUFVZCxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osUUFBQTs7SUFBQSxRQUFDLENBQUEsaUJBQUQsR0FBb0IsSUFBSTs7SUFFeEIsUUFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLE1BQUQ7YUFBWSxJQUFDLENBQUEsaUJBQWlCLENBQUMsR0FBbkIsQ0FBdUIsTUFBdkI7SUFBWjs7SUFDZCxRQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsTUFBRDthQUFZLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxHQUFuQixDQUF1QixNQUF2QjtJQUFaOztJQUNOLFFBQUMsRUFBQSxNQUFBLEVBQUQsR0FBUyxTQUFDLE1BQUQ7YUFBWSxJQUFDLENBQUEsaUJBQWlCLEVBQUMsTUFBRCxFQUFsQixDQUEwQixNQUExQjtJQUFaOztJQUNULFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLGlCQUFpQixDQUFDLE9BQW5CLENBQTJCLEVBQTNCO0lBQVI7O0lBQ1YsUUFBQyxDQUFBLEtBQUQsR0FBUSxTQUFBO2FBQUcsSUFBQyxDQUFBLGlCQUFpQixDQUFDLEtBQW5CLENBQUE7SUFBSDs7SUFFUixRQUFRLENBQUMsV0FBVCxDQUFxQixRQUFyQjs7SUFDQSxRQUFDLENBQUEsaUJBQUQsQ0FBbUIsTUFBbkIsRUFBMkIsU0FBM0IsRUFBc0M7TUFBQSxVQUFBLEVBQVksYUFBWjtLQUF0Qzs7SUFDQSxRQUFDLENBQUEsZ0JBQUQsQ0FBa0IsUUFBbEIsRUFBNEIsVUFBNUIsRUFBd0M7TUFBQSxVQUFBLEVBQVksYUFBWjtLQUF4Qzs7SUFDQSxRQUFDLENBQUEsZ0JBQUQsQ0FBa0IsT0FBbEIsRUFBMkIsa0JBQTNCLEVBQStDO01BQUEsVUFBQSxFQUFZLGNBQVo7S0FBL0M7O0lBQ0EsUUFBQyxDQUFBLGdCQUFELENBQWtCLFdBQWxCLEVBQStCLFVBQS9CLEVBQTJDLFVBQTNDLEVBQXVELFVBQXZELEVBQW1FLGdCQUFuRSxFQUFxRjtNQUFBLFVBQUEsRUFBWSxnQkFBWjtLQUFyRjs7SUFFQSxRQUFDLENBQUEsa0JBQUQsR0FBcUIsU0FBQyxJQUFELEVBQU8sVUFBUCxFQUFtQixXQUFuQjs7UUFBbUIsY0FBWTs7YUFDbEQsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsSUFBQyxDQUFBLFNBQXZCLEVBQWtDLElBQWxDLEVBQ0U7UUFBQSxHQUFBLEVBQUssU0FBQTtBQUFHLGNBQUE7cURBQUEsY0FBQSxjQUF3QixDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFBO2NBQzlCLElBQUcsV0FBSDt1QkFDTSxJQUFBLENBQUMsV0FBQSxDQUFZLFVBQVosQ0FBRCxDQUFBLENBQTBCLEtBQTFCLEVBRE47ZUFBQSxNQUFBO3VCQUdFLFdBQUEsQ0FBWSxVQUFaLEVBSEY7O1lBRDhCO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFILENBQUE7UUFBeEIsQ0FBTDtPQURGO0lBRG1COzt1QkFRckIsT0FBQSxHQUFTLFNBQUMsSUFBRDtNQUNQLElBQWMseUJBQWQ7ZUFBQSxJQUFLLENBQUEsSUFBQSxFQUFMOztJQURPOztJQUdULFFBQUMsQ0FBQSxrQkFBRCxDQUFvQixPQUFwQixFQUE2QixxQkFBN0IsRUFBb0QsS0FBcEQ7O0lBQ0EsUUFBQyxDQUFBLGtCQUFELENBQW9CLE9BQXBCLEVBQTZCLFNBQTdCLEVBQXdDLEtBQXhDOztJQUVBLFFBQUMsQ0FBQSxjQUFELEdBQ0U7TUFBQSxJQUFBLEVBQU0sZ0JBQU47TUFDQSxRQUFBLEVBQVUsb0JBRFY7TUFFQSxLQUFBLEVBQU8saUJBRlA7TUFHQSxrQkFBQSxFQUFvQixpQkFIcEI7TUFJQSxhQUFBLEVBQWUsMEJBSmY7TUFLQSxlQUFBLEVBQWlCLDRCQUxqQjtNQU1BLG1CQUFBLEVBQXFCLGdDQU5yQjtNQU9BLGlCQUFBLEVBQW1CLHNCQVBuQjtNQVFBLGVBQUEsRUFBaUIsb0JBUmpCO01BU0EsWUFBQSxFQUFjLGlCQVRkO01BVUEsV0FBQSxFQUFhLGdCQVZiO01BV0EsY0FBQSxFQUFnQixtQkFYaEI7TUFZQSxrQkFBQSxFQUFvQix3QkFacEI7OztBQWNGO0FBQUEsU0FBQSxnQkFBQTs7TUFDRSxRQUFDLENBQUEsa0JBQUQsQ0FBb0IsUUFBcEIsRUFBOEIsVUFBOUI7QUFERjs7dUJBR0Esa0JBQUEsR0FBb0IsU0FBQyxHQUFEO0FBQ2xCLFVBQUE7TUFEb0IsbUJBQU87TUFDMUIsVUFBVyxPQUFBLENBQVEsTUFBUjtNQUNaLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjtNQUNQLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLGVBQS9CLENBQStDLENBQUM7TUFDM0QsV0FBQSxHQUFjLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBTyxDQUFDLEtBQXBCLENBQ1osQ0FBQyxNQURXLENBQ0osU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDLFVBQUYsQ0FBYSxRQUFBLEdBQVcsSUFBSSxDQUFDLEdBQTdCO01BQVAsQ0FESSxDQUVaLENBQUMsR0FGVyxDQUVQLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxPQUFGLENBQVUsUUFBVixFQUFvQixFQUFwQjtNQUFQLENBRk87QUFJZDtXQUFBLDZDQUFBOztRQUNFLElBQUcsaUJBQUEsSUFBc0IsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsY0FBbEIsQ0FBQSxJQUFxQyxDQUE5RDtBQUNFLG1CQURGOztRQUVBLElBQUcsS0FBQSxJQUFVLFVBQVUsQ0FBQyxNQUFYLENBQWtCLE1BQUEsQ0FBQSxFQUFBLEdBQUssS0FBTCxDQUFsQixDQUFBLElBQXFDLENBQWxEO1VBQ0UsVUFBQSxHQUFhLEdBQUEsR0FBTSxXQURyQjs7cUJBR0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFaO0FBTkY7O0lBUmtCOztJQWlCUCxrQkFBQyxPQUFELEVBQVUsZ0JBQVYsRUFBNkIsV0FBN0I7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFNBQUQ7TUFBUyxJQUFDLENBQUEsbUJBQUQ7TUFBbUIsSUFBQyxDQUFBLGNBQUQ7O01BQ3hDLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUM7TUFDekIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BQ2YsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsV0FBRCxHQUFtQixJQUFBLFdBQUEsQ0FBWSxJQUFaO01BQ25CLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtNQUNyQixJQUFDLENBQUEsaUJBQUQsQ0FBQTtNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQXpCLENBQTZCLGVBQTdCO01BQ0EsaUJBQUEsR0FBb0IsSUFBQyxDQUFBLFNBQUQsQ0FBVyx5QkFBWDtNQUVwQixJQUFHLElBQUMsQ0FBQSxTQUFELENBQVcsbUJBQVgsQ0FBQSxJQUFtQyxpQkFBaUIsQ0FBQyxNQUFyRCxJQUFnRSxJQUFDLENBQUEsS0FBSyxDQUFDLFdBQVAsQ0FBbUIsSUFBQyxDQUFBLGFBQXBCLEVBQW1DLGlCQUFuQyxDQUFuRTtRQUNFLElBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQURGO09BQUEsTUFBQTtRQUdFLElBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQUhGOztNQUtBLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixJQUFDLENBQUEsT0FBdEI7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLGlCQUFpQixDQUFDLEdBQS9CLENBQW1DLElBQUMsQ0FBQSxNQUFwQyxFQUE0QyxJQUE1QztJQWpCVzs7dUJBbUJiLFNBQUEsR0FBVyxTQUFDLEtBQUQ7YUFDVCxRQUFRLENBQUMsR0FBVCxDQUFhLEtBQWI7SUFEUzs7dUJBS1gsc0JBQUEsR0FBd0IsU0FBQTthQUN0QixJQUFDLENBQUEsS0FBSyxDQUFDLHNCQUFQLENBQThCLElBQUMsQ0FBQSxNQUEvQjtJQURzQjs7dUJBR3hCLHlCQUFBLEdBQTJCLFNBQUE7YUFDekIsSUFBQyxDQUFBLEtBQUssQ0FBQywwQkFBUCxDQUFrQyxJQUFDLENBQUEsTUFBbkM7SUFEeUI7O3VCQUczQiw2Q0FBQSxHQUErQyxTQUFBO2FBQzdDLElBQUMsQ0FBQSxLQUFLLENBQUMsNkNBQVAsQ0FBcUQsSUFBQyxDQUFBLE1BQXREO0lBRDZDOzt1QkFHL0Msd0JBQUEsR0FBMEIsU0FBQTthQUN4QixJQUFDLENBQUEsS0FBSyxDQUFDLHdCQUFQLENBQWdDLElBQUMsQ0FBQSxNQUFqQztJQUR3Qjs7dUJBTTFCLGFBQUEsR0FBZSxTQUFBO0FBQ2IsVUFBQTtNQURjO01BQ2QsT0FBQSxHQUFVLElBQUMsQ0FBQTtNQUNYLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLGVBQWhDLEVBQWlELE9BQUEsR0FBVSxPQUEzRDtNQUNBLFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFmLENBQXdCLENBQUMsR0FBekIsYUFBNkIsVUFBN0I7YUFFSSxJQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDYixjQUFBO1VBQUEsUUFBQSxLQUFDLENBQUEsYUFBYSxDQUFDLFNBQWYsQ0FBd0IsQ0FBQyxNQUF6QixhQUFnQyxVQUFoQztVQUNBLFVBQUEsR0FBYSxDQUFDLGVBQUQsRUFBa0IsWUFBbEI7VUFDYixJQUFHLEtBQUMsQ0FBQSxJQUFELEtBQVMsT0FBWjtZQUNFLFVBQVUsQ0FBQyxJQUFYLENBQWdCLE9BQUEsR0FBVSxPQUExQixFQURGOztpQkFFQSxRQUFBLEtBQUMsQ0FBQSxhQUFhLENBQUMsU0FBZixDQUF3QixDQUFDLEdBQXpCLGFBQTZCLFVBQTdCO1FBTGE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVg7SUFMUzs7dUJBY2YsaUJBQUEsR0FBbUIsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUIsRUFBekIsQ0FBWDtJQUFSOzt1QkFDbkIsa0JBQUEsR0FBb0IsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsV0FBVyxDQUFDLFlBQWIsQ0FBMEIsRUFBMUIsQ0FBWDtJQUFSOzt1QkFDcEIsaUJBQUEsR0FBbUIsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUIsRUFBekIsQ0FBWDtJQUFSOzt1QkFDbkIsa0JBQUEsR0FBb0IsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsV0FBVyxDQUFDLFlBQWIsQ0FBMEIsRUFBMUIsQ0FBWDtJQUFSOzt1QkFHcEIsY0FBQSxHQUFnQixTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGdCQUFaLEVBQThCLEVBQTlCLENBQVg7SUFBUjs7dUJBQ2hCLGdCQUFBLEdBQWtCLFNBQUMsUUFBRDthQUFjLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGdCQUFkLEVBQWdDLFFBQWhDO0lBQWQ7O3VCQUVsQixrQkFBQSxHQUFvQixTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLG9CQUFaLEVBQWtDLEVBQWxDLENBQVg7SUFBUjs7dUJBQ3BCLG9CQUFBLEdBQXNCLFNBQUE7YUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxvQkFBZDtJQUFIOzt1QkFFdEIsaUJBQUEsR0FBbUIsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxtQkFBWixFQUFpQyxFQUFqQyxDQUFYO0lBQVI7O3VCQUNuQixtQkFBQSxHQUFxQixTQUFBO2FBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsbUJBQWQ7SUFBSDs7dUJBRXJCLHFCQUFBLEdBQXVCLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksd0JBQVosRUFBc0MsRUFBdEMsQ0FBWDtJQUFSOzt1QkFDdkIsdUJBQUEsR0FBeUIsU0FBQTthQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLHdCQUFkO0lBQUg7O3VCQUV6QixvQkFBQSxHQUFzQixTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLHlCQUFaLEVBQXVDLEVBQXZDLENBQVg7SUFBUjs7dUJBQ3RCLHNCQUFBLEdBQXdCLFNBQUE7YUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyx5QkFBZDtJQUFIOzt1QkFFeEIsbUJBQUEsR0FBcUIsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSx3QkFBWixFQUFzQyxFQUF0QyxDQUFYO0lBQVI7O3VCQUNyQixxQkFBQSxHQUF1QixTQUFBO2FBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsd0JBQWQ7SUFBSDs7dUJBRXZCLHdCQUFBLEdBQTBCLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksMkJBQVosRUFBeUMsRUFBekMsQ0FBWDtJQUFSOzt1QkFDMUIsMEJBQUEsR0FBNEIsU0FBQyxPQUFEO2FBQWEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsMkJBQWQsRUFBMkMsT0FBM0M7SUFBYjs7dUJBRTVCLG9CQUFBLEdBQXNCLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksc0JBQVosRUFBb0MsRUFBcEMsQ0FBWDtJQUFSOzt1QkFDdEIsc0JBQUEsR0FBd0IsU0FBQTthQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLHNCQUFkO0lBQUg7O3VCQUV4Qix3QkFBQSxHQUEwQixTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLDJCQUFaLEVBQXlDLEVBQXpDLENBQVg7SUFBUjs7dUJBQzFCLDBCQUFBLEdBQTRCLFNBQUE7YUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYywyQkFBZDtJQUFIOzt1QkFHNUIsc0JBQUEsR0FBd0IsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSx5QkFBWixFQUF1QyxFQUF2QyxDQUFYO0lBQVI7O3VCQUN4QixxQkFBQSxHQUF1QixTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLHdCQUFaLEVBQXNDLEVBQXRDLENBQVg7SUFBUjs7dUJBR3ZCLGtCQUFBLEdBQW9CLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxrQkFBYixDQUFnQyxFQUFoQyxDQUFYO0lBQVI7O3VCQUNwQixpQkFBQSxHQUFtQixTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxXQUFXLENBQUMsaUJBQWIsQ0FBK0IsRUFBL0IsQ0FBWDtJQUFSOzt1QkFDbkIsb0JBQUEsR0FBc0IsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsV0FBVyxDQUFDLG9CQUFiLENBQWtDLEVBQWxDLENBQVg7SUFBUjs7dUJBQ3RCLHlCQUFBLEdBQTJCLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLFdBQVcsQ0FBQyx5QkFBYixDQUF1QyxFQUF2QyxDQUFYO0lBQVI7O3VCQUMzQixtQkFBQSxHQUFxQixTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxXQUFXLENBQUMsbUJBQWIsQ0FBaUMsRUFBakMsQ0FBWDtJQUFSOzt1QkFJckIsK0JBQUEsR0FBaUMsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVkscUNBQVosRUFBbUQsRUFBbkQ7SUFBUjs7dUJBQ2pDLGlDQUFBLEdBQW1DLFNBQUE7YUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxxQ0FBZDtJQUFIOzt1QkFFbkMsWUFBQSxHQUFjLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGFBQVosRUFBMkIsRUFBM0I7SUFBUjs7dUJBVWQsWUFBQSxHQUFjLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGNBQVosRUFBNEIsRUFBNUI7SUFBUjs7dUJBRWQsaUJBQUEsR0FBbUIsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksb0JBQVosRUFBa0MsRUFBbEM7SUFBUjs7dUJBQ25CLG1CQUFBLEdBQXFCLFNBQUMsSUFBRDthQUFVLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLG9CQUFkLEVBQW9DLElBQXBDO0lBQVY7O3VCQUVyQixPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsTUFBbEI7SUFETzs7dUJBR1QsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQSxDQUFjLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsSUFBQyxDQUFBLFdBQVcsRUFBQyxNQUFELEVBQVosQ0FBb0IsSUFBQyxDQUFBLE1BQXJCO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7TUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBLENBQUg7UUFDRSxJQUFDLENBQUEsZUFBRCxDQUFBO1FBQ0EsSUFBQyxDQUFBLEtBQUQsQ0FBQTs7Y0FDd0IsQ0FBRSxlQUExQixDQUEwQyxJQUExQzs7UUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUF6QixDQUFnQyxlQUFoQyxFQUFpRCxhQUFqRCxFQUpGOztNQU1BLE9BUUksRUFSSixFQUNFLElBQUMsQ0FBQSxhQUFBLEtBREgsRUFDVSxJQUFDLENBQUEsMEJBQUEsa0JBRFgsRUFDK0IsSUFBQyxDQUFBLHNCQUFBLGNBRGhDLEVBRUUsSUFBQyxDQUFBLHFCQUFBLGFBRkgsRUFFa0IsSUFBQyxDQUFBLDBCQUFBLGtCQUZuQixFQUdFLElBQUMsQ0FBQSxtQkFBQSxXQUhILEVBR2dCLElBQUMsQ0FBQSxnQkFBQSxRQUhqQixFQUlFLElBQUMsQ0FBQSxjQUFBLE1BSkgsRUFJVyxJQUFDLENBQUEscUJBQUEsYUFKWixFQUkyQixJQUFDLENBQUEscUJBQUEsYUFKNUIsRUFLRSxJQUFDLENBQUEseUJBQUEsaUJBTEgsRUFNRSxJQUFDLENBQUEseUJBQUEsaUJBTkgsRUFPRSxJQUFDLENBQUEsMkJBQUE7YUFFSCxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxhQUFkO0lBcEJPOzt1QkFzQlQseUJBQUEsR0FBMkIsU0FBQTthQUN6QixJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQSxDQUF1QixDQUFDLElBQXhCLENBQTZCLFNBQUMsU0FBRDtlQUFlLENBQUksU0FBUyxDQUFDLE9BQVYsQ0FBQTtNQUFuQixDQUE3QjtJQUR5Qjs7dUJBRzNCLGNBQUEsR0FBZ0IsU0FBQyxLQUFEO0FBQ2QsVUFBQTtNQUFBLElBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQUEsS0FBd0MsSUFBQyxDQUFBLE1BQXZEO0FBQUEsZUFBQTs7TUFDQSwwREFBb0MsQ0FBRSxZQUE1QixDQUFBLFVBQVY7QUFBQSxlQUFBOztNQUNBLElBQVUsSUFBQyxDQUFBLElBQUQsS0FBUyxRQUFuQjtBQUFBLGVBQUE7O01BR0EsSUFBYyxJQUFDLENBQUEsYUFBRCwrRUFBOEIsQ0FBRSxRQUFTLHNDQUF2RDtBQUFBLGVBQUE7O01BQ0EsSUFBVSxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVgsQ0FBc0IsZUFBdEIsQ0FBVjtBQUFBLGVBQUE7O01BRUEsSUFBRyxJQUFDLENBQUEseUJBQUQsQ0FBQSxDQUFIO1FBQ0UsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsVUFBekIsQ0FBQTtRQUNBLElBQUEsR0FBTyxJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FBa0IsSUFBQyxDQUFBLE1BQW5CO1FBQ1AsSUFBRyxJQUFDLENBQUEsTUFBRCxDQUFRLFFBQVIsRUFBa0IsSUFBbEIsQ0FBSDtBQUNFO0FBQUEsZUFBQSxzQ0FBQTs7WUFDRSxVQUFVLENBQUMsY0FBWCxDQUFBO0FBREY7aUJBRUEsSUFBQyxDQUFBLGtCQUFrQixDQUFDLE9BQXBCLENBQUEsRUFIRjtTQUFBLE1BQUE7aUJBS0UsSUFBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBQW9CLElBQXBCLEVBTEY7U0FIRjtPQUFBLE1BQUE7UUFVRSxJQUF1QixJQUFDLENBQUEsSUFBRCxLQUFTLFFBQWhDO2lCQUFBLElBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQUFBO1NBVkY7O0lBVGM7O3VCQXFCaEIsaUJBQUEsR0FBbUIsU0FBQTtBQUNqQixVQUFBO01BQUEsY0FBQSxHQUFpQixJQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLElBQXJCO01BQ2pCLElBQUMsQ0FBQSxhQUFhLENBQUMsZ0JBQWYsQ0FBZ0MsU0FBaEMsRUFBMkMsY0FBM0M7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBdUIsSUFBQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNoQyxLQUFDLENBQUEsYUFBYSxDQUFDLG1CQUFmLENBQW1DLFNBQW5DLEVBQThDLGNBQTlDO1FBRGdDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBQXZCO01BR0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBZCxDQUE0QixjQUE1QixDQUFuQjtNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsZ0JBQWYsQ0FBZ0MsT0FBaEMsRUFBeUMsY0FBekM7YUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBdUIsSUFBQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNoQyxLQUFDLENBQUEsYUFBYSxDQUFDLG1CQUFmLENBQW1DLE9BQW5DLEVBQTRDLGNBQTVDO1FBRGdDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBQXZCO0lBVGlCOzt1QkFlbkIsZUFBQSxHQUFpQixTQUFBO2FBQ2YsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFnQyxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUEsQ0FBaEM7SUFEZTs7dUJBR2pCLGVBQUEsR0FBaUIsU0FBQyxHQUFEO0FBQ2YsVUFBQTtNQURpQixnQ0FBRCxNQUFpQjs7WUFDaEIsQ0FBRSx3QkFBbkIsQ0FBQTs7TUFFQSw2QkFBRyxpQkFBaUIsS0FBcEI7QUFDRSxnQkFBQSxLQUFBO0FBQUEsZ0JBQ08sSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUFBLENBRFA7WUFFSSxJQUFDLENBQUEsZUFBRCxDQUFBOztBQUZKLGlCQUdPLElBQUMsQ0FBQSx1QkFBRCxDQUFBLENBQUEsSUFBK0IsSUFBQyxDQUFBLFNBQUQsQ0FBVywyQ0FBWCxFQUh0QztZQUlJLElBQUMsQ0FBQSx5QkFBRCxDQUFBOztBQUpKLDBFQUtvQyxDQUFFLFdBQS9CLENBQUEsV0FMUDtZQU1JLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxhQUFuQixDQUFBO0FBTko7UUFRQSxJQUFHLElBQUMsQ0FBQSxTQUFELENBQVcsdUNBQVgsQ0FBSDtVQUNFLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQix3QkFBakIsRUFBMkMsSUFBM0MsRUFERjtTQVRGO09BQUEsTUFBQTtRQVlFLElBQUMsQ0FBQSxlQUFELENBQUEsRUFaRjs7YUFhQSxJQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7SUFoQmU7O3VCQWtCakIsSUFBQSxHQUFNLFNBQUE7YUFDSixJQUFDLENBQUEsMEJBQUQsQ0FBQTtJQURJOzt1QkFHTixLQUFBLEdBQU8sU0FBQTtBQUVMLFVBQUE7O1lBQW9CLENBQUUsS0FBdEIsQ0FBQTs7O1lBQ3lCLENBQUUsS0FBM0IsQ0FBQTs7O1lBQ2lCLENBQUUsS0FBbkIsQ0FBQTs7O1lBQzBCLENBQUUsS0FBNUIsQ0FBQTs7b0VBQzJCLENBQUUsS0FBN0IsQ0FBQTtJQU5LOzt1QkFRUCxTQUFBLEdBQVcsU0FBQTtBQUNULFVBQUE7b0JBQUEsSUFBQyxDQUFBLE1BQUQsRUFBQSxhQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsaUJBQVAsQ0FBQSxDQUFYLEVBQUEsSUFBQTtJQURTOzt1QkFJWCx1QkFBQSxHQUF5QixTQUFBO0FBQ3ZCLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixFQUFrQixXQUFsQixDQUFIO1FBQ0UsVUFBQSwyREFBeUMsQ0FBRSxhQUE5QixDQUFBLFdBRGY7T0FBQSxNQUFBO1FBR0UsVUFBQSxHQUFhLElBQUMsQ0FBQSxLQUFELENBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUFBLENBQVAsQ0FBa0MsQ0FBQyxhQUFuQyxDQUFBLEVBSGY7O01BTUEsSUFBQSxDQUFjLFVBQWQ7QUFBQSxlQUFBOztNQUVDLHNCQUFELEVBQU87TUFFUCxJQUFHLElBQUksQ0FBQyxvQkFBTCxDQUEwQixJQUExQixDQUFIO1FBQ0UsT0FBZSxDQUFDLElBQUQsRUFBTyxJQUFQLENBQWYsRUFBQyxlQUFELEVBQVE7UUFDUixJQUFBLEdBQU8sR0FBQSxHQUFNLElBQUMsQ0FBQSxLQUFLLENBQUMscUJBQVAsQ0FBNkIsSUFBQyxDQUFBLE1BQTlCLEVBQXNDLEdBQXRDLEVBQTJDLFNBQTNDLEVBRmY7T0FBQSxNQUFBO1FBSUUsT0FBZSxDQUFDLElBQUQsRUFBTyxJQUFQLENBQWYsRUFBQyxlQUFELEVBQVE7UUFDUixJQUFBLEdBQU8sR0FBQSxHQUFNLElBQUMsQ0FBQSxLQUFLLENBQUMscUJBQVAsQ0FBNkIsSUFBQyxDQUFBLE1BQTlCLEVBQXNDLEdBQXRDLEVBQTJDLFNBQTNDLEVBTGY7O01BT0EsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsR0FBVixFQUFlLEtBQWY7TUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxHQUFWLEVBQWUsR0FBZjthQUNBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtRQUFDLFVBQUEsRUFBWTtVQUFDLE1BQUEsSUFBRDtVQUFPLE1BQUEsSUFBUDtTQUFiO1FBQTRCLFNBQUQsSUFBQyxDQUFBLE9BQTVCOztJQXBCRTs7dUJBd0J6Qix1QkFBQSxHQUF5QixTQUFBO0FBQ3ZCLFVBQUE7d0VBQStCLENBQUUsVUFBakMsQ0FBQTtJQUR1Qjs7dUJBR3pCLGtDQUFBLEdBQW9DLFNBQUE7QUFDbEMsVUFBQTtvSUFBMkQ7SUFEekI7O3VCQUdwQyx5QkFBQSxHQUEyQixTQUFBO0FBQ3pCLFVBQUE7d0VBQStCLENBQUUsWUFBakMsQ0FBQTtJQUR5Qjs7dUJBSzNCLHFCQUFBLEdBQXVCOzt1QkFDdkIsc0JBQUEsR0FBd0IsU0FBQyxJQUFELEVBQU8sRUFBUCxFQUFXLE9BQVg7O1FBQ3RCLFNBQVUsT0FBQSxDQUFRLHNCQUFSLENBQStCLENBQUM7O2FBQzFDLElBQUMsQ0FBQSxxQkFBRCxHQUF5QixNQUFBLENBQU8sSUFBUCxDQUFZLENBQUMsT0FBYixDQUFxQixFQUFyQixFQUF5QixPQUF6QjtJQUZIOzt1QkFJeEIscUJBQUEsR0FBdUIsU0FBQTtBQUNyQixVQUFBOztZQUFzQixDQUFFLE1BQXhCLENBQUE7O2FBQ0EsSUFBQyxDQUFBLHFCQUFELEdBQXlCO0lBRko7O3VCQU12QiwwQkFBQSxHQUE0QixTQUFBO0FBQzFCLFVBQUE7TUFBQSxJQUFDLENBQUEsc0JBQUQsR0FBMEI7O1lBQ0ssQ0FBRSxPQUFqQyxDQUFBOztNQUVBLElBQUcsSUFBQyxDQUFBLElBQUQsS0FBUyxRQUFaO1FBQ0UsU0FBQSxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBQTtRQUNaLEtBQUEsR0FBUSxJQUFDLENBQUEsS0FBRCxDQUFPLFNBQVAsQ0FBaUIsQ0FBQyxvQkFBbEIsQ0FBdUMsTUFBdkMsRUFBK0M7VUFBQSxJQUFBLEVBQU0sQ0FBQyxVQUFELEVBQWEsV0FBYixDQUFOO1NBQS9DLEVBRlY7T0FBQSxNQUFBO1FBSUUsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxFQUpWOztNQUtBLElBQUMsQ0FBQSxzQkFBRCxHQUEwQjthQUMxQixJQUFDLENBQUEsOEJBQUQsR0FBa0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUEyQixLQUEzQixFQUFrQztRQUFBLFVBQUEsRUFBWSxPQUFaO09BQWxDO0lBVlI7O3VCQVk1Qiw2QkFBQSxHQUErQixTQUFBO2FBQzdCLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsSUFBQyxDQUFBLHlCQUFELENBQUEsQ0FBaEM7SUFENkI7O3VCQUcvQix5QkFBQSxHQUEyQixTQUFBO2FBQ3pCLElBQUMsQ0FBQTtJQUR3Qjs7dUJBRzNCLGlDQUFBLEdBQW1DLFNBQUE7YUFDakMsSUFBQyxDQUFBLDhCQUE4QixDQUFDLHNCQUFoQyxDQUFBO0lBRGlDOzs7OztBQTlXckMiLCJzb3VyY2VzQ29udGVudCI6WyJEZWxlZ2F0byA9IHJlcXVpcmUgJ2RlbGVnYXRvJ1xualF1ZXJ5ID0gbnVsbFxuXG57RW1pdHRlciwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcblxuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuTW9kZU1hbmFnZXIgPSByZXF1aXJlICcuL21vZGUtbWFuYWdlcidcblxuTGF6eUxvYWRlZExpYnMgPSB7fVxuXG5sYXp5UmVxdWlyZSA9IChmaWxlKSAtPlxuICB1bmxlc3MgZmlsZSBvZiBMYXp5TG9hZGVkTGlic1xuXG4gICAgaWYgYXRvbS5pbkRldk1vZGUoKSBhbmQgc2V0dGluZ3MuZ2V0KCdkZWJ1ZycpXG4gICAgICBjb25zb2xlLmxvZyBcIiMgbGF6eS1yZXF1aXJlOiAje2ZpbGV9XCJcbiAgICAgICMgY29uc29sZS50cmFjZSgpXG5cbiAgICBMYXp5TG9hZGVkTGlic1tmaWxlXSA9IHJlcXVpcmUoZmlsZSlcbiAgTGF6eUxvYWRlZExpYnNbZmlsZV1cblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVmltU3RhdGVcbiAgQHZpbVN0YXRlc0J5RWRpdG9yOiBuZXcgTWFwXG5cbiAgQGdldEJ5RWRpdG9yOiAoZWRpdG9yKSAtPiBAdmltU3RhdGVzQnlFZGl0b3IuZ2V0KGVkaXRvcilcbiAgQGhhczogKGVkaXRvcikgLT4gQHZpbVN0YXRlc0J5RWRpdG9yLmhhcyhlZGl0b3IpXG4gIEBkZWxldGU6IChlZGl0b3IpIC0+IEB2aW1TdGF0ZXNCeUVkaXRvci5kZWxldGUoZWRpdG9yKVxuICBAZm9yRWFjaDogKGZuKSAtPiBAdmltU3RhdGVzQnlFZGl0b3IuZm9yRWFjaChmbilcbiAgQGNsZWFyOiAtPiBAdmltU3RhdGVzQnlFZGl0b3IuY2xlYXIoKVxuXG4gIERlbGVnYXRvLmluY2x1ZGVJbnRvKHRoaXMpXG4gIEBkZWxlZ2F0ZXNQcm9wZXJ0eSgnbW9kZScsICdzdWJtb2RlJywgdG9Qcm9wZXJ0eTogJ21vZGVNYW5hZ2VyJylcbiAgQGRlbGVnYXRlc01ldGhvZHMoJ2lzTW9kZScsICdhY3RpdmF0ZScsIHRvUHJvcGVydHk6ICdtb2RlTWFuYWdlcicpXG4gIEBkZWxlZ2F0ZXNNZXRob2RzKCdmbGFzaCcsICdmbGFzaFNjcmVlblJhbmdlJywgdG9Qcm9wZXJ0eTogJ2ZsYXNoTWFuYWdlcicpXG4gIEBkZWxlZ2F0ZXNNZXRob2RzKCdzdWJzY3JpYmUnLCAnZ2V0Q291bnQnLCAnc2V0Q291bnQnLCAnaGFzQ291bnQnLCAnYWRkVG9DbGFzc0xpc3QnLCB0b1Byb3BlcnR5OiAnb3BlcmF0aW9uU3RhY2snKVxuXG4gIEBkZWZpbmVMYXp5UHJvcGVydHk6IChuYW1lLCBmaWxlVG9Mb2FkLCBpbnN0YW50aWF0ZT10cnVlKSAtPlxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCBuYW1lLFxuICAgICAgZ2V0OiAtPiB0aGlzW1wiX18je25hbWV9XCJdID89IGRvID0+XG4gICAgICAgIGlmIGluc3RhbnRpYXRlXG4gICAgICAgICAgbmV3IChsYXp5UmVxdWlyZShmaWxlVG9Mb2FkKSkodGhpcylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxhenlSZXF1aXJlKGZpbGVUb0xvYWQpXG5cbiAgZ2V0UHJvcDogKG5hbWUpIC0+XG4gICAgdGhpc1tuYW1lXSBpZiB0aGlzW1wiX18je25hbWV9XCJdP1xuXG4gIEBkZWZpbmVMYXp5UHJvcGVydHkoJ3N3cmFwJywgJy4vc2VsZWN0aW9uLXdyYXBwZXInLCBmYWxzZSlcbiAgQGRlZmluZUxhenlQcm9wZXJ0eSgndXRpbHMnLCAnLi91dGlscycsIGZhbHNlKVxuXG4gIEBsYXp5UHJvcGVydGllcyA9XG4gICAgbWFyazogJy4vbWFyay1tYW5hZ2VyJ1xuICAgIHJlZ2lzdGVyOiAnLi9yZWdpc3Rlci1tYW5hZ2VyJ1xuICAgIGhvdmVyOiAnLi9ob3Zlci1tYW5hZ2VyJ1xuICAgIGhvdmVyU2VhcmNoQ291bnRlcjogJy4vaG92ZXItbWFuYWdlcidcbiAgICBzZWFyY2hIaXN0b3J5OiAnLi9zZWFyY2gtaGlzdG9yeS1tYW5hZ2VyJ1xuICAgIGhpZ2hsaWdodFNlYXJjaDogJy4vaGlnaGxpZ2h0LXNlYXJjaC1tYW5hZ2VyJ1xuICAgIHBlcnNpc3RlbnRTZWxlY3Rpb246ICcuL3BlcnNpc3RlbnQtc2VsZWN0aW9uLW1hbmFnZXInXG4gICAgb2NjdXJyZW5jZU1hbmFnZXI6ICcuL29jY3VycmVuY2UtbWFuYWdlcidcbiAgICBtdXRhdGlvbk1hbmFnZXI6ICcuL211dGF0aW9uLW1hbmFnZXInXG4gICAgZmxhc2hNYW5hZ2VyOiAnLi9mbGFzaC1tYW5hZ2VyJ1xuICAgIHNlYXJjaElucHV0OiAnLi9zZWFyY2gtaW5wdXQnXG4gICAgb3BlcmF0aW9uU3RhY2s6ICcuL29wZXJhdGlvbi1zdGFjaydcbiAgICBjdXJzb3JTdHlsZU1hbmFnZXI6ICcuL2N1cnNvci1zdHlsZS1tYW5hZ2VyJ1xuXG4gIGZvciBwcm9wTmFtZSwgZmlsZVRvTG9hZCBvZiBAbGF6eVByb3BlcnRpZXNcbiAgICBAZGVmaW5lTGF6eVByb3BlcnR5KHByb3BOYW1lLCBmaWxlVG9Mb2FkKVxuXG4gIHJlcG9ydFJlcXVpcmVDYWNoZTogKHtmb2N1cywgZXhjbHVkZU5vZE1vZHVsZXN9KSAtPlxuICAgIHtpbnNwZWN0fSA9IHJlcXVpcmUgJ3V0aWwnXG4gICAgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG4gICAgcGFja1BhdGggPSBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoXCJ2aW0tbW9kZS1wbHVzXCIpLnBhdGhcbiAgICBjYWNoZWRQYXRocyA9IE9iamVjdC5rZXlzKHJlcXVpcmUuY2FjaGUpXG4gICAgICAuZmlsdGVyIChwKSAtPiBwLnN0YXJ0c1dpdGgocGFja1BhdGggKyBwYXRoLnNlcClcbiAgICAgIC5tYXAgKHApIC0+IHAucmVwbGFjZShwYWNrUGF0aCwgJycpXG5cbiAgICBmb3IgY2FjaGVkUGF0aCBpbiBjYWNoZWRQYXRoc1xuICAgICAgaWYgZXhjbHVkZU5vZE1vZHVsZXMgYW5kIGNhY2hlZFBhdGguc2VhcmNoKC9ub2RlX21vZHVsZXMvKSA+PSAwXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICBpZiBmb2N1cyBhbmQgY2FjaGVkUGF0aC5zZWFyY2goLy8vI3tmb2N1c30vLy8pID49IDBcbiAgICAgICAgY2FjaGVkUGF0aCA9ICcqJyArIGNhY2hlZFBhdGhcblxuICAgICAgY29uc29sZS5sb2cgY2FjaGVkUGF0aFxuXG5cbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBAc3RhdHVzQmFyTWFuYWdlciwgQGdsb2JhbFN0YXRlKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50ID0gQGVkaXRvci5lbGVtZW50XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAbW9kZU1hbmFnZXIgPSBuZXcgTW9kZU1hbmFnZXIodGhpcylcbiAgICBAcHJldmlvdXNTZWxlY3Rpb24gPSB7fVxuICAgIEBvYnNlcnZlU2VsZWN0aW9ucygpXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKCd2aW0tbW9kZS1wbHVzJylcbiAgICBzdGFydEluc2VydFNjb3BlcyA9IEBnZXRDb25maWcoJ3N0YXJ0SW5JbnNlcnRNb2RlU2NvcGVzJylcblxuICAgIGlmIEBnZXRDb25maWcoJ3N0YXJ0SW5JbnNlcnRNb2RlJykgb3Igc3RhcnRJbnNlcnRTY29wZXMubGVuZ3RoIGFuZCBAdXRpbHMubWF0Y2hTY29wZXMoQGVkaXRvckVsZW1lbnQsIHN0YXJ0SW5zZXJ0U2NvcGVzKVxuICAgICAgQGFjdGl2YXRlKCdpbnNlcnQnKVxuICAgIGVsc2VcbiAgICAgIEBhY3RpdmF0ZSgnbm9ybWFsJylcblxuICAgIEBlZGl0b3Iub25EaWREZXN0cm95KEBkZXN0cm95KVxuICAgIEBjb25zdHJ1Y3Rvci52aW1TdGF0ZXNCeUVkaXRvci5zZXQoQGVkaXRvciwgdGhpcylcblxuICBnZXRDb25maWc6IChwYXJhbSkgLT5cbiAgICBzZXR0aW5ncy5nZXQocGFyYW0pXG5cbiAgIyBCbG9ja3dpc2VTZWxlY3Rpb25zXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zOiAtPlxuICAgIEBzd3JhcC5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKEBlZGl0b3IpXG5cbiAgZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbjogLT5cbiAgICBAc3dyYXAuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbnMoQGVkaXRvcilcblxuICBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb246IC0+XG4gICAgQHN3cmFwLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbihAZWRpdG9yKVxuXG4gIGNsZWFyQmxvY2t3aXNlU2VsZWN0aW9uczogLT5cbiAgICBAc3dyYXAuY2xlYXJCbG9ja3dpc2VTZWxlY3Rpb25zKEBlZGl0b3IpXG5cbiAgIyBPdGhlclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBGSVhNRTogSSB3YW50IHRvIHJlbW92ZSB0aGlzIGRlbmdlcmlvdXMgYXBwcm9hY2gsIGJ1dCBJIGNvdWxkbid0IGZpbmQgdGhlIGJldHRlciB3YXkuXG4gIHN3YXBDbGFzc05hbWU6IChjbGFzc05hbWVzLi4uKSAtPlxuICAgIG9sZE1vZGUgPSBAbW9kZVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3ZpbS1tb2RlLXBsdXMnLCBvbGRNb2RlICsgXCItbW9kZVwiKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lcy4uLilcblxuICAgIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZXMuLi4pXG4gICAgICBjbGFzc1RvQWRkID0gWyd2aW0tbW9kZS1wbHVzJywgJ2lzLWZvY3VzZWQnXVxuICAgICAgaWYgQG1vZGUgaXMgb2xkTW9kZVxuICAgICAgICBjbGFzc1RvQWRkLnB1c2gob2xkTW9kZSArIFwiLW1vZGVcIilcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NUb0FkZC4uLilcblxuICAjIEFsbCBzdWJzY3JpcHRpb25zIGhlcmUgaXMgY2VsYXJlZCBvbiBlYWNoIG9wZXJhdGlvbiBmaW5pc2hlZC5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG9uRGlkQ2hhbmdlU2VhcmNoOiAoZm4pIC0+IEBzdWJzY3JpYmUgQHNlYXJjaElucHV0Lm9uRGlkQ2hhbmdlKGZuKVxuICBvbkRpZENvbmZpcm1TZWFyY2g6IChmbikgLT4gQHN1YnNjcmliZSBAc2VhcmNoSW5wdXQub25EaWRDb25maXJtKGZuKVxuICBvbkRpZENhbmNlbFNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENhbmNlbChmbilcbiAgb25EaWRDb21tYW5kU2VhcmNoOiAoZm4pIC0+IEBzdWJzY3JpYmUgQHNlYXJjaElucHV0Lm9uRGlkQ29tbWFuZChmbilcblxuICAjIFNlbGVjdCBhbmQgdGV4dCBtdXRhdGlvbihDaGFuZ2UpXG4gIG9uRGlkU2V0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1zZXQtdGFyZ2V0JywgZm4pXG4gIGVtaXREaWRTZXRUYXJnZXQ6IChvcGVyYXRvcikgLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXNldC10YXJnZXQnLCBvcGVyYXRvcilcblxuICBvbldpbGxTZWxlY3RUYXJnZXQ6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignd2lsbC1zZWxlY3QtdGFyZ2V0JywgZm4pXG4gIGVtaXRXaWxsU2VsZWN0VGFyZ2V0OiAtPiBAZW1pdHRlci5lbWl0KCd3aWxsLXNlbGVjdC10YXJnZXQnKVxuXG4gIG9uRGlkU2VsZWN0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1zZWxlY3QtdGFyZ2V0JywgZm4pXG4gIGVtaXREaWRTZWxlY3RUYXJnZXQ6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZWxlY3QtdGFyZ2V0JylcblxuICBvbkRpZEZhaWxTZWxlY3RUYXJnZXQ6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLWZhaWwtc2VsZWN0LXRhcmdldCcsIGZuKVxuICBlbWl0RGlkRmFpbFNlbGVjdFRhcmdldDogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLWZhaWwtc2VsZWN0LXRhcmdldCcpXG5cbiAgb25XaWxsRmluaXNoTXV0YXRpb246IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignb24td2lsbC1maW5pc2gtbXV0YXRpb24nLCBmbilcbiAgZW1pdFdpbGxGaW5pc2hNdXRhdGlvbjogLT4gQGVtaXR0ZXIuZW1pdCgnb24td2lsbC1maW5pc2gtbXV0YXRpb24nKVxuXG4gIG9uRGlkRmluaXNoTXV0YXRpb246IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignb24tZGlkLWZpbmlzaC1tdXRhdGlvbicsIGZuKVxuICBlbWl0RGlkRmluaXNoTXV0YXRpb246IC0+IEBlbWl0dGVyLmVtaXQoJ29uLWRpZC1maW5pc2gtbXV0YXRpb24nKVxuXG4gIG9uRGlkU2V0T3BlcmF0b3JNb2RpZmllcjogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtc2V0LW9wZXJhdG9yLW1vZGlmaWVyJywgZm4pXG4gIGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyOiAob3B0aW9ucykgLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXNldC1vcGVyYXRvci1tb2RpZmllcicsIG9wdGlvbnMpXG5cbiAgb25EaWRGaW5pc2hPcGVyYXRpb246IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLWZpbmlzaC1vcGVyYXRpb24nLCBmbilcbiAgZW1pdERpZEZpbmlzaE9wZXJhdGlvbjogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLWZpbmlzaC1vcGVyYXRpb24nKVxuXG4gIG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjazogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtcmVzZXQtb3BlcmF0aW9uLXN0YWNrJywgZm4pXG4gIGVtaXREaWRSZXNldE9wZXJhdGlvblN0YWNrOiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtcmVzZXQtb3BlcmF0aW9uLXN0YWNrJylcblxuICAjIFNlbGVjdCBsaXN0IHZpZXdcbiAgb25EaWRDb25maXJtU2VsZWN0TGlzdDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtY29uZmlybS1zZWxlY3QtbGlzdCcsIGZuKVxuICBvbkRpZENhbmNlbFNlbGVjdExpc3Q6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLWNhbmNlbC1zZWxlY3QtbGlzdCcsIGZuKVxuXG4gICMgUHJveHlpbmcgbW9kZU1hbmdlcidzIGV2ZW50IGhvb2sgd2l0aCBzaG9ydC1saWZlIHN1YnNjcmlwdGlvbi5cbiAgb25XaWxsQWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLm9uV2lsbEFjdGl2YXRlTW9kZShmbilcbiAgb25EaWRBY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIub25EaWRBY3RpdmF0ZU1vZGUoZm4pXG4gIG9uV2lsbERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLm9uV2lsbERlYWN0aXZhdGVNb2RlKGZuKVxuICBwcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLnByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGUoZm4pXG4gIG9uRGlkRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIub25EaWREZWFjdGl2YXRlTW9kZShmbilcblxuICAjIEV2ZW50c1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb25EaWRGYWlsVG9QdXNoVG9PcGVyYXRpb25TdGFjazogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWZhaWwtdG8tcHVzaC10by1vcGVyYXRpb24tc3RhY2snLCBmbilcbiAgZW1pdERpZEZhaWxUb1B1c2hUb09wZXJhdGlvblN0YWNrOiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtZmFpbC10by1wdXNoLXRvLW9wZXJhdGlvbi1zdGFjaycpXG5cbiAgb25EaWREZXN0cm95OiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtZGVzdHJveScsIGZuKVxuXG4gICMgKiBgZm5gIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdoZW4gbWFyayB3YXMgc2V0LlxuICAjICAgKiBgbmFtZWAgTmFtZSBvZiBtYXJrIHN1Y2ggYXMgJ2EnLlxuICAjICAgKiBgYnVmZmVyUG9zaXRpb25gOiBidWZmZXJQb3NpdGlvbiB3aGVyZSBtYXJrIHdhcyBzZXQuXG4gICMgICAqIGBlZGl0b3JgOiBlZGl0b3Igd2hlcmUgbWFyayB3YXMgc2V0LlxuICAjIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gICNcbiAgIyAgVXNhZ2U6XG4gICMgICBvbkRpZFNldE1hcmsgKHtuYW1lLCBidWZmZXJQb3NpdGlvbn0pIC0+IGRvIHNvbWV0aGluZy4uXG4gIG9uRGlkU2V0TWFyazogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLXNldC1tYXJrJywgZm4pXG5cbiAgb25EaWRTZXRJbnB1dENoYXI6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1zZXQtaW5wdXQtY2hhcicsIGZuKVxuICBlbWl0RGlkU2V0SW5wdXRDaGFyOiAoY2hhcikgLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXNldC1pbnB1dC1jaGFyJywgY2hhcilcblxuICBpc0FsaXZlOiAtPlxuICAgIEBjb25zdHJ1Y3Rvci5oYXMoQGVkaXRvcilcblxuICBkZXN0cm95OiA9PlxuICAgIHJldHVybiB1bmxlc3MgQGlzQWxpdmUoKVxuICAgIEBjb25zdHJ1Y3Rvci5kZWxldGUoQGVkaXRvcilcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICAgIGlmIEBlZGl0b3IuaXNBbGl2ZSgpXG4gICAgICBAcmVzZXROb3JtYWxNb2RlKClcbiAgICAgIEByZXNldCgpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQ/LnNldElucHV0RW5hYmxlZCh0cnVlKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgndmltLW1vZGUtcGx1cycsICdub3JtYWwtbW9kZScpXG5cbiAgICB7XG4gICAgICBAaG92ZXIsIEBob3ZlclNlYXJjaENvdW50ZXIsIEBvcGVyYXRpb25TdGFjayxcbiAgICAgIEBzZWFyY2hIaXN0b3J5LCBAY3Vyc29yU3R5bGVNYW5hZ2VyXG4gICAgICBAbW9kZU1hbmFnZXIsIEByZWdpc3RlclxuICAgICAgQGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBzdWJzY3JpcHRpb25zLFxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyXG4gICAgICBAcHJldmlvdXNTZWxlY3Rpb25cbiAgICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uXG4gICAgfSA9IHt9XG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWRlc3Ryb3knXG5cbiAgaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbjogLT5cbiAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5zb21lKChzZWxlY3Rpb24pIC0+IG5vdCBzZWxlY3Rpb24uaXNFbXB0eSgpKVxuXG4gIGNoZWNrU2VsZWN0aW9uOiAoZXZlbnQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkgaXMgQGVkaXRvclxuICAgIHJldHVybiBpZiBAZ2V0UHJvcCgnb3BlcmF0aW9uU3RhY2snKT8uaXNQcm9jZXNzaW5nKCkgIyBEb24ndCBwb3B1bGF0ZSBsYXp5LXByb3Agb24gc3RhcnR1cFxuICAgIHJldHVybiBpZiBAbW9kZSBpcyAnaW5zZXJ0J1xuICAgICMgSW50ZW50aW9uYWxseSB1c2luZyB0YXJnZXQuY2xvc2VzdCgnYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgIyBEb24ndCB1c2UgdGFyZ2V0LmdldE1vZGVsKCkgd2hpY2ggaXMgd29yayBmb3IgQ3VzdG9tRXZlbnQgYnV0IG5vdCB3b3JrIGZvciBtb3VzZSBldmVudC5cbiAgICByZXR1cm4gdW5sZXNzIEBlZGl0b3JFbGVtZW50IGlzIGV2ZW50LnRhcmdldD8uY2xvc2VzdD8oJ2F0b20tdGV4dC1lZGl0b3InKVxuICAgIHJldHVybiBpZiBldmVudC50eXBlLnN0YXJ0c1dpdGgoJ3ZpbS1tb2RlLXBsdXMnKSAjIHRvIG1hdGNoIHZpbS1tb2RlLXBsdXM6IGFuZCB2aW0tbW9kZS1wbHVzLXVzZXI6XG5cbiAgICBpZiBAaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbigpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQudXBkYXRlU3luYygpXG4gICAgICB3aXNlID0gQHN3cmFwLmRldGVjdFdpc2UoQGVkaXRvcilcbiAgICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsIHdpc2UpXG4gICAgICAgIGZvciAkc2VsZWN0aW9uIGluIEBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpXG4gICAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICAgIEBjdXJzb3JTdHlsZU1hbmFnZXIucmVmcmVzaCgpXG4gICAgICBlbHNlXG4gICAgICAgIEBhY3RpdmF0ZSgndmlzdWFsJywgd2lzZSlcbiAgICBlbHNlXG4gICAgICBAYWN0aXZhdGUoJ25vcm1hbCcpIGlmIEBtb2RlIGlzICd2aXN1YWwnXG5cbiAgb2JzZXJ2ZVNlbGVjdGlvbnM6IC0+XG4gICAgY2hlY2tTZWxlY3Rpb24gPSBAY2hlY2tTZWxlY3Rpb24uYmluZCh0aGlzKVxuICAgIEBlZGl0b3JFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBjaGVja1NlbGVjdGlvbilcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBjaGVja1NlbGVjdGlvbilcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLm9uRGlkRGlzcGF0Y2goY2hlY2tTZWxlY3Rpb24pXG5cbiAgICBAZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIGNoZWNrU2VsZWN0aW9uKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQGVkaXRvckVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBjaGVja1NlbGVjdGlvbilcblxuICAjIFdoYXQncyB0aGlzP1xuICAjIGVkaXRvci5jbGVhclNlbGVjdGlvbnMoKSBkb2Vzbid0IHJlc3BlY3QgbGFzdEN1cnNvciBwb3NpdG9pbi5cbiAgIyBUaGlzIG1ldGhvZCB3b3JrcyBpbiBzYW1lIHdheSBhcyBlZGl0b3IuY2xlYXJTZWxlY3Rpb25zKCkgYnV0IHJlc3BlY3QgbGFzdCBjdXJzb3IgcG9zaXRpb24uXG4gIGNsZWFyU2VsZWN0aW9uczogLT5cbiAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcblxuICByZXNldE5vcm1hbE1vZGU6ICh7dXNlckludm9jYXRpb259PXt9KSAtPlxuICAgIEBnZXRQcm9wKCdzd3JhcCcpPy5jbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuXG4gICAgaWYgdXNlckludm9jYXRpb24gPyBmYWxzZVxuICAgICAgc3dpdGNoXG4gICAgICAgIHdoZW4gQGVkaXRvci5oYXNNdWx0aXBsZUN1cnNvcnMoKVxuICAgICAgICAgIEBjbGVhclNlbGVjdGlvbnMoKVxuICAgICAgICB3aGVuIEBoYXNQZXJzaXN0ZW50U2VsZWN0aW9ucygpIGFuZCBAZ2V0Q29uZmlnKCdjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25PblJlc2V0Tm9ybWFsTW9kZScpXG4gICAgICAgICAgQGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbnMoKVxuICAgICAgICB3aGVuIEBnZXRQcm9wKCdvY2N1cnJlbmNlTWFuYWdlcicpPy5oYXNQYXR0ZXJucygpXG4gICAgICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKVxuXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdjbGVhckhpZ2hsaWdodFNlYXJjaE9uUmVzZXROb3JtYWxNb2RlJylcbiAgICAgICAgQGdsb2JhbFN0YXRlLnNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIG51bGwpXG4gICAgZWxzZVxuICAgICAgQGNsZWFyU2VsZWN0aW9ucygpXG4gICAgQGFjdGl2YXRlKCdub3JtYWwnKVxuXG4gIGluaXQ6IC0+XG4gICAgQHNhdmVPcmlnaW5hbEN1cnNvclBvc2l0aW9uKClcblxuICByZXNldDogLT5cbiAgICAjIERvbid0IHBvcHVsYXRlIGxhenktcHJvcCBvbiBzdGFydHVwXG4gICAgQGdldFByb3AoJ3JlZ2lzdGVyJyk/LnJlc2V0KClcbiAgICBAZ2V0UHJvcCgnc2VhcmNoSGlzdG9yeScpPy5yZXNldCgpXG4gICAgQGdldFByb3AoJ2hvdmVyJyk/LnJlc2V0KClcbiAgICBAZ2V0UHJvcCgnb3BlcmF0aW9uU3RhY2snKT8ucmVzZXQoKVxuICAgIEBnZXRQcm9wKCdtdXRhdGlvbk1hbmFnZXInKT8ucmVzZXQoKVxuXG4gIGlzVmlzaWJsZTogLT5cbiAgICBAZWRpdG9yIGluIEB1dGlscy5nZXRWaXNpYmxlRWRpdG9ycygpXG5cbiAgIyBGSVhNRTogbmFtaW5nLCB1cGRhdGVMYXN0U2VsZWN0ZWRJbmZvID9cbiAgdXBkYXRlUHJldmlvdXNTZWxlY3Rpb246IC0+XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICBwcm9wZXJ0aWVzID0gQGdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKT8uZ2V0UHJvcGVydGllcygpXG4gICAgZWxzZVxuICAgICAgcHJvcGVydGllcyA9IEBzd3JhcChAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSkuZ2V0UHJvcGVydGllcygpXG5cbiAgICAjIFRPRE8jNzA0IHdoZW4gY3Vyc29yIGlzIGFkZGVkIGluIHZpc3VhbC1tb2RlLCBjb3JyZXNwb25kaW5nIHNlbGVjdGlvbiBwcm9wIHlldCBub3QgZXhpc3RzLlxuICAgIHJldHVybiB1bmxlc3MgcHJvcGVydGllc1xuXG4gICAge2hlYWQsIHRhaWx9ID0gcHJvcGVydGllc1xuXG4gICAgaWYgaGVhZC5pc0dyZWF0ZXJUaGFuT3JFcXVhbCh0YWlsKVxuICAgICAgW3N0YXJ0LCBlbmRdID0gW3RhaWwsIGhlYWRdXG4gICAgICBoZWFkID0gZW5kID0gQHV0aWxzLnRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBlbmQsICdmb3J3YXJkJylcbiAgICBlbHNlXG4gICAgICBbc3RhcnQsIGVuZF0gPSBbaGVhZCwgdGFpbF1cbiAgICAgIHRhaWwgPSBlbmQgPSBAdXRpbHMudHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBlZGl0b3IsIGVuZCwgJ2ZvcndhcmQnKVxuXG4gICAgQG1hcmsuc2V0KCc8Jywgc3RhcnQpXG4gICAgQG1hcmsuc2V0KCc+JywgZW5kKVxuICAgIEBwcmV2aW91c1NlbGVjdGlvbiA9IHtwcm9wZXJ0aWVzOiB7aGVhZCwgdGFpbH0sIEBzdWJtb2RlfVxuXG4gICMgUGVyc2lzdGVudCBzZWxlY3Rpb25cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGhhc1BlcnNpc3RlbnRTZWxlY3Rpb25zOiAtPlxuICAgIEBnZXRQcm9wKCdwZXJzaXN0ZW50U2VsZWN0aW9uJyk/Lmhhc01hcmtlcnMoKVxuXG4gIGdldFBlcnNpc3RlbnRTZWxlY3Rpb25CdWZmZXJSYW5nZXM6IC0+XG4gICAgQGdldFByb3AoJ3BlcnNpc3RlbnRTZWxlY3Rpb24nKT8uZ2V0TWFya2VyQnVmZmVyUmFuZ2VzKCkgPyBbXVxuXG4gIGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbnM6IC0+XG4gICAgQGdldFByb3AoJ3BlcnNpc3RlbnRTZWxlY3Rpb24nKT8uY2xlYXJNYXJrZXJzKClcblxuICAjIEFuaW1hdGlvbiBtYW5hZ2VtZW50XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzY3JvbGxBbmltYXRpb25FZmZlY3Q6IG51bGxcbiAgcmVxdWVzdFNjcm9sbEFuaW1hdGlvbjogKGZyb20sIHRvLCBvcHRpb25zKSAtPlxuICAgIGpRdWVyeSA/PSByZXF1aXJlKCdhdG9tLXNwYWNlLXBlbi12aWV3cycpLmpRdWVyeVxuICAgIEBzY3JvbGxBbmltYXRpb25FZmZlY3QgPSBqUXVlcnkoZnJvbSkuYW5pbWF0ZSh0bywgb3B0aW9ucylcblxuICBmaW5pc2hTY3JvbGxBbmltYXRpb246IC0+XG4gICAgQHNjcm9sbEFuaW1hdGlvbkVmZmVjdD8uZmluaXNoKClcbiAgICBAc2Nyb2xsQW5pbWF0aW9uRWZmZWN0ID0gbnVsbFxuXG4gICMgT3RoZXJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNhdmVPcmlnaW5hbEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uID0gbnVsbFxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXI/LmRlc3Ryb3koKVxuXG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIHNlbGVjdGlvbiA9IEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpXG4gICAgICBwb2ludCA9IEBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXSlcbiAgICBlbHNlXG4gICAgICBwb2ludCA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uID0gcG9pbnRcbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyID0gQGVkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24ocG9pbnQsIGludmFsaWRhdGU6ICduZXZlcicpXG5cbiAgcmVzdG9yZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb246IC0+XG4gICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihAZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbigpKVxuXG4gIGdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb246IC0+XG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25cblxuICBnZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXI6IC0+XG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlci5nZXRTdGFydEJ1ZmZlclBvc2l0aW9uKClcbiJdfQ==
