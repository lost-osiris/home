(function() {
  var CompositeDisposable, PersistentSelectionManager, _, decorationOptions;

  _ = require('underscore-plus');

  CompositeDisposable = require('atom').CompositeDisposable;

  decorationOptions = {
    type: 'highlight',
    "class": 'vim-mode-plus-persistent-selection'
  };

  module.exports = PersistentSelectionManager = (function() {
    PersistentSelectionManager.prototype.patterns = null;

    function PersistentSelectionManager(vimState) {
      var ref;
      this.vimState = vimState;
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.markerLayer = this.editor.addMarkerLayer();
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, decorationOptions);
      this.markerLayer.onDidUpdate((function(_this) {
        return function() {
          return _this.editorElement.classList.toggle("has-persistent-selection", _this.hasMarkers());
        };
      })(this));
    }

    PersistentSelectionManager.prototype.destroy = function() {
      this.decorationLayer.destroy();
      this.disposables.dispose();
      return this.markerLayer.destroy();
    };

    PersistentSelectionManager.prototype.select = function() {
      var i, len, range, ref;
      ref = this.getMarkerBufferRanges();
      for (i = 0, len = ref.length; i < len; i++) {
        range = ref[i];
        this.editor.addSelectionForBufferRange(range);
      }
      return this.clear();
    };

    PersistentSelectionManager.prototype.setSelectedBufferRanges = function() {
      this.editor.setSelectedBufferRanges(this.getMarkerBufferRanges());
      return this.clear();
    };

    PersistentSelectionManager.prototype.clear = function() {
      return this.clearMarkers();
    };

    PersistentSelectionManager.prototype.isEmpty = function() {
      return this.markerLayer.getMarkerCount() === 0;
    };

    PersistentSelectionManager.prototype.markBufferRange = function(range) {
      return this.markerLayer.markBufferRange(range);
    };

    PersistentSelectionManager.prototype.hasMarkers = function() {
      return this.markerLayer.getMarkerCount() > 0;
    };

    PersistentSelectionManager.prototype.getMarkers = function() {
      return this.markerLayer.getMarkers();
    };

    PersistentSelectionManager.prototype.getMarkerCount = function() {
      return this.markerLayer.getMarkerCount();
    };

    PersistentSelectionManager.prototype.clearMarkers = function() {
      return this.markerLayer.clear();
    };

    PersistentSelectionManager.prototype.getMarkerBufferRanges = function() {
      return this.markerLayer.getMarkers().map(function(marker) {
        return marker.getBufferRange();
      });
    };

    PersistentSelectionManager.prototype.getMarkerAtPoint = function(point) {
      return this.markerLayer.findMarkers({
        containsBufferPosition: point
      })[0];
    };

    return PersistentSelectionManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3BlcnNpc3RlbnQtc2VsZWN0aW9uLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNILHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsaUJBQUEsR0FBb0I7SUFBQyxJQUFBLEVBQU0sV0FBUDtJQUFvQixDQUFBLEtBQUEsQ0FBQSxFQUFPLG9DQUEzQjs7O0VBRXBCLE1BQU0sQ0FBQyxPQUFQLEdBQ007eUNBQ0osUUFBQSxHQUFVOztJQUVHLG9DQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixNQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsYUFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLG9CQUFBO01BQ1gsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJO01BQ25CLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QixDQUFqQjtNQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUE7TUFDZixJQUFDLENBQUEsZUFBRCxHQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLG1CQUFSLENBQTRCLElBQUMsQ0FBQSxXQUE3QixFQUEwQyxpQkFBMUM7TUFHbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQXlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDdkIsS0FBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBekIsQ0FBZ0MsMEJBQWhDLEVBQTRELEtBQUMsQ0FBQSxVQUFELENBQUEsQ0FBNUQ7UUFEdUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO0lBVFc7O3lDQVliLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLGVBQWUsQ0FBQyxPQUFqQixDQUFBO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7YUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTtJQUhPOzt5Q0FLVCxNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7QUFBQTtBQUFBLFdBQUEscUNBQUE7O1FBQ0UsSUFBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFtQyxLQUFuQztBQURGO2FBRUEsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQUhNOzt5Q0FLUix1QkFBQSxHQUF5QixTQUFBO01BQ3ZCLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBaEM7YUFDQSxJQUFDLENBQUEsS0FBRCxDQUFBO0lBRnVCOzt5Q0FJekIsS0FBQSxHQUFPLFNBQUE7YUFDTCxJQUFDLENBQUEsWUFBRCxDQUFBO0lBREs7O3lDQUdQLE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQUEsQ0FBQSxLQUFpQztJQUQxQjs7eUNBS1QsZUFBQSxHQUFpQixTQUFDLEtBQUQ7YUFDZixJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsS0FBN0I7SUFEZTs7eUNBR2pCLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQUEsQ0FBQSxHQUFnQztJQUR0Qjs7eUNBR1osVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsV0FBVyxDQUFDLFVBQWIsQ0FBQTtJQURVOzt5Q0FHWixjQUFBLEdBQWdCLFNBQUE7YUFDZCxJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBQTtJQURjOzt5Q0FHaEIsWUFBQSxHQUFjLFNBQUE7YUFDWixJQUFDLENBQUEsV0FBVyxDQUFDLEtBQWIsQ0FBQTtJQURZOzt5Q0FHZCxxQkFBQSxHQUF1QixTQUFBO2FBQ3JCLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUFBLENBQXlCLENBQUMsR0FBMUIsQ0FBOEIsU0FBQyxNQUFEO2VBQzVCLE1BQU0sQ0FBQyxjQUFQLENBQUE7TUFENEIsQ0FBOUI7SUFEcUI7O3lDQUl2QixnQkFBQSxHQUFrQixTQUFDLEtBQUQ7YUFDaEIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQXlCO1FBQUEsc0JBQUEsRUFBd0IsS0FBeEI7T0FBekIsQ0FBd0QsQ0FBQSxDQUFBO0lBRHhDOzs7OztBQTlEcEIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuZGVjb3JhdGlvbk9wdGlvbnMgPSB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiAndmltLW1vZGUtcGx1cy1wZXJzaXN0ZW50LXNlbGVjdGlvbid9XG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFBlcnNpc3RlbnRTZWxlY3Rpb25NYW5hZ2VyXG4gIHBhdHRlcm5zOiBudWxsXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG5cbiAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmFkZE1hcmtlckxheWVyKClcbiAgICBAZGVjb3JhdGlvbkxheWVyID0gQGVkaXRvci5kZWNvcmF0ZU1hcmtlckxheWVyKEBtYXJrZXJMYXllciwgZGVjb3JhdGlvbk9wdGlvbnMpXG5cbiAgICAjIFVwZGF0ZSBjc3Mgb24gZXZlcnkgbWFya2VyIHVwZGF0ZS5cbiAgICBAbWFya2VyTGF5ZXIub25EaWRVcGRhdGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJoYXMtcGVyc2lzdGVudC1zZWxlY3Rpb25cIiwgQGhhc01hcmtlcnMoKSlcblxuICBkZXN0cm95OiAtPlxuICAgIEBkZWNvcmF0aW9uTGF5ZXIuZGVzdHJveSgpXG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIEBtYXJrZXJMYXllci5kZXN0cm95KClcblxuICBzZWxlY3Q6IC0+XG4gICAgZm9yIHJhbmdlIGluIEBnZXRNYXJrZXJCdWZmZXJSYW5nZXMoKVxuICAgICAgQGVkaXRvci5hZGRTZWxlY3Rpb25Gb3JCdWZmZXJSYW5nZShyYW5nZSlcbiAgICBAY2xlYXIoKVxuXG4gIHNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzOiAtPlxuICAgIEBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoQGdldE1hcmtlckJ1ZmZlclJhbmdlcygpKVxuICAgIEBjbGVhcigpXG5cbiAgY2xlYXI6IC0+XG4gICAgQGNsZWFyTWFya2VycygpXG5cbiAgaXNFbXB0eTogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKSBpcyAwXG5cbiAgIyBNYXJrZXJzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBtYXJrQnVmZmVyUmFuZ2U6IChyYW5nZSkgLT5cbiAgICBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclJhbmdlKHJhbmdlKVxuXG4gIGhhc01hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KCkgPiAwXG5cbiAgZ2V0TWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VycygpXG5cbiAgZ2V0TWFya2VyQ291bnQ6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KClcblxuICBjbGVhck1hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmNsZWFyKClcblxuICBnZXRNYXJrZXJCdWZmZXJSYW5nZXM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlcnMoKS5tYXAgKG1hcmtlcikgLT5cbiAgICAgIG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZ2V0TWFya2VyQXRQb2ludDogKHBvaW50KSAtPlxuICAgIEBtYXJrZXJMYXllci5maW5kTWFya2Vycyhjb250YWluc0J1ZmZlclBvc2l0aW9uOiBwb2ludClbMF1cbiJdfQ==
