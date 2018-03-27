(function() {
  var defaultIndentChar, defaultIndentSize, defaultIndentWithTabs, ref, ref1, scope, softTabs, tabLength;

  scope = ['text.jade'];

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
    name: "Jade",
    namespace: "jade",
    fallback: ['html'],

    /*
    Supported Grammars
     */
    grammars: ["Jade", "Pug"],

    /*
    Supported extensions
     */
    extensions: ["jade", "pug"],
    options: [
      {
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
        omit_div: {
          type: 'boolean',
          "default": false,
          description: "Whether to omit/remove the 'div' tags."
        }
      }
    ],
    defaultBeautifier: "Pug Beautify"
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9qYWRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEsS0FBQSxHQUFRLENBQUMsV0FBRDs7RUFDUixTQUFBOzsrQkFBaUU7O0VBQ2pFLFFBQUE7O2dDQUErRDs7RUFDL0QsaUJBQUEsR0FBb0IsQ0FBSSxRQUFILEdBQWlCLFNBQWpCLEdBQWdDLENBQWpDOztFQUNwQixpQkFBQSxHQUFvQixDQUFJLFFBQUgsR0FBaUIsR0FBakIsR0FBMEIsSUFBM0I7O0VBQ3BCLHFCQUFBLEdBQXdCLENBQUk7O0VBRTVCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBRWYsSUFBQSxFQUFNLE1BRlM7SUFHZixTQUFBLEVBQVcsTUFISTtJQUlmLFFBQUEsRUFBVSxDQUFDLE1BQUQsQ0FKSzs7QUFNZjs7O0lBR0EsUUFBQSxFQUFVLENBQ1IsTUFEUSxFQUNBLEtBREEsQ0FUSzs7QUFhZjs7O0lBR0EsVUFBQSxFQUFZLENBQ1YsTUFEVSxFQUNGLEtBREUsQ0FoQkc7SUFvQmYsT0FBQSxFQUFTO01BQ1A7UUFBQSxXQUFBLEVBQ0U7VUFBQSxJQUFBLEVBQU0sU0FBTjtVQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsaUJBRFQ7VUFFQSxPQUFBLEVBQVMsQ0FGVDtVQUdBLFdBQUEsRUFBYSx5QkFIYjtTQURGO1FBS0EsV0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLFFBQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLGlCQURUO1VBRUEsV0FBQSxFQUFhLHVCQUZiO1NBTkY7UUFTQSxRQUFBLEVBQ0U7VUFBQSxJQUFBLEVBQU0sU0FBTjtVQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtVQUVBLFdBQUEsRUFBYSx3Q0FGYjtTQVZGO09BRE87S0FwQk07SUFvQ2YsaUJBQUEsRUFBbUIsY0FwQ0o7O0FBUGpCIiwic291cmNlc0NvbnRlbnQiOlsiIyBHZXQgQXRvbSBkZWZhdWx0c1xuc2NvcGUgPSBbJ3RleHQuamFkZSddXG50YWJMZW5ndGggPSBhdG9tPy5jb25maWcuZ2V0KCdlZGl0b3IudGFiTGVuZ3RoJywgc2NvcGU6IHNjb3BlKSA/IDRcbnNvZnRUYWJzID0gYXRvbT8uY29uZmlnLmdldCgnZWRpdG9yLnNvZnRUYWJzJywgc2NvcGU6IHNjb3BlKSA/IHRydWVcbmRlZmF1bHRJbmRlbnRTaXplID0gKGlmIHNvZnRUYWJzIHRoZW4gdGFiTGVuZ3RoIGVsc2UgMSlcbmRlZmF1bHRJbmRlbnRDaGFyID0gKGlmIHNvZnRUYWJzIHRoZW4gXCIgXCIgZWxzZSBcIlxcdFwiKVxuZGVmYXVsdEluZGVudFdpdGhUYWJzID0gbm90IHNvZnRUYWJzXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6IFwiSmFkZVwiXG4gIG5hbWVzcGFjZTogXCJqYWRlXCJcbiAgZmFsbGJhY2s6IFsnaHRtbCddXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBHcmFtbWFyc1xuICAjIyNcbiAgZ3JhbW1hcnM6IFtcbiAgICBcIkphZGVcIiwgXCJQdWdcIlxuICBdXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXG4gICMjI1xuICBleHRlbnNpb25zOiBbXG4gICAgXCJqYWRlXCIsIFwicHVnXCJcbiAgXVxuXG4gIG9wdGlvbnM6IFtcbiAgICBpbmRlbnRfc2l6ZTpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogZGVmYXVsdEluZGVudFNpemVcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIHNpemUvbGVuZ3RoXCJcbiAgICBpbmRlbnRfY2hhcjpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBkZWZhdWx0SW5kZW50Q2hhclxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gY2hhcmFjdGVyXCJcbiAgICBvbWl0X2RpdjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIldoZXRoZXIgdG8gb21pdC9yZW1vdmUgdGhlICdkaXYnIHRhZ3MuXCJcbiAgXVxuXG4gIGRlZmF1bHRCZWF1dGlmaWVyOiBcIlB1ZyBCZWF1dGlmeVwiXG5cbn1cbiJdfQ==
