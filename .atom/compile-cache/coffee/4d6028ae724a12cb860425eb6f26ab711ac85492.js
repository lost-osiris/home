(function() {
  var $$, DefinitionsView, SelectListView, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $$ = _ref.$$, SelectListView = _ref.SelectListView;

  path = require('path');

  module.exports = DefinitionsView = (function(_super) {
    __extends(DefinitionsView, _super);

    function DefinitionsView() {
      return DefinitionsView.__super__.constructor.apply(this, arguments);
    }

    DefinitionsView.prototype.initialize = function(matches) {
      DefinitionsView.__super__.initialize.apply(this, arguments);
      this.storeFocusedElement();
      this.addClass('symbols-view');
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setLoading('Looking for definitions');
      return this.focusFilterEditor();
    };

    DefinitionsView.prototype.destroy = function() {
      this.cancel();
      return this.panel.destroy();
    };

    DefinitionsView.prototype.viewForItem = function(_arg) {
      var column, fileName, line, relativePath, text, type, _, _ref1;
      text = _arg.text, fileName = _arg.fileName, line = _arg.line, column = _arg.column, type = _arg.type;
      _ref1 = atom.project.relativizePath(fileName), _ = _ref1[0], relativePath = _ref1[1];
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div("" + type + " " + text, {
              "class": 'primary-line'
            });
            return _this.div("" + relativePath + ", line " + (line + 1), {
              "class": 'secondary-line'
            });
          };
        })(this));
      });
    };

    DefinitionsView.prototype.getFilterKey = function() {
      return 'fileName';
    };

    DefinitionsView.prototype.getEmptyMessage = function(itemCount) {
      if (itemCount === 0) {
        return 'No definition found';
      } else {
        return DefinitionsView.__super__.getEmptyMessage.apply(this, arguments);
      }
    };

    DefinitionsView.prototype.confirmed = function(_arg) {
      var column, fileName, line, promise;
      fileName = _arg.fileName, line = _arg.line, column = _arg.column;
      this.cancelPosition = null;
      this.cancel();
      promise = atom.workspace.open(fileName);
      return promise.then(function(editor) {
        editor.setCursorBufferPosition([line, column]);
        return editor.scrollToCursorPosition();
      });
    };

    DefinitionsView.prototype.cancelled = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.hide() : void 0;
    };

    return DefinitionsView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL2RlZmluaXRpb25zLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUF1QixPQUFBLENBQVEsc0JBQVIsQ0FBdkIsRUFBQyxVQUFBLEVBQUQsRUFBSyxzQkFBQSxjQUFMLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHNDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSw4QkFBQSxVQUFBLEdBQVksU0FBQyxPQUFELEdBQUE7QUFDVixNQUFBLGlEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxRQUFELENBQVUsY0FBVixDQUZBLENBQUE7O1FBR0EsSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO0FBQUEsVUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3QjtPQUhWO0FBQUEsTUFJQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQSxDQUpBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxVQUFELENBQVkseUJBQVosQ0FMQSxDQUFBO2FBTUEsSUFBQyxDQUFBLGlCQUFELENBQUEsRUFQVTtJQUFBLENBQVosQ0FBQTs7QUFBQSw4QkFTQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBLEVBRk87SUFBQSxDQVRULENBQUE7O0FBQUEsOEJBYUEsV0FBQSxHQUFhLFNBQUMsSUFBRCxHQUFBO0FBQ1gsVUFBQSwwREFBQTtBQUFBLE1BRGEsWUFBQSxNQUFNLGdCQUFBLFVBQVUsWUFBQSxNQUFNLGNBQUEsUUFBUSxZQUFBLElBQzNDLENBQUE7QUFBQSxNQUFBLFFBQW9CLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUE0QixRQUE1QixDQUFwQixFQUFDLFlBQUQsRUFBSSx1QkFBSixDQUFBO0FBQ0EsYUFBTyxFQUFBLENBQUcsU0FBQSxHQUFBO2VBQ1IsSUFBQyxDQUFBLEVBQUQsQ0FBSTtBQUFBLFVBQUEsT0FBQSxFQUFPLFdBQVA7U0FBSixFQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTtBQUN0QixZQUFBLEtBQUMsQ0FBQSxHQUFELENBQUssRUFBQSxHQUFHLElBQUgsR0FBUSxHQUFSLEdBQVcsSUFBaEIsRUFBd0I7QUFBQSxjQUFBLE9BQUEsRUFBTyxjQUFQO2FBQXhCLENBQUEsQ0FBQTttQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLLEVBQUEsR0FBRyxZQUFILEdBQWdCLFNBQWhCLEdBQXdCLENBQUMsSUFBQSxHQUFPLENBQVIsQ0FBN0IsRUFBMEM7QUFBQSxjQUFBLE9BQUEsRUFBTyxnQkFBUDthQUExQyxFQUZzQjtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCLEVBRFE7TUFBQSxDQUFILENBQVAsQ0FGVztJQUFBLENBYmIsQ0FBQTs7QUFBQSw4QkFvQkEsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUFHLFdBQUg7SUFBQSxDQXBCZCxDQUFBOztBQUFBLDhCQXNCQSxlQUFBLEdBQWlCLFNBQUMsU0FBRCxHQUFBO0FBQ2YsTUFBQSxJQUFHLFNBQUEsS0FBYSxDQUFoQjtlQUNFLHNCQURGO09BQUEsTUFBQTtlQUdFLHNEQUFBLFNBQUEsRUFIRjtPQURlO0lBQUEsQ0F0QmpCLENBQUE7O0FBQUEsOEJBNEJBLFNBQUEsR0FBVyxTQUFDLElBQUQsR0FBQTtBQUNULFVBQUEsK0JBQUE7QUFBQSxNQURXLGdCQUFBLFVBQVUsWUFBQSxNQUFNLGNBQUEsTUFDM0IsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBbEIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQURBLENBQUE7QUFBQSxNQUVBLE9BQUEsR0FBVSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsUUFBcEIsQ0FGVixDQUFBO2FBR0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxTQUFDLE1BQUQsR0FBQTtBQUNYLFFBQUEsTUFBTSxDQUFDLHVCQUFQLENBQStCLENBQUMsSUFBRCxFQUFPLE1BQVAsQ0FBL0IsQ0FBQSxDQUFBO2VBQ0EsTUFBTSxDQUFDLHNCQUFQLENBQUEsRUFGVztNQUFBLENBQWIsRUFKUztJQUFBLENBNUJYLENBQUE7O0FBQUEsOEJBb0NBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLEtBQUE7aURBQU0sQ0FBRSxJQUFSLENBQUEsV0FEUztJQUFBLENBcENYLENBQUE7OzJCQUFBOztLQUQ0QixlQUo5QixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/mowens/.atom/packages/autocomplete-python/lib/definitions-view.coffee
