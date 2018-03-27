(function() {
  var RenameView, TextEditorView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('space-pen').View;

  TextEditorView = require('atom-space-pen-views').TextEditorView;

  module.exports = RenameView = (function(_super) {
    __extends(RenameView, _super);

    function RenameView() {
      return RenameView.__super__.constructor.apply(this, arguments);
    }

    RenameView.prototype.initialize = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: true
        });
      }
      return atom.commands.add(this.element, 'core:cancel', (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this));
    };

    RenameView.prototype.destroy = function() {
      this.panel.hide();
      this.focusout();
      return this.panel.destroy();
    };

    RenameView.content = function(usages) {
      var n, name;
      n = usages.length;
      name = usages[0].name;
      return this.div((function(_this) {
        return function() {
          _this.div("Type new name to replace " + n + " occurences of " + name + " within project:");
          return _this.subview('miniEditor', new TextEditorView({
            mini: true,
            placeholderText: name
          }));
        };
      })(this));
    };

    RenameView.prototype.onInput = function(callback) {
      this.miniEditor.focus();
      return atom.commands.add(this.element, {
        'core:confirm': (function(_this) {
          return function() {
            callback(_this.miniEditor.getText());
            return _this.destroy();
          };
        })(this)
      });
    };

    return RenameView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL3JlbmFtZS12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnQ0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsV0FBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUNDLGlCQUFrQixPQUFBLENBQVEsc0JBQVIsRUFBbEIsY0FERCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx5QkFBQSxVQUFBLEdBQVksU0FBQSxHQUFBOztRQUNWLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtBQUFBLFVBQUEsSUFBQSxFQUFNLElBQU47QUFBQSxVQUFTLE9BQUEsRUFBUyxJQUFsQjtTQUE3QjtPQUFWO2FBQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxPQUFuQixFQUE0QixhQUE1QixFQUEyQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNDLEVBRlU7SUFBQSxDQUFaLENBQUE7O0FBQUEseUJBSUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUMsUUFBRixDQUFBLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBLEVBSE87SUFBQSxDQUpULENBQUE7O0FBQUEsSUFTQSxVQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsTUFBRCxHQUFBO0FBQ1IsVUFBQSxPQUFBO0FBQUEsTUFBQSxDQUFBLEdBQUksTUFBTSxDQUFDLE1BQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQURqQixDQUFBO2FBRUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ0gsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFNLDJCQUFBLEdBQTJCLENBQTNCLEdBQTZCLGlCQUE3QixHQUE4QyxJQUE5QyxHQUFtRCxrQkFBekQsQ0FBQSxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUEyQixJQUFBLGNBQUEsQ0FDekI7QUFBQSxZQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsWUFBWSxlQUFBLEVBQWlCLElBQTdCO1dBRHlCLENBQTNCLEVBRkc7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFMLEVBSFE7SUFBQSxDQVRWLENBQUE7O0FBQUEseUJBaUJBLE9BQUEsR0FBUyxTQUFDLFFBQUQsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUFaLENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxPQUFuQixFQUE0QjtBQUFBLFFBQUEsY0FBQSxFQUFnQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTtBQUMxQyxZQUFBLFFBQUEsQ0FBUyxLQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQSxDQUFULENBQUEsQ0FBQTttQkFDQSxLQUFDLENBQUEsT0FBRCxDQUFBLEVBRjBDO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEI7T0FBNUIsRUFGTztJQUFBLENBakJULENBQUE7O3NCQUFBOztLQUR1QixLQUp6QixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/mowens/.atom/packages/autocomplete-python/lib/rename-view.coffee
