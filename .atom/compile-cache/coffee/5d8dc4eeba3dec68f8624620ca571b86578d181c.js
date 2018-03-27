(function() {
  var BlockwiseSelection, Disposable, Point, Range, SelectionWrapper, assertWithException, getBufferRangeForRowRange, getEndOfLineForBufferRow, getFoldEndRowForRow, getRangeByTranslatePointAndClip, isLinewiseRange, limitNumber, propertyStore, ref, ref1, settings, swrap, translatePointAndClip;

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  ref1 = require('./utils'), translatePointAndClip = ref1.translatePointAndClip, getRangeByTranslatePointAndClip = ref1.getRangeByTranslatePointAndClip, getEndOfLineForBufferRow = ref1.getEndOfLineForBufferRow, getBufferRangeForRowRange = ref1.getBufferRangeForRowRange, limitNumber = ref1.limitNumber, isLinewiseRange = ref1.isLinewiseRange, assertWithException = ref1.assertWithException, getFoldEndRowForRow = ref1.getFoldEndRowForRow;

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
      var end, endRow, ref2, start;
      switch (wise) {
        case 'characterwise':
          return this.translateSelectionEndAndClip('forward');
        case 'linewise':
          ref2 = this.getBufferRange(), start = ref2.start, end = ref2.end;
          endRow = getFoldEndRowForRow(this.selection.editor, end.row);
          return this.setBufferRange(getBufferRangeForRowRange(this.selection.editor, [start.row, endRow]));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NlbGVjdGlvbi13cmFwcGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBNkIsT0FBQSxDQUFRLE1BQVIsQ0FBN0IsRUFBQyxpQkFBRCxFQUFRLGlCQUFSLEVBQWU7O0VBQ2YsT0FTSSxPQUFBLENBQVEsU0FBUixDQVRKLEVBQ0Usa0RBREYsRUFFRSxzRUFGRixFQUdFLHdEQUhGLEVBSUUsMERBSkYsRUFLRSw4QkFMRixFQU1FLHNDQU5GLEVBT0UsOENBUEYsRUFRRTs7RUFFRixRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHVCQUFSOztFQUVyQixhQUFBLEdBQWdCLElBQUk7O0VBRWQ7SUFDUywwQkFBQyxVQUFEO01BQUMsSUFBQyxDQUFBLFlBQUQ7SUFBRDs7K0JBQ2IsYUFBQSxHQUFlLFNBQUE7YUFBRyxhQUFhLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsU0FBbkI7SUFBSDs7K0JBQ2YsYUFBQSxHQUFlLFNBQUE7YUFBRyxhQUFhLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsU0FBbkI7SUFBSDs7K0JBQ2YsYUFBQSxHQUFlLFNBQUMsSUFBRDthQUFVLGFBQWEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxTQUFuQixFQUE4QixJQUE5QjtJQUFWOzsrQkFDZixlQUFBLEdBQWlCLFNBQUE7YUFBRyxhQUFhLEVBQUMsTUFBRCxFQUFiLENBQXFCLElBQUMsQ0FBQSxTQUF0QjtJQUFIOzsrQkFFakIsb0JBQUEsR0FBc0IsU0FBQyxLQUFELEVBQVEsT0FBUjtNQUNwQixJQUFHLEtBQUg7ZUFDRSxJQUFDLENBQUEsY0FBRCxDQUFnQixLQUFoQixFQUF1QixPQUF2QixFQURGOztJQURvQjs7K0JBSXRCLGNBQUEsR0FBZ0Is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QUFzQixTQUFDLE1BQUQ7V0FDcEIsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFmLENBQXNCLENBQUMsS0FBdkIsQ0FBNkIsU0FBQyxVQUFEO2FBQWdCLFVBQVUsQ0FBQyxhQUFYLENBQUE7SUFBaEIsQ0FBN0I7RUFEb0I7O0VBS3RCLEtBQUssQ0FBQyxnQkFBTixHQUF5QixTQUFDLE1BQUQ7QUFDdkIsUUFBQTtBQUFBO0FBQUEsU0FBQSxzQ0FBQTs7TUFDRSxVQUFVLENBQUMsY0FBWCxDQUFBO01BQ0EsVUFBVSxDQUFDLFNBQVgsQ0FBcUIsVUFBckI7QUFGRjtXQUdJLElBQUEsVUFBQSxDQUFXLFNBQUE7QUFDYixVQUFBO0FBQUE7QUFBQTtXQUFBLHdDQUFBOztRQUNFLFVBQVUsQ0FBQyxTQUFYLENBQUE7cUJBQ0EsVUFBVSxDQUFDLFNBQVgsQ0FBcUIsZUFBckI7QUFGRjs7SUFEYSxDQUFYO0VBSm1COztFQVN6QixLQUFLLENBQUMsZ0JBQU4sR0FBeUIsU0FBQTtXQUN2QjtFQUR1Qjs7RUFHekIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE3T2pCIiwic291cmNlc0NvbnRlbnQiOlsie1JhbmdlLCBQb2ludCwgRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue1xuICB0cmFuc2xhdGVQb2ludEFuZENsaXBcbiAgZ2V0UmFuZ2VCeVRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxuICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3dcbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZVxuICBsaW1pdE51bWJlclxuICBpc0xpbmV3aXNlUmFuZ2VcbiAgYXNzZXJ0V2l0aEV4Y2VwdGlvblxuICBnZXRGb2xkRW5kUm93Rm9yUm93XG59ID0gcmVxdWlyZSAnLi91dGlscydcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbkJsb2Nrd2lzZVNlbGVjdGlvbiA9IHJlcXVpcmUgJy4vYmxvY2t3aXNlLXNlbGVjdGlvbidcblxucHJvcGVydHlTdG9yZSA9IG5ldyBNYXBcblxuY2xhc3MgU2VsZWN0aW9uV3JhcHBlclxuICBjb25zdHJ1Y3RvcjogKEBzZWxlY3Rpb24pIC0+XG4gIGhhc1Byb3BlcnRpZXM6IC0+IHByb3BlcnR5U3RvcmUuaGFzKEBzZWxlY3Rpb24pXG4gIGdldFByb3BlcnRpZXM6IC0+IHByb3BlcnR5U3RvcmUuZ2V0KEBzZWxlY3Rpb24pXG4gIHNldFByb3BlcnRpZXM6IChwcm9wKSAtPiBwcm9wZXJ0eVN0b3JlLnNldChAc2VsZWN0aW9uLCBwcm9wKVxuICBjbGVhclByb3BlcnRpZXM6IC0+IHByb3BlcnR5U3RvcmUuZGVsZXRlKEBzZWxlY3Rpb24pXG5cbiAgc2V0QnVmZmVyUmFuZ2VTYWZlbHk6IChyYW5nZSwgb3B0aW9ucykgLT5cbiAgICBpZiByYW5nZVxuICAgICAgQHNldEJ1ZmZlclJhbmdlKHJhbmdlLCBvcHRpb25zKVxuXG4gIGdldEJ1ZmZlclJhbmdlOiAtPlxuICAgIEBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGdldEJ1ZmZlclBvc2l0aW9uRm9yOiAod2hpY2gsIHtmcm9tfT17fSkgLT5cbiAgICBmb3IgX2Zyb20gaW4gZnJvbSA/IFsnc2VsZWN0aW9uJ11cbiAgICAgIHN3aXRjaCBfZnJvbVxuICAgICAgICB3aGVuICdwcm9wZXJ0eSdcbiAgICAgICAgICBjb250aW51ZSB1bmxlc3MgQGhhc1Byb3BlcnRpZXMoKVxuXG4gICAgICAgICAgcHJvcGVydGllcyA9IEBnZXRQcm9wZXJ0aWVzKClcbiAgICAgICAgICByZXR1cm4gc3dpdGNoIHdoaWNoXG4gICAgICAgICAgICB3aGVuICdzdGFydCcgdGhlbiAoaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKCkgdGhlbiBwcm9wZXJ0aWVzLmhlYWQgZWxzZSBwcm9wZXJ0aWVzLnRhaWwpXG4gICAgICAgICAgICB3aGVuICdlbmQnIHRoZW4gKGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpIHRoZW4gcHJvcGVydGllcy50YWlsIGVsc2UgcHJvcGVydGllcy5oZWFkKVxuICAgICAgICAgICAgd2hlbiAnaGVhZCcgdGhlbiBwcm9wZXJ0aWVzLmhlYWRcbiAgICAgICAgICAgIHdoZW4gJ3RhaWwnIHRoZW4gcHJvcGVydGllcy50YWlsXG5cbiAgICAgICAgd2hlbiAnc2VsZWN0aW9uJ1xuICAgICAgICAgIHJldHVybiBzd2l0Y2ggd2hpY2hcbiAgICAgICAgICAgIHdoZW4gJ3N0YXJ0JyB0aGVuIEBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydFxuICAgICAgICAgICAgd2hlbiAnZW5kJyB0aGVuIEBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5lbmRcbiAgICAgICAgICAgIHdoZW4gJ2hlYWQnIHRoZW4gQHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgICAgICAgICAgd2hlbiAndGFpbCcgdGhlbiBAc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG4gICAgbnVsbFxuXG4gIHNldEJ1ZmZlclBvc2l0aW9uVG86ICh3aGljaCkgLT5cbiAgICBAc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihAZ2V0QnVmZmVyUG9zaXRpb25Gb3Iod2hpY2gpKVxuXG4gIHNldFJldmVyc2VkU3RhdGU6IChpc1JldmVyc2VkKSAtPlxuICAgIHJldHVybiBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSBpcyBpc1JldmVyc2VkXG4gICAgYXNzZXJ0V2l0aEV4Y2VwdGlvbihAaGFzUHJvcGVydGllcygpLCBcInRyeWluZyB0byByZXZlcnNlIHNlbGVjdGlvbiB3aGljaCBpcyBub24tZW1wdHkgYW5kIHByb3BlcnR5LWxlc3NzXCIpXG5cbiAgICB7aGVhZCwgdGFpbH0gPSBAZ2V0UHJvcGVydGllcygpXG4gICAgQHNldFByb3BlcnRpZXMoaGVhZDogdGFpbCwgdGFpbDogaGVhZClcblxuICAgIEBzZXRCdWZmZXJSYW5nZSBAZ2V0QnVmZmVyUmFuZ2UoKSxcbiAgICAgIGF1dG9zY3JvbGw6IHRydWVcbiAgICAgIHJldmVyc2VkOiBpc1JldmVyc2VkXG4gICAgICBrZWVwR29hbENvbHVtbjogZmFsc2VcblxuICBnZXRSb3dzOiAtPlxuICAgIFtzdGFydFJvdywgZW5kUm93XSA9IEBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICAgIFtzdGFydFJvdy4uZW5kUm93XVxuXG4gIGdldFJvd0NvdW50OiAtPlxuICAgIEBnZXRSb3dzKCkubGVuZ3RoXG5cbiAgZ2V0VGFpbEJ1ZmZlclJhbmdlOiAtPlxuICAgIHtlZGl0b3J9ID0gQHNlbGVjdGlvblxuICAgIHRhaWxQb2ludCA9IEBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcbiAgICBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgcG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoZWRpdG9yLCB0YWlsUG9pbnQsICdiYWNrd2FyZCcpXG4gICAgICBuZXcgUmFuZ2UocG9pbnQsIHRhaWxQb2ludClcbiAgICBlbHNlXG4gICAgICBwb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChlZGl0b3IsIHRhaWxQb2ludCwgJ2ZvcndhcmQnKVxuICAgICAgbmV3IFJhbmdlKHRhaWxQb2ludCwgcG9pbnQpXG5cbiAgc2F2ZVByb3BlcnRpZXM6IChpc05vcm1hbGl6ZWQpIC0+XG4gICAgaGVhZCA9IEBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICB0YWlsID0gQHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuICAgIGlmIEBzZWxlY3Rpb24uaXNFbXB0eSgpIG9yIGlzTm9ybWFsaXplZFxuICAgICAgcHJvcGVydGllcyA9IHtoZWFkLCB0YWlsfVxuICAgIGVsc2VcbiAgICAgICMgV2Ugc2VsZWN0UmlnaHQtZWQgaW4gdmlzdWFsLW1vZGUsIHRoaXMgdHJhbnNsYXRpb24gZGUtZWZmZWN0IHNlbGVjdC1yaWdodC1lZmZlY3RcbiAgICAgICMgU28gdGhhdCB3ZSBjYW4gYWN0aXZhdGUtdmlzdWFsLW1vZGUgd2l0aG91dCBzcGVjaWFsIHRyYW5zbGF0aW9uIGFmdGVyIHJlc3RvcmVpbmcgcHJvcGVydGllcy5cbiAgICAgIGVuZCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAc2VsZWN0aW9uLmVkaXRvciwgQGdldEJ1ZmZlclJhbmdlKCkuZW5kLCAnYmFja3dhcmQnKVxuICAgICAgaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgICAgcHJvcGVydGllcyA9IHtoZWFkOiBoZWFkLCB0YWlsOiBlbmR9XG4gICAgICBlbHNlXG4gICAgICAgIHByb3BlcnRpZXMgPSB7aGVhZDogZW5kLCB0YWlsOiB0YWlsfVxuICAgIEBzZXRQcm9wZXJ0aWVzKHByb3BlcnRpZXMpXG5cbiAgZml4UHJvcGVydHlSb3dUb1Jvd1JhbmdlOiAtPlxuICAgIHtoZWFkLCB0YWlsfSA9IEBnZXRQcm9wZXJ0aWVzKClcbiAgICBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgW2hlYWQucm93LCB0YWlsLnJvd10gPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICBlbHNlXG4gICAgICBbdGFpbC5yb3csIGhlYWQucm93XSA9IEBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuXG4gICMgTk9URTpcbiAgIyAnd2lzZScgbXVzdCBiZSAnY2hhcmFjdGVyd2lzZScgb3IgJ2xpbmV3aXNlJ1xuICAjIFVzZSB0aGlzIGZvciBub3JtYWxpemVkKG5vbi1zZWxlY3QtcmlnaHQtZWQpIHNlbGVjdGlvbi5cbiAgYXBwbHlXaXNlOiAod2lzZSkgLT5cbiAgICBzd2l0Y2ggd2lzZVxuICAgICAgd2hlbiAnY2hhcmFjdGVyd2lzZSdcbiAgICAgICAgQHRyYW5zbGF0ZVNlbGVjdGlvbkVuZEFuZENsaXAoJ2ZvcndhcmQnKSAjIGVxdWl2YWxlbnQgdG8gY29yZSBzZWxlY3Rpb24uc2VsZWN0UmlnaHQgYnV0IGtlZXAgZ29hbENvbHVtblxuICAgICAgd2hlbiAnbGluZXdpc2UnXG4gICAgICAgICMgRXZlbiBpZiBlbmQuY29sdW1uIGlzIDAsIGV4cGFuZCBvdmVyIHRoYXQgZW5kLnJvdyggZG9uJ3QgdXNlIHNlbGVjdGlvbi5nZXRSb3dSYW5nZSgpIClcbiAgICAgICAge3N0YXJ0LCBlbmR9ID0gQGdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgZW5kUm93ID0gZ2V0Rm9sZEVuZFJvd0ZvclJvdyhAc2VsZWN0aW9uLmVkaXRvciwgZW5kLnJvdykgIyBjb3ZlciBmb2xkZWQgcm93UmFuZ2VcbiAgICAgICAgQHNldEJ1ZmZlclJhbmdlKGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UoQHNlbGVjdGlvbi5lZGl0b3IsIFtzdGFydC5yb3csIGVuZFJvd10pKVxuICAgICAgd2hlbiAnYmxvY2t3aXNlJ1xuICAgICAgICBuZXcgQmxvY2t3aXNlU2VsZWN0aW9uKEBzZWxlY3Rpb24pXG5cbiAgc2VsZWN0QnlQcm9wZXJ0aWVzOiAoe2hlYWQsIHRhaWx9KSAtPlxuICAgICMgTm8gcHJvYmxlbSBpZiBoZWFkIGlzIGdyZWF0ZXIgdGhhbiB0YWlsLCBSYW5nZSBjb25zdHJ1Y3RvciBzd2FwIHN0YXJ0L2VuZC5cbiAgICBAc2V0QnVmZmVyUmFuZ2UgW3RhaWwsIGhlYWRdLFxuICAgICAgYXV0b3Njcm9sbDogdHJ1ZVxuICAgICAgcmV2ZXJzZWQ6IGhlYWQuaXNMZXNzVGhhbih0YWlsKVxuICAgICAga2VlcEdvYWxDb2x1bW46IGZhbHNlXG5cbiAgIyBzZXQgc2VsZWN0aW9ucyBidWZmZXJSYW5nZSB3aXRoIGRlZmF1bHQgb3B0aW9uIHthdXRvc2Nyb2xsOiBmYWxzZSwgcHJlc2VydmVGb2xkczogdHJ1ZX1cbiAgc2V0QnVmZmVyUmFuZ2U6IChyYW5nZSwgb3B0aW9ucz17fSkgLT5cbiAgICBpZiBvcHRpb25zLmtlZXBHb2FsQ29sdW1uID8gdHJ1ZVxuICAgICAgZ29hbENvbHVtbiA9IEBzZWxlY3Rpb24uY3Vyc29yLmdvYWxDb2x1bW5cbiAgICBkZWxldGUgb3B0aW9ucy5rZWVwR29hbENvbHVtblxuICAgIG9wdGlvbnMuYXV0b3Njcm9sbCA/PSBmYWxzZVxuICAgIG9wdGlvbnMucHJlc2VydmVGb2xkcyA/PSB0cnVlXG4gICAgQHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZSwgb3B0aW9ucylcbiAgICBAc2VsZWN0aW9uLmN1cnNvci5nb2FsQ29sdW1uID0gZ29hbENvbHVtbiBpZiBnb2FsQ29sdW1uP1xuXG4gIGlzU2luZ2xlUm93OiAtPlxuICAgIFtzdGFydFJvdywgZW5kUm93XSA9IEBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICAgIHN0YXJ0Um93IGlzIGVuZFJvd1xuXG4gIGlzTGluZXdpc2VSYW5nZTogLT5cbiAgICBpc0xpbmV3aXNlUmFuZ2UoQGdldEJ1ZmZlclJhbmdlKCkpXG5cbiAgZGV0ZWN0V2lzZTogLT5cbiAgICBpZiBAaXNMaW5ld2lzZVJhbmdlKClcbiAgICAgICdsaW5ld2lzZSdcbiAgICBlbHNlXG4gICAgICAnY2hhcmFjdGVyd2lzZSdcblxuICAjIGRpcmVjdGlvbiBtdXN0IGJlIG9uZSBvZiBbJ2ZvcndhcmQnLCAnYmFja3dhcmQnXVxuICB0cmFuc2xhdGVTZWxlY3Rpb25FbmRBbmRDbGlwOiAoZGlyZWN0aW9uKSAtPlxuICAgIG5ld1JhbmdlID0gZ2V0UmFuZ2VCeVRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAc2VsZWN0aW9uLmVkaXRvciwgQGdldEJ1ZmZlclJhbmdlKCksIFwiZW5kXCIsIGRpcmVjdGlvbilcbiAgICBAc2V0QnVmZmVyUmFuZ2UobmV3UmFuZ2UpXG5cbiAgIyBSZXR1cm4gc2VsZWN0aW9uIGV4dGVudCB0byByZXBsYXkgYmxvY2t3aXNlIHNlbGVjdGlvbiBvbiBgLmAgcmVwZWF0aW5nLlxuICBnZXRCbG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQ6IC0+XG4gICAgaGVhZCA9IEBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICB0YWlsID0gQHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuICAgIG5ldyBQb2ludChoZWFkLnJvdyAtIHRhaWwucm93LCBoZWFkLmNvbHVtbiAtIHRhaWwuY29sdW1uKVxuXG4gICMgV2hhdCdzIHRoZSBub3JtYWxpemU/XG4gICMgTm9ybWFsaXphdGlvbiBpcyByZXN0b3JlIHNlbGVjdGlvbiByYW5nZSBmcm9tIHByb3BlcnR5LlxuICAjIEFzIGEgcmVzdWx0IGl0IHJhbmdlIGJlY2FtZSByYW5nZSB3aGVyZSBlbmQgb2Ygc2VsZWN0aW9uIG1vdmVkIHRvIGxlZnQuXG4gICMgVGhpcyBlbmQtbW92ZS10by1sZWZ0IGRlLWVmZWN0IG9mIGVuZC1tb2RlLXRvLXJpZ2h0IGVmZmVjdCggdGhpcyBpcyB2aXN1YWwtbW9kZSBvcmllbnRhdGlvbiApXG4gIG5vcm1hbGl6ZTogLT5cbiAgICAjIGVtcHR5IHNlbGVjdGlvbiBJUyBhbHJlYWR5ICdub3JtYWxpemVkJ1xuICAgIHJldHVybiBpZiBAc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgIHVubGVzcyBAaGFzUHJvcGVydGllcygpXG4gICAgICBpZiBzZXR0aW5ncy5nZXQoJ3N0cmljdEFzc2VydGlvbicpXG4gICAgICAgIGFzc2VydFdpdGhFeGNlcHRpb24oZmFsc2UsIFwiYXR0ZW1wdGVkIHRvIG5vcm1hbGl6ZSBidXQgbm8gcHJvcGVydGllcyB0byByZXN0b3JlXCIpXG4gICAgICBAc2F2ZVByb3BlcnRpZXMoKVxuICAgIHtoZWFkLCB0YWlsfSA9IEBnZXRQcm9wZXJ0aWVzKClcbiAgICBAc2V0QnVmZmVyUmFuZ2UoW3RhaWwsIGhlYWRdKVxuXG5zd3JhcCA9IChzZWxlY3Rpb24pIC0+XG4gIG5ldyBTZWxlY3Rpb25XcmFwcGVyKHNlbGVjdGlvbilcblxuIyBCbG9ja3dpc2VTZWxlY3Rpb24gcHJveHlcbnN3cmFwLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMgPSAoZWRpdG9yKSAtPlxuICBCbG9ja3dpc2VTZWxlY3Rpb24uZ2V0U2VsZWN0aW9ucyhlZGl0b3IpXG5cbnN3cmFwLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb25zID0gKGVkaXRvcikgLT5cbiAgQmxvY2t3aXNlU2VsZWN0aW9uLmdldExhc3RTZWxlY3Rpb24oZWRpdG9yKVxuXG5zd3JhcC5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yKSAtPlxuICBCbG9ja3dpc2VTZWxlY3Rpb24uZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKGVkaXRvcilcblxuc3dyYXAuY2xlYXJCbG9ja3dpc2VTZWxlY3Rpb25zID0gKGVkaXRvcikgLT5cbiAgQmxvY2t3aXNlU2VsZWN0aW9uLmNsZWFyU2VsZWN0aW9ucyhlZGl0b3IpXG5cbnN3cmFwLmdldFNlbGVjdGlvbnMgPSAoZWRpdG9yKSAtPlxuICBlZGl0b3IuZ2V0U2VsZWN0aW9ucyhlZGl0b3IpLm1hcChzd3JhcClcblxuc3dyYXAuc2V0UmV2ZXJzZWRTdGF0ZSA9IChlZGl0b3IsIHJldmVyc2VkKSAtPlxuICAkc2VsZWN0aW9uLnNldFJldmVyc2VkU3RhdGUocmV2ZXJzZWQpIGZvciAkc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKGVkaXRvcilcblxuc3dyYXAuZGV0ZWN0V2lzZSA9IChlZGl0b3IpIC0+XG4gIGlmIEBnZXRTZWxlY3Rpb25zKGVkaXRvcikuZXZlcnkoKCRzZWxlY3Rpb24pIC0+ICRzZWxlY3Rpb24uZGV0ZWN0V2lzZSgpIGlzICdsaW5ld2lzZScpXG4gICAgJ2xpbmV3aXNlJ1xuICBlbHNlXG4gICAgJ2NoYXJhY3Rlcndpc2UnXG5cbnN3cmFwLmNsZWFyUHJvcGVydGllcyA9IChlZGl0b3IpIC0+XG4gICRzZWxlY3Rpb24uY2xlYXJQcm9wZXJ0aWVzKCkgZm9yICRzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoZWRpdG9yKVxuXG5zd3JhcC5kdW1wUHJvcGVydGllcyA9IChlZGl0b3IpIC0+XG4gIHtpbnNwZWN0fSA9IHJlcXVpcmUgJ3V0aWwnXG4gIGZvciAkc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKGVkaXRvcikgd2hlbiAkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKVxuICAgIGNvbnNvbGUubG9nIGluc3BlY3QoJHNlbGVjdGlvbi5nZXRQcm9wZXJ0aWVzKCkpXG5cbnN3cmFwLm5vcm1hbGl6ZSA9IChlZGl0b3IpIC0+XG4gIGlmIEJsb2Nrd2lzZVNlbGVjdGlvbi5oYXMoZWRpdG9yKVxuICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQmxvY2t3aXNlU2VsZWN0aW9uLmdldFNlbGVjdGlvbnMoZWRpdG9yKVxuICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmNsZWFyU2VsZWN0aW9ucyhlZGl0b3IpXG4gIGVsc2VcbiAgICBmb3IgJHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucyhlZGl0b3IpXG4gICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG5cbnN3cmFwLmhhc1Byb3BlcnRpZXMgPSAoZWRpdG9yKSAtPlxuICBAZ2V0U2VsZWN0aW9ucyhlZGl0b3IpLmV2ZXJ5ICgkc2VsZWN0aW9uKSAtPiAkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKVxuXG4jIFJldHVybiBmdW5jdGlvbiB0byByZXN0b3JlXG4jIFVzZWQgaW4gdm1wLW1vdmUtc2VsZWN0ZWQtdGV4dFxuc3dyYXAuc3dpdGNoVG9MaW5ld2lzZSA9IChlZGl0b3IpIC0+XG4gIGZvciAkc2VsZWN0aW9uIGluIHN3cmFwLmdldFNlbGVjdGlvbnMoZWRpdG9yKVxuICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKCdsaW5ld2lzZScpXG4gIG5ldyBEaXNwb3NhYmxlIC0+XG4gICAgZm9yICRzZWxlY3Rpb24gaW4gc3dyYXAuZ2V0U2VsZWN0aW9ucyhlZGl0b3IpXG4gICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZSgnY2hhcmFjdGVyd2lzZScpXG5cbnN3cmFwLmdldFByb3BlcnR5U3RvcmUgPSAtPlxuICBwcm9wZXJ0eVN0b3JlXG5cbm1vZHVsZS5leHBvcnRzID0gc3dyYXBcbiJdfQ==
