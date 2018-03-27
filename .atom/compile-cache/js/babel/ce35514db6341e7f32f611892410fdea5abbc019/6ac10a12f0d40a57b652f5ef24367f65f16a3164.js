Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sbEventKit = require('sb-event-kit');

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

var _viewList = require('./view-list');

var _viewList2 = _interopRequireDefault(_viewList);

var _providersList = require('./providers-list');

var _providersList2 = _interopRequireDefault(_providersList);

var _providersHighlight = require('./providers-highlight');

var _providersHighlight2 = _interopRequireDefault(_providersHighlight);

var Intentions = (function () {
  function Intentions() {
    var _this = this;

    _classCallCheck(this, Intentions);

    this.active = null;
    this.commands = new _commands2['default']();
    this.highlightCache = new WeakMap();
    this.providersList = new _providersList2['default']();
    this.providersHighlight = new _providersHighlight2['default']();
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.commands);
    this.subscriptions.add(this.providersList);
    this.subscriptions.add(this.providersHighlight);

    // eslint-disable-next-line arrow-parens
    this.commands.onListShow(_asyncToGenerator(function* (textEditor) {
      var results = undefined;
      var cached = _this.listCache.get(textEditor);
      var editorText = textEditor.getText();
      if (cached && cached.text === editorText) {
        results = cached.results;
      } else {
        results = yield _this.providersList.trigger(textEditor);
        if (results.length) {
          _this.listCache.set(textEditor, {
            text: editorText,
            results: results
          });
        }
      }
      if (!results.length) {
        return false;
      }

      var listView = new _viewList2['default']();
      var subscriptions = new _sbEventKit.CompositeDisposable();

      listView.activate(textEditor, results);
      listView.onDidSelect(function (intention) {
        intention.selected();
        subscriptions.dispose();
      });

      subscriptions.add(listView);
      subscriptions.add(function () {
        if (_this.active === subscriptions) {
          _this.active = null;
        }
      });
      subscriptions.add(_this.commands.onListMove(function (movement) {
        listView.move(movement);
      }));
      subscriptions.add(_this.commands.onListConfirm(function () {
        listView.select();
      }));
      subscriptions.add(_this.commands.onListHide(function () {
        subscriptions.dispose();
      }));
      _this.active = subscriptions;
      return true;
    }));
    // eslint-disable-next-line arrow-parens
    this.commands.onHighlightsShow(_asyncToGenerator(function* (textEditor) {
      var results = undefined;
      var cached = _this.highlightCache.get(textEditor);
      var editorText = textEditor.getText();
      if (cached && cached.text === editorText) {
        results = cached.results;
      } else {
        results = yield _this.providersHighlight.trigger(textEditor);
        if (results.length) {
          _this.highlightCache.set(textEditor, {
            text: editorText,
            results: results
          });
        }
      }
      if (!results.length) {
        return false;
      }

      var painted = _this.providersHighlight.paint(textEditor, results);
      var subscriptions = new _sbEventKit.CompositeDisposable();

      subscriptions.add(function () {
        if (_this.active === subscriptions) {
          _this.active = null;
        }
      });
      subscriptions.add(_this.commands.onHighlightsHide(function () {
        subscriptions.dispose();
      }));
      subscriptions.add(painted);
      _this.active = subscriptions;

      return true;
    }));
  }

  _createClass(Intentions, [{
    key: 'activate',
    value: function activate() {
      this.commands.activate();
    }
  }, {
    key: 'consumeListProvider',
    value: function consumeListProvider(provider) {
      this.providersList.addProvider(provider);
    }
  }, {
    key: 'deleteListProvider',
    value: function deleteListProvider(provider) {
      this.providersList.deleteProvider(provider);
    }
  }, {
    key: 'consumeHighlightProvider',
    value: function consumeHighlightProvider(provider) {
      this.providersHighlight.addProvider(provider);
    }
  }, {
    key: 'deleteHighlightProvider',
    value: function deleteHighlightProvider(provider) {
      this.providersHighlight.deleteProvider(provider);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
      if (this.active) {
        this.active.dispose();
      }
    }
  }]);

  return Intentions;
})();

