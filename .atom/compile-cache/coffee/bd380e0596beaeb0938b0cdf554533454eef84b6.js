(function() {
  module.exports = {
    priority: 1,
    providerName: 'autocomplete-python',
    disableForSelector: '.source.python .comment, .source.python .string, .source.python .numeric, .source.python .integer, .source.python .decimal, .source.python .punctuation, .source.python .keyword, .source.python .storage, .source.python .variable.parameter, .source.python .entity.name',
    constructed: false,
    constructor: function() {
      this.provider = require('./provider');
      this.log = require('./log');
      this.selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;
      this.Selector = require('selector-kit').Selector;
      this.constructed = true;
      return this.log.debug('Loading python hyper-click provider...');
    },
    _getScopes: function(editor, range) {
      return editor.scopeDescriptorForBufferPosition(range).scopes;
    },
    getSuggestionForWord: function(editor, text, range) {
      var bufferPosition, callback, disableForSelector, scopeChain, scopeDescriptor;
      if (!this.constructed) {
        this.constructor();
      }
      if (text === '.' || text === ':') {
        return;
      }
      if (editor.getGrammar().scopeName.indexOf('source.python') > -1) {
        bufferPosition = range.start;
        scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
        scopeChain = scopeDescriptor.getScopeChain();
        disableForSelector = this.Selector.create(this.disableForSelector);
        if (this.selectorsMatchScopeChain(disableForSelector, scopeChain)) {
          return;
        }
        if (atom.config.get('autocomplete-python.outputDebug')) {
          this.log.debug(range.start, this._getScopes(editor, range.start));
          this.log.debug(range.end, this._getScopes(editor, range.end));
        }
        callback = (function(_this) {
          return function() {
            return _this.provider.goToDefinition(editor, bufferPosition);
          };
        })(this);
        return {
          range: range,
          callback: callback
        };
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL2h5cGVyY2xpY2stcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxDQUFWO0lBQ0EsWUFBQSxFQUFjLHFCQURkO0lBRUEsa0JBQUEsRUFBb0IsNFFBRnBCO0lBR0EsV0FBQSxFQUFhLEtBSGI7SUFLQSxXQUFBLEVBQWEsU0FBQTtNQUNYLElBQUMsQ0FBQSxRQUFELEdBQVksT0FBQSxDQUFRLFlBQVI7TUFDWixJQUFDLENBQUEsR0FBRCxHQUFPLE9BQUEsQ0FBUSxPQUFSO01BQ04sSUFBQyxDQUFBLDJCQUE0QixPQUFBLENBQVEsaUJBQVIsRUFBNUI7TUFDRCxJQUFDLENBQUEsV0FBWSxPQUFBLENBQVEsY0FBUixFQUFaO01BQ0YsSUFBQyxDQUFBLFdBQUQsR0FBZTthQUNmLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFXLHdDQUFYO0lBTlcsQ0FMYjtJQWFBLFVBQUEsRUFBWSxTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQ1YsYUFBTyxNQUFNLENBQUMsZ0NBQVAsQ0FBd0MsS0FBeEMsQ0FBOEMsQ0FBQztJQUQ1QyxDQWJaO0lBZ0JBLG9CQUFBLEVBQXNCLFNBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxLQUFmO0FBQ3BCLFVBQUE7TUFBQSxJQUFHLENBQUksSUFBQyxDQUFBLFdBQVI7UUFDRSxJQUFDLENBQUEsV0FBRCxDQUFBLEVBREY7O01BRUEsSUFBRyxJQUFBLEtBQVMsR0FBVCxJQUFBLElBQUEsS0FBYyxHQUFqQjtBQUNFLGVBREY7O01BRUEsSUFBRyxNQUFNLENBQUMsVUFBUCxDQUFBLENBQW1CLENBQUMsU0FBUyxDQUFDLE9BQTlCLENBQXNDLGVBQXRDLENBQUEsR0FBeUQsQ0FBQyxDQUE3RDtRQUNFLGNBQUEsR0FBaUIsS0FBSyxDQUFDO1FBQ3ZCLGVBQUEsR0FBa0IsTUFBTSxDQUFDLGdDQUFQLENBQ2hCLGNBRGdCO1FBRWxCLFVBQUEsR0FBYSxlQUFlLENBQUMsYUFBaEIsQ0FBQTtRQUNiLGtCQUFBLEdBQXFCLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixJQUFDLENBQUEsa0JBQWxCO1FBQ3JCLElBQUcsSUFBQyxDQUFBLHdCQUFELENBQTBCLGtCQUExQixFQUE4QyxVQUE5QyxDQUFIO0FBQ0UsaUJBREY7O1FBR0EsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCLENBQUg7VUFDRSxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUwsQ0FBVyxLQUFLLENBQUMsS0FBakIsRUFBd0IsSUFBQyxDQUFBLFVBQUQsQ0FBWSxNQUFaLEVBQW9CLEtBQUssQ0FBQyxLQUExQixDQUF4QjtVQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFXLEtBQUssQ0FBQyxHQUFqQixFQUFzQixJQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosRUFBb0IsS0FBSyxDQUFDLEdBQTFCLENBQXRCLEVBRkY7O1FBR0EsUUFBQSxHQUFXLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ1QsS0FBQyxDQUFBLFFBQVEsQ0FBQyxjQUFWLENBQXlCLE1BQXpCLEVBQWlDLGNBQWpDO1VBRFM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0FBRVgsZUFBTztVQUFDLE9BQUEsS0FBRDtVQUFRLFVBQUEsUUFBUjtVQWRUOztJQUxvQixDQWhCdEI7O0FBREYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gIHByaW9yaXR5OiAxXG4gIHByb3ZpZGVyTmFtZTogJ2F1dG9jb21wbGV0ZS1weXRob24nXG4gIGRpc2FibGVGb3JTZWxlY3RvcjogJy5zb3VyY2UucHl0aG9uIC5jb21tZW50LCAuc291cmNlLnB5dGhvbiAuc3RyaW5nLCAuc291cmNlLnB5dGhvbiAubnVtZXJpYywgLnNvdXJjZS5weXRob24gLmludGVnZXIsIC5zb3VyY2UucHl0aG9uIC5kZWNpbWFsLCAuc291cmNlLnB5dGhvbiAucHVuY3R1YXRpb24sIC5zb3VyY2UucHl0aG9uIC5rZXl3b3JkLCAuc291cmNlLnB5dGhvbiAuc3RvcmFnZSwgLnNvdXJjZS5weXRob24gLnZhcmlhYmxlLnBhcmFtZXRlciwgLnNvdXJjZS5weXRob24gLmVudGl0eS5uYW1lJ1xuICBjb25zdHJ1Y3RlZDogZmFsc2VcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAcHJvdmlkZXIgPSByZXF1aXJlICcuL3Byb3ZpZGVyJ1xuICAgIEBsb2cgPSByZXF1aXJlICcuL2xvZydcbiAgICB7QHNlbGVjdG9yc01hdGNoU2NvcGVDaGFpbn0gPSByZXF1aXJlICcuL3Njb3BlLWhlbHBlcnMnXG4gICAge0BTZWxlY3Rvcn0gPSByZXF1aXJlICdzZWxlY3Rvci1raXQnXG4gICAgQGNvbnN0cnVjdGVkID0gdHJ1ZVxuICAgIEBsb2cuZGVidWcgJ0xvYWRpbmcgcHl0aG9uIGh5cGVyLWNsaWNrIHByb3ZpZGVyLi4uJ1xuXG4gIF9nZXRTY29wZXM6IChlZGl0b3IsIHJhbmdlKSAtPlxuICAgIHJldHVybiBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24ocmFuZ2UpLnNjb3Blc1xuXG4gIGdldFN1Z2dlc3Rpb25Gb3JXb3JkOiAoZWRpdG9yLCB0ZXh0LCByYW5nZSkgLT5cbiAgICBpZiBub3QgQGNvbnN0cnVjdGVkXG4gICAgICBAY29uc3RydWN0b3IoKVxuICAgIGlmIHRleHQgaW4gWycuJywgJzonXVxuICAgICAgcmV0dXJuXG4gICAgaWYgZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUuaW5kZXhPZignc291cmNlLnB5dGhvbicpID4gLTFcbiAgICAgIGJ1ZmZlclBvc2l0aW9uID0gcmFuZ2Uuc3RhcnRcbiAgICAgIHNjb3BlRGVzY3JpcHRvciA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihcbiAgICAgICAgYnVmZmVyUG9zaXRpb24pXG4gICAgICBzY29wZUNoYWluID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3BlQ2hhaW4oKVxuICAgICAgZGlzYWJsZUZvclNlbGVjdG9yID0gQFNlbGVjdG9yLmNyZWF0ZShAZGlzYWJsZUZvclNlbGVjdG9yKVxuICAgICAgaWYgQHNlbGVjdG9yc01hdGNoU2NvcGVDaGFpbihkaXNhYmxlRm9yU2VsZWN0b3IsIHNjb3BlQ2hhaW4pXG4gICAgICAgIHJldHVyblxuXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24ub3V0cHV0RGVidWcnKVxuICAgICAgICBAbG9nLmRlYnVnIHJhbmdlLnN0YXJ0LCBAX2dldFNjb3BlcyhlZGl0b3IsIHJhbmdlLnN0YXJ0KVxuICAgICAgICBAbG9nLmRlYnVnIHJhbmdlLmVuZCwgQF9nZXRTY29wZXMoZWRpdG9yLCByYW5nZS5lbmQpXG4gICAgICBjYWxsYmFjayA9ID0+XG4gICAgICAgIEBwcm92aWRlci5nb1RvRGVmaW5pdGlvbihlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgcmV0dXJuIHtyYW5nZSwgY2FsbGJhY2t9XG4iXX0=
