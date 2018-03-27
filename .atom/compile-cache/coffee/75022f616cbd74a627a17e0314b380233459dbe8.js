(function() {
  var $$, SelectListView, UsagesView, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $$ = _ref.$$, SelectListView = _ref.SelectListView;

  path = require('path');

  module.exports = UsagesView = (function(_super) {
    __extends(UsagesView, _super);

    function UsagesView() {
      return UsagesView.__super__.constructor.apply(this, arguments);
    }

    UsagesView.prototype.initialize = function(matches) {
      UsagesView.__super__.initialize.apply(this, arguments);
      this.storeFocusedElement();
      this.addClass('symbols-view');
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setLoading('Looking for usages');
      return this.focusFilterEditor();
    };

    UsagesView.prototype.destroy = function() {
      this.cancel();
      return this.panel.destroy();
    };

    UsagesView.prototype.viewForItem = function(_arg) {
      var column, fileName, line, moduleName, name, relativePath, _, _ref1;
      name = _arg.name, moduleName = _arg.moduleName, fileName = _arg.fileName, line = _arg.line, column = _arg.column;
      _ref1 = atom.project.relativizePath(fileName), _ = _ref1[0], relativePath = _ref1[1];
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div("" + name, {
              "class": 'primary-line'
            });
            return _this.div("" + relativePath + ", line " + line, {
              "class": 'secondary-line'
            });
          };
        })(this));
      });
    };

    UsagesView.prototype.getFilterKey = function() {
      return 'fileName';
    };

    UsagesView.prototype.scrollToItemView = function() {
      var column, editor, fileName, line, moduleName, name, _ref1;
      UsagesView.__super__.scrollToItemView.apply(this, arguments);
      _ref1 = this.getSelectedItem(), name = _ref1.name, moduleName = _ref1.moduleName, fileName = _ref1.fileName, line = _ref1.line, column = _ref1.column;
      editor = atom.workspace.getActiveTextEditor();
      if (editor.getBuffer().file.path === fileName) {
        editor.setSelectedBufferRange([[line - 1, column], [line - 1, column + name.length]]);
        return editor.scrollToBufferPosition([line - 1, column], {
          center: true
        });
      }
    };

    UsagesView.prototype.getEmptyMessage = function(itemCount) {
      if (itemCount === 0) {
        return 'No usages found';
      } else {
        return UsagesView.__super__.getEmptyMessage.apply(this, arguments);
      }
    };

    UsagesView.prototype.confirmed = function(_arg) {
      var column, fileName, line, moduleName, name, promise;
      name = _arg.name, moduleName = _arg.moduleName, fileName = _arg.fileName, line = _arg.line, column = _arg.column;
      this.cancelPosition = null;
      this.cancel();
      promise = atom.workspace.open(fileName);
      return promise.then(function(editor) {
        editor.setCursorBufferPosition([line - 1, column]);
        editor.setSelectedBufferRange([[line - 1, column], [line - 1, column + name.length]]);
        return editor.scrollToCursorPosition();
      });
    };

    UsagesView.prototype.cancelled = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.hide() : void 0;
    };

    return UsagesView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL3VzYWdlcy12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwQ0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsVUFBQSxFQUFELEVBQUssc0JBQUEsY0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixpQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEseUJBQUEsVUFBQSxHQUFZLFNBQUMsT0FBRCxHQUFBO0FBQ1YsTUFBQSw0Q0FBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsUUFBRCxDQUFVLGNBQVYsQ0FGQSxDQUFBOztRQUdBLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtBQUFBLFVBQUEsSUFBQSxFQUFNLElBQU47U0FBN0I7T0FIVjtBQUFBLE1BSUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsQ0FKQSxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsVUFBRCxDQUFZLG9CQUFaLENBTEEsQ0FBQTthQU1BLElBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBUFU7SUFBQSxDQUFaLENBQUE7O0FBQUEseUJBU0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQSxFQUZPO0lBQUEsQ0FUVCxDQUFBOztB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

//# sourceURL=/home/mowens/.atom/packages/autocomplete-python/lib/usages-view.coffee
