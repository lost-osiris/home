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
        if (this.isMultipleAndAllRangeHaveSameColumnRanges(newRanges)) {
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
        if (this.isMultipleAndAllRangeHaveSameColumnRanges(oldRanges)) {
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

    Undo.prototype.isMultipleAndAllRangeHaveSameColumnRanges = function(ranges) {
      var end, endColumn, ref2, start, startColumn;
      if (ranges.length <= 1) {
        return false;
      }
      ref2 = ranges[0], start = ref2.start, end = ref2.end;
      startColumn = start.column;
      endColumn = end.column;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGlwQkFBQTtJQUFBOzs7RUFBQSxNQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGlCQUFELEVBQVE7O0VBQ1IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBQ1IsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixPQVNJLE9BQUEsQ0FBUSxTQUFSLENBVEosRUFDRSxzQ0FERixFQUVFLHNDQUZGLEVBR0UsZ0NBSEYsRUFJRSw0QkFKRixFQUtFLG9EQUxGLEVBTUUsMENBTkYsRUFPRSx3REFQRixFQVFFOztFQUdJOzs7SUFDSixXQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O0lBQ2EscUJBQUE7TUFDWCw4Q0FBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQUZXOzs7O0tBRlc7O0VBTXBCOzs7Ozs7O0lBQ0osSUFBQyxDQUFBLE1BQUQsQ0FBQTs7bUJBQ0EsWUFBQSxHQUFjOzttQkFDZCxVQUFBLEdBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxVQUFELENBQUE7YUFDQSxzQ0FBQSxTQUFBO0lBRlU7O21CQUlaLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsS0FBcEIsRUFBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQTNCO2FBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxRQUFkO0lBRk87Ozs7S0FQUTs7RUFXYjs7Ozs7OztJQUNKLGlCQUFDLENBQUEsTUFBRCxDQUFBOztnQ0FDQSxPQUFBLEdBQVMsU0FBQTtNQUNQLEtBQUssQ0FBQyxn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LElBQUEsQ0FBakI7SUFGTzs7OztLQVJxQjs7RUFpQjFCOzs7Ozs7O0lBQ0osaUJBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsaUJBQUMsQ0FBQSxXQUFELEdBQWM7O2dDQUlkLFFBQUEsR0FBVSxDQUFDOzs7O0tBTm1CO0FBeFZoQyIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgUG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG57XG4gIG1vdmVDdXJzb3JSaWdodFxuICBpc0xpbmV3aXNlUmFuZ2VcbiAgc2V0QnVmZmVyUm93XG4gIHNvcnRSYW5nZXNcbiAgZmluZFJhbmdlQ29udGFpbnNQb2ludFxuICBpc1NpbmdsZUxpbmVSYW5nZVxuICBpc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2VcbiAgaHVtYW5pemVCdWZmZXJSYW5nZVxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIE1pc2NDb21tYW5kIGV4dGVuZHMgQmFzZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIEBpbml0aWFsaXplKClcblxuY2xhc3MgTWFyayBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBleHRlbmQoKVxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAZm9jdXNJbnB1dCgpXG4gICAgc3VwZXJcblxuICBleGVjdXRlOiAtPlxuICAgIEB2aW1TdGF0ZS5tYXJrLnNldChAaW5wdXQsIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICBAYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuXG5jbGFzcyBSZXZlcnNlU2VsZWN0aW9ucyBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIHN3cmFwLnNldFJldmVyc2VkU3RhdGUoQGVkaXRvciwgbm90IEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmlzUmV2ZXJzZWQoKSlcbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgIEBnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCkuYXV0b3Njcm9sbCgpXG5cbmNsYXNzIEJsb2Nrd2lzZU90aGVyRW5kIGV4dGVuZHMgUmV2ZXJzZVNlbGVjdGlvbnNcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgZm9yIGJsb2Nrd2lzZVNlbGVjdGlvbiBpbiBAZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpXG4gICAgICBibG9ja3dpc2VTZWxlY3Rpb24ucmV2ZXJzZSgpXG4gICAgc3VwZXJcblxuY2xhc3MgVW5kbyBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBleHRlbmQoKVxuXG4gIHNldEN1cnNvclBvc2l0aW9uOiAoe25ld1Jhbmdlcywgb2xkUmFuZ2VzLCBzdHJhdGVneX0pIC0+XG4gICAgbGFzdEN1cnNvciA9IEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpICMgVGhpcyBpcyByZXN0b3JlZCBjdXJzb3JcblxuICAgIGlmIHN0cmF0ZWd5IGlzICdzbWFydCdcbiAgICAgIGNoYW5nZWRSYW5nZSA9IGZpbmRSYW5nZUNvbnRhaW5zUG9pbnQobmV3UmFuZ2VzLCBsYXN0Q3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgZWxzZVxuICAgICAgY2hhbmdlZFJhbmdlID0gc29ydFJhbmdlcyhuZXdSYW5nZXMuY29uY2F0KG9sZFJhbmdlcykpWzBdXG5cbiAgICBpZiBjaGFuZ2VkUmFuZ2U/XG4gICAgICBpZiBpc0xpbmV3aXNlUmFuZ2UoY2hhbmdlZFJhbmdlKVxuICAgICAgICBzZXRCdWZmZXJSb3cobGFzdEN1cnNvciwgY2hhbmdlZFJhbmdlLnN0YXJ0LnJvdylcbiAgICAgIGVsc2VcbiAgICAgICAgbGFzdEN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjaGFuZ2VkUmFuZ2Uuc3RhcnQpXG5cbiAgbXV0YXRlV2l0aFRyYWNrQ2hhbmdlczogLT5cbiAgICBuZXdSYW5nZXMgPSBbXVxuICAgIG9sZFJhbmdlcyA9IFtdXG5cbiAgICAjIENvbGxlY3QgY2hhbmdlZCByYW5nZSB3aGlsZSBtdXRhdGluZyB0ZXh0LXN0YXRlIGJ5IGZuIGNhbGxiYWNrLlxuICAgIGRpc3Bvc2FibGUgPSBAZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkQ2hhbmdlICh7bmV3UmFuZ2UsIG9sZFJhbmdlfSkgLT5cbiAgICAgIGlmIG5ld1JhbmdlLmlzRW1wdHkoKVxuICAgICAgICBvbGRSYW5nZXMucHVzaChvbGRSYW5nZSkgIyBSZW1vdmUgb25seVxuICAgICAgZWxzZVxuICAgICAgICBuZXdSYW5nZXMucHVzaChuZXdSYW5nZSlcblxuICAgIEBtdXRhdGUoKVxuXG4gICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICB7bmV3UmFuZ2VzLCBvbGRSYW5nZXN9XG5cbiAgZmxhc2hDaGFuZ2VzOiAoe25ld1Jhbmdlcywgb2xkUmFuZ2VzfSkgLT5cbiAgICBpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyA9IChyYW5nZXMpIC0+XG4gICAgICByYW5nZXMubGVuZ3RoID4gMSBhbmQgcmFuZ2VzLmV2ZXJ5KGlzU2luZ2xlTGluZVJhbmdlKVxuXG4gICAgaWYgbmV3UmFuZ2VzLmxlbmd0aCA+IDBcbiAgICAgIHJldHVybiBpZiBAaXNNdWx0aXBsZUFuZEFsbFJhbmdlSGF2ZVNhbWVDb2x1bW5SYW5nZXMobmV3UmFuZ2VzKVxuICAgICAgbmV3UmFuZ2VzID0gbmV3UmFuZ2VzLm1hcCAocmFuZ2UpID0+IGh1bWFuaXplQnVmZmVyUmFuZ2UoQGVkaXRvciwgcmFuZ2UpXG4gICAgICBuZXdSYW5nZXMgPSBAZmlsdGVyTm9uTGVhZGluZ1doaXRlU3BhY2VSYW5nZShuZXdSYW5nZXMpXG5cbiAgICAgIGlmIGlzTXVsdGlwbGVTaW5nbGVMaW5lUmFuZ2VzKG5ld1JhbmdlcylcbiAgICAgICAgQGZsYXNoKG5ld1JhbmdlcywgdHlwZTogJ3VuZG8tcmVkby1tdWx0aXBsZS1jaGFuZ2VzJylcbiAgICAgIGVsc2VcbiAgICAgICAgQGZsYXNoKG5ld1JhbmdlcywgdHlwZTogJ3VuZG8tcmVkbycpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGlmIEBpc011bHRpcGxlQW5kQWxsUmFuZ2VIYXZlU2FtZUNvbHVtblJhbmdlcyhvbGRSYW5nZXMpXG5cbiAgICAgIGlmIGlzTXVsdGlwbGVTaW5nbGVMaW5lUmFuZ2VzKG9sZFJhbmdlcylcbiAgICAgICAgb2xkUmFuZ2VzID0gQGZpbHRlck5vbkxlYWRpbmdXaGl0ZVNwYWNlUmFuZ2Uob2xkUmFuZ2VzKVxuICAgICAgICBAZmxhc2gob2xkUmFuZ2VzLCB0eXBlOiAndW5kby1yZWRvLW11bHRpcGxlLWRlbGV0ZScpXG5cbiAgZmlsdGVyTm9uTGVhZGluZ1doaXRlU3BhY2VSYW5nZTogKHJhbmdlcykgLT5cbiAgICByYW5nZXMuZmlsdGVyIChyYW5nZSkgPT5cbiAgICAgIG5vdCBpc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UoQGVkaXRvciwgcmFuZ2UpXG5cbiAgaXNNdWx0aXBsZUFuZEFsbFJhbmdlSGF2ZVNhbWVDb2x1bW5SYW5nZXM6IChyYW5nZXMpIC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIHJhbmdlcy5sZW5ndGggPD0gMVxuXG4gICAge3N0YXJ0LCBlbmR9ID0gcmFuZ2VzWzBdXG4gICAgc3RhcnRDb2x1bW4gPSBzdGFydC5jb2x1bW5cbiAgICBlbmRDb2x1bW4gPSBlbmQuY29sdW1uXG5cbiAgICByYW5nZXMuZXZlcnkgKHtzdGFydCwgZW5kfSkgLT5cbiAgICAgIChzdGFydC5jb2x1bW4gaXMgc3RhcnRDb2x1bW4pIGFuZCAoZW5kLmNvbHVtbiBpcyBlbmRDb2x1bW4pXG5cbiAgZmxhc2g6IChmbGFzaFJhbmdlcywgb3B0aW9ucykgLT5cbiAgICBvcHRpb25zLnRpbWVvdXQgPz0gNTAwXG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICBAdmltU3RhdGUuZmxhc2goZmxhc2hSYW5nZXMsIG9wdGlvbnMpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICB7bmV3UmFuZ2VzLCBvbGRSYW5nZXN9ID0gQG11dGF0ZVdpdGhUcmFja0NoYW5nZXMoKVxuXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgc2VsZWN0aW9uLmNsZWFyKClcblxuICAgIGlmIEBnZXRDb25maWcoJ3NldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG8nKVxuICAgICAgc3RyYXRlZ3kgPSBAZ2V0Q29uZmlnKCdzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvU3RyYXRlZ3knKVxuICAgICAgQHNldEN1cnNvclBvc2l0aW9uKHtuZXdSYW5nZXMsIG9sZFJhbmdlcywgc3RyYXRlZ3l9KVxuICAgICAgQHZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgICBpZiBAZ2V0Q29uZmlnKCdmbGFzaE9uVW5kb1JlZG8nKVxuICAgICAgQGZsYXNoQ2hhbmdlcyh7bmV3UmFuZ2VzLCBvbGRSYW5nZXN9KVxuXG4gICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJylcblxuICBtdXRhdGU6IC0+XG4gICAgQGVkaXRvci51bmRvKClcblxuY2xhc3MgUmVkbyBleHRlbmRzIFVuZG9cbiAgQGV4dGVuZCgpXG4gIG11dGF0ZTogLT5cbiAgICBAZWRpdG9yLnJlZG8oKVxuXG5jbGFzcyBUb2dnbGVGb2xkIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgcG9pbnQgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBAZWRpdG9yLnRvZ2dsZUZvbGRBdEJ1ZmZlclJvdyhwb2ludC5yb3cpXG5cbmNsYXNzIFJlcGxhY2VNb2RlQmFja3NwYWNlIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGNvbW1hbmRTY29wZTogJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5pbnNlcnQtbW9kZS5yZXBsYWNlJ1xuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAjIGNoYXIgbWlnaHQgYmUgZW1wdHkuXG4gICAgICBjaGFyID0gQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmdldFJlcGxhY2VkQ2hhckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICBpZiBjaGFyP1xuICAgICAgICBzZWxlY3Rpb24uc2VsZWN0TGVmdCgpXG4gICAgICAgIHVubGVzcyBzZWxlY3Rpb24uaW5zZXJ0VGV4dChjaGFyKS5pc0VtcHR5KClcbiAgICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLm1vdmVMZWZ0KClcblxuY2xhc3MgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb24gZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKGZhbHNlKVxuICBzY3JvbGxvZmY6IDIgIyBhdG9tIGRlZmF1bHQuIEJldHRlciB0byB1c2UgZWRpdG9yLmdldFZlcnRpY2FsU2Nyb2xsTWFyZ2luKCk/XG4gIGN1cnNvclBpeGVsOiBudWxsXG5cbiAgZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93OiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3c6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gIGdldExhc3RTY3JlZW5Sb3c6IC0+XG4gICAgQGVkaXRvci5nZXRMYXN0U2NyZWVuUm93KClcblxuICBnZXRDdXJzb3JQaXhlbDogLT5cbiAgICBwb2ludCA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgIEBlZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihwb2ludClcblxuIyBjdHJsLWUgc2Nyb2xsIGxpbmVzIGRvd253YXJkc1xuY2xhc3MgU2Nyb2xsRG93biBleHRlbmRzIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uXG4gIEBleHRlbmQoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgY291bnQgPSBAZ2V0Q291bnQoKVxuICAgIG9sZEZpcnN0Um93ID0gQGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIEBlZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KG9sZEZpcnN0Um93ICsgY291bnQpXG4gICAgbmV3Rmlyc3RSb3cgPSBAZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgICBtYXJnaW4gPSBAZWRpdG9yLmdldFZlcnRpY2FsU2Nyb2xsTWFyZ2luKClcbiAgICB7cm93LCBjb2x1bW59ID0gQGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG4gICAgaWYgcm93IDwgKG5ld0ZpcnN0Um93ICsgbWFyZ2luKVxuICAgICAgbmV3UG9pbnQgPSBbcm93ICsgY291bnQsIGNvbHVtbl1cbiAgICAgIEBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24obmV3UG9pbnQsIGF1dG9zY3JvbGw6IGZhbHNlKVxuXG4jIGN0cmwteSBzY3JvbGwgbGluZXMgdXB3YXJkc1xuY2xhc3MgU2Nyb2xsVXAgZXh0ZW5kcyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvblxuICBAZXh0ZW5kKClcblxuICBleGVjdXRlOiAtPlxuICAgIGNvdW50ID0gQGdldENvdW50KClcbiAgICBvbGRGaXJzdFJvdyA9IEBlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICBAZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhvbGRGaXJzdFJvdyAtIGNvdW50KVxuICAgIG5ld0xhc3RSb3cgPSBAZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcblxuICAgIG1hcmdpbiA9IEBlZGl0b3IuZ2V0VmVydGljYWxTY3JvbGxNYXJnaW4oKVxuICAgIHtyb3csIGNvbHVtbn0gPSBAZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcbiAgICBpZiByb3cgPj0gKG5ld0xhc3RSb3cgLSBtYXJnaW4pXG4gICAgICBuZXdQb2ludCA9IFtyb3cgLSBjb3VudCwgY29sdW1uXVxuICAgICAgQGVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbihuZXdQb2ludCwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiMgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb24gd2l0aG91dCBDdXJzb3IgUG9zaXRpb24gY2hhbmdlLlxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTY3JvbGxDdXJzb3IgZXh0ZW5kcyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuICBleGVjdXRlOiAtPlxuICAgIEBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZT8oKVxuICAgIGlmIEBpc1Njcm9sbGFibGUoKVxuICAgICAgQGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wIEBnZXRTY3JvbGxUb3AoKVxuXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lOiAtPlxuICAgIEBlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuXG4gIGdldE9mZlNldFBpeGVsSGVpZ2h0OiAobGluZURlbHRhPTApIC0+XG4gICAgQGVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSAqIChAc2Nyb2xsb2ZmICsgbGluZURlbHRhKVxuXG4jIHogZW50ZXJcbmNsYXNzIFNjcm9sbEN1cnNvclRvVG9wIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yXG4gIEBleHRlbmQoKVxuICBpc1Njcm9sbGFibGU6IC0+XG4gICAgQGdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkgaXNudCBAZ2V0TGFzdFNjcmVlblJvdygpXG5cbiAgZ2V0U2Nyb2xsVG9wOiAtPlxuICAgIEBnZXRDdXJzb3JQaXhlbCgpLnRvcCAtIEBnZXRPZmZTZXRQaXhlbEhlaWdodCgpXG5cbiMgenRcbmNsYXNzIFNjcm9sbEN1cnNvclRvVG9wTGVhdmUgZXh0ZW5kcyBTY3JvbGxDdXJzb3JUb1RvcFxuICBAZXh0ZW5kKClcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmU6IG51bGxcblxuIyB6LVxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Cb3R0b20gZXh0ZW5kcyBTY3JvbGxDdXJzb3JcbiAgQGV4dGVuZCgpXG4gIGlzU2Nyb2xsYWJsZTogLT5cbiAgICBAZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkgaXNudCAwXG5cbiAgZ2V0U2Nyb2xsVG9wOiAtPlxuICAgIEBnZXRDdXJzb3JQaXhlbCgpLnRvcCAtIChAZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAtIEBnZXRPZmZTZXRQaXhlbEhlaWdodCgxKSlcblxuIyB6YlxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Cb3R0b21MZWF2ZSBleHRlbmRzIFNjcm9sbEN1cnNvclRvQm90dG9tXG4gIEBleHRlbmQoKVxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZTogbnVsbFxuXG4jIHouXG5jbGFzcyBTY3JvbGxDdXJzb3JUb01pZGRsZSBleHRlbmRzIFNjcm9sbEN1cnNvclxuICBAZXh0ZW5kKClcbiAgaXNTY3JvbGxhYmxlOiAtPlxuICAgIHRydWVcblxuICBnZXRTY3JvbGxUb3A6IC0+XG4gICAgQGdldEN1cnNvclBpeGVsKCkudG9wIC0gKEBlZGl0b3JFbGVtZW50LmdldEhlaWdodCgpIC8gMilcblxuIyB6elxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9NaWRkbGVMZWF2ZSBleHRlbmRzIFNjcm9sbEN1cnNvclRvTWlkZGxlXG4gIEBleHRlbmQoKVxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZTogbnVsbFxuXG4jIEhvcml6b250YWwgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb25cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyB6c1xuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9MZWZ0IGV4dGVuZHMgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb25cbiAgQGV4dGVuZCgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxMZWZ0KEBnZXRDdXJzb3JQaXhlbCgpLmxlZnQpXG5cbiMgemVcbmNsYXNzIFNjcm9sbEN1cnNvclRvUmlnaHQgZXh0ZW5kcyBTY3JvbGxDdXJzb3JUb0xlZnRcbiAgQGV4dGVuZCgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxSaWdodChAZ2V0Q3Vyc29yUGl4ZWwoKS5sZWZ0KVxuXG4jIGluc2VydC1tb2RlIHNwZWNpZmljIGNvbW1hbmRzXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEluc2VydE1vZGUgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAY29tbWFuZFNjb3BlOiAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmluc2VydC1tb2RlJ1xuXG5jbGFzcyBBY3RpdmF0ZU5vcm1hbE1vZGVPbmNlIGV4dGVuZHMgSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgdGhpc0NvbW1hbmROYW1lOiBAZ2V0Q29tbWFuZE5hbWUoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgY3Vyc29yc1RvTW92ZVJpZ2h0ID0gQGVkaXRvci5nZXRDdXJzb3JzKCkuZmlsdGVyIChjdXJzb3IpIC0+IG5vdCBjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpXG4gICAgQHZpbVN0YXRlLmFjdGl2YXRlKCdub3JtYWwnKVxuICAgIG1vdmVDdXJzb3JSaWdodChjdXJzb3IpIGZvciBjdXJzb3IgaW4gY3Vyc29yc1RvTW92ZVJpZ2h0XG4gICAgZGlzcG9zYWJsZSA9IGF0b20uY29tbWFuZHMub25EaWREaXNwYXRjaCAoe3R5cGV9KSA9PlxuICAgICAgcmV0dXJuIGlmIHR5cGUgaXMgQHRoaXNDb21tYW5kTmFtZVxuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgIGRpc3Bvc2FibGUgPSBudWxsXG4gICAgICBAdmltU3RhdGUuYWN0aXZhdGUoJ2luc2VydCcpXG5cbmNsYXNzIEluc2VydFJlZ2lzdGVyIGV4dGVuZHMgSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBmb2N1c0lucHV0KClcblxuICBleGVjdXRlOiAtPlxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgdGV4dCA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KEBpbnB1dCwgc2VsZWN0aW9uKVxuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuXG5jbGFzcyBJbnNlcnRMYXN0SW5zZXJ0ZWQgZXh0ZW5kcyBJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiXCJcIlxuICBJbnNlcnQgdGV4dCBpbnNlcnRlZCBpbiBsYXRlc3QgaW5zZXJ0LW1vZGUuXG4gIEVxdWl2YWxlbnQgdG8gKmlfQ1RSTC1BKiBvZiBwdXJlIFZpbVxuICBcIlwiXCJcbiAgZXhlY3V0ZTogLT5cbiAgICB0ZXh0ID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldFRleHQoJy4nKVxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dCh0ZXh0KVxuXG5jbGFzcyBDb3B5RnJvbUxpbmVBYm92ZSBleHRlbmRzIEluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJcIlwiXG4gIEluc2VydCBjaGFyYWN0ZXIgb2Ygc2FtZS1jb2x1bW4gb2YgYWJvdmUgbGluZS5cbiAgRXF1aXZhbGVudCB0byAqaV9DVFJMLVkqIG9mIHB1cmUgVmltXG4gIFwiXCJcIlxuICByb3dEZWx0YTogLTFcblxuICBleGVjdXRlOiAtPlxuICAgIHRyYW5zbGF0aW9uID0gW0Byb3dEZWx0YSwgMF1cbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgIHBvaW50ID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYW5zbGF0ZSh0cmFuc2xhdGlvbilcbiAgICAgICAgcmFuZ2UgPSBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIDEpXG4gICAgICAgIGlmIHRleHQgPSBAZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG5cbmNsYXNzIENvcHlGcm9tTGluZUJlbG93IGV4dGVuZHMgQ29weUZyb21MaW5lQWJvdmVcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJcIlwiXG4gIEluc2VydCBjaGFyYWN0ZXIgb2Ygc2FtZS1jb2x1bW4gb2YgYWJvdmUgbGluZS5cbiAgRXF1aXZhbGVudCB0byAqaV9DVFJMLUUqIG9mIHB1cmUgVmltXG4gIFwiXCJcIlxuICByb3dEZWx0YTogKzFcbiJdfQ==
