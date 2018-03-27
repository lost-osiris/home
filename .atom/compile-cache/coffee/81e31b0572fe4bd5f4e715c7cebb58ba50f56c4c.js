(function() {
  var QuickSort;

  QuickSort = (function() {
    function QuickSort() {}

    QuickSort.prototype.sort = function(items) {
      var current, left, pivot, right;
      if (items.length <= 1) {
        return items;
      }
      pivot = items.shift();
      left = [];
      right = [];
      while (items.length > 0) {
        current = items.shift();
        if (current < pivot) {
          left.push(current);
        } else {
          right.push(current);
        }
      }
      return sort(left).concat(pivot).concat(sort(right));
    };

    QuickSort.prototype.noop = function() {};

    return QuickSort;

  })();

  exports.modules = quicksort;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9maXh0dXJlcy9zYW1wbGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBO0FBQUEsTUFBQTs7RUFBTTs7O3dCQUNKLElBQUEsR0FBTSxTQUFDLEtBQUQ7QUFDSixVQUFBO01BQUEsSUFBZ0IsS0FBSyxDQUFDLE1BQU4sSUFBZ0IsQ0FBaEM7QUFBQSxlQUFPLE1BQVA7O01BRUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxLQUFOLENBQUE7TUFDUixJQUFBLEdBQU87TUFDUCxLQUFBLEdBQVE7QUFJUixhQUFNLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBckI7UUFDRSxPQUFBLEdBQVUsS0FBSyxDQUFDLEtBQU4sQ0FBQTtRQUNWLElBQUcsT0FBQSxHQUFVLEtBQWI7VUFDRSxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFERjtTQUFBLE1BQUE7VUFHRSxLQUFLLENBQUMsSUFBTixDQUFXLE9BQVgsRUFIRjs7TUFGRjthQU9BLElBQUEsQ0FBSyxJQUFMLENBQVUsQ0FBQyxNQUFYLENBQWtCLEtBQWxCLENBQXdCLENBQUMsTUFBekIsQ0FBZ0MsSUFBQSxDQUFLLEtBQUwsQ0FBaEM7SUFoQkk7O3dCQWtCTixJQUFBLEdBQU0sU0FBQSxHQUFBOzs7Ozs7RUFHUixPQUFPLENBQUMsT0FBUixHQUFrQjtBQXRCbEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIFRoaXNcbiMgaXNcbiMgQ29tbWVudFxuXG4jIE9uZSBsaW5lIGNvbW1lbnRcblxuIyBDb21tZW50XG4jIGJvcmRlclxuY2xhc3MgUXVpY2tTb3J0XG4gIHNvcnQ6IChpdGVtcykgLT5cbiAgICByZXR1cm4gaXRlbXMgaWYgaXRlbXMubGVuZ3RoIDw9IDFcblxuICAgIHBpdm90ID0gaXRlbXMuc2hpZnQoKVxuICAgIGxlZnQgPSBbXVxuICAgIHJpZ2h0ID0gW11cblxuICAgICMgQ29tbWVudCBpbiB0aGUgbWlkZGxlXG5cbiAgICB3aGlsZSBpdGVtcy5sZW5ndGggPiAwXG4gICAgICBjdXJyZW50ID0gaXRlbXMuc2hpZnQoKVxuICAgICAgaWYgY3VycmVudCA8IHBpdm90XG4gICAgICAgIGxlZnQucHVzaChjdXJyZW50KVxuICAgICAgZWxzZVxuICAgICAgICByaWdodC5wdXNoKGN1cnJlbnQpXG5cbiAgICBzb3J0KGxlZnQpLmNvbmNhdChwaXZvdCkuY29uY2F0KHNvcnQocmlnaHQpKVxuXG4gIG5vb3A6IC0+XG4gICMganVzdCBhIG5vb3BcblxuZXhwb3J0cy5tb2R1bGVzID0gcXVpY2tzb3J0XG4iXX0=
