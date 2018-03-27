(function() {
  var CompositeDisposable, Emitter, OccurrenceManager, _, collectRangeInBufferRow, isInvalidMarker, ref, ref1, shrinkRangeEndToBeforeNewLine;

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('./utils'), shrinkRangeEndToBeforeNewLine = ref1.shrinkRangeEndToBeforeNewLine, collectRangeInBufferRow = ref1.collectRangeInBufferRow;

  isInvalidMarker = function(marker) {
    return !marker.isValid();
  };

  module.exports = OccurrenceManager = (function() {
    OccurrenceManager.prototype.patterns = null;

    OccurrenceManager.prototype.markerOptions = {
      invalidate: 'inside'
    };

    function OccurrenceManager(vimState) {
      var decorationOptions, ref2;
      this.vimState = vimState;
      ref2 = this.vimState, this.editor = ref2.editor, this.editorElement = ref2.editorElement, this.swrap = ref2.swrap;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.emitter = new Emitter;
      this.patterns = [];
      this.markerLayer = this.editor.addMarkerLayer();
      decorationOptions = {
        type: 'highlight',
        "class": "vim-mode-plus-occurrence-base"
      };
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, decorationOptions);
      this.onDidChangePatterns((function(_this) {
        return function(arg) {
          var occurrenceType, pattern;
          pattern = arg.pattern, occurrenceType = arg.occurrenceType;
          if (pattern) {
            _this.markBufferRangeByPattern(pattern, occurrenceType);
            return _this.updateEditorElement();
          } else {
            return _this.clearMarkers();
          }
        };
      })(this));
      this.markerLayer.onDidUpdate(this.destroyInvalidMarkers.bind(this));
    }

    OccurrenceManager.prototype.markBufferRangeByPattern = function(pattern, occurrenceType) {
      var isSubwordRange, subwordPattern, subwordRangesByRow;
      if (occurrenceType === 'subword') {
        subwordRangesByRow = {};
        subwordPattern = this.editor.getLastCursor().subwordRegExp();
        isSubwordRange = (function(_this) {
          return function(range) {
            var row, subwordRanges;
            row = range.start.row;
            subwordRanges = subwordRangesByRow[row] != null ? subwordRangesByRow[row] : subwordRangesByRow[row] = collectRangeInBufferRow(_this.editor, row, subwordPattern);
            return subwordRanges.some(function(subwordRange) {
              return subwordRange.isEqual(range);
            });
          };
        })(this);
      }
      return this.editor.scan(pattern, (function(_this) {
        return function(arg) {
          var matchText, range;
          range = arg.range, matchText = arg.matchText;
          if (occurrenceType === 'subword') {
            if (!isSubwordRange(range)) {
              return;
            }
          }
          return _this.markerLayer.markBufferRange(range, _this.markerOptions);
        };
      })(this));
    };

    OccurrenceManager.prototype.updateEditorElement = function() {
      return this.editorElement.classList.toggle("has-occurrence", this.hasMarkers());
    };

    OccurrenceManager.prototype.onDidChangePatterns = function(fn) {
      return this.emitter.on('did-change-patterns', fn);
    };

    OccurrenceManager.prototype.destroy = function() {
      this.decorationLayer.destroy();
      this.disposables.dispose();
      return this.markerLayer.destroy();
    };

    OccurrenceManager.prototype.hasPatterns = function() {
      return this.patterns.length > 0;
    };

    OccurrenceManager.prototype.resetPatterns = function() {
      this.patterns = [];
      return this.emitter.emit('did-change-patterns', {});
    };

    OccurrenceManager.prototype.addPattern = function(pattern, arg) {
      var occurrenceType, ref2, reset;
      if (pattern == null) {
        pattern = null;
      }
      ref2 = arg != null ? arg : {}, reset = ref2.reset, occurrenceType = ref2.occurrenceType;
      if (reset) {
        this.clearMarkers();
      }
      this.patterns.push(pattern);
      if (occurrenceType == null) {
        occurrenceType = 'base';
      }
      return this.emitter.emit('did-change-patterns', {
        pattern: pattern,
        occurrenceType: occurrenceType
      });
    };

    OccurrenceManager.prototype.saveLastPattern = function(occurrenceType) {
      if (occurrenceType == null) {
        occurrenceType = null;
      }
      this.vimState.globalState.set("lastOccurrencePattern", this.buildPattern());
      return this.vimState.globalState.set("lastOccurrenceType", occurrenceType);
    };

    OccurrenceManager.prototype.buildPattern = function() {
      var source;
      source = this.patterns.map(function(pattern) {
        return pattern.source;
      }).join('|');
      return new RegExp(source, 'g');
    };

    OccurrenceManager.prototype.clearMarkers = function() {
      this.markerLayer.clear();
      return this.updateEditorElement();
    };

    OccurrenceManager.prototype.destroyMarkers = function(markers) {
      var i, len, marker;
      for (i = 0, len = markers.length; i < len; i++) {
        marker = markers[i];
        marker.destroy();
      }
      return this.updateEditorElement();
    };

    OccurrenceManager.prototype.destroyInvalidMarkers = function() {
      return this.destroyMarkers(this.getMarkers().filter(isInvalidMarker));
    };

    OccurrenceManager.prototype.hasMarkers = function() {
      return this.markerLayer.getMarkerCount() > 0;
    };

    OccurrenceManager.prototype.getMarkers = function() {
      return this.markerLayer.getMarkers();
    };

    OccurrenceManager.prototype.getMarkerBufferRanges = function() {
      return this.markerLayer.getMarkers().map(function(marker) {
        return marker.getBufferRange();
      });
    };

    OccurrenceManager.prototype.getMarkerCount = function() {
      return this.markerLayer.getMarkerCount();
    };

    OccurrenceManager.prototype.getMarkersIntersectsWithSelection = function(selection, exclusive) {
      var range;
      if (exclusive == null) {
        exclusive = false;
      }
      range = shrinkRangeEndToBeforeNewLine(selection.getBufferRange());
      return this.markerLayer.findMarkers({
        intersectsBufferRange: range
      }).filter(function(marker) {
        return range.intersectsWith(marker.getBufferRange(), exclusive);
      });
    };

    OccurrenceManager.prototype.getMarkerAtPoint = function(point) {
      var i, len, marker, markers;
      markers = this.markerLayer.findMarkers({
        containsBufferPosition: point
      });
      for (i = 0, len = markers.length; i < len; i++) {
        marker = markers[i];
        if (marker.getBufferRange().end.isGreaterThan(point)) {
          return marker;
        }
      }
    };

    OccurrenceManager.prototype.select = function() {
      var $selection, allRanges, closestRange, i, indexByOldSelection, isVisualMode, j, len, len1, markers, markersSelected, ranges, ref2, ref3, selection, selections;
      isVisualMode = this.vimState.mode === 'visual';
      indexByOldSelection = new Map;
      allRanges = [];
      markersSelected = [];
      ref2 = this.editor.getSelections();
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        if (!(markers = this.getMarkersIntersectsWithSelection(selection, isVisualMode)).length) {
          continue;
        }
        ranges = markers.map(function(marker) {
          return marker.getBufferRange();
        });
        markersSelected.push.apply(markersSelected, markers);
        closestRange = this.getClosestRangeForSelection(ranges, selection);
        _.remove(ranges, closestRange);
        ranges.push(closestRange);
        allRanges.push.apply(allRanges, ranges);
        indexByOldSelection.set(selection, allRanges.indexOf(closestRange));
      }
      if (allRanges.length) {
        if (isVisualMode) {
          this.vimState.modeManager.deactivate();
          this.vimState.submode = null;
        }
        this.editor.setSelectedBufferRanges(allRanges);
        selections = this.editor.getSelections();
        indexByOldSelection.forEach((function(_this) {
          return function(index, selection) {
            return _this.vimState.mutationManager.migrateMutation(selection, selections[index]);
          };
        })(this));
        this.destroyMarkers(markersSelected);
        ref3 = this.swrap.getSelections(this.editor);
        for (j = 0, len1 = ref3.length; j < len1; j++) {
          $selection = ref3[j];
          $selection.saveProperties();
        }
        return true;
      } else {
        return false;
      }
    };

    OccurrenceManager.prototype.getClosestRangeForSelection = function(ranges, selection) {
      var i, j, k, len, len1, len2, point, range, rangesStartFromSameRow;
      point = this.vimState.mutationManager.mutationsBySelection.get(selection).initialPoint;
      for (i = 0, len = ranges.length; i < len; i++) {
        range = ranges[i];
        if (range.containsPoint(point)) {
          return range;
        }
      }
      rangesStartFromSameRow = ranges.filter(function(range) {
        return range.start.row === point.row;
      });
      if (rangesStartFromSameRow.length) {
        for (j = 0, len1 = rangesStartFromSameRow.length; j < len1; j++) {
          range = rangesStartFromSameRow[j];
          if (range.start.isGreaterThan(point)) {
            return range;
          }
        }
        return rangesStartFromSameRow[0];
      }
      for (k = 0, len2 = ranges.length; k < len2; k++) {
        range = ranges[k];
        if (range.start.isGreaterThan(point)) {
          return range;
        }
      }
      return ranges[0];
    };

    return OccurrenceManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29jY3VycmVuY2UtbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxxQkFBRCxFQUFVOztFQUNWLE9BR0ksT0FBQSxDQUFRLFNBQVIsQ0FISixFQUNFLGtFQURGLEVBRUU7O0VBR0YsZUFBQSxHQUFrQixTQUFDLE1BQUQ7V0FBWSxDQUFJLE1BQU0sQ0FBQyxPQUFQLENBQUE7RUFBaEI7O0VBRWxCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Z0NBQ0osUUFBQSxHQUFVOztnQ0FDVixhQUFBLEdBQWU7TUFBQyxVQUFBLEVBQVksUUFBYjs7O0lBRUYsMkJBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDtNQUNaLE9BQW9DLElBQUMsQ0FBQSxRQUFyQyxFQUFDLElBQUMsQ0FBQSxjQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEscUJBQUEsYUFBWCxFQUEwQixJQUFDLENBQUEsYUFBQTtNQUMzQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQXZCLENBQWpCO01BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BQ2YsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUVaLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUE7TUFDZixpQkFBQSxHQUFvQjtRQUFDLElBQUEsRUFBTSxXQUFQO1FBQW9CLENBQUEsS0FBQSxDQUFBLEVBQU8sK0JBQTNCOztNQUNwQixJQUFDLENBQUEsZUFBRCxHQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLG1CQUFSLENBQTRCLElBQUMsQ0FBQSxXQUE3QixFQUEwQyxpQkFBMUM7TUFLbkIsSUFBQyxDQUFBLG1CQUFELENBQXFCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQ25CLGNBQUE7VUFEcUIsdUJBQVM7VUFDOUIsSUFBRyxPQUFIO1lBQ0UsS0FBQyxDQUFBLHdCQUFELENBQTBCLE9BQTFCLEVBQW1DLGNBQW5DO21CQUNBLEtBQUMsQ0FBQSxtQkFBRCxDQUFBLEVBRkY7V0FBQSxNQUFBO21CQUlFLEtBQUMsQ0FBQSxZQUFELENBQUEsRUFKRjs7UUFEbUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCO01BT0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQXlCLElBQUMsQ0FBQSxxQkFBcUIsQ0FBQyxJQUF2QixDQUE0QixJQUE1QixDQUF6QjtJQXJCVzs7Z0NBdUJiLHdCQUFBLEdBQTBCLFNBQUMsT0FBRCxFQUFVLGNBQVY7QUFDeEIsVUFBQTtNQUFBLElBQUcsY0FBQSxLQUFrQixTQUFyQjtRQUNFLGtCQUFBLEdBQXFCO1FBQ3JCLGNBQUEsR0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsQ0FBdUIsQ0FBQyxhQUF4QixDQUFBO1FBQ2pCLGNBQUEsR0FBaUIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxLQUFEO0FBQ2YsZ0JBQUE7WUFBQSxHQUFBLEdBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztZQUNsQixhQUFBLHFDQUFnQixrQkFBbUIsQ0FBQSxHQUFBLElBQW5CLGtCQUFtQixDQUFBLEdBQUEsSUFBUSx1QkFBQSxDQUF3QixLQUFDLENBQUEsTUFBekIsRUFBaUMsR0FBakMsRUFBc0MsY0FBdEM7bUJBQzNDLGFBQWEsQ0FBQyxJQUFkLENBQW1CLFNBQUMsWUFBRDtxQkFBa0IsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsS0FBckI7WUFBbEIsQ0FBbkI7VUFIZTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsRUFIbkI7O2FBUUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsT0FBYixFQUFzQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUNwQixjQUFBO1VBRHNCLG1CQUFPO1VBQzdCLElBQUcsY0FBQSxLQUFrQixTQUFyQjtZQUNFLElBQUEsQ0FBYyxjQUFBLENBQWUsS0FBZixDQUFkO0FBQUEscUJBQUE7YUFERjs7aUJBRUEsS0FBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLEtBQTdCLEVBQW9DLEtBQUMsQ0FBQSxhQUFyQztRQUhvQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7SUFUd0I7O2dDQWMxQixtQkFBQSxHQUFxQixTQUFBO2FBQ25CLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLGdCQUFoQyxFQUFrRCxJQUFDLENBQUEsVUFBRCxDQUFBLENBQWxEO0lBRG1COztnQ0FLckIsbUJBQUEsR0FBcUIsU0FBQyxFQUFEO2FBQ25CLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLHFCQUFaLEVBQW1DLEVBQW5DO0lBRG1COztnQ0FHckIsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsZUFBZSxDQUFDLE9BQWpCLENBQUE7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTthQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO0lBSE87O2dDQU1ULFdBQUEsR0FBYSxTQUFBO2FBQ1gsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLEdBQW1CO0lBRFI7O2dDQUdiLGFBQUEsR0FBZSxTQUFBO01BQ2IsSUFBQyxDQUFBLFFBQUQsR0FBWTthQUNaLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLHFCQUFkLEVBQXFDLEVBQXJDO0lBRmE7O2dDQUlmLFVBQUEsR0FBWSxTQUFDLE9BQUQsRUFBZSxHQUFmO0FBQ1YsVUFBQTs7UUFEVyxVQUFROzsyQkFBTSxNQUF3QixJQUF2QixvQkFBTztNQUNqQyxJQUFtQixLQUFuQjtRQUFBLElBQUMsQ0FBQSxZQUFELENBQUEsRUFBQTs7TUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxPQUFmOztRQUNBLGlCQUFrQjs7YUFDbEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMscUJBQWQsRUFBcUM7UUFBQyxTQUFBLE9BQUQ7UUFBVSxnQkFBQSxjQUFWO09BQXJDO0lBSlU7O2dDQU1aLGVBQUEsR0FBaUIsU0FBQyxjQUFEOztRQUFDLGlCQUFlOztNQUMvQixJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUF0QixDQUEwQix1QkFBMUIsRUFBbUQsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUFuRDthQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQXRCLENBQTBCLG9CQUExQixFQUFnRCxjQUFoRDtJQUZlOztnQ0FRakIsWUFBQSxHQUFjLFNBQUE7QUFDWixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFNBQUMsT0FBRDtlQUFhLE9BQU8sQ0FBQztNQUFyQixDQUFkLENBQTBDLENBQUMsSUFBM0MsQ0FBZ0QsR0FBaEQ7YUFDTCxJQUFBLE1BQUEsQ0FBTyxNQUFQLEVBQWUsR0FBZjtJQUZROztnQ0FNZCxZQUFBLEdBQWMsU0FBQTtNQUNaLElBQUMsQ0FBQSxXQUFXLENBQUMsS0FBYixDQUFBO2FBQ0EsSUFBQyxDQUFBLG1CQUFELENBQUE7SUFGWTs7Z0NBSWQsY0FBQSxHQUFnQixTQUFDLE9BQUQ7QUFDZCxVQUFBO0FBQUEsV0FBQSx5Q0FBQTs7UUFBQSxNQUFNLENBQUMsT0FBUCxDQUFBO0FBQUE7YUFFQSxJQUFDLENBQUEsbUJBQUQsQ0FBQTtJQUhjOztnQ0FLaEIscUJBQUEsR0FBdUIsU0FBQTthQUNyQixJQUFDLENBQUEsY0FBRCxDQUFnQixJQUFDLENBQUEsVUFBRCxDQUFBLENBQWEsQ0FBQyxNQUFkLENBQXFCLGVBQXJCLENBQWhCO0lBRHFCOztnQ0FHdkIsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBQSxDQUFBLEdBQWdDO0lBRHRCOztnQ0FHWixVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUFBO0lBRFU7O2dDQUdaLHFCQUFBLEdBQXVCLFNBQUE7YUFDckIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQUEsQ0FBeUIsQ0FBQyxHQUExQixDQUE4QixTQUFDLE1BQUQ7ZUFBWSxNQUFNLENBQUMsY0FBUCxDQUFBO01BQVosQ0FBOUI7SUFEcUI7O2dDQUd2QixjQUFBLEdBQWdCLFNBQUE7YUFDZCxJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBQTtJQURjOztnQ0FJaEIsaUNBQUEsR0FBbUMsU0FBQyxTQUFELEVBQVksU0FBWjtBQUtqQyxVQUFBOztRQUw2QyxZQUFVOztNQUt2RCxLQUFBLEdBQVEsNkJBQUEsQ0FBOEIsU0FBUyxDQUFDLGNBQVYsQ0FBQSxDQUE5QjthQUNSLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUF5QjtRQUFBLHFCQUFBLEVBQXVCLEtBQXZCO09BQXpCLENBQXNELENBQUMsTUFBdkQsQ0FBOEQsU0FBQyxNQUFEO2VBQzVELEtBQUssQ0FBQyxjQUFOLENBQXFCLE1BQU0sQ0FBQyxjQUFQLENBQUEsQ0FBckIsRUFBOEMsU0FBOUM7TUFENEQsQ0FBOUQ7SUFOaUM7O2dDQVNuQyxnQkFBQSxHQUFrQixTQUFDLEtBQUQ7QUFDaEIsVUFBQTtNQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUI7UUFBQSxzQkFBQSxFQUF3QixLQUF4QjtPQUF6QjtBQUlWLFdBQUEseUNBQUE7O1lBQTJCLE1BQU0sQ0FBQyxjQUFQLENBQUEsQ0FBdUIsQ0FBQyxHQUFHLENBQUMsYUFBNUIsQ0FBMEMsS0FBMUM7QUFDekIsaUJBQU87O0FBRFQ7SUFMZ0I7O2dDQWVsQixNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSxZQUFBLEdBQWUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLEtBQWtCO01BQ2pDLG1CQUFBLEdBQXNCLElBQUk7TUFDMUIsU0FBQSxHQUFZO01BQ1osZUFBQSxHQUFrQjtBQUVsQjtBQUFBLFdBQUEsc0NBQUE7O2FBQThDLENBQUMsT0FBQSxHQUFVLElBQUMsQ0FBQSxpQ0FBRCxDQUFtQyxTQUFuQyxFQUE4QyxZQUE5QyxDQUFYLENBQXVFLENBQUM7OztRQUNwSCxNQUFBLEdBQVMsT0FBTyxDQUFDLEdBQVIsQ0FBWSxTQUFDLE1BQUQ7aUJBQVksTUFBTSxDQUFDLGNBQVAsQ0FBQTtRQUFaLENBQVo7UUFDVCxlQUFlLENBQUMsSUFBaEIsd0JBQXFCLE9BQXJCO1FBSUEsWUFBQSxHQUFlLElBQUMsQ0FBQSwyQkFBRCxDQUE2QixNQUE3QixFQUFxQyxTQUFyQztRQUNmLENBQUMsQ0FBQyxNQUFGLENBQVMsTUFBVCxFQUFpQixZQUFqQjtRQUNBLE1BQU0sQ0FBQyxJQUFQLENBQVksWUFBWjtRQUNBLFNBQVMsQ0FBQyxJQUFWLGtCQUFlLE1BQWY7UUFDQSxtQkFBbUIsQ0FBQyxHQUFwQixDQUF3QixTQUF4QixFQUFtQyxTQUFTLENBQUMsT0FBVixDQUFrQixZQUFsQixDQUFuQztBQVZGO01BWUEsSUFBRyxTQUFTLENBQUMsTUFBYjtRQUNFLElBQUcsWUFBSDtVQUVFLElBQUMsQ0FBQSxRQUFRLENBQUMsV0FBVyxDQUFDLFVBQXRCLENBQUE7VUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVYsR0FBb0IsS0FIdEI7O1FBS0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFnQyxTQUFoQztRQUNBLFVBQUEsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQTtRQUNiLG1CQUFtQixDQUFDLE9BQXBCLENBQTRCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsS0FBRCxFQUFRLFNBQVI7bUJBQzFCLEtBQUMsQ0FBQSxRQUFRLENBQUMsZUFBZSxDQUFDLGVBQTFCLENBQTBDLFNBQTFDLEVBQXFELFVBQVcsQ0FBQSxLQUFBLENBQWhFO1VBRDBCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QjtRQUdBLElBQUMsQ0FBQSxjQUFELENBQWdCLGVBQWhCO0FBQ0E7QUFBQSxhQUFBLHdDQUFBOztVQUNFLFVBQVUsQ0FBQyxjQUFYLENBQUE7QUFERjtlQUVBLEtBZEY7T0FBQSxNQUFBO2VBZ0JFLE1BaEJGOztJQWxCTTs7Z0NBeUNSLDJCQUFBLEdBQTZCLFNBQUMsTUFBRCxFQUFTLFNBQVQ7QUFDM0IsVUFBQTtNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsUUFBUSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxHQUEvQyxDQUFtRCxTQUFuRCxDQUE2RCxDQUFDO0FBRXRFLFdBQUEsd0NBQUE7O1lBQXlCLEtBQUssQ0FBQyxhQUFOLENBQW9CLEtBQXBCO0FBQ3ZCLGlCQUFPOztBQURUO01BR0Esc0JBQUEsR0FBeUIsTUFBTSxDQUFDLE1BQVAsQ0FBYyxTQUFDLEtBQUQ7ZUFBVyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQVosS0FBbUIsS0FBSyxDQUFDO01BQXBDLENBQWQ7TUFFekIsSUFBRyxzQkFBc0IsQ0FBQyxNQUExQjtBQUNFLGFBQUEsMERBQUE7O2NBQXlDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBWixDQUEwQixLQUExQjtBQUN2QyxtQkFBTzs7QUFEVDtBQUVBLGVBQU8sc0JBQXVCLENBQUEsQ0FBQSxFQUhoQzs7QUFLQSxXQUFBLDBDQUFBOztZQUF5QixLQUFLLENBQUMsS0FBSyxDQUFDLGFBQVosQ0FBMEIsS0FBMUI7QUFDdkIsaUJBQU87O0FBRFQ7YUFHQSxNQUFPLENBQUEsQ0FBQTtJQWhCb0I7Ozs7O0FBdEwvQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue1xuICBzaHJpbmtSYW5nZUVuZFRvQmVmb3JlTmV3TGluZVxuICBjb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvd1xufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmlzSW52YWxpZE1hcmtlciA9IChtYXJrZXIpIC0+IG5vdCBtYXJrZXIuaXNWYWxpZCgpXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIE9jY3VycmVuY2VNYW5hZ2VyXG4gIHBhdHRlcm5zOiBudWxsXG4gIG1hcmtlck9wdGlvbnM6IHtpbnZhbGlkYXRlOiAnaW5zaWRlJ31cblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBzd3JhcH0gPSBAdmltU3RhdGVcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAcGF0dGVybnMgPSBbXVxuXG4gICAgQG1hcmtlckxheWVyID0gQGVkaXRvci5hZGRNYXJrZXJMYXllcigpXG4gICAgZGVjb3JhdGlvbk9wdGlvbnMgPSB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiBcInZpbS1tb2RlLXBsdXMtb2NjdXJyZW5jZS1iYXNlXCJ9XG4gICAgQGRlY29yYXRpb25MYXllciA9IEBlZGl0b3IuZGVjb3JhdGVNYXJrZXJMYXllcihAbWFya2VyTGF5ZXIsIGRlY29yYXRpb25PcHRpb25zKVxuXG4gICAgIyBAcGF0dGVybnMgaXMgc2luZ2xlIHNvdXJjZSBvZiB0cnV0aCAoU1NPVClcbiAgICAjIEFsbCBtYWtlciBjcmVhdGUvZGVzdHJveS9jc3MtdXBkYXRlIGlzIGRvbmUgYnkgcmVhY3RpbmcgQHBhdHRlcnMncyBjaGFuZ2UuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgQG9uRGlkQ2hhbmdlUGF0dGVybnMgKHtwYXR0ZXJuLCBvY2N1cnJlbmNlVHlwZX0pID0+XG4gICAgICBpZiBwYXR0ZXJuXG4gICAgICAgIEBtYXJrQnVmZmVyUmFuZ2VCeVBhdHRlcm4ocGF0dGVybiwgb2NjdXJyZW5jZVR5cGUpXG4gICAgICAgIEB1cGRhdGVFZGl0b3JFbGVtZW50KClcbiAgICAgIGVsc2VcbiAgICAgICAgQGNsZWFyTWFya2VycygpXG5cbiAgICBAbWFya2VyTGF5ZXIub25EaWRVcGRhdGUoQGRlc3Ryb3lJbnZhbGlkTWFya2Vycy5iaW5kKHRoaXMpKVxuXG4gIG1hcmtCdWZmZXJSYW5nZUJ5UGF0dGVybjogKHBhdHRlcm4sIG9jY3VycmVuY2VUeXBlKSAtPlxuICAgIGlmIG9jY3VycmVuY2VUeXBlIGlzICdzdWJ3b3JkJ1xuICAgICAgc3Vid29yZFJhbmdlc0J5Um93ID0ge30gIyBjYWNoZVxuICAgICAgc3Vid29yZFBhdHRlcm4gPSBAZWRpdG9yLmdldExhc3RDdXJzb3IoKS5zdWJ3b3JkUmVnRXhwKClcbiAgICAgIGlzU3Vid29yZFJhbmdlID0gKHJhbmdlKSA9PlxuICAgICAgICByb3cgPSByYW5nZS5zdGFydC5yb3dcbiAgICAgICAgc3Vid29yZFJhbmdlcyA9IHN1YndvcmRSYW5nZXNCeVJvd1tyb3ddID89IGNvbGxlY3RSYW5nZUluQnVmZmVyUm93KEBlZGl0b3IsIHJvdywgc3Vid29yZFBhdHRlcm4pXG4gICAgICAgIHN1YndvcmRSYW5nZXMuc29tZSAoc3Vid29yZFJhbmdlKSAtPiBzdWJ3b3JkUmFuZ2UuaXNFcXVhbChyYW5nZSlcblxuICAgIEBlZGl0b3Iuc2NhbiBwYXR0ZXJuLCAoe3JhbmdlLCBtYXRjaFRleHR9KSA9PlxuICAgICAgaWYgb2NjdXJyZW5jZVR5cGUgaXMgJ3N1YndvcmQnXG4gICAgICAgIHJldHVybiB1bmxlc3MgaXNTdWJ3b3JkUmFuZ2UocmFuZ2UpXG4gICAgICBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclJhbmdlKHJhbmdlLCBAbWFya2VyT3B0aW9ucylcblxuICB1cGRhdGVFZGl0b3JFbGVtZW50OiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJoYXMtb2NjdXJyZW5jZVwiLCBAaGFzTWFya2VycygpKVxuXG4gICMgQ2FsbGJhY2sgZ2V0IHBhc3NlZCBmb2xsb3dpbmcgb2JqZWN0XG4gICMgLSBwYXR0ZXJuOiBjYW4gYmUgdW5kZWZpbmVkIG9uIHJlc2V0IGV2ZW50XG4gIG9uRGlkQ2hhbmdlUGF0dGVybnM6IChmbikgLT5cbiAgICBAZW1pdHRlci5vbignZGlkLWNoYW5nZS1wYXR0ZXJucycsIGZuKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGRlY29yYXRpb25MYXllci5kZXN0cm95KClcbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQG1hcmtlckxheWVyLmRlc3Ryb3koKVxuXG4gICMgUGF0dGVybnNcbiAgaGFzUGF0dGVybnM6IC0+XG4gICAgQHBhdHRlcm5zLmxlbmd0aCA+IDBcblxuICByZXNldFBhdHRlcm5zOiAtPlxuICAgIEBwYXR0ZXJucyA9IFtdXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1wYXR0ZXJucycsIHt9KVxuXG4gIGFkZFBhdHRlcm46IChwYXR0ZXJuPW51bGwsIHtyZXNldCwgb2NjdXJyZW5jZVR5cGV9PXt9KSAtPlxuICAgIEBjbGVhck1hcmtlcnMoKSBpZiByZXNldFxuICAgIEBwYXR0ZXJucy5wdXNoKHBhdHRlcm4pXG4gICAgb2NjdXJyZW5jZVR5cGUgPz0gJ2Jhc2UnXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1wYXR0ZXJucycsIHtwYXR0ZXJuLCBvY2N1cnJlbmNlVHlwZX0pXG5cbiAgc2F2ZUxhc3RQYXR0ZXJuOiAob2NjdXJyZW5jZVR5cGU9bnVsbCkgLT5cbiAgICBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuc2V0KFwibGFzdE9jY3VycmVuY2VQYXR0ZXJuXCIsIEBidWlsZFBhdHRlcm4oKSlcbiAgICBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuc2V0KFwibGFzdE9jY3VycmVuY2VUeXBlXCIsIG9jY3VycmVuY2VUeXBlKVxuXG4gICMgUmV0dXJuIHJlZ2V4IHJlcHJlc2VudGluZyBmaW5hbCBwYXR0ZXJuLlxuICAjIFVzZWQgdG8gY2FjaGUgZmluYWwgcGF0dGVybiB0byBlYWNoIGluc3RhbmNlIG9mIG9wZXJhdG9yIHNvIHRoYXQgd2UgY2FuXG4gICMgcmVwZWF0IHJlY29yZGVkIG9wZXJhdGlvbiBieSBgLmAuXG4gICMgUGF0dGVybiBjYW4gYmUgYWRkZWQgaW50ZXJhY3RpdmVseSBvbmUgYnkgb25lLCBidXQgd2Ugc2F2ZSBpdCBhcyB1bmlvbiBwYXR0ZXJuLlxuICBidWlsZFBhdHRlcm46IC0+XG4gICAgc291cmNlID0gQHBhdHRlcm5zLm1hcCgocGF0dGVybikgLT4gcGF0dGVybi5zb3VyY2UpLmpvaW4oJ3wnKVxuICAgIG5ldyBSZWdFeHAoc291cmNlLCAnZycpXG5cbiAgIyBNYXJrZXJzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjbGVhck1hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmNsZWFyKClcbiAgICBAdXBkYXRlRWRpdG9yRWxlbWVudCgpXG5cbiAgZGVzdHJveU1hcmtlcnM6IChtYXJrZXJzKSAtPlxuICAgIG1hcmtlci5kZXN0cm95KCkgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG4gICAgIyB3aGVuZXJ2ZXIgd2UgZGVzdHJveSBtYXJrZXIsIHdlIHNob3VsZCBzeW5jIGBoYXMtb2NjdXJyZW5jZWAgc2NvcGUgaW4gbWFya2VyIHN0YXRlLi5cbiAgICBAdXBkYXRlRWRpdG9yRWxlbWVudCgpXG5cbiAgZGVzdHJveUludmFsaWRNYXJrZXJzOiAtPlxuICAgIEBkZXN0cm95TWFya2VycyhAZ2V0TWFya2VycygpLmZpbHRlcihpc0ludmFsaWRNYXJrZXIpKVxuXG4gIGhhc01hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KCkgPiAwXG5cbiAgZ2V0TWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VycygpXG5cbiAgZ2V0TWFya2VyQnVmZmVyUmFuZ2VzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJzKCkubWFwIChtYXJrZXIpIC0+IG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZ2V0TWFya2VyQ291bnQ6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KClcblxuICAjIFJldHVybiBvY2N1cnJlbmNlIG1hcmtlcnMgaW50ZXJzZWN0aW5nIGdpdmVuIHJhbmdlc1xuICBnZXRNYXJrZXJzSW50ZXJzZWN0c1dpdGhTZWxlY3Rpb246IChzZWxlY3Rpb24sIGV4Y2x1c2l2ZT1mYWxzZSkgLT5cbiAgICAjIGZpbmRtYXJrZXJzKCkncyBpbnRlcnNlY3RzQnVmZmVyUmFuZ2UgcGFyYW0gaGF2ZSBubyBleGNsdXNpdmUgY29udHJvbFxuICAgICMgU28gbmVlZCBleHRyYSBjaGVjayB0byBmaWx0ZXIgb3V0IHVud2FudGVkIG1hcmtlci5cbiAgICAjIEJ1dCBiYXNpY2FsbHkgSSBzaG91bGQgcHJlZmVyIGZpbmRNYXJrZXIgc2luY2UgSXQncyBmYXN0IHRoYW4gaXRlcmF0aW5nXG4gICAgIyB3aG9sZSBtYXJrZXJzIG1hbnVhbGx5LlxuICAgIHJhbmdlID0gc2hyaW5rUmFuZ2VFbmRUb0JlZm9yZU5ld0xpbmUoc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkpXG4gICAgQG1hcmtlckxheWVyLmZpbmRNYXJrZXJzKGludGVyc2VjdHNCdWZmZXJSYW5nZTogcmFuZ2UpLmZpbHRlciAobWFya2VyKSAtPlxuICAgICAgcmFuZ2UuaW50ZXJzZWN0c1dpdGgobWFya2VyLmdldEJ1ZmZlclJhbmdlKCksIGV4Y2x1c2l2ZSlcblxuICBnZXRNYXJrZXJBdFBvaW50OiAocG9pbnQpIC0+XG4gICAgbWFya2VycyA9IEBtYXJrZXJMYXllci5maW5kTWFya2Vycyhjb250YWluc0J1ZmZlclBvc2l0aW9uOiBwb2ludClcbiAgICAjIFdlIGhhdmUgdG8gY2hlY2sgYWxsIHJldHVybmVkIG1hcmtlciB1bnRpbCBmb3VuZCwgc2luY2Ugd2UgZG8gYWRpdGlvbmFsIG1hcmtlciB2YWxpZGF0aW9uLlxuICAgICMgZS5nLiBGb3IgdGV4dCBgYWJjKClgLCBtYXJrIGZvciBgYWJjYCBhbmQgYChgLiBjdXJzb3Igb24gYChgIGNoYXIgcmV0dXJuIG11bHRpcGxlIG1hcmtlclxuICAgICMgYW5kIHdlIHBpY2sgYChgIGJ5IGlzR3JlYXRlclRoYW4gY2hlY2suXG4gICAgZm9yIG1hcmtlciBpbiBtYXJrZXJzIHdoZW4gbWFya2VyLmdldEJ1ZmZlclJhbmdlKCkuZW5kLmlzR3JlYXRlclRoYW4ocG9pbnQpXG4gICAgICByZXR1cm4gbWFya2VyXG5cbiAgIyBTZWxlY3Qgb2NjdXJyZW5jZSBtYXJrZXIgYnVmZmVyUmFuZ2UgaW50ZXJzZWN0aW5nIGN1cnJlbnQgc2VsZWN0aW9ucy5cbiAgIyAtIFJldHVybjogdHJ1ZS9mYWxzZSB0byBpbmRpY2F0ZSBzdWNjZXNzIG9yIGZhaWxcbiAgI1xuICAjIERvIHNwZWNpYWwgaGFuZGxpbmcgZm9yIHdoaWNoIG9jY3VycmVuY2UgcmFuZ2UgYmVjb21lIGxhc3RTZWxlY3Rpb25cbiAgIyBlLmcuXG4gICMgIC0gYyhjaGFuZ2UpOiBTbyB0aGF0IGF1dG9jb21wbGV0ZStwb3B1cCBzaG93cyBhdCBvcmlnaW5hbCBjdXJzb3IgcG9zaXRpb24gb3IgbmVhci5cbiAgIyAgLSBnIFUodXBwZXItY2FzZSk6IFNvIHRoYXQgdW5kby9yZWRvIGNhbiByZXNwZWN0IGxhc3QgY3Vyc29yIHBvc2l0aW9uLlxuICBzZWxlY3Q6IC0+XG4gICAgaXNWaXN1YWxNb2RlID0gQHZpbVN0YXRlLm1vZGUgaXMgJ3Zpc3VhbCdcbiAgICBpbmRleEJ5T2xkU2VsZWN0aW9uID0gbmV3IE1hcFxuICAgIGFsbFJhbmdlcyA9IFtdXG4gICAgbWFya2Vyc1NlbGVjdGVkID0gW11cblxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkgd2hlbiAobWFya2VycyA9IEBnZXRNYXJrZXJzSW50ZXJzZWN0c1dpdGhTZWxlY3Rpb24oc2VsZWN0aW9uLCBpc1Zpc3VhbE1vZGUpKS5sZW5ndGhcbiAgICAgIHJhbmdlcyA9IG1hcmtlcnMubWFwIChtYXJrZXIpIC0+IG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICBtYXJrZXJzU2VsZWN0ZWQucHVzaChtYXJrZXJzLi4uKVxuICAgICAgIyBbSEFDS10gUGxhY2UgY2xvc2VzdCByYW5nZSB0byBsYXN0IHNvIHRoYXQgZmluYWwgbGFzdC1zZWxlY3Rpb24gYmVjb21lIGNsb3Nlc3Qgb25lLlxuICAgICAgIyBFLmcuXG4gICAgICAjIGBjIG8gZmAoY2hhbmdlIG9jY3VycmVuY2UgaW4gYS1mdW5jdGlvbikgc2hvdyBhdXRvY29tcGxldGUrIHBvcHVwIGF0IGNsb3Nlc3Qgb2NjdXJyZW5jZS4oIHBvcHVwIHNob3dzIGF0IGxhc3Qtc2VsZWN0aW9uIClcbiAgICAgIGNsb3Nlc3RSYW5nZSA9IEBnZXRDbG9zZXN0UmFuZ2VGb3JTZWxlY3Rpb24ocmFuZ2VzLCBzZWxlY3Rpb24pXG4gICAgICBfLnJlbW92ZShyYW5nZXMsIGNsb3Nlc3RSYW5nZSlcbiAgICAgIHJhbmdlcy5wdXNoKGNsb3Nlc3RSYW5nZSlcbiAgICAgIGFsbFJhbmdlcy5wdXNoKHJhbmdlcy4uLilcbiAgICAgIGluZGV4QnlPbGRTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgYWxsUmFuZ2VzLmluZGV4T2YoY2xvc2VzdFJhbmdlKSlcblxuICAgIGlmIGFsbFJhbmdlcy5sZW5ndGhcbiAgICAgIGlmIGlzVmlzdWFsTW9kZVxuICAgICAgICAjIFRvIGF2b2lkIHNlbGVjdGVkIG9jY3VycmVuY2UgcnVpbmVkIGJ5IG5vcm1hbGl6YXRpb24gd2hlbiBkaXNwb3NpbmcgY3VycmVudCBzdWJtb2RlIHRvIHNoaWZ0IHRvIG5ldyBzdWJtb2RlLlxuICAgICAgICBAdmltU3RhdGUubW9kZU1hbmFnZXIuZGVhY3RpdmF0ZSgpXG4gICAgICAgIEB2aW1TdGF0ZS5zdWJtb2RlID0gbnVsbFxuXG4gICAgICBAZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKGFsbFJhbmdlcylcbiAgICAgIHNlbGVjdGlvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgaW5kZXhCeU9sZFNlbGVjdGlvbi5mb3JFYWNoIChpbmRleCwgc2VsZWN0aW9uKSA9PlxuICAgICAgICBAdmltU3RhdGUubXV0YXRpb25NYW5hZ2VyLm1pZ3JhdGVNdXRhdGlvbihzZWxlY3Rpb24sIHNlbGVjdGlvbnNbaW5kZXhdKVxuXG4gICAgICBAZGVzdHJveU1hcmtlcnMobWFya2Vyc1NlbGVjdGVkKVxuICAgICAgZm9yICRzZWxlY3Rpb24gaW4gQHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcbiAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICAjIFdoaWNoIG9jY3VycmVuY2UgYmVjb21lIGxhc3RTZWxlY3Rpb24gaXMgZGV0ZXJtaW5lZCBieSBmb2xsb3dpbmcgb3JkZXJcbiAgIyAgMS4gT2NjdXJyZW5jZSB1bmRlciBvcmlnaW5hbCBjdXJzb3IgcG9zaXRpb25cbiAgIyAgMi4gZm9yd2FyZGluZyBpbiBzYW1lIHJvd1xuICAjICAzLiBmaXJzdCBvY2N1cnJlbmNlIGluIHNhbWUgcm93XG4gICMgIDQuIGZvcndhcmRpbmcgKHdyYXAtZW5kKVxuICBnZXRDbG9zZXN0UmFuZ2VGb3JTZWxlY3Rpb246IChyYW5nZXMsIHNlbGVjdGlvbikgLT5cbiAgICBwb2ludCA9IEB2aW1TdGF0ZS5tdXRhdGlvbk1hbmFnZXIubXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbikuaW5pdGlhbFBvaW50XG5cbiAgICBmb3IgcmFuZ2UgaW4gcmFuZ2VzIHdoZW4gcmFuZ2UuY29udGFpbnNQb2ludChwb2ludClcbiAgICAgIHJldHVybiByYW5nZVxuXG4gICAgcmFuZ2VzU3RhcnRGcm9tU2FtZVJvdyA9IHJhbmdlcy5maWx0ZXIoKHJhbmdlKSAtPiByYW5nZS5zdGFydC5yb3cgaXMgcG9pbnQucm93KVxuXG4gICAgaWYgcmFuZ2VzU3RhcnRGcm9tU2FtZVJvdy5sZW5ndGhcbiAgICAgIGZvciByYW5nZSBpbiByYW5nZXNTdGFydEZyb21TYW1lUm93IHdoZW4gcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihwb2ludClcbiAgICAgICAgcmV0dXJuIHJhbmdlICMgRm9yd2FyZGluZ1xuICAgICAgcmV0dXJuIHJhbmdlc1N0YXJ0RnJvbVNhbWVSb3dbMF1cblxuICAgIGZvciByYW5nZSBpbiByYW5nZXMgd2hlbiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKHBvaW50KSAgIyBGb3J3YXJkaW5nXG4gICAgICByZXR1cm4gcmFuZ2VcblxuICAgIHJhbmdlc1swXSAjIHJldHVybiBmaXJzdCBhcyBmYWxsYmFja1xuIl19
