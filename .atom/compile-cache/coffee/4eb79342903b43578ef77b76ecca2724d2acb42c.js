(function() {
  var ArgumentsSplitter, Disposable, Point, Range, _, addClassList, adjustIndentWithKeepingLayout, assertWithException, buildWordPatternByCursor, collectRangeInBufferRow, debug, detectScopeStartPositionForScope, ensureEndsWithNewLineForBufferRow, expandRangeToWhiteSpaces, findRangeContainsPoint, findRangeInBufferRow, fs, getAncestors, getBeginningOfWordBufferPosition, getBufferRangeForRowRange, getBufferRows, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getEndOfLineForBufferRow, getEndOfWordBufferPosition, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getFoldEndRowForRow, getFoldInfoByKind, getFoldRangesWithIndent, getFoldRowRanges, getFoldRowRangesContainedByFoldStartsAtRow, getIndentLevelForBufferRow, getIndex, getKeyBindingForCommand, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getLeftCharacterForBufferPosition, getLineTextToBufferPosition, getNonWordCharactersForCursor, getPackage, getRangeByTranslatePointAndClip, getRightCharacterForBufferPosition, getScopesForTokenizedLine, getSubwordPatternAtBufferPosition, getTextInScreenRange, getTokenizedLineForRow, getTraversalForText, getValidVimBufferRow, getValidVimScreenRow, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, getVisibleEditors, getWordBufferRangeAndKindAtBufferPosition, getWordBufferRangeAtBufferPosition, getWordPatternAtBufferPosition, humanizeBufferRange, include, insertTextAtBufferPosition, isEmpty, isEmptyRow, isEndsWithNewLineForBufferRow, isEscapedCharRange, isFunctionScope, isIncludeFunctionScopeForRow, isLeadingWhiteSpaceRange, isLinewiseRange, isNotEmpty, isNotLeadingWhiteSpaceRange, isNotSingleLineRange, isSingleLineRange, isSingleLineText, limitNumber, matchScopes, modifyClassList, moveCursor, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpScreen, negateFunction, pointIsAtEndOfLine, pointIsAtEndOfLineAtNonEmptyRow, pointIsAtVimEndOfFile, pointIsOnWhiteSpace, rangeContainsPointWithEndExclusive, ref, removeClassList, replaceDecorationClassBy, saveEditorState, scanEditor, scanEditorInDirection, scanForScopeStart, searchByProjectFind, setBufferColumn, setBufferRow, settings, shouldPreventWrapLine, shrinkRangeEndToBeforeNewLine, smartScrollToBufferPosition, sortRanges, splitAndJoinBy, splitArguments, splitTextByNewLine, toggleCaseForCharacter, toggleClassList, translatePointAndClip, traverseTextFromPoint, trimRange,
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
      case 'source.rust':
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3V0aWxzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdTlFQUFBO0lBQUE7OztFQUFBLEVBQUEsR0FBSzs7RUFDTCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBRVgsTUFBNkIsT0FBQSxDQUFRLE1BQVIsQ0FBN0IsRUFBQywyQkFBRCxFQUFhLGlCQUFiLEVBQW9COztFQUNwQixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVKLG1CQUFBLEdBQXNCLFNBQUMsU0FBRCxFQUFZLE9BQVosRUFBcUIsRUFBckI7V0FDcEIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxTQUFaLEVBQXVCLE9BQXZCLEVBQWdDLFNBQUMsS0FBRDtBQUM5QixZQUFVLElBQUEsS0FBQSxDQUFNLEtBQUssQ0FBQyxPQUFaO0lBRG9CLENBQWhDO0VBRG9COztFQUl0QixZQUFBLEdBQWUsU0FBQyxHQUFEO0FBQ2IsUUFBQTtJQUFBLFNBQUEsR0FBWTtJQUNaLE9BQUEsR0FBVTtBQUNWLFdBQUEsSUFBQTtNQUNFLFNBQVMsQ0FBQyxJQUFWLENBQWUsT0FBZjtNQUNBLE9BQUEsNENBQTJCLENBQUU7TUFDN0IsSUFBQSxDQUFhLE9BQWI7QUFBQSxjQUFBOztJQUhGO1dBSUE7RUFQYTs7RUFTZix1QkFBQSxHQUEwQixTQUFDLE9BQUQsRUFBVSxHQUFWO0FBQ3hCLFFBQUE7SUFEbUMsY0FBRDtJQUNsQyxPQUFBLEdBQVU7SUFDVixPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQUE7SUFDVixJQUFHLG1CQUFIO01BQ0UsVUFBQSxHQUFhLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsV0FBL0IsQ0FBMkMsQ0FBQyxjQUE1QyxDQUFBLENBQTRELENBQUMsR0FBN0QsQ0FBQTtNQUNiLE9BQUEsR0FB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RGU7SUErRGYsaUNBQUEsK0JBL0RlO0lBZ0VmLFlBQUEsVUFoRWU7SUFpRWYscUJBQUEsbUJBakVlO0lBa0VmLGFBQUEsV0FsRWU7SUFtRWYsd0JBQUEsc0JBbkVlO0lBcUVmLFNBQUEsT0FyRWU7SUFxRU4sWUFBQSxVQXJFTTtJQXNFZixtQkFBQSxpQkF0RWU7SUFzRUksc0JBQUEsb0JBdEVKO0lBd0VmLDRCQUFBLDBCQXhFZTtJQXlFZixtQ0FBQSxpQ0F6RWU7SUEwRWYsMEJBQUEsd0JBMUVlO0lBMkVmLDZCQUFBLDJCQTNFZTtJQTRFZixvQkFBQSxrQkE1RWU7SUE4RWYsY0FBQSxZQTlFZTtJQStFZixpQkFBQSxlQS9FZTtJQWdGZixpQkFBQSxlQWhGZTtJQWlGZix3QkFBQSxzQkFqRmU7SUFrRmYsb0JBQUEsa0JBbEZlO0lBbUZmLDBCQUFBLHdCQW5GZTtJQW9GZixxQkFBQSxtQkFwRmU7SUFxRmYsMEJBQUEsd0JBckZlO0lBc0ZmLGdCQUFBLGNBdEZlO0lBdUZmLGdCQUFBLGNBdkZlO0lBd0ZmLHVCQUFBLHFCQXhGZTtJQXlGZiwrQkFBQSw2QkF6RmU7SUEwRmYsb0NBQUEsa0NBMUZlO0lBMkZmLHVCQUFBLHFCQTNGZTtJQTRGZixxQkFBQSxtQkE1RmU7O0FBajlCakIiLCJzb3VyY2VzQ29udGVudCI6WyJmcyA9IG51bGxcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxue0Rpc3Bvc2FibGUsIFJhbmdlLCBQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuYXNzZXJ0V2l0aEV4Y2VwdGlvbiA9IChjb25kaXRpb24sIG1lc3NhZ2UsIGZuKSAtPlxuICBhdG9tLmFzc2VydCBjb25kaXRpb24sIG1lc3NhZ2UsIChlcnJvcikgLT5cbiAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSlcblxuZ2V0QW5jZXN0b3JzID0gKG9iaikgLT5cbiAgYW5jZXN0b3JzID0gW11cbiAgY3VycmVudCA9IG9ialxuICBsb29wXG4gICAgYW5jZXN0b3JzLnB1c2goY3VycmVudClcbiAgICBjdXJyZW50ID0gY3VycmVudC5fX3N1cGVyX18/LmNvbnN0cnVjdG9yXG4gICAgYnJlYWsgdW5sZXNzIGN1cnJlbnRcbiAgYW5jZXN0b3JzXG5cbmdldEtleUJpbmRpbmdGb3JDb21tYW5kID0gKGNvbW1hbmQsIHtwYWNrYWdlTmFtZX0pIC0+XG4gIHJlc3VsdHMgPSBudWxsXG4gIGtleW1hcHMgPSBhdG9tLmtleW1hcHMuZ2V0S2V5QmluZGluZ3MoKVxuICBpZiBwYWNrYWdlTmFtZT9cbiAgICBrZXltYXBQYXRoID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKHBhY2thZ2VOYW1lKS5nZXRLZXltYXBQYXRocygpLnBvcCgpXG4gICAga2V5bWFwcyA9IGtleW1hcHMuZmlsdGVyKCh7c291cmNlfSkgLT4gc291cmNlIGlzIGtleW1hcFBhdGgpXG5cbiAgZm9yIGtleW1hcCBpbiBrZXltYXBzIHdoZW4ga2V5bWFwLmNvbW1hbmQgaXMgY29tbWFuZFxuICAgIHtrZXlzdHJva2VzLCBzZWxlY3Rvcn0gPSBrZXltYXBcbiAgICBrZXlzdHJva2VzID0ga2V5c3Ryb2tlcy5yZXBsYWNlKC9zaGlmdC0vLCAnJylcbiAgICAocmVzdWx0cyA/PSBbXSkucHVzaCh7a2V5c3Ryb2tlcywgc2VsZWN0b3J9KVxuICByZXN1bHRzXG5cbiMgSW5jbHVkZSBtb2R1bGUob2JqZWN0IHdoaWNoIG5vcm1hbHkgcHJvdmlkZXMgc2V0IG9mIG1ldGhvZHMpIHRvIGtsYXNzXG5pbmNsdWRlID0gKGtsYXNzLCBtb2R1bGUpIC0+XG4gIGZvciBrZXksIHZhbHVlIG9mIG1vZHVsZVxuICAgIGtsYXNzOjpba2V5XSA9IHZhbHVlXG5cbmRlYnVnID0gKG1lc3NhZ2VzLi4uKSAtPlxuICByZXR1cm4gdW5sZXNzIHNldHRpbmdzLmdldCgnZGVidWcnKVxuICBzd2l0Y2ggc2V0dGluZ3MuZ2V0KCdkZWJ1Z091dHB1dCcpXG4gICAgd2hlbiAnY29uc29sZSdcbiAgICAgIGNvbnNvbGUubG9nIG1lc3NhZ2VzLi4uXG4gICAgd2hlbiAnZmlsZSdcbiAgICAgIGZzID89IHJlcXVpcmUgJ2ZzLXBsdXMnXG4gICAgICBmaWxlUGF0aCA9IGZzLm5vcm1hbGl6ZSBzZXR0aW5ncy5nZXQoJ2RlYnVnT3V0cHV0RmlsZVBhdGgnKVxuICAgICAgaWYgZnMuZXhpc3RzU3luYyhmaWxlUGF0aClcbiAgICAgICAgZnMuYXBwZW5kRmlsZVN5bmMgZmlsZVBhdGgsIG1lc3NhZ2VzICsgXCJcXG5cIlxuXG4jIFJldHVybiBmdW5jdGlvbiB0byByZXN0b3JlIGVkaXRvcidzIHNjcm9sbFRvcCBhbmQgZm9sZCBzdGF0ZS5cbnNhdmVFZGl0b3JTdGF0ZSA9IChlZGl0b3IpIC0+XG4gIGVkaXRvckVsZW1lbnQgPSBlZGl0b3IuZWxlbWVudFxuICBzY3JvbGxUb3AgPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpXG5cbiAgZm9sZFN0YXJ0Um93cyA9IGVkaXRvci5kaXNwbGF5TGF5ZXIuZm9sZHNNYXJrZXJMYXllci5maW5kTWFya2Vycyh7fSkubWFwIChtKSAtPiBtLmdldFN0YXJ0UG9zaXRpb24oKS5yb3dcbiAgLT5cbiAgICBmb3Igcm93IGluIGZvbGRTdGFydFJvd3MucmV2ZXJzZSgpIHdoZW4gbm90IGVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdylcbiAgICAgIGVkaXRvci5mb2xkQnVmZmVyUm93KHJvdylcbiAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcChzY3JvbGxUb3ApXG5cbmlzTGluZXdpc2VSYW5nZSA9ICh7c3RhcnQsIGVuZH0pIC0+XG4gIChzdGFydC5yb3cgaXNudCBlbmQucm93KSBhbmQgKHN0YXJ0LmNvbHVtbiBpcyBlbmQuY29sdW1uIGlzIDApXG5cbmlzRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICB7c3RhcnQsIGVuZH0gPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93LCBpbmNsdWRlTmV3bGluZTogdHJ1ZSlcbiAgc3RhcnQucm93IGlzbnQgZW5kLnJvd1xuXG5zb3J0UmFuZ2VzID0gKGNvbGxlY3Rpb24pIC0+XG4gIGNvbGxlY3Rpb24uc29ydCAoYSwgYikgLT4gYS5jb21wYXJlKGIpXG5cbiMgUmV0dXJuIGFkanVzdGVkIGluZGV4IGZpdCB3aGl0aW4gZ2l2ZW4gbGlzdCdzIGxlbmd0aFxuIyByZXR1cm4gLTEgaWYgbGlzdCBpcyBlbXB0eS5cbmdldEluZGV4ID0gKGluZGV4LCBsaXN0KSAtPlxuICBsZW5ndGggPSBsaXN0Lmxlbmd0aFxuICBpZiBsZW5ndGggaXMgMFxuICAgIC0xXG4gIGVsc2VcbiAgICBpbmRleCA9IGluZGV4ICUgbGVuZ3RoXG4gICAgaWYgaW5kZXggPj0gMFxuICAgICAgaW5kZXhcbiAgICBlbHNlXG4gICAgICBsZW5ndGggKyBpbmRleFxuXG4jIE5PVEU6IGVuZFJvdyBiZWNvbWUgdW5kZWZpbmVkIGlmIEBlZGl0b3JFbGVtZW50IGlzIG5vdCB5ZXQgYXR0YWNoZWQuXG4jIGUuZy4gQmVnaW5nIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlciBvcGVuIGZpbGUuXG5nZXRWaXNpYmxlQnVmZmVyUmFuZ2UgPSAoZWRpdG9yKSAtPlxuICBbc3RhcnRSb3csIGVuZFJvd10gPSBlZGl0b3IuZWxlbWVudC5nZXRWaXNpYmxlUm93UmFuZ2UoKVxuICByZXR1cm4gbnVsbCB1bmxlc3MgKHN0YXJ0Um93PyBhbmQgZW5kUm93PylcbiAgc3RhcnRSb3cgPSBlZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHN0YXJ0Um93KVxuICBlbmRSb3cgPSBlZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KGVuZFJvdylcbiAgbmV3IFJhbmdlKFtzdGFydFJvdywgMF0sIFtlbmRSb3csIEluZmluaXR5XSlcblxuZ2V0VmlzaWJsZUVkaXRvcnMgPSAtPlxuICAoZWRpdG9yIGZvciBwYW5lIGluIGF0b20ud29ya3NwYWNlLmdldFBhbmVzKCkgd2hlbiBlZGl0b3IgPSBwYW5lLmdldEFjdGl2ZUVkaXRvcigpKVxuXG5nZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpLmVuZFxuXG4jIFBvaW50IHV0aWxcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxucG9pbnRJc0F0RW5kT2ZMaW5lID0gKGVkaXRvciwgcG9pbnQpIC0+XG4gIHBvaW50ID0gUG9pbnQuZnJvbU9iamVjdChwb2ludClcbiAgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KGVkaXRvciwgcG9pbnQucm93KS5pc0VxdWFsKHBvaW50KVxuXG5wb2ludElzT25XaGl0ZVNwYWNlID0gKGVkaXRvciwgcG9pbnQpIC0+XG4gIGNoYXIgPSBnZXRSaWdodENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQpXG4gIG5vdCAvXFxTLy50ZXN0KGNoYXIpXG5cbnBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3cgPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgcG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KHBvaW50KVxuICBwb2ludC5jb2x1bW4gaXNudCAwIGFuZCBwb2ludElzQXRFbmRPZkxpbmUoZWRpdG9yLCBwb2ludClcblxucG9pbnRJc0F0VmltRW5kT2ZGaWxlID0gKGVkaXRvciwgcG9pbnQpIC0+XG4gIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKGVkaXRvcikuaXNFcXVhbChwb2ludClcblxuaXNFbXB0eVJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdykuaXNFbXB0eSgpXG5cbmdldFJpZ2h0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgYW1vdW50PTEpIC0+XG4gIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIGFtb3VudCkpXG5cbmdldExlZnRDaGFyYWN0ZXJGb3JCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBhbW91bnQ9MSkgLT5cbiAgZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShwb2ludCwgMCwgLWFtb3VudCkpXG5cbmdldFRleHRJblNjcmVlblJhbmdlID0gKGVkaXRvciwgc2NyZWVuUmFuZ2UpIC0+XG4gIGJ1ZmZlclJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yU2NyZWVuUmFuZ2Uoc2NyZWVuUmFuZ2UpXG4gIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShidWZmZXJSYW5nZSlcblxuZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3IgPSAoY3Vyc29yKSAtPlxuICAjIEF0b20gMS4xMS4wLWJldGE1IGhhdmUgdGhpcyBleHBlcmltZW50YWwgbWV0aG9kLlxuICBpZiBjdXJzb3IuZ2V0Tm9uV29yZENoYXJhY3RlcnM/XG4gICAgY3Vyc29yLmdldE5vbldvcmRDaGFyYWN0ZXJzKClcbiAgZWxzZVxuICAgIHNjb3BlID0gY3Vyc29yLmdldFNjb3BlRGVzY3JpcHRvcigpLmdldFNjb3Blc0FycmF5KClcbiAgICBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5ub25Xb3JkQ2hhcmFjdGVycycsIHtzY29wZX0pXG5cbiMgRklYTUU6IHJlbW92ZSB0aGlzXG4jIHJldHVybiB0cnVlIGlmIG1vdmVkXG5tb3ZlQ3Vyc29yVG9OZXh0Tm9uV2hpdGVzcGFjZSA9IChjdXJzb3IpIC0+XG4gIG9yaWdpbmFsUG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICBlZGl0b3IgPSBjdXJzb3IuZWRpdG9yXG4gIHZpbUVvZiA9IGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKGVkaXRvcilcblxuICB3aGlsZSBwb2ludElzT25XaGl0ZVNwYWNlKGVkaXRvciwgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkgYW5kIG5vdCBwb2ludC5pc0dyZWF0ZXJUaGFuT3JFcXVhbCh2aW1Fb2YpXG4gICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gIG5vdCBvcmlnaW5hbFBvaW50LmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG5cbmdldEJ1ZmZlclJvd3MgPSAoZWRpdG9yLCB7c3RhcnRSb3csIGRpcmVjdGlvbn0pIC0+XG4gIHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdwcmV2aW91cydcbiAgICAgIGlmIHN0YXJ0Um93IDw9IDBcbiAgICAgICAgW11cbiAgICAgIGVsc2VcbiAgICAgICAgWyhzdGFydFJvdyAtIDEpLi4wXVxuICAgIHdoZW4gJ25leHQnXG4gICAgICBlbmRSb3cgPSBnZXRWaW1MYXN0QnVmZmVyUm93KGVkaXRvcilcbiAgICAgIGlmIHN0YXJ0Um93ID49IGVuZFJvd1xuICAgICAgICBbXVxuICAgICAgZWxzZVxuICAgICAgICBbKHN0YXJ0Um93ICsgMSkuLmVuZFJvd11cblxuIyBSZXR1cm4gVmltJ3MgRU9GIHBvc2l0aW9uIHJhdGhlciB0aGFuIEF0b20ncyBFT0YgcG9zaXRpb24uXG4jIFRoaXMgZnVuY3Rpb24gY2hhbmdlIG1lYW5pbmcgb2YgRU9GIGZyb20gbmF0aXZlIFRleHRFZGl0b3I6OmdldEVvZkJ1ZmZlclBvc2l0aW9uKClcbiMgQXRvbSBpcyBzcGVjaWFsKHN0cmFuZ2UpIGZvciBjdXJzb3IgY2FuIHBhc3QgdmVyeSBsYXN0IG5ld2xpbmUgY2hhcmFjdGVyLlxuIyBCZWNhdXNlIG9mIHRoaXMsIEF0b20ncyBFT0YgcG9zaXRpb24gaXMgW2FjdHVhbExhc3RSb3crMSwgMF0gcHJvdmlkZWQgbGFzdC1ub24tYmxhbmstcm93XG4jIGVuZHMgd2l0aCBuZXdsaW5lIGNoYXIuXG4jIEJ1dCBpbiBWaW0sIGN1cm9yIGNhbiBOT1QgcGFzdCBsYXN0IG5ld2xpbmUuIEVPRiBpcyBuZXh0IHBvc2l0aW9uIG9mIHZlcnkgbGFzdCBjaGFyYWN0ZXIuXG5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IpIC0+XG4gIGVvZiA9IGVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpXG4gIGlmIChlb2Yucm93IGlzIDApIG9yIChlb2YuY29sdW1uID4gMClcbiAgICBlb2ZcbiAgZWxzZVxuICAgIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIGVvZi5yb3cgLSAxKVxuXG5nZXRWaW1Fb2ZTY3JlZW5Qb3NpdGlvbiA9IChlZGl0b3IpIC0+XG4gIGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKGVkaXRvcikpXG5cbmdldFZpbUxhc3RCdWZmZXJSb3cgPSAoZWRpdG9yKSAtPiBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpLnJvd1xuZ2V0VmltTGFzdFNjcmVlblJvdyA9IChlZGl0b3IpIC0+IGdldFZpbUVvZlNjcmVlblBvc2l0aW9uKGVkaXRvcikucm93XG5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cgPSAoZWRpdG9yKSAtPiBlZGl0b3IuZWxlbWVudC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3cgPSAoZWRpdG9yKSAtPiBlZGl0b3IuZWxlbWVudC5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG5cbmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIHJhbmdlID0gZmluZFJhbmdlSW5CdWZmZXJSb3coZWRpdG9yLCAvXFxTLywgcm93KVxuICByYW5nZT8uc3RhcnQgPyBuZXcgUG9pbnQocm93LCAwKVxuXG50cmltUmFuZ2UgPSAoZWRpdG9yLCBzY2FuUmFuZ2UpIC0+XG4gIHBhdHRlcm4gPSAvXFxTL1xuICBbc3RhcnQsIGVuZF0gPSBbXVxuICBzZXRTdGFydCA9ICh7cmFuZ2V9KSAtPiB7c3RhcnR9ID0gcmFuZ2VcbiAgc2V0RW5kID0gKHtyYW5nZX0pIC0+IHtlbmR9ID0gcmFuZ2VcbiAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlKHBhdHRlcm4sIHNjYW5SYW5nZSwgc2V0U3RhcnQpXG4gIGVkaXRvci5iYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZShwYXR0ZXJuLCBzY2FuUmFuZ2UsIHNldEVuZCkgaWYgc3RhcnQ/XG4gIGlmIHN0YXJ0PyBhbmQgZW5kP1xuICAgIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuICBlbHNlXG4gICAgc2NhblJhbmdlXG5cbiMgQ3Vyc29yIG1vdGlvbiB3cmFwcGVyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgSnVzdCB1cGRhdGUgYnVmZmVyUm93IHdpdGgga2VlcGluZyBjb2x1bW4gYnkgcmVzcGVjdGluZyBnb2FsQ29sdW1uXG5zZXRCdWZmZXJSb3cgPSAoY3Vyc29yLCByb3csIG9wdGlvbnMpIC0+XG4gIGNvbHVtbiA9IGN1cnNvci5nb2FsQ29sdW1uID8gY3Vyc29yLmdldEJ1ZmZlckNvbHVtbigpXG4gIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcm93LCBjb2x1bW5dLCBvcHRpb25zKVxuICBjdXJzb3IuZ29hbENvbHVtbiA9IGNvbHVtblxuXG5zZXRCdWZmZXJDb2x1bW4gPSAoY3Vyc29yLCBjb2x1bW4pIC0+XG4gIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbY3Vyc29yLmdldEJ1ZmZlclJvdygpLCBjb2x1bW5dKVxuXG5tb3ZlQ3Vyc29yID0gKGN1cnNvciwge3ByZXNlcnZlR29hbENvbHVtbn0sIGZuKSAtPlxuICB7Z29hbENvbHVtbn0gPSBjdXJzb3JcbiAgZm4oY3Vyc29yKVxuICBpZiBwcmVzZXJ2ZUdvYWxDb2x1bW4gYW5kIGdvYWxDb2x1bW4/XG4gICAgY3Vyc29yLmdvYWxDb2x1bW4gPSBnb2FsQ29sdW1uXG5cbiMgV29ya2Fyb3VuZCBpc3N1ZSBmb3IgdDltZC92aW0tbW9kZS1wbHVzIzIyNiBhbmQgYXRvbS9hdG9tIzMxNzRcbiMgSSBjYW5ub3QgZGVwZW5kIGN1cnNvcidzIGNvbHVtbiBzaW5jZSBpdHMgY2xhaW0gMCBhbmQgY2xpcHBpbmcgZW1tdWxhdGlvbiBkb24ndFxuIyByZXR1cm4gd3JhcHBlZCBsaW5lLCBidXQgSXQgYWN0dWFsbHkgd3JhcCwgc28gSSBuZWVkIHRvIGRvIHZlcnkgZGlydHkgd29yayB0b1xuIyBwcmVkaWN0IHdyYXAgaHVyaXN0aWNhbGx5Llxuc2hvdWxkUHJldmVudFdyYXBMaW5lID0gKGN1cnNvcikgLT5cbiAge3JvdywgY29sdW1ufSA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gIGlmIGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNvZnRUYWJzJylcbiAgICB0YWJMZW5ndGggPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci50YWJMZW5ndGgnKVxuICAgIGlmIDAgPCBjb2x1bW4gPCB0YWJMZW5ndGhcbiAgICAgIHRleHQgPSBjdXJzb3IuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbcm93LCAwXSwgW3JvdywgdGFiTGVuZ3RoXV0pXG4gICAgICAvXlxccyskLy50ZXN0KHRleHQpXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuIyBvcHRpb25zOlxuIyAgIGFsbG93V3JhcDogdG8gY29udHJvbGwgYWxsb3cgd3JhcFxuIyAgIHByZXNlcnZlR29hbENvbHVtbjogcHJlc2VydmUgb3JpZ2luYWwgZ29hbENvbHVtblxubW92ZUN1cnNvckxlZnQgPSAoY3Vyc29yLCBvcHRpb25zPXt9KSAtPlxuICB7YWxsb3dXcmFwLCBuZWVkU3BlY2lhbENhcmVUb1ByZXZlbnRXcmFwTGluZX0gPSBvcHRpb25zXG4gIGRlbGV0ZSBvcHRpb25zLmFsbG93V3JhcFxuICBpZiBuZWVkU3BlY2lhbENhcmVUb1ByZXZlbnRXcmFwTGluZVxuICAgIHJldHVybiBpZiBzaG91bGRQcmV2ZW50V3JhcExpbmUoY3Vyc29yKVxuXG4gIGlmIG5vdCBjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpIG9yIGFsbG93V3JhcFxuICAgIG1vdGlvbiA9IChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlTGVmdCgpXG4gICAgbW92ZUN1cnNvcihjdXJzb3IsIG9wdGlvbnMsIG1vdGlvbilcblxubW92ZUN1cnNvclJpZ2h0ID0gKGN1cnNvciwgb3B0aW9ucz17fSkgLT5cbiAge2FsbG93V3JhcH0gPSBvcHRpb25zXG4gIGRlbGV0ZSBvcHRpb25zLmFsbG93V3JhcFxuICBpZiBub3QgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSBvciBhbGxvd1dyYXBcbiAgICBtb3Rpb24gPSAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICBtb3ZlQ3Vyc29yKGN1cnNvciwgb3B0aW9ucywgbW90aW9uKVxuXG5tb3ZlQ3Vyc29yVXBTY3JlZW4gPSAoY3Vyc29yLCBvcHRpb25zPXt9KSAtPlxuICB1bmxlc3MgY3Vyc29yLmdldFNjcmVlblJvdygpIGlzIDBcbiAgICBtb3Rpb24gPSAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZVVwKClcbiAgICBtb3ZlQ3Vyc29yKGN1cnNvciwgb3B0aW9ucywgbW90aW9uKVxuXG5tb3ZlQ3Vyc29yRG93blNjcmVlbiA9IChjdXJzb3IsIG9wdGlvbnM9e30pIC0+XG4gIHVubGVzcyBnZXRWaW1MYXN0U2NyZWVuUm93KGN1cnNvci5lZGl0b3IpIGlzIGN1cnNvci5nZXRTY3JlZW5Sb3coKVxuICAgIG1vdGlvbiA9IChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlRG93bigpXG4gICAgbW92ZUN1cnNvcihjdXJzb3IsIG9wdGlvbnMsIG1vdGlvbilcblxubW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyA9IChjdXJzb3IsIHJvdykgLT5cbiAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtyb3csIDBdKVxuICBjdXJzb3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuXG5nZXRWYWxpZFZpbUJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT4gbGltaXROdW1iZXIocm93LCBtaW46IDAsIG1heDogZ2V0VmltTGFzdEJ1ZmZlclJvdyhlZGl0b3IpKVxuXG5nZXRWYWxpZFZpbVNjcmVlblJvdyA9IChlZGl0b3IsIHJvdykgLT4gbGltaXROdW1iZXIocm93LCBtaW46IDAsIG1heDogZ2V0VmltTGFzdFNjcmVlblJvdyhlZGl0b3IpKVxuXG4jIEJ5IGRlZmF1bHQgbm90IGluY2x1ZGUgY29sdW1uXG5nZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCB7cm93LCBjb2x1bW59LCB7ZXhjbHVzaXZlfT17fSkgLT5cbiAgaWYgZXhjbHVzaXZlID8gdHJ1ZVxuICAgIGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpWzAuLi5jb2x1bW5dXG4gIGVsc2VcbiAgICBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVswLi5jb2x1bW5dXG5cbmdldEluZGVudExldmVsRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICBlZGl0b3IuaW5kZW50TGV2ZWxGb3JMaW5lKGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpKVxuXG5nZXRDb2RlRm9sZFJvd1JhbmdlcyA9IChlZGl0b3IpIC0+XG4gIFswLi5lZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpXVxuICAgIC5tYXAgKHJvdykgLT5cbiAgICAgIGVkaXRvci5sYW5ndWFnZU1vZGUucm93UmFuZ2VGb3JDb2RlRm9sZEF0QnVmZmVyUm93KHJvdylcbiAgICAuZmlsdGVyIChyb3dSYW5nZSkgLT5cbiAgICAgIHJvd1JhbmdlPyBhbmQgcm93UmFuZ2VbMF0/IGFuZCByb3dSYW5nZVsxXT9cblxuIyBVc2VkIGluIHZtcC1qYXNtaW5lLWluY3JlYXNlLWZvY3VzXG5nZXRDb2RlRm9sZFJvd1Jhbmdlc0NvbnRhaW5lc0ZvclJvdyA9IChlZGl0b3IsIGJ1ZmZlclJvdywge2luY2x1ZGVTdGFydFJvd309e30pIC0+XG4gIGluY2x1ZGVTdGFydFJvdyA/PSB0cnVlXG4gIGdldENvZGVGb2xkUm93UmFuZ2VzKGVkaXRvcikuZmlsdGVyIChbc3RhcnRSb3csIGVuZFJvd10pIC0+XG4gICAgaWYgaW5jbHVkZVN0YXJ0Um93XG4gICAgICBzdGFydFJvdyA8PSBidWZmZXJSb3cgPD0gZW5kUm93XG4gICAgZWxzZVxuICAgICAgc3RhcnRSb3cgPCBidWZmZXJSb3cgPD0gZW5kUm93XG5cbmdldEZvbGRSb3dSYW5nZXNDb250YWluZWRCeUZvbGRTdGFydHNBdFJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgcmV0dXJuIG51bGwgdW5sZXNzIGVkaXRvci5pc0ZvbGRhYmxlQXRCdWZmZXJSb3cocm93KVxuXG4gIFtzdGFydFJvdywgZW5kUm93XSA9IGVkaXRvci5sYW5ndWFnZU1vZGUucm93UmFuZ2VGb3JGb2xkQXRCdWZmZXJSb3cocm93KVxuXG4gIHNlZW4gPSB7fVxuICBbc3RhcnRSb3cuLmVuZFJvd11cbiAgICAubWFwIChyb3cpIC0+XG4gICAgICBlZGl0b3IubGFuZ3VhZ2VNb2RlLnJvd1JhbmdlRm9yRm9sZEF0QnVmZmVyUm93KHJvdylcbiAgICAuZmlsdGVyIChyb3dSYW5nZSkgLT5cbiAgICAgIHJvd1JhbmdlPyBhbmQgcm93UmFuZ2VbMF0/IGFuZCByb3dSYW5nZVsxXT9cbiAgICAuZmlsdGVyIChyb3dSYW5nZSkgLT5cbiAgICAgIGlmIHNlZW5bcm93UmFuZ2VdIHRoZW4gZmFsc2UgZWxzZSBzZWVuW3Jvd1JhbmdlXSA9IHRydWVcblxuZ2V0Rm9sZFJvd1JhbmdlcyA9IChlZGl0b3IpIC0+XG4gIHNlZW4gPSB7fVxuICBbMC4uZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKV1cbiAgICAubWFwIChyb3cpIC0+XG4gICAgICBlZGl0b3IubGFuZ3VhZ2VNb2RlLnJvd1JhbmdlRm9yQ29kZUZvbGRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgLmZpbHRlciAocm93UmFuZ2UpIC0+XG4gICAgICByb3dSYW5nZT8gYW5kIHJvd1JhbmdlWzBdPyBhbmQgcm93UmFuZ2VbMV0/XG4gICAgLmZpbHRlciAocm93UmFuZ2UpIC0+XG4gICAgICBpZiBzZWVuW3Jvd1JhbmdlXSB0aGVuIGZhbHNlIGVsc2Ugc2Vlbltyb3dSYW5nZV0gPSB0cnVlXG5cbmdldEZvbGRSYW5nZXNXaXRoSW5kZW50ID0gKGVkaXRvcikgLT5cbiAgZ2V0Rm9sZFJvd1JhbmdlcyhlZGl0b3IpXG4gICAgLm1hcCAoW3N0YXJ0Um93LCBlbmRSb3ddKSAtPlxuICAgICAgaW5kZW50ID0gZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHN0YXJ0Um93KVxuICAgICAge3N0YXJ0Um93LCBlbmRSb3csIGluZGVudH1cblxuZ2V0Rm9sZEluZm9CeUtpbmQgPSAoZWRpdG9yKSAtPlxuICBmb2xkSW5mb0J5S2luZCA9IHt9XG5cbiAgdXBkYXRlRm9sZEluZm8gPSAoa2luZCwgcm93UmFuZ2VXaXRoSW5kZW50KSAtPlxuICAgIGZvbGRJbmZvID0gKGZvbGRJbmZvQnlLaW5kW2tpbmRdID89IHt9KVxuICAgIGZvbGRJbmZvLnJvd1Jhbmdlc1dpdGhJbmRlbnQgPz0gW11cbiAgICBmb2xkSW5mby5yb3dSYW5nZXNXaXRoSW5kZW50LnB1c2gocm93UmFuZ2VXaXRoSW5kZW50KVxuICAgIGluZGVudCA9IHJvd1JhbmdlV2l0aEluZGVudC5pbmRlbnRcbiAgICBmb2xkSW5mby5taW5JbmRlbnQgPSBNYXRoLm1pbihmb2xkSW5mby5taW5JbmRlbnQgPyBpbmRlbnQsIGluZGVudClcbiAgICBmb2xkSW5mby5tYXhJbmRlbnQgPSBNYXRoLm1heChmb2xkSW5mby5tYXhJbmRlbnQgPyBpbmRlbnQsIGluZGVudClcblxuICBmb3Igcm93UmFuZ2VXaXRoSW5kZW50IGluIGdldEZvbGRSYW5nZXNXaXRoSW5kZW50KGVkaXRvcilcbiAgICB1cGRhdGVGb2xkSW5mbygnYWxsRm9sZCcsIHJvd1JhbmdlV2l0aEluZGVudClcbiAgICBpZiBlZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhyb3dSYW5nZVdpdGhJbmRlbnQuc3RhcnRSb3cpXG4gICAgICB1cGRhdGVGb2xkSW5mbygnZm9sZGVkJywgcm93UmFuZ2VXaXRoSW5kZW50KVxuICAgIGVsc2VcbiAgICAgIHVwZGF0ZUZvbGRJbmZvKCd1bmZvbGRlZCcsIHJvd1JhbmdlV2l0aEluZGVudClcbiAgZm9sZEluZm9CeUtpbmRcblxuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZSA9IChlZGl0b3IsIHJvd1JhbmdlKSAtPlxuICBbc3RhcnRSYW5nZSwgZW5kUmFuZ2VdID0gcm93UmFuZ2UubWFwIChyb3cpIC0+XG4gICAgZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdywgaW5jbHVkZU5ld2xpbmU6IHRydWUpXG4gIHN0YXJ0UmFuZ2UudW5pb24oZW5kUmFuZ2UpXG5cbmdldFRva2VuaXplZExpbmVGb3JSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIGVkaXRvci50b2tlbml6ZWRCdWZmZXIudG9rZW5pemVkTGluZUZvclJvdyhyb3cpXG5cbmdldFNjb3Blc0ZvclRva2VuaXplZExpbmUgPSAobGluZSkgLT5cbiAgZm9yIHRhZyBpbiBsaW5lLnRhZ3Mgd2hlbiB0YWcgPCAwIGFuZCAodGFnICUgMiBpcyAtMSlcbiAgICBhdG9tLmdyYW1tYXJzLnNjb3BlRm9ySWQodGFnKVxuXG5zY2FuRm9yU2NvcGVTdGFydCA9IChlZGl0b3IsIGZyb21Qb2ludCwgZGlyZWN0aW9uLCBmbikgLT5cbiAgZnJvbVBvaW50ID0gUG9pbnQuZnJvbU9iamVjdChmcm9tUG9pbnQpXG4gIHNjYW5Sb3dzID0gc3dpdGNoIGRpcmVjdGlvblxuICAgIHdoZW4gJ2ZvcndhcmQnIHRoZW4gWyhmcm9tUG9pbnQucm93KS4uZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKV1cbiAgICB3aGVuICdiYWNrd2FyZCcgdGhlbiBbKGZyb21Qb2ludC5yb3cpLi4wXVxuXG4gIGNvbnRpbnVlU2NhbiA9IHRydWVcbiAgc3RvcCA9IC0+XG4gICAgY29udGludWVTY2FuID0gZmFsc2VcblxuICBpc1ZhbGlkVG9rZW4gPSBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAnZm9yd2FyZCcgdGhlbiAoe3Bvc2l0aW9ufSkgLT4gcG9zaXRpb24uaXNHcmVhdGVyVGhhbihmcm9tUG9pbnQpXG4gICAgd2hlbiAnYmFja3dhcmQnIHRoZW4gKHtwb3NpdGlvbn0pIC0+IHBvc2l0aW9uLmlzTGVzc1RoYW4oZnJvbVBvaW50KVxuXG4gIGZvciByb3cgaW4gc2NhblJvd3Mgd2hlbiB0b2tlbml6ZWRMaW5lID0gZ2V0VG9rZW5pemVkTGluZUZvclJvdyhlZGl0b3IsIHJvdylcbiAgICBjb2x1bW4gPSAwXG4gICAgcmVzdWx0cyA9IFtdXG5cbiAgICB0b2tlbkl0ZXJhdG9yID0gdG9rZW5pemVkTGluZS5nZXRUb2tlbkl0ZXJhdG9yKClcbiAgICBmb3IgdGFnIGluIHRva2VuaXplZExpbmUudGFnc1xuICAgICAgdG9rZW5JdGVyYXRvci5uZXh0KClcbiAgICAgIGlmIHRhZyA8IDAgIyBOZWdhdGl2ZTogc3RhcnQvc3RvcCB0b2tlblxuICAgICAgICBzY29wZSA9IGF0b20uZ3JhbW1hcnMuc2NvcGVGb3JJZCh0YWcpXG4gICAgICAgIGlmICh0YWcgJSAyKSBpcyAwICMgRXZlbjogc2NvcGUgc3RvcFxuICAgICAgICAgIG51bGxcbiAgICAgICAgZWxzZSAjIE9kZDogc2NvcGUgc3RhcnRcbiAgICAgICAgICBwb3NpdGlvbiA9IG5ldyBQb2ludChyb3csIGNvbHVtbilcbiAgICAgICAgICByZXN1bHRzLnB1c2gge3Njb3BlLCBwb3NpdGlvbiwgc3RvcH1cbiAgICAgIGVsc2VcbiAgICAgICAgY29sdW1uICs9IHRhZ1xuXG4gICAgcmVzdWx0cyA9IHJlc3VsdHMuZmlsdGVyKGlzVmFsaWRUb2tlbilcbiAgICByZXN1bHRzLnJldmVyc2UoKSBpZiBkaXJlY3Rpb24gaXMgJ2JhY2t3YXJkJ1xuICAgIGZvciByZXN1bHQgaW4gcmVzdWx0c1xuICAgICAgZm4ocmVzdWx0KVxuICAgICAgcmV0dXJuIHVubGVzcyBjb250aW51ZVNjYW5cbiAgICByZXR1cm4gdW5sZXNzIGNvbnRpbnVlU2NhblxuXG5kZXRlY3RTY29wZVN0YXJ0UG9zaXRpb25Gb3JTY29wZSA9IChlZGl0b3IsIGZyb21Qb2ludCwgZGlyZWN0aW9uLCBzY29wZSkgLT5cbiAgcG9pbnQgPSBudWxsXG4gIHNjYW5Gb3JTY29wZVN0YXJ0IGVkaXRvciwgZnJvbVBvaW50LCBkaXJlY3Rpb24sIChpbmZvKSAtPlxuICAgIGlmIGluZm8uc2NvcGUuc2VhcmNoKHNjb3BlKSA+PSAwXG4gICAgICBpbmZvLnN0b3AoKVxuICAgICAgcG9pbnQgPSBpbmZvLnBvc2l0aW9uXG4gIHBvaW50XG5cbmlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gICMgW0ZJWE1FXSBCdWcgb2YgdXBzdHJlYW0/XG4gICMgU29tZXRpbWUgdG9rZW5pemVkTGluZXMgbGVuZ3RoIGlzIGxlc3MgdGhhbiBsYXN0IGJ1ZmZlciByb3cuXG4gICMgU28gdG9rZW5pemVkTGluZSBpcyBub3QgYWNjZXNzaWJsZSBldmVuIGlmIHZhbGlkIHJvdy5cbiAgIyBJbiB0aGF0IGNhc2UgSSBzaW1wbHkgcmV0dXJuIGVtcHR5IEFycmF5LlxuICBpZiB0b2tlbml6ZWRMaW5lID0gZ2V0VG9rZW5pemVkTGluZUZvclJvdyhlZGl0b3IsIHJvdylcbiAgICBnZXRTY29wZXNGb3JUb2tlbml6ZWRMaW5lKHRva2VuaXplZExpbmUpLnNvbWUgKHNjb3BlKSAtPlxuICAgICAgaXNGdW5jdGlvblNjb3BlKGVkaXRvciwgc2NvcGUpXG4gIGVsc2VcbiAgICBmYWxzZVxuXG4jIFtGSVhNRV0gdmVyeSByb3VnaCBzdGF0ZSwgbmVlZCBpbXByb3ZlbWVudC5cbmlzRnVuY3Rpb25TY29wZSA9IChlZGl0b3IsIHNjb3BlKSAtPlxuICBzd2l0Y2ggZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWVcbiAgICB3aGVuICdzb3VyY2UuZ28nLCAnc291cmNlLmVsaXhpcicsICdzb3VyY2UucnVzdCdcbiAgICAgIHNjb3BlcyA9IFsnZW50aXR5Lm5hbWUuZnVuY3Rpb24nXVxuICAgIHdoZW4gJ3NvdXJjZS5ydWJ5J1xuICAgICAgc2NvcGVzID0gWydtZXRhLmZ1bmN0aW9uLicsICdtZXRhLmNsYXNzLicsICdtZXRhLm1vZHVsZS4nXVxuICAgIGVsc2VcbiAgICAgIHNjb3BlcyA9IFsnbWV0YS5mdW5jdGlvbi4nLCAnbWV0YS5jbGFzcy4nXVxuICBwYXR0ZXJuID0gbmV3IFJlZ0V4cCgnXicgKyBzY29wZXMubWFwKF8uZXNjYXBlUmVnRXhwKS5qb2luKCd8JykpXG4gIHBhdHRlcm4udGVzdChzY29wZSlcblxuIyBTY3JvbGwgdG8gYnVmZmVyUG9zaXRpb24gd2l0aCBtaW5pbXVtIGFtb3VudCB0byBrZWVwIG9yaWdpbmFsIHZpc2libGUgYXJlYS5cbiMgSWYgdGFyZ2V0IHBvc2l0aW9uIHdvbid0IGZpdCB3aXRoaW4gb25lUGFnZVVwIG9yIG9uZVBhZ2VEb3duLCBpdCBjZW50ZXIgdGFyZ2V0IHBvaW50Llxuc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQpIC0+XG4gIGVkaXRvckVsZW1lbnQgPSBlZGl0b3IuZWxlbWVudFxuICBlZGl0b3JBcmVhSGVpZ2h0ID0gZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpICogKGVkaXRvci5nZXRSb3dzUGVyUGFnZSgpIC0gMSlcbiAgb25lUGFnZVVwID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSAtIGVkaXRvckFyZWFIZWlnaHQgIyBObyBuZWVkIHRvIGxpbWl0IHRvIG1pbj0wXG4gIG9uZVBhZ2VEb3duID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxCb3R0b20oKSArIGVkaXRvckFyZWFIZWlnaHRcbiAgdGFyZ2V0ID0gZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24ocG9pbnQpLnRvcFxuXG4gIGNlbnRlciA9IChvbmVQYWdlRG93biA8IHRhcmdldCkgb3IgKHRhcmdldCA8IG9uZVBhZ2VVcClcbiAgZWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24ocG9pbnQsIHtjZW50ZXJ9KVxuXG5tYXRjaFNjb3BlcyA9IChlZGl0b3JFbGVtZW50LCBzY29wZXMpIC0+XG4gIGNsYXNzZXMgPSBzY29wZXMubWFwIChzY29wZSkgLT4gc2NvcGUuc3BsaXQoJy4nKVxuXG4gIGZvciBjbGFzc05hbWVzIGluIGNsYXNzZXNcbiAgICBjb250YWluc0NvdW50ID0gMFxuICAgIGZvciBjbGFzc05hbWUgaW4gY2xhc3NOYW1lc1xuICAgICAgY29udGFpbnNDb3VudCArPSAxIGlmIGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSlcbiAgICByZXR1cm4gdHJ1ZSBpZiBjb250YWluc0NvdW50IGlzIGNsYXNzTmFtZXMubGVuZ3RoXG4gIGZhbHNlXG5cbmlzU2luZ2xlTGluZVRleHQgPSAodGV4dCkgLT5cbiAgdGV4dC5zcGxpdCgvXFxufFxcclxcbi8pLmxlbmd0aCBpcyAxXG5cbiMgUmV0dXJuIGJ1ZmZlclJhbmdlIGFuZCBraW5kIFsnd2hpdGUtc3BhY2UnLCAnbm9uLXdvcmQnLCAnd29yZCddXG4jXG4jIFRoaXMgZnVuY3Rpb24gbW9kaWZ5IHdvcmRSZWdleCBzbyB0aGF0IGl0IGZlZWwgTkFUVVJBTCBpbiBWaW0ncyBub3JtYWwgbW9kZS5cbiMgSW4gbm9ybWFsLW1vZGUsIGN1cnNvciBpcyByYWN0YW5nbGUobm90IHBpcGUofCkgY2hhcikuXG4jIEN1cnNvciBpcyBsaWtlIE9OIHdvcmQgcmF0aGVyIHRoYW4gQkVUV0VFTiB3b3JkLlxuIyBUaGUgbW9kaWZpY2F0aW9uIGlzIHRhaWxvcmQgbGlrZSB0aGlzXG4jICAgLSBPTiB3aGl0ZS1zcGFjZTogSW5jbHVkcyBvbmx5IHdoaXRlLXNwYWNlcy5cbiMgICAtIE9OIG5vbi13b3JkOiBJbmNsdWRzIG9ubHkgbm9uIHdvcmQgY2hhcig9ZXhjbHVkZXMgbm9ybWFsIHdvcmQgY2hhcikuXG4jXG4jIFZhbGlkIG9wdGlvbnNcbiMgIC0gd29yZFJlZ2V4OiBpbnN0YW5jZSBvZiBSZWdFeHBcbiMgIC0gbm9uV29yZENoYXJhY3RlcnM6IHN0cmluZ1xuZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgb3B0aW9ucz17fSkgLT5cbiAge3NpbmdsZU5vbldvcmRDaGFyLCB3b3JkUmVnZXgsIG5vbldvcmRDaGFyYWN0ZXJzLCBjdXJzb3J9ID0gb3B0aW9uc1xuICBpZiBub3Qgd29yZFJlZ2V4PyBvciBub3Qgbm9uV29yZENoYXJhY3RlcnM/ICMgQ29tcGxlbWVudCBmcm9tIGN1cnNvclxuICAgIGN1cnNvciA/PSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAge3dvcmRSZWdleCwgbm9uV29yZENoYXJhY3RlcnN9ID0gXy5leHRlbmQob3B0aW9ucywgYnVpbGRXb3JkUGF0dGVybkJ5Q3Vyc29yKGN1cnNvciwgb3B0aW9ucykpXG4gIHNpbmdsZU5vbldvcmRDaGFyID89IHRydWVcblxuICBjaGFyYWN0ZXJBdFBvaW50ID0gZ2V0UmlnaHRDaGFyYWN0ZXJGb3JCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50KVxuICBub25Xb3JkUmVnZXggPSBuZXcgUmVnRXhwKFwiWyN7Xy5lc2NhcGVSZWdFeHAobm9uV29yZENoYXJhY3RlcnMpfV0rXCIpXG5cbiAgaWYgL1xccy8udGVzdChjaGFyYWN0ZXJBdFBvaW50KVxuICAgIHNvdXJjZSA9IFwiW1xcdCBdK1wiXG4gICAga2luZCA9ICd3aGl0ZS1zcGFjZSdcbiAgICB3b3JkUmVnZXggPSBuZXcgUmVnRXhwKHNvdXJjZSlcbiAgZWxzZSBpZiBub25Xb3JkUmVnZXgudGVzdChjaGFyYWN0ZXJBdFBvaW50KSBhbmQgbm90IHdvcmRSZWdleC50ZXN0KGNoYXJhY3RlckF0UG9pbnQpXG4gICAga2luZCA9ICdub24td29yZCdcbiAgICBpZiBzaW5nbGVOb25Xb3JkQ2hhclxuICAgICAgc291cmNlID0gXy5lc2NhcGVSZWdFeHAoY2hhcmFjdGVyQXRQb2ludClcbiAgICAgIHdvcmRSZWdleCA9IG5ldyBSZWdFeHAoc291cmNlKVxuICAgIGVsc2VcbiAgICAgIHdvcmRSZWdleCA9IG5vbldvcmRSZWdleFxuICBlbHNlXG4gICAga2luZCA9ICd3b3JkJ1xuXG4gIHJhbmdlID0gZ2V0V29yZEJ1ZmZlclJhbmdlQXRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50LCB7d29yZFJlZ2V4fSlcbiAge2tpbmQsIHJhbmdlfVxuXG5nZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgb3B0aW9ucz17fSkgLT5cbiAgYm91bmRhcml6ZUZvcldvcmQgPSBvcHRpb25zLmJvdW5kYXJpemVGb3JXb3JkID8gdHJ1ZVxuICBkZWxldGUgb3B0aW9ucy5ib3VuZGFyaXplRm9yV29yZFxuICB7cmFuZ2UsIGtpbmR9ID0gZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24oZWRpdG9yLCBwb2ludCwgb3B0aW9ucylcbiAgdGV4dCA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgcGF0dGVybiA9IF8uZXNjYXBlUmVnRXhwKHRleHQpXG5cbiAgaWYga2luZCBpcyAnd29yZCcgYW5kIGJvdW5kYXJpemVGb3JXb3JkXG4gICAgIyBTZXQgd29yZC1ib3VuZGFyeSggXFxiICkgYW5jaG9yIG9ubHkgd2hlbiBpdCdzIGVmZmVjdGl2ZSAjNjg5XG4gICAgc3RhcnRCb3VuZGFyeSA9IGlmIC9eXFx3Ly50ZXN0KHRleHQpIHRoZW4gXCJcXFxcYlwiIGVsc2UgJydcbiAgICBlbmRCb3VuZGFyeSA9IGlmIC9cXHckLy50ZXN0KHRleHQpIHRoZW4gXCJcXFxcYlwiIGVsc2UgJydcbiAgICBwYXR0ZXJuID0gc3RhcnRCb3VuZGFyeSArIHBhdHRlcm4gKyBlbmRCb3VuZGFyeVxuICBuZXcgUmVnRXhwKHBhdHRlcm4sICdnJylcblxuZ2V0U3Vid29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIG9wdGlvbnM9e30pIC0+XG4gIG9wdGlvbnMgPSB7d29yZFJlZ2V4OiBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLnN1YndvcmRSZWdFeHAoKSwgYm91bmRhcml6ZUZvcldvcmQ6IGZhbHNlfVxuICBnZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24oZWRpdG9yLCBwb2ludCwgb3B0aW9ucylcblxuIyBSZXR1cm4gb3B0aW9ucyB1c2VkIGZvciBnZXRXb3JkQnVmZmVyUmFuZ2VBdEJ1ZmZlclBvc2l0aW9uXG5idWlsZFdvcmRQYXR0ZXJuQnlDdXJzb3IgPSAoY3Vyc29yLCB7d29yZFJlZ2V4fSkgLT5cbiAgbm9uV29yZENoYXJhY3RlcnMgPSBnZXROb25Xb3JkQ2hhcmFjdGVyc0ZvckN1cnNvcihjdXJzb3IpXG4gIHdvcmRSZWdleCA/PSBuZXcgUmVnRXhwKFwiXltcXHQgXSokfFteXFxcXHMje18uZXNjYXBlUmVnRXhwKG5vbldvcmRDaGFyYWN0ZXJzKX1dK1wiKVxuICB7d29yZFJlZ2V4LCBub25Xb3JkQ2hhcmFjdGVyc31cblxuZ2V0QmVnaW5uaW5nT2ZXb3JkQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwge3dvcmRSZWdleH09e30pIC0+XG4gIHNjYW5SYW5nZSA9IFtbcG9pbnQucm93LCAwXSwgcG9pbnRdXG5cbiAgZm91bmQgPSBudWxsXG4gIGVkaXRvci5iYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSB3b3JkUmVnZXgsIHNjYW5SYW5nZSwgKHtyYW5nZSwgbWF0Y2hUZXh0LCBzdG9wfSkgLT5cbiAgICByZXR1cm4gaWYgbWF0Y2hUZXh0IGlzICcnIGFuZCByYW5nZS5zdGFydC5jb2x1bW4gaXNudCAwXG5cbiAgICBpZiByYW5nZS5zdGFydC5pc0xlc3NUaGFuKHBvaW50KVxuICAgICAgaWYgcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW5PckVxdWFsKHBvaW50KVxuICAgICAgICBmb3VuZCA9IHJhbmdlLnN0YXJ0XG4gICAgICBzdG9wKClcblxuICBmb3VuZCA/IHBvaW50XG5cbmdldEVuZE9mV29yZEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIHt3b3JkUmVnZXh9PXt9KSAtPlxuICBzY2FuUmFuZ2UgPSBbcG9pbnQsIFtwb2ludC5yb3csIEluZmluaXR5XV1cblxuICBmb3VuZCA9IG51bGxcbiAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIHdvcmRSZWdleCwgc2NhblJhbmdlLCAoe3JhbmdlLCBtYXRjaFRleHQsIHN0b3B9KSAtPlxuICAgIHJldHVybiBpZiBtYXRjaFRleHQgaXMgJycgYW5kIHJhbmdlLnN0YXJ0LmNvbHVtbiBpc250IDBcblxuICAgIGlmIHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKHBvaW50KVxuICAgICAgaWYgcmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbk9yRXF1YWwocG9pbnQpXG4gICAgICAgIGZvdW5kID0gcmFuZ2UuZW5kXG4gICAgICBzdG9wKClcblxuICBmb3VuZCA/IHBvaW50XG5cbmdldFdvcmRCdWZmZXJSYW5nZUF0QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb3NpdGlvbiwgb3B0aW9ucz17fSkgLT5cbiAgZW5kUG9zaXRpb24gPSBnZXRFbmRPZldvcmRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvc2l0aW9uLCBvcHRpb25zKVxuICBzdGFydFBvc2l0aW9uID0gZ2V0QmVnaW5uaW5nT2ZXb3JkQnVmZmVyUG9zaXRpb24oZWRpdG9yLCBlbmRQb3NpdGlvbiwgb3B0aW9ucylcbiAgbmV3IFJhbmdlKHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uKVxuXG4jIFdoZW4gcmFuZ2UgaXMgbGluZXdpc2UgcmFuZ2UsIHJhbmdlIGVuZCBoYXZlIGNvbHVtbiAwIG9mIE5FWFQgcm93LlxuIyBXaGljaCBpcyB2ZXJ5IHVuaW50dWl0aXZlIGFuZCB1bndhbnRlZCByZXN1bHQuXG5zaHJpbmtSYW5nZUVuZFRvQmVmb3JlTmV3TGluZSA9IChyYW5nZSkgLT5cbiAge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgaWYgZW5kLmNvbHVtbiBpcyAwXG4gICAgZW5kUm93ID0gbGltaXROdW1iZXIoZW5kLnJvdyAtIDEsIG1pbjogc3RhcnQucm93KVxuICAgIG5ldyBSYW5nZShzdGFydCwgW2VuZFJvdywgSW5maW5pdHldKVxuICBlbHNlXG4gICAgcmFuZ2Vcblxuc2NhbkVkaXRvciA9IChlZGl0b3IsIHBhdHRlcm4pIC0+XG4gIHJhbmdlcyA9IFtdXG4gIGVkaXRvci5zY2FuIHBhdHRlcm4sICh7cmFuZ2V9KSAtPlxuICAgIHJhbmdlcy5wdXNoKHJhbmdlKVxuICByYW5nZXNcblxuY29sbGVjdFJhbmdlSW5CdWZmZXJSb3cgPSAoZWRpdG9yLCByb3csIHBhdHRlcm4pIC0+XG4gIHJhbmdlcyA9IFtdXG4gIHNjYW5SYW5nZSA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpXG4gIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZSBwYXR0ZXJuLCBzY2FuUmFuZ2UsICh7cmFuZ2V9KSAtPlxuICAgIHJhbmdlcy5wdXNoKHJhbmdlKVxuICByYW5nZXNcblxuZmluZFJhbmdlSW5CdWZmZXJSb3cgPSAoZWRpdG9yLCBwYXR0ZXJuLCByb3csIHtkaXJlY3Rpb259PXt9KSAtPlxuICBpZiBkaXJlY3Rpb24gaXMgJ2JhY2t3YXJkJ1xuICAgIHNjYW5GdW5jdGlvbk5hbWUgPSAnYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UnXG4gIGVsc2VcbiAgICBzY2FuRnVuY3Rpb25OYW1lID0gJ3NjYW5JbkJ1ZmZlclJhbmdlJ1xuXG4gIHJhbmdlID0gbnVsbFxuICBzY2FuUmFuZ2UgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KVxuICBlZGl0b3Jbc2NhbkZ1bmN0aW9uTmFtZV0gcGF0dGVybiwgc2NhblJhbmdlLCAoZXZlbnQpIC0+IHJhbmdlID0gZXZlbnQucmFuZ2VcbiAgcmFuZ2VcblxuZ2V0TGFyZ2VzdEZvbGRSYW5nZUNvbnRhaW5zQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICBtYXJrZXJzID0gZWRpdG9yLmRpc3BsYXlMYXllci5mb2xkc01hcmtlckxheWVyLmZpbmRNYXJrZXJzKGludGVyc2VjdHNSb3c6IHJvdylcblxuICBzdGFydFBvaW50ID0gbnVsbFxuICBlbmRQb2ludCA9IG51bGxcblxuICBmb3IgbWFya2VyIGluIG1hcmtlcnMgPyBbXVxuICAgIHtzdGFydCwgZW5kfSA9IG1hcmtlci5nZXRSYW5nZSgpXG4gICAgdW5sZXNzIHN0YXJ0UG9pbnRcbiAgICAgIHN0YXJ0UG9pbnQgPSBzdGFydFxuICAgICAgZW5kUG9pbnQgPSBlbmRcbiAgICAgIGNvbnRpbnVlXG5cbiAgICBpZiBzdGFydC5pc0xlc3NUaGFuKHN0YXJ0UG9pbnQpXG4gICAgICBzdGFydFBvaW50ID0gc3RhcnRcbiAgICAgIGVuZFBvaW50ID0gZW5kXG5cbiAgaWYgc3RhcnRQb2ludD8gYW5kIGVuZFBvaW50P1xuICAgIG5ldyBSYW5nZShzdGFydFBvaW50LCBlbmRQb2ludClcblxuIyB0YWtlIGJ1ZmZlclBvc2l0aW9uXG50cmFuc2xhdGVQb2ludEFuZENsaXAgPSAoZWRpdG9yLCBwb2ludCwgZGlyZWN0aW9uKSAtPlxuICBwb2ludCA9IFBvaW50LmZyb21PYmplY3QocG9pbnQpXG5cbiAgZG9udENsaXAgPSBmYWxzZVxuICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAnZm9yd2FyZCdcbiAgICAgIHBvaW50ID0gcG9pbnQudHJhbnNsYXRlKFswLCArMV0pXG4gICAgICBlb2wgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocG9pbnQucm93KS5lbmRcblxuICAgICAgaWYgcG9pbnQuaXNFcXVhbChlb2wpXG4gICAgICAgIGRvbnRDbGlwID0gdHJ1ZVxuICAgICAgZWxzZSBpZiBwb2ludC5pc0dyZWF0ZXJUaGFuKGVvbClcbiAgICAgICAgZG9udENsaXAgPSB0cnVlXG4gICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50LnJvdyArIDEsIDApICMgbW92ZSBwb2ludCB0byBuZXctbGluZSBzZWxlY3RlZCBwb2ludFxuXG4gICAgICBwb2ludCA9IFBvaW50Lm1pbihwb2ludCwgZWRpdG9yLmdldEVvZkJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgICB3aGVuICdiYWNrd2FyZCdcbiAgICAgIHBvaW50ID0gcG9pbnQudHJhbnNsYXRlKFswLCAtMV0pXG5cbiAgICAgIGlmIHBvaW50LmNvbHVtbiA8IDBcbiAgICAgICAgZG9udENsaXAgPSB0cnVlXG4gICAgICAgIG5ld1JvdyA9IHBvaW50LnJvdyAtIDFcbiAgICAgICAgZW9sID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KG5ld1JvdykuZW5kXG4gICAgICAgIHBvaW50ID0gbmV3IFBvaW50KG5ld1JvdywgZW9sLmNvbHVtbilcblxuICAgICAgcG9pbnQgPSBQb2ludC5tYXgocG9pbnQsIFBvaW50LlpFUk8pXG5cbiAgaWYgZG9udENsaXBcbiAgICBwb2ludFxuICBlbHNlXG4gICAgc2NyZWVuUG9pbnQgPSBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihwb2ludCwgY2xpcERpcmVjdGlvbjogZGlyZWN0aW9uKVxuICAgIGVkaXRvci5idWZmZXJQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHNjcmVlblBvaW50KVxuXG5nZXRSYW5nZUJ5VHJhbnNsYXRlUG9pbnRBbmRDbGlwID0gKGVkaXRvciwgcmFuZ2UsIHdoaWNoLCBkaXJlY3Rpb24pIC0+XG4gIG5ld1BvaW50ID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKGVkaXRvciwgcmFuZ2Vbd2hpY2hdLCBkaXJlY3Rpb24pXG4gIHN3aXRjaCB3aGljaFxuICAgIHdoZW4gJ3N0YXJ0J1xuICAgICAgbmV3IFJhbmdlKG5ld1BvaW50LCByYW5nZS5lbmQpXG4gICAgd2hlbiAnZW5kJ1xuICAgICAgbmV3IFJhbmdlKHJhbmdlLnN0YXJ0LCBuZXdQb2ludClcblxuZ2V0UGFja2FnZSA9IChuYW1lLCBmbikgLT5cbiAgbmV3IFByb21pc2UgKHJlc29sdmUpIC0+XG4gICAgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUobmFtZSlcbiAgICAgIHBrZyA9IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZShuYW1lKVxuICAgICAgcmVzb2x2ZShwa2cpXG4gICAgZWxzZVxuICAgICAgZGlzcG9zYWJsZSA9IGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZVBhY2thZ2UgKHBrZykgLT5cbiAgICAgICAgaWYgcGtnLm5hbWUgaXMgbmFtZVxuICAgICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICAgICAgcmVzb2x2ZShwa2cpXG5cbnNlYXJjaEJ5UHJvamVjdEZpbmQgPSAoZWRpdG9yLCB0ZXh0KSAtPlxuICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvci5lbGVtZW50LCAncHJvamVjdC1maW5kOnNob3cnKVxuICBnZXRQYWNrYWdlKCdmaW5kLWFuZC1yZXBsYWNlJykudGhlbiAocGtnKSAtPlxuICAgIHtwcm9qZWN0RmluZFZpZXd9ID0gcGtnLm1haW5Nb2R1bGVcbiAgICBpZiBwcm9qZWN0RmluZFZpZXc/XG4gICAgICBwcm9qZWN0RmluZFZpZXcuZmluZEVkaXRvci5zZXRUZXh0KHRleHQpXG4gICAgICBwcm9qZWN0RmluZFZpZXcuY29uZmlybSgpXG5cbmxpbWl0TnVtYmVyID0gKG51bWJlciwge21heCwgbWlufT17fSkgLT5cbiAgbnVtYmVyID0gTWF0aC5taW4obnVtYmVyLCBtYXgpIGlmIG1heD9cbiAgbnVtYmVyID0gTWF0aC5tYXgobnVtYmVyLCBtaW4pIGlmIG1pbj9cbiAgbnVtYmVyXG5cbmZpbmRSYW5nZUNvbnRhaW5zUG9pbnQgPSAocmFuZ2VzLCBwb2ludCkgLT5cbiAgZm9yIHJhbmdlIGluIHJhbmdlcyB3aGVuIHJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpXG4gICAgcmV0dXJuIHJhbmdlXG4gIG51bGxcblxubmVnYXRlRnVuY3Rpb24gPSAoZm4pIC0+XG4gIChhcmdzLi4uKSAtPlxuICAgIG5vdCBmbihhcmdzLi4uKVxuXG5pc0VtcHR5ID0gKHRhcmdldCkgLT4gdGFyZ2V0LmlzRW1wdHkoKVxuaXNOb3RFbXB0eSA9IG5lZ2F0ZUZ1bmN0aW9uKGlzRW1wdHkpXG5cbmlzU2luZ2xlTGluZVJhbmdlID0gKHJhbmdlKSAtPiByYW5nZS5pc1NpbmdsZUxpbmUoKVxuaXNOb3RTaW5nbGVMaW5lUmFuZ2UgPSBuZWdhdGVGdW5jdGlvbihpc1NpbmdsZUxpbmVSYW5nZSlcblxuaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlID0gKGVkaXRvciwgcmFuZ2UpIC0+IC9eW1xcdCBdKiQvLnRlc3QoZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKSlcbmlzTm90TGVhZGluZ1doaXRlU3BhY2VSYW5nZSA9IG5lZ2F0ZUZ1bmN0aW9uKGlzTGVhZGluZ1doaXRlU3BhY2VSYW5nZSlcblxuaXNFc2NhcGVkQ2hhclJhbmdlID0gKGVkaXRvciwgcmFuZ2UpIC0+XG4gIHJhbmdlID0gUmFuZ2UuZnJvbU9iamVjdChyYW5nZSlcbiAgY2hhcnMgPSBnZXRMZWZ0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24oZWRpdG9yLCByYW5nZS5zdGFydCwgMilcbiAgY2hhcnMuZW5kc1dpdGgoJ1xcXFwnKSBhbmQgbm90IGNoYXJzLmVuZHNXaXRoKCdcXFxcXFxcXCcpXG5cbmluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIHRleHQpIC0+XG4gIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbcG9pbnQsIHBvaW50XSwgdGV4dClcblxuZW5zdXJlRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICB1bmxlc3MgaXNFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCByb3cpXG4gICAgZW9sID0gZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KGVkaXRvciwgcm93KVxuICAgIGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgZW9sLCBcIlxcblwiKVxuXG5tb2RpZnlDbGFzc0xpc3QgPSAoYWN0aW9uLCBlbGVtZW50LCBjbGFzc05hbWVzLi4uKSAtPlxuICBlbGVtZW50LmNsYXNzTGlzdFthY3Rpb25dKGNsYXNzTmFtZXMuLi4pXG5cbmFkZENsYXNzTGlzdCA9IG1vZGlmeUNsYXNzTGlzdC5iaW5kKG51bGwsICdhZGQnKVxucmVtb3ZlQ2xhc3NMaXN0ID0gbW9kaWZ5Q2xhc3NMaXN0LmJpbmQobnVsbCwgJ3JlbW92ZScpXG50b2dnbGVDbGFzc0xpc3QgPSBtb2RpZnlDbGFzc0xpc3QuYmluZChudWxsLCAndG9nZ2xlJylcblxudG9nZ2xlQ2FzZUZvckNoYXJhY3RlciA9IChjaGFyKSAtPlxuICBjaGFyTG93ZXIgPSBjaGFyLnRvTG93ZXJDYXNlKClcbiAgaWYgY2hhckxvd2VyIGlzIGNoYXJcbiAgICBjaGFyLnRvVXBwZXJDYXNlKClcbiAgZWxzZVxuICAgIGNoYXJMb3dlclxuXG5zcGxpdFRleHRCeU5ld0xpbmUgPSAodGV4dCkgLT5cbiAgaWYgdGV4dC5lbmRzV2l0aChcIlxcblwiKVxuICAgIHRleHQudHJpbVJpZ2h0KCkuc3BsaXQoL1xccj9cXG4vZylcbiAgZWxzZVxuICAgIHRleHQuc3BsaXQoL1xccj9cXG4vZylcblxucmVwbGFjZURlY29yYXRpb25DbGFzc0J5ID0gKGZuLCBkZWNvcmF0aW9uKSAtPlxuICBwcm9wcyA9IGRlY29yYXRpb24uZ2V0UHJvcGVydGllcygpXG4gIGRlY29yYXRpb24uc2V0UHJvcGVydGllcyhfLmRlZmF1bHRzKHtjbGFzczogZm4ocHJvcHMuY2xhc3MpfSwgcHJvcHMpKVxuXG4jIE1vZGlmeSByYW5nZSB1c2VkIGZvciB1bmRvL3JlZG8gZmxhc2ggaGlnaGxpZ2h0IHRvIG1ha2UgaXQgZmVlbCBuYXR1cmFsbHkgZm9yIGh1bWFuLlxuIyAgLSBUcmltIHN0YXJ0aW5nIG5ldyBsaW5lKFwiXFxuXCIpXG4jICAgICBcIlxcbmFiY1wiIC0+IFwiYWJjXCJcbiMgIC0gSWYgcmFuZ2UuZW5kIGlzIEVPTCBleHRlbmQgcmFuZ2UgdG8gZmlyc3QgY29sdW1uIG9mIG5leHQgbGluZS5cbiMgICAgIFwiYWJjXCIgLT4gXCJhYmNcXG5cIlxuIyBlLmcuXG4jIC0gd2hlbiAnYycgaXMgYXRFT0w6IFwiXFxuYWJjXCIgLT4gXCJhYmNcXG5cIlxuIyAtIHdoZW4gJ2MnIGlzIE5PVCBhdEVPTDogXCJcXG5hYmNcIiAtPiBcImFiY1wiXG4jXG4jIFNvIGFsd2F5cyB0cmltIGluaXRpYWwgXCJcXG5cIiBwYXJ0IHJhbmdlIGJlY2F1c2UgZmxhc2hpbmcgdHJhaWxpbmcgbGluZSBpcyBjb3VudGVyaW50dWl0aXZlLlxuaHVtYW5pemVCdWZmZXJSYW5nZSA9IChlZGl0b3IsIHJhbmdlKSAtPlxuICBpZiBpc1NpbmdsZUxpbmVSYW5nZShyYW5nZSkgb3IgaXNMaW5ld2lzZVJhbmdlKHJhbmdlKVxuICAgIHJldHVybiByYW5nZVxuXG4gIHtzdGFydCwgZW5kfSA9IHJhbmdlXG4gIGlmIHBvaW50SXNBdEVuZE9mTGluZShlZGl0b3IsIHN0YXJ0KVxuICAgIG5ld1N0YXJ0ID0gc3RhcnQudHJhdmVyc2UoWzEsIDBdKVxuXG4gIGlmIHBvaW50SXNBdEVuZE9mTGluZShlZGl0b3IsIGVuZClcbiAgICBuZXdFbmQgPSBlbmQudHJhdmVyc2UoWzEsIDBdKVxuXG4gIGlmIG5ld1N0YXJ0PyBvciBuZXdFbmQ/XG4gICAgbmV3IFJhbmdlKG5ld1N0YXJ0ID8gc3RhcnQsIG5ld0VuZCA/IGVuZClcbiAgZWxzZVxuICAgIHJhbmdlXG5cbiMgRXhwYW5kIHJhbmdlIHRvIHdoaXRlIHNwYWNlXG4jICAxLiBFeHBhbmQgdG8gZm9yd2FyZCBkaXJlY3Rpb24sIGlmIHN1Y2VlZCByZXR1cm4gbmV3IHJhbmdlLlxuIyAgMi4gRXhwYW5kIHRvIGJhY2t3YXJkIGRpcmVjdGlvbiwgaWYgc3VjY2VlZCByZXR1cm4gbmV3IHJhbmdlLlxuIyAgMy4gV2hlbiBmYWlsZCB0byBleHBhbmQgZWl0aGVyIGRpcmVjdGlvbiwgcmV0dXJuIG9yaWdpbmFsIHJhbmdlLlxuZXhwYW5kUmFuZ2VUb1doaXRlU3BhY2VzID0gKGVkaXRvciwgcmFuZ2UpIC0+XG4gIHtzdGFydCwgZW5kfSA9IHJhbmdlXG5cbiAgbmV3RW5kID0gbnVsbFxuICBzY2FuUmFuZ2UgPSBbZW5kLCBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCBlbmQucm93KV1cbiAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIC9cXFMvLCBzY2FuUmFuZ2UsICh7cmFuZ2V9KSAtPiBuZXdFbmQgPSByYW5nZS5zdGFydFxuXG4gIGlmIG5ld0VuZD8uaXNHcmVhdGVyVGhhbihlbmQpXG4gICAgcmV0dXJuIG5ldyBSYW5nZShzdGFydCwgbmV3RW5kKVxuXG4gIG5ld1N0YXJ0ID0gbnVsbFxuICBzY2FuUmFuZ2UgPSBbW3N0YXJ0LnJvdywgMF0sIHJhbmdlLnN0YXJ0XVxuICBlZGl0b3IuYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UgL1xcUy8sIHNjYW5SYW5nZSwgKHtyYW5nZX0pIC0+IG5ld1N0YXJ0ID0gcmFuZ2UuZW5kXG5cbiAgaWYgbmV3U3RhcnQ/LmlzTGVzc1RoYW4oc3RhcnQpXG4gICAgcmV0dXJuIG5ldyBSYW5nZShuZXdTdGFydCwgZW5kKVxuXG4gIHJldHVybiByYW5nZSAjIGZhbGxiYWNrXG5cbiMgU3BsaXQgYW5kIGpvaW4gYWZ0ZXIgbXV0YXRlIGl0ZW0gYnkgY2FsbGJhY2sgd2l0aCBrZWVwIG9yaWdpbmFsIHNlcGFyYXRvciB1bmNoYW5nZWQuXG4jXG4jIDEuIFRyaW0gbGVhZGluZyBhbmQgdHJhaW5saW5nIHdoaXRlIHNwYWNlcyBhbmQgcmVtZW1iZXJcbiMgMS4gU3BsaXQgdGV4dCB3aXRoIGdpdmVuIHBhdHRlcm4gYW5kIHJlbWVtYmVyIG9yaWdpbmFsIHNlcGFyYXRvcnMuXG4jIDIuIENoYW5nZSBvcmRlciBieSBjYWxsYmFja1xuIyAzLiBKb2luIHdpdGggb3JpZ2luYWwgc3BlYXJhdG9yIGFuZCBjb25jYXQgd2l0aCByZW1lbWJlcmVkIGxlYWRpbmcgYW5kIHRyYWlubGluZyB3aGl0ZSBzcGFjZXMuXG4jXG5zcGxpdEFuZEpvaW5CeSA9ICh0ZXh0LCBwYXR0ZXJuLCBmbikgLT5cbiAgbGVhZGluZ1NwYWNlcyA9IHRyYWlsaW5nU3BhY2VzID0gJydcbiAgc3RhcnQgPSB0ZXh0LnNlYXJjaCgvXFxTLylcbiAgZW5kID0gdGV4dC5zZWFyY2goL1xccyokLylcbiAgbGVhZGluZ1NwYWNlcyA9IHRyYWlsaW5nU3BhY2VzID0gJydcbiAgbGVhZGluZ1NwYWNlcyA9IHRleHRbMC4uLnN0YXJ0XSBpZiBzdGFydCBpc250IC0xXG4gIHRyYWlsaW5nU3BhY2VzID0gdGV4dFtlbmQuLi5dIGlmIGVuZCBpc250IC0xXG4gIHRleHQgPSB0ZXh0W3N0YXJ0Li4uZW5kXVxuXG4gIGZsYWdzID0gJ2cnXG4gIGZsYWdzICs9ICdpJyBpZiBwYXR0ZXJuLmlnbm9yZUNhc2VcbiAgcmVnZXhwID0gbmV3IFJlZ0V4cChcIigje3BhdHRlcm4uc291cmNlfSlcIiwgZmxhZ3MpXG4gICMgZS5nLlxuICAjIFdoZW4gdGV4dCA9IFwiYSwgYiwgY1wiLCBwYXR0ZXJuID0gLyw/XFxzKy9cbiAgIyAgIGl0ZW1zID0gWydhJywgJ2InLCAnYyddLCBzcGVhcmF0b3JzID0gWycsICcsICcsICddXG4gICMgV2hlbiB0ZXh0ID0gXCJhIGJcXG4gY1wiLCBwYXR0ZXJuID0gLyw/XFxzKy9cbiAgIyAgIGl0ZW1zID0gWydhJywgJ2InLCAnYyddLCBzcGVhcmF0b3JzID0gWycgJywgJ1xcbiAnXVxuICBpdGVtcyA9IFtdXG4gIHNlcGFyYXRvcnMgPSBbXVxuICBmb3Igc2VnbWVudCwgaSBpbiB0ZXh0LnNwbGl0KHJlZ2V4cClcbiAgICBpZiBpICUgMiBpcyAwXG4gICAgICBpdGVtcy5wdXNoKHNlZ21lbnQpXG4gICAgZWxzZVxuICAgICAgc2VwYXJhdG9ycy5wdXNoKHNlZ21lbnQpXG4gIHNlcGFyYXRvcnMucHVzaCgnJylcbiAgaXRlbXMgPSBmbihpdGVtcylcbiAgcmVzdWx0ID0gJydcbiAgZm9yIFtpdGVtLCBzZXBhcmF0b3JdIGluIF8uemlwKGl0ZW1zLCBzZXBhcmF0b3JzKVxuICAgIHJlc3VsdCArPSBpdGVtICsgc2VwYXJhdG9yXG4gIGxlYWRpbmdTcGFjZXMgKyByZXN1bHQgKyB0cmFpbGluZ1NwYWNlc1xuXG5jbGFzcyBBcmd1bWVudHNTcGxpdHRlclxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAYWxsVG9rZW5zID0gW11cbiAgICBAY3VycmVudFNlY3Rpb24gPSBudWxsXG5cbiAgc2V0dGxlUGVuZGluZzogLT5cbiAgICBpZiBAcGVuZGluZ1Rva2VuXG4gICAgICBAYWxsVG9rZW5zLnB1c2goe3RleHQ6IEBwZW5kaW5nVG9rZW4sIHR5cGU6IEBjdXJyZW50U2VjdGlvbn0pXG4gICAgICBAcGVuZGluZ1Rva2VuID0gJydcblxuICBjaGFuZ2VTZWN0aW9uOiAobmV3U2VjdGlvbikgLT5cbiAgICBpZiBAY3VycmVudFNlY3Rpb24gaXNudCBuZXdTZWN0aW9uXG4gICAgICBAc2V0dGxlUGVuZGluZygpIGlmIEBjdXJyZW50U2VjdGlvblxuICAgICAgQGN1cnJlbnRTZWN0aW9uID0gbmV3U2VjdGlvblxuXG5zcGxpdEFyZ3VtZW50cyA9ICh0ZXh0LCBqb2luU3BhY2VTZXBhcmF0ZWRUb2tlbikgLT5cbiAgam9pblNwYWNlU2VwYXJhdGVkVG9rZW4gPz0gdHJ1ZVxuICBzZXBhcmF0b3JDaGFycyA9IFwiXFx0LCBcXHJcXG5cIlxuICBxdW90ZUNoYXJzID0gXCJcXFwiJ2BcIlxuICBjbG9zZUNoYXJUb09wZW5DaGFyID0ge1xuICAgIFwiKVwiOiBcIihcIlxuICAgIFwifVwiOiBcIntcIlxuICAgIFwiXVwiOiBcIltcIlxuICB9XG4gIGNsb3NlUGFpckNoYXJzID0gXy5rZXlzKGNsb3NlQ2hhclRvT3BlbkNoYXIpLmpvaW4oJycpXG4gIG9wZW5QYWlyQ2hhcnMgPSBfLnZhbHVlcyhjbG9zZUNoYXJUb09wZW5DaGFyKS5qb2luKCcnKVxuICBlc2NhcGVDaGFyID0gXCJcXFxcXCJcblxuICBwZW5kaW5nVG9rZW4gPSAnJ1xuICBpblF1b3RlID0gZmFsc2VcbiAgaXNFc2NhcGVkID0gZmFsc2VcbiAgIyBQYXJzZSB0ZXh0IGFzIGxpc3Qgb2YgdG9rZW5zIHdoaWNoIGlzIGNvbW1tYSBzZXBhcmF0ZWQgb3Igd2hpdGUgc3BhY2Ugc2VwYXJhdGVkLlxuICAjIGUuZy4gJ2EsIGZ1bjEoYiwgYyksIGQnID0+IFsnYScsICdmdW4xKGIsIGMpLCAnZCddXG4gICMgTm90IHBlcmZlY3QuIGJ1dCBmYXIgYmV0dGVyIHRoYW4gc2ltcGxlIHN0cmluZyBzcGxpdCBieSByZWdleCBwYXR0ZXJuLlxuICBhbGxUb2tlbnMgPSBbXVxuICBjdXJyZW50U2VjdGlvbiA9IG51bGxcblxuICBzZXR0bGVQZW5kaW5nID0gLT5cbiAgICBpZiBwZW5kaW5nVG9rZW5cbiAgICAgIGFsbFRva2Vucy5wdXNoKHt0ZXh0OiBwZW5kaW5nVG9rZW4sIHR5cGU6IGN1cnJlbnRTZWN0aW9ufSlcbiAgICAgIHBlbmRpbmdUb2tlbiA9ICcnXG5cbiAgY2hhbmdlU2VjdGlvbiA9IChuZXdTZWN0aW9uKSAtPlxuICAgIGlmIGN1cnJlbnRTZWN0aW9uIGlzbnQgbmV3U2VjdGlvblxuICAgICAgc2V0dGxlUGVuZGluZygpIGlmIGN1cnJlbnRTZWN0aW9uXG4gICAgICBjdXJyZW50U2VjdGlvbiA9IG5ld1NlY3Rpb25cblxuICBwYWlyU3RhY2sgPSBbXVxuICBmb3IgY2hhciBpbiB0ZXh0XG4gICAgaWYgKHBhaXJTdGFjay5sZW5ndGggaXMgMCkgYW5kIChjaGFyIGluIHNlcGFyYXRvckNoYXJzKVxuICAgICAgY2hhbmdlU2VjdGlvbignc2VwYXJhdG9yJylcbiAgICBlbHNlXG4gICAgICBjaGFuZ2VTZWN0aW9uKCdhcmd1bWVudCcpXG4gICAgICBpZiBpc0VzY2FwZWRcbiAgICAgICAgaXNFc2NhcGVkID0gZmFsc2VcbiAgICAgIGVsc2UgaWYgY2hhciBpcyBlc2NhcGVDaGFyXG4gICAgICAgIGlzRXNjYXBlZCA9IHRydWVcbiAgICAgIGVsc2UgaWYgaW5RdW90ZVxuICAgICAgICBpZiAoY2hhciBpbiBxdW90ZUNoYXJzKSBhbmQgXy5sYXN0KHBhaXJTdGFjaykgaXMgY2hhclxuICAgICAgICAgIHBhaXJTdGFjay5wb3AoKVxuICAgICAgICAgIGluUXVvdGUgPSBmYWxzZVxuICAgICAgZWxzZSBpZiBjaGFyIGluIHF1b3RlQ2hhcnNcbiAgICAgICAgaW5RdW90ZSA9IHRydWVcbiAgICAgICAgcGFpclN0YWNrLnB1c2goY2hhcilcbiAgICAgIGVsc2UgaWYgY2hhciBpbiBvcGVuUGFpckNoYXJzXG4gICAgICAgIHBhaXJTdGFjay5wdXNoKGNoYXIpXG4gICAgICBlbHNlIGlmIGNoYXIgaW4gY2xvc2VQYWlyQ2hhcnNcbiAgICAgICAgcGFpclN0YWNrLnBvcCgpIGlmIF8ubGFzdChwYWlyU3RhY2spIGlzIGNsb3NlQ2hhclRvT3BlbkNoYXJbY2hhcl1cblxuICAgIHBlbmRpbmdUb2tlbiArPSBjaGFyXG4gIHNldHRsZVBlbmRpbmcoKVxuXG4gIGlmIGpvaW5TcGFjZVNlcGFyYXRlZFRva2VuIGFuZCBhbGxUb2tlbnMuc29tZSgoe3R5cGUsIHRleHR9KSAtPiB0eXBlIGlzICdzZXBhcmF0b3InIGFuZCAnLCcgaW4gdGV4dClcbiAgICAjIFdoZW4gc29tZSBzZXBhcmF0b3IgY29udGFpbnMgYCxgIHRyZWF0IHdoaXRlLXNwYWNlIHNlcGFyYXRvciBpcyBqdXN0IHBhcnQgb2YgdG9rZW4uXG4gICAgIyBTbyB3ZSBtb3ZlIHdoaXRlLXNwYWNlIG9ubHkgc3BhcmF0b3IgaW50byB0b2tlbnMgYnkgam9pbmluZyBtaXMtc2VwYXJhdG9lZCB0b2tlbnMuXG4gICAgbmV3QWxsVG9rZW5zID0gW11cbiAgICB3aGlsZSBhbGxUb2tlbnMubGVuZ3RoXG4gICAgICB0b2tlbiA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICBzd2l0Y2ggdG9rZW4udHlwZVxuICAgICAgICB3aGVuICdhcmd1bWVudCdcbiAgICAgICAgICBuZXdBbGxUb2tlbnMucHVzaCh0b2tlbilcbiAgICAgICAgd2hlbiAnc2VwYXJhdG9yJ1xuICAgICAgICAgIGlmICcsJyBpbiB0b2tlbi50ZXh0XG4gICAgICAgICAgICBuZXdBbGxUb2tlbnMucHVzaCh0b2tlbilcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIDEuIENvbmNhdG5hdGUgd2hpdGUtc3BhY2Utc2VwYXJhdG9yIGFuZCBuZXh0LWFyZ3VtZW50XG4gICAgICAgICAgICAjIDIuIFRoZW4gam9pbiBpbnRvIGxhdGVzdCBhcmd1bWVudFxuICAgICAgICAgICAgbGFzdEFyZyA9IG5ld0FsbFRva2Vucy5wb3AoKSA/IHt0ZXh0OiAnJywgJ2FyZ3VtZW50J31cbiAgICAgICAgICAgIGxhc3RBcmcudGV4dCArPSB0b2tlbi50ZXh0ICsgKGFsbFRva2Vucy5zaGlmdCgpPy50ZXh0ID8gJycpICMgY29uY2F0IHdpdGggbmV4dC1hcmd1bWVudFxuICAgICAgICAgICAgbmV3QWxsVG9rZW5zLnB1c2gobGFzdEFyZylcbiAgICBhbGxUb2tlbnMgPSBuZXdBbGxUb2tlbnNcbiAgYWxsVG9rZW5zXG5cbnNjYW5FZGl0b3JJbkRpcmVjdGlvbiA9IChlZGl0b3IsIGRpcmVjdGlvbiwgcGF0dGVybiwgb3B0aW9ucz17fSwgZm4pIC0+XG4gIHthbGxvd05leHRMaW5lLCBmcm9tLCBzY2FuUmFuZ2V9ID0gb3B0aW9uc1xuICBpZiBub3QgZnJvbT8gYW5kIG5vdCBzY2FuUmFuZ2U/XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgZWl0aGVyIG9mICdmcm9tJyBvciAnc2NhblJhbmdlJyBvcHRpb25zXCIpXG5cbiAgaWYgc2NhblJhbmdlXG4gICAgYWxsb3dOZXh0TGluZSA9IHRydWVcbiAgZWxzZVxuICAgIGFsbG93TmV4dExpbmUgPz0gdHJ1ZVxuICBmcm9tID0gUG9pbnQuZnJvbU9iamVjdChmcm9tKSBpZiBmcm9tP1xuICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAnZm9yd2FyZCdcbiAgICAgIHNjYW5SYW5nZSA/PSBuZXcgUmFuZ2UoZnJvbSwgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oZWRpdG9yKSlcbiAgICAgIHNjYW5GdW5jdGlvbiA9ICdzY2FuSW5CdWZmZXJSYW5nZSdcbiAgICB3aGVuICdiYWNrd2FyZCdcbiAgICAgIHNjYW5SYW5nZSA/PSBuZXcgUmFuZ2UoWzAsIDBdLCBmcm9tKVxuICAgICAgc2NhbkZ1bmN0aW9uID0gJ2JhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlJ1xuXG4gIGVkaXRvcltzY2FuRnVuY3Rpb25dIHBhdHRlcm4sIHNjYW5SYW5nZSwgKGV2ZW50KSAtPlxuICAgIGlmIG5vdCBhbGxvd05leHRMaW5lIGFuZCBldmVudC5yYW5nZS5zdGFydC5yb3cgaXNudCBmcm9tLnJvd1xuICAgICAgZXZlbnQuc3RvcCgpXG4gICAgICByZXR1cm5cbiAgICBmbihldmVudClcblxuYWRqdXN0SW5kZW50V2l0aEtlZXBpbmdMYXlvdXQgPSAoZWRpdG9yLCByYW5nZSkgLT5cbiAgIyBBZGp1c3QgaW5kZW50TGV2ZWwgd2l0aCBrZWVwaW5nIG9yaWdpbmFsIGxheW91dCBvZiBwYXN0aW5nIHRleHQuXG4gICMgU3VnZ2VzdGVkIGluZGVudCBsZXZlbCBvZiByYW5nZS5zdGFydC5yb3cgaXMgY29ycmVjdCBhcyBsb25nIGFzIHJhbmdlLnN0YXJ0LnJvdyBoYXZlIG1pbmltdW0gaW5kZW50IGxldmVsLlxuICAjIEJ1dCB3aGVuIHdlIHBhc3RlIGZvbGxvd2luZyBhbHJlYWR5IGluZGVudGVkIHRocmVlIGxpbmUgdGV4dCwgd2UgaGF2ZSB0byBhZGp1c3QgaW5kZW50IGxldmVsXG4gICMgIHNvIHRoYXQgYHZhckZvcnR5VHdvYCBsaW5lIGhhdmUgc3VnZ2VzdGVkSW5kZW50TGV2ZWwuXG4gICNcbiAgIyAgICAgICAgdmFyT25lOiB2YWx1ZSAjIHN1Z2dlc3RlZEluZGVudExldmVsIGlzIGRldGVybWluZWQgYnkgdGhpcyBsaW5lXG4gICMgICB2YXJGb3J0eVR3bzogdmFsdWUgIyBXZSBuZWVkIHRvIG1ha2UgZmluYWwgaW5kZW50IGxldmVsIG9mIHRoaXMgcm93IHRvIGJlIHN1Z2dlc3RlZEluZGVudExldmVsLlxuICAjICAgICAgdmFyVGhyZWU6IHZhbHVlXG4gICNcbiAgIyBTbyB3aGF0IHdlIGFyZSBkb2luZyBoZXJlIGlzIGFwcGx5IHN1Z2dlc3RlZEluZGVudExldmVsIHdpdGggZml4aW5nIGlzc3VlIGFib3ZlLlxuICAjIDEuIERldGVybWluZSBtaW5pbXVtIGluZGVudCBsZXZlbCBhbW9uZyBwYXN0ZWQgcmFuZ2UoPSByYW5nZSApIGV4Y2x1ZGluZyBlbXB0eSByb3dcbiAgIyAyLiBUaGVuIHVwZGF0ZSBpbmRlbnRMZXZlbCBvZiBlYWNoIHJvd3MgdG8gZmluYWwgaW5kZW50TGV2ZWwgb2YgbWluaW11bS1pbmRlbnRlZCByb3cgaGF2ZSBzdWdnZXN0ZWRJbmRlbnRMZXZlbC5cbiAgc3VnZ2VzdGVkTGV2ZWwgPSBlZGl0b3Iuc3VnZ2VzdGVkSW5kZW50Rm9yQnVmZmVyUm93KHJhbmdlLnN0YXJ0LnJvdylcbiAgbWluTGV2ZWwgPSBudWxsXG4gIHJvd0FuZEFjdHVhbExldmVscyA9IFtdXG4gIGZvciByb3cgaW4gW3JhbmdlLnN0YXJ0LnJvdy4uLnJhbmdlLmVuZC5yb3ddXG4gICAgYWN0dWFsTGV2ZWwgPSBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhlZGl0b3IsIHJvdylcbiAgICByb3dBbmRBY3R1YWxMZXZlbHMucHVzaChbcm93LCBhY3R1YWxMZXZlbF0pXG4gICAgdW5sZXNzIGlzRW1wdHlSb3coZWRpdG9yLCByb3cpXG4gICAgICBtaW5MZXZlbCA9IE1hdGgubWluKG1pbkxldmVsID8gSW5maW5pdHksIGFjdHVhbExldmVsKVxuXG4gIGlmIG1pbkxldmVsPyBhbmQgKGRlbHRhVG9TdWdnZXN0ZWRMZXZlbCA9IHN1Z2dlc3RlZExldmVsIC0gbWluTGV2ZWwpXG4gICAgZm9yIFtyb3csIGFjdHVhbExldmVsXSBpbiByb3dBbmRBY3R1YWxMZXZlbHNcbiAgICAgIG5ld0xldmVsID0gYWN0dWFsTGV2ZWwgKyBkZWx0YVRvU3VnZ2VzdGVkTGV2ZWxcbiAgICAgIGVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3csIG5ld0xldmVsKVxuXG4jIENoZWNrIHBvaW50IGNvbnRhaW5tZW50IHdpdGggZW5kIHBvc2l0aW9uIGV4Y2x1c2l2ZVxucmFuZ2VDb250YWluc1BvaW50V2l0aEVuZEV4Y2x1c2l2ZSA9IChyYW5nZSwgcG9pbnQpIC0+XG4gIHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW5PckVxdWFsKHBvaW50KSBhbmRcbiAgICByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihwb2ludClcblxudHJhdmVyc2VUZXh0RnJvbVBvaW50ID0gKHBvaW50LCB0ZXh0KSAtPlxuICBwb2ludC50cmF2ZXJzZShnZXRUcmF2ZXJzYWxGb3JUZXh0KHRleHQpKVxuXG5nZXRUcmF2ZXJzYWxGb3JUZXh0ID0gKHRleHQpIC0+XG4gIHJvdyA9IDBcbiAgY29sdW1uID0gMFxuICBmb3IgY2hhciBpbiB0ZXh0XG4gICAgaWYgY2hhciBpcyBcIlxcblwiXG4gICAgICByb3crK1xuICAgICAgY29sdW1uID0gMFxuICAgIGVsc2VcbiAgICAgIGNvbHVtbisrXG4gIFtyb3csIGNvbHVtbl1cblxuXG4jIFJldHVybiBlbmRSb3cgb2YgZm9sZCBpZiByb3cgd2FzIGZvbGRlZCBvciBqdXN0IHJldHVybiBwYXNzZWQgcm93LlxuZ2V0Rm9sZEVuZFJvd0ZvclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgaWYgZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KVxuICAgIGdldExhcmdlc3RGb2xkUmFuZ2VDb250YWluc0J1ZmZlclJvdyhlZGl0b3IsIHJvdykuZW5kLnJvd1xuICBlbHNlXG4gICAgcm93XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhc3NlcnRXaXRoRXhjZXB0aW9uXG4gIGdldEFuY2VzdG9yc1xuICBnZXRLZXlCaW5kaW5nRm9yQ29tbWFuZFxuICBpbmNsdWRlXG4gIGRlYnVnXG4gIHNhdmVFZGl0b3JTdGF0ZVxuICBpc0xpbmV3aXNlUmFuZ2VcbiAgc29ydFJhbmdlc1xuICBnZXRJbmRleFxuICBnZXRWaXNpYmxlQnVmZmVyUmFuZ2VcbiAgZ2V0VmlzaWJsZUVkaXRvcnNcbiAgcG9pbnRJc0F0RW5kT2ZMaW5lXG4gIHBvaW50SXNPbldoaXRlU3BhY2VcbiAgcG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvd1xuICBwb2ludElzQXRWaW1FbmRPZkZpbGVcbiAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb25cbiAgZ2V0VmltRW9mU2NyZWVuUG9zaXRpb25cbiAgZ2V0VmltTGFzdEJ1ZmZlclJvd1xuICBnZXRWaW1MYXN0U2NyZWVuUm93XG4gIHNldEJ1ZmZlclJvd1xuICBzZXRCdWZmZXJDb2x1bW5cbiAgbW92ZUN1cnNvckxlZnRcbiAgbW92ZUN1cnNvclJpZ2h0XG4gIG1vdmVDdXJzb3JVcFNjcmVlblxuICBtb3ZlQ3Vyc29yRG93blNjcmVlblxuICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3dcbiAgZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93XG4gIGdldExhc3RWaXNpYmxlU2NyZWVuUm93XG4gIGdldFZhbGlkVmltQnVmZmVyUm93XG4gIGdldFZhbGlkVmltU2NyZWVuUm93XG4gIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3dcbiAgZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uXG4gIGdldEluZGVudExldmVsRm9yQnVmZmVyUm93XG4gIGdldFRleHRJblNjcmVlblJhbmdlXG4gIG1vdmVDdXJzb3JUb05leHROb25XaGl0ZXNwYWNlXG4gIGlzRW1wdHlSb3dcbiAgZ2V0Q29kZUZvbGRSb3dSYW5nZXNcbiAgZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3dcbiAgZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5lZEJ5Rm9sZFN0YXJ0c0F0Um93XG4gIGdldEZvbGRSb3dSYW5nZXNcbiAgZ2V0Rm9sZFJhbmdlc1dpdGhJbmRlbnRcbiAgZ2V0Rm9sZEluZm9CeUtpbmRcbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZVxuICB0cmltUmFuZ2VcbiAgZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvd1xuICBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93XG4gIGRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlXG4gIGdldEJ1ZmZlclJvd3NcbiAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uXG4gIG1hdGNoU2NvcGVzXG4gIGlzU2luZ2xlTGluZVRleHRcbiAgZ2V0V29yZEJ1ZmZlclJhbmdlQXRCdWZmZXJQb3NpdGlvblxuICBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvblxuICBnZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0U3Vid29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uXG4gIGdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yXG4gIHNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lXG4gIHNjYW5FZGl0b3JcbiAgY29sbGVjdFJhbmdlSW5CdWZmZXJSb3dcbiAgZmluZFJhbmdlSW5CdWZmZXJSb3dcbiAgZ2V0TGFyZ2VzdEZvbGRSYW5nZUNvbnRhaW5zQnVmZmVyUm93XG4gIHRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxuICBnZXRSYW5nZUJ5VHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIGdldFBhY2thZ2VcbiAgc2VhcmNoQnlQcm9qZWN0RmluZFxuICBsaW1pdE51bWJlclxuICBmaW5kUmFuZ2VDb250YWluc1BvaW50XG5cbiAgaXNFbXB0eSwgaXNOb3RFbXB0eVxuICBpc1NpbmdsZUxpbmVSYW5nZSwgaXNOb3RTaW5nbGVMaW5lUmFuZ2VcblxuICBpbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvblxuICBlbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3dcbiAgaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlXG4gIGlzTm90TGVhZGluZ1doaXRlU3BhY2VSYW5nZVxuICBpc0VzY2FwZWRDaGFyUmFuZ2VcblxuICBhZGRDbGFzc0xpc3RcbiAgcmVtb3ZlQ2xhc3NMaXN0XG4gIHRvZ2dsZUNsYXNzTGlzdFxuICB0b2dnbGVDYXNlRm9yQ2hhcmFjdGVyXG4gIHNwbGl0VGV4dEJ5TmV3TGluZVxuICByZXBsYWNlRGVjb3JhdGlvbkNsYXNzQnlcbiAgaHVtYW5pemVCdWZmZXJSYW5nZVxuICBleHBhbmRSYW5nZVRvV2hpdGVTcGFjZXNcbiAgc3BsaXRBbmRKb2luQnlcbiAgc3BsaXRBcmd1bWVudHNcbiAgc2NhbkVkaXRvckluRGlyZWN0aW9uXG4gIGFkanVzdEluZGVudFdpdGhLZWVwaW5nTGF5b3V0XG4gIHJhbmdlQ29udGFpbnNQb2ludFdpdGhFbmRFeGNsdXNpdmVcbiAgdHJhdmVyc2VUZXh0RnJvbVBvaW50XG4gIGdldEZvbGRFbmRSb3dGb3JSb3dcbn1cbiJdfQ==
