(function() {
  module.exports = {
    name: "PHP",
    namespace: "php",

    /*
    Supported Grammars
     */
    grammars: ["PHP"],

    /*
    Supported extensions
     */
    extensions: ["php", "module", "inc"],
    defaultBeautifier: "PHP-CS-Fixer",
    options: {
      cs_fixer_path: {
        title: "PHP-CS-Fixer Path",
        type: 'string',
        "default": "",
        description: "Absolute path to the `php-cs-fixer` CLI executable"
      },
      cs_fixer_version: {
        title: "PHP-CS-Fixer Version",
        type: 'integer',
        "default": 2,
        "enum": [1, 2]
      },
      fixers: {
        type: 'string',
        "default": "",
        description: "Add fixer(s). i.e. linefeed,-short_tag,indentation (PHP-CS-Fixer 1 only)"
      },
      level: {
        type: 'string',
        "default": "",
        description: "By default, all PSR-2 fixers and some additional ones are run. (PHP-CS-Fixer 1 only)"
      },
      rules: {
        type: 'string',
        "default": "",
        description: "Add rule(s). i.e. line_ending,-full_opening_tag,@PSR2 (PHP-CS-Fixer 2 only)"
      },
      phpcbf_path: {
        title: "PHPCBF Path",
        type: 'string',
        "default": "",
        description: "Path to the `phpcbf` CLI executable"
      },
      standard: {
        title: "PHPCBF Standard",
        type: 'string',
        "default": "",
        description: "Standard name Squiz, PSR2, PSR1, PHPCS, PEAR, Zend, MySource... or path to CS rules. Will use local `phpcs.xml`, `phpcs.xml.dist`, `phpcs.ruleset.xml` or `ruleset.xml` if found in the project root."
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9waHAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sS0FGUztJQUdmLFNBQUEsRUFBVyxLQUhJOztBQUtmOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixLQURRLENBUks7O0FBWWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLEtBRFUsRUFFVixRQUZVLEVBR1YsS0FIVSxDQWZHO0lBcUJmLGlCQUFBLEVBQW1CLGNBckJKO0lBdUJmLE9BQUEsRUFDRTtNQUFBLGFBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxtQkFBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUZUO1FBR0EsV0FBQSxFQUFhLG9EQUhiO09BREY7TUFLQSxnQkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLHNCQUFQO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBRlQ7UUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FITjtPQU5GO01BVUEsTUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7UUFFQSxXQUFBLEVBQWEsMEVBRmI7T0FYRjtNQWNBLEtBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsV0FBQSxFQUFhLHNGQUZiO09BZkY7TUFrQkEsS0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7UUFFQSxXQUFBLEVBQWEsNkVBRmI7T0FuQkY7TUFzQkEsV0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGFBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFGVDtRQUdBLFdBQUEsRUFBYSxxQ0FIYjtPQXZCRjtNQTJCQSxRQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8saUJBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFGVDtRQUdBLFdBQUEsRUFBYSx1TUFIYjtPQTVCRjtLQXhCYTs7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiBcIlBIUFwiXG4gIG5hbWVzcGFjZTogXCJwaHBcIlxuXG4gICMjI1xuICBTdXBwb3J0ZWQgR3JhbW1hcnNcbiAgIyMjXG4gIGdyYW1tYXJzOiBbXG4gICAgXCJQSFBcIlxuICBdXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXG4gICMjI1xuICBleHRlbnNpb25zOiBbXG4gICAgXCJwaHBcIlxuICAgIFwibW9kdWxlXCJcbiAgICBcImluY1wiXG4gIF1cblxuICBkZWZhdWx0QmVhdXRpZmllcjogXCJQSFAtQ1MtRml4ZXJcIlxuXG4gIG9wdGlvbnM6XG4gICAgY3NfZml4ZXJfcGF0aDpcbiAgICAgIHRpdGxlOiBcIlBIUC1DUy1GaXhlciBQYXRoXCJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIlwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJBYnNvbHV0ZSBwYXRoIHRvIHRoZSBgcGhwLWNzLWZpeGVyYCBDTEkgZXhlY3V0YWJsZVwiXG4gICAgY3NfZml4ZXJfdmVyc2lvbjpcbiAgICAgIHRpdGxlOiBcIlBIUC1DUy1GaXhlciBWZXJzaW9uXCJcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogMlxuICAgICAgZW51bTogWzEsIDJdXG4gICAgZml4ZXJzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkFkZCBmaXhlcihzKS4gaS5lLiBsaW5lZmVlZCwtc2hvcnRfdGFnLGluZGVudGF0aW9uIChQSFAtQ1MtRml4ZXIgMSBvbmx5KVwiXG4gICAgbGV2ZWw6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJcIlxuICAgICAgZGVzY3JpcHRpb246IFwiQnkgZGVmYXVsdCwgYWxsIFBTUi0yIGZpeGVycyBhbmQgc29tZSBhZGRpdGlvbmFsIG9uZXMgYXJlIHJ1bi4gKFBIUC1DUy1GaXhlciAxIG9ubHkpXCJcbiAgICBydWxlczpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIlwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJBZGQgcnVsZShzKS4gaS5lLiBsaW5lX2VuZGluZywtZnVsbF9vcGVuaW5nX3RhZyxAUFNSMiAoUEhQLUNTLUZpeGVyIDIgb25seSlcIlxuICAgIHBocGNiZl9wYXRoOlxuICAgICAgdGl0bGU6IFwiUEhQQ0JGIFBhdGhcIlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlBhdGggdG8gdGhlIGBwaHBjYmZgIENMSSBleGVjdXRhYmxlXCIsXG4gICAgc3RhbmRhcmQ6XG4gICAgICB0aXRsZTogXCJQSFBDQkYgU3RhbmRhcmRcIlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiXCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJTdGFuZGFyZCBuYW1lIFNxdWl6LCBQU1IyLCBQU1IxLCBQSFBDUywgUEVBUiwgWmVuZCwgTXlTb3VyY2UuLi4gb3IgcGF0aCB0byBDUyBydWxlcy4gV2lsbCB1c2UgbG9jYWwgYHBocGNzLnhtbGAsIGBwaHBjcy54bWwuZGlzdGAsIGBwaHBjcy5ydWxlc2V0LnhtbGAgb3IgYHJ1bGVzZXQueG1sYCBpZiBmb3VuZCBpbiB0aGUgcHJvamVjdCByb290LlwiXG5cbn1cbiJdfQ==
