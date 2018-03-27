Object.defineProperty(exports, '__esModule', {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions

var _atom = require('atom');

// Dependencies
'use babel';var fs = undefined;
var path = undefined;
var helpers = undefined;

// Internal Variables
var bundledCsslintPath = undefined;

var loadDeps = function loadDeps() {
  if (!fs) {
    fs = require('fs-plus');
  }
  if (!path) {
    path = require('path');
  }
  if (!helpers) {
    helpers = require('atom-linter');
  }
};

exports['default'] = {
  activate: function activate() {
    var _this = this;

    this.idleCallbacks = new Set();
    var depsCallbackID = undefined;
    var installLinterCsslintDeps = function installLinterCsslintDeps() {
      _this.idleCallbacks['delete'](depsCallbackID);
      if (!atom.inSpecMode()) {
        require('atom-package-deps').install('linter-csslint');
      }
      loadDeps();

      // FIXME: Remove this after a few versions
      if (atom.config.get('linter-csslint.disableTimeout')) {
        atom.config.unset('linter-csslint.disableTimeout');
      }
    };
    depsCallbackID = window.requestIdleCallback(installLinterCsslintDeps);
    this.idleCallbacks.add(depsCallbackID);

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-csslint.executablePath', function (value) {
      _this.executablePath = value;
    }));
  },

  deactivate: function deactivate() {
    this.idleCallbacks.forEach(function (callbackID) {
      return window.cancelIdleCallback(callbackID);
    });
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    return {
      name: 'CSSLint',
      grammarScopes: ['source.css', 'source.html'],
      scope: 'file',
      lintsOnChange: false,
      lint: _asyncToGenerator(function* (textEditor) {
        loadDeps();
        var filePath = textEditor.getPath();
        var text = textEditor.getText();
        if (!filePath || text.length === 0) {
          // Empty or unsaved file
          return [];
        }

        var parameters = ['--format=json', filePath];

        var projectPath = atom.project.relativizePath(filePath)[0];
        var cwd = projectPath;
        if (!cwd) {
          cwd = path.dirname(filePath);
        }

        var execOptions = {
          cwd: cwd,
          uniqueKey: 'linter-csslint::' + filePath,
          timeout: 1000 * 30, // 30 seconds
          ignoreExitCode: true
        };

        var execPath = _this2.determineExecPath(_this2.executablePath, projectPath);

        var output = yield helpers.exec(execPath, parameters, execOptions);

        if (textEditor.getText() !== text) {
          // The editor contents have changed, tell Linter not to update
          return null;
        }

        var toReturn = [];

        if (output.length < 1) {
          // No output, no errors
          return toReturn;
        }

        var lintResult = undefined;
        try {
          lintResult = JSON.parse(output);
        } catch (e) {
          var excerpt = 'Invalid response received from CSSLint, check ' + 'your console for more details.';
          return [{
            severity: 'error',
            excerpt: excerpt,
            location: {
              file: filePath,
              position: helpers.generateRange(textEditor, 0)
            }
          }];
        }

        if (lintResult.messages.length < 1) {
          // Output, but no errors found
          return toReturn;
        }

        lintResult.messages.forEach(function (data) {
          var line = undefined;
          var col = undefined;
          if (!(data.line && data.col)) {
            line = 0;

            // Use the file start if a location wasn't defined
            col = 0;
          } else {
            line = data.line - 1;
            col = data.col - 1;
          }

          var severity = data.type === 'error' ? 'error' : 'warning';

          var msg = {
            severity: severity,
            excerpt: data.message,
            location: {
              file: filePath,
              position: helpers.generateRange(textEditor, line, col)
            }
          };
          if (data.rule.id && data.rule.desc) {
            msg.details = data.rule.desc + ' (' + data.rule.id + ')';
          }
          if (data.rule.url) {
            msg.url = data.rule.url;
          }

          toReturn.push(msg);
        });

        return toReturn;
      })
    };
  },

  determineExecPath: function determineExecPath(givenPath, projectPath) {
    var execPath = givenPath;
    if (execPath === '') {
      // Use the bundled copy of CSSLint
      var relativeBinPath = path.join('node_modules', '.bin', 'csslint');
      if (process.platform === 'win32') {
        relativeBinPath += '.cmd';
      }
      if (!bundledCsslintPath) {
        var packagePath = atom.packages.resolvePackagePath('linter-csslint');
        bundledCsslintPath = path.join(packagePath, relativeBinPath);
      }
      execPath = bundledCsslintPath;
      if (projectPath) {
        var localCssLintPath = path.join(projectPath, relativeBinPath);
        if (fs.existsSync(localCssLintPath)) {
          execPath = localCssLintPath;
        }
      }
    } else {
      // Normalize any usage of ~
      fs.normalize(execPath);
    }
    return execPath;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9saW50ZXItY3NzbGludC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFHb0MsTUFBTTs7O0FBSDFDLFdBQVcsQ0FBQyxBQU1aLElBQUksRUFBRSxZQUFBLENBQUM7QUFDUCxJQUFJLElBQUksWUFBQSxDQUFDO0FBQ1QsSUFBSSxPQUFPLFlBQUEsQ0FBQzs7O0FBR1osSUFBSSxrQkFBa0IsWUFBQSxDQUFDOztBQUV2QixJQUFNLFFBQVEsR0FBRyxTQUFYLFFBQVEsR0FBUztBQUNyQixNQUFJLENBQUMsRUFBRSxFQUFFO0FBQ1AsTUFBRSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUN6QjtBQUNELE1BQUksQ0FBQyxJQUFJLEVBQUU7QUFDVCxRQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ3hCO0FBQ0QsTUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLFdBQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7R0FDbEM7Q0FDRixDQUFDOztxQkFFYTtBQUNiLFVBQVEsRUFBQSxvQkFBRzs7O0FBQ1QsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQy9CLFFBQUksY0FBYyxZQUFBLENBQUM7QUFDbkIsUUFBTSx3QkFBd0IsR0FBRyxTQUEzQix3QkFBd0IsR0FBUztBQUNyQyxZQUFLLGFBQWEsVUFBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzFDLFVBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7QUFDdEIsZUFBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7T0FDeEQ7QUFDRCxjQUFRLEVBQUUsQ0FBQzs7O0FBR1gsVUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxFQUFFO0FBQ3BELFlBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7T0FDcEQ7S0FDRixDQUFDO0FBQ0Ysa0JBQWMsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUN0RSxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFdkMsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQztBQUMvQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FDcEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDOUQsWUFBSyxjQUFjLEdBQUcsS0FBSyxDQUFDO0tBQzdCLENBQUMsQ0FDSCxDQUFDO0dBQ0g7O0FBRUQsWUFBVSxFQUFBLHNCQUFHO0FBQ1gsUUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQSxVQUFVO2FBQUksTUFBTSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQztLQUFBLENBQUMsQ0FBQztBQUNoRixRQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7R0FDOUI7O0FBRUQsZUFBYSxFQUFBLHlCQUFHOzs7QUFDZCxXQUFPO0FBQ0wsVUFBSSxFQUFFLFNBQVM7QUFDZixtQkFBYSxFQUFFLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQztBQUM1QyxXQUFLLEVBQUUsTUFBTTtBQUNiLG1CQUFhLEVBQUUsS0FBSztBQUNwQixVQUFJLG9CQUFFLFdBQU8sVUFBVSxFQUFLO0FBQzFCLGdCQUFRLEVBQUUsQ0FBQztBQUNYLFlBQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN0QyxZQUFNLElBQUksR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsWUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs7QUFFbEMsaUJBQU8sRUFBRSxDQUFDO1NBQ1g7O0FBRUQsWUFBTSxVQUFVLEdBQUcsQ0FDakIsZUFBZSxFQUNmLFFBQVEsQ0FDVCxDQUFDOztBQUVGLFlBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdELFlBQUksR0FBRyxHQUFHLFdBQVcsQ0FBQztBQUN0QixZQUFJLENBQUMsR0FBRyxFQUFFO0FBQ1IsYUFBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDOUI7O0FBRUQsWUFBTSxXQUFXLEdBQUc7QUFDbEIsYUFBRyxFQUFILEdBQUc7QUFDSCxtQkFBUyx1QkFBcUIsUUFBUSxBQUFFO0FBQ3hDLGlCQUFPLEVBQUUsSUFBSSxHQUFHLEVBQUU7QUFDbEIsd0JBQWMsRUFBRSxJQUFJO1NBQ3JCLENBQUM7O0FBRUYsWUFBTSxRQUFRLEdBQUcsT0FBSyxpQkFBaUIsQ0FBQyxPQUFLLGNBQWMsRUFBRSxXQUFXLENBQUMsQ0FBQzs7QUFFMUUsWUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7O0FBRXJFLFlBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUksRUFBRTs7QUFFakMsaUJBQU8sSUFBSSxDQUFDO1NBQ2I7O0FBRUQsWUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDOztBQUVwQixZQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFOztBQUVyQixpQkFBTyxRQUFRLENBQUM7U0FDakI7O0FBRUQsWUFBSSxVQUFVLFlBQUEsQ0FBQztBQUNmLFlBQUk7QUFDRixvQkFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDakMsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGNBQU0sT0FBTyxHQUFHLGdEQUFnRCxHQUM5RCxnQ0FBZ0MsQ0FBQztBQUNuQyxpQkFBTyxDQUFDO0FBQ04sb0JBQVEsRUFBRSxPQUFPO0FBQ2pCLG1CQUFPLEVBQVAsT0FBTztBQUNQLG9CQUFRLEVBQUU7QUFDUixrQkFBSSxFQUFFLFFBQVE7QUFDZCxzQkFBUSxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQzthQUMvQztXQUNGLENBQUMsQ0FBQztTQUNKOztBQUVELFlBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFOztBQUVsQyxpQkFBTyxRQUFRLENBQUM7U0FDakI7O0FBRUQsa0JBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSSxFQUFLO0FBQ3BDLGNBQUksSUFBSSxZQUFBLENBQUM7QUFDVCxjQUFJLEdBQUcsWUFBQSxDQUFDO0FBQ1IsY0FBSSxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQSxBQUFDLEVBQUU7QUFFM0IsZ0JBQUksR0FBVSxDQUFDOzs7QUFBVCxlQUFHLEdBQVEsQ0FBQztXQUNwQixNQUFNO0FBQ0osZ0JBQUksR0FBVSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUM7QUFBckIsZUFBRyxHQUFvQixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7V0FDM0M7O0FBRUQsY0FBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLEdBQUcsT0FBTyxHQUFHLFNBQVMsQ0FBQzs7QUFFN0QsY0FBTSxHQUFHLEdBQUc7QUFDVixvQkFBUSxFQUFSLFFBQVE7QUFDUixtQkFBTyxFQUFFLElBQUksQ0FBQyxPQUFPO0FBQ3JCLG9CQUFRLEVBQUU7QUFDUixrQkFBSSxFQUFFLFFBQVE7QUFDZCxzQkFBUSxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUM7YUFDdkQ7V0FDRixDQUFDO0FBQ0YsY0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtBQUNsQyxlQUFHLENBQUMsT0FBTyxHQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFHLENBQUM7V0FDckQ7QUFDRCxjQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ2pCLGVBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7V0FDekI7O0FBRUQsa0JBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDcEIsQ0FBQyxDQUFDOztBQUVILGVBQU8sUUFBUSxDQUFDO09BQ2pCLENBQUE7S0FDRixDQUFDO0dBQ0g7O0FBRUQsbUJBQWlCLEVBQUEsMkJBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRTtBQUN4QyxRQUFJLFFBQVEsR0FBRyxTQUFTLENBQUM7QUFDekIsUUFBSSxRQUFRLEtBQUssRUFBRSxFQUFFOztBQUVuQixVQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDbkUsVUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sRUFBRTtBQUNoQyx1QkFBZSxJQUFJLE1BQU0sQ0FBQztPQUMzQjtBQUNELFVBQUksQ0FBQyxrQkFBa0IsRUFBRTtBQUN2QixZQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDdkUsMEJBQWtCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7T0FDOUQ7QUFDRCxjQUFRLEdBQUcsa0JBQWtCLENBQUM7QUFDOUIsVUFBSSxXQUFXLEVBQUU7QUFDZixZQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ2pFLFlBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO0FBQ25DLGtCQUFRLEdBQUcsZ0JBQWdCLENBQUM7U0FDN0I7T0FDRjtLQUNGLE1BQU07O0FBRUwsUUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN4QjtBQUNELFdBQU8sUUFBUSxDQUFDO0dBQ2pCO0NBQ0YiLCJmaWxlIjoiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1jc3NsaW50L2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXMsIGltcG9ydC9leHRlbnNpb25zXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5cbi8vIERlcGVuZGVuY2llc1xubGV0IGZzO1xubGV0IHBhdGg7XG5sZXQgaGVscGVycztcblxuLy8gSW50ZXJuYWwgVmFyaWFibGVzXG5sZXQgYnVuZGxlZENzc2xpbnRQYXRoO1xuXG5jb25zdCBsb2FkRGVwcyA9ICgpID0+IHtcbiAgaWYgKCFmcykge1xuICAgIGZzID0gcmVxdWlyZSgnZnMtcGx1cycpO1xuICB9XG4gIGlmICghcGF0aCkge1xuICAgIHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG4gIH1cbiAgaWYgKCFoZWxwZXJzKSB7XG4gICAgaGVscGVycyA9IHJlcXVpcmUoJ2F0b20tbGludGVyJyk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzID0gbmV3IFNldCgpO1xuICAgIGxldCBkZXBzQ2FsbGJhY2tJRDtcbiAgICBjb25zdCBpbnN0YWxsTGludGVyQ3NzbGludERlcHMgPSAoKSA9PiB7XG4gICAgICB0aGlzLmlkbGVDYWxsYmFja3MuZGVsZXRlKGRlcHNDYWxsYmFja0lEKTtcbiAgICAgIGlmICghYXRvbS5pblNwZWNNb2RlKCkpIHtcbiAgICAgICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdsaW50ZXItY3NzbGludCcpO1xuICAgICAgfVxuICAgICAgbG9hZERlcHMoKTtcblxuICAgICAgLy8gRklYTUU6IFJlbW92ZSB0aGlzIGFmdGVyIGEgZmV3IHZlcnNpb25zXG4gICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItY3NzbGludC5kaXNhYmxlVGltZW91dCcpKSB7XG4gICAgICAgIGF0b20uY29uZmlnLnVuc2V0KCdsaW50ZXItY3NzbGludC5kaXNhYmxlVGltZW91dCcpO1xuICAgICAgfVxuICAgIH07XG4gICAgZGVwc0NhbGxiYWNrSUQgPSB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFjayhpbnN0YWxsTGludGVyQ3NzbGludERlcHMpO1xuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5hZGQoZGVwc0NhbGxiYWNrSUQpO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWNzc2xpbnQuZXhlY3V0YWJsZVBhdGgnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5leGVjdXRhYmxlUGF0aCA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgKTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5mb3JFYWNoKGNhbGxiYWNrSUQgPT4gd2luZG93LmNhbmNlbElkbGVDYWxsYmFjayhjYWxsYmFja0lEKSk7XG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmNsZWFyKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfSxcblxuICBwcm92aWRlTGludGVyKCkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnQ1NTTGludCcsXG4gICAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5jc3MnLCAnc291cmNlLmh0bWwnXSxcbiAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICBsaW50c09uQ2hhbmdlOiBmYWxzZSxcbiAgICAgIGxpbnQ6IGFzeW5jICh0ZXh0RWRpdG9yKSA9PiB7XG4gICAgICAgIGxvYWREZXBzKCk7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgICAgIGNvbnN0IHRleHQgPSB0ZXh0RWRpdG9yLmdldFRleHQoKTtcbiAgICAgICAgaWYgKCFmaWxlUGF0aCB8fCB0ZXh0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIC8vIEVtcHR5IG9yIHVuc2F2ZWQgZmlsZVxuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSBbXG4gICAgICAgICAgJy0tZm9ybWF0PWpzb24nLFxuICAgICAgICAgIGZpbGVQYXRoLFxuICAgICAgICBdO1xuXG4gICAgICAgIGNvbnN0IHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVQYXRoKVswXTtcbiAgICAgICAgbGV0IGN3ZCA9IHByb2plY3RQYXRoO1xuICAgICAgICBpZiAoIWN3ZCkge1xuICAgICAgICAgIGN3ZCA9IHBhdGguZGlybmFtZShmaWxlUGF0aCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBleGVjT3B0aW9ucyA9IHtcbiAgICAgICAgICBjd2QsXG4gICAgICAgICAgdW5pcXVlS2V5OiBgbGludGVyLWNzc2xpbnQ6OiR7ZmlsZVBhdGh9YCxcbiAgICAgICAgICB0aW1lb3V0OiAxMDAwICogMzAsIC8vIDMwIHNlY29uZHNcbiAgICAgICAgICBpZ25vcmVFeGl0Q29kZTogdHJ1ZSxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBleGVjUGF0aCA9IHRoaXMuZGV0ZXJtaW5lRXhlY1BhdGgodGhpcy5leGVjdXRhYmxlUGF0aCwgcHJvamVjdFBhdGgpO1xuXG4gICAgICAgIGNvbnN0IG91dHB1dCA9IGF3YWl0IGhlbHBlcnMuZXhlYyhleGVjUGF0aCwgcGFyYW1ldGVycywgZXhlY09wdGlvbnMpO1xuXG4gICAgICAgIGlmICh0ZXh0RWRpdG9yLmdldFRleHQoKSAhPT0gdGV4dCkge1xuICAgICAgICAgIC8vIFRoZSBlZGl0b3IgY29udGVudHMgaGF2ZSBjaGFuZ2VkLCB0ZWxsIExpbnRlciBub3QgdG8gdXBkYXRlXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0b1JldHVybiA9IFtdO1xuXG4gICAgICAgIGlmIChvdXRwdXQubGVuZ3RoIDwgMSkge1xuICAgICAgICAgIC8vIE5vIG91dHB1dCwgbm8gZXJyb3JzXG4gICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGxpbnRSZXN1bHQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbGludFJlc3VsdCA9IEpTT04ucGFyc2Uob3V0cHV0KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnN0IGV4Y2VycHQgPSAnSW52YWxpZCByZXNwb25zZSByZWNlaXZlZCBmcm9tIENTU0xpbnQsIGNoZWNrICcgK1xuICAgICAgICAgICAgJ3lvdXIgY29uc29sZSBmb3IgbW9yZSBkZXRhaWxzLic7XG4gICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgICAgICAgIGV4Y2VycHQsXG4gICAgICAgICAgICBsb2NhdGlvbjoge1xuICAgICAgICAgICAgICBmaWxlOiBmaWxlUGF0aCxcbiAgICAgICAgICAgICAgcG9zaXRpb246IGhlbHBlcnMuZ2VuZXJhdGVSYW5nZSh0ZXh0RWRpdG9yLCAwKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfV07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGludFJlc3VsdC5tZXNzYWdlcy5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgLy8gT3V0cHV0LCBidXQgbm8gZXJyb3JzIGZvdW5kXG4gICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGludFJlc3VsdC5tZXNzYWdlcy5mb3JFYWNoKChkYXRhKSA9PiB7XG4gICAgICAgICAgbGV0IGxpbmU7XG4gICAgICAgICAgbGV0IGNvbDtcbiAgICAgICAgICBpZiAoIShkYXRhLmxpbmUgJiYgZGF0YS5jb2wpKSB7XG4gICAgICAgICAgICAvLyBVc2UgdGhlIGZpbGUgc3RhcnQgaWYgYSBsb2NhdGlvbiB3YXNuJ3QgZGVmaW5lZFxuICAgICAgICAgICAgW2xpbmUsIGNvbF0gPSBbMCwgMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFtsaW5lLCBjb2xdID0gW2RhdGEubGluZSAtIDEsIGRhdGEuY29sIC0gMV07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgc2V2ZXJpdHkgPSBkYXRhLnR5cGUgPT09ICdlcnJvcicgPyAnZXJyb3InIDogJ3dhcm5pbmcnO1xuXG4gICAgICAgICAgY29uc3QgbXNnID0ge1xuICAgICAgICAgICAgc2V2ZXJpdHksXG4gICAgICAgICAgICBleGNlcnB0OiBkYXRhLm1lc3NhZ2UsXG4gICAgICAgICAgICBsb2NhdGlvbjoge1xuICAgICAgICAgICAgICBmaWxlOiBmaWxlUGF0aCxcbiAgICAgICAgICAgICAgcG9zaXRpb246IGhlbHBlcnMuZ2VuZXJhdGVSYW5nZSh0ZXh0RWRpdG9yLCBsaW5lLCBjb2wpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGlmIChkYXRhLnJ1bGUuaWQgJiYgZGF0YS5ydWxlLmRlc2MpIHtcbiAgICAgICAgICAgIG1zZy5kZXRhaWxzID0gYCR7ZGF0YS5ydWxlLmRlc2N9ICgke2RhdGEucnVsZS5pZH0pYDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGRhdGEucnVsZS51cmwpIHtcbiAgICAgICAgICAgIG1zZy51cmwgPSBkYXRhLnJ1bGUudXJsO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRvUmV0dXJuLnB1c2gobXNnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgfSxcbiAgICB9O1xuICB9LFxuXG4gIGRldGVybWluZUV4ZWNQYXRoKGdpdmVuUGF0aCwgcHJvamVjdFBhdGgpIHtcbiAgICBsZXQgZXhlY1BhdGggPSBnaXZlblBhdGg7XG4gICAgaWYgKGV4ZWNQYXRoID09PSAnJykge1xuICAgICAgLy8gVXNlIHRoZSBidW5kbGVkIGNvcHkgb2YgQ1NTTGludFxuICAgICAgbGV0IHJlbGF0aXZlQmluUGF0aCA9IHBhdGguam9pbignbm9kZV9tb2R1bGVzJywgJy5iaW4nLCAnY3NzbGludCcpO1xuICAgICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcbiAgICAgICAgcmVsYXRpdmVCaW5QYXRoICs9ICcuY21kJztcbiAgICAgIH1cbiAgICAgIGlmICghYnVuZGxlZENzc2xpbnRQYXRoKSB7XG4gICAgICAgIGNvbnN0IHBhY2thZ2VQYXRoID0gYXRvbS5wYWNrYWdlcy5yZXNvbHZlUGFja2FnZVBhdGgoJ2xpbnRlci1jc3NsaW50Jyk7XG4gICAgICAgIGJ1bmRsZWRDc3NsaW50UGF0aCA9IHBhdGguam9pbihwYWNrYWdlUGF0aCwgcmVsYXRpdmVCaW5QYXRoKTtcbiAgICAgIH1cbiAgICAgIGV4ZWNQYXRoID0gYnVuZGxlZENzc2xpbnRQYXRoO1xuICAgICAgaWYgKHByb2plY3RQYXRoKSB7XG4gICAgICAgIGNvbnN0IGxvY2FsQ3NzTGludFBhdGggPSBwYXRoLmpvaW4ocHJvamVjdFBhdGgsIHJlbGF0aXZlQmluUGF0aCk7XG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGxvY2FsQ3NzTGludFBhdGgpKSB7XG4gICAgICAgICAgZXhlY1BhdGggPSBsb2NhbENzc0xpbnRQYXRoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5vcm1hbGl6ZSBhbnkgdXNhZ2Ugb2YgflxuICAgICAgZnMubm9ybWFsaXplKGV4ZWNQYXRoKTtcbiAgICB9XG4gICAgcmV0dXJuIGV4ZWNQYXRoO1xuICB9LFxufTtcbiJdfQ==