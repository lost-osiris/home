var _path = require('path');

'use babel';

var lint = require('../lib/main.coffee').provideLinter().lint;

var failurePath = (0, _path.join)(__dirname, 'fixtures', 'files', 'failure.scss');
var configFile = (0, _path.join)(__dirname, 'fixtures', 'config', '.sass-lint.yml');

describe('The sass-lint provider for Linter - path options', function () {
  beforeEach(function () {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(function () {
      atom.packages.activatePackage('linter-sass-lint');
      return atom.packages.activatePackage('language-sass');
    });
  });

  describe('checks failure.scss, expects a message and', function () {
    var editor = null;

    beforeEach(function () {
      waitsForPromise(function () {
        atom.config.set('linter-sass-lint.configFile', configFile);
        atom.config.set('linter-sass-lint.globalSassLint', true);
        return atom.workspace.open(failurePath).then(function (openEditor) {
          editor = openEditor;
        });
      });
    });

    it('lints the file with the globally installed sass-lint', function () {
      var messages = lint(editor);
      expect(messages.length).toBeGreaterThan(0);
    });

    it('verifies the first message', function () {
      var messages = lint(editor);
      var slDocUrl = 'https://github.com/sasstools/sass-lint/tree/master/docs/rules/no-ids.md';
      var attributes = 'href="' + slDocUrl + '" class="badge badge-flexible sass-lint"';
      var warningMarkup = '<a ' + attributes + '>no-ids</a>';
      var warnId = ' ID selectors not allowed';

      expect(messages[0].type).toBe('Error');
      expect(messages[0].text).not.toBeDefined();
      expect(messages[0].html).toBe('' + warningMarkup + warnId);
      expect(messages[0].filePath).toBe(failurePath);
      expect(messages[0].range).toEqual([[0, 0], [0, 1]]);
    });

    it('verifies the second message', function () {
      var messages = lint(editor);
      var slDocUrl = 'https://github.com/sasstools/sass-lint/tree/master/docs/rules/no-color-literals.md';
      var attributes = 'href="' + slDocUrl + '" class="badge badge-flexible sass-lint"';
      var warningMarkup = '<a ' + attributes + '>no-color-literals</a>';
      var warnId = ' Color literals such as \'red\' should only be used in variable declarations';

      expect(messages[1].type).toBe('Warning');
      expect(messages[1].text).not.toBeDefined();
      expect(messages[1].html).toBe('' + warningMarkup + warnId);
      expect(messages[1].filePath).toBe(failurePath);
      expect(messages[1].range).toEqual([[1, 9], [1, 10]]);
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc2Fzcy1saW50L3NwZWMvbGludGVyLXNhc3MtbGludC1wYXRoLW9wdGlvbnMtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoib0JBRXFCLE1BQU07O0FBRjNCLFdBQVcsQ0FBQzs7QUFJWixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLENBQUM7O0FBRWhFLElBQU0sV0FBVyxHQUFHLGdCQUFLLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQ3pFLElBQU0sVUFBVSxHQUFHLGdCQUFLLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixDQUFDLENBQUM7O0FBRTNFLFFBQVEsQ0FBQyxrREFBa0QsRUFBRSxZQUFNO0FBQ2pFLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsUUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0FBQ3ZDLG1CQUFlLENBQUMsWUFBTTtBQUNwQixVQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ2xELGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDdkQsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDOztBQUVILFVBQVEsQ0FBQyw0Q0FBNEMsRUFBRSxZQUFNO0FBQzNELFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsY0FBVSxDQUFDLFlBQU07QUFDZixxQkFBZSxDQUFDLFlBQU07QUFDcEIsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDM0QsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDekQsZUFBTyxJQUFJLENBQUMs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bnQvc3BlYy9saW50ZXItc2Fzcy1saW50LXBhdGgtb3B0aW9ucy1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcblxuY29uc3QgbGludCA9IHJlcXVpcmUoJy4uL2xpYi9tYWluLmNvZmZlZScpLnByb3ZpZGVMaW50ZXIoKS5saW50O1xuXG5jb25zdCBmYWlsdXJlUGF0aCA9IGpvaW4oX19kaXJuYW1lLCAnZml4dHVyZXMnLCAnZmlsZXMnLCAnZmFpbHVyZS5zY3NzJyk7XG5jb25zdCBjb25maWdGaWxlID0gam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcycsICdjb25maWcnLCAnLnNhc3MtbGludC55bWwnKTtcblxuZGVzY3JpYmUoJ1RoZSBzYXNzLWxpbnQgcHJvdmlkZXIgZm9yIExpbnRlciAtIHBhdGggb3B0aW9ucycsICgpID0+IHtcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmVJdGVtKCk7XG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsaW50ZXItc2Fzcy1saW50Jyk7XG4gICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLXNhc3MnKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2NoZWNrcyBmYWlsdXJlLnNjc3MsIGV4cGVjdHMgYSBtZXNzYWdlIGFuZCcsICgpID0+IHtcbiAgICBsZXQgZWRpdG9yID0gbnVsbDtcblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItc2Fzcy1saW50LmNvbmZpZ0ZpbGUnLCBjb25maWdGaWxlKTtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItc2Fzcy1saW50Lmdsb2JhbFNhc3NMaW50JywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKGZhaWx1cmVQYXRoKS50aGVuKChvcGVuRWRpdG9yKSA9PiB7XG4gICAgICAgICAgZWRpdG9yID0gb3BlbkVkaXRvcjtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdsaW50cyB0aGUgZmlsZSB3aXRoIHRoZSBnbG9iYWxseSBpbnN0YWxsZWQgc2Fzcy1saW50JywgKCkgPT4ge1xuICAgICAgY29uc3QgbWVzc2FnZXMgPSBsaW50KGVkaXRvcik7XG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlR3JlYXRlclRoYW4oMCk7XG4gICAgfSk7XG5cbiAgICBpdCgndmVyaWZpZXMgdGhlIGZpcnN0IG1lc3NhZ2UnLCAoKSA9PiB7XG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGxpbnQoZWRpdG9yKTtcbiAgICAgIGNvbnN0IHNsRG9jVXJsID0gJ2h0dHBzOi8vZ2l0aHViLmNvbS9zYXNzdG9vbHMvc2Fzcy1saW50L3RyZWUvbWFzdGVyL2RvY3MvcnVsZXMvbm8taWRzLm1kJztcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBgaHJlZj1cIiR7c2xEb2NVcmx9XCIgY2xhc3M9XCJiYWRnZSBiYWRnZS1mbGV4aWJsZSBzYXNzLWxpbnRcImA7XG4gICAgICBjb25zdCB3YXJuaW5nTWFya3VwID0gYDxhICR7YXR0cmlidXRlc30+bm8taWRzPC9hPmA7XG4gICAgICBjb25zdCB3YXJuSWQgPSAnIElEIHNlbGVjdG9ycyBub3QgYWxsb3dlZCc7XG5cbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS50eXBlKS50b0JlKCdFcnJvcicpO1xuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnRleHQpLm5vdC50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmh0bWwpLnRvQmUoYCR7d2FybmluZ01hcmt1cH0ke3dhcm5JZH1gKTtcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5maWxlUGF0aCkudG9CZShmYWlsdXJlUGF0aCk7XG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ucmFuZ2UpLnRvRXF1YWwoW1swLCAwXSwgWzAsIDFdXSk7XG4gICAgfSk7XG5cbiAgICBpdCgndmVyaWZpZXMgdGhlIHNlY29uZCBtZXNzYWdlJywgKCkgPT4ge1xuICAgICAgY29uc3QgbWVzc2FnZXMgPSBsaW50KGVkaXRvcik7XG4gICAgICBjb25zdCBzbERvY1VybCA9ICdodHRwczovL2dpdGh1Yi5jb20vc2Fzc3Rvb2xzL3Nhc3MtbGludC90cmVlL21hc3Rlci9kb2NzL3J1bGVzL25vLWNvbG9yLWxpdGVyYWxzLm1kJztcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBgaHJlZj1cIiR7c2xEb2NVcmx9XCIgY2xhc3M9XCJiYWRnZSBiYWRnZS1mbGV4aWJsZSBzYXNzLWxpbnRcImA7XG4gICAgICBjb25zdCB3YXJuaW5nTWFya3VwID0gYDxhICR7YXR0cmlidXRlc30+bm8tY29sb3ItbGl0ZXJhbHM8L2E+YDtcbiAgICAgIGNvbnN0IHdhcm5JZCA9ICcgQ29sb3IgbGl0ZXJhbHMgc3VjaCBhcyBcXCdyZWRcXCcgc2hvdWxkIG9ubHkgYmUgdXNlZCBpbiB2YXJpYWJsZSBkZWNsYXJhdGlvbnMnO1xuXG4gICAgICBleHBlY3QobWVzc2FnZXNbMV0udHlwZSkudG9CZSgnV2FybmluZycpO1xuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLnRleHQpLm5vdC50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLmh0bWwpLnRvQmUoYCR7d2FybmluZ01hcmt1cH0ke3dhcm5JZH1gKTtcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5maWxlUGF0aCkudG9CZShmYWlsdXJlUGF0aCk7XG4gICAgICBleHBlY3QobWVzc2FnZXNbMV0ucmFuZ2UpLnRvRXF1YWwoW1sxLCA5XSwgWzEsIDEwXV0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19