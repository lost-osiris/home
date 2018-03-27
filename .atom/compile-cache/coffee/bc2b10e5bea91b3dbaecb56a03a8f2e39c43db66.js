(function() {
  var $, $$, SelectList, SelectListView, _, fuzzaldrin, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  ref = require('atom-space-pen-views'), SelectListView = ref.SelectListView, $ = ref.$, $$ = ref.$$;

  fuzzaldrin = require('fuzzaldrin');

  SelectList = (function(superClass) {
    extend(SelectList, superClass);

    function SelectList() {
      return SelectList.__super__.constructor.apply(this, arguments);
    }

    SelectList.prototype.initialize = function() {
      SelectList.__super__.initialize.apply(this, arguments);
      return this.addClass('vim-mode-plus-select-list');
    };

    SelectList.prototype.getFilterKey = function() {
      return 'displayName';
    };

    SelectList.prototype.cancelled = function() {
      this.vimState.emitter.emit('did-cancel-select-list');
      return this.hide();
    };

    SelectList.prototype.show = function(vimState, options) {
      var ref1;
      this.vimState = vimState;
      if (options.maxItems != null) {
        this.setMaxItems(options.maxItems);
      }
      ref1 = this.vimState, this.editorElement = ref1.editorElement, this.editor = ref1.editor;
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setItems(options.items);
      return this.focusFilterEditor();
    };

    SelectList.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.hide() : void 0;
    };

    SelectList.prototype.viewForItem = function(arg) {
      var displayName, filterQuery, matches, name;
      name = arg.name, displayName = arg.displayName;
      filterQuery = this.getFilterQuery();
      matches = fuzzaldrin.match(displayName, filterQuery);
      return $$(function() {
        var highlighter;
        highlighter = (function(_this) {
          return function(command, matches, offsetIndex) {
            var i, lastIndex, len, matchIndex, matchedChars, unmatched;
            lastIndex = 0;
            matchedChars = [];
            for (i = 0, len = matches.length; i < len; i++) {
              matchIndex = matches[i];
              matchIndex -= offsetIndex;
              if (matchIndex < 0) {
                continue;
              }
              unmatched = command.substring(lastIndex, matchIndex);
              if (unmatched) {
                if (matchedChars.length) {
                  _this.span(matchedChars.join(''), {
                    "class": 'character-match'
                  });
                }
                matchedChars = [];
                _this.text(unmatched);
              }
              matchedChars.push(command[matchIndex]);
              lastIndex = matchIndex + 1;
            }
            if (matchedChars.length) {
              _this.span(matchedChars.join(''), {
                "class": 'character-match'
              });
            }
            return _this.text(command.substring(lastIndex));
          };
        })(this);
        return this.li({
          "class": 'event',
          'data-event-name': name
        }, (function(_this) {
          return function() {
            return _this.span({
              title: displayName
            }, function() {
              return highlighter(displayName, matches, 0);
            });
          };
        })(this));
      });
    };

    SelectList.prototype.confirmed = function(item) {
      this.vimState.emitter.emit('did-confirm-select-list', item);
      return this.cancel();
    };

    return SelectList;

  })(SelectListView);

  module.exports = new SelectList;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NlbGVjdC1saXN0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEscURBQUE7SUFBQTs7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUEwQixPQUFBLENBQVEsc0JBQVIsQ0FBMUIsRUFBQyxtQ0FBRCxFQUFpQixTQUFqQixFQUFvQjs7RUFDcEIsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSOztFQUVQOzs7Ozs7O3lCQUNKLFVBQUEsR0FBWSxTQUFBO01BQ1YsNENBQUEsU0FBQTthQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsMkJBQVY7SUFGVTs7eUJBSVosWUFBQSxHQUFjLFNBQUE7YUFDWjtJQURZOzt5QkFHZCxTQUFBLEdBQVcsU0FBQTtNQUNULElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLElBQWxCLENBQXVCLHdCQUF2QjthQUNBLElBQUMsQ0FBQSxJQUFELENBQUE7SUFGUzs7eUJBSVgsSUFBQSxHQUFNLFNBQUMsUUFBRCxFQUFZLE9BQVo7QUFDSixVQUFBO01BREssSUFBQyxDQUFBLFdBQUQ7TUFDTCxJQUFHLHdCQUFIO1FBQ0UsSUFBQyxDQUFBLFdBQUQsQ0FBYSxPQUFPLENBQUMsUUFBckIsRUFERjs7TUFFQSxPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEscUJBQUEsYUFBRixFQUFpQixJQUFDLENBQUEsY0FBQTtNQUNsQixJQUFDLENBQUEsbUJBQUQsQ0FBQTs7UUFDQSxJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7VUFBQyxJQUFBLEVBQU0sSUFBUDtTQUE3Qjs7TUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBTyxDQUFDLEtBQWxCO2FBQ0EsSUFBQyxDQUFBLGlCQUFELENBQUE7SUFSSTs7eUJBVU4sSUFBQSxHQUFNLFNBQUE7QUFDSixVQUFBOytDQUFNLENBQUUsSUFBUixDQUFBO0lBREk7O3lCQUdOLFdBQUEsR0FBYSxTQUFDLEdBQUQ7QUFFWCxVQUFBO01BRmEsaUJBQU07TUFFbkIsV0FBQSxHQUFjLElBQUMsQ0FBQSxjQUFELENBQUE7TUFDZCxPQUFBLEdBQVUsVUFBVSxDQUFDLEtBQVgsQ0FBaUIsV0FBakIsRUFBOEIsV0FBOUI7YUFDVixFQUFBLENBQUcsU0FBQTtBQUNELFlBQUE7UUFBQSxXQUFBLEdBQWMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxPQUFELEVBQVUsT0FBVixFQUFtQixXQUFuQjtBQUNaLGdCQUFBO1lBQUEsU0FBQSxHQUFZO1lBQ1osWUFBQSxHQUFlO0FBRWYsaUJBQUEseUNBQUE7O2NBQ0UsVUFBQSxJQUFjO2NBQ2QsSUFBWSxVQUFBLEdBQWEsQ0FBekI7QUFBQSx5QkFBQTs7Y0FDQSxTQUFBLEdBQVksT0FBTyxDQUFDLFNBQVIsQ0FBa0IsU0FBbEIsRUFBNkIsVUFBN0I7Y0FDWixJQUFHLFNBQUg7Z0JBQ0UsSUFBeUQsWUFBWSxDQUFDLE1BQXRFO2tCQUFBLEtBQUMsQ0FBQSxJQUFELENBQU0sWUFBWSxDQUFDLElBQWIsQ0FBa0IsRUFBbEIsQ0FBTixFQUE2QjtvQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGlCQUFQO21CQUE3QixFQUFBOztnQkFDQSxZQUFBLEdBQWU7Z0JBQ2YsS0FBQyxDQUFBLElBQUQsQ0FBTSxTQUFOLEVBSEY7O2NBSUEsWUFBWSxDQUFDLElBQWIsQ0FBa0IsT0FBUSxDQUFBLFVBQUEsQ0FBMUI7Y0FDQSxTQUFBLEdBQVksVUFBQSxHQUFhO0FBVDNCO1lBV0EsSUFBeUQsWUFBWSxDQUFDLE1BQXRFO2NBQUEsS0FBQyxDQUFBLElBQUQsQ0FBTSxZQUFZLENBQUMsSUFBYixDQUFrQixFQUFsQixDQUFOLEVBQTZCO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8saUJBQVA7ZUFBN0IsRUFBQTs7bUJBRUEsS0FBQyxDQUFBLElBQUQsQ0FBTSxPQUFPLENBQUMsU0FBUixDQUFrQixTQUFsQixDQUFOO1VBakJZO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtlQW1CZCxJQUFDLENBQUEsRUFBRCxDQUFJO1VBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxPQUFQO1VBQWdCLGlCQUFBLEVBQW1CLElBQW5DO1NBQUosRUFBNkMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDM0MsS0FBQyxDQUFBLElBQUQsQ0FBTTtjQUFBLEtBQUEsRUFBTyxXQUFQO2FBQU4sRUFBMEIsU0FBQTtxQkFBRyxXQUFBLENBQVksV0FBWixFQUF5QixPQUF6QixFQUFrQyxDQUFsQztZQUFILENBQTFCO1VBRDJDO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QztNQXBCQyxDQUFIO0lBSlc7O3lCQTJCYixTQUFBLEdBQVcsU0FBQyxJQUFEO01BQ1QsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBbEIsQ0FBdUIseUJBQXZCLEVBQWtELElBQWxEO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUZTOzs7O0tBcERZOztFQXdEekIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsSUFBSTtBQTVEckIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue1NlbGVjdExpc3RWaWV3LCAkLCAkJH0gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbmZ1enphbGRyaW4gPSByZXF1aXJlICdmdXp6YWxkcmluJ1xuXG5jbGFzcyBTZWxlY3RMaXN0IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBhZGRDbGFzcygndmltLW1vZGUtcGx1cy1zZWxlY3QtbGlzdCcpXG5cbiAgZ2V0RmlsdGVyS2V5OiAtPlxuICAgICdkaXNwbGF5TmFtZSdcblxuICBjYW5jZWxsZWQ6IC0+XG4gICAgQHZpbVN0YXRlLmVtaXR0ZXIuZW1pdCAnZGlkLWNhbmNlbC1zZWxlY3QtbGlzdCdcbiAgICBAaGlkZSgpXG5cbiAgc2hvdzogKEB2aW1TdGF0ZSwgb3B0aW9ucykgLT5cbiAgICBpZiBvcHRpb25zLm1heEl0ZW1zP1xuICAgICAgQHNldE1heEl0ZW1zKG9wdGlvbnMubWF4SXRlbXMpXG4gICAge0BlZGl0b3JFbGVtZW50LCBAZWRpdG9yfSA9IEB2aW1TdGF0ZVxuICAgIEBzdG9yZUZvY3VzZWRFbGVtZW50KClcbiAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7aXRlbTogdGhpc30pXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBzZXRJdGVtcyhvcHRpb25zLml0ZW1zKVxuICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgaGlkZTogLT5cbiAgICBAcGFuZWw/LmhpZGUoKVxuXG4gIHZpZXdGb3JJdGVtOiAoe25hbWUsIGRpc3BsYXlOYW1lfSkgLT5cbiAgICAjIFN0eWxlIG1hdGNoZWQgY2hhcmFjdGVycyBpbiBzZWFyY2ggcmVzdWx0c1xuICAgIGZpbHRlclF1ZXJ5ID0gQGdldEZpbHRlclF1ZXJ5KClcbiAgICBtYXRjaGVzID0gZnV6emFsZHJpbi5tYXRjaChkaXNwbGF5TmFtZSwgZmlsdGVyUXVlcnkpXG4gICAgJCQgLT5cbiAgICAgIGhpZ2hsaWdodGVyID0gKGNvbW1hbmQsIG1hdGNoZXMsIG9mZnNldEluZGV4KSA9PlxuICAgICAgICBsYXN0SW5kZXggPSAwXG4gICAgICAgIG1hdGNoZWRDaGFycyA9IFtdICMgQnVpbGQgdXAgYSBzZXQgb2YgbWF0Y2hlZCBjaGFycyB0byBiZSBtb3JlIHNlbWFudGljXG5cbiAgICAgICAgZm9yIG1hdGNoSW5kZXggaW4gbWF0Y2hlc1xuICAgICAgICAgIG1hdGNoSW5kZXggLT0gb2Zmc2V0SW5kZXhcbiAgICAgICAgICBjb250aW51ZSBpZiBtYXRjaEluZGV4IDwgMCAjIElmIG1hcmtpbmcgdXAgdGhlIGJhc2VuYW1lLCBvbWl0IGNvbW1hbmQgbWF0Y2hlc1xuICAgICAgICAgIHVubWF0Y2hlZCA9IGNvbW1hbmQuc3Vic3RyaW5nKGxhc3RJbmRleCwgbWF0Y2hJbmRleClcbiAgICAgICAgICBpZiB1bm1hdGNoZWRcbiAgICAgICAgICAgIEBzcGFuIG1hdGNoZWRDaGFycy5qb2luKCcnKSwgY2xhc3M6ICdjaGFyYWN0ZXItbWF0Y2gnIGlmIG1hdGNoZWRDaGFycy5sZW5ndGhcbiAgICAgICAgICAgIG1hdGNoZWRDaGFycyA9IFtdXG4gICAgICAgICAgICBAdGV4dCB1bm1hdGNoZWRcbiAgICAgICAgICBtYXRjaGVkQ2hhcnMucHVzaChjb21tYW5kW21hdGNoSW5kZXhdKVxuICAgICAgICAgIGxhc3RJbmRleCA9IG1hdGNoSW5kZXggKyAxXG5cbiAgICAgICAgQHNwYW4gbWF0Y2hlZENoYXJzLmpvaW4oJycpLCBjbGFzczogJ2NoYXJhY3Rlci1tYXRjaCcgaWYgbWF0Y2hlZENoYXJzLmxlbmd0aFxuICAgICAgICAjIFJlbWFpbmluZyBjaGFyYWN0ZXJzIGFyZSBwbGFpbiB0ZXh0XG4gICAgICAgIEB0ZXh0IGNvbW1hbmQuc3Vic3RyaW5nKGxhc3RJbmRleClcblxuICAgICAgQGxpIGNsYXNzOiAnZXZlbnQnLCAnZGF0YS1ldmVudC1uYW1lJzogbmFtZSwgPT5cbiAgICAgICAgQHNwYW4gdGl0bGU6IGRpc3BsYXlOYW1lLCAtPiBoaWdobGlnaHRlcihkaXNwbGF5TmFtZSwgbWF0Y2hlcywgMClcblxuICBjb25maXJtZWQ6IChpdGVtKSAtPlxuICAgIEB2aW1TdGF0ZS5lbWl0dGVyLmVtaXQgJ2RpZC1jb25maXJtLXNlbGVjdC1saXN0JywgaXRlbVxuICAgIEBjYW5jZWwoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZWxlY3RMaXN0XG4iXX0=
