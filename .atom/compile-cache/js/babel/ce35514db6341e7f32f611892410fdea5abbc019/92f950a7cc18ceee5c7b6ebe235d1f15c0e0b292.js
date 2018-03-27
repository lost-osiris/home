Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.provideLinter = provideLinter;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies

var _atom = require('atom');

var _fs = require('fs');

var _path = require('path');

'use babel';

var lazyReq = require('lazy-req')(require);

var _lazyReq = lazyReq('atom-linter')('findAsync', 'generateRange');

var findAsync = _lazyReq.findAsync;
var generateRange = _lazyReq.generateRange;

var stripJSONComments = lazyReq('strip-json-comments');
var tinyPromisify = lazyReq('tiny-promisify');

var grammarScopes = [];

var subscriptions = undefined;

function activate() {
  require('atom-package-deps').install('linter-htmlhint');

  subscriptions = new _atom.CompositeDisposable();
  subscriptions.add(atom.config.observe('linter-htmlhint.enabledScopes', function (scopes) {
    // Remove any old scopes
    grammarScopes.splice(0, grammarScopes.length);
    // Add the current scopes
    Array.prototype.push.apply(grammarScopes, scopes);
  }));
}

function deactivate() {
  subscriptions.dispose();
}

var getConfig = _asyncToGenerator(function* (filePath) {
  var readFile = tinyPromisify()(_fs.readFile);
  var configPath = yield findAsync((0, _path.dirname)(filePath), '.htmlhintrc');
  var conf = null;
  if (configPath !== null) {
    conf = yield readFile(configPath, 'utf8');
  }
  if (conf) {
    return JSON.parse(stripJSONComments()(conf));
  }
  return null;
});

