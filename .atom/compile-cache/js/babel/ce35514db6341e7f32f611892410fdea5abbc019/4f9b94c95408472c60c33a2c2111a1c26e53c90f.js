function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _atom = require('atom');

var _jasmineFix = require('jasmine-fix');

var _libEditor = require('../lib/editor');

var _libEditor2 = _interopRequireDefault(_libEditor);

var _helpers = require('./helpers');

describe('Editor', function () {
  var editor = undefined;
  var message = undefined;
  var textEditor = undefined;

  (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
    message = (0, _helpers.getMessage)();
    message.range = [[2, 0], [2, 1]];
    message.filePath = __filename;
    yield atom.workspace.open(__filename);
    textEditor = atom.workspace.getActiveTextEditor();
    editor = new _libEditor2['default'](textEditor);
    atom.packages.loadPackage('linter-ui-default');
  }));
  afterEach(function () {
    editor.dispose();
    atom.workspace.destroyActivePaneItem();
  });

  describe('apply', function () {
    it('applies the messages to the editor', function () {
      expect(textEditor.getBuffer().getMarkerCount()).toBe(0);
      editor.apply([message], []);
      expect(textEditor.getBuffer().getMarkerCount()).toBe(1);
      editor.apply([], [message]);
      expect(textEditor.getBuffer().getMarkerCount()).toBe(0);
    });
    it('makes sure that the message is updated if text is manipulated', function () {
      expect(textEditor.getBuffer().getMarkerCount()).toBe(0);
      editor.apply([message], []);
      expect(textEditor.getBuffer().getMarkerCount()).toBe(1);
      expect(_atom.Range.fromObject(message.range)).toEqual({ start: { row: 2, column: 0 }, end: { row: 2, column: 1 } });
      textEditor.getBuffer().insert([2, 0], 'Hello');
      expect(_atom.Range.fromObject(message.range)).toEqual({ start: { row: 2, column: 0 }, end: { row: 2, column: 6 } });
      editor.apply([], [message]);
      expect(_atom.Range.fromObject(message.range)).toEqual({ start: { row: 2, column: 0 }, end: { row: 2, column: 6 } });
      expect(textEditor.getBuffer().getMarkerCount()).toBe(0);
    });
  });
  describe('Response to config', function () {
    it('responds to `gutterPosition`', function () {
      atom.config.set('linter-ui-default.gutterPosition', 'Left');
      expect(editor.gutter && editor.gutter.priority).toBe(-100);
      atom.config.set('linter-ui-default.gutterPosition', 'Right');
      expect(editor.gutter && editor.gutter.priority).toBe(100);
    });
    it('responds to `showDecorations`', function () {
      atom.config.set('linter-ui-default.showDecorations', false);
      expect(editor.gutter).toBe(null);
      atom.config.set('linter-ui-default.showDecorations', true);
      expect(editor.gutter).not.toBe(null);
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9zcGVjL2VkaXRvci1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBRXNCLE1BQU07OzBCQUNELGFBQWE7O3lCQUNyQixlQUFlOzs7O3VCQUNQLFdBQVc7O0FBRXRDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsWUFBVztBQUM1QixNQUFJLE1BQU0sWUFBQSxDQUFBO0FBQ1YsTUFBSSxPQUFPLFlBQUEsQ0FBQTtBQUNYLE1BQUksVUFBVSxZQUFBLENBQUE7O0FBRWQsZ0RBQVcsYUFBaUI7QUFDMUIsV0FBTyxHQUFHLDBCQUFZLENBQUE7QUFDdEIsV0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDaEMsV0FBTyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUE7QUFDN0IsVUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUNyQyxjQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO0FBQ2pELFVBQU0sR0FBRywyQkFBVyxVQUFVLENBQUMsQ0FBQTtBQUMvQixRQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0dBQy9DLEVBQUMsQ0FBQTtBQUNGLFdBQVMsQ0FBQyxZQUFXO0FBQ25CLFVBQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUNoQixRQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUE7R0FDdkMsQ0FBQyxDQUFBOztBQUVGLFVBQVEsQ0FBQyxPQUFPLEVBQUUsWUFBVztBQUMzQixNQUFFLENBQUMsb0NBQW9DLEVBQUUsWUFBVztBQUNsRCxZQUFNLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFD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TSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUMxRCxDQUFDLENBQUE7QUFDRixNQUFFLENBQUMsK0JBQStCLEVBQUUsWUFBVztBQUM3QyxVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUMzRCxZQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNoQyxVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUMxRCxZQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDckMsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9zcGVjL2VkaXRvci1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgUmFuZ2UgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHsgYmVmb3JlRWFjaCB9IGZyb20gJ2phc21pbmUtZml4J1xuaW1wb3J0IEVkaXRvciBmcm9tICcuLi9saWIvZWRpdG9yJ1xuaW1wb3J0IHsgZ2V0TWVzc2FnZSB9IGZyb20gJy4vaGVscGVycydcblxuZGVzY3JpYmUoJ0VkaXRvcicsIGZ1bmN0aW9uKCkge1xuICBsZXQgZWRpdG9yXG4gIGxldCBtZXNzYWdlXG4gIGxldCB0ZXh0RWRpdG9yXG5cbiAgYmVmb3JlRWFjaChhc3luYyBmdW5jdGlvbigpIHtcbiAgICBtZXNzYWdlID0gZ2V0TWVzc2FnZSgpXG4gICAgbWVzc2FnZS5yYW5nZSA9IFtbMiwgMF0sIFsyLCAxXV1cbiAgICBtZXNzYWdlLmZpbGVQYXRoID0gX19maWxlbmFtZVxuICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oX19maWxlbmFtZSlcbiAgICB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgZWRpdG9yID0gbmV3IEVkaXRvcih0ZXh0RWRpdG9yKVxuICAgIGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoJ2xpbnRlci11aS1kZWZhdWx0JylcbiAgfSlcbiAgYWZ0ZXJFYWNoKGZ1bmN0aW9uKCkge1xuICAgIGVkaXRvci5kaXNwb3NlKClcbiAgICBhdG9tLndvcmtzcGFjZS5kZXN0cm95QWN0aXZlUGFuZUl0ZW0oKVxuICB9KVxuXG4gIGRlc2NyaWJlKCdhcHBseScsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdhcHBsaWVzIHRoZSBtZXNzYWdlcyB0byB0aGUgZWRpdG9yJywgZnVuY3Rpb24oKSB7XG4gICAgICBleHBlY3QodGV4dEVkaXRvci5nZXRCdWZmZXIoKS5nZXRNYXJrZXJDb3VudCgpKS50b0JlKDApXG4gICAgICBlZGl0b3IuYXBwbHkoW21lc3NhZ2VdLCBbXSlcbiAgICAgIGV4cGVjdCh0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpLmdldE1hcmtlckNvdW50KCkpLnRvQmUoMSlcbiAgICAgIGVkaXRvci5hcHBseShbXSwgW21lc3NhZ2VdKVxuICAgICAgZXhwZWN0KHRleHRFZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0TWFya2VyQ291bnQoKSkudG9CZSgwKVxuICAgIH0pXG4gICAgaXQoJ21ha2VzIHN1cmUgdGhhdCB0aGUgbWVzc2FnZSBpcyB1cGRhdGVkIGlmIHRleHQgaXMgbWFuaXB1bGF0ZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGV4cGVjdCh0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpLmdldE1hcmtlckNvdW50KCkpLnRvQmUoMClcbiAgICAgIGVkaXRvci5hcHBseShbbWVzc2FnZV0sIFtdKVxuICAgICAgZXhwZWN0KHRleHRFZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0TWFya2VyQ291bnQoKSkudG9CZSgxKVxuICAgICAgZXhwZWN0KFJhbmdlLmZyb21PYmplY3QobWVzc2FnZS5yYW5nZSkpLnRvRXF1YWwoeyBzdGFydDogeyByb3c6IDIsIGNvbHVtbjogMCB9LCBlbmQ6IHsgcm93OiAyLCBjb2x1bW46IDEgfSB9KVxuICAgICAgdGV4dEVkaXRvci5nZXRCdWZmZXIoKS5pbnNlcnQoWzIsIDBdLCAnSGVsbG8nKVxuICAgICAgZXhwZWN0KFJhbmdlLmZyb21PYmplY3QobWVzc2FnZS5yYW5nZSkpLnRvRXF1YWwoeyBzdGFydDogeyByb3c6IDIsIGNvbHVtbjogMCB9LCBlbmQ6IHsgcm93OiAyLCBjb2x1bW46IDYgfSB9KVxuICAgICAgZWRpdG9yLmFwcGx5KFtdLCBbbWVzc2FnZV0pXG4gICAgICBleHBlY3QoUmFuZ2UuZnJvbU9iamVjdChtZXNzYWdlLnJhbmdlKSkudG9FcXVhbCh7IHN0YXJ0OiB7IHJvdzogMiwgY29sdW1uOiAwIH0sIGVuZDogeyByb3c6IDIsIGNvbHVtbjogNiB9IH0pXG4gICAgICBleHBlY3QodGV4dEVkaXRvci5nZXRCdWZmZXIoKS5nZXRNYXJrZXJDb3VudCgpKS50b0JlKDApXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ1Jlc3BvbnNlIHRvIGNvbmZpZycsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdyZXNwb25kcyB0byBgZ3V0dGVyUG9zaXRpb25gJywgZnVuY3Rpb24oKSB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci11aS1kZWZhdWx0Lmd1dHRlclBvc2l0aW9uJywgJ0xlZnQnKVxuICAgICAgZXhwZWN0KGVkaXRvci5ndXR0ZXIgJiYgZWRpdG9yLmd1dHRlci5wcmlvcml0eSkudG9CZSgtMTAwKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItdWktZGVmYXVsdC5ndXR0ZXJQb3NpdGlvbicsICdSaWdodCcpXG4gICAgICBleHBlY3QoZWRpdG9yLmd1dHRlciAmJiBlZGl0b3IuZ3V0dGVyLnByaW9yaXR5KS50b0JlKDEwMClcbiAgICB9KVxuICAgIGl0KCdyZXNwb25kcyB0byBgc2hvd0RlY29yYXRpb25zYCcsIGZ1bmN0aW9uKCkge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItdWktZGVmYXVsdC5zaG93RGVjb3JhdGlvbnMnLCBmYWxzZSlcbiAgICAgIGV4cGVjdChlZGl0b3IuZ3V0dGVyKS50b0JlKG51bGwpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dEZWNvcmF0aW9ucycsIHRydWUpXG4gICAgICBleHBlY3QoZWRpdG9yLmd1dHRlcikubm90LnRvQmUobnVsbClcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==