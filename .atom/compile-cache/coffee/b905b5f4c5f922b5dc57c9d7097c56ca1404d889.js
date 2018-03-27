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
    excludeLowerPriority: false,
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
      return this.isPropertyNamePrefix(prefix) && ((scope[0] === 'meta.property-list.css') || (scope[0] === 'source.css.styled') || (scope[0] === 'entity.name.tag.css') || (scope[0] === 'source.inside-js.css.styled'));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWJhYmVsL2xpYi9hdXRvLWNvbXBsZXRlLXN0eWxlZC1jb21wb25lbnRzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFLQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCx1Q0FBQSxHQUEwQzs7RUFDMUMsa0NBQUEsR0FBcUM7O0VBQ3JDLDRCQUFBLEdBQStCOztFQUMvQix5QkFBQSxHQUE0Qjs7RUFDNUIsMkJBQUEsR0FBOEI7O0VBQzlCLHdCQUFBLEdBQTJCOztFQUMzQixzQkFBQSxHQUF5Qjs7RUFDekIsVUFBQSxHQUFhOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsa0RBQVY7SUFDQSxrQkFBQSxFQUFvQiwwT0FEcEI7SUFHQSxpQkFBQSxFQUFtQixJQUhuQjtJQUlBLGlCQUFBLEVBQW1CLEtBSm5CO0lBS0Esb0JBQUEsRUFBc0IsS0FMdEI7SUFPQSxjQUFBLEVBQWdCLFNBQUMsT0FBRDtBQUNkLFVBQUE7TUFBQSxXQUFBLEdBQWM7TUFDZCxNQUFBLEdBQVMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxjQUF4QixDQUFBO01BRVQsSUFBRyxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsT0FBbkIsQ0FBSDtRQUNFLFdBQUEsR0FBYyxJQUFDLENBQUEsMkJBQUQsQ0FBNkIsT0FBN0IsRUFEaEI7T0FBQSxNQUVLLElBQUcsSUFBQyxDQUFBLDBCQUFELENBQTRCLE9BQTVCLENBQUg7UUFDSCxXQUFBLEdBQWMsSUFBQyxDQUFBLDRCQUFELENBQThCLE9BQTlCLEVBRFg7T0FBQSxNQUFBO1FBR0gsSUFBRyxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsT0FBbEIsQ0FBSDtVQUNFLFdBQUEsR0FBYyxJQUFDLENBQUEsMEJBQUQsQ0FB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Yi5jb20vYXRvbS9hdXRvY29tcGxldGUtY3NzIGJ1dCBoYXMgYmVlbiBtb2RpZmllZCB0byBhbGxvdyBpdCB0byBiZSB1c2VkXG4jIGZvciBzdHlsZWQtY29tcG9uZW5ldHMuIFRoZSBjb21wbGV0aW9ucy5qc29uIGZpbGUgdXNlZCB0byBhdXRvIGNvbXBsZXRlIGlzIGEgY29weSBvZiB0aGUgb25lIHVzZWQgYnkgdGhlIGF0b21cbiMgcGFja2FnZS4gVGhhdCBwYWNrYWdlLCBwcm92aWRlZCBhcyBhbiBBdG9tIGJhc2UgcGFja2FnZSwgaGFzIHRvb2xzIHRvIHVwZGF0ZSB0aGUgY29tcGxldGlvbnMuanNvbiBmaWxlIGZyb20gdGhlIHdlYi5cbiMgU2VlIHRoYXQgcGFja2FnZSBmb3IgbW9yZSBpbmZvIGFuZCBqdXN0IGNvcHkgdGhlIGNvbXBsZXRpb25zLmpzb24gdG8gdGhpcyBmaWxlcyBkaXJlY3Rvcnkgd2hlbiBhIHJlZnJlc2ggaXMgbmVlZGVkLlxuXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbmZpcnN0SW5saW5lUHJvcGVydHlOYW1lV2l0aENvbG9uUGF0dGVybiA9IC97XFxzKihcXFMrKVxccyo6LyAjIC5leGFtcGxlIHsgZGlzcGxheTogfVxuaW5saW5lUHJvcGVydHlOYW1lV2l0aENvbG9uUGF0dGVybiA9IC8oPzo7Lis/KSo7XFxzKihcXFMrKVxccyo6LyAjIC5leGFtcGxlIHsgZGlzcGxheTogYmxvY2s7IGZsb2F0OiBsZWZ0OyBjb2xvcjogfSAobWF0Y2ggdGhlIGxhc3Qgb25lKVxucHJvcGVydHlOYW1lV2l0aENvbG9uUGF0dGVybiA9IC9eXFxzKihcXFMrKVxccyo6LyAjIGRpc3BsYXk6XG5wcm9wZXJ0eU5hbWVQcmVmaXhQYXR0ZXJuID0gL1thLXpBLVpdK1stYS16QS1aXSokL1xucGVzdWRvU2VsZWN0b3JQcmVmaXhQYXR0ZXJuID0gLzooOik/KFthLXpdK1thLXotXSopPyQvXG50YWdTZWxlY3RvclByZWZpeFBhdHRlcm4gPSAvKF58XFxzfCwpKFthLXpdKyk/JC9cbmltcG9ydGFudFByZWZpeFBhdHRlcm4gPSAvKCFbYS16XSspJC9cbmNzc0RvY3NVUkwgPSBcImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTU1wiXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgc2VsZWN0b3I6ICcuc291cmNlLmluc2lkZS1qcy5jc3Muc3R5bGVkLCAuc291cmNlLmNzcy5zdHlsZWQnXG4gIGRpc2FibGVGb3JTZWxlY3RvcjogXCIuc291cmNlLmluc2lkZS1qcy5jc3Muc3R5bGVkIC5jb21tZW50LCAuc291cmNlLmluc2lkZS1qcy5jc3Muc3R5bGVkIC5zdHJpbmcsIC5zb3VyY2UuaW5zaWRlLWpzLmNzcy5zdHlsZWQgLmVudGl0eS5xdWFzaS5lbGVtZW50LmpzLCAuc291cmNlLmNzcy5zdHlsZWQgLmNvbW1lbnQsIC5zb3VyY2UuY3NzLnN0eWxlZCAuc3RyaW5nLCAuc291cmNlLmNzcy5zdHlsZWQgLmVudGl0eS5xdWFzaS5lbGVtZW50LmpzXCJcblxuICBmaWx0ZXJTdWdnZXN0aW9uczogdHJ1ZVxuICBpbmNsdXNpb25Qcmlvcml0eTogMTAwMDBcbiAgZXhjbHVkZUxvd2VyUHJpb3JpdHk6IGZhbHNlXG5cbiAgZ2V0U3VnZ2VzdGlvbnM6IChyZXF1ZXN0KSAtPlxuICAgIGNvbXBsZXRpb25zID0gbnVsbFxuICAgIHNjb3BlcyA9IHJlcXVlc3Quc2NvcGVEZXNjcmlwdG9yLmdldFNjb3Blc0FycmF5KClcblxuICAgIGlmIEBpc0NvbXBsZXRpbmdWYWx1ZShyZXF1ZXN0KVxuICAgICAgY29tcGxldGlvbnMgPSBAZ2V0UHJvcGVydHlWYWx1ZUNvbXBsZXRpb25zKHJlcXVlc3QpXG4gICAgZWxzZSBpZiBAaXNDb21wbGV0aW5nUHNldWRvU2VsZWN0b3IocmVxdWVzdClcbiAgICAgIGNvbXBsZXRpb25zID0gQGdldFBzZXVkb1NlbGVjdG9yQ29tcGxldGlvbnMocmVxdWVzdClcbiAgICBlbHNlXG4gICAgICBpZiBAaXNDb21wbGV0aW5nTmFtZShyZXF1ZXN0KVxuICAgICAgICBjb21wbGV0aW9ucyA9IEBnZXRQcm9wZXJ0eU5hbWVDb21wbGV0aW9ucyhyZXF1ZXN0KVxuICAgICAgZWxzZSBpZiBAaXNDb21wbGV0aW5nTmFtZU9yVGFnKHJlcXVlc3QpXG4gICAgICAgIGNvbXBsZXRpb25zID0gQGdldFByb3BlcnR5TmFtZUNvbXBsZXRpb25zKHJlcXVlc3QpXG4gICAgICAgICAgLmNvbmNhdChAZ2V0VGFnQ29tcGxldGlvbnMocmVxdWVzdCkpXG5cbiAgICByZXR1cm4gY29tcGxldGlvbnNcblxuICBvbkRpZEluc2VydFN1Z2dlc3Rpb246ICh7ZWRpdG9yLCBzdWdnZXN0aW9ufSkgLT5cbiAgICBzZXRUaW1lb3V0KEB0cmlnZ2VyQXV0b2NvbXBsZXRlLmJpbmQodGhpcywgZWRpdG9yKSwgMSkgaWYgc3VnZ2VzdGlvbi50eXBlIGlzICdwcm9wZXJ0eSdcblxuICB0cmlnZ2VyQXV0b2NvbXBsZXRlOiAoZWRpdG9yKSAtPlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvciksICdhdXRvY29tcGxldGUtcGx1czphY3RpdmF0ZScsIHthY3RpdmF0ZWRNYW51YWxseTogZmFsc2V9KVxuXG4gIGxvYWRQcm9wZXJ0aWVzOiAtPlxuICAgIEBwcm9wZXJ0aWVzID0ge31cbiAgICBmcy5yZWFkRmlsZSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnY29tcGxldGlvbnMuanNvbicpLCAoZXJyb3IsIGNvbnRlbnQpID0+XG4gICAgICB7QHBzZXVkb1NlbGVjdG9ycywgQHByb3BlcnRpZXMsIEB0YWdzfSA9IEpTT04ucGFyc2UoY29udGVudCkgdW5sZXNzIGVycm9yP1xuXG4gICAgICByZXR1cm5cblxuICBpc0NvbXBsZXRpbmdWYWx1ZTogKHtzY29wZURlc2NyaXB0b3IsIGJ1ZmZlclBvc2l0aW9uLCBwcmVmaXgsIGVkaXRvcn0pIC0+XG4gICAgc2NvcGVzID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3Blc0FycmF5KClcblxuICAgIGJlZm9yZVByZWZpeEJ1ZmZlclBvc2l0aW9uID0gW2J1ZmZlclBvc2l0aW9uLnJvdywgTWF0aC5tYXgoMCwgYnVmZmVyUG9zaXRpb24uY29sdW1uIC0gcHJlZml4Lmxlbmd0aCAtIDEpXVxuICAgIGJlZm9yZVByZWZpeFNjb3BlcyA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihiZWZvcmVQcmVmaXhCdWZmZXJQb3NpdGlvbilcbiAgICBiZWZvcmVQcmVmaXhTY29wZXNBcnJheSA9IGJlZm9yZVByZWZpeFNjb3Blcy5nZXRTY29wZXNBcnJheSgpXG5cbiAgICByZXR1cm4gKGhhc1Njb3BlKHNjb3BlcywgJ21ldGEucHJvcGVydHktdmFsdWVzLmNzcycpKSBvclxuICAgICAgKGhhc1Njb3BlKGJlZm9yZVByZWZpeFNjb3Blc0FycmF5ICwgJ21ldGEucHJvcGVydHktdmFsdWVzLmNzcycpKVxuXG4gIGlzQ29tcGxldGluZ05hbWU6ICh7c2NvcGVEZXNjcmlwdG9yLCBidWZmZXJQb3NpdGlvbiwgZWRpdG9yfSkgLT5cbiAgICBzY29wZSA9IHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpLnNsaWNlKC0xKVxuICAgIHByZWZpeCA9IEBnZXRQcm9wZXJ0eU5hbWVQcmVmaXgoYnVmZmVyUG9zaXRpb24sIGVkaXRvcilcbiAgICByZXR1cm4gQGlzUHJvcGVydHlOYW1lUHJlZml4KHByZWZpeCkgYW5kIChzY29wZVswXSBpcyAnbWV0YS5wcm9wZXJ0eS1saXN0LmNzcycpXG5cbiAgaXNDb21wbGV0aW5nTmFtZU9yVGFnOiAoe3Njb3BlRGVzY3JpcHRvciwgYnVmZmVyUG9zaXRpb24sIGVkaXRvcn0pIC0+XG4gICAgc2NvcGUgPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVzQXJyYXkoKS5zbGljZSgtMSlcbiAgICBwcmVmaXggPSBAZ2V0UHJvcGVydHlOYW1lUHJlZml4KGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3IpXG4gICAgcmV0dXJuIEBpc1Byb3BlcnR5TmFtZVByZWZpeChwcmVmaXgpIGFuZFxuICAgICAoKHNjb3BlWzBdIGlzICdtZXRhLnByb3BlcnR5LWxpc3QuY3NzJykgb3JcbiAgICAgIChzY29wZVswXSBpcyAnc291cmNlLmNzcy5zdHlsZWQnKSBvclxuICAgICAgKHNjb3BlWzBdIGlzICdlbnRpdHkubmFtZS50YWcuY3NzJykgb3JcbiAgICAgIChzY29wZVswXSBpcyAnc291cmNlLmluc2lkZS1qcy5jc3Muc3R5bGVkJykpXG5cbiAgaXNDb21wbGV0aW5nUHNldWRvU2VsZWN0b3I6ICh7ZWRpdG9yLCBzY29wZURlc2NyaXB0b3IsIGJ1ZmZlclBvc2l0aW9ufSkgLT5cbiAgICBzY29wZSA9IHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpLnNsaWNlKC0xKVxuICAgIHJldHVybiAoICggc2NvcGVbMF0gaXMgJ2NvbnN0YW50Lmxhbmd1YWdlLnBzZXVkby5wcmVmaXhlZC5jc3MnKSBvclxuICAgICAgKCBzY29wZVswXSBpcyAna2V5d29yZC5vcGVyYXRvci5wc2V1ZG8uY3NzJykgKVxuXG4gIGlzUHJvcGVydHlWYWx1ZVByZWZpeDogKHByZWZpeCkgLT5cbiAgICBwcmVmaXggPSBwcmVmaXgudHJpbSgpXG4gICAgcHJlZml4Lmxlbmd0aCA+IDAgYW5kIHByZWZpeCBpc250ICc6J1xuXG4gIGlzUHJvcGVydHlOYW1lUHJlZml4OiAocHJlZml4KSAtPlxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgcHJlZml4P1xuICAgIHByZWZpeCA9IHByZWZpeC50cmltKClcbiAgICBwcmVmaXgubWF0Y2goL15bYS16QS1aLV0rJC8pXG5cbiAgZ2V0SW1wb3J0YW50UHJlZml4OiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuICAgIGltcG9ydGFudFByZWZpeFBhdHRlcm4uZXhlYyhsaW5lKT9bMV1cblxuICBnZXRQcmV2aW91c1Byb3BlcnR5TmFtZTogKGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3IpIC0+XG4gICAge3Jvd30gPSBidWZmZXJQb3NpdGlvblxuICAgIHdoaWxlIHJvdyA+PSAwXG4gICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdylcbiAgICAgIHByb3BlcnR5TmFtZSA9IGlubGluZVByb3BlcnR5TmFtZVdpdGhDb2xvblBhdHRlcm4uZXhlYyhsaW5lKT9bMV1cbiAgICAgIHByb3BlcnR5TmFtZSA/PSBmaXJzdElubGluZVByb3BlcnR5TmFtZVdpdGhDb2xvblBhdHRlcm4uZXhlYyhsaW5lKT9bMV1cbiAgICAgIHByb3BlcnR5TmFtZSA/PSBwcm9wZXJ0eU5hbWVXaXRoQ29sb25QYXR0ZXJuLmV4ZWMobGluZSk/WzFdXG4gICAgICByZXR1cm4gcHJvcGVydHlOYW1lIGlmIHByb3BlcnR5TmFtZVxuICAgICAgcm93LS1cbiAgICByZXR1cm5cblxuICBnZXRQcm9wZXJ0eVZhbHVlQ29tcGxldGlvbnM6ICh7YnVmZmVyUG9zaXRpb24sIGVkaXRvciwgcHJlZml4LCBzY29wZURlc2NyaXB0b3J9KSAtPlxuICAgIHByb3BlcnR5ID0gQGdldFByZXZpb3VzUHJvcGVydHlOYW1lKGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3IpXG4gICAgdmFsdWVzID0gQHByb3BlcnRpZXNbcHJvcGVydHldPy52YWx1ZXNcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgdmFsdWVzP1xuXG4gICAgc2NvcGVzID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3Blc0FycmF5KClcbiAgICBhZGRTZW1pY29sb24gPSBub3QgbGluZUVuZHNXaXRoU2VtaWNvbG9uKGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3IpXG5cbiAgICBjb21wbGV0aW9ucyA9IFtdXG4gICAgaWYgQGlzUHJvcGVydHlWYWx1ZVByZWZpeChwcmVmaXgpXG4gICAgICBmb3IgdmFsdWUgaW4gdmFsdWVzIHdoZW4gZmlyc3RDaGFyc0VxdWFsKHZhbHVlLCBwcmVmaXgpXG4gICAgICAgIGNvbXBsZXRpb25zLnB1c2goQGJ1aWxkUHJvcGVydHlWYWx1ZUNvbXBsZXRpb24odmFsdWUsIHByb3BlcnR5LCBhZGRTZW1pY29sb24pKVxuICAgIGVsc2VcbiAgICAgIGZvciB2YWx1ZSBpbiB2YWx1ZXNcbiAgICAgICAgY29tcGxldGlvbnMucHVzaChAYnVpbGRQcm9wZXJ0eVZhbHVlQ29tcGxldGlvbih2YWx1ZSwgcHJvcGVydHksIGFkZFNlbWljb2xvbikpXG5cbiAgICBpZiBpbXBvcnRhbnRQcmVmaXggPSBAZ2V0SW1wb3J0YW50UHJlZml4KGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICBjb21wbGV0aW9ucy5wdXNoXG4gICAgICAgIHR5cGU6ICdrZXl3b3JkJ1xuICAgICAgICB0ZXh0OiAnIWltcG9ydGFudCdcbiAgICAgICAgZGlzcGxheVRleHQ6ICchaW1wb3J0YW50J1xuICAgICAgICByZXBsYWNlbWVudFByZWZpeDogaW1wb3J0YW50UHJlZml4XG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkZvcmNlcyB0aGlzIHByb3BlcnR5IHRvIG92ZXJyaWRlIGFueSBvdGhlciBkZWNsYXJhdGlvbiBvZiB0aGUgc2FtZSBwcm9wZXJ0eS4gVXNlIHdpdGggY2F1dGlvbi5cIlxuICAgICAgICBkZXNjcmlwdGlvbk1vcmVVUkw6IFwiI3tjc3NEb2NzVVJMfS9TcGVjaWZpY2l0eSNUaGVfIWltcG9ydGFudF9leGNlcHRpb25cIlxuXG4gICAgY29tcGxldGlvbnNcblxuICBidWlsZFByb3BlcnR5VmFsdWVDb21wbGV0aW9uOiAodmFsdWUsIHByb3BlcnR5TmFtZSwgYWRkU2VtaWNvbG9uKSAtPlxuICAgIHRleHQgPSB2YWx1ZVxuICAgIHRleHQgKz0gJzsnIGlmIGFkZFNlbWljb2xvblxuICAgIHRleHQgPSBtYWtlU25pcHBldCh0ZXh0KVxuXG4gICAge1xuICAgICAgdHlwZTogJ3ZhbHVlJ1xuICAgICAgc25pcHBldDogdGV4dFxuICAgICAgZGlzcGxheVRleHQ6IHZhbHVlXG4gICAgICBkZXNjcmlwdGlvbjogXCIje3ZhbHVlfSB2YWx1ZSBmb3IgdGhlICN7cHJvcGVydHlOYW1lfSBwcm9wZXJ0eVwiXG4gICAgICBkZXNjcmlwdGlvbk1vcmVVUkw6IFwiI3tjc3NEb2NzVVJMfS8je3Byb3BlcnR5TmFtZX0jVmFsdWVzXCJcbiAgICB9XG5cbiAgZ2V0UHJvcGVydHlOYW1lUHJlZml4OiAoYnVmZmVyUG9zaXRpb24sIGVkaXRvcikgLT5cbiAgICBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuICAgIHByb3BlcnR5TmFtZVByZWZpeFBhdHRlcm4uZXhlYyhsaW5lKT9bMF1cblxuICBnZXRQcm9wZXJ0eU5hbWVDb21wbGV0aW9uczogKHtidWZmZXJQb3NpdGlvbiwgZWRpdG9yLCBzY29wZURlc2NyaXB0b3IsIGFjdGl2YXRlZE1hbnVhbGx5fSkgLT5cbiAgICBzY29wZXMgPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIGxpbmUgPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3csIDBdLCBidWZmZXJQb3NpdGlvbl0pXG5cbiAgICBwcmVmaXggPSBAZ2V0UHJvcGVydHlOYW1lUHJlZml4KGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3IpXG4gICAgcmV0dXJuIFtdIHVubGVzcyBhY3RpdmF0ZWRNYW51YWxseSBvciBwcmVmaXhcblxuICAgIGNvbXBsZXRpb25zID0gW11cbiAgICBmb3IgcHJvcGVydHksIG9wdGlvbnMgb2YgQHByb3BlcnRpZXMgd2hlbiBub3QgcHJlZml4IG9yIGZpcnN0Q2hhcnNFcXVhbChwcm9wZXJ0eSwgcHJlZml4KVxuICAgICAgY29tcGxldGlvbnMucHVzaChAYnVpbGRQcm9wZXJ0eU5hbWVDb21wbGV0aW9uKHByb3BlcnR5LCBwcmVmaXgsIG9wdGlvbnMpKVxuICAgIGNvbXBsZXRpb25zXG5cbiAgYnVpbGRQcm9wZXJ0eU5hbWVDb21wbGV0aW9uOiAocHJvcGVydHlOYW1lLCBwcmVmaXgsIHtkZXNjcmlwdGlvbn0pIC0+XG4gICAgdHlwZTogJ3Byb3BlcnR5J1xuICAgIHRleHQ6IFwiI3twcm9wZXJ0eU5hbWV9OiBcIlxuICAgIGRpc3BsYXlUZXh0OiBwcm9wZXJ0eU5hbWVcbiAgICByZXBsYWNlbWVudFByZWZpeDogcHJlZml4XG4gICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uXG4gICAgZGVzY3JpcHRpb25Nb3JlVVJMOiBcIiN7Y3NzRG9jc1VSTH0vI3twcm9wZXJ0eU5hbWV9XCJcblxuICBnZXRQc2V1ZG9TZWxlY3RvclByZWZpeDogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSlcbiAgICBsaW5lLm1hdGNoKHBlc3Vkb1NlbGVjdG9yUHJlZml4UGF0dGVybik/WzBdXG5cbiAgZ2V0UHNldWRvU2VsZWN0b3JDb21wbGV0aW9uczogKHtidWZmZXJQb3NpdGlvbiwgZWRpdG9yfSkgLT5cbiAgICBwcmVmaXggPSBAZ2V0UHNldWRvU2VsZWN0b3JQcmVmaXgoZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcHJlZml4XG5cbiAgICBjb21wbGV0aW9ucyA9IFtdXG4gICAgZm9yIHBzZXVkb1NlbGVjdG9yLCBvcHRpb25zIG9mIEBwc2V1ZG9TZWxlY3RvcnMgd2hlbiBmaXJzdENoYXJzRXF1YWwocHNldWRvU2VsZWN0b3IsIHByZWZpeClcbiAgICAgIGNvbXBsZXRpb25zLnB1c2goQGJ1aWxkUHNldWRvU2VsZWN0b3JDb21wbGV0aW9uKHBzZXVkb1NlbGVjdG9yLCBwcmVmaXgsIG9wdGlvbnMpKVxuICAgIGNvbXBsZXRpb25zXG5cbiAgYnVpbGRQc2V1ZG9TZWxlY3RvckNvbXBsZXRpb246IChwc2V1ZG9TZWxlY3RvciwgcHJlZml4LCB7YXJndW1lbnQsIGRlc2NyaXB0aW9ufSkgLT5cbiAgICBjb21wbGV0aW9uID1cbiAgICAgIHR5cGU6ICdwc2V1ZG8tc2VsZWN0b3InXG4gICAgICByZXBsYWNlbWVudFByZWZpeDogcHJlZml4XG4gICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb25cbiAgICAgIGRlc2NyaXB0aW9uTW9yZVVSTDogXCIje2Nzc0RvY3NVUkx9LyN7cHNldWRvU2VsZWN0b3J9XCJcblxuICAgIGlmIGFyZ3VtZW50P1xuICAgICAgY29tcGxldGlvbi5zbmlwcGV0ID0gXCIje3BzZXVkb1NlbGVjdG9yfSgkezE6I3thcmd1bWVudH19KVwiXG4gICAgZWxzZVxuICAgICAgY29tcGxldGlvbi50ZXh0ID0gcHNldWRvU2VsZWN0b3JcbiAgICBjb21wbGV0aW9uXG5cbiAgZ2V0VGFnU2VsZWN0b3JQcmVmaXg6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgIGxpbmUgPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3csIDBdLCBidWZmZXJQb3NpdGlvbl0pXG4gICAgdGFnU2VsZWN0b3JQcmVmaXhQYXR0ZXJuLmV4ZWMobGluZSk/WzJdXG5cbiAgZ2V0VGFnQ29tcGxldGlvbnM6ICh7YnVmZmVyUG9zaXRpb24sIGVkaXRvciwgcHJlZml4fSkgLT5cbiAgICBjb21wbGV0aW9ucyA9IFtdXG4gICAgaWYgcHJlZml4XG4gICAgICBmb3IgdGFnIGluIEB0YWdzIHdoZW4gZmlyc3RDaGFyc0VxdWFsKHRhZywgcHJlZml4KVxuICAgICAgICBjb21wbGV0aW9ucy5wdXNoKEBidWlsZFRhZ0NvbXBsZXRpb24odGFnKSlcbiAgICBjb21wbGV0aW9uc1xuXG4gIGJ1aWxkVGFnQ29tcGxldGlvbjogKHRhZykgLT5cbiAgICB0eXBlOiAndGFnJ1xuICAgIHRleHQ6IHRhZ1xuICAgIGRlc2NyaXB0aW9uOiBcIlNlbGVjdG9yIGZvciA8I3t0YWd9PiBlbGVtZW50c1wiXG5cbmxpbmVFbmRzV2l0aFNlbWljb2xvbiA9IChidWZmZXJQb3NpdGlvbiwgZWRpdG9yKSAtPlxuICB7cm93fSA9IGJ1ZmZlclBvc2l0aW9uXG4gIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVxuICAvO1xccyokLy50ZXN0KGxpbmUpXG5cbmhhc1Njb3BlID0gKHNjb3Blc0FycmF5LCBzY29wZSkgLT5cbiAgc2NvcGVzQXJyYXkuaW5kZXhPZihzY29wZSkgaXNudCAtMVxuXG5maXJzdENoYXJzRXF1YWwgPSAoc3RyMSwgc3RyMikgLT5cbiAgc3RyMVswXS50b0xvd2VyQ2FzZSgpIGlzIHN0cjJbMF0udG9Mb3dlckNhc2UoKVxuXG4jIGxvb2tzIGF0IGEgc3RyaW5nIGFuZCByZXBsYWNlcyBjb25zZWN1dGl2ZSAoKSB3aXRoIGluY3JlbWVudGluZyBzbmlwcGV0IHBvc2l0aW9ucyAoJG4pXG4jIEl0IGFsc28gYWRkcyBhIHRyYWlsaW5nICRuIGF0IGVuZCBvZiB0ZXh0XG4jIGUuZyB0cmFuc2xhdGUoKSBiZWNvbWVzIHRyYW5zbGF0ZSgkMSkkMlxubWFrZVNuaXBwZXQgPSAodGV4dCkgIC0+XG4gIHNuaXBwZXROdW1iZXIgPSAwXG4gIHdoaWxlIHRleHQuaW5jbHVkZXMoJygpJylcbiAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKCcoKScsIFwiKCQjeysrc25pcHBldE51bWJlcn0pXCIpXG4gIHRleHQgPSB0ZXh0ICsgXCIkI3srK3NuaXBwZXROdW1iZXJ9XCJcbiAgcmV0dXJuIHRleHRcbiJdfQ==
