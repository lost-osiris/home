var _path = require('path');

'use babel';

var lint = require('../lib/main.coffee').provideLinter().lint;

var failurePath = (0, _path.join)(__dirname, 'fixtures', 'files', 'failure.scss');
var ignoredPath = (0, _path.join)(__dirname, 'fixtures', 'files', 'ignored.scss');
var passPath = (0, _path.join)(__dirname, 'fixtures', 'files', 'pass.scss');
var configFile = (0, _path.join)(__dirname, 'fixtures', 'config', '.sass-lint.yml');

describe('The sass-lint provider for Linter - sass', function () {
  beforeEach(function () {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(function () {
      atom.packages.activatePackage('linter-sass-lint');
      return atom.packages.activatePackage('language-sass');
    });
  });

  describe('checks failure.sass and', function () {
    var editor = null;

    beforeEach(function () {
      waitsForPromise(function () {
        atom.config.set('linter-sass-lint.configFile', configFile);
        return atom.workspace.open(failurePath).then(function (openEditor) {
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

      expect(messages[0].type).toEqual('Error');
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

      expect(messages[1].type).toEqual('Warning');
      expect(messages[1].text).not.toBeDefined();
      expect(messages[1].html).toBe('' + warningMarkup + warnId);
      expect(messages[1].filePath).toBe(failurePath);
      expect(messages[1].range).toEqual([[1, 9], [1, 10]]);
    });
  });

  describe('checks pass.sass and', function () {
    var editor = null;

    beforeEach(function () {
      waitsForPromise(function () {
        atom.config.set('linter-sass-lint.configFile', configFile);
        return atom.workspace.open(passPath).then(function (openEditor) {
          editor = openEditor;
        });
      });
    });

    it('finds nothing wrong with the valid file', function () {
      var messages = lint(editor);
      expect(messages.length).toBe(0);
    });
  });

  describe('opens ignored.sass and', function () {
    var editor = null;

    beforeEach(function () {
      waitsForPromise(function () {
        atom.config.set('linter-sass-lint.configFile', configFile);
        return atom.workspace.open(ignoredPath).then(function (openEditor) {
          editor = openEditor;
        });
      });
    });

    it('ignores the file and reports no warnings', function () {
      var messages = lint(editor);
      expect(messages.length).toBe(0);
    });
  });

  describe('opens failure.sass and sets pacakage to not lint if no config file present', function () {
    var editor = null;

    beforeEach(function () {
      waitsForPromise(function () {
        atom.config.set('linter-sass-lint.noConfigDisable', true);
        atom.config.set('linter-sass-lint.configFile', '');
        return atom.workspace.open(failurePath).then(function (openEditor) {
          editor = openEditor;
        });
      });
    });

    it("doesn't lint the file as there's no config file present", function () {
      var messages = lint(editor);
      expect(messages.length).toBe(0);
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc2Fzcy1saW50L3NwZWMvbGludGVyLXNhc3MtbGludC1zYXNzLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Im9CQUVxQixNQUFNOztBQUYzQixXQUFXLENBQUM7O0FBSVosSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDOztBQUVoRSxJQUFNLFdBQVcsR0FBRyxnQkFBSyxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztBQUN6RSxJQUFNLFdBQVcsR0FBRyxnQkFBSyxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztBQUN6RSxJQUFNLFFBQVEsR0FBRyxnQkFBSyxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztBQUNuRSxJQUFNLFVBQVUsR0FBRyxnQkFBSyxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDOztBQUUzRSxRQUFRLENBQUMsMENBQTBDLEVBQUUsWUFBTTtBQUN6RCxZQUFVLENBQUMsWUFBTTtBQUNmLFFBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUN2QyxtQkFBZSxDQUFDLFlBQU07QUFDcEIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNsRCxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQ3ZELENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQzs7QUFFSCxVQUFRLENBQUMseUJBQXlCLEVBQUUsWUFBTTtBQUN4QyxRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7O0FBRWxCLGNBQVUsQ0FBQyxZQUFNO0FBQ2YscUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLFlBQUks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Q0FBQyxDQUFDO0FBQzlCLFlBQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pDLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQzs7QUFFSCxVQUFRLENBQUMsNEVBQTRFLEVBQUUsWUFBTTtBQUMzRixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7O0FBRWxCLGNBQVUsQ0FBQyxZQUFNO0FBQ2YscUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLFlBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzFELFlBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDZCQUE2QixFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ25ELGVBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsVUFBVSxFQUFLO0FBQzNELGdCQUFNLEdBQUcsVUFBVSxDQUFDO1NBQ3JCLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMseURBQXlELEVBQUUsWUFBTTtBQUNsRSxVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDOUIsWUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakMsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Ii9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc2Fzcy1saW50L3NwZWMvbGludGVyLXNhc3MtbGludC1zYXNzLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuXG5jb25zdCBsaW50ID0gcmVxdWlyZSgnLi4vbGliL21haW4uY29mZmVlJykucHJvdmlkZUxpbnRlcigpLmxpbnQ7XG5cbmNvbnN0IGZhaWx1cmVQYXRoID0gam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcycsICdmaWxlcycsICdmYWlsdXJlLnNjc3MnKTtcbmNvbnN0IGlnbm9yZWRQYXRoID0gam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcycsICdmaWxlcycsICdpZ25vcmVkLnNjc3MnKTtcbmNvbnN0IHBhc3NQYXRoID0gam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcycsICdmaWxlcycsICdwYXNzLnNjc3MnKTtcbmNvbnN0IGNvbmZpZ0ZpbGUgPSBqb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJywgJ2NvbmZpZycsICcuc2Fzcy1saW50LnltbCcpO1xuXG5kZXNjcmliZSgnVGhlIHNhc3MtbGludCBwcm92aWRlciBmb3IgTGludGVyIC0gc2FzcycsICgpID0+IHtcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmVJdGVtKCk7XG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsaW50ZXItc2Fzcy1saW50Jyk7XG4gICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLXNhc3MnKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2NoZWNrcyBmYWlsdXJlLnNhc3MgYW5kJywgKCkgPT4ge1xuICAgIGxldCBlZGl0b3IgPSBudWxsO1xuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1zYXNzLWxpbnQuY29uZmlnRmlsZScsIGNvbmZpZ0ZpbGUpO1xuICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2Uub3BlbihmYWlsdXJlUGF0aCkudGhlbigob3BlbkVkaXRvcikgPT4ge1xuICAgICAgICAgIGVkaXRvciA9IG9wZW5FZGl0b3I7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnZmluZHMgYXQgbGVhc3Qgb25lIG1lc3NhZ2UnLCAoKSA9PiB7XG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGxpbnQoZWRpdG9yKTtcbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbigwKTtcbiAgICB9KTtcblxuICAgIGl0KCd2ZXJpZmllcyB0aGUgZmlyc3QgbWVzc2FnZScsICgpID0+IHtcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gbGludChlZGl0b3IpO1xuICAgICAgY29uc3Qgc2xEb2NVcmwgPSAnaHR0cHM6Ly9naXRodWIuY29tL3Nhc3N0b29scy9zYXNzLWxpbnQvdHJlZS9tYXN0ZXIvZG9jcy9ydWxlcy9uby1pZHMubWQnO1xuICAgICAgY29uc3QgYXR0cmlidXRlcyA9IGBocmVmPVwiJHtzbERvY1VybH1cIiBjbGFzcz1cImJhZGdlIGJhZGdlLWZsZXhpYmxlIHNhc3MtbGludFwiYDtcbiAgICAgIGNvbnN0IHdhcm5pbmdNYXJrdXAgPSBgPGEgJHthdHRyaWJ1dGVzfT5uby1pZHM8L2E+YDtcbiAgICAgIGNvbnN0IHdhcm5JZCA9ICcgSUQgc2VsZWN0b3JzIG5vdCBhbGxvd2VkJztcblxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnR5cGUpLnRvRXF1YWwoJ0Vycm9yJyk7XG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0udGV4dCkubm90LnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uaHRtbCkudG9CZShgJHt3YXJuaW5nTWFya3VwfSR7d2FybklkfWApO1xuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmZpbGVQYXRoKS50b0JlKGZhaWx1cmVQYXRoKTtcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5yYW5nZSkudG9FcXVhbChbWzAsIDBdLCBbMCwgMV1dKTtcbiAgICB9KTtcblxuICAgIGl0KCd2ZXJpZmllcyB0aGUgc2Vjb25kIG1lc3NhZ2UnLCAoKSA9PiB7XG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGxpbnQoZWRpdG9yKTtcbiAgICAgIGNvbnN0IHNsRG9jVXJsID0gJ2h0dHBzOi8vZ2l0aHViLmNvbS9zYXNzdG9vbHMvc2Fzcy1saW50L3RyZWUvbWFzdGVyL2RvY3MvcnVsZXMvbm8tY29sb3ItbGl0ZXJhbHMubWQnO1xuICAgICAgY29uc3QgYXR0cmlidXRlcyA9IGBocmVmPVwiJHtzbERvY1VybH1cIiBjbGFzcz1cImJhZGdlIGJhZGdlLWZsZXhpYmxlIHNhc3MtbGludFwiYDtcbiAgICAgIGNvbnN0IHdhcm5pbmdNYXJrdXAgPSBgPGEgJHthdHRyaWJ1dGVzfT5uby1jb2xvci1saXRlcmFsczwvYT5gO1xuICAgICAgY29uc3Qgd2FybklkID0gJyBDb2xvciBsaXRlcmFscyBzdWNoIGFzIFxcJ3JlZFxcJyBzaG91bGQgb25seSBiZSB1c2VkIGluIHZhcmlhYmxlIGRlY2xhcmF0aW9ucyc7XG5cbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS50eXBlKS50b0VxdWFsKCdXYXJuaW5nJyk7XG4gICAgICBleHBlY3QobWVzc2FnZXNbMV0udGV4dCkubm90LnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QobWVzc2FnZXNbMV0uaHRtbCkudG9CZShgJHt3YXJuaW5nTWFya3VwfSR7d2FybklkfWApO1xuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLmZpbGVQYXRoKS50b0JlKGZhaWx1cmVQYXRoKTtcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5yYW5nZSkudG9FcXVhbChbWzEsIDldLCBbMSwgMTBdXSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdjaGVja3MgcGFzcy5zYXNzIGFuZCcsICgpID0+IHtcbiAgICBsZXQgZWRpdG9yID0gbnVsbDtcblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItc2Fzcy1saW50LmNvbmZpZ0ZpbGUnLCBjb25maWdGaWxlKTtcbiAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4ocGFzc1BhdGgpLnRoZW4oKG9wZW5FZGl0b3IpID0+IHtcbiAgICAgICAgICBlZGl0b3IgPSBvcGVuRWRpdG9yO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ2ZpbmRzIG5vdGhpbmcgd3Jvbmcgd2l0aCB0aGUgdmFsaWQgZmlsZScsICgpID0+IHtcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gbGludChlZGl0b3IpO1xuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgwKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ29wZW5zIGlnbm9yZWQuc2FzcyBhbmQnLCAoKSA9PiB7XG4gICAgbGV0IGVkaXRvciA9IG51bGw7XG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLXNhc3MtbGludC5jb25maWdGaWxlJywgY29uZmlnRmlsZSk7XG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKGlnbm9yZWRQYXRoKS50aGVuKChvcGVuRWRpdG9yKSA9PiB7XG4gICAgICAgICAgZWRpdG9yID0gb3BlbkVkaXRvcjtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdpZ25vcmVzIHRoZSBmaWxlIGFuZCByZXBvcnRzIG5vIHdhcm5pbmdzJywgKCkgPT4ge1xuICAgICAgY29uc3QgbWVzc2FnZXMgPSBsaW50KGVkaXRvcik7XG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDApO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnb3BlbnMgZmFpbHVyZS5zYXNzIGFuZCBzZXRzIHBhY2FrYWdlIHRvIG5vdCBsaW50IGlmIG5vIGNvbmZpZyBmaWxlIHByZXNlbnQnLCAoKSA9PiB7XG4gICAgbGV0IGVkaXRvciA9IG51bGw7XG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLXNhc3MtbGludC5ub0NvbmZpZ0Rpc2FibGUnLCB0cnVlKTtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItc2Fzcy1saW50LmNvbmZpZ0ZpbGUnLCAnJyk7XG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKGZhaWx1cmVQYXRoKS50aGVuKChvcGVuRWRpdG9yKSA9PiB7XG4gICAgICAgICAgZWRpdG9yID0gb3BlbkVkaXRvcjtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KFwiZG9lc24ndCBsaW50IHRoZSBmaWxlIGFzIHRoZXJlJ3Mgbm8gY29uZmlnIGZpbGUgcHJlc2VudFwiLCAoKSA9PiB7XG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGxpbnQoZWRpdG9yKTtcbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMCk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=