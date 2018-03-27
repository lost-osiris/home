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
      allow_risky: {
        title: "Allow risky rules",
        type: 'string',
        "default": "no",
        "enum": ["no", "yes"],
        description: "allow risky rules to be applied (PHP-CS-Fixer 2 only)"
      },
      phpcbf_path: {
        title: "PHPCBF Path",
        type: 'string',
        "default": "",
        description: "Path to the `phpcbf` CLI executable"
      },
      phpcbf_version: {
        title: "PHPCBF Version",
        type: 'integer',
        "default": 2,
        "enum": [1, 2, 3]
      },
      standard: {
        title: "PHPCBF Standard",
        type: 'string',
        "default": "PEAR",
        description: "Standard name Squiz, PSR2, PSR1, PHPCS, PEAR, Zend, MySource... or path to CS rules. Will use local `phpcs.xml`, `phpcs.xml.dist`, `phpcs.ruleset.xml` or `ruleset.xml` if found in the project root."
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9waHAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sS0FGUztJQUdmLFNBQUEsRUFBVyxLQUhJOztBQUtmOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixLQURRLENBUks7O0FBWWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLEtBRFUsRUFFVixRQUZVLEVBR1YsS0FIVSxDQWZHO0lBcUJmLGlCQUFBLEVBQW1CLGNBckJKO0lBdUJmLE9BQUEsRUFDRTtNQUFBLGFBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxtQkFBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUZUO1FBR0EsV0FBQSxFQUFhLG9EQUhiO09BREY7TUFLQSxnQkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLHNCQUFQO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBRlQ7UUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FITjtPQU5GO01BVUEsTUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7UUFFQSxXQUFBLEVBQWEsMEVBRmI7T0FYRjtNQWNBLEtBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsV0FBQSxFQUFhLHNGQUZiO09BZkY7TUFrQkEsS0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7UUFFQSxXQUFBLEVBQWEsNkVBRmI7T0FuQkY7TUFzQkEsV0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLG1CQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRlQ7UUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsSUFBRCxFQUFPLEtBQVAsQ0FITjtRQUlBLFdBQUEsRUFBYSx1REFKYjtPQXZCRjtNQTRCQSxXQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sYUFBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUZUO1FBR0EsV0FBQSxFQUFhLHFDQUhiO09BN0JGO01BaUNBLGNBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxnQkFBUDtRQUNBLElBQUEsRUFBTSxTQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUZUO1FBR0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUhOO09BbENGO01Bc0NBLFFBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxpQkFBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQUZUO1FBR0EsV0FBQSxFQUFhLHVNQUhiO09BdkNGO0tBeEJhOztBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6IFwiUEhQXCJcbiAgbmFtZXNwYWNlOiBcInBocFwiXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBHcmFtbWFyc1xuICAjIyNcbiAgZ3JhbW1hcnM6IFtcbiAgICBcIlBIUFwiXG4gIF1cblxuICAjIyNcbiAgU3VwcG9ydGVkIGV4dGVuc2lvbnNcbiAgIyMjXG4gIGV4dGVuc2lvbnM6IFtcbiAgICBcInBocFwiXG4gICAgXCJtb2R1bGVcIlxuICAgIFwiaW5jXCJcbiAgXVxuXG4gIGRlZmF1bHRCZWF1dGlmaWVyOiBcIlBIUC1DUy1GaXhlclwiXG5cbiAgb3B0aW9uczpcbiAgICBjc19maXhlcl9wYXRoOlxuICAgICAgdGl0bGU6IFwiUEhQLUNTLUZpeGVyIFBhdGhcIlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkFic29sdXRlIHBhdGggdG8gdGhlIGBwaHAtY3MtZml4ZXJgIENMSSBleGVjdXRhYmxlXCJcbiAgICBjc19maXhlcl92ZXJzaW9uOlxuICAgICAgdGl0bGU6IFwiUEhQLUNTLUZpeGVyIFZlcnNpb25cIlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAyXG4gICAgICBlbnVtOiBbMSwgMl1cbiAgICBmaXhlcnM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJcIlxuICAgICAgZGVzY3JpcHRpb246IFwiQWRkIGZpeGVyKHMpLiBpLmUuIGxpbmVmZWVkLC1zaG9ydF90YWcsaW5kZW50YXRpb24gKFBIUC1DUy1GaXhlciAxIG9ubHkpXCJcbiAgICBsZXZlbDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIlwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJCeSBkZWZhdWx0LCBhbGwgUFNSLTIgZml4ZXJzIGFuZCBzb21lIGFkZGl0aW9uYWwgb25lcyBhcmUgcnVuLiAoUEhQLUNTLUZpeGVyIDEgb25seSlcIlxuICAgIHJ1bGVzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkFkZCBydWxlKHMpLiBpLmUuIGxpbmVfZW5kaW5nLC1mdWxsX29wZW5pbmdfdGFnLEBQU1IyIChQSFAtQ1MtRml4ZXIgMiBvbmx5KVwiXG4gICAgYWxsb3dfcmlza3k6XG4gICAgICB0aXRsZTogXCJBbGxvdyByaXNreSBydWxlc1wiXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJub1wiXG4gICAgICBlbnVtOiBbXCJub1wiLCBcInllc1wiXVxuICAgICAgZGVzY3JpcHRpb246IFwiYWxsb3cgcmlza3kgcnVsZXMgdG8gYmUgYXBwbGllZCAoUEhQLUNTLUZpeGVyIDIgb25seSlcIlxuICAgIHBocGNiZl9wYXRoOlxuICAgICAgdGl0bGU6IFwiUEhQQ0JGIFBhdGhcIlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlBhdGggdG8gdGhlIGBwaHBjYmZgIENMSSBleGVjdXRhYmxlXCIsXG4gICAgcGhwY2JmX3ZlcnNpb246XG4gICAgICB0aXRsZTogXCJQSFBDQkYgVmVyc2lvblwiXG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDJcbiAgICAgIGVudW06IFsxLCAyLCAzXVxuICAgIHN0YW5kYXJkOlxuICAgICAgdGl0bGU6IFwiUEhQQ0JGIFN0YW5kYXJkXCJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIlBFQVJcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlN0YW5kYXJkIG5hbWUgU3F1aXosIFBTUjIsIFBTUjEsIFBIUENTLCBQRUFSLCBaZW5kLCBNeVNvdXJjZS4uLiBvciBwYXRoIHRvIENTIHJ1bGVzLiBXaWxsIHVzZSBsb2NhbCBgcGhwY3MueG1sYCwgYHBocGNzLnhtbC5kaXN0YCwgYHBocGNzLnJ1bGVzZXQueG1sYCBvciBgcnVsZXNldC54bWxgIGlmIGZvdW5kIGluIHRoZSBwcm9qZWN0IHJvb3QuXCJcblxufVxuIl19
