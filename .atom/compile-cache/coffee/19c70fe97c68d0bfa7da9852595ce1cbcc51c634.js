(function() {
  var packagesToTest;

  packagesToTest = {
    Python: {
      name: 'language-python',
      file: 'test.py'
    }
  };

  describe('Python autocompletions', function() {
    var editor, getCompletions, provider, _ref;
    _ref = [], editor = _ref[0], provider = _ref[1];
    getCompletions = function() {
      var cursor, end, prefix, request, start;
      cursor = editor.getLastCursor();
      start = cursor.getBeginningOfCurrentWordBufferPosition();
      end = cursor.getBufferPosition();
      prefix = editor.getTextInRange([start, end]);
      request = {
        editor: editor,
        bufferPosition: end,
        scopeDescriptor: cursor.getScopeDescriptor(),
        prefix: prefix
      };
      return provider.getSuggestions(request);
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('autocomplete-python');
      });
      return runs(function() {
        return provider = atom.packages.getActivePackage('autocomplete-python').mainModule.getProvider();
      });
    });
    return Object.keys(packagesToTest).forEach(function(packageLabel) {
      return describe("" + packageLabel + " files", function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(packagesToTest[packageLabel].name);
          });
          waitsForPromise(function() {
            return atom.workspace.open(packagesToTest[packageLabel].file);
          });
          return runs(function() {
            return editor = atom.workspace.getActiveTextEditor();
          });
        });
        it('autocompletes builtins', function() {
          var completions;
          editor.setText('isinstanc');
          editor.setCursorBufferPosition([1, 0]);
          completions = getCompletions();
          return waitsForPromise(function() {
            return getCompletions().then(function(completions) {
              var completion, _i, _len;
              for (_i = 0, _len = completions.length; _i < _len; _i++) {
                completion = completions[_i];
                expect(completion.text.length).toBeGreaterThan(0);
                expect(completion.text).toBe('isinstance');
              }
              return expect(completions.length).toBe(1);
            });
          });
        });
        it('autocompletes python keywords', function() {
          var completions;
          editor.setText('impo');
          editor.setCursorBufferPosition([1, 0]);
          completions = getCompletions();
          return waitsForPromise(function() {
            return getCompletions().then(function(completions) {
              var completion, _i, _len;
              for (_i = 0, _len = completions.length; _i < _len; _i++) {
                completion = completions[_i];
                if (completion.type === 'keyword') {
                  expect(completion.text).toBe('import');
                }
                expect(completion.text.length).toBeGreaterThan(0);
              }
              console.log(completions);
              return expect(completions.length).toBe(3);
            });
          });
        });
        return it('autocompletes defined functions', function() {
          var completions;
          editor.setText("def hello_world():\n  return True\nhell");
          editor.setCursorBufferPosition([3, 0]);
          completions = getCompletions();
          return waitsForPromise(function() {
            return getCompletions().then(function(completions) {
              expect(completions[0].text).toBe('hello_world');
              return expect(completions.length).toBe(1);
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vc3BlYy9wcm92aWRlci1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxjQUFBOztBQUFBLEVBQUEsY0FBQSxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLElBQUEsRUFBTSxpQkFBTjtBQUFBLE1BQ0EsSUFBQSxFQUFNLFNBRE47S0FERjtHQURGLENBQUE7O0FBQUEsRUFLQSxRQUFBLENBQVMsd0JBQVQsRUFBbUMsU0FBQSxHQUFBO0FBQ2pDLFFBQUEsc0NBQUE7QUFBQSxJQUFBLE9BQXFCLEVBQXJCLEVBQUMsZ0JBQUQsRUFBUyxrQkFBVCxDQUFBO0FBQUEsSUFFQSxjQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLFVBQUEsbUNBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsYUFBUCxDQUFBLENBQVQsQ0FBQTtBQUFBLE1BQ0EsS0FBQSxHQUFRLE1BQU0sQ0FBQyx1Q0FBUCxDQUFBLENBRFIsQ0FBQTtBQUFBLE1BRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBRk4sQ0FBQTtBQUFBLE1BR0EsTUFBQSxHQUFTLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsS0FBRCxFQUFRLEdBQVIsQ0FBdEIsQ0FIVCxDQUFBO0FBQUEsTUFJQSxPQUFBLEdBQ0U7QUFBQSxRQUFBLE1BQUEsRUFBUSxNQUFSO0FBQUEsUUFDQSxjQUFBLEVBQWdCLEdBRGhCO0FBQUEsUUFFQSxlQUFBLEVBQWlCLE1BQU0sQ0FBQyxrQkFBUCxDQUFBLENBRmpCO0FBQUEsUUFHQSxNQUFBLEVBQVEsTUFIUjtPQUxGLENBQUE7YUFTQSxRQUFRLENBQUMsY0FBVCxDQUF3QixPQUF4QixFQVZlO0lBQUEsQ0FGakIsQ0FB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

//# sourceURL=/home/mowens/.atom/packages/autocomplete-python/spec/provider-spec.coffee
