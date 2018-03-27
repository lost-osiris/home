(function() {
  var Motion, Search, SearchBackwards, SearchBase, SearchCurrentWord, SearchCurrentWordBackwards, SearchModel, _, getNonWordCharactersForCursor, ref, saveEditorState, searchByProjectFind,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  ref = require('./utils'), saveEditorState = ref.saveEditorState, getNonWordCharactersForCursor = ref.getNonWordCharactersForCursor, searchByProjectFind = ref.searchByProjectFind;

  SearchModel = require('./search-model');

  Motion = require('./base').getClass('Motion');

  SearchBase = (function(superClass) {
    extend(SearchBase, superClass);

    function SearchBase() {
      return SearchBase.__super__.constructor.apply(this, arguments);
    }

    SearchBase.extend(false);

    SearchBase.prototype.jump = true;

    SearchBase.prototype.backwards = false;

    SearchBase.prototype.useRegexp = true;

    SearchBase.prototype.configScope = null;

    SearchBase.prototype.landingPoint = null;

    SearchBase.prototype.defaultLandingPoint = 'start';

    SearchBase.prototype.relativeIndex = null;

    SearchBase.prototype.updatelastSearchPattern = true;

    SearchBase.prototype.isBackwards = function() {
      return this.backwards;
    };

    SearchBase.prototype.isIncrementalSearch = function() {
      return this["instanceof"]('Search') && !this.repeated && this.getConfig('incrementalSearch');
    };

    SearchBase.prototype.initialize = function() {
      SearchBase.__super__.initialize.apply(this, arguments);
      return this.onDidFinishOperation((function(_this) {
        return function() {
          return _this.finish();
        };
      })(this));
    };

    SearchBase.prototype.getCount = function() {
      var count;
      count = SearchBase.__super__.getCount.apply(this, arguments);
      if (this.isBackwards()) {
        return -count;
      } else {
        return count;
      }
    };

    SearchBase.prototype.getCaseSensitivity = function() {
      if (this.getConfig("useSmartcaseFor" + this.configScope)) {
        return 'smartcase';
      } else if (this.getConfig("ignoreCaseFor" + this.configScope)) {
        return 'insensitive';
      } else {
        return 'sensitive';
      }
    };

    SearchBase.prototype.isCaseSensitive = function(term) {
      switch (this.getCaseSensitivity()) {
        case 'smartcase':
          return term.search('[A-Z]') !== -1;
        case 'insensitive':
          return false;
        case 'sensitive':
          return true;
      }
    };

    SearchBase.prototype.finish = function() {
      var ref1;
      if (this.isIncrementalSearch() && this.getConfig('showHoverSearchCounter')) {
        this.vimState.hoverSearchCounter.reset();
      }
      this.relativeIndex = null;
      if ((ref1 = this.searchModel) != null) {
        ref1.destroy();
      }
      return this.searchModel = null;
    };

    SearchBase.prototype.getLandingPoint = function() {
      return this.landingPoint != null ? this.landingPoint : this.landingPoint = this.defaultLandingPoint;
    };

    SearchBase.prototype.getPoint = function(cursor) {
      var point, range;
      if (this.searchModel != null) {
        this.relativeIndex = this.getCount() + this.searchModel.getRelativeIndex();
      } else {
        if (this.relativeIndex == null) {
          this.relativeIndex = this.getCount();
        }
      }
      if (range = this.search(cursor, this.input, this.relativeIndex)) {
        point = range[this.getLandingPoint()];
      }
      this.searchModel.destroy();
      this.searchModel = null;
      return point;
    };

    SearchBase.prototype.moveCursor = function(cursor) {
      var input, point;
      input = this.input;
      if (!input) {
        return;
      }
      if (point = this.getPoint(cursor)) {
        cursor.setBufferPosition(point, {
          autoscroll: false
        });
      }
      if (!this.repeated) {
        this.globalState.set('currentSearch', this);
        this.vimState.searchHistory.save(input);
      }
      if (this.updatelastSearchPattern) {
        return this.globalState.set('lastSearchPattern', this.getPattern(input));
      }
    };

    SearchBase.prototype.getSearchModel = function() {
      return this.searchModel != null ? this.searchModel : this.searchModel = new SearchModel(this.vimState, {
        incrementalSearch: this.isIncrementalSearch()
      });
    };

    SearchBase.prototype.search = function(cursor, input, relativeIndex) {
      var fromPoint, searchModel;
      searchModel = this.getSearchModel();
      if (input) {
        fromPoint = this.getBufferPositionForCursor(cursor);
        return searchModel.search(fromPoint, this.getPattern(input), relativeIndex);
      } else {
        this.vimState.hoverSearchCounter.reset();
        return searchModel.clearMarkers();
      }
    };

    return SearchBase;

  })(Motion);

  Search = (function(superClass) {
    extend(Search, superClass);

    function Search() {
      this.handleConfirmSearch = bind(this.handleConfirmSearch, this);
      return Search.__super__.constructor.apply(this, arguments);
    }

    Search.extend();

    Search.prototype.configScope = "Search";

    Search.prototype.requireInput = true;

    Search.prototype.initialize = function() {
      Search.__super__.initialize.apply(this, arguments);
      if (this.isComplete()) {
        return;
      }
      if (this.isIncrementalSearch()) {
        this.restoreEditorState = saveEditorState(this.editor);
        this.onDidCommandSearch(this.handleCommandEvent.bind(this));
      }
      this.onDidConfirmSearch(this.handleConfirmSearch.bind(this));
      this.onDidCancelSearch(this.handleCancelSearch.bind(this));
      this.onDidChangeSearch(this.handleChangeSearch.bind(this));
      return this.focusSearchInputEditor();
    };

    Search.prototype.focusSearchInputEditor = function() {
      var classList;
      classList = [];
      if (this.backwards) {
        classList.push('backwards');
      }
      return this.vimState.searchInput.focus({
        classList: classList
      });
    };

    Search.prototype.handleCommandEvent = function(commandEvent) {
      var direction, input, operation;
      if (!commandEvent.input) {
        return;
      }
      switch (commandEvent.name) {
        case 'visit':
          direction = commandEvent.direction;
          if (this.isBackwards() && this.getConfig('incrementalSearchVisitDirection') === 'relative') {
            direction = (function() {
              switch (direction) {
                case 'next':
                  return 'prev';
                case 'prev':
                  return 'next';
              }
            })();
          }
          switch (direction) {
            case 'next':
              return this.getSearchModel().visit(+1);
            case 'prev':
              return this.getSearchModel().visit(-1);
          }
          break;
        case 'occurrence':
          operation = commandEvent.operation, input = commandEvent.input;
          this.vimState.occurrenceManager.addPattern(this.getPattern(input), {
            reset: operation != null
          });
          this.vimState.occurrenceManager.saveLastPattern();
          this.vimState.searchHistory.save(input);
          this.vimState.searchInput.cancel();
          if (operation != null) {
            return this.vimState.operationStack.run(operation);
          }
          break;
        case 'project-find':
          input = commandEvent.input;
          this.vimState.searchHistory.save(input);
          this.vimState.searchInput.cancel();
          return searchByProjectFind(this.editor, input);
      }
    };

    Search.prototype.handleCancelSearch = function() {
      var ref1;
      if ((ref1 = this.mode) !== 'visual' && ref1 !== 'insert') {
        this.vimState.resetNormalMode();
      }
      if (typeof this.restoreEditorState === "function") {
        this.restoreEditorState();
      }
      this.vimState.reset();
      return this.finish();
    };

    Search.prototype.isSearchRepeatCharacter = function(char) {
      var searchChar;
      if (this.isIncrementalSearch()) {
        return char === '';
      } else {
        searchChar = this.isBackwards() ? '?' : '/';
        return char === '' || char === searchChar;
      }
    };

    Search.prototype.handleConfirmSearch = function(arg) {
      this.input = arg.input, this.landingPoint = arg.landingPoint;
      if (this.isSearchRepeatCharacter(this.input)) {
        this.input = this.vimState.searchHistory.get('prev');
        if (!this.input) {
          atom.beep();
        }
      }
      return this.processOperation();
    };

    Search.prototype.handleChangeSearch = function(input) {
      if (input.startsWith(' ')) {
        input = input.replace(/^ /, '');
        this.useRegexp = false;
      }
      this.vimState.searchInput.updateOptionSettings({
        useRegexp: this.useRegexp
      });
      if (this.isIncrementalSearch()) {
        return this.search(this.editor.getLastCursor(), input, this.getCount());
      }
    };

    Search.prototype.getPattern = function(term) {
      var modifiers;
      modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      if (term.indexOf('\\c') >= 0) {
        term = term.replace('\\c', '');
        if (indexOf.call(modifiers, 'i') < 0) {
          modifiers += 'i';
        }
      }
      if (this.useRegexp) {
        try {
          return new RegExp(term, modifiers);
        } catch (error) {
          null;
        }
      }
      return new RegExp(_.escapeRegExp(term), modifiers);
    };

    return Search;

  })(SearchBase);

  SearchBackwards = (function(superClass) {
    extend(SearchBackwards, superClass);

    function SearchBackwards() {
      return SearchBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchBackwards.extend();

    SearchBackwards.prototype.backwards = true;

    return SearchBackwards;

  })(Search);

  SearchCurrentWord = (function(superClass) {
    extend(SearchCurrentWord, superClass);

    function SearchCurrentWord() {
      return SearchCurrentWord.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentWord.extend();

    SearchCurrentWord.prototype.configScope = "SearchCurrentWord";

    SearchCurrentWord.prototype.moveCursor = function(cursor) {
      var wordRange;
      if (this.input == null) {
        this.input = (wordRange = this.getCurrentWordBufferRange(), wordRange != null ? (this.editor.setCursorBufferPosition(wordRange.start), this.editor.getTextInBufferRange(wordRange)) : '');
      }
      return SearchCurrentWord.__super__.moveCursor.apply(this, arguments);
    };

    SearchCurrentWord.prototype.getPattern = function(term) {
      var modifiers, pattern;
      modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      pattern = _.escapeRegExp(term);
      if (/\W/.test(term)) {
        return new RegExp(pattern + "\\b", modifiers);
      } else {
        return new RegExp("\\b" + pattern + "\\b", modifiers);
      }
    };

    SearchCurrentWord.prototype.getCurrentWordBufferRange = function() {
      var cursor, found, nonWordCharacters, point, wordRegex;
      cursor = this.editor.getLastCursor();
      point = cursor.getBufferPosition();
      nonWordCharacters = getNonWordCharactersForCursor(cursor);
      wordRegex = new RegExp("[^\\s" + (_.escapeRegExp(nonWordCharacters)) + "]+", 'g');
      found = null;
      this.scanForward(wordRegex, {
        from: [point.row, 0],
        allowNextLine: false
      }, function(arg) {
        var range, stop;
        range = arg.range, stop = arg.stop;
        if (range.end.isGreaterThan(point)) {
          found = range;
          return stop();
        }
      });
      return found;
    };

    return SearchCurrentWord;

  })(SearchBase);

  SearchCurrentWordBackwards = (function(superClass) {
    extend(SearchCurrentWordBackwards, superClass);

    function SearchCurrentWordBackwards() {
      return SearchCurrentWordBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentWordBackwards.extend();

    SearchCurrentWordBackwards.prototype.backwards = true;

    return SearchCurrentWordBackwards;

  })(SearchCurrentWord);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi1zZWFyY2guY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxvTEFBQTtJQUFBOzs7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosTUFBd0UsT0FBQSxDQUFRLFNBQVIsQ0FBeEUsRUFBQyxxQ0FBRCxFQUFrQixpRUFBbEIsRUFBaUQ7O0VBQ2pELFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBQWlCLENBQUMsUUFBbEIsQ0FBMkIsUUFBM0I7O0VBRUg7Ozs7Ozs7SUFDSixVQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O3lCQUNBLElBQUEsR0FBTTs7eUJBQ04sU0FBQSxHQUFXOzt5QkFDWCxTQUFBLEdBQVc7O3lCQUNYLFdBQUEsR0FBYTs7eUJBQ2IsWUFBQSxHQUFjOzt5QkFDZCxtQkFBQSxHQUFxQjs7eUJBQ3JCLGFBQUEsR0FBZTs7eUJBQ2YsdUJBQUEsR0FBeUI7O3lCQUV6QixXQUFBLEdBQWEsU0FBQTthQUNYLElBQUMsQ0FBQTtJQURVOzt5QkFHYixtQkFBQSxHQUFxQixTQUFBO2FBQ25CLElBQUMsRUFBQSxVQUFBLEVBQUQsQ0FBWSxRQUFaLENBQUEsSUFBMEIsQ0FBSSxJQUFDLENBQUEsUUFBL0IsSUFBNEMsSUFBQyxDQUFBLFNBQUQsQ0FBVyxtQkFBWDtJQUR6Qjs7eUJBR3JCLFVBQUEsR0FBWSxTQUFBO01BQ1YsNENBQUEsU0FBQTthQUNBLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3BCLEtBQUMsQ0FBQSxNQUFELENBQUE7UUFEb0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBRlU7O3lCQUtaLFFBQUEsR0FBVSxTQUFBO0FB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LFVBQUE7TUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUE7TUFDVCxLQUFBLEdBQVEsTUFBTSxDQUFDLGlCQUFQLENBQUE7TUFFUixpQkFBQSxHQUFvQiw2QkFBQSxDQUE4QixNQUE5QjtNQUNwQixTQUFBLEdBQWdCLElBQUEsTUFBQSxDQUFPLE9BQUEsR0FBTyxDQUFDLENBQUMsQ0FBQyxZQUFGLENBQWUsaUJBQWYsQ0FBRCxDQUFQLEdBQTBDLElBQWpELEVBQXNELEdBQXREO01BRWhCLEtBQUEsR0FBUTtNQUNSLElBQUMsQ0FBQSxXQUFELENBQWEsU0FBYixFQUF3QjtRQUFDLElBQUEsRUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFQLEVBQVksQ0FBWixDQUFQO1FBQXVCLGFBQUEsRUFBZSxLQUF0QztPQUF4QixFQUFzRSxTQUFDLEdBQUQ7QUFDcEUsWUFBQTtRQURzRSxtQkFBTztRQUM3RSxJQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBVixDQUF3QixLQUF4QixDQUFIO1VBQ0UsS0FBQSxHQUFRO2lCQUNSLElBQUEsQ0FBQSxFQUZGOztNQURvRSxDQUF0RTthQUlBO0lBWnlCOzs7O0tBdkJHOztFQXFDMUI7Ozs7Ozs7SUFDSiwwQkFBQyxDQUFBLE1BQUQsQ0FBQTs7eUNBQ0EsU0FBQSxHQUFXOzs7O0tBRjRCO0FBblB6QyIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbntzYXZlRWRpdG9yU3RhdGUsIGdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yLCBzZWFyY2hCeVByb2plY3RGaW5kfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5TZWFyY2hNb2RlbCA9IHJlcXVpcmUgJy4vc2VhcmNoLW1vZGVsJ1xuTW90aW9uID0gcmVxdWlyZSgnLi9iYXNlJykuZ2V0Q2xhc3MoJ01vdGlvbicpXG5cbmNsYXNzIFNlYXJjaEJhc2UgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZChmYWxzZSlcbiAganVtcDogdHJ1ZVxuICBiYWNrd2FyZHM6IGZhbHNlXG4gIHVzZVJlZ2V4cDogdHJ1ZVxuICBjb25maWdTY29wZTogbnVsbFxuICBsYW5kaW5nUG9pbnQ6IG51bGwgIyBbJ3N0YXJ0JyBvciAnZW5kJ11cbiAgZGVmYXVsdExhbmRpbmdQb2ludDogJ3N0YXJ0JyAjIFsnc3RhcnQnIG9yICdlbmQnXVxuICByZWxhdGl2ZUluZGV4OiBudWxsXG4gIHVwZGF0ZWxhc3RTZWFyY2hQYXR0ZXJuOiB0cnVlXG5cbiAgaXNCYWNrd2FyZHM6IC0+XG4gICAgQGJhY2t3YXJkc1xuXG4gIGlzSW5jcmVtZW50YWxTZWFyY2g6IC0+XG4gICAgQGluc3RhbmNlb2YoJ1NlYXJjaCcpIGFuZCBub3QgQHJlcGVhdGVkIGFuZCBAZ2V0Q29uZmlnKCdpbmNyZW1lbnRhbFNlYXJjaCcpXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgQGZpbmlzaCgpXG5cbiAgZ2V0Q291bnQ6IC0+XG4gICAgY291bnQgPSBzdXBlclxuICAgIGlmIEBpc0JhY2t3YXJkcygpXG4gICAgICAtY291bnRcbiAgICBlbHNlXG4gICAgICBjb3VudFxuXG4gIGdldENhc2VTZW5zaXRpdml0eTogLT5cbiAgICBpZiBAZ2V0Q29uZmlnKFwidXNlU21hcnRjYXNlRm9yI3tAY29uZmlnU2NvcGV9XCIpXG4gICAgICAnc21hcnRjYXNlJ1xuICAgIGVsc2UgaWYgQGdldENvbmZpZyhcImlnbm9yZUNhc2VGb3Ije0Bjb25maWdTY29wZX1cIilcbiAgICAgICdpbnNlbnNpdGl2ZSdcbiAgICBlbHNlXG4gICAgICAnc2Vuc2l0aXZlJ1xuXG4gIGlzQ2FzZVNlbnNpdGl2ZTogKHRlcm0pIC0+XG4gICAgc3dpdGNoIEBnZXRDYXNlU2Vuc2l0aXZpdHkoKVxuICAgICAgd2hlbiAnc21hcnRjYXNlJyB0aGVuIHRlcm0uc2VhcmNoKCdbQS1aXScpIGlzbnQgLTFcbiAgICAgIHdoZW4gJ2luc2Vuc2l0aXZlJyB0aGVuIGZhbHNlXG4gICAgICB3aGVuICdzZW5zaXRpdmUnIHRoZW4gdHJ1ZVxuXG4gIGZpbmlzaDogLT5cbiAgICBpZiBAaXNJbmNyZW1lbnRhbFNlYXJjaCgpIGFuZCBAZ2V0Q29uZmlnKCdzaG93SG92ZXJTZWFyY2hDb3VudGVyJylcbiAgICAgIEB2aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXIucmVzZXQoKVxuICAgIEByZWxhdGl2ZUluZGV4ID0gbnVsbFxuICAgIEBzZWFyY2hNb2RlbD8uZGVzdHJveSgpXG4gICAgQHNlYXJjaE1vZGVsID0gbnVsbFxuXG4gIGdldExhbmRpbmdQb2ludDogLT5cbiAgICBAbGFuZGluZ1BvaW50ID89IEBkZWZhdWx0TGFuZGluZ1BvaW50XG5cbiAgZ2V0UG9pbnQ6IChjdXJzb3IpIC0+XG4gICAgaWYgQHNlYXJjaE1vZGVsP1xuICAgICAgQHJlbGF0aXZlSW5kZXggPSBAZ2V0Q291bnQoKSArIEBzZWFyY2hNb2RlbC5nZXRSZWxhdGl2ZUluZGV4KClcbiAgICBlbHNlXG4gICAgICBAcmVsYXRpdmVJbmRleCA/PSBAZ2V0Q291bnQoKVxuXG4gICAgaWYgcmFuZ2UgPSBAc2VhcmNoKGN1cnNvciwgQGlucHV0LCBAcmVsYXRpdmVJbmRleClcbiAgICAgIHBvaW50ID0gcmFuZ2VbQGdldExhbmRpbmdQb2ludCgpXVxuXG4gICAgQHNlYXJjaE1vZGVsLmRlc3Ryb3koKVxuICAgIEBzZWFyY2hNb2RlbCA9IG51bGxcblxuICAgIHBvaW50XG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBpbnB1dCA9IEBpbnB1dFxuICAgIHJldHVybiB1bmxlc3MgaW5wdXRcblxuICAgIGlmIHBvaW50ID0gQGdldFBvaW50KGN1cnNvcilcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludCwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiAgICB1bmxlc3MgQHJlcGVhdGVkXG4gICAgICBAZ2xvYmFsU3RhdGUuc2V0KCdjdXJyZW50U2VhcmNoJywgdGhpcylcbiAgICAgIEB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LnNhdmUoaW5wdXQpXG5cbiAgICBpZiBAdXBkYXRlbGFzdFNlYXJjaFBhdHRlcm5cbiAgICAgIEBnbG9iYWxTdGF0ZS5zZXQoJ2xhc3RTZWFyY2hQYXR0ZXJuJywgQGdldFBhdHRlcm4oaW5wdXQpKVxuXG4gIGdldFNlYXJjaE1vZGVsOiAtPlxuICAgIEBzZWFyY2hNb2RlbCA/PSBuZXcgU2VhcmNoTW9kZWwoQHZpbVN0YXRlLCBpbmNyZW1lbnRhbFNlYXJjaDogQGlzSW5jcmVtZW50YWxTZWFyY2goKSlcblxuICBzZWFyY2g6IChjdXJzb3IsIGlucHV0LCByZWxhdGl2ZUluZGV4KSAtPlxuICAgIHNlYXJjaE1vZGVsID0gQGdldFNlYXJjaE1vZGVsKClcbiAgICBpZiBpbnB1dFxuICAgICAgZnJvbVBvaW50ID0gQGdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yKGN1cnNvcilcbiAgICAgIHNlYXJjaE1vZGVsLnNlYXJjaChmcm9tUG9pbnQsIEBnZXRQYXR0ZXJuKGlucHV0KSwgcmVsYXRpdmVJbmRleClcbiAgICBlbHNlXG4gICAgICBAdmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyLnJlc2V0KClcbiAgICAgIHNlYXJjaE1vZGVsLmNsZWFyTWFya2VycygpXG5cbiMgLywgP1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTZWFyY2ggZXh0ZW5kcyBTZWFyY2hCYXNlXG4gIEBleHRlbmQoKVxuICBjb25maWdTY29wZTogXCJTZWFyY2hcIlxuICByZXF1aXJlSW5wdXQ6IHRydWVcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgcmV0dXJuIGlmIEBpc0NvbXBsZXRlKCkgIyBXaGVuIHJlcGVhdGVkLCBubyBuZWVkIHRvIGdldCB1c2VyIGlucHV0XG5cbiAgICBpZiBAaXNJbmNyZW1lbnRhbFNlYXJjaCgpXG4gICAgICBAcmVzdG9yZUVkaXRvclN0YXRlID0gc2F2ZUVkaXRvclN0YXRlKEBlZGl0b3IpXG4gICAgICBAb25EaWRDb21tYW5kU2VhcmNoKEBoYW5kbGVDb21tYW5kRXZlbnQuYmluZCh0aGlzKSlcblxuICAgIEBvbkRpZENvbmZpcm1TZWFyY2goQGhhbmRsZUNvbmZpcm1TZWFyY2guYmluZCh0aGlzKSlcbiAgICBAb25EaWRDYW5jZWxTZWFyY2goQGhhbmRsZUNhbmNlbFNlYXJjaC5iaW5kKHRoaXMpKVxuICAgIEBvbkRpZENoYW5nZVNlYXJjaChAaGFuZGxlQ2hhbmdlU2VhcmNoLmJpbmQodGhpcykpXG5cbiAgICBAZm9jdXNTZWFyY2hJbnB1dEVkaXRvcigpXG5cbiAgZm9jdXNTZWFyY2hJbnB1dEVkaXRvcjogLT5cbiAgICBjbGFzc0xpc3QgPSBbXVxuICAgIGNsYXNzTGlzdC5wdXNoKCdiYWNrd2FyZHMnKSBpZiBAYmFja3dhcmRzXG4gICAgQHZpbVN0YXRlLnNlYXJjaElucHV0LmZvY3VzKHtjbGFzc0xpc3R9KVxuXG4gIGhhbmRsZUNvbW1hbmRFdmVudDogKGNvbW1hbmRFdmVudCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIGNvbW1hbmRFdmVudC5pbnB1dFxuICAgIHN3aXRjaCBjb21tYW5kRXZlbnQubmFtZVxuICAgICAgd2hlbiAndmlzaXQnXG4gICAgICAgIHtkaXJlY3Rpb259ID0gY29tbWFuZEV2ZW50XG4gICAgICAgIGlmIEBpc0JhY2t3YXJkcygpIGFuZCBAZ2V0Q29uZmlnKCdpbmNyZW1lbnRhbFNlYXJjaFZpc2l0RGlyZWN0aW9uJykgaXMgJ3JlbGF0aXZlJ1xuICAgICAgICAgIGRpcmVjdGlvbiA9IHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ25leHQnIHRoZW4gJ3ByZXYnXG4gICAgICAgICAgICB3aGVuICdwcmV2JyB0aGVuICduZXh0J1xuXG4gICAgICAgIHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgICAgICB3aGVuICduZXh0JyB0aGVuIEBnZXRTZWFyY2hNb2RlbCgpLnZpc2l0KCsxKVxuICAgICAgICAgIHdoZW4gJ3ByZXYnIHRoZW4gQGdldFNlYXJjaE1vZGVsKCkudmlzaXQoLTEpXG5cbiAgICAgIHdoZW4gJ29jY3VycmVuY2UnXG4gICAgICAgIHtvcGVyYXRpb24sIGlucHV0fSA9IGNvbW1hbmRFdmVudFxuICAgICAgICBAdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihAZ2V0UGF0dGVybihpbnB1dCksIHJlc2V0OiBvcGVyYXRpb24/KVxuICAgICAgICBAdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIuc2F2ZUxhc3RQYXR0ZXJuKClcblxuICAgICAgICBAdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKGlucHV0KVxuICAgICAgICBAdmltU3RhdGUuc2VhcmNoSW5wdXQuY2FuY2VsKClcblxuICAgICAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKG9wZXJhdGlvbikgaWYgb3BlcmF0aW9uP1xuXG4gICAgICB3aGVuICdwcm9qZWN0LWZpbmQnXG4gICAgICAgIHtpbnB1dH0gPSBjb21tYW5kRXZlbnRcbiAgICAgICAgQHZpbVN0YXRlLnNlYXJjaEhpc3Rvcnkuc2F2ZShpbnB1dClcbiAgICAgICAgQHZpbVN0YXRlLnNlYXJjaElucHV0LmNhbmNlbCgpXG4gICAgICAgIHNlYXJjaEJ5UHJvamVjdEZpbmQoQGVkaXRvciwgaW5wdXQpXG5cbiAgaGFuZGxlQ2FuY2VsU2VhcmNoOiAtPlxuICAgIEB2aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKSB1bmxlc3MgQG1vZGUgaW4gWyd2aXN1YWwnLCAnaW5zZXJ0J11cbiAgICBAcmVzdG9yZUVkaXRvclN0YXRlPygpXG4gICAgQHZpbVN0YXRlLnJlc2V0KClcbiAgICBAZmluaXNoKClcblxuICBpc1NlYXJjaFJlcGVhdENoYXJhY3RlcjogKGNoYXIpIC0+XG4gICAgaWYgQGlzSW5jcmVtZW50YWxTZWFyY2goKVxuICAgICAgY2hhciBpcyAnJ1xuICAgIGVsc2VcbiAgICAgIHNlYXJjaENoYXIgPSBpZiBAaXNCYWNrd2FyZHMoKSB0aGVuICc/JyBlbHNlICcvJ1xuICAgICAgY2hhciBpbiBbJycsIHNlYXJjaENoYXJdXG5cbiAgaGFuZGxlQ29uZmlybVNlYXJjaDogKHtAaW5wdXQsIEBsYW5kaW5nUG9pbnR9KSA9PlxuICAgIGlmIEBpc1NlYXJjaFJlcGVhdENoYXJhY3RlcihAaW5wdXQpXG4gICAgICBAaW5wdXQgPSBAdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5nZXQoJ3ByZXYnKVxuICAgICAgYXRvbS5iZWVwKCkgdW5sZXNzIEBpbnB1dFxuICAgIEBwcm9jZXNzT3BlcmF0aW9uKClcblxuICBoYW5kbGVDaGFuZ2VTZWFyY2g6IChpbnB1dCkgLT5cbiAgICAjIElmIGlucHV0IHN0YXJ0cyB3aXRoIHNwYWNlLCByZW1vdmUgZmlyc3Qgc3BhY2UgYW5kIGRpc2FibGUgdXNlUmVnZXhwLlxuICAgIGlmIGlucHV0LnN0YXJ0c1dpdGgoJyAnKVxuICAgICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9eIC8sICcnKVxuICAgICAgQHVzZVJlZ2V4cCA9IGZhbHNlXG4gICAgQHZpbVN0YXRlLnNlYXJjaElucHV0LnVwZGF0ZU9wdGlvblNldHRpbmdzKHtAdXNlUmVnZXhwfSlcblxuICAgIGlmIEBpc0luY3JlbWVudGFsU2VhcmNoKClcbiAgICAgIEBzZWFyY2goQGVkaXRvci5nZXRMYXN0Q3Vyc29yKCksIGlucHV0LCBAZ2V0Q291bnQoKSlcblxuICBnZXRQYXR0ZXJuOiAodGVybSkgLT5cbiAgICBtb2RpZmllcnMgPSBpZiBAaXNDYXNlU2Vuc2l0aXZlKHRlcm0pIHRoZW4gJ2cnIGVsc2UgJ2dpJ1xuICAgICMgRklYTUUgdGhpcyBwcmV2ZW50IHNlYXJjaCBcXFxcYyBpdHNlbGYuXG4gICAgIyBET05UIHRoaW5rbGVzc2x5IG1pbWljIHB1cmUgVmltLiBJbnN0ZWFkLCBwcm92aWRlIGlnbm9yZWNhc2UgYnV0dG9uIGFuZCBzaG9ydGN1dC5cbiAgICBpZiB0ZXJtLmluZGV4T2YoJ1xcXFxjJykgPj0gMFxuICAgICAgdGVybSA9IHRlcm0ucmVwbGFjZSgnXFxcXGMnLCAnJylcbiAgICAgIG1vZGlmaWVycyArPSAnaScgdW5sZXNzICdpJyBpbiBtb2RpZmllcnNcblxuICAgIGlmIEB1c2VSZWdleHBcbiAgICAgIHRyeVxuICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cCh0ZXJtLCBtb2RpZmllcnMpXG4gICAgICBjYXRjaFxuICAgICAgICBudWxsXG5cbiAgICBuZXcgUmVnRXhwKF8uZXNjYXBlUmVnRXhwKHRlcm0pLCBtb2RpZmllcnMpXG5cbmNsYXNzIFNlYXJjaEJhY2t3YXJkcyBleHRlbmRzIFNlYXJjaFxuICBAZXh0ZW5kKClcbiAgYmFja3dhcmRzOiB0cnVlXG5cbiMgKiwgI1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTZWFyY2hDdXJyZW50V29yZCBleHRlbmRzIFNlYXJjaEJhc2VcbiAgQGV4dGVuZCgpXG4gIGNvbmZpZ1Njb3BlOiBcIlNlYXJjaEN1cnJlbnRXb3JkXCJcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBpbnB1dCA/PSAoXG4gICAgICB3b3JkUmFuZ2UgPSBAZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSgpXG4gICAgICBpZiB3b3JkUmFuZ2U/XG4gICAgICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24od29yZFJhbmdlLnN0YXJ0KVxuICAgICAgICBAZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHdvcmRSYW5nZSlcbiAgICAgIGVsc2VcbiAgICAgICAgJydcbiAgICApXG4gICAgc3VwZXJcblxuICBnZXRQYXR0ZXJuOiAodGVybSkgLT5cbiAgICBtb2RpZmllcnMgPSBpZiBAaXNDYXNlU2Vuc2l0aXZlKHRlcm0pIHRoZW4gJ2cnIGVsc2UgJ2dpJ1xuICAgIHBhdHRlcm4gPSBfLmVzY2FwZVJlZ0V4cCh0ZXJtKVxuICAgIGlmIC9cXFcvLnRlc3QodGVybSlcbiAgICAgIG5ldyBSZWdFeHAoXCIje3BhdHRlcm59XFxcXGJcIiwgbW9kaWZpZXJzKVxuICAgIGVsc2VcbiAgICAgIG5ldyBSZWdFeHAoXCJcXFxcYiN7cGF0dGVybn1cXFxcYlwiLCBtb2RpZmllcnMpXG5cbiAgZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZTogLT5cbiAgICBjdXJzb3IgPSBAZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuICAgIHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgIG5vbldvcmRDaGFyYWN0ZXJzID0gZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3IoY3Vyc29yKVxuICAgIHdvcmRSZWdleCA9IG5ldyBSZWdFeHAoXCJbXlxcXFxzI3tfLmVzY2FwZVJlZ0V4cChub25Xb3JkQ2hhcmFjdGVycyl9XStcIiwgJ2cnKVxuXG4gICAgZm91bmQgPSBudWxsXG4gICAgQHNjYW5Gb3J3YXJkIHdvcmRSZWdleCwge2Zyb206IFtwb2ludC5yb3csIDBdLCBhbGxvd05leHRMaW5lOiBmYWxzZX0sICh7cmFuZ2UsIHN0b3B9KSAtPlxuICAgICAgaWYgcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4ocG9pbnQpXG4gICAgICAgIGZvdW5kID0gcmFuZ2VcbiAgICAgICAgc3RvcCgpXG4gICAgZm91bmRcblxuY2xhc3MgU2VhcmNoQ3VycmVudFdvcmRCYWNrd2FyZHMgZXh0ZW5kcyBTZWFyY2hDdXJyZW50V29yZFxuICBAZXh0ZW5kKClcbiAgYmFja3dhcmRzOiB0cnVlXG4iXX0=
