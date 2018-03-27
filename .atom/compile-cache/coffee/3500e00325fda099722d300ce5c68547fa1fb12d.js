(function() {
  var ActivateNormalModeOnce, Base, BlockwiseOtherEnd, CopyFromLineAbove, CopyFromLineBelow, InsertLastInserted, InsertMode, InsertRegister, Mark, MiscCommand, Point, Range, Redo, ReplaceModeBackspace, ReverseSelections, ScrollCursor, ScrollCursorToBottom, ScrollCursorToBottomLeave, ScrollCursorToLeft, ScrollCursorToMiddle, ScrollCursorToMiddleLeave, ScrollCursorToRight, ScrollCursorToTop, ScrollCursorToTopLeave, ScrollDown, ScrollUp, ScrollWithoutChangingCursorPosition, ToggleFold, Undo, _, findRangeContainsPoint, humanizeBufferRange, isLeadingWhiteSpaceRange, isLinewiseRange, isSingleLineRange, moveCursorRight, ref, ref1, setBufferRow, sortRanges, swrap,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Range = ref.Range, Point = ref.Point;

  Base = require('./base');

  swrap = require('./selection-wrapper');

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
      swrap.setReversedState(this.editor, !this.editor.getLastSelection().isReversed());
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGlwQkFBQTtJQUFBOzs7RUFBQSxNQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGlCQUFELEVBQVE7O0VBQ1IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBQ1IsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixPQVNJLE9BQUEsQ0FBUSxTQUFSLENBVEosRUFDRSxzQ0FERixFQUVFLHNDQUZGLEVBR0UsZ0NBSEYsRUFJRSw0QkFKRixFQUtFLG9EQUxGLEVBTUUsMENBTkYsRUFPRSx3REFQRixFQVFFOztFQUdJOzs7SUFDSixXQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O0lBQ0EsV0FBQyxDQUFBLGFBQUQsR0FBZ0I7O0lBQ0gscUJBQUE7TUFDWCw4Q0FBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQUZXOzs7O0tBSFc7O0VBT3BCOzs7Ozs7O0lBQ0osSUFBQyxDQUFBLE1BQUQsQ0FBQTs7bUJBQ0EsWUFBQSxHQUFjOzttQkFDZCxVQUFBLEdBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxVQUFELENBQUE7YUFDQSxzQ0FBQSxTQUFBO0lBRlU7O21CQUlaLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsS0FBcEIsRUFBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQTNCO2FBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxRQUFkO0lBRk87Ozs7S0FQUTs7RUFXYjs7Ozs7OztJQUNKLGlCQUFDLENBQUEsTUFBRCxDQUFBOztnQ0FDQSxPQUFB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c0NBQUE7O1lBQ0UsS0FBQSxHQUFRLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWpCLENBQUEsQ0FBb0MsQ0FBQyxTQUFyQyxDQUErQyxXQUEvQztZQUNSLEtBQUEsR0FBUSxLQUFLLENBQUMsa0JBQU4sQ0FBeUIsS0FBekIsRUFBZ0MsQ0FBaEMsRUFBbUMsQ0FBbkM7WUFDUixJQUFHLElBQUEsR0FBTyxLQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLEtBQTdCLENBQVY7MkJBQ0UsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsR0FERjthQUFBLE1BQUE7bUNBQUE7O0FBSEY7O1FBRGU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO0lBRk87Ozs7S0FScUI7O0VBaUIxQjs7Ozs7OztJQUNKLGlCQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLGlCQUFDLENBQUEsV0FBRCxHQUFjOztnQ0FJZCxRQUFBLEdBQVUsQ0FBQzs7OztLQU5tQjtBQXRXaEMiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2UsIFBvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxue1xuICBtb3ZlQ3Vyc29yUmlnaHRcbiAgaXNMaW5ld2lzZVJhbmdlXG4gIHNldEJ1ZmZlclJvd1xuICBzb3J0UmFuZ2VzXG4gIGZpbmRSYW5nZUNvbnRhaW5zUG9pbnRcbiAgaXNTaW5nbGVMaW5lUmFuZ2VcbiAgaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlXG4gIGh1bWFuaXplQnVmZmVyUmFuZ2Vcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5jbGFzcyBNaXNjQ29tbWFuZCBleHRlbmRzIEJhc2VcbiAgQGV4dGVuZChmYWxzZSlcbiAgQG9wZXJhdGlvbktpbmQ6ICdtaXNjLWNvbW1hbmQnXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAgQGluaXRpYWxpemUoKVxuXG5jbGFzcyBNYXJrIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGV4dGVuZCgpXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuICBpbml0aWFsaXplOiAtPlxuICAgIEBmb2N1c0lucHV0KClcbiAgICBzdXBlclxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQHZpbVN0YXRlLm1hcmsuc2V0KEBpbnB1dCwgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIEBhY3RpdmF0ZU1vZGUoJ25vcm1hbCcpXG5cbmNsYXNzIFJldmVyc2VTZWxlY3Rpb25zIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgc3dyYXAuc2V0UmV2ZXJzZWRTdGF0ZShAZWRpdG9yLCBub3QgQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuaXNSZXZlcnNlZCgpKVxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgQGdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5hdXRvc2Nyb2xsKClcblxuY2xhc3MgQmxvY2t3aXNlT3RoZXJFbmQgZXh0ZW5kcyBSZXZlcnNlU2VsZWN0aW9uc1xuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBmb3IgYmxvY2t3aXNlU2VsZWN0aW9uIGluIEBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKClcbiAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5yZXZlcnNlKClcbiAgICBzdXBlclxuXG5jbGFzcyBVbmRvIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGV4dGVuZCgpXG5cbiAgc2V0Q3Vyc29yUG9zaXRpb246ICh7bmV3UmFuZ2VzLCBvbGRSYW5nZXMsIHN0cmF0ZWd5fSkgLT5cbiAgICBsYXN0Q3Vyc29yID0gQGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkgIyBUaGlzIGlzIHJlc3RvcmVkIGN1cnNvclxuXG4gICAgaWYgc3RyYXRlZ3kgaXMgJ3NtYXJ0J1xuICAgICAgY2hhbmdlZFJhbmdlID0gZmluZFJhbmdlQ29udGFpbnNQb2ludChuZXdSYW5nZXMsIGxhc3RDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBlbHNlXG4gICAgICBjaGFuZ2VkUmFuZ2UgPSBzb3J0UmFuZ2VzKG5ld1Jhbmdlcy5jb25jYXQob2xkUmFuZ2VzKSlbMF1cblxuICAgIGlmIGNoYW5nZWRSYW5nZT9cbiAgICAgIGlmIGlzTGluZXdpc2VSYW5nZShjaGFuZ2VkUmFuZ2UpXG4gICAgICAgIHNldEJ1ZmZlclJvdyhsYXN0Q3Vyc29yLCBjaGFuZ2VkUmFuZ2Uuc3RhcnQucm93KVxuICAgICAgZWxzZVxuICAgICAgICBsYXN0Q3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGNoYW5nZWRSYW5nZS5zdGFydClcblxuICBtdXRhdGVXaXRoVHJhY2tDaGFuZ2VzOiAtPlxuICAgIG5ld1JhbmdlcyA9IFtdXG4gICAgb2xkUmFuZ2VzID0gW11cblxuICAgICMgQ29sbGVjdCBjaGFuZ2VkIHJhbmdlIHdoaWxlIG11dGF0aW5nIHRleHQtc3RhdGUgYnkgZm4gY2FsbGJhY2suXG4gICAgZGlzcG9zYWJsZSA9IEBlZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRDaGFuZ2UgKHtuZXdSYW5nZSwgb2xkUmFuZ2V9KSAtPlxuICAgICAgaWYgbmV3UmFuZ2UuaXNFbXB0eSgpXG4gICAgICAgIG9sZFJhbmdlcy5wdXNoKG9sZFJhbmdlKSAjIFJlbW92ZSBvbmx5XG4gICAgICBlbHNlXG4gICAgICAgIG5ld1Jhbmdlcy5wdXNoKG5ld1JhbmdlKVxuXG4gICAgQG11dGF0ZSgpXG5cbiAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgIHtuZXdSYW5nZXMsIG9sZFJhbmdlc31cblxuICBmbGFzaENoYW5nZXM6ICh7bmV3UmFuZ2VzLCBvbGRSYW5nZXN9KSAtPlxuICAgIGlzTXVsdGlwbGVTaW5nbGVMaW5lUmFuZ2VzID0gKHJhbmdlcykgLT5cbiAgICAgIHJhbmdlcy5sZW5ndGggPiAxIGFuZCByYW5nZXMuZXZlcnkoaXNTaW5nbGVMaW5lUmFuZ2UpXG5cbiAgICBpZiBuZXdSYW5nZXMubGVuZ3RoID4gMFxuICAgICAgcmV0dXJuIGlmIEBpc011bHRpcGxlQW5kQWxsUmFuZ2VIYXZlU2FtZUNvbHVtbkFuZENvbnNlY3V0aXZlUm93cyhuZXdSYW5nZXMpXG4gICAgICBuZXdSYW5nZXMgPSBuZXdSYW5nZXMubWFwIChyYW5nZSkgPT4gaHVtYW5pemVCdWZmZXJSYW5nZShAZWRpdG9yLCByYW5nZSlcbiAgICAgIG5ld1JhbmdlcyA9IEBmaWx0ZXJOb25MZWFkaW5nV2hpdGVTcGFjZVJhbmdlKG5ld1JhbmdlcylcblxuICAgICAgaWYgaXNNdWx0aXBsZVNpbmdsZUxpbmVSYW5nZXMobmV3UmFuZ2VzKVxuICAgICAgICBAZmxhc2gobmV3UmFuZ2VzLCB0eXBlOiAndW5kby1yZWRvLW11bHRpcGxlLWNoYW5nZXMnKVxuICAgICAgZWxzZVxuICAgICAgICBAZmxhc2gobmV3UmFuZ2VzLCB0eXBlOiAndW5kby1yZWRvJylcbiAgICBlbHNlXG4gICAgICByZXR1cm4gaWYgQGlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uQW5kQ29uc2VjdXRpdmVSb3dzKG9sZFJhbmdlcylcblxuICAgICAgaWYgaXNNdWx0aXBsZVNpbmdsZUxpbmVSYW5nZXMob2xkUmFuZ2VzKVxuICAgICAgICBvbGRSYW5nZXMgPSBAZmlsdGVyTm9uTGVhZGluZ1doaXRlU3BhY2VSYW5nZShvbGRSYW5nZXMpXG4gICAgICAgIEBmbGFzaChvbGRSYW5nZXMsIHR5cGU6ICd1bmRvLXJlZG8tbXVsdGlwbGUtZGVsZXRlJylcblxuICBmaWx0ZXJOb25MZWFkaW5nV2hpdGVTcGFjZVJhbmdlOiAocmFuZ2VzKSAtPlxuICAgIHJhbmdlcy5maWx0ZXIgKHJhbmdlKSA9PlxuICAgICAgbm90IGlzTGVhZGluZ1doaXRlU3BhY2VSYW5nZShAZWRpdG9yLCByYW5nZSlcblxuICAjIFtUT0RPXSBJbXByb3ZlIGZ1cnRoZXIgYnkgY2hlY2tpbmcgb2xkVGV4dCwgbmV3VGV4dD9cbiAgIyBbUHVycG9zZSBvZiB0aGlzIGlzIGZ1bmN0aW9uXVxuICAjIFN1cHByZXNzIGZsYXNoIHdoZW4gdW5kby9yZWRvaW5nIHRvZ2dsZS1jb21tZW50IHdoaWxlIGZsYXNoaW5nIHVuZG8vcmVkbyBvZiBvY2N1cnJlbmNlIG9wZXJhdGlvbi5cbiAgIyBUaGlzIGh1cmlzdGljIGFwcHJvYWNoIG5ldmVyIGJlIHBlcmZlY3QuXG4gICMgVWx0aW1hdGVseSBjYW5ubm90IGRpc3Rpbmd1aXNoIG9jY3VycmVuY2Ugb3BlcmF0aW9uLlxuICBpc011bHRpcGxlQW5kQWxsUmFuZ2VIYXZlU2FtZUNvbHVtbkFuZENvbnNlY3V0aXZlUm93czogKHJhbmdlcykgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgcmFuZ2VzLmxlbmd0aCA8PSAxXG5cbiAgICB7c3RhcnQ6IHtjb2x1bW46IHN0YXJ0Q29sdW1ufSwgZW5kOiB7Y29sdW1uOiBlbmRDb2x1bW59fSA9IHJhbmdlc1swXVxuICAgIHByZXZpb3VzUm93ID0gbnVsbFxuICAgIGZvciByYW5nZSBpbiByYW5nZXNcbiAgICAgIHtzdGFydCwgZW5kfSA9IHJhbmdlXG4gICAgICB1bmxlc3MgKChzdGFydC5jb2x1bW4gaXMgc3RhcnRDb2x1bW4pIGFuZCAoZW5kLmNvbHVtbiBpcyBlbmRDb2x1bW4pKVxuICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgaWYgcHJldmlvdXNSb3c/IGFuZCAocHJldmlvdXNSb3cgKyAxIGlzbnQgc3RhcnQucm93KVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIHByZXZpb3VzUm93ID0gc3RhcnQucm93XG4gICAgcmV0dXJuIHRydWVcblxuICAgIHJhbmdlcy5ldmVyeSAoe3N0YXJ0LCBlbmR9KSAtPlxuICAgICAgKHN0YXJ0LmNvbHVtbiBpcyBzdGFydENvbHVtbikgYW5kIChlbmQuY29sdW1uIGlzIGVuZENvbHVtbilcblxuICBmbGFzaDogKGZsYXNoUmFuZ2VzLCBvcHRpb25zKSAtPlxuICAgIG9wdGlvbnMudGltZW91dCA/PSA1MDBcbiAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgIEB2aW1TdGF0ZS5mbGFzaChmbGFzaFJhbmdlcywgb3B0aW9ucylcblxuICBleGVjdXRlOiAtPlxuICAgIHtuZXdSYW5nZXMsIG9sZFJhbmdlc30gPSBAbXV0YXRlV2l0aFRyYWNrQ2hhbmdlcygpXG5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBzZWxlY3Rpb24uY2xlYXIoKVxuXG4gICAgaWYgQGdldENvbmZpZygnc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkbycpXG4gICAgICBzdHJhdGVneSA9IEBnZXRDb25maWcoJ3NldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG9TdHJhdGVneScpXG4gICAgICBAc2V0Q3Vyc29yUG9zaXRpb24oe25ld1Jhbmdlcywgb2xkUmFuZ2VzLCBzdHJhdGVneX0pXG4gICAgICBAdmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcblxuICAgIGlmIEBnZXRDb25maWcoJ2ZsYXNoT25VbmRvUmVkbycpXG4gICAgICBAZmxhc2hDaGFuZ2VzKHtuZXdSYW5nZXMsIG9sZFJhbmdlc30pXG5cbiAgICBAYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuXG4gIG11dGF0ZTogLT5cbiAgICBAZWRpdG9yLnVuZG8oKVxuXG5jbGFzcyBSZWRvIGV4dGVuZHMgVW5kb1xuICBAZXh0ZW5kKClcbiAgbXV0YXRlOiAtPlxuICAgIEBlZGl0b3IucmVkbygpXG5cbmNsYXNzIFRvZ2dsZUZvbGQgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBwb2ludCA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIEBlZGl0b3IudG9nZ2xlRm9sZEF0QnVmZmVyUm93KHBvaW50LnJvdylcblxuY2xhc3MgUmVwbGFjZU1vZGVCYWNrc3BhY2UgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAY29tbWFuZFNjb3BlOiAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmluc2VydC1tb2RlLnJlcGxhY2UnXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICMgY2hhciBtaWdodCBiZSBlbXB0eS5cbiAgICAgIGNoYXIgPSBAdmltU3RhdGUubW9kZU1hbmFnZXIuZ2V0UmVwbGFjZWRDaGFyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIGlmIGNoYXI/XG4gICAgICAgIHNlbGVjdGlvbi5zZWxlY3RMZWZ0KClcbiAgICAgICAgdW5sZXNzIHNlbGVjdGlvbi5pbnNlcnRUZXh0KGNoYXIpLmlzRW1wdHkoKVxuICAgICAgICAgIHNlbGVjdGlvbi5jdXJzb3IubW92ZUxlZnQoKVxuXG5jbGFzcyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvbiBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBleHRlbmQoZmFsc2UpXG4gIHNjcm9sbG9mZjogMiAjIGF0b20gZGVmYXVsdC4gQmV0dGVyIHRvIHVzZSBlZGl0b3IuZ2V0VmVydGljYWxTY3JvbGxNYXJnaW4oKT9cbiAgY3Vyc29yUGl4ZWw6IG51bGxcblxuICBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3c6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcblxuICBnZXRMYXN0VmlzaWJsZVNjcmVlblJvdzogLT5cbiAgICBAZWRpdG9yRWxlbWVudC5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgZ2V0TGFzdFNjcmVlblJvdzogLT5cbiAgICBAZWRpdG9yLmdldExhc3RTY3JlZW5Sb3coKVxuXG4gIGdldEN1cnNvclBpeGVsOiAtPlxuICAgIHBvaW50ID0gQGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG4gICAgQGVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHBvaW50KVxuXG4jIGN0cmwtZSBzY3JvbGwgbGluZXMgZG93bndhcmRzXG5jbGFzcyBTY3JvbGxEb3duIGV4dGVuZHMgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb25cbiAgQGV4dGVuZCgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBjb3VudCA9IEBnZXRDb3VudCgpXG4gICAgb2xkRmlyc3RSb3cgPSBAZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgQGVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cob2xkRmlyc3RSb3cgKyBjb3VudClcbiAgICBuZXdGaXJzdFJvdyA9IEBlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcblxuICAgIG1hcmdpbiA9IEBlZGl0b3IuZ2V0VmVydGljYWxTY3JvbGxNYXJnaW4oKVxuICAgIHtyb3csIGNvbHVtbn0gPSBAZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcbiAgICBpZiByb3cgPCAobmV3Rmlyc3RSb3cgKyBtYXJnaW4pXG4gICAgICBuZXdQb2ludCA9IFtyb3cgKyBjb3VudCwgY29sdW1uXVxuICAgICAgQGVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbihuZXdQb2ludCwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiMgY3RybC15IHNjcm9sbCBsaW5lcyB1cHdhcmRzXG5jbGFzcyBTY3JvbGxVcCBleHRlbmRzIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uXG4gIEBleHRlbmQoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgY291bnQgPSBAZ2V0Q291bnQoKVxuICAgIG9sZEZpcnN0Um93ID0gQGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIEBlZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KG9sZEZpcnN0Um93IC0gY291bnQpXG4gICAgbmV3TGFzdFJvdyA9IEBlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gICAgbWFyZ2luID0gQGVkaXRvci5nZXRWZXJ0aWNhbFNjcm9sbE1hcmdpbigpXG4gICAge3JvdywgY29sdW1ufSA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgIGlmIHJvdyA+PSAobmV3TGFzdFJvdyAtIG1hcmdpbilcbiAgICAgIG5ld1BvaW50ID0gW3JvdyAtIGNvdW50LCBjb2x1bW5dXG4gICAgICBAZWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uKG5ld1BvaW50LCBhdXRvc2Nyb2xsOiBmYWxzZSlcblxuIyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvbiB3aXRob3V0IEN1cnNvciBQb3NpdGlvbiBjaGFuZ2UuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFNjcm9sbEN1cnNvciBleHRlbmRzIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lPygpXG4gICAgaWYgQGlzU2Nyb2xsYWJsZSgpXG4gICAgICBAZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AgQGdldFNjcm9sbFRvcCgpXG5cbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmU6IC0+XG4gICAgQGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSgpXG5cbiAgZ2V0T2ZmU2V0UGl4ZWxIZWlnaHQ6IChsaW5lRGVsdGE9MCkgLT5cbiAgICBAZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpICogKEBzY3JvbGxvZmYgKyBsaW5lRGVsdGEpXG5cbiMgeiBlbnRlclxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Ub3AgZXh0ZW5kcyBTY3JvbGxDdXJzb3JcbiAgQGV4dGVuZCgpXG4gIGlzU2Nyb2xsYWJsZTogLT5cbiAgICBAZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSBpc250IEBnZXRMYXN0U2NyZWVuUm93KClcblxuICBnZXRTY3JvbGxUb3A6IC0+XG4gICAgQGdldEN1cnNvclBpeGVsKCkudG9wIC0gQGdldE9mZlNldFBpeGVsSGVpZ2h0KClcblxuIyB6dFxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Ub3BMZWF2ZSBleHRlbmRzIFNjcm9sbEN1cnNvclRvVG9wXG4gIEBleHRlbmQoKVxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZTogbnVsbFxuXG4jIHotXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0JvdHRvbSBleHRlbmRzIFNjcm9sbEN1cnNvclxuICBAZXh0ZW5kKClcbiAgaXNTY3JvbGxhYmxlOiAtPlxuICAgIEBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSBpc250IDBcblxuICBnZXRTY3JvbGxUb3A6IC0+XG4gICAgQGdldEN1cnNvclBpeGVsKCkudG9wIC0gKEBlZGl0b3JFbGVtZW50LmdldEhlaWdodCgpIC0gQGdldE9mZlNldFBpeGVsSGVpZ2h0KDEpKVxuXG4jIHpiXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0JvdHRvbUxlYXZlIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yVG9Cb3R0b21cbiAgQGV4dGVuZCgpXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lOiBudWxsXG5cbiMgei5cbmNsYXNzIFNjcm9sbEN1cnNvclRvTWlkZGxlIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yXG4gIEBleHRlbmQoKVxuICBpc1Njcm9sbGFibGU6IC0+XG4gICAgdHJ1ZVxuXG4gIGdldFNjcm9sbFRvcDogLT5cbiAgICBAZ2V0Q3Vyc29yUGl4ZWwoKS50b3AgLSAoQGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgLyAyKVxuXG4jIHp6XG5jbGFzcyBTY3JvbGxDdXJzb3JUb01pZGRsZUxlYXZlIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yVG9NaWRkbGVcbiAgQGV4dGVuZCgpXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lOiBudWxsXG5cbiMgSG9yaXpvbnRhbCBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIHpzXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0xlZnQgZXh0ZW5kcyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvblxuICBAZXh0ZW5kKClcblxuICBleGVjdXRlOiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LnNldFNjcm9sbExlZnQoQGdldEN1cnNvclBpeGVsKCkubGVmdClcblxuIyB6ZVxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9SaWdodCBleHRlbmRzIFNjcm9sbEN1cnNvclRvTGVmdFxuICBAZXh0ZW5kKClcblxuICBleGVjdXRlOiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFJpZ2h0KEBnZXRDdXJzb3JQaXhlbCgpLmxlZnQpXG5cbiMgaW5zZXJ0LW1vZGUgc3BlY2lmaWMgY29tbWFuZHNcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5zZXJ0TW9kZSBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBjb21tYW5kU2NvcGU6ICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMuaW5zZXJ0LW1vZGUnXG5cbmNsYXNzIEFjdGl2YXRlTm9ybWFsTW9kZU9uY2UgZXh0ZW5kcyBJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICB0aGlzQ29tbWFuZE5hbWU6IEBnZXRDb21tYW5kTmFtZSgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBjdXJzb3JzVG9Nb3ZlUmlnaHQgPSBAZWRpdG9yLmdldEN1cnNvcnMoKS5maWx0ZXIgKGN1cnNvcikgLT4gbm90IGN1cnNvci5pc0F0QmVnaW5uaW5nT2ZMaW5lKClcbiAgICBAdmltU3RhdGUuYWN0aXZhdGUoJ25vcm1hbCcpXG4gICAgbW92ZUN1cnNvclJpZ2h0KGN1cnNvcikgZm9yIGN1cnNvciBpbiBjdXJzb3JzVG9Nb3ZlUmlnaHRcbiAgICBkaXNwb3NhYmxlID0gYXRvbS5jb21tYW5kcy5vbkRpZERpc3BhdGNoICh7dHlwZX0pID0+XG4gICAgICByZXR1cm4gaWYgdHlwZSBpcyBAdGhpc0NvbW1hbmROYW1lXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgZGlzcG9zYWJsZSA9IG51bGxcbiAgICAgIEB2aW1TdGF0ZS5hY3RpdmF0ZSgnaW5zZXJ0JylcblxuY2xhc3MgSW5zZXJ0UmVnaXN0ZXIgZXh0ZW5kcyBJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICByZXF1aXJlSW5wdXQ6IHRydWVcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgQGZvY3VzSW5wdXQoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICB0ZXh0ID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldFRleHQoQGlucHV0LCBzZWxlY3Rpb24pXG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG5cbmNsYXNzIEluc2VydExhc3RJbnNlcnRlZCBleHRlbmRzIEluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJcIlwiXG4gIEluc2VydCB0ZXh0IGluc2VydGVkIGluIGxhdGVzdCBpbnNlcnQtbW9kZS5cbiAgRXF1aXZhbGVudCB0byAqaV9DVFJMLUEqIG9mIHB1cmUgVmltXG4gIFwiXCJcIlxuICBleGVjdXRlOiAtPlxuICAgIHRleHQgPSBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dCgnLicpXG4gICAgQGVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG5cbmNsYXNzIENvcHlGcm9tTGluZUFib3ZlIGV4dGVuZHMgSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgSW5zZXJ0IGNoYXJhY3RlciBvZiBzYW1lLWNvbHVtbiBvZiBhYm92ZSBsaW5lLlxuICBFcXVpdmFsZW50IHRvICppX0NUUkwtWSogb2YgcHVyZSBWaW1cbiAgXCJcIlwiXG4gIHJvd0RlbHRhOiAtMVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgdHJhbnNsYXRpb24gPSBbQHJvd0RlbHRhLCAwXVxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgcG9pbnQgPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkudHJhbnNsYXRlKHRyYW5zbGF0aW9uKVxuICAgICAgICByYW5nZSA9IFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShwb2ludCwgMCwgMSlcbiAgICAgICAgaWYgdGV4dCA9IEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcblxuY2xhc3MgQ29weUZyb21MaW5lQmVsb3cgZXh0ZW5kcyBDb3B5RnJvbUxpbmVBYm92ZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgSW5zZXJ0IGNoYXJhY3RlciBvZiBzYW1lLWNvbHVtbiBvZiBhYm92ZSBsaW5lLlxuICBFcXVpdmFsZW50IHRvICppX0NUUkwtRSogb2YgcHVyZSBWaW1cbiAgXCJcIlwiXG4gIHJvd0RlbHRhOiArMVxuIl19
