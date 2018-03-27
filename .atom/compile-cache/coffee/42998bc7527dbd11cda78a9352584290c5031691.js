(function() {
  var Base, CompositeDisposable, Disposable, Emitter, ModeManager, Range, _, moveCursorLeft, ref, swrap;

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, Range = ref.Range, CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable;

  Base = require('./base');

  swrap = require('./selection-wrapper');

  moveCursorLeft = require('./utils').moveCursorLeft;

  ModeManager = (function() {
    ModeManager.prototype.mode = 'insert';

    ModeManager.prototype.submode = null;

    ModeManager.prototype.replacedCharsBySelection = null;

    function ModeManager(vimState) {
      var ref1;
      this.vimState = vimState;
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
      this.mode = 'insert';
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
    }

    ModeManager.prototype.destroy = function() {
      return this.subscriptions.dispose();
    };

    ModeManager.prototype.isMode = function(mode, submode) {
      if (submode == null) {
        submode = null;
      }
      return (mode === this.mode) && (submode === this.submode);
    };

    ModeManager.prototype.onWillActivateMode = function(fn) {
      return this.emitter.on('will-activate-mode', fn);
    };

    ModeManager.prototype.onDidActivateMode = function(fn) {
      return this.emitter.on('did-activate-mode', fn);
    };

    ModeManager.prototype.onWillDeactivateMode = function(fn) {
      return this.emitter.on('will-deactivate-mode', fn);
    };

    ModeManager.prototype.preemptWillDeactivateMode = function(fn) {
      return this.emitter.preempt('will-deactivate-mode', fn);
    };

    ModeManager.prototype.onDidDeactivateMode = function(fn) {
      return this.emitter.on('did-deactivate-mode', fn);
    };

    ModeManager.prototype.activate = function(newMode, newSubmode) {
      var ref1, ref2;
      if (newSubmode == null) {
        newSubmode = null;
      }
      if ((newMode === 'visual') && this.editor.isEmpty()) {
        return;
      }
      this.emitter.emit('will-activate-mode', {
        mode: newMode,
        submode: newSubmode
      });
      if ((newMode === 'visual') && (this.submode != null) && (newSubmode === this.submode)) {
        ref1 = ['normal', null], newMode = ref1[0], newSubmode = ref1[1];
      }
      if (newMode !== this.mode) {
        this.deactivate();
      }
      this.deactivator = (function() {
        switch (newMode) {
          case 'normal':
            return this.activateNormalMode();
          case 'operator-pending':
            return this.activateOperatorPendingMode();
          case 'insert':
            return this.activateInsertMode(newSubmode);
          case 'visual':
            return this.activateVisualMode(newSubmode);
        }
      }).call(this);
      if (newMode !== 'visual') {
        swrap.clearProperties(this.editor);
      }
      this.editorElement.classList.remove(this.mode + "-mode");
      this.editorElement.classList.remove(this.submode);
      ref2 = [newMode, newSubmode], this.mode = ref2[0], this.submode = ref2[1];
      this.editorElement.classList.add(this.mode + "-mode");
      if (this.submode != null) {
        this.editorElement.classList.add(this.submode);
      }
      if (this.mode === 'visual') {
        this.updateNarrowedState();
        this.vimState.updatePreviousSelection();
      }
      this.vimState.statusBarManager.update(this.mode, this.submode);
      this.vimState.updateCursorsVisibility();
      return this.emitter.emit('did-activate-mode', {
        mode: this.mode,
        submode: this.submode
      });
    };

    ModeManager.prototype.deactivate = function() {
      var ref1, ref2;
      if (!((ref1 = this.deactivator) != null ? ref1.disposed : void 0)) {
        this.emitter.emit('will-deactivate-mode', {
          mode: this.mode,
          submode: this.submode
        });
        if ((ref2 = this.deactivator) != null) {
          ref2.dispose();
        }
        this.editorElement.classList.remove(this.mode + "-mode");
        this.editorElement.classList.remove(this.submode);
        return this.emitter.emit('did-deactivate-mode', {
          mode: this.mode,
          submode: this.submode
        });
      }
    };

    ModeManager.prototype.activateNormalMode = function() {
      var cursor, i, len, ref1, ref2;
      this.vimState.reset();
      if ((ref1 = this.editorElement.component) != null) {
        ref1.setInputEnabled(false);
      }
      ref2 = this.editor.getCursors();
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        if (cursor.isAtEndOfLine()) {
          moveCursorLeft(cursor, {
            preserveGoalColumn: true
          });
        }
      }
      return new Disposable;
    };

    ModeManager.prototype.activateOperatorPendingMode = function() {
      return new Disposable;
    };

    ModeManager.prototype.activateInsertMode = function(submode) {
      var replaceModeDeactivator;
      if (submode == null) {
        submode = null;
      }
      this.editorElement.component.setInputEnabled(true);
      if (submode === 'replace') {
        replaceModeDeactivator = this.activateReplaceMode();
      }
      return new Disposable((function(_this) {
        return function() {
          var cursor, i, len, needSpecialCareToPreventWrapLine, ref1, results;
          if (replaceModeDeactivator != null) {
            replaceModeDeactivator.dispose();
          }
          replaceModeDeactivator = null;
          needSpecialCareToPreventWrapLine = _this.editor.hasAtomicSoftTabs();
          ref1 = _this.editor.getCursors();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            cursor = ref1[i];
            results.push(moveCursorLeft(cursor, {
              needSpecialCareToPreventWrapLine: needSpecialCareToPreventWrapLine
            }));
          }
          return results;
        };
      })(this));
    };

    ModeManager.prototype.activateReplaceMode = function() {
      var subs;
      this.replacedCharsBySelection = new WeakMap;
      subs = new CompositeDisposable;
      subs.add(this.editor.onWillInsertText((function(_this) {
        return function(arg) {
          var cancel, text;
          text = arg.text, cancel = arg.cancel;
          cancel();
          return _this.editor.getSelections().forEach(function(selection) {
            var char, i, len, ref1, ref2, results, selectedText;
            ref2 = (ref1 = text.split('')) != null ? ref1 : [];
            results = [];
            for (i = 0, len = ref2.length; i < len; i++) {
              char = ref2[i];
              if ((char !== "\n") && (!selection.cursor.isAtEndOfLine())) {
                selection.selectRight();
              }
              selectedText = selection.getText();
              selection.insertText(char);
              if (!_this.replacedCharsBySelection.has(selection)) {
                _this.replacedCharsBySelection.set(selection, []);
              }
              results.push(_this.replacedCharsBySelection.get(selection).push(selectedText));
            }
            return results;
          });
        };
      })(this)));
      subs.add(new Disposable((function(_this) {
        return function() {
          return _this.replacedCharsBySelection = null;
        };
      })(this)));
      return subs;
    };

    ModeManager.prototype.getReplacedCharForSelection = function(selection) {
      var ref1;
      return (ref1 = this.replacedCharsBySelection.get(selection)) != null ? ref1.pop() : void 0;
    };

    ModeManager.prototype.activateVisualMode = function(newSubmode) {
      var $selection, i, j, len, len1, ref1, ref2;
      this.vimState.assertWithException(newSubmode != null, "activate visual-mode without submode");
      ref1 = swrap.getSelections(this.editor);
      for (i = 0, len = ref1.length; i < len; i++) {
        $selection = ref1[i];
        if (!$selection.hasProperties()) {
          $selection.saveProperties();
        }
      }
      swrap.normalize(this.editor);
      ref2 = swrap.getSelections(this.editor);
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        $selection = ref2[j];
        $selection.applyWise(newSubmode);
      }
      if (newSubmode === 'blockwise') {
        this.vimState.getLastBlockwiseSelection().autoscroll();
      }
      return new Disposable((function(_this) {
        return function() {
          var k, len2, ref3, selection;
          swrap.normalize(_this.editor);
          if (_this.submode === 'blockwise') {
            swrap.setReversedState(_this.editor, true);
          }
          ref3 = _this.editor.getSelections();
          for (k = 0, len2 = ref3.length; k < len2; k++) {
            selection = ref3[k];
            selection.clear({
              autoscroll: false
            });
          }
          return _this.updateNarrowedState(false);
        };
      })(this));
    };

    ModeManager.prototype.hasMultiLineSelection = function() {
      var ref1;
      if (this.isMode('visual', 'blockwise')) {
        return !((ref1 = this.vimState.getLastBlockwiseSelection()) != null ? ref1.isSingleRow() : void 0);
      } else {
        return !swrap(this.editor.getLastSelection()).isSingleRow();
      }
    };

    ModeManager.prototype.updateNarrowedState = function(value) {
      if (value == null) {
        value = null;
      }
      return this.editorElement.classList.toggle('is-narrowed', value != null ? value : this.hasMultiLineSelection());
    };

    ModeManager.prototype.isNarrowed = function() {
      return this.editorElement.classList.contains('is-narrowed');
    };

    return ModeManager;

  })();

  module.exports = ModeManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vZGUtbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBb0QsT0FBQSxDQUFRLE1BQVIsQ0FBcEQsRUFBQyxxQkFBRCxFQUFVLGlCQUFWLEVBQWlCLDZDQUFqQixFQUFzQzs7RUFDdEMsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBQ1AsaUJBQWtCLE9BQUEsQ0FBUSxTQUFSOztFQUViOzBCQUNKLElBQUEsR0FBTTs7MEJBQ04sT0FBQSxHQUFTOzswQkFDVCx3QkFBQSxHQUEwQjs7SUFFYixxQkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQTtNQUNYLElBQUMsQ0FBQSxJQUFELEdBQVE7TUFDUixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QixDQUFuQjtJQUxXOzswQkFPYixPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO0lBRE87OzBCQUdULE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxPQUFQOztRQUFPLFVBQVE7O2FBQ3JCLENBQUMsSUFBQSxLQUFRLElBQUMsQ0FBQSxJQUFWLENBQUEsSUFBb0IsQ0FBQyxPQUFBLEtBQVcsSUFBQyxDQUFBLE9BQWI7SUFEZDs7MEJBS1Isa0JBQUEsR0FBb0IsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksb0JBQVosRUFBa0MsRUFBbEM7SUFBUjs7MEJBQ3BCLGlCQUFBLEdBQW1CLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLG1CQUFaLEVBQWlDLEVBQWpDO0lBQVI7OzBCQUNuQixvQkFBQSxHQUFzQixTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxzQkFBWixFQUFvQyxFQUFwQztJQUFSOzswQkFDdEIseUJBQUEsR0FBMkIsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLHNCQUFqQixFQUF5QyxFQUF6QztJQUFSOzswQkFDM0IsbUJBQUEsR0FBcUIsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVkscUJBQVosRUFBbUMsRUFBbkM7SUFBUjs7MEJBS3JCLFFBQUEsR0FBVSxTQUFDLE9BQUQsRUFBVSxVQUFWO0FBRVIsVUFBQTs7UUFGa0IsYUFBVzs7TUFFN0IsSUFBVSxDQUFDLE9BQUEsS0FBVyxRQUFaLENBQUEsSUFBMEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUEsQ0FBcEM7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLG9CQUFkLEVBQW9DO1FBQUEsSUFBQSxFQUFNLE9BQU47UUFBZSxPQUFBLEVBQVMsVUFBeEI7T0FBcEM7TUFFQSxJQUFHLENBQUMsT0FBQSxLQUFXLFFBQVosQ0FBQSxJQUEwQixzQkFBMUIsSUFBd0MsQ0FBQyxVQUFBLEtBQWMsSUFBQyxDQUFBLE9BQWhCLENBQTNDO1FBQ0UsT0FBd0IsQ0FBQyxRQUFELEVBQVcsSUFBWCxDQUF4QixFQUFDLGlCQUFELEVBQVUscUJBRFo7O01BR0EsSUFBa0IsT0FBQSxLQUFhLElBQUMsQ0FBQSxJQUFoQztRQUFBLElBQUMsQ0FBQSxVQUFELENBQUEsRUFBQTs7TUFFQSxJQUFDLENBQUEsV0FBRDtBQUFlLGdCQUFPLE9BQVA7QUFBQSxlQUNSLFFBRFE7bUJBQ00sSUFBQyxDQUFBLGtCQUFELENBQUE7QUFETixlQUVSLGtCQUZRO21CQUVnQixJQUFDLENBQUEsMkJBQUQsQ0FBQTtBQUZoQixlQUdSLFFBSFE7bUJBR00sSUFBQyxDQUFBLGtCQUFELENBQW9CLFVBQXBCO0FBSE4sZUFJUixRQUpRO21CQUlNLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixVQUFwQjtBQUpOOztNQU1mLElBQU8sT0FBQSxLQUFXLFFBQWxCO1FBQ0UsS0FBSyxDQUFDLGVBQU4sQ0FBc0IsSUFBQyxDQUFBLE1BQXZCLEVBREY7O01BR0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBekIsQ0FBbUMsSUFBQyxDQUFBLElBQUYsR0FBTyxPQUF6QztNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLElBQUMsQ0FBQSxPQUFqQztNQUVBLE9BQW9CLENBQUMsT0FBRCxFQUFVLFVBQVYsQ0FBcEIsRUFBQyxJQUFDLENBQUEsY0FBRixFQUFRLElBQUMsQ0FBQTtNQUVULElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQXpCLENBQWdDLElBQUMsQ0FBQSxJQUFGLEdBQU8sT0FBdEM7TUFDQSxJQUEwQyxvQkFBMUM7UUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUF6QixDQUE2QixJQUFDLENBQUEsT0FBOUIsRUFBQTs7TUFFQSxJQUFHLElBQUMsQ0FBQSxJQUFELEtBQVMsUUFBWjtRQUNFLElBQUMsQ0FBQSxtQkFBRCxDQUFBO1FBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyx1QkFBVixDQUFBLEVBRkY7O01BSUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUEzQixDQUFrQyxJQUFDLENBQUEsSUFBbkMsRUFBeUMsSUFBQyxDQUFBLE9BQTFDO01BQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyx1QkFBVixDQUFBO2FBRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsbUJBQWQsRUFBbUM7UUFBRSxNQUFELElBQUMsQ0FBQSxJQUFGO1FBQVMsU0FBRCxJQUFDLENBQUEsT0FBVDtPQUFuQztJQW5DUTs7MEJBcUNWLFVBQUEsR0FBWSxTQUFBO0FBQ1YsVUFBQTtNQUFBLElBQUEsMENBQW1CLENBQUUsa0JBQXJCO1FBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsc0JBQWQsRUFBc0M7VUFBRSxNQUFELElBQUMsQ0FBQSxJQUFGO1VBQVMsU0FBRCxJQUFDLENBQUEsT0FBVDtTQUF0Qzs7Y0FDWSxDQUFFLE9BQWQsQ0FBQTs7UUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUF6QixDQUFtQyxJQUFDLENBQUEsSUFBRixHQUFPLE9BQXpDO1FBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBekIsQ0FBZ0MsSUFBQyxDQUFBLE9BQWpDO2VBRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMscUJBQWQsRUFBcUM7VUFBRSxNQUFELElBQUMsQ0FBQSxJQUFGO1VBQVMsU0FBRCxJQUFDLENBQUEsT0FBVDtTQUFyQyxFQVBGOztJQURVOzswQkFZWixrQkFBQSxHQUFvQixTQUFBO0FBQ2xCLFVBQUE7TUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBQTs7WUFFd0IsQ0FBRSxlQUExQixDQUEwQyxLQUExQzs7QUFLQTtBQUFBLFdBQUEsc0NBQUE7O1lBQXdDLE1BQU0sQ0FBQyxhQUFQLENBQUE7VUFDdEMsY0FBQSxDQUFlLE1BQWYsRUFBdUI7WUFBQSxrQkFBQSxFQUFvQixJQUFwQjtXQUF2Qjs7QUFERjthQUVBLElBQUk7SUFWYzs7MEJBY3BCLDJCQUFBLEdBQTZCLFNBQUE7YUFDM0IsSUFBSTtJQUR1Qjs7MEJBSzdCLGtCQUFBLEdBQW9CLFNBQUMsT0FBRDtBQUNsQixVQUFBOztRQURtQixVQUFROztNQUMzQixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxlQUF6QixDQUF5QyxJQUF6QztNQUNBLElBQW1ELE9BQUEsS0FBVyxTQUE5RDtRQUFBLHNCQUFBLEdBQXlCLElBQUMsQ0FBQSxtQkFBRCxDQUFBLEVBQXpCOzthQUVJLElBQUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNiLGNBQUE7O1lBQUEsc0JBQXNCLENBQUUsT0FBeEIsQ0FBQTs7VUFDQSxzQkFBQSxHQUF5QjtVQUd6QixnQ0FBQSxHQUFtQyxLQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLENBQUE7QUFDbkM7QUFBQTtlQUFBLHNDQUFBOzt5QkFDRSxjQUFBLENBQWUsTUFBZixFQUF1QjtjQUFDLGtDQUFBLGdDQUFEO2FBQXZCO0FBREY7O1FBTmE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVg7SUFKYzs7MEJBYXBCLG1CQUFBLEdBQXFCLFNBQUE7QUFDbkIsVUFBQTtNQUFBLElBQUMsQ0FBQSx3QkFBRCxHQUE0QixJQUFJO01BQ2hDLElBQUEsR0FBTyxJQUFJO01BQ1gsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQ2hDLGNBQUE7VUFEa0MsaUJBQU07VUFDeEMsTUFBQSxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBLENBQXVCLENBQUMsT0FBeEIsQ0FBZ0MsU0FBQyxTQUFEO0FBQzlCLGdCQUFBO0FBQUE7QUFBQTtpQkFBQSxzQ0FBQTs7Y0FDRSxJQUFHLENBQUMsSUFBQSxLQUFVLElBQVgsQ0FBQSxJQUFxQixDQUFDLENBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxhQUFqQixDQUFBLENBQUwsQ0FBeEI7Z0JBQ0UsU0FBUyxDQUFDLFdBQVYsQ0FBQSxFQURGOztjQUVBLFlBQUEsR0FBZSxTQUFTLENBQUMsT0FBVixDQUFBO2NBQ2YsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckI7Y0FFQSxJQUFBLENBQU8sS0FBQyxDQUFBLHdCQUF3QixDQUFDLEdBQTFCLENBQThCLFNBQTlCLENBQVA7Z0JBQ0UsS0FBQyxDQUFBLHdCQUF3QixDQUFDLEdBQTFCLENBQThCLFNBQTlCLEVBQXlDLEVBQXpDLEVBREY7OzJCQUVBLEtBQUMsQ0FBQSx3QkFBd0IsQ0FBQyxHQUExQixDQUE4QixTQUE5QixDQUF3QyxDQUFDLElBQXpDLENBQThDLFlBQTlDO0FBUkY7O1VBRDhCLENBQWhDO1FBRmdDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QixDQUFUO01BYUEsSUFBSSxDQUFDLEdBQUwsQ0FBYSxJQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3RCLEtBQUMsQ0FBQSx3QkFBRCxHQUE0QjtRQUROO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBQWI7YUFFQTtJQWxCbUI7OzBCQW9CckIsMkJBQUEsR0FBNkIsU0FBQyxTQUFEO0FBQzNCLFVBQUE7aUZBQXdDLENBQUUsR0FBMUMsQ0FBQTtJQUQyQjs7MEJBa0I3QixrQkFBQSxHQUFvQixTQUFDLFVBQUQ7QUFDbEIsVUFBQTtNQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsbUJBQVYsQ0FBOEIsa0JBQTlCLEVBQTJDLHNDQUEzQztBQUVBO0FBQUEsV0FBQSxzQ0FBQTs7WUFBb0QsQ0FBSSxVQUFVLENBQUMsYUFBWCxDQUFBO1VBQ3RELFVBQVUsQ0FBQyxjQUFYLENBQUE7O0FBREY7TUFHQSxLQUFLLENBQUMsU0FBTixDQUFnQixJQUFDLENBQUEsTUFBakI7QUFFQTtBQUFBLFdBQUEsd0NBQUE7O1FBQUEsVUFBVSxDQUFDLFNBQVgsQ0FBcUIsVUFBckI7QUFBQTtNQUVBLElBQXNELFVBQUEsS0FBYyxXQUFwRTtRQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMseUJBQVYsQ0FBQSxDQUFxQyxDQUFDLFVBQXRDLENBQUEsRUFBQTs7YUFFSSxJQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDYixjQUFBO1VBQUEsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsS0FBQyxDQUFBLE1BQWpCO1VBRUEsSUFBRyxLQUFDLENBQUEsT0FBRCxLQUFZLFdBQWY7WUFDRSxLQUFLLENBQUMsZ0JBQU4sQ0FBdUIsS0FBQyxDQUFBLE1BQXhCLEVBQWdDLElBQWhDLEVBREY7O0FBRUE7QUFBQSxlQUFBLHdDQUFBOztZQUFBLFNBQVMsQ0FBQyxLQUFWLENBQWdCO2NBQUEsVUFBQSxFQUFZLEtBQVo7YUFBaEI7QUFBQTtpQkFDQSxLQUFDLENBQUEsbUJBQUQsQ0FBcUIsS0FBckI7UUFOYTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWDtJQVpjOzswQkFzQnBCLHFCQUFBLEdBQXVCLFNBQUE7QUFDckIsVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLEVBQWtCLFdBQWxCLENBQUg7ZUFFRSxtRUFBeUMsQ0FBRSxXQUF2QyxDQUFBLFlBRk47T0FBQSxNQUFBO2VBSUUsQ0FBSSxLQUFBLENBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUFBLENBQU4sQ0FBaUMsQ0FBQyxXQUFsQyxDQUFBLEVBSk47O0lBRHFCOzswQkFPdkIsbUJBQUEsR0FBcUIsU0FBQyxLQUFEOztRQUFDLFFBQU07O2FBQzFCLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLGFBQWhDLGtCQUErQyxRQUFRLElBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQXZEO0lBRG1COzswQkFHckIsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUF6QixDQUFrQyxhQUFsQztJQURVOzs7Ozs7RUFHZCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQTdMakIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0VtaXR0ZXIsIFJhbmdlLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xue21vdmVDdXJzb3JMZWZ0fSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIE1vZGVNYW5hZ2VyXG4gIG1vZGU6ICdpbnNlcnQnICMgTmF0aXZlIGF0b20gaXMgbm90IG1vZGFsIGVkaXRvciBhbmQgaXRzIGRlZmF1bHQgaXMgJ2luc2VydCdcbiAgc3VibW9kZTogbnVsbFxuICByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb246IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG4gICAgQG1vZGUgPSAnaW5zZXJ0J1xuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gIGlzTW9kZTogKG1vZGUsIHN1Ym1vZGU9bnVsbCkgLT5cbiAgICAobW9kZSBpcyBAbW9kZSkgYW5kIChzdWJtb2RlIGlzIEBzdWJtb2RlKVxuXG4gICMgRXZlbnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG9uV2lsbEFjdGl2YXRlTW9kZTogKGZuKSAtPiBAZW1pdHRlci5vbignd2lsbC1hY3RpdmF0ZS1tb2RlJywgZm4pXG4gIG9uRGlkQWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtYWN0aXZhdGUtbW9kZScsIGZuKVxuICBvbldpbGxEZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAZW1pdHRlci5vbignd2lsbC1kZWFjdGl2YXRlLW1vZGUnLCBmbilcbiAgcHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAZW1pdHRlci5wcmVlbXB0KCd3aWxsLWRlYWN0aXZhdGUtbW9kZScsIGZuKVxuICBvbkRpZERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtZGVhY3RpdmF0ZS1tb2RlJywgZm4pXG5cbiAgIyBhY3RpdmF0ZTogUHVibGljXG4gICMgIFVzZSB0aGlzIG1ldGhvZCB0byBjaGFuZ2UgbW9kZSwgRE9OVCB1c2Ugb3RoZXIgZGlyZWN0IG1ldGhvZC5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGFjdGl2YXRlOiAobmV3TW9kZSwgbmV3U3VibW9kZT1udWxsKSAtPlxuICAgICMgQXZvaWQgb2RkIHN0YXRlKD12aXN1YWwtbW9kZSBidXQgc2VsZWN0aW9uIGlzIGVtcHR5KVxuICAgIHJldHVybiBpZiAobmV3TW9kZSBpcyAndmlzdWFsJykgYW5kIEBlZGl0b3IuaXNFbXB0eSgpXG5cbiAgICBAZW1pdHRlci5lbWl0KCd3aWxsLWFjdGl2YXRlLW1vZGUnLCBtb2RlOiBuZXdNb2RlLCBzdWJtb2RlOiBuZXdTdWJtb2RlKVxuXG4gICAgaWYgKG5ld01vZGUgaXMgJ3Zpc3VhbCcpIGFuZCBAc3VibW9kZT8gYW5kIChuZXdTdWJtb2RlIGlzIEBzdWJtb2RlKVxuICAgICAgW25ld01vZGUsIG5ld1N1Ym1vZGVdID0gWydub3JtYWwnLCBudWxsXVxuXG4gICAgQGRlYWN0aXZhdGUoKSBpZiAobmV3TW9kZSBpc250IEBtb2RlKVxuXG4gICAgQGRlYWN0aXZhdG9yID0gc3dpdGNoIG5ld01vZGVcbiAgICAgIHdoZW4gJ25vcm1hbCcgdGhlbiBAYWN0aXZhdGVOb3JtYWxNb2RlKClcbiAgICAgIHdoZW4gJ29wZXJhdG9yLXBlbmRpbmcnIHRoZW4gQGFjdGl2YXRlT3BlcmF0b3JQZW5kaW5nTW9kZSgpXG4gICAgICB3aGVuICdpbnNlcnQnIHRoZW4gQGFjdGl2YXRlSW5zZXJ0TW9kZShuZXdTdWJtb2RlKVxuICAgICAgd2hlbiAndmlzdWFsJyB0aGVuIEBhY3RpdmF0ZVZpc3VhbE1vZGUobmV3U3VibW9kZSlcblxuICAgIHVubGVzcyBuZXdNb2RlIGlzICd2aXN1YWwnXG4gICAgICBzd3JhcC5jbGVhclByb3BlcnRpZXMoQGVkaXRvcilcblxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCIje0Btb2RlfS1tb2RlXCIpXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShAc3VibW9kZSlcblxuICAgIFtAbW9kZSwgQHN1Ym1vZGVdID0gW25ld01vZGUsIG5ld1N1Ym1vZGVdXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiI3tAbW9kZX0tbW9kZVwiKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoQHN1Ym1vZGUpIGlmIEBzdWJtb2RlP1xuXG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEB1cGRhdGVOYXJyb3dlZFN0YXRlKClcbiAgICAgIEB2aW1TdGF0ZS51cGRhdGVQcmV2aW91c1NlbGVjdGlvbigpXG5cbiAgICBAdmltU3RhdGUuc3RhdHVzQmFyTWFuYWdlci51cGRhdGUoQG1vZGUsIEBzdWJtb2RlKVxuICAgIEB2aW1TdGF0ZS51cGRhdGVDdXJzb3JzVmlzaWJpbGl0eSgpXG5cbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtYWN0aXZhdGUtbW9kZScsIHtAbW9kZSwgQHN1Ym1vZGV9KVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgdW5sZXNzIEBkZWFjdGl2YXRvcj8uZGlzcG9zZWRcbiAgICAgIEBlbWl0dGVyLmVtaXQoJ3dpbGwtZGVhY3RpdmF0ZS1tb2RlJywge0Btb2RlLCBAc3VibW9kZX0pXG4gICAgICBAZGVhY3RpdmF0b3I/LmRpc3Bvc2UoKVxuICAgICAgIyBSZW1vdmUgY3NzIGNsYXNzIGhlcmUgaW4tY2FzZSBAZGVhY3RpdmF0ZSgpIGNhbGxlZCBzb2xlbHkob2NjdXJyZW5jZSBpbiB2aXN1YWwtbW9kZSlcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCIje0Btb2RlfS1tb2RlXCIpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKEBzdWJtb2RlKVxuXG4gICAgICBAZW1pdHRlci5lbWl0KCdkaWQtZGVhY3RpdmF0ZS1tb2RlJywge0Btb2RlLCBAc3VibW9kZX0pXG5cbiAgIyBOb3JtYWxcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGFjdGl2YXRlTm9ybWFsTW9kZTogLT5cbiAgICBAdmltU3RhdGUucmVzZXQoKVxuICAgICMgQ29tcG9uZW50IGlzIG5vdCBuZWNlc3NhcnkgYXZhaWFibGUgc2VlICM5OC5cbiAgICBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQ/LnNldElucHV0RW5hYmxlZChmYWxzZSlcblxuICAgICMgSW4gdmlzdWFsLW1vZGUsIGN1cnNvciBjYW4gcGxhY2UgYXQgRU9MLiBtb3ZlIGxlZnQgaWYgY3Vyc29yIGlzIGF0IEVPTFxuICAgICMgV2Ugc2hvdWxkIG5vdCBkbyB0aGlzIGluIHZpc3VhbC1tb2RlIGRlYWN0aXZhdGlvbiBwaGFzZS5cbiAgICAjIGUuZy4gYEFgIGRpcmVjdGx5IHNoaWZ0IGZyb20gdmlzdWEtbW9kZSB0byBgaW5zZXJ0LW1vZGVgLCBhbmQgY3Vyc29yIHNob3VsZCByZW1haW4gYXQgRU9MLlxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKCkgd2hlbiBjdXJzb3IuaXNBdEVuZE9mTGluZSgpXG4gICAgICBtb3ZlQ3Vyc29yTGVmdChjdXJzb3IsIHByZXNlcnZlR29hbENvbHVtbjogdHJ1ZSlcbiAgICBuZXcgRGlzcG9zYWJsZVxuXG4gICMgT3BlcmF0b3IgUGVuZGluZ1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgYWN0aXZhdGVPcGVyYXRvclBlbmRpbmdNb2RlOiAtPlxuICAgIG5ldyBEaXNwb3NhYmxlXG5cbiAgIyBJbnNlcnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGFjdGl2YXRlSW5zZXJ0TW9kZTogKHN1Ym1vZGU9bnVsbCkgLT5cbiAgICBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQuc2V0SW5wdXRFbmFibGVkKHRydWUpXG4gICAgcmVwbGFjZU1vZGVEZWFjdGl2YXRvciA9IEBhY3RpdmF0ZVJlcGxhY2VNb2RlKCkgaWYgc3VibW9kZSBpcyAncmVwbGFjZSdcblxuICAgIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICByZXBsYWNlTW9kZURlYWN0aXZhdG9yPy5kaXNwb3NlKClcbiAgICAgIHJlcGxhY2VNb2RlRGVhY3RpdmF0b3IgPSBudWxsXG5cbiAgICAgICMgV2hlbiBlc2NhcGUgZnJvbSBpbnNlcnQtbW9kZSwgY3Vyc29yIG1vdmUgTGVmdC5cbiAgICAgIG5lZWRTcGVjaWFsQ2FyZVRvUHJldmVudFdyYXBMaW5lID0gQGVkaXRvci5oYXNBdG9taWNTb2Z0VGFicygpXG4gICAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICAgIG1vdmVDdXJzb3JMZWZ0KGN1cnNvciwge25lZWRTcGVjaWFsQ2FyZVRvUHJldmVudFdyYXBMaW5lfSlcblxuICBhY3RpdmF0ZVJlcGxhY2VNb2RlOiAtPlxuICAgIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24gPSBuZXcgV2Vha01hcFxuICAgIHN1YnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHN1YnMuYWRkIEBlZGl0b3Iub25XaWxsSW5zZXJ0VGV4dCAoe3RleHQsIGNhbmNlbH0pID0+XG4gICAgICBjYW5jZWwoKVxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuZm9yRWFjaCAoc2VsZWN0aW9uKSA9PlxuICAgICAgICBmb3IgY2hhciBpbiB0ZXh0LnNwbGl0KCcnKSA/IFtdXG4gICAgICAgICAgaWYgKGNoYXIgaXNudCBcIlxcblwiKSBhbmQgKG5vdCBzZWxlY3Rpb24uY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSlcbiAgICAgICAgICAgIHNlbGVjdGlvbi5zZWxlY3RSaWdodCgpXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0ID0gc2VsZWN0aW9uLmdldFRleHQoKVxuICAgICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KGNoYXIpXG5cbiAgICAgICAgICB1bmxlc3MgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKVxuICAgICAgICAgICAgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBbXSlcbiAgICAgICAgICBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pLnB1c2goc2VsZWN0ZWRUZXh0KVxuXG4gICAgc3Vicy5hZGQgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24gPSBudWxsXG4gICAgc3Vic1xuXG4gIGdldFJlcGxhY2VkQ2hhckZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pPy5wb3AoKVxuXG4gICMgVmlzdWFsXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIFdlIHRyZWF0IGFsbCBzZWxlY3Rpb24gaXMgaW5pdGlhbGx5IE5PVCBub3JtYWxpemVkXG4gICNcbiAgIyAxLiBGaXJzdCB3ZSBub3JtYWxpemUgc2VsZWN0aW9uXG4gICMgMi4gVGhlbiB1cGRhdGUgc2VsZWN0aW9uIG9yaWVudGF0aW9uKD13aXNlKS5cbiAgI1xuICAjIFJlZ2FyZGxlc3Mgb2Ygc2VsZWN0aW9uIGlzIG1vZGlmaWVkIGJ5IHZtcC1jb21tYW5kIG9yIG91dGVyLXZtcC1jb21tYW5kIGxpa2UgYGNtZC1sYC5cbiAgIyBXaGVuIG5vcm1hbGl6ZSwgd2UgbW92ZSBjdXJzb3IgdG8gbGVmdChzZWxlY3RMZWZ0IGVxdWl2YWxlbnQpLlxuICAjIFNpbmNlIFZpbSdzIHZpc3VhbC1tb2RlIGlzIGFsd2F5cyBzZWxlY3RSaWdodGVkLlxuICAjXG4gICMgLSB1bi1ub3JtYWxpemVkIHNlbGVjdGlvbjogVGhpcyBpcyB0aGUgcmFuZ2Ugd2Ugc2VlIGluIHZpc3VhbC1tb2RlLiggU28gbm9ybWFsIHZpc3VhbC1tb2RlIHJhbmdlIGluIHVzZXIgcGVyc3BlY3RpdmUgKS5cbiAgIyAtIG5vcm1hbGl6ZWQgc2VsZWN0aW9uOiBPbmUgY29sdW1uIGxlZnQgc2VsY3RlZCBhdCBzZWxlY3Rpb24gZW5kIHBvc2l0aW9uXG4gICMgLSBXaGVuIHNlbGVjdFJpZ2h0IGF0IGVuZCBwb3NpdGlvbiBvZiBub3JtYWxpemVkLXNlbGVjdGlvbiwgaXQgYmVjb21lIHVuLW5vcm1hbGl6ZWQgc2VsZWN0aW9uXG4gICMgICB3aGljaCBpcyB0aGUgcmFuZ2UgaW4gdmlzdWFsLW1vZGUuXG4gIGFjdGl2YXRlVmlzdWFsTW9kZTogKG5ld1N1Ym1vZGUpIC0+XG4gICAgQHZpbVN0YXRlLmFzc2VydFdpdGhFeGNlcHRpb24obmV3U3VibW9kZT8sIFwiYWN0aXZhdGUgdmlzdWFsLW1vZGUgd2l0aG91dCBzdWJtb2RlXCIpXG5cbiAgICBmb3IgJHNlbGVjdGlvbiBpbiBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpIHdoZW4gbm90ICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG4gICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcblxuICAgIHN3cmFwLm5vcm1hbGl6ZShAZWRpdG9yKVxuXG4gICAgJHNlbGVjdGlvbi5hcHBseVdpc2UobmV3U3VibW9kZSkgZm9yICRzZWxlY3Rpb24gaW4gc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuXG4gICAgQHZpbVN0YXRlLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5hdXRvc2Nyb2xsKCkgaWYgbmV3U3VibW9kZSBpcyAnYmxvY2t3aXNlJ1xuXG4gICAgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIHN3cmFwLm5vcm1hbGl6ZShAZWRpdG9yKVxuXG4gICAgICBpZiBAc3VibW9kZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgICBzd3JhcC5zZXRSZXZlcnNlZFN0YXRlKEBlZGl0b3IsIHRydWUpXG4gICAgICBzZWxlY3Rpb24uY2xlYXIoYXV0b3Njcm9sbDogZmFsc2UpIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIEB1cGRhdGVOYXJyb3dlZFN0YXRlKGZhbHNlKVxuXG4gICMgTmFycm93IHRvIHNlbGVjdGlvblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaGFzTXVsdGlMaW5lU2VsZWN0aW9uOiAtPlxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgIyBbRklYTUVdIHdoeSBJIG5lZWQgbnVsbCBndWFyZCBoZXJlXG4gICAgICBub3QgQHZpbVN0YXRlLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKT8uaXNTaW5nbGVSb3coKVxuICAgIGVsc2VcbiAgICAgIG5vdCBzd3JhcChAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSkuaXNTaW5nbGVSb3coKVxuXG4gIHVwZGF0ZU5hcnJvd2VkU3RhdGU6ICh2YWx1ZT1udWxsKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2lzLW5hcnJvd2VkJywgdmFsdWUgPyBAaGFzTXVsdGlMaW5lU2VsZWN0aW9uKCkpXG5cbiAgaXNOYXJyb3dlZDogLT5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLW5hcnJvd2VkJylcblxubW9kdWxlLmV4cG9ydHMgPSBNb2RlTWFuYWdlclxuIl19
