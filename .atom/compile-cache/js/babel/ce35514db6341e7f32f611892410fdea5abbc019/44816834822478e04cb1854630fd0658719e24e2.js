var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */
/** @jsx etch.dom */

var _require = require('atom');

var Disposable = _require.Disposable;
var CompositeDisposable = _require.CompositeDisposable;
var TextEditor = _require.TextEditor;

var etch = require('etch');
var fuzzaldrin = require('fuzzaldrin');
var path = require('path');

module.exports = (function () {
  function SelectListView(props) {
    _classCallCheck(this, SelectListView);

    this.props = props;
    this.computeItems();
    this.selectionIndex = 0;
    this.disposables = new CompositeDisposable();
    etch.initialize(this);
    this.element.classList.add('select-list');
    this.disposables.add(this.refs.queryEditor.onDidChange(this.didChangeQuery.bind(this)));
    if (!props.skipCommandsRegistration) {
      this.disposables.add(this.registerAtomCommands());
    }
    var editorElement = this.refs.queryEditor.element;
    var didLoseFocus = this.didLoseFocus.bind(this);
    editorElement.addEventListener('blur', didLoseFocus);
    this.disposables.add(new Disposable(function () {
      editorElement.removeEventListener('blur', didLoseFocus);
    }));
  }

  _createClass(SelectListView, [{
    key: 'focus',
    value: function focus() {
      this.refs.queryEditor.element.focus();
    }
  }, {
    key: 'didLoseFocus',
    value: function didLoseFocus(event) {
      if (this.element.contains(event.relatedTarget)) {
        this.refs.queryEditor.element.focus();
      } else {
        this.cancelSelection();
      }
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.refs.queryEditor.setText('');
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.disposables.dispose();
      return etch.destroy(this);
    }
  }, {
    key: 'registerAtomCommands',
    value: function registerAtomCommands() {
      var _this = this;

      return global.atom.commands.add(this.element, {
        'core:move-up': function coreMoveUp(event) {
          _this.selectPrevious();
          event.stopPropagation();
        },
        'core:move-down': function coreMoveDown(event) {
          _this.selectNext();
          event.stopPropagation();
        },
        'core:move-to-top': function coreMoveToTop(event) {
          _this.selectFirst();
          event.stopPropagation();
        },
        'core:move-to-bottom': function coreMoveToBottom(event) {
          _this.selectLast();
          event.stopPropagation();
        },
        'core:confirm': function coreConfirm(event) {
          _this.confirmSelection();
          event.stopPropagation();
        },
        'core:cancel': function coreCancel(event) {
          _this.cancelSelection();
          event.stopPropagation();
        }
      });
    }
  }, {
    key: 'update',
    value: function update() {
      var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var shouldComputeItems = false;

      if (props.hasOwnProperty('items')) {
        this.props.items = props.items;
        shouldComputeItems = true;
      }

      if (props.hasOwnProperty('maxResults')) {
        this.props.maxResults = props.maxResults;
        shouldComputeItems = true;
      }

      if (props.hasOwnProperty('filter')) {
        this.props.filter = props.filter;
        shouldComputeItems = true;
      }

      if (props.hasOwnProperty('filterQuery')) {
        this.props.filterQuery = props.filterQuery;
        shouldComputeItems = true;
      }

      if (props.hasOwnProperty('order')) {
        this.props.order = props.order;
      }

      if (props.hasOwnProperty('emptyMessage')) {
        this.props.emptyMessage = props.emptyMessage;
      }

      if (props.hasOwnProperty('errorMessage')) {
        this.props.errorMessage = props.errorMessage;
      }

      if (props.hasOwnProperty('infoMessage')) {
        this.props.infoMessage = props.infoMessage;
      }

      if (props.hasOwnProperty('loadingMessage')) {
        this.props.loadingMessage = props.loadingMessage;
      }

      if (props.hasOwnProperty('loadingBadge')) {
        this.props.loadingBadge = props.loadingBadge;
      }

      if (props.hasOwnProperty('itemsClassList')) {
        this.props.itemsClassList = props.itemsClassList;
      }

      if (shouldComputeItems) {
        this.computeItems();
      }

      return etch.update(this);
    }
  }, {
    key: 'render',
    value: function render() {
      return etch.dom(
        'div',
        null,
        etch.dom(TextEditor, { ref: 'queryEditor', mini: true }),
        this.renderLoadingMessage(),
        this.renderInfoMessage(),
        this.renderErrorMessage(),
        this.renderItems()
      );
    }
  }, {
    key: 'renderItems',
    value: function renderItems() {
      var _this2 = this;

      if (this.items.length > 0) {
        var className = ['list-group'].concat(this.props.itemsClassList || []).join(' ');
        return etch.dom(
          'ol',
          { className: className, ref: 'items' },
          this.items.map(function (item, index) {
            return etch.dom(ListItemView, {
              element: _this2.props.elementForItem(item),
              selected: _this2.getSelectedItem() === item,
              onclick: function () {
                return _this2.didClickItem(index);
              } });
          })
        );
      } else if (!this.props.loadingMessage) {
        return etch.dom(
          'span',
          { ref: 'emptyMessage' },
          this.props.emptyMessage
        );
      } else {
        return "";
      }
    }
  }, {
    key: 'renderErrorMessage',
    value: function renderErrorMessage() {
      if (this.props.errorMessage) {
        return etch.dom(
          'span',
          { ref: 'errorMessage' },
          this.props.errorMessage
        );
      } else {
        return '';
      }
    }
  }, {
    key: 'renderInfoMessage',
    value: function renderInfoMessage() {
      if (this.props.infoMessage) {
        return etch.dom(
          'span',
          { ref: 'infoMessage' },
          this.props.infoMessage
        );
      } else {
        return '';
      }
    }
  }, {
    key: 'renderLoadingMessage',
    value: function renderLoadingMessage() {
      if (this.props.loadingMessage) {
        return etch.dom(
          'div',
          { className: 'loading' },
          etch.dom(
            'span',
            { ref: 'loadingMessage', className: 'loading-message' },
            this.props.loadingMessage
          ),
          this.props.loadingBadge ? etch.dom(
            'span',
            { ref: 'loadingBadge', className: 'badge' },
            this.props.loadingBadge
          ) : ""
        );
      } else {
        return '';
      }
    }
  }, {
    key: 'getQuery',
    value: function getQuery() {
      if (this.refs && this.refs.queryEditor) {
        return this.refs.queryEditor.getText();
      } else {
        return "";
      }
    }
  }, {
    key: 'getFilterQuery',
    value: function getFilterQuery() {
      return this.props.filterQuery ? this.props.filterQuery(this.getQuery()) : this.getQuery();
    }
  }, {
    key: 'didChangeQuery',
    value: function didChangeQuery() {
      if (this.props.didChangeQuery) {
        this.props.didChangeQuery(this.getFilterQuery());
      }

      this.computeItems();
      this.selectIndex(0);
    }
  }, {
    key: 'didClickItem',
    value: function didClickItem(itemIndex) {
      this.selectIndex(itemIndex);
      this.confirmSelection();
    }
  }, {
    key: 'computeItems',
    value: function computeItems() {
      var filterFn = this.props.filter || this.fuzzyFilter.bind(this);
      this.items = filterFn(this.props.items.slice(), this.getFilterQuery());
      if (this.props.order) {
        this.items.sort(this.props.order);
      }
      if (this.props.maxResults) {
        this.items.splice(this.props.maxResults, this.items.length - this.props.maxResults);
      }
    }
  }, {
    key: 'fuzzyFilter',
    value: function fuzzyFilter(items, query) {
      if (query.length === 0) {
        return items;
      } else {
        var scoredItems = [];
        for (var item of items) {
          var string = this.props.filterKeyForItem ? this.props.filterKeyForItem(item) : item;
          var score = fuzzaldrin.score(string, query);
          if (score > 0) {
            scoredItems.push({ item: item, score: score });
          }
        }
        scoredItems.sort(function (a, b) {
          return b.score - a.score;
        });
        return scoredItems.map(function (i) {
          return i.item;
        });
      }
    }
  }, {
    key: 'getSelectedItem',
    value: function getSelectedItem() {
      return this.items[this.selectionIndex];
    }
  }, {
    key: 'selectPrevious',
    value: function selectPrevious() {
      return this.selectIndex(this.selectionIndex - 1);
    }
  }, {
    key: 'selectNext',
    value: function selectNext() {
      return this.selectIndex(this.selectionIndex + 1);
    }
  }, {
    key: 'selectFirst',
    value: function selectFirst() {
      return this.selectIndex(0);
    }
  }, {
    key: 'selectLast',
    value: function selectLast() {
      return this.selectIndex(this.items.length - 1);
    }
  }, {
    key: 'selectIndex',
    value: function selectIndex(index) {
      if (index >= this.items.length) {
        index = 0;
      } else if (index < 0) {
        index = this.items.length - 1;
      }

      if (index !== this.selectionIndex) {
        this.selectionIndex = index;
        if (this.props.didChangeSelection) {
          this.props.didChangeSelection(this.getSelectedItem());
        }
      }

      return etch.update(this);
    }
  }, {
    key: 'selectItem',
    value: function selectItem(item) {
      var index = this.items.indexOf(item);
      if (index === -1) {
        throw new Error('Cannot select the specified item because it does not exist.');
      } else {
        return this.selectIndex(index);
      }
    }
  }, {
    key: 'confirmSelection',
    value: function confirmSelection() {
      var selectedItem = this.getSelectedItem();
      if (selectedItem) {
        if (this.props.didConfirmSelection) {
          this.props.didConfirmSelection(selectedItem);
        }
      } else {
        if (this.props.didCancelSelection) {
          this.props.didCancelSelection();
        }
      }
    }
  }, {
    key: 'cancelSelection',
    value: function cancelSelection() {
      if (this.props.didCancelSelection) {
        this.props.didCancelSelection();
      }
    }
  }]);

  return SelectListView;
})();

