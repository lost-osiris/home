(function() {
  module.exports = {
    statusBar: null,
    activate: function() {
      return this.statusBar = new (require('./status-bar'))();
    },
    deactivate: function() {
      return this.statusBar.destroy();
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
            description: 'Run text inserted via `terminal-plus:insert-text` as a command? **This will append an end-of-line character to input.**',
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
                return process.env.SHELL;
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
            "enum": ['standard', 'inverse', 'grass', 'homebrew', 'man-page', 'novel', 'ocean', 'pro', 'red', 'red-sands', 'silver-aerogel', 'solid-colors', 'dracula']
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
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmFsLXBsdXMvbGliL3Rlcm1pbmFsLXBsdXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFNBQUEsRUFBVyxJQUFYO0lBRUEsUUFBQSxFQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLENBQUMsT0FBQSxDQUFRLGNBQVIsQ0FBRCxDQUFBLENBQUE7SUFEVCxDQUZWO0lBS0EsVUFBQSxFQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBQTtJQURVLENBTFo7SUFRQSxNQUFBLEVBQ0U7TUFBQSxPQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLEtBQUEsRUFBTyxDQURQO1FBRUEsVUFBQSxFQUNFO1VBQUEsU0FBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLHdCQUFQO1lBQ0EsV0FBQSxFQUFhLCtDQURiO1lBRUEsSUFBQSxFQUFNLFNBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7V0FERjtVQUtBLFdBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxjQUFQO1lBQ0EsV0FBQSxFQUFhLHNEQURiO1lBRUEsSUFBQSxFQUFNLFNBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7V0FORjtVQVVBLGVBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxtQkFBUDtZQUNBLFdBQUEsRUFBYSx5SEFEYjtZQUVBLElBQUEsRUFBTSxTQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO1dBWEY7U0FIRjtPQURGO01BbUJBLElBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsS0FBQSxFQUFPLENBRFA7UUFFQSxVQUFBLEVBQ0U7VUFBQSxjQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sa0JBQVA7WUFDQSxXQUFBLEVBQWEsNENBRGI7WUFFQSxJQUFBLEVBQU0sUUFGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFIVDtXQURGO1VBS0EsY0FBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLGtCQUFQO1lBQ0EsV0FBQSxFQUFhLHFHQURiO1lBRUEsSUFBQSxFQUFNLFFBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BSFQ7WUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsUUFBakIsQ0FKTjtXQU5GO1VBV0Esc0JBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxpREFBUDtZQUNBLFdBQUEsRUFBYSxtSEFEYjtZQUVBLElBQUEsRUFBTSxTQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO1dBWkY7VUFnQkEsVUFBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLGFBQVA7WUFDQSxXQUFBLEVBQWEsMkNBRGI7WUFFQSxJQUFBLEVBQU0sU0FGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFIVDtXQWpCRjtVQXFCQSxLQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sZ0JBQVA7WUFDQSxXQUFBLEVBQWEsZ0RBRGI7WUFFQSxJQUFBLEVBQU0sUUFGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVksQ0FBQSxTQUFBO0FBQ1Ysa0JBQUE7Y0FBQSxJQUFHLE9BQU8sQ0FBQyxRQUFSLEtBQW9CLE9BQXZCO2dCQUNFLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjt1QkFDUCxJQUFJLENBQUMsT0FBTCxDQUFhLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBekIsRUFBcUMsVUFBckMsRUFBaUQsbUJBQWpELEVBQXNFLE1BQXRFLEVBQThFLGdCQUE5RSxFQUZGO2VBQUEsTUFBQTt1QkFJRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BSmQ7O1lBRFUsQ0FBQSxDQUFILENBQUEsQ0FIVDtXQXRCRjtVQStCQSxjQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8saUJBQVA7WUFDQSxXQUFBLEVBQWEseURBRGI7WUFFQSxJQUFBLEVBQU0sUUFGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFIVDtXQWhDRjtVQW9DQSxnQkFBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLG1CQUFQO1lBQ0EsV0FBQSxFQUFhLHNGQURiO1lBRUEsSUFBQSxFQUFNLFFBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBSFQ7WUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsTUFBRCxFQUFTLFNBQVQsRUFBb0IsYUFBcEIsQ0FKTjtXQXJDRjtTQUhGO09BcEJGO01BaUVBLEtBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsS0FBQSxFQUFPLENBRFA7UUFFQSxVQUFBLEVBQ0U7VUFBQSxjQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8saUJBQVA7WUFDQSxXQUFBLEVBQWEscUNBRGI7WUFFQSxJQUFBLEVBQU0sUUFGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsR0FIVDtZQUlBLE9BQUEsRUFBUyxHQUpUO1lBS0EsT0FBQSxFQUFTLEtBTFQ7V0FERjtVQU9BLFVBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxhQUFQO1lBQ0EsV0FBQSxFQUFhLGdKQURiO1lBRUEsSUFBQSxFQUFNLFFBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBSFQ7V0FSRjtVQVlBLFFBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxXQUFQO1lBQ0EsV0FBQSxFQUFhLDZDQURiO1lBRUEsSUFBQSxFQUFNLFFBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBSFQ7V0FiRjtVQWlCQSxrQkFBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLHNCQUFQO1lBQ0EsV0FBQSxFQUFhLGdGQURiO1lBRUEsSUFBQSxFQUFNLFFBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE9BSFQ7V0FsQkY7VUFzQkEsS0FBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLE9BQVA7WUFDQSxXQUFBLEVBQWEsa0NBRGI7WUFFQSxJQUFBLEVBQU0sUUFGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsVUFIVDtZQUlBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FDSixVQURJLEVBRUosU0FGSSxFQUdKLE9BSEksRUFJSixVQUpJLEVBS0osVUFMSSxFQU1KLE9BTkksRUFPSixPQVBJLEVBUUosS0FSSSxFQVNKLEtBVEksRUFVSixXQVZJLEVBV0osZ0JBWEksRUFZSixjQVpJLEVBYUosU0FiSSxDQUpOO1dBdkJGO1NBSEY7T0FsRUY7TUErR0EsVUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxLQUFBLEVBQU8sQ0FEUDtRQUVBLFVBQUEsRUFDRTtVQUFBLE1BQUEsRUFDRTtZQUFBLElBQUEsRUFBTSxRQUFOO1lBQ0EsS0FBQSxFQUFPLENBRFA7WUFFQSxVQUFBLEVBQ0U7Y0FBQSxLQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLE9BQVA7Z0JBQ0EsV0FBQSxFQUFhLCtDQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQURGO2NBS0EsR0FBQSxFQUNFO2dCQUFBLEtBQUEsRUFBTyxLQUFQO2dCQUNBLFdBQUEsRUFBYSw2Q0FEYjtnQkFFQSxJQUFBLEVBQU0sT0FGTjtnQkFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBSFQ7ZUFORjtjQVVBLEtBQUEsRUFDRTtnQkFBQSxLQUFBLEVBQU8sT0FBUDtnQkFDQSxXQUFBLEVBQWEsK0NBRGI7Z0JBRUEsSUFBQSxFQUFNLE9BRk47Z0JBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUhUO2VBWEY7Y0FlQSxNQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLFFBQVA7Z0JBQ0EsV0FBQSxFQUFhLGdEQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQWhCRjtjQW9CQSxJQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLE1BQVA7Z0JBQ0EsV0FBQSxFQUFhLDhDQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQXJCRjtjQXlCQSxPQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLFNBQVA7Z0JBQ0EsV0FBQSxFQUFhLGlEQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQTFCRjtjQThCQSxJQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLE1BQVA7Z0JBQ0EsV0FBQSxFQUFhLDhDQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQS9CRjtjQW1DQSxLQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLE9BQVA7Z0JBQ0EsV0FBQSxFQUFhLCtDQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQXBDRjthQUhGO1dBREY7VUE0Q0EsT0FBQSxFQUNFO1lBQUEsSUFBQSxFQUFNLFFBQU47WUFDQSxLQUFBLEVBQU8sQ0FEUDtZQUVBLFVBQUEsRUFDRTtjQUFBLFdBQUEsRUFDRTtnQkFBQSxLQUFBLEVBQU8sY0FBUDtnQkFDQSxXQUFBLEVBQWEsc0RBRGI7Z0JBRUEsSUFBQSxFQUFNLE9BRk47Z0JBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUhUO2VBREY7Y0FLQSxTQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLFlBQVA7Z0JBQ0EsV0FBQSxFQUFhLG9EQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQU5GO2NBVUEsV0FBQSxFQUNFO2dCQUFBLEtBQUEsRUFBTyxjQUFQO2dCQUNBLFdBQUEsRUFBYSxzREFEYjtnQkFFQSxJQUFBLEVBQU0sT0FGTjtnQkFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBSFQ7ZUFYRjtjQWVBLFlBQUEsRUFDRTtnQkFBQSxLQUFBLEVBQU8sZUFBUDtnQkFDQSxXQUFBLEVBQWEsdURBRGI7Z0JBRUEsSUFBQSxFQUFNLE9BRk47Z0JBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUhUO2VBaEJGO2NBb0JBLFVBQUEsRUFDRTtnQkFBQSxLQUFBLEVBQU8sYUFBUDtnQkFDQSxXQUFBLEVBQWEscURBRGI7Z0JBRUEsSUFBQSxFQUFNLE9BRk47Z0JBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUhUO2VBckJGO2NBeUJBLGFBQUEsRUFDRTtnQkFBQSxLQUFBLEVBQU8sZ0JBQVA7Z0JBQ0EsV0FBQSxFQUFhLHdEQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQTFCRjtjQThCQSxVQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLGFBQVA7Z0JBQ0EsV0FBQSxFQUFhLHFEQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQS9CRjtjQW1DQSxXQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLGNBQVA7Z0JBQ0EsV0FBQSxFQUFhLHNEQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQXBDRjthQUhGO1dBN0NGO1NBSEY7T0FoSEY7TUEyTUEsVUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxLQUFBLEVBQU8sQ0FEUDtRQUVBLFVBQUEsRUFDRTtVQUFBLEdBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxpQkFBUDtZQUNBLFdBQUEsRUFBYSxpQ0FEYjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO1dBREY7VUFLQSxNQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sb0JBQVA7WUFDQSxXQUFBLEVBQWEsb0NBRGI7WUFFQSxJQUFBLEVBQU0sT0FGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsUUFIVDtXQU5GO1VBVUEsTUFBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLG9CQUFQO1lBQ0EsV0FBQSxFQUFhLG9DQURiO1lBRUEsSUFBQSxFQUFNLE9BRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFFBSFQ7V0FYRjtVQWVBLEtBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxtQkFBUDtZQUNBLFdBQUEsRUFBYSxtQ0FEYjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQUhUO1dBaEJGO1VBb0JBLElBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxrQkFBUDtZQUNBLFdBQUEsRUFBYSxrQ0FEYjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQUhUO1dBckJGO1VBeUJBLE1BQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxvQkFBUDtZQUNBLFdBQUEsRUFBYSxvQ0FEYjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxRQUhUO1dBMUJGO1VBOEJBLElBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxrQkFBUDtZQUNBLFdBQUEsRUFBYSxrQ0FEYjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUhUO1dBL0JGO1VBbUNBLElBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxrQkFBUDtZQUNBLFdBQUEsRUFBYSxrQ0FEYjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQUhUO1dBcENGO1VBd0NBLE9BQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxxQkFBUDtZQUNBLFdBQUEsRUFBYSxxQ0FEYjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUhUO1dBekNGO1NBSEY7T0E1TUY7S0FURjs7QUFERiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbiAgc3RhdHVzQmFyOiBudWxsXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgQHN0YXR1c0JhciA9IG5ldyAocmVxdWlyZSAnLi9zdGF0dXMtYmFyJykoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN0YXR1c0Jhci5kZXN0cm95KClcblxuICBjb25maWc6XG4gICAgdG9nZ2xlczpcbiAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICBvcmRlcjogMVxuICAgICAgcHJvcGVydGllczpcbiAgICAgICAgYXV0b0Nsb3NlOlxuICAgICAgICAgIHRpdGxlOiAnQ2xvc2UgVGVybWluYWwgb24gRXhpdCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1Nob3VsZCB0aGUgdGVybWluYWwgY2xvc2UgaWYgdGhlIHNoZWxsIGV4aXRzPydcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBjdXJzb3JCbGluazpcbiAgICAgICAgICB0aXRsZTogJ0N1cnNvciBCbGluaydcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1Nob3VsZCB0aGUgY3Vyc29yIGJsaW5rIHdoZW4gdGhlIHRlcm1pbmFsIGlzIGFjdGl2ZT8nXG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICBydW5JbnNlcnRlZFRleHQ6XG4gICAgICAgICAgdGl0bGU6ICdSdW4gSW5zZXJ0ZWQgVGV4dCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1J1biB0ZXh0IGluc2VydGVkIHZpYSBgdGVybWluYWwtcGx1czppbnNlcnQtdGV4dGAgYXMgYSBjb21tYW5kPyAqKlRoaXMgd2lsbCBhcHBlbmQgYW4gZW5kLW9mLWxpbmUgY2hhcmFjdGVyIHRvIGlucHV0LioqJ1xuICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICBjb3JlOlxuICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgIG9yZGVyOiAyXG4gICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICBhdXRvUnVuQ29tbWFuZDpcbiAgICAgICAgICB0aXRsZTogJ0F1dG8gUnVuIENvbW1hbmQnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdDb21tYW5kIHRvIHJ1biBvbiB0ZXJtaW5hbCBpbml0aWFsaXphdGlvbi4nXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBtYXBUZXJtaW5hbHNUbzpcbiAgICAgICAgICB0aXRsZTogJ01hcCBUZXJtaW5hbHMgVG8nXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdNYXAgdGVybWluYWxzIHRvIGVhY2ggZmlsZSBvciBmb2xkZXIuIERlZmF1bHQgaXMgbm8gYWN0aW9uIG9yIG1hcHBpbmcgYXQgYWxsLiAqKlJlc3RhcnQgcmVxdWlyZWQuKionXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnTm9uZSdcbiAgICAgICAgICBlbnVtOiBbJ05vbmUnLCAnRmlsZScsICdGb2xkZXInXVxuICAgICAgICBtYXBUZXJtaW5hbHNUb0F1dG9PcGVuOlxuICAgICAgICAgIHRpdGxlOiAnQXV0byBPcGVuIGEgTmV3IFRlcm1pbmFsIChGb3IgVGVybWluYWwgTWFwcGluZyknXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdTaG91bGQgYSBuZXcgdGVybWluYWwgYmUgb3BlbmVkIGZvciBuZXcgaXRlbXM/ICoqTm90ZToqKiBUaGlzIHdvcmtzIGluIGNvbmp1bmN0aW9uIHdpdGggYE1hcCBUZXJtaW5hbHMgVG9gIGFib3ZlLidcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBzY3JvbGxiYWNrOlxuICAgICAgICAgIHRpdGxlOiAnU2Nyb2xsIEJhY2snXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdIb3cgbWFueSBsaW5lcyBvZiBoaXN0b3J5IHNob3VsZCBiZSBrZXB0PydcbiAgICAgICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgICAgICBkZWZhdWx0OiAxMDAwXG4gICAgICAgIHNoZWxsOlxuICAgICAgICAgIHRpdGxlOiAnU2hlbGwgT3ZlcnJpZGUnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdPdmVycmlkZSB0aGUgZGVmYXVsdCBzaGVsbCBpbnN0YW5jZSB0byBsYXVuY2guJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogZG8gLT5cbiAgICAgICAgICAgIGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgJ3dpbjMyJ1xuICAgICAgICAgICAgICBwYXRoID0gcmVxdWlyZSAncGF0aCdcbiAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKHByb2Nlc3MuZW52LlN5c3RlbVJvb3QsICdTeXN0ZW0zMicsICdXaW5kb3dzUG93ZXJTaGVsbCcsICd2MS4wJywgJ3Bvd2Vyc2hlbGwuZXhlJylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuU0hFTExcbiAgICAgICAgc2hlbGxBcmd1bWVudHM6XG4gICAgICAgICAgdGl0bGU6ICdTaGVsbCBBcmd1bWVudHMnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdTcGVjaWZ5IHNvbWUgYXJndW1lbnRzIHRvIHVzZSB3aGVuIGxhdW5jaGluZyB0aGUgc2hlbGwuJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgd29ya2luZ0RpcmVjdG9yeTpcbiAgICAgICAgICB0aXRsZTogJ1dvcmtpbmcgRGlyZWN0b3J5J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnV2hpY2ggZGlyZWN0b3J5IHNob3VsZCBiZSB0aGUgcHJlc2VudCB3b3JraW5nIGRpcmVjdG9yeSB3aGVuIGEgbmV3IHRlcm1pbmFsIGlzIG1hZGU/J1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJ1Byb2plY3QnXG4gICAgICAgICAgZW51bTogWydIb21lJywgJ1Byb2plY3QnLCAnQWN0aXZlIEZpbGUnXVxuICAgIHN0eWxlOlxuICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgIG9yZGVyOiAzXG4gICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICBhbmltYXRpb25TcGVlZDpcbiAgICAgICAgICB0aXRsZTogJ0FuaW1hdGlvbiBTcGVlZCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0hvdyBmYXN0IHNob3VsZCB0aGUgd2luZG93IGFuaW1hdGU/J1xuICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgICAgZGVmYXVsdDogJzEnXG4gICAgICAgICAgbWluaW11bTogJzAnXG4gICAgICAgICAgbWF4aW11bTogJzEwMCdcbiAgICAgICAgZm9udEZhbWlseTpcbiAgICAgICAgICB0aXRsZTogJ0ZvbnQgRmFtaWx5J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnT3ZlcnJpZGUgdGhlIHRlcm1pbmFsXFwncyBkZWZhdWx0IGZvbnQgZmFtaWx5LiAqKllvdSBtdXN0IHVzZSBhIFttb25vc3BhY2VkIGZvbnRdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfdHlwZWZhY2VzI01vbm9zcGFjZSkhKionXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBmb250U2l6ZTpcbiAgICAgICAgICB0aXRsZTogJ0ZvbnQgU2l6ZSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ092ZXJyaWRlIHRoZSB0ZXJtaW5hbFxcJ3MgZGVmYXVsdCBmb250IHNpemUuJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgZGVmYXVsdFBhbmVsSGVpZ2h0OlxuICAgICAgICAgIHRpdGxlOiAnRGVmYXVsdCBQYW5lbCBIZWlnaHQnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdEZWZhdWx0IGhlaWdodCBvZiBhIHRlcm1pbmFsIHBhbmVsLiAqKllvdSBtYXkgZW50ZXIgYSB2YWx1ZSBpbiBweCwgZW0sIG9yICUuKionXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnMzAwcHgnXG4gICAgICAgIHRoZW1lOlxuICAgICAgICAgIHRpdGxlOiAnVGhlbWUnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdTZWxlY3QgYSB0aGVtZSBmb3IgdGhlIHRlcm1pbmFsLidcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdzdGFuZGFyZCdcbiAgICAgICAgICBlbnVtOiBbXG4gICAgICAgICAgICAnc3RhbmRhcmQnLFxuICAgICAgICAgICAgJ2ludmVyc2UnLFxuICAgICAgICAgICAgJ2dyYXNzJyxcbiAgICAgICAgICAgICdob21lYnJldycsXG4gICAgICAgICAgICAnbWFuLXBhZ2UnLFxuICAgICAgICAgICAgJ25vdmVsJyxcbiAgICAgICAgICAgICdvY2VhbicsXG4gICAgICAgICAgICAncHJvJyxcbiAgICAgICAgICAgICdyZWQnLFxuICAgICAgICAgICAgJ3JlZC1zYW5kcycsXG4gICAgICAgICAgICAnc2lsdmVyLWFlcm9nZWwnLFxuICAgICAgICAgICAgJ3NvbGlkLWNvbG9ycycsXG4gICAgICAgICAgICAnZHJhY3VsYSdcbiAgICAgICAgICBdXG4gICAgYW5zaUNvbG9yczpcbiAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICBvcmRlcjogNFxuICAgICAgcHJvcGVydGllczpcbiAgICAgICAgbm9ybWFsOlxuICAgICAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICAgICAgb3JkZXI6IDFcbiAgICAgICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICAgICAgYmxhY2s6XG4gICAgICAgICAgICAgIHRpdGxlOiAnQmxhY2snXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQmxhY2sgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjMDAwMDAwJ1xuICAgICAgICAgICAgcmVkOlxuICAgICAgICAgICAgICB0aXRsZTogJ1JlZCdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSZWQgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjQ0QwMDAwJ1xuICAgICAgICAgICAgZ3JlZW46XG4gICAgICAgICAgICAgIHRpdGxlOiAnR3JlZW4nXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnR3JlZW4gY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjMDBDRDAwJ1xuICAgICAgICAgICAgeWVsbG93OlxuICAgICAgICAgICAgICB0aXRsZTogJ1llbGxvdydcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdZZWxsb3cgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjQ0RDRDAwJ1xuICAgICAgICAgICAgYmx1ZTpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCbHVlJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JsdWUgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjMDAwMENEJ1xuICAgICAgICAgICAgbWFnZW50YTpcbiAgICAgICAgICAgICAgdGl0bGU6ICdNYWdlbnRhJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ01hZ2VudGEgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjQ0QwMENEJ1xuICAgICAgICAgICAgY3lhbjpcbiAgICAgICAgICAgICAgdGl0bGU6ICdDeWFuJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0N5YW4gY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjMDBDRENEJ1xuICAgICAgICAgICAgd2hpdGU6XG4gICAgICAgICAgICAgIHRpdGxlOiAnV2hpdGUnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnV2hpdGUgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjRTVFNUU1J1xuICAgICAgICB6QnJpZ2h0OlxuICAgICAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICAgICAgb3JkZXI6IDJcbiAgICAgICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICAgICAgYnJpZ2h0QmxhY2s6XG4gICAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IEJsYWNrJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCBibGFjayBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyM3RjdGN0YnXG4gICAgICAgICAgICBicmlnaHRSZWQ6XG4gICAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IFJlZCdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgcmVkIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnI0ZGMDAwMCdcbiAgICAgICAgICAgIGJyaWdodEdyZWVuOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBHcmVlbidcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgZ3JlZW4gY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjMDBGRjAwJ1xuICAgICAgICAgICAgYnJpZ2h0WWVsbG93OlxuICAgICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBZZWxsb3cnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IHllbGxvdyBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNGRkZGMDAnXG4gICAgICAgICAgICBicmlnaHRCbHVlOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBCbHVlJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCBibHVlIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzAwMDBGRidcbiAgICAgICAgICAgIGJyaWdodE1hZ2VudGE6XG4gICAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IE1hZ2VudGEnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IG1hZ2VudGEgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjRkYwMEZGJ1xuICAgICAgICAgICAgYnJpZ2h0Q3lhbjpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgQ3lhbidcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgY3lhbiBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMEZGRkYnXG4gICAgICAgICAgICBicmlnaHRXaGl0ZTpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgV2hpdGUnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IHdoaXRlIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnI0ZGRkZGRidcbiAgICBpY29uQ29sb3JzOlxuICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgIG9yZGVyOiA1XG4gICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICByZWQ6XG4gICAgICAgICAgdGl0bGU6ICdTdGF0dXMgSWNvbiBSZWQnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdSZWQgY29sb3IgdXNlZCBmb3Igc3RhdHVzIGljb24uJ1xuICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICBkZWZhdWx0OiAncmVkJ1xuICAgICAgICBvcmFuZ2U6XG4gICAgICAgICAgdGl0bGU6ICdTdGF0dXMgSWNvbiBPcmFuZ2UnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdPcmFuZ2UgY29sb3IgdXNlZCBmb3Igc3RhdHVzIGljb24uJ1xuICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICBkZWZhdWx0OiAnb3JhbmdlJ1xuICAgICAgICB5ZWxsb3c6XG4gICAgICAgICAgdGl0bGU6ICdTdGF0dXMgSWNvbiBZZWxsb3cnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdZZWxsb3cgY29sb3IgdXNlZCBmb3Igc3RhdHVzIGljb24uJ1xuICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICBkZWZhdWx0OiAneWVsbG93J1xuICAgICAgICBncmVlbjpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIEdyZWVuJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnR3JlZW4gY29sb3IgdXNlZCBmb3Igc3RhdHVzIGljb24uJ1xuICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICBkZWZhdWx0OiAnZ3JlZW4nXG4gICAgICAgIGJsdWU6XG4gICAgICAgICAgdGl0bGU6ICdTdGF0dXMgSWNvbiBCbHVlJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQmx1ZSBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdibHVlJ1xuICAgICAgICBwdXJwbGU6XG4gICAgICAgICAgdGl0bGU6ICdTdGF0dXMgSWNvbiBQdXJwbGUnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdQdXJwbGUgY29sb3IgdXNlZCBmb3Igc3RhdHVzIGljb24uJ1xuICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICBkZWZhdWx0OiAncHVycGxlJ1xuICAgICAgICBwaW5rOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gUGluaydcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1BpbmsgY29sb3IgdXNlZCBmb3Igc3RhdHVzIGljb24uJ1xuICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICBkZWZhdWx0OiAnaG90cGluaydcbiAgICAgICAgY3lhbjpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIEN5YW4nXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdDeWFuIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ2N5YW4nXG4gICAgICAgIG1hZ2VudGE6XG4gICAgICAgICAgdGl0bGU6ICdTdGF0dXMgSWNvbiBNYWdlbnRhJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTWFnZW50YSBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdtYWdlbnRhJ1xuIl19
