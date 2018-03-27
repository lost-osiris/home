(function() {
  var $, Grammar, JavaScriptSemanticGrammar, acorn, numberOfColors,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = require("jquery");

  Grammar = require("first-mate").Grammar;

  acorn = require("./acorn-modified.js");

  numberOfColors = 8;

  module.exports = JavaScriptSemanticGrammar = (function(superClass) {
    extend(JavaScriptSemanticGrammar, superClass);

    function JavaScriptSemanticGrammar(registry) {
      var name, scopeName;
      name = "JavaScript (Semantic Highlighting)";
      scopeName = "source.js-semantic";
      JavaScriptSemanticGrammar.__super__.constructor.call(this, registry, {
        name: name,
        scopeName: scopeName
      });
    }

    JavaScriptSemanticGrammar.prototype.getScore = function() {
      var jsGrammar;
      jsGrammar = this.registry.grammarForScopeName("source.js");
      if (jsGrammar != null) {
        return jsGrammar.getScore.apply(jsGrammar, arguments) + 1;
      } else {
        return 0;
      }
    };

    JavaScriptSemanticGrammar.prototype.acornTokenize = function(line) {
      var error, onComment, rules, token, tokenizer, tokens;
      tokens = [];
      rules = [];
      onComment = function(block, unterminated, text, start, end) {
        tokens.push({
          start: start,
          end: end,
          type: {
            type: "comment",
            unterminated: unterminated
          }
        });
        if (unterminated) {
          return rules.push("unterminated_comment");
        }
      };
      try {
        tokenizer = acorn.tokenize(line, {
          locations: true,
          onComment: onComment
        });
      } catch (error1) {
        error = error1;
        return {
          tokens: tokens,
          rules: rules
        };
      }
      while (true) {
        try {
          token = tokenizer();
        } catch (error1) {
          error = error1;
          return {
            tokens: tokens,
            rules: rules
          };
        }
        token = $.extend(true, {}, token);
        if (token.type.type === "eof") {
          return {
            tokens: tokens,
            rules: rules
          };
        }
        tokens.push(token);
      }
    };

    JavaScriptSemanticGrammar.prototype.hash = function(string) {
      var chr, hash, i, len;
      hash = 0;
      if (string.length === 0) {
        return hash;
      }
      i = 0;
      len = string.length;
      while (i < len) {
        chr = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
        i++;
      }
      return hash;
    };

    JavaScriptSemanticGrammar.prototype.colorIndex = function(string) {
      return (Math.abs(this.hash(string)) % numberOfColors) + 1;
    };

    JavaScriptSemanticGrammar.prototype.tokenScopes = function(token, text) {
      var colorIndexScope;
      if (token.type.type === "name") {
        colorIndexScope = "color-index-" + this.colorIndex(text);
        return "identifier." + colorIndexScope;
      } else if (token.type.type === "comment") {
        return "comment";
      } else if (token.type.hasOwnProperty("keyword")) {
        return "keyword";
      } else if (token.type.type === "num") {
        return "number";
      } else if (token.type.type === "string") {
        return "string";
      } else if (token.type.type === "regexp") {
        return "regex";
      }
      return null;
    };

    JavaScriptSemanticGrammar.prototype.tokenizeLine = function(line, ruleStack, firstLine) {
      var acornLine, acornStartOffset, acornTokens, addToken, commentEnd, j, len1, outerRegistry, tags, text, token, tokenPos, tokenScopes, tokenizeResult, tokens;
      if (firstLine == null) {
        firstLine = false;
      }
      tags = [];
      tokens = [];
      outerRegistry = this.registry;
      addToken = function(text, scopes) {
        var fullScopes;
        if (scopes == null) {
          scopes = null;
        }
        fullScopes = "source.js-semantic" + (scopes != null ? "." + scopes : "");
        tags.push(outerRegistry.startIdForScope(fullScopes));
        tags.push(text.length);
        tags.push(outerRegistry.endIdForScope(fullScopes));
        return tokens.push({
          value: text,
          scopes: [fullScopes]
        });
      };
      acornStartOffset = 0;
      if ((ruleStack != null) && indexOf.call(ruleStack, "unterminated_comment") >= 0) {
        commentEnd = line.indexOf("*/");
        if (commentEnd === -1) {
          addToken(line, "comment");
          return {
            line: line,
            tags: tags,
            tokens: tokens,
            ruleStack: ruleStack
          };
        } else {
          acornStartOffset = commentEnd + 2;
          addToken(line.substring(0, acornStartOffset), "comment");
        }
      }
      acornLine = line.substring(acornStartOffset);
      tokenizeResult = this.acornTokenize(acornLine);
      acornTokens = tokenizeResult.tokens;
      acornTokens.sort(function(a, b) {
        return a.start - b.start;
      });
      tokenPos = 0;
      for (j = 0, len1 = acornTokens.length; j < len1; j++) {
        token = acornTokens[j];
        text = acornLine.substring(token.start, token.end);
        tokenScopes = this.tokenScopes(token, text);
        if (tokenScopes != null) {
          if (token.start > tokenPos) {
            addToken(acornLine.substring(tokenPos, token.start));
          }
          addToken(text, tokenScopes);
          tokenPos = token.end;
        }
      }
      if (tokenPos < acornLine.length) {
        addToken(acornLine.substring(tokenPos));
      }
      if (tokens.length === 0) {
        addToken("");
      }
      return {
        line: line,
        tags: tags,
        tokens: tokens,
        ruleStack: tokenizeResult.rules
      };
    };

    return JavaScriptSemanticGrammar;

  })(Grammar);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWphdmFzY3JpcHQtc2VtYW50aWMvbGliL2phdmFzY3JpcHQtc2VtYW50aWMtZ3JhbW1hci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUE7QUFBQSxNQUFBLDREQUFBO0lBQUE7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0VBQ0gsVUFBVyxPQUFBLENBQVEsWUFBUjs7RUFDWixLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUVSLGNBQUEsR0FBaUI7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQ007OztJQUNTLG1DQUFDLFFBQUQ7QUFDWCxVQUFBO01BQUEsSUFBQSxHQUFPO01BQ1AsU0FBQSxHQUFZO01BQ1osMkRBQU0sUUFBTixFQUFnQjtRQUFDLE1BQUEsSUFBRDtRQUFPLFdBQUEsU0FBUDtPQUFoQjtJQUhXOzt3Q0FNYixRQUFBLEdBQVUsU0FBQTtBQUNSLFVBQUE7TUFBQSxTQUFBLEdBQVksSUFBQyxDQUFBLFFBQVEsQ0FBQyxtQkFBVixDQUE4QixXQUE5QjtNQUNMLElBQUcsaUJBQUg7ZUFBb0IsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFuQixDQUF5QixTQUF6QixFQUFvQyxTQUFwQyxDQUFBLEdBQWlELEVBQXJFO09BQUEsTUFBQTtlQUE2RSxFQUE3RTs7SUFGQzs7d0NBSVYsYUFBQSxHQUFlLFNBQUMsSUFBRDtBQUNiLFVBQUE7TUFBQSxNQUFBLEdBQVM7TUFDVCxLQUFBLEdBQVE7TUFFUixTQUFBLEdBQVksU0FBQyxLQUFELEVBQVEsWUFBUixFQUFzQixJQUF0QixFQUE0QixLQUE1QixFQUFtQyxHQUFuQztRQUVWLE1BQU0sQ0FBQyxJQUFQLENBQVk7VUFBRSxLQUFBLEVBQU8sS0FBVDtVQUFnQixHQUFBLEVBQUssR0FBckI7VUFBMEIsSUFBQSxFQUFNO1lBQUUsSUFBQSxFQUFNLFNBQVI7WUFB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UUFDRSxJQUFBLEdBQU8sU0FBUyxDQUFDLFNBQVYsQ0FBb0IsS0FBSyxDQUFDLEtBQTFCLEVBQWlDLEtBQUssQ0FBQyxHQUF2QztRQUNQLFdBQUEsR0FBYyxJQUFDLENBQUEsV0FBRCxDQUFhLEtBQWIsRUFBb0IsSUFBcEI7UUFDZCxJQUFHLG1CQUFIO1VBQ0UsSUFBRyxLQUFLLENBQUMsS0FBTixHQUFjLFFBQWpCO1lBQ0UsUUFBQSxDQUFTLFNBQVMsQ0FBQyxTQUFWLENBQW9CLFFBQXBCLEVBQThCLEtBQUssQ0FBQyxLQUFwQyxDQUFULEVBREY7O1VBRUEsUUFBQSxDQUFTLElBQVQsRUFBZSxXQUFmO1VBQ0EsUUFBQSxHQUFXLEtBQUssQ0FBQyxJQUpuQjs7QUFIRjtNQVNBLElBQUcsUUFBQSxHQUFXLFNBQVMsQ0FBQyxNQUF4QjtRQUNFLFFBQUEsQ0FBUyxTQUFTLENBQUMsU0FBVixDQUFvQixRQUFwQixDQUFULEVBREY7O01BR0EsSUFBRyxNQUFNLENBQUMsTUFBUCxLQUFpQixDQUFwQjtRQUNFLFFBQUEsQ0FBUyxFQUFULEVBREY7O0FBR0EsYUFBTztRQUFFLElBQUEsRUFBTSxJQUFSO1FBQWMsSUFBQSxFQUFNLElBQXBCO1FBQTBCLE1BQUEsRUFBUSxNQUFsQztRQUEwQyxTQUFBLEVBQVcsY0FBYyxDQUFDLEtBQXBFOztJQWhESzs7OztLQXZFd0I7QUFQeEMiLCJzb3VyY2VzQ29udGVudCI6WyIjIEphdmFTY3JpcHQgU2VtYW50aWMgSGlnaGxpZ2h0aW5nIFBhY2thZ2UgZm9yIEF0b21cbiNcbiMgQ29weXJpZ2h0IChjKSAyMDE0LTIwMTUgUGhpbGlwcCBFbWFudWVsIFdlaWRtYW5uIDxwZXdAd29ybGR3aWRlbWFubi5jb20+XG4jXG4jIE5lbW8gdmlyIGVzdCBxdWkgbXVuZHVtIG5vbiByZWRkYXQgbWVsaW9yZW0uXG4jXG4jIFJlbGVhc2VkIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUIExpY2Vuc2UgKGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVQpXG5cbiQgPSByZXF1aXJlIFwianF1ZXJ5XCJcbntHcmFtbWFyfSA9IHJlcXVpcmUgXCJmaXJzdC1tYXRlXCJcbmFjb3JuID0gcmVxdWlyZSBcIi4vYWNvcm4tbW9kaWZpZWQuanNcIlxuXG5udW1iZXJPZkNvbG9ycyA9IDhcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgSmF2YVNjcmlwdFNlbWFudGljR3JhbW1hciBleHRlbmRzIEdyYW1tYXJcbiAgY29uc3RydWN0b3I6IChyZWdpc3RyeSkgLT5cbiAgICBuYW1lID0gXCJKYXZhU2NyaXB0IChTZW1hbnRpYyBIaWdobGlnaHRpbmcpXCJcbiAgICBzY29wZU5hbWUgPSBcInNvdXJjZS5qcy1zZW1hbnRpY1wiXG4gICAgc3VwZXIocmVnaXN0cnksIHtuYW1lLCBzY29wZU5hbWV9KVxuXG4gICMgRW5zdXJlcyB0aGF0IGdyYW1tYXIgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIHN0YW5kYXJkIEphdmFTY3JpcHQgZ3JhbW1hclxuICBnZXRTY29yZTogLT5cbiAgICBqc0dyYW1tYXIgPSBAcmVnaXN0cnkuZ3JhbW1hckZvclNjb3BlTmFtZShcInNvdXJjZS5qc1wiKVxuICAgIHJldHVybiBpZiBqc0dyYW1tYXI/IHRoZW4gKGpzR3JhbW1hci5nZXRTY29yZS5hcHBseShqc0dyYW1tYXIsIGFyZ3VtZW50cykgKyAxKSBlbHNlIDBcblxuICBhY29yblRva2VuaXplOiAobGluZSkgLT5cbiAgICB0b2tlbnMgPSBbXVxuICAgIHJ1bGVzID0gW11cblxuICAgIG9uQ29tbWVudCA9IChibG9jaywgdW50ZXJtaW5hdGVkLCB0ZXh0LCBzdGFydCwgZW5kKSAtPlxuICAgICAgIyBBZGQgYSBmYXV4LXRva2VuIGZvciBjb21tZW50IHNpbmNlIEFjb3JuIGRvZXNuJ3QgdG9rZW5pemUgY29tbWVudHNcbiAgICAgIHRva2Vucy5wdXNoIHsgc3RhcnQ6IHN0YXJ0LCBlbmQ6IGVuZCwgdHlwZTogeyB0eXBlOiBcImNvbW1lbnRcIiwgdW50ZXJtaW5hdGVkOiB1bnRlcm1pbmF0ZWQgfSB9XG4gICAgICBpZiB1bnRlcm1pbmF0ZWRcbiAgICAgICAgcnVsZXMucHVzaCBcInVudGVybWluYXRlZF9jb21tZW50XCJcblxuICAgIHRyeVxuICAgICAgdG9rZW5pemVyID0gYWNvcm4udG9rZW5pemUobGluZSwgeyBsb2NhdGlvbnM6IHRydWUsIG9uQ29tbWVudDogb25Db21tZW50IH0pXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgICMgRXJyb3IgaW4gaW5pdFRva2VuU3RhdGVcbiAgICAgIHJldHVybiB7IHRva2VuczogdG9rZW5zLCBydWxlczogcnVsZXMgfVxuXG4gICAgd2hpbGUgdHJ1ZVxuICAgICAgdHJ5XG4gICAgICAgIHRva2VuID0gdG9rZW5pemVyKClcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIHJldHVybiB7IHRva2VuczogdG9rZW5zLCBydWxlczogcnVsZXMgfVxuICAgICAgIyBPYmplY3QgaXMgbXV0YWJsZSwgdGhlcmVmb3JlIGl0IG11c3QgYmUgY2xvbmVkXG4gICAgICB0b2tlbiA9ICQuZXh0ZW5kKHRydWUsIHt9LCB0b2tlbilcbiAgICAgIGlmIHRva2VuLnR5cGUudHlwZSBpcyBcImVvZlwiXG4gICAgICAgIHJldHVybiB7IHRva2VuczogdG9rZW5zLCBydWxlczogcnVsZXMgfVxuICAgICAgdG9rZW5zLnB1c2ggdG9rZW5cblxuICAjIENvbnZlcnRlZCBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzc2MTY0ODRcbiAgIyB3aXRoIHRoZSBoZWxwIG9mIGh0dHA6Ly9qczJjb2ZmZWUub3JnL1xuICBoYXNoOiAoc3RyaW5nKSAtPlxuICAgIGhhc2ggPSAwXG4gICAgcmV0dXJuIGhhc2ggaWYgc3RyaW5nLmxlbmd0aCBpcyAwXG4gICAgaSA9IDBcbiAgICBsZW4gPSBzdHJpbmcubGVuZ3RoXG4gICAgd2hpbGUgaSA8IGxlblxuICAgICAgY2hyID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcbiAgICAgIGhhc2ggPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSArIGNoclxuICAgICAgaGFzaCB8PSAwXG4gICAgICBpKytcbiAgICByZXR1cm4gaGFzaFxuXG4gIGNvbG9ySW5kZXg6IChzdHJpbmcpIC0+XG4gICAgKE1hdGguYWJzKEBoYXNoKHN0cmluZykpICUgbnVtYmVyT2ZDb2xvcnMpICsgMVxuXG4gIHRva2VuU2NvcGVzOiAodG9rZW4sIHRleHQpIC0+XG4gICAgaWYgdG9rZW4udHlwZS50eXBlIGlzIFwibmFtZVwiXG4gICAgICBjb2xvckluZGV4U2NvcGUgPSBcImNvbG9yLWluZGV4LVwiICsgQGNvbG9ySW5kZXgodGV4dClcbiAgICAgIHJldHVybiBcImlkZW50aWZpZXIuXCIgKyBjb2xvckluZGV4U2NvcGVcbiAgICBlbHNlIGlmIHRva2VuLnR5cGUudHlwZSBpcyBcImNvbW1lbnRcIlxuICAgICAgcmV0dXJuIFwiY29tbWVudFwiXG4gICAgZWxzZSBpZiB0b2tlbi50eXBlLmhhc093blByb3BlcnR5KFwia2V5d29yZFwiKVxuICAgICAgcmV0dXJuIFwia2V5d29yZFwiXG4gICAgZWxzZSBpZiB0b2tlbi50eXBlLnR5cGUgaXMgXCJudW1cIlxuICAgICAgcmV0dXJuIFwibnVtYmVyXCJcbiAgICBlbHNlIGlmIHRva2VuLnR5cGUudHlwZSBpcyBcInN0cmluZ1wiXG4gICAgICByZXR1cm4gXCJzdHJpbmdcIlxuICAgIGVsc2UgaWYgdG9rZW4udHlwZS50eXBlIGlzIFwicmVnZXhwXCJcbiAgICAgIHJldHVybiBcInJlZ2V4XCJcbiAgICByZXR1cm4gbnVsbFxuXG4gIHRva2VuaXplTGluZTogKGxpbmUsIHJ1bGVTdGFjaywgZmlyc3RMaW5lID0gZmFsc2UpIC0+XG4gICAgdGFncyA9IFtdXG4gICAgdG9rZW5zID0gW11cblxuICAgIG91dGVyUmVnaXN0cnkgPSBAcmVnaXN0cnlcbiAgICBhZGRUb2tlbiA9ICh0ZXh0LCBzY29wZXMgPSBudWxsKSAtPlxuICAgICAgZnVsbFNjb3BlcyA9IFwic291cmNlLmpzLXNlbWFudGljXCIgKyAoaWYgc2NvcGVzPyB0aGVuIChcIi5cIiArIHNjb3BlcykgZWxzZSBcIlwiKVxuICAgICAgdGFncy5wdXNoIG91dGVyUmVnaXN0cnkuc3RhcnRJZEZvclNjb3BlKGZ1bGxTY29wZXMpXG4gICAgICB0YWdzLnB1c2ggdGV4dC5sZW5ndGhcbiAgICAgIHRhZ3MucHVzaCBvdXRlclJlZ2lzdHJ5LmVuZElkRm9yU2NvcGUoZnVsbFNjb3BlcylcbiAgICAgIHRva2Vucy5wdXNoIHsgdmFsdWU6IHRleHQsIHNjb3BlczogW2Z1bGxTY29wZXNdIH1cblxuICAgIGFjb3JuU3RhcnRPZmZzZXQgPSAwXG4gICAgaWYgcnVsZVN0YWNrPyBhbmQgXCJ1bnRlcm1pbmF0ZWRfY29tbWVudFwiIGluIHJ1bGVTdGFja1xuICAgICAgIyBIZWxwIEFjb3JuIHRva2VuaXplIG11bHRpLWxpbmUgY29tbWVudHMgY29ycmVjdGx5XG4gICAgICBjb21tZW50RW5kID0gbGluZS5pbmRleE9mKFwiKi9cIilcbiAgICAgIGlmIGNvbW1lbnRFbmQgaXMgLTFcbiAgICAgICAgIyBNdWx0aS1saW5lIGNvbW1lbnQgY29udGludWVzXG4gICAgICAgIGFkZFRva2VuIGxpbmUsIFwiY29tbWVudFwiXG4gICAgICAgIHJldHVybiB7IGxpbmU6IGxpbmUsIHRhZ3M6IHRhZ3MsIHRva2VuczogdG9rZW5zLCBydWxlU3RhY2s6IHJ1bGVTdGFjayB9XG4gICAgICBlbHNlXG4gICAgICAgICMgTWFrZSBBY29ybiBza2lwIG92ZXIgcGFydGlhbCBjb21tZW50XG4gICAgICAgIGFjb3JuU3RhcnRPZmZzZXQgPSBjb21tZW50RW5kICsgMlxuICAgICAgICBhZGRUb2tlbiBsaW5lLnN1YnN0cmluZygwLCBhY29yblN0YXJ0T2Zmc2V0KSwgXCJjb21tZW50XCJcblxuICAgIGFjb3JuTGluZSA9IGxpbmUuc3Vic3RyaW5nKGFjb3JuU3RhcnRPZmZzZXQpXG5cbiAgICB0b2tlbml6ZVJlc3VsdCA9IEBhY29yblRva2VuaXplKGFjb3JuTGluZSlcbiAgICBhY29yblRva2VucyA9IHRva2VuaXplUmVzdWx0LnRva2Vuc1xuICAgICMgQ29tbWVudCB0b2tlbnMgbWlnaHQgaGF2ZSBiZWVuIGluc2VydGVkIGluIHRoZSB3cm9uZyBwbGFjZVxuICAgIGFjb3JuVG9rZW5zLnNvcnQoKGEsIGIpIC0+IGEuc3RhcnQgLSBiLnN0YXJ0KVxuXG4gICAgdG9rZW5Qb3MgPSAwXG4gICAgZm9yIHRva2VuIGluIGFjb3JuVG9rZW5zXG4gICAgICB0ZXh0ID0gYWNvcm5MaW5lLnN1YnN0cmluZyh0b2tlbi5zdGFydCwgdG9rZW4uZW5kKVxuICAgICAgdG9rZW5TY29wZXMgPSBAdG9rZW5TY29wZXModG9rZW4sIHRleHQpXG4gICAgICBpZiB0b2tlblNjb3Blcz9cbiAgICAgICAgaWYgdG9rZW4uc3RhcnQgPiB0b2tlblBvc1xuICAgICAgICAgIGFkZFRva2VuIGFjb3JuTGluZS5zdWJzdHJpbmcodG9rZW5Qb3MsIHRva2VuLnN0YXJ0KVxuICAgICAgICBhZGRUb2tlbiB0ZXh0LCB0b2tlblNjb3Blc1xuICAgICAgICB0b2tlblBvcyA9IHRva2VuLmVuZFxuXG4gICAgaWYgdG9rZW5Qb3MgPCBhY29ybkxpbmUubGVuZ3RoXG4gICAgICBhZGRUb2tlbiBhY29ybkxpbmUuc3Vic3RyaW5nKHRva2VuUG9zKVxuXG4gICAgaWYgdG9rZW5zLmxlbmd0aCBpcyAwXG4gICAgICBhZGRUb2tlbiBcIlwiXG5cbiAgICByZXR1cm4geyBsaW5lOiBsaW5lLCB0YWdzOiB0YWdzLCB0b2tlbnM6IHRva2VucywgcnVsZVN0YWNrOiB0b2tlbml6ZVJlc3VsdC5ydWxlcyB9XG4iXX0=
