(function() {
  var FlashManager, _, addDemoSuffix, flashTypes, isNotEmpty, ref, removeDemoSuffix, replaceDecorationClassBy,
    slice = [].slice;

  _ = require('underscore-plus');

  ref = require('./utils'), isNotEmpty = ref.isNotEmpty, replaceDecorationClassBy = ref.replaceDecorationClassBy;

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

  addDemoSuffix = replaceDecorationClassBy.bind(null, function(text) {
    return text + '-demo';
  });

  removeDemoSuffix = replaceDecorationClassBy.bind(null, function(text) {
    return text.replace(/-demo$/, '');
  });

  module.exports = FlashManager = (function() {
    function FlashManager(vimState) {
      this.vimState = vimState;
      this.editor = this.vimState.editor;
      this.markersByType = new Map;
      this.vimState.onDidDestroy(this.destroy.bind(this));
      this.postponedDestroyMarkersTasks = [];
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

    FlashManager.prototype.destroyDemoModeMarkers = function() {
      var i, len, ref1, resolve;
      ref1 = this.postponedDestroyMarkersTasks;
      for (i = 0, len = ref1.length; i < len; i++) {
        resolve = ref1[i];
        resolve();
      }
      return this.postponedDestroyMarkersTasks = [];
    };

    FlashManager.prototype.destroyMarkersAfter = function(markers, timeout) {
      return setTimeout(function() {
        var i, len, marker, results;
        results = [];
        for (i = 0, len = markers.length; i < len; i++) {
          marker = markers[i];
          results.push(marker.destroy());
        }
        return results;
      }, timeout);
    };

    FlashManager.prototype.flash = function(ranges, options, rangeType) {
      var allowMultiple, decorationOptions, decorations, i, len, marker, markerOptions, markers, range, ref1, ref2, timeout, type;
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
      ref1 = flashTypes[type], allowMultiple = ref1.allowMultiple, decorationOptions = ref1.decorationOptions;
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
          ref2 = this.markersByType.get(type);
          for (i = 0, len = ref2.length; i < len; i++) {
            marker = ref2[i];
            marker.destroy();
          }
        }
        this.markersByType.set(type, markers);
      }
      decorations = markers.map((function(_this) {
        return function(marker) {
          return _this.editor.decorateMarker(marker, decorationOptions);
        };
      })(this));
      if (this.vimState.globalState.get('demoModeIsActive')) {
        decorations.map(addDemoSuffix);
        return this.postponedDestroyMarkersTasks.push((function(_this) {
          return function() {
            decorations.map(removeDemoSuffix);
            return _this.destroyMarkersAfter(markers, timeout);
          };
        })(this));
      } else {
        return this.destroyMarkersAfter(markers, timeout);
      }
    };

    FlashManager.prototype.flashScreenRange = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return this.flash.apply(this, args.concat('screen'));
    };

    return FlashManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2ZsYXNoLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1R0FBQTtJQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBeUMsT0FBQSxDQUFRLFNBQVIsQ0FBekMsRUFBQywyQkFBRCxFQUFhOztFQUViLFVBQUEsR0FDRTtJQUFBLFFBQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxJQUFmO01BQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTyw4QkFEUDtPQUZGO0tBREY7SUFLQSxlQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsSUFBZjtNQUNBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sV0FBTjtRQUNBLENBQUEsS0FBQSxDQUFBLEVBQU8sbUNBRFA7T0FGRjtLQU5GO0lBVUEscUJBQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxJQUFmO01BQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTyx5Q0FEUDtPQUZGO0tBWEY7SUFlQSw0QkFBQSxFQUNFO01BQUEsYUFBQSxFQUFlLElBQWY7TUFDQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFdBQU47UUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdEQURQO09BRkY7S0FoQkY7SUFvQkEsTUFBQSxFQUNFO01BQUEsYUFBQSxFQUFlLEtBQWY7TUFDQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFdBQU47UUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLDRCQURQO09BRkY7S0FyQkY7SUF5QkEsTUFBQSxFQUNFO01BQUEsYUFBQSxFQUFlLElBQWY7TUFDQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFdB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PSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57aXNOb3RFbXB0eSwgcmVwbGFjZURlY29yYXRpb25DbGFzc0J5fSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmZsYXNoVHlwZXMgPVxuICBvcGVyYXRvcjpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIG9wZXJhdG9yJ1xuICAnb3BlcmF0b3ItbG9uZyc6XG4gICAgYWxsb3dNdWx0aXBsZTogdHJ1ZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCBvcGVyYXRvci1sb25nJ1xuICAnb3BlcmF0b3Itb2NjdXJyZW5jZSc6XG4gICAgYWxsb3dNdWx0aXBsZTogdHJ1ZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCBvcGVyYXRvci1vY2N1cnJlbmNlJ1xuICAnb3BlcmF0b3ItcmVtb3ZlLW9jY3VycmVuY2UnOlxuICAgIGFsbG93TXVsdGlwbGU6IHRydWVcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggb3BlcmF0b3ItcmVtb3ZlLW9jY3VycmVuY2UnXG4gIHNlYXJjaDpcbiAgICBhbGxvd011bHRpcGxlOiBmYWxzZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCBzZWFyY2gnXG4gIHNjcmVlbjpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIHNjcmVlbidcbiAgJ3VuZG8tcmVkbyc6XG4gICAgYWxsb3dNdWx0aXBsZTogdHJ1ZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCB1bmRvLXJlZG8nXG4gICd1bmRvLXJlZG8tbXVsdGlwbGUtY2hhbmdlcyc6XG4gICAgYWxsb3dNdWx0aXBsZTogdHJ1ZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCB1bmRvLXJlZG8tbXVsdGlwbGUtY2hhbmdlcydcbiAgJ3VuZG8tcmVkby1tdWx0aXBsZS1kZWxldGUnOlxuICAgIGFsbG93TXVsdGlwbGU6IHRydWVcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggdW5kby1yZWRvLW11bHRpcGxlLWRlbGV0ZSdcblxuYWRkRGVtb1N1ZmZpeCA9IHJlcGxhY2VEZWNvcmF0aW9uQ2xhc3NCeS5iaW5kKG51bGwsICh0ZXh0KSAtPiB0ZXh0ICsgJy1kZW1vJylcbnJlbW92ZURlbW9TdWZmaXggPSByZXBsYWNlRGVjb3JhdGlvbkNsYXNzQnkuYmluZChudWxsLCAodGV4dCkgLT4gdGV4dC5yZXBsYWNlKC8tZGVtbyQvLCAnJykpXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEZsYXNoTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvcn0gPSBAdmltU3RhdGVcbiAgICBAbWFya2Vyc0J5VHlwZSA9IG5ldyBNYXBcbiAgICBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG4gICAgQHBvc3Rwb25lZERlc3Ryb3lNYXJrZXJzVGFza3MgPSBbXVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQG1hcmtlcnNCeVR5cGUuZm9yRWFjaCAobWFya2VycykgLT5cbiAgICAgIG1hcmtlci5kZXN0cm95KCkgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG4gICAgQG1hcmtlcnNCeVR5cGUuY2xlYXIoKVxuXG4gIGRlc3Ryb3lEZW1vTW9kZU1hcmtlcnM6IC0+XG4gICAgZm9yIHJlc29sdmUgaW4gQHBvc3Rwb25lZERlc3Ryb3lNYXJrZXJzVGFza3NcbiAgICAgIHJlc29sdmUoKVxuICAgIEBwb3N0cG9uZWREZXN0cm95TWFya2Vyc1Rhc2tzID0gW11cblxuICBkZXN0cm95TWFya2Vyc0FmdGVyOiAobWFya2VycywgdGltZW91dCkgLT5cbiAgICBzZXRUaW1lb3V0IC0+XG4gICAgICBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgICwgdGltZW91dFxuXG4gIGZsYXNoOiAocmFuZ2VzLCBvcHRpb25zLCByYW5nZVR5cGU9J2J1ZmZlcicpIC0+XG4gICAgcmFuZ2VzID0gW3Jhbmdlc10gdW5sZXNzIF8uaXNBcnJheShyYW5nZXMpXG4gICAgcmFuZ2VzID0gcmFuZ2VzLmZpbHRlcihpc05vdEVtcHR5KVxuICAgIHJldHVybiBudWxsIHVubGVzcyByYW5nZXMubGVuZ3RoXG5cbiAgICB7dHlwZSwgdGltZW91dH0gPSBvcHRpb25zXG4gICAgdGltZW91dCA/PSAxMDAwXG5cbiAgICB7YWxsb3dNdWx0aXBsZSwgZGVjb3JhdGlvbk9wdGlvbnN9ID0gZmxhc2hUeXBlc1t0eXBlXVxuICAgIG1hcmtlck9wdGlvbnMgPSB7aW52YWxpZGF0ZTogJ3RvdWNoJ31cblxuICAgIHN3aXRjaCByYW5nZVR5cGVcbiAgICAgIHdoZW4gJ2J1ZmZlcidcbiAgICAgICAgbWFya2VycyA9IChAZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShyYW5nZSwgbWFya2VyT3B0aW9ucykgZm9yIHJhbmdlIGluIHJhbmdlcylcbiAgICAgIHdoZW4gJ3NjcmVlbidcbiAgICAgICAgbWFya2VycyA9IChAZWRpdG9yLm1hcmtTY3JlZW5SYW5nZShyYW5nZSwgbWFya2VyT3B0aW9ucykgZm9yIHJhbmdlIGluIHJhbmdlcylcblxuICAgIHVubGVzcyBhbGxvd011bHRpcGxlXG4gICAgICBpZiBAbWFya2Vyc0J5VHlwZS5oYXModHlwZSlcbiAgICAgICAgbWFya2VyLmRlc3Ryb3koKSBmb3IgbWFya2VyIGluIEBtYXJrZXJzQnlUeXBlLmdldCh0eXBlKVxuICAgICAgQG1hcmtlcnNCeVR5cGUuc2V0KHR5cGUsIG1hcmtlcnMpXG5cbiAgICBkZWNvcmF0aW9ucyA9IG1hcmtlcnMubWFwIChtYXJrZXIpID0+IEBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCBkZWNvcmF0aW9uT3B0aW9ucylcblxuICAgIGlmIEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoJ2RlbW9Nb2RlSXNBY3RpdmUnKVxuICAgICAgZGVjb3JhdGlvbnMubWFwKGFkZERlbW9TdWZmaXgpXG4gICAgICBAcG9zdHBvbmVkRGVzdHJveU1hcmtlcnNUYXNrcy5wdXNoID0+XG4gICAgICAgIGRlY29yYXRpb25zLm1hcChyZW1vdmVEZW1vU3VmZml4KVxuICAgICAgICBAZGVzdHJveU1hcmtlcnNBZnRlcihtYXJrZXJzLCB0aW1lb3V0KVxuICAgIGVsc2VcbiAgICAgIEBkZXN0cm95TWFya2Vyc0FmdGVyKG1hcmtlcnMsIHRpbWVvdXQpXG5cbiAgZmxhc2hTY3JlZW5SYW5nZTogKGFyZ3MuLi4pIC0+XG4gICAgQGZsYXNoKGFyZ3MuY29uY2F0KCdzY3JlZW4nKS4uLilcbiJdfQ==
