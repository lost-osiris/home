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
      register: {}
    };
  };

  module.exports = new GlobalState();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2dsb2JhbC1zdGF0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLFVBQVcsT0FBQSxDQUFRLE1BQVI7O0VBRU47SUFDUyxxQkFBQTtNQUNYLElBQUMsQ0FBQSxLQUFELENBQUE7TUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFFZixJQUFDLENBQUEsV0FBRCxDQUFhLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBRVgsY0FBQTtVQUZhLGlCQUFNO1VBRW5CLElBQUcsSUFBQSxLQUFRLG1CQUFYO21CQUNFLEtBQUMsQ0FBQSxHQUFELENBQUssd0JBQUwsRUFBK0IsUUFBL0IsRUFERjs7UUFGVztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBYjtJQUpXOzswQkFTYixHQUFBLEdBQUssU0FBQyxJQUFEO2FBQ0gsSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBO0lBREo7OzBCQUdMLEdBQUEsR0FBSyxTQUFDLElBQUQsRUFBTyxRQUFQO0FBQ0gsVUFBQTtNQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsR0FBRCxDQUFLLElBQUw7TUFDWCxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUEsQ0FBUCxHQUFlO2FBQ2YsSUFBQyxDQUFBLGFBQUQsQ0FBZTtRQUFDLE1BQUEsSUFBRDtRQUFPLFVBQUEsUUFBUDtRQUFpQixVQUFBLFFBQWpCO09BQWY7SUFIRzs7MEJBS0wsV0FBQSxHQUFhLFNBQUMsRUFBRDthQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsRUFBMUI7SUFEVzs7MEJBR2IsYUFBQSxHQUFlLFNBQUMsS0FBRDthQUNiLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLFlBQWQsRUFBNEIsS0FBNUI7SUFEYTs7MEJBR2YsS0FBQSxHQUFPLFNBQUMsSUFBRDtBQUNMLFVBQUE7TUFBQSxZQUFBLEdBQWUsZUFBQSxDQUFBO01BQ2YsSUFBRyxZQUFIO2VBQ0UsSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFMLEVBQVcsWUFBYSxDQUFBLElBQUEsQ0FBeEIsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsS0FBRCxHQUFTLGFBSFg7O0lBRks7Ozs7OztFQU9ULGVBQUEsR0FBa0IsU0FBQTtXQUNoQjtNQUFBLGFBQUEsRUFBZSxFQUFmO01BQ0EsYUFBQSxFQUFlLElBRGY7TUFFQSxpQkFBQSxFQUFtQixJQUZuQjtNQUdBLHFCQUFBLEVBQXVCLElBSHZCO01BSUEsa0JBQUEsRUFBb0IsSUFKcEI7TUFLQSxzQkFBQSxFQUF3QixJQUx4QjtNQU1BLFdBQUEsRUFBYSxJQU5iO01BT0EsUUFBQSxFQUFVLEVBUFY7O0VBRGdCOztFQVVsQixNQUFNLENBQUMsT0FBUCxHQUFxQixJQUFBLFdBQUEsQ0FBQTtBQTNDckIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RW1pdHRlcn0gPSByZXF1aXJlICdhdG9tJ1xuXG5jbGFzcyBHbG9iYWxTdGF0ZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAcmVzZXQoKVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIEBvbkRpZENoYW5nZSAoe25hbWUsIG5ld1ZhbHVlfSkgPT5cbiAgICAgICMgYXV0byBzeW5jIHZhbHVlLCBidXQgaGlnaGxpZ2h0U2VhcmNoUGF0dGVybiBpcyBzb2xlbHkgY2xlYXJlZCB0byBjbGVhciBobHNlYXJjaC5cbiAgICAgIGlmIG5hbWUgaXMgJ2xhc3RTZWFyY2hQYXR0ZXJuJ1xuICAgICAgICBAc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbmV3VmFsdWUpXG5cbiAgZ2V0OiAobmFtZSkgLT5cbiAgICBAc3RhdGVbbmFtZV1cblxuICBzZXQ6IChuYW1lLCBuZXdWYWx1ZSkgLT5cbiAgICBvbGRWYWx1ZSA9IEBnZXQobmFtZSlcbiAgICBAc3RhdGVbbmFtZV0gPSBuZXdWYWx1ZVxuICAgIEBlbWl0RGlkQ2hhbmdlKHtuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWV9KVxuXG4gIG9uRGlkQ2hhbmdlOiAoZm4pIC0+XG4gICAgQGVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UnLCBmbilcblxuICBlbWl0RGlkQ2hhbmdlOiAoZXZlbnQpIC0+XG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZScsIGV2ZW50KVxuXG4gIHJlc2V0OiAobmFtZSkgLT5cbiAgICBpbml0aWFsU3RhdGUgPSBnZXRJbml0aWFsU3RhdGUoKVxuICAgIGlmIG5hbWU/XG4gICAgICBAc2V0KG5hbWUsIGluaXRpYWxTdGF0ZVtuYW1lXSlcbiAgICBlbHNlXG4gICAgICBAc3RhdGUgPSBpbml0aWFsU3RhdGVcblxuZ2V0SW5pdGlhbFN0YXRlID0gLT5cbiAgc2VhcmNoSGlzdG9yeTogW11cbiAgY3VycmVudFNlYXJjaDogbnVsbFxuICBsYXN0U2VhcmNoUGF0dGVybjogbnVsbFxuICBsYXN0T2NjdXJyZW5jZVBhdHRlcm46IG51bGxcbiAgbGFzdE9jY3VycmVuY2VUeXBlOiBudWxsXG4gIGhpZ2hsaWdodFNlYXJjaFBhdHRlcm46IG51bGxcbiAgY3VycmVudEZpbmQ6IG51bGxcbiAgcmVnaXN0ZXI6IHt9XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IEdsb2JhbFN0YXRlKClcbiJdfQ==
