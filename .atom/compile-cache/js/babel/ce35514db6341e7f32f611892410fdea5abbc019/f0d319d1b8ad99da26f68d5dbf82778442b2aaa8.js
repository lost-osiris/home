function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

var idleCallbacks = new Set();

var linterUiDefault = {
  instances: new Set(),
  signalRegistry: null,
  statusBarRegistry: null,
  activate: function activate() {
    if (atom.config.get('linter-ui-default.useBusySignal')) {
      // This is a necessary evil, see steelbrain/linter#1355
      atom.packages.getLoadedPackage('linter-ui-default').metadata['package-deps'].push('busy-signal');
    }

    var callbackID = window.requestIdleCallback(function installLinterUIDefaultDeps() {
      idleCallbacks['delete'](callbackID);
      if (!atom.inSpecMode()) {
        // eslint-disable-next-line global-require
        require('atom-package-deps').install('linter-ui-default');
      }
    });
    idleCallbacks.add(callbackID);
  },
  deactivate: function deactivate() {
    idleCallbacks.forEach(function (callbackID) {
      return window.cancelIdleCallback(callbackID);
    });
    idleCallbacks.clear();
    for (var entry of this.instances) {
      entry.dispose();
    }
    this.instances.clear();
  },
  provideUI: function provideUI() {
    var instance = new _main2['default']();
    this.instances.add(instance);
    if (this.signalRegistry) {
      instance.signal.attach(this.signalRegistry);
    }
    return instance;
  },
  provideIntentions: function provideIntentions() {
    return Array.from(this.instances).map(function (entry) {
      return entry.intentions;
    });
  },
  consumeSignal: function consumeSignal(signalRegistry) {
    this.signalRegistry = signalRegistry;
    this.instances.forEach(function (instance) {
      instance.signal.attach(signalRegistry);
    });
  },
  consumeStatusBar: function consumeStatusBar(statusBarRegistry) {
    this.statusBarRegistry = statusBarRegistry;
    this.instances.forEach(function (instance) {
      instance.statusBar.attach(statusBarRegistry);
    });
  }
};

