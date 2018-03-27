Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _configSchema = require('./config-schema');

var _configSchema2 = _interopRequireDefault(_configSchema);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _colorSettings = require('./color-settings');

var _colorSettings2 = _interopRequireDefault(_colorSettings);

var _tabsSettings = require('./tabs-settings');

var _tabsSettings2 = _interopRequireDefault(_tabsSettings);

var _treeViewSettings = require('./tree-view-settings');

var _treeViewSettings2 = _interopRequireDefault(_treeViewSettings);

var _tinycolor2 = require('tinycolor2');

var _tinycolor22 = _interopRequireDefault(_tinycolor2);

var _updateConfigSchema = require('./update-config-schema');

'use babel';
'use strict';

exports['default'] = {
    config: _configSchema2['default'],

    writeConfig: function writeConfig(options) {
        var accentColor = atom.config.get('atom-material-ui.colors.accentColor').toRGBAString();
        var baseColor = atom.config.get('atom-material-ui.colors.abaseColor').toRGBAString();
        var accentTextColor = '#666';
        var luminance = (0, _tinycolor22['default'])(baseColor).getLuminance();

        if (luminance <= 0.3 && luminance > 0.22) {
            accentTextColor = 'rgba(255,255,255,0.9)';
        } else if (luminance <= 0.22) {
            accentTextColor = 'rgba(255,255,255,0.8)';
        } else if (luminance > 0.3) {
            accentTextColor = 'rgba(0,0,0,0.6)';
        }

        /**
        * This is kind of against Airbnb's stylguide, but produces a much
        * better output and is readable.
        */
        var config = '@accent-color: ' + accentColor + ';\n' + ('@accent-text-color: ' + accentTextColor + ';\n') + ('@base-color: ' + baseColor + ';\n');

        _fs2['default'].writeFile(__dirname + '/../styles/custom.less', config, 'utf8', function () {
            if (!options || !options.noReload) {
                var themePack = atom.packages.getLoadedPackage('atom-material-ui');

                if (themePack) {
                    themePack.deactivate();
                    setImmediate(function () {
                        return themePack.activate();
                    });
                }
            }
            if (options && options.callback && typeof options.callback === 'function') {
                options.callback();
            }
        });
    },

    activate: function activate() {
        (0, _updateConfigSchema.apply)();
        _settings2['default'].apply();
        _colorSettings2['default'].apply();
        setImmediate(function () {
            return _tabsSettings2['default'].apply();
        });
        this.writeConfig({ noReload: true });
    },

    deactivate: function deactivate() {
        _treeViewSettings2['default'].toggleBlendTreeView(false);
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9hdG9tLW1hdGVyaWFsLXVpL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztrQkFHZSxJQUFJOzs7OzRCQUNBLGlCQUFpQjs7Ozt3QkFDZixZQUFZOzs7OzZCQUNQLGtCQUFrQjs7Ozs0QkFDbkIsaUJBQWlCOzs7O2dDQUNiLHNCQUFzQjs7OzswQkFDN0IsWUFBWTs7OztrQ0FDSSx3QkFBd0I7O0FBVjlELFdBQVcsQ0FBQztBQUNaLFlBQVksQ0FBQzs7cUJBV0U7QUFDWCxVQUFNLDJCQUFBOztBQUVOLGVBQVcsRUFBQSxxQkFBQyxPQUFPLEVBQUU7QUFDakIsWUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUN4RixZQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3JGLFlBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQztBQUM3QixZQUFJLFNBQVMsR0FBRyw2QkFBVSxTQUFTLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7QUFFcEQsWUFBSSxTQUFTLElBQUksR0FBRyxJQUFJLFNBQVMsR0FBRyxJQUFJLEVBQUU7QUFDdEMsMkJBQWUsR0FBRyx1QkFBdUIsQ0FBQztTQUM3QyxNQUFNLElBQUksU0FBUyxJQUFJLElBQUksRUFBRTtBQUMxQiwyQkFBZSxHQUFHLHVCQUF1QixDQUFDO1NBQzdDLE1BQU0sSUFBSSxTQUFTLEdBQUcsR0FBRyxFQUFFO0FBQ3hCLDJCQUFlLEdBQUcsaUJBQWlCLENBQUM7U0FDdkM7Ozs7OztBQU1ELFlBQUksTUFBTSxHQUFHLG9CQUFrQixXQUFXLHFDQUNOLGVBQWUsU0FBSyxzQkFDM0IsU0FBUyxTQUFLLENBQUM7O0FBRTVDLHdCQUFHLFNBQVMsQ0FBSSxTQUFTLDZCQUEwQixNQUFNLEVBQUUsTUFBTSxFQUFFLFlBQU07QUFDckUsZ0JBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO0FBQy9CLG9CQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLENBQUM7O0FBRW5FLG9CQUFJLFNBQVMsRUFBRTtBQUNYLDZCQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDdkIsZ0NBQVksQ0FBQzsrQkFBTSxTQUFTLENBQUMsUUFBUSxFQUFFO3FCQUFBLENBQUMsQ0FBQztpQkFDNUM7YUFDSjtBQUNELGdCQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsUUFBUSxJQUFJLE9BQU8sT0FBTyxDQUFDLFFBQVEsS0FBSyxVQUFVLEVBQUU7QUFDdkUsdUJBQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUN0QjtTQUNKLENBQUMsQ0FBQztLQUNOOztBQUVELFlBQVEsRUFBQSxvQkFBRztBQUNQLHdDQUFjLENBQUM7QUFDZiw4QkFBUyxLQUFLLEVBQUUsQ0FBQztBQUNqQixtQ0FBYyxLQUFLLEVBQUUsQ0FBQztBQUN0QixvQkFBWSxDQUFDO21CQUFNLDBCQUFhLEtBQUssRUFBRTtTQUFBLENBQUMsQ0FBQztBQUN6QyxZQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7S0FDeEM7O0FBRUQsY0FBVSxFQUFBLHNCQUFHO0FBQ1Qsc0NBQWlCLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQy9DO0NBQ0oiLCJmaWxlIjoiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tbWF0ZXJpYWwtdWkvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWctc2NoZW1hJztcbmltcG9ydCBzZXR0aW5ncyBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCBjb2xvclNldHRpbmdzIGZyb20gJy4vY29sb3Itc2V0dGluZ3MnO1xuaW1wb3J0IHRhYnNTZXR0aW5ncyBmcm9tICcuL3RhYnMtc2V0dGluZ3MnO1xuaW1wb3J0IHRyZWVWaWV3U2V0dGluZ3MgZnJvbSAnLi90cmVlLXZpZXctc2V0dGluZ3MnO1xuaW1wb3J0IHRpbnljb2xvciBmcm9tICd0aW55Y29sb3IyJztcbmltcG9ydCB7IGFwcGx5IGFzIHVwZGF0ZVNjaGVtYSB9IGZyb20gJy4vdXBkYXRlLWNvbmZpZy1zY2hlbWEnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgY29uZmlnLFxuXG4gICAgd3JpdGVDb25maWcob3B0aW9ucykge1xuICAgICAgICB2YXIgYWNjZW50Q29sb3IgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tbWF0ZXJpYWwtdWkuY29sb3JzLmFjY2VudENvbG9yJykudG9SR0JBU3RyaW5nKCk7XG4gICAgICAgIHZhciBiYXNlQ29sb3IgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tbWF0ZXJpYWwtdWkuY29sb3JzLmFiYXNlQ29sb3InKS50b1JHQkFTdHJpbmcoKTtcbiAgICAgICAgdmFyIGFjY2VudFRleHRDb2xvciA9ICcjNjY2JztcbiAgICAgICAgdmFyIGx1bWluYW5jZSA9IHRpbnljb2xvcihiYXNlQ29sb3IpLmdldEx1bWluYW5jZSgpO1xuXG4gICAgICAgIGlmIChsdW1pbmFuY2UgPD0gMC4zICYmIGx1bWluYW5jZSA+IDAuMjIpIHtcbiAgICAgICAgICAgIGFjY2VudFRleHRDb2xvciA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuOSknO1xuICAgICAgICB9IGVsc2UgaWYgKGx1bWluYW5jZSA8PSAwLjIyKSB7XG4gICAgICAgICAgICBhY2NlbnRUZXh0Q29sb3IgPSAncmdiYSgyNTUsMjU1LDI1NSwwLjgpJztcbiAgICAgICAgfSBlbHNlIGlmIChsdW1pbmFuY2UgPiAwLjMpIHtcbiAgICAgICAgICAgIGFjY2VudFRleHRDb2xvciA9ICdyZ2JhKDAsMCwwLDAuNiknO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogVGhpcyBpcyBraW5kIG9mIGFnYWluc3QgQWlyYm5iJ3Mgc3R5bGd1aWRlLCBidXQgcHJvZHVjZXMgYSBtdWNoXG4gICAgICAgICogYmV0dGVyIG91dHB1dCBhbmQgaXMgcmVhZGFibGUuXG4gICAgICAgICovXG4gICAgICAgIHZhciBjb25maWcgPSBgQGFjY2VudC1jb2xvcjogJHthY2NlbnRDb2xvcn07XFxuYCArXG4gICAgICAgICAgICAgICAgICAgICBgQGFjY2VudC10ZXh0LWNvbG9yOiAke2FjY2VudFRleHRDb2xvcn07XFxuYCArXG4gICAgICAgICAgICAgICAgICAgICBgQGJhc2UtY29sb3I6ICR7YmFzZUNvbG9yfTtcXG5gO1xuXG4gICAgICAgIGZzLndyaXRlRmlsZShgJHtfX2Rpcm5hbWV9Ly4uL3N0eWxlcy9jdXN0b20ubGVzc2AsIGNvbmZpZywgJ3V0ZjgnLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMubm9SZWxvYWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhlbWVQYWNrID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKCdhdG9tLW1hdGVyaWFsLXVpJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhlbWVQYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoZW1lUGFjay5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZSgoKSA9PiB0aGVtZVBhY2suYWN0aXZhdGUoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5jYWxsYmFjayAmJiB0eXBlb2Ygb3B0aW9ucy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFjdGl2YXRlKCkge1xuICAgICAgICB1cGRhdGVTY2hlbWEoKTtcbiAgICAgICAgc2V0dGluZ3MuYXBwbHkoKTtcbiAgICAgICAgY29sb3JTZXR0aW5ncy5hcHBseSgpO1xuICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4gdGFic1NldHRpbmdzLmFwcGx5KCkpO1xuICAgICAgICB0aGlzLndyaXRlQ29uZmlnKHsgbm9SZWxvYWQ6IHRydWUgfSk7XG4gICAgfSxcblxuICAgIGRlYWN0aXZhdGUoKSB7XG4gICAgICAgIHRyZWVWaWV3U2V0dGluZ3MudG9nZ2xlQmxlbmRUcmVlVmlldyhmYWxzZSk7XG4gICAgfVxufTtcbiJdfQ==