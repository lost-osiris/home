(function() {
  var FlashManager, _, flashTypes, isNotEmpty,
    slice = [].slice;

  _ = require('underscore-plus');

  isNotEmpty = require('./utils').isNotEmpty;

  flashTypes = {
    operator: {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash operator'
      }
    },
    'operator-long': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash operator-long'
      }
    },
    'operator-demo': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash operator-demo'
      }
    },
    'operator-occurrence': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash operator-occurrence'
      }
    },
    'operator-remove-occurrence': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash operator-remove-occurrence'
      }
    },
    search: {
      allowMultiple: false,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash search'
      }
    },
    screen: {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash screen'
      }
    },
    'undo-redo': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash undo-redo'
      }
    },
    'undo-redo-multiple-changes': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash undo-redo-multiple-changes'
      }
    },
    'undo-redo-multiple-delete': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash undo-redo-multiple-delete'
      }
    }
  };

  module.exports = FlashManager = (function() {
    function FlashManager(vimState) {
      this.vimState = vimState;
      this.editor = this.vimState.editor;
      this.markersByType = new Map;
      this.vimState.onDidDestroy(this.destroy.bind(this));
    }

    FlashManager.prototype.destroy = function() {
      this.markersByType.forEach(function(markers) {
        var i, len, marker, results;
        results = [];
        for (i = 0, len = markers.length; i < len; i++) {
          marker = markers[i];
          results.push(marker.destroy());
        }
        return results;
      });
      return this.markersByType.clear();
    };

    FlashManager.prototype.flash = function(ranges, options, rangeType) {
      var allowMultiple, decorationOptions, i, j, len, len1, marker, markerOptions, markers, range, ref, ref1, timeout, type;
      if (rangeType == null) {
        rangeType = 'buffer';
      }
      if (!_.isArray(ranges)) {
        ranges = [ranges];
      }
      ranges = ranges.filter(isNotEmpty);
      if (!ranges.length) {
        return null;
      }
      type = options.type, timeout = options.timeout;
      if (timeout == null) {
        timeout = 1000;
      }
      if (this.vimState.globalState.get('demoModeIsActive') && (type === 'operator' || type === 'operator-long')) {
        type = 'operator-demo';
        timeout = 2000;
      }
      ref = flashTypes[type], allowMultiple = ref.allowMultiple, decorationOptions = ref.decorationOptions;
      markerOptions = {
        invalidate: 'touch'
      };
      switch (rangeType) {
        case 'buffer':
          markers = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = ranges.length; i < len; i++) {
              range = ranges[i];
              results.push(this.editor.markBufferRange(range, markerOptions));
            }
            return results;
          }).call(this);
          break;
        case 'screen':
          markers = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = ranges.length; i < len; i++) {
              range = ranges[i];
              results.push(this.editor.markScreenRange(range, markerOptions));
            }
            return results;
          }).call(this);
      }
      if (!allowMultiple) {
        if (this.markersByType.has(type)) {
          ref1 = this.markersByType.get(type);
          for (i = 0, len = ref1.length; i < len; i++) {
            marker = ref1[i];
            marker.destroy();
          }
        }
        this.markersByType.set(type, markers);
      }
      for (j = 0, len1 = markers.length; j < len1; j++) {
        marker = markers[j];
        this.editor.decorateMarker(marker, decorationOptions);
      }
      return setTimeout(function() {
        var k, len2, results;
        results = [];
        for (k = 0, len2 = markers.length; k < len2; k++) {
          marker = markers[k];
          results.push(marker.destroy());
        }
        return results;
      }, timeout);
    };

    FlashManager.prototype.flashScreenRange = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return this.flash.apply(this, args.concat('screen'));
    };

    return FlashManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2ZsYXNoLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1Q0FBQTtJQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0gsYUFBYyxPQUFBLENBQVEsU0FBUjs7RUFFZixVQUFBLEdBQ0U7SUFBQSxRQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsSUFBZjtNQUNBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sV0FBTjtRQUNBLENBQUEsS0FBQSxDQUFBLEVBQU8sOEJBRFA7T0FGRjtLQURGO0lBS0EsZUFBQSxFQUNFO01BQUEsYUFBQSxFQUFlLElBQWY7TUFDQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFdBQU47UUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG1DQURQO09BRkY7S0FORjtJQVVBLGVBQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxJQUFmO01BQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTyxtQ0FEUDtPQUZGO0tBWEY7SUFlQSxxQkFBQSxFQUNFO01BQUEsYUFBQSxFQUFlLElBQWY7TUFDQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFdBQU47UUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHlDQURQO09BRkY7S0FoQkY7SUFvQkEsNEJBQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxJQUFmO01BQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTyxnREFEUDtPQUZGO0tBckJGO0lBeUJBLE1BQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxLQUFmO01BQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEs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ekIsRUFIRjs7QUFLQSxXQUFBLDJDQUFBOztRQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QixNQUF2QixFQUErQixpQkFBL0I7QUFBQTthQUVBLFVBQUEsQ0FBVyxTQUFBO0FBQ1QsWUFBQTtBQUFBO2FBQUEsMkNBQUE7O3VCQUNFLE1BQU0sQ0FBQyxPQUFQLENBQUE7QUFERjs7TUFEUyxDQUFYLEVBR0UsT0FIRjtJQTdCSzs7MkJBa0NQLGdCQUFBLEdBQWtCLFNBQUE7QUFDaEIsVUFBQTtNQURpQjthQUNqQixJQUFDLENBQUEsS0FBRCxhQUFPLElBQUksQ0FBQyxNQUFMLENBQVksUUFBWixDQUFQO0lBRGdCOzs7OztBQXJHcEIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue2lzTm90RW1wdHl9ID0gcmVxdWlyZSAnLi91dGlscydcblxuZmxhc2hUeXBlcyA9XG4gIG9wZXJhdG9yOlxuICAgIGFsbG93TXVsdGlwbGU6IHRydWVcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggb3BlcmF0b3InXG4gICdvcGVyYXRvci1sb25nJzpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIG9wZXJhdG9yLWxvbmcnXG4gICdvcGVyYXRvci1kZW1vJzpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIG9wZXJhdG9yLWRlbW8nXG4gICdvcGVyYXRvci1vY2N1cnJlbmNlJzpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIG9wZXJhdG9yLW9jY3VycmVuY2UnXG4gICdvcGVyYXRvci1yZW1vdmUtb2NjdXJyZW5jZSc6XG4gICAgYWxsb3dNdWx0aXBsZTogdHJ1ZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCBvcGVyYXRvci1yZW1vdmUtb2NjdXJyZW5jZSdcbiAgc2VhcmNoOlxuICAgIGFsbG93TXVsdGlwbGU6IGZhbHNlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIHNlYXJjaCdcbiAgc2NyZWVuOlxuICAgIGFsbG93TXVsdGlwbGU6IHRydWVcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggc2NyZWVuJ1xuICAndW5kby1yZWRvJzpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIHVuZG8tcmVkbydcbiAgJ3VuZG8tcmVkby1tdWx0aXBsZS1jaGFuZ2VzJzpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIHVuZG8tcmVkby1tdWx0aXBsZS1jaGFuZ2VzJ1xuICAndW5kby1yZWRvLW11bHRpcGxlLWRlbGV0ZSc6XG4gICAgYWxsb3dNdWx0aXBsZTogdHJ1ZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCB1bmRvLXJlZG8tbXVsdGlwbGUtZGVsZXRlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBGbGFzaE1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3J9ID0gQHZpbVN0YXRlXG4gICAgQG1hcmtlcnNCeVR5cGUgPSBuZXcgTWFwXG4gICAgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQG1hcmtlcnNCeVR5cGUuZm9yRWFjaCAobWFya2VycykgLT5cbiAgICAgIG1hcmtlci5kZXN0cm95KCkgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG4gICAgQG1hcmtlcnNCeVR5cGUuY2xlYXIoKVxuXG4gIGZsYXNoOiAocmFuZ2VzLCBvcHRpb25zLCByYW5nZVR5cGU9J2J1ZmZlcicpIC0+XG4gICAgcmFuZ2VzID0gW3Jhbmdlc10gdW5sZXNzIF8uaXNBcnJheShyYW5nZXMpXG4gICAgcmFuZ2VzID0gcmFuZ2VzLmZpbHRlcihpc05vdEVtcHR5KVxuICAgIHJldHVybiBudWxsIHVubGVzcyByYW5nZXMubGVuZ3RoXG5cbiAgICB7dHlwZSwgdGltZW91dH0gPSBvcHRpb25zXG4gICAgdGltZW91dCA/PSAxMDAwXG5cbiAgICAjIEhBQ0s6IGluIGRlbW8gbW9kZSwgcmVwbGFjZSBmbGFzaCB0eXBlIGZvciBsb25nZXIgZmxhc2hcbiAgICBpZiBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KCdkZW1vTW9kZUlzQWN0aXZlJykgYW5kIHR5cGUgaW4gWydvcGVyYXRvcicsICdvcGVyYXRvci1sb25nJ11cbiAgICAgIHR5cGUgPSAnb3BlcmF0b3ItZGVtbydcbiAgICAgIHRpbWVvdXQgPSAyMDAwXG5cbiAgICB7YWxsb3dNdWx0aXBsZSwgZGVjb3JhdGlvbk9wdGlvbnN9ID0gZmxhc2hUeXBlc1t0eXBlXVxuICAgIG1hcmtlck9wdGlvbnMgPSB7aW52YWxpZGF0ZTogJ3RvdWNoJ31cblxuICAgIHN3aXRjaCByYW5nZVR5cGVcbiAgICAgIHdoZW4gJ2J1ZmZlcidcbiAgICAgICAgbWFya2VycyA9IChAZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShyYW5nZSwgbWFya2VyT3B0aW9ucykgZm9yIHJhbmdlIGluIHJhbmdlcylcbiAgICAgIHdoZW4gJ3NjcmVlbidcbiAgICAgICAgbWFya2VycyA9IChAZWRpdG9yLm1hcmtTY3JlZW5SYW5nZShyYW5nZSwgbWFya2VyT3B0aW9ucykgZm9yIHJhbmdlIGluIHJhbmdlcylcblxuICAgIHVubGVzcyBhbGxvd011bHRpcGxlXG4gICAgICBpZiBAbWFya2Vyc0J5VHlwZS5oYXModHlwZSlcbiAgICAgICAgbWFya2VyLmRlc3Ryb3koKSBmb3IgbWFya2VyIGluIEBtYXJrZXJzQnlUeXBlLmdldCh0eXBlKVxuICAgICAgQG1hcmtlcnNCeVR5cGUuc2V0KHR5cGUsIG1hcmtlcnMpXG5cbiAgICBAZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwgZGVjb3JhdGlvbk9wdGlvbnMpIGZvciBtYXJrZXIgaW4gbWFya2Vyc1xuXG4gICAgc2V0VGltZW91dCAtPlxuICAgICAgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG4gICAgICAgIG1hcmtlci5kZXN0cm95KClcbiAgICAsIHRpbWVvdXRcblxuICBmbGFzaFNjcmVlblJhbmdlOiAoYXJncy4uLikgLT5cbiAgICBAZmxhc2goYXJncy5jb25jYXQoJ3NjcmVlbicpLi4uKVxuIl19
