(function() {
  var CompositeDisposable, Emitter, SearchModel, getIndex, getVisibleBufferRange, hoverCounterTimeoutID, ref, ref1, smartScrollToBufferPosition;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('./utils'), getVisibleBufferRange = ref1.getVisibleBufferRange, smartScrollToBufferPosition = ref1.smartScrollToBufferPosition, getIndex = ref1.getIndex;

  hoverCounterTimeoutID = null;

  module.exports = SearchModel = (function() {
    SearchModel.prototype.relativeIndex = 0;

    SearchModel.prototype.lastRelativeIndex = null;

    SearchModel.prototype.onDidChangeCurrentMatch = function(fn) {
      return this.emitter.on('did-change-current-match', fn);
    };

    function SearchModel(vimState, options) {
      var ref2;
      this.vimState = vimState;
      this.options = options;
      this.emitter = new Emitter;
      ref2 = this.vimState, this.editor = ref2.editor, this.editorElement = ref2.editorElement;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.editorElement.onDidChangeScrollTop(this.refreshMarkers.bind(this)));
      this.disposables.add(this.editorElement.onDidChangeScrollLeft(this.refreshMarkers.bind(this)));
      this.markerLayer = this.editor.addMarkerLayer();
      this.decoationByRange = {};
      this.onDidChangeCurrentMatch((function(_this) {
        return function() {
          var classList, point, text, timeout;
          _this.vimState.hoverSearchCounter.reset();
          if (_this.currentMatch == null) {
            if (_this.vimState.getConfig('flashScreenOnSearchHasNoMatch')) {
              _this.vimState.flash(getVisibleBufferRange(_this.editor), {
                type: 'screen'
              });
              atom.beep();
            }
            return;
          }
          if (_this.vimState.getConfig('showHoverSearchCounter')) {
            text = String(_this.currentMatchIndex + 1) + '/' + _this.matches.length;
            point = _this.currentMatch.start;
            classList = _this.classNamesForRange(_this.currentMatch);
            _this.resetHover();
            _this.vimState.hoverSearchCounter.set(text, point, {
              classList: classList
            });
            if (!_this.options.incrementalSearch) {
              timeout = _this.vimState.getConfig('showHoverSearchCounterDuration');
              hoverCounterTimeoutID = setTimeout(_this.resetHover.bind(_this), timeout);
            }
          }
          _this.editor.unfoldBufferRow(_this.currentMatch.start.row);
          smartScrollToBufferPosition(_this.editor, _this.currentMatch.start);
          if (_this.vimState.getConfig('flashOnSearch')) {
            return _this.vimState.flash(_this.currentMatch, {
              type: 'search'
            });
          }
        };
      })(this));
    }

    SearchModel.prototype.resetHover = function() {
      var ref2;
      if (hoverCounterTimeoutID != null) {
        clearTimeout(hoverCounterTimeoutID);
        hoverCounterTimeoutID = null;
      }
      return (ref2 = this.vimState.hoverSearchCounter) != null ? ref2.reset() : void 0;
    };

    SearchModel.prototype.destroy = function() {
      this.markerLayer.destroy();
      this.disposables.dispose();
      return this.decoationByRange = null;
    };

    SearchModel.prototype.clearMarkers = function() {
      this.markerLayer.clear();
      return this.decoationByRange = {};
    };

    SearchModel.prototype.classNamesForRange = function(range) {
      var classNames;
      classNames = [];
      if (range === this.firstMatch) {
        classNames.push('first');
      } else if (range === this.lastMatch) {
        classNames.push('last');
      }
      if (range === this.currentMatch) {
        classNames.push('current');
      }
      return classNames;
    };

    SearchModel.prototype.refreshMarkers = function() {
      var i, len, range, ref2, results;
      this.clearMarkers();
      ref2 = this.getVisibleMatchRanges();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        range = ref2[i];
        results.push(this.decoationByRange[range.toString()] = this.decorateRange(range));
      }
      return results;
    };

    SearchModel.prototype.getVisibleMatchRanges = function() {
      var visibleMatchRanges, visibleRange;
      visibleRange = getVisibleBufferRange(this.editor);
      return visibleMatchRanges = this.matches.filter(function(range) {
        return range.intersectsWith(visibleRange);
      });
    };

    SearchModel.prototype.decorateRange = function(range) {
      var classNames, ref2;
      classNames = this.classNamesForRange(range);
      classNames = (ref2 = ['vim-mode-plus-search-match']).concat.apply(ref2, classNames);
      return this.editor.decorateMarker(this.markerLayer.markBufferRange(range), {
        type: 'highlight',
        "class": classNames.join(' ')
      });
    };

    SearchModel.prototype.search = function(fromPoint, pattern, relativeIndex) {
      var currentMatch, i, j, len, range, ref2, ref3, ref4;
      this.pattern = pattern;
      this.matches = [];
      this.editor.scan(this.pattern, (function(_this) {
        return function(arg) {
          var range;
          range = arg.range;
          return _this.matches.push(range);
        };
      })(this));
      ref2 = this.matches, this.firstMatch = ref2[0], this.lastMatch = ref2[ref2.length - 1];
      currentMatch = null;
      if (relativeIndex >= 0) {
        ref3 = this.matches;
        for (i = 0, len = ref3.length; i < len; i++) {
          range = ref3[i];
          if (!(range.start.isGreaterThan(fromPoint))) {
            continue;
          }
          currentMatch = range;
          break;
        }
        if (currentMatch == null) {
          currentMatch = this.firstMatch;
        }
        relativeIndex--;
      } else {
        ref4 = this.matches;
        for (j = ref4.length - 1; j >= 0; j += -1) {
          range = ref4[j];
          if (!(range.start.isLessThan(fromPoint))) {
            continue;
          }
          currentMatch = range;
          break;
        }
        if (currentMatch == null) {
          currentMatch = this.lastMatch;
        }
        relativeIndex++;
      }
      this.currentMatchIndex = this.matches.indexOf(currentMatch);
      this.updateCurrentMatch(relativeIndex);
      if (this.options.incrementalSearch) {
        this.refreshMarkers();
      }
      this.initialCurrentMatchIndex = this.currentMatchIndex;
      return this.currentMatch;
    };

    SearchModel.prototype.updateCurrentMatch = function(relativeIndex) {
      this.currentMatchIndex = getIndex(this.currentMatchIndex + relativeIndex, this.matches);
      this.currentMatch = this.matches[this.currentMatchIndex];
      return this.emitter.emit('did-change-current-match');
    };

    SearchModel.prototype.visit = function(relativeIndex) {
      var newClass, newDecoration, oldClass, oldDecoration, ref2;
      if (relativeIndex == null) {
        relativeIndex = null;
      }
      if (relativeIndex != null) {
        this.lastRelativeIndex = relativeIndex;
      } else {
        relativeIndex = (ref2 = this.lastRelativeIndex) != null ? ref2 : +1;
      }
      if (!this.matches.length) {
        return;
      }
      oldDecoration = this.decoationByRange[this.currentMatch.toString()];
      this.updateCurrentMatch(relativeIndex);
      newDecoration = this.decoationByRange[this.currentMatch.toString()];
      if (oldDecoration != null) {
        oldClass = oldDecoration.getProperties()["class"];
        oldClass = oldClass.replace(/\s+current(\s+)?$/, '$1');
        oldDecoration.setProperties({
          type: 'highlight',
          "class": oldClass
        });
      }
      if (newDecoration != null) {
        newClass = newDecoration.getProperties()["class"];
        newClass = newClass.replace(/\s+current(\s+)?$/, '$1');
        newClass += ' current';
        return newDecoration.setProperties({
          type: 'highlight',
          "class": newClass
        });
      }
    };

    SearchModel.prototype.getRelativeIndex = function() {
      return this.currentMatchIndex - this.initialCurrentMatchIndex;
    };

    return SearchModel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NlYXJjaC1tb2RlbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMscUJBQUQsRUFBVTs7RUFDVixPQUlJLE9BQUEsQ0FBUSxTQUFSLENBSkosRUFDRSxrREFERixFQUVFLDhEQUZGLEVBR0U7O0VBR0YscUJBQUEsR0FBd0I7O0VBRXhCLE1BQU0sQ0FBQyxPQUFQLEdBQ007MEJBQ0osYUFBQSxHQUFlOzswQkFDZixpQkFBQSxHQUFtQjs7MEJBQ25CLHVCQUFBLEdBQXlCLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLDBCQUFaLEVBQXdDLEVBQXhDO0lBQVI7O0lBRVoscUJBQUMsUUFBRCxFQUFZLE9BQVo7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFBVyxJQUFDLENBQUEsVUFBRDtNQUN2QixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFFZixPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBO01BQ1gsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJO01BQ25CLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsYUFBYSxDQUFDLG9CQUFmLENBQW9DLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBcEMsQ0FBakI7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxxQkFBZixDQUFxQyxJQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLElBQXJCLENBQXJDLENBQWpCO01BQ0EsSUFBQyxDQUFBLFdBQUQs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O1NBQTVCLEVBSkY7O0lBaEJLOzswQkFzQlAsZ0JBQUEsR0FBa0IsU0FBQTthQUNoQixJQUFDLENBQUEsaUJBQUQsR0FBcUIsSUFBQyxDQUFBO0lBRE47Ozs7O0FBekpwQiIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57XG4gIGdldFZpc2libGVCdWZmZXJSYW5nZVxuICBzbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb25cbiAgZ2V0SW5kZXhcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5ob3ZlckNvdW50ZXJUaW1lb3V0SUQgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFNlYXJjaE1vZGVsXG4gIHJlbGF0aXZlSW5kZXg6IDBcbiAgbGFzdFJlbGF0aXZlSW5kZXg6IG51bGxcbiAgb25EaWRDaGFuZ2VDdXJyZW50TWF0Y2g6IChmbikgLT4gQGVtaXR0ZXIub24gJ2RpZC1jaGFuZ2UtY3VycmVudC1tYXRjaCcsIGZuXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUsIEBvcHRpb25zKSAtPlxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQoQGVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxUb3AoQHJlZnJlc2hNYXJrZXJzLmJpbmQodGhpcykpKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQoQGVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxMZWZ0KEByZWZyZXNoTWFya2Vycy5iaW5kKHRoaXMpKSlcbiAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmFkZE1hcmtlckxheWVyKClcbiAgICBAZGVjb2F0aW9uQnlSYW5nZSA9IHt9XG5cbiAgICBAb25EaWRDaGFuZ2VDdXJyZW50TWF0Y2ggPT5cbiAgICAgIEB2aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXIucmVzZXQoKVxuICAgICAgdW5sZXNzIEBjdXJyZW50TWF0Y2g/XG4gICAgICAgIGlmIEB2aW1TdGF0ZS5nZXRDb25maWcoJ2ZsYXNoU2NyZWVuT25TZWFyY2hIYXNOb01hdGNoJylcbiAgICAgICAgICBAdmltU3RhdGUuZmxhc2goZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlKEBlZGl0b3IpLCB0eXBlOiAnc2NyZWVuJylcbiAgICAgICAgICBhdG9tLmJlZXAoKVxuICAgICAgICByZXR1cm5cblxuICAgICAgaWYgQHZpbVN0YXRlLmdldENvbmZpZygnc2hvd0hvdmVyU2VhcmNoQ291bnRlcicpXG4gICAgICAgIHRleHQgPSBTdHJpbmcoQGN1cnJlbnRNYXRjaEluZGV4ICsgMSkgKyAnLycgKyBAbWF0Y2hlcy5sZW5ndGhcbiAgICAgICAgcG9pbnQgPSBAY3VycmVudE1hdGNoLnN0YXJ0XG4gICAgICAgIGNsYXNzTGlzdCA9IEBjbGFzc05hbWVzRm9yUmFuZ2UoQGN1cnJlbnRNYXRjaClcblxuICAgICAgICBAcmVzZXRIb3ZlcigpXG4gICAgICAgIEB2aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXIuc2V0KHRleHQsIHBvaW50LCB7Y2xhc3NMaXN0fSlcblxuICAgICAgICB1bmxlc3MgQG9wdGlvbnMuaW5jcmVtZW50YWxTZWFyY2hcbiAgICAgICAgICB0aW1lb3V0ID0gQHZpbVN0YXRlLmdldENvbmZpZygnc2hvd0hvdmVyU2VhcmNoQ291bnRlckR1cmF0aW9uJylcbiAgICAgICAgICBob3ZlckNvdW50ZXJUaW1lb3V0SUQgPSBzZXRUaW1lb3V0KEByZXNldEhvdmVyLmJpbmQodGhpcyksIHRpbWVvdXQpXG5cbiAgICAgIEBlZGl0b3IudW5mb2xkQnVmZmVyUm93KEBjdXJyZW50TWF0Y2guc3RhcnQucm93KVxuICAgICAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIEBjdXJyZW50TWF0Y2guc3RhcnQpXG5cbiAgICAgIGlmIEB2aW1TdGF0ZS5nZXRDb25maWcoJ2ZsYXNoT25TZWFyY2gnKVxuICAgICAgICBAdmltU3RhdGUuZmxhc2goQGN1cnJlbnRNYXRjaCwgdHlwZTogJ3NlYXJjaCcpXG5cbiAgcmVzZXRIb3ZlcjogLT5cbiAgICBpZiBob3ZlckNvdW50ZXJUaW1lb3V0SUQ/XG4gICAgICBjbGVhclRpbWVvdXQoaG92ZXJDb3VudGVyVGltZW91dElEKVxuICAgICAgaG92ZXJDb3VudGVyVGltZW91dElEID0gbnVsbFxuICAgICMgU2VlICM2NzRcbiAgICAjIFRoaXMgbWV0aG9kIGNhbGxlZCB3aXRoIHNldFRpbWVvdXRcbiAgICAjIGhvdmVyU2VhcmNoQ291bnRlciBtaWdodCBub3QgYmUgYXZhaWxhYmxlIHdoZW4gZWRpdG9yIGRlc3Ryb3llZC5cbiAgICBAdmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyPy5yZXNldCgpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAbWFya2VyTGF5ZXIuZGVzdHJveSgpXG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIEBkZWNvYXRpb25CeVJhbmdlID0gbnVsbFxuXG4gIGNsZWFyTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuY2xlYXIoKVxuICAgIEBkZWNvYXRpb25CeVJhbmdlID0ge31cblxuICBjbGFzc05hbWVzRm9yUmFuZ2U6IChyYW5nZSkgLT5cbiAgICBjbGFzc05hbWVzID0gW11cbiAgICBpZiByYW5nZSBpcyBAZmlyc3RNYXRjaFxuICAgICAgY2xhc3NOYW1lcy5wdXNoKCdmaXJzdCcpXG4gICAgZWxzZSBpZiByYW5nZSBpcyBAbGFzdE1hdGNoXG4gICAgICBjbGFzc05hbWVzLnB1c2goJ2xhc3QnKVxuXG4gICAgaWYgcmFuZ2UgaXMgQGN1cnJlbnRNYXRjaFxuICAgICAgY2xhc3NOYW1lcy5wdXNoKCdjdXJyZW50JylcblxuICAgIGNsYXNzTmFtZXNcblxuICByZWZyZXNoTWFya2VyczogLT5cbiAgICBAY2xlYXJNYXJrZXJzKClcbiAgICBmb3IgcmFuZ2UgaW4gQGdldFZpc2libGVNYXRjaFJhbmdlcygpXG4gICAgICBAZGVjb2F0aW9uQnlSYW5nZVtyYW5nZS50b1N0cmluZygpXSA9IEBkZWNvcmF0ZVJhbmdlKHJhbmdlKVxuXG4gIGdldFZpc2libGVNYXRjaFJhbmdlczogLT5cbiAgICB2aXNpYmxlUmFuZ2UgPSBnZXRWaXNpYmxlQnVmZmVyUmFuZ2UoQGVkaXRvcilcbiAgICB2aXNpYmxlTWF0Y2hSYW5nZXMgPSBAbWF0Y2hlcy5maWx0ZXIgKHJhbmdlKSAtPlxuICAgICAgcmFuZ2UuaW50ZXJzZWN0c1dpdGgodmlzaWJsZVJhbmdlKVxuXG4gIGRlY29yYXRlUmFuZ2U6IChyYW5nZSkgLT5cbiAgICBjbGFzc05hbWVzID0gQGNsYXNzTmFtZXNGb3JSYW5nZShyYW5nZSlcbiAgICBjbGFzc05hbWVzID0gWyd2aW0tbW9kZS1wbHVzLXNlYXJjaC1tYXRjaCddLmNvbmNhdChjbGFzc05hbWVzLi4uKVxuICAgIEBlZGl0b3IuZGVjb3JhdGVNYXJrZXIgQG1hcmtlckxheWVyLm1hcmtCdWZmZXJSYW5nZShyYW5nZSksXG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6IGNsYXNzTmFtZXMuam9pbignICcpXG5cbiAgc2VhcmNoOiAoZnJvbVBvaW50LCBAcGF0dGVybiwgcmVsYXRpdmVJbmRleCkgLT5cbiAgICBAbWF0Y2hlcyA9IFtdXG4gICAgQGVkaXRvci5zY2FuIEBwYXR0ZXJuLCAoe3JhbmdlfSkgPT5cbiAgICAgIEBtYXRjaGVzLnB1c2gocmFuZ2UpXG5cbiAgICBbQGZpcnN0TWF0Y2gsIC4uLiwgQGxhc3RNYXRjaF0gPSBAbWF0Y2hlc1xuXG4gICAgY3VycmVudE1hdGNoID0gbnVsbFxuICAgIGlmIHJlbGF0aXZlSW5kZXggPj0gMFxuICAgICAgZm9yIHJhbmdlIGluIEBtYXRjaGVzIHdoZW4gcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tUG9pbnQpXG4gICAgICAgIGN1cnJlbnRNYXRjaCA9IHJhbmdlXG4gICAgICAgIGJyZWFrXG4gICAgICBjdXJyZW50TWF0Y2ggPz0gQGZpcnN0TWF0Y2hcbiAgICAgIHJlbGF0aXZlSW5kZXgtLVxuICAgIGVsc2VcbiAgICAgIGZvciByYW5nZSBpbiBAbWF0Y2hlcyBieSAtMSB3aGVuIHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4oZnJvbVBvaW50KVxuICAgICAgICBjdXJyZW50TWF0Y2ggPSByYW5nZVxuICAgICAgICBicmVha1xuICAgICAgY3VycmVudE1hdGNoID89IEBsYXN0TWF0Y2hcbiAgICAgIHJlbGF0aXZlSW5kZXgrK1xuXG4gICAgQGN1cnJlbnRNYXRjaEluZGV4ID0gQG1hdGNoZXMuaW5kZXhPZihjdXJyZW50TWF0Y2gpXG4gICAgQHVwZGF0ZUN1cnJlbnRNYXRjaChyZWxhdGl2ZUluZGV4KVxuICAgIGlmIEBvcHRpb25zLmluY3JlbWVudGFsU2VhcmNoXG4gICAgICBAcmVmcmVzaE1hcmtlcnMoKVxuICAgIEBpbml0aWFsQ3VycmVudE1hdGNoSW5kZXggPSBAY3VycmVudE1hdGNoSW5kZXhcbiAgICBAY3VycmVudE1hdGNoXG5cbiAgdXBkYXRlQ3VycmVudE1hdGNoOiAocmVsYXRpdmVJbmRleCkgLT5cbiAgICBAY3VycmVudE1hdGNoSW5kZXggPSBnZXRJbmRleChAY3VycmVudE1hdGNoSW5kZXggKyByZWxhdGl2ZUluZGV4LCBAbWF0Y2hlcylcbiAgICBAY3VycmVudE1hdGNoID0gQG1hdGNoZXNbQGN1cnJlbnRNYXRjaEluZGV4XVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtY3VycmVudC1tYXRjaCcpXG5cbiAgdmlzaXQ6IChyZWxhdGl2ZUluZGV4PW51bGwpIC0+XG4gICAgaWYgcmVsYXRpdmVJbmRleD9cbiAgICAgIEBsYXN0UmVsYXRpdmVJbmRleCA9IHJlbGF0aXZlSW5kZXhcbiAgICBlbHNlXG4gICAgICByZWxhdGl2ZUluZGV4ID0gQGxhc3RSZWxhdGl2ZUluZGV4ID8gKzFcblxuICAgIHJldHVybiB1bmxlc3MgQG1hdGNoZXMubGVuZ3RoXG4gICAgb2xkRGVjb3JhdGlvbiA9IEBkZWNvYXRpb25CeVJhbmdlW0BjdXJyZW50TWF0Y2gudG9TdHJpbmcoKV1cbiAgICBAdXBkYXRlQ3VycmVudE1hdGNoKHJlbGF0aXZlSW5kZXgpXG4gICAgbmV3RGVjb3JhdGlvbiA9IEBkZWNvYXRpb25CeVJhbmdlW0BjdXJyZW50TWF0Y2gudG9TdHJpbmcoKV1cblxuICAgIGlmIG9sZERlY29yYXRpb24/XG4gICAgICBvbGRDbGFzcyA9IG9sZERlY29yYXRpb24uZ2V0UHJvcGVydGllcygpLmNsYXNzXG4gICAgICBvbGRDbGFzcyA9IG9sZENsYXNzLnJlcGxhY2UoL1xccytjdXJyZW50KFxccyspPyQvLCAnJDEnKVxuICAgICAgb2xkRGVjb3JhdGlvbi5zZXRQcm9wZXJ0aWVzKHR5cGU6ICdoaWdobGlnaHQnLCBjbGFzczogb2xkQ2xhc3MpXG5cbiAgICBpZiBuZXdEZWNvcmF0aW9uP1xuICAgICAgbmV3Q2xhc3MgPSBuZXdEZWNvcmF0aW9uLmdldFByb3BlcnRpZXMoKS5jbGFzc1xuICAgICAgbmV3Q2xhc3MgPSBuZXdDbGFzcy5yZXBsYWNlKC9cXHMrY3VycmVudChcXHMrKT8kLywgJyQxJylcbiAgICAgIG5ld0NsYXNzICs9ICcgY3VycmVudCdcbiAgICAgIG5ld0RlY29yYXRpb24uc2V0UHJvcGVydGllcyh0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6IG5ld0NsYXNzKVxuXG4gIGdldFJlbGF0aXZlSW5kZXg6IC0+XG4gICAgQGN1cnJlbnRNYXRjaEluZGV4IC0gQGluaXRpYWxDdXJyZW50TWF0Y2hJbmRleFxuIl19
