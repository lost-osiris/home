(function() {
  var CompositeDisposable, HighlightSearchManager, decorationOptions, matchScopes, ref, scanEditor;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('./utils'), scanEditor = ref.scanEditor, matchScopes = ref.matchScopes;

  decorationOptions = {
    type: 'highlight',
    "class": 'vim-mode-plus-highlight-search'
  };

  module.exports = HighlightSearchManager = (function() {
    function HighlightSearchManager(vimState) {
      var ref1;
      this.vimState = vimState;
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement, this.globalState = ref1.globalState;
      this.disposables = new CompositeDisposable;
      this.markerLayer = this.editor.addMarkerLayer();
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, decorationOptions);
      this.disposables.add(this.globalState.onDidChange((function(_this) {
        return function(arg) {
          var name, newValue;
          name = arg.name, newValue = arg.newValue;
          if (name === 'highlightSearchPattern') {
            if (newValue) {
              return _this.refresh();
            } else {
              return _this.clearMarkers();
            }
          }
        };
      })(this)));
    }

    HighlightSearchManager.prototype.destroy = function() {
      this.decorationLayer.destroy();
      this.disposables.dispose();
      return this.markerLayer.destroy();
    };

    HighlightSearchManager.prototype.hasMarkers = function() {
      return this.markerLayer.getMarkerCount() > 0;
    };

    HighlightSearchManager.prototype.getMarkers = function() {
      return this.markerLayer.getMarkers();
    };

    HighlightSearchManager.prototype.clearMarkers = function() {
      return this.markerLayer.clear();
    };

    HighlightSearchManager.prototype.refresh = function() {
      var i, len, pattern, range, ref1, results;
      this.clearMarkers();
      if (!this.vimState.getConfig('highlightSearch')) {
        return;
      }
      if (!this.vimState.isVisible()) {
        return;
      }
      if (!(pattern = this.globalState.get('highlightSearchPattern'))) {
        return;
      }
      if (matchScopes(this.editorElement, this.vimState.getConfig('highlightSearchExcludeScopes'))) {
        return;
      }
      ref1 = scanEditor(this.editor, pattern);
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        range = ref1[i];
        results.push(this.markerLayer.markBufferRange(range, {
          invalidate: 'inside'
        }));
      }
      return results;
    };

    return HighlightSearchManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2hpZ2hsaWdodC1zZWFyY2gtbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsTUFBNEIsT0FBQSxDQUFRLFNBQVIsQ0FBNUIsRUFBQywyQkFBRCxFQUFhOztFQUViLGlCQUFBLEdBQ0U7SUFBQSxJQUFBLEVBQU0sV0FBTjtJQUNBLENBQUEsS0FBQSxDQUFBLEVBQU8sZ0NBRFA7OztFQUlGLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxnQ0FBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osT0FBMEMsSUFBQyxDQUFBLFFBQTNDLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQSxhQUFYLEVBQTBCLElBQUMsQ0FBQSxtQkFBQTtNQUMzQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQTtNQUVmLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QixDQUFqQjtNQUNBLElBQUMsQ0FBQSxlQUFELEdBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsbUJBQVIsQ0FBNEIsSUFBQyxDQUFBLFdBQTdCLEVBQTBDLGlCQUExQztNQUluQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQXlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQ3hDLGNBQUE7VUFEMEMsaUJBQU07VUFDaEQsSUFBRyxJQUFBLEtBQVEsd0JBQVg7WUFDRSxJQUFHLFFBQUg7cUJBQ0UsS0FBQyxDQUFBLE9BQUQsQ0FBQSxFQURGO2FBQUEsTUFBQTtxQkFHRSxLQUFDLENBQUEsWUFBRCxDQUFBLEVBSEY7YUFERjs7UUFEd0M7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCLENBQWpCO0lBVlc7O3FDQWlCYixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxlQUFlLENBQUMsT0FBakIsQ0FBQTtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO2FBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7SUFITzs7cUNBT1QsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBQSxDQUFBLEdBQWdDO0lBRHRCOztxQ0FHWixVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUFBO0lBRFU7O3FDQUdaLFlBQUEsR0FBYyxTQUFBO2FBQ1osSUFBQyxDQUFBLFdBQVcsQ0FBQyxLQUFiLENBQUE7SUFEWTs7cUNBR2QsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQyxDQUFBLFlBQUQsQ0FBQTtNQUVBLElBQUEsQ0FBYyxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBb0IsaUJBQXBCLENBQWQ7QUFBQSxlQUFBOztNQUNBLElBQUEsQ0FBYyxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBQSxDQUFkO0FBQUEsZUFBQTs7TUFDQSxJQUFBLENBQWMsQ0FBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLHdCQUFqQixDQUFWLENBQWQ7QUFBQSxlQUFBOztNQUNBLElBQVUsV0FBQSxDQUFZLElBQUMsQ0FBQSxhQUFiLEVBQTRCLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFvQiw4QkFBcEIsQ0FBNUIsQ0FBVjtBQUFBLGVBQUE7O0FBRUE7QUFBQTtXQUFBLHNDQUFBOztxQkFDRSxJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsS0FBN0IsRUFBb0M7VUFBQSxVQUFBLEVBQVksUUFBWjtTQUFwQztBQURGOztJQVJPOzs7OztBQTNDWCIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57c2NhbkVkaXRvciwgbWF0Y2hTY29wZXN9ID0gcmVxdWlyZSAnLi91dGlscydcblxuZGVjb3JhdGlvbk9wdGlvbnMgPVxuICB0eXBlOiAnaGlnaGxpZ2h0J1xuICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtaGlnaGxpZ2h0LXNlYXJjaCdcblxuIyBHZW5lcmFsIHB1cnBvc2UgdXRpbGl0eSBjbGFzcyB0byBtYWtlIEF0b20ncyBtYXJrZXIgbWFuYWdlbWVudCBlYXNpZXIuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBIaWdobGlnaHRTZWFyY2hNYW5hZ2VyXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQGdsb2JhbFN0YXRlfSA9IEB2aW1TdGF0ZVxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQG1hcmtlckxheWVyID0gQGVkaXRvci5hZGRNYXJrZXJMYXllcigpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcbiAgICBAZGVjb3JhdGlvbkxheWVyID0gQGVkaXRvci5kZWNvcmF0ZU1hcmtlckxheWVyKEBtYXJrZXJMYXllciwgZGVjb3JhdGlvbk9wdGlvbnMpXG5cbiAgICAjIFJlZnJlc2ggaGlnaGxpZ2h0IGJhc2VkIG9uIGdsb2JhbFN0YXRlLmhpZ2hsaWdodFNlYXJjaFBhdHRlcm4gY2hhbmdlcy5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBnbG9iYWxTdGF0ZS5vbkRpZENoYW5nZSAoe25hbWUsIG5ld1ZhbHVlfSkgPT5cbiAgICAgIGlmIG5hbWUgaXMgJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nXG4gICAgICAgIGlmIG5ld1ZhbHVlXG4gICAgICAgICAgQHJlZnJlc2goKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGNsZWFyTWFya2VycygpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAZGVjb3JhdGlvbkxheWVyLmRlc3Ryb3koKVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAbWFya2VyTGF5ZXIuZGVzdHJveSgpXG5cbiAgIyBNYXJrZXJzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoYXNNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpID4gMFxuXG4gIGdldE1hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlcnMoKVxuXG4gIGNsZWFyTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuY2xlYXIoKVxuXG4gIHJlZnJlc2g6IC0+XG4gICAgQGNsZWFyTWFya2VycygpXG5cbiAgICByZXR1cm4gdW5sZXNzIEB2aW1TdGF0ZS5nZXRDb25maWcoJ2hpZ2hsaWdodFNlYXJjaCcpXG4gICAgcmV0dXJuIHVubGVzcyBAdmltU3RhdGUuaXNWaXNpYmxlKClcbiAgICByZXR1cm4gdW5sZXNzIHBhdHRlcm4gPSBAZ2xvYmFsU3RhdGUuZ2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJylcbiAgICByZXR1cm4gaWYgbWF0Y2hTY29wZXMoQGVkaXRvckVsZW1lbnQsIEB2aW1TdGF0ZS5nZXRDb25maWcoJ2hpZ2hsaWdodFNlYXJjaEV4Y2x1ZGVTY29wZXMnKSlcblxuICAgIGZvciByYW5nZSBpbiBzY2FuRWRpdG9yKEBlZGl0b3IsIHBhdHRlcm4pXG4gICAgICBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclJhbmdlKHJhbmdlLCBpbnZhbGlkYXRlOiAnaW5zaWRlJylcbiJdfQ==
