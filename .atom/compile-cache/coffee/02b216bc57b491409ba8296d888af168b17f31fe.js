(function() {
  var Dialog, InputDialog, os,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require("./dialog");

  os = require("os");

  module.exports = InputDialog = (function(superClass) {
    extend(InputDialog, superClass);

    function InputDialog(terminalView) {
      this.terminalView = terminalView;
      InputDialog.__super__.constructor.call(this, {
        prompt: "Insert Text",
        iconClass: "icon-keyboard",
        stayOpen: true
      });
    }

    InputDialog.prototype.onConfirm = function(input) {
      var data, eol;
      if (atom.config.get('terminal-plus.toggles.runInsertedText')) {
        eol = os.EOL;
      } else {
        eol = '';
      }
      data = "" + input + eol;
      this.terminalView.input(data);
      return this.cancel();
    };

    return InputDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmFsLXBsdXMvbGliL2lucHV0LWRpYWxvZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUE7OztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7RUFDVCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O0lBQ1MscUJBQUMsWUFBRDtNQUFDLElBQUMsQ0FBQSxlQUFEO01BQ1osNkNBQ0U7UUFBQSxNQUFBLEVBQVEsYUFBUjtRQUNBLFNBQUEsRUFBVyxlQURYO1FBRUEsUUFBQSxFQUFVLElBRlY7T0FERjtJQURXOzswQkFNYixTQUFBLEdBQVcsU0FBQyxLQUFEO0FBQ1QsVUFBQTtNQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVDQUFoQixDQUFIO1FBQ0UsR0FBQSxHQUFNLEVBQUUsQ0FBQyxJQURYO09BQUEsTUFBQTtRQUdFLEdBQUEsR0FBTSxHQUhSOztNQUtBLElBQUEsR0FBTyxFQUFBLEdBQUcsS0FBSCxHQUFXO01BQ2xCLElBQUMsQ0FBQSxZQUFZLENBQUMsS0FBZCxDQUFvQixJQUFwQjthQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7SUFSUzs7OztLQVBhO0FBSjFCIiwic291cmNlc0NvbnRlbnQiOlsiRGlhbG9nID0gcmVxdWlyZSBcIi4vZGlhbG9nXCJcbm9zID0gcmVxdWlyZSBcIm9zXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgSW5wdXREaWFsb2cgZXh0ZW5kcyBEaWFsb2dcbiAgY29uc3RydWN0b3I6IChAdGVybWluYWxWaWV3KSAtPlxuICAgIHN1cGVyXG4gICAgICBwcm9tcHQ6IFwiSW5zZXJ0IFRleHRcIlxuICAgICAgaWNvbkNsYXNzOiBcImljb24ta2V5Ym9hcmRcIlxuICAgICAgc3RheU9wZW46IHRydWVcblxuICBvbkNvbmZpcm06IChpbnB1dCkgLT5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmFsLXBsdXMudG9nZ2xlcy5ydW5JbnNlcnRlZFRleHQnKVxuICAgICAgZW9sID0gb3MuRU9MXG4gICAgZWxzZVxuICAgICAgZW9sID0gJydcblxuICAgIGRhdGEgPSBcIiN7aW5wdXR9I3tlb2x9XCJcbiAgICBAdGVybWluYWxWaWV3LmlucHV0IGRhdGFcbiAgICBAY2FuY2VsKClcbiJdfQ==
