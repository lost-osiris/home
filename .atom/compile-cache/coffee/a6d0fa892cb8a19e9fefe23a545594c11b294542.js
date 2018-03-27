(function() {
  var Base, CompositeDisposable, Disposable, MoveToRelativeLine, OperationAbortedError, OperationStack, Select, assertWithException, haveSomeNonEmptySelection, moveCursorLeft, ref, ref1, ref2, swrap;

  ref = require('atom'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  ref1 = require('./utils'), moveCursorLeft = ref1.moveCursorLeft, haveSomeNonEmptySelection = ref1.haveSomeNonEmptySelection, assertWithException = ref1.assertWithException;

  ref2 = {}, Select = ref2.Select, MoveToRelativeLine = ref2.MoveToRelativeLine;

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
      var ref3;
      this.vimState = vimState;
      ref3 = this.vimState, this.editor = ref3.editor, this.editorElement = ref3.editorElement, this.modeManager = ref3.modeManager;
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
      var ref3;
      this.resetCount();
      this.stack = [];
      this.processing = false;
      this.vimState.emitDidResetOperationStack();
      if ((ref3 = this.operationSubscriptions) != null) {
        ref3.dispose();
      }
      return this.operationSubscriptions = new CompositeDisposable;
    };

    OperationStack.prototype.destroy = function() {
      var ref3, ref4;
      this.subscriptions.dispose();
      if ((ref3 = this.operationSubscriptions) != null) {
        ref3.dispose();
      }
      return ref4 = {}, this.stack = ref4.stack, this.operationSubscriptions = ref4.operationSubscriptions, ref4;
    };

    OperationStack.prototype.peekTop = function() {
      return this.stack[this.stack.length - 1];
    };

    OperationStack.prototype.isEmpty = function() {
      return this.stack.length === 0;
    };

    OperationStack.prototype.run = function(klass, properties) {
      var $selection, error, i, isValidOperation, len, operation, ref3, ref4, type;
      if (this.mode === 'visual') {
        ref3 = swrap.getSelections(this.editor);
        for (i = 0, len = ref3.length; i < len; i++) {
          $selection = ref3[i];
          if (!$selection.hasProperties()) {
            $selection.saveProperties();
          }
        }
      }
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
          if (((ref4 = this.peekTop()) != null ? ref4.constructor : void 0) === klass) {
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
      var count, operation, ref3;
      if (operation = this.recordedOperation) {
        operation.repeated = true;
        if (this.hasCount()) {
          count = this.getCount();
          operation.count = count;
          if ((ref3 = operation.target) != null) {
            ref3.count = count;
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
      operation.repeated = true;
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
      var ref3;
      if ((ref3 = this.mode) !== 'visual' && ref3 !== 'insert') {
        this.vimState.resetNormalMode();
        this.vimState.restoreOriginalCursorPosition();
      }
      return this.finish();
    };

    OperationStack.prototype.finish = function(operation) {
      if (operation == null) {
        operation = null;
      }
      if (operation != null ? operation.recordable : void 0) {
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
      if (haveSomeNonEmptySelection(this.editor)) {
        if (this.vimState.getConfig('strictAssertion')) {
          assertWithException(false, "Have some non-empty selection in normal-mode: " + (operation.toString()));
        }
        return this.vimState.clearSelections();
      }
    };

    OperationStack.prototype.ensureAllCursorsAreNotAtEndOfLine = function() {
      var cursor, i, len, ref3, results;
      ref3 = this.editor.getCursors();
      results = [];
      for (i = 0, len = ref3.length; i < len; i++) {
        cursor = ref3[i];
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
      var ref3, ref4;
      if (this.hasCount()) {
        return ((ref3 = this.count['normal']) != null ? ref3 : 1) * ((ref4 = this.count['operator-pending']) != null ? ref4 : 1);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdGlvbi1zdGFjay5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQW9DLE9BQUEsQ0FBUSxNQUFSLENBQXBDLEVBQUMsMkJBQUQsRUFBYTs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsT0FBbUUsT0FBQSxDQUFRLFNBQVIsQ0FBbkUsRUFBQyxvQ0FBRCxFQUFpQiwwREFBakIsRUFBNEM7O0VBQzVDLE9BQStCLEVBQS9CLEVBQUMsb0JBQUQsRUFBUzs7RUFDUix3QkFBeUIsT0FBQSxDQUFRLFVBQVI7O0VBQzFCLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBWUY7SUFDSixNQUFNLENBQUMsY0FBUCxDQUFzQixjQUFDLENBQUEsU0FBdkIsRUFBa0MsTUFBbEMsRUFBMEM7TUFBQSxHQUFBLEVBQUssU0FBQTtlQUFHLElBQUMsQ0FBQSxXQUFXLENBQUM7TUFBaEIsQ0FBTDtLQUExQzs7SUFDQSxNQUFNLENBQUMsY0FBUCxDQUFzQixjQUFDLENBQUEsU0FBdkIsRUFBa0MsU0FBbEMsRUFBNkM7TUFBQSxHQUFBLEVBQUssU0FBQTtlQUFHLElBQUMsQ0FBQSxXQUFXLENBQUM7TUFBaEIsQ0FBTDtLQUE3Qzs7SUFFYSx3QkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osT0FBMEMsSUFBQyxDQUFBLFFBQTNDLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQSxhQUFYLEVBQTBCLElBQUMsQ0FBQSxtQkFBQTtNQUUzQixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFB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QVAsR0FBaUI7QUE3T2pCIiwic291cmNlc0NvbnRlbnQiOlsie0Rpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG57bW92ZUN1cnNvckxlZnQsIGhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24sIGFzc2VydFdpdGhFeGNlcHRpb259ID0gcmVxdWlyZSAnLi91dGlscydcbntTZWxlY3QsIE1vdmVUb1JlbGF0aXZlTGluZX0gPSB7fVxue09wZXJhdGlvbkFib3J0ZWRFcnJvcn0gPSByZXF1aXJlICcuL2Vycm9ycydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcblxuIyBvcHJhdGlvbiBsaWZlIGluIG9wZXJhdGlvblN0YWNrXG4jIDEuIHJ1blxuIyAgICBpbnN0YW50aWF0ZWQgYnkgbmV3LlxuIyAgICBjb21wbGltZW50IGltcGxpY2l0IE9wZXJhdG9yLlNlbGVjdCBvcGVyYXRvciBpZiBuZWNlc3NhcnkuXG4jICAgIHB1c2ggb3BlcmF0aW9uIHRvIHN0YWNrLlxuIyAyLiBwcm9jZXNzXG4jICAgIHJlZHVjZSBzdGFjayBieSwgcG9wcGluZyB0b3Agb2Ygc3RhY2sgdGhlbiBzZXQgaXQgYXMgdGFyZ2V0IG9mIG5ldyB0b3AuXG4jICAgIGNoZWNrIGlmIHJlbWFpbmluZyB0b3Agb2Ygc3RhY2sgaXMgZXhlY3V0YWJsZSBieSBjYWxsaW5nIGlzQ29tcGxldGUoKVxuIyAgICBpZiBleGVjdXRhYmxlLCB0aGVuIHBvcCBzdGFjayB0aGVuIGV4ZWN1dGUocG9wcGVkT3BlcmF0aW9uKVxuIyAgICBpZiBub3QgZXhlY3V0YWJsZSwgZW50ZXIgXCJvcGVyYXRvci1wZW5kaW5nLW1vZGVcIlxuY2xhc3MgT3BlcmF0aW9uU3RhY2tcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsICdtb2RlJywgZ2V0OiAtPiBAbW9kZU1hbmFnZXIubW9kZVxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgJ3N1Ym1vZGUnLCBnZXQ6IC0+IEBtb2RlTWFuYWdlci5zdWJtb2RlXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAbW9kZU1hbmFnZXJ9ID0gQHZpbVN0YXRlXG5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcblxuICAgIFNlbGVjdCA/PSBCYXNlLmdldENsYXNzKCdTZWxlY3QnKVxuICAgIE1vdmVUb1JlbGF0aXZlTGluZSA/PSBCYXNlLmdldENsYXNzKCdNb3ZlVG9SZWxhdGl2ZUxpbmUnKVxuXG4gICAgQHJlc2V0KClcblxuICAjIFJldHVybiBoYW5kbGVyXG4gIHN1YnNjcmliZTogKGhhbmRsZXIpIC0+XG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnMuYWRkKGhhbmRsZXIpXG4gICAgcmV0dXJuIGhhbmRsZXIgIyBET05UIFJFTU9WRVxuXG4gIHJlc2V0OiAtPlxuICAgIEByZXNldENvdW50KClcbiAgICBAc3RhY2sgPSBbXVxuICAgIEBwcm9jZXNzaW5nID0gZmFsc2VcblxuICAgICMgdGhpcyBoYXMgdG8gYmUgQkVGT1JFIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEB2aW1TdGF0ZS5lbWl0RGlkUmVzZXRPcGVyYXRpb25TdGFjaygpXG5cbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIHtAc3RhY2ssIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zfSA9IHt9XG5cbiAgcGVla1RvcDogLT5cbiAgICBAc3RhY2tbQHN0YWNrLmxlbmd0aCAtIDFdXG5cbiAgaXNFbXB0eTogLT5cbiAgICBAc3RhY2subGVuZ3RoIGlzIDBcblxuICAjIE1haW5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHJ1bjogKGtsYXNzLCBwcm9wZXJ0aWVzKSAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBmb3IgJHNlbGVjdGlvbiBpbiBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpIHdoZW4gbm90ICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG4gICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuXG4gICAgdHJ5XG4gICAgICBAdmltU3RhdGUuaW5pdCgpIGlmIEBpc0VtcHR5KClcbiAgICAgIHR5cGUgPSB0eXBlb2Yoa2xhc3MpXG4gICAgICBpZiB0eXBlIGlzICdvYmplY3QnICMgLiByZXBlYXQgY2FzZSB3ZSBjYW4gZXhlY3V0ZSBhcy1pdC1pcy5cbiAgICAgICAgb3BlcmF0aW9uID0ga2xhc3NcbiAgICAgIGVsc2VcbiAgICAgICAga2xhc3MgPSBCYXNlLmdldENsYXNzKGtsYXNzKSBpZiB0eXBlIGlzICdzdHJpbmcnXG4gICAgICAgICMgUmVwbGFjZSBvcGVyYXRvciB3aGVuIGlkZW50aWNhbCBvbmUgcmVwZWF0ZWQsIGUuZy4gYGRkYCwgYGNjYCwgYGdVZ1VgXG4gICAgICAgIGlmIEBwZWVrVG9wKCk/LmNvbnN0cnVjdG9yIGlzIGtsYXNzXG4gICAgICAgICAgb3BlcmF0aW9uID0gbmV3IE1vdmVUb1JlbGF0aXZlTGluZShAdmltU3RhdGUpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvcGVyYXRpb24gPSBuZXcga2xhc3MoQHZpbVN0YXRlLCBwcm9wZXJ0aWVzKVxuXG4gICAgICBpZiBAaXNFbXB0eSgpXG4gICAgICAgIGlzVmFsaWRPcGVyYXRpb24gPSB0cnVlXG4gICAgICAgIGlmIChAbW9kZSBpcyAndmlzdWFsJyBhbmQgb3BlcmF0aW9uLmlzTW90aW9uKCkpIG9yIG9wZXJhdGlvbi5pc1RleHRPYmplY3QoKVxuICAgICAgICAgIG9wZXJhdGlvbiA9IG5ldyBTZWxlY3QoQHZpbVN0YXRlKS5zZXRUYXJnZXQob3BlcmF0aW9uKVxuICAgICAgZWxzZVxuICAgICAgICBpc1ZhbGlkT3BlcmF0aW9uID0gQHBlZWtUb3AoKS5pc09wZXJhdG9yKCkgYW5kIChvcGVyYXRpb24uaXNNb3Rpb24oKSBvciBvcGVyYXRpb24uaXNUZXh0T2JqZWN0KCkpXG5cbiAgICAgIGlmIGlzVmFsaWRPcGVyYXRpb25cbiAgICAgICAgQHN0YWNrLnB1c2gob3BlcmF0aW9uKVxuICAgICAgICBAcHJvY2VzcygpXG4gICAgICBlbHNlXG4gICAgICAgIEB2aW1TdGF0ZS5lbWl0RGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2soKVxuICAgICAgICBAdmltU3RhdGUucmVzZXROb3JtYWxNb2RlKClcbiAgICBjYXRjaCBlcnJvclxuICAgICAgQGhhbmRsZUVycm9yKGVycm9yKVxuXG4gIHJ1blJlY29yZGVkOiAtPlxuICAgIGlmIG9wZXJhdGlvbiA9IEByZWNvcmRlZE9wZXJhdGlvblxuICAgICAgb3BlcmF0aW9uLnJlcGVhdGVkID0gdHJ1ZVxuICAgICAgaWYgQGhhc0NvdW50KClcbiAgICAgICAgY291bnQgPSBAZ2V0Q291bnQoKVxuICAgICAgICBvcGVyYXRpb24uY291bnQgPSBjb3VudFxuICAgICAgICBvcGVyYXRpb24udGFyZ2V0Py5jb3VudCA9IGNvdW50ICMgU29tZSBvcGVhcnRvciBoYXZlIG5vIHRhcmdldCBsaWtlIGN0cmwtYShpbmNyZWFzZSkuXG5cbiAgICAgIG9wZXJhdGlvbi5zdWJzY3JpYmVSZXNldE9jY3VycmVuY2VQYXR0ZXJuSWZOZWVkZWQoKVxuICAgICAgQHJ1bihvcGVyYXRpb24pXG5cbiAgcnVuUmVjb3JkZWRNb3Rpb246IChrZXksIHtyZXZlcnNlfT17fSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIG9wZXJhdGlvbiA9IEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoa2V5KVxuXG4gICAgb3BlcmF0aW9uID0gb3BlcmF0aW9uLmNsb25lKEB2aW1TdGF0ZSlcbiAgICBvcGVyYXRpb24ucmVwZWF0ZWQgPSB0cnVlXG4gICAgb3BlcmF0aW9uLnJlc2V0Q291bnQoKVxuICAgIGlmIHJldmVyc2VcbiAgICAgIG9wZXJhdGlvbi5iYWNrd2FyZHMgPSBub3Qgb3BlcmF0aW9uLmJhY2t3YXJkc1xuICAgIEBydW4ob3BlcmF0aW9uKVxuXG4gIHJ1bkN1cnJlbnRGaW5kOiAob3B0aW9ucykgLT5cbiAgICBAcnVuUmVjb3JkZWRNb3Rpb24oJ2N1cnJlbnRGaW5kJywgb3B0aW9ucylcblxuICBydW5DdXJyZW50U2VhcmNoOiAob3B0aW9ucykgLT5cbiAgICBAcnVuUmVjb3JkZWRNb3Rpb24oJ2N1cnJlbnRTZWFyY2gnLCBvcHRpb25zKVxuXG4gIGhhbmRsZUVycm9yOiAoZXJyb3IpIC0+XG4gICAgQHZpbVN0YXRlLnJlc2V0KClcbiAgICB1bmxlc3MgZXJyb3IgaW5zdGFuY2VvZiBPcGVyYXRpb25BYm9ydGVkRXJyb3JcbiAgICAgIHRocm93IGVycm9yXG5cbiAgaXNQcm9jZXNzaW5nOiAtPlxuICAgIEBwcm9jZXNzaW5nXG5cbiAgcHJvY2VzczogLT5cbiAgICBAcHJvY2Vzc2luZyA9IHRydWVcbiAgICBpZiBAc3RhY2subGVuZ3RoIGlzIDJcbiAgICAgICMgW0ZJWE1FIGlkZWFsbHldXG4gICAgICAjIElmIHRhcmdldCBpcyBub3QgY29tcGxldGUsIHdlIHBvc3Rwb25lIGNvbXBvc2luZyB0YXJnZXQgd2l0aCBvcGVyYXRvciB0byBrZWVwIHNpdHVhdGlvbiBzaW1wbGUuXG4gICAgICAjIFNvIHRoYXQgd2UgY2FuIGFzc3VtZSB3aGVuIHRhcmdldCBpcyBzZXQgdG8gb3BlcmF0b3IgaXQncyBjb21wbGV0ZS5cbiAgICAgICMgZS5nLiBgeSBzIHQgYScoc3Vycm91bmQgZm9yIHJhbmdlIGZyb20gaGVyZSB0byB0aWxsIGEpXG4gICAgICByZXR1cm4gdW5sZXNzIEBwZWVrVG9wKCkuaXNDb21wbGV0ZSgpXG5cbiAgICAgIG9wZXJhdGlvbiA9IEBzdGFjay5wb3AoKVxuICAgICAgQHBlZWtUb3AoKS5zZXRUYXJnZXQob3BlcmF0aW9uKVxuXG4gICAgdG9wID0gQHBlZWtUb3AoKVxuXG4gICAgaWYgdG9wLmlzQ29tcGxldGUoKVxuICAgICAgQGV4ZWN1dGUoQHN0YWNrLnBvcCgpKVxuICAgIGVsc2VcbiAgICAgIGlmIEBtb2RlIGlzICdub3JtYWwnIGFuZCB0b3AuaXNPcGVyYXRvcigpXG4gICAgICAgIEBtb2RlTWFuYWdlci5hY3RpdmF0ZSgnb3BlcmF0b3ItcGVuZGluZycpXG5cbiAgICAgICMgVGVtcG9yYXJ5IHNldCB3aGlsZSBjb21tYW5kIGlzIHJ1bm5pbmdcbiAgICAgIGlmIGNvbW1hbmROYW1lID0gdG9wLmNvbnN0cnVjdG9yLmdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeD8oKVxuICAgICAgICBAYWRkVG9DbGFzc0xpc3QoY29tbWFuZE5hbWUgKyBcIi1wZW5kaW5nXCIpXG5cbiAgZXhlY3V0ZTogKG9wZXJhdGlvbikgLT5cbiAgICBleGVjdXRpb24gPSBvcGVyYXRpb24uZXhlY3V0ZSgpXG4gICAgaWYgZXhlY3V0aW9uIGluc3RhbmNlb2YgUHJvbWlzZVxuICAgICAgZXhlY3V0aW9uXG4gICAgICAgIC50aGVuID0+IEBmaW5pc2gob3BlcmF0aW9uKVxuICAgICAgICAuY2F0Y2ggPT4gQGhhbmRsZUVycm9yKClcbiAgICBlbHNlXG4gICAgICBAZmluaXNoKG9wZXJhdGlvbilcblxuICBjYW5jZWw6IC0+XG4gICAgaWYgQG1vZGUgbm90IGluIFsndmlzdWFsJywgJ2luc2VydCddXG4gICAgICBAdmltU3RhdGUucmVzZXROb3JtYWxNb2RlKClcbiAgICAgIEB2aW1TdGF0ZS5yZXN0b3JlT3JpZ2luYWxDdXJzb3JQb3NpdGlvbigpXG4gICAgQGZpbmlzaCgpXG5cbiAgZmluaXNoOiAob3BlcmF0aW9uPW51bGwpIC0+XG4gICAgQHJlY29yZGVkT3BlcmF0aW9uID0gb3BlcmF0aW9uIGlmIG9wZXJhdGlvbj8ucmVjb3JkYWJsZVxuICAgIEB2aW1TdGF0ZS5lbWl0RGlkRmluaXNoT3BlcmF0aW9uKClcbiAgICBpZiBvcGVyYXRpb24/LmlzT3BlcmF0b3IoKVxuICAgICAgb3BlcmF0aW9uLnJlc2V0U3RhdGUoKVxuXG4gICAgaWYgQG1vZGUgaXMgJ25vcm1hbCdcbiAgICAgIEBlbnN1cmVBbGxTZWxlY3Rpb25zQXJlRW1wdHkob3BlcmF0aW9uKVxuICAgICAgQGVuc3VyZUFsbEN1cnNvcnNBcmVOb3RBdEVuZE9mTGluZSgpXG4gICAgZWxzZSBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQG1vZGVNYW5hZ2VyLnVwZGF0ZU5hcnJvd2VkU3RhdGUoKVxuICAgICAgQHZpbVN0YXRlLnVwZGF0ZVByZXZpb3VzU2VsZWN0aW9uKClcblxuICAgIEB2aW1TdGF0ZS51cGRhdGVDdXJzb3JzVmlzaWJpbGl0eSgpXG4gICAgQHZpbVN0YXRlLnJlc2V0KClcblxuICBlbnN1cmVBbGxTZWxlY3Rpb25zQXJlRW1wdHk6IChvcGVyYXRpb24pIC0+XG4gICAgIyBXaGVuIEB2aW1TdGF0ZS5zZWxlY3RCbG9ja3dpc2UoKSBpcyBjYWxsZWQgaW4gbm9uLXZpc3VhbC1tb2RlLlxuICAgICMgZS5nLiBgLmAgcmVwZWF0IG9mIG9wZXJhdGlvbiB0YXJnZXRlZCBibG9ja3dpc2UgYEN1cnJlbnRTZWxlY3Rpb25gLlxuICAgICMgV2UgbmVlZCB0byBtYW51YWxseSBjbGVhciBibG9ja3dpc2VTZWxlY3Rpb24uXG4gICAgIyBTZWUgIzY0N1xuICAgIEB2aW1TdGF0ZS5jbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnMoKSAjIEZJWE1FLCBzaG91bGQgYmUgcmVtb3ZlZFxuICAgIGlmIGhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24oQGVkaXRvcilcbiAgICAgIGlmIEB2aW1TdGF0ZS5nZXRDb25maWcoJ3N0cmljdEFzc2VydGlvbicpXG4gICAgICAgIGFzc2VydFdpdGhFeGNlcHRpb24oZmFsc2UsIFwiSGF2ZSBzb21lIG5vbi1lbXB0eSBzZWxlY3Rpb24gaW4gbm9ybWFsLW1vZGU6ICN7b3BlcmF0aW9uLnRvU3RyaW5nKCl9XCIpXG4gICAgICBAdmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcblxuICBlbnN1cmVBbGxDdXJzb3JzQXJlTm90QXRFbmRPZkxpbmU6IC0+XG4gICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKSB3aGVuIGN1cnNvci5pc0F0RW5kT2ZMaW5lKClcbiAgICAgIG1vdmVDdXJzb3JMZWZ0KGN1cnNvciwgcHJlc2VydmVHb2FsQ29sdW1uOiB0cnVlKVxuXG4gIGFkZFRvQ2xhc3NMaXN0OiAoY2xhc3NOYW1lKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKVxuICAgIEBzdWJzY3JpYmUgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKVxuXG4gICMgQ291bnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMga2V5c3Ryb2tlIGAzZDJ3YCBkZWxldGUgNigzKjIpIHdvcmRzLlxuICAjICAybmQgbnVtYmVyKDIgaW4gdGhpcyBjYXNlKSBpcyBhbHdheXMgZW50ZXJkIGluIG9wZXJhdG9yLXBlbmRpbmctbW9kZS5cbiAgIyAgU28gY291bnQgaGF2ZSB0d28gdGltaW5nIHRvIGJlIGVudGVyZWQuIHRoYXQncyB3aHkgaGVyZSB3ZSBtYW5hZ2UgY291bnRlciBieSBtb2RlLlxuICBoYXNDb3VudDogLT5cbiAgICBAY291bnRbJ25vcm1hbCddPyBvciBAY291bnRbJ29wZXJhdG9yLXBlbmRpbmcnXT9cblxuICBnZXRDb3VudDogLT5cbiAgICBpZiBAaGFzQ291bnQoKVxuICAgICAgKEBjb3VudFsnbm9ybWFsJ10gPyAxKSAqIChAY291bnRbJ29wZXJhdG9yLXBlbmRpbmcnXSA/IDEpXG4gICAgZWxzZVxuICAgICAgbnVsbFxuXG4gIHNldENvdW50OiAobnVtYmVyKSAtPlxuICAgIG1vZGUgPSAnbm9ybWFsJ1xuICAgIG1vZGUgPSBAbW9kZSBpZiBAbW9kZSBpcyAnb3BlcmF0b3ItcGVuZGluZydcbiAgICBAY291bnRbbW9kZV0gPz0gMFxuICAgIEBjb3VudFttb2RlXSA9IChAY291bnRbbW9kZV0gKiAxMCkgKyBudW1iZXJcbiAgICBAdmltU3RhdGUuaG92ZXIuc2V0KEBidWlsZENvdW50U3RyaW5nKCkpXG4gICAgQHZpbVN0YXRlLnRvZ2dsZUNsYXNzTGlzdCgnd2l0aC1jb3VudCcsIHRydWUpXG5cbiAgYnVpbGRDb3VudFN0cmluZzogLT5cbiAgICBbQGNvdW50Wydub3JtYWwnXSwgQGNvdW50WydvcGVyYXRvci1wZW5kaW5nJ11dXG4gICAgICAuZmlsdGVyIChjb3VudCkgLT4gY291bnQ/XG4gICAgICAubWFwIChjb3VudCkgLT4gU3RyaW5nKGNvdW50KVxuICAgICAgLmpvaW4oJ3gnKVxuXG4gIHJlc2V0Q291bnQ6IC0+XG4gICAgQGNvdW50ID0ge31cbiAgICBAdmltU3RhdGUudG9nZ2xlQ2xhc3NMaXN0KCd3aXRoLWNvdW50JywgZmFsc2UpXG5cbm1vZHVsZS5leHBvcnRzID0gT3BlcmF0aW9uU3RhY2tcbiJdfQ==
