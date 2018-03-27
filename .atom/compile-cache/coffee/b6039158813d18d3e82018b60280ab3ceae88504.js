(function() {
  var BlockwiseSelection, Disposable, Point, Range, SelectionWrapper, assertWithException, getBufferRangeForRowRange, getEndOfLineForBufferRow, getRangeByTranslatePointAndClip, isLinewiseRange, limitNumber, propertyStore, ref, ref1, swrap, translatePointAndClip;

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  ref1 = require('./utils'), translatePointAndClip = ref1.translatePointAndClip, getRangeByTranslatePointAndClip = ref1.getRangeByTranslatePointAndClip, getEndOfLineForBufferRow = ref1.getEndOfLineForBufferRow, getBufferRangeForRowRange = ref1.getBufferRangeForRowRange, limitNumber = ref1.limitNumber, isLinewiseRange = ref1.isLinewiseRange, assertWithException = ref1.assertWithException;

  BlockwiseSelection = null;

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
      if (this.hasProperties()) {
        ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail;
        this.setProperties({
          head: tail,
          tail: head
        });
      }
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
      assertWithException(this.hasProperties(), "trying to applyWise " + wise + " on properties-less selection");
      switch (wise) {
        case 'characterwise':
          return this.translateSelectionEndAndClip('forward');
        case 'linewise':
          ref2 = this.getBufferRange(), start = ref2.start, end = ref2.end;
          return this.setBufferRange(getBufferRangeForRowRange(this.selection.editor, [start.row, end.row]));
        case 'blockwise':
          if (BlockwiseSelection == null) {
            BlockwiseSelection = require('./blockwise-selection');
          }
          return new BlockwiseSelection(this.selection);
      }
    };

    SelectionWrapper.prototype.selectByProperties = function(arg, options) {
      var head, tail;
      head = arg.head, tail = arg.tail;
      this.setBufferRange([tail, head], options);
      return this.setReversedState(head.isLessThan(tail));
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
      if (this.selection.isEmpty()) {
        return;
      }
      assertWithException(this.hasProperties(), "attempted to normalize but no properties to restore");
      this.fixPropertyRowToRowRange();
      return this.selectByProperties(this.getProperties());
    };

    return SelectionWrapper;

  })();

  swrap = function(selection) {
    return new SelectionWrapper(selection);
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
    if (BlockwiseSelection == null) {
      BlockwiseSelection = require('./blockwise-selection');
    }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NlbGVjdGlvbi13cmFwcGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBNkIsT0FBQSxDQUFRLE1BQVIsQ0FBN0IsRUFBQyxpQkFBRCxFQUFRLGlCQUFSLEVBQWU7O0VBQ2YsT0FRSSxPQUFBLENBQVEsU0FBUixDQVJKLEVBQ0Usa0RBREYsRUFFRSxzRUFGRixFQUdFLHdEQUhGLEVBSUUsMERBSkYsRUFLRSw4QkFMRixFQU1FLHNDQU5GLEVBT0U7O0VBRUYsa0JBQUEsR0FBcUI7O0VBRXJCLGFBQUEsR0FBZ0IsSUFBSTs7RUFFZDtJQUNTLDBCQUFDLFVBQUQ7TUFBQyxJQUFDLENBQUEsWUFBRDtJQUFEOzsrQkFDYixhQUFBLEdBQWUsU0FBQTthQUFHLGFBQWEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxTQUFuQjtJQUFIOzsrQkFDZixhQUFBLEdBQWUsU0FBQTthQUFHLGFBQWEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxTQUFuQjtJQUFIOzsrQkFDZixhQUFBLEdBQWUsU0FBQyxJQUFEO2FBQVUsYUFBYSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFNBQW5CLEVBQThCLElBQTlCO0lBQVY7OytCQUNmLGVBQUEsR0FBaUIsU0FBQTthQUFHLGFBQWEsRUFBQyxNQUFELEVBQWIsQ0FBcUIsSUFBQyxDQUFBLFNBQXRCO0lBQUg7OytCQUVqQixvQkFBQSxHQUFzQixTQUFDLEtBQUQsRUFBUSxPQUFSO01BQ3BCLElBQUcsS0FBSDtlQUNFLElBQUMsQ0FBQSxjQUFELENBQWdCLEtBQWhCLEVBQXVCLE9BQXZCLEVBREY7O0lBRG9COzsrQkFJdEIsY0FBQSxHQUFnQixTQUFBO2FBQ2QsSUFBQyxDQUFBLFNBQVMsQ0FBQyxjQUFYLENBQUE7SUFEYzs7K0JBR2hCLG9CQUFB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M05qQiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgUG9pbnQsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntcbiAgdHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIGdldFJhbmdlQnlUcmFuc2xhdGVQb2ludEFuZENsaXBcbiAgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93XG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2VcbiAgbGltaXROdW1iZXJcbiAgaXNMaW5ld2lzZVJhbmdlXG4gIGFzc2VydFdpdGhFeGNlcHRpb25cbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuQmxvY2t3aXNlU2VsZWN0aW9uID0gbnVsbFxuXG5wcm9wZXJ0eVN0b3JlID0gbmV3IE1hcFxuXG5jbGFzcyBTZWxlY3Rpb25XcmFwcGVyXG4gIGNvbnN0cnVjdG9yOiAoQHNlbGVjdGlvbikgLT5cbiAgaGFzUHJvcGVydGllczogLT4gcHJvcGVydHlTdG9yZS5oYXMoQHNlbGVjdGlvbilcbiAgZ2V0UHJvcGVydGllczogLT4gcHJvcGVydHlTdG9yZS5nZXQoQHNlbGVjdGlvbilcbiAgc2V0UHJvcGVydGllczogKHByb3ApIC0+IHByb3BlcnR5U3RvcmUuc2V0KEBzZWxlY3Rpb24sIHByb3ApXG4gIGNsZWFyUHJvcGVydGllczogLT4gcHJvcGVydHlTdG9yZS5kZWxldGUoQHNlbGVjdGlvbilcblxuICBzZXRCdWZmZXJSYW5nZVNhZmVseTogKHJhbmdlLCBvcHRpb25zKSAtPlxuICAgIGlmIHJhbmdlXG4gICAgICBAc2V0QnVmZmVyUmFuZ2UocmFuZ2UsIG9wdGlvbnMpXG5cbiAgZ2V0QnVmZmVyUmFuZ2U6IC0+XG4gICAgQHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZ2V0QnVmZmVyUG9zaXRpb25Gb3I6ICh3aGljaCwge2Zyb219PXt9KSAtPlxuICAgIGZvciBfZnJvbSBpbiBmcm9tID8gWydzZWxlY3Rpb24nXVxuICAgICAgc3dpdGNoIF9mcm9tXG4gICAgICAgIHdoZW4gJ3Byb3BlcnR5J1xuICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBAaGFzUHJvcGVydGllcygpXG5cbiAgICAgICAgICBwcm9wZXJ0aWVzID0gQGdldFByb3BlcnRpZXMoKVxuICAgICAgICAgIHJldHVybiBzd2l0Y2ggd2hpY2hcbiAgICAgICAgICAgIHdoZW4gJ3N0YXJ0JyB0aGVuIChpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSB0aGVuIHByb3BlcnRpZXMuaGVhZCBlbHNlIHByb3BlcnRpZXMudGFpbClcbiAgICAgICAgICAgIHdoZW4gJ2VuZCcgdGhlbiAoaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKCkgdGhlbiBwcm9wZXJ0aWVzLnRhaWwgZWxzZSBwcm9wZXJ0aWVzLmhlYWQpXG4gICAgICAgICAgICB3aGVuICdoZWFkJyB0aGVuIHByb3BlcnRpZXMuaGVhZFxuICAgICAgICAgICAgd2hlbiAndGFpbCcgdGhlbiBwcm9wZXJ0aWVzLnRhaWxcblxuICAgICAgICB3aGVuICdzZWxlY3Rpb24nXG4gICAgICAgICAgcmV0dXJuIHN3aXRjaCB3aGljaFxuICAgICAgICAgICAgd2hlbiAnc3RhcnQnIHRoZW4gQHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgICAgICAgICB3aGVuICdlbmQnIHRoZW4gQHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmVuZFxuICAgICAgICAgICAgd2hlbiAnaGVhZCcgdGhlbiBAc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgICAgICB3aGVuICd0YWlsJyB0aGVuIEBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcbiAgICBudWxsXG5cbiAgc2V0QnVmZmVyUG9zaXRpb25UbzogKHdoaWNoKSAtPlxuICAgIEBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKEBnZXRCdWZmZXJQb3NpdGlvbkZvcih3aGljaCkpXG5cbiAgc2V0UmV2ZXJzZWRTdGF0ZTogKGlzUmV2ZXJzZWQpIC0+XG4gICAgcmV0dXJuIGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpIGlzIGlzUmV2ZXJzZWRcblxuICAgIGlmIEBoYXNQcm9wZXJ0aWVzKClcbiAgICAgIHtoZWFkLCB0YWlsfSA9IEBnZXRQcm9wZXJ0aWVzKClcbiAgICAgIEBzZXRQcm9wZXJ0aWVzKGhlYWQ6IHRhaWwsIHRhaWw6IGhlYWQpXG5cbiAgICBAc2V0QnVmZmVyUmFuZ2UgQGdldEJ1ZmZlclJhbmdlKCksXG4gICAgICBhdXRvc2Nyb2xsOiB0cnVlXG4gICAgICByZXZlcnNlZDogaXNSZXZlcnNlZFxuICAgICAga2VlcEdvYWxDb2x1bW46IGZhbHNlXG5cbiAgZ2V0Um93czogLT5cbiAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICBbc3RhcnRSb3cuLmVuZFJvd11cblxuICBnZXRSb3dDb3VudDogLT5cbiAgICBAZ2V0Um93cygpLmxlbmd0aFxuXG4gIGdldFRhaWxCdWZmZXJSYW5nZTogLT5cbiAgICB7ZWRpdG9yfSA9IEBzZWxlY3Rpb25cbiAgICB0YWlsUG9pbnQgPSBAc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIHBvaW50ID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKGVkaXRvciwgdGFpbFBvaW50LCAnYmFja3dhcmQnKVxuICAgICAgbmV3IFJhbmdlKHBvaW50LCB0YWlsUG9pbnQpXG4gICAgZWxzZVxuICAgICAgcG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoZWRpdG9yLCB0YWlsUG9pbnQsICdmb3J3YXJkJylcbiAgICAgIG5ldyBSYW5nZSh0YWlsUG9pbnQsIHBvaW50KVxuXG4gIHNhdmVQcm9wZXJ0aWVzOiAoaXNOb3JtYWxpemVkKSAtPlxuICAgIGhlYWQgPSBAc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgdGFpbCA9IEBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcbiAgICBpZiBAc2VsZWN0aW9uLmlzRW1wdHkoKSBvciBpc05vcm1hbGl6ZWRcbiAgICAgIHByb3BlcnRpZXMgPSB7aGVhZCwgdGFpbH1cbiAgICBlbHNlXG4gICAgICAjIFdlIHNlbGVjdFJpZ2h0LWVkIGluIHZpc3VhbC1tb2RlLCB0aGlzIHRyYW5zbGF0aW9uIGRlLWVmZmVjdCBzZWxlY3QtcmlnaHQtZWZmZWN0XG4gICAgICAjIFNvIHRoYXQgd2UgY2FuIGFjdGl2YXRlLXZpc3VhbC1tb2RlIHdpdGhvdXQgc3BlY2lhbCB0cmFuc2xhdGlvbiBhZnRlciByZXN0b3JlaW5nIHByb3BlcnRpZXMuXG4gICAgICBlbmQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQHNlbGVjdGlvbi5lZGl0b3IsIEBnZXRCdWZmZXJSYW5nZSgpLmVuZCwgJ2JhY2t3YXJkJylcbiAgICAgIGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICAgIHByb3BlcnRpZXMgPSB7aGVhZDogaGVhZCwgdGFpbDogZW5kfVxuICAgICAgZWxzZVxuICAgICAgICBwcm9wZXJ0aWVzID0ge2hlYWQ6IGVuZCwgdGFpbDogdGFpbH1cbiAgICBAc2V0UHJvcGVydGllcyhwcm9wZXJ0aWVzKVxuXG4gIGZpeFByb3BlcnR5Um93VG9Sb3dSYW5nZTogLT5cbiAgICB7aGVhZCwgdGFpbH0gPSBAZ2V0UHJvcGVydGllcygpXG4gICAgaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIFtoZWFkLnJvdywgdGFpbC5yb3ddID0gQHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgZWxzZVxuICAgICAgW3RhaWwucm93LCBoZWFkLnJvd10gPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcblxuICAjIE5PVEU6XG4gICMgJ3dpc2UnIG11c3QgYmUgJ2NoYXJhY3Rlcndpc2UnIG9yICdsaW5ld2lzZSdcbiAgIyBVc2UgdGhpcyBmb3Igbm9ybWFsaXplZChub24tc2VsZWN0LXJpZ2h0LWVkKSBzZWxlY3Rpb24uXG4gIGFwcGx5V2lzZTogKHdpc2UpIC0+XG4gICAgYXNzZXJ0V2l0aEV4Y2VwdGlvbihAaGFzUHJvcGVydGllcygpLCBcInRyeWluZyB0byBhcHBseVdpc2UgI3t3aXNlfSBvbiBwcm9wZXJ0aWVzLWxlc3Mgc2VsZWN0aW9uXCIpXG4gICAgc3dpdGNoIHdpc2VcbiAgICAgIHdoZW4gJ2NoYXJhY3Rlcndpc2UnXG4gICAgICAgIEB0cmFuc2xhdGVTZWxlY3Rpb25FbmRBbmRDbGlwKCdmb3J3YXJkJykgIyBlcXVpdmFsZW50IHRvIGNvcmUgc2VsZWN0aW9uLnNlbGVjdFJpZ2h0IGJ1dCBrZWVwIGdvYWxDb2x1bW5cbiAgICAgIHdoZW4gJ2xpbmV3aXNlJ1xuICAgICAgICAjIEV2ZW4gaWYgZW5kLmNvbHVtbiBpcyAwLCBleHBhbmQgb3ZlciB0aGF0IGVuZC5yb3coIGRvbid0IGNhcmUgc2VsZWN0aW9uLmdldFJvd1JhbmdlKCkgKVxuICAgICAgICB7c3RhcnQsIGVuZH0gPSBAZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgICBAc2V0QnVmZmVyUmFuZ2UoZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAc2VsZWN0aW9uLmVkaXRvciwgW3N0YXJ0LnJvdywgZW5kLnJvd10pKVxuICAgICAgd2hlbiAnYmxvY2t3aXNlJ1xuICAgICAgICBCbG9ja3dpc2VTZWxlY3Rpb24gPz0gcmVxdWlyZSAnLi9ibG9ja3dpc2Utc2VsZWN0aW9uJ1xuICAgICAgICBuZXcgQmxvY2t3aXNlU2VsZWN0aW9uKEBzZWxlY3Rpb24pXG5cbiAgc2VsZWN0QnlQcm9wZXJ0aWVzOiAoe2hlYWQsIHRhaWx9LCBvcHRpb25zKSAtPlxuICAgICMgTm8gcHJvYmxlbSBpZiBoZWFkIGlzIGdyZWF0ZXIgdGhhbiB0YWlsLCBSYW5nZSBjb25zdHJ1Y3RvciBzd2FwIHN0YXJ0L2VuZC5cbiAgICBAc2V0QnVmZmVyUmFuZ2UoW3RhaWwsIGhlYWRdLCBvcHRpb25zKVxuICAgIEBzZXRSZXZlcnNlZFN0YXRlKGhlYWQuaXNMZXNzVGhhbih0YWlsKSlcblxuICAjIHNldCBzZWxlY3Rpb25zIGJ1ZmZlclJhbmdlIHdpdGggZGVmYXVsdCBvcHRpb24ge2F1dG9zY3JvbGw6IGZhbHNlLCBwcmVzZXJ2ZUZvbGRzOiB0cnVlfVxuICBzZXRCdWZmZXJSYW5nZTogKHJhbmdlLCBvcHRpb25zPXt9KSAtPlxuICAgIGlmIG9wdGlvbnMua2VlcEdvYWxDb2x1bW4gPyB0cnVlXG4gICAgICBnb2FsQ29sdW1uID0gQHNlbGVjdGlvbi5jdXJzb3IuZ29hbENvbHVtblxuICAgIGRlbGV0ZSBvcHRpb25zLmtlZXBHb2FsQ29sdW1uXG4gICAgb3B0aW9ucy5hdXRvc2Nyb2xsID89IGZhbHNlXG4gICAgb3B0aW9ucy5wcmVzZXJ2ZUZvbGRzID89IHRydWVcbiAgICBAc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCBvcHRpb25zKVxuICAgIEBzZWxlY3Rpb24uY3Vyc29yLmdvYWxDb2x1bW4gPSBnb2FsQ29sdW1uIGlmIGdvYWxDb2x1bW4/XG5cbiAgaXNTaW5nbGVSb3c6IC0+XG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gQHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgc3RhcnRSb3cgaXMgZW5kUm93XG5cbiAgaXNMaW5ld2lzZVJhbmdlOiAtPlxuICAgIGlzTGluZXdpc2VSYW5nZShAZ2V0QnVmZmVyUmFuZ2UoKSlcblxuICBkZXRlY3RXaXNlOiAtPlxuICAgIGlmIEBpc0xpbmV3aXNlUmFuZ2UoKVxuICAgICAgJ2xpbmV3aXNlJ1xuICAgIGVsc2VcbiAgICAgICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gICMgZGlyZWN0aW9uIG11c3QgYmUgb25lIG9mIFsnZm9yd2FyZCcsICdiYWNrd2FyZCddXG4gIHRyYW5zbGF0ZVNlbGVjdGlvbkVuZEFuZENsaXA6IChkaXJlY3Rpb24pIC0+XG4gICAgbmV3UmFuZ2UgPSBnZXRSYW5nZUJ5VHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBzZWxlY3Rpb24uZWRpdG9yLCBAZ2V0QnVmZmVyUmFuZ2UoKSwgXCJlbmRcIiwgZGlyZWN0aW9uKVxuICAgIEBzZXRCdWZmZXJSYW5nZShuZXdSYW5nZSlcblxuICAjIFJldHVybiBzZWxlY3Rpb24gZXh0ZW50IHRvIHJlcGxheSBibG9ja3dpc2Ugc2VsZWN0aW9uIG9uIGAuYCByZXBlYXRpbmcuXG4gIGdldEJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudDogLT5cbiAgICBoZWFkID0gQHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIHRhaWwgPSBAc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG4gICAgbmV3IFBvaW50KGhlYWQucm93IC0gdGFpbC5yb3csIGhlYWQuY29sdW1uIC0gdGFpbC5jb2x1bW4pXG5cbiAgIyBXaGF0J3MgdGhlIG5vcm1hbGl6ZT9cbiAgIyBOb3JtYWxpemF0aW9uIGlzIHJlc3RvcmUgc2VsZWN0aW9uIHJhbmdlIGZyb20gcHJvcGVydHkuXG4gICMgQXMgYSByZXN1bHQgaXQgcmFuZ2UgYmVjYW1lIHJhbmdlIHdoZXJlIGVuZCBvZiBzZWxlY3Rpb24gbW92ZWQgdG8gbGVmdC5cbiAgIyBUaGlzIGVuZC1tb3ZlLXRvLWxlZnQgZGUtZWZlY3Qgb2YgZW5kLW1vZGUtdG8tcmlnaHQgZWZmZWN0KCB0aGlzIGlzIHZpc3VhbC1tb2RlIG9yaWVudGF0aW9uIClcbiAgbm9ybWFsaXplOiAtPlxuICAgICMgZW1wdHkgc2VsZWN0aW9uIElTIGFscmVhZHkgJ25vcm1hbGl6ZWQnXG4gICAgcmV0dXJuIGlmIEBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgYXNzZXJ0V2l0aEV4Y2VwdGlvbihAaGFzUHJvcGVydGllcygpLCBcImF0dGVtcHRlZCB0byBub3JtYWxpemUgYnV0IG5vIHByb3BlcnRpZXMgdG8gcmVzdG9yZVwiKVxuICAgIEBmaXhQcm9wZXJ0eVJvd1RvUm93UmFuZ2UoKVxuICAgIEBzZWxlY3RCeVByb3BlcnRpZXMoQGdldFByb3BlcnRpZXMoKSlcblxuc3dyYXAgPSAoc2VsZWN0aW9uKSAtPlxuICBuZXcgU2VsZWN0aW9uV3JhcHBlcihzZWxlY3Rpb24pXG5cbnN3cmFwLmdldFNlbGVjdGlvbnMgPSAoZWRpdG9yKSAtPlxuICBlZGl0b3IuZ2V0U2VsZWN0aW9ucyhlZGl0b3IpLm1hcChzd3JhcClcblxuc3dyYXAuc2V0UmV2ZXJzZWRTdGF0ZSA9IChlZGl0b3IsIHJldmVyc2VkKSAtPlxuICAkc2VsZWN0aW9uLnNldFJldmVyc2VkU3RhdGUocmV2ZXJzZWQpIGZvciAkc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKGVkaXRvcilcblxuc3dyYXAuZGV0ZWN0V2lzZSA9IChlZGl0b3IpIC0+XG4gIGlmIEBnZXRTZWxlY3Rpb25zKGVkaXRvcikuZXZlcnkoKCRzZWxlY3Rpb24pIC0+ICRzZWxlY3Rpb24uZGV0ZWN0V2lzZSgpIGlzICdsaW5ld2lzZScpXG4gICAgJ2xpbmV3aXNlJ1xuICBlbHNlXG4gICAgJ2NoYXJhY3Rlcndpc2UnXG5cbnN3cmFwLmNsZWFyUHJvcGVydGllcyA9IChlZGl0b3IpIC0+XG4gICRzZWxlY3Rpb24uY2xlYXJQcm9wZXJ0aWVzKCkgZm9yICRzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoZWRpdG9yKVxuXG5zd3JhcC5kdW1wUHJvcGVydGllcyA9IChlZGl0b3IpIC0+XG4gIHtpbnNwZWN0fSA9IHJlcXVpcmUgJ3V0aWwnXG4gIGZvciAkc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKGVkaXRvcikgd2hlbiAkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKVxuICAgIGNvbnNvbGUubG9nIGluc3BlY3QoJHNlbGVjdGlvbi5nZXRQcm9wZXJ0aWVzKCkpXG5cbnN3cmFwLm5vcm1hbGl6ZSA9IChlZGl0b3IpIC0+XG4gIEJsb2Nrd2lzZVNlbGVjdGlvbiA/PSByZXF1aXJlICcuL2Jsb2Nrd2lzZS1zZWxlY3Rpb24nXG4gIGlmIEJsb2Nrd2lzZVNlbGVjdGlvbi5oYXMoZWRpdG9yKSNibG9ja3dpc2VTZWxlY3Rpb25zID1cbiAgICBmb3IgYmxvY2t3aXNlU2VsZWN0aW9uIGluIEJsb2Nrd2lzZVNlbGVjdGlvbi5nZXRTZWxlY3Rpb25zKGVkaXRvcilcbiAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5ub3JtYWxpemUoKVxuICAgIEJsb2Nrd2lzZVNlbGVjdGlvbi5jbGVhclNlbGVjdGlvbnMoZWRpdG9yKVxuICBlbHNlXG4gICAgZm9yICRzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoZWRpdG9yKVxuICAgICAgJHNlbGVjdGlvbi5ub3JtYWxpemUoKVxuXG5zd3JhcC5oYXNQcm9wZXJ0aWVzID0gKGVkaXRvcikgLT5cbiAgQGdldFNlbGVjdGlvbnMoZWRpdG9yKS5ldmVyeSAoJHNlbGVjdGlvbikgLT4gJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKClcblxuIyBSZXR1cm4gZnVuY3Rpb24gdG8gcmVzdG9yZVxuIyBVc2VkIGluIHZtcC1tb3ZlLXNlbGVjdGVkLXRleHRcbnN3cmFwLnN3aXRjaFRvTGluZXdpc2UgPSAoZWRpdG9yKSAtPlxuICBmb3IgJHNlbGVjdGlvbiBpbiBzd3JhcC5nZXRTZWxlY3Rpb25zKGVkaXRvcilcbiAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcbiAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZSgnbGluZXdpc2UnKVxuICBuZXcgRGlzcG9zYWJsZSAtPlxuICAgIGZvciAkc2VsZWN0aW9uIGluIHN3cmFwLmdldFNlbGVjdGlvbnMoZWRpdG9yKVxuICAgICAgJHNlbGVjdGlvbi5ub3JtYWxpemUoKVxuICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoJ2NoYXJhY3Rlcndpc2UnKVxuXG5zd3JhcC5nZXRQcm9wZXJ0eVN0b3JlID0gLT5cbiAgcHJvcGVydHlTdG9yZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN3cmFwXG4iXX0=
