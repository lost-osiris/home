(function() {
  var CompositeDisposable, JediProvider, cp, errorStatus, isWin,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  CompositeDisposable = require('atom').CompositeDisposable;

  cp = require('child_process');

  JediProvider = require('./jedi-python3-provider');

  isWin = /^win/.test(process.platform);

  errorStatus = false;

  module.exports = {
    subscriptions: null,
    config: {
      enablePython2: {
        description: 'Check to enable autocomplete for Python2 (AutoComplete for Python3 will be disabled)',
        type: 'boolean',
        "default": false
      },
      enablePathtopython: {
        description: 'Check to enable above Pathtopython field to work',
        type: 'boolean',
        "default": false
      },
      Pathtopython: {
        description: 'Python virtual environment path (eg:/home/user/py3pyenv/bin/python3 or home/user/py2virtualenv/bin/python)',
        type: 'string',
        "default": 'python3'
      }
    },
    provider: null,
    jediServer: null,
    activate: function() {
      var command, env, isPathtopython, isPy2, item, jedipy_filename, new_path_env, path_list, projectPath, spawn, _i, _len, _path_env;
      if (!this.jediServer) {
        projectPath = atom.project.getPaths();
        isPy2 = atom.config.get('python-jedi.enablePython2');
        isPathtopython = atom.config.get('python-jedi.enablePathtopython');
        env = process.env;
        if (isWin) {

        } else {
          _path_env = env.PATH.split(':');
          path_list = ['/usr/local/sbin', '/usr/local/bin', '/usr/sbin', '/usr/bin', '/sbin', '/bin'];
          for (_i = 0, _len = path_list.length; _i < _len; _i++) {
            item = path_list[_i];
            if (__indexOf.call(_path_env, item) < 0) {
              _path_env.push(item);
            }
          }
          new_path_env = _path_env.filter(function(p) {
            return p !== "";
          });
          env.PATH = new_path_env.join(":");
        }
        if (isPy2) {
          jedipy_filename = '/jedi-python2-complete.py';
          command = isPathtopython ? atom.config.get('python-jedi.Pathtopython') : "python";
        } else {
          jedipy_filename = '/jedi-python3-complete.py';
          command = isPathtopython ? atom.config.get('python-jedi.Pathtopython') : "python3";
        }
        spawn = cp.spawn;
        this.jediServer = spawn(command, [__dirname + jedipy_filename], {
          env: env
        });
        this.jediServer.on('error', function(err) {
          return console.log(err);
        });
      }
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
    serialize: function() {
      return this.provider.kill_Jedi(cp, isWin, this.jediServer);
    },
    deactivate: function() {
      errorStatus = this.provider.kill_Jedi(cp, isWin, this.jediServer);
      return this.jediServer = null;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3B5dGhvbi1qZWRpL2xpYi9qZWRpLXB5dGhvbjMtYXV0b2NvbXBsZXRlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5REFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLGVBQVIsQ0FGTCxDQUFBOztBQUFBLEVBR0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSx5QkFBUixDQUhmLENBQUE7O0FBQUEsRUFJQSxLQUFBLEdBQVEsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFPLENBQUMsUUFBcEIsQ0FKUixDQUFBOztBQUFBLEVBS0EsV0FBQSxHQUFjLEtBTGQsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBRUU7QUFBQSxJQUFBLGFBQUEsRUFBZSxJQUFmO0FBQUEsSUFFQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLGFBQUEsRUFDRTtBQUFBLFFBQUEsV0FBQSxFQUFhLHNGQUFiO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLFFBRUEsU0FBQSxFQUFTLEtBRlQ7T0FERjtBQUFBLE1BSUEsa0JBQUEsRUFDSTtBQUFBLFFBQUEsV0FBQSxFQUFhLGtEQUFiO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLFFBRUEsU0FBQSxFQUFTLEtBRlQ7T0FMSjtBQUFBLE1BUUEsWUFBQSxFQUNFO0FBQUEsUUFBQSxXQUFBLEVBQVksNEdBQVo7QUFBQSxRQUNBLElBQUEsRUFBTSxRQUROO0FBQUEsUUFFQSxTQUFBLEVBQVMsU0FGVDtPQVRGO0tBSEY7QUFBQSxJQWdCQSxRQUFBLEVBQVUsSUFoQlY7QUFBQSxJQWtCQSxVQUFBLEVBQVksSUFsQlo7QUFBQSxJQW9CQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ1IsVUFBQSw0SEFBQTtBQUFBLE1BQUEsSUFBRyxDQUFBLElBQUUsQ0FBQSxVQUFMO0FBQ0UsUUFBQSxXQUFBLEdBQWMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBZCxDQUFBO0FBQUEsUUFDQSxLQUFBLEdBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDJCQUFoQixDQURSLENBQUE7QUFBQSxRQUVBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdDQUFoQixDQUZqQixDQUFBO0FBQUEsUUFHQSxHQUFBLEdBQU0sT0FBTyxDQUFDLEdBSGQsQ0FBQTtBQUlBLFFBQUEsSUFBRyxLQUFIO0FBQUE7U0FBQSxNQUFBO0FBRUUsVUFBQSxTQUFBLEdBQWEsR0FBRyxDQUFDLElBQUssQ0FBQyxLQUFYLENBQWlCLEdBQWpCLENBQVosQ0FBQTtBQUFBLFVBQ0EsU0FBQSxHQUFXLENBQUMsaUJBQUQsRUFBbUIsZ0JBQW5CLEVBQW9DLFdBQXBDLEVBQWdELFVBQWhELEVBQTJELE9BQTNELEVBQW1FLE1BQW5FLENBRFgsQ0FBQTtBQUVBLGVBQUEsZ0RBQUE7aUNBQUE7Z0JBQStDLGVBQVksU0FBWixFQUFBLElBQUE7QUFBL0MsY0FBQSxTQUFTLENBQUMsSUFBVixDQUFlLElBQWYsQ0FBQTthQUFBO0FBQUEsV0FGQTtBQUFBLFVBR0EsWUFBQSxHQUFlLFNBQVMsQ0FBQyxNQUFWLENBQWlCLFNBQUMsQ0FBRCxHQUFBO21CQUFNLENBQUEsS0FBTyxHQUFiO1VBQUEsQ0FBakIsQ0FIZixDQUFBO0FBQUEsVUFJQSxHQUFHLENBQUMsSUFBSixHQUFXLFlBQVksQ0FBQyxJQUFiLENBQWtCLEdBQWxCLENBSlgsQ0FGRjtTQUpBO0FBWUEsUUFBQSxJQUFHLEtBQUg7QUFDRSxVQUFBLGVBQUEsR0FBa0IsMkJBQWxCLENBQUE7QUFBQSxVQUNBLE9BQUEsR0FBYSxjQUFILEdBQXVCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwwQkFBaEIsQ0FBdkIsR0FBd0UsUUFEbEYsQ0FERjtTQUFBLE1BQUE7QUFJRSxVQUFBLGVBQUEsR0FBa0IsMkJBQWxCLENBQUE7QUFBQSxVQUNBLE9BQUEsR0FBYSxjQUFILEdBQXVCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwwQkFBaEIsQ0FBdkIsR0FBd0UsU0FEbEYsQ0FKRjtTQVpBO0FBQUEsUUFtQkEsS0FBQSxHQUFRLEVBQUUsQ0FBQyxLQW5CWCxDQUFBO0FBQUEsUUFvQkEsSUFBQyxDQUFBLFVBQUQsR0FBYyxLQUFBLENBQU0sT0FBTixFQUFjLENBQUMsU0FBQSxHQUFZLGVBQWIsQ0FBZCxFQUE0QztBQUFBLFVBQUEsR0FBQSxFQUFLLEdBQUw7U0FBNUMsQ0FwQmQsQ0FBQTtBQUFBLFFBcUJBLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBWixDQUFlLE9BQWYsRUFBd0IsU0FBQyxHQUFELEdBQUE7aUJBQ3RCLE9BQU8sQ0FBQyxHQUFSLENBQVksR0FBWixFQURzQjtRQUFBLENBQXhCLENBckJBLENBREY7T0FBQTtBQUFBLE1BeUJBLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsWUFBQSxDQUFBLENBekJoQixDQUFBO0FBQUEsTUEwQkEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQTFCakIsQ0FBQTthQTJCQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUNqQjtBQUFBLFFBQUEsNENBQUEsRUFBOEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLGdCQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlDO09BRGlCLENBQW5CLEVBNUJRO0lBQUEsQ0FwQlY7QUFBQSxJQW1EQSxTQUFBLEVBQVcsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQW9CLEVBQXBCLEVBQXdCLEtBQXhCLEVBQStCLElBQUMsQ0FBQSxVQUFoQyxFQURRO0lBQUEsQ0FuRFg7QUFBQSxJQXNEQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1QsTUFBQSxXQUFBLEdBQWMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQW9CLEVBQXBCLEVBQXdCLEtBQXhCLEVBQStCLElBQUMsQ0FBQSxVQUFoQyxDQUFkLENBQUE7YUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBRkw7SUFBQSxDQXREWjtBQUFBLElBMERBLFdBQUEsRUFBYSxTQUFBLEdBQUE7QUFDWCxhQUFPO0FBQUEsUUFBQyxTQUFBLEVBQVcsQ0FBQyxJQUFDLENBQUEsUUFBRixDQUFaO09BQVAsQ0FEVztJQUFBLENBMURiO0FBQUEsSUE2REEsZ0JBQUEsRUFBa0IsU0FBQSxHQUFBO0FBQ2YsVUFBQSx3Q0FBQTtBQUFBLE1BQUEsSUFBRyxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVo7QUFDRSxRQUFBLEtBQUEsR0FBUyxNQUFNLENBQUMsUUFBUCxDQUFBLENBQWlCLENBQUMsS0FBbEIsQ0FBd0IsQ0FBQSxDQUF4QixDQUFULENBQUE7QUFDQSxRQUFBLElBQUcsS0FBQSxLQUFTLElBQVo7QUFDRSxVQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVQsQ0FBQTtBQUFBLFVBQ0EsR0FBQSxHQUFNLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQWdDLENBQUMsR0FBakMsR0FBdUMsQ0FEN0MsQ0FBQTtBQUFBLFVBRUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQWdDLENBQUMsTUFBakMsR0FBMEMsQ0FGbkQsQ0FBQTtBQUFBLFVBR0EsSUFBQSxHQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FIUCxDQUFBO2lCQUlBLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBVixDQUFtQixNQUFuQixFQUEyQixHQUEzQixFQUFnQyxNQUFoQyxFQUF3QyxJQUF4QyxFQUxGO1NBRkY7T0FEZTtJQUFBLENBN0RsQjtHQVRGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/mowens/.atom/packages/python-jedi/lib/jedi-python3-autocomplete.coffee
