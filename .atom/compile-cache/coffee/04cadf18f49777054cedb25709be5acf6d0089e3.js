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

    OccurrenceManager.prototype.getMarkersIntersectsWithRanges = function(ranges, exclusive) {
      var i, len, markers, range, ref2, results;
      if (exclusive == null) {
        exclusive = false;
      }
      results = [];
      ref2 = ranges.map(shrinkRangeEndToBeforeNewLine);
      for (i = 0, len = ref2.length; i < len; i++) {
        range = ref2[i];
        markers = this.markerLayer.findMarkers({
          intersectsBufferRange: range
        }).filter(function(marker) {
          return range.intersectsWith(marker.getBufferRange(), exclusive);
        });
        results.push.apply(results, markers);
      }
      return results;
    };

    OccurrenceManager.prototype.getMarkerAtPoint = function(point) {
      return this.markerLayer.findMarkers({
        containsBufferPosition: point
      })[0];
    };

    OccurrenceManager.prototype.select = function() {
      var isVisualMode, markers, range, ranges;
      isVisualMode = this.vimState.mode === 'visual';
      markers = this.getMarkersIntersectsWithRanges(this.editor.getSelectedBufferRanges(), isVisualMode);
      if (markers.length) {
        ranges = markers.map(function(marker) {
          return marker.getBufferRange();
        });
        this.destroyMarkers(markers);
        if (isVisualMode) {
          this.vimState.modeManager.deactivate();
          this.vimState.submode = null;
        }
        range = this.getRangeForLastSelection(ranges);
        _.remove(ranges, range);
        ranges.push(range);
        this.editor.setSelectedBufferRanges(ranges);
        return true;
      } else {
        return false;
      }
    };

    OccurrenceManager.prototype.getRangeForLastSelection = function(ranges) {
      var i, j, k, len, len1, len2, point, range, rangesStartFromSameRow;
      point = this.vimState.getOriginalCursorPosition();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29jY3VycmVuY2UtbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxxQkFBRCxFQUFVOztFQUVWLE9BR0ksT0FBQSxDQUFRLFNBQVIsQ0FISixFQUNFLGtFQURGLEVBRUU7O0VBR0YsZUFBQSxHQUFrQixTQUFDLE1BQUQ7V0FBWSxDQUFJLE1BQU0sQ0FBQyxPQUFQLENBQUE7RUFBaEI7O0VBRWxCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Z0NBQ0osUUFBQSxHQUFVOztnQ0FDVixhQUFBLEdBQWU7TUFBQyxVQUFBLEVBQVksUUFBYjs7O0lBRUYsMkJBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDtNQUNaLE9BQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxjQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEscUJBQUE7TUFDWCxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQXZCLENBQWpCO01BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BQ2YsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUVaLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUE7TUFDZixpQkFBQSxHQUFvQjtRQUFDLElBQUEsRUFBTSxXQUFQO1FBQW9CLENBQUEsS0FBQSxDQUFBLEVBQU8sK0JBQTNCOztNQUNwQixJQUFDLENBQUEsZUFB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LEtBQUssQ0FBQyxhQUFaLENBQTBCLEtBQTFCO0FBQ3ZCLGlCQUFPOztBQURUO2FBR0EsTUFBTyxDQUFBLENBQUE7SUFoQmlCOzs7OztBQTlLNUIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxue1xuICBzaHJpbmtSYW5nZUVuZFRvQmVmb3JlTmV3TGluZVxuICBjb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvd1xufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmlzSW52YWxpZE1hcmtlciA9IChtYXJrZXIpIC0+IG5vdCBtYXJrZXIuaXNWYWxpZCgpXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIE9jY3VycmVuY2VNYW5hZ2VyXG4gIHBhdHRlcm5zOiBudWxsXG4gIG1hcmtlck9wdGlvbnM6IHtpbnZhbGlkYXRlOiAnaW5zaWRlJ31cblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZXMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHBhdHRlcm5zID0gW11cblxuICAgIEBtYXJrZXJMYXllciA9IEBlZGl0b3IuYWRkTWFya2VyTGF5ZXIoKVxuICAgIGRlY29yYXRpb25PcHRpb25zID0ge3R5cGU6ICdoaWdobGlnaHQnLCBjbGFzczogXCJ2aW0tbW9kZS1wbHVzLW9jY3VycmVuY2UtYmFzZVwifVxuICAgIEBkZWNvcmF0aW9uTGF5ZXIgPSBAZWRpdG9yLmRlY29yYXRlTWFya2VyTGF5ZXIoQG1hcmtlckxheWVyLCBkZWNvcmF0aW9uT3B0aW9ucylcblxuICAgICMgQHBhdHRlcm5zIGlzIHNpbmdsZSBzb3VyY2Ugb2YgdHJ1dGggKFNTT1QpXG4gICAgIyBBbGwgbWFrZXIgY3JlYXRlL2Rlc3Ryb3kvY3NzLXVwZGF0ZSBpcyBkb25lIGJ5IHJlYWN0aW5nIEBwYXR0ZXJzJ3MgY2hhbmdlLlxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIEBvbkRpZENoYW5nZVBhdHRlcm5zICh7cGF0dGVybiwgb2NjdXJyZW5jZVR5cGV9KSA9PlxuICAgICAgaWYgcGF0dGVyblxuICAgICAgICBAbWFya0J1ZmZlclJhbmdlQnlQYXR0ZXJuKHBhdHRlcm4sIG9jY3VycmVuY2VUeXBlKVxuICAgICAgICBAdXBkYXRlRWRpdG9yRWxlbWVudCgpXG4gICAgICBlbHNlXG4gICAgICAgIEBjbGVhck1hcmtlcnMoKVxuXG4gICAgQG1hcmtlckxheWVyLm9uRGlkVXBkYXRlKEBkZXN0cm95SW52YWxpZE1hcmtlcnMuYmluZCh0aGlzKSlcblxuICBtYXJrQnVmZmVyUmFuZ2VCeVBhdHRlcm46IChwYXR0ZXJuLCBvY2N1cnJlbmNlVHlwZSkgLT5cbiAgICBpZiBvY2N1cnJlbmNlVHlwZSBpcyAnc3Vid29yZCdcbiAgICAgIHN1YndvcmRSYW5nZXNCeVJvdyA9IHt9ICMgY2FjaGVcbiAgICAgIHN1YndvcmRQYXR0ZXJuID0gQGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuc3Vid29yZFJlZ0V4cCgpXG4gICAgICBpc1N1YndvcmRSYW5nZSA9IChyYW5nZSkgPT5cbiAgICAgICAgcm93ID0gcmFuZ2Uuc3RhcnQucm93XG4gICAgICAgIHN1YndvcmRSYW5nZXMgPSBzdWJ3b3JkUmFuZ2VzQnlSb3dbcm93XSA/PSBjb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvdyhAZWRpdG9yLCByb3csIHN1YndvcmRQYXR0ZXJuKVxuICAgICAgICBzdWJ3b3JkUmFuZ2VzLnNvbWUgKHN1YndvcmRSYW5nZSkgLT4gc3Vid29yZFJhbmdlLmlzRXF1YWwocmFuZ2UpXG5cbiAgICBAZWRpdG9yLnNjYW4gcGF0dGVybiwgKHtyYW5nZSwgbWF0Y2hUZXh0fSkgPT5cbiAgICAgIGlmIG9jY3VycmVuY2VUeXBlIGlzICdzdWJ3b3JkJ1xuICAgICAgICByZXR1cm4gdW5sZXNzIGlzU3Vid29yZFJhbmdlKHJhbmdlKVxuICAgICAgQG1hcmtlckxheWVyLm1hcmtCdWZmZXJSYW5nZShyYW5nZSwgQG1hcmtlck9wdGlvbnMpXG5cbiAgdXBkYXRlRWRpdG9yRWxlbWVudDogLT5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwiaGFzLW9jY3VycmVuY2VcIiwgQGhhc01hcmtlcnMoKSlcblxuICAjIENhbGxiYWNrIGdldCBwYXNzZWQgZm9sbG93aW5nIG9iamVjdFxuICAjIC0gcGF0dGVybjogY2FuIGJlIHVuZGVmaW5lZCBvbiByZXNldCBldmVudFxuICBvbkRpZENoYW5nZVBhdHRlcm5zOiAoZm4pIC0+XG4gICAgQGVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtcGF0dGVybnMnLCBmbilcblxuICBkZXN0cm95OiAtPlxuICAgIEBkZWNvcmF0aW9uTGF5ZXIuZGVzdHJveSgpXG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIEBtYXJrZXJMYXllci5kZXN0cm95KClcblxuICAjIFBhdHRlcm5zXG4gIGhhc1BhdHRlcm5zOiAtPlxuICAgIEBwYXR0ZXJucy5sZW5ndGggPiAwXG5cbiAgcmVzZXRQYXR0ZXJuczogLT5cbiAgICBAcGF0dGVybnMgPSBbXVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtcGF0dGVybnMnLCB7fSlcblxuICBhZGRQYXR0ZXJuOiAocGF0dGVybj1udWxsLCB7cmVzZXQsIG9jY3VycmVuY2VUeXBlfT17fSkgLT5cbiAgICBAY2xlYXJNYXJrZXJzKCkgaWYgcmVzZXRcbiAgICBAcGF0dGVybnMucHVzaChwYXR0ZXJuKVxuICAgIG9jY3VycmVuY2VUeXBlID89ICdiYXNlJ1xuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtcGF0dGVybnMnLCB7cGF0dGVybiwgb2NjdXJyZW5jZVR5cGV9KVxuXG4gIHNhdmVMYXN0UGF0dGVybjogKG9jY3VycmVuY2VUeXBlPW51bGwpIC0+XG4gICAgQHZpbVN0YXRlLmdsb2JhbFN0YXRlLnNldChcImxhc3RPY2N1cnJlbmNlUGF0dGVyblwiLCBAYnVpbGRQYXR0ZXJuKCkpXG4gICAgQHZpbVN0YXRlLmdsb2JhbFN0YXRlLnNldChcImxhc3RPY2N1cnJlbmNlVHlwZVwiLCBvY2N1cnJlbmNlVHlwZSlcblxuICAjIFJldHVybiByZWdleCByZXByZXNlbnRpbmcgZmluYWwgcGF0dGVybi5cbiAgIyBVc2VkIHRvIGNhY2hlIGZpbmFsIHBhdHRlcm4gdG8gZWFjaCBpbnN0YW5jZSBvZiBvcGVyYXRvciBzbyB0aGF0IHdlIGNhblxuICAjIHJlcGVhdCByZWNvcmRlZCBvcGVyYXRpb24gYnkgYC5gLlxuICAjIFBhdHRlcm4gY2FuIGJlIGFkZGVkIGludGVyYWN0aXZlbHkgb25lIGJ5IG9uZSwgYnV0IHdlIHNhdmUgaXQgYXMgdW5pb24gcGF0dGVybi5cbiAgYnVpbGRQYXR0ZXJuOiAtPlxuICAgIHNvdXJjZSA9IEBwYXR0ZXJucy5tYXAoKHBhdHRlcm4pIC0+IHBhdHRlcm4uc291cmNlKS5qb2luKCd8JylcbiAgICBuZXcgUmVnRXhwKHNvdXJjZSwgJ2cnKVxuXG4gICMgTWFya2Vyc1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY2xlYXJNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5jbGVhcigpXG4gICAgQHVwZGF0ZUVkaXRvckVsZW1lbnQoKVxuXG4gIGRlc3Ryb3lNYXJrZXJzOiAobWFya2VycykgLT5cbiAgICBtYXJrZXIuZGVzdHJveSgpIGZvciBtYXJrZXIgaW4gbWFya2Vyc1xuICAgICMgd2hlbmVydmVyIHdlIGRlc3Ryb3kgbWFya2VyLCB3ZSBzaG91bGQgc3luYyBgaGFzLW9jY3VycmVuY2VgIHNjb3BlIGluIG1hcmtlciBzdGF0ZS4uXG4gICAgQHVwZGF0ZUVkaXRvckVsZW1lbnQoKVxuXG4gIGRlc3Ryb3lJbnZhbGlkTWFya2VyczogLT5cbiAgICBAZGVzdHJveU1hcmtlcnMoQGdldE1hcmtlcnMoKS5maWx0ZXIoaXNJbnZhbGlkTWFya2VyKSlcblxuICBoYXNNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpID4gMFxuXG4gIGdldE1hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlcnMoKVxuXG4gIGdldE1hcmtlckJ1ZmZlclJhbmdlczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VycygpLm1hcCAobWFya2VyKSAtPiBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGdldE1hcmtlckNvdW50OiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpXG5cbiAgIyBSZXR1cm4gb2NjdXJyZW5jZSBtYXJrZXJzIGludGVyc2VjdGluZyBnaXZlbiByYW5nZXNcbiAgZ2V0TWFya2Vyc0ludGVyc2VjdHNXaXRoUmFuZ2VzOiAocmFuZ2VzLCBleGNsdXNpdmU9ZmFsc2UpIC0+XG4gICAgIyBmaW5kbWFya2VycygpJ3MgaW50ZXJzZWN0c0J1ZmZlclJhbmdlIHBhcmFtIGhhdmUgbm8gZXhjbHVzaXZlIGNvbnRyb2xcbiAgICAjIFNvIEkgbmVlZCBleHRyYSBjaGVjayB0byBmaWx0ZXIgb3V0IHVud2FudGVkIG1hcmtlci5cbiAgICAjIEJ1dCBiYXNpY2FsbHkgSSBzaG91bGQgcHJlZmVyIGZpbmRNYXJrZXIgc2luY2UgSXQncyBmYXN0IHRoYW4gaXRlcmF0aW5nXG4gICAgIyB3aG9sZSBtYXJrZXJzIG1hbnVhbGx5LlxuICAgIHJlc3VsdHMgPSBbXVxuICAgIGZvciByYW5nZSBpbiByYW5nZXMubWFwKHNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lKVxuICAgICAgbWFya2VycyA9IEBtYXJrZXJMYXllci5maW5kTWFya2VycyhpbnRlcnNlY3RzQnVmZmVyUmFuZ2U6IHJhbmdlKS5maWx0ZXIgKG1hcmtlcikgLT5cbiAgICAgICAgcmFuZ2UuaW50ZXJzZWN0c1dpdGgobWFya2VyLmdldEJ1ZmZlclJhbmdlKCksIGV4Y2x1c2l2ZSlcbiAgICAgIHJlc3VsdHMucHVzaChtYXJrZXJzLi4uKVxuICAgIHJlc3VsdHNcblxuICBnZXRNYXJrZXJBdFBvaW50OiAocG9pbnQpIC0+XG4gICAgQG1hcmtlckxheWVyLmZpbmRNYXJrZXJzKGNvbnRhaW5zQnVmZmVyUG9zaXRpb246IHBvaW50KVswXVxuXG4gICMgU2VsZWN0IG9jY3VycmVuY2UgbWFya2VyIGJ1ZmZlclJhbmdlIGludGVyc2VjdGluZyBjdXJyZW50IHNlbGVjdGlvbnMuXG4gICMgLSBSZXR1cm46IHRydWUvZmFsc2UgdG8gaW5kaWNhdGUgc3VjY2VzcyBvciBmYWlsXG4gICNcbiAgIyBEbyBzcGVjaWFsIGhhbmRsaW5nIGZvciB3aGljaCBvY2N1cnJlbmNlIHJhbmdlIGJlY29tZSBsYXN0U2VsZWN0aW9uXG4gICMgZS5nLlxuICAjICAtIGMoY2hhbmdlKTogU28gdGhhdCBhdXRvY29tcGxldGUrcG9wdXAgc2hvd3MgYXQgb3JpZ2luYWwgY3Vyc29yIHBvc2l0aW9uIG9yIG5lYXIuXG4gICMgIC0gZyBVKHVwcGVyLWNhc2UpOiBTbyB0aGF0IHVuZG8vcmVkbyBjYW4gcmVzcGVjdCBsYXN0IGN1cnNvciBwb3NpdGlvbi5cbiAgc2VsZWN0OiAtPlxuICAgIGlzVmlzdWFsTW9kZSA9IEB2aW1TdGF0ZS5tb2RlIGlzICd2aXN1YWwnXG4gICAgbWFya2VycyA9IEBnZXRNYXJrZXJzSW50ZXJzZWN0c1dpdGhSYW5nZXMoQGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcygpLCBpc1Zpc3VhbE1vZGUpXG5cbiAgICBpZiBtYXJrZXJzLmxlbmd0aFxuICAgICAgIyBOT1RFOiBpbW1lZGlhdGVseSBkZXN0cm95IG9jY3VycmVuY2UtbWFya2VyIHdoaWNoIHdlIGFyZSBvcGVyYXRlcyBvbiBmcm9tIG5vdy5cbiAgICAgICMgTWFya2VycyBhcmUgbm90IGJlZWluZyBpbW1lZGlhdGVseSBkZXN0cm95ZWQgdW5sZXNzIGV4cGxpY3RseSBkZXN0cm95LlxuICAgICAgIyBNYW51YWxseSBkZXN0cm95aW5nIG1hcmtlcnMgaGVyZSBnaXZlcyB1cyBzZXZlcmFsIGJlbmVmaXRzIGxpa2UgYmVsbG93LlxuICAgICAgIyAgLSBFYXN5IHRvIHdyaXRlIHNwZWMgc2luY2UgbWFya2VycyBhcmUgZGVzdHJveWVkIGluLXN5bmMuXG4gICAgICAjICAtIFNlbGVjdE9jY3VycmVuY2Ugb3BlcmF0aW9uIG5vdCBpbnZhbGlkYXRlIG1hcmtlciBidXQgZGVzdHJveWVkIG9uY2Ugc2VsZWN0ZWQuXG4gICAgICByYW5nZXMgPSBtYXJrZXJzLm1hcCAobWFya2VyKSAtPiBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgQGRlc3Ryb3lNYXJrZXJzKG1hcmtlcnMpXG5cbiAgICAgIGlmIGlzVmlzdWFsTW9kZVxuICAgICAgICBAdmltU3RhdGUubW9kZU1hbmFnZXIuZGVhY3RpdmF0ZSgpXG4gICAgICAgICMgU28gdGhhdCBTZWxlY3RPY2N1cnJlbmNlIGNhbiBhY2l2aXZhdGUgdmlzdWFsLW1vZGUgd2l0aCBjb3JyZWN0IHJhbmdlLCB3ZSBoYXZlIHRvIHVuc2V0IHN1Ym1vZGUgaGVyZS5cbiAgICAgICAgQHZpbVN0YXRlLnN1Ym1vZGUgPSBudWxsXG5cbiAgICAgICMgSW1wb3J0YW50OiBUbyBtYWtlIGxhc3QtY3Vyc29yIGJlY29tZSBvcmlnaW5hbCBjdXJzb3IgcG9zaXRpb24uXG4gICAgICByYW5nZSA9IEBnZXRSYW5nZUZvckxhc3RTZWxlY3Rpb24ocmFuZ2VzKVxuICAgICAgXy5yZW1vdmUocmFuZ2VzLCByYW5nZSlcbiAgICAgIHJhbmdlcy5wdXNoKHJhbmdlKVxuXG4gICAgICBAZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKHJhbmdlcylcblxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgIyBXaGljaCBvY2N1cnJlbmNlIGJlY29tZSBsYXN0U2VsZWN0aW9uIGlzIGRldGVybWluZWQgYnkgZm9sbG93aW5nIG9yZGVyXG4gICMgIDEuIE9jY3VycmVuY2UgdW5kZXIgb3JpZ2luYWwgY3Vyc29yIHBvc2l0aW9uXG4gICMgIDIuIGZvcndhcmRpbmcgaW4gc2FtZSByb3dcbiAgIyAgMy4gZmlyc3Qgb2NjdXJyZW5jZSBpbiBzYW1lIHJvd1xuICAjICA0LiBmb3J3YXJkaW5nICh3cmFwLWVuZClcbiAgZ2V0UmFuZ2VGb3JMYXN0U2VsZWN0aW9uOiAocmFuZ2VzKSAtPlxuICAgIHBvaW50ID0gQHZpbVN0YXRlLmdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKVxuXG4gICAgZm9yIHJhbmdlIGluIHJhbmdlcyB3aGVuIHJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpXG4gICAgICByZXR1cm4gcmFuZ2VcblxuICAgIHJhbmdlc1N0YXJ0RnJvbVNhbWVSb3cgPSByYW5nZXMuZmlsdGVyKChyYW5nZSkgLT4gcmFuZ2Uuc3RhcnQucm93IGlzIHBvaW50LnJvdylcblxuICAgIGlmIHJhbmdlc1N0YXJ0RnJvbVNhbWVSb3cubGVuZ3RoXG4gICAgICBmb3IgcmFuZ2UgaW4gcmFuZ2VzU3RhcnRGcm9tU2FtZVJvdyB3aGVuIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4ocG9pbnQpXG4gICAgICAgIHJldHVybiByYW5nZSAjIEZvcndhcmRpbmdcbiAgICAgIHJldHVybiByYW5nZXNTdGFydEZyb21TYW1lUm93WzBdXG5cbiAgICBmb3IgcmFuZ2UgaW4gcmFuZ2VzIHdoZW4gcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihwb2ludCkgICMgRm9yd2FyZGluZ1xuICAgICAgcmV0dXJuIHJhbmdlXG5cbiAgICByYW5nZXNbMF0gIyByZXR1cm4gZmlyc3QgYXMgZmFsbGJhY2tcbiJdfQ==
