Object.defineProperty(exports, '__esModule', {
  value: true
});

var _atom = require('atom');

'use babel';

exports['default'] = {
  subscriptions: null,

  activate: function activate() {
    this.subscriptions = new _atom.CompositeDisposable();
  },

  deactivate: function deactivate() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9saW50L2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBRWtDLE1BQU07O0FBRnhDLFdBQVcsQ0FBQTs7cUJBSUk7QUFDYixlQUFhLEVBQUUsSUFBSTs7QUFFbkIsVUFBUSxFQUFDLG9CQUFHO0FBQ1YsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtHQUMvQzs7QUFFRCxZQUFVLEVBQUMsc0JBQUc7QUFDWixRQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3QjtBQUNELFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0dBQzFCO0NBQ0YiLCJmaWxlIjoiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xpbnQvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgc3Vic2NyaXB0aW9uczogbnVsbCxcblxuICBhY3RpdmF0ZSAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICB9LFxuXG4gIGRlYWN0aXZhdGUgKCkge1xuICAgIGlmICh0aGlzLnN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB9XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbnVsbFxuICB9XG59XG4iXX0=