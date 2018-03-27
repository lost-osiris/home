(function() {
  "use strict";
  var Beautifier, PrettyDiff,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PrettyDiff = (function(superClass) {
    extend(PrettyDiff, superClass);

    function PrettyDiff() {
      return PrettyDiff.__super__.constructor.apply(this, arguments);
    }

    PrettyDiff.prototype.name = "Pretty Diff";

    PrettyDiff.prototype.link = "https://github.com/prettydiff/prettydiff";

    PrettyDiff.prototype.options = {
      _: {
        inchar: [
          "indent_with_tabs", "indent_char", function(indent_with_tabs, indent_char) {
            if (indent_with_tabs === true) {
              return "\t";
            } else {
              return indent_char;
            }
          }
        ],
        insize: [
          "indent_with_tabs", "indent_size", function(indent_with_tabs, indent_size) {
            if (indent_with_tabs === true) {
              return 1;
            } else {
              return indent_size;
            }
          }
        ],
        objsort: function(objsort) {
          return objsort || false;
        },
        preserve: [
          'preserve_newlines', function(preserve_newlines) {
            if (preserve_newlines === true) {
              return "all";
            } else {
              return "none";
            }
          }
        ],
        cssinsertlines: "newline_between_rules",
        comments: [
          "indent_comments", function(indent_comments) {
            if (indent_comments === false) {
              return "noindent";
            } else {
              return "indent";
            }
          }
        ],
        force: "force_indentation",
        quoteConvert: "convert_quotes",
        vertical: [
          'align_assignments', function(align_assignments) {
            if (align_assignments === true) {
              return "all";
            } else {
              return "none";
            }
          }
        ],
        wrap: "wrap_line_length",
        space: "space_after_anon_function",
        noleadzero: "no_lead_zero",
        endcomma: "end_with_comma",
        methodchain: [
          'break_chained_methods', function(break_chained_methods) {
            if (break_chained_methods === true) {
              return false;
            } else {
              return true;
            }
          }
        ],
        ternaryline: "preserve_ternary_lines",
        bracepadding: "space_in_paren"
      },
      CSV: true,
      Coldfusion: true,
      ERB: true,
      EJS: true,
      HTML: true,
      Handlebars: true,
      Nunjucks: true,
      XML: true,
      SVG: true,
      Spacebars: true,
      JSX: true,
      JavaScript: true,
      CSS: true,
      SCSS: true,
      JSON: true,
      TSS: true,
      Twig: true,
      LESS: true,
      Swig: true,
      "UX Markup": true,
      Visualforce: true,
      "Riot.js": true,
      XTemplate: true
    };

    PrettyDiff.prototype.beautify = function(text, language, options) {
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var _, args, lang, output, prettydiff, result;
          prettydiff = require("prettydiff");
          _ = require('lodash');
          lang = "auto";
          switch (language) {
            case "CSV":
              lang = "csv";
              break;
            case "Coldfusion":
              lang = "html";
              break;
            case "EJS":
            case "Twig":
              lang = "ejs";
              break;
            case "ERB":
              lang = "html_ruby";
              break;
            case "Handlebars":
            case "Mustache":
            case "Spacebars":
            case "Swig":
            case "Riot.js":
            case "XTemplate":
              lang = "handlebars";
              break;
            case "SGML":
              lang = "markup";
              break;
            case "XML":
            case "Visualforce":
            case "SVG":
              lang = "xml";
              break;
            case "HTML":
            case "Nunjucks":
            case "UX Markup":
              lang = "html";
              break;
            case "JavaScript":
              lang = "javascript";
              break;
            case "JSON":
              lang = "json";
              break;
            case "JSX":
              lang = "jsx";
              break;
            case "JSTL":
              lang = "jsp";
              break;
            case "CSS":
              lang = "css";
              break;
            case "LESS":
              lang = "less";
              break;
            case "SCSS":
              lang = "scss";
              break;
            case "TSS":
              lang = "tss";
              break;
            default:
              lang = "auto";
          }
          args = {
            source: text,
            lang: lang,
            mode: "beautify"
          };
          _.merge(options, args);
          _this.verbose('prettydiff', options);
          output = prettydiff.api(options);
          result = output[0];
          return resolve(result);
        };
      })(this));
    };

    return PrettyDiff;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3ByZXR0eWRpZmYuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHNCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt5QkFDckIsSUFBQSxHQUFNOzt5QkFDTixJQUFBLEdBQU07O3lCQUNOLE9BQUEsR0FBUztNQUVQLENBQUEsRUFDRTtRQUFBLE1BQUEsRUFBUTtVQUFDLGtCQUFELEVBQXFCLGFBQXJCLEVBQW9DLFNBQUMsZ0JBQUQsRUFBbUIsV0FBbkI7WUFDMUMsSUFBSSxnQkFBQSxLQUFvQixJQUF4QjtxQkFDRSxLQURGO2FBQUEsTUFBQTtxQkFDWSxZQURaOztVQUQwQyxDQUFwQztTQUFSO1FBSUEsTUFBQSxFQUFRO1VBQUMsa0JBQUQsRUFBcUIsYUFBckIsRUFBb0MsU0FBQyxnQkFBRCxFQUFtQixXQUFuQjtZQUMxQyxJQUFJLGdCQUFBLEtBQW9CLElBQXhCO3FCQUNFLEVBREY7YUFBQSxNQUFBO3FCQUNTLFlBRFQ7O1VBRDBDLENBQXBDO1NBSlI7UUFRQSxPQUFBLEVBQVMsU0FBQyxPQUFEO2lCQUNQLE9BQUEsSUFBVztRQURKLENBUlQ7UUFVQSxRQUFBLEVBQVU7VUFBQyxtQkFBRCxFQUFzQixTQUFDLGlCQUFEO1lBQzlCLElBQUksaUJBQUEsS0FBcUIsSUFBekI7cUJBQ0UsTUFERjthQUFBLE1BQUE7cUJBQ2EsT0FEYjs7VUFEOEIsQ0FBdEI7U0FWVjtRQWNBLGNBQUEsRUFBZ0IsdUJBZGhCO1FBZUEsUUFBQSxFQUFVO1VBQUMsaUJBQUQsRUFBb0IsU0FBQyxlQUFEO1lBQzVCLElBQUksZUFBQSxLQUFtQixLQUF2QjtxQkFDRSxXQURGO2FBQUEsTUFBQTtxQkFDa0Is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O2NBd0JJLElBQUEsR0FBTztBQURKO0FBdkJQLGlCQXlCTyxLQXpCUDtjQTBCSSxJQUFBLEdBQU87QUFESjtBQXpCUCxpQkEyQk8sTUEzQlA7Y0E0QkksSUFBQSxHQUFPO0FBREo7QUEzQlAsaUJBNkJPLE1BN0JQO2NBOEJJLElBQUEsR0FBTztBQURKO0FBN0JQLGlCQStCTyxLQS9CUDtjQWdDSSxJQUFBLEdBQU87QUFESjtBQS9CUDtjQWtDSSxJQUFBLEdBQU87QUFsQ1g7VUFxQ0EsSUFBQSxHQUNFO1lBQUEsTUFBQSxFQUFRLElBQVI7WUFDQSxJQUFBLEVBQU0sSUFETjtZQUVBLElBQUEsRUFBTSxVQUZOOztVQUtGLENBQUMsQ0FBQyxLQUFGLENBQVEsT0FBUixFQUFpQixJQUFqQjtVQUdBLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUF1QixPQUF2QjtVQUNBLE1BQUEsR0FBUyxVQUFVLENBQUMsR0FBWCxDQUFlLE9BQWY7VUFDVCxNQUFBLEdBQVMsTUFBTyxDQUFBLENBQUE7aUJBR2hCLE9BQUEsQ0FBUSxNQUFSO1FBekRrQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtJQUZIOzs7O0tBbkU4QjtBQUgxQyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQcmV0dHlEaWZmIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlByZXR0eSBEaWZmXCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vcHJldHR5ZGlmZi9wcmV0dHlkaWZmXCJcbiAgb3B0aW9uczoge1xuICAgICMgQXBwbHkgdGhlc2Ugb3B0aW9ucyBmaXJzdCAvIGdsb2JhbGx5LCBmb3IgYWxsIGxhbmd1YWdlc1xuICAgIF86XG4gICAgICBpbmNoYXI6IFtcImluZGVudF93aXRoX3RhYnNcIiwgXCJpbmRlbnRfY2hhclwiLCAoaW5kZW50X3dpdGhfdGFicywgaW5kZW50X2NoYXIpIC0+XG4gICAgICAgIGlmIChpbmRlbnRfd2l0aF90YWJzIGlzIHRydWUpIHRoZW4gXFxcbiAgICAgICAgICBcIlxcdFwiIGVsc2UgaW5kZW50X2NoYXJcbiAgICAgIF1cbiAgICAgIGluc2l6ZTogW1wiaW5kZW50X3dpdGhfdGFic1wiLCBcImluZGVudF9zaXplXCIsIChpbmRlbnRfd2l0aF90YWJzLCBpbmRlbnRfc2l6ZSkgLT5cbiAgICAgICAgaWYgKGluZGVudF93aXRoX3RhYnMgaXMgdHJ1ZSkgdGhlbiBcXFxuICAgICAgICAgIDEgZWxzZSBpbmRlbnRfc2l6ZVxuICAgICAgXVxuICAgICAgb2Jqc29ydDogKG9ianNvcnQpIC0+XG4gICAgICAgIG9ianNvcnQgb3IgZmFsc2VcbiAgICAgIHByZXNlcnZlOiBbJ3ByZXNlcnZlX25ld2xpbmVzJywgKHByZXNlcnZlX25ld2xpbmVzKSAtPlxuICAgICAgICBpZiAocHJlc2VydmVfbmV3bGluZXMgaXMgdHJ1ZSApIHRoZW4gXFxcbiAgICAgICAgICBcImFsbFwiIGVsc2UgXCJub25lXCJcbiAgICAgIF1cbiAgICAgIGNzc2luc2VydGxpbmVzOiBcIm5ld2xpbmVfYmV0d2Vlbl9ydWxlc1wiXG4gICAgICBjb21tZW50czogW1wiaW5kZW50X2NvbW1lbnRzXCIsIChpbmRlbnRfY29tbWVudHMpIC0+XG4gICAgICAgIGlmIChpbmRlbnRfY29tbWVudHMgaXMgZmFsc2UpIHRoZW4gXFxcbiAgICAgICAgICBcIm5vaW5kZW50XCIgZWxzZSBcImluZGVudFwiXG4gICAgICBdXG4gICAgICBmb3JjZTogXCJmb3JjZV9pbmRlbnRhdGlvblwiXG4gICAgICBxdW90ZUNvbnZlcnQ6IFwiY29udmVydF9xdW90ZXNcIlxuICAgICAgdmVydGljYWw6IFsnYWxpZ25fYXNzaWdubWVudHMnLCAoYWxpZ25fYXNzaWdubWVudHMpIC0+XG4gICAgICAgIGlmIChhbGlnbl9hc3NpZ25tZW50cyBpcyB0cnVlICkgdGhlbiBcXFxuICAgICAgICAgIFwiYWxsXCIgZWxzZSBcIm5vbmVcIlxuICAgICAgXVxuICAgICAgd3JhcDogXCJ3cmFwX2xpbmVfbGVuZ3RoXCJcbiAgICAgIHNwYWNlOiBcInNwYWNlX2FmdGVyX2Fub25fZnVuY3Rpb25cIlxuICAgICAgbm9sZWFkemVybzogXCJub19sZWFkX3plcm9cIlxuICAgICAgZW5kY29tbWE6IFwiZW5kX3dpdGhfY29tbWFcIlxuICAgICAgbWV0aG9kY2hhaW46IFsnYnJlYWtfY2hhaW5lZF9tZXRob2RzJywgKGJyZWFrX2NoYWluZWRfbWV0aG9kcykgLT5cbiAgICAgICAgaWYgKGJyZWFrX2NoYWluZWRfbWV0aG9kcyBpcyB0cnVlICkgdGhlbiBcXFxuICAgICAgICAgIGZhbHNlIGVsc2UgdHJ1ZVxuICAgICAgXVxuICAgICAgdGVybmFyeWxpbmU6IFwicHJlc2VydmVfdGVybmFyeV9saW5lc1wiXG4gICAgICBicmFjZXBhZGRpbmc6IFwic3BhY2VfaW5fcGFyZW5cIlxuICAgICMgQXBwbHkgbGFuZ3VhZ2Utc3BlY2lmaWMgb3B0aW9uc1xuICAgIENTVjogdHJ1ZVxuICAgIENvbGRmdXNpb246IHRydWVcbiAgICBFUkI6IHRydWVcbiAgICBFSlM6IHRydWVcbiAgICBIVE1MOiB0cnVlXG4gICAgSGFuZGxlYmFyczogdHJ1ZVxuICAgIE51bmp1Y2tzOiB0cnVlXG4gICAgWE1MOiB0cnVlXG4gICAgU1ZHOiB0cnVlXG4gICAgU3BhY2ViYXJzOiB0cnVlXG4gICAgSlNYOiB0cnVlXG4gICAgSmF2YVNjcmlwdDogdHJ1ZVxuICAgIENTUzogdHJ1ZVxuICAgIFNDU1M6IHRydWVcbiAgICBKU09OOiB0cnVlXG4gICAgVFNTOiB0cnVlXG4gICAgVHdpZzogdHJ1ZVxuICAgIExFU1M6IHRydWVcbiAgICBTd2lnOiB0cnVlXG4gICAgXCJVWCBNYXJrdXBcIjogdHJ1ZVxuICAgIFZpc3VhbGZvcmNlOiB0cnVlXG4gICAgXCJSaW90LmpzXCI6IHRydWVcbiAgICBYVGVtcGxhdGU6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG5cbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBwcmV0dHlkaWZmID0gcmVxdWlyZShcInByZXR0eWRpZmZcIilcbiAgICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuXG4gICAgICAjIFNlbGVjdCBQcmV0dHlkaWZmIGxhbmd1YWdlXG4gICAgICBsYW5nID0gXCJhdXRvXCJcbiAgICAgIHN3aXRjaCBsYW5ndWFnZVxuICAgICAgICB3aGVuIFwiQ1NWXCJcbiAgICAgICAgICBsYW5nID0gXCJjc3ZcIlxuICAgICAgICB3aGVuIFwiQ29sZGZ1c2lvblwiXG4gICAgICAgICAgbGFuZyA9IFwiaHRtbFwiXG4gICAgICAgIHdoZW4gXCJFSlNcIiwgXCJUd2lnXCJcbiAgICAgICAgICBsYW5nID0gXCJlanNcIlxuICAgICAgICB3aGVuIFwiRVJCXCJcbiAgICAgICAgICBsYW5nID0gXCJodG1sX3J1YnlcIlxuICAgICAgICB3aGVuIFwiSGFuZGxlYmFyc1wiLCBcIk11c3RhY2hlXCIsIFwiU3BhY2ViYXJzXCIsIFwiU3dpZ1wiLCBcIlJpb3QuanNcIiwgXCJYVGVtcGxhdGVcIlxuICAgICAgICAgIGxhbmcgPSBcImhhbmRsZWJhcnNcIlxuICAgICAgICB3aGVuIFwiU0dNTFwiXG4gICAgICAgICAgbGFuZyA9IFwibWFya3VwXCJcbiAgICAgICAgd2hlbiBcIlhNTFwiLCBcIlZpc3VhbGZvcmNlXCIsIFwiU1ZHXCJcbiAgICAgICAgICBsYW5nID0gXCJ4bWxcIlxuICAgICAgICB3aGVuIFwiSFRNTFwiLCBcIk51bmp1Y2tzXCIsIFwiVVggTWFya3VwXCJcbiAgICAgICAgICBsYW5nID0gXCJodG1sXCJcbiAgICAgICAgd2hlbiBcIkphdmFTY3JpcHRcIlxuICAgICAgICAgIGxhbmcgPSBcImphdmFzY3JpcHRcIlxuICAgICAgICB3aGVuIFwiSlNPTlwiXG4gICAgICAgICAgbGFuZyA9IFwianNvblwiXG4gICAgICAgIHdoZW4gXCJKU1hcIlxuICAgICAgICAgIGxhbmcgPSBcImpzeFwiXG4gICAgICAgIHdoZW4gXCJKU1RMXCJcbiAgICAgICAgICBsYW5nID0gXCJqc3BcIlxuICAgICAgICB3aGVuIFwiQ1NTXCJcbiAgICAgICAgICBsYW5nID0gXCJjc3NcIlxuICAgICAgICB3aGVuIFwiTEVTU1wiXG4gICAgICAgICAgbGFuZyA9IFwibGVzc1wiXG4gICAgICAgIHdoZW4gXCJTQ1NTXCJcbiAgICAgICAgICBsYW5nID0gXCJzY3NzXCJcbiAgICAgICAgd2hlbiBcIlRTU1wiXG4gICAgICAgICAgbGFuZyA9IFwidHNzXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxhbmcgPSBcImF1dG9cIlxuXG4gICAgICAjIFByZXR0eWRpZmYgQXJndW1lbnRzXG4gICAgICBhcmdzID1cbiAgICAgICAgc291cmNlOiB0ZXh0XG4gICAgICAgIGxhbmc6IGxhbmdcbiAgICAgICAgbW9kZTogXCJiZWF1dGlmeVwiXG5cbiAgICAgICMgTWVyZ2UgYXJncyBpbnRvcyBvcHRpb25zXG4gICAgICBfLm1lcmdlKG9wdGlvbnMsIGFyZ3MpXG5cbiAgICAgICMgQmVhdXRpZnlcbiAgICAgIEB2ZXJib3NlKCdwcmV0dHlkaWZmJywgb3B0aW9ucylcbiAgICAgIG91dHB1dCA9IHByZXR0eWRpZmYuYXBpKG9wdGlvbnMpXG4gICAgICByZXN1bHQgPSBvdXRwdXRbMF1cblxuICAgICAgIyBSZXR1cm4gYmVhdXRpZmllZCB0ZXh0XG4gICAgICByZXNvbHZlKHJlc3VsdClcblxuICAgIClcbiJdfQ==
