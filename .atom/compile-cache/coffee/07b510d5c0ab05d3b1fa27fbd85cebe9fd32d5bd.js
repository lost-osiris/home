(function() {
  var CompositeDisposable, Emitter, HighlightedAreaView, MarkerLayer, Range, StatusBarView, escapeRegExp, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ref = require('atom'), Range = ref.Range, CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter, MarkerLayer = ref.MarkerLayer;

  StatusBarView = require('./status-bar-view');

  escapeRegExp = require('./escape-reg-exp');

  module.exports = HighlightedAreaView = (function() {
    function HighlightedAreaView() {
      this.listenForStatusBarChange = bind(this.listenForStatusBarChange, this);
      this.removeStatusBar = bind(this.removeStatusBar, this);
      this.setupStatusBar = bind(this.setupStatusBar, this);
      this.removeMarkers = bind(this.removeMarkers, this);
      this.handleSelection = bind(this.handleSelection, this);
      this.debouncedHandleSelection = bind(this.debouncedHandleSelection, this);
      this.setStatusBar = bind(this.setStatusBar, this);
      this.enable = bind(this.enable, this);
      this.disable = bind(this.disable, this);
      this.onDidRemoveAllMarkers = bind(this.onDidRemoveAllMarkers, this);
      this.onDidAddSelectedMarkerForEditor = bind(this.onDidAddSelectedMarkerForEditor, this);
      this.onDidAddMarkerForEditor = bind(this.onDidAddMarkerForEditor, this);
      this.onDidAddSelectedMarker = bind(this.onDidAddSelectedMarker, this);
      this.onDidAddMarker = bind(this.onDidAddMarker, this);
      this.destroy = bind(this.destroy, this);
      this.emitter = new Emitter;
      this.markerLayers = [];
      this.resultCount = 0;
      this.enable();
      this.listenForTimeoutChange();
      this.activeItemSubscription = atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          _this.debouncedHandleSelection();
          return _this.subscribeToActiveTextEditor();
        };
      })(this));
      this.subscribeToActiveTextEditor();
      this.listenForStatusBarChange();
    }

    HighlightedAreaView.prototype.destroy = function() {
      var ref1, ref2, ref3;
      clearTimeout(this.handleSelectionTimeout);
      this.activeItemSubscription.dispose();
      if ((ref1 = this.selectionSubscription) != null) {
        ref1.dispose();
      }
      if ((ref2 = this.statusBarView) != null) {
        ref2.removeElement();
      }
      if ((ref3 = this.statusBarTile) != null) {
        ref3.destroy();
      }
      return this.statusBarTile = null;
    };

    HighlightedAreaView.prototype.onDidAddMarker = function(callback) {
      var Grim;
      Grim = require('grim');
      Grim.deprecate("Please do not use. This method will be removed.");
      return this.emitter.on('did-add-marker', callback);
    };

    HighlightedAreaView.prototype.onDidAddSelectedMarker = function(callback) {
      var Grim;
      Grim = require('grim');
      Grim.deprecate("Please do not use. This method will be removed.");
      return this.emitter.on('did-add-selected-marker', callback);
    };

    HighlightedAreaView.prototype.onDidAddMarkerForEditor = function(callback) {
      return this.emitter.on('did-add-marker-for-editor', callback);
    };

    HighlightedAreaView.prototype.onDidAddSelectedMarkerForEditor = function(callback) {
      return this.emitter.on('did-add-selected-marker-for-editor', callback);
    };

    HighlightedAreaView.prototype.onDidRemoveAllMarkers = function(callback) {
      return this.emitter.on('did-remove-marker-layer', callback);
    };

    HighlightedAreaView.prototype.disable = function() {
      this.disabled = true;
      return this.removeMarkers();
    };

    HighlightedAreaView.prototype.enable = function() {
      this.disabled = false;
      return this.debouncedHandleSelection();
    };

    HighlightedAreaView.prototype.setStatusBar = function(statusBar) {
      this.statusBar = statusBar;
      return this.setupStatusBar();
    };

    HighlightedAreaView.prototype.debouncedHandleSelection = function() {
      clearTimeout(this.handleSelectionTimeout);
      return this.handleSelectionTimeout = setTimeout((function(_this) {
        return function() {
          return _this.handleSelection();
        };
      })(this), atom.config.get('highlight-selected.timeout'));
    };

    HighlightedAreaView.prototype.listenForTimeoutChange = function() {
      return atom.config.onDidChange('highlight-selected.timeout', (function(_this) {
        return function() {
          return _this.debouncedHandleSelection();
        };
      })(this));
    };

    HighlightedAreaView.prototype.subscribeToActiveTextEditor = function() {
      var editor, ref1;
      if ((ref1 = this.selectionSubscription) != null) {
        ref1.dispose();
      }
      editor = this.getActiveEditor();
      if (!editor) {
        return;
      }
      this.selectionSubscription = new CompositeDisposable;
      this.selectionSubscription.add(editor.onDidAddSelection(this.debouncedHandleSelection));
      this.selectionSubscription.add(editor.onDidChangeSelectionRange(this.debouncedHandleSelection));
      return this.handleSelection();
    };

    HighlightedAreaView.prototype.getActiveEditor = function() {
      return atom.workspace.getActiveTextEditor();
    };

    HighlightedAreaView.prototype.getActiveEditors = function() {
      return atom.workspace.getPanes().map(function(pane) {
        var activeItem;
        activeItem = pane.activeItem;
        if (activeItem && activeItem.constructor.name === 'TextEditor') {
          return activeItem;
        }
      });
    };

    HighlightedAreaView.prototype.handleSelection = function() {
      var editor, ref1, ref2, ref3, regex, regexFlags, regexSearch, result, text;
      this.removeMarkers();
      if (this.disabled) {
        return;
      }
      editor = this.getActiveEditor();
      if (!editor) {
        return;
      }
      if (editor.getLastSelection().isEmpty()) {
        return;
      }
      if (atom.config.get('highlight-selected.onlyHighlightWholeWords')) {
        if (!this.isWordSelected(editor.getLastSelection())) {
          return;
        }
      }
      this.selections = editor.getSelections();
      text = escapeRegExp(this.selections[0].getText());
      regex = new RegExp("\\S*\\w*\\b", 'gi');
      result = regex.exec(text);
      if (result == null) {
        return;
      }
      if (result[0].length < atom.config.get('highlight-selected.minimumLength') || result.index !== 0 || result[0] !== result.input) {
        return;
      }
      regexFlags = 'g';
      if (atom.config.get('highlight-selected.ignoreCase')) {
        regexFlags = 'gi';
      }
      this.ranges = [];
      regexSearch = result[0];
      if (atom.config.get('highlight-selected.onlyHighlightWholeWords')) {
        if (regexSearch.indexOf("\$") !== -1 && ((ref1 = (ref2 = editor.getGrammar()) != null ? ref2.name : void 0) === 'PHP' || ref1 === 'HACK')) {
          regexSearch = regexSearch.replace("\$", "\$\\b");
        } else {
          regexSearch = "\\b" + regexSearch;
        }
        regexSearch = regexSearch + "\\b";
      }
      this.resultCount = 0;
      if (atom.config.get('highlight-selected.highlightInPanes')) {
        this.getActiveEditors().forEach((function(_this) {
          return function(editor) {
            return _this.highlightSelectionInEditor(editor, regexSearch, regexFlags);
          };
        })(this));
      } else {
        this.highlightSelectionInEditor(editor, regexSearch, regexFlags);
      }
      return (ref3 = this.statusBarElement) != null ? ref3.updateCount(this.resultCount) : void 0;
    };

    HighlightedAreaView.prototype.highlightSelectionInEditor = function(editor, regexSearch, regexFlags) {
      var markerLayer, markerLayerForHiddenMarkers, range;
      markerLayer = editor != null ? editor.addMarkerLayer() : void 0;
      if (markerLayer == null) {
        return;
      }
      markerLayerForHiddenMarkers = editor.addMarkerLayer();
      this.markerLayers.push(markerLayer);
      this.markerLayers.push(markerLayerForHiddenMarkers);
      range = [[0, 0], editor.getEofBufferPosition()];
      editor.scanInBufferRange(new RegExp(regexSearch, regexFlags), range, (function(_this) {
        return function(result) {
          var marker;
          _this.resultCount += 1;
          if (_this.showHighlightOnSelectedWord(result.range, _this.selections)) {
            marker = markerLayerForHiddenMarkers.markBufferRange(result.range);
            _this.emitter.emit('did-add-selected-marker', marker);
            return _this.emitter.emit('did-add-selected-marker-for-editor', {
              marker: marker,
              editor: editor
            });
          } else {
            marker = markerLayer.markBufferRange(result.range);
            _this.emitter.emit('did-add-marker', marker);
            return _this.emitter.emit('did-add-marker-for-editor', {
              marker: marker,
              editor: editor
            });
          }
        };
      })(this));
      return editor.decorateMarkerLayer(markerLayer, {
        type: 'highlight',
        "class": this.makeClasses()
      });
    };

    HighlightedAreaView.prototype.makeClasses = function() {
      var className;
      className = 'highlight-selected';
      if (atom.config.get('highlight-selected.lightTheme')) {
        className += ' light-theme';
      }
      if (atom.config.get('highlight-selected.highlightBackground')) {
        className += ' background';
      }
      return className;
    };

    HighlightedAreaView.prototype.showHighlightOnSelectedWord = function(range, selections) {
      var i, len, outcome, selection, selectionRange;
      if (!atom.config.get('highlight-selected.hideHighlightOnSelectedWord')) {
        return false;
      }
      outcome = false;
      for (i = 0, len = selections.length; i < len; i++) {
        selection = selections[i];
        selectionRange = selection.getBufferRange();
        outcome = (range.start.column === selectionRange.start.column) && (range.start.row === selectionRange.start.row) && (range.end.column === selectionRange.end.column) && (range.end.row === selectionRange.end.row);
        if (outcome) {
          break;
        }
      }
      return outcome;
    };

    HighlightedAreaView.prototype.removeMarkers = function() {
      var ref1;
      this.markerLayers.forEach(function(markerLayer) {
        return markerLayer.destroy();
      });
      this.markerLayers = [];
      if ((ref1 = this.statusBarElement) != null) {
        ref1.updateCount(0);
      }
      return this.emitter.emit('did-remove-marker-layer');
    };

    HighlightedAreaView.prototype.isWordSelected = function(selection) {
      var lineRange, nonWordCharacterToTheLeft, nonWordCharacterToTheRight, selectionRange;
      if (selection.getBufferRange().isSingleLine()) {
        selectionRange = selection.getBufferRange();
        lineRange = this.getActiveEditor().bufferRangeForBufferRow(selectionRange.start.row);
        nonWordCharacterToTheLeft = selectionRange.start.isEqual(lineRange.start) || this.isNonWordCharacterToTheLeft(selection);
        nonWordCharacterToTheRight = selectionRange.end.isEqual(lineRange.end) || this.isNonWordCharacterToTheRight(selection);
        return nonWordCharacterToTheLeft && nonWordCharacterToTheRight;
      } else {
        return false;
      }
    };

    HighlightedAreaView.prototype.isNonWordCharacter = function(character) {
      var nonWordCharacters;
      nonWordCharacters = atom.config.get('editor.nonWordCharacters');
      return new RegExp("[ \t" + (escapeRegExp(nonWordCharacters)) + "]").test(character);
    };

    HighlightedAreaView.prototype.isNonWordCharacterToTheLeft = function(selection) {
      var range, selectionStart;
      selectionStart = selection.getBufferRange().start;
      range = Range.fromPointWithDelta(selectionStart, 0, -1);
      return this.isNonWordCharacter(this.getActiveEditor().getTextInBufferRange(range));
    };

    HighlightedAreaView.prototype.isNonWordCharacterToTheRight = function(selection) {
      var range, selectionEnd;
      selectionEnd = selection.getBufferRange().end;
      range = Range.fromPointWithDelta(selectionEnd, 0, 1);
      return this.isNonWordCharacter(this.getActiveEditor().getTextInBufferRange(range));
    };

    HighlightedAreaView.prototype.setupStatusBar = function() {
      if (this.statusBarElement != null) {
        return;
      }
      if (!atom.config.get('highlight-selected.showInStatusBar')) {
        return;
      }
      this.statusBarElement = new StatusBarView();
      return this.statusBarTile = this.statusBar.addLeftTile({
        item: this.statusBarElement.getElement(),
        priority: 100
      });
    };

    HighlightedAreaView.prototype.removeStatusBar = function() {
      var ref1;
      if (this.statusBarElement == null) {
        return;
      }
      if ((ref1 = this.statusBarTile) != null) {
        ref1.destroy();
      }
      this.statusBarTile = null;
      return this.statusBarElement = null;
    };

    HighlightedAreaView.prototype.listenForStatusBarChange = function() {
      return atom.config.onDidChange('highlight-selected.showInStatusBar', (function(_this) {
        return function(changed) {
          if (changed.newValue) {
            return _this.setupStatusBar();
          } else {
            return _this.removeStatusBar();
          }
        };
      })(this));
    };

    return HighlightedAreaView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2hpZ2hsaWdodC1zZWxlY3RlZC9saWIvaGlnaGxpZ2h0ZWQtYXJlYS12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUdBQUE7SUFBQTs7RUFBQSxNQUFxRCxPQUFBLENBQVEsTUFBUixDQUFyRCxFQUFDLGlCQUFELEVBQVEsNkNBQVIsRUFBNkIscUJBQTdCLEVBQXNDOztFQUN0QyxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxtQkFBUjs7RUFDaEIsWUFBQSxHQUFlLE9BQUEsQ0FBUSxrQkFBUjs7RUFFZixNQUFNLENBQUMsT0FBUCxHQUNNO0lBRVMsNkJBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7TUFDWCxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsWUFBRCxHQUFnQjtNQUNoQixJQUFDLENBQUEsV0FBRCxHQUFlO01BQ2YsSUFBQyxDQUFBLE1BQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxzQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLHNCQUFELEdBQTBCLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQWYsQ0FBeUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ2pFLEtBQUMsQ0FBQSx3QkFBRCxDQUFBO2lCQUNBLEtBQUMsQ0FBQSwyQkFBRCxDQUFBO1FBRmlFO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QztNQUcxQixJQUFDLENBQUEsMkJBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSx3QkFBRCxDQUFBO0lBVlc7O2tDQVliLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLFlBQUEsQ0FBYSxJQUFDLENBQUEsc0JBQWQ7TUFDQSxJQUFDLENBQUEsc0JBQXNCLENBQUMsT0FBeEIsQ0FBQTs7WUFDc0IsQ0FBRSxPQUF4QixDQUFBOzs7WUFDYyxDQUFFLGFBQWhCLENBQUE7OztZQUNjLENBQUUs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SUFBQyxDQUFBLGdCQUFELEdBQW9CO0lBSkw7O2tDQU1qQix3QkFBQSxHQUEwQixTQUFBO2FBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixvQ0FBeEIsRUFBOEQsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQ7VUFDNUQsSUFBRyxPQUFPLENBQUMsUUFBWDttQkFDRSxLQUFDLENBQUEsY0FBRCxDQUFBLEVBREY7V0FBQSxNQUFBO21CQUdFLEtBQUMsQ0FBQSxlQUFELENBQUEsRUFIRjs7UUFENEQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlEO0lBRHdCOzs7OztBQWxQNUIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2UsIENvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXIsIE1hcmtlckxheWVyfSA9IHJlcXVpcmUgJ2F0b20nXG5TdGF0dXNCYXJWaWV3ID0gcmVxdWlyZSAnLi9zdGF0dXMtYmFyLXZpZXcnXG5lc2NhcGVSZWdFeHAgPSByZXF1aXJlICcuL2VzY2FwZS1yZWctZXhwJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBIaWdobGlnaHRlZEFyZWFWaWV3XG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBtYXJrZXJMYXllcnMgPSBbXVxuICAgIEByZXN1bHRDb3VudCA9IDBcbiAgICBAZW5hYmxlKClcbiAgICBAbGlzdGVuRm9yVGltZW91dENoYW5nZSgpXG4gICAgQGFjdGl2ZUl0ZW1TdWJzY3JpcHRpb24gPSBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtID0+XG4gICAgICBAZGVib3VuY2VkSGFuZGxlU2VsZWN0aW9uKClcbiAgICAgIEBzdWJzY3JpYmVUb0FjdGl2ZVRleHRFZGl0b3IoKVxuICAgIEBzdWJzY3JpYmVUb0FjdGl2ZVRleHRFZGl0b3IoKVxuICAgIEBsaXN0ZW5Gb3JTdGF0dXNCYXJDaGFuZ2UoKVxuXG4gIGRlc3Ryb3k6ID0+XG4gICAgY2xlYXJUaW1lb3V0KEBoYW5kbGVTZWxlY3Rpb25UaW1lb3V0KVxuICAgIEBhY3RpdmVJdGVtU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIEBzZWxlY3Rpb25TdWJzY3JpcHRpb24/LmRpc3Bvc2UoKVxuICAgIEBzdGF0dXNCYXJWaWV3Py5yZW1vdmVFbGVtZW50KClcbiAgICBAc3RhdHVzQmFyVGlsZT8uZGVzdHJveSgpXG4gICAgQHN0YXR1c0JhclRpbGUgPSBudWxsXG5cbiAgb25EaWRBZGRNYXJrZXI6IChjYWxsYmFjaykgPT5cbiAgICBHcmltID0gcmVxdWlyZSAnZ3JpbSdcbiAgICBHcmltLmRlcHJlY2F0ZShcIlBsZWFzZSBkbyBub3QgdXNlLiBUaGlzIG1ldGhvZCB3aWxsIGJlIHJlbW92ZWQuXCIpXG4gICAgQGVtaXR0ZXIub24gJ2RpZC1hZGQtbWFya2VyJywgY2FsbGJhY2tcblxuICBvbkRpZEFkZFNlbGVjdGVkTWFya2VyOiAoY2FsbGJhY2spID0+XG4gICAgR3JpbSA9IHJlcXVpcmUgJ2dyaW0nXG4gICAgR3JpbS5kZXByZWNhdGUoXCJQbGVhc2UgZG8gbm90IHVzZS4gVGhpcyBtZXRob2Qgd2lsbCBiZSByZW1vdmVkLlwiKVxuICAgIEBlbWl0dGVyLm9uICdkaWQtYWRkLXNlbGVjdGVkLW1hcmtlcicsIGNhbGxiYWNrXG5cbiAgb25EaWRBZGRNYXJrZXJGb3JFZGl0b3I6IChjYWxsYmFjaykgPT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWFkZC1tYXJrZXItZm9yLWVkaXRvcicsIGNhbGxiYWNrXG5cbiAgb25EaWRBZGRTZWxlY3RlZE1hcmtlckZvckVkaXRvcjogKGNhbGxiYWNrKSA9PlxuICAgIEBlbWl0dGVyLm9uICdkaWQtYWRkLXNlbGVjdGVkLW1hcmtlci1mb3ItZWRpdG9yJywgY2FsbGJhY2tcblxuICBvbkRpZFJlbW92ZUFsbE1hcmtlcnM6IChjYWxsYmFjaykgPT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLXJlbW92ZS1tYXJrZXItbGF5ZXInLCBjYWxsYmFja1xuXG4gIGRpc2FibGU6ID0+XG4gICAgQGRpc2FibGVkID0gdHJ1ZVxuICAgIEByZW1vdmVNYXJrZXJzKClcblxuICBlbmFibGU6ID0+XG4gICAgQGRpc2FibGVkID0gZmFsc2VcbiAgICBAZGVib3VuY2VkSGFuZGxlU2VsZWN0aW9uKClcblxuICBzZXRTdGF0dXNCYXI6IChzdGF0dXNCYXIpID0+XG4gICAgQHN0YXR1c0JhciA9IHN0YXR1c0JhclxuICAgIEBzZXR1cFN0YXR1c0JhcigpXG5cbiAgZGVib3VuY2VkSGFuZGxlU2VsZWN0aW9uOiA9PlxuICAgIGNsZWFyVGltZW91dChAaGFuZGxlU2VsZWN0aW9uVGltZW91dClcbiAgICBAaGFuZGxlU2VsZWN0aW9uVGltZW91dCA9IHNldFRpbWVvdXQgPT5cbiAgICAgIEBoYW5kbGVTZWxlY3Rpb24oKVxuICAgICwgYXRvbS5jb25maWcuZ2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQudGltZW91dCcpXG5cbiAgbGlzdGVuRm9yVGltZW91dENoYW5nZTogLT5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnaGlnaGxpZ2h0LXNlbGVjdGVkLnRpbWVvdXQnLCA9PlxuICAgICAgQGRlYm91bmNlZEhhbmRsZVNlbGVjdGlvbigpXG5cbiAgc3Vic2NyaWJlVG9BY3RpdmVUZXh0RWRpdG9yOiAtPlxuICAgIEBzZWxlY3Rpb25TdWJzY3JpcHRpb24/LmRpc3Bvc2UoKVxuXG4gICAgZWRpdG9yID0gQGdldEFjdGl2ZUVkaXRvcigpXG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3JcblxuICAgIEBzZWxlY3Rpb25TdWJzY3JpcHRpb24gPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgQHNlbGVjdGlvblN1YnNjcmlwdGlvbi5hZGQoXG4gICAgICBlZGl0b3Iub25EaWRBZGRTZWxlY3Rpb24gQGRlYm91bmNlZEhhbmRsZVNlbGVjdGlvblxuICAgIClcbiAgICBAc2VsZWN0aW9uU3Vic2NyaXB0aW9uLmFkZChcbiAgICAgIGVkaXRvci5vbkRpZENoYW5nZVNlbGVjdGlvblJhbmdlIEBkZWJvdW5jZWRIYW5kbGVTZWxlY3Rpb25cbiAgICApXG4gICAgQGhhbmRsZVNlbGVjdGlvbigpXG5cbiAgZ2V0QWN0aXZlRWRpdG9yOiAtPlxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gIGdldEFjdGl2ZUVkaXRvcnM6IC0+XG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKS5tYXAgKHBhbmUpIC0+XG4gICAgICBhY3RpdmVJdGVtID0gcGFuZS5hY3RpdmVJdGVtXG4gICAgICBhY3RpdmVJdGVtIGlmIGFjdGl2ZUl0ZW0gYW5kIGFjdGl2ZUl0ZW0uY29uc3RydWN0b3IubmFtZSA9PSAnVGV4dEVkaXRvcidcblxuICBoYW5kbGVTZWxlY3Rpb246ID0+XG4gICAgQHJlbW92ZU1hcmtlcnMoKVxuXG4gICAgcmV0dXJuIGlmIEBkaXNhYmxlZFxuXG4gICAgZWRpdG9yID0gQGdldEFjdGl2ZUVkaXRvcigpXG5cbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvclxuICAgIHJldHVybiBpZiBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmlzRW1wdHkoKVxuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQub25seUhpZ2hsaWdodFdob2xlV29yZHMnKVxuICAgICAgcmV0dXJuIHVubGVzcyBAaXNXb3JkU2VsZWN0ZWQoZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcblxuICAgIEBzZWxlY3Rpb25zID0gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuXG4gICAgdGV4dCA9IGVzY2FwZVJlZ0V4cChAc2VsZWN0aW9uc1swXS5nZXRUZXh0KCkpXG4gICAgcmVnZXggPSBuZXcgUmVnRXhwKFwiXFxcXFMqXFxcXHcqXFxcXGJcIiwgJ2dpJylcbiAgICByZXN1bHQgPSByZWdleC5leGVjKHRleHQpXG5cbiAgICByZXR1cm4gdW5sZXNzIHJlc3VsdD9cbiAgICByZXR1cm4gaWYgcmVzdWx0WzBdLmxlbmd0aCA8IGF0b20uY29uZmlnLmdldChcbiAgICAgICdoaWdobGlnaHQtc2VsZWN0ZWQubWluaW11bUxlbmd0aCcpIG9yXG4gICAgICAgICAgICAgIHJlc3VsdC5pbmRleCBpc250IDAgb3JcbiAgICAgICAgICAgICAgcmVzdWx0WzBdIGlzbnQgcmVzdWx0LmlucHV0XG5cbiAgICByZWdleEZsYWdzID0gJ2cnXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQuaWdub3JlQ2FzZScpXG4gICAgICByZWdleEZsYWdzID0gJ2dpJ1xuXG4gICAgQHJhbmdlcyA9IFtdXG4gICAgcmVnZXhTZWFyY2ggPSByZXN1bHRbMF1cblxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnaGlnaGxpZ2h0LXNlbGVjdGVkLm9ubHlIaWdobGlnaHRXaG9sZVdvcmRzJylcbiAgICAgIGlmIHJlZ2V4U2VhcmNoLmluZGV4T2YoXCJcXCRcIikgaXNudCAtMSBcXFxuICAgICAgYW5kIGVkaXRvci5nZXRHcmFtbWFyKCk/Lm5hbWUgaW4gWydQSFAnLCAnSEFDSyddXG4gICAgICAgIHJlZ2V4U2VhcmNoID0gcmVnZXhTZWFyY2gucmVwbGFjZShcIlxcJFwiLCBcIlxcJFxcXFxiXCIpXG4gICAgICBlbHNlXG4gICAgICAgIHJlZ2V4U2VhcmNoID0gIFwiXFxcXGJcIiArIHJlZ2V4U2VhcmNoXG4gICAgICByZWdleFNlYXJjaCA9IHJlZ2V4U2VhcmNoICsgXCJcXFxcYlwiXG5cbiAgICBAcmVzdWx0Q291bnQgPSAwXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQuaGlnaGxpZ2h0SW5QYW5lcycpXG4gICAgICBAZ2V0QWN0aXZlRWRpdG9ycygpLmZvckVhY2ggKGVkaXRvcikgPT5cbiAgICAgICAgQGhpZ2hsaWdodFNlbGVjdGlvbkluRWRpdG9yKGVkaXRvciwgcmVnZXhTZWFyY2gsIHJlZ2V4RmxhZ3MpXG4gICAgZWxzZVxuICAgICAgQGhpZ2hsaWdodFNlbGVjdGlvbkluRWRpdG9yKGVkaXRvciwgcmVnZXhTZWFyY2gsIHJlZ2V4RmxhZ3MpXG5cbiAgICBAc3RhdHVzQmFyRWxlbWVudD8udXBkYXRlQ291bnQoQHJlc3VsdENvdW50KVxuXG4gIGhpZ2hsaWdodFNlbGVjdGlvbkluRWRpdG9yOiAoZWRpdG9yLCByZWdleFNlYXJjaCwgcmVnZXhGbGFncykgLT5cbiAgICBtYXJrZXJMYXllciA9IGVkaXRvcj8uYWRkTWFya2VyTGF5ZXIoKVxuICAgIHJldHVybiB1bmxlc3MgbWFya2VyTGF5ZXI/XG4gICAgbWFya2VyTGF5ZXJGb3JIaWRkZW5NYXJrZXJzID0gZWRpdG9yLmFkZE1hcmtlckxheWVyKClcbiAgICBAbWFya2VyTGF5ZXJzLnB1c2gobWFya2VyTGF5ZXIpXG4gICAgQG1hcmtlckxheWVycy5wdXNoKG1hcmtlckxheWVyRm9ySGlkZGVuTWFya2VycylcblxuICAgIHJhbmdlID0gIFtbMCwgMF0sIGVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpXVxuXG4gICAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIG5ldyBSZWdFeHAocmVnZXhTZWFyY2gsIHJlZ2V4RmxhZ3MpLCByYW5nZSxcbiAgICAgIChyZXN1bHQpID0+XG4gICAgICAgIEByZXN1bHRDb3VudCArPSAxXG4gICAgICAgIGlmIEBzaG93SGlnaGxpZ2h0T25TZWxlY3RlZFdvcmQocmVzdWx0LnJhbmdlLCBAc2VsZWN0aW9ucylcbiAgICAgICAgICBtYXJrZXIgPSBtYXJrZXJMYXllckZvckhpZGRlbk1hcmtlcnMubWFya0J1ZmZlclJhbmdlKHJlc3VsdC5yYW5nZSlcbiAgICAgICAgICBAZW1pdHRlci5lbWl0ICdkaWQtYWRkLXNlbGVjdGVkLW1hcmtlcicsIG1hcmtlclxuICAgICAgICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1hZGQtc2VsZWN0ZWQtbWFya2VyLWZvci1lZGl0b3InLFxuICAgICAgICAgICAgbWFya2VyOiBtYXJrZXJcbiAgICAgICAgICAgIGVkaXRvcjogZWRpdG9yXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBtYXJrZXIgPSBtYXJrZXJMYXllci5tYXJrQnVmZmVyUmFuZ2UocmVzdWx0LnJhbmdlKVxuICAgICAgICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1hZGQtbWFya2VyJywgbWFya2VyXG4gICAgICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWFkZC1tYXJrZXItZm9yLWVkaXRvcicsXG4gICAgICAgICAgICBtYXJrZXI6IG1hcmtlclxuICAgICAgICAgICAgZWRpdG9yOiBlZGl0b3JcbiAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXJMYXllcihtYXJrZXJMYXllciwge1xuICAgICAgdHlwZTogJ2hpZ2hsaWdodCcsXG4gICAgICBjbGFzczogQG1ha2VDbGFzc2VzKClcbiAgICB9KVxuXG4gIG1ha2VDbGFzc2VzOiAtPlxuICAgIGNsYXNzTmFtZSA9ICdoaWdobGlnaHQtc2VsZWN0ZWQnXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQubGlnaHRUaGVtZScpXG4gICAgICBjbGFzc05hbWUgKz0gJyBsaWdodC10aGVtZSdcblxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnaGlnaGxpZ2h0LXNlbGVjdGVkLmhpZ2hsaWdodEJhY2tncm91bmQnKVxuICAgICAgY2xhc3NOYW1lICs9ICcgYmFja2dyb3VuZCdcbiAgICBjbGFzc05hbWVcblxuICBzaG93SGlnaGxpZ2h0T25TZWxlY3RlZFdvcmQ6IChyYW5nZSwgc2VsZWN0aW9ucykgLT5cbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGF0b20uY29uZmlnLmdldChcbiAgICAgICdoaWdobGlnaHQtc2VsZWN0ZWQuaGlkZUhpZ2hsaWdodE9uU2VsZWN0ZWRXb3JkJylcbiAgICBvdXRjb21lID0gZmFsc2VcbiAgICBmb3Igc2VsZWN0aW9uIGluIHNlbGVjdGlvbnNcbiAgICAgIHNlbGVjdGlvblJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIG91dGNvbWUgPSAocmFuZ2Uuc3RhcnQuY29sdW1uIGlzIHNlbGVjdGlvblJhbmdlLnN0YXJ0LmNvbHVtbikgYW5kXG4gICAgICAgICAgICAgICAgKHJhbmdlLnN0YXJ0LnJvdyBpcyBzZWxlY3Rpb25SYW5nZS5zdGFydC5yb3cpIGFuZFxuICAgICAgICAgICAgICAgIChyYW5nZS5lbmQuY29sdW1uIGlzIHNlbGVjdGlvblJhbmdlLmVuZC5jb2x1bW4pIGFuZFxuICAgICAgICAgICAgICAgIChyYW5nZS5lbmQucm93IGlzIHNlbGVjdGlvblJhbmdlLmVuZC5yb3cpXG4gICAgICBicmVhayBpZiBvdXRjb21lXG4gICAgb3V0Y29tZVxuXG4gIHJlbW92ZU1hcmtlcnM6ID0+XG4gICAgQG1hcmtlckxheWVycy5mb3JFYWNoIChtYXJrZXJMYXllcikgLT5cbiAgICAgIG1hcmtlckxheWVyLmRlc3Ryb3koKVxuICAgIEBtYXJrZXJMYXllcnMgPSBbXVxuICAgIEBzdGF0dXNCYXJFbGVtZW50Py51cGRhdGVDb3VudCgwKVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1yZW1vdmUtbWFya2VyLWxheWVyJ1xuXG4gIGlzV29yZFNlbGVjdGVkOiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmlzU2luZ2xlTGluZSgpXG4gICAgICBzZWxlY3Rpb25SYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICBsaW5lUmFuZ2UgPSBAZ2V0QWN0aXZlRWRpdG9yKCkuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3coXG4gICAgICAgIHNlbGVjdGlvblJhbmdlLnN0YXJ0LnJvdylcbiAgICAgIG5vbldvcmRDaGFyYWN0ZXJUb1RoZUxlZnQgPVxuICAgICAgICBzZWxlY3Rpb25SYW5nZS5zdGFydC5pc0VxdWFsKGxpbmVSYW5nZS5zdGFydCkgb3JcbiAgICAgICAgQGlzTm9uV29yZENoYXJhY3RlclRvVGhlTGVmdChzZWxlY3Rpb24pXG4gICAgICBub25Xb3JkQ2hhcmFjdGVyVG9UaGVSaWdodCA9XG4gICAgICAgIHNlbGVjdGlvblJhbmdlLmVuZC5pc0VxdWFsKGxpbmVSYW5nZS5lbmQpIG9yXG4gICAgICAgIEBpc05vbldvcmRDaGFyYWN0ZXJUb1RoZVJpZ2h0KHNlbGVjdGlvbilcblxuICAgICAgbm9uV29yZENoYXJhY3RlclRvVGhlTGVmdCBhbmQgbm9uV29yZENoYXJhY3RlclRvVGhlUmlnaHRcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gIGlzTm9uV29yZENoYXJhY3RlcjogKGNoYXJhY3RlcikgLT5cbiAgICBub25Xb3JkQ2hhcmFjdGVycyA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLm5vbldvcmRDaGFyYWN0ZXJzJylcbiAgICBuZXcgUmVnRXhwKFwiWyBcXHQje2VzY2FwZVJlZ0V4cChub25Xb3JkQ2hhcmFjdGVycyl9XVwiKS50ZXN0KGNoYXJhY3RlcilcblxuICBpc05vbldvcmRDaGFyYWN0ZXJUb1RoZUxlZnQ6IChzZWxlY3Rpb24pIC0+XG4gICAgc2VsZWN0aW9uU3RhcnQgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydFxuICAgIHJhbmdlID0gUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHNlbGVjdGlvblN0YXJ0LCAwLCAtMSlcbiAgICBAaXNOb25Xb3JkQ2hhcmFjdGVyKEBnZXRBY3RpdmVFZGl0b3IoKS5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSkpXG5cbiAgaXNOb25Xb3JkQ2hhcmFjdGVyVG9UaGVSaWdodDogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb25FbmQgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5lbmRcbiAgICByYW5nZSA9IFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShzZWxlY3Rpb25FbmQsIDAsIDEpXG4gICAgQGlzTm9uV29yZENoYXJhY3RlcihAZ2V0QWN0aXZlRWRpdG9yKCkuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpKVxuXG4gIHNldHVwU3RhdHVzQmFyOiA9PlxuICAgIHJldHVybiBpZiBAc3RhdHVzQmFyRWxlbWVudD9cbiAgICByZXR1cm4gdW5sZXNzIGF0b20uY29uZmlnLmdldCgnaGlnaGxpZ2h0LXNlbGVjdGVkLnNob3dJblN0YXR1c0JhcicpXG4gICAgQHN0YXR1c0JhckVsZW1lbnQgPSBuZXcgU3RhdHVzQmFyVmlldygpXG4gICAgQHN0YXR1c0JhclRpbGUgPSBAc3RhdHVzQmFyLmFkZExlZnRUaWxlKFxuICAgICAgaXRlbTogQHN0YXR1c0JhckVsZW1lbnQuZ2V0RWxlbWVudCgpLCBwcmlvcml0eTogMTAwKVxuXG4gIHJlbW92ZVN0YXR1c0JhcjogPT5cbiAgICByZXR1cm4gdW5sZXNzIEBzdGF0dXNCYXJFbGVtZW50P1xuICAgIEBzdGF0dXNCYXJUaWxlPy5kZXN0cm95KClcbiAgICBAc3RhdHVzQmFyVGlsZSA9IG51bGxcbiAgICBAc3RhdHVzQmFyRWxlbWVudCA9IG51bGxcblxuICBsaXN0ZW5Gb3JTdGF0dXNCYXJDaGFuZ2U6ID0+XG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2hpZ2hsaWdodC1zZWxlY3RlZC5zaG93SW5TdGF0dXNCYXInLCAoY2hhbmdlZCkgPT5cbiAgICAgIGlmIGNoYW5nZWQubmV3VmFsdWVcbiAgICAgICAgQHNldHVwU3RhdHVzQmFyKClcbiAgICAgIGVsc2VcbiAgICAgICAgQHJlbW92ZVN0YXR1c0JhcigpXG4iXX0=
