(function() {
  var OperationAbortedError, VimModePlusError,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  VimModePlusError = (function(superClass) {
    extend(VimModePlusError, superClass);

    function VimModePlusError(arg) {
      this.message = arg.message;
      this.name = this.constructor.name;
    }

    return VimModePlusError;

  })(Error);

  OperationAbortedError = (function(superClass) {
    extend(OperationAbortedError, superClass);

    function OperationAbortedError() {
      return OperationAbortedError.__super__.constructor.apply(this, arguments);
    }

    return OperationAbortedError;

  })(VimModePlusError);

  module.exports = {
    OperationAbortedError: OperationAbortedError
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Vycm9ycy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHVDQUFBO0lBQUE7OztFQUFNOzs7SUFDUywwQkFBQyxHQUFEO01BQUUsSUFBQyxDQUFBLFVBQUYsSUFBRTtNQUNkLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFdBQVcsQ0FBQztJQURWOzs7O0tBRGdCOztFQUl6Qjs7Ozs7Ozs7O0tBQThCOztFQUVwQyxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUNmLHVCQUFBLHFCQURlOztBQU5qQiIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFZpbU1vZGVQbHVzRXJyb3IgZXh0ZW5kcyBFcnJvclxuICBjb25zdHJ1Y3RvcjogKHtAbWVzc2FnZX0pIC0+XG4gICAgQG5hbWUgPSBAY29uc3RydWN0b3IubmFtZVxuXG5jbGFzcyBPcGVyYXRpb25BYm9ydGVkRXJyb3IgZXh0ZW5kcyBWaW1Nb2RlUGx1c0Vycm9yXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBPcGVyYXRpb25BYm9ydGVkRXJyb3Jcbn1cbiJdfQ==
