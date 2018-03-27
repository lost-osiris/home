(function() {
  var packagesToTest;

  packagesToTest = {
    Python: {
      name: 'language-python',
      file: 'test.py'
    }
  };

  describe('Python autocompletions', function() {
    var editor, getCompletions, provider, ref;
    ref = [], editor = ref[0], provider = ref[1];
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
        return atom.packages.activatePackage('language-python');
      });
      waitsForPromise(function() {
        return atom.workspace.open('test.py');
      });
      runs(function() {
        editor = atom.workspace.getActiveTextEditor();
        editor.setGrammar(atom.grammars.grammarsByScopeName['source.python']);
        return atom.packages.loadPackage('autocomplete-python').activationHooks = [];
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('autocomplete-python');
      });
      runs(function() {
        return atom.packages.getActivePackage('autocomplete-python').mainModule.load();
      });
      return runs(function() {
        return provider = atom.packages.getActivePackage('autocomplete-python').mainModule.getProvider();
      });
    });
    it('autocompletes builtins', function() {
      editor.setText('isinstanc');
      editor.setCursorBufferPosition([1, 0]);
      return waitsForPromise(function() {
        return getCompletions().then(function(completions) {
          var completion, i, len;
          for (i = 0, len = completions.length; i < len; i++) {
            completion = completions[i];
            expect(completion.text.length).toBeGreaterThan(0);
            expect(completion.text).toBe('isinstance');
          }
          return expect(completions.length).toBe(1);
        });
      });
    });
    it('autocompletes python keywords', function() {
      var completion, completions, i, len;
      editor.setText('impo');
      editor.setCursorBufferPosition([1, 0]);
      completions = getCompletions();
      for (i = 0, len = completions.length; i < len; i++) {
        completion = completions[i];
        if (completion.type === 'keyword') {
          expect(completion.text).toBe('import');
        }
        expect(completion.text.length).toBeGreaterThan(0);
      }
      return expect(completions.length).toBe(3);
    });
    return it('autocompletes defined functions', function() {
      editor.setText("def hello_world():\n  return True\nhell");
      editor.setCursorBufferPosition([3, 0]);
      return waitsForPromise(function() {
        return getCompletions().then(function(completions) {
          expect(completions[0].text).toBe('hello_world');
          return expect(completions.length).toBe(1);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vc3BlYy9wcm92aWRlci1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsY0FBQSxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsSUFBQSxFQUFNLGlCQUFOO01BQ0EsSUFBQSxFQUFNLFNBRE47S0FERjs7O0VBSUYsUUFBQSxDQUFTLHdCQUFULEVBQW1DLFNBQUE7QUFDakMsUUFBQTtJQUFBLE1BQXFCLEVBQXJCLEVBQUMsZUFBRCxFQUFTO0lBRVQsY0FBQSxHQUFpQixTQUFBO0FBQ2YsVUFBQTtNQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsYUFBUCxDQUFBO01BQ1QsS0FBQSxHQUFRLE1BQU0sQ0FBQyx1Q0FBUCxDQUFBO01BQ1IsR0FBQSxHQUFNLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO01BQ04sTUFBQSxHQUFTLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsS0FBRCxFQUFRLEdBQVIsQ0FBdEI7TUFDVCxPQUFBLEdBQ0U7UUFBQSxNQUFBLEVBQVEsTUFBUjtRQUNBLGNBQUEsRUFBZ0IsR0FEaEI7UUFFQSxlQUFBLEVBQWlCLE1BQU0sQ0FBQyxrQkFBUCxDQUFBLENBRmpCO1FBR0EsTUFBQSxFQUFRLE1BSFI7O2FBSUYsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsT0FBeEI7SUFWZTtJQVlqQixVQUFBLENBQVcsU0FBQTtNQUNULGVBQUEsQ0FBZ0IsU0FBQTtlQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixpQkFBOUI7TUFBSCxDQUFoQjtNQUNBLGVBQUEsQ0FBZ0IsU0FBQTtlQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixTQUFwQjtNQUFILENBQWhCO01BQ0EsSUFBQSxDQUFLLFNBQUE7UUFDSCxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO1FBQ1QsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBb0IsQ0FBQSxlQUFBLENBQXBEO2VBQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFkLENBQTBCLHFCQUExQixDQUFnRCxDQUFDLGVBQWpELEdBQW1FO01BSGhFLENBQUw7TUFJQSxlQUFBLENBQWdCLFNBQUE7ZUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIscUJBQTlCO01BQUgsQ0FBaEI7TUFDQSxJQUFBLENBQUssU0FBQTtlQUNILElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IscUJBQS9CLENBQXFELENBQUMsVUFBVSxDQUFDLElBQWpFLENBQUE7TUFERyxDQUFMO2FBRUEsSUFBQSxDQUFLLFNBQUE7ZUFBRyxRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUNqQixxQkFEaUIsQ0FDSyxDQUFDLFVBQVUsQ0FBQyxXQURqQixDQUFBO01BQWQsQ0FBTDtJQVZTLENBQVg7SUFhQSxFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQTtNQUMzQixNQUFNLENBQUMsT0FBUCxDQUFlLFdBQWY7TUFDQSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUEvQjthQUNBLGVBQUEsQ0FBZ0IsU0FBQTtlQUNkLGNBQUEsQ0FBQSxDQUFnQixDQUFDLElBQWpCLENBQXNCLFNBQUMsV0FBRDtBQUNwQixjQUFBO0FBQUEsZUFBQSw2Q0FBQTs7WUFDRSxNQUFBLENBQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxNQUF2QixDQUE4QixDQUFDLGVBQS9CLENBQStDLENBQS9DO1lBQ0EsTUFBQSxDQUFPLFVBQVUsQ0FBQyxJQUFsQixDQUF1QixDQUFDLElBQXhCLENBQTZCLFlBQTdCO0FBRkY7aUJBR0EsTUFBQSxDQUFPLFdBQVcsQ0FBQyxNQUFuQixDQUEwQixDQUFDLElBQTNCLENBQWdDLENBQWhDO1FBSm9CLENBQXRCO01BRGMsQ0FBaEI7SUFIMkIsQ0FBN0I7SUFVQSxFQUFBLENBQUcsK0JBQUgsRUFBb0MsU0FBQTtBQUNsQyxVQUFBO01BQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxNQUFmO01BQ0EsTUFBTSxDQUFDLHVCQUFQLENBQStCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBL0I7TUFDQSxXQUFBLEdBQWMsY0FBQSxDQUFBO0FBQ2QsV0FBQSw2Q0FBQTs7UUFDRSxJQUFHLFVBQVUsQ0FBQyxJQUFYLEtBQW1CLFNBQXRCO1VBQ0UsTUFBQSxDQUFPLFVBQVUsQ0FBQyxJQUFsQixDQUF1QixDQUFDLElBQXhCLENBQTZCLFFBQTdCLEVBREY7O1FBRUEsTUFBQSxDQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBdkIsQ0FBOEIsQ0FBQyxlQUEvQixDQUErQyxDQUEvQztBQUhGO2FBSUEsTUFBQSxDQUFPLFdBQVcsQ0FBQyxNQUFuQixDQUEwQixDQUFDLElBQTNCLENBQWdDLENBQWhDO0lBUmtDLENBQXBDO1dBVUEsRUFBQSxDQUFHLGlDQUFILEVBQXNDLFNBQUE7TUFDcEMsTUFBTSxDQUFDLE9BQVAsQ0FBZSx5Q0FBZjtNQUtBLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQS9CO2FBQ0EsZUFBQSxDQUFnQixTQUFBO2VBQ2QsY0FBQSxDQUFBLENBQWdCLENBQUMsSUFBakIsQ0FBc0IsU0FBQyxXQUFEO1VBQ3BCLE1BQUEsQ0FBTyxXQUFZLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBdEIsQ0FBMkIsQ0FBQyxJQUE1QixDQUFpQyxhQUFqQztpQkFDQSxNQUFBLENBQU8sV0FBVyxDQUFDLE1BQW5CLENBQTBCLENBQUMsSUFBM0IsQ0FBZ0MsQ0FBaEM7UUFGb0IsQ0FBdEI7TUFEYyxDQUFoQjtJQVBvQyxDQUF0QztFQWhEaUMsQ0FBbkM7QUFMQSIsInNvdXJjZXNDb250ZW50IjpbInBhY2thZ2VzVG9UZXN0ID1cbiAgUHl0aG9uOlxuICAgIG5hbWU6ICdsYW5ndWFnZS1weXRob24nXG4gICAgZmlsZTogJ3Rlc3QucHknXG5cbmRlc2NyaWJlICdQeXRob24gYXV0b2NvbXBsZXRpb25zJywgLT5cbiAgW2VkaXRvciwgcHJvdmlkZXJdID0gW11cblxuICBnZXRDb21wbGV0aW9ucyA9IC0+XG4gICAgY3Vyc29yID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuICAgIHN0YXJ0ID0gY3Vyc29yLmdldEJlZ2lubmluZ09mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbigpXG4gICAgZW5kID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBwcmVmaXggPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW3N0YXJ0LCBlbmRdKVxuICAgIHJlcXVlc3QgPVxuICAgICAgZWRpdG9yOiBlZGl0b3JcbiAgICAgIGJ1ZmZlclBvc2l0aW9uOiBlbmRcbiAgICAgIHNjb3BlRGVzY3JpcHRvcjogY3Vyc29yLmdldFNjb3BlRGVzY3JpcHRvcigpXG4gICAgICBwcmVmaXg6IHByZWZpeFxuICAgIHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zKHJlcXVlc3QpXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtcHl0aG9uJylcbiAgICB3YWl0c0ZvclByb21pc2UgLT4gYXRvbS53b3Jrc3BhY2Uub3BlbigndGVzdC5weScpXG4gICAgcnVucyAtPlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBlZGl0b3Iuc2V0R3JhbW1hcihhdG9tLmdyYW1tYXJzLmdyYW1tYXJzQnlTY29wZU5hbWVbJ3NvdXJjZS5weXRob24nXSlcbiAgICAgIGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoJ2F1dG9jb21wbGV0ZS1weXRob24nKS5hY3RpdmF0aW9uSG9va3MgPSBbXVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYXV0b2NvbXBsZXRlLXB5dGhvbicpXG4gICAgcnVucyAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCdhdXRvY29tcGxldGUtcHl0aG9uJykubWFpbk1vZHVsZS5sb2FkKClcbiAgICBydW5zIC0+IHByb3ZpZGVyID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKFxuICAgICAgJ2F1dG9jb21wbGV0ZS1weXRob24nKS5tYWluTW9kdWxlLmdldFByb3ZpZGVyKClcblxuICBpdCAnYXV0b2NvbXBsZXRlcyBidWlsdGlucycsIC0+XG4gICAgZWRpdG9yLnNldFRleHQgJ2lzaW5zdGFuYydcbiAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzEsIDBdKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgZ2V0Q29tcGxldGlvbnMoKS50aGVuIChjb21wbGV0aW9ucykgLT5cbiAgICAgICAgZm9yIGNvbXBsZXRpb24gaW4gY29tcGxldGlvbnNcbiAgICAgICAgICBleHBlY3QoY29tcGxldGlvbi50ZXh0Lmxlbmd0aCkudG9CZUdyZWF0ZXJUaGFuIDBcbiAgICAgICAgICBleHBlY3QoY29tcGxldGlvbi50ZXh0KS50b0JlICdpc2luc3RhbmNlJ1xuICAgICAgICBleHBlY3QoY29tcGxldGlvbnMubGVuZ3RoKS50b0JlIDFcblxuICBpdCAnYXV0b2NvbXBsZXRlcyBweXRob24ga2V5d29yZHMnLCAtPlxuICAgIGVkaXRvci5zZXRUZXh0ICdpbXBvJ1xuICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMSwgMF0pXG4gICAgY29tcGxldGlvbnMgPSBnZXRDb21wbGV0aW9ucygpXG4gICAgZm9yIGNvbXBsZXRpb24gaW4gY29tcGxldGlvbnNcbiAgICAgIGlmIGNvbXBsZXRpb24udHlwZSA9PSAna2V5d29yZCdcbiAgICAgICAgZXhwZWN0KGNvbXBsZXRpb24udGV4dCkudG9CZSAnaW1wb3J0J1xuICAgICAgZXhwZWN0KGNvbXBsZXRpb24udGV4dC5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbiAwXG4gICAgZXhwZWN0KGNvbXBsZXRpb25zLmxlbmd0aCkudG9CZSAzXG5cbiAgaXQgJ2F1dG9jb21wbGV0ZXMgZGVmaW5lZCBmdW5jdGlvbnMnLCAtPlxuICAgIGVkaXRvci5zZXRUZXh0IFwiXCJcIlxuICAgICAgZGVmIGhlbGxvX3dvcmxkKCk6XG4gICAgICAgIHJldHVybiBUcnVlXG4gICAgICBoZWxsXG4gICAgXCJcIlwiXG4gICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFszLCAwXSlcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGdldENvbXBsZXRpb25zKCkudGhlbiAoY29tcGxldGlvbnMpIC0+XG4gICAgICAgIGV4cGVjdChjb21wbGV0aW9uc1swXS50ZXh0KS50b0JlICdoZWxsb193b3JsZCdcbiAgICAgICAgZXhwZWN0KGNvbXBsZXRpb25zLmxlbmd0aCkudG9CZSAxXG4iXX0=
