(function() {
  var defaultIndentChar, defaultIndentSize, defaultIndentWithTabs, ref, ref1, scope, softTabs, tabLength;

  scope = ['source.sql'];

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
    name: "SQL",
    namespace: "sql",

    /*
    Supported Grammars
     */
    grammars: ["SQL (Rails)", "SQL"],

    /*
    Supported extensions
     */
    extensions: ["sql"],
    options: {
      indent_size: {
        type: 'integer',
        "default": defaultIndentSize,
        minimum: 0,
        description: "Indentation size/length"
      },
      keywords: {
        type: 'string',
        "default": "upper",
        description: "Change case of keywords",
        "enum": ["unchanged", "lower", "upper", "capitalize"]
      },
      identifiers: {
        type: 'string',
        "default": "unchanged",
        description: "Change case of identifiers",
        "enum": ["unchanged", "lower", "upper", "capitalize"]
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9zcWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQTs7RUFBQSxLQUFBLEdBQVEsQ0FBQyxZQUFEOztFQUNSLFNBQUE7OytCQUFpRTs7RUFDakUsUUFBQTs7Z0NBQStEOztFQUMvRCxpQkFBQSxHQUFvQixDQUFJLFFBQUgsR0FBaUIsU0FBakIsR0FBZ0MsQ0FBakM7O0VBQ3BCLGlCQUFBLEdBQW9CLENBQUksUUFBSCxHQUFpQixHQUFqQixHQUEwQixJQUEzQjs7RUFDcEIscUJBQUEsR0FBd0IsQ0FBSTs7RUFFNUIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sS0FGUztJQUdmLFNBQUEsRUFBVyxLQUhJOztBQUtmOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixhQURRLEVBRVIsS0FGUSxDQVJLOztBQWFmOzs7SUFHQSxVQUFBLEVBQVksQ0FDVixLQURVLENBaEJHO0lBb0JmLE9BQUEsRUFFRTtNQUFBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxpQkFEVDtRQUVBLE9BQUEsRUFBUyxDQUZUO1FBR0EsV0FBQSxFQUFhLHlCQUhiO09BREY7TUFLQSxRQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FEVDtRQUVBLFdBQUEsRUFBYSx5QkFGYjtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxXQUFELEVBQWEsT0FBYixFQUFxQixPQUFyQixFQUE2QixZQUE3QixDQUhOO09BTkY7TUFVQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsV0FEVDtRQUVBLFdBQUEsRUFBYSw0QkFGYjtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxXQUFELEVBQWEsT0FBYixFQUFxQixPQUFyQixFQUE2QixZQUE3QixDQUhOO09BWEY7S0F0QmE7O0FBUGpCIiwic291cmNlc0NvbnRlbnQiOlsiIyBHZXQgQXRvbSBkZWZhdWx0c1xuc2NvcGUgPSBbJ3NvdXJjZS5zcWwnXVxudGFiTGVuZ3RoID0gYXRvbT8uY29uZmlnLmdldCgnZWRpdG9yLnRhYkxlbmd0aCcsIHNjb3BlOiBzY29wZSkgPyA0XG5zb2Z0VGFicyA9IGF0b20/LmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0VGFicycsIHNjb3BlOiBzY29wZSkgPyB0cnVlXG5kZWZhdWx0SW5kZW50U2l6ZSA9IChpZiBzb2Z0VGFicyB0aGVuIHRhYkxlbmd0aCBlbHNlIDEpXG5kZWZhdWx0SW5kZW50Q2hhciA9IChpZiBzb2Z0VGFicyB0aGVuIFwiIFwiIGVsc2UgXCJcXHRcIilcbmRlZmF1bHRJbmRlbnRXaXRoVGFicyA9IG5vdCBzb2Z0VGFic1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiBcIlNRTFwiXG4gIG5hbWVzcGFjZTogXCJzcWxcIlxuXG4gICMjI1xuICBTdXBwb3J0ZWQgR3JhbW1hcnNcbiAgIyMjXG4gIGdyYW1tYXJzOiBbXG4gICAgXCJTUUwgKFJhaWxzKVwiXG4gICAgXCJTUUxcIlxuICBdXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXG4gICMjI1xuICBleHRlbnNpb25zOiBbXG4gICAgXCJzcWxcIlxuICBdXG5cbiAgb3B0aW9uczpcbiAgICAjIFNRTFxuICAgIGluZGVudF9zaXplOlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiBkZWZhdWx0SW5kZW50U2l6ZVxuICAgICAgbWluaW11bTogMFxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gc2l6ZS9sZW5ndGhcIlxuICAgIGtleXdvcmRzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwidXBwZXJcIlxuICAgICAgZGVzY3JpcHRpb246IFwiQ2hhbmdlIGNhc2Ugb2Yga2V5d29yZHNcIlxuICAgICAgZW51bTogW1widW5jaGFuZ2VkXCIsXCJsb3dlclwiLFwidXBwZXJcIixcImNhcGl0YWxpemVcIl1cbiAgICBpZGVudGlmaWVyczpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcInVuY2hhbmdlZFwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJDaGFuZ2UgY2FzZSBvZiBpZGVudGlmaWVyc1wiXG4gICAgICBlbnVtOiBbXCJ1bmNoYW5nZWRcIixcImxvd2VyXCIsXCJ1cHBlclwiLFwiY2FwaXRhbGl6ZVwiXVxuXG59XG4iXX0=
