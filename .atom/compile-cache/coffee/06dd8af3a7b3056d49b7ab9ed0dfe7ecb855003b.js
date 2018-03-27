(function() {
  var defaultIndentChar, defaultIndentSize, defaultIndentWithTabs, ref, ref1, scope, softTabs, tabLength;

  scope = ['source.css'];

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
    name: "CSS",
    namespace: "css",

    /*
    Supported Grammars
     */
    grammars: ["CSS"],

    /*
    Supported extensions
     */
    extensions: ["css"],
    defaultBeautifier: "JS Beautify",
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
      selector_separator_newline: {
        type: 'boolean',
        "default": false,
        description: "Add a newline between multiple selectors"
      },
      newline_between_rules: {
        type: 'boolean',
        "default": true,
        description: "Add a newline between CSS rules"
      },
      preserve_newlines: {
        type: 'boolean',
        "default": false,
        description: "Retain empty lines. " + "Consecutive empty lines will be converted to a single empty line."
      },
      wrap_line_length: {
        type: 'integer',
        "default": 0,
        description: "Maximum amount of characters per line (0 = disable)"
      },
      end_with_newline: {
        type: 'boolean',
        "default": false,
        description: "End output with newline"
      },
      indent_comments: {
        type: 'boolean',
        "default": true,
        description: "Determines whether comments should be indented."
      },
      force_indentation: {
        type: 'boolean',
        "default": false,
        description: "if indentation should be forcefully applied to markup even if it disruptively adds unintended whitespace to the documents rendered output"
      },
      convert_quotes: {
        type: 'string',
        "default": "none",
        description: "Convert the quote characters delimiting strings from either double or single quotes to the other.",
        "enum": ["none", "double", "single"]
      },
      align_assignments: {
        type: 'boolean',
        "default": false,
        description: "If lists of assignments or properties should be vertically aligned for faster and easier reading."
      },
      no_lead_zero: {
        type: 'boolean',
        "default": false,
        description: "If in CSS values leading 0s immediately preceeding a decimal should be removed or prevented."
      },
      configPath: {
        title: "comb custom config file",
        type: 'string',
        "default": "",
        description: "Path to custom CSScomb config file, used in absense of a `.csscomb.json` or `.csscomb.cson` at the root of your project."
      },
      predefinedConfig: {
        title: "comb predefined config",
        type: 'string',
        "default": "csscomb",
        description: "Used if neither a project or custom config file exists.",
        "enum": ["csscomb", "yandex", "zen"]
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9jc3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQTs7RUFBQSxLQUFBLEdBQVEsQ0FBQyxZQUFEOztFQUNSLFNBQUE7OytCQUFpRTs7RUFDakUsUUFBQTs7Z0NBQStEOztFQUMvRCxpQkFBQSxHQUFvQixDQUFJLFFBQUgsR0FBaUIsU0FBakIsR0FBZ0MsQ0FBakM7O0VBQ3BCLGlCQUFBLEdBQW9CLENBQUksUUFBSCxHQUFpQixHQUFqQixHQUEwQixJQUEzQjs7RUFDcEIscUJBQUEsR0FBd0IsQ0FBSTs7RUFFNUIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sS0FGUztJQUdmLFNBQUEsRUFBVyxLQUhJOztBQUtmOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixLQURRLENBUks7O0FBWWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLEtBRFUsQ0FmRztJQW1CZixpQkFBQSxFQUFtQixhQW5CSjtJQXFCZixPQUFBLEVBRUU7TUFBQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsaUJBRFQ7UUFFQSxPQUFBLEVBQVMsQ0FGVDtRQUdBLFdBQUEsRUFBYSx5QkFIYjtPQURGO01BS0EsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLGlCQURUO1FBRUEsT0FBQSxFQUFTLENBRlQ7UUFHQSxXQUFBLEVBQWEsdUJBSGI7T0FORjtNQVVBLDBCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSwwQ0FGYjtPQVhGO01BY0EscUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLGlDQUZiO09BZkY7TUFrQkEsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLHNCQUFBLEdBQ1gsbUVBSEY7T0FuQkY7TUF3QkEsZ0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQURUO1FBRUEsV0FBQSxFQUFhLHFEQUZiO09BekJGO01BNEJBLGdCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSx5QkFGYjtPQTdCRjtNQWdDQSxlQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFBYSxpREFGYjtPQWpDRjtNQW9DQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsMklBRmI7T0FyQ0Y7TUEwQ0EsY0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BRFQ7UUFFQSxXQUFBLEVBQWEsbUdBRmI7UUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsTUFBRCxFQUFTLFFBQVQsRUFBbUIsUUFBbkIsQ0FKTjtPQTNDRjtNQWdEQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsbUdBRmI7T0FqREY7TUFxREEsWUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsOEZBRmI7T0F0REY7TUEwREEsVUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLHlCQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRlQ7UUFHQSxXQUFBLEVBQWEsMEhBSGI7T0EzREY7TUFnRUEsZ0JBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyx3QkFBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUZUO1FBR0EsV0FBQSxFQUFhLHlEQUhiO1FBSUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLFNBQUQsRUFBWSxRQUFaLEVBQXNCLEtBQXRCLENBSk47T0FqRUY7S0F2QmE7O0FBUGpCIiwic291cmNlc0NvbnRlbnQiOlsiIyBHZXQgQXRvbSBkZWZhdWx0c1xuc2NvcGUgPSBbJ3NvdXJjZS5jc3MnXVxudGFiTGVuZ3RoID0gYXRvbT8uY29uZmlnLmdldCgnZWRpdG9yLnRhYkxlbmd0aCcsIHNjb3BlOiBzY29wZSkgPyA0XG5zb2Z0VGFicyA9IGF0b20/LmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0VGFicycsIHNjb3BlOiBzY29wZSkgPyB0cnVlXG5kZWZhdWx0SW5kZW50U2l6ZSA9IChpZiBzb2Z0VGFicyB0aGVuIHRhYkxlbmd0aCBlbHNlIDEpXG5kZWZhdWx0SW5kZW50Q2hhciA9IChpZiBzb2Z0VGFicyB0aGVuIFwiIFwiIGVsc2UgXCJcXHRcIilcbmRlZmF1bHRJbmRlbnRXaXRoVGFicyA9IG5vdCBzb2Z0VGFic1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiBcIkNTU1wiXG4gIG5hbWVzcGFjZTogXCJjc3NcIlxuXG4gICMjI1xuICBTdXBwb3J0ZWQgR3JhbW1hcnNcbiAgIyMjXG4gIGdyYW1tYXJzOiBbXG4gICAgXCJDU1NcIlxuICBdXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXG4gICMjI1xuICBleHRlbnNpb25zOiBbXG4gICAgXCJjc3NcIlxuICBdXG5cbiAgZGVmYXVsdEJlYXV0aWZpZXI6IFwiSlMgQmVhdXRpZnlcIlxuXG4gIG9wdGlvbnM6XG4gICAgIyBDU1NcbiAgICBpbmRlbnRfc2l6ZTpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogZGVmYXVsdEluZGVudFNpemVcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIHNpemUvbGVuZ3RoXCJcbiAgICBpbmRlbnRfY2hhcjpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBkZWZhdWx0SW5kZW50Q2hhclxuICAgICAgbWluaW11bTogMFxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gY2hhcmFjdGVyXCJcbiAgICBzZWxlY3Rvcl9zZXBhcmF0b3JfbmV3bGluZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkFkZCBhIG5ld2xpbmUgYmV0d2VlbiBtdWx0aXBsZSBzZWxlY3RvcnNcIlxuICAgIG5ld2xpbmVfYmV0d2Vlbl9ydWxlczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiQWRkIGEgbmV3bGluZSBiZXR3ZWVuIENTUyBydWxlc1wiXG4gICAgcHJlc2VydmVfbmV3bGluZXM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJSZXRhaW4gZW1wdHkgbGluZXMuIFwiK1xuICAgICAgICBcIkNvbnNlY3V0aXZlIGVtcHR5IGxpbmVzIHdpbGwgYmUgY29udmVydGVkIHRvIFxcXG4gICAgICAgICAgICAgICAgYSBzaW5nbGUgZW1wdHkgbGluZS5cIlxuICAgIHdyYXBfbGluZV9sZW5ndGg6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIk1heGltdW0gYW1vdW50IG9mIGNoYXJhY3RlcnMgcGVyIGxpbmUgKDAgPSBkaXNhYmxlKVwiXG4gICAgZW5kX3dpdGhfbmV3bGluZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVuZCBvdXRwdXQgd2l0aCBuZXdsaW5lXCJcbiAgICBpbmRlbnRfY29tbWVudHM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkRldGVybWluZXMgd2hldGhlciBjb21tZW50cyBzaG91bGQgYmUgaW5kZW50ZWQuXCJcbiAgICBmb3JjZV9pbmRlbnRhdGlvbjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcImlmIGluZGVudGF0aW9uIHNob3VsZCBiZSBmb3JjZWZ1bGx5IGFwcGxpZWQgdG8gXFxcbiAgICAgICAgICAgICAgICBtYXJrdXAgZXZlbiBpZiBpdCBkaXNydXB0aXZlbHkgYWRkcyB1bmludGVuZGVkIHdoaXRlc3BhY2UgXFxcbiAgICAgICAgICAgICAgICB0byB0aGUgZG9jdW1lbnRzIHJlbmRlcmVkIG91dHB1dFwiXG4gICAgY29udmVydF9xdW90ZXM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJub25lXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkNvbnZlcnQgdGhlIHF1b3RlIGNoYXJhY3RlcnMgZGVsaW1pdGluZyBzdHJpbmdzIFxcXG4gICAgICAgICAgICAgICAgZnJvbSBlaXRoZXIgZG91YmxlIG9yIHNpbmdsZSBxdW90ZXMgdG8gdGhlIG90aGVyLlwiXG4gICAgICBlbnVtOiBbXCJub25lXCIsIFwiZG91YmxlXCIsIFwic2luZ2xlXCJdXG4gICAgYWxpZ25fYXNzaWdubWVudHM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJJZiBsaXN0cyBvZiBhc3NpZ25tZW50cyBvciBwcm9wZXJ0aWVzIHNob3VsZCBiZSBcXFxuICAgICAgICAgICAgICAgIHZlcnRpY2FsbHkgYWxpZ25lZCBmb3IgZmFzdGVyIGFuZCBlYXNpZXIgcmVhZGluZy5cIlxuICAgIG5vX2xlYWRfemVybzpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIklmIGluIENTUyB2YWx1ZXMgbGVhZGluZyAwcyBpbW1lZGlhdGVseSBwcmVjZWVkaW5nIFxcXG4gICAgICAgICAgICAgICAgYSBkZWNpbWFsIHNob3VsZCBiZSByZW1vdmVkIG9yIHByZXZlbnRlZC5cIlxuICAgIGNvbmZpZ1BhdGg6XG4gICAgICB0aXRsZTogXCJjb21iIGN1c3RvbSBjb25maWcgZmlsZVwiXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJcIlxuICAgICAgZGVzY3JpcHRpb246IFwiUGF0aCB0byBjdXN0b20gQ1NTY29tYiBjb25maWcgZmlsZSwgdXNlZCBpbiBhYnNlbnNlIG9mIGEgXFxcbiAgICAgICAgICAgICAgICBgLmNzc2NvbWIuanNvbmAgb3IgYC5jc3Njb21iLmNzb25gIGF0IHRoZSByb290IG9mIHlvdXIgcHJvamVjdC5cIlxuICAgIHByZWRlZmluZWRDb25maWc6XG4gICAgICB0aXRsZTogXCJjb21iIHByZWRlZmluZWQgY29uZmlnXCJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcImNzc2NvbWJcIlxuICAgICAgZGVzY3JpcHRpb246IFwiVXNlZCBpZiBuZWl0aGVyIGEgcHJvamVjdCBvciBjdXN0b20gY29uZmlnIGZpbGUgZXhpc3RzLlwiXG4gICAgICBlbnVtOiBbXCJjc3Njb21iXCIsIFwieWFuZGV4XCIsIFwiemVuXCJdXG59XG4iXX0=
