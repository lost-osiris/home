(function() {
  var defaultIndentChar, defaultIndentSize, defaultIndentWithTabs, ref, ref1, scope, softTabs, tabLength;

  scope = ['source.python'];

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
    name: "Python",
    namespace: "python",

    /*
    Supported Grammars
     */
    grammars: ["Python"],

    /*
    Supported extensions
     */
    extensions: ["py"],
    options: {
      max_line_length: {
        type: 'integer',
        "default": 79,
        description: "set maximum allowed line length"
      },
      indent_size: {
        type: 'integer',
        "default": defaultIndentSize,
        minimum: 0,
        description: "Indentation size/length"
      },
      ignore: {
        type: 'array',
        "default": ["E24"],
        items: {
          type: 'string'
        },
        description: "do not fix these errors/warnings"
      },
      sort_imports: {
        type: 'boolean',
        "default": false,
        description: "sort imports (requires isort installed)"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9weXRob24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQTs7RUFBQSxLQUFBLEdBQVEsQ0FBQyxlQUFEOztFQUNSLFNBQUE7OytCQUFpRTs7RUFDakUsUUFBQTs7Z0NBQStEOztFQUMvRCxpQkFBQSxHQUFvQixDQUFJLFFBQUgsR0FBaUIsU0FBakIsR0FBZ0MsQ0FBakM7O0VBQ3BCLGlCQUFBLEdBQW9CLENBQUksUUFBSCxHQUFpQixHQUFqQixHQUEwQixJQUEzQjs7RUFDcEIscUJBQUEsR0FBd0IsQ0FBSTs7RUFFNUIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sUUFGUztJQUdmLFNBQUEsRUFBVyxRQUhJOztBQUtmOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixRQURRLENBUks7O0FBWWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLElBRFUsQ0FmRztJQW1CZixPQUFBLEVBQ0U7TUFBQSxlQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLFdBQUEsRUFBYSxpQ0FGYjtPQURGO01BSUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLGlCQURUO1FBRUEsT0FBQSxFQUFTLENBRlQ7UUFHQSxXQUFBLEVBQWEseUJBSGI7T0FMRjtNQVNBLE1BQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxPQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUFDLEtBQUQsQ0FEVDtRQUVBLEtBQUEsRUFDRTtVQUFBLElBQUEsRUFBTSxRQUFOO1NBSEY7UUFJQSxXQUFBLEVBQWEsa0NBSmI7T0FWRjtNQWVBLFlBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLHlDQUZiO09BaEJGO0tBcEJhOztBQVBqQiIsInNvdXJjZXNDb250ZW50IjpbIiMgR2V0IEF0b20gZGVmYXVsdHNcbnNjb3BlID0gWydzb3VyY2UucHl0aG9uJ11cbnRhYkxlbmd0aCA9IGF0b20/LmNvbmZpZy5nZXQoJ2VkaXRvci50YWJMZW5ndGgnLCBzY29wZTogc2NvcGUpID8gNFxuc29mdFRhYnMgPSBhdG9tPy5jb25maWcuZ2V0KCdlZGl0b3Iuc29mdFRhYnMnLCBzY29wZTogc2NvcGUpID8gdHJ1ZVxuZGVmYXVsdEluZGVudFNpemUgPSAoaWYgc29mdFRhYnMgdGhlbiB0YWJMZW5ndGggZWxzZSAxKVxuZGVmYXVsdEluZGVudENoYXIgPSAoaWYgc29mdFRhYnMgdGhlbiBcIiBcIiBlbHNlIFwiXFx0XCIpXG5kZWZhdWx0SW5kZW50V2l0aFRhYnMgPSBub3Qgc29mdFRhYnNcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogXCJQeXRob25cIlxuICBuYW1lc3BhY2U6IFwicHl0aG9uXCJcblxuICAjIyNcbiAgU3VwcG9ydGVkIEdyYW1tYXJzXG4gICMjI1xuICBncmFtbWFyczogW1xuICAgIFwiUHl0aG9uXCJcbiAgXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgZXh0ZW5zaW9uc1xuICAjIyNcbiAgZXh0ZW5zaW9uczogW1xuICAgIFwicHlcIlxuICBdXG5cbiAgb3B0aW9uczpcbiAgICBtYXhfbGluZV9sZW5ndGg6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDc5XG4gICAgICBkZXNjcmlwdGlvbjogXCJzZXQgbWF4aW11bSBhbGxvd2VkIGxpbmUgbGVuZ3RoXCJcbiAgICBpbmRlbnRfc2l6ZTpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogZGVmYXVsdEluZGVudFNpemVcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIHNpemUvbGVuZ3RoXCJcbiAgICBpZ25vcmU6XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbXCJFMjRcIl1cbiAgICAgIGl0ZW1zOlxuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVzY3JpcHRpb246IFwiZG8gbm90IGZpeCB0aGVzZSBlcnJvcnMvd2FybmluZ3NcIlxuICAgIHNvcnRfaW1wb3J0czpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcInNvcnQgaW1wb3J0cyAocmVxdWlyZXMgaXNvcnQgaW5zdGFsbGVkKVwiXG5cbn1cbiJdfQ==
