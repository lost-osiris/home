(function() {
  var CompositeDisposable, JediProvider;

  CompositeDisposable = require('atom').CompositeDisposable;

  JediProvider = require('./jedi-python3-provider');

  module.exports = {
    subscriptions: null,
    config: {
      Pathtopython: {
        description: 'Python virtual environment path (eg:/home/user/py3pyenv/bin/python3 or home/user/py2virtualenv/bin/python)',
        type: 'string',
        "default": 'python3'
      }
    },
    provider: null,
    activate: function() {
      var isPathtopython;
      isPathtopython = atom.config.get('python-jedi.enablePathtopython');
      this.provider = new JediProvider();
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'jedi-python3-autocomplete:goto_definitions': (function(_this) {
          return function() {
            return _this.goto_definitions();
          };
        })(this)
      }));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    getProvider: function() {
      return {
        providers: [this.provider]
      };
    },
    goto_definitions: function() {
      var column, editor, path, row, source, title;
      if (editor = atom.workspace.getActiveTextEditor()) {
        title = editor.getTitle().slice(-2);
        if (title === 'py') {
          source = editor.getText();
          row = editor.getCursorBufferPosition().row + 1;
          column = editor.getCursorBufferPosition().column + 1;
          path = editor.getPath();
          return this.provider.goto_def(source, row, column, path);
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3B5dGhvbi1qZWRpL2xpYi9qZWRpLXB5dGhvbjMtYXV0b2NvbXBsZXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixZQUFBLEdBQWUsT0FBQSxDQUFRLHlCQUFSOztFQUVmLE1BQU0sQ0FBQyxPQUFQLEdBRUU7SUFBQSxhQUFBLEVBQWUsSUFBZjtJQUVBLE1BQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLFdBQUEsRUFBWSw0R0FBWjtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUZUO09BREY7S0FIRjtJQVFBLFFBQUEsRUFBVSxJQVJWO0lBVUEsUUFBQSxFQUFVLFNBQUE7QUFDUixVQUFBO01BQUEsY0FBQSxHQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCO01BQ2pCLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsWUFBQSxDQUFBO01BQ2hCLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7YUFDckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDakI7UUFBQSw0Q0FBQSxFQUE4QyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxnQkFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlDO09BRGlCLENBQW5CO0lBSlEsQ0FWVjtJQWlCQSxVQUFBLEVBQVksU0FBQTthQUNULElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO0lBRFMsQ0FqQlo7SUFvQkEsV0FBQSxFQUFhLFNBQUE7QUFDWCxhQUFPO1FBQUMsU0FBQSxFQUFXLENBQUMsSUFBQyxDQUFBLFFBQUYsQ0FBWjs7SUFESSxDQXBCYjtJQXVCQSxnQkFBQSxFQUFrQixTQUFBO0FBQ2YsVUFBQTtNQUFBLElBQUcsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFaO1FBQ0UsS0FBQSxHQUFTLE1BQU0sQ0FBQyxRQUFQLENBQUEsQ0FBaUIsQ0FBQyxLQUFsQixDQUF3QixDQUFDLENBQXpCO1FBQ1QsSUFBRyxLQUFBLEtBQVMsSUFBWjtVQUNFLE1BQUEsR0FBUyxNQUFNLENBQUMsT0FBUCxDQUFBO1VBQ1QsR0FBQSxHQUFNLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQWdDLENBQUMsR0FBakMsR0FBdUM7VUFDN0MsTUFBQSxHQUFTLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQWdDLENBQUMsTUFBakMsR0FBMEM7VUFDbkQsSUFBQSxHQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUE7aUJBQ1AsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLENBQW1CLE1BQW5CLEVBQTJCLEdBQTNCLEVBQWdDLE1BQWhDLEVBQXdDLElBQXhDLEVBTEY7U0FGRjs7SUFEZSxDQXZCbEI7O0FBTkYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5KZWRpUHJvdmlkZXIgPSByZXF1aXJlICcuL2plZGktcHl0aG9uMy1wcm92aWRlcidcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcbiAgIyBweXRob24tamVkaSBjb25maWcgc2NoZW1hXG4gIGNvbmZpZzpcbiAgICBQYXRodG9weXRob246XG4gICAgICBkZXNjcmlwdGlvbjonUHl0aG9uIHZpcnR1YWwgZW52aXJvbm1lbnQgcGF0aCAoZWc6L2hvbWUvdXNlci9weTNweWVudi9iaW4vcHl0aG9uMyBvciBob21lL3VzZXIvcHkydmlydHVhbGVudi9iaW4vcHl0aG9uKSdcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAncHl0aG9uMydcblxuICBwcm92aWRlcjogbnVsbFxuXG4gIGFjdGl2YXRlOiAtPlxuICAgIGlzUGF0aHRvcHl0aG9uID0gYXRvbS5jb25maWcuZ2V0KCdweXRob24tamVkaS5lbmFibGVQYXRodG9weXRob24nKVxuICAgIEBwcm92aWRlciA9IG5ldyBKZWRpUHJvdmlkZXIoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdqZWRpLXB5dGhvbjMtYXV0b2NvbXBsZXRlOmdvdG9fZGVmaW5pdGlvbnMnOiA9PiBAZ290b19kZWZpbml0aW9ucygpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgZ2V0UHJvdmlkZXI6IC0+XG4gICAgcmV0dXJuIHtwcm92aWRlcnM6IFtAcHJvdmlkZXJdfVxuXG4gIGdvdG9fZGVmaW5pdGlvbnM6IC0+XG4gICAgIGlmIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgIHRpdGxlID0gIGVkaXRvci5nZXRUaXRsZSgpLnNsaWNlKC0yKVxuICAgICAgIGlmIHRpdGxlID09ICdweSdcbiAgICAgICAgIHNvdXJjZSA9IGVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgIHJvdyA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdyArIDFcbiAgICAgICAgIGNvbHVtbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLmNvbHVtbiArIDFcbiAgICAgICAgIHBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgICBAcHJvdmlkZXIuZ290b19kZWYoc291cmNlLCByb3csIGNvbHVtbiwgcGF0aClcbiJdfQ==
