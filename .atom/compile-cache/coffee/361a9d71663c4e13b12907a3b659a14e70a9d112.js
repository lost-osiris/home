(function() {
  var SearchHistoryManager, _,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  module.exports = SearchHistoryManager = (function() {
    SearchHistoryManager.prototype.idx = null;

    function SearchHistoryManager(vimState) {
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      this.globalState = this.vimState.globalState;
      this.idx = -1;
      this.vimState.onDidDestroy(this.destroy);
    }

    SearchHistoryManager.prototype.get = function(direction) {
      var ref;
      switch (direction) {
        case 'prev':
          if ((this.idx + 1) !== this.getSize()) {
            this.idx += 1;
          }
          break;
        case 'next':
          if (!(this.idx === -1)) {
            this.idx -= 1;
          }
      }
      return (ref = this.globalState.get('searchHistory')[this.idx]) != null ? ref : '';
    };

    SearchHistoryManager.prototype.save = function(entry) {
      var entries;
      if (_.isEmpty(entry)) {
        return;
      }
      entries = this.globalState.get('searchHistory').slice();
      entries.unshift(entry);
      entries = _.uniq(entries);
      if (this.getSize() > this.vimState.getConfig('historySize')) {
        entries.splice(this.vimState.getConfig('historySize'));
      }
      return this.globalState.set('searchHistory', entries);
    };

    SearchHistoryManager.prototype.reset = function() {
      return this.idx = -1;
    };

    SearchHistoryManager.prototype.clear = function() {
      return this.globalState.reset('searchHistory');
    };

    SearchHistoryManager.prototype.getSize = function() {
      return this.globalState.get('searchHistory').length;
    };

    SearchHistoryManager.prototype.destroy = function() {
      return this.idx = null;
    };

    return SearchHistoryManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NlYXJjaC1oaXN0b3J5LW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1QkFBQTtJQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosTUFBTSxDQUFDLE9BQVAsR0FDTTttQ0FDSixHQUFBLEdBQUs7O0lBRVEsOEJBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxXQUFEOztNQUNYLElBQUMsQ0FBQSxjQUFlLElBQUMsQ0FBQSxTQUFoQjtNQUNGLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBQztNQUNSLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBeEI7SUFIVzs7bUNBS2IsR0FBQSxHQUFLLFNBQUMsU0FBRDtBQUNILFVBQUE7QUFBQSxjQUFPLFNBQVA7QUFBQSxhQUNPLE1BRFA7VUFDbUIsSUFBaUIsQ0FBQyxJQUFDLENBQUEsR0FBRCxHQUFPLENBQVIsQ0FBQSxLQUFjLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBL0I7WUFBQSxJQUFDLENBQUEsR0FBRCxJQUFRLEVBQVI7O0FBQVo7QUFEUCxhQUVPLE1BRlA7VUFFbUIsSUFBQSxDQUFpQixDQUFDLElBQUMsQ0FBQSxHQUFELEtBQVEsQ0FBQyxDQUFWLENBQWpCO1lBQUEsSUFBQyxDQUFBLEdBQUQsSUFBUSxFQUFSOztBQUZuQjtxRkFHMEM7SUFKdkM7O21DQU1MLElBQUEsR0FBTSxTQUFDLEtBQUQ7QUFDSixVQUFBO01BQUEsSUFBVSxDQUFDLENBQUMsT0FBRixDQUFVLEtBQVYsQ0FBVjtBQUFBLGVBQUE7O01BRUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixlQUFqQixDQUFpQyxDQUFDLEtBQWxDLENBQUE7TUFDVixPQUFPLENBQUMsT0FBUixDQUFnQixLQUFoQjtNQUNBLE9BQUEsR0FBVSxDQUFDLENBQUMsSUFBRixDQUFPLE9BQVA7TUFDVixJQUFHLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBQSxHQUFhLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFvQixhQUFwQixDQUFoQjtRQUNFLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQW9CLGFBQXBCLENBQWYsRUFERjs7YUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsZUFBakIsRUFBa0MsT0FBbEM7SUFSSTs7bUNBVU4sS0FBQSxHQUFPLFNBQUE7YUFDTCxJQUFDLENBQUEsR0FBRCxHQUFPLENBQUM7SUFESDs7bUNBR1AsS0FBQSxHQUFPLFNBQUE7YUFDTCxJQUFDLENBQUEsV0FBVyxDQUFDLEtBQWIsQ0FBbUIsZUFBbkI7SUFESzs7bUNBR1AsT0FBQSxHQUFTLFNBQUE7YUFDUCxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsZUFBakIsQ0FBaUMsQ0FBQztJQUQzQjs7bUNBR1QsT0FBQSxHQUFTLFNBQUE7YUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPO0lBREE7Ozs7O0FBcENYIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU2VhcmNoSGlzdG9yeU1hbmFnZXJcbiAgaWR4OiBudWxsXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BnbG9iYWxTdGF0ZX0gPSBAdmltU3RhdGVcbiAgICBAaWR4ID0gLTFcbiAgICBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95KVxuXG4gIGdldDogKGRpcmVjdGlvbikgLT5cbiAgICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgICB3aGVuICdwcmV2JyB0aGVuIEBpZHggKz0gMSB1bmxlc3MgKEBpZHggKyAxKSBpcyBAZ2V0U2l6ZSgpXG4gICAgICB3aGVuICduZXh0JyB0aGVuIEBpZHggLT0gMSB1bmxlc3MgKEBpZHggaXMgLTEpXG4gICAgQGdsb2JhbFN0YXRlLmdldCgnc2VhcmNoSGlzdG9yeScpW0BpZHhdID8gJydcblxuICBzYXZlOiAoZW50cnkpIC0+XG4gICAgcmV0dXJuIGlmIF8uaXNFbXB0eShlbnRyeSlcblxuICAgIGVudHJpZXMgPSBAZ2xvYmFsU3RhdGUuZ2V0KCdzZWFyY2hIaXN0b3J5Jykuc2xpY2UoKVxuICAgIGVudHJpZXMudW5zaGlmdChlbnRyeSlcbiAgICBlbnRyaWVzID0gXy51bmlxKGVudHJpZXMpXG4gICAgaWYgQGdldFNpemUoKSA+IEB2aW1TdGF0ZS5nZXRDb25maWcoJ2hpc3RvcnlTaXplJylcbiAgICAgIGVudHJpZXMuc3BsaWNlKEB2aW1TdGF0ZS5nZXRDb25maWcoJ2hpc3RvcnlTaXplJykpXG4gICAgQGdsb2JhbFN0YXRlLnNldCgnc2VhcmNoSGlzdG9yeScsIGVudHJpZXMpXG5cbiAgcmVzZXQ6IC0+XG4gICAgQGlkeCA9IC0xXG5cbiAgY2xlYXI6IC0+XG4gICAgQGdsb2JhbFN0YXRlLnJlc2V0KCdzZWFyY2hIaXN0b3J5JylcblxuICBnZXRTaXplOiAtPlxuICAgIEBnbG9iYWxTdGF0ZS5nZXQoJ3NlYXJjaEhpc3RvcnknKS5sZW5ndGhcblxuICBkZXN0cm95OiA9PlxuICAgIEBpZHggPSBudWxsXG4iXX0=
