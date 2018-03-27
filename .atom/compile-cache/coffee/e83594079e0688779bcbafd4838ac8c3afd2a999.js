(function() {
  var CompositeDisposable, Disposable, Emitter, ModeManager, Range, moveCursorLeft, ref;

  ref = require('atom'), Emitter = ref.Emitter, Range = ref.Range, CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable;

  moveCursorLeft = null;

  ModeManager = (function() {
    ModeManager.prototype.mode = 'insert';

    ModeManager.prototype.submode = null;

    ModeManager.prototype.replacedCharsBySelection = null;

    function ModeManager(vimState) {
      var ref1;
      this.vimState = vimState;
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
      this.emitter = new Emitter;
      this.vimState.onDidDestroy(this.destroy.bind(this));
    }

    ModeManager.prototype.destroy = function() {};

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
      var ref1, ref2, ref3, ref4;
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
        if ((ref3 = this.vimState.getProp('swrap')) != null) {
          ref3.clearProperties(this.editor);
        }
      }
      this.editorElement.classList.add(this.mode + "-mode");
      if (this.submode != null) {
        this.editorElement.classList.add(this.submode);
      }
      this.vimState.statusBarManager.update(this.mode, this.submode);
      if (this.mode === 'visual') {
        this.vimState.cursorStyleManager.refresh();
      } else {
        if ((ref4 = this.vimState.getProp('cursorStyleManager')) != null) {
          ref4.refresh();
        }
      }
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
      var cursor, goalColumn, i, len, ref1, ref2;
      this.vimState.reset();
      if ((ref1 = this.editorElement.component) != null) {
        ref1.setInputEnabled(false);
      }
      ref2 = this.editor.getCursors();
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        if (!(cursor.isAtEndOfLine() && !cursor.isAtBeginningOfLine())) {
          continue;
        }
        goalColumn = cursor.goalColumn;
        cursor.moveLeft();
        if (goalColumn != null) {
          cursor.goalColumn = goalColumn;
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
          if (moveCursorLeft == null) {
            moveCursorLeft = require('./utils').moveCursorLeft;
          }
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
      var $selection, i, j, len, len1, ref1, ref2, swrap;
      swrap = this.vimState.swrap;
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
        return !this.vimState.swrap(this.editor.getLastSelection()).isSingleRow();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vZGUtbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQW9ELE9BQUEsQ0FBUSxNQUFSLENBQXBELEVBQUMscUJBQUQsRUFBVSxpQkFBVixFQUFpQiw2Q0FBakIsRUFBc0M7O0VBQ3RDLGNBQUEsR0FBaUI7O0VBRVg7MEJBQ0osSUFBQSxHQUFNOzswQkFDTixPQUFBLEdBQVM7OzBCQUNULHdCQUFBLEdBQTBCOztJQUViLHFCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBO01BRVgsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BQ2YsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkI7SUFKVzs7MEJBTWIsT0FBQSxHQUFTLFNBQUEsR0FBQTs7MEJBRVQsTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLE9BQVA7O1FBQU8sVUFBUTs7YUFDckIsQ0FBQyxJQUFBLEtBQVEsSUFBQyxDQUFBLElBQVYsQ0FBQSxJQUFvQixDQUFDLE9BQUEsS0FBVyxJQUFDLENBQUEsT0FBYjtJQURkOzswQkFLUixrQkFBQSxHQUFvQixTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxvQkFBWixFQUFrQyxFQUFsQztJQUFSOzswQkFDcEIsaUJBQUEsR0FBbUIsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksbUJBQVosRUFBaUMsRUFBakM7SUFBUjs7MEJBQ25CLG9CQUFBLEdBQXNCLFNBQUMsRUFB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QSxPQUFELEtBQVksV0FBZjtZQUNFLEtBQUssQ0FBQyxnQkFBTixDQUF1QixLQUFDLENBQUEsTUFBeEIsRUFBZ0MsSUFBaEMsRUFERjs7QUFFQTtBQUFBLGVBQUEsd0NBQUE7O1lBQUEsU0FBUyxDQUFDLEtBQVYsQ0FBZ0I7Y0FBQSxVQUFBLEVBQVksS0FBWjthQUFoQjtBQUFBO2lCQUNBLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixLQUFyQjtRQU5hO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYO0lBWGM7OzBCQXFCcEIscUJBQUEsR0FBdUIsU0FBQTtBQUNyQixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsTUFBRCxDQUFRLFFBQVIsRUFBa0IsV0FBbEIsQ0FBSDtlQUVFLG1FQUF5QyxDQUFFLFdBQXZDLENBQUEsWUFGTjtPQUFBLE1BQUE7ZUFJRSxDQUFJLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUEsQ0FBaEIsQ0FBMkMsQ0FBQyxXQUE1QyxDQUFBLEVBSk47O0lBRHFCOzswQkFPdkIsbUJBQUEsR0FBcUIsU0FBQyxLQUFEOztRQUFDLFFBQU07O2FBQzFCLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLGFBQWhDLGtCQUErQyxRQUFRLElBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQXZEO0lBRG1COzswQkFHckIsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUF6QixDQUFrQyxhQUFsQztJQURVOzs7Ozs7RUFHZCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQS9MakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RW1pdHRlciwgUmFuZ2UsIENvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbm1vdmVDdXJzb3JMZWZ0ID0gbnVsbFxuXG5jbGFzcyBNb2RlTWFuYWdlclxuICBtb2RlOiAnaW5zZXJ0JyAjIE5hdGl2ZSBhdG9tIGlzIG5vdCBtb2RhbCBlZGl0b3IgYW5kIGl0cyBkZWZhdWx0IGlzICdpbnNlcnQnXG4gIHN1Ym1vZGU6IG51bGxcbiAgcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uOiBudWxsXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcblxuICBkZXN0cm95OiAtPlxuXG4gIGlzTW9kZTogKG1vZGUsIHN1Ym1vZGU9bnVsbCkgLT5cbiAgICAobW9kZSBpcyBAbW9kZSkgYW5kIChzdWJtb2RlIGlzIEBzdWJtb2RlKVxuXG4gICMgRXZlbnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG9uV2lsbEFjdGl2YXRlTW9kZTogKGZuKSAtPiBAZW1pdHRlci5vbignd2lsbC1hY3RpdmF0ZS1tb2RlJywgZm4pXG4gIG9uRGlkQWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtYWN0aXZhdGUtbW9kZScsIGZuKVxuICBvbldpbGxEZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAZW1pdHRlci5vbignd2lsbC1kZWFjdGl2YXRlLW1vZGUnLCBmbilcbiAgcHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAZW1pdHRlci5wcmVlbXB0KCd3aWxsLWRlYWN0aXZhdGUtbW9kZScsIGZuKVxuICBvbkRpZERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtZGVhY3RpdmF0ZS1tb2RlJywgZm4pXG5cbiAgIyBhY3RpdmF0ZTogUHVibGljXG4gICMgIFVzZSB0aGlzIG1ldGhvZCB0byBjaGFuZ2UgbW9kZSwgRE9OVCB1c2Ugb3RoZXIgZGlyZWN0IG1ldGhvZC5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGFjdGl2YXRlOiAobmV3TW9kZSwgbmV3U3VibW9kZT1udWxsKSAtPlxuICAgICMgQXZvaWQgb2RkIHN0YXRlKD12aXN1YWwtbW9kZSBidXQgc2VsZWN0aW9uIGlzIGVtcHR5KVxuICAgIHJldHVybiBpZiAobmV3TW9kZSBpcyAndmlzdWFsJykgYW5kIEBlZGl0b3IuaXNFbXB0eSgpXG5cbiAgICBAZW1pdHRlci5lbWl0KCd3aWxsLWFjdGl2YXRlLW1vZGUnLCBtb2RlOiBuZXdNb2RlLCBzdWJtb2RlOiBuZXdTdWJtb2RlKVxuXG4gICAgaWYgKG5ld01vZGUgaXMgJ3Zpc3VhbCcpIGFuZCBAc3VibW9kZT8gYW5kIChuZXdTdWJtb2RlIGlzIEBzdWJtb2RlKVxuICAgICAgW25ld01vZGUsIG5ld1N1Ym1vZGVdID0gWydub3JtYWwnLCBudWxsXVxuXG4gICAgQGRlYWN0aXZhdGUoKSBpZiAobmV3TW9kZSBpc250IEBtb2RlKVxuXG4gICAgQGRlYWN0aXZhdG9yID0gc3dpdGNoIG5ld01vZGVcbiAgICAgIHdoZW4gJ25vcm1hbCcgdGhlbiBAYWN0aXZhdGVOb3JtYWxNb2RlKClcbiAgICAgIHdoZW4gJ29wZXJhdG9yLXBlbmRpbmcnIHRoZW4gQGFjdGl2YXRlT3BlcmF0b3JQZW5kaW5nTW9kZSgpXG4gICAgICB3aGVuICdpbnNlcnQnIHRoZW4gQGFjdGl2YXRlSW5zZXJ0TW9kZShuZXdTdWJtb2RlKVxuICAgICAgd2hlbiAndmlzdWFsJyB0aGVuIEBhY3RpdmF0ZVZpc3VhbE1vZGUobmV3U3VibW9kZSlcblxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCIje0Btb2RlfS1tb2RlXCIpXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShAc3VibW9kZSlcblxuICAgIFtAbW9kZSwgQHN1Ym1vZGVdID0gW25ld01vZGUsIG5ld1N1Ym1vZGVdXG5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQHVwZGF0ZU5hcnJvd2VkU3RhdGUoKVxuICAgICAgQHZpbVN0YXRlLnVwZGF0ZVByZXZpb3VzU2VsZWN0aW9uKClcbiAgICBlbHNlXG4gICAgICAjIFByZXZlbnQgc3dyYXAgZnJvbSBsb2FkZWQgb24gaW5pdGlhbCBtb2RlLXNldHVwIG9uIHN0YXJ0dXAuXG4gICAgICBAdmltU3RhdGUuZ2V0UHJvcCgnc3dyYXAnKT8uY2xlYXJQcm9wZXJ0aWVzKEBlZGl0b3IpXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiI3tAbW9kZX0tbW9kZVwiKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoQHN1Ym1vZGUpIGlmIEBzdWJtb2RlP1xuXG4gICAgQHZpbVN0YXRlLnN0YXR1c0Jhck1hbmFnZXIudXBkYXRlKEBtb2RlLCBAc3VibW9kZSlcbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQHZpbVN0YXRlLmN1cnNvclN0eWxlTWFuYWdlci5yZWZyZXNoKClcbiAgICBlbHNlXG4gICAgICBAdmltU3RhdGUuZ2V0UHJvcCgnY3Vyc29yU3R5bGVNYW5hZ2VyJyk/LnJlZnJlc2goKVxuXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWFjdGl2YXRlLW1vZGUnLCB7QG1vZGUsIEBzdWJtb2RlfSlcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIHVubGVzcyBAZGVhY3RpdmF0b3I/LmRpc3Bvc2VkXG4gICAgICBAZW1pdHRlci5lbWl0KCd3aWxsLWRlYWN0aXZhdGUtbW9kZScsIHtAbW9kZSwgQHN1Ym1vZGV9KVxuICAgICAgQGRlYWN0aXZhdG9yPy5kaXNwb3NlKClcbiAgICAgICMgUmVtb3ZlIGNzcyBjbGFzcyBoZXJlIGluLWNhc2UgQGRlYWN0aXZhdGUoKSBjYWxsZWQgc29sZWx5KG9jY3VycmVuY2UgaW4gdmlzdWFsLW1vZGUpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiI3tAbW9kZX0tbW9kZVwiKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShAc3VibW9kZSlcblxuICAgICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWRlYWN0aXZhdGUtbW9kZScsIHtAbW9kZSwgQHN1Ym1vZGV9KVxuXG4gICMgTm9ybWFsXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBhY3RpdmF0ZU5vcm1hbE1vZGU6IC0+XG4gICAgQHZpbVN0YXRlLnJlc2V0KClcbiAgICAjIENvbXBvbmVudCBpcyBub3QgbmVjZXNzYXJ5IGF2YWlhYmxlIHNlZSAjOTguXG4gICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50Py5zZXRJbnB1dEVuYWJsZWQoZmFsc2UpXG5cbiAgICAjIEluIHZpc3VhbC1tb2RlLCBjdXJzb3IgY2FuIHBsYWNlIGF0IEVPTC4gbW92ZSBsZWZ0IGlmIGN1cnNvciBpcyBhdCBFT0xcbiAgICAjIFdlIHNob3VsZCBub3QgZG8gdGhpcyBpbiB2aXN1YWwtbW9kZSBkZWFjdGl2YXRpb24gcGhhc2UuXG4gICAgIyBlLmcuIGBBYCBkaXJlY3RseSBzaGlmdCBmcm9tIHZpc3VhLW1vZGUgdG8gYGluc2VydC1tb2RlYCwgYW5kIGN1cnNvciBzaG91bGQgcmVtYWluIGF0IEVPTC5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpIHdoZW4gY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSBhbmQgbm90IGN1cnNvci5pc0F0QmVnaW5uaW5nT2ZMaW5lKClcbiAgICAgICMgRG9uJ3QgdXNlIHV0aWxzIG1vdmVDdXJzb3JMZWZ0IHRvIHNraXAgcmVxdWlyZSgnLi91dGlscycpIGZvciBmYXN0ZXIgc3RhcnR1cC5cbiAgICAgIHtnb2FsQ29sdW1ufSA9IGN1cnNvclxuICAgICAgY3Vyc29yLm1vdmVMZWZ0KClcbiAgICAgIGN1cnNvci5nb2FsQ29sdW1uID0gZ29hbENvbHVtbiBpZiBnb2FsQ29sdW1uP1xuICAgIG5ldyBEaXNwb3NhYmxlXG5cbiAgIyBPcGVyYXRvciBQZW5kaW5nXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBhY3RpdmF0ZU9wZXJhdG9yUGVuZGluZ01vZGU6IC0+XG4gICAgbmV3IERpc3Bvc2FibGVcblxuICAjIEluc2VydFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgYWN0aXZhdGVJbnNlcnRNb2RlOiAoc3VibW9kZT1udWxsKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5zZXRJbnB1dEVuYWJsZWQodHJ1ZSlcbiAgICByZXBsYWNlTW9kZURlYWN0aXZhdG9yID0gQGFjdGl2YXRlUmVwbGFjZU1vZGUoKSBpZiBzdWJtb2RlIGlzICdyZXBsYWNlJ1xuXG4gICAgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIG1vdmVDdXJzb3JMZWZ0ID89IHJlcXVpcmUoJy4vdXRpbHMnKS5tb3ZlQ3Vyc29yTGVmdFxuXG4gICAgICByZXBsYWNlTW9kZURlYWN0aXZhdG9yPy5kaXNwb3NlKClcbiAgICAgIHJlcGxhY2VNb2RlRGVhY3RpdmF0b3IgPSBudWxsXG5cbiAgICAgICMgV2hlbiBlc2NhcGUgZnJvbSBpbnNlcnQtbW9kZSwgY3Vyc29yIG1vdmUgTGVmdC5cbiAgICAgIG5lZWRTcGVjaWFsQ2FyZVRvUHJldmVudFdyYXBMaW5lID0gQGVkaXRvci5oYXNBdG9taWNTb2Z0VGFicygpXG4gICAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICAgIG1vdmVDdXJzb3JMZWZ0KGN1cnNvciwge25lZWRTcGVjaWFsQ2FyZVRvUHJldmVudFdyYXBMaW5lfSlcblxuICBhY3RpdmF0ZVJlcGxhY2VNb2RlOiAtPlxuICAgIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24gPSBuZXcgV2Vha01hcFxuICAgIHN1YnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHN1YnMuYWRkIEBlZGl0b3Iub25XaWxsSW5zZXJ0VGV4dCAoe3RleHQsIGNhbmNlbH0pID0+XG4gICAgICBjYW5jZWwoKVxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuZm9yRWFjaCAoc2VsZWN0aW9uKSA9PlxuICAgICAgICBmb3IgY2hhciBpbiB0ZXh0LnNwbGl0KCcnKSA/IFtdXG4gICAgICAgICAgaWYgKGNoYXIgaXNudCBcIlxcblwiKSBhbmQgKG5vdCBzZWxlY3Rpb24uY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSlcbiAgICAgICAgICAgIHNlbGVjdGlvbi5zZWxlY3RSaWdodCgpXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0ID0gc2VsZWN0aW9uLmdldFRleHQoKVxuICAgICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KGNoYXIpXG5cbiAgICAgICAgICB1bmxlc3MgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKVxuICAgICAgICAgICAgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBbXSlcbiAgICAgICAgICBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pLnB1c2goc2VsZWN0ZWRUZXh0KVxuXG4gICAgc3Vicy5hZGQgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24gPSBudWxsXG4gICAgc3Vic1xuXG4gIGdldFJlcGxhY2VkQ2hhckZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pPy5wb3AoKVxuXG4gICMgVmlzdWFsXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIFdlIHRyZWF0IGFsbCBzZWxlY3Rpb24gaXMgaW5pdGlhbGx5IE5PVCBub3JtYWxpemVkXG4gICNcbiAgIyAxLiBGaXJzdCB3ZSBub3JtYWxpemUgc2VsZWN0aW9uXG4gICMgMi4gVGhlbiB1cGRhdGUgc2VsZWN0aW9uIG9yaWVudGF0aW9uKD13aXNlKS5cbiAgI1xuICAjIFJlZ2FyZGxlc3Mgb2Ygc2VsZWN0aW9uIGlzIG1vZGlmaWVkIGJ5IHZtcC1jb21tYW5kIG9yIG91dGVyLXZtcC1jb21tYW5kIGxpa2UgYGNtZC1sYC5cbiAgIyBXaGVuIG5vcm1hbGl6ZSwgd2UgbW92ZSBjdXJzb3IgdG8gbGVmdChzZWxlY3RMZWZ0IGVxdWl2YWxlbnQpLlxuICAjIFNpbmNlIFZpbSdzIHZpc3VhbC1tb2RlIGlzIGFsd2F5cyBzZWxlY3RSaWdodGVkLlxuICAjXG4gICMgLSB1bi1ub3JtYWxpemVkIHNlbGVjdGlvbjogVGhpcyBpcyB0aGUgcmFuZ2Ugd2Ugc2VlIGluIHZpc3VhbC1tb2RlLiggU28gbm9ybWFsIHZpc3VhbC1tb2RlIHJhbmdlIGluIHVzZXIgcGVyc3BlY3RpdmUgKS5cbiAgIyAtIG5vcm1hbGl6ZWQgc2VsZWN0aW9uOiBPbmUgY29sdW1uIGxlZnQgc2VsY3RlZCBhdCBzZWxlY3Rpb24gZW5kIHBvc2l0aW9uXG4gICMgLSBXaGVuIHNlbGVjdFJpZ2h0IGF0IGVuZCBwb3NpdGlvbiBvZiBub3JtYWxpemVkLXNlbGVjdGlvbiwgaXQgYmVjb21lIHVuLW5vcm1hbGl6ZWQgc2VsZWN0aW9uXG4gICMgICB3aGljaCBpcyB0aGUgcmFuZ2UgaW4gdmlzdWFsLW1vZGUuXG4gIGFjdGl2YXRlVmlzdWFsTW9kZTogKHN1Ym1vZGUpIC0+XG4gICAgc3dyYXAgPSBAdmltU3RhdGUuc3dyYXBcbiAgICBmb3IgJHNlbGVjdGlvbiBpbiBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpIHdoZW4gbm90ICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG4gICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcblxuICAgIHN3cmFwLm5vcm1hbGl6ZShAZWRpdG9yKVxuXG4gICAgJHNlbGVjdGlvbi5hcHBseVdpc2Uoc3VibW9kZSkgZm9yICRzZWxlY3Rpb24gaW4gc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuXG4gICAgQHZpbVN0YXRlLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5hdXRvc2Nyb2xsKCkgaWYgc3VibW9kZSBpcyAnYmxvY2t3aXNlJ1xuXG4gICAgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIHN3cmFwLm5vcm1hbGl6ZShAZWRpdG9yKVxuXG4gICAgICBpZiBAc3VibW9kZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgICBzd3JhcC5zZXRSZXZlcnNlZFN0YXRlKEBlZGl0b3IsIHRydWUpXG4gICAgICBzZWxlY3Rpb24uY2xlYXIoYXV0b3Njcm9sbDogZmFsc2UpIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIEB1cGRhdGVOYXJyb3dlZFN0YXRlKGZhbHNlKVxuXG4gICMgTmFycm93IHRvIHNlbGVjdGlvblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaGFzTXVsdGlMaW5lU2VsZWN0aW9uOiAtPlxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgIyBbRklYTUVdIHdoeSBJIG5lZWQgbnVsbCBndWFyZCBoZXJlXG4gICAgICBub3QgQHZpbVN0YXRlLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKT8uaXNTaW5nbGVSb3coKVxuICAgIGVsc2VcbiAgICAgIG5vdCBAdmltU3RhdGUuc3dyYXAoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpLmlzU2luZ2xlUm93KClcblxuICB1cGRhdGVOYXJyb3dlZFN0YXRlOiAodmFsdWU9bnVsbCkgLT5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdpcy1uYXJyb3dlZCcsIHZhbHVlID8gQGhhc011bHRpTGluZVNlbGVjdGlvbigpKVxuXG4gIGlzTmFycm93ZWQ6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1uYXJyb3dlZCcpXG5cbm1vZHVsZS5leHBvcnRzID0gTW9kZU1hbmFnZXJcbiJdfQ==
