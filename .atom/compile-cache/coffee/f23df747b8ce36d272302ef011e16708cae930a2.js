(function() {
  var SearchHistoryManager, _;

  _ = require('underscore-plus');

  module.exports = SearchHistoryManager = (function() {
    SearchHistoryManager.prototype.idx = null;

    function SearchHistoryManager(vimState) {
      this.vimState = vimState;
      this.globalState = this.vimState.globalState;
      this.idx = -1;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NlYXJjaC1oaXN0b3J5LW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVKLE1BQU0sQ0FBQyxPQUFQLEdBQ007bUNBQ0osR0FBQSxHQUFLOztJQUVRLDhCQUFDLFFBQUQ7TUFBQyxJQUFDLENBQUEsV0FBRDtNQUNYLElBQUMsQ0FBQSxjQUFlLElBQUMsQ0FBQSxTQUFoQjtNQUNGLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBQztJQUZHOzttQ0FJYixHQUFBLEdBQUssU0FBQyxTQUFEO0FBQ0gsVUFBQTtBQUFBLGNBQU8sU0FBUDtBQUFBLGFBQ08sTUFEUDtVQUNtQixJQUFpQixDQUFDLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBUixDQUFBLEtBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUEvQjtZQUFBLElBQUMsQ0FBQSxHQUFELElBQVEsRUFBUjs7QUFBWjtBQURQLGFBRU8sTUFGUDtVQUVtQixJQUFBLENBQWlCLENBQUMsSUFBQyxDQUFBLEdBQUQsS0FBUSxDQUFDLENBQVYsQ0FBakI7WUFBQSxJQUFDLENBQUEsR0FBRCxJQUFRLEVBQVI7O0FBRm5CO3FGQUcwQztJQUp2Qzs7bUNBTUwsSUFBQSxHQUFNLFNBQUMsS0FBRDtBQUNKLFVBQUE7TUFBQSxJQUFVLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBVixDQUFWO0FBQUEsZUFBQTs7TUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLGVBQWpCLENBQWlDLENBQUMsS0FBbEMsQ0FBQTtNQUNWLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEtBQWhCO01BQ0EsT0FBQSxHQUFVLENBQUMsQ0FBQyxJQUFGLENBQU8sT0FBUDtNQUNWLElBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFBLEdBQWEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQW9CLGFBQXBCLENBQWhCO1FBQ0UsT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBb0IsYUFBcEIsQ0FBZixFQURGOzthQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixlQUFqQixFQUFrQyxPQUFsQztJQVJJOzttQ0FVTixLQUFBLEdBQU8sU0FBQTthQUNMLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBQztJQURIOzttQ0FHUCxLQUFBLEdBQU8sU0FBQTthQUNMLElBQUMsQ0FBQSxXQUFXLENBQUMsS0FBYixDQUFtQixlQUFuQjtJQURLOzttQ0FHUCxPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixlQUFqQixDQUFpQyxDQUFDO0lBRDNCOzttQ0FHVCxPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxHQUFELEdBQU87SUFEQTs7Ozs7QUFuQ1giLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTZWFyY2hIaXN0b3J5TWFuYWdlclxuICBpZHg6IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGdsb2JhbFN0YXRlfSA9IEB2aW1TdGF0ZVxuICAgIEBpZHggPSAtMVxuXG4gIGdldDogKGRpcmVjdGlvbikgLT5cbiAgICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgICB3aGVuICdwcmV2JyB0aGVuIEBpZHggKz0gMSB1bmxlc3MgKEBpZHggKyAxKSBpcyBAZ2V0U2l6ZSgpXG4gICAgICB3aGVuICduZXh0JyB0aGVuIEBpZHggLT0gMSB1bmxlc3MgKEBpZHggaXMgLTEpXG4gICAgQGdsb2JhbFN0YXRlLmdldCgnc2VhcmNoSGlzdG9yeScpW0BpZHhdID8gJydcblxuICBzYXZlOiAoZW50cnkpIC0+XG4gICAgcmV0dXJuIGlmIF8uaXNFbXB0eShlbnRyeSlcblxuICAgIGVudHJpZXMgPSBAZ2xvYmFsU3RhdGUuZ2V0KCdzZWFyY2hIaXN0b3J5Jykuc2xpY2UoKVxuICAgIGVudHJpZXMudW5zaGlmdChlbnRyeSlcbiAgICBlbnRyaWVzID0gXy51bmlxKGVudHJpZXMpXG4gICAgaWYgQGdldFNpemUoKSA+IEB2aW1TdGF0ZS5nZXRDb25maWcoJ2hpc3RvcnlTaXplJylcbiAgICAgIGVudHJpZXMuc3BsaWNlKEB2aW1TdGF0ZS5nZXRDb25maWcoJ2hpc3RvcnlTaXplJykpXG4gICAgQGdsb2JhbFN0YXRlLnNldCgnc2VhcmNoSGlzdG9yeScsIGVudHJpZXMpXG5cbiAgcmVzZXQ6IC0+XG4gICAgQGlkeCA9IC0xXG5cbiAgY2xlYXI6IC0+XG4gICAgQGdsb2JhbFN0YXRlLnJlc2V0KCdzZWFyY2hIaXN0b3J5JylcblxuICBnZXRTaXplOiAtPlxuICAgIEBnbG9iYWxTdGF0ZS5nZXQoJ3NlYXJjaEhpc3RvcnknKS5sZW5ndGhcblxuICBkZXN0cm95OiAtPlxuICAgIEBpZHggPSBudWxsXG4iXX0=
