(function() {
  var Base, CompositeDisposable, Disposable, MoveToRelativeLine, OperationAbortedError, OperationStack, Select, ref, ref1;

  ref = require('atom'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  ref1 = [], OperationAbortedError = ref1[0], Select = ref1[1], MoveToRelativeLine = ref1[2];

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
      ref2 = this.vimState, this.editor = ref2.editor, this.editorElement = ref2.editorElement, this.modeManager = ref2.modeManager, this.swrap = ref2.swrap;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
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

    OperationStack.prototype.newMoveToRelativeLine = function() {
      if (MoveToRelativeLine == null) {
        MoveToRelativeLine = Base.getClass('MoveToRelativeLine');
      }
      return new MoveToRelativeLine(this.vimState);
    };

    OperationStack.prototype.newSelectWithTarget = function(target) {
      if (Select == null) {
        Select = Base.getClass('Select');
      }
      return new Select(this.vimState).setTarget(target);
    };

    OperationStack.prototype.run = function(klass, properties) {
      var $selection, error, i, len, operation, ref2, ref3, type;
      if (this.mode === 'visual') {
        ref2 = this.swrap.getSelections(this.editor);
        for (i = 0, len = ref2.length; i < len; i++) {
          $selection = ref2[i];
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
          if (((ref3 = this.peekTop()) != null ? ref3.constructor : void 0) === klass) {
            operation = this.newMoveToRelativeLine();
          } else {
            operation = new klass(this.vimState, properties);
          }
        }
        switch (false) {
          case !this.isEmpty():
            if ((this.mode === 'visual' && operation.isMotion()) || operation.isTextObject()) {
              operation = this.newSelectWithTarget(operation);
            }
            this.stack.push(operation);
            return this.process();
          case !(this.peekTop().isOperator() && (operation.isMotion() || operation.isTextObject())):
            this.stack.push(operation);
            return this.process();
          default:
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
        operation.repeated = true;
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
      if (OperationAbortedError == null) {
        OperationAbortedError = require('./errors');
      }
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
      this.vimState.cursorStyleManager.refresh();
      return this.vimState.reset();
    };

    OperationStack.prototype.ensureAllSelectionsAreEmpty = function(operation) {
      this.vimState.clearBlockwiseSelections();
      if (this.vimState.haveSomeNonEmptySelection()) {
        if (this.vimState.getConfig('strictAssertion')) {
          this.vimState.utils.assertWithException(false, "Have some non-empty selection in normal-mode: " + (operation.toString()));
        }
        return this.vimState.clearSelections();
      }
    };

    OperationStack.prototype.ensureAllCursorsAreNotAtEndOfLine = function() {
      var cursor, i, len, ref2, results;
      ref2 = this.editor.getCursors();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        if (cursor.isAtEndOfLine()) {
          results.push(this.vimState.utils.moveCursorLeft(cursor, {
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
      return this.editorElement.classList.toggle('with-count', true);
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
      return this.editorElement.classList.remove('with-count');
    };

    return OperationStack;

  })();

  module.exports = OperationStack;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdGlvbi1zdGFjay5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQW9DLE9BQUEsQ0FBUSxNQUFSLENBQXBDLEVBQUMsMkJBQUQsRUFBYTs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBRVAsT0FBc0QsRUFBdEQsRUFBQywrQkFBRCxFQUF3QixnQkFBeEIsRUFBZ0M7O0VBWTFCO0lBQ0osTUFBTSxDQUFDLGNBQVAsQ0FBc0IsY0FBQyxDQUFBLFNBQXZCLEVBQWtDLE1BQWxDLEVBQTBDO01BQUEsR0FBQSxFQUFLLFNBQUE7ZUFBRyxJQUFDLENBQUEsV0FBVyxDQUFDO01BQWhCLENBQUw7S0FBMUM7O0lBQ0EsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsY0FBQyxDQUFBLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDO01BQUEsR0FBQSxFQUFLLFNBQUE7ZUFBRyxJQUFDLENBQUEsV0FBVyxDQUFDO01BQWhCLENBQUw7S0FBN0M7O0lBRWEsd0JBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDtNQUNaLE9BQWtELElBQUMsQ0FBQSxRQUFuRCxFQUFDLElBQUMsQ0FBQSxjQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEscUJBQUEsYUFBWCxFQUEwQixJQUFDLENBQUEsbUJBQUEsV0FBM0IsRUFBd0MsSUFBQyxDQUFBLGFBQUE7TUFFekMsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBbkI7TUFFQSxJQUFDLENBQUEsS0FBRCxDQUFBO0lBTlc7OzZCQVNiLFNB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TyxLQUFQO01BQVgsQ0FGUCxDQUdFLENBQUMsSUFISCxDQUdRLEdBSFI7SUFEZ0I7OzZCQU1sQixVQUFBLEdBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxLQUFELEdBQVM7YUFDVCxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUF6QixDQUFnQyxZQUFoQztJQUZVOzs7Ozs7RUFJZCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQWpQakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcblxuW09wZXJhdGlvbkFib3J0ZWRFcnJvciwgU2VsZWN0LCBNb3ZlVG9SZWxhdGl2ZUxpbmVdID0gW11cblxuIyBvcHJhdGlvbiBsaWZlIGluIG9wZXJhdGlvblN0YWNrXG4jIDEuIHJ1blxuIyAgICBpbnN0YW50aWF0ZWQgYnkgbmV3LlxuIyAgICBjb21wbGltZW50IGltcGxpY2l0IE9wZXJhdG9yLlNlbGVjdCBvcGVyYXRvciBpZiBuZWNlc3NhcnkuXG4jICAgIHB1c2ggb3BlcmF0aW9uIHRvIHN0YWNrLlxuIyAyLiBwcm9jZXNzXG4jICAgIHJlZHVjZSBzdGFjayBieSwgcG9wcGluZyB0b3Agb2Ygc3RhY2sgdGhlbiBzZXQgaXQgYXMgdGFyZ2V0IG9mIG5ldyB0b3AuXG4jICAgIGNoZWNrIGlmIHJlbWFpbmluZyB0b3Agb2Ygc3RhY2sgaXMgZXhlY3V0YWJsZSBieSBjYWxsaW5nIGlzQ29tcGxldGUoKVxuIyAgICBpZiBleGVjdXRhYmxlLCB0aGVuIHBvcCBzdGFjayB0aGVuIGV4ZWN1dGUocG9wcGVkT3BlcmF0aW9uKVxuIyAgICBpZiBub3QgZXhlY3V0YWJsZSwgZW50ZXIgXCJvcGVyYXRvci1wZW5kaW5nLW1vZGVcIlxuY2xhc3MgT3BlcmF0aW9uU3RhY2tcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsICdtb2RlJywgZ2V0OiAtPiBAbW9kZU1hbmFnZXIubW9kZVxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgJ3N1Ym1vZGUnLCBnZXQ6IC0+IEBtb2RlTWFuYWdlci5zdWJtb2RlXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAbW9kZU1hbmFnZXIsIEBzd3JhcH0gPSBAdmltU3RhdGVcblxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gICAgQHJlc2V0KClcblxuICAjIFJldHVybiBoYW5kbGVyXG4gIHN1YnNjcmliZTogKGhhbmRsZXIpIC0+XG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnMuYWRkKGhhbmRsZXIpXG4gICAgcmV0dXJuIGhhbmRsZXIgIyBET05UIFJFTU9WRVxuXG4gIHJlc2V0OiAtPlxuICAgIEByZXNldENvdW50KClcbiAgICBAc3RhY2sgPSBbXVxuICAgIEBwcm9jZXNzaW5nID0gZmFsc2VcblxuICAgICMgdGhpcyBoYXMgdG8gYmUgQkVGT1JFIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEB2aW1TdGF0ZS5lbWl0RGlkUmVzZXRPcGVyYXRpb25TdGFjaygpXG5cbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIHtAc3RhY2ssIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zfSA9IHt9XG5cbiAgcGVla1RvcDogLT5cbiAgICBAc3RhY2tbQHN0YWNrLmxlbmd0aCAtIDFdXG5cbiAgaXNFbXB0eTogLT5cbiAgICBAc3RhY2subGVuZ3RoIGlzIDBcblxuICBuZXdNb3ZlVG9SZWxhdGl2ZUxpbmU6IC0+XG4gICAgTW92ZVRvUmVsYXRpdmVMaW5lID89IEJhc2UuZ2V0Q2xhc3MoJ01vdmVUb1JlbGF0aXZlTGluZScpXG4gICAgbmV3IE1vdmVUb1JlbGF0aXZlTGluZShAdmltU3RhdGUpXG5cbiAgbmV3U2VsZWN0V2l0aFRhcmdldDogKHRhcmdldCkgLT5cbiAgICBTZWxlY3QgPz0gQmFzZS5nZXRDbGFzcygnU2VsZWN0JylcbiAgICBuZXcgU2VsZWN0KEB2aW1TdGF0ZSkuc2V0VGFyZ2V0KHRhcmdldClcblxuICAjIE1haW5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHJ1bjogKGtsYXNzLCBwcm9wZXJ0aWVzKSAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBmb3IgJHNlbGVjdGlvbiBpbiBAc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKSB3aGVuIG5vdCAkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKVxuICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcblxuICAgIHRyeVxuICAgICAgQHZpbVN0YXRlLmluaXQoKSBpZiBAaXNFbXB0eSgpXG4gICAgICB0eXBlID0gdHlwZW9mKGtsYXNzKVxuICAgICAgaWYgdHlwZSBpcyAnb2JqZWN0JyAjIC4gcmVwZWF0IGNhc2Ugd2UgY2FuIGV4ZWN1dGUgYXMtaXQtaXMuXG4gICAgICAgIG9wZXJhdGlvbiA9IGtsYXNzXG4gICAgICBlbHNlXG4gICAgICAgIGtsYXNzID0gQmFzZS5nZXRDbGFzcyhrbGFzcykgaWYgdHlwZSBpcyAnc3RyaW5nJ1xuXG4gICAgICAgICMgUmVwbGFjZSBvcGVyYXRvciB3aGVuIGlkZW50aWNhbCBvbmUgcmVwZWF0ZWQsIGUuZy4gYGRkYCwgYGNjYCwgYGdVZ1VgXG4gICAgICAgIGlmIEBwZWVrVG9wKCk/LmNvbnN0cnVjdG9yIGlzIGtsYXNzXG4gICAgICAgICAgb3BlcmF0aW9uID0gQG5ld01vdmVUb1JlbGF0aXZlTGluZSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvcGVyYXRpb24gPSBuZXcga2xhc3MoQHZpbVN0YXRlLCBwcm9wZXJ0aWVzKVxuXG4gICAgICBzd2l0Y2hcbiAgICAgICAgd2hlbiBAaXNFbXB0eSgpXG4gICAgICAgICAgaWYgKEBtb2RlIGlzICd2aXN1YWwnIGFuZCBvcGVyYXRpb24uaXNNb3Rpb24oKSkgb3Igb3BlcmF0aW9uLmlzVGV4dE9iamVjdCgpXG4gICAgICAgICAgICBvcGVyYXRpb24gPSBAbmV3U2VsZWN0V2l0aFRhcmdldChvcGVyYXRpb24pXG4gICAgICAgICAgQHN0YWNrLnB1c2gob3BlcmF0aW9uKVxuICAgICAgICAgIEBwcm9jZXNzKClcbiAgICAgICAgd2hlbiBAcGVla1RvcCgpLmlzT3BlcmF0b3IoKSBhbmQgKG9wZXJhdGlvbi5pc01vdGlvbigpIG9yIG9wZXJhdGlvbi5pc1RleHRPYmplY3QoKSlcbiAgICAgICAgICBAc3RhY2sucHVzaChvcGVyYXRpb24pXG4gICAgICAgICAgQHByb2Nlc3MoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHZpbVN0YXRlLmVtaXREaWRGYWlsVG9QdXNoVG9PcGVyYXRpb25TdGFjaygpXG4gICAgICAgICAgQHZpbVN0YXRlLnJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIEBoYW5kbGVFcnJvcihlcnJvcilcblxuICBydW5SZWNvcmRlZDogLT5cbiAgICBpZiBvcGVyYXRpb24gPSBAcmVjb3JkZWRPcGVyYXRpb25cbiAgICAgIG9wZXJhdGlvbi5yZXBlYXRlZCA9IHRydWVcbiAgICAgIGlmIEBoYXNDb3VudCgpXG4gICAgICAgIGNvdW50ID0gQGdldENvdW50KClcbiAgICAgICAgb3BlcmF0aW9uLmNvdW50ID0gY291bnRcbiAgICAgICAgb3BlcmF0aW9uLnRhcmdldD8uY291bnQgPSBjb3VudCAjIFNvbWUgb3BlYXJ0b3IgaGF2ZSBubyB0YXJnZXQgbGlrZSBjdHJsLWEoaW5jcmVhc2UpLlxuXG4gICAgICBvcGVyYXRpb24uc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkKClcbiAgICAgIEBydW4ob3BlcmF0aW9uKVxuXG4gIHJ1blJlY29yZGVkTW90aW9uOiAoa2V5LCB7cmV2ZXJzZX09e30pIC0+XG4gICAgcmV0dXJuIHVubGVzcyBvcGVyYXRpb24gPSBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KGtleSlcblxuICAgIG9wZXJhdGlvbiA9IG9wZXJhdGlvbi5jbG9uZShAdmltU3RhdGUpXG4gICAgb3BlcmF0aW9uLnJlcGVhdGVkID0gdHJ1ZVxuICAgIG9wZXJhdGlvbi5yZXNldENvdW50KClcbiAgICBpZiByZXZlcnNlXG4gICAgICBvcGVyYXRpb24uYmFja3dhcmRzID0gbm90IG9wZXJhdGlvbi5iYWNrd2FyZHNcbiAgICBAcnVuKG9wZXJhdGlvbilcblxuICBydW5DdXJyZW50RmluZDogKG9wdGlvbnMpIC0+XG4gICAgQHJ1blJlY29yZGVkTW90aW9uKCdjdXJyZW50RmluZCcsIG9wdGlvbnMpXG5cbiAgcnVuQ3VycmVudFNlYXJjaDogKG9wdGlvbnMpIC0+XG4gICAgQHJ1blJlY29yZGVkTW90aW9uKCdjdXJyZW50U2VhcmNoJywgb3B0aW9ucylcblxuICBoYW5kbGVFcnJvcjogKGVycm9yKSAtPlxuICAgIEB2aW1TdGF0ZS5yZXNldCgpXG4gICAgT3BlcmF0aW9uQWJvcnRlZEVycm9yID89IHJlcXVpcmUgJy4vZXJyb3JzJ1xuICAgIHVubGVzcyBlcnJvciBpbnN0YW5jZW9mIE9wZXJhdGlvbkFib3J0ZWRFcnJvclxuICAgICAgdGhyb3cgZXJyb3JcblxuICBpc1Byb2Nlc3Npbmc6IC0+XG4gICAgQHByb2Nlc3NpbmdcblxuICBwcm9jZXNzOiAtPlxuICAgIEBwcm9jZXNzaW5nID0gdHJ1ZVxuICAgIGlmIEBzdGFjay5sZW5ndGggaXMgMlxuICAgICAgIyBbRklYTUUgaWRlYWxseV1cbiAgICAgICMgSWYgdGFyZ2V0IGlzIG5vdCBjb21wbGV0ZSwgd2UgcG9zdHBvbmUgY29tcG9zaW5nIHRhcmdldCB3aXRoIG9wZXJhdG9yIHRvIGtlZXAgc2l0dWF0aW9uIHNpbXBsZS5cbiAgICAgICMgU28gdGhhdCB3ZSBjYW4gYXNzdW1lIHdoZW4gdGFyZ2V0IGlzIHNldCB0byBvcGVyYXRvciBpdCdzIGNvbXBsZXRlLlxuICAgICAgIyBlLmcuIGB5IHMgdCBhJyhzdXJyb3VuZCBmb3IgcmFuZ2UgZnJvbSBoZXJlIHRvIHRpbGwgYSlcbiAgICAgIHJldHVybiB1bmxlc3MgQHBlZWtUb3AoKS5pc0NvbXBsZXRlKClcblxuICAgICAgb3BlcmF0aW9uID0gQHN0YWNrLnBvcCgpXG4gICAgICBAcGVla1RvcCgpLnNldFRhcmdldChvcGVyYXRpb24pXG5cbiAgICB0b3AgPSBAcGVla1RvcCgpXG5cbiAgICBpZiB0b3AuaXNDb21wbGV0ZSgpXG4gICAgICBAZXhlY3V0ZShAc3RhY2sucG9wKCkpXG4gICAgZWxzZVxuICAgICAgaWYgQG1vZGUgaXMgJ25vcm1hbCcgYW5kIHRvcC5pc09wZXJhdG9yKClcbiAgICAgICAgQG1vZGVNYW5hZ2VyLmFjdGl2YXRlKCdvcGVyYXRvci1wZW5kaW5nJylcblxuICAgICAgIyBUZW1wb3Jhcnkgc2V0IHdoaWxlIGNvbW1hbmQgaXMgcnVubmluZ1xuICAgICAgaWYgY29tbWFuZE5hbWUgPSB0b3AuY29uc3RydWN0b3IuZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4PygpXG4gICAgICAgIEBhZGRUb0NsYXNzTGlzdChjb21tYW5kTmFtZSArIFwiLXBlbmRpbmdcIilcblxuICBleGVjdXRlOiAob3BlcmF0aW9uKSAtPlxuICAgIGV4ZWN1dGlvbiA9IG9wZXJhdGlvbi5leGVjdXRlKClcbiAgICBpZiBleGVjdXRpb24gaW5zdGFuY2VvZiBQcm9taXNlXG4gICAgICBleGVjdXRpb25cbiAgICAgICAgLnRoZW4gPT4gQGZpbmlzaChvcGVyYXRpb24pXG4gICAgICAgIC5jYXRjaCA9PiBAaGFuZGxlRXJyb3IoKVxuICAgIGVsc2VcbiAgICAgIEBmaW5pc2gob3BlcmF0aW9uKVxuXG4gIGNhbmNlbDogLT5cbiAgICBpZiBAbW9kZSBub3QgaW4gWyd2aXN1YWwnLCAnaW5zZXJ0J11cbiAgICAgIEB2aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKVxuICAgICAgQHZpbVN0YXRlLnJlc3RvcmVPcmlnaW5hbEN1cnNvclBvc2l0aW9uKClcbiAgICBAZmluaXNoKClcblxuICBmaW5pc2g6IChvcGVyYXRpb249bnVsbCkgLT5cbiAgICBAcmVjb3JkZWRPcGVyYXRpb24gPSBvcGVyYXRpb24gaWYgb3BlcmF0aW9uPy5yZWNvcmRhYmxlXG4gICAgQHZpbVN0YXRlLmVtaXREaWRGaW5pc2hPcGVyYXRpb24oKVxuICAgIGlmIG9wZXJhdGlvbj8uaXNPcGVyYXRvcigpXG4gICAgICBvcGVyYXRpb24ucmVzZXRTdGF0ZSgpXG5cbiAgICBpZiBAbW9kZSBpcyAnbm9ybWFsJ1xuICAgICAgQGVuc3VyZUFsbFNlbGVjdGlvbnNBcmVFbXB0eShvcGVyYXRpb24pXG4gICAgICBAZW5zdXJlQWxsQ3Vyc29yc0FyZU5vdEF0RW5kT2ZMaW5lKClcbiAgICBlbHNlIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAbW9kZU1hbmFnZXIudXBkYXRlTmFycm93ZWRTdGF0ZSgpXG4gICAgICBAdmltU3RhdGUudXBkYXRlUHJldmlvdXNTZWxlY3Rpb24oKVxuXG4gICAgQHZpbVN0YXRlLmN1cnNvclN0eWxlTWFuYWdlci5yZWZyZXNoKClcbiAgICBAdmltU3RhdGUucmVzZXQoKVxuXG4gIGVuc3VyZUFsbFNlbGVjdGlvbnNBcmVFbXB0eTogKG9wZXJhdGlvbikgLT5cbiAgICAjIFdoZW4gQHZpbVN0YXRlLnNlbGVjdEJsb2Nrd2lzZSgpIGlzIGNhbGxlZCBpbiBub24tdmlzdWFsLW1vZGUuXG4gICAgIyBlLmcuIGAuYCByZXBlYXQgb2Ygb3BlcmF0aW9uIHRhcmdldGVkIGJsb2Nrd2lzZSBgQ3VycmVudFNlbGVjdGlvbmAuXG4gICAgIyBXZSBuZWVkIHRvIG1hbnVhbGx5IGNsZWFyIGJsb2Nrd2lzZVNlbGVjdGlvbi5cbiAgICAjIFNlZSAjNjQ3XG4gICAgQHZpbVN0YXRlLmNsZWFyQmxvY2t3aXNlU2VsZWN0aW9ucygpICMgRklYTUUsIHNob3VsZCBiZSByZW1vdmVkXG4gICAgaWYgQHZpbVN0YXRlLmhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24oKVxuICAgICAgaWYgQHZpbVN0YXRlLmdldENvbmZpZygnc3RyaWN0QXNzZXJ0aW9uJylcbiAgICAgICAgQHZpbVN0YXRlLnV0aWxzLmFzc2VydFdpdGhFeGNlcHRpb24oZmFsc2UsIFwiSGF2ZSBzb21lIG5vbi1lbXB0eSBzZWxlY3Rpb24gaW4gbm9ybWFsLW1vZGU6ICN7b3BlcmF0aW9uLnRvU3RyaW5nKCl9XCIpXG4gICAgICBAdmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcblxuICBlbnN1cmVBbGxDdXJzb3JzQXJlTm90QXRFbmRPZkxpbmU6IC0+XG4gICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKSB3aGVuIGN1cnNvci5pc0F0RW5kT2ZMaW5lKClcbiAgICAgIEB2aW1TdGF0ZS51dGlscy5tb3ZlQ3Vyc29yTGVmdChjdXJzb3IsIHByZXNlcnZlR29hbENvbHVtbjogdHJ1ZSlcblxuICBhZGRUb0NsYXNzTGlzdDogKGNsYXNzTmFtZSkgLT5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSlcbiAgICBAc3Vic2NyaWJlIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSlcblxuICAjIENvdW50XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGtleXN0cm9rZSBgM2Qyd2AgZGVsZXRlIDYoMyoyKSB3b3Jkcy5cbiAgIyAgMm5kIG51bWJlcigyIGluIHRoaXMgY2FzZSkgaXMgYWx3YXlzIGVudGVyZCBpbiBvcGVyYXRvci1wZW5kaW5nLW1vZGUuXG4gICMgIFNvIGNvdW50IGhhdmUgdHdvIHRpbWluZyB0byBiZSBlbnRlcmVkLiB0aGF0J3Mgd2h5IGhlcmUgd2UgbWFuYWdlIGNvdW50ZXIgYnkgbW9kZS5cbiAgaGFzQ291bnQ6IC0+XG4gICAgQGNvdW50Wydub3JtYWwnXT8gb3IgQGNvdW50WydvcGVyYXRvci1wZW5kaW5nJ10/XG5cbiAgZ2V0Q291bnQ6IC0+XG4gICAgaWYgQGhhc0NvdW50KClcbiAgICAgIChAY291bnRbJ25vcm1hbCddID8gMSkgKiAoQGNvdW50WydvcGVyYXRvci1wZW5kaW5nJ10gPyAxKVxuICAgIGVsc2VcbiAgICAgIG51bGxcblxuICBzZXRDb3VudDogKG51bWJlcikgLT5cbiAgICBtb2RlID0gJ25vcm1hbCdcbiAgICBtb2RlID0gQG1vZGUgaWYgQG1vZGUgaXMgJ29wZXJhdG9yLXBlbmRpbmcnXG4gICAgQGNvdW50W21vZGVdID89IDBcbiAgICBAY291bnRbbW9kZV0gPSAoQGNvdW50W21vZGVdICogMTApICsgbnVtYmVyXG4gICAgQHZpbVN0YXRlLmhvdmVyLnNldChAYnVpbGRDb3VudFN0cmluZygpKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ3dpdGgtY291bnQnLCB0cnVlKVxuXG4gIGJ1aWxkQ291bnRTdHJpbmc6IC0+XG4gICAgW0Bjb3VudFsnbm9ybWFsJ10sIEBjb3VudFsnb3BlcmF0b3ItcGVuZGluZyddXVxuICAgICAgLmZpbHRlciAoY291bnQpIC0+IGNvdW50P1xuICAgICAgLm1hcCAoY291bnQpIC0+IFN0cmluZyhjb3VudClcbiAgICAgIC5qb2luKCd4JylcblxuICByZXNldENvdW50OiAtPlxuICAgIEBjb3VudCA9IHt9XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnd2l0aC1jb3VudCcpXG5cbm1vZHVsZS5leHBvcnRzID0gT3BlcmF0aW9uU3RhY2tcbiJdfQ==
