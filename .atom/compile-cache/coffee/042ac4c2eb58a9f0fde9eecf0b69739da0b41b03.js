(function() {
  var CompositeDisposable, Emitter, OccurrenceManager, _, collectRangeInBufferRow, isInvalidMarker, ref, ref1, shrinkRangeEndToBeforeNewLine, swrap;

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  swrap = require('./selection-wrapper');

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
      ref2 = this.vimState, this.editor = ref2.editor, this.editorElement = ref2.editorElement;
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
      return this.markerLayer.findMarkers({
        containsBufferPosition: point
      })[0];
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
        ref3 = swrap.getSelections(this.editor);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29jY3VycmVuY2UtbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxxQkFBRCxFQUFVOztFQUNWLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBRVIsT0FHSSxPQUFBLENBQVEsU0FBUixDQUhKLEVBQ0Usa0VBREYsRUFFRTs7RUFHRixlQUFBLEdBQWtCLFNBQUMsTUFBRDtXQUFZLENBQUksTUFBTSxDQUFDLE9BQVAsQ0FBQTtFQUFoQjs7RUFFbEIsTUFBTSxDQUFDLE9BQVAsR0FDTTtnQ0FDSixRQUFBLEdBQVU7O2dDQUNWLGFBQUEsR0FBZTtNQUFDLFVBQUEsRUFBWSxRQUFiOzs7SUFFRiwyQkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQTtNQUNYLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBakI7TUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsUUFBRCxHQUFZO01BRVosSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQTtNQUNmLGlCQUFBLEdBQW9CO1FBQUMsSUFBQSxFQUFNLFdBQVA7UUFBb0IsQ0FBQSxLQUFBLENBQUEs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LHdDQUFBOztVQUNFLFVBQVUsQ0FBQyxjQUFYLENBQUE7QUFERjtlQUVBLEtBZEY7T0FBQSxNQUFBO2VBZ0JFLE1BaEJGOztJQWxCTTs7Z0NBeUNSLDJCQUFBLEdBQTZCLFNBQUMsTUFBRCxFQUFTLFNBQVQ7QUFDM0IsVUFBQTtNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsUUFBUSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxHQUEvQyxDQUFtRCxTQUFuRCxDQUE2RCxDQUFDO0FBRXRFLFdBQUEsd0NBQUE7O1lBQXlCLEtBQUssQ0FBQyxhQUFOLENBQW9CLEtBQXBCO0FBQ3ZCLGlCQUFPOztBQURUO01BR0Esc0JBQUEsR0FBeUIsTUFBTSxDQUFDLE1BQVAsQ0FBYyxTQUFDLEtBQUQ7ZUFBVyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQVosS0FBbUIsS0FBSyxDQUFDO01BQXBDLENBQWQ7TUFFekIsSUFBRyxzQkFBc0IsQ0FBQyxNQUExQjtBQUNFLGFBQUEsMERBQUE7O2NBQXlDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBWixDQUEwQixLQUExQjtBQUN2QyxtQkFBTzs7QUFEVDtBQUVBLGVBQU8sc0JBQXVCLENBQUEsQ0FBQSxFQUhoQzs7QUFLQSxXQUFBLDBDQUFBOztZQUF5QixLQUFLLENBQUMsS0FBSyxDQUFDLGFBQVosQ0FBMEIsS0FBMUI7QUFDdkIsaUJBQU87O0FBRFQ7YUFHQSxNQUFPLENBQUEsQ0FBQTtJQWhCb0I7Ozs7O0FBbkwvQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuXG57XG4gIHNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lXG4gIGNvbGxlY3RSYW5nZUluQnVmZmVyUm93XG59ID0gcmVxdWlyZSAnLi91dGlscydcblxuaXNJbnZhbGlkTWFya2VyID0gKG1hcmtlcikgLT4gbm90IG1hcmtlci5pc1ZhbGlkKClcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgT2NjdXJyZW5jZU1hbmFnZXJcbiAgcGF0dGVybnM6IG51bGxcbiAgbWFya2VyT3B0aW9uczoge2ludmFsaWRhdGU6ICdpbnNpZGUnfVxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAcGF0dGVybnMgPSBbXVxuXG4gICAgQG1hcmtlckxheWVyID0gQGVkaXRvci5hZGRNYXJrZXJMYXllcigpXG4gICAgZGVjb3JhdGlvbk9wdGlvbnMgPSB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiBcInZpbS1tb2RlLXBsdXMtb2NjdXJyZW5jZS1iYXNlXCJ9XG4gICAgQGRlY29yYXRpb25MYXllciA9IEBlZGl0b3IuZGVjb3JhdGVNYXJrZXJMYXllcihAbWFya2VyTGF5ZXIsIGRlY29yYXRpb25PcHRpb25zKVxuXG4gICAgIyBAcGF0dGVybnMgaXMgc2luZ2xlIHNvdXJjZSBvZiB0cnV0aCAoU1NPVClcbiAgICAjIEFsbCBtYWtlciBjcmVhdGUvZGVzdHJveS9jc3MtdXBkYXRlIGlzIGRvbmUgYnkgcmVhY3RpbmcgQHBhdHRlcnMncyBjaGFuZ2UuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgQG9uRGlkQ2hhbmdlUGF0dGVybnMgKHtwYXR0ZXJuLCBvY2N1cnJlbmNlVHlwZX0pID0+XG4gICAgICBpZiBwYXR0ZXJuXG4gICAgICAgIEBtYXJrQnVmZmVyUmFuZ2VCeVBhdHRlcm4ocGF0dGVybiwgb2NjdXJyZW5jZVR5cGUpXG4gICAgICAgIEB1cGRhdGVFZGl0b3JFbGVtZW50KClcbiAgICAgIGVsc2VcbiAgICAgICAgQGNsZWFyTWFya2VycygpXG5cbiAgICBAbWFya2VyTGF5ZXIub25EaWRVcGRhdGUoQGRlc3Ryb3lJbnZhbGlkTWFya2Vycy5iaW5kKHRoaXMpKVxuXG4gIG1hcmtCdWZmZXJSYW5nZUJ5UGF0dGVybjogKHBhdHRlcm4sIG9jY3VycmVuY2VUeXBlKSAtPlxuICAgIGlmIG9jY3VycmVuY2VUeXBlIGlzICdzdWJ3b3JkJ1xuICAgICAgc3Vid29yZFJhbmdlc0J5Um93ID0ge30gIyBjYWNoZVxuICAgICAgc3Vid29yZFBhdHRlcm4gPSBAZWRpdG9yLmdldExhc3RDdXJzb3IoKS5zdWJ3b3JkUmVnRXhwKClcbiAgICAgIGlzU3Vid29yZFJhbmdlID0gKHJhbmdlKSA9PlxuICAgICAgICByb3cgPSByYW5nZS5zdGFydC5yb3dcbiAgICAgICAgc3Vid29yZFJhbmdlcyA9IHN1YndvcmRSYW5nZXNCeVJvd1tyb3ddID89IGNvbGxlY3RSYW5nZUluQnVmZmVyUm93KEBlZGl0b3IsIHJvdywgc3Vid29yZFBhdHRlcm4pXG4gICAgICAgIHN1YndvcmRSYW5nZXMuc29tZSAoc3Vid29yZFJhbmdlKSAtPiBzdWJ3b3JkUmFuZ2UuaXNFcXVhbChyYW5nZSlcblxuICAgIEBlZGl0b3Iuc2NhbiBwYXR0ZXJuLCAoe3JhbmdlLCBtYXRjaFRleHR9KSA9PlxuICAgICAgaWYgb2NjdXJyZW5jZVR5cGUgaXMgJ3N1YndvcmQnXG4gICAgICAgIHJldHVybiB1bmxlc3MgaXNTdWJ3b3JkUmFuZ2UocmFuZ2UpXG4gICAgICBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclJhbmdlKHJhbmdlLCBAbWFya2VyT3B0aW9ucylcblxuICB1cGRhdGVFZGl0b3JFbGVtZW50OiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJoYXMtb2NjdXJyZW5jZVwiLCBAaGFzTWFya2VycygpKVxuXG4gICMgQ2FsbGJhY2sgZ2V0IHBhc3NlZCBmb2xsb3dpbmcgb2JqZWN0XG4gICMgLSBwYXR0ZXJuOiBjYW4gYmUgdW5kZWZpbmVkIG9uIHJlc2V0IGV2ZW50XG4gIG9uRGlkQ2hhbmdlUGF0dGVybnM6IChmbikgLT5cbiAgICBAZW1pdHRlci5vbignZGlkLWNoYW5nZS1wYXR0ZXJucycsIGZuKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGRlY29yYXRpb25MYXllci5kZXN0cm95KClcbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQG1hcmtlckxheWVyLmRlc3Ryb3koKVxuXG4gICMgUGF0dGVybnNcbiAgaGFzUGF0dGVybnM6IC0+XG4gICAgQHBhdHRlcm5zLmxlbmd0aCA+IDBcblxuICByZXNldFBhdHRlcm5zOiAtPlxuICAgIEBwYXR0ZXJucyA9IFtdXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1wYXR0ZXJucycsIHt9KVxuXG4gIGFkZFBhdHRlcm46IChwYXR0ZXJuPW51bGwsIHtyZXNldCwgb2NjdXJyZW5jZVR5cGV9PXt9KSAtPlxuICAgIEBjbGVhck1hcmtlcnMoKSBpZiByZXNldFxuICAgIEBwYXR0ZXJucy5wdXNoKHBhdHRlcm4pXG4gICAgb2NjdXJyZW5jZVR5cGUgPz0gJ2Jhc2UnXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1wYXR0ZXJucycsIHtwYXR0ZXJuLCBvY2N1cnJlbmNlVHlwZX0pXG5cbiAgc2F2ZUxhc3RQYXR0ZXJuOiAob2NjdXJyZW5jZVR5cGU9bnVsbCkgLT5cbiAgICBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuc2V0KFwibGFzdE9jY3VycmVuY2VQYXR0ZXJuXCIsIEBidWlsZFBhdHRlcm4oKSlcbiAgICBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuc2V0KFwibGFzdE9jY3VycmVuY2VUeXBlXCIsIG9jY3VycmVuY2VUeXBlKVxuXG4gICMgUmV0dXJuIHJlZ2V4IHJlcHJlc2VudGluZyBmaW5hbCBwYXR0ZXJuLlxuICAjIFVzZWQgdG8gY2FjaGUgZmluYWwgcGF0dGVybiB0byBlYWNoIGluc3RhbmNlIG9mIG9wZXJhdG9yIHNvIHRoYXQgd2UgY2FuXG4gICMgcmVwZWF0IHJlY29yZGVkIG9wZXJhdGlvbiBieSBgLmAuXG4gICMgUGF0dGVybiBjYW4gYmUgYWRkZWQgaW50ZXJhY3RpdmVseSBvbmUgYnkgb25lLCBidXQgd2Ugc2F2ZSBpdCBhcyB1bmlvbiBwYXR0ZXJuLlxuICBidWlsZFBhdHRlcm46IC0+XG4gICAgc291cmNlID0gQHBhdHRlcm5zLm1hcCgocGF0dGVybikgLT4gcGF0dGVybi5zb3VyY2UpLmpvaW4oJ3wnKVxuICAgIG5ldyBSZWdFeHAoc291cmNlLCAnZycpXG5cbiAgIyBNYXJrZXJzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjbGVhck1hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmNsZWFyKClcbiAgICBAdXBkYXRlRWRpdG9yRWxlbWVudCgpXG5cbiAgZGVzdHJveU1hcmtlcnM6IChtYXJrZXJzKSAtPlxuICAgIG1hcmtlci5kZXN0cm95KCkgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG4gICAgIyB3aGVuZXJ2ZXIgd2UgZGVzdHJveSBtYXJrZXIsIHdlIHNob3VsZCBzeW5jIGBoYXMtb2NjdXJyZW5jZWAgc2NvcGUgaW4gbWFya2VyIHN0YXRlLi5cbiAgICBAdXBkYXRlRWRpdG9yRWxlbWVudCgpXG5cbiAgZGVzdHJveUludmFsaWRNYXJrZXJzOiAtPlxuICAgIEBkZXN0cm95TWFya2VycyhAZ2V0TWFya2VycygpLmZpbHRlcihpc0ludmFsaWRNYXJrZXIpKVxuXG4gIGhhc01hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KCkgPiAwXG5cbiAgZ2V0TWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VycygpXG5cbiAgZ2V0TWFya2VyQnVmZmVyUmFuZ2VzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJzKCkubWFwIChtYXJrZXIpIC0+IG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZ2V0TWFya2VyQ291bnQ6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KClcblxuICAjIFJldHVybiBvY2N1cnJlbmNlIG1hcmtlcnMgaW50ZXJzZWN0aW5nIGdpdmVuIHJhbmdlc1xuICBnZXRNYXJrZXJzSW50ZXJzZWN0c1dpdGhTZWxlY3Rpb246IChzZWxlY3Rpb24sIGV4Y2x1c2l2ZT1mYWxzZSkgLT5cbiAgICAjIGZpbmRtYXJrZXJzKCkncyBpbnRlcnNlY3RzQnVmZmVyUmFuZ2UgcGFyYW0gaGF2ZSBubyBleGNsdXNpdmUgY29udHJvbFxuICAgICMgU28gbmVlZCBleHRyYSBjaGVjayB0byBmaWx0ZXIgb3V0IHVud2FudGVkIG1hcmtlci5cbiAgICAjIEJ1dCBiYXNpY2FsbHkgSSBzaG91bGQgcHJlZmVyIGZpbmRNYXJrZXIgc2luY2UgSXQncyBmYXN0IHRoYW4gaXRlcmF0aW5nXG4gICAgIyB3aG9sZSBtYXJrZXJzIG1hbnVhbGx5LlxuICAgIHJhbmdlID0gc2hyaW5rUmFuZ2VFbmRUb0JlZm9yZU5ld0xpbmUoc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkpXG4gICAgQG1hcmtlckxheWVyLmZpbmRNYXJrZXJzKGludGVyc2VjdHNCdWZmZXJSYW5nZTogcmFuZ2UpLmZpbHRlciAobWFya2VyKSAtPlxuICAgICAgcmFuZ2UuaW50ZXJzZWN0c1dpdGgobWFya2VyLmdldEJ1ZmZlclJhbmdlKCksIGV4Y2x1c2l2ZSlcblxuICBnZXRNYXJrZXJBdFBvaW50OiAocG9pbnQpIC0+XG4gICAgQG1hcmtlckxheWVyLmZpbmRNYXJrZXJzKGNvbnRhaW5zQnVmZmVyUG9zaXRpb246IHBvaW50KVswXVxuXG4gICMgU2VsZWN0IG9jY3VycmVuY2UgbWFya2VyIGJ1ZmZlclJhbmdlIGludGVyc2VjdGluZyBjdXJyZW50IHNlbGVjdGlvbnMuXG4gICMgLSBSZXR1cm46IHRydWUvZmFsc2UgdG8gaW5kaWNhdGUgc3VjY2VzcyBvciBmYWlsXG4gICNcbiAgIyBEbyBzcGVjaWFsIGhhbmRsaW5nIGZvciB3aGljaCBvY2N1cnJlbmNlIHJhbmdlIGJlY29tZSBsYXN0U2VsZWN0aW9uXG4gICMgZS5nLlxuICAjICAtIGMoY2hhbmdlKTogU28gdGhhdCBhdXRvY29tcGxldGUrcG9wdXAgc2hvd3MgYXQgb3JpZ2luYWwgY3Vyc29yIHBvc2l0aW9uIG9yIG5lYXIuXG4gICMgIC0gZyBVKHVwcGVyLWNhc2UpOiBTbyB0aGF0IHVuZG8vcmVkbyBjYW4gcmVzcGVjdCBsYXN0IGN1cnNvciBwb3NpdGlvbi5cbiAgc2VsZWN0OiAtPlxuICAgIGlzVmlzdWFsTW9kZSA9IEB2aW1TdGF0ZS5tb2RlIGlzICd2aXN1YWwnXG4gICAgaW5kZXhCeU9sZFNlbGVjdGlvbiA9IG5ldyBNYXBcbiAgICBhbGxSYW5nZXMgPSBbXVxuICAgIG1hcmtlcnNTZWxlY3RlZCA9IFtdXG5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpIHdoZW4gKG1hcmtlcnMgPSBAZ2V0TWFya2Vyc0ludGVyc2VjdHNXaXRoU2VsZWN0aW9uKHNlbGVjdGlvbiwgaXNWaXN1YWxNb2RlKSkubGVuZ3RoXG4gICAgICByYW5nZXMgPSBtYXJrZXJzLm1hcCAobWFya2VyKSAtPiBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgbWFya2Vyc1NlbGVjdGVkLnB1c2gobWFya2Vycy4uLilcbiAgICAgICMgW0hBQ0tdIFBsYWNlIGNsb3Nlc3QgcmFuZ2UgdG8gbGFzdCBzbyB0aGF0IGZpbmFsIGxhc3Qtc2VsZWN0aW9uIGJlY29tZSBjbG9zZXN0IG9uZS5cbiAgICAgICMgRS5nLlxuICAgICAgIyBgYyBvIGZgKGNoYW5nZSBvY2N1cnJlbmNlIGluIGEtZnVuY3Rpb24pIHNob3cgYXV0b2NvbXBsZXRlKyBwb3B1cCBhdCBjbG9zZXN0IG9jY3VycmVuY2UuKCBwb3B1cCBzaG93cyBhdCBsYXN0LXNlbGVjdGlvbiApXG4gICAgICBjbG9zZXN0UmFuZ2UgPSBAZ2V0Q2xvc2VzdFJhbmdlRm9yU2VsZWN0aW9uKHJhbmdlcywgc2VsZWN0aW9uKVxuICAgICAgXy5yZW1vdmUocmFuZ2VzLCBjbG9zZXN0UmFuZ2UpXG4gICAgICByYW5nZXMucHVzaChjbG9zZXN0UmFuZ2UpXG4gICAgICBhbGxSYW5nZXMucHVzaChyYW5nZXMuLi4pXG4gICAgICBpbmRleEJ5T2xkU2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIGFsbFJhbmdlcy5pbmRleE9mKGNsb3Nlc3RSYW5nZSkpXG5cbiAgICBpZiBhbGxSYW5nZXMubGVuZ3RoXG4gICAgICBpZiBpc1Zpc3VhbE1vZGVcbiAgICAgICAgIyBUbyBhdm9pZCBzZWxlY3RlZCBvY2N1cnJlbmNlIHJ1aW5lZCBieSBub3JtYWxpemF0aW9uIHdoZW4gZGlzcG9zaW5nIGN1cnJlbnQgc3VibW9kZSB0byBzaGlmdCB0byBuZXcgc3VibW9kZS5cbiAgICAgICAgQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmRlYWN0aXZhdGUoKVxuICAgICAgICBAdmltU3RhdGUuc3VibW9kZSA9IG51bGxcblxuICAgICAgQGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcyhhbGxSYW5nZXMpXG4gICAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIGluZGV4QnlPbGRTZWxlY3Rpb24uZm9yRWFjaCAoaW5kZXgsIHNlbGVjdGlvbikgPT5cbiAgICAgICAgQHZpbVN0YXRlLm11dGF0aW9uTWFuYWdlci5taWdyYXRlTXV0YXRpb24oc2VsZWN0aW9uLCBzZWxlY3Rpb25zW2luZGV4XSlcblxuICAgICAgQGRlc3Ryb3lNYXJrZXJzKG1hcmtlcnNTZWxlY3RlZClcbiAgICAgIGZvciAkc2VsZWN0aW9uIGluIHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcbiAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICAjIFdoaWNoIG9jY3VycmVuY2UgYmVjb21lIGxhc3RTZWxlY3Rpb24gaXMgZGV0ZXJtaW5lZCBieSBmb2xsb3dpbmcgb3JkZXJcbiAgIyAgMS4gT2NjdXJyZW5jZSB1bmRlciBvcmlnaW5hbCBjdXJzb3IgcG9zaXRpb25cbiAgIyAgMi4gZm9yd2FyZGluZyBpbiBzYW1lIHJvd1xuICAjICAzLiBmaXJzdCBvY2N1cnJlbmNlIGluIHNhbWUgcm93XG4gICMgIDQuIGZvcndhcmRpbmcgKHdyYXAtZW5kKVxuICBnZXRDbG9zZXN0UmFuZ2VGb3JTZWxlY3Rpb246IChyYW5nZXMsIHNlbGVjdGlvbikgLT5cbiAgICBwb2ludCA9IEB2aW1TdGF0ZS5tdXRhdGlvbk1hbmFnZXIubXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbikuaW5pdGlhbFBvaW50XG5cbiAgICBmb3IgcmFuZ2UgaW4gcmFuZ2VzIHdoZW4gcmFuZ2UuY29udGFpbnNQb2ludChwb2ludClcbiAgICAgIHJldHVybiByYW5nZVxuXG4gICAgcmFuZ2VzU3RhcnRGcm9tU2FtZVJvdyA9IHJhbmdlcy5maWx0ZXIoKHJhbmdlKSAtPiByYW5nZS5zdGFydC5yb3cgaXMgcG9pbnQucm93KVxuXG4gICAgaWYgcmFuZ2VzU3RhcnRGcm9tU2FtZVJvdy5sZW5ndGhcbiAgICAgIGZvciByYW5nZSBpbiByYW5nZXNTdGFydEZyb21TYW1lUm93IHdoZW4gcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihwb2ludClcbiAgICAgICAgcmV0dXJuIHJhbmdlICMgRm9yd2FyZGluZ1xuICAgICAgcmV0dXJuIHJhbmdlc1N0YXJ0RnJvbVNhbWVSb3dbMF1cblxuICAgIGZvciByYW5nZSBpbiByYW5nZXMgd2hlbiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKHBvaW50KSAgIyBGb3J3YXJkaW5nXG4gICAgICByZXR1cm4gcmFuZ2VcblxuICAgIHJhbmdlc1swXSAjIHJldHVybiBmaXJzdCBhcyBmYWxsYmFja1xuIl19
