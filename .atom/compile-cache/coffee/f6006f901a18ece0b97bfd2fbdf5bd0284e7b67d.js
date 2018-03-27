(function() {
  var ActivateInsertMode, ActivateReplaceMode, Change, ChangeLine, ChangeOccurrence, ChangeToLastCharacterOfLine, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtEndOfOccurrence, InsertAtEndOfSmartWord, InsertAtEndOfSubwordOccurrence, InsertAtEndOfTarget, InsertAtFirstCharacterOfLine, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertAtStartOfOccurrence, InsertAtStartOfSmartWord, InsertAtStartOfSubwordOccurrence, InsertAtStartOfTarget, InsertBelowWithNewline, InsertByTarget, Operator, Range, Substitute, SubstituteLine, _, isEmptyRow, limitNumber, moveCursorLeft, moveCursorRight, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  Range = require('atom').Range;

  ref = require('./utils'), moveCursorLeft = ref.moveCursorLeft, moveCursorRight = ref.moveCursorRight, limitNumber = ref.limitNumber, isEmptyRow = ref.isEmptyRow;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLWluc2VydC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDZvQkFBQTtJQUFBOzs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNILFFBQVMsT0FBQSxDQUFRLE1BQVI7O0VBRVYsTUFLSSxPQUFBLENBQVEsU0FBUixDQUxKLEVBQ0UsbUNBREYsRUFFRSxxQ0FGRixFQUdFLDZCQUhGLEVBSUU7O0VBRUYsUUFBQSxHQUFXLE9BQUEsQ0FBUSxRQUFSLENBQWlCLENBQUMsUUFBbEIsQ0FBMkIsVUFBM0I7O0VBTUw7Ozs7Ozs7SUFDSixrQkFBQyxDQUFBLE1BQUQsQ0FBQTs7aUNBQ0EsYUFBQSxHQUFlOztpQ0FDZixXQUFBLEdBQWE7O2lDQUNiLFlBQUEsR0FBYzs7aUNBQ2QscUJBQUEsR0FBdUI7O2lDQUV2Qix5QkFBQSxHQUEyQixTQUFBO0FBQ3pCLFVBQUE7YUFBQSxVQUFBLEdBQWEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxXQUFXLENBQUMseUJBQXRCLENBQWdELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQzNELGNBQUE7VUFENkQsT0FBRDtVQUM1RCxJQUFjLElBQUEsS0FBUSxRQUF0QjtBQUFBLG1CQUFBOztVQUNBLFVBQVUsQ0FBQyxPQUFYLENBQUE7VUFFQSxLQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFmLENBQW1CLEdBQW5CLEVBQXdCLEtBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxDQUF4QjtVQUNBLGVBQUEsR0FBa0I7VUFDbEIsSUFBRyxNQUFBLEdBQVMsS0FBQyxDQUFBLHdCQUFELENBQTBCLFFBQTFCLENBQVo7WUFDRSxLQUFDLENBQUEsVUFBRCxHQUFjO1lBQ2QsS0FBQyxDQUFBLGdCQUFELENBQXNCLElBQUEs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QUFBLEdBQVE7OzBDQUVSLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsS0FBZ0IsV0FBbkI7UUFDRSxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtBQUNqQixnQkFBQTtBQUFBO0FBQUE7aUJBQUEsc0NBQUE7OzJCQUNFLGtCQUFrQixDQUFDLGlDQUFuQixDQUFBO0FBREY7O1VBRGlCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixFQURGOzthQUlBLDBEQUFBLFNBQUE7SUFMTzs7OztLQUorQjtBQXpVMUMiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue1JhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbntcbiAgbW92ZUN1cnNvckxlZnRcbiAgbW92ZUN1cnNvclJpZ2h0XG4gIGxpbWl0TnVtYmVyXG4gIGlzRW1wdHlSb3dcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuT3BlcmF0b3IgPSByZXF1aXJlKCcuL2Jhc2UnKS5nZXRDbGFzcygnT3BlcmF0b3InKVxuXG4jIE9wZXJhdG9yIHdoaWNoIHN0YXJ0ICdpbnNlcnQtbW9kZSdcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBbTk9URV1cbiMgUnVsZTogRG9uJ3QgbWFrZSBhbnkgdGV4dCBtdXRhdGlvbiBiZWZvcmUgY2FsbGluZyBgQHNlbGVjdFRhcmdldCgpYC5cbmNsYXNzIEFjdGl2YXRlSW5zZXJ0TW9kZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICByZXF1aXJlVGFyZ2V0OiBmYWxzZVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgZmluYWxTdWJtb2RlOiBudWxsXG4gIHN1cHBvcnRJbnNlcnRpb25Db3VudDogdHJ1ZVxuXG4gIG9ic2VydmVXaWxsRGVhY3RpdmF0ZU1vZGU6IC0+XG4gICAgZGlzcG9zYWJsZSA9IEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5wcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlICh7bW9kZX0pID0+XG4gICAgICByZXR1cm4gdW5sZXNzIG1vZGUgaXMgJ2luc2VydCdcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgICAgIEB2aW1TdGF0ZS5tYXJrLnNldCgnXicsIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkgIyBMYXN0IGluc2VydC1tb2RlIHBvc2l0aW9uXG4gICAgICB0ZXh0QnlVc2VySW5wdXQgPSAnJ1xuICAgICAgaWYgY2hhbmdlID0gQGdldENoYW5nZVNpbmNlQ2hlY2twb2ludCgnaW5zZXJ0JylcbiAgICAgICAgQGxhc3RDaGFuZ2UgPSBjaGFuZ2VcbiAgICAgICAgQHNldE1hcmtGb3JDaGFuZ2UobmV3IFJhbmdlKGNoYW5nZS5zdGFydCwgY2hhbmdlLnN0YXJ0LnRyYXZlcnNlKGNoYW5nZS5uZXdFeHRlbnQpKSlcbiAgICAgICAgdGV4dEJ5VXNlcklucHV0ID0gY2hhbmdlLm5ld1RleHRcbiAgICAgIEB2aW1TdGF0ZS5yZWdpc3Rlci5zZXQoJy4nLCB0ZXh0OiB0ZXh0QnlVc2VySW5wdXQpICMgTGFzdCBpbnNlcnRlZCB0ZXh0XG5cbiAgICAgIF8udGltZXMgQGdldEluc2VydGlvbkNvdW50KCksID0+XG4gICAgICAgIHRleHQgPSBAdGV4dEJ5T3BlcmF0b3IgKyB0ZXh0QnlVc2VySW5wdXRcbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIGF1dG9JbmRlbnQ6IHRydWUpXG5cbiAgICAgICMgVGhpcyBjdXJzb3Igc3RhdGUgaXMgcmVzdG9yZWQgb24gdW5kby5cbiAgICAgICMgU28gY3Vyc29yIHN0YXRlIGhhcyB0byBiZSB1cGRhdGVkIGJlZm9yZSBuZXh0IGdyb3VwQ2hhbmdlc1NpbmNlQ2hlY2twb2ludCgpXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdjbGVhck11bHRpcGxlQ3Vyc29yc09uRXNjYXBlSW5zZXJ0TW9kZScpXG4gICAgICAgIEB2aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuXG4gICAgICAjIGdyb3VwaW5nIGNoYW5nZXMgZm9yIHVuZG8gY2hlY2twb2ludCBuZWVkIHRvIGNvbWUgbGFzdFxuICAgICAgaWYgQGdldENvbmZpZygnZ3JvdXBDaGFuZ2VzV2hlbkxlYXZpbmdJbnNlcnRNb2RlJylcbiAgICAgICAgQGdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG5cbiAgIyBXaGVuIGVhY2ggbXV0YWlvbidzIGV4dGVudCBpcyBub3QgaW50ZXJzZWN0aW5nLCBtdWl0aXBsZSBjaGFuZ2VzIGFyZSByZWNvcmRlZFxuICAjIGUuZ1xuICAjICAtIE11bHRpY3Vyc29ycyBlZGl0XG4gICMgIC0gQ3Vyc29yIG1vdmVkIGluIGluc2VydC1tb2RlKGUuZyBjdHJsLWYsIGN0cmwtYilcbiAgIyBCdXQgSSBkb24ndCBjYXJlIG11bHRpcGxlIGNoYW5nZXMganVzdCBiZWNhdXNlIEknbSBsYXp5KHNvIG5vdCBwZXJmZWN0IGltcGxlbWVudGF0aW9uKS5cbiAgIyBJIG9ubHkgdGFrZSBjYXJlIG9mIG9uZSBjaGFuZ2UgaGFwcGVuZWQgYXQgZWFybGllc3QodG9wQ3Vyc29yJ3MgY2hhbmdlKSBwb3NpdGlvbi5cbiAgIyBUaGF0cycgd2h5IEkgc2F2ZSB0b3BDdXJzb3IncyBwb3NpdGlvbiB0byBAdG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0IHRvIGNvbXBhcmUgdHJhdmVyc2FsIHRvIGRlbGV0aW9uU3RhcnRcbiAgIyBXaHkgSSB1c2UgdG9wQ3Vyc29yJ3MgY2hhbmdlPyBKdXN0IGJlY2F1c2UgaXQncyBlYXN5IHRvIHVzZSBmaXJzdCBjaGFuZ2UgcmV0dXJuZWQgYnkgZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCkuXG4gIGdldENoYW5nZVNpbmNlQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgY2hlY2twb2ludCA9IEBnZXRCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgQGVkaXRvci5idWZmZXIuZ2V0Q2hhbmdlc1NpbmNlQ2hlY2twb2ludChjaGVja3BvaW50KVswXVxuXG4gICMgW0JVRy1CVVQtT0tdIFJlcGxheWluZyB0ZXh0LWRlbGV0aW9uLW9wZXJhdGlvbiBpcyBub3QgY29tcGF0aWJsZSB0byBwdXJlIFZpbS5cbiAgIyBQdXJlIFZpbSByZWNvcmQgYWxsIG9wZXJhdGlvbiBpbiBpbnNlcnQtbW9kZSBhcyBrZXlzdHJva2UgbGV2ZWwgYW5kIGNhbiBkaXN0aW5ndWlzaFxuICAjIGNoYXJhY3RlciBkZWxldGVkIGJ5IGBEZWxldGVgIG9yIGJ5IGBjdHJsLXVgLlxuICAjIEJ1dCBJIGNhbiBub3QgYW5kIGRvbid0IHRyeWluZyB0byBtaW5pYyB0aGlzIGxldmVsIG9mIGNvbXBhdGliaWxpdHkuXG4gICMgU28gYmFzaWNhbGx5IGRlbGV0aW9uLWRvbmUtaW4tb25lIGlzIGV4cGVjdGVkIHRvIHdvcmsgd2VsbC5cbiAgcmVwbGF5TGFzdENoYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBpZiBAbGFzdENoYW5nZT9cbiAgICAgIHtzdGFydCwgbmV3RXh0ZW50LCBvbGRFeHRlbnQsIG5ld1RleHR9ID0gQGxhc3RDaGFuZ2VcbiAgICAgIHVubGVzcyBvbGRFeHRlbnQuaXNaZXJvKClcbiAgICAgICAgdHJhdmVyc2FsVG9TdGFydE9mRGVsZXRlID0gc3RhcnQudHJhdmVyc2FsRnJvbShAdG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0KVxuICAgICAgICBkZWxldGlvblN0YXJ0ID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYXZlcnNlKHRyYXZlcnNhbFRvU3RhcnRPZkRlbGV0ZSlcbiAgICAgICAgZGVsZXRpb25FbmQgPSBkZWxldGlvblN0YXJ0LnRyYXZlcnNlKG9sZEV4dGVudClcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKFtkZWxldGlvblN0YXJ0LCBkZWxldGlvbkVuZF0pXG4gICAgZWxzZVxuICAgICAgbmV3VGV4dCA9ICcnXG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQobmV3VGV4dCwgYXV0b0luZGVudDogdHJ1ZSlcblxuICAjIGNhbGxlZCB3aGVuIHJlcGVhdGVkXG4gICMgW0ZJWE1FXSB0byB1c2UgcmVwbGF5TGFzdENoYW5nZSBpbiByZXBlYXRJbnNlcnQgb3ZlcnJpZGluZyBzdWJjbGFzc3MuXG4gIHJlcGVhdEluc2VydDogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICBAcmVwbGF5TGFzdENoYW5nZShzZWxlY3Rpb24pXG5cbiAgZ2V0SW5zZXJ0aW9uQ291bnQ6IC0+XG4gICAgQGluc2VydGlvbkNvdW50ID89IGlmIEBzdXBwb3J0SW5zZXJ0aW9uQ291bnQgdGhlbiBAZ2V0Q291bnQoLTEpIGVsc2UgMFxuICAgICMgQXZvaWQgZnJlZXppbmcgYnkgYWNjY2lkZW50YWwgYmlnIGNvdW50KGUuZy4gYDU1NTU1NTU1NTU1NTVpYCksIFNlZSAjNTYwLCAjNTk2XG4gICAgbGltaXROdW1iZXIoQGluc2VydGlvbkNvdW50LCBtYXg6IDEwMClcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIEByZXBlYXRlZFxuICAgICAgQGZsYXNoVGFyZ2V0ID0gQHRyYWNrQ2hhbmdlID0gdHJ1ZVxuXG4gICAgICBAc3RhcnRNdXRhdGlvbiA9PlxuICAgICAgICBAc2VsZWN0VGFyZ2V0KCkgaWYgQHRhcmdldD9cbiAgICAgICAgQG11dGF0ZVRleHQ/KClcbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIEByZXBlYXRJbnNlcnQoc2VsZWN0aW9uLCBAbGFzdENoYW5nZT8ubmV3VGV4dCA/ICcnKVxuICAgICAgICAgIG1vdmVDdXJzb3JMZWZ0KHNlbGVjdGlvbi5jdXJzb3IpXG4gICAgICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLWZpbmlzaCcpXG5cbiAgICAgIGlmIEBnZXRDb25maWcoJ2NsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlJylcbiAgICAgICAgQHZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgICBlbHNlXG4gICAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgIEBjcmVhdGVCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcbiAgICAgIEBzZWxlY3RUYXJnZXQoKSBpZiBAdGFyZ2V0P1xuICAgICAgQG9ic2VydmVXaWxsRGVhY3RpdmF0ZU1vZGUoKVxuXG4gICAgICBAbXV0YXRlVGV4dD8oKVxuXG4gICAgICBpZiBAZ2V0SW5zZXJ0aW9uQ291bnQoKSA+IDBcbiAgICAgICAgQHRleHRCeU9wZXJhdG9yID0gQGdldENoYW5nZVNpbmNlQ2hlY2twb2ludCgndW5kbycpPy5uZXdUZXh0ID8gJydcblxuICAgICAgQGNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQoJ2luc2VydCcpXG4gICAgICB0b3BDdXJzb3IgPSBAZWRpdG9yLmdldEN1cnNvcnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpWzBdXG4gICAgICBAdG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0ID0gdG9wQ3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgICAgIyBTa2lwIG5vcm1hbGl6YXRpb24gb2YgYmxvY2t3aXNlU2VsZWN0aW9uLlxuICAgICAgIyBTaW5jZSB3YW50IHRvIGtlZXAgbXVsdGktY3Vyc29yIGFuZCBpdCdzIHBvc2l0aW9uIGluIHdoZW4gc2hpZnQgdG8gaW5zZXJ0LW1vZGUuXG4gICAgICBmb3IgYmxvY2t3aXNlU2VsZWN0aW9uIGluIEBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKClcbiAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnNraXBOb3JtYWxpemF0aW9uKClcbiAgICAgIEBhY3RpdmF0ZU1vZGUoJ2luc2VydCcsIEBmaW5hbFN1Ym1vZGUpXG5cbmNsYXNzIEFjdGl2YXRlUmVwbGFjZU1vZGUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGZpbmFsU3VibW9kZTogJ3JlcGxhY2UnXG5cbiAgcmVwZWF0SW5zZXJ0OiAoc2VsZWN0aW9uLCB0ZXh0KSAtPlxuICAgIGZvciBjaGFyIGluIHRleHQgd2hlbiAoY2hhciBpc250IFwiXFxuXCIpXG4gICAgICBicmVhayBpZiBzZWxlY3Rpb24uY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuICAgICAgc2VsZWN0aW9uLnNlbGVjdFJpZ2h0KClcbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCBhdXRvSW5kZW50OiBmYWxzZSlcblxuY2xhc3MgSW5zZXJ0QWZ0ZXIgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgbW92ZUN1cnNvclJpZ2h0KGN1cnNvcikgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgIHN1cGVyXG5cbiMga2V5OiAnZyBJJyBpbiBhbGwgbW9kZVxuY2xhc3MgSW5zZXJ0QXRCZWdpbm5pbmdPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIEBzdWJtb2RlIGluIFsnY2hhcmFjdGVyd2lzZScsICdsaW5ld2lzZSddXG4gICAgICBAZWRpdG9yLnNwbGl0U2VsZWN0aW9uc0ludG9MaW5lcygpXG4gICAgQGVkaXRvci5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKVxuICAgIHN1cGVyXG5cbiMga2V5OiBub3JtYWwgJ0EnXG5jbGFzcyBJbnNlcnRBZnRlckVuZE9mTGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yLm1vdmVUb0VuZE9mTGluZSgpXG4gICAgc3VwZXJcblxuIyBrZXk6IG5vcm1hbCAnSSdcbmNsYXNzIEluc2VydEF0Rmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgQGVkaXRvci5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKVxuICAgIEBlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuICAgIHN1cGVyXG5cbmNsYXNzIEluc2VydEF0TGFzdEluc2VydCBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBpZiAocG9pbnQgPSBAdmltU3RhdGUubWFyay5nZXQoJ14nKSlcbiAgICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICBAZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oe2NlbnRlcjogdHJ1ZX0pXG4gICAgc3VwZXJcblxuY2xhc3MgSW5zZXJ0QWJvdmVXaXRoTmV3bGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcblxuICAjIFRoaXMgaXMgZm9yIGBvYCBhbmQgYE9gIG9wZXJhdG9yLlxuICAjIE9uIHVuZG8vcmVkbyBwdXQgY3Vyc29yIGF0IG9yaWdpbmFsIHBvaW50IHdoZXJlIHVzZXIgdHlwZSBgb2Agb3IgYE9gLlxuICBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQ6IC0+XG4gICAgbGFzdEN1cnNvciA9IEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgY3Vyc29yUG9zaXRpb24gPSBsYXN0Q3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBsYXN0Q3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKEB2aW1TdGF0ZS5nZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXIoKSlcblxuICAgIHN1cGVyXG5cbiAgICBsYXN0Q3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGN1cnNvclBvc2l0aW9uKVxuXG4gIGF1dG9JbmRlbnRFbXB0eVJvd3M6IC0+XG4gICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgcm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgICBAZWRpdG9yLmF1dG9JbmRlbnRCdWZmZXJSb3cocm93KSBpZiBpc0VtcHR5Um93KEBlZGl0b3IsIHJvdylcblxuICBtdXRhdGVUZXh0OiAtPlxuICAgIEBlZGl0b3IuaW5zZXJ0TmV3bGluZUFib3ZlKClcbiAgICBAYXV0b0luZGVudEVtcHR5Um93cygpIGlmIEBlZGl0b3IuYXV0b0luZGVudFxuXG4gIHJlcGVhdEluc2VydDogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LnRyaW1MZWZ0KCksIGF1dG9JbmRlbnQ6IHRydWUpXG5cbmNsYXNzIEluc2VydEJlbG93V2l0aE5ld2xpbmUgZXh0ZW5kcyBJbnNlcnRBYm92ZVdpdGhOZXdsaW5lXG4gIEBleHRlbmQoKVxuICBtdXRhdGVUZXh0OiAtPlxuICAgIEBlZGl0b3IuaW5zZXJ0TmV3bGluZUJlbG93KClcbiAgICBAYXV0b0luZGVudEVtcHR5Um93cygpIGlmIEBlZGl0b3IuYXV0b0luZGVudFxuXG4jIEFkdmFuY2VkIEluc2VydGlvblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBJbnNlcnRCeVRhcmdldCBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKGZhbHNlKVxuICByZXF1aXJlVGFyZ2V0OiB0cnVlXG4gIHdoaWNoOiBudWxsICMgb25lIG9mIFsnc3RhcnQnLCAnZW5kJywgJ2hlYWQnLCAndGFpbCddXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICAjIEhBQ0tcbiAgICAjIFdoZW4gZyBpIGlzIG1hcHBlZCB0byBgaW5zZXJ0LWF0LXN0YXJ0LW9mLXRhcmdldGAuXG4gICAgIyBgZyBpIDMgbGAgc3RhcnQgaW5zZXJ0IGF0IDMgY29sdW1uIHJpZ2h0IHBvc2l0aW9uLlxuICAgICMgSW4gdGhpcyBjYXNlLCB3ZSBkb24ndCB3YW50IHJlcGVhdCBpbnNlcnRpb24gMyB0aW1lcy5cbiAgICAjIFRoaXMgQGdldENvdW50KCkgY2FsbCBjYWNoZSBudW1iZXIgYXQgdGhlIHRpbWluZyBCRUZPUkUgJzMnIGlzIHNwZWNpZmllZC5cbiAgICBAZ2V0Q291bnQoKVxuICAgIHN1cGVyXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAb25EaWRTZWxlY3RUYXJnZXQgPT5cbiAgICAgICMgSW4gdkMvdkwsIHdoZW4gb2NjdXJyZW5jZSBtYXJrZXIgd2FzIE5PVCBzZWxlY3RlZCxcbiAgICAgICMgaXQgYmVoYXZlJ3MgdmVyeSBzcGVjaWFsbHlcbiAgICAgICMgdkM6IGBJYCBhbmQgYEFgIGJlaGF2ZXMgYXMgc2hvZnQgaGFuZCBvZiBgY3RybC12IElgIGFuZCBgY3RybC12IEFgLlxuICAgICAgIyB2TDogYElgIGFuZCBgQWAgcGxhY2UgY3Vyc29ycyBhdCBlYWNoIHNlbGVjdGVkIGxpbmVzIG9mIHN0YXJ0KCBvciBlbmQgKSBvZiBub24td2hpdGUtc3BhY2UgY2hhci5cbiAgICAgIGlmIG5vdCBAb2NjdXJyZW5jZVNlbGVjdGVkIGFuZCBAbW9kZSBpcyAndmlzdWFsJyBhbmQgQHN1Ym1vZGUgaW4gWydjaGFyYWN0ZXJ3aXNlJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgZm9yICRzZWxlY3Rpb24gaW4gQHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcbiAgICAgICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoJ2Jsb2Nrd2lzZScpXG5cbiAgICAgICAgaWYgQHN1Ym1vZGUgaXMgJ2xpbmV3aXNlJ1xuICAgICAgICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQGdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuICAgICAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLmV4cGFuZE1lbWJlclNlbGVjdGlvbnNPdmVyTGluZVdpdGhUcmltUmFuZ2UoKVxuXG4gICAgICBmb3IgJHNlbGVjdGlvbiBpbiBAc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuICAgICAgICAkc2VsZWN0aW9uLnNldEJ1ZmZlclBvc2l0aW9uVG8oQHdoaWNoKVxuICAgIHN1cGVyXG5cbiMga2V5OiAnSScsIFVzZWQgaW4gJ3Zpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2UnLCB2aXN1YWwtbW9kZS5ibG9ja3dpc2VcbmNsYXNzIEluc2VydEF0U3RhcnRPZlRhcmdldCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICB3aGljaDogJ3N0YXJ0J1xuXG4jIGtleTogJ0EnLCBVc2VkIGluICd2aXN1YWwtbW9kZS5jaGFyYWN0ZXJ3aXNlJywgJ3Zpc3VhbC1tb2RlLmJsb2Nrd2lzZSdcbmNsYXNzIEluc2VydEF0RW5kT2ZUYXJnZXQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdlbmQnXG5cbmNsYXNzIEluc2VydEF0U3RhcnRPZk9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdzdGFydCdcbiAgb2NjdXJyZW5jZTogdHJ1ZVxuXG5jbGFzcyBJbnNlcnRBdEVuZE9mT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICB3aGljaDogJ2VuZCdcbiAgb2NjdXJyZW5jZTogdHJ1ZVxuXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZTdWJ3b3JkT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0U3RhcnRPZk9jY3VycmVuY2VcbiAgQGV4dGVuZCgpXG4gIG9jY3VycmVuY2VUeXBlOiAnc3Vid29yZCdcblxuY2xhc3MgSW5zZXJ0QXRFbmRPZlN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRFbmRPZk9jY3VycmVuY2VcbiAgQGV4dGVuZCgpXG4gIG9jY3VycmVuY2VUeXBlOiAnc3Vid29yZCdcblxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mU21hcnRXb3JkIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnc3RhcnQnXG4gIHRhcmdldDogXCJNb3ZlVG9QcmV2aW91c1NtYXJ0V29yZFwiXG5cbmNsYXNzIEluc2VydEF0RW5kT2ZTbWFydFdvcmQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdlbmQnXG4gIHRhcmdldDogXCJNb3ZlVG9FbmRPZlNtYXJ0V29yZFwiXG5cbmNsYXNzIEluc2VydEF0UHJldmlvdXNGb2xkU3RhcnQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgZm9sZCBzdGFydCB0aGVuIGVudGVyIGluc2VydC1tb2RlXCJcbiAgd2hpY2g6ICdzdGFydCdcbiAgdGFyZ2V0OiAnTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQnXG5cbmNsYXNzIEluc2VydEF0TmV4dEZvbGRTdGFydCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IGZvbGQgc3RhcnQgdGhlbiBlbnRlciBpbnNlcnQtbW9kZVwiXG4gIHdoaWNoOiAnZW5kJ1xuICB0YXJnZXQ6ICdNb3ZlVG9OZXh0Rm9sZFN0YXJ0J1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIENoYW5nZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgcmVxdWlyZVRhcmdldDogdHJ1ZVxuICB0cmFja0NoYW5nZTogdHJ1ZVxuICBzdXBwb3J0SW5zZXJ0aW9uQ291bnQ6IGZhbHNlXG5cbiAgbXV0YXRlVGV4dDogLT5cbiAgICAjIEFsbHdheXMgZHluYW1pY2FsbHkgZGV0ZXJtaW5lIHNlbGVjdGlvbiB3aXNlIHd0aG91dCBjb25zdWx0aW5nIHRhcmdldC53aXNlXG4gICAgIyBSZWFzb246IHdoZW4gYGMgaSB7YCwgd2lzZSBpcyAnY2hhcmFjdGVyd2lzZScsIGJ1dCBhY3R1YWxseSBzZWxlY3RlZCByYW5nZSBpcyAnbGluZXdpc2UnXG4gICAgIyAgIHtcbiAgICAjICAgICBhXG4gICAgIyAgIH1cbiAgICBpc0xpbmV3aXNlVGFyZ2V0ID0gQHN3cmFwLmRldGVjdFdpc2UoQGVkaXRvcikgaXMgJ2xpbmV3aXNlJ1xuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIEBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pIHVubGVzcyBAZ2V0Q29uZmlnKCdkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZScpXG4gICAgICBpZiBpc0xpbmV3aXNlVGFyZ2V0XG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXFxuXCIsIGF1dG9JbmRlbnQ6IHRydWUpXG4gICAgICAgIHNlbGVjdGlvbi5jdXJzb3IubW92ZUxlZnQoKVxuICAgICAgZWxzZVxuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCgnJywgYXV0b0luZGVudDogdHJ1ZSlcblxuY2xhc3MgQ2hhbmdlT2NjdXJyZW5jZSBleHRlbmRzIENoYW5nZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkNoYW5nZSBhbGwgbWF0Y2hpbmcgd29yZCB3aXRoaW4gdGFyZ2V0IHJhbmdlXCJcbiAgb2NjdXJyZW5jZTogdHJ1ZVxuXG5jbGFzcyBTdWJzdGl0dXRlIGV4dGVuZHMgQ2hhbmdlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlUmlnaHQnXG5cbmNsYXNzIFN1YnN0aXR1dGVMaW5lIGV4dGVuZHMgQ2hhbmdlXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnICMgW0ZJWE1FXSB0byByZS1vdmVycmlkZSB0YXJnZXQud2lzZSBpbiB2aXN1YWwtbW9kZVxuICB0YXJnZXQ6ICdNb3ZlVG9SZWxhdGl2ZUxpbmUnXG5cbiMgYWxpYXNcbmNsYXNzIENoYW5nZUxpbmUgZXh0ZW5kcyBTdWJzdGl0dXRlTGluZVxuICBAZXh0ZW5kKClcblxuY2xhc3MgQ2hhbmdlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgQ2hhbmdlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lJ1xuXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgQHRhcmdldC53aXNlIGlzICdibG9ja3dpc2UnXG4gICAgICBAb25EaWRTZWxlY3RUYXJnZXQgPT5cbiAgICAgICAgZm9yIGJsb2Nrd2lzZVNlbGVjdGlvbiBpbiBAZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpXG4gICAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLmV4dGVuZE1lbWJlclNlbGVjdGlvbnNUb0VuZE9mTGluZSgpXG4gICAgc3VwZXJcbiJdfQ==
