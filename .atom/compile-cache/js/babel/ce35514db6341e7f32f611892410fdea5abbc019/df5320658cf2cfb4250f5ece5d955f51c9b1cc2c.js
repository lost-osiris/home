var _path = require('path');

'use babel';

var lint = require('../lib/main.coffee').provideLinter().lint;

var failurePath = (0, _path.join)(__dirname, 'fixtures', 'files', 'failure.scss');
var ignoredPath = (0, _path.join)(__dirname, 'fixtures', 'files', 'ignored.scss');
var configFile = (0, _path.join)(__dirname, 'fixtures', 'config', '.relative-config.yml');

describe('The sass-lint provider for Linter - resolve paths relative to config file', function () {
  beforeEach(function () {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(function () {
      atom.packages.activatePackage('linter-sass-lint');
      return atom.packages.activatePackage('language-sass');
    });
  });

  describe('checks ignored.scss and', function () {
    var editor = null;

    beforeEach(function () {
      waitsForPromise(function () {
        atom.config.set('linter-sass-lint.configFile', configFile);
        atom.config.set('linter-sass-lint.resolvePathsRelativeToConfig', true);
        return atom.workspace.open(ignoredPath).then(function (openEditor) {
          editor = openEditor;
        });
      });
    });

    it('finds at least one message', function () {
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
      expect(messages[0].filePath).toBe(ignoredPath);
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
      expect(messages[1].filePath).toBe(ignoredPath);
      expect(messages[1].range).toEqual([[1, 9], [1, 10]]);
    });
  });

  describe('checks failure.scss and', function () {
    var editor = null;

    beforeEach(function () {
      waitsForPromise(function () {
        atom.config.set('linter-sass-lint.configFile', configFile);
        return atom.workspace.open(failurePath).then(function (openEditor) {
          editor = openEditor;
        });
      });
    });

    it('finds nothing wrong with the valid file', function () {
      var messages = lint(editor);
      expect(messages.length).toBe(0);
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc2Fzcy1saW50L3NwZWMvbGludGVyLXNhc3MtbGludC1yZXNvbHZlLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Im9CQUVxQixNQUFNOztBQUYzQixXQUFXLENBQUM7O0FBSVosSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDOztBQUVoRSxJQUFNLFdBQVcsR0FBRyxnQkFBSyxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztBQUN6RSxJQUFNLFdBQVcsR0FBRyxnQkFBSyxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztBQUN6RSxJQUFNLFVBQVUsR0FBRyxnQkFBSyxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDOztBQUVqRixRQUFRLENBQUMsMkVBQTJFLEVBQUUsWUFBTTtBQUMxRixZQUFVLENBQUMsWUFBTTtBQUNmLFFBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUN2QyxtQkFBZSxDQUFDLFlBQU07QUFDcEIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNsRCxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQ3ZELENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQzs7QUFFSCxVQUFRLENBQUMseUJBQXlCLEVBQUUsWUFBTTtBQUN4QyxRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7O0FBRWxCLGNBQVUsQ0FBQyxZQUFNO0FBQ2YscUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLFlBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDZCQUE2QixFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQzNELFlBQUksQ0FBQyxN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OztBQUVILFVBQVEsQ0FBQyx5QkFBeUIsRUFBRSxZQUFNO0FBQ3hDLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsY0FBVSxDQUFDLFlBQU07QUFDZixxQkFBZSxDQUFDLFlBQU07QUFDcEIsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDM0QsZUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxVQUFVLEVBQUs7QUFDM0QsZ0JBQU0sR0FBRyxVQUFVLENBQUM7U0FDckIsQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyx5Q0FBeUMsRUFBRSxZQUFNO0FBQ2xELFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5QixZQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQyxDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSixDQUFDLENBQUMiLCJmaWxlIjoiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zYXNzLWxpbnQvc3BlYy9saW50ZXItc2Fzcy1saW50LXJlc29sdmUtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5cbmNvbnN0IGxpbnQgPSByZXF1aXJlKCcuLi9saWIvbWFpbi5jb2ZmZWUnKS5wcm92aWRlTGludGVyKCkubGludDtcblxuY29uc3QgZmFpbHVyZVBhdGggPSBqb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJywgJ2ZpbGVzJywgJ2ZhaWx1cmUuc2NzcycpO1xuY29uc3QgaWdub3JlZFBhdGggPSBqb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJywgJ2ZpbGVzJywgJ2lnbm9yZWQuc2NzcycpO1xuY29uc3QgY29uZmlnRmlsZSA9IGpvaW4oX19kaXJuYW1lLCAnZml4dHVyZXMnLCAnY29uZmlnJywgJy5yZWxhdGl2ZS1jb25maWcueW1sJyk7XG5cbmRlc2NyaWJlKCdUaGUgc2Fzcy1saW50IHByb3ZpZGVyIGZvciBMaW50ZXIgLSByZXNvbHZlIHBhdGhzIHJlbGF0aXZlIHRvIGNvbmZpZyBmaWxlJywgKCkgPT4ge1xuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBhdG9tLndvcmtzcGFjZS5kZXN0cm95QWN0aXZlUGFuZUl0ZW0oKTtcbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xpbnRlci1zYXNzLWxpbnQnKTtcbiAgICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2Utc2FzcycpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnY2hlY2tzIGlnbm9yZWQuc2NzcyBhbmQnLCAoKSA9PiB7XG4gICAgbGV0IGVkaXRvciA9IG51bGw7XG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLXNhc3MtbGludC5jb25maWdGaWxlJywgY29uZmlnRmlsZSk7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLXNhc3MtbGludC5yZXNvbHZlUGF0aHNSZWxhdGl2ZVRvQ29uZmlnJywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKGlnbm9yZWRQYXRoKS50aGVuKChvcGVuRWRpdG9yKSA9PiB7XG4gICAgICAgICAgZWRpdG9yID0gb3BlbkVkaXRvcjtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdmaW5kcyBhdCBsZWFzdCBvbmUgbWVzc2FnZScsICgpID0+IHtcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gbGludChlZGl0b3IpO1xuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZUdyZWF0ZXJUaGFuKDApO1xuICAgIH0pO1xuXG4gICAgaXQoJ3ZlcmlmaWVzIHRoZSBmaXJzdCBtZXNzYWdlJywgKCkgPT4ge1xuICAgICAgY29uc3QgbWVzc2FnZXMgPSBsaW50KGVkaXRvcik7XG4gICAgICBjb25zdCBzbERvY1VybCA9ICdodHRwczovL2dpdGh1Yi5jb20vc2Fzc3Rvb2xzL3Nhc3MtbGludC90cmVlL21hc3Rlci9kb2NzL3J1bGVzL25vLWlkcy5tZCc7XG4gICAgICBjb25zdCBhdHRyaWJ1dGVzID0gYGhyZWY9XCIke3NsRG9jVXJsfVwiIGNsYXNzPVwiYmFkZ2UgYmFkZ2UtZmxleGlibGUgc2Fzcy1saW50XCJgO1xuICAgICAgY29uc3Qgd2FybmluZ01hcmt1cCA9IGA8YSAke2F0dHJpYnV0ZXN9Pm5vLWlkczwvYT5gO1xuICAgICAgY29uc3Qgd2FybklkID0gJyBJRCBzZWxlY3RvcnMgbm90IGFsbG93ZWQnO1xuXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0udHlwZSkudG9CZSgnRXJyb3InKTtcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS50ZXh0KS5ub3QudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5odG1sKS50b0JlKGAke3dhcm5pbmdNYXJrdXB9JHt3YXJuSWR9YCk7XG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uZmlsZVBhdGgpLnRvQmUoaWdub3JlZFBhdGgpO1xuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnJhbmdlKS50b0VxdWFsKFtbMCwgMF0sIFswLCAxXV0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3ZlcmlmaWVzIHRoZSBzZWNvbmQgbWVzc2FnZScsICgpID0+IHtcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gbGludChlZGl0b3IpO1xuICAgICAgY29uc3Qgc2xEb2NVcmwgPSAnaHR0cHM6Ly9naXRodWIuY29tL3Nhc3N0b29scy9zYXNzLWxpbnQvdHJlZS9tYXN0ZXIvZG9jcy9ydWxlcy9uby1jb2xvci1saXRlcmFscy5tZCc7XG4gICAgICBjb25zdCBhdHRyaWJ1dGVzID0gYGhyZWY9XCIke3NsRG9jVXJsfVwiIGNsYXNzPVwiYmFkZ2UgYmFkZ2UtZmxleGlibGUgc2Fzcy1saW50XCJgO1xuICAgICAgY29uc3Qgd2FybmluZ01hcmt1cCA9IGA8YSAke2F0dHJpYnV0ZXN9Pm5vLWNvbG9yLWxpdGVyYWxzPC9hPmA7XG4gICAgICBjb25zdCB3YXJuSWQgPSAnIENvbG9yIGxpdGVyYWxzIHN1Y2ggYXMgXFwncmVkXFwnIHNob3VsZCBvbmx5IGJlIHVzZWQgaW4gdmFyaWFibGUgZGVjbGFyYXRpb25zJztcblxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLnR5cGUpLnRvQmUoJ1dhcm5pbmcnKTtcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS50ZXh0KS5ub3QudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5odG1sKS50b0JlKGAke3dhcm5pbmdNYXJrdXB9JHt3YXJuSWR9YCk7XG4gICAgICBleHBlY3QobWVzc2FnZXNbMV0uZmlsZVBhdGgpLnRvQmUoaWdub3JlZFBhdGgpO1xuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLnJhbmdlKS50b0VxdWFsKFtbMSwgOV0sIFsxLCAxMF1dKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2NoZWNrcyBmYWlsdXJlLnNjc3MgYW5kJywgKCkgPT4ge1xuICAgIGxldCBlZGl0b3IgPSBudWxsO1xuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1zYXNzLWxpbnQuY29uZmlnRmlsZScsIGNvbmZpZ0ZpbGUpO1xuICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2Uub3BlbihmYWlsdXJlUGF0aCkudGhlbigob3BlbkVkaXRvcikgPT4ge1xuICAgICAgICAgIGVkaXRvciA9IG9wZW5FZGl0b3I7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnZmluZHMgbm90aGluZyB3cm9uZyB3aXRoIHRoZSB2YWxpZCBmaWxlJywgKCkgPT4ge1xuICAgICAgY29uc3QgbWVzc2FnZXMgPSBsaW50KGVkaXRvcik7XG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDApO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19