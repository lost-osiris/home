(function() {
  module.exports = {
    statusBar: null,
    activate: function() {},
    deactivate: function() {
      var ref;
      if ((ref = this.statusBarTile) != null) {
        ref.destroy();
      }
      return this.statusBarTile = null;
    },
    providePlatformIOIDETerminal: function() {
      return {
        updateProcessEnv: function(variables) {
          var name, results, value;
          results = [];
          for (name in variables) {
            value = variables[name];
            results.push(process.env[name] = value);
          }
          return results;
        },
        run: (function(_this) {
          return function(commands) {
            return _this.statusBarTile.runCommandInNewTerminal(commands);
          };
        })(this),
        getTerminalViews: (function(_this) {
          return function() {
            return _this.statusBarTile.terminalViews;
          };
        })(this),
        open: (function(_this) {
          return function() {
            return _this.statusBarTile.runNewTerminal();
          };
        })(this)
      };
    },
    provideRunInTerminal: function() {
      return {
        run: (function(_this) {
          return function(commands) {
            return _this.statusBarTile.runCommandInNewTerminal(commands);
          };
        })(this),
        getTerminalViews: (function(_this) {
          return function() {
            return _this.statusBarTile.terminalViews;
          };
        })(this)
      };
    },
    consumeStatusBar: function(statusBarProvider) {
      return this.statusBarTile = new (require('./status-bar'))(statusBarProvider);
    },
    config: {
      toggles: {
        type: 'object',
        order: 1,
        properties: {
          autoClose: {
            title: 'Close Terminal on Exit',
            description: 'Should the terminal close if the shell exits?',
            type: 'boolean',
            "default": false
          },
          cursorBlink: {
            title: 'Cursor Blink',
            description: 'Should the cursor blink when the terminal is active?',
            type: 'boolean',
            "default": true
          },
          runInsertedText: {
            title: 'Run Inserted Text',
            description: 'Run text inserted via `platformio-ide-terminal:insert-text` as a command? **This will append an end-of-line character to input.**',
            type: 'boolean',
            "default": true
          },
          selectToCopy: {
            title: 'Select To Copy',
            description: 'Copies text to clipboard when selection happens.',
            type: 'boolean',
            "default": true
          }
        }
      },
      core: {
        type: 'object',
        order: 2,
        properties: {
          autoRunCommand: {
            title: 'Auto Run Command',
            description: 'Command to run on terminal initialization.',
            type: 'string',
            "default": ''
          },
          mapTerminalsTo: {
            title: 'Map Terminals To',
            description: 'Map terminals to each file or folder. Default is no action or mapping at all. **Restart required.**',
            type: 'string',
            "default": 'None',
            "enum": ['None', 'File', 'Folder']
          },
          mapTerminalsToAutoOpen: {
            title: 'Auto Open a New Terminal (For Terminal Mapping)',
            description: 'Should a new terminal be opened for new items? **Note:** This works in conjunction with `Map Terminals To` above.',
            type: 'boolean',
            "default": false
          },
          scrollback: {
            title: 'Scroll Back',
            description: 'How many lines of history should be kept?',
            type: 'integer',
            "default": 1000
          },
          shell: {
            title: 'Shell Override',
            description: 'Override the default shell instance to launch.',
            type: 'string',
            "default": (function() {
              var path;
              if (process.platform === 'win32') {
                path = require('path');
                return path.resolve(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
              } else {
                return process.env.SHELL || '/bin/bash';
              }
            })()
          },
          shellArguments: {
            title: 'Shell Arguments',
            description: 'Specify some arguments to use when launching the shell.',
            type: 'string',
            "default": ''
          },
          workingDirectory: {
            title: 'Working Directory',
            description: 'Which directory should be the present working directory when a new terminal is made?',
            type: 'string',
            "default": 'Project',
            "enum": ['Home', 'Project', 'Active File']
          }
        }
      },
      style: {
        type: 'object',
        order: 3,
        properties: {
          animationSpeed: {
            title: 'Animation Speed',
            description: 'How fast should the window animate?',
            type: 'number',
            "default": '1',
            minimum: '0',
            maximum: '100'
          },
          fontFamily: {
            title: 'Font Family',
            description: 'Override the terminal\'s default font family. **You must use a [monospaced font](https://en.wikipedia.org/wiki/List_of_typefaces#Monospace)!**',
            type: 'string',
            "default": ''
          },
          fontSize: {
            title: 'Font Size',
            description: 'Override the terminal\'s default font size.',
            type: 'string',
            "default": ''
          },
          defaultPanelHeight: {
            title: 'Default Panel Height',
            description: 'Default height of a terminal panel. **You may enter a value in px, em, or %.**',
            type: 'string',
            "default": '300px'
          },
          theme: {
            title: 'Theme',
            description: 'Select a theme for the terminal.',
            type: 'string',
            "default": 'standard',
            "enum": ['standard', 'inverse', 'linux', 'grass', 'homebrew', 'man-page', 'novel', 'ocean', 'pro', 'red', 'red-sands', 'silver-aerogel', 'solarized-dark', 'solid-colors', 'dracula', 'one-dark', 'christmas']
          }
        }
      },
      ansiColors: {
        type: 'object',
        order: 4,
        properties: {
          normal: {
            type: 'object',
            order: 1,
            properties: {
              black: {
                title: 'Black',
                description: 'Black color used for terminal ANSI color set.',
                type: 'color',
                "default": '#000000'
              },
              red: {
                title: 'Red',
                description: 'Red color used for terminal ANSI color set.',
                type: 'color',
                "default": '#CD0000'
              },
              green: {
                title: 'Green',
                description: 'Green color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00CD00'
              },
              yellow: {
                title: 'Yellow',
                description: 'Yellow color used for terminal ANSI color set.',
                type: 'color',
                "default": '#CDCD00'
              },
              blue: {
                title: 'Blue',
                description: 'Blue color used for terminal ANSI color set.',
                type: 'color',
                "default": '#0000CD'
              },
              magenta: {
                title: 'Magenta',
                description: 'Magenta color used for terminal ANSI color set.',
                type: 'color',
                "default": '#CD00CD'
              },
              cyan: {
                title: 'Cyan',
                description: 'Cyan color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00CDCD'
              },
              white: {
                title: 'White',
                description: 'White color used for terminal ANSI color set.',
                type: 'color',
                "default": '#E5E5E5'
              }
            }
          },
          zBright: {
            type: 'object',
            order: 2,
            properties: {
              brightBlack: {
                title: 'Bright Black',
                description: 'Bright black color used for terminal ANSI color set.',
                type: 'color',
                "default": '#7F7F7F'
              },
              brightRed: {
                title: 'Bright Red',
                description: 'Bright red color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FF0000'
              },
              brightGreen: {
                title: 'Bright Green',
                description: 'Bright green color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00FF00'
              },
              brightYellow: {
                title: 'Bright Yellow',
                description: 'Bright yellow color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FFFF00'
              },
              brightBlue: {
                title: 'Bright Blue',
                description: 'Bright blue color used for terminal ANSI color set.',
                type: 'color',
                "default": '#0000FF'
              },
              brightMagenta: {
                title: 'Bright Magenta',
                description: 'Bright magenta color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FF00FF'
              },
              brightCyan: {
                title: 'Bright Cyan',
                description: 'Bright cyan color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00FFFF'
              },
              brightWhite: {
                title: 'Bright White',
                description: 'Bright white color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FFFFFF'
              }
            }
          }
        }
      },
      iconColors: {
        type: 'object',
        order: 5,
        properties: {
          red: {
            title: 'Status Icon Red',
            description: 'Red color used for status icon.',
            type: 'color',
            "default": 'red'
          },
          orange: {
            title: 'Status Icon Orange',
            description: 'Orange color used for status icon.',
            type: 'color',
            "default": 'orange'
          },
          yellow: {
            title: 'Status Icon Yellow',
            description: 'Yellow color used for status icon.',
            type: 'color',
            "default": 'yellow'
          },
          green: {
            title: 'Status Icon Green',
            description: 'Green color used for status icon.',
            type: 'color',
            "default": 'green'
          },
          blue: {
            title: 'Status Icon Blue',
            description: 'Blue color used for status icon.',
            type: 'color',
            "default": 'blue'
          },
          purple: {
            title: 'Status Icon Purple',
            description: 'Purple color used for status icon.',
            type: 'color',
            "default": 'purple'
          },
          pink: {
            title: 'Status Icon Pink',
            description: 'Pink color used for status icon.',
            type: 'color',
            "default": 'hotpink'
          },
          cyan: {
            title: 'Status Icon Cyan',
            description: 'Cyan color used for status icon.',
            type: 'color',
            "default": 'cyan'
          },
          magenta: {
            title: 'Status Icon Magenta',
            description: 'Magenta color used for status icon.',
            type: 'color',
            "default": 'magenta'
          }
        }
      },
      customTexts: {
        type: 'object',
        order: 6,
        properties: {
          customText1: {
            title: 'Custom text 1',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-1, $S is replaced by selection, $F is replaced by file name, $D is replaced by file directory, $L is replaced by line number of cursor, $$ is replaced by $',
            type: 'string',
            "default": ''
          },
          customText2: {
            title: 'Custom text 2',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-2',
            type: 'string',
            "default": ''
          },
          customText3: {
            title: 'Custom text 3',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-3',
            type: 'string',
            "default": ''
          },
          customText4: {
            title: 'Custom text 4',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-4',
            type: 'string',
            "default": ''
          },
          customText5: {
            title: 'Custom text 5',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-5',
            type: 'string',
            "default": ''
          },
          customText6: {
            title: 'Custom text 6',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-6',
            type: 'string',
            "default": ''
          },
          customText7: {
            title: 'Custom text 7',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-7',
            type: 'string',
            "default": ''
          },
          customText8: {
            title: 'Custom text 8',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-8',
            type: 'string',
            "default": ''
          }
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi9wbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsU0FBQSxFQUFXLElBQVg7SUFFQSxRQUFBLEVBQVUsU0FBQSxHQUFBLENBRlY7SUFJQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7O1dBQWMsQ0FBRSxPQUFoQixDQUFBOzthQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBRlAsQ0FKWjtJQVFBLDRCQUFBLEVBQThCLFNBQUE7YUFDNUI7UUFBQSxnQkFBQSxFQUFrQixTQUFDLFNBQUQ7QUFDaEIsY0FBQTtBQUFBO2VBQUEsaUJBQUE7O3lCQUNFLE9BQU8sQ0FBQyxHQUFJLENBQUEsSUFBQSxDQUFaLEdBQW9CO0FBRHRCOztRQURnQixDQUFsQjtRQUdBLEdBQUEsRUFBSyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLFFBQUQ7bUJBQ0gsS0FBQyxDQUFBLGFBQWEsQ0FBQyx1QkFBZixDQUF1QyxRQUF2QztVQURHO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhMO1FBS0EsZ0JBQUEsRUFBa0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDaEIsS0FBQyxDQUFBLGFBQWEsQ0FBQztVQURDO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUxsQjtRQU9BLElBQUEsRUFBTSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxhQUFhLENBQUMsY0FBZixDQUFBO1VBREk7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUE47O0lBRDRCLENBUjlCO0lBbUJBLG9CQUFBLEVBQXNCLFNBQUE7YUFDcEI7UUFBQSxHQUFBLEVBQUssQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FB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RjtPQXRRRjtLQTdCRjs7QUFERiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbiAgc3RhdHVzQmFyOiBudWxsXG5cbiAgYWN0aXZhdGU6IC0+XG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3RhdHVzQmFyVGlsZT8uZGVzdHJveSgpXG4gICAgQHN0YXR1c0JhclRpbGUgPSBudWxsXG5cbiAgcHJvdmlkZVBsYXRmb3JtSU9JREVUZXJtaW5hbDogLT5cbiAgICB1cGRhdGVQcm9jZXNzRW52OiAodmFyaWFibGVzKSAtPlxuICAgICAgZm9yIG5hbWUsIHZhbHVlIG9mIHZhcmlhYmxlc1xuICAgICAgICBwcm9jZXNzLmVudltuYW1lXSA9IHZhbHVlXG4gICAgcnVuOiAoY29tbWFuZHMpID0+XG4gICAgICBAc3RhdHVzQmFyVGlsZS5ydW5Db21tYW5kSW5OZXdUZXJtaW5hbCBjb21tYW5kc1xuICAgIGdldFRlcm1pbmFsVmlld3M6ICgpID0+XG4gICAgICBAc3RhdHVzQmFyVGlsZS50ZXJtaW5hbFZpZXdzXG4gICAgb3BlbjogKCkgPT5cbiAgICAgIEBzdGF0dXNCYXJUaWxlLnJ1bk5ld1Rlcm1pbmFsKClcblxuICBwcm92aWRlUnVuSW5UZXJtaW5hbDogLT5cbiAgICBydW46IChjb21tYW5kcykgPT5cbiAgICAgIEBzdGF0dXNCYXJUaWxlLnJ1bkNvbW1hbmRJbk5ld1Rlcm1pbmFsIGNvbW1hbmRzXG4gICAgZ2V0VGVybWluYWxWaWV3czogKCkgPT5cbiAgICAgIEBzdGF0dXNCYXJUaWxlLnRlcm1pbmFsVmlld3NcblxuICBjb25zdW1lU3RhdHVzQmFyOiAoc3RhdHVzQmFyUHJvdmlkZXIpIC0+XG4gICAgQHN0YXR1c0JhclRpbGUgPSBuZXcgKHJlcXVpcmUgJy4vc3RhdHVzLWJhcicpKHN0YXR1c0JhclByb3ZpZGVyKVxuXG4gIGNvbmZpZzpcbiAgICB0b2dnbGVzOlxuICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgIG9yZGVyOiAxXG4gICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICBhdXRvQ2xvc2U6XG4gICAgICAgICAgdGl0bGU6ICdDbG9zZSBUZXJtaW5hbCBvbiBFeGl0J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdWxkIHRoZSB0ZXJtaW5hbCBjbG9zZSBpZiB0aGUgc2hlbGwgZXhpdHM/J1xuICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGN1cnNvckJsaW5rOlxuICAgICAgICAgIHRpdGxlOiAnQ3Vyc29yIEJsaW5rJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdWxkIHRoZSBjdXJzb3IgYmxpbmsgd2hlbiB0aGUgdGVybWluYWwgaXMgYWN0aXZlPydcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgIHJ1bkluc2VydGVkVGV4dDpcbiAgICAgICAgICB0aXRsZTogJ1J1biBJbnNlcnRlZCBUZXh0J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVuIHRleHQgaW5zZXJ0ZWQgdmlhIGBwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDppbnNlcnQtdGV4dGAgYXMgYSBjb21tYW5kPyAqKlRoaXMgd2lsbCBhcHBlbmQgYW4gZW5kLW9mLWxpbmUgY2hhcmFjdGVyIHRvIGlucHV0LioqJ1xuICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgc2VsZWN0VG9Db3B5OlxuICAgICAgICAgIHRpdGxlOiAnU2VsZWN0IFRvIENvcHknXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdDb3BpZXMgdGV4dCB0byBjbGlwYm9hcmQgd2hlbiBzZWxlY3Rpb24gaGFwcGVucy4nXG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIGNvcmU6XG4gICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgb3JkZXI6IDJcbiAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgIGF1dG9SdW5Db21tYW5kOlxuICAgICAgICAgIHRpdGxlOiAnQXV0byBSdW4gQ29tbWFuZCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0NvbW1hbmQgdG8gcnVuIG9uIHRlcm1pbmFsIGluaXRpYWxpemF0aW9uLidcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICAgIG1hcFRlcm1pbmFsc1RvOlxuICAgICAgICAgIHRpdGxlOiAnTWFwIFRlcm1pbmFscyBUbydcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ01hcCB0ZXJtaW5hbHMgdG8gZWFjaCBmaWxlIG9yIGZvbGRlci4gRGVmYXVsdCBpcyBubyBhY3Rpb24gb3IgbWFwcGluZyBhdCBhbGwuICoqUmVzdGFydCByZXF1aXJlZC4qKidcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdOb25lJ1xuICAgICAgICAgIGVudW06IFsnTm9uZScsICdGaWxlJywgJ0ZvbGRlciddXG4gICAgICAgIG1hcFRlcm1pbmFsc1RvQXV0b09wZW46XG4gICAgICAgICAgdGl0bGU6ICdBdXRvIE9wZW4gYSBOZXcgVGVybWluYWwgKEZvciBUZXJtaW5hbCBNYXBwaW5nKSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1Nob3VsZCBhIG5ldyB0ZXJtaW5hbCBiZSBvcGVuZWQgZm9yIG5ldyBpdGVtcz8gKipOb3RlOioqIFRoaXMgd29ya3MgaW4gY29uanVuY3Rpb24gd2l0aCBgTWFwIFRlcm1pbmFscyBUb2AgYWJvdmUuJ1xuICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIHNjcm9sbGJhY2s6XG4gICAgICAgICAgdGl0bGU6ICdTY3JvbGwgQmFjaydcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0hvdyBtYW55IGxpbmVzIG9mIGhpc3Rvcnkgc2hvdWxkIGJlIGtlcHQ/J1xuICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgICAgIGRlZmF1bHQ6IDEwMDBcbiAgICAgICAgc2hlbGw6XG4gICAgICAgICAgdGl0bGU6ICdTaGVsbCBPdmVycmlkZSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ092ZXJyaWRlIHRoZSBkZWZhdWx0IHNoZWxsIGluc3RhbmNlIHRvIGxhdW5jaC4nXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiBkbyAtPlxuICAgICAgICAgICAgaWYgcHJvY2Vzcy5wbGF0Zm9ybSBpcyAnd2luMzInXG4gICAgICAgICAgICAgIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuICAgICAgICAgICAgICBwYXRoLnJlc29sdmUocHJvY2Vzcy5lbnYuU3lzdGVtUm9vdCwgJ1N5c3RlbTMyJywgJ1dpbmRvd3NQb3dlclNoZWxsJywgJ3YxLjAnLCAncG93ZXJzaGVsbC5leGUnKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBwcm9jZXNzLmVudi5TSEVMTCB8fCAnL2Jpbi9iYXNoJ1xuICAgICAgICBzaGVsbEFyZ3VtZW50czpcbiAgICAgICAgICB0aXRsZTogJ1NoZWxsIEFyZ3VtZW50cydcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NwZWNpZnkgc29tZSBhcmd1bWVudHMgdG8gdXNlIHdoZW4gbGF1bmNoaW5nIHRoZSBzaGVsbC4nXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICB3b3JraW5nRGlyZWN0b3J5OlxuICAgICAgICAgIHRpdGxlOiAnV29ya2luZyBEaXJlY3RvcnknXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdXaGljaCBkaXJlY3Rvcnkgc2hvdWxkIGJlIHRoZSBwcmVzZW50IHdvcmtpbmcgZGlyZWN0b3J5IHdoZW4gYSBuZXcgdGVybWluYWwgaXMgbWFkZT8nXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnUHJvamVjdCdcbiAgICAgICAgICBlbnVtOiBbJ0hvbWUnLCAnUHJvamVjdCcsICdBY3RpdmUgRmlsZSddXG4gICAgc3R5bGU6XG4gICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgb3JkZXI6IDNcbiAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgIGFuaW1hdGlvblNwZWVkOlxuICAgICAgICAgIHRpdGxlOiAnQW5pbWF0aW9uIFNwZWVkJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSG93IGZhc3Qgc2hvdWxkIHRoZSB3aW5kb3cgYW5pbWF0ZT8nXG4gICAgICAgICAgdHlwZTogJ251bWJlcidcbiAgICAgICAgICBkZWZhdWx0OiAnMSdcbiAgICAgICAgICBtaW5pbXVtOiAnMCdcbiAgICAgICAgICBtYXhpbXVtOiAnMTAwJ1xuICAgICAgICBmb250RmFtaWx5OlxuICAgICAgICAgIHRpdGxlOiAnRm9udCBGYW1pbHknXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdPdmVycmlkZSB0aGUgdGVybWluYWxcXCdzIGRlZmF1bHQgZm9udCBmYW1pbHkuICoqWW91IG11c3QgdXNlIGEgW21vbm9zcGFjZWQgZm9udF0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGlzdF9vZl90eXBlZmFjZXMjTW9ub3NwYWNlKSEqKidcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICAgIGZvbnRTaXplOlxuICAgICAgICAgIHRpdGxlOiAnRm9udCBTaXplJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnT3ZlcnJpZGUgdGhlIHRlcm1pbmFsXFwncyBkZWZhdWx0IGZvbnQgc2l6ZS4nXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBkZWZhdWx0UGFuZWxIZWlnaHQ6XG4gICAgICAgICAgdGl0bGU6ICdEZWZhdWx0IFBhbmVsIEhlaWdodCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0RlZmF1bHQgaGVpZ2h0IG9mIGEgdGVybWluYWwgcGFuZWwuICoqWW91IG1heSBlbnRlciBhIHZhbHVlIGluIHB4LCBlbSwgb3IgJS4qKidcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICczMDBweCdcbiAgICAgICAgdGhlbWU6XG4gICAgICAgICAgdGl0bGU6ICdUaGVtZSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NlbGVjdCBhIHRoZW1lIGZvciB0aGUgdGVybWluYWwuJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJ3N0YW5kYXJkJ1xuICAgICAgICAgIGVudW06IFtcbiAgICAgICAgICAgICdzdGFuZGFyZCcsXG4gICAgICAgICAgICAnaW52ZXJzZScsXG4gICAgICAgICAgICAnbGludXgnLFxuICAgICAgICAgICAgJ2dyYXNzJyxcbiAgICAgICAgICAgICdob21lYnJldycsXG4gICAgICAgICAgICAnbWFuLXBhZ2UnLFxuICAgICAgICAgICAgJ25vdmVsJyxcbiAgICAgICAgICAgICdvY2VhbicsXG4gICAgICAgICAgICAncHJvJyxcbiAgICAgICAgICAgICdyZWQnLFxuICAgICAgICAgICAgJ3JlZC1zYW5kcycsXG4gICAgICAgICAgICAnc2lsdmVyLWFlcm9nZWwnLFxuICAgICAgICAgICAgJ3NvbGFyaXplZC1kYXJrJyxcbiAgICAgICAgICAgICdzb2xpZC1jb2xvcnMnLFxuICAgICAgICAgICAgJ2RyYWN1bGEnLFxuICAgICAgICAgICAgJ29uZS1kYXJrJyxcbiAgICAgICAgICAgICdjaHJpc3RtYXMnXG4gICAgICAgICAgXVxuICAgIGFuc2lDb2xvcnM6XG4gICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgb3JkZXI6IDRcbiAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgIG5vcm1hbDpcbiAgICAgICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgICAgIG9yZGVyOiAxXG4gICAgICAgICAgcHJvcGVydGllczpcbiAgICAgICAgICAgIGJsYWNrOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JsYWNrJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JsYWNrIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzAwMDAwMCdcbiAgICAgICAgICAgIHJlZDpcbiAgICAgICAgICAgICAgdGl0bGU6ICdSZWQnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUmVkIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnI0NEMDAwMCdcbiAgICAgICAgICAgIGdyZWVuOlxuICAgICAgICAgICAgICB0aXRsZTogJ0dyZWVuJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0dyZWVuIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzAwQ0QwMCdcbiAgICAgICAgICAgIHllbGxvdzpcbiAgICAgICAgICAgICAgdGl0bGU6ICdZZWxsb3cnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnWWVsbG93IGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnI0NEQ0QwMCdcbiAgICAgICAgICAgIGJsdWU6XG4gICAgICAgICAgICAgIHRpdGxlOiAnQmx1ZSdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCbHVlIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzAwMDBDRCdcbiAgICAgICAgICAgIG1hZ2VudGE6XG4gICAgICAgICAgICAgIHRpdGxlOiAnTWFnZW50YSdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdNYWdlbnRhIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnI0NEMDBDRCdcbiAgICAgICAgICAgIGN5YW46XG4gICAgICAgICAgICAgIHRpdGxlOiAnQ3lhbidcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDeWFuIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzAwQ0RDRCdcbiAgICAgICAgICAgIHdoaXRlOlxuICAgICAgICAgICAgICB0aXRsZTogJ1doaXRlJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1doaXRlIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnI0U1RTVFNSdcbiAgICAgICAgekJyaWdodDpcbiAgICAgICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgICAgIG9yZGVyOiAyXG4gICAgICAgICAgcHJvcGVydGllczpcbiAgICAgICAgICAgIGJyaWdodEJsYWNrOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBCbGFjaydcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgYmxhY2sgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjN0Y3RjdGJ1xuICAgICAgICAgICAgYnJpZ2h0UmVkOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBSZWQnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IHJlZCBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNGRjAwMDAnXG4gICAgICAgICAgICBicmlnaHRHcmVlbjpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgR3JlZW4nXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IGdyZWVuIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzAwRkYwMCdcbiAgICAgICAgICAgIGJyaWdodFllbGxvdzpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgWWVsbG93J1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCB5ZWxsb3cgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjRkZGRjAwJ1xuICAgICAgICAgICAgYnJpZ2h0Qmx1ZTpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgQmx1ZSdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgYmx1ZSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMDAwRkYnXG4gICAgICAgICAgICBicmlnaHRNYWdlbnRhOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBNYWdlbnRhJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCBtYWdlbnRhIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnI0ZGMDBGRidcbiAgICAgICAgICAgIGJyaWdodEN5YW46XG4gICAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IEN5YW4nXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IGN5YW4gY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjMDBGRkZGJ1xuICAgICAgICAgICAgYnJpZ2h0V2hpdGU6XG4gICAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IFdoaXRlJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCB3aGl0ZSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNGRkZGRkYnXG4gICAgaWNvbkNvbG9yczpcbiAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICBvcmRlcjogNVxuICAgICAgcHJvcGVydGllczpcbiAgICAgICAgcmVkOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gUmVkJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUmVkIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ3JlZCdcbiAgICAgICAgb3JhbmdlOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gT3JhbmdlJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnT3JhbmdlIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ29yYW5nZSdcbiAgICAgICAgeWVsbG93OlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gWWVsbG93J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnWWVsbG93IGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ3llbGxvdydcbiAgICAgICAgZ3JlZW46XG4gICAgICAgICAgdGl0bGU6ICdTdGF0dXMgSWNvbiBHcmVlbidcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0dyZWVuIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ2dyZWVuJ1xuICAgICAgICBibHVlOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gQmx1ZSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JsdWUgY29sb3IgdXNlZCBmb3Igc3RhdHVzIGljb24uJ1xuICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICBkZWZhdWx0OiAnYmx1ZSdcbiAgICAgICAgcHVycGxlOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gUHVycGxlJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHVycGxlIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ3B1cnBsZSdcbiAgICAgICAgcGluazpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIFBpbmsnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdQaW5rIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ2hvdHBpbmsnXG4gICAgICAgIGN5YW46XG4gICAgICAgICAgdGl0bGU6ICdTdGF0dXMgSWNvbiBDeWFuJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ3lhbiBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdjeWFuJ1xuICAgICAgICBtYWdlbnRhOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gTWFnZW50YSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ01hZ2VudGEgY29sb3IgdXNlZCBmb3Igc3RhdHVzIGljb24uJ1xuICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICBkZWZhdWx0OiAnbWFnZW50YSdcbiAgICBjdXN0b21UZXh0czpcbiAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICBvcmRlcjogNlxuICAgICAgcHJvcGVydGllczpcbiAgICAgICAgY3VzdG9tVGV4dDE6XG4gICAgICAgICAgdGl0bGU6ICdDdXN0b20gdGV4dCAxJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGV4dCB0byBwYXN0ZSB3aGVuIGNhbGxpbmcgcGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTEsICRTIGlzIHJlcGxhY2VkIGJ5IHNlbGVjdGlvbiwgJEYgaXMgcmVwbGFjZWQgYnkgZmlsZSBuYW1lLCAkRCBpcyByZXBsYWNlZCBieSBmaWxlIGRpcmVjdG9yeSwgJEwgaXMgcmVwbGFjZWQgYnkgbGluZSBudW1iZXIgb2YgY3Vyc29yLCAkJCBpcyByZXBsYWNlZCBieSAkJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgY3VzdG9tVGV4dDI6XG4gICAgICAgICAgdGl0bGU6ICdDdXN0b20gdGV4dCAyJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGV4dCB0byBwYXN0ZSB3aGVuIGNhbGxpbmcgcGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTInXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBjdXN0b21UZXh0MzpcbiAgICAgICAgICB0aXRsZTogJ0N1c3RvbSB0ZXh0IDMnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdUZXh0IHRvIHBhc3RlIHdoZW4gY2FsbGluZyBwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDppbnNlcnQtY3VzdG9tLXRleHQtMydcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICAgIGN1c3RvbVRleHQ0OlxuICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIHRleHQgNCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RleHQgdG8gcGFzdGUgd2hlbiBjYWxsaW5nIHBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmluc2VydC1jdXN0b20tdGV4dC00J1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgY3VzdG9tVGV4dDU6XG4gICAgICAgICAgdGl0bGU6ICdDdXN0b20gdGV4dCA1J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGV4dCB0byBwYXN0ZSB3aGVuIGNhbGxpbmcgcGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTUnXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBjdXN0b21UZXh0NjpcbiAgICAgICAgICB0aXRsZTogJ0N1c3RvbSB0ZXh0IDYnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdUZXh0IHRvIHBhc3RlIHdoZW4gY2FsbGluZyBwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDppbnNlcnQtY3VzdG9tLXRleHQtNidcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICAgIGN1c3RvbVRleHQ3OlxuICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIHRleHQgNydcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RleHQgdG8gcGFzdGUgd2hlbiBjYWxsaW5nIHBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmluc2VydC1jdXN0b20tdGV4dC03J1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgY3VzdG9tVGV4dDg6XG4gICAgICAgICAgdGl0bGU6ICdDdXN0b20gdGV4dCA4J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGV4dCB0byBwYXN0ZSB3aGVuIGNhbGxpbmcgcGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTgnXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuIl19
