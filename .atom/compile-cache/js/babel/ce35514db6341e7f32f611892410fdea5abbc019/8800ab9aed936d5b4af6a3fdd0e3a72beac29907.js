var _libConstantsCoffee = require('../lib/constants.coffee');

'use babel';

var helpers = require('../lib/helpers.coffee');

describe('helpers', function () {
  describe('getRuleURI', function () {
    it('should return the correct rule URL', function () {
      var ruleId = 'no-ids';
      var result = helpers.getRuleURI(ruleId);

      expect(result).toEqual(_libConstantsCoffee.SASSLINT_DOC_URL + '/' + ruleId + '.md');
    });
  });

  describe('isValidSyntax', function () {
    it('should return true if a supported syntax is passed', function () {
      expect(helpers.isValidSyntax('scss')).toBe(true);
    });

    it('should return false if a supported syntax is not passed', function () {
      expect(helpers.isValidSyntax('html')).toBe(false);
    });
  });

  describe('getFileSyntax', function () {
    it('it should return scss if a scss filename is provided', function () {
      expect(helpers.getFileSyntax('test/file.scss')).toBe('scss');
    });

    it('it should return sass if a sass filename is provided', function () {
      expect(helpers.getFileSyntax('test/file.sass')).toBe('sass');
    });

    it('it should return scss if a scss.liquid filename is provided', function () {
      expect(helpers.getFileSyntax('test/file.scss.liquid')).toBe('scss');
    });

    it('it should return sass if a sass.liquid filename is provided', function () {
      expect(helpers.getFileSyntax('test/file.sass.liquid')).toBe('sass');
    });

    it('it should return html if a html filename is provided', function () {
      expect(helpers.getFileSyntax('test/file.html')).toBe('html');
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc2Fzcy1saW50L3NwZWMvaGVscGVycy1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJrQ0FFaUMseUJBQXlCOztBQUYxRCxXQUFXLENBQUM7O0FBSVosSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7O0FBRWpELFFBQVEsQ0FBQyxTQUFTLEVBQUUsWUFBTTtBQUN4QixVQUFRLENBQUMsWUFBWSxFQUFFLFlBQU07QUFDM0IsTUFBRSxDQUFDLG9DQUFvQyxFQUFFLFlBQU07QUFDN0MsVUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQ3hCLFVBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTFDLFlBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLDhDQUF3QixNQUFNLFNBQU0sQ0FBQztLQUM1RCxDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLGVBQWUsRUFBRSxZQUFNO0FBQzlCLE1BQUUsQ0FBQyxvREFBb0QsRUFBRSxZQUFNO0FBQzdELFlBQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2xELENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMseURBQXlELEVBQUUsWUFBTTtBQUNsRSxZQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNuRCxDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLGVBQWUsRUFBRSxZQUFNO0FBQzlCLE1BQUUsQ0FBQyxzREFBc0QsRUFBRSxZQUFNO0FBQy9ELFlBQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDOUQsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyxzREFBc0QsRUFBRSxZQUFNO0FBQy9ELFlBQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDOUQsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyw2REFBNkQsRUFBRSxZQUFNO0FBQ3RFLFlBQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDckUsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyw2REFBNkQsRUFBRSxZQUFNO0FBQ3RFLFlBQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDckUsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyxzREFBc0QsRUFBRSxZQUFNO0FBQy9ELFlBQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDOUQsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Ii9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc2Fzcy1saW50L3NwZWMvaGVscGVycy1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IFNBU1NMSU5UX0RPQ19VUkwgfSBmcm9tICcuLi9saWIvY29uc3RhbnRzLmNvZmZlZSc7XG5cbmNvbnN0IGhlbHBlcnMgPSByZXF1aXJlKCcuLi9saWIvaGVscGVycy5jb2ZmZWUnKTtcblxuZGVzY3JpYmUoJ2hlbHBlcnMnLCAoKSA9PiB7XG4gIGRlc2NyaWJlKCdnZXRSdWxlVVJJJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRoZSBjb3JyZWN0IHJ1bGUgVVJMJywgKCkgPT4ge1xuICAgICAgY29uc3QgcnVsZUlkID0gJ25vLWlkcyc7XG4gICAgICBjb25zdCByZXN1bHQgPSBoZWxwZXJzLmdldFJ1bGVVUkkocnVsZUlkKTtcblxuICAgICAgZXhwZWN0KHJlc3VsdCkudG9FcXVhbChgJHtTQVNTTElOVF9ET0NfVVJMfS8ke3J1bGVJZH0ubWRgKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2lzVmFsaWRTeW50YXgnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBhIHN1cHBvcnRlZCBzeW50YXggaXMgcGFzc2VkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGhlbHBlcnMuaXNWYWxpZFN5bnRheCgnc2NzcycpKS50b0JlKHRydWUpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgYSBzdXBwb3J0ZWQgc3ludGF4IGlzIG5vdCBwYXNzZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaGVscGVycy5pc1ZhbGlkU3ludGF4KCdodG1sJykpLnRvQmUoZmFsc2UpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZ2V0RmlsZVN5bnRheCcsICgpID0+IHtcbiAgICBpdCgnaXQgc2hvdWxkIHJldHVybiBzY3NzIGlmIGEgc2NzcyBmaWxlbmFtZSBpcyBwcm92aWRlZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChoZWxwZXJzLmdldEZpbGVTeW50YXgoJ3Rlc3QvZmlsZS5zY3NzJykpLnRvQmUoJ3Njc3MnKTtcbiAgICB9KTtcblxuICAgIGl0KCdpdCBzaG91bGQgcmV0dXJuIHNhc3MgaWYgYSBzYXNzIGZpbGVuYW1lIGlzIHByb3ZpZGVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGhlbHBlcnMuZ2V0RmlsZVN5bnRheCgndGVzdC9maWxlLnNhc3MnKSkudG9CZSgnc2FzcycpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2l0IHNob3VsZCByZXR1cm4gc2NzcyBpZiBhIHNjc3MubGlxdWlkIGZpbGVuYW1lIGlzIHByb3ZpZGVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGhlbHBlcnMuZ2V0RmlsZVN5bnRheCgndGVzdC9maWxlLnNjc3MubGlxdWlkJykpLnRvQmUoJ3Njc3MnKTtcbiAgICB9KTtcblxuICAgIGl0KCdpdCBzaG91bGQgcmV0dXJuIHNhc3MgaWYgYSBzYXNzLmxpcXVpZCBmaWxlbmFtZSBpcyBwcm92aWRlZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChoZWxwZXJzLmdldEZpbGVTeW50YXgoJ3Rlc3QvZmlsZS5zYXNzLmxpcXVpZCcpKS50b0JlKCdzYXNzJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnaXQgc2hvdWxkIHJldHVybiBodG1sIGlmIGEgaHRtbCBmaWxlbmFtZSBpcyBwcm92aWRlZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChoZWxwZXJzLmdldEZpbGVTeW50YXgoJ3Rlc3QvZmlsZS5odG1sJykpLnRvQmUoJ2h0bWwnKTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==