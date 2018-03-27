(function() {
  var ActivateNormalModeOnce, Base, BlockwiseOtherEnd, CopyFromLineAbove, CopyFromLineBelow, InsertLastInserted, InsertMode, InsertRegister, Mark, MiscCommand, Point, Range, Redo, ReplaceModeBackspace, ReverseSelections, ScrollCursor, ScrollCursorToBottom, ScrollCursorToBottomLeave, ScrollCursorToLeft, ScrollCursorToMiddle, ScrollCursorToMiddleLeave, ScrollCursorToRight, ScrollCursorToTop, ScrollCursorToTopLeave, ScrollDown, ScrollUp, ScrollWithoutChangingCursorPosition, ToggleFold, Undo, _, findRangeContainsPoint, humanizeBufferRange, isLeadingWhiteSpaceRange, isLinewiseRange, isSingleLineRange, moveCursorRight, ref, ref1, setBufferRow, sortRanges,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Range = ref.Range, Point = ref.Point;

  Base = require('./base');

  _ = require('underscore-plus');

  ref1 = require('./utils'), moveCursorRight = ref1.moveCursorRight, isLinewiseRange = ref1.isLinewiseRange, setBufferRow = ref1.setBufferRow, sortRanges = ref1.sortRanges, findRangeContainsPoint = ref1.findRangeContainsPoint, isSingleLineRange = ref1.isSingleLineRange, isLeadingWhiteSpaceRange = ref1.isLeadingWhiteSpaceRange, humanizeBufferRange = ref1.humanizeBufferRange;

  MiscCommand = (function(superClass) {
    extend(MiscCommand, superClass);

    MiscCommand.extend(false);

    MiscCommand.operationKind = 'misc-command';

    function MiscCommand() {
      MiscCommand.__super__.constructor.apply(this, arguments);
      this.initialize();
    }

    return MiscCommand;

  })(Base);

  Mark = (function(superClass) {
    extend(Mark, superClass);

    function Mark() {
      return Mark.__super__.constructor.apply(this, arguments);
    }

    Mark.extend();

    Mark.prototype.requireInput = true;

    Mark.prototype.initialize = function() {
      this.focusInput();
      return Mark.__super__.initialize.apply(this, arguments);
    };

    Mark.prototype.execute = function() {
      this.vimState.mark.set(this.input, this.editor.getCursorBufferPosition());
      return this.activateMode('normal');
    };

    return Mark;

  })(MiscCommand);

  ReverseSelections = (function(superClass) {
    extend(ReverseSelections, superClass);

    function ReverseSelections() {
      return ReverseSelections.__super__.constructor.apply(this, arguments);
    }

    ReverseSelections.extend();

    ReverseSelections.prototype.execute = function() {
      this.swrap.setReversedState(this.editor, !this.editor.getLastSelection().isReversed());
      if (this.isMode('visual', 'blockwise')) {
        return this.getLastBlockwiseSelection().autoscroll();
      }
    };

    return ReverseSelections;

  })(MiscCommand);

  BlockwiseOtherEnd = (function(superClass) {
    extend(BlockwiseOtherEnd, superClass);

    function BlockwiseOtherEnd() {
      return BlockwiseOtherEnd.__super__.constructor.apply(this, arguments);
    }

    BlockwiseOtherEnd.extend();

    BlockwiseOtherEnd.prototype.execute = function() {
      var blockwiseSelection, i, len, ref2;
      ref2 = this.getBlockwiseSelections();
      for (i = 0, len = ref2.length; i < len; i++) {
        blockwiseSelection = ref2[i];
        blockwiseSelection.reverse();
      }
      return BlockwiseOtherEnd.__super__.execute.apply(this, arguments);
    };

    return BlockwiseOtherEnd;

  })(ReverseSelections);

  Undo = (function(superClass) {
    extend(Undo, superClass);

    function Undo() {
      return Undo.__super__.constructor.apply(this, arguments);
    }

    Undo.extend();

    Undo.prototype.setCursorPosition = function(arg) {
      var changedRange, lastCursor, newRanges, oldRanges, strategy;
      newRanges = arg.newRanges, oldRanges = arg.oldRanges, strategy = arg.strategy;
      lastCursor = this.editor.getLastCursor();
      if (strategy === 'smart') {
        changedRange = findRangeContainsPoint(newRanges, lastCursor.getBufferPosition());
      } else {
        changedRange = sortRanges(newRanges.concat(oldRanges))[0];
      }
      if (changedRange != null) {
        if (isLinewiseRange(changedRange)) {
          return setBufferRow(lastCursor, changedRange.start.row);
        } else {
          return lastCursor.setBufferPosition(changedRange.start);
        }
      }
    };

    Undo.prototype.mutateWithTrackChanges = function() {
      var disposable, newRanges, oldRanges;
      newRanges = [];
      oldRanges = [];
      disposable = this.editor.getBuffer().onDidChange(function(arg) {
        var newRange, oldRange;
        newRange = arg.newRange, oldRange = arg.oldRange;
        if (newRange.isEmpty()) {
          return oldRanges.push(oldRange);
        } else {
          return newRanges.push(newRange);
        }
      });
      this.mutate();
      disposable.dispose();
      return {
        newRanges: newRanges,
        oldRanges: oldRanges
      };
    };

    Undo.prototype.flashChanges = function(arg) {
      var isMultipleSingleLineRanges, newRanges, oldRanges;
      newRanges = arg.newRanges, oldRanges = arg.oldRanges;
      isMultipleSingleLineRanges = function(ranges) {
        return ranges.length > 1 && ranges.every(isSingleLineRange);
      };
      if (newRanges.length > 0) {
        if (this.isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows(newRanges)) {
          return;
        }
        newRanges = newRanges.map((function(_this) {
          return function(range) {
            return humanizeBufferRange(_this.editor, range);
          };
        })(this));
        newRanges = this.filterNonLeadingWhiteSpaceRange(newRanges);
        if (isMultipleSingleLineRanges(newRanges)) {
          return this.flash(newRanges, {
            type: 'undo-redo-multiple-changes'
          });
        } else {
          return this.flash(newRanges, {
            type: 'undo-redo'
          });
        }
      } else {
        if (this.isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows(oldRanges)) {
          return;
        }
        if (isMultipleSingleLineRanges(oldRanges)) {
          oldRanges = this.filterNonLeadingWhiteSpaceRange(oldRanges);
          return this.flash(oldRanges, {
            type: 'undo-redo-multiple-delete'
          });
        }
      }
    };

    Undo.prototype.filterNonLeadingWhiteSpaceRange = function(ranges) {
      return ranges.filter((function(_this) {
        return function(range) {
          return !isLeadingWhiteSpaceRange(_this.editor, range);
        };
      })(this));
    };

    Undo.prototype.isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows = function(ranges) {
      var end, endColumn, i, len, previousRow, range, ref2, ref3, ref4, start, startColumn;
      if (ranges.length <= 1) {
        return false;
      }
      ref2 = ranges[0], (ref3 = ref2.start, startColumn = ref3.column), (ref4 = ref2.end, endColumn = ref4.column);
      previousRow = null;
      for (i = 0, len = ranges.length; i < len; i++) {
        range = ranges[i];
        start = range.start, end = range.end;
        if (!((start.column === startColumn) && (end.column === endColumn))) {
          return false;
        }
        if ((previousRow != null) && (previousRow + 1 !== start.row)) {
          return false;
        }
        previousRow = start.row;
      }
      return true;
      return ranges.every(function(arg) {
        var end, start;
        start = arg.start, end = arg.end;
        return (start.column === startColumn) && (end.column === endColumn);
      });
    };

    Undo.prototype.flash = function(flashRanges, options) {
      if (options.timeout == null) {
        options.timeout = 500;
      }
      return this.onDidFinishOperation((function(_this) {
        return function() {
          return _this.vimState.flash(flashRanges, options);
        };
      })(this));
    };

    Undo.prototype.execute = function() {
      var i, len, newRanges, oldRanges, ref2, ref3, selection, strategy;
      ref2 = this.mutateWithTrackChanges(), newRanges = ref2.newRanges, oldRanges = ref2.oldRanges;
      ref3 = this.editor.getSelections();
      for (i = 0, len = ref3.length; i < len; i++) {
        selection = ref3[i];
        selection.clear();
      }
      if (this.getConfig('setCursorToStartOfChangeOnUndoRedo')) {
        strategy = this.getConfig('setCursorToStartOfChangeOnUndoRedoStrategy');
        this.setCursorPosition({
          newRanges: newRanges,
          oldRanges: oldRanges,
          strategy: strategy
        });
        this.vimState.clearSelections();
      }
      if (this.getConfig('flashOnUndoRedo')) {
        this.flashChanges({
          newRanges: newRanges,
          oldRanges: oldRanges
        });
      }
      return this.activateMode('normal');
    };

    Undo.prototype.mutate = function() {
      return this.editor.undo();
    };

    return Undo;

  })(MiscCommand);

  Redo = (function(superClass) {
    extend(Redo, superClass);

    function Redo() {
      return Redo.__super__.constructor.apply(this, arguments);
    }

    Redo.extend();

    Redo.prototype.mutate = function() {
      return this.editor.redo();
    };

    return Redo;

  })(Undo);

  ToggleFold = (function(superClass) {
    extend(ToggleFold, superClass);

    function ToggleFold() {
      return ToggleFold.__super__.constructor.apply(this, arguments);
    }

    ToggleFold.extend();

    ToggleFold.prototype.execute = function() {
      var point;
      point = this.editor.getCursorBufferPosition();
      return this.editor.toggleFoldAtBufferRow(point.row);
    };

    return ToggleFold;

  })(MiscCommand);

  ReplaceModeBackspace = (function(superClass) {
    extend(ReplaceModeBackspace, superClass);

    function ReplaceModeBackspace() {
      return ReplaceModeBackspace.__super__.constructor.apply(this, arguments);
    }

    ReplaceModeBackspace.commandScope = 'atom-text-editor.vim-mode-plus.insert-mode.replace';

    ReplaceModeBackspace.extend();

    ReplaceModeBackspace.prototype.execute = function() {
      var char, i, len, ref2, results, selection;
      ref2 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        char = this.vimState.modeManager.getReplacedCharForSelection(selection);
        if (char != null) {
          selection.selectLeft();
          if (!selection.insertText(char).isEmpty()) {
            results.push(selection.cursor.moveLeft());
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    return ReplaceModeBackspace;

  })(MiscCommand);

  ScrollWithoutChangingCursorPosition = (function(superClass) {
    extend(ScrollWithoutChangingCursorPosition, superClass);

    function ScrollWithoutChangingCursorPosition() {
      return ScrollWithoutChangingCursorPosition.__super__.constructor.apply(this, arguments);
    }

    ScrollWithoutChangingCursorPosition.extend(false);

    ScrollWithoutChangingCursorPosition.prototype.scrolloff = 2;

    ScrollWithoutChangingCursorPosition.prototype.cursorPixel = null;

    ScrollWithoutChangingCursorPosition.prototype.getFirstVisibleScreenRow = function() {
      return this.editorElement.getFirstVisibleScreenRow();
    };

    ScrollWithoutChangingCursorPosition.prototype.getLastVisibleScreenRow = function() {
      return this.editorElement.getLastVisibleScreenRow();
    };

    ScrollWithoutChangingCursorPosition.prototype.getLastScreenRow = function() {
      return this.editor.getLastScreenRow();
    };

    ScrollWithoutChangingCursorPosition.prototype.getCursorPixel = function() {
      var point;
      point = this.editor.getCursorScreenPosition();
      return this.editorElement.pixelPositionForScreenPosition(point);
    };

    return ScrollWithoutChangingCursorPosition;

  })(MiscCommand);

  ScrollDown = (function(superClass) {
    extend(ScrollDown, superClass);

    function ScrollDown() {
      return ScrollDown.__super__.constructor.apply(this, arguments);
    }

    ScrollDown.extend();

    ScrollDown.prototype.execute = function() {
      var column, count, margin, newFirstRow, newPoint, oldFirstRow, ref2, row;
      count = this.getCount();
      oldFirstRow = this.editor.getFirstVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow + count);
      newFirstRow = this.editor.getFirstVisibleScreenRow();
      margin = this.editor.getVerticalScrollMargin();
      ref2 = this.editor.getCursorScreenPosition(), row = ref2.row, column = ref2.column;
      if (row < (newFirstRow + margin)) {
        newPoint = [row + count, column];
        return this.editor.setCursorScreenPosition(newPoint, {
          autoscroll: false
        });
      }
    };

    return ScrollDown;

  })(ScrollWithoutChangingCursorPosition);

  ScrollUp = (function(superClass) {
    extend(ScrollUp, superClass);

    function ScrollUp() {
      return ScrollUp.__super__.constructor.apply(this, arguments);
    }

    ScrollUp.extend();

    ScrollUp.prototype.execute = function() {
      var column, count, margin, newLastRow, newPoint, oldFirstRow, ref2, row;
      count = this.getCount();
      oldFirstRow = this.editor.getFirstVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow - count);
      newLastRow = this.editor.getLastVisibleScreenRow();
      margin = this.editor.getVerticalScrollMargin();
      ref2 = this.editor.getCursorScreenPosition(), row = ref2.row, column = ref2.column;
      if (row >= (newLastRow - margin)) {
        newPoint = [row - count, column];
        return this.editor.setCursorScreenPosition(newPoint, {
          autoscroll: false
        });
      }
    };

    return ScrollUp;

  })(ScrollWithoutChangingCursorPosition);

  ScrollCursor = (function(superClass) {
    extend(ScrollCursor, superClass);

    function ScrollCursor() {
      return ScrollCursor.__super__.constructor.apply(this, arguments);
    }

    ScrollCursor.extend(false);

    ScrollCursor.prototype.execute = function() {
      if (typeof this.moveToFirstCharacterOfLine === "function") {
        this.moveToFirstCharacterOfLine();
      }
      if (this.isScrollable()) {
        return this.editorElement.setScrollTop(this.getScrollTop());
      }
    };

    ScrollCursor.prototype.moveToFirstCharacterOfLine = function() {
      return this.editor.moveToFirstCharacterOfLine();
    };

    ScrollCursor.prototype.getOffSetPixelHeight = function(lineDelta) {
      if (lineDelta == null) {
        lineDelta = 0;
      }
      return this.editor.getLineHeightInPixels() * (this.scrolloff + lineDelta);
    };

    return ScrollCursor;

  })(ScrollWithoutChangingCursorPosition);

  ScrollCursorToTop = (function(superClass) {
    extend(ScrollCursorToTop, superClass);

    function ScrollCursorToTop() {
      return ScrollCursorToTop.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToTop.extend();

    ScrollCursorToTop.prototype.isScrollable = function() {
      return this.getLastVisibleScreenRow() !== this.getLastScreenRow();
    };

    ScrollCursorToTop.prototype.getScrollTop = function() {
      return this.getCursorPixel().top - this.getOffSetPixelHeight();
    };

    return ScrollCursorToTop;

  })(ScrollCursor);

  ScrollCursorToTopLeave = (function(superClass) {
    extend(ScrollCursorToTopLeave, superClass);

    function ScrollCursorToTopLeave() {
      return ScrollCursorToTopLeave.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToTopLeave.extend();

    ScrollCursorToTopLeave.prototype.moveToFirstCharacterOfLine = null;

    return ScrollCursorToTopLeave;

  })(ScrollCursorToTop);

  ScrollCursorToBottom = (function(superClass) {
    extend(ScrollCursorToBottom, superClass);

    function ScrollCursorToBottom() {
      return ScrollCursorToBottom.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToBottom.extend();

    ScrollCursorToBottom.prototype.isScrollable = function() {
      return this.getFirstVisibleScreenRow() !== 0;
    };

    ScrollCursorToBottom.prototype.getScrollTop = function() {
      return this.getCursorPixel().top - (this.editorElement.getHeight() - this.getOffSetPixelHeight(1));
    };

    return ScrollCursorToBottom;

  })(ScrollCursor);

  ScrollCursorToBottomLeave = (function(superClass) {
    extend(ScrollCursorToBottomLeave, superClass);

    function ScrollCursorToBottomLeave() {
      return ScrollCursorToBottomLeave.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToBottomLeave.extend();

    ScrollCursorToBottomLeave.prototype.moveToFirstCharacterOfLine = null;

    return ScrollCursorToBottomLeave;

  })(ScrollCursorToBottom);

  ScrollCursorToMiddle = (function(superClass) {
    extend(ScrollCursorToMiddle, superClass);

    function ScrollCursorToMiddle() {
      return ScrollCursorToMiddle.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToMiddle.extend();

    ScrollCursorToMiddle.prototype.isScrollable = function() {
      return true;
    };

    ScrollCursorToMiddle.prototype.getScrollTop = function() {
      return this.getCursorPixel().top - (this.editorElement.getHeight() / 2);
    };

    return ScrollCursorToMiddle;

  })(ScrollCursor);

  ScrollCursorToMiddleLeave = (function(superClass) {
    extend(ScrollCursorToMiddleLeave, superClass);

    function ScrollCursorToMiddleLeave() {
      return ScrollCursorToMiddleLeave.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToMiddleLeave.extend();

    ScrollCursorToMiddleLeave.prototype.moveToFirstCharacterOfLine = null;

    return ScrollCursorToMiddleLeave;

  })(ScrollCursorToMiddle);

  ScrollCursorToLeft = (function(superClass) {
    extend(ScrollCursorToLeft, superClass);

    function ScrollCursorToLeft() {
      return ScrollCursorToLeft.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToLeft.extend();

    ScrollCursorToLeft.prototype.execute = function() {
      return this.editorElement.setScrollLeft(this.getCursorPixel().left);
    };

    return ScrollCursorToLeft;

  })(ScrollWithoutChangingCursorPosition);

  ScrollCursorToRight = (function(superClass) {
    extend(ScrollCursorToRight, superClass);

    function ScrollCursorToRight() {
      return ScrollCursorToRight.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToRight.extend();

    ScrollCursorToRight.prototype.execute = function() {
      return this.editorElement.setScrollRight(this.getCursorPixel().left);
    };

    return ScrollCursorToRight;

  })(ScrollCursorToLeft);

  InsertMode = (function(superClass) {
    extend(InsertMode, superClass);

    function InsertMode() {
      return InsertMode.__super__.constructor.apply(this, arguments);
    }

    InsertMode.commandScope = 'atom-text-editor.vim-mode-plus.insert-mode';

    return InsertMode;

  })(MiscCommand);

  ActivateNormalModeOnce = (function(superClass) {
    extend(ActivateNormalModeOnce, superClass);

    function ActivateNormalModeOnce() {
      return ActivateNormalModeOnce.__super__.constructor.apply(this, arguments);
    }

    ActivateNormalModeOnce.extend();

    ActivateNormalModeOnce.prototype.thisCommandName = ActivateNormalModeOnce.getCommandName();

    ActivateNormalModeOnce.prototype.execute = function() {
      var cursor, cursorsToMoveRight, disposable, i, len;
      cursorsToMoveRight = this.editor.getCursors().filter(function(cursor) {
        return !cursor.isAtBeginningOfLine();
      });
      this.vimState.activate('normal');
      for (i = 0, len = cursorsToMoveRight.length; i < len; i++) {
        cursor = cursorsToMoveRight[i];
        moveCursorRight(cursor);
      }
      return disposable = atom.commands.onDidDispatch((function(_this) {
        return function(arg) {
          var type;
          type = arg.type;
          if (type === _this.thisCommandName) {
            return;
          }
          disposable.dispose();
          disposable = null;
          return _this.vimState.activate('insert');
        };
      })(this));
    };

    return ActivateNormalModeOnce;

  })(InsertMode);

  InsertRegister = (function(superClass) {
    extend(InsertRegister, superClass);

    function InsertRegister() {
      return InsertRegister.__super__.constructor.apply(this, arguments);
    }

    InsertRegister.extend();

    InsertRegister.prototype.requireInput = true;

    InsertRegister.prototype.initialize = function() {
      InsertRegister.__super__.initialize.apply(this, arguments);
      return this.focusInput();
    };

    InsertRegister.prototype.execute = function() {
      return this.editor.transact((function(_this) {
        return function() {
          var i, len, ref2, results, selection, text;
          ref2 = _this.editor.getSelections();
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            selection = ref2[i];
            text = _this.vimState.register.getText(_this.input, selection);
            results.push(selection.insertText(text));
          }
          return results;
        };
      })(this));
    };

    return InsertRegister;

  })(InsertMode);

  InsertLastInserted = (function(superClass) {
    extend(InsertLastInserted, superClass);

    function InsertLastInserted() {
      return InsertLastInserted.__super__.constructor.apply(this, arguments);
    }

    InsertLastInserted.extend();

    InsertLastInserted.description = "Insert text inserted in latest insert-mode.\nEquivalent to *i_CTRL-A* of pure Vim";

    InsertLastInserted.prototype.execute = function() {
      var text;
      text = this.vimState.register.getText('.');
      return this.editor.insertText(text);
    };

    return InsertLastInserted;

  })(InsertMode);

  CopyFromLineAbove = (function(superClass) {
    extend(CopyFromLineAbove, superClass);

    function CopyFromLineAbove() {
      return CopyFromLineAbove.__super__.constructor.apply(this, arguments);
    }

    CopyFromLineAbove.extend();

    CopyFromLineAbove.description = "Insert character of same-column of above line.\nEquivalent to *i_CTRL-Y* of pure Vim";

    CopyFromLineAbove.prototype.rowDelta = -1;

    CopyFromLineAbove.prototype.execute = function() {
      var translation;
      translation = [this.rowDelta, 0];
      return this.editor.transact((function(_this) {
        return function() {
          var i, len, point, range, ref2, results, selection, text;
          ref2 = _this.editor.getSelections();
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            selection = ref2[i];
            point = selection.cursor.getBufferPosition().translate(translation);
            range = Range.fromPointWithDelta(point, 0, 1);
            if (text = _this.editor.getTextInBufferRange(range)) {
              results.push(selection.insertText(text));
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this));
    };

    return CopyFromLineAbove;

  })(InsertMode);

  CopyFromLineBelow = (function(superClass) {
    extend(CopyFromLineBelow, superClass);

    function CopyFromLineBelow() {
      return CopyFromLineBelow.__super__.constructor.apply(this, arguments);
    }

    CopyFromLineBelow.extend();

    CopyFromLineBelow.description = "Insert character of same-column of above line.\nEquivalent to *i_CTRL-E* of pure Vim";

    CopyFromLineBelow.prototype.rowDelta = +1;

    return CopyFromLineBelow;

  })(CopyFromLineAbove);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDBvQkFBQTtJQUFBOzs7RUFBQSxNQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGlCQUFELEVBQVE7O0VBQ1IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosT0FTSSxPQUFBLENBQVEsU0FBUixDQVRKLEVBQ0Usc0NBREYsRUFFRSxzQ0FGRixFQUdFLGdDQUhGLEVBSUUsNEJBSkYsRUFLRSxvREFMRixFQU1FLDBDQU5GLEVBT0Usd0RBUEYsRUFRRTs7RUFHSTs7O0lBQ0osV0FBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOztJQUNBLFdBQUMsQ0FBQSxhQUFELEdBQWdCOztJQUNILHFCQUFBO01BQ1gsOENBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxVQUFELENBQUE7SUFGVzs7OztLQUhXOztFQU9wQjs7Ozs7OztJQUNKLElBQUMsQ0FBQSxNQUFELENBQUE7O21CQUNBLFlBQUEsR0FBYzs7bUJBQ2QsVUFBQSxHQUFZLFNBQUE7TUFDVixJQUFDLENBQUEsVUFBRCxDQUFBO2FBQ0Esc0NBQUEsU0FBQTtJQUZVOzttQkFJWixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLEtBQXBCLEVBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxDQUEzQjthQUNBLElBQUMsQ0FBQSxZQUFELENBQWMsUUFBZDtJQUZPOzs7O0tBUFE7O0VBV2I7Ozs7Ozs7SUFDSixpQkFBQyxDQUFBLE1BQUQsQ0FBQTs7Z0NBQ0EsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsS0FBSyxD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U0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBakIsQ0FBQSxDQUFvQyxDQUFDLFNBQXJDLENBQStDLFdBQS9DO1lBQ1IsS0FBQSxHQUFRLEtBQUssQ0FBQyxrQkFBTixDQUF5QixLQUF6QixFQUFnQyxDQUFoQyxFQUFtQyxDQUFuQztZQUNSLElBQUcsSUFBQSxHQUFPLEtBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsS0FBN0IsQ0FBVjsyQkFDRSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixHQURGO2FBQUEsTUFBQTttQ0FBQTs7QUFIRjs7UUFEZTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakI7SUFGTzs7OztLQVJxQjs7RUFpQjFCOzs7Ozs7O0lBQ0osaUJBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsaUJBQUMsQ0FBQSxXQUFELEdBQWM7O2dDQUlkLFFBQUEsR0FBVSxDQUFDOzs7O0tBTm1CO0FBcldoQyIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgUG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG57XG4gIG1vdmVDdXJzb3JSaWdodFxuICBpc0xpbmV3aXNlUmFuZ2VcbiAgc2V0QnVmZmVyUm93XG4gIHNvcnRSYW5nZXNcbiAgZmluZFJhbmdlQ29udGFpbnNQb2ludFxuICBpc1NpbmdsZUxpbmVSYW5nZVxuICBpc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2VcbiAgaHVtYW5pemVCdWZmZXJSYW5nZVxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIE1pc2NDb21tYW5kIGV4dGVuZHMgQmFzZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBAb3BlcmF0aW9uS2luZDogJ21pc2MtY29tbWFuZCdcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcbiAgICBAaW5pdGlhbGl6ZSgpXG5cbmNsYXNzIE1hcmsgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQGZvY3VzSW5wdXQoKVxuICAgIHN1cGVyXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAdmltU3RhdGUubWFyay5zZXQoQGlucHV0LCBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJylcblxuY2xhc3MgUmV2ZXJzZVNlbGVjdGlvbnMgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBAc3dyYXAuc2V0UmV2ZXJzZWRTdGF0ZShAZWRpdG9yLCBub3QgQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuaXNSZXZlcnNlZCgpKVxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgQGdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5hdXRvc2Nyb2xsKClcblxuY2xhc3MgQmxvY2t3aXNlT3RoZXJFbmQgZXh0ZW5kcyBSZXZlcnNlU2VsZWN0aW9uc1xuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBmb3IgYmxvY2t3aXNlU2VsZWN0aW9uIGluIEBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKClcbiAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5yZXZlcnNlKClcbiAgICBzdXBlclxuXG5jbGFzcyBVbmRvIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGV4dGVuZCgpXG5cbiAgc2V0Q3Vyc29yUG9zaXRpb246ICh7bmV3UmFuZ2VzLCBvbGRSYW5nZXMsIHN0cmF0ZWd5fSkgLT5cbiAgICBsYXN0Q3Vyc29yID0gQGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkgIyBUaGlzIGlzIHJlc3RvcmVkIGN1cnNvclxuXG4gICAgaWYgc3RyYXRlZ3kgaXMgJ3NtYXJ0J1xuICAgICAgY2hhbmdlZFJhbmdlID0gZmluZFJhbmdlQ29udGFpbnNQb2ludChuZXdSYW5nZXMsIGxhc3RDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBlbHNlXG4gICAgICBjaGFuZ2VkUmFuZ2UgPSBzb3J0UmFuZ2VzKG5ld1Jhbmdlcy5jb25jYXQob2xkUmFuZ2VzKSlbMF1cblxuICAgIGlmIGNoYW5nZWRSYW5nZT9cbiAgICAgIGlmIGlzTGluZXdpc2VSYW5nZShjaGFuZ2VkUmFuZ2UpXG4gICAgICAgIHNldEJ1ZmZlclJvdyhsYXN0Q3Vyc29yLCBjaGFuZ2VkUmFuZ2Uuc3RhcnQucm93KVxuICAgICAgZWxzZVxuICAgICAgICBsYXN0Q3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGNoYW5nZWRSYW5nZS5zdGFydClcblxuICBtdXRhdGVXaXRoVHJhY2tDaGFuZ2VzOiAtPlxuICAgIG5ld1JhbmdlcyA9IFtdXG4gICAgb2xkUmFuZ2VzID0gW11cblxuICAgICMgQ29sbGVjdCBjaGFuZ2VkIHJhbmdlIHdoaWxlIG11dGF0aW5nIHRleHQtc3RhdGUgYnkgZm4gY2FsbGJhY2suXG4gICAgZGlzcG9zYWJsZSA9IEBlZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRDaGFuZ2UgKHtuZXdSYW5nZSwgb2xkUmFuZ2V9KSAtPlxuICAgICAgaWYgbmV3UmFuZ2UuaXNFbXB0eSgpXG4gICAgICAgIG9sZFJhbmdlcy5wdXNoKG9sZFJhbmdlKSAjIFJlbW92ZSBvbmx5XG4gICAgICBlbHNlXG4gICAgICAgIG5ld1Jhbmdlcy5wdXNoKG5ld1JhbmdlKVxuXG4gICAgQG11dGF0ZSgpXG5cbiAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgIHtuZXdSYW5nZXMsIG9sZFJhbmdlc31cblxuICBmbGFzaENoYW5nZXM6ICh7bmV3UmFuZ2VzLCBvbGRSYW5nZXN9KSAtPlxuICAgIGlzTXVsdGlwbGVTaW5nbGVMaW5lUmFuZ2VzID0gKHJhbmdlcykgLT5cbiAgICAgIHJhbmdlcy5sZW5ndGggPiAxIGFuZCByYW5nZXMuZXZlcnkoaXNTaW5nbGVMaW5lUmFuZ2UpXG5cbiAgICBpZiBuZXdSYW5nZXMubGVuZ3RoID4gMFxuICAgICAgcmV0dXJuIGlmIEBpc011bHRpcGxlQW5kQWxsUmFuZ2VIYXZlU2FtZUNvbHVtbkFuZENvbnNlY3V0aXZlUm93cyhuZXdSYW5nZXMpXG4gICAgICBuZXdSYW5nZXMgPSBuZXdSYW5nZXMubWFwIChyYW5nZSkgPT4gaHVtYW5pemVCdWZmZXJSYW5nZShAZWRpdG9yLCByYW5nZSlcbiAgICAgIG5ld1JhbmdlcyA9IEBmaWx0ZXJOb25MZWFkaW5nV2hpdGVTcGFjZVJhbmdlKG5ld1JhbmdlcylcblxuICAgICAgaWYgaXNNdWx0aXBsZVNpbmdsZUxpbmVSYW5nZXMobmV3UmFuZ2VzKVxuICAgICAgICBAZmxhc2gobmV3UmFuZ2VzLCB0eXBlOiAndW5kby1yZWRvLW11bHRpcGxlLWNoYW5nZXMnKVxuICAgICAgZWxzZVxuICAgICAgICBAZmxhc2gobmV3UmFuZ2VzLCB0eXBlOiAndW5kby1yZWRvJylcbiAgICBlbHNlXG4gICAgICByZXR1cm4gaWYgQGlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uQW5kQ29uc2VjdXRpdmVSb3dzKG9sZFJhbmdlcylcblxuICAgICAgaWYgaXNNdWx0aXBsZVNpbmdsZUxpbmVSYW5nZXMob2xkUmFuZ2VzKVxuICAgICAgICBvbGRSYW5nZXMgPSBAZmlsdGVyTm9uTGVhZGluZ1doaXRlU3BhY2VSYW5nZShvbGRSYW5nZXMpXG4gICAgICAgIEBmbGFzaChvbGRSYW5nZXMsIHR5cGU6ICd1bmRvLXJlZG8tbXVsdGlwbGUtZGVsZXRlJylcblxuICBmaWx0ZXJOb25MZWFkaW5nV2hpdGVTcGFjZVJhbmdlOiAocmFuZ2VzKSAtPlxuICAgIHJhbmdlcy5maWx0ZXIgKHJhbmdlKSA9PlxuICAgICAgbm90IGlzTGVhZGluZ1doaXRlU3BhY2VSYW5nZShAZWRpdG9yLCByYW5nZSlcblxuICAjIFtUT0RPXSBJbXByb3ZlIGZ1cnRoZXIgYnkgY2hlY2tpbmcgb2xkVGV4dCwgbmV3VGV4dD9cbiAgIyBbUHVycG9zZSBvZiB0aGlzIGlzIGZ1bmN0aW9uXVxuICAjIFN1cHByZXNzIGZsYXNoIHdoZW4gdW5kby9yZWRvaW5nIHRvZ2dsZS1jb21tZW50IHdoaWxlIGZsYXNoaW5nIHVuZG8vcmVkbyBvZiBvY2N1cnJlbmNlIG9wZXJhdGlvbi5cbiAgIyBUaGlzIGh1cmlzdGljIGFwcHJvYWNoIG5ldmVyIGJlIHBlcmZlY3QuXG4gICMgVWx0aW1hdGVseSBjYW5ubm90IGRpc3Rpbmd1aXNoIG9jY3VycmVuY2Ugb3BlcmF0aW9uLlxuICBpc011bHRpcGxlQW5kQWxsUmFuZ2VIYXZlU2FtZUNvbHVtbkFuZENvbnNlY3V0aXZlUm93czogKHJhbmdlcykgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgcmFuZ2VzLmxlbmd0aCA8PSAxXG5cbiAgICB7c3RhcnQ6IHtjb2x1bW46IHN0YXJ0Q29sdW1ufSwgZW5kOiB7Y29sdW1uOiBlbmRDb2x1bW59fSA9IHJhbmdlc1swXVxuICAgIHByZXZpb3VzUm93ID0gbnVsbFxuICAgIGZvciByYW5nZSBpbiByYW5nZXNcbiAgICAgIHtzdGFydCwgZW5kfSA9IHJhbmdlXG4gICAgICB1bmxlc3MgKChzdGFydC5jb2x1bW4gaXMgc3RhcnRDb2x1bW4pIGFuZCAoZW5kLmNvbHVtbiBpcyBlbmRDb2x1bW4pKVxuICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgaWYgcHJldmlvdXNSb3c/IGFuZCAocHJldmlvdXNSb3cgKyAxIGlzbnQgc3RhcnQucm93KVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIHByZXZpb3VzUm93ID0gc3RhcnQucm93XG4gICAgcmV0dXJuIHRydWVcblxuICAgIHJhbmdlcy5ldmVyeSAoe3N0YXJ0LCBlbmR9KSAtPlxuICAgICAgKHN0YXJ0LmNvbHVtbiBpcyBzdGFydENvbHVtbikgYW5kIChlbmQuY29sdW1uIGlzIGVuZENvbHVtbilcblxuICBmbGFzaDogKGZsYXNoUmFuZ2VzLCBvcHRpb25zKSAtPlxuICAgIG9wdGlvbnMudGltZW91dCA/PSA1MDBcbiAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgIEB2aW1TdGF0ZS5mbGFzaChmbGFzaFJhbmdlcywgb3B0aW9ucylcblxuICBleGVjdXRlOiAtPlxuICAgIHtuZXdSYW5nZXMsIG9sZFJhbmdlc30gPSBAbXV0YXRlV2l0aFRyYWNrQ2hhbmdlcygpXG5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBzZWxlY3Rpb24uY2xlYXIoKVxuXG4gICAgaWYgQGdldENvbmZpZygnc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkbycpXG4gICAgICBzdHJhdGVneSA9IEBnZXRDb25maWcoJ3NldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG9TdHJhdGVneScpXG4gICAgICBAc2V0Q3Vyc29yUG9zaXRpb24oe25ld1Jhbmdlcywgb2xkUmFuZ2VzLCBzdHJhdGVneX0pXG4gICAgICBAdmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcblxuICAgIGlmIEBnZXRDb25maWcoJ2ZsYXNoT25VbmRvUmVkbycpXG4gICAgICBAZmxhc2hDaGFuZ2VzKHtuZXdSYW5nZXMsIG9sZFJhbmdlc30pXG5cbiAgICBAYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuXG4gIG11dGF0ZTogLT5cbiAgICBAZWRpdG9yLnVuZG8oKVxuXG5jbGFzcyBSZWRvIGV4dGVuZHMgVW5kb1xuICBAZXh0ZW5kKClcbiAgbXV0YXRlOiAtPlxuICAgIEBlZGl0b3IucmVkbygpXG5cbmNsYXNzIFRvZ2dsZUZvbGQgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBwb2ludCA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIEBlZGl0b3IudG9nZ2xlRm9sZEF0QnVmZmVyUm93KHBvaW50LnJvdylcblxuY2xhc3MgUmVwbGFjZU1vZGVCYWNrc3BhY2UgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAY29tbWFuZFNjb3BlOiAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmluc2VydC1tb2RlLnJlcGxhY2UnXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICMgY2hhciBtaWdodCBiZSBlbXB0eS5cbiAgICAgIGNoYXIgPSBAdmltU3RhdGUubW9kZU1hbmFnZXIuZ2V0UmVwbGFjZWRDaGFyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIGlmIGNoYXI/XG4gICAgICAgIHNlbGVjdGlvbi5zZWxlY3RMZWZ0KClcbiAgICAgICAgdW5sZXNzIHNlbGVjdGlvbi5pbnNlcnRUZXh0KGNoYXIpLmlzRW1wdHkoKVxuICAgICAgICAgIHNlbGVjdGlvbi5jdXJzb3IubW92ZUxlZnQoKVxuXG5jbGFzcyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvbiBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBleHRlbmQoZmFsc2UpXG4gIHNjcm9sbG9mZjogMiAjIGF0b20gZGVmYXVsdC4gQmV0dGVyIHRvIHVzZSBlZGl0b3IuZ2V0VmVydGljYWxTY3JvbGxNYXJnaW4oKT9cbiAgY3Vyc29yUGl4ZWw6IG51bGxcblxuICBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3c6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcblxuICBnZXRMYXN0VmlzaWJsZVNjcmVlblJvdzogLT5cbiAgICBAZWRpdG9yRWxlbWVudC5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgZ2V0TGFzdFNjcmVlblJvdzogLT5cbiAgICBAZWRpdG9yLmdldExhc3RTY3JlZW5Sb3coKVxuXG4gIGdldEN1cnNvclBpeGVsOiAtPlxuICAgIHBvaW50ID0gQGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG4gICAgQGVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHBvaW50KVxuXG4jIGN0cmwtZSBzY3JvbGwgbGluZXMgZG93bndhcmRzXG5jbGFzcyBTY3JvbGxEb3duIGV4dGVuZHMgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb25cbiAgQGV4dGVuZCgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBjb3VudCA9IEBnZXRDb3VudCgpXG4gICAgb2xkRmlyc3RSb3cgPSBAZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgQGVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cob2xkRmlyc3RSb3cgKyBjb3VudClcbiAgICBuZXdGaXJzdFJvdyA9IEBlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcblxuICAgIG1hcmdpbiA9IEBlZGl0b3IuZ2V0VmVydGljYWxTY3JvbGxNYXJnaW4oKVxuICAgIHtyb3csIGNvbHVtbn0gPSBAZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcbiAgICBpZiByb3cgPCAobmV3Rmlyc3RSb3cgKyBtYXJnaW4pXG4gICAgICBuZXdQb2ludCA9IFtyb3cgKyBjb3VudCwgY29sdW1uXVxuICAgICAgQGVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbihuZXdQb2ludCwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiMgY3RybC15IHNjcm9sbCBsaW5lcyB1cHdhcmRzXG5jbGFzcyBTY3JvbGxVcCBleHRlbmRzIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uXG4gIEBleHRlbmQoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgY291bnQgPSBAZ2V0Q291bnQoKVxuICAgIG9sZEZpcnN0Um93ID0gQGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIEBlZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KG9sZEZpcnN0Um93IC0gY291bnQpXG4gICAgbmV3TGFzdFJvdyA9IEBlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gICAgbWFyZ2luID0gQGVkaXRvci5nZXRWZXJ0aWNhbFNjcm9sbE1hcmdpbigpXG4gICAge3JvdywgY29sdW1ufSA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgIGlmIHJvdyA+PSAobmV3TGFzdFJvdyAtIG1hcmdpbilcbiAgICAgIG5ld1BvaW50ID0gW3JvdyAtIGNvdW50LCBjb2x1bW5dXG4gICAgICBAZWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uKG5ld1BvaW50LCBhdXRvc2Nyb2xsOiBmYWxzZSlcblxuIyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvbiB3aXRob3V0IEN1cnNvciBQb3NpdGlvbiBjaGFuZ2UuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFNjcm9sbEN1cnNvciBleHRlbmRzIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lPygpXG4gICAgaWYgQGlzU2Nyb2xsYWJsZSgpXG4gICAgICBAZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AgQGdldFNjcm9sbFRvcCgpXG5cbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmU6IC0+XG4gICAgQGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSgpXG5cbiAgZ2V0T2ZmU2V0UGl4ZWxIZWlnaHQ6IChsaW5lRGVsdGE9MCkgLT5cbiAgICBAZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpICogKEBzY3JvbGxvZmYgKyBsaW5lRGVsdGEpXG5cbiMgeiBlbnRlclxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Ub3AgZXh0ZW5kcyBTY3JvbGxDdXJzb3JcbiAgQGV4dGVuZCgpXG4gIGlzU2Nyb2xsYWJsZTogLT5cbiAgICBAZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSBpc250IEBnZXRMYXN0U2NyZWVuUm93KClcblxuICBnZXRTY3JvbGxUb3A6IC0+XG4gICAgQGdldEN1cnNvclBpeGVsKCkudG9wIC0gQGdldE9mZlNldFBpeGVsSGVpZ2h0KClcblxuIyB6dFxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Ub3BMZWF2ZSBleHRlbmRzIFNjcm9sbEN1cnNvclRvVG9wXG4gIEBleHRlbmQoKVxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZTogbnVsbFxuXG4jIHotXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0JvdHRvbSBleHRlbmRzIFNjcm9sbEN1cnNvclxuICBAZXh0ZW5kKClcbiAgaXNTY3JvbGxhYmxlOiAtPlxuICAgIEBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSBpc250IDBcblxuICBnZXRTY3JvbGxUb3A6IC0+XG4gICAgQGdldEN1cnNvclBpeGVsKCkudG9wIC0gKEBlZGl0b3JFbGVtZW50LmdldEhlaWdodCgpIC0gQGdldE9mZlNldFBpeGVsSGVpZ2h0KDEpKVxuXG4jIHpiXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0JvdHRvbUxlYXZlIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yVG9Cb3R0b21cbiAgQGV4dGVuZCgpXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lOiBudWxsXG5cbiMgei5cbmNsYXNzIFNjcm9sbEN1cnNvclRvTWlkZGxlIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yXG4gIEBleHRlbmQoKVxuICBpc1Njcm9sbGFibGU6IC0+XG4gICAgdHJ1ZVxuXG4gIGdldFNjcm9sbFRvcDogLT5cbiAgICBAZ2V0Q3Vyc29yUGl4ZWwoKS50b3AgLSAoQGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgLyAyKVxuXG4jIHp6XG5jbGFzcyBTY3JvbGxDdXJzb3JUb01pZGRsZUxlYXZlIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yVG9NaWRkbGVcbiAgQGV4dGVuZCgpXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lOiBudWxsXG5cbiMgSG9yaXpvbnRhbCBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIHpzXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0xlZnQgZXh0ZW5kcyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvblxuICBAZXh0ZW5kKClcblxuICBleGVjdXRlOiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LnNldFNjcm9sbExlZnQoQGdldEN1cnNvclBpeGVsKCkubGVmdClcblxuIyB6ZVxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9SaWdodCBleHRlbmRzIFNjcm9sbEN1cnNvclRvTGVmdFxuICBAZXh0ZW5kKClcblxuICBleGVjdXRlOiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFJpZ2h0KEBnZXRDdXJzb3JQaXhlbCgpLmxlZnQpXG5cbiMgaW5zZXJ0LW1vZGUgc3BlY2lmaWMgY29tbWFuZHNcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5zZXJ0TW9kZSBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBjb21tYW5kU2NvcGU6ICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMuaW5zZXJ0LW1vZGUnXG5cbmNsYXNzIEFjdGl2YXRlTm9ybWFsTW9kZU9uY2UgZXh0ZW5kcyBJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICB0aGlzQ29tbWFuZE5hbWU6IEBnZXRDb21tYW5kTmFtZSgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBjdXJzb3JzVG9Nb3ZlUmlnaHQgPSBAZWRpdG9yLmdldEN1cnNvcnMoKS5maWx0ZXIgKGN1cnNvcikgLT4gbm90IGN1cnNvci5pc0F0QmVnaW5uaW5nT2ZMaW5lKClcbiAgICBAdmltU3RhdGUuYWN0aXZhdGUoJ25vcm1hbCcpXG4gICAgbW92ZUN1cnNvclJpZ2h0KGN1cnNvcikgZm9yIGN1cnNvciBpbiBjdXJzb3JzVG9Nb3ZlUmlnaHRcbiAgICBkaXNwb3NhYmxlID0gYXRvbS5jb21tYW5kcy5vbkRpZERpc3BhdGNoICh7dHlwZX0pID0+XG4gICAgICByZXR1cm4gaWYgdHlwZSBpcyBAdGhpc0NvbW1hbmROYW1lXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgZGlzcG9zYWJsZSA9IG51bGxcbiAgICAgIEB2aW1TdGF0ZS5hY3RpdmF0ZSgnaW5zZXJ0JylcblxuY2xhc3MgSW5zZXJ0UmVnaXN0ZXIgZXh0ZW5kcyBJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICByZXF1aXJlSW5wdXQ6IHRydWVcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgQGZvY3VzSW5wdXQoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICB0ZXh0ID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldFRleHQoQGlucHV0LCBzZWxlY3Rpb24pXG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG5cbmNsYXNzIEluc2VydExhc3RJbnNlcnRlZCBleHRlbmRzIEluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJcIlwiXG4gIEluc2VydCB0ZXh0IGluc2VydGVkIGluIGxhdGVzdCBpbnNlcnQtbW9kZS5cbiAgRXF1aXZhbGVudCB0byAqaV9DVFJMLUEqIG9mIHB1cmUgVmltXG4gIFwiXCJcIlxuICBleGVjdXRlOiAtPlxuICAgIHRleHQgPSBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dCgnLicpXG4gICAgQGVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG5cbmNsYXNzIENvcHlGcm9tTGluZUFib3ZlIGV4dGVuZHMgSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgSW5zZXJ0IGNoYXJhY3RlciBvZiBzYW1lLWNvbHVtbiBvZiBhYm92ZSBsaW5lLlxuICBFcXVpdmFsZW50IHRvICppX0NUUkwtWSogb2YgcHVyZSBWaW1cbiAgXCJcIlwiXG4gIHJvd0RlbHRhOiAtMVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgdHJhbnNsYXRpb24gPSBbQHJvd0RlbHRhLCAwXVxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgcG9pbnQgPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkudHJhbnNsYXRlKHRyYW5zbGF0aW9uKVxuICAgICAgICByYW5nZSA9IFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShwb2ludCwgMCwgMSlcbiAgICAgICAgaWYgdGV4dCA9IEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcblxuY2xhc3MgQ29weUZyb21MaW5lQmVsb3cgZXh0ZW5kcyBDb3B5RnJvbUxpbmVBYm92ZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgSW5zZXJ0IGNoYXJhY3RlciBvZiBzYW1lLWNvbHVtbiBvZiBhYm92ZSBsaW5lLlxuICBFcXVpdmFsZW50IHRvICppX0NUUkwtRSogb2YgcHVyZSBWaW1cbiAgXCJcIlwiXG4gIHJvd0RlbHRhOiArMVxuIl19
