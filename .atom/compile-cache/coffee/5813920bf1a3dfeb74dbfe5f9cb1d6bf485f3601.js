(function() {
  var HoverManager,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports = HoverManager = (function() {
    function HoverManager(vimState) {
      var ref;
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement;
      this.container = document.createElement('div');
      this.decorationOptions = {
        type: 'overlay',
        item: this.container
      };
      this.vimState.onDidDestroy(this.destroy);
      this.reset();
    }

    HoverManager.prototype.getPoint = function() {
      var selection;
      if (this.vimState.isMode('visual', 'blockwise')) {
        return this.vimState.getLastBlockwiseSelection().getHeadSelection().getHeadBufferPosition();
      } else {
        selection = this.editor.getLastSelection();
        return this.vimState.swrap(selection).getBufferPositionFor('head', {
          from: ['property', 'selection']
        });
      }
    };

    HoverManager.prototype.set = function(text, point, options) {
      var ref, ref1;
      if (point == null) {
        point = this.getPoint();
      }
      if (options == null) {
        options = {};
      }
      if (this.marker == null) {
        this.marker = this.editor.markBufferPosition(point);
        this.editor.decorateMarker(this.marker, this.decorationOptions);
      }
      if ((ref = options.classList) != null ? ref.length : void 0) {
        (ref1 = this.container.classList).add.apply(ref1, options.classList);
      }
      return this.container.textContent = text;
    };

    HoverManager.prototype.reset = function() {
      var ref;
      this.container.className = 'vim-mode-plus-hover';
      if ((ref = this.marker) != null) {
        ref.destroy();
      }
      return this.marker = null;
    };

    HoverManager.prototype.destroy = function() {
      var ref;
      this.container.remove();
      if ((ref = this.marker) != null) {
        ref.destroy();
      }
      return this.marker = null;
    };

    return HoverManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2hvdmVyLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxZQUFBO0lBQUE7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHNCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7O01BQ1osTUFBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGFBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxvQkFBQTtNQUNYLElBQUMsQ0FBQSxTQUFELEdBQWEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDYixJQUFDLENBQUEsaUJBQUQsR0FBcUI7UUFBQyxJQUFBLEVBQU0sU0FBUDtRQUFrQixJQUFBLEVBQU0sSUFBQyxDQUFBLFNBQXpCOztNQUNyQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQXhCO01BQ0EsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQUxXOzsyQkFPYixRQUFBLEdBQVUsU0FBQTtBQUNSLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixRQUFqQixFQUEyQixXQUEzQixDQUFIO2VBQ0UsSUFBQyxDQUFBLFFBQVEsQ0FBQyx5QkFBVixDQUFBLENBQXFDLENBQUMsZ0JBQXRDLENBQUEsQ0FBd0QsQ0FBQyxxQkFBekQsQ0FBQSxFQURGO09BQUEsTUFBQTtRQUdFLFNBQUEsR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUE7ZUFDWixJQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBZ0IsU0FBaEIsQ0FBMEIsQ0FBQyxvQkFBM0IsQ0FBZ0QsTUFBaEQsRUFBd0Q7VUFBQSxJQUFBLEVBQU0sQ0FBQyxVQUFELEVBQWEsV0FBYixDQUFOO1NBQXhELEVBSkY7O0lBRFE7OzJCQU9WLEdBQUEsR0FBSyxTQUFDLElBQUQsRUFBTyxLQUFQLEVBQTBCLE9BQTFCO0FBQ0gsVUFBQTs7UUFEVSxRQUFNLElBQUMsQ0FBQSxRQUFELENBQUE7OztRQUFhLFVBQVE7O01BQ3JDLElBQU8sbUJBQVA7UUFDRSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBMkIsS0FBM0I7UUFDVixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBdUIsSUFBQyxDQUFBLE1BQXhCLEVBQWdDLElBQUMsQ0FBQSxpQkFBakMsRUFGRjs7TUFJQSwyQ0FBb0IsQ0FBRSxlQUF0QjtRQUNFLFFBQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxTQUFYLENBQW9CLENBQUMsR0FBckIsYUFBeUIsT0FBTyxDQUFDLFNBQWpDLEVBREY7O2FBRUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxXQUFYLEdBQXlCO0lBUHRCOzsyQkFTTCxLQUFBLEdBQU8sU0FBQTtBQUNMLFVBQUE7TUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLFNBQVgsR0FBdUI7O1dBQ2hCLENBQUUsT0FBVCxDQUFBOzthQUNBLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFITDs7MkJBS1AsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUE7O1dBQ08sQ0FBRSxPQUFULENBQUE7O2FBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUhIOzs7OztBQTlCWCIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEhvdmVyTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG4gICAgQGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgQGRlY29yYXRpb25PcHRpb25zID0ge3R5cGU6ICdvdmVybGF5JywgaXRlbTogQGNvbnRhaW5lcn1cbiAgICBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95KVxuICAgIEByZXNldCgpXG5cbiAgZ2V0UG9pbnQ6IC0+XG4gICAgaWYgQHZpbVN0YXRlLmlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICBAdmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmdldEhlYWRTZWxlY3Rpb24oKS5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIGVsc2VcbiAgICAgIHNlbGVjdGlvbiA9IEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpXG4gICAgICBAdmltU3RhdGUuc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknLCAnc2VsZWN0aW9uJ10pXG5cbiAgc2V0OiAodGV4dCwgcG9pbnQ9QGdldFBvaW50KCksIG9wdGlvbnM9e30pIC0+XG4gICAgdW5sZXNzIEBtYXJrZXI/XG4gICAgICBAbWFya2VyID0gQGVkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICBAZWRpdG9yLmRlY29yYXRlTWFya2VyKEBtYXJrZXIsIEBkZWNvcmF0aW9uT3B0aW9ucylcblxuICAgIGlmIG9wdGlvbnMuY2xhc3NMaXN0Py5sZW5ndGhcbiAgICAgIEBjb250YWluZXIuY2xhc3NMaXN0LmFkZChvcHRpb25zLmNsYXNzTGlzdC4uLilcbiAgICBAY29udGFpbmVyLnRleHRDb250ZW50ID0gdGV4dFxuXG4gIHJlc2V0OiAtPlxuICAgIEBjb250YWluZXIuY2xhc3NOYW1lID0gJ3ZpbS1tb2RlLXBsdXMtaG92ZXInXG4gICAgQG1hcmtlcj8uZGVzdHJveSgpXG4gICAgQG1hcmtlciA9IG51bGxcblxuICBkZXN0cm95OiA9PlxuICAgIEBjb250YWluZXIucmVtb3ZlKClcbiAgICBAbWFya2VyPy5kZXN0cm95KClcbiAgICBAbWFya2VyID0gbnVsbFxuIl19
