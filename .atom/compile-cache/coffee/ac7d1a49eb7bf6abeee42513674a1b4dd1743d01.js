(function() {
  var BufferedProcess, JediProvider, command, jedipy_filename, resetJedi;

  BufferedProcess = require('atom').BufferedProcess;

  command = atom.config.get('python-jedi.Pathtopython');

  jedipy_filename = '/python3_jedi.py';

  resetJedi = function(newValue) {
    var error;
    try {
      atom.packages.disablePackage('python-jedi');
    } catch (error1) {
      error = error1;
      console.log(error);
    }
    atom.packages.enablePackage('python-jedi');
    return command = atom.config.get('python-jedi.Pathtopython');
  };

  module.exports = JediProvider = (function() {
    var opts;

    JediProvider.prototype.id = 'python-jedi';

    JediProvider.prototype.selector = '.source.python';

    JediProvider.prototype.providerblacklist = null;

    opts = {
      stdio: ['pipe', null, null]
    };

    function JediProvider() {
      this.providerblacklist = {
        'autocomplete-plus-fuzzyprovider': '.source.python',
        'autocomplete-plus-symbolprovider': '.source.python'
      };
    }

    JediProvider.prototype.goto_def = function(source, row, column, path) {
      var args, callback, data, exit, goto_def_process, payload, stderr, stdout;
      payload = {
        source: source,
        line: row,
        column: column,
        path: path,
        type: "goto"
      };
      data = JSON.stringify(payload);
      args = [__dirname + jedipy_filename];
      stdout = function(data) {
        var goto_info_objects, key, results, value;
        goto_info_objects = JSON.parse(data);
        results = [];
        for (key in goto_info_objects) {
          value = goto_info_objects[key];
          if (value['module_path'] !== null && value['line'] !== null) {
            results.push(atom.workspace.open(value['module_path'], {
              'initialLine': value['line'] - 1,
              'searchAllPanes': true
            }));
          } else if (value['is_built_in'] && (value['type'] = "module" || "class" || "function")) {
            results.push(atom.notifications.addInfo("Built In " + value['type'], {
              dismissable: true,
              'detail': "Description: " + value['description'] + ".\nThis is a builtin " + value['type'] + ". Doesn't have module path"
            }));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };
      stderr = function(error) {
        return console.log(error);
      };
      exit = function(code) {
        return goto_def_process.kill();
      };
      callback = function(errorObject) {
        return console.log(errorObject.error);
      };
      goto_def_process = new BufferedProcess({
        command: command,
        args: args,
        opts: opts,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
      goto_def_process.process.stdin.write(data);
      goto_def_process.process.stdin.end();
      return goto_def_process.onWillThrowError(callback);
    };

    JediProvider.prototype.requestHandler = function(options) {
      return new Promise(function(resolve) {
        var args, bufferPosition, callback, column, completion_process, data, exit, hash, line, path, payload, prefix, prefixRegex, prefixRegex_others, prefixcheck, row, stderr, stdout, suggestions, text;
        suggestions = [];
        if (atom.packages.isPackageDisabled('python-jedi')) {
          resolve(suggestions);
        }
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
        prefixRegex_others = /[\s()\[\]{}=\-@!$%\^&\?'"\/|\\`~;:<>,*+]/g;
        prefixRegex = /\b((\w+))$/g;
        if (options.prefix.match(prefixRegex)) {
          prefix = options.prefix.match(prefixRegex)[0];
        }
        line = options.editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
        hash = line.search(/(\#)/g);
        prefixcheck = !prefixRegex_others.test(options.cursor.getCurrentWordPrefix());
        if (hash < 0 && prefixcheck) {
          data = JSON.stringify(payload);
          args = [__dirname + jedipy_filename];
          stdout = function(data) {
            var key, label, list_of_objects, name, type, value;
            list_of_objects = JSON.parse(data);
            if (list_of_objects.length !== 0) {
              for (key in list_of_objects) {
                value = list_of_objects[key];
                label = value.description;
                type = value.type;
                name = value.name;
                if (label.length > 80) {
                  label = label.substr(0, 80);
                }
                suggestions.push({
                  text: name,
                  replacementPrefix: prefix,
                  label: label,
                  type: type
                });
              }
              return resolve(suggestions);
            } else {
              return resolve(suggestions);
            }
          };
          stderr = function(error) {
            return console.log(error);
          };
          exit = function(code) {
            return completion_process.kill();
          };
          callback = function(errorObject) {
            return console.log(errorObject.error);
          };
          completion_process = new BufferedProcess({
            command: command,
            args: args,
            opts: opts,
            stdout: stdout,
            stderr: stderr,
            exit: exit
          });
          completion_process.process.stdin.write(data);
          completion_process.process.stdin.end();
          return completion_process.onWillThrowError(callback);
        } else {
          return resolve(suggestions);
        }
      });
    };

    JediProvider.prototype.error = function(data) {
      return console.log(data);
    };

    return JediProvider;

  })();

  atom.config.observe('python-jedi.Pathtopython', function(newValue) {
    atom.config.set('python-jedi.Pathtopython', newValue);
    return resetJedi(newValue);
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3B5dGhvbi1qZWRpL2xpYi9qZWRpLXB5dGhvbjMtcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxrQkFBbUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3BCLE9BQUEsR0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMEJBQWhCOztFQUNWLGVBQUEsR0FBa0I7O0VBRWxCLFNBQUEsR0FBVyxTQUFDLFFBQUQ7QUFDVCxRQUFBO0FBQUE7TUFDRSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWQsQ0FBNkIsYUFBN0IsRUFERjtLQUFBLGNBQUE7TUFFTTtNQUNKLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBWixFQUhGOztJQUtBLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBZCxDQUE0QixhQUE1QjtXQUNBLE9BQUEsR0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMEJBQWhCO0VBUEQ7O0VBU1gsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLFFBQUE7OzJCQUFBLEVBQUEsR0FBSTs7MkJBQ0osUUFBQSxHQUFVOzsyQkFDVixpQkFBQSxHQUFtQjs7SUFDbkIsSUFBQSxHQUFPO01BQUMsS0FBQSxFQUFPLENBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxJQUFmLENBQVI7OztJQUVNLHNCQUFBO01BQ1gsSUFBQyxDQUFBLGlCQUFELEdBQ0U7UUFBQSxpQ0FBQSxFQUFtQyxnQkFBbkM7UUFDQSxrQ0FBQSxFQUFvQyxnQkFEcEM7O0lBRlM7OzJCQUtiLFFBQUEsR0FBUyxTQUFDLE1BQUQsRUFBUyxHQUFULEVBQWMsTUFBZCxFQUFzQixJQUF0QjtBQUVQLFVBQUE7TUFBQSxPQUFBLEdBQ0U7UUFBQSxNQUFBLEVBQVEsTUFBUjtRQUNBLElBQUEsRUFBTSxHQUROO1FBRUEsTUFBQSxFQUFRLE1BRlI7UUFH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dGVudCI6WyJ7QnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG5jb21tYW5kID0gYXRvbS5jb25maWcuZ2V0KCdweXRob24tamVkaS5QYXRodG9weXRob24nKVxuamVkaXB5X2ZpbGVuYW1lID0gJy9weXRob24zX2plZGkucHknXG5cbnJlc2V0SmVkaT0gKG5ld1ZhbHVlKSAtPlxuICB0cnlcbiAgICBhdG9tLnBhY2thZ2VzLmRpc2FibGVQYWNrYWdlKCdweXRob24tamVkaScpXG4gIGNhdGNoIGVycm9yXG4gICAgY29uc29sZS5sb2cgZXJyb3JcblxuICBhdG9tLnBhY2thZ2VzLmVuYWJsZVBhY2thZ2UoJ3B5dGhvbi1qZWRpJylcbiAgY29tbWFuZCA9IGF0b20uY29uZmlnLmdldCgncHl0aG9uLWplZGkuUGF0aHRvcHl0aG9uJylcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgSmVkaVByb3ZpZGVyXG4gIGlkOiAncHl0aG9uLWplZGknXG4gIHNlbGVjdG9yOiAnLnNvdXJjZS5weXRob24nXG4gIHByb3ZpZGVyYmxhY2tsaXN0OiBudWxsXG4gIG9wdHMgPSB7c3RkaW86IFsncGlwZScsIG51bGwsIG51bGxdfVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBwcm92aWRlcmJsYWNrbGlzdCA9XG4gICAgICAnYXV0b2NvbXBsZXRlLXBsdXMtZnV6enlwcm92aWRlcic6ICcuc291cmNlLnB5dGhvbidcbiAgICAgICdhdXRvY29tcGxldGUtcGx1cy1zeW1ib2xwcm92aWRlcic6ICcuc291cmNlLnB5dGhvbidcblxuICBnb3RvX2RlZjooc291cmNlLCByb3csIGNvbHVtbiwgcGF0aCktPlxuXG4gICAgcGF5bG9hZCA9XG4gICAgICBzb3VyY2U6IHNvdXJjZVxuICAgICAgbGluZTogcm93XG4gICAgICBjb2x1bW46IGNvbHVtblxuICAgICAgcGF0aDogcGF0aFxuICAgICAgdHlwZTogXCJnb3RvXCJcbiAgICBkYXRhID0gSlNPTi5zdHJpbmdpZnkocGF5bG9hZClcbiAgICBhcmdzID0gW19fZGlybmFtZSArIGplZGlweV9maWxlbmFtZV1cblxuICAgIHN0ZG91dCA9IChkYXRhKSAtPlxuICAgICAgZ290b19pbmZvX29iamVjdHMgPSBKU09OLnBhcnNlKGRhdGEpXG4gICAgICBmb3Iga2V5LHZhbHVlIG9mIGdvdG9faW5mb19vYmplY3RzXG4gICAgICAgIGlmIHZhbHVlWydtb2R1bGVfcGF0aCddICE9IG51bGwgJiYgdmFsdWVbJ2xpbmUnXSAhPSBudWxsXG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbih2YWx1ZVsnbW9kdWxlX3BhdGgnXSwoeydpbml0aWFsTGluZSc6KHZhbHVlWydsaW5lJ10tMSksJ3NlYXJjaEFsbFBhbmVzJzp0cnVlfSkpXG4gICAgICAgIGVsc2UgaWYgdmFsdWVbJ2lzX2J1aWx0X2luJ10gJiYgdmFsdWVbJ3R5cGUnXSA9IChcIm1vZHVsZVwiIHx8IFwiY2xhc3NcIiB8fCBcImZ1bmN0aW9uXCIpXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJCdWlsdCBJbiBcIit2YWx1ZVsndHlwZSddLFxuICAgICAgICAgICh7ZGlzbWlzc2FibGU6IHRydWUsJ2RldGFpbCc6XCJEZXNjcmlwdGlvbjogXCIrdmFsdWVbJ2Rlc2NyaXB0aW9uJ10rXG4gICAgICAgICAgXCIuXFxuVGhpcyBpcyBhIGJ1aWx0aW4gXCIrdmFsdWVbJ3R5cGUnXStcIi4gRG9lc24ndCBoYXZlIG1vZHVsZSBwYXRoXCJ9KSlcbiAgICBzdGRlcnIgPSAoZXJyb3IpIC0+XG4gICAgICBjb25zb2xlLmxvZyBlcnJvclxuICAgIGV4aXQgPSAoY29kZSkgLT5cbiAgICAgIGdvdG9fZGVmX3Byb2Nlc3Mua2lsbCgpXG4gICAgY2FsbGJhY2sgPSAoZXJyb3JPYmplY3QpIC0+XG4gICAgICBjb25zb2xlLmxvZyBlcnJvck9iamVjdC5lcnJvclxuICAgIGdvdG9fZGVmX3Byb2Nlc3MgPSBuZXcgQnVmZmVyZWRQcm9jZXNzKHtjb21tYW5kLCBhcmdzLCBvcHRzLCBzdGRvdXQgLCBzdGRlcnIsIGV4aXR9KVxuICAgIGdvdG9fZGVmX3Byb2Nlc3MucHJvY2Vzcy5zdGRpbi53cml0ZShkYXRhKTtcbiAgICBnb3RvX2RlZl9wcm9jZXNzLnByb2Nlc3Muc3RkaW4uZW5kKCk7XG4gICAgZ290b19kZWZfcHJvY2Vzcy5vbldpbGxUaHJvd0Vycm9yKGNhbGxiYWNrKVxuXG4gIHJlcXVlc3RIYW5kbGVyOiAob3B0aW9ucykgLT5cbiAgICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUpIC0+XG5cbiAgICAgIHN1Z2dlc3Rpb25zID0gW11cbiAgICAgIGlmIGF0b20ucGFja2FnZXMuaXNQYWNrYWdlRGlzYWJsZWQoJ3B5dGhvbi1qZWRpJylcbiAgICAgICAgcmVzb2x2ZShzdWdnZXN0aW9ucylcblxuICAgICAgYnVmZmVyUG9zaXRpb24gPSBvcHRpb25zLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAgIHRleHQgPSBvcHRpb25zLmVkaXRvci5nZXRUZXh0KClcbiAgICAgIHJvdyA9IG9wdGlvbnMuY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkucm93XG4gICAgICBjb2x1bW4gPSBvcHRpb25zLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLmNvbHVtblxuICAgICAgcGF0aCA9IG9wdGlvbnMuZWRpdG9yLmdldFBhdGgoKVxuXG4gICAgICByZXNvbHZlKHN1Z2dlc3Rpb25zKSB1bmxlc3MgY29sdW1uIGlzbnQgMFxuXG4gICAgICBwYXlsb2FkID1cbiAgICAgICAgc291cmNlOiB0ZXh0XG4gICAgICAgIGxpbmU6IHJvd1xuICAgICAgICBjb2x1bW46IGNvbHVtblxuICAgICAgICBwYXRoOiBwYXRoXG4gICAgICAgIHR5cGU6J2F1dG9jb21wbGV0ZSdcblxuICAgICAgcHJlZml4UmVnZXhfb3RoZXJzID0gL1tcXHMoKVxcW1xcXXt9PVxcLUAhJCVcXF4mXFw/J1wiXFwvfFxcXFxgfjs6PD4sKitdL2dcbiAgICAgIHByZWZpeFJlZ2V4ID0gL1xcYigoXFx3KykpJC9nXG5cbiAgICAgIGlmIG9wdGlvbnMucHJlZml4Lm1hdGNoKHByZWZpeFJlZ2V4KVxuICAgICAgICBwcmVmaXggPSBvcHRpb25zLnByZWZpeC5tYXRjaChwcmVmaXhSZWdleClbMF1cblxuICAgICAgbGluZSA9IG9wdGlvbnMuZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuICAgICAgaGFzaCA9IGxpbmUuc2VhcmNoKC8oXFwjKS9nKVxuICAgICAgcHJlZml4Y2hlY2sgPSBub3QgcHJlZml4UmVnZXhfb3RoZXJzLnRlc3Qob3B0aW9ucy5jdXJzb3IuZ2V0Q3VycmVudFdvcmRQcmVmaXgoKSlcblxuICAgICAgaWYgaGFzaCA8IDAgJiYgcHJlZml4Y2hlY2tcblxuICAgICAgICBkYXRhID0gSlNPTi5zdHJpbmdpZnkocGF5bG9hZClcbiAgICAgICAgYXJncyA9IFtfX2Rpcm5hbWUgKyBqZWRpcHlfZmlsZW5hbWVdXG5cbiAgICAgICAgc3Rkb3V0ID0gKGRhdGEpIC0+XG4gICAgICAgICAgbGlzdF9vZl9vYmplY3RzID0gSlNPTi5wYXJzZShkYXRhKVxuICAgICAgICAgIGlmIGxpc3Rfb2Zfb2JqZWN0cy5sZW5ndGggaXNudCAwXG4gICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBsaXN0X29mX29iamVjdHNcbiAgICAgICAgICAgICAgbGFiZWwgPSB2YWx1ZS5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICB0eXBlID0gdmFsdWUudHlwZVxuICAgICAgICAgICAgICBuYW1lID0gdmFsdWUubmFtZVxuXG4gICAgICAgICAgICAgIGlmIGxhYmVsLmxlbmd0aCA+IDgwXG4gICAgICAgICAgICAgICAgbGFiZWwgPSBsYWJlbC5zdWJzdHIoMCwgODApXG4gICAgICAgICAgICAgIHN1Z2dlc3Rpb25zLnB1c2hcbiAgICAgICAgICAgICAgICB0ZXh0OiBuYW1lXG4gICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeFxuICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbFxuICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVcblxuICAgICAgICAgICAgcmVzb2x2ZShzdWdnZXN0aW9ucylcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXNvbHZlKHN1Z2dlc3Rpb25zKVxuXG4gICAgICAgIHN0ZGVyciA9IChlcnJvcikgLT5cbiAgICAgICAgICBjb25zb2xlLmxvZyBlcnJvclxuICAgICAgICBleGl0ID0gKGNvZGUpLT5cbiAgICAgICAgICBjb21wbGV0aW9uX3Byb2Nlc3Mua2lsbCgpXG4gICAgICAgIGNhbGxiYWNrID0gKGVycm9yT2JqZWN0KSAtPlxuICAgICAgICAgIGNvbnNvbGUubG9nIGVycm9yT2JqZWN0LmVycm9yXG5cbiAgICAgICAgY29tcGxldGlvbl9wcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2Vzcyh7Y29tbWFuZCwgYXJncywgb3B0cywgc3Rkb3V0LCBzdGRlcnIsIGV4aXR9KVxuICAgICAgICBjb21wbGV0aW9uX3Byb2Nlc3MucHJvY2Vzcy5zdGRpbi53cml0ZShkYXRhKTtcbiAgICAgICAgY29tcGxldGlvbl9wcm9jZXNzLnByb2Nlc3Muc3RkaW4uZW5kKCk7XG4gICAgICAgIGNvbXBsZXRpb25fcHJvY2Vzcy5vbldpbGxUaHJvd0Vycm9yKGNhbGxiYWNrKVxuICAgICAgZWxzZVxuICAgICAgICByZXNvbHZlKHN1Z2dlc3Rpb25zKVxuXG4gIGVycm9yOiAoZGF0YSkgLT5cbiAgICBjb25zb2xlLmxvZyBkYXRhXG5cbiNvYnNlcnZlIHNldHRpbmdzXG5hdG9tLmNvbmZpZy5vYnNlcnZlICdweXRob24tamVkaS5QYXRodG9weXRob24nLCAobmV3VmFsdWUpIC0+XG4gIGF0b20uY29uZmlnLnNldCgncHl0aG9uLWplZGkuUGF0aHRvcHl0aG9uJywgbmV3VmFsdWUpXG4gIHJlc2V0SmVkaShuZXdWYWx1ZSlcbiJdfQ==
