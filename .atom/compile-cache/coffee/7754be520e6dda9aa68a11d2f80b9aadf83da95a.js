(function() {
  var Emitter, GlobalState, getInitialState;

  Emitter = require('atom').Emitter;

  GlobalState = (function() {
    function GlobalState() {
      this.reset();
      this.emitter = new Emitter;
      this.onDidChange((function(_this) {
        return function(arg) {
          var name, newValue;
          name = arg.name, newValue = arg.newValue;
          if (name === 'lastSearchPattern') {
            return _this.set('highlightSearchPattern', newValue);
          }
        };
      })(this));
    }

    GlobalState.prototype.get = function(name) {
      return this.state[name];
    };

    GlobalState.prototype.set = function(name, newValue) {
      var oldValue;
      oldValue = this.get(name);
      this.state[name] = newValue;
      return this.emitDidChange({
        name: name,
        oldValue: oldValue,
        newValue: newValue
      });
    };

    GlobalState.prototype.onDidChange = function(fn) {
      return this.emitter.on('did-change', fn);
    };

    GlobalState.prototype.emitDidChange = function(event) {
      return this.emitter.emit('did-change', event);
    };

    GlobalState.prototype.reset = function(name) {
      var initialState;
      initialState = getInitialState();
      if (name != null) {
        return this.set(name, initialState[name]);
      } else {
        return this.state = initialState;
      }
    };

    return GlobalState;

  })();

  getInitialState = function() {
    return {
      searchHistory: [],
      currentSearch: null,
      lastSearchPattern: null,
      lastOccurrencePattern: null,
      lastOccurrenceType: null,
      highlightSearchPattern: null,
      currentFind: null,
      register: {},
      demoModeIsActive: false
    };
  };

  module.exports = new GlobalState();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2dsb2JhbC1zdGF0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLFVBQVcsT0FBQSxDQUFRLE1BQVI7O0VBRU47SUFDUyxxQkFBQTtNQUNYLElBQUMsQ0FBQSxLQUFELENBQUE7TUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFFZixJQUFDLENBQUEsV0FBRCxDQUFhLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBRVgsY0FBQTtVQUZhLGlCQUFNO1VBRW5CLElBQUcsSUFBQSxLQUFRLG1CQUFYO21CQUNFLEtBQUMsQ0FBQSxHQUFELENBQUssd0JBQUwsRUFBK0IsUUFBL0IsRUFERjs7UUFGVztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBYjtJQUpXOzswQkFTYixHQUFBLEdBQUssU0FBQyxJQUFEO2FBQ0gsSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBO0lBREo7OzBCQUdMLEdBQUEsR0FBSyxTQUFDLElBQUQsRUFBTyxRQUFQO0FBQ0gsVUFBQTtNQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsR0FBRCxDQUFLLElBQUw7TUFDWCxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUEsQ0FBUCxHQUFlO2FBQ2YsSUFBQyxDQUFBLGFBQUQsQ0FBZTtRQUFDLE1BQUEsSUFBRDtRQUFPLFVBQUEsUUFBUDtRQUFpQixVQUFBLFFBQWpCO09BQWY7SUFIRzs7MEJBS0wsV0FBQSxHQUFhLFNBQUMsRUFBRDthQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsRUFBMUI7SUFEVzs7MEJBR2IsYUFBQSxHQUFlLFNBQUMsS0FBRDthQUNiLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLFlBQWQsRUFBNEIsS0FBNUI7SUFEYTs7MEJBR2YsS0FBQSxHQUFPLFNBQUMsSUFBRDtBQUNMLFVBQUE7TUFBQSxZQUFBLEdBQWUsZUFBQSxDQUFBO01BQ2YsSUFBRyxZQUFIO2VBQ0UsSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFMLEVBQVcsWUFBYSxDQUFBLElBQUEsQ0FBeEIsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsS0FBRCxHQUFTLGFBSFg7O0lBRks7Ozs7OztFQU9ULGVBQUEsR0FBa0IsU0FBQTtXQUNoQjtNQUFBLGFBQUEsRUFBZSxFQUFmO01BQ0EsYUFBQSxFQUFlLElBRGY7TUFFQSxpQkFBQSxFQUFtQixJQUZuQjtNQUdBLHFCQUFBLEVBQXVCLElBSHZCO01BSUEsa0JBQUEsRUFBb0IsSUFKcEI7TUFLQSxzQkFBQSxFQUF3QixJQUx4QjtNQU1BLFdBQUEsRUFBYSxJQU5iO01BT0EsUUFBQSxFQUFVLEVBUFY7TUFRQSxnQkFBQSxFQUFrQixLQVJsQjs7RUFEZ0I7O0VBV2xCLE1BQU0sQ0FBQyxPQUFQLEdBQXFCLElBQUEsV0FBQSxDQUFBO0FBNUNyQiIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5cbmNsYXNzIEdsb2JhbFN0YXRlXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEByZXNldCgpXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAgQG9uRGlkQ2hhbmdlICh7bmFtZSwgbmV3VmFsdWV9KSA9PlxuICAgICAgIyBhdXRvIHN5bmMgdmFsdWUsIGJ1dCBoaWdobGlnaHRTZWFyY2hQYXR0ZXJuIGlzIHNvbGVseSBjbGVhcmVkIHRvIGNsZWFyIGhsc2VhcmNoLlxuICAgICAgaWYgbmFtZSBpcyAnbGFzdFNlYXJjaFBhdHRlcm4nXG4gICAgICAgIEBzZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBuZXdWYWx1ZSlcblxuICBnZXQ6IChuYW1lKSAtPlxuICAgIEBzdGF0ZVtuYW1lXVxuXG4gIHNldDogKG5hbWUsIG5ld1ZhbHVlKSAtPlxuICAgIG9sZFZhbHVlID0gQGdldChuYW1lKVxuICAgIEBzdGF0ZVtuYW1lXSA9IG5ld1ZhbHVlXG4gICAgQGVtaXREaWRDaGFuZ2Uoe25hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZX0pXG5cbiAgb25EaWRDaGFuZ2U6IChmbikgLT5cbiAgICBAZW1pdHRlci5vbignZGlkLWNoYW5nZScsIGZuKVxuXG4gIGVtaXREaWRDaGFuZ2U6IChldmVudCkgLT5cbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlJywgZXZlbnQpXG5cbiAgcmVzZXQ6IChuYW1lKSAtPlxuICAgIGluaXRpYWxTdGF0ZSA9IGdldEluaXRpYWxTdGF0ZSgpXG4gICAgaWYgbmFtZT9cbiAgICAgIEBzZXQobmFtZSwgaW5pdGlhbFN0YXRlW25hbWVdKVxuICAgIGVsc2VcbiAgICAgIEBzdGF0ZSA9IGluaXRpYWxTdGF0ZVxuXG5nZXRJbml0aWFsU3RhdGUgPSAtPlxuICBzZWFyY2hIaXN0b3J5OiBbXVxuICBjdXJyZW50U2VhcmNoOiBudWxsXG4gIGxhc3RTZWFyY2hQYXR0ZXJuOiBudWxsXG4gIGxhc3RPY2N1cnJlbmNlUGF0dGVybjogbnVsbFxuICBsYXN0T2NjdXJyZW5jZVR5cGU6IG51bGxcbiAgaGlnaGxpZ2h0U2VhcmNoUGF0dGVybjogbnVsbFxuICBjdXJyZW50RmluZDogbnVsbFxuICByZWdpc3Rlcjoge31cbiAgZGVtb01vZGVJc0FjdGl2ZTogZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgR2xvYmFsU3RhdGUoKVxuIl19
