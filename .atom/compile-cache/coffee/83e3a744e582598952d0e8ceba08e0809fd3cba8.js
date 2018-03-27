(function() {
  var CompositeDisposable, HighlightSearchManager,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = HighlightSearchManager = (function() {
    function HighlightSearchManager(vimState) {
      var decorationOptions, ref;
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement, this.globalState = ref.globalState;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy));
      this.disposables.add(this.editor.onDidStopChanging((function(_this) {
        return function() {
          return _this.refresh();
        };
      })(this)));
      this.markerLayer = this.editor.addMarkerLayer();
      decorationOptions = {
        type: 'highlight',
        "class": 'vim-mode-plus-highlight-search'
      };
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, decorationOptions);
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
      var i, len, pattern, range, ref, results;
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
      if (this.vimState.utils.matchScopes(this.editorElement, this.vimState.getConfig('highlightSearchExcludeScopes'))) {
        return;
      }
      ref = this.vimState.utils.scanEditor(this.editor, pattern);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        range = ref[i];
        if (!range.isEmpty()) {
          results.push(this.markerLayer.markBufferRange(range, {
            invalidate: 'inside'
          }));
        }
      }
      return results;
    };

    return HighlightSearchManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2hpZ2hsaWdodC1zZWFyY2gtbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJDQUFBO0lBQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUd4QixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MsZ0NBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDs7TUFDWixNQUEwQyxJQUFDLENBQUEsUUFBM0MsRUFBQyxJQUFDLENBQUEsYUFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLG9CQUFBLGFBQVgsRUFBMEIsSUFBQyxDQUFBLGtCQUFBO01BQzNCLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUVuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUF4QixDQUFqQjtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLENBQTBCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsT0FBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCLENBQWpCO01BRUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQTtNQUNmLGlCQUFBLEdBQW9CO1FBQUMsSUFBQSxFQUFNLFdBQVA7UUFBb0IsQ0FBQSxLQUFBLENBQUEsRUFBTyxnQ0FBM0I7O01BQ3BCLElBQUMsQ0FBQSxlQUFELEdBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsbUJBQVIsQ0FBNEIsSUFBQyxDQUFBLFdBQTdCLEVBQTBDLGlCQUExQztJQVRSOztxQ0FXYixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxlQUFlLENBQUMsT0FBakIsQ0FBQTtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO2FBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7SUFITzs7cUNBT1QsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBQSxDQUFBLEdBQWdDO0lBRHRCOztxQ0FHWixVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUFBO0lBRFU7O3FDQUdaLFlBQUEsR0FBYyxTQUFBO2FBQ1osSUFBQyxDQUFBLFdBQVcsQ0FBQyxLQUFiLENBQUE7SUFEWTs7cUNBR2QsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQyxDQUFBLFlBQUQsQ0FBQTtNQUVBLElBQUEsQ0FBYyxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBb0IsaUJBQXBCLENBQWQ7QUFBQSxlQUFBOztNQUNBLElBQUEsQ0FBYyxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBQSxDQUFkO0FBQUEsZUFBQTs7TUFDQSxJQUFBLENBQWMsQ0FBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLHdCQUFqQixDQUFWLENBQWQ7QUFBQSxlQUFBOztNQUNBLElBQVUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsV0FBaEIsQ0FBNEIsSUFBQyxDQUFBLGFBQTdCLEVBQTRDLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFvQiw4QkFBcEIsQ0FBNUMsQ0FBVjtBQUFBLGVBQUE7O0FBRUE7QUFBQTtXQUFBLHFDQUFBOztZQUErRCxDQUFJLEtBQUssQ0FBQyxPQUFOLENBQUE7dUJBQ2pFLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixLQUE3QixFQUFvQztZQUFBLFVBQUEsRUFBWSxRQUFaO1dBQXBDOztBQURGOztJQVJPOzs7OztBQWhDWCIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbiMgR2VuZXJhbCBwdXJwb3NlIHV0aWxpdHkgY2xhc3MgdG8gbWFrZSBBdG9tJ3MgbWFya2VyIG1hbmFnZW1lbnQgZWFzaWVyLlxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgSGlnaGxpZ2h0U2VhcmNoTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBnbG9iYWxTdGF0ZX0gPSBAdmltU3RhdGVcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95KVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQGVkaXRvci5vbkRpZFN0b3BDaGFuZ2luZyA9PiBAcmVmcmVzaCgpXG5cbiAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmFkZE1hcmtlckxheWVyKClcbiAgICBkZWNvcmF0aW9uT3B0aW9ucyA9IHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWhpZ2hsaWdodC1zZWFyY2gnfVxuICAgIEBkZWNvcmF0aW9uTGF5ZXIgPSBAZWRpdG9yLmRlY29yYXRlTWFya2VyTGF5ZXIoQG1hcmtlckxheWVyLCBkZWNvcmF0aW9uT3B0aW9ucylcblxuICBkZXN0cm95OiA9PlxuICAgIEBkZWNvcmF0aW9uTGF5ZXIuZGVzdHJveSgpXG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIEBtYXJrZXJMYXllci5kZXN0cm95KClcblxuICAjIE1hcmtlcnNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGhhc01hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KCkgPiAwXG5cbiAgZ2V0TWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VycygpXG5cbiAgY2xlYXJNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5jbGVhcigpXG5cbiAgcmVmcmVzaDogLT5cbiAgICBAY2xlYXJNYXJrZXJzKClcblxuICAgIHJldHVybiB1bmxlc3MgQHZpbVN0YXRlLmdldENvbmZpZygnaGlnaGxpZ2h0U2VhcmNoJylcbiAgICByZXR1cm4gdW5sZXNzIEB2aW1TdGF0ZS5pc1Zpc2libGUoKVxuICAgIHJldHVybiB1bmxlc3MgcGF0dGVybiA9IEBnbG9iYWxTdGF0ZS5nZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nKVxuICAgIHJldHVybiBpZiBAdmltU3RhdGUudXRpbHMubWF0Y2hTY29wZXMoQGVkaXRvckVsZW1lbnQsIEB2aW1TdGF0ZS5nZXRDb25maWcoJ2hpZ2hsaWdodFNlYXJjaEV4Y2x1ZGVTY29wZXMnKSlcblxuICAgIGZvciByYW5nZSBpbiBAdmltU3RhdGUudXRpbHMuc2NhbkVkaXRvcihAZWRpdG9yLCBwYXR0ZXJuKSB3aGVuIG5vdCByYW5nZS5pc0VtcHR5KClcbiAgICAgIEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UsIGludmFsaWRhdGU6ICdpbnNpZGUnKVxuIl19
