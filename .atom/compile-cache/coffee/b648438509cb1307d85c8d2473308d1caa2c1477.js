(function() {
  var PersistentSelectionManager, _, decorationOptions,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  decorationOptions = {
    type: 'highlight',
    "class": 'vim-mode-plus-persistent-selection'
  };

  module.exports = PersistentSelectionManager = (function() {
    PersistentSelectionManager.prototype.patterns = null;

    function PersistentSelectionManager(vimState) {
      var ref;
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement;
      this.vimState.onDidDestroy(this.destroy);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3BlcnNpc3RlbnQtc2VsZWN0aW9uLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnREFBQTtJQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosaUJBQUEsR0FBb0I7SUFBQyxJQUFBLEVBQU0sV0FBUDtJQUFvQixDQUFBLEtBQUEsQ0FBQSxFQUFPLG9DQUEzQjs7O0VBRXBCLE1BQU0sQ0FBQyxPQUFQLEdBQ007eUNBQ0osUUFBQSxHQUFVOztJQUVHLG9DQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7O01BQ1osTUFBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGFBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxvQkFBQTtNQUNYLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBeEI7TUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBO01BQ2YsSUFBQyxDQUFBLGVBQUQsR0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBUixDQUE0QixJQUFDLENBQUEsV0FBN0IsRUFBMEMsaUJBQTFDO01BR25CLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUF5QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3ZCLEtBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLDBCQUFoQyxFQUE0RCxLQUFDLENBQUEsVUFBRCxDQUFBLENBQTVEO1FBRHVCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QjtJQVJXOzt5Q0FXYixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxlQUFlLENBQUMsT0FBakIsQ0FBQTthQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO0lBRk87O3lDQUlULE1BQUEsR0FBUSxTQUFBO0FBQ04sVUFBQTtBQUFBO0FBQUEsV0FBQSxxQ0FBQTs7UUFDRSxJQUFDLENBQUEsTUFBTSxDQUFDLDBCQUFSLENBQW1DLEtBQW5DO0FBREY7YUFFQSxJQUFDLENBQUEsS0FBRCxDQUFBO0lBSE07O3lDQUtSLHVCQUFBLEdBQXlCLFNBQUE7TUFDdkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFnQyxJQUFDLENBQUEscUJBQUQsQ0FBQSxDQUFoQzthQUNBLElBQUMsQ0FBQSxLQUFELENBQUE7SUFGdUI7O3lDQUl6QixLQUFBLEdBQU8sU0FBQTthQUNMLElBQUMsQ0FBQSxZQUFELENBQUE7SUFESzs7eUNBR1AsT0FBQSxHQUFTLFNBQUE7YUFDUCxJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBQSxDQUFBLEtBQWlDO0lBRDFCOzt5Q0FLVCxlQUFBLEdBQWlCLFNBQUMsS0FBRDthQUNmLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixLQUE3QjtJQURlOzt5Q0FHakIsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBQSxDQUFBLEdBQWdDO0lBRHRCOzt5Q0FHWixVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUFBO0lBRFU7O3lDQUdaLGNBQUEsR0FBZ0IsU0FBQTthQUNkLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUFBO0lBRGM7O3lDQUdoQixZQUFBLEdBQWMsU0FBQTthQUNaLElBQUMsQ0FBQSxXQUFXLENBQUMsS0FBYixDQUFBO0lBRFk7O3lDQUdkLHFCQUFBLEdBQXVCLFNBQUE7YUFDckIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQUEsQ0FBeUIsQ0FBQyxHQUExQixDQUE4QixTQUFDLE1BQUQ7ZUFDNUIsTUFBTSxDQUFDLGNBQVAsQ0FBQTtNQUQ0QixDQUE5QjtJQURxQjs7eUNBSXZCLGdCQUFBLEdBQWtCLFNBQUMsS0FBRDthQUNoQixJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUI7UUFBQSxzQkFBQSxFQUF3QixLQUF4QjtPQUF6QixDQUF3RCxDQUFBLENBQUE7SUFEeEM7Ozs7O0FBM0RwQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbmRlY29yYXRpb25PcHRpb25zID0ge3R5cGU6ICdoaWdobGlnaHQnLCBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtcGVyc2lzdGVudC1zZWxlY3Rpb24nfVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBQZXJzaXN0ZW50U2VsZWN0aW9uTWFuYWdlclxuICBwYXR0ZXJuczogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95KVxuXG4gICAgQG1hcmtlckxheWVyID0gQGVkaXRvci5hZGRNYXJrZXJMYXllcigpXG4gICAgQGRlY29yYXRpb25MYXllciA9IEBlZGl0b3IuZGVjb3JhdGVNYXJrZXJMYXllcihAbWFya2VyTGF5ZXIsIGRlY29yYXRpb25PcHRpb25zKVxuXG4gICAgIyBVcGRhdGUgY3NzIG9uIGV2ZXJ5IG1hcmtlciB1cGRhdGUuXG4gICAgQG1hcmtlckxheWVyLm9uRGlkVXBkYXRlID0+XG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwiaGFzLXBlcnNpc3RlbnQtc2VsZWN0aW9uXCIsIEBoYXNNYXJrZXJzKCkpXG5cbiAgZGVzdHJveTogPT5cbiAgICBAZGVjb3JhdGlvbkxheWVyLmRlc3Ryb3koKVxuICAgIEBtYXJrZXJMYXllci5kZXN0cm95KClcblxuICBzZWxlY3Q6IC0+XG4gICAgZm9yIHJhbmdlIGluIEBnZXRNYXJrZXJCdWZmZXJSYW5nZXMoKVxuICAgICAgQGVkaXRvci5hZGRTZWxlY3Rpb25Gb3JCdWZmZXJSYW5nZShyYW5nZSlcbiAgICBAY2xlYXIoKVxuXG4gIHNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzOiAtPlxuICAgIEBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoQGdldE1hcmtlckJ1ZmZlclJhbmdlcygpKVxuICAgIEBjbGVhcigpXG5cbiAgY2xlYXI6IC0+XG4gICAgQGNsZWFyTWFya2VycygpXG5cbiAgaXNFbXB0eTogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKSBpcyAwXG5cbiAgIyBNYXJrZXJzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBtYXJrQnVmZmVyUmFuZ2U6IChyYW5nZSkgLT5cbiAgICBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclJhbmdlKHJhbmdlKVxuXG4gIGhhc01hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KCkgPiAwXG5cbiAgZ2V0TWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VycygpXG5cbiAgZ2V0TWFya2VyQ291bnQ6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KClcblxuICBjbGVhck1hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmNsZWFyKClcblxuICBnZXRNYXJrZXJCdWZmZXJSYW5nZXM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlcnMoKS5tYXAgKG1hcmtlcikgLT5cbiAgICAgIG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZ2V0TWFya2VyQXRQb2ludDogKHBvaW50KSAtPlxuICAgIEBtYXJrZXJMYXllci5maW5kTWFya2Vycyhjb250YWluc0J1ZmZlclBvc2l0aW9uOiBwb2ludClbMF1cbiJdfQ==
