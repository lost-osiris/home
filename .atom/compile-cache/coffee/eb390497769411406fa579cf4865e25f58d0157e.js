(function() {
  var AFTERPROPS, AutoIndent, BRACE_CLOSE, BRACE_OPEN, CompositeDisposable, DidInsertText, File, JSXBRACE_CLOSE, JSXBRACE_OPEN, JSXTAG_CLOSE, JSXTAG_CLOSE_ATTRS, JSXTAG_OPEN, JSXTAG_SELFCLOSE_END, JSXTAG_SELFCLOSE_START, JS_ELSE, JS_IF, JS_RETURN, LINEALIGNED, NO_TOKEN, PAREN_CLOSE, PAREN_OPEN, PROPSALIGNED, Point, Range, SWITCH_BRACE_CLOSE, SWITCH_BRACE_OPEN, SWITCH_CASE, SWITCH_DEFAULT, TAGALIGNED, TEMPLATE_END, TEMPLATE_START, TERNARY_ELSE, TERNARY_IF, YAML, autoCompleteJSX, fs, path, ref, stripJsonComments,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, File = ref.File, Range = ref.Range, Point = ref.Point;

  fs = require('fs-plus');

  path = require('path');

  autoCompleteJSX = require('./auto-complete-jsx');

  DidInsertText = require('./did-insert-text');

  stripJsonComments = require('strip-json-comments');

  YAML = require('js-yaml');

  NO_TOKEN = 0;

  JSXTAG_SELFCLOSE_START = 1;

  JSXTAG_SELFCLOSE_END = 2;

  JSXTAG_OPEN = 3;

  JSXTAG_CLOSE_ATTRS = 4;

  JSXTAG_CLOSE = 5;

  JSXBRACE_OPEN = 6;

  JSXBRACE_CLOSE = 7;

  BRACE_OPEN = 8;

  BRACE_CLOSE = 9;

  TERNARY_IF = 10;

  TERNARY_ELSE = 11;

  JS_IF = 12;

  JS_ELSE = 13;

  SWITCH_BRACE_OPEN = 14;

  SWITCH_BRACE_CLOSE = 15;

  SWITCH_CASE = 16;

  SWITCH_DEFAULT = 17;

  JS_RETURN = 18;

  PAREN_OPEN = 19;

  PAREN_CLOSE = 20;

  TEMPLATE_START = 21;

  TEMPLATE_END = 22;

  TAGALIGNED = 'tag-aligned';

  LINEALIGNED = 'line-aligned';

  AFTERPROPS = 'after-props';

  PROPSALIGNED = 'props-aligned';

  module.exports = AutoIndent = (function() {
    function AutoIndent(editor) {
      this.editor = editor;
      this.onMouseUp = bind(this.onMouseUp, this);
      this.onMouseDown = bind(this.onMouseDown, this);
      this.handleOnDidStopChanging = bind(this.handleOnDidStopChanging, this);
      this.changedCursorPosition = bind(this.changedCursorPosition, this);
      this.DidInsertText = new DidInsertText(this.editor);
      this.autoJsx = atom.config.get('language-babel').autoIndentJSX;
      this.JSXREGEXP = /(<)([$_A-Za-z](?:[$_.:\-A-Za-z0-9])*)|(\/>)|(<\/)([$_A-Za-z](?:[$._:\-A-Za-z0-9])*)(>)|(>)|({)|(})|(\?)|(:)|(if)|(else)|(case)|(default)|(return)|(\()|(\))|(`)/g;
      this.mouseUp = true;
      this.multipleCursorTrigger = 1;
      this.disposables = new CompositeDisposable();
      this.eslintIndentOptions = this.getIndentOptions();
      this.templateDepth = 0;
      this.disposables.add(atom.config.observe('language-babel.autoIndentJSX', (function(_this) {
        return function(value) {
          return _this.autoJsx = value;
        };
      })(this)));
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'language-babel:auto-indent-jsx-on': (function(_this) {
          return function(event) {
            _this.autoJsx = true;
            return _this.eslintIndentOptions = _this.getIndentOptions();
          };
        })(this)
      }));
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'language-babel:auto-indent-jsx-off': (function(_this) {
          return function(event) {
            return _this.autoJsx = false;
          };
        })(this)
      }));
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'language-babel:toggle-auto-indent-jsx': (function(_this) {
          return function(event) {
            _this.autoJsx = !_this.autoJsx;
            if (_this.autoJsx) {
              return _this.eslintIndentOptions = _this.getIndentOptions();
            }
          };
        })(this)
      }));
      document.addEventListener('mousedown', this.onMouseDown);
      document.addEventListener('mouseup', this.onMouseUp);
      this.disposables.add(this.editor.onDidChangeCursorPosition((function(_this) {
        return function(event) {
          return _this.changedCursorPosition(event);
        };
      })(this)));
      this.handleOnDidStopChanging();
    }

    AutoIndent.prototype.destroy = function() {
      this.disposables.dispose();
      this.onDidStopChangingHandler.dispose();
      document.removeEventListener('mousedown', this.onMouseDown);
      return document.removeEventListener('mouseup', this.onMouseUp);
    };

    AutoIndent.prototype.changedCursorPosition = function(event) {
      var blankLineEndPos, bufferRow, columnToMoveTo, cursorPosition, cursorPositions, endPointOfJsx, j, len, previousRow, ref1, ref2, startPointOfJsx;
      if (!this.autoJsx) {
        return;
      }
      if (!this.mouseUp) {
        return;
      }
      if (event.oldBufferPosition.row === event.newBufferPosition.row) {
        return;
      }
      bufferRow = event.newBufferPosition.row;
      if (this.editor.hasMultipleCursors()) {
        cursorPositions = this.editor.getCursorBufferPositions();
        if (cursorPositions.length === this.multipleCursorTrigger) {
          this.multipleCursorTrigger = 1;
          bufferRow = 0;
          for (j = 0, len = cursorPositions.length; j < len; j++) {
            cursorPosition = cursorPositions[j];
            if (cursorPosition.row > bufferRow) {
              bufferRow = cursorPosition.row;
            }
          }
        } else {
          this.multipleCursorTrigger++;
          return;
        }
      } else {
        cursorPosition = event.newBufferPosition;
      }
      previousRow = event.oldBufferPosition.row;
      if (this.jsxInScope(previousRow)) {
        blankLineEndPos = (ref1 = /^\s*$/.exec(this.editor.lineTextForBufferRow(previousRow))) != null ? ref1[0].length : void 0;
        if (blankLineEndPos != null) {
          this.indentRow({
            row: previousRow,
            blockIndent: 0
          });
        }
      }
      if (!this.jsxInScope(bufferRow)) {
        return;
      }
      endPointOfJsx = new Point(bufferRow, 0);
      startPointOfJsx = autoCompleteJSX.getStartOfJSX(this.editor, cursorPosition);
      this.indentJSX(new Range(startPointOfJsx, endPointOfJsx));
      columnToMoveTo = (ref2 = /^\s*$/.exec(this.editor.lineTextForBufferRow(bufferRow))) != null ? ref2[0].length : void 0;
      if (columnToMoveTo != null) {
        return this.editor.setCursorBufferPosition([bufferRow, columnToMoveTo]);
      }
    };

    AutoIndent.prototype.didStopChanging = function() {
      var endPointOfJsx, highestRow, lowestRow, selectedRange, startPointOfJsx;
      if (!this.autoJsx) {
        return;
      }
      if (!this.mouseUp) {
        return;
      }
      selectedRange = this.editor.getSelectedBufferRange();
      if (selectedRange.start.row === selectedRange.end.row && selectedRange.start.column === selectedRange.end.column) {
        if (indexOf.call(this.editor.scopeDescriptorForBufferPosition([selectedRange.start.row, selectedRange.start.column]).getScopesArray(), 'JSXStartTagEnd') >= 0) {
          return;
        }
        if (indexOf.call(this.editor.scopeDescriptorForBufferPosition([selectedRange.start.row, selectedRange.start.column]).getScopesArray(), 'JSXEndTagStart') >= 0) {
          return;
        }
      }
      highestRow = Math.max(selectedRange.start.row, selectedRange.end.row);
      lowestRow = Math.min(selectedRange.start.row, selectedRange.end.row);
      this.onDidStopChangingHandler.dispose();
      while (highestRow >= lowestRow) {
        if (this.jsxInScope(highestRow)) {
          endPointOfJsx = new Point(highestRow, 0);
          startPointOfJsx = autoCompleteJSX.getStartOfJSX(this.editor, endPointOfJsx);
          this.indentJSX(new Range(startPointOfJsx, endPointOfJsx));
          highestRow = startPointOfJsx.row - 1;
        } else {
          highestRow = highestRow - 1;
        }
      }
      setTimeout(this.handleOnDidStopChanging, 300);
    };

    AutoIndent.prototype.handleOnDidStopChanging = function() {
      return this.onDidStopChangingHandler = this.editor.onDidStopChanging((function(_this) {
        return function() {
          return _this.didStopChanging();
        };
      })(this));
    };

    AutoIndent.prototype.jsxInScope = function(bufferRow) {
      var scopes;
      scopes = this.editor.scopeDescriptorForBufferPosition([bufferRow, 0]).getScopesArray();
      return indexOf.call(scopes, 'meta.tag.jsx') >= 0;
    };

    AutoIndent.prototype.indentJSX = function(range) {
      var blankLineEndPos, firstCharIndentation, firstTagInLineIndentation, idxOfToken, indent, indentRecalc, isFirstTagOfBlock, isFirstTokenOfLine, j, line, match, matchColumn, matchPointEnd, matchPointStart, matchRange, parentTokenIdx, ref1, ref2, ref3, results, row, stackOfTokensStillOpen, token, tokenIndentation, tokenOnThisLine, tokenStack;
      tokenStack = [];
      idxOfToken = 0;
      stackOfTokensStillOpen = [];
      indent = 0;
      isFirstTagOfBlock = true;
      this.JSXREGEXP.lastIndex = 0;
      this.templateDepth = 0;
      results = [];
      for (row = j = ref1 = range.start.row, ref2 = range.end.row; ref1 <= ref2 ? j <= ref2 : j >= ref2; row = ref1 <= ref2 ? ++j : --j) {
        isFirstTokenOfLine = true;
        tokenOnThisLine = false;
        indentRecalc = false;
        firstTagInLineIndentation = 0;
        line = this.editor.lineTextForBufferRow(row);
        while ((match = this.JSXREGEXP.exec(line)) !== null) {
          matchColumn = match.index;
          matchPointStart = new Point(row, matchColumn);
          matchPointEnd = new Point(row, matchColumn + match[0].length - 1);
          matchRange = new Range(matchPointStart, matchPointEnd);
          if (row === range.start.row && matchColumn < range.start.column) {
            continue;
          }
          if (!(token = this.getToken(row, match))) {
            continue;
          }
          firstCharIndentation = this.editor.indentationForBufferRow(row);
          if (this.editor.getSoftTabs()) {
            tokenIndentation = matchColumn / this.editor.getTabLength();
          } else {
            tokenIndentation = (function(editor) {
              var charsFound, hardTabsFound, i, k, ref3;
              this.editor = editor;
              hardTabsFound = charsFound = 0;
              for (i = k = 0, ref3 = matchColumn; 0 <= ref3 ? k < ref3 : k > ref3; i = 0 <= ref3 ? ++k : --k) {
                if ((line.substr(i, 1)) === '\t') {
                  hardTabsFound++;
                } else {
                  charsFound++;
                }
              }
              return hardTabsFound + (charsFound / this.editor.getTabLength());
            })(this.editor);
          }
          switch (token) {
            case JSXTAG_OPEN:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (isFirstTagOfBlock && (parentTokenIdx != null) && (tokenStack[parentTokenIdx].type === BRACE_OPEN || tokenStack[parentTokenIdx].type === JSXBRACE_OPEN)) {
                  firstTagInLineIndentation = tokenIndentation;
                  firstCharIndentation = this.eslintIndentOptions.jsxIndent[1] + tokenStack[parentTokenIdx].firstCharIndentation;
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: firstCharIndentation
                  });
                } else if (isFirstTagOfBlock && (parentTokenIdx != null)) {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: this.getIndentOfPreviousRow(row),
                    jsxIndent: 1
                  });
                } else if ((parentTokenIdx != null) && this.ternaryTerminatesPreviousLine(row)) {
                  firstTagInLineIndentation = tokenIndentation;
                  firstCharIndentation = this.getIndentOfPreviousRow(row);
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: firstCharIndentation
                  });
                } else if (parentTokenIdx != null) {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                    jsxIndent: 1
                  });
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              isFirstTagOfBlock = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: JSXTAG_OPEN,
                name: match[2],
                row: row,
                firstTagInLineIndentation: firstTagInLineIndentation,
                tokenIndentation: tokenIndentation,
                firstCharIndentation: firstCharIndentation,
                parentTokenIdx: parentTokenIdx,
                termsThisTagsAttributesIdx: null,
                termsThisTagIdx: null
              });
              stackOfTokensStillOpen.push(idxOfToken);
              idxOfToken++;
              break;
            case JSXTAG_CLOSE:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                indentRecalc = this.indentRow({
                  row: row,
                  blockIndent: tokenStack[parentTokenIdx].firstCharIndentation
                });
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              isFirstTagOfBlock = false;
              parentTokenIdx = stackOfTokensStillOpen.pop();
              tokenStack.push({
                type: JSXTAG_CLOSE,
                name: match[5],
                row: row,
                parentTokenIdx: parentTokenIdx
              });
              if (parentTokenIdx >= 0) {
                tokenStack[parentTokenIdx].termsThisTagIdx = idxOfToken;
              }
              idxOfToken++;
              break;
            case JSXTAG_SELFCLOSE_END:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                indentRecalc = this.indentForClosingBracket(row, tokenStack[parentTokenIdx], this.eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing);
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = false;
              isFirstTokenOfLine = false;
              parentTokenIdx = stackOfTokensStillOpen.pop();
              tokenStack.push({
                type: JSXTAG_SELFCLOSE_END,
                name: tokenStack[parentTokenIdx].name,
                row: row,
                parentTokenIdx: parentTokenIdx
              });
              if (parentTokenIdx >= 0) {
                tokenStack[parentTokenIdx].termsThisTagsAttributesIdx = idxOfToken;
                tokenStack[parentTokenIdx].type = JSXTAG_SELFCLOSE_START;
                tokenStack[parentTokenIdx].termsThisTagIdx = idxOfToken;
              }
              idxOfToken++;
              break;
            case JSXTAG_CLOSE_ATTRS:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                indentRecalc = this.indentForClosingBracket(row, tokenStack[parentTokenIdx], this.eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty);
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = false;
              isFirstTokenOfLine = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: JSXTAG_CLOSE_ATTRS,
                name: tokenStack[parentTokenIdx].name,
                row: row,
                parentTokenIdx: parentTokenIdx
              });
              if (parentTokenIdx >= 0) {
                tokenStack[parentTokenIdx].termsThisTagsAttributesIdx = idxOfToken;
              }
              idxOfToken++;
              break;
            case JSXBRACE_OPEN:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (parentTokenIdx != null) {
                  if (tokenStack[parentTokenIdx].type === JSXTAG_OPEN && tokenStack[parentTokenIdx].termsThisTagsAttributesIdx === null) {
                    indentRecalc = this.indentRow({
                      row: row,
                      blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                      jsxIndentProps: 1
                    });
                  } else {
                    indentRecalc = this.indentRow({
                      row: row,
                      blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                      jsxIndent: 1
                    });
                  }
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = true;
              isFirstTokenOfLine = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: token,
                name: '',
                row: row,
                firstTagInLineIndentation: firstTagInLineIndentation,
                tokenIndentation: tokenIndentation,
                firstCharIndentation: firstCharIndentation,
                parentTokenIdx: parentTokenIdx,
                termsThisTagsAttributesIdx: null,
                termsThisTagIdx: null
              });
              stackOfTokensStillOpen.push(idxOfToken);
              idxOfToken++;
              break;
            case TERNARY_IF:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                if (firstCharIndentation === tokenIndentation) {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: this.getIndentOfPreviousRow(row),
                    jsxIndent: 1
                  });
                } else {
                  stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                  if (parentTokenIdx != null) {
                    if (tokenStack[parentTokenIdx].type === JSXTAG_OPEN && tokenStack[parentTokenIdx].termsThisTagsAttributesIdx === null) {
                      indentRecalc = this.indentRow({
                        row: row,
                        blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                        jsxIndentProps: 1
                      });
                    } else {
                      indentRecalc = this.indentRow({
                        row: row,
                        blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                        jsxIndent: 1
                      });
                    }
                  }
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = true;
              isFirstTokenOfLine = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: token,
                name: '',
                row: row,
                firstTagInLineIndentation: firstTagInLineIndentation,
                tokenIndentation: tokenIndentation,
                firstCharIndentation: firstCharIndentation,
                parentTokenIdx: parentTokenIdx,
                termsThisTagsAttributesIdx: null,
                termsThisTagIdx: null
              });
              stackOfTokensStillOpen.push(idxOfToken);
              idxOfToken++;
              break;
            case JSXBRACE_CLOSE:
            case TERNARY_ELSE:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                indentRecalc = this.indentRow({
                  row: row,
                  blockIndent: tokenStack[parentTokenIdx].firstCharIndentation
                });
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = false;
              isFirstTokenOfLine = false;
              parentTokenIdx = stackOfTokensStillOpen.pop();
              tokenStack.push({
                type: token,
                name: '',
                row: row,
                parentTokenIdx: parentTokenIdx
              });
              if (parentTokenIdx >= 0) {
                tokenStack[parentTokenIdx].termsThisTagIdx = idxOfToken;
              }
              idxOfToken++;
              break;
            case BRACE_OPEN:
            case SWITCH_BRACE_OPEN:
            case PAREN_OPEN:
            case TEMPLATE_START:
              tokenOnThisLine = true;
              if (token === TEMPLATE_START) {
                this.templateDepth++;
              }
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (isFirstTagOfBlock && (parentTokenIdx != null) && tokenStack[parentTokenIdx].type === token && tokenStack[parentTokenIdx].row === (row - 1)) {
                  tokenIndentation = firstCharIndentation = this.eslintIndentOptions.jsxIndent[1] + this.getIndentOfPreviousRow(row);
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: firstCharIndentation
                  });
                } else if ((parentTokenIdx != null) && this.ternaryTerminatesPreviousLine(row)) {
                  firstTagInLineIndentation = tokenIndentation;
                  firstCharIndentation = this.getIndentOfPreviousRow(row);
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: firstCharIndentation
                  });
                } else if (parentTokenIdx != null) {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                    jsxIndent: 1
                  });
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: token,
                name: '',
                row: row,
                firstTagInLineIndentation: firstTagInLineIndentation,
                tokenIndentation: tokenIndentation,
                firstCharIndentation: firstCharIndentation,
                parentTokenIdx: parentTokenIdx,
                termsThisTagsAttributesIdx: null,
                termsThisTagIdx: null
              });
              stackOfTokensStillOpen.push(idxOfToken);
              idxOfToken++;
              break;
            case BRACE_CLOSE:
            case SWITCH_BRACE_CLOSE:
            case PAREN_CLOSE:
            case TEMPLATE_END:
              if (token === SWITCH_BRACE_CLOSE) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (tokenStack[parentTokenIdx].type === SWITCH_CASE || tokenStack[parentTokenIdx].type === SWITCH_DEFAULT) {
                  stackOfTokensStillOpen.pop();
                }
              }
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (parentTokenIdx != null) {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: tokenStack[parentTokenIdx].firstCharIndentation
                  });
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              parentTokenIdx = stackOfTokensStillOpen.pop();
              if (parentTokenIdx != null) {
                tokenStack.push({
                  type: token,
                  name: '',
                  row: row,
                  parentTokenIdx: parentTokenIdx
                });
                if (parentTokenIdx >= 0) {
                  tokenStack[parentTokenIdx].termsThisTagIdx = idxOfToken;
                }
                idxOfToken++;
              }
              if (token === TEMPLATE_END) {
                this.templateDepth--;
              }
              break;
            case SWITCH_CASE:
            case SWITCH_DEFAULT:
              tokenOnThisLine = true;
              isFirstTagOfBlock = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (parentTokenIdx != null) {
                  if (tokenStack[parentTokenIdx].type === SWITCH_CASE || tokenStack[parentTokenIdx].type === SWITCH_DEFAULT) {
                    indentRecalc = this.indentRow({
                      row: row,
                      blockIndent: tokenStack[parentTokenIdx].firstCharIndentation
                    });
                    stackOfTokensStillOpen.pop();
                  } else if (tokenStack[parentTokenIdx].type === SWITCH_BRACE_OPEN) {
                    indentRecalc = this.indentRow({
                      row: row,
                      blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                      jsxIndent: 1
                    });
                  }
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: token,
                name: '',
                row: row,
                firstTagInLineIndentation: firstTagInLineIndentation,
                tokenIndentation: tokenIndentation,
                firstCharIndentation: firstCharIndentation,
                parentTokenIdx: parentTokenIdx,
                termsThisTagsAttributesIdx: null,
                termsThisTagIdx: null
              });
              stackOfTokensStillOpen.push(idxOfToken);
              idxOfToken++;
              break;
            case JS_IF:
            case JS_ELSE:
            case JS_RETURN:
              isFirstTagOfBlock = true;
          }
        }
        if (idxOfToken && !tokenOnThisLine) {
          if (row !== range.end.row) {
            blankLineEndPos = (ref3 = /^\s*$/.exec(this.editor.lineTextForBufferRow(row))) != null ? ref3[0].length : void 0;
            if (blankLineEndPos != null) {
              results.push(this.indentRow({
                row: row,
                blockIndent: 0
              }));
            } else {
              results.push(this.indentUntokenisedLine(row, tokenStack, stackOfTokensStillOpen));
            }
          } else {
            results.push(this.indentUntokenisedLine(row, tokenStack, stackOfTokensStillOpen));
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    AutoIndent.prototype.indentUntokenisedLine = function(row, tokenStack, stackOfTokensStillOpen) {
      var parentTokenIdx, token;
      stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
      if (parentTokenIdx == null) {
        return;
      }
      token = tokenStack[parentTokenIdx];
      switch (token.type) {
        case JSXTAG_OPEN:
        case JSXTAG_SELFCLOSE_START:
          if (token.termsThisTagsAttributesIdx === null) {
            return this.indentRow({
              row: row,
              blockIndent: token.firstCharIndentation,
              jsxIndentProps: 1
            });
          } else {
            return this.indentRow({
              row: row,
              blockIndent: token.firstCharIndentation,
              jsxIndent: 1
            });
          }
          break;
        case JSXBRACE_OPEN:
        case TERNARY_IF:
          return this.indentRow({
            row: row,
            blockIndent: token.firstCharIndentation,
            jsxIndent: 1,
            allowAdditionalIndents: true
          });
        case BRACE_OPEN:
        case SWITCH_BRACE_OPEN:
        case PAREN_OPEN:
          return this.indentRow({
            row: row,
            blockIndent: token.firstCharIndentation,
            jsxIndent: 1,
            allowAdditionalIndents: true
          });
        case JSXTAG_SELFCLOSE_END:
        case JSXBRACE_CLOSE:
        case JSXTAG_CLOSE_ATTRS:
        case TERNARY_ELSE:
          return this.indentRow({
            row: row,
            blockIndent: tokenStack[token.parentTokenIdx].firstCharIndentation,
            jsxIndentProps: 1
          });
        case BRACE_CLOSE:
        case SWITCH_BRACE_CLOSE:
        case PAREN_CLOSE:
          return this.indentRow({
            row: row,
            blockIndent: tokenStack[token.parentTokenIdx].firstCharIndentation,
            jsxIndent: 1,
            allowAdditionalIndents: true
          });
        case SWITCH_CASE:
        case SWITCH_DEFAULT:
          return this.indentRow({
            row: row,
            blockIndent: token.firstCharIndentation,
            jsxIndent: 1
          });
        case TEMPLATE_START:
        case TEMPLATE_END:
      }
    };

    AutoIndent.prototype.getToken = function(bufferRow, match) {
      var scope;
      scope = this.editor.scopeDescriptorForBufferPosition([bufferRow, match.index]).getScopesArray().pop();
      if ('punctuation.definition.tag.jsx' === scope) {
        if (match[1] != null) {
          return JSXTAG_OPEN;
        } else if (match[3] != null) {
          return JSXTAG_SELFCLOSE_END;
        }
      } else if ('JSXEndTagStart' === scope) {
        if (match[4] != null) {
          return JSXTAG_CLOSE;
        }
      } else if ('JSXStartTagEnd' === scope) {
        if (match[7] != null) {
          return JSXTAG_CLOSE_ATTRS;
        }
      } else if (match[8] != null) {
        if ('punctuation.section.embedded.begin.jsx' === scope) {
          return JSXBRACE_OPEN;
        } else if ('meta.brace.curly.switchStart.js' === scope) {
          return SWITCH_BRACE_OPEN;
        } else if ('meta.brace.curly.js' === scope || 'meta.brace.curly.litobj.js' === scope) {
          return BRACE_OPEN;
        }
      } else if (match[9] != null) {
        if ('punctuation.section.embedded.end.jsx' === scope) {
          return JSXBRACE_CLOSE;
        } else if ('meta.brace.curly.switchEnd.js' === scope) {
          return SWITCH_BRACE_CLOSE;
        } else if ('meta.brace.curly.js' === scope || 'meta.brace.curly.litobj.js' === scope) {
          return BRACE_CLOSE;
        }
      } else if (match[10] != null) {
        if ('keyword.operator.ternary.js' === scope) {
          return TERNARY_IF;
        }
      } else if (match[11] != null) {
        if ('keyword.operator.ternary.js' === scope) {
          return TERNARY_ELSE;
        }
      } else if (match[12] != null) {
        if ('keyword.control.conditional.js' === scope) {
          return JS_IF;
        }
      } else if (match[13] != null) {
        if ('keyword.control.conditional.js' === scope) {
          return JS_ELSE;
        }
      } else if (match[14] != null) {
        if ('keyword.control.switch.js' === scope) {
          return SWITCH_CASE;
        }
      } else if (match[15] != null) {
        if ('keyword.control.switch.js' === scope) {
          return SWITCH_DEFAULT;
        }
      } else if (match[16] != null) {
        if ('keyword.control.flow.js' === scope) {
          return JS_RETURN;
        }
      } else if (match[17] != null) {
        if ('meta.brace.round.js' === scope || 'meta.brace.round.graphql' === scope || 'meta.brace.round.directive.graphql' === scope) {
          return PAREN_OPEN;
        }
      } else if (match[18] != null) {
        if ('meta.brace.round.js' === scope || 'meta.brace.round.graphql' === scope || 'meta.brace.round.directive.graphql' === scope) {
          return PAREN_CLOSE;
        }
      } else if (match[19] != null) {
        if ('punctuation.definition.quasi.begin.js' === scope) {
          return TEMPLATE_START;
        }
        if ('punctuation.definition.quasi.end.js' === scope) {
          return TEMPLATE_END;
        }
      }
      return NO_TOKEN;
    };

    AutoIndent.prototype.getIndentOfPreviousRow = function(row) {
      var j, line, ref1;
      if (!row) {
        return 0;
      }
      for (row = j = ref1 = row - 1; ref1 <= 0 ? j < 0 : j > 0; row = ref1 <= 0 ? ++j : --j) {
        line = this.editor.lineTextForBufferRow(row);
        if (/.*\S/.test(line)) {
          return this.editor.indentationForBufferRow(row);
        }
      }
      return 0;
    };

    AutoIndent.prototype.getIndentOptions = function() {
      var eslintrcFilename;
      if (!this.autoJsx) {
        return this.translateIndentOptions();
      }
      if (eslintrcFilename = this.getEslintrcFilename()) {
        eslintrcFilename = new File(eslintrcFilename);
        return this.translateIndentOptions(this.readEslintrcOptions(eslintrcFilename.getPath()));
      } else {
        return this.translateIndentOptions({});
      }
    };

    AutoIndent.prototype.getEslintrcFilename = function() {
      var projectContainingSource;
      projectContainingSource = atom.project.relativizePath(this.editor.getPath());
      if (projectContainingSource[0] != null) {
        return path.join(projectContainingSource[0], '.eslintrc');
      }
    };

    AutoIndent.prototype.onMouseDown = function() {
      return this.mouseUp = false;
    };

    AutoIndent.prototype.onMouseUp = function() {
      return this.mouseUp = true;
    };

    AutoIndent.prototype.readEslintrcOptions = function(eslintrcFile) {
      var err, eslintRules, fileContent;
      if (fs.existsSync(eslintrcFile)) {
        fileContent = stripJsonComments(fs.readFileSync(eslintrcFile, 'utf8'));
        try {
          eslintRules = (YAML.safeLoad(fileContent)).rules;
          if (eslintRules) {
            return eslintRules;
          }
        } catch (error) {
          err = error;
          atom.notifications.addError("LB: Error reading .eslintrc at " + eslintrcFile, {
            dismissable: true,
            detail: "" + err.message
          });
        }
      }
      return {};
    };

    AutoIndent.prototype.translateIndentOptions = function(eslintRules) {
      var ES_DEFAULT_INDENT, defaultIndent, eslintIndentOptions, rule;
      eslintIndentOptions = {
        jsxIndent: [1, 1],
        jsxIndentProps: [1, 1],
        jsxClosingBracketLocation: [
          1, {
            selfClosing: TAGALIGNED,
            nonEmpty: TAGALIGNED
          }
        ]
      };
      if (typeof eslintRules !== "object") {
        return eslintIndentOptions;
      }
      ES_DEFAULT_INDENT = 4;
      rule = eslintRules['indent'];
      if (typeof rule === 'number' || typeof rule === 'string') {
        defaultIndent = ES_DEFAULT_INDENT / this.editor.getTabLength();
      } else if (typeof rule === 'object') {
        if (typeof rule[1] === 'number') {
          defaultIndent = rule[1] / this.editor.getTabLength();
        } else {
          defaultIndent = 1;
        }
      } else {
        defaultIndent = 1;
      }
      rule = eslintRules['react/jsx-indent'];
      if (typeof rule === 'number' || typeof rule === 'string') {
        eslintIndentOptions.jsxIndent[0] = rule;
        eslintIndentOptions.jsxIndent[1] = ES_DEFAULT_INDENT / this.editor.getTabLength();
      } else if (typeof rule === 'object') {
        eslintIndentOptions.jsxIndent[0] = rule[0];
        if (typeof rule[1] === 'number') {
          eslintIndentOptions.jsxIndent[1] = rule[1] / this.editor.getTabLength();
        } else {
          eslintIndentOptions.jsxIndent[1] = 1;
        }
      } else {
        eslintIndentOptions.jsxIndent[1] = defaultIndent;
      }
      rule = eslintRules['react/jsx-indent-props'];
      if (typeof rule === 'number' || typeof rule === 'string') {
        eslintIndentOptions.jsxIndentProps[0] = rule;
        eslintIndentOptions.jsxIndentProps[1] = ES_DEFAULT_INDENT / this.editor.getTabLength();
      } else if (typeof rule === 'object') {
        eslintIndentOptions.jsxIndentProps[0] = rule[0];
        if (typeof rule[1] === 'number') {
          eslintIndentOptions.jsxIndentProps[1] = rule[1] / this.editor.getTabLength();
        } else {
          eslintIndentOptions.jsxIndentProps[1] = 1;
        }
      } else {
        eslintIndentOptions.jsxIndentProps[1] = defaultIndent;
      }
      rule = eslintRules['react/jsx-closing-bracket-location'];
      if (typeof rule === 'number' || typeof rule === 'string') {
        eslintIndentOptions.jsxClosingBracketLocation[0] = rule;
      } else if (typeof rule === 'object') {
        eslintIndentOptions.jsxClosingBracketLocation[0] = rule[0];
        if (typeof rule[1] === 'string') {
          eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing = eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty = rule[1];
        } else {
          if (rule[1].selfClosing != null) {
            eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing = rule[1].selfClosing;
          }
          if (rule[1].nonEmpty != null) {
            eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty = rule[1].nonEmpty;
          }
        }
      }
      return eslintIndentOptions;
    };

    AutoIndent.prototype.ternaryTerminatesPreviousLine = function(row) {
      var line, match, scope;
      row--;
      if (!(row >= 0)) {
        return false;
      }
      line = this.editor.lineTextForBufferRow(row);
      match = /:\s*$/.exec(line);
      if (match === null) {
        return false;
      }
      scope = this.editor.scopeDescriptorForBufferPosition([row, match.index]).getScopesArray().pop();
      if (scope !== 'keyword.operator.ternary.js') {
        return false;
      }
      return true;
    };

    AutoIndent.prototype.indentForClosingBracket = function(row, parentTag, closingBracketRule) {
      if (this.eslintIndentOptions.jsxClosingBracketLocation[0]) {
        if (closingBracketRule === TAGALIGNED) {
          return this.indentRow({
            row: row,
            blockIndent: parentTag.tokenIndentation
          });
        } else if (closingBracketRule === LINEALIGNED) {
          return this.indentRow({
            row: row,
            blockIndent: parentTag.firstCharIndentation
          });
        } else if (closingBracketRule === AFTERPROPS) {
          if (this.eslintIndentOptions.jsxIndentProps[0]) {
            return this.indentRow({
              row: row,
              blockIndent: parentTag.firstCharIndentation,
              jsxIndentProps: 1
            });
          } else {
            return this.indentRow({
              row: row,
              blockIndent: parentTag.firstCharIndentation
            });
          }
        } else if (closingBracketRule === PROPSALIGNED) {
          if (this.eslintIndentOptions.jsxIndentProps[0]) {
            return this.indentRow({
              row: row,
              blockIndent: parentTag.tokenIndentation,
              jsxIndentProps: 1
            });
          } else {
            return this.indentRow({
              row: row,
              blockIndent: parentTag.tokenIndentation
            });
          }
        }
      }
    };

    AutoIndent.prototype.indentRow = function(options) {
      var allowAdditionalIndents, blockIndent, jsxIndent, jsxIndentProps, row;
      row = options.row, allowAdditionalIndents = options.allowAdditionalIndents, blockIndent = options.blockIndent, jsxIndent = options.jsxIndent, jsxIndentProps = options.jsxIndentProps;
      if (this.templateDepth > 0) {
        return false;
      }
      if (jsxIndent) {
        if (this.eslintIndentOptions.jsxIndent[0]) {
          if (this.eslintIndentOptions.jsxIndent[1]) {
            blockIndent += jsxIndent * this.eslintIndentOptions.jsxIndent[1];
          }
        }
      }
      if (jsxIndentProps) {
        if (this.eslintIndentOptions.jsxIndentProps[0]) {
          if (this.eslintIndentOptions.jsxIndentProps[1]) {
            blockIndent += jsxIndentProps * this.eslintIndentOptions.jsxIndentProps[1];
          }
        }
      }
      if (allowAdditionalIndents) {
        if (this.editor.indentationForBufferRow(row) < blockIndent || this.editor.indentationForBufferRow(row) > blockIndent + allowAdditionalIndents) {
          this.editor.setIndentationForBufferRow(row, blockIndent, {
            preserveLeadingWhitespace: false
          });
          return true;
        }
      } else {
        if (this.editor.indentationForBufferRow(row) !== blockIndent) {
          this.editor.setIndentationForBufferRow(row, blockIndent, {
            preserveLeadingWhitespace: false
          });
          return true;
        }
      }
      return false;
    };

    return AutoIndent;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWJhYmVsL2xpYi9hdXRvLWluZGVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDZmQUFBO0lBQUE7OztFQUFBLE1BQTRDLE9BQUEsQ0FBUSxNQUFSLENBQTVDLEVBQUMsNkNBQUQsRUFBc0IsZUFBdEIsRUFBNEIsaUJBQTVCLEVBQW1DOztFQUNuQyxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSOztFQUNsQixhQUFBLEdBQWdCLE9BQUEsQ0FBUSxtQkFBUjs7RUFDaEIsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHFCQUFSOztFQUNwQixJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVI7O0VBR1AsUUFBQSxHQUEwQjs7RUFDMUIsc0JBQUEsR0FBMEI7O0VBQzFCLG9CQUFBLEdBQTBCOztFQUMxQixXQUFBLEdBQTBCOztFQUMxQixrQkFBQSxHQUEwQjs7RUFDMUIsWUFBQSxHQUEwQjs7RUFDMUIsYUFBQSxHQUEwQjs7RUFDMUIsY0FBQSxHQUEwQjs7RUFDMUIsVUFBQSxHQUEwQjs7RUFDMUIsV0FBQSxHQUEwQjs7RUFDMUIsVUFBQSxHQUEwQjs7RUFDMUIsWUFBQSxHQUEwQjs7RUFDMUIsS0FBQSxHQUEwQjs7RUFDMUIsT0FBQSxHQUEwQjs7RUFDMUIsaUJBQUEsR0FBMEI7O0VBQzFCLGtCQUFBLEdBQTBCOztFQUMxQixXQUFBLEdBQTBCOztFQUMxQixjQUFBLEdBQTBCOztFQUMxQixTQUFBLEdBQTBCOztFQUMxQixVQUFBLEdBQTBCOztFQUMxQixXQUFBLEdBQTBCOztFQUMxQixjQUFBLEdBQTBCOztFQUMxQixZQUFBLEdBQTBCOztFQUcxQixVQUFBLEdBQWdCOztFQUNoQixXQUFBLEdBQWdCOztFQUNo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V0FBN0M7VUFDRSxJQUFDLENBQUEsTUFBTSxDQUFDLDBCQUFSLENBQW1DLEdBQW5DLEVBQXdDLFdBQXhDLEVBQXFEO1lBQUUseUJBQUEsRUFBMkIsS0FBN0I7V0FBckQ7QUFDQSxpQkFBTyxLQUZUO1NBTkY7O0FBU0EsYUFBTztJQXhCRTs7Ozs7QUFuMEJiIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGUsIEZpbGUsIFJhbmdlLCBQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5hdXRvQ29tcGxldGVKU1ggPSByZXF1aXJlICcuL2F1dG8tY29tcGxldGUtanN4J1xuRGlkSW5zZXJ0VGV4dCA9IHJlcXVpcmUgJy4vZGlkLWluc2VydC10ZXh0J1xuc3RyaXBKc29uQ29tbWVudHMgPSByZXF1aXJlICdzdHJpcC1qc29uLWNvbW1lbnRzJ1xuWUFNTCA9IHJlcXVpcmUgJ2pzLXlhbWwnXG5cblxuTk9fVE9LRU4gICAgICAgICAgICAgICAgPSAwXG5KU1hUQUdfU0VMRkNMT1NFX1NUQVJUICA9IDEgICAgICAgIyB0aGUgPHRhZyBpbiA8dGFnIC8+XG5KU1hUQUdfU0VMRkNMT1NFX0VORCAgICA9IDIgICAgICAgIyB0aGUgLz4gaW4gPHRhZyAvPlxuSlNYVEFHX09QRU4gICAgICAgICAgICAgPSAzICAgICAgICMgdGhlIDx0YWcgaW4gPHRhZz48L3RhZz5cbkpTWFRBR19DTE9TRV9BVFRSUyAgICAgID0gNCAgICAgICAjIHRoZSAxc3QgPiBpbiA8dGFnPjwvdGFnPlxuSlNYVEFHX0NMT1NFICAgICAgICAgICAgPSA1ICAgICAgICMgYSA8L3RhZz5cbkpTWEJSQUNFX09QRU4gICAgICAgICAgID0gNiAgICAgICAjIGVtYmVkZGVkIGV4cHJlc3Npb24gYnJhY2Ugc3RhcnQge1xuSlNYQlJBQ0VfQ0xPU0UgICAgICAgICAgPSA3ICAgICAgICMgZW1iZWRkZWQgZXhwcmVzc2lvbiBicmFjZSBlbmQgfVxuQlJBQ0VfT1BFTiAgICAgICAgICAgICAgPSA4ICAgICAgICMgSmF2YXNjcmlwdCBicmFjZVxuQlJBQ0VfQ0xPU0UgICAgICAgICAgICAgPSA5ICAgICAgICMgSmF2YXNjcmlwdCBicmFjZVxuVEVSTkFSWV9JRiAgICAgICAgICAgICAgPSAxMCAgICAgICMgVGVybmFyeSA/XG5URVJOQVJZX0VMU0UgICAgICAgICAgICA9IDExICAgICAgIyBUZXJuYXJ5IDpcbkpTX0lGICAgICAgICAgICAgICAgICAgID0gMTIgICAgICAjIEpTIElGXG5KU19FTFNFICAgICAgICAgICAgICAgICA9IDEzICAgICAgIyBKUyBFTFNFXG5TV0lUQ0hfQlJBQ0VfT1BFTiAgICAgICA9IDE0ICAgICAgIyBvcGVuaW5nIGJyYWNlIGluIHN3aXRjaCB7IH1cblNXSVRDSF9CUkFDRV9DTE9TRSAgICAgID0gMTUgICAgICAjIGNsb3NpbmcgYnJhY2UgaW4gc3dpdGNoIHsgfVxuU1dJVENIX0NBU0UgICAgICAgICAgICAgPSAxNiAgICAgICMgc3dpdGNoIGNhc2Ugc3RhdGVtZW50XG5TV0lUQ0hfREVGQVVMVCAgICAgICAgICA9IDE3ICAgICAgIyBzd2l0Y2ggZGVmYXVsdCBzdGF0ZW1lbnRcbkpTX1JFVFVSTiAgICAgICAgICAgICAgID0gMTggICAgICAjIEpTIHJldHVyblxuUEFSRU5fT1BFTiAgICAgICAgICAgICAgPSAxOSAgICAgICMgcGFyZW4gb3BlbiAoXG5QQVJFTl9DTE9TRSAgICAgICAgICAgICA9IDIwICAgICAgIyBwYXJlbiBjbG9zZSApXG5URU1QTEFURV9TVEFSVCAgICAgICAgICA9IDIxICAgICAgIyBgIGJhY2stdGljayBzdGFydFxuVEVNUExBVEVfRU5EICAgICAgICAgICAgPSAyMiAgICAgICMgYCBiYWNrLXRpY2sgZW5kXG5cbiMgZXNsaW50IHByb3BlcnR5IHZhbHVlc1xuVEFHQUxJR05FRCAgICA9ICd0YWctYWxpZ25lZCdcbkxJTkVBTElHTkVEICAgPSAnbGluZS1hbGlnbmVkJ1xuQUZURVJQUk9QUyAgICA9ICdhZnRlci1wcm9wcydcblBST1BTQUxJR05FRCAgPSAncHJvcHMtYWxpZ25lZCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQXV0b0luZGVudFxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IpIC0+XG4gICAgQERpZEluc2VydFRleHQgPSBuZXcgRGlkSW5zZXJ0VGV4dChAZWRpdG9yKVxuICAgIEBhdXRvSnN4ID0gYXRvbS5jb25maWcuZ2V0KCdsYW5ndWFnZS1iYWJlbCcpLmF1dG9JbmRlbnRKU1hcbiAgICAjIHJlZ2V4IHRvIHNlYXJjaCBmb3IgdGFnIG9wZW4vY2xvc2UgdGFnIGFuZCBjbG9zZSB0YWdcbiAgICBASlNYUkVHRVhQID0gLyg8KShbJF9BLVphLXpdKD86WyRfLjpcXC1BLVphLXowLTldKSopfChcXC8+KXwoPFxcLykoWyRfQS1aYS16XSg/OlskLl86XFwtQS1aYS16MC05XSkqKSg+KXwoPil8KHspfCh9KXwoXFw/KXwoOil8KGlmKXwoZWxzZSl8KGNhc2UpfChkZWZhdWx0KXwocmV0dXJuKXwoXFwoKXwoXFwpKXwoYCkvZ1xuICAgIEBtb3VzZVVwID0gdHJ1ZVxuICAgIEBtdWx0aXBsZUN1cnNvclRyaWdnZXIgPSAxXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIEBlc2xpbnRJbmRlbnRPcHRpb25zID0gQGdldEluZGVudE9wdGlvbnMoKVxuICAgIEB0ZW1wbGF0ZURlcHRoID0gMCAjIHRyYWNrIGRlcHRoIG9mIGFueSBlbWJlZGRlZCBiYWNrLXRpY2sgdGVtcGxhdGVzXG5cbiAgICAjIE9ic2VydmUgYXV0b0luZGVudEpTWCBmb3IgZXhpc3RpbmcgZWRpdG9yc1xuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbGFuZ3VhZ2UtYmFiZWwuYXV0b0luZGVudEpTWCcsXG4gICAgICAodmFsdWUpID0+IEBhdXRvSnN4ID0gdmFsdWVcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ2xhbmd1YWdlLWJhYmVsOmF1dG8taW5kZW50LWpzeC1vbic6IChldmVudCkgPT5cbiAgICAgICAgQGF1dG9Kc3ggPSB0cnVlXG4gICAgICAgIEBlc2xpbnRJbmRlbnRPcHRpb25zID0gQGdldEluZGVudE9wdGlvbnMoKVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsXG4gICAgICAnbGFuZ3VhZ2UtYmFiZWw6YXV0by1pbmRlbnQtanN4LW9mZic6IChldmVudCkgPT4gIEBhdXRvSnN4ID0gZmFsc2VcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ2xhbmd1YWdlLWJhYmVsOnRvZ2dsZS1hdXRvLWluZGVudC1qc3gnOiAoZXZlbnQpID0+XG4gICAgICAgIEBhdXRvSnN4ID0gbm90IEBhdXRvSnN4XG4gICAgICAgIGlmIEBhdXRvSnN4IHRoZW4gQGVzbGludEluZGVudE9wdGlvbnMgPSBAZ2V0SW5kZW50T3B0aW9ucygpXG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCBAb25Nb3VzZURvd25cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJywgQG9uTW91c2VVcFxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24gKGV2ZW50KSA9PiBAY2hhbmdlZEN1cnNvclBvc2l0aW9uKGV2ZW50KVxuICAgIEBoYW5kbGVPbkRpZFN0b3BDaGFuZ2luZygpXG5cbiAgZGVzdHJveTogKCkgLT5cbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQG9uRGlkU3RvcENoYW5naW5nSGFuZGxlci5kaXNwb3NlKClcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCBAb25Nb3VzZURvd25cbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZXVwJywgQG9uTW91c2VVcFxuXG4gICMgY2hhbmdlZCBjdXJzb3IgcG9zaXRpb25cbiAgY2hhbmdlZEN1cnNvclBvc2l0aW9uOiAoZXZlbnQpID0+XG4gICAgcmV0dXJuIHVubGVzcyBAYXV0b0pzeFxuICAgIHJldHVybiB1bmxlc3MgQG1vdXNlVXBcbiAgICByZXR1cm4gdW5sZXNzIGV2ZW50Lm9sZEJ1ZmZlclBvc2l0aW9uLnJvdyBpc250IGV2ZW50Lm5ld0J1ZmZlclBvc2l0aW9uLnJvd1xuICAgIGJ1ZmZlclJvdyA9IGV2ZW50Lm5ld0J1ZmZlclBvc2l0aW9uLnJvd1xuICAgICMgaGFuZGxlIG11bHRpcGxlIGN1cnNvcnMuIG9ubHkgdHJpZ2dlciBpbmRlbnQgb24gb25lIGNoYW5nZSBldmVudFxuICAgICMgYW5kIHRoZW4gb25seSBhdCB0aGUgaGlnaGVzdCByb3dcbiAgICBpZiBAZWRpdG9yLmhhc011bHRpcGxlQ3Vyc29ycygpXG4gICAgICBjdXJzb3JQb3NpdGlvbnMgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpXG4gICAgICBpZiBjdXJzb3JQb3NpdGlvbnMubGVuZ3RoIGlzIEBtdWx0aXBsZUN1cnNvclRyaWdnZXJcbiAgICAgICAgQG11bHRpcGxlQ3Vyc29yVHJpZ2dlciA9IDFcbiAgICAgICAgYnVmZmVyUm93ID0gMFxuICAgICAgICBmb3IgY3Vyc29yUG9zaXRpb24gaW4gY3Vyc29yUG9zaXRpb25zXG4gICAgICAgICAgaWYgY3Vyc29yUG9zaXRpb24ucm93ID4gYnVmZmVyUm93IHRoZW4gYnVmZmVyUm93ID0gY3Vyc29yUG9zaXRpb24ucm93XG4gICAgICBlbHNlXG4gICAgICAgIEBtdWx0aXBsZUN1cnNvclRyaWdnZXIrK1xuICAgICAgICByZXR1cm5cbiAgICBlbHNlIGN1cnNvclBvc2l0aW9uID0gZXZlbnQubmV3QnVmZmVyUG9zaXRpb25cblxuICAgICMgcmVtb3ZlIGFueSBibGFuayBsaW5lcyBmcm9tIHdoZXJlIGN1cnNvciB3YXMgcHJldmlvdXNseVxuICAgIHByZXZpb3VzUm93ID0gZXZlbnQub2xkQnVmZmVyUG9zaXRpb24ucm93XG4gICAgaWYgQGpzeEluU2NvcGUocHJldmlvdXNSb3cpXG4gICAgICBibGFua0xpbmVFbmRQb3MgPSAvXlxccyokLy5leGVjKEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocHJldmlvdXNSb3cpKT9bMF0ubGVuZ3RoXG4gICAgICBpZiBibGFua0xpbmVFbmRQb3M/XG4gICAgICAgIEBpbmRlbnRSb3coe3JvdzogcHJldmlvdXNSb3cgLCBibG9ja0luZGVudDogMCB9KVxuXG4gICAgcmV0dXJuIGlmIG5vdCBAanN4SW5TY29wZSBidWZmZXJSb3dcblxuICAgIGVuZFBvaW50T2ZKc3ggPSBuZXcgUG9pbnQgYnVmZmVyUm93LDAgIyBuZXh0IHJvdyBzdGFydFxuICAgIHN0YXJ0UG9pbnRPZkpzeCA9ICBhdXRvQ29tcGxldGVKU1guZ2V0U3RhcnRPZkpTWCBAZWRpdG9yLCBjdXJzb3JQb3NpdGlvblxuICAgIEBpbmRlbnRKU1ggbmV3IFJhbmdlKHN0YXJ0UG9pbnRPZkpzeCwgZW5kUG9pbnRPZkpzeClcbiAgICBjb2x1bW5Ub01vdmVUbyA9IC9eXFxzKiQvLmV4ZWMoQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhidWZmZXJSb3cpKT9bMF0ubGVuZ3RoXG4gICAgaWYgY29sdW1uVG9Nb3ZlVG8/IHRoZW4gQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiBbYnVmZmVyUm93LCBjb2x1bW5Ub01vdmVUb11cblxuXG4gICMgQnVmZmVyIGhhcyBzdG9wcGVkIGNoYW5naW5nLiBJbmRlbnQgYXMgcmVxdWlyZWRcbiAgZGlkU3RvcENoYW5naW5nOiAoKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQGF1dG9Kc3hcbiAgICByZXR1cm4gdW5sZXNzIEBtb3VzZVVwXG4gICAgc2VsZWN0ZWRSYW5nZSA9IEBlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpXG4gICAgIyBpZiB0aGlzIGlzIGEgdGFnIHN0YXJ0J3MgZW5kID4gb3IgPC8gdGhlbiBkb24ndCBhdXRvIGluZGVudFxuICAgICMgdGhpcyBpYSBmaXggdG8gYWxsb3cgZm9yIHRoZSBhdXRvIGNvbXBsZXRlIHRhZyB0aW1lIHRvIHBvcCB1cFxuICAgIGlmIHNlbGVjdGVkUmFuZ2Uuc3RhcnQucm93IGlzIHNlbGVjdGVkUmFuZ2UuZW5kLnJvdyBhbmRcbiAgICAgIHNlbGVjdGVkUmFuZ2Uuc3RhcnQuY29sdW1uIGlzIHNlbGVjdGVkUmFuZ2UuZW5kLmNvbHVtblxuICAgICAgICByZXR1cm4gaWYgJ0pTWFN0YXJ0VGFnRW5kJyBpbiBAZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFtzZWxlY3RlZFJhbmdlLnN0YXJ0LnJvdywgc2VsZWN0ZWRSYW5nZS5zdGFydC5jb2x1bW5dKS5nZXRTY29wZXNBcnJheSgpXG4gICAgICAgIHJldHVybiBpZiAnSlNYRW5kVGFnU3RhcnQnIGluIEBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oW3NlbGVjdGVkUmFuZ2Uuc3RhcnQucm93LCBzZWxlY3RlZFJhbmdlLnN0YXJ0LmNvbHVtbl0pLmdldFNjb3Blc0FycmF5KClcblxuICAgIGhpZ2hlc3RSb3cgPSBNYXRoLm1heCBzZWxlY3RlZFJhbmdlLnN0YXJ0LnJvdywgc2VsZWN0ZWRSYW5nZS5lbmQucm93XG4gICAgbG93ZXN0Um93ID0gTWF0aC5taW4gc2VsZWN0ZWRSYW5nZS5zdGFydC5yb3csIHNlbGVjdGVkUmFuZ2UuZW5kLnJvd1xuXG4gICAgIyByZW1vdmUgdGhlIGhhbmRsZXIgZm9yIGRpZFN0b3BDaGFuZ2luZyB0byBhdm9pZCB0aGlzIGNoYW5nZSBjYXVzaW5nIGEgbmV3IGV2ZW50XG4gICAgQG9uRGlkU3RvcENoYW5naW5nSGFuZGxlci5kaXNwb3NlKClcblxuICAgICMgd29yayBiYWNrd2FyZHMgdGhyb3VnaCBidWZmZXIgcm93cyBpbmRlbnRpbmcgSlNYIGFzIG5lZWRlZFxuICAgIHdoaWxlICggaGlnaGVzdFJvdyA+PSBsb3dlc3RSb3cgKVxuICAgICAgaWYgQGpzeEluU2NvcGUoaGlnaGVzdFJvdylcbiAgICAgICAgZW5kUG9pbnRPZkpzeCA9IG5ldyBQb2ludCBoaWdoZXN0Um93LDBcbiAgICAgICAgc3RhcnRQb2ludE9mSnN4ID0gIGF1dG9Db21wbGV0ZUpTWC5nZXRTdGFydE9mSlNYIEBlZGl0b3IsIGVuZFBvaW50T2ZKc3hcbiAgICAgICAgQGluZGVudEpTWCBuZXcgUmFuZ2Uoc3RhcnRQb2ludE9mSnN4LCBlbmRQb2ludE9mSnN4KVxuICAgICAgICBoaWdoZXN0Um93ID0gc3RhcnRQb2ludE9mSnN4LnJvdyAtIDFcbiAgICAgIGVsc2UgaGlnaGVzdFJvdyA9IGhpZ2hlc3RSb3cgLSAxXG5cbiAgICAjIHJlbmFibGUgdGhpcyBldmVudCBoYW5kbGVyIGFmdGVyIDMwMG1zIGFzIHBlciB0aGUgZGVmYXVsdCB0aW1lb3V0IGZvciBjaGFuZ2UgZXZlbnRzXG4gICAgIyB0byBhdm9pZCB0aGlzIG1ldGhvZCBiZWluZyByZWNhbGxlZCFcbiAgICBzZXRUaW1lb3V0KEBoYW5kbGVPbkRpZFN0b3BDaGFuZ2luZywgMzAwKVxuICAgIHJldHVyblxuXG4gIGhhbmRsZU9uRGlkU3RvcENoYW5naW5nOiA9PlxuICAgIEBvbkRpZFN0b3BDaGFuZ2luZ0hhbmRsZXIgPSBAZWRpdG9yLm9uRGlkU3RvcENoYW5naW5nICgpID0+IEBkaWRTdG9wQ2hhbmdpbmcoKVxuXG4gICMgaXMgdGhlIGpzeCBvbiB0aGlzIGxpbmUgaW4gc2NvcGVcbiAganN4SW5TY29wZTogKGJ1ZmZlclJvdykgLT5cbiAgICBzY29wZXMgPSBAZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFtidWZmZXJSb3csIDBdKS5nZXRTY29wZXNBcnJheSgpXG4gICAgcmV0dXJuICdtZXRhLnRhZy5qc3gnIGluIHNjb3Blc1xuXG4gICMgaW5kZW50IHRoZSBKU1ggaW4gdGhlICdyYW5nZScgb2Ygcm93c1xuICAjIFRoaXMgaXMgZGVzaWduZWQgdG8gYmUgYSBzaW5nbGUgcGFyc2UgaW5kZW50ZXIgdG8gcmVkdWNlIHRoZSBpbXBhY3Qgb24gdGhlIGVkaXRvci5cbiAgIyBJdCBhc3N1bWVzIHRoZSBncmFtbWFyIGhhcyBkb25lIGl0cyBqb2IgYWRkaW5nIHNjb3BlcyB0byBpbnRlcmVzdGluZyB0b2tlbnMuXG4gICMgVGhvc2UgYXJlIEpTWCA8dGFnLCA+LCA8L3RhZywgLz4sIGVtZWRkZWQgZXhwcmVzc2lvbnNcbiAgIyBvdXRzaWRlIHRoZSB0YWcgc3RhcnRpbmcgeyBhbmQgZW5kaW5nIH0gYW5kIGphdmFzY3JpcHQgYnJhY2VzIG91dHNpZGUgYSB0YWcgeyAmIH1cbiAgIyBpdCB1c2VzIGFuIGFycmF5IHRvIGhvbGQgdG9rZW5zIGFuZCBhIHB1c2gvcG9wIHN0YWNrIHRvIGhvbGQgdG9rZW5zIG5vdCBjbG9zZWRcbiAgIyB0aGUgdmVyeSBmaXJzdCBqc3ggdGFnIG11c3QgYmUgY29ycmV0bHkgaW5kZXRlZCBieSB0aGUgdXNlciBhcyB3ZSBkb24ndCBoYXZlXG4gICMga25vd2xlZGdlIG9mIHByZWNlZWRpbmcgSmF2YXNjcmlwdC5cbiAgaW5kZW50SlNYOiAocmFuZ2UpIC0+XG4gICAgdG9rZW5TdGFjayA9IFtdXG4gICAgaWR4T2ZUb2tlbiA9IDBcbiAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuID0gW10gIyBsZW5ndGggZXF1aXZhbGVudCB0byB0b2tlbiBkZXB0aFxuICAgIGluZGVudCA9ICAwXG4gICAgaXNGaXJzdFRhZ09mQmxvY2sgPSB0cnVlXG4gICAgQEpTWFJFR0VYUC5sYXN0SW5kZXggPSAwXG4gICAgQHRlbXBsYXRlRGVwdGggPSAwXG5cbiAgICBmb3Igcm93IGluIFtyYW5nZS5zdGFydC5yb3cuLnJhbmdlLmVuZC5yb3ddXG4gICAgICBpc0ZpcnN0VG9rZW5PZkxpbmUgPSB0cnVlXG4gICAgICB0b2tlbk9uVGhpc0xpbmUgPSBmYWxzZVxuICAgICAgaW5kZW50UmVjYWxjID0gZmFsc2VcbiAgICAgIGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb24gPSAgMFxuICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG5cbiAgICAgICMgbG9vayBmb3IgdG9rZW5zIGluIGEgYnVmZmVyIGxpbmVcbiAgICAgIHdoaWxlICgoIG1hdGNoID0gQEpTWFJFR0VYUC5leGVjKGxpbmUpKSBpc250IG51bGwgKVxuICAgICAgICBtYXRjaENvbHVtbiA9IG1hdGNoLmluZGV4XG4gICAgICAgIG1hdGNoUG9pbnRTdGFydCA9IG5ldyBQb2ludChyb3csIG1hdGNoQ29sdW1uKVxuICAgICAgICBtYXRjaFBvaW50RW5kID0gbmV3IFBvaW50KHJvdywgbWF0Y2hDb2x1bW4gKyBtYXRjaFswXS5sZW5ndGggLSAxKVxuICAgICAgICBtYXRjaFJhbmdlID0gbmV3IFJhbmdlKG1hdGNoUG9pbnRTdGFydCwgbWF0Y2hQb2ludEVuZClcblxuICAgICAgICBpZiByb3cgaXMgcmFuZ2Uuc3RhcnQucm93IGFuZCBtYXRjaENvbHVtbiA8IHJhbmdlLnN0YXJ0LmNvbHVtbiB0aGVuIGNvbnRpbnVlXG4gICAgICAgIGlmIG5vdCB0b2tlbiA9ICBAZ2V0VG9rZW4ocm93LCBtYXRjaCkgdGhlbiBjb250aW51ZVxuXG4gICAgICAgIGZpcnN0Q2hhckluZGVudGF0aW9uID0gKEBlZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cgcm93KVxuICAgICAgICAjIGNvbnZlcnQgdGhlIG1hdGNoZWQgY29sdW1uIHBvc2l0aW9uIGludG8gdGFiIGluZGVudHNcbiAgICAgICAgaWYgQGVkaXRvci5nZXRTb2Z0VGFicygpXG4gICAgICAgICAgdG9rZW5JbmRlbnRhdGlvbiA9IChtYXRjaENvbHVtbiAvIEBlZGl0b3IuZ2V0VGFiTGVuZ3RoKCkpXG4gICAgICAgIGVsc2UgdG9rZW5JbmRlbnRhdGlvbiA9XG4gICAgICAgICAgZG8gKEBlZGl0b3IpIC0+XG4gICAgICAgICAgICBoYXJkVGFic0ZvdW5kID0gY2hhcnNGb3VuZCA9IDBcbiAgICAgICAgICAgIGZvciBpIGluIFswLi4ubWF0Y2hDb2x1bW5dXG4gICAgICAgICAgICAgIGlmICgobGluZS5zdWJzdHIgaSwgMSkgaXMgJ1xcdCcpXG4gICAgICAgICAgICAgICAgaGFyZFRhYnNGb3VuZCsrXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjaGFyc0ZvdW5kKytcbiAgICAgICAgICAgIHJldHVybiBoYXJkVGFic0ZvdW5kICsgKCBjaGFyc0ZvdW5kIC8gQGVkaXRvci5nZXRUYWJMZW5ndGgoKSApXG5cbiAgICAgICAgIyBiaWcgc3dpdGNoIHN0YXRlbWVudCBmb2xsb3dzIGZvciBlYWNoIHRva2VuLiBJZiB0aGUgbGluZSBpcyByZWZvcm1hdGVkXG4gICAgICAgICMgdGhlbiB3ZSByZWNhbGN1bGF0ZSB0aGUgbmV3IHBvc2l0aW9uLlxuICAgICAgICAjIGJpdCBob3JyaWQgYnV0IGhvcGVmdWxseSBmYXN0LlxuICAgICAgICBzd2l0Y2ggKHRva2VuKVxuICAgICAgICAgICMgdGFncyBzdGFydGluZyA8dGFnXG4gICAgICAgICAgd2hlbiBKU1hUQUdfT1BFTlxuICAgICAgICAgICAgdG9rZW5PblRoaXNMaW5lID0gdHJ1ZVxuICAgICAgICAgICAgIyBpbmRlbnQgb25seSBvbiBmaXJzdCB0b2tlbiBvZiBhIGxpbmVcbiAgICAgICAgICAgIGlmIGlzRmlyc3RUb2tlbk9mTGluZVxuICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICAgICMgaXNGaXJzdFRhZ09mQmxvY2sgaXMgdXNlZCB0byBtYXJrIHRoZSB0YWcgdGhhdCBzdGFydHMgdGhlIEpTWCBidXRcbiAgICAgICAgICAgICAgIyBhbHNvIHRoZSBmaXJzdCB0YWcgb2YgYmxvY2tzIGluc2lkZSAgZW1iZWRkZWQgZXhwcmVzc2lvbnMuIGUuZy5cbiAgICAgICAgICAgICAgIyA8dGJvZHk+LCA8cENvbXA+IGFuZCA8b2JqZWN0Um93PiBhcmUgZmlyc3QgdGFnc1xuICAgICAgICAgICAgICAjIHJldHVybiAoXG4gICAgICAgICAgICAgICMgICAgICAgPHRib2R5IGNvbXA9ezxwQ29tcCBwcm9wZXJ0eSAvPn0+XG4gICAgICAgICAgICAgICMgICAgICAgICB7b2JqZWN0cy5tYXAoZnVuY3Rpb24ob2JqZWN0LCBpKXtcbiAgICAgICAgICAgICAgIyAgICAgICAgICAgcmV0dXJuIDxPYmplY3RSb3cgb2JqPXtvYmplY3R9IGtleT17aX0gLz47XG4gICAgICAgICAgICAgICMgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgIyAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICAjICAgICApXG4gICAgICAgICAgICAgICMgYnV0IHdlIGRvbid0IHBvc2l0aW9uIHRoZSA8dGJvZHk+IGFzIHdlIGhhdmUgbm8ga25vd2xlZGdlIG9mIHRoZSBwcmVjZWVkaW5nXG4gICAgICAgICAgICAgICMganMgc3ludGF4XG4gICAgICAgICAgICAgIGlmIGlzRmlyc3RUYWdPZkJsb2NrIGFuZFxuICAgICAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg/IGFuZFxuICAgICAgICAgICAgICAgICAgKCB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50eXBlIGlzIEJSQUNFX09QRU4gb3JcbiAgICAgICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgaXMgSlNYQlJBQ0VfT1BFTiApXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb24gPSAgdG9rZW5JbmRlbnRhdGlvblxuICAgICAgICAgICAgICAgICAgICBmaXJzdENoYXJJbmRlbnRhdGlvbiA9XG4gICAgICAgICAgICAgICAgICAgICAgQGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50WzFdICsgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb25cbiAgICAgICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3cgLCBibG9ja0luZGVudDogZmlyc3RDaGFySW5kZW50YXRpb24gfSlcbiAgICAgICAgICAgICAgZWxzZSBpZiBpc0ZpcnN0VGFnT2ZCbG9jayBhbmQgcGFyZW50VG9rZW5JZHg/XG4gICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3cgLCBibG9ja0luZGVudDogQGdldEluZGVudE9mUHJldmlvdXNSb3cocm93KSwganN4SW5kZW50OiAxfSlcbiAgICAgICAgICAgICAgZWxzZSBpZiBwYXJlbnRUb2tlbklkeD8gYW5kIEB0ZXJuYXJ5VGVybWluYXRlc1ByZXZpb3VzTGluZShyb3cpXG4gICAgICAgICAgICAgICAgZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvbiA9ICB0b2tlbkluZGVudGF0aW9uXG4gICAgICAgICAgICAgICAgZmlyc3RDaGFySW5kZW50YXRpb24gPSBAZ2V0SW5kZW50T2ZQcmV2aW91c1Jvdyhyb3cpXG4gICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3cgLCBibG9ja0luZGVudDogZmlyc3RDaGFySW5kZW50YXRpb24gfSlcbiAgICAgICAgICAgICAgZWxzZSBpZiBwYXJlbnRUb2tlbklkeD9cbiAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdyAsIGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50OiAxfSlcblxuICAgICAgICAgICAgIyByZS1wYXJzZSBsaW5lIGlmIGluZGVudCBkaWQgc29tZXRoaW5nIHRvIGl0XG4gICAgICAgICAgICBpZiBpbmRlbnRSZWNhbGNcbiAgICAgICAgICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG4gICAgICAgICAgICAgIEBKU1hSRUdFWFAubGFzdEluZGV4ID0gMCAjZm9yY2UgcmVnZXggdG8gc3RhcnQgYWdhaW5cbiAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaXNGaXJzdFRva2VuT2ZMaW5lID0gZmFsc2VcbiAgICAgICAgICAgIGlzRmlyc3RUYWdPZkJsb2NrID0gZmFsc2VcblxuICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgdG9rZW5TdGFjay5wdXNoXG4gICAgICAgICAgICAgIHR5cGU6IEpTWFRBR19PUEVOXG4gICAgICAgICAgICAgIG5hbWU6IG1hdGNoWzJdXG4gICAgICAgICAgICAgIHJvdzogcm93XG4gICAgICAgICAgICAgIGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb246IGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb25cbiAgICAgICAgICAgICAgdG9rZW5JbmRlbnRhdGlvbjogdG9rZW5JbmRlbnRhdGlvblxuICAgICAgICAgICAgICBmaXJzdENoYXJJbmRlbnRhdGlvbjogZmlyc3RDaGFySW5kZW50YXRpb25cbiAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg6IHBhcmVudFRva2VuSWR4XG4gICAgICAgICAgICAgIHRlcm1zVGhpc1RhZ3NBdHRyaWJ1dGVzSWR4OiBudWxsICAjIHB0ciB0byA+IHRhZ1xuICAgICAgICAgICAgICB0ZXJtc1RoaXNUYWdJZHg6IG51bGwgICAgICAgICAgICAgIyBwdHIgdG8gPC90YWc+XG5cbiAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBpZHhPZlRva2VuXG4gICAgICAgICAgICBpZHhPZlRva2VuKytcblxuICAgICAgICAgICMgdGFncyBlbmRpbmcgPC90YWc+XG4gICAgICAgICAgd2hlbiBKU1hUQUdfQ0xPU0VcbiAgICAgICAgICAgIHRva2VuT25UaGlzTGluZSA9IHRydWVcbiAgICAgICAgICAgIGlmIGlzRmlyc3RUb2tlbk9mTGluZVxuICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24gfSApXG5cbiAgICAgICAgICAgICMgcmUtcGFyc2UgbGluZSBpZiBpbmRlbnQgZGlkIHNvbWV0aGluZyB0byBpdFxuICAgICAgICAgICAgaWYgaW5kZW50UmVjYWxjXG4gICAgICAgICAgICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IHJvd1xuICAgICAgICAgICAgICBASlNYUkVHRVhQLmxhc3RJbmRleCA9IDAgI2ZvcmNlIHJlZ2V4IHRvIHN0YXJ0IGFnYWluXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IGZhbHNlXG4gICAgICAgICAgICBpc0ZpcnN0VGFnT2ZCbG9jayA9IGZhbHNlXG5cbiAgICAgICAgICAgIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgdG9rZW5TdGFjay5wdXNoXG4gICAgICAgICAgICAgIHR5cGU6IEpTWFRBR19DTE9TRVxuICAgICAgICAgICAgICBuYW1lOiBtYXRjaFs1XVxuICAgICAgICAgICAgICByb3c6IHJvd1xuICAgICAgICAgICAgICBwYXJlbnRUb2tlbklkeDogcGFyZW50VG9rZW5JZHggICAgICAgICAjIHB0ciB0byA8dGFnXG4gICAgICAgICAgICBpZiBwYXJlbnRUb2tlbklkeCA+PTAgdGhlbiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50ZXJtc1RoaXNUYWdJZHggPSBpZHhPZlRva2VuXG4gICAgICAgICAgICBpZHhPZlRva2VuKytcblxuICAgICAgICAgICMgdGFncyBlbmRpbmcgLz5cbiAgICAgICAgICB3aGVuIEpTWFRBR19TRUxGQ0xPU0VfRU5EXG4gICAgICAgICAgICB0b2tlbk9uVGhpc0xpbmUgPSB0cnVlXG4gICAgICAgICAgICBpZiBpc0ZpcnN0VG9rZW5PZkxpbmVcbiAgICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgICAjaWYgZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvbiBpcyBmaXJzdENoYXJJbmRlbnRhdGlvblxuICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Rm9yQ2xvc2luZ0JyYWNrZXQgIHJvdyxcbiAgICAgICAgICAgICAgICB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XSxcbiAgICAgICAgICAgICAgICBAZXNsaW50SW5kZW50T3B0aW9ucy5qc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uWzFdLnNlbGZDbG9zaW5nXG5cbiAgICAgICAgICAgICMgcmUtcGFyc2UgbGluZSBpZiBpbmRlbnQgZGlkIHNvbWV0aGluZyB0byBpdFxuICAgICAgICAgICAgaWYgaW5kZW50UmVjYWxjXG4gICAgICAgICAgICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IHJvd1xuICAgICAgICAgICAgICBASlNYUkVHRVhQLmxhc3RJbmRleCA9IDAgI2ZvcmNlIHJlZ2V4IHRvIHN0YXJ0IGFnYWluXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlzRmlyc3RUYWdPZkJsb2NrID0gZmFsc2VcbiAgICAgICAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgdG9rZW5TdGFjay5wdXNoXG4gICAgICAgICAgICAgIHR5cGU6IEpTWFRBR19TRUxGQ0xPU0VfRU5EXG4gICAgICAgICAgICAgIG5hbWU6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLm5hbWVcbiAgICAgICAgICAgICAgcm93OiByb3dcbiAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg6IHBhcmVudFRva2VuSWR4ICAgICAgICMgcHRyIHRvIDx0YWdcbiAgICAgICAgICAgIGlmIHBhcmVudFRva2VuSWR4ID49IDBcbiAgICAgICAgICAgICAgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udGVybXNUaGlzVGFnc0F0dHJpYnV0ZXNJZHggPSBpZHhPZlRva2VuXG4gICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgPSBKU1hUQUdfU0VMRkNMT1NFX1NUQVJUXG4gICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnRlcm1zVGhpc1RhZ0lkeCA9IGlkeE9mVG9rZW5cbiAgICAgICAgICAgIGlkeE9mVG9rZW4rK1xuXG4gICAgICAgICAgIyB0YWdzIGVuZGluZyA+XG4gICAgICAgICAgd2hlbiBKU1hUQUdfQ0xPU0VfQVRUUlNcbiAgICAgICAgICAgIHRva2VuT25UaGlzTGluZSA9IHRydWVcbiAgICAgICAgICAgIGlmIGlzRmlyc3RUb2tlbk9mTGluZVxuICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICAgICNpZiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5maXJzdFRhZ0luTGluZUluZGVudGF0aW9uIGlzIGZpcnN0Q2hhckluZGVudGF0aW9uXG4gICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRGb3JDbG9zaW5nQnJhY2tldCAgcm93LFxuICAgICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLFxuICAgICAgICAgICAgICAgIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeENsb3NpbmdCcmFja2V0TG9jYXRpb25bMV0ubm9uRW1wdHlcblxuICAgICAgICAgICAgIyByZS1wYXJzZSBsaW5lIGlmIGluZGVudCBkaWQgc29tZXRoaW5nIHRvIGl0XG4gICAgICAgICAgICBpZiBpbmRlbnRSZWNhbGNcbiAgICAgICAgICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG4gICAgICAgICAgICAgIEBKU1hSRUdFWFAubGFzdEluZGV4ID0gMCAjZm9yY2UgcmVnZXggdG8gc3RhcnQgYWdhaW5cbiAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaXNGaXJzdFRhZ09mQmxvY2sgPSBmYWxzZVxuICAgICAgICAgICAgaXNGaXJzdFRva2VuT2ZMaW5lID0gZmFsc2VcblxuICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgdG9rZW5TdGFjay5wdXNoXG4gICAgICAgICAgICAgIHR5cGU6IEpTWFRBR19DTE9TRV9BVFRSU1xuICAgICAgICAgICAgICBuYW1lOiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5uYW1lXG4gICAgICAgICAgICAgIHJvdzogcm93XG4gICAgICAgICAgICAgIHBhcmVudFRva2VuSWR4OiBwYXJlbnRUb2tlbklkeCAgICAgICAgICAgICMgcHRyIHRvIDx0YWdcbiAgICAgICAgICAgIGlmIHBhcmVudFRva2VuSWR4ID49IDAgdGhlbiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50ZXJtc1RoaXNUYWdzQXR0cmlidXRlc0lkeCA9IGlkeE9mVG9rZW5cbiAgICAgICAgICAgIGlkeE9mVG9rZW4rK1xuXG4gICAgICAgICAgIyBlbWJlZGVkIGV4cHJlc3Npb24gc3RhcnQge1xuICAgICAgICAgIHdoZW4gSlNYQlJBQ0VfT1BFTlxuICAgICAgICAgICAgdG9rZW5PblRoaXNMaW5lID0gdHJ1ZVxuICAgICAgICAgICAgaWYgaXNGaXJzdFRva2VuT2ZMaW5lXG4gICAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgICAgaWYgcGFyZW50VG9rZW5JZHg/XG4gICAgICAgICAgICAgICAgaWYgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udHlwZSBpcyBKU1hUQUdfT1BFTiBhbmQgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udGVybXNUaGlzVGFnc0F0dHJpYnV0ZXNJZHggaXMgbnVsbFxuICAgICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50UHJvcHM6IDF9KVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudDogMX0gKVxuXG4gICAgICAgICAgICAjIHJlLXBhcnNlIGxpbmUgaWYgaW5kZW50IGRpZCBzb21ldGhpbmcgdG8gaXRcbiAgICAgICAgICAgIGlmIGluZGVudFJlY2FsY1xuICAgICAgICAgICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyByb3dcbiAgICAgICAgICAgICAgQEpTWFJFR0VYUC5sYXN0SW5kZXggPSAwICNmb3JjZSByZWdleCB0byBzdGFydCBhZ2FpblxuICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpc0ZpcnN0VGFnT2ZCbG9jayA9IHRydWUgICMgdGhpcyBtYXkgYmUgdGhlIHN0YXJ0IG9mIGEgbmV3IEpTWCBibG9ja1xuICAgICAgICAgICAgaXNGaXJzdFRva2VuT2ZMaW5lID0gZmFsc2VcblxuICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgdG9rZW5TdGFjay5wdXNoXG4gICAgICAgICAgICAgIHR5cGU6IHRva2VuXG4gICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgIHJvdzogcm93XG4gICAgICAgICAgICAgIGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb246IGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb25cbiAgICAgICAgICAgICAgdG9rZW5JbmRlbnRhdGlvbjogdG9rZW5JbmRlbnRhdGlvblxuICAgICAgICAgICAgICBmaXJzdENoYXJJbmRlbnRhdGlvbjogZmlyc3RDaGFySW5kZW50YXRpb25cbiAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg6IHBhcmVudFRva2VuSWR4XG4gICAgICAgICAgICAgIHRlcm1zVGhpc1RhZ3NBdHRyaWJ1dGVzSWR4OiBudWxsICAjIHB0ciB0byA+IHRhZ1xuICAgICAgICAgICAgICB0ZXJtc1RoaXNUYWdJZHg6IG51bGwgICAgICAgICAgICAgIyBwdHIgdG8gPC90YWc+XG5cbiAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBpZHhPZlRva2VuXG4gICAgICAgICAgICBpZHhPZlRva2VuKytcblxuICAgICAgICAgICMgdGVybmFyeSBzdGFydFxuICAgICAgICAgIHdoZW4gVEVSTkFSWV9JRlxuICAgICAgICAgICAgdG9rZW5PblRoaXNMaW5lID0gdHJ1ZVxuICAgICAgICAgICAgaWYgaXNGaXJzdFRva2VuT2ZMaW5lXG4gICAgICAgICAgICAgICMgaXMgdGhpcyB0ZXJuYXJ5IHN0YXJ0aW5nIGEgbmV3IGxpbmVcbiAgICAgICAgICAgICAgaWYgZmlyc3RDaGFySW5kZW50YXRpb24gaXMgdG9rZW5JbmRlbnRhdGlvblxuICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogQGdldEluZGVudE9mUHJldmlvdXNSb3cocm93KSwganN4SW5kZW50OiAxfSlcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgICAgICBpZiBwYXJlbnRUb2tlbklkeD9cbiAgICAgICAgICAgICAgICAgIGlmIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgaXMgSlNYVEFHX09QRU4gYW5kIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnRlcm1zVGhpc1RhZ3NBdHRyaWJ1dGVzSWR4IGlzIG51bGxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50UHJvcHM6IDF9KVxuICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnQ6IDF9IClcblxuXG4gICAgICAgICAgICAjIHJlLXBhcnNlIGxpbmUgaWYgaW5kZW50IGRpZCBzb21ldGhpbmcgdG8gaXRcbiAgICAgICAgICAgIGlmIGluZGVudFJlY2FsY1xuICAgICAgICAgICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyByb3dcbiAgICAgICAgICAgICAgQEpTWFJFR0VYUC5sYXN0SW5kZXggPSAwICNmb3JjZSByZWdleCB0byBzdGFydCBhZ2FpblxuICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpc0ZpcnN0VGFnT2ZCbG9jayA9IHRydWUgICMgdGhpcyBtYXkgYmUgdGhlIHN0YXJ0IG9mIGEgbmV3IEpTWCBibG9ja1xuICAgICAgICAgICAgaXNGaXJzdFRva2VuT2ZMaW5lID0gZmFsc2VcblxuICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgdG9rZW5TdGFjay5wdXNoXG4gICAgICAgICAgICAgIHR5cGU6IHRva2VuXG4gICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgIHJvdzogcm93XG4gICAgICAgICAgICAgIGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb246IGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb25cbiAgICAgICAgICAgICAgdG9rZW5JbmRlbnRhdGlvbjogdG9rZW5JbmRlbnRhdGlvblxuICAgICAgICAgICAgICBmaXJzdENoYXJJbmRlbnRhdGlvbjogZmlyc3RDaGFySW5kZW50YXRpb25cbiAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg6IHBhcmVudFRva2VuSWR4XG4gICAgICAgICAgICAgIHRlcm1zVGhpc1RhZ3NBdHRyaWJ1dGVzSWR4OiBudWxsICAjIHB0ciB0byA+IHRhZ1xuICAgICAgICAgICAgICB0ZXJtc1RoaXNUYWdJZHg6IG51bGwgICAgICAgICAgICAgIyBwdHIgdG8gPC90YWc+XG5cbiAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBpZHhPZlRva2VuXG4gICAgICAgICAgICBpZHhPZlRva2VuKytcblxuICAgICAgICAgICMgZW1iZWRlZCBleHByZXNzaW9uIGVuZCB9XG4gICAgICAgICAgd2hlbiBKU1hCUkFDRV9DTE9TRSwgVEVSTkFSWV9FTFNFXG4gICAgICAgICAgICB0b2tlbk9uVGhpc0xpbmUgPSB0cnVlXG5cbiAgICAgICAgICAgIGlmIGlzRmlyc3RUb2tlbk9mTGluZVxuICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24gfSlcblxuICAgICAgICAgICAgaWYgaW5kZW50UmVjYWxjXG4gICAgICAgICAgICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IHJvd1xuICAgICAgICAgICAgICBASlNYUkVHRVhQLmxhc3RJbmRleCA9IDAgI2ZvcmNlIHJlZ2V4IHRvIHN0YXJ0IGFnYWluXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlzRmlyc3RUYWdPZkJsb2NrID0gZmFsc2VcbiAgICAgICAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgdG9rZW5TdGFjay5wdXNoXG4gICAgICAgICAgICAgIHR5cGU6IHRva2VuXG4gICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgIHJvdzogcm93XG4gICAgICAgICAgICAgIHBhcmVudFRva2VuSWR4OiBwYXJlbnRUb2tlbklkeCAgICAgICAgICMgcHRyIHRvIG9wZW5pbmcgdG9rZW5cblxuICAgICAgICAgICAgaWYgcGFyZW50VG9rZW5JZHggPj0wIHRoZW4gdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udGVybXNUaGlzVGFnSWR4ID0gaWR4T2ZUb2tlblxuICAgICAgICAgICAgaWR4T2ZUb2tlbisrXG5cbiAgICAgICAgICAjIEphdmFzY3JpcHQgYnJhY2UgU3RhcnQgeyBvciBzd2l0Y2ggYnJhY2Ugc3RhcnQgeyBvciBwYXJlbiAoIG9yIGJhY2stdGljayBgc3RhcnRcbiAgICAgICAgICB3aGVuIEJSQUNFX09QRU4sIFNXSVRDSF9CUkFDRV9PUEVOLCBQQVJFTl9PUEVOLCBURU1QTEFURV9TVEFSVFxuICAgICAgICAgICAgdG9rZW5PblRoaXNMaW5lID0gdHJ1ZVxuICAgICAgICAgICAgaWYgdG9rZW4gaXMgVEVNUExBVEVfU1RBUlQgdGhlbiBAdGVtcGxhdGVEZXB0aCsrXG4gICAgICAgICAgICBpZiBpc0ZpcnN0VG9rZW5PZkxpbmVcbiAgICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgICBpZiBpc0ZpcnN0VGFnT2ZCbG9jayBhbmRcbiAgICAgICAgICAgICAgICAgIHBhcmVudFRva2VuSWR4PyBhbmRcbiAgICAgICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgaXMgdG9rZW4gYW5kXG4gICAgICAgICAgICAgICAgICB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5yb3cgaXMgKCByb3cgLSAxKVxuICAgICAgICAgICAgICAgICAgICB0b2tlbkluZGVudGF0aW9uID0gZmlyc3RDaGFySW5kZW50YXRpb24gPVxuICAgICAgICAgICAgICAgICAgICAgIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFsxXSArIEBnZXRJbmRlbnRPZlByZXZpb3VzUm93IHJvd1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IGZpcnN0Q2hhckluZGVudGF0aW9ufSlcbiAgICAgICAgICAgICAgZWxzZSBpZiBwYXJlbnRUb2tlbklkeD8gYW5kIEB0ZXJuYXJ5VGVybWluYXRlc1ByZXZpb3VzTGluZShyb3cpXG4gICAgICAgICAgICAgICAgZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvbiA9ICB0b2tlbkluZGVudGF0aW9uXG4gICAgICAgICAgICAgICAgZmlyc3RDaGFySW5kZW50YXRpb24gPSBAZ2V0SW5kZW50T2ZQcmV2aW91c1Jvdyhyb3cpXG4gICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3cgLCBibG9ja0luZGVudDogZmlyc3RDaGFySW5kZW50YXRpb24gfSlcbiAgICAgICAgICAgICAgZWxzZSBpZiBwYXJlbnRUb2tlbklkeD9cbiAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnQ6IDEgfSApXG5cbiAgICAgICAgICAgICMgcmUtcGFyc2UgbGluZSBpZiBpbmRlbnQgZGlkIHNvbWV0aGluZyB0byBpdFxuICAgICAgICAgICAgaWYgaW5kZW50UmVjYWxjXG4gICAgICAgICAgICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IHJvd1xuICAgICAgICAgICAgICBASlNYUkVHRVhQLmxhc3RJbmRleCA9IDAgI2ZvcmNlIHJlZ2V4IHRvIHN0YXJ0IGFnYWluXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgIHRva2VuU3RhY2sucHVzaFxuICAgICAgICAgICAgICB0eXBlOiB0b2tlblxuICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICByb3c6IHJvd1xuICAgICAgICAgICAgICBmaXJzdFRhZ0luTGluZUluZGVudGF0aW9uOiBmaXJzdFRhZ0luTGluZUluZGVudGF0aW9uXG4gICAgICAgICAgICAgIHRva2VuSW5kZW50YXRpb246IHRva2VuSW5kZW50YXRpb25cbiAgICAgICAgICAgICAgZmlyc3RDaGFySW5kZW50YXRpb246IGZpcnN0Q2hhckluZGVudGF0aW9uXG4gICAgICAgICAgICAgIHBhcmVudFRva2VuSWR4OiBwYXJlbnRUb2tlbklkeFxuICAgICAgICAgICAgICB0ZXJtc1RoaXNUYWdzQXR0cmlidXRlc0lkeDogbnVsbCAgIyBwdHIgdG8gPiB0YWdcbiAgICAgICAgICAgICAgdGVybXNUaGlzVGFnSWR4OiBudWxsICAgICAgICAgICAgICMgcHRyIHRvIDwvdGFnPlxuXG4gICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggaWR4T2ZUb2tlblxuICAgICAgICAgICAgaWR4T2ZUb2tlbisrXG5cbiAgICAgICAgICAjIEphdmFzY3JpcHQgYnJhY2UgRW5kIH0gb3Igc3dpdGNoIGJyYWNlIGVuZCB9IG9yIHBhcmVuIGNsb3NlICkgb3IgYmFjay10aWNrIGAgZW5kXG4gICAgICAgICAgd2hlbiBCUkFDRV9DTE9TRSwgU1dJVENIX0JSQUNFX0NMT1NFLCBQQVJFTl9DTE9TRSwgVEVNUExBVEVfRU5EXG5cbiAgICAgICAgICAgIGlmIHRva2VuIGlzIFNXSVRDSF9CUkFDRV9DTE9TRVxuICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICAgIGlmIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgaXMgU1dJVENIX0NBU0Ugb3IgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udHlwZSBpcyBTV0lUQ0hfREVGQVVMVFxuICAgICAgICAgICAgICAgICMgd2Ugb25seSBhbGxvdyBhIHNpbmdsZSBjYXNlL2RlZmF1bHQgc3RhY2sgZWxlbWVudCBwZXIgc3dpdGNoIGluc3RhbmNlXG4gICAgICAgICAgICAgICAgIyBzbyBub3cgd2UgYXJlIGF0IHRoZSBzd2l0Y2gncyBjbG9zZSBicmFjZSB3ZSBwb3Agb2ZmIGFueSBjYXNlL2RlZmF1bHQgdG9rZW5zXG4gICAgICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuXG4gICAgICAgICAgICB0b2tlbk9uVGhpc0xpbmUgPSB0cnVlXG4gICAgICAgICAgICBpZiBpc0ZpcnN0VG9rZW5PZkxpbmVcbiAgICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgICBpZiBwYXJlbnRUb2tlbklkeD9cbiAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLmZpcnN0Q2hhckluZGVudGF0aW9uIH0pXG5cbiAgICAgICAgICAgICMgcmUtcGFyc2UgbGluZSBpZiBpbmRlbnQgZGlkIHNvbWV0aGluZyB0byBpdFxuICAgICAgICAgICAgaWYgaW5kZW50UmVjYWxjXG4gICAgICAgICAgICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IHJvd1xuICAgICAgICAgICAgICBASlNYUkVHRVhQLmxhc3RJbmRleCA9IDAgI2ZvcmNlIHJlZ2V4IHRvIHN0YXJ0IGFnYWluXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgaWYgcGFyZW50VG9rZW5JZHg/XG4gICAgICAgICAgICAgIHRva2VuU3RhY2sucHVzaFxuICAgICAgICAgICAgICAgIHR5cGU6IHRva2VuXG4gICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICByb3c6IHJvd1xuICAgICAgICAgICAgICAgIHBhcmVudFRva2VuSWR4OiBwYXJlbnRUb2tlbklkeCAgICAgICAgICMgcHRyIHRvIDx0YWdcbiAgICAgICAgICAgICAgaWYgcGFyZW50VG9rZW5JZHggPj0wIHRoZW4gdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udGVybXNUaGlzVGFnSWR4ID0gaWR4T2ZUb2tlblxuICAgICAgICAgICAgICBpZHhPZlRva2VuKytcblxuICAgICAgICAgICAgaWYgdG9rZW4gaXMgVEVNUExBVEVfRU5EIHRoZW4gQHRlbXBsYXRlRGVwdGgtLVxuXG4gICAgICAgICAgIyBjYXNlLCBkZWZhdWx0IHN0YXRlbWVudCBvZiBzd2l0Y2hcbiAgICAgICAgICB3aGVuIFNXSVRDSF9DQVNFLCBTV0lUQ0hfREVGQVVMVFxuICAgICAgICAgICAgdG9rZW5PblRoaXNMaW5lID0gdHJ1ZVxuICAgICAgICAgICAgaXNGaXJzdFRhZ09mQmxvY2sgPSB0cnVlXG4gICAgICAgICAgICBpZiBpc0ZpcnN0VG9rZW5PZkxpbmVcbiAgICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgICBpZiBwYXJlbnRUb2tlbklkeD9cbiAgICAgICAgICAgICAgICBpZiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50eXBlIGlzIFNXSVRDSF9DQVNFIG9yIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgaXMgU1dJVENIX0RFRkFVTFRcbiAgICAgICAgICAgICAgICAgICMgd2Ugb25seSBhbGxvdyBhIHNpbmdsZSBjYXNlL2RlZmF1bHQgc3RhY2sgZWxlbWVudCBwZXIgc3dpdGNoIGluc3RhbmNlXG4gICAgICAgICAgICAgICAgICAjIHNvIHBvc2l0aW9uIG5ldyBjYXNlL2RlZmF1bHQgdG8gdGhlIGxhc3Qgb25lcyBwb3NpdGlvbiBhbmQgdGhlbiBwb3AgdGhlIGxhc3Qnc1xuICAgICAgICAgICAgICAgICAgIyBvZmYgdGhlIHN0YWNrLlxuICAgICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5maXJzdENoYXJJbmRlbnRhdGlvbiB9KVxuICAgICAgICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udHlwZSBpcyBTV0lUQ0hfQlJBQ0VfT1BFTlxuICAgICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50OiAxIH0pXG5cbiAgICAgICAgICAgICMgcmUtcGFyc2UgbGluZSBpZiBpbmRlbnQgZGlkIHNvbWV0aGluZyB0byBpdFxuICAgICAgICAgICAgaWYgaW5kZW50UmVjYWxjXG4gICAgICAgICAgICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IHJvd1xuICAgICAgICAgICAgICBASlNYUkVHRVhQLmxhc3RJbmRleCA9IDAgI2ZvcmNlIHJlZ2V4IHRvIHN0YXJ0IGFnYWluXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcblxuICAgICAgICAgICAgdG9rZW5TdGFjay5wdXNoXG4gICAgICAgICAgICAgIHR5cGU6IHRva2VuXG4gICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgIHJvdzogcm93XG4gICAgICAgICAgICAgIGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb246IGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb25cbiAgICAgICAgICAgICAgdG9rZW5JbmRlbnRhdGlvbjogdG9rZW5JbmRlbnRhdGlvblxuICAgICAgICAgICAgICBmaXJzdENoYXJJbmRlbnRhdGlvbjogZmlyc3RDaGFySW5kZW50YXRpb25cbiAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg6IHBhcmVudFRva2VuSWR4XG4gICAgICAgICAgICAgIHRlcm1zVGhpc1RhZ3NBdHRyaWJ1dGVzSWR4OiBudWxsICAjIHB0ciB0byA+IHRhZ1xuICAgICAgICAgICAgICB0ZXJtc1RoaXNUYWdJZHg6IG51bGwgICAgICAgICAgICAgIyBwdHIgdG8gPC90YWc+XG5cbiAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBpZHhPZlRva2VuXG4gICAgICAgICAgICBpZHhPZlRva2VuKytcblxuICAgICAgICAgICMgVGVybmFyeSBhbmQgY29uZGl0aW9uYWwgaWYvZWxzZSBvcGVyYXRvcnNcbiAgICAgICAgICB3aGVuIEpTX0lGLCBKU19FTFNFLCBKU19SRVRVUk5cbiAgICAgICAgICAgIGlzRmlyc3RUYWdPZkJsb2NrID0gdHJ1ZVxuXG4gICAgICAjIGhhbmRsZSBsaW5lcyB3aXRoIG5vIHRva2VuIG9uIHRoZW1cbiAgICAgIGlmIGlkeE9mVG9rZW4gYW5kIG5vdCB0b2tlbk9uVGhpc0xpbmVcbiAgICAgICAgIyBpbmRlbnQgbGluZXMgYnV0IHJlbW92ZSBhbnkgYmxhbmsgbGluZXMgd2l0aCB3aGl0ZSBzcGFjZSBleGNlcHQgdGhlIGxhc3Qgcm93XG4gICAgICAgIGlmIHJvdyBpc250IHJhbmdlLmVuZC5yb3dcbiAgICAgICAgICBibGFua0xpbmVFbmRQb3MgPSAvXlxccyokLy5leGVjKEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KSk/WzBdLmxlbmd0aFxuICAgICAgICAgIGlmIGJsYW5rTGluZUVuZFBvcz9cbiAgICAgICAgICAgIEBpbmRlbnRSb3coe3Jvdzogcm93ICwgYmxvY2tJbmRlbnQ6IDAgfSlcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAaW5kZW50VW50b2tlbmlzZWRMaW5lIHJvdywgdG9rZW5TdGFjaywgc3RhY2tPZlRva2Vuc1N0aWxsT3BlblxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGluZGVudFVudG9rZW5pc2VkTGluZSByb3csIHRva2VuU3RhY2ssIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW5cblxuXG4gICMgaW5kZW50IGFueSBsaW5lcyB0aGF0IGhhdmVuJ3QgYW55IGludGVyZXN0aW5nIHRva2Vuc1xuICBpbmRlbnRVbnRva2VuaXNlZExpbmU6IChyb3csIHRva2VuU3RhY2ssIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4gKSAtPlxuICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICByZXR1cm4gaWYgbm90IHBhcmVudFRva2VuSWR4P1xuICAgIHRva2VuID0gdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF1cbiAgICBzd2l0Y2ggdG9rZW4udHlwZVxuICAgICAgd2hlbiBKU1hUQUdfT1BFTiwgSlNYVEFHX1NFTEZDTE9TRV9TVEFSVFxuICAgICAgICBpZiAgdG9rZW4udGVybXNUaGlzVGFnc0F0dHJpYnV0ZXNJZHggaXMgbnVsbFxuICAgICAgICAgIEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW4uZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudFByb3BzOiAxIH0pXG4gICAgICAgIGVsc2UgQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlbi5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50OiAxIH0pXG4gICAgICB3aGVuIEpTWEJSQUNFX09QRU4sIFRFUk5BUllfSUZcbiAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlbi5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50OiAxLCBhbGxvd0FkZGl0aW9uYWxJbmRlbnRzOiB0cnVlfSlcbiAgICAgIHdoZW4gQlJBQ0VfT1BFTiwgU1dJVENIX0JSQUNFX09QRU4sIFBBUkVOX09QRU5cbiAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlbi5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50OiAxLCBhbGxvd0FkZGl0aW9uYWxJbmRlbnRzOiB0cnVlfSlcbiAgICAgIHdoZW4gSlNYVEFHX1NFTEZDTE9TRV9FTkQsIEpTWEJSQUNFX0NMT1NFLCBKU1hUQUdfQ0xPU0VfQVRUUlMsIFRFUk5BUllfRUxTRVxuICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuU3RhY2tbdG9rZW4ucGFyZW50VG9rZW5JZHhdLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnRQcm9wczogMX0pXG4gICAgICB3aGVuIEJSQUNFX0NMT1NFLCBTV0lUQ0hfQlJBQ0VfQ0xPU0UsIFBBUkVOX0NMT1NFXG4gICAgICAgIEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW5TdGFja1t0b2tlbi5wYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudDogMSwgYWxsb3dBZGRpdGlvbmFsSW5kZW50czogdHJ1ZX0pXG4gICAgICB3aGVuIFNXSVRDSF9DQVNFLCBTV0lUQ0hfREVGQVVMVFxuICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnQ6IDEgfSlcbiAgICAgIHdoZW4gVEVNUExBVEVfU1RBUlQsIFRFTVBMQVRFX0VORFxuICAgICAgICByZXR1cm47ICMgZG9uJ3QgdG91Y2ggdGVtcGxhdGVzXG5cbiAgIyBnZXQgdGhlIHRva2VuIGF0IHRoZSBnaXZlbiBtYXRjaCBwb3NpdGlvbiBvciByZXR1cm4gdHJ1dGh5IGZhbHNlXG4gIGdldFRva2VuOiAoYnVmZmVyUm93LCBtYXRjaCkgLT5cbiAgICBzY29wZSA9IEBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oW2J1ZmZlclJvdywgbWF0Y2guaW5kZXhdKS5nZXRTY29wZXNBcnJheSgpLnBvcCgpXG4gICAgaWYgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24udGFnLmpzeCcgaXMgc2NvcGVcbiAgICAgIGlmICAgICAgbWF0Y2hbMV0/IHRoZW4gcmV0dXJuIEpTWFRBR19PUEVOXG4gICAgICBlbHNlIGlmIG1hdGNoWzNdPyB0aGVuIHJldHVybiBKU1hUQUdfU0VMRkNMT1NFX0VORFxuICAgIGVsc2UgaWYgJ0pTWEVuZFRhZ1N0YXJ0JyBpcyBzY29wZVxuICAgICAgaWYgbWF0Y2hbNF0/IHRoZW4gcmV0dXJuIEpTWFRBR19DTE9TRVxuICAgIGVsc2UgaWYgJ0pTWFN0YXJ0VGFnRW5kJyBpcyBzY29wZVxuICAgICAgaWYgbWF0Y2hbN10/IHRoZW4gcmV0dXJuIEpTWFRBR19DTE9TRV9BVFRSU1xuICAgIGVsc2UgaWYgbWF0Y2hbOF0/XG4gICAgICBpZiAncHVuY3R1YXRpb24uc2VjdGlvbi5lbWJlZGRlZC5iZWdpbi5qc3gnIGlzIHNjb3BlXG4gICAgICAgIHJldHVybiBKU1hCUkFDRV9PUEVOXG4gICAgICBlbHNlIGlmICdtZXRhLmJyYWNlLmN1cmx5LnN3aXRjaFN0YXJ0LmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gU1dJVENIX0JSQUNFX09QRU5cbiAgICAgIGVsc2UgaWYgJ21ldGEuYnJhY2UuY3VybHkuanMnIGlzIHNjb3BlIG9yXG4gICAgICAgICdtZXRhLmJyYWNlLmN1cmx5LmxpdG9iai5qcycgaXMgc2NvcGVcbiAgICAgICAgICByZXR1cm4gQlJBQ0VfT1BFTlxuICAgIGVsc2UgaWYgbWF0Y2hbOV0/XG4gICAgICBpZiAncHVuY3R1YXRpb24uc2VjdGlvbi5lbWJlZGRlZC5lbmQuanN4JyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gSlNYQlJBQ0VfQ0xPU0VcbiAgICAgIGVsc2UgaWYgJ21ldGEuYnJhY2UuY3VybHkuc3dpdGNoRW5kLmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gU1dJVENIX0JSQUNFX0NMT1NFXG4gICAgICBlbHNlIGlmICdtZXRhLmJyYWNlLmN1cmx5LmpzJyBpcyBzY29wZSBvclxuICAgICAgICAnbWV0YS5icmFjZS5jdXJseS5saXRvYmouanMnIGlzIHNjb3BlXG4gICAgICAgICAgcmV0dXJuIEJSQUNFX0NMT1NFXG4gICAgZWxzZSBpZiBtYXRjaFsxMF0/XG4gICAgICBpZiAna2V5d29yZC5vcGVyYXRvci50ZXJuYXJ5LmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gVEVSTkFSWV9JRlxuICAgIGVsc2UgaWYgbWF0Y2hbMTFdP1xuICAgICAgaWYgJ2tleXdvcmQub3BlcmF0b3IudGVybmFyeS5qcycgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIFRFUk5BUllfRUxTRVxuICAgIGVsc2UgaWYgbWF0Y2hbMTJdP1xuICAgICAgaWYgJ2tleXdvcmQuY29udHJvbC5jb25kaXRpb25hbC5qcycgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIEpTX0lGXG4gICAgZWxzZSBpZiBtYXRjaFsxM10/XG4gICAgICBpZiAna2V5d29yZC5jb250cm9sLmNvbmRpdGlvbmFsLmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gSlNfRUxTRVxuICAgIGVsc2UgaWYgbWF0Y2hbMTRdP1xuICAgICAgaWYgJ2tleXdvcmQuY29udHJvbC5zd2l0Y2guanMnIGlzIHNjb3BlXG4gICAgICAgIHJldHVybiBTV0lUQ0hfQ0FTRVxuICAgIGVsc2UgaWYgbWF0Y2hbMTVdP1xuICAgICAgaWYgJ2tleXdvcmQuY29udHJvbC5zd2l0Y2guanMnIGlzIHNjb3BlXG4gICAgICAgIHJldHVybiBTV0lUQ0hfREVGQVVMVFxuICAgIGVsc2UgaWYgbWF0Y2hbMTZdP1xuICAgICAgaWYgJ2tleXdvcmQuY29udHJvbC5mbG93LmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gSlNfUkVUVVJOXG4gICAgZWxzZSBpZiBtYXRjaFsxN10/XG4gICAgICBpZiAnbWV0YS5icmFjZS5yb3VuZC5qcycgaXMgc2NvcGUgb3JcbiAgICAgICAnbWV0YS5icmFjZS5yb3VuZC5ncmFwaHFsJyBpcyBzY29wZSBvclxuICAgICAgICdtZXRhLmJyYWNlLnJvdW5kLmRpcmVjdGl2ZS5ncmFwaHFsJyBpcyBzY29wZVxuICAgICAgICAgIHJldHVybiBQQVJFTl9PUEVOXG4gICAgZWxzZSBpZiBtYXRjaFsxOF0/XG4gICAgICBpZiAnbWV0YS5icmFjZS5yb3VuZC5qcycgaXMgc2NvcGUgb3JcbiAgICAgICAnbWV0YS5icmFjZS5yb3VuZC5ncmFwaHFsJyBpcyBzY29wZSBvclxuICAgICAgICdtZXRhLmJyYWNlLnJvdW5kLmRpcmVjdGl2ZS5ncmFwaHFsJyBpcyBzY29wZVxuICAgICAgICAgIHJldHVybiBQQVJFTl9DTE9TRVxuICAgIGVsc2UgaWYgbWF0Y2hbMTldP1xuICAgICAgaWYgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24ucXVhc2kuYmVnaW4uanMnIGlzIHNjb3BlXG4gICAgICAgIHJldHVybiBURU1QTEFURV9TVEFSVFxuICAgICAgaWYgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24ucXVhc2kuZW5kLmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gVEVNUExBVEVfRU5EXG5cbiAgICByZXR1cm4gTk9fVE9LRU5cblxuXG4gICMgZ2V0IGluZGVudCBvZiB0aGUgcHJldmlvdXMgcm93IHdpdGggY2hhcnMgaW4gaXRcbiAgZ2V0SW5kZW50T2ZQcmV2aW91c1JvdzogKHJvdykgLT5cbiAgICByZXR1cm4gMCB1bmxlc3Mgcm93XG4gICAgZm9yIHJvdyBpbiBbcm93LTEuLi4wXVxuICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG4gICAgICByZXR1cm4gQGVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyByb3cgaWYgIC8uKlxcUy8udGVzdCBsaW5lXG4gICAgcmV0dXJuIDBcblxuICAjIGdldCBlc2xpbnQgdHJhbnNsYXRlZCBpbmRlbnQgb3B0aW9uc1xuICBnZXRJbmRlbnRPcHRpb25zOiAoKSAtPlxuICAgIGlmIG5vdCBAYXV0b0pzeCB0aGVuIHJldHVybiBAdHJhbnNsYXRlSW5kZW50T3B0aW9ucygpXG4gICAgaWYgZXNsaW50cmNGaWxlbmFtZSA9IEBnZXRFc2xpbnRyY0ZpbGVuYW1lKClcbiAgICAgIGVzbGludHJjRmlsZW5hbWUgPSBuZXcgRmlsZShlc2xpbnRyY0ZpbGVuYW1lKVxuICAgICAgQHRyYW5zbGF0ZUluZGVudE9wdGlvbnMoQHJlYWRFc2xpbnRyY09wdGlvbnMoZXNsaW50cmNGaWxlbmFtZS5nZXRQYXRoKCkpKVxuICAgIGVsc2VcbiAgICAgIEB0cmFuc2xhdGVJbmRlbnRPcHRpb25zKHt9KSAjIGdldCBkZWZhdWx0c1xuXG4gICMgcmV0dXJuIHRleHQgc3RyaW5nIG9mIGEgcHJvamVjdCBiYXNlZCAuZXNsaW50cmMgZmlsZSBpZiBvbmUgZXhpc3RzXG4gIGdldEVzbGludHJjRmlsZW5hbWU6ICgpIC0+XG4gICAgcHJvamVjdENvbnRhaW5pbmdTb3VyY2UgPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGggQGVkaXRvci5nZXRQYXRoKClcbiAgICAjIElzIHRoZSBzb3VyY2VGaWxlIGxvY2F0ZWQgaW5zaWRlIGFuIEF0b20gcHJvamVjdCBmb2xkZXI/XG4gICAgaWYgcHJvamVjdENvbnRhaW5pbmdTb3VyY2VbMF0/XG4gICAgICBwYXRoLmpvaW4gcHJvamVjdENvbnRhaW5pbmdTb3VyY2VbMF0sICcuZXNsaW50cmMnXG5cbiAgIyBtb3VzZSBzdGF0ZVxuICBvbk1vdXNlRG93bjogKCkgPT5cbiAgICBAbW91c2VVcCA9IGZhbHNlXG5cbiAgIyBtb3VzZSBzdGF0ZVxuICBvbk1vdXNlVXA6ICgpID0+XG4gICAgQG1vdXNlVXAgPSB0cnVlXG5cbiAgIyB0byBjcmVhdGUgaW5kZW50cy4gV2UgY2FuIHJlYWQgYW5kIHJldHVybiB0aGUgcnVsZXMgcHJvcGVydGllcyBvciB1bmRlZmluZWRcbiAgcmVhZEVzbGludHJjT3B0aW9uczogKGVzbGludHJjRmlsZSkgLT5cbiAgICAjIGdldCBsb2NhbCBwYXRoIG92ZXJpZGVzXG4gICAgaWYgZnMuZXhpc3RzU3luYyBlc2xpbnRyY0ZpbGVcbiAgICAgIGZpbGVDb250ZW50ID0gc3RyaXBKc29uQ29tbWVudHMoZnMucmVhZEZpbGVTeW5jKGVzbGludHJjRmlsZSwgJ3V0ZjgnKSlcbiAgICAgIHRyeVxuICAgICAgICBlc2xpbnRSdWxlcyA9IChZQU1MLnNhZmVMb2FkIGZpbGVDb250ZW50KS5ydWxlc1xuICAgICAgICBpZiBlc2xpbnRSdWxlcyB0aGVuIHJldHVybiBlc2xpbnRSdWxlc1xuICAgICAgY2F0Y2ggZXJyXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcIkxCOiBFcnJvciByZWFkaW5nIC5lc2xpbnRyYyBhdCAje2VzbGludHJjRmlsZX1cIixcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgIGRldGFpbDogXCIje2Vyci5tZXNzYWdlfVwiXG4gICAgcmV0dXJuIHt9XG5cbiAgIyB1c2UgZXNsaW50IHJlYWN0IGZvcm1hdCBkZXNjcmliZWQgYXQgaHR0cDovL3Rpbnl1cmwuY29tL3A0bXRhdHZcbiAgIyB0dXJuIHNwYWNlcyBpbnRvIHRhYiBkaW1lbnNpb25zIHdoaWNoIGNhbiBiZSBkZWNpbWFsXG4gICMgYSBlbXB0eSBvYmplY3QgYXJndW1lbnQgcGFyc2VzIGJhY2sgdGhlIGRlZmF1bHQgc2V0dGluZ3NcbiAgdHJhbnNsYXRlSW5kZW50T3B0aW9uczogKGVzbGludFJ1bGVzKSAtPlxuICAgICMgRXNsaW50IHJ1bGVzIHRvIHVzZSBhcyBkZWZhdWx0IG92ZXJpZGRlbiBieSAuZXNsaW50cmNcbiAgICAjIE4uQi4gdGhhdCB0aGlzIGlzIG5vdCB0aGUgc2FtZSBhcyB0aGUgZXNsaW50IHJ1bGVzIGluIHRoYXRcbiAgICAjIHRoZSB0YWItc3BhY2VzIGFuZCAndGFiJ3MgaW4gZXNsaW50cmMgYXJlIGNvbnZlcnRlZCB0byB0YWJzIGJhc2VkIHVwb25cbiAgICAjIHRoZSBBdG9tIGVkaXRvciB0YWIgc3BhY2luZy5cbiAgICAjIGUuZy4gZXNsaW50IGluZGVudCBbMSw0XSB3aXRoIGFuIEF0b20gdGFiIHNwYWNpbmcgb2YgMiBiZWNvbWVzIGluZGVudCBbMSwyXVxuICAgIGVzbGludEluZGVudE9wdGlvbnMgID1cbiAgICAgIGpzeEluZGVudDogWzEsMV0gICAgICAgICAgICAjIDEgPSBlbmFibGVkLCAxPSN0YWJzXG4gICAgICBqc3hJbmRlbnRQcm9wczogWzEsMV0gICAgICAgIyAxID0gZW5hYmxlZCwgMT0jdGFic1xuICAgICAganN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvbjogW1xuICAgICAgICAxLFxuICAgICAgICBzZWxmQ2xvc2luZzogVEFHQUxJR05FRFxuICAgICAgICBub25FbXB0eTogVEFHQUxJR05FRFxuICAgICAgXVxuXG4gICAgcmV0dXJuIGVzbGludEluZGVudE9wdGlvbnMgdW5sZXNzIHR5cGVvZiBlc2xpbnRSdWxlcyBpcyBcIm9iamVjdFwiXG5cbiAgICBFU19ERUZBVUxUX0lOREVOVCA9IDQgIyBkZWZhdWx0IGVzbGludCBpbmRlbnQgYXMgc3BhY2VzXG5cbiAgICAjIHJlYWQgaW5kZW50IGlmIGl0IGV4aXN0cyBhbmQgdXNlIGl0IGFzIHRoZSBkZWZhdWx0IGluZGVudCBmb3IgSlNYXG4gICAgcnVsZSA9IGVzbGludFJ1bGVzWydpbmRlbnQnXVxuICAgIGlmIHR5cGVvZiBydWxlIGlzICdudW1iZXInIG9yIHR5cGVvZiBydWxlIGlzICdzdHJpbmcnXG4gICAgICBkZWZhdWx0SW5kZW50ICA9IEVTX0RFRkFVTFRfSU5ERU5UIC8gQGVkaXRvci5nZXRUYWJMZW5ndGgoKVxuICAgIGVsc2UgaWYgdHlwZW9mIHJ1bGUgaXMgJ29iamVjdCdcbiAgICAgIGlmIHR5cGVvZiBydWxlWzFdIGlzICdudW1iZXInXG4gICAgICAgIGRlZmF1bHRJbmRlbnQgID0gcnVsZVsxXSAvIEBlZGl0b3IuZ2V0VGFiTGVuZ3RoKClcbiAgICAgIGVsc2UgZGVmYXVsdEluZGVudCAgPSAxXG4gICAgZWxzZSBkZWZhdWx0SW5kZW50ICA9IDFcblxuICAgIHJ1bGUgPSBlc2xpbnRSdWxlc1sncmVhY3QvanN4LWluZGVudCddXG4gICAgaWYgdHlwZW9mIHJ1bGUgaXMgJ251bWJlcicgb3IgdHlwZW9mIHJ1bGUgaXMgJ3N0cmluZydcbiAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50WzBdID0gcnVsZVxuICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRbMV0gPSBFU19ERUZBVUxUX0lOREVOVCAvIEBlZGl0b3IuZ2V0VGFiTGVuZ3RoKClcbiAgICBlbHNlIGlmIHR5cGVvZiBydWxlIGlzICdvYmplY3QnXG4gICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFswXSA9IHJ1bGVbMF1cbiAgICAgIGlmIHR5cGVvZiBydWxlWzFdIGlzICdudW1iZXInXG4gICAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50WzFdID0gcnVsZVsxXSAvIEBlZGl0b3IuZ2V0VGFiTGVuZ3RoKClcbiAgICAgIGVsc2UgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRbMV0gPSAxXG4gICAgZWxzZSBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFsxXSA9IGRlZmF1bHRJbmRlbnRcblxuICAgIHJ1bGUgPSBlc2xpbnRSdWxlc1sncmVhY3QvanN4LWluZGVudC1wcm9wcyddXG4gICAgaWYgdHlwZW9mIHJ1bGUgaXMgJ251bWJlcicgb3IgdHlwZW9mIHJ1bGUgaXMgJ3N0cmluZydcbiAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50UHJvcHNbMF0gPSBydWxlXG4gICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFByb3BzWzFdID0gRVNfREVGQVVMVF9JTkRFTlQgLyBAZWRpdG9yLmdldFRhYkxlbmd0aCgpXG4gICAgZWxzZSBpZiB0eXBlb2YgcnVsZSBpcyAnb2JqZWN0J1xuICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRQcm9wc1swXSA9IHJ1bGVbMF1cbiAgICAgIGlmIHR5cGVvZiBydWxlWzFdIGlzICdudW1iZXInXG4gICAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50UHJvcHNbMV0gPSBydWxlWzFdIC8gQGVkaXRvci5nZXRUYWJMZW5ndGgoKVxuICAgICAgZWxzZSBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFByb3BzWzFdID0gMVxuICAgIGVsc2UgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRQcm9wc1sxXSA9IGRlZmF1bHRJbmRlbnRcblxuICAgIHJ1bGUgPSBlc2xpbnRSdWxlc1sncmVhY3QvanN4LWNsb3NpbmctYnJhY2tldC1sb2NhdGlvbiddXG4gICAgaWYgdHlwZW9mIHJ1bGUgaXMgJ251bWJlcicgb3IgdHlwZW9mIHJ1bGUgaXMgJ3N0cmluZydcbiAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvblswXSA9IHJ1bGVcbiAgICBlbHNlIGlmIHR5cGVvZiBydWxlIGlzICdvYmplY3QnICMgYXJyYXlcbiAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvblswXSA9IHJ1bGVbMF1cbiAgICAgIGlmIHR5cGVvZiBydWxlWzFdIGlzICdzdHJpbmcnXG4gICAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvblsxXS5zZWxmQ2xvc2luZyA9XG4gICAgICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uWzFdLm5vbkVtcHR5ID1cbiAgICAgICAgICAgIHJ1bGVbMV1cbiAgICAgIGVsc2VcbiAgICAgICAgaWYgcnVsZVsxXS5zZWxmQ2xvc2luZz9cbiAgICAgICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeENsb3NpbmdCcmFja2V0TG9jYXRpb25bMV0uc2VsZkNsb3NpbmcgPSBydWxlWzFdLnNlbGZDbG9zaW5nXG4gICAgICAgIGlmIHJ1bGVbMV0ubm9uRW1wdHk/XG4gICAgICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uWzFdLm5vbkVtcHR5ID0gcnVsZVsxXS5ub25FbXB0eVxuXG4gICAgcmV0dXJuIGVzbGludEluZGVudE9wdGlvbnNcblxuICAjIGRvZXMgdGhlIHByZXZpb3VzIGxpbmUgdGVybWluYXRlIHdpdGggYSB0ZXJuYXJ5IGVsc2UgOlxuICB0ZXJuYXJ5VGVybWluYXRlc1ByZXZpb3VzTGluZTogKHJvdykgLT5cbiAgICByb3ctLVxuICAgIHJldHVybiBmYWxzZSB1bmxlc3Mgcm93ID49MFxuICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IHJvd1xuICAgIG1hdGNoID0gLzpcXHMqJC8uZXhlYyhsaW5lKVxuICAgIHJldHVybiBmYWxzZSBpZiBtYXRjaCBpcyBudWxsXG4gICAgc2NvcGUgPSBAZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFtyb3csIG1hdGNoLmluZGV4XSkuZ2V0U2NvcGVzQXJyYXkoKS5wb3AoKVxuICAgIHJldHVybiBmYWxzZSBpZiBzY29wZSBpc250ICdrZXl3b3JkLm9wZXJhdG9yLnRlcm5hcnkuanMnXG4gICAgcmV0dXJuIHRydWVcblxuICAjIGFsbGlnbiBub25FbXB0eSBhbmQgc2VsZkNsb3NpbmcgdGFncyBiYXNlZCBvbiBlc2xpbnQgcnVsZXNcbiAgIyByb3cgdG8gYmUgaW5kZW50ZWQgYmFzZWQgdXBvbiBhIHBhcmVudFRhZ3MgcHJvcGVydGllcyBhbmQgYSBydWxlIHR5cGVcbiAgIyByZXR1cm5zIGluZGVudFJvdydzIHJldHVybiB2YWx1ZVxuICBpbmRlbnRGb3JDbG9zaW5nQnJhY2tldDogKCByb3csIHBhcmVudFRhZywgY2xvc2luZ0JyYWNrZXRSdWxlICkgLT5cbiAgICBpZiBAZXNsaW50SW5kZW50T3B0aW9ucy5qc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uWzBdXG4gICAgICBpZiBjbG9zaW5nQnJhY2tldFJ1bGUgaXMgVEFHQUxJR05FRFxuICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHBhcmVudFRhZy50b2tlbkluZGVudGF0aW9ufSlcbiAgICAgIGVsc2UgaWYgY2xvc2luZ0JyYWNrZXRSdWxlIGlzIExJTkVBTElHTkVEXG4gICAgICAgIEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogcGFyZW50VGFnLmZpcnN0Q2hhckluZGVudGF0aW9uIH0pXG4gICAgICBlbHNlIGlmIGNsb3NpbmdCcmFja2V0UnVsZSBpcyBBRlRFUlBST1BTXG4gICAgICAgICMgdGhpcyByZWFsbHkgaXNuJ3QgdmFsaWQgYXMgdGhpcyB0YWcgc2hvdWxkbid0IGJlIG9uIGEgbGluZSBieSBpdHNlbGZcbiAgICAgICAgIyBidXQgSSBkb24ndCByZWZvcm1hdCBsaW5lcyBqdXN0IGluZGVudCFcbiAgICAgICAgIyBpbmRlbnQgdG8gbWFrZSBpdCBsb29rIE9LIGFsdGhvdWdoIGl0IHdpbGwgZmFpbCBlc2xpbnRcbiAgICAgICAgaWYgQGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50UHJvcHNbMF1cbiAgICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdywgIGJsb2NrSW5kZW50OiBwYXJlbnRUYWcuZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudFByb3BzOiAxIH0pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdywgIGJsb2NrSW5kZW50OiBwYXJlbnRUYWcuZmlyc3RDaGFySW5kZW50YXRpb259KVxuICAgICAgZWxzZSBpZiBjbG9zaW5nQnJhY2tldFJ1bGUgaXMgUFJPUFNBTElHTkVEXG4gICAgICAgIGlmIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFByb3BzWzBdXG4gICAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csICBibG9ja0luZGVudDogcGFyZW50VGFnLnRva2VuSW5kZW50YXRpb24sanN4SW5kZW50UHJvcHM6IDF9KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csICBibG9ja0luZGVudDogcGFyZW50VGFnLnRva2VuSW5kZW50YXRpb259KVxuXG4gICMgaW5kZW50IGEgcm93IGJ5IHRoZSBhZGRpdGlvbiBvZiBvbmUgb3IgbW9yZSBpbmRlbnRzLlxuICAjIHJldHVybnMgZmFsc2UgaWYgbm8gaW5kZW50IHJlcXVpcmVkIGFzIGl0IGlzIGFscmVhZHkgY29ycmVjdFxuICAjIHJldHVybiB0cnVlIGlmIGluZGVudCB3YXMgcmVxdWlyZWRcbiAgIyBibG9ja0luZGVudCBpcyB0aGUgaW5kZW50IHRvIHRoZSBzdGFydCBvZiB0aGlzIGxvZ2ljYWwganN4IGJsb2NrXG4gICMgb3RoZXIgaW5kZW50cyBhcmUgdGhlIHJlcXVpcmVkIGluZGVudCBiYXNlZCBvbiBlc2xpbnQgY29uZGl0aW9ucyBmb3IgUmVhY3RcbiAgIyBvcHRpb24gY29udGFpbnMgcm93IHRvIGluZGVudCBhbmQgYWxsb3dBZGRpdGlvbmFsSW5kZW50cyBmbGFnXG4gIGluZGVudFJvdzogKG9wdGlvbnMpIC0+XG4gICAgeyByb3csIGFsbG93QWRkaXRpb25hbEluZGVudHMsIGJsb2NrSW5kZW50LCBqc3hJbmRlbnQsIGpzeEluZGVudFByb3BzIH0gPSBvcHRpb25zXG4gICAgaWYgQHRlbXBsYXRlRGVwdGggPiAwIHRoZW4gcmV0dXJuIGZhbHNlICMgZG9uJ3QgaW5kZW50IGluc2lkZSBhIHRlbXBsYXRlXG4gICAgIyBjYWxjIG92ZXJhbGwgaW5kZW50XG4gICAgaWYganN4SW5kZW50XG4gICAgICBpZiBAZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRbMF1cbiAgICAgICAgaWYgQGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50WzFdXG4gICAgICAgICAgYmxvY2tJbmRlbnQgKz0ganN4SW5kZW50ICogQGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50WzFdXG4gICAgaWYganN4SW5kZW50UHJvcHNcbiAgICAgIGlmIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFByb3BzWzBdXG4gICAgICAgIGlmIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFByb3BzWzFdXG4gICAgICAgICAgYmxvY2tJbmRlbnQgKz0ganN4SW5kZW50UHJvcHMgKiBAZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRQcm9wc1sxXVxuICAgICMgYWxsb3dBZGRpdGlvbmFsSW5kZW50cyBhbGxvd3MgaW5kZW50cyB0byBiZSBncmVhdGVyIHRoYW4gdGhlIG1pbmltdW1cbiAgICAjIHVzZWQgd2hlcmUgaXRlbXMgYXJlIGFsaWduZWQgYnV0IG5vIGVzbGludCBydWxlcyBhcmUgYXBwbGljYWJsZVxuICAgICMgc28gdXNlciBoYXMgc29tZSBkaXNjcmV0aW9uIGluIGFkZGluZyBtb3JlIGluZGVudHNcbiAgICBpZiBhbGxvd0FkZGl0aW9uYWxJbmRlbnRzXG4gICAgICBpZiBAZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdykgPCBibG9ja0luZGVudCBvclxuICAgICAgICBAZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdykgPiBibG9ja0luZGVudCArIGFsbG93QWRkaXRpb25hbEluZGVudHNcbiAgICAgICAgICBAZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93IHJvdywgYmxvY2tJbmRlbnQsIHsgcHJlc2VydmVMZWFkaW5nV2hpdGVzcGFjZTogZmFsc2UgfVxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZVxuICAgICAgaWYgQGVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpIGlzbnQgYmxvY2tJbmRlbnRcbiAgICAgICAgQGVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyByb3csIGJsb2NrSW5kZW50LCB7IHByZXNlcnZlTGVhZGluZ1doaXRlc3BhY2U6IGZhbHNlIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcbiJdfQ==
