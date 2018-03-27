(function() {
  var GlobalVimState;

  module.exports = GlobalVimState = (function() {
    function GlobalVimState() {}

    GlobalVimState.prototype.registers = {};

    GlobalVimState.prototype.searchHistory = [];

    GlobalVimState.prototype.currentSearch = {};

    GlobalVimState.prototype.currentFind = null;

    return GlobalVimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlL2xpYi9nbG9iYWwtdmltLXN0YXRlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxjQUFBOztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtnQ0FDSjs7QUFBQSw2QkFBQSxTQUFBLEdBQVcsRUFBWCxDQUFBOztBQUFBLDZCQUNBLGFBQUEsR0FBZSxFQURmLENBQUE7O0FBQUEsNkJBRUEsYUFBQSxHQUFlLEVBRmYsQ0FBQTs7QUFBQSw2QkFHQSxXQUFBLEdBQWEsSUFIYixDQUFBOzswQkFBQTs7TUFGRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/mowens/.atom/packages/vim-mode/lib/global-vim-state.coffee
