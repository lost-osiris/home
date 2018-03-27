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
      this.editorElement.classList.remove(this.mode + "-mode");
      this.editorElement.classList.remove(this.submode);
      ref2 = [newMode, newSubmode], this.mode = ref2[0], this.submode = ref2[1];
      if (this.mode === 'visual') {
        this.updateNarrowedState();
        this.vimState.updatePreviousSelection();
      } else {
        swrap.clearProperties(this.editor);
      }
      this.editorElement.classList.add(this.mode + "-mode");
      if (this.submode != null) {
        this.editorElement.classList.add(this.submode);
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

    ModeManager.prototype.activateVisualMode = function(submode) {
      var $selection, i, j, len, len1, ref1, ref2;
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
        $selection.applyWise(submode);
      }
      if (submode === 'blockwise') {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vZGUtbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBb0QsT0FBQSxDQUFRLE1BQVIsQ0FBcEQsRUFBQyxxQkFBRCxFQUFVLGlCQUFWLEVBQWlCLDZDQUFqQixFQUFzQzs7RUFDdEMsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBQ1AsaUJBQWtCLE9BQUEsQ0FBUSxTQUFSOztFQUViOzBCQUNKLElBQUEsR0FBTTs7MEJBQ04sT0FBQSxHQUFTOzswQkFDVCx3QkFBQSxHQUEwQjs7SUFFYixxQkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQTtNQUNYLElBQUMsQ0FBQSxJQUFELEdBQVE7TUFDUixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QixDQUFuQjtJQUxXOzswQkFPYixPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO0lBRE87OzBCQUdULE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxPQUFQOztRQUFPLFVBQVE7O2FBQ3JCLENBQUMsSUFBQSxLQUFRLElBQUMsQ0FBQSxJQUFWLENBQUEsSUFBb0IsQ0FB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LE9BQUQsS0FBWSxXQUFmO1lBQ0UsS0FBSyxDQUFDLGdCQUFOLENBQXVCLEtBQUMsQ0FBQSxNQUF4QixFQUFnQyxJQUFoQyxFQURGOztBQUVBO0FBQUEsZUFBQSx3Q0FBQTs7WUFBQSxTQUFTLENBQUMsS0FBVixDQUFnQjtjQUFBLFVBQUEsRUFBWSxLQUFaO2FBQWhCO0FBQUE7aUJBQ0EsS0FBQyxDQUFBLG1CQUFELENBQXFCLEtBQXJCO1FBTmE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVg7SUFWYzs7MEJBb0JwQixxQkFBQSxHQUF1QixTQUFBO0FBQ3JCLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixFQUFrQixXQUFsQixDQUFIO2VBRUUsbUVBQXlDLENBQUUsV0FBdkMsQ0FBQSxZQUZOO09BQUEsTUFBQTtlQUlFLENBQUksS0FBQSxDQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBQSxDQUFOLENBQWlDLENBQUMsV0FBbEMsQ0FBQSxFQUpOOztJQURxQjs7MEJBT3ZCLG1CQUFBLEdBQXFCLFNBQUMsS0FBRDs7UUFBQyxRQUFNOzthQUMxQixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUF6QixDQUFnQyxhQUFoQyxrQkFBK0MsUUFBUSxJQUFDLENBQUEscUJBQUQsQ0FBQSxDQUF2RDtJQURtQjs7MEJBR3JCLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBekIsQ0FBa0MsYUFBbEM7SUFEVTs7Ozs7O0VBR2QsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUExTGpCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntFbWl0dGVyLCBSYW5nZSwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcbnttb3ZlQ3Vyc29yTGVmdH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5jbGFzcyBNb2RlTWFuYWdlclxuICBtb2RlOiAnaW5zZXJ0JyAjIE5hdGl2ZSBhdG9tIGlzIG5vdCBtb2RhbCBlZGl0b3IgYW5kIGl0cyBkZWZhdWx0IGlzICdpbnNlcnQnXG4gIHN1Ym1vZGU6IG51bGxcbiAgcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uOiBudWxsXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuICAgIEBtb2RlID0gJ2luc2VydCdcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICBpc01vZGU6IChtb2RlLCBzdWJtb2RlPW51bGwpIC0+XG4gICAgKG1vZGUgaXMgQG1vZGUpIGFuZCAoc3VibW9kZSBpcyBAc3VibW9kZSlcblxuICAjIEV2ZW50XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvbldpbGxBY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ3dpbGwtYWN0aXZhdGUtbW9kZScsIGZuKVxuICBvbkRpZEFjdGl2YXRlTW9kZTogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWFjdGl2YXRlLW1vZGUnLCBmbilcbiAgb25XaWxsRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ3dpbGwtZGVhY3RpdmF0ZS1tb2RlJywgZm4pXG4gIHByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIucHJlZW1wdCgnd2lsbC1kZWFjdGl2YXRlLW1vZGUnLCBmbilcbiAgb25EaWREZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWRlYWN0aXZhdGUtbW9kZScsIGZuKVxuXG4gICMgYWN0aXZhdGU6IFB1YmxpY1xuICAjICBVc2UgdGhpcyBtZXRob2QgdG8gY2hhbmdlIG1vZGUsIERPTlQgdXNlIG90aGVyIGRpcmVjdCBtZXRob2QuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBhY3RpdmF0ZTogKG5ld01vZGUsIG5ld1N1Ym1vZGU9bnVsbCkgLT5cbiAgICAjIEF2b2lkIG9kZCBzdGF0ZSg9dmlzdWFsLW1vZGUgYnV0IHNlbGVjdGlvbiBpcyBlbXB0eSlcbiAgICByZXR1cm4gaWYgKG5ld01vZGUgaXMgJ3Zpc3VhbCcpIGFuZCBAZWRpdG9yLmlzRW1wdHkoKVxuXG4gICAgQGVtaXR0ZXIuZW1pdCgnd2lsbC1hY3RpdmF0ZS1tb2RlJywgbW9kZTogbmV3TW9kZSwgc3VibW9kZTogbmV3U3VibW9kZSlcblxuICAgIGlmIChuZXdNb2RlIGlzICd2aXN1YWwnKSBhbmQgQHN1Ym1vZGU/IGFuZCAobmV3U3VibW9kZSBpcyBAc3VibW9kZSlcbiAgICAgIFtuZXdNb2RlLCBuZXdTdWJtb2RlXSA9IFsnbm9ybWFsJywgbnVsbF1cblxuICAgIEBkZWFjdGl2YXRlKCkgaWYgKG5ld01vZGUgaXNudCBAbW9kZSlcblxuICAgIEBkZWFjdGl2YXRvciA9IHN3aXRjaCBuZXdNb2RlXG4gICAgICB3aGVuICdub3JtYWwnIHRoZW4gQGFjdGl2YXRlTm9ybWFsTW9kZSgpXG4gICAgICB3aGVuICdvcGVyYXRvci1wZW5kaW5nJyB0aGVuIEBhY3RpdmF0ZU9wZXJhdG9yUGVuZGluZ01vZGUoKVxuICAgICAgd2hlbiAnaW5zZXJ0JyB0aGVuIEBhY3RpdmF0ZUluc2VydE1vZGUobmV3U3VibW9kZSlcbiAgICAgIHdoZW4gJ3Zpc3VhbCcgdGhlbiBAYWN0aXZhdGVWaXN1YWxNb2RlKG5ld1N1Ym1vZGUpXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiI3tAbW9kZX0tbW9kZVwiKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQHN1Ym1vZGUpXG5cbiAgICBbQG1vZGUsIEBzdWJtb2RlXSA9IFtuZXdNb2RlLCBuZXdTdWJtb2RlXVxuXG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEB1cGRhdGVOYXJyb3dlZFN0YXRlKClcbiAgICAgIEB2aW1TdGF0ZS51cGRhdGVQcmV2aW91c1NlbGVjdGlvbigpXG4gICAgZWxzZVxuICAgICAgc3dyYXAuY2xlYXJQcm9wZXJ0aWVzKEBlZGl0b3IpXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiI3tAbW9kZX0tbW9kZVwiKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoQHN1Ym1vZGUpIGlmIEBzdWJtb2RlP1xuXG4gICAgQHZpbVN0YXRlLnN0YXR1c0Jhck1hbmFnZXIudXBkYXRlKEBtb2RlLCBAc3VibW9kZSlcbiAgICBAdmltU3RhdGUudXBkYXRlQ3Vyc29yc1Zpc2liaWxpdHkoKVxuXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWFjdGl2YXRlLW1vZGUnLCB7QG1vZGUsIEBzdWJtb2RlfSlcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIHVubGVzcyBAZGVhY3RpdmF0b3I/LmRpc3Bvc2VkXG4gICAgICBAZW1pdHRlci5lbWl0KCd3aWxsLWRlYWN0aXZhdGUtbW9kZScsIHtAbW9kZSwgQHN1Ym1vZGV9KVxuICAgICAgQGRlYWN0aXZhdG9yPy5kaXNwb3NlKClcbiAgICAgICMgUmVtb3ZlIGNzcyBjbGFzcyBoZXJlIGluLWNhc2UgQGRlYWN0aXZhdGUoKSBjYWxsZWQgc29sZWx5KG9jY3VycmVuY2UgaW4gdmlzdWFsLW1vZGUpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiI3tAbW9kZX0tbW9kZVwiKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShAc3VibW9kZSlcblxuICAgICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWRlYWN0aXZhdGUtbW9kZScsIHtAbW9kZSwgQHN1Ym1vZGV9KVxuXG4gICMgTm9ybWFsXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBhY3RpdmF0ZU5vcm1hbE1vZGU6IC0+XG4gICAgQHZpbVN0YXRlLnJlc2V0KClcbiAgICAjIENvbXBvbmVudCBpcyBub3QgbmVjZXNzYXJ5IGF2YWlhYmxlIHNlZSAjOTguXG4gICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50Py5zZXRJbnB1dEVuYWJsZWQoZmFsc2UpXG5cbiAgICAjIEluIHZpc3VhbC1tb2RlLCBjdXJzb3IgY2FuIHBsYWNlIGF0IEVPTC4gbW92ZSBsZWZ0IGlmIGN1cnNvciBpcyBhdCBFT0xcbiAgICAjIFdlIHNob3VsZCBub3QgZG8gdGhpcyBpbiB2aXN1YWwtbW9kZSBkZWFjdGl2YXRpb24gcGhhc2UuXG4gICAgIyBlLmcuIGBBYCBkaXJlY3RseSBzaGlmdCBmcm9tIHZpc3VhLW1vZGUgdG8gYGluc2VydC1tb2RlYCwgYW5kIGN1cnNvciBzaG91bGQgcmVtYWluIGF0IEVPTC5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpIHdoZW4gY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuICAgICAgbW92ZUN1cnNvckxlZnQoY3Vyc29yLCBwcmVzZXJ2ZUdvYWxDb2x1bW46IHRydWUpXG4gICAgbmV3IERpc3Bvc2FibGVcblxuICAjIE9wZXJhdG9yIFBlbmRpbmdcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGFjdGl2YXRlT3BlcmF0b3JQZW5kaW5nTW9kZTogLT5cbiAgICBuZXcgRGlzcG9zYWJsZVxuXG4gICMgSW5zZXJ0XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBhY3RpdmF0ZUluc2VydE1vZGU6IChzdWJtb2RlPW51bGwpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnNldElucHV0RW5hYmxlZCh0cnVlKVxuICAgIHJlcGxhY2VNb2RlRGVhY3RpdmF0b3IgPSBAYWN0aXZhdGVSZXBsYWNlTW9kZSgpIGlmIHN1Ym1vZGUgaXMgJ3JlcGxhY2UnXG5cbiAgICBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgcmVwbGFjZU1vZGVEZWFjdGl2YXRvcj8uZGlzcG9zZSgpXG4gICAgICByZXBsYWNlTW9kZURlYWN0aXZhdG9yID0gbnVsbFxuXG4gICAgICAjIFdoZW4gZXNjYXBlIGZyb20gaW5zZXJ0LW1vZGUsIGN1cnNvciBtb3ZlIExlZnQuXG4gICAgICBuZWVkU3BlY2lhbENhcmVUb1ByZXZlbnRXcmFwTGluZSA9IEBlZGl0b3IuaGFzQXRvbWljU29mdFRhYnMoKVxuICAgICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgICBtb3ZlQ3Vyc29yTGVmdChjdXJzb3IsIHtuZWVkU3BlY2lhbENhcmVUb1ByZXZlbnRXcmFwTGluZX0pXG5cbiAgYWN0aXZhdGVSZXBsYWNlTW9kZTogLT5cbiAgICBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uID0gbmV3IFdlYWtNYXBcbiAgICBzdWJzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBzdWJzLmFkZCBAZWRpdG9yLm9uV2lsbEluc2VydFRleHQgKHt0ZXh0LCBjYW5jZWx9KSA9PlxuICAgICAgY2FuY2VsKClcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLmZvckVhY2ggKHNlbGVjdGlvbikgPT5cbiAgICAgICAgZm9yIGNoYXIgaW4gdGV4dC5zcGxpdCgnJykgPyBbXVxuICAgICAgICAgIGlmIChjaGFyIGlzbnQgXCJcXG5cIikgYW5kIChub3Qgc2VsZWN0aW9uLmN1cnNvci5pc0F0RW5kT2ZMaW5lKCkpXG4gICAgICAgICAgICBzZWxlY3Rpb24uc2VsZWN0UmlnaHQoKVxuICAgICAgICAgIHNlbGVjdGVkVGV4dCA9IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChjaGFyKVxuXG4gICAgICAgICAgdW5sZXNzIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgICAgICAgIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgW10pXG4gICAgICAgICAgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKS5wdXNoKHNlbGVjdGVkVGV4dClcblxuICAgIHN1YnMuYWRkIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uID0gbnVsbFxuICAgIHN1YnNcblxuICBnZXRSZXBsYWNlZENoYXJGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKT8ucG9wKClcblxuICAjIFZpc3VhbFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBXZSB0cmVhdCBhbGwgc2VsZWN0aW9uIGlzIGluaXRpYWxseSBOT1Qgbm9ybWFsaXplZFxuICAjXG4gICMgMS4gRmlyc3Qgd2Ugbm9ybWFsaXplIHNlbGVjdGlvblxuICAjIDIuIFRoZW4gdXBkYXRlIHNlbGVjdGlvbiBvcmllbnRhdGlvbig9d2lzZSkuXG4gICNcbiAgIyBSZWdhcmRsZXNzIG9mIHNlbGVjdGlvbiBpcyBtb2RpZmllZCBieSB2bXAtY29tbWFuZCBvciBvdXRlci12bXAtY29tbWFuZCBsaWtlIGBjbWQtbGAuXG4gICMgV2hlbiBub3JtYWxpemUsIHdlIG1vdmUgY3Vyc29yIHRvIGxlZnQoc2VsZWN0TGVmdCBlcXVpdmFsZW50KS5cbiAgIyBTaW5jZSBWaW0ncyB2aXN1YWwtbW9kZSBpcyBhbHdheXMgc2VsZWN0UmlnaHRlZC5cbiAgI1xuICAjIC0gdW4tbm9ybWFsaXplZCBzZWxlY3Rpb246IFRoaXMgaXMgdGhlIHJhbmdlIHdlIHNlZSBpbiB2aXN1YWwtbW9kZS4oIFNvIG5vcm1hbCB2aXN1YWwtbW9kZSByYW5nZSBpbiB1c2VyIHBlcnNwZWN0aXZlICkuXG4gICMgLSBub3JtYWxpemVkIHNlbGVjdGlvbjogT25lIGNvbHVtbiBsZWZ0IHNlbGN0ZWQgYXQgc2VsZWN0aW9uIGVuZCBwb3NpdGlvblxuICAjIC0gV2hlbiBzZWxlY3RSaWdodCBhdCBlbmQgcG9zaXRpb24gb2Ygbm9ybWFsaXplZC1zZWxlY3Rpb24sIGl0IGJlY29tZSB1bi1ub3JtYWxpemVkIHNlbGVjdGlvblxuICAjICAgd2hpY2ggaXMgdGhlIHJhbmdlIGluIHZpc3VhbC1tb2RlLlxuICBhY3RpdmF0ZVZpc3VhbE1vZGU6IChzdWJtb2RlKSAtPlxuICAgIGZvciAkc2VsZWN0aW9uIGluIHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcikgd2hlbiBub3QgJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKClcbiAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuXG4gICAgc3dyYXAubm9ybWFsaXplKEBlZGl0b3IpXG5cbiAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZShzdWJtb2RlKSBmb3IgJHNlbGVjdGlvbiBpbiBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpXG5cbiAgICBAdmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKSBpZiBzdWJtb2RlIGlzICdibG9ja3dpc2UnXG5cbiAgICBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgc3dyYXAubm9ybWFsaXplKEBlZGl0b3IpXG5cbiAgICAgIGlmIEBzdWJtb2RlIGlzICdibG9ja3dpc2UnXG4gICAgICAgIHN3cmFwLnNldFJldmVyc2VkU3RhdGUoQGVkaXRvciwgdHJ1ZSlcbiAgICAgIHNlbGVjdGlvbi5jbGVhcihhdXRvc2Nyb2xsOiBmYWxzZSkgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgQHVwZGF0ZU5hcnJvd2VkU3RhdGUoZmFsc2UpXG5cbiAgIyBOYXJyb3cgdG8gc2VsZWN0aW9uXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoYXNNdWx0aUxpbmVTZWxlY3Rpb246IC0+XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICAjIFtGSVhNRV0gd2h5IEkgbmVlZCBudWxsIGd1YXJkIGhlcmVcbiAgICAgIG5vdCBAdmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpPy5pc1NpbmdsZVJvdygpXG4gICAgZWxzZVxuICAgICAgbm90IHN3cmFwKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKS5pc1NpbmdsZVJvdygpXG5cbiAgdXBkYXRlTmFycm93ZWRTdGF0ZTogKHZhbHVlPW51bGwpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtbmFycm93ZWQnLCB2YWx1ZSA/IEBoYXNNdWx0aUxpbmVTZWxlY3Rpb24oKSlcblxuICBpc05hcnJvd2VkOiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnaXMtbmFycm93ZWQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVNYW5hZ2VyXG4iXX0=