function provideLinter() {
  return {
    name: 'htmlhint',
    grammarScopes: grammarScopes,
    scope: 'file',
    lintOnFly: true,
    lint: _asyncToGenerator(function* (editor) {
      var _require = require('htmlhint');

      var HTMLHint = _require.HTMLHint;

      var fileText = editor.getText();
      var filePath = editor.getPath();

      if (!fileText) {
        return [];
      }

      var ruleset = yield getConfig(filePath);

      var messages = HTMLHint.verify(fileText, ruleset || undefined);

      if (editor.getText() !== fileText) {
        // Editor contents have changed, tell Linter not to update
        return null;
      }

      return messages.map(function (message) {
        return {
          range: generateRange(editor, message.line - 1, message.col - 1),
          type: message.type,
          text: message.message,
          filePath: filePath
        };
      });
    })
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9saW50ZXItaHRtbGhpbnQvbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O29CQUdvQyxNQUFNOztrQkFDSCxJQUFJOztvQkFDbkIsTUFBTTs7QUFMOUIsV0FBVyxDQUFDOztBQU9aLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7ZUFFUixPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsV0FBVyxFQUFFLGVBQWUsQ0FBQzs7SUFBakYsU0FBUyxZQUFULFNBQVM7SUFBRSxhQUFhLFlBQWIsYUFBYTs7QUFDaEMsSUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN6RCxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7QUFFaEQsSUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDOztBQUV6QixJQUFJLGFBQWEsWUFBQSxDQUFDOztBQUVYLFNBQVMsUUFBUSxHQUFHO0FBQ3pCLFNBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDOztBQUV4RCxlQUFhLEdBQUcsK0JBQXlCLENBQUM7QUFDMUMsZUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsRUFBRSxVQUFDLE1BQU0sRUFBSzs7QUFFakYsaUJBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFOUMsU0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztHQUNuRCxDQUFDLENBQUMsQ0FBQztDQUNMOztBQUVNLFNBQVMsVUFBVSxHQUFHO0FBQzNCLGVBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztDQUN6Qjs7QUFFRCxJQUFNLFNBQVMscUJBQUcsV0FBTyxRQUFRLEVBQUs7QUFDcEMsTUFBTSxRQUFRLEdBQUcsYUFBYSxFQUFFLGNBQVksQ0FBQztBQUM3QyxNQUFNLFVBQVUsR0FBRyxNQUFNLFNBQVMsQ0FBQyxtQkFBUSxRQUFRLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUNyRSxNQUFJLElBQUksR0FBRyxJQUFJLENBQUM7QUFDaEIsTUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO0FBQ3ZCLFFBQUksR0FBRyxNQUFNLFFBQVEsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7R0FDM0M7QUFDRCxNQUFJLElBQUksRUFBRTtBQUNSLFdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7R0FDOUM7QUFDRCxTQUFPLElBQUksQ0FBQztDQUNiLENBQUEsQ0FBQzs7QUFFSyxTQUFTLGFBQWEsR0FBRztBQUM5QixTQUFPO0FBQ0wsUUFBSSxFQUFFLFVBQVU7QUFDaEIsaUJBQWEsRUFBYixhQUFhO0FBQ2IsU0FBSyxFQUFFLE1BQU07QUFDYixhQUFTLEVBQUUsSUFBSTtBQUNmLFFBQUksb0JBQUUsV0FBTyxNQUFNLEVBQUs7cUJBQ0QsT0FBTyxDQUFDLFVBQVUsQ0FBQzs7VUFBaEMsUUFBUSxZQUFSLFFBQVE7O0FBRWhCLFVBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxVQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRWxDLFVBQUksQ0FBQyxRQUFRLEVBQUU7QUFDYixlQUFPLEVBQUUsQ0FBQztPQUNYOztBQUVELFVBQU0sT0FBTyxHQUFHLE1BQU0sU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUUxQyxVQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxPQUFPLElBQUksU0FBUyxDQUFDLENBQUM7O0FBRWpFLFVBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLFFBQVEsRUFBRTs7QUFFakMsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFFRCxhQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxPQUFPO2VBQUs7QUFDOUIsZUFBSyxFQUFFLGFBQWEsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDL0QsY0FBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO0FBQ2xCLGNBQUksRUFBRSxPQUFPLENBQUMsT0FBTztBQUNyQixrQkFBUSxFQUFSLFFBQVE7U0FDVDtPQUFDLENBQUMsQ0FBQztLQUNMLENBQUE7R0FDRixDQUFDO0NBQ0giLCJmaWxlIjoiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1odG1saGludC9saWIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9leHRlbnNpb25zLCBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXNcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcbmltcG9ydCB7IHJlYWRGaWxlIGFzIGZzUmVhZEZpbGUgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyBkaXJuYW1lIH0gZnJvbSAncGF0aCc7XG5cbmNvbnN0IGxhenlSZXEgPSByZXF1aXJlKCdsYXp5LXJlcScpKHJlcXVpcmUpO1xuXG5jb25zdCB7IGZpbmRBc3luYywgZ2VuZXJhdGVSYW5nZSB9ID0gbGF6eVJlcSgnYXRvbS1saW50ZXInKSgnZmluZEFzeW5jJywgJ2dlbmVyYXRlUmFuZ2UnKTtcbmNvbnN0IHN0cmlwSlNPTkNvbW1lbnRzID0gbGF6eVJlcSgnc3RyaXAtanNvbi1jb21tZW50cycpO1xuY29uc3QgdGlueVByb21pc2lmeSA9IGxhenlSZXEoJ3RpbnktcHJvbWlzaWZ5Jyk7XG5cbmNvbnN0IGdyYW1tYXJTY29wZXMgPSBbXTtcblxubGV0IHN1YnNjcmlwdGlvbnM7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcbiAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdsaW50ZXItaHRtbGhpbnQnKTtcblxuICBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWh0bWxoaW50LmVuYWJsZWRTY29wZXMnLCAoc2NvcGVzKSA9PiB7XG4gICAgLy8gUmVtb3ZlIGFueSBvbGQgc2NvcGVzXG4gICAgZ3JhbW1hclNjb3Blcy5zcGxpY2UoMCwgZ3JhbW1hclNjb3Blcy5sZW5ndGgpO1xuICAgIC8vIEFkZCB0aGUgY3VycmVudCBzY29wZXNcbiAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShncmFtbWFyU2NvcGVzLCBzY29wZXMpO1xuICB9KSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbn1cblxuY29uc3QgZ2V0Q29uZmlnID0gYXN5bmMgKGZpbGVQYXRoKSA9PiB7XG4gIGNvbnN0IHJlYWRGaWxlID0gdGlueVByb21pc2lmeSgpKGZzUmVhZEZpbGUpO1xuICBjb25zdCBjb25maWdQYXRoID0gYXdhaXQgZmluZEFzeW5jKGRpcm5hbWUoZmlsZVBhdGgpLCAnLmh0bWxoaW50cmMnKTtcbiAgbGV0IGNvbmYgPSBudWxsO1xuICBpZiAoY29uZmlnUGF0aCAhPT0gbnVsbCkge1xuICAgIGNvbmYgPSBhd2FpdCByZWFkRmlsZShjb25maWdQYXRoLCAndXRmOCcpO1xuICB9XG4gIGlmIChjb25mKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2Uoc3RyaXBKU09OQ29tbWVudHMoKShjb25mKSk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUxpbnRlcigpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnaHRtbGhpbnQnLFxuICAgIGdyYW1tYXJTY29wZXMsXG4gICAgc2NvcGU6ICdmaWxlJyxcbiAgICBsaW50T25GbHk6IHRydWUsXG4gICAgbGludDogYXN5bmMgKGVkaXRvcikgPT4ge1xuICAgICAgY29uc3QgeyBIVE1MSGludCB9ID0gcmVxdWlyZSgnaHRtbGhpbnQnKTtcblxuICAgICAgY29uc3QgZmlsZVRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpO1xuICAgICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuXG4gICAgICBpZiAoIWZpbGVUZXh0KSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcnVsZXNldCA9IGF3YWl0IGdldENvbmZpZyhmaWxlUGF0aCk7XG5cbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gSFRNTEhpbnQudmVyaWZ5KGZpbGVUZXh0LCBydWxlc2V0IHx8IHVuZGVmaW5lZCk7XG5cbiAgICAgIGlmIChlZGl0b3IuZ2V0VGV4dCgpICE9PSBmaWxlVGV4dCkge1xuICAgICAgICAvLyBFZGl0b3IgY29udGVudHMgaGF2ZSBjaGFuZ2VkLCB0ZWxsIExpbnRlciBub3QgdG8gdXBkYXRlXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbWVzc2FnZXMubWFwKG1lc3NhZ2UgPT4gKHtcbiAgICAgICAgcmFuZ2U6IGdlbmVyYXRlUmFuZ2UoZWRpdG9yLCBtZXNzYWdlLmxpbmUgLSAxLCBtZXNzYWdlLmNvbCAtIDEpLFxuICAgICAgICB0eXBlOiBtZXNzYWdlLnR5cGUsXG4gICAgICAgIHRleHQ6IG1lc3NhZ2UubWVzc2FnZSxcbiAgICAgICAgZmlsZVBhdGhcbiAgICAgIH0pKTtcbiAgICB9XG4gIH07XG59XG4iXX0=