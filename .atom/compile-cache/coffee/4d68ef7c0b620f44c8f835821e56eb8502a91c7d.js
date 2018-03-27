(function() {
  var $, JediProvider, errorStatus, resetJedi;

  $ = require('atom-space-pen-views').$;

  errorStatus = false;

  resetJedi = function(newValue) {
    var error;
    try {
      atom.packages.disablePackage('python-jedi');
    } catch (_error) {
      error = _error;
      console.log(error);
    }
    return atom.packages.enablePackage('python-jedi');
  };

  module.exports = JediProvider = (function() {
    JediProvider.prototype.id = 'python-jedi';

    JediProvider.prototype.selector = '.source.python';

    JediProvider.prototype.providerblacklist = null;

    function JediProvider() {
      this.providerblacklist = {
        'autocomplete-plus-fuzzyprovider': '.source.python',
        'autocomplete-plus-symbolprovider': '.source.python'
      };
    }

    JediProvider.prototype.kill_Jedi = function(cp, isWin, jediServer) {
      var error, win_Command;
      this.jediServer = jediServer;
      if (!isWin) {
        try {
          this.jediServer.kill();
        } catch (_error) {
          error = _error;
          errorStatus = true;
        }
      } else {
        try {
          win_Command = 'taskkill /F /PID ' + this.jediServer.pid;
          cp.exec(win_Command);
        } catch (_error) {
          error = _error;
          errorStatus = true;
        }
      }
      return errorStatus;
    };

    JediProvider.prototype.goto_def = function(source, row, column, path) {
      var payload;
      payload = {
        source: source,
        line: row,
        column: column,
        path: path,
        type: "goto"
      };
      return $.ajax({
        url: 'http://127.0.0.1:7777',
        type: 'POST',
        data: JSON.stringify(payload),
        success: function(data) {
          var key, value, _results;
          _results = [];
          for (key in data) {
            value = data[key];
            if (value['module_path'] !== null && value['line'] !== null) {
              _results.push(atom.workspace.open(value['module_path'], {
                'initialLine': value['line'] - 1,
                'searchAllPanes': true
              }));
            } else if (value['is_built_in'] && (value['type'] = "module" || "class" || "function")) {
              _results.push(atom.notifications.addInfo("Built In " + value['type'], {
                dismissable: true,
                'detail': "Description: " + value['description'] + ".\nThis is a builtin " + value['type'] + ". Doesn't have module path"
              }));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        },
        error: function(jqXHR, textStatus, errorThrown) {
          return console.log(textStatus, errorThrown);
        }
      });
    };

    JediProvider.prototype.requestHandler = function(options) {
      return new Promise(function(resolve) {
        var bufferPosition, column, hash, line, path, payload, prefix, prefixRegex, row, suggestions, text, tripleQuotes, _ref;
        suggestions = [];
        bufferPosition = options.cursor.getBufferPosition();
        text = options.editor.getText();
        row = options.cursor.getBufferPosition().row;
        column = options.cursor.getBufferPosition().column;
        path = options.editor.getPath();
        if (column === 0) {
          resolve(suggestions);
        }
        payload = {
          source: text,
          line: row,
          column: column,
          path: path,
          type: 'autocomplete'
        };
        prefixRegex = /\b((\w+[\w-]*)|([.:;[{(< ]+))$/g;
        prefix = ((_ref = options.prefix.match(prefixRegex)) != null ? _ref[0] : void 0) || '';
        if (prefix === " ") {
          prefix = prefix.replace(/\s/g, '');
        }
        tripleQuotes = /(\'\'\')/g.test(options.cursor.getCurrentWordPrefix());
        line = options.editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
        hash = line.search(/(\#)/g);
        if (hash < 0 && !tripleQuotes) {
          return $.ajax({
            url: 'http://127.0.0.1:7777',
            type: 'POST',
            data: JSON.stringify(payload),
            success: function(data) {
              var index, label, type;
              if (data.length !== 0) {
                for (index in data) {
                  label = data[index].description;
                  type = data[index].type;
                  if (label.length > 80) {
                    label = label.substr(0, 80);
                  }
                  suggestions.push({
                    text: data[index].name,
                    replacementPrefix: prefix,
                    label: label,
                    type: type
                  });
                }
              }
              return resolve(suggestions);
            },
            error: function(jqXHR, textStatus, errorThrown) {
              return console.log(textStatus, errorThrown);
            }
          });
        } else {
          suggestions = [];
          return resolve(suggestions);
        }
      });
    };

    JediProvider.prototype.error = function(data) {
      console.log("Error communicating with server");
      return console.log(data);
    };

    return JediProvider;

  })();

  atom.config.onDidChange('python-jedi.Pathtopython', function(newValue, oldValue) {
    var isPathtopython;
    isPathtopython = atom.config.get('python-jedi.enablePathtopython');
    if (isPathtopython) {
      atom.config.set('python-jedi.Pathtopython', newValue);
      return resetJedi(newValue);
    }
  });

  atom.config.onDidChange('python-jedi.enablePython2', function(_arg) {
    var newValue, oldValue;
    newValue = _arg.newValue, oldValue = _arg.oldValue;
    return resetJedi(newValue);
  });

  atom.config.onDidChange('python-jedi.enablePathtopython', function(_arg) {
    var newValue, oldValue;
    newValue = _arg.newValue, oldValue = _arg.oldValue;
    return resetJedi(newValue);
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3B5dGhvbi1qZWRpL2xpYi9qZWRpLXB5dGhvbjMtcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBOztBQUFBLEVBQUMsSUFBSyxPQUFBLENBQVEsc0JBQVIsRUFBTCxDQUFELENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMsS0FGZCxDQUFBOztBQUFBLEVBSUEsU0FBQSxHQUFXLFNBQUMsUUFBRCxHQUFBO0FBQ1QsUUFBQSxLQUFBO0FBQUE7QUFDRSxNQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBZCxDQUE2QixhQUE3QixDQUFBLENBREY7S0FBQSxjQUFBO0FBR0UsTUFESSxjQUNKLENBQUE7QUFBQSxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBWixDQUFBLENBSEY7S0FBQTtXQUtBLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBZCxDQUE0QixhQUE1QixFQU5TO0VBQUEsQ0FKWCxDQUFBOztBQUFBLEVBWUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDJCQUFBLEVBQUEsR0FBSSxhQUFKLENBQUE7O0FBQUEsMkJBQ0EsUUFBQSxHQUFVLGdCQURWLENBQUE7O0FBQUEsMkJBRUEsaUJBQUEsR0FBbUIsSUFGbkIsQ0FBQTs7QUFJYSxJQUFBLHNCQUFBLEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxpQkFBRCxHQUNFO0FBQUEsUUFBQSxpQ0FBQSxFQUFtQyxnQkFBbkM7QUFBQSxRQUNBLGtDQUFBLEVBQW9DLGdCQURwQztPQURGLENBRFc7SUFBQSxDQUpiOztBQUFBLDJCQVdBLFNBQUEsR0FBWSxTQUFDLEVBQUQsRUFBSSxLQUFKLEVBQVksVUFBWixHQUFBO0FBQ1YsVUFBQSxrQkFBQTtBQUFBLE1BRHFCLElBQUMsQ0FBQSxhQUFBLFVBQ3RC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

//# sourceURL=/home/mowens/.atom/packages/python-jedi/lib/jedi-python3-provider.coffee
