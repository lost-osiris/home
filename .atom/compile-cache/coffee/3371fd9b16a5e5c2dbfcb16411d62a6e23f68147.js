(function() {
  var __slice = [].slice;

  module.exports = {
    prefix: 'autocomplete-python:',
    debug: function() {
      var msg;
      msg = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (atom.config.get('autocomplete-python.outputDebug')) {
        return console.debug.apply(console, [this.prefix].concat(__slice.call(msg)));
      }
    },
    warning: function() {
      var msg;
      msg = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return console.warn.apply(console, [this.prefix].concat(__slice.call(msg)));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL2xvZy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0JBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQVEsc0JBQVI7QUFBQSxJQUNBLEtBQUEsRUFBTyxTQUFBLEdBQUE7QUFDTCxVQUFBLEdBQUE7QUFBQSxNQURNLDZEQUNOLENBQUE7QUFBQSxNQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQixDQUFIO0FBQ0UsZUFBTyxPQUFPLENBQUMsS0FBUixnQkFBYyxDQUFBLElBQUMsQ0FBQSxNQUFRLFNBQUEsYUFBQSxHQUFBLENBQUEsQ0FBdkIsQ0FBUCxDQURGO09BREs7SUFBQSxDQURQO0FBQUEsSUFLQSxPQUFBLEVBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSxHQUFBO0FBQUEsTUFEUSw2REFDUixDQUFBO0FBQUEsYUFBTyxPQUFPLENBQUMsSUFBUixnQkFBYSxDQUFBLElBQUMsQ0FBQSxNQUFRLFNBQUEsYUFBQSxHQUFBLENBQUEsQ0FBdEIsQ0FBUCxDQURPO0lBQUEsQ0FMVDtHQURGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/mowens/.atom/packages/autocomplete-python/lib/log.coffee
