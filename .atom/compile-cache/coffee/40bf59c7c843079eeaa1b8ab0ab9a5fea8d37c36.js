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
      this.allowNextLine = options.allowNextLine, this.allowForwarding = options.allowForwarding, this.pair = options.pair;
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
      var eventState, from, openRange, openState;
      eventState = arg.eventState, from = arg.from;
      switch (eventState.state) {
        case 'open':
          this.spliceStack(stack, eventState);
          return stack.length === 0;
        case 'close':
          openState = this.spliceStack(stack, eventState);
          if (openState == null) {
            return true;
          }
          if (stack.length === 0) {
            openRange = openState.range;
            return openRange.start.isEqual(from) || (this.allowForwarding && openRange.start.row === from.row);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3BhaXItZmluZGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMk1BQUE7SUFBQTs7O0VBQUMsUUFBUyxPQUFBLENBQVEsTUFBUjs7RUFDVixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BS0ksT0FBQSxDQUFRLFNBQVIsQ0FMSixFQUNFLDJDQURGLEVBRUUscURBRkYsRUFHRSxpREFIRixFQUlFOztFQUdGLDRCQUFBLEdBQStCLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsSUFBaEI7QUFDN0IsUUFBQTtJQUFBLE9BQUEsR0FBVSxNQUFBLENBQUEsRUFBQSxHQUFJLENBQUMsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxJQUFmLENBQUQsQ0FBSixFQUE2QixHQUE3QjtJQUNWLEtBQUEsR0FBUSx1QkFBQSxDQUF3QixNQUF4QixFQUFnQyxLQUFLLENBQUMsR0FBdEMsRUFBMkMsT0FBM0MsQ0FBbUQsQ0FBQyxNQUFwRCxDQUEyRCxTQUFDLEtBQUQ7YUFDakUsQ0FBSSxrQkFBQSxDQUFtQixNQUFuQixFQUEyQixLQUEzQjtJQUQ2RCxDQUEzRDtJQUVSLE9BQWdCLENBQUMsQ0FBQyxTQUFGLENBQVksS0FBWixFQUFtQixTQUFDLEdBQUQ7QUFBYSxVQUFBO01BQVgsUUFBRDthQUFZLEtBQUssQ0FBQyxVQUFOLENBQWlCLEtBQWpCO0lBQWIsQ0FBbkIsQ0FBaEIsRUFBQyxjQUFELEVBQU87SUFDUCxRQUFBLEdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTixHQUFlLENBQWhCLENBQUEsS0FBc0I7V0FDakM7TUFBQyxPQUFBLEtBQUQ7TUFBUSxNQUFBLElBQVI7TUFBYyxPQUFBLEtBQWQ7TUFBcUIsVUFBQSxRQUFyQjs7RUFONkI7O0VBUXpCO0lBQ1Msb0JBQUMsT0FBRCxFQUFVLEtBQVY7TUFB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QVEsVUFBUjtBQUNYLFVBQUE7TUFBQSxJQUFHLGNBQUEsR0FBaUIsSUFBQyxDQUFBLGFBQUQsQ0FBZSxLQUFmLEVBQXNCLFVBQXRCLENBQXBCO1FBQ0UsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFLLENBQUMsT0FBTixDQUFjLGNBQWQsQ0FBYixFQURGOzthQUVBO0lBSFc7Ozs7S0E3QlM7O0VBa0N4QixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUNmLGVBQUEsYUFEZTtJQUVmLGFBQUEsV0FGZTtJQUdmLFdBQUEsU0FIZTs7QUExTmpCIiwic291cmNlc0NvbnRlbnQiOlsie1JhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue1xuICBpc0VzY2FwZWRDaGFyUmFuZ2VcbiAgY29sbGVjdFJhbmdlSW5CdWZmZXJSb3dcbiAgc2NhbkVkaXRvckluRGlyZWN0aW9uXG4gIGdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvblxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmdldENoYXJhY3RlclJhbmdlSW5mb3JtYXRpb24gPSAoZWRpdG9yLCBwb2ludCwgY2hhcikgLT5cbiAgcGF0dGVybiA9IC8vLyN7Xy5lc2NhcGVSZWdFeHAoY2hhcil9Ly8vZ1xuICB0b3RhbCA9IGNvbGxlY3RSYW5nZUluQnVmZmVyUm93KGVkaXRvciwgcG9pbnQucm93LCBwYXR0ZXJuKS5maWx0ZXIgKHJhbmdlKSAtPlxuICAgIG5vdCBpc0VzY2FwZWRDaGFyUmFuZ2UoZWRpdG9yLCByYW5nZSlcbiAgW2xlZnQsIHJpZ2h0XSA9IF8ucGFydGl0aW9uKHRvdGFsLCAoe3N0YXJ0fSkgLT4gc3RhcnQuaXNMZXNzVGhhbihwb2ludCkpXG4gIGJhbGFuY2VkID0gKHRvdGFsLmxlbmd0aCAlIDIpIGlzIDBcbiAge3RvdGFsLCBsZWZ0LCByaWdodCwgYmFsYW5jZWR9XG5cbmNsYXNzIFNjb3BlU3RhdGVcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBwb2ludCkgLT5cbiAgICBAc3RhdGUgPSBAZ2V0U2NvcGVTdGF0ZUZvckJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIGdldFNjb3BlU3RhdGVGb3JCdWZmZXJQb3NpdGlvbjogKHBvaW50KSAtPlxuICAgIHNjb3BlcyA9IEBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24ocG9pbnQpLmdldFNjb3Blc0FycmF5KClcbiAgICB7XG4gICAgICBpblN0cmluZzogc2NvcGVzLnNvbWUgKHNjb3BlKSAtPiBzY29wZS5zdGFydHNXaXRoKCdzdHJpbmcuJylcbiAgICAgIGluQ29tbWVudDogc2NvcGVzLnNvbWUgKHNjb3BlKSAtPiBzY29wZS5zdGFydHNXaXRoKCdjb21tZW50LicpXG4gICAgICBpbkRvdWJsZVF1b3RlczogQGlzSW5Eb3VibGVRdW90ZXMocG9pbnQpXG4gICAgfVxuXG4gIGlzSW5Eb3VibGVRdW90ZXM6IChwb2ludCkgLT5cbiAgICB7dG90YWwsIGxlZnQsIGJhbGFuY2VkfSA9IGdldENoYXJhY3RlclJhbmdlSW5mb3JtYXRpb24oQGVkaXRvciwgcG9pbnQsICdcIicpXG4gICAgaWYgdG90YWwubGVuZ3RoIGlzIDAgb3Igbm90IGJhbGFuY2VkXG4gICAgICBmYWxzZVxuICAgIGVsc2VcbiAgICAgIGxlZnQubGVuZ3RoICUgMiBpcyAxXG5cbiAgaXNFcXVhbDogKG90aGVyKSAtPlxuICAgIF8uaXNFcXVhbChAc3RhdGUsIG90aGVyLnN0YXRlKVxuXG4gIGlzSW5Ob3JtYWxDb2RlQXJlYTogLT5cbiAgICBub3QgKEBzdGF0ZS5pblN0cmluZyBvciBAc3RhdGUuaW5Db21tZW50IG9yIEBzdGF0ZS5pbkRvdWJsZVF1b3RlcylcblxuY2xhc3MgUGFpckZpbmRlclxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIG9wdGlvbnM9e30pIC0+XG4gICAge0BhbGxvd05leHRMaW5lLCBAYWxsb3dGb3J3YXJkaW5nLCBAcGFpcn0gPSBvcHRpb25zXG4gICAgaWYgQHBhaXI/XG4gICAgICBAc2V0UGF0dGVybkZvclBhaXIoQHBhaXIpXG5cbiAgZ2V0UGF0dGVybjogLT5cbiAgICBAcGF0dGVyblxuXG4gIGZpbHRlckV2ZW50OiAtPlxuICAgIHRydWVcblxuICBmaW5kUGFpcjogKHdoaWNoLCBkaXJlY3Rpb24sIGZyb20pIC0+XG4gICAgc3RhY2sgPSBbXVxuICAgIGZvdW5kID0gbnVsbFxuXG4gICAgIyBRdW90ZSBpcyBub3QgbmVzdGFibGUuIFNvIHdoZW4gd2UgZW5jb3VudGVyICdvcGVuJyB3aGlsZSBmaW5kaW5nICdjbG9zZScsXG4gICAgIyBpdCBpcyBmb3J3YXJkaW5nIHBhaXIsIHNvIHN0b3BwYWJsZSBpcyBub3QgQGFsbG93Rm9yd2FyZGluZ1xuICAgIGZpbmRpbmdOb25Gb3J3YXJkaW5nQ2xvc2luZ1F1b3RlID0gKHRoaXMgaW5zdGFuY2VvZiBRdW90ZUZpbmRlcikgYW5kIHdoaWNoIGlzICdjbG9zZScgYW5kIG5vdCBAYWxsb3dGb3J3YXJkaW5nXG4gICAgc2Nhbm5lciA9IHNjYW5FZGl0b3JJbkRpcmVjdGlvbi5iaW5kKG51bGwsIEBlZGl0b3IsIGRpcmVjdGlvbiwgQGdldFBhdHRlcm4oKSwge2Zyb20sIEBhbGxvd05leHRMaW5lfSlcbiAgICBzY2FubmVyIChldmVudCkgPT5cbiAgICAgIHtyYW5nZSwgc3RvcH0gPSBldmVudFxuXG4gICAgICByZXR1cm4gaWYgaXNFc2NhcGVkQ2hhclJhbmdlKEBlZGl0b3IsIHJhbmdlKVxuICAgICAgcmV0dXJuIHVubGVzcyBAZmlsdGVyRXZlbnQoZXZlbnQpXG5cbiAgICAgIGV2ZW50U3RhdGUgPSBAZ2V0RXZlbnRTdGF0ZShldmVudClcblxuICAgICAgaWYgZmluZGluZ05vbkZvcndhcmRpbmdDbG9zaW5nUXVvdGUgYW5kIGV2ZW50U3RhdGUuc3RhdGUgaXMgJ29wZW4nIGFuZCByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb20pXG4gICAgICAgIHN0b3AoKVxuICAgICAgICByZXR1cm5cblxuICAgICAgaWYgZXZlbnRTdGF0ZS5zdGF0ZSBpc250IHdoaWNoXG4gICAgICAgIHN0YWNrLnB1c2goZXZlbnRTdGF0ZSlcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgQG9uRm91bmQoc3RhY2ssIHtldmVudFN0YXRlLCBmcm9tfSlcbiAgICAgICAgICBmb3VuZCA9IHJhbmdlXG4gICAgICAgICAgc3RvcCgpXG5cbiAgICByZXR1cm4gZm91bmRcblxuICBzcGxpY2VTdGFjazogKHN0YWNrLCBldmVudFN0YXRlKSAtPlxuICAgIHN0YWNrLnBvcCgpXG5cbiAgb25Gb3VuZDogKHN0YWNrLCB7ZXZlbnRTdGF0ZSwgZnJvbX0pIC0+XG4gICAgc3dpdGNoIGV2ZW50U3RhdGUuc3RhdGVcbiAgICAgIHdoZW4gJ29wZW4nXG4gICAgICAgIEBzcGxpY2VTdGFjayhzdGFjaywgZXZlbnRTdGF0ZSlcbiAgICAgICAgc3RhY2subGVuZ3RoIGlzIDBcbiAgICAgIHdoZW4gJ2Nsb3NlJ1xuICAgICAgICBvcGVuU3RhdGUgPSBAc3BsaWNlU3RhY2soc3RhY2ssIGV2ZW50U3RhdGUpXG4gICAgICAgIHVubGVzcyBvcGVuU3RhdGU/XG4gICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICAgICBpZiBzdGFjay5sZW5ndGggaXMgMFxuICAgICAgICAgIG9wZW5SYW5nZSA9IG9wZW5TdGF0ZS5yYW5nZVxuICAgICAgICAgIG9wZW5SYW5nZS5zdGFydC5pc0VxdWFsKGZyb20pIG9yIChAYWxsb3dGb3J3YXJkaW5nIGFuZCBvcGVuUmFuZ2Uuc3RhcnQucm93IGlzIGZyb20ucm93KVxuXG4gIGZpbmRDbG9zZUZvcndhcmQ6IChmcm9tKSAtPlxuICAgIEBmaW5kUGFpcignY2xvc2UnLCAnZm9yd2FyZCcsIGZyb20pXG5cbiAgZmluZE9wZW5CYWNrd2FyZDogKGZyb20pIC0+XG4gICAgQGZpbmRQYWlyKCdvcGVuJywgJ2JhY2t3YXJkJywgZnJvbSlcblxuICBmaW5kOiAoZnJvbSkgLT5cbiAgICBjbG9zZVJhbmdlID0gQGNsb3NlUmFuZ2UgPSBAZmluZENsb3NlRm9yd2FyZChmcm9tKVxuICAgIG9wZW5SYW5nZSA9IEBmaW5kT3BlbkJhY2t3YXJkKGNsb3NlUmFuZ2UuZW5kKSBpZiBjbG9zZVJhbmdlP1xuXG4gICAgaWYgY2xvc2VSYW5nZT8gYW5kIG9wZW5SYW5nZT9cbiAgICAgIHtcbiAgICAgICAgYVJhbmdlOiBuZXcgUmFuZ2Uob3BlblJhbmdlLnN0YXJ0LCBjbG9zZVJhbmdlLmVuZClcbiAgICAgICAgaW5uZXJSYW5nZTogbmV3IFJhbmdlKG9wZW5SYW5nZS5lbmQsIGNsb3NlUmFuZ2Uuc3RhcnQpXG4gICAgICAgIG9wZW5SYW5nZTogb3BlblJhbmdlXG4gICAgICAgIGNsb3NlUmFuZ2U6IGNsb3NlUmFuZ2VcbiAgICAgIH1cblxuY2xhc3MgQnJhY2tldEZpbmRlciBleHRlbmRzIFBhaXJGaW5kZXJcbiAgcmV0cnk6IGZhbHNlXG5cbiAgc2V0UGF0dGVybkZvclBhaXI6IChwYWlyKSAtPlxuICAgIFtvcGVuLCBjbG9zZV0gPSBwYWlyXG4gICAgQHBhdHRlcm4gPSAvLy8oI3tfLmVzY2FwZVJlZ0V4cChvcGVuKX0pfCgje18uZXNjYXBlUmVnRXhwKGNsb3NlKX0pLy8vZ1xuXG4gICMgVGhpcyBtZXRob2QgY2FuIGJlIGNhbGxlZCByZWN1cnNpdmVseVxuICBmaW5kOiAoZnJvbSkgLT5cbiAgICBAaW5pdGlhbFNjb3BlID89IG5ldyBTY29wZVN0YXRlKEBlZGl0b3IsIGZyb20pXG5cbiAgICByZXR1cm4gZm91bmQgaWYgZm91bmQgPSBzdXBlclxuXG4gICAgaWYgbm90IEByZXRyeVxuICAgICAgQHJldHJ5ID0gdHJ1ZVxuICAgICAgW0BjbG9zZVJhbmdlLCBAY2xvc2VSYW5nZVNjb3BlXSA9IFtdXG4gICAgICBAZmluZChmcm9tKVxuXG4gIGZpbHRlckV2ZW50OiAoe3JhbmdlfSkgLT5cbiAgICBzY29wZSA9IG5ldyBTY29wZVN0YXRlKEBlZGl0b3IsIHJhbmdlLnN0YXJ0KVxuICAgIGlmIG5vdCBAY2xvc2VSYW5nZVxuICAgICAgIyBOb3cgZmluZGluZyBjbG9zZVJhbmdlXG4gICAgICBpZiBub3QgQHJldHJ5XG4gICAgICAgIEBpbml0aWFsU2NvcGUuaXNFcXVhbChzY29wZSlcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgQGluaXRpYWxTY29wZS5pc0luTm9ybWFsQ29kZUFyZWEoKVxuICAgICAgICAgIG5vdCBzY29wZS5pc0luTm9ybWFsQ29kZUFyZWEoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgc2NvcGUuaXNJbk5vcm1hbENvZGVBcmVhKClcbiAgICBlbHNlXG4gICAgICAjIE5vdyBmaW5kaW5nIG9wZW5SYW5nZTogc2VhcmNoIGZyb20gc2FtZSBzY29wZVxuICAgICAgQGNsb3NlUmFuZ2VTY29wZSA/PSBuZXcgU2NvcGVTdGF0ZShAZWRpdG9yLCBAY2xvc2VSYW5nZS5zdGFydClcbiAgICAgIEBjbG9zZVJhbmdlU2NvcGUuaXNFcXVhbChzY29wZSlcblxuICBnZXRFdmVudFN0YXRlOiAoe21hdGNoLCByYW5nZX0pIC0+XG4gICAgc3RhdGUgPSBzd2l0Y2hcbiAgICAgIHdoZW4gbWF0Y2hbMV0gdGhlbiAnb3BlbidcbiAgICAgIHdoZW4gbWF0Y2hbMl0gdGhlbiAnY2xvc2UnXG4gICAge3N0YXRlLCByYW5nZX1cblxuY2xhc3MgUXVvdGVGaW5kZXIgZXh0ZW5kcyBQYWlyRmluZGVyXG4gIHNldFBhdHRlcm5Gb3JQYWlyOiAocGFpcikgLT5cbiAgICBAcXVvdGVDaGFyID0gcGFpclswXVxuICAgIEBwYXR0ZXJuID0gLy8vKCN7Xy5lc2NhcGVSZWdFeHAocGFpclswXSl9KS8vL2dcblxuICBmaW5kOiAoZnJvbSkgLT5cbiAgICAjIEhBQ0s6IENhbnQgZGV0ZXJtaW5lIG9wZW4vY2xvc2UgZnJvbSBxdW90ZSBjaGFyIGl0c2VsZlxuICAgICMgU28gcHJlc2V0IG9wZW4vY2xvc2Ugc3RhdGUgdG8gZ2V0IGRlc2lhYmxlIHJlc3VsdC5cbiAgICB7dG90YWwsIGxlZnQsIHJpZ2h0LCBiYWxhbmNlZH0gPSBnZXRDaGFyYWN0ZXJSYW5nZUluZm9ybWF0aW9uKEBlZGl0b3IsIGZyb20sIEBxdW90ZUNoYXIpXG4gICAgb25RdW90ZUNoYXIgPSByaWdodFswXT8uc3RhcnQuaXNFcXVhbChmcm9tKSAjIGZyb20gcG9pbnQgaXMgb24gcXVvdGUgY2hhclxuICAgIGlmIGJhbGFuY2VkIGFuZCBvblF1b3RlQ2hhclxuICAgICAgbmV4dFF1b3RlSXNPcGVuID0gbGVmdC5sZW5ndGggJSAyIGlzIDBcbiAgICBlbHNlXG4gICAgICBuZXh0UXVvdGVJc09wZW4gPSBsZWZ0Lmxlbmd0aCBpcyAwXG5cbiAgICBpZiBuZXh0UXVvdGVJc09wZW5cbiAgICAgIEBwYWlyU3RhdGVzID0gWydvcGVuJywgJ2Nsb3NlJywgJ2Nsb3NlJywgJ29wZW4nXVxuICAgIGVsc2VcbiAgICAgIEBwYWlyU3RhdGVzID0gWydjbG9zZScsICdjbG9zZScsICdvcGVuJ11cblxuICAgIHN1cGVyXG5cbiAgZ2V0RXZlbnRTdGF0ZTogKHtyYW5nZX0pIC0+XG4gICAgc3RhdGUgPSBAcGFpclN0YXRlcy5zaGlmdCgpXG4gICAge3N0YXRlLCByYW5nZX1cblxuY2xhc3MgVGFnRmluZGVyIGV4dGVuZHMgUGFpckZpbmRlclxuICBwYXR0ZXJuOiAvPChcXC8/KShbXlxccz5dKylbXj5dKj4vZ1xuXG4gIGxpbmVUZXh0VG9Qb2ludENvbnRhaW5zTm9uV2hpdGVTcGFjZTogKHBvaW50KSAtPlxuICAgIC9cXFMvLnRlc3QoZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIHBvaW50KSlcblxuICBmaW5kOiAoZnJvbSkgLT5cbiAgICBmb3VuZCA9IHN1cGVyXG4gICAgaWYgZm91bmQ/IGFuZCBAYWxsb3dGb3J3YXJkaW5nXG4gICAgICB0YWdTdGFydCA9IGZvdW5kLmFSYW5nZS5zdGFydFxuICAgICAgaWYgdGFnU3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tKSBhbmQgQGxpbmVUZXh0VG9Qb2ludENvbnRhaW5zTm9uV2hpdGVTcGFjZSh0YWdTdGFydClcbiAgICAgICAgIyBXZSBmb3VuZCByYW5nZSBidXQgYWxzbyBmb3VuZCB0aGF0IHdlIGFyZSBJTiBhbm90aGVyIHRhZyxcbiAgICAgICAgIyBzbyB3aWxsIHJldHJ5IGJ5IGV4Y2x1ZGluZyBmb3J3YXJkaW5nIHJhbmdlLlxuICAgICAgICBAYWxsb3dGb3J3YXJkaW5nID0gZmFsc2VcbiAgICAgICAgcmV0dXJuIEBmaW5kKGZyb20pICMgcmV0cnlcbiAgICBmb3VuZFxuXG4gIGdldEV2ZW50U3RhdGU6IChldmVudCkgLT5cbiAgICBiYWNrc2xhc2ggPSBldmVudC5tYXRjaFsxXVxuICAgIHtcbiAgICAgIHN0YXRlOiBpZiAoYmFja3NsYXNoIGlzICcnKSB0aGVuICdvcGVuJyBlbHNlICdjbG9zZSdcbiAgICAgIG5hbWU6IGV2ZW50Lm1hdGNoWzJdXG4gICAgICByYW5nZTogZXZlbnQucmFuZ2VcbiAgICB9XG5cbiAgZmluZFBhaXJTdGF0ZTogKHN0YWNrLCB7bmFtZX0pIC0+XG4gICAgZm9yIHN0YXRlIGluIHN0YWNrIGJ5IC0xIHdoZW4gc3RhdGUubmFtZSBpcyBuYW1lXG4gICAgICByZXR1cm4gc3RhdGVcblxuICBzcGxpY2VTdGFjazogKHN0YWNrLCBldmVudFN0YXRlKSAtPlxuICAgIGlmIHBhaXJFdmVudFN0YXRlID0gQGZpbmRQYWlyU3RhdGUoc3RhY2ssIGV2ZW50U3RhdGUpXG4gICAgICBzdGFjay5zcGxpY2Uoc3RhY2suaW5kZXhPZihwYWlyRXZlbnRTdGF0ZSkpXG4gICAgcGFpckV2ZW50U3RhdGVcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEJyYWNrZXRGaW5kZXJcbiAgUXVvdGVGaW5kZXJcbiAgVGFnRmluZGVyXG59XG4iXX0=
