(function() {
  var COMPLETIONS, JSXATTRIBUTE, JSXENDTAGSTART, JSXREGEXP, JSXSTARTTAGEND, JSXTAG, Point, REACTURL, Range, TAGREGEXP, filter, ref, ref1, score,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require("atom"), Range = ref.Range, Point = ref.Point;

  ref1 = require("fuzzaldrin"), filter = ref1.filter, score = ref1.score;

  JSXSTARTTAGEND = 0;

  JSXENDTAGSTART = 1;

  JSXTAG = 2;

  JSXATTRIBUTE = 3;

  JSXREGEXP = /(?:(<)|(<\/))([$_A-Za-z](?:[$._:\-a-zA-Z0-9])*)|(?:(\/>)|(>))/g;

  TAGREGEXP = /<([$_a-zA-Z][$._:\-a-zA-Z0-9]*)($|\s|\/>|>)/g;

  COMPLETIONS = require("./completions-jsx");

  REACTURL = "http://facebook.github.io/react/docs/tags-and-attributes.html";

  module.exports = {
    selector: ".meta.tag.jsx",
    inclusionPriority: 10000,
    excludeLowerPriority: false,
    getSuggestions: function(opts) {
      var attribute, bufferPosition, editor, elementObj, filteredAttributes, htmlElement, htmlElements, i, j, jsxRange, jsxTag, k, len, len1, len2, prefix, ref2, scopeDescriptor, startOfJSX, suggestions, tagName, tagNameStack;
      editor = opts.editor, bufferPosition = opts.bufferPosition, scopeDescriptor = opts.scopeDescriptor, prefix = opts.prefix;
      if (editor.getGrammar().packageName !== "language-babel") {
        return;
      }
      jsxTag = this.getTriggerTag(editor, bufferPosition);
      if (jsxTag == null) {
        return;
      }
      suggestions = [];
      if (jsxTag === JSXSTARTTAGEND) {
        startOfJSX = this.getStartOfJSX(editor, bufferPosition);
        jsxRange = new Range(startOfJSX, bufferPosition);
        tagNameStack = this.buildTagStack(editor, jsxRange);
        while ((tagName = tagNameStack.pop()) != null) {
          suggestions.push({
            snippet: "$1</" + tagName + ">",
            type: "tag",
            description: "language-babel tag closer"
          });
        }
      } else if (jsxTag === JSXENDTAGSTART) {
        startOfJSX = this.getStartOfJSX(editor, bufferPosition);
        jsxRange = new Range(startOfJSX, bufferPosition);
        tagNameStack = this.buildTagStack(editor, jsxRange);
        while ((tagName = tagNameStack.pop()) != null) {
          suggestions.push({
            snippet: tagName + ">",
            type: "tag",
            description: "language-babel tag closer"
          });
        }
      } else if (jsxTag === JSXTAG) {
        if (!/^[a-z]/g.exec(prefix)) {
          return;
        }
        htmlElements = filter(COMPLETIONS.htmlElements, prefix, {
          key: "name"
        });
        for (i = 0, len = htmlElements.length; i < len; i++) {
          htmlElement = htmlElements[i];
          if (score(htmlElement.name, prefix) < 0.07) {
            continue;
          }
          suggestions.push({
            snippet: htmlElement.name,
            type: "tag",
            description: "language-babel JSX supported elements",
            descriptionMoreURL: REACTURL
          });
        }
      } else if (jsxTag === JSXATTRIBUTE) {
        tagName = this.getThisTagName(editor, bufferPosition);
        if (tagName == null) {
          return;
        }
        ref2 = COMPLETIONS.htmlElements;
        for (j = 0, len1 = ref2.length; j < len1; j++) {
          elementObj = ref2[j];
          if (elementObj.name === tagName) {
            break;
          }
        }
        elementObj.attributes = elementObj.attributes.concat(COMPLETIONS.globalAttributes);
        elementObj.attributes = elementObj.attributes.concat(COMPLETIONS.events);
        filteredAttributes = filter(elementObj.attributes, prefix, {
          key: "name"
        });
        for (k = 0, len2 = filteredAttributes.length; k < len2; k++) {
          attribute = filteredAttributes[k];
          if (score(attribute.name, prefix) < 0.07) {
            continue;
          }
          suggestions.push({
            snippet: attribute.name,
            type: "attribute",
            rightLabel: "<" + tagName + ">",
            description: "language-babel JSXsupported attributes/events",
            descriptionMoreURL: REACTURL
          });
        }
      } else {
        return;
      }
      return suggestions;
    },
    getThisTagName: function(editor, bufferPosition) {
      var column, match, matches, row, rowText, scopes;
      row = bufferPosition.row;
      column = null;
      while (row >= 0) {
        rowText = editor.lineTextForBufferRow(row);
        if (column == null) {
          rowText = rowText.substr(0, column = bufferPosition.column);
        }
        matches = [];
        while ((match = TAGREGEXP.exec(rowText)) !== null) {
          scopes = editor.scopeDescriptorForBufferPosition([row, match.index + 1]).getScopesArray();
          if (indexOf.call(scopes, "entity.name.tag.open.jsx") >= 0) {
            matches.push(match[1]);
          }
        }
        if (matches.length) {
          return matches.pop();
        } else {
          row--;
        }
      }
    },
    getTriggerTag: function(editor, bufferPosition) {
      var column, scopes;
      column = bufferPosition.column - 1;
      if (column >= 0) {
        scopes = editor.scopeDescriptorForBufferPosition([bufferPosition.row, column]).getScopesArray();
        if (indexOf.call(scopes, "entity.other.attribute-name.jsx") >= 0) {
          return JSXATTRIBUTE;
        }
        if (indexOf.call(scopes, "entity.name.tag.open.jsx") >= 0) {
          return JSXTAG;
        }
        if (indexOf.call(scopes, "JSXStartTagEnd") >= 0) {
          return JSXSTARTTAGEND;
        }
        if (indexOf.call(scopes, "JSXEndTagStart") >= 0) {
          return JSXENDTAGSTART;
        }
      }
    },
    getStartOfJSX: function(editor, bufferPosition) {
      var column, columnLen, row;
      row = bufferPosition.row;
      while (row >= 0) {
        if (indexOf.call(editor.scopeDescriptorForBufferPosition([row, 0]).getScopesArray(), "meta.tag.jsx") < 0) {
          break;
        }
        row--;
      }
      if (row < 0) {
        row = 0;
      }
      columnLen = editor.lineTextForBufferRow(row).length;
      column = 0;
      while (column < columnLen) {
        if (indexOf.call(editor.scopeDescriptorForBufferPosition([row, column]).getScopesArray(), "meta.tag.jsx") >= 0) {
          break;
        }
        column++;
      }
      if (column === columnLen) {
        row++;
        column = 0;
      }
      return new Point(row, column);
    },
    buildTagStack: function(editor, range) {
      var closedtag, line, match, matchColumn, matchPointEnd, matchPointStart, matchRange, row, scopes, tagNameStack;
      tagNameStack = [];
      row = range.start.row;
      while (row <= range.end.row) {
        line = editor.lineTextForBufferRow(row);
        if (row === range.end.row) {
          line = line.substr(0, range.end.column);
        }
        while ((match = JSXREGEXP.exec(line)) !== null) {
          matchColumn = match.index;
          matchPointStart = new Point(row, matchColumn);
          matchPointEnd = new Point(row, matchColumn + match[0].length - 1);
          matchRange = new Range(matchPointStart, matchPointEnd);
          if (range.intersectsWith(matchRange)) {
            scopes = editor.scopeDescriptorForBufferPosition([row, match.index]).getScopesArray();
            if (indexOf.call(scopes, "punctuation.definition.tag.jsx") < 0) {
              continue;
            }
            if (match[1] != null) {
              tagNameStack.push(match[3]);
            } else if (match[2] != null) {
              closedtag = tagNameStack.pop();
              if (closedtag !== match[3]) {
                tagNameStack.push(closedtag);
              }
            } else if (match[4] != null) {
              tagNameStack.pop();
            }
          }
        }
        row++;
      }
      return tagNameStack;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWJhYmVsL2xpYi9hdXRvLWNvbXBsZXRlLWpzeC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHlJQUFBO0lBQUE7O0VBQUEsTUFBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxpQkFBRCxFQUFROztFQUNSLE9BQWtCLE9BQUEsQ0FBUSxZQUFSLENBQWxCLEVBQUMsb0JBQUQsRUFBUzs7RUFHVCxjQUFBLEdBQWlCOztFQUNqQixjQUFBLEdBQWlCOztFQUNqQixNQUFBLEdBQVM7O0VBQ1QsWUFBQSxHQUFlOztFQUVmLFNBQUEsR0FBWTs7RUFDWixTQUFBLEdBQWE7O0VBQ2IsV0FBQSxHQUFjLE9BQUEsQ0FBUSxtQkFBUjs7RUFDZCxRQUFBLEdBQVc7O0VBRVgsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxlQUFWO0lBQ0EsaUJBQUEsRUFBbUIsS0FEbkI7SUFFQSxvQkFBQSxFQUFzQixLQUZ0QjtJQUtBLGNBQUEsRUFBZ0IsU0FBQyxJQUFEO0FBQ2QsVUFBQTtNQUFDLG9CQUFELEVBQVMsb0NBQVQsRUFBeUIsc0NBQXpCLEVBQTBDO01BQzFDLElBQVUsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFtQixDQUFDLFdBQXBCLEtBQXFDLGdCQUEvQztBQUFBLGVBQUE7O01BRUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBZixFQUF1QixjQUF2QjtNQUNULElBQWMsY0FBZDtBQUFBLGVBQUE7O01BR0EsV0FBQSxHQUFjO01BRWQsSUFBRyxNQUFBLEtBQVUsY0FBYjtRQUNFLFVBQUEsR0FBYSxJQUFDLENBQUEsYUFBRCxDQUFlLE1BQWYsRUFBdUIsY0FBdkI7UUFDYixRQUFBLEdBQWUsSUFBQSxLQUFBLENBQU0sVUFBTixFQUFrQixjQUFsQjtRQUNmLFlBQUEsR0FBZSxJQUFDLENB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ZSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQXpCLEVBRFQ7O0FBRUEsZUFBTyxDQUFFLEtBQUEsR0FBUSxTQUFTLENBQUMsSUFBVixDQUFlLElBQWYsQ0FBVixDQUFBLEtBQXFDLElBQTVDO1VBQ0UsV0FBQSxHQUFjLEtBQUssQ0FBQztVQUNwQixlQUFBLEdBQXNCLElBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxXQUFYO1VBQ3RCLGFBQUEsR0FBb0IsSUFBQSxLQUFBLENBQU0sR0FBTixFQUFXLFdBQUEsR0FBYyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBdkIsR0FBZ0MsQ0FBM0M7VUFDcEIsVUFBQSxHQUFpQixJQUFBLEtBQUEsQ0FBTSxlQUFOLEVBQXVCLGFBQXZCO1VBQ2pCLElBQUcsS0FBSyxDQUFDLGNBQU4sQ0FBcUIsVUFBckIsQ0FBSDtZQUNFLE1BQUEsR0FBUyxNQUFNLENBQUMsZ0NBQVAsQ0FBd0MsQ0FBQyxHQUFELEVBQU0sS0FBSyxDQUFDLEtBQVosQ0FBeEMsQ0FBMkQsQ0FBQyxjQUE1RCxDQUFBO1lBQ1QsSUFBWSxhQUF3QyxNQUF4QyxFQUFBLGdDQUFBLEtBQVo7QUFBQSx1QkFBQTs7WUFFQSxJQUFHLGdCQUFIO2NBQ0UsWUFBWSxDQUFDLElBQWIsQ0FBa0IsS0FBTSxDQUFBLENBQUEsQ0FBeEIsRUFERjthQUFBLE1BRUssSUFBRyxnQkFBSDtjQUNILFNBQUEsR0FBWSxZQUFZLENBQUMsR0FBYixDQUFBO2NBQ1osSUFBRyxTQUFBLEtBQWUsS0FBTSxDQUFBLENBQUEsQ0FBeEI7Z0JBQ0UsWUFBWSxDQUFDLElBQWIsQ0FBa0IsU0FBbEIsRUFERjtlQUZHO2FBQUEsTUFJQSxJQUFHLGdCQUFIO2NBQ0gsWUFBWSxDQUFDLEdBQWIsQ0FBQSxFQURHO2FBVlA7O1FBTEY7UUFpQkEsR0FBQTtNQXJCRjthQXNCQTtJQXpCYSxDQXRIZjs7QUFmRiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgUG9pbnR9ID0gcmVxdWlyZSBcImF0b21cIlxue2ZpbHRlciwgc2NvcmV9ID0gcmVxdWlyZSBcImZ1enphbGRyaW5cIlxuXG4jIHRhZ3Mgd2UgYXJlIGludGVyZXN0ZWQgaW4gYXJlIG1hcmtlZCBieSB0aGUgZ3JhbW1hclxuSlNYU1RBUlRUQUdFTkQgPSAwXG5KU1hFTkRUQUdTVEFSVCA9IDFcbkpTWFRBRyA9IDJcbkpTWEFUVFJJQlVURSA9IDNcbiMgcmVnZXggdG8gc2VhcmNoIGZvciB0YWcgb3Blbi9jbG9zZSB0YWcgYW5kIGNsb3NlIHRhZ1xuSlNYUkVHRVhQID0gLyg/Oig8KXwoPFxcLykpKFskX0EtWmEtel0oPzpbJC5fOlxcLWEtekEtWjAtOV0pKil8KD86KFxcLz4pfCg+KSkvZ1xuVEFHUkVHRVhQID0gIC88KFskX2EtekEtWl1bJC5fOlxcLWEtekEtWjAtOV0qKSgkfFxcc3xcXC8+fD4pL2dcbkNPTVBMRVRJT05TID0gcmVxdWlyZSBcIi4vY29tcGxldGlvbnMtanN4XCJcblJFQUNUVVJMID0gXCJodHRwOi8vZmFjZWJvb2suZ2l0aHViLmlvL3JlYWN0L2RvY3MvdGFncy1hbmQtYXR0cmlidXRlcy5odG1sXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuICBzZWxlY3RvcjogXCIubWV0YS50YWcuanN4XCJcbiAgaW5jbHVzaW9uUHJpb3JpdHk6IDEwMDAwXG4gIGV4Y2x1ZGVMb3dlclByaW9yaXR5OiBmYWxzZVxuXG5cbiAgZ2V0U3VnZ2VzdGlvbnM6IChvcHRzKSAtPlxuICAgIHtlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBzY29wZURlc2NyaXB0b3IsIHByZWZpeH0gPSBvcHRzXG4gICAgcmV0dXJuIGlmIGVkaXRvci5nZXRHcmFtbWFyKCkucGFja2FnZU5hbWUgaXNudCBcImxhbmd1YWdlLWJhYmVsXCJcblxuICAgIGpzeFRhZyA9IEBnZXRUcmlnZ2VyVGFnIGVkaXRvciwgYnVmZmVyUG9zaXRpb25cbiAgICByZXR1cm4gaWYgbm90IGpzeFRhZz9cblxuICAgICMgYnVpbGQgYXV0b2NvbXBsZXRlIGxpc3RcbiAgICBzdWdnZXN0aW9ucyA9IFtdXG5cbiAgICBpZiBqc3hUYWcgaXMgSlNYU1RBUlRUQUdFTkRcbiAgICAgIHN0YXJ0T2ZKU1ggPSBAZ2V0U3RhcnRPZkpTWCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uXG4gICAgICBqc3hSYW5nZSA9IG5ldyBSYW5nZShzdGFydE9mSlNYLCBidWZmZXJQb3NpdGlvbilcbiAgICAgIHRhZ05hbWVTdGFjayA9IEBidWlsZFRhZ1N0YWNrKGVkaXRvciwganN4UmFuZ2UpXG4gICAgICB3aGlsZSAoIHRhZ05hbWUgPSB0YWdOYW1lU3RhY2sucG9wKCkpP1xuICAgICAgICBzdWdnZXN0aW9ucy5wdXNoXG4gICAgICAgICAgc25pcHBldDogXCIkMTwvI3t0YWdOYW1lfT5cIlxuICAgICAgICAgIHR5cGU6IFwidGFnXCJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJsYW5ndWFnZS1iYWJlbCB0YWcgY2xvc2VyXCJcblxuICAgIGVsc2UgaWYgIGpzeFRhZyBpcyBKU1hFTkRUQUdTVEFSVFxuICAgICAgc3RhcnRPZkpTWCA9IEBnZXRTdGFydE9mSlNYIGVkaXRvciwgYnVmZmVyUG9zaXRpb25cbiAgICAgIGpzeFJhbmdlID0gbmV3IFJhbmdlKHN0YXJ0T2ZKU1gsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgdGFnTmFtZVN0YWNrID0gQGJ1aWxkVGFnU3RhY2soZWRpdG9yLCBqc3hSYW5nZSlcbiAgICAgIHdoaWxlICggdGFnTmFtZSA9IHRhZ05hbWVTdGFjay5wb3AoKSk/XG4gICAgICAgIHN1Z2dlc3Rpb25zLnB1c2hcbiAgICAgICAgICBzbmlwcGV0OiBcIiN7dGFnTmFtZX0+XCJcbiAgICAgICAgICB0eXBlOiBcInRhZ1wiXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwibGFuZ3VhZ2UtYmFiZWwgdGFnIGNsb3NlclwiXG5cbiAgICBlbHNlIGlmIGpzeFRhZyBpcyBKU1hUQUdcbiAgICAgIHJldHVybiBpZiBub3QgL15bYS16XS9nLmV4ZWMocHJlZml4KVxuICAgICAgaHRtbEVsZW1lbnRzID0gZmlsdGVyKENPTVBMRVRJT05TLmh0bWxFbGVtZW50cywgcHJlZml4LCB7a2V5OiBcIm5hbWVcIn0pXG4gICAgICBmb3IgaHRtbEVsZW1lbnQgaW4gaHRtbEVsZW1lbnRzXG4gICAgICAgIGlmIHNjb3JlKGh0bWxFbGVtZW50Lm5hbWUsIHByZWZpeCkgPCAwLjA3IHRoZW4gY29udGludWVcbiAgICAgICAgc3VnZ2VzdGlvbnMucHVzaFxuICAgICAgICAgIHNuaXBwZXQ6IGh0bWxFbGVtZW50Lm5hbWVcbiAgICAgICAgICB0eXBlOiBcInRhZ1wiXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwibGFuZ3VhZ2UtYmFiZWwgSlNYIHN1cHBvcnRlZCBlbGVtZW50c1wiXG4gICAgICAgICAgZGVzY3JpcHRpb25Nb3JlVVJMOiBSRUFDVFVSTFxuXG4gICAgZWxzZSBpZiBqc3hUYWcgaXMgSlNYQVRUUklCVVRFXG4gICAgICB0YWdOYW1lID0gQGdldFRoaXNUYWdOYW1lIGVkaXRvciwgYnVmZmVyUG9zaXRpb25cbiAgICAgIHJldHVybiBpZiBub3QgdGFnTmFtZT9cbiAgICAgIGZvciBlbGVtZW50T2JqIGluIENPTVBMRVRJT05TLmh0bWxFbGVtZW50c1xuICAgICAgICBpZiBlbGVtZW50T2JqLm5hbWUgaXMgdGFnTmFtZSB0aGVuIGJyZWFrXG4gICAgICBlbGVtZW50T2JqLmF0dHJpYnV0ZXMgPSBlbGVtZW50T2JqLmF0dHJpYnV0ZXMuY29uY2F0IENPTVBMRVRJT05TLmdsb2JhbEF0dHJpYnV0ZXNcbiAgICAgIGVsZW1lbnRPYmouYXR0cmlidXRlcyA9IGVsZW1lbnRPYmouYXR0cmlidXRlcy5jb25jYXQgQ09NUExFVElPTlMuZXZlbnRzXG4gICAgICBmaWx0ZXJlZEF0dHJpYnV0ZXMgPSBmaWx0ZXIoZWxlbWVudE9iai5hdHRyaWJ1dGVzLCBwcmVmaXgsIHtrZXk6IFwibmFtZVwifSlcbiAgICAgIGZvciBhdHRyaWJ1dGUgaW4gZmlsdGVyZWRBdHRyaWJ1dGVzXG4gICAgICAgIGlmIHNjb3JlKGF0dHJpYnV0ZS5uYW1lLCBwcmVmaXgpIDwgMC4wNyB0aGVuIGNvbnRpbnVlXG4gICAgICAgIHN1Z2dlc3Rpb25zLnB1c2hcbiAgICAgICAgICBzbmlwcGV0OiBhdHRyaWJ1dGUubmFtZVxuICAgICAgICAgIHR5cGU6IFwiYXR0cmlidXRlXCJcbiAgICAgICAgICByaWdodExhYmVsOiBcIjwje3RhZ05hbWV9PlwiXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwibGFuZ3VhZ2UtYmFiZWwgSlNYc3VwcG9ydGVkIGF0dHJpYnV0ZXMvZXZlbnRzXCJcbiAgICAgICAgICBkZXNjcmlwdGlvbk1vcmVVUkw6IFJFQUNUVVJMXG5cbiAgICBlbHNlIHJldHVyblxuICAgIHN1Z2dlc3Rpb25zXG5cbiAgIyBnZXQgdGFnbmFtZSBmb3IgdGhpcyBhdHRyaWJ1dGVcbiAgZ2V0VGhpc1RhZ05hbWU6ICggZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICByb3cgPSBidWZmZXJQb3NpdGlvbi5yb3dcbiAgICBjb2x1bW4gPSBudWxsXG4gICAgd2hpbGUgcm93ID49IDBcbiAgICAgIHJvd1RleHQgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVxuICAgICAgaWYgbm90IGNvbHVtbj9cbiAgICAgICAgcm93VGV4dCA9IHJvd1RleHQuc3Vic3RyIDAsIGNvbHVtbiA9IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgICAgbWF0Y2hlcyA9IFtdXG4gICAgICB3aGlsZSAoKCBtYXRjaCA9IFRBR1JFR0VYUC5leGVjKHJvd1RleHQpKSBpc250IG51bGwgKVxuICAgICAgICAjIHNhdmUgdGhpcyBtYXRjaCBpZiBpdCBhIHZhbGlkIHRhZ1xuICAgICAgICBzY29wZXMgPSBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oW3JvdywgbWF0Y2guaW5kZXgrMV0pLmdldFNjb3Blc0FycmF5KClcbiAgICAgICAgaWYgXCJlbnRpdHkubmFtZS50YWcub3Blbi5qc3hcIiBpbiBzY29wZXMgdGhlbiBtYXRjaGVzLnB1c2ggbWF0Y2hbMV1cbiAgICAgICMgcmV0dXJuIHRoZSB0YWcgdGhhdCBpcyB0aGUgbGFzdCBvbmUgZm91bmRcbiAgICAgIGlmIG1hdGNoZXMubGVuZ3RoXG4gICAgICAgIHJldHVybiBtYXRjaGVzLnBvcCgpXG4gICAgICBlbHNlIHJvdy0tXG5cblxuICBnZXRUcmlnZ2VyVGFnOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICAjIEpTWCB0YWcgc2NvcGVzIHdlIGFyZSBpbnRlcmVzdGVkIGluIG1heSBhbHJlYWR5IGNsb3NlZCBvbmNlIHR5cGVkXG4gICAgIyBzbyB3ZSBoYXZlIHRvIGJhY2t0cmFjayBieSBvbmUgY2hhciB0byBzZWUgaWYgdGhleSB3ZXJlIHR5cGVkXG4gICAgY29sdW1uID0gYnVmZmVyUG9zaXRpb24uY29sdW1uLTFcbiAgICBpZiBjb2x1bW4gPj0gMFxuICAgICAgc2NvcGVzID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFtidWZmZXJQb3NpdGlvbi5yb3csIGNvbHVtbl0pLmdldFNjb3Blc0FycmF5KClcbiAgICAgIGlmIFwiZW50aXR5Lm90aGVyLmF0dHJpYnV0ZS1uYW1lLmpzeFwiIGluIHNjb3BlcyB0aGVuIHJldHVybiBKU1hBVFRSSUJVVEVcbiAgICAgIGlmIFwiZW50aXR5Lm5hbWUudGFnLm9wZW4uanN4XCIgaW4gc2NvcGVzIHRoZW4gcmV0dXJuIEpTWFRBR1xuICAgICAgaWYgXCJKU1hTdGFydFRhZ0VuZFwiIGluIHNjb3BlcyB0aGVuIHJldHVybiBKU1hTVEFSVFRBR0VORFxuICAgICAgaWYgXCJKU1hFbmRUYWdTdGFydFwiIGluIHNjb3BlcyB0aGVuIHJldHVybiBKU1hFTkRUQUdTVEFSVFxuXG5cbiAgIyBmaW5kIGJlZ2dpbmluZyBvZiBKU1ggaW4gYnVmZmVyIGFuZCByZXR1cm4gUG9pbnRcbiAgZ2V0U3RhcnRPZkpTWDogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgcm93ID0gYnVmZmVyUG9zaXRpb24ucm93XG4gICAgIyBmaW5kIHByZXZpb3VzIHN0YXJ0IG9mIHJvdyB0aGF0IGhhcyBubyBqc3ggdGFnXG4gICAgd2hpbGUgcm93ID49IDBcbiAgICAgIGJyZWFrIGlmIFwibWV0YS50YWcuanN4XCIgbm90IGluIGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihbcm93LCAwXSkuZ2V0U2NvcGVzQXJyYXkoKVxuICAgICAgcm93LS1cbiAgICBpZiByb3cgPCAwIHRoZW4gcm93ID0gMFxuICAgICMgbWF5YmUganN4IGFwcGFlYXJzIGxhdGVyIGluIHJvd1xuICAgIGNvbHVtbkxlbiA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpLmxlbmd0aFxuICAgIGNvbHVtbiA9IDBcbiAgICB3aGlsZSBjb2x1bW4gPCBjb2x1bW5MZW5cbiAgICAgIGJyZWFrIGlmIFwibWV0YS50YWcuanN4XCIgaW4gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFtyb3csIGNvbHVtbl0pLmdldFNjb3Blc0FycmF5KClcbiAgICAgIGNvbHVtbisrXG4gICAgIyBhZGp1c3Qgcm93IGNvbHVtbiBpZiBqc3ggbm90IGluIHRoaXMgcm93IGF0IGFsbFxuICAgIGlmIGNvbHVtbiBpcyBjb2x1bW5MZW5cbiAgICAgIHJvdysrXG4gICAgICBjb2x1bW4gPSAwXG4gICAgbmV3IFBvaW50KHJvdywgY29sdW1uKVxuXG4gICMgYnVpbGQgc3RhY2sgb2YgdGFnbmFtZXMgb3BlbmVkIGJ1dCBub3QgY2xvc2VkIGluIFJhbmdlXG4gIGJ1aWxkVGFnU3RhY2s6IChlZGl0b3IsIHJhbmdlKSAtPlxuICAgIHRhZ05hbWVTdGFjayA9IFtdXG4gICAgcm93ID0gcmFuZ2Uuc3RhcnQucm93XG4gICAgd2hpbGUgcm93IDw9IHJhbmdlLmVuZC5yb3dcbiAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG4gICAgICBpZiByb3cgaXMgcmFuZ2UuZW5kLnJvd1xuICAgICAgICBsaW5lID0gbGluZS5zdWJzdHIgMCwgcmFuZ2UuZW5kLmNvbHVtblxuICAgICAgd2hpbGUgKCggbWF0Y2ggPSBKU1hSRUdFWFAuZXhlYyhsaW5lKSkgaXNudCBudWxsIClcbiAgICAgICAgbWF0Y2hDb2x1bW4gPSBtYXRjaC5pbmRleFxuICAgICAgICBtYXRjaFBvaW50U3RhcnQgPSBuZXcgUG9pbnQocm93LCBtYXRjaENvbHVtbilcbiAgICAgICAgbWF0Y2hQb2ludEVuZCA9IG5ldyBQb2ludChyb3csIG1hdGNoQ29sdW1uICsgbWF0Y2hbMF0ubGVuZ3RoIC0gMSlcbiAgICAgICAgbWF0Y2hSYW5nZSA9IG5ldyBSYW5nZShtYXRjaFBvaW50U3RhcnQsIG1hdGNoUG9pbnRFbmQpXG4gICAgICAgIGlmIHJhbmdlLmludGVyc2VjdHNXaXRoKG1hdGNoUmFuZ2UpXG4gICAgICAgICAgc2NvcGVzID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFtyb3csIG1hdGNoLmluZGV4XSkuZ2V0U2NvcGVzQXJyYXkoKVxuICAgICAgICAgIGNvbnRpbnVlIGlmIFwicHVuY3R1YXRpb24uZGVmaW5pdGlvbi50YWcuanN4XCIgbm90IGluIHNjb3Blc1xuICAgICAgICAgICNjaGVjayBjYXB0dXJlIGdyb3Vwc1xuICAgICAgICAgIGlmIG1hdGNoWzFdPyAjIHRhZ3Mgc3RhcnRpbmcgPHRhZ1xuICAgICAgICAgICAgdGFnTmFtZVN0YWNrLnB1c2ggbWF0Y2hbM11cbiAgICAgICAgICBlbHNlIGlmIG1hdGNoWzJdPyAjIHRhZ3MgZW5kaW5nIDwvdGFnXG4gICAgICAgICAgICBjbG9zZWR0YWcgPSB0YWdOYW1lU3RhY2sucG9wKClcbiAgICAgICAgICAgIGlmIGNsb3NlZHRhZyBpc250IG1hdGNoWzNdXG4gICAgICAgICAgICAgIHRhZ05hbWVTdGFjay5wdXNoIGNsb3NlZHRhZ1xuICAgICAgICAgIGVsc2UgaWYgbWF0Y2hbNF0/ICMgdGFncyBlbmRpbmcgLz5cbiAgICAgICAgICAgIHRhZ05hbWVTdGFjay5wb3AoKVxuICAgICAgcm93KytcbiAgICB0YWdOYW1lU3RhY2tcbiJdfQ==
