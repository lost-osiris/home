(function() {
  var ArgumentsSplitter, Disposable, Point, Range, _, addClassList, adjustIndentWithKeepingLayout, assertWithException, buildWordPatternByCursor, collectRangeInBufferRow, debug, detectScopeStartPositionForScope, ensureEndsWithNewLineForBufferRow, expandRangeToWhiteSpaces, findRangeContainsPoint, findRangeInBufferRow, forEachPaneAxis, fs, getAncestors, getBeginningOfWordBufferPosition, getBufferRangeForRowRange, getBufferRows, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getEndOfLineForBufferRow, getEndOfWordBufferPosition, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeyBindingForCommand, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getLeftCharacterForBufferPosition, getLineTextToBufferPosition, getNonWordCharactersForCursor, getPackage, getRangeByTranslatePointAndClip, getRightCharacterForBufferPosition, getScopesForTokenizedLine, getSubwordPatternAtBufferPosition, getTextInScreenRange, getTokenizedLineForRow, getTraversalForText, getValidVimBufferRow, getValidVimScreenRow, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, getVisibleEditors, getWordBufferRangeAndKindAtBufferPosition, getWordBufferRangeAtBufferPosition, getWordPatternAtBufferPosition, humanizeBufferRange, include, insertTextAtBufferPosition, isEmpty, isEmptyRow, isEndsWithNewLineForBufferRow, isEscapedCharRange, isFunctionScope, isIncludeFunctionScopeForRow, isLeadingWhiteSpaceRange, isLinewiseRange, isNotEmpty, isNotLeadingWhiteSpaceRange, isNotSingleLineRange, isSingleLineRange, isSingleLineText, limitNumber, matchScopes, modifyClassList, moveCursor, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpScreen, negateFunction, pointIsAtEndOfLine, pointIsAtEndOfLineAtNonEmptyRow, pointIsAtVimEndOfFile, pointIsOnWhiteSpace, rangeContainsPointWithEndExclusive, ref, removeClassList, replaceDecorationClassBy, saveEditorState, scanEditor, scanEditorInDirection, scanForScopeStart, searchByProjectFind, setBufferColumn, setBufferRow, settings, shouldPreventWrapLine, shrinkRangeEndToBeforeNewLine, smartScrollToBufferPosition, sortRanges, splitAndJoinBy, splitArguments, splitTextByNewLine, toggleCaseForCharacter, toggleClassList, translatePointAndClip, traverseTextFromPoint, trimRange,
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

  forEachPaneAxis = function(fn, base) {
    var child, j, len, ref1, results1;
    if (base == null) {
      base = atom.workspace.getActivePane().getContainer().getRoot();
    }
    if (base.children != null) {
      fn(base);
      ref1 = base.children;
      results1 = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        child = ref1[j];
        results1.push(forEachPaneAxis(fn, child));
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
    traverseTextFromPoint: traverseTextFromPoint
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3V0aWxzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEseTJFQUFBO0lBQUE7OztFQUFBLEVBQUEsR0FBSzs7RUFDTCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBRVgsTUFBNkIsT0FBQSxDQUFRLE1BQVIsQ0FBN0IsRUFBQywyQkFBRCxFQUFhLGlCQUFiLEVBQW9COztFQUNwQixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVKLG1CQUFBLEdBQXNCLFNBQUMsU0FBRCxFQUFZLE9BQVosRUFBcUIsRUFBckI7V0FDcEIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxTQUFaLEVBQXVCLE9BQXZCLEVBQWdDLFNBQUMsS0FBRDtBQUM5QixZQUFVLElBQUEsS0FBQSxDQUFNLEtBQUssQ0FBQyxPQUFaO0lBRG9CLENBQWhDO0VBRG9COztFQUl0QixZQUFBLEdBQWUsU0FBQyxHQUFEO0FBQ2IsUUFBQTtJQUFBLFNBQUEsR0FBWTtJQUNaLE9BQUEsR0FBVTtBQUNWLFdBQUEsSUFBQTtNQUNFLFNBQVMsQ0FBQyxJQUFWLENBQWUsT0FBZjtNQUNBLE9BQUEsNENBQTJCLENBQUU7TUFDN0IsSUFBQSxDQUFhLE9BQWI7QUFBQSxjQUFBOztJQUhGO1dBSUE7RUFQYTs7RUFTZix1QkFBQSxHQUEwQixTQUFDLE9BQUQsRUFBVSxHQUFWO0FBQ3hCLFFBQUE7SUFEbUMsY0FBRDtJQUNsQyxPQUFBLEdBQVU7SUFDVixPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQUE7SUFDVixJQUFHLG1CQUFIO01BQ0UsVUFBQSxHQUFhLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsV0FBL0IsQ0FBMkMsQ0FBQyxjQUE1QyxDQUFBLENBQTRELENBQUMsR0FBN0QsQ0FBQTtNQUNiLE9BQUEsR0FBVSxPQUFPLENBQUMsTUFBUixDQUFlLFNBQUMsSUFBRDtBQUFjLFlBQUE7UUFBWixTQUFEO2VBQWEsTUFBQSxLQUFVO01BQXhCLENBQWYsRUFGWjs7QUFJQSxTQUFBLHlDQUFBOztZQUEyQixNQUFNLENBQUMsT0FBUCxLQUFrQjs7O01BQzFDLDhCQUFELEVBQWE7TUFDYixVQUFBLEdBQWEsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsUUFBbkIsRUFBNkIsRUFBN0I7TUFDYixtQkFBQyxVQUFBLFVBQVcsRUFBWixDQUFlLENBQUMsSUFBaEIsQ0FBcUI7UUFBQyxZQUFBLFVBQUQ7UUFBYSxVQUFBLFFBQWI7T0FBckI7QUFIRjtXQUlBO0VBWHdCOztFQWMxQixPQUFBLEdBQVUsU0FBQyxLQUFELEVBQVEsTUFBUjtBQUNSLFFBQUE7QUFBQTtTQUFBLGFBQUE7O29CQUNFLEtBQUssQ0FBQSxTQUFHLENBQUEsR0FBQSxDQUFSLEdBQWU7QUFEakI7O0VBRFE7O0VBSVYsS0FBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBRE87SUFDUCxJQUFBLENBQWMsUUFBUSxDQUFDLEdBQVQsQ0FBYSxPQUFiLENBQWQ7QUFBQSxhQUFBOztBQUNBLFlBQU8sUUFBUSxDQUFDLEdBQVQsQ0FBYSxhQUFiLENBQVA7QUFBQSxXQUNPLFNBRFA7ZUFFSSxPQUFPLENBQUMsR0FBUixnQkFBWSxRQUFaO0FBRkosV0FHTyxNQUhQOztVQUlJLEtBQU0sT0FBQSxDQUFRLFNBQVI7O1FBQ04sUUFBQSxHQUFXLEVBQUUsQ0FBQyxTQUFILENBQWEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxxQkFBYixDQUFiO1FBQ1gsSUFBRyxFQUFFLENBQUMsVUFBSCxDQUFjLFFBQWQsQ0FBSDtpQkFDRSxFQUFFLENBQUMsY0FBSCxDQUFrQixRQUFsQixFQUE0QixRQUFBLEdBQVcsSUFBdkMsRUFERjs7QUFOSjtFQUZNOztFQVlSLGVBQUEsR0FBa0IsU0FBQyxNQUFEO0FBQ2hCLFFBQUE7SUFBQSxhQUFBLEdBQWdCLE1BQU0sQ0FBQztJQUN2QixTQUFBLEdBQVksYUFBYSxDQUFDLFlBQWQsQ0FBQTtJQUVaLGFBQUEsR0FBZ0IsTUFBTSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFyQyxDQUFpRCxFQUFqRCxDQUFvRCxDQUFDLEdBQXJELENBQXlELFNBQUMsQ0FBRDthQUFPLENBQUMsQ0FBQyxnQkFBRixDQUFBLENBQW9CLENBQUM7SUFBNUIsQ0FBekQ7V0FDaEIsU0FBQTtBQUNFLFVBQUE7QUFBQTtBQUFBLFdBQUEsc0NBQUE7O1lBQXdDLENBQUksTUFBTSxDQUFDLG1CQUFQLENBQTJCLEdBQTNCO1VBQzFDLE1BQU0sQ0FBQyxhQUFQLENBQXFCLEdBQXJCOztBQURGO2FBRUEsYUFBYSxDQUFDLFlBQWQsQ0FBMkIsU0FBM0I7SUFIRjtFQUxnQjs7RUFVbEIsZUFBQSxHQUFrQixTQUFDLEdBQUQ7QUFDaEIsUUFBQTtJQURrQixtQkFBTztXQUN6QixDQUFDLEtBQUssQ0FBQyxHQUFOLEtBQWUsR0FBRyxDQUFDLEdBQXBCLENBQUEsSUFBNkIsQ0FBQyxDQUFBLEtBQUssQ0FBQyxNQUFOLGFBQWdCLEdBQUcsQ0FBQyxPQUFwQixRQUFBLEtBQThCLENBQTlCLENBQUQ7RUFEYjs7RUFHbEIsNkJBQUEsR0FBZ0MsU0FBQyxNQUFELEVBQVMsR0FBVDtBQUM5QixRQUFBO0lBQUEsT0FBZSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsR0FBL0IsRUFBb0M7TUFBQSxjQUFBLEVBQWdCLElBQWhCO0tBQXBDLENBQWYsRUFBQyxrQkFBRCxFQUFRO1dBQ1IsS0FBSyxDQUFDLEdBQU4sS0FBZSxHQUFHLENBQUM7RUFGVzs7RUFJaEMsVUFBQSxHQUFhLFNBQUMsVUFBRDtXQUNYLFVBQVUsQ0FBQyxJQUFYLENBQWdCLFNBQUMsQ0FBRCxFQUFJLENBQUo7YUFBVSxDQUFDLENBQUMsT0FBRixDQUFVLENBQVY7SUFBVixDQUFoQjtFQURXOztFQUtiLFFBQUEsR0FBVyxTQUFDLEtBQUQsRUFBUSxJQUFSO0FBQ1QsUUFBQTtJQUFBLE1BQUEsR0FBUyxJQUFJLENBQUM7SUFDZCxJQUFHLE1BQUEsS0FBVSxDQUFiO2FBQ0UsQ0FBQyxFQURIO0tBQUEsTUFBQTtNQUdFLEtBQUEsR0FBUSxLQUFBLEdBQVE7TUFDaEIsSUFBRyxLQUFBLElBQVMsQ0FBWjtlQUNFLE1BREY7T0FBQSxNQUFBO2VBR0UsTUFBQSxHQUFTLE1BSFg7T0FKRjs7RUFGUzs7RUFhWCxxQkFBQSxHQUF3QixTQUFDLE1BQUQ7QUFDdEIsUUFBQTtJQUFBLE9BQXFCLE1BQU0sQ0FBQyxPQUFPLENBQUMsa0JBQWYsQ0FBQSxDQUFyQixFQUFDLGtCQUFELEVBQVc7SUFDWCxJQUFBLENBQW1CLENBQUMsa0JBQUEsSUFBYyxnQkFBZixDQUFuQjtBQUFBLGFBQU8sS0FBUDs7SUFDQSxRQUFBLEdBQVcsTUFBTSxDQUFDLHFCQUFQLENBQTZCLFFBQTdCO0lBQ1gsTUFBQSxHQUFTLE1BQU0sQ0FBQyxxQkFBUCxDQUE2QixNQUE3QjtXQUNMLElBQUEsS0FBQSxDQUFNLENBQUMsUUFBRCxFQUFXLENBQVgsQ0FBTixFQUFxQixDQUFDLE1BQUQsRUFBUyxLQUFULENBQXJCO0VBTGtCOztFQU94QixpQkFBQSxHQUFvQixTQUFBO0FBQ2xCLFFBQUE7QUFBQztBQUFBO1NBQUEsc0NBQUE7O1VBQWtELE1BQUEsR0FBUyxJQUFJLENBQUMsZUFBTCxDQUFBO3NCQUEzRDs7QUFBQTs7RUFEaUI7O0VBR3BCLHdCQUFBLEdBQTJCLFNBQUMsTUFBRCxFQUFTLEdBQVQ7V0FDekIsTUFBTSxDQUFDLHVCQUFQLENBQStCLEdBQS9CLENBQW1DLENBQUM7RUFEWDs7RUFLM0Isa0JBQUEsR0FBcUIsU0FBQyxNQUFELEVBQVMsS0FBVDtJQUNuQixLQUFBLEdBQVEsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsS0FBakI7V0FDUix3QkFBQSxDQUF5QixNQUF6QixFQUFpQyxLQUFLLENBQUMsR0FBdkMsQ0FBMkMsQ0FBQyxPQUE1QyxDQUFvRCxLQUFwRDtFQUZtQjs7RUFJckIsbUJBQUEsR0FBc0IsU0FBQyxNQUFELEVBQVMsS0FBVDtBQUNwQixRQUFBO0lBQUEsSUFBQSxHQUFPLGtDQUFBLENBQW1DLE1BQW5DLEVBQTJDLEtBQTNDO1dBQ1AsQ0FBSSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVY7RUFGZ0I7O0VBSXRCLCtCQUFBLEdBQWtDLFNBQUMsTUFBRCxFQUFTLEtBQVQ7SUFDaEMsS0FBQSxHQUFRLEtBQUssQ0FBQyxVQUFOLENBQWlCLEtBQWpCO1dBQ1IsS0FBSyxDQUFDLE1BQU4sS0FBa0IsQ0FBbEIsSUFBd0Isa0JBQUEsQ0FBbUIsTUFBbkIsRUFBMkIsS0FBM0I7RUFGUTs7RUFJbEMscUJBQUEsR0FBd0IsU0FBQyxNQUFELEVBQVMsS0FBVDtXQUN0Qix1QkFBQSxDQUF3QixNQUF4QixDQUErQixDQUFDLE9BQWhDLENBQXdDLEtBQXhDO0VBRHNCOztFQUd4QixVQUFBLEdBQWEsU0FBQyxNQUFELEVBQVMsR0FBVDtXQUNYLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixHQUEvQixDQUFtQyxDQUFDLE9BQXBDLENBQUE7RUFEVzs7RUFHYixrQ0FBQSxHQUFxQyxTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLE1BQWhCOztNQUFnQixTQUFPOztXQUMxRCxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsS0FBSyxDQUFDLGtCQUFOLENBQXlCLEtBQXpCLEVBQWdDLENBQWhDLEVBQW1DLE1BQW5DLENBQTVCO0VBRG1DOztFQUdyQyxpQ0FBQSxHQUFvQyxTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLE1BQWhCOztNQUFnQixTQUFPOztXQUN6RCxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsS0FBSyxDQUFDLGtCQUFOLENBQXlCLEtBQXpCLEVBQWdDLENBQWhDLEVBQW1DLENBQUMsTUFBcEMsQ0FBNUI7RUFEa0M7O0VBR3BDLG9CQUFBLEdBQXVCLFNBQUMsTUFBRCxFQUFTLFdBQVQ7QUFDckIsUUFBQTtJQUFBLFdBQUEsR0FBYyxNQUFNLENBQUMseUJBQVAsQ0FBaUMsV0FBakM7V0FDZCxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsV0FBNUI7RUFGcUI7O0VBSXZCLDZCQUFBLEdBQWdDLFNBQUMsTUFBRDtBQUU5QixRQUFBO0lBQUEsSUFBRyxtQ0FBSDthQUNFLE1BQU0sQ0FBQyxvQkFBUCxDQUFBLEVBREY7S0FBQSxNQUFBO01BR0UsS0FBQSxHQUFRLE1BQU0sQ0FBQyxrQkFBUCxDQUFBLENBQTJCLENBQUMsY0FBNUIsQ0FBQTthQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwwQkFBaEIsRUFBNEM7UUFBQyxPQUFBLEtBQUQ7T0FBNUMsRUFKRjs7RUFGOEI7O0VBVWhDLDZCQUFBLEdBQWdDLFNBQUMsTUFBRDtBQUM5QixRQUFBO0lBQUEsYUFBQSxHQUFnQixNQUFNLENBQUMsaUJBQVAsQ0FBQTtJQUNoQixNQUFBLEdBQVMsTUFBTSxDQUFDO0lBQ2hCLE1BQUEsR0FBUyx1QkFBQSxDQUF3QixNQUF4QjtBQUVULFdBQU0sbUJBQUEsQ0FBb0IsTUFBcEIsRUFBNEIsS0FBQSxHQUFRLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQXBDLENBQUEsSUFBb0UsQ0FBSSxLQUFLLENBQUMsb0JBQU4sQ0FBMkIsTUFBM0IsQ0FBOUU7TUFDRSxNQUFNLENBQUMsU0FBUCxDQUFBO0lBREY7V0FFQSxDQUFJLGFBQWEsQ0FBQyxPQUFkLENBQXNCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQXRCO0VBUDBCOztFQVNoQyxhQUFBLEdBQWdCLFNBQUMsTUFBRCxFQUFTLEdBQVQ7QUFDZCxRQUFBO0lBRHdCLHlCQUFVO0FBQ2xDLFlBQU8sU0FBUDtBQUFBLFdBQ08sVUFEUDtRQUVJLElBQUcsUUFBQSxJQUFZLENBQWY7aUJBQ0UsR0FERjtTQUFBLE1BQUE7aUJBR0U7Ozs7eUJBSEY7O0FBREc7QUFEUCxXQU1PLE1BTlA7UUFPSSxNQUFBLEdBQVMsbUJBQUEsQ0FBb0IsTUFBcEI7UUFDVCxJQUFHLFFBQUEsSUFBWSxNQUFmO2lCQUNFLEdBREY7U0FBQSxNQUFBO2lCQUdFOzs7O3lCQUhGOztBQVJKO0VBRGM7O0VBb0JoQix1QkFBQSxHQUEwQixTQUFDLE1BQUQ7QUFDeEIsUUFBQTtJQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsb0JBQVAsQ0FBQTtJQUNOLElBQUcsQ0FBQyxHQUFHLENBQUMsR0FBSixLQUFXLENBQVosQ0FBQSxJQUFrQixDQUFDLEdBQUcsQ0FBQyxNQUFKLEdBQWEsQ0FBZCxDQUFyQjthQUNFLElBREY7S0FBQSxNQUFBO2FBR0Usd0JBQUEsQ0FBeUIsTUFBekIsRUFBaUMsR0FBRyxDQUFDLEdBQUosR0FBVSxDQUEzQyxFQUhGOztFQUZ3Qjs7RUFPMUIsdUJBQUEsR0FBMEIsU0FBQyxNQUFEO1dBQ3hCLE1BQU0sQ0FBQywrQkFBUCxDQUF1Qyx1QkFBQSxDQUF3QixNQUF4QixDQUF2QztFQUR3Qjs7RUFHMUIsbUJBQUEsR0FBc0IsU0FBQyxNQUFEO1dBQVksdUJBQUEsQ0FBd0IsTUFBeEIsQ0FBK0IsQ0FBQztFQUE1Qzs7RUFDdEIsbUJBQUEsR0FBc0IsU0FBQyxNQUFEO1dBQVksdUJBQUEsQ0FBd0IsTUFBeEIsQ0FBK0IsQ0FBQztFQUE1Qzs7RUFDdEIsd0JBQUEsR0FBMkIsU0FBQyxNQUFEO1dBQVksTUFBTSxDQUFDLE9BQU8sQ0FBQyx3QkFBZixDQUFBO0VBQVo7O0VBQzNCLHVCQUFBLEdBQTBCLFNBQUMsTUFBRDtXQUFZLE1BQU0sQ0FBQyxPQUFPLENBQUMsdUJBQWYsQ0FBQTtFQUFaOztFQUUxQixxQ0FBQSxHQUF3QyxTQUFDLE1BQUQsRUFBUyxHQUFUO0FBQ3RDLFFBQUE7SUFBQSxLQUFBLEdBQVEsb0JBQUEsQ0FBcUIsTUFBckIsRUFBNkIsSUFBN0IsRUFBbUMsR0FBbkM7MEVBQ1csSUFBQSxLQUFBLENBQU0sR0FBTixFQUFXLENBQVg7RUFGbUI7O0VBSXhDLFNBQUEsR0FBWSxTQUFDLE1BQUQsRUFBUyxTQUFUO0FBQ1YsUUFBQTtJQUFBLE9BQUEsR0FBVTtJQUNWLE9BQWUsRUFBZixFQUFDLGVBQUQsRUFBUTtJQUNSLFFBQUEsR0FBVyxTQUFDLEdBQUQ7QUFBYSxVQUFBO01BQVgsUUFBRDthQUFhLG1CQUFELEVBQVU7SUFBdkI7SUFDWCxNQUFBLEdBQVMsU0FBQyxHQUFEO0FBQWEsVUFBQTtNQUFYLFFBQUQ7YUFBYSxlQUFELEVBQVE7SUFBckI7SUFDVCxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsT0FBekIsRUFBa0MsU0FBbEMsRUFBNkMsUUFBN0M7SUFDQSxJQUFpRSxhQUFqRTtNQUFBLE1BQU0sQ0FBQywwQkFBUCxDQUFrQyxPQUFsQyxFQUEyQyxTQUEzQyxFQUFzRCxNQUF0RCxFQUFBOztJQUNBLElBQUcsZUFBQSxJQUFXLGFBQWQ7YUFDTSxJQUFBLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixFQUROO0tBQUEsTUFBQTthQUdFLFVBSEY7O0VBUFU7O0VBZVosWUFBQSxHQUFlLFNBQUMsTUFBRCxFQUFTLEdBQVQsRUFBYyxPQUFkO0FBQ2IsUUFBQTtJQUFBLE1BQUEsK0NBQTZCLE1BQU0sQ0FBQyxlQUFQLENBQUE7SUFDN0IsTUFBTSxDQUFDLGlCQUFQLENBQXlCLENBQUMsR0FBRCxFQUFNLE1BQU4sQ0FBekIsRUFBd0MsT0FBeEM7V0FDQSxNQUFNLENBQUMsVUFBUCxHQUFvQjtFQUhQOztFQUtmLGVBQUEsR0FBa0IsU0FBQyxNQUFELEVBQVMsTUFBVDtXQUNoQixNQUFNLENBQUMsaUJBQVAsQ0FBeUIsQ0FBQyxNQUFNLENBQUMsWUFBUCxDQUFBLENBQUQsRUFBd0IsTUFBeEIsQ0FBekI7RUFEZ0I7O0VBR2xCLFVBQUEsR0FBYSxTQUFDLE1BQUQsRUFBUyxHQUFULEVBQStCLEVBQS9CO0FBQ1gsUUFBQTtJQURxQixxQkFBRDtJQUNuQixhQUFjO0lBQ2YsRUFBQSxDQUFHLE1BQUg7SUFDQSxJQUFHLGtCQUFBLElBQXVCLG9CQUExQjthQUNFLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLFdBRHRCOztFQUhXOztFQVViLHFCQUFBLEdBQXdCLFNBQUMsTUFBRDtBQUN0QixRQUFBO0lBQUEsT0FBZ0IsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBaEIsRUFBQyxjQUFELEVBQU07SUFDTixJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQkFBaEIsQ0FBSDtNQUNFLFNBQUEsR0FBWSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0JBQWhCO01BQ1osSUFBRyxDQUFBLENBQUEsR0FBSSxNQUFKLElBQUksTUFBSixHQUFhLFNBQWIsQ0FBSDtRQUNFLElBQUEsR0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLG9CQUFkLENBQW1DLENBQUMsQ0FBQyxHQUFELEVBQU0sQ0FBTixDQUFELEVBQVcsQ0FBQyxHQUFELEVBQU0sU0FBTixDQUFYLENBQW5DO2VBQ1AsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFiLEVBRkY7T0FBQSxNQUFBO2VBSUUsTUFKRjtPQUZGOztFQUZzQjs7RUFheEIsY0FBQSxHQUFpQixTQUFDLE1BQUQsRUFBUyxPQUFUO0FBQ2YsUUFBQTs7TUFEd0IsVUFBUTs7SUFDL0IsNkJBQUQsRUFBWTtJQUNaLE9BQU8sT0FBTyxDQUFDO0lBQ2YsSUFBRyxnQ0FBSDtNQUNFLElBQVUscUJBQUEsQ0FBc0IsTUFBdEIsQ0FBVjtBQUFBLGVBQUE7T0FERjs7SUFHQSxJQUFHLENBQUksTUFBTSxDQUFDLG1CQUFQLENBQUEsQ0FBSixJQUFvQyxTQUF2QztNQUNFLE1BQUEsR0FBUyxTQUFDLE1BQUQ7ZUFBWSxNQUFNLENBQUMsUUFBUCxDQUFBO01BQVo7YUFDVCxVQUFBLENBQVcsTUFBWCxFQUFtQixPQUFuQixFQUE0QixNQUE1QixFQUZGOztFQU5lOztFQVVqQixlQUFBLEdBQWtCLFNBQUMsTUFBRCxFQUFTLE9BQVQ7QUFDaEIsUUFBQTs7TUFEeUIsVUFBUTs7SUFDaEMsWUFBYTtJQUNkLE9BQU8sT0FBTyxDQUFDO0lBQ2YsSUFBRyxDQUFJLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBSixJQUE4QixTQUFqQztNQUNFLE1BQUEsR0FBUyxTQUFDLE1BQUQ7ZUFBWSxNQUFNLENBQUMsU0FBUCxDQUFBO01BQVo7YUFDVCxVQUFBLENBQVcsTUFBWCxFQUFtQixPQUFuQixFQUE0QixNQUE1QixFQUZGOztFQUhnQjs7RUFPbEIsa0JBQUEsR0FBcUIsU0FBQyxNQUFELEVBQVMsT0FBVDtBQUNuQixRQUFBOztNQUQ0QixVQUFROztJQUNwQyxJQUFPLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBQSxLQUF5QixDQUFoQztNQUNFLE1BQUEsR0FBUyxTQUFDLE1BQUQ7ZUFBWSxNQUFNLENBQUMsTUFBUCxDQUFBO01BQVo7YUFDVCxVQUFBLENBQVcsTUFBWCxFQUFtQixPQUFuQixFQUE0QixNQUE1QixFQUZGOztFQURtQjs7RUFLckIsb0JBQUEsR0FBdUIsU0FBQyxNQUFELEVBQVMsT0FBVDtBQUNyQixRQUFBOztNQUQ4QixVQUFROztJQUN0QyxJQUFPLG1CQUFBLENBQW9CLE1BQU0sQ0FBQyxNQUEzQixDQUFBLEtBQXNDLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBN0M7TUFDRSxNQUFBLEdBQVMsU0FBQyxNQUFEO2VBQVksTUFBTSxDQUFDLFFBQVAsQ0FBQTtNQUFaO2FBQ1QsVUFBQSxDQUFXLE1BQVgsRUFBbUIsT0FBbkIsRUFBNEIsTUFBNUIsRUFGRjs7RUFEcUI7O0VBS3ZCLCtCQUFBLEdBQWtDLFNBQUMsTUFBRCxFQUFTLEdBQVQ7SUFDaEMsTUFBTSxDQUFDLGlCQUFQLENBQXlCLENBQUMsR0FBRCxFQUFNLENBQU4sQ0FBekI7V0FDQSxNQUFNLENBQUMsMEJBQVAsQ0FBQTtFQUZnQzs7RUFJbEMsb0JBQUEsR0FBdUIsU0FBQyxNQUFELEVBQVMsR0FBVDtXQUFpQixXQUFBLENBQVksR0FBWixFQUFpQjtNQUFBLEdBQUEsRUFBSyxDQUFMO01BQVEsR0FBQSxFQUFLLG1CQUFBLENBQW9CLE1BQXBCLENBQWI7S0FBakI7RUFBakI7O0VBRXZCLG9CQUFBLEdBQXVCLFNBQUMsTUFBRCxFQUFTLEdBQVQ7V0FBaUIsV0FBQSxDQUFZLEdBQVosRUFBaUI7TUFBQSxHQUFBLEVBQUssQ0FBTDtNQUFRLEdBQUEsRUFBSyxtQkFBQSxDQUFvQixNQUFwQixDQUFiO0tBQWpCO0VBQWpCOztFQUd2QiwyQkFBQSxHQUE4QixTQUFDLE1BQUQsRUFBUyxHQUFULEVBQXdCLElBQXhCO0FBQzVCLFFBQUE7SUFEc0MsZUFBSztJQUFVLDRCQUFELE9BQVk7SUFDaEUsd0JBQUcsWUFBWSxJQUFmO2FBQ0UsTUFBTSxDQUFDLG9CQUFQLENBQTRCLEdBQTVCLENBQWlDLGtCQURuQztLQUFBLE1BQUE7YUFHRSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsR0FBNUIsQ0FBaUMsOEJBSG5DOztFQUQ0Qjs7RUFNOUIsMEJBQUEsR0FBNkIsU0FBQyxNQUFELEVBQVMsR0FBVDtXQUMzQixNQUFNLENBQUMsa0JBQVAsQ0FBMEIsTUFBTSxDQUFDLG9CQUFQLENBQTRCLEdBQTVCLENBQTFCO0VBRDJCOztFQUc3QixvQkFBQSxHQUF1QixTQUFDLE1BQUQ7QUFDckIsUUFBQTtXQUFBOzs7O2tCQUNFLENBQUMsR0FESCxDQUNPLFNBQUMsR0FBRDthQUNILE1BQU0sQ0FBQyxZQUFZLENBQUMsOEJBQXBCLENBQW1ELEdBQW5EO0lBREcsQ0FEUCxDQUdFLENBQUMsTUFISCxDQUdVLFNBQUMsUUFBRDthQUNOLGtCQUFBLElBQWMscUJBQWQsSUFBK0I7SUFEekIsQ0FIVjtFQURxQjs7RUFRdkIsbUNBQUEsR0FBc0MsU0FBQyxNQUFELEVBQVMsU0FBVCxFQUFvQixHQUFwQjtBQUNwQyxRQUFBO0lBRHlELGlDQUFELE1BQWtCOztNQUMxRSxrQkFBbUI7O1dBQ25CLG9CQUFBLENBQXFCLE1BQXJCLENBQTRCLENBQUMsTUFBN0IsQ0FBb0MsU0FBQyxJQUFEO0FBQ2xDLFVBQUE7TUFEb0Msb0JBQVU7TUFDOUMsSUFBRyxlQUFIO2VBQ0UsQ0FBQSxRQUFBLElBQVksU0FBWixJQUFZLFNBQVosSUFBeUIsTUFBekIsRUFERjtPQUFBLE1BQUE7ZUFHRSxDQUFBLFFBQUEsR0FBVyxTQUFYLElBQVcsU0FBWCxJQUF3QixNQUF4QixFQUhGOztJQURrQyxDQUFwQztFQUZvQzs7RUFRdEMseUJBQUEsR0FBNEIsU0FBQyxNQUFELEVBQVMsUUFBVDtBQUMxQixRQUFBO0lBQUEsT0FBeUIsUUFBUSxDQUFDLEdBQVQsQ0FBYSxTQUFDLEdBQUQ7YUFDcEMsTUFBTSxDQUFDLHVCQUFQLENBQStCLEdBQS9CLEVBQW9DO1FBQUEsY0FBQSxFQUFnQixJQUFoQjtPQUFwQztJQURvQyxDQUFiLENBQXpCLEVBQUMsb0JBQUQsRUFBYTtXQUViLFVBQVUsQ0FBQyxLQUFYLENBQWlCLFFBQWpCO0VBSDBCOztFQUs1QixzQkFBQSxHQUF5QixTQUFDLE1BQUQsRUFBUyxHQUFUO1dBQ3ZCLE1BQU0sQ0FBQyxlQUFlLENBQUMsbUJBQXZCLENBQTJDLEdBQTNDO0VBRHVCOztFQUd6Qix5QkFBQSxHQUE0QixTQUFDLElBQUQ7QUFDMUIsUUFBQTtBQUFBO0FBQUE7U0FBQSxzQ0FBQTs7VUFBMEIsR0FBQSxHQUFNLENBQU4sSUFBWSxDQUFDLEdBQUEsR0FBTSxDQUFOLEtBQVcsQ0FBQyxDQUFiO3NCQUNwQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQWQsQ0FBeUIsR0FBekI7O0FBREY7O0VBRDBCOztFQUk1QixpQkFBQSxHQUFvQixTQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLFNBQXBCLEVBQStCLEVBQS9CO0FBQ2xCLFFBQUE7SUFBQSxTQUFBLEdBQVksS0FBSyxDQUFDLFVBQU4sQ0FBaUIsU0FBakI7SUFDWixRQUFBOztBQUFXLGNBQU8sU0FBUDtBQUFBLGFBQ0osU0FESTtpQkFDVzs7Ozs7QUFEWCxhQUVKLFVBRkk7aUJBRVk7Ozs7O0FBRlo7O0lBSVgsWUFBQSxHQUFlO0lBQ2YsSUFBQSxHQUFPLFNBQUE7YUFDTCxZQUFBLEdBQWU7SUFEVjtJQUdQLFlBQUE7QUFBZSxjQUFPLFNBQVA7QUFBQSxhQUNSLFNBRFE7aUJBQ08sU0FBQyxHQUFEO0FBQWdCLGdCQUFBO1lBQWQsV0FBRDttQkFBZSxRQUFRLENBQUMsYUFBVCxDQUF1QixTQUF2QjtVQUFoQjtBQURQLGFBRVIsVUFGUTtpQkFFUSxTQUFDLEdBQUQ7QUFBZ0IsZ0JBQUE7WUFBZCxXQUFEO21CQUFlLFFBQVEsQ0FBQyxVQUFULENBQW9CLFNBQXBCO1VBQWhCO0FBRlI7O0FBSWYsU0FBQSwwQ0FBQTs7WUFBeUIsYUFBQSxHQUFnQixzQkFBQSxDQUF1QixNQUF2QixFQUErQixHQUEvQjs7O01BQ3ZDLE1BQUEsR0FBUztNQUNULE9BQUEsR0FBVTtNQUVWLGFBQUEsR0FBZ0IsYUFBYSxDQUFDLGdCQUFkLENBQUE7QUFDaEI7QUFBQSxXQUFBLHdDQUFBOztRQUNFLGFBQWEsQ0FBQyxJQUFkLENBQUE7UUFDQSxJQUFHLEdBQUEsR0FBTSxDQUFUO1VBQ0UsS0FBQSxHQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBZCxDQUF5QixHQUF6QjtVQUNSLElBQUcsQ0FBQyxHQUFBLEdBQU0sQ0FBUCxDQUFBLEtBQWEsQ0FBaEI7WUFDRSxLQURGO1dBQUEsTUFBQTtZQUdFLFFBQUEsR0FBZSxJQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsTUFBWDtZQUNmLE9BQU8sQ0FBQyxJQUFSLENBQWE7Y0FBQyxPQUFBLEtBQUQ7Y0FBUSxVQUFBLFFBQVI7Y0FBa0IsTUFBQSxJQUFsQjthQUFiLEVBSkY7V0FGRjtTQUFBLE1BQUE7VUFRRSxNQUFBLElBQVUsSUFSWjs7QUFGRjtNQVlBLE9BQUEsR0FBVSxPQUFPLENBQUMsTUFBUixDQUFlLFlBQWY7TUFDVixJQUFxQixTQUFBLEtBQWEsVUFBbEM7UUFBQSxPQUFPLENBQUMsT0FBUixDQUFBLEVBQUE7O0FBQ0EsV0FBQSwyQ0FBQTs7UUFDRSxFQUFBLENBQUcsTUFBSDtRQUNBLElBQUEsQ0FBYyxZQUFkO0FBQUEsaUJBQUE7O0FBRkY7TUFHQSxJQUFBLENBQWMsWUFBZDtBQUFBLGVBQUE7O0FBdEJGO0VBZGtCOztFQXNDcEIsZ0NBQUEsR0FBbUMsU0FBQyxNQUFELEVBQVMsU0FBVCxFQUFvQixTQUFwQixFQUErQixLQUEvQjtBQUNqQyxRQUFBO0lBQUEsS0FBQSxHQUFRO0lBQ1IsaUJBQUEsQ0FBa0IsTUFBbEIsRUFBMEIsU0FBMUIsRUFBcUMsU0FBckMsRUFBZ0QsU0FBQyxJQUFEO01BQzlDLElBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFYLENBQWtCLEtBQWxCLENBQUEsSUFBNEIsQ0FBL0I7UUFDRSxJQUFJLENBQUMsSUFBTCxDQUFBO2VBQ0EsS0FBQSxHQUFRLElBQUksQ0FBQyxTQUZmOztJQUQ4QyxDQUFoRDtXQUlBO0VBTmlDOztFQVFuQyw0QkFBQSxHQUErQixTQUFDLE1BQUQsRUFBUyxHQUFUO0FBSzdCLFFBQUE7SUFBQSxJQUFHLGFBQUEsR0FBZ0Isc0JBQUEsQ0FBdUIsTUFBdkIsRUFBK0IsR0FBL0IsQ0FBbkI7YUFDRSx5QkFBQSxDQUEwQixhQUExQixDQUF3QyxDQUFDLElBQXpDLENBQThDLFNBQUMsS0FBRDtlQUM1QyxlQUFBLENBQWdCLE1BQWhCLEVBQXdCLEtBQXhCO01BRDRDLENBQTlDLEVBREY7S0FBQSxNQUFBO2FBSUUsTUFKRjs7RUFMNkI7O0VBWS9CLGVBQUEsR0FBa0IsU0FBQyxNQUFELEVBQVMsS0FBVDtBQUNoQixRQUFBO0FBQUEsWUFBTyxNQUFNLENBQUMsVUFBUCxDQUFBLENBQW1CLENBQUMsU0FBM0I7QUFBQSxXQUNPLFdBRFA7QUFBQSxXQUNvQixlQURwQjtRQUVJLE1BQUEsR0FBUyxDQUFDLHNCQUFEO0FBRE87QUFEcEIsV0FHTyxhQUhQO1FBSUksTUFBQSxHQUFTLENBQUMsZ0JBQUQsRUFBbUIsYUFBbkIsRUFBa0MsY0FBbEM7QUFETjtBQUhQO1FBTUksTUFBQSxHQUFTLENBQUMsZ0JBQUQsRUFBbUIsYUFBbkI7QUFOYjtJQU9BLE9BQUEsR0FBYyxJQUFBLE1BQUEsQ0FBTyxHQUFBLEdBQU0sTUFBTSxDQUFDLEdBQVAsQ0FBVyxDQUFDLENBQUMsWUFBYixDQUEwQixDQUFDLElBQTNCLENBQWdDLEdBQWhDLENBQWI7V0FDZCxPQUFPLENBQUMsSUFBUixDQUFhLEtBQWI7RUFUZ0I7O0VBYWxCLDJCQUFBLEdBQThCLFNBQUMsTUFBRCxFQUFTLEtBQVQ7QUFDNUIsUUFBQTtJQUFBLGFBQUEsR0FBZ0IsTUFBTSxDQUFDO0lBQ3ZCLGdCQUFBLEdBQW1CLE1BQU0sQ0FBQyxxQkFBUCxDQUFBLENBQUEsR0FBaUMsQ0FBQyxNQUFNLENBQUMsY0FBUCxDQUFBLENBQUEsR0FBMEIsQ0FBM0I7SUFDcEQsU0FBQSxHQUFZLGFBQWEsQ0FBQyxZQUFkLENBQUEsQ0FBQSxHQUErQjtJQUMzQyxXQUFBLEdBQWMsYUFBYSxDQUFDLGVBQWQsQ0FBQSxDQUFBLEdBQWtDO0lBQ2hELE1BQUEsR0FBUyxhQUFhLENBQUMsOEJBQWQsQ0FBNkMsS0FBN0MsQ0FBbUQsQ0FBQztJQUU3RCxNQUFBLEdBQVMsQ0FBQyxXQUFBLEdBQWMsTUFBZixDQUFBLElBQTBCLENBQUMsTUFBQSxHQUFTLFNBQVY7V0FDbkMsTUFBTSxDQUFDLHNCQUFQLENBQThCLEtBQTlCLEVBQXFDO01BQUMsUUFBQSxNQUFEO0tBQXJDO0VBUjRCOztFQVU5QixXQUFBLEdBQWMsU0FBQyxhQUFELEVBQWdCLE1BQWhCO0FBQ1osUUFBQTtJQUFBLE9BQUEsR0FBVSxNQUFNLENBQUMsR0FBUCxDQUFXLFNBQUMsS0FBRDthQUFXLEtBQUssQ0FBQyxLQUFOLENBQVksR0FBWjtJQUFYLENBQVg7QUFFVixTQUFBLHlDQUFBOztNQUNFLGFBQUEsR0FBZ0I7QUFDaEIsV0FBQSw4Q0FBQTs7UUFDRSxJQUFzQixhQUFhLENBQUMsU0FBUyxDQUFDLFFBQXhCLENBQWlDLFNBQWpDLENBQXRCO1VBQUEsYUFBQSxJQUFpQixFQUFqQjs7QUFERjtNQUVBLElBQWUsYUFBQSxLQUFpQixVQUFVLENBQUMsTUFBM0M7QUFBQSxlQUFPLEtBQVA7O0FBSkY7V0FLQTtFQVJZOztFQVVkLGdCQUFBLEdBQW1CLFNBQUMsSUFBRDtXQUNqQixJQUFJLENBQUMsS0FBTCxDQUFXLFNBQVgsQ0FBcUIsQ0FBQyxNQUF0QixLQUFnQztFQURmOztFQWVuQix5Q0FBQSxHQUE0QyxTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLE9BQWhCO0FBQzFDLFFBQUE7O01BRDBELFVBQVE7O0lBQ2pFLDZDQUFELEVBQW9CLDZCQUFwQixFQUErQiw2Q0FBL0IsRUFBa0Q7SUFDbEQsSUFBTyxtQkFBSixJQUFzQiwyQkFBekI7O1FBQ0UsU0FBVSxNQUFNLENBQUMsYUFBUCxDQUFBOztNQUNWLE9BQWlDLENBQUMsQ0FBQyxNQUFGLENBQVMsT0FBVCxFQUFrQix3QkFBQSxDQUF5QixNQUF6QixFQUFpQyxPQUFqQyxDQUFsQixDQUFqQyxFQUFDLDBCQUFELEVBQVksMkNBRmQ7OztNQUdBLG9CQUFxQjs7SUFFckIsZ0JBQUEsR0FBbUIsa0NBQUEsQ0FBbUMsTUFBbkMsRUFBMkMsS0FBM0M7SUFDbkIsWUFBQSxHQUFtQixJQUFBLE1BQUEsQ0FBTyxHQUFBLEdBQUcsQ0FBQyxDQUFDLENBQUMsWUFBRixDQUFlLGlCQUFmLENBQUQsQ0FBSCxHQUFzQyxJQUE3QztJQUVuQixJQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsZ0JBQVYsQ0FBSDtNQUNFLE1BQUEsR0FBUztNQUNULElBQUEsR0FBTztNQUNQLFNBQUEsR0FBZ0IsSUFBQSxNQUFBLENBQU8sTUFBUCxFQUhsQjtLQUFBLE1BSUssSUFBRyxZQUFZLENBQUMsSUFBYixDQUFrQixnQkFBbEIsQ0FBQSxJQUF3QyxDQUFJLFNBQVMsQ0FBQyxJQUFWLENBQWUsZ0JBQWYsQ0FBL0M7TUFDSCxJQUFBLEdBQU87TUFDUCxJQUFHLGlCQUFIO1FBQ0UsTUFBQSxHQUFTLENBQUMsQ0FBQyxZQUFGLENBQWUsZ0JBQWY7UUFDVCxTQUFBLEdBQWdCLElBQUEsTUFBQSxDQUFPLE1BQVAsRUFGbEI7T0FBQSxNQUFBO1FBSUUsU0FBQSxHQUFZLGFBSmQ7T0FGRztLQUFBLE1BQUE7TUFRSCxJQUFBLEdBQU8sT0FSSjs7SUFVTCxLQUFBLEdBQVEsa0NBQUEsQ0FBbUMsTUFBbkMsRUFBMkMsS0FBM0MsRUFBa0Q7TUFBQyxXQUFBLFNBQUQ7S0FBbEQ7V0FDUjtNQUFDLE1BQUEsSUFBRDtNQUFPLE9BQUEsS0FBUDs7RUF6QjBDOztFQTJCNUMsOEJBQUEsR0FBaUMsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixPQUFoQjtBQUMvQixRQUFBOztNQUQrQyxVQUFROztJQUN2RCxpQkFBQSx1REFBZ0Q7SUFDaEQsT0FBTyxPQUFPLENBQUM7SUFDZixPQUFnQix5Q0FBQSxDQUEwQyxNQUExQyxFQUFrRCxLQUFsRCxFQUF5RCxPQUF6RCxDQUFoQixFQUFDLGtCQUFELEVBQVE7SUFDUixJQUFBLEdBQU8sTUFBTSxDQUFDLG9CQUFQLENBQTRCLEtBQTVCO0lBQ1AsT0FBQSxHQUFVLENBQUMsQ0FBQyxZQUFGLENBQWUsSUFBZjtJQUVWLElBQUcsSUFBQSxLQUFRLE1BQVIsSUFBbUIsaUJBQXRCO01BRUUsYUFBQSxHQUFtQixLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FBSCxHQUF5QixLQUF6QixHQUFvQztNQUNwRCxXQUFBLEdBQWlCLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxDQUFILEdBQXlCLEtBQXpCLEdBQW9DO01BQ2xELE9BQUEsR0FBVSxhQUFBLEdBQWdCLE9BQWhCLEdBQTBCLFlBSnRDOztXQUtJLElBQUEsTUFBQSxDQUFPLE9BQVAsRUFBZ0IsR0FBaEI7RUFaMkI7O0VBY2pDLGlDQUFBLEdBQW9DLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsT0FBaEI7O01BQWdCLFVBQVE7O0lBQzFELE9BQUEsR0FBVTtNQUFDLFNBQUEsRUFBVyxNQUFNLENBQUMsYUFBUCxDQUFBLENBQXNCLENBQUMsYUFBdkIsQ0FBQSxDQUFaO01BQW9ELGlCQUFBLEVBQW1CLEtBQXZFOztXQUNWLDhCQUFBLENBQStCLE1BQS9CLEVBQXVDLEtBQXZDLEVBQThDLE9BQTlDO0VBRmtDOztFQUtwQyx3QkFBQSxHQUEyQixTQUFDLE1BQUQsRUFBUyxHQUFUO0FBQ3pCLFFBQUE7SUFEbUMsWUFBRDtJQUNsQyxpQkFBQSxHQUFvQiw2QkFBQSxDQUE4QixNQUE5Qjs7TUFDcEIsWUFBaUIsSUFBQSxNQUFBLENBQU8sZ0JBQUEsR0FBZ0IsQ0FBQyxDQUFDLENBQUMsWUFBRixDQUFlLGlCQUFmLENBQUQsQ0FBaEIsR0FBbUQsSUFBMUQ7O1dBQ2pCO01BQUMsV0FBQSxTQUFEO01BQVksbUJBQUEsaUJBQVo7O0VBSHlCOztFQUszQixnQ0FBQSxHQUFtQyxTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLEdBQWhCO0FBQ2pDLFFBQUE7SUFEa0QsMkJBQUQsTUFBWTtJQUM3RCxTQUFBLEdBQVksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFQLEVBQVksQ0FBWixDQUFELEVBQWlCLEtBQWpCO0lBRVosS0FBQSxHQUFRO0lBQ1IsTUFBTSxDQUFDLDBCQUFQLENBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELFNBQUMsSUFBRDtBQUN0RCxVQUFBO01BRHdELG9CQUFPLDRCQUFXO01BQzFFLElBQVUsU0FBQSxLQUFhLEVBQWIsSUFBb0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFaLEtBQXdCLENBQXREO0FBQUEsZUFBQTs7TUFFQSxJQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBWixDQUF1QixLQUF2QixDQUFIO1FBQ0UsSUFBRyxLQUFLLENBQUMsR0FBRyxDQUFDLG9CQUFWLENBQStCLEtBQS9CLENBQUg7VUFDRSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BRGhCOztlQUVBLElBQUEsQ0FBQSxFQUhGOztJQUhzRCxDQUF4RDsyQkFRQSxRQUFRO0VBWnlCOztFQWNuQywwQkFBQSxHQUE2QixTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLEdBQWhCO0FBQzNCLFFBQUE7SUFENEMsMkJBQUQsTUFBWTtJQUN2RCxTQUFBLEdBQVksQ0FBQyxLQUFELEVBQVEsQ0FBQyxLQUFLLENBQUMsR0FBUCxFQUFZLEtBQVosQ0FBUjtJQUVaLEtBQUEsR0FBUTtJQUNSLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixTQUF6QixFQUFvQyxTQUFwQyxFQUErQyxTQUFDLElBQUQ7QUFDN0MsVUFBQTtNQUQrQyxvQkFBTyw0QkFBVztNQUNqRSxJQUFVLFNBQUEsS0FBYSxFQUFiLElBQW9CLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBWixLQUF3QixDQUF0RDtBQUFBLGVBQUE7O01BRUEsSUFBRyxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQVYsQ0FBd0IsS0FBeEIsQ0FBSDtRQUNFLElBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxpQkFBWixDQUE4QixLQUE5QixDQUFIO1VBQ0UsS0FBQSxHQUFRLEtBQUssQ0FBQyxJQURoQjs7ZUFFQSxJQUFBLENBQUEsRUFIRjs7SUFINkMsQ0FBL0M7MkJBUUEsUUFBUTtFQVptQjs7RUFjN0Isa0NBQUEsR0FBcUMsU0FBQyxNQUFELEVBQVMsUUFBVCxFQUFtQixPQUFuQjtBQUNuQyxRQUFBOztNQURzRCxVQUFROztJQUM5RCxXQUFBLEdBQWMsMEJBQUEsQ0FBMkIsTUFBM0IsRUFBbUMsUUFBbkMsRUFBNkMsT0FBN0M7SUFDZCxhQUFBLEdBQWdCLGdDQUFBLENBQWlDLE1BQWpDLEVBQXlDLFdBQXpDLEVBQXNELE9BQXREO1dBQ1osSUFBQSxLQUFBLENBQU0sYUFBTixFQUFxQixXQUFyQjtFQUgrQjs7RUFPckMsNkJBQUEsR0FBZ0MsU0FBQyxLQUFEO0FBQzlCLFFBQUE7SUFBQyxtQkFBRCxFQUFRO0lBQ1IsSUFBRyxHQUFHLENBQUMsTUFBSixLQUFjLENBQWpCO01BQ0UsTUFBQSxHQUFTLFdBQUEsQ0FBWSxHQUFHLENBQUMsR0FBSixHQUFVLENBQXRCLEVBQXlCO1FBQUEsR0FBQSxFQUFLLEtBQUssQ0FBQyxHQUFYO09BQXpCO2FBQ0wsSUFBQSxLQUFBLENBQU0sS0FBTixFQUFhLENBQUMsTUFBRCxFQUFTLEtBQVQsQ0FBYixFQUZOO0tBQUEsTUFBQTthQUlFLE1BSkY7O0VBRjhCOztFQVFoQyxVQUFBLEdBQWEsU0FBQyxNQUFELEVBQVMsT0FBVDtBQUNYLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFDVCxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQVosRUFBcUIsU0FBQyxHQUFEO0FBQ25CLFVBQUE7TUFEcUIsUUFBRDthQUNwQixNQUFNLENBQUMsSUFBUCxDQUFZLEtBQVo7SUFEbUIsQ0FBckI7V0FFQTtFQUpXOztFQU1iLHVCQUFBLEdBQTBCLFNBQUMsTUFBRCxFQUFTLEdBQVQsRUFBYyxPQUFkO0FBQ3hCLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFDVCxTQUFBLEdBQVksTUFBTSxDQUFDLHVCQUFQLENBQStCLEdBQS9CO0lBQ1osTUFBTSxDQUFDLGlCQUFQLENBQXlCLE9BQXpCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQUMsR0FBRDtBQUMzQyxVQUFBO01BRDZDLFFBQUQ7YUFDNUMsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaO0lBRDJDLENBQTdDO1dBRUE7RUFMd0I7O0VBTzFCLG9CQUFBLEdBQXVCLFNBQUMsTUFBRCxFQUFTLE9BQVQsRUFBa0IsR0FBbEIsRUFBdUIsR0FBdkI7QUFDckIsUUFBQTtJQUQ2QywyQkFBRCxNQUFZO0lBQ3hELElBQUcsU0FBQSxLQUFhLFVBQWhCO01BQ0UsZ0JBQUEsR0FBbUIsNkJBRHJCO0tBQUEsTUFBQTtNQUdFLGdCQUFBLEdBQW1CLG9CQUhyQjs7SUFLQSxLQUFBLEdBQVE7SUFDUixTQUFBLEdBQVksTUFBTSxDQUFDLHVCQUFQLENBQStCLEdBQS9CO0lBQ1osTUFBTyxDQUFBLGdCQUFBLENBQVAsQ0FBeUIsT0FBekIsRUFBa0MsU0FBbEMsRUFBNkMsU0FBQyxLQUFEO2FBQVcsS0FBQSxHQUFRLEtBQUssQ0FBQztJQUF6QixDQUE3QztXQUNBO0VBVHFCOztFQVd2QixvQ0FBQSxHQUF1QyxTQUFDLE1BQUQsRUFBUyxHQUFUO0FBQ3JDLFFBQUE7SUFBQSxPQUFBLEdBQVUsTUFBTSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFyQyxDQUFpRDtNQUFBLGFBQUEsRUFBZSxHQUFmO0tBQWpEO0lBRVYsVUFBQSxHQUFhO0lBQ2IsUUFBQSxHQUFXO0FBRVg7QUFBQSxTQUFBLHNDQUFBOztNQUNFLE9BQWUsTUFBTSxDQUFDLFFBQVAsQ0FBQSxDQUFmLEVBQUMsa0JBQUQsRUFBUTtNQUNSLElBQUEsQ0FBTyxVQUFQO1FBQ0UsVUFBQSxHQUFhO1FBQ2IsUUFBQSxHQUFXO0FBQ1gsaUJBSEY7O01BS0EsSUFBRyxLQUFLLENBQUMsVUFBTixDQUFpQixVQUFqQixDQUFIO1FBQ0UsVUFBQSxHQUFhO1FBQ2IsUUFBQSxHQUFXLElBRmI7O0FBUEY7SUFXQSxJQUFHLG9CQUFBLElBQWdCLGtCQUFuQjthQUNNLElBQUEsS0FBQSxDQUFNLFVBQU4sRUFBa0IsUUFBbEIsRUFETjs7RUFqQnFDOztFQXFCdkMscUJBQUEsR0FBd0IsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixTQUFoQjtBQUN0QixRQUFBO0lBQUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxVQUFOLENBQWlCLEtBQWpCO0lBRVIsUUFBQSxHQUFXO0FBQ1gsWUFBTyxTQUFQO0FBQUEsV0FDTyxTQURQO1FBRUksS0FBQSxHQUFRLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxDQUFoQjtRQUNSLEdBQUEsR0FBTSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsS0FBSyxDQUFDLEdBQXJDLENBQXlDLENBQUM7UUFFaEQsSUFBRyxLQUFLLENBQUMsT0FBTixDQUFjLEdBQWQsQ0FBSDtVQUNFLFFBQUEsR0FBVyxLQURiO1NBQUEsTUFFSyxJQUFHLEtBQUssQ0FBQyxhQUFOLENBQW9CLEdBQXBCLENBQUg7VUFDSCxRQUFBLEdBQVc7VUFDWCxLQUFBLEdBQVksSUFBQSxLQUFBLENBQU0sS0FBSyxDQUFDLEdBQU4sR0FBWSxDQUFsQixFQUFxQixDQUFyQixFQUZUOztRQUlMLEtBQUEsR0FBUSxLQUFLLENBQUMsR0FBTixDQUFVLEtBQVYsRUFBaUIsTUFBTSxDQUFDLG9CQUFQLENBQUEsQ0FBakI7QUFWTDtBQURQLFdBYU8sVUFiUDtRQWNJLEtBQUEsR0FBUSxLQUFLLENBQUMsU0FBTixDQUFnQixDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsQ0FBaEI7UUFFUixJQUFHLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBbEI7VUFDRSxRQUFBLEdBQVc7VUFDWCxNQUFBLEdBQVMsS0FBSyxDQUFDLEdBQU4sR0FBWTtVQUNyQixHQUFBLEdBQU0sTUFBTSxDQUFDLHVCQUFQLENBQStCLE1BQS9CLENBQXNDLENBQUM7VUFDN0MsS0FBQSxHQUFZLElBQUEsS0FBQSxDQUFNLE1BQU4sRUFBYyxHQUFHLENBQUMsTUFBbEIsRUFKZDs7UUFNQSxLQUFBLEdBQVEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxLQUFWLEVBQWlCLEtBQUssQ0FBQyxJQUF2QjtBQXRCWjtJQXdCQSxJQUFHLFFBQUg7YUFDRSxNQURGO0tBQUEsTUFBQTtNQUdFLFdBQUEsR0FBYyxNQUFNLENBQUMsK0JBQVAsQ0FBdUMsS0FBdkMsRUFBOEM7UUFBQSxhQUFBLEVBQWUsU0FBZjtPQUE5QzthQUNkLE1BQU0sQ0FBQywrQkFBUCxDQUF1QyxXQUF2QyxFQUpGOztFQTVCc0I7O0VBa0N4QiwrQkFBQSxHQUFrQyxTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLEtBQWhCLEVBQXVCLFNBQXZCO0FBQ2hDLFFBQUE7SUFBQSxRQUFBLEdBQVcscUJBQUEsQ0FBc0IsTUFBdEIsRUFBOEIsS0FBTSxDQUFBLEtBQUEsQ0FBcEMsRUFBNEMsU0FBNUM7QUFDWCxZQUFPLEtBQVA7QUFBQSxXQUNPLE9BRFA7ZUFFUSxJQUFBLEtBQUEsQ0FBTSxRQUFOLEVBQWdCLEtBQUssQ0FBQyxHQUF0QjtBQUZSLFdBR08sS0FIUDtlQUlRLElBQUEsS0FBQSxDQUFNLEtBQUssQ0FBQyxLQUFaLEVBQW1CLFFBQW5CO0FBSlI7RUFGZ0M7O0VBUWxDLFVBQUEsR0FBYSxTQUFDLElBQUQsRUFBTyxFQUFQO1dBQ1AsSUFBQSxPQUFBLENBQVEsU0FBQyxPQUFEO0FBQ1YsVUFBQTtNQUFBLElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLElBQTlCLENBQUg7UUFDRSxHQUFBLEdBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixJQUEvQjtlQUNOLE9BQUEsQ0FBUSxHQUFSLEVBRkY7T0FBQSxNQUFBO2VBSUUsVUFBQSxHQUFhLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQWQsQ0FBbUMsU0FBQyxHQUFEO1VBQzlDLElBQUcsR0FBRyxDQUFDLElBQUosS0FBWSxJQUFmO1lBQ0UsVUFBVSxDQUFDLE9BQVgsQ0FBQTttQkFDQSxPQUFBLENBQVEsR0FBUixFQUZGOztRQUQ4QyxDQUFuQyxFQUpmOztJQURVLENBQVI7RUFETzs7RUFXYixtQkFBQSxHQUFzQixTQUFDLE1BQUQsRUFBUyxJQUFUO0lBQ3BCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixNQUFNLENBQUMsT0FBOUIsRUFBdUMsbUJBQXZDO1dBQ0EsVUFBQSxDQUFXLGtCQUFYLENBQThCLENBQUMsSUFBL0IsQ0FBb0MsU0FBQyxHQUFEO0FBQ2xDLFVBQUE7TUFBQyxrQkFBbUIsR0FBRyxDQUFDO01BQ3hCLElBQUcsdUJBQUg7UUFDRSxlQUFlLENBQUMsVUFBVSxDQUFDLE9BQTNCLENBQW1DLElBQW5DO2VBQ0EsZUFBZSxDQUFDLE9BQWhCLENBQUEsRUFGRjs7SUFGa0MsQ0FBcEM7RUFGb0I7O0VBUXRCLFdBQUEsR0FBYyxTQUFDLE1BQUQsRUFBUyxHQUFUO0FBQ1osUUFBQTt5QkFEcUIsTUFBVyxJQUFWLGdCQUFLO0lBQzNCLElBQWtDLFdBQWxDO01BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsTUFBVCxFQUFpQixHQUFqQixFQUFUOztJQUNBLElBQWtDLFdBQWxDO01BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsTUFBVCxFQUFpQixHQUFqQixFQUFUOztXQUNBO0VBSFk7O0VBS2Qsc0JBQUEsR0FBeUIsU0FBQyxNQUFELEVBQVMsS0FBVDtBQUN2QixRQUFBO0FBQUEsU0FBQSx3Q0FBQTs7VUFBeUIsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsS0FBcEI7QUFDdkIsZUFBTzs7QUFEVDtXQUVBO0VBSHVCOztFQUt6QixjQUFBLEdBQWlCLFNBQUMsRUFBRDtXQUNmLFNBQUE7QUFDRSxVQUFBO01BREQ7YUFDQyxDQUFJLEVBQUEsYUFBRyxJQUFIO0lBRE47RUFEZTs7RUFJakIsT0FBQSxHQUFVLFNBQUMsTUFBRDtXQUFZLE1BQU0sQ0FBQyxPQUFQLENBQUE7RUFBWjs7RUFDVixVQUFBLEdBQWEsY0FBQSxDQUFlLE9BQWY7O0VBRWIsaUJBQUEsR0FBb0IsU0FBQyxLQUFEO1dBQVcsS0FBSyxDQUFDLFlBQU4sQ0FBQTtFQUFYOztFQUNwQixvQkFBQSxHQUF1QixjQUFBLENBQWUsaUJBQWY7O0VBRXZCLHdCQUFBLEdBQTJCLFNBQUMsTUFBRCxFQUFTLEtBQVQ7V0FBbUIsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsTUFBTSxDQUFDLG9CQUFQLENBQTRCLEtBQTVCLENBQWhCO0VBQW5COztFQUMzQiwyQkFBQSxHQUE4QixjQUFBLENBQWUsd0JBQWY7O0VBRTlCLGtCQUFBLEdBQXFCLFNBQUMsTUFBRCxFQUFTLEtBQVQ7QUFDbkIsUUFBQTtJQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQjtJQUNSLEtBQUEsR0FBUSxpQ0FBQSxDQUFrQyxNQUFsQyxFQUEwQyxLQUFLLENBQUMsS0FBaEQsRUFBdUQsQ0FBdkQ7V0FDUixLQUFLLENBQUMsUUFBTixDQUFlLElBQWYsQ0FBQSxJQUF5QixDQUFJLEtBQUssQ0FBQyxRQUFOLENBQWUsTUFBZjtFQUhWOztFQUtyQiwwQkFBQSxHQUE2QixTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLElBQWhCO1dBQzNCLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixDQUFDLEtBQUQsRUFBUSxLQUFSLENBQTVCLEVBQTRDLElBQTVDO0VBRDJCOztFQUc3QixpQ0FBQSxHQUFvQyxTQUFDLE1BQUQsRUFBUyxHQUFUO0FBQ2xDLFFBQUE7SUFBQSxJQUFBLENBQU8sNkJBQUEsQ0FBOEIsTUFBOUIsRUFBc0MsR0FBdEMsQ0FBUDtNQUNFLEdBQUEsR0FBTSx3QkFBQSxDQUF5QixNQUF6QixFQUFpQyxHQUFqQzthQUNOLDBCQUFBLENBQTJCLE1BQTNCLEVBQW1DLEdBQW5DLEVBQXdDLElBQXhDLEVBRkY7O0VBRGtDOztFQUtwQyxlQUFBLEdBQWtCLFNBQUMsRUFBRCxFQUFLLElBQUw7QUFDaEIsUUFBQTs7TUFBQSxPQUFRLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBQThCLENBQUMsWUFBL0IsQ0FBQSxDQUE2QyxDQUFDLE9BQTlDLENBQUE7O0lBQ1IsSUFBRyxxQkFBSDtNQUNFLEVBQUEsQ0FBRyxJQUFIO0FBRUE7QUFBQTtXQUFBLHNDQUFBOztzQkFDRSxlQUFBLENBQWdCLEVBQWhCLEVBQW9CLEtBQXBCO0FBREY7c0JBSEY7O0VBRmdCOztFQVFsQixlQUFBLEdBQWtCLFNBQUE7QUFDaEIsUUFBQTtJQURpQix1QkFBUSx3QkFBUztXQUNsQyxRQUFBLE9BQU8sQ0FBQyxTQUFSLENBQWtCLENBQUEsTUFBQSxDQUFsQixhQUEwQixVQUExQjtFQURnQjs7RUFHbEIsWUFBQSxHQUFlLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixFQUEyQixLQUEzQjs7RUFDZixlQUFBLEdBQWtCLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixFQUEyQixRQUEzQjs7RUFDbEIsZUFBQSxHQUFrQixlQUFlLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsRUFBMkIsUUFBM0I7O0VBRWxCLHNCQUFBLEdBQXlCLFNBQUMsSUFBRDtBQUN2QixRQUFBO0lBQUEsU0FBQSxHQUFZLElBQUksQ0FBQyxXQUFMLENBQUE7SUFDWixJQUFHLFNBQUEsS0FBYSxJQUFoQjthQUNFLElBQUksQ0FBQyxXQUFMLENBQUEsRUFERjtLQUFBLE1BQUE7YUFHRSxVQUhGOztFQUZ1Qjs7RUFPekIsa0JBQUEsR0FBcUIsU0FBQyxJQUFEO0lBQ25CLElBQUcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFkLENBQUg7YUFDRSxJQUFJLENBQUMsU0FBTCxDQUFBLENBQWdCLENBQUMsS0FBakIsQ0FBdUIsUUFBdkIsRUFERjtLQUFBLE1BQUE7YUFHRSxJQUFJLENBQUMsS0FBTCxDQUFXLFFBQVgsRUFIRjs7RUFEbUI7O0VBTXJCLHdCQUFBLEdBQTJCLFNBQUMsRUFBRCxFQUFLLFVBQUw7QUFDekIsUUFBQTtJQUFBLEtBQUEsR0FBUSxVQUFVLENBQUMsYUFBWCxDQUFBO1dBQ1IsVUFBVSxDQUFDLGFBQVgsQ0FBeUIsQ0FBQyxDQUFDLFFBQUYsQ0FBVztNQUFDLENBQUEsS0FBQSxDQUFBLEVBQU8sRUFBQSxDQUFHLEtBQUssRUFBQyxLQUFELEVBQVIsQ0FBUjtLQUFYLEVBQXFDLEtBQXJDLENBQXpCO0VBRnlCOztFQWMzQixtQkFBQSxHQUFzQixTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQ3BCLFFBQUE7SUFBQSxJQUFHLGlCQUFBLENBQWtCLEtBQWxCLENBQUEsSUFBNEIsZUFBQSxDQUFnQixLQUFoQixDQUEvQjtBQUNFLGFBQU8sTUFEVDs7SUFHQyxtQkFBRCxFQUFRO0lBQ1IsSUFBRyxrQkFBQSxDQUFtQixNQUFuQixFQUEyQixLQUEzQixDQUFIO01BQ0UsUUFBQSxHQUFXLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFmLEVBRGI7O0lBR0EsSUFBRyxrQkFBQSxDQUFtQixNQUFuQixFQUEyQixHQUEzQixDQUFIO01BQ0UsTUFBQSxHQUFTLEdBQUcsQ0FBQyxRQUFKLENBQWEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFiLEVBRFg7O0lBR0EsSUFBRyxrQkFBQSxJQUFhLGdCQUFoQjthQUNNLElBQUEsS0FBQSxvQkFBTSxXQUFXLEtBQWpCLG1CQUF3QixTQUFTLEdBQWpDLEVBRE47S0FBQSxNQUFBO2FBR0UsTUFIRjs7RUFYb0I7O0VBb0J0Qix3QkFBQSxHQUEyQixTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQ3pCLFFBQUE7SUFBQyxtQkFBRCxFQUFRO0lBRVIsTUFBQSxHQUFTO0lBQ1QsU0FBQSxHQUFZLENBQUMsR0FBRCxFQUFNLHdCQUFBLENBQXlCLE1BQXpCLEVBQWlDLEdBQUcsQ0FBQyxHQUFyQyxDQUFOO0lBQ1osTUFBTSxDQUFDLGlCQUFQLENBQXlCLElBQXpCLEVBQStCLFNBQS9CLEVBQTBDLFNBQUMsR0FBRDtBQUFhLFVBQUE7TUFBWCxRQUFEO2FBQVksTUFBQSxHQUFTLEtBQUssQ0FBQztJQUE1QixDQUExQztJQUVBLHFCQUFHLE1BQU0sQ0FBRSxhQUFSLENBQXNCLEdBQXRCLFVBQUg7QUFDRSxhQUFXLElBQUEsS0FBQSxDQUFNLEtBQU4sRUFBYSxNQUFiLEVBRGI7O0lBR0EsUUFBQSxHQUFXO0lBQ1gsU0FBQSxHQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBUCxFQUFZLENBQVosQ0FBRCxFQUFpQixLQUFLLENBQUMsS0FBdkI7SUFDWixNQUFNLENBQUMsMEJBQVAsQ0FBa0MsSUFBbEMsRUFBd0MsU0FBeEMsRUFBbUQsU0FBQyxHQUFEO0FBQWEsVUFBQTtNQUFYLFFBQUQ7YUFBWSxRQUFBLEdBQVcsS0FBSyxDQUFDO0lBQTlCLENBQW5EO0lBRUEsdUJBQUcsUUFBUSxDQUFFLFVBQVYsQ0FBcUIsS0FBckIsVUFBSDtBQUNFLGFBQVcsSUFBQSxLQUFBLENBQU0sUUFBTixFQUFnQixHQUFoQixFQURiOztBQUdBLFdBQU87RUFqQmtCOztFQTBCM0IsY0FBQSxHQUFpQixTQUFDLElBQUQsRUFBTyxPQUFQLEVBQWdCLEVBQWhCO0FBQ2YsUUFBQTtJQUFBLGFBQUEsR0FBZ0IsY0FBQSxHQUFpQjtJQUNqQyxLQUFBLEdBQVEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxJQUFaO0lBQ1IsR0FBQSxHQUFNLElBQUksQ0FBQyxNQUFMLENBQVksTUFBWjtJQUNOLGFBQUEsR0FBZ0IsY0FBQSxHQUFpQjtJQUNqQyxJQUFtQyxLQUFBLEtBQVcsQ0FBQyxDQUEvQztNQUFBLGFBQUEsR0FBZ0IsSUFBSyxpQkFBckI7O0lBQ0EsSUFBaUMsR0FBQSxLQUFTLENBQUMsQ0FBM0M7TUFBQSxjQUFBLEdBQWlCLElBQUssWUFBdEI7O0lBQ0EsSUFBQSxHQUFPLElBQUs7SUFFWixLQUFBLEdBQVE7SUFDUixJQUFnQixPQUFPLENBQUMsVUFBeEI7TUFBQSxLQUFBLElBQVMsSUFBVDs7SUFDQSxNQUFBLEdBQWEsSUFBQSxNQUFBLENBQU8sR0FBQSxHQUFJLE9BQU8sQ0FBQyxNQUFaLEdBQW1CLEdBQTFCLEVBQThCLEtBQTlCO0lBTWIsS0FBQSxHQUFRO0lBQ1IsVUFBQSxHQUFhO0FBQ2I7QUFBQSxTQUFBLDhDQUFBOztNQUNFLElBQUcsQ0FBQSxHQUFJLENBQUosS0FBUyxDQUFaO1FBQ0UsS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFYLEVBREY7T0FBQSxNQUFBO1FBR0UsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsT0FBaEIsRUFIRjs7QUFERjtJQUtBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLEVBQWhCO0lBQ0EsS0FBQSxHQUFRLEVBQUEsQ0FBRyxLQUFIO0lBQ1IsTUFBQSxHQUFTO0FBQ1Q7QUFBQSxTQUFBLHdDQUFBO3NCQUFLLGdCQUFNO01BQ1QsTUFBQSxJQUFVLElBQUEsR0FBTztBQURuQjtXQUVBLGFBQUEsR0FBZ0IsTUFBaEIsR0FBeUI7RUE3QlY7O0VBK0JYO0lBQ1MsMkJBQUE7TUFDWCxJQUFDLENBQUEsU0FBRCxHQUFhO01BQ2IsSUFBQyxDQUFBLGNBQUQsR0FBa0I7SUFGUDs7Z0NBSWIsYUFBQSxHQUFlLFNBQUE7TUFDYixJQUFHLElBQUMsQ0FBQSxZQUFKO1FBQ0UsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCO1VBQUMsSUFBQSxFQUFNLElBQUMsQ0FBQSxZQUFSO1VBQXNCLElBQUEsRUFBTSxJQUFDLENBQUEsY0FBN0I7U0FBaEI7ZUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixHQUZsQjs7SUFEYTs7Z0NBS2YsYUFBQSxHQUFlLFNBQUMsVUFBRDtNQUNiLElBQUcsSUFBQyxDQUFBLGNBQUQsS0FBcUIsVUFBeEI7UUFDRSxJQUFvQixJQUFDLENBQUEsY0FBckI7VUFBQSxJQUFDLENBQUEsYUFBRCxDQUFBLEVBQUE7O2VBQ0EsSUFBQyxDQUFBLGNBQUQsR0FBa0IsV0FGcEI7O0lBRGE7Ozs7OztFQUtqQixjQUFBLEdBQWlCLFNBQUMsSUFBRCxFQUFPLHVCQUFQO0FBQ2YsUUFBQTs7TUFBQSwwQkFBMkI7O0lBQzNCLGNBQUEsR0FBaUI7SUFDakIsVUFBQSxHQUFhO0lBQ2IsbUJBQUEsR0FBc0I7TUFDcEIsR0FBQSxFQUFLLEdBRGU7TUFFcEIsR0FBQSxFQUFLLEdBRmU7TUFHcEIsR0FBQSxFQUFLLEdBSGU7O0lBS3RCLGNBQUEsR0FBaUIsQ0FBQyxDQUFDLElBQUYsQ0FBTyxtQkFBUCxDQUEyQixDQUFDLElBQTVCLENBQWlDLEVBQWpDO0lBQ2pCLGFBQUEsR0FBZ0IsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxtQkFBVCxDQUE2QixDQUFDLElBQTlCLENBQW1DLEVBQW5DO0lBQ2hCLFVBQUEsR0FBYTtJQUViLFlBQUEsR0FBZTtJQUNmLE9BQUEsR0FBVTtJQUNWLFNBQUEsR0FBWTtJQUlaLFNBQUEsR0FBWTtJQUNaLGNBQUEsR0FBaUI7SUFFakIsYUFBQSxHQUFnQixTQUFBO01BQ2QsSUFBRyxZQUFIO1FBQ0UsU0FBUyxDQUFDLElBQVYsQ0FBZTtVQUFDLElBQUEsRUFBTSxZQUFQO1VBQXFCLElBQUEsRUFBTSxjQUEzQjtTQUFmO2VBQ0EsWUFBQSxHQUFlLEdBRmpCOztJQURjO0lBS2hCLGFBQUEsR0FBZ0IsU0FBQyxVQUFEO01BQ2QsSUFBRyxjQUFBLEtBQW9CLFVBQXZCO1FBQ0UsSUFBbUIsY0FBbkI7VUFBQSxhQUFBLENBQUEsRUFBQTs7ZUFDQSxjQUFBLEdBQWlCLFdBRm5COztJQURjO0lBS2hCLFNBQUEsR0FBWTtBQUNaLFNBQUEsc0NBQUE7O01BQ0UsSUFBRyxDQUFDLFNBQVMsQ0FBQyxNQUFWLEtBQW9CLENBQXJCLENBQUEsSUFBNEIsQ0FBQyxhQUFRLGNBQVIsRUFBQSxJQUFBLE1BQUQsQ0FBL0I7UUFDRSxhQUFBLENBQWMsV0FBZCxFQURGO09BQUEsTUFBQTtRQUdFLGFBQUEsQ0FBYyxVQUFkO1FBQ0EsSUFBRyxTQUFIO1VBQ0UsU0FBQSxHQUFZLE1BRGQ7U0FBQSxNQUVLLElBQUcsSUFBQSxLQUFRLFVBQVg7VUFDSCxTQUFBLEdBQVksS0FEVDtTQUFBLE1BRUEsSUFBRyxPQUFIO1VBQ0gsSUFBRyxDQUFDLGFBQVEsVUFBUixFQUFBLElBQUEsTUFBRCxDQUFBLElBQXlCLENBQUMsQ0FBQyxJQUFGLENBQU8sU0FBUCxDQUFBLEtBQXFCLElBQWpEO1lBQ0UsU0FBUyxDQUFDLEdBQVYsQ0FBQTtZQUNBLE9BQUEsR0FBVSxNQUZaO1dBREc7U0FBQSxNQUlBLElBQUcsYUFBUSxVQUFSLEVBQUEsSUFBQSxNQUFIO1VBQ0gsT0FBQSxHQUFVO1VBQ1YsU0FBUyxDQUFDLElBQVYsQ0FBZSxJQUFmLEVBRkc7U0FBQSxNQUdBLElBQUcsYUFBUSxhQUFSLEVBQUEsSUFBQSxNQUFIO1VBQ0gsU0FBUyxDQUFDLElBQVYsQ0FBZSxJQUFmLEVBREc7U0FBQSxNQUVBLElBQUcsYUFBUSxjQUFSLEVBQUEsSUFBQSxNQUFIO1VBQ0gsSUFBbUIsQ0FBQyxDQUFDLElBQUYsQ0FBTyxTQUFQLENBQUEsS0FBcUIsbUJBQW9CLENBQUEsSUFBQSxDQUE1RDtZQUFBLFNBQVMsQ0FBQyxHQUFWLENBQUEsRUFBQTtXQURHO1NBakJQOztNQW9CQSxZQUFBLElBQWdCO0FBckJsQjtJQXNCQSxhQUFBLENBQUE7SUFFQSxJQUFHLHVCQUFBLElBQTRCLFNBQVMsQ0FBQyxJQUFWLENBQWUsU0FBQyxHQUFEO0FBQWtCLFVBQUE7TUFBaEIsaUJBQU07YUFBVSxJQUFBLEtBQVEsV0FBUixJQUF3QixhQUFPLElBQVAsRUFBQSxHQUFBO0lBQTFDLENBQWYsQ0FBL0I7TUFHRSxZQUFBLEdBQWU7QUFDZixhQUFNLFNBQVMsQ0FBQyxNQUFoQjtRQUNFLEtBQUEsR0FBUSxTQUFTLENBQUMsS0FBVixDQUFBO0FBQ1IsZ0JBQU8sS0FBSyxDQUFDLElBQWI7QUFBQSxlQUNPLFVBRFA7WUFFSSxZQUFZLENBQUMsSUFBYixDQUFrQixLQUFsQjtBQURHO0FBRFAsZUFHTyxXQUhQO1lBSUksSUFBRyxhQUFPLEtBQUssQ0FBQyxJQUFiLEVBQUEsR0FBQSxNQUFIO2NBQ0UsWUFBWSxDQUFDLElBQWIsQ0FBa0IsS0FBbEIsRUFERjthQUFBLE1BQUE7Y0FLRSxPQUFBLGdEQUErQjtnQkFBQyxJQUFBLEVBQU0sRUFBUDtnQkFBVyxZQUFBLFVBQVg7O2NBQy9CLE9BQU8sQ0FBQyxJQUFSLElBQWdCLEtBQUssQ0FBQyxJQUFOLEdBQWEsbUZBQTJCLEVBQTNCO2NBQzdCLFlBQVksQ0FBQyxJQUFiLENBQWtCLE9BQWxCLEVBUEY7O0FBSko7TUFGRjtNQWNBLFNBQUEsR0FBWSxhQWxCZDs7V0FtQkE7RUE1RWU7O0VBOEVqQixxQkFBQSxHQUF3QixTQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLE9BQXBCLEVBQTZCLE9BQTdCLEVBQXlDLEVBQXpDO0FBQ3RCLFFBQUE7O01BRG1ELFVBQVE7O0lBQzFELHFDQUFELEVBQWdCLG1CQUFoQixFQUFzQjtJQUN0QixJQUFPLGNBQUosSUFBa0IsbUJBQXJCO0FBQ0UsWUFBVSxJQUFBLEtBQUEsQ0FBTSxrREFBTixFQURaOztJQUdBLElBQUcsU0FBSDtNQUNFLGFBQUEsR0FBZ0IsS0FEbEI7S0FBQSxNQUFBOztRQUdFLGdCQUFpQjtPQUhuQjs7SUFJQSxJQUFpQyxZQUFqQztNQUFBLElBQUEsR0FBTyxLQUFLLENBQUMsVUFBTixDQUFpQixJQUFqQixFQUFQOztBQUNBLFlBQU8sU0FBUDtBQUFBLFdBQ08sU0FEUDs7VUFFSSxZQUFpQixJQUFBLEtBQUEsQ0FBTSxJQUFOLEVBQVksdUJBQUEsQ0FBd0IsTUFBeEIsQ0FBWjs7UUFDakIsWUFBQSxHQUFlO0FBRlo7QUFEUCxXQUlPLFVBSlA7O1VBS0ksWUFBaUIsSUFBQSxLQUFBLENBQU0sQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFOLEVBQWMsSUFBZDs7UUFDakIsWUFBQSxHQUFlO0FBTm5CO1dBUUEsTUFBTyxDQUFBLFlBQUEsQ0FBUCxDQUFxQixPQUFyQixFQUE4QixTQUE5QixFQUF5QyxTQUFDLEtBQUQ7TUFDdkMsSUFBRyxDQUFJLGFBQUosSUFBc0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBbEIsS0FBMkIsSUFBSSxDQUFDLEdBQXpEO1FBQ0UsS0FBSyxDQUFDLElBQU4sQ0FBQTtBQUNBLGVBRkY7O2FBR0EsRUFBQSxDQUFHLEtBQUg7SUFKdUMsQ0FBekM7RUFsQnNCOztFQXdCeEIsNkJBQUEsR0FBZ0MsU0FBQyxNQUFELEVBQVMsS0FBVDtBQWE5QixRQUFBO0lBQUEsY0FBQSxHQUFpQixNQUFNLENBQUMsMkJBQVAsQ0FBbUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUEvQztJQUNqQixRQUFBLEdBQVc7SUFDWCxrQkFBQSxHQUFxQjtBQUNyQixTQUFXLDBIQUFYO01BQ0UsV0FBQSxHQUFjLDBCQUFBLENBQTJCLE1BQTNCLEVBQW1DLEdBQW5DO01BQ2Qsa0JBQWtCLENBQUMsSUFBbkIsQ0FBd0IsQ0FBQyxHQUFELEVBQU0sV0FBTixDQUF4QjtNQUNBLElBQUEsQ0FBTyxVQUFBLENBQVcsTUFBWCxFQUFtQixHQUFuQixDQUFQO1FBQ0UsUUFBQSxHQUFXLElBQUksQ0FBQyxHQUFMLG9CQUFTLFdBQVcsS0FBcEIsRUFBOEIsV0FBOUIsRUFEYjs7QUFIRjtJQU1BLElBQUcsa0JBQUEsSUFBYyxDQUFDLHFCQUFBLEdBQXdCLGNBQUEsR0FBaUIsUUFBMUMsQ0FBakI7QUFDRTtXQUFBLG9EQUFBO3NDQUFLLGVBQUs7UUFDUixRQUFBLEdBQVcsV0FBQSxHQUFjO3NCQUN6QixNQUFNLENBQUMsMEJBQVAsQ0FBa0MsR0FBbEMsRUFBdUMsUUFBdkM7QUFGRjtzQkFERjs7RUF0QjhCOztFQTRCaEMsa0NBQUEsR0FBcUMsU0FBQyxLQUFELEVBQVEsS0FBUjtXQUNuQyxLQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFaLENBQThCLEtBQTlCLENBQUEsSUFDRSxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQVYsQ0FBd0IsS0FBeEI7RUFGaUM7O0VBSXJDLHFCQUFBLEdBQXdCLFNBQUMsS0FBRCxFQUFRLElBQVI7V0FDdEIsS0FBSyxDQUFDLFFBQU4sQ0FBZSxtQkFBQSxDQUFvQixJQUFwQixDQUFmO0VBRHNCOztFQUd4QixtQkFBQSxHQUFzQixTQUFDLElBQUQ7QUFDcEIsUUFBQTtJQUFBLEdBQUEsR0FBTTtJQUNOLE1BQUEsR0FBUztBQUNULFNBQUEsc0NBQUE7O01BQ0UsSUFBRyxJQUFBLEtBQVEsSUFBWDtRQUNFLEdBQUE7UUFDQSxNQUFBLEdBQVMsRUFGWDtPQUFBLE1BQUE7UUFJRSxNQUFBLEdBSkY7O0FBREY7V0FNQSxDQUFDLEdBQUQsRUFBTSxNQUFOO0VBVG9COztFQVd0QixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUNmLHFCQUFBLG1CQURlO0lBRWYsY0FBQSxZQUZlO0lBR2YseUJBQUEsdUJBSGU7SUFJZixTQUFBLE9BSmU7SUFLZixPQUFBLEtBTGU7SUFNZixpQkFBQSxlQU5lO0lBT2YsaUJBQUEsZUFQZTtJQVFmLFlBQUEsVUFSZTtJQVNmLFVBQUEsUUFUZTtJQVVmLHVCQUFBLHFCQVZlO0lBV2YsbUJBQUEsaUJBWGU7SUFZZixvQkFBQSxrQkFaZTtJQWFmLHFCQUFBLG1CQWJlO0lBY2YsaUNBQUEsK0JBZGU7SUFlZix1QkFBQSxxQkFmZTtJQWdCZix5QkFBQSx1QkFoQmU7SUFpQmYseUJBQUEsdUJBakJlO0lBa0JmLHFCQUFBLG1CQWxCZTtJQW1CZixxQkFBQSxtQkFuQmU7SUFvQmYsY0FBQSxZQXBCZTtJQXFCZixpQkFBQSxlQXJCZTtJQXNCZixnQkFBQSxjQXRCZTtJQXVCZixpQkFBQSxlQXZCZTtJQXdCZixvQkFBQSxrQkF4QmU7SUF5QmYsc0JBQUEsb0JBekJlO0lBMEJmLDBCQUFBLHdCQTFCZTtJQTJCZiwwQkFBQSx3QkEzQmU7SUE0QmYseUJBQUEsdUJBNUJlO0lBNkJmLHNCQUFBLG9CQTdCZTtJQThCZixzQkFBQSxvQkE5QmU7SUErQmYsaUNBQUEsK0JBL0JlO0lBZ0NmLDZCQUFBLDJCQWhDZTtJQWlDZiw0QkFBQSwwQkFqQ2U7SUFrQ2Ysc0JBQUEsb0JBbENlO0lBbUNmLCtCQUFBLDZCQW5DZTtJQW9DZixZQUFBLFVBcENlO0lBcUNmLHNCQUFBLG9CQXJDZTtJQXNDZixxQ0FBQSxtQ0F0Q2U7SUF1Q2YsMkJBQUEseUJBdkNlO0lBd0NmLFdBQUEsU0F4Q2U7SUF5Q2YsdUNBQUEscUNBekNlO0lBMENmLDhCQUFBLDRCQTFDZTtJQTJDZixrQ0FBQSxnQ0EzQ2U7SUE0Q2YsZUFBQSxhQTVDZTtJQTZDZiw2QkFBQSwyQkE3Q2U7SUE4Q2YsYUFBQSxXQTlDZTtJQStDZixrQkFBQSxnQkEvQ2U7SUFnRGYsb0NBQUEsa0NBaERlO0lBaURmLDJDQUFBLHlDQWpEZTtJQWtEZixnQ0FBQSw4QkFsRGU7SUFtRGYsbUNBQUEsaUNBbkRlO0lBb0RmLCtCQUFBLDZCQXBEZTtJQXFEZiwrQkFBQSw2QkFyRGU7SUFzRGYsWUFBQSxVQXREZTtJQXVEZix5QkFBQSx1QkF2RGU7SUF3RGYsc0JBQUEsb0JBeERlO0lBeURmLHNDQUFBLG9DQXpEZTtJQTBEZix1QkFBQSxxQkExRGU7SUEyRGYsaUNBQUEsK0JBM0RlO0lBNERmLFlBQUEsVUE1RGU7SUE2RGYscUJBQUEsbUJBN0RlO0lBOERmLGFBQUEsV0E5RGU7SUErRGYsd0JBQUEsc0JBL0RlO0lBaUVmLFNBQUEsT0FqRWU7SUFpRU4sWUFBQSxVQWpFTTtJQWtFZixtQkFBQSxpQkFsRWU7SUFrRUksc0JBQUEsb0JBbEVKO0lBb0VmLDRCQUFBLDBCQXBFZTtJQXFFZixtQ0FBQSxpQ0FyRWU7SUFzRWYsMEJBQUEsd0JBdEVlO0lBdUVmLDZCQUFBLDJCQXZFZTtJQXdFZixvQkFBQSxrQkF4RWU7SUEwRWYsaUJBQUEsZUExRWU7SUEyRWYsY0FBQSxZQTNFZTtJQTRFZixpQkFBQSxlQTVFZTtJQTZFZixpQkFBQSxlQTdFZTtJQThFZix3QkFBQSxzQkE5RWU7SUErRWYsb0JBQUEsa0JBL0VlO0lBZ0ZmLDBCQUFBLHdCQWhGZTtJQWlGZixxQkFBQSxtQkFqRmU7SUFrRmYsMEJBQUEsd0JBbEZlO0lBbUZmLGdCQUFBLGNBbkZlO0lBb0ZmLGdCQUFBLGNBcEZlO0lBcUZmLHVCQUFBLHFCQXJGZTtJQXNGZiwrQkFBQSw2QkF0RmU7SUF1RmYsb0NBQUEsa0NBdkZlO0lBd0ZmLHVCQUFBLHFCQXhGZTs7QUFoNkJqQiIsInNvdXJjZXNDb250ZW50IjpbImZzID0gbnVsbFxuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG57RGlzcG9zYWJsZSwgUmFuZ2UsIFBvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5hc3NlcnRXaXRoRXhjZXB0aW9uID0gKGNvbmRpdGlvbiwgbWVzc2FnZSwgZm4pIC0+XG4gIGF0b20uYXNzZXJ0IGNvbmRpdGlvbiwgbWVzc2FnZSwgKGVycm9yKSAtPlxuICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlKVxuXG5nZXRBbmNlc3RvcnMgPSAob2JqKSAtPlxuICBhbmNlc3RvcnMgPSBbXVxuICBjdXJyZW50ID0gb2JqXG4gIGxvb3BcbiAgICBhbmNlc3RvcnMucHVzaChjdXJyZW50KVxuICAgIGN1cnJlbnQgPSBjdXJyZW50Ll9fc3VwZXJfXz8uY29uc3RydWN0b3JcbiAgICBicmVhayB1bmxlc3MgY3VycmVudFxuICBhbmNlc3RvcnNcblxuZ2V0S2V5QmluZGluZ0ZvckNvbW1hbmQgPSAoY29tbWFuZCwge3BhY2thZ2VOYW1lfSkgLT5cbiAgcmVzdWx0cyA9IG51bGxcbiAga2V5bWFwcyA9IGF0b20ua2V5bWFwcy5nZXRLZXlCaW5kaW5ncygpXG4gIGlmIHBhY2thZ2VOYW1lP1xuICAgIGtleW1hcFBhdGggPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UocGFja2FnZU5hbWUpLmdldEtleW1hcFBhdGhzKCkucG9wKClcbiAgICBrZXltYXBzID0ga2V5bWFwcy5maWx0ZXIoKHtzb3VyY2V9KSAtPiBzb3VyY2UgaXMga2V5bWFwUGF0aClcblxuICBmb3Iga2V5bWFwIGluIGtleW1hcHMgd2hlbiBrZXltYXAuY29tbWFuZCBpcyBjb21tYW5kXG4gICAge2tleXN0cm9rZXMsIHNlbGVjdG9yfSA9IGtleW1hcFxuICAgIGtleXN0cm9rZXMgPSBrZXlzdHJva2VzLnJlcGxhY2UoL3NoaWZ0LS8sICcnKVxuICAgIChyZXN1bHRzID89IFtdKS5wdXNoKHtrZXlzdHJva2VzLCBzZWxlY3Rvcn0pXG4gIHJlc3VsdHNcblxuIyBJbmNsdWRlIG1vZHVsZShvYmplY3Qgd2hpY2ggbm9ybWFseSBwcm92aWRlcyBzZXQgb2YgbWV0aG9kcykgdG8ga2xhc3NcbmluY2x1ZGUgPSAoa2xhc3MsIG1vZHVsZSkgLT5cbiAgZm9yIGtleSwgdmFsdWUgb2YgbW9kdWxlXG4gICAga2xhc3M6OltrZXldID0gdmFsdWVcblxuZGVidWcgPSAobWVzc2FnZXMuLi4pIC0+XG4gIHJldHVybiB1bmxlc3Mgc2V0dGluZ3MuZ2V0KCdkZWJ1ZycpXG4gIHN3aXRjaCBzZXR0aW5ncy5nZXQoJ2RlYnVnT3V0cHV0JylcbiAgICB3aGVuICdjb25zb2xlJ1xuICAgICAgY29uc29sZS5sb2cgbWVzc2FnZXMuLi5cbiAgICB3aGVuICdmaWxlJ1xuICAgICAgZnMgPz0gcmVxdWlyZSAnZnMtcGx1cydcbiAgICAgIGZpbGVQYXRoID0gZnMubm9ybWFsaXplIHNldHRpbmdzLmdldCgnZGVidWdPdXRwdXRGaWxlUGF0aCcpXG4gICAgICBpZiBmcy5leGlzdHNTeW5jKGZpbGVQYXRoKVxuICAgICAgICBmcy5hcHBlbmRGaWxlU3luYyBmaWxlUGF0aCwgbWVzc2FnZXMgKyBcIlxcblwiXG5cbiMgUmV0dXJuIGZ1bmN0aW9uIHRvIHJlc3RvcmUgZWRpdG9yJ3Mgc2Nyb2xsVG9wIGFuZCBmb2xkIHN0YXRlLlxuc2F2ZUVkaXRvclN0YXRlID0gKGVkaXRvcikgLT5cbiAgZWRpdG9yRWxlbWVudCA9IGVkaXRvci5lbGVtZW50XG4gIHNjcm9sbFRvcCA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKClcblxuICBmb2xkU3RhcnRSb3dzID0gZWRpdG9yLmRpc3BsYXlMYXllci5mb2xkc01hcmtlckxheWVyLmZpbmRNYXJrZXJzKHt9KS5tYXAgKG0pIC0+IG0uZ2V0U3RhcnRQb3NpdGlvbigpLnJvd1xuICAtPlxuICAgIGZvciByb3cgaW4gZm9sZFN0YXJ0Um93cy5yZXZlcnNlKCkgd2hlbiBub3QgZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KVxuICAgICAgZWRpdG9yLmZvbGRCdWZmZXJSb3cocm93KVxuICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKHNjcm9sbFRvcClcblxuaXNMaW5ld2lzZVJhbmdlID0gKHtzdGFydCwgZW5kfSkgLT5cbiAgKHN0YXJ0LnJvdyBpc250IGVuZC5yb3cpIGFuZCAoc3RhcnQuY29sdW1uIGlzIGVuZC5jb2x1bW4gaXMgMClcblxuaXNFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIHtzdGFydCwgZW5kfSA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3csIGluY2x1ZGVOZXdsaW5lOiB0cnVlKVxuICBzdGFydC5yb3cgaXNudCBlbmQucm93XG5cbnNvcnRSYW5nZXMgPSAoY29sbGVjdGlvbikgLT5cbiAgY29sbGVjdGlvbi5zb3J0IChhLCBiKSAtPiBhLmNvbXBhcmUoYilcblxuIyBSZXR1cm4gYWRqdXN0ZWQgaW5kZXggZml0IHdoaXRpbiBnaXZlbiBsaXN0J3MgbGVuZ3RoXG4jIHJldHVybiAtMSBpZiBsaXN0IGlzIGVtcHR5LlxuZ2V0SW5kZXggPSAoaW5kZXgsIGxpc3QpIC0+XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoXG4gIGlmIGxlbmd0aCBpcyAwXG4gICAgLTFcbiAgZWxzZVxuICAgIGluZGV4ID0gaW5kZXggJSBsZW5ndGhcbiAgICBpZiBpbmRleCA+PSAwXG4gICAgICBpbmRleFxuICAgIGVsc2VcbiAgICAgIGxlbmd0aCArIGluZGV4XG5cbiMgTk9URTogZW5kUm93IGJlY29tZSB1bmRlZmluZWQgaWYgQGVkaXRvckVsZW1lbnQgaXMgbm90IHlldCBhdHRhY2hlZC5cbiMgZS5nLiBCZWdpbmcgY2FsbGVkIGltbWVkaWF0ZWx5IGFmdGVyIG9wZW4gZmlsZS5cbmdldFZpc2libGVCdWZmZXJSYW5nZSA9IChlZGl0b3IpIC0+XG4gIFtzdGFydFJvdywgZW5kUm93XSA9IGVkaXRvci5lbGVtZW50LmdldFZpc2libGVSb3dSYW5nZSgpXG4gIHJldHVybiBudWxsIHVubGVzcyAoc3RhcnRSb3c/IGFuZCBlbmRSb3c/KVxuICBzdGFydFJvdyA9IGVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coc3RhcnRSb3cpXG4gIGVuZFJvdyA9IGVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coZW5kUm93KVxuICBuZXcgUmFuZ2UoW3N0YXJ0Um93LCAwXSwgW2VuZFJvdywgSW5maW5pdHldKVxuXG5nZXRWaXNpYmxlRWRpdG9ycyA9IC0+XG4gIChlZGl0b3IgZm9yIHBhbmUgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKSB3aGVuIGVkaXRvciA9IHBhbmUuZ2V0QWN0aXZlRWRpdG9yKCkpXG5cbmdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdykuZW5kXG5cbiMgUG9pbnQgdXRpbFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5wb2ludElzQXRFbmRPZkxpbmUgPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgcG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KHBvaW50KVxuICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCBwb2ludC5yb3cpLmlzRXF1YWwocG9pbnQpXG5cbnBvaW50SXNPbldoaXRlU3BhY2UgPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgY2hhciA9IGdldFJpZ2h0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24oZWRpdG9yLCBwb2ludClcbiAgbm90IC9cXFMvLnRlc3QoY2hhcilcblxucG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvdyA9IChlZGl0b3IsIHBvaW50KSAtPlxuICBwb2ludCA9IFBvaW50LmZyb21PYmplY3QocG9pbnQpXG4gIHBvaW50LmNvbHVtbiBpc250IDAgYW5kIHBvaW50SXNBdEVuZE9mTGluZShlZGl0b3IsIHBvaW50KVxuXG5wb2ludElzQXRWaW1FbmRPZkZpbGUgPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oZWRpdG9yKS5pc0VxdWFsKHBvaW50KVxuXG5pc0VtcHR5Um93ID0gKGVkaXRvciwgcm93KSAtPlxuICBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KS5pc0VtcHR5KClcblxuZ2V0UmlnaHRDaGFyYWN0ZXJGb3JCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBhbW91bnQ9MSkgLT5cbiAgZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShwb2ludCwgMCwgYW1vdW50KSlcblxuZ2V0TGVmdENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIGFtb3VudD0xKSAtPlxuICBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAtYW1vdW50KSlcblxuZ2V0VGV4dEluU2NyZWVuUmFuZ2UgPSAoZWRpdG9yLCBzY3JlZW5SYW5nZSkgLT5cbiAgYnVmZmVyUmFuZ2UgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY3JlZW5SYW5nZShzY3JlZW5SYW5nZSlcbiAgZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKGJ1ZmZlclJhbmdlKVxuXG5nZXROb25Xb3JkQ2hhcmFjdGVyc0ZvckN1cnNvciA9IChjdXJzb3IpIC0+XG4gICMgQXRvbSAxLjExLjAtYmV0YTUgaGF2ZSB0aGlzIGV4cGVyaW1lbnRhbCBtZXRob2QuXG4gIGlmIGN1cnNvci5nZXROb25Xb3JkQ2hhcmFjdGVycz9cbiAgICBjdXJzb3IuZ2V0Tm9uV29yZENoYXJhY3RlcnMoKVxuICBlbHNlXG4gICAgc2NvcGUgPSBjdXJzb3IuZ2V0U2NvcGVEZXNjcmlwdG9yKCkuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIGF0b20uY29uZmlnLmdldCgnZWRpdG9yLm5vbldvcmRDaGFyYWN0ZXJzJywge3Njb3BlfSlcblxuIyBGSVhNRTogcmVtb3ZlIHRoaXNcbiMgcmV0dXJuIHRydWUgaWYgbW92ZWRcbm1vdmVDdXJzb3JUb05leHROb25XaGl0ZXNwYWNlID0gKGN1cnNvcikgLT5cbiAgb3JpZ2luYWxQb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gIGVkaXRvciA9IGN1cnNvci5lZGl0b3JcbiAgdmltRW9mID0gZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oZWRpdG9yKVxuXG4gIHdoaWxlIHBvaW50SXNPbldoaXRlU3BhY2UoZWRpdG9yLCBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSBhbmQgbm90IHBvaW50LmlzR3JlYXRlclRoYW5PckVxdWFsKHZpbUVvZilcbiAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgbm90IG9yaWdpbmFsUG9pbnQuaXNFcXVhbChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcblxuZ2V0QnVmZmVyUm93cyA9IChlZGl0b3IsIHtzdGFydFJvdywgZGlyZWN0aW9ufSkgLT5cbiAgc3dpdGNoIGRpcmVjdGlvblxuICAgIHdoZW4gJ3ByZXZpb3VzJ1xuICAgICAgaWYgc3RhcnRSb3cgPD0gMFxuICAgICAgICBbXVxuICAgICAgZWxzZVxuICAgICAgICBbKHN0YXJ0Um93IC0gMSkuLjBdXG4gICAgd2hlbiAnbmV4dCdcbiAgICAgIGVuZFJvdyA9IGdldFZpbUxhc3RCdWZmZXJSb3coZWRpdG9yKVxuICAgICAgaWYgc3RhcnRSb3cgPj0gZW5kUm93XG4gICAgICAgIFtdXG4gICAgICBlbHNlXG4gICAgICAgIFsoc3RhcnRSb3cgKyAxKS4uZW5kUm93XVxuXG4jIFJldHVybiBWaW0ncyBFT0YgcG9zaXRpb24gcmF0aGVyIHRoYW4gQXRvbSdzIEVPRiBwb3NpdGlvbi5cbiMgVGhpcyBmdW5jdGlvbiBjaGFuZ2UgbWVhbmluZyBvZiBFT0YgZnJvbSBuYXRpdmUgVGV4dEVkaXRvcjo6Z2V0RW9mQnVmZmVyUG9zaXRpb24oKVxuIyBBdG9tIGlzIHNwZWNpYWwoc3RyYW5nZSkgZm9yIGN1cnNvciBjYW4gcGFzdCB2ZXJ5IGxhc3QgbmV3bGluZSBjaGFyYWN0ZXIuXG4jIEJlY2F1c2Ugb2YgdGhpcywgQXRvbSdzIEVPRiBwb3NpdGlvbiBpcyBbYWN0dWFsTGFzdFJvdysxLCAwXSBwcm92aWRlZCBsYXN0LW5vbi1ibGFuay1yb3dcbiMgZW5kcyB3aXRoIG5ld2xpbmUgY2hhci5cbiMgQnV0IGluIFZpbSwgY3Vyb3IgY2FuIE5PVCBwYXN0IGxhc3QgbmV3bGluZS4gRU9GIGlzIG5leHQgcG9zaXRpb24gb2YgdmVyeSBsYXN0IGNoYXJhY3Rlci5cbmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvcikgLT5cbiAgZW9mID0gZWRpdG9yLmdldEVvZkJ1ZmZlclBvc2l0aW9uKClcbiAgaWYgKGVvZi5yb3cgaXMgMCkgb3IgKGVvZi5jb2x1bW4gPiAwKVxuICAgIGVvZlxuICBlbHNlXG4gICAgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KGVkaXRvciwgZW9mLnJvdyAtIDEpXG5cbmdldFZpbUVvZlNjcmVlblBvc2l0aW9uID0gKGVkaXRvcikgLT5cbiAgZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oZWRpdG9yKSlcblxuZ2V0VmltTGFzdEJ1ZmZlclJvdyA9IChlZGl0b3IpIC0+IGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKGVkaXRvcikucm93XG5nZXRWaW1MYXN0U2NyZWVuUm93ID0gKGVkaXRvcikgLT4gZ2V0VmltRW9mU2NyZWVuUG9zaXRpb24oZWRpdG9yKS5yb3dcbmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdyA9IChlZGl0b3IpIC0+IGVkaXRvci5lbGVtZW50LmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdyA9IChlZGl0b3IpIC0+IGVkaXRvci5lbGVtZW50LmdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcblxuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgcmFuZ2UgPSBmaW5kUmFuZ2VJbkJ1ZmZlclJvdyhlZGl0b3IsIC9cXFMvLCByb3cpXG4gIHJhbmdlPy5zdGFydCA/IG5ldyBQb2ludChyb3csIDApXG5cbnRyaW1SYW5nZSA9IChlZGl0b3IsIHNjYW5SYW5nZSkgLT5cbiAgcGF0dGVybiA9IC9cXFMvXG4gIFtzdGFydCwgZW5kXSA9IFtdXG4gIHNldFN0YXJ0ID0gKHtyYW5nZX0pIC0+IHtzdGFydH0gPSByYW5nZVxuICBzZXRFbmQgPSAoe3JhbmdlfSkgLT4ge2VuZH0gPSByYW5nZVxuICBlZGl0b3Iuc2NhbkluQnVmZmVyUmFuZ2UocGF0dGVybiwgc2NhblJhbmdlLCBzZXRTdGFydClcbiAgZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlKHBhdHRlcm4sIHNjYW5SYW5nZSwgc2V0RW5kKSBpZiBzdGFydD9cbiAgaWYgc3RhcnQ/IGFuZCBlbmQ/XG4gICAgbmV3IFJhbmdlKHN0YXJ0LCBlbmQpXG4gIGVsc2VcbiAgICBzY2FuUmFuZ2VcblxuIyBDdXJzb3IgbW90aW9uIHdyYXBwZXJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBKdXN0IHVwZGF0ZSBidWZmZXJSb3cgd2l0aCBrZWVwaW5nIGNvbHVtbiBieSByZXNwZWN0aW5nIGdvYWxDb2x1bW5cbnNldEJ1ZmZlclJvdyA9IChjdXJzb3IsIHJvdywgb3B0aW9ucykgLT5cbiAgY29sdW1uID0gY3Vyc29yLmdvYWxDb2x1bW4gPyBjdXJzb3IuZ2V0QnVmZmVyQ29sdW1uKClcbiAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtyb3csIGNvbHVtbl0sIG9wdGlvbnMpXG4gIGN1cnNvci5nb2FsQ29sdW1uID0gY29sdW1uXG5cbnNldEJ1ZmZlckNvbHVtbiA9IChjdXJzb3IsIGNvbHVtbikgLT5cbiAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtjdXJzb3IuZ2V0QnVmZmVyUm93KCksIGNvbHVtbl0pXG5cbm1vdmVDdXJzb3IgPSAoY3Vyc29yLCB7cHJlc2VydmVHb2FsQ29sdW1ufSwgZm4pIC0+XG4gIHtnb2FsQ29sdW1ufSA9IGN1cnNvclxuICBmbihjdXJzb3IpXG4gIGlmIHByZXNlcnZlR29hbENvbHVtbiBhbmQgZ29hbENvbHVtbj9cbiAgICBjdXJzb3IuZ29hbENvbHVtbiA9IGdvYWxDb2x1bW5cblxuIyBXb3JrYXJvdW5kIGlzc3VlIGZvciB0OW1kL3ZpbS1tb2RlLXBsdXMjMjI2IGFuZCBhdG9tL2F0b20jMzE3NFxuIyBJIGNhbm5vdCBkZXBlbmQgY3Vyc29yJ3MgY29sdW1uIHNpbmNlIGl0cyBjbGFpbSAwIGFuZCBjbGlwcGluZyBlbW11bGF0aW9uIGRvbid0XG4jIHJldHVybiB3cmFwcGVkIGxpbmUsIGJ1dCBJdCBhY3R1YWxseSB3cmFwLCBzbyBJIG5lZWQgdG8gZG8gdmVyeSBkaXJ0eSB3b3JrIHRvXG4jIHByZWRpY3Qgd3JhcCBodXJpc3RpY2FsbHkuXG5zaG91bGRQcmV2ZW50V3JhcExpbmUgPSAoY3Vyc29yKSAtPlxuICB7cm93LCBjb2x1bW59ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgaWYgYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc29mdFRhYnMnKVxuICAgIHRhYkxlbmd0aCA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnRhYkxlbmd0aCcpXG4gICAgaWYgMCA8IGNvbHVtbiA8IHRhYkxlbmd0aFxuICAgICAgdGV4dCA9IGN1cnNvci5lZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tyb3csIDBdLCBbcm93LCB0YWJMZW5ndGhdXSlcbiAgICAgIC9eXFxzKyQvLnRlc3QodGV4dClcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4jIG9wdGlvbnM6XG4jICAgYWxsb3dXcmFwOiB0byBjb250cm9sbCBhbGxvdyB3cmFwXG4jICAgcHJlc2VydmVHb2FsQ29sdW1uOiBwcmVzZXJ2ZSBvcmlnaW5hbCBnb2FsQ29sdW1uXG5tb3ZlQ3Vyc29yTGVmdCA9IChjdXJzb3IsIG9wdGlvbnM9e30pIC0+XG4gIHthbGxvd1dyYXAsIG5lZWRTcGVjaWFsQ2FyZVRvUHJldmVudFdyYXBMaW5lfSA9IG9wdGlvbnNcbiAgZGVsZXRlIG9wdGlvbnMuYWxsb3dXcmFwXG4gIGlmIG5lZWRTcGVjaWFsQ2FyZVRvUHJldmVudFdyYXBMaW5lXG4gICAgcmV0dXJuIGlmIHNob3VsZFByZXZlbnRXcmFwTGluZShjdXJzb3IpXG5cbiAgaWYgbm90IGN1cnNvci5pc0F0QmVnaW5uaW5nT2ZMaW5lKCkgb3IgYWxsb3dXcmFwXG4gICAgbW90aW9uID0gKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVMZWZ0KClcbiAgICBtb3ZlQ3Vyc29yKGN1cnNvciwgb3B0aW9ucywgbW90aW9uKVxuXG5tb3ZlQ3Vyc29yUmlnaHQgPSAoY3Vyc29yLCBvcHRpb25zPXt9KSAtPlxuICB7YWxsb3dXcmFwfSA9IG9wdGlvbnNcbiAgZGVsZXRlIG9wdGlvbnMuYWxsb3dXcmFwXG4gIGlmIG5vdCBjdXJzb3IuaXNBdEVuZE9mTGluZSgpIG9yIGFsbG93V3JhcFxuICAgIG1vdGlvbiA9IChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlUmlnaHQoKVxuICAgIG1vdmVDdXJzb3IoY3Vyc29yLCBvcHRpb25zLCBtb3Rpb24pXG5cbm1vdmVDdXJzb3JVcFNjcmVlbiA9IChjdXJzb3IsIG9wdGlvbnM9e30pIC0+XG4gIHVubGVzcyBjdXJzb3IuZ2V0U2NyZWVuUm93KCkgaXMgMFxuICAgIG1vdGlvbiA9IChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlVXAoKVxuICAgIG1vdmVDdXJzb3IoY3Vyc29yLCBvcHRpb25zLCBtb3Rpb24pXG5cbm1vdmVDdXJzb3JEb3duU2NyZWVuID0gKGN1cnNvciwgb3B0aW9ucz17fSkgLT5cbiAgdW5sZXNzIGdldFZpbUxhc3RTY3JlZW5Sb3coY3Vyc29yLmVkaXRvcikgaXMgY3Vyc29yLmdldFNjcmVlblJvdygpXG4gICAgbW90aW9uID0gKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVEb3duKClcbiAgICBtb3ZlQ3Vyc29yKGN1cnNvciwgb3B0aW9ucywgbW90aW9uKVxuXG5tb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93ID0gKGN1cnNvciwgcm93KSAtPlxuICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgMF0pXG4gIGN1cnNvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSgpXG5cbmdldFZhbGlkVmltQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPiBsaW1pdE51bWJlcihyb3csIG1pbjogMCwgbWF4OiBnZXRWaW1MYXN0QnVmZmVyUm93KGVkaXRvcikpXG5cbmdldFZhbGlkVmltU2NyZWVuUm93ID0gKGVkaXRvciwgcm93KSAtPiBsaW1pdE51bWJlcihyb3csIG1pbjogMCwgbWF4OiBnZXRWaW1MYXN0U2NyZWVuUm93KGVkaXRvcikpXG5cbiMgQnkgZGVmYXVsdCBub3QgaW5jbHVkZSBjb2x1bW5cbmdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHtyb3csIGNvbHVtbn0sIHtleGNsdXNpdmV9PXt9KSAtPlxuICBpZiBleGNsdXNpdmUgPyB0cnVlXG4gICAgZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdylbMC4uLmNvbHVtbl1cbiAgZWxzZVxuICAgIGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpWzAuLmNvbHVtbl1cblxuZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIGVkaXRvci5pbmRlbnRMZXZlbEZvckxpbmUoZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdykpXG5cbmdldENvZGVGb2xkUm93UmFuZ2VzID0gKGVkaXRvcikgLT5cbiAgWzAuLmVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCldXG4gICAgLm1hcCAocm93KSAtPlxuICAgICAgZWRpdG9yLmxhbmd1YWdlTW9kZS5yb3dSYW5nZUZvckNvZGVGb2xkQXRCdWZmZXJSb3cocm93KVxuICAgIC5maWx0ZXIgKHJvd1JhbmdlKSAtPlxuICAgICAgcm93UmFuZ2U/IGFuZCByb3dSYW5nZVswXT8gYW5kIHJvd1JhbmdlWzFdP1xuXG4jIFVzZWQgaW4gdm1wLWphc21pbmUtaW5jcmVhc2UtZm9jdXNcbmdldENvZGVGb2xkUm93UmFuZ2VzQ29udGFpbmVzRm9yUm93ID0gKGVkaXRvciwgYnVmZmVyUm93LCB7aW5jbHVkZVN0YXJ0Um93fT17fSkgLT5cbiAgaW5jbHVkZVN0YXJ0Um93ID89IHRydWVcbiAgZ2V0Q29kZUZvbGRSb3dSYW5nZXMoZWRpdG9yKS5maWx0ZXIgKFtzdGFydFJvdywgZW5kUm93XSkgLT5cbiAgICBpZiBpbmNsdWRlU3RhcnRSb3dcbiAgICAgIHN0YXJ0Um93IDw9IGJ1ZmZlclJvdyA8PSBlbmRSb3dcbiAgICBlbHNlXG4gICAgICBzdGFydFJvdyA8IGJ1ZmZlclJvdyA8PSBlbmRSb3dcblxuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZSA9IChlZGl0b3IsIHJvd1JhbmdlKSAtPlxuICBbc3RhcnRSYW5nZSwgZW5kUmFuZ2VdID0gcm93UmFuZ2UubWFwIChyb3cpIC0+XG4gICAgZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdywgaW5jbHVkZU5ld2xpbmU6IHRydWUpXG4gIHN0YXJ0UmFuZ2UudW5pb24oZW5kUmFuZ2UpXG5cbmdldFRva2VuaXplZExpbmVGb3JSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIGVkaXRvci50b2tlbml6ZWRCdWZmZXIudG9rZW5pemVkTGluZUZvclJvdyhyb3cpXG5cbmdldFNjb3Blc0ZvclRva2VuaXplZExpbmUgPSAobGluZSkgLT5cbiAgZm9yIHRhZyBpbiBsaW5lLnRhZ3Mgd2hlbiB0YWcgPCAwIGFuZCAodGFnICUgMiBpcyAtMSlcbiAgICBhdG9tLmdyYW1tYXJzLnNjb3BlRm9ySWQodGFnKVxuXG5zY2FuRm9yU2NvcGVTdGFydCA9IChlZGl0b3IsIGZyb21Qb2ludCwgZGlyZWN0aW9uLCBmbikgLT5cbiAgZnJvbVBvaW50ID0gUG9pbnQuZnJvbU9iamVjdChmcm9tUG9pbnQpXG4gIHNjYW5Sb3dzID0gc3dpdGNoIGRpcmVjdGlvblxuICAgIHdoZW4gJ2ZvcndhcmQnIHRoZW4gWyhmcm9tUG9pbnQucm93KS4uZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKV1cbiAgICB3aGVuICdiYWNrd2FyZCcgdGhlbiBbKGZyb21Qb2ludC5yb3cpLi4wXVxuXG4gIGNvbnRpbnVlU2NhbiA9IHRydWVcbiAgc3RvcCA9IC0+XG4gICAgY29udGludWVTY2FuID0gZmFsc2VcblxuICBpc1ZhbGlkVG9rZW4gPSBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAnZm9yd2FyZCcgdGhlbiAoe3Bvc2l0aW9ufSkgLT4gcG9zaXRpb24uaXNHcmVhdGVyVGhhbihmcm9tUG9pbnQpXG4gICAgd2hlbiAnYmFja3dhcmQnIHRoZW4gKHtwb3NpdGlvbn0pIC0+IHBvc2l0aW9uLmlzTGVzc1RoYW4oZnJvbVBvaW50KVxuXG4gIGZvciByb3cgaW4gc2NhblJvd3Mgd2hlbiB0b2tlbml6ZWRMaW5lID0gZ2V0VG9rZW5pemVkTGluZUZvclJvdyhlZGl0b3IsIHJvdylcbiAgICBjb2x1bW4gPSAwXG4gICAgcmVzdWx0cyA9IFtdXG5cbiAgICB0b2tlbkl0ZXJhdG9yID0gdG9rZW5pemVkTGluZS5nZXRUb2tlbkl0ZXJhdG9yKClcbiAgICBmb3IgdGFnIGluIHRva2VuaXplZExpbmUudGFnc1xuICAgICAgdG9rZW5JdGVyYXRvci5uZXh0KClcbiAgICAgIGlmIHRhZyA8IDAgIyBOZWdhdGl2ZTogc3RhcnQvc3RvcCB0b2tlblxuICAgICAgICBzY29wZSA9IGF0b20uZ3JhbW1hcnMuc2NvcGVGb3JJZCh0YWcpXG4gICAgICAgIGlmICh0YWcgJSAyKSBpcyAwICMgRXZlbjogc2NvcGUgc3RvcFxuICAgICAgICAgIG51bGxcbiAgICAgICAgZWxzZSAjIE9kZDogc2NvcGUgc3RhcnRcbiAgICAgICAgICBwb3NpdGlvbiA9IG5ldyBQb2ludChyb3csIGNvbHVtbilcbiAgICAgICAgICByZXN1bHRzLnB1c2gge3Njb3BlLCBwb3NpdGlvbiwgc3RvcH1cbiAgICAgIGVsc2VcbiAgICAgICAgY29sdW1uICs9IHRhZ1xuXG4gICAgcmVzdWx0cyA9IHJlc3VsdHMuZmlsdGVyKGlzVmFsaWRUb2tlbilcbiAgICByZXN1bHRzLnJldmVyc2UoKSBpZiBkaXJlY3Rpb24gaXMgJ2JhY2t3YXJkJ1xuICAgIGZvciByZXN1bHQgaW4gcmVzdWx0c1xuICAgICAgZm4ocmVzdWx0KVxuICAgICAgcmV0dXJuIHVubGVzcyBjb250aW51ZVNjYW5cbiAgICByZXR1cm4gdW5sZXNzIGNvbnRpbnVlU2NhblxuXG5kZXRlY3RTY29wZVN0YXJ0UG9zaXRpb25Gb3JTY29wZSA9IChlZGl0b3IsIGZyb21Qb2ludCwgZGlyZWN0aW9uLCBzY29wZSkgLT5cbiAgcG9pbnQgPSBudWxsXG4gIHNjYW5Gb3JTY29wZVN0YXJ0IGVkaXRvciwgZnJvbVBvaW50LCBkaXJlY3Rpb24sIChpbmZvKSAtPlxuICAgIGlmIGluZm8uc2NvcGUuc2VhcmNoKHNjb3BlKSA+PSAwXG4gICAgICBpbmZvLnN0b3AoKVxuICAgICAgcG9pbnQgPSBpbmZvLnBvc2l0aW9uXG4gIHBvaW50XG5cbmlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gICMgW0ZJWE1FXSBCdWcgb2YgdXBzdHJlYW0/XG4gICMgU29tZXRpbWUgdG9rZW5pemVkTGluZXMgbGVuZ3RoIGlzIGxlc3MgdGhhbiBsYXN0IGJ1ZmZlciByb3cuXG4gICMgU28gdG9rZW5pemVkTGluZSBpcyBub3QgYWNjZXNzaWJsZSBldmVuIGlmIHZhbGlkIHJvdy5cbiAgIyBJbiB0aGF0IGNhc2UgSSBzaW1wbHkgcmV0dXJuIGVtcHR5IEFycmF5LlxuICBpZiB0b2tlbml6ZWRMaW5lID0gZ2V0VG9rZW5pemVkTGluZUZvclJvdyhlZGl0b3IsIHJvdylcbiAgICBnZXRTY29wZXNGb3JUb2tlbml6ZWRMaW5lKHRva2VuaXplZExpbmUpLnNvbWUgKHNjb3BlKSAtPlxuICAgICAgaXNGdW5jdGlvblNjb3BlKGVkaXRvciwgc2NvcGUpXG4gIGVsc2VcbiAgICBmYWxzZVxuXG4jIFtGSVhNRV0gdmVyeSByb3VnaCBzdGF0ZSwgbmVlZCBpbXByb3ZlbWVudC5cbmlzRnVuY3Rpb25TY29wZSA9IChlZGl0b3IsIHNjb3BlKSAtPlxuICBzd2l0Y2ggZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWVcbiAgICB3aGVuICdzb3VyY2UuZ28nLCAnc291cmNlLmVsaXhpcidcbiAgICAgIHNjb3BlcyA9IFsnZW50aXR5Lm5hbWUuZnVuY3Rpb24nXVxuICAgIHdoZW4gJ3NvdXJjZS5ydWJ5J1xuICAgICAgc2NvcGVzID0gWydtZXRhLmZ1bmN0aW9uLicsICdtZXRhLmNsYXNzLicsICdtZXRhLm1vZHVsZS4nXVxuICAgIGVsc2VcbiAgICAgIHNjb3BlcyA9IFsnbWV0YS5mdW5jdGlvbi4nLCAnbWV0YS5jbGFzcy4nXVxuICBwYXR0ZXJuID0gbmV3IFJlZ0V4cCgnXicgKyBzY29wZXMubWFwKF8uZXNjYXBlUmVnRXhwKS5qb2luKCd8JykpXG4gIHBhdHRlcm4udGVzdChzY29wZSlcblxuIyBTY3JvbGwgdG8gYnVmZmVyUG9zaXRpb24gd2l0aCBtaW5pbXVtIGFtb3VudCB0byBrZWVwIG9yaWdpbmFsIHZpc2libGUgYXJlYS5cbiMgSWYgdGFyZ2V0IHBvc2l0aW9uIHdvbid0IGZpdCB3aXRoaW4gb25lUGFnZVVwIG9yIG9uZVBhZ2VEb3duLCBpdCBjZW50ZXIgdGFyZ2V0IHBvaW50Llxuc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQpIC0+XG4gIGVkaXRvckVsZW1lbnQgPSBlZGl0b3IuZWxlbWVudFxuICBlZGl0b3JBcmVhSGVpZ2h0ID0gZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpICogKGVkaXRvci5nZXRSb3dzUGVyUGFnZSgpIC0gMSlcbiAgb25lUGFnZVVwID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSAtIGVkaXRvckFyZWFIZWlnaHQgIyBObyBuZWVkIHRvIGxpbWl0IHRvIG1pbj0wXG4gIG9uZVBhZ2VEb3duID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxCb3R0b20oKSArIGVkaXRvckFyZWFIZWlnaHRcbiAgdGFyZ2V0ID0gZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24ocG9pbnQpLnRvcFxuXG4gIGNlbnRlciA9IChvbmVQYWdlRG93biA8IHRhcmdldCkgb3IgKHRhcmdldCA8IG9uZVBhZ2VVcClcbiAgZWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24ocG9pbnQsIHtjZW50ZXJ9KVxuXG5tYXRjaFNjb3BlcyA9IChlZGl0b3JFbGVtZW50LCBzY29wZXMpIC0+XG4gIGNsYXNzZXMgPSBzY29wZXMubWFwIChzY29wZSkgLT4gc2NvcGUuc3BsaXQoJy4nKVxuXG4gIGZvciBjbGFzc05hbWVzIGluIGNsYXNzZXNcbiAgICBjb250YWluc0NvdW50ID0gMFxuICAgIGZvciBjbGFzc05hbWUgaW4gY2xhc3NOYW1lc1xuICAgICAgY29udGFpbnNDb3VudCArPSAxIGlmIGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSlcbiAgICByZXR1cm4gdHJ1ZSBpZiBjb250YWluc0NvdW50IGlzIGNsYXNzTmFtZXMubGVuZ3RoXG4gIGZhbHNlXG5cbmlzU2luZ2xlTGluZVRleHQgPSAodGV4dCkgLT5cbiAgdGV4dC5zcGxpdCgvXFxufFxcclxcbi8pLmxlbmd0aCBpcyAxXG5cbiMgUmV0dXJuIGJ1ZmZlclJhbmdlIGFuZCBraW5kIFsnd2hpdGUtc3BhY2UnLCAnbm9uLXdvcmQnLCAnd29yZCddXG4jXG4jIFRoaXMgZnVuY3Rpb24gbW9kaWZ5IHdvcmRSZWdleCBzbyB0aGF0IGl0IGZlZWwgTkFUVVJBTCBpbiBWaW0ncyBub3JtYWwgbW9kZS5cbiMgSW4gbm9ybWFsLW1vZGUsIGN1cnNvciBpcyByYWN0YW5nbGUobm90IHBpcGUofCkgY2hhcikuXG4jIEN1cnNvciBpcyBsaWtlIE9OIHdvcmQgcmF0aGVyIHRoYW4gQkVUV0VFTiB3b3JkLlxuIyBUaGUgbW9kaWZpY2F0aW9uIGlzIHRhaWxvcmQgbGlrZSB0aGlzXG4jICAgLSBPTiB3aGl0ZS1zcGFjZTogSW5jbHVkcyBvbmx5IHdoaXRlLXNwYWNlcy5cbiMgICAtIE9OIG5vbi13b3JkOiBJbmNsdWRzIG9ubHkgbm9uIHdvcmQgY2hhcig9ZXhjbHVkZXMgbm9ybWFsIHdvcmQgY2hhcikuXG4jXG4jIFZhbGlkIG9wdGlvbnNcbiMgIC0gd29yZFJlZ2V4OiBpbnN0YW5jZSBvZiBSZWdFeHBcbiMgIC0gbm9uV29yZENoYXJhY3RlcnM6IHN0cmluZ1xuZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgb3B0aW9ucz17fSkgLT5cbiAge3NpbmdsZU5vbldvcmRDaGFyLCB3b3JkUmVnZXgsIG5vbldvcmRDaGFyYWN0ZXJzLCBjdXJzb3J9ID0gb3B0aW9uc1xuICBpZiBub3Qgd29yZFJlZ2V4PyBvciBub3Qgbm9uV29yZENoYXJhY3RlcnM/ICMgQ29tcGxlbWVudCBmcm9tIGN1cnNvclxuICAgIGN1cnNvciA/PSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAge3dvcmRSZWdleCwgbm9uV29yZENoYXJhY3RlcnN9ID0gXy5leHRlbmQob3B0aW9ucywgYnVpbGRXb3JkUGF0dGVybkJ5Q3Vyc29yKGN1cnNvciwgb3B0aW9ucykpXG4gIHNpbmdsZU5vbldvcmRDaGFyID89IHRydWVcblxuICBjaGFyYWN0ZXJBdFBvaW50ID0gZ2V0UmlnaHRDaGFyYWN0ZXJGb3JCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50KVxuICBub25Xb3JkUmVnZXggPSBuZXcgUmVnRXhwKFwiWyN7Xy5lc2NhcGVSZWdFeHAobm9uV29yZENoYXJhY3RlcnMpfV0rXCIpXG5cbiAgaWYgL1xccy8udGVzdChjaGFyYWN0ZXJBdFBvaW50KVxuICAgIHNvdXJjZSA9IFwiW1xcdCBdK1wiXG4gICAga2luZCA9ICd3aGl0ZS1zcGFjZSdcbiAgICB3b3JkUmVnZXggPSBuZXcgUmVnRXhwKHNvdXJjZSlcbiAgZWxzZSBpZiBub25Xb3JkUmVnZXgudGVzdChjaGFyYWN0ZXJBdFBvaW50KSBhbmQgbm90IHdvcmRSZWdleC50ZXN0KGNoYXJhY3RlckF0UG9pbnQpXG4gICAga2luZCA9ICdub24td29yZCdcbiAgICBpZiBzaW5nbGVOb25Xb3JkQ2hhclxuICAgICAgc291cmNlID0gXy5lc2NhcGVSZWdFeHAoY2hhcmFjdGVyQXRQb2ludClcbiAgICAgIHdvcmRSZWdleCA9IG5ldyBSZWdFeHAoc291cmNlKVxuICAgIGVsc2VcbiAgICAgIHdvcmRSZWdleCA9IG5vbldvcmRSZWdleFxuICBlbHNlXG4gICAga2luZCA9ICd3b3JkJ1xuXG4gIHJhbmdlID0gZ2V0V29yZEJ1ZmZlclJhbmdlQXRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50LCB7d29yZFJlZ2V4fSlcbiAge2tpbmQsIHJhbmdlfVxuXG5nZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgb3B0aW9ucz17fSkgLT5cbiAgYm91bmRhcml6ZUZvcldvcmQgPSBvcHRpb25zLmJvdW5kYXJpemVGb3JXb3JkID8gdHJ1ZVxuICBkZWxldGUgb3B0aW9ucy5ib3VuZGFyaXplRm9yV29yZFxuICB7cmFuZ2UsIGtpbmR9ID0gZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24oZWRpdG9yLCBwb2ludCwgb3B0aW9ucylcbiAgdGV4dCA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgcGF0dGVybiA9IF8uZXNjYXBlUmVnRXhwKHRleHQpXG5cbiAgaWYga2luZCBpcyAnd29yZCcgYW5kIGJvdW5kYXJpemVGb3JXb3JkXG4gICAgIyBTZXQgd29yZC1ib3VuZGFyeSggXFxiICkgYW5jaG9yIG9ubHkgd2hlbiBpdCdzIGVmZmVjdGl2ZSAjNjg5XG4gICAgc3RhcnRCb3VuZGFyeSA9IGlmIC9eXFx3Ly50ZXN0KHRleHQpIHRoZW4gXCJcXFxcYlwiIGVsc2UgJydcbiAgICBlbmRCb3VuZGFyeSA9IGlmIC9cXHckLy50ZXN0KHRleHQpIHRoZW4gXCJcXFxcYlwiIGVsc2UgJydcbiAgICBwYXR0ZXJuID0gc3RhcnRCb3VuZGFyeSArIHBhdHRlcm4gKyBlbmRCb3VuZGFyeVxuICBuZXcgUmVnRXhwKHBhdHRlcm4sICdnJylcblxuZ2V0U3Vid29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIG9wdGlvbnM9e30pIC0+XG4gIG9wdGlvbnMgPSB7d29yZFJlZ2V4OiBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLnN1YndvcmRSZWdFeHAoKSwgYm91bmRhcml6ZUZvcldvcmQ6IGZhbHNlfVxuICBnZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24oZWRpdG9yLCBwb2ludCwgb3B0aW9ucylcblxuIyBSZXR1cm4gb3B0aW9ucyB1c2VkIGZvciBnZXRXb3JkQnVmZmVyUmFuZ2VBdEJ1ZmZlclBvc2l0aW9uXG5idWlsZFdvcmRQYXR0ZXJuQnlDdXJzb3IgPSAoY3Vyc29yLCB7d29yZFJlZ2V4fSkgLT5cbiAgbm9uV29yZENoYXJhY3RlcnMgPSBnZXROb25Xb3JkQ2hhcmFjdGVyc0ZvckN1cnNvcihjdXJzb3IpXG4gIHdvcmRSZWdleCA/PSBuZXcgUmVnRXhwKFwiXltcXHQgXSokfFteXFxcXHMje18uZXNjYXBlUmVnRXhwKG5vbldvcmRDaGFyYWN0ZXJzKX1dK1wiKVxuICB7d29yZFJlZ2V4LCBub25Xb3JkQ2hhcmFjdGVyc31cblxuZ2V0QmVnaW5uaW5nT2ZXb3JkQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwge3dvcmRSZWdleH09e30pIC0+XG4gIHNjYW5SYW5nZSA9IFtbcG9pbnQucm93LCAwXSwgcG9pbnRdXG5cbiAgZm91bmQgPSBudWxsXG4gIGVkaXRvci5iYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSB3b3JkUmVnZXgsIHNjYW5SYW5nZSwgKHtyYW5nZSwgbWF0Y2hUZXh0LCBzdG9wfSkgLT5cbiAgICByZXR1cm4gaWYgbWF0Y2hUZXh0IGlzICcnIGFuZCByYW5nZS5zdGFydC5jb2x1bW4gaXNudCAwXG5cbiAgICBpZiByYW5nZS5zdGFydC5pc0xlc3NUaGFuKHBvaW50KVxuICAgICAgaWYgcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW5PckVxdWFsKHBvaW50KVxuICAgICAgICBmb3VuZCA9IHJhbmdlLnN0YXJ0XG4gICAgICBzdG9wKClcblxuICBmb3VuZCA/IHBvaW50XG5cbmdldEVuZE9mV29yZEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIHt3b3JkUmVnZXh9PXt9KSAtPlxuICBzY2FuUmFuZ2UgPSBbcG9pbnQsIFtwb2ludC5yb3csIEluZmluaXR5XV1cblxuICBmb3VuZCA9IG51bGxcbiAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIHdvcmRSZWdleCwgc2NhblJhbmdlLCAoe3JhbmdlLCBtYXRjaFRleHQsIHN0b3B9KSAtPlxuICAgIHJldHVybiBpZiBtYXRjaFRleHQgaXMgJycgYW5kIHJhbmdlLnN0YXJ0LmNvbHVtbiBpc250IDBcblxuICAgIGlmIHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKHBvaW50KVxuICAgICAgaWYgcmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbk9yRXF1YWwocG9pbnQpXG4gICAgICAgIGZvdW5kID0gcmFuZ2UuZW5kXG4gICAgICBzdG9wKClcblxuICBmb3VuZCA/IHBvaW50XG5cbmdldFdvcmRCdWZmZXJSYW5nZUF0QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb3NpdGlvbiwgb3B0aW9ucz17fSkgLT5cbiAgZW5kUG9zaXRpb24gPSBnZXRFbmRPZldvcmRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvc2l0aW9uLCBvcHRpb25zKVxuICBzdGFydFBvc2l0aW9uID0gZ2V0QmVnaW5uaW5nT2ZXb3JkQnVmZmVyUG9zaXRpb24oZWRpdG9yLCBlbmRQb3NpdGlvbiwgb3B0aW9ucylcbiAgbmV3IFJhbmdlKHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uKVxuXG4jIFdoZW4gcmFuZ2UgaXMgbGluZXdpc2UgcmFuZ2UsIHJhbmdlIGVuZCBoYXZlIGNvbHVtbiAwIG9mIE5FWFQgcm93LlxuIyBXaGljaCBpcyB2ZXJ5IHVuaW50dWl0aXZlIGFuZCB1bndhbnRlZCByZXN1bHQuXG5zaHJpbmtSYW5nZUVuZFRvQmVmb3JlTmV3TGluZSA9IChyYW5nZSkgLT5cbiAge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgaWYgZW5kLmNvbHVtbiBpcyAwXG4gICAgZW5kUm93ID0gbGltaXROdW1iZXIoZW5kLnJvdyAtIDEsIG1pbjogc3RhcnQucm93KVxuICAgIG5ldyBSYW5nZShzdGFydCwgW2VuZFJvdywgSW5maW5pdHldKVxuICBlbHNlXG4gICAgcmFuZ2Vcblxuc2NhbkVkaXRvciA9IChlZGl0b3IsIHBhdHRlcm4pIC0+XG4gIHJhbmdlcyA9IFtdXG4gIGVkaXRvci5zY2FuIHBhdHRlcm4sICh7cmFuZ2V9KSAtPlxuICAgIHJhbmdlcy5wdXNoKHJhbmdlKVxuICByYW5nZXNcblxuY29sbGVjdFJhbmdlSW5CdWZmZXJSb3cgPSAoZWRpdG9yLCByb3csIHBhdHRlcm4pIC0+XG4gIHJhbmdlcyA9IFtdXG4gIHNjYW5SYW5nZSA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpXG4gIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZSBwYXR0ZXJuLCBzY2FuUmFuZ2UsICh7cmFuZ2V9KSAtPlxuICAgIHJhbmdlcy5wdXNoKHJhbmdlKVxuICByYW5nZXNcblxuZmluZFJhbmdlSW5CdWZmZXJSb3cgPSAoZWRpdG9yLCBwYXR0ZXJuLCByb3csIHtkaXJlY3Rpb259PXt9KSAtPlxuICBpZiBkaXJlY3Rpb24gaXMgJ2JhY2t3YXJkJ1xuICAgIHNjYW5GdW5jdGlvbk5hbWUgPSAnYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UnXG4gIGVsc2VcbiAgICBzY2FuRnVuY3Rpb25OYW1lID0gJ3NjYW5JbkJ1ZmZlclJhbmdlJ1xuXG4gIHJhbmdlID0gbnVsbFxuICBzY2FuUmFuZ2UgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KVxuICBlZGl0b3Jbc2NhbkZ1bmN0aW9uTmFtZV0gcGF0dGVybiwgc2NhblJhbmdlLCAoZXZlbnQpIC0+IHJhbmdlID0gZXZlbnQucmFuZ2VcbiAgcmFuZ2VcblxuZ2V0TGFyZ2VzdEZvbGRSYW5nZUNvbnRhaW5zQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICBtYXJrZXJzID0gZWRpdG9yLmRpc3BsYXlMYXllci5mb2xkc01hcmtlckxheWVyLmZpbmRNYXJrZXJzKGludGVyc2VjdHNSb3c6IHJvdylcblxuICBzdGFydFBvaW50ID0gbnVsbFxuICBlbmRQb2ludCA9IG51bGxcblxuICBmb3IgbWFya2VyIGluIG1hcmtlcnMgPyBbXVxuICAgIHtzdGFydCwgZW5kfSA9IG1hcmtlci5nZXRSYW5nZSgpXG4gICAgdW5sZXNzIHN0YXJ0UG9pbnRcbiAgICAgIHN0YXJ0UG9pbnQgPSBzdGFydFxuICAgICAgZW5kUG9pbnQgPSBlbmRcbiAgICAgIGNvbnRpbnVlXG5cbiAgICBpZiBzdGFydC5pc0xlc3NUaGFuKHN0YXJ0UG9pbnQpXG4gICAgICBzdGFydFBvaW50ID0gc3RhcnRcbiAgICAgIGVuZFBvaW50ID0gZW5kXG5cbiAgaWYgc3RhcnRQb2ludD8gYW5kIGVuZFBvaW50P1xuICAgIG5ldyBSYW5nZShzdGFydFBvaW50LCBlbmRQb2ludClcblxuIyB0YWtlIGJ1ZmZlclBvc2l0aW9uXG50cmFuc2xhdGVQb2ludEFuZENsaXAgPSAoZWRpdG9yLCBwb2ludCwgZGlyZWN0aW9uKSAtPlxuICBwb2ludCA9IFBvaW50LmZyb21PYmplY3QocG9pbnQpXG5cbiAgZG9udENsaXAgPSBmYWxzZVxuICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAnZm9yd2FyZCdcbiAgICAgIHBvaW50ID0gcG9pbnQudHJhbnNsYXRlKFswLCArMV0pXG4gICAgICBlb2wgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocG9pbnQucm93KS5lbmRcblxuICAgICAgaWYgcG9pbnQuaXNFcXVhbChlb2wpXG4gICAgICAgIGRvbnRDbGlwID0gdHJ1ZVxuICAgICAgZWxzZSBpZiBwb2ludC5pc0dyZWF0ZXJUaGFuKGVvbClcbiAgICAgICAgZG9udENsaXAgPSB0cnVlXG4gICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50LnJvdyArIDEsIDApICMgbW92ZSBwb2ludCB0byBuZXctbGluZSBzZWxlY3RlZCBwb2ludFxuXG4gICAgICBwb2ludCA9IFBvaW50Lm1pbihwb2ludCwgZWRpdG9yLmdldEVvZkJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgICB3aGVuICdiYWNrd2FyZCdcbiAgICAgIHBvaW50ID0gcG9pbnQudHJhbnNsYXRlKFswLCAtMV0pXG5cbiAgICAgIGlmIHBvaW50LmNvbHVtbiA8IDBcbiAgICAgICAgZG9udENsaXAgPSB0cnVlXG4gICAgICAgIG5ld1JvdyA9IHBvaW50LnJvdyAtIDFcbiAgICAgICAgZW9sID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KG5ld1JvdykuZW5kXG4gICAgICAgIHBvaW50ID0gbmV3IFBvaW50KG5ld1JvdywgZW9sLmNvbHVtbilcblxuICAgICAgcG9pbnQgPSBQb2ludC5tYXgocG9pbnQsIFBvaW50LlpFUk8pXG5cbiAgaWYgZG9udENsaXBcbiAgICBwb2ludFxuICBlbHNlXG4gICAgc2NyZWVuUG9pbnQgPSBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihwb2ludCwgY2xpcERpcmVjdGlvbjogZGlyZWN0aW9uKVxuICAgIGVkaXRvci5idWZmZXJQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHNjcmVlblBvaW50KVxuXG5nZXRSYW5nZUJ5VHJhbnNsYXRlUG9pbnRBbmRDbGlwID0gKGVkaXRvciwgcmFuZ2UsIHdoaWNoLCBkaXJlY3Rpb24pIC0+XG4gIG5ld1BvaW50ID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKGVkaXRvciwgcmFuZ2Vbd2hpY2hdLCBkaXJlY3Rpb24pXG4gIHN3aXRjaCB3aGljaFxuICAgIHdoZW4gJ3N0YXJ0J1xuICAgICAgbmV3IFJhbmdlKG5ld1BvaW50LCByYW5nZS5lbmQpXG4gICAgd2hlbiAnZW5kJ1xuICAgICAgbmV3IFJhbmdlKHJhbmdlLnN0YXJ0LCBuZXdQb2ludClcblxuZ2V0UGFja2FnZSA9IChuYW1lLCBmbikgLT5cbiAgbmV3IFByb21pc2UgKHJlc29sdmUpIC0+XG4gICAgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUobmFtZSlcbiAgICAgIHBrZyA9IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZShuYW1lKVxuICAgICAgcmVzb2x2ZShwa2cpXG4gICAgZWxzZVxuICAgICAgZGlzcG9zYWJsZSA9IGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZVBhY2thZ2UgKHBrZykgLT5cbiAgICAgICAgaWYgcGtnLm5hbWUgaXMgbmFtZVxuICAgICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICAgICAgcmVzb2x2ZShwa2cpXG5cbnNlYXJjaEJ5UHJvamVjdEZpbmQgPSAoZWRpdG9yLCB0ZXh0KSAtPlxuICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvci5lbGVtZW50LCAncHJvamVjdC1maW5kOnNob3cnKVxuICBnZXRQYWNrYWdlKCdmaW5kLWFuZC1yZXBsYWNlJykudGhlbiAocGtnKSAtPlxuICAgIHtwcm9qZWN0RmluZFZpZXd9ID0gcGtnLm1haW5Nb2R1bGVcbiAgICBpZiBwcm9qZWN0RmluZFZpZXc/XG4gICAgICBwcm9qZWN0RmluZFZpZXcuZmluZEVkaXRvci5zZXRUZXh0KHRleHQpXG4gICAgICBwcm9qZWN0RmluZFZpZXcuY29uZmlybSgpXG5cbmxpbWl0TnVtYmVyID0gKG51bWJlciwge21heCwgbWlufT17fSkgLT5cbiAgbnVtYmVyID0gTWF0aC5taW4obnVtYmVyLCBtYXgpIGlmIG1heD9cbiAgbnVtYmVyID0gTWF0aC5tYXgobnVtYmVyLCBtaW4pIGlmIG1pbj9cbiAgbnVtYmVyXG5cbmZpbmRSYW5nZUNvbnRhaW5zUG9pbnQgPSAocmFuZ2VzLCBwb2ludCkgLT5cbiAgZm9yIHJhbmdlIGluIHJhbmdlcyB3aGVuIHJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpXG4gICAgcmV0dXJuIHJhbmdlXG4gIG51bGxcblxubmVnYXRlRnVuY3Rpb24gPSAoZm4pIC0+XG4gIChhcmdzLi4uKSAtPlxuICAgIG5vdCBmbihhcmdzLi4uKVxuXG5pc0VtcHR5ID0gKHRhcmdldCkgLT4gdGFyZ2V0LmlzRW1wdHkoKVxuaXNOb3RFbXB0eSA9IG5lZ2F0ZUZ1bmN0aW9uKGlzRW1wdHkpXG5cbmlzU2luZ2xlTGluZVJhbmdlID0gKHJhbmdlKSAtPiByYW5nZS5pc1NpbmdsZUxpbmUoKVxuaXNOb3RTaW5nbGVMaW5lUmFuZ2UgPSBuZWdhdGVGdW5jdGlvbihpc1NpbmdsZUxpbmVSYW5nZSlcblxuaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlID0gKGVkaXRvciwgcmFuZ2UpIC0+IC9eW1xcdCBdKiQvLnRlc3QoZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKSlcbmlzTm90TGVhZGluZ1doaXRlU3BhY2VSYW5nZSA9IG5lZ2F0ZUZ1bmN0aW9uKGlzTGVhZGluZ1doaXRlU3BhY2VSYW5nZSlcblxuaXNFc2NhcGVkQ2hhclJhbmdlID0gKGVkaXRvciwgcmFuZ2UpIC0+XG4gIHJhbmdlID0gUmFuZ2UuZnJvbU9iamVjdChyYW5nZSlcbiAgY2hhcnMgPSBnZXRMZWZ0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24oZWRpdG9yLCByYW5nZS5zdGFydCwgMilcbiAgY2hhcnMuZW5kc1dpdGgoJ1xcXFwnKSBhbmQgbm90IGNoYXJzLmVuZHNXaXRoKCdcXFxcXFxcXCcpXG5cbmluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIHRleHQpIC0+XG4gIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbcG9pbnQsIHBvaW50XSwgdGV4dClcblxuZW5zdXJlRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICB1bmxlc3MgaXNFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCByb3cpXG4gICAgZW9sID0gZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KGVkaXRvciwgcm93KVxuICAgIGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgZW9sLCBcIlxcblwiKVxuXG5mb3JFYWNoUGFuZUF4aXMgPSAoZm4sIGJhc2UpIC0+XG4gIGJhc2UgPz0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmdldENvbnRhaW5lcigpLmdldFJvb3QoKVxuICBpZiBiYXNlLmNoaWxkcmVuP1xuICAgIGZuKGJhc2UpXG5cbiAgICBmb3IgY2hpbGQgaW4gYmFzZS5jaGlsZHJlblxuICAgICAgZm9yRWFjaFBhbmVBeGlzKGZuLCBjaGlsZClcblxubW9kaWZ5Q2xhc3NMaXN0ID0gKGFjdGlvbiwgZWxlbWVudCwgY2xhc3NOYW1lcy4uLikgLT5cbiAgZWxlbWVudC5jbGFzc0xpc3RbYWN0aW9uXShjbGFzc05hbWVzLi4uKVxuXG5hZGRDbGFzc0xpc3QgPSBtb2RpZnlDbGFzc0xpc3QuYmluZChudWxsLCAnYWRkJylcbnJlbW92ZUNsYXNzTGlzdCA9IG1vZGlmeUNsYXNzTGlzdC5iaW5kKG51bGwsICdyZW1vdmUnKVxudG9nZ2xlQ2xhc3NMaXN0ID0gbW9kaWZ5Q2xhc3NMaXN0LmJpbmQobnVsbCwgJ3RvZ2dsZScpXG5cbnRvZ2dsZUNhc2VGb3JDaGFyYWN0ZXIgPSAoY2hhcikgLT5cbiAgY2hhckxvd2VyID0gY2hhci50b0xvd2VyQ2FzZSgpXG4gIGlmIGNoYXJMb3dlciBpcyBjaGFyXG4gICAgY2hhci50b1VwcGVyQ2FzZSgpXG4gIGVsc2VcbiAgICBjaGFyTG93ZXJcblxuc3BsaXRUZXh0QnlOZXdMaW5lID0gKHRleHQpIC0+XG4gIGlmIHRleHQuZW5kc1dpdGgoXCJcXG5cIilcbiAgICB0ZXh0LnRyaW1SaWdodCgpLnNwbGl0KC9cXHI/XFxuL2cpXG4gIGVsc2VcbiAgICB0ZXh0LnNwbGl0KC9cXHI/XFxuL2cpXG5cbnJlcGxhY2VEZWNvcmF0aW9uQ2xhc3NCeSA9IChmbiwgZGVjb3JhdGlvbikgLT5cbiAgcHJvcHMgPSBkZWNvcmF0aW9uLmdldFByb3BlcnRpZXMoKVxuICBkZWNvcmF0aW9uLnNldFByb3BlcnRpZXMoXy5kZWZhdWx0cyh7Y2xhc3M6IGZuKHByb3BzLmNsYXNzKX0sIHByb3BzKSlcblxuIyBNb2RpZnkgcmFuZ2UgdXNlZCBmb3IgdW5kby9yZWRvIGZsYXNoIGhpZ2hsaWdodCB0byBtYWtlIGl0IGZlZWwgbmF0dXJhbGx5IGZvciBodW1hbi5cbiMgIC0gVHJpbSBzdGFydGluZyBuZXcgbGluZShcIlxcblwiKVxuIyAgICAgXCJcXG5hYmNcIiAtPiBcImFiY1wiXG4jICAtIElmIHJhbmdlLmVuZCBpcyBFT0wgZXh0ZW5kIHJhbmdlIHRvIGZpcnN0IGNvbHVtbiBvZiBuZXh0IGxpbmUuXG4jICAgICBcImFiY1wiIC0+IFwiYWJjXFxuXCJcbiMgZS5nLlxuIyAtIHdoZW4gJ2MnIGlzIGF0RU9MOiBcIlxcbmFiY1wiIC0+IFwiYWJjXFxuXCJcbiMgLSB3aGVuICdjJyBpcyBOT1QgYXRFT0w6IFwiXFxuYWJjXCIgLT4gXCJhYmNcIlxuI1xuIyBTbyBhbHdheXMgdHJpbSBpbml0aWFsIFwiXFxuXCIgcGFydCByYW5nZSBiZWNhdXNlIGZsYXNoaW5nIHRyYWlsaW5nIGxpbmUgaXMgY291bnRlcmludHVpdGl2ZS5cbmh1bWFuaXplQnVmZmVyUmFuZ2UgPSAoZWRpdG9yLCByYW5nZSkgLT5cbiAgaWYgaXNTaW5nbGVMaW5lUmFuZ2UocmFuZ2UpIG9yIGlzTGluZXdpc2VSYW5nZShyYW5nZSlcbiAgICByZXR1cm4gcmFuZ2VcblxuICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICBpZiBwb2ludElzQXRFbmRPZkxpbmUoZWRpdG9yLCBzdGFydClcbiAgICBuZXdTdGFydCA9IHN0YXJ0LnRyYXZlcnNlKFsxLCAwXSlcblxuICBpZiBwb2ludElzQXRFbmRPZkxpbmUoZWRpdG9yLCBlbmQpXG4gICAgbmV3RW5kID0gZW5kLnRyYXZlcnNlKFsxLCAwXSlcblxuICBpZiBuZXdTdGFydD8gb3IgbmV3RW5kP1xuICAgIG5ldyBSYW5nZShuZXdTdGFydCA/IHN0YXJ0LCBuZXdFbmQgPyBlbmQpXG4gIGVsc2VcbiAgICByYW5nZVxuXG4jIEV4cGFuZCByYW5nZSB0byB3aGl0ZSBzcGFjZVxuIyAgMS4gRXhwYW5kIHRvIGZvcndhcmQgZGlyZWN0aW9uLCBpZiBzdWNlZWQgcmV0dXJuIG5ldyByYW5nZS5cbiMgIDIuIEV4cGFuZCB0byBiYWNrd2FyZCBkaXJlY3Rpb24sIGlmIHN1Y2NlZWQgcmV0dXJuIG5ldyByYW5nZS5cbiMgIDMuIFdoZW4gZmFpbGQgdG8gZXhwYW5kIGVpdGhlciBkaXJlY3Rpb24sIHJldHVybiBvcmlnaW5hbCByYW5nZS5cbmV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlcyA9IChlZGl0b3IsIHJhbmdlKSAtPlxuICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuXG4gIG5ld0VuZCA9IG51bGxcbiAgc2NhblJhbmdlID0gW2VuZCwgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KGVkaXRvciwgZW5kLnJvdyldXG4gIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZSAvXFxTLywgc2NhblJhbmdlLCAoe3JhbmdlfSkgLT4gbmV3RW5kID0gcmFuZ2Uuc3RhcnRcblxuICBpZiBuZXdFbmQ/LmlzR3JlYXRlclRoYW4oZW5kKVxuICAgIHJldHVybiBuZXcgUmFuZ2Uoc3RhcnQsIG5ld0VuZClcblxuICBuZXdTdGFydCA9IG51bGxcbiAgc2NhblJhbmdlID0gW1tzdGFydC5yb3csIDBdLCByYW5nZS5zdGFydF1cbiAgZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlIC9cXFMvLCBzY2FuUmFuZ2UsICh7cmFuZ2V9KSAtPiBuZXdTdGFydCA9IHJhbmdlLmVuZFxuXG4gIGlmIG5ld1N0YXJ0Py5pc0xlc3NUaGFuKHN0YXJ0KVxuICAgIHJldHVybiBuZXcgUmFuZ2UobmV3U3RhcnQsIGVuZClcblxuICByZXR1cm4gcmFuZ2UgIyBmYWxsYmFja1xuXG4jIFNwbGl0IGFuZCBqb2luIGFmdGVyIG11dGF0ZSBpdGVtIGJ5IGNhbGxiYWNrIHdpdGgga2VlcCBvcmlnaW5hbCBzZXBhcmF0b3IgdW5jaGFuZ2VkLlxuI1xuIyAxLiBUcmltIGxlYWRpbmcgYW5kIHRyYWlubGluZyB3aGl0ZSBzcGFjZXMgYW5kIHJlbWVtYmVyXG4jIDEuIFNwbGl0IHRleHQgd2l0aCBnaXZlbiBwYXR0ZXJuIGFuZCByZW1lbWJlciBvcmlnaW5hbCBzZXBhcmF0b3JzLlxuIyAyLiBDaGFuZ2Ugb3JkZXIgYnkgY2FsbGJhY2tcbiMgMy4gSm9pbiB3aXRoIG9yaWdpbmFsIHNwZWFyYXRvciBhbmQgY29uY2F0IHdpdGggcmVtZW1iZXJlZCBsZWFkaW5nIGFuZCB0cmFpbmxpbmcgd2hpdGUgc3BhY2VzLlxuI1xuc3BsaXRBbmRKb2luQnkgPSAodGV4dCwgcGF0dGVybiwgZm4pIC0+XG4gIGxlYWRpbmdTcGFjZXMgPSB0cmFpbGluZ1NwYWNlcyA9ICcnXG4gIHN0YXJ0ID0gdGV4dC5zZWFyY2goL1xcUy8pXG4gIGVuZCA9IHRleHQuc2VhcmNoKC9cXHMqJC8pXG4gIGxlYWRpbmdTcGFjZXMgPSB0cmFpbGluZ1NwYWNlcyA9ICcnXG4gIGxlYWRpbmdTcGFjZXMgPSB0ZXh0WzAuLi5zdGFydF0gaWYgc3RhcnQgaXNudCAtMVxuICB0cmFpbGluZ1NwYWNlcyA9IHRleHRbZW5kLi4uXSBpZiBlbmQgaXNudCAtMVxuICB0ZXh0ID0gdGV4dFtzdGFydC4uLmVuZF1cblxuICBmbGFncyA9ICdnJ1xuICBmbGFncyArPSAnaScgaWYgcGF0dGVybi5pZ25vcmVDYXNlXG4gIHJlZ2V4cCA9IG5ldyBSZWdFeHAoXCIoI3twYXR0ZXJuLnNvdXJjZX0pXCIsIGZsYWdzKVxuICAjIGUuZy5cbiAgIyBXaGVuIHRleHQgPSBcImEsIGIsIGNcIiwgcGF0dGVybiA9IC8sP1xccysvXG4gICMgICBpdGVtcyA9IFsnYScsICdiJywgJ2MnXSwgc3BlYXJhdG9ycyA9IFsnLCAnLCAnLCAnXVxuICAjIFdoZW4gdGV4dCA9IFwiYSBiXFxuIGNcIiwgcGF0dGVybiA9IC8sP1xccysvXG4gICMgICBpdGVtcyA9IFsnYScsICdiJywgJ2MnXSwgc3BlYXJhdG9ycyA9IFsnICcsICdcXG4gJ11cbiAgaXRlbXMgPSBbXVxuICBzZXBhcmF0b3JzID0gW11cbiAgZm9yIHNlZ21lbnQsIGkgaW4gdGV4dC5zcGxpdChyZWdleHApXG4gICAgaWYgaSAlIDIgaXMgMFxuICAgICAgaXRlbXMucHVzaChzZWdtZW50KVxuICAgIGVsc2VcbiAgICAgIHNlcGFyYXRvcnMucHVzaChzZWdtZW50KVxuICBzZXBhcmF0b3JzLnB1c2goJycpXG4gIGl0ZW1zID0gZm4oaXRlbXMpXG4gIHJlc3VsdCA9ICcnXG4gIGZvciBbaXRlbSwgc2VwYXJhdG9yXSBpbiBfLnppcChpdGVtcywgc2VwYXJhdG9ycylcbiAgICByZXN1bHQgKz0gaXRlbSArIHNlcGFyYXRvclxuICBsZWFkaW5nU3BhY2VzICsgcmVzdWx0ICsgdHJhaWxpbmdTcGFjZXNcblxuY2xhc3MgQXJndW1lbnRzU3BsaXR0ZXJcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGFsbFRva2VucyA9IFtdXG4gICAgQGN1cnJlbnRTZWN0aW9uID0gbnVsbFxuXG4gIHNldHRsZVBlbmRpbmc6IC0+XG4gICAgaWYgQHBlbmRpbmdUb2tlblxuICAgICAgQGFsbFRva2Vucy5wdXNoKHt0ZXh0OiBAcGVuZGluZ1Rva2VuLCB0eXBlOiBAY3VycmVudFNlY3Rpb259KVxuICAgICAgQHBlbmRpbmdUb2tlbiA9ICcnXG5cbiAgY2hhbmdlU2VjdGlvbjogKG5ld1NlY3Rpb24pIC0+XG4gICAgaWYgQGN1cnJlbnRTZWN0aW9uIGlzbnQgbmV3U2VjdGlvblxuICAgICAgQHNldHRsZVBlbmRpbmcoKSBpZiBAY3VycmVudFNlY3Rpb25cbiAgICAgIEBjdXJyZW50U2VjdGlvbiA9IG5ld1NlY3Rpb25cblxuc3BsaXRBcmd1bWVudHMgPSAodGV4dCwgam9pblNwYWNlU2VwYXJhdGVkVG9rZW4pIC0+XG4gIGpvaW5TcGFjZVNlcGFyYXRlZFRva2VuID89IHRydWVcbiAgc2VwYXJhdG9yQ2hhcnMgPSBcIlxcdCwgXFxyXFxuXCJcbiAgcXVvdGVDaGFycyA9IFwiXFxcIidgXCJcbiAgY2xvc2VDaGFyVG9PcGVuQ2hhciA9IHtcbiAgICBcIilcIjogXCIoXCJcbiAgICBcIn1cIjogXCJ7XCJcbiAgICBcIl1cIjogXCJbXCJcbiAgfVxuICBjbG9zZVBhaXJDaGFycyA9IF8ua2V5cyhjbG9zZUNoYXJUb09wZW5DaGFyKS5qb2luKCcnKVxuICBvcGVuUGFpckNoYXJzID0gXy52YWx1ZXMoY2xvc2VDaGFyVG9PcGVuQ2hhcikuam9pbignJylcbiAgZXNjYXBlQ2hhciA9IFwiXFxcXFwiXG5cbiAgcGVuZGluZ1Rva2VuID0gJydcbiAgaW5RdW90ZSA9IGZhbHNlXG4gIGlzRXNjYXBlZCA9IGZhbHNlXG4gICMgUGFyc2UgdGV4dCBhcyBsaXN0IG9mIHRva2VucyB3aGljaCBpcyBjb21tbWEgc2VwYXJhdGVkIG9yIHdoaXRlIHNwYWNlIHNlcGFyYXRlZC5cbiAgIyBlLmcuICdhLCBmdW4xKGIsIGMpLCBkJyA9PiBbJ2EnLCAnZnVuMShiLCBjKSwgJ2QnXVxuICAjIE5vdCBwZXJmZWN0LiBidXQgZmFyIGJldHRlciB0aGFuIHNpbXBsZSBzdHJpbmcgc3BsaXQgYnkgcmVnZXggcGF0dGVybi5cbiAgYWxsVG9rZW5zID0gW11cbiAgY3VycmVudFNlY3Rpb24gPSBudWxsXG5cbiAgc2V0dGxlUGVuZGluZyA9IC0+XG4gICAgaWYgcGVuZGluZ1Rva2VuXG4gICAgICBhbGxUb2tlbnMucHVzaCh7dGV4dDogcGVuZGluZ1Rva2VuLCB0eXBlOiBjdXJyZW50U2VjdGlvbn0pXG4gICAgICBwZW5kaW5nVG9rZW4gPSAnJ1xuXG4gIGNoYW5nZVNlY3Rpb24gPSAobmV3U2VjdGlvbikgLT5cbiAgICBpZiBjdXJyZW50U2VjdGlvbiBpc250IG5ld1NlY3Rpb25cbiAgICAgIHNldHRsZVBlbmRpbmcoKSBpZiBjdXJyZW50U2VjdGlvblxuICAgICAgY3VycmVudFNlY3Rpb24gPSBuZXdTZWN0aW9uXG5cbiAgcGFpclN0YWNrID0gW11cbiAgZm9yIGNoYXIgaW4gdGV4dFxuICAgIGlmIChwYWlyU3RhY2subGVuZ3RoIGlzIDApIGFuZCAoY2hhciBpbiBzZXBhcmF0b3JDaGFycylcbiAgICAgIGNoYW5nZVNlY3Rpb24oJ3NlcGFyYXRvcicpXG4gICAgZWxzZVxuICAgICAgY2hhbmdlU2VjdGlvbignYXJndW1lbnQnKVxuICAgICAgaWYgaXNFc2NhcGVkXG4gICAgICAgIGlzRXNjYXBlZCA9IGZhbHNlXG4gICAgICBlbHNlIGlmIGNoYXIgaXMgZXNjYXBlQ2hhclxuICAgICAgICBpc0VzY2FwZWQgPSB0cnVlXG4gICAgICBlbHNlIGlmIGluUXVvdGVcbiAgICAgICAgaWYgKGNoYXIgaW4gcXVvdGVDaGFycykgYW5kIF8ubGFzdChwYWlyU3RhY2spIGlzIGNoYXJcbiAgICAgICAgICBwYWlyU3RhY2sucG9wKClcbiAgICAgICAgICBpblF1b3RlID0gZmFsc2VcbiAgICAgIGVsc2UgaWYgY2hhciBpbiBxdW90ZUNoYXJzXG4gICAgICAgIGluUXVvdGUgPSB0cnVlXG4gICAgICAgIHBhaXJTdGFjay5wdXNoKGNoYXIpXG4gICAgICBlbHNlIGlmIGNoYXIgaW4gb3BlblBhaXJDaGFyc1xuICAgICAgICBwYWlyU3RhY2sucHVzaChjaGFyKVxuICAgICAgZWxzZSBpZiBjaGFyIGluIGNsb3NlUGFpckNoYXJzXG4gICAgICAgIHBhaXJTdGFjay5wb3AoKSBpZiBfLmxhc3QocGFpclN0YWNrKSBpcyBjbG9zZUNoYXJUb09wZW5DaGFyW2NoYXJdXG5cbiAgICBwZW5kaW5nVG9rZW4gKz0gY2hhclxuICBzZXR0bGVQZW5kaW5nKClcblxuICBpZiBqb2luU3BhY2VTZXBhcmF0ZWRUb2tlbiBhbmQgYWxsVG9rZW5zLnNvbWUoKHt0eXBlLCB0ZXh0fSkgLT4gdHlwZSBpcyAnc2VwYXJhdG9yJyBhbmQgJywnIGluIHRleHQpXG4gICAgIyBXaGVuIHNvbWUgc2VwYXJhdG9yIGNvbnRhaW5zIGAsYCB0cmVhdCB3aGl0ZS1zcGFjZSBzZXBhcmF0b3IgaXMganVzdCBwYXJ0IG9mIHRva2VuLlxuICAgICMgU28gd2UgbW92ZSB3aGl0ZS1zcGFjZSBvbmx5IHNwYXJhdG9yIGludG8gdG9rZW5zIGJ5IGpvaW5pbmcgbWlzLXNlcGFyYXRvZWQgdG9rZW5zLlxuICAgIG5ld0FsbFRva2VucyA9IFtdXG4gICAgd2hpbGUgYWxsVG9rZW5zLmxlbmd0aFxuICAgICAgdG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgc3dpdGNoIHRva2VuLnR5cGVcbiAgICAgICAgd2hlbiAnYXJndW1lbnQnXG4gICAgICAgICAgbmV3QWxsVG9rZW5zLnB1c2godG9rZW4pXG4gICAgICAgIHdoZW4gJ3NlcGFyYXRvcidcbiAgICAgICAgICBpZiAnLCcgaW4gdG9rZW4udGV4dFxuICAgICAgICAgICAgbmV3QWxsVG9rZW5zLnB1c2godG9rZW4pXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyAxLiBDb25jYXRuYXRlIHdoaXRlLXNwYWNlLXNlcGFyYXRvciBhbmQgbmV4dC1hcmd1bWVudFxuICAgICAgICAgICAgIyAyLiBUaGVuIGpvaW4gaW50byBsYXRlc3QgYXJndW1lbnRcbiAgICAgICAgICAgIGxhc3RBcmcgPSBuZXdBbGxUb2tlbnMucG9wKCkgPyB7dGV4dDogJycsICdhcmd1bWVudCd9XG4gICAgICAgICAgICBsYXN0QXJnLnRleHQgKz0gdG9rZW4udGV4dCArIChhbGxUb2tlbnMuc2hpZnQoKT8udGV4dCA/ICcnKSAjIGNvbmNhdCB3aXRoIG5leHQtYXJndW1lbnRcbiAgICAgICAgICAgIG5ld0FsbFRva2Vucy5wdXNoKGxhc3RBcmcpXG4gICAgYWxsVG9rZW5zID0gbmV3QWxsVG9rZW5zXG4gIGFsbFRva2Vuc1xuXG5zY2FuRWRpdG9ySW5EaXJlY3Rpb24gPSAoZWRpdG9yLCBkaXJlY3Rpb24sIHBhdHRlcm4sIG9wdGlvbnM9e30sIGZuKSAtPlxuICB7YWxsb3dOZXh0TGluZSwgZnJvbSwgc2NhblJhbmdlfSA9IG9wdGlvbnNcbiAgaWYgbm90IGZyb20/IGFuZCBub3Qgc2NhblJhbmdlP1xuICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IGVpdGhlciBvZiAnZnJvbScgb3IgJ3NjYW5SYW5nZScgb3B0aW9uc1wiKVxuXG4gIGlmIHNjYW5SYW5nZVxuICAgIGFsbG93TmV4dExpbmUgPSB0cnVlXG4gIGVsc2VcbiAgICBhbGxvd05leHRMaW5lID89IHRydWVcbiAgZnJvbSA9IFBvaW50LmZyb21PYmplY3QoZnJvbSkgaWYgZnJvbT9cbiAgc3dpdGNoIGRpcmVjdGlvblxuICAgIHdoZW4gJ2ZvcndhcmQnXG4gICAgICBzY2FuUmFuZ2UgPz0gbmV3IFJhbmdlKGZyb20sIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKGVkaXRvcikpXG4gICAgICBzY2FuRnVuY3Rpb24gPSAnc2NhbkluQnVmZmVyUmFuZ2UnXG4gICAgd2hlbiAnYmFja3dhcmQnXG4gICAgICBzY2FuUmFuZ2UgPz0gbmV3IFJhbmdlKFswLCAwXSwgZnJvbSlcbiAgICAgIHNjYW5GdW5jdGlvbiA9ICdiYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSdcblxuICBlZGl0b3Jbc2NhbkZ1bmN0aW9uXSBwYXR0ZXJuLCBzY2FuUmFuZ2UsIChldmVudCkgLT5cbiAgICBpZiBub3QgYWxsb3dOZXh0TGluZSBhbmQgZXZlbnQucmFuZ2Uuc3RhcnQucm93IGlzbnQgZnJvbS5yb3dcbiAgICAgIGV2ZW50LnN0b3AoKVxuICAgICAgcmV0dXJuXG4gICAgZm4oZXZlbnQpXG5cbmFkanVzdEluZGVudFdpdGhLZWVwaW5nTGF5b3V0ID0gKGVkaXRvciwgcmFuZ2UpIC0+XG4gICMgQWRqdXN0IGluZGVudExldmVsIHdpdGgga2VlcGluZyBvcmlnaW5hbCBsYXlvdXQgb2YgcGFzdGluZyB0ZXh0LlxuICAjIFN1Z2dlc3RlZCBpbmRlbnQgbGV2ZWwgb2YgcmFuZ2Uuc3RhcnQucm93IGlzIGNvcnJlY3QgYXMgbG9uZyBhcyByYW5nZS5zdGFydC5yb3cgaGF2ZSBtaW5pbXVtIGluZGVudCBsZXZlbC5cbiAgIyBCdXQgd2hlbiB3ZSBwYXN0ZSBmb2xsb3dpbmcgYWxyZWFkeSBpbmRlbnRlZCB0aHJlZSBsaW5lIHRleHQsIHdlIGhhdmUgdG8gYWRqdXN0IGluZGVudCBsZXZlbFxuICAjICBzbyB0aGF0IGB2YXJGb3J0eVR3b2AgbGluZSBoYXZlIHN1Z2dlc3RlZEluZGVudExldmVsLlxuICAjXG4gICMgICAgICAgIHZhck9uZTogdmFsdWUgIyBzdWdnZXN0ZWRJbmRlbnRMZXZlbCBpcyBkZXRlcm1pbmVkIGJ5IHRoaXMgbGluZVxuICAjICAgdmFyRm9ydHlUd286IHZhbHVlICMgV2UgbmVlZCB0byBtYWtlIGZpbmFsIGluZGVudCBsZXZlbCBvZiB0aGlzIHJvdyB0byBiZSBzdWdnZXN0ZWRJbmRlbnRMZXZlbC5cbiAgIyAgICAgIHZhclRocmVlOiB2YWx1ZVxuICAjXG4gICMgU28gd2hhdCB3ZSBhcmUgZG9pbmcgaGVyZSBpcyBhcHBseSBzdWdnZXN0ZWRJbmRlbnRMZXZlbCB3aXRoIGZpeGluZyBpc3N1ZSBhYm92ZS5cbiAgIyAxLiBEZXRlcm1pbmUgbWluaW11bSBpbmRlbnQgbGV2ZWwgYW1vbmcgcGFzdGVkIHJhbmdlKD0gcmFuZ2UgKSBleGNsdWRpbmcgZW1wdHkgcm93XG4gICMgMi4gVGhlbiB1cGRhdGUgaW5kZW50TGV2ZWwgb2YgZWFjaCByb3dzIHRvIGZpbmFsIGluZGVudExldmVsIG9mIG1pbmltdW0taW5kZW50ZWQgcm93IGhhdmUgc3VnZ2VzdGVkSW5kZW50TGV2ZWwuXG4gIHN1Z2dlc3RlZExldmVsID0gZWRpdG9yLnN1Z2dlc3RlZEluZGVudEZvckJ1ZmZlclJvdyhyYW5nZS5zdGFydC5yb3cpXG4gIG1pbkxldmVsID0gbnVsbFxuICByb3dBbmRBY3R1YWxMZXZlbHMgPSBbXVxuICBmb3Igcm93IGluIFtyYW5nZS5zdGFydC5yb3cuLi5yYW5nZS5lbmQucm93XVxuICAgIGFjdHVhbExldmVsID0gZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coZWRpdG9yLCByb3cpXG4gICAgcm93QW5kQWN0dWFsTGV2ZWxzLnB1c2goW3JvdywgYWN0dWFsTGV2ZWxdKVxuICAgIHVubGVzcyBpc0VtcHR5Um93KGVkaXRvciwgcm93KVxuICAgICAgbWluTGV2ZWwgPSBNYXRoLm1pbihtaW5MZXZlbCA/IEluZmluaXR5LCBhY3R1YWxMZXZlbClcblxuICBpZiBtaW5MZXZlbD8gYW5kIChkZWx0YVRvU3VnZ2VzdGVkTGV2ZWwgPSBzdWdnZXN0ZWRMZXZlbCAtIG1pbkxldmVsKVxuICAgIGZvciBbcm93LCBhY3R1YWxMZXZlbF0gaW4gcm93QW5kQWN0dWFsTGV2ZWxzXG4gICAgICBuZXdMZXZlbCA9IGFjdHVhbExldmVsICsgZGVsdGFUb1N1Z2dlc3RlZExldmVsXG4gICAgICBlZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93LCBuZXdMZXZlbClcblxuIyBDaGVjayBwb2ludCBjb250YWlubWVudCB3aXRoIGVuZCBwb3NpdGlvbiBleGNsdXNpdmVcbnJhbmdlQ29udGFpbnNQb2ludFdpdGhFbmRFeGNsdXNpdmUgPSAocmFuZ2UsIHBvaW50KSAtPlxuICByYW5nZS5zdGFydC5pc0xlc3NUaGFuT3JFcXVhbChwb2ludCkgYW5kXG4gICAgcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4ocG9pbnQpXG5cbnRyYXZlcnNlVGV4dEZyb21Qb2ludCA9IChwb2ludCwgdGV4dCkgLT5cbiAgcG9pbnQudHJhdmVyc2UoZ2V0VHJhdmVyc2FsRm9yVGV4dCh0ZXh0KSlcblxuZ2V0VHJhdmVyc2FsRm9yVGV4dCA9ICh0ZXh0KSAtPlxuICByb3cgPSAwXG4gIGNvbHVtbiA9IDBcbiAgZm9yIGNoYXIgaW4gdGV4dFxuICAgIGlmIGNoYXIgaXMgXCJcXG5cIlxuICAgICAgcm93KytcbiAgICAgIGNvbHVtbiA9IDBcbiAgICBlbHNlXG4gICAgICBjb2x1bW4rK1xuICBbcm93LCBjb2x1bW5dXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhc3NlcnRXaXRoRXhjZXB0aW9uXG4gIGdldEFuY2VzdG9yc1xuICBnZXRLZXlCaW5kaW5nRm9yQ29tbWFuZFxuICBpbmNsdWRlXG4gIGRlYnVnXG4gIHNhdmVFZGl0b3JTdGF0ZVxuICBpc0xpbmV3aXNlUmFuZ2VcbiAgc29ydFJhbmdlc1xuICBnZXRJbmRleFxuICBnZXRWaXNpYmxlQnVmZmVyUmFuZ2VcbiAgZ2V0VmlzaWJsZUVkaXRvcnNcbiAgcG9pbnRJc0F0RW5kT2ZMaW5lXG4gIHBvaW50SXNPbldoaXRlU3BhY2VcbiAgcG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvd1xuICBwb2ludElzQXRWaW1FbmRPZkZpbGVcbiAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb25cbiAgZ2V0VmltRW9mU2NyZWVuUG9zaXRpb25cbiAgZ2V0VmltTGFzdEJ1ZmZlclJvd1xuICBnZXRWaW1MYXN0U2NyZWVuUm93XG4gIHNldEJ1ZmZlclJvd1xuICBzZXRCdWZmZXJDb2x1bW5cbiAgbW92ZUN1cnNvckxlZnRcbiAgbW92ZUN1cnNvclJpZ2h0XG4gIG1vdmVDdXJzb3JVcFNjcmVlblxuICBtb3ZlQ3Vyc29yRG93blNjcmVlblxuICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3dcbiAgZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93XG4gIGdldExhc3RWaXNpYmxlU2NyZWVuUm93XG4gIGdldFZhbGlkVmltQnVmZmVyUm93XG4gIGdldFZhbGlkVmltU2NyZWVuUm93XG4gIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3dcbiAgZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uXG4gIGdldEluZGVudExldmVsRm9yQnVmZmVyUm93XG4gIGdldFRleHRJblNjcmVlblJhbmdlXG4gIG1vdmVDdXJzb3JUb05leHROb25XaGl0ZXNwYWNlXG4gIGlzRW1wdHlSb3dcbiAgZ2V0Q29kZUZvbGRSb3dSYW5nZXNcbiAgZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3dcbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZVxuICB0cmltUmFuZ2VcbiAgZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvd1xuICBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93XG4gIGRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlXG4gIGdldEJ1ZmZlclJvd3NcbiAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uXG4gIG1hdGNoU2NvcGVzXG4gIGlzU2luZ2xlTGluZVRleHRcbiAgZ2V0V29yZEJ1ZmZlclJhbmdlQXRCdWZmZXJQb3NpdGlvblxuICBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvblxuICBnZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0U3Vid29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uXG4gIGdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yXG4gIHNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lXG4gIHNjYW5FZGl0b3JcbiAgY29sbGVjdFJhbmdlSW5CdWZmZXJSb3dcbiAgZmluZFJhbmdlSW5CdWZmZXJSb3dcbiAgZ2V0TGFyZ2VzdEZvbGRSYW5nZUNvbnRhaW5zQnVmZmVyUm93XG4gIHRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxuICBnZXRSYW5nZUJ5VHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIGdldFBhY2thZ2VcbiAgc2VhcmNoQnlQcm9qZWN0RmluZFxuICBsaW1pdE51bWJlclxuICBmaW5kUmFuZ2VDb250YWluc1BvaW50XG5cbiAgaXNFbXB0eSwgaXNOb3RFbXB0eVxuICBpc1NpbmdsZUxpbmVSYW5nZSwgaXNOb3RTaW5nbGVMaW5lUmFuZ2VcblxuICBpbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvblxuICBlbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3dcbiAgaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlXG4gIGlzTm90TGVhZGluZ1doaXRlU3BhY2VSYW5nZVxuICBpc0VzY2FwZWRDaGFyUmFuZ2VcblxuICBmb3JFYWNoUGFuZUF4aXNcbiAgYWRkQ2xhc3NMaXN0XG4gIHJlbW92ZUNsYXNzTGlzdFxuICB0b2dnbGVDbGFzc0xpc3RcbiAgdG9nZ2xlQ2FzZUZvckNoYXJhY3RlclxuICBzcGxpdFRleHRCeU5ld0xpbmVcbiAgcmVwbGFjZURlY29yYXRpb25DbGFzc0J5XG4gIGh1bWFuaXplQnVmZmVyUmFuZ2VcbiAgZXhwYW5kUmFuZ2VUb1doaXRlU3BhY2VzXG4gIHNwbGl0QW5kSm9pbkJ5XG4gIHNwbGl0QXJndW1lbnRzXG4gIHNjYW5FZGl0b3JJbkRpcmVjdGlvblxuICBhZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dFxuICByYW5nZUNvbnRhaW5zUG9pbnRXaXRoRW5kRXhjbHVzaXZlXG4gIHRyYXZlcnNlVGV4dEZyb21Qb2ludFxufVxuIl19
