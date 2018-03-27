(function() {
  var Base, CompositeDisposable, Disposable, MoveToRelativeLine, OperationAbortedError, OperationStack, Select, moveCursorLeft, ref, ref1, swrap;

  ref = require('atom'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  moveCursorLeft = require('./utils').moveCursorLeft;

  ref1 = {}, Select = ref1.Select, MoveToRelativeLine = ref1.MoveToRelativeLine;

  OperationAbortedError = require('./errors').OperationAbortedError;

  swrap = require('./selection-wrapper');

  OperationStack = (function() {
    Object.defineProperty(OperationStack.prototype, 'mode', {
      get: function() {
        return this.modeManager.mode;
      }
    });

    Object.defineProperty(OperationStack.prototype, 'submode', {
      get: function() {
        return this.modeManager.submode;
      }
    });

    function OperationStack(vimState) {
      var ref2;
      this.vimState = vimState;
      ref2 = this.vimState, this.editor = ref2.editor, this.editorElement = ref2.editorElement, this.modeManager = ref2.modeManager;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      if (Select == null) {
        Select = Base.getClass('Select');
      }
      if (MoveToRelativeLine == null) {
        MoveToRelativeLine = Base.getClass('MoveToRelativeLine');
      }
      this.reset();
    }

    OperationStack.prototype.subscribe = function(handler) {
      this.operationSubscriptions.add(handler);
      return handler;
    };

    OperationStack.prototype.reset = function() {
      var ref2;
      this.resetCount();
      this.stack = [];
      this.processing = false;
      this.vimState.emitDidResetOperationStack();
      if ((ref2 = this.operationSubscriptions) != null) {
        ref2.dispose();
      }
      return this.operationSubscriptions = new CompositeDisposable;
    };

    OperationStack.prototype.destroy = function() {
      var ref2, ref3;
      this.subscriptions.dispose();
      if ((ref2 = this.operationSubscriptions) != null) {
        ref2.dispose();
      }
      return ref3 = {}, this.stack = ref3.stack, this.operationSubscriptions = ref3.operationSubscriptions, ref3;
    };

    OperationStack.prototype.peekTop = function() {
      return this.stack[this.stack.length - 1];
    };

    OperationStack.prototype.isEmpty = function() {
      return this.stack.length === 0;
    };

    OperationStack.prototype.run = function(klass, properties) {
      var error, isValidOperation, operation, ref2, type;
      try {
        if (this.isEmpty()) {
          this.vimState.init();
        }
        type = typeof klass;
        if (type === 'object') {
          operation = klass;
        } else {
          if (type === 'string') {
            klass = Base.getClass(klass);
          }
          if (((ref2 = this.peekTop()) != null ? ref2.constructor : void 0) === klass) {
            operation = new MoveToRelativeLine(this.vimState);
          } else {
            operation = new klass(this.vimState, properties);
          }
        }
        if (this.isEmpty()) {
          isValidOperation = true;
          if ((this.mode === 'visual' && operation.isMotion()) || operation.isTextObject()) {
            operation = new Select(this.vimState).setTarget(operation);
          }
        } else {
          isValidOperation = this.peekTop().isOperator() && (operation.isMotion() || operation.isTextObject());
        }
        if (isValidOperation) {
          this.stack.push(operation);
          return this.process();
        } else {
          this.vimState.emitDidFailToPushToOperationStack();
          return this.vimState.resetNormalMode();
        }
      } catch (error1) {
        error = error1;
        return this.handleError(error);
      }
    };

    OperationStack.prototype.runRecorded = function() {
      var count, operation, ref2;
      if (operation = this.recordedOperation) {
        operation.setRepeated();
        if (this.hasCount()) {
          count = this.getCount();
          operation.count = count;
          if ((ref2 = operation.target) != null) {
            ref2.count = count;
          }
        }
        operation.subscribeResetOccurrencePatternIfNeeded();
        return this.run(operation);
      }
    };

    OperationStack.prototype.runRecordedMotion = function(key, arg) {
      var operation, reverse;
      reverse = (arg != null ? arg : {}).reverse;
      if (!(operation = this.vimState.globalState.get(key))) {
        return;
      }
      operation = operation.clone(this.vimState);
      operation.setRepeated();
      operation.resetCount();
      if (reverse) {
        operation.backwards = !operation.backwards;
      }
      return this.run(operation);
    };

    OperationStack.prototype.runCurrentFind = function(options) {
      return this.runRecordedMotion('currentFind', options);
    };

    OperationStack.prototype.runCurrentSearch = function(options) {
      return this.runRecordedMotion('currentSearch', options);
    };

    OperationStack.prototype.handleError = function(error) {
      this.vimState.reset();
      if (!(error instanceof OperationAbortedError)) {
        throw error;
      }
    };

    OperationStack.prototype.isProcessing = function() {
      return this.processing;
    };

    OperationStack.prototype.process = function() {
      var base, commandName, operation, top;
      this.processing = true;
      if (this.stack.length === 2) {
        if (!this.peekTop().isComplete()) {
          return;
        }
        operation = this.stack.pop();
        this.peekTop().setTarget(operation);
      }
      top = this.peekTop();
      if (top.isComplete()) {
        return this.execute(this.stack.pop());
      } else {
        if (this.mode === 'normal' && top.isOperator()) {
          this.modeManager.activate('operator-pending');
        }
        if (commandName = typeof (base = top.constructor).getCommandNameWithoutPrefix === "function" ? base.getCommandNameWithoutPrefix() : void 0) {
          return this.addToClassList(commandName + "-pending");
        }
      }
    };

    OperationStack.prototype.execute = function(operation) {
      var execution;
      execution = operation.execute();
      if (execution instanceof Promise) {
        return execution.then((function(_this) {
          return function() {
            return _this.finish(operation);
          };
        })(this))["catch"]((function(_this) {
          return function() {
            return _this.handleError();
          };
        })(this));
      } else {
        return this.finish(operation);
      }
    };

    OperationStack.prototype.cancel = function() {
      var ref2;
      if ((ref2 = this.mode) !== 'visual' && ref2 !== 'insert') {
        this.vimState.resetNormalMode();
        this.vimState.restoreOriginalCursorPosition();
      }
      return this.finish();
    };

    OperationStack.prototype.finish = function(operation) {
      if (operation == null) {
        operation = null;
      }
      if (operation != null ? operation.isRecordable() : void 0) {
        this.recordedOperation = operation;
      }
      this.vimState.emitDidFinishOperation();
      if (operation != null ? operation.isOperator() : void 0) {
        operation.resetState();
      }
      if (this.mode === 'normal') {
        this.ensureAllSelectionsAreEmpty(operation);
        this.ensureAllCursorsAreNotAtEndOfLine();
      } else if (this.mode === 'visual') {
        this.modeManager.updateNarrowedState();
        this.vimState.updatePreviousSelection();
      }
      this.vimState.updateCursorsVisibility();
      return this.vimState.reset();
    };

    OperationStack.prototype.ensureAllSelectionsAreEmpty = function(operation) {
      this.vimState.clearBlockwiseSelections();
      if (!this.editor.getLastSelection().isEmpty()) {
        if (this.vimState.getConfig('devThrowErrorOnNonEmptySelectionInNormalMode')) {
          throw new Error("Selection is not empty in normal-mode: " + (operation.toString()));
        } else {
          return this.vimState.clearSelections();
        }
      }
    };

    OperationStack.prototype.ensureAllCursorsAreNotAtEndOfLine = function() {
      var cursor, i, len, ref2, results;
      ref2 = this.editor.getCursors();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        if (cursor.isAtEndOfLine()) {
          results.push(moveCursorLeft(cursor, {
            preserveGoalColumn: true
          }));
        }
      }
      return results;
    };

    OperationStack.prototype.addToClassList = function(className) {
      this.editorElement.classList.add(className);
      return this.subscribe(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.classList.remove(className);
        };
      })(this)));
    };

    OperationStack.prototype.hasCount = function() {
      return (this.count['normal'] != null) || (this.count['operator-pending'] != null);
    };

    OperationStack.prototype.getCount = function() {
      var ref2, ref3;
      if (this.hasCount()) {
        return ((ref2 = this.count['normal']) != null ? ref2 : 1) * ((ref3 = this.count['operator-pending']) != null ? ref3 : 1);
      } else {
        return null;
      }
    };

    OperationStack.prototype.setCount = function(number) {
      var base, mode;
      mode = 'normal';
      if (this.mode === 'operator-pending') {
        mode = this.mode;
      }
      if ((base = this.count)[mode] == null) {
        base[mode] = 0;
      }
      this.count[mode] = (this.count[mode] * 10) + number;
      this.vimState.hover.set(this.buildCountString());
      return this.vimState.toggleClassList('with-count', true);
    };

    OperationStack.prototype.buildCountString = function() {
      return [this.count['normal'], this.count['operator-pending']].filter(function(count) {
        return count != null;
      }).map(function(count) {
        return String(count);
      }).join('x');
    };

    OperationStack.prototype.resetCount = function() {
      this.count = {};
      return this.vimState.toggleClassList('with-count', false);
    };

    return OperationStack;

  })();

  module.exports = OperationStack;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdGlvbi1zdGFjay5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQW9DLE9BQUEsQ0FBUSxNQUFSLENBQXBDLEVBQUMsMkJBQUQsRUFBYTs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ04saUJBQWtCLE9BQUEsQ0FBUSxTQUFSOztFQUNuQixPQUErQixFQUEvQixFQUFDLG9CQUFELEVBQVM7O0VBQ1Isd0JBQXlCLE9BQUEsQ0FBUSxVQUFSOztFQUMxQixLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQVlGO0lBQ0osTUFBTSxDQUFDLGNBQVAsQ0FBc0IsY0FBQyxDQUFBLFNBQXZCLEVBQWtDLE1BQWxDLEVBQTBDO01BQUEsR0FBQSxFQUFLLFNBQUE7ZUFBRyxJQUFDLENBQUEsV0FBVyxDQUFDO01BQWhCLENBQUw7S0FBMUM7O0lBQ0EsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsY0FBQyxDQUFBLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDO01BQUEsR0FBQSxFQUFLLFNBQUE7ZUFBRyxJQUFDLENBQUEsV0FBVyxDQUFDO01BQWhCLENBQUw7S0FBN0M7O0lBRWEsd0JBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDtNQUNaLE9BQTBDLElBQUMsQ0FBQSxRQUEzQyxFQUFDLElBQUMsQ0FBQSxjQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEscUJBQUEsYUFBWCxFQUEwQixJQUFDLENBQUEsbUJBQUE7TUFFM0IsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FB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QUE4QixDQUE5QixFQUQzQjtPQUFBLE1BQUE7ZUFHRSxLQUhGOztJQURROzs2QkFNVixRQUFBLEdBQVUsU0FBQyxNQUFEO0FBQ1IsVUFBQTtNQUFBLElBQUEsR0FBTztNQUNQLElBQWdCLElBQUMsQ0FBQSxJQUFELEtBQVMsa0JBQXpCO1FBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUFSOzs7WUFDTyxDQUFBLElBQUEsSUFBUzs7TUFDaEIsSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBLENBQVAsR0FBZSxDQUFDLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQSxDQUFQLEdBQWUsRUFBaEIsQ0FBQSxHQUFzQjtNQUNyQyxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFoQixDQUFvQixJQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQUFwQjthQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsZUFBVixDQUEwQixZQUExQixFQUF3QyxJQUF4QztJQU5ROzs2QkFRVixnQkFBQSxHQUFrQixTQUFBO2FBQ2hCLENBQUMsSUFBQyxDQUFBLEtBQU0sQ0FBQSxRQUFBLENBQVIsRUFBbUIsSUFBQyxDQUFBLEtBQU0sQ0FBQSxrQkFBQSxDQUExQixDQUNFLENBQUMsTUFESCxDQUNVLFNBQUMsS0FBRDtlQUFXO01BQVgsQ0FEVixDQUVFLENBQUMsR0FGSCxDQUVPLFNBQUMsS0FBRDtlQUFXLE1BQUEsQ0FBTyxLQUFQO01BQVgsQ0FGUCxDQUdFLENBQUMsSUFISCxDQUdRLEdBSFI7SUFEZ0I7OzZCQU1sQixVQUFBLEdBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxLQUFELEdBQVM7YUFDVCxJQUFDLENBQUEsUUFBUSxDQUFDLGVBQVYsQ0FBMEIsWUFBMUIsRUFBd0MsS0FBeEM7SUFGVTs7Ozs7O0VBSWQsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE3T2pCIiwic291cmNlc0NvbnRlbnQiOlsie0Rpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG57bW92ZUN1cnNvckxlZnR9ID0gcmVxdWlyZSAnLi91dGlscydcbntTZWxlY3QsIE1vdmVUb1JlbGF0aXZlTGluZX0gPSB7fVxue09wZXJhdGlvbkFib3J0ZWRFcnJvcn0gPSByZXF1aXJlICcuL2Vycm9ycydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcblxuIyBvcHJhdGlvbiBsaWZlIGluIG9wZXJhdGlvblN0YWNrXG4jIDEuIHJ1blxuIyAgICBpbnN0YW50aWF0ZWQgYnkgbmV3LlxuIyAgICBjb21wbGltZW50IGltcGxpY2l0IE9wZXJhdG9yLlNlbGVjdCBvcGVyYXRvciBpZiBuZWNlc3NhcnkuXG4jICAgIHB1c2ggb3BlcmF0aW9uIHRvIHN0YWNrLlxuIyAyLiBwcm9jZXNzXG4jICAgIHJlZHVjZSBzdGFjayBieSwgcG9wcGluZyB0b3Agb2Ygc3RhY2sgdGhlbiBzZXQgaXQgYXMgdGFyZ2V0IG9mIG5ldyB0b3AuXG4jICAgIGNoZWNrIGlmIHJlbWFpbmluZyB0b3Agb2Ygc3RhY2sgaXMgZXhlY3V0YWJsZSBieSBjYWxsaW5nIGlzQ29tcGxldGUoKVxuIyAgICBpZiBleGVjdXRhYmxlLCB0aGVuIHBvcCBzdGFjayB0aGVuIGV4ZWN1dGUocG9wcGVkT3BlcmF0aW9uKVxuIyAgICBpZiBub3QgZXhlY3V0YWJsZSwgZW50ZXIgXCJvcGVyYXRvci1wZW5kaW5nLW1vZGVcIlxuY2xhc3MgT3BlcmF0aW9uU3RhY2tcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsICdtb2RlJywgZ2V0OiAtPiBAbW9kZU1hbmFnZXIubW9kZVxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgJ3N1Ym1vZGUnLCBnZXQ6IC0+IEBtb2RlTWFuYWdlci5zdWJtb2RlXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAbW9kZU1hbmFnZXJ9ID0gQHZpbVN0YXRlXG5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcblxuICAgIFNlbGVjdCA/PSBCYXNlLmdldENsYXNzKCdTZWxlY3QnKVxuICAgIE1vdmVUb1JlbGF0aXZlTGluZSA/PSBCYXNlLmdldENsYXNzKCdNb3ZlVG9SZWxhdGl2ZUxpbmUnKVxuXG4gICAgQHJlc2V0KClcblxuICAjIFJldHVybiBoYW5kbGVyXG4gIHN1YnNjcmliZTogKGhhbmRsZXIpIC0+XG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnMuYWRkKGhhbmRsZXIpXG4gICAgcmV0dXJuIGhhbmRsZXIgIyBET05UIFJFTU9WRVxuXG4gIHJlc2V0OiAtPlxuICAgIEByZXNldENvdW50KClcbiAgICBAc3RhY2sgPSBbXVxuICAgIEBwcm9jZXNzaW5nID0gZmFsc2VcblxuICAgICMgdGhpcyBoYXMgdG8gYmUgQkVGT1JFIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEB2aW1TdGF0ZS5lbWl0RGlkUmVzZXRPcGVyYXRpb25TdGFjaygpXG5cbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIHtAc3RhY2ssIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zfSA9IHt9XG5cbiAgcGVla1RvcDogLT5cbiAgICBAc3RhY2tbQHN0YWNrLmxlbmd0aCAtIDFdXG5cbiAgaXNFbXB0eTogLT5cbiAgICBAc3RhY2subGVuZ3RoIGlzIDBcblxuICAjIE1haW5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHJ1bjogKGtsYXNzLCBwcm9wZXJ0aWVzKSAtPlxuICAgICMgY29uc29sZS5sb2cgQHZpbVN0YXRlLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKS5sZW5ndGhcbiAgICAjIGNvbnNvbGUubG9nIHN3cmFwLmdldFByb3BlcnR5U3RvcmUoKS5zaXplXG4gICAgdHJ5XG4gICAgICBAdmltU3RhdGUuaW5pdCgpIGlmIEBpc0VtcHR5KClcbiAgICAgIHR5cGUgPSB0eXBlb2Yoa2xhc3MpXG4gICAgICBpZiB0eXBlIGlzICdvYmplY3QnICMgLiByZXBlYXQgY2FzZSB3ZSBjYW4gZXhlY3V0ZSBhcy1pdC1pcy5cbiAgICAgICAgb3BlcmF0aW9uID0ga2xhc3NcbiAgICAgIGVsc2VcbiAgICAgICAga2xhc3MgPSBCYXNlLmdldENsYXNzKGtsYXNzKSBpZiB0eXBlIGlzICdzdHJpbmcnXG4gICAgICAgICMgUmVwbGFjZSBvcGVyYXRvciB3aGVuIGlkZW50aWNhbCBvbmUgcmVwZWF0ZWQsIGUuZy4gYGRkYCwgYGNjYCwgYGdVZ1VgXG4gICAgICAgIGlmIEBwZWVrVG9wKCk/LmNvbnN0cnVjdG9yIGlzIGtsYXNzXG4gICAgICAgICAgb3BlcmF0aW9uID0gbmV3IE1vdmVUb1JlbGF0aXZlTGluZShAdmltU3RhdGUpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvcGVyYXRpb24gPSBuZXcga2xhc3MoQHZpbVN0YXRlLCBwcm9wZXJ0aWVzKVxuXG4gICAgICBpZiBAaXNFbXB0eSgpXG4gICAgICAgIGlzVmFsaWRPcGVyYXRpb24gPSB0cnVlXG4gICAgICAgIGlmIChAbW9kZSBpcyAndmlzdWFsJyBhbmQgb3BlcmF0aW9uLmlzTW90aW9uKCkpIG9yIG9wZXJhdGlvbi5pc1RleHRPYmplY3QoKVxuICAgICAgICAgIG9wZXJhdGlvbiA9IG5ldyBTZWxlY3QoQHZpbVN0YXRlKS5zZXRUYXJnZXQob3BlcmF0aW9uKVxuICAgICAgZWxzZVxuICAgICAgICBpc1ZhbGlkT3BlcmF0aW9uID0gQHBlZWtUb3AoKS5pc09wZXJhdG9yKCkgYW5kIChvcGVyYXRpb24uaXNNb3Rpb24oKSBvciBvcGVyYXRpb24uaXNUZXh0T2JqZWN0KCkpXG5cbiAgICAgIGlmIGlzVmFsaWRPcGVyYXRpb25cbiAgICAgICAgQHN0YWNrLnB1c2gob3BlcmF0aW9uKVxuICAgICAgICBAcHJvY2VzcygpXG4gICAgICBlbHNlXG4gICAgICAgIEB2aW1TdGF0ZS5lbWl0RGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2soKVxuICAgICAgICBAdmltU3RhdGUucmVzZXROb3JtYWxNb2RlKClcbiAgICBjYXRjaCBlcnJvclxuICAgICAgQGhhbmRsZUVycm9yKGVycm9yKVxuXG4gIHJ1blJlY29yZGVkOiAtPlxuICAgIGlmIG9wZXJhdGlvbiA9IEByZWNvcmRlZE9wZXJhdGlvblxuICAgICAgb3BlcmF0aW9uLnNldFJlcGVhdGVkKClcbiAgICAgIGlmIEBoYXNDb3VudCgpXG4gICAgICAgIGNvdW50ID0gQGdldENvdW50KClcbiAgICAgICAgb3BlcmF0aW9uLmNvdW50ID0gY291bnRcbiAgICAgICAgb3BlcmF0aW9uLnRhcmdldD8uY291bnQgPSBjb3VudCAjIFNvbWUgb3BlYXJ0b3IgaGF2ZSBubyB0YXJnZXQgbGlrZSBjdHJsLWEoaW5jcmVhc2UpLlxuXG4gICAgICBvcGVyYXRpb24uc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkKClcbiAgICAgIEBydW4ob3BlcmF0aW9uKVxuXG4gIHJ1blJlY29yZGVkTW90aW9uOiAoa2V5LCB7cmV2ZXJzZX09e30pIC0+XG4gICAgcmV0dXJuIHVubGVzcyBvcGVyYXRpb24gPSBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KGtleSlcblxuICAgIG9wZXJhdGlvbiA9IG9wZXJhdGlvbi5jbG9uZShAdmltU3RhdGUpXG4gICAgb3BlcmF0aW9uLnNldFJlcGVhdGVkKClcbiAgICBvcGVyYXRpb24ucmVzZXRDb3VudCgpXG4gICAgaWYgcmV2ZXJzZVxuICAgICAgb3BlcmF0aW9uLmJhY2t3YXJkcyA9IG5vdCBvcGVyYXRpb24uYmFja3dhcmRzXG4gICAgQHJ1bihvcGVyYXRpb24pXG5cbiAgcnVuQ3VycmVudEZpbmQ6IChvcHRpb25zKSAtPlxuICAgIEBydW5SZWNvcmRlZE1vdGlvbignY3VycmVudEZpbmQnLCBvcHRpb25zKVxuXG4gIHJ1bkN1cnJlbnRTZWFyY2g6IChvcHRpb25zKSAtPlxuICAgIEBydW5SZWNvcmRlZE1vdGlvbignY3VycmVudFNlYXJjaCcsIG9wdGlvbnMpXG5cbiAgaGFuZGxlRXJyb3I6IChlcnJvcikgLT5cbiAgICBAdmltU3RhdGUucmVzZXQoKVxuICAgIHVubGVzcyBlcnJvciBpbnN0YW5jZW9mIE9wZXJhdGlvbkFib3J0ZWRFcnJvclxuICAgICAgdGhyb3cgZXJyb3JcblxuICBpc1Byb2Nlc3Npbmc6IC0+XG4gICAgQHByb2Nlc3NpbmdcblxuICBwcm9jZXNzOiAtPlxuICAgIEBwcm9jZXNzaW5nID0gdHJ1ZVxuICAgIGlmIEBzdGFjay5sZW5ndGggaXMgMlxuICAgICAgIyBbRklYTUUgaWRlYWxseV1cbiAgICAgICMgSWYgdGFyZ2V0IGlzIG5vdCBjb21wbGV0ZSwgd2UgcG9zdHBvbmUgY29tcG9zaW5nIHRhcmdldCB3aXRoIG9wZXJhdG9yIHRvIGtlZXAgc2l0dWF0aW9uIHNpbXBsZS5cbiAgICAgICMgU28gdGhhdCB3ZSBjYW4gYXNzdW1lIHdoZW4gdGFyZ2V0IGlzIHNldCB0byBvcGVyYXRvciBpdCdzIGNvbXBsZXRlLlxuICAgICAgIyBlLmcuIGB5IHMgdCBhJyhzdXJyb3VuZCBmb3IgcmFuZ2UgZnJvbSBoZXJlIHRvIHRpbGwgYSlcbiAgICAgIHJldHVybiB1bmxlc3MgQHBlZWtUb3AoKS5pc0NvbXBsZXRlKClcblxuICAgICAgb3BlcmF0aW9uID0gQHN0YWNrLnBvcCgpXG4gICAgICBAcGVla1RvcCgpLnNldFRhcmdldChvcGVyYXRpb24pXG5cbiAgICB0b3AgPSBAcGVla1RvcCgpXG5cbiAgICBpZiB0b3AuaXNDb21wbGV0ZSgpXG4gICAgICBAZXhlY3V0ZShAc3RhY2sucG9wKCkpXG4gICAgZWxzZVxuICAgICAgaWYgQG1vZGUgaXMgJ25vcm1hbCcgYW5kIHRvcC5pc09wZXJhdG9yKClcbiAgICAgICAgQG1vZGVNYW5hZ2VyLmFjdGl2YXRlKCdvcGVyYXRvci1wZW5kaW5nJylcblxuICAgICAgIyBUZW1wb3Jhcnkgc2V0IHdoaWxlIGNvbW1hbmQgaXMgcnVubmluZ1xuICAgICAgaWYgY29tbWFuZE5hbWUgPSB0b3AuY29uc3RydWN0b3IuZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4PygpXG4gICAgICAgIEBhZGRUb0NsYXNzTGlzdChjb21tYW5kTmFtZSArIFwiLXBlbmRpbmdcIilcblxuICBleGVjdXRlOiAob3BlcmF0aW9uKSAtPlxuICAgIGV4ZWN1dGlvbiA9IG9wZXJhdGlvbi5leGVjdXRlKClcbiAgICBpZiBleGVjdXRpb24gaW5zdGFuY2VvZiBQcm9taXNlXG4gICAgICBleGVjdXRpb25cbiAgICAgICAgLnRoZW4gPT4gQGZpbmlzaChvcGVyYXRpb24pXG4gICAgICAgIC5jYXRjaCA9PiBAaGFuZGxlRXJyb3IoKVxuICAgIGVsc2VcbiAgICAgIEBmaW5pc2gob3BlcmF0aW9uKVxuXG4gIGNhbmNlbDogLT5cbiAgICBpZiBAbW9kZSBub3QgaW4gWyd2aXN1YWwnLCAnaW5zZXJ0J11cbiAgICAgIEB2aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKVxuICAgICAgQHZpbVN0YXRlLnJlc3RvcmVPcmlnaW5hbEN1cnNvclBvc2l0aW9uKClcbiAgICBAZmluaXNoKClcblxuICBmaW5pc2g6IChvcGVyYXRpb249bnVsbCkgLT5cbiAgICBAcmVjb3JkZWRPcGVyYXRpb24gPSBvcGVyYXRpb24gaWYgb3BlcmF0aW9uPy5pc1JlY29yZGFibGUoKVxuICAgIEB2aW1TdGF0ZS5lbWl0RGlkRmluaXNoT3BlcmF0aW9uKClcbiAgICBpZiBvcGVyYXRpb24/LmlzT3BlcmF0b3IoKVxuICAgICAgb3BlcmF0aW9uLnJlc2V0U3RhdGUoKVxuXG4gICAgaWYgQG1vZGUgaXMgJ25vcm1hbCdcbiAgICAgIEBlbnN1cmVBbGxTZWxlY3Rpb25zQXJlRW1wdHkob3BlcmF0aW9uKVxuICAgICAgQGVuc3VyZUFsbEN1cnNvcnNBcmVOb3RBdEVuZE9mTGluZSgpXG4gICAgZWxzZSBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQG1vZGVNYW5hZ2VyLnVwZGF0ZU5hcnJvd2VkU3RhdGUoKVxuICAgICAgQHZpbVN0YXRlLnVwZGF0ZVByZXZpb3VzU2VsZWN0aW9uKClcblxuICAgIEB2aW1TdGF0ZS51cGRhdGVDdXJzb3JzVmlzaWJpbGl0eSgpXG4gICAgQHZpbVN0YXRlLnJlc2V0KClcblxuICBlbnN1cmVBbGxTZWxlY3Rpb25zQXJlRW1wdHk6IChvcGVyYXRpb24pIC0+XG4gICAgIyBXaGVuIEB2aW1TdGF0ZS5zZWxlY3RCbG9ja3dpc2UoKSBpcyBjYWxsZWQgaW4gbm9uLXZpc3VhbC1tb2RlLlxuICAgICMgZS5nLiBgLmAgcmVwZWF0IG9mIG9wZXJhdGlvbiB0YXJnZXRlZCBibG9ja3dpc2UgYEN1cnJlbnRTZWxlY3Rpb25gLlxuICAgICMgV2UgbmVlZCB0byBtYW51YWxseSBjbGVhciBibG9ja3dpc2VTZWxlY3Rpb24uXG4gICAgIyBTZWUgIzY0N1xuICAgIEB2aW1TdGF0ZS5jbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnMoKSAjIEZJWE1FLCBzaG91bGQgYmUgcmVtb3ZlZFxuXG4gICAgdW5sZXNzIEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmlzRW1wdHkoKVxuICAgICAgaWYgQHZpbVN0YXRlLmdldENvbmZpZygnZGV2VGhyb3dFcnJvck9uTm9uRW1wdHlTZWxlY3Rpb25Jbk5vcm1hbE1vZGUnKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWxlY3Rpb24gaXMgbm90IGVtcHR5IGluIG5vcm1hbC1tb2RlOiAje29wZXJhdGlvbi50b1N0cmluZygpfVwiKVxuICAgICAgZWxzZVxuICAgICAgICBAdmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcblxuICBlbnN1cmVBbGxDdXJzb3JzQXJlTm90QXRFbmRPZkxpbmU6IC0+XG4gICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKSB3aGVuIGN1cnNvci5pc0F0RW5kT2ZMaW5lKClcbiAgICAgIG1vdmVDdXJzb3JMZWZ0KGN1cnNvciwgcHJlc2VydmVHb2FsQ29sdW1uOiB0cnVlKVxuXG4gIGFkZFRvQ2xhc3NMaXN0OiAoY2xhc3NOYW1lKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKVxuICAgIEBzdWJzY3JpYmUgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKVxuXG4gICMgQ291bnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMga2V5c3Ryb2tlIGAzZDJ3YCBkZWxldGUgNigzKjIpIHdvcmRzLlxuICAjICAybmQgbnVtYmVyKDIgaW4gdGhpcyBjYXNlKSBpcyBhbHdheXMgZW50ZXJkIGluIG9wZXJhdG9yLXBlbmRpbmctbW9kZS5cbiAgIyAgU28gY291bnQgaGF2ZSB0d28gdGltaW5nIHRvIGJlIGVudGVyZWQuIHRoYXQncyB3aHkgaGVyZSB3ZSBtYW5hZ2UgY291bnRlciBieSBtb2RlLlxuICBoYXNDb3VudDogLT5cbiAgICBAY291bnRbJ25vcm1hbCddPyBvciBAY291bnRbJ29wZXJhdG9yLXBlbmRpbmcnXT9cblxuICBnZXRDb3VudDogLT5cbiAgICBpZiBAaGFzQ291bnQoKVxuICAgICAgKEBjb3VudFsnbm9ybWFsJ10gPyAxKSAqIChAY291bnRbJ29wZXJhdG9yLXBlbmRpbmcnXSA/IDEpXG4gICAgZWxzZVxuICAgICAgbnVsbFxuXG4gIHNldENvdW50OiAobnVtYmVyKSAtPlxuICAgIG1vZGUgPSAnbm9ybWFsJ1xuICAgIG1vZGUgPSBAbW9kZSBpZiBAbW9kZSBpcyAnb3BlcmF0b3ItcGVuZGluZydcbiAgICBAY291bnRbbW9kZV0gPz0gMFxuICAgIEBjb3VudFttb2RlXSA9IChAY291bnRbbW9kZV0gKiAxMCkgKyBudW1iZXJcbiAgICBAdmltU3RhdGUuaG92ZXIuc2V0KEBidWlsZENvdW50U3RyaW5nKCkpXG4gICAgQHZpbVN0YXRlLnRvZ2dsZUNsYXNzTGlzdCgnd2l0aC1jb3VudCcsIHRydWUpXG5cbiAgYnVpbGRDb3VudFN0cmluZzogLT5cbiAgICBbQGNvdW50Wydub3JtYWwnXSwgQGNvdW50WydvcGVyYXRvci1wZW5kaW5nJ11dXG4gICAgICAuZmlsdGVyIChjb3VudCkgLT4gY291bnQ/XG4gICAgICAubWFwIChjb3VudCkgLT4gU3RyaW5nKGNvdW50KVxuICAgICAgLmpvaW4oJ3gnKVxuXG4gIHJlc2V0Q291bnQ6IC0+XG4gICAgQGNvdW50ID0ge31cbiAgICBAdmltU3RhdGUudG9nZ2xlQ2xhc3NMaXN0KCd3aXRoLWNvdW50JywgZmFsc2UpXG5cbm1vZHVsZS5leHBvcnRzID0gT3BlcmF0aW9uU3RhY2tcbiJdfQ==
