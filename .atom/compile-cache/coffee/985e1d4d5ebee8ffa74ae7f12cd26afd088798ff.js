(function() {
  var Base, CurrentSelection, Find, FindBackwards, Motion, MoveDown, MoveDownScreen, MoveDownToEdge, MoveDownWrap, MoveLeft, MoveRight, MoveRightBufferColumn, MoveToBeginningOfLine, MoveToBottomOfScreen, MoveToColumn, MoveToEndOfAlphanumericWord, MoveToEndOfSmartWord, MoveToEndOfSubword, MoveToEndOfWholeWord, MoveToEndOfWord, MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToFirstCharacterOfLineDown, MoveToFirstCharacterOfLineUp, MoveToFirstLine, MoveToLastCharacterOfLine, MoveToLastLine, MoveToLastNonblankCharacterOfLineAndDown, MoveToLineByPercent, MoveToMark, MoveToMarkLine, MoveToMiddleOfScreen, MoveToNextAlphanumericWord, MoveToNextFoldEnd, MoveToNextFoldStart, MoveToNextFoldStartWithSameIndent, MoveToNextFunction, MoveToNextNumber, MoveToNextOccurrence, MoveToNextParagraph, MoveToNextSentence, MoveToNextSentenceSkipBlankRow, MoveToNextSmartWord, MoveToNextString, MoveToNextSubword, MoveToNextWholeWord, MoveToNextWord, MoveToPair, MoveToPositionByScope, MoveToPreviousAlphanumericWord, MoveToPreviousEndOfWholeWord, MoveToPreviousEndOfWord, MoveToPreviousFoldEnd, MoveToPreviousFoldStart, MoveToPreviousFoldStartWithSameIndent, MoveToPreviousFunction, MoveToPreviousNumber, MoveToPreviousOccurrence, MoveToPreviousParagraph, MoveToPreviousSentence, MoveToPreviousSentenceSkipBlankRow, MoveToPreviousSmartWord, MoveToPreviousString, MoveToPreviousSubword, MoveToPreviousWholeWord, MoveToPreviousWord, MoveToRelativeLine, MoveToRelativeLineMinimumOne, MoveToTopOfScreen, MoveUp, MoveUpScreen, MoveUpToEdge, MoveUpWrap, Point, Range, Scroll, ScrollFullScreenDown, ScrollFullScreenUp, ScrollHalfScreenDown, ScrollHalfScreenUp, Till, TillBackwards, _, detectScopeStartPositionForScope, findRangeInBufferRow, getBufferRows, getCodeFoldRowRanges, getEndOfLineForBufferRow, getFirstVisibleScreenRow, getIndex, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getTextInScreenRange, getValidVimBufferRow, getValidVimScreenRow, isEmptyRow, isIncludeFunctionScopeForRow, limitNumber, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpScreen, pointIsAtEndOfLineAtNonEmptyRow, pointIsAtVimEndOfFile, pointIsOnWhiteSpace, ref, ref1, setBufferColumn, setBufferRow, smartScrollToBufferPosition, sortRanges,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  ref = require('atom'), Point = ref.Point, Range = ref.Range;

  ref1 = require('./utils'), moveCursorLeft = ref1.moveCursorLeft, moveCursorRight = ref1.moveCursorRight, moveCursorUpScreen = ref1.moveCursorUpScreen, moveCursorDownScreen = ref1.moveCursorDownScreen, pointIsAtVimEndOfFile = ref1.pointIsAtVimEndOfFile, getFirstVisibleScreenRow = ref1.getFirstVisibleScreenRow, getLastVisibleScreenRow = ref1.getLastVisibleScreenRow, getValidVimScreenRow = ref1.getValidVimScreenRow, getValidVimBufferRow = ref1.getValidVimBufferRow, moveCursorToFirstCharacterAtRow = ref1.moveCursorToFirstCharacterAtRow, sortRanges = ref1.sortRanges, pointIsOnWhiteSpace = ref1.pointIsOnWhiteSpace, moveCursorToNextNonWhitespace = ref1.moveCursorToNextNonWhitespace, isEmptyRow = ref1.isEmptyRow, getCodeFoldRowRanges = ref1.getCodeFoldRowRanges, getLargestFoldRangeContainsBufferRow = ref1.getLargestFoldRangeContainsBufferRow, isIncludeFunctionScopeForRow = ref1.isIncludeFunctionScopeForRow, detectScopeStartPositionForScope = ref1.detectScopeStartPositionForScope, getBufferRows = ref1.getBufferRows, getTextInScreenRange = ref1.getTextInScreenRange, setBufferRow = ref1.setBufferRow, setBufferColumn = ref1.setBufferColumn, limitNumber = ref1.limitNumber, getIndex = ref1.getIndex, smartScrollToBufferPosition = ref1.smartScrollToBufferPosition, pointIsAtEndOfLineAtNonEmptyRow = ref1.pointIsAtEndOfLineAtNonEmptyRow, getEndOfLineForBufferRow = ref1.getEndOfLineForBufferRow, findRangeInBufferRow = ref1.findRangeInBufferRow;

  Base = require('./base');

  Motion = (function(superClass) {
    extend(Motion, superClass);

    Motion.extend(false);

    Motion.operationKind = 'motion';

    Motion.prototype.inclusive = false;

    Motion.prototype.wise = 'characterwise';

    Motion.prototype.jump = false;

    Motion.prototype.verticalMotion = false;

    Motion.prototype.moveSucceeded = null;

    Motion.prototype.moveSuccessOnLinewise = false;

    function Motion() {
      Motion.__super__.constructor.apply(this, arguments);
      if (this.mode === 'visual') {
        this.wise = this.submode;
      }
      this.initialize();
    }

    Motion.prototype.isLinewise = function() {
      return this.wise === 'linewise';
    };

    Motion.prototype.isBlockwise = function() {
      return this.wise === 'blockwise';
    };

    Motion.prototype.forceWise = function(wise) {
      if (wise === 'characterwise') {
        if (this.wise === 'linewise') {
          this.inclusive = false;
        } else {
          this.inclusive = !this.inclusive;
        }
      }
      return this.wise = wise;
    };

    Motion.prototype.setBufferPositionSafely = function(cursor, point) {
      if (point != null) {
        return cursor.setBufferPosition(point);
      }
    };

    Motion.prototype.setScreenPositionSafely = function(cursor, point) {
      if (point != null) {
        return cursor.setScreenPosition(point);
      }
    };

    Motion.prototype.moveWithSaveJump = function(cursor) {
      var cursorPosition;
      if (cursor.isLastCursor() && this.jump) {
        cursorPosition = cursor.getBufferPosition();
      }
      this.moveCursor(cursor);
      if ((cursorPosition != null) && !cursorPosition.isEqual(cursor.getBufferPosition())) {
        this.vimState.mark.set('`', cursorPosition);
        return this.vimState.mark.set("'", cursorPosition);
      }
    };

    Motion.prototype.execute = function() {
      var cursor, j, len, ref2;
      if (this.operator != null) {
        this.select();
      } else {
        ref2 = this.editor.getCursors();
        for (j = 0, len = ref2.length; j < len; j++) {
          cursor = ref2[j];
          this.moveWithSaveJump(cursor);
        }
      }
      this.editor.mergeCursors();
      return this.editor.mergeIntersectingSelections();
    };

    Motion.prototype.select = function() {
      var $selection, isOrWasVisual, j, len, ref2, ref3, selection, succeeded;
      isOrWasVisual = this.mode === 'visual' || this.is('CurrentSelection');
      ref2 = this.editor.getSelections();
      for (j = 0, len = ref2.length; j < len; j++) {
        selection = ref2[j];
        selection.modifySelection((function(_this) {
          return function() {
            return _this.moveWithSaveJump(selection.cursor);
          };
        })(this));
        succeeded = ((ref3 = this.moveSucceeded) != null ? ref3 : !selection.isEmpty()) || (this.moveSuccessOnLinewise && this.isLinewise());
        if (isOrWasVisual || (succeeded && (this.inclusive || this.isLinewise()))) {
          $selection = this.swrap(selection);
          $selection.saveProperties(true);
          $selection.applyWise(this.wise);
        }
      }
      if (this.wise === 'blockwise') {
        return this.vimState.getLastBlockwiseSelection().autoscroll();
      }
    };

    Motion.prototype.setCursorBufferRow = function(cursor, row, options) {
      if (this.verticalMotion && this.getConfig('moveToFirstCharacterOnVerticalMotion')) {
        return cursor.setBufferPosition(this.getFirstCharacterPositionForBufferRow(row), options);
      } else {
        return setBufferRow(cursor, row, options);
      }
    };

    Motion.prototype.moveCursorCountTimes = function(cursor, fn) {
      var oldPosition;
      oldPosition = cursor.getBufferPosition();
      return this.countTimes(this.getCount(), function(state) {
        var newPosition;
        fn(state);
        if ((newPosition = cursor.getBufferPosition()).isEqual(oldPosition)) {
          state.stop();
        }
        return oldPosition = newPosition;
      });
    };

    return Motion;

  })(Base);

  CurrentSelection = (function(superClass) {
    extend(CurrentSelection, superClass);

    function CurrentSelection() {
      return CurrentSelection.__super__.constructor.apply(this, arguments);
    }

    CurrentSelection.extend(false);

    CurrentSelection.prototype.selectionExtent = null;

    CurrentSelection.prototype.blockwiseSelectionExtent = null;

    CurrentSelection.prototype.inclusive = true;

    CurrentSelection.prototype.initialize = function() {
      CurrentSelection.__super__.initialize.apply(this, arguments);
      return this.pointInfoByCursor = new Map;
    };

    CurrentSelection.prototype.moveCursor = function(cursor) {
      var point;
      if (this.mode === 'visual') {
        if (this.isBlockwise()) {
          return this.blockwiseSelectionExtent = this.swrap(cursor.selection).getBlockwiseSelectionExtent();
        } else {
          return this.selectionExtent = this.editor.getSelectedBufferRange().getExtent();
        }
      } else {
        point = cursor.getBufferPosition();
        if (this.blockwiseSelectionExtent != null) {
          return cursor.setBufferPosition(point.translate(this.blockwiseSelectionExtent));
        } else {
          return cursor.setBufferPosition(point.traverse(this.selectionExtent));
        }
      }
    };

    CurrentSelection.prototype.select = function() {
      var cursor, cursorPosition, j, k, len, len1, pointInfo, ref2, ref3, results, startOfSelection;
      if (this.mode === 'visual') {
        CurrentSelection.__super__.select.apply(this, arguments);
      } else {
        ref2 = this.editor.getCursors();
        for (j = 0, len = ref2.length; j < len; j++) {
          cursor = ref2[j];
          if (!(pointInfo = this.pointInfoByCursor.get(cursor))) {
            continue;
          }
          cursorPosition = pointInfo.cursorPosition, startOfSelection = pointInfo.startOfSelection;
          if (cursorPosition.isEqual(cursor.getBufferPosition())) {
            cursor.setBufferPosition(startOfSelection);
          }
        }
        CurrentSelection.__super__.select.apply(this, arguments);
      }
      ref3 = this.editor.getCursors();
      results = [];
      for (k = 0, len1 = ref3.length; k < len1; k++) {
        cursor = ref3[k];
        startOfSelection = cursor.selection.getBufferRange().start;
        results.push(this.onDidFinishOperation((function(_this) {
          return function() {
            cursorPosition = cursor.getBufferPosition();
            return _this.pointInfoByCursor.set(cursor, {
              startOfSelection: startOfSelection,
              cursorPosition: cursorPosition
            });
          };
        })(this)));
      }
      return results;
    };

    return CurrentSelection;

  })(Motion);

  MoveLeft = (function(superClass) {
    extend(MoveLeft, superClass);

    function MoveLeft() {
      return MoveLeft.__super__.constructor.apply(this, arguments);
    }

    MoveLeft.extend();

    MoveLeft.prototype.moveCursor = function(cursor) {
      var allowWrap;
      allowWrap = this.getConfig('wrapLeftRightMotion');
      return this.moveCursorCountTimes(cursor, function() {
        return moveCursorLeft(cursor, {
          allowWrap: allowWrap
        });
      });
    };

    return MoveLeft;

  })(Motion);

  MoveRight = (function(superClass) {
    extend(MoveRight, superClass);

    function MoveRight() {
      return MoveRight.__super__.constructor.apply(this, arguments);
    }

    MoveRight.extend();

    MoveRight.prototype.canWrapToNextLine = function(cursor) {
      if (this.isAsTargetExceptSelect() && !cursor.isAtEndOfLine()) {
        return false;
      } else {
        return this.getConfig('wrapLeftRightMotion');
      }
    };

    MoveRight.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          var allowWrap, cursorPosition;
          cursorPosition = cursor.getBufferPosition();
          _this.editor.unfoldBufferRow(cursorPosition.row);
          allowWrap = _this.canWrapToNextLine(cursor);
          moveCursorRight(cursor);
          if (cursor.isAtEndOfLine() && allowWrap && !pointIsAtVimEndOfFile(_this.editor, cursorPosition)) {
            return moveCursorRight(cursor, {
              allowWrap: allowWrap
            });
          }
        };
      })(this));
    };

    return MoveRight;

  })(Motion);

  MoveRightBufferColumn = (function(superClass) {
    extend(MoveRightBufferColumn, superClass);

    function MoveRightBufferColumn() {
      return MoveRightBufferColumn.__super__.constructor.apply(this, arguments);
    }

    MoveRightBufferColumn.extend(false);

    MoveRightBufferColumn.prototype.moveCursor = function(cursor) {
      return setBufferColumn(cursor, cursor.getBufferColumn() + this.getCount());
    };

    return MoveRightBufferColumn;

  })(Motion);

  MoveUp = (function(superClass) {
    extend(MoveUp, superClass);

    function MoveUp() {
      return MoveUp.__super__.constructor.apply(this, arguments);
    }

    MoveUp.extend();

    MoveUp.prototype.wise = 'linewise';

    MoveUp.prototype.wrap = false;

    MoveUp.prototype.getBufferRow = function(row) {
      row = this.getNextRow(row);
      if (this.editor.isFoldedAtBufferRow(row)) {
        return getLargestFoldRangeContainsBufferRow(this.editor, row).start.row;
      } else {
        return row;
      }
    };

    MoveUp.prototype.getNextRow = function(row) {
      var min;
      min = 0;
      if (this.wrap && row === min) {
        return this.getVimLastBufferRow();
      } else {
        return limitNumber(row - 1, {
          min: min
        });
      }
    };

    MoveUp.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          return setBufferRow(cursor, _this.getBufferRow(cursor.getBufferRow()));
        };
      })(this));
    };

    return MoveUp;

  })(Motion);

  MoveUpWrap = (function(superClass) {
    extend(MoveUpWrap, superClass);

    function MoveUpWrap() {
      return MoveUpWrap.__super__.constructor.apply(this, arguments);
    }

    MoveUpWrap.extend();

    MoveUpWrap.prototype.wrap = true;

    return MoveUpWrap;

  })(MoveUp);

  MoveDown = (function(superClass) {
    extend(MoveDown, superClass);

    function MoveDown() {
      return MoveDown.__super__.constructor.apply(this, arguments);
    }

    MoveDown.extend();

    MoveDown.prototype.wise = 'linewise';

    MoveDown.prototype.wrap = false;

    MoveDown.prototype.getBufferRow = function(row) {
      if (this.editor.isFoldedAtBufferRow(row)) {
        row = getLargestFoldRangeContainsBufferRow(this.editor, row).end.row;
      }
      return this.getNextRow(row);
    };

    MoveDown.prototype.getNextRow = function(row) {
      var max;
      max = this.getVimLastBufferRow();
      if (this.wrap && row >= max) {
        return 0;
      } else {
        return limitNumber(row + 1, {
          max: max
        });
      }
    };

    return MoveDown;

  })(MoveUp);

  MoveDownWrap = (function(superClass) {
    extend(MoveDownWrap, superClass);

    function MoveDownWrap() {
      return MoveDownWrap.__super__.constructor.apply(this, arguments);
    }

    MoveDownWrap.extend();

    MoveDownWrap.prototype.wrap = true;

    return MoveDownWrap;

  })(MoveDown);

  MoveUpScreen = (function(superClass) {
    extend(MoveUpScreen, superClass);

    function MoveUpScreen() {
      return MoveUpScreen.__super__.constructor.apply(this, arguments);
    }

    MoveUpScreen.extend();

    MoveUpScreen.prototype.wise = 'linewise';

    MoveUpScreen.prototype.direction = 'up';

    MoveUpScreen.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, function() {
        return moveCursorUpScreen(cursor);
      });
    };

    return MoveUpScreen;

  })(Motion);

  MoveDownScreen = (function(superClass) {
    extend(MoveDownScreen, superClass);

    function MoveDownScreen() {
      return MoveDownScreen.__super__.constructor.apply(this, arguments);
    }

    MoveDownScreen.extend();

    MoveDownScreen.prototype.wise = 'linewise';

    MoveDownScreen.prototype.direction = 'down';

    MoveDownScreen.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, function() {
        return moveCursorDownScreen(cursor);
      });
    };

    return MoveDownScreen;

  })(MoveUpScreen);

  MoveUpToEdge = (function(superClass) {
    extend(MoveUpToEdge, superClass);

    function MoveUpToEdge() {
      return MoveUpToEdge.__super__.constructor.apply(this, arguments);
    }

    MoveUpToEdge.extend();

    MoveUpToEdge.prototype.wise = 'linewise';

    MoveUpToEdge.prototype.jump = true;

    MoveUpToEdge.prototype.direction = 'up';

    MoveUpToEdge.description = "Move cursor up to **edge** char at same-column";

    MoveUpToEdge.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          return _this.setScreenPositionSafely(cursor, _this.getPoint(cursor.getScreenPosition()));
        };
      })(this));
    };

    MoveUpToEdge.prototype.getPoint = function(fromPoint) {
      var column, j, len, point, ref2, row;
      column = fromPoint.column;
      ref2 = this.getScanRows(fromPoint);
      for (j = 0, len = ref2.length; j < len; j++) {
        row = ref2[j];
        if (this.isEdge(point = new Point(row, column))) {
          return point;
        }
      }
    };

    MoveUpToEdge.prototype.getScanRows = function(arg) {
      var j, k, ref2, ref3, ref4, results, results1, row, validRow;
      row = arg.row;
      validRow = getValidVimScreenRow.bind(null, this.editor);
      switch (this.direction) {
        case 'up':
          return (function() {
            results = [];
            for (var j = ref2 = validRow(row - 1); ref2 <= 0 ? j <= 0 : j >= 0; ref2 <= 0 ? j++ : j--){ results.push(j); }
            return results;
          }).apply(this);
        case 'down':
          return (function() {
            results1 = [];
            for (var k = ref3 = validRow(row + 1), ref4 = this.getVimLastScreenRow(); ref3 <= ref4 ? k <= ref4 : k >= ref4; ref3 <= ref4 ? k++ : k--){ results1.push(k); }
            return results1;
          }).apply(this);
      }
    };

    MoveUpToEdge.prototype.isEdge = function(point) {
      var above, below;
      if (this.isStoppablePoint(point)) {
        above = point.translate([-1, 0]);
        below = point.translate([+1, 0]);
        return (!this.isStoppablePoint(above)) || (!this.isStoppablePoint(below));
      } else {
        return false;
      }
    };

    MoveUpToEdge.prototype.isStoppablePoint = function(point) {
      var leftPoint, rightPoint;
      if (this.isNonWhiteSpacePoint(point)) {
        return true;
      } else {
        leftPoint = point.translate([0, -1]);
        rightPoint = point.translate([0, +1]);
        return this.isNonWhiteSpacePoint(leftPoint) && this.isNonWhiteSpacePoint(rightPoint);
      }
    };

    MoveUpToEdge.prototype.isNonWhiteSpacePoint = function(point) {
      var char;
      char = getTextInScreenRange(this.editor, Range.fromPointWithDelta(point, 0, 1));
      return (char != null) && /\S/.test(char);
    };

    return MoveUpToEdge;

  })(Motion);

  MoveDownToEdge = (function(superClass) {
    extend(MoveDownToEdge, superClass);

    function MoveDownToEdge() {
      return MoveDownToEdge.__super__.constructor.apply(this, arguments);
    }

    MoveDownToEdge.extend();

    MoveDownToEdge.description = "Move cursor down to **edge** char at same-column";

    MoveDownToEdge.prototype.direction = 'down';

    return MoveDownToEdge;

  })(MoveUpToEdge);

  MoveToNextWord = (function(superClass) {
    extend(MoveToNextWord, superClass);

    function MoveToNextWord() {
      return MoveToNextWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextWord.extend();

    MoveToNextWord.prototype.wordRegex = null;

    MoveToNextWord.prototype.getPoint = function(pattern, from) {
      var found, point, ref2, vimEOF, wordRange;
      wordRange = null;
      found = false;
      vimEOF = this.getVimEofBufferPosition(this.editor);
      this.scanForward(pattern, {
        from: from
      }, function(arg) {
        var matchText, range, stop;
        range = arg.range, matchText = arg.matchText, stop = arg.stop;
        wordRange = range;
        if (matchText === '' && range.start.column !== 0) {
          return;
        }
        if (range.start.isGreaterThan(from)) {
          found = true;
          return stop();
        }
      });
      if (found) {
        point = wordRange.start;
        if (pointIsAtEndOfLineAtNonEmptyRow(this.editor, point) && !point.isEqual(vimEOF)) {
          return point.traverse([1, 0]);
        } else {
          return point;
        }
      } else {
        return (ref2 = wordRange != null ? wordRange.end : void 0) != null ? ref2 : from;
      }
    };

    MoveToNextWord.prototype.moveCursor = function(cursor) {
      var cursorPosition, isAsTargetExceptSelect, wasOnWhiteSpace;
      cursorPosition = cursor.getBufferPosition();
      if (pointIsAtVimEndOfFile(this.editor, cursorPosition)) {
        return;
      }
      wasOnWhiteSpace = pointIsOnWhiteSpace(this.editor, cursorPosition);
      isAsTargetExceptSelect = this.isAsTargetExceptSelect();
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function(arg) {
          var isFinal, pattern, point, ref2;
          isFinal = arg.isFinal;
          cursorPosition = cursor.getBufferPosition();
          if (isEmptyRow(_this.editor, cursorPosition.row) && isAsTargetExceptSelect) {
            point = cursorPosition.traverse([1, 0]);
          } else {
            pattern = (ref2 = _this.wordRegex) != null ? ref2 : cursor.wordRegExp();
            point = _this.getPoint(pattern, cursorPosition);
            if (isFinal && isAsTargetExceptSelect) {
              if (_this.operator.is('Change') && (!wasOnWhiteSpace)) {
                point = cursor.getEndOfCurrentWordBufferPosition({
                  wordRegex: _this.wordRegex
                });
              } else {
                point = Point.min(point, getEndOfLineForBufferRow(_this.editor, cursorPosition.row));
              }
            }
          }
          return cursor.setBufferPosition(point);
        };
      })(this));
    };

    return MoveToNextWord;

  })(Motion);

  MoveToPreviousWord = (function(superClass) {
    extend(MoveToPreviousWord, superClass);

    function MoveToPreviousWord() {
      return MoveToPreviousWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousWord.extend();

    MoveToPreviousWord.prototype.wordRegex = null;

    MoveToPreviousWord.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          var point;
          point = cursor.getBeginningOfCurrentWordBufferPosition({
            wordRegex: _this.wordRegex
          });
          return cursor.setBufferPosition(point);
        };
      })(this));
    };

    return MoveToPreviousWord;

  })(Motion);

  MoveToEndOfWord = (function(superClass) {
    extend(MoveToEndOfWord, superClass);

    function MoveToEndOfWord() {
      return MoveToEndOfWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfWord.extend();

    MoveToEndOfWord.prototype.wordRegex = null;

    MoveToEndOfWord.prototype.inclusive = true;

    MoveToEndOfWord.prototype.moveToNextEndOfWord = function(cursor) {
      var point;
      moveCursorToNextNonWhitespace(cursor);
      point = cursor.getEndOfCurrentWordBufferPosition({
        wordRegex: this.wordRegex
      }).translate([0, -1]);
      point = Point.min(point, this.getVimEofBufferPosition());
      return cursor.setBufferPosition(point);
    };

    MoveToEndOfWord.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          var originalPoint;
          originalPoint = cursor.getBufferPosition();
          _this.moveToNextEndOfWord(cursor);
          if (originalPoint.isEqual(cursor.getBufferPosition())) {
            cursor.moveRight();
            return _this.moveToNextEndOfWord(cursor);
          }
        };
      })(this));
    };

    return MoveToEndOfWord;

  })(Motion);

  MoveToPreviousEndOfWord = (function(superClass) {
    extend(MoveToPreviousEndOfWord, superClass);

    function MoveToPreviousEndOfWord() {
      return MoveToPreviousEndOfWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousEndOfWord.extend();

    MoveToPreviousEndOfWord.prototype.inclusive = true;

    MoveToPreviousEndOfWord.prototype.moveCursor = function(cursor) {
      var cursorPosition, j, point, ref2, times, wordRange;
      times = this.getCount();
      wordRange = cursor.getCurrentWordBufferRange();
      cursorPosition = cursor.getBufferPosition();
      if (cursorPosition.isGreaterThan(wordRange.start) && cursorPosition.isLessThan(wordRange.end)) {
        times += 1;
      }
      for (j = 1, ref2 = times; 1 <= ref2 ? j <= ref2 : j >= ref2; 1 <= ref2 ? j++ : j--) {
        point = cursor.getBeginningOfCurrentWordBufferPosition({
          wordRegex: this.wordRegex
        });
        cursor.setBufferPosition(point);
      }
      this.moveToNextEndOfWord(cursor);
      if (cursor.getBufferPosition().isGreaterThanOrEqual(cursorPosition)) {
        return cursor.setBufferPosition([0, 0]);
      }
    };

    MoveToPreviousEndOfWord.prototype.moveToNextEndOfWord = function(cursor) {
      var point;
      point = cursor.getEndOfCurrentWordBufferPosition({
        wordRegex: this.wordRegex
      }).translate([0, -1]);
      point = Point.min(point, this.getVimEofBufferPosition());
      return cursor.setBufferPosition(point);
    };

    return MoveToPreviousEndOfWord;

  })(MoveToPreviousWord);

  MoveToNextWholeWord = (function(superClass) {
    extend(MoveToNextWholeWord, superClass);

    function MoveToNextWholeWord() {
      return MoveToNextWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextWholeWord.extend();

    MoveToNextWholeWord.prototype.wordRegex = /^$|\S+/g;

    return MoveToNextWholeWord;

  })(MoveToNextWord);

  MoveToPreviousWholeWord = (function(superClass) {
    extend(MoveToPreviousWholeWord, superClass);

    function MoveToPreviousWholeWord() {
      return MoveToPreviousWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousWholeWord.extend();

    MoveToPreviousWholeWord.prototype.wordRegex = /^$|\S+/g;

    return MoveToPreviousWholeWord;

  })(MoveToPreviousWord);

  MoveToEndOfWholeWord = (function(superClass) {
    extend(MoveToEndOfWholeWord, superClass);

    function MoveToEndOfWholeWord() {
      return MoveToEndOfWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfWholeWord.extend();

    MoveToEndOfWholeWord.prototype.wordRegex = /\S+/;

    return MoveToEndOfWholeWord;

  })(MoveToEndOfWord);

  MoveToPreviousEndOfWholeWord = (function(superClass) {
    extend(MoveToPreviousEndOfWholeWord, superClass);

    function MoveToPreviousEndOfWholeWord() {
      return MoveToPreviousEndOfWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousEndOfWholeWord.extend();

    MoveToPreviousEndOfWholeWord.prototype.wordRegex = /\S+/;

    return MoveToPreviousEndOfWholeWord;

  })(MoveToPreviousEndOfWord);

  MoveToNextAlphanumericWord = (function(superClass) {
    extend(MoveToNextAlphanumericWord, superClass);

    function MoveToNextAlphanumericWord() {
      return MoveToNextAlphanumericWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextAlphanumericWord.extend();

    MoveToNextAlphanumericWord.description = "Move to next alphanumeric(`/\w+/`) word";

    MoveToNextAlphanumericWord.prototype.wordRegex = /\w+/g;

    return MoveToNextAlphanumericWord;

  })(MoveToNextWord);

  MoveToPreviousAlphanumericWord = (function(superClass) {
    extend(MoveToPreviousAlphanumericWord, superClass);

    function MoveToPreviousAlphanumericWord() {
      return MoveToPreviousAlphanumericWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousAlphanumericWord.extend();

    MoveToPreviousAlphanumericWord.description = "Move to previous alphanumeric(`/\w+/`) word";

    MoveToPreviousAlphanumericWord.prototype.wordRegex = /\w+/;

    return MoveToPreviousAlphanumericWord;

  })(MoveToPreviousWord);

  MoveToEndOfAlphanumericWord = (function(superClass) {
    extend(MoveToEndOfAlphanumericWord, superClass);

    function MoveToEndOfAlphanumericWord() {
      return MoveToEndOfAlphanumericWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfAlphanumericWord.extend();

    MoveToEndOfAlphanumericWord.description = "Move to end of alphanumeric(`/\w+/`) word";

    MoveToEndOfAlphanumericWord.prototype.wordRegex = /\w+/;

    return MoveToEndOfAlphanumericWord;

  })(MoveToEndOfWord);

  MoveToNextSmartWord = (function(superClass) {
    extend(MoveToNextSmartWord, superClass);

    function MoveToNextSmartWord() {
      return MoveToNextSmartWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextSmartWord.extend();

    MoveToNextSmartWord.description = "Move to next smart word (`/[\w-]+/`) word";

    MoveToNextSmartWord.prototype.wordRegex = /[\w-]+/g;

    return MoveToNextSmartWord;

  })(MoveToNextWord);

  MoveToPreviousSmartWord = (function(superClass) {
    extend(MoveToPreviousSmartWord, superClass);

    function MoveToPreviousSmartWord() {
      return MoveToPreviousSmartWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousSmartWord.extend();

    MoveToPreviousSmartWord.description = "Move to previous smart word (`/[\w-]+/`) word";

    MoveToPreviousSmartWord.prototype.wordRegex = /[\w-]+/;

    return MoveToPreviousSmartWord;

  })(MoveToPreviousWord);

  MoveToEndOfSmartWord = (function(superClass) {
    extend(MoveToEndOfSmartWord, superClass);

    function MoveToEndOfSmartWord() {
      return MoveToEndOfSmartWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfSmartWord.extend();

    MoveToEndOfSmartWord.description = "Move to end of smart word (`/[\w-]+/`) word";

    MoveToEndOfSmartWord.prototype.wordRegex = /[\w-]+/;

    return MoveToEndOfSmartWord;

  })(MoveToEndOfWord);

  MoveToNextSubword = (function(superClass) {
    extend(MoveToNextSubword, superClass);

    function MoveToNextSubword() {
      return MoveToNextSubword.__super__.constructor.apply(this, arguments);
    }

    MoveToNextSubword.extend();

    MoveToNextSubword.prototype.moveCursor = function(cursor) {
      this.wordRegex = cursor.subwordRegExp();
      return MoveToNextSubword.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToNextSubword;

  })(MoveToNextWord);

  MoveToPreviousSubword = (function(superClass) {
    extend(MoveToPreviousSubword, superClass);

    function MoveToPreviousSubword() {
      return MoveToPreviousSubword.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousSubword.extend();

    MoveToPreviousSubword.prototype.moveCursor = function(cursor) {
      this.wordRegex = cursor.subwordRegExp();
      return MoveToPreviousSubword.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToPreviousSubword;

  })(MoveToPreviousWord);

  MoveToEndOfSubword = (function(superClass) {
    extend(MoveToEndOfSubword, superClass);

    function MoveToEndOfSubword() {
      return MoveToEndOfSubword.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfSubword.extend();

    MoveToEndOfSubword.prototype.moveCursor = function(cursor) {
      this.wordRegex = cursor.subwordRegExp();
      return MoveToEndOfSubword.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToEndOfSubword;

  })(MoveToEndOfWord);

  MoveToNextSentence = (function(superClass) {
    extend(MoveToNextSentence, superClass);

    function MoveToNextSentence() {
      return MoveToNextSentence.__super__.constructor.apply(this, arguments);
    }

    MoveToNextSentence.extend();

    MoveToNextSentence.prototype.jump = true;

    MoveToNextSentence.prototype.sentenceRegex = /(?:[\.!\?][\)\]"']*\s+)|(\n|\r\n)/g;

    MoveToNextSentence.prototype.direction = 'next';

    MoveToNextSentence.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          return _this.setBufferPositionSafely(cursor, _this.getPoint(cursor.getBufferPosition()));
        };
      })(this));
    };

    MoveToNextSentence.prototype.getPoint = function(fromPoint) {
      if (this.direction === 'next') {
        return this.getNextStartOfSentence(fromPoint);
      } else if (this.direction === 'previous') {
        return this.getPreviousStartOfSentence(fromPoint);
      }
    };

    MoveToNextSentence.prototype.isBlankRow = function(row) {
      return this.editor.isBufferRowBlank(row);
    };

    MoveToNextSentence.prototype.getNextStartOfSentence = function(from) {
      var foundPoint;
      foundPoint = null;
      this.scanForward(this.sentenceRegex, {
        from: from
      }, (function(_this) {
        return function(arg) {
          var endRow, match, matchText, range, ref2, startRow, stop;
          range = arg.range, matchText = arg.matchText, match = arg.match, stop = arg.stop;
          if (match[1] != null) {
            ref2 = [range.start.row, range.end.row], startRow = ref2[0], endRow = ref2[1];
            if (_this.skipBlankRow && _this.isBlankRow(endRow)) {
              return;
            }
            if (_this.isBlankRow(startRow) !== _this.isBlankRow(endRow)) {
              foundPoint = _this.getFirstCharacterPositionForBufferRow(endRow);
            }
          } else {
            foundPoint = range.end;
          }
          if (foundPoint != null) {
            return stop();
          }
        };
      })(this));
      return foundPoint != null ? foundPoint : this.getVimEofBufferPosition();
    };

    MoveToNextSentence.prototype.getPreviousStartOfSentence = function(from) {
      var foundPoint;
      foundPoint = null;
      this.scanBackward(this.sentenceRegex, {
        from: from
      }, (function(_this) {
        return function(arg) {
          var endRow, match, matchText, point, range, ref2, startRow, stop;
          range = arg.range, match = arg.match, stop = arg.stop, matchText = arg.matchText;
          if (match[1] != null) {
            ref2 = [range.start.row, range.end.row], startRow = ref2[0], endRow = ref2[1];
            if (!_this.isBlankRow(endRow) && _this.isBlankRow(startRow)) {
              point = _this.getFirstCharacterPositionForBufferRow(endRow);
              if (point.isLessThan(from)) {
                foundPoint = point;
              } else {
                if (_this.skipBlankRow) {
                  return;
                }
                foundPoint = _this.getFirstCharacterPositionForBufferRow(startRow);
              }
            }
          } else {
            if (range.end.isLessThan(from)) {
              foundPoint = range.end;
            }
          }
          if (foundPoint != null) {
            return stop();
          }
        };
      })(this));
      return foundPoint != null ? foundPoint : [0, 0];
    };

    return MoveToNextSentence;

  })(Motion);

  MoveToPreviousSentence = (function(superClass) {
    extend(MoveToPreviousSentence, superClass);

    function MoveToPreviousSentence() {
      return MoveToPreviousSentence.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousSentence.extend();

    MoveToPreviousSentence.prototype.direction = 'previous';

    return MoveToPreviousSentence;

  })(MoveToNextSentence);

  MoveToNextSentenceSkipBlankRow = (function(superClass) {
    extend(MoveToNextSentenceSkipBlankRow, superClass);

    function MoveToNextSentenceSkipBlankRow() {
      return MoveToNextSentenceSkipBlankRow.__super__.constructor.apply(this, arguments);
    }

    MoveToNextSentenceSkipBlankRow.extend();

    MoveToNextSentenceSkipBlankRow.prototype.skipBlankRow = true;

    return MoveToNextSentenceSkipBlankRow;

  })(MoveToNextSentence);

  MoveToPreviousSentenceSkipBlankRow = (function(superClass) {
    extend(MoveToPreviousSentenceSkipBlankRow, superClass);

    function MoveToPreviousSentenceSkipBlankRow() {
      return MoveToPreviousSentenceSkipBlankRow.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousSentenceSkipBlankRow.extend();

    MoveToPreviousSentenceSkipBlankRow.prototype.skipBlankRow = true;

    return MoveToPreviousSentenceSkipBlankRow;

  })(MoveToPreviousSentence);

  MoveToNextParagraph = (function(superClass) {
    extend(MoveToNextParagraph, superClass);

    function MoveToNextParagraph() {
      return MoveToNextParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToNextParagraph.extend();

    MoveToNextParagraph.prototype.jump = true;

    MoveToNextParagraph.prototype.direction = 'next';

    MoveToNextParagraph.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          return _this.setBufferPositionSafely(cursor, _this.getPoint(cursor.getBufferPosition()));
        };
      })(this));
    };

    MoveToNextParagraph.prototype.getPoint = function(fromPoint) {
      var j, len, ref2, row, startRow, wasAtNonBlankRow;
      startRow = fromPoint.row;
      wasAtNonBlankRow = !this.editor.isBufferRowBlank(startRow);
      ref2 = getBufferRows(this.editor, {
        startRow: startRow,
        direction: this.direction
      });
      for (j = 0, len = ref2.length; j < len; j++) {
        row = ref2[j];
        if (this.editor.isBufferRowBlank(row)) {
          if (wasAtNonBlankRow) {
            return new Point(row, 0);
          }
        } else {
          wasAtNonBlankRow = true;
        }
      }
      switch (this.direction) {
        case 'previous':
          return new Point(0, 0);
        case 'next':
          return this.getVimEofBufferPosition();
      }
    };

    return MoveToNextParagraph;

  })(Motion);

  MoveToPreviousParagraph = (function(superClass) {
    extend(MoveToPreviousParagraph, superClass);

    function MoveToPreviousParagraph() {
      return MoveToPreviousParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousParagraph.extend();

    MoveToPreviousParagraph.prototype.direction = 'previous';

    return MoveToPreviousParagraph;

  })(MoveToNextParagraph);

  MoveToBeginningOfLine = (function(superClass) {
    extend(MoveToBeginningOfLine, superClass);

    function MoveToBeginningOfLine() {
      return MoveToBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToBeginningOfLine.extend();

    MoveToBeginningOfLine.prototype.moveCursor = function(cursor) {
      return setBufferColumn(cursor, 0);
    };

    return MoveToBeginningOfLine;

  })(Motion);

  MoveToColumn = (function(superClass) {
    extend(MoveToColumn, superClass);

    function MoveToColumn() {
      return MoveToColumn.__super__.constructor.apply(this, arguments);
    }

    MoveToColumn.extend();

    MoveToColumn.prototype.moveCursor = function(cursor) {
      return setBufferColumn(cursor, this.getCount(-1));
    };

    return MoveToColumn;

  })(Motion);

  MoveToLastCharacterOfLine = (function(superClass) {
    extend(MoveToLastCharacterOfLine, superClass);

    function MoveToLastCharacterOfLine() {
      return MoveToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLastCharacterOfLine.extend();

    MoveToLastCharacterOfLine.prototype.moveCursor = function(cursor) {
      var row;
      row = getValidVimBufferRow(this.editor, cursor.getBufferRow() + this.getCount(-1));
      cursor.setBufferPosition([row, 2e308]);
      return cursor.goalColumn = 2e308;
    };

    return MoveToLastCharacterOfLine;

  })(Motion);

  MoveToLastNonblankCharacterOfLineAndDown = (function(superClass) {
    extend(MoveToLastNonblankCharacterOfLineAndDown, superClass);

    function MoveToLastNonblankCharacterOfLineAndDown() {
      return MoveToLastNonblankCharacterOfLineAndDown.__super__.constructor.apply(this, arguments);
    }

    MoveToLastNonblankCharacterOfLineAndDown.extend();

    MoveToLastNonblankCharacterOfLineAndDown.prototype.inclusive = true;

    MoveToLastNonblankCharacterOfLineAndDown.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getBufferPosition());
      return cursor.setBufferPosition(point);
    };

    MoveToLastNonblankCharacterOfLineAndDown.prototype.getPoint = function(arg) {
      var range, ref2, row;
      row = arg.row;
      row = limitNumber(row + this.getCount(-1), {
        max: this.getVimLastBufferRow()
      });
      range = findRangeInBufferRow(this.editor, /\S|^/, row, {
        direction: 'backward'
      });
      return (ref2 = range != null ? range.start : void 0) != null ? ref2 : new Point(row, 0);
    };

    return MoveToLastNonblankCharacterOfLineAndDown;

  })(Motion);

  MoveToFirstCharacterOfLine = (function(superClass) {
    extend(MoveToFirstCharacterOfLine, superClass);

    function MoveToFirstCharacterOfLine() {
      return MoveToFirstCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLine.extend();

    MoveToFirstCharacterOfLine.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getFirstCharacterPositionForBufferRow(cursor.getBufferRow());
      return this.setBufferPositionSafely(cursor, point);
    };

    return MoveToFirstCharacterOfLine;

  })(Motion);

  MoveToFirstCharacterOfLineUp = (function(superClass) {
    extend(MoveToFirstCharacterOfLineUp, superClass);

    function MoveToFirstCharacterOfLineUp() {
      return MoveToFirstCharacterOfLineUp.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineUp.extend();

    MoveToFirstCharacterOfLineUp.prototype.wise = 'linewise';

    MoveToFirstCharacterOfLineUp.prototype.moveCursor = function(cursor) {
      this.moveCursorCountTimes(cursor, function() {
        var point;
        point = cursor.getBufferPosition();
        if (point.row !== 0) {
          return cursor.setBufferPosition(point.translate([-1, 0]));
        }
      });
      return MoveToFirstCharacterOfLineUp.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToFirstCharacterOfLineUp;

  })(MoveToFirstCharacterOfLine);

  MoveToFirstCharacterOfLineDown = (function(superClass) {
    extend(MoveToFirstCharacterOfLineDown, superClass);

    function MoveToFirstCharacterOfLineDown() {
      return MoveToFirstCharacterOfLineDown.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineDown.extend();

    MoveToFirstCharacterOfLineDown.prototype.wise = 'linewise';

    MoveToFirstCharacterOfLineDown.prototype.moveCursor = function(cursor) {
      this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          var point;
          point = cursor.getBufferPosition();
          if (_this.getVimLastBufferRow() !== point.row) {
            return cursor.setBufferPosition(point.translate([+1, 0]));
          }
        };
      })(this));
      return MoveToFirstCharacterOfLineDown.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToFirstCharacterOfLineDown;

  })(MoveToFirstCharacterOfLine);

  MoveToFirstCharacterOfLineAndDown = (function(superClass) {
    extend(MoveToFirstCharacterOfLineAndDown, superClass);

    function MoveToFirstCharacterOfLineAndDown() {
      return MoveToFirstCharacterOfLineAndDown.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineAndDown.extend();

    MoveToFirstCharacterOfLineAndDown.prototype.defaultCount = 0;

    MoveToFirstCharacterOfLineAndDown.prototype.getCount = function() {
      return MoveToFirstCharacterOfLineAndDown.__super__.getCount.apply(this, arguments) - 1;
    };

    return MoveToFirstCharacterOfLineAndDown;

  })(MoveToFirstCharacterOfLineDown);

  MoveToFirstLine = (function(superClass) {
    extend(MoveToFirstLine, superClass);

    function MoveToFirstLine() {
      return MoveToFirstLine.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstLine.extend();

    MoveToFirstLine.prototype.wise = 'linewise';

    MoveToFirstLine.prototype.jump = true;

    MoveToFirstLine.prototype.verticalMotion = true;

    MoveToFirstLine.prototype.moveSuccessOnLinewise = true;

    MoveToFirstLine.prototype.moveCursor = function(cursor) {
      this.setCursorBufferRow(cursor, getValidVimBufferRow(this.editor, this.getRow()));
      return cursor.autoscroll({
        center: true
      });
    };

    MoveToFirstLine.prototype.getRow = function() {
      return this.getCount(-1);
    };

    return MoveToFirstLine;

  })(Motion);

  MoveToLastLine = (function(superClass) {
    extend(MoveToLastLine, superClass);

    function MoveToLastLine() {
      return MoveToLastLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLastLine.extend();

    MoveToLastLine.prototype.defaultCount = 2e308;

    return MoveToLastLine;

  })(MoveToFirstLine);

  MoveToLineByPercent = (function(superClass) {
    extend(MoveToLineByPercent, superClass);

    function MoveToLineByPercent() {
      return MoveToLineByPercent.__super__.constructor.apply(this, arguments);
    }

    MoveToLineByPercent.extend();

    MoveToLineByPercent.prototype.getRow = function() {
      var percent;
      percent = limitNumber(this.getCount(), {
        max: 100
      });
      return Math.floor((this.editor.getLineCount() - 1) * (percent / 100));
    };

    return MoveToLineByPercent;

  })(MoveToFirstLine);

  MoveToRelativeLine = (function(superClass) {
    extend(MoveToRelativeLine, superClass);

    function MoveToRelativeLine() {
      return MoveToRelativeLine.__super__.constructor.apply(this, arguments);
    }

    MoveToRelativeLine.extend(false);

    MoveToRelativeLine.prototype.wise = 'linewise';

    MoveToRelativeLine.prototype.moveSuccessOnLinewise = true;

    MoveToRelativeLine.prototype.moveCursor = function(cursor) {
      return setBufferRow(cursor, cursor.getBufferRow() + this.getCount(-1));
    };

    return MoveToRelativeLine;

  })(Motion);

  MoveToRelativeLineMinimumOne = (function(superClass) {
    extend(MoveToRelativeLineMinimumOne, superClass);

    function MoveToRelativeLineMinimumOne() {
      return MoveToRelativeLineMinimumOne.__super__.constructor.apply(this, arguments);
    }

    MoveToRelativeLineMinimumOne.extend(false);

    MoveToRelativeLineMinimumOne.prototype.getCount = function() {
      return limitNumber(MoveToRelativeLineMinimumOne.__super__.getCount.apply(this, arguments), {
        min: 1
      });
    };

    return MoveToRelativeLineMinimumOne;

  })(MoveToRelativeLine);

  MoveToTopOfScreen = (function(superClass) {
    extend(MoveToTopOfScreen, superClass);

    function MoveToTopOfScreen() {
      return MoveToTopOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToTopOfScreen.extend();

    MoveToTopOfScreen.prototype.wise = 'linewise';

    MoveToTopOfScreen.prototype.jump = true;

    MoveToTopOfScreen.prototype.scrolloff = 2;

    MoveToTopOfScreen.prototype.defaultCount = 0;

    MoveToTopOfScreen.prototype.verticalMotion = true;

    MoveToTopOfScreen.prototype.moveCursor = function(cursor) {
      var bufferRow;
      bufferRow = this.editor.bufferRowForScreenRow(this.getScreenRow());
      return this.setCursorBufferRow(cursor, bufferRow);
    };

    MoveToTopOfScreen.prototype.getScrolloff = function() {
      if (this.isAsTargetExceptSelect()) {
        return 0;
      } else {
        return this.scrolloff;
      }
    };

    MoveToTopOfScreen.prototype.getScreenRow = function() {
      var firstRow, offset;
      firstRow = getFirstVisibleScreenRow(this.editor);
      offset = this.getScrolloff();
      if (firstRow === 0) {
        offset = 0;
      }
      offset = limitNumber(this.getCount(-1), {
        min: offset
      });
      return firstRow + offset;
    };

    return MoveToTopOfScreen;

  })(Motion);

  MoveToMiddleOfScreen = (function(superClass) {
    extend(MoveToMiddleOfScreen, superClass);

    function MoveToMiddleOfScreen() {
      return MoveToMiddleOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToMiddleOfScreen.extend();

    MoveToMiddleOfScreen.prototype.getScreenRow = function() {
      var endRow, startRow;
      startRow = getFirstVisibleScreenRow(this.editor);
      endRow = limitNumber(this.editor.getLastVisibleScreenRow(), {
        max: this.getVimLastScreenRow()
      });
      return startRow + Math.floor((endRow - startRow) / 2);
    };

    return MoveToMiddleOfScreen;

  })(MoveToTopOfScreen);

  MoveToBottomOfScreen = (function(superClass) {
    extend(MoveToBottomOfScreen, superClass);

    function MoveToBottomOfScreen() {
      return MoveToBottomOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToBottomOfScreen.extend();

    MoveToBottomOfScreen.prototype.getScreenRow = function() {
      var offset, row, vimLastScreenRow;
      vimLastScreenRow = this.getVimLastScreenRow();
      row = limitNumber(this.editor.getLastVisibleScreenRow(), {
        max: vimLastScreenRow
      });
      offset = this.getScrolloff() + 1;
      if (row === vimLastScreenRow) {
        offset = 0;
      }
      offset = limitNumber(this.getCount(-1), {
        min: offset
      });
      return row - offset;
    };

    return MoveToBottomOfScreen;

  })(MoveToTopOfScreen);

  Scroll = (function(superClass) {
    extend(Scroll, superClass);

    function Scroll() {
      return Scroll.__super__.constructor.apply(this, arguments);
    }

    Scroll.extend(false);

    Scroll.prototype.verticalMotion = true;

    Scroll.prototype.isSmoothScrollEnabled = function() {
      if (Math.abs(this.amountOfPage) === 1) {
        return this.getConfig('smoothScrollOnFullScrollMotion');
      } else {
        return this.getConfig('smoothScrollOnHalfScrollMotion');
      }
    };

    Scroll.prototype.getSmoothScrollDuation = function() {
      if (Math.abs(this.amountOfPage) === 1) {
        return this.getConfig('smoothScrollOnFullScrollMotionDuration');
      } else {
        return this.getConfig('smoothScrollOnHalfScrollMotionDuration');
      }
    };

    Scroll.prototype.getPixelRectTopForSceenRow = function(row) {
      var point;
      point = new Point(row, 0);
      return this.editor.element.pixelRectForScreenRange(new Range(point, point)).top;
    };

    Scroll.prototype.smoothScroll = function(fromRow, toRow, done) {
      var duration, step, topPixelFrom, topPixelTo;
      topPixelFrom = {
        top: this.getPixelRectTopForSceenRow(fromRow)
      };
      topPixelTo = {
        top: this.getPixelRectTopForSceenRow(toRow)
      };
      step = (function(_this) {
        return function(newTop) {
          var ref2;
          return (ref2 = _this.editor.element.component) != null ? ref2.setScrollTop(newTop) : void 0;
        };
      })(this);
      duration = this.getSmoothScrollDuation();
      return this.vimState.requestScrollAnimation(topPixelFrom, topPixelTo, {
        duration: duration,
        step: step,
        done: done
      });
    };

    Scroll.prototype.getAmountOfRows = function() {
      return Math.ceil(this.amountOfPage * this.editor.getRowsPerPage() * this.getCount());
    };

    Scroll.prototype.getBufferRow = function(cursor) {
      var screenRow;
      screenRow = getValidVimScreenRow(this.editor, cursor.getScreenRow() + this.getAmountOfRows());
      return this.editor.bufferRowForScreenRow(screenRow);
    };

    Scroll.prototype.moveCursor = function(cursor) {
      var bufferRow, done, firstVisibileScreenRow, newFirstVisibileBufferRow, newFirstVisibileScreenRow;
      bufferRow = this.getBufferRow(cursor);
      this.setCursorBufferRow(cursor, this.getBufferRow(cursor), {
        autoscroll: false
      });
      if (cursor.isLastCursor()) {
        if (this.isSmoothScrollEnabled()) {
          this.vimState.finishScrollAnimation();
        }
        firstVisibileScreenRow = this.editor.getFirstVisibleScreenRow();
        newFirstVisibileBufferRow = this.editor.bufferRowForScreenRow(firstVisibileScreenRow + this.getAmountOfRows());
        newFirstVisibileScreenRow = this.editor.screenRowForBufferRow(newFirstVisibileBufferRow);
        done = (function(_this) {
          return function() {
            var ref2;
            _this.editor.setFirstVisibleScreenRow(newFirstVisibileScreenRow);
            return (ref2 = _this.editor.element.component) != null ? ref2.updateSync() : void 0;
          };
        })(this);
        if (this.isSmoothScrollEnabled()) {
          return this.smoothScroll(firstVisibileScreenRow, newFirstVisibileScreenRow, done);
        } else {
          return done();
        }
      }
    };

    return Scroll;

  })(Motion);

  ScrollFullScreenDown = (function(superClass) {
    extend(ScrollFullScreenDown, superClass);

    function ScrollFullScreenDown() {
      return ScrollFullScreenDown.__super__.constructor.apply(this, arguments);
    }

    ScrollFullScreenDown.extend(true);

    ScrollFullScreenDown.prototype.amountOfPage = +1;

    return ScrollFullScreenDown;

  })(Scroll);

  ScrollFullScreenUp = (function(superClass) {
    extend(ScrollFullScreenUp, superClass);

    function ScrollFullScreenUp() {
      return ScrollFullScreenUp.__super__.constructor.apply(this, arguments);
    }

    ScrollFullScreenUp.extend();

    ScrollFullScreenUp.prototype.amountOfPage = -1;

    return ScrollFullScreenUp;

  })(Scroll);

  ScrollHalfScreenDown = (function(superClass) {
    extend(ScrollHalfScreenDown, superClass);

    function ScrollHalfScreenDown() {
      return ScrollHalfScreenDown.__super__.constructor.apply(this, arguments);
    }

    ScrollHalfScreenDown.extend();

    ScrollHalfScreenDown.prototype.amountOfPage = +1 / 2;

    return ScrollHalfScreenDown;

  })(Scroll);

  ScrollHalfScreenUp = (function(superClass) {
    extend(ScrollHalfScreenUp, superClass);

    function ScrollHalfScreenUp() {
      return ScrollHalfScreenUp.__super__.constructor.apply(this, arguments);
    }

    ScrollHalfScreenUp.extend();

    ScrollHalfScreenUp.prototype.amountOfPage = -1 / 2;

    return ScrollHalfScreenUp;

  })(Scroll);

  Find = (function(superClass) {
    extend(Find, superClass);

    function Find() {
      return Find.__super__.constructor.apply(this, arguments);
    }

    Find.extend();

    Find.prototype.backwards = false;

    Find.prototype.inclusive = true;

    Find.prototype.offset = 0;

    Find.prototype.requireInput = true;

    Find.prototype.initialize = function() {
      Find.__super__.initialize.apply(this, arguments);
      if (!this.isComplete()) {
        return this.focusInput();
      }
    };

    Find.prototype.isBackwards = function() {
      return this.backwards;
    };

    Find.prototype.getPoint = function(fromPoint) {
      var end, method, offset, points, ref2, ref3, scanRange, start, unOffset;
      ref2 = this.editor.bufferRangeForBufferRow(fromPoint.row), start = ref2.start, end = ref2.end;
      offset = this.isBackwards() ? this.offset : -this.offset;
      unOffset = -offset * this.repeated;
      if (this.isBackwards()) {
        scanRange = [start, fromPoint.translate([0, unOffset])];
        method = 'backwardsScanInBufferRange';
      } else {
        scanRange = [fromPoint.translate([0, 1 + unOffset]), end];
        method = 'scanInBufferRange';
      }
      points = [];
      this.editor[method](RegExp("" + (_.escapeRegExp(this.input)), "g"), scanRange, function(arg) {
        var range;
        range = arg.range;
        return points.push(range.start);
      });
      return (ref3 = points[this.getCount(-1)]) != null ? ref3.translate([0, offset]) : void 0;
    };

    Find.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getBufferPosition());
      this.setBufferPositionSafely(cursor, point);
      if (!this.repeated) {
        return this.globalState.set('currentFind', this);
      }
    };

    return Find;

  })(Motion);

  FindBackwards = (function(superClass) {
    extend(FindBackwards, superClass);

    function FindBackwards() {
      return FindBackwards.__super__.constructor.apply(this, arguments);
    }

    FindBackwards.extend();

    FindBackwards.prototype.inclusive = false;

    FindBackwards.prototype.backwards = true;

    return FindBackwards;

  })(Find);

  Till = (function(superClass) {
    extend(Till, superClass);

    function Till() {
      return Till.__super__.constructor.apply(this, arguments);
    }

    Till.extend();

    Till.prototype.offset = 1;

    Till.prototype.getPoint = function() {
      this.point = Till.__super__.getPoint.apply(this, arguments);
      this.moveSucceeded = this.point != null;
      return this.point;
    };

    return Till;

  })(Find);

  TillBackwards = (function(superClass) {
    extend(TillBackwards, superClass);

    function TillBackwards() {
      return TillBackwards.__super__.constructor.apply(this, arguments);
    }

    TillBackwards.extend();

    TillBackwards.prototype.inclusive = false;

    TillBackwards.prototype.backwards = true;

    return TillBackwards;

  })(Till);

  MoveToMark = (function(superClass) {
    extend(MoveToMark, superClass);

    function MoveToMark() {
      return MoveToMark.__super__.constructor.apply(this, arguments);
    }

    MoveToMark.extend();

    MoveToMark.prototype.jump = true;

    MoveToMark.prototype.requireInput = true;

    MoveToMark.prototype.input = null;

    MoveToMark.prototype.initialize = function() {
      MoveToMark.__super__.initialize.apply(this, arguments);
      if (!this.isComplete()) {
        return this.focusInput();
      }
    };

    MoveToMark.prototype.getPoint = function() {
      return this.vimState.mark.get(this.input);
    };

    MoveToMark.prototype.moveCursor = function(cursor) {
      var point;
      if (point = this.getPoint()) {
        cursor.setBufferPosition(point);
        return cursor.autoscroll({
          center: true
        });
      }
    };

    return MoveToMark;

  })(Motion);

  MoveToMarkLine = (function(superClass) {
    extend(MoveToMarkLine, superClass);

    function MoveToMarkLine() {
      return MoveToMarkLine.__super__.constructor.apply(this, arguments);
    }

    MoveToMarkLine.extend();

    MoveToMarkLine.prototype.wise = 'linewise';

    MoveToMarkLine.prototype.getPoint = function() {
      var point;
      if (point = MoveToMarkLine.__super__.getPoint.apply(this, arguments)) {
        return this.getFirstCharacterPositionForBufferRow(point.row);
      }
    };

    return MoveToMarkLine;

  })(MoveToMark);

  MoveToPreviousFoldStart = (function(superClass) {
    extend(MoveToPreviousFoldStart, superClass);

    function MoveToPreviousFoldStart() {
      return MoveToPreviousFoldStart.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldStart.extend();

    MoveToPreviousFoldStart.description = "Move to previous fold start";

    MoveToPreviousFoldStart.prototype.wise = 'characterwise';

    MoveToPreviousFoldStart.prototype.which = 'start';

    MoveToPreviousFoldStart.prototype.direction = 'prev';

    MoveToPreviousFoldStart.prototype.initialize = function() {
      MoveToPreviousFoldStart.__super__.initialize.apply(this, arguments);
      this.rows = this.getFoldRows(this.which);
      if (this.direction === 'prev') {
        return this.rows.reverse();
      }
    };

    MoveToPreviousFoldStart.prototype.getFoldRows = function(which) {
      var index, rows;
      index = which === 'start' ? 0 : 1;
      rows = getCodeFoldRowRanges(this.editor).map(function(rowRange) {
        return rowRange[index];
      });
      return _.sortBy(_.uniq(rows), function(row) {
        return row;
      });
    };

    MoveToPreviousFoldStart.prototype.getScanRows = function(cursor) {
      var cursorRow, isValidRow;
      cursorRow = cursor.getBufferRow();
      isValidRow = (function() {
        switch (this.direction) {
          case 'prev':
            return function(row) {
              return row < cursorRow;
            };
          case 'next':
            return function(row) {
              return row > cursorRow;
            };
        }
      }).call(this);
      return this.rows.filter(isValidRow);
    };

    MoveToPreviousFoldStart.prototype.detectRow = function(cursor) {
      return this.getScanRows(cursor)[0];
    };

    MoveToPreviousFoldStart.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          var row;
          if ((row = _this.detectRow(cursor)) != null) {
            return moveCursorToFirstCharacterAtRow(cursor, row);
          }
        };
      })(this));
    };

    return MoveToPreviousFoldStart;

  })(Motion);

  MoveToNextFoldStart = (function(superClass) {
    extend(MoveToNextFoldStart, superClass);

    function MoveToNextFoldStart() {
      return MoveToNextFoldStart.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldStart.extend();

    MoveToNextFoldStart.description = "Move to next fold start";

    MoveToNextFoldStart.prototype.direction = 'next';

    return MoveToNextFoldStart;

  })(MoveToPreviousFoldStart);

  MoveToPreviousFoldStartWithSameIndent = (function(superClass) {
    extend(MoveToPreviousFoldStartWithSameIndent, superClass);

    function MoveToPreviousFoldStartWithSameIndent() {
      return MoveToPreviousFoldStartWithSameIndent.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldStartWithSameIndent.extend();

    MoveToPreviousFoldStartWithSameIndent.description = "Move to previous same-indented fold start";

    MoveToPreviousFoldStartWithSameIndent.prototype.detectRow = function(cursor) {
      var baseIndentLevel, j, len, ref2, row;
      baseIndentLevel = this.getIndentLevelForBufferRow(cursor.getBufferRow());
      ref2 = this.getScanRows(cursor);
      for (j = 0, len = ref2.length; j < len; j++) {
        row = ref2[j];
        if (this.getIndentLevelForBufferRow(row) === baseIndentLevel) {
          return row;
        }
      }
      return null;
    };

    return MoveToPreviousFoldStartWithSameIndent;

  })(MoveToPreviousFoldStart);

  MoveToNextFoldStartWithSameIndent = (function(superClass) {
    extend(MoveToNextFoldStartWithSameIndent, superClass);

    function MoveToNextFoldStartWithSameIndent() {
      return MoveToNextFoldStartWithSameIndent.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldStartWithSameIndent.extend();

    MoveToNextFoldStartWithSameIndent.description = "Move to next same-indented fold start";

    MoveToNextFoldStartWithSameIndent.prototype.direction = 'next';

    return MoveToNextFoldStartWithSameIndent;

  })(MoveToPreviousFoldStartWithSameIndent);

  MoveToPreviousFoldEnd = (function(superClass) {
    extend(MoveToPreviousFoldEnd, superClass);

    function MoveToPreviousFoldEnd() {
      return MoveToPreviousFoldEnd.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldEnd.extend();

    MoveToPreviousFoldEnd.description = "Move to previous fold end";

    MoveToPreviousFoldEnd.prototype.which = 'end';

    return MoveToPreviousFoldEnd;

  })(MoveToPreviousFoldStart);

  MoveToNextFoldEnd = (function(superClass) {
    extend(MoveToNextFoldEnd, superClass);

    function MoveToNextFoldEnd() {
      return MoveToNextFoldEnd.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldEnd.extend();

    MoveToNextFoldEnd.description = "Move to next fold end";

    MoveToNextFoldEnd.prototype.direction = 'next';

    return MoveToNextFoldEnd;

  })(MoveToPreviousFoldEnd);

  MoveToPreviousFunction = (function(superClass) {
    extend(MoveToPreviousFunction, superClass);

    function MoveToPreviousFunction() {
      return MoveToPreviousFunction.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFunction.extend();

    MoveToPreviousFunction.description = "Move to previous function";

    MoveToPreviousFunction.prototype.direction = 'prev';

    MoveToPreviousFunction.prototype.detectRow = function(cursor) {
      return _.detect(this.getScanRows(cursor), (function(_this) {
        return function(row) {
          return isIncludeFunctionScopeForRow(_this.editor, row);
        };
      })(this));
    };

    return MoveToPreviousFunction;

  })(MoveToPreviousFoldStart);

  MoveToNextFunction = (function(superClass) {
    extend(MoveToNextFunction, superClass);

    function MoveToNextFunction() {
      return MoveToNextFunction.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFunction.extend();

    MoveToNextFunction.description = "Move to next function";

    MoveToNextFunction.prototype.direction = 'next';

    return MoveToNextFunction;

  })(MoveToPreviousFunction);

  MoveToPositionByScope = (function(superClass) {
    extend(MoveToPositionByScope, superClass);

    function MoveToPositionByScope() {
      return MoveToPositionByScope.__super__.constructor.apply(this, arguments);
    }

    MoveToPositionByScope.extend(false);

    MoveToPositionByScope.prototype.direction = 'backward';

    MoveToPositionByScope.prototype.scope = '.';

    MoveToPositionByScope.prototype.getPoint = function(fromPoint) {
      return detectScopeStartPositionForScope(this.editor, fromPoint, this.direction, this.scope);
    };

    MoveToPositionByScope.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          return _this.setBufferPositionSafely(cursor, _this.getPoint(cursor.getBufferPosition()));
        };
      })(this));
    };

    return MoveToPositionByScope;

  })(Motion);

  MoveToPreviousString = (function(superClass) {
    extend(MoveToPreviousString, superClass);

    function MoveToPreviousString() {
      return MoveToPreviousString.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousString.extend();

    MoveToPreviousString.description = "Move to previous string(searched by `string.begin` scope)";

    MoveToPreviousString.prototype.direction = 'backward';

    MoveToPreviousString.prototype.scope = 'string.begin';

    return MoveToPreviousString;

  })(MoveToPositionByScope);

  MoveToNextString = (function(superClass) {
    extend(MoveToNextString, superClass);

    function MoveToNextString() {
      return MoveToNextString.__super__.constructor.apply(this, arguments);
    }

    MoveToNextString.extend();

    MoveToNextString.description = "Move to next string(searched by `string.begin` scope)";

    MoveToNextString.prototype.direction = 'forward';

    return MoveToNextString;

  })(MoveToPreviousString);

  MoveToPreviousNumber = (function(superClass) {
    extend(MoveToPreviousNumber, superClass);

    function MoveToPreviousNumber() {
      return MoveToPreviousNumber.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousNumber.extend();

    MoveToPreviousNumber.prototype.direction = 'backward';

    MoveToPreviousNumber.description = "Move to previous number(searched by `constant.numeric` scope)";

    MoveToPreviousNumber.prototype.scope = 'constant.numeric';

    return MoveToPreviousNumber;

  })(MoveToPositionByScope);

  MoveToNextNumber = (function(superClass) {
    extend(MoveToNextNumber, superClass);

    function MoveToNextNumber() {
      return MoveToNextNumber.__super__.constructor.apply(this, arguments);
    }

    MoveToNextNumber.extend();

    MoveToNextNumber.description = "Move to next number(searched by `constant.numeric` scope)";

    MoveToNextNumber.prototype.direction = 'forward';

    return MoveToNextNumber;

  })(MoveToPreviousNumber);

  MoveToNextOccurrence = (function(superClass) {
    extend(MoveToNextOccurrence, superClass);

    function MoveToNextOccurrence() {
      return MoveToNextOccurrence.__super__.constructor.apply(this, arguments);
    }

    MoveToNextOccurrence.extend();

    MoveToNextOccurrence.commandScope = 'atom-text-editor.vim-mode-plus.has-occurrence';

    MoveToNextOccurrence.prototype.jump = true;

    MoveToNextOccurrence.prototype.direction = 'next';

    MoveToNextOccurrence.prototype.getRanges = function() {
      return this.vimState.occurrenceManager.getMarkers().map(function(marker) {
        return marker.getBufferRange();
      });
    };

    MoveToNextOccurrence.prototype.execute = function() {
      this.ranges = this.getRanges();
      return MoveToNextOccurrence.__super__.execute.apply(this, arguments);
    };

    MoveToNextOccurrence.prototype.moveCursor = function(cursor) {
      var index, offset, point, range;
      index = this.getIndex(cursor.getBufferPosition());
      if (index != null) {
        offset = (function() {
          switch (this.direction) {
            case 'next':
              return this.getCount(-1);
            case 'previous':
              return -this.getCount(-1);
          }
        }).call(this);
        range = this.ranges[getIndex(index + offset, this.ranges)];
        point = range.start;
        cursor.setBufferPosition(point, {
          autoscroll: false
        });
        if (cursor.isLastCursor()) {
          this.editor.unfoldBufferRow(point.row);
          smartScrollToBufferPosition(this.editor, point);
        }
        if (this.getConfig('flashOnMoveToOccurrence')) {
          return this.vimState.flash(range, {
            type: 'search'
          });
        }
      }
    };

    MoveToNextOccurrence.prototype.getIndex = function(fromPoint) {
      var i, j, len, range, ref2;
      ref2 = this.ranges;
      for (i = j = 0, len = ref2.length; j < len; i = ++j) {
        range = ref2[i];
        if (range.start.isGreaterThan(fromPoint)) {
          return i;
        }
      }
      return 0;
    };

    return MoveToNextOccurrence;

  })(Motion);

  MoveToPreviousOccurrence = (function(superClass) {
    extend(MoveToPreviousOccurrence, superClass);

    function MoveToPreviousOccurrence() {
      return MoveToPreviousOccurrence.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousOccurrence.extend();

    MoveToPreviousOccurrence.prototype.direction = 'previous';

    MoveToPreviousOccurrence.prototype.getIndex = function(fromPoint) {
      var i, j, range, ref2;
      ref2 = this.ranges;
      for (i = j = ref2.length - 1; j >= 0; i = j += -1) {
        range = ref2[i];
        if (range.end.isLessThan(fromPoint)) {
          return i;
        }
      }
      return this.ranges.length - 1;
    };

    return MoveToPreviousOccurrence;

  })(MoveToNextOccurrence);

  MoveToPair = (function(superClass) {
    extend(MoveToPair, superClass);

    function MoveToPair() {
      return MoveToPair.__super__.constructor.apply(this, arguments);
    }

    MoveToPair.extend();

    MoveToPair.prototype.inclusive = true;

    MoveToPair.prototype.jump = true;

    MoveToPair.prototype.member = ['Parenthesis', 'CurlyBracket', 'SquareBracket', 'AngleBracket'];

    MoveToPair.prototype.moveCursor = function(cursor) {
      return this.setBufferPositionSafely(cursor, this.getPoint(cursor));
    };

    MoveToPair.prototype.getPointForTag = function(point) {
      var closeRange, openRange, pairInfo;
      pairInfo = this["new"]("ATag").getPairInfo(point);
      if (pairInfo == null) {
        return null;
      }
      openRange = pairInfo.openRange, closeRange = pairInfo.closeRange;
      openRange = openRange.translate([0, +1], [0, -1]);
      closeRange = closeRange.translate([0, +1], [0, -1]);
      if (openRange.containsPoint(point) && (!point.isEqual(openRange.end))) {
        return closeRange.start;
      }
      if (closeRange.containsPoint(point) && (!point.isEqual(closeRange.end))) {
        return openRange.start;
      }
    };

    MoveToPair.prototype.getPoint = function(cursor) {
      var cursorPosition, cursorRow, end, point, range, start;
      cursorPosition = cursor.getBufferPosition();
      cursorRow = cursorPosition.row;
      if (point = this.getPointForTag(cursorPosition)) {
        return point;
      }
      range = this["new"]("AAnyPairAllowForwarding", {
        member: this.member
      }).getRange(cursor.selection);
      if (range == null) {
        return null;
      }
      start = range.start, end = range.end;
      if ((start.row === cursorRow) && start.isGreaterThanOrEqual(cursorPosition)) {
        return end.translate([0, -1]);
      } else if (end.row === cursorPosition.row) {
        return start;
      }
    };

    return MoveToPair;

  })(Motion);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJ3RUFBQTtJQUFBOzs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsaUJBQUQsRUFBUTs7RUFFUixPQXlCSSxPQUFBLENBQVEsU0FBUixDQXpCSixFQUNFLG9DQURGLEVBQ2tCLHNDQURsQixFQUVFLDRDQUZGLEVBRXNCLGdEQUZ0QixFQUdFLGtEQUhGLEVBSUUsd0RBSkYsRUFJNEIsc0RBSjVCLEVBS0UsZ0RBTEYsRUFLd0IsZ0RBTHhCLEVBTUUsc0VBTkYsRUFPRSw0QkFQRixFQVFFLDhDQVJGLEVBU0Usa0VBVEYsRUFVRSw0QkFWRixFQVdFLGdEQVhGLEVBWUUsZ0ZBWkYsRUFhRSxnRUFiRixFQWNFLHdFQWRGLEVBZUUsa0NBZkYsRUFnQkUsZ0RBaEJGLEVBaUJFLGdDQWpCRixFQWtCRSxzQ0FsQkYsRUFtQkUsOEJBbkJGLEVBb0JFLHdCQXBCRixFQXFCRSw4REFyQkYsRUFzQkUsc0VBdEJGLEVBdUJFLHdEQXZCRixFQXdCRTs7RUFHRixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBRUQ7OztJQUNKLE1BQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7SUFDQSxNQUFDLENBQUEsYUFBRCxHQUFnQjs7cUJBQ2hCLFNBQUEsR0FBVzs7cUJBQ1gsSUFBQSxHQUFNOztxQkFDTixJQUFBLEdBQU07O3FCQUNOLGNBQUEsR0FBZ0I7O3FCQUNoQixhQUFBLEdBQWU7O3FCQUNmLHFCQUFBLEdBQXVCOztJQUVWLGdCQUFBO01BQ1gseUNBQUEsU0FBQTtNQUVBLElBQUcsSUFBQyxDQUFBLElBQUQsS0FBUyxRQUFaO1FBQ0UsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFD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QUZGO09BQUEsTUFHSyxJQUFHLEdBQUcsQ0FBQyxHQUFKLEtBQVcsY0FBYyxDQUFDLEdBQTdCO2VBR0gsTUFIRzs7SUFaRzs7OztLQWxCYTtBQS9rQ3pCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntQb2ludCwgUmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcblxue1xuICBtb3ZlQ3Vyc29yTGVmdCwgbW92ZUN1cnNvclJpZ2h0XG4gIG1vdmVDdXJzb3JVcFNjcmVlbiwgbW92ZUN1cnNvckRvd25TY3JlZW5cbiAgcG9pbnRJc0F0VmltRW5kT2ZGaWxlXG4gIGdldEZpcnN0VmlzaWJsZVNjcmVlblJvdywgZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3dcbiAgZ2V0VmFsaWRWaW1TY3JlZW5Sb3csIGdldFZhbGlkVmltQnVmZmVyUm93XG4gIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3dcbiAgc29ydFJhbmdlc1xuICBwb2ludElzT25XaGl0ZVNwYWNlXG4gIG1vdmVDdXJzb3JUb05leHROb25XaGl0ZXNwYWNlXG4gIGlzRW1wdHlSb3dcbiAgZ2V0Q29kZUZvbGRSb3dSYW5nZXNcbiAgZ2V0TGFyZ2VzdEZvbGRSYW5nZUNvbnRhaW5zQnVmZmVyUm93XG4gIGlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3dcbiAgZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGVcbiAgZ2V0QnVmZmVyUm93c1xuICBnZXRUZXh0SW5TY3JlZW5SYW5nZVxuICBzZXRCdWZmZXJSb3dcbiAgc2V0QnVmZmVyQ29sdW1uXG4gIGxpbWl0TnVtYmVyXG4gIGdldEluZGV4XG4gIHNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvblxuICBwb2ludElzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93XG4gIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvd1xuICBmaW5kUmFuZ2VJbkJ1ZmZlclJvd1xufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5cbmNsYXNzIE1vdGlvbiBleHRlbmRzIEJhc2VcbiAgQGV4dGVuZChmYWxzZSlcbiAgQG9wZXJhdGlvbktpbmQ6ICdtb3Rpb24nXG4gIGluY2x1c2l2ZTogZmFsc2VcbiAgd2lzZTogJ2NoYXJhY3Rlcndpc2UnXG4gIGp1bXA6IGZhbHNlXG4gIHZlcnRpY2FsTW90aW9uOiBmYWxzZVxuICBtb3ZlU3VjY2VlZGVkOiBudWxsXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZTogZmFsc2VcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuXG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEB3aXNlID0gQHN1Ym1vZGVcbiAgICBAaW5pdGlhbGl6ZSgpXG5cbiAgaXNMaW5ld2lzZTogLT4gQHdpc2UgaXMgJ2xpbmV3aXNlJ1xuICBpc0Jsb2Nrd2lzZTogLT4gQHdpc2UgaXMgJ2Jsb2Nrd2lzZSdcblxuICBmb3JjZVdpc2U6ICh3aXNlKSAtPlxuICAgIGlmIHdpc2UgaXMgJ2NoYXJhY3Rlcndpc2UnXG4gICAgICBpZiBAd2lzZSBpcyAnbGluZXdpc2UnXG4gICAgICAgIEBpbmNsdXNpdmUgPSBmYWxzZVxuICAgICAgZWxzZVxuICAgICAgICBAaW5jbHVzaXZlID0gbm90IEBpbmNsdXNpdmVcbiAgICBAd2lzZSA9IHdpc2VcblxuICBzZXRCdWZmZXJQb3NpdGlvblNhZmVseTogKGN1cnNvciwgcG9pbnQpIC0+XG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KSBpZiBwb2ludD9cblxuICBzZXRTY3JlZW5Qb3NpdGlvblNhZmVseTogKGN1cnNvciwgcG9pbnQpIC0+XG4gICAgY3Vyc29yLnNldFNjcmVlblBvc2l0aW9uKHBvaW50KSBpZiBwb2ludD9cblxuICBtb3ZlV2l0aFNhdmVKdW1wOiAoY3Vyc29yKSAtPlxuICAgIGlmIGN1cnNvci5pc0xhc3RDdXJzb3IoKSBhbmQgQGp1bXBcbiAgICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgIEBtb3ZlQ3Vyc29yKGN1cnNvcilcblxuICAgIGlmIGN1cnNvclBvc2l0aW9uPyBhbmQgbm90IGN1cnNvclBvc2l0aW9uLmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBAdmltU3RhdGUubWFyay5zZXQoJ2AnLCBjdXJzb3JQb3NpdGlvbilcbiAgICAgIEB2aW1TdGF0ZS5tYXJrLnNldChcIidcIiwgY3Vyc29yUG9zaXRpb24pXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAb3BlcmF0b3I/XG4gICAgICBAc2VsZWN0KClcbiAgICBlbHNlXG4gICAgICBAbW92ZVdpdGhTYXZlSnVtcChjdXJzb3IpIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICBAZWRpdG9yLm1lcmdlQ3Vyc29ycygpXG4gICAgQGVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuXG4gICMgTk9URTogTW9kaWZ5IHNlbGVjdGlvbiBieSBtb2R0aW9uLCBzZWxlY3Rpb24gaXMgYWxyZWFkeSBcIm5vcm1hbGl6ZWRcIiBiZWZvcmUgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQuXG4gIHNlbGVjdDogLT5cbiAgICBpc09yV2FzVmlzdWFsID0gQG1vZGUgaXMgJ3Zpc3VhbCcgb3IgQGlzKCdDdXJyZW50U2VsZWN0aW9uJykgIyBuZWVkIHRvIGNhcmUgd2FzIHZpc3VhbCBmb3IgYC5gIHJlcGVhdGVkLlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHNlbGVjdGlvbi5tb2RpZnlTZWxlY3Rpb24gPT5cbiAgICAgICAgQG1vdmVXaXRoU2F2ZUp1bXAoc2VsZWN0aW9uLmN1cnNvcilcblxuICAgICAgc3VjY2VlZGVkID0gQG1vdmVTdWNjZWVkZWQgPyBub3Qgc2VsZWN0aW9uLmlzRW1wdHkoKSBvciAoQG1vdmVTdWNjZXNzT25MaW5ld2lzZSBhbmQgQGlzTGluZXdpc2UoKSlcbiAgICAgIGlmIGlzT3JXYXNWaXN1YWwgb3IgKHN1Y2NlZWRlZCBhbmQgKEBpbmNsdXNpdmUgb3IgQGlzTGluZXdpc2UoKSkpXG4gICAgICAgICRzZWxlY3Rpb24gPSBAc3dyYXAoc2VsZWN0aW9uKVxuICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKHRydWUpICMgc2F2ZSBwcm9wZXJ0eSBvZiBcImFscmVhZHktbm9ybWFsaXplZC1zZWxlY3Rpb25cIlxuICAgICAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZShAd2lzZSlcblxuICAgIEB2aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCkuYXV0b3Njcm9sbCgpIGlmIEB3aXNlIGlzICdibG9ja3dpc2UnXG5cbiAgc2V0Q3Vyc29yQnVmZmVyUm93OiAoY3Vyc29yLCByb3csIG9wdGlvbnMpIC0+XG4gICAgaWYgQHZlcnRpY2FsTW90aW9uIGFuZCBAZ2V0Q29uZmlnKCdtb3ZlVG9GaXJzdENoYXJhY3Rlck9uVmVydGljYWxNb3Rpb24nKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHJvdyksIG9wdGlvbnMpXG4gICAgZWxzZVxuICAgICAgc2V0QnVmZmVyUm93KGN1cnNvciwgcm93LCBvcHRpb25zKVxuXG4gICMgW05PVEVdXG4gICMgU2luY2UgdGhpcyBmdW5jdGlvbiBjaGVja3MgY3Vyc29yIHBvc2l0aW9uIGNoYW5nZSwgYSBjdXJzb3IgcG9zaXRpb24gTVVTVCBiZVxuICAjIHVwZGF0ZWQgSU4gY2FsbGJhY2soPWZuKVxuICAjIFVwZGF0aW5nIHBvaW50IG9ubHkgaW4gY2FsbGJhY2sgaXMgd3JvbmctdXNlIG9mIHRoaXMgZnVuY2l0b24sXG4gICMgc2luY2UgaXQgc3RvcHMgaW1tZWRpYXRlbHkgYmVjYXVzZSBvZiBub3QgY3Vyc29yIHBvc2l0aW9uIGNoYW5nZS5cbiAgbW92ZUN1cnNvckNvdW50VGltZXM6IChjdXJzb3IsIGZuKSAtPlxuICAgIG9sZFBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBAY291bnRUaW1lcyBAZ2V0Q291bnQoKSwgKHN0YXRlKSAtPlxuICAgICAgZm4oc3RhdGUpXG4gICAgICBpZiAobmV3UG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkuaXNFcXVhbChvbGRQb3NpdGlvbilcbiAgICAgICAgc3RhdGUuc3RvcCgpXG4gICAgICBvbGRQb3NpdGlvbiA9IG5ld1Bvc2l0aW9uXG5cbiMgVXNlZCBhcyBvcGVyYXRvcidzIHRhcmdldCBpbiB2aXN1YWwtbW9kZS5cbmNsYXNzIEN1cnJlbnRTZWxlY3Rpb24gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZChmYWxzZSlcbiAgc2VsZWN0aW9uRXh0ZW50OiBudWxsXG4gIGJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudDogbnVsbFxuICBpbmNsdXNpdmU6IHRydWVcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgQHBvaW50SW5mb0J5Q3Vyc29yID0gbmV3IE1hcFxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIGlmIEBpc0Jsb2Nrd2lzZSgpXG4gICAgICAgIEBibG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQgPSBAc3dyYXAoY3Vyc29yLnNlbGVjdGlvbikuZ2V0QmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50KClcbiAgICAgIGVsc2VcbiAgICAgICAgQHNlbGVjdGlvbkV4dGVudCA9IEBlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpLmdldEV4dGVudCgpXG4gICAgZWxzZVxuICAgICAgIyBgLmAgcmVwZWF0IGNhc2VcbiAgICAgIHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgICAgaWYgQGJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudD9cbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYW5zbGF0ZShAYmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50KSlcbiAgICAgIGVsc2VcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYXZlcnNlKEBzZWxlY3Rpb25FeHRlbnQpKVxuXG4gIHNlbGVjdDogLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgc3VwZXJcbiAgICBlbHNlXG4gICAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpIHdoZW4gcG9pbnRJbmZvID0gQHBvaW50SW5mb0J5Q3Vyc29yLmdldChjdXJzb3IpXG4gICAgICAgIHtjdXJzb3JQb3NpdGlvbiwgc3RhcnRPZlNlbGVjdGlvbn0gPSBwb2ludEluZm9cbiAgICAgICAgaWYgY3Vyc29yUG9zaXRpb24uaXNFcXVhbChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc3RhcnRPZlNlbGVjdGlvbilcbiAgICAgIHN1cGVyXG5cbiAgICAjICogUHVycG9zZSBvZiBwb2ludEluZm9CeUN1cnNvcj8gc2VlICMyMzUgZm9yIGRldGFpbC5cbiAgICAjIFdoZW4gc3RheU9uVHJhbnNmb3JtU3RyaW5nIGlzIGVuYWJsZWQsIGN1cnNvciBwb3MgaXMgbm90IHNldCBvbiBzdGFydCBvZlxuICAgICMgb2Ygc2VsZWN0ZWQgcmFuZ2UuXG4gICAgIyBCdXQgSSB3YW50IGZvbGxvd2luZyBiZWhhdmlvciwgc28gbmVlZCB0byBwcmVzZXJ2ZSBwb3NpdGlvbiBpbmZvLlxuICAgICMgIDEuIGB2aj4uYCAtPiBpbmRlbnQgc2FtZSB0d28gcm93cyByZWdhcmRsZXNzIG9mIGN1cnJlbnQgY3Vyc29yJ3Mgcm93LlxuICAgICMgIDIuIGB2aj5qLmAgLT4gaW5kZW50IHR3byByb3dzIGZyb20gY3Vyc29yJ3Mgcm93LlxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICAgIHN0YXJ0T2ZTZWxlY3Rpb24gPSBjdXJzb3Iuc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcbiAgICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgIEBwb2ludEluZm9CeUN1cnNvci5zZXQoY3Vyc29yLCB7c3RhcnRPZlNlbGVjdGlvbiwgY3Vyc29yUG9zaXRpb259KVxuXG5jbGFzcyBNb3ZlTGVmdCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBhbGxvd1dyYXAgPSBAZ2V0Q29uZmlnKCd3cmFwTGVmdFJpZ2h0TW90aW9uJylcbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAtPlxuICAgICAgbW92ZUN1cnNvckxlZnQoY3Vyc29yLCB7YWxsb3dXcmFwfSlcblxuY2xhc3MgTW92ZVJpZ2h0IGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBjYW5XcmFwVG9OZXh0TGluZTogKGN1cnNvcikgLT5cbiAgICBpZiBAaXNBc1RhcmdldEV4Y2VwdFNlbGVjdCgpIGFuZCBub3QgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuICAgICAgZmFsc2VcbiAgICBlbHNlXG4gICAgICBAZ2V0Q29uZmlnKCd3cmFwTGVmdFJpZ2h0TW90aW9uJylcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBAZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhjdXJzb3JQb3NpdGlvbi5yb3cpXG4gICAgICBhbGxvd1dyYXAgPSBAY2FuV3JhcFRvTmV4dExpbmUoY3Vyc29yKVxuICAgICAgbW92ZUN1cnNvclJpZ2h0KGN1cnNvcilcbiAgICAgIGlmIGN1cnNvci5pc0F0RW5kT2ZMaW5lKCkgYW5kIGFsbG93V3JhcCBhbmQgbm90IHBvaW50SXNBdFZpbUVuZE9mRmlsZShAZWRpdG9yLCBjdXJzb3JQb3NpdGlvbilcbiAgICAgICAgbW92ZUN1cnNvclJpZ2h0KGN1cnNvciwge2FsbG93V3JhcH0pXG5cbmNsYXNzIE1vdmVSaWdodEJ1ZmZlckNvbHVtbiBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgc2V0QnVmZmVyQ29sdW1uKGN1cnNvciwgY3Vyc29yLmdldEJ1ZmZlckNvbHVtbigpICsgQGdldENvdW50KCkpXG5cbmNsYXNzIE1vdmVVcCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICB3cmFwOiBmYWxzZVxuXG4gIGdldEJ1ZmZlclJvdzogKHJvdykgLT5cbiAgICByb3cgPSBAZ2V0TmV4dFJvdyhyb3cpXG4gICAgaWYgQGVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdylcbiAgICAgIGdldExhcmdlc3RGb2xkUmFuZ2VDb250YWluc0J1ZmZlclJvdyhAZWRpdG9yLCByb3cpLnN0YXJ0LnJvd1xuICAgIGVsc2VcbiAgICAgIHJvd1xuXG4gIGdldE5leHRSb3c6IChyb3cpIC0+XG4gICAgbWluID0gMFxuICAgIGlmIEB3cmFwIGFuZCByb3cgaXMgbWluXG4gICAgICBAZ2V0VmltTGFzdEJ1ZmZlclJvdygpXG4gICAgZWxzZVxuICAgICAgbGltaXROdW1iZXIocm93IC0gMSwge21pbn0pXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgc2V0QnVmZmVyUm93KGN1cnNvciwgQGdldEJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpKVxuXG5jbGFzcyBNb3ZlVXBXcmFwIGV4dGVuZHMgTW92ZVVwXG4gIEBleHRlbmQoKVxuICB3cmFwOiB0cnVlXG5cbmNsYXNzIE1vdmVEb3duIGV4dGVuZHMgTW92ZVVwXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHdyYXA6IGZhbHNlXG5cbiAgZ2V0QnVmZmVyUm93OiAocm93KSAtPlxuICAgIGlmIEBlZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgICByb3cgPSBnZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3coQGVkaXRvciwgcm93KS5lbmQucm93XG4gICAgQGdldE5leHRSb3cocm93KVxuXG4gIGdldE5leHRSb3c6IChyb3cpIC0+XG4gICAgbWF4ID0gQGdldFZpbUxhc3RCdWZmZXJSb3coKVxuICAgIGlmIEB3cmFwIGFuZCByb3cgPj0gbWF4XG4gICAgICAwXG4gICAgZWxzZVxuICAgICAgbGltaXROdW1iZXIocm93ICsgMSwge21heH0pXG5cbmNsYXNzIE1vdmVEb3duV3JhcCBleHRlbmRzIE1vdmVEb3duXG4gIEBleHRlbmQoKVxuICB3cmFwOiB0cnVlXG5cbmNsYXNzIE1vdmVVcFNjcmVlbiBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBkaXJlY3Rpb246ICd1cCdcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsIC0+XG4gICAgICBtb3ZlQ3Vyc29yVXBTY3JlZW4oY3Vyc29yKVxuXG5jbGFzcyBNb3ZlRG93blNjcmVlbiBleHRlbmRzIE1vdmVVcFNjcmVlblxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBkaXJlY3Rpb246ICdkb3duJ1xuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgLT5cbiAgICAgIG1vdmVDdXJzb3JEb3duU2NyZWVuKGN1cnNvcilcblxuIyBNb3ZlIGRvd24vdXAgdG8gRWRnZVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFNlZSB0OW1kL2F0b20tdmltLW1vZGUtcGx1cyMyMzZcbiMgQXQgbGVhc3QgdjEuNy4wLiBidWZmZXJQb3NpdGlvbiBhbmQgc2NyZWVuUG9zaXRpb24gY2Fubm90IGNvbnZlcnQgYWNjdXJhdGVseVxuIyB3aGVuIHJvdyBpcyBmb2xkZWQuXG5jbGFzcyBNb3ZlVXBUb0VkZ2UgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAganVtcDogdHJ1ZVxuICBkaXJlY3Rpb246ICd1cCdcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgY3Vyc29yIHVwIHRvICoqZWRnZSoqIGNoYXIgYXQgc2FtZS1jb2x1bW5cIlxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIEBzZXRTY3JlZW5Qb3NpdGlvblNhZmVseShjdXJzb3IsIEBnZXRQb2ludChjdXJzb3IuZ2V0U2NyZWVuUG9zaXRpb24oKSkpXG5cbiAgZ2V0UG9pbnQ6IChmcm9tUG9pbnQpIC0+XG4gICAgY29sdW1uID0gZnJvbVBvaW50LmNvbHVtblxuICAgIGZvciByb3cgaW4gQGdldFNjYW5Sb3dzKGZyb21Qb2ludCkgd2hlbiBAaXNFZGdlKHBvaW50ID0gbmV3IFBvaW50KHJvdywgY29sdW1uKSlcbiAgICAgIHJldHVybiBwb2ludFxuXG4gIGdldFNjYW5Sb3dzOiAoe3Jvd30pIC0+XG4gICAgdmFsaWRSb3cgPSBnZXRWYWxpZFZpbVNjcmVlblJvdy5iaW5kKG51bGwsIEBlZGl0b3IpXG4gICAgc3dpdGNoIEBkaXJlY3Rpb25cbiAgICAgIHdoZW4gJ3VwJyB0aGVuIFt2YWxpZFJvdyhyb3cgLSAxKS4uMF1cbiAgICAgIHdoZW4gJ2Rvd24nIHRoZW4gW3ZhbGlkUm93KHJvdyArIDEpLi5AZ2V0VmltTGFzdFNjcmVlblJvdygpXVxuXG4gIGlzRWRnZTogKHBvaW50KSAtPlxuICAgIGlmIEBpc1N0b3BwYWJsZVBvaW50KHBvaW50KVxuICAgICAgIyBJZiBvbmUgb2YgYWJvdmUvYmVsb3cgcG9pbnQgd2FzIG5vdCBzdG9wcGFibGUsIGl0J3MgRWRnZSFcbiAgICAgIGFib3ZlID0gcG9pbnQudHJhbnNsYXRlKFstMSwgMF0pXG4gICAgICBiZWxvdyA9IHBvaW50LnRyYW5zbGF0ZShbKzEsIDBdKVxuICAgICAgKG5vdCBAaXNTdG9wcGFibGVQb2ludChhYm92ZSkpIG9yIChub3QgQGlzU3RvcHBhYmxlUG9pbnQoYmVsb3cpKVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgaXNTdG9wcGFibGVQb2ludDogKHBvaW50KSAtPlxuICAgIGlmIEBpc05vbldoaXRlU3BhY2VQb2ludChwb2ludClcbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBsZWZ0UG9pbnQgPSBwb2ludC50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICAgIHJpZ2h0UG9pbnQgPSBwb2ludC50cmFuc2xhdGUoWzAsICsxXSlcbiAgICAgIEBpc05vbldoaXRlU3BhY2VQb2ludChsZWZ0UG9pbnQpIGFuZCBAaXNOb25XaGl0ZVNwYWNlUG9pbnQocmlnaHRQb2ludClcblxuICBpc05vbldoaXRlU3BhY2VQb2ludDogKHBvaW50KSAtPlxuICAgIGNoYXIgPSBnZXRUZXh0SW5TY3JlZW5SYW5nZShAZWRpdG9yLCBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIDEpKVxuICAgIGNoYXI/IGFuZCAvXFxTLy50ZXN0KGNoYXIpXG5cbmNsYXNzIE1vdmVEb3duVG9FZGdlIGV4dGVuZHMgTW92ZVVwVG9FZGdlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSBjdXJzb3IgZG93biB0byAqKmVkZ2UqKiBjaGFyIGF0IHNhbWUtY29sdW1uXCJcbiAgZGlyZWN0aW9uOiAnZG93bidcblxuIyB3b3JkXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRXb3JkIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IG51bGxcblxuICBnZXRQb2ludDogKHBhdHRlcm4sIGZyb20pIC0+XG4gICAgd29yZFJhbmdlID0gbnVsbFxuICAgIGZvdW5kID0gZmFsc2VcbiAgICB2aW1FT0YgPSBAZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oQGVkaXRvcilcblxuICAgIEBzY2FuRm9yd2FyZCBwYXR0ZXJuLCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNoVGV4dCwgc3RvcH0pIC0+XG4gICAgICB3b3JkUmFuZ2UgPSByYW5nZVxuICAgICAgIyBJZ25vcmUgJ2VtcHR5IGxpbmUnIG1hdGNoZXMgYmV0d2VlbiAnXFxyJyBhbmQgJ1xcbidcbiAgICAgIHJldHVybiBpZiBtYXRjaFRleHQgaXMgJycgYW5kIHJhbmdlLnN0YXJ0LmNvbHVtbiBpc250IDBcbiAgICAgIGlmIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbSlcbiAgICAgICAgZm91bmQgPSB0cnVlXG4gICAgICAgIHN0b3AoKVxuXG4gICAgaWYgZm91bmRcbiAgICAgIHBvaW50ID0gd29yZFJhbmdlLnN0YXJ0XG4gICAgICBpZiBwb2ludElzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93KEBlZGl0b3IsIHBvaW50KSBhbmQgbm90IHBvaW50LmlzRXF1YWwodmltRU9GKVxuICAgICAgICBwb2ludC50cmF2ZXJzZShbMSwgMF0pXG4gICAgICBlbHNlXG4gICAgICAgIHBvaW50XG4gICAgZWxzZVxuICAgICAgd29yZFJhbmdlPy5lbmQgPyBmcm9tXG5cbiAgIyBTcGVjaWFsIGNhc2U6IFwiY3dcIiBhbmQgXCJjV1wiIGFyZSB0cmVhdGVkIGxpa2UgXCJjZVwiIGFuZCBcImNFXCIgaWYgdGhlIGN1cnNvciBpc1xuICAjIG9uIGEgbm9uLWJsYW5rLiAgVGhpcyBpcyBiZWNhdXNlIFwiY3dcIiBpcyBpbnRlcnByZXRlZCBhcyBjaGFuZ2Utd29yZCwgYW5kIGFcbiAgIyB3b3JkIGRvZXMgbm90IGluY2x1ZGUgdGhlIGZvbGxvd2luZyB3aGl0ZSBzcGFjZS4gIHtWaTogXCJjd1wiIHdoZW4gb24gYSBibGFua1xuICAjIGZvbGxvd2VkIGJ5IG90aGVyIGJsYW5rcyBjaGFuZ2VzIG9ubHkgdGhlIGZpcnN0IGJsYW5rOyB0aGlzIGlzIHByb2JhYmx5IGFcbiAgIyBidWcsIGJlY2F1c2UgXCJkd1wiIGRlbGV0ZXMgYWxsIHRoZSBibGFua3N9XG4gICNcbiAgIyBBbm90aGVyIHNwZWNpYWwgY2FzZTogV2hlbiB1c2luZyB0aGUgXCJ3XCIgbW90aW9uIGluIGNvbWJpbmF0aW9uIHdpdGggYW5cbiAgIyBvcGVyYXRvciBhbmQgdGhlIGxhc3Qgd29yZCBtb3ZlZCBvdmVyIGlzIGF0IHRoZSBlbmQgb2YgYSBsaW5lLCB0aGUgZW5kIG9mXG4gICMgdGhhdCB3b3JkIGJlY29tZXMgdGhlIGVuZCBvZiB0aGUgb3BlcmF0ZWQgdGV4dCwgbm90IHRoZSBmaXJzdCB3b3JkIGluIHRoZVxuICAjIG5leHQgbGluZS5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgcmV0dXJuIGlmIHBvaW50SXNBdFZpbUVuZE9mRmlsZShAZWRpdG9yLCBjdXJzb3JQb3NpdGlvbilcbiAgICB3YXNPbldoaXRlU3BhY2UgPSBwb2ludElzT25XaGl0ZVNwYWNlKEBlZGl0b3IsIGN1cnNvclBvc2l0aW9uKVxuXG4gICAgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdCA9IEBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0KClcbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAoe2lzRmluYWx9KSA9PlxuICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgaXNFbXB0eVJvdyhAZWRpdG9yLCBjdXJzb3JQb3NpdGlvbi5yb3cpIGFuZCBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0XG4gICAgICAgIHBvaW50ID0gY3Vyc29yUG9zaXRpb24udHJhdmVyc2UoWzEsIDBdKVxuICAgICAgZWxzZVxuICAgICAgICBwYXR0ZXJuID0gQHdvcmRSZWdleCA/IGN1cnNvci53b3JkUmVnRXhwKClcbiAgICAgICAgcG9pbnQgPSBAZ2V0UG9pbnQocGF0dGVybiwgY3Vyc29yUG9zaXRpb24pXG4gICAgICAgIGlmIGlzRmluYWwgYW5kIGlzQXNUYXJnZXRFeGNlcHRTZWxlY3RcbiAgICAgICAgICBpZiBAb3BlcmF0b3IuaXMoJ0NoYW5nZScpIGFuZCAobm90IHdhc09uV2hpdGVTcGFjZSlcbiAgICAgICAgICAgIHBvaW50ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7QHdvcmRSZWdleH0pXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcG9pbnQgPSBQb2ludC5taW4ocG9pbnQsIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyhAZWRpdG9yLCBjdXJzb3JQb3NpdGlvbi5yb3cpKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4jIGJcbmNsYXNzIE1vdmVUb1ByZXZpb3VzV29yZCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiBudWxsXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0QmVnaW5uaW5nT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHtAd29yZFJlZ2V4fSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuY2xhc3MgTW92ZVRvRW5kT2ZXb3JkIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IG51bGxcbiAgaW5jbHVzaXZlOiB0cnVlXG5cbiAgbW92ZVRvTmV4dEVuZE9mV29yZDogKGN1cnNvcikgLT5cbiAgICBtb3ZlQ3Vyc29yVG9OZXh0Tm9uV2hpdGVzcGFjZShjdXJzb3IpXG4gICAgcG9pbnQgPSBjdXJzb3IuZ2V0RW5kT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHtAd29yZFJlZ2V4fSkudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgcG9pbnQgPSBQb2ludC5taW4ocG9pbnQsIEBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpKVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBvcmlnaW5hbFBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIEBtb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcilcbiAgICAgIGlmIG9yaWdpbmFsUG9pbnQuaXNFcXVhbChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgICAgIyBSZXRyeSBmcm9tIHJpZ2h0IGNvbHVtbiBpZiBjdXJzb3Igd2FzIGFscmVhZHkgb24gRW5kT2ZXb3JkXG4gICAgICAgIGN1cnNvci5tb3ZlUmlnaHQoKVxuICAgICAgICBAbW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpXG5cbiMgW1RPRE86IEltcHJvdmUsIGFjY3VyYWN5XVxuY2xhc3MgTW92ZVRvUHJldmlvdXNFbmRPZldvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmRcbiAgQGV4dGVuZCgpXG4gIGluY2x1c2l2ZTogdHJ1ZVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgdGltZXMgPSBAZ2V0Q291bnQoKVxuICAgIHdvcmRSYW5nZSA9IGN1cnNvci5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKClcbiAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAjIGlmIHdlJ3JlIGluIHRoZSBtaWRkbGUgb2YgYSB3b3JkIHRoZW4gd2UgbmVlZCB0byBtb3ZlIHRvIGl0cyBzdGFydFxuICAgIGlmIGN1cnNvclBvc2l0aW9uLmlzR3JlYXRlclRoYW4od29yZFJhbmdlLnN0YXJ0KSBhbmQgY3Vyc29yUG9zaXRpb24uaXNMZXNzVGhhbih3b3JkUmFuZ2UuZW5kKVxuICAgICAgdGltZXMgKz0gMVxuXG4gICAgZm9yIFsxLi50aW1lc11cbiAgICAgIHBvaW50ID0gY3Vyc29yLmdldEJlZ2lubmluZ09mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7QHdvcmRSZWdleH0pXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgICBAbW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpXG4gICAgaWYgY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkuaXNHcmVhdGVyVGhhbk9yRXF1YWwoY3Vyc29yUG9zaXRpb24pXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuXG4gIG1vdmVUb05leHRFbmRPZldvcmQ6IChjdXJzb3IpIC0+XG4gICAgcG9pbnQgPSBjdXJzb3IuZ2V0RW5kT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHtAd29yZFJlZ2V4fSkudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgcG9pbnQgPSBQb2ludC5taW4ocG9pbnQsIEBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpKVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuIyBXaG9sZSB3b3JkXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZFxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiAvXiR8XFxTKy9nXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IC9eJHxcXFMrL2dcblxuY2xhc3MgTW92ZVRvRW5kT2ZXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmRcbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogL1xcUysvXG5cbiMgW1RPRE86IEltcHJvdmUsIGFjY3VyYWN5XVxuY2xhc3MgTW92ZVRvUHJldmlvdXNFbmRPZldob2xlV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IC9cXFMrL1xuXG4jIEFscGhhbnVtZXJpYyB3b3JkIFtFeHBlcmltZW50YWxdXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgYWxwaGFudW1lcmljKGAvXFx3Ky9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvXFx3Ky9nXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzQWxwaGFudW1lcmljV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgYWxwaGFudW1lcmljKGAvXFx3Ky9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvXFx3Ky9cblxuY2xhc3MgTW92ZVRvRW5kT2ZBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBlbmQgb2YgYWxwaGFudW1lcmljKGAvXFx3Ky9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvXFx3Ky9cblxuIyBBbHBoYW51bWVyaWMgd29yZCBbRXhwZXJpbWVudGFsXVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0U21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgc21hcnQgd29yZCAoYC9bXFx3LV0rL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9bXFx3LV0rL2dcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIHNtYXJ0IHdvcmQgKGAvW1xcdy1dKy9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvW1xcdy1dKy9cblxuY2xhc3MgTW92ZVRvRW5kT2ZTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIGVuZCBvZiBzbWFydCB3b3JkIChgL1tcXHctXSsvYCkgd29yZFwiXG4gIHdvcmRSZWdleDogL1tcXHctXSsvXG5cbiMgU3Vid29yZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0U3Vid29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkXG4gIEBleHRlbmQoKVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEB3b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXJcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkXG4gIEBleHRlbmQoKVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEB3b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXJcblxuY2xhc3MgTW92ZVRvRW5kT2ZTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkXG4gIEBleHRlbmQoKVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEB3b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXJcblxuIyBTZW50ZW5jZVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFNlbnRlbmNlIGlzIGRlZmluZWQgYXMgYmVsb3dcbiMgIC0gZW5kIHdpdGggWycuJywgJyEnLCAnPyddXG4jICAtIG9wdGlvbmFsbHkgZm9sbG93ZWQgYnkgWycpJywgJ10nLCAnXCInLCBcIidcIl1cbiMgIC0gZm9sbG93ZWQgYnkgWyckJywgJyAnLCAnXFx0J11cbiMgIC0gcGFyYWdyYXBoIGJvdW5kYXJ5IGlzIGFsc28gc2VudGVuY2UgYm91bmRhcnlcbiMgIC0gc2VjdGlvbiBib3VuZGFyeSBpcyBhbHNvIHNlbnRlbmNlIGJvdW5kYXJ5KGlnbm9yZSlcbmNsYXNzIE1vdmVUb05leHRTZW50ZW5jZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAganVtcDogdHJ1ZVxuICBzZW50ZW5jZVJlZ2V4OiAvLy8oPzpbXFwuIVxcP11bXFwpXFxdXCInXSpcXHMrKXwoXFxufFxcclxcbikvLy9nXG4gIGRpcmVjdGlvbjogJ25leHQnXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgQHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgQGdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSlcblxuICBnZXRQb2ludDogKGZyb21Qb2ludCkgLT5cbiAgICBpZiBAZGlyZWN0aW9uIGlzICduZXh0J1xuICAgICAgQGdldE5leHRTdGFydE9mU2VudGVuY2UoZnJvbVBvaW50KVxuICAgIGVsc2UgaWYgQGRpcmVjdGlvbiBpcyAncHJldmlvdXMnXG4gICAgICBAZ2V0UHJldmlvdXNTdGFydE9mU2VudGVuY2UoZnJvbVBvaW50KVxuXG4gIGlzQmxhbmtSb3c6IChyb3cpIC0+XG4gICAgQGVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdylcblxuICBnZXROZXh0U3RhcnRPZlNlbnRlbmNlOiAoZnJvbSkgLT5cbiAgICBmb3VuZFBvaW50ID0gbnVsbFxuICAgIEBzY2FuRm9yd2FyZCBAc2VudGVuY2VSZWdleCwge2Zyb219LCAoe3JhbmdlLCBtYXRjaFRleHQsIG1hdGNoLCBzdG9wfSkgPT5cbiAgICAgIGlmIG1hdGNoWzFdP1xuICAgICAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBbcmFuZ2Uuc3RhcnQucm93LCByYW5nZS5lbmQucm93XVxuICAgICAgICByZXR1cm4gaWYgQHNraXBCbGFua1JvdyBhbmQgQGlzQmxhbmtSb3coZW5kUm93KVxuICAgICAgICBpZiBAaXNCbGFua1JvdyhzdGFydFJvdykgaXNudCBAaXNCbGFua1JvdyhlbmRSb3cpXG4gICAgICAgICAgZm91bmRQb2ludCA9IEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGVuZFJvdylcbiAgICAgIGVsc2VcbiAgICAgICAgZm91bmRQb2ludCA9IHJhbmdlLmVuZFxuICAgICAgc3RvcCgpIGlmIGZvdW5kUG9pbnQ/XG4gICAgZm91bmRQb2ludCA/IEBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpXG5cbiAgZ2V0UHJldmlvdXNTdGFydE9mU2VudGVuY2U6IChmcm9tKSAtPlxuICAgIGZvdW5kUG9pbnQgPSBudWxsXG4gICAgQHNjYW5CYWNrd2FyZCBAc2VudGVuY2VSZWdleCwge2Zyb219LCAoe3JhbmdlLCBtYXRjaCwgc3RvcCwgbWF0Y2hUZXh0fSkgPT5cbiAgICAgIGlmIG1hdGNoWzFdP1xuICAgICAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBbcmFuZ2Uuc3RhcnQucm93LCByYW5nZS5lbmQucm93XVxuICAgICAgICBpZiBub3QgQGlzQmxhbmtSb3coZW5kUm93KSBhbmQgQGlzQmxhbmtSb3coc3RhcnRSb3cpXG4gICAgICAgICAgcG9pbnQgPSBAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhlbmRSb3cpXG4gICAgICAgICAgaWYgcG9pbnQuaXNMZXNzVGhhbihmcm9tKVxuICAgICAgICAgICAgZm91bmRQb2ludCA9IHBvaW50XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGlmIEBza2lwQmxhbmtSb3dcbiAgICAgICAgICAgIGZvdW5kUG9pbnQgPSBAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhzdGFydFJvdylcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgcmFuZ2UuZW5kLmlzTGVzc1RoYW4oZnJvbSlcbiAgICAgICAgICBmb3VuZFBvaW50ID0gcmFuZ2UuZW5kXG4gICAgICBzdG9wKCkgaWYgZm91bmRQb2ludD9cbiAgICBmb3VuZFBvaW50ID8gWzAsIDBdXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2UgZXh0ZW5kcyBNb3ZlVG9OZXh0U2VudGVuY2VcbiAgQGV4dGVuZCgpXG4gIGRpcmVjdGlvbjogJ3ByZXZpb3VzJ1xuXG5jbGFzcyBNb3ZlVG9OZXh0U2VudGVuY2VTa2lwQmxhbmtSb3cgZXh0ZW5kcyBNb3ZlVG9OZXh0U2VudGVuY2VcbiAgQGV4dGVuZCgpXG4gIHNraXBCbGFua1JvdzogdHJ1ZVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlU2tpcEJsYW5rUm93IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNTZW50ZW5jZVxuICBAZXh0ZW5kKClcbiAgc2tpcEJsYW5rUm93OiB0cnVlXG5cbiMgUGFyYWdyYXBoXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRQYXJhZ3JhcGggZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGp1bXA6IHRydWVcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBAZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKVxuXG4gIGdldFBvaW50OiAoZnJvbVBvaW50KSAtPlxuICAgIHN0YXJ0Um93ID0gZnJvbVBvaW50LnJvd1xuICAgIHdhc0F0Tm9uQmxhbmtSb3cgPSBub3QgQGVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHN0YXJ0Um93KVxuICAgIGZvciByb3cgaW4gZ2V0QnVmZmVyUm93cyhAZWRpdG9yLCB7c3RhcnRSb3csIEBkaXJlY3Rpb259KVxuICAgICAgaWYgQGVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdylcbiAgICAgICAgcmV0dXJuIG5ldyBQb2ludChyb3csIDApIGlmIHdhc0F0Tm9uQmxhbmtSb3dcbiAgICAgIGVsc2VcbiAgICAgICAgd2FzQXROb25CbGFua1JvdyA9IHRydWVcblxuICAgICMgZmFsbGJhY2tcbiAgICBzd2l0Y2ggQGRpcmVjdGlvblxuICAgICAgd2hlbiAncHJldmlvdXMnIHRoZW4gbmV3IFBvaW50KDAsIDApXG4gICAgICB3aGVuICduZXh0JyB0aGVuIEBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzUGFyYWdyYXBoIGV4dGVuZHMgTW92ZVRvTmV4dFBhcmFncmFwaFxuICBAZXh0ZW5kKClcbiAgZGlyZWN0aW9uOiAncHJldmlvdXMnXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvQmVnaW5uaW5nT2ZMaW5lIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgc2V0QnVmZmVyQ29sdW1uKGN1cnNvciwgMClcblxuY2xhc3MgTW92ZVRvQ29sdW1uIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgc2V0QnVmZmVyQ29sdW1uKGN1cnNvciwgQGdldENvdW50KC0xKSlcblxuY2xhc3MgTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHJvdyA9IGdldFZhbGlkVmltQnVmZmVyUm93KEBlZGl0b3IsIGN1cnNvci5nZXRCdWZmZXJSb3coKSArIEBnZXRDb3VudCgtMSkpXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtyb3csIEluZmluaXR5XSlcbiAgICBjdXJzb3IuZ29hbENvbHVtbiA9IEluZmluaXR5XG5cbmNsYXNzIE1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGluY2x1c2l2ZTogdHJ1ZVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgcG9pbnQgPSBAZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIGdldFBvaW50OiAoe3Jvd30pIC0+XG4gICAgcm93ID0gbGltaXROdW1iZXIocm93ICsgQGdldENvdW50KC0xKSwgbWF4OiBAZ2V0VmltTGFzdEJ1ZmZlclJvdygpKVxuICAgIHJhbmdlID0gZmluZFJhbmdlSW5CdWZmZXJSb3coQGVkaXRvciwgL1xcU3xeLywgcm93LCBkaXJlY3Rpb246ICdiYWNrd2FyZCcpXG4gICAgcmFuZ2U/LnN0YXJ0ID8gbmV3IFBvaW50KHJvdywgMClcblxuIyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBmYWltaWx5XG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgcG9pbnQgPSBAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgQHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgcG9pbnQpXG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAgZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZVxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsIC0+XG4gICAgICBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICB1bmxlc3MgcG9pbnQucm93IGlzIDBcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYW5zbGF0ZShbLTEsIDBdKSlcbiAgICBzdXBlclxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd24gZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZVxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICB1bmxlc3MgQGdldFZpbUxhc3RCdWZmZXJSb3coKSBpcyBwb2ludC5yb3dcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYW5zbGF0ZShbKzEsIDBdKSlcbiAgICBzdXBlclxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZUFuZERvd24gZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd25cbiAgQGV4dGVuZCgpXG4gIGRlZmF1bHRDb3VudDogMFxuICBnZXRDb3VudDogLT4gc3VwZXIgLSAxXG5cbiMga2V5bWFwOiBnIGdcbmNsYXNzIE1vdmVUb0ZpcnN0TGluZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBqdW1wOiB0cnVlXG4gIHZlcnRpY2FsTW90aW9uOiB0cnVlXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZTogdHJ1ZVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQHNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIGdldFZhbGlkVmltQnVmZmVyUm93KEBlZGl0b3IsIEBnZXRSb3coKSkpXG4gICAgY3Vyc29yLmF1dG9zY3JvbGwoY2VudGVyOiB0cnVlKVxuXG4gIGdldFJvdzogLT5cbiAgICBAZ2V0Q291bnQoLTEpXG5cbiMga2V5bWFwOiBHXG5jbGFzcyBNb3ZlVG9MYXN0TGluZSBleHRlbmRzIE1vdmVUb0ZpcnN0TGluZVxuICBAZXh0ZW5kKClcbiAgZGVmYXVsdENvdW50OiBJbmZpbml0eVxuXG4jIGtleW1hcDogTiUgZS5nLiAxMCVcbmNsYXNzIE1vdmVUb0xpbmVCeVBlcmNlbnQgZXh0ZW5kcyBNb3ZlVG9GaXJzdExpbmVcbiAgQGV4dGVuZCgpXG5cbiAgZ2V0Um93OiAtPlxuICAgIHBlcmNlbnQgPSBsaW1pdE51bWJlcihAZ2V0Q291bnQoKSwgbWF4OiAxMDApXG4gICAgTWF0aC5mbG9vcigoQGVkaXRvci5nZXRMaW5lQ291bnQoKSAtIDEpICogKHBlcmNlbnQgLyAxMDApKVxuXG5jbGFzcyBNb3ZlVG9SZWxhdGl2ZUxpbmUgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZChmYWxzZSlcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2U6IHRydWVcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHNldEJ1ZmZlclJvdyhjdXJzb3IsIGN1cnNvci5nZXRCdWZmZXJSb3coKSArIEBnZXRDb3VudCgtMSkpXG5cbmNsYXNzIE1vdmVUb1JlbGF0aXZlTGluZU1pbmltdW1PbmUgZXh0ZW5kcyBNb3ZlVG9SZWxhdGl2ZUxpbmVcbiAgQGV4dGVuZChmYWxzZSlcblxuICBnZXRDb3VudDogLT5cbiAgICBsaW1pdE51bWJlcihzdXBlciwgbWluOiAxKVxuXG4jIFBvc2l0aW9uIGN1cnNvciB3aXRob3V0IHNjcm9sbGluZy4sIEgsIE0sIExcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBrZXltYXA6IEhcbmNsYXNzIE1vdmVUb1RvcE9mU2NyZWVuIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGp1bXA6IHRydWVcbiAgc2Nyb2xsb2ZmOiAyXG4gIGRlZmF1bHRDb3VudDogMFxuICB2ZXJ0aWNhbE1vdGlvbjogdHJ1ZVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgYnVmZmVyUm93ID0gQGVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coQGdldFNjcmVlblJvdygpKVxuICAgIEBzZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCBidWZmZXJSb3cpXG5cbiAgZ2V0U2Nyb2xsb2ZmOiAtPlxuICAgIGlmIEBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0KClcbiAgICAgIDBcbiAgICBlbHNlXG4gICAgICBAc2Nyb2xsb2ZmXG5cbiAgZ2V0U2NyZWVuUm93OiAtPlxuICAgIGZpcnN0Um93ID0gZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KEBlZGl0b3IpXG4gICAgb2Zmc2V0ID0gQGdldFNjcm9sbG9mZigpXG4gICAgb2Zmc2V0ID0gMCBpZiBmaXJzdFJvdyBpcyAwXG4gICAgb2Zmc2V0ID0gbGltaXROdW1iZXIoQGdldENvdW50KC0xKSwgbWluOiBvZmZzZXQpXG4gICAgZmlyc3RSb3cgKyBvZmZzZXRcblxuIyBrZXltYXA6IE1cbmNsYXNzIE1vdmVUb01pZGRsZU9mU2NyZWVuIGV4dGVuZHMgTW92ZVRvVG9wT2ZTY3JlZW5cbiAgQGV4dGVuZCgpXG4gIGdldFNjcmVlblJvdzogLT5cbiAgICBzdGFydFJvdyA9IGdldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhAZWRpdG9yKVxuICAgIGVuZFJvdyA9IGxpbWl0TnVtYmVyKEBlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSwgbWF4OiBAZ2V0VmltTGFzdFNjcmVlblJvdygpKVxuICAgIHN0YXJ0Um93ICsgTWF0aC5mbG9vcigoZW5kUm93IC0gc3RhcnRSb3cpIC8gMilcblxuIyBrZXltYXA6IExcbmNsYXNzIE1vdmVUb0JvdHRvbU9mU2NyZWVuIGV4dGVuZHMgTW92ZVRvVG9wT2ZTY3JlZW5cbiAgQGV4dGVuZCgpXG4gIGdldFNjcmVlblJvdzogLT5cbiAgICAjIFtGSVhNRV1cbiAgICAjIEF0IGxlYXN0IEF0b20gdjEuNi4wLCB0aGVyZSBhcmUgdHdvIGltcGxlbWVudGF0aW9uIG9mIGdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAjIGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpIGFuZCBlZGl0b3JFbGVtZW50LmdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAjIFRob3NlIHR3byBtZXRob2RzIHJldHVybiBkaWZmZXJlbnQgdmFsdWUsIGVkaXRvcidzIG9uZSBpcyBjb3JyZW50LlxuICAgICMgU28gSSBpbnRlbnRpb25hbGx5IHVzZSBlZGl0b3IuZ2V0TGFzdFNjcmVlblJvdyBoZXJlLlxuICAgIHZpbUxhc3RTY3JlZW5Sb3cgPSBAZ2V0VmltTGFzdFNjcmVlblJvdygpXG4gICAgcm93ID0gbGltaXROdW1iZXIoQGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpLCBtYXg6IHZpbUxhc3RTY3JlZW5Sb3cpXG4gICAgb2Zmc2V0ID0gQGdldFNjcm9sbG9mZigpICsgMVxuICAgIG9mZnNldCA9IDAgaWYgcm93IGlzIHZpbUxhc3RTY3JlZW5Sb3dcbiAgICBvZmZzZXQgPSBsaW1pdE51bWJlcihAZ2V0Q291bnQoLTEpLCBtaW46IG9mZnNldClcbiAgICByb3cgLSBvZmZzZXRcblxuIyBTY3JvbGxpbmdcbiMgSGFsZjogY3RybC1kLCBjdHJsLXVcbiMgRnVsbDogY3RybC1mLCBjdHJsLWJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBbRklYTUVdIGNvdW50IGJlaGF2ZSBkaWZmZXJlbnRseSBmcm9tIG9yaWdpbmFsIFZpbS5cbmNsYXNzIFNjcm9sbCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuICB2ZXJ0aWNhbE1vdGlvbjogdHJ1ZVxuXG4gIGlzU21vb3RoU2Nyb2xsRW5hYmxlZDogLT5cbiAgICBpZiBNYXRoLmFicyhAYW1vdW50T2ZQYWdlKSBpcyAxXG4gICAgICBAZ2V0Q29uZmlnKCdzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb24nKVxuICAgIGVsc2VcbiAgICAgIEBnZXRDb25maWcoJ3Ntb290aFNjcm9sbE9uSGFsZlNjcm9sbE1vdGlvbicpXG5cbiAgZ2V0U21vb3RoU2Nyb2xsRHVhdGlvbjogLT5cbiAgICBpZiBNYXRoLmFicyhAYW1vdW50T2ZQYWdlKSBpcyAxXG4gICAgICBAZ2V0Q29uZmlnKCdzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb25EdXJhdGlvbicpXG4gICAgZWxzZVxuICAgICAgQGdldENvbmZpZygnc21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uRHVyYXRpb24nKVxuXG4gIGdldFBpeGVsUmVjdFRvcEZvclNjZWVuUm93OiAocm93KSAtPlxuICAgIHBvaW50ID0gbmV3IFBvaW50KHJvdywgMClcbiAgICBAZWRpdG9yLmVsZW1lbnQucGl4ZWxSZWN0Rm9yU2NyZWVuUmFuZ2UobmV3IFJhbmdlKHBvaW50LCBwb2ludCkpLnRvcFxuXG4gIHNtb290aFNjcm9sbDogKGZyb21Sb3csIHRvUm93LCBkb25lKSAtPlxuICAgIHRvcFBpeGVsRnJvbSA9IHt0b3A6IEBnZXRQaXhlbFJlY3RUb3BGb3JTY2VlblJvdyhmcm9tUm93KX1cbiAgICB0b3BQaXhlbFRvID0ge3RvcDogQGdldFBpeGVsUmVjdFRvcEZvclNjZWVuUm93KHRvUm93KX1cbiAgICAjIFtOT1RFXVxuICAgICMgaW50ZW50aW9uYWxseSB1c2UgYGVsZW1lbnQuY29tcG9uZW50LnNldFNjcm9sbFRvcGAgaW5zdGVhZCBvZiBgZWxlbWVudC5zZXRTY3JvbGxUb3BgLlxuICAgICMgU0luY2UgZWxlbWVudC5zZXRTY3JvbGxUb3Agd2lsbCB0aHJvdyBleGNlcHRpb24gd2hlbiBlbGVtZW50LmNvbXBvbmVudCBubyBsb25nZXIgZXhpc3RzLlxuICAgIHN0ZXAgPSAobmV3VG9wKSA9PiBAZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50Py5zZXRTY3JvbGxUb3AobmV3VG9wKVxuICAgIGR1cmF0aW9uID0gQGdldFNtb290aFNjcm9sbER1YXRpb24oKVxuICAgIEB2aW1TdGF0ZS5yZXF1ZXN0U2Nyb2xsQW5pbWF0aW9uKHRvcFBpeGVsRnJvbSwgdG9wUGl4ZWxUbywge2R1cmF0aW9uLCBzdGVwLCBkb25lfSlcblxuICBnZXRBbW91bnRPZlJvd3M6IC0+XG4gICAgTWF0aC5jZWlsKEBhbW91bnRPZlBhZ2UgKiBAZWRpdG9yLmdldFJvd3NQZXJQYWdlKCkgKiBAZ2V0Q291bnQoKSlcblxuICBnZXRCdWZmZXJSb3c6IChjdXJzb3IpIC0+XG4gICAgc2NyZWVuUm93ID0gZ2V0VmFsaWRWaW1TY3JlZW5Sb3coQGVkaXRvciwgY3Vyc29yLmdldFNjcmVlblJvdygpICsgQGdldEFtb3VudE9mUm93cygpKVxuICAgIEBlZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHNjcmVlblJvdylcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGJ1ZmZlclJvdyA9IEBnZXRCdWZmZXJSb3coY3Vyc29yKVxuICAgIEBzZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCBAZ2V0QnVmZmVyUm93KGN1cnNvciksIGF1dG9zY3JvbGw6IGZhbHNlKVxuXG4gICAgaWYgY3Vyc29yLmlzTGFzdEN1cnNvcigpXG4gICAgICBpZiBAaXNTbW9vdGhTY3JvbGxFbmFibGVkKClcbiAgICAgICAgQHZpbVN0YXRlLmZpbmlzaFNjcm9sbEFuaW1hdGlvbigpXG5cbiAgICAgIGZpcnN0VmlzaWJpbGVTY3JlZW5Sb3cgPSBAZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgICBuZXdGaXJzdFZpc2liaWxlQnVmZmVyUm93ID0gQGVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coZmlyc3RWaXNpYmlsZVNjcmVlblJvdyArIEBnZXRBbW91bnRPZlJvd3MoKSlcbiAgICAgIG5ld0ZpcnN0VmlzaWJpbGVTY3JlZW5Sb3cgPSBAZWRpdG9yLnNjcmVlblJvd0ZvckJ1ZmZlclJvdyhuZXdGaXJzdFZpc2liaWxlQnVmZmVyUm93KVxuICAgICAgZG9uZSA9ID0+XG4gICAgICAgIEBlZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KG5ld0ZpcnN0VmlzaWJpbGVTY3JlZW5Sb3cpXG4gICAgICAgICMgW0ZJWE1FXSBzb21ldGltZXMsIHNjcm9sbFRvcCBpcyBub3QgdXBkYXRlZCwgY2FsbGluZyB0aGlzIGZpeC5cbiAgICAgICAgIyBJbnZlc3RpZ2F0ZSBhbmQgZmluZCBiZXR0ZXIgYXBwcm9hY2ggdGhlbiByZW1vdmUgdGhpcyB3b3JrYXJvdW5kLlxuICAgICAgICBAZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50Py51cGRhdGVTeW5jKClcblxuICAgICAgaWYgQGlzU21vb3RoU2Nyb2xsRW5hYmxlZCgpXG4gICAgICAgIEBzbW9vdGhTY3JvbGwoZmlyc3RWaXNpYmlsZVNjcmVlblJvdywgbmV3Rmlyc3RWaXNpYmlsZVNjcmVlblJvdywgZG9uZSlcbiAgICAgIGVsc2VcbiAgICAgICAgZG9uZSgpXG5cblxuIyBrZXltYXA6IGN0cmwtZlxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlbkRvd24gZXh0ZW5kcyBTY3JvbGxcbiAgQGV4dGVuZCh0cnVlKVxuICBhbW91bnRPZlBhZ2U6ICsxXG5cbiMga2V5bWFwOiBjdHJsLWJcbmNsYXNzIFNjcm9sbEZ1bGxTY3JlZW5VcCBleHRlbmRzIFNjcm9sbFxuICBAZXh0ZW5kKClcbiAgYW1vdW50T2ZQYWdlOiAtMVxuXG4jIGtleW1hcDogY3RybC1kXG5jbGFzcyBTY3JvbGxIYWxmU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbFxuICBAZXh0ZW5kKClcbiAgYW1vdW50T2ZQYWdlOiArMSAvIDJcblxuIyBrZXltYXA6IGN0cmwtdVxuY2xhc3MgU2Nyb2xsSGFsZlNjcmVlblVwIGV4dGVuZHMgU2Nyb2xsXG4gIEBleHRlbmQoKVxuICBhbW91bnRPZlBhZ2U6IC0xIC8gMlxuXG4jIEZpbmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBrZXltYXA6IGZcbmNsYXNzIEZpbmQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGJhY2t3YXJkczogZmFsc2VcbiAgaW5jbHVzaXZlOiB0cnVlXG4gIG9mZnNldDogMFxuICByZXF1aXJlSW5wdXQ6IHRydWVcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgQGZvY3VzSW5wdXQoKSB1bmxlc3MgQGlzQ29tcGxldGUoKVxuXG4gIGlzQmFja3dhcmRzOiAtPlxuICAgIEBiYWNrd2FyZHNcblxuICBnZXRQb2ludDogKGZyb21Qb2ludCkgLT5cbiAgICB7c3RhcnQsIGVuZH0gPSBAZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KGZyb21Qb2ludC5yb3cpXG5cbiAgICBvZmZzZXQgPSBpZiBAaXNCYWNrd2FyZHMoKSB0aGVuIEBvZmZzZXQgZWxzZSAtQG9mZnNldFxuICAgIHVuT2Zmc2V0ID0gLW9mZnNldCAqIEByZXBlYXRlZFxuICAgIGlmIEBpc0JhY2t3YXJkcygpXG4gICAgICBzY2FuUmFuZ2UgPSBbc3RhcnQsIGZyb21Qb2ludC50cmFuc2xhdGUoWzAsIHVuT2Zmc2V0XSldXG4gICAgICBtZXRob2QgPSAnYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UnXG4gICAgZWxzZVxuICAgICAgc2NhblJhbmdlID0gW2Zyb21Qb2ludC50cmFuc2xhdGUoWzAsIDEgKyB1bk9mZnNldF0pLCBlbmRdXG4gICAgICBtZXRob2QgPSAnc2NhbkluQnVmZmVyUmFuZ2UnXG5cbiAgICBwb2ludHMgPSBbXVxuICAgIEBlZGl0b3JbbWV0aG9kXSAvLy8je18uZXNjYXBlUmVnRXhwKEBpbnB1dCl9Ly8vZywgc2NhblJhbmdlLCAoe3JhbmdlfSkgLT5cbiAgICAgIHBvaW50cy5wdXNoKHJhbmdlLnN0YXJ0KVxuICAgIHBvaW50c1tAZ2V0Q291bnQoLTEpXT8udHJhbnNsYXRlKFswLCBvZmZzZXRdKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgcG9pbnQgPSBAZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgQHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgcG9pbnQpXG4gICAgQGdsb2JhbFN0YXRlLnNldCgnY3VycmVudEZpbmQnLCB0aGlzKSB1bmxlc3MgQHJlcGVhdGVkXG5cbiMga2V5bWFwOiBGXG5jbGFzcyBGaW5kQmFja3dhcmRzIGV4dGVuZHMgRmluZFxuICBAZXh0ZW5kKClcbiAgaW5jbHVzaXZlOiBmYWxzZVxuICBiYWNrd2FyZHM6IHRydWVcblxuIyBrZXltYXA6IHRcbmNsYXNzIFRpbGwgZXh0ZW5kcyBGaW5kXG4gIEBleHRlbmQoKVxuICBvZmZzZXQ6IDFcblxuICBnZXRQb2ludDogLT5cbiAgICBAcG9pbnQgPSBzdXBlclxuICAgIEBtb3ZlU3VjY2VlZGVkID0gQHBvaW50P1xuICAgIHJldHVybiBAcG9pbnRcblxuIyBrZXltYXA6IFRcbmNsYXNzIFRpbGxCYWNrd2FyZHMgZXh0ZW5kcyBUaWxsXG4gIEBleHRlbmQoKVxuICBpbmNsdXNpdmU6IGZhbHNlXG4gIGJhY2t3YXJkczogdHJ1ZVxuXG4jIE1hcmtcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBrZXltYXA6IGBcbmNsYXNzIE1vdmVUb01hcmsgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGp1bXA6IHRydWVcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIGlucHV0OiBudWxsICMgc2V0IHdoZW4gaW5zdGF0bnRpYXRlZCB2aWEgdmltU3RhdGU6Om1vdmVUb01hcmsoKVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICBAZm9jdXNJbnB1dCgpIHVubGVzcyBAaXNDb21wbGV0ZSgpXG5cbiAgZ2V0UG9pbnQ6IC0+XG4gICAgQHZpbVN0YXRlLm1hcmsuZ2V0KEBpbnB1dClcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGlmIHBvaW50ID0gQGdldFBvaW50KClcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgIGN1cnNvci5hdXRvc2Nyb2xsKGNlbnRlcjogdHJ1ZSlcblxuIyBrZXltYXA6ICdcbmNsYXNzIE1vdmVUb01hcmtMaW5lIGV4dGVuZHMgTW92ZVRvTWFya1xuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIGdldFBvaW50OiAtPlxuICAgIGlmIHBvaW50ID0gc3VwZXJcbiAgICAgIEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHBvaW50LnJvdylcblxuIyBGb2xkXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBmb2xkIHN0YXJ0XCJcbiAgd2lzZTogJ2NoYXJhY3Rlcndpc2UnXG4gIHdoaWNoOiAnc3RhcnQnXG4gIGRpcmVjdGlvbjogJ3ByZXYnXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEByb3dzID0gQGdldEZvbGRSb3dzKEB3aGljaClcbiAgICBAcm93cy5yZXZlcnNlKCkgaWYgQGRpcmVjdGlvbiBpcyAncHJldidcblxuICBnZXRGb2xkUm93czogKHdoaWNoKSAtPlxuICAgIGluZGV4ID0gaWYgd2hpY2ggaXMgJ3N0YXJ0JyB0aGVuIDAgZWxzZSAxXG4gICAgcm93cyA9IGdldENvZGVGb2xkUm93UmFuZ2VzKEBlZGl0b3IpLm1hcCAocm93UmFuZ2UpIC0+XG4gICAgICByb3dSYW5nZVtpbmRleF1cbiAgICBfLnNvcnRCeShfLnVuaXEocm93cyksIChyb3cpIC0+IHJvdylcblxuICBnZXRTY2FuUm93czogKGN1cnNvcikgLT5cbiAgICBjdXJzb3JSb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICBpc1ZhbGlkUm93ID0gc3dpdGNoIEBkaXJlY3Rpb25cbiAgICAgIHdoZW4gJ3ByZXYnIHRoZW4gKHJvdykgLT4gcm93IDwgY3Vyc29yUm93XG4gICAgICB3aGVuICduZXh0JyB0aGVuIChyb3cpIC0+IHJvdyA+IGN1cnNvclJvd1xuICAgIEByb3dzLmZpbHRlcihpc1ZhbGlkUm93KVxuXG4gIGRldGVjdFJvdzogKGN1cnNvcikgLT5cbiAgICBAZ2V0U2NhblJvd3MoY3Vyc29yKVswXVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIGlmIChyb3cgPSBAZGV0ZWN0Um93KGN1cnNvcikpP1xuICAgICAgICBtb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93KGN1cnNvciwgcm93KVxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZFN0YXJ0IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgZm9sZCBzdGFydFwiXG4gIGRpcmVjdGlvbjogJ25leHQnXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgc2FtZS1pbmRlbnRlZCBmb2xkIHN0YXJ0XCJcbiAgZGV0ZWN0Um93OiAoY3Vyc29yKSAtPlxuICAgIGJhc2VJbmRlbnRMZXZlbCA9IEBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgZm9yIHJvdyBpbiBAZ2V0U2NhblJvd3MoY3Vyc29yKVxuICAgICAgaWYgQGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KHJvdykgaXMgYmFzZUluZGVudExldmVsXG4gICAgICAgIHJldHVybiByb3dcbiAgICBudWxsXG5cbmNsYXNzIE1vdmVUb05leHRGb2xkU3RhcnRXaXRoU2FtZUluZGVudCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgc2FtZS1pbmRlbnRlZCBmb2xkIHN0YXJ0XCJcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkRW5kIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIGZvbGQgZW5kXCJcbiAgd2hpY2g6ICdlbmQnXG5cbmNsYXNzIE1vdmVUb05leHRGb2xkRW5kIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkRW5kXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IGZvbGQgZW5kXCJcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0Z1bmN0aW9uIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIGZ1bmN0aW9uXCJcbiAgZGlyZWN0aW9uOiAncHJldidcbiAgZGV0ZWN0Um93OiAoY3Vyc29yKSAtPlxuICAgIF8uZGV0ZWN0IEBnZXRTY2FuUm93cyhjdXJzb3IpLCAocm93KSA9PlxuICAgICAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyhAZWRpdG9yLCByb3cpXG5cbmNsYXNzIE1vdmVUb05leHRGdW5jdGlvbiBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb25cbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgZnVuY3Rpb25cIlxuICBkaXJlY3Rpb246ICduZXh0J1xuXG4jIFNjb3BlIGJhc2VkXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuICBkaXJlY3Rpb246ICdiYWNrd2FyZCdcbiAgc2NvcGU6ICcuJ1xuXG4gIGdldFBvaW50OiAoZnJvbVBvaW50KSAtPlxuICAgIGRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlKEBlZGl0b3IsIGZyb21Qb2ludCwgQGRpcmVjdGlvbiwgQHNjb3BlKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIEBzZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIEBnZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU3RyaW5nIGV4dGVuZHMgTW92ZVRvUG9zaXRpb25CeVNjb3BlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBzdHJpbmcoc2VhcmNoZWQgYnkgYHN0cmluZy5iZWdpbmAgc2NvcGUpXCJcbiAgZGlyZWN0aW9uOiAnYmFja3dhcmQnXG4gIHNjb3BlOiAnc3RyaW5nLmJlZ2luJ1xuXG5jbGFzcyBNb3ZlVG9OZXh0U3RyaW5nIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNTdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgc3RyaW5nKHNlYXJjaGVkIGJ5IGBzdHJpbmcuYmVnaW5gIHNjb3BlKVwiXG4gIGRpcmVjdGlvbjogJ2ZvcndhcmQnXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzTnVtYmVyIGV4dGVuZHMgTW92ZVRvUG9zaXRpb25CeVNjb3BlXG4gIEBleHRlbmQoKVxuICBkaXJlY3Rpb246ICdiYWNrd2FyZCdcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgbnVtYmVyKHNlYXJjaGVkIGJ5IGBjb25zdGFudC5udW1lcmljYCBzY29wZSlcIlxuICBzY29wZTogJ2NvbnN0YW50Lm51bWVyaWMnXG5cbmNsYXNzIE1vdmVUb05leHROdW1iZXIgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c051bWJlclxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBudW1iZXIoc2VhcmNoZWQgYnkgYGNvbnN0YW50Lm51bWVyaWNgIHNjb3BlKVwiXG4gIGRpcmVjdGlvbjogJ2ZvcndhcmQnXG5cbmNsYXNzIE1vdmVUb05leHRPY2N1cnJlbmNlIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICAjIEVuc3VyZSB0aGlzIGNvbW1hbmQgaXMgYXZhaWxhYmxlIHdoZW4gaGFzLW9jY3VycmVuY2VcbiAgQGNvbW1hbmRTY29wZTogJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5oYXMtb2NjdXJyZW5jZSdcbiAganVtcDogdHJ1ZVxuICBkaXJlY3Rpb246ICduZXh0J1xuXG4gIGdldFJhbmdlczogLT5cbiAgICBAdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VycygpLm1hcCAobWFya2VyKSAtPlxuICAgICAgbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcblxuICBleGVjdXRlOiAtPlxuICAgIEByYW5nZXMgPSBAZ2V0UmFuZ2VzKClcbiAgICBzdXBlclxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgaW5kZXggPSBAZ2V0SW5kZXgoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgaWYgaW5kZXg/XG4gICAgICBvZmZzZXQgPSBzd2l0Y2ggQGRpcmVjdGlvblxuICAgICAgICB3aGVuICduZXh0JyB0aGVuIEBnZXRDb3VudCgtMSlcbiAgICAgICAgd2hlbiAncHJldmlvdXMnIHRoZW4gLUBnZXRDb3VudCgtMSlcbiAgICAgIHJhbmdlID0gQHJhbmdlc1tnZXRJbmRleChpbmRleCArIG9mZnNldCwgQHJhbmdlcyldXG4gICAgICBwb2ludCA9IHJhbmdlLnN0YXJ0XG5cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludCwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiAgICAgIGlmIGN1cnNvci5pc0xhc3RDdXJzb3IoKVxuICAgICAgICBAZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhwb2ludC5yb3cpXG4gICAgICAgIHNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBwb2ludClcblxuICAgICAgaWYgQGdldENvbmZpZygnZmxhc2hPbk1vdmVUb09jY3VycmVuY2UnKVxuICAgICAgICBAdmltU3RhdGUuZmxhc2gocmFuZ2UsIHR5cGU6ICdzZWFyY2gnKVxuXG4gIGdldEluZGV4OiAoZnJvbVBvaW50KSAtPlxuICAgIGZvciByYW5nZSwgaSBpbiBAcmFuZ2VzIHdoZW4gcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tUG9pbnQpXG4gICAgICByZXR1cm4gaVxuICAgIDBcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlIGV4dGVuZHMgTW92ZVRvTmV4dE9jY3VycmVuY2VcbiAgQGV4dGVuZCgpXG4gIGRpcmVjdGlvbjogJ3ByZXZpb3VzJ1xuXG4gIGdldEluZGV4OiAoZnJvbVBvaW50KSAtPlxuICAgIGZvciByYW5nZSwgaSBpbiBAcmFuZ2VzIGJ5IC0xIHdoZW4gcmFuZ2UuZW5kLmlzTGVzc1RoYW4oZnJvbVBvaW50KVxuICAgICAgcmV0dXJuIGlcbiAgICBAcmFuZ2VzLmxlbmd0aCAtIDFcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGtleW1hcDogJVxuY2xhc3MgTW92ZVRvUGFpciBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgaW5jbHVzaXZlOiB0cnVlXG4gIGp1bXA6IHRydWVcbiAgbWVtYmVyOiBbJ1BhcmVudGhlc2lzJywgJ0N1cmx5QnJhY2tldCcsICdTcXVhcmVCcmFja2V0JywgJ0FuZ2xlQnJhY2tldCddXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBAZ2V0UG9pbnQoY3Vyc29yKSlcblxuICBnZXRQb2ludEZvclRhZzogKHBvaW50KSAtPlxuICAgIHBhaXJJbmZvID0gQG5ldyhcIkFUYWdcIikuZ2V0UGFpckluZm8ocG9pbnQpXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIHBhaXJJbmZvP1xuICAgIHtvcGVuUmFuZ2UsIGNsb3NlUmFuZ2V9ID0gcGFpckluZm9cbiAgICBvcGVuUmFuZ2UgPSBvcGVuUmFuZ2UudHJhbnNsYXRlKFswLCArMV0sIFswLCAtMV0pXG4gICAgY2xvc2VSYW5nZSA9IGNsb3NlUmFuZ2UudHJhbnNsYXRlKFswLCArMV0sIFswLCAtMV0pXG4gICAgcmV0dXJuIGNsb3NlUmFuZ2Uuc3RhcnQgaWYgb3BlblJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpIGFuZCAobm90IHBvaW50LmlzRXF1YWwob3BlblJhbmdlLmVuZCkpXG4gICAgcmV0dXJuIG9wZW5SYW5nZS5zdGFydCBpZiBjbG9zZVJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpIGFuZCAobm90IHBvaW50LmlzRXF1YWwoY2xvc2VSYW5nZS5lbmQpKVxuXG4gIGdldFBvaW50OiAoY3Vyc29yKSAtPlxuICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBjdXJzb3JSb3cgPSBjdXJzb3JQb3NpdGlvbi5yb3dcbiAgICByZXR1cm4gcG9pbnQgaWYgcG9pbnQgPSBAZ2V0UG9pbnRGb3JUYWcoY3Vyc29yUG9zaXRpb24pXG5cbiAgICAjIEFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIHJldHVybiBmb3J3YXJkaW5nIHJhbmdlIG9yIGVuY2xvc2luZyByYW5nZS5cbiAgICByYW5nZSA9IEBuZXcoXCJBQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiLCB7QG1lbWJlcn0pLmdldFJhbmdlKGN1cnNvci5zZWxlY3Rpb24pXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIHJhbmdlP1xuICAgIHtzdGFydCwgZW5kfSA9IHJhbmdlXG4gICAgaWYgKHN0YXJ0LnJvdyBpcyBjdXJzb3JSb3cpIGFuZCBzdGFydC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChjdXJzb3JQb3NpdGlvbilcbiAgICAgICMgRm9yd2FyZGluZyByYW5nZSBmb3VuZFxuICAgICAgZW5kLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIGVsc2UgaWYgZW5kLnJvdyBpcyBjdXJzb3JQb3NpdGlvbi5yb3dcbiAgICAgICMgRW5jbG9zaW5nIHJhbmdlIHdhcyByZXR1cm5lZFxuICAgICAgIyBXZSBtb3ZlIHRvIHN0YXJ0KCBvcGVuLXBhaXIgKSBvbmx5IHdoZW4gY2xvc2UtcGFpciB3YXMgYXQgc2FtZSByb3cgYXMgY3Vyc29yLXJvdy5cbiAgICAgIHN0YXJ0XG4iXX0=
