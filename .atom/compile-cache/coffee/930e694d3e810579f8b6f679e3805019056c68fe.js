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
    name: "HTML",
    namespace: "html",

    /*
    Supported Grammars
     */
    grammars: ["HTML"],

    /*
    Supported extensions
     */
    extensions: ["html"],
    options: {
      indent_inner_html: {
        type: 'boolean',
        "default": false,
        description: "Indent <head> and <body> sections."
      },
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
      brace_style: {
        type: 'string',
        "default": "collapse",
        "enum": ["collapse", "expand", "end-expand", "none"],
        description: "[collapse|expand|end-expand|none]"
      },
      indent_scripts: {
        type: 'string',
        "default": "normal",
        "enum": ["keep", "separate", "normal"],
        description: "[keep|separate|normal]"
      },
      wrap_line_length: {
        type: 'integer',
        "default": 250,
        description: "Maximum characters per line (0 disables)"
      },
      wrap_attributes: {
        type: 'string',
        "default": "auto",
        "enum": ["auto", "force", "force-aligned", "force-expand-multiline"],
        description: "Wrap attributes to new lines [auto|force|force-aligned|force-expand-multiline]"
      },
      wrap_attributes_indent_size: {
        type: 'integer',
        "default": defaultIndentSize,
        minimum: 0,
        description: "Indent wrapped attributes to after N characters"
      },
      preserve_newlines: {
        type: 'boolean',
        "default": true,
        description: "Preserve line-breaks"
      },
      max_preserve_newlines: {
        type: 'integer',
        "default": 10,
        description: "Number of line-breaks to be preserved in one chunk"
      },
      unformatted: {
        type: 'array',
        "default": ['a', 'abbr', 'area', 'audio', 'b', 'bdi', 'bdo', 'br', 'button', 'canvas', 'cite', 'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'map', 'mark', 'math', 'meter', 'noscript', 'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'svg', 'template', 'textarea', 'time', 'u', 'var', 'video', 'wbr', 'text', 'acronym', 'address', 'big', 'dt', 'ins', 'small', 'strike', 'tt', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        items: {
          type: 'string'
        },
        description: "List of tags (defaults to inline) that should not be reformatted"
      },
      end_with_newline: {
        type: 'boolean',
        "default": false,
        description: "End output with newline"
      },
      extra_liners: {
        type: 'array',
        "default": ['head', 'body', '/html'],
        items: {
          type: 'string'
        },
        description: "List of tags (defaults to [head,body,/html] that should have an extra newline before them."
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9odG1sLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEsS0FBQSxHQUFRLENBQUMsV0FBRDs7RUFDUixTQUFBOzsrQkFBaUU7O0VBQ2pFLFFBQUE7O2dDQUErRDs7RUFDL0QsaUJBQUEsR0FBb0IsQ0FBSSxRQUFILEdBQWlCLFNBQWpCLEdBQWdDLENBQWpDOztFQUNwQixpQkFBQSxHQUFvQixDQUFJLFFBQUgsR0FBaUIsR0FBakIsR0FBMEIsSUFBM0I7O0VBQ3BCLHFCQUFBLEdBQXdCLENBQUk7O0VBRTVCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBRWYsSUFBQSxFQUFNLE1BRlM7SUFHZixTQUFBLEVBQVcsTUFISTs7QUFLZjs7O0lBR0EsUUFBQSxFQUFVLENBQ1IsTUFEUSxDQVJLOztBQVlmOzs7SUFHQSxVQUFBLEVBQVksQ0FDVixNQURVLENBZkc7SUFtQmYsT0FBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLG9DQUZiO09BREY7TUFJQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsaUJBRFQ7UUFFQSxPQUFBLEVBQVMsQ0FGVDtRQUdBLFdBQUEsRUFBYSx5QkFIYjtPQUxGO01BU0EsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLGlCQURUO1FBRUEsV0FBQSxFQUFhLHVCQUZiO09BVkY7TUFhQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsVUFEVDtRQUVBLENBQUEsSUFBQSxDQUFBLEVBQU0s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LEVBQ0U7UUFBQSxJQUFBLEVBQU0sT0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixPQUFqQixDQURUO1FBRUEsS0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLFFBQU47U0FIRjtRQUlBLFdBQUEsRUFBYSw0RkFKYjtPQWxFRjtLQXBCYTs7QUFQakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIEdldCBBdG9tIGRlZmF1bHRzXG5zY29wZSA9IFsndGV4dC5odG1sJ11cbnRhYkxlbmd0aCA9IGF0b20/LmNvbmZpZy5nZXQoJ2VkaXRvci50YWJMZW5ndGgnLCBzY29wZTogc2NvcGUpID8gNFxuc29mdFRhYnMgPSBhdG9tPy5jb25maWcuZ2V0KCdlZGl0b3Iuc29mdFRhYnMnLCBzY29wZTogc2NvcGUpID8gdHJ1ZVxuZGVmYXVsdEluZGVudFNpemUgPSAoaWYgc29mdFRhYnMgdGhlbiB0YWJMZW5ndGggZWxzZSAxKVxuZGVmYXVsdEluZGVudENoYXIgPSAoaWYgc29mdFRhYnMgdGhlbiBcIiBcIiBlbHNlIFwiXFx0XCIpXG5kZWZhdWx0SW5kZW50V2l0aFRhYnMgPSBub3Qgc29mdFRhYnNcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogXCJIVE1MXCJcbiAgbmFtZXNwYWNlOiBcImh0bWxcIlxuXG4gICMjI1xuICBTdXBwb3J0ZWQgR3JhbW1hcnNcbiAgIyMjXG4gIGdyYW1tYXJzOiBbXG4gICAgXCJIVE1MXCJcbiAgXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgZXh0ZW5zaW9uc1xuICAjIyNcbiAgZXh0ZW5zaW9uczogW1xuICAgIFwiaHRtbFwiXG4gIF1cblxuICBvcHRpb25zOlxuICAgIGluZGVudF9pbm5lcl9odG1sOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50IDxoZWFkPiBhbmQgPGJvZHk+IHNlY3Rpb25zLlwiXG4gICAgaW5kZW50X3NpemU6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IGRlZmF1bHRJbmRlbnRTaXplXG4gICAgICBtaW5pbXVtOiAwXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnRhdGlvbiBzaXplL2xlbmd0aFwiXG4gICAgaW5kZW50X2NoYXI6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogZGVmYXVsdEluZGVudENoYXJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIGNoYXJhY3RlclwiXG4gICAgYnJhY2Vfc3R5bGU6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJjb2xsYXBzZVwiXG4gICAgICBlbnVtOiBbXCJjb2xsYXBzZVwiLCBcImV4cGFuZFwiLCBcImVuZC1leHBhbmRcIiwgXCJub25lXCJdXG4gICAgICBkZXNjcmlwdGlvbjogXCJbY29sbGFwc2V8ZXhwYW5kfGVuZC1leHBhbmR8bm9uZV1cIlxuICAgIGluZGVudF9zY3JpcHRzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwibm9ybWFsXCJcbiAgICAgIGVudW06IFtcImtlZXBcIiwgXCJzZXBhcmF0ZVwiLCBcIm5vcm1hbFwiXVxuICAgICAgZGVzY3JpcHRpb246IFwiW2tlZXB8c2VwYXJhdGV8bm9ybWFsXVwiXG4gICAgd3JhcF9saW5lX2xlbmd0aDpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogMjUwXG4gICAgICBkZXNjcmlwdGlvbjogXCJNYXhpbXVtIGNoYXJhY3RlcnMgcGVyIGxpbmUgKDAgZGlzYWJsZXMpXCJcbiAgICB3cmFwX2F0dHJpYnV0ZXM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJhdXRvXCJcbiAgICAgIGVudW06IFtcImF1dG9cIiwgXCJmb3JjZVwiLCBcImZvcmNlLWFsaWduZWRcIiwgXCJmb3JjZS1leHBhbmQtbXVsdGlsaW5lXCJdXG4gICAgICBkZXNjcmlwdGlvbjogXCJXcmFwIGF0dHJpYnV0ZXMgdG8gbmV3IGxpbmVzIFthdXRvfGZvcmNlfGZvcmNlLWFsaWduZWR8Zm9yY2UtZXhwYW5kLW11bHRpbGluZV1cIlxuICAgIHdyYXBfYXR0cmlidXRlc19pbmRlbnRfc2l6ZTpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogZGVmYXVsdEluZGVudFNpemVcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudCB3cmFwcGVkIGF0dHJpYnV0ZXMgdG8gYWZ0ZXIgTiBjaGFyYWN0ZXJzXCJcbiAgICBwcmVzZXJ2ZV9uZXdsaW5lczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiUHJlc2VydmUgbGluZS1icmVha3NcIlxuICAgIG1heF9wcmVzZXJ2ZV9uZXdsaW5lczpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogMTBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIk51bWJlciBvZiBsaW5lLWJyZWFrcyB0byBiZSBwcmVzZXJ2ZWQgaW4gb25lIGNodW5rXCJcbiAgICB1bmZvcm1hdHRlZDpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFtcbiAgICAgICAgICAgICdhJywgJ2FiYnInLCAnYXJlYScsICdhdWRpbycsICdiJywgJ2JkaScsICdiZG8nLCAnYnInLCAnYnV0dG9uJywgJ2NhbnZhcycsICdjaXRlJyxcbiAgICAgICAgICAgICdjb2RlJywgJ2RhdGEnLCAnZGF0YWxpc3QnLCAnZGVsJywgJ2RmbicsICdlbScsICdlbWJlZCcsICdpJywgJ2lmcmFtZScsICdpbWcnLFxuICAgICAgICAgICAgJ2lucHV0JywgJ2lucycsICdrYmQnLCAna2V5Z2VuJywgJ2xhYmVsJywgJ21hcCcsICdtYXJrJywgJ21hdGgnLCAnbWV0ZXInLCAnbm9zY3JpcHQnLFxuICAgICAgICAgICAgJ29iamVjdCcsICdvdXRwdXQnLCAncHJvZ3Jlc3MnLCAncScsICdydWJ5JywgJ3MnLCAnc2FtcCcsICdzZWxlY3QnLCAnc21hbGwnLFxuICAgICAgICAgICAgJ3NwYW4nLCAnc3Ryb25nJywgJ3N1YicsICdzdXAnLCAnc3ZnJywgJ3RlbXBsYXRlJywgJ3RleHRhcmVhJywgJ3RpbWUnLCAndScsICd2YXInLFxuICAgICAgICAgICAgJ3ZpZGVvJywgJ3dicicsICd0ZXh0JyxcbiAgICAgICAgICAgICdhY3JvbnltJywgJ2FkZHJlc3MnLCAnYmlnJywgJ2R0JywgJ2lucycsICdzbWFsbCcsICdzdHJpa2UnLCAndHQnLFxuICAgICAgICAgICAgJ3ByZScsXG4gICAgICAgICAgICAnaDEnLCAnaDInLCAnaDMnLCAnaDQnLCAnaDUnLCAnaDYnXG4gICAgICAgIF1cbiAgICAgIGl0ZW1zOlxuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVzY3JpcHRpb246IFwiTGlzdCBvZiB0YWdzIChkZWZhdWx0cyB0byBpbmxpbmUpIHRoYXQgc2hvdWxkIG5vdCBiZSByZWZvcm1hdHRlZFwiXG4gICAgZW5kX3dpdGhfbmV3bGluZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVuZCBvdXRwdXQgd2l0aCBuZXdsaW5lXCJcbiAgICBleHRyYV9saW5lcnM6XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbJ2hlYWQnLCAnYm9keScsICcvaHRtbCddXG4gICAgICBpdGVtczpcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkxpc3Qgb2YgdGFncyAoZGVmYXVsdHMgdG8gW2hlYWQsYm9keSwvaHRtbF0gdGhhdCBzaG91bGQgaGF2ZSBhbiBleHRyYSBuZXdsaW5lIGJlZm9yZSB0aGVtLlwiXG5cbn1cbiJdfQ==
