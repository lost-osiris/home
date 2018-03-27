Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

var _helpers = require('./helpers');

var _tinycolor2 = require('tinycolor2');

var _tinycolor22 = _interopRequireDefault(_tinycolor2);

var _colorTemplates = require('./color-templates');

var _colorTemplates2 = _interopRequireDefault(_colorTemplates);

'use babel';
'use strict';

function init() {
    (0, _helpers.toggleClass)(atom.config.get('atom-material-ui.colors.paintCursor'), 'paint-cursor');
}

function apply() {

    init();

    atom.config.onDidChange('atom-material-ui.colors.accentColor', function () {
        return _main2['default'].writeConfig();
    });

    atom.config.onDidChange('atom-material-ui.colors.abaseColor', function (value) {
        var baseColor = (0, _tinycolor22['default'])(value.newValue.toRGBAString());

        if (atom.config.get('atom-material-ui.colors.genAccent')) {
            var accentColor = baseColor.complement().saturate(20).lighten(5);
            return atom.config.set('atom-material-ui.colors.accentColor', accentColor.toRgbString());
        }

        _main2['default'].writeConfig();
    });

    atom.config.onDidChange('atom-material-ui.colors.predefinedColor', function (value) {
        var newValue = (0, _helpers.toCamelCase)(value.newValue);

        atom.config.set('atom-material-ui.colors.abaseColor', _colorTemplates2['default'][newValue].base);
        atom.config.set('atom-material-ui.colors.accentColor', _colorTemplates2['default'][newValue].accent);
    });

    atom.config.onDidChange('atom-material-ui.colors.paintCursor', function (value) {
        return (0, _helpers.toggleClass)(value.newValue, 'paint-cursor');
    });
}

exports['default'] = { apply: apply };
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9hdG9tLW1hdGVyaWFsLXVpL2xpYi9jb2xvci1zZXR0aW5ncy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7b0JBR2dCLFFBQVE7Ozs7dUJBQ2lCLFdBQVc7OzBCQUM5QixZQUFZOzs7OzhCQUNQLG1CQUFtQjs7OztBQU45QyxXQUFXLENBQUM7QUFDWixZQUFZLENBQUM7O0FBT2IsU0FBUyxJQUFJLEdBQUc7QUFDWiw4QkFBWSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0NBQ3ZGOztBQUVELFNBQVMsS0FBSyxHQUFHOztBQUViLFFBQUksRUFBRSxDQUFDOztBQUVQLFFBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLHFDQUFxQyxFQUFFO2VBQU0sa0JBQUksV0FBVyxFQUFFO0tBQUEsQ0FBQyxDQUFDOztBQUV4RixRQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxvQ0FBb0MsRUFBRSxVQUFDLEtBQUssRUFBSztBQUNyRSxZQUFJLFNBQVMsR0FBRyw2QkFBVSxLQUFLLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7O0FBRXpELFlBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUMsRUFBRTtBQUN0RCxnQkFBSSxXQUFXLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakUsbUJBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLEVBQUUsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7U0FDNUY7O0FBRUQsMEJBQUksV0FBVyxFQUFFLENBQUM7S0FDckIsQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLHlDQUF5QyxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQzFFLFlBQUksUUFBUSxHQUFHLDBCQUFZLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFM0MsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLEVBQUUsNEJBQWUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckYsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLEVBQUUsNEJBQWUsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDM0YsQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLHFDQUFxQyxFQUFFLFVBQUMsS0FBSztlQUFLLDBCQUFZLEtBQUssQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDO0tBQUEsQ0FBQyxDQUFDO0NBQzFIOztxQkFFYyxFQUFFLEtBQUssRUFBTCxLQUFLLEVBQUUiLCJmaWxlIjoiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tbWF0ZXJpYWwtdWkvbGliL2NvbG9yLXNldHRpbmdzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBhbXUgZnJvbSAnLi9tYWluJztcbmltcG9ydCB7IHRvQ2FtZWxDYXNlLCB0b2dnbGVDbGFzcyB9IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQgdGlueWNvbG9yIGZyb20gJ3Rpbnljb2xvcjInO1xuaW1wb3J0IGNvbG9yVGVtcGxhdGVzIGZyb20gJy4vY29sb3ItdGVtcGxhdGVzJztcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB0b2dnbGVDbGFzcyhhdG9tLmNvbmZpZy5nZXQoJ2F0b20tbWF0ZXJpYWwtdWkuY29sb3JzLnBhaW50Q3Vyc29yJyksICdwYWludC1jdXJzb3InKTtcbn1cblxuZnVuY3Rpb24gYXBwbHkoKSB7XG5cbiAgICBpbml0KCk7XG4gICAgXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tbWF0ZXJpYWwtdWkuY29sb3JzLmFjY2VudENvbG9yJywgKCkgPT4gYW11LndyaXRlQ29uZmlnKCkpO1xuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tbWF0ZXJpYWwtdWkuY29sb3JzLmFiYXNlQ29sb3InLCAodmFsdWUpID0+IHtcbiAgICAgICAgdmFyIGJhc2VDb2xvciA9IHRpbnljb2xvcih2YWx1ZS5uZXdWYWx1ZS50b1JHQkFTdHJpbmcoKSk7XG5cbiAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYXRvbS1tYXRlcmlhbC11aS5jb2xvcnMuZ2VuQWNjZW50JykpIHtcbiAgICAgICAgICAgIGxldCBhY2NlbnRDb2xvciA9IGJhc2VDb2xvci5jb21wbGVtZW50KCkuc2F0dXJhdGUoMjApLmxpZ2h0ZW4oNSk7XG4gICAgICAgICAgICByZXR1cm4gYXRvbS5jb25maWcuc2V0KCdhdG9tLW1hdGVyaWFsLXVpLmNvbG9ycy5hY2NlbnRDb2xvcicsIGFjY2VudENvbG9yLnRvUmdiU3RyaW5nKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgYW11LndyaXRlQ29uZmlnKCk7XG4gICAgfSk7XG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1tYXRlcmlhbC11aS5jb2xvcnMucHJlZGVmaW5lZENvbG9yJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IHRvQ2FtZWxDYXNlKHZhbHVlLm5ld1ZhbHVlKTtcblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F0b20tbWF0ZXJpYWwtdWkuY29sb3JzLmFiYXNlQ29sb3InLCBjb2xvclRlbXBsYXRlc1tuZXdWYWx1ZV0uYmFzZSk7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnYXRvbS1tYXRlcmlhbC11aS5jb2xvcnMuYWNjZW50Q29sb3InLCBjb2xvclRlbXBsYXRlc1tuZXdWYWx1ZV0uYWNjZW50KTtcbiAgICB9KTtcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLW1hdGVyaWFsLXVpLmNvbG9ycy5wYWludEN1cnNvcicsICh2YWx1ZSkgPT4gdG9nZ2xlQ2xhc3ModmFsdWUubmV3VmFsdWUsICdwYWludC1jdXJzb3InKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHsgYXBwbHkgfTtcbiJdfQ==