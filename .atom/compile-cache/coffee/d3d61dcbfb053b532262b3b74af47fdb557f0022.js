(function() {
  var defaultIndentChar, defaultIndentSize, defaultIndentWithTabs, ref, ref1, scope, softTabs, tabLength;

  scope = ['text.marko'];

  tabLength = (ref = typeof atom !== "undefined" && atom !== null ? atom.config.get('editor.tabLength', {
    scope: scope
  }) : void 0) != null ? ref : 4;

  softTabs = (ref1 = typeof atom !== "undefined" && atom !== null ? atom.config.get('editor.softTabs', {
    scope: scope
  }) : void 0) != null ? ref1 : true;

  defaultIndentSize = (softTabs ? tabLength : 4);

  defaultIndentChar = (softTabs ? " " : "\t");

  defaultIndentWithTabs = !softTabs;

  module.exports = {
    name: "Marko",
    namespace: "marko",
    fallback: ['html'],

    /*
    Supported Grammars
     */
    grammars: ["Marko"],

    /*
    Supported extensions
     */
    extensions: ["marko"],
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
        description: "Indentation character"
      },
      syntax: {
        type: 'string',
        "default": "html",
        "enum": ["html", "concise"],
        description: "[html|concise]"
      }
    },
    defaultBeautifier: "Marko Beautifier"
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9tYXJrby5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBOztFQUFBLEtBQUEsR0FBUSxDQUFDLFlBQUQ7O0VBQ1IsU0FBQTs7K0JBQWlFOztFQUNqRSxRQUFBOztnQ0FBK0Q7O0VBQy9ELGlCQUFBLEdBQW9CLENBQUksUUFBSCxHQUFpQixTQUFqQixHQUFnQyxDQUFqQzs7RUFDcEIsaUJBQUEsR0FBb0IsQ0FBSSxRQUFILEdBQWlCLEdBQWpCLEdBQTBCLElBQTNCOztFQUNwQixxQkFBQSxHQUF3QixDQUFJOztFQUU1QixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUVmLElBQUEsRUFBTSxPQUZTO0lBR2YsU0FBQSxFQUFXLE9BSEk7SUFJZixRQUFBLEVBQVUsQ0FBQyxNQUFELENBSks7O0FBTWY7OztJQUdBLFFBQUEsRUFBVSxDQUNSLE9BRFEsQ0FUSzs7QUFhZjs7O0lBR0EsVUFBQSxFQUFZLENBQ1YsT0FEVSxDQWhCRztJQW9CZixPQUFBLEVBQ0U7TUFBQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsaUJBRFQ7UUFFQSxPQUFBLEVBQVMsQ0FGVDtRQUdBLFdBQUEsRUFBYSx5QkFIYjtPQURGO01BS0EsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLGlCQURUO1FBRUEsV0FBQSxFQUFhLHVCQUZiO09BTkY7TUFTQSxNQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFEVDtRQUVBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsU0FBVCxDQUZOO1FBR0EsV0FBQSxFQUFhLGdCQUhiO09BVkY7S0FyQmE7SUFvQ2YsaUJBQUEsRUFBbUIsa0JBcENKOztBQVBqQiIsInNvdXJjZXNDb250ZW50IjpbIiMgR2V0IEF0b20gZGVmYXVsdHNcbnNjb3BlID0gWyd0ZXh0Lm1hcmtvJ11cbnRhYkxlbmd0aCA9IGF0b20/LmNvbmZpZy5nZXQoJ2VkaXRvci50YWJMZW5ndGgnLCBzY29wZTogc2NvcGUpID8gNFxuc29mdFRhYnMgPSBhdG9tPy5jb25maWcuZ2V0KCdlZGl0b3Iuc29mdFRhYnMnLCBzY29wZTogc2NvcGUpID8gdHJ1ZVxuZGVmYXVsdEluZGVudFNpemUgPSAoaWYgc29mdFRhYnMgdGhlbiB0YWJMZW5ndGggZWxzZSA0KVxuZGVmYXVsdEluZGVudENoYXIgPSAoaWYgc29mdFRhYnMgdGhlbiBcIiBcIiBlbHNlIFwiXFx0XCIpXG5kZWZhdWx0SW5kZW50V2l0aFRhYnMgPSBub3Qgc29mdFRhYnNcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogXCJNYXJrb1wiXG4gIG5hbWVzcGFjZTogXCJtYXJrb1wiXG4gIGZhbGxiYWNrOiBbJ2h0bWwnXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgR3JhbW1hcnNcbiAgIyMjXG4gIGdyYW1tYXJzOiBbXG4gICAgXCJNYXJrb1wiXG4gIF1cblxuICAjIyNcbiAgU3VwcG9ydGVkIGV4dGVuc2lvbnNcbiAgIyMjXG4gIGV4dGVuc2lvbnM6IFtcbiAgICBcIm1hcmtvXCJcbiAgXVxuXG4gIG9wdGlvbnM6XG4gICAgaW5kZW50X3NpemU6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IGRlZmF1bHRJbmRlbnRTaXplXG4gICAgICBtaW5pbXVtOiAwXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnRhdGlvbiBzaXplL2xlbmd0aFwiXG4gICAgaW5kZW50X2NoYXI6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogZGVmYXVsdEluZGVudENoYXJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIGNoYXJhY3RlclwiXG4gICAgc3ludGF4OlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiaHRtbFwiXG4gICAgICBlbnVtOiBbXCJodG1sXCIsIFwiY29uY2lzZVwiXVxuICAgICAgZGVzY3JpcHRpb246IFwiW2h0bWx8Y29uY2lzZV1cIlxuXG4gIGRlZmF1bHRCZWF1dGlmaWVyOiBcIk1hcmtvIEJlYXV0aWZpZXJcIlxuXG59XG4iXX0=
