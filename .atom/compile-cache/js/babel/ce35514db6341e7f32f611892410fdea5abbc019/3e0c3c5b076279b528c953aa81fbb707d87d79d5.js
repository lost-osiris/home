Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fontsSetFontSize = require('./fonts/set-font-size');

var _fontsSetFontSize2 = _interopRequireDefault(_fontsSetFontSize);

var _helperToggleClassName = require('./helper/toggle-class-name');

var _helperToggleClassName2 = _interopRequireDefault(_helperToggleClassName);

require('./colors');

require('./fonts');

require('./tab-bar');

require('./user-interface');

'use babel';

var classNames = {
    // Fonts
    'amu-paint-cursor': atom.config.get('atom-material-ui.colors.paintCursor'),

    // Tabs settings
    'amu-compact-tab-bar': atom.config.get('atom-material-ui.tabs.compactTabs'),
    'amu-no-tab-min-width': atom.config.get('atom-material-ui.tabs.noTabMinWidth'),
    'amu-tinted-tab-bar': atom.config.get('atom-material-ui.tabs.tintedTabBar'),

    // General UI settings
    'amu-use-animations': atom.config.get('atom-material-ui.ui.useAnimations'),
    'amu-panel-contrast': atom.config.get('atom-material-ui.ui.panelContrast'),
    'amu-panel-shadows': atom.config.get('atom-material-ui.ui.panelShadows')
};

exports['default'] = {
    activate: function activate() {
        Object.keys(classNames).forEach(function (className) {
            return (0, _helperToggleClassName2['default'])(className, classNames[className]);
        });

        (0, _fontsSetFontSize2['default'])(atom.config.get('atom-material-ui.fonts.fontSize'));
    },

    deactivate: function deactivate() {
        // Reset all the things!
        Object.keys(classNames).forEach(function (className) {
            return (0, _helperToggleClassName2['default'])(className, false);
        });
        (0, _fontsSetFontSize2['default'])(null);
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9hdG9tLW1hdGVyaWFsLXVpL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztnQ0FFd0IsdUJBQXVCOzs7O3FDQUNuQiw0QkFBNEI7Ozs7UUFDakQsVUFBVTs7UUFDVixTQUFTOztRQUNULFdBQVc7O1FBQ1gsa0JBQWtCOztBQVB6QixXQUFXLENBQUM7O0FBU1osSUFBTSxVQUFVLEdBQUc7O0FBRWYsc0JBQWtCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUM7OztBQUcxRSx5QkFBcUIsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQztBQUMzRSwwQkFBc0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsQ0FBQztBQUM5RSx3QkFBb0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQzs7O0FBRzNFLHdCQUFvQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDO0FBQzFFLHdCQUFvQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDO0FBQzFFLHVCQUFtQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDO0NBQzNFLENBQUM7O3FCQUVhO0FBQ1gsWUFBUSxFQUFBLG9CQUFHO0FBQ1AsY0FBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxTQUFTO21CQUNyQyx3Q0FBZ0IsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUFDLENBQ3JELENBQUM7O0FBRUYsMkNBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFDO0tBQ25FOztBQUVELGNBQVUsRUFBQSxzQkFBRzs7QUFFVCxjQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFNBQVM7bUJBQUksd0NBQWdCLFNBQVMsRUFBRSxLQUFLLENBQUM7U0FBQSxDQUFDLENBQUM7QUFDaEYsMkNBQVksSUFBSSxDQUFDLENBQUM7S0FDckI7Q0FDSiIsImZpbGUiOiIvaG9tZS9tb3dlbnMvLmF0b20vcGFja2FnZXMvYXRvbS1tYXRlcmlhbC11aS9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgc2V0Rm9udFNpemUgZnJvbSAnLi9mb250cy9zZXQtZm9udC1zaXplJztcbmltcG9ydCB0b2dnbGVDbGFzc05hbWUgZnJvbSAnLi9oZWxwZXIvdG9nZ2xlLWNsYXNzLW5hbWUnO1xuaW1wb3J0ICcuL2NvbG9ycyc7XG5pbXBvcnQgJy4vZm9udHMnO1xuaW1wb3J0ICcuL3RhYi1iYXInO1xuaW1wb3J0ICcuL3VzZXItaW50ZXJmYWNlJztcblxuY29uc3QgY2xhc3NOYW1lcyA9IHtcbiAgICAvLyBGb250c1xuICAgICdhbXUtcGFpbnQtY3Vyc29yJzogYXRvbS5jb25maWcuZ2V0KCdhdG9tLW1hdGVyaWFsLXVpLmNvbG9ycy5wYWludEN1cnNvcicpLFxuXG4gICAgLy8gVGFicyBzZXR0aW5nc1xuICAgICdhbXUtY29tcGFjdC10YWItYmFyJzogYXRvbS5jb25maWcuZ2V0KCdhdG9tLW1hdGVyaWFsLXVpLnRhYnMuY29tcGFjdFRhYnMnKSxcbiAgICAnYW11LW5vLXRhYi1taW4td2lkdGgnOiBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tbWF0ZXJpYWwtdWkudGFicy5ub1RhYk1pbldpZHRoJyksXG4gICAgJ2FtdS10aW50ZWQtdGFiLWJhcic6IGF0b20uY29uZmlnLmdldCgnYXRvbS1tYXRlcmlhbC11aS50YWJzLnRpbnRlZFRhYkJhcicpLFxuXG4gICAgLy8gR2VuZXJhbCBVSSBzZXR0aW5nc1xuICAgICdhbXUtdXNlLWFuaW1hdGlvbnMnOiBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tbWF0ZXJpYWwtdWkudWkudXNlQW5pbWF0aW9ucycpLFxuICAgICdhbXUtcGFuZWwtY29udHJhc3QnOiBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tbWF0ZXJpYWwtdWkudWkucGFuZWxDb250cmFzdCcpLFxuICAgICdhbXUtcGFuZWwtc2hhZG93cyc6IGF0b20uY29uZmlnLmdldCgnYXRvbS1tYXRlcmlhbC11aS51aS5wYW5lbFNoYWRvd3MnKSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBhY3RpdmF0ZSgpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoY2xhc3NOYW1lcykuZm9yRWFjaChjbGFzc05hbWUgPT4gKFxuICAgICAgICAgICAgdG9nZ2xlQ2xhc3NOYW1lKGNsYXNzTmFtZSwgY2xhc3NOYW1lc1tjbGFzc05hbWVdKSksXG4gICAgICAgICk7XG5cbiAgICAgICAgc2V0Rm9udFNpemUoYXRvbS5jb25maWcuZ2V0KCdhdG9tLW1hdGVyaWFsLXVpLmZvbnRzLmZvbnRTaXplJykpO1xuICAgIH0sXG5cbiAgICBkZWFjdGl2YXRlKCkge1xuICAgICAgICAvLyBSZXNldCBhbGwgdGhlIHRoaW5ncyFcbiAgICAgICAgT2JqZWN0LmtleXMoY2xhc3NOYW1lcykuZm9yRWFjaChjbGFzc05hbWUgPT4gdG9nZ2xlQ2xhc3NOYW1lKGNsYXNzTmFtZSwgZmFsc2UpKTtcbiAgICAgICAgc2V0Rm9udFNpemUobnVsbCk7XG4gICAgfSxcbn07XG4iXX0=