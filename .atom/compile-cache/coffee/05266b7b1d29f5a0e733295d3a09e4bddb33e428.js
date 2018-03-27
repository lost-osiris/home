(function() {
  var BlockwiseSelection, Disposable, Point, Range, SelectionWrapper, assertWithException, getBufferRangeForRowRange, getEndOfLineForBufferRow, getRangeByTranslatePointAndClip, isLinewiseRange, limitNumber, propertyStore, ref, ref1, settings, swrap, translatePointAndClip;

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  ref1 = require('./utils'), translatePointAndClip = ref1.translatePointAndClip, getRangeByTranslatePointAndClip = ref1.getRangeByTranslatePointAndClip, getEndOfLineForBufferRow = ref1.getEndOfLineForBufferRow, getBufferRangeForRowRange = ref1.getBufferRangeForRowRange, limitNumber = ref1.limitNumber, isLinewiseRange = ref1.isLinewiseRange, assertWithException = ref1.assertWithException;

  settings = require('./settings');

  BlockwiseSelection = require('./blockwise-selection');

  propertyStore = new Map;

  SelectionWrapper = (function() {
    function SelectionWrapper(selection1) {
      this.selection = selection1;
    }

    SelectionWrapper.prototype.hasProperties = function() {
      return propertyStore.has(this.selection);
    };

    SelectionWrapper.prototype.getProperties = function() {
      return propertyStore.get(this.selection);
    };

    SelectionWrapper.prototype.setProperties = function(prop) {
      return propertyStore.set(this.selection, prop);
    };

    SelectionWrapper.prototype.clearProperties = function() {
      return propertyStore["delete"](this.selection);
    };

    SelectionWrapper.prototype.setBufferRangeSafely = function(range, options) {
      if (range) {
        return this.setBufferRange(range, options);
      }
    };

    SelectionWrapper.prototype.getBufferRange = function() {
      return this.selection.getBufferRange();
    };

    SelectionWrapper.prototype.getBufferPositionFor = function(which, arg) {
      var _from, from, i, len, properties, ref2;
      from = (arg != null ? arg : {}).from;
      ref2 = from != null ? from : ['selection'];
      for (i = 0, len = ref2.length; i < len; i++) {
        _from = ref2[i];
        switch (_from) {
          case 'property':
            if (!this.hasProperties()) {
              continue;
            }
            properties = this.getProperties();
            switch (which) {
              case 'start':
                if (this.selection.isReversed()) {
                  return properties.head;
                } else {
                  return properties.tail;
                }
              case 'end':
                if (this.selection.isReversed()) {
                  return properties.tail;
                } else {
                  return properties.head;
                }
              case 'head':
                return properties.head;
              case 'tail':
                return properties.tail;
            }
          case 'selection':
            switch (which) {
              case 'start':
                return this.selection.getBufferRange().start;
              case 'end':
                return this.selection.getBufferRange().end;
              case 'head':
                return this.selection.getHeadBufferPosition();
              case 'tail':
                return this.selection.getTailBufferPosition();
            }
        }
      }
      return null;
    };

    SelectionWrapper.prototype.setBufferPositionTo = function(which) {
      return this.selection.cursor.setBufferPosition(this.getBufferPositionFor(which));
    };

    SelectionWrapper.prototype.setReversedState = function(isReversed) {
      var head, ref2, tail;
      if (this.selection.isReversed() === isReversed) {
        return;
      }
      assertWithException(this.hasProperties(), "trying to reverse selection which is non-empty and property-lesss");
      ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail;
      this.setProperties({
        head: tail,
        tail: head
      });
      return this.setBufferRange(this.getBufferRange(), {
        autoscroll: true,
        reversed: isReversed,
        keepGoalColumn: false
      });
    };

    SelectionWrapper.prototype.getRows = function() {
      var endRow, i, ref2, results, startRow;
      ref2 = this.selection.getBufferRowRange(), startRow = ref2[0], endRow = ref2[1];
      return (function() {
        results = [];
        for (var i = startRow; startRow <= endRow ? i <= endRow : i >= endRow; startRow <= endRow ? i++ : i--){ results.push(i); }
        return results;
      }).apply(this);
    };

    SelectionWrapper.prototype.getRowCount = function() {
      return this.getRows().length;
    };

    SelectionWrapper.prototype.getTailBufferRange = function() {
      var editor, point, tailPoint;
      editor = this.selection.editor;
      tailPoint = this.selection.getTailBufferPosition();
      if (this.selection.isReversed()) {
        point = translatePointAndClip(editor, tailPoint, 'backward');
        return new Range(point, tailPoint);
      } else {
        point = translatePointAndClip(editor, tailPoint, 'forward');
        return new Range(tailPoint, point);
      }
    };

    SelectionWrapper.prototype.saveProperties = function(isNormalized) {
      var end, head, properties, tail;
      head = this.selection.getHeadBufferPosition();
      tail = this.selection.getTailBufferPosition();
      if (this.selection.isEmpty() || isNormalized) {
        properties = {
          head: head,
          tail: tail
        };
      } else {
        end = translatePointAndClip(this.selection.editor, this.getBufferRange().end, 'backward');
        if (this.selection.isReversed()) {
          properties = {
            head: head,
            tail: end
          };
        } else {
          properties = {
            head: end,
            tail: tail
          };
        }
      }
      return this.setProperties(properties);
    };

    SelectionWrapper.prototype.fixPropertyRowToRowRange = function() {
      var head, ref2, ref3, ref4, tail;
      ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail;
      if (this.selection.isReversed()) {
        return ref3 = this.selection.getBufferRowRange(), head.row = ref3[0], tail.row = ref3[1], ref3;
      } else {
        return ref4 = this.selection.getBufferRowRange(), tail.row = ref4[0], head.row = ref4[1], ref4;
      }
    };

    SelectionWrapper.prototype.applyWise = function(wise) {
      var end, ref2, start;
      switch (wise) {
        case 'characterwise':
          return this.translateSelectionEndAndClip('forward');
        case 'linewise':
          ref2 = this.getBufferRange(), start = ref2.start, end = ref2.end;
          return this.setBufferRange(getBufferRangeForRowRange(this.selection.editor, [start.row, end.row]));
        case 'blockwise':
          return new BlockwiseSelection(this.selection);
      }
    };

    SelectionWrapper.prototype.selectByProperties = function(arg) {
      var head, tail;
      head = arg.head, tail = arg.tail;
      return this.setBufferRange([tail, head], {
        autoscroll: true,
        reversed: head.isLessThan(tail),
        keepGoalColumn: false
      });
    };

    SelectionWrapper.prototype.setBufferRange = function(range, options) {
      var goalColumn, ref2;
      if (options == null) {
        options = {};
      }
      if ((ref2 = options.keepGoalColumn) != null ? ref2 : true) {
        goalColumn = this.selection.cursor.goalColumn;
      }
      delete options.keepGoalColumn;
      if (options.autoscroll == null) {
        options.autoscroll = false;
      }
      if (options.preserveFolds == null) {
        options.preserveFolds = true;
      }
      this.selection.setBufferRange(range, options);
      if (goalColumn != null) {
        return this.selection.cursor.goalColumn = goalColumn;
      }
    };

    SelectionWrapper.prototype.isSingleRow = function() {
      var endRow, ref2, startRow;
      ref2 = this.selection.getBufferRowRange(), startRow = ref2[0], endRow = ref2[1];
      return startRow === endRow;
    };

    SelectionWrapper.prototype.isLinewiseRange = function() {
      return isLinewiseRange(this.getBufferRange());
    };

    SelectionWrapper.prototype.detectWise = function() {
      if (this.isLinewiseRange()) {
        return 'linewise';
      } else {
        return 'characterwise';
      }
    };

    SelectionWrapper.prototype.translateSelectionEndAndClip = function(direction) {
      var newRange;
      newRange = getRangeByTranslatePointAndClip(this.selection.editor, this.getBufferRange(), "end", direction);
      return this.setBufferRange(newRange);
    };

    SelectionWrapper.prototype.getBlockwiseSelectionExtent = function() {
      var head, tail;
      head = this.selection.getHeadBufferPosition();
      tail = this.selection.getTailBufferPosition();
      return new Point(head.row - tail.row, head.column - tail.column);
    };

    SelectionWrapper.prototype.normalize = function() {
      var head, ref2, tail;
      if (this.selection.isEmpty()) {
        return;
      }
      if (!this.hasProperties()) {
        if (settings.get('strictAssertion')) {
          assertWithException(false, "attempted to normalize but no properties to restore");
        }
        this.saveProperties();
      }
      ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail;
      return this.setBufferRange([tail, head]);
    };

    return SelectionWrapper;

  })();

  swrap = function(selection) {
    return new SelectionWrapper(selection);
  };

  swrap.getBlockwiseSelections = function(editor) {
    return BlockwiseSelection.getSelections(editor);
  };

  swrap.getLastBlockwiseSelections = function(editor) {
    return BlockwiseSelection.getLastSelection(editor);
  };

  swrap.getBlockwiseSelectionsOrderedByBufferPosition = function(editor) {
    return BlockwiseSelection.getSelectionsOrderedByBufferPosition(editor);
  };

  swrap.clearBlockwiseSelections = function(editor) {
    return BlockwiseSelection.clearSelections(editor);
  };

  swrap.getSelections = function(editor) {
    return editor.getSelections(editor).map(swrap);
  };

  swrap.setReversedState = function(editor, reversed) {
    var $selection, i, len, ref2, results;
    ref2 = this.getSelections(editor);
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      $selection = ref2[i];
      results.push($selection.setReversedState(reversed));
    }
    return results;
  };

  swrap.detectWise = function(editor) {
    if (this.getSelections(editor).every(function($selection) {
      return $selection.detectWise() === 'linewise';
    })) {
      return 'linewise';
    } else {
      return 'characterwise';
    }
  };

  swrap.clearProperties = function(editor) {
    var $selection, i, len, ref2, results;
    ref2 = this.getSelections(editor);
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      $selection = ref2[i];
      results.push($selection.clearProperties());
    }
    return results;
  };

  swrap.dumpProperties = function(editor) {
    var $selection, i, inspect, len, ref2, results;
    inspect = require('util').inspect;
    ref2 = this.getSelections(editor);
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      $selection = ref2[i];
      if ($selection.hasProperties()) {
        results.push(console.log(inspect($selection.getProperties())));
      }
    }
    return results;
  };

  swrap.normalize = function(editor) {
    var $selection, blockwiseSelection, i, j, len, len1, ref2, ref3, results;
    if (BlockwiseSelection.has(editor)) {
      ref2 = BlockwiseSelection.getSelections(editor);
      for (i = 0, len = ref2.length; i < len; i++) {
        blockwiseSelection = ref2[i];
        blockwiseSelection.normalize();
      }
      return BlockwiseSelection.clearSelections(editor);
    } else {
      ref3 = this.getSelections(editor);
      results = [];
      for (j = 0, len1 = ref3.length; j < len1; j++) {
        $selection = ref3[j];
        results.push($selection.normalize());
      }
      return results;
    }
  };

  swrap.hasProperties = function(editor) {
    return this.getSelections(editor).every(function($selection) {
      return $selection.hasProperties();
    });
  };

  swrap.switchToLinewise = function(editor) {
    var $selection, i, len, ref2;
    ref2 = swrap.getSelections(editor);
    for (i = 0, len = ref2.length; i < len; i++) {
      $selection = ref2[i];
      $selection.saveProperties();
      $selection.applyWise('linewise');
    }
    return new Disposable(function() {
      var j, len1, ref3, results;
      ref3 = swrap.getSelections(editor);
      results = [];
      for (j = 0, len1 = ref3.length; j < len1; j++) {
        $selection = ref3[j];
        $selection.normalize();
        results.push($selection.applyWise('characterwise'));
      }
      return results;
    });
  };

  swrap.getPropertyStore = function() {
    return propertyStore;
  };

  module.exports = swrap;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NlbGVjdGlvbi13cmFwcGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBNkIsT0FBQSxDQUFRLE1BQVIsQ0FBN0IsRUFBQyxpQkFBRCxFQUFRLGlCQUFSLEVBQWU7O0VBQ2YsT0FRSSxPQUFBLENBQVEsU0FBUixDQVJKLEVBQ0Usa0RBREYsRUFFRSxzRUFGRixFQUdFLHdEQUhGLEVBSUUsMERBSkYsRUFLRSw4QkFMRixFQU1FLHNDQU5GLEVBT0U7O0VBRUYsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUNYLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx1QkFBUjs7RUFFckIsYUFBQSxHQUFnQixJQUFJOztFQUVkO0lBQ1MsMEJBQUMsVUFBRDtNQUFDLElBQUMsQ0FBQSxZQUFEO0lBQUQ7OytCQUNiLGFBQUEsR0FBZSxTQUFBO2FBQUcsYUFBYSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFNBQW5CO0lBQUg7OytCQUNmLGFBQUEsR0FBZSxTQUFBO2FBQUcsYUFBYSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFNBQW5CO0lBQUg7OytCQUNmLGFBQUEsR0FBZSxTQUFDLElBQUQ7YUFBVSxhQUFhLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsU0FBbkIsRUFBOEIsSUFBOUI7SUFBVjs7K0JBQ2YsZUFBQSxHQUFpQixTQUFBO2FBQUcsYUFBYSxFQUFDLE1BQUQsRUFBYixDQUFxQixJQUFDLENBQUEsU0FBdEI7SUFBSDs7K0JBRWpCLG9CQUFBLEdBQXNCLFNBQUMsS0FBRCxFQUFRLE9BQVI7TUFDcEIsSUFBRyxLQUFIO2VBQ0UsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsS0FBaEIsRUFBdUIsT0FBdkIsRUFERjs7SUFEb0I7OytCQUl0QixjQUFBLEdBQWdCLFNBQUE7YUFDZCxJ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QUFEO2FBQWdCLFVBQVUsQ0FBQyxhQUFYLENBQUE7SUFBaEIsQ0FBN0I7RUFEb0I7O0VBS3RCLEtBQUssQ0FBQyxnQkFBTixHQUF5QixTQUFDLE1BQUQ7QUFDdkIsUUFBQTtBQUFBO0FBQUEsU0FBQSxzQ0FBQTs7TUFDRSxVQUFVLENBQUMsY0FBWCxDQUFBO01BQ0EsVUFBVSxDQUFDLFNBQVgsQ0FBcUIsVUFBckI7QUFGRjtXQUdJLElBQUEsVUFBQSxDQUFXLFNBQUE7QUFDYixVQUFBO0FBQUE7QUFBQTtXQUFBLHdDQUFBOztRQUNFLFVBQVUsQ0FBQyxTQUFYLENBQUE7cUJBQ0EsVUFBVSxDQUFDLFNBQVgsQ0FBcUIsZUFBckI7QUFGRjs7SUFEYSxDQUFYO0VBSm1COztFQVN6QixLQUFLLENBQUMsZ0JBQU4sR0FBeUIsU0FBQTtXQUN2QjtFQUR1Qjs7RUFHekIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUEzT2pCIiwic291cmNlc0NvbnRlbnQiOlsie1JhbmdlLCBQb2ludCwgRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue1xuICB0cmFuc2xhdGVQb2ludEFuZENsaXBcbiAgZ2V0UmFuZ2VCeVRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxuICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3dcbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZVxuICBsaW1pdE51bWJlclxuICBpc0xpbmV3aXNlUmFuZ2VcbiAgYXNzZXJ0V2l0aEV4Y2VwdGlvblxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5CbG9ja3dpc2VTZWxlY3Rpb24gPSByZXF1aXJlICcuL2Jsb2Nrd2lzZS1zZWxlY3Rpb24nXG5cbnByb3BlcnR5U3RvcmUgPSBuZXcgTWFwXG5cbmNsYXNzIFNlbGVjdGlvbldyYXBwZXJcbiAgY29uc3RydWN0b3I6IChAc2VsZWN0aW9uKSAtPlxuICBoYXNQcm9wZXJ0aWVzOiAtPiBwcm9wZXJ0eVN0b3JlLmhhcyhAc2VsZWN0aW9uKVxuICBnZXRQcm9wZXJ0aWVzOiAtPiBwcm9wZXJ0eVN0b3JlLmdldChAc2VsZWN0aW9uKVxuICBzZXRQcm9wZXJ0aWVzOiAocHJvcCkgLT4gcHJvcGVydHlTdG9yZS5zZXQoQHNlbGVjdGlvbiwgcHJvcClcbiAgY2xlYXJQcm9wZXJ0aWVzOiAtPiBwcm9wZXJ0eVN0b3JlLmRlbGV0ZShAc2VsZWN0aW9uKVxuXG4gIHNldEJ1ZmZlclJhbmdlU2FmZWx5OiAocmFuZ2UsIG9wdGlvbnMpIC0+XG4gICAgaWYgcmFuZ2VcbiAgICAgIEBzZXRCdWZmZXJSYW5nZShyYW5nZSwgb3B0aW9ucylcblxuICBnZXRCdWZmZXJSYW5nZTogLT5cbiAgICBAc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcblxuICBnZXRCdWZmZXJQb3NpdGlvbkZvcjogKHdoaWNoLCB7ZnJvbX09e30pIC0+XG4gICAgZm9yIF9mcm9tIGluIGZyb20gPyBbJ3NlbGVjdGlvbiddXG4gICAgICBzd2l0Y2ggX2Zyb21cbiAgICAgICAgd2hlbiAncHJvcGVydHknXG4gICAgICAgICAgY29udGludWUgdW5sZXNzIEBoYXNQcm9wZXJ0aWVzKClcblxuICAgICAgICAgIHByb3BlcnRpZXMgPSBAZ2V0UHJvcGVydGllcygpXG4gICAgICAgICAgcmV0dXJuIHN3aXRjaCB3aGljaFxuICAgICAgICAgICAgd2hlbiAnc3RhcnQnIHRoZW4gKGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpIHRoZW4gcHJvcGVydGllcy5oZWFkIGVsc2UgcHJvcGVydGllcy50YWlsKVxuICAgICAgICAgICAgd2hlbiAnZW5kJyB0aGVuIChpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSB0aGVuIHByb3BlcnRpZXMudGFpbCBlbHNlIHByb3BlcnRpZXMuaGVhZClcbiAgICAgICAgICAgIHdoZW4gJ2hlYWQnIHRoZW4gcHJvcGVydGllcy5oZWFkXG4gICAgICAgICAgICB3aGVuICd0YWlsJyB0aGVuIHByb3BlcnRpZXMudGFpbFxuXG4gICAgICAgIHdoZW4gJ3NlbGVjdGlvbidcbiAgICAgICAgICByZXR1cm4gc3dpdGNoIHdoaWNoXG4gICAgICAgICAgICB3aGVuICdzdGFydCcgdGhlbiBAc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcbiAgICAgICAgICAgIHdoZW4gJ2VuZCcgdGhlbiBAc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuZW5kXG4gICAgICAgICAgICB3aGVuICdoZWFkJyB0aGVuIEBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgICAgIHdoZW4gJ3RhaWwnIHRoZW4gQHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuICAgIG51bGxcblxuICBzZXRCdWZmZXJQb3NpdGlvblRvOiAod2hpY2gpIC0+XG4gICAgQHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oQGdldEJ1ZmZlclBvc2l0aW9uRm9yKHdoaWNoKSlcblxuICBzZXRSZXZlcnNlZFN0YXRlOiAoaXNSZXZlcnNlZCkgLT5cbiAgICByZXR1cm4gaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKCkgaXMgaXNSZXZlcnNlZFxuICAgIGFzc2VydFdpdGhFeGNlcHRpb24oQGhhc1Byb3BlcnRpZXMoKSwgXCJ0cnlpbmcgdG8gcmV2ZXJzZSBzZWxlY3Rpb24gd2hpY2ggaXMgbm9uLWVtcHR5IGFuZCBwcm9wZXJ0eS1sZXNzc1wiKVxuXG4gICAge2hlYWQsIHRhaWx9ID0gQGdldFByb3BlcnRpZXMoKVxuICAgIEBzZXRQcm9wZXJ0aWVzKGhlYWQ6IHRhaWwsIHRhaWw6IGhlYWQpXG5cbiAgICBAc2V0QnVmZmVyUmFuZ2UgQGdldEJ1ZmZlclJhbmdlKCksXG4gICAgICBhdXRvc2Nyb2xsOiB0cnVlXG4gICAgICByZXZlcnNlZDogaXNSZXZlcnNlZFxuICAgICAga2VlcEdvYWxDb2x1bW46IGZhbHNlXG5cbiAgZ2V0Um93czogLT5cbiAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICBbc3RhcnRSb3cuLmVuZFJvd11cblxuICBnZXRSb3dDb3VudDogLT5cbiAgICBAZ2V0Um93cygpLmxlbmd0aFxuXG4gIGdldFRhaWxCdWZmZXJSYW5nZTogLT5cbiAgICB7ZWRpdG9yfSA9IEBzZWxlY3Rpb25cbiAgICB0YWlsUG9pbnQgPSBAc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIHBvaW50ID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKGVkaXRvciwgdGFpbFBvaW50LCAnYmFja3dhcmQnKVxuICAgICAgbmV3IFJhbmdlKHBvaW50LCB0YWlsUG9pbnQpXG4gICAgZWxzZVxuICAgICAgcG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoZWRpdG9yLCB0YWlsUG9pbnQsICdmb3J3YXJkJylcbiAgICAgIG5ldyBSYW5nZSh0YWlsUG9pbnQsIHBvaW50KVxuXG4gIHNhdmVQcm9wZXJ0aWVzOiAoaXNOb3JtYWxpemVkKSAtPlxuICAgIGhlYWQgPSBAc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgdGFpbCA9IEBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcbiAgICBpZiBAc2VsZWN0aW9uLmlzRW1wdHkoKSBvciBpc05vcm1hbGl6ZWRcbiAgICAgIHByb3BlcnRpZXMgPSB7aGVhZCwgdGFpbH1cbiAgICBlbHNlXG4gICAgICAjIFdlIHNlbGVjdFJpZ2h0LWVkIGluIHZpc3VhbC1tb2RlLCB0aGlzIHRyYW5zbGF0aW9uIGRlLWVmZmVjdCBzZWxlY3QtcmlnaHQtZWZmZWN0XG4gICAgICAjIFNvIHRoYXQgd2UgY2FuIGFjdGl2YXRlLXZpc3VhbC1tb2RlIHdpdGhvdXQgc3BlY2lhbCB0cmFuc2xhdGlvbiBhZnRlciByZXN0b3JlaW5nIHByb3BlcnRpZXMuXG4gICAgICBlbmQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQHNlbGVjdGlvbi5lZGl0b3IsIEBnZXRCdWZmZXJSYW5nZSgpLmVuZCwgJ2JhY2t3YXJkJylcbiAgICAgIGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICAgIHByb3BlcnRpZXMgPSB7aGVhZDogaGVhZCwgdGFpbDogZW5kfVxuICAgICAgZWxzZVxuICAgICAgICBwcm9wZXJ0aWVzID0ge2hlYWQ6IGVuZCwgdGFpbDogdGFpbH1cbiAgICBAc2V0UHJvcGVydGllcyhwcm9wZXJ0aWVzKVxuXG4gIGZpeFByb3BlcnR5Um93VG9Sb3dSYW5nZTogLT5cbiAgICB7aGVhZCwgdGFpbH0gPSBAZ2V0UHJvcGVydGllcygpXG4gICAgaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIFtoZWFkLnJvdywgdGFpbC5yb3ddID0gQHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgZWxzZVxuICAgICAgW3RhaWwucm93LCBoZWFkLnJvd10gPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcblxuICAjIE5PVEU6XG4gICMgJ3dpc2UnIG11c3QgYmUgJ2NoYXJhY3Rlcndpc2UnIG9yICdsaW5ld2lzZSdcbiAgIyBVc2UgdGhpcyBmb3Igbm9ybWFsaXplZChub24tc2VsZWN0LXJpZ2h0LWVkKSBzZWxlY3Rpb24uXG4gIGFwcGx5V2lzZTogKHdpc2UpIC0+XG4gICAgc3dpdGNoIHdpc2VcbiAgICAgIHdoZW4gJ2NoYXJhY3Rlcndpc2UnXG4gICAgICAgIEB0cmFuc2xhdGVTZWxlY3Rpb25FbmRBbmRDbGlwKCdmb3J3YXJkJykgIyBlcXVpdmFsZW50IHRvIGNvcmUgc2VsZWN0aW9uLnNlbGVjdFJpZ2h0IGJ1dCBrZWVwIGdvYWxDb2x1bW5cbiAgICAgIHdoZW4gJ2xpbmV3aXNlJ1xuICAgICAgICAjIEV2ZW4gaWYgZW5kLmNvbHVtbiBpcyAwLCBleHBhbmQgb3ZlciB0aGF0IGVuZC5yb3coIGRvbid0IHVzZSBzZWxlY3Rpb24uZ2V0Um93UmFuZ2UoKSApXG4gICAgICAgIHtzdGFydCwgZW5kfSA9IEBnZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgIEBzZXRCdWZmZXJSYW5nZShnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKEBzZWxlY3Rpb24uZWRpdG9yLCBbc3RhcnQucm93LCBlbmQucm93XSkpXG4gICAgICB3aGVuICdibG9ja3dpc2UnXG4gICAgICAgIG5ldyBCbG9ja3dpc2VTZWxlY3Rpb24oQHNlbGVjdGlvbilcblxuICBzZWxlY3RCeVByb3BlcnRpZXM6ICh7aGVhZCwgdGFpbH0pIC0+XG4gICAgIyBObyBwcm9ibGVtIGlmIGhlYWQgaXMgZ3JlYXRlciB0aGFuIHRhaWwsIFJhbmdlIGNvbnN0cnVjdG9yIHN3YXAgc3RhcnQvZW5kLlxuICAgIEBzZXRCdWZmZXJSYW5nZSBbdGFpbCwgaGVhZF0sXG4gICAgICBhdXRvc2Nyb2xsOiB0cnVlXG4gICAgICByZXZlcnNlZDogaGVhZC5pc0xlc3NUaGFuKHRhaWwpXG4gICAgICBrZWVwR29hbENvbHVtbjogZmFsc2VcblxuICAjIHNldCBzZWxlY3Rpb25zIGJ1ZmZlclJhbmdlIHdpdGggZGVmYXVsdCBvcHRpb24ge2F1dG9zY3JvbGw6IGZhbHNlLCBwcmVzZXJ2ZUZvbGRzOiB0cnVlfVxuICBzZXRCdWZmZXJSYW5nZTogKHJhbmdlLCBvcHRpb25zPXt9KSAtPlxuICAgIGlmIG9wdGlvbnMua2VlcEdvYWxDb2x1bW4gPyB0cnVlXG4gICAgICBnb2FsQ29sdW1uID0gQHNlbGVjdGlvbi5jdXJzb3IuZ29hbENvbHVtblxuICAgIGRlbGV0ZSBvcHRpb25zLmtlZXBHb2FsQ29sdW1uXG4gICAgb3B0aW9ucy5hdXRvc2Nyb2xsID89IGZhbHNlXG4gICAgb3B0aW9ucy5wcmVzZXJ2ZUZvbGRzID89IHRydWVcbiAgICBAc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCBvcHRpb25zKVxuICAgIEBzZWxlY3Rpb24uY3Vyc29yLmdvYWxDb2x1bW4gPSBnb2FsQ29sdW1uIGlmIGdvYWxDb2x1bW4/XG5cbiAgaXNTaW5nbGVSb3c6IC0+XG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gQHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgc3RhcnRSb3cgaXMgZW5kUm93XG5cbiAgaXNMaW5ld2lzZVJhbmdlOiAtPlxuICAgIGlzTGluZXdpc2VSYW5nZShAZ2V0QnVmZmVyUmFuZ2UoKSlcblxuICBkZXRlY3RXaXNlOiAtPlxuICAgIGlmIEBpc0xpbmV3aXNlUmFuZ2UoKVxuICAgICAgJ2xpbmV3aXNlJ1xuICAgIGVsc2VcbiAgICAgICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gICMgZGlyZWN0aW9uIG11c3QgYmUgb25lIG9mIFsnZm9yd2FyZCcsICdiYWNrd2FyZCddXG4gIHRyYW5zbGF0ZVNlbGVjdGlvbkVuZEFuZENsaXA6IChkaXJlY3Rpb24pIC0+XG4gICAgbmV3UmFuZ2UgPSBnZXRSYW5nZUJ5VHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBzZWxlY3Rpb24uZWRpdG9yLCBAZ2V0QnVmZmVyUmFuZ2UoKSwgXCJlbmRcIiwgZGlyZWN0aW9uKVxuICAgIEBzZXRCdWZmZXJSYW5nZShuZXdSYW5nZSlcblxuICAjIFJldHVybiBzZWxlY3Rpb24gZXh0ZW50IHRvIHJlcGxheSBibG9ja3dpc2Ugc2VsZWN0aW9uIG9uIGAuYCByZXBlYXRpbmcuXG4gIGdldEJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudDogLT5cbiAgICBoZWFkID0gQHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIHRhaWwgPSBAc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG4gICAgbmV3IFBvaW50KGhlYWQucm93IC0gdGFpbC5yb3csIGhlYWQuY29sdW1uIC0gdGFpbC5jb2x1bW4pXG5cbiAgIyBXaGF0J3MgdGhlIG5vcm1hbGl6ZT9cbiAgIyBOb3JtYWxpemF0aW9uIGlzIHJlc3RvcmUgc2VsZWN0aW9uIHJhbmdlIGZyb20gcHJvcGVydHkuXG4gICMgQXMgYSByZXN1bHQgaXQgcmFuZ2UgYmVjYW1lIHJhbmdlIHdoZXJlIGVuZCBvZiBzZWxlY3Rpb24gbW92ZWQgdG8gbGVmdC5cbiAgIyBUaGlzIGVuZC1tb3ZlLXRvLWxlZnQgZGUtZWZlY3Qgb2YgZW5kLW1vZGUtdG8tcmlnaHQgZWZmZWN0KCB0aGlzIGlzIHZpc3VhbC1tb2RlIG9yaWVudGF0aW9uIClcbiAgbm9ybWFsaXplOiAtPlxuICAgICMgZW1wdHkgc2VsZWN0aW9uIElTIGFscmVhZHkgJ25vcm1hbGl6ZWQnXG4gICAgcmV0dXJuIGlmIEBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgdW5sZXNzIEBoYXNQcm9wZXJ0aWVzKClcbiAgICAgIGlmIHNldHRpbmdzLmdldCgnc3RyaWN0QXNzZXJ0aW9uJylcbiAgICAgICAgYXNzZXJ0V2l0aEV4Y2VwdGlvbihmYWxzZSwgXCJhdHRlbXB0ZWQgdG8gbm9ybWFsaXplIGJ1dCBubyBwcm9wZXJ0aWVzIHRvIHJlc3RvcmVcIilcbiAgICAgIEBzYXZlUHJvcGVydGllcygpXG4gICAge2hlYWQsIHRhaWx9ID0gQGdldFByb3BlcnRpZXMoKVxuICAgIEBzZXRCdWZmZXJSYW5nZShbdGFpbCwgaGVhZF0pXG5cbnN3cmFwID0gKHNlbGVjdGlvbikgLT5cbiAgbmV3IFNlbGVjdGlvbldyYXBwZXIoc2VsZWN0aW9uKVxuXG4jIEJsb2Nrd2lzZVNlbGVjdGlvbiBwcm94eVxuc3dyYXAuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucyA9IChlZGl0b3IpIC0+XG4gIEJsb2Nrd2lzZVNlbGVjdGlvbi5nZXRTZWxlY3Rpb25zKGVkaXRvcilcblxuc3dyYXAuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbnMgPSAoZWRpdG9yKSAtPlxuICBCbG9ja3dpc2VTZWxlY3Rpb24uZ2V0TGFzdFNlbGVjdGlvbihlZGl0b3IpXG5cbnN3cmFwLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IpIC0+XG4gIEJsb2Nrd2lzZVNlbGVjdGlvbi5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oZWRpdG9yKVxuXG5zd3JhcC5jbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnMgPSAoZWRpdG9yKSAtPlxuICBCbG9ja3dpc2VTZWxlY3Rpb24uY2xlYXJTZWxlY3Rpb25zKGVkaXRvcilcblxuc3dyYXAuZ2V0U2VsZWN0aW9ucyA9IChlZGl0b3IpIC0+XG4gIGVkaXRvci5nZXRTZWxlY3Rpb25zKGVkaXRvcikubWFwKHN3cmFwKVxuXG5zd3JhcC5zZXRSZXZlcnNlZFN0YXRlID0gKGVkaXRvciwgcmV2ZXJzZWQpIC0+XG4gICRzZWxlY3Rpb24uc2V0UmV2ZXJzZWRTdGF0ZShyZXZlcnNlZCkgZm9yICRzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoZWRpdG9yKVxuXG5zd3JhcC5kZXRlY3RXaXNlID0gKGVkaXRvcikgLT5cbiAgaWYgQGdldFNlbGVjdGlvbnMoZWRpdG9yKS5ldmVyeSgoJHNlbGVjdGlvbikgLT4gJHNlbGVjdGlvbi5kZXRlY3RXaXNlKCkgaXMgJ2xpbmV3aXNlJylcbiAgICAnbGluZXdpc2UnXG4gIGVsc2VcbiAgICAnY2hhcmFjdGVyd2lzZSdcblxuc3dyYXAuY2xlYXJQcm9wZXJ0aWVzID0gKGVkaXRvcikgLT5cbiAgJHNlbGVjdGlvbi5jbGVhclByb3BlcnRpZXMoKSBmb3IgJHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucyhlZGl0b3IpXG5cbnN3cmFwLmR1bXBQcm9wZXJ0aWVzID0gKGVkaXRvcikgLT5cbiAge2luc3BlY3R9ID0gcmVxdWlyZSAndXRpbCdcbiAgZm9yICRzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoZWRpdG9yKSB3aGVuICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG4gICAgY29uc29sZS5sb2cgaW5zcGVjdCgkc2VsZWN0aW9uLmdldFByb3BlcnRpZXMoKSlcblxuc3dyYXAubm9ybWFsaXplID0gKGVkaXRvcikgLT5cbiAgaWYgQmxvY2t3aXNlU2VsZWN0aW9uLmhhcyhlZGl0b3IpXG4gICAgZm9yIGJsb2Nrd2lzZVNlbGVjdGlvbiBpbiBCbG9ja3dpc2VTZWxlY3Rpb24uZ2V0U2VsZWN0aW9ucyhlZGl0b3IpXG4gICAgICBibG9ja3dpc2VTZWxlY3Rpb24ubm9ybWFsaXplKClcbiAgICBCbG9ja3dpc2VTZWxlY3Rpb24uY2xlYXJTZWxlY3Rpb25zKGVkaXRvcilcbiAgZWxzZVxuICAgIGZvciAkc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKGVkaXRvcilcbiAgICAgICRzZWxlY3Rpb24ubm9ybWFsaXplKClcblxuc3dyYXAuaGFzUHJvcGVydGllcyA9IChlZGl0b3IpIC0+XG4gIEBnZXRTZWxlY3Rpb25zKGVkaXRvcikuZXZlcnkgKCRzZWxlY3Rpb24pIC0+ICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG5cbiMgUmV0dXJuIGZ1bmN0aW9uIHRvIHJlc3RvcmVcbiMgVXNlZCBpbiB2bXAtbW92ZS1zZWxlY3RlZC10ZXh0XG5zd3JhcC5zd2l0Y2hUb0xpbmV3aXNlID0gKGVkaXRvcikgLT5cbiAgZm9yICRzZWxlY3Rpb24gaW4gc3dyYXAuZ2V0U2VsZWN0aW9ucyhlZGl0b3IpXG4gICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoJ2xpbmV3aXNlJylcbiAgbmV3IERpc3Bvc2FibGUgLT5cbiAgICBmb3IgJHNlbGVjdGlvbiBpbiBzd3JhcC5nZXRTZWxlY3Rpb25zKGVkaXRvcilcbiAgICAgICRzZWxlY3Rpb24ubm9ybWFsaXplKClcbiAgICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKCdjaGFyYWN0ZXJ3aXNlJylcblxuc3dyYXAuZ2V0UHJvcGVydHlTdG9yZSA9IC0+XG4gIHByb3BlcnR5U3RvcmVcblxubW9kdWxlLmV4cG9ydHMgPSBzd3JhcFxuIl19
