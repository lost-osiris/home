(function() {
  "use strict";
  var Beautifier, NginxBeautify,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = NginxBeautify = (function(superClass) {
    extend(NginxBeautify, superClass);

    function NginxBeautify() {
      return NginxBeautify.__super__.constructor.apply(this, arguments);
    }

    NginxBeautify.prototype.name = "Nginx Beautify";

    NginxBeautify.prototype.link = "https://github.com/denysvitali/nginxbeautify";

    NginxBeautify.prototype.isPreInstalled = false;

    NginxBeautify.prototype.options = {
      Nginx: {
        spaces: [
          "indent_with_tabs", "indent_size", "indent_char", function(indent_with_tabs, indent_size, indent_char) {
            if (indent_with_tabs || indent_char === "\t") {
              return 0;
            } else {
              return indent_size;
            }
          }
        ],
        tabs: [
          "indent_with_tabs", "indent_size", "indent_char", function(indent_with_tabs, indent_size, indent_char) {
            if (indent_with_tabs || indent_char === "\t") {
              return indent_size;
            } else {
              return 0;
            }
          }
        ],
        dontJoinCurlyBracet: true
      }
    };

    NginxBeautify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var Beautify, error, instance;
        Beautify = require("nginxbeautify");
        instance = new Beautify(options);
        try {
          return resolve(instance.parse(text));
        } catch (error1) {
          error = error1;
          return reject(error);
        }
      });
    };

    return NginxBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL25naW54LWJlYXV0aWZ5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSx5QkFBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7NEJBQ3JCLElBQUEsR0FBTTs7NEJBQ04sSUFBQSxHQUFNOzs0QkFDTixjQUFBLEdBQWdCOzs0QkFFaEIsT0FBQSxHQUFTO01BQ1AsS0FBQSxFQUFPO1FBQ0wsTUFBQSxFQUFRO1VBQUMsa0JBQUQsRUFBcUIsYUFBckIsRUFBb0MsYUFBcEMsRUFBbUQsU0FBQyxnQkFBRCxFQUFtQixXQUFuQixFQUFnQyxXQUFoQztZQUN6RCxJQUFHLGdCQUFBLElBQW9CLFdBQUEsS0FBZSxJQUF0QztxQkFDRSxFQURGO2FBQUEsTUFBQTtxQkFHRSxZQUhGOztVQUR5RCxDQUFuRDtTQURIO1FBT0wsSUFBQSxFQUFNO1VBQUMsa0JBQUQsRUFBcUIsYUFBckIsRUFBb0MsYUFBcEMsRUFBbUQsU0FBQyxnQkFBRCxFQUFtQixXQUFuQixFQUFnQyxXQUFoQztZQUN2RCxJQUFHLGdCQUFBLElBQW9CLFdBQUEsS0FBZSxJQUF0QztxQkFDRSxZQURGO2FBQUEsTUFBQTtxQkFHRSxFQUhGOztVQUR1RCxDQUFuRDtTQVBEO1FBYUwsbUJBQUEsRUFBcUIsSUFiaEI7T0FEQTs7OzRCQWtCVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUVSLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDbEIsWUFBQTtRQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsZUFBUjtRQUNYLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FBUyxPQUFUO0FBQ2Y7aUJBQ0UsT0FBQSxDQUFRLFFBQVEsQ0FBQyxLQUFULENBQWUsSUFBZixDQUFSLEVBREY7U0FBQSxjQUFBO1VBRU07aUJBRUosTUFBQSxDQUFPLEtBQVAsRUFKRjs7TUFIa0IsQ0FBVDtJQUZIOzs7O0tBdkJpQztBQUg3QyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBOZ2lueEJlYXV0aWZ5IGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIk5naW54IEJlYXV0aWZ5XCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vZGVueXN2aXRhbGkvbmdpbnhiZWF1dGlmeVwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6IHtcbiAgICBOZ2lueDoge1xuICAgICAgc3BhY2VzOiBbXCJpbmRlbnRfd2l0aF90YWJzXCIsIFwiaW5kZW50X3NpemVcIiwgXCJpbmRlbnRfY2hhclwiLCAoaW5kZW50X3dpdGhfdGFicywgaW5kZW50X3NpemUsIGluZGVudF9jaGFyKSAtPlxuICAgICAgICBpZiBpbmRlbnRfd2l0aF90YWJzIG9yIGluZGVudF9jaGFyIGlzIFwiXFx0XCJcbiAgICAgICAgICAwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpbmRlbnRfc2l6ZVxuICAgICAgXVxuICAgICAgdGFiczogW1wiaW5kZW50X3dpdGhfdGFic1wiLCBcImluZGVudF9zaXplXCIsIFwiaW5kZW50X2NoYXJcIiwgKGluZGVudF93aXRoX3RhYnMsIGluZGVudF9zaXplLCBpbmRlbnRfY2hhcikgLT5cbiAgICAgICAgaWYgaW5kZW50X3dpdGhfdGFicyBvciBpbmRlbnRfY2hhciBpcyBcIlxcdFwiXG4gICAgICAgICAgaW5kZW50X3NpemVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIDBcbiAgICAgIF1cbiAgICAgIGRvbnRKb2luQ3VybHlCcmFjZXQ6IHRydWVcbiAgICB9XG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuXG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgQmVhdXRpZnkgPSByZXF1aXJlKFwibmdpbnhiZWF1dGlmeVwiKVxuICAgICAgaW5zdGFuY2UgPSBuZXcgQmVhdXRpZnkob3B0aW9ucylcbiAgICAgIHRyeVxuICAgICAgICByZXNvbHZlKGluc3RhbmNlLnBhcnNlKHRleHQpKVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgIyBFcnJvciBvY2N1cnJlZFxuICAgICAgICByZWplY3QoZXJyb3IpXG4gICAgKVxuIl19
