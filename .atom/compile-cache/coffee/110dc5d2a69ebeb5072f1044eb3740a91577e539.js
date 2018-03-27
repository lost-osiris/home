(function() {
  var TouchBar, spinning;

  TouchBar = require('remote').TouchBar;

  spinning = false;

  module.exports = {
    update: function(data) {
      var TouchBarButton, TouchBarLabel, TouchBarSpacer, button, touchBar, window;
      if (!TouchBar) {
        return;
      }
      TouchBarLabel = TouchBar.TouchBarLabel, TouchBarButton = TouchBar.TouchBarButton, TouchBarSpacer = TouchBar.TouchBarSpacer;
      button = new TouchBarButton({
        label: data.text + ": " + (data.description.trim().split('\n')[0]),
        backgroundColor: '#353232',
        click: function() {
          var promise;
          promise = atom.workspace.open(data.fileName);
          return promise.then(function(editor) {
            editor.setCursorBufferPosition([data.line, data.column]);
            return editor.scrollToCursorPosition();
          });
        }
      });
      touchBar = new TouchBar([
        button, new TouchBarSpacer({
          size: 'small'
        })
      ]);
      window = atom.getCurrentWindow();
      return window.setTouchBar(touchBar);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL3RvdWNoYmFyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsV0FBWSxPQUFBLENBQVEsUUFBUjs7RUFFYixRQUFBLEdBQVc7O0VBRVgsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFBUSxTQUFDLElBQUQ7QUFDTixVQUFBO01BQUEsSUFBRyxDQUFJLFFBQVA7QUFDRSxlQURGOztNQUVDLHNDQUFELEVBQWdCLHdDQUFoQixFQUFnQztNQUNoQyxNQUFBLEdBQWEsSUFBQSxjQUFBLENBQWU7UUFDMUIsS0FBQSxFQUFVLElBQUksQ0FBQyxJQUFOLEdBQVcsSUFBWCxHQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFqQixDQUFBLENBQXVCLENBQUMsS0FBeEIsQ0FBOEIsSUFBOUIsQ0FBb0MsQ0FBQSxDQUFBLENBQXJDLENBREc7UUFFMUIsZUFBQSxFQUFpQixTQUZTO1FBRzFCLEtBQUEsRUFBTyxTQUFBO0FBQ0wsY0FBQTtVQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsSUFBSSxDQUFDLFFBQXpCO2lCQUNWLE9BQU8sQ0FBQyxJQUFSLENBQWEsU0FBQyxNQUFEO1lBQ1gsTUFBTSxDQUFDLHVCQUFQLENBQStCLENBQUMsSUFBSSxDQUFDLElBQU4sRUFBWSxJQUFJLENBQUMsTUFBakIsQ0FBL0I7bUJBQ0EsTUFBTSxDQUFDLHNCQUFQLENBQUE7VUFGVyxDQUFiO1FBRkssQ0FIbUI7T0FBZjtNQVNiLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FBUztRQUN0QixNQURzQixFQUVsQixJQUFBLGNBQUEsQ0FBZTtVQUFDLElBQUEsRUFBTSxPQUFQO1NBQWYsQ0FGa0I7T0FBVDtNQUlmLE1BQUEsR0FBUyxJQUFJLENBQUMsZ0JBQUwsQ0FBQTthQUNULE1BQU0sQ0FBQyxXQUFQLENBQW1CLFFBQW5CO0lBbEJNLENBQVI7O0FBTEYiLCJzb3VyY2VzQ29udGVudCI6WyJ7VG91Y2hCYXJ9ID0gcmVxdWlyZSgncmVtb3RlJylcblxuc3Bpbm5pbmcgPSBmYWxzZVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIHVwZGF0ZTogKGRhdGEpIC0+XG4gICAgaWYgbm90IFRvdWNoQmFyXG4gICAgICByZXR1cm5cbiAgICB7VG91Y2hCYXJMYWJlbCwgVG91Y2hCYXJCdXR0b24sIFRvdWNoQmFyU3BhY2VyfSA9IFRvdWNoQmFyXG4gICAgYnV0dG9uID0gbmV3IFRvdWNoQmFyQnV0dG9uKHtcbiAgICAgIGxhYmVsOiBcIiN7ZGF0YS50ZXh0fTogI3tkYXRhLmRlc2NyaXB0aW9uLnRyaW0oKS5zcGxpdCgnXFxuJylbMF19XCIsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMzUzMjMyJyxcbiAgICAgIGNsaWNrOiAoKSAtPlxuICAgICAgICBwcm9taXNlID0gYXRvbS53b3Jrc3BhY2Uub3BlbihkYXRhLmZpbGVOYW1lKVxuICAgICAgICBwcm9taXNlLnRoZW4gKGVkaXRvcikgLT5cbiAgICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2RhdGEubGluZSwgZGF0YS5jb2x1bW5dKVxuICAgICAgICAgIGVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKClcbiAgICB9KVxuICAgIHRvdWNoQmFyID0gbmV3IFRvdWNoQmFyKFtcbiAgICAgIGJ1dHRvbixcbiAgICAgIG5ldyBUb3VjaEJhclNwYWNlcih7c2l6ZTogJ3NtYWxsJ30pLFxuICAgIF0pXG4gICAgd2luZG93ID0gYXRvbS5nZXRDdXJyZW50V2luZG93KClcbiAgICB3aW5kb3cuc2V0VG91Y2hCYXIodG91Y2hCYXIpXG4iXX0=
