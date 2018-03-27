(function() {
  var Base, CompositeDisposable, Delegato, Input, OperationAbortedError, _, getBufferRangeForRowRange, getEditorState, getFirstCharacterPositionForBufferRow, getIndentLevelForBufferRow, getVimEofBufferPosition, getVimLastBufferRow, getVimLastScreenRow, getWordBufferRangeAndKindAtBufferPosition, ref, scanEditorInDirection, selectList, swrap, vimStateMethods,
    slice = [].slice,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  Delegato = require('delegato');

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('./utils'), getVimEofBufferPosition = ref.getVimEofBufferPosition, getVimLastBufferRow = ref.getVimLastBufferRow, getVimLastScreenRow = ref.getVimLastScreenRow, getWordBufferRangeAndKindAtBufferPosition = ref.getWordBufferRangeAndKindAtBufferPosition, getFirstCharacterPositionForBufferRow = ref.getFirstCharacterPositionForBufferRow, getBufferRangeForRowRange = ref.getBufferRangeForRowRange, getIndentLevelForBufferRow = ref.getIndentLevelForBufferRow, scanEditorInDirection = ref.scanEditorInDirection;

  swrap = require('./selection-wrapper');

  Input = require('./input');

  selectList = null;

  getEditorState = null;

  OperationAbortedError = require('./errors').OperationAbortedError;

  vimStateMethods = ["onDidChangeSearch", "onDidConfirmSearch", "onDidCancelSearch", "onDidCommandSearch", "onDidSetTarget", "emitDidSetTarget", "onWillSelectTarget", "emitWillSelectTarget", "onDidSelectTarget", "emitDidSelectTarget", "onDidFailSelectTarget", "emitDidFailSelectTarget", "onWillFinishMutation", "emitWillFinishMutation", "onDidFinishMutation", "emitDidFinishMutation", "onDidFinishOperation", "onDidResetOperationStack", "onDidSetOperatorModifier", "onWillActivateMode", "onDidActivateMode", "preemptWillDeactivateMode", "onWillDeactivateMode", "onDidDeactivateMode", "onDidCancelSelectList", "subscribe", "isMode", "getBlockwiseSelections", "getLastBlockwiseSelection", "addToClassList", "getConfig"];

  Base = (function() {
    var registries;

    Delegato.includeInto(Base);

    Base.delegatesMethods.apply(Base, slice.call(vimStateMethods).concat([{
      toProperty: 'vimState'
    }]));

    Base.delegatesProperty('mode', 'submode', {
      toProperty: 'vimState'
    });

    function Base(vimState1, properties) {
      var ref1;
      this.vimState = vimState1;
      if (properties == null) {
        properties = null;
      }
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement, this.globalState = ref1.globalState;
      this.name = this.constructor.name;
      if (properties != null) {
        _.extend(this, properties);
      }
    }

    Base.prototype.initialize = function() {};

    Base.prototype.isComplete = function() {
      var ref1;
      if (this.requireInput && (this.input == null)) {
        return false;
      } else if (this.requireTarget) {
        return (ref1 = this.target) != null ? typeof ref1.isComplete === "function" ? ref1.isComplete() : void 0 : void 0;
      } else {
        return true;
      }
    };

    Base.prototype.requireTarget = false;

    Base.prototype.requireInput = false;

    Base.prototype.recordable = false;

    Base.prototype.repeated = false;

    Base.prototype.target = null;

    Base.prototype.operator = null;

    Base.prototype.isAsTargetExceptSelect = function() {
      return (this.operator != null) && !this.operator["instanceof"]('Select');
    };

    Base.prototype.abort = function() {
      throw new OperationAbortedError('aborted');
    };

    Base.prototype.count = null;

    Base.prototype.defaultCount = 1;

    Base.prototype.getCount = function(offset) {
      var ref1;
      if (offset == null) {
        offset = 0;
      }
      if (this.count == null) {
        this.count = (ref1 = this.vimState.getCount()) != null ? ref1 : this.defaultCount;
      }
      return this.count + offset;
    };

    Base.prototype.resetCount = function() {
      return this.count = null;
    };

    Base.prototype.isDefaultCount = function() {
      return this.count === this.defaultCount;
    };

    Base.prototype.countTimes = function(last, fn) {
      var count, i, isFinal, ref1, results, stop, stopped;
      if (last < 1) {
        return;
      }
      stopped = false;
      stop = function() {
        return stopped = true;
      };
      results = [];
      for (count = i = 1, ref1 = last; 1 <= ref1 ? i <= ref1 : i >= ref1; count = 1 <= ref1 ? ++i : --i) {
        isFinal = count === last;
        fn({
          count: count,
          isFinal: isFinal,
          stop: stop
        });
        if (stopped) {
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Base.prototype.activateMode = function(mode, submode) {
      return this.onDidFinishOperation((function(_this) {
        return function() {
          return _this.vimState.activate(mode, submode);
        };
      })(this));
    };

    Base.prototype.activateModeIfNecessary = function(mode, submode) {
      if (!this.vimState.isMode(mode, submode)) {
        return this.activateMode(mode, submode);
      }
    };

    Base.prototype["new"] = function(name, properties) {
      var klass;
      klass = Base.getClass(name);
      return new klass(this.vimState, properties);
    };

    Base.prototype.newInputUI = function() {
      return new Input(this.vimState);
    };

    Base.prototype.clone = function(vimState) {
      var excludeProperties, key, klass, properties, ref1, value;
      properties = {};
      excludeProperties = ['editor', 'editorElement', 'globalState', 'vimState', 'operator'];
      ref1 = this;
      for (key in ref1) {
        if (!hasProp.call(ref1, key)) continue;
        value = ref1[key];
        if (indexOf.call(excludeProperties, key) < 0) {
          properties[key] = value;
        }
      }
      klass = this.constructor;
      return new klass(vimState, properties);
    };

    Base.prototype.cancelOperation = function() {
      return this.vimState.operationStack.cancel();
    };

    Base.prototype.processOperation = function() {
      return this.vimState.operationStack.process();
    };

    Base.prototype.focusSelectList = function(options) {
      if (options == null) {
        options = {};
      }
      this.onDidCancelSelectList((function(_this) {
        return function() {
          return _this.cancelOperation();
        };
      })(this));
      if (selectList == null) {
        selectList = require('./select-list');
      }
      return selectList.show(this.vimState, options);
    };

    Base.prototype.input = null;

    Base.prototype.focusInput = function(charsMax, hideCursor) {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm((function(_this) {
        return function(input) {
          _this.input = input;
          return _this.processOperation();
        };
      })(this));
      if (charsMax > 1) {
        inputUI.onDidChange((function(_this) {
          return function(input) {
            return _this.vimState.hover.set(input);
          };
        })(this));
      }
      inputUI.onDidCancel(this.cancelOperation.bind(this));
      return inputUI.focus(charsMax, hideCursor);
    };

    Base.prototype.getVimEofBufferPosition = function() {
      return getVimEofBufferPosition(this.editor);
    };

    Base.prototype.getVimLastBufferRow = function() {
      return getVimLastBufferRow(this.editor);
    };

    Base.prototype.getVimLastScreenRow = function() {
      return getVimLastScreenRow(this.editor);
    };

    Base.prototype.getWordBufferRangeAndKindAtBufferPosition = function(point, options) {
      return getWordBufferRangeAndKindAtBufferPosition(this.editor, point, options);
    };

    Base.prototype.getFirstCharacterPositionForBufferRow = function(row) {
      return getFirstCharacterPositionForBufferRow(this.editor, row);
    };

    Base.prototype.getBufferRangeForRowRange = function(rowRange) {
      return getBufferRangeForRowRange(this.editor, rowRange);
    };

    Base.prototype.getIndentLevelForBufferRow = function(row) {
      return getIndentLevelForBufferRow(this.editor, row);
    };

    Base.prototype.scanForward = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return scanEditorInDirection.apply(null, [this.editor, 'forward'].concat(slice.call(args)));
    };

    Base.prototype.scanBackward = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return scanEditorInDirection.apply(null, [this.editor, 'backward'].concat(slice.call(args)));
    };

    Base.prototype["instanceof"] = function(klassName) {
      return this instanceof Base.getClass(klassName);
    };

    Base.prototype.is = function(klassName) {
      return this.constructor === Base.getClass(klassName);
    };

    Base.prototype.isOperator = function() {
      return this["instanceof"]('Operator');
    };

    Base.prototype.isMotion = function() {
      return this["instanceof"]('Motion');
    };

    Base.prototype.isTextObject = function() {
      return this["instanceof"]('TextObject');
    };

    Base.prototype.getCursorBufferPosition = function() {
      if (this.mode === 'visual') {
        return this.getCursorPositionForSelection(this.editor.getLastSelection());
      } else {
        return this.editor.getCursorBufferPosition();
      }
    };

    Base.prototype.getCursorBufferPositions = function() {
      if (this.mode === 'visual') {
        return this.editor.getSelections().map(this.getCursorPositionForSelection.bind(this));
      } else {
        return this.editor.getCursorBufferPositions();
      }
    };

    Base.prototype.getBufferPositionForCursor = function(cursor) {
      if (this.mode === 'visual') {
        return this.getCursorPositionForSelection(cursor.selection);
      } else {
        return cursor.getBufferPosition();
      }
    };

    Base.prototype.getCursorPositionForSelection = function(selection) {
      return swrap(selection).getBufferPositionFor('head', {
        from: ['property', 'selection']
      });
    };

    Base.prototype.toString = function() {
      var str;
      str = this.name;
      if (this.target != null) {
        return str += ", target=" + this.target.name + ", target.wise=" + this.target.wise + " ";
      } else if (this.operator != null) {
        return str += ", wise=" + this.wise + " , operator=" + this.operator.name;
      } else {
        return str;
      }
    };

    Base.init = function(service) {
      var __, klass, ref1;
      getEditorState = service.getEditorState;
      this.subscriptions = new CompositeDisposable();
      ['./operator', './operator-insert', './operator-transform-string', './motion', './motion-search', './text-object', './misc-command'].forEach(require);
      ref1 = this.getRegistries();
      for (__ in ref1) {
        klass = ref1[__];
        if (klass.isCommand()) {
          this.subscriptions.add(klass.registerCommand());
        }
      }
      return this.subscriptions;
    };

    Base.reset = function() {
      var __, klass, ref1, results;
      this.subscriptions.dispose();
      this.subscriptions = new CompositeDisposable();
      ref1 = this.getRegistries();
      results = [];
      for (__ in ref1) {
        klass = ref1[__];
        if (klass.isCommand()) {
          results.push(this.subscriptions.add(klass.registerCommand()));
        }
      }
      return results;
    };

    registries = {
      Base: Base
    };

    Base.extend = function(command1) {
      this.command = command1 != null ? command1 : true;
      if ((this.name in registries) && (!this.suppressWarning)) {
        console.warn("Duplicate constructor " + this.name);
      }
      return registries[this.name] = this;
    };

    Base.getClass = function(name) {
      var klass;
      if ((klass = registries[name]) != null) {
        return klass;
      } else {
        throw new Error("class '" + name + "' not found");
      }
    };

    Base.getRegistries = function() {
      return registries;
    };

    Base.isCommand = function() {
      return this.command;
    };

    Base.commandPrefix = 'vim-mode-plus';

    Base.getCommandName = function() {
      return this.commandPrefix + ':' + _.dasherize(this.name);
    };

    Base.getCommandNameWithoutPrefix = function() {
      return _.dasherize(this.name);
    };

    Base.commandScope = 'atom-text-editor';

    Base.getCommandScope = function() {
      return this.commandScope;
    };

    Base.getDesctiption = function() {
      if (this.hasOwnProperty("description")) {
        return this.description;
      } else {
        return null;
      }
    };

    Base.registerCommand = function() {
      var klass;
      klass = this;
      return atom.commands.add(this.getCommandScope(), this.getCommandName(), function(event) {
        var ref1, vimState;
        vimState = (ref1 = getEditorState(this.getModel())) != null ? ref1 : getEditorState(atom.workspace.getActiveTextEditor());
        if (vimState != null) {
          vimState._event = event;
          vimState.operationStack.run(klass);
        }
        return event.stopPropagation();
      });
    };

    Base.operationKind = null;

    Base.getKindForCommandName = function(command) {
      var name;
      name = _.capitalize(_.camelize(command));
      if (name in registries) {
        return registries[name].operationKind;
      }
    };

    return Base;

  })();

  module.exports = Base;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnV0FBQTtJQUFBOzs7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0VBQ1Ysc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixNQVNJLE9BQUEsQ0FBUSxTQUFSLENBVEosRUFDRSxxREFERixFQUVFLDZDQUZGLEVBR0UsNkNBSEYsRUFJRSx5RkFKRixFQUtFLGlGQUxGLEVBTUUseURBTkYsRUFPRSwyREFQRixFQVFFOztFQUVGLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztFQUNSLFVBQUEsR0FBYTs7RUFDYixjQUFBLEdBQWlCOztFQUNoQix3QkFBeUIsT0FBQSxDQUFRLFVBQVI7O0VBRTFCLGVBQUEsR0FBa0IsQ0FDaEIsbUJBRGdCLEVBRWhCLG9CQUZnQixFQUdoQixtQkFIZ0IsRUFJaEIsb0JBSmdCLEVBT2hCLGdCQVBnQixFQVFoQixrQkFSZ0IsRUFTWixvQkFUWSxFQVVaLHNCQVZZLEVBV1osbUJBWFksRUFZWixxQkFaWSxFQWNaLHVCQWRZLEVBZVoseUJBZlksRUFpQmQsc0JBakJjLEVBa0JkLHdCQWxCYyxFQW1CZCxxQkFuQmMsRUFvQmQsdUJBcEJjLEVBcUJoQixzQkFyQmdCLEVBc0JoQiwwQkF0QmdCLEVBd0JoQiwwQkF4QmdCLEVBMEJoQixvQkExQmdCLEVBMkJoQixtQkEzQmdCLEVBNEJoQiwyQkE1QmdCLEVBNkJoQixzQkE3QmdCLEVBOEJoQixxQkE5QmdCLEVBZ0NoQix1QkFoQ2dCLEVBaUNoQixXQWpDZ0IsRUFrQ2hCLFFBbENnQixFQW1DaEIsd0JBbkNnQixFQW9DaEIsMkJBcENnQixF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QUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBZjtRQUN6QyxJQUFHLGdCQUFIO1VBQ0UsUUFBUSxDQUFDLE1BQVQsR0FBa0I7VUFDbEIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUF4QixDQUE0QixLQUE1QixFQUZGOztlQUdBLEtBQUssQ0FBQyxlQUFOLENBQUE7TUFMdUQsQ0FBekQ7SUFGZ0I7O0lBVWxCLElBQUMsQ0FBQSxhQUFELEdBQWdCOztJQUNoQixJQUFDLENBQUEscUJBQUQsR0FBd0IsU0FBQyxPQUFEO0FBQ3RCLFVBQUE7TUFBQSxJQUFBLEdBQU8sQ0FBQyxDQUFDLFVBQUYsQ0FBYSxDQUFDLENBQUMsUUFBRixDQUFXLE9BQVgsQ0FBYjtNQUNQLElBQUcsSUFBQSxJQUFRLFVBQVg7ZUFDRSxVQUFXLENBQUEsSUFBQSxDQUFLLENBQUMsY0FEbkI7O0lBRnNCOzs7Ozs7RUFLMUIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFsVWpCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbkRlbGVnYXRvID0gcmVxdWlyZSAnZGVsZWdhdG8nXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue1xuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvblxuICBnZXRWaW1MYXN0QnVmZmVyUm93XG4gIGdldFZpbUxhc3RTY3JlZW5Sb3dcbiAgZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvd1xuICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlXG4gIGdldEluZGVudExldmVsRm9yQnVmZmVyUm93XG4gIHNjYW5FZGl0b3JJbkRpcmVjdGlvblxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5JbnB1dCA9IHJlcXVpcmUgJy4vaW5wdXQnXG5zZWxlY3RMaXN0ID0gbnVsbFxuZ2V0RWRpdG9yU3RhdGUgPSBudWxsICMgc2V0IGJ5IEJhc2UuaW5pdCgpXG57T3BlcmF0aW9uQWJvcnRlZEVycm9yfSA9IHJlcXVpcmUgJy4vZXJyb3JzJ1xuXG52aW1TdGF0ZU1ldGhvZHMgPSBbXG4gIFwib25EaWRDaGFuZ2VTZWFyY2hcIlxuICBcIm9uRGlkQ29uZmlybVNlYXJjaFwiXG4gIFwib25EaWRDYW5jZWxTZWFyY2hcIlxuICBcIm9uRGlkQ29tbWFuZFNlYXJjaFwiXG5cbiAgIyBMaWZlIGN5Y2xlXG4gIFwib25EaWRTZXRUYXJnZXRcIlxuICBcImVtaXREaWRTZXRUYXJnZXRcIlxuICAgICAgXCJvbldpbGxTZWxlY3RUYXJnZXRcIlxuICAgICAgXCJlbWl0V2lsbFNlbGVjdFRhcmdldFwiXG4gICAgICBcIm9uRGlkU2VsZWN0VGFyZ2V0XCJcbiAgICAgIFwiZW1pdERpZFNlbGVjdFRhcmdldFwiXG5cbiAgICAgIFwib25EaWRGYWlsU2VsZWN0VGFyZ2V0XCJcbiAgICAgIFwiZW1pdERpZEZhaWxTZWxlY3RUYXJnZXRcIlxuXG4gICAgXCJvbldpbGxGaW5pc2hNdXRhdGlvblwiXG4gICAgXCJlbWl0V2lsbEZpbmlzaE11dGF0aW9uXCJcbiAgICBcIm9uRGlkRmluaXNoTXV0YXRpb25cIlxuICAgIFwiZW1pdERpZEZpbmlzaE11dGF0aW9uXCJcbiAgXCJvbkRpZEZpbmlzaE9wZXJhdGlvblwiXG4gIFwib25EaWRSZXNldE9wZXJhdGlvblN0YWNrXCJcblxuICBcIm9uRGlkU2V0T3BlcmF0b3JNb2RpZmllclwiXG5cbiAgXCJvbldpbGxBY3RpdmF0ZU1vZGVcIlxuICBcIm9uRGlkQWN0aXZhdGVNb2RlXCJcbiAgXCJwcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlXCJcbiAgXCJvbldpbGxEZWFjdGl2YXRlTW9kZVwiXG4gIFwib25EaWREZWFjdGl2YXRlTW9kZVwiXG5cbiAgXCJvbkRpZENhbmNlbFNlbGVjdExpc3RcIlxuICBcInN1YnNjcmliZVwiXG4gIFwiaXNNb2RlXCJcbiAgXCJnZXRCbG9ja3dpc2VTZWxlY3Rpb25zXCJcbiAgXCJnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uXCJcbiAgXCJhZGRUb0NsYXNzTGlzdFwiXG4gIFwiZ2V0Q29uZmlnXCJcbl1cblxuY2xhc3MgQmFzZVxuICBEZWxlZ2F0by5pbmNsdWRlSW50byh0aGlzKVxuICBAZGVsZWdhdGVzTWV0aG9kcyh2aW1TdGF0ZU1ldGhvZHMuLi4sIHRvUHJvcGVydHk6ICd2aW1TdGF0ZScpXG4gIEBkZWxlZ2F0ZXNQcm9wZXJ0eSgnbW9kZScsICdzdWJtb2RlJywgdG9Qcm9wZXJ0eTogJ3ZpbVN0YXRlJylcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSwgcHJvcGVydGllcz1udWxsKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQGdsb2JhbFN0YXRlfSA9IEB2aW1TdGF0ZVxuICAgIEBuYW1lID0gQGNvbnN0cnVjdG9yLm5hbWVcbiAgICBfLmV4dGVuZCh0aGlzLCBwcm9wZXJ0aWVzKSBpZiBwcm9wZXJ0aWVzP1xuXG4gICMgVG8gb3ZlcnJpZGVcbiAgaW5pdGlhbGl6ZTogLT5cblxuICAjIE9wZXJhdGlvbiBwcm9jZXNzb3IgZXhlY3V0ZSBvbmx5IHdoZW4gaXNDb21wbGV0ZSgpIHJldHVybiB0cnVlLlxuICAjIElmIGZhbHNlLCBvcGVyYXRpb24gcHJvY2Vzc29yIHBvc3Rwb25lIGl0cyBleGVjdXRpb24uXG4gIGlzQ29tcGxldGU6IC0+XG4gICAgaWYgQHJlcXVpcmVJbnB1dCBhbmQgbm90IEBpbnB1dD9cbiAgICAgIGZhbHNlXG4gICAgZWxzZSBpZiBAcmVxdWlyZVRhcmdldFxuICAgICAgIyBXaGVuIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGluIEJhc2U6OmNvbnN0cnVjdG9yXG4gICAgICAjIHRhZ2VydCBpcyBzdGlsbCBzdHJpbmcgbGlrZSBgTW92ZVRvUmlnaHRgLCBpbiB0aGlzIGNhc2UgaXNDb21wbGV0ZVxuICAgICAgIyBpcyBub3QgYXZhaWxhYmxlLlxuICAgICAgQHRhcmdldD8uaXNDb21wbGV0ZT8oKVxuICAgIGVsc2VcbiAgICAgIHRydWVcblxuICByZXF1aXJlVGFyZ2V0OiBmYWxzZVxuICByZXF1aXJlSW5wdXQ6IGZhbHNlXG4gIHJlY29yZGFibGU6IGZhbHNlXG4gIHJlcGVhdGVkOiBmYWxzZVxuICB0YXJnZXQ6IG51bGwgIyBTZXQgaW4gT3BlcmF0b3JcbiAgb3BlcmF0b3I6IG51bGwgIyBTZXQgaW4gb3BlcmF0b3IncyB0YXJnZXQoIE1vdGlvbiBvciBUZXh0T2JqZWN0IClcbiAgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdDogLT5cbiAgICBAb3BlcmF0b3I/IGFuZCBub3QgQG9wZXJhdG9yLmluc3RhbmNlb2YoJ1NlbGVjdCcpXG5cbiAgYWJvcnQ6IC0+XG4gICAgdGhyb3cgbmV3IE9wZXJhdGlvbkFib3J0ZWRFcnJvcignYWJvcnRlZCcpXG5cbiAgIyBDb3VudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY291bnQ6IG51bGxcbiAgZGVmYXVsdENvdW50OiAxXG4gIGdldENvdW50OiAob2Zmc2V0PTApIC0+XG4gICAgQGNvdW50ID89IEB2aW1TdGF0ZS5nZXRDb3VudCgpID8gQGRlZmF1bHRDb3VudFxuICAgIEBjb3VudCArIG9mZnNldFxuXG4gIHJlc2V0Q291bnQ6IC0+XG4gICAgQGNvdW50ID0gbnVsbFxuXG4gIGlzRGVmYXVsdENvdW50OiAtPlxuICAgIEBjb3VudCBpcyBAZGVmYXVsdENvdW50XG5cbiAgIyBNaXNjXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb3VudFRpbWVzOiAobGFzdCwgZm4pIC0+XG4gICAgcmV0dXJuIGlmIGxhc3QgPCAxXG5cbiAgICBzdG9wcGVkID0gZmFsc2VcbiAgICBzdG9wID0gLT4gc3RvcHBlZCA9IHRydWVcbiAgICBmb3IgY291bnQgaW4gWzEuLmxhc3RdXG4gICAgICBpc0ZpbmFsID0gY291bnQgaXMgbGFzdFxuICAgICAgZm4oe2NvdW50LCBpc0ZpbmFsLCBzdG9wfSlcbiAgICAgIGJyZWFrIGlmIHN0b3BwZWRcblxuICBhY3RpdmF0ZU1vZGU6IChtb2RlLCBzdWJtb2RlKSAtPlxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgQHZpbVN0YXRlLmFjdGl2YXRlKG1vZGUsIHN1Ym1vZGUpXG5cbiAgYWN0aXZhdGVNb2RlSWZOZWNlc3Nhcnk6IChtb2RlLCBzdWJtb2RlKSAtPlxuICAgIHVubGVzcyBAdmltU3RhdGUuaXNNb2RlKG1vZGUsIHN1Ym1vZGUpXG4gICAgICBAYWN0aXZhdGVNb2RlKG1vZGUsIHN1Ym1vZGUpXG5cbiAgbmV3OiAobmFtZSwgcHJvcGVydGllcykgLT5cbiAgICBrbGFzcyA9IEJhc2UuZ2V0Q2xhc3MobmFtZSlcbiAgICBuZXcga2xhc3MoQHZpbVN0YXRlLCBwcm9wZXJ0aWVzKVxuXG4gIG5ld0lucHV0VUk6IC0+XG4gICAgbmV3IElucHV0KEB2aW1TdGF0ZSlcblxuICAjIEZJWE1FOiBUaGlzIGlzIHVzZWQgdG8gY2xvbmUgTW90aW9uOjpTZWFyY2ggdG8gc3VwcG9ydCBgbmAgYW5kIGBOYFxuICAjIEJ1dCBtYW51YWwgcmVzZXRpbmcgYW5kIG92ZXJyaWRpbmcgcHJvcGVydHkgaXMgYnVnIHByb25lLlxuICAjIFNob3VsZCBleHRyYWN0IGFzIHNlYXJjaCBzcGVjIG9iamVjdCBhbmQgdXNlIGl0IGJ5XG4gICMgY3JlYXRpbmcgY2xlYW4gaW5zdGFuY2Ugb2YgU2VhcmNoLlxuICBjbG9uZTogKHZpbVN0YXRlKSAtPlxuICAgIHByb3BlcnRpZXMgPSB7fVxuICAgIGV4Y2x1ZGVQcm9wZXJ0aWVzID0gWydlZGl0b3InLCAnZWRpdG9yRWxlbWVudCcsICdnbG9iYWxTdGF0ZScsICd2aW1TdGF0ZScsICdvcGVyYXRvciddXG4gICAgZm9yIG93biBrZXksIHZhbHVlIG9mIHRoaXMgd2hlbiBrZXkgbm90IGluIGV4Y2x1ZGVQcm9wZXJ0aWVzXG4gICAgICBwcm9wZXJ0aWVzW2tleV0gPSB2YWx1ZVxuICAgIGtsYXNzID0gdGhpcy5jb25zdHJ1Y3RvclxuICAgIG5ldyBrbGFzcyh2aW1TdGF0ZSwgcHJvcGVydGllcylcblxuICBjYW5jZWxPcGVyYXRpb246IC0+XG4gICAgQHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmNhbmNlbCgpXG5cbiAgcHJvY2Vzc09wZXJhdGlvbjogLT5cbiAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucHJvY2VzcygpXG5cbiAgZm9jdXNTZWxlY3RMaXN0OiAob3B0aW9ucz17fSkgLT5cbiAgICBAb25EaWRDYW5jZWxTZWxlY3RMaXN0ID0+XG4gICAgICBAY2FuY2VsT3BlcmF0aW9uKClcbiAgICBzZWxlY3RMaXN0ID89IHJlcXVpcmUgJy4vc2VsZWN0LWxpc3QnXG4gICAgc2VsZWN0TGlzdC5zaG93KEB2aW1TdGF0ZSwgb3B0aW9ucylcblxuICBpbnB1dDogbnVsbFxuICBmb2N1c0lucHV0OiAoY2hhcnNNYXgsIGhpZGVDdXJzb3IpIC0+XG4gICAgaW5wdXRVSSA9IEBuZXdJbnB1dFVJKClcbiAgICBpbnB1dFVJLm9uRGlkQ29uZmlybSAoaW5wdXQpID0+XG4gICAgICBAaW5wdXQgPSBpbnB1dFxuICAgICAgQHByb2Nlc3NPcGVyYXRpb24oKVxuXG4gICAgaWYgY2hhcnNNYXggPiAxXG4gICAgICBpbnB1dFVJLm9uRGlkQ2hhbmdlIChpbnB1dCkgPT5cbiAgICAgICAgQHZpbVN0YXRlLmhvdmVyLnNldChpbnB1dClcblxuICAgIGlucHV0VUkub25EaWRDYW5jZWwoQGNhbmNlbE9wZXJhdGlvbi5iaW5kKHRoaXMpKVxuICAgIGlucHV0VUkuZm9jdXMoY2hhcnNNYXgsIGhpZGVDdXJzb3IpXG5cbiAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb246IC0+XG4gICAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oQGVkaXRvcilcblxuICBnZXRWaW1MYXN0QnVmZmVyUm93OiAtPlxuICAgIGdldFZpbUxhc3RCdWZmZXJSb3coQGVkaXRvcilcblxuICBnZXRWaW1MYXN0U2NyZWVuUm93OiAtPlxuICAgIGdldFZpbUxhc3RTY3JlZW5Sb3coQGVkaXRvcilcblxuICBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbjogKHBvaW50LCBvcHRpb25zKSAtPlxuICAgIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuXG4gIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3c6IChyb3cpIC0+XG4gICAgZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhAZWRpdG9yLCByb3cpXG5cbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZTogKHJvd1JhbmdlKSAtPlxuICAgIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UoQGVkaXRvciwgcm93UmFuZ2UpXG5cbiAgZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3c6IChyb3cpIC0+XG4gICAgZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coQGVkaXRvciwgcm93KVxuXG4gIHNjYW5Gb3J3YXJkOiAoYXJncy4uLikgLT5cbiAgICBzY2FuRWRpdG9ySW5EaXJlY3Rpb24oQGVkaXRvciwgJ2ZvcndhcmQnLCBhcmdzLi4uKVxuXG4gIHNjYW5CYWNrd2FyZDogKGFyZ3MuLi4pIC0+XG4gICAgc2NhbkVkaXRvckluRGlyZWN0aW9uKEBlZGl0b3IsICdiYWNrd2FyZCcsIGFyZ3MuLi4pXG5cbiAgaW5zdGFuY2VvZjogKGtsYXNzTmFtZSkgLT5cbiAgICB0aGlzIGluc3RhbmNlb2YgQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG5cbiAgaXM6IChrbGFzc05hbWUpIC0+XG4gICAgdGhpcy5jb25zdHJ1Y3RvciBpcyBCYXNlLmdldENsYXNzKGtsYXNzTmFtZSlcblxuICBpc09wZXJhdG9yOiAtPlxuICAgIEBpbnN0YW5jZW9mKCdPcGVyYXRvcicpXG5cbiAgaXNNb3Rpb246IC0+XG4gICAgQGluc3RhbmNlb2YoJ01vdGlvbicpXG5cbiAgaXNUZXh0T2JqZWN0OiAtPlxuICAgIEBpbnN0YW5jZW9mKCdUZXh0T2JqZWN0JylcblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uczogLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkubWFwKEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbi5iaW5kKHRoaXMpKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKClcblxuICBnZXRCdWZmZXJQb3NpdGlvbkZvckN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKGN1cnNvci5zZWxlY3Rpb24pXG4gICAgZWxzZVxuICAgICAgY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXSlcblxuICB0b1N0cmluZzogLT5cbiAgICBzdHIgPSBAbmFtZVxuICAgIGlmIEB0YXJnZXQ/XG4gICAgICBzdHIgKz0gXCIsIHRhcmdldD0je0B0YXJnZXQubmFtZX0sIHRhcmdldC53aXNlPSN7QHRhcmdldC53aXNlfSBcIlxuICAgIGVsc2UgaWYgQG9wZXJhdG9yP1xuICAgICAgc3RyICs9IFwiLCB3aXNlPSN7QHdpc2V9ICwgb3BlcmF0b3I9I3tAb3BlcmF0b3IubmFtZX1cIlxuICAgIGVsc2VcbiAgICAgIHN0clxuXG4gICMgQ2xhc3MgbWV0aG9kc1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQGluaXQ6IChzZXJ2aWNlKSAtPlxuICAgIHtnZXRFZGl0b3JTdGF0ZX0gPSBzZXJ2aWNlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBbXG4gICAgICAnLi9vcGVyYXRvcicsICcuL29wZXJhdG9yLWluc2VydCcsICcuL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcnLFxuICAgICAgJy4vbW90aW9uJywgJy4vbW90aW9uLXNlYXJjaCcsICcuL3RleHQtb2JqZWN0JywgJy4vbWlzYy1jb21tYW5kJ1xuICAgIF0uZm9yRWFjaChyZXF1aXJlKVxuXG4gICAgZm9yIF9fLCBrbGFzcyBvZiBAZ2V0UmVnaXN0cmllcygpIHdoZW4ga2xhc3MuaXNDb21tYW5kKClcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZChrbGFzcy5yZWdpc3RlckNvbW1hbmQoKSlcbiAgICBAc3Vic2NyaXB0aW9uc1xuXG4gICMgRm9yIGRldmVsb3BtZW50IGVhc2luZXNzIHdpdGhvdXQgcmVsb2FkaW5nIHZpbS1tb2RlLXBsdXNcbiAgQHJlc2V0OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIGZvciBfXywga2xhc3Mgb2YgQGdldFJlZ2lzdHJpZXMoKSB3aGVuIGtsYXNzLmlzQ29tbWFuZCgpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQoa2xhc3MucmVnaXN0ZXJDb21tYW5kKCkpXG5cbiAgcmVnaXN0cmllcyA9IHtCYXNlfVxuICBAZXh0ZW5kOiAoQGNvbW1hbmQ9dHJ1ZSkgLT5cbiAgICBpZiAoQG5hbWUgb2YgcmVnaXN0cmllcykgYW5kIChub3QgQHN1cHByZXNzV2FybmluZylcbiAgICAgIGNvbnNvbGUud2FybihcIkR1cGxpY2F0ZSBjb25zdHJ1Y3RvciAje0BuYW1lfVwiKVxuICAgIHJlZ2lzdHJpZXNbQG5hbWVdID0gdGhpc1xuXG4gIEBnZXRDbGFzczogKG5hbWUpIC0+XG4gICAgaWYgKGtsYXNzID0gcmVnaXN0cmllc1tuYW1lXSk/XG4gICAgICBrbGFzc1xuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImNsYXNzICcje25hbWV9JyBub3QgZm91bmRcIilcblxuICBAZ2V0UmVnaXN0cmllczogLT5cbiAgICByZWdpc3RyaWVzXG5cbiAgQGlzQ29tbWFuZDogLT5cbiAgICBAY29tbWFuZFxuXG4gIEBjb21tYW5kUHJlZml4OiAndmltLW1vZGUtcGx1cydcbiAgQGdldENvbW1hbmROYW1lOiAtPlxuICAgIEBjb21tYW5kUHJlZml4ICsgJzonICsgXy5kYXNoZXJpemUoQG5hbWUpXG5cbiAgQGdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeDogLT5cbiAgICBfLmRhc2hlcml6ZShAbmFtZSlcblxuICBAY29tbWFuZFNjb3BlOiAnYXRvbS10ZXh0LWVkaXRvcidcbiAgQGdldENvbW1hbmRTY29wZTogLT5cbiAgICBAY29tbWFuZFNjb3BlXG5cbiAgQGdldERlc2N0aXB0aW9uOiAtPlxuICAgIGlmIEBoYXNPd25Qcm9wZXJ0eShcImRlc2NyaXB0aW9uXCIpXG4gICAgICBAZGVzY3JpcHRpb25cbiAgICBlbHNlXG4gICAgICBudWxsXG5cbiAgQHJlZ2lzdGVyQ29tbWFuZDogLT5cbiAgICBrbGFzcyA9IHRoaXNcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBAZ2V0Q29tbWFuZFNjb3BlKCksIEBnZXRDb21tYW5kTmFtZSgpLCAoZXZlbnQpIC0+XG4gICAgICB2aW1TdGF0ZSA9IGdldEVkaXRvclN0YXRlKEBnZXRNb2RlbCgpKSA/IGdldEVkaXRvclN0YXRlKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICAgIGlmIHZpbVN0YXRlPyAjIFBvc3NpYmx5IHVuZGVmaW5lZCBTZWUgIzg1XG4gICAgICAgIHZpbVN0YXRlLl9ldmVudCA9IGV2ZW50XG4gICAgICAgIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihrbGFzcylcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgIyBGb3IgZGVtby1tb2RlIHBrZyBpbnRlZ3JhdGlvblxuICBAb3BlcmF0aW9uS2luZDogbnVsbFxuICBAZ2V0S2luZEZvckNvbW1hbmROYW1lOiAoY29tbWFuZCkgLT5cbiAgICBuYW1lID0gXy5jYXBpdGFsaXplKF8uY2FtZWxpemUoY29tbWFuZCkpXG4gICAgaWYgbmFtZSBvZiByZWdpc3RyaWVzXG4gICAgICByZWdpc3RyaWVzW25hbWVdLm9wZXJhdGlvbktpbmRcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlXG4iXX0=
