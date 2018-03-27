(function() {
  var CompositeDisposable, Point, PythonTools, Range, path, ref, regexPatternIn,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point, CompositeDisposable = ref.CompositeDisposable;

  path = require('path');

  regexPatternIn = function(pattern, list) {
    var item, j, len;
    for (j = 0, len = list.length; j < len; j++) {
      item = list[j];
      if (pattern.test(item)) {
        return true;
      }
    }
    return false;
  };

  PythonTools = {
    config: {
      smartBlockSelection: {
        type: 'boolean',
        description: 'Do not select whitespace outside logical string blocks',
        "default": true
      },
      pythonPath: {
        type: 'string',
        "default": '',
        title: 'Path to python directory',
        description: ',\nOptional. Set it if default values are not working for you or you want to use specific\npython version. For example: `/usr/local/Cellar/python/2.7.3/bin` or `E:\\Python2.7`'
      }
    },
    subscriptions: null,
    _issueReportLink: "https://github.com/michaelaquilina/python-tools/issues/new",
    activate: function(state) {
      var env, j, len, p, path_env, paths, pythonPath;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar="source python"]', {
        'python-tools:show-usages': (function(_this) {
          return function() {
            return _this.jediToolsRequest('usages');
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar="source python"]', {
        'python-tools:goto-definition': (function(_this) {
          return function() {
            return _this.jediToolsRequest('gotoDef');
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar="source python"]', {
        'python-tools:select-all-string': (function(_this) {
          return function() {
            return _this.selectAllString();
          };
        })(this)
      }));
      env = process.env;
      pythonPath = atom.config.get('python-tools.pythonPath');
      path_env = null;
      if (/^win/.test(process.platform)) {
        paths = ['C:\\Python2.7', 'C:\\Python3.4', 'C:\\Python34', 'C:\\Python3.5', 'C:\\Python35', 'C:\\Program Files (x86)\\Python 2.7', 'C:\\Program Files (x86)\\Python 3.4', 'C:\\Program Files (x86)\\Python 3.5', 'C:\\Program Files (x64)\\Python 2.7', 'C:\\Program Files (x64)\\Python 3.4', 'C:\\Program Files (x64)\\Python 3.5', 'C:\\Program Files\\Python 2.7', 'C:\\Program Files\\Python 3.4', 'C:\\Program Files\\Python 3.5'];
        path_env = env.Path || '';
      } else {
        paths = ['/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin'];
        path_env = env.PATH || '';
      }
      path_env = path_env.split(path.delimiter);
      path_env.unshift(pythonPath && indexOf.call(path_env, pythonPath) < 0 ? pythonPath : void 0);
      for (j = 0, len = paths.length; j < len; j++) {
        p = paths[j];
        if (indexOf.call(path_env, p) < 0) {
          path_env.push(p);
        }
      }
      env.PATH = path_env.join(path.delimiter);
      this.provider = require('child_process').spawn('python', [__dirname + '/tools.py'], {
        env: env
      });
      this.readline = require('readline').createInterface({
        input: this.provider.stdout,
        output: this.provider.stdin
      });
      this.provider.on('error', (function(_this) {
        return function(err) {
          if (err.code === 'ENOENT') {
            return atom.notifications.addWarning("python-tools was unable to find your machine's python executable.\n\nPlease try set the path in package settings and then restart atom.\n\nIf the issue persists please post an issue on\n" + _this._issueReportLink, {
              detail: err,
              dismissable: true
            });
          } else {
            return atom.notifications.addError("python-tools unexpected error.\n\nPlease consider posting an issue on\n" + _this._issueReportLink, {
              detail: err,
              dismissable: true
            });
          }
        };
      })(this));
      return this.provider.on('exit', (function(_this) {
        return function(code, signal) {
          if (signal !== 'SIGTERM') {
            return atom.notifications.addError("python-tools experienced an unexpected exit.\n\nPlease consider posting an issue on\n" + _this._issueReportLink, {
              detail: "exit with code " + code + ", signal " + signal,
              dismissable: true
            });
          }
        };
      })(this));
    },
    deactivate: function() {
      this.subscriptions.dispose();
      this.provider.kill();
      return this.readline.close();
    },
    selectAllString: function() {
      var block, bufferPosition, delim_index, delimiter, editor, end, end_index, i, j, line, ref1, ref2, scopeDescriptor, scopes, selections, start, start_index, trimmed;
      editor = atom.workspace.getActiveTextEditor();
      bufferPosition = editor.getCursorBufferPosition();
      line = editor.lineTextForBufferRow(bufferPosition.row);
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
      scopes = scopeDescriptor.getScopesArray();
      block = false;
      if (regexPatternIn(/string.quoted.single.single-line.*/, scopes)) {
        delimiter = '\'';
      } else if (regexPatternIn(/string.quoted.double.single-line.*/, scopes)) {
        delimiter = '"';
      } else if (regexPatternIn(/string.quoted.double.block.*/, scopes)) {
        delimiter = '"""';
        block = true;
      } else if (regexPatternIn(/string.quoted.single.block.*/, scopes)) {
        delimiter = '\'\'\'';
        block = true;
      } else {
        return;
      }
      if (!block) {
        start = end = bufferPosition.column;
        while (line[start] !== delimiter) {
          start = start - 1;
          if (start < 0) {
            return;
          }
        }
        while (line[end] !== delimiter) {
          end = end + 1;
          if (end === line.length) {
            return;
          }
        }
        return editor.setSelectedBufferRange(new Range(new Point(bufferPosition.row, start + 1), new Point(bufferPosition.row, end)));
      } else {
        start = end = bufferPosition.row;
        start_index = end_index = -1;
        delim_index = line.indexOf(delimiter);
        if (delim_index !== -1) {
          scopes = editor.scopeDescriptorForBufferPosition(new Point(start, delim_index));
          scopes = scopes.getScopesArray();
          if (regexPatternIn(/punctuation.definition.string.begin.*/, scopes)) {
            start_index = line.indexOf(delimiter);
            while (end_index === -1) {
              end = end + 1;
              line = editor.lineTextForBufferRow(end);
              end_index = line.indexOf(delimiter);
            }
          } else if (regexPatternIn(/punctuation.definition.string.end.*/, scopes)) {
            end_index = line.indexOf(delimiter);
            while (start_index === -1) {
              start = start - 1;
              line = editor.lineTextForBufferRow(start);
              start_index = line.indexOf(delimiter);
            }
          }
        } else {
          while (end_index === -1) {
            end = end + 1;
            line = editor.lineTextForBufferRow(end);
            end_index = line.indexOf(delimiter);
          }
          while (start_index === -1) {
            start = start - 1;
            line = editor.lineTextForBufferRow(start);
            start_index = line.indexOf(delimiter);
          }
        }
        if (atom.config.get('python-tools.smartBlockSelection')) {
          selections = [new Range(new Point(start, start_index + delimiter.length), new Point(start, editor.lineTextForBufferRow(start).length))];
          for (i = j = ref1 = start + 1, ref2 = end; j < ref2; i = j += 1) {
            line = editor.lineTextForBufferRow(i);
            trimmed = line.replace(/^\s+/, "");
            selections.push(new Range(new Point(i, line.length - trimmed.length), new Point(i, line.length)));
          }
          line = editor.lineTextForBufferRow(end);
          trimmed = line.replace(/^\s+/, "");
          selections.push(new Range(new Point(end, line.length - trimmed.length), new Point(end, end_index)));
          return editor.setSelectedBufferRanges(selections.filter(function(range) {
            return !range.isEmpty();
          }));
        } else {
          return editor.setSelectedBufferRange(new Range(new Point(start, start_index + delimiter.length), new Point(end, end_index)));
        }
      }
    },
    handleJediToolsResponse: function(response) {
      var column, editor, first_def, item, j, len, line, options, ref1, selections;
      if ('error' in response) {
        console.error(response['error']);
        atom.notifications.addError(response['error']);
        return;
      }
      if (response['definitions'].length > 0) {
        editor = atom.workspace.getActiveTextEditor();
        if (response['type'] === 'usages') {
          path = editor.getPath();
          selections = [];
          ref1 = response['definitions'];
          for (j = 0, len = ref1.length; j < len; j++) {
            item = ref1[j];
            if (item['path'] === path) {
              selections.push(new Range(new Point(item['line'] - 1, item['col']), new Point(item['line'] - 1, item['col'] + item['name'].length)));
            }
          }
          return editor.setSelectedBufferRanges(selections);
        } else if (response['type'] === 'gotoDef') {
          first_def = response['definitions'][0];
          line = first_def['line'];
          column = first_def['col'];
          if (line !== null && column !== null) {
            options = {
              initialLine: line,
              initialColumn: column,
              searchAllPanes: true
            };
            return atom.workspace.open(first_def['path'], options).then(function(editor) {
              return editor.scrollToCursorPosition();
            });
          }
        } else {
          return atom.notifications.addError("python-tools error. " + this._issueReportLink, {
            detail: JSON.stringify(response),
            dismissable: true
          });
        }
      } else {
        return atom.notifications.addInfo("python-tools could not find any results!");
      }
    },
    jediToolsRequest: function(type) {
      var bufferPosition, editor, grammar, handleJediToolsResponse, payload, readline;
      editor = atom.workspace.getActiveTextEditor();
      grammar = editor.getGrammar();
      bufferPosition = editor.getCursorBufferPosition();
      payload = {
        type: type,
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        col: bufferPosition.column,
        project_paths: atom.project.getPaths()
      };
      handleJediToolsResponse = this.handleJediToolsResponse;
      readline = this.readline;
      return new Promise(function(resolve, reject) {
        var response;
        return response = readline.question((JSON.stringify(payload)) + "\n", function(response) {
          handleJediToolsResponse(JSON.parse(response));
          return resolve();
        });
      });
    }
  };

  module.exports = PythonTools;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3B5dGhvbi10b29scy9saWIvcHl0aG9uLXRvb2xzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEseUVBQUE7SUFBQTs7RUFBQSxNQUFzQyxPQUFBLENBQVEsTUFBUixDQUF0QyxFQUFDLGlCQUFELEVBQVEsaUJBQVIsRUFBZTs7RUFDZixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBR1AsY0FBQSxHQUFpQixTQUFDLE9BQUQsRUFBVSxJQUFWO0FBQ2YsUUFBQTtBQUFBLFNBQUEsc0NBQUE7O01BQ0UsSUFBRyxPQUFPLENBQUMsSUFBUixDQUFhLElBQWIsQ0FBSDtBQUNFLGVBQU8sS0FEVDs7QUFERjtBQUdBLFdBQU87RUFKUTs7RUFPakIsV0FBQSxHQUFjO0lBQ1osTUFBQSxFQUFRO01BQ04sbUJBQUEsRUFBcUI7UUFDbkIsSUFBQSxFQUFNLFNBRGE7UUFFbkIsV0FBQSxFQUFhLHdEQUZNO1FBR25CLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFIVTtPQURmO01BTU4sVUFBQSxFQUFZO1FBQ1YsSUFBQSxFQUFNLFFBREk7UUFFVixDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRkM7UUFHVixLQUFBLEVBQU8sMEJBSEc7UUFJVixXQUFBLEVBQWEsaUxBSkg7T0FOTjtLQURJO0lBa0JaLGFBQUEsRUFBZSxJQWxCSDtJQW9CWixnQkFBQSxFQUFrQiw0REFwQk47SUFzQlosUUFBQSxFQUFVLFNBQUMsS0FBRDtBQUVSLFVBQUE7TUFBQSxJQUFJLENBQUMsYUFBTCxHQUFxQixJQUFJO01BQ3pCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBbkIsQ0FDRSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FDRSxnREFERixFQUVFO1FBQUMsMEJBQUEsRUFBNEIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBTSxLQUFJLENBQUMsZ0JBQUws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QUMsR0FKYjtRQUtSLEdBQUEsRUFBSyxjQUFjLENBQUMsTUFMWjtRQU1SLGFBQUEsRUFBZSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQU5QOztNQVVWLHVCQUFBLEdBQTBCLElBQUksQ0FBQztNQUMvQixRQUFBLEdBQVcsSUFBSSxDQUFDO0FBRWhCLGFBQVcsSUFBQSxPQUFBLENBQVEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNqQixZQUFBO2VBQUEsUUFBQSxHQUFXLFFBQVEsQ0FBQyxRQUFULENBQW9CLENBQUMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxPQUFmLENBQUQsQ0FBQSxHQUF5QixJQUE3QyxFQUFrRCxTQUFDLFFBQUQ7VUFDM0QsdUJBQUEsQ0FBd0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFYLENBQXhCO2lCQUNBLE9BQUEsQ0FBQTtRQUYyRCxDQUFsRDtNQURNLENBQVI7SUFuQkssQ0E5Uk47OztFQXlUZCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXBVakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2UsIFBvaW50LCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbnBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cblxucmVnZXhQYXR0ZXJuSW4gPSAocGF0dGVybiwgbGlzdCkgLT5cbiAgZm9yIGl0ZW0gaW4gbGlzdFxuICAgIGlmIHBhdHRlcm4udGVzdChpdGVtKVxuICAgICAgcmV0dXJuIHRydWVcbiAgcmV0dXJuIGZhbHNlXG5cblxuUHl0aG9uVG9vbHMgPSB7XG4gIGNvbmZpZzoge1xuICAgIHNtYXJ0QmxvY2tTZWxlY3Rpb246IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRG8gbm90IHNlbGVjdCB3aGl0ZXNwYWNlIG91dHNpZGUgbG9naWNhbCBzdHJpbmcgYmxvY2tzJyxcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIHB5dGhvblBhdGg6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJycsXG4gICAgICB0aXRsZTogJ1BhdGggdG8gcHl0aG9uIGRpcmVjdG9yeScsXG4gICAgICBkZXNjcmlwdGlvbjogJycnLFxuICAgICAgT3B0aW9uYWwuIFNldCBpdCBpZiBkZWZhdWx0IHZhbHVlcyBhcmUgbm90IHdvcmtpbmcgZm9yIHlvdSBvciB5b3Ugd2FudCB0byB1c2Ugc3BlY2lmaWNcbiAgICAgIHB5dGhvbiB2ZXJzaW9uLiBGb3IgZXhhbXBsZTogYC91c3IvbG9jYWwvQ2VsbGFyL3B5dGhvbi8yLjcuMy9iaW5gIG9yIGBFOlxcXFxQeXRob24yLjdgXG4gICAgICAnJydcbiAgICB9XG4gIH1cblxuICBzdWJzY3JpcHRpb25zOiBudWxsXG5cbiAgX2lzc3VlUmVwb3J0TGluazogXCJodHRwczovL2dpdGh1Yi5jb20vbWljaGFlbGFxdWlsaW5hL3B5dGhvbi10b29scy9pc3N1ZXMvbmV3XCJcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgICMgRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gYXRvbSdzIHN5c3RlbSBjYW4gYmUgZWFzaWx5IGNsZWFuZWQgdXAgd2l0aCBhIENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3JbZGF0YS1ncmFtbWFyPVwic291cmNlIHB5dGhvblwiXScsXG4gICAgICAgIHsncHl0aG9uLXRvb2xzOnNob3ctdXNhZ2VzJzogKCkgPT4gdGhpcy5qZWRpVG9vbHNSZXF1ZXN0KCd1c2FnZXMnKX1cbiAgICAgIClcbiAgICApXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXI9XCJzb3VyY2UgcHl0aG9uXCJdJyxcbiAgICAgICAgeydweXRob24tdG9vbHM6Z290by1kZWZpbml0aW9uJzogKCkgPT4gdGhpcy5qZWRpVG9vbHNSZXF1ZXN0KCdnb3RvRGVmJyl9XG4gICAgICApXG4gICAgKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3JbZGF0YS1ncmFtbWFyPVwic291cmNlIHB5dGhvblwiXScsXG4gICAgICAgIHsncHl0aG9uLXRvb2xzOnNlbGVjdC1hbGwtc3RyaW5nJzogKCkgPT4gdGhpcy5zZWxlY3RBbGxTdHJpbmcoKX1cbiAgICAgIClcbiAgICApXG5cbiAgICBlbnYgPSBwcm9jZXNzLmVudlxuICAgIHB5dGhvblBhdGggPSBhdG9tLmNvbmZpZy5nZXQoJ3B5dGhvbi10b29scy5weXRob25QYXRoJylcbiAgICBwYXRoX2VudiA9IG51bGxcblxuICAgIGlmIC9ed2luLy50ZXN0KHByb2Nlc3MucGxhdGZvcm0pXG4gICAgICBwYXRocyA9IFtcbiAgICAgICAgJ0M6XFxcXFB5dGhvbjIuNycsXG4gICAgICAgICdDOlxcXFxQeXRob24zLjQnLFxuICAgICAgICAnQzpcXFxcUHl0aG9uMzQnLFxuICAgICAgICAnQzpcXFxcUHl0aG9uMy41JyxcbiAgICAgICAgJ0M6XFxcXFB5dGhvbjM1JyxcbiAgICAgICAgJ0M6XFxcXFByb2dyYW0gRmlsZXMgKHg4NilcXFxcUHl0aG9uIDIuNycsXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4ODYpXFxcXFB5dGhvbiAzLjQnLFxuICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlcyAoeDg2KVxcXFxQeXRob24gMy41JyxcbiAgICAgICAgJ0M6XFxcXFByb2dyYW0gRmlsZXMgKHg2NClcXFxcUHl0aG9uIDIuNycsXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4NjQpXFxcXFB5dGhvbiAzLjQnLFxuICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlcyAoeDY0KVxcXFxQeXRob24gMy41JyxcbiAgICAgICAgJ0M6XFxcXFByb2dyYW0gRmlsZXNcXFxcUHl0aG9uIDIuNycsXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzXFxcXFB5dGhvbiAzLjQnLFxuICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlc1xcXFxQeXRob24gMy41J1xuICAgICAgXVxuICAgICAgcGF0aF9lbnYgPSAoZW52LlBhdGggb3IgJycpXG4gICAgZWxzZVxuICAgICAgcGF0aHMgPSBbJy91c3IvbG9jYWwvYmluJywgJy91c3IvYmluJywgJy9iaW4nLCAnL3Vzci9zYmluJywgJy9zYmluJ11cbiAgICAgIHBhdGhfZW52ID0gKGVudi5QQVRIIG9yICcnKVxuXG4gICAgcGF0aF9lbnYgPSBwYXRoX2Vudi5zcGxpdChwYXRoLmRlbGltaXRlcilcbiAgICBwYXRoX2Vudi51bnNoaWZ0KHB5dGhvblBhdGggaWYgcHl0aG9uUGF0aCBhbmQgcHl0aG9uUGF0aCBub3QgaW4gcGF0aF9lbnYpXG4gICAgZm9yIHAgaW4gcGF0aHNcbiAgICAgIGlmIHAgbm90IGluIHBhdGhfZW52XG4gICAgICAgIHBhdGhfZW52LnB1c2gocClcbiAgICBlbnYuUEFUSCA9IHBhdGhfZW52LmpvaW4ocGF0aC5kZWxpbWl0ZXIpXG5cbiAgICB0aGlzLnByb3ZpZGVyID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLnNwYXduKFxuICAgICAgJ3B5dGhvbicsIFtfX2Rpcm5hbWUgKyAnL3Rvb2xzLnB5J10sIGVudjogZW52XG4gICAgKVxuXG4gICAgdGhpcy5yZWFkbGluZSA9IHJlcXVpcmUoJ3JlYWRsaW5lJykuY3JlYXRlSW50ZXJmYWNlKHtcbiAgICAgIGlucHV0OiB0aGlzLnByb3ZpZGVyLnN0ZG91dCxcbiAgICAgIG91dHB1dDogdGhpcy5wcm92aWRlci5zdGRpblxuICAgIH0pXG5cbiAgICB0aGlzLnByb3ZpZGVyLm9uKCdlcnJvcicsIChlcnIpID0+XG4gICAgICBpZiBlcnIuY29kZSA9PSAnRU5PRU5UJ1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIlwiXCJcbiAgICAgICAgICBweXRob24tdG9vbHMgd2FzIHVuYWJsZSB0byBmaW5kIHlvdXIgbWFjaGluZSdzIHB5dGhvbiBleGVjdXRhYmxlLlxuXG4gICAgICAgICAgUGxlYXNlIHRyeSBzZXQgdGhlIHBhdGggaW4gcGFja2FnZSBzZXR0aW5ncyBhbmQgdGhlbiByZXN0YXJ0IGF0b20uXG5cbiAgICAgICAgICBJZiB0aGUgaXNzdWUgcGVyc2lzdHMgcGxlYXNlIHBvc3QgYW4gaXNzdWUgb25cbiAgICAgICAgICAje3RoaXMuX2lzc3VlUmVwb3J0TGlua31cbiAgICAgICAgICBcIlwiXCIsIHtcbiAgICAgICAgICAgIGRldGFpbDogZXJyLFxuICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIGVsc2VcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFwiXCJcIlxuICAgICAgICAgIHB5dGhvbi10b29scyB1bmV4cGVjdGVkIGVycm9yLlxuXG4gICAgICAgICAgUGxlYXNlIGNvbnNpZGVyIHBvc3RpbmcgYW4gaXNzdWUgb25cbiAgICAgICAgICAje3RoaXMuX2lzc3VlUmVwb3J0TGlua31cbiAgICAgICAgICBcIlwiXCIsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiBlcnIsXG4gICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICApXG4gICAgdGhpcy5wcm92aWRlci5vbignZXhpdCcsIChjb2RlLCBzaWduYWwpID0+XG4gICAgICBpZiBzaWduYWwgIT0gJ1NJR1RFUk0nXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBweXRob24tdG9vbHMgZXhwZXJpZW5jZWQgYW4gdW5leHBlY3RlZCBleGl0LlxuXG4gICAgICAgICAgUGxlYXNlIGNvbnNpZGVyIHBvc3RpbmcgYW4gaXNzdWUgb25cbiAgICAgICAgICAje3RoaXMuX2lzc3VlUmVwb3J0TGlua31cbiAgICAgICAgICBcIlwiXCIsIHtcbiAgICAgICAgICAgIGRldGFpbDogXCJleGl0IHdpdGggY29kZSAje2NvZGV9LCBzaWduYWwgI3tzaWduYWx9XCIsXG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIClcblxuICBkZWFjdGl2YXRlOiAoKSAtPlxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLnByb3ZpZGVyLmtpbGwoKVxuICAgIHRoaXMucmVhZGxpbmUuY2xvc2UoKVxuXG4gIHNlbGVjdEFsbFN0cmluZzogKCkgLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhidWZmZXJQb3NpdGlvbi5yb3cpXG5cbiAgICBzY29wZURlc2NyaXB0b3IgPSBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG4gICAgc2NvcGVzID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3Blc0FycmF5KClcblxuICAgIGJsb2NrID0gZmFsc2VcbiAgICBpZiByZWdleFBhdHRlcm5Jbigvc3RyaW5nLnF1b3RlZC5zaW5nbGUuc2luZ2xlLWxpbmUuKi8sIHNjb3BlcylcbiAgICAgIGRlbGltaXRlciA9ICdcXCcnXG4gICAgZWxzZSBpZiByZWdleFBhdHRlcm5Jbigvc3RyaW5nLnF1b3RlZC5kb3VibGUuc2luZ2xlLWxpbmUuKi8sIHNjb3BlcylcbiAgICAgIGRlbGltaXRlciA9ICdcIidcbiAgICBlbHNlIGlmIHJlZ2V4UGF0dGVybkluKC9zdHJpbmcucXVvdGVkLmRvdWJsZS5ibG9jay4qLywgc2NvcGVzKVxuICAgICAgZGVsaW1pdGVyID0gJ1wiXCJcIidcbiAgICAgIGJsb2NrID0gdHJ1ZVxuICAgIGVsc2UgaWYgcmVnZXhQYXR0ZXJuSW4oL3N0cmluZy5xdW90ZWQuc2luZ2xlLmJsb2NrLiovLCBzY29wZXMpXG4gICAgICBkZWxpbWl0ZXIgPSAnXFwnXFwnXFwnJ1xuICAgICAgYmxvY2sgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgcmV0dXJuXG5cbiAgICBpZiBub3QgYmxvY2tcbiAgICAgIHN0YXJ0ID0gZW5kID0gYnVmZmVyUG9zaXRpb24uY29sdW1uXG5cbiAgICAgIHdoaWxlIGxpbmVbc3RhcnRdICE9IGRlbGltaXRlclxuICAgICAgICBzdGFydCA9IHN0YXJ0IC0gMVxuICAgICAgICBpZiBzdGFydCA8IDBcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgd2hpbGUgbGluZVtlbmRdICE9IGRlbGltaXRlclxuICAgICAgICBlbmQgPSBlbmQgKyAxXG4gICAgICAgIGlmIGVuZCA9PSBsaW5lLmxlbmd0aFxuICAgICAgICAgIHJldHVyblxuXG4gICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShuZXcgUmFuZ2UoXG4gICAgICAgIG5ldyBQb2ludChidWZmZXJQb3NpdGlvbi5yb3csIHN0YXJ0ICsgMSksXG4gICAgICAgIG5ldyBQb2ludChidWZmZXJQb3NpdGlvbi5yb3csIGVuZCksXG4gICAgICApKVxuICAgIGVsc2VcbiAgICAgIHN0YXJ0ID0gZW5kID0gYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBzdGFydF9pbmRleCA9IGVuZF9pbmRleCA9IC0xXG5cbiAgICAgICMgRGV0ZWN0IGlmIHdlIGFyZSBhdCB0aGUgYm91bmRhcmllcyBvZiB0aGUgYmxvY2sgc3RyaW5nXG4gICAgICBkZWxpbV9pbmRleCA9IGxpbmUuaW5kZXhPZihkZWxpbWl0ZXIpXG5cbiAgICAgIGlmIGRlbGltX2luZGV4ICE9IC0xXG4gICAgICAgIHNjb3BlcyA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihuZXcgUG9pbnQoc3RhcnQsIGRlbGltX2luZGV4KSlcbiAgICAgICAgc2NvcGVzID0gc2NvcGVzLmdldFNjb3Blc0FycmF5KClcblxuICAgICAgICAjIFdlIGFyZSBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBibG9ja1xuICAgICAgICBpZiByZWdleFBhdHRlcm5JbigvcHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuYmVnaW4uKi8sIHNjb3BlcylcbiAgICAgICAgICBzdGFydF9pbmRleCA9IGxpbmUuaW5kZXhPZihkZWxpbWl0ZXIpXG4gICAgICAgICAgd2hpbGUgZW5kX2luZGV4ID09IC0xXG4gICAgICAgICAgICBlbmQgPSBlbmQgKyAxXG4gICAgICAgICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGVuZClcbiAgICAgICAgICAgIGVuZF9pbmRleCA9IGxpbmUuaW5kZXhPZihkZWxpbWl0ZXIpXG5cbiAgICAgICAgIyBXZSBhcmUgdGhlIGVuZCBvZiB0aGUgYmxvY2tcbiAgICAgICAgZWxzZSBpZiByZWdleFBhdHRlcm5JbigvcHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuZW5kLiovLCBzY29wZXMpXG4gICAgICAgICAgZW5kX2luZGV4ID0gbGluZS5pbmRleE9mKGRlbGltaXRlcilcbiAgICAgICAgICB3aGlsZSBzdGFydF9pbmRleCA9PSAtMVxuICAgICAgICAgICAgc3RhcnQgPSBzdGFydCAtIDFcbiAgICAgICAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coc3RhcnQpXG4gICAgICAgICAgICBzdGFydF9pbmRleCA9IGxpbmUuaW5kZXhPZihkZWxpbWl0ZXIpXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIyBXZSBhcmUgbmVpdGhlciBhdCB0aGUgYmVnaW5uaW5nIG9yIHRoZSBlbmQgb2YgdGhlIGJsb2NrXG4gICAgICAgIHdoaWxlIGVuZF9pbmRleCA9PSAtMVxuICAgICAgICAgIGVuZCA9IGVuZCArIDFcbiAgICAgICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGVuZClcbiAgICAgICAgICBlbmRfaW5kZXggPSBsaW5lLmluZGV4T2YoZGVsaW1pdGVyKVxuICAgICAgICB3aGlsZSBzdGFydF9pbmRleCA9PSAtMVxuICAgICAgICAgIHN0YXJ0ID0gc3RhcnQgLSAxXG4gICAgICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhzdGFydClcbiAgICAgICAgICBzdGFydF9pbmRleCA9IGxpbmUuaW5kZXhPZihkZWxpbWl0ZXIpXG5cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgncHl0aG9uLXRvb2xzLnNtYXJ0QmxvY2tTZWxlY3Rpb24nKVxuICAgICAgICAjIFNtYXJ0IGJsb2NrIHNlbGVjdGlvbnNcbiAgICAgICAgc2VsZWN0aW9ucyA9IFtuZXcgUmFuZ2UoXG4gICAgICAgICAgbmV3IFBvaW50KHN0YXJ0LCBzdGFydF9pbmRleCArIGRlbGltaXRlci5sZW5ndGgpLFxuICAgICAgICAgIG5ldyBQb2ludChzdGFydCwgZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHN0YXJ0KS5sZW5ndGgpLFxuICAgICAgICApXVxuXG4gICAgICAgIGZvciBpIGluIFtzdGFydCArIDEgLi4uIGVuZF0gYnkgMVxuICAgICAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coaSlcbiAgICAgICAgICB0cmltbWVkID0gbGluZS5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpICAjIGxlZnQgdHJpbVxuICAgICAgICAgIHNlbGVjdGlvbnMucHVzaChuZXcgUmFuZ2UoXG4gICAgICAgICAgICBuZXcgUG9pbnQoaSwgbGluZS5sZW5ndGggLSB0cmltbWVkLmxlbmd0aCksXG4gICAgICAgICAgICBuZXcgUG9pbnQoaSwgbGluZS5sZW5ndGgpLFxuICAgICAgICAgICkpXG5cbiAgICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhlbmQpXG4gICAgICAgIHRyaW1tZWQgPSBsaW5lLnJlcGxhY2UoL15cXHMrLywgXCJcIikgICMgbGVmdCB0cmltXG5cbiAgICAgICAgc2VsZWN0aW9ucy5wdXNoKG5ldyBSYW5nZShcbiAgICAgICAgICBuZXcgUG9pbnQoZW5kLCBsaW5lLmxlbmd0aCAtIHRyaW1tZWQubGVuZ3RoKSxcbiAgICAgICAgICBuZXcgUG9pbnQoZW5kLCBlbmRfaW5kZXgpLFxuICAgICAgICApKVxuXG4gICAgICAgIGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcyhzZWxlY3Rpb25zLmZpbHRlciAocmFuZ2UpIC0+IG5vdCByYW5nZS5pc0VtcHR5KCkpXG4gICAgICBlbHNlXG4gICAgICAgIGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKG5ldyBSYW5nZShcbiAgICAgICAgICBuZXcgUG9pbnQoc3RhcnQsIHN0YXJ0X2luZGV4ICsgZGVsaW1pdGVyLmxlbmd0aCksXG4gICAgICAgICAgbmV3IFBvaW50KGVuZCwgZW5kX2luZGV4KSxcbiAgICAgICAgKSlcblxuICBoYW5kbGVKZWRpVG9vbHNSZXNwb25zZTogKHJlc3BvbnNlKSAtPlxuICAgIGlmICdlcnJvcicgb2YgcmVzcG9uc2VcbiAgICAgIGNvbnNvbGUuZXJyb3IocmVzcG9uc2VbJ2Vycm9yJ10pXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IocmVzcG9uc2VbJ2Vycm9yJ10pXG4gICAgICByZXR1cm5cblxuICAgIGlmIHJlc3BvbnNlWydkZWZpbml0aW9ucyddLmxlbmd0aCA+IDBcbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gICAgICBpZiByZXNwb25zZVsndHlwZSddID09ICd1c2FnZXMnXG4gICAgICAgIHBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIHNlbGVjdGlvbnMgPSBbXVxuICAgICAgICBmb3IgaXRlbSBpbiByZXNwb25zZVsnZGVmaW5pdGlvbnMnXVxuICAgICAgICAgIGlmIGl0ZW1bJ3BhdGgnXSA9PSBwYXRoXG4gICAgICAgICAgICBzZWxlY3Rpb25zLnB1c2gobmV3IFJhbmdlKFxuICAgICAgICAgICAgICBuZXcgUG9pbnQoaXRlbVsnbGluZSddIC0gMSwgaXRlbVsnY29sJ10pLFxuICAgICAgICAgICAgICBuZXcgUG9pbnQoaXRlbVsnbGluZSddIC0gMSwgaXRlbVsnY29sJ10gKyBpdGVtWyduYW1lJ10ubGVuZ3RoKSwgICMgVXNlIHN0cmluZyBsZW5ndGhcbiAgICAgICAgICAgICkpXG5cbiAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKHNlbGVjdGlvbnMpXG5cbiAgICAgIGVsc2UgaWYgcmVzcG9uc2VbJ3R5cGUnXSA9PSAnZ290b0RlZidcbiAgICAgICAgZmlyc3RfZGVmID0gcmVzcG9uc2VbJ2RlZmluaXRpb25zJ11bMF1cblxuICAgICAgICBsaW5lID0gZmlyc3RfZGVmWydsaW5lJ11cbiAgICAgICAgY29sdW1uID0gZmlyc3RfZGVmWydjb2wnXVxuXG4gICAgICAgIGlmIGxpbmUgIT0gbnVsbCBhbmQgY29sdW1uICE9IG51bGxcbiAgICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgICAgaW5pdGlhbExpbmU6IGxpbmUsXG4gICAgICAgICAgICBpbml0aWFsQ29sdW1uOiBjb2x1bW4sXG4gICAgICAgICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlyc3RfZGVmWydwYXRoJ10sIG9wdGlvbnMpLnRoZW4oKGVkaXRvcikgLT5cbiAgICAgICAgICAgIGVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKClcbiAgICAgICAgICApXG4gICAgICBlbHNlXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgICBcInB5dGhvbi10b29scyBlcnJvci4gI3t0aGlzLl9pc3N1ZVJlcG9ydExpbmt9XCIsIHtcbiAgICAgICAgICAgIGRldGFpbDogSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpLFxuICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICBlbHNlXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcInB5dGhvbi10b29scyBjb3VsZCBub3QgZmluZCBhbnkgcmVzdWx0cyFcIilcblxuICBqZWRpVG9vbHNSZXF1ZXN0OiAodHlwZSkgLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBncmFtbWFyID0gZWRpdG9yLmdldEdyYW1tYXIoKVxuXG4gICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgcGF5bG9hZCA9IHtcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBwYXRoOiBlZGl0b3IuZ2V0UGF0aCgpLFxuICAgICAgc291cmNlOiBlZGl0b3IuZ2V0VGV4dCgpLFxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93LFxuICAgICAgY29sOiBidWZmZXJQb3NpdGlvbi5jb2x1bW4sXG4gICAgICBwcm9qZWN0X3BhdGhzOiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgIH1cblxuICAgICMgVGhpcyBpcyBuZWVkZWQgZm9yIHRoZSBwcm9taXNlIHRvIHdvcmsgY29ycmVjdGx5XG4gICAgaGFuZGxlSmVkaVRvb2xzUmVzcG9uc2UgPSB0aGlzLmhhbmRsZUplZGlUb29sc1Jlc3BvbnNlXG4gICAgcmVhZGxpbmUgPSB0aGlzLnJlYWRsaW5lXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIHJlc3BvbnNlID0gcmVhZGxpbmUucXVlc3Rpb24oXCIje0pTT04uc3RyaW5naWZ5KHBheWxvYWQpfVxcblwiLCAocmVzcG9uc2UpIC0+XG4gICAgICAgIGhhbmRsZUplZGlUb29sc1Jlc3BvbnNlKEpTT04ucGFyc2UocmVzcG9uc2UpKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIClcbiAgICApXG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHl0aG9uVG9vbHNcbiJdfQ==
