(function() {
  var cssDocsURL, firstCharsEqual, firstInlinePropertyNameWithColonPattern, fs, hasScope, importantPrefixPattern, inlinePropertyNameWithColonPattern, lineEndsWithSemicolon, makeSnippet, path, pesudoSelectorPrefixPattern, propertyNamePrefixPattern, propertyNameWithColonPattern, tagSelectorPrefixPattern;

  fs = require('fs');

  path = require('path');

  firstInlinePropertyNameWithColonPattern = /{\s*(\S+)\s*:/;

  inlinePropertyNameWithColonPattern = /(?:;.+?)*;\s*(\S+)\s*:/;

  propertyNameWithColonPattern = /^\s*(\S+)\s*:/;

  propertyNamePrefixPattern = /[a-zA-Z]+[-a-zA-Z]*$/;

  pesudoSelectorPrefixPattern = /:(:)?([a-z]+[a-z-]*)?$/;

  tagSelectorPrefixPattern = /(^|\s|,)([a-z]+)?$/;

  importantPrefixPattern = /(![a-z]+)$/;

  cssDocsURL = "https://developer.mozilla.org/en-US/docs/Web/CSS";

  module.exports = {
    selector: '.source.inside-js.css.styled, .source.css.styled',
    disableForSelector: ".source.inside-js.css.styled .comment, .source.inside-js.css.styled .string, .source.inside-js.css.styled .entity.quasi.element.js, .source.css.styled .comment, .source.css.styled .string, .source.css.styled .entity.quasi.element.js",
    filterSuggestions: true,
    inclusionPriority: 10000,
    excludeLowerPriority: true,
    getSuggestions: function(request) {
      var completions, scopes;
      completions = null;
      scopes = request.scopeDescriptor.getScopesArray();
      if (this.isCompletingValue(request)) {
        completions = this.getPropertyValueCompletions(request);
      } else if (this.isCompletingPseudoSelector(request)) {
        completions = this.getPseudoSelectorCompletions(request);
      } else {
        if (this.isCompletingName(request)) {
          completions = this.getPropertyNameCompletions(request);
        } else if (this.isCompletingNameOrTag(request)) {
          completions = this.getPropertyNameCompletions(request).concat(this.getTagCompletions(request));
        }
      }
      return completions;
    },
    onDidInsertSuggestion: function(arg) {
      var editor, suggestion;
      editor = arg.editor, suggestion = arg.suggestion;
      if (suggestion.type === 'property') {
        return setTimeout(this.triggerAutocomplete.bind(this, editor), 1);
      }
    },
    triggerAutocomplete: function(editor) {
      return atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate', {
        activatedManually: false
      });
    },
    loadProperties: function() {
      this.properties = {};
      return fs.readFile(path.resolve(__dirname, 'completions.json'), (function(_this) {
        return function(error, content) {
          var ref;
          if (error == null) {
            ref = JSON.parse(content), _this.pseudoSelectors = ref.pseudoSelectors, _this.properties = ref.properties, _this.tags = ref.tags;
          }
        };
      })(this));
    },
    isCompletingValue: function(arg) {
      var beforePrefixBufferPosition, beforePrefixScopes, beforePrefixScopesArray, bufferPosition, editor, prefix, scopeDescriptor, scopes;
      scopeDescriptor = arg.scopeDescriptor, bufferPosition = arg.bufferPosition, prefix = arg.prefix, editor = arg.editor;
      scopes = scopeDescriptor.getScopesArray();
      beforePrefixBufferPosition = [bufferPosition.row, Math.max(0, bufferPosition.column - prefix.length - 1)];
      beforePrefixScopes = editor.scopeDescriptorForBufferPosition(beforePrefixBufferPosition);
      beforePrefixScopesArray = beforePrefixScopes.getScopesArray();
      return (hasScope(scopes, 'meta.property-values.css')) || (hasScope(beforePrefixScopesArray, 'meta.property-values.css'));
    },
    isCompletingName: function(arg) {
      var bufferPosition, editor, prefix, scope, scopeDescriptor;
      scopeDescriptor = arg.scopeDescriptor, bufferPosition = arg.bufferPosition, editor = arg.editor;
      scope = scopeDescriptor.getScopesArray().slice(-1);
      prefix = this.getPropertyNamePrefix(bufferPosition, editor);
      return this.isPropertyNamePrefix(prefix) && (scope[0] === 'meta.property-list.css');
    },
    isCompletingNameOrTag: function(arg) {
      var bufferPosition, editor, prefix, scope, scopeDescriptor;
      scopeDescriptor = arg.scopeDescriptor, bufferPosition = arg.bufferPosition, editor = arg.editor;
      scope = scopeDescriptor.getScopesArray().slice(-1);
      prefix = this.getPropertyNamePrefix(bufferPosition, editor);
      return this.isPropertyNamePrefix(prefix) && ((scope[0] === 'meta.property-list.css') || (scope[0] === 'source.css.styled') || (scope[0] === 'source.inside-js.css.styled'));
    },
    isCompletingPseudoSelector: function(arg) {
      var bufferPosition, editor, scope, scopeDescriptor;
      editor = arg.editor, scopeDescriptor = arg.scopeDescriptor, bufferPosition = arg.bufferPosition;
      scope = scopeDescriptor.getScopesArray().slice(-1);
      return (scope[0] === 'constant.language.pseudo.prefixed.css') || (scope[0] === 'keyword.operator.pseudo.css');
    },
    isPropertyValuePrefix: function(prefix) {
      prefix = prefix.trim();
      return prefix.length > 0 && prefix !== ':';
    },
    isPropertyNamePrefix: function(prefix) {
      if (prefix == null) {
        return false;
      }
      prefix = prefix.trim();
      return prefix.match(/^[a-zA-Z-]+$/);
    },
    getImportantPrefix: function(editor, bufferPosition) {
      var line, ref;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return (ref = importantPrefixPattern.exec(line)) != null ? ref[1] : void 0;
    },
    getPreviousPropertyName: function(bufferPosition, editor) {
      var line, propertyName, ref, ref1, ref2, row;
      row = bufferPosition.row;
      while (row >= 0) {
        line = editor.lineTextForBufferRow(row);
        propertyName = (ref = inlinePropertyNameWithColonPattern.exec(line)) != null ? ref[1] : void 0;
        if (propertyName == null) {
          propertyName = (ref1 = firstInlinePropertyNameWithColonPattern.exec(line)) != null ? ref1[1] : void 0;
        }
        if (propertyName == null) {
          propertyName = (ref2 = propertyNameWithColonPattern.exec(line)) != null ? ref2[1] : void 0;
        }
        if (propertyName) {
          return propertyName;
        }
        row--;
      }
    },
    getPropertyValueCompletions: function(arg) {
      var addSemicolon, bufferPosition, completions, editor, i, importantPrefix, j, len, len1, prefix, property, ref, scopeDescriptor, scopes, value, values;
      bufferPosition = arg.bufferPosition, editor = arg.editor, prefix = arg.prefix, scopeDescriptor = arg.scopeDescriptor;
      property = this.getPreviousPropertyName(bufferPosition, editor);
      values = (ref = this.properties[property]) != null ? ref.values : void 0;
      if (values == null) {
        return null;
      }
      scopes = scopeDescriptor.getScopesArray();
      addSemicolon = !lineEndsWithSemicolon(bufferPosition, editor);
      completions = [];
      if (this.isPropertyValuePrefix(prefix)) {
        for (i = 0, len = values.length; i < len; i++) {
          value = values[i];
          if (firstCharsEqual(value, prefix)) {
            completions.push(this.buildPropertyValueCompletion(value, property, addSemicolon));
          }
        }
      } else {
        for (j = 0, len1 = values.length; j < len1; j++) {
          value = values[j];
          completions.push(this.buildPropertyValueCompletion(value, property, addSemicolon));
        }
      }
      if (importantPrefix = this.getImportantPrefix(editor, bufferPosition)) {
        completions.push({
          type: 'keyword',
          text: '!important',
          displayText: '!important',
          replacementPrefix: importantPrefix,
          description: "Forces this property to override any other declaration of the same property. Use with caution.",
          descriptionMoreURL: cssDocsURL + "/Specificity#The_!important_exception"
        });
      }
      return completions;
    },
    buildPropertyValueCompletion: function(value, propertyName, addSemicolon) {
      var text;
      text = value;
      if (addSemicolon) {
        text += ';';
      }
      text = makeSnippet(text);
      return {
        type: 'value',
        snippet: text,
        displayText: value,
        description: value + " value for the " + propertyName + " property",
        descriptionMoreURL: cssDocsURL + "/" + propertyName + "#Values"
      };
    },
    getPropertyNamePrefix: function(bufferPosition, editor) {
      var line, ref;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return (ref = propertyNamePrefixPattern.exec(line)) != null ? ref[0] : void 0;
    },
    getPropertyNameCompletions: function(arg) {
      var activatedManually, bufferPosition, completions, editor, line, options, prefix, property, ref, scopeDescriptor, scopes;
      bufferPosition = arg.bufferPosition, editor = arg.editor, scopeDescriptor = arg.scopeDescriptor, activatedManually = arg.activatedManually;
      scopes = scopeDescriptor.getScopesArray();
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      prefix = this.getPropertyNamePrefix(bufferPosition, editor);
      if (!(activatedManually || prefix)) {
        return [];
      }
      completions = [];
      ref = this.properties;
      for (property in ref) {
        options = ref[property];
        if (!prefix || firstCharsEqual(property, prefix)) {
          completions.push(this.buildPropertyNameCompletion(property, prefix, options));
        }
      }
      return completions;
    },
    buildPropertyNameCompletion: function(propertyName, prefix, arg) {
      var description;
      description = arg.description;
      return {
        type: 'property',
        text: propertyName + ": ",
        displayText: propertyName,
        replacementPrefix: prefix,
        description: description,
        descriptionMoreURL: cssDocsURL + "/" + propertyName
      };
    },
    getPseudoSelectorPrefix: function(editor, bufferPosition) {
      var line, ref;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return (ref = line.match(pesudoSelectorPrefixPattern)) != null ? ref[0] : void 0;
    },
    getPseudoSelectorCompletions: function(arg) {
      var bufferPosition, completions, editor, options, prefix, pseudoSelector, ref;
      bufferPosition = arg.bufferPosition, editor = arg.editor;
      prefix = this.getPseudoSelectorPrefix(editor, bufferPosition);
      if (!prefix) {
        return null;
      }
      completions = [];
      ref = this.pseudoSelectors;
      for (pseudoSelector in ref) {
        options = ref[pseudoSelector];
        if (firstCharsEqual(pseudoSelector, prefix)) {
          completions.push(this.buildPseudoSelectorCompletion(pseudoSelector, prefix, options));
        }
      }
      return completions;
    },
    buildPseudoSelectorCompletion: function(pseudoSelector, prefix, arg) {
      var argument, completion, description;
      argument = arg.argument, description = arg.description;
      completion = {
        type: 'pseudo-selector',
        replacementPrefix: prefix,
        description: description,
        descriptionMoreURL: cssDocsURL + "/" + pseudoSelector
      };
      if (argument != null) {
        completion.snippet = pseudoSelector + "(${1:" + argument + "})";
      } else {
        completion.text = pseudoSelector;
      }
      return completion;
    },
    getTagSelectorPrefix: function(editor, bufferPosition) {
      var line, ref;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return (ref = tagSelectorPrefixPattern.exec(line)) != null ? ref[2] : void 0;
    },
    getTagCompletions: function(arg) {
      var bufferPosition, completions, editor, i, len, prefix, ref, tag;
      bufferPosition = arg.bufferPosition, editor = arg.editor, prefix = arg.prefix;
      completions = [];
      if (prefix) {
        ref = this.tags;
        for (i = 0, len = ref.length; i < len; i++) {
          tag = ref[i];
          if (firstCharsEqual(tag, prefix)) {
            completions.push(this.buildTagCompletion(tag));
          }
        }
      }
      return completions;
    },
    buildTagCompletion: function(tag) {
      return {
        type: 'tag',
        text: tag,
        description: "Selector for <" + tag + "> elements"
      };
    }
  };

  lineEndsWithSemicolon = function(bufferPosition, editor) {
    var line, row;
    row = bufferPosition.row;
    line = editor.lineTextForBufferRow(row);
    return /;\s*$/.test(line);
  };

  hasScope = function(scopesArray, scope) {
    return scopesArray.indexOf(scope) !== -1;
  };

  firstCharsEqual = function(str1, str2) {
    return str1[0].toLowerCase() === str2[0].toLowerCase();
  };

  makeSnippet = function(text) {
    var snippetNumber;
    snippetNumber = 0;
    while (text.includes('()')) {
      text = text.replace('()', "($" + (++snippetNumber) + ")");
    }
    text = text + ("$" + (++snippetNumber));
    return text;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWJhYmVsL2xpYi9hdXRvLWNvbXBsZXRlLXN0eWxlZC1jb21wb25lbnRzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFLQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCx1Q0FBQSxHQUEwQzs7RUFDMUMsa0NBQUEsR0FBcUM7O0VBQ3JDLDRCQUFBLEdBQStCOztFQUMvQix5QkFBQSxHQUE0Qjs7RUFDNUIsMkJBQUEsR0FBOEI7O0VBQzlCLHdCQUFBLEdBQTJCOztFQUMzQixzQkFBQSxHQUF5Qjs7RUFDekIsVUFBQSxHQUFhOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsa0RBQVY7SUFDQSxrQkFBQSxFQUFvQiwwT0FEcEI7SUFHQSxpQkFBQSxFQUFtQixJQUhuQjtJQUlBLGlCQUFBLEVBQW1CLEtBSm5CO0lBS0Esb0JBQUEsRUFBc0IsSUFMdEI7SUFPQSxjQUFBLEVBQWdCLFNBQUMsT0FBRDtBQUNkLFVBQUE7TUFBQSxXQUFBLEdBQWM7TUFDZCxNQUFBLEdBQVMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxjQUF4QixDQUFBO01BRVQsSUFBRyxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsT0FBbkIsQ0FBSDtRQUNFLFdBQUEsR0FBYyxJQUFDLENBQUEsMkJBQUQsQ0FBNkIsT0FBN0IsRUFEaEI7T0FBQSxNQUVLLElBQUcsSUFBQyxDQUFBLDBCQUFELENBQTRCLE9BQTVCLENBQUg7UUFDSCxXQUFBLEdBQWMsSUFBQyxDQUFBLDRCQUFELENBQThCLE9BQTlCLEVBRFg7T0FBQSxNQUFBO1FBR0gsSUFBRyxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsT0FBbEIsQ0FBSDtVQUNFLFdBQUEsR0FBYyxJQUFDLENBQUEsMEJBQUQsQ0FBNEIsT0FBNUIsRUFEaEI7U0FBQSxNQUVLLElBQUcsSUFBQyxDQUFBLHFCQUFELENBQXVCLE9BQXZCLENBQUg7VUFDSCxXQUFBLEdBQWMsSUFBQyxDQUFBLDBCQUFELENBQTRCLE9BQTVCLENBQ1osQ0FBQyxNQURXLENBQ0osSUFBQyxDQUFBLGlCQUFELENBQW1CLE9BQW5CLENBREksRUFEWDtTQUxGOztBQVNMLGFBQU87SUFmTyxDQVBoQjtJQXdCQSxxQkFBQSxFQUF1QixTQUFDLEdBQUQ7QUFDckIsVUFBQTtNQUR1QixxQkFBUTtNQUMvQixJQUEwRCxVQUFVLENBQUMsSUFBWCxLQUFtQixVQUE3RTtlQUFBLFVBQUEsQ0FBVyxJQUFDLENBQUEsbUJBQW1CLENBQUMsSUFBckIsQ0FBMEIsSUFBMUIsRUFBZ0MsTUFBaEMsQ0FBWCxFQUFvRCxDQUFwRCxFQUFBOztJQURxQixDQXhCdkI7SUEyQkEsbUJBQUEsRUFBcUIsU0FBQyxNQUFEO2FBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkIsQ0FBdkIsRUFBbUQsNEJBQW5ELEVBQWlGO1FBQUMsaUJBQUEsRUFBbUIsS0FBcEI7T0FBakY7SUFEbUIsQ0EzQnJCO0lBOEJBLGNBQUEsRUFBZ0IsU0FBQTtNQUNkLElBQUMsQ0FBQSxVQUFELEdBQWM7YUFDZCxFQUFFLENBQUMsUUFBSCxDQUFZLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixrQkFBeEIsQ0FBWixFQUF5RCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRCxFQUFRLE9BQVI7QUFDdkQsY0FBQTtVQUFBLElBQW9FLGFBQXBFO1lBQUEsTUFBeUMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxPQUFYLENBQXpDLEVBQUMsS0FBQyxDQUFBLHNCQUFBLGVBQUYsRUFBbUIsS0FBQyxDQUFBLGlCQUFBLFVBQXBCLEVBQWdDLEtBQUMsQ0FBQSxXQUFBLEtBQWpDOztRQUR1RDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekQ7SUFGYyxDQTlCaEI7SUFxQ0EsaUJBQUEsRUFBbUIsU0FBQyxHQUFEO0FBQ2pCLFVBQUE7TUFEbUIsdUNBQWlCLHFDQUFnQixxQkFBUTtNQUM1RCxNQUFBLEdBQVMsZUFBZSxDQUFDLGNBQWhCLENBQUE7TUFFVCwwQkFBQSxHQUE2QixDQUFDLGNBQWMsQ0FBQyxHQUFoQixFQUFxQixJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsRUFBWSxjQUFjLENBQUMsTUFBZixHQUF3QixNQUFNLENBQUMsTUFBL0IsR0FBd0MsQ0FBcEQsQ0FBckI7TUFDN0Isa0JBQUEsR0FBcUIsTUFBTSxDQUFDLGdDQUFQLENBQXdDLDBCQUF4QztNQUNyQix1QkFBQSxHQUEwQixrQkFBa0IsQ0FBQyxjQUFuQixDQUFBO0FBRTFCLGFBQU8sQ0FBQyxRQUFBLENBQVMsTUFBVCxFQUFpQiwwQkFBakIsQ0FBRCxDQUFBLElBQ0wsQ0FBQyxRQUFBLENBQVMsdUJBQVQsRUFBbUMsMEJBQW5DLENBQUQ7SUFSZSxDQXJDbkI7SUErQ0EsZ0JBQUEsRUFBa0IsU0FBQyxHQUFEO0FBQ2hCLFVBQUE7TUFEa0IsdUNBQWlCLHFDQUFnQjtNQUNuRCxLQUFBLEdBQVEsZUFBZSxDQUFDLGNBQWhCLENBQUEsQ0FBZ0MsQ0FBQyxLQUFqQyxDQUF1QyxDQUFDLENBQXhDO01BQ1IsTUFBQSxHQUFTLElBQUMsQ0FBQSxxQkFBRCxDQUF1QixjQUF2QixFQUF1QyxNQUF2QztBQUNULGFBQU8sSUFBQyxDQUFBLG9CQUFELENBQXNCLE1BQXRCLENBQUEsSUFBa0MsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFOLEtBQVksd0JBQWI7SUFIekIsQ0EvQ2xCO0lBb0RBLHFCQUFBLEVBQXVCLFNBQUMsR0FBRDtBQUNyQixVQUFBO01BRHVCLHVDQUFpQixxQ0FBZ0I7TUFDeEQsS0FBQSxHQUFRLGVBQWUsQ0FBQyxjQUFoQixDQUFBLENBQWdDLENBQUMsS0FBakMsQ0FBdUMsQ0FBQyxDQUF4QztNQUNSLE1BQUEsR0FBUyxJQUFDLENBQUEscUJBQUQsQ0FBdUIsY0FBdkIsRUFBdUMsTUFBdkM7QUFDVCxhQUFPLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixDQUFBLElBQ04sQ0FBQyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQU4sS0FBWSx3QkFBYixDQUFBLElBQ0EsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFOLEtBQVksbUJBQWIsQ0FEQSxJQUVBLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBTixLQUFZLDZCQUFiLENBRkQ7SUFKb0IsQ0FwRHZCO0lBNERBLDBCQUFBLEVBQTRCLFNBQUMsR0FBRDtBQUMxQixVQUFBO01BRDRCLHFCQUFRLHVDQUFpQjtNQUNyRCxLQUFBLEdBQVEsZUFBZSxDQUFDLGNBQWhCLENBQUEsQ0FBZ0MsQ0FBQyxLQUFqQyxDQUF1QyxDQUFDLENBQXhDO0FBQ1IsYUFBUyxDQUFFLEtBQU0sQ0FBQSxDQUFBLENBQU4sS0FBWSx1Q0FBZCxDQUFBLElBQ1AsQ0FBRSxLQUFNLENBQUEsQ0FBQSxDQUFOLEtBQVksNkJBQWQ7SUFId0IsQ0E1RDVCO0lBaUVBLHFCQUFBLEVBQXVCLFNBQUMsTUFBRDtNQUNyQixNQUFBLEdBQVMsTUFBTSxDQUFDLElBQVAsQ0FBQTthQUNULE1BQU0sQ0FBQyxNQUFQLEdBQWdCLENBQWhCLElBQXNCLE1BQUEsS0FBWTtJQUZiLENBakV2QjtJQXFFQSxvQkFBQSxFQUFzQixTQUFDLE1BQUQ7TUFDcEIsSUFBb0IsY0FBcEI7QUFBQSxlQUFPLE1BQVA7O01BQ0EsTUFBQSxHQUFTLE1BQU0sQ0FBQyxJQUFQLENBQUE7YUFDVCxNQUFNLENBQUMsS0FBUCxDQUFhLGNBQWI7SUFIb0IsQ0FyRXRCO0lBMEVBLGtCQUFBLEVBQW9CLFNBQUMsTUFBRCxFQUFTLGNBQVQ7QUFDbEIsVUFBQTtNQUFBLElBQUEsR0FBTyxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLENBQUMsY0FBYyxDQUFDLEdBQWhCLEVBQXFCLENBQXJCLENBQUQsRUFBMEIsY0FBMUIsQ0FBdEI7b0VBQzRCLENBQUEsQ0FBQTtJQUZqQixDQTFFcEI7SUE4RUEsdUJBQUEsRUFBeUIsU0FBQyxjQUFELEVBQWlCLE1BQWpCO0FBQ3ZCLFVBQUE7TUFBQyxNQUFPO0FBQ1IsYUFBTSxHQUFBLElBQU8sQ0FBYjtRQUNFLElBQUEsR0FBTyxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsR0FBNUI7UUFDUCxZQUFBLHNFQUE4RCxDQUFBLENBQUE7O1VBQzlELHlGQUFvRSxDQUFBLENBQUE7OztVQUNwRSw4RUFBeUQsQ0FBQSxDQUFBOztRQUN6RCxJQUF1QixZQUF2QjtBQUFBLGlCQUFPLGFBQVA7O1FBQ0EsR0FBQTtNQU5GO0lBRnVCLENBOUV6QjtJQXlGQSwyQkFBQSxFQUE2QixTQUFDLEdBQUQ7QUFDM0IsVUFBQTtNQUQ2QixxQ0FBZ0IscUJBQVEscUJBQVE7TUFDN0QsUUFBQSxHQUFXLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixjQUF6QixFQUF5QyxNQUF6QztNQUNYLE1BQUEsa0RBQThCLENBQUU7TUFDaEMsSUFBbUIsY0FBbkI7QUFBQSxlQUFPLEtBQVA7O01BRUEsTUFBQSxHQUFTLGVBQWUsQ0FBQyxjQUFoQixDQUFBO01BQ1QsWUFBQSxHQUFlLENBQUkscUJBQUEsQ0FBc0IsY0FBdEIsRUFBc0MsTUFBdEM7TUFFbkIsV0FBQSxHQUFjO01BQ2QsSUFBRyxJQUFDLENBQUEscUJBQUQsQ0FBdUIsTUFBdkIsQ0FBSDtBQUNFLGFBQUEsd0NBQUE7O2NBQXlCLGVBQUEsQ0FBZ0IsS0FBaEIsRUFBdUIsTUFBdkI7WUFDdkIsV0FBVyxDQUFDLElBQVosQ0FBaUIsSUFBQyxDQUFBLDRCQUFELENBQThCLEtBQTlCLEVBQXFDLFFBQXJDLEVBQStDLFlBQS9DLENBQWpCOztBQURGLFNBREY7T0FBQSxNQUFBO0FBSUUsYUFBQSwwQ0FBQTs7VUFDRSxXQUFXLENBQUMsSUFBWixDQUFpQixJQUFDLENBQUEsNEJBQUQsQ0FBOEIsS0FBOUIsRUFBcUMsUUFBckMsRUFBK0MsWUFBL0MsQ0FBakI7QUFERixTQUpGOztNQU9BLElBQUcsZUFBQSxHQUFrQixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsTUFBcEIsRUFBNEIsY0FBNUIsQ0FBckI7UUFDRSxXQUFXLENBQUMsSUFBWixDQUNFO1VBQUEsSUFBQSxFQUFNLFNBQU47VUFDQSxJQUFBLEVBQU0sWUFETjtVQUVBLFdBQUEsRUFBYSxZQUZiO1VBR0EsaUJBQUEsRUFBbUIsZUFIbkI7VUFJQSxXQUFBLEVBQWEsZ0dBSmI7VUFLQSxrQkFBQSxFQUF1QixVQUFELEdBQVksdUNBTGxDO1NBREYsRUFERjs7YUFTQTtJQXpCMkIsQ0F6RjdCO0lBb0hBLDRCQUFBLEVBQThCLFNBQUMsS0FBRCxFQUFRLFlBQVIsRUFBc0IsWUFBdEI7QUFDNUIsVUFBQTtNQUFBLElBQUEsR0FBTztNQUNQLElBQWUsWUFBZjtRQUFBLElBQUEsSUFBUSxJQUFSOztNQUNBLElBQUEsR0FBTyxXQUFBLENBQVksSUFBWjthQUVQO1FBQ0UsSUFBQSxFQUFNLE9BRFI7UUFFRSxPQUFBLEVBQVMsSUFGWDtRQUdFLFdBQUEsRUFBYSxLQUhmO1FBSUUsV0FBQSxFQUFnQixLQUFELEdBQU8saUJBQVAsR0FBd0IsWUFBeEIsR0FBcUMsV0FKdEQ7UUFLRSxrQkFBQSxFQUF1QixVQUFELEdBQVksR0FBWixHQUFlLFlBQWYsR0FBNEIsU0FMcEQ7O0lBTDRCLENBcEg5QjtJQWlJQSxxQkFBQSxFQUF1QixTQUFDLGNBQUQsRUFBaUIsTUFBakI7QUFDckIsVUFBQTtNQUFBLElBQUEsR0FBTyxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLENBQUMsY0FBYyxDQUFDLEdBQWhCLEVBQXFCLENBQXJCLENBQUQsRUFBMEIsY0FBMUIsQ0FBdEI7dUVBQytCLENBQUEsQ0FBQTtJQUZqQixDQWpJdkI7SUFxSUEsMEJBQUEsRUFBNEIsU0FBQyxHQUFEO0FBQzFCLFVBQUE7TUFENEIscUNBQWdCLHFCQUFRLHVDQUFpQjtNQUNyRSxNQUFBLEdBQVMsZUFBZSxDQUFDLGNBQWhCLENBQUE7TUFDVCxJQUFBLEdBQU8sTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFoQixFQUFxQixDQUFyQixDQUFELEVBQTBCLGNBQTFCLENBQXRCO01BRVAsTUFBQSxHQUFTLElBQUMsQ0FBQSxxQkFBRCxDQUF1QixjQUF2QixFQUF1QyxNQUF2QztNQUNULElBQUEsQ0FBQSxDQUFpQixpQkFBQSxJQUFxQixNQUF0QyxDQUFBO0FBQUEsZUFBTyxHQUFQOztNQUVBLFdBQUEsR0FBYztBQUNkO0FBQUEsV0FBQSxlQUFBOztZQUEwQyxDQUFJLE1BQUosSUFBYyxlQUFBLENBQWdCLFFBQWhCLEVBQTBCLE1BQTFCO1VBQ3RELFdBQVcsQ0FBQyxJQUFaLENBQWlCLElBQUMsQ0FBQSwyQkFBRCxDQUE2QixRQUE3QixFQUF1QyxNQUF2QyxFQUErQyxPQUEvQyxDQUFqQjs7QUFERjthQUVBO0lBVjBCLENBckk1QjtJQWlKQSwyQkFBQSxFQUE2QixTQUFDLFlBQUQsRUFBZSxNQUFmLEVBQXVCLEdBQXZCO0FBQzNCLFVBQUE7TUFEbUQsY0FBRDthQUNsRDtRQUFBLElBQUEsRUFBTSxVQUFOO1FBQ0EsSUFBQSxFQUFTLFlBQUQsR0FBYyxJQUR0QjtRQUVBLFdBQUEsRUFBYSxZQUZiO1FBR0EsaUJBQUEsRUFBbUIsTUFIbkI7UUFJQSxXQUFBLEVBQWEsV0FKYjtRQUtBLGtCQUFBLEVBQXVCLFVBQUQsR0FBWSxHQUFaLEdBQWUsWUFMckM7O0lBRDJCLENBako3QjtJQXlKQSx1QkFBQSxFQUF5QixTQUFDLE1BQUQsRUFBUyxjQUFUO0FBQ3ZCLFVBQUE7TUFBQSxJQUFBLEdBQU8sTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFoQixFQUFxQixDQUFyQixDQUFELEVBQTBCLGNBQTFCLENBQXRCOzBFQUNrQyxDQUFBLENBQUE7SUFGbEIsQ0F6SnpCO0lBNkpBLDRCQUFBLEVBQThCLFNBQUMsR0FBRDtBQUM1QixVQUFBO01BRDhCLHFDQUFnQjtNQUM5QyxNQUFBLEdBQVMsSUFBQyxDQUFBLHVCQUFELENBQXlCLE1BQXpCLEVBQWlDLGNBQWpDO01BQ1QsSUFBQSxDQUFtQixNQUFuQjtBQUFBLGVBQU8sS0FBUDs7TUFFQSxXQUFBLEdBQWM7QUFDZDtBQUFBLFdBQUEscUJBQUE7O1lBQXFELGVBQUEsQ0FBZ0IsY0FBaEIsRUFBZ0MsTUFBaEM7VUFDbkQsV0FBVyxDQUFDLElBQVosQ0FBaUIsSUFBQyxDQUFBLDZCQUFELENBQStCLGNBQS9CLEVBQStDLE1BQS9DLEVBQXVELE9BQXZELENBQWpCOztBQURGO2FBRUE7SUFQNEIsQ0E3SjlCO0lBc0tBLDZCQUFBLEVBQStCLFNBQUMsY0FBRCxFQUFpQixNQUFqQixFQUF5QixHQUF6QjtBQUM3QixVQUFBO01BRHVELHlCQUFVO01BQ2pFLFVBQUEsR0FDRTtRQUFBLElBQUEsRUFBTSxpQkFBTjtRQUNBLGlCQUFBLEVBQW1CLE1BRG5CO1FBRUEsV0FBQSxFQUFhLFdBRmI7UUFHQSxrQkFBQSxFQUF1QixVQUFELEdBQVksR0FBWixHQUFlLGNBSHJDOztNQUtGLElBQUcsZ0JBQUg7UUFDRSxVQUFVLENBQUMsT0FBWCxHQUF3QixjQUFELEdBQWdCLE9BQWhCLEdBQXVCLFFBQXZCLEdBQWdDLEtBRHpEO09BQUEsTUFBQTtRQUdFLFVBQVUsQ0FBQyxJQUFYLEdBQWtCLGVBSHBCOzthQUlBO0lBWDZCLENBdEsvQjtJQW1MQSxvQkFBQSxFQUFzQixTQUFDLE1BQUQsRUFBUyxjQUFUO0FBQ3BCLFVBQUE7TUFBQSxJQUFBLEdBQU8sTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFoQixFQUFxQixDQUFyQixDQUFELEVBQTBCLGNBQTFCLENBQXRCO3NFQUM4QixDQUFBLENBQUE7SUFGakIsQ0FuTHRCO0lBdUxBLGlCQUFBLEVBQW1CLFNBQUMsR0FBRDtBQUNqQixVQUFBO01BRG1CLHFDQUFnQixxQkFBUTtNQUMzQyxXQUFBLEdBQWM7TUFDZCxJQUFHLE1BQUg7QUFDRTtBQUFBLGFBQUEscUNBQUE7O2NBQXNCLGVBQUEsQ0FBZ0IsR0FBaEIsRUFBcUIsTUFBckI7WUFDcEIsV0FBVyxDQUFDLElBQVosQ0FBaUIsSUFBQyxDQUFBLGtCQUFELENBQW9CLEdBQXBCLENBQWpCOztBQURGLFNBREY7O2FBR0E7SUFMaUIsQ0F2TG5CO0lBOExBLGtCQUFBLEVBQW9CLFNBQUMsR0FBRDthQUNsQjtRQUFBLElBQUEsRUFBTSxLQUFOO1FBQ0EsSUFBQSxFQUFNLEdBRE47UUFFQSxXQUFBLEVBQWEsZ0JBQUEsR0FBaUIsR0FBakIsR0FBcUIsWUFGbEM7O0lBRGtCLENBOUxwQjs7O0VBbU1GLHFCQUFBLEdBQXdCLFNBQUMsY0FBRCxFQUFpQixNQUFqQjtBQUN0QixRQUFBO0lBQUMsTUFBTztJQUNSLElBQUEsR0FBTyxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsR0FBNUI7V0FDUCxPQUFPLENBQUMsSUFBUixDQUFhLElBQWI7RUFIc0I7O0VBS3hCLFFBQUEsR0FBVyxTQUFDLFdBQUQsRUFBYyxLQUFkO1dBQ1QsV0FBVyxDQUFDLE9BQVosQ0FBb0IsS0FBcEIsQ0FBQSxLQUFnQyxDQUFDO0VBRHhCOztFQUdYLGVBQUEsR0FBa0IsU0FBQyxJQUFELEVBQU8sSUFBUDtXQUNoQixJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBUixDQUFBLENBQUEsS0FBeUIsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQVIsQ0FBQTtFQURUOztFQU1sQixXQUFBLEdBQWMsU0FBQyxJQUFEO0FBQ1osUUFBQTtJQUFBLGFBQUEsR0FBZ0I7QUFDaEIsV0FBTSxJQUFJLENBQUMsUUFBTCxDQUFjLElBQWQsQ0FBTjtNQUNFLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLElBQWIsRUFBbUIsSUFBQSxHQUFJLENBQUMsRUFBRSxhQUFILENBQUosR0FBcUIsR0FBeEM7SUFEVDtJQUVBLElBQUEsR0FBTyxJQUFBLEdBQU8sQ0FBQSxHQUFBLEdBQUcsQ0FBQyxFQUFFLGFBQUgsQ0FBSDtBQUNkLFdBQU87RUFMSztBQTlOZCIsInNvdXJjZXNDb250ZW50IjpbIiMgVGhpcyBjb2RlIHdhcyBiYXNlZCB1cG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F1dG9jb21wbGV0ZS1jc3MgYnV0IGhhcyBiZWVuIG1vZGlmaWVkIHRvIGFsbG93IGl0IHRvIGJlIHVzZWRcbiMgZm9yIHN0eWxlZC1jb21wb25lbmV0cy4gVGhlIGNvbXBsZXRpb25zLmpzb24gZmlsZSB1c2VkIHRvIGF1dG8gY29tcGxldGUgaXMgYSBjb3B5IG9mIHRoZSBvbmUgdXNlZCBieSB0aGUgYXRvbVxuIyBwYWNrYWdlLiBUaGF0IHBhY2thZ2UsIHByb3ZpZGVkIGFzIGFuIEF0b20gYmFzZSBwYWNrYWdlLCBoYXMgdG9vbHMgdG8gdXBkYXRlIHRoZSBjb21wbGV0aW9ucy5qc29uIGZpbGUgZnJvbSB0aGUgd2ViLlxuIyBTZWUgdGhhdCBwYWNrYWdlIGZvciBtb3JlIGluZm8gYW5kIGp1c3QgY29weSB0aGUgY29tcGxldGlvbnMuanNvbiB0byB0aGlzIGZpbGVzIGRpcmVjdG9yeSB3aGVuIGEgcmVmcmVzaCBpcyBuZWVkZWQuXG5cbmZzID0gcmVxdWlyZSAnZnMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblxuZmlyc3RJbmxpbmVQcm9wZXJ0eU5hbWVXaXRoQ29sb25QYXR0ZXJuID0gL3tcXHMqKFxcUyspXFxzKjovICMgLmV4YW1wbGUgeyBkaXNwbGF5OiB9XG5pbmxpbmVQcm9wZXJ0eU5hbWVXaXRoQ29sb25QYXR0ZXJuID0gLyg/OjsuKz8pKjtcXHMqKFxcUyspXFxzKjovICMgLmV4YW1wbGUgeyBkaXNwbGF5OiBibG9jazsgZmxvYXQ6IGxlZnQ7IGNvbG9yOiB9IChtYXRjaCB0aGUgbGFzdCBvbmUpXG5wcm9wZXJ0eU5hbWVXaXRoQ29sb25QYXR0ZXJuID0gL15cXHMqKFxcUyspXFxzKjovICMgZGlzcGxheTpcbnByb3BlcnR5TmFtZVByZWZpeFBhdHRlcm4gPSAvW2EtekEtWl0rWy1hLXpBLVpdKiQvXG5wZXN1ZG9TZWxlY3RvclByZWZpeFBhdHRlcm4gPSAvOig6KT8oW2Etel0rW2Etei1dKik/JC9cbnRhZ1NlbGVjdG9yUHJlZml4UGF0dGVybiA9IC8oXnxcXHN8LCkoW2Etel0rKT8kL1xuaW1wb3J0YW50UHJlZml4UGF0dGVybiA9IC8oIVthLXpdKykkL1xuY3NzRG9jc1VSTCA9IFwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuICBzZWxlY3RvcjogJy5zb3VyY2UuaW5zaWRlLWpzLmNzcy5zdHlsZWQsIC5zb3VyY2UuY3NzLnN0eWxlZCdcbiAgZGlzYWJsZUZvclNlbGVjdG9yOiBcIi5zb3VyY2UuaW5zaWRlLWpzLmNzcy5zdHlsZWQgLmNvbW1lbnQsIC5zb3VyY2UuaW5zaWRlLWpzLmNzcy5zdHlsZWQgLnN0cmluZywgLnNvdXJjZS5pbnNpZGUtanMuY3NzLnN0eWxlZCAuZW50aXR5LnF1YXNpLmVsZW1lbnQuanMsIC5zb3VyY2UuY3NzLnN0eWxlZCAuY29tbWVudCwgLnNvdXJjZS5jc3Muc3R5bGVkIC5zdHJpbmcsIC5zb3VyY2UuY3NzLnN0eWxlZCAuZW50aXR5LnF1YXNpLmVsZW1lbnQuanNcIlxuXG4gIGZpbHRlclN1Z2dlc3Rpb25zOiB0cnVlXG4gIGluY2x1c2lvblByaW9yaXR5OiAxMDAwMFxuICBleGNsdWRlTG93ZXJQcmlvcml0eTogdHJ1ZVxuXG4gIGdldFN1Z2dlc3Rpb25zOiAocmVxdWVzdCkgLT5cbiAgICBjb21wbGV0aW9ucyA9IG51bGxcbiAgICBzY29wZXMgPSByZXF1ZXN0LnNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpXG5cbiAgICBpZiBAaXNDb21wbGV0aW5nVmFsdWUocmVxdWVzdClcbiAgICAgIGNvbXBsZXRpb25zID0gQGdldFByb3BlcnR5VmFsdWVDb21wbGV0aW9ucyhyZXF1ZXN0KVxuICAgIGVsc2UgaWYgQGlzQ29tcGxldGluZ1BzZXVkb1NlbGVjdG9yKHJlcXVlc3QpXG4gICAgICBjb21wbGV0aW9ucyA9IEBnZXRQc2V1ZG9TZWxlY3RvckNvbXBsZXRpb25zKHJlcXVlc3QpXG4gICAgZWxzZVxuICAgICAgaWYgQGlzQ29tcGxldGluZ05hbWUocmVxdWVzdClcbiAgICAgICAgY29tcGxldGlvbnMgPSBAZ2V0UHJvcGVydHlOYW1lQ29tcGxldGlvbnMocmVxdWVzdClcbiAgICAgIGVsc2UgaWYgQGlzQ29tcGxldGluZ05hbWVPclRhZyhyZXF1ZXN0KVxuICAgICAgICBjb21wbGV0aW9ucyA9IEBnZXRQcm9wZXJ0eU5hbWVDb21wbGV0aW9ucyhyZXF1ZXN0KVxuICAgICAgICAgIC5jb25jYXQoQGdldFRhZ0NvbXBsZXRpb25zKHJlcXVlc3QpKVxuXG4gICAgcmV0dXJuIGNvbXBsZXRpb25zXG5cbiAgb25EaWRJbnNlcnRTdWdnZXN0aW9uOiAoe2VkaXRvciwgc3VnZ2VzdGlvbn0pIC0+XG4gICAgc2V0VGltZW91dChAdHJpZ2dlckF1dG9jb21wbGV0ZS5iaW5kKHRoaXMsIGVkaXRvciksIDEpIGlmIHN1Z2dlc3Rpb24udHlwZSBpcyAncHJvcGVydHknXG5cbiAgdHJpZ2dlckF1dG9jb21wbGV0ZTogKGVkaXRvcikgLT5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpLCAnYXV0b2NvbXBsZXRlLXBsdXM6YWN0aXZhdGUnLCB7YWN0aXZhdGVkTWFudWFsbHk6IGZhbHNlfSlcblxuICBsb2FkUHJvcGVydGllczogLT5cbiAgICBAcHJvcGVydGllcyA9IHt9XG4gICAgZnMucmVhZEZpbGUgcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2NvbXBsZXRpb25zLmpzb24nKSwgKGVycm9yLCBjb250ZW50KSA9PlxuICAgICAge0Bwc2V1ZG9TZWxlY3RvcnMsIEBwcm9wZXJ0aWVzLCBAdGFnc30gPSBKU09OLnBhcnNlKGNvbnRlbnQpIHVubGVzcyBlcnJvcj9cblxuICAgICAgcmV0dXJuXG5cbiAgaXNDb21wbGV0aW5nVmFsdWU6ICh7c2NvcGVEZXNjcmlwdG9yLCBidWZmZXJQb3NpdGlvbiwgcHJlZml4LCBlZGl0b3J9KSAtPlxuICAgIHNjb3BlcyA9IHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpXG5cbiAgICBiZWZvcmVQcmVmaXhCdWZmZXJQb3NpdGlvbiA9IFtidWZmZXJQb3NpdGlvbi5yb3csIE1hdGgubWF4KDAsIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiAtIHByZWZpeC5sZW5ndGggLSAxKV1cbiAgICBiZWZvcmVQcmVmaXhTY29wZXMgPSBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oYmVmb3JlUHJlZml4QnVmZmVyUG9zaXRpb24pXG4gICAgYmVmb3JlUHJlZml4U2NvcGVzQXJyYXkgPSBiZWZvcmVQcmVmaXhTY29wZXMuZ2V0U2NvcGVzQXJyYXkoKVxuXG4gICAgcmV0dXJuIChoYXNTY29wZShzY29wZXMsICdtZXRhLnByb3BlcnR5LXZhbHVlcy5jc3MnKSkgb3JcbiAgICAgIChoYXNTY29wZShiZWZvcmVQcmVmaXhTY29wZXNBcnJheSAsICdtZXRhLnByb3BlcnR5LXZhbHVlcy5jc3MnKSlcblxuICBpc0NvbXBsZXRpbmdOYW1lOiAoe3Njb3BlRGVzY3JpcHRvciwgYnVmZmVyUG9zaXRpb24sIGVkaXRvcn0pIC0+XG4gICAgc2NvcGUgPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVzQXJyYXkoKS5zbGljZSgtMSlcbiAgICBwcmVmaXggPSBAZ2V0UHJvcGVydHlOYW1lUHJlZml4KGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3IpXG4gICAgcmV0dXJuIEBpc1Byb3BlcnR5TmFtZVByZWZpeChwcmVmaXgpIGFuZCAoc2NvcGVbMF0gaXMgJ21ldGEucHJvcGVydHktbGlzdC5jc3MnKVxuXG4gIGlzQ29tcGxldGluZ05hbWVPclRhZzogKHtzY29wZURlc2NyaXB0b3IsIGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3J9KSAtPlxuICAgIHNjb3BlID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3Blc0FycmF5KCkuc2xpY2UoLTEpXG4gICAgcHJlZml4ID0gQGdldFByb3BlcnR5TmFtZVByZWZpeChidWZmZXJQb3NpdGlvbiwgZWRpdG9yKVxuICAgIHJldHVybiBAaXNQcm9wZXJ0eU5hbWVQcmVmaXgocHJlZml4KSBhbmRcbiAgICAgKChzY29wZVswXSBpcyAnbWV0YS5wcm9wZXJ0eS1saXN0LmNzcycpIG9yXG4gICAgICAoc2NvcGVbMF0gaXMgJ3NvdXJjZS5jc3Muc3R5bGVkJykgb3JcbiAgICAgIChzY29wZVswXSBpcyAnc291cmNlLmluc2lkZS1qcy5jc3Muc3R5bGVkJykpXG5cbiAgaXNDb21wbGV0aW5nUHNldWRvU2VsZWN0b3I6ICh7ZWRpdG9yLCBzY29wZURlc2NyaXB0b3IsIGJ1ZmZlclBvc2l0aW9ufSkgLT5cbiAgICBzY29wZSA9IHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpLnNsaWNlKC0xKVxuICAgIHJldHVybiAoICggc2NvcGVbMF0gaXMgJ2NvbnN0YW50Lmxhbmd1YWdlLnBzZXVkby5wcmVmaXhlZC5jc3MnKSBvclxuICAgICAgKCBzY29wZVswXSBpcyAna2V5d29yZC5vcGVyYXRvci5wc2V1ZG8uY3NzJykgKVxuXG4gIGlzUHJvcGVydHlWYWx1ZVByZWZpeDogKHByZWZpeCkgLT5cbiAgICBwcmVmaXggPSBwcmVmaXgudHJpbSgpXG4gICAgcHJlZml4Lmxlbmd0aCA+IDAgYW5kIHByZWZpeCBpc250ICc6J1xuXG4gIGlzUHJvcGVydHlOYW1lUHJlZml4OiAocHJlZml4KSAtPlxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgcHJlZml4P1xuICAgIHByZWZpeCA9IHByZWZpeC50cmltKClcbiAgICBwcmVmaXgubWF0Y2goL15bYS16QS1aLV0rJC8pXG5cbiAgZ2V0SW1wb3J0YW50UHJlZml4OiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuICAgIGltcG9ydGFudFByZWZpeFBhdHRlcm4uZXhlYyhsaW5lKT9bMV1cblxuICBnZXRQcmV2aW91c1Byb3BlcnR5TmFtZTogKGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3IpIC0+XG4gICAge3Jvd30gPSBidWZmZXJQb3NpdGlvblxuICAgIHdoaWxlIHJvdyA+PSAwXG4gICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdylcbiAgICAgIHByb3BlcnR5TmFtZSA9IGlubGluZVByb3BlcnR5TmFtZVdpdGhDb2xvblBhdHRlcm4uZXhlYyhsaW5lKT9bMV1cbiAgICAgIHByb3BlcnR5TmFtZSA/PSBmaXJzdElubGluZVByb3BlcnR5TmFtZVdpdGhDb2xvblBhdHRlcm4uZXhlYyhsaW5lKT9bMV1cbiAgICAgIHByb3BlcnR5TmFtZSA/PSBwcm9wZXJ0eU5hbWVXaXRoQ29sb25QYXR0ZXJuLmV4ZWMobGluZSk/WzFdXG4gICAgICByZXR1cm4gcHJvcGVydHlOYW1lIGlmIHByb3BlcnR5TmFtZVxuICAgICAgcm93LS1cbiAgICByZXR1cm5cblxuICBnZXRQcm9wZXJ0eVZhbHVlQ29tcGxldGlvbnM6ICh7YnVmZmVyUG9zaXRpb24sIGVkaXRvciwgcHJlZml4LCBzY29wZURlc2NyaXB0b3J9KSAtPlxuICAgIHByb3BlcnR5ID0gQGdldFByZXZpb3VzUHJvcGVydHlOYW1lKGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3IpXG4gICAgdmFsdWVzID0gQHByb3BlcnRpZXNbcHJvcGVydHldPy52YWx1ZXNcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgdmFsdWVzP1xuXG4gICAgc2NvcGVzID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3Blc0FycmF5KClcbiAgICBhZGRTZW1pY29sb24gPSBub3QgbGluZUVuZHNXaXRoU2VtaWNvbG9uKGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3IpXG5cbiAgICBjb21wbGV0aW9ucyA9IFtdXG4gICAgaWYgQGlzUHJvcGVydHlWYWx1ZVByZWZpeChwcmVmaXgpXG4gICAgICBmb3IgdmFsdWUgaW4gdmFsdWVzIHdoZW4gZmlyc3RDaGFyc0VxdWFsKHZhbHVlLCBwcmVmaXgpXG4gICAgICAgIGNvbXBsZXRpb25zLnB1c2goQGJ1aWxkUHJvcGVydHlWYWx1ZUNvbXBsZXRpb24odmFsdWUsIHByb3BlcnR5LCBhZGRTZW1pY29sb24pKVxuICAgIGVsc2VcbiAgICAgIGZvciB2YWx1ZSBpbiB2YWx1ZXNcbiAgICAgICAgY29tcGxldGlvbnMucHVzaChAYnVpbGRQcm9wZXJ0eVZhbHVlQ29tcGxldGlvbih2YWx1ZSwgcHJvcGVydHksIGFkZFNlbWljb2xvbikpXG5cbiAgICBpZiBpbXBvcnRhbnRQcmVmaXggPSBAZ2V0SW1wb3J0YW50UHJlZml4KGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICBjb21wbGV0aW9ucy5wdXNoXG4gICAgICAgIHR5cGU6ICdrZXl3b3JkJ1xuICAgICAgICB0ZXh0OiAnIWltcG9ydGFudCdcbiAgICAgICAgZGlzcGxheVRleHQ6ICchaW1wb3J0YW50J1xuICAgICAgICByZXBsYWNlbWVudFByZWZpeDogaW1wb3J0YW50UHJlZml4XG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkZvcmNlcyB0aGlzIHByb3BlcnR5IHRvIG92ZXJyaWRlIGFueSBvdGhlciBkZWNsYXJhdGlvbiBvZiB0aGUgc2FtZSBwcm9wZXJ0eS4gVXNlIHdpdGggY2F1dGlvbi5cIlxuICAgICAgICBkZXNjcmlwdGlvbk1vcmVVUkw6IFwiI3tjc3NEb2NzVVJMfS9TcGVjaWZpY2l0eSNUaGVfIWltcG9ydGFudF9leGNlcHRpb25cIlxuXG4gICAgY29tcGxldGlvbnNcblxuICBidWlsZFByb3BlcnR5VmFsdWVDb21wbGV0aW9uOiAodmFsdWUsIHByb3BlcnR5TmFtZSwgYWRkU2VtaWNvbG9uKSAtPlxuICAgIHRleHQgPSB2YWx1ZVxuICAgIHRleHQgKz0gJzsnIGlmIGFkZFNlbWljb2xvblxuICAgIHRleHQgPSBtYWtlU25pcHBldCh0ZXh0KVxuXG4gICAge1xuICAgICAgdHlwZTogJ3ZhbHVlJ1xuICAgICAgc25pcHBldDogdGV4dFxuICAgICAgZGlzcGxheVRleHQ6IHZhbHVlXG4gICAgICBkZXNjcmlwdGlvbjogXCIje3ZhbHVlfSB2YWx1ZSBmb3IgdGhlICN7cHJvcGVydHlOYW1lfSBwcm9wZXJ0eVwiXG4gICAgICBkZXNjcmlwdGlvbk1vcmVVUkw6IFwiI3tjc3NEb2NzVVJMfS8je3Byb3BlcnR5TmFtZX0jVmFsdWVzXCJcbiAgICB9XG5cbiAgZ2V0UHJvcGVydHlOYW1lUHJlZml4OiAoYnVmZmVyUG9zaXRpb24sIGVkaXRvcikgLT5cbiAgICBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuICAgIHByb3BlcnR5TmFtZVByZWZpeFBhdHRlcm4uZXhlYyhsaW5lKT9bMF1cblxuICBnZXRQcm9wZXJ0eU5hbWVDb21wbGV0aW9uczogKHtidWZmZXJQb3NpdGlvbiwgZWRpdG9yLCBzY29wZURlc2NyaXB0b3IsIGFjdGl2YXRlZE1hbnVhbGx5fSkgLT5cbiAgICBzY29wZXMgPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIGxpbmUgPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3csIDBdLCBidWZmZXJQb3NpdGlvbl0pXG5cbiAgICBwcmVmaXggPSBAZ2V0UHJvcGVydHlOYW1lUHJlZml4KGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3IpXG4gICAgcmV0dXJuIFtdIHVubGVzcyBhY3RpdmF0ZWRNYW51YWxseSBvciBwcmVmaXhcblxuICAgIGNvbXBsZXRpb25zID0gW11cbiAgICBmb3IgcHJvcGVydHksIG9wdGlvbnMgb2YgQHByb3BlcnRpZXMgd2hlbiBub3QgcHJlZml4IG9yIGZpcnN0Q2hhcnNFcXVhbChwcm9wZXJ0eSwgcHJlZml4KVxuICAgICAgY29tcGxldGlvbnMucHVzaChAYnVpbGRQcm9wZXJ0eU5hbWVDb21wbGV0aW9uKHByb3BlcnR5LCBwcmVmaXgsIG9wdGlvbnMpKVxuICAgIGNvbXBsZXRpb25zXG5cbiAgYnVpbGRQcm9wZXJ0eU5hbWVDb21wbGV0aW9uOiAocHJvcGVydHlOYW1lLCBwcmVmaXgsIHtkZXNjcmlwdGlvbn0pIC0+XG4gICAgdHlwZTogJ3Byb3BlcnR5J1xuICAgIHRleHQ6IFwiI3twcm9wZXJ0eU5hbWV9OiBcIlxuICAgIGRpc3BsYXlUZXh0OiBwcm9wZXJ0eU5hbWVcbiAgICByZXBsYWNlbWVudFByZWZpeDogcHJlZml4XG4gICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uXG4gICAgZGVzY3JpcHRpb25Nb3JlVVJMOiBcIiN7Y3NzRG9jc1VSTH0vI3twcm9wZXJ0eU5hbWV9XCJcblxuICBnZXRQc2V1ZG9TZWxlY3RvclByZWZpeDogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSlcbiAgICBsaW5lLm1hdGNoKHBlc3Vkb1NlbGVjdG9yUHJlZml4UGF0dGVybik/WzBdXG5cbiAgZ2V0UHNldWRvU2VsZWN0b3JDb21wbGV0aW9uczogKHtidWZmZXJQb3NpdGlvbiwgZWRpdG9yfSkgLT5cbiAgICBwcmVmaXggPSBAZ2V0UHNldWRvU2VsZWN0b3JQcmVmaXgoZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcHJlZml4XG5cbiAgICBjb21wbGV0aW9ucyA9IFtdXG4gICAgZm9yIHBzZXVkb1NlbGVjdG9yLCBvcHRpb25zIG9mIEBwc2V1ZG9TZWxlY3RvcnMgd2hlbiBmaXJzdENoYXJzRXF1YWwocHNldWRvU2VsZWN0b3IsIHByZWZpeClcbiAgICAgIGNvbXBsZXRpb25zLnB1c2goQGJ1aWxkUHNldWRvU2VsZWN0b3JDb21wbGV0aW9uKHBzZXVkb1NlbGVjdG9yLCBwcmVmaXgsIG9wdGlvbnMpKVxuICAgIGNvbXBsZXRpb25zXG5cbiAgYnVpbGRQc2V1ZG9TZWxlY3RvckNvbXBsZXRpb246IChwc2V1ZG9TZWxlY3RvciwgcHJlZml4LCB7YXJndW1lbnQsIGRlc2NyaXB0aW9ufSkgLT5cbiAgICBjb21wbGV0aW9uID1cbiAgICAgIHR5cGU6ICdwc2V1ZG8tc2VsZWN0b3InXG4gICAgICByZXBsYWNlbWVudFByZWZpeDogcHJlZml4XG4gICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb25cbiAgICAgIGRlc2NyaXB0aW9uTW9yZVVSTDogXCIje2Nzc0RvY3NVUkx9LyN7cHNldWRvU2VsZWN0b3J9XCJcblxuICAgIGlmIGFyZ3VtZW50P1xuICAgICAgY29tcGxldGlvbi5zbmlwcGV0ID0gXCIje3BzZXVkb1NlbGVjdG9yfSgkezE6I3thcmd1bWVudH19KVwiXG4gICAgZWxzZVxuICAgICAgY29tcGxldGlvbi50ZXh0ID0gcHNldWRvU2VsZWN0b3JcbiAgICBjb21wbGV0aW9uXG5cbiAgZ2V0VGFnU2VsZWN0b3JQcmVmaXg6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgIGxpbmUgPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3csIDBdLCBidWZmZXJQb3NpdGlvbl0pXG4gICAgdGFnU2VsZWN0b3JQcmVmaXhQYXR0ZXJuLmV4ZWMobGluZSk/WzJdXG5cbiAgZ2V0VGFnQ29tcGxldGlvbnM6ICh7YnVmZmVyUG9zaXRpb24sIGVkaXRvciwgcHJlZml4fSkgLT5cbiAgICBjb21wbGV0aW9ucyA9IFtdXG4gICAgaWYgcHJlZml4XG4gICAgICBmb3IgdGFnIGluIEB0YWdzIHdoZW4gZmlyc3RDaGFyc0VxdWFsKHRhZywgcHJlZml4KVxuICAgICAgICBjb21wbGV0aW9ucy5wdXNoKEBidWlsZFRhZ0NvbXBsZXRpb24odGFnKSlcbiAgICBjb21wbGV0aW9uc1xuXG4gIGJ1aWxkVGFnQ29tcGxldGlvbjogKHRhZykgLT5cbiAgICB0eXBlOiAndGFnJ1xuICAgIHRleHQ6IHRhZ1xuICAgIGRlc2NyaXB0aW9uOiBcIlNlbGVjdG9yIGZvciA8I3t0YWd9PiBlbGVtZW50c1wiXG5cbmxpbmVFbmRzV2l0aFNlbWljb2xvbiA9IChidWZmZXJQb3NpdGlvbiwgZWRpdG9yKSAtPlxuICB7cm93fSA9IGJ1ZmZlclBvc2l0aW9uXG4gIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVxuICAvO1xccyokLy50ZXN0KGxpbmUpXG5cbmhhc1Njb3BlID0gKHNjb3Blc0FycmF5LCBzY29wZSkgLT5cbiAgc2NvcGVzQXJyYXkuaW5kZXhPZihzY29wZSkgaXNudCAtMVxuXG5maXJzdENoYXJzRXF1YWwgPSAoc3RyMSwgc3RyMikgLT5cbiAgc3RyMVswXS50b0xvd2VyQ2FzZSgpIGlzIHN0cjJbMF0udG9Mb3dlckNhc2UoKVxuXG4jIGxvb2tzIGF0IGEgc3RyaW5nIGFuZCByZXBsYWNlcyBjb25zZWN1dGl2ZSAoKSB3aXRoIGluY3JlbWVudGluZyBzbmlwcGV0IHBvc2l0aW9ucyAoJG4pXG4jIEl0IGFsc28gYWRkcyBhIHRyYWlsaW5nICRuIGF0IGVuZCBvZiB0ZXh0XG4jIGUuZyB0cmFuc2xhdGUoKSBiZWNvbWVzIHRyYW5zbGF0ZSgkMSkkMlxubWFrZVNuaXBwZXQgPSAodGV4dCkgIC0+XG4gIHNuaXBwZXROdW1iZXIgPSAwXG4gIHdoaWxlIHRleHQuaW5jbHVkZXMoJygpJylcbiAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKCcoKScsIFwiKCQjeysrc25pcHBldE51bWJlcn0pXCIpXG4gIHRleHQgPSB0ZXh0ICsgXCIkI3srK3NuaXBwZXROdW1iZXJ9XCJcbiAgcmV0dXJuIHRleHRcbiJdfQ==
