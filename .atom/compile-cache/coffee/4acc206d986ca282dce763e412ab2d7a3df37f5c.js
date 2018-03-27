(function() {
  var BlockwiseSelection, CompositeDisposable, CursorStyleManager, Delegato, Disposable, Emitter, FlashManager, HighlightSearchManager, HoverManager, MarkManager, ModeManager, MutationManager, OccurrenceManager, OperationStack, PersistentSelectionManager, Range, RegisterManager, SearchHistoryManager, SearchInput, VimState, _, getVisibleEditors, haveSomeNonEmptySelection, jQuery, matchScopes, packageScope, ref, ref1, semver, settings, swrap, translatePointAndClip,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  semver = require('semver');

  Delegato = require('delegato');

  jQuery = require('atom-space-pen-views').jQuery;

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable, Range = ref.Range;

  settings = require('./settings');

  HoverManager = require('./hover-manager');

  SearchInput = require('./search-input');

  ref1 = require('./utils'), getVisibleEditors = ref1.getVisibleEditors, matchScopes = ref1.matchScopes, translatePointAndClip = ref1.translatePointAndClip, haveSomeNonEmptySelection = ref1.haveSomeNonEmptySelection;

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
      this.searchInput = new SearchInput(this);
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

    VimState.prototype.checkSelection = function(event) {
      var $selection, i, len, ref2, ref3, wise;
      if (atom.workspace.getActiveTextEditor() !== this.editor) {
        return;
      }
      if (this.operationStack.isProcessing()) {
        return;
      }
      if (this.mode === 'insert') {
        return;
      }
      if (this.editorElement !== ((ref2 = event.target) != null ? typeof ref2.closest === "function" ? ref2.closest('atom-text-editor') : void 0 : void 0)) {
        return;
      }
      if (event.type.startsWith('vim-mode-plus')) {
        return;
      }
      if (haveSomeNonEmptySelection(this.editor)) {
        this.editorElement.component.updateSync();
        wise = swrap.detectWise(this.editor);
        if (this.isMode('visual', wise)) {
          ref3 = swrap.getSelections(this.editor);
          for (i = 0, len = ref3.length; i < len; i++) {
            $selection = ref3[i];
            $selection.saveProperties();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3ZpbS1zdGF0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDRjQUFBO0lBQUE7OztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDVCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0VBQ1YsU0FBVSxPQUFBLENBQVEsc0JBQVI7O0VBRVgsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUFvRCxPQUFBLENBQVEsTUFBUixDQUFwRCxFQUFDLHFCQUFELEVBQVUsMkJBQVYsRUFBc0IsNkNBQXRCLEVBQTJDOztFQUUzQyxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUjs7RUFDZixXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLE9BQXFGLE9BQUEsQ0FBUSxTQUFSLENBQXJGLEVBQUMsMENBQUQsRUFBb0IsOEJBQXBCLEVBQWlDLGtEQUFqQyxFQUF3RDs7RUFDeEQsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFFUixjQUFBLEdBQWlCLE9BQUEsQ0FBUSxtQkFBUjs7RUFDakIsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSOztFQUNsQixvQkFBQSxHQUF1QixPQUFBLENBQVEsMEJBQVI7O0VBQ3ZCLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx3QkFBUjs7RUFDckIsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHVCQUFSOztFQUNyQixpQkFBQSxHQUFvQixPQUFBLENBQVEsc0JBQVI7O0VBQ3BCLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSw0QkFBUjs7RUFDekIsZUFBQSxHQUFrQixPQUFBLENBQVEs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QixVQUFBO01BQUEsSUFBQyxDQUFBLHNCQUFELEdBQTBCOztZQUNLLENBQUUsT0FBakMsQ0FBQTs7TUFFQSxJQUFHLElBQUMsQ0FBQSxJQUFELEtBQVMsUUFBWjtRQUNFLFNBQUEsR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUE7UUFDWixLQUFBLEdBQVEsS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxvQkFBakIsQ0FBc0MsTUFBdEMsRUFBOEM7VUFBQSxJQUFBLEVBQU0sQ0FBQyxVQUFELEVBQWEsV0FBYixDQUFOO1NBQTlDLEVBRlY7T0FBQSxNQUFBO1FBSUUsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxFQUpWOztNQUtBLElBQUMsQ0FBQSxzQkFBRCxHQUEwQjthQUMxQixJQUFDLENBQUEsOEJBQUQsR0FBa0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUEyQixLQUEzQixFQUFrQztRQUFBLFVBQUEsRUFBWSxPQUFaO09BQWxDO0lBVlI7O3VCQVk1Qiw2QkFBQSxHQUErQixTQUFBO2FBQzdCLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsSUFBQyxDQUFBLHlCQUFELENBQUEsQ0FBaEM7SUFENkI7O3VCQUcvQix5QkFBQSxHQUEyQixTQUFBO2FBQ3pCLElBQUMsQ0FBQTtJQUR3Qjs7dUJBRzNCLGlDQUFBLEdBQW1DLFNBQUE7YUFDakMsSUFBQyxDQUFBLDhCQUE4QixDQUFDLHNCQUFoQyxDQUFBO0lBRGlDOzs7OztBQXBXckMiLCJzb3VyY2VzQ29udGVudCI6WyJzZW12ZXIgPSByZXF1aXJlICdzZW12ZXInXG5EZWxlZ2F0byA9IHJlcXVpcmUgJ2RlbGVnYXRvJ1xue2pRdWVyeX0gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntFbWl0dGVyLCBEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5Ib3Zlck1hbmFnZXIgPSByZXF1aXJlICcuL2hvdmVyLW1hbmFnZXInXG5TZWFyY2hJbnB1dCA9IHJlcXVpcmUgJy4vc2VhcmNoLWlucHV0J1xue2dldFZpc2libGVFZGl0b3JzLCBtYXRjaFNjb3BlcywgdHJhbnNsYXRlUG9pbnRBbmRDbGlwLCBoYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9ufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5cbk9wZXJhdGlvblN0YWNrID0gcmVxdWlyZSAnLi9vcGVyYXRpb24tc3RhY2snXG5NYXJrTWFuYWdlciA9IHJlcXVpcmUgJy4vbWFyay1tYW5hZ2VyJ1xuTW9kZU1hbmFnZXIgPSByZXF1aXJlICcuL21vZGUtbWFuYWdlcidcblJlZ2lzdGVyTWFuYWdlciA9IHJlcXVpcmUgJy4vcmVnaXN0ZXItbWFuYWdlcidcblNlYXJjaEhpc3RvcnlNYW5hZ2VyID0gcmVxdWlyZSAnLi9zZWFyY2gtaGlzdG9yeS1tYW5hZ2VyJ1xuQ3Vyc29yU3R5bGVNYW5hZ2VyID0gcmVxdWlyZSAnLi9jdXJzb3Itc3R5bGUtbWFuYWdlcidcbkJsb2Nrd2lzZVNlbGVjdGlvbiA9IHJlcXVpcmUgJy4vYmxvY2t3aXNlLXNlbGVjdGlvbidcbk9jY3VycmVuY2VNYW5hZ2VyID0gcmVxdWlyZSAnLi9vY2N1cnJlbmNlLW1hbmFnZXInXG5IaWdobGlnaHRTZWFyY2hNYW5hZ2VyID0gcmVxdWlyZSAnLi9oaWdobGlnaHQtc2VhcmNoLW1hbmFnZXInXG5NdXRhdGlvbk1hbmFnZXIgPSByZXF1aXJlICcuL211dGF0aW9uLW1hbmFnZXInXG5QZXJzaXN0ZW50U2VsZWN0aW9uTWFuYWdlciA9IHJlcXVpcmUgJy4vcGVyc2lzdGVudC1zZWxlY3Rpb24tbWFuYWdlcidcbkZsYXNoTWFuYWdlciA9IHJlcXVpcmUgJy4vZmxhc2gtbWFuYWdlcidcblxucGFja2FnZVNjb3BlID0gJ3ZpbS1tb2RlLXBsdXMnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFZpbVN0YXRlXG4gIEB2aW1TdGF0ZXNCeUVkaXRvcjogbmV3IE1hcFxuXG4gIEBnZXRCeUVkaXRvcjogKGVkaXRvcikgLT5cbiAgICBAdmltU3RhdGVzQnlFZGl0b3IuZ2V0KGVkaXRvcilcblxuICBAZm9yRWFjaDogKGZuKSAtPlxuICAgIEB2aW1TdGF0ZXNCeUVkaXRvci5mb3JFYWNoKGZuKVxuXG4gIEBjbGVhcjogLT5cbiAgICBAdmltU3RhdGVzQnlFZGl0b3IuY2xlYXIoKVxuXG4gIERlbGVnYXRvLmluY2x1ZGVJbnRvKHRoaXMpXG5cbiAgQGRlbGVnYXRlc1Byb3BlcnR5KCdtb2RlJywgJ3N1Ym1vZGUnLCB0b1Byb3BlcnR5OiAnbW9kZU1hbmFnZXInKVxuICBAZGVsZWdhdGVzTWV0aG9kcygnaXNNb2RlJywgJ2FjdGl2YXRlJywgdG9Qcm9wZXJ0eTogJ21vZGVNYW5hZ2VyJylcbiAgQGRlbGVnYXRlc01ldGhvZHMoJ2ZsYXNoJywgJ2ZsYXNoU2NyZWVuUmFuZ2UnLCB0b1Byb3BlcnR5OiAnZmxhc2hNYW5hZ2VyJylcbiAgQGRlbGVnYXRlc01ldGhvZHMoJ3N1YnNjcmliZScsICdnZXRDb3VudCcsICdzZXRDb3VudCcsICdoYXNDb3VudCcsICdhZGRUb0NsYXNzTGlzdCcsIHRvUHJvcGVydHk6ICdvcGVyYXRpb25TdGFjaycpXG5cbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBAc3RhdHVzQmFyTWFuYWdlciwgQGdsb2JhbFN0YXRlKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50ID0gQGVkaXRvci5lbGVtZW50XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAbW9kZU1hbmFnZXIgPSBuZXcgTW9kZU1hbmFnZXIodGhpcylcbiAgICBAbWFyayA9IG5ldyBNYXJrTWFuYWdlcih0aGlzKVxuICAgIEByZWdpc3RlciA9IG5ldyBSZWdpc3Rlck1hbmFnZXIodGhpcylcbiAgICBAaG92ZXIgPSBuZXcgSG92ZXJNYW5hZ2VyKHRoaXMpXG4gICAgQGhvdmVyU2VhcmNoQ291bnRlciA9IG5ldyBIb3Zlck1hbmFnZXIodGhpcylcbiAgICBAc2VhcmNoSGlzdG9yeSA9IG5ldyBTZWFyY2hIaXN0b3J5TWFuYWdlcih0aGlzKVxuICAgIEBoaWdobGlnaHRTZWFyY2ggPSBuZXcgSGlnaGxpZ2h0U2VhcmNoTWFuYWdlcih0aGlzKVxuICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uID0gbmV3IFBlcnNpc3RlbnRTZWxlY3Rpb25NYW5hZ2VyKHRoaXMpXG4gICAgQG9jY3VycmVuY2VNYW5hZ2VyID0gbmV3IE9jY3VycmVuY2VNYW5hZ2VyKHRoaXMpXG4gICAgQG11dGF0aW9uTWFuYWdlciA9IG5ldyBNdXRhdGlvbk1hbmFnZXIodGhpcylcbiAgICBAZmxhc2hNYW5hZ2VyID0gbmV3IEZsYXNoTWFuYWdlcih0aGlzKVxuICAgIEBzZWFyY2hJbnB1dCA9IG5ldyBTZWFyY2hJbnB1dCh0aGlzKVxuICAgIEBvcGVyYXRpb25TdGFjayA9IG5ldyBPcGVyYXRpb25TdGFjayh0aGlzKVxuICAgIEBjdXJzb3JTdHlsZU1hbmFnZXIgPSBuZXcgQ3Vyc29yU3R5bGVNYW5hZ2VyKHRoaXMpXG4gICAgQGJsb2Nrd2lzZVNlbGVjdGlvbnMgPSBbXVxuICAgIEBwcmV2aW91c1NlbGVjdGlvbiA9IHt9XG4gICAgQG9ic2VydmVTZWxlY3Rpb25zKClcblxuICAgIHJlZnJlc2hIaWdobGlnaHRTZWFyY2ggPSA9PlxuICAgICAgQGhpZ2hsaWdodFNlYXJjaC5yZWZyZXNoKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZFN0b3BDaGFuZ2luZyhyZWZyZXNoSGlnaGxpZ2h0U2VhcmNoKVxuXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChwYWNrYWdlU2NvcGUpXG4gICAgaWYgQGdldENvbmZpZygnc3RhcnRJbkluc2VydE1vZGUnKSBvciBtYXRjaFNjb3BlcyhAZWRpdG9yRWxlbWVudCwgQGdldENvbmZpZygnc3RhcnRJbkluc2VydE1vZGVTY29wZXMnKSlcbiAgICAgIEBhY3RpdmF0ZSgnaW5zZXJ0JylcbiAgICBlbHNlXG4gICAgICBAYWN0aXZhdGUoJ25vcm1hbCcpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcbiAgICBAY29uc3RydWN0b3IudmltU3RhdGVzQnlFZGl0b3Iuc2V0KEBlZGl0b3IsIHRoaXMpXG5cbiAgZ2V0Q29uZmlnOiAocGFyYW0pIC0+XG4gICAgc2V0dGluZ3MuZ2V0KHBhcmFtKVxuXG4gICMgQmxvY2t3aXNlU2VsZWN0aW9uc1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0QmxvY2t3aXNlU2VsZWN0aW9uczogLT5cbiAgICBCbG9ja3dpc2VTZWxlY3Rpb24uZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuXG4gIGdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb246IC0+XG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmdldExhc3RTZWxlY3Rpb24oQGVkaXRvcilcblxuICBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb246IC0+XG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbihAZWRpdG9yKVxuXG4gIGNsZWFyQmxvY2t3aXNlU2VsZWN0aW9uczogLT5cbiAgICBCbG9ja3dpc2VTZWxlY3Rpb24uY2xlYXJTZWxlY3Rpb25zKEBlZGl0b3IpXG5cbiAgIyBPdGhlclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdG9nZ2xlQ2xhc3NMaXN0OiAoY2xhc3NOYW1lLCBib29sPXVuZGVmaW5lZCkgLT5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKGNsYXNzTmFtZSwgYm9vbClcblxuICAjIEZJWE1FOiBJIHdhbnQgdG8gcmVtb3ZlIHRoaXMgZGVuZ2VyaW91cyBhcHByb2FjaCwgYnV0IEkgY291bGRuJ3QgZmluZCB0aGUgYmV0dGVyIHdheS5cbiAgc3dhcENsYXNzTmFtZTogKGNsYXNzTmFtZXMuLi4pIC0+XG4gICAgb2xkTW9kZSA9IEBtb2RlXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKG9sZE1vZGUgKyBcIi1tb2RlXCIpXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgndmltLW1vZGUtcGx1cycpXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWVzLi4uKVxuXG4gICAgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lcy4uLilcbiAgICAgIGlmIEBtb2RlIGlzIG9sZE1vZGVcbiAgICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChvbGRNb2RlICsgXCItbW9kZVwiKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgndmltLW1vZGUtcGx1cycpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1mb2N1c2VkJylcblxuICAjIEFsbCBzdWJzY3JpcHRpb25zIGhlcmUgaXMgY2VsYXJlZCBvbiBlYWNoIG9wZXJhdGlvbiBmaW5pc2hlZC5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG9uRGlkQ2hhbmdlU2VhcmNoOiAoZm4pIC0+IEBzdWJzY3JpYmUgQHNlYXJjaElucHV0Lm9uRGlkQ2hhbmdlKGZuKVxuICBvbkRpZENvbmZpcm1TZWFyY2g6IChmbikgLT4gQHN1YnNjcmliZSBAc2VhcmNoSW5wdXQub25EaWRDb25maXJtKGZuKVxuICBvbkRpZENhbmNlbFNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENhbmNlbChmbilcbiAgb25EaWRDb21tYW5kU2VhcmNoOiAoZm4pIC0+IEBzdWJzY3JpYmUgQHNlYXJjaElucHV0Lm9uRGlkQ29tbWFuZChmbilcblxuICAjIFNlbGVjdCBhbmQgdGV4dCBtdXRhdGlvbihDaGFuZ2UpXG4gIG9uRGlkU2V0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1zZXQtdGFyZ2V0JywgZm4pXG4gIGVtaXREaWRTZXRUYXJnZXQ6IChvcGVyYXRvcikgLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXNldC10YXJnZXQnLCBvcGVyYXRvcilcblxuICBvbldpbGxTZWxlY3RUYXJnZXQ6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignd2lsbC1zZWxlY3QtdGFyZ2V0JywgZm4pXG4gIGVtaXRXaWxsU2VsZWN0VGFyZ2V0OiAtPiBAZW1pdHRlci5lbWl0KCd3aWxsLXNlbGVjdC10YXJnZXQnKVxuXG4gIG9uRGlkU2VsZWN0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1zZWxlY3QtdGFyZ2V0JywgZm4pXG4gIGVtaXREaWRTZWxlY3RUYXJnZXQ6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZWxlY3QtdGFyZ2V0JylcblxuICBvbkRpZEZhaWxTZWxlY3RUYXJnZXQ6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLWZhaWwtc2VsZWN0LXRhcmdldCcsIGZuKVxuICBlbWl0RGlkRmFpbFNlbGVjdFRhcmdldDogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLWZhaWwtc2VsZWN0LXRhcmdldCcpXG5cbiAgb25XaWxsRmluaXNoTXV0YXRpb246IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignb24td2lsbC1maW5pc2gtbXV0YXRpb24nLCBmbilcbiAgZW1pdFdpbGxGaW5pc2hNdXRhdGlvbjogLT4gQGVtaXR0ZXIuZW1pdCgnb24td2lsbC1maW5pc2gtbXV0YXRpb24nKVxuXG4gIG9uRGlkRmluaXNoTXV0YXRpb246IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignb24tZGlkLWZpbmlzaC1tdXRhdGlvbicsIGZuKVxuICBlbWl0RGlkRmluaXNoTXV0YXRpb246IC0+IEBlbWl0dGVyLmVtaXQoJ29uLWRpZC1maW5pc2gtbXV0YXRpb24nKVxuXG4gIG9uRGlkU2V0T3BlcmF0b3JNb2RpZmllcjogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtc2V0LW9wZXJhdG9yLW1vZGlmaWVyJywgZm4pXG4gIGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyOiAob3B0aW9ucykgLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXNldC1vcGVyYXRvci1tb2RpZmllcicsIG9wdGlvbnMpXG5cbiAgb25EaWRGaW5pc2hPcGVyYXRpb246IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLWZpbmlzaC1vcGVyYXRpb24nLCBmbilcbiAgZW1pdERpZEZpbmlzaE9wZXJhdGlvbjogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLWZpbmlzaC1vcGVyYXRpb24nKVxuXG4gIG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjazogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtcmVzZXQtb3BlcmF0aW9uLXN0YWNrJywgZm4pXG4gIGVtaXREaWRSZXNldE9wZXJhdGlvblN0YWNrOiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtcmVzZXQtb3BlcmF0aW9uLXN0YWNrJylcblxuICAjIFNlbGVjdCBsaXN0IHZpZXdcbiAgb25EaWRDb25maXJtU2VsZWN0TGlzdDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtY29uZmlybS1zZWxlY3QtbGlzdCcsIGZuKVxuICBvbkRpZENhbmNlbFNlbGVjdExpc3Q6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLWNhbmNlbC1zZWxlY3QtbGlzdCcsIGZuKVxuXG4gICMgUHJveHlpbmcgbW9kZU1hbmdlcidzIGV2ZW50IGhvb2sgd2l0aCBzaG9ydC1saWZlIHN1YnNjcmlwdGlvbi5cbiAgb25XaWxsQWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLm9uV2lsbEFjdGl2YXRlTW9kZShmbilcbiAgb25EaWRBY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIub25EaWRBY3RpdmF0ZU1vZGUoZm4pXG4gIG9uV2lsbERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLm9uV2lsbERlYWN0aXZhdGVNb2RlKGZuKVxuICBwcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLnByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGUoZm4pXG4gIG9uRGlkRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIub25EaWREZWFjdGl2YXRlTW9kZShmbilcblxuICAjIEV2ZW50c1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb25EaWRGYWlsVG9QdXNoVG9PcGVyYXRpb25TdGFjazogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWZhaWwtdG8tcHVzaC10by1vcGVyYXRpb24tc3RhY2snLCBmbilcbiAgZW1pdERpZEZhaWxUb1B1c2hUb09wZXJhdGlvblN0YWNrOiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtZmFpbC10by1wdXNoLXRvLW9wZXJhdGlvbi1zdGFjaycpXG5cbiAgb25EaWREZXN0cm95OiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtZGVzdHJveScsIGZuKVxuXG4gICMgKiBgZm5gIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdoZW4gbWFyayB3YXMgc2V0LlxuICAjICAgKiBgbmFtZWAgTmFtZSBvZiBtYXJrIHN1Y2ggYXMgJ2EnLlxuICAjICAgKiBgYnVmZmVyUG9zaXRpb25gOiBidWZmZXJQb3NpdGlvbiB3aGVyZSBtYXJrIHdhcyBzZXQuXG4gICMgICAqIGBlZGl0b3JgOiBlZGl0b3Igd2hlcmUgbWFyayB3YXMgc2V0LlxuICAjIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gICNcbiAgIyAgVXNhZ2U6XG4gICMgICBvbkRpZFNldE1hcmsgKHtuYW1lLCBidWZmZXJQb3NpdGlvbn0pIC0+IGRvIHNvbWV0aGluZy4uXG4gIG9uRGlkU2V0TWFyazogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLXNldC1tYXJrJywgZm4pXG5cbiAgb25EaWRTZXRJbnB1dENoYXI6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1zZXQtaW5wdXQtY2hhcicsIGZuKVxuICBlbWl0RGlkU2V0SW5wdXRDaGFyOiAoY2hhcikgLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXNldC1pbnB1dC1jaGFyJywgY2hhcilcblxuICBpc0FsaXZlOiAtPlxuICAgIEBjb25zdHJ1Y3Rvci52aW1TdGF0ZXNCeUVkaXRvci5oYXMoQGVkaXRvcilcblxuICBkZXN0cm95OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGlzQWxpdmUoKVxuICAgIEBjb25zdHJ1Y3Rvci52aW1TdGF0ZXNCeUVkaXRvci5kZWxldGUoQGVkaXRvcilcbiAgICBCbG9ja3dpc2VTZWxlY3Rpb24uY2xlYXJTZWxlY3Rpb25zKEBlZGl0b3IpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICAgIGlmIEBlZGl0b3IuaXNBbGl2ZSgpXG4gICAgICBAcmVzZXROb3JtYWxNb2RlKClcbiAgICAgIEByZXNldCgpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQ/LnNldElucHV0RW5hYmxlZCh0cnVlKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShwYWNrYWdlU2NvcGUsICdub3JtYWwtbW9kZScpXG5cbiAgICBAaG92ZXI/LmRlc3Ryb3k/KClcbiAgICBAaG92ZXJTZWFyY2hDb3VudGVyPy5kZXN0cm95PygpXG4gICAgQHNlYXJjaEhpc3Rvcnk/LmRlc3Ryb3k/KClcbiAgICBAY3Vyc29yU3R5bGVNYW5hZ2VyPy5kZXN0cm95PygpXG4gICAgQHNlYXJjaD8uZGVzdHJveT8oKVxuICAgIEByZWdpc3Rlcj8uZGVzdHJveT9cbiAgICB7XG4gICAgICBAaG92ZXIsIEBob3ZlclNlYXJjaENvdW50ZXIsIEBvcGVyYXRpb25TdGFjayxcbiAgICAgIEBzZWFyY2hIaXN0b3J5LCBAY3Vyc29yU3R5bGVNYW5hZ2VyXG4gICAgICBAc2VhcmNoLCBAbW9kZU1hbmFnZXIsIEByZWdpc3RlclxuICAgICAgQGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBzdWJzY3JpcHRpb25zLFxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyXG4gICAgICBAcHJldmlvdXNTZWxlY3Rpb25cbiAgICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uXG4gICAgfSA9IHt9XG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWRlc3Ryb3knXG5cbiAgY2hlY2tTZWxlY3Rpb246IChldmVudCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSBpcyBAZWRpdG9yXG4gICAgcmV0dXJuIGlmIEBvcGVyYXRpb25TdGFjay5pc1Byb2Nlc3NpbmcoKVxuICAgIHJldHVybiBpZiBAbW9kZSBpcyAnaW5zZXJ0J1xuICAgICMgSW50ZW50aW9uYWxseSB1c2luZyB0YXJnZXQuY2xvc2VzdCgnYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgIyBEb24ndCB1c2UgdGFyZ2V0LmdldE1vZGVsKCkgd2hpY2ggaXMgd29yayBmb3IgQ3VzdG9tRXZlbnQgYnV0IG5vdCB3b3JrIGZvciBtb3VzZSBldmVudC5cbiAgICByZXR1cm4gdW5sZXNzIEBlZGl0b3JFbGVtZW50IGlzIGV2ZW50LnRhcmdldD8uY2xvc2VzdD8oJ2F0b20tdGV4dC1lZGl0b3InKVxuICAgIHJldHVybiBpZiBldmVudC50eXBlLnN0YXJ0c1dpdGgoJ3ZpbS1tb2RlLXBsdXMnKSAjIHRvIG1hdGNoIHZpbS1tb2RlLXBsdXM6IGFuZCB2aW0tbW9kZS1wbHVzLXVzZXI6XG5cbiAgICBpZiBoYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uKEBlZGl0b3IpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQudXBkYXRlU3luYygpXG4gICAgICB3aXNlID0gc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKVxuICAgICAgaWYgQGlzTW9kZSgndmlzdWFsJywgd2lzZSlcbiAgICAgICAgZm9yICRzZWxlY3Rpb24gaW4gc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICBAdXBkYXRlQ3Vyc29yc1Zpc2liaWxpdHkoKVxuICAgICAgZWxzZVxuICAgICAgICBAYWN0aXZhdGUoJ3Zpc3VhbCcsIHdpc2UpXG4gICAgZWxzZVxuICAgICAgQGFjdGl2YXRlKCdub3JtYWwnKSBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuXG4gIG9ic2VydmVTZWxlY3Rpb25zOiAtPlxuICAgIGNoZWNrU2VsZWN0aW9uID0gQGNoZWNrU2VsZWN0aW9uLmJpbmQodGhpcylcbiAgICBAZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgY2hlY2tTZWxlY3Rpb24pXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAZWRpdG9yRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgY2hlY2tTZWxlY3Rpb24pXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5vbkRpZERpc3BhdGNoKGNoZWNrU2VsZWN0aW9uKVxuXG4gICAgQGVkaXRvckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBjaGVja1NlbGVjdGlvbilcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgY2hlY2tTZWxlY3Rpb24pXG5cbiAgIyBXaGF0J3MgdGhpcz9cbiAgIyBlZGl0b3IuY2xlYXJTZWxlY3Rpb25zKCkgZG9lc24ndCByZXNwZWN0IGxhc3RDdXJzb3IgcG9zaXRvaW4uXG4gICMgVGhpcyBtZXRob2Qgd29ya3MgaW4gc2FtZSB3YXkgYXMgZWRpdG9yLmNsZWFyU2VsZWN0aW9ucygpIGJ1dCByZXNwZWN0IGxhc3QgY3Vyc29yIHBvc2l0aW9uLlxuICBjbGVhclNlbGVjdGlvbnM6IC0+XG4gICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgcmVzZXROb3JtYWxNb2RlOiAoe3VzZXJJbnZvY2F0aW9ufT17fSkgLT5cbiAgICBCbG9ja3dpc2VTZWxlY3Rpb24uY2xlYXJTZWxlY3Rpb25zKEBlZGl0b3IpXG5cbiAgICBpZiB1c2VySW52b2NhdGlvbiA/IGZhbHNlXG4gICAgICBzd2l0Y2hcbiAgICAgICAgd2hlbiBAZWRpdG9yLmhhc011bHRpcGxlQ3Vyc29ycygpXG4gICAgICAgICAgQGNsZWFyU2VsZWN0aW9ucygpXG4gICAgICAgIHdoZW4gQGhhc1BlcnNpc3RlbnRTZWxlY3Rpb25zKCkgYW5kIEBnZXRDb25maWcoJ2NsZWFyUGVyc2lzdGVudFNlbGVjdGlvbk9uUmVzZXROb3JtYWxNb2RlJylcbiAgICAgICAgICBAY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9ucygpXG4gICAgICAgIHdoZW4gQG9jY3VycmVuY2VNYW5hZ2VyLmhhc1BhdHRlcm5zKClcbiAgICAgICAgICBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpXG5cbiAgICAgIGlmIEBnZXRDb25maWcoJ2NsZWFySGlnaGxpZ2h0U2VhcmNoT25SZXNldE5vcm1hbE1vZGUnKVxuICAgICAgICBAZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbnVsbClcbiAgICBlbHNlXG4gICAgICBAY2xlYXJTZWxlY3Rpb25zKClcbiAgICBAYWN0aXZhdGUoJ25vcm1hbCcpXG5cbiAgaW5pdDogLT5cbiAgICBAc2F2ZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKVxuXG4gIHJlc2V0OiAtPlxuICAgIEByZWdpc3Rlci5yZXNldCgpXG4gICAgQHNlYXJjaEhpc3RvcnkucmVzZXQoKVxuICAgIEBob3Zlci5yZXNldCgpXG4gICAgQG9wZXJhdGlvblN0YWNrLnJlc2V0KClcbiAgICBAbXV0YXRpb25NYW5hZ2VyLnJlc2V0KClcblxuICBpc1Zpc2libGU6IC0+XG4gICAgQGVkaXRvciBpbiBnZXRWaXNpYmxlRWRpdG9ycygpXG5cbiAgdXBkYXRlQ3Vyc29yc1Zpc2liaWxpdHk6IC0+XG4gICAgQGN1cnNvclN0eWxlTWFuYWdlci5yZWZyZXNoKClcblxuICAjIEZJWE1FOiBuYW1pbmcsIHVwZGF0ZUxhc3RTZWxlY3RlZEluZm8gP1xuICB1cGRhdGVQcmV2aW91c1NlbGVjdGlvbjogLT5cbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgIHByb3BlcnRpZXMgPSBAZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpPy5nZXRQcm9wZXJ0aWVzKClcbiAgICBlbHNlXG4gICAgICBwcm9wZXJ0aWVzID0gc3dyYXAoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpLmdldFByb3BlcnRpZXMoKVxuXG4gICAgIyBUT0RPIzcwNCB3aGVuIGN1cnNvciBpcyBhZGRlZCBpbiB2aXN1YWwtbW9kZSwgY29ycmVzcG9uZGluZyBzZWxlY3Rpb24gcHJvcCB5ZXQgbm90IGV4aXN0cy5cbiAgICByZXR1cm4gdW5sZXNzIHByb3BlcnRpZXNcblxuICAgIHtoZWFkLCB0YWlsfSA9IHByb3BlcnRpZXNcblxuICAgIGlmIGhlYWQuaXNHcmVhdGVyVGhhbk9yRXF1YWwodGFpbClcbiAgICAgIFtzdGFydCwgZW5kXSA9IFt0YWlsLCBoZWFkXVxuICAgICAgaGVhZCA9IGVuZCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBlbmQsICdmb3J3YXJkJylcbiAgICBlbHNlXG4gICAgICBbc3RhcnQsIGVuZF0gPSBbaGVhZCwgdGFpbF1cbiAgICAgIHRhaWwgPSBlbmQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgZW5kLCAnZm9yd2FyZCcpXG5cbiAgICBAbWFyay5zZXQoJzwnLCBzdGFydClcbiAgICBAbWFyay5zZXQoJz4nLCBlbmQpXG4gICAgQHByZXZpb3VzU2VsZWN0aW9uID0ge3Byb3BlcnRpZXM6IHtoZWFkLCB0YWlsfSwgQHN1Ym1vZGV9XG5cbiAgIyBQZXJzaXN0ZW50IHNlbGVjdGlvblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaGFzUGVyc2lzdGVudFNlbGVjdGlvbnM6IC0+XG4gICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24uaGFzTWFya2VycygpXG5cbiAgZ2V0UGVyc2lzdGVudFNlbGVjdGlvbkJ1ZmZlclJhbmdlczogLT5cbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJCdWZmZXJSYW5nZXMoKVxuXG4gIGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbnM6IC0+XG4gICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24uY2xlYXJNYXJrZXJzKClcblxuICAjIEFuaW1hdGlvbiBtYW5hZ2VtZW50XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzY3JvbGxBbmltYXRpb25FZmZlY3Q6IG51bGxcbiAgcmVxdWVzdFNjcm9sbEFuaW1hdGlvbjogKGZyb20sIHRvLCBvcHRpb25zKSAtPlxuICAgIEBzY3JvbGxBbmltYXRpb25FZmZlY3QgPSBqUXVlcnkoZnJvbSkuYW5pbWF0ZSh0bywgb3B0aW9ucylcblxuICBmaW5pc2hTY3JvbGxBbmltYXRpb246IC0+XG4gICAgQHNjcm9sbEFuaW1hdGlvbkVmZmVjdD8uZmluaXNoKClcbiAgICBAc2Nyb2xsQW5pbWF0aW9uRWZmZWN0ID0gbnVsbFxuXG4gICMgT3RoZXJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNhdmVPcmlnaW5hbEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uID0gbnVsbFxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXI/LmRlc3Ryb3koKVxuXG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIHNlbGVjdGlvbiA9IEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpXG4gICAgICBwb2ludCA9IHN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddKVxuICAgIGVsc2VcbiAgICAgIHBvaW50ID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb24gPSBwb2ludFxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXIgPSBAZWRpdG9yLm1hcmtCdWZmZXJQb3NpdGlvbihwb2ludCwgaW52YWxpZGF0ZTogJ25ldmVyJylcblxuICByZXN0b3JlT3JpZ2luYWxDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKEBnZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uKCkpXG5cbiAgZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvblxuXG4gIGdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlcjogLT5cbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyLmdldFN0YXJ0QnVmZmVyUG9zaXRpb24oKVxuIl19