module.exports = linterUiDefault;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7b0JBRXFCLFFBQVE7Ozs7QUFHN0IsSUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTs7QUFFL0IsSUFBTSxlQUFlLEdBQUc7QUFDdEIsV0FBUyxFQUFFLElBQUksR0FBRyxFQUFFO0FBQ3BCLGdCQUFjLEVBQUUsSUFBSTtBQUNwQixtQkFBaUIsRUFBRSxJQUFJO0FBQ3ZCLFVBQVEsRUFBQSxvQkFBRztBQUNULFFBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLENBQUMsRUFBRTs7QUFFdEQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7S0FDakc7O0FBRUQsUUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsMEJBQTBCLEdBQUc7QUFDbEYsbUJBQWEsVUFBTyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ2hDLFVBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7O0FBRXRCLGVBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO09BQzFEO0tBQ0YsQ0FBQyxDQUFBO0FBQ0YsaUJBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7R0FDOUI7QUFDRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxpQkFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFVBQVU7YUFBSSxNQUFNLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDO0tBQUEsQ0FBQyxDQUFBO0FBQzFFLGlCQUFhLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDckIsU0FBSyxJQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2xDLFdBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUNoQjtBQUNELFFBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUE7R0FDdkI7QUFDRCxXQUFTLEVBQUEscUJBQWE7QUFDcEIsUUFBTSxRQUFRLEdBQUcsdUJBQWMsQ0FBQTtBQUMvQixRQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM1QixRQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDdkIsY0FBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFBO0tBQzVDO0FBQ0QsV0FBTyxRQUFRLENBQUE7R0FDaEI7QUFDRCxtQkFBaUIsRUFBQSw2QkFBc0I7QUFDckMsV0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO2FBQUksS0FBSyxDQUFDLFVBQVU7S0FBQSxDQUFDLENBQUE7R0FDakU7QUFDRCxlQUFhLEVBQUEsdUJBQUMsY0FBc0IsRUFBRTtBQUNwQyxRQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQTtBQUNwQyxRQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFTLFFBQVEsRUFBRTtBQUN4QyxjQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQTtLQUN2QyxDQUFDLENBQUE7R0FDSDtBQUNELGtCQUFnQixFQUFBLDBCQUFDLGlCQUF5QixFQUFFO0FBQzFDLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQTtBQUMxQyxRQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFTLFFBQVEsRUFBRTtBQUN4QyxjQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0tBQzdDLENBQUMsQ0FBQTtHQUNIO0NBQ0YsQ0FBQTs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQSIsImZpbGUiOiIvaG9tZS9tb3dlbnMvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IExpbnRlclVJIGZyb20gJy4vbWFpbidcbmltcG9ydCB0eXBlIEludGVudGlvbnMgZnJvbSAnLi9pbnRlbnRpb25zJ1xuXG5jb25zdCBpZGxlQ2FsbGJhY2tzID0gbmV3IFNldCgpXG5cbmNvbnN0IGxpbnRlclVpRGVmYXVsdCA9IHtcbiAgaW5zdGFuY2VzOiBuZXcgU2V0KCksXG4gIHNpZ25hbFJlZ2lzdHJ5OiBudWxsLFxuICBzdGF0dXNCYXJSZWdpc3RyeTogbnVsbCxcbiAgYWN0aXZhdGUoKSB7XG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnbGludGVyLXVpLWRlZmF1bHQudXNlQnVzeVNpZ25hbCcpKSB7XG4gICAgICAvLyBUaGlzIGlzIGEgbmVjZXNzYXJ5IGV2aWwsIHNlZSBzdGVlbGJyYWluL2xpbnRlciMxMzU1XG4gICAgICBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoJ2xpbnRlci11aS1kZWZhdWx0JykubWV0YWRhdGFbJ3BhY2thZ2UtZGVwcyddLnB1c2goJ2J1c3ktc2lnbmFsJylcbiAgICB9XG5cbiAgICBjb25zdCBjYWxsYmFja0lEID0gd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2soZnVuY3Rpb24gaW5zdGFsbExpbnRlclVJRGVmYXVsdERlcHMoKSB7XG4gICAgICBpZGxlQ2FsbGJhY2tzLmRlbGV0ZShjYWxsYmFja0lEKVxuICAgICAgaWYgKCFhdG9tLmluU3BlY01vZGUoKSkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZ2xvYmFsLXJlcXVpcmVcbiAgICAgICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdsaW50ZXItdWktZGVmYXVsdCcpXG4gICAgICB9XG4gICAgfSlcbiAgICBpZGxlQ2FsbGJhY2tzLmFkZChjYWxsYmFja0lEKVxuICB9LFxuICBkZWFjdGl2YXRlKCkge1xuICAgIGlkbGVDYWxsYmFja3MuZm9yRWFjaChjYWxsYmFja0lEID0+IHdpbmRvdy5jYW5jZWxJZGxlQ2FsbGJhY2soY2FsbGJhY2tJRCkpXG4gICAgaWRsZUNhbGxiYWNrcy5jbGVhcigpXG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLmluc3RhbmNlcykge1xuICAgICAgZW50cnkuZGlzcG9zZSgpXG4gICAgfVxuICAgIHRoaXMuaW5zdGFuY2VzLmNsZWFyKClcbiAgfSxcbiAgcHJvdmlkZVVJKCk6IExpbnRlclVJIHtcbiAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBMaW50ZXJVSSgpXG4gICAgdGhpcy5pbnN0YW5jZXMuYWRkKGluc3RhbmNlKVxuICAgIGlmICh0aGlzLnNpZ25hbFJlZ2lzdHJ5KSB7XG4gICAgICBpbnN0YW5jZS5zaWduYWwuYXR0YWNoKHRoaXMuc2lnbmFsUmVnaXN0cnkpXG4gICAgfVxuICAgIHJldHVybiBpbnN0YW5jZVxuICB9LFxuICBwcm92aWRlSW50ZW50aW9ucygpOiBBcnJheTxJbnRlbnRpb25zPiB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5pbnN0YW5jZXMpLm1hcChlbnRyeSA9PiBlbnRyeS5pbnRlbnRpb25zKVxuICB9LFxuICBjb25zdW1lU2lnbmFsKHNpZ25hbFJlZ2lzdHJ5OiBPYmplY3QpIHtcbiAgICB0aGlzLnNpZ25hbFJlZ2lzdHJ5ID0gc2lnbmFsUmVnaXN0cnlcbiAgICB0aGlzLmluc3RhbmNlcy5mb3JFYWNoKGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gICAgICBpbnN0YW5jZS5zaWduYWwuYXR0YWNoKHNpZ25hbFJlZ2lzdHJ5KVxuICAgIH0pXG4gIH0sXG4gIGNvbnN1bWVTdGF0dXNCYXIoc3RhdHVzQmFyUmVnaXN0cnk6IE9iamVjdCkge1xuICAgIHRoaXMuc3RhdHVzQmFyUmVnaXN0cnkgPSBzdGF0dXNCYXJSZWdpc3RyeVxuICAgIHRoaXMuaW5zdGFuY2VzLmZvckVhY2goZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgICAgIGluc3RhbmNlLnN0YXR1c0Jhci5hdHRhY2goc3RhdHVzQmFyUmVnaXN0cnkpXG4gICAgfSlcbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaW50ZXJVaURlZmF1bHRcbiJdfQ==