
/*
Requires https://github.com/erniebrodeur/ruby-beautify
 */

(function() {
  "use strict";
  var Beautifier, RubyBeautify,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = RubyBeautify = (function(superClass) {
    extend(RubyBeautify, superClass);

    function RubyBeautify() {
      return RubyBeautify.__super__.constructor.apply(this, arguments);
    }

    RubyBeautify.prototype.name = "Ruby Beautify";

    RubyBeautify.prototype.link = "https://github.com/erniebrodeur/ruby-beautify";

    RubyBeautify.prototype.options = {
      Ruby: {
        indent_size: true,
        indent_char: true
      }
    };

    RubyBeautify.prototype.beautify = function(text, language, options) {
      return this.run("rbeautify", [options.indent_char === '\t' ? "--tabs" : "--spaces", "--indent_count", options.indent_size, this.tempFile("input", text)], {
        help: {
          link: "https://github.com/erniebrodeur/ruby-beautify"
        }
      });
    };

    return RubyBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3J1YnktYmVhdXRpZnkuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLHdCQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OzsyQkFDckIsSUFBQSxHQUFNOzsyQkFDTixJQUFBLEdBQU07OzJCQUVOLE9BQUEsR0FBUztNQUNQLElBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxJQUFiO1FBQ0EsV0FBQSxFQUFhLElBRGI7T0FGSzs7OzJCQU1ULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxXQUFMLEVBQWtCLENBQ2IsT0FBTyxDQUFDLFdBQVIsS0FBdUIsSUFBMUIsR0FBb0MsUUFBcEMsR0FBa0QsVUFEbEMsRUFFaEIsZ0JBRmdCLEVBRUUsT0FBTyxDQUFDLFdBRlYsRUFHaEIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBSGdCLENBQWxCLEVBSUs7UUFBQSxJQUFBLEVBQU07VUFDUCxJQUFBLEVBQU0sK0NBREM7U0FBTjtPQUpMO0lBRFE7Ozs7S0FWZ0M7QUFQNUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9lcm5pZWJyb2RldXIvcnVieS1iZWF1dGlmeVxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBSdWJ5QmVhdXRpZnkgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiUnVieSBCZWF1dGlmeVwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2VybmllYnJvZGV1ci9ydWJ5LWJlYXV0aWZ5XCJcblxuICBvcHRpb25zOiB7XG4gICAgUnVieTpcbiAgICAgIGluZGVudF9zaXplOiB0cnVlXG4gICAgICBpbmRlbnRfY2hhcjogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBAcnVuKFwicmJlYXV0aWZ5XCIsIFtcbiAgICAgIGlmIG9wdGlvbnMuaW5kZW50X2NoYXIgaXMgJ1xcdCcgdGhlbiBcIi0tdGFic1wiIGVsc2UgXCItLXNwYWNlc1wiXG4gICAgICBcIi0taW5kZW50X2NvdW50XCIsIG9wdGlvbnMuaW5kZW50X3NpemVcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBdLCBoZWxwOiB7XG4gICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2VybmllYnJvZGV1ci9ydWJ5LWJlYXV0aWZ5XCJcbiAgICAgIH0pXG4iXX0=