var ListItemView = (function () {
  function ListItemView(props) {
    var _this3 = this;

    _classCallCheck(this, ListItemView);

    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.didClick = this.didClick.bind(this);
    this.selected = props.selected;
    this.onclick = props.onclick;
    this.element = props.element;
    this.element.addEventListener('mousedown', this.mouseDown);
    this.element.addEventListener('mouseup', this.mouseUp);
    this.element.addEventListener('click', this.didClick);
    if (this.selected) {
      this.element.classList.add('selected');
    }
    this.domEventsDisposable = new Disposable(function () {
      _this3.element.removeEventListener('mousedown', _this3.mouseDown);
      _this3.element.removeEventListener('mouseup', _this3.mouseUp);
      _this3.element.removeEventListener('click', _this3.didClick);
    });
    etch.getScheduler().updateDocument(this.scrollIntoViewIfNeeded.bind(this));
  }

  _createClass(ListItemView, [{
    key: 'mouseDown',
    value: function mouseDown(event) {
      event.preventDefault();
    }
  }, {
    key: 'mouseUp',
    value: function mouseUp() {
      event.preventDefault();
    }
  }, {
    key: 'didClick',
    value: function didClick(event) {
      event.preventDefault();
      this.onclick();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.selected) {
        this.element.classList.remove('selected');
      }
      this.domEventsDisposable.dispose();
    }
  }, {
    key: 'update',
    value: function update(props) {
      if (this.element !== props.element) {
        this.element.removeEventListener('mousedown', this.mouseDown);
        props.element.addEventListener('mousedown', this.mouseDown);
        this.element.removeEventListener('mouseup', this.mouseUp);
        props.element.addEventListener('mouseup', this.mouseUp);
        this.element.removeEventListener('click', this.didClick);
        props.element.addEventListener('click', this.didClick);

        props.element.classList.remove('selected');
        if (props.selected) {
          props.element.classList.add('selected');
        }
      } else {
        if (this.selected && !props.selected) {
          this.element.classList.remove('selected');
        } else if (!this.selected && props.selected) {
          this.element.classList.add('selected');
        }
      }

      this.element = props.element;
      this.selected = props.selected;
      this.onclick = props.onclick;
      etch.getScheduler().updateDocument(this.scrollIntoViewIfNeeded.bind(this));
    }
  }, {
    key: 'scrollIntoViewIfNeeded',
    value: function scrollIntoViewIfNeeded() {
      if (this.selected) {
        this.element.scrollIntoViewIfNeeded();
      }
    }
  }]);

  return ListItemView;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3Ivc2hhcmUvYXRvbS9yZXNvdXJjZXMvYXBwLmFzYXIvbm9kZV9tb2R1bGVzL2F0b20tc2VsZWN0LWxpc3Qvc3JjL3NlbGVjdC1saXN0LXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztlQUdzRCxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUE5RCxVQUFVLFlBQVYsVUFBVTtJQUFFLG1CQUFtQixZQUFuQixtQkFBbUI7SUFBRSxVQUFVLFlBQVYsVUFBVTs7QUFDbEQsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzVCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUN4QyxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7O0FBRTVCLE1BQU0sQ0FBQyxPQUFPO0FBQ0EsV0FEUyxjQUFjLENBQ3RCLEtBQUssRUFBRTswQkFEQyxjQUFjOztBQUVqQyxRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNsQixRQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7QUFDbkIsUUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUE7QUFDdkIsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUE7QUFDNUMsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNyQixRQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDekMsUUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN2RixRQUFJLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFO0FBQ25DLFVBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFD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QUFDMUMsWUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ2xCLGVBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtTQUN4QztPQUNGLE1BQU07QUFDTCxZQUFJLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ3BDLGNBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQTtTQUMxQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUU7QUFDM0MsY0FBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO1NBQ3ZDO09BQ0Y7O0FBRUQsVUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFBO0FBQzVCLFVBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQTtBQUM5QixVQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUE7QUFDNUIsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDM0U7OztXQUVzQixrQ0FBRztBQUN4QixVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxDQUFBO09BQ3RDO0tBQ0Y7OztTQXpFRyxZQUFZIiwiZmlsZSI6Ii91c3Ivc2hhcmUvYXRvbS9yZXNvdXJjZXMvYXBwLmFzYXIvbm9kZV9tb2R1bGVzL2F0b20tc2VsZWN0LWxpc3Qvc3JjL3NlbGVjdC1saXN0LXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGJhYmVsICovXG4vKiogQGpzeCBldGNoLmRvbSAqL1xuXG5jb25zdCB7RGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgVGV4dEVkaXRvcn0gPSByZXF1aXJlKCdhdG9tJylcbmNvbnN0IGV0Y2ggPSByZXF1aXJlKCdldGNoJylcbmNvbnN0IGZ1enphbGRyaW4gPSByZXF1aXJlKCdmdXp6YWxkcmluJylcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTZWxlY3RMaXN0VmlldyB7XG4gIGNvbnN0cnVjdG9yIChwcm9wcykge1xuICAgIHRoaXMucHJvcHMgPSBwcm9wc1xuICAgIHRoaXMuY29tcHV0ZUl0ZW1zKClcbiAgICB0aGlzLnNlbGVjdGlvbkluZGV4ID0gMFxuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgZXRjaC5pbml0aWFsaXplKHRoaXMpXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3NlbGVjdC1saXN0JylcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZCh0aGlzLnJlZnMucXVlcnlFZGl0b3Iub25EaWRDaGFuZ2UodGhpcy5kaWRDaGFuZ2VRdWVyeS5iaW5kKHRoaXMpKSlcbiAgICBpZiAoIXByb3BzLnNraXBDb21tYW5kc1JlZ2lzdHJhdGlvbikge1xuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQodGhpcy5yZWdpc3RlckF0b21Db21tYW5kcygpKVxuICAgIH1cbiAgICBjb25zdCBlZGl0b3JFbGVtZW50ID0gdGhpcy5yZWZzLnF1ZXJ5RWRpdG9yLmVsZW1lbnRcbiAgICBjb25zdCBkaWRMb3NlRm9jdXMgPSB0aGlzLmRpZExvc2VGb2N1cy5iaW5kKHRoaXMpXG4gICAgZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgZGlkTG9zZUZvY3VzKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgZWRpdG9yRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgZGlkTG9zZUZvY3VzKSB9KSlcbiAgfVxuXG4gIGZvY3VzICgpIHtcbiAgICB0aGlzLnJlZnMucXVlcnlFZGl0b3IuZWxlbWVudC5mb2N1cygpXG4gIH1cblxuICBkaWRMb3NlRm9jdXMgKGV2ZW50KSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudC5jb250YWlucyhldmVudC5yZWxhdGVkVGFyZ2V0KSkge1xuICAgICAgdGhpcy5yZWZzLnF1ZXJ5RWRpdG9yLmVsZW1lbnQuZm9jdXMoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNhbmNlbFNlbGVjdGlvbigpXG4gICAgfVxuICB9XG5cbiAgcmVzZXQgKCkge1xuICAgIHRoaXMucmVmcy5xdWVyeUVkaXRvci5zZXRUZXh0KCcnKVxuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICByZXR1cm4gZXRjaC5kZXN0cm95KHRoaXMpXG4gIH1cblxuICByZWdpc3RlckF0b21Db21tYW5kcyAoKSB7XG4gICAgcmV0dXJuIGdsb2JhbC5hdG9tLmNvbW1hbmRzLmFkZCh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICdjb3JlOm1vdmUtdXAnOiAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5zZWxlY3RQcmV2aW91cygpXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICB9LFxuICAgICAgJ2NvcmU6bW92ZS1kb3duJzogKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuc2VsZWN0TmV4dCgpXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICB9LFxuICAgICAgJ2NvcmU6bW92ZS10by10b3AnOiAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5zZWxlY3RGaXJzdCgpXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICB9LFxuICAgICAgJ2NvcmU6bW92ZS10by1ib3R0b20nOiAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5zZWxlY3RMYXN0KClcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIH0sXG4gICAgICAnY29yZTpjb25maXJtJzogKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuY29uZmlybVNlbGVjdGlvbigpXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICB9LFxuICAgICAgJ2NvcmU6Y2FuY2VsJzogKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuY2FuY2VsU2VsZWN0aW9uKClcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgdXBkYXRlIChwcm9wcyA9IHt9KSB7XG4gICAgbGV0IHNob3VsZENvbXB1dGVJdGVtcyA9IGZhbHNlXG5cbiAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkoJ2l0ZW1zJykpIHtcbiAgICAgIHRoaXMucHJvcHMuaXRlbXMgPSBwcm9wcy5pdGVtc1xuICAgICAgc2hvdWxkQ29tcHV0ZUl0ZW1zID0gdHJ1ZVxuICAgIH1cblxuICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eSgnbWF4UmVzdWx0cycpKSB7XG4gICAgICB0aGlzLnByb3BzLm1heFJlc3VsdHMgPSBwcm9wcy5tYXhSZXN1bHRzXG4gICAgICBzaG91bGRDb21wdXRlSXRlbXMgPSB0cnVlXG4gICAgfVxuXG4gICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KCdmaWx0ZXInKSkge1xuICAgICAgdGhpcy5wcm9wcy5maWx0ZXIgPSBwcm9wcy5maWx0ZXJcbiAgICAgIHNob3VsZENvbXB1dGVJdGVtcyA9IHRydWVcbiAgICB9XG5cbiAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkoJ2ZpbHRlclF1ZXJ5JykpIHtcbiAgICAgIHRoaXMucHJvcHMuZmlsdGVyUXVlcnkgPSBwcm9wcy5maWx0ZXJRdWVyeVxuICAgICAgc2hvdWxkQ29tcHV0ZUl0ZW1zID0gdHJ1ZVxuICAgIH1cblxuICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eSgnb3JkZXInKSkge1xuICAgICAgdGhpcy5wcm9wcy5vcmRlciA9IHByb3BzLm9yZGVyXG4gICAgfVxuXG4gICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KCdlbXB0eU1lc3NhZ2UnKSkge1xuICAgICAgdGhpcy5wcm9wcy5lbXB0eU1lc3NhZ2UgPSBwcm9wcy5lbXB0eU1lc3NhZ2VcbiAgICB9XG5cbiAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkoJ2Vycm9yTWVzc2FnZScpKSB7XG4gICAgICB0aGlzLnByb3BzLmVycm9yTWVzc2FnZSA9IHByb3BzLmVycm9yTWVzc2FnZVxuICAgIH1cblxuICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eSgnaW5mb01lc3NhZ2UnKSkge1xuICAgICAgdGhpcy5wcm9wcy5pbmZvTWVzc2FnZSA9IHByb3BzLmluZm9NZXNzYWdlXG4gICAgfVxuXG4gICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KCdsb2FkaW5nTWVzc2FnZScpKSB7XG4gICAgICB0aGlzLnByb3BzLmxvYWRpbmdNZXNzYWdlID0gcHJvcHMubG9hZGluZ01lc3NhZ2VcbiAgICB9XG5cbiAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkoJ2xvYWRpbmdCYWRnZScpKSB7XG4gICAgICB0aGlzLnByb3BzLmxvYWRpbmdCYWRnZSA9IHByb3BzLmxvYWRpbmdCYWRnZVxuICAgIH1cblxuICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eSgnaXRlbXNDbGFzc0xpc3QnKSkge1xuICAgICAgdGhpcy5wcm9wcy5pdGVtc0NsYXNzTGlzdCA9IHByb3BzLml0ZW1zQ2xhc3NMaXN0XG4gICAgfVxuXG4gICAgaWYgKHNob3VsZENvbXB1dGVJdGVtcykge1xuICAgICAgdGhpcy5jb21wdXRlSXRlbXMoKVxuICAgIH1cblxuICAgIHJldHVybiBldGNoLnVwZGF0ZSh0aGlzKVxuICB9XG5cbiAgcmVuZGVyICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPFRleHRFZGl0b3IgcmVmPSdxdWVyeUVkaXRvcicgbWluaT17dHJ1ZX0gLz5cbiAgICAgICAge3RoaXMucmVuZGVyTG9hZGluZ01lc3NhZ2UoKX1cbiAgICAgICAge3RoaXMucmVuZGVySW5mb01lc3NhZ2UoKX1cbiAgICAgICAge3RoaXMucmVuZGVyRXJyb3JNZXNzYWdlKCl9XG4gICAgICAgIHt0aGlzLnJlbmRlckl0ZW1zKCl9XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxuICByZW5kZXJJdGVtcyAoKSB7XG4gICAgaWYgKHRoaXMuaXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgY2xhc3NOYW1lID0gWydsaXN0LWdyb3VwJ10uY29uY2F0KHRoaXMucHJvcHMuaXRlbXNDbGFzc0xpc3QgfHwgW10pLmpvaW4oJyAnKVxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPG9sIGNsYXNzTmFtZT17Y2xhc3NOYW1lfSByZWY9J2l0ZW1zJz5cbiAgICAgICAge3RoaXMuaXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT5cbiAgICAgICAgICA8TGlzdEl0ZW1WaWV3XG4gICAgICAgICAgICBlbGVtZW50PXt0aGlzLnByb3BzLmVsZW1lbnRGb3JJdGVtKGl0ZW0pfVxuICAgICAgICAgICAgc2VsZWN0ZWQ9e3RoaXMuZ2V0U2VsZWN0ZWRJdGVtKCkgPT09IGl0ZW19XG4gICAgICAgICAgICBvbmNsaWNrPXsoKSA9PiB0aGlzLmRpZENsaWNrSXRlbShpbmRleCl9IC8+KX1cbiAgICAgICAgPC9vbD5cbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKCF0aGlzLnByb3BzLmxvYWRpbmdNZXNzYWdlKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8c3BhbiByZWY9XCJlbXB0eU1lc3NhZ2VcIj57dGhpcy5wcm9wcy5lbXB0eU1lc3NhZ2V9PC9zcGFuPlxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCJcIlxuICAgIH1cbiAgfVxuXG4gIHJlbmRlckVycm9yTWVzc2FnZSAoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuZXJyb3JNZXNzYWdlKSB7XG4gICAgICByZXR1cm4gPHNwYW4gcmVmPVwiZXJyb3JNZXNzYWdlXCI+e3RoaXMucHJvcHMuZXJyb3JNZXNzYWdlfTwvc3Bhbj5cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnXG4gICAgfVxuICB9XG5cbiAgcmVuZGVySW5mb01lc3NhZ2UgKCkge1xuICAgIGlmICh0aGlzLnByb3BzLmluZm9NZXNzYWdlKSB7XG4gICAgICByZXR1cm4gPHNwYW4gcmVmPVwiaW5mb01lc3NhZ2VcIj57dGhpcy5wcm9wcy5pbmZvTWVzc2FnZX08L3NwYW4+XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJ1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlckxvYWRpbmdNZXNzYWdlICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5sb2FkaW5nTWVzc2FnZSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsb2FkaW5nXCI+XG4gICAgICAgICAgPHNwYW4gcmVmPVwibG9hZGluZ01lc3NhZ2VcIiBjbGFzc05hbWU9XCJsb2FkaW5nLW1lc3NhZ2VcIj57dGhpcy5wcm9wcy5sb2FkaW5nTWVzc2FnZX08L3NwYW4+XG4gICAgICAgICAge3RoaXMucHJvcHMubG9hZGluZ0JhZGdlID8gPHNwYW4gcmVmPVwibG9hZGluZ0JhZGdlXCIgY2xhc3NOYW1lPVwiYmFkZ2VcIj57dGhpcy5wcm9wcy5sb2FkaW5nQmFkZ2V9PC9zcGFuPiA6IFwiXCJ9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJydcbiAgICB9XG4gIH1cblxuICBnZXRRdWVyeSAoKSB7XG4gICAgaWYgKHRoaXMucmVmcyAmJiB0aGlzLnJlZnMucXVlcnlFZGl0b3IpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlZnMucXVlcnlFZGl0b3IuZ2V0VGV4dCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcIlwiXG4gICAgfVxuICB9XG5cbiAgZ2V0RmlsdGVyUXVlcnkgKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmZpbHRlclF1ZXJ5ID8gdGhpcy5wcm9wcy5maWx0ZXJRdWVyeSh0aGlzLmdldFF1ZXJ5KCkpIDogdGhpcy5nZXRRdWVyeSgpXG4gIH1cblxuICBkaWRDaGFuZ2VRdWVyeSAoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuZGlkQ2hhbmdlUXVlcnkpIHtcbiAgICAgIHRoaXMucHJvcHMuZGlkQ2hhbmdlUXVlcnkodGhpcy5nZXRGaWx0ZXJRdWVyeSgpKVxuICAgIH1cblxuICAgIHRoaXMuY29tcHV0ZUl0ZW1zKClcbiAgICB0aGlzLnNlbGVjdEluZGV4KDApXG4gIH1cblxuICBkaWRDbGlja0l0ZW0gKGl0ZW1JbmRleCkge1xuICAgIHRoaXMuc2VsZWN0SW5kZXgoaXRlbUluZGV4KVxuICAgIHRoaXMuY29uZmlybVNlbGVjdGlvbigpXG4gIH1cblxuICBjb21wdXRlSXRlbXMgKCkge1xuICAgIGNvbnN0IGZpbHRlckZuID0gdGhpcy5wcm9wcy5maWx0ZXIgfHwgdGhpcy5mdXp6eUZpbHRlci5iaW5kKHRoaXMpXG4gICAgdGhpcy5pdGVtcyA9IGZpbHRlckZuKHRoaXMucHJvcHMuaXRlbXMuc2xpY2UoKSwgdGhpcy5nZXRGaWx0ZXJRdWVyeSgpKVxuICAgIGlmICh0aGlzLnByb3BzLm9yZGVyKSB7XG4gICAgICB0aGlzLml0ZW1zLnNvcnQodGhpcy5wcm9wcy5vcmRlcilcbiAgICB9XG4gICAgaWYgKHRoaXMucHJvcHMubWF4UmVzdWx0cykge1xuICAgICAgdGhpcy5pdGVtcy5zcGxpY2UodGhpcy5wcm9wcy5tYXhSZXN1bHRzLCB0aGlzLml0ZW1zLmxlbmd0aCAtIHRoaXMucHJvcHMubWF4UmVzdWx0cylcbiAgICB9XG4gIH1cblxuICBmdXp6eUZpbHRlciAoaXRlbXMsIHF1ZXJ5KSB7XG4gICAgaWYgKHF1ZXJ5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGl0ZW1zXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNjb3JlZEl0ZW1zID0gW11cbiAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xuICAgICAgICBjb25zdCBzdHJpbmcgPSB0aGlzLnByb3BzLmZpbHRlcktleUZvckl0ZW0gPyB0aGlzLnByb3BzLmZpbHRlcktleUZvckl0ZW0oaXRlbSkgOiBpdGVtXG4gICAgICAgIGxldCBzY29yZSA9IGZ1enphbGRyaW4uc2NvcmUoc3RyaW5nLCBxdWVyeSlcbiAgICAgICAgaWYgKHNjb3JlID4gMCkge1xuICAgICAgICAgIHNjb3JlZEl0ZW1zLnB1c2goe2l0ZW0sIHNjb3JlfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2NvcmVkSXRlbXMuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUpXG4gICAgICByZXR1cm4gc2NvcmVkSXRlbXMubWFwKChpKSA9PiBpLml0ZW0pXG4gICAgfVxuICB9XG5cbiAgZ2V0U2VsZWN0ZWRJdGVtICgpIHtcbiAgICByZXR1cm4gdGhpcy5pdGVtc1t0aGlzLnNlbGVjdGlvbkluZGV4XVxuICB9XG5cbiAgc2VsZWN0UHJldmlvdXMgKCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdEluZGV4KHRoaXMuc2VsZWN0aW9uSW5kZXggLSAxKVxuICB9XG5cbiAgc2VsZWN0TmV4dCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0SW5kZXgodGhpcy5zZWxlY3Rpb25JbmRleCArIDEpXG4gIH1cblxuICBzZWxlY3RGaXJzdCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0SW5kZXgoMClcbiAgfVxuXG4gIHNlbGVjdExhc3QgKCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdEluZGV4KHRoaXMuaXRlbXMubGVuZ3RoIC0gMSlcbiAgfVxuXG4gIHNlbGVjdEluZGV4IChpbmRleCkge1xuICAgIGlmIChpbmRleCA+PSB0aGlzLml0ZW1zLmxlbmd0aCkge1xuICAgICAgaW5kZXggPSAwXG4gICAgfSBlbHNlIGlmIChpbmRleCA8IDApIHtcbiAgICAgIGluZGV4ID0gdGhpcy5pdGVtcy5sZW5ndGggLSAxXG4gICAgfVxuXG4gICAgaWYgKGluZGV4ICE9PSB0aGlzLnNlbGVjdGlvbkluZGV4KSB7XG4gICAgICB0aGlzLnNlbGVjdGlvbkluZGV4ID0gaW5kZXhcbiAgICAgIGlmICh0aGlzLnByb3BzLmRpZENoYW5nZVNlbGVjdGlvbikge1xuICAgICAgICB0aGlzLnByb3BzLmRpZENoYW5nZVNlbGVjdGlvbih0aGlzLmdldFNlbGVjdGVkSXRlbSgpKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBldGNoLnVwZGF0ZSh0aGlzKVxuICB9XG5cbiAgc2VsZWN0SXRlbSAoaXRlbSkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5pdGVtcy5pbmRleE9mKGl0ZW0pXG4gICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgc2VsZWN0IHRoZSBzcGVjaWZpZWQgaXRlbSBiZWNhdXNlIGl0IGRvZXMgbm90IGV4aXN0LicpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnNlbGVjdEluZGV4KGluZGV4KVxuICAgIH1cbiAgfVxuXG4gIGNvbmZpcm1TZWxlY3Rpb24gKCkge1xuICAgIGNvbnN0IHNlbGVjdGVkSXRlbSA9IHRoaXMuZ2V0U2VsZWN0ZWRJdGVtKClcbiAgICBpZiAoc2VsZWN0ZWRJdGVtKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5kaWRDb25maXJtU2VsZWN0aW9uKSB7XG4gICAgICAgIHRoaXMucHJvcHMuZGlkQ29uZmlybVNlbGVjdGlvbihzZWxlY3RlZEl0ZW0pXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLmRpZENhbmNlbFNlbGVjdGlvbikge1xuICAgICAgICB0aGlzLnByb3BzLmRpZENhbmNlbFNlbGVjdGlvbigpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY2FuY2VsU2VsZWN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5kaWRDYW5jZWxTZWxlY3Rpb24pIHtcbiAgICAgIHRoaXMucHJvcHMuZGlkQ2FuY2VsU2VsZWN0aW9uKClcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgTGlzdEl0ZW1WaWV3IHtcbiAgY29uc3RydWN0b3IgKHByb3BzKSB7XG4gICAgdGhpcy5tb3VzZURvd24gPSB0aGlzLm1vdXNlRG93bi5iaW5kKHRoaXMpXG4gICAgdGhpcy5tb3VzZVVwID0gdGhpcy5tb3VzZVVwLmJpbmQodGhpcylcbiAgICB0aGlzLmRpZENsaWNrID0gdGhpcy5kaWRDbGljay5iaW5kKHRoaXMpXG4gICAgdGhpcy5zZWxlY3RlZCA9IHByb3BzLnNlbGVjdGVkXG4gICAgdGhpcy5vbmNsaWNrID0gcHJvcHMub25jbGlja1xuICAgIHRoaXMuZWxlbWVudCA9IHByb3BzLmVsZW1lbnRcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5tb3VzZURvd24pXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm1vdXNlVXApXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5kaWRDbGljaylcbiAgICBpZiAodGhpcy5zZWxlY3RlZCkge1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJylcbiAgICB9XG4gICAgdGhpcy5kb21FdmVudHNEaXNwb3NhYmxlID0gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMubW91c2VEb3duKVxuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm1vdXNlVXApXG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmRpZENsaWNrKVxuICAgIH0pXG4gICAgZXRjaC5nZXRTY2hlZHVsZXIoKS51cGRhdGVEb2N1bWVudCh0aGlzLnNjcm9sbEludG9WaWV3SWZOZWVkZWQuYmluZCh0aGlzKSlcbiAgfVxuXG4gIG1vdXNlRG93biAoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICBtb3VzZVVwICgpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICBkaWRDbGljayAoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgdGhpcy5vbmNsaWNrKClcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIGlmICh0aGlzLnNlbGVjdGVkKSB7XG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKVxuICAgIH1cbiAgICB0aGlzLmRvbUV2ZW50c0Rpc3Bvc2FibGUuZGlzcG9zZSgpXG4gIH1cblxuICB1cGRhdGUgKHByb3BzKSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudCAhPT0gcHJvcHMuZWxlbWVudCkge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMubW91c2VEb3duKVxuICAgICAgcHJvcHMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm1vdXNlRG93bilcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5tb3VzZVVwKVxuICAgICAgcHJvcHMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5tb3VzZVVwKVxuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5kaWRDbGljaylcbiAgICAgIHByb3BzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmRpZENsaWNrKVxuXG4gICAgICBwcm9wcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJylcbiAgICAgIGlmIChwcm9wcy5zZWxlY3RlZCkge1xuICAgICAgICBwcm9wcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJylcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQgJiYgIXByb3BzLnNlbGVjdGVkKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpXG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLnNlbGVjdGVkICYmIHByb3BzLnNlbGVjdGVkKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50ID0gcHJvcHMuZWxlbWVudFxuICAgIHRoaXMuc2VsZWN0ZWQgPSBwcm9wcy5zZWxlY3RlZFxuICAgIHRoaXMub25jbGljayA9IHByb3BzLm9uY2xpY2tcbiAgICBldGNoLmdldFNjaGVkdWxlcigpLnVwZGF0ZURvY3VtZW50KHRoaXMuc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZC5iaW5kKHRoaXMpKVxuICB9XG5cbiAgc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCAoKSB7XG4gICAgaWYgKHRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5zY3JvbGxJbnRvVmlld0lmTmVlZGVkKClcbiAgICB9XG4gIH1cbn1cbiJdfQ==