(function() {
  var ActivateNormalModeOnce, Base, BlockwiseOtherEnd, CopyFromLineAbove, CopyFromLineBelow, FoldAll, FoldNextIndentLevel, InsertLastInserted, InsertMode, InsertRegister, Mark, MiscCommand, NextTab, Point, PreviousTab, Range, Redo, ReplaceModeBackspace, ReverseSelections, ScrollCursor, ScrollCursorToBottom, ScrollCursorToBottomLeave, ScrollCursorToLeft, ScrollCursorToMiddle, ScrollCursorToMiddleLeave, ScrollCursorToRight, ScrollCursorToTop, ScrollCursorToTopLeave, ScrollDown, ScrollUp, ScrollWithoutChangingCursorPosition, ToggleFold, Undo, UnfoldAll, UnfoldNextIndentLevel, _, findRangeContainsPoint, getFoldInfoByKind, humanizeBufferRange, isLeadingWhiteSpaceRange, isLinewiseRange, isSingleLineRange, limitNumber, moveCursorRight, ref, ref1, setBufferRow, sortRanges,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point;

  Base = require('./base');

  _ = require('underscore-plus');

  ref1 = require('./utils'), moveCursorRight = ref1.moveCursorRight, isLinewiseRange = ref1.isLinewiseRange, setBufferRow = ref1.setBufferRow, sortRanges = ref1.sortRanges, findRangeContainsPoint = ref1.findRangeContainsPoint, isSingleLineRange = ref1.isSingleLineRange, isLeadingWhiteSpaceRange = ref1.isLeadingWhiteSpaceRange, humanizeBufferRange = ref1.humanizeBufferRange, getFoldInfoByKind = ref1.getFoldInfoByKind, limitNumber = ref1.limitNumber;

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

  UnfoldAll = (function(superClass) {
    extend(UnfoldAll, superClass);

    function UnfoldAll() {
      return UnfoldAll.__super__.constructor.apply(this, arguments);
    }

    UnfoldAll.extend();

    UnfoldAll.prototype.execute = function() {
      return this.editor.unfoldAll();
    };

    return UnfoldAll;

  })(MiscCommand);

  FoldAll = (function(superClass) {
    extend(FoldAll, superClass);

    function FoldAll() {
      return FoldAll.__super__.constructor.apply(this, arguments);
    }

    FoldAll.extend();

    FoldAll.prototype.execute = function() {
      var allFold, endRow, i, indent, len, ref2, ref3, results, startRow;
      allFold = getFoldInfoByKind(this.editor).allFold;
      if (allFold != null) {
        this.editor.unfoldAll();
        ref2 = allFold.rowRangesWithIndent;
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          ref3 = ref2[i], indent = ref3.indent, startRow = ref3.startRow, endRow = ref3.endRow;
          if (indent <= this.getConfig('maxFoldableIndentLevel')) {
            results.push(this.editor.foldBufferRowRange(startRow, endRow));
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    };

    return FoldAll;

  })(MiscCommand);

  UnfoldNextIndentLevel = (function(superClass) {
    extend(UnfoldNextIndentLevel, superClass);

    function UnfoldNextIndentLevel() {
      return UnfoldNextIndentLevel.__super__.constructor.apply(this, arguments);
    }

    UnfoldNextIndentLevel.extend();

    UnfoldNextIndentLevel.prototype.execute = function() {
      var count, folded, i, indent, j, len, minIndent, ref2, ref3, results, results1, rowRangesWithIndent, startRow, targetIndents;
      folded = getFoldInfoByKind(this.editor).folded;
      if (folded != null) {
        minIndent = folded.minIndent, rowRangesWithIndent = folded.rowRangesWithIndent;
        count = limitNumber(this.getCount() - 1, {
          min: 0
        });
        targetIndents = (function() {
          results = [];
          for (var i = minIndent, ref2 = minIndent + count; minIndent <= ref2 ? i <= ref2 : i >= ref2; minIndent <= ref2 ? i++ : i--){ results.push(i); }
          return results;
        }).apply(this);
        results1 = [];
        for (j = 0, len = rowRangesWithIndent.length; j < len; j++) {
          ref3 = rowRangesWithIndent[j], indent = ref3.indent, startRow = ref3.startRow;
          if (indexOf.call(targetIndents, indent) >= 0) {
            results1.push(this.editor.unfoldBufferRow(startRow));
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }
    };

    return UnfoldNextIndentLevel;

  })(MiscCommand);

  FoldNextIndentLevel = (function(superClass) {
    extend(FoldNextIndentLevel, superClass);

    function FoldNextIndentLevel() {
      return FoldNextIndentLevel.__super__.constructor.apply(this, arguments);
    }

    FoldNextIndentLevel.extend();

    FoldNextIndentLevel.prototype.execute = function() {
      var allFold, count, endRow, fromLevel, i, indent, j, len, maxFoldable, ref2, ref3, ref4, results, results1, startRow, targetIndents, unfolded;
      ref2 = getFoldInfoByKind(this.editor), unfolded = ref2.unfolded, allFold = ref2.allFold;
      if (unfolded != null) {
        this.editor.unfoldAll();
        maxFoldable = this.getConfig('maxFoldableIndentLevel');
        fromLevel = Math.min(unfolded.maxIndent, maxFoldable);
        count = limitNumber(this.getCount() - 1, {
          min: 0
        });
        fromLevel = limitNumber(fromLevel - count, {
          min: 0
        });
        targetIndents = (function() {
          results = [];
          for (var i = fromLevel; fromLevel <= maxFoldable ? i <= maxFoldable : i >= maxFoldable; fromLevel <= maxFoldable ? i++ : i--){ results.push(i); }
          return results;
        }).apply(this);
        ref3 = allFold.rowRangesWithIndent;
        results1 = [];
        for (j = 0, len = ref3.length; j < len; j++) {
          ref4 = ref3[j], indent = ref4.indent, startRow = ref4.startRow, endRow = ref4.endRow;
          if (indexOf.call(targetIndents, indent) >= 0) {
            results1.push(this.editor.foldBufferRowRange(startRow, endRow));
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }
    };

    return FoldNextIndentLevel;

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

  NextTab = (function(superClass) {
    extend(NextTab, superClass);

    function NextTab() {
      return NextTab.__super__.constructor.apply(this, arguments);
    }

    NextTab.extend();

    NextTab.prototype.defaultCount = 0;

    NextTab.prototype.execute = function() {
      var count, pane;
      count = this.getCount();
      pane = atom.workspace.paneForItem(this.editor);
      if (count) {
        return pane.activateItemAtIndex(count - 1);
      } else {
        return pane.activateNextItem();
      }
    };

    return NextTab;

  })(MiscCommand);

  PreviousTab = (function(superClass) {
    extend(PreviousTab, superClass);

    function PreviousTab() {
      return PreviousTab.__super__.constructor.apply(this, arguments);
    }

    PreviousTab.extend();

    PreviousTab.prototype.execute = function() {
      var pane;
      pane = atom.workspace.paneForItem(this.editor);
      return pane.activatePreviousItem();
    };

    return PreviousTab;

  })(MiscCommand);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGd3QkFBQTtJQUFBOzs7O0VBQUEsTUFBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxpQkFBRCxFQUFROztFQUNSLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVKLE9BV0ksT0FBQSxDQUFRLFNBQVIsQ0FYSixFQUNFLHNDQURGLEVBRUUsc0NBRkYsRUFHRSxnQ0FIRixFQUlFLDRCQUpGLEVBS0Usb0RBTEYsRUFNRSwwQ0FORixFQU9FLHdEQVBGLEVBUUUsOENBUkYsRUFTRSwwQ0FURixFQVVFOztFQUdJOzs7SUFDSixXQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O0lBQ0EsV0FBQyxDQUFBLGFBQUQsR0FBZ0I7O0lBQ0gscUJBQUE7TUFDWCw4Q0FBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQUZXOzs7O0tBSFc7O0VBT3BCOzs7Ozs7O0lBQ0osSUFBQyxDQUFBLE1BQUQsQ0FBQTs7bUJBQ0EsWUFBQSxHQUFjOzttQkFDZCxVQUFBLEdBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxVQUFELENBQUE7YUFDQSxzQ0FBQSxTQUFBO0lBRlU7O21CQUlaLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsS0FBcEIsRUFBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQTNCO2FBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxRQUFkO0lBRk87Ozs7S0FQUTs7RUFXYjs7Ozs7OztJQUNKLGlCQUFDLENBQUEsTUFBRCxDQUFBOztnQ0FDQSxPQUFBLEdBQVMsU0FB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ZTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakI7SUFGTzs7OztLQVJxQjs7RUFpQjFCOzs7Ozs7O0lBQ0osaUJBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsaUJBQUMsQ0FBQSxXQUFELEdBQWM7O2dDQUlkLFFBQUEsR0FBVSxDQUFDOzs7O0tBTm1COztFQVExQjs7Ozs7OztJQUNKLE9BQUMsQ0FBQSxNQUFELENBQUE7O3NCQUNBLFlBQUEsR0FBYzs7c0JBQ2QsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxRQUFELENBQUE7TUFDUixJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFmLENBQTJCLElBQUMsQ0FBQSxNQUE1QjtNQUNQLElBQUcsS0FBSDtlQUNFLElBQUksQ0FBQyxtQkFBTCxDQUF5QixLQUFBLEdBQVEsQ0FBakMsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFJLENBQUMsZ0JBQUwsQ0FBQSxFQUhGOztJQUhPOzs7O0tBSFc7O0VBV2hCOzs7Ozs7O0lBQ0osV0FBQyxDQUFBLE1BQUQsQ0FBQTs7MEJBQ0EsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBZixDQUEyQixJQUFDLENBQUEsTUFBNUI7YUFDUCxJQUFJLENBQUMsb0JBQUwsQ0FBQTtJQUZPOzs7O0tBRmU7QUFoYjFCIiwic291cmNlc0NvbnRlbnQiOlsie1JhbmdlLCBQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbntcbiAgbW92ZUN1cnNvclJpZ2h0XG4gIGlzTGluZXdpc2VSYW5nZVxuICBzZXRCdWZmZXJSb3dcbiAgc29ydFJhbmdlc1xuICBmaW5kUmFuZ2VDb250YWluc1BvaW50XG4gIGlzU2luZ2xlTGluZVJhbmdlXG4gIGlzTGVhZGluZ1doaXRlU3BhY2VSYW5nZVxuICBodW1hbml6ZUJ1ZmZlclJhbmdlXG4gIGdldEZvbGRJbmZvQnlLaW5kXG4gIGxpbWl0TnVtYmVyXG59ID0gcmVxdWlyZSAnLi91dGlscydcblxuY2xhc3MgTWlzY0NvbW1hbmQgZXh0ZW5kcyBCYXNlXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBvcGVyYXRpb25LaW5kOiAnbWlzYy1jb21tYW5kJ1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIEBpbml0aWFsaXplKClcblxuY2xhc3MgTWFyayBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBleHRlbmQoKVxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAZm9jdXNJbnB1dCgpXG4gICAgc3VwZXJcblxuICBleGVjdXRlOiAtPlxuICAgIEB2aW1TdGF0ZS5tYXJrLnNldChAaW5wdXQsIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICBAYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuXG5jbGFzcyBSZXZlcnNlU2VsZWN0aW9ucyBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIEBzd3JhcC5zZXRSZXZlcnNlZFN0YXRlKEBlZGl0b3IsIG5vdCBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5pc1JldmVyc2VkKCkpXG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICBAZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKVxuXG5jbGFzcyBCbG9ja3dpc2VPdGhlckVuZCBleHRlbmRzIFJldmVyc2VTZWxlY3Rpb25zXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQGdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnJldmVyc2UoKVxuICAgIHN1cGVyXG5cbmNsYXNzIFVuZG8gZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcblxuICBzZXRDdXJzb3JQb3NpdGlvbjogKHtuZXdSYW5nZXMsIG9sZFJhbmdlcywgc3RyYXRlZ3l9KSAtPlxuICAgIGxhc3RDdXJzb3IgPSBAZWRpdG9yLmdldExhc3RDdXJzb3IoKSAjIFRoaXMgaXMgcmVzdG9yZWQgY3Vyc29yXG5cbiAgICBpZiBzdHJhdGVneSBpcyAnc21hcnQnXG4gICAgICBjaGFuZ2VkUmFuZ2UgPSBmaW5kUmFuZ2VDb250YWluc1BvaW50KG5ld1JhbmdlcywgbGFzdEN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgIGVsc2VcbiAgICAgIGNoYW5nZWRSYW5nZSA9IHNvcnRSYW5nZXMobmV3UmFuZ2VzLmNvbmNhdChvbGRSYW5nZXMpKVswXVxuXG4gICAgaWYgY2hhbmdlZFJhbmdlP1xuICAgICAgaWYgaXNMaW5ld2lzZVJhbmdlKGNoYW5nZWRSYW5nZSlcbiAgICAgICAgc2V0QnVmZmVyUm93KGxhc3RDdXJzb3IsIGNoYW5nZWRSYW5nZS5zdGFydC5yb3cpXG4gICAgICBlbHNlXG4gICAgICAgIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oY2hhbmdlZFJhbmdlLnN0YXJ0KVxuXG4gIG11dGF0ZVdpdGhUcmFja0NoYW5nZXM6IC0+XG4gICAgbmV3UmFuZ2VzID0gW11cbiAgICBvbGRSYW5nZXMgPSBbXVxuXG4gICAgIyBDb2xsZWN0IGNoYW5nZWQgcmFuZ2Ugd2hpbGUgbXV0YXRpbmcgdGV4dC1zdGF0ZSBieSBmbiBjYWxsYmFjay5cbiAgICBkaXNwb3NhYmxlID0gQGVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZENoYW5nZSAoe25ld1JhbmdlLCBvbGRSYW5nZX0pIC0+XG4gICAgICBpZiBuZXdSYW5nZS5pc0VtcHR5KClcbiAgICAgICAgb2xkUmFuZ2VzLnB1c2gob2xkUmFuZ2UpICMgUmVtb3ZlIG9ubHlcbiAgICAgIGVsc2VcbiAgICAgICAgbmV3UmFuZ2VzLnB1c2gobmV3UmFuZ2UpXG5cbiAgICBAbXV0YXRlKClcblxuICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAge25ld1Jhbmdlcywgb2xkUmFuZ2VzfVxuXG4gIGZsYXNoQ2hhbmdlczogKHtuZXdSYW5nZXMsIG9sZFJhbmdlc30pIC0+XG4gICAgaXNNdWx0aXBsZVNpbmdsZUxpbmVSYW5nZXMgPSAocmFuZ2VzKSAtPlxuICAgICAgcmFuZ2VzLmxlbmd0aCA+IDEgYW5kIHJhbmdlcy5ldmVyeShpc1NpbmdsZUxpbmVSYW5nZSlcblxuICAgIGlmIG5ld1Jhbmdlcy5sZW5ndGggPiAwXG4gICAgICByZXR1cm4gaWYgQGlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uQW5kQ29uc2VjdXRpdmVSb3dzKG5ld1JhbmdlcylcbiAgICAgIG5ld1JhbmdlcyA9IG5ld1Jhbmdlcy5tYXAgKHJhbmdlKSA9PiBodW1hbml6ZUJ1ZmZlclJhbmdlKEBlZGl0b3IsIHJhbmdlKVxuICAgICAgbmV3UmFuZ2VzID0gQGZpbHRlck5vbkxlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UobmV3UmFuZ2VzKVxuXG4gICAgICBpZiBpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyhuZXdSYW5nZXMpXG4gICAgICAgIEBmbGFzaChuZXdSYW5nZXMsIHR5cGU6ICd1bmRvLXJlZG8tbXVsdGlwbGUtY2hhbmdlcycpXG4gICAgICBlbHNlXG4gICAgICAgIEBmbGFzaChuZXdSYW5nZXMsIHR5cGU6ICd1bmRvLXJlZG8nKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBpZiBAaXNNdWx0aXBsZUFuZEFsbFJhbmdlSGF2ZVNhbWVDb2x1bW5BbmRDb25zZWN1dGl2ZVJvd3Mob2xkUmFuZ2VzKVxuXG4gICAgICBpZiBpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyhvbGRSYW5nZXMpXG4gICAgICAgIG9sZFJhbmdlcyA9IEBmaWx0ZXJOb25MZWFkaW5nV2hpdGVTcGFjZVJhbmdlKG9sZFJhbmdlcylcbiAgICAgICAgQGZsYXNoKG9sZFJhbmdlcywgdHlwZTogJ3VuZG8tcmVkby1tdWx0aXBsZS1kZWxldGUnKVxuXG4gIGZpbHRlck5vbkxlYWRpbmdXaGl0ZVNwYWNlUmFuZ2U6IChyYW5nZXMpIC0+XG4gICAgcmFuZ2VzLmZpbHRlciAocmFuZ2UpID0+XG4gICAgICBub3QgaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlKEBlZGl0b3IsIHJhbmdlKVxuXG4gICMgW1RPRE9dIEltcHJvdmUgZnVydGhlciBieSBjaGVja2luZyBvbGRUZXh0LCBuZXdUZXh0P1xuICAjIFtQdXJwb3NlIG9mIHRoaXMgaXMgZnVuY3Rpb25dXG4gICMgU3VwcHJlc3MgZmxhc2ggd2hlbiB1bmRvL3JlZG9pbmcgdG9nZ2xlLWNvbW1lbnQgd2hpbGUgZmxhc2hpbmcgdW5kby9yZWRvIG9mIG9jY3VycmVuY2Ugb3BlcmF0aW9uLlxuICAjIFRoaXMgaHVyaXN0aWMgYXBwcm9hY2ggbmV2ZXIgYmUgcGVyZmVjdC5cbiAgIyBVbHRpbWF0ZWx5IGNhbm5ub3QgZGlzdGluZ3Vpc2ggb2NjdXJyZW5jZSBvcGVyYXRpb24uXG4gIGlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uQW5kQ29uc2VjdXRpdmVSb3dzOiAocmFuZ2VzKSAtPlxuICAgIHJldHVybiBmYWxzZSBpZiByYW5nZXMubGVuZ3RoIDw9IDFcblxuICAgIHtzdGFydDoge2NvbHVtbjogc3RhcnRDb2x1bW59LCBlbmQ6IHtjb2x1bW46IGVuZENvbHVtbn19ID0gcmFuZ2VzWzBdXG4gICAgcHJldmlvdXNSb3cgPSBudWxsXG4gICAgZm9yIHJhbmdlIGluIHJhbmdlc1xuICAgICAge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgICAgIHVubGVzcyAoKHN0YXJ0LmNvbHVtbiBpcyBzdGFydENvbHVtbikgYW5kIChlbmQuY29sdW1uIGlzIGVuZENvbHVtbikpXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICBpZiBwcmV2aW91c1Jvdz8gYW5kIChwcmV2aW91c1JvdyArIDEgaXNudCBzdGFydC5yb3cpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgcHJldmlvdXNSb3cgPSBzdGFydC5yb3dcbiAgICByZXR1cm4gdHJ1ZVxuXG4gICAgcmFuZ2VzLmV2ZXJ5ICh7c3RhcnQsIGVuZH0pIC0+XG4gICAgICAoc3RhcnQuY29sdW1uIGlzIHN0YXJ0Q29sdW1uKSBhbmQgKGVuZC5jb2x1bW4gaXMgZW5kQ29sdW1uKVxuXG4gIGZsYXNoOiAoZmxhc2hSYW5nZXMsIG9wdGlvbnMpIC0+XG4gICAgb3B0aW9ucy50aW1lb3V0ID89IDUwMFxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgQHZpbVN0YXRlLmZsYXNoKGZsYXNoUmFuZ2VzLCBvcHRpb25zKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAge25ld1Jhbmdlcywgb2xkUmFuZ2VzfSA9IEBtdXRhdGVXaXRoVHJhY2tDaGFuZ2VzKClcblxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHNlbGVjdGlvbi5jbGVhcigpXG5cbiAgICBpZiBAZ2V0Q29uZmlnKCdzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvJylcbiAgICAgIHN0cmF0ZWd5ID0gQGdldENvbmZpZygnc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkb1N0cmF0ZWd5JylcbiAgICAgIEBzZXRDdXJzb3JQb3NpdGlvbih7bmV3UmFuZ2VzLCBvbGRSYW5nZXMsIHN0cmF0ZWd5fSlcbiAgICAgIEB2aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuXG4gICAgaWYgQGdldENvbmZpZygnZmxhc2hPblVuZG9SZWRvJylcbiAgICAgIEBmbGFzaENoYW5nZXMoe25ld1Jhbmdlcywgb2xkUmFuZ2VzfSlcblxuICAgIEBhY3RpdmF0ZU1vZGUoJ25vcm1hbCcpXG5cbiAgbXV0YXRlOiAtPlxuICAgIEBlZGl0b3IudW5kbygpXG5cbmNsYXNzIFJlZG8gZXh0ZW5kcyBVbmRvXG4gIEBleHRlbmQoKVxuICBtdXRhdGU6IC0+XG4gICAgQGVkaXRvci5yZWRvKClcblxuIyB6YVxuY2xhc3MgVG9nZ2xlRm9sZCBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIHBvaW50ID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgQGVkaXRvci50b2dnbGVGb2xkQXRCdWZmZXJSb3cocG9pbnQucm93KVxuXG4jIHpSXG5jbGFzcyBVbmZvbGRBbGwgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yLnVuZm9sZEFsbCgpXG5cbiMgek1cbmNsYXNzIEZvbGRBbGwgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICB7YWxsRm9sZH0gPSBnZXRGb2xkSW5mb0J5S2luZChAZWRpdG9yKVxuICAgIGlmIGFsbEZvbGQ/XG4gICAgICBAZWRpdG9yLnVuZm9sZEFsbCgpXG4gICAgICBmb3Ige2luZGVudCwgc3RhcnRSb3csIGVuZFJvd30gaW4gYWxsRm9sZC5yb3dSYW5nZXNXaXRoSW5kZW50XG4gICAgICAgIGlmIGluZGVudCA8PSBAZ2V0Q29uZmlnKCdtYXhGb2xkYWJsZUluZGVudExldmVsJylcbiAgICAgICAgICBAZWRpdG9yLmZvbGRCdWZmZXJSb3dSYW5nZShzdGFydFJvdywgZW5kUm93KVxuXG4jIHpyXG5jbGFzcyBVbmZvbGROZXh0SW5kZW50TGV2ZWwgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICB7Zm9sZGVkfSA9IGdldEZvbGRJbmZvQnlLaW5kKEBlZGl0b3IpXG4gICAgaWYgZm9sZGVkP1xuICAgICAge21pbkluZGVudCwgcm93UmFuZ2VzV2l0aEluZGVudH0gPSBmb2xkZWRcbiAgICAgIGNvdW50ID0gbGltaXROdW1iZXIoQGdldENvdW50KCkgLSAxLCBtaW46IDApXG4gICAgICB0YXJnZXRJbmRlbnRzID0gW21pbkluZGVudC4uKG1pbkluZGVudCArIGNvdW50KV1cbiAgICAgIGZvciB7aW5kZW50LCBzdGFydFJvd30gaW4gcm93UmFuZ2VzV2l0aEluZGVudFxuICAgICAgICBpZiBpbmRlbnQgaW4gdGFyZ2V0SW5kZW50c1xuICAgICAgICAgIEBlZGl0b3IudW5mb2xkQnVmZmVyUm93KHN0YXJ0Um93KVxuXG4jIHptXG5jbGFzcyBGb2xkTmV4dEluZGVudExldmVsIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAge3VuZm9sZGVkLCBhbGxGb2xkfSA9IGdldEZvbGRJbmZvQnlLaW5kKEBlZGl0b3IpXG4gICAgaWYgdW5mb2xkZWQ/XG4gICAgICAjIEZJWE1FOiBXaHkgSSBuZWVkIHVuZm9sZEFsbCgpPyBXaHkgY2FuJ3QgSSBqdXN0IGZvbGQgbm9uLWZvbGRlZC1mb2xkIG9ubHk/XG4gICAgICAjIFVubGVzcyB1bmZvbGRBbGwoKSBoZXJlLCBAZWRpdG9yLnVuZm9sZEFsbCgpIGRlbGV0ZSBmb2xkTWFya2VyIGJ1dCBmYWlsXG4gICAgICAjIHRvIHJlbmRlciB1bmZvbGRlZCByb3dzIGNvcnJlY3RseS5cbiAgICAgICMgSSBiZWxpZXZlIHRoaXMgaXMgYnVnIG9mIHRleHQtYnVmZmVyJ3MgbWFya2VyTGF5ZXIgd2hpY2ggYXNzdW1lIGZvbGRzIGFyZVxuICAgICAgIyBjcmVhdGVkICoqaW4tb3JkZXIqKiBmcm9tIHRvcC1yb3cgdG8gYm90dG9tLXJvdy5cbiAgICAgIEBlZGl0b3IudW5mb2xkQWxsKClcblxuICAgICAgbWF4Rm9sZGFibGUgPSBAZ2V0Q29uZmlnKCdtYXhGb2xkYWJsZUluZGVudExldmVsJylcbiAgICAgIGZyb21MZXZlbCA9IE1hdGgubWluKHVuZm9sZGVkLm1heEluZGVudCwgbWF4Rm9sZGFibGUpXG4gICAgICBjb3VudCA9IGxpbWl0TnVtYmVyKEBnZXRDb3VudCgpIC0gMSwgbWluOiAwKVxuICAgICAgZnJvbUxldmVsID0gbGltaXROdW1iZXIoZnJvbUxldmVsIC0gY291bnQsIG1pbjogMClcbiAgICAgIHRhcmdldEluZGVudHMgPSBbZnJvbUxldmVsLi5tYXhGb2xkYWJsZV1cblxuICAgICAgZm9yIHtpbmRlbnQsIHN0YXJ0Um93LCBlbmRSb3d9IGluIGFsbEZvbGQucm93UmFuZ2VzV2l0aEluZGVudFxuICAgICAgICBpZiBpbmRlbnQgaW4gdGFyZ2V0SW5kZW50c1xuICAgICAgICAgIEBlZGl0b3IuZm9sZEJ1ZmZlclJvd1JhbmdlKHN0YXJ0Um93LCBlbmRSb3cpXG5cbmNsYXNzIFJlcGxhY2VNb2RlQmFja3NwYWNlIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGNvbW1hbmRTY29wZTogJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5pbnNlcnQtbW9kZS5yZXBsYWNlJ1xuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAjIGNoYXIgbWlnaHQgYmUgZW1wdHkuXG4gICAgICBjaGFyID0gQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmdldFJlcGxhY2VkQ2hhckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICBpZiBjaGFyP1xuICAgICAgICBzZWxlY3Rpb24uc2VsZWN0TGVmdCgpXG4gICAgICAgIHVubGVzcyBzZWxlY3Rpb24uaW5zZXJ0VGV4dChjaGFyKS5pc0VtcHR5KClcbiAgICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLm1vdmVMZWZ0KClcblxuY2xhc3MgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb24gZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKGZhbHNlKVxuICBzY3JvbGxvZmY6IDIgIyBhdG9tIGRlZmF1bHQuIEJldHRlciB0byB1c2UgZWRpdG9yLmdldFZlcnRpY2FsU2Nyb2xsTWFyZ2luKCk/XG4gIGN1cnNvclBpeGVsOiBudWxsXG5cbiAgZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93OiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3c6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gIGdldExhc3RTY3JlZW5Sb3c6IC0+XG4gICAgQGVkaXRvci5nZXRMYXN0U2NyZWVuUm93KClcblxuICBnZXRDdXJzb3JQaXhlbDogLT5cbiAgICBwb2ludCA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgIEBlZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihwb2ludClcblxuIyBjdHJsLWUgc2Nyb2xsIGxpbmVzIGRvd253YXJkc1xuY2xhc3MgU2Nyb2xsRG93biBleHRlbmRzIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uXG4gIEBleHRlbmQoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgY291bnQgPSBAZ2V0Q291bnQoKVxuICAgIG9sZEZpcnN0Um93ID0gQGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIEBlZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KG9sZEZpcnN0Um93ICsgY291bnQpXG4gICAgbmV3Rmlyc3RSb3cgPSBAZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgICBtYXJnaW4gPSBAZWRpdG9yLmdldFZlcnRpY2FsU2Nyb2xsTWFyZ2luKClcbiAgICB7cm93LCBjb2x1bW59ID0gQGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG4gICAgaWYgcm93IDwgKG5ld0ZpcnN0Um93ICsgbWFyZ2luKVxuICAgICAgbmV3UG9pbnQgPSBbcm93ICsgY291bnQsIGNvbHVtbl1cbiAgICAgIEBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24obmV3UG9pbnQsIGF1dG9zY3JvbGw6IGZhbHNlKVxuXG4jIGN0cmwteSBzY3JvbGwgbGluZXMgdXB3YXJkc1xuY2xhc3MgU2Nyb2xsVXAgZXh0ZW5kcyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvblxuICBAZXh0ZW5kKClcblxuICBleGVjdXRlOiAtPlxuICAgIGNvdW50ID0gQGdldENvdW50KClcbiAgICBvbGRGaXJzdFJvdyA9IEBlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICBAZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhvbGRGaXJzdFJvdyAtIGNvdW50KVxuICAgIG5ld0xhc3RSb3cgPSBAZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcblxuICAgIG1hcmdpbiA9IEBlZGl0b3IuZ2V0VmVydGljYWxTY3JvbGxNYXJnaW4oKVxuICAgIHtyb3csIGNvbHVtbn0gPSBAZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcbiAgICBpZiByb3cgPj0gKG5ld0xhc3RSb3cgLSBtYXJnaW4pXG4gICAgICBuZXdQb2ludCA9IFtyb3cgLSBjb3VudCwgY29sdW1uXVxuICAgICAgQGVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbihuZXdQb2ludCwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiMgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb24gd2l0aG91dCBDdXJzb3IgUG9zaXRpb24gY2hhbmdlLlxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTY3JvbGxDdXJzb3IgZXh0ZW5kcyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuICBleGVjdXRlOiAtPlxuICAgIEBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZT8oKVxuICAgIGlmIEBpc1Njcm9sbGFibGUoKVxuICAgICAgQGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wIEBnZXRTY3JvbGxUb3AoKVxuXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lOiAtPlxuICAgIEBlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuXG4gIGdldE9mZlNldFBpeGVsSGVpZ2h0OiAobGluZURlbHRhPTApIC0+XG4gICAgQGVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSAqIChAc2Nyb2xsb2ZmICsgbGluZURlbHRhKVxuXG4jIHogZW50ZXJcbmNsYXNzIFNjcm9sbEN1cnNvclRvVG9wIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yXG4gIEBleHRlbmQoKVxuICBpc1Njcm9sbGFibGU6IC0+XG4gICAgQGdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkgaXNudCBAZ2V0TGFzdFNjcmVlblJvdygpXG5cbiAgZ2V0U2Nyb2xsVG9wOiAtPlxuICAgIEBnZXRDdXJzb3JQaXhlbCgpLnRvcCAtIEBnZXRPZmZTZXRQaXhlbEhlaWdodCgpXG5cbiMgenRcbmNsYXNzIFNjcm9sbEN1cnNvclRvVG9wTGVhdmUgZXh0ZW5kcyBTY3JvbGxDdXJzb3JUb1RvcFxuICBAZXh0ZW5kKClcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmU6IG51bGxcblxuIyB6LVxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Cb3R0b20gZXh0ZW5kcyBTY3JvbGxDdXJzb3JcbiAgQGV4dGVuZCgpXG4gIGlzU2Nyb2xsYWJsZTogLT5cbiAgICBAZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkgaXNudCAwXG5cbiAgZ2V0U2Nyb2xsVG9wOiAtPlxuICAgIEBnZXRDdXJzb3JQaXhlbCgpLnRvcCAtIChAZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAtIEBnZXRPZmZTZXRQaXhlbEhlaWdodCgxKSlcblxuIyB6YlxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Cb3R0b21MZWF2ZSBleHRlbmRzIFNjcm9sbEN1cnNvclRvQm90dG9tXG4gIEBleHRlbmQoKVxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZTogbnVsbFxuXG4jIHouXG5jbGFzcyBTY3JvbGxDdXJzb3JUb01pZGRsZSBleHRlbmRzIFNjcm9sbEN1cnNvclxuICBAZXh0ZW5kKClcbiAgaXNTY3JvbGxhYmxlOiAtPlxuICAgIHRydWVcblxuICBnZXRTY3JvbGxUb3A6IC0+XG4gICAgQGdldEN1cnNvclBpeGVsKCkudG9wIC0gKEBlZGl0b3JFbGVtZW50LmdldEhlaWdodCgpIC8gMilcblxuIyB6elxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9NaWRkbGVMZWF2ZSBleHRlbmRzIFNjcm9sbEN1cnNvclRvTWlkZGxlXG4gIEBleHRlbmQoKVxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZTogbnVsbFxuXG4jIEhvcml6b250YWwgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb25cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyB6c1xuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9MZWZ0IGV4dGVuZHMgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb25cbiAgQGV4dGVuZCgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxMZWZ0KEBnZXRDdXJzb3JQaXhlbCgpLmxlZnQpXG5cbiMgemVcbmNsYXNzIFNjcm9sbEN1cnNvclRvUmlnaHQgZXh0ZW5kcyBTY3JvbGxDdXJzb3JUb0xlZnRcbiAgQGV4dGVuZCgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxSaWdodChAZ2V0Q3Vyc29yUGl4ZWwoKS5sZWZ0KVxuXG4jIGluc2VydC1tb2RlIHNwZWNpZmljIGNvbW1hbmRzXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEluc2VydE1vZGUgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAY29tbWFuZFNjb3BlOiAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmluc2VydC1tb2RlJ1xuXG5jbGFzcyBBY3RpdmF0ZU5vcm1hbE1vZGVPbmNlIGV4dGVuZHMgSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgdGhpc0NvbW1hbmROYW1lOiBAZ2V0Q29tbWFuZE5hbWUoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgY3Vyc29yc1RvTW92ZVJpZ2h0ID0gQGVkaXRvci5nZXRDdXJzb3JzKCkuZmlsdGVyIChjdXJzb3IpIC0+IG5vdCBjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpXG4gICAgQHZpbVN0YXRlLmFjdGl2YXRlKCdub3JtYWwnKVxuICAgIG1vdmVDdXJzb3JSaWdodChjdXJzb3IpIGZvciBjdXJzb3IgaW4gY3Vyc29yc1RvTW92ZVJpZ2h0XG4gICAgZGlzcG9zYWJsZSA9IGF0b20uY29tbWFuZHMub25EaWREaXNwYXRjaCAoe3R5cGV9KSA9PlxuICAgICAgcmV0dXJuIGlmIHR5cGUgaXMgQHRoaXNDb21tYW5kTmFtZVxuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgIGRpc3Bvc2FibGUgPSBudWxsXG4gICAgICBAdmltU3RhdGUuYWN0aXZhdGUoJ2luc2VydCcpXG5cbmNsYXNzIEluc2VydFJlZ2lzdGVyIGV4dGVuZHMgSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBmb2N1c0lucHV0KClcblxuICBleGVjdXRlOiAtPlxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgdGV4dCA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KEBpbnB1dCwgc2VsZWN0aW9uKVxuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuXG5jbGFzcyBJbnNlcnRMYXN0SW5zZXJ0ZWQgZXh0ZW5kcyBJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiXCJcIlxuICBJbnNlcnQgdGV4dCBpbnNlcnRlZCBpbiBsYXRlc3QgaW5zZXJ0LW1vZGUuXG4gIEVxdWl2YWxlbnQgdG8gKmlfQ1RSTC1BKiBvZiBwdXJlIFZpbVxuICBcIlwiXCJcbiAgZXhlY3V0ZTogLT5cbiAgICB0ZXh0ID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldFRleHQoJy4nKVxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dCh0ZXh0KVxuXG5jbGFzcyBDb3B5RnJvbUxpbmVBYm92ZSBleHRlbmRzIEluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJcIlwiXG4gIEluc2VydCBjaGFyYWN0ZXIgb2Ygc2FtZS1jb2x1bW4gb2YgYWJvdmUgbGluZS5cbiAgRXF1aXZhbGVudCB0byAqaV9DVFJMLVkqIG9mIHB1cmUgVmltXG4gIFwiXCJcIlxuICByb3dEZWx0YTogLTFcblxuICBleGVjdXRlOiAtPlxuICAgIHRyYW5zbGF0aW9uID0gW0Byb3dEZWx0YSwgMF1cbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgIHBvaW50ID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYW5zbGF0ZSh0cmFuc2xhdGlvbilcbiAgICAgICAgcmFuZ2UgPSBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIDEpXG4gICAgICAgIGlmIHRleHQgPSBAZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG5cbmNsYXNzIENvcHlGcm9tTGluZUJlbG93IGV4dGVuZHMgQ29weUZyb21MaW5lQWJvdmVcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJcIlwiXG4gIEluc2VydCBjaGFyYWN0ZXIgb2Ygc2FtZS1jb2x1bW4gb2YgYWJvdmUgbGluZS5cbiAgRXF1aXZhbGVudCB0byAqaV9DVFJMLUUqIG9mIHB1cmUgVmltXG4gIFwiXCJcIlxuICByb3dEZWx0YTogKzFcblxuY2xhc3MgTmV4dFRhYiBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBleHRlbmQoKVxuICBkZWZhdWx0Q291bnQ6IDBcbiAgZXhlY3V0ZTogLT5cbiAgICBjb3VudCA9IEBnZXRDb3VudCgpXG4gICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKEBlZGl0b3IpXG4gICAgaWYgY291bnRcbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtQXRJbmRleChjb3VudCAtIDEpXG4gICAgZWxzZVxuICAgICAgcGFuZS5hY3RpdmF0ZU5leHRJdGVtKClcblxuY2xhc3MgUHJldmlvdXNUYWIgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oQGVkaXRvcilcbiAgICBwYW5lLmFjdGl2YXRlUHJldmlvdXNJdGVtKClcbiJdfQ==