(function() {
  var CompositeDisposable, Emitter, Logger, Metrics, os, path, ref, ref1,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  os = require('os');

  path = require('path');

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  ref1 = [], Metrics = ref1[0], Logger = ref1[1];

  window.DEBUG = false;

  module.exports = {
    config: {
      useKite: {
        type: 'boolean',
        "default": true,
        order: 0,
        title: 'Use Kite-powered Completions (macOS only)',
        description: 'Kite is a cloud powered autocomplete engine. It provides\nsignificantly more autocomplete suggestions than the local Jedi engine.'
      },
      showDescriptions: {
        type: 'boolean',
        "default": true,
        order: 1,
        title: 'Show Descriptions',
        description: 'Show doc strings from functions, classes, etc.'
      },
      useSnippets: {
        type: 'string',
        "default": 'none',
        order: 2,
        "enum": ['none', 'all', 'required'],
        title: 'Autocomplete Function Parameters',
        description: 'Automatically complete function arguments after typing\nleft parenthesis character. Use completion key to jump between\narguments. See `autocomplete-python:complete-arguments` command if you\nwant to trigger argument completions manually. See README if it does not\nwork for you.'
      },
      pythonPaths: {
        type: 'string',
        "default": '',
        order: 3,
        title: 'Python Executable Paths',
        description: 'Optional semicolon separated list of paths to python\nexecutables (including executable names), where the first one will take\nhigher priority over the last one. By default autocomplete-python will\nautomatically look for virtual environments inside of your project and\ntry to use them as well as try to find global python executable. If you\nuse this config, automatic lookup will have lowest priority.\nUse `$PROJECT` or `$PROJECT_NAME` substitution for project-specific\npaths to point on executables in virtual environments.\nFor example:\n`/Users/name/.virtualenvs/$PROJECT_NAME/bin/python;$PROJECT/venv/bin/python3;/usr/bin/python`.\nSuch config will fall back on `/usr/bin/python` for projects not presented\nwith same name in `.virtualenvs` and without `venv` folder inside of one\nof project folders.\nIf you are using python3 executable while coding for python2 you will get\npython2 completions for some built-ins.'
      },
      extraPaths: {
        type: 'string',
        "default": '',
        order: 4,
        title: 'Extra Paths For Packages',
        description: 'Semicolon separated list of modules to additionally\ninclude for autocomplete. You can use same substitutions as in\n`Python Executable Paths`.\nNote that it still should be valid python package.\nFor example:\n`$PROJECT/env/lib/python2.7/site-packages`\nor\n`/User/name/.virtualenvs/$PROJECT_NAME/lib/python2.7/site-packages`.\nYou don\'t need to specify extra paths for libraries installed with python\nexecutable you use.'
      },
      caseInsensitiveCompletion: {
        type: 'boolean',
        "default": true,
        order: 5,
        title: 'Case Insensitive Completion',
        description: 'The completion is by default case insensitive.'
      },
      triggerCompletionRegex: {
        type: 'string',
        "default": '([\.\ (]|[a-zA-Z_][a-zA-Z0-9_]*)',
        order: 6,
        title: 'Regex To Trigger Autocompletions',
        description: 'By default completions triggered after words, dots, spaces\nand left parenthesis. You will need to restart your editor after changing\nthis.'
      },
      fuzzyMatcher: {
        type: 'boolean',
        "default": true,
        order: 7,
        title: 'Use Fuzzy Matcher For Completions.',
        description: 'Typing `stdr` will match `stderr`.\nFirst character should always match. Uses additional caching thus\ncompletions should be faster. Note that this setting does not affect\nbuilt-in autocomplete-plus provider.'
      },
      outputProviderErrors: {
        type: 'boolean',
        "default": false,
        order: 8,
        title: 'Output Provider Errors',
        description: 'Select if you would like to see the provider errors when\nthey happen. By default they are hidden. Note that critical errors are\nalways shown.'
      },
      outputDebug: {
        type: 'boolean',
        "default": false,
        order: 9,
        title: 'Output Debug Logs',
        description: 'Select if you would like to see debug information in\ndeveloper tools logs. May slow down your editor.'
      },
      showTooltips: {
        type: 'boolean',
        "default": false,
        order: 10,
        title: 'Show Tooltips with information about the object under the cursor',
        description: 'EXPERIMENTAL FEATURE WHICH IS NOT FINISHED YET.\nFeedback and ideas are welcome on github.'
      },
      suggestionPriority: {
        type: 'integer',
        "default": 3,
        minimum: 0,
        maximum: 99,
        order: 11,
        title: 'Suggestion Priority',
        description: 'You can use this to set the priority for autocomplete-python\nsuggestions. For example, you can use lower value to give higher priority\nfor snippets completions which has priority of 2.'
      },
      enableTouchBar: {
        type: 'boolean',
        "default": false,
        order: 12,
        title: 'Enable Touch Bar support',
        description: 'Proof of concept for now, requires tooltips to be enabled and Atom >=1.19.0.'
      }
    },
    installation: null,
    _handleGrammarChangeEvent: function(grammar) {
      var ref2;
      if ((ref2 = grammar.packageName) === 'language-python' || ref2 === 'MagicPython' || ref2 === 'atom-django') {
        this.provider.load();
        this.emitter.emit('did-load-provider');
        return this.disposables.dispose();
      }
    },
    _loadKite: function() {
      var AccountManager, AtomHelper, DecisionMaker, Installation, Installer, StateController, checkKiteInstallation, dm, editorCfg, event, firstInstall, longRunning, pluginCfg, ref2;
      firstInstall = localStorage.getItem('autocomplete-python.installed') === null;
      localStorage.setItem('autocomplete-python.installed', true);
      longRunning = require('process').uptime() > 10;
      if (firstInstall && longRunning) {
        event = "installed";
      } else if (firstInstall) {
        event = "upgraded";
      } else {
        event = "restarted";
      }
      ref2 = require('kite-installer'), AccountManager = ref2.AccountManager, AtomHelper = ref2.AtomHelper, DecisionMaker = ref2.DecisionMaker, Installation = ref2.Installation, Installer = ref2.Installer, Metrics = ref2.Metrics, Logger = ref2.Logger, StateController = ref2.StateController;
      if (atom.config.get('kite.loggingLevel')) {
        Logger.LEVEL = Logger.LEVELS[atom.config.get('kite.loggingLevel').toUpperCase()];
      }
      AccountManager.initClient('alpha.kite.com', -1, true);
      atom.views.addViewProvider(Installation, function(m) {
        return m.element;
      });
      editorCfg = {
        UUID: localStorage.getItem('metrics.userId'),
        name: 'atom'
      };
      pluginCfg = {
        name: 'autocomplete-python'
      };
      dm = new DecisionMaker(editorCfg, pluginCfg);
      Metrics.Tracker.name = "atom acp";
      Metrics.enabled = atom.config.get('core.telemetryConsent') === 'limited';
      atom.packages.onDidActivatePackage((function(_this) {
        return function(pkg) {
          if (pkg.name === 'kite') {
            _this.patchKiteCompletions(pkg);
            return Metrics.Tracker.name = "atom kite+acp";
          }
        };
      })(this));
      checkKiteInstallation = (function(_this) {
        return function() {
          var canInstall, throttle;
          if (!atom.config.get('autocomplete-python.useKite')) {
            return;
          }
          canInstall = StateController.canInstallKite();
          throttle = dm.shouldOfferKite(event);
          if (atom.config.get('autocomplete-python.useKite')) {
            return Promise.all([throttle, canInstall]).then(function(values) {
              var installer, pane, projectPath, root, title, variant;
              atom.config.set('autocomplete-python.useKite', true);
              variant = values[0];
              Metrics.Tracker.props = variant;
              Metrics.Tracker.props.lastEvent = event;
              title = "Choose a autocomplete-python engine";
              _this.installation = new Installation(variant, title);
              _this.installation.accountCreated(function() {
                _this.track("account created");
                return atom.config.set('autocomplete-python.useKite', true);
              });
              _this.installation.flowSkipped(function() {
                _this.track("flow aborted");
                return atom.config.set('autocomplete-python.useKite', false);
              });
              projectPath = atom.project.getPaths()[0];
              root = (projectPath != null) && path.relative(os.homedir(), projectPath).indexOf('..') === 0 ? path.parse(projectPath).root : os.homedir();
              installer = new Installer([root]);
              installer.init(_this.installation.flow, function() {
                Logger.verbose('in onFinish');
                return atom.packages.activatePackage('kite');
              });
              pane = atom.workspace.getActivePane();
              _this.installation.flow.onSkipInstall(function() {
                atom.config.set('autocomplete-python.useKite', false);
                _this.track("skipped kite");
                return pane.destroyActiveItem();
              });
              pane.addItem(_this.installation, {
                index: 0
              });
              return pane.activateItemAtIndex(0);
            }, function(err) {
              if (err.type === 'denied') {
                return atom.config.set('autocomplete-python.useKite', false);
              }
            });
          }
        };
      })(this);
      checkKiteInstallation();
      return atom.config.onDidChange('autocomplete-python.useKite', function(arg) {
        var newValue, oldValue;
        newValue = arg.newValue, oldValue = arg.oldValue;
        if (newValue) {
          checkKiteInstallation();
          return AtomHelper.enablePackage();
        } else {
          return AtomHelper.disablePackage();
        }
      });
    },
    load: function() {
      var disposable;
      this.disposables = new CompositeDisposable;
      disposable = atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          _this._handleGrammarChangeEvent(editor.getGrammar());
          disposable = editor.onDidChangeGrammar(function(grammar) {
            return _this._handleGrammarChangeEvent(grammar);
          });
          return _this.disposables.add(disposable);
        };
      })(this));
      this.disposables.add(disposable);
      return this._loadKite();
    },
    activate: function(state) {
      var disposable;
      this.emitter = new Emitter;
      this.provider = require('./provider');
      if (typeof atom.packages.hasActivatedInitialPackages === 'function' && atom.packages.hasActivatedInitialPackages()) {
        return this.load();
      } else {
        return disposable = atom.packages.onDidActivateInitialPackages((function(_this) {
          return function() {
            _this.load();
            return disposable.dispose();
          };
        })(this));
      }
    },
    deactivate: function() {
      if (this.provider) {
        this.provider.dispose();
      }
      if (this.installation) {
        return this.installation.destroy();
      }
    },
    getProvider: function() {
      return this.provider;
    },
    getHyperclickProvider: function() {
      return require('./hyperclick-provider');
    },
    consumeSnippets: function(snippetsManager) {
      var disposable;
      return disposable = this.emitter.on('did-load-provider', (function(_this) {
        return function() {
          _this.provider.setSnippetsManager(snippetsManager);
          return disposable.dispose();
        };
      })(this));
    },
    trackCompletions: function() {
      var promises;
      promises = [atom.packages.activatePackage('autocomplete-plus')];
      if (atom.packages.getLoadedPackage('kite') != null) {
        this.disposables.add(atom.config.observe('kite.loggingLevel', function(level) {
          return Logger.LEVEL = Logger.LEVELS[(level != null ? level : 'info').toUpperCase()];
        }));
        promises.push(atom.packages.activatePackage('kite'));
        Metrics.Tracker.name = "atom kite+acp";
      }
      return Promise.all(promises).then((function(_this) {
        return function(arg) {
          var autocompleteManager, autocompletePlus, kite, safeConfirm, safeDisplaySuggestions;
          autocompletePlus = arg[0], kite = arg[1];
          if (kite != null) {
            _this.patchKiteCompletions(kite);
          }
          autocompleteManager = autocompletePlus.mainModule.getAutocompleteManager();
          if (!((autocompleteManager != null) && (autocompleteManager.confirm != null) && (autocompleteManager.displaySuggestions != null))) {
            return;
          }
          safeConfirm = autocompleteManager.confirm;
          safeDisplaySuggestions = autocompleteManager.displaySuggestions;
          autocompleteManager.displaySuggestions = function(suggestions, options) {
            _this.trackSuggestions(suggestions, autocompleteManager.editor);
            return safeDisplaySuggestions.call(autocompleteManager, suggestions, options);
          };
          return autocompleteManager.confirm = function(suggestion) {
            _this.trackUsedSuggestion(suggestion, autocompleteManager.editor);
            return safeConfirm.call(autocompleteManager, suggestion);
          };
        };
      })(this));
    },
    trackSuggestions: function(suggestions, editor) {
      var hasJediSuggestions, hasKiteSuggestions;
      if (/\.py$/.test(editor.getPath()) && (this.kiteProvider != null)) {
        hasKiteSuggestions = suggestions.some((function(_this) {
          return function(s) {
            return s.provider === _this.kiteProvider;
          };
        })(this));
        hasJediSuggestions = suggestions.some((function(_this) {
          return function(s) {
            return s.provider === _this.provider;
          };
        })(this));
        if (hasKiteSuggestions && hasJediSuggestions) {
          return this.track('Atom shows both Kite and Jedi completions');
        } else if (hasKiteSuggestions) {
          return this.track('Atom shows Kite but not Jedi completions');
        } else if (hasJediSuggestions) {
          return this.track('Atom shows Jedi but not Kite completions');
        } else {
          return this.track('Atom shows neither Kite nor Jedi completions');
        }
      }
    },
    patchKiteCompletions: function(kite) {
      var getSuggestions;
      if (this.kitePackage != null) {
        return;
      }
      this.kitePackage = kite.mainModule;
      this.kiteProvider = this.kitePackage.completions();
      getSuggestions = this.kiteProvider.getSuggestions;
      return this.kiteProvider.getSuggestions = (function(_this) {
        return function() {
          var args, ref2, ref3;
          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return getSuggestions != null ? (ref2 = getSuggestions.apply(_this.kiteProvider, args)) != null ? (ref3 = ref2.then(function(suggestions) {
            _this.lastKiteSuggestions = suggestions;
            _this.kiteSuggested = suggestions != null;
            return suggestions;
          })) != null ? ref3["catch"](function(err) {
            _this.lastKiteSuggestions = [];
            _this.kiteSuggested = false;
            throw err;
          }) : void 0 : void 0 : void 0;
        };
      })(this);
    },
    trackUsedSuggestion: function(suggestion, editor) {
      var altSuggestion;
      if (/\.py$/.test(editor.getPath())) {
        if (this.kiteProvider != null) {
          if (this.lastKiteSuggestions != null) {
            if (indexOf.call(this.lastKiteSuggestions, suggestion) >= 0) {
              altSuggestion = this.hasSameSuggestion(suggestion, this.provider.lastSuggestions || []);
              if (altSuggestion != null) {
                return this.track('used completion returned by Kite but also returned by Jedi', {
                  kiteHasDocumentation: this.hasDocumentation(suggestion),
                  jediHasDocumentation: this.hasDocumentation(altSuggestion)
                });
              } else {
                return this.track('used completion returned by Kite but not Jedi', {
                  kiteHasDocumentation: this.hasDocumentation(suggestion)
                });
              }
            } else if (this.provider.lastSuggestions && indexOf.call(this.provider.lastSuggestions, suggestion) >= 0) {
              altSuggestion = this.hasSameSuggestion(suggestion, this.lastKiteSuggestions);
              if (altSuggestion != null) {
                return this.track('used completion returned by Jedi but also returned by Kite', {
                  kiteHasDocumentation: this.hasDocumentation(altSuggestion),
                  jediHasDocumentation: this.hasDocumentation(suggestion)
                });
              } else {
                if (this.kitePackage.isEditorWhitelisted != null) {
                  if (this.kitePackage.isEditorWhitelisted(editor)) {
                    return this.track('used completion returned by Jedi but not Kite (whitelisted filepath)', {
                      jediHasDocumentation: this.hasDocumentation(suggestion)
                    });
                  } else {
                    return this.track('used completion returned by Jedi but not Kite (non-whitelisted filepath)', {
                      jediHasDocumentation: this.hasDocumentation(suggestion)
                    });
                  }
                } else {
                  return this.track('used completion returned by Jedi but not Kite (whitelisted filepath)', {
                    jediHasDocumentation: this.hasDocumentation(suggestion)
                  });
                }
              }
            } else {
              return this.track('used completion from neither Kite nor Jedi');
            }
          } else {
            if (this.kitePackage.isEditorWhitelisted != null) {
              if (this.kitePackage.isEditorWhitelisted(editor)) {
                return this.track('used completion returned by Jedi but not Kite (whitelisted filepath)', {
                  jediHasDocumentation: this.hasDocumentation(suggestion)
                });
              } else {
                return this.track('used completion returned by Jedi but not Kite (non-whitelisted filepath)', {
                  jediHasDocumentation: this.hasDocumentation(suggestion)
                });
              }
            } else {
              return this.track('used completion returned by Jedi but not Kite (not-whitelisted filepath)', {
                jediHasDocumentation: this.hasDocumentation(suggestion)
              });
            }
          }
        } else {
          if (this.provider.lastSuggestions && indexOf.call(this.provider.lastSuggestions, suggestion) >= 0) {
            return this.track('used completion returned by Jedi', {
              jediHasDocumentation: this.hasDocumentation(suggestion)
            });
          } else {
            return this.track('used completion not returned by Jedi');
          }
        }
      }
    },
    hasSameSuggestion: function(suggestion, suggestions) {
      return suggestions.filter(function(s) {
        return s.text === suggestion.text;
      })[0];
    },
    hasDocumentation: function(suggestion) {
      return ((suggestion.description != null) && suggestion.description !== '') || ((suggestion.descriptionMarkdown != null) && suggestion.descriptionMarkdown !== '');
    },
    track: function(msg, data) {
      var e;
      try {
        return Metrics.Tracker.trackEvent(msg, data);
      } catch (error) {
        e = error;
        if (e instanceof TypeError) {
          return console.error(e);
        } else {
          throw e;
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxrRUFBQTtJQUFBOzs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLE1BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMsNkNBQUQsRUFBc0I7O0VBRXRCLE9BQW9CLEVBQXBCLEVBQUMsaUJBQUQsRUFBVTs7RUFFVixNQUFNLENBQUMsS0FBUCxHQUFlOztFQUNmLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxPQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLEtBQUEsRUFBTyxDQUZQO1FBR0EsS0FBQSxFQUFPLDJDQUhQO1FBSUEsV0FBQSxFQUFhLG1JQUpiO09BREY7TUFPQSxnQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxLQUFBLEVBQU8sQ0FGUDtRQUdBLEtBQUEsRUFBTyxtQkFIUDtRQUlBLFdBQUEsRUFBYSxnREFKYjtPQVJGO01BYUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BRFQ7UUFFQSxLQUFBLEVBQU8sQ0FGUDtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixVQUFoQixDQUhOO1FBSUEsS0FBQSxFQUFPLGtDQUpQO1FBS0EsV0FBQSxFQUFhLHlSQUxiO09BZEY7TUF3QkEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFT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QUFDLFdBQVgsS0FBNEIsRUFBekQsQ0FBQSxJQUNBLENBQUMsd0NBQUEsSUFBb0MsVUFBVSxDQUFDLG1CQUFYLEtBQW9DLEVBQXpFO0lBRmdCLENBallsQjtJQXFZQSxLQUFBLEVBQU8sU0FBQyxHQUFELEVBQU0sSUFBTjtBQUNMLFVBQUE7QUFBQTtlQUNFLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBaEIsQ0FBMkIsR0FBM0IsRUFBZ0MsSUFBaEMsRUFERjtPQUFBLGFBQUE7UUFFTTtRQUVKLElBQUcsQ0FBQSxZQUFhLFNBQWhCO2lCQUNFLE9BQU8sQ0FBQyxLQUFSLENBQWMsQ0FBZCxFQURGO1NBQUEsTUFBQTtBQUdFLGdCQUFNLEVBSFI7U0FKRjs7SUFESyxDQXJZUDs7QUFSRiIsInNvdXJjZXNDb250ZW50IjpbIm9zID0gcmVxdWlyZSAnb3MnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbntDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5cbltNZXRyaWNzLCBMb2dnZXJdID0gW11cblxud2luZG93LkRFQlVHID0gZmFsc2Vcbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOlxuICAgIHVzZUtpdGU6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiAwXG4gICAgICB0aXRsZTogJ1VzZSBLaXRlLXBvd2VyZWQgQ29tcGxldGlvbnMgKG1hY09TIG9ubHkpJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ0tpdGUgaXMgYSBjbG91ZCBwb3dlcmVkIGF1dG9jb21wbGV0ZSBlbmdpbmUuIEl0IHByb3ZpZGVzXG4gICAgICBzaWduaWZpY2FudGx5IG1vcmUgYXV0b2NvbXBsZXRlIHN1Z2dlc3Rpb25zIHRoYW4gdGhlIGxvY2FsIEplZGkgZW5naW5lLicnJ1xuICAgIHNob3dEZXNjcmlwdGlvbnM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiAxXG4gICAgICB0aXRsZTogJ1Nob3cgRGVzY3JpcHRpb25zJ1xuICAgICAgZGVzY3JpcHRpb246ICdTaG93IGRvYyBzdHJpbmdzIGZyb20gZnVuY3Rpb25zLCBjbGFzc2VzLCBldGMuJ1xuICAgIHVzZVNuaXBwZXRzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdub25lJ1xuICAgICAgb3JkZXI6IDJcbiAgICAgIGVudW06IFsnbm9uZScsICdhbGwnLCAncmVxdWlyZWQnXVxuICAgICAgdGl0bGU6ICdBdXRvY29tcGxldGUgRnVuY3Rpb24gUGFyYW1ldGVycydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydBdXRvbWF0aWNhbGx5IGNvbXBsZXRlIGZ1bmN0aW9uIGFyZ3VtZW50cyBhZnRlciB0eXBpbmdcbiAgICAgIGxlZnQgcGFyZW50aGVzaXMgY2hhcmFjdGVyLiBVc2UgY29tcGxldGlvbiBrZXkgdG8ganVtcCBiZXR3ZWVuXG4gICAgICBhcmd1bWVudHMuIFNlZSBgYXV0b2NvbXBsZXRlLXB5dGhvbjpjb21wbGV0ZS1hcmd1bWVudHNgIGNvbW1hbmQgaWYgeW91XG4gICAgICB3YW50IHRvIHRyaWdnZXIgYXJndW1lbnQgY29tcGxldGlvbnMgbWFudWFsbHkuIFNlZSBSRUFETUUgaWYgaXQgZG9lcyBub3RcbiAgICAgIHdvcmsgZm9yIHlvdS4nJydcbiAgICBweXRob25QYXRoczpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgICAgb3JkZXI6IDNcbiAgICAgIHRpdGxlOiAnUHl0aG9uIEV4ZWN1dGFibGUgUGF0aHMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnT3B0aW9uYWwgc2VtaWNvbG9uIHNlcGFyYXRlZCBsaXN0IG9mIHBhdGhzIHRvIHB5dGhvblxuICAgICAgZXhlY3V0YWJsZXMgKGluY2x1ZGluZyBleGVjdXRhYmxlIG5hbWVzKSwgd2hlcmUgdGhlIGZpcnN0IG9uZSB3aWxsIHRha2VcbiAgICAgIGhpZ2hlciBwcmlvcml0eSBvdmVyIHRoZSBsYXN0IG9uZS4gQnkgZGVmYXVsdCBhdXRvY29tcGxldGUtcHl0aG9uIHdpbGxcbiAgICAgIGF1dG9tYXRpY2FsbHkgbG9vayBmb3IgdmlydHVhbCBlbnZpcm9ubWVudHMgaW5zaWRlIG9mIHlvdXIgcHJvamVjdCBhbmRcbiAgICAgIHRyeSB0byB1c2UgdGhlbSBhcyB3ZWxsIGFzIHRyeSB0byBmaW5kIGdsb2JhbCBweXRob24gZXhlY3V0YWJsZS4gSWYgeW91XG4gICAgICB1c2UgdGhpcyBjb25maWcsIGF1dG9tYXRpYyBsb29rdXAgd2lsbCBoYXZlIGxvd2VzdCBwcmlvcml0eS5cbiAgICAgIFVzZSBgJFBST0pFQ1RgIG9yIGAkUFJPSkVDVF9OQU1FYCBzdWJzdGl0dXRpb24gZm9yIHByb2plY3Qtc3BlY2lmaWNcbiAgICAgIHBhdGhzIHRvIHBvaW50IG9uIGV4ZWN1dGFibGVzIGluIHZpcnR1YWwgZW52aXJvbm1lbnRzLlxuICAgICAgRm9yIGV4YW1wbGU6XG4gICAgICBgL1VzZXJzL25hbWUvLnZpcnR1YWxlbnZzLyRQUk9KRUNUX05BTUUvYmluL3B5dGhvbjskUFJPSkVDVC92ZW52L2Jpbi9weXRob24zOy91c3IvYmluL3B5dGhvbmAuXG4gICAgICBTdWNoIGNvbmZpZyB3aWxsIGZhbGwgYmFjayBvbiBgL3Vzci9iaW4vcHl0aG9uYCBmb3IgcHJvamVjdHMgbm90IHByZXNlbnRlZFxuICAgICAgd2l0aCBzYW1lIG5hbWUgaW4gYC52aXJ0dWFsZW52c2AgYW5kIHdpdGhvdXQgYHZlbnZgIGZvbGRlciBpbnNpZGUgb2Ygb25lXG4gICAgICBvZiBwcm9qZWN0IGZvbGRlcnMuXG4gICAgICBJZiB5b3UgYXJlIHVzaW5nIHB5dGhvbjMgZXhlY3V0YWJsZSB3aGlsZSBjb2RpbmcgZm9yIHB5dGhvbjIgeW91IHdpbGwgZ2V0XG4gICAgICBweXRob24yIGNvbXBsZXRpb25zIGZvciBzb21lIGJ1aWx0LWlucy4nJydcbiAgICBleHRyYVBhdGhzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICBvcmRlcjogNFxuICAgICAgdGl0bGU6ICdFeHRyYSBQYXRocyBGb3IgUGFja2FnZXMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnU2VtaWNvbG9uIHNlcGFyYXRlZCBsaXN0IG9mIG1vZHVsZXMgdG8gYWRkaXRpb25hbGx5XG4gICAgICBpbmNsdWRlIGZvciBhdXRvY29tcGxldGUuIFlvdSBjYW4gdXNlIHNhbWUgc3Vic3RpdHV0aW9ucyBhcyBpblxuICAgICAgYFB5dGhvbiBFeGVjdXRhYmxlIFBhdGhzYC5cbiAgICAgIE5vdGUgdGhhdCBpdCBzdGlsbCBzaG91bGQgYmUgdmFsaWQgcHl0aG9uIHBhY2thZ2UuXG4gICAgICBGb3IgZXhhbXBsZTpcbiAgICAgIGAkUFJPSkVDVC9lbnYvbGliL3B5dGhvbjIuNy9zaXRlLXBhY2thZ2VzYFxuICAgICAgb3JcbiAgICAgIGAvVXNlci9uYW1lLy52aXJ0dWFsZW52cy8kUFJPSkVDVF9OQU1FL2xpYi9weXRob24yLjcvc2l0ZS1wYWNrYWdlc2AuXG4gICAgICBZb3UgZG9uJ3QgbmVlZCB0byBzcGVjaWZ5IGV4dHJhIHBhdGhzIGZvciBsaWJyYXJpZXMgaW5zdGFsbGVkIHdpdGggcHl0aG9uXG4gICAgICBleGVjdXRhYmxlIHlvdSB1c2UuJycnXG4gICAgY2FzZUluc2Vuc2l0aXZlQ29tcGxldGlvbjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDVcbiAgICAgIHRpdGxlOiAnQ2FzZSBJbnNlbnNpdGl2ZSBDb21wbGV0aW9uJ1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgY29tcGxldGlvbiBpcyBieSBkZWZhdWx0IGNhc2UgaW5zZW5zaXRpdmUuJ1xuICAgIHRyaWdnZXJDb21wbGV0aW9uUmVnZXg6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJyhbXFwuXFwgKF18W2EtekEtWl9dW2EtekEtWjAtOV9dKiknXG4gICAgICBvcmRlcjogNlxuICAgICAgdGl0bGU6ICdSZWdleCBUbyBUcmlnZ2VyIEF1dG9jb21wbGV0aW9ucydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydCeSBkZWZhdWx0IGNvbXBsZXRpb25zIHRyaWdnZXJlZCBhZnRlciB3b3JkcywgZG90cywgc3BhY2VzXG4gICAgICBhbmQgbGVmdCBwYXJlbnRoZXNpcy4gWW91IHdpbGwgbmVlZCB0byByZXN0YXJ0IHlvdXIgZWRpdG9yIGFmdGVyIGNoYW5naW5nXG4gICAgICB0aGlzLicnJ1xuICAgIGZ1enp5TWF0Y2hlcjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDdcbiAgICAgIHRpdGxlOiAnVXNlIEZ1enp5IE1hdGNoZXIgRm9yIENvbXBsZXRpb25zLidcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydUeXBpbmcgYHN0ZHJgIHdpbGwgbWF0Y2ggYHN0ZGVycmAuXG4gICAgICBGaXJzdCBjaGFyYWN0ZXIgc2hvdWxkIGFsd2F5cyBtYXRjaC4gVXNlcyBhZGRpdGlvbmFsIGNhY2hpbmcgdGh1c1xuICAgICAgY29tcGxldGlvbnMgc2hvdWxkIGJlIGZhc3Rlci4gTm90ZSB0aGF0IHRoaXMgc2V0dGluZyBkb2VzIG5vdCBhZmZlY3RcbiAgICAgIGJ1aWx0LWluIGF1dG9jb21wbGV0ZS1wbHVzIHByb3ZpZGVyLicnJ1xuICAgIG91dHB1dFByb3ZpZGVyRXJyb3JzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDhcbiAgICAgIHRpdGxlOiAnT3V0cHV0IFByb3ZpZGVyIEVycm9ycydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydTZWxlY3QgaWYgeW91IHdvdWxkIGxpa2UgdG8gc2VlIHRoZSBwcm92aWRlciBlcnJvcnMgd2hlblxuICAgICAgdGhleSBoYXBwZW4uIEJ5IGRlZmF1bHQgdGhleSBhcmUgaGlkZGVuLiBOb3RlIHRoYXQgY3JpdGljYWwgZXJyb3JzIGFyZVxuICAgICAgYWx3YXlzIHNob3duLicnJ1xuICAgIG91dHB1dERlYnVnOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDlcbiAgICAgIHRpdGxlOiAnT3V0cHV0IERlYnVnIExvZ3MnXG4gICAgICBkZXNjcmlwdGlvbjogJycnU2VsZWN0IGlmIHlvdSB3b3VsZCBsaWtlIHRvIHNlZSBkZWJ1ZyBpbmZvcm1hdGlvbiBpblxuICAgICAgZGV2ZWxvcGVyIHRvb2xzIGxvZ3MuIE1heSBzbG93IGRvd24geW91ciBlZGl0b3IuJycnXG4gICAgc2hvd1Rvb2x0aXBzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDEwXG4gICAgICB0aXRsZTogJ1Nob3cgVG9vbHRpcHMgd2l0aCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgb2JqZWN0IHVuZGVyIHRoZSBjdXJzb3InXG4gICAgICBkZXNjcmlwdGlvbjogJycnRVhQRVJJTUVOVEFMIEZFQVRVUkUgV0hJQ0ggSVMgTk9UIEZJTklTSEVEIFlFVC5cbiAgICAgIEZlZWRiYWNrIGFuZCBpZGVhcyBhcmUgd2VsY29tZSBvbiBnaXRodWIuJycnXG4gICAgc3VnZ2VzdGlvblByaW9yaXR5OlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAzXG4gICAgICBtaW5pbXVtOiAwXG4gICAgICBtYXhpbXVtOiA5OVxuICAgICAgb3JkZXI6IDExXG4gICAgICB0aXRsZTogJ1N1Z2dlc3Rpb24gUHJpb3JpdHknXG4gICAgICBkZXNjcmlwdGlvbjogJycnWW91IGNhbiB1c2UgdGhpcyB0byBzZXQgdGhlIHByaW9yaXR5IGZvciBhdXRvY29tcGxldGUtcHl0aG9uXG4gICAgICBzdWdnZXN0aW9ucy4gRm9yIGV4YW1wbGUsIHlvdSBjYW4gdXNlIGxvd2VyIHZhbHVlIHRvIGdpdmUgaGlnaGVyIHByaW9yaXR5XG4gICAgICBmb3Igc25pcHBldHMgY29tcGxldGlvbnMgd2hpY2ggaGFzIHByaW9yaXR5IG9mIDIuJycnXG4gICAgZW5hYmxlVG91Y2hCYXI6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogMTJcbiAgICAgIHRpdGxlOiAnRW5hYmxlIFRvdWNoIEJhciBzdXBwb3J0J1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1Byb29mIG9mIGNvbmNlcHQgZm9yIG5vdywgcmVxdWlyZXMgdG9vbHRpcHMgdG8gYmUgZW5hYmxlZCBhbmQgQXRvbSA+PTEuMTkuMC4nJydcblxuICBpbnN0YWxsYXRpb246IG51bGxcblxuICBfaGFuZGxlR3JhbW1hckNoYW5nZUV2ZW50OiAoZ3JhbW1hcikgLT5cbiAgICAjIHRoaXMgc2hvdWxkIGJlIHNhbWUgd2l0aCBhY3RpdmF0aW9uSG9va3MgbmFtZXNcbiAgICBpZiBncmFtbWFyLnBhY2thZ2VOYW1lIGluIFsnbGFuZ3VhZ2UtcHl0aG9uJywgJ01hZ2ljUHl0aG9uJywgJ2F0b20tZGphbmdvJ11cbiAgICAgIEBwcm92aWRlci5sb2FkKClcbiAgICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1sb2FkLXByb3ZpZGVyJ1xuICAgICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuXG4gIF9sb2FkS2l0ZTogLT5cbiAgICBmaXJzdEluc3RhbGwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYXV0b2NvbXBsZXRlLXB5dGhvbi5pbnN0YWxsZWQnKSA9PSBudWxsXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2F1dG9jb21wbGV0ZS1weXRob24uaW5zdGFsbGVkJywgdHJ1ZSlcbiAgICBsb25nUnVubmluZyA9IHJlcXVpcmUoJ3Byb2Nlc3MnKS51cHRpbWUoKSA+IDEwXG4gICAgaWYgZmlyc3RJbnN0YWxsIGFuZCBsb25nUnVubmluZ1xuICAgICAgZXZlbnQgPSBcImluc3RhbGxlZFwiXG4gICAgZWxzZSBpZiBmaXJzdEluc3RhbGxcbiAgICAgIGV2ZW50ID0gXCJ1cGdyYWRlZFwiXG4gICAgZWxzZVxuICAgICAgZXZlbnQgPSBcInJlc3RhcnRlZFwiXG5cbiAgICB7XG4gICAgICBBY2NvdW50TWFuYWdlcixcbiAgICAgIEF0b21IZWxwZXIsXG4gICAgICBEZWNpc2lvbk1ha2VyLFxuICAgICAgSW5zdGFsbGF0aW9uLFxuICAgICAgSW5zdGFsbGVyLFxuICAgICAgTWV0cmljcyxcbiAgICAgIExvZ2dlcixcbiAgICAgIFN0YXRlQ29udHJvbGxlclxuICAgIH0gPSByZXF1aXJlICdraXRlLWluc3RhbGxlcidcblxuICAgIGlmIGF0b20uY29uZmlnLmdldCgna2l0ZS5sb2dnaW5nTGV2ZWwnKVxuICAgICAgTG9nZ2VyLkxFVkVMID0gTG9nZ2VyLkxFVkVMU1thdG9tLmNvbmZpZy5nZXQoJ2tpdGUubG9nZ2luZ0xldmVsJykudG9VcHBlckNhc2UoKV1cblxuICAgIEFjY291bnRNYW5hZ2VyLmluaXRDbGllbnQgJ2FscGhhLmtpdGUuY29tJywgLTEsIHRydWVcbiAgICBhdG9tLnZpZXdzLmFkZFZpZXdQcm92aWRlciBJbnN0YWxsYXRpb24sIChtKSAtPiBtLmVsZW1lbnRcbiAgICBlZGl0b3JDZmcgPVxuICAgICAgVVVJRDogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ21ldHJpY3MudXNlcklkJylcbiAgICAgIG5hbWU6ICdhdG9tJ1xuICAgIHBsdWdpbkNmZyA9XG4gICAgICBuYW1lOiAnYXV0b2NvbXBsZXRlLXB5dGhvbidcbiAgICBkbSA9IG5ldyBEZWNpc2lvbk1ha2VyIGVkaXRvckNmZywgcGx1Z2luQ2ZnXG5cbiAgICBNZXRyaWNzLlRyYWNrZXIubmFtZSA9IFwiYXRvbSBhY3BcIlxuICAgIE1ldHJpY3MuZW5hYmxlZCA9IGF0b20uY29uZmlnLmdldCgnY29yZS50ZWxlbWV0cnlDb25zZW50JykgaXMgJ2xpbWl0ZWQnXG5cbiAgICBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlIChwa2cpID0+XG4gICAgICBpZiBwa2cubmFtZSBpcyAna2l0ZSdcbiAgICAgICAgQHBhdGNoS2l0ZUNvbXBsZXRpb25zKHBrZylcbiAgICAgICAgTWV0cmljcy5UcmFja2VyLm5hbWUgPSBcImF0b20ga2l0ZSthY3BcIlxuXG4gICAgY2hlY2tLaXRlSW5zdGFsbGF0aW9uID0gKCkgPT5cbiAgICAgIGlmIG5vdCBhdG9tLmNvbmZpZy5nZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZSdcbiAgICAgICAgcmV0dXJuXG4gICAgICBjYW5JbnN0YWxsID0gU3RhdGVDb250cm9sbGVyLmNhbkluc3RhbGxLaXRlKClcbiAgICAgIHRocm90dGxlID0gZG0uc2hvdWxkT2ZmZXJLaXRlKGV2ZW50KVxuICAgICAgUHJvbWlzZS5hbGwoW3Rocm90dGxlLCBjYW5JbnN0YWxsXSkudGhlbigodmFsdWVzKSA9PlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsIHRydWVcbiAgICAgICAgdmFyaWFudCA9IHZhbHVlc1swXVxuICAgICAgICBNZXRyaWNzLlRyYWNrZXIucHJvcHMgPSB2YXJpYW50XG4gICAgICAgIE1ldHJpY3MuVHJhY2tlci5wcm9wcy5sYXN0RXZlbnQgPSBldmVudFxuICAgICAgICB0aXRsZSA9IFwiQ2hvb3NlIGEgYXV0b2NvbXBsZXRlLXB5dGhvbiBlbmdpbmVcIlxuICAgICAgICBAaW5zdGFsbGF0aW9uID0gbmV3IEluc3RhbGxhdGlvbiB2YXJpYW50LCB0aXRsZVxuICAgICAgICBAaW5zdGFsbGF0aW9uLmFjY291bnRDcmVhdGVkKCgpID0+XG4gICAgICAgICAgQHRyYWNrIFwiYWNjb3VudCBjcmVhdGVkXCJcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsIHRydWVcbiAgICAgICAgKVxuICAgICAgICBAaW5zdGFsbGF0aW9uLmZsb3dTa2lwcGVkKCgpID0+XG4gICAgICAgICAgQHRyYWNrIFwiZmxvdyBhYm9ydGVkXCJcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsIGZhbHNlXG4gICAgICAgIClcbiAgICAgICAgW3Byb2plY3RQYXRoXSA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgICAgIHJvb3QgPSBpZiBwcm9qZWN0UGF0aD8gYW5kIHBhdGgucmVsYXRpdmUob3MuaG9tZWRpcigpLCBwcm9qZWN0UGF0aCkuaW5kZXhPZignLi4nKSBpcyAwXG4gICAgICAgICAgcGF0aC5wYXJzZShwcm9qZWN0UGF0aCkucm9vdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgb3MuaG9tZWRpcigpXG5cbiAgICAgICAgaW5zdGFsbGVyID0gbmV3IEluc3RhbGxlcihbcm9vdF0pXG4gICAgICAgIGluc3RhbGxlci5pbml0IEBpbnN0YWxsYXRpb24uZmxvdywgLT5cbiAgICAgICAgICBMb2dnZXIudmVyYm9zZSgnaW4gb25GaW5pc2gnKVxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdraXRlJylcblxuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIEBpbnN0YWxsYXRpb24uZmxvdy5vblNraXBJbnN0YWxsICgpID0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCBmYWxzZVxuICAgICAgICAgIEB0cmFjayBcInNraXBwZWQga2l0ZVwiXG4gICAgICAgICAgcGFuZS5kZXN0cm95QWN0aXZlSXRlbSgpXG4gICAgICAgIHBhbmUuYWRkSXRlbSBAaW5zdGFsbGF0aW9uLCBpbmRleDogMFxuICAgICAgICBwYW5lLmFjdGl2YXRlSXRlbUF0SW5kZXggMFxuICAgICAgLCAoZXJyKSA9PlxuICAgICAgICBpZiBlcnIudHlwZSA9PSAnZGVuaWVkJ1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgZmFsc2VcbiAgICAgICkgaWYgYXRvbS5jb25maWcuZ2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnXG5cbiAgICBjaGVja0tpdGVJbnN0YWxsYXRpb24oKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsICh7IG5ld1ZhbHVlLCBvbGRWYWx1ZSB9KSAtPlxuICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgY2hlY2tLaXRlSW5zdGFsbGF0aW9uKClcbiAgICAgICAgQXRvbUhlbHBlci5lbmFibGVQYWNrYWdlKClcbiAgICAgIGVsc2VcbiAgICAgICAgQXRvbUhlbHBlci5kaXNhYmxlUGFja2FnZSgpXG5cbiAgbG9hZDogLT5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIGRpc3Bvc2FibGUgPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIEBfaGFuZGxlR3JhbW1hckNoYW5nZUV2ZW50KGVkaXRvci5nZXRHcmFtbWFyKCkpXG4gICAgICBkaXNwb3NhYmxlID0gZWRpdG9yLm9uRGlkQ2hhbmdlR3JhbW1hciAoZ3JhbW1hcikgPT5cbiAgICAgICAgQF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQoZ3JhbW1hcilcbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgZGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgZGlzcG9zYWJsZVxuICAgIEBfbG9hZEtpdGUoKVxuICAgICMgQHRyYWNrQ29tcGxldGlvbnMoKVxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBwcm92aWRlciA9IHJlcXVpcmUoJy4vcHJvdmlkZXInKVxuICAgIGlmIHR5cGVvZiBhdG9tLnBhY2thZ2VzLmhhc0FjdGl2YXRlZEluaXRpYWxQYWNrYWdlcyA9PSAnZnVuY3Rpb24nIGFuZFxuICAgICAgICBhdG9tLnBhY2thZ2VzLmhhc0FjdGl2YXRlZEluaXRpYWxQYWNrYWdlcygpXG4gICAgICBAbG9hZCgpXG4gICAgZWxzZVxuICAgICAgZGlzcG9zYWJsZSA9IGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZUluaXRpYWxQYWNrYWdlcyA9PlxuICAgICAgICBAbG9hZCgpXG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAcHJvdmlkZXIuZGlzcG9zZSgpIGlmIEBwcm92aWRlclxuICAgIEBpbnN0YWxsYXRpb24uZGVzdHJveSgpIGlmIEBpbnN0YWxsYXRpb25cblxuICBnZXRQcm92aWRlcjogLT5cbiAgICByZXR1cm4gQHByb3ZpZGVyXG5cbiAgZ2V0SHlwZXJjbGlja1Byb3ZpZGVyOiAtPlxuICAgIHJldHVybiByZXF1aXJlKCcuL2h5cGVyY2xpY2stcHJvdmlkZXInKVxuXG4gIGNvbnN1bWVTbmlwcGV0czogKHNuaXBwZXRzTWFuYWdlcikgLT5cbiAgICBkaXNwb3NhYmxlID0gQGVtaXR0ZXIub24gJ2RpZC1sb2FkLXByb3ZpZGVyJywgPT5cbiAgICAgIEBwcm92aWRlci5zZXRTbmlwcGV0c01hbmFnZXIgc25pcHBldHNNYW5hZ2VyXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gIHRyYWNrQ29tcGxldGlvbnM6IC0+XG4gICAgcHJvbWlzZXMgPSBbYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F1dG9jb21wbGV0ZS1wbHVzJyldXG5cbiAgICBpZiBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoJ2tpdGUnKT9cblxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdraXRlLmxvZ2dpbmdMZXZlbCcsIChsZXZlbCkgLT5cbiAgICAgICAgTG9nZ2VyLkxFVkVMID0gTG9nZ2VyLkxFVkVMU1sobGV2ZWwgPyAnaW5mbycpLnRvVXBwZXJDYXNlKCldXG5cbiAgICAgIHByb21pc2VzLnB1c2goYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2tpdGUnKSlcbiAgICAgIE1ldHJpY3MuVHJhY2tlci5uYW1lID0gXCJhdG9tIGtpdGUrYWNwXCJcblxuICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuIChbYXV0b2NvbXBsZXRlUGx1cywga2l0ZV0pID0+XG4gICAgICBpZiBraXRlP1xuICAgICAgICBAcGF0Y2hLaXRlQ29tcGxldGlvbnMoa2l0ZSlcblxuICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IGF1dG9jb21wbGV0ZVBsdXMubWFpbk1vZHVsZS5nZXRBdXRvY29tcGxldGVNYW5hZ2VyKClcblxuICAgICAgcmV0dXJuIHVubGVzcyBhdXRvY29tcGxldGVNYW5hZ2VyPyBhbmQgYXV0b2NvbXBsZXRlTWFuYWdlci5jb25maXJtPyBhbmQgYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnM/XG5cbiAgICAgIHNhZmVDb25maXJtID0gYXV0b2NvbXBsZXRlTWFuYWdlci5jb25maXJtXG4gICAgICBzYWZlRGlzcGxheVN1Z2dlc3Rpb25zID0gYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnNcbiAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZGlzcGxheVN1Z2dlc3Rpb25zID0gKHN1Z2dlc3Rpb25zLCBvcHRpb25zKSA9PlxuICAgICAgICBAdHJhY2tTdWdnZXN0aW9ucyhzdWdnZXN0aW9ucywgYXV0b2NvbXBsZXRlTWFuYWdlci5lZGl0b3IpXG4gICAgICAgIHNhZmVEaXNwbGF5U3VnZ2VzdGlvbnMuY2FsbChhdXRvY29tcGxldGVNYW5hZ2VyLCBzdWdnZXN0aW9ucywgb3B0aW9ucylcblxuICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlci5jb25maXJtID0gKHN1Z2dlc3Rpb24pID0+XG4gICAgICAgIEB0cmFja1VzZWRTdWdnZXN0aW9uKHN1Z2dlc3Rpb24sIGF1dG9jb21wbGV0ZU1hbmFnZXIuZWRpdG9yKVxuICAgICAgICBzYWZlQ29uZmlybS5jYWxsKGF1dG9jb21wbGV0ZU1hbmFnZXIsIHN1Z2dlc3Rpb24pXG5cbiAgdHJhY2tTdWdnZXN0aW9uczogKHN1Z2dlc3Rpb25zLCBlZGl0b3IpIC0+XG4gICAgaWYgL1xcLnB5JC8udGVzdChlZGl0b3IuZ2V0UGF0aCgpKSBhbmQgQGtpdGVQcm92aWRlcj9cbiAgICAgIGhhc0tpdGVTdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25zLnNvbWUgKHMpID0+IHMucHJvdmlkZXIgaXMgQGtpdGVQcm92aWRlclxuICAgICAgaGFzSmVkaVN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnMuc29tZSAocykgPT4gcy5wcm92aWRlciBpcyBAcHJvdmlkZXJcblxuICAgICAgaWYgaGFzS2l0ZVN1Z2dlc3Rpb25zIGFuZCBoYXNKZWRpU3VnZ2VzdGlvbnNcbiAgICAgICAgQHRyYWNrICdBdG9tIHNob3dzIGJvdGggS2l0ZSBhbmQgSmVkaSBjb21wbGV0aW9ucydcbiAgICAgIGVsc2UgaWYgaGFzS2l0ZVN1Z2dlc3Rpb25zXG4gICAgICAgIEB0cmFjayAnQXRvbSBzaG93cyBLaXRlIGJ1dCBub3QgSmVkaSBjb21wbGV0aW9ucydcbiAgICAgIGVsc2UgaWYgaGFzSmVkaVN1Z2dlc3Rpb25zXG4gICAgICAgIEB0cmFjayAnQXRvbSBzaG93cyBKZWRpIGJ1dCBub3QgS2l0ZSBjb21wbGV0aW9ucydcbiAgICAgIGVsc2VcbiAgICAgICAgQHRyYWNrICdBdG9tIHNob3dzIG5laXRoZXIgS2l0ZSBub3IgSmVkaSBjb21wbGV0aW9ucydcblxuICBwYXRjaEtpdGVDb21wbGV0aW9uczogKGtpdGUpIC0+XG4gICAgcmV0dXJuIGlmIEBraXRlUGFja2FnZT9cblxuICAgIEBraXRlUGFja2FnZSA9IGtpdGUubWFpbk1vZHVsZVxuICAgIEBraXRlUHJvdmlkZXIgPSBAa2l0ZVBhY2thZ2UuY29tcGxldGlvbnMoKVxuICAgIGdldFN1Z2dlc3Rpb25zID0gQGtpdGVQcm92aWRlci5nZXRTdWdnZXN0aW9uc1xuICAgIEBraXRlUHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnMgPSAoYXJncy4uLikgPT5cbiAgICAgIGdldFN1Z2dlc3Rpb25zPy5hcHBseShAa2l0ZVByb3ZpZGVyLCBhcmdzKVxuICAgICAgPy50aGVuIChzdWdnZXN0aW9ucykgPT5cbiAgICAgICAgQGxhc3RLaXRlU3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9uc1xuICAgICAgICBAa2l0ZVN1Z2dlc3RlZCA9IHN1Z2dlc3Rpb25zP1xuICAgICAgICBzdWdnZXN0aW9uc1xuICAgICAgPy5jYXRjaCAoZXJyKSA9PlxuICAgICAgICBAbGFzdEtpdGVTdWdnZXN0aW9ucyA9IFtdXG4gICAgICAgIEBraXRlU3VnZ2VzdGVkID0gZmFsc2VcbiAgICAgICAgdGhyb3cgZXJyXG5cbiAgdHJhY2tVc2VkU3VnZ2VzdGlvbjogKHN1Z2dlc3Rpb24sIGVkaXRvcikgLT5cbiAgICBpZiAvXFwucHkkLy50ZXN0KGVkaXRvci5nZXRQYXRoKCkpXG4gICAgICBpZiBAa2l0ZVByb3ZpZGVyP1xuICAgICAgICBpZiBAbGFzdEtpdGVTdWdnZXN0aW9ucz9cbiAgICAgICAgICBpZiBzdWdnZXN0aW9uIGluIEBsYXN0S2l0ZVN1Z2dlc3Rpb25zXG4gICAgICAgICAgICBhbHRTdWdnZXN0aW9uID0gQGhhc1NhbWVTdWdnZXN0aW9uKHN1Z2dlc3Rpb24sIEBwcm92aWRlci5sYXN0U3VnZ2VzdGlvbnMgb3IgW10pXG4gICAgICAgICAgICBpZiBhbHRTdWdnZXN0aW9uP1xuICAgICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBLaXRlIGJ1dCBhbHNvIHJldHVybmVkIGJ5IEplZGknLCB7XG4gICAgICAgICAgICAgICAga2l0ZUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKGFsdFN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgS2l0ZSBidXQgbm90IEplZGknLCB7XG4gICAgICAgICAgICAgICAga2l0ZUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmIEBwcm92aWRlci5sYXN0U3VnZ2VzdGlvbnMgYW5kICBzdWdnZXN0aW9uIGluIEBwcm92aWRlci5sYXN0U3VnZ2VzdGlvbnNcbiAgICAgICAgICAgIGFsdFN1Z2dlc3Rpb24gPSBAaGFzU2FtZVN1Z2dlc3Rpb24oc3VnZ2VzdGlvbiwgQGxhc3RLaXRlU3VnZ2VzdGlvbnMpXG4gICAgICAgICAgICBpZiBhbHRTdWdnZXN0aW9uP1xuICAgICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBKZWRpIGJ1dCBhbHNvIHJldHVybmVkIGJ5IEtpdGUnLCB7XG4gICAgICAgICAgICAgICAga2l0ZUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKGFsdFN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgaWYgQGtpdGVQYWNrYWdlLmlzRWRpdG9yV2hpdGVsaXN0ZWQ/XG4gICAgICAgICAgICAgICAgaWYgQGtpdGVQYWNrYWdlLmlzRWRpdG9yV2hpdGVsaXN0ZWQoZWRpdG9yKVxuICAgICAgICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaSBidXQgbm90IEtpdGUgKHdoaXRlbGlzdGVkIGZpbGVwYXRoKScsIHtcbiAgICAgICAgICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaSBidXQgbm90IEtpdGUgKG5vbi13aGl0ZWxpc3RlZCBmaWxlcGF0aCknLCB7XG4gICAgICAgICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaSBidXQgbm90IEtpdGUgKHdoaXRlbGlzdGVkIGZpbGVwYXRoKScsIHtcbiAgICAgICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiBmcm9tIG5laXRoZXIgS2l0ZSBub3IgSmVkaSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlmIEBraXRlUGFja2FnZS5pc0VkaXRvcldoaXRlbGlzdGVkP1xuICAgICAgICAgICAgaWYgQGtpdGVQYWNrYWdlLmlzRWRpdG9yV2hpdGVsaXN0ZWQoZWRpdG9yKVxuICAgICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBKZWRpIGJ1dCBub3QgS2l0ZSAod2hpdGVsaXN0ZWQgZmlsZXBhdGgpJywge1xuICAgICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIHJldHVybmVkIGJ5IEplZGkgYnV0IG5vdCBLaXRlIChub24td2hpdGVsaXN0ZWQgZmlsZXBhdGgpJywge1xuICAgICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaSBidXQgbm90IEtpdGUgKG5vdC13aGl0ZWxpc3RlZCBmaWxlcGF0aCknLCB7XG4gICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgfVxuICAgICAgZWxzZVxuICAgICAgICBpZiBAcHJvdmlkZXIubGFzdFN1Z2dlc3Rpb25zIGFuZCBzdWdnZXN0aW9uIGluIEBwcm92aWRlci5sYXN0U3VnZ2VzdGlvbnNcbiAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBKZWRpJywge1xuICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gbm90IHJldHVybmVkIGJ5IEplZGknXG5cbiAgaGFzU2FtZVN1Z2dlc3Rpb246IChzdWdnZXN0aW9uLCBzdWdnZXN0aW9ucykgLT5cbiAgICBzdWdnZXN0aW9ucy5maWx0ZXIoKHMpIC0+IHMudGV4dCBpcyBzdWdnZXN0aW9uLnRleHQpWzBdXG5cbiAgaGFzRG9jdW1lbnRhdGlvbjogKHN1Z2dlc3Rpb24pIC0+XG4gICAgKHN1Z2dlc3Rpb24uZGVzY3JpcHRpb24/IGFuZCBzdWdnZXN0aW9uLmRlc2NyaXB0aW9uIGlzbnQgJycpIG9yXG4gICAgKHN1Z2dlc3Rpb24uZGVzY3JpcHRpb25NYXJrZG93bj8gYW5kIHN1Z2dlc3Rpb24uZGVzY3JpcHRpb25NYXJrZG93biBpc250ICcnKVxuXG4gIHRyYWNrOiAobXNnLCBkYXRhKSAtPlxuICAgIHRyeVxuICAgICAgTWV0cmljcy5UcmFja2VyLnRyYWNrRXZlbnQgbXNnLCBkYXRhXG4gICAgY2F0Y2ggZVxuICAgICAgIyBUT0RPOiB0aGlzIHNob3VsZCBiZSByZW1vdmVkIGFmdGVyIGtpdGUtaW5zdGFsbGVyIGlzIGZpeGVkXG4gICAgICBpZiBlIGluc3RhbmNlb2YgVHlwZUVycm9yXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSlcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgZVxuIl19
