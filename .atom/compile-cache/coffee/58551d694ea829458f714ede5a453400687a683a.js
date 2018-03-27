(function() {
  var defaultIndentChar, defaultIndentSize, defaultIndentWithTabs, ref, ref1, scope, softTabs, tabLength;

  scope = ['text.html'];

  tabLength = (ref = typeof atom !== "undefined" && atom !== null ? atom.config.get('editor.tabLength', {
    scope: scope
  }) : void 0) != null ? ref : 4;

  softTabs = (ref1 = typeof atom !== "undefined" && atom !== null ? atom.config.get('editor.softTabs', {
    scope: scope
  }) : void 0) != null ? ref1 : true;

  defaultIndentSize = (softTabs ? tabLength : 1);

  defaultIndentChar = (softTabs ? " " : "\t");

  defaultIndentWithTabs = !softTabs;

  module.exports = {
    name: "Coldfusion",
    description: "Coldfusion Markup; cfscript is also handled via the prettydiff javascript parser",
    namespace: "cfml",

    /*
    Supported Grammars
     */
    grammars: ["html"],

    /*
    Supported extensions
     */
    extensions: ["cfm", "cfml", "cfc"],
    options: {
      indent_size: {
        type: 'integer',
        "default": defaultIndentSize,
        minimum: 0,
        description: "Indentation size/length"
      },
      indent_char: {
        type: 'string',
        "default": defaultIndentChar,
        minimum: 0,
        description: "Indentation character"
      },
      wrap_line_length: {
        type: 'integer',
        "default": 250,
        description: "Maximum characters per line (0 disables)"
      },
      preserve_newlines: {
        type: 'boolean',
        "default": true,
        description: "Preserve line-breaks"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9jb2xkZnVzaW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsS0FBQSxHQUFRLENBQUMsV0FBRDs7RUFDUixTQUFBOzsrQkFBaUU7O0VBQ2pFLFFBQUE7O2dDQUErRDs7RUFDL0QsaUJBQUEsR0FBb0IsQ0FBSSxRQUFILEdBQWlCLFNBQWpCLEdBQWdDLENBQWpDOztFQUNwQixpQkFBQSxHQUFvQixDQUFJLFFBQUgsR0FBaUIsR0FBakIsR0FBMEIsSUFBM0I7O0VBQ3BCLHFCQUFBLEdBQXdCLENBQUk7O0VBRTVCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBRWYsSUFBQSxFQUFNLFlBRlM7SUFHZixXQUFBLEVBQWEsa0ZBSEU7SUFJZixTQUFBLEVBQVcsTUFKSTs7QUFNZjs7O0lBR0EsUUFBQSxFQUFVLENBQ1IsTUFEUSxDQVRLOztBQWFmOzs7SUFHQSxVQUFBLEVBQVksQ0FDVixLQURVLEVBRVYsTUFGVSxFQUdWLEtBSFUsQ0FoQkc7SUFzQmYsT0FBQSxFQUNFO01BQUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLGlCQURUO1FBRUEsT0FBQSxFQUFTLENBRlQ7UUFHQSxXQUFBLEVBQWEseUJBSGI7T0FERjtNQUtBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxpQkFEVDtRQUVBLE9BQUEsRUFBUyxDQUZUO1FBR0EsV0FBQSxFQUFhLHVCQUhiO09BTkY7TUFVQSxnQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEdBRFQ7UUFFQSxXQUFBLEVBQWEsMENBRmI7T0FYRjtNQWNBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFBYSxzQkFGYjtPQWZGO0tBdkJhOztBQVBqQiIsInNvdXJjZXNDb250ZW50IjpbInNjb3BlID0gWyd0ZXh0Lmh0bWwnXVxudGFiTGVuZ3RoID0gYXRvbT8uY29uZmlnLmdldCgnZWRpdG9yLnRhYkxlbmd0aCcsIHNjb3BlOiBzY29wZSkgPyA0XG5zb2Z0VGFicyA9IGF0b20/LmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0VGFicycsIHNjb3BlOiBzY29wZSkgPyB0cnVlXG5kZWZhdWx0SW5kZW50U2l6ZSA9IChpZiBzb2Z0VGFicyB0aGVuIHRhYkxlbmd0aCBlbHNlIDEpXG5kZWZhdWx0SW5kZW50Q2hhciA9IChpZiBzb2Z0VGFicyB0aGVuIFwiIFwiIGVsc2UgXCJcXHRcIilcbmRlZmF1bHRJbmRlbnRXaXRoVGFicyA9IG5vdCBzb2Z0VGFic1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiBcIkNvbGRmdXNpb25cIlxuICBkZXNjcmlwdGlvbjogXCJDb2xkZnVzaW9uIE1hcmt1cDsgY2ZzY3JpcHQgaXMgYWxzbyBoYW5kbGVkIHZpYSB0aGUgcHJldHR5ZGlmZiBqYXZhc2NyaXB0IHBhcnNlclwiXG4gIG5hbWVzcGFjZTogXCJjZm1sXCJcblxuICAjIyNcbiAgU3VwcG9ydGVkIEdyYW1tYXJzXG4gICMjI1xuICBncmFtbWFyczogW1xuICAgIFwiaHRtbFwiXG4gIF1cblxuICAjIyNcbiAgU3VwcG9ydGVkIGV4dGVuc2lvbnNcbiAgIyMjXG4gIGV4dGVuc2lvbnM6IFtcbiAgICBcImNmbVwiXG4gICAgXCJjZm1sXCJcbiAgICBcImNmY1wiXG4gIF1cblxuICBvcHRpb25zOlxuICAgIGluZGVudF9zaXplOlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiBkZWZhdWx0SW5kZW50U2l6ZVxuICAgICAgbWluaW11bTogMFxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gc2l6ZS9sZW5ndGhcIlxuICAgIGluZGVudF9jaGFyOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IGRlZmF1bHRJbmRlbnRDaGFyXG4gICAgICBtaW5pbXVtOiAwXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnRhdGlvbiBjaGFyYWN0ZXJcIlxuICAgIHdyYXBfbGluZV9sZW5ndGg6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDI1MFxuICAgICAgZGVzY3JpcHRpb246IFwiTWF4aW11bSBjaGFyYWN0ZXJzIHBlciBsaW5lICgwIGRpc2FibGVzKVwiXG4gICAgcHJlc2VydmVfbmV3bGluZXM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlByZXNlcnZlIGxpbmUtYnJlYWtzXCJcblxufVxuIl19
