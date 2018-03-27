(function() {
  "use strict";
  var Beautifier, TypeScriptFormatter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = TypeScriptFormatter = (function(superClass) {
    extend(TypeScriptFormatter, superClass);

    function TypeScriptFormatter() {
      return TypeScriptFormatter.__super__.constructor.apply(this, arguments);
    }

    TypeScriptFormatter.prototype.name = "TypeScript Formatter";

    TypeScriptFormatter.prototype.link = "https://github.com/vvakame/typescript-formatter";

    TypeScriptFormatter.prototype.options = {
      TypeScript: true
    };

    TypeScriptFormatter.prototype.beautify = function(text, language, options) {
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var e, format, formatterUtils, opts, result;
          try {
            format = require("typescript-formatter/lib/formatter")["default"];
            formatterUtils = require("typescript-formatter/lib/utils");
            opts = formatterUtils.createDefaultFormatCodeOptions();
            if (options.indent_with_tabs) {
              opts.ConvertTabsToSpaces = false;
            } else {
              opts.TabSize = options.tab_width || options.indent_size;
              opts.IndentSize = options.indent_size;
              opts.IndentStyle = 'space';
            }
            _this.verbose('typescript', text, opts);
            result = format('', text, opts);
            _this.verbose(result);
            return resolve(result);
          } catch (error) {
            e = error;
            return reject(e);
          }
        };
      })(this));
    };

    return TypeScriptFormatter;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3R5cGVzY3JpcHQtZm9ybWF0dGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSwrQkFBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7a0NBQ3JCLElBQUEsR0FBTTs7a0NBQ04sSUFBQSxHQUFNOztrQ0FDTixPQUFBLEdBQVM7TUFDUCxVQUFBLEVBQVksSUFETDs7O2tDQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBRWxCLGNBQUE7QUFBQTtZQUNFLE1BQUEsR0FBUyxPQUFBLENBQVEsb0NBQVIsQ0FBNkMsRUFBQyxPQUFEO1lBQ3RELGNBQUEsR0FBaUIsT0FBQSxDQUFRLGdDQUFSO1lBR2pCLElBQUEsR0FBTyxjQUFjLENBQUMsOEJBQWYsQ0FBQTtZQUVQLElBQUcsT0FBTyxDQUFDLGdCQUFYO2NBQ0UsSUFBSSxDQUFDLG1CQUFMLEdBQTJCLE1BRDdCO2FBQUEsTUFBQTtjQUdFLElBQUksQ0FBQyxPQUFMLEdBQWUsT0FBTyxDQUFDLFNBQVIsSUFBcUIsT0FBTyxDQUFDO2NBQzVDLElBQUksQ0FBQyxVQUFMLEdBQWtCLE9BQU8sQ0FBQztjQUMxQixJQUFJLENBQUMsV0FBTCxHQUFtQixRQUxyQjs7WUFPQSxLQUFDLENBQUEsT0FBRCxDQUFTLFlBQVQsRUFBdUIsSUFBdkIsRUFBNkIsSUFBN0I7WUFDQSxNQUFBLEdBQVMsTUFBQSxDQUFPLEVBQVAsRUFBVyxJQUFYLEVBQWlCLElBQWpCO1lBQ1QsS0FBQyxDQUFBLE9BQUQsQ0FBUyxNQUFUO21CQUNBLE9BQUEsQ0FBUSxNQUFSLEVBakJGO1dBQUEsYUFBQTtZQWtCTTtBQUNKLG1CQUFPLE1BQUEsQ0FBTyxDQUFQLEVBbkJUOztRQUZrQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtJQURIOzs7O0tBUHVDO0FBSG5EIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFR5cGVTY3JpcHRGb3JtYXR0ZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiVHlwZVNjcmlwdCBGb3JtYXR0ZXJcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS92dmFrYW1lL3R5cGVzY3JpcHQtZm9ybWF0dGVyXCJcbiAgb3B0aW9uczoge1xuICAgIFR5cGVTY3JpcHQ6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuXG4gICAgICB0cnlcbiAgICAgICAgZm9ybWF0ID0gcmVxdWlyZShcInR5cGVzY3JpcHQtZm9ybWF0dGVyL2xpYi9mb3JtYXR0ZXJcIikuZGVmYXVsdFxuICAgICAgICBmb3JtYXR0ZXJVdGlscyA9IHJlcXVpcmUoXCJ0eXBlc2NyaXB0LWZvcm1hdHRlci9saWIvdXRpbHNcIilcbiAgICAgICAgIyBAdmVyYm9zZSgnZm9ybWF0JywgZm9ybWF0LCBmb3JtYXR0ZXJVdGlscylcblxuICAgICAgICBvcHRzID0gZm9ybWF0dGVyVXRpbHMuY3JlYXRlRGVmYXVsdEZvcm1hdENvZGVPcHRpb25zKClcblxuICAgICAgICBpZiBvcHRpb25zLmluZGVudF93aXRoX3RhYnNcbiAgICAgICAgICBvcHRzLkNvbnZlcnRUYWJzVG9TcGFjZXMgPSBmYWxzZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgb3B0cy5UYWJTaXplID0gb3B0aW9ucy50YWJfd2lkdGggb3Igb3B0aW9ucy5pbmRlbnRfc2l6ZVxuICAgICAgICAgIG9wdHMuSW5kZW50U2l6ZSA9IG9wdGlvbnMuaW5kZW50X3NpemVcbiAgICAgICAgICBvcHRzLkluZGVudFN0eWxlID0gJ3NwYWNlJ1xuXG4gICAgICAgIEB2ZXJib3NlKCd0eXBlc2NyaXB0JywgdGV4dCwgb3B0cylcbiAgICAgICAgcmVzdWx0ID0gZm9ybWF0KCcnLCB0ZXh0LCBvcHRzKVxuICAgICAgICBAdmVyYm9zZShyZXN1bHQpXG4gICAgICAgIHJlc29sdmUgcmVzdWx0XG4gICAgICBjYXRjaCBlXG4gICAgICAgIHJldHVybiByZWplY3QoZSlcblxuICAgIClcbiJdfQ==
