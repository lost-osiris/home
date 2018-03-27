(function() {
  var BracketFinder, PairFinder, QuoteFinder, Range, ScopeState, TagFinder, _, collectRangeInBufferRow, getCharacterRangeInformation, getLineTextToBufferPosition, isEscapedCharRange, ref, scanEditorInDirection,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Range = require('atom').Range;

  _ = require('underscore-plus');

  ref = require('./utils'), isEscapedCharRange = ref.isEscapedCharRange, collectRangeInBufferRow = ref.collectRangeInBufferRow, scanEditorInDirection = ref.scanEditorInDirection, getLineTextToBufferPosition = ref.getLineTextToBufferPosition;

  getCharacterRangeInformation = function(editor, point, char) {
    var balanced, left, pattern, ref1, right, total;
    pattern = RegExp("" + (_.escapeRegExp(char)), "g");
    total = collectRangeInBufferRow(editor, point.row, pattern).filter(function(range) {
      return !isEscapedCharRange(editor, range);
    });
    ref1 = _.partition(total, function(arg) {
      var start;
      start = arg.start;
      return start.isLessThan(point);
    }), left = ref1[0], right = ref1[1];
    balanced = (total.length % 2) === 0;
    return {
      total: total,
      left: left,
      right: right,
      balanced: balanced
    };
  };

  ScopeState = (function() {
    function ScopeState(editor1, point) {
      this.editor = editor1;
      this.state = this.getScopeStateForBufferPosition(point);
    }

    ScopeState.prototype.getScopeStateForBufferPosition = function(point) {
      var scopes;
      scopes = this.editor.scopeDescriptorForBufferPosition(point).getScopesArray();
      return {
        inString: scopes.some(function(scope) {
          return scope.startsWith('string.');
        }),
        inComment: scopes.some(function(scope) {
          return scope.startsWith('comment.');
        }),
        inDoubleQuotes: this.isInDoubleQuotes(point)
      };
    };

    ScopeState.prototype.isInDoubleQuotes = function(point) {
      var balanced, left, ref1, total;
      ref1 = getCharacterRangeInformation(this.editor, point, '"'), total = ref1.total, left = ref1.left, balanced = ref1.balanced;
      if (total.length === 0 || !balanced) {
        return false;
      } else {
        return left.length % 2 === 1;
      }
    };

    ScopeState.prototype.isEqual = function(other) {
      return _.isEqual(this.state, other.state);
    };

    ScopeState.prototype.isInNormalCodeArea = function() {
      return !(this.state.inString || this.state.inComment || this.state.inDoubleQuotes);
    };

    return ScopeState;

  })();

  PairFinder = (function() {
    function PairFinder(editor1, options) {
      this.editor = editor1;
      if (options == null) {
        options = {};
      }
      this.allowNextLine = options.allowNextLine, this.allowForwarding = options.allowForwarding, this.pair = options.pair, this.inclusive = options.inclusive;
      if (this.inclusive == null) {
        this.inclusive = true;
      }
      if (this.pair != null) {
        this.setPatternForPair(this.pair);
      }
    }

    PairFinder.prototype.getPattern = function() {
      return this.pattern;
    };

    PairFinder.prototype.filterEvent = function() {
      return true;
    };

    PairFinder.prototype.findPair = function(which, direction, from) {
      var findingNonForwardingClosingQuote, found, scanner, stack;
      stack = [];
      found = null;
      findingNonForwardingClosingQuote = (this instanceof QuoteFinder) && which === 'close' && !this.allowForwarding;
      scanner = scanEditorInDirection.bind(null, this.editor, direction, this.getPattern(), {
        from: from,
        allowNextLine: this.allowNextLine
      });
      scanner((function(_this) {
        return function(event) {
          var eventState, range, stop;
          range = event.range, stop = event.stop;
          if (isEscapedCharRange(_this.editor, range)) {
            return;
          }
          if (!_this.filterEvent(event)) {
            return;
          }
          eventState = _this.getEventState(event);
          if (findingNonForwardingClosingQuote && eventState.state === 'open' && range.start.isGreaterThan(from)) {
            stop();
            return;
          }
          if (eventState.state !== which) {
            return stack.push(eventState);
          } else {
            if (_this.onFound(stack, {
              eventState: eventState,
              from: from
            })) {
              found = range;
              return stop();
            }
          }
        };
      })(this));
      return found;
    };

    PairFinder.prototype.spliceStack = function(stack, eventState) {
      return stack.pop();
    };

    PairFinder.prototype.onFound = function(stack, arg) {
      var eventState, from, openRange, openStart, openState;
      eventState = arg.eventState, from = arg.from;
      switch (eventState.state) {
        case 'open':
          this.spliceStack(stack, eventState);
          return stack.length === 0;
        case 'close':
          openState = this.spliceStack(stack, eventState);
          if (openState == null) {
            return this.inclusive || eventState.range.start.isGreaterThan(from);
          }
          if (stack.length === 0) {
            openRange = openState.range;
            openStart = openRange.start;
            if (this.inclusive) {
              return openStart.isEqual(from) || (this.allowForwarding && openStart.row === from.row);
            } else {
              return openStart.isLessThan(from) || (this.allowForwarding && openStart.isGreaterThan(from) && openStart.row === from.row);
            }
          }
      }
    };

    PairFinder.prototype.findCloseForward = function(from) {
      return this.findPair('close', 'forward', from);
    };

    PairFinder.prototype.findOpenBackward = function(from) {
      return this.findPair('open', 'backward', from);
    };

    PairFinder.prototype.find = function(from) {
      var closeRange, openRange;
      closeRange = this.closeRange = this.findCloseForward(from);
      if (closeRange != null) {
        openRange = this.findOpenBackward(closeRange.end);
      }
      if ((closeRange != null) && (openRange != null)) {
        return {
          aRange: new Range(openRange.start, closeRange.end),
          innerRange: new Range(openRange.end, closeRange.start),
          openRange: openRange,
          closeRange: closeRange
        };
      }
    };

    return PairFinder;

  })();

  BracketFinder = (function(superClass) {
    extend(BracketFinder, superClass);

    function BracketFinder() {
      return BracketFinder.__super__.constructor.apply(this, arguments);
    }

    BracketFinder.prototype.retry = false;

    BracketFinder.prototype.setPatternForPair = function(pair) {
      var close, open;
      open = pair[0], close = pair[1];
      return this.pattern = RegExp("(" + (_.escapeRegExp(open)) + ")|(" + (_.escapeRegExp(close)) + ")", "g");
    };

    BracketFinder.prototype.find = function(from) {
      var found, ref1;
      if (this.initialScope == null) {
        this.initialScope = new ScopeState(this.editor, from);
      }
      if (found = BracketFinder.__super__.find.apply(this, arguments)) {
        return found;
      }
      if (!this.retry) {
        this.retry = true;
        ref1 = [], this.closeRange = ref1[0], this.closeRangeScope = ref1[1];
        return this.find(from);
      }
    };

    BracketFinder.prototype.filterEvent = function(arg) {
      var range, scope;
      range = arg.range;
      scope = new ScopeState(this.editor, range.start);
      if (!this.closeRange) {
        if (!this.retry) {
          return this.initialScope.isEqual(scope);
        } else {
          if (this.initialScope.isInNormalCodeArea()) {
            return !scope.isInNormalCodeArea();
          } else {
            return scope.isInNormalCodeArea();
          }
        }
      } else {
        if (this.closeRangeScope == null) {
          this.closeRangeScope = new ScopeState(this.editor, this.closeRange.start);
        }
        return this.closeRangeScope.isEqual(scope);
      }
    };

    BracketFinder.prototype.getEventState = function(arg) {
      var match, range, state;
      match = arg.match, range = arg.range;
      state = (function() {
        switch (false) {
          case !match[1]:
            return 'open';
          case !match[2]:
            return 'close';
        }
      })();
      return {
        state: state,
        range: range
      };
    };

    return BracketFinder;

  })(PairFinder);

  QuoteFinder = (function(superClass) {
    extend(QuoteFinder, superClass);

    function QuoteFinder() {
      return QuoteFinder.__super__.constructor.apply(this, arguments);
    }

    QuoteFinder.prototype.setPatternForPair = function(pair) {
      this.quoteChar = pair[0];
      return this.pattern = RegExp("(" + (_.escapeRegExp(pair[0])) + ")", "g");
    };

    QuoteFinder.prototype.find = function(from) {
      var balanced, left, nextQuoteIsOpen, onQuoteChar, ref1, ref2, right, total;
      ref1 = getCharacterRangeInformation(this.editor, from, this.quoteChar), total = ref1.total, left = ref1.left, right = ref1.right, balanced = ref1.balanced;
      onQuoteChar = (ref2 = right[0]) != null ? ref2.start.isEqual(from) : void 0;
      if (balanced && onQuoteChar) {
        nextQuoteIsOpen = left.length % 2 === 0;
      } else {
        nextQuoteIsOpen = left.length === 0;
      }
      if (nextQuoteIsOpen) {
        this.pairStates = ['open', 'close', 'close', 'open'];
      } else {
        this.pairStates = ['close', 'close', 'open'];
      }
      return QuoteFinder.__super__.find.apply(this, arguments);
    };

    QuoteFinder.prototype.getEventState = function(arg) {
      var range, state;
      range = arg.range;
      state = this.pairStates.shift();
      return {
        state: state,
        range: range
      };
    };

    return QuoteFinder;

  })(PairFinder);

  TagFinder = (function(superClass) {
    extend(TagFinder, superClass);

    function TagFinder() {
      return TagFinder.__super__.constructor.apply(this, arguments);
    }

    TagFinder.prototype.pattern = /<(\/?)([^\s>]+)[^>]*>/g;

    TagFinder.prototype.lineTextToPointContainsNonWhiteSpace = function(point) {
      return /\S/.test(getLineTextToBufferPosition(this.editor, point));
    };

    TagFinder.prototype.find = function(from) {
      var found, tagStart;
      found = TagFinder.__super__.find.apply(this, arguments);
      if ((found != null) && this.allowForwarding) {
        tagStart = found.aRange.start;
        if (tagStart.isGreaterThan(from) && this.lineTextToPointContainsNonWhiteSpace(tagStart)) {
          this.allowForwarding = false;
          return this.find(from);
        }
      }
      return found;
    };

    TagFinder.prototype.getEventState = function(event) {
      var backslash;
      backslash = event.match[1];
      return {
        state: backslash === '' ? 'open' : 'close',
        name: event.match[2],
        range: event.range
      };
    };

    TagFinder.prototype.findPairState = function(stack, arg) {
      var i, name, state;
      name = arg.name;
      for (i = stack.length - 1; i >= 0; i += -1) {
        state = stack[i];
        if (state.name === name) {
          return state;
        }
      }
    };

    TagFinder.prototype.spliceStack = function(stack, eventState) {
      var pairEventState;
      if (pairEventState = this.findPairState(stack, eventState)) {
        stack.splice(stack.indexOf(pairEventState));
      }
      return pairEventState;
    };

    return TagFinder;

  })(PairFinder);

  module.exports = {
    BracketFinder: BracketFinder,
    QuoteFinder: QuoteFinder,
    TagFinder: TagFinder
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3BhaXItZmluZGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMk1BQUE7SUFBQTs7O0VBQUMsUUFBUyxPQUFBLENBQVEsTUFBUjs7RUFDVixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BS0ksT0FBQSxDQUFRLFNBQVIsQ0FMSixFQUNFLDJDQURGLEVBRUUscURBRkYsRUFHRSxpREFIRixFQUlFOztFQUdGLDRCQUFBLEdBQStCLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsSUFBaEI7QUFDN0IsUUFBQTtJQUFBLE9BQUEsR0FBVSxNQUFBLENBQUEsRUFBQSxHQUFJLENBQUMsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxJQUFmLENBQUQsQ0FBSixFQUE2QixHQUE3QjtJQUNWLEtBQUEsR0FBUSx1QkFBQSxDQUF3QixNQUF4QixFQUFnQyxLQUFLLENBQUMsR0FBdEMsRUFBMkMsT0FBM0MsQ0FBbUQsQ0FBQyxNQUFwRCxDQUEyRCxTQUFDLEtBQUQ7YUFDakUsQ0FBSSxrQkFBQSxDQUFtQixNQUFuQixFQUEyQixLQUEzQjtJQUQ2RCxDQUEzRDtJQUVSLE9BQWdCLENBQUMsQ0FBQyxTQUFGLENBQVksS0FBWixFQUFtQixTQUFDLEdBQUQ7QUFBYSxVQUFBO01BQVgsUUFBRDthQUFZLEtBQUssQ0FBQyxVQUFOLENBQWlCLEtBQWpCO0lBQWIsQ0FBbkIsQ0FBaEIsRUFBQyxjQUFELEVBQU87SUFDUCxRQUFBLEdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTixHQUFlLENBQWhCLENBQUEsS0FBc0I7V0FDakM7TUFBQyxPQUFBLEtBQUQ7TUFBUSxNQUFBLElBQVI7TUFBYyxPQUFBLEtBQWQ7TUFBcUIsVUFBQSxRQUFyQjs7RUFONkI7O0VBUXpCO0lBQ1Msb0JBQUMsT0FBRCxFQUFVLEtBQVY7TUFB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QUFDLEtBQU0sQ0FBQSxDQUFBO2FBQ3hCO1FBQ0UsS0FBQSxFQUFXLFNBQUEsS0FBYSxFQUFqQixHQUEwQixNQUExQixHQUFzQyxPQUQvQztRQUVFLElBQUEsRUFBTSxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FGcEI7UUFHRSxLQUFBLEVBQU8sS0FBSyxDQUFDLEtBSGY7O0lBRmE7O3dCQVFmLGFBQUEsR0FBZSxTQUFDLEtBQUQsRUFBUSxHQUFSO0FBQ2IsVUFBQTtNQURzQixPQUFEO0FBQ3JCLFdBQUEscUNBQUE7O1lBQThCLEtBQUssQ0FBQyxJQUFOLEtBQWM7QUFDMUMsaUJBQU87O0FBRFQ7SUFEYTs7d0JBSWYsV0FBQSxHQUFhLFNBQUMsS0FBRCxFQUFRLFVBQVI7QUFDWCxVQUFBO01BQUEsSUFBRyxjQUFBLEdBQWlCLElBQUMsQ0FBQSxhQUFELENBQWUsS0FBZixFQUFzQixVQUF0QixDQUFwQjtRQUNFLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxjQUFkLENBQWIsRUFERjs7YUFFQTtJQUhXOzs7O0tBN0JTOztFQWtDeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFDZixlQUFBLGFBRGU7SUFFZixhQUFBLFdBRmU7SUFHZixXQUFBLFNBSGU7O0FBL05qQiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntcbiAgaXNFc2NhcGVkQ2hhclJhbmdlXG4gIGNvbGxlY3RSYW5nZUluQnVmZmVyUm93XG4gIHNjYW5FZGl0b3JJbkRpcmVjdGlvblxuICBnZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb25cbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5nZXRDaGFyYWN0ZXJSYW5nZUluZm9ybWF0aW9uID0gKGVkaXRvciwgcG9pbnQsIGNoYXIpIC0+XG4gIHBhdHRlcm4gPSAvLy8je18uZXNjYXBlUmVnRXhwKGNoYXIpfS8vL2dcbiAgdG90YWwgPSBjb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvdyhlZGl0b3IsIHBvaW50LnJvdywgcGF0dGVybikuZmlsdGVyIChyYW5nZSkgLT5cbiAgICBub3QgaXNFc2NhcGVkQ2hhclJhbmdlKGVkaXRvciwgcmFuZ2UpXG4gIFtsZWZ0LCByaWdodF0gPSBfLnBhcnRpdGlvbih0b3RhbCwgKHtzdGFydH0pIC0+IHN0YXJ0LmlzTGVzc1RoYW4ocG9pbnQpKVxuICBiYWxhbmNlZCA9ICh0b3RhbC5sZW5ndGggJSAyKSBpcyAwXG4gIHt0b3RhbCwgbGVmdCwgcmlnaHQsIGJhbGFuY2VkfVxuXG5jbGFzcyBTY29wZVN0YXRlXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgcG9pbnQpIC0+XG4gICAgQHN0YXRlID0gQGdldFNjb3BlU3RhdGVGb3JCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBnZXRTY29wZVN0YXRlRm9yQnVmZmVyUG9zaXRpb246IChwb2ludCkgLT5cbiAgICBzY29wZXMgPSBAZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKHBvaW50KS5nZXRTY29wZXNBcnJheSgpXG4gICAge1xuICAgICAgaW5TdHJpbmc6IHNjb3Blcy5zb21lIChzY29wZSkgLT4gc2NvcGUuc3RhcnRzV2l0aCgnc3RyaW5nLicpXG4gICAgICBpbkNvbW1lbnQ6IHNjb3Blcy5zb21lIChzY29wZSkgLT4gc2NvcGUuc3RhcnRzV2l0aCgnY29tbWVudC4nKVxuICAgICAgaW5Eb3VibGVRdW90ZXM6IEBpc0luRG91YmxlUXVvdGVzKHBvaW50KVxuICAgIH1cblxuICBpc0luRG91YmxlUXVvdGVzOiAocG9pbnQpIC0+XG4gICAge3RvdGFsLCBsZWZ0LCBiYWxhbmNlZH0gPSBnZXRDaGFyYWN0ZXJSYW5nZUluZm9ybWF0aW9uKEBlZGl0b3IsIHBvaW50LCAnXCInKVxuICAgIGlmIHRvdGFsLmxlbmd0aCBpcyAwIG9yIG5vdCBiYWxhbmNlZFxuICAgICAgZmFsc2VcbiAgICBlbHNlXG4gICAgICBsZWZ0Lmxlbmd0aCAlIDIgaXMgMVxuXG4gIGlzRXF1YWw6IChvdGhlcikgLT5cbiAgICBfLmlzRXF1YWwoQHN0YXRlLCBvdGhlci5zdGF0ZSlcblxuICBpc0luTm9ybWFsQ29kZUFyZWE6IC0+XG4gICAgbm90IChAc3RhdGUuaW5TdHJpbmcgb3IgQHN0YXRlLmluQ29tbWVudCBvciBAc3RhdGUuaW5Eb3VibGVRdW90ZXMpXG5cbmNsYXNzIFBhaXJGaW5kZXJcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBvcHRpb25zPXt9KSAtPlxuICAgIHtAYWxsb3dOZXh0TGluZSwgQGFsbG93Rm9yd2FyZGluZywgQHBhaXIsIEBpbmNsdXNpdmV9ID0gb3B0aW9uc1xuICAgIEBpbmNsdXNpdmUgPz0gdHJ1ZVxuICAgIGlmIEBwYWlyP1xuICAgICAgQHNldFBhdHRlcm5Gb3JQYWlyKEBwYWlyKVxuXG4gIGdldFBhdHRlcm46IC0+XG4gICAgQHBhdHRlcm5cblxuICBmaWx0ZXJFdmVudDogLT5cbiAgICB0cnVlXG5cbiAgZmluZFBhaXI6ICh3aGljaCwgZGlyZWN0aW9uLCBmcm9tKSAtPlxuICAgIHN0YWNrID0gW11cbiAgICBmb3VuZCA9IG51bGxcblxuICAgICMgUXVvdGUgaXMgbm90IG5lc3RhYmxlLiBTbyB3aGVuIHdlIGVuY291bnRlciAnb3Blbicgd2hpbGUgZmluZGluZyAnY2xvc2UnLFxuICAgICMgaXQgaXMgZm9yd2FyZGluZyBwYWlyLCBzbyBzdG9wcGFibGUgdW5sZXNzIEBhbGxvd0ZvcndhcmRpbmdcbiAgICBmaW5kaW5nTm9uRm9yd2FyZGluZ0Nsb3NpbmdRdW90ZSA9ICh0aGlzIGluc3RhbmNlb2YgUXVvdGVGaW5kZXIpIGFuZCB3aGljaCBpcyAnY2xvc2UnIGFuZCBub3QgQGFsbG93Rm9yd2FyZGluZ1xuICAgIHNjYW5uZXIgPSBzY2FuRWRpdG9ySW5EaXJlY3Rpb24uYmluZChudWxsLCBAZWRpdG9yLCBkaXJlY3Rpb24sIEBnZXRQYXR0ZXJuKCksIHtmcm9tLCBAYWxsb3dOZXh0TGluZX0pXG4gICAgc2Nhbm5lciAoZXZlbnQpID0+XG4gICAgICB7cmFuZ2UsIHN0b3B9ID0gZXZlbnRcblxuICAgICAgcmV0dXJuIGlmIGlzRXNjYXBlZENoYXJSYW5nZShAZWRpdG9yLCByYW5nZSlcbiAgICAgIHJldHVybiB1bmxlc3MgQGZpbHRlckV2ZW50KGV2ZW50KVxuXG4gICAgICBldmVudFN0YXRlID0gQGdldEV2ZW50U3RhdGUoZXZlbnQpXG5cbiAgICAgIGlmIGZpbmRpbmdOb25Gb3J3YXJkaW5nQ2xvc2luZ1F1b3RlIGFuZCBldmVudFN0YXRlLnN0YXRlIGlzICdvcGVuJyBhbmQgcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tKVxuICAgICAgICBzdG9wKClcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGlmIGV2ZW50U3RhdGUuc3RhdGUgaXNudCB3aGljaFxuICAgICAgICBzdGFjay5wdXNoKGV2ZW50U3RhdGUpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIEBvbkZvdW5kKHN0YWNrLCB7ZXZlbnRTdGF0ZSwgZnJvbX0pXG4gICAgICAgICAgZm91bmQgPSByYW5nZVxuICAgICAgICAgIHN0b3AoKVxuXG4gICAgcmV0dXJuIGZvdW5kXG5cbiAgc3BsaWNlU3RhY2s6IChzdGFjaywgZXZlbnRTdGF0ZSkgLT5cbiAgICBzdGFjay5wb3AoKVxuXG4gIG9uRm91bmQ6IChzdGFjaywge2V2ZW50U3RhdGUsIGZyb219KSAtPlxuICAgIHN3aXRjaCBldmVudFN0YXRlLnN0YXRlXG4gICAgICB3aGVuICdvcGVuJ1xuICAgICAgICBAc3BsaWNlU3RhY2soc3RhY2ssIGV2ZW50U3RhdGUpXG4gICAgICAgIHN0YWNrLmxlbmd0aCBpcyAwXG4gICAgICB3aGVuICdjbG9zZSdcbiAgICAgICAgb3BlblN0YXRlID0gQHNwbGljZVN0YWNrKHN0YWNrLCBldmVudFN0YXRlKVxuICAgICAgICB1bmxlc3Mgb3BlblN0YXRlP1xuICAgICAgICAgIHJldHVybiBAaW5jbHVzaXZlIG9yIGV2ZW50U3RhdGUucmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tKVxuXG4gICAgICAgIGlmIHN0YWNrLmxlbmd0aCBpcyAwXG4gICAgICAgICAgb3BlblJhbmdlID0gb3BlblN0YXRlLnJhbmdlXG4gICAgICAgICAgb3BlblN0YXJ0ID0gb3BlblJhbmdlLnN0YXJ0XG4gICAgICAgICAgaWYgQGluY2x1c2l2ZVxuICAgICAgICAgICAgb3BlblN0YXJ0LmlzRXF1YWwoZnJvbSkgb3IgKEBhbGxvd0ZvcndhcmRpbmcgYW5kIG9wZW5TdGFydC5yb3cgaXMgZnJvbS5yb3cpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3BlblN0YXJ0LmlzTGVzc1RoYW4oZnJvbSkgb3IgKEBhbGxvd0ZvcndhcmRpbmcgYW5kIG9wZW5TdGFydC5pc0dyZWF0ZXJUaGFuKGZyb20pIGFuZCBvcGVuU3RhcnQucm93IGlzIGZyb20ucm93KVxuXG4gIGZpbmRDbG9zZUZvcndhcmQ6IChmcm9tKSAtPlxuICAgIEBmaW5kUGFpcignY2xvc2UnLCAnZm9yd2FyZCcsIGZyb20pXG5cbiAgZmluZE9wZW5CYWNrd2FyZDogKGZyb20pIC0+XG4gICAgQGZpbmRQYWlyKCdvcGVuJywgJ2JhY2t3YXJkJywgZnJvbSlcblxuICBmaW5kOiAoZnJvbSkgLT5cbiAgICBjbG9zZVJhbmdlID0gQGNsb3NlUmFuZ2UgPSBAZmluZENsb3NlRm9yd2FyZChmcm9tKVxuICAgIG9wZW5SYW5nZSA9IEBmaW5kT3BlbkJhY2t3YXJkKGNsb3NlUmFuZ2UuZW5kKSBpZiBjbG9zZVJhbmdlP1xuXG4gICAgaWYgY2xvc2VSYW5nZT8gYW5kIG9wZW5SYW5nZT9cbiAgICAgIHtcbiAgICAgICAgYVJhbmdlOiBuZXcgUmFuZ2Uob3BlblJhbmdlLnN0YXJ0LCBjbG9zZVJhbmdlLmVuZClcbiAgICAgICAgaW5uZXJSYW5nZTogbmV3IFJhbmdlKG9wZW5SYW5nZS5lbmQsIGNsb3NlUmFuZ2Uuc3RhcnQpXG4gICAgICAgIG9wZW5SYW5nZTogb3BlblJhbmdlXG4gICAgICAgIGNsb3NlUmFuZ2U6IGNsb3NlUmFuZ2VcbiAgICAgIH1cblxuY2xhc3MgQnJhY2tldEZpbmRlciBleHRlbmRzIFBhaXJGaW5kZXJcbiAgcmV0cnk6IGZhbHNlXG5cbiAgc2V0UGF0dGVybkZvclBhaXI6IChwYWlyKSAtPlxuICAgIFtvcGVuLCBjbG9zZV0gPSBwYWlyXG4gICAgQHBhdHRlcm4gPSAvLy8oI3tfLmVzY2FwZVJlZ0V4cChvcGVuKX0pfCgje18uZXNjYXBlUmVnRXhwKGNsb3NlKX0pLy8vZ1xuXG4gICMgVGhpcyBtZXRob2QgY2FuIGJlIGNhbGxlZCByZWN1cnNpdmVseVxuICBmaW5kOiAoZnJvbSkgLT5cbiAgICBAaW5pdGlhbFNjb3BlID89IG5ldyBTY29wZVN0YXRlKEBlZGl0b3IsIGZyb20pXG5cbiAgICByZXR1cm4gZm91bmQgaWYgZm91bmQgPSBzdXBlclxuXG4gICAgaWYgbm90IEByZXRyeVxuICAgICAgQHJldHJ5ID0gdHJ1ZVxuICAgICAgW0BjbG9zZVJhbmdlLCBAY2xvc2VSYW5nZVNjb3BlXSA9IFtdXG4gICAgICBAZmluZChmcm9tKVxuXG4gIGZpbHRlckV2ZW50OiAoe3JhbmdlfSkgLT5cbiAgICBzY29wZSA9IG5ldyBTY29wZVN0YXRlKEBlZGl0b3IsIHJhbmdlLnN0YXJ0KVxuICAgIGlmIG5vdCBAY2xvc2VSYW5nZVxuICAgICAgIyBOb3cgZmluZGluZyBjbG9zZVJhbmdlXG4gICAgICBpZiBub3QgQHJldHJ5XG4gICAgICAgIEBpbml0aWFsU2NvcGUuaXNFcXVhbChzY29wZSlcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgQGluaXRpYWxTY29wZS5pc0luTm9ybWFsQ29kZUFyZWEoKVxuICAgICAgICAgIG5vdCBzY29wZS5pc0luTm9ybWFsQ29kZUFyZWEoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgc2NvcGUuaXNJbk5vcm1hbENvZGVBcmVhKClcbiAgICBlbHNlXG4gICAgICAjIE5vdyBmaW5kaW5nIG9wZW5SYW5nZTogc2VhcmNoIGZyb20gc2FtZSBzY29wZVxuICAgICAgQGNsb3NlUmFuZ2VTY29wZSA/PSBuZXcgU2NvcGVTdGF0ZShAZWRpdG9yLCBAY2xvc2VSYW5nZS5zdGFydClcbiAgICAgIEBjbG9zZVJhbmdlU2NvcGUuaXNFcXVhbChzY29wZSlcblxuICBnZXRFdmVudFN0YXRlOiAoe21hdGNoLCByYW5nZX0pIC0+XG4gICAgc3RhdGUgPSBzd2l0Y2hcbiAgICAgIHdoZW4gbWF0Y2hbMV0gdGhlbiAnb3BlbidcbiAgICAgIHdoZW4gbWF0Y2hbMl0gdGhlbiAnY2xvc2UnXG4gICAge3N0YXRlLCByYW5nZX1cblxuY2xhc3MgUXVvdGVGaW5kZXIgZXh0ZW5kcyBQYWlyRmluZGVyXG4gIHNldFBhdHRlcm5Gb3JQYWlyOiAocGFpcikgLT5cbiAgICBAcXVvdGVDaGFyID0gcGFpclswXVxuICAgIEBwYXR0ZXJuID0gLy8vKCN7Xy5lc2NhcGVSZWdFeHAocGFpclswXSl9KS8vL2dcblxuICBmaW5kOiAoZnJvbSkgLT5cbiAgICAjIEhBQ0s6IENhbnQgZGV0ZXJtaW5lIG9wZW4vY2xvc2UgZnJvbSBxdW90ZSBjaGFyIGl0c2VsZlxuICAgICMgU28gcHJlc2V0IG9wZW4vY2xvc2Ugc3RhdGUgdG8gZ2V0IGRlc2lhYmxlIHJlc3VsdC5cbiAgICB7dG90YWwsIGxlZnQsIHJpZ2h0LCBiYWxhbmNlZH0gPSBnZXRDaGFyYWN0ZXJSYW5nZUluZm9ybWF0aW9uKEBlZGl0b3IsIGZyb20sIEBxdW90ZUNoYXIpXG4gICAgb25RdW90ZUNoYXIgPSByaWdodFswXT8uc3RhcnQuaXNFcXVhbChmcm9tKSAjIGZyb20gcG9pbnQgaXMgb24gcXVvdGUgY2hhclxuICAgIGlmIGJhbGFuY2VkIGFuZCBvblF1b3RlQ2hhclxuICAgICAgbmV4dFF1b3RlSXNPcGVuID0gbGVmdC5sZW5ndGggJSAyIGlzIDBcbiAgICBlbHNlXG4gICAgICBuZXh0UXVvdGVJc09wZW4gPSBsZWZ0Lmxlbmd0aCBpcyAwXG5cbiAgICBpZiBuZXh0UXVvdGVJc09wZW5cbiAgICAgIEBwYWlyU3RhdGVzID0gWydvcGVuJywgJ2Nsb3NlJywgJ2Nsb3NlJywgJ29wZW4nXVxuICAgIGVsc2VcbiAgICAgIEBwYWlyU3RhdGVzID0gWydjbG9zZScsICdjbG9zZScsICdvcGVuJ11cblxuICAgIHN1cGVyXG5cbiAgZ2V0RXZlbnRTdGF0ZTogKHtyYW5nZX0pIC0+XG4gICAgc3RhdGUgPSBAcGFpclN0YXRlcy5zaGlmdCgpXG4gICAge3N0YXRlLCByYW5nZX1cblxuY2xhc3MgVGFnRmluZGVyIGV4dGVuZHMgUGFpckZpbmRlclxuICBwYXR0ZXJuOiAvPChcXC8/KShbXlxccz5dKylbXj5dKj4vZ1xuXG4gIGxpbmVUZXh0VG9Qb2ludENvbnRhaW5zTm9uV2hpdGVTcGFjZTogKHBvaW50KSAtPlxuICAgIC9cXFMvLnRlc3QoZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIHBvaW50KSlcblxuICBmaW5kOiAoZnJvbSkgLT5cbiAgICBmb3VuZCA9IHN1cGVyXG4gICAgaWYgZm91bmQ/IGFuZCBAYWxsb3dGb3J3YXJkaW5nXG4gICAgICB0YWdTdGFydCA9IGZvdW5kLmFSYW5nZS5zdGFydFxuICAgICAgaWYgdGFnU3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tKSBhbmQgQGxpbmVUZXh0VG9Qb2ludENvbnRhaW5zTm9uV2hpdGVTcGFjZSh0YWdTdGFydClcbiAgICAgICAgIyBXZSBmb3VuZCByYW5nZSBidXQgYWxzbyBmb3VuZCB0aGF0IHdlIGFyZSBJTiBhbm90aGVyIHRhZyxcbiAgICAgICAgIyBzbyB3aWxsIHJldHJ5IGJ5IGV4Y2x1ZGluZyBmb3J3YXJkaW5nIHJhbmdlLlxuICAgICAgICBAYWxsb3dGb3J3YXJkaW5nID0gZmFsc2VcbiAgICAgICAgcmV0dXJuIEBmaW5kKGZyb20pICMgcmV0cnlcbiAgICBmb3VuZFxuXG4gIGdldEV2ZW50U3RhdGU6IChldmVudCkgLT5cbiAgICBiYWNrc2xhc2ggPSBldmVudC5tYXRjaFsxXVxuICAgIHtcbiAgICAgIHN0YXRlOiBpZiAoYmFja3NsYXNoIGlzICcnKSB0aGVuICdvcGVuJyBlbHNlICdjbG9zZSdcbiAgICAgIG5hbWU6IGV2ZW50Lm1hdGNoWzJdXG4gICAgICByYW5nZTogZXZlbnQucmFuZ2VcbiAgICB9XG5cbiAgZmluZFBhaXJTdGF0ZTogKHN0YWNrLCB7bmFtZX0pIC0+XG4gICAgZm9yIHN0YXRlIGluIHN0YWNrIGJ5IC0xIHdoZW4gc3RhdGUubmFtZSBpcyBuYW1lXG4gICAgICByZXR1cm4gc3RhdGVcblxuICBzcGxpY2VTdGFjazogKHN0YWNrLCBldmVudFN0YXRlKSAtPlxuICAgIGlmIHBhaXJFdmVudFN0YXRlID0gQGZpbmRQYWlyU3RhdGUoc3RhY2ssIGV2ZW50U3RhdGUpXG4gICAgICBzdGFjay5zcGxpY2Uoc3RhY2suaW5kZXhPZihwYWlyRXZlbnRTdGF0ZSkpXG4gICAgcGFpckV2ZW50U3RhdGVcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEJyYWNrZXRGaW5kZXJcbiAgUXVvdGVGaW5kZXJcbiAgVGFnRmluZGVyXG59XG4iXX0=
