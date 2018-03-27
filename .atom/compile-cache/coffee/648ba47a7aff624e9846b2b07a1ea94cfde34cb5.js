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

    Function.prototype.getFoldRowRangesContainsForRow = function(row) {
      return (Function.__super__.getFoldRowRangesContainsForRow.apply(this, arguments)).filter((function(_this) {
        return function(rowRange) {
          return isIncludeFunctionScopeForRow(_this.editor, rowRange[0]);
        };
      })(this));
    };

    Function.prototype.adjustRowRange = function(rowRange) {
      var endRow, ref2, ref3, startRow;
      ref2 = Function.__super__.adjustRowRange.apply(this, arguments), startRow = ref2[0], endRow = ref2[1];
      if (this.isA() && (ref3 = this.editor.getGrammar().scopeName, indexOf.call(this.scopeNamesOmittingEndRow, ref3) >= 0)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3RleHQtb2JqZWN0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb3ZCQUFBO0lBQUE7Ozs7RUFBQSxNQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGlCQUFELEVBQVE7O0VBQ1IsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFLSixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsT0FjSSxPQUFBLENBQVEsU0FBUixDQWRKLEVBQ0UsOERBREYsRUFFRSw4RUFGRixFQUdFLGdFQUhGLEVBSUUsd0RBSkYsRUFLRSxrREFMRixFQU1FLGtEQU5GLEVBT0Usa0NBUEYsRUFRRSxnREFSRixFQVNFLDBCQVRGLEVBVUUsNEJBVkYsRUFXRSw0Q0FYRixFQVlFLG9DQVpGLEVBYUU7O0VBRUYsVUFBQSxHQUFhOztFQUVQOzs7SUFDSixVQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O0lBQ0EsVUFBQyxDQUFBLGFBQUQsR0FBZ0I7O3lCQUNoQixJQUFBLEdBQU07O3lCQUNOLFlBQUEsR0FBYzs7eUJBQ2QsVUFBQSxHQUFZOztJQUVaLFVBQUMsQ0FBQSxlQUFELEdBQWtCLFNBQUE7TUFDaEIsSUFBQyxDQUFBLGFBQUQsQ0FBZSxHQUFBLEdBQU0sSUFBQyxDQUFBLElBQXRCLEVBQTRCLEtBQTVCO2FBQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBZSxPQUFBLEdBQVUsSUFBQyxDQUFBLElBQTFCLEVBQWdDLElBQWhDO0lBRmdCOztJQUlsQixVQUFDLENBQUEsaUNBQUQsR0FBb0MsU0FBQTtNQUNsQyxJQUFDLENBQUEsYUFBRCxDQUFlLEdBQUEsR0FBTSxJQUFDLENBQUEsSUFBUCxHQUFjLGlCQUE3QixFQUFnRCxLQUFoRCxFQUF1RCxJQUF2RDthQUNBLElBQUMsQ0FBQSxhQUFELENBQWUsT0FBQSxH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R0FBUTtRQUNSLElBQUMsQ0FBQSxLQUFELENBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUFBLENBQVAsQ0FBa0MsQ0FBQyxrQkFBbkMsQ0FBc0QsVUFBdEQ7QUFDQSxlQUFPLEtBSFQ7O0lBRmdCOzs7O0tBTFk7O0VBWTFCOzs7Ozs7O0lBQ0osbUJBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7SUFDQSxtQkFBQyxDQUFBLGVBQUQsQ0FBQTs7a0NBQ0EsSUFBQSxHQUFNOztrQ0FDTixVQUFBLEdBQVk7O2tDQUVaLGdCQUFBLEdBQWtCLFNBQUMsU0FBRDtNQUNoQixJQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsdUJBQVYsQ0FBQSxDQUFIO1FBQ0UsSUFBQyxDQUFBLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyx1QkFBOUIsQ0FBQTtBQUNBLGVBQU8sS0FGVDs7SUFEZ0I7Ozs7S0FOYzs7RUFXNUI7Ozs7Ozs7SUFDSixXQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O0lBQ0EsV0FBQyxDQUFBLGVBQUQsQ0FBQTs7MEJBQ0EsVUFBQSxHQUFZOzswQkFFWixRQUFBLEdBQVUsU0FBQyxTQUFEO0FBR1IsVUFBQTtNQUFBLFdBQUEsR0FBYyxxQkFBQSxDQUFzQixJQUFDLENBQUEsTUFBdkI7TUFDZCxJQUFHLFdBQVcsQ0FBQyxPQUFaLENBQUEsQ0FBQSxHQUF3QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQSxDQUEzQjtlQUNFLFdBQVcsQ0FBQyxTQUFaLENBQXNCLENBQUMsQ0FBQyxDQUFGLEVBQUssQ0FBTCxDQUF0QixFQUErQixDQUFDLENBQUMsQ0FBRixFQUFLLENBQUwsQ0FBL0IsRUFERjtPQUFBLE1BQUE7ZUFHRSxZQUhGOztJQUpROzs7O0tBTGM7QUFwcUIxQiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgUG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbiMgW1RPRE9dIE5lZWQgb3ZlcmhhdWxcbiMgIC0gWyBdIE1ha2UgZXhwYW5kYWJsZSBieSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS51bmlvbihAZ2V0UmFuZ2Uoc2VsZWN0aW9uKSlcbiMgIC0gWyBdIENvdW50IHN1cHBvcnQocHJpb3JpdHkgbG93KT9cbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG57XG4gIGdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvblxuICBnZXRDb2RlRm9sZFJvd1Jhbmdlc0NvbnRhaW5lc0ZvclJvd1xuICBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93XG4gIGV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlc1xuICBnZXRWaXNpYmxlQnVmZmVyUmFuZ2VcbiAgdHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIGdldEJ1ZmZlclJvd3NcbiAgZ2V0VmFsaWRWaW1CdWZmZXJSb3dcbiAgdHJpbVJhbmdlXG4gIHNvcnRSYW5nZXNcbiAgcG9pbnRJc0F0RW5kT2ZMaW5lXG4gIHNwbGl0QXJndW1lbnRzXG4gIHRyYXZlcnNlVGV4dEZyb21Qb2ludFxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5QYWlyRmluZGVyID0gbnVsbFxuXG5jbGFzcyBUZXh0T2JqZWN0IGV4dGVuZHMgQmFzZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBAb3BlcmF0aW9uS2luZDogJ3RleHQtb2JqZWN0J1xuICB3aXNlOiAnY2hhcmFjdGVyd2lzZSdcbiAgc3VwcG9ydENvdW50OiBmYWxzZSAjIEZJWE1FICM0NzIsICM2NlxuICBzZWxlY3RPbmNlOiBmYWxzZVxuXG4gIEBkZXJpdmVJbm5lckFuZEE6IC0+XG4gICAgQGdlbmVyYXRlQ2xhc3MoXCJBXCIgKyBAbmFtZSwgZmFsc2UpXG4gICAgQGdlbmVyYXRlQ2xhc3MoXCJJbm5lclwiICsgQG5hbWUsIHRydWUpXG5cbiAgQGRlcml2ZUlubmVyQW5kQUZvckFsbG93Rm9yd2FyZGluZzogLT5cbiAgICBAZ2VuZXJhdGVDbGFzcyhcIkFcIiArIEBuYW1lICsgXCJBbGxvd0ZvcndhcmRpbmdcIiwgZmFsc2UsIHRydWUpXG4gICAgQGdlbmVyYXRlQ2xhc3MoXCJJbm5lclwiICsgQG5hbWUgKyBcIkFsbG93Rm9yd2FyZGluZ1wiLCB0cnVlLCB0cnVlKVxuXG4gIEBnZW5lcmF0ZUNsYXNzOiAoa2xhc3NOYW1lLCBpbm5lciwgYWxsb3dGb3J3YXJkaW5nKSAtPlxuICAgIGtsYXNzID0gY2xhc3MgZXh0ZW5kcyB0aGlzXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IGtsYXNzLCAnbmFtZScsIGdldDogLT4ga2xhc3NOYW1lXG4gICAga2xhc3M6OmlubmVyID0gaW5uZXJcbiAgICBrbGFzczo6YWxsb3dGb3J3YXJkaW5nID0gdHJ1ZSBpZiBhbGxvd0ZvcndhcmRpbmdcbiAgICBrbGFzcy5leHRlbmQoKVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAgQGluaXRpYWxpemUoKVxuXG4gIGlzSW5uZXI6IC0+XG4gICAgQGlubmVyXG5cbiAgaXNBOiAtPlxuICAgIG5vdCBAaW5uZXJcblxuICBpc0xpbmV3aXNlOiAtPiBAd2lzZSBpcyAnbGluZXdpc2UnXG4gIGlzQmxvY2t3aXNlOiAtPiBAd2lzZSBpcyAnYmxvY2t3aXNlJ1xuXG4gIGZvcmNlV2lzZTogKHdpc2UpIC0+XG4gICAgQHdpc2UgPSB3aXNlICMgRklYTUUgY3VycmVudGx5IG5vdCB3ZWxsIHN1cHBvcnRlZFxuXG4gIHJlc2V0U3RhdGU6IC0+XG4gICAgQHNlbGVjdFN1Y2NlZWRlZCA9IG51bGxcblxuICBleGVjdXRlOiAtPlxuICAgIEByZXNldFN0YXRlKClcblxuICAgICMgV2hlbm5ldmVyIFRleHRPYmplY3QgaXMgZXhlY3V0ZWQsIGl0IGhhcyBAb3BlcmF0b3JcbiAgICAjIENhbGxlZCBmcm9tIE9wZXJhdG9yOjpzZWxlY3RUYXJnZXQoKVxuICAgICMgIC0gYHYgaSBwYCwgaXMgYFNlbGVjdGAgb3BlcmF0b3Igd2l0aCBAdGFyZ2V0ID0gYElubmVyUGFyYWdyYXBoYC5cbiAgICAjICAtIGBkIGkgcGAsIGlzIGBEZWxldGVgIG9wZXJhdG9yIHdpdGggQHRhcmdldCA9IGBJbm5lclBhcmFncmFwaGAuXG4gICAgaWYgQG9wZXJhdG9yP1xuICAgICAgQHNlbGVjdCgpXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbiBUZXh0T2JqZWN0OiBNdXN0IG5vdCBoYXBwZW4nKVxuXG4gIHNlbGVjdDogLT5cbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgIEBzd3JhcC5ub3JtYWxpemUoQGVkaXRvcilcblxuICAgIEBjb3VudFRpbWVzIEBnZXRDb3VudCgpLCAoe3N0b3B9KSA9PlxuICAgICAgc3RvcCgpIHVubGVzcyBAc3VwcG9ydENvdW50ICMgcXVpY2stZml4IGZvciAjNTYwXG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgIG9sZFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgaWYgQHNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKVxuICAgICAgICAgIEBzZWxlY3RTdWNjZWVkZWQgPSB0cnVlXG4gICAgICAgIHN0b3AoKSBpZiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5pc0VxdWFsKG9sZFJhbmdlKVxuICAgICAgICBicmVhayBpZiBAc2VsZWN0T25jZVxuXG4gICAgQGVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuICAgICMgU29tZSBUZXh0T2JqZWN0J3Mgd2lzZSBpcyBOT1QgZGV0ZXJtaW5pc3RpYy4gSXQgaGFzIHRvIGJlIGRldGVjdGVkIGZyb20gc2VsZWN0ZWQgcmFuZ2UuXG4gICAgQHdpc2UgPz0gQHN3cmFwLmRldGVjdFdpc2UoQGVkaXRvcilcblxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBpZiBAc2VsZWN0U3VjY2VlZGVkXG4gICAgICAgIHN3aXRjaCBAd2lzZVxuICAgICAgICAgIHdoZW4gJ2NoYXJhY3Rlcndpc2UnXG4gICAgICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKCkgZm9yICRzZWxlY3Rpb24gaW4gQHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcbiAgICAgICAgICB3aGVuICdsaW5ld2lzZSdcbiAgICAgICAgICAgICMgV2hlbiB0YXJnZXQgaXMgcGVyc2lzdGVudC1zZWxlY3Rpb24sIG5ldyBzZWxlY3Rpb24gaXMgYWRkZWQgYWZ0ZXIgc2VsZWN0VGV4dE9iamVjdC5cbiAgICAgICAgICAgICMgU28gd2UgaGF2ZSB0byBhc3N1cmUgYWxsIHNlbGVjdGlvbiBoYXZlIHNlbGN0aW9uIHByb3BlcnR5LlxuICAgICAgICAgICAgIyBNYXliZSB0aGlzIGxvZ2ljIGNhbiBiZSBtb3ZlZCB0byBvcGVyYXRpb24gc3RhY2suXG4gICAgICAgICAgICBmb3IgJHNlbGVjdGlvbiBpbiBAc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuICAgICAgICAgICAgICBpZiBAZ2V0Q29uZmlnKCdrZWVwQ29sdW1uT25TZWxlY3RUZXh0T2JqZWN0JylcbiAgICAgICAgICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKCkgdW5sZXNzICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcbiAgICAgICAgICAgICAgJHNlbGVjdGlvbi5maXhQcm9wZXJ0eVJvd1RvUm93UmFuZ2UoKVxuXG4gICAgICBpZiBAc3VibW9kZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgICBmb3IgJHNlbGVjdGlvbiBpbiBAc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuICAgICAgICAgICRzZWxlY3Rpb24ubm9ybWFsaXplKClcbiAgICAgICAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZSgnYmxvY2t3aXNlJylcblxuICAjIFJldHVybiB0cnVlIG9yIGZhbHNlXG4gIHNlbGVjdFRleHRPYmplY3Q6IChzZWxlY3Rpb24pIC0+XG4gICAgaWYgcmFuZ2UgPSBAZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgICAgQHN3cmFwKHNlbGVjdGlvbikuc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICMgdG8gb3ZlcnJpZGVcbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgbnVsbFxuXG4jIFNlY3Rpb246IFdvcmRcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgV29yZCBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcG9pbnQgPSBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIHtyYW5nZX0gPSBAZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24ocG9pbnQsIHtAd29yZFJlZ2V4fSlcbiAgICBpZiBAaXNBKClcbiAgICAgIGV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlcyhAZWRpdG9yLCByYW5nZSlcbiAgICBlbHNlXG4gICAgICByYW5nZVxuXG5jbGFzcyBXaG9sZVdvcmQgZXh0ZW5kcyBXb3JkXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICB3b3JkUmVnZXg6IC9cXFMrL1xuXG4jIEp1c3QgaW5jbHVkZSBfLCAtXG5jbGFzcyBTbWFydFdvcmQgZXh0ZW5kcyBXb3JkXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBAZGVzY3JpcHRpb246IFwiQSB3b3JkIHRoYXQgY29uc2lzdHMgb2YgYWxwaGFudW1lcmljIGNoYXJzKGAvW0EtWmEtejAtOV9dL2ApIGFuZCBoeXBoZW4gYC1gXCJcbiAgd29yZFJlZ2V4OiAvW1xcdy1dKy9cblxuIyBKdXN0IGluY2x1ZGUgXywgLVxuY2xhc3MgU3Vid29yZCBleHRlbmRzIFdvcmRcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIEB3b3JkUmVnZXggPSBzZWxlY3Rpb24uY3Vyc29yLnN1YndvcmRSZWdFeHAoKVxuICAgIHN1cGVyXG5cbiMgU2VjdGlvbjogUGFpclxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBQYWlyIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBzdXBwb3J0Q291bnQ6IHRydWVcbiAgYWxsb3dOZXh0TGluZTogbnVsbFxuICBhZGp1c3RJbm5lclJhbmdlOiB0cnVlXG4gIHBhaXI6IG51bGxcbiAgaW5jbHVzaXZlOiB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBQYWlyRmluZGVyID89IHJlcXVpcmUgJy4vcGFpci1maW5kZXIuY29mZmVlJ1xuICAgIHN1cGVyXG5cblxuICBpc0FsbG93TmV4dExpbmU6IC0+XG4gICAgQGFsbG93TmV4dExpbmUgPyAoQHBhaXI/IGFuZCBAcGFpclswXSBpc250IEBwYWlyWzFdKVxuXG4gIGFkanVzdFJhbmdlOiAoe3N0YXJ0LCBlbmR9KSAtPlxuICAgICMgRGlydHkgd29yayB0byBmZWVsIG5hdHVyYWwgZm9yIGh1bWFuLCB0byBiZWhhdmUgY29tcGF0aWJsZSB3aXRoIHB1cmUgVmltLlxuICAgICMgV2hlcmUgdGhpcyBhZGp1c3RtZW50IGFwcGVhciBpcyBpbiBmb2xsb3dpbmcgc2l0dWF0aW9uLlxuICAgICMgb3AtMTogYGNpe2AgcmVwbGFjZSBvbmx5IDJuZCBsaW5lXG4gICAgIyBvcC0yOiBgZGl7YCBkZWxldGUgb25seSAybmQgbGluZS5cbiAgICAjIHRleHQ6XG4gICAgIyAge1xuICAgICMgICAgYWFhXG4gICAgIyAgfVxuICAgIGlmIHBvaW50SXNBdEVuZE9mTGluZShAZWRpdG9yLCBzdGFydClcbiAgICAgIHN0YXJ0ID0gc3RhcnQudHJhdmVyc2UoWzEsIDBdKVxuXG4gICAgaWYgZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIGVuZCkubWF0Y2goL15cXHMqJC8pXG4gICAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgICAjIFRoaXMgaXMgc2xpZ2h0bHkgaW5uY29uc2lzdGVudCB3aXRoIHJlZ3VsYXIgVmltXG4gICAgICAgICMgLSByZWd1bGFyIFZpbTogc2VsZWN0IG5ldyBsaW5lIGFmdGVyIEVPTFxuICAgICAgICAjIC0gdmltLW1vZGUtcGx1czogc2VsZWN0IHRvIEVPTChiZWZvcmUgbmV3IGxpbmUpXG4gICAgICAgICMgVGhpcyBpcyBpbnRlbnRpb25hbCBzaW5jZSB0byBtYWtlIHN1Ym1vZGUgYGNoYXJhY3Rlcndpc2VgIHdoZW4gYXV0by1kZXRlY3Qgc3VibW9kZVxuICAgICAgICAjIGlubmVyRW5kID0gbmV3IFBvaW50KGlubmVyRW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgZWxzZVxuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdywgMClcblxuICAgIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuXG4gIGdldEZpbmRlcjogLT5cbiAgICBvcHRpb25zID0ge2FsbG93TmV4dExpbmU6IEBpc0FsbG93TmV4dExpbmUoKSwgQGFsbG93Rm9yd2FyZGluZywgQHBhaXIsIEBpbmNsdXNpdmV9XG4gICAgaWYgQHBhaXJbMF0gaXMgQHBhaXJbMV1cbiAgICAgIG5ldyBQYWlyRmluZGVyLlF1b3RlRmluZGVyKEBlZGl0b3IsIG9wdGlvbnMpXG4gICAgZWxzZVxuICAgICAgbmV3IFBhaXJGaW5kZXIuQnJhY2tldEZpbmRlcihAZWRpdG9yLCBvcHRpb25zKVxuXG4gIGdldFBhaXJJbmZvOiAoZnJvbSkgLT5cbiAgICBwYWlySW5mbyA9IEBnZXRGaW5kZXIoKS5maW5kKGZyb20pXG4gICAgdW5sZXNzIHBhaXJJbmZvP1xuICAgICAgcmV0dXJuIG51bGxcbiAgICBwYWlySW5mby5pbm5lclJhbmdlID0gQGFkanVzdFJhbmdlKHBhaXJJbmZvLmlubmVyUmFuZ2UpIGlmIEBhZGp1c3RJbm5lclJhbmdlXG4gICAgcGFpckluZm8udGFyZ2V0UmFuZ2UgPSBpZiBAaXNJbm5lcigpIHRoZW4gcGFpckluZm8uaW5uZXJSYW5nZSBlbHNlIHBhaXJJbmZvLmFSYW5nZVxuICAgIHBhaXJJbmZvXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgb3JpZ2luYWxSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgcGFpckluZm8gPSBAZ2V0UGFpckluZm8oQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikpXG4gICAgIyBXaGVuIHJhbmdlIHdhcyBzYW1lLCB0cnkgdG8gZXhwYW5kIHJhbmdlXG4gICAgaWYgcGFpckluZm8/LnRhcmdldFJhbmdlLmlzRXF1YWwob3JpZ2luYWxSYW5nZSlcbiAgICAgIHBhaXJJbmZvID0gQGdldFBhaXJJbmZvKHBhaXJJbmZvLmFSYW5nZS5lbmQpXG4gICAgcGFpckluZm8/LnRhcmdldFJhbmdlXG5cbiMgVXNlZCBieSBEZWxldGVTdXJyb3VuZFxuY2xhc3MgQVBhaXIgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG5cbmNsYXNzIEFueVBhaXIgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBhbGxvd0ZvcndhcmRpbmc6IGZhbHNlXG4gIG1lbWJlcjogW1xuICAgICdEb3VibGVRdW90ZScsICdTaW5nbGVRdW90ZScsICdCYWNrVGljaycsXG4gICAgJ0N1cmx5QnJhY2tldCcsICdBbmdsZUJyYWNrZXQnLCAnU3F1YXJlQnJhY2tldCcsICdQYXJlbnRoZXNpcydcbiAgXVxuXG4gIGdldFJhbmdlczogKHNlbGVjdGlvbikgLT5cbiAgICBAbWVtYmVyXG4gICAgICAubWFwIChrbGFzcykgPT4gQG5ldyhrbGFzcywge0Bpbm5lciwgQGFsbG93Rm9yd2FyZGluZywgQGluY2x1c2l2ZX0pLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICAgIC5maWx0ZXIgKHJhbmdlKSAtPiByYW5nZT9cblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBfLmxhc3Qoc29ydFJhbmdlcyhAZ2V0UmFuZ2VzKHNlbGVjdGlvbikpKVxuXG5jbGFzcyBBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQW55UGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgQGRlc2NyaXB0aW9uOiBcIlJhbmdlIHN1cnJvdW5kZWQgYnkgYXV0by1kZXRlY3RlZCBwYWlyZWQgY2hhcnMgZnJvbSBlbmNsb3NlZCBhbmQgZm9yd2FyZGluZyBhcmVhXCJcbiAgYWxsb3dGb3J3YXJkaW5nOiB0cnVlXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJhbmdlcyA9IEBnZXRSYW5nZXMoc2VsZWN0aW9uKVxuICAgIGZyb20gPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBbZm9yd2FyZGluZ1JhbmdlcywgZW5jbG9zaW5nUmFuZ2VzXSA9IF8ucGFydGl0aW9uIHJhbmdlcywgKHJhbmdlKSAtPlxuICAgICAgcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwoZnJvbSlcbiAgICBlbmNsb3NpbmdSYW5nZSA9IF8ubGFzdChzb3J0UmFuZ2VzKGVuY2xvc2luZ1JhbmdlcykpXG4gICAgZm9yd2FyZGluZ1JhbmdlcyA9IHNvcnRSYW5nZXMoZm9yd2FyZGluZ1JhbmdlcylcblxuICAgICMgV2hlbiBlbmNsb3NpbmdSYW5nZSBpcyBleGlzdHMsXG4gICAgIyBXZSBkb24ndCBnbyBhY3Jvc3MgZW5jbG9zaW5nUmFuZ2UuZW5kLlxuICAgICMgU28gY2hvb3NlIGZyb20gcmFuZ2VzIGNvbnRhaW5lZCBpbiBlbmNsb3NpbmdSYW5nZS5cbiAgICBpZiBlbmNsb3NpbmdSYW5nZVxuICAgICAgZm9yd2FyZGluZ1JhbmdlcyA9IGZvcndhcmRpbmdSYW5nZXMuZmlsdGVyIChyYW5nZSkgLT5cbiAgICAgICAgZW5jbG9zaW5nUmFuZ2UuY29udGFpbnNSYW5nZShyYW5nZSlcblxuICAgIGZvcndhcmRpbmdSYW5nZXNbMF0gb3IgZW5jbG9zaW5nUmFuZ2VcblxuY2xhc3MgQW55UXVvdGUgZXh0ZW5kcyBBbnlQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBhbGxvd0ZvcndhcmRpbmc6IHRydWVcbiAgbWVtYmVyOiBbJ0RvdWJsZVF1b3RlJywgJ1NpbmdsZVF1b3RlJywgJ0JhY2tUaWNrJ11cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcmFuZ2VzID0gQGdldFJhbmdlcyhzZWxlY3Rpb24pXG4gICAgIyBQaWNrIHJhbmdlIHdoaWNoIGVuZC5jb2x1bSBpcyBsZWZ0bW9zdChtZWFuLCBjbG9zZWQgZmlyc3QpXG4gICAgXy5maXJzdChfLnNvcnRCeShyYW5nZXMsIChyKSAtPiByLmVuZC5jb2x1bW4pKSBpZiByYW5nZXMubGVuZ3RoXG5cbmNsYXNzIFF1b3RlIGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBhbGxvd0ZvcndhcmRpbmc6IHRydWVcblxuY2xhc3MgRG91YmxlUXVvdGUgZXh0ZW5kcyBRdW90ZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgcGFpcjogWydcIicsICdcIiddXG5cbmNsYXNzIFNpbmdsZVF1b3RlIGV4dGVuZHMgUXVvdGVcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHBhaXI6IFtcIidcIiwgXCInXCJdXG5cbmNsYXNzIEJhY2tUaWNrIGV4dGVuZHMgUXVvdGVcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHBhaXI6IFsnYCcsICdgJ11cblxuY2xhc3MgQ3VybHlCcmFja2V0IGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgQGRlcml2ZUlubmVyQW5kQUZvckFsbG93Rm9yd2FyZGluZygpXG4gIHBhaXI6IFsneycsICd9J11cblxuY2xhc3MgU3F1YXJlQnJhY2tldCBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIEBkZXJpdmVJbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmcoKVxuICBwYWlyOiBbJ1snLCAnXSddXG5cbmNsYXNzIFBhcmVudGhlc2lzIGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgQGRlcml2ZUlubmVyQW5kQUZvckFsbG93Rm9yd2FyZGluZygpXG4gIHBhaXI6IFsnKCcsICcpJ11cblxuY2xhc3MgQW5nbGVCcmFja2V0IGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgQGRlcml2ZUlubmVyQW5kQUZvckFsbG93Rm9yd2FyZGluZygpXG4gIHBhaXI6IFsnPCcsICc+J11cblxuY2xhc3MgVGFnIGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgYWxsb3dOZXh0TGluZTogdHJ1ZVxuICBhbGxvd0ZvcndhcmRpbmc6IHRydWVcbiAgYWRqdXN0SW5uZXJSYW5nZTogZmFsc2VcblxuICBnZXRUYWdTdGFydFBvaW50OiAoZnJvbSkgLT5cbiAgICB0YWdSYW5nZSA9IG51bGxcbiAgICBwYXR0ZXJuID0gUGFpckZpbmRlci5UYWdGaW5kZXI6OnBhdHRlcm5cbiAgICBAc2NhbkZvcndhcmQgcGF0dGVybiwge2Zyb206IFtmcm9tLnJvdywgMF19LCAoe3JhbmdlLCBzdG9wfSkgLT5cbiAgICAgIGlmIHJhbmdlLmNvbnRhaW5zUG9pbnQoZnJvbSwgdHJ1ZSlcbiAgICAgICAgdGFnUmFuZ2UgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICB0YWdSYW5nZT8uc3RhcnRcblxuICBnZXRGaW5kZXI6IC0+XG4gICAgbmV3IFBhaXJGaW5kZXIuVGFnRmluZGVyKEBlZGl0b3IsIHthbGxvd05leHRMaW5lOiBAaXNBbGxvd05leHRMaW5lKCksIEBhbGxvd0ZvcndhcmRpbmcsIEBpbmNsdXNpdmV9KVxuXG4gIGdldFBhaXJJbmZvOiAoZnJvbSkgLT5cbiAgICBzdXBlcihAZ2V0VGFnU3RhcnRQb2ludChmcm9tKSA/IGZyb20pXG5cbiMgU2VjdGlvbjogUGFyYWdyYXBoXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgUGFyYWdyYXBoIGlzIGRlZmluZWQgYXMgY29uc2VjdXRpdmUgKG5vbi0pYmxhbmstbGluZS5cbmNsYXNzIFBhcmFncmFwaCBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgc3VwcG9ydENvdW50OiB0cnVlXG5cbiAgZmluZFJvdzogKGZyb21Sb3csIGRpcmVjdGlvbiwgZm4pIC0+XG4gICAgZm4ucmVzZXQ/KClcbiAgICBmb3VuZFJvdyA9IGZyb21Sb3dcbiAgICBmb3Igcm93IGluIGdldEJ1ZmZlclJvd3MoQGVkaXRvciwge3N0YXJ0Um93OiBmcm9tUm93LCBkaXJlY3Rpb259KVxuICAgICAgYnJlYWsgdW5sZXNzIGZuKHJvdywgZGlyZWN0aW9uKVxuICAgICAgZm91bmRSb3cgPSByb3dcblxuICAgIGZvdW5kUm93XG5cbiAgZmluZFJvd1JhbmdlQnk6IChmcm9tUm93LCBmbikgLT5cbiAgICBzdGFydFJvdyA9IEBmaW5kUm93KGZyb21Sb3csICdwcmV2aW91cycsIGZuKVxuICAgIGVuZFJvdyA9IEBmaW5kUm93KGZyb21Sb3csICduZXh0JywgZm4pXG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddXG5cbiAgZ2V0UHJlZGljdEZ1bmN0aW9uOiAoZnJvbVJvdywgc2VsZWN0aW9uKSAtPlxuICAgIGZyb21Sb3dSZXN1bHQgPSBAZWRpdG9yLmlzQnVmZmVyUm93QmxhbmsoZnJvbVJvdylcblxuICAgIGlmIEBpc0lubmVyKClcbiAgICAgIHByZWRpY3QgPSAocm93LCBkaXJlY3Rpb24pID0+XG4gICAgICAgIEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpIGlzIGZyb21Sb3dSZXN1bHRcbiAgICBlbHNlXG4gICAgICBpZiBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICAgIGRpcmVjdGlvblRvRXh0ZW5kID0gJ3ByZXZpb3VzJ1xuICAgICAgZWxzZVxuICAgICAgICBkaXJlY3Rpb25Ub0V4dGVuZCA9ICduZXh0J1xuXG4gICAgICBmbGlwID0gZmFsc2VcbiAgICAgIHByZWRpY3QgPSAocm93LCBkaXJlY3Rpb24pID0+XG4gICAgICAgIHJlc3VsdCA9IEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpIGlzIGZyb21Sb3dSZXN1bHRcbiAgICAgICAgaWYgZmxpcFxuICAgICAgICAgIG5vdCByZXN1bHRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlmIChub3QgcmVzdWx0KSBhbmQgKGRpcmVjdGlvbiBpcyBkaXJlY3Rpb25Ub0V4dGVuZClcbiAgICAgICAgICAgIGZsaXAgPSB0cnVlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgIHJlc3VsdFxuXG4gICAgICBwcmVkaWN0LnJlc2V0ID0gLT5cbiAgICAgICAgZmxpcCA9IGZhbHNlXG4gICAgcHJlZGljdFxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIG9yaWdpbmFsUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIGZyb21Sb3cgPSBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3dcbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCAnbGluZXdpc2UnKVxuICAgICAgaWYgc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgICBmcm9tUm93LS1cbiAgICAgIGVsc2VcbiAgICAgICAgZnJvbVJvdysrXG4gICAgICBmcm9tUm93ID0gZ2V0VmFsaWRWaW1CdWZmZXJSb3coQGVkaXRvciwgZnJvbVJvdylcblxuICAgIHJvd1JhbmdlID0gQGZpbmRSb3dSYW5nZUJ5KGZyb21Sb3csIEBnZXRQcmVkaWN0RnVuY3Rpb24oZnJvbVJvdywgc2VsZWN0aW9uKSlcbiAgICBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS51bmlvbihAZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSkpXG5cbmNsYXNzIEluZGVudGF0aW9uIGV4dGVuZHMgUGFyYWdyYXBoXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIGZyb21Sb3cgPSBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3dcblxuICAgIGJhc2VJbmRlbnRMZXZlbCA9IEBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhmcm9tUm93KVxuICAgIHByZWRpY3QgPSAocm93KSA9PlxuICAgICAgaWYgQGVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdylcbiAgICAgICAgQGlzQSgpXG4gICAgICBlbHNlXG4gICAgICAgIEBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhyb3cpID49IGJhc2VJbmRlbnRMZXZlbFxuXG4gICAgcm93UmFuZ2UgPSBAZmluZFJvd1JhbmdlQnkoZnJvbVJvdywgcHJlZGljdClcbiAgICBAZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSlcblxuIyBTZWN0aW9uOiBDb21tZW50XG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbW1lbnQgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcm93ID0gQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgcm93UmFuZ2UgPSBAZWRpdG9yLmxhbmd1YWdlTW9kZS5yb3dSYW5nZUZvckNvbW1lbnRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgcm93UmFuZ2UgPz0gW3Jvdywgcm93XSBpZiBAZWRpdG9yLmlzQnVmZmVyUm93Q29tbWVudGVkKHJvdylcbiAgICBpZiByb3dSYW5nZT9cbiAgICAgIEBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHJvd1JhbmdlKVxuXG5jbGFzcyBDb21tZW50T3JQYXJhZ3JhcGggZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgZm9yIGtsYXNzIGluIFsnQ29tbWVudCcsICdQYXJhZ3JhcGgnXVxuICAgICAgaWYgcmFuZ2UgPSBAbmV3KGtsYXNzLCB7QGlubmVyfSkuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgICAgICByZXR1cm4gcmFuZ2VcblxuIyBTZWN0aW9uOiBGb2xkXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEZvbGQgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgYWRqdXN0Um93UmFuZ2U6IChyb3dSYW5nZSkgLT5cbiAgICByZXR1cm4gcm93UmFuZ2UgaWYgQGlzQSgpXG5cbiAgICBbc3RhcnRSb3csIGVuZFJvd10gPSByb3dSYW5nZVxuICAgIGlmIEBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhzdGFydFJvdykgaXMgQGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KGVuZFJvdylcbiAgICAgIGVuZFJvdyAtPSAxXG4gICAgc3RhcnRSb3cgKz0gMVxuICAgIFtzdGFydFJvdywgZW5kUm93XVxuXG4gIGdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdzogKHJvdykgLT5cbiAgICBnZXRDb2RlRm9sZFJvd1Jhbmdlc0NvbnRhaW5lc0ZvclJvdyhAZWRpdG9yLCByb3cpLnJldmVyc2UoKVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJvdyA9IEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIHNlbGVjdGVkUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIGZvciByb3dSYW5nZSBpbiBAZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5zRm9yUm93KHJvdylcbiAgICAgIHJhbmdlID0gQGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UoQGFkanVzdFJvd1JhbmdlKHJvd1JhbmdlKSlcblxuICAgICAgIyBEb24ndCBjaGFuZ2UgdG8gYGlmIHJhbmdlLmNvbnRhaW5zUmFuZ2Uoc2VsZWN0ZWRSYW5nZSwgdHJ1ZSlgXG4gICAgICAjIFRoZXJlIGlzIGJlaGF2aW9yIGRpZmYgd2hlbiBjdXJzb3IgaXMgYXQgYmVnaW5uaW5nIG9mIGxpbmUoIGNvbHVtbiAwICkuXG4gICAgICB1bmxlc3Mgc2VsZWN0ZWRSYW5nZS5jb250YWluc1JhbmdlKHJhbmdlKVxuICAgICAgICByZXR1cm4gcmFuZ2VcblxuIyBOT1RFOiBGdW5jdGlvbiByYW5nZSBkZXRlcm1pbmF0aW9uIGlzIGRlcGVuZGluZyBvbiBmb2xkLlxuY2xhc3MgRnVuY3Rpb24gZXh0ZW5kcyBGb2xkXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICAjIFNvbWUgbGFuZ3VhZ2UgZG9uJ3QgaW5jbHVkZSBjbG9zaW5nIGB9YCBpbnRvIGZvbGQuXG4gIHNjb3BlTmFtZXNPbWl0dGluZ0VuZFJvdzogWydzb3VyY2UuZ28nLCAnc291cmNlLmVsaXhpciddXG5cbiAgZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5zRm9yUm93OiAocm93KSAtPlxuICAgIChzdXBlcikuZmlsdGVyIChyb3dSYW5nZSkgPT5cbiAgICAgIGlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3coQGVkaXRvciwgcm93UmFuZ2VbMF0pXG5cbiAgYWRqdXN0Um93UmFuZ2U6IChyb3dSYW5nZSkgLT5cbiAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBzdXBlclxuICAgICMgTk9URTogVGhpcyBhZGp1c3RtZW50IHNob3VkIG5vdCBiZSBuZWNlc3NhcnkgaWYgbGFuZ3VhZ2Utc3ludGF4IGlzIHByb3Blcmx5IGRlZmluZWQuXG4gICAgaWYgQGlzQSgpIGFuZCBAZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUgaW4gQHNjb3BlTmFtZXNPbWl0dGluZ0VuZFJvd1xuICAgICAgZW5kUm93ICs9IDFcbiAgICBbc3RhcnRSb3csIGVuZFJvd11cblxuIyBTZWN0aW9uOiBPdGhlclxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBBcmd1bWVudHMgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuXG4gIG5ld0FyZ0luZm86IChhcmdTdGFydCwgYXJnLCBzZXBhcmF0b3IpIC0+XG4gICAgYXJnRW5kID0gdHJhdmVyc2VUZXh0RnJvbVBvaW50KGFyZ1N0YXJ0LCBhcmcpXG4gICAgYXJnUmFuZ2UgPSBuZXcgUmFuZ2UoYXJnU3RhcnQsIGFyZ0VuZClcblxuICAgIHNlcGFyYXRvckVuZCA9IHRyYXZlcnNlVGV4dEZyb21Qb2ludChhcmdFbmQsIHNlcGFyYXRvciA/ICcnKVxuICAgIHNlcGFyYXRvclJhbmdlID0gbmV3IFJhbmdlKGFyZ0VuZCwgc2VwYXJhdG9yRW5kKVxuXG4gICAgaW5uZXJSYW5nZSA9IGFyZ1JhbmdlXG4gICAgYVJhbmdlID0gYXJnUmFuZ2UudW5pb24oc2VwYXJhdG9yUmFuZ2UpXG4gICAge2FyZ1JhbmdlLCBzZXBhcmF0b3JSYW5nZSwgaW5uZXJSYW5nZSwgYVJhbmdlfVxuXG4gIGdldEFyZ3VtZW50c1JhbmdlRm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIG1lbWJlciA9IFtcbiAgICAgICdDdXJseUJyYWNrZXQnXG4gICAgICAnU3F1YXJlQnJhY2tldCdcbiAgICAgICdQYXJlbnRoZXNpcydcbiAgICBdXG4gICAgQG5ldyhcIklubmVyQW55UGFpclwiLCB7aW5jbHVzaXZlOiBmYWxzZSwgbWVtYmVyOiBtZW1iZXJ9KS5nZXRSYW5nZShzZWxlY3Rpb24pXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcmFuZ2UgPSBAZ2V0QXJndW1lbnRzUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIHBhaXJSYW5nZUZvdW5kID0gcmFuZ2U/XG4gICAgcmFuZ2UgPz0gQG5ldyhcIklubmVyQ3VycmVudExpbmVcIikuZ2V0UmFuZ2Uoc2VsZWN0aW9uKSAjIGZhbGxiYWNrXG4gICAgcmV0dXJuIHVubGVzcyByYW5nZVxuXG4gICAgcmFuZ2UgPSB0cmltUmFuZ2UoQGVkaXRvciwgcmFuZ2UpXG5cbiAgICB0ZXh0ID0gQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICBhbGxUb2tlbnMgPSBzcGxpdEFyZ3VtZW50cyh0ZXh0LCBwYWlyUmFuZ2VGb3VuZClcblxuICAgIGFyZ0luZm9zID0gW11cbiAgICBhcmdTdGFydCA9IHJhbmdlLnN0YXJ0XG5cbiAgICAjIFNraXAgc3RhcnRpbmcgc2VwYXJhdG9yXG4gICAgaWYgYWxsVG9rZW5zLmxlbmd0aCBhbmQgYWxsVG9rZW5zWzBdLnR5cGUgaXMgJ3NlcGFyYXRvcidcbiAgICAgIHRva2VuID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIGFyZ1N0YXJ0ID0gdHJhdmVyc2VUZXh0RnJvbVBvaW50KGFyZ1N0YXJ0LCB0b2tlbi50ZXh0KVxuXG4gICAgd2hpbGUgYWxsVG9rZW5zLmxlbmd0aFxuICAgICAgdG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgaWYgdG9rZW4udHlwZSBpcyAnYXJndW1lbnQnXG4gICAgICAgIHNlcGFyYXRvciA9IGFsbFRva2Vucy5zaGlmdCgpPy50ZXh0XG4gICAgICAgIGFyZ0luZm8gPSBAbmV3QXJnSW5mbyhhcmdTdGFydCwgdG9rZW4udGV4dCwgc2VwYXJhdG9yKVxuXG4gICAgICAgIGlmIChhbGxUb2tlbnMubGVuZ3RoIGlzIDApIGFuZCAobGFzdEFyZ0luZm8gPSBfLmxhc3QoYXJnSW5mb3MpKVxuICAgICAgICAgIGFyZ0luZm8uYVJhbmdlID0gYXJnSW5mby5hcmdSYW5nZS51bmlvbihsYXN0QXJnSW5mby5zZXBhcmF0b3JSYW5nZSlcblxuICAgICAgICBhcmdTdGFydCA9IGFyZ0luZm8uYVJhbmdlLmVuZFxuICAgICAgICBhcmdJbmZvcy5wdXNoKGFyZ0luZm8pXG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbXVzdCBub3QgaGFwcGVuJylcblxuICAgIHBvaW50ID0gQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBmb3Ige2lubmVyUmFuZ2UsIGFSYW5nZX0gaW4gYXJnSW5mb3NcbiAgICAgIGlmIGlubmVyUmFuZ2UuZW5kLmlzR3JlYXRlclRoYW5PckVxdWFsKHBvaW50KVxuICAgICAgICByZXR1cm4gaWYgQGlzSW5uZXIoKSB0aGVuIGlubmVyUmFuZ2UgZWxzZSBhUmFuZ2VcbiAgICBudWxsXG5cbmNsYXNzIEN1cnJlbnRMaW5lIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICByb3cgPSBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3dcbiAgICByYW5nZSA9IEBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KVxuICAgIGlmIEBpc0EoKVxuICAgICAgcmFuZ2VcbiAgICBlbHNlXG4gICAgICB0cmltUmFuZ2UoQGVkaXRvciwgcmFuZ2UpXG5cbmNsYXNzIEVudGlyZSBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgc2VsZWN0T25jZTogdHJ1ZVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBlZGl0b3IuYnVmZmVyLmdldFJhbmdlKClcblxuY2xhc3MgRW1wdHkgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIHNlbGVjdE9uY2U6IHRydWVcblxuY2xhc3MgTGF0ZXN0Q2hhbmdlIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgd2lzZTogbnVsbFxuICBzZWxlY3RPbmNlOiB0cnVlXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHN0YXJ0ID0gQHZpbVN0YXRlLm1hcmsuZ2V0KCdbJylcbiAgICBlbmQgPSBAdmltU3RhdGUubWFyay5nZXQoJ10nKVxuICAgIGlmIHN0YXJ0PyBhbmQgZW5kP1xuICAgICAgbmV3IFJhbmdlKHN0YXJ0LCBlbmQpXG5cbmNsYXNzIFNlYXJjaE1hdGNoRm9yd2FyZCBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZCgpXG4gIGJhY2t3YXJkOiBmYWxzZVxuXG4gIGZpbmRNYXRjaDogKGZyb21Qb2ludCwgcGF0dGVybikgLT5cbiAgICBmcm9tUG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgZnJvbVBvaW50LCBcImZvcndhcmRcIikgaWYgKEBtb2RlIGlzICd2aXN1YWwnKVxuICAgIGZvdW5kID0gbnVsbFxuICAgIEBzY2FuRm9yd2FyZCBwYXR0ZXJuLCB7ZnJvbTogW2Zyb21Qb2ludC5yb3csIDBdfSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihmcm9tUG9pbnQpXG4gICAgICAgIGZvdW5kID0gcmFuZ2VcbiAgICAgICAgc3RvcCgpXG4gICAge3JhbmdlOiBmb3VuZCwgd2hpY2hJc0hlYWQ6ICdlbmQnfVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHBhdHRlcm4gPSBAZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0U2VhcmNoUGF0dGVybicpXG4gICAgcmV0dXJuIHVubGVzcyBwYXR0ZXJuP1xuXG4gICAgZnJvbVBvaW50ID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAge3JhbmdlLCB3aGljaElzSGVhZH0gPSBAZmluZE1hdGNoKGZyb21Qb2ludCwgcGF0dGVybilcbiAgICBpZiByYW5nZT9cbiAgICAgIEB1bmlvblJhbmdlQW5kRGV0ZXJtaW5lUmV2ZXJzZWRTdGF0ZShzZWxlY3Rpb24sIHJhbmdlLCB3aGljaElzSGVhZClcblxuICB1bmlvblJhbmdlQW5kRGV0ZXJtaW5lUmV2ZXJzZWRTdGF0ZTogKHNlbGVjdGlvbiwgZm91bmQsIHdoaWNoSXNIZWFkKSAtPlxuICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgIGZvdW5kXG4gICAgZWxzZVxuICAgICAgaGVhZCA9IGZvdW5kW3doaWNoSXNIZWFkXVxuICAgICAgdGFpbCA9IHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICBpZiBAYmFja3dhcmRcbiAgICAgICAgaGVhZCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBoZWFkLCAnZm9yd2FyZCcpIGlmIHRhaWwuaXNMZXNzVGhhbihoZWFkKVxuICAgICAgZWxzZVxuICAgICAgICBoZWFkID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBlZGl0b3IsIGhlYWQsICdiYWNrd2FyZCcpIGlmIGhlYWQuaXNMZXNzVGhhbih0YWlsKVxuXG4gICAgICBAcmV2ZXJzZWQgPSBoZWFkLmlzTGVzc1RoYW4odGFpbClcbiAgICAgIG5ldyBSYW5nZSh0YWlsLCBoZWFkKS51bmlvbihAc3dyYXAoc2VsZWN0aW9uKS5nZXRUYWlsQnVmZmVyUmFuZ2UoKSlcblxuICBzZWxlY3RUZXh0T2JqZWN0OiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIHJhbmdlID0gQGdldFJhbmdlKHNlbGVjdGlvbilcbiAgICAgIEBzd3JhcChzZWxlY3Rpb24pLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCB7cmV2ZXJzZWQ6IEByZXZlcnNlZCA/IEBiYWNrd2FyZH0pXG4gICAgICByZXR1cm4gdHJ1ZVxuXG5jbGFzcyBTZWFyY2hNYXRjaEJhY2t3YXJkIGV4dGVuZHMgU2VhcmNoTWF0Y2hGb3J3YXJkXG4gIEBleHRlbmQoKVxuICBiYWNrd2FyZDogdHJ1ZVxuXG4gIGZpbmRNYXRjaDogKGZyb21Qb2ludCwgcGF0dGVybikgLT5cbiAgICBmcm9tUG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgZnJvbVBvaW50LCBcImJhY2t3YXJkXCIpIGlmIChAbW9kZSBpcyAndmlzdWFsJylcbiAgICBmb3VuZCA9IG51bGxcbiAgICBAc2NhbkJhY2t3YXJkIHBhdHRlcm4sIHtmcm9tOiBbZnJvbVBvaW50LnJvdywgSW5maW5pdHldfSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICBpZiByYW5nZS5zdGFydC5pc0xlc3NUaGFuKGZyb21Qb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICB7cmFuZ2U6IGZvdW5kLCB3aGljaElzSGVhZDogJ3N0YXJ0J31cblxuIyBbTGltaXRhdGlvbjogd29uJ3QgZml4XTogU2VsZWN0ZWQgcmFuZ2UgaXMgbm90IHN1Ym1vZGUgYXdhcmUuIGFsd2F5cyBjaGFyYWN0ZXJ3aXNlLlxuIyBTbyBldmVuIGlmIG9yaWdpbmFsIHNlbGVjdGlvbiB3YXMgdkwgb3IgdkIsIHNlbGVjdGVkIHJhbmdlIGJ5IHRoaXMgdGV4dC1vYmplY3RcbiMgaXMgYWx3YXlzIHZDIHJhbmdlLlxuY2xhc3MgUHJldmlvdXNTZWxlY3Rpb24gZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoKVxuICB3aXNlOiBudWxsXG4gIHNlbGVjdE9uY2U6IHRydWVcblxuICBzZWxlY3RUZXh0T2JqZWN0OiAoc2VsZWN0aW9uKSAtPlxuICAgIHtwcm9wZXJ0aWVzLCBzdWJtb2RlfSA9IEB2aW1TdGF0ZS5wcmV2aW91c1NlbGVjdGlvblxuICAgIGlmIHByb3BlcnRpZXM/IGFuZCBzdWJtb2RlP1xuICAgICAgQHdpc2UgPSBzdWJtb2RlXG4gICAgICBAc3dyYXAoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpLnNlbGVjdEJ5UHJvcGVydGllcyhwcm9wZXJ0aWVzKVxuICAgICAgcmV0dXJuIHRydWVcblxuY2xhc3MgUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHdpc2U6IG51bGxcbiAgc2VsZWN0T25jZTogdHJ1ZVxuXG4gIHNlbGVjdFRleHRPYmplY3Q6IChzZWxlY3Rpb24pIC0+XG4gICAgaWYgQHZpbVN0YXRlLmhhc1BlcnNpc3RlbnRTZWxlY3Rpb25zKClcbiAgICAgIEB2aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKClcbiAgICAgIHJldHVybiB0cnVlXG5cbmNsYXNzIFZpc2libGVBcmVhIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgc2VsZWN0T25jZTogdHJ1ZVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgICMgW0JVRz9dIE5lZWQgdHJhbnNsYXRlIHRvIHNoaWxuayB0b3AgYW5kIGJvdHRvbSB0byBmaXQgYWN0dWFsIHJvdy5cbiAgICAjIFRoZSByZWFzb24gSSBuZWVkIC0yIGF0IGJvdHRvbSBpcyBiZWNhdXNlIG9mIHN0YXR1cyBiYXI/XG4gICAgYnVmZmVyUmFuZ2UgPSBnZXRWaXNpYmxlQnVmZmVyUmFuZ2UoQGVkaXRvcilcbiAgICBpZiBidWZmZXJSYW5nZS5nZXRSb3dzKCkgPiBAZWRpdG9yLmdldFJvd3NQZXJQYWdlKClcbiAgICAgIGJ1ZmZlclJhbmdlLnRyYW5zbGF0ZShbKzEsIDBdLCBbLTMsIDBdKVxuICAgIGVsc2VcbiAgICAgIGJ1ZmZlclJhbmdlXG4iXX0=
