(function() {
  var ArgumentsSplitter, Disposable, Point, Range, _, addClassList, adjustIndentWithKeepingLayout, assertWithException, buildWordPatternByCursor, collectRangeInBufferRow, debug, detectScopeStartPositionForScope, ensureEndsWithNewLineForBufferRow, expandRangeToWhiteSpaces, findRangeContainsPoint, findRangeInBufferRow, forEachPaneAxis, fs, getAncestors, getBeginningOfWordBufferPosition, getBufferRangeForRowRange, getBufferRows, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getEndOfLineForBufferRow, getEndOfWordBufferPosition, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getFoldEndRowForRow, getFoldInfoByKind, getFoldRangesWithIndent, getFoldRowRanges, getFoldRowRangesContainedByFoldStartsAtRow, getIndentLevelForBufferRow, getIndex, getKeyBindingForCommand, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getLeftCharacterForBufferPosition, getLineTextToBufferPosition, getNonWordCharactersForCursor, getPackage, getRangeByTranslatePointAndClip, getRightCharacterForBufferPosition, getScopesForTokenizedLine, getSubwordPatternAtBufferPosition, getTextInScreenRange, getTokenizedLineForRow, getTraversalForText, getValidVimBufferRow, getValidVimScreenRow, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, getVisibleEditors, getWordBufferRangeAndKindAtBufferPosition, getWordBufferRangeAtBufferPosition, getWordPatternAtBufferPosition, humanizeBufferRange, include, insertTextAtBufferPosition, isEmpty, isEmptyRow, isEndsWithNewLineForBufferRow, isEscapedCharRange, isFunctionScope, isIncludeFunctionScopeForRow, isLeadingWhiteSpaceRange, isLinewiseRange, isNotEmpty, isNotLeadingWhiteSpaceRange, isNotSingleLineRange, isSingleLineRange, isSingleLineText, limitNumber, matchScopes, modifyClassList, moveCursor, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpScreen, negateFunction, pointIsAtEndOfLine, pointIsAtEndOfLineAtNonEmptyRow, pointIsAtVimEndOfFile, pointIsOnWhiteSpace, rangeContainsPointWithEndExclusive, ref, removeClassList, replaceDecorationClassBy, saveEditorState, scanEditor, scanEditorInDirection, scanForScopeStart, searchByProjectFind, setBufferColumn, setBufferRow, settings, shouldPreventWrapLine, shrinkRangeEndToBeforeNewLine, smartScrollToBufferPosition, sortRanges, splitAndJoinBy, splitArguments, splitTextByNewLine, toggleCaseForCharacter, toggleClassList, translatePointAndClip, traverseTextFromPoint, trimRange,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = null;

  settings = require('./settings');

  ref = require('atom'), Disposable = ref.Disposable, Range = ref.Range, Point = ref.Point;

  _ = require('underscore-plus');

  assertWithException = function(condition, message, fn) {
    return atom.assert(condition, message, function(error) {
      throw new Error(error.message);
    });
  };

  getAncestors = function(obj) {
    var ancestors, current, ref1;
    ancestors = [];
    current = obj;
    while (true) {
      ancestors.push(current);
      current = (ref1 = current.__super__) != null ? ref1.constructor : void 0;
      if (!current) {
        break;
      }
    }
    return ancestors;
  };

  getKeyBindingForCommand = function(command, arg) {
    var j, keymap, keymapPath, keymaps, keystrokes, len, packageName, results, selector;
    packageName = arg.packageName;
    results = null;
    keymaps = atom.keymaps.getKeyBindings();
    if (packageName != null) {
      keymapPath = atom.packages.getActivePackage(packageName).getKeymapPaths().pop();
      keymaps = keymaps.filter(function(arg1) {
        var source;
        source = arg1.source;
        return source === keymapPath;
      });
    }
    for (j = 0, len = keymaps.length; j < len; j++) {
      keymap = keymaps[j];
      if (!(keymap.command === command)) {
        continue;
      }
      keystrokes = keymap.keystrokes, selector = keymap.selector;
      keystrokes = keystrokes.replace(/shift-/, '');
      (results != null ? results : results = []).push({
        keystrokes: keystrokes,
        selector: selector
      });
    }
    return results;
  };

  include = function(klass, module) {
    var key, results1, value;
    results1 = [];
    for (key in module) {
      value = module[key];
      results1.push(klass.prototype[key] = value);
    }
    return results1;
  };

  debug = function() {
    var filePath, messages;
    messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (!settings.get('debug')) {
      return;
    }
    switch (settings.get('debugOutput')) {
      case 'console':
        return console.log.apply(console, messages);
      case 'file':
        if (fs == null) {
          fs = require('fs-plus');
        }
        filePath = fs.normalize(settings.get('debugOutputFilePath'));
        if (fs.existsSync(filePath)) {
          return fs.appendFileSync(filePath, messages + "\n");
        }
    }
  };

  saveEditorState = function(editor) {
    var editorElement, foldStartRows, scrollTop;
    editorElement = editor.element;
    scrollTop = editorElement.getScrollTop();
    foldStartRows = editor.displayLayer.foldsMarkerLayer.findMarkers({}).map(function(m) {
      return m.getStartPosition().row;
    });
    return function() {
      var j, len, ref1, row;
      ref1 = foldStartRows.reverse();
      for (j = 0, len = ref1.length; j < len; j++) {
        row = ref1[j];
        if (!editor.isFoldedAtBufferRow(row)) {
          editor.foldBufferRow(row);
        }
      }
      return editorElement.setScrollTop(scrollTop);
    };
  };

  isLinewiseRange = function(arg) {
    var end, ref1, start;
    start = arg.start, end = arg.end;
    return (start.row !== end.row) && ((start.column === (ref1 = end.column) && ref1 === 0));
  };

  isEndsWithNewLineForBufferRow = function(editor, row) {
    var end, ref1, start;
    ref1 = editor.bufferRangeForBufferRow(row, {
      includeNewline: true
    }), start = ref1.start, end = ref1.end;
    return start.row !== end.row;
  };

  sortRanges = function(collection) {
    return collection.sort(function(a, b) {
      return a.compare(b);
    });
  };

  getIndex = function(index, list) {
    var length;
    length = list.length;
    if (length === 0) {
      return -1;
    } else {
      index = index % length;
      if (index >= 0) {
        return index;
      } else {
        return length + index;
      }
    }
  };

  getVisibleBufferRange = function(editor) {
    var endRow, ref1, startRow;
    ref1 = editor.element.getVisibleRowRange(), startRow = ref1[0], endRow = ref1[1];
    if (!((startRow != null) && (endRow != null))) {
      return null;
    }
    startRow = editor.bufferRowForScreenRow(startRow);
    endRow = editor.bufferRowForScreenRow(endRow);
    return new Range([startRow, 0], [endRow, 2e308]);
  };

  getVisibleEditors = function() {
    var editor, j, len, pane, ref1, results1;
    ref1 = atom.workspace.getPanes();
    results1 = [];
    for (j = 0, len = ref1.length; j < len; j++) {
      pane = ref1[j];
      if (editor = pane.getActiveEditor()) {
        results1.push(editor);
      }
    }
    return results1;
  };

  getEndOfLineForBufferRow = function(editor, row) {
    return editor.bufferRangeForBufferRow(row).end;
  };

  pointIsAtEndOfLine = function(editor, point) {
    point = Point.fromObject(point);
    return getEndOfLineForBufferRow(editor, point.row).isEqual(point);
  };

  pointIsOnWhiteSpace = function(editor, point) {
    var char;
    char = getRightCharacterForBufferPosition(editor, point);
    return !/\S/.test(char);
  };

  pointIsAtEndOfLineAtNonEmptyRow = function(editor, point) {
    point = Point.fromObject(point);
    return point.column !== 0 && pointIsAtEndOfLine(editor, point);
  };

  pointIsAtVimEndOfFile = function(editor, point) {
    return getVimEofBufferPosition(editor).isEqual(point);
  };

  isEmptyRow = function(editor, row) {
    return editor.bufferRangeForBufferRow(row).isEmpty();
  };

  getRightCharacterForBufferPosition = function(editor, point, amount) {
    if (amount == null) {
      amount = 1;
    }
    return editor.getTextInBufferRange(Range.fromPointWithDelta(point, 0, amount));
  };

  getLeftCharacterForBufferPosition = function(editor, point, amount) {
    if (amount == null) {
      amount = 1;
    }
    return editor.getTextInBufferRange(Range.fromPointWithDelta(point, 0, -amount));
  };

  getTextInScreenRange = function(editor, screenRange) {
    var bufferRange;
    bufferRange = editor.bufferRangeForScreenRange(screenRange);
    return editor.getTextInBufferRange(bufferRange);
  };

  getNonWordCharactersForCursor = function(cursor) {
    var scope;
    if (cursor.getNonWordCharacters != null) {
      return cursor.getNonWordCharacters();
    } else {
      scope = cursor.getScopeDescriptor().getScopesArray();
      return atom.config.get('editor.nonWordCharacters', {
        scope: scope
      });
    }
  };

  moveCursorToNextNonWhitespace = function(cursor) {
    var editor, originalPoint, point, vimEof;
    originalPoint = cursor.getBufferPosition();
    editor = cursor.editor;
    vimEof = getVimEofBufferPosition(editor);
    while (pointIsOnWhiteSpace(editor, point = cursor.getBufferPosition()) && !point.isGreaterThanOrEqual(vimEof)) {
      cursor.moveRight();
    }
    return !originalPoint.isEqual(cursor.getBufferPosition());
  };

  getBufferRows = function(editor, arg) {
    var direction, endRow, j, k, ref1, ref2, results1, results2, startRow;
    startRow = arg.startRow, direction = arg.direction;
    switch (direction) {
      case 'previous':
        if (startRow <= 0) {
          return [];
        } else {
          return (function() {
            results1 = [];
            for (var j = ref1 = startRow - 1; ref1 <= 0 ? j <= 0 : j >= 0; ref1 <= 0 ? j++ : j--){ results1.push(j); }
            return results1;
          }).apply(this);
        }
        break;
      case 'next':
        endRow = getVimLastBufferRow(editor);
        if (startRow >= endRow) {
          return [];
        } else {
          return (function() {
            results2 = [];
            for (var k = ref2 = startRow + 1; ref2 <= endRow ? k <= endRow : k >= endRow; ref2 <= endRow ? k++ : k--){ results2.push(k); }
            return results2;
          }).apply(this);
        }
    }
  };

  getVimEofBufferPosition = function(editor) {
    var eof;
    eof = editor.getEofBufferPosition();
    if ((eof.row === 0) || (eof.column > 0)) {
      return eof;
    } else {
      return getEndOfLineForBufferRow(editor, eof.row - 1);
    }
  };

  getVimEofScreenPosition = function(editor) {
    return editor.screenPositionForBufferPosition(getVimEofBufferPosition(editor));
  };

  getVimLastBufferRow = function(editor) {
    return getVimEofBufferPosition(editor).row;
  };

  getVimLastScreenRow = function(editor) {
    return getVimEofScreenPosition(editor).row;
  };

  getFirstVisibleScreenRow = function(editor) {
    return editor.element.getFirstVisibleScreenRow();
  };

  getLastVisibleScreenRow = function(editor) {
    return editor.element.getLastVisibleScreenRow();
  };

  getFirstCharacterPositionForBufferRow = function(editor, row) {
    var range, ref1;
    range = findRangeInBufferRow(editor, /\S/, row);
    return (ref1 = range != null ? range.start : void 0) != null ? ref1 : new Point(row, 0);
  };

  trimRange = function(editor, scanRange) {
    var end, pattern, ref1, setEnd, setStart, start;
    pattern = /\S/;
    ref1 = [], start = ref1[0], end = ref1[1];
    setStart = function(arg) {
      var range;
      range = arg.range;
      return start = range.start, range;
    };
    setEnd = function(arg) {
      var range;
      range = arg.range;
      return end = range.end, range;
    };
    editor.scanInBufferRange(pattern, scanRange, setStart);
    if (start != null) {
      editor.backwardsScanInBufferRange(pattern, scanRange, setEnd);
    }
    if ((start != null) && (end != null)) {
      return new Range(start, end);
    } else {
      return scanRange;
    }
  };

  setBufferRow = function(cursor, row, options) {
    var column, ref1;
    column = (ref1 = cursor.goalColumn) != null ? ref1 : cursor.getBufferColumn();
    cursor.setBufferPosition([row, column], options);
    return cursor.goalColumn = column;
  };

  setBufferColumn = function(cursor, column) {
    return cursor.setBufferPosition([cursor.getBufferRow(), column]);
  };

  moveCursor = function(cursor, arg, fn) {
    var goalColumn, preserveGoalColumn;
    preserveGoalColumn = arg.preserveGoalColumn;
    goalColumn = cursor.goalColumn;
    fn(cursor);
    if (preserveGoalColumn && (goalColumn != null)) {
      return cursor.goalColumn = goalColumn;
    }
  };

  shouldPreventWrapLine = function(cursor) {
    var column, ref1, row, tabLength, text;
    ref1 = cursor.getBufferPosition(), row = ref1.row, column = ref1.column;
    if (atom.config.get('editor.softTabs')) {
      tabLength = atom.config.get('editor.tabLength');
      if ((0 < column && column < tabLength)) {
        text = cursor.editor.getTextInBufferRange([[row, 0], [row, tabLength]]);
        return /^\s+$/.test(text);
      } else {
        return false;
      }
    }
  };

  moveCursorLeft = function(cursor, options) {
    var allowWrap, motion, needSpecialCareToPreventWrapLine;
    if (options == null) {
      options = {};
    }
    allowWrap = options.allowWrap, needSpecialCareToPreventWrapLine = options.needSpecialCareToPreventWrapLine;
    delete options.allowWrap;
    if (needSpecialCareToPreventWrapLine) {
      if (shouldPreventWrapLine(cursor)) {
        return;
      }
    }
    if (!cursor.isAtBeginningOfLine() || allowWrap) {
      motion = function(cursor) {
        return cursor.moveLeft();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorRight = function(cursor, options) {
    var allowWrap, motion;
    if (options == null) {
      options = {};
    }
    allowWrap = options.allowWrap;
    delete options.allowWrap;
    if (!cursor.isAtEndOfLine() || allowWrap) {
      motion = function(cursor) {
        return cursor.moveRight();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorUpScreen = function(cursor, options) {
    var motion;
    if (options == null) {
      options = {};
    }
    if (cursor.getScreenRow() !== 0) {
      motion = function(cursor) {
        return cursor.moveUp();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorDownScreen = function(cursor, options) {
    var motion;
    if (options == null) {
      options = {};
    }
    if (getVimLastScreenRow(cursor.editor) !== cursor.getScreenRow()) {
      motion = function(cursor) {
        return cursor.moveDown();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorToFirstCharacterAtRow = function(cursor, row) {
    cursor.setBufferPosition([row, 0]);
    return cursor.moveToFirstCharacterOfLine();
  };

  getValidVimBufferRow = function(editor, row) {
    return limitNumber(row, {
      min: 0,
      max: getVimLastBufferRow(editor)
    });
  };

  getValidVimScreenRow = function(editor, row) {
    return limitNumber(row, {
      min: 0,
      max: getVimLastScreenRow(editor)
    });
  };

  getLineTextToBufferPosition = function(editor, arg, arg1) {
    var column, exclusive, row;
    row = arg.row, column = arg.column;
    exclusive = (arg1 != null ? arg1 : {}).exclusive;
    if (exclusive != null ? exclusive : true) {
      return editor.lineTextForBufferRow(row).slice(0, column);
    } else {
      return editor.lineTextForBufferRow(row).slice(0, +column + 1 || 9e9);
    }
  };

  getIndentLevelForBufferRow = function(editor, row) {
    return editor.indentLevelForLine(editor.lineTextForBufferRow(row));
  };

  getCodeFoldRowRanges = function(editor) {
    var j, ref1, results1;
    return (function() {
      results1 = [];
      for (var j = 0, ref1 = editor.getLastBufferRow(); 0 <= ref1 ? j <= ref1 : j >= ref1; 0 <= ref1 ? j++ : j--){ results1.push(j); }
      return results1;
    }).apply(this).map(function(row) {
      return editor.languageMode.rowRangeForCodeFoldAtBufferRow(row);
    }).filter(function(rowRange) {
      return (rowRange != null) && (rowRange[0] != null) && (rowRange[1] != null);
    });
  };

  getCodeFoldRowRangesContainesForRow = function(editor, bufferRow, arg) {
    var includeStartRow;
    includeStartRow = (arg != null ? arg : {}).includeStartRow;
    if (includeStartRow == null) {
      includeStartRow = true;
    }
    return getCodeFoldRowRanges(editor).filter(function(arg1) {
      var endRow, startRow;
      startRow = arg1[0], endRow = arg1[1];
      if (includeStartRow) {
        return (startRow <= bufferRow && bufferRow <= endRow);
      } else {
        return (startRow < bufferRow && bufferRow <= endRow);
      }
    });
  };

  getFoldRowRangesContainedByFoldStartsAtRow = function(editor, row) {
    var endRow, j, ref1, results1, seen, startRow;
    if (!editor.isFoldableAtBufferRow(row)) {
      return null;
    }
    ref1 = editor.languageMode.rowRangeForFoldAtBufferRow(row), startRow = ref1[0], endRow = ref1[1];
    seen = {};
    return (function() {
      results1 = [];
      for (var j = startRow; startRow <= endRow ? j <= endRow : j >= endRow; startRow <= endRow ? j++ : j--){ results1.push(j); }
      return results1;
    }).apply(this).map(function(row) {
      return editor.languageMode.rowRangeForFoldAtBufferRow(row);
    }).filter(function(rowRange) {
      return (rowRange != null) && (rowRange[0] != null) && (rowRange[1] != null);
    }).filter(function(rowRange) {
      if (seen[rowRange]) {
        return false;
      } else {
        return seen[rowRange] = true;
      }
    });
  };

  getFoldRowRanges = function(editor) {
    var j, ref1, results1, seen;
    seen = {};
    return (function() {
      results1 = [];
      for (var j = 0, ref1 = editor.getLastBufferRow(); 0 <= ref1 ? j <= ref1 : j >= ref1; 0 <= ref1 ? j++ : j--){ results1.push(j); }
      return results1;
    }).apply(this).map(function(row) {
      return editor.languageMode.rowRangeForCodeFoldAtBufferRow(row);
    }).filter(function(rowRange) {
      return (rowRange != null) && (rowRange[0] != null) && (rowRange[1] != null);
    }).filter(function(rowRange) {
      if (seen[rowRange]) {
        return false;
      } else {
        return seen[rowRange] = true;
      }
    });
  };

  getFoldRangesWithIndent = function(editor) {
    return getFoldRowRanges(editor).map(function(arg) {
      var endRow, indent, startRow;
      startRow = arg[0], endRow = arg[1];
      indent = editor.indentationForBufferRow(startRow);
      return {
        startRow: startRow,
        endRow: endRow,
        indent: indent
      };
    });
  };

  getFoldInfoByKind = function(editor) {
    var foldInfoByKind, j, len, ref1, rowRangeWithIndent, updateFoldInfo;
    foldInfoByKind = {};
    updateFoldInfo = function(kind, rowRangeWithIndent) {
      var foldInfo, indent, ref1, ref2;
      foldInfo = (foldInfoByKind[kind] != null ? foldInfoByKind[kind] : foldInfoByKind[kind] = {});
      if (foldInfo.rowRangesWithIndent == null) {
        foldInfo.rowRangesWithIndent = [];
      }
      foldInfo.rowRangesWithIndent.push(rowRangeWithIndent);
      indent = rowRangeWithIndent.indent;
      foldInfo.minIndent = Math.min((ref1 = foldInfo.minIndent) != null ? ref1 : indent, indent);
      return foldInfo.maxIndent = Math.max((ref2 = foldInfo.maxIndent) != null ? ref2 : indent, indent);
    };
    ref1 = getFoldRangesWithIndent(editor);
    for (j = 0, len = ref1.length; j < len; j++) {
      rowRangeWithIndent = ref1[j];
      updateFoldInfo('allFold', rowRangeWithIndent);
      if (editor.isFoldedAtBufferRow(rowRangeWithIndent.startRow)) {
        updateFoldInfo('folded', rowRangeWithIndent);
      } else {
        updateFoldInfo('unfolded', rowRangeWithIndent);
      }
    }
    return foldInfoByKind;
  };

  getBufferRangeForRowRange = function(editor, rowRange) {
    var endRange, ref1, startRange;
    ref1 = rowRange.map(function(row) {
      return editor.bufferRangeForBufferRow(row, {
        includeNewline: true
      });
    }), startRange = ref1[0], endRange = ref1[1];
    return startRange.union(endRange);
  };

  getTokenizedLineForRow = function(editor, row) {
    return editor.tokenizedBuffer.tokenizedLineForRow(row);
  };

  getScopesForTokenizedLine = function(line) {
    var j, len, ref1, results1, tag;
    ref1 = line.tags;
    results1 = [];
    for (j = 0, len = ref1.length; j < len; j++) {
      tag = ref1[j];
      if (tag < 0 && (tag % 2 === -1)) {
        results1.push(atom.grammars.scopeForId(tag));
      }
    }
    return results1;
  };

  scanForScopeStart = function(editor, fromPoint, direction, fn) {
    var column, continueScan, isValidToken, j, k, l, len, len1, len2, position, ref1, result, results, row, scanRows, scope, stop, tag, tokenIterator, tokenizedLine;
    fromPoint = Point.fromObject(fromPoint);
    scanRows = (function() {
      var j, k, ref1, ref2, ref3, results1, results2;
      switch (direction) {
        case 'forward':
          return (function() {
            results1 = [];
            for (var j = ref1 = fromPoint.row, ref2 = editor.getLastBufferRow(); ref1 <= ref2 ? j <= ref2 : j >= ref2; ref1 <= ref2 ? j++ : j--){ results1.push(j); }
            return results1;
          }).apply(this);
        case 'backward':
          return (function() {
            results2 = [];
            for (var k = ref3 = fromPoint.row; ref3 <= 0 ? k <= 0 : k >= 0; ref3 <= 0 ? k++ : k--){ results2.push(k); }
            return results2;
          }).apply(this);
      }
    })();
    continueScan = true;
    stop = function() {
      return continueScan = false;
    };
    isValidToken = (function() {
      switch (direction) {
        case 'forward':
          return function(arg) {
            var position;
            position = arg.position;
            return position.isGreaterThan(fromPoint);
          };
        case 'backward':
          return function(arg) {
            var position;
            position = arg.position;
            return position.isLessThan(fromPoint);
          };
      }
    })();
    for (j = 0, len = scanRows.length; j < len; j++) {
      row = scanRows[j];
      if (!(tokenizedLine = getTokenizedLineForRow(editor, row))) {
        continue;
      }
      column = 0;
      results = [];
      tokenIterator = tokenizedLine.getTokenIterator();
      ref1 = tokenizedLine.tags;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        tag = ref1[k];
        tokenIterator.next();
        if (tag < 0) {
          scope = atom.grammars.scopeForId(tag);
          if ((tag % 2) === 0) {
            null;
          } else {
            position = new Point(row, column);
            results.push({
              scope: scope,
              position: position,
              stop: stop
            });
          }
        } else {
          column += tag;
        }
      }
      results = results.filter(isValidToken);
      if (direction === 'backward') {
        results.reverse();
      }
      for (l = 0, len2 = results.length; l < len2; l++) {
        result = results[l];
        fn(result);
        if (!continueScan) {
          return;
        }
      }
      if (!continueScan) {
        return;
      }
    }
  };

  detectScopeStartPositionForScope = function(editor, fromPoint, direction, scope) {
    var point;
    point = null;
    scanForScopeStart(editor, fromPoint, direction, function(info) {
      if (info.scope.search(scope) >= 0) {
        info.stop();
        return point = info.position;
      }
    });
    return point;
  };

  isIncludeFunctionScopeForRow = function(editor, row) {
    var tokenizedLine;
    if (tokenizedLine = getTokenizedLineForRow(editor, row)) {
      return getScopesForTokenizedLine(tokenizedLine).some(function(scope) {
        return isFunctionScope(editor, scope);
      });
    } else {
      return false;
    }
  };

  isFunctionScope = function(editor, scope) {
    var pattern, scopes;
    switch (editor.getGrammar().scopeName) {
      case 'source.go':
      case 'source.elixir':
        scopes = ['entity.name.function'];
        break;
      case 'source.ruby':
        scopes = ['meta.function.', 'meta.class.', 'meta.module.'];
        break;
      default:
        scopes = ['meta.function.', 'meta.class.'];
    }
    pattern = new RegExp('^' + scopes.map(_.escapeRegExp).join('|'));
    return pattern.test(scope);
  };

  smartScrollToBufferPosition = function(editor, point) {
    var center, editorAreaHeight, editorElement, onePageDown, onePageUp, target;
    editorElement = editor.element;
    editorAreaHeight = editor.getLineHeightInPixels() * (editor.getRowsPerPage() - 1);
    onePageUp = editorElement.getScrollTop() - editorAreaHeight;
    onePageDown = editorElement.getScrollBottom() + editorAreaHeight;
    target = editorElement.pixelPositionForBufferPosition(point).top;
    center = (onePageDown < target) || (target < onePageUp);
    return editor.scrollToBufferPosition(point, {
      center: center
    });
  };

  matchScopes = function(editorElement, scopes) {
    var className, classNames, classes, containsCount, j, k, len, len1;
    classes = scopes.map(function(scope) {
      return scope.split('.');
    });
    for (j = 0, len = classes.length; j < len; j++) {
      classNames = classes[j];
      containsCount = 0;
      for (k = 0, len1 = classNames.length; k < len1; k++) {
        className = classNames[k];
        if (editorElement.classList.contains(className)) {
          containsCount += 1;
        }
      }
      if (containsCount === classNames.length) {
        return true;
      }
    }
    return false;
  };

  isSingleLineText = function(text) {
    return text.split(/\n|\r\n/).length === 1;
  };

  getWordBufferRangeAndKindAtBufferPosition = function(editor, point, options) {
    var characterAtPoint, cursor, kind, nonWordCharacters, nonWordRegex, range, ref1, singleNonWordChar, source, wordRegex;
    if (options == null) {
      options = {};
    }
    singleNonWordChar = options.singleNonWordChar, wordRegex = options.wordRegex, nonWordCharacters = options.nonWordCharacters, cursor = options.cursor;
    if ((wordRegex == null) || (nonWordCharacters == null)) {
      if (cursor == null) {
        cursor = editor.getLastCursor();
      }
      ref1 = _.extend(options, buildWordPatternByCursor(cursor, options)), wordRegex = ref1.wordRegex, nonWordCharacters = ref1.nonWordCharacters;
    }
    if (singleNonWordChar == null) {
      singleNonWordChar = true;
    }
    characterAtPoint = getRightCharacterForBufferPosition(editor, point);
    nonWordRegex = new RegExp("[" + (_.escapeRegExp(nonWordCharacters)) + "]+");
    if (/\s/.test(characterAtPoint)) {
      source = "[\t ]+";
      kind = 'white-space';
      wordRegex = new RegExp(source);
    } else if (nonWordRegex.test(characterAtPoint) && !wordRegex.test(characterAtPoint)) {
      kind = 'non-word';
      if (singleNonWordChar) {
        source = _.escapeRegExp(characterAtPoint);
        wordRegex = new RegExp(source);
      } else {
        wordRegex = nonWordRegex;
      }
    } else {
      kind = 'word';
    }
    range = getWordBufferRangeAtBufferPosition(editor, point, {
      wordRegex: wordRegex
    });
    return {
      kind: kind,
      range: range
    };
  };

  getWordPatternAtBufferPosition = function(editor, point, options) {
    var boundarizeForWord, endBoundary, kind, pattern, range, ref1, ref2, startBoundary, text;
    if (options == null) {
      options = {};
    }
    boundarizeForWord = (ref1 = options.boundarizeForWord) != null ? ref1 : true;
    delete options.boundarizeForWord;
    ref2 = getWordBufferRangeAndKindAtBufferPosition(editor, point, options), range = ref2.range, kind = ref2.kind;
    text = editor.getTextInBufferRange(range);
    pattern = _.escapeRegExp(text);
    if (kind === 'word' && boundarizeForWord) {
      startBoundary = /^\w/.test(text) ? "\\b" : '';
      endBoundary = /\w$/.test(text) ? "\\b" : '';
      pattern = startBoundary + pattern + endBoundary;
    }
    return new RegExp(pattern, 'g');
  };

  getSubwordPatternAtBufferPosition = function(editor, point, options) {
    if (options == null) {
      options = {};
    }
    options = {
      wordRegex: editor.getLastCursor().subwordRegExp(),
      boundarizeForWord: false
    };
    return getWordPatternAtBufferPosition(editor, point, options);
  };

  buildWordPatternByCursor = function(cursor, arg) {
    var nonWordCharacters, wordRegex;
    wordRegex = arg.wordRegex;
    nonWordCharacters = getNonWordCharactersForCursor(cursor);
    if (wordRegex == null) {
      wordRegex = new RegExp("^[\t ]*$|[^\\s" + (_.escapeRegExp(nonWordCharacters)) + "]+");
    }
    return {
      wordRegex: wordRegex,
      nonWordCharacters: nonWordCharacters
    };
  };

  getBeginningOfWordBufferPosition = function(editor, point, arg) {
    var found, scanRange, wordRegex;
    wordRegex = (arg != null ? arg : {}).wordRegex;
    scanRange = [[point.row, 0], point];
    found = null;
    editor.backwardsScanInBufferRange(wordRegex, scanRange, function(arg1) {
      var matchText, range, stop;
      range = arg1.range, matchText = arg1.matchText, stop = arg1.stop;
      if (matchText === '' && range.start.column !== 0) {
        return;
      }
      if (range.start.isLessThan(point)) {
        if (range.end.isGreaterThanOrEqual(point)) {
          found = range.start;
        }
        return stop();
      }
    });
    return found != null ? found : point;
  };

  getEndOfWordBufferPosition = function(editor, point, arg) {
    var found, scanRange, wordRegex;
    wordRegex = (arg != null ? arg : {}).wordRegex;
    scanRange = [point, [point.row, 2e308]];
    found = null;
    editor.scanInBufferRange(wordRegex, scanRange, function(arg1) {
      var matchText, range, stop;
      range = arg1.range, matchText = arg1.matchText, stop = arg1.stop;
      if (matchText === '' && range.start.column !== 0) {
        return;
      }
      if (range.end.isGreaterThan(point)) {
        if (range.start.isLessThanOrEqual(point)) {
          found = range.end;
        }
        return stop();
      }
    });
    return found != null ? found : point;
  };

  getWordBufferRangeAtBufferPosition = function(editor, position, options) {
    var endPosition, startPosition;
    if (options == null) {
      options = {};
    }
    endPosition = getEndOfWordBufferPosition(editor, position, options);
    startPosition = getBeginningOfWordBufferPosition(editor, endPosition, options);
    return new Range(startPosition, endPosition);
  };

  shrinkRangeEndToBeforeNewLine = function(range) {
    var end, endRow, start;
    start = range.start, end = range.end;
    if (end.column === 0) {
      endRow = limitNumber(end.row - 1, {
        min: start.row
      });
      return new Range(start, [endRow, 2e308]);
    } else {
      return range;
    }
  };

  scanEditor = function(editor, pattern) {
    var ranges;
    ranges = [];
    editor.scan(pattern, function(arg) {
      var range;
      range = arg.range;
      return ranges.push(range);
    });
    return ranges;
  };

  collectRangeInBufferRow = function(editor, row, pattern) {
    var ranges, scanRange;
    ranges = [];
    scanRange = editor.bufferRangeForBufferRow(row);
    editor.scanInBufferRange(pattern, scanRange, function(arg) {
      var range;
      range = arg.range;
      return ranges.push(range);
    });
    return ranges;
  };

  findRangeInBufferRow = function(editor, pattern, row, arg) {
    var direction, range, scanFunctionName, scanRange;
    direction = (arg != null ? arg : {}).direction;
    if (direction === 'backward') {
      scanFunctionName = 'backwardsScanInBufferRange';
    } else {
      scanFunctionName = 'scanInBufferRange';
    }
    range = null;
    scanRange = editor.bufferRangeForBufferRow(row);
    editor[scanFunctionName](pattern, scanRange, function(event) {
      return range = event.range;
    });
    return range;
  };

  getLargestFoldRangeContainsBufferRow = function(editor, row) {
    var end, endPoint, j, len, marker, markers, ref1, ref2, start, startPoint;
    markers = editor.displayLayer.foldsMarkerLayer.findMarkers({
      intersectsRow: row
    });
    startPoint = null;
    endPoint = null;
    ref1 = markers != null ? markers : [];
    for (j = 0, len = ref1.length; j < len; j++) {
      marker = ref1[j];
      ref2 = marker.getRange(), start = ref2.start, end = ref2.end;
      if (!startPoint) {
        startPoint = start;
        endPoint = end;
        continue;
      }
      if (start.isLessThan(startPoint)) {
        startPoint = start;
        endPoint = end;
      }
    }
    if ((startPoint != null) && (endPoint != null)) {
      return new Range(startPoint, endPoint);
    }
  };

  translatePointAndClip = function(editor, point, direction) {
    var dontClip, eol, newRow, screenPoint;
    point = Point.fromObject(point);
    dontClip = false;
    switch (direction) {
      case 'forward':
        point = point.translate([0, +1]);
        eol = editor.bufferRangeForBufferRow(point.row).end;
        if (point.isEqual(eol)) {
          dontClip = true;
        } else if (point.isGreaterThan(eol)) {
          dontClip = true;
          point = new Point(point.row + 1, 0);
        }
        point = Point.min(point, editor.getEofBufferPosition());
        break;
      case 'backward':
        point = point.translate([0, -1]);
        if (point.column < 0) {
          dontClip = true;
          newRow = point.row - 1;
          eol = editor.bufferRangeForBufferRow(newRow).end;
          point = new Point(newRow, eol.column);
        }
        point = Point.max(point, Point.ZERO);
    }
    if (dontClip) {
      return point;
    } else {
      screenPoint = editor.screenPositionForBufferPosition(point, {
        clipDirection: direction
      });
      return editor.bufferPositionForScreenPosition(screenPoint);
    }
  };

  getRangeByTranslatePointAndClip = function(editor, range, which, direction) {
    var newPoint;
    newPoint = translatePointAndClip(editor, range[which], direction);
    switch (which) {
      case 'start':
        return new Range(newPoint, range.end);
      case 'end':
        return new Range(range.start, newPoint);
    }
  };

  getPackage = function(name, fn) {
    return new Promise(function(resolve) {
      var disposable, pkg;
      if (atom.packages.isPackageActive(name)) {
        pkg = atom.packages.getActivePackage(name);
        return resolve(pkg);
      } else {
        return disposable = atom.packages.onDidActivatePackage(function(pkg) {
          if (pkg.name === name) {
            disposable.dispose();
            return resolve(pkg);
          }
        });
      }
    });
  };

  searchByProjectFind = function(editor, text) {
    atom.commands.dispatch(editor.element, 'project-find:show');
    return getPackage('find-and-replace').then(function(pkg) {
      var projectFindView;
      projectFindView = pkg.mainModule.projectFindView;
      if (projectFindView != null) {
        projectFindView.findEditor.setText(text);
        return projectFindView.confirm();
      }
    });
  };

  limitNumber = function(number, arg) {
    var max, min, ref1;
    ref1 = arg != null ? arg : {}, max = ref1.max, min = ref1.min;
    if (max != null) {
      number = Math.min(number, max);
    }
    if (min != null) {
      number = Math.max(number, min);
    }
    return number;
  };

  findRangeContainsPoint = function(ranges, point) {
    var j, len, range;
    for (j = 0, len = ranges.length; j < len; j++) {
      range = ranges[j];
      if (range.containsPoint(point)) {
        return range;
      }
    }
    return null;
  };

  negateFunction = function(fn) {
    return function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return !fn.apply(null, args);
    };
  };

  isEmpty = function(target) {
    return target.isEmpty();
  };

  isNotEmpty = negateFunction(isEmpty);

  isSingleLineRange = function(range) {
    return range.isSingleLine();
  };

  isNotSingleLineRange = negateFunction(isSingleLineRange);

  isLeadingWhiteSpaceRange = function(editor, range) {
    return /^[\t ]*$/.test(editor.getTextInBufferRange(range));
  };

  isNotLeadingWhiteSpaceRange = negateFunction(isLeadingWhiteSpaceRange);

  isEscapedCharRange = function(editor, range) {
    var chars;
    range = Range.fromObject(range);
    chars = getLeftCharacterForBufferPosition(editor, range.start, 2);
    return chars.endsWith('\\') && !chars.endsWith('\\\\');
  };

  insertTextAtBufferPosition = function(editor, point, text) {
    return editor.setTextInBufferRange([point, point], text);
  };

  ensureEndsWithNewLineForBufferRow = function(editor, row) {
    var eol;
    if (!isEndsWithNewLineForBufferRow(editor, row)) {
      eol = getEndOfLineForBufferRow(editor, row);
      return insertTextAtBufferPosition(editor, eol, "\n");
    }
  };

  forEachPaneAxis = function(base, fn) {
    var child, j, len, ref1, results1;
    if (base.children != null) {
      fn(base);
      ref1 = base.children;
      results1 = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        child = ref1[j];
        results1.push(forEachPaneAxis(child, fn));
      }
      return results1;
    }
  };

  modifyClassList = function() {
    var action, classNames, element, ref1;
    action = arguments[0], element = arguments[1], classNames = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    return (ref1 = element.classList)[action].apply(ref1, classNames);
  };

  addClassList = modifyClassList.bind(null, 'add');

  removeClassList = modifyClassList.bind(null, 'remove');

  toggleClassList = modifyClassList.bind(null, 'toggle');

  toggleCaseForCharacter = function(char) {
    var charLower;
    charLower = char.toLowerCase();
    if (charLower === char) {
      return char.toUpperCase();
    } else {
      return charLower;
    }
  };

  splitTextByNewLine = function(text) {
    if (text.endsWith("\n")) {
      return text.trimRight().split(/\r?\n/g);
    } else {
      return text.split(/\r?\n/g);
    }
  };

  replaceDecorationClassBy = function(fn, decoration) {
    var props;
    props = decoration.getProperties();
    return decoration.setProperties(_.defaults({
      "class": fn(props["class"])
    }, props));
  };

  humanizeBufferRange = function(editor, range) {
    var end, newEnd, newStart, start;
    if (isSingleLineRange(range) || isLinewiseRange(range)) {
      return range;
    }
    start = range.start, end = range.end;
    if (pointIsAtEndOfLine(editor, start)) {
      newStart = start.traverse([1, 0]);
    }
    if (pointIsAtEndOfLine(editor, end)) {
      newEnd = end.traverse([1, 0]);
    }
    if ((newStart != null) || (newEnd != null)) {
      return new Range(newStart != null ? newStart : start, newEnd != null ? newEnd : end);
    } else {
      return range;
    }
  };

  expandRangeToWhiteSpaces = function(editor, range) {
    var end, newEnd, newStart, scanRange, start;
    start = range.start, end = range.end;
    newEnd = null;
    scanRange = [end, getEndOfLineForBufferRow(editor, end.row)];
    editor.scanInBufferRange(/\S/, scanRange, function(arg) {
      var range;
      range = arg.range;
      return newEnd = range.start;
    });
    if (newEnd != null ? newEnd.isGreaterThan(end) : void 0) {
      return new Range(start, newEnd);
    }
    newStart = null;
    scanRange = [[start.row, 0], range.start];
    editor.backwardsScanInBufferRange(/\S/, scanRange, function(arg) {
      var range;
      range = arg.range;
      return newStart = range.end;
    });
    if (newStart != null ? newStart.isLessThan(start) : void 0) {
      return new Range(newStart, end);
    }
    return range;
  };

  splitAndJoinBy = function(text, pattern, fn) {
    var end, flags, i, item, items, j, k, leadingSpaces, len, len1, ref1, ref2, ref3, regexp, result, segment, separator, separators, start, trailingSpaces;
    leadingSpaces = trailingSpaces = '';
    start = text.search(/\S/);
    end = text.search(/\s*$/);
    leadingSpaces = trailingSpaces = '';
    if (start !== -1) {
      leadingSpaces = text.slice(0, start);
    }
    if (end !== -1) {
      trailingSpaces = text.slice(end);
    }
    text = text.slice(start, end);
    flags = 'g';
    if (pattern.ignoreCase) {
      flags += 'i';
    }
    regexp = new RegExp("(" + pattern.source + ")", flags);
    items = [];
    separators = [];
    ref1 = text.split(regexp);
    for (i = j = 0, len = ref1.length; j < len; i = ++j) {
      segment = ref1[i];
      if (i % 2 === 0) {
        items.push(segment);
      } else {
        separators.push(segment);
      }
    }
    separators.push('');
    items = fn(items);
    result = '';
    ref2 = _.zip(items, separators);
    for (k = 0, len1 = ref2.length; k < len1; k++) {
      ref3 = ref2[k], item = ref3[0], separator = ref3[1];
      result += item + separator;
    }
    return leadingSpaces + result + trailingSpaces;
  };

  ArgumentsSplitter = (function() {
    function ArgumentsSplitter() {
      this.allTokens = [];
      this.currentSection = null;
    }

    ArgumentsSplitter.prototype.settlePending = function() {
      if (this.pendingToken) {
        this.allTokens.push({
          text: this.pendingToken,
          type: this.currentSection
        });
        return this.pendingToken = '';
      }
    };

    ArgumentsSplitter.prototype.changeSection = function(newSection) {
      if (this.currentSection !== newSection) {
        if (this.currentSection) {
          this.settlePending();
        }
        return this.currentSection = newSection;
      }
    };

    return ArgumentsSplitter;

  })();

  splitArguments = function(text, joinSpaceSeparatedToken) {
    var allTokens, changeSection, char, closeCharToOpenChar, closePairChars, currentSection, escapeChar, inQuote, isEscaped, j, lastArg, len, newAllTokens, openPairChars, pairStack, pendingToken, quoteChars, ref1, ref2, ref3, separatorChars, settlePending, token;
    if (joinSpaceSeparatedToken == null) {
      joinSpaceSeparatedToken = true;
    }
    separatorChars = "\t, \r\n";
    quoteChars = "\"'`";
    closeCharToOpenChar = {
      ")": "(",
      "}": "{",
      "]": "["
    };
    closePairChars = _.keys(closeCharToOpenChar).join('');
    openPairChars = _.values(closeCharToOpenChar).join('');
    escapeChar = "\\";
    pendingToken = '';
    inQuote = false;
    isEscaped = false;
    allTokens = [];
    currentSection = null;
    settlePending = function() {
      if (pendingToken) {
        allTokens.push({
          text: pendingToken,
          type: currentSection
        });
        return pendingToken = '';
      }
    };
    changeSection = function(newSection) {
      if (currentSection !== newSection) {
        if (currentSection) {
          settlePending();
        }
        return currentSection = newSection;
      }
    };
    pairStack = [];
    for (j = 0, len = text.length; j < len; j++) {
      char = text[j];
      if ((pairStack.length === 0) && (indexOf.call(separatorChars, char) >= 0)) {
        changeSection('separator');
      } else {
        changeSection('argument');
        if (isEscaped) {
          isEscaped = false;
        } else if (char === escapeChar) {
          isEscaped = true;
        } else if (inQuote) {
          if ((indexOf.call(quoteChars, char) >= 0) && _.last(pairStack) === char) {
            pairStack.pop();
            inQuote = false;
          }
        } else if (indexOf.call(quoteChars, char) >= 0) {
          inQuote = true;
          pairStack.push(char);
        } else if (indexOf.call(openPairChars, char) >= 0) {
          pairStack.push(char);
        } else if (indexOf.call(closePairChars, char) >= 0) {
          if (_.last(pairStack) === closeCharToOpenChar[char]) {
            pairStack.pop();
          }
        }
      }
      pendingToken += char;
    }
    settlePending();
    if (joinSpaceSeparatedToken && allTokens.some(function(arg) {
      var text, type;
      type = arg.type, text = arg.text;
      return type === 'separator' && indexOf.call(text, ',') >= 0;
    })) {
      newAllTokens = [];
      while (allTokens.length) {
        token = allTokens.shift();
        switch (token.type) {
          case 'argument':
            newAllTokens.push(token);
            break;
          case 'separator':
            if (indexOf.call(token.text, ',') >= 0) {
              newAllTokens.push(token);
            } else {
              lastArg = (ref1 = newAllTokens.pop()) != null ? ref1 : {
                text: '',
                'argument': 'argument'
              };
              lastArg.text += token.text + ((ref2 = (ref3 = allTokens.shift()) != null ? ref3.text : void 0) != null ? ref2 : '');
              newAllTokens.push(lastArg);
            }
        }
      }
      allTokens = newAllTokens;
    }
    return allTokens;
  };

  scanEditorInDirection = function(editor, direction, pattern, options, fn) {
    var allowNextLine, from, scanFunction, scanRange;
    if (options == null) {
      options = {};
    }
    allowNextLine = options.allowNextLine, from = options.from, scanRange = options.scanRange;
    if ((from == null) && (scanRange == null)) {
      throw new Error("You must either of 'from' or 'scanRange' options");
    }
    if (scanRange) {
      allowNextLine = true;
    } else {
      if (allowNextLine == null) {
        allowNextLine = true;
      }
    }
    if (from != null) {
      from = Point.fromObject(from);
    }
    switch (direction) {
      case 'forward':
        if (scanRange == null) {
          scanRange = new Range(from, getVimEofBufferPosition(editor));
        }
        scanFunction = 'scanInBufferRange';
        break;
      case 'backward':
        if (scanRange == null) {
          scanRange = new Range([0, 0], from);
        }
        scanFunction = 'backwardsScanInBufferRange';
    }
    return editor[scanFunction](pattern, scanRange, function(event) {
      if (!allowNextLine && event.range.start.row !== from.row) {
        event.stop();
        return;
      }
      return fn(event);
    });
  };

  adjustIndentWithKeepingLayout = function(editor, range) {
    var actualLevel, deltaToSuggestedLevel, j, k, len, minLevel, newLevel, ref1, ref2, ref3, results1, row, rowAndActualLevels, suggestedLevel;
    suggestedLevel = editor.suggestedIndentForBufferRow(range.start.row);
    minLevel = null;
    rowAndActualLevels = [];
    for (row = j = ref1 = range.start.row, ref2 = range.end.row; ref1 <= ref2 ? j < ref2 : j > ref2; row = ref1 <= ref2 ? ++j : --j) {
      actualLevel = getIndentLevelForBufferRow(editor, row);
      rowAndActualLevels.push([row, actualLevel]);
      if (!isEmptyRow(editor, row)) {
        minLevel = Math.min(minLevel != null ? minLevel : 2e308, actualLevel);
      }
    }
    if ((minLevel != null) && (deltaToSuggestedLevel = suggestedLevel - minLevel)) {
      results1 = [];
      for (k = 0, len = rowAndActualLevels.length; k < len; k++) {
        ref3 = rowAndActualLevels[k], row = ref3[0], actualLevel = ref3[1];
        newLevel = actualLevel + deltaToSuggestedLevel;
        results1.push(editor.setIndentationForBufferRow(row, newLevel));
      }
      return results1;
    }
  };

  rangeContainsPointWithEndExclusive = function(range, point) {
    return range.start.isLessThanOrEqual(point) && range.end.isGreaterThan(point);
  };

  traverseTextFromPoint = function(point, text) {
    return point.traverse(getTraversalForText(text));
  };

  getTraversalForText = function(text) {
    var char, column, j, len, row;
    row = 0;
    column = 0;
    for (j = 0, len = text.length; j < len; j++) {
      char = text[j];
      if (char === "\n") {
        row++;
        column = 0;
      } else {
        column++;
      }
    }
    return [row, column];
  };

  getFoldEndRowForRow = function(editor, row) {
    if (editor.isFoldedAtBufferRow(row)) {
      return getLargestFoldRangeContainsBufferRow(editor, row).end.row;
    } else {
      return row;
    }
  };

  module.exports = {
    assertWithException: assertWithException,
    getAncestors: getAncestors,
    getKeyBindingForCommand: getKeyBindingForCommand,
    include: include,
    debug: debug,
    saveEditorState: saveEditorState,
    isLinewiseRange: isLinewiseRange,
    sortRanges: sortRanges,
    getIndex: getIndex,
    getVisibleBufferRange: getVisibleBufferRange,
    getVisibleEditors: getVisibleEditors,
    pointIsAtEndOfLine: pointIsAtEndOfLine,
    pointIsOnWhiteSpace: pointIsOnWhiteSpace,
    pointIsAtEndOfLineAtNonEmptyRow: pointIsAtEndOfLineAtNonEmptyRow,
    pointIsAtVimEndOfFile: pointIsAtVimEndOfFile,
    getVimEofBufferPosition: getVimEofBufferPosition,
    getVimEofScreenPosition: getVimEofScreenPosition,
    getVimLastBufferRow: getVimLastBufferRow,
    getVimLastScreenRow: getVimLastScreenRow,
    setBufferRow: setBufferRow,
    setBufferColumn: setBufferColumn,
    moveCursorLeft: moveCursorLeft,
    moveCursorRight: moveCursorRight,
    moveCursorUpScreen: moveCursorUpScreen,
    moveCursorDownScreen: moveCursorDownScreen,
    getEndOfLineForBufferRow: getEndOfLineForBufferRow,
    getFirstVisibleScreenRow: getFirstVisibleScreenRow,
    getLastVisibleScreenRow: getLastVisibleScreenRow,
    getValidVimBufferRow: getValidVimBufferRow,
    getValidVimScreenRow: getValidVimScreenRow,
    moveCursorToFirstCharacterAtRow: moveCursorToFirstCharacterAtRow,
    getLineTextToBufferPosition: getLineTextToBufferPosition,
    getIndentLevelForBufferRow: getIndentLevelForBufferRow,
    getTextInScreenRange: getTextInScreenRange,
    moveCursorToNextNonWhitespace: moveCursorToNextNonWhitespace,
    isEmptyRow: isEmptyRow,
    getCodeFoldRowRanges: getCodeFoldRowRanges,
    getCodeFoldRowRangesContainesForRow: getCodeFoldRowRangesContainesForRow,
    getFoldRowRangesContainedByFoldStartsAtRow: getFoldRowRangesContainedByFoldStartsAtRow,
    getFoldRowRanges: getFoldRowRanges,
    getFoldRangesWithIndent: getFoldRangesWithIndent,
    getFoldInfoByKind: getFoldInfoByKind,
    getBufferRangeForRowRange: getBufferRangeForRowRange,
    trimRange: trimRange,
    getFirstCharacterPositionForBufferRow: getFirstCharacterPositionForBufferRow,
    isIncludeFunctionScopeForRow: isIncludeFunctionScopeForRow,
    detectScopeStartPositionForScope: detectScopeStartPositionForScope,
    getBufferRows: getBufferRows,
    smartScrollToBufferPosition: smartScrollToBufferPosition,
    matchScopes: matchScopes,
    isSingleLineText: isSingleLineText,
    getWordBufferRangeAtBufferPosition: getWordBufferRangeAtBufferPosition,
    getWordBufferRangeAndKindAtBufferPosition: getWordBufferRangeAndKindAtBufferPosition,
    getWordPatternAtBufferPosition: getWordPatternAtBufferPosition,
    getSubwordPatternAtBufferPosition: getSubwordPatternAtBufferPosition,
    getNonWordCharactersForCursor: getNonWordCharactersForCursor,
    shrinkRangeEndToBeforeNewLine: shrinkRangeEndToBeforeNewLine,
    scanEditor: scanEditor,
    collectRangeInBufferRow: collectRangeInBufferRow,
    findRangeInBufferRow: findRangeInBufferRow,
    getLargestFoldRangeContainsBufferRow: getLargestFoldRangeContainsBufferRow,
    translatePointAndClip: translatePointAndClip,
    getRangeByTranslatePointAndClip: getRangeByTranslatePointAndClip,
    getPackage: getPackage,
    searchByProjectFind: searchByProjectFind,
    limitNumber: limitNumber,
    findRangeContainsPoint: findRangeContainsPoint,
    isEmpty: isEmpty,
    isNotEmpty: isNotEmpty,
    isSingleLineRange: isSingleLineRange,
    isNotSingleLineRange: isNotSingleLineRange,
    insertTextAtBufferPosition: insertTextAtBufferPosition,
    ensureEndsWithNewLineForBufferRow: ensureEndsWithNewLineForBufferRow,
    isLeadingWhiteSpaceRange: isLeadingWhiteSpaceRange,
    isNotLeadingWhiteSpaceRange: isNotLeadingWhiteSpaceRange,
    isEscapedCharRange: isEscapedCharRange,
    forEachPaneAxis: forEachPaneAxis,
    addClassList: addClassList,
    removeClassList: removeClassList,
    toggleClassList: toggleClassList,
    toggleCaseForCharacter: toggleCaseForCharacter,
    splitTextByNewLine: splitTextByNewLine,
    replaceDecorationClassBy: replaceDecorationClassBy,
    humanizeBufferRange: humanizeBufferRange,
    expandRangeToWhiteSpaces: expandRangeToWhiteSpaces,
    splitAndJoinBy: splitAndJoinBy,
    splitArguments: splitArguments,
    scanEditorInDirection: scanEditorInDirection,
    adjustIndentWithKeepingLayout: adjustIndentWithKeepingLayout,
    rangeContainsPointWithEndExclusive: rangeContainsPointWithEndExclusive,
    traverseTextFromPoint: traverseTextFromPoint,
    getFoldEndRowForRow: getFoldEndRowForRow
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3V0aWxzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdytFQUFBO0lBQUE7OztFQUFBLEVBQUEsR0FBSzs7RUFDTCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBRVgsTUFBNkIsT0FBQSxDQUFRLE1BQVIsQ0FBN0IsRUFBQywyQkFBRCxFQUFhLGlCQUFiLEVBQW9COztFQUNwQixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVKLG1CQUFBLEdBQXNCLFNBQUMsU0FBRCxFQUFZLE9BQVosRUFBcUIsRUFBckI7V0FDcEIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxTQUFaLEVBQXVCLE9BQXZCLEVBQWdDLFNBQUMsS0FBRDtBQUM5QixZQUFVLElBQUEsS0FBQSxDQUFNLEtBQUssQ0FBQyxPQUFaO0lBRG9CLENBQWhDO0VBRG9COztFQUl0QixZQUFBLEdBQWUsU0FBQyxHQUFEO0FBQ2IsUUFBQTtJQUFBLFNBQUEsR0FBWTtJQUNaLE9BQUEsR0FBVTtBQUNWLFdBQUEsSUFBQTtNQUNFLFNBQVMsQ0FBQyxJQUFWLENBQWUsT0FBZjtNQUNBLE9BQUEsNENBQTJCLENBQUU7TUFDN0IsSUFBQSxDQUFhLE9BQWI7QUFBQSxjQUFBOztJQUhGO1dBSUE7RUFQYTs7RUFTZix1QkFBQSxHQUEwQixTQUFDLE9BQUQsRUFBVSxHQUFWO0FBQ3hCLFFBQUE7SUFEbUMsY0FBRDtJQUNsQyxPQUFBLEdBQVU7SUFDVixPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQUE7SUFDVixJQUFHLG1CQUFIO01BQ0UsVUFBQSxHQUFhLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsV0FBL0IsQ0FBMkMsQ0FBQyxjQUE1QyxDQUFBLENBQTRELENBQUMsR0FBN0QsQ0FBQTtNQUNiLE9BQUEsR0FB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LG1DQUFBLGlDQXZEZTtJQXdEZiwrQkFBQSw2QkF4RGU7SUF5RGYsK0JBQUEsNkJBekRlO0lBMERmLFlBQUEsVUExRGU7SUEyRGYseUJBQUEsdUJBM0RlO0lBNERmLHNCQUFBLG9CQTVEZTtJQTZEZixzQ0FBQSxvQ0E3RGU7SUE4RGYsdUJBQUEscUJBOURlO0lBK0RmLGlDQUFBLCtCQS9EZTtJQWdFZixZQUFBLFVBaEVlO0lBaUVmLHFCQUFBLG1CQWpFZTtJQWtFZixhQUFBLFdBbEVlO0lBbUVmLHdCQUFBLHNCQW5FZTtJQXFFZixTQUFBLE9BckVlO0lBcUVOLFlBQUEsVUFyRU07SUFzRWYsbUJBQUEsaUJBdEVlO0lBc0VJLHNCQUFBLG9CQXRFSjtJQXdFZiw0QkFBQSwwQkF4RWU7SUF5RWYsbUNBQUEsaUNBekVlO0lBMEVmLDBCQUFBLHdCQTFFZTtJQTJFZiw2QkFBQSwyQkEzRWU7SUE0RWYsb0JBQUEsa0JBNUVlO0lBOEVmLGlCQUFBLGVBOUVlO0lBK0VmLGNBQUEsWUEvRWU7SUFnRmYsaUJBQUEsZUFoRmU7SUFpRmYsaUJBQUEsZUFqRmU7SUFrRmYsd0JBQUEsc0JBbEZlO0lBbUZmLG9CQUFBLGtCQW5GZTtJQW9GZiwwQkFBQSx3QkFwRmU7SUFxRmYscUJBQUEsbUJBckZlO0lBc0ZmLDBCQUFBLHdCQXRGZTtJQXVGZixnQkFBQSxjQXZGZTtJQXdGZixnQkFBQSxjQXhGZTtJQXlGZix1QkFBQSxxQkF6RmU7SUEwRmYsK0JBQUEsNkJBMUZlO0lBMkZmLG9DQUFBLGtDQTNGZTtJQTRGZix1QkFBQSxxQkE1RmU7SUE2RmYscUJBQUEsbUJBN0ZlOztBQXg5QmpCIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSBudWxsXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbntEaXNwb3NhYmxlLCBSYW5nZSwgUG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbmFzc2VydFdpdGhFeGNlcHRpb24gPSAoY29uZGl0aW9uLCBtZXNzYWdlLCBmbikgLT5cbiAgYXRvbS5hc3NlcnQgY29uZGl0aW9uLCBtZXNzYWdlLCAoZXJyb3IpIC0+XG4gICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpXG5cbmdldEFuY2VzdG9ycyA9IChvYmopIC0+XG4gIGFuY2VzdG9ycyA9IFtdXG4gIGN1cnJlbnQgPSBvYmpcbiAgbG9vcFxuICAgIGFuY2VzdG9ycy5wdXNoKGN1cnJlbnQpXG4gICAgY3VycmVudCA9IGN1cnJlbnQuX19zdXBlcl9fPy5jb25zdHJ1Y3RvclxuICAgIGJyZWFrIHVubGVzcyBjdXJyZW50XG4gIGFuY2VzdG9yc1xuXG5nZXRLZXlCaW5kaW5nRm9yQ29tbWFuZCA9IChjb21tYW5kLCB7cGFja2FnZU5hbWV9KSAtPlxuICByZXN1bHRzID0gbnVsbFxuICBrZXltYXBzID0gYXRvbS5rZXltYXBzLmdldEtleUJpbmRpbmdzKClcbiAgaWYgcGFja2FnZU5hbWU/XG4gICAga2V5bWFwUGF0aCA9IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZShwYWNrYWdlTmFtZSkuZ2V0S2V5bWFwUGF0aHMoKS5wb3AoKVxuICAgIGtleW1hcHMgPSBrZXltYXBzLmZpbHRlcigoe3NvdXJjZX0pIC0+IHNvdXJjZSBpcyBrZXltYXBQYXRoKVxuXG4gIGZvciBrZXltYXAgaW4ga2V5bWFwcyB3aGVuIGtleW1hcC5jb21tYW5kIGlzIGNvbW1hbmRcbiAgICB7a2V5c3Ryb2tlcywgc2VsZWN0b3J9ID0ga2V5bWFwXG4gICAga2V5c3Ryb2tlcyA9IGtleXN0cm9rZXMucmVwbGFjZSgvc2hpZnQtLywgJycpXG4gICAgKHJlc3VsdHMgPz0gW10pLnB1c2goe2tleXN0cm9rZXMsIHNlbGVjdG9yfSlcbiAgcmVzdWx0c1xuXG4jIEluY2x1ZGUgbW9kdWxlKG9iamVjdCB3aGljaCBub3JtYWx5IHByb3ZpZGVzIHNldCBvZiBtZXRob2RzKSB0byBrbGFzc1xuaW5jbHVkZSA9IChrbGFzcywgbW9kdWxlKSAtPlxuICBmb3Iga2V5LCB2YWx1ZSBvZiBtb2R1bGVcbiAgICBrbGFzczo6W2tleV0gPSB2YWx1ZVxuXG5kZWJ1ZyA9IChtZXNzYWdlcy4uLikgLT5cbiAgcmV0dXJuIHVubGVzcyBzZXR0aW5ncy5nZXQoJ2RlYnVnJylcbiAgc3dpdGNoIHNldHRpbmdzLmdldCgnZGVidWdPdXRwdXQnKVxuICAgIHdoZW4gJ2NvbnNvbGUnXG4gICAgICBjb25zb2xlLmxvZyBtZXNzYWdlcy4uLlxuICAgIHdoZW4gJ2ZpbGUnXG4gICAgICBmcyA/PSByZXF1aXJlICdmcy1wbHVzJ1xuICAgICAgZmlsZVBhdGggPSBmcy5ub3JtYWxpemUgc2V0dGluZ3MuZ2V0KCdkZWJ1Z091dHB1dEZpbGVQYXRoJylcbiAgICAgIGlmIGZzLmV4aXN0c1N5bmMoZmlsZVBhdGgpXG4gICAgICAgIGZzLmFwcGVuZEZpbGVTeW5jIGZpbGVQYXRoLCBtZXNzYWdlcyArIFwiXFxuXCJcblxuIyBSZXR1cm4gZnVuY3Rpb24gdG8gcmVzdG9yZSBlZGl0b3IncyBzY3JvbGxUb3AgYW5kIGZvbGQgc3RhdGUuXG5zYXZlRWRpdG9yU3RhdGUgPSAoZWRpdG9yKSAtPlxuICBlZGl0b3JFbGVtZW50ID0gZWRpdG9yLmVsZW1lbnRcbiAgc2Nyb2xsVG9wID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKVxuXG4gIGZvbGRTdGFydFJvd3MgPSBlZGl0b3IuZGlzcGxheUxheWVyLmZvbGRzTWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoe30pLm1hcCAobSkgLT4gbS5nZXRTdGFydFBvc2l0aW9uKCkucm93XG4gIC0+XG4gICAgZm9yIHJvdyBpbiBmb2xkU3RhcnRSb3dzLnJldmVyc2UoKSB3aGVuIG5vdCBlZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgICBlZGl0b3IuZm9sZEJ1ZmZlclJvdyhyb3cpXG4gICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3Aoc2Nyb2xsVG9wKVxuXG5pc0xpbmV3aXNlUmFuZ2UgPSAoe3N0YXJ0LCBlbmR9KSAtPlxuICAoc3RhcnQucm93IGlzbnQgZW5kLnJvdykgYW5kIChzdGFydC5jb2x1bW4gaXMgZW5kLmNvbHVtbiBpcyAwKVxuXG5pc0VuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAge3N0YXJ0LCBlbmR9ID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdywgaW5jbHVkZU5ld2xpbmU6IHRydWUpXG4gIHN0YXJ0LnJvdyBpc250IGVuZC5yb3dcblxuc29ydFJhbmdlcyA9IChjb2xsZWN0aW9uKSAtPlxuICBjb2xsZWN0aW9uLnNvcnQgKGEsIGIpIC0+IGEuY29tcGFyZShiKVxuXG4jIFJldHVybiBhZGp1c3RlZCBpbmRleCBmaXQgd2hpdGluIGdpdmVuIGxpc3QncyBsZW5ndGhcbiMgcmV0dXJuIC0xIGlmIGxpc3QgaXMgZW1wdHkuXG5nZXRJbmRleCA9IChpbmRleCwgbGlzdCkgLT5cbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGhcbiAgaWYgbGVuZ3RoIGlzIDBcbiAgICAtMVxuICBlbHNlXG4gICAgaW5kZXggPSBpbmRleCAlIGxlbmd0aFxuICAgIGlmIGluZGV4ID49IDBcbiAgICAgIGluZGV4XG4gICAgZWxzZVxuICAgICAgbGVuZ3RoICsgaW5kZXhcblxuIyBOT1RFOiBlbmRSb3cgYmVjb21lIHVuZGVmaW5lZCBpZiBAZWRpdG9yRWxlbWVudCBpcyBub3QgeWV0IGF0dGFjaGVkLlxuIyBlLmcuIEJlZ2luZyBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgb3BlbiBmaWxlLlxuZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlID0gKGVkaXRvcikgLT5cbiAgW3N0YXJ0Um93LCBlbmRSb3ddID0gZWRpdG9yLmVsZW1lbnQuZ2V0VmlzaWJsZVJvd1JhbmdlKClcbiAgcmV0dXJuIG51bGwgdW5sZXNzIChzdGFydFJvdz8gYW5kIGVuZFJvdz8pXG4gIHN0YXJ0Um93ID0gZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhzdGFydFJvdylcbiAgZW5kUm93ID0gZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhlbmRSb3cpXG4gIG5ldyBSYW5nZShbc3RhcnRSb3csIDBdLCBbZW5kUm93LCBJbmZpbml0eV0pXG5cbmdldFZpc2libGVFZGl0b3JzID0gLT5cbiAgKGVkaXRvciBmb3IgcGFuZSBpbiBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpIHdoZW4gZWRpdG9yID0gcGFuZS5nZXRBY3RpdmVFZGl0b3IoKSlcblxuZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KS5lbmRcblxuIyBQb2ludCB1dGlsXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnBvaW50SXNBdEVuZE9mTGluZSA9IChlZGl0b3IsIHBvaW50KSAtPlxuICBwb2ludCA9IFBvaW50LmZyb21PYmplY3QocG9pbnQpXG4gIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIHBvaW50LnJvdykuaXNFcXVhbChwb2ludClcblxucG9pbnRJc09uV2hpdGVTcGFjZSA9IChlZGl0b3IsIHBvaW50KSAtPlxuICBjaGFyID0gZ2V0UmlnaHRDaGFyYWN0ZXJGb3JCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50KVxuICBub3QgL1xcUy8udGVzdChjaGFyKVxuXG5wb2ludElzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93ID0gKGVkaXRvciwgcG9pbnQpIC0+XG4gIHBvaW50ID0gUG9pbnQuZnJvbU9iamVjdChwb2ludClcbiAgcG9pbnQuY29sdW1uIGlzbnQgMCBhbmQgcG9pbnRJc0F0RW5kT2ZMaW5lKGVkaXRvciwgcG9pbnQpXG5cbnBvaW50SXNBdFZpbUVuZE9mRmlsZSA9IChlZGl0b3IsIHBvaW50KSAtPlxuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpLmlzRXF1YWwocG9pbnQpXG5cbmlzRW1wdHlSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpLmlzRW1wdHkoKVxuXG5nZXRSaWdodENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIGFtb3VudD0xKSAtPlxuICBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCBhbW91bnQpKVxuXG5nZXRMZWZ0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgYW1vdW50PTEpIC0+XG4gIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIC1hbW91bnQpKVxuXG5nZXRUZXh0SW5TY3JlZW5SYW5nZSA9IChlZGl0b3IsIHNjcmVlblJhbmdlKSAtPlxuICBidWZmZXJSYW5nZSA9IGVkaXRvci5idWZmZXJSYW5nZUZvclNjcmVlblJhbmdlKHNjcmVlblJhbmdlKVxuICBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoYnVmZmVyUmFuZ2UpXG5cbmdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yID0gKGN1cnNvcikgLT5cbiAgIyBBdG9tIDEuMTEuMC1iZXRhNSBoYXZlIHRoaXMgZXhwZXJpbWVudGFsIG1ldGhvZC5cbiAgaWYgY3Vyc29yLmdldE5vbldvcmRDaGFyYWN0ZXJzP1xuICAgIGN1cnNvci5nZXROb25Xb3JkQ2hhcmFjdGVycygpXG4gIGVsc2VcbiAgICBzY29wZSA9IGN1cnNvci5nZXRTY29wZURlc2NyaXB0b3IoKS5nZXRTY29wZXNBcnJheSgpXG4gICAgYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iubm9uV29yZENoYXJhY3RlcnMnLCB7c2NvcGV9KVxuXG4jIEZJWE1FOiByZW1vdmUgdGhpc1xuIyByZXR1cm4gdHJ1ZSBpZiBtb3ZlZFxubW92ZUN1cnNvclRvTmV4dE5vbldoaXRlc3BhY2UgPSAoY3Vyc29yKSAtPlxuICBvcmlnaW5hbFBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgZWRpdG9yID0gY3Vyc29yLmVkaXRvclxuICB2aW1Fb2YgPSBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpXG5cbiAgd2hpbGUgcG9pbnRJc09uV2hpdGVTcGFjZShlZGl0b3IsIHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpIGFuZCBub3QgcG9pbnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwodmltRW9mKVxuICAgIGN1cnNvci5tb3ZlUmlnaHQoKVxuICBub3Qgb3JpZ2luYWxQb2ludC5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuXG5nZXRCdWZmZXJSb3dzID0gKGVkaXRvciwge3N0YXJ0Um93LCBkaXJlY3Rpb259KSAtPlxuICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAncHJldmlvdXMnXG4gICAgICBpZiBzdGFydFJvdyA8PSAwXG4gICAgICAgIFtdXG4gICAgICBlbHNlXG4gICAgICAgIFsoc3RhcnRSb3cgLSAxKS4uMF1cbiAgICB3aGVuICduZXh0J1xuICAgICAgZW5kUm93ID0gZ2V0VmltTGFzdEJ1ZmZlclJvdyhlZGl0b3IpXG4gICAgICBpZiBzdGFydFJvdyA+PSBlbmRSb3dcbiAgICAgICAgW11cbiAgICAgIGVsc2VcbiAgICAgICAgWyhzdGFydFJvdyArIDEpLi5lbmRSb3ddXG5cbiMgUmV0dXJuIFZpbSdzIEVPRiBwb3NpdGlvbiByYXRoZXIgdGhhbiBBdG9tJ3MgRU9GIHBvc2l0aW9uLlxuIyBUaGlzIGZ1bmN0aW9uIGNoYW5nZSBtZWFuaW5nIG9mIEVPRiBmcm9tIG5hdGl2ZSBUZXh0RWRpdG9yOjpnZXRFb2ZCdWZmZXJQb3NpdGlvbigpXG4jIEF0b20gaXMgc3BlY2lhbChzdHJhbmdlKSBmb3IgY3Vyc29yIGNhbiBwYXN0IHZlcnkgbGFzdCBuZXdsaW5lIGNoYXJhY3Rlci5cbiMgQmVjYXVzZSBvZiB0aGlzLCBBdG9tJ3MgRU9GIHBvc2l0aW9uIGlzIFthY3R1YWxMYXN0Um93KzEsIDBdIHByb3ZpZGVkIGxhc3Qtbm9uLWJsYW5rLXJvd1xuIyBlbmRzIHdpdGggbmV3bGluZSBjaGFyLlxuIyBCdXQgaW4gVmltLCBjdXJvciBjYW4gTk9UIHBhc3QgbGFzdCBuZXdsaW5lLiBFT0YgaXMgbmV4dCBwb3NpdGlvbiBvZiB2ZXJ5IGxhc3QgY2hhcmFjdGVyLlxuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yKSAtPlxuICBlb2YgPSBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKVxuICBpZiAoZW9mLnJvdyBpcyAwKSBvciAoZW9mLmNvbHVtbiA+IDApXG4gICAgZW9mXG4gIGVsc2VcbiAgICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCBlb2Yucm93IC0gMSlcblxuZ2V0VmltRW9mU2NyZWVuUG9zaXRpb24gPSAoZWRpdG9yKSAtPlxuICBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpKVxuXG5nZXRWaW1MYXN0QnVmZmVyUm93ID0gKGVkaXRvcikgLT4gZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oZWRpdG9yKS5yb3dcbmdldFZpbUxhc3RTY3JlZW5Sb3cgPSAoZWRpdG9yKSAtPiBnZXRWaW1Fb2ZTY3JlZW5Qb3NpdGlvbihlZGl0b3IpLnJvd1xuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93ID0gKGVkaXRvcikgLT4gZWRpdG9yLmVsZW1lbnQuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbmdldExhc3RWaXNpYmxlU2NyZWVuUm93ID0gKGVkaXRvcikgLT4gZWRpdG9yLmVsZW1lbnQuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuXG5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICByYW5nZSA9IGZpbmRSYW5nZUluQnVmZmVyUm93KGVkaXRvciwgL1xcUy8sIHJvdylcbiAgcmFuZ2U/LnN0YXJ0ID8gbmV3IFBvaW50KHJvdywgMClcblxudHJpbVJhbmdlID0gKGVkaXRvciwgc2NhblJhbmdlKSAtPlxuICBwYXR0ZXJuID0gL1xcUy9cbiAgW3N0YXJ0LCBlbmRdID0gW11cbiAgc2V0U3RhcnQgPSAoe3JhbmdlfSkgLT4ge3N0YXJ0fSA9IHJhbmdlXG4gIHNldEVuZCA9ICh7cmFuZ2V9KSAtPiB7ZW5kfSA9IHJhbmdlXG4gIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZShwYXR0ZXJuLCBzY2FuUmFuZ2UsIHNldFN0YXJ0KVxuICBlZGl0b3IuYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UocGF0dGVybiwgc2NhblJhbmdlLCBzZXRFbmQpIGlmIHN0YXJ0P1xuICBpZiBzdGFydD8gYW5kIGVuZD9cbiAgICBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcbiAgZWxzZVxuICAgIHNjYW5SYW5nZVxuXG4jIEN1cnNvciBtb3Rpb24gd3JhcHBlclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEp1c3QgdXBkYXRlIGJ1ZmZlclJvdyB3aXRoIGtlZXBpbmcgY29sdW1uIGJ5IHJlc3BlY3RpbmcgZ29hbENvbHVtblxuc2V0QnVmZmVyUm93ID0gKGN1cnNvciwgcm93LCBvcHRpb25zKSAtPlxuICBjb2x1bW4gPSBjdXJzb3IuZ29hbENvbHVtbiA/IGN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKVxuICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgY29sdW1uXSwgb3B0aW9ucylcbiAgY3Vyc29yLmdvYWxDb2x1bW4gPSBjb2x1bW5cblxuc2V0QnVmZmVyQ29sdW1uID0gKGN1cnNvciwgY29sdW1uKSAtPlxuICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW2N1cnNvci5nZXRCdWZmZXJSb3coKSwgY29sdW1uXSlcblxubW92ZUN1cnNvciA9IChjdXJzb3IsIHtwcmVzZXJ2ZUdvYWxDb2x1bW59LCBmbikgLT5cbiAge2dvYWxDb2x1bW59ID0gY3Vyc29yXG4gIGZuKGN1cnNvcilcbiAgaWYgcHJlc2VydmVHb2FsQ29sdW1uIGFuZCBnb2FsQ29sdW1uP1xuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gZ29hbENvbHVtblxuXG4jIFdvcmthcm91bmQgaXNzdWUgZm9yIHQ5bWQvdmltLW1vZGUtcGx1cyMyMjYgYW5kIGF0b20vYXRvbSMzMTc0XG4jIEkgY2Fubm90IGRlcGVuZCBjdXJzb3IncyBjb2x1bW4gc2luY2UgaXRzIGNsYWltIDAgYW5kIGNsaXBwaW5nIGVtbXVsYXRpb24gZG9uJ3RcbiMgcmV0dXJuIHdyYXBwZWQgbGluZSwgYnV0IEl0IGFjdHVhbGx5IHdyYXAsIHNvIEkgbmVlZCB0byBkbyB2ZXJ5IGRpcnR5IHdvcmsgdG9cbiMgcHJlZGljdCB3cmFwIGh1cmlzdGljYWxseS5cbnNob3VsZFByZXZlbnRXcmFwTGluZSA9IChjdXJzb3IpIC0+XG4gIHtyb3csIGNvbHVtbn0gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0VGFicycpXG4gICAgdGFiTGVuZ3RoID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IudGFiTGVuZ3RoJylcbiAgICBpZiAwIDwgY29sdW1uIDwgdGFiTGVuZ3RoXG4gICAgICB0ZXh0ID0gY3Vyc29yLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbW3JvdywgMF0sIFtyb3csIHRhYkxlbmd0aF1dKVxuICAgICAgL15cXHMrJC8udGVzdCh0ZXh0KVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiMgb3B0aW9uczpcbiMgICBhbGxvd1dyYXA6IHRvIGNvbnRyb2xsIGFsbG93IHdyYXBcbiMgICBwcmVzZXJ2ZUdvYWxDb2x1bW46IHByZXNlcnZlIG9yaWdpbmFsIGdvYWxDb2x1bW5cbm1vdmVDdXJzb3JMZWZ0ID0gKGN1cnNvciwgb3B0aW9ucz17fSkgLT5cbiAge2FsbG93V3JhcCwgbmVlZFNwZWNpYWxDYXJlVG9QcmV2ZW50V3JhcExpbmV9ID0gb3B0aW9uc1xuICBkZWxldGUgb3B0aW9ucy5hbGxvd1dyYXBcbiAgaWYgbmVlZFNwZWNpYWxDYXJlVG9QcmV2ZW50V3JhcExpbmVcbiAgICByZXR1cm4gaWYgc2hvdWxkUHJldmVudFdyYXBMaW5lKGN1cnNvcilcblxuICBpZiBub3QgY3Vyc29yLmlzQXRCZWdpbm5pbmdPZkxpbmUoKSBvciBhbGxvd1dyYXBcbiAgICBtb3Rpb24gPSAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZUxlZnQoKVxuICAgIG1vdmVDdXJzb3IoY3Vyc29yLCBvcHRpb25zLCBtb3Rpb24pXG5cbm1vdmVDdXJzb3JSaWdodCA9IChjdXJzb3IsIG9wdGlvbnM9e30pIC0+XG4gIHthbGxvd1dyYXB9ID0gb3B0aW9uc1xuICBkZWxldGUgb3B0aW9ucy5hbGxvd1dyYXBcbiAgaWYgbm90IGN1cnNvci5pc0F0RW5kT2ZMaW5lKCkgb3IgYWxsb3dXcmFwXG4gICAgbW90aW9uID0gKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgbW92ZUN1cnNvcihjdXJzb3IsIG9wdGlvbnMsIG1vdGlvbilcblxubW92ZUN1cnNvclVwU2NyZWVuID0gKGN1cnNvciwgb3B0aW9ucz17fSkgLT5cbiAgdW5sZXNzIGN1cnNvci5nZXRTY3JlZW5Sb3coKSBpcyAwXG4gICAgbW90aW9uID0gKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVVcCgpXG4gICAgbW92ZUN1cnNvcihjdXJzb3IsIG9wdGlvbnMsIG1vdGlvbilcblxubW92ZUN1cnNvckRvd25TY3JlZW4gPSAoY3Vyc29yLCBvcHRpb25zPXt9KSAtPlxuICB1bmxlc3MgZ2V0VmltTGFzdFNjcmVlblJvdyhjdXJzb3IuZWRpdG9yKSBpcyBjdXJzb3IuZ2V0U2NyZWVuUm93KClcbiAgICBtb3Rpb24gPSAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZURvd24oKVxuICAgIG1vdmVDdXJzb3IoY3Vyc29yLCBvcHRpb25zLCBtb3Rpb24pXG5cbm1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3cgPSAoY3Vyc29yLCByb3cpIC0+XG4gIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcm93LCAwXSlcbiAgY3Vyc29yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcblxuZ2V0VmFsaWRWaW1CdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+IGxpbWl0TnVtYmVyKHJvdywgbWluOiAwLCBtYXg6IGdldFZpbUxhc3RCdWZmZXJSb3coZWRpdG9yKSlcblxuZ2V0VmFsaWRWaW1TY3JlZW5Sb3cgPSAoZWRpdG9yLCByb3cpIC0+IGxpbWl0TnVtYmVyKHJvdywgbWluOiAwLCBtYXg6IGdldFZpbUxhc3RTY3JlZW5Sb3coZWRpdG9yKSlcblxuIyBCeSBkZWZhdWx0IG5vdCBpbmNsdWRlIGNvbHVtblxuZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwge3JvdywgY29sdW1ufSwge2V4Y2x1c2l2ZX09e30pIC0+XG4gIGlmIGV4Y2x1c2l2ZSA/IHRydWVcbiAgICBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVswLi4uY29sdW1uXVxuICBlbHNlXG4gICAgZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdylbMC4uY29sdW1uXVxuXG5nZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLmluZGVudExldmVsRm9yTGluZShlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KSlcblxuZ2V0Q29kZUZvbGRSb3dSYW5nZXMgPSAoZWRpdG9yKSAtPlxuICBbMC4uZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKV1cbiAgICAubWFwIChyb3cpIC0+XG4gICAgICBlZGl0b3IubGFuZ3VhZ2VNb2RlLnJvd1JhbmdlRm9yQ29kZUZvbGRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgLmZpbHRlciAocm93UmFuZ2UpIC0+XG4gICAgICByb3dSYW5nZT8gYW5kIHJvd1JhbmdlWzBdPyBhbmQgcm93UmFuZ2VbMV0/XG5cbiMgVXNlZCBpbiB2bXAtamFzbWluZS1pbmNyZWFzZS1mb2N1c1xuZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3cgPSAoZWRpdG9yLCBidWZmZXJSb3csIHtpbmNsdWRlU3RhcnRSb3d9PXt9KSAtPlxuICBpbmNsdWRlU3RhcnRSb3cgPz0gdHJ1ZVxuICBnZXRDb2RlRm9sZFJvd1JhbmdlcyhlZGl0b3IpLmZpbHRlciAoW3N0YXJ0Um93LCBlbmRSb3ddKSAtPlxuICAgIGlmIGluY2x1ZGVTdGFydFJvd1xuICAgICAgc3RhcnRSb3cgPD0gYnVmZmVyUm93IDw9IGVuZFJvd1xuICAgIGVsc2VcbiAgICAgIHN0YXJ0Um93IDwgYnVmZmVyUm93IDw9IGVuZFJvd1xuXG5nZXRGb2xkUm93UmFuZ2VzQ29udGFpbmVkQnlGb2xkU3RhcnRzQXRSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIHJldHVybiBudWxsIHVubGVzcyBlZGl0b3IuaXNGb2xkYWJsZUF0QnVmZmVyUm93KHJvdylcblxuICBbc3RhcnRSb3csIGVuZFJvd10gPSBlZGl0b3IubGFuZ3VhZ2VNb2RlLnJvd1JhbmdlRm9yRm9sZEF0QnVmZmVyUm93KHJvdylcblxuICBzZWVuID0ge31cbiAgW3N0YXJ0Um93Li5lbmRSb3ddXG4gICAgLm1hcCAocm93KSAtPlxuICAgICAgZWRpdG9yLmxhbmd1YWdlTW9kZS5yb3dSYW5nZUZvckZvbGRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgLmZpbHRlciAocm93UmFuZ2UpIC0+XG4gICAgICByb3dSYW5nZT8gYW5kIHJvd1JhbmdlWzBdPyBhbmQgcm93UmFuZ2VbMV0/XG4gICAgLmZpbHRlciAocm93UmFuZ2UpIC0+XG4gICAgICBpZiBzZWVuW3Jvd1JhbmdlXSB0aGVuIGZhbHNlIGVsc2Ugc2Vlbltyb3dSYW5nZV0gPSB0cnVlXG5cbmdldEZvbGRSb3dSYW5nZXMgPSAoZWRpdG9yKSAtPlxuICBzZWVuID0ge31cbiAgWzAuLmVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCldXG4gICAgLm1hcCAocm93KSAtPlxuICAgICAgZWRpdG9yLmxhbmd1YWdlTW9kZS5yb3dSYW5nZUZvckNvZGVGb2xkQXRCdWZmZXJSb3cocm93KVxuICAgIC5maWx0ZXIgKHJvd1JhbmdlKSAtPlxuICAgICAgcm93UmFuZ2U/IGFuZCByb3dSYW5nZVswXT8gYW5kIHJvd1JhbmdlWzFdP1xuICAgIC5maWx0ZXIgKHJvd1JhbmdlKSAtPlxuICAgICAgaWYgc2Vlbltyb3dSYW5nZV0gdGhlbiBmYWxzZSBlbHNlIHNlZW5bcm93UmFuZ2VdID0gdHJ1ZVxuXG5nZXRGb2xkUmFuZ2VzV2l0aEluZGVudCA9IChlZGl0b3IpIC0+XG4gIGdldEZvbGRSb3dSYW5nZXMoZWRpdG9yKVxuICAgIC5tYXAgKFtzdGFydFJvdywgZW5kUm93XSkgLT5cbiAgICAgIGluZGVudCA9IGVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhzdGFydFJvdylcbiAgICAgIHtzdGFydFJvdywgZW5kUm93LCBpbmRlbnR9XG5cbmdldEZvbGRJbmZvQnlLaW5kID0gKGVkaXRvcikgLT5cbiAgZm9sZEluZm9CeUtpbmQgPSB7fVxuXG4gIHVwZGF0ZUZvbGRJbmZvID0gKGtpbmQsIHJvd1JhbmdlV2l0aEluZGVudCkgLT5cbiAgICBmb2xkSW5mbyA9IChmb2xkSW5mb0J5S2luZFtraW5kXSA/PSB7fSlcbiAgICBmb2xkSW5mby5yb3dSYW5nZXNXaXRoSW5kZW50ID89IFtdXG4gICAgZm9sZEluZm8ucm93UmFuZ2VzV2l0aEluZGVudC5wdXNoKHJvd1JhbmdlV2l0aEluZGVudClcbiAgICBpbmRlbnQgPSByb3dSYW5nZVdpdGhJbmRlbnQuaW5kZW50XG4gICAgZm9sZEluZm8ubWluSW5kZW50ID0gTWF0aC5taW4oZm9sZEluZm8ubWluSW5kZW50ID8gaW5kZW50LCBpbmRlbnQpXG4gICAgZm9sZEluZm8ubWF4SW5kZW50ID0gTWF0aC5tYXgoZm9sZEluZm8ubWF4SW5kZW50ID8gaW5kZW50LCBpbmRlbnQpXG5cbiAgZm9yIHJvd1JhbmdlV2l0aEluZGVudCBpbiBnZXRGb2xkUmFuZ2VzV2l0aEluZGVudChlZGl0b3IpXG4gICAgdXBkYXRlRm9sZEluZm8oJ2FsbEZvbGQnLCByb3dSYW5nZVdpdGhJbmRlbnQpXG4gICAgaWYgZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93UmFuZ2VXaXRoSW5kZW50LnN0YXJ0Um93KVxuICAgICAgdXBkYXRlRm9sZEluZm8oJ2ZvbGRlZCcsIHJvd1JhbmdlV2l0aEluZGVudClcbiAgICBlbHNlXG4gICAgICB1cGRhdGVGb2xkSW5mbygndW5mb2xkZWQnLCByb3dSYW5nZVdpdGhJbmRlbnQpXG4gIGZvbGRJbmZvQnlLaW5kXG5cbmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UgPSAoZWRpdG9yLCByb3dSYW5nZSkgLT5cbiAgW3N0YXJ0UmFuZ2UsIGVuZFJhbmdlXSA9IHJvd1JhbmdlLm1hcCAocm93KSAtPlxuICAgIGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3csIGluY2x1ZGVOZXdsaW5lOiB0cnVlKVxuICBzdGFydFJhbmdlLnVuaW9uKGVuZFJhbmdlKVxuXG5nZXRUb2tlbml6ZWRMaW5lRm9yUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICBlZGl0b3IudG9rZW5pemVkQnVmZmVyLnRva2VuaXplZExpbmVGb3JSb3cocm93KVxuXG5nZXRTY29wZXNGb3JUb2tlbml6ZWRMaW5lID0gKGxpbmUpIC0+XG4gIGZvciB0YWcgaW4gbGluZS50YWdzIHdoZW4gdGFnIDwgMCBhbmQgKHRhZyAlIDIgaXMgLTEpXG4gICAgYXRvbS5ncmFtbWFycy5zY29wZUZvcklkKHRhZylcblxuc2NhbkZvclNjb3BlU3RhcnQgPSAoZWRpdG9yLCBmcm9tUG9pbnQsIGRpcmVjdGlvbiwgZm4pIC0+XG4gIGZyb21Qb2ludCA9IFBvaW50LmZyb21PYmplY3QoZnJvbVBvaW50KVxuICBzY2FuUm93cyA9IHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdmb3J3YXJkJyB0aGVuIFsoZnJvbVBvaW50LnJvdykuLmVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCldXG4gICAgd2hlbiAnYmFja3dhcmQnIHRoZW4gWyhmcm9tUG9pbnQucm93KS4uMF1cblxuICBjb250aW51ZVNjYW4gPSB0cnVlXG4gIHN0b3AgPSAtPlxuICAgIGNvbnRpbnVlU2NhbiA9IGZhbHNlXG5cbiAgaXNWYWxpZFRva2VuID0gc3dpdGNoIGRpcmVjdGlvblxuICAgIHdoZW4gJ2ZvcndhcmQnIHRoZW4gKHtwb3NpdGlvbn0pIC0+IHBvc2l0aW9uLmlzR3JlYXRlclRoYW4oZnJvbVBvaW50KVxuICAgIHdoZW4gJ2JhY2t3YXJkJyB0aGVuICh7cG9zaXRpb259KSAtPiBwb3NpdGlvbi5pc0xlc3NUaGFuKGZyb21Qb2ludClcblxuICBmb3Igcm93IGluIHNjYW5Sb3dzIHdoZW4gdG9rZW5pemVkTGluZSA9IGdldFRva2VuaXplZExpbmVGb3JSb3coZWRpdG9yLCByb3cpXG4gICAgY29sdW1uID0gMFxuICAgIHJlc3VsdHMgPSBbXVxuXG4gICAgdG9rZW5JdGVyYXRvciA9IHRva2VuaXplZExpbmUuZ2V0VG9rZW5JdGVyYXRvcigpXG4gICAgZm9yIHRhZyBpbiB0b2tlbml6ZWRMaW5lLnRhZ3NcbiAgICAgIHRva2VuSXRlcmF0b3IubmV4dCgpXG4gICAgICBpZiB0YWcgPCAwICMgTmVnYXRpdmU6IHN0YXJ0L3N0b3AgdG9rZW5cbiAgICAgICAgc2NvcGUgPSBhdG9tLmdyYW1tYXJzLnNjb3BlRm9ySWQodGFnKVxuICAgICAgICBpZiAodGFnICUgMikgaXMgMCAjIEV2ZW46IHNjb3BlIHN0b3BcbiAgICAgICAgICBudWxsXG4gICAgICAgIGVsc2UgIyBPZGQ6IHNjb3BlIHN0YXJ0XG4gICAgICAgICAgcG9zaXRpb24gPSBuZXcgUG9pbnQocm93LCBjb2x1bW4pXG4gICAgICAgICAgcmVzdWx0cy5wdXNoIHtzY29wZSwgcG9zaXRpb24sIHN0b3B9XG4gICAgICBlbHNlXG4gICAgICAgIGNvbHVtbiArPSB0YWdcblxuICAgIHJlc3VsdHMgPSByZXN1bHRzLmZpbHRlcihpc1ZhbGlkVG9rZW4pXG4gICAgcmVzdWx0cy5yZXZlcnNlKCkgaWYgZGlyZWN0aW9uIGlzICdiYWNrd2FyZCdcbiAgICBmb3IgcmVzdWx0IGluIHJlc3VsdHNcbiAgICAgIGZuKHJlc3VsdClcbiAgICAgIHJldHVybiB1bmxlc3MgY29udGludWVTY2FuXG4gICAgcmV0dXJuIHVubGVzcyBjb250aW51ZVNjYW5cblxuZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGUgPSAoZWRpdG9yLCBmcm9tUG9pbnQsIGRpcmVjdGlvbiwgc2NvcGUpIC0+XG4gIHBvaW50ID0gbnVsbFxuICBzY2FuRm9yU2NvcGVTdGFydCBlZGl0b3IsIGZyb21Qb2ludCwgZGlyZWN0aW9uLCAoaW5mbykgLT5cbiAgICBpZiBpbmZvLnNjb3BlLnNlYXJjaChzY29wZSkgPj0gMFxuICAgICAgaW5mby5zdG9wKClcbiAgICAgIHBvaW50ID0gaW5mby5wb3NpdGlvblxuICBwb2ludFxuXG5pc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICAjIFtGSVhNRV0gQnVnIG9mIHVwc3RyZWFtP1xuICAjIFNvbWV0aW1lIHRva2VuaXplZExpbmVzIGxlbmd0aCBpcyBsZXNzIHRoYW4gbGFzdCBidWZmZXIgcm93LlxuICAjIFNvIHRva2VuaXplZExpbmUgaXMgbm90IGFjY2Vzc2libGUgZXZlbiBpZiB2YWxpZCByb3cuXG4gICMgSW4gdGhhdCBjYXNlIEkgc2ltcGx5IHJldHVybiBlbXB0eSBBcnJheS5cbiAgaWYgdG9rZW5pemVkTGluZSA9IGdldFRva2VuaXplZExpbmVGb3JSb3coZWRpdG9yLCByb3cpXG4gICAgZ2V0U2NvcGVzRm9yVG9rZW5pemVkTGluZSh0b2tlbml6ZWRMaW5lKS5zb21lIChzY29wZSkgLT5cbiAgICAgIGlzRnVuY3Rpb25TY29wZShlZGl0b3IsIHNjb3BlKVxuICBlbHNlXG4gICAgZmFsc2VcblxuIyBbRklYTUVdIHZlcnkgcm91Z2ggc3RhdGUsIG5lZWQgaW1wcm92ZW1lbnQuXG5pc0Z1bmN0aW9uU2NvcGUgPSAoZWRpdG9yLCBzY29wZSkgLT5cbiAgc3dpdGNoIGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lXG4gICAgd2hlbiAnc291cmNlLmdvJywgJ3NvdXJjZS5lbGl4aXInXG4gICAgICBzY29wZXMgPSBbJ2VudGl0eS5uYW1lLmZ1bmN0aW9uJ11cbiAgICB3aGVuICdzb3VyY2UucnVieSdcbiAgICAgIHNjb3BlcyA9IFsnbWV0YS5mdW5jdGlvbi4nLCAnbWV0YS5jbGFzcy4nLCAnbWV0YS5tb2R1bGUuJ11cbiAgICBlbHNlXG4gICAgICBzY29wZXMgPSBbJ21ldGEuZnVuY3Rpb24uJywgJ21ldGEuY2xhc3MuJ11cbiAgcGF0dGVybiA9IG5ldyBSZWdFeHAoJ14nICsgc2NvcGVzLm1hcChfLmVzY2FwZVJlZ0V4cCkuam9pbignfCcpKVxuICBwYXR0ZXJuLnRlc3Qoc2NvcGUpXG5cbiMgU2Nyb2xsIHRvIGJ1ZmZlclBvc2l0aW9uIHdpdGggbWluaW11bSBhbW91bnQgdG8ga2VlcCBvcmlnaW5hbCB2aXNpYmxlIGFyZWEuXG4jIElmIHRhcmdldCBwb3NpdGlvbiB3b24ndCBmaXQgd2l0aGluIG9uZVBhZ2VVcCBvciBvbmVQYWdlRG93biwgaXQgY2VudGVyIHRhcmdldCBwb2ludC5cbnNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50KSAtPlxuICBlZGl0b3JFbGVtZW50ID0gZWRpdG9yLmVsZW1lbnRcbiAgZWRpdG9yQXJlYUhlaWdodCA9IGVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSAqIChlZGl0b3IuZ2V0Um93c1BlclBhZ2UoKSAtIDEpXG4gIG9uZVBhZ2VVcCA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgLSBlZGl0b3JBcmVhSGVpZ2h0ICMgTm8gbmVlZCB0byBsaW1pdCB0byBtaW49MFxuICBvbmVQYWdlRG93biA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsQm90dG9tKCkgKyBlZGl0b3JBcmVhSGVpZ2h0XG4gIHRhcmdldCA9IGVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKHBvaW50KS50b3BcblxuICBjZW50ZXIgPSAob25lUGFnZURvd24gPCB0YXJnZXQpIG9yICh0YXJnZXQgPCBvbmVQYWdlVXApXG4gIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKHBvaW50LCB7Y2VudGVyfSlcblxubWF0Y2hTY29wZXMgPSAoZWRpdG9yRWxlbWVudCwgc2NvcGVzKSAtPlxuICBjbGFzc2VzID0gc2NvcGVzLm1hcCAoc2NvcGUpIC0+IHNjb3BlLnNwbGl0KCcuJylcblxuICBmb3IgY2xhc3NOYW1lcyBpbiBjbGFzc2VzXG4gICAgY29udGFpbnNDb3VudCA9IDBcbiAgICBmb3IgY2xhc3NOYW1lIGluIGNsYXNzTmFtZXNcbiAgICAgIGNvbnRhaW5zQ291bnQgKz0gMSBpZiBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpXG4gICAgcmV0dXJuIHRydWUgaWYgY29udGFpbnNDb3VudCBpcyBjbGFzc05hbWVzLmxlbmd0aFxuICBmYWxzZVxuXG5pc1NpbmdsZUxpbmVUZXh0ID0gKHRleHQpIC0+XG4gIHRleHQuc3BsaXQoL1xcbnxcXHJcXG4vKS5sZW5ndGggaXMgMVxuXG4jIFJldHVybiBidWZmZXJSYW5nZSBhbmQga2luZCBbJ3doaXRlLXNwYWNlJywgJ25vbi13b3JkJywgJ3dvcmQnXVxuI1xuIyBUaGlzIGZ1bmN0aW9uIG1vZGlmeSB3b3JkUmVnZXggc28gdGhhdCBpdCBmZWVsIE5BVFVSQUwgaW4gVmltJ3Mgbm9ybWFsIG1vZGUuXG4jIEluIG5vcm1hbC1tb2RlLCBjdXJzb3IgaXMgcmFjdGFuZ2xlKG5vdCBwaXBlKHwpIGNoYXIpLlxuIyBDdXJzb3IgaXMgbGlrZSBPTiB3b3JkIHJhdGhlciB0aGFuIEJFVFdFRU4gd29yZC5cbiMgVGhlIG1vZGlmaWNhdGlvbiBpcyB0YWlsb3JkIGxpa2UgdGhpc1xuIyAgIC0gT04gd2hpdGUtc3BhY2U6IEluY2x1ZHMgb25seSB3aGl0ZS1zcGFjZXMuXG4jICAgLSBPTiBub24td29yZDogSW5jbHVkcyBvbmx5IG5vbiB3b3JkIGNoYXIoPWV4Y2x1ZGVzIG5vcm1hbCB3b3JkIGNoYXIpLlxuI1xuIyBWYWxpZCBvcHRpb25zXG4jICAtIHdvcmRSZWdleDogaW5zdGFuY2Ugb2YgUmVnRXhwXG4jICAtIG5vbldvcmRDaGFyYWN0ZXJzOiBzdHJpbmdcbmdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIG9wdGlvbnM9e30pIC0+XG4gIHtzaW5nbGVOb25Xb3JkQ2hhciwgd29yZFJlZ2V4LCBub25Xb3JkQ2hhcmFjdGVycywgY3Vyc29yfSA9IG9wdGlvbnNcbiAgaWYgbm90IHdvcmRSZWdleD8gb3Igbm90IG5vbldvcmRDaGFyYWN0ZXJzPyAjIENvbXBsZW1lbnQgZnJvbSBjdXJzb3JcbiAgICBjdXJzb3IgPz0gZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuICAgIHt3b3JkUmVnZXgsIG5vbldvcmRDaGFyYWN0ZXJzfSA9IF8uZXh0ZW5kKG9wdGlvbnMsIGJ1aWxkV29yZFBhdHRlcm5CeUN1cnNvcihjdXJzb3IsIG9wdGlvbnMpKVxuICBzaW5nbGVOb25Xb3JkQ2hhciA/PSB0cnVlXG5cbiAgY2hhcmFjdGVyQXRQb2ludCA9IGdldFJpZ2h0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24oZWRpdG9yLCBwb2ludClcbiAgbm9uV29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChcIlsje18uZXNjYXBlUmVnRXhwKG5vbldvcmRDaGFyYWN0ZXJzKX1dK1wiKVxuXG4gIGlmIC9cXHMvLnRlc3QoY2hhcmFjdGVyQXRQb2ludClcbiAgICBzb3VyY2UgPSBcIltcXHQgXStcIlxuICAgIGtpbmQgPSAnd2hpdGUtc3BhY2UnXG4gICAgd29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChzb3VyY2UpXG4gIGVsc2UgaWYgbm9uV29yZFJlZ2V4LnRlc3QoY2hhcmFjdGVyQXRQb2ludCkgYW5kIG5vdCB3b3JkUmVnZXgudGVzdChjaGFyYWN0ZXJBdFBvaW50KVxuICAgIGtpbmQgPSAnbm9uLXdvcmQnXG4gICAgaWYgc2luZ2xlTm9uV29yZENoYXJcbiAgICAgIHNvdXJjZSA9IF8uZXNjYXBlUmVnRXhwKGNoYXJhY3RlckF0UG9pbnQpXG4gICAgICB3b3JkUmVnZXggPSBuZXcgUmVnRXhwKHNvdXJjZSlcbiAgICBlbHNlXG4gICAgICB3b3JkUmVnZXggPSBub25Xb3JkUmVnZXhcbiAgZWxzZVxuICAgIGtpbmQgPSAnd29yZCdcblxuICByYW5nZSA9IGdldFdvcmRCdWZmZXJSYW5nZUF0QnVmZmVyUG9zaXRpb24oZWRpdG9yLCBwb2ludCwge3dvcmRSZWdleH0pXG4gIHtraW5kLCByYW5nZX1cblxuZ2V0V29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIG9wdGlvbnM9e30pIC0+XG4gIGJvdW5kYXJpemVGb3JXb3JkID0gb3B0aW9ucy5ib3VuZGFyaXplRm9yV29yZCA/IHRydWVcbiAgZGVsZXRlIG9wdGlvbnMuYm91bmRhcml6ZUZvcldvcmRcbiAge3JhbmdlLCBraW5kfSA9IGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQsIG9wdGlvbnMpXG4gIHRleHQgPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gIHBhdHRlcm4gPSBfLmVzY2FwZVJlZ0V4cCh0ZXh0KVxuXG4gIGlmIGtpbmQgaXMgJ3dvcmQnIGFuZCBib3VuZGFyaXplRm9yV29yZFxuICAgICMgU2V0IHdvcmQtYm91bmRhcnkoIFxcYiApIGFuY2hvciBvbmx5IHdoZW4gaXQncyBlZmZlY3RpdmUgIzY4OVxuICAgIHN0YXJ0Qm91bmRhcnkgPSBpZiAvXlxcdy8udGVzdCh0ZXh0KSB0aGVuIFwiXFxcXGJcIiBlbHNlICcnXG4gICAgZW5kQm91bmRhcnkgPSBpZiAvXFx3JC8udGVzdCh0ZXh0KSB0aGVuIFwiXFxcXGJcIiBlbHNlICcnXG4gICAgcGF0dGVybiA9IHN0YXJ0Qm91bmRhcnkgKyBwYXR0ZXJuICsgZW5kQm91bmRhcnlcbiAgbmV3IFJlZ0V4cChwYXR0ZXJuLCAnZycpXG5cbmdldFN1YndvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBvcHRpb25zPXt9KSAtPlxuICBvcHRpb25zID0ge3dvcmRSZWdleDogZWRpdG9yLmdldExhc3RDdXJzb3IoKS5zdWJ3b3JkUmVnRXhwKCksIGJvdW5kYXJpemVGb3JXb3JkOiBmYWxzZX1cbiAgZ2V0V29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQsIG9wdGlvbnMpXG5cbiMgUmV0dXJuIG9wdGlvbnMgdXNlZCBmb3IgZ2V0V29yZEJ1ZmZlclJhbmdlQXRCdWZmZXJQb3NpdGlvblxuYnVpbGRXb3JkUGF0dGVybkJ5Q3Vyc29yID0gKGN1cnNvciwge3dvcmRSZWdleH0pIC0+XG4gIG5vbldvcmRDaGFyYWN0ZXJzID0gZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3IoY3Vyc29yKVxuICB3b3JkUmVnZXggPz0gbmV3IFJlZ0V4cChcIl5bXFx0IF0qJHxbXlxcXFxzI3tfLmVzY2FwZVJlZ0V4cChub25Xb3JkQ2hhcmFjdGVycyl9XStcIilcbiAge3dvcmRSZWdleCwgbm9uV29yZENoYXJhY3RlcnN9XG5cbmdldEJlZ2lubmluZ09mV29yZEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIHt3b3JkUmVnZXh9PXt9KSAtPlxuICBzY2FuUmFuZ2UgPSBbW3BvaW50LnJvdywgMF0sIHBvaW50XVxuXG4gIGZvdW5kID0gbnVsbFxuICBlZGl0b3IuYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2Ugd29yZFJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIG1hdGNoVGV4dCwgc3RvcH0pIC0+XG4gICAgcmV0dXJuIGlmIG1hdGNoVGV4dCBpcyAnJyBhbmQgcmFuZ2Uuc3RhcnQuY29sdW1uIGlzbnQgMFxuXG4gICAgaWYgcmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihwb2ludClcbiAgICAgIGlmIHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChwb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZS5zdGFydFxuICAgICAgc3RvcCgpXG5cbiAgZm91bmQgPyBwb2ludFxuXG5nZXRFbmRPZldvcmRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCB7d29yZFJlZ2V4fT17fSkgLT5cbiAgc2NhblJhbmdlID0gW3BvaW50LCBbcG9pbnQucm93LCBJbmZpbml0eV1dXG5cbiAgZm91bmQgPSBudWxsXG4gIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZSB3b3JkUmVnZXgsIHNjYW5SYW5nZSwgKHtyYW5nZSwgbWF0Y2hUZXh0LCBzdG9wfSkgLT5cbiAgICByZXR1cm4gaWYgbWF0Y2hUZXh0IGlzICcnIGFuZCByYW5nZS5zdGFydC5jb2x1bW4gaXNudCAwXG5cbiAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihwb2ludClcbiAgICAgIGlmIHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW5PckVxdWFsKHBvaW50KVxuICAgICAgICBmb3VuZCA9IHJhbmdlLmVuZFxuICAgICAgc3RvcCgpXG5cbiAgZm91bmQgPyBwb2ludFxuXG5nZXRXb3JkQnVmZmVyUmFuZ2VBdEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9zaXRpb24sIG9wdGlvbnM9e30pIC0+XG4gIGVuZFBvc2l0aW9uID0gZ2V0RW5kT2ZXb3JkQnVmZmVyUG9zaXRpb24oZWRpdG9yLCBwb3NpdGlvbiwgb3B0aW9ucylcbiAgc3RhcnRQb3NpdGlvbiA9IGdldEJlZ2lubmluZ09mV29yZEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgZW5kUG9zaXRpb24sIG9wdGlvbnMpXG4gIG5ldyBSYW5nZShzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbilcblxuIyBXaGVuIHJhbmdlIGlzIGxpbmV3aXNlIHJhbmdlLCByYW5nZSBlbmQgaGF2ZSBjb2x1bW4gMCBvZiBORVhUIHJvdy5cbiMgV2hpY2ggaXMgdmVyeSB1bmludHVpdGl2ZSBhbmQgdW53YW50ZWQgcmVzdWx0Llxuc2hyaW5rUmFuZ2VFbmRUb0JlZm9yZU5ld0xpbmUgPSAocmFuZ2UpIC0+XG4gIHtzdGFydCwgZW5kfSA9IHJhbmdlXG4gIGlmIGVuZC5jb2x1bW4gaXMgMFxuICAgIGVuZFJvdyA9IGxpbWl0TnVtYmVyKGVuZC5yb3cgLSAxLCBtaW46IHN0YXJ0LnJvdylcbiAgICBuZXcgUmFuZ2Uoc3RhcnQsIFtlbmRSb3csIEluZmluaXR5XSlcbiAgZWxzZVxuICAgIHJhbmdlXG5cbnNjYW5FZGl0b3IgPSAoZWRpdG9yLCBwYXR0ZXJuKSAtPlxuICByYW5nZXMgPSBbXVxuICBlZGl0b3Iuc2NhbiBwYXR0ZXJuLCAoe3JhbmdlfSkgLT5cbiAgICByYW5nZXMucHVzaChyYW5nZSlcbiAgcmFuZ2VzXG5cbmNvbGxlY3RSYW5nZUluQnVmZmVyUm93ID0gKGVkaXRvciwgcm93LCBwYXR0ZXJuKSAtPlxuICByYW5nZXMgPSBbXVxuICBzY2FuUmFuZ2UgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KVxuICBlZGl0b3Iuc2NhbkluQnVmZmVyUmFuZ2UgcGF0dGVybiwgc2NhblJhbmdlLCAoe3JhbmdlfSkgLT5cbiAgICByYW5nZXMucHVzaChyYW5nZSlcbiAgcmFuZ2VzXG5cbmZpbmRSYW5nZUluQnVmZmVyUm93ID0gKGVkaXRvciwgcGF0dGVybiwgcm93LCB7ZGlyZWN0aW9ufT17fSkgLT5cbiAgaWYgZGlyZWN0aW9uIGlzICdiYWNrd2FyZCdcbiAgICBzY2FuRnVuY3Rpb25OYW1lID0gJ2JhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlJ1xuICBlbHNlXG4gICAgc2NhbkZ1bmN0aW9uTmFtZSA9ICdzY2FuSW5CdWZmZXJSYW5nZSdcblxuICByYW5nZSA9IG51bGxcbiAgc2NhblJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdylcbiAgZWRpdG9yW3NjYW5GdW5jdGlvbk5hbWVdIHBhdHRlcm4sIHNjYW5SYW5nZSwgKGV2ZW50KSAtPiByYW5nZSA9IGV2ZW50LnJhbmdlXG4gIHJhbmdlXG5cbmdldExhcmdlc3RGb2xkUmFuZ2VDb250YWluc0J1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgbWFya2VycyA9IGVkaXRvci5kaXNwbGF5TGF5ZXIuZm9sZHNNYXJrZXJMYXllci5maW5kTWFya2VycyhpbnRlcnNlY3RzUm93OiByb3cpXG5cbiAgc3RhcnRQb2ludCA9IG51bGxcbiAgZW5kUG9pbnQgPSBudWxsXG5cbiAgZm9yIG1hcmtlciBpbiBtYXJrZXJzID8gW11cbiAgICB7c3RhcnQsIGVuZH0gPSBtYXJrZXIuZ2V0UmFuZ2UoKVxuICAgIHVubGVzcyBzdGFydFBvaW50XG4gICAgICBzdGFydFBvaW50ID0gc3RhcnRcbiAgICAgIGVuZFBvaW50ID0gZW5kXG4gICAgICBjb250aW51ZVxuXG4gICAgaWYgc3RhcnQuaXNMZXNzVGhhbihzdGFydFBvaW50KVxuICAgICAgc3RhcnRQb2ludCA9IHN0YXJ0XG4gICAgICBlbmRQb2ludCA9IGVuZFxuXG4gIGlmIHN0YXJ0UG9pbnQ/IGFuZCBlbmRQb2ludD9cbiAgICBuZXcgUmFuZ2Uoc3RhcnRQb2ludCwgZW5kUG9pbnQpXG5cbiMgdGFrZSBidWZmZXJQb3NpdGlvblxudHJhbnNsYXRlUG9pbnRBbmRDbGlwID0gKGVkaXRvciwgcG9pbnQsIGRpcmVjdGlvbikgLT5cbiAgcG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KHBvaW50KVxuXG4gIGRvbnRDbGlwID0gZmFsc2VcbiAgc3dpdGNoIGRpcmVjdGlvblxuICAgIHdoZW4gJ2ZvcndhcmQnXG4gICAgICBwb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgKzFdKVxuICAgICAgZW9sID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHBvaW50LnJvdykuZW5kXG5cbiAgICAgIGlmIHBvaW50LmlzRXF1YWwoZW9sKVxuICAgICAgICBkb250Q2xpcCA9IHRydWVcbiAgICAgIGVsc2UgaWYgcG9pbnQuaXNHcmVhdGVyVGhhbihlb2wpXG4gICAgICAgIGRvbnRDbGlwID0gdHJ1ZVxuICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludC5yb3cgKyAxLCAwKSAjIG1vdmUgcG9pbnQgdG8gbmV3LWxpbmUgc2VsZWN0ZWQgcG9pbnRcblxuICAgICAgcG9pbnQgPSBQb2ludC5taW4ocG9pbnQsIGVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpKVxuXG4gICAgd2hlbiAnYmFja3dhcmQnXG4gICAgICBwb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgLTFdKVxuXG4gICAgICBpZiBwb2ludC5jb2x1bW4gPCAwXG4gICAgICAgIGRvbnRDbGlwID0gdHJ1ZVxuICAgICAgICBuZXdSb3cgPSBwb2ludC5yb3cgLSAxXG4gICAgICAgIGVvbCA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhuZXdSb3cpLmVuZFxuICAgICAgICBwb2ludCA9IG5ldyBQb2ludChuZXdSb3csIGVvbC5jb2x1bW4pXG5cbiAgICAgIHBvaW50ID0gUG9pbnQubWF4KHBvaW50LCBQb2ludC5aRVJPKVxuXG4gIGlmIGRvbnRDbGlwXG4gICAgcG9pbnRcbiAgZWxzZVxuICAgIHNjcmVlblBvaW50ID0gZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24ocG9pbnQsIGNsaXBEaXJlY3Rpb246IGRpcmVjdGlvbilcbiAgICBlZGl0b3IuYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb2ludClcblxuZ2V0UmFuZ2VCeVRyYW5zbGF0ZVBvaW50QW5kQ2xpcCA9IChlZGl0b3IsIHJhbmdlLCB3aGljaCwgZGlyZWN0aW9uKSAtPlxuICBuZXdQb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChlZGl0b3IsIHJhbmdlW3doaWNoXSwgZGlyZWN0aW9uKVxuICBzd2l0Y2ggd2hpY2hcbiAgICB3aGVuICdzdGFydCdcbiAgICAgIG5ldyBSYW5nZShuZXdQb2ludCwgcmFuZ2UuZW5kKVxuICAgIHdoZW4gJ2VuZCdcbiAgICAgIG5ldyBSYW5nZShyYW5nZS5zdGFydCwgbmV3UG9pbnQpXG5cbmdldFBhY2thZ2UgPSAobmFtZSwgZm4pIC0+XG4gIG5ldyBQcm9taXNlIChyZXNvbHZlKSAtPlxuICAgIGlmIGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKG5hbWUpXG4gICAgICBwa2cgPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UobmFtZSlcbiAgICAgIHJlc29sdmUocGtnKVxuICAgIGVsc2VcbiAgICAgIGRpc3Bvc2FibGUgPSBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlIChwa2cpIC0+XG4gICAgICAgIGlmIHBrZy5uYW1lIGlzIG5hbWVcbiAgICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgICAgIHJlc29sdmUocGtnKVxuXG5zZWFyY2hCeVByb2plY3RGaW5kID0gKGVkaXRvciwgdGV4dCkgLT5cbiAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3IuZWxlbWVudCwgJ3Byb2plY3QtZmluZDpzaG93JylcbiAgZ2V0UGFja2FnZSgnZmluZC1hbmQtcmVwbGFjZScpLnRoZW4gKHBrZykgLT5cbiAgICB7cHJvamVjdEZpbmRWaWV3fSA9IHBrZy5tYWluTW9kdWxlXG4gICAgaWYgcHJvamVjdEZpbmRWaWV3P1xuICAgICAgcHJvamVjdEZpbmRWaWV3LmZpbmRFZGl0b3Iuc2V0VGV4dCh0ZXh0KVxuICAgICAgcHJvamVjdEZpbmRWaWV3LmNvbmZpcm0oKVxuXG5saW1pdE51bWJlciA9IChudW1iZXIsIHttYXgsIG1pbn09e30pIC0+XG4gIG51bWJlciA9IE1hdGgubWluKG51bWJlciwgbWF4KSBpZiBtYXg/XG4gIG51bWJlciA9IE1hdGgubWF4KG51bWJlciwgbWluKSBpZiBtaW4/XG4gIG51bWJlclxuXG5maW5kUmFuZ2VDb250YWluc1BvaW50ID0gKHJhbmdlcywgcG9pbnQpIC0+XG4gIGZvciByYW5nZSBpbiByYW5nZXMgd2hlbiByYW5nZS5jb250YWluc1BvaW50KHBvaW50KVxuICAgIHJldHVybiByYW5nZVxuICBudWxsXG5cbm5lZ2F0ZUZ1bmN0aW9uID0gKGZuKSAtPlxuICAoYXJncy4uLikgLT5cbiAgICBub3QgZm4oYXJncy4uLilcblxuaXNFbXB0eSA9ICh0YXJnZXQpIC0+IHRhcmdldC5pc0VtcHR5KClcbmlzTm90RW1wdHkgPSBuZWdhdGVGdW5jdGlvbihpc0VtcHR5KVxuXG5pc1NpbmdsZUxpbmVSYW5nZSA9IChyYW5nZSkgLT4gcmFuZ2UuaXNTaW5nbGVMaW5lKClcbmlzTm90U2luZ2xlTGluZVJhbmdlID0gbmVnYXRlRnVuY3Rpb24oaXNTaW5nbGVMaW5lUmFuZ2UpXG5cbmlzTGVhZGluZ1doaXRlU3BhY2VSYW5nZSA9IChlZGl0b3IsIHJhbmdlKSAtPiAvXltcXHQgXSokLy50ZXN0KGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSkpXG5pc05vdExlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UgPSBuZWdhdGVGdW5jdGlvbihpc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UpXG5cbmlzRXNjYXBlZENoYXJSYW5nZSA9IChlZGl0b3IsIHJhbmdlKSAtPlxuICByYW5nZSA9IFJhbmdlLmZyb21PYmplY3QocmFuZ2UpXG4gIGNoYXJzID0gZ2V0TGVmdENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcmFuZ2Uuc3RhcnQsIDIpXG4gIGNoYXJzLmVuZHNXaXRoKCdcXFxcJykgYW5kIG5vdCBjaGFycy5lbmRzV2l0aCgnXFxcXFxcXFwnKVxuXG5pbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCB0ZXh0KSAtPlxuICBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW3BvaW50LCBwb2ludF0sIHRleHQpXG5cbmVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgdW5sZXNzIGlzRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93KGVkaXRvciwgcm93KVxuICAgIGVvbCA9IGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIHJvdylcbiAgICBpbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIGVvbCwgXCJcXG5cIilcblxuZm9yRWFjaFBhbmVBeGlzID0gKGJhc2UsIGZuKSAtPlxuICBpZiBiYXNlLmNoaWxkcmVuP1xuICAgIGZuKGJhc2UpXG5cbiAgICBmb3IgY2hpbGQgaW4gYmFzZS5jaGlsZHJlblxuICAgICAgZm9yRWFjaFBhbmVBeGlzKGNoaWxkLCBmbilcblxubW9kaWZ5Q2xhc3NMaXN0ID0gKGFjdGlvbiwgZWxlbWVudCwgY2xhc3NOYW1lcy4uLikgLT5cbiAgZWxlbWVudC5jbGFzc0xpc3RbYWN0aW9uXShjbGFzc05hbWVzLi4uKVxuXG5hZGRDbGFzc0xpc3QgPSBtb2RpZnlDbGFzc0xpc3QuYmluZChudWxsLCAnYWRkJylcbnJlbW92ZUNsYXNzTGlzdCA9IG1vZGlmeUNsYXNzTGlzdC5iaW5kKG51bGwsICdyZW1vdmUnKVxudG9nZ2xlQ2xhc3NMaXN0ID0gbW9kaWZ5Q2xhc3NMaXN0LmJpbmQobnVsbCwgJ3RvZ2dsZScpXG5cbnRvZ2dsZUNhc2VGb3JDaGFyYWN0ZXIgPSAoY2hhcikgLT5cbiAgY2hhckxvd2VyID0gY2hhci50b0xvd2VyQ2FzZSgpXG4gIGlmIGNoYXJMb3dlciBpcyBjaGFyXG4gICAgY2hhci50b1VwcGVyQ2FzZSgpXG4gIGVsc2VcbiAgICBjaGFyTG93ZXJcblxuc3BsaXRUZXh0QnlOZXdMaW5lID0gKHRleHQpIC0+XG4gIGlmIHRleHQuZW5kc1dpdGgoXCJcXG5cIilcbiAgICB0ZXh0LnRyaW1SaWdodCgpLnNwbGl0KC9cXHI/XFxuL2cpXG4gIGVsc2VcbiAgICB0ZXh0LnNwbGl0KC9cXHI/XFxuL2cpXG5cbnJlcGxhY2VEZWNvcmF0aW9uQ2xhc3NCeSA9IChmbiwgZGVjb3JhdGlvbikgLT5cbiAgcHJvcHMgPSBkZWNvcmF0aW9uLmdldFByb3BlcnRpZXMoKVxuICBkZWNvcmF0aW9uLnNldFByb3BlcnRpZXMoXy5kZWZhdWx0cyh7Y2xhc3M6IGZuKHByb3BzLmNsYXNzKX0sIHByb3BzKSlcblxuIyBNb2RpZnkgcmFuZ2UgdXNlZCBmb3IgdW5kby9yZWRvIGZsYXNoIGhpZ2hsaWdodCB0byBtYWtlIGl0IGZlZWwgbmF0dXJhbGx5IGZvciBodW1hbi5cbiMgIC0gVHJpbSBzdGFydGluZyBuZXcgbGluZShcIlxcblwiKVxuIyAgICAgXCJcXG5hYmNcIiAtPiBcImFiY1wiXG4jICAtIElmIHJhbmdlLmVuZCBpcyBFT0wgZXh0ZW5kIHJhbmdlIHRvIGZpcnN0IGNvbHVtbiBvZiBuZXh0IGxpbmUuXG4jICAgICBcImFiY1wiIC0+IFwiYWJjXFxuXCJcbiMgZS5nLlxuIyAtIHdoZW4gJ2MnIGlzIGF0RU9MOiBcIlxcbmFiY1wiIC0+IFwiYWJjXFxuXCJcbiMgLSB3aGVuICdjJyBpcyBOT1QgYXRFT0w6IFwiXFxuYWJjXCIgLT4gXCJhYmNcIlxuI1xuIyBTbyBhbHdheXMgdHJpbSBpbml0aWFsIFwiXFxuXCIgcGFydCByYW5nZSBiZWNhdXNlIGZsYXNoaW5nIHRyYWlsaW5nIGxpbmUgaXMgY291bnRlcmludHVpdGl2ZS5cbmh1bWFuaXplQnVmZmVyUmFuZ2UgPSAoZWRpdG9yLCByYW5nZSkgLT5cbiAgaWYgaXNTaW5nbGVMaW5lUmFuZ2UocmFuZ2UpIG9yIGlzTGluZXdpc2VSYW5nZShyYW5nZSlcbiAgICByZXR1cm4gcmFuZ2VcblxuICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICBpZiBwb2ludElzQXRFbmRPZkxpbmUoZWRpdG9yLCBzdGFydClcbiAgICBuZXdTdGFydCA9IHN0YXJ0LnRyYXZlcnNlKFsxLCAwXSlcblxuICBpZiBwb2ludElzQXRFbmRPZkxpbmUoZWRpdG9yLCBlbmQpXG4gICAgbmV3RW5kID0gZW5kLnRyYXZlcnNlKFsxLCAwXSlcblxuICBpZiBuZXdTdGFydD8gb3IgbmV3RW5kP1xuICAgIG5ldyBSYW5nZShuZXdTdGFydCA/IHN0YXJ0LCBuZXdFbmQgPyBlbmQpXG4gIGVsc2VcbiAgICByYW5nZVxuXG4jIEV4cGFuZCByYW5nZSB0byB3aGl0ZSBzcGFjZVxuIyAgMS4gRXhwYW5kIHRvIGZvcndhcmQgZGlyZWN0aW9uLCBpZiBzdWNlZWQgcmV0dXJuIG5ldyByYW5nZS5cbiMgIDIuIEV4cGFuZCB0byBiYWNrd2FyZCBkaXJlY3Rpb24sIGlmIHN1Y2NlZWQgcmV0dXJuIG5ldyByYW5nZS5cbiMgIDMuIFdoZW4gZmFpbGQgdG8gZXhwYW5kIGVpdGhlciBkaXJlY3Rpb24sIHJldHVybiBvcmlnaW5hbCByYW5nZS5cbmV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlcyA9IChlZGl0b3IsIHJhbmdlKSAtPlxuICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuXG4gIG5ld0VuZCA9IG51bGxcbiAgc2NhblJhbmdlID0gW2VuZCwgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KGVkaXRvciwgZW5kLnJvdyldXG4gIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZSAvXFxTLywgc2NhblJhbmdlLCAoe3JhbmdlfSkgLT4gbmV3RW5kID0gcmFuZ2Uuc3RhcnRcblxuICBpZiBuZXdFbmQ/LmlzR3JlYXRlclRoYW4oZW5kKVxuICAgIHJldHVybiBuZXcgUmFuZ2Uoc3RhcnQsIG5ld0VuZClcblxuICBuZXdTdGFydCA9IG51bGxcbiAgc2NhblJhbmdlID0gW1tzdGFydC5yb3csIDBdLCByYW5nZS5zdGFydF1cbiAgZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlIC9cXFMvLCBzY2FuUmFuZ2UsICh7cmFuZ2V9KSAtPiBuZXdTdGFydCA9IHJhbmdlLmVuZFxuXG4gIGlmIG5ld1N0YXJ0Py5pc0xlc3NUaGFuKHN0YXJ0KVxuICAgIHJldHVybiBuZXcgUmFuZ2UobmV3U3RhcnQsIGVuZClcblxuICByZXR1cm4gcmFuZ2UgIyBmYWxsYmFja1xuXG4jIFNwbGl0IGFuZCBqb2luIGFmdGVyIG11dGF0ZSBpdGVtIGJ5IGNhbGxiYWNrIHdpdGgga2VlcCBvcmlnaW5hbCBzZXBhcmF0b3IgdW5jaGFuZ2VkLlxuI1xuIyAxLiBUcmltIGxlYWRpbmcgYW5kIHRyYWlubGluZyB3aGl0ZSBzcGFjZXMgYW5kIHJlbWVtYmVyXG4jIDEuIFNwbGl0IHRleHQgd2l0aCBnaXZlbiBwYXR0ZXJuIGFuZCByZW1lbWJlciBvcmlnaW5hbCBzZXBhcmF0b3JzLlxuIyAyLiBDaGFuZ2Ugb3JkZXIgYnkgY2FsbGJhY2tcbiMgMy4gSm9pbiB3aXRoIG9yaWdpbmFsIHNwZWFyYXRvciBhbmQgY29uY2F0IHdpdGggcmVtZW1iZXJlZCBsZWFkaW5nIGFuZCB0cmFpbmxpbmcgd2hpdGUgc3BhY2VzLlxuI1xuc3BsaXRBbmRKb2luQnkgPSAodGV4dCwgcGF0dGVybiwgZm4pIC0+XG4gIGxlYWRpbmdTcGFjZXMgPSB0cmFpbGluZ1NwYWNlcyA9ICcnXG4gIHN0YXJ0ID0gdGV4dC5zZWFyY2goL1xcUy8pXG4gIGVuZCA9IHRleHQuc2VhcmNoKC9cXHMqJC8pXG4gIGxlYWRpbmdTcGFjZXMgPSB0cmFpbGluZ1NwYWNlcyA9ICcnXG4gIGxlYWRpbmdTcGFjZXMgPSB0ZXh0WzAuLi5zdGFydF0gaWYgc3RhcnQgaXNudCAtMVxuICB0cmFpbGluZ1NwYWNlcyA9IHRleHRbZW5kLi4uXSBpZiBlbmQgaXNudCAtMVxuICB0ZXh0ID0gdGV4dFtzdGFydC4uLmVuZF1cblxuICBmbGFncyA9ICdnJ1xuICBmbGFncyArPSAnaScgaWYgcGF0dGVybi5pZ25vcmVDYXNlXG4gIHJlZ2V4cCA9IG5ldyBSZWdFeHAoXCIoI3twYXR0ZXJuLnNvdXJjZX0pXCIsIGZsYWdzKVxuICAjIGUuZy5cbiAgIyBXaGVuIHRleHQgPSBcImEsIGIsIGNcIiwgcGF0dGVybiA9IC8sP1xccysvXG4gICMgICBpdGVtcyA9IFsnYScsICdiJywgJ2MnXSwgc3BlYXJhdG9ycyA9IFsnLCAnLCAnLCAnXVxuICAjIFdoZW4gdGV4dCA9IFwiYSBiXFxuIGNcIiwgcGF0dGVybiA9IC8sP1xccysvXG4gICMgICBpdGVtcyA9IFsnYScsICdiJywgJ2MnXSwgc3BlYXJhdG9ycyA9IFsnICcsICdcXG4gJ11cbiAgaXRlbXMgPSBbXVxuICBzZXBhcmF0b3JzID0gW11cbiAgZm9yIHNlZ21lbnQsIGkgaW4gdGV4dC5zcGxpdChyZWdleHApXG4gICAgaWYgaSAlIDIgaXMgMFxuICAgICAgaXRlbXMucHVzaChzZWdtZW50KVxuICAgIGVsc2VcbiAgICAgIHNlcGFyYXRvcnMucHVzaChzZWdtZW50KVxuICBzZXBhcmF0b3JzLnB1c2goJycpXG4gIGl0ZW1zID0gZm4oaXRlbXMpXG4gIHJlc3VsdCA9ICcnXG4gIGZvciBbaXRlbSwgc2VwYXJhdG9yXSBpbiBfLnppcChpdGVtcywgc2VwYXJhdG9ycylcbiAgICByZXN1bHQgKz0gaXRlbSArIHNlcGFyYXRvclxuICBsZWFkaW5nU3BhY2VzICsgcmVzdWx0ICsgdHJhaWxpbmdTcGFjZXNcblxuY2xhc3MgQXJndW1lbnRzU3BsaXR0ZXJcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGFsbFRva2VucyA9IFtdXG4gICAgQGN1cnJlbnRTZWN0aW9uID0gbnVsbFxuXG4gIHNldHRsZVBlbmRpbmc6IC0+XG4gICAgaWYgQHBlbmRpbmdUb2tlblxuICAgICAgQGFsbFRva2Vucy5wdXNoKHt0ZXh0OiBAcGVuZGluZ1Rva2VuLCB0eXBlOiBAY3VycmVudFNlY3Rpb259KVxuICAgICAgQHBlbmRpbmdUb2tlbiA9ICcnXG5cbiAgY2hhbmdlU2VjdGlvbjogKG5ld1NlY3Rpb24pIC0+XG4gICAgaWYgQGN1cnJlbnRTZWN0aW9uIGlzbnQgbmV3U2VjdGlvblxuICAgICAgQHNldHRsZVBlbmRpbmcoKSBpZiBAY3VycmVudFNlY3Rpb25cbiAgICAgIEBjdXJyZW50U2VjdGlvbiA9IG5ld1NlY3Rpb25cblxuc3BsaXRBcmd1bWVudHMgPSAodGV4dCwgam9pblNwYWNlU2VwYXJhdGVkVG9rZW4pIC0+XG4gIGpvaW5TcGFjZVNlcGFyYXRlZFRva2VuID89IHRydWVcbiAgc2VwYXJhdG9yQ2hhcnMgPSBcIlxcdCwgXFxyXFxuXCJcbiAgcXVvdGVDaGFycyA9IFwiXFxcIidgXCJcbiAgY2xvc2VDaGFyVG9PcGVuQ2hhciA9IHtcbiAgICBcIilcIjogXCIoXCJcbiAgICBcIn1cIjogXCJ7XCJcbiAgICBcIl1cIjogXCJbXCJcbiAgfVxuICBjbG9zZVBhaXJDaGFycyA9IF8ua2V5cyhjbG9zZUNoYXJUb09wZW5DaGFyKS5qb2luKCcnKVxuICBvcGVuUGFpckNoYXJzID0gXy52YWx1ZXMoY2xvc2VDaGFyVG9PcGVuQ2hhcikuam9pbignJylcbiAgZXNjYXBlQ2hhciA9IFwiXFxcXFwiXG5cbiAgcGVuZGluZ1Rva2VuID0gJydcbiAgaW5RdW90ZSA9IGZhbHNlXG4gIGlzRXNjYXBlZCA9IGZhbHNlXG4gICMgUGFyc2UgdGV4dCBhcyBsaXN0IG9mIHRva2VucyB3aGljaCBpcyBjb21tbWEgc2VwYXJhdGVkIG9yIHdoaXRlIHNwYWNlIHNlcGFyYXRlZC5cbiAgIyBlLmcuICdhLCBmdW4xKGIsIGMpLCBkJyA9PiBbJ2EnLCAnZnVuMShiLCBjKSwgJ2QnXVxuICAjIE5vdCBwZXJmZWN0LiBidXQgZmFyIGJldHRlciB0aGFuIHNpbXBsZSBzdHJpbmcgc3BsaXQgYnkgcmVnZXggcGF0dGVybi5cbiAgYWxsVG9rZW5zID0gW11cbiAgY3VycmVudFNlY3Rpb24gPSBudWxsXG5cbiAgc2V0dGxlUGVuZGluZyA9IC0+XG4gICAgaWYgcGVuZGluZ1Rva2VuXG4gICAgICBhbGxUb2tlbnMucHVzaCh7dGV4dDogcGVuZGluZ1Rva2VuLCB0eXBlOiBjdXJyZW50U2VjdGlvbn0pXG4gICAgICBwZW5kaW5nVG9rZW4gPSAnJ1xuXG4gIGNoYW5nZVNlY3Rpb24gPSAobmV3U2VjdGlvbikgLT5cbiAgICBpZiBjdXJyZW50U2VjdGlvbiBpc250IG5ld1NlY3Rpb25cbiAgICAgIHNldHRsZVBlbmRpbmcoKSBpZiBjdXJyZW50U2VjdGlvblxuICAgICAgY3VycmVudFNlY3Rpb24gPSBuZXdTZWN0aW9uXG5cbiAgcGFpclN0YWNrID0gW11cbiAgZm9yIGNoYXIgaW4gdGV4dFxuICAgIGlmIChwYWlyU3RhY2subGVuZ3RoIGlzIDApIGFuZCAoY2hhciBpbiBzZXBhcmF0b3JDaGFycylcbiAgICAgIGNoYW5nZVNlY3Rpb24oJ3NlcGFyYXRvcicpXG4gICAgZWxzZVxuICAgICAgY2hhbmdlU2VjdGlvbignYXJndW1lbnQnKVxuICAgICAgaWYgaXNFc2NhcGVkXG4gICAgICAgIGlzRXNjYXBlZCA9IGZhbHNlXG4gICAgICBlbHNlIGlmIGNoYXIgaXMgZXNjYXBlQ2hhclxuICAgICAgICBpc0VzY2FwZWQgPSB0cnVlXG4gICAgICBlbHNlIGlmIGluUXVvdGVcbiAgICAgICAgaWYgKGNoYXIgaW4gcXVvdGVDaGFycykgYW5kIF8ubGFzdChwYWlyU3RhY2spIGlzIGNoYXJcbiAgICAgICAgICBwYWlyU3RhY2sucG9wKClcbiAgICAgICAgICBpblF1b3RlID0gZmFsc2VcbiAgICAgIGVsc2UgaWYgY2hhciBpbiBxdW90ZUNoYXJzXG4gICAgICAgIGluUXVvdGUgPSB0cnVlXG4gICAgICAgIHBhaXJTdGFjay5wdXNoKGNoYXIpXG4gICAgICBlbHNlIGlmIGNoYXIgaW4gb3BlblBhaXJDaGFyc1xuICAgICAgICBwYWlyU3RhY2sucHVzaChjaGFyKVxuICAgICAgZWxzZSBpZiBjaGFyIGluIGNsb3NlUGFpckNoYXJzXG4gICAgICAgIHBhaXJTdGFjay5wb3AoKSBpZiBfLmxhc3QocGFpclN0YWNrKSBpcyBjbG9zZUNoYXJUb09wZW5DaGFyW2NoYXJdXG5cbiAgICBwZW5kaW5nVG9rZW4gKz0gY2hhclxuICBzZXR0bGVQZW5kaW5nKClcblxuICBpZiBqb2luU3BhY2VTZXBhcmF0ZWRUb2tlbiBhbmQgYWxsVG9rZW5zLnNvbWUoKHt0eXBlLCB0ZXh0fSkgLT4gdHlwZSBpcyAnc2VwYXJhdG9yJyBhbmQgJywnIGluIHRleHQpXG4gICAgIyBXaGVuIHNvbWUgc2VwYXJhdG9yIGNvbnRhaW5zIGAsYCB0cmVhdCB3aGl0ZS1zcGFjZSBzZXBhcmF0b3IgaXMganVzdCBwYXJ0IG9mIHRva2VuLlxuICAgICMgU28gd2UgbW92ZSB3aGl0ZS1zcGFjZSBvbmx5IHNwYXJhdG9yIGludG8gdG9rZW5zIGJ5IGpvaW5pbmcgbWlzLXNlcGFyYXRvZWQgdG9rZW5zLlxuICAgIG5ld0FsbFRva2VucyA9IFtdXG4gICAgd2hpbGUgYWxsVG9rZW5zLmxlbmd0aFxuICAgICAgdG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgc3dpdGNoIHRva2VuLnR5cGVcbiAgICAgICAgd2hlbiAnYXJndW1lbnQnXG4gICAgICAgICAgbmV3QWxsVG9rZW5zLnB1c2godG9rZW4pXG4gICAgICAgIHdoZW4gJ3NlcGFyYXRvcidcbiAgICAgICAgICBpZiAnLCcgaW4gdG9rZW4udGV4dFxuICAgICAgICAgICAgbmV3QWxsVG9rZW5zLnB1c2godG9rZW4pXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyAxLiBDb25jYXRuYXRlIHdoaXRlLXNwYWNlLXNlcGFyYXRvciBhbmQgbmV4dC1hcmd1bWVudFxuICAgICAgICAgICAgIyAyLiBUaGVuIGpvaW4gaW50byBsYXRlc3QgYXJndW1lbnRcbiAgICAgICAgICAgIGxhc3RBcmcgPSBuZXdBbGxUb2tlbnMucG9wKCkgPyB7dGV4dDogJycsICdhcmd1bWVudCd9XG4gICAgICAgICAgICBsYXN0QXJnLnRleHQgKz0gdG9rZW4udGV4dCArIChhbGxUb2tlbnMuc2hpZnQoKT8udGV4dCA/ICcnKSAjIGNvbmNhdCB3aXRoIG5leHQtYXJndW1lbnRcbiAgICAgICAgICAgIG5ld0FsbFRva2Vucy5wdXNoKGxhc3RBcmcpXG4gICAgYWxsVG9rZW5zID0gbmV3QWxsVG9rZW5zXG4gIGFsbFRva2Vuc1xuXG5zY2FuRWRpdG9ySW5EaXJlY3Rpb24gPSAoZWRpdG9yLCBkaXJlY3Rpb24sIHBhdHRlcm4sIG9wdGlvbnM9e30sIGZuKSAtPlxuICB7YWxsb3dOZXh0TGluZSwgZnJvbSwgc2NhblJhbmdlfSA9IG9wdGlvbnNcbiAgaWYgbm90IGZyb20/IGFuZCBub3Qgc2NhblJhbmdlP1xuICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IGVpdGhlciBvZiAnZnJvbScgb3IgJ3NjYW5SYW5nZScgb3B0aW9uc1wiKVxuXG4gIGlmIHNjYW5SYW5nZVxuICAgIGFsbG93TmV4dExpbmUgPSB0cnVlXG4gIGVsc2VcbiAgICBhbGxvd05leHRMaW5lID89IHRydWVcbiAgZnJvbSA9IFBvaW50LmZyb21PYmplY3QoZnJvbSkgaWYgZnJvbT9cbiAgc3dpdGNoIGRpcmVjdGlvblxuICAgIHdoZW4gJ2ZvcndhcmQnXG4gICAgICBzY2FuUmFuZ2UgPz0gbmV3IFJhbmdlKGZyb20sIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKGVkaXRvcikpXG4gICAgICBzY2FuRnVuY3Rpb24gPSAnc2NhbkluQnVmZmVyUmFuZ2UnXG4gICAgd2hlbiAnYmFja3dhcmQnXG4gICAgICBzY2FuUmFuZ2UgPz0gbmV3IFJhbmdlKFswLCAwXSwgZnJvbSlcbiAgICAgIHNjYW5GdW5jdGlvbiA9ICdiYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSdcblxuICBlZGl0b3Jbc2NhbkZ1bmN0aW9uXSBwYXR0ZXJuLCBzY2FuUmFuZ2UsIChldmVudCkgLT5cbiAgICBpZiBub3QgYWxsb3dOZXh0TGluZSBhbmQgZXZlbnQucmFuZ2Uuc3RhcnQucm93IGlzbnQgZnJvbS5yb3dcbiAgICAgIGV2ZW50LnN0b3AoKVxuICAgICAgcmV0dXJuXG4gICAgZm4oZXZlbnQpXG5cbmFkanVzdEluZGVudFdpdGhLZWVwaW5nTGF5b3V0ID0gKGVkaXRvciwgcmFuZ2UpIC0+XG4gICMgQWRqdXN0IGluZGVudExldmVsIHdpdGgga2VlcGluZyBvcmlnaW5hbCBsYXlvdXQgb2YgcGFzdGluZyB0ZXh0LlxuICAjIFN1Z2dlc3RlZCBpbmRlbnQgbGV2ZWwgb2YgcmFuZ2Uuc3RhcnQucm93IGlzIGNvcnJlY3QgYXMgbG9uZyBhcyByYW5nZS5zdGFydC5yb3cgaGF2ZSBtaW5pbXVtIGluZGVudCBsZXZlbC5cbiAgIyBCdXQgd2hlbiB3ZSBwYXN0ZSBmb2xsb3dpbmcgYWxyZWFkeSBpbmRlbnRlZCB0aHJlZSBsaW5lIHRleHQsIHdlIGhhdmUgdG8gYWRqdXN0IGluZGVudCBsZXZlbFxuICAjICBzbyB0aGF0IGB2YXJGb3J0eVR3b2AgbGluZSBoYXZlIHN1Z2dlc3RlZEluZGVudExldmVsLlxuICAjXG4gICMgICAgICAgIHZhck9uZTogdmFsdWUgIyBzdWdnZXN0ZWRJbmRlbnRMZXZlbCBpcyBkZXRlcm1pbmVkIGJ5IHRoaXMgbGluZVxuICAjICAgdmFyRm9ydHlUd286IHZhbHVlICMgV2UgbmVlZCB0byBtYWtlIGZpbmFsIGluZGVudCBsZXZlbCBvZiB0aGlzIHJvdyB0byBiZSBzdWdnZXN0ZWRJbmRlbnRMZXZlbC5cbiAgIyAgICAgIHZhclRocmVlOiB2YWx1ZVxuICAjXG4gICMgU28gd2hhdCB3ZSBhcmUgZG9pbmcgaGVyZSBpcyBhcHBseSBzdWdnZXN0ZWRJbmRlbnRMZXZlbCB3aXRoIGZpeGluZyBpc3N1ZSBhYm92ZS5cbiAgIyAxLiBEZXRlcm1pbmUgbWluaW11bSBpbmRlbnQgbGV2ZWwgYW1vbmcgcGFzdGVkIHJhbmdlKD0gcmFuZ2UgKSBleGNsdWRpbmcgZW1wdHkgcm93XG4gICMgMi4gVGhlbiB1cGRhdGUgaW5kZW50TGV2ZWwgb2YgZWFjaCByb3dzIHRvIGZpbmFsIGluZGVudExldmVsIG9mIG1pbmltdW0taW5kZW50ZWQgcm93IGhhdmUgc3VnZ2VzdGVkSW5kZW50TGV2ZWwuXG4gIHN1Z2dlc3RlZExldmVsID0gZWRpdG9yLnN1Z2dlc3RlZEluZGVudEZvckJ1ZmZlclJvdyhyYW5nZS5zdGFydC5yb3cpXG4gIG1pbkxldmVsID0gbnVsbFxuICByb3dBbmRBY3R1YWxMZXZlbHMgPSBbXVxuICBmb3Igcm93IGluIFtyYW5nZS5zdGFydC5yb3cuLi5yYW5nZS5lbmQucm93XVxuICAgIGFjdHVhbExldmVsID0gZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coZWRpdG9yLCByb3cpXG4gICAgcm93QW5kQWN0dWFsTGV2ZWxzLnB1c2goW3JvdywgYWN0dWFsTGV2ZWxdKVxuICAgIHVubGVzcyBpc0VtcHR5Um93KGVkaXRvciwgcm93KVxuICAgICAgbWluTGV2ZWwgPSBNYXRoLm1pbihtaW5MZXZlbCA/IEluZmluaXR5LCBhY3R1YWxMZXZlbClcblxuICBpZiBtaW5MZXZlbD8gYW5kIChkZWx0YVRvU3VnZ2VzdGVkTGV2ZWwgPSBzdWdnZXN0ZWRMZXZlbCAtIG1pbkxldmVsKVxuICAgIGZvciBbcm93LCBhY3R1YWxMZXZlbF0gaW4gcm93QW5kQWN0dWFsTGV2ZWxzXG4gICAgICBuZXdMZXZlbCA9IGFjdHVhbExldmVsICsgZGVsdGFUb1N1Z2dlc3RlZExldmVsXG4gICAgICBlZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93LCBuZXdMZXZlbClcblxuIyBDaGVjayBwb2ludCBjb250YWlubWVudCB3aXRoIGVuZCBwb3NpdGlvbiBleGNsdXNpdmVcbnJhbmdlQ29udGFpbnNQb2ludFdpdGhFbmRFeGNsdXNpdmUgPSAocmFuZ2UsIHBvaW50KSAtPlxuICByYW5nZS5zdGFydC5pc0xlc3NUaGFuT3JFcXVhbChwb2ludCkgYW5kXG4gICAgcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4ocG9pbnQpXG5cbnRyYXZlcnNlVGV4dEZyb21Qb2ludCA9IChwb2ludCwgdGV4dCkgLT5cbiAgcG9pbnQudHJhdmVyc2UoZ2V0VHJhdmVyc2FsRm9yVGV4dCh0ZXh0KSlcblxuZ2V0VHJhdmVyc2FsRm9yVGV4dCA9ICh0ZXh0KSAtPlxuICByb3cgPSAwXG4gIGNvbHVtbiA9IDBcbiAgZm9yIGNoYXIgaW4gdGV4dFxuICAgIGlmIGNoYXIgaXMgXCJcXG5cIlxuICAgICAgcm93KytcbiAgICAgIGNvbHVtbiA9IDBcbiAgICBlbHNlXG4gICAgICBjb2x1bW4rK1xuICBbcm93LCBjb2x1bW5dXG5cblxuIyBSZXR1cm4gZW5kUm93IG9mIGZvbGQgaWYgcm93IHdhcyBmb2xkZWQgb3IganVzdCByZXR1cm4gcGFzc2VkIHJvdy5cbmdldEZvbGRFbmRSb3dGb3JSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIGlmIGVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdylcbiAgICBnZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3coZWRpdG9yLCByb3cpLmVuZC5yb3dcbiAgZWxzZVxuICAgIHJvd1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXNzZXJ0V2l0aEV4Y2VwdGlvblxuICBnZXRBbmNlc3RvcnNcbiAgZ2V0S2V5QmluZGluZ0ZvckNvbW1hbmRcbiAgaW5jbHVkZVxuICBkZWJ1Z1xuICBzYXZlRWRpdG9yU3RhdGVcbiAgaXNMaW5ld2lzZVJhbmdlXG4gIHNvcnRSYW5nZXNcbiAgZ2V0SW5kZXhcbiAgZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlXG4gIGdldFZpc2libGVFZGl0b3JzXG4gIHBvaW50SXNBdEVuZE9mTGluZVxuICBwb2ludElzT25XaGl0ZVNwYWNlXG4gIHBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3dcbiAgcG9pbnRJc0F0VmltRW5kT2ZGaWxlXG4gIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uXG4gIGdldFZpbUVvZlNjcmVlblBvc2l0aW9uXG4gIGdldFZpbUxhc3RCdWZmZXJSb3dcbiAgZ2V0VmltTGFzdFNjcmVlblJvd1xuICBzZXRCdWZmZXJSb3dcbiAgc2V0QnVmZmVyQ29sdW1uXG4gIG1vdmVDdXJzb3JMZWZ0XG4gIG1vdmVDdXJzb3JSaWdodFxuICBtb3ZlQ3Vyc29yVXBTY3JlZW5cbiAgbW92ZUN1cnNvckRvd25TY3JlZW5cbiAgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93XG4gIGdldEZpcnN0VmlzaWJsZVNjcmVlblJvd1xuICBnZXRMYXN0VmlzaWJsZVNjcmVlblJvd1xuICBnZXRWYWxpZFZpbUJ1ZmZlclJvd1xuICBnZXRWYWxpZFZpbVNjcmVlblJvd1xuICBtb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93XG4gIGdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvblxuICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvd1xuICBnZXRUZXh0SW5TY3JlZW5SYW5nZVxuICBtb3ZlQ3Vyc29yVG9OZXh0Tm9uV2hpdGVzcGFjZVxuICBpc0VtcHR5Um93XG4gIGdldENvZGVGb2xkUm93UmFuZ2VzXG4gIGdldENvZGVGb2xkUm93UmFuZ2VzQ29udGFpbmVzRm9yUm93XG4gIGdldEZvbGRSb3dSYW5nZXNDb250YWluZWRCeUZvbGRTdGFydHNBdFJvd1xuICBnZXRGb2xkUm93UmFuZ2VzXG4gIGdldEZvbGRSYW5nZXNXaXRoSW5kZW50XG4gIGdldEZvbGRJbmZvQnlLaW5kXG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2VcbiAgdHJpbVJhbmdlXG4gIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3dcbiAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvd1xuICBkZXRlY3RTY29wZVN0YXJ0UG9zaXRpb25Gb3JTY29wZVxuICBnZXRCdWZmZXJSb3dzXG4gIHNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvblxuICBtYXRjaFNjb3Blc1xuICBpc1NpbmdsZUxpbmVUZXh0XG4gIGdldFdvcmRCdWZmZXJSYW5nZUF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0V29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uXG4gIGdldFN1YndvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvblxuICBnZXROb25Xb3JkQ2hhcmFjdGVyc0ZvckN1cnNvclxuICBzaHJpbmtSYW5nZUVuZFRvQmVmb3JlTmV3TGluZVxuICBzY2FuRWRpdG9yXG4gIGNvbGxlY3RSYW5nZUluQnVmZmVyUm93XG4gIGZpbmRSYW5nZUluQnVmZmVyUm93XG4gIGdldExhcmdlc3RGb2xkUmFuZ2VDb250YWluc0J1ZmZlclJvd1xuICB0cmFuc2xhdGVQb2ludEFuZENsaXBcbiAgZ2V0UmFuZ2VCeVRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxuICBnZXRQYWNrYWdlXG4gIHNlYXJjaEJ5UHJvamVjdEZpbmRcbiAgbGltaXROdW1iZXJcbiAgZmluZFJhbmdlQ29udGFpbnNQb2ludFxuXG4gIGlzRW1wdHksIGlzTm90RW1wdHlcbiAgaXNTaW5nbGVMaW5lUmFuZ2UsIGlzTm90U2luZ2xlTGluZVJhbmdlXG5cbiAgaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb25cbiAgZW5zdXJlRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93XG4gIGlzTGVhZGluZ1doaXRlU3BhY2VSYW5nZVxuICBpc05vdExlYWRpbmdXaGl0ZVNwYWNlUmFuZ2VcbiAgaXNFc2NhcGVkQ2hhclJhbmdlXG5cbiAgZm9yRWFjaFBhbmVBeGlzXG4gIGFkZENsYXNzTGlzdFxuICByZW1vdmVDbGFzc0xpc3RcbiAgdG9nZ2xlQ2xhc3NMaXN0XG4gIHRvZ2dsZUNhc2VGb3JDaGFyYWN0ZXJcbiAgc3BsaXRUZXh0QnlOZXdMaW5lXG4gIHJlcGxhY2VEZWNvcmF0aW9uQ2xhc3NCeVxuICBodW1hbml6ZUJ1ZmZlclJhbmdlXG4gIGV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlc1xuICBzcGxpdEFuZEpvaW5CeVxuICBzcGxpdEFyZ3VtZW50c1xuICBzY2FuRWRpdG9ySW5EaXJlY3Rpb25cbiAgYWRqdXN0SW5kZW50V2l0aEtlZXBpbmdMYXlvdXRcbiAgcmFuZ2VDb250YWluc1BvaW50V2l0aEVuZEV4Y2x1c2l2ZVxuICB0cmF2ZXJzZVRleHRGcm9tUG9pbnRcbiAgZ2V0Rm9sZEVuZFJvd0ZvclJvd1xufVxuIl19