exports['default'] = Intentions;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9pbnRlbnRpb25zL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OzswQkFFZ0QsY0FBYzs7d0JBRXpDLFlBQVk7Ozs7d0JBQ1osYUFBYTs7Ozs2QkFDUixrQkFBa0I7Ozs7a0NBQ2IsdUJBQXVCOzs7O0lBR2pDLFVBQVU7QUFRbEIsV0FSUSxVQUFVLEdBUWY7OzswQkFSSyxVQUFVOztBQVMzQixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtBQUNsQixRQUFJLENBQUMsUUFBUSxHQUFHLDJCQUFjLENBQUE7QUFDOUIsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFBO0FBQ25DLFFBQUksQ0FBQyxhQUFhLEdBQUcsZ0NBQW1CLENBQUE7QUFDeEMsUUFBSSxDQUFDLGtCQUFrQixHQUFHLHFDQUF3QixDQUFBO0FBQ2xELFFBQUksQ0FBQyxhQUFhLEdBQUcscUNBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUNyQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDMUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUE7OztBQUcvQyxRQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsbUJBQUMsV0FBTyxVQUFVLEVBQUs7QUFDN0MsVUFBSSxPQUFPLFlBQUEsQ0FBQTtBQUNYLFVBQU0sTUFBTSxHQUFHLE1BQUssU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUM3QyxVQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDdkMsVUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7QUFDeEMsZUFB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b3dlbnMvLmF0b20vcGFja2FnZXMvaW50ZW50aW9ucy9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGUgfSBmcm9tICdzYi1ldmVudC1raXQnXG5cbmltcG9ydCBDb21tYW5kcyBmcm9tICcuL2NvbW1hbmRzJ1xuaW1wb3J0IExpc3RWaWV3IGZyb20gJy4vdmlldy1saXN0J1xuaW1wb3J0IFByb3ZpZGVyc0xpc3QgZnJvbSAnLi9wcm92aWRlcnMtbGlzdCdcbmltcG9ydCBQcm92aWRlcnNIaWdobGlnaHQgZnJvbSAnLi9wcm92aWRlcnMtaGlnaGxpZ2h0J1xuaW1wb3J0IHR5cGUgeyBMaXN0UHJvdmlkZXIsIEhpZ2hsaWdodFByb3ZpZGVyLCBIaWdobGlnaHRJdGVtLCBMaXN0SXRlbSB9IGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludGVudGlvbnMge1xuICBhY3RpdmU6ID9EaXNwb3NhYmxlO1xuICBjb21tYW5kczogQ29tbWFuZHM7XG4gIGxpc3RDYWNoZTogV2Vha01hcDxPYmplY3QsIHsgdGV4dDogc3RyaW5nLCByZXN1bHRzOiBBcnJheTxMaXN0SXRlbT4gfT5cbiAgaGlnaGxpZ2h0Q2FjaGU6IFdlYWtNYXA8T2JqZWN0LCB7IHRleHQ6IHN0cmluZywgcmVzdWx0czogQXJyYXk8SGlnaGxpZ2h0SXRlbT4gfT5cbiAgcHJvdmlkZXJzTGlzdDogUHJvdmlkZXJzTGlzdDtcbiAgcHJvdmlkZXJzSGlnaGxpZ2h0OiBQcm92aWRlcnNIaWdobGlnaHQ7XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYWN0aXZlID0gbnVsbFxuICAgIHRoaXMuY29tbWFuZHMgPSBuZXcgQ29tbWFuZHMoKVxuICAgIHRoaXMuaGlnaGxpZ2h0Q2FjaGUgPSBuZXcgV2Vha01hcCgpXG4gICAgdGhpcy5wcm92aWRlcnNMaXN0ID0gbmV3IFByb3ZpZGVyc0xpc3QoKVxuICAgIHRoaXMucHJvdmlkZXJzSGlnaGxpZ2h0ID0gbmV3IFByb3ZpZGVyc0hpZ2hsaWdodCgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmNvbW1hbmRzKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5wcm92aWRlcnNMaXN0KVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5wcm92aWRlcnNIaWdobGlnaHQpXG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgYXJyb3ctcGFyZW5zXG4gICAgdGhpcy5jb21tYW5kcy5vbkxpc3RTaG93KGFzeW5jICh0ZXh0RWRpdG9yKSA9PiB7XG4gICAgICBsZXQgcmVzdWx0c1xuICAgICAgY29uc3QgY2FjaGVkID0gdGhpcy5saXN0Q2FjaGUuZ2V0KHRleHRFZGl0b3IpXG4gICAgICBjb25zdCBlZGl0b3JUZXh0ID0gdGV4dEVkaXRvci5nZXRUZXh0KClcbiAgICAgIGlmIChjYWNoZWQgJiYgY2FjaGVkLnRleHQgPT09IGVkaXRvclRleHQpIHtcbiAgICAgICAgcmVzdWx0cyA9IGNhY2hlZC5yZXN1bHRzXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRzID0gYXdhaXQgdGhpcy5wcm92aWRlcnNMaXN0LnRyaWdnZXIodGV4dEVkaXRvcilcbiAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5saXN0Q2FjaGUuc2V0KHRleHRFZGl0b3IsIHtcbiAgICAgICAgICAgIHRleHQ6IGVkaXRvclRleHQsXG4gICAgICAgICAgICByZXN1bHRzLFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghcmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGxpc3RWaWV3ID0gbmV3IExpc3RWaWV3KClcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICAgIGxpc3RWaWV3LmFjdGl2YXRlKHRleHRFZGl0b3IsIHJlc3VsdHMpXG4gICAgICBsaXN0Vmlldy5vbkRpZFNlbGVjdChmdW5jdGlvbihpbnRlbnRpb24pIHtcbiAgICAgICAgaW50ZW50aW9uLnNlbGVjdGVkKClcbiAgICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgIH0pXG5cbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKGxpc3RWaWV3KVxuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hY3RpdmUgPT09IHN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZSA9IG51bGxcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuY29tbWFuZHMub25MaXN0TW92ZShmdW5jdGlvbihtb3ZlbWVudCkge1xuICAgICAgICBsaXN0Vmlldy5tb3ZlKG1vdmVtZW50KVxuICAgICAgfSkpXG4gICAgICBzdWJzY3JpcHRpb25zLmFkZCh0aGlzLmNvbW1hbmRzLm9uTGlzdENvbmZpcm0oZnVuY3Rpb24oKSB7XG4gICAgICAgIGxpc3RWaWV3LnNlbGVjdCgpXG4gICAgICB9KSlcbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuY29tbWFuZHMub25MaXN0SGlkZShmdW5jdGlvbigpIHtcbiAgICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgIH0pKVxuICAgICAgdGhpcy5hY3RpdmUgPSBzdWJzY3JpcHRpb25zXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0pXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGFycm93LXBhcmVuc1xuICAgIHRoaXMuY29tbWFuZHMub25IaWdobGlnaHRzU2hvdyhhc3luYyAodGV4dEVkaXRvcikgPT4ge1xuICAgICAgbGV0IHJlc3VsdHNcbiAgICAgIGNvbnN0IGNhY2hlZCA9IHRoaXMuaGlnaGxpZ2h0Q2FjaGUuZ2V0KHRleHRFZGl0b3IpXG4gICAgICBjb25zdCBlZGl0b3JUZXh0ID0gdGV4dEVkaXRvci5nZXRUZXh0KClcbiAgICAgIGlmIChjYWNoZWQgJiYgY2FjaGVkLnRleHQgPT09IGVkaXRvclRleHQpIHtcbiAgICAgICAgcmVzdWx0cyA9IGNhY2hlZC5yZXN1bHRzXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRzID0gYXdhaXQgdGhpcy5wcm92aWRlcnNIaWdobGlnaHQudHJpZ2dlcih0ZXh0RWRpdG9yKVxuICAgICAgICBpZiAocmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodENhY2hlLnNldCh0ZXh0RWRpdG9yLCB7XG4gICAgICAgICAgICB0ZXh0OiBlZGl0b3JUZXh0LFxuICAgICAgICAgICAgcmVzdWx0cyxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIXJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuXG4gICAgICBjb25zdCBwYWludGVkID0gdGhpcy5wcm92aWRlcnNIaWdobGlnaHQucGFpbnQodGV4dEVkaXRvciwgcmVzdWx0cylcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSBzdWJzY3JpcHRpb25zKSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBzdWJzY3JpcHRpb25zLmFkZCh0aGlzLmNvbW1hbmRzLm9uSGlnaGxpZ2h0c0hpZGUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgICB9KSlcbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKHBhaW50ZWQpXG4gICAgICB0aGlzLmFjdGl2ZSA9IHN1YnNjcmlwdGlvbnNcblxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxuICB9XG4gIGFjdGl2YXRlKCkge1xuICAgIHRoaXMuY29tbWFuZHMuYWN0aXZhdGUoKVxuICB9XG4gIGNvbnN1bWVMaXN0UHJvdmlkZXIocHJvdmlkZXI6IExpc3RQcm92aWRlcikge1xuICAgIHRoaXMucHJvdmlkZXJzTGlzdC5hZGRQcm92aWRlcihwcm92aWRlcilcbiAgfVxuICBkZWxldGVMaXN0UHJvdmlkZXIocHJvdmlkZXI6IExpc3RQcm92aWRlcikge1xuICAgIHRoaXMucHJvdmlkZXJzTGlzdC5kZWxldGVQcm92aWRlcihwcm92aWRlcilcbiAgfVxuICBjb25zdW1lSGlnaGxpZ2h0UHJvdmlkZXIocHJvdmlkZXI6IEhpZ2hsaWdodFByb3ZpZGVyKSB7XG4gICAgdGhpcy5wcm92aWRlcnNIaWdobGlnaHQuYWRkUHJvdmlkZXIocHJvdmlkZXIpXG4gIH1cbiAgZGVsZXRlSGlnaGxpZ2h0UHJvdmlkZXIocHJvdmlkZXI6IEhpZ2hsaWdodFByb3ZpZGVyKSB7XG4gICAgdGhpcy5wcm92aWRlcnNIaWdobGlnaHQuZGVsZXRlUHJvdmlkZXIocHJvdmlkZXIpXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICB0aGlzLmFjdGl2ZS5kaXNwb3NlKClcbiAgICB9XG4gIH1cbn1cbiJdfQ==