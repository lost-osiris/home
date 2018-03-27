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
      if (selectedRange.start.row === selectedRange.end.row && selectedRange.start.column === selectedRange.end.column && indexOf.call(this.editor.scopeDescriptorForBufferPosition([selectedRange.start.row, selectedRange.start.column]).getScopesArray(), 'JSXStartTagEnd') >= 0) {
        return;
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
        line = this.editor.lineTextForBufferRow(row);
        while ((match = this.JSXREGEXP.exec(line)) !== null) {
          matchColumn = match.index;
          matchPointStart = new Point(row, matchColumn);
          matchPointEnd = new Point(row, matchColumn + match[0].length - 1);
          matchRange = new Range(matchPointStart, matchPointEnd);
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
          if (isFirstTokenOfLine) {
            firstTagInLineIndentation = tokenIndentation;
          }
          switch (token) {
            case JSXTAG_OPEN:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (isFirstTagOfBlock && (parentTokenIdx != null) && tokenStack[parentTokenIdx].type === BRACE_OPEN && tokenStack[parentTokenIdx].row === (row - 1)) {
                  tokenIndentation = firstCharIndentation = firstTagInLineIndentation = this.eslintIndentOptions.jsxIndent[1] + this.getIndentOfPreviousRow(row);
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
                if (firstTagInLineIndentation === firstCharIndentation) {
                  indentRecalc = this.indentForClosingBracket(row, tokenStack[parentTokenIdx], this.eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing);
                } else {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: tokenStack[parentTokenIdx].firstTagInLineIndentation,
                    jsxIndentProps: 1
                  });
                }
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
                if (firstTagInLineIndentation === firstCharIndentation) {
                  indentRecalc = this.indentForClosingBracket(row, tokenStack[parentTokenIdx], this.eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty);
                } else {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: tokenStack[parentTokenIdx].firstTagInLineIndentation,
                    jsxIndentProps: 1
                  });
                }
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
                type: JSXBRACE_OPEN,
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
                type: JSXBRACE_CLOSE,
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
            case TERNARY_IF:
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
      eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing = TAGALIGNED;
      eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty = TAGALIGNED;
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
              blockIndent: parentTag.firstCharIndentation,
              jsxIndentProps: 1
            });
          } else {
            return this.indentRow({
              row: row,
              blockIndent: parentTag.firstCharIndentation
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
        if (this.editor.indentationForBufferRow(row) < blockIndent) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWJhYmVsL2xpYi9hdXRvLWluZGVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDZmQUFBO0lBQUE7OztFQUFBLE1BQTRDLE9BQUEsQ0FBUSxNQUFSLENBQTVDLEVBQUMsNkNBQUQsRUFBc0IsZUFBdEIsRUFBNEIsaUJBQTVCLEVBQW1DOztFQUNuQyxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSOztFQUNsQixhQUFBLEdBQWdCLE9BQUEsQ0FBUSxtQkFBUjs7RUFDaEIsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHFCQUFSOztFQUNwQixJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVI7O0VBR1AsUUFBQSxHQUEwQjs7RUFDMUIsc0JBQUEsR0FBMEI7O0VBQzFCLG9CQUFBLEdBQTBCOztFQUMxQixXQUFBLEdBQTBCOztFQUMxQixrQkFBQSxHQUEwQjs7RUFDMUIsWUFBQSxHQUEwQjs7RUFDMUIsYUFBQSxHQUEwQjs7RUFDMUIsY0FBQSxHQUEwQjs7RUFDMUIsVUFBQSxHQUEwQjs7RUFDMUIsV0FBQSxHQUEwQjs7RUFDMUIsVUFBQSxHQUEwQjs7RUFDMUIsWUFBQSxHQUEwQjs7RUFDMUIsS0FBQSxHQUEwQjs7RUFDMUIsT0FBQSxHQUEwQjs7RUFDMUIsaUJBQUEsR0FBMEI7O0VBQzFCLGtCQUFBLEdBQTBCOztFQUMxQixXQUFBLEdBQTBCOztFQUMxQixjQUFBLEdBQTBCOztFQUMxQixTQUFBLEdBQTBCOztFQUMxQixVQUFBLEdBQTBCOztFQUMxQixXQUFBLEdBQTBCOztFQUMxQixjQUFBLEdBQTBCOztFQUMxQixZQUFBLEdBQTBCOztFQUcxQixVQUFBLEdBQWdCOztFQUNoQixXQUFBLEdBQWdCOztFQUNo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SUFBQyxDQUFBLG1CQUFtQixDQUFDLFNBQVUsQ0FBQSxDQUFBLEVBRDVEO1dBREY7U0FERjs7TUFJQSxJQUFHLGNBQUg7UUFDRSxJQUFHLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxjQUFlLENBQUEsQ0FBQSxDQUF2QztVQUNFLElBQUcsSUFBQyxDQUFBLG1CQUFtQixDQUFDLGNBQWUsQ0FBQSxDQUFBLENBQXZDO1lBQ0UsV0FBQSxJQUFlLGNBQUEsR0FBaUIsSUFBQyxDQUFBLG1CQUFtQixDQUFDLGNBQWUsQ0FBQSxDQUFBLEVBRHRFO1dBREY7U0FERjs7TUFPQSxJQUFHLHNCQUFIO1FBQ0UsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLEdBQWhDLENBQUEsR0FBdUMsV0FBMUM7VUFDRSxJQUFDLENBQUEsTUFBTSxDQUFDLDBCQUFSLENBQW1DLEdBQW5DLEVBQXdDLFdBQXhDLEVBQXFEO1lBQUUseUJBQUEsRUFBMkIsS0FBN0I7V0FBckQ7QUFDQSxpQkFBTyxLQUZUO1NBREY7T0FBQSxNQUFBO1FBS0UsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLEdBQWhDLENBQUEsS0FBMEMsV0FBN0M7VUFDRSxJQUFDLENBQUEsTUFBTSxDQUFDLDBCQUFSLENBQW1DLEdBQW5DLEVBQXdDLFdBQXhDLEVBQXFEO1lBQUUseUJBQUEsRUFBMkIsS0FBN0I7V0FBckQ7QUFDQSxpQkFBTyxLQUZUO1NBTEY7O0FBUUEsYUFBTztJQXZCRTs7Ozs7QUExd0JiIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGUsIEZpbGUsIFJhbmdlLCBQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5hdXRvQ29tcGxldGVKU1ggPSByZXF1aXJlICcuL2F1dG8tY29tcGxldGUtanN4J1xuRGlkSW5zZXJ0VGV4dCA9IHJlcXVpcmUgJy4vZGlkLWluc2VydC10ZXh0J1xuc3RyaXBKc29uQ29tbWVudHMgPSByZXF1aXJlICdzdHJpcC1qc29uLWNvbW1lbnRzJ1xuWUFNTCA9IHJlcXVpcmUgJ2pzLXlhbWwnXG5cblxuTk9fVE9LRU4gICAgICAgICAgICAgICAgPSAwXG5KU1hUQUdfU0VMRkNMT1NFX1NUQVJUICA9IDEgICAgICAgIyB0aGUgPHRhZyBpbiA8dGFnIC8+XG5KU1hUQUdfU0VMRkNMT1NFX0VORCAgICA9IDIgICAgICAgIyB0aGUgLz4gaW4gPHRhZyAvPlxuSlNYVEFHX09QRU4gICAgICAgICAgICAgPSAzICAgICAgICMgdGhlIDx0YWcgaW4gPHRhZz48L3RhZz5cbkpTWFRBR19DTE9TRV9BVFRSUyAgICAgID0gNCAgICAgICAjIHRoZSAxc3QgPiBpbiA8dGFnPjwvdGFnPlxuSlNYVEFHX0NMT1NFICAgICAgICAgICAgPSA1ICAgICAgICMgYSA8L3RhZz5cbkpTWEJSQUNFX09QRU4gICAgICAgICAgID0gNiAgICAgICAjIGVtYmVkZGVkIGV4cHJlc3Npb24gYnJhY2Ugc3RhcnQge1xuSlNYQlJBQ0VfQ0xPU0UgICAgICAgICAgPSA3ICAgICAgICMgZW1iZWRkZWQgZXhwcmVzc2lvbiBicmFjZSBlbmQgfVxuQlJBQ0VfT1BFTiAgICAgICAgICAgICAgPSA4ICAgICAgICMgSmF2YXNjcmlwdCBicmFjZVxuQlJBQ0VfQ0xPU0UgICAgICAgICAgICAgPSA5ICAgICAgICMgSmF2YXNjcmlwdCBicmFjZVxuVEVSTkFSWV9JRiAgICAgICAgICAgICAgPSAxMCAgICAgICMgVGVybmFyeSA/XG5URVJOQVJZX0VMU0UgICAgICAgICAgICA9IDExICAgICAgIyBUZXJuYXJ5IDpcbkpTX0lGICAgICAgICAgICAgICAgICAgID0gMTIgICAgICAjIEpTIElGXG5KU19FTFNFICAgICAgICAgICAgICAgICA9IDEzICAgICAgIyBKUyBFTFNFXG5TV0lUQ0hfQlJBQ0VfT1BFTiAgICAgICA9IDE0ICAgICAgIyBvcGVuaW5nIGJyYWNlIGluIHN3aXRjaCB7IH1cblNXSVRDSF9CUkFDRV9DTE9TRSAgICAgID0gMTUgICAgICAjIGNsb3NpbmcgYnJhY2UgaW4gc3dpdGNoIHsgfVxuU1dJVENIX0NBU0UgICAgICAgICAgICAgPSAxNiAgICAgICMgc3dpdGNoIGNhc2Ugc3RhdGVtZW50XG5TV0lUQ0hfREVGQVVMVCAgICAgICAgICA9IDE3ICAgICAgIyBzd2l0Y2ggZGVmYXVsdCBzdGF0ZW1lbnRcbkpTX1JFVFVSTiAgICAgICAgICAgICAgID0gMTggICAgICAjIEpTIHJldHVyblxuUEFSRU5fT1BFTiAgICAgICAgICAgICAgPSAxOSAgICAgICMgcGFyZW4gb3BlbiAoXG5QQVJFTl9DTE9TRSAgICAgICAgICAgICA9IDIwICAgICAgIyBwYXJlbiBjbG9zZSApXG5URU1QTEFURV9TVEFSVCAgICAgICAgICA9IDIxICAgICAgIyBgIGJhY2stdGljayBzdGFydFxuVEVNUExBVEVfRU5EICAgICAgICAgICAgPSAyMiAgICAgICMgYCBiYWNrLXRpY2sgZW5kXG5cbiMgZXNsaW50IHByb3BlcnR5IHZhbHVlc1xuVEFHQUxJR05FRCAgICA9ICd0YWctYWxpZ25lZCdcbkxJTkVBTElHTkVEICAgPSAnbGluZS1hbGlnbmVkJ1xuQUZURVJQUk9QUyAgICA9ICdhZnRlci1wcm9wcydcblBST1BTQUxJR05FRCAgPSAncHJvcHMtYWxpZ25lZCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQXV0b0luZGVudFxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IpIC0+XG4gICAgQERpZEluc2VydFRleHQgPSBuZXcgRGlkSW5zZXJ0VGV4dChAZWRpdG9yKVxuICAgIEBhdXRvSnN4ID0gYXRvbS5jb25maWcuZ2V0KCdsYW5ndWFnZS1iYWJlbCcpLmF1dG9JbmRlbnRKU1hcbiAgICAjIHJlZ2V4IHRvIHNlYXJjaCBmb3IgdGFnIG9wZW4vY2xvc2UgdGFnIGFuZCBjbG9zZSB0YWdcbiAgICBASlNYUkVHRVhQID0gLyg8KShbJF9BLVphLXpdKD86WyRfLjpcXC1BLVphLXowLTldKSopfChcXC8+KXwoPFxcLykoWyRfQS1aYS16XSg/OlskLl86XFwtQS1aYS16MC05XSkqKSg+KXwoPil8KHspfCh9KXwoXFw/KXwoOil8KGlmKXwoZWxzZSl8KGNhc2UpfChkZWZhdWx0KXwocmV0dXJuKXwoXFwoKXwoXFwpKXwoYCkvZ1xuICAgIEBtb3VzZVVwID0gdHJ1ZVxuICAgIEBtdWx0aXBsZUN1cnNvclRyaWdnZXIgPSAxXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIEBlc2xpbnRJbmRlbnRPcHRpb25zID0gQGdldEluZGVudE9wdGlvbnMoKVxuICAgIEB0ZW1wbGF0ZURlcHRoID0gMCAjIHRyYWNrIGRlcHRoIG9mIGFueSBlbWJlZGRlZCBiYWNrLXRpY2sgdGVtcGxhdGVzXG5cblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ2xhbmd1YWdlLWJhYmVsOmF1dG8taW5kZW50LWpzeC1vbic6IChldmVudCkgPT5cbiAgICAgICAgQGF1dG9Kc3ggPSB0cnVlXG4gICAgICAgIEBlc2xpbnRJbmRlbnRPcHRpb25zID0gQGdldEluZGVudE9wdGlvbnMoKVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsXG4gICAgICAnbGFuZ3VhZ2UtYmFiZWw6YXV0by1pbmRlbnQtanN4LW9mZic6IChldmVudCkgPT4gIEBhdXRvSnN4ID0gZmFsc2VcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ2xhbmd1YWdlLWJhYmVsOnRvZ2dsZS1hdXRvLWluZGVudC1qc3gnOiAoZXZlbnQpID0+XG4gICAgICAgIEBhdXRvSnN4ID0gbm90IEBhdXRvSnN4XG4gICAgICAgIGlmIEBhdXRvSnN4IHRoZW4gQGVzbGludEluZGVudE9wdGlvbnMgPSBAZ2V0SW5kZW50T3B0aW9ucygpXG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCBAb25Nb3VzZURvd25cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJywgQG9uTW91c2VVcFxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24gKGV2ZW50KSA9PiBAY2hhbmdlZEN1cnNvclBvc2l0aW9uKGV2ZW50KVxuICAgIEBoYW5kbGVPbkRpZFN0b3BDaGFuZ2luZygpXG5cbiAgZGVzdHJveTogKCkgLT5cbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQG9uRGlkU3RvcENoYW5naW5nSGFuZGxlci5kaXNwb3NlKClcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCBAb25Nb3VzZURvd25cbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZXVwJywgQG9uTW91c2VVcFxuXG4gICMgY2hhbmdlZCBjdXJzb3IgcG9zaXRpb25cbiAgY2hhbmdlZEN1cnNvclBvc2l0aW9uOiAoZXZlbnQpID0+XG4gICAgcmV0dXJuIHVubGVzcyBAYXV0b0pzeFxuICAgIHJldHVybiB1bmxlc3MgQG1vdXNlVXBcbiAgICByZXR1cm4gdW5sZXNzIGV2ZW50Lm9sZEJ1ZmZlclBvc2l0aW9uLnJvdyBpc250IGV2ZW50Lm5ld0J1ZmZlclBvc2l0aW9uLnJvd1xuICAgIGJ1ZmZlclJvdyA9IGV2ZW50Lm5ld0J1ZmZlclBvc2l0aW9uLnJvd1xuICAgICMgaGFuZGxlIG11bHRpcGxlIGN1cnNvcnMuIG9ubHkgdHJpZ2dlciBpbmRlbnQgb24gb25lIGNoYW5nZSBldmVudFxuICAgICMgYW5kIHRoZW4gb25seSBhdCB0aGUgaGlnaGVzdCByb3dcbiAgICBpZiBAZWRpdG9yLmhhc011bHRpcGxlQ3Vyc29ycygpXG4gICAgICBjdXJzb3JQb3NpdGlvbnMgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpXG4gICAgICBpZiBjdXJzb3JQb3NpdGlvbnMubGVuZ3RoIGlzIEBtdWx0aXBsZUN1cnNvclRyaWdnZXJcbiAgICAgICAgQG11bHRpcGxlQ3Vyc29yVHJpZ2dlciA9IDFcbiAgICAgICAgYnVmZmVyUm93ID0gMFxuICAgICAgICBmb3IgY3Vyc29yUG9zaXRpb24gaW4gY3Vyc29yUG9zaXRpb25zXG4gICAgICAgICAgaWYgY3Vyc29yUG9zaXRpb24ucm93ID4gYnVmZmVyUm93IHRoZW4gYnVmZmVyUm93ID0gY3Vyc29yUG9zaXRpb24ucm93XG4gICAgICBlbHNlXG4gICAgICAgIEBtdWx0aXBsZUN1cnNvclRyaWdnZXIrK1xuICAgICAgICByZXR1cm5cbiAgICBlbHNlIGN1cnNvclBvc2l0aW9uID0gZXZlbnQubmV3QnVmZmVyUG9zaXRpb25cblxuICAgICMgcmVtb3ZlIGFueSBibGFuayBsaW5lcyBmcm9tIHdoZXJlIGN1cnNvciB3YXMgcHJldmlvdXNseVxuICAgIHByZXZpb3VzUm93ID0gZXZlbnQub2xkQnVmZmVyUG9zaXRpb24ucm93XG4gICAgaWYgQGpzeEluU2NvcGUocHJldmlvdXNSb3cpXG4gICAgICBibGFua0xpbmVFbmRQb3MgPSAvXlxccyokLy5leGVjKEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocHJldmlvdXNSb3cpKT9bMF0ubGVuZ3RoXG4gICAgICBpZiBibGFua0xpbmVFbmRQb3M/XG4gICAgICAgIEBpbmRlbnRSb3coe3JvdzogcHJldmlvdXNSb3cgLCBibG9ja0luZGVudDogMCB9KVxuXG4gICAgcmV0dXJuIGlmIG5vdCBAanN4SW5TY29wZSBidWZmZXJSb3dcblxuICAgIGVuZFBvaW50T2ZKc3ggPSBuZXcgUG9pbnQgYnVmZmVyUm93LDAgIyBuZXh0IHJvdyBzdGFydFxuICAgIHN0YXJ0UG9pbnRPZkpzeCA9ICBhdXRvQ29tcGxldGVKU1guZ2V0U3RhcnRPZkpTWCBAZWRpdG9yLCBjdXJzb3JQb3NpdGlvblxuICAgIEBpbmRlbnRKU1ggbmV3IFJhbmdlKHN0YXJ0UG9pbnRPZkpzeCwgZW5kUG9pbnRPZkpzeClcbiAgICBjb2x1bW5Ub01vdmVUbyA9IC9eXFxzKiQvLmV4ZWMoQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhidWZmZXJSb3cpKT9bMF0ubGVuZ3RoXG4gICAgaWYgY29sdW1uVG9Nb3ZlVG8/IHRoZW4gQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiBbYnVmZmVyUm93LCBjb2x1bW5Ub01vdmVUb11cblxuXG4gICMgQnVmZmVyIGhhcyBzdG9wcGVkIGNoYW5naW5nLiBJbmRlbnQgYXMgcmVxdWlyZWRcbiAgZGlkU3RvcENoYW5naW5nOiAoKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQGF1dG9Kc3hcbiAgICByZXR1cm4gdW5sZXNzIEBtb3VzZVVwXG4gICAgc2VsZWN0ZWRSYW5nZSA9IEBlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpXG4gICAgIyBpZiB0aGlzIGlzIGEgdGFnIHN0YXJ0J3MgZW5kID4gdGhlbiBkb24ndCBhdXRvIGluZGVudFxuICAgICMgdGhpcyBpYSBmaXggdG8gYWxsb3cgZm9yIHRoZSBhdXRvIGNvbXBsZXRlIHRhZyB0aW1lIHRvIHBvcCB1cFxuICAgIGlmIHNlbGVjdGVkUmFuZ2Uuc3RhcnQucm93IGlzIHNlbGVjdGVkUmFuZ2UuZW5kLnJvdyBhbmRcbiAgICAgIHNlbGVjdGVkUmFuZ2Uuc3RhcnQuY29sdW1uIGlzICBzZWxlY3RlZFJhbmdlLmVuZC5jb2x1bW4gYW5kXG4gICAgICAnSlNYU3RhcnRUYWdFbmQnIGluIEBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oW3NlbGVjdGVkUmFuZ2Uuc3RhcnQucm93LCBzZWxlY3RlZFJhbmdlLnN0YXJ0LmNvbHVtbl0pLmdldFNjb3Blc0FycmF5KClcbiAgICAgICAgcmV0dXJuXG5cbiAgICBoaWdoZXN0Um93ID0gTWF0aC5tYXggc2VsZWN0ZWRSYW5nZS5zdGFydC5yb3csIHNlbGVjdGVkUmFuZ2UuZW5kLnJvd1xuICAgIGxvd2VzdFJvdyA9IE1hdGgubWluIHNlbGVjdGVkUmFuZ2Uuc3RhcnQucm93LCBzZWxlY3RlZFJhbmdlLmVuZC5yb3dcblxuICAgICMgcmVtb3ZlIHRoZSBoYW5kbGVyIGZvciBkaWRTdG9wQ2hhbmdpbmcgdG8gYXZvaWQgdGhpcyBjaGFuZ2UgY2F1c2luZyBhIG5ldyBldmVudFxuICAgIEBvbkRpZFN0b3BDaGFuZ2luZ0hhbmRsZXIuZGlzcG9zZSgpXG5cbiAgICAjIHdvcmsgYmFja3dhcmRzIHRocm91Z2ggYnVmZmVyIHJvd3MgaW5kZW50aW5nIEpTWCBhcyBuZWVkZWRcbiAgICB3aGlsZSAoIGhpZ2hlc3RSb3cgPj0gbG93ZXN0Um93IClcbiAgICAgIGlmIEBqc3hJblNjb3BlKGhpZ2hlc3RSb3cpXG4gICAgICAgIGVuZFBvaW50T2ZKc3ggPSBuZXcgUG9pbnQgaGlnaGVzdFJvdywwXG4gICAgICAgIHN0YXJ0UG9pbnRPZkpzeCA9ICBhdXRvQ29tcGxldGVKU1guZ2V0U3RhcnRPZkpTWCBAZWRpdG9yLCBlbmRQb2ludE9mSnN4XG4gICAgICAgIEBpbmRlbnRKU1ggbmV3IFJhbmdlKHN0YXJ0UG9pbnRPZkpzeCwgZW5kUG9pbnRPZkpzeClcbiAgICAgICAgaGlnaGVzdFJvdyA9IHN0YXJ0UG9pbnRPZkpzeC5yb3cgLSAxXG4gICAgICBlbHNlIGhpZ2hlc3RSb3cgPSBoaWdoZXN0Um93IC0gMVxuXG4gICAgIyByZW5hYmxlIHRoaXMgZXZlbnQgaGFuZGxlciBhZnRlciAzMDBtcyBhcyBwZXIgdGhlIGRlZmF1bHQgdGltZW91dCBmb3IgY2hhbmdlIGV2ZW50c1xuICAgICMgdG8gYXZvaWQgdGhpcyBtZXRob2QgYmVpbmcgcmVjYWxsZWQhXG4gICAgc2V0VGltZW91dChAaGFuZGxlT25EaWRTdG9wQ2hhbmdpbmcsIDMwMClcbiAgICByZXR1cm5cblxuICBoYW5kbGVPbkRpZFN0b3BDaGFuZ2luZzogPT5cbiAgICBAb25EaWRTdG9wQ2hhbmdpbmdIYW5kbGVyID0gQGVkaXRvci5vbkRpZFN0b3BDaGFuZ2luZyAoKSA9PiBAZGlkU3RvcENoYW5naW5nKClcblxuICAjIGlzIHRoZSBqc3ggb24gdGhpcyBsaW5lIGluIHNjb3BlXG4gIGpzeEluU2NvcGU6IChidWZmZXJSb3cpIC0+XG4gICAgc2NvcGVzID0gQGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihbYnVmZmVyUm93LCAwXSkuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIHJldHVybiAnbWV0YS50YWcuanN4JyBpbiBzY29wZXNcblxuICAjIGluZGVudCB0aGUgSlNYIGluIHRoZSAncmFuZ2UnIG9mIHJvd3NcbiAgIyBUaGlzIGlzIGRlc2lnbmVkIHRvIGJlIGEgc2luZ2xlIHBhcnNlIGluZGVudGVyIHRvIHJlZHVjZSB0aGUgaW1wYWN0IG9uIHRoZSBlZGl0b3IuXG4gICMgSXQgYXNzdW1lcyB0aGUgZ3JhbW1hciBoYXMgZG9uZSBpdHMgam9iIGFkZGluZyBzY29wZXMgdG8gaW50ZXJlc3RpbmcgdG9rZW5zLlxuICAjIFRob3NlIGFyZSBKU1ggPHRhZywgPiwgPC90YWcsIC8+LCBlbWVkZGVkIGV4cHJlc3Npb25zXG4gICMgb3V0c2lkZSB0aGUgdGFnIHN0YXJ0aW5nIHsgYW5kIGVuZGluZyB9IGFuZCBqYXZhc2NyaXB0IGJyYWNlcyBvdXRzaWRlIGEgdGFnIHsgJiB9XG4gICMgaXQgdXNlcyBhbiBhcnJheSB0byBob2xkIHRva2VucyBhbmQgYSBwdXNoL3BvcCBzdGFjayB0byBob2xkIHRva2VucyBub3QgY2xvc2VkXG4gICMgdGhlIHZlcnkgZmlyc3QganN4IHRhZyBtdXN0IGJlIGNvcnJldGx5IGluZGV0ZWQgYnkgdGhlIHVzZXIgYXMgd2UgZG9uJ3QgaGF2ZVxuICAjIGtub3dsZWRnZSBvZiBwcmVjZWVkaW5nIEphdmFzY3JpcHQuXG4gIGluZGVudEpTWDogKHJhbmdlKSAtPlxuICAgIHRva2VuU3RhY2sgPSBbXVxuICAgIGlkeE9mVG9rZW4gPSAwXG4gICAgc3RhY2tPZlRva2Vuc1N0aWxsT3BlbiA9IFtdICMgbGVuZ3RoIGVxdWl2YWxlbnQgdG8gdG9rZW4gZGVwdGhcbiAgICBpbmRlbnQgPSAgMFxuICAgIGlzRmlyc3RUYWdPZkJsb2NrID0gdHJ1ZVxuICAgIEBKU1hSRUdFWFAubGFzdEluZGV4ID0gMFxuICAgIEB0ZW1wbGF0ZURlcHRoID0gMFxuXG4gICAgZm9yIHJvdyBpbiBbcmFuZ2Uuc3RhcnQucm93Li5yYW5nZS5lbmQucm93XVxuICAgICAgaXNGaXJzdFRva2VuT2ZMaW5lID0gdHJ1ZVxuICAgICAgdG9rZW5PblRoaXNMaW5lID0gZmFsc2VcbiAgICAgIGluZGVudFJlY2FsYyA9IGZhbHNlXG4gICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyByb3dcblxuICAgICAgIyBsb29rIGZvciB0b2tlbnMgaW4gYSBidWZmZXIgbGluZVxuICAgICAgd2hpbGUgKCggbWF0Y2ggPSBASlNYUkVHRVhQLmV4ZWMobGluZSkpIGlzbnQgbnVsbCApXG4gICAgICAgIG1hdGNoQ29sdW1uID0gbWF0Y2guaW5kZXhcbiAgICAgICAgbWF0Y2hQb2ludFN0YXJ0ID0gbmV3IFBvaW50KHJvdywgbWF0Y2hDb2x1bW4pXG4gICAgICAgIG1hdGNoUG9pbnRFbmQgPSBuZXcgUG9pbnQocm93LCBtYXRjaENvbHVtbiArIG1hdGNoWzBdLmxlbmd0aCAtIDEpXG4gICAgICAgIG1hdGNoUmFuZ2UgPSBuZXcgUmFuZ2UobWF0Y2hQb2ludFN0YXJ0LCBtYXRjaFBvaW50RW5kKVxuXG4gICAgICAgIGlmIG5vdCB0b2tlbiA9ICBAZ2V0VG9rZW4ocm93LCBtYXRjaCkgdGhlbiBjb250aW51ZVxuXG4gICAgICAgIGZpcnN0Q2hhckluZGVudGF0aW9uID0gKEBlZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cgcm93KVxuICAgICAgICAjIGNvbnZlcnQgdGhlIG1hdGNoZWQgY29sdW1uIHBvc2l0aW9uIGludG8gdGFiIGluZGVudHNcbiAgICAgICAgaWYgQGVkaXRvci5nZXRTb2Z0VGFicygpXG4gICAgICAgICAgdG9rZW5JbmRlbnRhdGlvbiA9IChtYXRjaENvbHVtbiAvIEBlZGl0b3IuZ2V0VGFiTGVuZ3RoKCkpXG4gICAgICAgIGVsc2UgdG9rZW5JbmRlbnRhdGlvbiA9XG4gICAgICAgICAgZG8gKEBlZGl0b3IpIC0+XG4gICAgICAgICAgICBoYXJkVGFic0ZvdW5kID0gY2hhcnNGb3VuZCA9IDBcbiAgICAgICAgICAgIGZvciBpIGluIFswLi4ubWF0Y2hDb2x1bW5dXG4gICAgICAgICAgICAgIGlmICgobGluZS5zdWJzdHIgaSwgMSkgaXMgJ1xcdCcpXG4gICAgICAgICAgICAgICAgaGFyZFRhYnNGb3VuZCsrXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjaGFyc0ZvdW5kKytcbiAgICAgICAgICAgIHJldHVybiBoYXJkVGFic0ZvdW5kICsgKCBjaGFyc0ZvdW5kIC8gQGVkaXRvci5nZXRUYWJMZW5ndGgoKSApXG5cbiAgICAgICAgaWYgaXNGaXJzdFRva2VuT2ZMaW5lXG4gICAgICAgICAgZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvbiA9ICB0b2tlbkluZGVudGF0aW9uXG5cbiAgICAgICAgIyBiaWcgc3dpdGNoIHN0YXRlbWVudCBmb2xsb3dzIGZvciBlYWNoIHRva2VuLiBJZiB0aGUgbGluZSBpcyByZWZvcm1hdGVkXG4gICAgICAgICMgdGhlbiB3ZSByZWNhbGN1bGF0ZSB0aGUgbmV3IHBvc2l0aW9uLlxuICAgICAgICAjIGJpdCBob3JyaWQgYnV0IGhvcGVmdWxseSBmYXN0LlxuICAgICAgICBzd2l0Y2ggKHRva2VuKVxuICAgICAgICAgICMgdGFncyBzdGFydGluZyA8dGFnXG4gICAgICAgICAgd2hlbiBKU1hUQUdfT1BFTlxuICAgICAgICAgICAgdG9rZW5PblRoaXNMaW5lID0gdHJ1ZVxuICAgICAgICAgICAgIyBpbmRlbnQgb25seSBvbiBmaXJzdCB0b2tlbiBvZiBhIGxpbmVcbiAgICAgICAgICAgIGlmIGlzRmlyc3RUb2tlbk9mTGluZVxuICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICAgICMgaXNGaXJzdFRhZ09mQmxvY2sgaXMgdXNlZCB0byBtYXJrIHRoZSB0YWcgdGhhdCBzdGFydHMgdGhlIEpTWCBidXRcbiAgICAgICAgICAgICAgIyBhbHNvIHRoZSBmaXJzdCB0YWcgb2YgYmxvY2tzIGluc2lkZSAgZW1iZWRkZWQgZXhwcmVzc2lvbnMuIGUuZy5cbiAgICAgICAgICAgICAgIyA8dGJvZHk+LCA8cENvbXA+IGFuZCA8b2JqZWN0Um93PiBhcmUgZmlyc3QgdGFnc1xuICAgICAgICAgICAgICAjIHJldHVybiAoXG4gICAgICAgICAgICAgICMgICAgICAgPHRib2R5IGNvbXA9ezxwQ29tcCBwcm9wZXJ0eSAvPn0+XG4gICAgICAgICAgICAgICMgICAgICAgICB7b2JqZWN0cy5tYXAoZnVuY3Rpb24ob2JqZWN0LCBpKXtcbiAgICAgICAgICAgICAgIyAgICAgICAgICAgcmV0dXJuIDxPYmplY3RSb3cgb2JqPXtvYmplY3R9IGtleT17aX0gLz47XG4gICAgICAgICAgICAgICMgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgIyAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICAjICAgICApXG4gICAgICAgICAgICAgICMgYnV0IHdlIGRvbid0IHBvc2l0aW9uIHRoZSA8dGJvZHk+IGFzIHdlIGhhdmUgbm8ga25vd2xlZGdlIG9mIHRoZSBwcmVjZWVkaW5nXG4gICAgICAgICAgICAgICMganMgc3ludGF4XG4gICAgICAgICAgICAgIGlmIGlzRmlyc3RUYWdPZkJsb2NrIGFuZFxuICAgICAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg/IGFuZFxuICAgICAgICAgICAgICAgICAgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udHlwZSBpcyBCUkFDRV9PUEVOIGFuZFxuICAgICAgICAgICAgICAgICAgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0ucm93IGlzICggcm93IC0gMSlcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5JbmRlbnRhdGlvbiA9IGZpcnN0Q2hhckluZGVudGF0aW9uID0gZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvbiA9XG4gICAgICAgICAgICAgICAgICAgICAgQGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50WzFdICsgQGdldEluZGVudE9mUHJldmlvdXNSb3cgcm93XG4gICAgICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93ICwgYmxvY2tJbmRlbnQ6IGZpcnN0Q2hhckluZGVudGF0aW9uIH0pXG4gICAgICAgICAgICAgIGVsc2UgaWYgaXNGaXJzdFRhZ09mQmxvY2sgYW5kIHBhcmVudFRva2VuSWR4P1xuICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93ICwgYmxvY2tJbmRlbnQ6IEBnZXRJbmRlbnRPZlByZXZpb3VzUm93KHJvdyksIGpzeEluZGVudDogMX0pXG4gICAgICAgICAgICAgIGVsc2UgaWYgcGFyZW50VG9rZW5JZHg/XG4gICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3cgLCBibG9ja0luZGVudDogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudDogMX0pXG5cbiAgICAgICAgICAgICMgcmUtcGFyc2UgbGluZSBpZiBpbmRlbnQgZGlkIHNvbWV0aGluZyB0byBpdFxuICAgICAgICAgICAgaWYgaW5kZW50UmVjYWxjXG4gICAgICAgICAgICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IHJvd1xuICAgICAgICAgICAgICBASlNYUkVHRVhQLmxhc3RJbmRleCA9IDAgI2ZvcmNlIHJlZ2V4IHRvIHN0YXJ0IGFnYWluXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IGZhbHNlXG4gICAgICAgICAgICBpc0ZpcnN0VGFnT2ZCbG9jayA9IGZhbHNlXG5cbiAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgIHRva2VuU3RhY2sucHVzaFxuICAgICAgICAgICAgICB0eXBlOiBKU1hUQUdfT1BFTlxuICAgICAgICAgICAgICBuYW1lOiBtYXRjaFsyXVxuICAgICAgICAgICAgICByb3c6IHJvd1xuICAgICAgICAgICAgICBmaXJzdFRhZ0luTGluZUluZGVudGF0aW9uOiBmaXJzdFRhZ0luTGluZUluZGVudGF0aW9uXG4gICAgICAgICAgICAgIHRva2VuSW5kZW50YXRpb246IHRva2VuSW5kZW50YXRpb25cbiAgICAgICAgICAgICAgZmlyc3RDaGFySW5kZW50YXRpb246IGZpcnN0Q2hhckluZGVudGF0aW9uXG4gICAgICAgICAgICAgIHBhcmVudFRva2VuSWR4OiBwYXJlbnRUb2tlbklkeFxuICAgICAgICAgICAgICB0ZXJtc1RoaXNUYWdzQXR0cmlidXRlc0lkeDogbnVsbCAgIyBwdHIgdG8gPiB0YWdcbiAgICAgICAgICAgICAgdGVybXNUaGlzVGFnSWR4OiBudWxsICAgICAgICAgICAgICMgcHRyIHRvIDwvdGFnPlxuXG4gICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggaWR4T2ZUb2tlblxuICAgICAgICAgICAgaWR4T2ZUb2tlbisrXG5cbiAgICAgICAgICAjIHRhZ3MgZW5kaW5nIDwvdGFnPlxuICAgICAgICAgIHdoZW4gSlNYVEFHX0NMT1NFXG4gICAgICAgICAgICB0b2tlbk9uVGhpc0xpbmUgPSB0cnVlXG4gICAgICAgICAgICBpZiBpc0ZpcnN0VG9rZW5PZkxpbmVcbiAgICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLmZpcnN0Q2hhckluZGVudGF0aW9uIH0gKVxuXG4gICAgICAgICAgICAjIHJlLXBhcnNlIGxpbmUgaWYgaW5kZW50IGRpZCBzb21ldGhpbmcgdG8gaXRcbiAgICAgICAgICAgIGlmIGluZGVudFJlY2FsY1xuICAgICAgICAgICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyByb3dcbiAgICAgICAgICAgICAgQEpTWFJFR0VYUC5sYXN0SW5kZXggPSAwICNmb3JjZSByZWdleCB0byBzdGFydCBhZ2FpblxuICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpc0ZpcnN0VG9rZW5PZkxpbmUgPSBmYWxzZVxuICAgICAgICAgICAgaXNGaXJzdFRhZ09mQmxvY2sgPSBmYWxzZVxuXG4gICAgICAgICAgICBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgIHRva2VuU3RhY2sucHVzaFxuICAgICAgICAgICAgICB0eXBlOiBKU1hUQUdfQ0xPU0VcbiAgICAgICAgICAgICAgbmFtZTogbWF0Y2hbNV1cbiAgICAgICAgICAgICAgcm93OiByb3dcbiAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg6IHBhcmVudFRva2VuSWR4ICAgICAgICAgIyBwdHIgdG8gPHRhZ1xuICAgICAgICAgICAgaWYgcGFyZW50VG9rZW5JZHggPj0wIHRoZW4gdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udGVybXNUaGlzVGFnSWR4ID0gaWR4T2ZUb2tlblxuICAgICAgICAgICAgaWR4T2ZUb2tlbisrXG5cbiAgICAgICAgICAjIHRhZ3MgZW5kaW5nIC8+XG4gICAgICAgICAgd2hlbiBKU1hUQUdfU0VMRkNMT1NFX0VORFxuICAgICAgICAgICAgdG9rZW5PblRoaXNMaW5lID0gdHJ1ZVxuICAgICAgICAgICAgaWYgaXNGaXJzdFRva2VuT2ZMaW5lXG4gICAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgICAgaWYgZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvbiBpcyBmaXJzdENoYXJJbmRlbnRhdGlvblxuICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRGb3JDbG9zaW5nQnJhY2tldCAgcm93LFxuICAgICAgICAgICAgICAgICAgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0sXG4gICAgICAgICAgICAgICAgICBAZXNsaW50SW5kZW50T3B0aW9ucy5qc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uWzFdLnNlbGZDbG9zaW5nXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvd1xuICAgICAgICAgICAgICAgICAgLGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5maXJzdFRhZ0luTGluZUluZGVudGF0aW9uLCBqc3hJbmRlbnRQcm9wczogMSB9IClcblxuICAgICAgICAgICAgIyByZS1wYXJzZSBsaW5lIGlmIGluZGVudCBkaWQgc29tZXRoaW5nIHRvIGl0XG4gICAgICAgICAgICBpZiBpbmRlbnRSZWNhbGNcbiAgICAgICAgICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG4gICAgICAgICAgICAgIEBKU1hSRUdFWFAubGFzdEluZGV4ID0gMCAjZm9yY2UgcmVnZXggdG8gc3RhcnQgYWdhaW5cbiAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaXNGaXJzdFRhZ09mQmxvY2sgPSBmYWxzZVxuICAgICAgICAgICAgaXNGaXJzdFRva2VuT2ZMaW5lID0gZmFsc2VcblxuICAgICAgICAgICAgcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICB0b2tlblN0YWNrLnB1c2hcbiAgICAgICAgICAgICAgdHlwZTogSlNYVEFHX1NFTEZDTE9TRV9FTkRcbiAgICAgICAgICAgICAgbmFtZTogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0ubmFtZVxuICAgICAgICAgICAgICByb3c6IHJvd1xuICAgICAgICAgICAgICBwYXJlbnRUb2tlbklkeDogcGFyZW50VG9rZW5JZHggICAgICAgIyBwdHIgdG8gPHRhZ1xuICAgICAgICAgICAgaWYgcGFyZW50VG9rZW5JZHggPj0gMFxuICAgICAgICAgICAgICB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50ZXJtc1RoaXNUYWdzQXR0cmlidXRlc0lkeCA9IGlkeE9mVG9rZW5cbiAgICAgICAgICAgICAgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udHlwZSA9IEpTWFRBR19TRUxGQ0xPU0VfU1RBUlRcbiAgICAgICAgICAgICAgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udGVybXNUaGlzVGFnSWR4ID0gaWR4T2ZUb2tlblxuICAgICAgICAgICAgaWR4T2ZUb2tlbisrXG5cbiAgICAgICAgICAjIHRhZ3MgZW5kaW5nID5cbiAgICAgICAgICB3aGVuIEpTWFRBR19DTE9TRV9BVFRSU1xuICAgICAgICAgICAgdG9rZW5PblRoaXNMaW5lID0gdHJ1ZVxuICAgICAgICAgICAgaWYgaXNGaXJzdFRva2VuT2ZMaW5lXG4gICAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgICAgaWYgZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvbiBpcyBmaXJzdENoYXJJbmRlbnRhdGlvblxuICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRGb3JDbG9zaW5nQnJhY2tldCAgcm93LFxuICAgICAgICAgICAgICAgICAgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0sXG4gICAgICAgICAgICAgICAgICBAZXNsaW50SW5kZW50T3B0aW9ucy5qc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uWzFdLm5vbkVtcHR5XG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLmZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb24sIGpzeEluZGVudFByb3BzOiAxIH0pXG5cbiAgICAgICAgICAgICMgcmUtcGFyc2UgbGluZSBpZiBpbmRlbnQgZGlkIHNvbWV0aGluZyB0byBpdFxuICAgICAgICAgICAgaWYgaW5kZW50UmVjYWxjXG4gICAgICAgICAgICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IHJvd1xuICAgICAgICAgICAgICBASlNYUkVHRVhQLmxhc3RJbmRleCA9IDAgI2ZvcmNlIHJlZ2V4IHRvIHN0YXJ0IGFnYWluXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlzRmlyc3RUYWdPZkJsb2NrID0gZmFsc2VcbiAgICAgICAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgIHRva2VuU3RhY2sucHVzaFxuICAgICAgICAgICAgICB0eXBlOiBKU1hUQUdfQ0xPU0VfQVRUUlNcbiAgICAgICAgICAgICAgbmFtZTogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0ubmFtZVxuICAgICAgICAgICAgICByb3c6IHJvd1xuICAgICAgICAgICAgICBwYXJlbnRUb2tlbklkeDogcGFyZW50VG9rZW5JZHggICAgICAgICAgICAjIHB0ciB0byA8dGFnXG4gICAgICAgICAgICBpZiBwYXJlbnRUb2tlbklkeCA+PSAwIHRoZW4gdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udGVybXNUaGlzVGFnc0F0dHJpYnV0ZXNJZHggPSBpZHhPZlRva2VuXG4gICAgICAgICAgICBpZHhPZlRva2VuKytcblxuICAgICAgICAgICMgZW1iZWRlZCBleHByZXNzaW9uIHN0YXJ0IHtcbiAgICAgICAgICB3aGVuIEpTWEJSQUNFX09QRU5cbiAgICAgICAgICAgIHRva2VuT25UaGlzTGluZSA9IHRydWVcbiAgICAgICAgICAgIGlmIGlzRmlyc3RUb2tlbk9mTGluZVxuICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICAgIGlmIHBhcmVudFRva2VuSWR4P1xuICAgICAgICAgICAgICAgIGlmIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgaXMgSlNYVEFHX09QRU4gYW5kIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnRlcm1zVGhpc1RhZ3NBdHRyaWJ1dGVzSWR4IGlzIG51bGxcbiAgICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudFByb3BzOiAxIH0pXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50OiAxIH0gKVxuXG4gICAgICAgICAgICAjIHJlLXBhcnNlIGxpbmUgaWYgaW5kZW50IGRpZCBzb21ldGhpbmcgdG8gaXRcbiAgICAgICAgICAgIGlmIGluZGVudFJlY2FsY1xuICAgICAgICAgICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyByb3dcbiAgICAgICAgICAgICAgQEpTWFJFR0VYUC5sYXN0SW5kZXggPSAwICNmb3JjZSByZWdleCB0byBzdGFydCBhZ2FpblxuICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpc0ZpcnN0VGFnT2ZCbG9jayA9IHRydWUgICMgdGhpcyBtYXkgYmUgdGhlIHN0YXJ0IG9mIGEgbmV3IEpTWCBibG9ja1xuICAgICAgICAgICAgaXNGaXJzdFRva2VuT2ZMaW5lID0gZmFsc2VcblxuICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgdG9rZW5TdGFjay5wdXNoXG4gICAgICAgICAgICAgIHR5cGU6IEpTWEJSQUNFX09QRU5cbiAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgcm93OiByb3dcbiAgICAgICAgICAgICAgZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvbjogZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvblxuICAgICAgICAgICAgICB0b2tlbkluZGVudGF0aW9uOiB0b2tlbkluZGVudGF0aW9uXG4gICAgICAgICAgICAgIGZpcnN0Q2hhckluZGVudGF0aW9uOiBmaXJzdENoYXJJbmRlbnRhdGlvblxuICAgICAgICAgICAgICBwYXJlbnRUb2tlbklkeDogcGFyZW50VG9rZW5JZHhcbiAgICAgICAgICAgICAgdGVybXNUaGlzVGFnc0F0dHJpYnV0ZXNJZHg6IG51bGwgICMgcHRyIHRvID4gdGFnXG4gICAgICAgICAgICAgIHRlcm1zVGhpc1RhZ0lkeDogbnVsbCAgICAgICAgICAgICAjIHB0ciB0byA8L3RhZz5cblxuICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIGlkeE9mVG9rZW5cbiAgICAgICAgICAgIGlkeE9mVG9rZW4rK1xuXG4gICAgICAgICAgIyBlbWJlZGVkIGV4cHJlc3Npb24gZW5kIH1cbiAgICAgICAgICB3aGVuIEpTWEJSQUNFX0NMT1NFXG4gICAgICAgICAgICB0b2tlbk9uVGhpc0xpbmUgPSB0cnVlXG4gICAgICAgICAgICBpZiBpc0ZpcnN0VG9rZW5PZkxpbmVcbiAgICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLmZpcnN0Q2hhckluZGVudGF0aW9uIH0pXG5cbiAgICAgICAgICAgICMgcmUtcGFyc2UgbGluZSBpZiBpbmRlbnQgZGlkIHNvbWV0aGluZyB0byBpdFxuICAgICAgICAgICAgaWYgaW5kZW50UmVjYWxjXG4gICAgICAgICAgICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IHJvd1xuICAgICAgICAgICAgICBASlNYUkVHRVhQLmxhc3RJbmRleCA9IDAgI2ZvcmNlIHJlZ2V4IHRvIHN0YXJ0IGFnYWluXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlzRmlyc3RUYWdPZkJsb2NrID0gZmFsc2VcbiAgICAgICAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgdG9rZW5TdGFjay5wdXNoXG4gICAgICAgICAgICAgIHR5cGU6IEpTWEJSQUNFX0NMT1NFXG4gICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgIHJvdzogcm93XG4gICAgICAgICAgICAgIHBhcmVudFRva2VuSWR4OiBwYXJlbnRUb2tlbklkeCAgICAgICAgICMgcHRyIHRvIDx0YWdcbiAgICAgICAgICAgIGlmIHBhcmVudFRva2VuSWR4ID49MCB0aGVuIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnRlcm1zVGhpc1RhZ0lkeCA9IGlkeE9mVG9rZW5cbiAgICAgICAgICAgIGlkeE9mVG9rZW4rK1xuXG4gICAgICAgICAgIyBKYXZhc2NyaXB0IGJyYWNlIFN0YXJ0IHsgb3Igc3dpdGNoIGJyYWNlIHN0YXJ0IHsgb3IgcGFyZW4gKCBvciBiYWNrLXRpY2sgYHN0YXJ0XG4gICAgICAgICAgd2hlbiBCUkFDRV9PUEVOLCBTV0lUQ0hfQlJBQ0VfT1BFTiwgUEFSRU5fT1BFTiwgVEVNUExBVEVfU1RBUlRcbiAgICAgICAgICAgIHRva2VuT25UaGlzTGluZSA9IHRydWVcbiAgICAgICAgICAgIGlmIHRva2VuIGlzIFRFTVBMQVRFX1NUQVJUIHRoZW4gQHRlbXBsYXRlRGVwdGgrK1xuICAgICAgICAgICAgaWYgaXNGaXJzdFRva2VuT2ZMaW5lXG4gICAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgICAgaWYgaXNGaXJzdFRhZ09mQmxvY2sgYW5kXG4gICAgICAgICAgICAgICAgICBwYXJlbnRUb2tlbklkeD8gYW5kXG4gICAgICAgICAgICAgICAgICB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50eXBlIGlzIHRva2VuIGFuZFxuICAgICAgICAgICAgICAgICAgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0ucm93IGlzICggcm93IC0gMSlcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5JbmRlbnRhdGlvbiA9IGZpcnN0Q2hhckluZGVudGF0aW9uID1cbiAgICAgICAgICAgICAgICAgICAgICBAZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRbMV0gKyBAZ2V0SW5kZW50T2ZQcmV2aW91c1JvdyByb3dcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiBmaXJzdENoYXJJbmRlbnRhdGlvbn0pXG4gICAgICAgICAgICAgIGVsc2UgaWYgcGFyZW50VG9rZW5JZHg/XG4gICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50OiAxIH0gKVxuXG4gICAgICAgICAgICAjIHJlLXBhcnNlIGxpbmUgaWYgaW5kZW50IGRpZCBzb21ldGhpbmcgdG8gaXRcbiAgICAgICAgICAgIGlmIGluZGVudFJlY2FsY1xuICAgICAgICAgICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyByb3dcbiAgICAgICAgICAgICAgQEpTWFJFR0VYUC5sYXN0SW5kZXggPSAwICNmb3JjZSByZWdleCB0byBzdGFydCBhZ2FpblxuICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpc0ZpcnN0VG9rZW5PZkxpbmUgPSBmYWxzZVxuXG4gICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICB0b2tlblN0YWNrLnB1c2hcbiAgICAgICAgICAgICAgdHlwZTogdG9rZW5cbiAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgcm93OiByb3dcbiAgICAgICAgICAgICAgZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvbjogZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvblxuICAgICAgICAgICAgICB0b2tlbkluZGVudGF0aW9uOiB0b2tlbkluZGVudGF0aW9uXG4gICAgICAgICAgICAgIGZpcnN0Q2hhckluZGVudGF0aW9uOiBmaXJzdENoYXJJbmRlbnRhdGlvblxuICAgICAgICAgICAgICBwYXJlbnRUb2tlbklkeDogcGFyZW50VG9rZW5JZHhcbiAgICAgICAgICAgICAgdGVybXNUaGlzVGFnc0F0dHJpYnV0ZXNJZHg6IG51bGwgICMgcHRyIHRvID4gdGFnXG4gICAgICAgICAgICAgIHRlcm1zVGhpc1RhZ0lkeDogbnVsbCAgICAgICAgICAgICAjIHB0ciB0byA8L3RhZz5cblxuICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIGlkeE9mVG9rZW5cbiAgICAgICAgICAgIGlkeE9mVG9rZW4rK1xuXG4gICAgICAgICAgIyBKYXZhc2NyaXB0IGJyYWNlIEVuZCB9IG9yIHN3aXRjaCBicmFjZSBlbmQgfSBvciBwYXJlbiBjbG9zZSApIG9yIGJhY2stdGljayBgIGVuZFxuICAgICAgICAgIHdoZW4gQlJBQ0VfQ0xPU0UsIFNXSVRDSF9CUkFDRV9DTE9TRSwgUEFSRU5fQ0xPU0UsIFRFTVBMQVRFX0VORFxuXG4gICAgICAgICAgICBpZiB0b2tlbiBpcyBTV0lUQ0hfQlJBQ0VfQ0xPU0VcbiAgICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgICBpZiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50eXBlIGlzIFNXSVRDSF9DQVNFIG9yIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgaXMgU1dJVENIX0RFRkFVTFRcbiAgICAgICAgICAgICAgICAjIHdlIG9ubHkgYWxsb3cgYSBzaW5nbGUgY2FzZS9kZWZhdWx0IHN0YWNrIGVsZW1lbnQgcGVyIHN3aXRjaCBpbnN0YW5jZVxuICAgICAgICAgICAgICAgICMgc28gbm93IHdlIGFyZSBhdCB0aGUgc3dpdGNoJ3MgY2xvc2UgYnJhY2Ugd2UgcG9wIG9mZiBhbnkgY2FzZS9kZWZhdWx0IHRva2Vuc1xuICAgICAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcblxuICAgICAgICAgICAgdG9rZW5PblRoaXNMaW5lID0gdHJ1ZVxuICAgICAgICAgICAgaWYgaXNGaXJzdFRva2VuT2ZMaW5lXG4gICAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgICAgaWYgcGFyZW50VG9rZW5JZHg/XG4gICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5maXJzdENoYXJJbmRlbnRhdGlvbiB9KVxuXG4gICAgICAgICAgICAjIHJlLXBhcnNlIGxpbmUgaWYgaW5kZW50IGRpZCBzb21ldGhpbmcgdG8gaXRcbiAgICAgICAgICAgIGlmIGluZGVudFJlY2FsY1xuICAgICAgICAgICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyByb3dcbiAgICAgICAgICAgICAgQEpTWFJFR0VYUC5sYXN0SW5kZXggPSAwICNmb3JjZSByZWdleCB0byBzdGFydCBhZ2FpblxuICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpc0ZpcnN0VG9rZW5PZkxpbmUgPSBmYWxzZVxuXG4gICAgICAgICAgICBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgIGlmIHBhcmVudFRva2VuSWR4P1xuICAgICAgICAgICAgICB0b2tlblN0YWNrLnB1c2hcbiAgICAgICAgICAgICAgICB0eXBlOiB0b2tlblxuICAgICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgICAgcm93OiByb3dcbiAgICAgICAgICAgICAgICBwYXJlbnRUb2tlbklkeDogcGFyZW50VG9rZW5JZHggICAgICAgICAjIHB0ciB0byA8dGFnXG4gICAgICAgICAgICAgIGlmIHBhcmVudFRva2VuSWR4ID49MCB0aGVuIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnRlcm1zVGhpc1RhZ0lkeCA9IGlkeE9mVG9rZW5cbiAgICAgICAgICAgICAgaWR4T2ZUb2tlbisrXG5cbiAgICAgICAgICAgIGlmIHRva2VuIGlzIFRFTVBMQVRFX0VORCB0aGVuIEB0ZW1wbGF0ZURlcHRoLS1cblxuICAgICAgICAgICMgY2FzZSwgZGVmYXVsdCBzdGF0ZW1lbnQgb2Ygc3dpdGNoXG4gICAgICAgICAgd2hlbiBTV0lUQ0hfQ0FTRSwgU1dJVENIX0RFRkFVTFRcbiAgICAgICAgICAgIHRva2VuT25UaGlzTGluZSA9IHRydWVcbiAgICAgICAgICAgIGlzRmlyc3RUYWdPZkJsb2NrID0gdHJ1ZVxuICAgICAgICAgICAgaWYgaXNGaXJzdFRva2VuT2ZMaW5lXG4gICAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgICAgaWYgcGFyZW50VG9rZW5JZHg/XG4gICAgICAgICAgICAgICAgaWYgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udHlwZSBpcyBTV0lUQ0hfQ0FTRSBvciB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50eXBlIGlzIFNXSVRDSF9ERUZBVUxUXG4gICAgICAgICAgICAgICAgICAjIHdlIG9ubHkgYWxsb3cgYSBzaW5nbGUgY2FzZS9kZWZhdWx0IHN0YWNrIGVsZW1lbnQgcGVyIHN3aXRjaCBpbnN0YW5jZVxuICAgICAgICAgICAgICAgICAgIyBzbyBwb3NpdGlvbiBuZXcgY2FzZS9kZWZhdWx0IHRvIHRoZSBsYXN0IG9uZXMgcG9zaXRpb24gYW5kIHRoZW4gcG9wIHRoZSBsYXN0J3NcbiAgICAgICAgICAgICAgICAgICMgb2ZmIHRoZSBzdGFjay5cbiAgICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24gfSlcbiAgICAgICAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgaXMgU1dJVENIX0JSQUNFX09QRU5cbiAgICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudDogMSB9KVxuXG4gICAgICAgICAgICAjIHJlLXBhcnNlIGxpbmUgaWYgaW5kZW50IGRpZCBzb21ldGhpbmcgdG8gaXRcbiAgICAgICAgICAgIGlmIGluZGVudFJlY2FsY1xuICAgICAgICAgICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyByb3dcbiAgICAgICAgICAgICAgQEpTWFJFR0VYUC5sYXN0SW5kZXggPSAwICNmb3JjZSByZWdleCB0byBzdGFydCBhZ2FpblxuICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpc0ZpcnN0VG9rZW5PZkxpbmUgPSBmYWxzZVxuXG4gICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG5cbiAgICAgICAgICAgIHRva2VuU3RhY2sucHVzaFxuICAgICAgICAgICAgICB0eXBlOiB0b2tlblxuICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICByb3c6IHJvd1xuICAgICAgICAgICAgICBmaXJzdFRhZ0luTGluZUluZGVudGF0aW9uOiBmaXJzdFRhZ0luTGluZUluZGVudGF0aW9uXG4gICAgICAgICAgICAgIHRva2VuSW5kZW50YXRpb246IHRva2VuSW5kZW50YXRpb25cbiAgICAgICAgICAgICAgZmlyc3RDaGFySW5kZW50YXRpb246IGZpcnN0Q2hhckluZGVudGF0aW9uXG4gICAgICAgICAgICAgIHBhcmVudFRva2VuSWR4OiBwYXJlbnRUb2tlbklkeFxuICAgICAgICAgICAgICB0ZXJtc1RoaXNUYWdzQXR0cmlidXRlc0lkeDogbnVsbCAgIyBwdHIgdG8gPiB0YWdcbiAgICAgICAgICAgICAgdGVybXNUaGlzVGFnSWR4OiBudWxsICAgICAgICAgICAgICMgcHRyIHRvIDwvdGFnPlxuXG4gICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggaWR4T2ZUb2tlblxuICAgICAgICAgICAgaWR4T2ZUb2tlbisrXG5cbiAgICAgICAgICAjIFRlcm5hcnkgYW5kIGNvbmRpdGlvbmFsIGlmL2Vsc2Ugb3BlcmF0b3JzXG4gICAgICAgICAgd2hlbiBURVJOQVJZX0lGLCBKU19JRiwgSlNfRUxTRSwgSlNfUkVUVVJOXG4gICAgICAgICAgICBpc0ZpcnN0VGFnT2ZCbG9jayA9IHRydWVcblxuICAgICAgIyBoYW5kbGUgbGluZXMgd2l0aCBubyB0b2tlbiBvbiB0aGVtXG4gICAgICBpZiBpZHhPZlRva2VuIGFuZCBub3QgdG9rZW5PblRoaXNMaW5lXG4gICAgICAgICMgaW5kZW50IGxpbmVzIGJ1dCByZW1vdmUgYW55IGJsYW5rIGxpbmVzIHdpdGggd2hpdGUgc3BhY2UgZXhjZXB0IHRoZSBsYXN0IHJvd1xuICAgICAgICBpZiByb3cgaXNudCByYW5nZS5lbmQucm93XG4gICAgICAgICAgYmxhbmtMaW5lRW5kUG9zID0gL15cXHMqJC8uZXhlYyhAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdykpP1swXS5sZW5ndGhcbiAgICAgICAgICBpZiBibGFua0xpbmVFbmRQb3M/XG4gICAgICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdyAsIGJsb2NrSW5kZW50OiAwIH0pXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGluZGVudFVudG9rZW5pc2VkTGluZSByb3csIHRva2VuU3RhY2ssIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBpbmRlbnRVbnRva2VuaXNlZExpbmUgcm93LCB0b2tlblN0YWNrLCBzdGFja09mVG9rZW5zU3RpbGxPcGVuXG5cblxuICAjIGluZGVudCBhbnkgbGluZXMgdGhhdCBoYXZlbid0IGFueSBpbnRlcmVzdGluZyB0b2tlbnNcbiAgaW5kZW50VW50b2tlbmlzZWRMaW5lOiAocm93LCB0b2tlblN0YWNrLCBzdGFja09mVG9rZW5zU3RpbGxPcGVuICkgLT5cbiAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgdG9rZW4gPSB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XVxuICAgIHN3aXRjaCB0b2tlbi50eXBlXG4gICAgICB3aGVuIEpTWFRBR19PUEVOLCBKU1hUQUdfU0VMRkNMT1NFX1NUQVJUXG4gICAgICAgIGlmICB0b2tlbi50ZXJtc1RoaXNUYWdzQXR0cmlidXRlc0lkeCBpcyBudWxsXG4gICAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlbi5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50UHJvcHM6IDEgfSlcbiAgICAgICAgZWxzZSBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnQ6IDEgfSlcbiAgICAgIHdoZW4gSlNYQlJBQ0VfT1BFTlxuICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnQ6IDEsIGFsbG93QWRkaXRpb25hbEluZGVudHM6IHRydWUgfSlcbiAgICAgIHdoZW4gQlJBQ0VfT1BFTiwgU1dJVENIX0JSQUNFX09QRU4sIFBBUkVOX09QRU5cbiAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlbi5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50OiAxLCBhbGxvd0FkZGl0aW9uYWxJbmRlbnRzOiB0cnVlIH0pXG4gICAgICB3aGVuIEpTWFRBR19TRUxGQ0xPU0VfRU5ELCBKU1hCUkFDRV9DTE9TRSwgSlNYVEFHX0NMT1NFX0FUVFJTXG4gICAgICAgIEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW5TdGFja1t0b2tlbi5wYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudFByb3BzOiAxfSlcbiAgICAgIHdoZW4gQlJBQ0VfQ0xPU0UsIFNXSVRDSF9CUkFDRV9DTE9TRSwgUEFSRU5fQ0xPU0VcbiAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3Rva2VuLnBhcmVudFRva2VuSWR4XS5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50OiAxLCBhbGxvd0FkZGl0aW9uYWxJbmRlbnRzOiB0cnVlIH0pXG4gICAgICB3aGVuIFNXSVRDSF9DQVNFLCBTV0lUQ0hfREVGQVVMVFxuICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnQ6IDEgfSlcbiAgICAgIHdoZW4gVEVNUExBVEVfU1RBUlQsIFRFTVBMQVRFX0VORFxuICAgICAgICByZXR1cm47ICMgZG9uJ3QgdG91Y2ggdGVtcGxhdGVzXG5cbiAgIyBnZXQgdGhlIHRva2VuIGF0IHRoZSBnaXZlbiBtYXRjaCBwb3NpdGlvbiBvciByZXR1cm4gdHJ1dGh5IGZhbHNlXG4gIGdldFRva2VuOiAoYnVmZmVyUm93LCBtYXRjaCkgLT5cbiAgICBzY29wZSA9IEBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oW2J1ZmZlclJvdywgbWF0Y2guaW5kZXhdKS5nZXRTY29wZXNBcnJheSgpLnBvcCgpXG4gICAgaWYgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24udGFnLmpzeCcgaXMgc2NvcGVcbiAgICAgIGlmICAgICAgbWF0Y2hbMV0/IHRoZW4gcmV0dXJuIEpTWFRBR19PUEVOXG4gICAgICBlbHNlIGlmIG1hdGNoWzNdPyB0aGVuIHJldHVybiBKU1hUQUdfU0VMRkNMT1NFX0VORFxuICAgIGVsc2UgaWYgJ0pTWEVuZFRhZ1N0YXJ0JyBpcyBzY29wZVxuICAgICAgaWYgbWF0Y2hbNF0/IHRoZW4gcmV0dXJuIEpTWFRBR19DTE9TRVxuICAgIGVsc2UgaWYgJ0pTWFN0YXJ0VGFnRW5kJyBpcyBzY29wZVxuICAgICAgaWYgbWF0Y2hbN10/IHRoZW4gcmV0dXJuIEpTWFRBR19DTE9TRV9BVFRSU1xuICAgIGVsc2UgaWYgbWF0Y2hbOF0/XG4gICAgICBpZiAncHVuY3R1YXRpb24uc2VjdGlvbi5lbWJlZGRlZC5iZWdpbi5qc3gnIGlzIHNjb3BlXG4gICAgICAgIHJldHVybiBKU1hCUkFDRV9PUEVOXG4gICAgICBlbHNlIGlmICdtZXRhLmJyYWNlLmN1cmx5LnN3aXRjaFN0YXJ0LmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gU1dJVENIX0JSQUNFX09QRU5cbiAgICAgIGVsc2UgaWYgJ21ldGEuYnJhY2UuY3VybHkuanMnIGlzIHNjb3BlIG9yXG4gICAgICAgICdtZXRhLmJyYWNlLmN1cmx5LmxpdG9iai5qcycgaXMgc2NvcGVcbiAgICAgICAgICByZXR1cm4gQlJBQ0VfT1BFTlxuICAgIGVsc2UgaWYgbWF0Y2hbOV0/XG4gICAgICBpZiAncHVuY3R1YXRpb24uc2VjdGlvbi5lbWJlZGRlZC5lbmQuanN4JyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gSlNYQlJBQ0VfQ0xPU0VcbiAgICAgIGVsc2UgaWYgJ21ldGEuYnJhY2UuY3VybHkuc3dpdGNoRW5kLmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gU1dJVENIX0JSQUNFX0NMT1NFXG4gICAgICBlbHNlIGlmICdtZXRhLmJyYWNlLmN1cmx5LmpzJyBpcyBzY29wZSBvclxuICAgICAgICAnbWV0YS5icmFjZS5jdXJseS5saXRvYmouanMnIGlzIHNjb3BlXG4gICAgICAgICAgcmV0dXJuIEJSQUNFX0NMT1NFXG4gICAgZWxzZSBpZiBtYXRjaFsxMF0/XG4gICAgICBpZiAna2V5d29yZC5vcGVyYXRvci50ZXJuYXJ5LmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gVEVSTkFSWV9JRlxuICAgIGVsc2UgaWYgbWF0Y2hbMTFdP1xuICAgICAgaWYgJ2tleXdvcmQub3BlcmF0b3IudGVybmFyeS5qcycgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIFRFUk5BUllfRUxTRVxuICAgIGVsc2UgaWYgbWF0Y2hbMTJdP1xuICAgICAgaWYgJ2tleXdvcmQuY29udHJvbC5jb25kaXRpb25hbC5qcycgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIEpTX0lGXG4gICAgZWxzZSBpZiBtYXRjaFsxM10/XG4gICAgICBpZiAna2V5d29yZC5jb250cm9sLmNvbmRpdGlvbmFsLmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gSlNfRUxTRVxuICAgIGVsc2UgaWYgbWF0Y2hbMTRdP1xuICAgICAgaWYgJ2tleXdvcmQuY29udHJvbC5zd2l0Y2guanMnIGlzIHNjb3BlXG4gICAgICAgIHJldHVybiBTV0lUQ0hfQ0FTRVxuICAgIGVsc2UgaWYgbWF0Y2hbMTVdP1xuICAgICAgaWYgJ2tleXdvcmQuY29udHJvbC5zd2l0Y2guanMnIGlzIHNjb3BlXG4gICAgICAgIHJldHVybiBTV0lUQ0hfREVGQVVMVFxuICAgIGVsc2UgaWYgbWF0Y2hbMTZdP1xuICAgICAgaWYgJ2tleXdvcmQuY29udHJvbC5mbG93LmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gSlNfUkVUVVJOXG4gICAgZWxzZSBpZiBtYXRjaFsxN10/XG4gICAgICBpZiAnbWV0YS5icmFjZS5yb3VuZC5qcycgaXMgc2NvcGUgb3JcbiAgICAgICAnbWV0YS5icmFjZS5yb3VuZC5ncmFwaHFsJyBpcyBzY29wZSBvclxuICAgICAgICdtZXRhLmJyYWNlLnJvdW5kLmRpcmVjdGl2ZS5ncmFwaHFsJyBpcyBzY29wZVxuICAgICAgICAgIHJldHVybiBQQVJFTl9PUEVOXG4gICAgZWxzZSBpZiBtYXRjaFsxOF0/XG4gICAgICBpZiAnbWV0YS5icmFjZS5yb3VuZC5qcycgaXMgc2NvcGUgb3JcbiAgICAgICAnbWV0YS5icmFjZS5yb3VuZC5ncmFwaHFsJyBpcyBzY29wZSBvclxuICAgICAgICdtZXRhLmJyYWNlLnJvdW5kLmRpcmVjdGl2ZS5ncmFwaHFsJyBpcyBzY29wZVxuICAgICAgICAgIHJldHVybiBQQVJFTl9DTE9TRVxuICAgIGVsc2UgaWYgbWF0Y2hbMTldP1xuICAgICAgaWYgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24ucXVhc2kuYmVnaW4uanMnIGlzIHNjb3BlXG4gICAgICAgIHJldHVybiBURU1QTEFURV9TVEFSVFxuICAgICAgaWYgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24ucXVhc2kuZW5kLmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gVEVNUExBVEVfRU5EXG5cbiAgICByZXR1cm4gTk9fVE9LRU5cblxuXG4gICMgZ2V0IGluZGVudCBvZiB0aGUgcHJldmlvdXMgcm93IHdpdGggY2hhcnMgaW4gaXRcbiAgZ2V0SW5kZW50T2ZQcmV2aW91c1JvdzogKHJvdykgLT5cbiAgICByZXR1cm4gMCB1bmxlc3Mgcm93XG4gICAgZm9yIHJvdyBpbiBbcm93LTEuLi4wXVxuICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG4gICAgICByZXR1cm4gQGVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyByb3cgaWYgIC8uKlxcUy8udGVzdCBsaW5lXG4gICAgcmV0dXJuIDBcblxuICAjIGdldCBlc2xpbnQgdHJhbnNsYXRlZCBpbmRlbnQgb3B0aW9uc1xuICBnZXRJbmRlbnRPcHRpb25zOiAoKSAtPlxuICAgIGlmIG5vdCBAYXV0b0pzeCB0aGVuIHJldHVybiBAdHJhbnNsYXRlSW5kZW50T3B0aW9ucygpXG4gICAgaWYgZXNsaW50cmNGaWxlbmFtZSA9IEBnZXRFc2xpbnRyY0ZpbGVuYW1lKClcbiAgICAgIGVzbGludHJjRmlsZW5hbWUgPSBuZXcgRmlsZShlc2xpbnRyY0ZpbGVuYW1lKVxuICAgICAgQHRyYW5zbGF0ZUluZGVudE9wdGlvbnMoQHJlYWRFc2xpbnRyY09wdGlvbnMoZXNsaW50cmNGaWxlbmFtZS5nZXRQYXRoKCkpKVxuICAgIGVsc2VcbiAgICAgIEB0cmFuc2xhdGVJbmRlbnRPcHRpb25zKHt9KSAjIGdldCBkZWZhdWx0c1xuXG4gICMgcmV0dXJuIHRleHQgc3RyaW5nIG9mIGEgcHJvamVjdCBiYXNlZCAuZXNsaW50cmMgZmlsZSBpZiBvbmUgZXhpc3RzXG4gIGdldEVzbGludHJjRmlsZW5hbWU6ICgpIC0+XG4gICAgcHJvamVjdENvbnRhaW5pbmdTb3VyY2UgPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGggQGVkaXRvci5nZXRQYXRoKClcbiAgICAjIElzIHRoZSBzb3VyY2VGaWxlIGxvY2F0ZWQgaW5zaWRlIGFuIEF0b20gcHJvamVjdCBmb2xkZXI/XG4gICAgaWYgcHJvamVjdENvbnRhaW5pbmdTb3VyY2VbMF0/XG4gICAgICBwYXRoLmpvaW4gcHJvamVjdENvbnRhaW5pbmdTb3VyY2VbMF0sICcuZXNsaW50cmMnXG5cbiAgIyBtb3VzZSBzdGF0ZVxuICBvbk1vdXNlRG93bjogKCkgPT5cbiAgICBAbW91c2VVcCA9IGZhbHNlXG5cbiAgIyBtb3VzZSBzdGF0ZVxuICBvbk1vdXNlVXA6ICgpID0+XG4gICAgQG1vdXNlVXAgPSB0cnVlXG5cbiAgIyB0byBjcmVhdGUgaW5kZW50cy4gV2UgY2FuIHJlYWQgYW5kIHJldHVybiB0aGUgcnVsZXMgcHJvcGVydGllcyBvciB1bmRlZmluZWRcbiAgcmVhZEVzbGludHJjT3B0aW9uczogKGVzbGludHJjRmlsZSkgLT5cbiAgICAjIGdldCBsb2NhbCBwYXRoIG92ZXJpZGVzXG4gICAgaWYgZnMuZXhpc3RzU3luYyBlc2xpbnRyY0ZpbGVcbiAgICAgIGZpbGVDb250ZW50ID0gc3RyaXBKc29uQ29tbWVudHMoZnMucmVhZEZpbGVTeW5jKGVzbGludHJjRmlsZSwgJ3V0ZjgnKSlcbiAgICAgIHRyeVxuICAgICAgICBlc2xpbnRSdWxlcyA9IChZQU1MLnNhZmVMb2FkIGZpbGVDb250ZW50KS5ydWxlc1xuICAgICAgICBpZiBlc2xpbnRSdWxlcyB0aGVuIHJldHVybiBlc2xpbnRSdWxlc1xuICAgICAgY2F0Y2ggZXJyXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcIkxCOiBFcnJvciByZWFkaW5nIC5lc2xpbnRyYyBhdCAje2VzbGludHJjRmlsZX1cIixcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgIGRldGFpbDogXCIje2Vyci5tZXNzYWdlfVwiXG4gICAgcmV0dXJuIHt9XG5cbiAgIyB1c2UgZXNsaW50IHJlYWN0IGZvcm1hdCBkZXNjcmliZWQgYXQgaHR0cDovL3Rpbnl1cmwuY29tL3A0bXRhdHZcbiAgIyB0dXJuIHNwYWNlcyBpbnRvIHRhYiBkaW1lbnNpb25zIHdoaWNoIGNhbiBiZSBkZWNpbWFsXG4gICMgYSBlbXB0eSBvYmplY3QgYXJndW1lbnQgcGFyc2VzIGJhY2sgdGhlIGRlZmF1bHQgc2V0dGluZ3NcbiAgdHJhbnNsYXRlSW5kZW50T3B0aW9uczogKGVzbGludFJ1bGVzKSAtPlxuICAgICMgRXNsaW50IHJ1bGVzIHRvIHVzZSBhcyBkZWZhdWx0IG92ZXJpZGRlbiBieSAuZXNsaW50cmNcbiAgICAjIE4uQi4gdGhhdCB0aGlzIGlzIG5vdCB0aGUgc2FtZSBhcyB0aGUgZXNsaW50IHJ1bGVzIGluIHRoYXRcbiAgICAjIHRoZSB0YWItc3BhY2VzIGFuZCAndGFiJ3MgaW4gZXNsaW50cmMgYXJlIGNvbnZlcnRlZCB0byB0YWJzIGJhc2VkIHVwb25cbiAgICAjIHRoZSBBdG9tIGVkaXRvciB0YWIgc3BhY2luZy5cbiAgICAjIGUuZy4gZXNsaW50IGluZGVudCBbMSw0XSB3aXRoIGFuIEF0b20gdGFiIHNwYWNpbmcgb2YgMiBiZWNvbWVzIGluZGVudCBbMSwyXVxuICAgIGVzbGludEluZGVudE9wdGlvbnMgID1cbiAgICAgIGpzeEluZGVudDogWzEsMV0gICAgICAgICAgICAjIDEgPSBlbmFibGVkLCAxPSN0YWJzXG4gICAgICBqc3hJbmRlbnRQcm9wczogWzEsMV0gICAgICAgIyAxID0gZW5hYmxlZCwgMT0jdGFic1xuICAgICAganN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvbjogW1xuICAgICAgICAxLFxuICAgICAgICBzZWxmQ2xvc2luZzogVEFHQUxJR05FRFxuICAgICAgICBub25FbXB0eTogVEFHQUxJR05FRFxuICAgICAgXVxuXG4gICAgcmV0dXJuIGVzbGludEluZGVudE9wdGlvbnMgdW5sZXNzIHR5cGVvZiBlc2xpbnRSdWxlcyBpcyBcIm9iamVjdFwiXG5cbiAgICBFU19ERUZBVUxUX0lOREVOVCA9IDQgIyBkZWZhdWx0IGVzbGludCBpbmRlbnQgYXMgc3BhY2VzXG5cbiAgICAjIHJlYWQgaW5kZW50IGlmIGl0IGV4aXN0cyBhbmQgdXNlIGl0IGFzIHRoZSBkZWZhdWx0IGluZGVudCBmb3IgSlNYXG4gICAgcnVsZSA9IGVzbGludFJ1bGVzWydpbmRlbnQnXVxuICAgIGlmIHR5cGVvZiBydWxlIGlzICdudW1iZXInIG9yIHR5cGVvZiBydWxlIGlzICdzdHJpbmcnXG4gICAgICBkZWZhdWx0SW5kZW50ICA9IEVTX0RFRkFVTFRfSU5ERU5UIC8gQGVkaXRvci5nZXRUYWJMZW5ndGgoKVxuICAgIGVsc2UgaWYgdHlwZW9mIHJ1bGUgaXMgJ29iamVjdCdcbiAgICAgIGlmIHR5cGVvZiBydWxlWzFdIGlzICdudW1iZXInXG4gICAgICAgIGRlZmF1bHRJbmRlbnQgID0gcnVsZVsxXSAvIEBlZGl0b3IuZ2V0VGFiTGVuZ3RoKClcbiAgICAgIGVsc2UgZGVmYXVsdEluZGVudCAgPSAxXG4gICAgZWxzZSBkZWZhdWx0SW5kZW50ICA9IDFcblxuICAgIHJ1bGUgPSBlc2xpbnRSdWxlc1sncmVhY3QvanN4LWluZGVudCddXG4gICAgaWYgdHlwZW9mIHJ1bGUgaXMgJ251bWJlcicgb3IgdHlwZW9mIHJ1bGUgaXMgJ3N0cmluZydcbiAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50WzBdID0gcnVsZVxuICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRbMV0gPSBFU19ERUZBVUxUX0lOREVOVCAvIEBlZGl0b3IuZ2V0VGFiTGVuZ3RoKClcbiAgICBlbHNlIGlmIHR5cGVvZiBydWxlIGlzICdvYmplY3QnXG4gICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFswXSA9IHJ1bGVbMF1cbiAgICAgIGlmIHR5cGVvZiBydWxlWzFdIGlzICdudW1iZXInXG4gICAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50WzFdID0gcnVsZVsxXSAvIEBlZGl0b3IuZ2V0VGFiTGVuZ3RoKClcbiAgICAgIGVsc2UgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRbMV0gPSAxXG4gICAgZWxzZSBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFsxXSA9IGRlZmF1bHRJbmRlbnRcblxuICAgIHJ1bGUgPSBlc2xpbnRSdWxlc1sncmVhY3QvanN4LWluZGVudC1wcm9wcyddXG4gICAgaWYgdHlwZW9mIHJ1bGUgaXMgJ251bWJlcicgb3IgdHlwZW9mIHJ1bGUgaXMgJ3N0cmluZydcbiAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50UHJvcHNbMF0gPSBydWxlXG4gICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFByb3BzWzFdID0gRVNfREVGQVVMVF9JTkRFTlQgLyBAZWRpdG9yLmdldFRhYkxlbmd0aCgpXG4gICAgZWxzZSBpZiB0eXBlb2YgcnVsZSBpcyAnb2JqZWN0J1xuICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRQcm9wc1swXSA9IHJ1bGVbMF1cbiAgICAgIGlmIHR5cGVvZiBydWxlWzFdIGlzICdudW1iZXInXG4gICAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50UHJvcHNbMV0gPSBydWxlWzFdIC8gQGVkaXRvci5nZXRUYWJMZW5ndGgoKVxuICAgICAgZWxzZSBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFByb3BzWzFdID0gMVxuICAgIGVsc2UgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRQcm9wc1sxXSA9IGRlZmF1bHRJbmRlbnRcblxuICAgIHJ1bGUgPSBlc2xpbnRSdWxlc1sncmVhY3QvanN4LWNsb3NpbmctYnJhY2tldC1sb2NhdGlvbiddXG4gICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uWzFdLnNlbGZDbG9zaW5nID0gVEFHQUxJR05FRFxuICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvblsxXS5ub25FbXB0eSA9IFRBR0FMSUdORURcbiAgICBpZiB0eXBlb2YgcnVsZSBpcyAnbnVtYmVyJyBvciB0eXBlb2YgcnVsZSBpcyAnc3RyaW5nJ1xuICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uWzBdID0gcnVsZVxuICAgIGVsc2UgaWYgdHlwZW9mIHJ1bGUgaXMgJ29iamVjdCcgIyBhcnJheVxuICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uWzBdID0gcnVsZVswXVxuICAgICAgaWYgdHlwZW9mIHJ1bGVbMV0gaXMgJ3N0cmluZydcbiAgICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uWzFdLnNlbGZDbG9zaW5nID1cbiAgICAgICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeENsb3NpbmdCcmFja2V0TG9jYXRpb25bMV0ubm9uRW1wdHkgPVxuICAgICAgICAgICAgcnVsZVsxXVxuICAgICAgZWxzZVxuICAgICAgICBpZiBydWxlWzFdLnNlbGZDbG9zaW5nP1xuICAgICAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvblsxXS5zZWxmQ2xvc2luZyA9IHJ1bGVbMV0uc2VsZkNsb3NpbmdcbiAgICAgICAgaWYgcnVsZVsxXS5ub25FbXB0eT9cbiAgICAgICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeENsb3NpbmdCcmFja2V0TG9jYXRpb25bMV0ubm9uRW1wdHkgPSBydWxlWzFdLm5vbkVtcHR5XG5cbiAgICByZXR1cm4gZXNsaW50SW5kZW50T3B0aW9uc1xuXG4gICMgYWxsaWduIG5vbkVtcHR5IGFuZCBzZWxmQ2xvc2luZyB0YWdzIGJhc2VkIG9uIGVzbGludCBydWxlc1xuICAjIHJvdyB0byBiZSBpbmRlbnRlZCBiYXNlZCB1cG9uIGEgcGFyZW50VGFncyBwcm9wZXJ0aWVzIGFuZCBhIHJ1bGUgdHlwZVxuICAjIHJldHVybnMgaW5kZW50Um93J3MgcmV0dXJuIHZhbHVlXG4gIGluZGVudEZvckNsb3NpbmdCcmFja2V0OiAoIHJvdywgcGFyZW50VGFnLCBjbG9zaW5nQnJhY2tldFJ1bGUgKSAtPlxuICAgIGlmIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeENsb3NpbmdCcmFja2V0TG9jYXRpb25bMF1cbiAgICAgIGlmIGNsb3NpbmdCcmFja2V0UnVsZSBpcyBUQUdBTElHTkVEXG4gICAgICAgIEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogcGFyZW50VGFnLnRva2VuSW5kZW50YXRpb259KVxuICAgICAgZWxzZSBpZiBjbG9zaW5nQnJhY2tldFJ1bGUgaXMgTElORUFMSUdORURcbiAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiBwYXJlbnRUYWcuZmlyc3RDaGFySW5kZW50YXRpb24gfSlcbiAgICAgIGVsc2UgaWYgY2xvc2luZ0JyYWNrZXRSdWxlIGlzIEFGVEVSUFJPUFNcbiAgICAgICAgIyB0aGlzIHJlYWxseSBpc24ndCB2YWxpZCBhcyB0aGlzIHRhZyBzaG91bGRuJ3QgYmUgb24gYSBsaW5lIGJ5IGl0c2VsZlxuICAgICAgICAjIGJ1dCBJIGRvbid0IHJlZm9ybWF0IGxpbmVzIGp1c3QgaW5kZW50IVxuICAgICAgICAjIGluZGVudCB0byBtYWtlIGl0IGxvb2sgT0sgYWx0aG91Z2ggaXQgd2lsbCBmYWlsIGVzbGludFxuICAgICAgICBpZiBAZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRQcm9wc1swXVxuICAgICAgICAgIEBpbmRlbnRSb3coe3Jvdzogcm93LCAgYmxvY2tJbmRlbnQ6IHBhcmVudFRhZy5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50UHJvcHM6IDEgfSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBpbmRlbnRSb3coe3Jvdzogcm93LCAgYmxvY2tJbmRlbnQ6IHBhcmVudFRhZy5maXJzdENoYXJJbmRlbnRhdGlvbn0pXG4gICAgICBlbHNlIGlmIGNsb3NpbmdCcmFja2V0UnVsZSBpcyBQUk9QU0FMSUdORURcbiAgICAgICAgaWYgQGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50UHJvcHNbMF1cbiAgICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdywgIGJsb2NrSW5kZW50OiBwYXJlbnRUYWcuZmlyc3RDaGFySW5kZW50YXRpb24sanN4SW5kZW50UHJvcHM6IDF9KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csICBibG9ja0luZGVudDogcGFyZW50VGFnLmZpcnN0Q2hhckluZGVudGF0aW9ufSlcblxuICAjIGluZGVudCBhIHJvdyBieSB0aGUgYWRkaXRpb24gb2Ygb25lIG9yIG1vcmUgaW5kZW50cy5cbiAgIyByZXR1cm5zIGZhbHNlIGlmIG5vIGluZGVudCByZXF1aXJlZCBhcyBpdCBpcyBhbHJlYWR5IGNvcnJlY3RcbiAgIyByZXR1cm4gdHJ1ZSBpZiBpbmRlbnQgd2FzIHJlcXVpcmVkXG4gICMgYmxvY2tJbmRlbnQgaXMgdGhlIGluZGVudCB0byB0aGUgc3RhcnQgb2YgdGhpcyBsb2dpY2FsIGpzeCBibG9ja1xuICAjIG90aGVyIGluZGVudHMgYXJlIHRoZSByZXF1aXJlZCBpbmRlbnQgYmFzZWQgb24gZXNsaW50IGNvbmRpdGlvbnMgZm9yIFJlYWN0XG4gICMgb3B0aW9uIGNvbnRhaW5zIHJvdyB0byBpbmRlbnQgYW5kIGFsbG93QWRkaXRpb25hbEluZGVudHMgZmxhZ1xuICBpbmRlbnRSb3c6IChvcHRpb25zKSAtPlxuICAgIHsgcm93LCBhbGxvd0FkZGl0aW9uYWxJbmRlbnRzLCBibG9ja0luZGVudCwganN4SW5kZW50LCBqc3hJbmRlbnRQcm9wcyB9ID0gb3B0aW9uc1xuICAgIGlmIEB0ZW1wbGF0ZURlcHRoID4gMCB0aGVuIHJldHVybiBmYWxzZSAjIGRvbid0IGluZGVudCBpbnNpZGUgYSB0ZW1wbGF0ZVxuICAgICMgY2FsYyBvdmVyYWxsIGluZGVudFxuICAgIGlmIGpzeEluZGVudFxuICAgICAgaWYgQGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50WzBdXG4gICAgICAgIGlmIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFsxXVxuICAgICAgICAgIGJsb2NrSW5kZW50ICs9IGpzeEluZGVudCAqIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFsxXVxuICAgIGlmIGpzeEluZGVudFByb3BzXG4gICAgICBpZiBAZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRQcm9wc1swXVxuICAgICAgICBpZiBAZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRQcm9wc1sxXVxuICAgICAgICAgIGJsb2NrSW5kZW50ICs9IGpzeEluZGVudFByb3BzICogQGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50UHJvcHNbMV1cbiAgICAjIGFsbG93QWRkaXRpb25hbEluZGVudHMgYWxsb3dzIGluZGVudHMgdG8gYmUgZ3JlYXRlciB0aGFuIHRoZSBtaW5pbXVtXG4gICAgIyB1c2VkIHdoZXJlIGl0ZW1zIGFyZSBhbGlnbmVkIGJ1dCBubyBlc2xpbnQgcnVsZXMgYXJlIGFwcGxpY2FibGVcbiAgICAjIHNvIHVzZXIgaGFzIHNvbWUgZGlzY3JldGlvbiBpbiBhZGRpbmcgbW9yZSBpbmRlbnRzXG4gICAgaWYgYWxsb3dBZGRpdGlvbmFsSW5kZW50c1xuICAgICAgaWYgQGVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpIDwgYmxvY2tJbmRlbnRcbiAgICAgICAgQGVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyByb3csIGJsb2NrSW5kZW50LCB7IHByZXNlcnZlTGVhZGluZ1doaXRlc3BhY2U6IGZhbHNlIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlXG4gICAgICBpZiBAZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdykgaXNudCBibG9ja0luZGVudFxuICAgICAgICBAZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93IHJvdywgYmxvY2tJbmRlbnQsIHsgcHJlc2VydmVMZWFkaW5nV2hpdGVzcGFjZTogZmFsc2UgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuIl19
