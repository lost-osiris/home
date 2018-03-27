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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2ZsYXNoLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1Q0FBQTtJQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0gsYUFBYyxPQUFBLENBQVEsU0FBUjs7RUFFZixVQUFBLEdBQ0U7SUFBQSxRQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsSUFBZjtNQUNBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sV0FBTjtRQUNBLENBQUEsS0FBQSxDQUFBLEVBQU8sOEJBRFA7T0FGRjtLQURGO0lBS0EsZUFBQSxFQUNFO01BQUEsYUFBQSxFQUFlLElBQWY7TUFDQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFdBQU47UUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG1DQURQO09BRkY7S0FORjtJQVVBLHFCQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsSUFBZjtNQUNBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sV0FBTjtRQUNBLENBQUEsS0FBQSxDQUFBLEVBQU8seUNBRFA7T0FGRjtLQVhGO0lBZUEsNEJBQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxJQUFmO01BQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTyxnREFEUDtPQUZGO0tBaEJGO0lBb0JBLE1BQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxLQUFmO01BQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTyw0QkFEUDtPQUZGO0tBckJGO0lBeUJBLE1BQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxJQUFmO01BQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEs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LE1BQUwsQ0FBWSxRQUFaLENBQVA7SUFEZ0I7Ozs7O0FBM0ZwQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57aXNOb3RFbXB0eX0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5mbGFzaFR5cGVzID1cbiAgb3BlcmF0b3I6XG4gICAgYWxsb3dNdWx0aXBsZTogdHJ1ZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCBvcGVyYXRvcidcbiAgJ29wZXJhdG9yLWxvbmcnOlxuICAgIGFsbG93TXVsdGlwbGU6IHRydWVcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggb3BlcmF0b3ItbG9uZydcbiAgJ29wZXJhdG9yLW9jY3VycmVuY2UnOlxuICAgIGFsbG93TXVsdGlwbGU6IHRydWVcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggb3BlcmF0b3Itb2NjdXJyZW5jZSdcbiAgJ29wZXJhdG9yLXJlbW92ZS1vY2N1cnJlbmNlJzpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIG9wZXJhdG9yLXJlbW92ZS1vY2N1cnJlbmNlJ1xuICBzZWFyY2g6XG4gICAgYWxsb3dNdWx0aXBsZTogZmFsc2VcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggc2VhcmNoJ1xuICBzY3JlZW46XG4gICAgYWxsb3dNdWx0aXBsZTogdHJ1ZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCBzY3JlZW4nXG4gICd1bmRvLXJlZG8nOlxuICAgIGFsbG93TXVsdGlwbGU6IHRydWVcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggdW5kby1yZWRvJ1xuICAndW5kby1yZWRvLW11bHRpcGxlLWNoYW5nZXMnOlxuICAgIGFsbG93TXVsdGlwbGU6IHRydWVcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggdW5kby1yZWRvLW11bHRpcGxlLWNoYW5nZXMnXG4gICd1bmRvLXJlZG8tbXVsdGlwbGUtZGVsZXRlJzpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIHVuZG8tcmVkby1tdWx0aXBsZS1kZWxldGUnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEZsYXNoTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvcn0gPSBAdmltU3RhdGVcbiAgICBAbWFya2Vyc0J5VHlwZSA9IG5ldyBNYXBcbiAgICBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAbWFya2Vyc0J5VHlwZS5mb3JFYWNoIChtYXJrZXJzKSAtPlxuICAgICAgbWFya2VyLmRlc3Ryb3koKSBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICBAbWFya2Vyc0J5VHlwZS5jbGVhcigpXG5cbiAgZmxhc2g6IChyYW5nZXMsIG9wdGlvbnMsIHJhbmdlVHlwZT0nYnVmZmVyJykgLT5cbiAgICByYW5nZXMgPSBbcmFuZ2VzXSB1bmxlc3MgXy5pc0FycmF5KHJhbmdlcylcbiAgICByYW5nZXMgPSByYW5nZXMuZmlsdGVyKGlzTm90RW1wdHkpXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIHJhbmdlcy5sZW5ndGhcblxuICAgIHt0eXBlLCB0aW1lb3V0fSA9IG9wdGlvbnNcbiAgICB0aW1lb3V0ID89IDEwMDBcblxuICAgIHthbGxvd011bHRpcGxlLCBkZWNvcmF0aW9uT3B0aW9uc30gPSBmbGFzaFR5cGVzW3R5cGVdXG4gICAgbWFya2VyT3B0aW9ucyA9IHtpbnZhbGlkYXRlOiAndG91Y2gnfVxuXG4gICAgc3dpdGNoIHJhbmdlVHlwZVxuICAgICAgd2hlbiAnYnVmZmVyJ1xuICAgICAgICBtYXJrZXJzID0gKEBlZGl0b3IubWFya0J1ZmZlclJhbmdlKHJhbmdlLCBtYXJrZXJPcHRpb25zKSBmb3IgcmFuZ2UgaW4gcmFuZ2VzKVxuICAgICAgd2hlbiAnc2NyZWVuJ1xuICAgICAgICBtYXJrZXJzID0gKEBlZGl0b3IubWFya1NjcmVlblJhbmdlKHJhbmdlLCBtYXJrZXJPcHRpb25zKSBmb3IgcmFuZ2UgaW4gcmFuZ2VzKVxuXG4gICAgdW5sZXNzIGFsbG93TXVsdGlwbGVcbiAgICAgIGlmIEBtYXJrZXJzQnlUeXBlLmhhcyh0eXBlKVxuICAgICAgICBtYXJrZXIuZGVzdHJveSgpIGZvciBtYXJrZXIgaW4gQG1hcmtlcnNCeVR5cGUuZ2V0KHR5cGUpXG4gICAgICBAbWFya2Vyc0J5VHlwZS5zZXQodHlwZSwgbWFya2VycylcblxuICAgIEBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCBkZWNvcmF0aW9uT3B0aW9ucykgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG5cbiAgICBzZXRUaW1lb3V0IC0+XG4gICAgICBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgICwgdGltZW91dFxuXG4gIGZsYXNoU2NyZWVuUmFuZ2U6IChhcmdzLi4uKSAtPlxuICAgIEBmbGFzaChhcmdzLmNvbmNhdCgnc2NyZWVuJykuLi4pXG4iXX0=
