(function() {
  var Base, BufferedProcess, CompositeDisposable, Developer, Disposable, Emitter, getEditorState, ref, settings;

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, BufferedProcess = ref.BufferedProcess, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  settings = require('./settings');

  getEditorState = null;

  Developer = (function() {
    var kinds, modifierKeyMap, selectorMap;

    function Developer() {}

    Developer.prototype.init = function(_getEditorState) {
      var commands, fn, name, subscriptions;
      getEditorState = _getEditorState;
      this.devEnvironmentByBuffer = new Map;
      this.reloadSubscriptionByBuffer = new Map;
      commands = {
        'toggle-debug': (function(_this) {
          return function() {
            return _this.toggleDebug();
          };
        })(this),
        'open-in-vim': (function(_this) {
          return function() {
            return _this.openInVim();
          };
        })(this),
        'generate-introspection-report': (function(_this) {
          return function() {
            return _this.generateIntrospectionReport();
          };
        })(this),
        'generate-command-summary-table': (function(_this) {
          return function() {
            return _this.generateCommandSummaryTable();
          };
        })(this),
        'write-command-table-on-disk': function() {
          return Base.writeCommandTableOnDisk();
        },
        'clear-debug-output': (function(_this) {
          return function() {
            return _this.clearDebugOutput();
          };
        })(this),
        'reload': (function(_this) {
          return function() {
            return _this.reload();
          };
        })(this),
        'reload-with-dependencies': (function(_this) {
          return function() {
            return _this.reload(true);
          };
        })(this),
        'report-total-marker-count': (function(_this) {
          return function() {
            return _this.getAllMarkerCount();
          };
        })(this),
        'report-total-and-per-editor-marker-count': (function(_this) {
          return function() {
            return _this.getAllMarkerCount(true);
          };
        })(this),
        'report-require-cache': (function(_this) {
          return function() {
            return _this.reportRequireCache({
              excludeNodModules: true
            });
          };
        })(this),
        'report-require-cache-all': (function(_this) {
          return function() {
            return _this.reportRequireCache({
              excludeNodModules: false
            });
          };
        })(this)
      };
      subscriptions = new CompositeDisposable;
      for (name in commands) {
        fn = commands[name];
        subscriptions.add(this.addCommand(name, fn));
      }
      return subscriptions;
    };

    Developer.prototype.reportRequireCache = function(arg) {
      var cachedPath, cachedPaths, excludeNodModules, focus, i, len, packPath, pathSeparator, results;
      focus = arg.focus, excludeNodModules = arg.excludeNodModules;
      pathSeparator = require('path').sep;
      packPath = atom.packages.getLoadedPackage("vim-mode-plus").path;
      cachedPaths = Object.keys(require.cache).filter(function(p) {
        return p.startsWith(packPath + pathSeparator);
      }).map(function(p) {
        return p.replace(packPath, '');
      });
      results = [];
      for (i = 0, len = cachedPaths.length; i < len; i++) {
        cachedPath = cachedPaths[i];
        if (excludeNodModules && cachedPath.search(/node_modules/) >= 0) {
          continue;
        }
        if (focus && cachedPath.search(RegExp("" + focus)) >= 0) {
          cachedPath = '*' + cachedPath;
        }
        results.push(console.log(cachedPath));
      }
      return results;
    };

    Developer.prototype.getAllMarkerCount = function(showEditorsReport) {
      var basename, editor, hlsearch, i, inspect, len, mark, mutation, occurrence, persistentSel, ref1, total, vimState;
      if (showEditorsReport == null) {
        showEditorsReport = false;
      }
      inspect = require('util').inspect;
      basename = require('path').basename;
      total = {
        mark: 0,
        hlsearch: 0,
        mutation: 0,
        occurrence: 0,
        persistentSel: 0
      };
      ref1 = atom.workspace.getTextEditors();
      for (i = 0, len = ref1.length; i < len; i++) {
        editor = ref1[i];
        vimState = getEditorState(editor);
        mark = vimState.mark.markerLayer.getMarkerCount();
        hlsearch = vimState.highlightSearch.markerLayer.getMarkerCount();
        mutation = vimState.mutationManager.markerLayer.getMarkerCount();
        occurrence = vimState.occurrenceManager.markerLayer.getMarkerCount();
        persistentSel = vimState.persistentSelection.markerLayer.getMarkerCount();
        if (showEditorsReport) {
          console.log(basename(editor.getPath()), inspect({
            mark: mark,
            hlsearch: hlsearch,
            mutation: mutation,
            occurrence: occurrence,
            persistentSel: persistentSel
          }));
        }
        total.mark += mark;
        total.hlsearch += hlsearch;
        total.mutation += mutation;
        total.occurrence += occurrence;
        total.persistentSel += persistentSel;
      }
      return console.log('total', inspect(total));
    };

    Developer.prototype.reload = function(reloadDependencies) {
      var activate, deactivate, invalidateRequireCacheForPackage, loadedPackages, packages, pathSeparator;
      pathSeparator = require('path').sep;
      packages = ['vim-mode-plus'];
      if (reloadDependencies) {
        packages.push.apply(packages, settings.get('devReloadPackages'));
      }
      invalidateRequireCacheForPackage = function(packPath) {
        return Object.keys(require.cache).filter(function(p) {
          return p.startsWith(packPath + pathSeparator);
        }).forEach(function(p) {
          return delete require.cache[p];
        });
      };
      deactivate = function(packName) {
        var packPath;
        console.log("- deactivating " + packName);
        packPath = atom.packages.getLoadedPackage(packName).path;
        atom.packages.deactivatePackage(packName);
        atom.packages.unloadPackage(packName);
        return invalidateRequireCacheForPackage(packPath);
      };
      activate = function(packName) {
        console.log("+ activating " + packName);
        atom.packages.loadPackage(packName);
        return atom.packages.activatePackage(packName);
      };
      loadedPackages = packages.filter(function(packName) {
        return atom.packages.getLoadedPackages(packName);
      });
      console.log("reload", loadedPackages);
      loadedPackages.map(deactivate);
      console.time('activate');
      loadedPackages.map(activate);
      return console.timeEnd('activate');
    };

    Developer.prototype.addCommand = function(name, fn) {
      return atom.commands.add('atom-text-editor', "vim-mode-plus:" + name, fn);
    };

    Developer.prototype.clearDebugOutput = function(name, fn) {
      var filePath, normalize, options;
      normalize = require('fs-plus').normalize;
      filePath = normalize(settings.get('debugOutputFilePath'));
      options = {
        searchAllPanes: true,
        activatePane: false
      };
      return atom.workspace.open(filePath, options).then(function(editor) {
        editor.setText('');
        return editor.save();
      });
    };

    Developer.prototype.toggleDebug = function() {
      settings.set('debug', !settings.get('debug'));
      return console.log(settings.scope + " debug:", settings.get('debug'));
    };

    modifierKeyMap = {
      "ctrl-cmd-": '\u2303\u2318',
      "cmd-": '\u2318',
      "ctrl-": '\u2303',
      alt: '\u2325',
      option: '\u2325',
      enter: '\u23ce',
      left: '\u2190',
      right: '\u2192',
      up: '\u2191',
      down: '\u2193',
      backspace: 'BS',
      space: 'SPC'
    };

    selectorMap = {
      "atom-text-editor.vim-mode-plus": '',
      ".normal-mode": 'n',
      ".insert-mode": 'i',
      ".replace": 'R',
      ".visual-mode": 'v',
      ".characterwise": 'C',
      ".blockwise": 'B',
      ".linewise": 'L',
      ".operator-pending-mode": 'o',
      ".with-count": '#',
      ".has-persistent-selection": '%'
    };

    Developer.prototype.getCommandSpecs = function() {
      var _, commandName, commands, compactKeystrokes, compactSelector, description, getAncestors, getKeyBindingForCommand, keymap, keymaps, kind, klass, name, ref1;
      _ = require('underscore-plus');
      compactSelector = function(selector) {
        var pattern;
        pattern = RegExp("(" + (_.keys(selectorMap).map(_.escapeRegExp).join('|')) + ")", "g");
        return selector.split(/,\s*/g).map(function(scope) {
          return scope.replace(/:not\((.*)\)/, '!$1').replace(pattern, function(s) {
            return selectorMap[s];
          });
        }).join(",");
      };
      compactKeystrokes = function(keystrokes) {
        var modifierKeyRegexp, specialChars, specialCharsRegexp;
        specialChars = '\\`*_{}[]()#+-.!';
        specialCharsRegexp = RegExp("" + (specialChars.split('').map(_.escapeRegExp).join('|')), "g");
        modifierKeyRegexp = RegExp("(" + (_.keys(modifierKeyMap).map(_.escapeRegExp).join('|')) + ")");
        return keystrokes.replace(modifierKeyRegexp, function(s) {
          return modifierKeyMap[s];
        }).replace(RegExp("(" + specialCharsRegexp + ")", "g"), "\\$1").replace(/\|/g, '&#124;').replace(/\s+/, '');
      };
      ref1 = this.vimstate.utils, getKeyBindingForCommand = ref1.getKeyBindingForCommand, getAncestors = ref1.getAncestors;
      commands = (function() {
        var ref2, ref3, results;
        ref2 = Base.getClassRegistry();
        results = [];
        for (name in ref2) {
          klass = ref2[name];
          if (!(klass.isCommand())) {
            continue;
          }
          kind = getAncestors(klass).map(function(k) {
            return k.name;
          }).slice(-2, -1)[0];
          commandName = klass.getCommandName();
          description = (ref3 = klass.getDesctiption()) != null ? ref3.replace(/\n/g, '<br/>') : void 0;
          keymap = null;
          if (keymaps = getKeyBindingForCommand(commandName, {
            packageName: "vim-mode-plus"
          })) {
            keymap = keymaps.map(function(arg) {
              var keystrokes, selector;
              keystrokes = arg.keystrokes, selector = arg.selector;
              return "`" + (compactSelector(selector)) + "` <code>" + (compactKeystrokes(keystrokes)) + "</code>";
            }).join("<br/>");
          }
          results.push({
            name: name,
            commandName: commandName,
            kind: kind,
            description: description,
            keymap: keymap
          });
        }
        return results;
      })();
      return commands;
    };

    Developer.prototype.generateCommandTableForMotion = function() {
      return require('./motion');
    };

    kinds = ["Operator", "Motion", "TextObject", "InsertMode", "MiscCommand", "Scroll"];

    Developer.prototype.generateSummaryTableForCommandSpecs = function(specs, arg) {
      var _, commandName, description, grouped, header, i, j, keymap, kind, len, len1, ref1, report, str;
      header = (arg != null ? arg : {}).header;
      _ = require('underscore-plus');
      grouped = _.groupBy(specs, 'kind');
      str = "";
      for (i = 0, len = kinds.length; i < len; i++) {
        kind = kinds[i];
        if (!(specs = grouped[kind])) {
          continue;
        }
        report = ["## " + kind, "", "| Keymap | Command | Description |", "|:-------|:--------|:------------|"];
        for (j = 0, len1 = specs.length; j < len1; j++) {
          ref1 = specs[j], keymap = ref1.keymap, commandName = ref1.commandName, description = ref1.description;
          commandName = commandName.replace(/vim-mode-plus:/, '');
          if (description == null) {
            description = "";
          }
          if (keymap == null) {
            keymap = "";
          }
          report.push("| " + keymap + " | `" + commandName + "` | " + description + " |");
        }
        str += report.join("\n") + "\n\n";
      }
      return atom.workspace.open().then(function(editor) {
        if (header != null) {
          editor.insertText(header + "\n");
        }
        return editor.insertText(str);
      });
    };

    Developer.prototype.generateCommandSummaryTable = function() {
      var header;
      header = "## Keymap selector abbreviations\n\nIn this document, following abbreviations are used for shortness.\n\n| Abbrev | Selector                     | Description                         |\n|:-------|:-----------------------------|:------------------------------------|\n| `!i`   | `:not(.insert-mode)`         | except insert-mode                  |\n| `i`    | `.insert-mode`               |                                     |\n| `o`    | `.operator-pending-mode`     |                                     |\n| `n`    | `.normal-mode`               |                                     |\n| `v`    | `.visual-mode`               |                                     |\n| `vB`   | `.visual-mode.blockwise`     |                                     |\n| `vL`   | `.visual-mode.linewise`      |                                     |\n| `vC`   | `.visual-mode.characterwise` |                                     |\n| `iR`   | `.insert-mode.replace`       |                                     |\n| `#`    | `.with-count`                | when count is specified             |\n| `%`    | `.has-persistent-selection` | when persistent-selection is exists |\n";
      return this.generateSummaryTableForCommandSpecs(this.getCommandSpecs(), {
        header: header
      });
    };

    Developer.prototype.openInVim = function() {
      var column, editor, ref1, row;
      editor = atom.workspace.getActiveTextEditor();
      ref1 = editor.getCursorBufferPosition(), row = ref1.row, column = ref1.column;
      return new BufferedProcess({
        command: "/Applications/MacVim.app/Contents/MacOS/Vim",
        args: ['-g', editor.getPath(), "+call cursor(" + (row + 1) + ", " + (column + 1) + ")"]
      });
    };

    Developer.prototype.generateIntrospectionReport = function() {
      var _, generateIntrospectionReport;
      _ = require('underscore-plus');
      generateIntrospectionReport = require('./introspection');
      return generateIntrospectionReport(_.values(Base.getClassRegistry()), {
        excludeProperties: ['run', 'getCommandNameWithoutPrefix', 'getClass', 'extend', 'getParent', 'getAncestors', 'isCommand', 'getClassRegistry', 'command', 'reset', 'getDesctiption', 'description', 'init', 'getCommandName', 'getCommandScope', 'registerCommand', 'delegatesProperties', 'subscriptions', 'commandPrefix', 'commandScope', 'delegatesMethods', 'delegatesProperty', 'delegatesMethod'],
        recursiveInspect: Base
      });
    };

    return Developer;

  })();

  module.exports = Developer;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2RldmVsb3Blci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQThELE9BQUEsQ0FBUSxNQUFSLENBQTlELEVBQUMscUJBQUQsRUFBVSwyQkFBVixFQUFzQixxQ0FBdEIsRUFBdUM7O0VBRXZDLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsY0FBQSxHQUFpQjs7RUFFWDtBQUNKLFFBQUE7Ozs7d0JBQUEsSUFBQSxHQUFNLFNBQUMsZUFBRDtBQUNKLFVBQUE7TUFBQSxjQUFBLEdBQWlCO01BQ2pCLElBQUMsQ0FBQSxzQkFBRCxHQUEwQixJQUFJO01BQzlCLElBQUMsQ0FBQSwwQkFBRCxHQUE4QixJQUFJO01BRWxDLFFBQUEsR0FDRTtRQUFBLGNBQUEsRUFBZ0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsV0FBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCO1FBQ0EsYUFBQSxFQUFlLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFNBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURmO1FBRUEsK0JBQUEsRUFBaUMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsMkJBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZqQztRQUdBLGdDQUFBLEVBQWtDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLDJCQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIbEM7UUFJQSw2QkFBQSxFQUErQixTQUFB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LFVBQUE7TUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSO01BQ0osMkJBQUEsR0FBOEIsT0FBQSxDQUFRLGlCQUFSO2FBRTlCLDJCQUFBLENBQTRCLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBSSxDQUFDLGdCQUFMLENBQUEsQ0FBVCxDQUE1QixFQUNFO1FBQUEsaUJBQUEsRUFBbUIsQ0FDakIsS0FEaUIsRUFFakIsNkJBRmlCLEVBR2pCLFVBSGlCLEVBR0wsUUFISyxFQUdLLFdBSEwsRUFHa0IsY0FIbEIsRUFHa0MsV0FIbEMsRUFJakIsa0JBSmlCLEVBSUcsU0FKSCxFQUljLE9BSmQsRUFLakIsZ0JBTGlCLEVBS0MsYUFMRCxFQU1qQixNQU5pQixFQU1ULGdCQU5TLEVBTVMsaUJBTlQsRUFNNEIsaUJBTjVCLEVBT2pCLHFCQVBpQixFQU9NLGVBUE4sRUFPdUIsZUFQdkIsRUFPd0MsY0FQeEMsRUFRakIsa0JBUmlCLEVBU2pCLG1CQVRpQixFQVVqQixpQkFWaUIsQ0FBbkI7UUFZQSxnQkFBQSxFQUFrQixJQVpsQjtPQURGO0lBSjJCOzs7Ozs7RUFtQi9CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBelFqQiIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyLCBEaXNwb3NhYmxlLCBCdWZmZXJlZFByb2Nlc3MsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbmdldEVkaXRvclN0YXRlID0gbnVsbFxuXG5jbGFzcyBEZXZlbG9wZXJcbiAgaW5pdDogKF9nZXRFZGl0b3JTdGF0ZSkgLT5cbiAgICBnZXRFZGl0b3JTdGF0ZSA9IF9nZXRFZGl0b3JTdGF0ZVxuICAgIEBkZXZFbnZpcm9ubWVudEJ5QnVmZmVyID0gbmV3IE1hcFxuICAgIEByZWxvYWRTdWJzY3JpcHRpb25CeUJ1ZmZlciA9IG5ldyBNYXBcblxuICAgIGNvbW1hbmRzID1cbiAgICAgICd0b2dnbGUtZGVidWcnOiA9PiBAdG9nZ2xlRGVidWcoKVxuICAgICAgJ29wZW4taW4tdmltJzogPT4gQG9wZW5JblZpbSgpXG4gICAgICAnZ2VuZXJhdGUtaW50cm9zcGVjdGlvbi1yZXBvcnQnOiA9PiBAZ2VuZXJhdGVJbnRyb3NwZWN0aW9uUmVwb3J0KClcbiAgICAgICdnZW5lcmF0ZS1jb21tYW5kLXN1bW1hcnktdGFibGUnOiA9PiBAZ2VuZXJhdGVDb21tYW5kU3VtbWFyeVRhYmxlKClcbiAgICAgICd3cml0ZS1jb21tYW5kLXRhYmxlLW9uLWRpc2snOiAtPiBCYXNlLndyaXRlQ29tbWFuZFRhYmxlT25EaXNrKClcbiAgICAgICdjbGVhci1kZWJ1Zy1vdXRwdXQnOiA9PiBAY2xlYXJEZWJ1Z091dHB1dCgpXG4gICAgICAncmVsb2FkJzogPT4gQHJlbG9hZCgpXG4gICAgICAncmVsb2FkLXdpdGgtZGVwZW5kZW5jaWVzJzogPT4gQHJlbG9hZCh0cnVlKVxuICAgICAgJ3JlcG9ydC10b3RhbC1tYXJrZXItY291bnQnOiA9PiBAZ2V0QWxsTWFya2VyQ291bnQoKVxuICAgICAgJ3JlcG9ydC10b3RhbC1hbmQtcGVyLWVkaXRvci1tYXJrZXItY291bnQnOiA9PiBAZ2V0QWxsTWFya2VyQ291bnQodHJ1ZSlcbiAgICAgICdyZXBvcnQtcmVxdWlyZS1jYWNoZSc6ID0+IEByZXBvcnRSZXF1aXJlQ2FjaGUoZXhjbHVkZU5vZE1vZHVsZXM6IHRydWUpXG4gICAgICAncmVwb3J0LXJlcXVpcmUtY2FjaGUtYWxsJzogPT4gQHJlcG9ydFJlcXVpcmVDYWNoZShleGNsdWRlTm9kTW9kdWxlczogZmFsc2UpXG5cbiAgICBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBmb3IgbmFtZSwgZm4gb2YgY29tbWFuZHNcbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkIEBhZGRDb21tYW5kKG5hbWUsIGZuKVxuICAgIHN1YnNjcmlwdGlvbnNcblxuICByZXBvcnRSZXF1aXJlQ2FjaGU6ICh7Zm9jdXMsIGV4Y2x1ZGVOb2RNb2R1bGVzfSkgLT5cbiAgICBwYXRoU2VwYXJhdG9yID0gcmVxdWlyZSgncGF0aCcpLnNlcFxuICAgIHBhY2tQYXRoID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKFwidmltLW1vZGUtcGx1c1wiKS5wYXRoXG4gICAgY2FjaGVkUGF0aHMgPSBPYmplY3Qua2V5cyhyZXF1aXJlLmNhY2hlKVxuICAgICAgLmZpbHRlciAocCkgLT4gcC5zdGFydHNXaXRoKHBhY2tQYXRoICsgcGF0aFNlcGFyYXRvcilcbiAgICAgIC5tYXAgKHApIC0+IHAucmVwbGFjZShwYWNrUGF0aCwgJycpXG5cbiAgICBmb3IgY2FjaGVkUGF0aCBpbiBjYWNoZWRQYXRoc1xuICAgICAgaWYgZXhjbHVkZU5vZE1vZHVsZXMgYW5kIGNhY2hlZFBhdGguc2VhcmNoKC9ub2RlX21vZHVsZXMvKSA+PSAwXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICBpZiBmb2N1cyBhbmQgY2FjaGVkUGF0aC5zZWFyY2goLy8vI3tmb2N1c30vLy8pID49IDBcbiAgICAgICAgY2FjaGVkUGF0aCA9ICcqJyArIGNhY2hlZFBhdGhcbiAgICAgIGNvbnNvbGUubG9nIGNhY2hlZFBhdGhcblxuICBnZXRBbGxNYXJrZXJDb3VudDogKHNob3dFZGl0b3JzUmVwb3J0PWZhbHNlKSAtPlxuICAgIHtpbnNwZWN0fSA9IHJlcXVpcmUgJ3V0aWwnXG4gICAgYmFzZW5hbWUgPSByZXF1aXJlKCdwYXRoJykuYmFzZW5hbWVcbiAgICB0b3RhbCA9XG4gICAgICBtYXJrOiAwXG4gICAgICBobHNlYXJjaDogMFxuICAgICAgbXV0YXRpb246IDBcbiAgICAgIG9jY3VycmVuY2U6IDBcbiAgICAgIHBlcnNpc3RlbnRTZWw6IDBcblxuICAgIGZvciBlZGl0b3IgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKVxuICAgICAgdmltU3RhdGUgPSBnZXRFZGl0b3JTdGF0ZShlZGl0b3IpXG4gICAgICBtYXJrID0gdmltU3RhdGUubWFyay5tYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpXG4gICAgICBobHNlYXJjaCA9IHZpbVN0YXRlLmhpZ2hsaWdodFNlYXJjaC5tYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpXG4gICAgICBtdXRhdGlvbiA9IHZpbVN0YXRlLm11dGF0aW9uTWFuYWdlci5tYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpXG4gICAgICBvY2N1cnJlbmNlID0gdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIubWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKVxuICAgICAgcGVyc2lzdGVudFNlbCA9IHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24ubWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKVxuICAgICAgaWYgc2hvd0VkaXRvcnNSZXBvcnRcbiAgICAgICAgY29uc29sZS5sb2cgYmFzZW5hbWUoZWRpdG9yLmdldFBhdGgoKSksIGluc3BlY3Qoe21hcmssIGhsc2VhcmNoLCBtdXRhdGlvbiwgb2NjdXJyZW5jZSwgcGVyc2lzdGVudFNlbH0pXG5cbiAgICAgIHRvdGFsLm1hcmsgKz0gbWFya1xuICAgICAgdG90YWwuaGxzZWFyY2ggKz0gaGxzZWFyY2hcbiAgICAgIHRvdGFsLm11dGF0aW9uICs9IG11dGF0aW9uXG4gICAgICB0b3RhbC5vY2N1cnJlbmNlICs9IG9jY3VycmVuY2VcbiAgICAgIHRvdGFsLnBlcnNpc3RlbnRTZWwgKz0gcGVyc2lzdGVudFNlbFxuXG4gICAgY29uc29sZS5sb2cgJ3RvdGFsJywgaW5zcGVjdCh0b3RhbClcblxuICByZWxvYWQ6IChyZWxvYWREZXBlbmRlbmNpZXMpIC0+XG4gICAgcGF0aFNlcGFyYXRvciA9IHJlcXVpcmUoJ3BhdGgnKS5zZXBcblxuICAgIHBhY2thZ2VzID0gWyd2aW0tbW9kZS1wbHVzJ11cbiAgICBpZiByZWxvYWREZXBlbmRlbmNpZXNcbiAgICAgIHBhY2thZ2VzLnB1c2goc2V0dGluZ3MuZ2V0KCdkZXZSZWxvYWRQYWNrYWdlcycpLi4uKVxuXG4gICAgaW52YWxpZGF0ZVJlcXVpcmVDYWNoZUZvclBhY2thZ2UgPSAocGFja1BhdGgpIC0+XG4gICAgICBPYmplY3Qua2V5cyhyZXF1aXJlLmNhY2hlKVxuICAgICAgICAuZmlsdGVyIChwKSAtPiBwLnN0YXJ0c1dpdGgocGFja1BhdGggKyBwYXRoU2VwYXJhdG9yKVxuICAgICAgICAuZm9yRWFjaCAocCkgLT4gZGVsZXRlIHJlcXVpcmUuY2FjaGVbcF1cblxuICAgIGRlYWN0aXZhdGUgPSAocGFja05hbWUpIC0+XG4gICAgICBjb25zb2xlLmxvZyBcIi0gZGVhY3RpdmF0aW5nICN7cGFja05hbWV9XCJcbiAgICAgIHBhY2tQYXRoID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKHBhY2tOYW1lKS5wYXRoXG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2tOYW1lKVxuICAgICAgYXRvbS5wYWNrYWdlcy51bmxvYWRQYWNrYWdlKHBhY2tOYW1lKVxuICAgICAgaW52YWxpZGF0ZVJlcXVpcmVDYWNoZUZvclBhY2thZ2UocGFja1BhdGgpXG5cbiAgICBhY3RpdmF0ZSA9IChwYWNrTmFtZSkgLT5cbiAgICAgIGNvbnNvbGUubG9nIFwiKyBhY3RpdmF0aW5nICN7cGFja05hbWV9XCJcbiAgICAgIGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UocGFja05hbWUpXG4gICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrTmFtZSlcblxuICAgIGxvYWRlZFBhY2thZ2VzID0gcGFja2FnZXMuZmlsdGVyIChwYWNrTmFtZSkgLT4gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlcyhwYWNrTmFtZSlcbiAgICBjb25zb2xlLmxvZyBcInJlbG9hZFwiLCBsb2FkZWRQYWNrYWdlc1xuICAgIGxvYWRlZFBhY2thZ2VzLm1hcChkZWFjdGl2YXRlKVxuICAgIGNvbnNvbGUudGltZSgnYWN0aXZhdGUnKVxuICAgIGxvYWRlZFBhY2thZ2VzLm1hcChhY3RpdmF0ZSlcbiAgICBjb25zb2xlLnRpbWVFbmQoJ2FjdGl2YXRlJylcblxuICBhZGRDb21tYW5kOiAobmFtZSwgZm4pIC0+XG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCBcInZpbS1tb2RlLXBsdXM6I3tuYW1lfVwiLCBmbilcblxuICBjbGVhckRlYnVnT3V0cHV0OiAobmFtZSwgZm4pIC0+XG4gICAge25vcm1hbGl6ZX0gPSByZXF1aXJlKCdmcy1wbHVzJylcbiAgICBmaWxlUGF0aCA9IG5vcm1hbGl6ZShzZXR0aW5ncy5nZXQoJ2RlYnVnT3V0cHV0RmlsZVBhdGgnKSlcbiAgICBvcHRpb25zID0ge3NlYXJjaEFsbFBhbmVzOiB0cnVlLCBhY3RpdmF0ZVBhbmU6IGZhbHNlfVxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgsIG9wdGlvbnMpLnRoZW4gKGVkaXRvcikgLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0KCcnKVxuICAgICAgZWRpdG9yLnNhdmUoKVxuXG4gIHRvZ2dsZURlYnVnOiAtPlxuICAgIHNldHRpbmdzLnNldCgnZGVidWcnLCBub3Qgc2V0dGluZ3MuZ2V0KCdkZWJ1ZycpKVxuICAgIGNvbnNvbGUubG9nIFwiI3tzZXR0aW5ncy5zY29wZX0gZGVidWc6XCIsIHNldHRpbmdzLmdldCgnZGVidWcnKVxuXG4gICMgQm9ycm93ZWQgZnJvbSB1bmRlcnNjb3JlLXBsdXNcbiAgbW9kaWZpZXJLZXlNYXAgPVxuICAgIFwiY3RybC1jbWQtXCI6ICdcXHUyMzAzXFx1MjMxOCdcbiAgICBcImNtZC1cIjogJ1xcdTIzMTgnXG4gICAgXCJjdHJsLVwiOiAnXFx1MjMwMydcbiAgICBhbHQ6ICdcXHUyMzI1J1xuICAgIG9wdGlvbjogJ1xcdTIzMjUnXG4gICAgZW50ZXI6ICdcXHUyM2NlJ1xuICAgIGxlZnQ6ICdcXHUyMTkwJ1xuICAgIHJpZ2h0OiAnXFx1MjE5MidcbiAgICB1cDogJ1xcdTIxOTEnXG4gICAgZG93bjogJ1xcdTIxOTMnXG4gICAgYmFja3NwYWNlOiAnQlMnXG4gICAgc3BhY2U6ICdTUEMnXG5cbiAgc2VsZWN0b3JNYXAgPVxuICAgIFwiYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzXCI6ICcnXG4gICAgXCIubm9ybWFsLW1vZGVcIjogJ24nXG4gICAgXCIuaW5zZXJ0LW1vZGVcIjogJ2knXG4gICAgXCIucmVwbGFjZVwiOiAnUidcbiAgICBcIi52aXN1YWwtbW9kZVwiOiAndidcbiAgICBcIi5jaGFyYWN0ZXJ3aXNlXCI6ICdDJ1xuICAgIFwiLmJsb2Nrd2lzZVwiOiAnQidcbiAgICBcIi5saW5ld2lzZVwiOiAnTCdcbiAgICBcIi5vcGVyYXRvci1wZW5kaW5nLW1vZGVcIjogJ28nXG4gICAgXCIud2l0aC1jb3VudFwiOiAnIydcbiAgICBcIi5oYXMtcGVyc2lzdGVudC1zZWxlY3Rpb25cIjogJyUnXG5cbiAgZ2V0Q29tbWFuZFNwZWNzOiAtPlxuICAgIF8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbiAgICBjb21wYWN0U2VsZWN0b3IgPSAoc2VsZWN0b3IpIC0+XG4gICAgICBwYXR0ZXJuID0gLy8vKCN7Xy5rZXlzKHNlbGVjdG9yTWFwKS5tYXAoXy5lc2NhcGVSZWdFeHApLmpvaW4oJ3wnKX0pLy8vZ1xuICAgICAgc2VsZWN0b3Iuc3BsaXQoLyxcXHMqL2cpLm1hcCAoc2NvcGUpIC0+XG4gICAgICAgIHNjb3BlXG4gICAgICAgICAgLnJlcGxhY2UoLzpub3RcXCgoLiopXFwpLywgJyEkMScpXG4gICAgICAgICAgLnJlcGxhY2UocGF0dGVybiwgKHMpIC0+IHNlbGVjdG9yTWFwW3NdKVxuICAgICAgLmpvaW4oXCIsXCIpXG5cbiAgICBjb21wYWN0S2V5c3Ryb2tlcyA9IChrZXlzdHJva2VzKSAtPlxuICAgICAgc3BlY2lhbENoYXJzID0gJ1xcXFxgKl97fVtdKCkjKy0uISdcbiAgICAgIHNwZWNpYWxDaGFyc1JlZ2V4cCA9IC8vLyN7c3BlY2lhbENoYXJzLnNwbGl0KCcnKS5tYXAoXy5lc2NhcGVSZWdFeHApLmpvaW4oJ3wnKX0vLy9nXG4gICAgICBtb2RpZmllcktleVJlZ2V4cCA9IC8vLygje18ua2V5cyhtb2RpZmllcktleU1hcCkubWFwKF8uZXNjYXBlUmVnRXhwKS5qb2luKCd8Jyl9KS8vL1xuICAgICAga2V5c3Ryb2tlc1xuICAgICAgICAjIC5yZXBsYWNlKC8oYHxfKS9nLCAnXFxcXCQxJylcbiAgICAgICAgLnJlcGxhY2UobW9kaWZpZXJLZXlSZWdleHAsIChzKSAtPiBtb2RpZmllcktleU1hcFtzXSlcbiAgICAgICAgLnJlcGxhY2UoLy8vKCN7c3BlY2lhbENoYXJzUmVnZXhwfSkvLy9nLCBcIlxcXFwkMVwiKVxuICAgICAgICAucmVwbGFjZSgvXFx8L2csICcmIzEyNDsnKVxuICAgICAgICAucmVwbGFjZSgvXFxzKy8sICcnKVxuXG4gICAge2dldEtleUJpbmRpbmdGb3JDb21tYW5kLCBnZXRBbmNlc3RvcnN9ID0gQHZpbXN0YXRlLnV0aWxzXG4gICAgY29tbWFuZHMgPSAoXG4gICAgICBmb3IgbmFtZSwga2xhc3Mgb2YgQmFzZS5nZXRDbGFzc1JlZ2lzdHJ5KCkgd2hlbiBrbGFzcy5pc0NvbW1hbmQoKVxuICAgICAgICBraW5kID0gZ2V0QW5jZXN0b3JzKGtsYXNzKS5tYXAoKGspIC0+IGsubmFtZSlbLTIuLi0yXVswXVxuICAgICAgICBjb21tYW5kTmFtZSA9IGtsYXNzLmdldENvbW1hbmROYW1lKClcbiAgICAgICAgZGVzY3JpcHRpb24gPSBrbGFzcy5nZXREZXNjdGlwdGlvbigpPy5yZXBsYWNlKC9cXG4vZywgJzxici8+JylcblxuICAgICAgICBrZXltYXAgPSBudWxsXG4gICAgICAgIGlmIGtleW1hcHMgPSBnZXRLZXlCaW5kaW5nRm9yQ29tbWFuZChjb21tYW5kTmFtZSwgcGFja2FnZU5hbWU6IFwidmltLW1vZGUtcGx1c1wiKVxuICAgICAgICAgIGtleW1hcCA9IGtleW1hcHMubWFwICh7a2V5c3Ryb2tlcywgc2VsZWN0b3J9KSAtPlxuICAgICAgICAgICAgXCJgI3tjb21wYWN0U2VsZWN0b3Ioc2VsZWN0b3IpfWAgPGNvZGU+I3tjb21wYWN0S2V5c3Ryb2tlcyhrZXlzdHJva2VzKX08L2NvZGU+XCJcbiAgICAgICAgICAuam9pbihcIjxici8+XCIpXG5cbiAgICAgICAge25hbWUsIGNvbW1hbmROYW1lLCBraW5kLCBkZXNjcmlwdGlvbiwga2V5bWFwfVxuICAgIClcbiAgICBjb21tYW5kc1xuXG4gIGdlbmVyYXRlQ29tbWFuZFRhYmxlRm9yTW90aW9uOiAtPlxuICAgIHJlcXVpcmUoJy4vbW90aW9uJylcblxuXG4gIGtpbmRzID0gW1wiT3BlcmF0b3JcIiwgXCJNb3Rpb25cIiwgXCJUZXh0T2JqZWN0XCIsIFwiSW5zZXJ0TW9kZVwiLCBcIk1pc2NDb21tYW5kXCIsIFwiU2Nyb2xsXCJdXG4gIGdlbmVyYXRlU3VtbWFyeVRhYmxlRm9yQ29tbWFuZFNwZWNzOiAoc3BlY3MsIHtoZWFkZXJ9PXt9KSAtPlxuICAgIF8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbiAgICBncm91cGVkID0gXy5ncm91cEJ5KHNwZWNzLCAna2luZCcpXG4gICAgc3RyID0gXCJcIlxuICAgIGZvciBraW5kIGluIGtpbmRzIHdoZW4gc3BlY3MgPSBncm91cGVkW2tpbmRdXG5cbiAgICAgIHJlcG9ydCA9IFtcbiAgICAgICAgXCIjIyAje2tpbmR9XCJcbiAgICAgICAgXCJcIlxuICAgICAgICBcInwgS2V5bWFwIHwgQ29tbWFuZCB8IERlc2NyaXB0aW9uIHxcIlxuICAgICAgICBcInw6LS0tLS0tLXw6LS0tLS0tLS18Oi0tLS0tLS0tLS0tLXxcIlxuICAgICAgXVxuICAgICAgZm9yIHtrZXltYXAsIGNvbW1hbmROYW1lLCBkZXNjcmlwdGlvbn0gaW4gc3BlY3NcbiAgICAgICAgY29tbWFuZE5hbWUgPSBjb21tYW5kTmFtZS5yZXBsYWNlKC92aW0tbW9kZS1wbHVzOi8sICcnKVxuICAgICAgICBkZXNjcmlwdGlvbiA/PSBcIlwiXG4gICAgICAgIGtleW1hcCA/PSBcIlwiXG4gICAgICAgIHJlcG9ydC5wdXNoIFwifCAje2tleW1hcH0gfCBgI3tjb21tYW5kTmFtZX1gIHwgI3tkZXNjcmlwdGlvbn0gfFwiXG4gICAgICBzdHIgKz0gcmVwb3J0LmpvaW4oXCJcXG5cIikgKyBcIlxcblxcblwiXG5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCkudGhlbiAoZWRpdG9yKSAtPlxuICAgICAgZWRpdG9yLmluc2VydFRleHQoaGVhZGVyICsgXCJcXG5cIikgaWYgaGVhZGVyP1xuICAgICAgZWRpdG9yLmluc2VydFRleHQoc3RyKVxuXG4gIGdlbmVyYXRlQ29tbWFuZFN1bW1hcnlUYWJsZTogLT5cbiAgICBoZWFkZXIgPSBcIlwiXCJcbiAgICAjIyBLZXltYXAgc2VsZWN0b3IgYWJicmV2aWF0aW9uc1xuXG4gICAgSW4gdGhpcyBkb2N1bWVudCwgZm9sbG93aW5nIGFiYnJldmlhdGlvbnMgYXJlIHVzZWQgZm9yIHNob3J0bmVzcy5cblxuICAgIHwgQWJicmV2IHwgU2VsZWN0b3IgICAgICAgICAgICAgICAgICAgICB8IERlc2NyaXB0aW9uICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICB8Oi0tLS0tLS18Oi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfDotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18XG4gICAgfCBgIWlgICAgfCBgOm5vdCguaW5zZXJ0LW1vZGUpYCAgICAgICAgIHwgZXhjZXB0IGluc2VydC1tb2RlICAgICAgICAgICAgICAgICAgfFxuICAgIHwgYGlgICAgIHwgYC5pbnNlcnQtbW9kZWAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICB8IGBvYCAgICB8IGAub3BlcmF0b3ItcGVuZGluZy1tb2RlYCAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgfCBgbmAgICAgfCBgLm5vcm1hbC1tb2RlYCAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIHwgYHZgICAgIHwgYC52aXN1YWwtbW9kZWAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICB8IGB2QmAgICB8IGAudmlzdWFsLW1vZGUuYmxvY2t3aXNlYCAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgfCBgdkxgICAgfCBgLnZpc3VhbC1tb2RlLmxpbmV3aXNlYCAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIHwgYHZDYCAgIHwgYC52aXN1YWwtbW9kZS5jaGFyYWN0ZXJ3aXNlYCB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICB8IGBpUmAgICB8IGAuaW5zZXJ0LW1vZGUucmVwbGFjZWAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgfCBgI2AgICAgfCBgLndpdGgtY291bnRgICAgICAgICAgICAgICAgIHwgd2hlbiBjb3VudCBpcyBzcGVjaWZpZWQgICAgICAgICAgICAgfFxuICAgIHwgYCVgICAgIHwgYC5oYXMtcGVyc2lzdGVudC1zZWxlY3Rpb25gIHwgd2hlbiBwZXJzaXN0ZW50LXNlbGVjdGlvbiBpcyBleGlzdHMgfFxuXG4gICAgXCJcIlwiXG4gICAgQGdlbmVyYXRlU3VtbWFyeVRhYmxlRm9yQ29tbWFuZFNwZWNzKEBnZXRDb21tYW5kU3BlY3MoKSwge2hlYWRlcn0pXG5cbiAgb3BlbkluVmltOiAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHtyb3csIGNvbHVtbn0gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICMgZS5nLiAvQXBwbGljYXRpb25zL01hY1ZpbS5hcHAvQ29udGVudHMvTWFjT1MvVmltIC1nIC9ldGMvaG9zdHMgXCIrY2FsbCBjdXJzb3IoNCwgMylcIlxuICAgIG5ldyBCdWZmZXJlZFByb2Nlc3NcbiAgICAgIGNvbW1hbmQ6IFwiL0FwcGxpY2F0aW9ucy9NYWNWaW0uYXBwL0NvbnRlbnRzL01hY09TL1ZpbVwiXG4gICAgICBhcmdzOiBbJy1nJywgZWRpdG9yLmdldFBhdGgoKSwgXCIrY2FsbCBjdXJzb3IoI3tyb3crMX0sICN7Y29sdW1uKzF9KVwiXVxuXG4gIGdlbmVyYXRlSW50cm9zcGVjdGlvblJlcG9ydDogLT5cbiAgICBfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuICAgIGdlbmVyYXRlSW50cm9zcGVjdGlvblJlcG9ydCA9IHJlcXVpcmUgJy4vaW50cm9zcGVjdGlvbidcblxuICAgIGdlbmVyYXRlSW50cm9zcGVjdGlvblJlcG9ydCBfLnZhbHVlcyhCYXNlLmdldENsYXNzUmVnaXN0cnkoKSksXG4gICAgICBleGNsdWRlUHJvcGVydGllczogW1xuICAgICAgICAncnVuJ1xuICAgICAgICAnZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4J1xuICAgICAgICAnZ2V0Q2xhc3MnLCAnZXh0ZW5kJywgJ2dldFBhcmVudCcsICdnZXRBbmNlc3RvcnMnLCAnaXNDb21tYW5kJ1xuICAgICAgICAnZ2V0Q2xhc3NSZWdpc3RyeScsICdjb21tYW5kJywgJ3Jlc2V0J1xuICAgICAgICAnZ2V0RGVzY3RpcHRpb24nLCAnZGVzY3JpcHRpb24nXG4gICAgICAgICdpbml0JywgJ2dldENvbW1hbmROYW1lJywgJ2dldENvbW1hbmRTY29wZScsICdyZWdpc3RlckNvbW1hbmQnLFxuICAgICAgICAnZGVsZWdhdGVzUHJvcGVydGllcycsICdzdWJzY3JpcHRpb25zJywgJ2NvbW1hbmRQcmVmaXgnLCAnY29tbWFuZFNjb3BlJ1xuICAgICAgICAnZGVsZWdhdGVzTWV0aG9kcycsXG4gICAgICAgICdkZWxlZ2F0ZXNQcm9wZXJ0eScsXG4gICAgICAgICdkZWxlZ2F0ZXNNZXRob2QnLFxuICAgICAgXVxuICAgICAgcmVjdXJzaXZlSW5zcGVjdDogQmFzZVxuXG5tb2R1bGUuZXhwb3J0cyA9IERldmVsb3BlclxuIl19
