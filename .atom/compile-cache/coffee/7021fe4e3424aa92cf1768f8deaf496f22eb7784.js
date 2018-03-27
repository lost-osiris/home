(function() {
  var ActivateInsertMode, ActivateReplaceMode, Change, ChangeLine, ChangeOccurrence, ChangeToLastCharacterOfLine, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtEndOfOccurrence, InsertAtEndOfSmartWord, InsertAtEndOfSubwordOccurrence, InsertAtEndOfTarget, InsertAtFirstCharacterOfLine, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertAtStartOfOccurrence, InsertAtStartOfSmartWord, InsertAtStartOfSubwordOccurrence, InsertAtStartOfTarget, InsertBelowWithNewline, InsertByTarget, Operator, Range, Substitute, SubstituteLine, _, isEmptyRow, limitNumber, moveCursorLeft, moveCursorRight, ref, setBufferRow,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  Range = require('atom').Range;

  ref = require('./utils'), moveCursorLeft = ref.moveCursorLeft, moveCursorRight = ref.moveCursorRight, limitNumber = ref.limitNumber, isEmptyRow = ref.isEmptyRow, setBufferRow = ref.setBufferRow;

  Operator = require('./base').getClass('Operator');

  ActivateInsertMode = (function(superClass) {
    extend(ActivateInsertMode, superClass);

    function ActivateInsertMode() {
      return ActivateInsertMode.__super__.constructor.apply(this, arguments);
    }

    ActivateInsertMode.extend();

    ActivateInsertMode.prototype.requireTarget = false;

    ActivateInsertMode.prototype.flashTarget = false;

    ActivateInsertMode.prototype.finalSubmode = null;

    ActivateInsertMode.prototype.supportInsertionCount = true;

    ActivateInsertMode.prototype.observeWillDeactivateMode = function() {
      var disposable;
      return disposable = this.vimState.modeManager.preemptWillDeactivateMode((function(_this) {
        return function(arg) {
          var change, mode, textByUserInput;
          mode = arg.mode;
          if (mode !== 'insert') {
            return;
          }
          disposable.dispose();
          _this.vimState.mark.set('^', _this.editor.getCursorBufferPosition());
          textByUserInput = '';
          if (change = _this.getChangeSinceCheckpoint('insert')) {
            _this.lastChange = change;
            _this.setMarkForChange(new Range(change.start, change.start.traverse(change.newExtent)));
            textByUserInput = change.newText;
          }
          _this.vimState.register.set('.', {
            text: textByUserInput
          });
          _.times(_this.getInsertionCount(), function() {
            var i, len, ref1, results, selection, text;
            text = _this.textByOperator + textByUserInput;
            ref1 = _this.editor.getSelections();
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              selection = ref1[i];
              results.push(selection.insertText(text, {
                autoIndent: true
              }));
            }
            return results;
          });
          if (_this.getConfig('clearMultipleCursorsOnEscapeInsertMode')) {
            _this.vimState.clearSelections();
          }
          if (_this.getConfig('groupChangesWhenLeavingInsertMode')) {
            return _this.groupChangesSinceBufferCheckpoint('undo');
          }
        };
      })(this));
    };

    ActivateInsertMode.prototype.getChangeSinceCheckpoint = function(purpose) {
      var checkpoint;
      checkpoint = this.getBufferCheckpoint(purpose);
      return this.editor.buffer.getChangesSinceCheckpoint(checkpoint)[0];
    };

    ActivateInsertMode.prototype.replayLastChange = function(selection) {
      var deletionEnd, deletionStart, newExtent, newText, oldExtent, ref1, start, traversalToStartOfDelete;
      if (this.lastChange != null) {
        ref1 = this.lastChange, start = ref1.start, newExtent = ref1.newExtent, oldExtent = ref1.oldExtent, newText = ref1.newText;
        if (!oldExtent.isZero()) {
          traversalToStartOfDelete = start.traversalFrom(this.topCursorPositionAtInsertionStart);
          deletionStart = selection.cursor.getBufferPosition().traverse(traversalToStartOfDelete);
          deletionEnd = deletionStart.traverse(oldExtent);
          selection.setBufferRange([deletionStart, deletionEnd]);
        }
      } else {
        newText = '';
      }
      return selection.insertText(newText, {
        autoIndent: true
      });
    };

    ActivateInsertMode.prototype.repeatInsert = function(selection, text) {
      return this.replayLastChange(selection);
    };

    ActivateInsertMode.prototype.getInsertionCount = function() {
      if (this.insertionCount == null) {
        this.insertionCount = this.supportInsertionCount ? this.getCount(-1) : 0;
      }
      return limitNumber(this.insertionCount, {
        max: 100
      });
    };

    ActivateInsertMode.prototype.execute = function() {
      var blockwiseSelection, i, len, ref1, ref2, ref3, topCursor;
      if (this.repeated) {
        this.flashTarget = this.trackChange = true;
        this.startMutation((function(_this) {
          return function() {
            var i, len, ref1, ref2, ref3, selection;
            if (_this.target != null) {
              _this.selectTarget();
            }
            if (typeof _this.mutateText === "function") {
              _this.mutateText();
            }
            ref1 = _this.editor.getSelections();
            for (i = 0, len = ref1.length; i < len; i++) {
              selection = ref1[i];
              _this.repeatInsert(selection, (ref2 = (ref3 = _this.lastChange) != null ? ref3.newText : void 0) != null ? ref2 : '');
              moveCursorLeft(selection.cursor);
            }
            return _this.mutationManager.setCheckpoint('did-finish');
          };
        })(this));
        if (this.getConfig('clearMultipleCursorsOnEscapeInsertMode')) {
          return this.vimState.clearSelections();
        }
      } else {
        this.normalizeSelectionsIfNecessary();
        this.createBufferCheckpoint('undo');
        if (this.target != null) {
          this.selectTarget();
        }
        this.observeWillDeactivateMode();
        if (typeof this.mutateText === "function") {
          this.mutateText();
        }
        if (this.getInsertionCount() > 0) {
          this.textByOperator = (ref1 = (ref2 = this.getChangeSinceCheckpoint('undo')) != null ? ref2.newText : void 0) != null ? ref1 : '';
        }
        this.createBufferCheckpoint('insert');
        topCursor = this.editor.getCursorsOrderedByBufferPosition()[0];
        this.topCursorPositionAtInsertionStart = topCursor.getBufferPosition();
        ref3 = this.getBlockwiseSelections();
        for (i = 0, len = ref3.length; i < len; i++) {
          blockwiseSelection = ref3[i];
          blockwiseSelection.skipNormalization();
        }
        return this.activateMode('insert', this.finalSubmode);
      }
    };

    return ActivateInsertMode;

  })(Operator);

  ActivateReplaceMode = (function(superClass) {
    extend(ActivateReplaceMode, superClass);

    function ActivateReplaceMode() {
      return ActivateReplaceMode.__super__.constructor.apply(this, arguments);
    }

    ActivateReplaceMode.extend();

    ActivateReplaceMode.prototype.finalSubmode = 'replace';

    ActivateReplaceMode.prototype.repeatInsert = function(selection, text) {
      var char, i, len;
      for (i = 0, len = text.length; i < len; i++) {
        char = text[i];
        if (!(char !== "\n")) {
          continue;
        }
        if (selection.cursor.isAtEndOfLine()) {
          break;
        }
        selection.selectRight();
      }
      return selection.insertText(text, {
        autoIndent: false
      });
    };

    return ActivateReplaceMode;

  })(ActivateInsertMode);

  InsertAfter = (function(superClass) {
    extend(InsertAfter, superClass);

    function InsertAfter() {
      return InsertAfter.__super__.constructor.apply(this, arguments);
    }

    InsertAfter.extend();

    InsertAfter.prototype.execute = function() {
      var cursor, i, len, ref1;
      ref1 = this.editor.getCursors();
      for (i = 0, len = ref1.length; i < len; i++) {
        cursor = ref1[i];
        moveCursorRight(cursor);
      }
      return InsertAfter.__super__.execute.apply(this, arguments);
    };

    return InsertAfter;

  })(ActivateInsertMode);

  InsertAtBeginningOfLine = (function(superClass) {
    extend(InsertAtBeginningOfLine, superClass);

    function InsertAtBeginningOfLine() {
      return InsertAtBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAtBeginningOfLine.extend();

    InsertAtBeginningOfLine.prototype.execute = function() {
      var ref1;
      if (this.mode === 'visual' && ((ref1 = this.submode) === 'characterwise' || ref1 === 'linewise')) {
        this.editor.splitSelectionsIntoLines();
      }
      this.editor.moveToBeginningOfLine();
      return InsertAtBeginningOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAtBeginningOfLine;

  })(ActivateInsertMode);

  InsertAfterEndOfLine = (function(superClass) {
    extend(InsertAfterEndOfLine, superClass);

    function InsertAfterEndOfLine() {
      return InsertAfterEndOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAfterEndOfLine.extend();

    InsertAfterEndOfLine.prototype.execute = function() {
      this.editor.moveToEndOfLine();
      return InsertAfterEndOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAfterEndOfLine;

  })(ActivateInsertMode);

  InsertAtFirstCharacterOfLine = (function(superClass) {
    extend(InsertAtFirstCharacterOfLine, superClass);

    function InsertAtFirstCharacterOfLine() {
      return InsertAtFirstCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAtFirstCharacterOfLine.extend();

    InsertAtFirstCharacterOfLine.prototype.execute = function() {
      this.editor.moveToBeginningOfLine();
      this.editor.moveToFirstCharacterOfLine();
      return InsertAtFirstCharacterOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAtFirstCharacterOfLine;

  })(ActivateInsertMode);

  InsertAtLastInsert = (function(superClass) {
    extend(InsertAtLastInsert, superClass);

    function InsertAtLastInsert() {
      return InsertAtLastInsert.__super__.constructor.apply(this, arguments);
    }

    InsertAtLastInsert.extend();

    InsertAtLastInsert.prototype.execute = function() {
      var point;
      if ((point = this.vimState.mark.get('^'))) {
        this.editor.setCursorBufferPosition(point);
        this.editor.scrollToCursorPosition({
          center: true
        });
      }
      return InsertAtLastInsert.__super__.execute.apply(this, arguments);
    };

    return InsertAtLastInsert;

  })(ActivateInsertMode);

  InsertAboveWithNewline = (function(superClass) {
    extend(InsertAboveWithNewline, superClass);

    function InsertAboveWithNewline() {
      return InsertAboveWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertAboveWithNewline.extend();

    InsertAboveWithNewline.prototype.groupChangesSinceBufferCheckpoint = function() {
      var cursorPosition, lastCursor;
      lastCursor = this.editor.getLastCursor();
      cursorPosition = lastCursor.getBufferPosition();
      lastCursor.setBufferPosition(this.vimState.getOriginalCursorPositionByMarker());
      InsertAboveWithNewline.__super__.groupChangesSinceBufferCheckpoint.apply(this, arguments);
      return lastCursor.setBufferPosition(cursorPosition);
    };

    InsertAboveWithNewline.prototype.autoIndentEmptyRows = function() {
      var cursor, i, len, ref1, results, row;
      ref1 = this.editor.getCursors();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        cursor = ref1[i];
        row = cursor.getBufferRow();
        if (isEmptyRow(this.editor, row)) {
          results.push(this.editor.autoIndentBufferRow(row));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    InsertAboveWithNewline.prototype.mutateText = function() {
      this.editor.insertNewlineAbove();
      if (this.editor.autoIndent) {
        return this.autoIndentEmptyRows();
      }
    };

    InsertAboveWithNewline.prototype.repeatInsert = function(selection, text) {
      return selection.insertText(text.trimLeft(), {
        autoIndent: true
      });
    };

    return InsertAboveWithNewline;

  })(ActivateInsertMode);

  InsertBelowWithNewline = (function(superClass) {
    extend(InsertBelowWithNewline, superClass);

    function InsertBelowWithNewline() {
      return InsertBelowWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertBelowWithNewline.extend();

    InsertBelowWithNewline.prototype.mutateText = function() {
      var cursor, cursorRow, i, len, ref1;
      ref1 = this.editor.getCursors();
      for (i = 0, len = ref1.length; i < len; i++) {
        cursor = ref1[i];
        if (cursorRow = cursor.getBufferRow()) {
          setBufferRow(cursor, this.getFoldEndRowForRow(cursorRow));
        }
      }
      this.editor.insertNewlineBelow();
      if (this.editor.autoIndent) {
        return this.autoIndentEmptyRows();
      }
    };

    return InsertBelowWithNewline;

  })(InsertAboveWithNewline);

  InsertByTarget = (function(superClass) {
    extend(InsertByTarget, superClass);

    function InsertByTarget() {
      return InsertByTarget.__super__.constructor.apply(this, arguments);
    }

    InsertByTarget.extend(false);

    InsertByTarget.prototype.requireTarget = true;

    InsertByTarget.prototype.which = null;

    InsertByTarget.prototype.initialize = function() {
      this.getCount();
      return InsertByTarget.__super__.initialize.apply(this, arguments);
    };

    InsertByTarget.prototype.execute = function() {
      this.onDidSelectTarget((function(_this) {
        return function() {
          var $selection, blockwiseSelection, i, j, k, len, len1, len2, ref1, ref2, ref3, ref4, results;
          if (!_this.occurrenceSelected && _this.mode === 'visual' && ((ref1 = _this.submode) === 'characterwise' || ref1 === 'linewise')) {
            ref2 = _this.swrap.getSelections(_this.editor);
            for (i = 0, len = ref2.length; i < len; i++) {
              $selection = ref2[i];
              $selection.normalize();
              $selection.applyWise('blockwise');
            }
            if (_this.submode === 'linewise') {
              ref3 = _this.getBlockwiseSelections();
              for (j = 0, len1 = ref3.length; j < len1; j++) {
                blockwiseSelection = ref3[j];
                blockwiseSelection.expandMemberSelectionsOverLineWithTrimRange();
              }
            }
          }
          ref4 = _this.swrap.getSelections(_this.editor);
          results = [];
          for (k = 0, len2 = ref4.length; k < len2; k++) {
            $selection = ref4[k];
            results.push($selection.setBufferPositionTo(_this.which));
          }
          return results;
        };
      })(this));
      return InsertByTarget.__super__.execute.apply(this, arguments);
    };

    return InsertByTarget;

  })(ActivateInsertMode);

  InsertAtStartOfTarget = (function(superClass) {
    extend(InsertAtStartOfTarget, superClass);

    function InsertAtStartOfTarget() {
      return InsertAtStartOfTarget.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfTarget.extend();

    InsertAtStartOfTarget.prototype.which = 'start';

    return InsertAtStartOfTarget;

  })(InsertByTarget);

  InsertAtEndOfTarget = (function(superClass) {
    extend(InsertAtEndOfTarget, superClass);

    function InsertAtEndOfTarget() {
      return InsertAtEndOfTarget.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfTarget.extend();

    InsertAtEndOfTarget.prototype.which = 'end';

    return InsertAtEndOfTarget;

  })(InsertByTarget);

  InsertAtStartOfOccurrence = (function(superClass) {
    extend(InsertAtStartOfOccurrence, superClass);

    function InsertAtStartOfOccurrence() {
      return InsertAtStartOfOccurrence.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfOccurrence.extend();

    InsertAtStartOfOccurrence.prototype.which = 'start';

    InsertAtStartOfOccurrence.prototype.occurrence = true;

    return InsertAtStartOfOccurrence;

  })(InsertByTarget);

  InsertAtEndOfOccurrence = (function(superClass) {
    extend(InsertAtEndOfOccurrence, superClass);

    function InsertAtEndOfOccurrence() {
      return InsertAtEndOfOccurrence.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfOccurrence.extend();

    InsertAtEndOfOccurrence.prototype.which = 'end';

    InsertAtEndOfOccurrence.prototype.occurrence = true;

    return InsertAtEndOfOccurrence;

  })(InsertByTarget);

  InsertAtStartOfSubwordOccurrence = (function(superClass) {
    extend(InsertAtStartOfSubwordOccurrence, superClass);

    function InsertAtStartOfSubwordOccurrence() {
      return InsertAtStartOfSubwordOccurrence.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfSubwordOccurrence.extend();

    InsertAtStartOfSubwordOccurrence.prototype.occurrenceType = 'subword';

    return InsertAtStartOfSubwordOccurrence;

  })(InsertAtStartOfOccurrence);

  InsertAtEndOfSubwordOccurrence = (function(superClass) {
    extend(InsertAtEndOfSubwordOccurrence, superClass);

    function InsertAtEndOfSubwordOccurrence() {
      return InsertAtEndOfSubwordOccurrence.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfSubwordOccurrence.extend();

    InsertAtEndOfSubwordOccurrence.prototype.occurrenceType = 'subword';

    return InsertAtEndOfSubwordOccurrence;

  })(InsertAtEndOfOccurrence);

  InsertAtStartOfSmartWord = (function(superClass) {
    extend(InsertAtStartOfSmartWord, superClass);

    function InsertAtStartOfSmartWord() {
      return InsertAtStartOfSmartWord.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfSmartWord.extend();

    InsertAtStartOfSmartWord.prototype.which = 'start';

    InsertAtStartOfSmartWord.prototype.target = "MoveToPreviousSmartWord";

    return InsertAtStartOfSmartWord;

  })(InsertByTarget);

  InsertAtEndOfSmartWord = (function(superClass) {
    extend(InsertAtEndOfSmartWord, superClass);

    function InsertAtEndOfSmartWord() {
      return InsertAtEndOfSmartWord.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfSmartWord.extend();

    InsertAtEndOfSmartWord.prototype.which = 'end';

    InsertAtEndOfSmartWord.prototype.target = "MoveToEndOfSmartWord";

    return InsertAtEndOfSmartWord;

  })(InsertByTarget);

  InsertAtPreviousFoldStart = (function(superClass) {
    extend(InsertAtPreviousFoldStart, superClass);

    function InsertAtPreviousFoldStart() {
      return InsertAtPreviousFoldStart.__super__.constructor.apply(this, arguments);
    }

    InsertAtPreviousFoldStart.extend();

    InsertAtPreviousFoldStart.description = "Move to previous fold start then enter insert-mode";

    InsertAtPreviousFoldStart.prototype.which = 'start';

    InsertAtPreviousFoldStart.prototype.target = 'MoveToPreviousFoldStart';

    return InsertAtPreviousFoldStart;

  })(InsertByTarget);

  InsertAtNextFoldStart = (function(superClass) {
    extend(InsertAtNextFoldStart, superClass);

    function InsertAtNextFoldStart() {
      return InsertAtNextFoldStart.__super__.constructor.apply(this, arguments);
    }

    InsertAtNextFoldStart.extend();

    InsertAtNextFoldStart.description = "Move to next fold start then enter insert-mode";

    InsertAtNextFoldStart.prototype.which = 'end';

    InsertAtNextFoldStart.prototype.target = 'MoveToNextFoldStart';

    return InsertAtNextFoldStart;

  })(InsertByTarget);

  Change = (function(superClass) {
    extend(Change, superClass);

    function Change() {
      return Change.__super__.constructor.apply(this, arguments);
    }

    Change.extend();

    Change.prototype.requireTarget = true;

    Change.prototype.trackChange = true;

    Change.prototype.supportInsertionCount = false;

    Change.prototype.mutateText = function() {
      var i, isLinewiseTarget, len, ref1, results, selection;
      isLinewiseTarget = this.swrap.detectWise(this.editor) === 'linewise';
      ref1 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        if (!this.getConfig('dontUpdateRegisterOnChangeOrSubstitute')) {
          this.setTextToRegisterForSelection(selection);
        }
        if (isLinewiseTarget) {
          selection.insertText("\n", {
            autoIndent: true
          });
          results.push(selection.cursor.moveLeft());
        } else {
          results.push(selection.insertText('', {
            autoIndent: true
          }));
        }
      }
      return results;
    };

    return Change;

  })(ActivateInsertMode);

  ChangeOccurrence = (function(superClass) {
    extend(ChangeOccurrence, superClass);

    function ChangeOccurrence() {
      return ChangeOccurrence.__super__.constructor.apply(this, arguments);
    }

    ChangeOccurrence.extend();

    ChangeOccurrence.description = "Change all matching word within target range";

    ChangeOccurrence.prototype.occurrence = true;

    return ChangeOccurrence;

  })(Change);

  Substitute = (function(superClass) {
    extend(Substitute, superClass);

    function Substitute() {
      return Substitute.__super__.constructor.apply(this, arguments);
    }

    Substitute.extend();

    Substitute.prototype.target = 'MoveRight';

    return Substitute;

  })(Change);

  SubstituteLine = (function(superClass) {
    extend(SubstituteLine, superClass);

    function SubstituteLine() {
      return SubstituteLine.__super__.constructor.apply(this, arguments);
    }

    SubstituteLine.extend();

    SubstituteLine.prototype.wise = 'linewise';

    SubstituteLine.prototype.target = 'MoveToRelativeLine';

    return SubstituteLine;

  })(Change);

  ChangeLine = (function(superClass) {
    extend(ChangeLine, superClass);

    function ChangeLine() {
      return ChangeLine.__super__.constructor.apply(this, arguments);
    }

    ChangeLine.extend();

    return ChangeLine;

  })(SubstituteLine);

  ChangeToLastCharacterOfLine = (function(superClass) {
    extend(ChangeToLastCharacterOfLine, superClass);

    function ChangeToLastCharacterOfLine() {
      return ChangeToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    ChangeToLastCharacterOfLine.extend();

    ChangeToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    ChangeToLastCharacterOfLine.prototype.execute = function() {
      if (this.target.wise === 'blockwise') {
        this.onDidSelectTarget((function(_this) {
          return function() {
            var blockwiseSelection, i, len, ref1, results;
            ref1 = _this.getBlockwiseSelections();
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              blockwiseSelection = ref1[i];
              results.push(blockwiseSelection.extendMemberSelectionsToEndOfLine());
            }
            return results;
          };
        })(this));
      }
      return ChangeToLastCharacterOfLine.__super__.execute.apply(this, arguments);
    };

    return ChangeToLastCharacterOfLine;

  })(Change);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLWluc2VydC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJwQkFBQTtJQUFBOzs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNILFFBQVMsT0FBQSxDQUFRLE1BQVI7O0VBRVYsTUFNSSxPQUFBLENBQVEsU0FBUixDQU5KLEVBQ0UsbUNBREYsRUFFRSxxQ0FGRixFQUdFLDZCQUhGLEVBSUUsMkJBSkYsRUFLRTs7RUFFRixRQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVIsQ0FBaUIsQ0FBQyxRQUFsQixDQUEyQixVQUEzQjs7RUFNTDs7Ozs7OztJQUNKLGtCQUFDLENBQUEsTUFBRCxDQUFBOztpQ0FDQSxhQUFBLEdBQWU7O2lDQUNmLFdBQUEsR0FBYTs7aUNBQ2IsWUFBQSxHQUFjOztpQ0FDZCxxQkFBQSxHQUF1Qjs7aUNBRXZCLHlCQUFBLEdBQTJCLFNBQUE7QUFDekIsVUFBQTthQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyx5QkFBdEIsQ0FBZ0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDM0QsY0FBQTtVQUQ2RCxPQUFEO1VBQzVELElBQWMsSUFBQSxLQUFRLFFBQXRCO0FBQUEsbUJBQUE7O1VBQ0EsVUFBVSxDQUFDLE9BQVgsQ0FBQTtVQUVBLEtBQUMsQ0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQWYsQ0FBbUIsR0FBbkIsRUFBd0IsS0FBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQXhCO1VBQ0EsZUFBQSxHQUFrQjtVQUNsQixJQUFHLE1BQUEsR0FBUyxLQUFDLENBQUEsd0JBQUQsQ0FBMEIsUUFBMUIsQ0FBWjtZQUNFLEtBQUMsQ0FBQSxVQUFELEdBQWM7WUFDZCxLQUFDLENBQUEsZ0JBQUQs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QUFELENBQUE7OzZCQUNBLElBQUEsR0FBTTs7NkJBQ04sTUFBQSxHQUFROzs7O0tBSG1COztFQU12Qjs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxNQUFELENBQUE7Ozs7S0FEdUI7O0VBR25COzs7Ozs7O0lBQ0osMkJBQUMsQ0FBQSxNQUFELENBQUE7OzBDQUNBLE1BQUEsR0FBUTs7MENBRVIsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixLQUFnQixXQUFuQjtRQUNFLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO0FBQ2pCLGdCQUFBO0FBQUE7QUFBQTtpQkFBQSxzQ0FBQTs7MkJBQ0Usa0JBQWtCLENBQUMsaUNBQW5CLENBQUE7QUFERjs7VUFEaUI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5CLEVBREY7O2FBSUEsMERBQUEsU0FBQTtJQUxPOzs7O0tBSitCO0FBN1UxQyIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57UmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcblxue1xuICBtb3ZlQ3Vyc29yTGVmdFxuICBtb3ZlQ3Vyc29yUmlnaHRcbiAgbGltaXROdW1iZXJcbiAgaXNFbXB0eVJvd1xuICBzZXRCdWZmZXJSb3dcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuT3BlcmF0b3IgPSByZXF1aXJlKCcuL2Jhc2UnKS5nZXRDbGFzcygnT3BlcmF0b3InKVxuXG4jIE9wZXJhdG9yIHdoaWNoIHN0YXJ0ICdpbnNlcnQtbW9kZSdcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBbTk9URV1cbiMgUnVsZTogRG9uJ3QgbWFrZSBhbnkgdGV4dCBtdXRhdGlvbiBiZWZvcmUgY2FsbGluZyBgQHNlbGVjdFRhcmdldCgpYC5cbmNsYXNzIEFjdGl2YXRlSW5zZXJ0TW9kZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICByZXF1aXJlVGFyZ2V0OiBmYWxzZVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgZmluYWxTdWJtb2RlOiBudWxsXG4gIHN1cHBvcnRJbnNlcnRpb25Db3VudDogdHJ1ZVxuXG4gIG9ic2VydmVXaWxsRGVhY3RpdmF0ZU1vZGU6IC0+XG4gICAgZGlzcG9zYWJsZSA9IEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5wcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlICh7bW9kZX0pID0+XG4gICAgICByZXR1cm4gdW5sZXNzIG1vZGUgaXMgJ2luc2VydCdcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgICAgIEB2aW1TdGF0ZS5tYXJrLnNldCgnXicsIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkgIyBMYXN0IGluc2VydC1tb2RlIHBvc2l0aW9uXG4gICAgICB0ZXh0QnlVc2VySW5wdXQgPSAnJ1xuICAgICAgaWYgY2hhbmdlID0gQGdldENoYW5nZVNpbmNlQ2hlY2twb2ludCgnaW5zZXJ0JylcbiAgICAgICAgQGxhc3RDaGFuZ2UgPSBjaGFuZ2VcbiAgICAgICAgQHNldE1hcmtGb3JDaGFuZ2UobmV3IFJhbmdlKGNoYW5nZS5zdGFydCwgY2hhbmdlLnN0YXJ0LnRyYXZlcnNlKGNoYW5nZS5uZXdFeHRlbnQpKSlcbiAgICAgICAgdGV4dEJ5VXNlcklucHV0ID0gY2hhbmdlLm5ld1RleHRcbiAgICAgIEB2aW1TdGF0ZS5yZWdpc3Rlci5zZXQoJy4nLCB0ZXh0OiB0ZXh0QnlVc2VySW5wdXQpICMgTGFzdCBpbnNlcnRlZCB0ZXh0XG5cbiAgICAgIF8udGltZXMgQGdldEluc2VydGlvbkNvdW50KCksID0+XG4gICAgICAgIHRleHQgPSBAdGV4dEJ5T3BlcmF0b3IgKyB0ZXh0QnlVc2VySW5wdXRcbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIGF1dG9JbmRlbnQ6IHRydWUpXG5cbiAgICAgICMgVGhpcyBjdXJzb3Igc3RhdGUgaXMgcmVzdG9yZWQgb24gdW5kby5cbiAgICAgICMgU28gY3Vyc29yIHN0YXRlIGhhcyB0byBiZSB1cGRhdGVkIGJlZm9yZSBuZXh0IGdyb3VwQ2hhbmdlc1NpbmNlQ2hlY2twb2ludCgpXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdjbGVhck11bHRpcGxlQ3Vyc29yc09uRXNjYXBlSW5zZXJ0TW9kZScpXG4gICAgICAgIEB2aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuXG4gICAgICAjIGdyb3VwaW5nIGNoYW5nZXMgZm9yIHVuZG8gY2hlY2twb2ludCBuZWVkIHRvIGNvbWUgbGFzdFxuICAgICAgaWYgQGdldENvbmZpZygnZ3JvdXBDaGFuZ2VzV2hlbkxlYXZpbmdJbnNlcnRNb2RlJylcbiAgICAgICAgQGdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG5cbiAgIyBXaGVuIGVhY2ggbXV0YWlvbidzIGV4dGVudCBpcyBub3QgaW50ZXJzZWN0aW5nLCBtdWl0aXBsZSBjaGFuZ2VzIGFyZSByZWNvcmRlZFxuICAjIGUuZ1xuICAjICAtIE11bHRpY3Vyc29ycyBlZGl0XG4gICMgIC0gQ3Vyc29yIG1vdmVkIGluIGluc2VydC1tb2RlKGUuZyBjdHJsLWYsIGN0cmwtYilcbiAgIyBCdXQgSSBkb24ndCBjYXJlIG11bHRpcGxlIGNoYW5nZXMganVzdCBiZWNhdXNlIEknbSBsYXp5KHNvIG5vdCBwZXJmZWN0IGltcGxlbWVudGF0aW9uKS5cbiAgIyBJIG9ubHkgdGFrZSBjYXJlIG9mIG9uZSBjaGFuZ2UgaGFwcGVuZWQgYXQgZWFybGllc3QodG9wQ3Vyc29yJ3MgY2hhbmdlKSBwb3NpdGlvbi5cbiAgIyBUaGF0cycgd2h5IEkgc2F2ZSB0b3BDdXJzb3IncyBwb3NpdGlvbiB0byBAdG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0IHRvIGNvbXBhcmUgdHJhdmVyc2FsIHRvIGRlbGV0aW9uU3RhcnRcbiAgIyBXaHkgSSB1c2UgdG9wQ3Vyc29yJ3MgY2hhbmdlPyBKdXN0IGJlY2F1c2UgaXQncyBlYXN5IHRvIHVzZSBmaXJzdCBjaGFuZ2UgcmV0dXJuZWQgYnkgZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCkuXG4gIGdldENoYW5nZVNpbmNlQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgY2hlY2twb2ludCA9IEBnZXRCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgQGVkaXRvci5idWZmZXIuZ2V0Q2hhbmdlc1NpbmNlQ2hlY2twb2ludChjaGVja3BvaW50KVswXVxuXG4gICMgW0JVRy1CVVQtT0tdIFJlcGxheWluZyB0ZXh0LWRlbGV0aW9uLW9wZXJhdGlvbiBpcyBub3QgY29tcGF0aWJsZSB0byBwdXJlIFZpbS5cbiAgIyBQdXJlIFZpbSByZWNvcmQgYWxsIG9wZXJhdGlvbiBpbiBpbnNlcnQtbW9kZSBhcyBrZXlzdHJva2UgbGV2ZWwgYW5kIGNhbiBkaXN0aW5ndWlzaFxuICAjIGNoYXJhY3RlciBkZWxldGVkIGJ5IGBEZWxldGVgIG9yIGJ5IGBjdHJsLXVgLlxuICAjIEJ1dCBJIGNhbiBub3QgYW5kIGRvbid0IHRyeWluZyB0byBtaW5pYyB0aGlzIGxldmVsIG9mIGNvbXBhdGliaWxpdHkuXG4gICMgU28gYmFzaWNhbGx5IGRlbGV0aW9uLWRvbmUtaW4tb25lIGlzIGV4cGVjdGVkIHRvIHdvcmsgd2VsbC5cbiAgcmVwbGF5TGFzdENoYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBpZiBAbGFzdENoYW5nZT9cbiAgICAgIHtzdGFydCwgbmV3RXh0ZW50LCBvbGRFeHRlbnQsIG5ld1RleHR9ID0gQGxhc3RDaGFuZ2VcbiAgICAgIHVubGVzcyBvbGRFeHRlbnQuaXNaZXJvKClcbiAgICAgICAgdHJhdmVyc2FsVG9TdGFydE9mRGVsZXRlID0gc3RhcnQudHJhdmVyc2FsRnJvbShAdG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0KVxuICAgICAgICBkZWxldGlvblN0YXJ0ID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYXZlcnNlKHRyYXZlcnNhbFRvU3RhcnRPZkRlbGV0ZSlcbiAgICAgICAgZGVsZXRpb25FbmQgPSBkZWxldGlvblN0YXJ0LnRyYXZlcnNlKG9sZEV4dGVudClcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKFtkZWxldGlvblN0YXJ0LCBkZWxldGlvbkVuZF0pXG4gICAgZWxzZVxuICAgICAgbmV3VGV4dCA9ICcnXG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQobmV3VGV4dCwgYXV0b0luZGVudDogdHJ1ZSlcblxuICAjIGNhbGxlZCB3aGVuIHJlcGVhdGVkXG4gICMgW0ZJWE1FXSB0byB1c2UgcmVwbGF5TGFzdENoYW5nZSBpbiByZXBlYXRJbnNlcnQgb3ZlcnJpZGluZyBzdWJjbGFzc3MuXG4gIHJlcGVhdEluc2VydDogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICBAcmVwbGF5TGFzdENoYW5nZShzZWxlY3Rpb24pXG5cbiAgZ2V0SW5zZXJ0aW9uQ291bnQ6IC0+XG4gICAgQGluc2VydGlvbkNvdW50ID89IGlmIEBzdXBwb3J0SW5zZXJ0aW9uQ291bnQgdGhlbiBAZ2V0Q291bnQoLTEpIGVsc2UgMFxuICAgICMgQXZvaWQgZnJlZXppbmcgYnkgYWNjY2lkZW50YWwgYmlnIGNvdW50KGUuZy4gYDU1NTU1NTU1NTU1NTVpYCksIFNlZSAjNTYwLCAjNTk2XG4gICAgbGltaXROdW1iZXIoQGluc2VydGlvbkNvdW50LCBtYXg6IDEwMClcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIEByZXBlYXRlZFxuICAgICAgQGZsYXNoVGFyZ2V0ID0gQHRyYWNrQ2hhbmdlID0gdHJ1ZVxuXG4gICAgICBAc3RhcnRNdXRhdGlvbiA9PlxuICAgICAgICBAc2VsZWN0VGFyZ2V0KCkgaWYgQHRhcmdldD9cbiAgICAgICAgQG11dGF0ZVRleHQ/KClcbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIEByZXBlYXRJbnNlcnQoc2VsZWN0aW9uLCBAbGFzdENoYW5nZT8ubmV3VGV4dCA/ICcnKVxuICAgICAgICAgIG1vdmVDdXJzb3JMZWZ0KHNlbGVjdGlvbi5jdXJzb3IpXG4gICAgICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLWZpbmlzaCcpXG5cbiAgICAgIGlmIEBnZXRDb25maWcoJ2NsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlJylcbiAgICAgICAgQHZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgICBlbHNlXG4gICAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgIEBjcmVhdGVCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcbiAgICAgIEBzZWxlY3RUYXJnZXQoKSBpZiBAdGFyZ2V0P1xuICAgICAgQG9ic2VydmVXaWxsRGVhY3RpdmF0ZU1vZGUoKVxuXG4gICAgICBAbXV0YXRlVGV4dD8oKVxuXG4gICAgICBpZiBAZ2V0SW5zZXJ0aW9uQ291bnQoKSA+IDBcbiAgICAgICAgQHRleHRCeU9wZXJhdG9yID0gQGdldENoYW5nZVNpbmNlQ2hlY2twb2ludCgndW5kbycpPy5uZXdUZXh0ID8gJydcblxuICAgICAgQGNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQoJ2luc2VydCcpXG4gICAgICB0b3BDdXJzb3IgPSBAZWRpdG9yLmdldEN1cnNvcnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpWzBdXG4gICAgICBAdG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0ID0gdG9wQ3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgICAgIyBTa2lwIG5vcm1hbGl6YXRpb24gb2YgYmxvY2t3aXNlU2VsZWN0aW9uLlxuICAgICAgIyBTaW5jZSB3YW50IHRvIGtlZXAgbXVsdGktY3Vyc29yIGFuZCBpdCdzIHBvc2l0aW9uIGluIHdoZW4gc2hpZnQgdG8gaW5zZXJ0LW1vZGUuXG4gICAgICBmb3IgYmxvY2t3aXNlU2VsZWN0aW9uIGluIEBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKClcbiAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnNraXBOb3JtYWxpemF0aW9uKClcbiAgICAgIEBhY3RpdmF0ZU1vZGUoJ2luc2VydCcsIEBmaW5hbFN1Ym1vZGUpXG5cbmNsYXNzIEFjdGl2YXRlUmVwbGFjZU1vZGUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGZpbmFsU3VibW9kZTogJ3JlcGxhY2UnXG5cbiAgcmVwZWF0SW5zZXJ0OiAoc2VsZWN0aW9uLCB0ZXh0KSAtPlxuICAgIGZvciBjaGFyIGluIHRleHQgd2hlbiAoY2hhciBpc250IFwiXFxuXCIpXG4gICAgICBicmVhayBpZiBzZWxlY3Rpb24uY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuICAgICAgc2VsZWN0aW9uLnNlbGVjdFJpZ2h0KClcbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCBhdXRvSW5kZW50OiBmYWxzZSlcblxuY2xhc3MgSW5zZXJ0QWZ0ZXIgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgbW92ZUN1cnNvclJpZ2h0KGN1cnNvcikgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgIHN1cGVyXG5cbiMga2V5OiAnZyBJJyBpbiBhbGwgbW9kZVxuY2xhc3MgSW5zZXJ0QXRCZWdpbm5pbmdPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIEBzdWJtb2RlIGluIFsnY2hhcmFjdGVyd2lzZScsICdsaW5ld2lzZSddXG4gICAgICBAZWRpdG9yLnNwbGl0U2VsZWN0aW9uc0ludG9MaW5lcygpXG4gICAgQGVkaXRvci5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKVxuICAgIHN1cGVyXG5cbiMga2V5OiBub3JtYWwgJ0EnXG5jbGFzcyBJbnNlcnRBZnRlckVuZE9mTGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yLm1vdmVUb0VuZE9mTGluZSgpXG4gICAgc3VwZXJcblxuIyBrZXk6IG5vcm1hbCAnSSdcbmNsYXNzIEluc2VydEF0Rmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgQGVkaXRvci5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKVxuICAgIEBlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuICAgIHN1cGVyXG5cbmNsYXNzIEluc2VydEF0TGFzdEluc2VydCBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBpZiAocG9pbnQgPSBAdmltU3RhdGUubWFyay5nZXQoJ14nKSlcbiAgICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICBAZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oe2NlbnRlcjogdHJ1ZX0pXG4gICAgc3VwZXJcblxuY2xhc3MgSW5zZXJ0QWJvdmVXaXRoTmV3bGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcblxuICAjIFRoaXMgaXMgZm9yIGBvYCBhbmQgYE9gIG9wZXJhdG9yLlxuICAjIE9uIHVuZG8vcmVkbyBwdXQgY3Vyc29yIGF0IG9yaWdpbmFsIHBvaW50IHdoZXJlIHVzZXIgdHlwZSBgb2Agb3IgYE9gLlxuICBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQ6IC0+XG4gICAgbGFzdEN1cnNvciA9IEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgY3Vyc29yUG9zaXRpb24gPSBsYXN0Q3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBsYXN0Q3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKEB2aW1TdGF0ZS5nZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXIoKSlcblxuICAgIHN1cGVyXG5cbiAgICBsYXN0Q3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGN1cnNvclBvc2l0aW9uKVxuXG4gIGF1dG9JbmRlbnRFbXB0eVJvd3M6IC0+XG4gICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgcm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgICBAZWRpdG9yLmF1dG9JbmRlbnRCdWZmZXJSb3cocm93KSBpZiBpc0VtcHR5Um93KEBlZGl0b3IsIHJvdylcblxuICBtdXRhdGVUZXh0OiAtPlxuICAgIEBlZGl0b3IuaW5zZXJ0TmV3bGluZUFib3ZlKClcbiAgICBAYXV0b0luZGVudEVtcHR5Um93cygpIGlmIEBlZGl0b3IuYXV0b0luZGVudFxuXG4gIHJlcGVhdEluc2VydDogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LnRyaW1MZWZ0KCksIGF1dG9JbmRlbnQ6IHRydWUpXG5cbmNsYXNzIEluc2VydEJlbG93V2l0aE5ld2xpbmUgZXh0ZW5kcyBJbnNlcnRBYm92ZVdpdGhOZXdsaW5lXG4gIEBleHRlbmQoKVxuICBtdXRhdGVUZXh0OiAtPlxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKCkgd2hlbiBjdXJzb3JSb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICAgIHNldEJ1ZmZlclJvdyhjdXJzb3IsIEBnZXRGb2xkRW5kUm93Rm9yUm93KGN1cnNvclJvdykpXG5cbiAgICBAZWRpdG9yLmluc2VydE5ld2xpbmVCZWxvdygpXG4gICAgQGF1dG9JbmRlbnRFbXB0eVJvd3MoKSBpZiBAZWRpdG9yLmF1dG9JbmRlbnRcblxuIyBBZHZhbmNlZCBJbnNlcnRpb25cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5zZXJ0QnlUYXJnZXQgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZChmYWxzZSlcbiAgcmVxdWlyZVRhcmdldDogdHJ1ZVxuICB3aGljaDogbnVsbCAjIG9uZSBvZiBbJ3N0YXJ0JywgJ2VuZCcsICdoZWFkJywgJ3RhaWwnXVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgIyBIQUNLXG4gICAgIyBXaGVuIGcgaSBpcyBtYXBwZWQgdG8gYGluc2VydC1hdC1zdGFydC1vZi10YXJnZXRgLlxuICAgICMgYGcgaSAzIGxgIHN0YXJ0IGluc2VydCBhdCAzIGNvbHVtbiByaWdodCBwb3NpdGlvbi5cbiAgICAjIEluIHRoaXMgY2FzZSwgd2UgZG9uJ3Qgd2FudCByZXBlYXQgaW5zZXJ0aW9uIDMgdGltZXMuXG4gICAgIyBUaGlzIEBnZXRDb3VudCgpIGNhbGwgY2FjaGUgbnVtYmVyIGF0IHRoZSB0aW1pbmcgQkVGT1JFICczJyBpcyBzcGVjaWZpZWQuXG4gICAgQGdldENvdW50KClcbiAgICBzdXBlclxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG9uRGlkU2VsZWN0VGFyZ2V0ID0+XG4gICAgICAjIEluIHZDL3ZMLCB3aGVuIG9jY3VycmVuY2UgbWFya2VyIHdhcyBOT1Qgc2VsZWN0ZWQsXG4gICAgICAjIGl0IGJlaGF2ZSdzIHZlcnkgc3BlY2lhbGx5XG4gICAgICAjIHZDOiBgSWAgYW5kIGBBYCBiZWhhdmVzIGFzIHNob2Z0IGhhbmQgb2YgYGN0cmwtdiBJYCBhbmQgYGN0cmwtdiBBYC5cbiAgICAgICMgdkw6IGBJYCBhbmQgYEFgIHBsYWNlIGN1cnNvcnMgYXQgZWFjaCBzZWxlY3RlZCBsaW5lcyBvZiBzdGFydCggb3IgZW5kICkgb2Ygbm9uLXdoaXRlLXNwYWNlIGNoYXIuXG4gICAgICBpZiBub3QgQG9jY3VycmVuY2VTZWxlY3RlZCBhbmQgQG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIEBzdWJtb2RlIGluIFsnY2hhcmFjdGVyd2lzZScsICdsaW5ld2lzZSddXG4gICAgICAgIGZvciAkc2VsZWN0aW9uIGluIEBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpXG4gICAgICAgICAgJHNlbGVjdGlvbi5ub3JtYWxpemUoKVxuICAgICAgICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKCdibG9ja3dpc2UnKVxuXG4gICAgICAgIGlmIEBzdWJtb2RlIGlzICdsaW5ld2lzZSdcbiAgICAgICAgICBmb3IgYmxvY2t3aXNlU2VsZWN0aW9uIGluIEBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKClcbiAgICAgICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5leHBhbmRNZW1iZXJTZWxlY3Rpb25zT3ZlckxpbmVXaXRoVHJpbVJhbmdlKClcblxuICAgICAgZm9yICRzZWxlY3Rpb24gaW4gQHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcbiAgICAgICAgJHNlbGVjdGlvbi5zZXRCdWZmZXJQb3NpdGlvblRvKEB3aGljaClcbiAgICBzdXBlclxuXG4jIGtleTogJ0knLCBVc2VkIGluICd2aXN1YWwtbW9kZS5jaGFyYWN0ZXJ3aXNlJywgdmlzdWFsLW1vZGUuYmxvY2t3aXNlXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZUYXJnZXQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdzdGFydCdcblxuIyBrZXk6ICdBJywgVXNlZCBpbiAndmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZScsICd2aXN1YWwtbW9kZS5ibG9ja3dpc2UnXG5jbGFzcyBJbnNlcnRBdEVuZE9mVGFyZ2V0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnZW5kJ1xuXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnc3RhcnQnXG4gIG9jY3VycmVuY2U6IHRydWVcblxuY2xhc3MgSW5zZXJ0QXRFbmRPZk9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdlbmQnXG4gIG9jY3VycmVuY2U6IHRydWVcblxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mU3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdFN0YXJ0T2ZPY2N1cnJlbmNlXG4gIEBleHRlbmQoKVxuICBvY2N1cnJlbmNlVHlwZTogJ3N1YndvcmQnXG5cbmNsYXNzIEluc2VydEF0RW5kT2ZTdWJ3b3JkT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0RW5kT2ZPY2N1cnJlbmNlXG4gIEBleHRlbmQoKVxuICBvY2N1cnJlbmNlVHlwZTogJ3N1YndvcmQnXG5cbmNsYXNzIEluc2VydEF0U3RhcnRPZlNtYXJ0V29yZCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICB3aGljaDogJ3N0YXJ0J1xuICB0YXJnZXQ6IFwiTW92ZVRvUHJldmlvdXNTbWFydFdvcmRcIlxuXG5jbGFzcyBJbnNlcnRBdEVuZE9mU21hcnRXb3JkIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnZW5kJ1xuICB0YXJnZXQ6IFwiTW92ZVRvRW5kT2ZTbWFydFdvcmRcIlxuXG5jbGFzcyBJbnNlcnRBdFByZXZpb3VzRm9sZFN0YXJ0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIGZvbGQgc3RhcnQgdGhlbiBlbnRlciBpbnNlcnQtbW9kZVwiXG4gIHdoaWNoOiAnc3RhcnQnXG4gIHRhcmdldDogJ01vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0J1xuXG5jbGFzcyBJbnNlcnRBdE5leHRGb2xkU3RhcnQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBmb2xkIHN0YXJ0IHRoZW4gZW50ZXIgaW5zZXJ0LW1vZGVcIlxuICB3aGljaDogJ2VuZCdcbiAgdGFyZ2V0OiAnTW92ZVRvTmV4dEZvbGRTdGFydCdcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBDaGFuZ2UgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIHJlcXVpcmVUYXJnZXQ6IHRydWVcbiAgdHJhY2tDaGFuZ2U6IHRydWVcbiAgc3VwcG9ydEluc2VydGlvbkNvdW50OiBmYWxzZVxuXG4gIG11dGF0ZVRleHQ6IC0+XG4gICAgIyBBbGx3YXlzIGR5bmFtaWNhbGx5IGRldGVybWluZSBzZWxlY3Rpb24gd2lzZSB3dGhvdXQgY29uc3VsdGluZyB0YXJnZXQud2lzZVxuICAgICMgUmVhc29uOiB3aGVuIGBjIGkge2AsIHdpc2UgaXMgJ2NoYXJhY3Rlcndpc2UnLCBidXQgYWN0dWFsbHkgc2VsZWN0ZWQgcmFuZ2UgaXMgJ2xpbmV3aXNlJ1xuICAgICMgICB7XG4gICAgIyAgICAgYVxuICAgICMgICB9XG4gICAgaXNMaW5ld2lzZVRhcmdldCA9IEBzd3JhcC5kZXRlY3RXaXNlKEBlZGl0b3IpIGlzICdsaW5ld2lzZSdcbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBAc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKSB1bmxlc3MgQGdldENvbmZpZygnZG9udFVwZGF0ZVJlZ2lzdGVyT25DaGFuZ2VPclN1YnN0aXR1dGUnKVxuICAgICAgaWYgaXNMaW5ld2lzZVRhcmdldFxuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChcIlxcblwiLCBhdXRvSW5kZW50OiB0cnVlKVxuICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLm1vdmVMZWZ0KClcbiAgICAgIGVsc2VcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoJycsIGF1dG9JbmRlbnQ6IHRydWUpXG5cbmNsYXNzIENoYW5nZU9jY3VycmVuY2UgZXh0ZW5kcyBDaGFuZ2VcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJDaGFuZ2UgYWxsIG1hdGNoaW5nIHdvcmQgd2l0aGluIHRhcmdldCByYW5nZVwiXG4gIG9jY3VycmVuY2U6IHRydWVcblxuY2xhc3MgU3Vic3RpdHV0ZSBleHRlbmRzIENoYW5nZVxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiAnTW92ZVJpZ2h0J1xuXG5jbGFzcyBTdWJzdGl0dXRlTGluZSBleHRlbmRzIENoYW5nZVxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJyAjIFtGSVhNRV0gdG8gcmUtb3ZlcnJpZGUgdGFyZ2V0Lndpc2UgaW4gdmlzdWFsLW1vZGVcbiAgdGFyZ2V0OiAnTW92ZVRvUmVsYXRpdmVMaW5lJ1xuXG4jIGFsaWFzXG5jbGFzcyBDaGFuZ2VMaW5lIGV4dGVuZHMgU3Vic3RpdHV0ZUxpbmVcbiAgQGV4dGVuZCgpXG5cbmNsYXNzIENoYW5nZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIENoYW5nZVxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiAnTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSdcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIEB0YXJnZXQud2lzZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgQG9uRGlkU2VsZWN0VGFyZ2V0ID0+XG4gICAgICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQGdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuICAgICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5leHRlbmRNZW1iZXJTZWxlY3Rpb25zVG9FbmRPZkxpbmUoKVxuICAgIHN1cGVyXG4iXX0=
