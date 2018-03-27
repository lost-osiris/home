(function() {
  module.exports = {
    name: "Python",
    namespace: "python",
    scope: ['source.python'],

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
        "default": null,
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
      formater: {
        type: 'string',
        "default": 'autopep8',
        "enum": ['autopep8', 'yapf'],
        description: "formater used by pybeautifier"
      },
      style_config: {
        type: 'string',
        "default": 'pep8',
        description: "formatting style used by yapf"
      },
      sort_imports: {
        type: 'boolean',
        "default": false,
        description: "sort imports (requires isort installed)"
      },
      multi_line_output: {
        type: 'string',
        "default": 'Hanging Grid Grouped',
        "enum": ['Grid', 'Vertical', 'Hanging Indent', 'Vertical Hanging Indent', 'Hanging Grid', 'Hanging Grid Grouped', 'NOQA'],
        description: "defines how from imports wrap (requires isort installed)"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9weXRob24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sUUFGUztJQUdmLFNBQUEsRUFBVyxRQUhJO0lBSWYsS0FBQSxFQUFPLENBQUMsZUFBRCxDQUpROztBQU1mOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixRQURRLENBVEs7O0FBYWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLElBRFUsQ0FoQkc7SUFvQmYsT0FBQSxFQUNFO01BQUEsZUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7UUFFQSxXQUFBLEVBQWEsaUNBRmI7T0FERjtNQUlBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsT0FBQSxFQUFTLENBRlQ7UUFHQSxXQUFBLEVBQWEseUJBSGI7T0FMRjtNQVNBLE1BQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxPQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUFDLEtBQUQsQ0FEVDtRQUVBLEtBQUEsRUFDRTtVQUFBLElBQUEsRUFBTSxRQUFOO1NBSEY7UUFJQSxXQUFBLEVBQWEsa0NBSmI7T0FWRjtNQWVBLFFBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxVQURUO1FBRUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLFVBQUQsRUFBYSxNQUFiLENBRk47UUFHQSxXQUFBLEVBQWEsK0JBSGI7T0FoQkY7TUFvQkEsWUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BRFQ7UUFFQSxXQUFBLEVBQWEsK0JBRmI7T0FyQkY7TUF3QkEsWUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEseUNBRmI7T0F6QkY7TUE0QkEsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxzQkFEVDtRQUVBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FDSixNQURJLEVBRUosVUFGSSxFQUdKLGdCQUhJLEVBSUoseUJBSkksRUFLSixjQUxJLEVBTUosc0JBTkksRUFPSixNQVBJLENBRk47UUFXQSxXQUFBLEVBQWEsMERBWGI7T0E3QkY7S0FyQmE7O0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogXCJQeXRob25cIlxuICBuYW1lc3BhY2U6IFwicHl0aG9uXCJcbiAgc2NvcGU6IFsnc291cmNlLnB5dGhvbiddXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBHcmFtbWFyc1xuICAjIyNcbiAgZ3JhbW1hcnM6IFtcbiAgICBcIlB5dGhvblwiXG4gIF1cblxuICAjIyNcbiAgU3VwcG9ydGVkIGV4dGVuc2lvbnNcbiAgIyMjXG4gIGV4dGVuc2lvbnM6IFtcbiAgICBcInB5XCJcbiAgXVxuXG4gIG9wdGlvbnM6XG4gICAgbWF4X2xpbmVfbGVuZ3RoOlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiA3OVxuICAgICAgZGVzY3JpcHRpb246IFwic2V0IG1heGltdW0gYWxsb3dlZCBsaW5lIGxlbmd0aFwiXG4gICAgaW5kZW50X3NpemU6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIHNpemUvbGVuZ3RoXCJcbiAgICBpZ25vcmU6XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbXCJFMjRcIl1cbiAgICAgIGl0ZW1zOlxuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVzY3JpcHRpb246IFwiZG8gbm90IGZpeCB0aGVzZSBlcnJvcnMvd2FybmluZ3NcIlxuICAgIGZvcm1hdGVyOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdhdXRvcGVwOCdcbiAgICAgIGVudW06IFsnYXV0b3BlcDgnLCAneWFwZiddXG4gICAgICBkZXNjcmlwdGlvbjogXCJmb3JtYXRlciB1c2VkIGJ5IHB5YmVhdXRpZmllclwiXG4gICAgc3R5bGVfY29uZmlnOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdwZXA4J1xuICAgICAgZGVzY3JpcHRpb246IFwiZm9ybWF0dGluZyBzdHlsZSB1c2VkIGJ5IHlhcGZcIlxuICAgIHNvcnRfaW1wb3J0czpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcInNvcnQgaW1wb3J0cyAocmVxdWlyZXMgaXNvcnQgaW5zdGFsbGVkKVwiXG4gICAgbXVsdGlfbGluZV9vdXRwdXQ6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ0hhbmdpbmcgR3JpZCBHcm91cGVkJ1xuICAgICAgZW51bTogW1xuICAgICAgICAnR3JpZCdcbiAgICAgICAgJ1ZlcnRpY2FsJ1xuICAgICAgICAnSGFuZ2luZyBJbmRlbnQnXG4gICAgICAgICdWZXJ0aWNhbCBIYW5naW5nIEluZGVudCdcbiAgICAgICAgJ0hhbmdpbmcgR3JpZCdcbiAgICAgICAgJ0hhbmdpbmcgR3JpZCBHcm91cGVkJ1xuICAgICAgICAnTk9RQSdcbiAgICAgIF1cbiAgICAgIGRlc2NyaXB0aW9uOiBcImRlZmluZXMgaG93IGZyb20gaW1wb3J0cyB3cmFwIChyZXF1aXJlcyBpc29ydCBpbnN0YWxsZWQpXCJcbn1cbiJdfQ==
