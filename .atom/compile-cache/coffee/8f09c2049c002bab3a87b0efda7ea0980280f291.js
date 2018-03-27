(function() {
  var BlockwiseSelection, CompositeDisposable, CursorStyleManager, Delegato, Disposable, Emitter, FlashManager, HighlightSearchManager, HoverManager, MarkManager, ModeManager, MutationManager, OccurrenceManager, OperationStack, PersistentSelectionManager, Range, RegisterManager, SearchHistoryManager, SearchInputElement, VimState, _, assert, assertWithException, getVisibleEditors, jQuery, matchScopes, packageScope, ref, ref1, semver, settings, swrap, translatePointAndClip,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  semver = require('semver');

  Delegato = require('delegato');

  jQuery = require('atom-space-pen-views').jQuery;

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable, Range = ref.Range;

  settings = require('./settings');

  HoverManager = require('./hover-manager');

  SearchInputElement = require('./search-input');

  ref1 = require('./utils'), getVisibleEditors = ref1.getVisibleEditors, matchScopes = ref1.matchScopes, assert = ref1.assert, assertWithException = ref1.assertWithException, translatePointAndClip = ref1.translatePointAndClip;

  swrap = require('./selection-wrapper');

  OperationStack = require('./operation-stack');

  MarkManager = require('./mark-manager');

  ModeManager = require('./mode-manager');

  RegisterManager = require('./register-manager');

  SearchHistoryManager = require('./search-history-manager');

  CursorStyleManager = require('./cursor-style-manager');

  BlockwiseSelection = require('./blockwise-selection');

  OccurrenceManager = require('./occurrence-manager');

  HighlightSearchManager = require('./highlight-search-manager');

  MutationManager = require('./mutation-manager');

  PersistentSelectionManager = require('./persistent-selection-manager');

  FlashManager = require('./flash-manager');

  packageScope = 'vim-mode-plus';

  module.exports = VimState = (function() {
    VimState.vimStatesByEditor = new Map;

    VimState.getByEditor = function(editor) {
      return this.vimStatesByEditor.get(editor);
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

    function VimState(editor1, statusBarManager, globalState) {
      var refreshHighlightSearch;
      this.editor = editor1;
      this.statusBarManager = statusBarManager;
      this.globalState = globalState;
      this.editorElement = this.editor.element;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.modeManager = new ModeManager(this);
      this.mark = new MarkManager(this);
      this.register = new RegisterManager(this);
      this.hover = new HoverManager(this);
      this.hoverSearchCounter = new HoverManager(this);
      this.searchHistory = new SearchHistoryManager(this);
      this.highlightSearch = new HighlightSearchManager(this);
      this.persistentSelection = new PersistentSelectionManager(this);
      this.occurrenceManager = new OccurrenceManager(this);
      this.mutationManager = new MutationManager(this);
      this.flashManager = new FlashManager(this);
      this.searchInput = new SearchInputElement().initialize(this);
      this.operationStack = new OperationStack(this);
      this.cursorStyleManager = new CursorStyleManager(this);
      this.blockwiseSelections = [];
      this.previousSelection = {};
      this.observeSelections();
      refreshHighlightSearch = (function(_this) {
        return function() {
          return _this.highlightSearch.refresh();
        };
      })(this);
      this.subscriptions.add(this.editor.onDidStopChanging(refreshHighlightSearch));
      this.editorElement.classList.add(packageScope);
      if (this.getConfig('startInInsertMode') || matchScopes(this.editorElement, this.getConfig('startInInsertModeScopes'))) {
        this.activate('insert');
      } else {
        this.activate('normal');
      }
      this.subscriptions.add(this.editor.onDidDestroy(this.destroy.bind(this)));
      this.constructor.vimStatesByEditor.set(this.editor, this);
    }

    VimState.prototype.assert = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return assert.apply(null, args);
    };

    VimState.prototype.assertWithException = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return assertWithException.apply(null, args);
    };

    VimState.prototype.getConfig = function(param) {
      return settings.get(param);
    };

    VimState.prototype.getBlockwiseSelections = function() {
      return BlockwiseSelection.getSelections(this.editor);
    };

    VimState.prototype.getLastBlockwiseSelection = function() {
      return BlockwiseSelection.getLastSelection(this.editor);
    };

    VimState.prototype.getBlockwiseSelectionsOrderedByBufferPosition = function() {
      return BlockwiseSelection.getSelectionsOrderedByBufferPosition(this.editor);
    };

    VimState.prototype.clearBlockwiseSelections = function() {
      return BlockwiseSelection.clearSelections(this.editor);
    };

    VimState.prototype.toggleClassList = function(className, bool) {
      if (bool == null) {
        bool = void 0;
      }
      return this.editorElement.classList.toggle(className, bool);
    };

    VimState.prototype.swapClassName = function() {
      var classNames, oldMode, ref2;
      classNames = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      oldMode = this.mode;
      this.editorElement.classList.remove(oldMode + "-mode");
      this.editorElement.classList.remove('vim-mode-plus');
      (ref2 = this.editorElement.classList).add.apply(ref2, classNames);
      return new Disposable((function(_this) {
        return function() {
          var ref3;
          (ref3 = _this.editorElement.classList).remove.apply(ref3, classNames);
          if (_this.mode === oldMode) {
            _this.editorElement.classList.add(oldMode + "-mode");
          }
          _this.editorElement.classList.add('vim-mode-plus');
          return _this.editorElement.classList.add('is-focused');
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

    VimState.prototype.onDidRestoreCursorPositions = function(fn) {
      return this.subscribe(this.emitter.on('did-restore-cursor-positions', fn));
    };

    VimState.prototype.emitDidRestoreCursorPositions = function(event) {
      return this.emitter.emit('did-restore-cursor-positions', event);
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
      return this.constructor.vimStatesByEditor.has(this.editor);
    };

    VimState.prototype.destroy = function() {
      var ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
      if (!this.isAlive()) {
        return;
      }
      this.constructor.vimStatesByEditor["delete"](this.editor);
      BlockwiseSelection.clearSelections(this.editor);
      this.subscriptions.dispose();
      if (this.editor.isAlive()) {
        this.resetNormalMode();
        this.reset();
        if ((ref2 = this.editorElement.component) != null) {
          ref2.setInputEnabled(true);
        }
        this.editorElement.classList.remove(packageScope, 'normal-mode');
      }
      if ((ref3 = this.hover) != null) {
        if (typeof ref3.destroy === "function") {
          ref3.destroy();
        }
      }
      if ((ref4 = this.hoverSearchCounter) != null) {
        if (typeof ref4.destroy === "function") {
          ref4.destroy();
        }
      }
      if ((ref5 = this.searchHistory) != null) {
        if (typeof ref5.destroy === "function") {
          ref5.destroy();
        }
      }
      if ((ref6 = this.cursorStyleManager) != null) {
        if (typeof ref6.destroy === "function") {
          ref6.destroy();
        }
      }
      if ((ref7 = this.search) != null) {
        if (typeof ref7.destroy === "function") {
          ref7.destroy();
        }
      }
      ((ref8 = this.register) != null ? ref8.destroy : void 0) != null;
      ref9 = {}, this.hover = ref9.hover, this.hoverSearchCounter = ref9.hoverSearchCounter, this.operationStack = ref9.operationStack, this.searchHistory = ref9.searchHistory, this.cursorStyleManager = ref9.cursorStyleManager, this.search = ref9.search, this.modeManager = ref9.modeManager, this.register = ref9.register, this.editor = ref9.editor, this.editorElement = ref9.editorElement, this.subscriptions = ref9.subscriptions, this.occurrenceManager = ref9.occurrenceManager, this.previousSelection = ref9.previousSelection, this.persistentSelection = ref9.persistentSelection;
      return this.emitter.emit('did-destroy');
    };

    VimState.prototype.isInterestingEvent = function(arg) {
      var target, type;
      target = arg.target, type = arg.type;
      if (this.mode === 'insert') {
        return false;
      } else {
        return (this.editor != null) && (target != null ? typeof target.closest === "function" ? target.closest('atom-text-editor') : void 0 : void 0) === this.editorElement && !this.isMode('visual', 'blockwise') && !type.startsWith('vim-mode-plus:');
      }
    };

    VimState.prototype.checkSelection = function(event) {
      var $selection, i, len, nonEmptySelecitons, ref2, wise;
      if (this.operationStack.isProcessing()) {
        return;
      }
      if (!this.isInterestingEvent(event)) {
        return;
      }
      nonEmptySelecitons = this.editor.getSelections().filter(function(selection) {
        return !selection.isEmpty();
      });
      if (nonEmptySelecitons.length) {
        wise = swrap.detectWise(this.editor);
        this.editorElement.component.updateSync();
        if (this.isMode('visual', wise)) {
          ref2 = swrap.getSelections(this.editor);
          for (i = 0, len = ref2.length; i < len; i++) {
            $selection = ref2[i];
            if ($selection.hasProperties()) {
              if (wise === 'linewise') {
                $selection.fixPropertyRowToRowRange();
              }
            } else {
              $selection.saveProperties();
            }
          }
          return this.updateCursorsVisibility();
        } else {
          return this.activate('visual', wise);
        }
      } else {
        if (this.mode === 'visual') {
          return this.activate('normal');
        }
      }
    };

    VimState.prototype.saveProperties = function(event) {
      var i, len, ref2, results, selection;
      if (!this.isInterestingEvent(event)) {
        return;
      }
      ref2 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        results.push(swrap(selection).saveProperties());
      }
      return results;
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
      return this.subscriptions.add(atom.commands.onDidDispatch(checkSelection));
    };

    VimState.prototype.clearSelections = function() {
      return this.editor.setCursorBufferPosition(this.editor.getCursorBufferPosition());
    };

    VimState.prototype.resetNormalMode = function(arg) {
      var userInvocation;
      userInvocation = (arg != null ? arg : {}).userInvocation;
      BlockwiseSelection.clearSelections(this.editor);
      if (userInvocation != null ? userInvocation : false) {
        switch (false) {
          case !this.editor.hasMultipleCursors():
            this.clearSelections();
            break;
          case !(this.hasPersistentSelections() && this.getConfig('clearPersistentSelectionOnResetNormalMode')):
            this.clearPersistentSelections();
            break;
          case !this.occurrenceManager.hasPatterns():
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
      this.register.reset();
      this.searchHistory.reset();
      this.hover.reset();
      this.operationStack.reset();
      return this.mutationManager.reset();
    };

    VimState.prototype.isVisible = function() {
      var ref2;
      return ref2 = this.editor, indexOf.call(getVisibleEditors(), ref2) >= 0;
    };

    VimState.prototype.updateCursorsVisibility = function() {
      return this.cursorStyleManager.refresh();
    };

    VimState.prototype.updatePreviousSelection = function() {
      var end, head, properties, ref2, ref3, ref4, start, tail;
      if (this.isMode('visual', 'blockwise')) {
        properties = (ref2 = this.getLastBlockwiseSelection()) != null ? ref2.getProperties() : void 0;
      } else {
        properties = swrap(this.editor.getLastSelection()).getProperties();
      }
      if (!properties) {
        return;
      }
      head = properties.head, tail = properties.tail;
      if (head.isGreaterThanOrEqual(tail)) {
        ref3 = [tail, head], start = ref3[0], end = ref3[1];
        head = end = translatePointAndClip(this.editor, end, 'forward');
      } else {
        ref4 = [head, tail], start = ref4[0], end = ref4[1];
        tail = end = translatePointAndClip(this.editor, end, 'forward');
      }
      this.mark.setRange('<', '>', [start, end]);
      return this.previousSelection = {
        properties: {
          head: head,
          tail: tail
        },
        submode: this.submode
      };
    };

    VimState.prototype.hasPersistentSelections = function() {
      return this.persistentSelection.hasMarkers();
    };

    VimState.prototype.getPersistentSelectionBufferRanges = function() {
      return this.persistentSelection.getMarkerBufferRanges();
    };

    VimState.prototype.clearPersistentSelections = function() {
      return this.persistentSelection.clearMarkers();
    };

    VimState.prototype.scrollAnimationEffect = null;

    VimState.prototype.requestScrollAnimation = function(from, to, options) {
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
        point = swrap(selection).getBufferPositionFor('head', {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3ZpbS1zdGF0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFkQUFBO0lBQUE7OztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDVCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0VBQ1YsU0FBVSxPQUFBLENBQVEsc0JBQVI7O0VBRVgsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUFvRCxPQUFBLENBQVEsTUFBUixDQUFwRCxFQUFDLHFCQUFELEVBQVUsMkJBQVYsRUFBc0IsNkNBQXRCLEVBQTJDOztFQUUzQyxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUjs7RUFDZixrQkFBQSxHQUFxQixPQUFBLENBQVEsZ0JBQVI7O0VBQ3JCLE9BTUksT0FBQSxDQUFRLFNBQVIsQ0FOSixFQUNFLDBDQURGLEVBRUUsOEJBRkYsRUFHRSxvQkFIRixFQUlFLDhDQUpGLEVBS0U7O0VBRUYsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFFUixjQUFBLEdBQWlCLE9BQUEsQ0FBUSxtQkFBUjs7RUFDakIsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSOztFQUNsQixvQkFBQSxHQUF1QixPQUFBLENBQVEsMEJBQVI7O0VBQ3ZCLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx3QkFBUjs7RUFDckIsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHVCQUFSOztFQUNyQixpQkFBQSxHQUFvQixPQUFBLENBQVEsc0JBQVI7O0VBQ3BCLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSw0QkFBUjs7RUFDekIsZUFBQSxHQUFrQixPQUFB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QkFBUixDQUFBLEVBSlY7O01BS0EsSUFBQyxDQUFBLHNCQUFELEdBQTBCO2FBQzFCLElBQUMsQ0FBQSw4QkFBRCxHQUFrQyxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQTJCLEtBQTNCLEVBQWtDO1FBQUEsVUFBQSxFQUFZLE9BQVo7T0FBbEM7SUFWUjs7dUJBWTVCLDZCQUFBLEdBQStCLFNBQUE7YUFDN0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFnQyxJQUFDLENBQUEseUJBQUQsQ0FBQSxDQUFoQztJQUQ2Qjs7dUJBRy9CLHlCQUFBLEdBQTJCLFNBQUE7YUFDekIsSUFBQyxDQUFBO0lBRHdCOzt1QkFHM0IsaUNBQUEsR0FBbUMsU0FBQTthQUNqQyxJQUFDLENBQUEsOEJBQThCLENBQUMsc0JBQWhDLENBQUE7SUFEaUM7Ozs7O0FBallyQyIsInNvdXJjZXNDb250ZW50IjpbInNlbXZlciA9IHJlcXVpcmUgJ3NlbXZlcidcbkRlbGVnYXRvID0gcmVxdWlyZSAnZGVsZWdhdG8nXG57alF1ZXJ5fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0VtaXR0ZXIsIERpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbkhvdmVyTWFuYWdlciA9IHJlcXVpcmUgJy4vaG92ZXItbWFuYWdlcidcblNlYXJjaElucHV0RWxlbWVudCA9IHJlcXVpcmUgJy4vc2VhcmNoLWlucHV0J1xue1xuICBnZXRWaXNpYmxlRWRpdG9yc1xuICBtYXRjaFNjb3Blc1xuICBhc3NlcnRcbiAgYXNzZXJ0V2l0aEV4Y2VwdGlvblxuICB0cmFuc2xhdGVQb2ludEFuZENsaXBcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuXG5PcGVyYXRpb25TdGFjayA9IHJlcXVpcmUgJy4vb3BlcmF0aW9uLXN0YWNrJ1xuTWFya01hbmFnZXIgPSByZXF1aXJlICcuL21hcmstbWFuYWdlcidcbk1vZGVNYW5hZ2VyID0gcmVxdWlyZSAnLi9tb2RlLW1hbmFnZXInXG5SZWdpc3Rlck1hbmFnZXIgPSByZXF1aXJlICcuL3JlZ2lzdGVyLW1hbmFnZXInXG5TZWFyY2hIaXN0b3J5TWFuYWdlciA9IHJlcXVpcmUgJy4vc2VhcmNoLWhpc3RvcnktbWFuYWdlcidcbkN1cnNvclN0eWxlTWFuYWdlciA9IHJlcXVpcmUgJy4vY3Vyc29yLXN0eWxlLW1hbmFnZXInXG5CbG9ja3dpc2VTZWxlY3Rpb24gPSByZXF1aXJlICcuL2Jsb2Nrd2lzZS1zZWxlY3Rpb24nXG5PY2N1cnJlbmNlTWFuYWdlciA9IHJlcXVpcmUgJy4vb2NjdXJyZW5jZS1tYW5hZ2VyJ1xuSGlnaGxpZ2h0U2VhcmNoTWFuYWdlciA9IHJlcXVpcmUgJy4vaGlnaGxpZ2h0LXNlYXJjaC1tYW5hZ2VyJ1xuTXV0YXRpb25NYW5hZ2VyID0gcmVxdWlyZSAnLi9tdXRhdGlvbi1tYW5hZ2VyJ1xuUGVyc2lzdGVudFNlbGVjdGlvbk1hbmFnZXIgPSByZXF1aXJlICcuL3BlcnNpc3RlbnQtc2VsZWN0aW9uLW1hbmFnZXInXG5GbGFzaE1hbmFnZXIgPSByZXF1aXJlICcuL2ZsYXNoLW1hbmFnZXInXG5cbnBhY2thZ2VTY29wZSA9ICd2aW0tbW9kZS1wbHVzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBWaW1TdGF0ZVxuICBAdmltU3RhdGVzQnlFZGl0b3I6IG5ldyBNYXBcblxuICBAZ2V0QnlFZGl0b3I6IChlZGl0b3IpIC0+XG4gICAgQHZpbVN0YXRlc0J5RWRpdG9yLmdldChlZGl0b3IpXG5cbiAgQGZvckVhY2g6IChmbikgLT5cbiAgICBAdmltU3RhdGVzQnlFZGl0b3IuZm9yRWFjaChmbilcblxuICBAY2xlYXI6IC0+XG4gICAgQHZpbVN0YXRlc0J5RWRpdG9yLmNsZWFyKClcblxuICBEZWxlZ2F0by5pbmNsdWRlSW50byh0aGlzKVxuXG4gIEBkZWxlZ2F0ZXNQcm9wZXJ0eSgnbW9kZScsICdzdWJtb2RlJywgdG9Qcm9wZXJ0eTogJ21vZGVNYW5hZ2VyJylcbiAgQGRlbGVnYXRlc01ldGhvZHMoJ2lzTW9kZScsICdhY3RpdmF0ZScsIHRvUHJvcGVydHk6ICdtb2RlTWFuYWdlcicpXG4gIEBkZWxlZ2F0ZXNNZXRob2RzKCdmbGFzaCcsICdmbGFzaFNjcmVlblJhbmdlJywgdG9Qcm9wZXJ0eTogJ2ZsYXNoTWFuYWdlcicpXG4gIEBkZWxlZ2F0ZXNNZXRob2RzKCdzdWJzY3JpYmUnLCAnZ2V0Q291bnQnLCAnc2V0Q291bnQnLCAnaGFzQ291bnQnLCAnYWRkVG9DbGFzc0xpc3QnLCB0b1Byb3BlcnR5OiAnb3BlcmF0aW9uU3RhY2snKVxuXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgQHN0YXR1c0Jhck1hbmFnZXIsIEBnbG9iYWxTdGF0ZSkgLT5cbiAgICBAZWRpdG9yRWxlbWVudCA9IEBlZGl0b3IuZWxlbWVudFxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQG1vZGVNYW5hZ2VyID0gbmV3IE1vZGVNYW5hZ2VyKHRoaXMpXG4gICAgQG1hcmsgPSBuZXcgTWFya01hbmFnZXIodGhpcylcbiAgICBAcmVnaXN0ZXIgPSBuZXcgUmVnaXN0ZXJNYW5hZ2VyKHRoaXMpXG4gICAgQGhvdmVyID0gbmV3IEhvdmVyTWFuYWdlcih0aGlzKVxuICAgIEBob3ZlclNlYXJjaENvdW50ZXIgPSBuZXcgSG92ZXJNYW5hZ2VyKHRoaXMpXG4gICAgQHNlYXJjaEhpc3RvcnkgPSBuZXcgU2VhcmNoSGlzdG9yeU1hbmFnZXIodGhpcylcbiAgICBAaGlnaGxpZ2h0U2VhcmNoID0gbmV3IEhpZ2hsaWdodFNlYXJjaE1hbmFnZXIodGhpcylcbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbiA9IG5ldyBQZXJzaXN0ZW50U2VsZWN0aW9uTWFuYWdlcih0aGlzKVxuICAgIEBvY2N1cnJlbmNlTWFuYWdlciA9IG5ldyBPY2N1cnJlbmNlTWFuYWdlcih0aGlzKVxuICAgIEBtdXRhdGlvbk1hbmFnZXIgPSBuZXcgTXV0YXRpb25NYW5hZ2VyKHRoaXMpXG4gICAgQGZsYXNoTWFuYWdlciA9IG5ldyBGbGFzaE1hbmFnZXIodGhpcylcblxuICAgIEBzZWFyY2hJbnB1dCA9IG5ldyBTZWFyY2hJbnB1dEVsZW1lbnQoKS5pbml0aWFsaXplKHRoaXMpXG5cbiAgICBAb3BlcmF0aW9uU3RhY2sgPSBuZXcgT3BlcmF0aW9uU3RhY2sodGhpcylcbiAgICBAY3Vyc29yU3R5bGVNYW5hZ2VyID0gbmV3IEN1cnNvclN0eWxlTWFuYWdlcih0aGlzKVxuICAgIEBibG9ja3dpc2VTZWxlY3Rpb25zID0gW11cbiAgICBAcHJldmlvdXNTZWxlY3Rpb24gPSB7fVxuICAgIEBvYnNlcnZlU2VsZWN0aW9ucygpXG5cbiAgICByZWZyZXNoSGlnaGxpZ2h0U2VhcmNoID0gPT5cbiAgICAgIEBoaWdobGlnaHRTZWFyY2gucmVmcmVzaCgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRTdG9wQ2hhbmdpbmcocmVmcmVzaEhpZ2hsaWdodFNlYXJjaClcblxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQocGFja2FnZVNjb3BlKVxuICAgIGlmIEBnZXRDb25maWcoJ3N0YXJ0SW5JbnNlcnRNb2RlJykgb3IgbWF0Y2hTY29wZXMoQGVkaXRvckVsZW1lbnQsIEBnZXRDb25maWcoJ3N0YXJ0SW5JbnNlcnRNb2RlU2NvcGVzJykpXG4gICAgICBAYWN0aXZhdGUoJ2luc2VydCcpXG4gICAgZWxzZVxuICAgICAgQGFjdGl2YXRlKCdub3JtYWwnKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG4gICAgQGNvbnN0cnVjdG9yLnZpbVN0YXRlc0J5RWRpdG9yLnNldChAZWRpdG9yLCB0aGlzKVxuXG4gIGFzc2VydDogKGFyZ3MuLi4pIC0+XG4gICAgYXNzZXJ0KGFyZ3MuLi4pXG5cbiAgYXNzZXJ0V2l0aEV4Y2VwdGlvbjogKGFyZ3MuLi4pIC0+XG4gICAgYXNzZXJ0V2l0aEV4Y2VwdGlvbihhcmdzLi4uKVxuXG4gIGdldENvbmZpZzogKHBhcmFtKSAtPlxuICAgIHNldHRpbmdzLmdldChwYXJhbSlcblxuICAjIEJsb2Nrd2lzZVNlbGVjdGlvbnNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGdldEJsb2Nrd2lzZVNlbGVjdGlvbnM6IC0+XG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcblxuICBnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uOiAtPlxuICAgIEJsb2Nrd2lzZVNlbGVjdGlvbi5nZXRMYXN0U2VsZWN0aW9uKEBlZGl0b3IpXG5cbiAgZ2V0QmxvY2t3aXNlU2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIEJsb2Nrd2lzZVNlbGVjdGlvbi5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oQGVkaXRvcilcblxuICBjbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnM6IC0+XG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmNsZWFyU2VsZWN0aW9ucyhAZWRpdG9yKVxuXG4gICMgT3RoZXJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRvZ2dsZUNsYXNzTGlzdDogKGNsYXNzTmFtZSwgYm9vbD11bmRlZmluZWQpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShjbGFzc05hbWUsIGJvb2wpXG5cbiAgIyBGSVhNRTogSSB3YW50IHRvIHJlbW92ZSB0aGlzIGRlbmdlcmlvdXMgYXBwcm9hY2gsIGJ1dCBJIGNvdWxkbid0IGZpbmQgdGhlIGJldHRlciB3YXkuXG4gIHN3YXBDbGFzc05hbWU6IChjbGFzc05hbWVzLi4uKSAtPlxuICAgIG9sZE1vZGUgPSBAbW9kZVxuXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShvbGRNb2RlICsgXCItbW9kZVwiKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3ZpbS1tb2RlLXBsdXMnKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lcy4uLilcblxuICAgIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZXMuLi4pXG4gICAgICBpZiBAbW9kZSBpcyBvbGRNb2RlXG4gICAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQob2xkTW9kZSArIFwiLW1vZGVcIilcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3ZpbS1tb2RlLXBsdXMnKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtZm9jdXNlZCcpXG5cbiAgIyBBbGwgc3Vic2NyaXB0aW9ucyBoZXJlIGlzIGNlbGFyZWQgb24gZWFjaCBvcGVyYXRpb24gZmluaXNoZWQuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvbkRpZENoYW5nZVNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENoYW5nZShmbilcbiAgb25EaWRDb25maXJtU2VhcmNoOiAoZm4pIC0+IEBzdWJzY3JpYmUgQHNlYXJjaElucHV0Lm9uRGlkQ29uZmlybShmbilcbiAgb25EaWRDYW5jZWxTZWFyY2g6IChmbikgLT4gQHN1YnNjcmliZSBAc2VhcmNoSW5wdXQub25EaWRDYW5jZWwoZm4pXG4gIG9uRGlkQ29tbWFuZFNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENvbW1hbmQoZm4pXG5cbiAgIyBTZWxlY3QgYW5kIHRleHQgbXV0YXRpb24oQ2hhbmdlKVxuICBvbkRpZFNldFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtc2V0LXRhcmdldCcsIGZuKVxuICBlbWl0RGlkU2V0VGFyZ2V0OiAob3BlcmF0b3IpIC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZXQtdGFyZ2V0Jywgb3BlcmF0b3IpXG5cbiAgb25XaWxsU2VsZWN0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ3dpbGwtc2VsZWN0LXRhcmdldCcsIGZuKVxuICBlbWl0V2lsbFNlbGVjdFRhcmdldDogLT4gQGVtaXR0ZXIuZW1pdCgnd2lsbC1zZWxlY3QtdGFyZ2V0JylcblxuICBvbkRpZFNlbGVjdFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtc2VsZWN0LXRhcmdldCcsIGZuKVxuICBlbWl0RGlkU2VsZWN0VGFyZ2V0OiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2VsZWN0LXRhcmdldCcpXG5cbiAgb25EaWRGYWlsU2VsZWN0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1mYWlsLXNlbGVjdC10YXJnZXQnLCBmbilcbiAgZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQ6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1mYWlsLXNlbGVjdC10YXJnZXQnKVxuXG4gIG9uV2lsbEZpbmlzaE11dGF0aW9uOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ29uLXdpbGwtZmluaXNoLW11dGF0aW9uJywgZm4pXG4gIGVtaXRXaWxsRmluaXNoTXV0YXRpb246IC0+IEBlbWl0dGVyLmVtaXQoJ29uLXdpbGwtZmluaXNoLW11dGF0aW9uJylcblxuICBvbkRpZEZpbmlzaE11dGF0aW9uOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ29uLWRpZC1maW5pc2gtbXV0YXRpb24nLCBmbilcbiAgZW1pdERpZEZpbmlzaE11dGF0aW9uOiAtPiBAZW1pdHRlci5lbWl0KCdvbi1kaWQtZmluaXNoLW11dGF0aW9uJylcblxuICBvbkRpZFJlc3RvcmVDdXJzb3JQb3NpdGlvbnM6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXJlc3RvcmUtY3Vyc29yLXBvc2l0aW9ucycsIGZuKVxuICBlbWl0RGlkUmVzdG9yZUN1cnNvclBvc2l0aW9uczogKGV2ZW50KSAtPiBAZW1pdHRlci5lbWl0KCdkaWQtcmVzdG9yZS1jdXJzb3ItcG9zaXRpb25zJywgZXZlbnQpXG5cbiAgb25EaWRTZXRPcGVyYXRvck1vZGlmaWVyOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1zZXQtb3BlcmF0b3ItbW9kaWZpZXInLCBmbilcbiAgZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXI6IChvcHRpb25zKSAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2V0LW9wZXJhdG9yLW1vZGlmaWVyJywgb3B0aW9ucylcblxuICBvbkRpZEZpbmlzaE9wZXJhdGlvbjogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtZmluaXNoLW9wZXJhdGlvbicsIGZuKVxuICBlbWl0RGlkRmluaXNoT3BlcmF0aW9uOiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtZmluaXNoLW9wZXJhdGlvbicpXG5cbiAgb25EaWRSZXNldE9wZXJhdGlvblN0YWNrOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1yZXNldC1vcGVyYXRpb24tc3RhY2snLCBmbilcbiAgZW1pdERpZFJlc2V0T3BlcmF0aW9uU3RhY2s6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1yZXNldC1vcGVyYXRpb24tc3RhY2snKVxuXG4gICMgU2VsZWN0IGxpc3Qgdmlld1xuICBvbkRpZENvbmZpcm1TZWxlY3RMaXN0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1jb25maXJtLXNlbGVjdC1saXN0JywgZm4pXG4gIG9uRGlkQ2FuY2VsU2VsZWN0TGlzdDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtY2FuY2VsLXNlbGVjdC1saXN0JywgZm4pXG5cbiAgIyBQcm94eWluZyBtb2RlTWFuZ2VyJ3MgZXZlbnQgaG9vayB3aXRoIHNob3J0LWxpZmUgc3Vic2NyaXB0aW9uLlxuICBvbldpbGxBY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIub25XaWxsQWN0aXZhdGVNb2RlKGZuKVxuICBvbkRpZEFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbkRpZEFjdGl2YXRlTW9kZShmbilcbiAgb25XaWxsRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIub25XaWxsRGVhY3RpdmF0ZU1vZGUoZm4pXG4gIHByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIucHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZShmbilcbiAgb25EaWREZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbkRpZERlYWN0aXZhdGVNb2RlKGZuKVxuXG4gICMgRXZlbnRzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvbkRpZEZhaWxUb1B1c2hUb09wZXJhdGlvblN0YWNrOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtZmFpbC10by1wdXNoLXRvLW9wZXJhdGlvbi1zdGFjaycsIGZuKVxuICBlbWl0RGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2s6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1mYWlsLXRvLXB1c2gtdG8tb3BlcmF0aW9uLXN0YWNrJylcblxuICBvbkRpZERlc3Ryb3k6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgZm4pXG5cbiAgIyAqIGBmbmAge0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbiBtYXJrIHdhcyBzZXQuXG4gICMgICAqIGBuYW1lYCBOYW1lIG9mIG1hcmsgc3VjaCBhcyAnYScuXG4gICMgICAqIGBidWZmZXJQb3NpdGlvbmA6IGJ1ZmZlclBvc2l0aW9uIHdoZXJlIG1hcmsgd2FzIHNldC5cbiAgIyAgICogYGVkaXRvcmA6IGVkaXRvciB3aGVyZSBtYXJrIHdhcyBzZXQuXG4gICMgUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgI1xuICAjICBVc2FnZTpcbiAgIyAgIG9uRGlkU2V0TWFyayAoe25hbWUsIGJ1ZmZlclBvc2l0aW9ufSkgLT4gZG8gc29tZXRoaW5nLi5cbiAgb25EaWRTZXRNYXJrOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtc2V0LW1hcmsnLCBmbilcblxuICBvbkRpZFNldElucHV0Q2hhcjogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLXNldC1pbnB1dC1jaGFyJywgZm4pXG4gIGVtaXREaWRTZXRJbnB1dENoYXI6IChjaGFyKSAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2V0LWlucHV0LWNoYXInLCBjaGFyKVxuXG4gIGlzQWxpdmU6IC0+XG4gICAgQGNvbnN0cnVjdG9yLnZpbVN0YXRlc0J5RWRpdG9yLmhhcyhAZWRpdG9yKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaXNBbGl2ZSgpXG4gICAgQGNvbnN0cnVjdG9yLnZpbVN0YXRlc0J5RWRpdG9yLmRlbGV0ZShAZWRpdG9yKVxuICAgIEJsb2Nrd2lzZVNlbGVjdGlvbi5jbGVhclNlbGVjdGlvbnMoQGVkaXRvcilcblxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gICAgaWYgQGVkaXRvci5pc0FsaXZlKClcbiAgICAgIEByZXNldE5vcm1hbE1vZGUoKVxuICAgICAgQHJlc2V0KClcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudD8uc2V0SW5wdXRFbmFibGVkKHRydWUpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHBhY2thZ2VTY29wZSwgJ25vcm1hbC1tb2RlJylcblxuICAgIEBob3Zlcj8uZGVzdHJveT8oKVxuICAgIEBob3ZlclNlYXJjaENvdW50ZXI/LmRlc3Ryb3k/KClcbiAgICBAc2VhcmNoSGlzdG9yeT8uZGVzdHJveT8oKVxuICAgIEBjdXJzb3JTdHlsZU1hbmFnZXI/LmRlc3Ryb3k/KClcbiAgICBAc2VhcmNoPy5kZXN0cm95PygpXG4gICAgQHJlZ2lzdGVyPy5kZXN0cm95P1xuICAgIHtcbiAgICAgIEBob3ZlciwgQGhvdmVyU2VhcmNoQ291bnRlciwgQG9wZXJhdGlvblN0YWNrLFxuICAgICAgQHNlYXJjaEhpc3RvcnksIEBjdXJzb3JTdHlsZU1hbmFnZXJcbiAgICAgIEBzZWFyY2gsIEBtb2RlTWFuYWdlciwgQHJlZ2lzdGVyXG4gICAgICBAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQHN1YnNjcmlwdGlvbnMsXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXJcbiAgICAgIEBwcmV2aW91c1NlbGVjdGlvblxuICAgICAgQHBlcnNpc3RlbnRTZWxlY3Rpb25cbiAgICB9ID0ge31cbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtZGVzdHJveSdcblxuICBpc0ludGVyZXN0aW5nRXZlbnQ6ICh7dGFyZ2V0LCB0eXBlfSkgLT5cbiAgICBpZiBAbW9kZSBpcyAnaW5zZXJ0J1xuICAgICAgZmFsc2VcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yPyBhbmRcbiAgICAgICAgdGFyZ2V0Py5jbG9zZXN0PygnYXRvbS10ZXh0LWVkaXRvcicpIGlzIEBlZGl0b3JFbGVtZW50IGFuZFxuICAgICAgICBub3QgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpIGFuZFxuICAgICAgICBub3QgdHlwZS5zdGFydHNXaXRoKCd2aW0tbW9kZS1wbHVzOicpXG5cbiAgY2hlY2tTZWxlY3Rpb246IChldmVudCkgLT5cbiAgICByZXR1cm4gaWYgQG9wZXJhdGlvblN0YWNrLmlzUHJvY2Vzc2luZygpXG4gICAgcmV0dXJuIHVubGVzcyBAaXNJbnRlcmVzdGluZ0V2ZW50KGV2ZW50KVxuXG4gICAgbm9uRW1wdHlTZWxlY2l0b25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuZmlsdGVyIChzZWxlY3Rpb24pIC0+IG5vdCBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgaWYgbm9uRW1wdHlTZWxlY2l0b25zLmxlbmd0aFxuICAgICAgd2lzZSA9IHN3cmFwLmRldGVjdFdpc2UoQGVkaXRvcilcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudC51cGRhdGVTeW5jKClcbiAgICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsIHdpc2UpXG4gICAgICAgIGZvciAkc2VsZWN0aW9uIGluIHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcbiAgICAgICAgICBpZiAkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKVxuICAgICAgICAgICAgJHNlbGVjdGlvbi5maXhQcm9wZXJ0eVJvd1RvUm93UmFuZ2UoKSBpZiB3aXNlIGlzICdsaW5ld2lzZSdcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcbiAgICAgICAgQHVwZGF0ZUN1cnNvcnNWaXNpYmlsaXR5KClcbiAgICAgIGVsc2VcbiAgICAgICAgQGFjdGl2YXRlKCd2aXN1YWwnLCB3aXNlKVxuICAgIGVsc2VcbiAgICAgIEBhY3RpdmF0ZSgnbm9ybWFsJykgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcblxuICBzYXZlUHJvcGVydGllczogKGV2ZW50KSAtPlxuICAgIHJldHVybiB1bmxlc3MgQGlzSW50ZXJlc3RpbmdFdmVudChldmVudClcbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBzd3JhcChzZWxlY3Rpb24pLnNhdmVQcm9wZXJ0aWVzKClcblxuICBvYnNlcnZlU2VsZWN0aW9uczogLT5cbiAgICBjaGVja1NlbGVjdGlvbiA9IEBjaGVja1NlbGVjdGlvbi5iaW5kKHRoaXMpXG4gICAgQGVkaXRvckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGNoZWNrU2VsZWN0aW9uKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQGVkaXRvckVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGNoZWNrU2VsZWN0aW9uKVxuXG4gICAgIyBbRklYTUVdXG4gICAgIyBIb3ZlciBwb3NpdGlvbiBnZXQgd2lyZWQgd2hlbiBmb2N1cy1jaGFuZ2UgYmV0d2VlbiBtb3JlIHRoYW4gdHdvIHBhbmUuXG4gICAgIyBjb21tZW50aW5nIG91dCBpcyBmYXIgYmV0dGVyIHRoYW4gaW50cm9kdWNpbmcgQnVnZ3kgYmVoYXZpb3IuXG4gICAgIyBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5vbldpbGxEaXNwYXRjaChzYXZlUHJvcGVydGllcylcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5vbkRpZERpc3BhdGNoKGNoZWNrU2VsZWN0aW9uKVxuXG4gICMgV2hhdCdzIHRoaXM/XG4gICMgZWRpdG9yLmNsZWFyU2VsZWN0aW9ucygpIGRvZXNuJ3QgcmVzcGVjdCBsYXN0Q3Vyc29yIHBvc2l0b2luLlxuICAjIFRoaXMgbWV0aG9kIHdvcmtzIGluIHNhbWUgd2F5IGFzIGVkaXRvci5jbGVhclNlbGVjdGlvbnMoKSBidXQgcmVzcGVjdCBsYXN0IGN1cnNvciBwb3NpdGlvbi5cbiAgY2xlYXJTZWxlY3Rpb25zOiAtPlxuICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuXG4gIHJlc2V0Tm9ybWFsTW9kZTogKHt1c2VySW52b2NhdGlvbn09e30pIC0+XG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmNsZWFyU2VsZWN0aW9ucyhAZWRpdG9yKVxuXG4gICAgaWYgdXNlckludm9jYXRpb24gPyBmYWxzZVxuICAgICAgc3dpdGNoXG4gICAgICAgIHdoZW4gQGVkaXRvci5oYXNNdWx0aXBsZUN1cnNvcnMoKVxuICAgICAgICAgIEBjbGVhclNlbGVjdGlvbnMoKVxuICAgICAgICB3aGVuIEBoYXNQZXJzaXN0ZW50U2VsZWN0aW9ucygpIGFuZCBAZ2V0Q29uZmlnKCdjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25PblJlc2V0Tm9ybWFsTW9kZScpXG4gICAgICAgICAgQGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbnMoKVxuICAgICAgICB3aGVuIEBvY2N1cnJlbmNlTWFuYWdlci5oYXNQYXR0ZXJucygpXG4gICAgICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKVxuXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdjbGVhckhpZ2hsaWdodFNlYXJjaE9uUmVzZXROb3JtYWxNb2RlJylcbiAgICAgICAgQGdsb2JhbFN0YXRlLnNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIG51bGwpXG4gICAgZWxzZVxuICAgICAgQGNsZWFyU2VsZWN0aW9ucygpXG4gICAgQGFjdGl2YXRlKCdub3JtYWwnKVxuXG4gIGluaXQ6IC0+XG4gICAgQHNhdmVPcmlnaW5hbEN1cnNvclBvc2l0aW9uKClcblxuICByZXNldDogLT5cbiAgICBAcmVnaXN0ZXIucmVzZXQoKVxuICAgIEBzZWFyY2hIaXN0b3J5LnJlc2V0KClcbiAgICBAaG92ZXIucmVzZXQoKVxuICAgIEBvcGVyYXRpb25TdGFjay5yZXNldCgpXG4gICAgQG11dGF0aW9uTWFuYWdlci5yZXNldCgpXG5cbiAgaXNWaXNpYmxlOiAtPlxuICAgIEBlZGl0b3IgaW4gZ2V0VmlzaWJsZUVkaXRvcnMoKVxuXG4gIHVwZGF0ZUN1cnNvcnNWaXNpYmlsaXR5OiAtPlxuICAgIEBjdXJzb3JTdHlsZU1hbmFnZXIucmVmcmVzaCgpXG5cbiAgIyBGSVhNRTogbmFtaW5nLCB1cGRhdGVMYXN0U2VsZWN0ZWRJbmZvID9cbiAgdXBkYXRlUHJldmlvdXNTZWxlY3Rpb246IC0+XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICBwcm9wZXJ0aWVzID0gQGdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKT8uZ2V0UHJvcGVydGllcygpXG4gICAgZWxzZVxuICAgICAgcHJvcGVydGllcyA9IHN3cmFwKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKS5nZXRQcm9wZXJ0aWVzKClcblxuICAgICMgVE9ETyM3MDQgd2hlbiBjdXJzb3IgaXMgYWRkZWQgaW4gdmlzdWFsLW1vZGUsIGNvcnJlc3BvbmRpbmcgc2VsZWN0aW9uIHByb3AgeWV0IG5vdCBleGlzdHMuXG4gICAgcmV0dXJuIHVubGVzcyBwcm9wZXJ0aWVzXG5cbiAgICB7aGVhZCwgdGFpbH0gPSBwcm9wZXJ0aWVzXG5cbiAgICBpZiBoZWFkLmlzR3JlYXRlclRoYW5PckVxdWFsKHRhaWwpXG4gICAgICBbc3RhcnQsIGVuZF0gPSBbdGFpbCwgaGVhZF1cbiAgICAgIGhlYWQgPSBlbmQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgZW5kLCAnZm9yd2FyZCcpXG4gICAgZWxzZVxuICAgICAgW3N0YXJ0LCBlbmRdID0gW2hlYWQsIHRhaWxdXG4gICAgICB0YWlsID0gZW5kID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBlZGl0b3IsIGVuZCwgJ2ZvcndhcmQnKVxuXG4gICAgQG1hcmsuc2V0UmFuZ2UoJzwnLCAnPicsIFtzdGFydCwgZW5kXSlcbiAgICBAcHJldmlvdXNTZWxlY3Rpb24gPSB7cHJvcGVydGllczoge2hlYWQsIHRhaWx9LCBAc3VibW9kZX1cblxuICAjIFBlcnNpc3RlbnQgc2VsZWN0aW9uXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoYXNQZXJzaXN0ZW50U2VsZWN0aW9uczogLT5cbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5oYXNNYXJrZXJzKClcblxuICBnZXRQZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2VzOiAtPlxuICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckJ1ZmZlclJhbmdlcygpXG5cbiAgY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uczogLT5cbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5jbGVhck1hcmtlcnMoKVxuXG4gICMgQW5pbWF0aW9uIG1hbmFnZW1lbnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNjcm9sbEFuaW1hdGlvbkVmZmVjdDogbnVsbFxuICByZXF1ZXN0U2Nyb2xsQW5pbWF0aW9uOiAoZnJvbSwgdG8sIG9wdGlvbnMpIC0+XG4gICAgQHNjcm9sbEFuaW1hdGlvbkVmZmVjdCA9IGpRdWVyeShmcm9tKS5hbmltYXRlKHRvLCBvcHRpb25zKVxuXG4gIGZpbmlzaFNjcm9sbEFuaW1hdGlvbjogLT5cbiAgICBAc2Nyb2xsQW5pbWF0aW9uRWZmZWN0Py5maW5pc2goKVxuICAgIEBzY3JvbGxBbmltYXRpb25FZmZlY3QgPSBudWxsXG5cbiAgIyBPdGhlclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2F2ZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb246IC0+XG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb24gPSBudWxsXG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlcj8uZGVzdHJveSgpXG5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgc2VsZWN0aW9uID0gQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKClcbiAgICAgIHBvaW50ID0gc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknLCAnc2VsZWN0aW9uJ10pXG4gICAgZWxzZVxuICAgICAgcG9pbnQgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbiA9IHBvaW50XG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlciA9IEBlZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKHBvaW50LCBpbnZhbGlkYXRlOiAnbmV2ZXInKVxuXG4gIHJlc3RvcmVPcmlnaW5hbEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oQGdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKSlcblxuICBnZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uXG5cbiAgZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyOiAtPlxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXIuZ2V0U3RhcnRCdWZmZXJQb3NpdGlvbigpXG4iXX0=
