(function() {
  var CompositeDisposable, MARKS, MarkManager, Point, ref,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Point = ref.Point, CompositeDisposable = ref.CompositeDisposable;

  MARKS = /(?:[a-z]|[\[\]`'.^(){}<>])/;

  MarkManager = (function() {
    MarkManager.prototype.marks = null;

    function MarkManager(vimState) {
      var ref1;
      this.vimState = vimState;
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.marks = {};
      this.markerLayer = this.editor.addMarkerLayer();
    }

    MarkManager.prototype.destroy = function() {
      this.disposables.dispose();
      this.markerLayer.destroy();
      return this.marks = null;
    };

    MarkManager.prototype.isValid = function(name) {
      return MARKS.test(name);
    };

    MarkManager.prototype.get = function(name) {
      var point, ref1;
      if (!this.isValid(name)) {
        return;
      }
      point = (ref1 = this.marks[name]) != null ? ref1.getStartBufferPosition() : void 0;
      if (indexOf.call("`'", name) >= 0) {
        return point != null ? point : Point.ZERO;
      } else {
        return point;
      }
    };

    MarkManager.prototype.set = function(name, point) {
      var bufferPosition, marker;
      if (!this.isValid(name)) {
        return;
      }
      if (marker = this.marks[name]) {
        marker.destroy();
      }
      bufferPosition = this.editor.clipBufferPosition(point);
      this.marks[name] = this.markerLayer.markBufferPosition(bufferPosition, {
        invalidate: 'never'
      });
      return this.vimState.emitter.emit('did-set-mark', {
        name: name,
        bufferPosition: bufferPosition,
        editor: this.editor
      });
    };

    return MarkManager;

  })();

  module.exports = MarkManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21hcmstbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG1EQUFBO0lBQUE7O0VBQUEsTUFBK0IsT0FBQSxDQUFRLE1BQVIsQ0FBL0IsRUFBQyxpQkFBRCxFQUFROztFQUVSLEtBQUEsR0FBUTs7RUFLRjswQkFDSixLQUFBLEdBQU87O0lBRU0scUJBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDtNQUNaLE9BQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxjQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEscUJBQUE7TUFDWCxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQXZCLENBQWpCO01BRUEsSUFBQyxDQUFBLEtBQUQsR0FBUztNQUNULElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUE7SUFOSjs7MEJBUWIsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO2FBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUhGOzswQkFLVCxPQUFBLEdBQVMsU0FBQyxJQUFEO2FBQ1AsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYO0lBRE87OzBCQUdULEdBQUEsR0FBSyxTQUFDLElBQUQ7QUFDSCxVQUFBO01BQUEsSUFBQSxDQUFjLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxDQUFkO0FBQUEsZUFBQTs7TUFDQSxLQUFBLDJDQUFvQixDQUFFLHNCQUFkLENBQUE7TUFDUixJQUFHLGFBQVEsSUFBUixFQUFBLElBQUEsTUFBSDsrQkFDRSxRQUFRLEtBQUssQ0FBQyxLQURoQjtPQUFBLE1BQUE7ZUFHRSxNQUhGOztJQUhHOzswQkFTTCxHQUFBLEdBQUssU0FBQyxJQUFELEVBQU8sS0FBUDtBQUNILFVBQUE7TUFBQSxJQUFBLENBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULENBQWQ7QUFBQSxlQUFBOztNQUNBLElBQUcsTUFBQSxHQUFTLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQSxDQUFuQjtRQUNFLE1BQU0sQ0FBQyxPQUFQLENBQUEsRUFERjs7TUFFQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBMkIsS0FBM0I7TUFDakIsSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBLENBQVAsR0FBZSxJQUFDLENBQUEsV0FBVyxDQUFDLGtCQUFiLENBQWdDLGNBQWhDLEVBQWdEO1FBQUEsVUFBQSxFQUFZLE9BQVo7T0FBaEQ7YUFDZixJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFsQixDQUF1QixjQUF2QixFQUF1QztRQUFDLE1BQUEsSUFBRDtRQUFPLGdCQUFBLGNBQVA7UUFBd0IsUUFBRCxJQUFDLENBQUEsTUFBeEI7T0FBdkM7SUFORzs7Ozs7O0VBUVAsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUEzQ2pCIiwic291cmNlc0NvbnRlbnQiOlsie1BvaW50LCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbk1BUktTID0gLy8vIChcbiAgPzogW2Etel1cbiAgIHwgW1xcW1xcXWAnLl4oKXt9PD5dXG4pIC8vL1xuXG5jbGFzcyBNYXJrTWFuYWdlclxuICBtYXJrczogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gICAgQG1hcmtzID0ge31cbiAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmFkZE1hcmtlckxheWVyKClcblxuICBkZXN0cm95OiAtPlxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAbWFya2VyTGF5ZXIuZGVzdHJveSgpXG4gICAgQG1hcmtzID0gbnVsbFxuXG4gIGlzVmFsaWQ6IChuYW1lKSAtPlxuICAgIE1BUktTLnRlc3QobmFtZSlcblxuICBnZXQ6IChuYW1lKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQGlzVmFsaWQobmFtZSlcbiAgICBwb2ludCA9IEBtYXJrc1tuYW1lXT8uZ2V0U3RhcnRCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgbmFtZSBpbiBcImAnXCJcbiAgICAgIHBvaW50ID8gUG9pbnQuWkVST1xuICAgIGVsc2VcbiAgICAgIHBvaW50XG5cbiAgIyBbRklYTUVdIE5lZWQgdG8gc3VwcG9ydCBHbG9iYWwgbWFyayB3aXRoIGNhcGl0YWwgbmFtZSBbQS1aXVxuICBzZXQ6IChuYW1lLCBwb2ludCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpc1ZhbGlkKG5hbWUpXG4gICAgaWYgbWFya2VyID0gQG1hcmtzW25hbWVdXG4gICAgICBtYXJrZXIuZGVzdHJveSgpXG4gICAgYnVmZmVyUG9zaXRpb24gPSBAZWRpdG9yLmNsaXBCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICBAbWFya3NbbmFtZV0gPSBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uLCBpbnZhbGlkYXRlOiAnbmV2ZXInKVxuICAgIEB2aW1TdGF0ZS5lbWl0dGVyLmVtaXQoJ2RpZC1zZXQtbWFyaycsIHtuYW1lLCBidWZmZXJQb3NpdGlvbiwgQGVkaXRvcn0pXG5cbm1vZHVsZS5leHBvcnRzID0gTWFya01hbmFnZXJcbiJdfQ==
