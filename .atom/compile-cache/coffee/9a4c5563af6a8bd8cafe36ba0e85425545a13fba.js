(function() {
  "use strict";
  var Beautifier, JSBeautify,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = JSBeautify = (function(superClass) {
    var getDefaultLineEnding;

    extend(JSBeautify, superClass);

    function JSBeautify() {
      return JSBeautify.__super__.constructor.apply(this, arguments);
    }

    JSBeautify.prototype.name = "JS Beautify";

    JSBeautify.prototype.link = "https://github.com/beautify-web/js-beautify";

    JSBeautify.prototype.options = {
      HTML: true,
      XML: true,
      Handlebars: true,
      Mustache: true,
      JavaScript: true,
      EJS: true,
      JSX: true,
      JSON: true,
      CSS: {
        indent_size: true,
        indent_char: true,
        selector_separator_newline: true,
        newline_between_rules: true,
        preserve_newlines: true,
        wrap_line_length: true,
        end_with_newline: true
      }
    };

    JSBeautify.prototype.beautify = function(text, language, options) {
      var ref;
      this.verbose("JS Beautify language " + language);
      this.info("JS Beautify Options: " + (JSON.stringify(options, null, 4)));
      options.eol = (ref = getDefaultLineEnding()) != null ? ref : options.eol;
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var beautifyCSS, beautifyHTML, beautifyJS, err;
          try {
            switch (language) {
              case "JSON":
              case "JavaScript":
              case "JSX":
                beautifyJS = require("js-beautify");
                text = beautifyJS(text, options);
                return resolve(text);
              case "Handlebars":
              case "Mustache":
                options.indent_handlebars = true;
                beautifyHTML = require("js-beautify").html;
                text = beautifyHTML(text, options);
                return resolve(text);
              case "EJS":
              case "HTML (Liquid)":
              case "HTML":
              case "XML":
              case "Web Form/Control (C#)":
              case "Web Handler (C#)":
                beautifyHTML = require("js-beautify").html;
                text = beautifyHTML(text, options);
                _this.debug("Beautified HTML: " + text);
                return resolve(text);
              case "CSS":
                beautifyCSS = require("js-beautify").css;
                text = beautifyCSS(text, options);
                return resolve(text);
              default:
                return reject(new Error("Unknown language for JS Beautify: " + language));
            }
          } catch (error) {
            err = error;
            _this.error("JS Beautify error: " + err);
            return reject(err);
          }
        };
      })(this));
    };

    getDefaultLineEnding = function() {
      switch (atom.config.get('line-ending-selector.defaultLineEnding')) {
        case 'LF':
          return '\n';
        case 'CRLF':
          return '\r\n';
        case 'OS Default':
          if (process.platform === 'win32') {
            return '\r\n';
          } else {
            return '\n';
          }
        default:
          return null;
      }
    };

    return JSBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2pzLWJlYXV0aWZ5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSxzQkFBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIsUUFBQTs7Ozs7Ozs7eUJBQUEsSUFBQSxHQUFNOzt5QkFDTixJQUFBLEdBQU07O3lCQUVOLE9BQUEsR0FBUztNQUNQLElBQUEsRUFBTSxJQURDO01BRVAsR0FBQSxFQUFLLElBRkU7TUFHUCxVQUFBLEVBQVksSUFITDtNQUlQLFFBQUEsRUFBVSxJQUpIO01BS1AsVUFBQSxFQUFZLElBTEw7TUFNUCxHQUFBLEVBQUssSUFORTtNQU9QLEdBQUEsRUFBSyxJQVBFO01BUVAsSUFBQSxFQUFNLElBUkM7TUFTUCxHQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsSUFBYjtRQUNBLFdBQUEsRUFBYSxJQURiO1FBRUEsMEJBQUEsRUFBNEIsSUFGNUI7UUFHQSxxQkFBQSxFQUF1QixJQUh2QjtRQUlBLGlCQUFBLEVBQW1CLElBSm5CO1FBS0EsZ0JBQUEsRUFBa0IsSUFMbEI7UUFNQSxnQkFBQSxFQUFrQixJQU5sQjtPQVZLOzs7eUJBbUJULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsdUJBQUEsR0FBd0IsUUFBakM7TUFDQSxJQUFDLENBQUEsSUFBRCxDQUFNLHVCQUFBLEdBQXVCLENBQUMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxPQUFmLEVBQXdCLElBQXhCLEVBQThCLENBQTlCLENBQUQsQ0FBN0I7TUFHQSxPQUFPLENBQUMsR0FBUixrREFBdUMsT0FBTyxDQUFDO0FBQy9DLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNsQixjQUFBO0FBQUE7QUFDRSxvQkFBTyxRQUFQO0FBQUEsbUJBQ08sTUFEUDtBQUFBLG1CQUNlLFlBRGY7QUFBQSxtQkFDNkIsS0FEN0I7Z0JBRUksVUFBQSxHQUFhLE9BQUEsQ0FBUSxhQUFSO2dCQUNiLElBQUEsR0FBTyxVQUFBLENBQVcsSUFBWCxFQUFpQixPQUFqQjt1QkFDUCxPQUFBLENBQVEsSUFBUjtBQUpKLG1CQUtPLFlBTFA7QUFBQSxtQkFLcUIsVUFMckI7Z0JBT0ksT0FBTyxDQUFDLGlCQUFSLEdBQTRCO2dCQUU1QixZQUFBLEdBQWUsT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQztnQkFDdEMsSUFBQSxHQUFPLFlBQUEsQ0FBYSxJQUFiLEVBQW1CLE9BQW5CO3VCQUNQLE9BQUEsQ0FBUSxJQUFSO0FBWEosbUJBWU8sS0FaUDtBQUFBLG1CQVljLGVBWmQ7QUFBQSxtQkFZK0IsTUFaL0I7QUFBQSxtQkFZdUMsS0FadkM7QUFBQSxtQkFZOEMsdUJBWjlDO0FBQUEsbUJBWXVFLGtCQVp2RTtnQkFhSSxZQUFBLEdBQWUsT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQztnQkFDdEMsSUFBQSxHQUFPLFlBQUEsQ0FBYSxJQUFiLEVBQW1CLE9BQW5CO2dCQUNQLEtBQUMsQ0FBQSxLQUFELENBQU8sbUJBQUEsR0FBb0IsSUFBM0I7dUJBQ0EsT0FBQSxDQUFRLElBQVI7QUFoQkosbUJBaUJPLEtBakJQO2dCQWtCSSxXQUFBLEdBQWMsT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQztnQkFDckMsSUFBQSxHQUFPLFdBQUEsQ0FBWSxJQUFaLEVBQWtCLE9BQWxCO3VCQUNQLE9BQUEsQ0FBUSxJQUFSO0FBcEJKO3VCQXNCSSxNQUFBLENBQVcsSUFBQSxLQUFBLENBQU0sb0NBQUEsR0FBcUMsUUFBM0MsQ0FBWDtBQXRCSixhQURGO1dBQUEsYUFBQTtZQXdCTTtZQUNKLEtBQUMsQ0FBQSxLQUFELENBQU8scUJBQUEsR0FBc0IsR0FBN0I7bUJBQ0EsTUFBQSxDQUFPLEdBQVAsRUExQkY7O1FBRGtCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO0lBTkg7O0lBOENWLG9CQUFBLEdBQXNCLFNBQUE7QUFDcEIsY0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhCLENBQVA7QUFBQSxhQUNPLElBRFA7QUFFSSxpQkFBTztBQUZYLGFBR08sTUFIUDtBQUlJLGlCQUFPO0FBSlgsYUFLTyxZQUxQO1VBTVcsSUFBRyxPQUFPLENBQUMsUUFBUixLQUFvQixPQUF2QjttQkFBb0MsT0FBcEM7V0FBQSxNQUFBO21CQUFnRCxLQUFoRDs7QUFOWDtBQVFJLGlCQUFPO0FBUlg7SUFEb0I7Ozs7S0FyRWtCO0FBSDFDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEpTQmVhdXRpZnkgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiSlMgQmVhdXRpZnlcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9iZWF1dGlmeS13ZWIvanMtYmVhdXRpZnlcIlxuXG4gIG9wdGlvbnM6IHtcbiAgICBIVE1MOiB0cnVlXG4gICAgWE1MOiB0cnVlXG4gICAgSGFuZGxlYmFyczogdHJ1ZVxuICAgIE11c3RhY2hlOiB0cnVlXG4gICAgSmF2YVNjcmlwdDogdHJ1ZVxuICAgIEVKUzogdHJ1ZVxuICAgIEpTWDogdHJ1ZVxuICAgIEpTT046IHRydWVcbiAgICBDU1M6XG4gICAgICBpbmRlbnRfc2l6ZTogdHJ1ZVxuICAgICAgaW5kZW50X2NoYXI6IHRydWVcbiAgICAgIHNlbGVjdG9yX3NlcGFyYXRvcl9uZXdsaW5lOiB0cnVlXG4gICAgICBuZXdsaW5lX2JldHdlZW5fcnVsZXM6IHRydWVcbiAgICAgIHByZXNlcnZlX25ld2xpbmVzOiB0cnVlXG4gICAgICB3cmFwX2xpbmVfbGVuZ3RoOiB0cnVlXG4gICAgICBlbmRfd2l0aF9uZXdsaW5lOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEB2ZXJib3NlKFwiSlMgQmVhdXRpZnkgbGFuZ3VhZ2UgI3tsYW5ndWFnZX1cIilcbiAgICBAaW5mbyhcIkpTIEJlYXV0aWZ5IE9wdGlvbnM6ICN7SlNPTi5zdHJpbmdpZnkob3B0aW9ucywgbnVsbCwgNCl9XCIpXG4gICAgI1RPRE8gcmVjb25zaWRlciBoYW5kbGluZyBvZiBFT0wgb25jZSBqcy1iZWF1dGlmeSBhZGRzIEVPTCBkZXRlY3Rpb25cbiAgICAjc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9iZWF1dGlmeS13ZWIvanMtYmVhdXRpZnkvaXNzdWVzLzg5OVxuICAgIG9wdGlvbnMuZW9sID0gZ2V0RGVmYXVsdExpbmVFbmRpbmcoKSA/IG9wdGlvbnMuZW9sICNmaXhlcyBpc3N1ZSAjNzA3XG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgdHJ5XG4gICAgICAgIHN3aXRjaCBsYW5ndWFnZVxuICAgICAgICAgIHdoZW4gXCJKU09OXCIsIFwiSmF2YVNjcmlwdFwiLCBcIkpTWFwiXG4gICAgICAgICAgICBiZWF1dGlmeUpTID0gcmVxdWlyZShcImpzLWJlYXV0aWZ5XCIpXG4gICAgICAgICAgICB0ZXh0ID0gYmVhdXRpZnlKUyh0ZXh0LCBvcHRpb25zKVxuICAgICAgICAgICAgcmVzb2x2ZSB0ZXh0XG4gICAgICAgICAgd2hlbiBcIkhhbmRsZWJhcnNcIiwgXCJNdXN0YWNoZVwiXG4gICAgICAgICAgICAjIGpzaGludCBpZ25vcmU6IHN0YXJ0XG4gICAgICAgICAgICBvcHRpb25zLmluZGVudF9oYW5kbGViYXJzID0gdHJ1ZSAjIEZvcmNlIGpzYmVhdXRpZnkgdG8gaW5kZW50X2hhbmRsZWJhcnNcbiAgICAgICAgICAgICMganNoaW50IGlnbm9yZTogZW5kXG4gICAgICAgICAgICBiZWF1dGlmeUhUTUwgPSByZXF1aXJlKFwianMtYmVhdXRpZnlcIikuaHRtbFxuICAgICAgICAgICAgdGV4dCA9IGJlYXV0aWZ5SFRNTCh0ZXh0LCBvcHRpb25zKVxuICAgICAgICAgICAgcmVzb2x2ZSB0ZXh0XG4gICAgICAgICAgd2hlbiBcIkVKU1wiLCBcIkhUTUwgKExpcXVpZClcIiwgXCJIVE1MXCIsIFwiWE1MXCIsIFwiV2ViIEZvcm0vQ29udHJvbCAoQyMpXCIsIFwiV2ViIEhhbmRsZXIgKEMjKVwiXG4gICAgICAgICAgICBiZWF1dGlmeUhUTUwgPSByZXF1aXJlKFwianMtYmVhdXRpZnlcIikuaHRtbFxuICAgICAgICAgICAgdGV4dCA9IGJlYXV0aWZ5SFRNTCh0ZXh0LCBvcHRpb25zKVxuICAgICAgICAgICAgQGRlYnVnKFwiQmVhdXRpZmllZCBIVE1MOiAje3RleHR9XCIpXG4gICAgICAgICAgICByZXNvbHZlIHRleHRcbiAgICAgICAgICB3aGVuIFwiQ1NTXCJcbiAgICAgICAgICAgIGJlYXV0aWZ5Q1NTID0gcmVxdWlyZShcImpzLWJlYXV0aWZ5XCIpLmNzc1xuICAgICAgICAgICAgdGV4dCA9IGJlYXV0aWZ5Q1NTKHRleHQsIG9wdGlvbnMpXG4gICAgICAgICAgICByZXNvbHZlIHRleHRcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiVW5rbm93biBsYW5ndWFnZSBmb3IgSlMgQmVhdXRpZnk6IFwiK2xhbmd1YWdlKSlcbiAgICAgIGNhdGNoIGVyclxuICAgICAgICBAZXJyb3IoXCJKUyBCZWF1dGlmeSBlcnJvcjogI3tlcnJ9XCIpXG4gICAgICAgIHJlamVjdChlcnIpXG5cbiAgICApXG5cbiAgIyBSZXRyaWV2ZXMgdGhlIGRlZmF1bHQgbGluZSBlbmRpbmcgYmFzZWQgdXBvbiB0aGUgQXRvbSBjb25maWd1cmF0aW9uXG4gICMgIGBsaW5lLWVuZGluZy1zZWxlY3Rvci5kZWZhdWx0TGluZUVuZGluZ2AuIElmIHRoZSBBdG9tIGNvbmZpZ3VyYXRpb25cbiAgIyAgaW5kaWNhdGVzIFwiT1MgRGVmYXVsdFwiLCB0aGUgYHByb2Nlc3MucGxhdGZvcm1gIGlzIHF1ZXJpZWQsIHJldHVybmluZ1xuICAjICBDUkxGIGZvciBXaW5kb3dzIHN5c3RlbXMgYW5kIExGIGZvciBhbGwgb3RoZXIgc3lzdGVtcy5cbiAgIyBDb2RlIG1vZGlmaWVkIGZyb20gYXRvbS9saW5lLWVuZGluZy1zZWxlY3RvclxuICAjIHJldHVybnM6IFRoZSBjb3JyZWN0IGxpbmUtZW5kaW5nIGNoYXJhY3RlciBzZXF1ZW5jZSBiYXNlZCB1cG9uIHRoZSBBdG9tXG4gICMgIGNvbmZpZ3VyYXRpb24sIG9yIGBudWxsYCBpZiB0aGUgQXRvbSBsaW5lIGVuZGluZyBjb25maWd1cmF0aW9uIHdhcyBub3RcbiAgIyAgcmVjb2duaXplZC5cbiAgIyBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2xpbmUtZW5kaW5nLXNlbGVjdG9yL2Jsb2IvbWFzdGVyL2xpYi9tYWluLmpzXG4gIGdldERlZmF1bHRMaW5lRW5kaW5nPSAtPlxuICAgIHN3aXRjaCBhdG9tLmNvbmZpZy5nZXQoJ2xpbmUtZW5kaW5nLXNlbGVjdG9yLmRlZmF1bHRMaW5lRW5kaW5nJylcbiAgICAgIHdoZW4gJ0xGJ1xuICAgICAgICByZXR1cm4gJ1xcbidcbiAgICAgIHdoZW4gJ0NSTEYnXG4gICAgICAgIHJldHVybiAnXFxyXFxuJ1xuICAgICAgd2hlbiAnT1MgRGVmYXVsdCdcbiAgICAgICAgcmV0dXJuIGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgJ3dpbjMyJyB0aGVuICdcXHJcXG4nIGVsc2UgJ1xcbidcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIG51bGxcbiJdfQ==
