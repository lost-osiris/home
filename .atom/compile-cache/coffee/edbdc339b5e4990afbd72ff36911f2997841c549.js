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

  vimStateMethods = ["assert", "assertWithException", "onDidChangeSearch", "onDidConfirmSearch", "onDidCancelSearch", "onDidCommandSearch", "onDidSetTarget", "emitDidSetTarget", "onWillSelectTarget", "emitWillSelectTarget", "onDidSelectTarget", "emitDidSelectTarget", "onDidFailSelectTarget", "emitDidFailSelectTarget", "onDidRestoreCursorPositions", "emitDidRestoreCursorPositions", "onWillFinishMutation", "emitWillFinishMutation", "onDidFinishMutation", "emitDidFinishMutation", "onDidFinishOperation", "onDidResetOperationStack", "onDidSetOperatorModifier", "onWillActivateMode", "onDidActivateMode", "preemptWillDeactivateMode", "onWillDeactivateMode", "onDidDeactivateMode", "onDidCancelSelectList", "subscribe", "isMode", "getBlockwiseSelections", "getLastBlockwiseSelection", "addToClassList", "getConfig"];

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
      if (properties != null) {
        _.extend(this, properties);
      }
    }

    Base.prototype.initialize = function() {};

    Base.prototype.isComplete = function() {
      var ref1;
      if (this.isRequireInput() && !this.hasInput()) {
        return false;
      } else if (this.isRequireTarget()) {
        return (ref1 = this.getTarget()) != null ? typeof ref1.isComplete === "function" ? ref1.isComplete() : void 0 : void 0;
      } else {
        return true;
      }
    };

    Base.prototype.target = null;

    Base.prototype.hasTarget = function() {
      return this.target != null;
    };

    Base.prototype.getTarget = function() {
      return this.target;
    };

    Base.prototype.requireTarget = false;

    Base.prototype.isRequireTarget = function() {
      return this.requireTarget;
    };

    Base.prototype.requireInput = false;

    Base.prototype.isRequireInput = function() {
      return this.requireInput;
    };

    Base.prototype.recordable = false;

    Base.prototype.isRecordable = function() {
      return this.recordable;
    };

    Base.prototype.repeated = false;

    Base.prototype.isRepeated = function() {
      return this.repeated;
    };

    Base.prototype.setRepeated = function() {
      return this.repeated = true;
    };

    Base.prototype.operator = null;

    Base.prototype.getOperator = function() {
      return this.operator;
    };

    Base.prototype.setOperator = function(operator) {
      this.operator = operator;
      return this.operator;
    };

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

    Base.prototype.hasInput = function() {
      return this.input != null;
    };

    Base.prototype.getInput = function() {
      return this.input;
    };

    Base.prototype.focusInput = function(charsMax) {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm((function(_this) {
        return function(input1) {
          _this.input = input1;
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
      return inputUI.focus(charsMax);
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

    Base.prototype.getName = function() {
      return this.constructor.name;
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
      str = this.getName();
      if (this.hasTarget()) {
        return str += ", target=" + (this.target.getName()) + ", target.wise=" + this.target.wise + " ";
      } else if (this.operator != null) {
        return str += ", wise=" + this.wise + " , operator=" + (this.operator.getName());
      } else {
        return str;
      }
    };

    Base.init = function(service) {
      var __, klass, ref1;
      getEditorState = service.getEditorState;
      this.subscriptions = new CompositeDisposable();
      ['./operator', './operator-insert', './operator-transform-string', './motion', './motion-search', './text-object', './insert-mode', './misc-command'].forEach(require);
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

    Base.extend = function(command) {
      this.command = command != null ? command : true;
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

    return Base;

  })();

  module.exports = Base;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnV0FBQTtJQUFBOzs7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0VBQ1Ysc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixNQVNJLE9BQUEsQ0FBUSxTQUFSLENBVEosRUFDRSxxREFERixFQUVFLDZDQUZGLEVBR0UsNkNBSEYsRUFJRSx5RkFKRixFQUtFLGlGQUxGLEVBTUUseURBTkYsRUFPRSwyREFQRixFQVFFOztFQUVGLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztFQUNSLFVBQUEsR0FBYTs7RUFDYixjQUFBLEdBQWlCOztFQUNoQix3QkFBeUIsT0FBQSxDQUFRLFVBQVI7O0VBRTFCLGVBQUEsR0FBa0IsQ0FDaEIsUUFEZ0IsRUFFaEIscUJBRmdCLEVBR2hCLG1CQUhnQixFQUloQixvQkFKZ0IsRUFLaEIsbUJBTGdCLEVBTWhCLG9CQU5nQixFQVNoQixnQkFUZ0IsRUFVaEIsa0JBVmdCLEVBV1osb0JBWFksRUFZWixzQkFaWSxFQWFaLG1CQWJZLEVBY1oscUJBZFksRUFnQlosdUJBaEJZLEVBaUJaLHlCQWpCWSxFQW1CWiw2QkFuQlksRUFvQlosK0JBcEJZLEVBcUJkLHNCQXJCYyxFQXNCZCx3QkF0QmMsRUF1QmQscUJBdkJjLEVBd0JkLHVCQXhCYyxFQXlCaEIsc0JBekJnQixFQTBCaEIsMEJBMUJnQixFQTRCaEIsMEJBNUJnQixFQThCaEIsb0JBOUJnQixFQStCaEIsbUJBL0JnQixFQWdDaEIsMkJBaENnQixFQWlDaEIsc0JBakNnQixFQWtDaEIscUJBbENnQixFQW9DaEIsdUJBcENnQixFQXFD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ID0gcmVxdWlyZSAnZGVsZWdhdG8nXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue1xuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvblxuICBnZXRWaW1MYXN0QnVmZmVyUm93XG4gIGdldFZpbUxhc3RTY3JlZW5Sb3dcbiAgZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvd1xuICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlXG4gIGdldEluZGVudExldmVsRm9yQnVmZmVyUm93XG4gIHNjYW5FZGl0b3JJbkRpcmVjdGlvblxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5JbnB1dCA9IHJlcXVpcmUgJy4vaW5wdXQnXG5zZWxlY3RMaXN0ID0gbnVsbFxuZ2V0RWRpdG9yU3RhdGUgPSBudWxsICMgc2V0IGJ5IEJhc2UuaW5pdCgpXG57T3BlcmF0aW9uQWJvcnRlZEVycm9yfSA9IHJlcXVpcmUgJy4vZXJyb3JzJ1xuXG52aW1TdGF0ZU1ldGhvZHMgPSBbXG4gIFwiYXNzZXJ0XCJcbiAgXCJhc3NlcnRXaXRoRXhjZXB0aW9uXCJcbiAgXCJvbkRpZENoYW5nZVNlYXJjaFwiXG4gIFwib25EaWRDb25maXJtU2VhcmNoXCJcbiAgXCJvbkRpZENhbmNlbFNlYXJjaFwiXG4gIFwib25EaWRDb21tYW5kU2VhcmNoXCJcblxuICAjIExpZmUgY3ljbGVcbiAgXCJvbkRpZFNldFRhcmdldFwiXG4gIFwiZW1pdERpZFNldFRhcmdldFwiXG4gICAgICBcIm9uV2lsbFNlbGVjdFRhcmdldFwiXG4gICAgICBcImVtaXRXaWxsU2VsZWN0VGFyZ2V0XCJcbiAgICAgIFwib25EaWRTZWxlY3RUYXJnZXRcIlxuICAgICAgXCJlbWl0RGlkU2VsZWN0VGFyZ2V0XCJcblxuICAgICAgXCJvbkRpZEZhaWxTZWxlY3RUYXJnZXRcIlxuICAgICAgXCJlbWl0RGlkRmFpbFNlbGVjdFRhcmdldFwiXG5cbiAgICAgIFwib25EaWRSZXN0b3JlQ3Vyc29yUG9zaXRpb25zXCJcbiAgICAgIFwiZW1pdERpZFJlc3RvcmVDdXJzb3JQb3NpdGlvbnNcIlxuICAgIFwib25XaWxsRmluaXNoTXV0YXRpb25cIlxuICAgIFwiZW1pdFdpbGxGaW5pc2hNdXRhdGlvblwiXG4gICAgXCJvbkRpZEZpbmlzaE11dGF0aW9uXCJcbiAgICBcImVtaXREaWRGaW5pc2hNdXRhdGlvblwiXG4gIFwib25EaWRGaW5pc2hPcGVyYXRpb25cIlxuICBcIm9uRGlkUmVzZXRPcGVyYXRpb25TdGFja1wiXG5cbiAgXCJvbkRpZFNldE9wZXJhdG9yTW9kaWZpZXJcIlxuXG4gIFwib25XaWxsQWN0aXZhdGVNb2RlXCJcbiAgXCJvbkRpZEFjdGl2YXRlTW9kZVwiXG4gIFwicHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZVwiXG4gIFwib25XaWxsRGVhY3RpdmF0ZU1vZGVcIlxuICBcIm9uRGlkRGVhY3RpdmF0ZU1vZGVcIlxuXG4gIFwib25EaWRDYW5jZWxTZWxlY3RMaXN0XCJcbiAgXCJzdWJzY3JpYmVcIlxuICBcImlzTW9kZVwiXG4gIFwiZ2V0QmxvY2t3aXNlU2VsZWN0aW9uc1wiXG4gIFwiZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvblwiXG4gIFwiYWRkVG9DbGFzc0xpc3RcIlxuICBcImdldENvbmZpZ1wiXG5dXG5cbmNsYXNzIEJhc2VcbiAgRGVsZWdhdG8uaW5jbHVkZUludG8odGhpcylcbiAgQGRlbGVnYXRlc01ldGhvZHModmltU3RhdGVNZXRob2RzLi4uLCB0b1Byb3BlcnR5OiAndmltU3RhdGUnKVxuICBAZGVsZWdhdGVzUHJvcGVydHkoJ21vZGUnLCAnc3VibW9kZScsIHRvUHJvcGVydHk6ICd2aW1TdGF0ZScpXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUsIHByb3BlcnRpZXM9bnVsbCkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBnbG9iYWxTdGF0ZX0gPSBAdmltU3RhdGVcbiAgICBfLmV4dGVuZCh0aGlzLCBwcm9wZXJ0aWVzKSBpZiBwcm9wZXJ0aWVzP1xuXG4gICMgVG8gb3ZlcnJpZGVcbiAgaW5pdGlhbGl6ZTogLT5cblxuICAjIE9wZXJhdGlvbiBwcm9jZXNzb3IgZXhlY3V0ZSBvbmx5IHdoZW4gaXNDb21wbGV0ZSgpIHJldHVybiB0cnVlLlxuICAjIElmIGZhbHNlLCBvcGVyYXRpb24gcHJvY2Vzc29yIHBvc3Rwb25lIGl0cyBleGVjdXRpb24uXG4gIGlzQ29tcGxldGU6IC0+XG4gICAgaWYgQGlzUmVxdWlyZUlucHV0KCkgYW5kIG5vdCBAaGFzSW5wdXQoKVxuICAgICAgZmFsc2VcbiAgICBlbHNlIGlmIEBpc1JlcXVpcmVUYXJnZXQoKVxuICAgICAgIyBXaGVuIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGluIEJhc2U6OmNvbnN0cnVjdG9yXG4gICAgICAjIHRhZ2VydCBpcyBzdGlsbCBzdHJpbmcgbGlrZSBgTW92ZVRvUmlnaHRgLCBpbiB0aGlzIGNhc2UgaXNDb21wbGV0ZVxuICAgICAgIyBpcyBub3QgYXZhaWxhYmxlLlxuICAgICAgQGdldFRhcmdldCgpPy5pc0NvbXBsZXRlPygpXG4gICAgZWxzZVxuICAgICAgdHJ1ZVxuXG4gIHRhcmdldDogbnVsbFxuICBoYXNUYXJnZXQ6IC0+IEB0YXJnZXQ/XG4gIGdldFRhcmdldDogLT4gQHRhcmdldFxuXG4gIHJlcXVpcmVUYXJnZXQ6IGZhbHNlXG4gIGlzUmVxdWlyZVRhcmdldDogLT4gQHJlcXVpcmVUYXJnZXRcblxuICByZXF1aXJlSW5wdXQ6IGZhbHNlXG4gIGlzUmVxdWlyZUlucHV0OiAtPiBAcmVxdWlyZUlucHV0XG5cbiAgcmVjb3JkYWJsZTogZmFsc2VcbiAgaXNSZWNvcmRhYmxlOiAtPiBAcmVjb3JkYWJsZVxuXG4gIHJlcGVhdGVkOiBmYWxzZVxuICBpc1JlcGVhdGVkOiAtPiBAcmVwZWF0ZWRcbiAgc2V0UmVwZWF0ZWQ6IC0+IEByZXBlYXRlZCA9IHRydWVcblxuICAjIEludGVuZGVkIHRvIGJlIHVzZWQgYnkgVGV4dE9iamVjdCBvciBNb3Rpb25cbiAgb3BlcmF0b3I6IG51bGxcbiAgZ2V0T3BlcmF0b3I6IC0+IEBvcGVyYXRvclxuICBzZXRPcGVyYXRvcjogKEBvcGVyYXRvcikgLT4gQG9wZXJhdG9yXG4gIGlzQXNUYXJnZXRFeGNlcHRTZWxlY3Q6IC0+XG4gICAgQG9wZXJhdG9yPyBhbmQgbm90IEBvcGVyYXRvci5pbnN0YW5jZW9mKCdTZWxlY3QnKVxuXG4gIGFib3J0OiAtPlxuICAgIHRocm93IG5ldyBPcGVyYXRpb25BYm9ydGVkRXJyb3IoJ2Fib3J0ZWQnKVxuXG4gICMgQ291bnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvdW50OiBudWxsXG4gIGRlZmF1bHRDb3VudDogMVxuICBnZXRDb3VudDogKG9mZnNldD0wKSAtPlxuICAgIEBjb3VudCA/PSBAdmltU3RhdGUuZ2V0Q291bnQoKSA/IEBkZWZhdWx0Q291bnRcbiAgICBAY291bnQgKyBvZmZzZXRcblxuICByZXNldENvdW50OiAtPlxuICAgIEBjb3VudCA9IG51bGxcblxuICBpc0RlZmF1bHRDb3VudDogLT5cbiAgICBAY291bnQgaXMgQGRlZmF1bHRDb3VudFxuXG4gICMgTWlzY1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY291bnRUaW1lczogKGxhc3QsIGZuKSAtPlxuICAgIHJldHVybiBpZiBsYXN0IDwgMVxuXG4gICAgc3RvcHBlZCA9IGZhbHNlXG4gICAgc3RvcCA9IC0+IHN0b3BwZWQgPSB0cnVlXG4gICAgZm9yIGNvdW50IGluIFsxLi5sYXN0XVxuICAgICAgaXNGaW5hbCA9IGNvdW50IGlzIGxhc3RcbiAgICAgIGZuKHtjb3VudCwgaXNGaW5hbCwgc3RvcH0pXG4gICAgICBicmVhayBpZiBzdG9wcGVkXG5cbiAgYWN0aXZhdGVNb2RlOiAobW9kZSwgc3VibW9kZSkgLT5cbiAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgIEB2aW1TdGF0ZS5hY3RpdmF0ZShtb2RlLCBzdWJtb2RlKVxuXG4gIGFjdGl2YXRlTW9kZUlmTmVjZXNzYXJ5OiAobW9kZSwgc3VibW9kZSkgLT5cbiAgICB1bmxlc3MgQHZpbVN0YXRlLmlzTW9kZShtb2RlLCBzdWJtb2RlKVxuICAgICAgQGFjdGl2YXRlTW9kZShtb2RlLCBzdWJtb2RlKVxuXG4gIG5ldzogKG5hbWUsIHByb3BlcnRpZXMpIC0+XG4gICAga2xhc3MgPSBCYXNlLmdldENsYXNzKG5hbWUpXG4gICAgbmV3IGtsYXNzKEB2aW1TdGF0ZSwgcHJvcGVydGllcylcblxuICBuZXdJbnB1dFVJOiAtPlxuICAgIG5ldyBJbnB1dChAdmltU3RhdGUpXG5cbiAgIyBGSVhNRTogVGhpcyBpcyB1c2VkIHRvIGNsb25lIE1vdGlvbjo6U2VhcmNoIHRvIHN1cHBvcnQgYG5gIGFuZCBgTmBcbiAgIyBCdXQgbWFudWFsIHJlc2V0aW5nIGFuZCBvdmVycmlkaW5nIHByb3BlcnR5IGlzIGJ1ZyBwcm9uZS5cbiAgIyBTaG91bGQgZXh0cmFjdCBhcyBzZWFyY2ggc3BlYyBvYmplY3QgYW5kIHVzZSBpdCBieVxuICAjIGNyZWF0aW5nIGNsZWFuIGluc3RhbmNlIG9mIFNlYXJjaC5cbiAgY2xvbmU6ICh2aW1TdGF0ZSkgLT5cbiAgICBwcm9wZXJ0aWVzID0ge31cbiAgICBleGNsdWRlUHJvcGVydGllcyA9IFsnZWRpdG9yJywgJ2VkaXRvckVsZW1lbnQnLCAnZ2xvYmFsU3RhdGUnLCAndmltU3RhdGUnLCAnb3BlcmF0b3InXVxuICAgIGZvciBvd24ga2V5LCB2YWx1ZSBvZiB0aGlzIHdoZW4ga2V5IG5vdCBpbiBleGNsdWRlUHJvcGVydGllc1xuICAgICAgcHJvcGVydGllc1trZXldID0gdmFsdWVcbiAgICBrbGFzcyA9IHRoaXMuY29uc3RydWN0b3JcbiAgICBuZXcga2xhc3ModmltU3RhdGUsIHByb3BlcnRpZXMpXG5cbiAgY2FuY2VsT3BlcmF0aW9uOiAtPlxuICAgIEB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5jYW5jZWwoKVxuXG4gIHByb2Nlc3NPcGVyYXRpb246IC0+XG4gICAgQHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnByb2Nlc3MoKVxuXG4gIGZvY3VzU2VsZWN0TGlzdDogKG9wdGlvbnM9e30pIC0+XG4gICAgQG9uRGlkQ2FuY2VsU2VsZWN0TGlzdCA9PlxuICAgICAgQGNhbmNlbE9wZXJhdGlvbigpXG4gICAgc2VsZWN0TGlzdCA/PSByZXF1aXJlICcuL3NlbGVjdC1saXN0J1xuICAgIHNlbGVjdExpc3Quc2hvdyhAdmltU3RhdGUsIG9wdGlvbnMpXG5cbiAgaW5wdXQ6IG51bGxcbiAgaGFzSW5wdXQ6IC0+IEBpbnB1dD9cbiAgZ2V0SW5wdXQ6IC0+IEBpbnB1dFxuXG4gIGZvY3VzSW5wdXQ6IChjaGFyc01heCkgLT5cbiAgICBpbnB1dFVJID0gQG5ld0lucHV0VUkoKVxuICAgIGlucHV0VUkub25EaWRDb25maXJtIChAaW5wdXQpID0+XG4gICAgICBAcHJvY2Vzc09wZXJhdGlvbigpXG5cbiAgICBpZiBjaGFyc01heCA+IDFcbiAgICAgIGlucHV0VUkub25EaWRDaGFuZ2UgKGlucHV0KSA9PlxuICAgICAgICBAdmltU3RhdGUuaG92ZXIuc2V0KGlucHV0KVxuXG4gICAgaW5wdXRVSS5vbkRpZENhbmNlbChAY2FuY2VsT3BlcmF0aW9uLmJpbmQodGhpcykpXG4gICAgaW5wdXRVSS5mb2N1cyhjaGFyc01heClcblxuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihAZWRpdG9yKVxuXG4gIGdldFZpbUxhc3RCdWZmZXJSb3c6IC0+XG4gICAgZ2V0VmltTGFzdEJ1ZmZlclJvdyhAZWRpdG9yKVxuXG4gIGdldFZpbUxhc3RTY3JlZW5Sb3c6IC0+XG4gICAgZ2V0VmltTGFzdFNjcmVlblJvdyhAZWRpdG9yKVxuXG4gIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uOiAocG9pbnQsIG9wdGlvbnMpIC0+XG4gICAgZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgcG9pbnQsIG9wdGlvbnMpXG5cbiAgZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdzogKHJvdykgLT5cbiAgICBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KEBlZGl0b3IsIHJvdylcblxuICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlOiAocm93UmFuZ2UpIC0+XG4gICAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAZWRpdG9yLCByb3dSYW5nZSlcblxuICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdzogKHJvdykgLT5cbiAgICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhAZWRpdG9yLCByb3cpXG5cbiAgc2NhbkZvcndhcmQ6IChhcmdzLi4uKSAtPlxuICAgIHNjYW5FZGl0b3JJbkRpcmVjdGlvbihAZWRpdG9yLCAnZm9yd2FyZCcsIGFyZ3MuLi4pXG5cbiAgc2NhbkJhY2t3YXJkOiAoYXJncy4uLikgLT5cbiAgICBzY2FuRWRpdG9ySW5EaXJlY3Rpb24oQGVkaXRvciwgJ2JhY2t3YXJkJywgYXJncy4uLilcblxuICBpbnN0YW5jZW9mOiAoa2xhc3NOYW1lKSAtPlxuICAgIHRoaXMgaW5zdGFuY2VvZiBCYXNlLmdldENsYXNzKGtsYXNzTmFtZSlcblxuICBpczogKGtsYXNzTmFtZSkgLT5cbiAgICB0aGlzLmNvbnN0cnVjdG9yIGlzIEJhc2UuZ2V0Q2xhc3Moa2xhc3NOYW1lKVxuXG4gIGlzT3BlcmF0b3I6IC0+XG4gICAgQGluc3RhbmNlb2YoJ09wZXJhdG9yJylcblxuICBpc01vdGlvbjogLT5cbiAgICBAaW5zdGFuY2VvZignTW90aW9uJylcblxuICBpc1RleHRPYmplY3Q6IC0+XG4gICAgQGluc3RhbmNlb2YoJ1RleHRPYmplY3QnKVxuXG4gIGdldE5hbWU6IC0+XG4gICAgQGNvbnN0cnVjdG9yLm5hbWVcblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uczogLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkubWFwKEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbi5iaW5kKHRoaXMpKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKClcblxuICBnZXRCdWZmZXJQb3NpdGlvbkZvckN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKGN1cnNvci5zZWxlY3Rpb24pXG4gICAgZWxzZVxuICAgICAgY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXSlcblxuICB0b1N0cmluZzogLT5cbiAgICBzdHIgPSBAZ2V0TmFtZSgpXG4gICAgaWYgQGhhc1RhcmdldCgpXG4gICAgICBzdHIgKz0gXCIsIHRhcmdldD0je0B0YXJnZXQuZ2V0TmFtZSgpfSwgdGFyZ2V0Lndpc2U9I3tAdGFyZ2V0Lndpc2V9IFwiXG4gICAgZWxzZSBpZiBAb3BlcmF0b3I/XG4gICAgICBzdHIgKz0gXCIsIHdpc2U9I3tAd2lzZX0gLCBvcGVyYXRvcj0je0BvcGVyYXRvci5nZXROYW1lKCl9XCJcbiAgICBlbHNlXG4gICAgICBzdHJcblxuICAjIENsYXNzIG1ldGhvZHNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBpbml0OiAoc2VydmljZSkgLT5cbiAgICB7Z2V0RWRpdG9yU3RhdGV9ID0gc2VydmljZVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgW1xuICAgICAgJy4vb3BlcmF0b3InLCAnLi9vcGVyYXRvci1pbnNlcnQnLCAnLi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nJyxcbiAgICAgICcuL21vdGlvbicsICcuL21vdGlvbi1zZWFyY2gnLFxuICAgICAgJy4vdGV4dC1vYmplY3QnLFxuICAgICAgJy4vaW5zZXJ0LW1vZGUnLCAnLi9taXNjLWNvbW1hbmQnXG4gICAgXS5mb3JFYWNoKHJlcXVpcmUpXG5cbiAgICBmb3IgX18sIGtsYXNzIG9mIEBnZXRSZWdpc3RyaWVzKCkgd2hlbiBrbGFzcy5pc0NvbW1hbmQoKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkKGtsYXNzLnJlZ2lzdGVyQ29tbWFuZCgpKVxuICAgIEBzdWJzY3JpcHRpb25zXG5cbiAgIyBGb3IgZGV2ZWxvcG1lbnQgZWFzaW5lc3Mgd2l0aG91dCByZWxvYWRpbmcgdmltLW1vZGUtcGx1c1xuICBAcmVzZXQ6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgZm9yIF9fLCBrbGFzcyBvZiBAZ2V0UmVnaXN0cmllcygpIHdoZW4ga2xhc3MuaXNDb21tYW5kKClcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZChrbGFzcy5yZWdpc3RlckNvbW1hbmQoKSlcblxuICByZWdpc3RyaWVzID0ge0Jhc2V9XG4gIEBleHRlbmQ6IChAY29tbWFuZD10cnVlKSAtPlxuICAgIGlmIChAbmFtZSBvZiByZWdpc3RyaWVzKSBhbmQgKG5vdCBAc3VwcHJlc3NXYXJuaW5nKVxuICAgICAgY29uc29sZS53YXJuKFwiRHVwbGljYXRlIGNvbnN0cnVjdG9yICN7QG5hbWV9XCIpXG4gICAgcmVnaXN0cmllc1tAbmFtZV0gPSB0aGlzXG5cbiAgQGdldENsYXNzOiAobmFtZSkgLT5cbiAgICBpZiAoa2xhc3MgPSByZWdpc3RyaWVzW25hbWVdKT9cbiAgICAgIGtsYXNzXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2xhc3MgJyN7bmFtZX0nIG5vdCBmb3VuZFwiKVxuXG4gIEBnZXRSZWdpc3RyaWVzOiAtPlxuICAgIHJlZ2lzdHJpZXNcblxuICBAaXNDb21tYW5kOiAtPlxuICAgIEBjb21tYW5kXG5cbiAgQGNvbW1hbmRQcmVmaXg6ICd2aW0tbW9kZS1wbHVzJ1xuICBAZ2V0Q29tbWFuZE5hbWU6IC0+XG4gICAgQGNvbW1hbmRQcmVmaXggKyAnOicgKyBfLmRhc2hlcml6ZShAbmFtZSlcblxuICBAZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4OiAtPlxuICAgIF8uZGFzaGVyaXplKEBuYW1lKVxuXG4gIEBjb21tYW5kU2NvcGU6ICdhdG9tLXRleHQtZWRpdG9yJ1xuICBAZ2V0Q29tbWFuZFNjb3BlOiAtPlxuICAgIEBjb21tYW5kU2NvcGVcblxuICBAZ2V0RGVzY3RpcHRpb246IC0+XG4gICAgaWYgQGhhc093blByb3BlcnR5KFwiZGVzY3JpcHRpb25cIilcbiAgICAgIEBkZXNjcmlwdGlvblxuICAgIGVsc2VcbiAgICAgIG51bGxcblxuICBAcmVnaXN0ZXJDb21tYW5kOiAtPlxuICAgIGtsYXNzID0gdGhpc1xuICAgIGF0b20uY29tbWFuZHMuYWRkIEBnZXRDb21tYW5kU2NvcGUoKSwgQGdldENvbW1hbmROYW1lKCksIChldmVudCkgLT5cbiAgICAgIHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUoQGdldE1vZGVsKCkpID8gZ2V0RWRpdG9yU3RhdGUoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKVxuICAgICAgaWYgdmltU3RhdGU/ICMgUG9zc2libHkgdW5kZWZpbmVkIFNlZSAjODVcbiAgICAgICAgdmltU3RhdGUuX2V2ZW50ID0gZXZlbnRcbiAgICAgICAgdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKGtsYXNzKVxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlXG4iXX0=
