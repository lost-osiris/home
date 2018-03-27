(function() {
  var CompositeDisposable, path, prefixPath;

  CompositeDisposable = require('atom').CompositeDisposable;

  path = require('path');

  prefixPath = null;

  module.exports = {
    config: {
      noConfigDisable: {
        title: 'Disable when no sass-lint config file is found in your project root',
        type: 'boolean',
        description: 'and a .sass-lint.yml file is not specified in the .sass-lint.yml Path option',
        "default": false
      },
      resolvePathsRelativeToConfig: {
        title: 'Resolve paths in configuration relative to config file',
        type: 'boolean',
        description: 'Instead of the default where paths are resolved relative to the project root',
        "default": 'false'
      },
      configFile: {
        title: '.sass-lint.yml Config File',
        description: 'A .sass-lint.yml file to use/fallback to if no config file is found in the current project root',
        type: 'string',
        "default": ''
      },
      globalNodePath: {
        title: 'Global Node Installation Path',
        description: 'Run `npm get prefix` and paste the result here',
        type: 'string',
        "default": ''
      },
      globalSassLint: {
        title: 'Use global sass-lint installation',
        description: "The latest sass-lint is included in this package but if you\'d like to use a globally installed one enable it here.\n\nMake sure sass-lint is installed globally and is in your $PATH",
        type: 'boolean',
        "default": false
      }
    },
    activate: function() {
      require('atom-package-deps').install('linter-sass-lint');
      this.subs = new CompositeDisposable;
      this.subs.add(atom.config.observe('linter-sass-lint.noConfigDisable', (function(_this) {
        return function(noConfigDisable) {
          return _this.noConfigDisable = noConfigDisable;
        };
      })(this)));
      this.subs.add(atom.config.observe('linter-sass-lint.configFile', (function(_this) {
        return function(configFile) {
          return _this.configFile = configFile;
        };
      })(this)));
      this.subs.add(atom.config.observe('linter-sass-lint.globalSassLint', (function(_this) {
        return function(globalSassLint) {
          return _this.globalSassLint = globalSassLint;
        };
      })(this)));
      this.subs.add(atom.config.observe('linter-sass-lint.globalNodePath', (function(_this) {
        return function(globalNodePath) {
          return _this.globalPath = globalNodePath;
        };
      })(this)));
      return this.subs.add(atom.config.observe('linter-sass-lint.resolvePathsRelativeToConfig', (function(_this) {
        return function(resolvePathsRelativeToConfig) {
          return _this.resolvePathsRelativeToConfig = resolvePathsRelativeToConfig;
        };
      })(this)));
    },
    deactivate: function() {
      return this.subs.dispose();
    },
    getFilePath: function(absolutePath, configFilePath) {
      path = require('path');
      if (this.resolvePathsRelativeToConfig) {
        return path.relative(path.dirname(configFilePath), absolutePath);
      } else {
        return atom.project.relativizePath(absolutePath)[1];
      }
    },
    findExecutable: function() {
      var consistentEnv, e, env, npmCommand, spawnSync;
      spawnSync = require('child_process').spawnSync;
      consistentEnv = require('consistent-env');
      if (!this.globalSassLint) {
        return require(path.join(__dirname, '..', 'node_modules', 'sass-lint'));
      }
      if (this.globalPath === '' && prefixPath === null) {
        npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        env = Object.assign({}, consistentEnv());
        try {
          prefixPath = spawnSync(npmCommand, ['get', 'prefix'], {
            env: env
          }).output[1].toString().trim();
        } catch (error1) {
          e = error1;
          throw new Error('prefix');
        }
      }
      if (process.platform === 'win32') {
        return require(path.join(this.globalPath || prefixPath, 'node_modules', 'sass-lint'));
      }
      return require(path.join(this.globalPath || prefixPath, 'lib', 'node_modules', 'sass-lint'));
    },
    provideLinter: function() {
      var provider;
      return provider = {
        name: 'sass-lint',
        grammarScopes: ['source.css.scss', 'source.scss', 'source.css.sass', 'source.sass'],
        scope: 'file',
        lintOnFly: true,
        lint: (function(_this) {
          return function(editor) {
            var colEndIdx, compiledConfig, config, configExt, error, filePath, find, globalConfig, globule, helpers, line, lineIdx, linter, match, messages, projectConfig, relativePath, result, text;
            find = require('atom-linter').find;
            helpers = require('./helpers');
            globule = require('globule');
            configExt = '.sass-lint.yml';
            filePath = editor.getPath();
            projectConfig = find(filePath, configExt);
            globalConfig = _this.configFile === '' ? null : _this.configFile;
            config = projectConfig !== null ? projectConfig : globalConfig;
            try {
              linter = _this.findExecutable();
            } catch (error1) {
              error = error1;
              if (error.message === 'prefix') {
                atom.notifications.addError("**Error getting $PATH - linter-sass-lint**\n\n\nYou've enabled using global sass-lint without specifying a prefix so we tried to.\nUnfortunately we were unable to execute `npm get prefix` for you..\n\nPlease make sure Atom is getting $PATH correctly or set it directly in the `linter-sass-lint` settings.", {
                  dismissable: true
                });
              }
              return [];
              atom.notifications.addWarning("**Sass-lint package missing**\n\nThe sass-lint package cannot be found, please check sass-lint is installed globally. \n\nYou can always use the sass-lint pacakage included with linter-sass-lint by disabling the\n`Use global sass-lint installation` option", {
                dismissable: true
              });
              return [];
            }
            if (config !== null && path.extname(config) !== '.yml') {
              atom.notifications.addWarning("**Config File Error**\n\nThe config file you specified doesn't seem to be a .yml file.\n\nPlease see the sass-lint [documentation](https://github.com/sasstools/sass-lint/tree/master/docs) on how to create a config file.");
            }
            if (config === null && _this.noConfigDisable === false) {
              return [
                {
                  type: 'Info',
                  text: 'No .sass-lint.yml config file detected or specified. Please check your settings',
                  filePath: filePath,
                  range: [[0, 0], [0, 0]]
                }
              ];
            } else if (config === null && _this.noConfigDisable === true) {
              return [];
            }
            try {
              compiledConfig = linter.getConfig({}, config);
              relativePath = _this.getFilePath(filePath, config);
              if (globule.isMatch(compiledConfig.files.include, relativePath) && !globule.isMatch(compiledConfig.files.ignore, relativePath)) {
                result = linter.lintText({
                  text: editor.getText(),
                  format: helpers.getFileSyntax(filePath),
                  filename: filePath
                }, {}, config);
              }
            } catch (error1) {
              error = error1;
              messages = [];
              match = error.message.match(/Parsing error at [^:]+: (.*) starting from line #(\d+)/);
              if (match) {
                text = "Parsing error: " + match[1] + ".";
                lineIdx = Number(match[2]) - 1;
                line = editor.lineTextForBufferRow(lineIdx);
                colEndIdx = line ? line.length : 1;
                return [
                  {
                    type: 'Error',
                    text: text,
                    filePath: filePath,
                    range: [[lineIdx, 0], [lineIdx, colEndIdx]]
                  }
                ];
              } else {
                console.log('linter-sass-lint', error);
                return [
                  {
                    type: 'Error',
                    text: 'Unexpected parse error in file',
                    filePath: filePath,
                    range: [[lineIdx, 0], [lineIdx, colEndIdx]]
                  }
                ];
              }
              return [];
            }
            if (result) {
              return result.messages.map(function(msg) {
                var col, html, ruleHref;
                line = msg.line ? msg.line - 1 : 0;
                col = msg.column ? msg.column - 1 : 0;
                text = msg.message ? ' ' + msg.message : 'Unknown Error';
                ruleHref = helpers.getRuleURI(msg.ruleId);
                html = '<a href="' + ruleHref + '" class="badge badge-flexible sass-lint">' + msg.ruleId + '</a>' + text;
                result = {
                  type: msg.severity === 1 ? 'Warning' : msg.severity === 2 ? 'Error' : 'Info',
                  html: html,
                  filePath: filePath,
                  range: [[line, col], [line, col + 1]]
                };
                return result;
              });
            }
            return [];
          };
        })(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zYXNzLWxpbnQvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxVQUFBLEdBQWE7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLGVBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxxRUFBUDtRQUNBLElBQUEsRUFBTSxTQUROO1FBRUEsV0FBQSxFQUFhLDhFQUZiO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO09BREY7TUFLQSw0QkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLHdEQUFQO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxXQUFBLEVBQWEsOEVBRmI7UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE9BSFQ7T0FORjtNQVVBLFVBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyw0QkFBUDtRQUNBLFdBQUEsRUFBYSxpR0FEYjtRQUVBLElBQUEsRUFBTSxRQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUhUO09BWEY7TUFlQSxjQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sK0JBQVA7UUFDQSxXQUFBLEVBQWEsZ0RBRGI7UUFFQSxJQUFBLEVBQU0sUUFGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFIVDtPQWhCRjtNQW9CQSxjQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sbUNBQVA7UUFDQSxXQUFBLEVBQWEsdUxBRGI7UUFHQSxJQUFBLEVBQU0sU0FITjtRQUlBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FKVDtPQXJCRjtLQURGO0lBNEJBLFFBQUEsRUFBVSxTQUFBO01BQ1IsT0FBQSxDQUFRLG1CQUFSLENBQTRCLENBQUMsT0FBN0IsQ0FB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ICdhdG9tJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5wcmVmaXhQYXRoID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzpcbiAgICBub0NvbmZpZ0Rpc2FibGU6XG4gICAgICB0aXRsZTogJ0Rpc2FibGUgd2hlbiBubyBzYXNzLWxpbnQgY29uZmlnIGZpbGUgaXMgZm91bmQgaW4geW91ciBwcm9qZWN0IHJvb3QnXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlc2NyaXB0aW9uOiAnYW5kIGEgLnNhc3MtbGludC55bWwgZmlsZSBpcyBub3Qgc3BlY2lmaWVkIGluIHRoZSAuc2Fzcy1saW50LnltbCBQYXRoIG9wdGlvbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgcmVzb2x2ZVBhdGhzUmVsYXRpdmVUb0NvbmZpZzpcbiAgICAgIHRpdGxlOiAnUmVzb2x2ZSBwYXRocyBpbiBjb25maWd1cmF0aW9uIHJlbGF0aXZlIHRvIGNvbmZpZyBmaWxlJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZXNjcmlwdGlvbjogJ0luc3RlYWQgb2YgdGhlIGRlZmF1bHQgd2hlcmUgcGF0aHMgYXJlIHJlc29sdmVkIHJlbGF0aXZlIHRvIHRoZSBwcm9qZWN0IHJvb3QnXG4gICAgICBkZWZhdWx0OiAnZmFsc2UnXG4gICAgY29uZmlnRmlsZTpcbiAgICAgIHRpdGxlOiAnLnNhc3MtbGludC55bWwgQ29uZmlnIEZpbGUnXG4gICAgICBkZXNjcmlwdGlvbjogJ0EgLnNhc3MtbGludC55bWwgZmlsZSB0byB1c2UvZmFsbGJhY2sgdG8gaWYgbm8gY29uZmlnIGZpbGUgaXMgZm91bmQgaW4gdGhlIGN1cnJlbnQgcHJvamVjdCByb290J1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgZ2xvYmFsTm9kZVBhdGg6XG4gICAgICB0aXRsZTogJ0dsb2JhbCBOb2RlIEluc3RhbGxhdGlvbiBQYXRoJ1xuICAgICAgZGVzY3JpcHRpb246ICdSdW4gYG5wbSBnZXQgcHJlZml4YCBhbmQgcGFzdGUgdGhlIHJlc3VsdCBoZXJlJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgZ2xvYmFsU2Fzc0xpbnQ6XG4gICAgICB0aXRsZTogJ1VzZSBnbG9iYWwgc2Fzcy1saW50IGluc3RhbGxhdGlvbidcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJUaGUgbGF0ZXN0IHNhc3MtbGludCBpcyBpbmNsdWRlZCBpbiB0aGlzIHBhY2thZ2UgYnV0IGlmIHlvdVxcJ2QgbGlrZSB0byB1c2UgYSBnbG9iYWxseSBpbnN0YWxsZWQgb25lIGVuYWJsZSBpdCBoZXJlLlxcblxuICAgICAgTWFrZSBzdXJlIHNhc3MtbGludCBpcyBpbnN0YWxsZWQgZ2xvYmFsbHkgYW5kIGlzIGluIHlvdXIgJFBBVEhcIlwiXCJcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcblxuICBhY3RpdmF0ZTogLT5cbiAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoJ2xpbnRlci1zYXNzLWxpbnQnKVxuICAgIEBzdWJzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vicy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbGludGVyLXNhc3MtbGludC5ub0NvbmZpZ0Rpc2FibGUnLFxuICAgICAgKG5vQ29uZmlnRGlzYWJsZSkgPT5cbiAgICAgICAgQG5vQ29uZmlnRGlzYWJsZSA9IG5vQ29uZmlnRGlzYWJsZVxuICAgIEBzdWJzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdsaW50ZXItc2Fzcy1saW50LmNvbmZpZ0ZpbGUnLFxuICAgICAgKGNvbmZpZ0ZpbGUpID0+XG4gICAgICAgIEBjb25maWdGaWxlID0gY29uZmlnRmlsZVxuICAgIEBzdWJzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdsaW50ZXItc2Fzcy1saW50Lmdsb2JhbFNhc3NMaW50JyxcbiAgICAgIChnbG9iYWxTYXNzTGludCkgPT5cbiAgICAgICAgQGdsb2JhbFNhc3NMaW50ID0gZ2xvYmFsU2Fzc0xpbnRcbiAgICBAc3Vicy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbGludGVyLXNhc3MtbGludC5nbG9iYWxOb2RlUGF0aCcsXG4gICAgICAoZ2xvYmFsTm9kZVBhdGgpID0+XG4gICAgICAgIEBnbG9iYWxQYXRoID0gZ2xvYmFsTm9kZVBhdGhcbiAgICBAc3Vicy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbGludGVyLXNhc3MtbGludC5yZXNvbHZlUGF0aHNSZWxhdGl2ZVRvQ29uZmlnJyxcbiAgICAgIChyZXNvbHZlUGF0aHNSZWxhdGl2ZVRvQ29uZmlnKSA9PlxuICAgICAgICBAcmVzb2x2ZVBhdGhzUmVsYXRpdmVUb0NvbmZpZyA9IHJlc29sdmVQYXRoc1JlbGF0aXZlVG9Db25maWdcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzLmRpc3Bvc2UoKVxuXG4gICMgcmV0dXJuIGEgcmVsYXRpdmUgcGF0aCBmb3IgYSBmaWxlIHdpdGhpbiBvdXIgcHJvamVjdFxuICAjIHdlIHVzZSB0aGlzIHRvIG1hdGNoIGl0IHRvIG91ciBpbmNsdWRlL2V4Y2x1ZGUgZ2xvYiBzdHJpbmcgd2l0aGluIHNhc3MtbGludCdzXG4gICMgdXNlciBzcGVjaWZpZWQgY29uZmlnXG4gIGdldEZpbGVQYXRoOiAoYWJzb2x1dGVQYXRoLCBjb25maWdGaWxlUGF0aCkgLT5cbiAgICBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gICAgaWYgQHJlc29sdmVQYXRoc1JlbGF0aXZlVG9Db25maWdcbiAgICAgIHJldHVybiBwYXRoLnJlbGF0aXZlKHBhdGguZGlybmFtZShjb25maWdGaWxlUGF0aCksIGFic29sdXRlUGF0aClcbiAgICBlbHNlXG4gICAgICByZXR1cm4gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGFic29sdXRlUGF0aClbMV1cblxuICAjIERldGVybWluZXMgd2hldGhlciB0byB1c2UgdGhlIHNhc3MtbGludCBwYWNrYWdlIGluY2x1ZGVkIHdpdGggbGludGVyLXNhc3MtbGludFxuICAjIG9yIHRoZSB1c2VycyBnbG9iYWxseSBpbnN0YWxsZWQgc2Fzcy1saW50IHZlcnNpb25cbiAgZmluZEV4ZWN1dGFibGU6IC0+XG4gICAge3NwYXduU3luY30gPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuICAgIGNvbnNpc3RlbnRFbnYgPSByZXF1aXJlICdjb25zaXN0ZW50LWVudidcbiAgICBpZiBub3QgQGdsb2JhbFNhc3NMaW50XG4gICAgICByZXR1cm4gcmVxdWlyZSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnbm9kZV9tb2R1bGVzJywgJ3Nhc3MtbGludCcpXG4gICAgaWYgQGdsb2JhbFBhdGggaXMgJycgYW5kIHByZWZpeFBhdGggaXMgbnVsbFxuICAgICAgbnBtQ29tbWFuZCA9IGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgJ3dpbjMyJyB0aGVuICducG0uY21kJyBlbHNlICducG0nXG4gICAgICBlbnYgPSBPYmplY3QuYXNzaWduKHt9LCBjb25zaXN0ZW50RW52KCkpXG4gICAgICB0cnlcbiAgICAgICAgcHJlZml4UGF0aCA9IHNwYXduU3luYyhucG1Db21tYW5kLCBbXG4gICAgICAgICAgJ2dldCdcbiAgICAgICAgICAncHJlZml4J1xuICAgICAgICBdLCB7ZW52fSkub3V0cHV0WzFdLnRvU3RyaW5nKCkudHJpbSgpXG4gICAgICBjYXRjaCBlXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigncHJlZml4JylcbiAgICBpZiBwcm9jZXNzLnBsYXRmb3JtIGlzICd3aW4zMidcbiAgICB0aGVuIHJldHVybiByZXF1aXJlIHBhdGguam9pbihAZ2xvYmFsUGF0aCBvciBwcmVmaXhQYXRoLCAnbm9kZV9tb2R1bGVzJywgJ3Nhc3MtbGludCcpXG4gICAgcmV0dXJuIHJlcXVpcmUgcGF0aC5qb2luKEBnbG9iYWxQYXRoIG9yIHByZWZpeFBhdGgsICdsaWInLCAnbm9kZV9tb2R1bGVzJywgJ3Nhc3MtbGludCcpXG5cbiAgcHJvdmlkZUxpbnRlcjogLT5cbiAgICBwcm92aWRlciA9XG4gICAgICBuYW1lOiAnc2Fzcy1saW50J1xuICAgICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UuY3NzLnNjc3MnLCAnc291cmNlLnNjc3MnLCAnc291cmNlLmNzcy5zYXNzJywgJ3NvdXJjZS5zYXNzJ11cbiAgICAgIHNjb3BlOiAnZmlsZSdcbiAgICAgIGxpbnRPbkZseTogdHJ1ZVxuICAgICAgbGludDogKGVkaXRvcikgPT5cbiAgICAgICAge2ZpbmR9ID0gcmVxdWlyZSAnYXRvbS1saW50ZXInXG4gICAgICAgIGhlbHBlcnMgPSByZXF1aXJlICcuL2hlbHBlcnMnXG4gICAgICAgIGdsb2J1bGUgPSByZXF1aXJlICdnbG9idWxlJ1xuICAgICAgICBjb25maWdFeHQgPSAnLnNhc3MtbGludC55bWwnXG4gICAgICAgIGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICBwcm9qZWN0Q29uZmlnID0gZmluZCBmaWxlUGF0aCwgY29uZmlnRXh0XG4gICAgICAgIGdsb2JhbENvbmZpZyA9IGlmIEBjb25maWdGaWxlIGlzICcnIHRoZW4gbnVsbCBlbHNlIEBjb25maWdGaWxlXG4gICAgICAgIGNvbmZpZyA9IGlmIHByb2plY3RDb25maWcgaXNudCBudWxsIHRoZW4gcHJvamVjdENvbmZpZyBlbHNlIGdsb2JhbENvbmZpZ1xuXG4gICAgICAgIHRyeVxuICAgICAgICAgIGxpbnRlciA9IEBmaW5kRXhlY3V0YWJsZSgpXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgaWYgZXJyb3IubWVzc2FnZSBpcyAncHJlZml4JyB0aGVuIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcIlwiXCJcbiAgICAgICAgICAgICoqRXJyb3IgZ2V0dGluZyAkUEFUSCAtIGxpbnRlci1zYXNzLWxpbnQqKlxcblxuXG4gICAgICAgICAgICBZb3UndmUgZW5hYmxlZCB1c2luZyBnbG9iYWwgc2Fzcy1saW50IHdpdGhvdXQgc3BlY2lmeWluZyBhIHByZWZpeCBzbyB3ZSB0cmllZCB0by5cbiAgICAgICAgICAgIFVuZm9ydHVuYXRlbHkgd2Ugd2VyZSB1bmFibGUgdG8gZXhlY3V0ZSBgbnBtIGdldCBwcmVmaXhgIGZvciB5b3UuLlxcblxuICAgICAgICAgICAgUGxlYXNlIG1ha2Ugc3VyZSBBdG9tIGlzIGdldHRpbmcgJFBBVEggY29ycmVjdGx5IG9yIHNldCBpdCBkaXJlY3RseSBpbiB0aGUgYGxpbnRlci1zYXNzLWxpbnRgIHNldHRpbmdzLlxuICAgICAgICAgIFwiXCJcIiwge2Rpc21pc3NhYmxlOiB0cnVlfVxuICAgICAgICAgIHJldHVybiBbXVxuXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgXCJcIlwiXG4gICAgICAgICAgICAqKlNhc3MtbGludCBwYWNrYWdlIG1pc3NpbmcqKlxuXG4gICAgICAgICAgICBUaGUgc2Fzcy1saW50IHBhY2thZ2UgY2Fubm90IGJlIGZvdW5kLCBwbGVhc2UgY2hlY2sgc2Fzcy1saW50IGlzIGluc3RhbGxlZCBnbG9iYWxseS4gXFxuXG4gICAgICAgICAgICBZb3UgY2FuIGFsd2F5cyB1c2UgdGhlIHNhc3MtbGludCBwYWNha2FnZSBpbmNsdWRlZCB3aXRoIGxpbnRlci1zYXNzLWxpbnQgYnkgZGlzYWJsaW5nIHRoZVxuICAgICAgICAgICAgYFVzZSBnbG9iYWwgc2Fzcy1saW50IGluc3RhbGxhdGlvbmAgb3B0aW9uXG4gICAgICAgICAgXCJcIlwiLCB7ZGlzbWlzc2FibGU6IHRydWV9XG4gICAgICAgICAgcmV0dXJuIFtdXG5cbiAgICAgICAgaWYgY29uZmlnIGlzbnQgbnVsbCBhbmQgcGF0aC5leHRuYW1lKGNvbmZpZykgaXNudCAnLnltbCdcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyBcIlwiXCJcbiAgICAgICAgICAgICoqQ29uZmlnIEZpbGUgRXJyb3IqKlxuXG4gICAgICAgICAgICBUaGUgY29uZmlnIGZpbGUgeW91IHNwZWNpZmllZCBkb2Vzbid0IHNlZW0gdG8gYmUgYSAueW1sIGZpbGUuXFxuXG4gICAgICAgICAgICBQbGVhc2Ugc2VlIHRoZSBzYXNzLWxpbnQgW2RvY3VtZW50YXRpb25dKGh0dHBzOi8vZ2l0aHViLmNvbS9zYXNzdG9vbHMvc2Fzcy1saW50L3RyZWUvbWFzdGVyL2RvY3MpIG9uIGhvdyB0byBjcmVhdGUgYSBjb25maWcgZmlsZS5cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpZiBjb25maWcgaXMgbnVsbCBhbmQgQG5vQ29uZmlnRGlzYWJsZSBpcyBmYWxzZVxuICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0eXBlOiAnSW5mbydcbiAgICAgICAgICAgIHRleHQ6ICdObyAuc2Fzcy1saW50LnltbCBjb25maWcgZmlsZSBkZXRlY3RlZCBvciBzcGVjaWZpZWQuIFBsZWFzZSBjaGVjayB5b3VyIHNldHRpbmdzJ1xuICAgICAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoXG4gICAgICAgICAgICByYW5nZTogW1swLCAwXSwgWzAsIDBdXVxuICAgICAgICAgIF1cblxuICAgICAgICBlbHNlIGlmIGNvbmZpZyBpcyBudWxsIGFuZCBAbm9Db25maWdEaXNhYmxlIGlzIHRydWVcbiAgICAgICAgICByZXR1cm4gW11cblxuICAgICAgICB0cnlcbiAgICAgICAgICBjb21waWxlZENvbmZpZyA9IGxpbnRlci5nZXRDb25maWcoe30sIGNvbmZpZylcbiAgICAgICAgICByZWxhdGl2ZVBhdGggPSB0aGlzLmdldEZpbGVQYXRoKGZpbGVQYXRoLCBjb25maWcpXG5cbiAgICAgICAgICBpZiBnbG9idWxlLmlzTWF0Y2goY29tcGlsZWRDb25maWcuZmlsZXMuaW5jbHVkZSwgcmVsYXRpdmVQYXRoKSBhbmQgbm90IGdsb2J1bGUuaXNNYXRjaChjb21waWxlZENvbmZpZy5maWxlcy5pZ25vcmUsIHJlbGF0aXZlUGF0aClcbiAgICAgICAgICAgIHJlc3VsdCA9IGxpbnRlci5saW50VGV4dCh7XG4gICAgICAgICAgICAgIHRleHQ6IGVkaXRvci5nZXRUZXh0KCksXG4gICAgICAgICAgICAgIGZvcm1hdDogaGVscGVycy5nZXRGaWxlU3ludGF4KGZpbGVQYXRoKSxcbiAgICAgICAgICAgICAgZmlsZW5hbWU6IGZpbGVQYXRoXG4gICAgICAgICAgICB9LCB7fSwgY29uZmlnKVxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIG1lc3NhZ2VzID0gW11cbiAgICAgICAgICBtYXRjaCA9IGVycm9yLm1lc3NhZ2UubWF0Y2ggL1BhcnNpbmcgZXJyb3IgYXQgW146XSs6ICguKikgc3RhcnRpbmcgZnJvbSBsaW5lICMoXFxkKykvXG4gICAgICAgICAgaWYgbWF0Y2hcbiAgICAgICAgICAgIHRleHQgPSBcIlBhcnNpbmcgZXJyb3I6ICN7bWF0Y2hbMV19LlwiXG4gICAgICAgICAgICBsaW5lSWR4ID0gTnVtYmVyKG1hdGNoWzJdKSAtIDFcbiAgICAgICAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cobGluZUlkeClcbiAgICAgICAgICAgIGNvbEVuZElkeCA9IGlmIGxpbmUgdGhlbiBsaW5lLmxlbmd0aCBlbHNlIDFcblxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgdHlwZTogJ0Vycm9yJ1xuICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XG4gICAgICAgICAgICAgIGZpbGVQYXRoOiBmaWxlUGF0aFxuICAgICAgICAgICAgICByYW5nZTogW1tsaW5lSWR4LCAwXSwgW2xpbmVJZHgsIGNvbEVuZElkeF1dXG4gICAgICAgICAgICBdXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyBMZWF2aW5nIHRoaXMgaGVyZSB0byBhbGxvdyBwZW9wbGUgdG8gcmVwb3J0IHRoZSBlcnJvcnNcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdsaW50ZXItc2Fzcy1saW50JywgZXJyb3IpXG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICB0eXBlOiAnRXJyb3InXG4gICAgICAgICAgICAgIHRleHQ6ICdVbmV4cGVjdGVkIHBhcnNlIGVycm9yIGluIGZpbGUnXG4gICAgICAgICAgICAgIGZpbGVQYXRoOiBmaWxlUGF0aFxuICAgICAgICAgICAgICByYW5nZTogW1tsaW5lSWR4LCAwXSwgW2xpbmVJZHgsIGNvbEVuZElkeF1dXG4gICAgICAgICAgICBdXG4gICAgICAgICAgcmV0dXJuIFtdXG5cbiAgICAgICAgaWYgcmVzdWx0IHRoZW4gcmV0dXJuIHJlc3VsdC5tZXNzYWdlcy5tYXAgKG1zZykgLT5cbiAgICAgICAgICBsaW5lID0gaWYgbXNnLmxpbmUgdGhlbiBtc2cubGluZSAtIDEgZWxzZSAwXG4gICAgICAgICAgY29sID0gaWYgbXNnLmNvbHVtbiB0aGVuIG1zZy5jb2x1bW4gLSAxIGVsc2UgMFxuICAgICAgICAgIHRleHQgPSBpZiBtc2cubWVzc2FnZSB0aGVuICcgJyArIG1zZy5tZXNzYWdlIGVsc2UgJ1Vua25vd24gRXJyb3InXG4gICAgICAgICAgcnVsZUhyZWYgPSBoZWxwZXJzLmdldFJ1bGVVUkkobXNnLnJ1bGVJZClcbiAgICAgICAgICBodG1sID0gJzxhIGhyZWY9XCInKyBydWxlSHJlZiArICdcIiBjbGFzcz1cImJhZGdlIGJhZGdlLWZsZXhpYmxlIHNhc3MtbGludFwiPicgKyBtc2cucnVsZUlkICsgJzwvYT4nICsgdGV4dFxuXG4gICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogaWYgbXNnLnNldmVyaXR5IGlzIDEgdGhlbiAnV2FybmluZycgZWxzZSBpZiBtc2cuc2V2ZXJpdHkgaXMgMiB0aGVuICdFcnJvcicgZWxzZSAnSW5mbycsXG4gICAgICAgICAgICBodG1sLFxuICAgICAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgICAgcmFuZ2U6IFtbbGluZSwgY29sXSwgW2xpbmUsIGNvbCArIDFdXVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiByZXN1bHRcblxuICAgICAgICByZXR1cm4gW11cbiJdfQ==
