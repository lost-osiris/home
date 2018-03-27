(function() {
  var Selector, log, provider, selectorsMatchScopeChain;

  provider = require('./provider');

  log = require('./log');

  selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;

  Selector = require('selector-kit').Selector;

  module.exports = {
    priority: 1,
    providerName: 'autocomplete-python',
    disableForSelector: "" + provider.disableForSelector + ", .source.python .numeric, .source.python .integer, .source.python .decimal, .source.python .punctuation, .source.python .keyword, .source.python .storage, .source.python .variable.parameter, .source.python .entity.name",
    _getScopes: function(editor, range) {
      return editor.scopeDescriptorForBufferPosition(range).scopes;
    },
    getSuggestionForWord: function(editor, text, range) {
      var bufferPosition, callback, disableForSelector, scopeChain, scopeDescriptor;
      if (text === '.' || text === ':') {
        return;
      }
      if (editor.getGrammar().scopeName === 'source.python') {
        bufferPosition = range.start;
        scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
        scopeChain = scopeDescriptor.getScopeChain();
        disableForSelector = Selector.create(this.disableForSelector);
        if (selectorsMatchScopeChain(disableForSelector, scopeChain)) {
          return;
        }
        if (atom.config.get('autocomplete-python.outputDebug')) {
          log.debug(range.start, this._getScopes(editor, range.start));
          log.debug(range.end, this._getScopes(editor, range.end));
        }
        callback = function() {
          return provider.goToDefinition(editor, bufferPosition);
        };
        return {
          range: range,
          callback: callback
        };
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL2h5cGVyY2xpY2stcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlEQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBQVgsQ0FBQTs7QUFBQSxFQUNBLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUixDQUROLENBQUE7O0FBQUEsRUFFQywyQkFBNEIsT0FBQSxDQUFRLGlCQUFSLEVBQTVCLHdCQUZELENBQUE7O0FBQUEsRUFHQyxXQUFZLE9BQUEsQ0FBUSxjQUFSLEVBQVosUUFIRCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLENBQVY7QUFBQSxJQUVBLFlBQUEsRUFBYyxxQkFGZDtBQUFBLElBSUEsa0JBQUEsRUFBb0IsRUFBQSxHQUFHLFFBQVEsQ0FBQyxrQkFBWixHQUErQiw2TkFKbkQ7QUFBQSxJQU1BLFVBQUEsRUFBWSxTQUFDLE1BQUQsRUFBUyxLQUFULEdBQUE7QUFDVixhQUFPLE1BQU0sQ0FBQyxnQ0FBUCxDQUF3QyxLQUF4QyxDQUE4QyxDQUFDLE1BQXRELENBRFU7SUFBQSxDQU5aO0FBQUEsSUFTQSxvQkFBQSxFQUFzQixTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsS0FBZixHQUFBO0FBQ3BCLFVBQUEseUVBQUE7QUFBQSxNQUFBLElBQUcsSUFBQSxLQUFTLEdBQVQsSUFBQSxJQUFBLEtBQWMsR0FBakI7QUFDRSxjQUFBLENBREY7T0FBQTtBQUVBLE1BQUEsSUFBRyxNQUFNLENBQUMsVUFBUCxDQUFBLENBQW1CLENBQUMsU0FBcEIsS0FBaUMsZUFBcEM7QUFDRSxRQUFBLGNBQUEsR0FBaUIsS0FBSyxDQUFDLEtBQXZCLENBQUE7QUFBQSxRQUNBLGVBQUEsR0FBa0IsTUFBTSxDQUFDLGdDQUFQLENBQ2hCLGNBRGdCLENBRGxCLENBQUE7QUFBQSxRQUdBLFVBQUEsR0FBYSxlQUFlLENBQUMsYUFBaEIsQ0FBQSxDQUhiLENBQUE7QUFBQSxRQUlBLGtCQUFBLEdBQXFCLFFBQVEsQ0FBQyxNQUFULENBQWdCLElBQUMsQ0FBQSxrQkFBakIsQ0FKckIsQ0FBQTtBQUtBLFFBQUEsSUFBRyx3QkFBQSxDQUF5QixrQkFBekIsRUFBNkMsVUFBN0MsQ0FBSDtBQUNFLGdCQUFBLENBREY7U0FMQTtBQVFBLFFBQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCLENBQUg7QUFDRSxVQUFBLEdBQUcsQ0FBQyxLQUFKLENBQVUsS0FBSyxDQUFDLEtBQWhCLEVBQXVCLElBQUMsQ0FBQSxVQUFELENBQVksTUFBWixFQUFvQixLQUFLLENBQUMsS0FBMUIsQ0FBdkIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxHQUFHLENBQUMsS0FBSixDQUFVLEtBQUssQ0FBQyxHQUFoQixFQUFxQixJQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosRUFBb0IsS0FBSyxDQUFDLEdBQTFCLENBQXJCLENBREEsQ0FERjtTQVJBO0FBQUEsUUFXQSxRQUFBLEdBQVcsU0FBQSxHQUFBO2lCQUNULFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCLEVBQWdDLGNBQWhDLEVBRFM7UUFBQSxDQVhYLENBQUE7QUFhQSxlQUFPO0FBQUEsVUFBQyxPQUFBLEtBQUQ7QUFBQSxVQUFRLFVBQUEsUUFBUjtTQUFQLENBZEY7T0FIb0I7SUFBQSxDQVR0QjtHQU5GLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/mowens/.atom/packages/autocomplete-python/lib/hyperclick-provider.coffee
