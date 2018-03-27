(function() {
  var OperationAbortedError,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  module.exports = OperationAbortedError = (function(superClass) {
    extend(OperationAbortedError, superClass);

    function OperationAbortedError(arg) {
      this.message = arg.message;
      this.name = this.constructor.name;
    }

    return OperationAbortedError;

  })(Error);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Vycm9ycy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUE7OztFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007OztJQUNTLCtCQUFDLEdBQUQ7TUFBRSxJQUFDLENBQUEsVUFBRixJQUFFO01BQ2QsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDO0lBRFY7Ozs7S0FEcUI7QUFEcEMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBPcGVyYXRpb25BYm9ydGVkRXJyb3IgZXh0ZW5kcyBFcnJvclxuICBjb25zdHJ1Y3RvcjogKHtAbWVzc2FnZX0pIC0+XG4gICAgQG5hbWUgPSBAY29uc3RydWN0b3IubmFtZVxuIl19
