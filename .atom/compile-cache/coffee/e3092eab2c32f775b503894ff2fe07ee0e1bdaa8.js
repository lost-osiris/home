(function() {
  var HoverManager, swrap;

  swrap = require('./selection-wrapper');

  module.exports = HoverManager = (function() {
    function HoverManager(vimState) {
      var ref;
      this.vimState = vimState;
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement;
      this.container = document.createElement('div');
      this.decorationOptions = {
        type: 'overlay',
        item: this.container
      };
      this.reset();
    }

    HoverManager.prototype.getPoint = function() {
      var selection;
      if (this.vimState.isMode('visual', 'blockwise')) {
        return this.vimState.getLastBlockwiseSelection().getHeadSelection().getHeadBufferPosition();
      } else {
        selection = this.editor.getLastSelection();
        return swrap(selection).getBufferPositionFor('head', {
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
      this.vimState = {}.vimState;
      return this.reset();
    };

    return HoverManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2hvdmVyLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUVSLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxzQkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osTUFBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGFBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxvQkFBQTtNQUNYLElBQUMsQ0FBQSxTQUFELEdBQWEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDYixJQUFDLENBQUEsaUJBQUQsR0FBcUI7UUFBQyxJQUFBLEVBQU0sU0FBUDtRQUFrQixJQUFBLEVBQU0sSUFBQyxDQUFBLFNBQXpCOztNQUNyQixJQUFDLENBQUEsS0FBRCxDQUFBO0lBSlc7OzJCQU1iLFFBQUEsR0FBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLFFBQWpCLEVBQTJCLFdBQTNCLENBQUg7ZUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLHlCQUFWLENBQUEsQ0FBcUMsQ0FBQyxnQkFBdEMsQ0FBQSxDQUF3RCxDQUFDLHFCQUF6RCxDQUFBLEVBREY7T0FBQSxNQUFBO1FBR0UsU0FBQSxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBQTtlQUNaLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsb0JBQWpCLENBQXNDLE1BQXRDLEVBQThDO1VBQUEsSUFBQSxFQUFNLENBQUMsVUFBRCxFQUFhLFdBQWIsQ0FBTjtTQUE5QyxFQUpGOztJQURROzsyQkFPVixHQUFBLEdBQUssU0FBQyxJQUFELEVBQU8sS0FBUCxFQUEwQixPQUExQjtBQUNILFVBQUE7O1FBRFUsUUFBTSxJQUFDLENBQUEsUUFBRCxDQUFBOzs7UUFBYSxVQUFROztNQUNyQyxJQUFPLG1CQUFQO1FBQ0UsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQTJCLEtBQTNCO1FBQ1YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQXVCLElBQUMsQ0FBQSxNQUF4QixFQUFnQyxJQUFDLENBQUEsaUJBQWpDLEVBRkY7O01BSUEsMkNBQW9CLENBQUUsZUFBdEI7UUFDRSxRQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBWCxDQUFvQixDQUFDLEdBQXJCLGFBQXlCLE9BQU8sQ0FBQyxTQUFqQyxFQURGOzthQUVBLElBQUMsQ0FBQSxTQUFTLENBQUMsV0FBWCxHQUF5QjtJQVB0Qjs7MkJBU0wsS0FBQSxHQUFPLFNBQUE7QUFDTCxVQUFBO01BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxTQUFYLEdBQXVCOztXQUNoQixDQUFFLE9BQVQsQ0FBQTs7YUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVO0lBSEw7OzJCQUtQLE9BQUEsR0FBUyxTQUFBO01BQ04sSUFBQyxDQUFBLFdBQVksR0FBWjthQUNGLElBQUMsQ0FBQSxLQUFELENBQUE7SUFGTzs7Ozs7QUEvQlgiLCJzb3VyY2VzQ29udGVudCI6WyJzd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEhvdmVyTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG4gICAgQGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgQGRlY29yYXRpb25PcHRpb25zID0ge3R5cGU6ICdvdmVybGF5JywgaXRlbTogQGNvbnRhaW5lcn1cbiAgICBAcmVzZXQoKVxuXG4gIGdldFBvaW50OiAtPlxuICAgIGlmIEB2aW1TdGF0ZS5pc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgQHZpbVN0YXRlLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5nZXRIZWFkU2VsZWN0aW9uKCkuZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICBlbHNlXG4gICAgICBzZWxlY3Rpb24gPSBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKVxuICAgICAgc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknLCAnc2VsZWN0aW9uJ10pXG5cbiAgc2V0OiAodGV4dCwgcG9pbnQ9QGdldFBvaW50KCksIG9wdGlvbnM9e30pIC0+XG4gICAgdW5sZXNzIEBtYXJrZXI/XG4gICAgICBAbWFya2VyID0gQGVkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICBAZWRpdG9yLmRlY29yYXRlTWFya2VyKEBtYXJrZXIsIEBkZWNvcmF0aW9uT3B0aW9ucylcblxuICAgIGlmIG9wdGlvbnMuY2xhc3NMaXN0Py5sZW5ndGhcbiAgICAgIEBjb250YWluZXIuY2xhc3NMaXN0LmFkZChvcHRpb25zLmNsYXNzTGlzdC4uLilcbiAgICBAY29udGFpbmVyLnRleHRDb250ZW50ID0gdGV4dFxuXG4gIHJlc2V0OiAtPlxuICAgIEBjb250YWluZXIuY2xhc3NOYW1lID0gJ3ZpbS1tb2RlLXBsdXMtaG92ZXInXG4gICAgQG1hcmtlcj8uZGVzdHJveSgpXG4gICAgQG1hcmtlciA9IG51bGxcblxuICBkZXN0cm95OiAtPlxuICAgIHtAdmltU3RhdGV9ID0ge31cbiAgICBAcmVzZXQoKVxuIl19
