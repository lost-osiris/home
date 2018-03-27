(function() {
  var APair, AngleBracket, AnyPair, AnyPairAllowForwarding, AnyQuote, Arguments, BackTick, Base, Comment, CommentOrParagraph, CurlyBracket, CurrentLine, DoubleQuote, Empty, Entire, Fold, Function, Indentation, LatestChange, Pair, PairFinder, Paragraph, Parenthesis, PersistentSelection, Point, PreviousSelection, Quote, Range, SearchMatchBackward, SearchMatchForward, SingleQuote, SmartWord, SquareBracket, Subword, Tag, TextObject, VisibleArea, WholeWord, Word, _, expandRangeToWhiteSpaces, getBufferRows, getCodeFoldRowRangesContainesForRow, getLineTextToBufferPosition, getValidVimBufferRow, getVisibleBufferRange, isIncludeFunctionScopeForRow, pointIsAtEndOfLine, ref, ref1, sortRanges, splitArguments, translatePointAndClip, traverseTextFromPoint, trimRange,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point;

  _ = require('underscore-plus');

  Base = require('./base');

  ref1 = require('./utils'), getLineTextToBufferPosition = ref1.getLineTextToBufferPosition, getCodeFoldRowRangesContainesForRow = ref1.getCodeFoldRowRangesContainesForRow, isIncludeFunctionScopeForRow = ref1.isIncludeFunctionScopeForRow, expandRangeToWhiteSpaces = ref1.expandRangeToWhiteSpaces, getVisibleBufferRange = ref1.getVisibleBufferRange, translatePointAndClip = ref1.translatePointAndClip, getBufferRows = ref1.getBufferRows, getValidVimBufferRow = ref1.getValidVimBufferRow, trimRange = ref1.trimRange, sortRanges = ref1.sortRanges, pointIsAtEndOfLine = ref1.pointIsAtEndOfLine, splitArguments = ref1.splitArguments, traverseTextFromPoint = ref1.traverseTextFromPoint;

  PairFinder = null;

  TextObject = (function(superClass) {
    extend(TextObject, superClass);

    TextObject.extend(false);

    TextObject.operationKind = 'text-object';

    TextObject.prototype.wise = 'characterwise';

    TextObject.prototype.supportCount = false;

    TextObject.prototype.selectOnce = false;

    TextObject.deriveInnerAndA = function() {
      this.generateClass("A" + this.name, false);
      return this.generateClass("Inner" + this.name, true);
    };

    TextObject.deriveInnerAndAForAllowForwarding = function() {
      this.generateClass("A" + this.name + "AllowForwarding", false, true);
      return this.generateClass("Inner" + this.name + "AllowForwarding", true, true);
    };

    TextObject.generateClass = function(klassName, inner, allowForwarding) {
      var klass;
      klass = (function(superClass1) {
        extend(_Class, superClass1);

        function _Class() {
          return _Class.__super__.constructor.apply(this, arguments);
        }

        return _Class;

      })(this);
      Object.defineProperty(klass, 'name', {
        get: function() {
          return klassName;
        }
      });
      klass.prototype.inner = inner;
      if (allowForwarding) {
        klass.prototype.allowForwarding = true;
      }
      return klass.extend();
    };

    function TextObject() {
      TextObject.__super__.constructor.apply(this, arguments);
      this.initialize();
    }

    TextObject.prototype.isInner = function() {
      return this.inner;
    };

    TextObject.prototype.isA = function() {
      return !this.inner;
    };

    TextObject.prototype.isLinewise = function() {
      return this.wise === 'linewise';
    };

    TextObject.prototype.isBlockwise = function() {
      return this.wise === 'blockwise';
    };

    TextObject.prototype.forceWise = function(wise) {
      return this.wise = wise;
    };

    TextObject.prototype.resetState = function() {
      return this.selectSucceeded = null;
    };

    TextObject.prototype.execute = function() {
      this.resetState();
      if (this.operator != null) {
        return this.select();
      } else {
        throw new Error('in TextObject: Must not happen');
      }
    };

    TextObject.prototype.select = function() {
      var $selection, i, j, k, len, len1, len2, ref2, ref3, ref4, results;
      if (this.isMode('visual', 'blockwise')) {
        this.swrap.normalize(this.editor);
      }
      this.countTimes(this.getCount(), (function(_this) {
        return function(arg1) {
          var i, len, oldRange, ref2, results, selection, stop;
          stop = arg1.stop;
          if (!_this.supportCount) {
            stop();
          }
          ref2 = _this.editor.getSelections();
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            selection = ref2[i];
            oldRange = selection.getBufferRange();
            if (_this.selectTextObject(selection)) {
              _this.selectSucceeded = true;
            }
            if (selection.getBufferRange().isEqual(oldRange)) {
              stop();
            }
            if (_this.selectOnce) {
              break;
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this));
      this.editor.mergeIntersectingSelections();
      if (this.wise == null) {
        this.wise = this.swrap.detectWise(this.editor);
      }
      if (this.mode === 'visual') {
        if (this.selectSucceeded) {
          switch (this.wise) {
            case 'characterwise':
              ref2 = this.swrap.getSelections(this.editor);
              for (i = 0, len = ref2.length; i < len; i++) {
                $selection = ref2[i];
                $selection.saveProperties();
              }
              break;
            case 'linewise':
              ref3 = this.swrap.getSelections(this.editor);
              for (j = 0, len1 = ref3.length; j < len1; j++) {
                $selection = ref3[j];
                if (this.getConfig('keepColumnOnSelectTextObject')) {
                  if (!$selection.hasProperties()) {
                    $selection.saveProperties();
                  }
                } else {
                  $selection.saveProperties();
                }
                $selection.fixPropertyRowToRowRange();
              }
          }
        }
        if (this.submode === 'blockwise') {
          ref4 = this.swrap.getSelections(this.editor);
          results = [];
          for (k = 0, len2 = ref4.length; k < len2; k++) {
            $selection = ref4[k];
            $selection.normalize();
            results.push($selection.applyWise('blockwise'));
          }
          return results;
        }
      }
    };

    TextObject.prototype.selectTextObject = function(selection) {
      var range;
      if (range = this.getRange(selection)) {
        this.swrap(selection).setBufferRange(range);
        return true;
      }
    };

    TextObject.prototype.getRange = function(selection) {
      return null;
    };

    return TextObject;

  })(Base);

  Word = (function(superClass) {
    extend(Word, superClass);

    function Word() {
      return Word.__super__.constructor.apply(this, arguments);
    }

    Word.extend(false);

    Word.deriveInnerAndA();

    Word.prototype.getRange = function(selection) {
      var point, range;
      point = this.getCursorPositionForSelection(selection);
      range = this.getWordBufferRangeAndKindAtBufferPosition(point, {
        wordRegex: this.wordRegex
      }).range;
      if (this.isA()) {
        return expandRangeToWhiteSpaces(this.editor, range);
      } else {
        return range;
      }
    };

    return Word;

  })(TextObject);

  WholeWord = (function(superClass) {
    extend(WholeWord, superClass);

    function WholeWord() {
      return WholeWord.__super__.constructor.apply(this, arguments);
    }

    WholeWord.extend(false);

    WholeWord.deriveInnerAndA();

    WholeWord.prototype.wordRegex = /\S+/;

    return WholeWord;

  })(Word);

  SmartWord = (function(superClass) {
    extend(SmartWord, superClass);

    function SmartWord() {
      return SmartWord.__super__.constructor.apply(this, arguments);
    }

    SmartWord.extend(false);

    SmartWord.deriveInnerAndA();

    SmartWord.description = "A word that consists of alphanumeric chars(`/[A-Za-z0-9_]/`) and hyphen `-`";

    SmartWord.prototype.wordRegex = /[\w-]+/;

    return SmartWord;

  })(Word);

  Subword = (function(superClass) {
    extend(Subword, superClass);

    function Subword() {
      return Subword.__super__.constructor.apply(this, arguments);
    }

    Subword.extend(false);

    Subword.deriveInnerAndA();

    Subword.prototype.getRange = function(selection) {
      this.wordRegex = selection.cursor.subwordRegExp();
      return Subword.__super__.getRange.apply(this, arguments);
    };

    return Subword;

  })(Word);

  Pair = (function(superClass) {
    extend(Pair, superClass);

    function Pair() {
      return Pair.__super__.constructor.apply(this, arguments);
    }

    Pair.extend(false);

    Pair.prototype.supportCount = true;

    Pair.prototype.allowNextLine = null;

    Pair.prototype.adjustInnerRange = true;

    Pair.prototype.pair = null;

    Pair.prototype.inclusive = true;

    Pair.prototype.initialize = function() {
      if (PairFinder == null) {
        PairFinder = require('./pair-finder.coffee');
      }
      return Pair.__super__.initialize.apply(this, arguments);
    };

    Pair.prototype.isAllowNextLine = function() {
      var ref2;
      return (ref2 = this.allowNextLine) != null ? ref2 : (this.pair != null) && this.pair[0] !== this.pair[1];
    };

    Pair.prototype.adjustRange = function(arg1) {
      var end, start;
      start = arg1.start, end = arg1.end;
      if (pointIsAtEndOfLine(this.editor, start)) {
        start = start.traverse([1, 0]);
      }
      if (getLineTextToBufferPosition(this.editor, end).match(/^\s*$/)) {
        if (this.mode === 'visual') {
          end = new Point(end.row - 1, 2e308);
        } else {
          end = new Point(end.row, 0);
        }
      }
      return new Range(start, end);
    };

    Pair.prototype.getFinder = function() {
      var options;
      options = {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        pair: this.pair,
        inclusive: this.inclusive
      };
      if (this.pair[0] === this.pair[1]) {
        return new PairFinder.QuoteFinder(this.editor, options);
      } else {
        return new PairFinder.BracketFinder(this.editor, options);
      }
    };

    Pair.prototype.getPairInfo = function(from) {
      var pairInfo;
      pairInfo = this.getFinder().find(from);
      if (pairInfo == null) {
        return null;
      }
      if (this.adjustInnerRange) {
        pairInfo.innerRange = this.adjustRange(pairInfo.innerRange);
      }
      pairInfo.targetRange = this.isInner() ? pairInfo.innerRange : pairInfo.aRange;
      return pairInfo;
    };

    Pair.prototype.getRange = function(selection) {
      var originalRange, pairInfo;
      originalRange = selection.getBufferRange();
      pairInfo = this.getPairInfo(this.getCursorPositionForSelection(selection));
      if (pairInfo != null ? pairInfo.targetRange.isEqual(originalRange) : void 0) {
        pairInfo = this.getPairInfo(pairInfo.aRange.end);
      }
      return pairInfo != null ? pairInfo.targetRange : void 0;
    };

    return Pair;

  })(TextObject);

  APair = (function(superClass) {
    extend(APair, superClass);

    function APair() {
      return APair.__super__.constructor.apply(this, arguments);
    }

    APair.extend(false);

    return APair;

  })(Pair);

  AnyPair = (function(superClass) {
    extend(AnyPair, superClass);

    function AnyPair() {
      return AnyPair.__super__.constructor.apply(this, arguments);
    }

    AnyPair.extend(false);

    AnyPair.deriveInnerAndA();

    AnyPair.prototype.allowForwarding = false;

    AnyPair.prototype.member = ['DoubleQuote', 'SingleQuote', 'BackTick', 'CurlyBracket', 'AngleBracket', 'SquareBracket', 'Parenthesis'];

    AnyPair.prototype.getRanges = function(selection) {
      return this.member.map((function(_this) {
        return function(klass) {
          return _this["new"](klass, {
            inner: _this.inner,
            allowForwarding: _this.allowForwarding,
            inclusive: _this.inclusive
          }).getRange(selection);
        };
      })(this)).filter(function(range) {
        return range != null;
      });
    };

    AnyPair.prototype.getRange = function(selection) {
      return _.last(sortRanges(this.getRanges(selection)));
    };

    return AnyPair;

  })(Pair);

  AnyPairAllowForwarding = (function(superClass) {
    extend(AnyPairAllowForwarding, superClass);

    function AnyPairAllowForwarding() {
      return AnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AnyPairAllowForwarding.extend(false);

    AnyPairAllowForwarding.deriveInnerAndA();

    AnyPairAllowForwarding.description = "Range surrounded by auto-detected paired chars from enclosed and forwarding area";

    AnyPairAllowForwarding.prototype.allowForwarding = true;

    AnyPairAllowForwarding.prototype.getRange = function(selection) {
      var enclosingRange, enclosingRanges, forwardingRanges, from, ranges, ref2;
      ranges = this.getRanges(selection);
      from = selection.cursor.getBufferPosition();
      ref2 = _.partition(ranges, function(range) {
        return range.start.isGreaterThanOrEqual(from);
      }), forwardingRanges = ref2[0], enclosingRanges = ref2[1];
      enclosingRange = _.last(sortRanges(enclosingRanges));
      forwardingRanges = sortRanges(forwardingRanges);
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function(range) {
          return enclosingRange.containsRange(range);
        });
      }
      return forwardingRanges[0] || enclosingRange;
    };

    return AnyPairAllowForwarding;

  })(AnyPair);

  AnyQuote = (function(superClass) {
    extend(AnyQuote, superClass);

    function AnyQuote() {
      return AnyQuote.__super__.constructor.apply(this, arguments);
    }

    AnyQuote.extend(false);

    AnyQuote.deriveInnerAndA();

    AnyQuote.prototype.allowForwarding = true;

    AnyQuote.prototype.member = ['DoubleQuote', 'SingleQuote', 'BackTick'];

    AnyQuote.prototype.getRange = function(selection) {
      var ranges;
      ranges = this.getRanges(selection);
      if (ranges.length) {
        return _.first(_.sortBy(ranges, function(r) {
          return r.end.column;
        }));
      }
    };

    return AnyQuote;

  })(AnyPair);

  Quote = (function(superClass) {
    extend(Quote, superClass);

    function Quote() {
      return Quote.__super__.constructor.apply(this, arguments);
    }

    Quote.extend(false);

    Quote.prototype.allowForwarding = true;

    return Quote;

  })(Pair);

  DoubleQuote = (function(superClass) {
    extend(DoubleQuote, superClass);

    function DoubleQuote() {
      return DoubleQuote.__super__.constructor.apply(this, arguments);
    }

    DoubleQuote.extend(false);

    DoubleQuote.deriveInnerAndA();

    DoubleQuote.prototype.pair = ['"', '"'];

    return DoubleQuote;

  })(Quote);

  SingleQuote = (function(superClass) {
    extend(SingleQuote, superClass);

    function SingleQuote() {
      return SingleQuote.__super__.constructor.apply(this, arguments);
    }

    SingleQuote.extend(false);

    SingleQuote.deriveInnerAndA();

    SingleQuote.prototype.pair = ["'", "'"];

    return SingleQuote;

  })(Quote);

  BackTick = (function(superClass) {
    extend(BackTick, superClass);

    function BackTick() {
      return BackTick.__super__.constructor.apply(this, arguments);
    }

    BackTick.extend(false);

    BackTick.deriveInnerAndA();

    BackTick.prototype.pair = ['`', '`'];

    return BackTick;

  })(Quote);

  CurlyBracket = (function(superClass) {
    extend(CurlyBracket, superClass);

    function CurlyBracket() {
      return CurlyBracket.__super__.constructor.apply(this, arguments);
    }

    CurlyBracket.extend(false);

    CurlyBracket.deriveInnerAndA();

    CurlyBracket.deriveInnerAndAForAllowForwarding();

    CurlyBracket.prototype.pair = ['{', '}'];

    return CurlyBracket;

  })(Pair);

  SquareBracket = (function(superClass) {
    extend(SquareBracket, superClass);

    function SquareBracket() {
      return SquareBracket.__super__.constructor.apply(this, arguments);
    }

    SquareBracket.extend(false);

    SquareBracket.deriveInnerAndA();

    SquareBracket.deriveInnerAndAForAllowForwarding();

    SquareBracket.prototype.pair = ['[', ']'];

    return SquareBracket;

  })(Pair);

  Parenthesis = (function(superClass) {
    extend(Parenthesis, superClass);

    function Parenthesis() {
      return Parenthesis.__super__.constructor.apply(this, arguments);
    }

    Parenthesis.extend(false);

    Parenthesis.deriveInnerAndA();

    Parenthesis.deriveInnerAndAForAllowForwarding();

    Parenthesis.prototype.pair = ['(', ')'];

    return Parenthesis;

  })(Pair);

  AngleBracket = (function(superClass) {
    extend(AngleBracket, superClass);

    function AngleBracket() {
      return AngleBracket.__super__.constructor.apply(this, arguments);
    }

    AngleBracket.extend(false);

    AngleBracket.deriveInnerAndA();

    AngleBracket.deriveInnerAndAForAllowForwarding();

    AngleBracket.prototype.pair = ['<', '>'];

    return AngleBracket;

  })(Pair);

  Tag = (function(superClass) {
    extend(Tag, superClass);

    function Tag() {
      return Tag.__super__.constructor.apply(this, arguments);
    }

    Tag.extend(false);

    Tag.deriveInnerAndA();

    Tag.prototype.allowNextLine = true;

    Tag.prototype.allowForwarding = true;

    Tag.prototype.adjustInnerRange = false;

    Tag.prototype.getTagStartPoint = function(from) {
      var pattern, tagRange;
      tagRange = null;
      pattern = PairFinder.TagFinder.prototype.pattern;
      this.scanForward(pattern, {
        from: [from.row, 0]
      }, function(arg1) {
        var range, stop;
        range = arg1.range, stop = arg1.stop;
        if (range.containsPoint(from, true)) {
          tagRange = range;
          return stop();
        }
      });
      return tagRange != null ? tagRange.start : void 0;
    };

    Tag.prototype.getFinder = function() {
      return new PairFinder.TagFinder(this.editor, {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        inclusive: this.inclusive
      });
    };

    Tag.prototype.getPairInfo = function(from) {
      var ref2;
      return Tag.__super__.getPairInfo.call(this, (ref2 = this.getTagStartPoint(from)) != null ? ref2 : from);
    };

    return Tag;

  })(Pair);

  Paragraph = (function(superClass) {
    extend(Paragraph, superClass);

    function Paragraph() {
      return Paragraph.__super__.constructor.apply(this, arguments);
    }

    Paragraph.extend(false);

    Paragraph.deriveInnerAndA();

    Paragraph.prototype.wise = 'linewise';

    Paragraph.prototype.supportCount = true;

    Paragraph.prototype.findRow = function(fromRow, direction, fn) {
      var foundRow, i, len, ref2, row;
      if (typeof fn.reset === "function") {
        fn.reset();
      }
      foundRow = fromRow;
      ref2 = getBufferRows(this.editor, {
        startRow: fromRow,
        direction: direction
      });
      for (i = 0, len = ref2.length; i < len; i++) {
        row = ref2[i];
        if (!fn(row, direction)) {
          break;
        }
        foundRow = row;
      }
      return foundRow;
    };

    Paragraph.prototype.findRowRangeBy = function(fromRow, fn) {
      var endRow, startRow;
      startRow = this.findRow(fromRow, 'previous', fn);
      endRow = this.findRow(fromRow, 'next', fn);
      return [startRow, endRow];
    };

    Paragraph.prototype.getPredictFunction = function(fromRow, selection) {
      var directionToExtend, flip, fromRowResult, predict;
      fromRowResult = this.editor.isBufferRowBlank(fromRow);
      if (this.isInner()) {
        predict = (function(_this) {
          return function(row, direction) {
            return _this.editor.isBufferRowBlank(row) === fromRowResult;
          };
        })(this);
      } else {
        if (selection.isReversed()) {
          directionToExtend = 'previous';
        } else {
          directionToExtend = 'next';
        }
        flip = false;
        predict = (function(_this) {
          return function(row, direction) {
            var result;
            result = _this.editor.isBufferRowBlank(row) === fromRowResult;
            if (flip) {
              return !result;
            } else {
              if ((!result) && (direction === directionToExtend)) {
                flip = true;
                return true;
              }
              return result;
            }
          };
        })(this);
        predict.reset = function() {
          return flip = false;
        };
      }
      return predict;
    };

    Paragraph.prototype.getRange = function(selection) {
      var fromRow, originalRange, rowRange;
      originalRange = selection.getBufferRange();
      fromRow = this.getCursorPositionForSelection(selection).row;
      if (this.isMode('visual', 'linewise')) {
        if (selection.isReversed()) {
          fromRow--;
        } else {
          fromRow++;
        }
        fromRow = getValidVimBufferRow(this.editor, fromRow);
      }
      rowRange = this.findRowRangeBy(fromRow, this.getPredictFunction(fromRow, selection));
      return selection.getBufferRange().union(this.getBufferRangeForRowRange(rowRange));
    };

    return Paragraph;

  })(TextObject);

  Indentation = (function(superClass) {
    extend(Indentation, superClass);

    function Indentation() {
      return Indentation.__super__.constructor.apply(this, arguments);
    }

    Indentation.extend(false);

    Indentation.deriveInnerAndA();

    Indentation.prototype.getRange = function(selection) {
      var baseIndentLevel, fromRow, predict, rowRange;
      fromRow = this.getCursorPositionForSelection(selection).row;
      baseIndentLevel = this.getIndentLevelForBufferRow(fromRow);
      predict = (function(_this) {
        return function(row) {
          if (_this.editor.isBufferRowBlank(row)) {
            return _this.isA();
          } else {
            return _this.getIndentLevelForBufferRow(row) >= baseIndentLevel;
          }
        };
      })(this);
      rowRange = this.findRowRangeBy(fromRow, predict);
      return this.getBufferRangeForRowRange(rowRange);
    };

    return Indentation;

  })(Paragraph);

  Comment = (function(superClass) {
    extend(Comment, superClass);

    function Comment() {
      return Comment.__super__.constructor.apply(this, arguments);
    }

    Comment.extend(false);

    Comment.deriveInnerAndA();

    Comment.prototype.wise = 'linewise';

    Comment.prototype.getRange = function(selection) {
      var row, rowRange;
      row = this.getCursorPositionForSelection(selection).row;
      rowRange = this.editor.languageMode.rowRangeForCommentAtBufferRow(row);
      if (this.editor.isBufferRowCommented(row)) {
        if (rowRange == null) {
          rowRange = [row, row];
        }
      }
      if (rowRange != null) {
        return this.getBufferRangeForRowRange(rowRange);
      }
    };

    return Comment;

  })(TextObject);

  CommentOrParagraph = (function(superClass) {
    extend(CommentOrParagraph, superClass);

    function CommentOrParagraph() {
      return CommentOrParagraph.__super__.constructor.apply(this, arguments);
    }

    CommentOrParagraph.extend(false);

    CommentOrParagraph.deriveInnerAndA();

    CommentOrParagraph.prototype.wise = 'linewise';

    CommentOrParagraph.prototype.getRange = function(selection) {
      var i, klass, len, range, ref2;
      ref2 = ['Comment', 'Paragraph'];
      for (i = 0, len = ref2.length; i < len; i++) {
        klass = ref2[i];
        if (range = this["new"](klass, {
          inner: this.inner
        }).getRange(selection)) {
          return range;
        }
      }
    };

    return CommentOrParagraph;

  })(TextObject);

  Fold = (function(superClass) {
    extend(Fold, superClass);

    function Fold() {
      return Fold.__super__.constructor.apply(this, arguments);
    }

    Fold.extend(false);

    Fold.deriveInnerAndA();

    Fold.prototype.wise = 'linewise';

    Fold.prototype.adjustRowRange = function(rowRange) {
      var endRow, startRow;
      if (this.isA()) {
        return rowRange;
      }
      startRow = rowRange[0], endRow = rowRange[1];
      if (this.getIndentLevelForBufferRow(startRow) === this.getIndentLevelForBufferRow(endRow)) {
        endRow -= 1;
      }
      startRow += 1;
      return [startRow, endRow];
    };

    Fold.prototype.getFoldRowRangesContainsForRow = function(row) {
      return getCodeFoldRowRangesContainesForRow(this.editor, row).reverse();
    };

    Fold.prototype.getRange = function(selection) {
      var i, len, range, ref2, row, rowRange, selectedRange;
      row = this.getCursorPositionForSelection(selection).row;
      selectedRange = selection.getBufferRange();
      ref2 = this.getFoldRowRangesContainsForRow(row);
      for (i = 0, len = ref2.length; i < len; i++) {
        rowRange = ref2[i];
        range = this.getBufferRangeForRowRange(this.adjustRowRange(rowRange));
        if (!selectedRange.containsRange(range)) {
          return range;
        }
      }
    };

    return Fold;

  })(TextObject);

  Function = (function(superClass) {
    extend(Function, superClass);

    function Function() {
      return Function.__super__.constructor.apply(this, arguments);
    }

    Function.extend(false);

    Function.deriveInnerAndA();

    Function.prototype.scopeNamesOmittingEndRow = ['source.go', 'source.elixir'];

    Function.prototype.isGrammarNotFoldEndRow = function() {
      var packageName, ref2, scopeName;
      ref2 = this.editor.getGrammar(), scopeName = ref2.scopeName, packageName = ref2.packageName;
      if (indexOf.call(this.scopeNamesOmittingEndRow, scopeName) >= 0) {
        return true;
      } else {
        return scopeName === 'source.rust' && packageName === "language-rust";
      }
    };

    Function.prototype.getFoldRowRangesContainsForRow = function(row) {
      return (Function.__super__.getFoldRowRangesContainsForRow.apply(this, arguments)).filter((function(_this) {
        return function(rowRange) {
          return isIncludeFunctionScopeForRow(_this.editor, rowRange[0]);
        };
      })(this));
    };

    Function.prototype.adjustRowRange = function(rowRange) {
      var endRow, ref2, startRow;
      ref2 = Function.__super__.adjustRowRange.apply(this, arguments), startRow = ref2[0], endRow = ref2[1];
      if (this.isA() && this.isGrammarNotFoldEndRow()) {
        endRow += 1;
      }
      return [startRow, endRow];
    };

    return Function;

  })(Fold);

  Arguments = (function(superClass) {
    extend(Arguments, superClass);

    function Arguments() {
      return Arguments.__super__.constructor.apply(this, arguments);
    }

    Arguments.extend(false);

    Arguments.deriveInnerAndA();

    Arguments.prototype.newArgInfo = function(argStart, arg, separator) {
      var aRange, argEnd, argRange, innerRange, separatorEnd, separatorRange;
      argEnd = traverseTextFromPoint(argStart, arg);
      argRange = new Range(argStart, argEnd);
      separatorEnd = traverseTextFromPoint(argEnd, separator != null ? separator : '');
      separatorRange = new Range(argEnd, separatorEnd);
      innerRange = argRange;
      aRange = argRange.union(separatorRange);
      return {
        argRange: argRange,
        separatorRange: separatorRange,
        innerRange: innerRange,
        aRange: aRange
      };
    };

    Arguments.prototype.getArgumentsRangeForSelection = function(selection) {
      var member;
      member = ['CurlyBracket', 'SquareBracket', 'Parenthesis'];
      return this["new"]("InnerAnyPair", {
        inclusive: false,
        member: member
      }).getRange(selection);
    };

    Arguments.prototype.getRange = function(selection) {
      var aRange, allTokens, argInfo, argInfos, argStart, i, innerRange, lastArgInfo, len, pairRangeFound, point, range, ref2, ref3, separator, text, token;
      range = this.getArgumentsRangeForSelection(selection);
      pairRangeFound = range != null;
      if (range == null) {
        range = this["new"]("InnerCurrentLine").getRange(selection);
      }
      if (!range) {
        return;
      }
      range = trimRange(this.editor, range);
      text = this.editor.getTextInBufferRange(range);
      allTokens = splitArguments(text, pairRangeFound);
      argInfos = [];
      argStart = range.start;
      if (allTokens.length && allTokens[0].type === 'separator') {
        token = allTokens.shift();
        argStart = traverseTextFromPoint(argStart, token.text);
      }
      while (allTokens.length) {
        token = allTokens.shift();
        if (token.type === 'argument') {
          separator = (ref2 = allTokens.shift()) != null ? ref2.text : void 0;
          argInfo = this.newArgInfo(argStart, token.text, separator);
          if ((allTokens.length === 0) && (lastArgInfo = _.last(argInfos))) {
            argInfo.aRange = argInfo.argRange.union(lastArgInfo.separatorRange);
          }
          argStart = argInfo.aRange.end;
          argInfos.push(argInfo);
        } else {
          throw new Error('must not happen');
        }
      }
      point = this.getCursorPositionForSelection(selection);
      for (i = 0, len = argInfos.length; i < len; i++) {
        ref3 = argInfos[i], innerRange = ref3.innerRange, aRange = ref3.aRange;
        if (innerRange.end.isGreaterThanOrEqual(point)) {
          if (this.isInner()) {
            return innerRange;
          } else {
            return aRange;
          }
        }
      }
      return null;
    };

    return Arguments;

  })(TextObject);

  CurrentLine = (function(superClass) {
    extend(CurrentLine, superClass);

    function CurrentLine() {
      return CurrentLine.__super__.constructor.apply(this, arguments);
    }

    CurrentLine.extend(false);

    CurrentLine.deriveInnerAndA();

    CurrentLine.prototype.getRange = function(selection) {
      var range, row;
      row = this.getCursorPositionForSelection(selection).row;
      range = this.editor.bufferRangeForBufferRow(row);
      if (this.isA()) {
        return range;
      } else {
        return trimRange(this.editor, range);
      }
    };

    return CurrentLine;

  })(TextObject);

  Entire = (function(superClass) {
    extend(Entire, superClass);

    function Entire() {
      return Entire.__super__.constructor.apply(this, arguments);
    }

    Entire.extend(false);

    Entire.deriveInnerAndA();

    Entire.prototype.wise = 'linewise';

    Entire.prototype.selectOnce = true;

    Entire.prototype.getRange = function(selection) {
      return this.editor.buffer.getRange();
    };

    return Entire;

  })(TextObject);

  Empty = (function(superClass) {
    extend(Empty, superClass);

    function Empty() {
      return Empty.__super__.constructor.apply(this, arguments);
    }

    Empty.extend(false);

    Empty.prototype.selectOnce = true;

    return Empty;

  })(TextObject);

  LatestChange = (function(superClass) {
    extend(LatestChange, superClass);

    function LatestChange() {
      return LatestChange.__super__.constructor.apply(this, arguments);
    }

    LatestChange.extend(false);

    LatestChange.deriveInnerAndA();

    LatestChange.prototype.wise = null;

    LatestChange.prototype.selectOnce = true;

    LatestChange.prototype.getRange = function(selection) {
      var end, start;
      start = this.vimState.mark.get('[');
      end = this.vimState.mark.get(']');
      if ((start != null) && (end != null)) {
        return new Range(start, end);
      }
    };

    return LatestChange;

  })(TextObject);

  SearchMatchForward = (function(superClass) {
    extend(SearchMatchForward, superClass);

    function SearchMatchForward() {
      return SearchMatchForward.__super__.constructor.apply(this, arguments);
    }

    SearchMatchForward.extend();

    SearchMatchForward.prototype.backward = false;

    SearchMatchForward.prototype.findMatch = function(fromPoint, pattern) {
      var found;
      if (this.mode === 'visual') {
        fromPoint = translatePointAndClip(this.editor, fromPoint, "forward");
      }
      found = null;
      this.scanForward(pattern, {
        from: [fromPoint.row, 0]
      }, function(arg1) {
        var range, stop;
        range = arg1.range, stop = arg1.stop;
        if (range.end.isGreaterThan(fromPoint)) {
          found = range;
          return stop();
        }
      });
      return {
        range: found,
        whichIsHead: 'end'
      };
    };

    SearchMatchForward.prototype.getRange = function(selection) {
      var fromPoint, pattern, range, ref2, whichIsHead;
      pattern = this.globalState.get('lastSearchPattern');
      if (pattern == null) {
        return;
      }
      fromPoint = selection.getHeadBufferPosition();
      ref2 = this.findMatch(fromPoint, pattern), range = ref2.range, whichIsHead = ref2.whichIsHead;
      if (range != null) {
        return this.unionRangeAndDetermineReversedState(selection, range, whichIsHead);
      }
    };

    SearchMatchForward.prototype.unionRangeAndDetermineReversedState = function(selection, found, whichIsHead) {
      var head, tail;
      if (selection.isEmpty()) {
        return found;
      } else {
        head = found[whichIsHead];
        tail = selection.getTailBufferPosition();
        if (this.backward) {
          if (tail.isLessThan(head)) {
            head = translatePointAndClip(this.editor, head, 'forward');
          }
        } else {
          if (head.isLessThan(tail)) {
            head = translatePointAndClip(this.editor, head, 'backward');
          }
        }
        this.reversed = head.isLessThan(tail);
        return new Range(tail, head).union(this.swrap(selection).getTailBufferRange());
      }
    };

    SearchMatchForward.prototype.selectTextObject = function(selection) {
      var range, ref2;
      if (range = this.getRange(selection)) {
        this.swrap(selection).setBufferRange(range, {
          reversed: (ref2 = this.reversed) != null ? ref2 : this.backward
        });
        return true;
      }
    };

    return SearchMatchForward;

  })(TextObject);

  SearchMatchBackward = (function(superClass) {
    extend(SearchMatchBackward, superClass);

    function SearchMatchBackward() {
      return SearchMatchBackward.__super__.constructor.apply(this, arguments);
    }

    SearchMatchBackward.extend();

    SearchMatchBackward.prototype.backward = true;

    SearchMatchBackward.prototype.findMatch = function(fromPoint, pattern) {
      var found;
      if (this.mode === 'visual') {
        fromPoint = translatePointAndClip(this.editor, fromPoint, "backward");
      }
      found = null;
      this.scanBackward(pattern, {
        from: [fromPoint.row, 2e308]
      }, function(arg1) {
        var range, stop;
        range = arg1.range, stop = arg1.stop;
        if (range.start.isLessThan(fromPoint)) {
          found = range;
          return stop();
        }
      });
      return {
        range: found,
        whichIsHead: 'start'
      };
    };

    return SearchMatchBackward;

  })(SearchMatchForward);

  PreviousSelection = (function(superClass) {
    extend(PreviousSelection, superClass);

    function PreviousSelection() {
      return PreviousSelection.__super__.constructor.apply(this, arguments);
    }

    PreviousSelection.extend();

    PreviousSelection.prototype.wise = null;

    PreviousSelection.prototype.selectOnce = true;

    PreviousSelection.prototype.selectTextObject = function(selection) {
      var properties, ref2, submode;
      ref2 = this.vimState.previousSelection, properties = ref2.properties, submode = ref2.submode;
      if ((properties != null) && (submode != null)) {
        this.wise = submode;
        this.swrap(this.editor.getLastSelection()).selectByProperties(properties);
        return true;
      }
    };

    return PreviousSelection;

  })(TextObject);

  PersistentSelection = (function(superClass) {
    extend(PersistentSelection, superClass);

    function PersistentSelection() {
      return PersistentSelection.__super__.constructor.apply(this, arguments);
    }

    PersistentSelection.extend(false);

    PersistentSelection.deriveInnerAndA();

    PersistentSelection.prototype.wise = null;

    PersistentSelection.prototype.selectOnce = true;

    PersistentSelection.prototype.selectTextObject = function(selection) {
      if (this.vimState.hasPersistentSelections()) {
        this.vimState.persistentSelection.setSelectedBufferRanges();
        return true;
      }
    };

    return PersistentSelection;

  })(TextObject);

  VisibleArea = (function(superClass) {
    extend(VisibleArea, superClass);

    function VisibleArea() {
      return VisibleArea.__super__.constructor.apply(this, arguments);
    }

    VisibleArea.extend(false);

    VisibleArea.deriveInnerAndA();

    VisibleArea.prototype.selectOnce = true;

    VisibleArea.prototype.getRange = function(selection) {
      var bufferRange;
      bufferRange = getVisibleBufferRange(this.editor);
      if (bufferRange.getRows() > this.editor.getRowsPerPage()) {
        return bufferRange.translate([+1, 0], [-3, 0]);
      } else {
        return bufferRange;
      }
    };

    return VisibleArea;

  })(TextObject);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3RleHQtb2JqZWN0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb3ZCQUFBO0lBQUE7Ozs7RUFBQSxNQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGlCQUFELEVBQVE7O0VBQ1IsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFLSixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsT0FjSSxPQUFBLENBQVEsU0FBUixDQWRKLEVBQ0UsOERBREYsRUFFRSw4RUFGRixFQUdFLGdFQUhGLEVBSUUsd0RBSkYsRUFLRSxrREFMRixFQU1FLGtEQU5GLEVBT0Usa0NBUEYsRUFRRSxnREFSRixFQVNFLDBCQVRGLEVBVUUsNEJBVkYsRUFXRSw0Q0FYRixFQVlFLG9DQVpGLEVBYUU7O0VBRUYsVUFBQSxHQUFhOztFQUVQOzs7SUFDSixVQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O0lBQ0EsVUFBQyxDQUFBLGFBQUQsR0FBZ0I7O3lCQUNoQixJQUFBLEdBQU07O3lCQUNOLFlBQUEsR0FBYzs7eUJBQ2QsVUFBQSxHQUFZOztJQUVaLFVBQUMsQ0FBQSxlQUFELEdBQWtCLFNBQUE7TUFDaEIsSUFBQyxDQUFBLGFBQUQsQ0FBZSxHQUFBLEdBQU0sSUFBQyxDQUFBLElBQXRCLEVBQTRCLEtBQTVCO2FBQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBZSxPQUFBLEdBQVUsSUFBQyxDQUFBLElBQTFCLEVBQWdDLElBQWhDO0lBRmdCOztJQUlsQixVQUFDLENBQUEsaUNBQUQsR0FBb0MsU0FBQTtNQUNsQyxJQUFDLENBQUEsYUFBRCxDQUFlLEdBQUEsR0FBTSxJQUFDLENBQUEsSUFBUCxHQUFjLGlCQUE3QixFQUFnRCxLQUFoRCxFQUF1RCxJQUF2RDthQUNBLElBQUMsQ0FBQSxhQUFELENBQWUsT0FBQSxH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QUxjO0FBN3FCMUIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2UsIFBvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG4jIFtUT0RPXSBOZWVkIG92ZXJoYXVsXG4jICAtIFsgXSBNYWtlIGV4cGFuZGFibGUgYnkgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkudW5pb24oQGdldFJhbmdlKHNlbGVjdGlvbikpXG4jICAtIFsgXSBDb3VudCBzdXBwb3J0KHByaW9yaXR5IGxvdyk/XG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xue1xuICBnZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb25cbiAgZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3dcbiAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvd1xuICBleHBhbmRSYW5nZVRvV2hpdGVTcGFjZXNcbiAgZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlXG4gIHRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxuICBnZXRCdWZmZXJSb3dzXG4gIGdldFZhbGlkVmltQnVmZmVyUm93XG4gIHRyaW1SYW5nZVxuICBzb3J0UmFuZ2VzXG4gIHBvaW50SXNBdEVuZE9mTGluZVxuICBzcGxpdEFyZ3VtZW50c1xuICB0cmF2ZXJzZVRleHRGcm9tUG9pbnRcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuUGFpckZpbmRlciA9IG51bGxcblxuY2xhc3MgVGV4dE9iamVjdCBleHRlbmRzIEJhc2VcbiAgQGV4dGVuZChmYWxzZSlcbiAgQG9wZXJhdGlvbktpbmQ6ICd0ZXh0LW9iamVjdCdcbiAgd2lzZTogJ2NoYXJhY3Rlcndpc2UnXG4gIHN1cHBvcnRDb3VudDogZmFsc2UgIyBGSVhNRSAjNDcyLCAjNjZcbiAgc2VsZWN0T25jZTogZmFsc2VcblxuICBAZGVyaXZlSW5uZXJBbmRBOiAtPlxuICAgIEBnZW5lcmF0ZUNsYXNzKFwiQVwiICsgQG5hbWUsIGZhbHNlKVxuICAgIEBnZW5lcmF0ZUNsYXNzKFwiSW5uZXJcIiArIEBuYW1lLCB0cnVlKVxuXG4gIEBkZXJpdmVJbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmc6IC0+XG4gICAgQGdlbmVyYXRlQ2xhc3MoXCJBXCIgKyBAbmFtZSArIFwiQWxsb3dGb3J3YXJkaW5nXCIsIGZhbHNlLCB0cnVlKVxuICAgIEBnZW5lcmF0ZUNsYXNzKFwiSW5uZXJcIiArIEBuYW1lICsgXCJBbGxvd0ZvcndhcmRpbmdcIiwgdHJ1ZSwgdHJ1ZSlcblxuICBAZ2VuZXJhdGVDbGFzczogKGtsYXNzTmFtZSwgaW5uZXIsIGFsbG93Rm9yd2FyZGluZykgLT5cbiAgICBrbGFzcyA9IGNsYXNzIGV4dGVuZHMgdGhpc1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBrbGFzcywgJ25hbWUnLCBnZXQ6IC0+IGtsYXNzTmFtZVxuICAgIGtsYXNzOjppbm5lciA9IGlubmVyXG4gICAga2xhc3M6OmFsbG93Rm9yd2FyZGluZyA9IHRydWUgaWYgYWxsb3dGb3J3YXJkaW5nXG4gICAga2xhc3MuZXh0ZW5kKClcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIEBpbml0aWFsaXplKClcblxuICBpc0lubmVyOiAtPlxuICAgIEBpbm5lclxuXG4gIGlzQTogLT5cbiAgICBub3QgQGlubmVyXG5cbiAgaXNMaW5ld2lzZTogLT4gQHdpc2UgaXMgJ2xpbmV3aXNlJ1xuICBpc0Jsb2Nrd2lzZTogLT4gQHdpc2UgaXMgJ2Jsb2Nrd2lzZSdcblxuICBmb3JjZVdpc2U6ICh3aXNlKSAtPlxuICAgIEB3aXNlID0gd2lzZSAjIEZJWE1FIGN1cnJlbnRseSBub3Qgd2VsbCBzdXBwb3J0ZWRcblxuICByZXNldFN0YXRlOiAtPlxuICAgIEBzZWxlY3RTdWNjZWVkZWQgPSBudWxsXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAcmVzZXRTdGF0ZSgpXG5cbiAgICAjIFdoZW5uZXZlciBUZXh0T2JqZWN0IGlzIGV4ZWN1dGVkLCBpdCBoYXMgQG9wZXJhdG9yXG4gICAgIyBDYWxsZWQgZnJvbSBPcGVyYXRvcjo6c2VsZWN0VGFyZ2V0KClcbiAgICAjICAtIGB2IGkgcGAsIGlzIGBTZWxlY3RgIG9wZXJhdG9yIHdpdGggQHRhcmdldCA9IGBJbm5lclBhcmFncmFwaGAuXG4gICAgIyAgLSBgZCBpIHBgLCBpcyBgRGVsZXRlYCBvcGVyYXRvciB3aXRoIEB0YXJnZXQgPSBgSW5uZXJQYXJhZ3JhcGhgLlxuICAgIGlmIEBvcGVyYXRvcj9cbiAgICAgIEBzZWxlY3QoKVxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW4gVGV4dE9iamVjdDogTXVzdCBub3QgaGFwcGVuJylcblxuICBzZWxlY3Q6IC0+XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICBAc3dyYXAubm9ybWFsaXplKEBlZGl0b3IpXG5cbiAgICBAY291bnRUaW1lcyBAZ2V0Q291bnQoKSwgKHtzdG9wfSkgPT5cbiAgICAgIHN0b3AoKSB1bmxlc3MgQHN1cHBvcnRDb3VudCAjIHF1aWNrLWZpeCBmb3IgIzU2MFxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICBvbGRSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgIGlmIEBzZWxlY3RUZXh0T2JqZWN0KHNlbGVjdGlvbilcbiAgICAgICAgICBAc2VsZWN0U3VjY2VlZGVkID0gdHJ1ZVxuICAgICAgICBzdG9wKCkgaWYgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuaXNFcXVhbChvbGRSYW5nZSlcbiAgICAgICAgYnJlYWsgaWYgQHNlbGVjdE9uY2VcblxuICAgIEBlZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAjIFNvbWUgVGV4dE9iamVjdCdzIHdpc2UgaXMgTk9UIGRldGVybWluaXN0aWMuIEl0IGhhcyB0byBiZSBkZXRlY3RlZCBmcm9tIHNlbGVjdGVkIHJhbmdlLlxuICAgIEB3aXNlID89IEBzd3JhcC5kZXRlY3RXaXNlKEBlZGl0b3IpXG5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgaWYgQHNlbGVjdFN1Y2NlZWRlZFxuICAgICAgICBzd2l0Y2ggQHdpc2VcbiAgICAgICAgICB3aGVuICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpIGZvciAkc2VsZWN0aW9uIGluIEBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpXG4gICAgICAgICAgd2hlbiAnbGluZXdpc2UnXG4gICAgICAgICAgICAjIFdoZW4gdGFyZ2V0IGlzIHBlcnNpc3RlbnQtc2VsZWN0aW9uLCBuZXcgc2VsZWN0aW9uIGlzIGFkZGVkIGFmdGVyIHNlbGVjdFRleHRPYmplY3QuXG4gICAgICAgICAgICAjIFNvIHdlIGhhdmUgdG8gYXNzdXJlIGFsbCBzZWxlY3Rpb24gaGF2ZSBzZWxjdGlvbiBwcm9wZXJ0eS5cbiAgICAgICAgICAgICMgTWF5YmUgdGhpcyBsb2dpYyBjYW4gYmUgbW92ZWQgdG8gb3BlcmF0aW9uIHN0YWNrLlxuICAgICAgICAgICAgZm9yICRzZWxlY3Rpb24gaW4gQHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcbiAgICAgICAgICAgICAgaWYgQGdldENvbmZpZygna2VlcENvbHVtbk9uU2VsZWN0VGV4dE9iamVjdCcpXG4gICAgICAgICAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpIHVubGVzcyAkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICAgICAgICAgICRzZWxlY3Rpb24uZml4UHJvcGVydHlSb3dUb1Jvd1JhbmdlKClcblxuICAgICAgaWYgQHN1Ym1vZGUgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgICAgZm9yICRzZWxlY3Rpb24gaW4gQHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcbiAgICAgICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoJ2Jsb2Nrd2lzZScpXG5cbiAgIyBSZXR1cm4gdHJ1ZSBvciBmYWxzZVxuICBzZWxlY3RUZXh0T2JqZWN0OiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIHJhbmdlID0gQGdldFJhbmdlKHNlbGVjdGlvbilcbiAgICAgIEBzd3JhcChzZWxlY3Rpb24pLnNldEJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgcmV0dXJuIHRydWVcblxuICAjIHRvIG92ZXJyaWRlXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIG51bGxcblxuIyBTZWN0aW9uOiBXb3JkXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFdvcmQgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHBvaW50ID0gQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICB7cmFuZ2V9ID0gQGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7QHdvcmRSZWdleH0pXG4gICAgaWYgQGlzQSgpXG4gICAgICBleHBhbmRSYW5nZVRvV2hpdGVTcGFjZXMoQGVkaXRvciwgcmFuZ2UpXG4gICAgZWxzZVxuICAgICAgcmFuZ2VcblxuY2xhc3MgV2hvbGVXb3JkIGV4dGVuZHMgV29yZFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgd29yZFJlZ2V4OiAvXFxTKy9cblxuIyBKdXN0IGluY2x1ZGUgXywgLVxuY2xhc3MgU21hcnRXb3JkIGV4dGVuZHMgV29yZFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgQGRlc2NyaXB0aW9uOiBcIkEgd29yZCB0aGF0IGNvbnNpc3RzIG9mIGFscGhhbnVtZXJpYyBjaGFycyhgL1tBLVphLXowLTlfXS9gKSBhbmQgaHlwaGVuIGAtYFwiXG4gIHdvcmRSZWdleDogL1tcXHctXSsvXG5cbiMgSnVzdCBpbmNsdWRlIF8sIC1cbmNsYXNzIFN1YndvcmQgZXh0ZW5kcyBXb3JkXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBAd29yZFJlZ2V4ID0gc2VsZWN0aW9uLmN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlclxuXG4jIFNlY3Rpb246IFBhaXJcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgUGFpciBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgc3VwcG9ydENvdW50OiB0cnVlXG4gIGFsbG93TmV4dExpbmU6IG51bGxcbiAgYWRqdXN0SW5uZXJSYW5nZTogdHJ1ZVxuICBwYWlyOiBudWxsXG4gIGluY2x1c2l2ZTogdHJ1ZVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgUGFpckZpbmRlciA/PSByZXF1aXJlICcuL3BhaXItZmluZGVyLmNvZmZlZSdcbiAgICBzdXBlclxuXG5cbiAgaXNBbGxvd05leHRMaW5lOiAtPlxuICAgIEBhbGxvd05leHRMaW5lID8gKEBwYWlyPyBhbmQgQHBhaXJbMF0gaXNudCBAcGFpclsxXSlcblxuICBhZGp1c3RSYW5nZTogKHtzdGFydCwgZW5kfSkgLT5cbiAgICAjIERpcnR5IHdvcmsgdG8gZmVlbCBuYXR1cmFsIGZvciBodW1hbiwgdG8gYmVoYXZlIGNvbXBhdGlibGUgd2l0aCBwdXJlIFZpbS5cbiAgICAjIFdoZXJlIHRoaXMgYWRqdXN0bWVudCBhcHBlYXIgaXMgaW4gZm9sbG93aW5nIHNpdHVhdGlvbi5cbiAgICAjIG9wLTE6IGBjaXtgIHJlcGxhY2Ugb25seSAybmQgbGluZVxuICAgICMgb3AtMjogYGRpe2AgZGVsZXRlIG9ubHkgMm5kIGxpbmUuXG4gICAgIyB0ZXh0OlxuICAgICMgIHtcbiAgICAjICAgIGFhYVxuICAgICMgIH1cbiAgICBpZiBwb2ludElzQXRFbmRPZkxpbmUoQGVkaXRvciwgc3RhcnQpXG4gICAgICBzdGFydCA9IHN0YXJ0LnRyYXZlcnNlKFsxLCAwXSlcblxuICAgIGlmIGdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBlbmQpLm1hdGNoKC9eXFxzKiQvKVxuICAgICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgICAgIyBUaGlzIGlzIHNsaWdodGx5IGlubmNvbnNpc3RlbnQgd2l0aCByZWd1bGFyIFZpbVxuICAgICAgICAjIC0gcmVndWxhciBWaW06IHNlbGVjdCBuZXcgbGluZSBhZnRlciBFT0xcbiAgICAgICAgIyAtIHZpbS1tb2RlLXBsdXM6IHNlbGVjdCB0byBFT0woYmVmb3JlIG5ldyBsaW5lKVxuICAgICAgICAjIFRoaXMgaXMgaW50ZW50aW9uYWwgc2luY2UgdG8gbWFrZSBzdWJtb2RlIGBjaGFyYWN0ZXJ3aXNlYCB3aGVuIGF1dG8tZGV0ZWN0IHN1Ym1vZGVcbiAgICAgICAgIyBpbm5lckVuZCA9IG5ldyBQb2ludChpbm5lckVuZC5yb3cgLSAxLCBJbmZpbml0eSlcbiAgICAgICAgZW5kID0gbmV3IFBvaW50KGVuZC5yb3cgLSAxLCBJbmZpbml0eSlcbiAgICAgIGVsc2VcbiAgICAgICAgZW5kID0gbmV3IFBvaW50KGVuZC5yb3csIDApXG5cbiAgICBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcblxuICBnZXRGaW5kZXI6IC0+XG4gICAgb3B0aW9ucyA9IHthbGxvd05leHRMaW5lOiBAaXNBbGxvd05leHRMaW5lKCksIEBhbGxvd0ZvcndhcmRpbmcsIEBwYWlyLCBAaW5jbHVzaXZlfVxuICAgIGlmIEBwYWlyWzBdIGlzIEBwYWlyWzFdXG4gICAgICBuZXcgUGFpckZpbmRlci5RdW90ZUZpbmRlcihAZWRpdG9yLCBvcHRpb25zKVxuICAgIGVsc2VcbiAgICAgIG5ldyBQYWlyRmluZGVyLkJyYWNrZXRGaW5kZXIoQGVkaXRvciwgb3B0aW9ucylcblxuICBnZXRQYWlySW5mbzogKGZyb20pIC0+XG4gICAgcGFpckluZm8gPSBAZ2V0RmluZGVyKCkuZmluZChmcm9tKVxuICAgIHVubGVzcyBwYWlySW5mbz9cbiAgICAgIHJldHVybiBudWxsXG4gICAgcGFpckluZm8uaW5uZXJSYW5nZSA9IEBhZGp1c3RSYW5nZShwYWlySW5mby5pbm5lclJhbmdlKSBpZiBAYWRqdXN0SW5uZXJSYW5nZVxuICAgIHBhaXJJbmZvLnRhcmdldFJhbmdlID0gaWYgQGlzSW5uZXIoKSB0aGVuIHBhaXJJbmZvLmlubmVyUmFuZ2UgZWxzZSBwYWlySW5mby5hUmFuZ2VcbiAgICBwYWlySW5mb1xuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIG9yaWdpbmFsUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIHBhaXJJbmZvID0gQGdldFBhaXJJbmZvKEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pKVxuICAgICMgV2hlbiByYW5nZSB3YXMgc2FtZSwgdHJ5IHRvIGV4cGFuZCByYW5nZVxuICAgIGlmIHBhaXJJbmZvPy50YXJnZXRSYW5nZS5pc0VxdWFsKG9yaWdpbmFsUmFuZ2UpXG4gICAgICBwYWlySW5mbyA9IEBnZXRQYWlySW5mbyhwYWlySW5mby5hUmFuZ2UuZW5kKVxuICAgIHBhaXJJbmZvPy50YXJnZXRSYW5nZVxuXG4jIFVzZWQgYnkgRGVsZXRlU3Vycm91bmRcbmNsYXNzIEFQYWlyIGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuXG5jbGFzcyBBbnlQYWlyIGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgYWxsb3dGb3J3YXJkaW5nOiBmYWxzZVxuICBtZW1iZXI6IFtcbiAgICAnRG91YmxlUXVvdGUnLCAnU2luZ2xlUXVvdGUnLCAnQmFja1RpY2snLFxuICAgICdDdXJseUJyYWNrZXQnLCAnQW5nbGVCcmFja2V0JywgJ1NxdWFyZUJyYWNrZXQnLCAnUGFyZW50aGVzaXMnXG4gIF1cblxuICBnZXRSYW5nZXM6IChzZWxlY3Rpb24pIC0+XG4gICAgQG1lbWJlclxuICAgICAgLm1hcCAoa2xhc3MpID0+IEBuZXcoa2xhc3MsIHtAaW5uZXIsIEBhbGxvd0ZvcndhcmRpbmcsIEBpbmNsdXNpdmV9KS5nZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgICAuZmlsdGVyIChyYW5nZSkgLT4gcmFuZ2U/XG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgXy5sYXN0KHNvcnRSYW5nZXMoQGdldFJhbmdlcyhzZWxlY3Rpb24pKSlcblxuY2xhc3MgQW55UGFpckFsbG93Rm9yd2FyZGluZyBleHRlbmRzIEFueVBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIEBkZXNjcmlwdGlvbjogXCJSYW5nZSBzdXJyb3VuZGVkIGJ5IGF1dG8tZGV0ZWN0ZWQgcGFpcmVkIGNoYXJzIGZyb20gZW5jbG9zZWQgYW5kIGZvcndhcmRpbmcgYXJlYVwiXG4gIGFsbG93Rm9yd2FyZGluZzogdHJ1ZVxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICByYW5nZXMgPSBAZ2V0UmFuZ2VzKHNlbGVjdGlvbilcbiAgICBmcm9tID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgW2ZvcndhcmRpbmdSYW5nZXMsIGVuY2xvc2luZ1Jhbmdlc10gPSBfLnBhcnRpdGlvbiByYW5nZXMsIChyYW5nZSkgLT5cbiAgICAgIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW5PckVxdWFsKGZyb20pXG4gICAgZW5jbG9zaW5nUmFuZ2UgPSBfLmxhc3Qoc29ydFJhbmdlcyhlbmNsb3NpbmdSYW5nZXMpKVxuICAgIGZvcndhcmRpbmdSYW5nZXMgPSBzb3J0UmFuZ2VzKGZvcndhcmRpbmdSYW5nZXMpXG5cbiAgICAjIFdoZW4gZW5jbG9zaW5nUmFuZ2UgaXMgZXhpc3RzLFxuICAgICMgV2UgZG9uJ3QgZ28gYWNyb3NzIGVuY2xvc2luZ1JhbmdlLmVuZC5cbiAgICAjIFNvIGNob29zZSBmcm9tIHJhbmdlcyBjb250YWluZWQgaW4gZW5jbG9zaW5nUmFuZ2UuXG4gICAgaWYgZW5jbG9zaW5nUmFuZ2VcbiAgICAgIGZvcndhcmRpbmdSYW5nZXMgPSBmb3J3YXJkaW5nUmFuZ2VzLmZpbHRlciAocmFuZ2UpIC0+XG4gICAgICAgIGVuY2xvc2luZ1JhbmdlLmNvbnRhaW5zUmFuZ2UocmFuZ2UpXG5cbiAgICBmb3J3YXJkaW5nUmFuZ2VzWzBdIG9yIGVuY2xvc2luZ1JhbmdlXG5cbmNsYXNzIEFueVF1b3RlIGV4dGVuZHMgQW55UGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgYWxsb3dGb3J3YXJkaW5nOiB0cnVlXG4gIG1lbWJlcjogWydEb3VibGVRdW90ZScsICdTaW5nbGVRdW90ZScsICdCYWNrVGljayddXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJhbmdlcyA9IEBnZXRSYW5nZXMoc2VsZWN0aW9uKVxuICAgICMgUGljayByYW5nZSB3aGljaCBlbmQuY29sdW0gaXMgbGVmdG1vc3QobWVhbiwgY2xvc2VkIGZpcnN0KVxuICAgIF8uZmlyc3QoXy5zb3J0QnkocmFuZ2VzLCAocikgLT4gci5lbmQuY29sdW1uKSkgaWYgcmFuZ2VzLmxlbmd0aFxuXG5jbGFzcyBRdW90ZSBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgYWxsb3dGb3J3YXJkaW5nOiB0cnVlXG5cbmNsYXNzIERvdWJsZVF1b3RlIGV4dGVuZHMgUXVvdGVcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHBhaXI6IFsnXCInLCAnXCInXVxuXG5jbGFzcyBTaW5nbGVRdW90ZSBleHRlbmRzIFF1b3RlXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBwYWlyOiBbXCInXCIsIFwiJ1wiXVxuXG5jbGFzcyBCYWNrVGljayBleHRlbmRzIFF1b3RlXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBwYWlyOiBbJ2AnLCAnYCddXG5cbmNsYXNzIEN1cmx5QnJhY2tldCBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIEBkZXJpdmVJbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmcoKVxuICBwYWlyOiBbJ3snLCAnfSddXG5cbmNsYXNzIFNxdWFyZUJyYWNrZXQgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBAZGVyaXZlSW5uZXJBbmRBRm9yQWxsb3dGb3J3YXJkaW5nKClcbiAgcGFpcjogWydbJywgJ10nXVxuXG5jbGFzcyBQYXJlbnRoZXNpcyBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIEBkZXJpdmVJbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmcoKVxuICBwYWlyOiBbJygnLCAnKSddXG5cbmNsYXNzIEFuZ2xlQnJhY2tldCBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIEBkZXJpdmVJbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmcoKVxuICBwYWlyOiBbJzwnLCAnPiddXG5cbmNsYXNzIFRhZyBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIGFsbG93TmV4dExpbmU6IHRydWVcbiAgYWxsb3dGb3J3YXJkaW5nOiB0cnVlXG4gIGFkanVzdElubmVyUmFuZ2U6IGZhbHNlXG5cbiAgZ2V0VGFnU3RhcnRQb2ludDogKGZyb20pIC0+XG4gICAgdGFnUmFuZ2UgPSBudWxsXG4gICAgcGF0dGVybiA9IFBhaXJGaW5kZXIuVGFnRmluZGVyOjpwYXR0ZXJuXG4gICAgQHNjYW5Gb3J3YXJkIHBhdHRlcm4sIHtmcm9tOiBbZnJvbS5yb3csIDBdfSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICBpZiByYW5nZS5jb250YWluc1BvaW50KGZyb20sIHRydWUpXG4gICAgICAgIHRhZ1JhbmdlID0gcmFuZ2VcbiAgICAgICAgc3RvcCgpXG4gICAgdGFnUmFuZ2U/LnN0YXJ0XG5cbiAgZ2V0RmluZGVyOiAtPlxuICAgIG5ldyBQYWlyRmluZGVyLlRhZ0ZpbmRlcihAZWRpdG9yLCB7YWxsb3dOZXh0TGluZTogQGlzQWxsb3dOZXh0TGluZSgpLCBAYWxsb3dGb3J3YXJkaW5nLCBAaW5jbHVzaXZlfSlcblxuICBnZXRQYWlySW5mbzogKGZyb20pIC0+XG4gICAgc3VwZXIoQGdldFRhZ1N0YXJ0UG9pbnQoZnJvbSkgPyBmcm9tKVxuXG4jIFNlY3Rpb246IFBhcmFncmFwaFxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFBhcmFncmFwaCBpcyBkZWZpbmVkIGFzIGNvbnNlY3V0aXZlIChub24tKWJsYW5rLWxpbmUuXG5jbGFzcyBQYXJhZ3JhcGggZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHN1cHBvcnRDb3VudDogdHJ1ZVxuXG4gIGZpbmRSb3c6IChmcm9tUm93LCBkaXJlY3Rpb24sIGZuKSAtPlxuICAgIGZuLnJlc2V0PygpXG4gICAgZm91bmRSb3cgPSBmcm9tUm93XG4gICAgZm9yIHJvdyBpbiBnZXRCdWZmZXJSb3dzKEBlZGl0b3IsIHtzdGFydFJvdzogZnJvbVJvdywgZGlyZWN0aW9ufSlcbiAgICAgIGJyZWFrIHVubGVzcyBmbihyb3csIGRpcmVjdGlvbilcbiAgICAgIGZvdW5kUm93ID0gcm93XG5cbiAgICBmb3VuZFJvd1xuXG4gIGZpbmRSb3dSYW5nZUJ5OiAoZnJvbVJvdywgZm4pIC0+XG4gICAgc3RhcnRSb3cgPSBAZmluZFJvdyhmcm9tUm93LCAncHJldmlvdXMnLCBmbilcbiAgICBlbmRSb3cgPSBAZmluZFJvdyhmcm9tUm93LCAnbmV4dCcsIGZuKVxuICAgIFtzdGFydFJvdywgZW5kUm93XVxuXG4gIGdldFByZWRpY3RGdW5jdGlvbjogKGZyb21Sb3csIHNlbGVjdGlvbikgLT5cbiAgICBmcm9tUm93UmVzdWx0ID0gQGVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKGZyb21Sb3cpXG5cbiAgICBpZiBAaXNJbm5lcigpXG4gICAgICBwcmVkaWN0ID0gKHJvdywgZGlyZWN0aW9uKSA9PlxuICAgICAgICBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KSBpcyBmcm9tUm93UmVzdWx0XG4gICAgZWxzZVxuICAgICAgaWYgc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgICBkaXJlY3Rpb25Ub0V4dGVuZCA9ICdwcmV2aW91cydcbiAgICAgIGVsc2VcbiAgICAgICAgZGlyZWN0aW9uVG9FeHRlbmQgPSAnbmV4dCdcblxuICAgICAgZmxpcCA9IGZhbHNlXG4gICAgICBwcmVkaWN0ID0gKHJvdywgZGlyZWN0aW9uKSA9PlxuICAgICAgICByZXN1bHQgPSBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KSBpcyBmcm9tUm93UmVzdWx0XG4gICAgICAgIGlmIGZsaXBcbiAgICAgICAgICBub3QgcmVzdWx0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpZiAobm90IHJlc3VsdCkgYW5kIChkaXJlY3Rpb24gaXMgZGlyZWN0aW9uVG9FeHRlbmQpXG4gICAgICAgICAgICBmbGlwID0gdHJ1ZVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICByZXN1bHRcblxuICAgICAgcHJlZGljdC5yZXNldCA9IC0+XG4gICAgICAgIGZsaXAgPSBmYWxzZVxuICAgIHByZWRpY3RcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBvcmlnaW5hbFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBmcm9tUm93ID0gQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJylcbiAgICAgIGlmIHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgICAgZnJvbVJvdy0tXG4gICAgICBlbHNlXG4gICAgICAgIGZyb21Sb3crK1xuICAgICAgZnJvbVJvdyA9IGdldFZhbGlkVmltQnVmZmVyUm93KEBlZGl0b3IsIGZyb21Sb3cpXG5cbiAgICByb3dSYW5nZSA9IEBmaW5kUm93UmFuZ2VCeShmcm9tUm93LCBAZ2V0UHJlZGljdEZ1bmN0aW9uKGZyb21Sb3csIHNlbGVjdGlvbikpXG4gICAgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkudW5pb24oQGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpKVxuXG5jbGFzcyBJbmRlbnRhdGlvbiBleHRlbmRzIFBhcmFncmFwaFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBmcm9tUm93ID0gQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG5cbiAgICBiYXNlSW5kZW50TGV2ZWwgPSBAZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coZnJvbVJvdylcbiAgICBwcmVkaWN0ID0gKHJvdykgPT5cbiAgICAgIGlmIEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpXG4gICAgICAgIEBpc0EoKVxuICAgICAgZWxzZVxuICAgICAgICBAZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3cocm93KSA+PSBiYXNlSW5kZW50TGV2ZWxcblxuICAgIHJvd1JhbmdlID0gQGZpbmRSb3dSYW5nZUJ5KGZyb21Sb3csIHByZWRpY3QpXG4gICAgQGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpXG5cbiMgU2VjdGlvbjogQ29tbWVudFxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21tZW50IGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJvdyA9IEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIHJvd1JhbmdlID0gQGVkaXRvci5sYW5ndWFnZU1vZGUucm93UmFuZ2VGb3JDb21tZW50QXRCdWZmZXJSb3cocm93KVxuICAgIHJvd1JhbmdlID89IFtyb3csIHJvd10gaWYgQGVkaXRvci5pc0J1ZmZlclJvd0NvbW1lbnRlZChyb3cpXG4gICAgaWYgcm93UmFuZ2U/XG4gICAgICBAZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSlcblxuY2xhc3MgQ29tbWVudE9yUGFyYWdyYXBoIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIGZvciBrbGFzcyBpbiBbJ0NvbW1lbnQnLCAnUGFyYWdyYXBoJ11cbiAgICAgIGlmIHJhbmdlID0gQG5ldyhrbGFzcywge0Bpbm5lcn0pLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICAgICAgcmV0dXJuIHJhbmdlXG5cbiMgU2VjdGlvbjogRm9sZFxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBGb2xkIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIGFkanVzdFJvd1JhbmdlOiAocm93UmFuZ2UpIC0+XG4gICAgcmV0dXJuIHJvd1JhbmdlIGlmIEBpc0EoKVxuXG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gcm93UmFuZ2VcbiAgICBpZiBAZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coc3RhcnRSb3cpIGlzIEBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhlbmRSb3cpXG4gICAgICBlbmRSb3cgLT0gMVxuICAgIHN0YXJ0Um93ICs9IDFcbiAgICBbc3RhcnRSb3csIGVuZFJvd11cblxuICBnZXRGb2xkUm93UmFuZ2VzQ29udGFpbnNGb3JSb3c6IChyb3cpIC0+XG4gICAgZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3coQGVkaXRvciwgcm93KS5yZXZlcnNlKClcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICByb3cgPSBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3dcbiAgICBzZWxlY3RlZFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBmb3Igcm93UmFuZ2UgaW4gQGdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdyhyb3cpXG4gICAgICByYW5nZSA9IEBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKEBhZGp1c3RSb3dSYW5nZShyb3dSYW5nZSkpXG5cbiAgICAgICMgRG9uJ3QgY2hhbmdlIHRvIGBpZiByYW5nZS5jb250YWluc1JhbmdlKHNlbGVjdGVkUmFuZ2UsIHRydWUpYFxuICAgICAgIyBUaGVyZSBpcyBiZWhhdmlvciBkaWZmIHdoZW4gY3Vyc29yIGlzIGF0IGJlZ2lubmluZyBvZiBsaW5lKCBjb2x1bW4gMCApLlxuICAgICAgdW5sZXNzIHNlbGVjdGVkUmFuZ2UuY29udGFpbnNSYW5nZShyYW5nZSlcbiAgICAgICAgcmV0dXJuIHJhbmdlXG5cbiMgTk9URTogRnVuY3Rpb24gcmFuZ2UgZGV0ZXJtaW5hdGlvbiBpcyBkZXBlbmRpbmcgb24gZm9sZC5cbmNsYXNzIEZ1bmN0aW9uIGV4dGVuZHMgRm9sZFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgIyBTb21lIGxhbmd1YWdlIGRvbid0IGluY2x1ZGUgY2xvc2luZyBgfWAgaW50byBmb2xkLlxuICBzY29wZU5hbWVzT21pdHRpbmdFbmRSb3c6IFsnc291cmNlLmdvJywgJ3NvdXJjZS5lbGl4aXInXVxuXG4gIGlzR3JhbW1hck5vdEZvbGRFbmRSb3c6IC0+XG4gICAge3Njb3BlTmFtZSwgcGFja2FnZU5hbWV9ID0gQGVkaXRvci5nZXRHcmFtbWFyKClcbiAgICBpZiBzY29wZU5hbWUgaW4gQHNjb3BlTmFtZXNPbWl0dGluZ0VuZFJvd1xuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgICMgSEFDSzogUnVzdCBoYXZlIHR3byBwYWNrYWdlIGBsYW5ndWFnZS1ydXN0YCBhbmQgYGF0b20tbGFuZ3VhZ2UtcnVzdGBcbiAgICAgICMgbGFuZ3VhZ2UtcnVzdCBkb24ndCBmb2xkIGVuZGluZyBgfWAsIGJ1dCBhdG9tLWxhbmd1YWdlLXJ1c3QgZG9lcy5cbiAgICAgIHNjb3BlTmFtZSBpcyAnc291cmNlLnJ1c3QnIGFuZCBwYWNrYWdlTmFtZSBpcyBcImxhbmd1YWdlLXJ1c3RcIlxuXG4gIGdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdzogKHJvdykgLT5cbiAgICAoc3VwZXIpLmZpbHRlciAocm93UmFuZ2UpID0+XG4gICAgICBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KEBlZGl0b3IsIHJvd1JhbmdlWzBdKVxuXG4gIGFkanVzdFJvd1JhbmdlOiAocm93UmFuZ2UpIC0+XG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gc3VwZXJcbiAgICAjIE5PVEU6IFRoaXMgYWRqdXN0bWVudCBzaG91ZCBub3QgYmUgbmVjZXNzYXJ5IGlmIGxhbmd1YWdlLXN5bnRheCBpcyBwcm9wZXJseSBkZWZpbmVkLlxuICAgIGlmIEBpc0EoKSBhbmQgQGlzR3JhbW1hck5vdEZvbGRFbmRSb3coKVxuICAgICAgZW5kUm93ICs9IDFcbiAgICBbc3RhcnRSb3csIGVuZFJvd11cblxuIyBTZWN0aW9uOiBPdGhlclxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBBcmd1bWVudHMgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuXG4gIG5ld0FyZ0luZm86IChhcmdTdGFydCwgYXJnLCBzZXBhcmF0b3IpIC0+XG4gICAgYXJnRW5kID0gdHJhdmVyc2VUZXh0RnJvbVBvaW50KGFyZ1N0YXJ0LCBhcmcpXG4gICAgYXJnUmFuZ2UgPSBuZXcgUmFuZ2UoYXJnU3RhcnQsIGFyZ0VuZClcblxuICAgIHNlcGFyYXRvckVuZCA9IHRyYXZlcnNlVGV4dEZyb21Qb2ludChhcmdFbmQsIHNlcGFyYXRvciA/ICcnKVxuICAgIHNlcGFyYXRvclJhbmdlID0gbmV3IFJhbmdlKGFyZ0VuZCwgc2VwYXJhdG9yRW5kKVxuXG4gICAgaW5uZXJSYW5nZSA9IGFyZ1JhbmdlXG4gICAgYVJhbmdlID0gYXJnUmFuZ2UudW5pb24oc2VwYXJhdG9yUmFuZ2UpXG4gICAge2FyZ1JhbmdlLCBzZXBhcmF0b3JSYW5nZSwgaW5uZXJSYW5nZSwgYVJhbmdlfVxuXG4gIGdldEFyZ3VtZW50c1JhbmdlRm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIG1lbWJlciA9IFtcbiAgICAgICdDdXJseUJyYWNrZXQnXG4gICAgICAnU3F1YXJlQnJhY2tldCdcbiAgICAgICdQYXJlbnRoZXNpcydcbiAgICBdXG4gICAgQG5ldyhcIklubmVyQW55UGFpclwiLCB7aW5jbHVzaXZlOiBmYWxzZSwgbWVtYmVyOiBtZW1iZXJ9KS5nZXRSYW5nZShzZWxlY3Rpb24pXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcmFuZ2UgPSBAZ2V0QXJndW1lbnRzUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIHBhaXJSYW5nZUZvdW5kID0gcmFuZ2U/XG4gICAgcmFuZ2UgPz0gQG5ldyhcIklubmVyQ3VycmVudExpbmVcIikuZ2V0UmFuZ2Uoc2VsZWN0aW9uKSAjIGZhbGxiYWNrXG4gICAgcmV0dXJuIHVubGVzcyByYW5nZVxuXG4gICAgcmFuZ2UgPSB0cmltUmFuZ2UoQGVkaXRvciwgcmFuZ2UpXG5cbiAgICB0ZXh0ID0gQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICBhbGxUb2tlbnMgPSBzcGxpdEFyZ3VtZW50cyh0ZXh0LCBwYWlyUmFuZ2VGb3VuZClcblxuICAgIGFyZ0luZm9zID0gW11cbiAgICBhcmdTdGFydCA9IHJhbmdlLnN0YXJ0XG5cbiAgICAjIFNraXAgc3RhcnRpbmcgc2VwYXJhdG9yXG4gICAgaWYgYWxsVG9rZW5zLmxlbmd0aCBhbmQgYWxsVG9rZW5zWzBdLnR5cGUgaXMgJ3NlcGFyYXRvcidcbiAgICAgIHRva2VuID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIGFyZ1N0YXJ0ID0gdHJhdmVyc2VUZXh0RnJvbVBvaW50KGFyZ1N0YXJ0LCB0b2tlbi50ZXh0KVxuXG4gICAgd2hpbGUgYWxsVG9rZW5zLmxlbmd0aFxuICAgICAgdG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgaWYgdG9rZW4udHlwZSBpcyAnYXJndW1lbnQnXG4gICAgICAgIHNlcGFyYXRvciA9IGFsbFRva2Vucy5zaGlmdCgpPy50ZXh0XG4gICAgICAgIGFyZ0luZm8gPSBAbmV3QXJnSW5mbyhhcmdTdGFydCwgdG9rZW4udGV4dCwgc2VwYXJhdG9yKVxuXG4gICAgICAgIGlmIChhbGxUb2tlbnMubGVuZ3RoIGlzIDApIGFuZCAobGFzdEFyZ0luZm8gPSBfLmxhc3QoYXJnSW5mb3MpKVxuICAgICAgICAgIGFyZ0luZm8uYVJhbmdlID0gYXJnSW5mby5hcmdSYW5nZS51bmlvbihsYXN0QXJnSW5mby5zZXBhcmF0b3JSYW5nZSlcblxuICAgICAgICBhcmdTdGFydCA9IGFyZ0luZm8uYVJhbmdlLmVuZFxuICAgICAgICBhcmdJbmZvcy5wdXNoKGFyZ0luZm8pXG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbXVzdCBub3QgaGFwcGVuJylcblxuICAgIHBvaW50ID0gQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBmb3Ige2lubmVyUmFuZ2UsIGFSYW5nZX0gaW4gYXJnSW5mb3NcbiAgICAgIGlmIGlubmVyUmFuZ2UuZW5kLmlzR3JlYXRlclRoYW5PckVxdWFsKHBvaW50KVxuICAgICAgICByZXR1cm4gaWYgQGlzSW5uZXIoKSB0aGVuIGlubmVyUmFuZ2UgZWxzZSBhUmFuZ2VcbiAgICBudWxsXG5cbmNsYXNzIEN1cnJlbnRMaW5lIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICByb3cgPSBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3dcbiAgICByYW5nZSA9IEBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KVxuICAgIGlmIEBpc0EoKVxuICAgICAgcmFuZ2VcbiAgICBlbHNlXG4gICAgICB0cmltUmFuZ2UoQGVkaXRvciwgcmFuZ2UpXG5cbmNsYXNzIEVudGlyZSBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgc2VsZWN0T25jZTogdHJ1ZVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBlZGl0b3IuYnVmZmVyLmdldFJhbmdlKClcblxuY2xhc3MgRW1wdHkgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIHNlbGVjdE9uY2U6IHRydWVcblxuY2xhc3MgTGF0ZXN0Q2hhbmdlIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgd2lzZTogbnVsbFxuICBzZWxlY3RPbmNlOiB0cnVlXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHN0YXJ0ID0gQHZpbVN0YXRlLm1hcmsuZ2V0KCdbJylcbiAgICBlbmQgPSBAdmltU3RhdGUubWFyay5nZXQoJ10nKVxuICAgIGlmIHN0YXJ0PyBhbmQgZW5kP1xuICAgICAgbmV3IFJhbmdlKHN0YXJ0LCBlbmQpXG5cbmNsYXNzIFNlYXJjaE1hdGNoRm9yd2FyZCBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZCgpXG4gIGJhY2t3YXJkOiBmYWxzZVxuXG4gIGZpbmRNYXRjaDogKGZyb21Qb2ludCwgcGF0dGVybikgLT5cbiAgICBmcm9tUG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgZnJvbVBvaW50LCBcImZvcndhcmRcIikgaWYgKEBtb2RlIGlzICd2aXN1YWwnKVxuICAgIGZvdW5kID0gbnVsbFxuICAgIEBzY2FuRm9yd2FyZCBwYXR0ZXJuLCB7ZnJvbTogW2Zyb21Qb2ludC5yb3csIDBdfSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihmcm9tUG9pbnQpXG4gICAgICAgIGZvdW5kID0gcmFuZ2VcbiAgICAgICAgc3RvcCgpXG4gICAge3JhbmdlOiBmb3VuZCwgd2hpY2hJc0hlYWQ6ICdlbmQnfVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHBhdHRlcm4gPSBAZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0U2VhcmNoUGF0dGVybicpXG4gICAgcmV0dXJuIHVubGVzcyBwYXR0ZXJuP1xuXG4gICAgZnJvbVBvaW50ID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAge3JhbmdlLCB3aGljaElzSGVhZH0gPSBAZmluZE1hdGNoKGZyb21Qb2ludCwgcGF0dGVybilcbiAgICBpZiByYW5nZT9cbiAgICAgIEB1bmlvblJhbmdlQW5kRGV0ZXJtaW5lUmV2ZXJzZWRTdGF0ZShzZWxlY3Rpb24sIHJhbmdlLCB3aGljaElzSGVhZClcblxuICB1bmlvblJhbmdlQW5kRGV0ZXJtaW5lUmV2ZXJzZWRTdGF0ZTogKHNlbGVjdGlvbiwgZm91bmQsIHdoaWNoSXNIZWFkKSAtPlxuICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgIGZvdW5kXG4gICAgZWxzZVxuICAgICAgaGVhZCA9IGZvdW5kW3doaWNoSXNIZWFkXVxuICAgICAgdGFpbCA9IHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICBpZiBAYmFja3dhcmRcbiAgICAgICAgaGVhZCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBoZWFkLCAnZm9yd2FyZCcpIGlmIHRhaWwuaXNMZXNzVGhhbihoZWFkKVxuICAgICAgZWxzZVxuICAgICAgICBoZWFkID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBlZGl0b3IsIGhlYWQsICdiYWNrd2FyZCcpIGlmIGhlYWQuaXNMZXNzVGhhbih0YWlsKVxuXG4gICAgICBAcmV2ZXJzZWQgPSBoZWFkLmlzTGVzc1RoYW4odGFpbClcbiAgICAgIG5ldyBSYW5nZSh0YWlsLCBoZWFkKS51bmlvbihAc3dyYXAoc2VsZWN0aW9uKS5nZXRUYWlsQnVmZmVyUmFuZ2UoKSlcblxuICBzZWxlY3RUZXh0T2JqZWN0OiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIHJhbmdlID0gQGdldFJhbmdlKHNlbGVjdGlvbilcbiAgICAgIEBzd3JhcChzZWxlY3Rpb24pLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCB7cmV2ZXJzZWQ6IEByZXZlcnNlZCA/IEBiYWNrd2FyZH0pXG4gICAgICByZXR1cm4gdHJ1ZVxuXG5jbGFzcyBTZWFyY2hNYXRjaEJhY2t3YXJkIGV4dGVuZHMgU2VhcmNoTWF0Y2hGb3J3YXJkXG4gIEBleHRlbmQoKVxuICBiYWNrd2FyZDogdHJ1ZVxuXG4gIGZpbmRNYXRjaDogKGZyb21Qb2ludCwgcGF0dGVybikgLT5cbiAgICBmcm9tUG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgZnJvbVBvaW50LCBcImJhY2t3YXJkXCIpIGlmIChAbW9kZSBpcyAndmlzdWFsJylcbiAgICBmb3VuZCA9IG51bGxcbiAgICBAc2NhbkJhY2t3YXJkIHBhdHRlcm4sIHtmcm9tOiBbZnJvbVBvaW50LnJvdywgSW5maW5pdHldfSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICBpZiByYW5nZS5zdGFydC5pc0xlc3NUaGFuKGZyb21Qb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICB7cmFuZ2U6IGZvdW5kLCB3aGljaElzSGVhZDogJ3N0YXJ0J31cblxuIyBbTGltaXRhdGlvbjogd29uJ3QgZml4XTogU2VsZWN0ZWQgcmFuZ2UgaXMgbm90IHN1Ym1vZGUgYXdhcmUuIGFsd2F5cyBjaGFyYWN0ZXJ3aXNlLlxuIyBTbyBldmVuIGlmIG9yaWdpbmFsIHNlbGVjdGlvbiB3YXMgdkwgb3IgdkIsIHNlbGVjdGVkIHJhbmdlIGJ5IHRoaXMgdGV4dC1vYmplY3RcbiMgaXMgYWx3YXlzIHZDIHJhbmdlLlxuY2xhc3MgUHJldmlvdXNTZWxlY3Rpb24gZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoKVxuICB3aXNlOiBudWxsXG4gIHNlbGVjdE9uY2U6IHRydWVcblxuICBzZWxlY3RUZXh0T2JqZWN0OiAoc2VsZWN0aW9uKSAtPlxuICAgIHtwcm9wZXJ0aWVzLCBzdWJtb2RlfSA9IEB2aW1TdGF0ZS5wcmV2aW91c1NlbGVjdGlvblxuICAgIGlmIHByb3BlcnRpZXM/IGFuZCBzdWJtb2RlP1xuICAgICAgQHdpc2UgPSBzdWJtb2RlXG4gICAgICBAc3dyYXAoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpLnNlbGVjdEJ5UHJvcGVydGllcyhwcm9wZXJ0aWVzKVxuICAgICAgcmV0dXJuIHRydWVcblxuY2xhc3MgUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHdpc2U6IG51bGxcbiAgc2VsZWN0T25jZTogdHJ1ZVxuXG4gIHNlbGVjdFRleHRPYmplY3Q6IChzZWxlY3Rpb24pIC0+XG4gICAgaWYgQHZpbVN0YXRlLmhhc1BlcnNpc3RlbnRTZWxlY3Rpb25zKClcbiAgICAgIEB2aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKClcbiAgICAgIHJldHVybiB0cnVlXG5cbmNsYXNzIFZpc2libGVBcmVhIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgc2VsZWN0T25jZTogdHJ1ZVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgICMgW0JVRz9dIE5lZWQgdHJhbnNsYXRlIHRvIHNoaWxuayB0b3AgYW5kIGJvdHRvbSB0byBmaXQgYWN0dWFsIHJvdy5cbiAgICAjIFRoZSByZWFzb24gSSBuZWVkIC0yIGF0IGJvdHRvbSBpcyBiZWNhdXNlIG9mIHN0YXR1cyBiYXI/XG4gICAgYnVmZmVyUmFuZ2UgPSBnZXRWaXNpYmxlQnVmZmVyUmFuZ2UoQGVkaXRvcilcbiAgICBpZiBidWZmZXJSYW5nZS5nZXRSb3dzKCkgPiBAZWRpdG9yLmdldFJvd3NQZXJQYWdlKClcbiAgICAgIGJ1ZmZlclJhbmdlLnRyYW5zbGF0ZShbKzEsIDBdLCBbLTMsIDBdKVxuICAgIGVsc2VcbiAgICAgIGJ1ZmZlclJhbmdlXG4iXX0=
