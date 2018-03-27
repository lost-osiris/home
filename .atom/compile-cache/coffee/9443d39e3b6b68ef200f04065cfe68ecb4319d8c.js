(function() {
  module.exports = {
    name: "LaTeX",
    namespace: "latex",
    scope: ['source.tex'],

    /*
    Supported Grammars
     */
    grammars: ["BibTeX", "LaTeX", "TeX"],

    /*
    Supported extensions
     */
    extensions: ["bib", "tex", "sty", "cls", "dtx", "ins", "bbx", "cbx"],
    defaultBeautifier: "Latex Beautify",

    /*
     */
    options: {
      indent_char: {
        type: 'string',
        "default": null,
        description: "Indentation character"
      },
      indent_with_tabs: {
        type: 'boolean',
        "default": null,
        description: "Indentation uses tabs, overrides `Indent Size` and `Indent Char`"
      },
      indent_preamble: {
        type: 'boolean',
        "default": false,
        description: "Indent the preable"
      },
      always_look_for_split_braces: {
        type: 'boolean',
        "default": true,
        description: "If `latexindent` should look for commands that split braces across lines"
      },
      always_look_for_split_brackets: {
        type: 'boolean',
        "default": false,
        description: "If `latexindent` should look for commands that split brackets across lines"
      },
      remove_trailing_whitespace: {
        type: 'boolean',
        "default": false,
        description: "Remove trailing whitespace"
      },
      align_columns_in_environments: {
        type: 'array',
        "default": ["tabular", "matrix", "bmatrix", "pmatrix"],
        decription: "Aligns columns by the alignment tabs for environments specified"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9sYXRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUVmLElBQUEsRUFBTSxPQUZTO0lBR2YsU0FBQSxFQUFXLE9BSEk7SUFJZixLQUFBLEVBQU8sQ0FBQyxZQUFELENBSlE7O0FBTWY7OztJQUdBLFFBQUEsRUFBVSxDQUNSLFFBRFEsRUFFUixPQUZRLEVBR1IsS0FIUSxDQVRLOztBQWVmOzs7SUFHQSxVQUFBLEVBQVksQ0FDVixLQURVLEVBRVYsS0FGVSxFQUdWLEtBSFUsRUFJVixLQUpVLEVBS1YsS0FMVSxFQU1WLEtBTlUsRUFPVixLQVBVLEVBUVYsS0FSVSxDQWxCRztJQTZCZixpQkFBQSxFQUFtQixnQkE3Qko7O0FBK0JmOztJQUdBLE9BQUEsRUFDRTtNQUFBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLHVCQUZiO09BREY7TUFJQSxnQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsa0VBRmI7T0FMRjtNQVFBLGVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLG9CQUZiO09BVEY7TUFZQSw0QkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsMEVBRmI7T0FiRjtNQWdCQSw4QkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsNEVBRmI7T0FqQkY7TUFvQkEsMEJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLDRCQUZiO09BckJGO01Bd0JBLDZCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sT0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVEsQ0FBQyxTQUFELEVBQVksUUFBWixFQUFzQixTQUF0QixFQUFpQyxTQUFqQyxDQURSO1FBRUEsVUFBQSxFQUFZLGlFQUZaO09BekJGO0tBbkNhOztBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6IFwiTGFUZVhcIlxuICBuYW1lc3BhY2U6IFwibGF0ZXhcIlxuICBzY29wZTogWydzb3VyY2UudGV4J11cblxuICAjIyNcbiAgU3VwcG9ydGVkIEdyYW1tYXJzXG4gICMjI1xuICBncmFtbWFyczogW1xuICAgIFwiQmliVGVYXCJcbiAgICBcIkxhVGVYXCJcbiAgICBcIlRlWFwiXG4gIF1cblxuICAjIyNcbiAgU3VwcG9ydGVkIGV4dGVuc2lvbnNcbiAgIyMjXG4gIGV4dGVuc2lvbnM6IFtcbiAgICBcImJpYlwiXG4gICAgXCJ0ZXhcIlxuICAgIFwic3R5XCJcbiAgICBcImNsc1wiXG4gICAgXCJkdHhcIlxuICAgIFwiaW5zXCJcbiAgICBcImJieFwiXG4gICAgXCJjYnhcIlxuICBdXG5cbiAgZGVmYXVsdEJlYXV0aWZpZXI6IFwiTGF0ZXggQmVhdXRpZnlcIlxuXG4gICMjI1xuXG4gICMjI1xuICBvcHRpb25zOlxuICAgIGluZGVudF9jaGFyOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIGNoYXJhY3RlclwiXG4gICAgaW5kZW50X3dpdGhfdGFiczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gdXNlcyB0YWJzLCBvdmVycmlkZXMgYEluZGVudCBTaXplYCBhbmQgYEluZGVudCBDaGFyYFwiXG4gICAgaW5kZW50X3ByZWFtYmxlOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50IHRoZSBwcmVhYmxlXCJcbiAgICBhbHdheXNfbG9va19mb3Jfc3BsaXRfYnJhY2VzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogXCJJZiBgbGF0ZXhpbmRlbnRgIHNob3VsZCBsb29rIGZvciBjb21tYW5kcyB0aGF0IHNwbGl0IGJyYWNlcyBhY3Jvc3MgbGluZXNcIlxuICAgIGFsd2F5c19sb29rX2Zvcl9zcGxpdF9icmFja2V0czpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIklmIGBsYXRleGluZGVudGAgc2hvdWxkIGxvb2sgZm9yIGNvbW1hbmRzIHRoYXQgc3BsaXQgYnJhY2tldHMgYWNyb3NzIGxpbmVzXCJcbiAgICByZW1vdmVfdHJhaWxpbmdfd2hpdGVzcGFjZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlJlbW92ZSB0cmFpbGluZyB3aGl0ZXNwYWNlXCJcbiAgICBhbGlnbl9jb2x1bW5zX2luX2Vudmlyb25tZW50czpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6W1widGFidWxhclwiLCBcIm1hdHJpeFwiLCBcImJtYXRyaXhcIiwgXCJwbWF0cml4XCJdXG4gICAgICBkZWNyaXB0aW9uOiBcIkFsaWducyBjb2x1bW5zIGJ5IHRoZSBhbGlnbm1lbnQgdGFicyBmb3IgZW52aXJvbm1lbnRzIHNwZWNpZmllZFwiXG59XG4iXX0=
