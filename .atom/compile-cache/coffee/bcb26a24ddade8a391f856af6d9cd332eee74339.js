(function() {
  var grammarTest, path;

  path = require('path');

  grammarTest = require('atom-grammar-test');

  describe('Grammar', function() {
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-babel');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-todo');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-hyperlink');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-mustache');
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('language-html');
      });
    });
    grammarTest(path.join(__dirname, 'fixtures/grammar/private-fields.js'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/babel-sublime/flow.js'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/babel-sublime/js-class.js'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/babel-sublime/js-functions.js'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/babel-sublime/js-symbols.js'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/babel-sublime/js-template-strings.js'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/babel-sublime/jsx-attributes.jsx'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/babel-sublime/jsx-es6.jsx'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/babel-sublime/jsx-features.jsx'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/babel-sublime/jsx-full-react-class.jsx'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/babel-sublime/jsx-text.jsx'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/declare.js'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/large files/browser-polyfill.js'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/large files/jquery-2.1.4.js'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/large files/bundle.js'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/large files/jquery-2.1.4.min.js'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/everythingJs/es2015-module.js'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/doc-keywords.js'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/flow-predicates.js'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/issues.js'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/misc.js'));
    grammarTest(path.join(__dirname, 'fixtures/grammar/es6module.js'));
    return grammarTest(path.join(__dirname, 'fixtures/grammar/graphql.js'));
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWJhYmVsL3NwZWMvZ3JhbW1hci1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFdBQUEsR0FBYyxPQUFBLENBQVEsbUJBQVI7O0VBRWQsUUFBQSxDQUFTLFNBQVQsRUFBb0IsU0FBQTtJQUNsQixVQUFBLENBQVcsU0FBQTtNQUNULGVBQUEsQ0FBZ0IsU0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixnQkFBOUI7TUFEYyxDQUFoQjtNQUVBLGVBQUEsQ0FBZ0IsU0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixlQUE5QjtNQURjLENBQWhCO01BRUEsZUFBQSxDQUFnQixTQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLG9CQUE5QjtNQURjLENBQWhCO01BRUEsZUFBQSxDQUFnQixTQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLG1CQUE5QjtNQURjLENBQWhCO2FBRUEsZUFBQSxDQUFnQixTQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGVBQTlCO01BRGMsQ0FBaEI7SUFUUyxDQUFYO0lBYUEsV0FBQSxDQUFZLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixvQ0FBckIsQ0FBWjtJQUdBLFdBQUEsQ0FBWSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsd0NBQXJCLENBQVo7SUFDQSxXQUFBLENBQVksSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLDRDQUFyQixDQUFaO0lBQ0EsV0FBQSxDQUFZLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixnREFBckIsQ0FBWjtJQUNBLFdBQUEsQ0FBWSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsOENBQXJCLENBQVo7SUFDQSxXQUFBLENBQVksSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLHVEQUFyQixDQUFaO0lBQ0EsV0FBQSxDQUFZLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixtREFBckIsQ0FBWjtJQUNBLFdBQUEsQ0FBWSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsNENBQXJCLENBQVo7SUFDQSxXQUFBLENBQVksSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLGlEQUFyQixDQUFaO0lBQ0EsV0FBQSxDQUFZLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQix5REFBckIsQ0FBWjtJQUNBLFdBQUEsQ0FBWSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsNkNBQXJCLENBQVo7SUFHQSxXQUFBLENBQVksSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLDZCQUFyQixDQUFaO0lBR0EsV0FBQSxDQUFZLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixrREFBckIsQ0FBWjtJQUNBLFdBQUEsQ0FBWSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsOENBQXJCLENBQVo7SUFDQSxXQUFBLENBQVksSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLHdDQUFyQixDQUFaO0lBQ0EsV0FBQSxDQUFZLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixrREFBckIsQ0FBWjtJQUdBLFdBQUEsQ0FBWSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsZ0RBQXJCLENBQVo7SUFHQSxXQUFBLENBQVksSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLGtDQUFyQixDQUFaO0lBR0EsV0FBQSxDQUFZLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixxQ0FBckIsQ0FBWjtJQUdBLFdBQUEsQ0FBWSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsNEJBQXJCLENBQVo7SUFHQSxXQUFBLENBQVksSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLDBCQUFyQixDQUFaO0lBQ0EsV0FBQSxDQUFZLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQiwrQkFBckIsQ0FBWjtXQUdBLFdBQUEsQ0FBWSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsNkJBQXJCLENBQVo7RUF0RGtCLENBQXBCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcbmdyYW1tYXJUZXN0ID0gcmVxdWlyZSAnYXRvbS1ncmFtbWFyLXRlc3QnXG5cbmRlc2NyaWJlICdHcmFtbWFyJywgLT5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWJhYmVsJylcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS10b2RvJylcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1oeXBlcmxpbmsnKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLW11c3RhY2hlJylcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1odG1sJylcblxuICAjIHRlc3QgcHJpdmF0ZSBjbGFzcyBmaWVsZHMgYW5kIG1ldGhvZHNcbiAgZ3JhbW1hclRlc3QgcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzL2dyYW1tYXIvcHJpdmF0ZS1maWVsZHMuanMnKVxuXG4gICMgYmFiZWwtc3VibGltZSB0ZXN0IGZpbGVzXG4gIGdyYW1tYXJUZXN0IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcy9ncmFtbWFyL2JhYmVsLXN1YmxpbWUvZmxvdy5qcycpXG4gIGdyYW1tYXJUZXN0IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcy9ncmFtbWFyL2JhYmVsLXN1YmxpbWUvanMtY2xhc3MuanMnKVxuICBncmFtbWFyVGVzdCBwYXRoLmpvaW4oX19kaXJuYW1lLCAnZml4dHVyZXMvZ3JhbW1hci9iYWJlbC1zdWJsaW1lL2pzLWZ1bmN0aW9ucy5qcycpXG4gIGdyYW1tYXJUZXN0IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcy9ncmFtbWFyL2JhYmVsLXN1YmxpbWUvanMtc3ltYm9scy5qcycpXG4gIGdyYW1tYXJUZXN0IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcy9ncmFtbWFyL2JhYmVsLXN1YmxpbWUvanMtdGVtcGxhdGUtc3RyaW5ncy5qcycpXG4gIGdyYW1tYXJUZXN0IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcy9ncmFtbWFyL2JhYmVsLXN1YmxpbWUvanN4LWF0dHJpYnV0ZXMuanN4JylcbiAgZ3JhbW1hclRlc3QgcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzL2dyYW1tYXIvYmFiZWwtc3VibGltZS9qc3gtZXM2LmpzeCcpXG4gIGdyYW1tYXJUZXN0IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcy9ncmFtbWFyL2JhYmVsLXN1YmxpbWUvanN4LWZlYXR1cmVzLmpzeCcpXG4gIGdyYW1tYXJUZXN0IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcy9ncmFtbWFyL2JhYmVsLXN1YmxpbWUvanN4LWZ1bGwtcmVhY3QtY2xhc3MuanN4JylcbiAgZ3JhbW1hclRlc3QgcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzL2dyYW1tYXIvYmFiZWwtc3VibGltZS9qc3gtdGV4dC5qc3gnKVxuXG4gICMgZmxvdyBkZWNsYXJhdGlvbiBmaWxlXG4gIGdyYW1tYXJUZXN0IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcy9ncmFtbWFyL2RlY2xhcmUuanMnKVxuXG4gICMgZ3JhbW1hciB0ZXN0IGxhcmdlIGZpbGVzXG4gIGdyYW1tYXJUZXN0IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcy9ncmFtbWFyL2xhcmdlIGZpbGVzL2Jyb3dzZXItcG9seWZpbGwuanMnKVxuICBncmFtbWFyVGVzdCBwYXRoLmpvaW4oX19kaXJuYW1lLCAnZml4dHVyZXMvZ3JhbW1hci9sYXJnZSBmaWxlcy9qcXVlcnktMi4xLjQuanMnKVxuICBncmFtbWFyVGVzdCBwYXRoLmpvaW4oX19kaXJuYW1lLCAnZml4dHVyZXMvZ3JhbW1hci9sYXJnZSBmaWxlcy9idW5kbGUuanMnKVxuICBncmFtbWFyVGVzdCBwYXRoLmpvaW4oX19kaXJuYW1lLCAnZml4dHVyZXMvZ3JhbW1hci9sYXJnZSBmaWxlcy9qcXVlcnktMi4xLjQubWluLmpzJylcblxuICAjICMgZXMyMDE1IGNoZWNrXG4gIGdyYW1tYXJUZXN0IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcy9ncmFtbWFyL2V2ZXJ5dGhpbmdKcy9lczIwMTUtbW9kdWxlLmpzJylcblxuICAjIHRvZG8sanNkb2MsLi4uXG4gIGdyYW1tYXJUZXN0IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcy9ncmFtbWFyL2RvYy1rZXl3b3Jkcy5qcycpXG5cbiAgIyBmbG93IHByZWRpY2F0ZXMuLi5cbiAgZ3JhbW1hclRlc3QgcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzL2dyYW1tYXIvZmxvdy1wcmVkaWNhdGVzLmpzJylcblxuICAjIGlzc3VlcyByYWlzZWRcbiAgZ3JhbW1hclRlc3QgcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzL2dyYW1tYXIvaXNzdWVzLmpzJylcblxuICAjIG1pc2MgVGVzdHNcbiAgZ3JhbW1hclRlc3QgcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzL2dyYW1tYXIvbWlzYy5qcycpXG4gIGdyYW1tYXJUZXN0IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcy9ncmFtbWFyL2VzNm1vZHVsZS5qcycpXG5cbiAgIyBncmFwaHFsIHRlc3RcbiAgZ3JhbW1hclRlc3QgcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzL2dyYW1tYXIvZ3JhcGhxbC5qcycpXG4iXX0=
