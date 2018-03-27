(function() {
  var CompositeDisposable, MARKS, MarkManager, Point, Range, ref,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point, CompositeDisposable = ref.CompositeDisposable;

  MARKS = /(?:[a-z]|[\[\]`'.^(){}<>])/;

  MarkManager = (function() {
    MarkManager.prototype.marks = null;

    function MarkManager(vimState) {
      var ref1;
      this.vimState = vimState;
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
      this.marks = {};
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
    }

    MarkManager.prototype.destroy = function() {
      var i, len, marker, name, ref1;
      ref1 = this.marks;
      for (marker = i = 0, len = ref1.length; i < len; marker = ++i) {
        name = ref1[marker];
        marker.destroy();
      }
      return this.subscriptions.dispose();
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

    MarkManager.prototype.getRange = function(startMark, endMark) {
      var end, start;
      start = this.get(startMark);
      end = this.get(endMark);
      if ((start != null) && (end != null)) {
        return new Range(start, end);
      }
    };

    MarkManager.prototype.setRange = function(startMark, endMark, range) {
      var end, ref1, start;
      ref1 = Range.fromObject(range), start = ref1.start, end = ref1.end;
      this.set(startMark, start);
      return this.set(endMark, end);
    };

    MarkManager.prototype.set = function(name, point) {
      var bufferPosition, event, marker;
      if (!this.isValid(name)) {
        return;
      }
      if (marker = this.marks[name]) {
        marker.destroy();
      }
      bufferPosition = this.editor.clipBufferPosition(point);
      this.marks[name] = this.editor.markBufferPosition(bufferPosition);
      event = {
        name: name,
        bufferPosition: bufferPosition,
        editor: this.editor
      };
      return this.vimState.emitter.emit('did-set-mark', event);
    };

    return MarkManager;

  })();

  module.exports = MarkManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21hcmstbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDBEQUFBO0lBQUE7O0VBQUEsTUFBc0MsT0FBQSxDQUFRLE1BQVIsQ0FBdEMsRUFBQyxpQkFBRCxFQUFRLGlCQUFSLEVBQWU7O0VBRWYsS0FBQSxHQUFROztFQUtGOzBCQUNKLEtBQUEsR0FBTzs7SUFFTSxxQkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQTtNQUNYLElBQUMsQ0FBQSxLQUFELEdBQVM7TUFFVCxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QixDQUFuQjtJQUxXOzswQkFPYixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7QUFBQTtBQUFBLFdBQUEsd0RBQUE7O1FBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBQTtBQUFBO2FBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFGTzs7MEJBSVQsT0FBQSxHQUFTLFNBQUMsSUFBRDthQUNQLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtJQURPOzswQkFHVCxHQUFBLEdBQUssU0FBQyxJQUFEO0FBQ0gsVUFBQTtNQUFBLElBQUEsQ0FBYyxJQUFDLENBQUEsT0FBRCxDQUFTLElBQVQsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsS0FBQSwyQ0FBb0IsQ0FBRSxzQkFBZCxDQUFBO01BQ1IsSUFBRyxhQUFRLElBQVIsRUFBQSxJQUFBLE1BQUg7K0JBQ0UsUUFBUSxLQUFLLENBQUMsS0FEaEI7T0FBQSxNQUFBO2VBR0UsTUFIRjs7SUFIRzs7MEJBU0wsUUFBQSxHQUFVLFNBQUMsU0FBRCxFQUFZLE9BQVo7QUFDUixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxHQUFELENBQUssU0FBTDtNQUNSLEdBQUEsR0FBTSxJQUFDLENBQUEsR0FBRCxDQUFLLE9BQUw7TUFDTixJQUFHLGVBQUEsSUFBVyxhQUFkO2VBQ00sSUFBQSxLQUFBLENBQU0sS0FBTixFQUFhLEdBQWIsRUFETjs7SUFIUTs7MEJBTVYsUUFBQSxHQUFVLFNBQUMsU0FBRCxFQUFZLE9BQVosRUFBcUIsS0FBckI7QUFDUixVQUFBO01BQUEsT0FBZSxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQixDQUFmLEVBQUMsa0JBQUQsRUFBUTtNQUNSLElBQUMsQ0FBQSxHQUFELENBQUssU0FBTCxFQUFnQixLQUFoQjthQUNBLElBQUMsQ0FBQSxHQUFELENBQUssT0FBTCxFQUFjLEdBQWQ7SUFIUTs7MEJBTVYsR0FBQSxHQUFLLFNBQUMsSUFBRCxFQUFPLEtBQVA7QUFDSCxVQUFBO01BQUEsSUFBQSxDQUFjLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxDQUFkO0FBQUEsZUFBQTs7TUFDQSxJQUFvQixNQUFBLEdBQVMsSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBLENBQXBDO1FBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxFQUFBOztNQUNBLGNBQUEsR0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUEyQixLQUEzQjtNQUNqQixJQUFDLENBQUEsS0FBTSxDQUFBLElBQUEsQ0FBUCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBMkIsY0FBM0I7TUFDZixLQUFBLEdBQVE7UUFBQyxNQUFBLElBQUQ7UUFBTyxnQkFBQSxjQUFQO1FBQXdCLFFBQUQsSUFBQyxDQUFBLE1BQXhCOzthQUNSLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLElBQWxCLENBQXVCLGNBQXZCLEVBQXVDLEtBQXZDO0lBTkc7Ozs7OztFQVFQLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBckRqQiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgUG9pbnQsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuTUFSS1MgPSAvLy8gKFxuICA/OiBbYS16XVxuICAgfCBbXFxbXFxdYCcuXigpe308Pl1cbikgLy8vXG5cbmNsYXNzIE1hcmtNYW5hZ2VyXG4gIG1hcmtzOiBudWxsXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuICAgIEBtYXJrcyA9IHt9XG5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcblxuICBkZXN0cm95OiAtPlxuICAgIG1hcmtlci5kZXN0cm95KCkgZm9yIG5hbWUsIG1hcmtlciBpbiBAbWFya3NcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICBpc1ZhbGlkOiAobmFtZSkgLT5cbiAgICBNQVJLUy50ZXN0KG5hbWUpXG5cbiAgZ2V0OiAobmFtZSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpc1ZhbGlkKG5hbWUpXG4gICAgcG9pbnQgPSBAbWFya3NbbmFtZV0/LmdldFN0YXJ0QnVmZmVyUG9zaXRpb24oKVxuICAgIGlmIG5hbWUgaW4gXCJgJ1wiXG4gICAgICBwb2ludCA/IFBvaW50LlpFUk9cbiAgICBlbHNlXG4gICAgICBwb2ludFxuXG4gICMgUmV0dXJuIHJhbmdlIGJldHdlZW4gbWFya3NcbiAgZ2V0UmFuZ2U6IChzdGFydE1hcmssIGVuZE1hcmspIC0+XG4gICAgc3RhcnQgPSBAZ2V0KHN0YXJ0TWFyaylcbiAgICBlbmQgPSBAZ2V0KGVuZE1hcmspXG4gICAgaWYgc3RhcnQ/IGFuZCBlbmQ/XG4gICAgICBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcblxuICBzZXRSYW5nZTogKHN0YXJ0TWFyaywgZW5kTWFyaywgcmFuZ2UpIC0+XG4gICAge3N0YXJ0LCBlbmR9ID0gUmFuZ2UuZnJvbU9iamVjdChyYW5nZSlcbiAgICBAc2V0KHN0YXJ0TWFyaywgc3RhcnQpXG4gICAgQHNldChlbmRNYXJrLCBlbmQpXG5cbiAgIyBbRklYTUVdIE5lZWQgdG8gc3VwcG9ydCBHbG9iYWwgbWFyayB3aXRoIGNhcGl0YWwgbmFtZSBbQS1aXVxuICBzZXQ6IChuYW1lLCBwb2ludCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpc1ZhbGlkKG5hbWUpXG4gICAgbWFya2VyLmRlc3Ryb3koKSBpZiBtYXJrZXIgPSBAbWFya3NbbmFtZV1cbiAgICBidWZmZXJQb3NpdGlvbiA9IEBlZGl0b3IuY2xpcEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIEBtYXJrc1tuYW1lXSA9IEBlZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuICAgIGV2ZW50ID0ge25hbWUsIGJ1ZmZlclBvc2l0aW9uLCBAZWRpdG9yfVxuICAgIEB2aW1TdGF0ZS5lbWl0dGVyLmVtaXQoJ2RpZC1zZXQtbWFyaycsIGV2ZW50KVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcmtNYW5hZ2VyXG4iXX0=
