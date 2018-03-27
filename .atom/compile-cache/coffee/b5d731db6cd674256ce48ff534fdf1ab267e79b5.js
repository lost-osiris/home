(function() {
  var Disposable, Settings, inferType;

  Disposable = require('atom').Disposable;

  inferType = function(value) {
    switch (false) {
      case !Number.isInteger(value):
        return 'integer';
      case typeof value !== 'boolean':
        return 'boolean';
      case typeof value !== 'string':
        return 'string';
      case !Array.isArray(value):
        return 'array';
    }
  };

  Settings = (function() {
    Settings.prototype.deprecatedParams = ['showCursorInVisualMode'];

    Settings.prototype.notifyDeprecatedParams = function() {
      var content, deprecatedParams, j, len, notification, param;
      deprecatedParams = this.deprecatedParams.filter((function(_this) {
        return function(param) {
          return _this.has(param);
        };
      })(this));
      if (deprecatedParams.length === 0) {
        return;
      }
      content = [this.scope + ": Config options deprecated.  ", "Remove from your `connfig.cson` now?  "];
      for (j = 0, len = deprecatedParams.length; j < len; j++) {
        param = deprecatedParams[j];
        content.push("- `" + param + "`");
      }
      return notification = atom.notifications.addWarning(content.join("\n"), {
        dismissable: true,
        buttons: [
          {
            text: 'Remove All',
            onDidClick: (function(_this) {
              return function() {
                var k, len1;
                for (k = 0, len1 = deprecatedParams.length; k < len1; k++) {
                  param = deprecatedParams[k];
                  _this["delete"](param);
                }
                return notification.dismiss();
              };
            })(this)
          }
        ]
      });
    };

    function Settings(scope, config) {
      var i, j, k, key, len, len1, name, ref, ref1, value;
      this.scope = scope;
      this.config = config;
      ref = Object.keys(this.config);
      for (j = 0, len = ref.length; j < len; j++) {
        key = ref[j];
        if (typeof this.config[key] === 'boolean') {
          this.config[key] = {
            "default": this.config[key]
          };
        }
        if ((value = this.config[key]).type == null) {
          value.type = inferType(value["default"]);
        }
      }
      ref1 = Object.keys(this.config);
      for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
        name = ref1[i];
        this.config[name].order = i;
      }
    }

    Settings.prototype.has = function(param) {
      return param in atom.config.get(this.scope);
    };

    Settings.prototype["delete"] = function(param) {
      return this.set(param, void 0);
    };

    Settings.prototype.get = function(param) {
      return atom.config.get(this.scope + "." + param);
    };

    Settings.prototype.set = function(param, value) {
      return atom.config.set(this.scope + "." + param, value);
    };

    Settings.prototype.toggle = function(param) {
      return this.set(param, !this.get(param));
    };

    Settings.prototype.observe = function(param, fn) {
      return atom.config.observe(this.scope + "." + param, fn);
    };

    Settings.prototype.observeConditionalKeymaps = function() {
      var conditionalKeymaps, observeConditionalKeymap;
      conditionalKeymaps = {
        keymapUnderscoreToReplaceWithRegister: {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            '_': 'vim-mode-plus:replace-with-register'
          }
        },
        keymapPToPutWithAutoIndent: {
          'atom-text-editor.vim-mode-plus:not(.insert-mode):not(.operator-pending-mode)': {
            'P': 'vim-mode-plus:put-before-with-auto-indent',
            'p': 'vim-mode-plus:put-after-with-auto-indent'
          }
        },
        keymapCCToChangeInnerSmartWord: {
          'atom-text-editor.vim-mode-plus.operator-pending-mode.change-pending': {
            'c': 'vim-mode-plus:inner-smart-word'
          }
        },
        keymapSemicolonToInnerAnyPairInOperatorPendingMode: {
          'atom-text-editor.vim-mode-plus.operator-pending-mode': {
            ';': 'vim-mode-plus:inner-any-pair'
          }
        },
        keymapSemicolonToInnerAnyPairInVisualMode: {
          'atom-text-editor.vim-mode-plus.visual-mode': {
            ';': 'vim-mode-plus:inner-any-pair'
          }
        },
        keymapBackslashToInnerCommentOrParagraphWhenToggleLineCommentsIsPending: {
          'atom-text-editor.vim-mode-plus.operator-pending-mode.toggle-line-comments-pending': {
            '/': 'vim-mode-plus:inner-comment-or-paragraph'
          }
        }
      };
      observeConditionalKeymap = (function(_this) {
        return function(param) {
          var disposable, keymapSource;
          keymapSource = "vim-mode-plus-conditional-keymap:" + param;
          disposable = _this.observe(param, function(newValue) {
            if (newValue) {
              return atom.keymaps.add(keymapSource, conditionalKeymaps[param]);
            } else {
              return atom.keymaps.removeBindingsFromSource(keymapSource);
            }
          });
          return new Disposable(function() {
            disposable.dispose();
            return atom.keymaps.removeBindingsFromSource(keymapSource);
          });
        };
      })(this);
      return Object.keys(conditionalKeymaps).map(function(param) {
        return observeConditionalKeymap(param);
      });
    };

    return Settings;

  })();

  module.exports = new Settings('vim-mode-plus', {
    keymapUnderscoreToReplaceWithRegister: {
      "default": false,
      description: "Can: `_ i (` to replace inner-parenthesis with register's value<br>\nCan: `_ i ;` to replace inner-any-pair if you enabled `keymapSemicolonToInnerAnyPairInOperatorPendingMode`<br>\nConflicts: `_`( `move-to-first-character-of-line-and-down` ) motion. Who use this??"
    },
    keymapPToPutWithAutoIndent: {
      "default": false,
      description: "Remap `p` and `P` to auto indent version.<br>\n`p` remapped to `put-before-with-auto-indent` from original `put-before`<br>\n`P` remapped to `put-after-with-auto-indent` from original `put-after`<br>\nConflicts: Original `put-after` and `put-before` become unavailable unless you set different keymap by yourself."
    },
    keymapCCToChangeInnerSmartWord: {
      "default": false,
      description: "Can: `c c` to `change inner-smart-word`<br>\nConflicts: `c c`( change-current-line ) keystroke which is equivalent to `S` or `c i l` etc."
    },
    keymapSemicolonToInnerAnyPairInOperatorPendingMode: {
      "default": false,
      description: "Can: `c ;` to `change inner-any-pair`, Conflicts with original `;`( `repeat-find` ) motion.<br>\nConflicts: `;`( `repeat-find` )."
    },
    keymapSemicolonToInnerAnyPairInVisualMode: {
      "default": false,
      description: "Can: `v ;` to `select inner-any-pair`, Conflicts with original `;`( `repeat-find` ) motion.<br>L\nConflicts: `;`( `repeat-find` )."
    },
    keymapBackslashToInnerCommentOrParagraphWhenToggleLineCommentsIsPending: {
      "default": false,
      description: "Can: `g / /` to comment-in already commented region, `g / /` to comment-out paragraph.<br>\nConflicts: `/`( `search` ) motion only when `g /` is pending. you no longe can `g /` with search."
    },
    setCursorToStartOfChangeOnUndoRedo: true,
    setCursorToStartOfChangeOnUndoRedoStrategy: {
      "default": 'smart',
      "enum": ['smart', 'simple'],
      description: "When you think undo/redo cursor position has BUG, set this to `simple`.<br>\n`smart`: Good accuracy but have cursor-not-updated-on-different-editor limitation<br>\n`simple`: Always work, but accuracy is not as good as `smart`.<br>"
    },
    groupChangesWhenLeavingInsertMode: true,
    useClipboardAsDefaultRegister: true,
    dontUpdateRegisterOnChangeOrSubstitute: {
      "default": false,
      description: "When set to `true` any `change` or `substitute` operation no longer update register content<br>\nAffects `c`, `C`, `s`, `S` operator."
    },
    startInInsertMode: false,
    startInInsertModeScopes: {
      "default": [],
      items: {
        type: 'string'
      },
      description: 'Start in insert-mode when editorElement matches scope'
    },
    clearMultipleCursorsOnEscapeInsertMode: false,
    autoSelectPersistentSelectionOnOperate: true,
    automaticallyEscapeInsertModeOnActivePaneItemChange: {
      "default": false,
      description: 'Escape insert-mode on tab switch, pane switch'
    },
    wrapLeftRightMotion: false,
    numberRegex: {
      "default": '-?[0-9]+',
      description: "Used to find number in ctrl-a/ctrl-x.<br>\nTo ignore \"-\"(minus) char in string like \"identifier-1\" use `(?:\\B-)?[0-9]+`"
    },
    clearHighlightSearchOnResetNormalMode: {
      "default": true,
      description: 'Clear highlightSearch on `escape` in normal-mode'
    },
    clearPersistentSelectionOnResetNormalMode: {
      "default": true,
      description: 'Clear persistentSelection on `escape` in normal-mode'
    },
    charactersToAddSpaceOnSurround: {
      "default": [],
      items: {
        type: 'string'
      },
      description: "Comma separated list of character, which add space around surrounded text.<br>\nFor vim-surround compatible behavior, set `(, {, [, <`."
    },
    ignoreCaseForSearch: {
      "default": false,
      description: 'For `/` and `?`'
    },
    useSmartcaseForSearch: {
      "default": false,
      description: 'For `/` and `?`. Override `ignoreCaseForSearch`'
    },
    ignoreCaseForSearchCurrentWord: {
      "default": false,
      description: 'For `*` and `#`.'
    },
    useSmartcaseForSearchCurrentWord: {
      "default": false,
      description: 'For `*` and `#`. Override `ignoreCaseForSearchCurrentWord`'
    },
    highlightSearch: true,
    highlightSearchExcludeScopes: {
      "default": [],
      items: {
        type: 'string'
      },
      description: 'Suppress highlightSearch when any of these classes are present in the editor'
    },
    incrementalSearch: false,
    incrementalSearchVisitDirection: {
      "default": 'absolute',
      "enum": ['absolute', 'relative'],
      description: "When `relative`, `tab`, and `shift-tab` respect search direction('/' or '?')"
    },
    stayOnTransformString: {
      "default": false,
      description: "Don't move cursor after TransformString e.g upper-case, surround"
    },
    stayOnYank: {
      "default": false,
      description: "Don't move cursor after yank"
    },
    stayOnDelete: {
      "default": false,
      description: "Don't move cursor after delete"
    },
    stayOnOccurrence: {
      "default": true,
      description: "Don't move cursor when operator works on occurrences( when `true`, override operator specific `stayOn` options )"
    },
    keepColumnOnSelectTextObject: {
      "default": false,
      description: "Keep column on select TextObject(Paragraph, Indentation, Fold, Function, Edge)"
    },
    moveToFirstCharacterOnVerticalMotion: {
      "default": true,
      description: "Almost equivalent to `startofline` pure-Vim option. When true, move cursor to first char.<br>\nAffects to `ctrl-f, b, d, u`, `G`, `H`, `M`, `L`, `gg`<br>\nUnlike pure-Vim, `d`, `<<`, `>>` are not affected by this option, use independent `stayOn` options."
    },
    flashOnUndoRedo: true,
    flashOnMoveToOccurrence: {
      "default": false,
      description: "Affects normal-mode's `tab`, `shift-tab`."
    },
    flashOnOperate: true,
    flashOnOperateBlacklist: {
      "default": [],
      items: {
        type: 'string'
      },
      description: 'Comma separated list of operator class name to disable flash e.g. "yank, auto-indent"'
    },
    flashOnSearch: true,
    flashScreenOnSearchHasNoMatch: true,
    showHoverSearchCounter: false,
    showHoverSearchCounterDuration: {
      "default": 700,
      description: "Duration(msec) for hover search counter"
    },
    hideTabBarOnMaximizePane: {
      "default": true,
      description: "If set to `false`, tab still visible after maximize-pane( `cmd-enter` )"
    },
    hideStatusBarOnMaximizePane: {
      "default": true
    },
    smoothScrollOnFullScrollMotion: {
      "default": false,
      description: "For `ctrl-f` and `ctrl-b`"
    },
    smoothScrollOnFullScrollMotionDuration: {
      "default": 500,
      description: "Smooth scroll duration in milliseconds for `ctrl-f` and `ctrl-b`"
    },
    smoothScrollOnHalfScrollMotion: {
      "default": false,
      description: "For `ctrl-d` and `ctrl-u`"
    },
    smoothScrollOnHalfScrollMotionDuration: {
      "default": 500,
      description: "Smooth scroll duration in milliseconds for `ctrl-d` and `ctrl-u`"
    },
    statusBarModeStringStyle: {
      "default": 'short',
      "enum": ['short', 'long']
    },
    debug: {
      "default": false,
      description: "[Dev use]"
    },
    strictAssertion: {
      "default": false,
      description: "[Dev use] to catche wired state in vmp-dev, enable this if you want help me"
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NldHRpbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsYUFBYyxPQUFBLENBQVEsTUFBUjs7RUFFZixTQUFBLEdBQVksU0FBQyxLQUFEO0FBQ1YsWUFBQSxLQUFBO0FBQUEsWUFDTyxNQUFNLENBQUMsU0FBUCxDQUFpQixLQUFqQixDQURQO2VBQ29DO0FBRHBDLFdBRU8sT0FBTyxLQUFQLEtBQWlCLFNBRnhCO2VBRXVDO0FBRnZDLFdBR08sT0FBTyxLQUFQLEtBQWlCLFFBSHhCO2VBR3NDO0FBSHRDLFlBSU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFkLENBSlA7ZUFJaUM7QUFKakM7RUFEVTs7RUFPTjt1QkFDSixnQkFBQSxHQUFrQixDQUNoQix3QkFEZ0I7O3VCQUdsQixzQkFBQSxHQUF3QixTQUFBO0FBQ3RCLFVBQUE7TUFBQSxnQkFBQSxHQUFtQixJQUFDLENBQUEsZ0JBQWdCLENBQUMsTUFBbEIsQ0FBeUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7aUJBQVcsS0FBQyxDQUFBLEdBQUQsQ0FBSyxLQUFMO1FBQVg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO01BQ25CLElBQVUsZ0JBQWdCLENBQUMsTUFBakIsS0FBMkIsQ0FBckM7QUFBQSxlQUFBOztNQUVBLE9BQUEsR0FBVSxDQUNMLElBQUMsQ0FBQSxLQUFGLEdBQVEsZ0NBREYsRUFFUix3Q0FGUTtBQUlWLFdBQUEsa0RBQUE7O1FBQUEsT0FBTyxDQUFDLElBQVIsQ0FBYSxLQUFBLEdBQU0sS0FBTixHQUFZLEdBQXpCO0FBQUE7YUFFQSxZQUFBLEdBQWUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4QixPQUFPLENBQUMsSUFBUixDQUFhLElBQWIsQ0FBOUIsRUFDYjtRQUFBLFdBQUEs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Q0FBQSxPQUFBLENBQUEsRUFBUyxLQUFUO01BQ0EsV0FBQSxFQUFhLDJCQURiO0tBN0pGO0lBK0pBLHNDQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEdBQVQ7TUFDQSxXQUFBLEVBQWEsa0VBRGI7S0FoS0Y7SUFrS0Esd0JBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FBVDtNQUNBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVUsTUFBVixDQUROO0tBbktGO0lBcUtBLEtBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSxXQURiO0tBdEtGO0lBd0tBLGVBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSw2RUFEYjtLQXpLRjtHQURtQjtBQXZHckIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5pbmZlclR5cGUgPSAodmFsdWUpIC0+XG4gIHN3aXRjaFxuICAgIHdoZW4gTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgdGhlbiAnaW50ZWdlcidcbiAgICB3aGVuIHR5cGVvZih2YWx1ZSkgaXMgJ2Jvb2xlYW4nIHRoZW4gJ2Jvb2xlYW4nXG4gICAgd2hlbiB0eXBlb2YodmFsdWUpIGlzICdzdHJpbmcnIHRoZW4gJ3N0cmluZydcbiAgICB3aGVuIEFycmF5LmlzQXJyYXkodmFsdWUpIHRoZW4gJ2FycmF5J1xuXG5jbGFzcyBTZXR0aW5nc1xuICBkZXByZWNhdGVkUGFyYW1zOiBbXG4gICAgJ3Nob3dDdXJzb3JJblZpc3VhbE1vZGUnXG4gIF1cbiAgbm90aWZ5RGVwcmVjYXRlZFBhcmFtczogLT5cbiAgICBkZXByZWNhdGVkUGFyYW1zID0gQGRlcHJlY2F0ZWRQYXJhbXMuZmlsdGVyKChwYXJhbSkgPT4gQGhhcyhwYXJhbSkpXG4gICAgcmV0dXJuIGlmIGRlcHJlY2F0ZWRQYXJhbXMubGVuZ3RoIGlzIDBcblxuICAgIGNvbnRlbnQgPSBbXG4gICAgICBcIiN7QHNjb3BlfTogQ29uZmlnIG9wdGlvbnMgZGVwcmVjYXRlZC4gIFwiLFxuICAgICAgXCJSZW1vdmUgZnJvbSB5b3VyIGBjb25uZmlnLmNzb25gIG5vdz8gIFwiXG4gICAgXVxuICAgIGNvbnRlbnQucHVzaCBcIi0gYCN7cGFyYW19YFwiIGZvciBwYXJhbSBpbiBkZXByZWNhdGVkUGFyYW1zXG5cbiAgICBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyBjb250ZW50LmpvaW4oXCJcXG5cIiksXG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgYnV0dG9uczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJ1JlbW92ZSBBbGwnXG4gICAgICAgICAgb25EaWRDbGljazogPT5cbiAgICAgICAgICAgIEBkZWxldGUocGFyYW0pIGZvciBwYXJhbSBpbiBkZXByZWNhdGVkUGFyYW1zXG4gICAgICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICAgIH1cbiAgICAgIF1cblxuICBjb25zdHJ1Y3RvcjogKEBzY29wZSwgQGNvbmZpZykgLT5cbiAgICAjIEF1dG9tYXRpY2FsbHkgaW5mZXIgYW5kIGluamVjdCBgdHlwZWAgb2YgZWFjaCBjb25maWcgcGFyYW1ldGVyLlxuICAgICMgc2tpcCBpZiB2YWx1ZSB3aGljaCBhbGVhZHkgaGF2ZSBgdHlwZWAgZmllbGQuXG4gICAgIyBBbHNvIHRyYW5zbGF0ZSBiYXJlIGBib29sZWFuYCB2YWx1ZSB0byB7ZGVmYXVsdDogYGJvb2xlYW5gfSBvYmplY3RcbiAgICBmb3Iga2V5IGluIE9iamVjdC5rZXlzKEBjb25maWcpXG4gICAgICBpZiB0eXBlb2YoQGNvbmZpZ1trZXldKSBpcyAnYm9vbGVhbidcbiAgICAgICAgQGNvbmZpZ1trZXldID0ge2RlZmF1bHQ6IEBjb25maWdba2V5XX1cbiAgICAgIHVubGVzcyAodmFsdWUgPSBAY29uZmlnW2tleV0pLnR5cGU/XG4gICAgICAgIHZhbHVlLnR5cGUgPSBpbmZlclR5cGUodmFsdWUuZGVmYXVsdClcblxuICAgICMgW0NBVVRJT05dIGluamVjdGluZyBvcmRlciBwcm9wZXR5IHRvIHNldCBvcmRlciBzaG93biBhdCBzZXR0aW5nLXZpZXcgTVVTVC1DT01FLUxBU1QuXG4gICAgZm9yIG5hbWUsIGkgaW4gT2JqZWN0LmtleXMoQGNvbmZpZylcbiAgICAgIEBjb25maWdbbmFtZV0ub3JkZXIgPSBpXG5cbiAgaGFzOiAocGFyYW0pIC0+XG4gICAgcGFyYW0gb2YgYXRvbS5jb25maWcuZ2V0KEBzY29wZSlcblxuICBkZWxldGU6IChwYXJhbSkgLT5cbiAgICBAc2V0KHBhcmFtLCB1bmRlZmluZWQpXG5cbiAgZ2V0OiAocGFyYW0pIC0+XG4gICAgYXRvbS5jb25maWcuZ2V0KFwiI3tAc2NvcGV9LiN7cGFyYW19XCIpXG5cbiAgc2V0OiAocGFyYW0sIHZhbHVlKSAtPlxuICAgIGF0b20uY29uZmlnLnNldChcIiN7QHNjb3BlfS4je3BhcmFtfVwiLCB2YWx1ZSlcblxuICB0b2dnbGU6IChwYXJhbSkgLT5cbiAgICBAc2V0KHBhcmFtLCBub3QgQGdldChwYXJhbSkpXG5cbiAgb2JzZXJ2ZTogKHBhcmFtLCBmbikgLT5cbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKFwiI3tAc2NvcGV9LiN7cGFyYW19XCIsIGZuKVxuXG4gIG9ic2VydmVDb25kaXRpb25hbEtleW1hcHM6IC0+XG4gICAgY29uZGl0aW9uYWxLZXltYXBzID1cbiAgICAgIGtleW1hcFVuZGVyc2NvcmVUb1JlcGxhY2VXaXRoUmVnaXN0ZXI6XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdfJzogJ3ZpbS1tb2RlLXBsdXM6cmVwbGFjZS13aXRoLXJlZ2lzdGVyJ1xuICAgICAga2V5bWFwUFRvUHV0V2l0aEF1dG9JbmRlbnQ6XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSk6bm90KC5vcGVyYXRvci1wZW5kaW5nLW1vZGUpJzpcbiAgICAgICAgICAnUCc6ICd2aW0tbW9kZS1wbHVzOnB1dC1iZWZvcmUtd2l0aC1hdXRvLWluZGVudCdcbiAgICAgICAgICAncCc6ICd2aW0tbW9kZS1wbHVzOnB1dC1hZnRlci13aXRoLWF1dG8taW5kZW50J1xuICAgICAga2V5bWFwQ0NUb0NoYW5nZUlubmVyU21hcnRXb3JkOlxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm9wZXJhdG9yLXBlbmRpbmctbW9kZS5jaGFuZ2UtcGVuZGluZyc6XG4gICAgICAgICAgJ2MnOiAndmltLW1vZGUtcGx1czppbm5lci1zbWFydC13b3JkJ1xuICAgICAga2V5bWFwU2VtaWNvbG9uVG9Jbm5lckFueVBhaXJJbk9wZXJhdG9yUGVuZGluZ01vZGU6XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMub3BlcmF0b3ItcGVuZGluZy1tb2RlJzpcbiAgICAgICAgICAnOyc6ICd2aW0tbW9kZS1wbHVzOmlubmVyLWFueS1wYWlyJ1xuICAgICAga2V5bWFwU2VtaWNvbG9uVG9Jbm5lckFueVBhaXJJblZpc3VhbE1vZGU6XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMudmlzdWFsLW1vZGUnOlxuICAgICAgICAgICc7JzogJ3ZpbS1tb2RlLXBsdXM6aW5uZXItYW55LXBhaXInXG4gICAgICBrZXltYXBCYWNrc2xhc2hUb0lubmVyQ29tbWVudE9yUGFyYWdyYXBoV2hlblRvZ2dsZUxpbmVDb21tZW50c0lzUGVuZGluZzpcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5vcGVyYXRvci1wZW5kaW5nLW1vZGUudG9nZ2xlLWxpbmUtY29tbWVudHMtcGVuZGluZyc6XG4gICAgICAgICAgJy8nOiAndmltLW1vZGUtcGx1czppbm5lci1jb21tZW50LW9yLXBhcmFncmFwaCdcblxuICAgIG9ic2VydmVDb25kaXRpb25hbEtleW1hcCA9IChwYXJhbSkgPT5cbiAgICAgIGtleW1hcFNvdXJjZSA9IFwidmltLW1vZGUtcGx1cy1jb25kaXRpb25hbC1rZXltYXA6I3twYXJhbX1cIlxuICAgICAgZGlzcG9zYWJsZSA9IEBvYnNlcnZlIHBhcmFtLCAobmV3VmFsdWUpIC0+XG4gICAgICAgIGlmIG5ld1ZhbHVlXG4gICAgICAgICAgYXRvbS5rZXltYXBzLmFkZChrZXltYXBTb3VyY2UsIGNvbmRpdGlvbmFsS2V5bWFwc1twYXJhbV0pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhdG9tLmtleW1hcHMucmVtb3ZlQmluZGluZ3NGcm9tU291cmNlKGtleW1hcFNvdXJjZSlcblxuICAgICAgbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgICAgYXRvbS5rZXltYXBzLnJlbW92ZUJpbmRpbmdzRnJvbVNvdXJjZShrZXltYXBTb3VyY2UpXG5cbiAgICAjIFJldHVybiBkaXNwb3NhbGJlcyB0byBkaXNwb3NlIGNvbmZpZyBvYnNlcnZhdGlvbiBhbmQgY29uZGl0aW9uYWwga2V5bWFwLlxuICAgIHJldHVybiBPYmplY3Qua2V5cyhjb25kaXRpb25hbEtleW1hcHMpLm1hcCAocGFyYW0pIC0+IG9ic2VydmVDb25kaXRpb25hbEtleW1hcChwYXJhbSlcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2V0dGluZ3MgJ3ZpbS1tb2RlLXBsdXMnLFxuICBrZXltYXBVbmRlcnNjb3JlVG9SZXBsYWNlV2l0aFJlZ2lzdGVyOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIENhbjogYF8gaSAoYCB0byByZXBsYWNlIGlubmVyLXBhcmVudGhlc2lzIHdpdGggcmVnaXN0ZXIncyB2YWx1ZTxicj5cbiAgICBDYW46IGBfIGkgO2AgdG8gcmVwbGFjZSBpbm5lci1hbnktcGFpciBpZiB5b3UgZW5hYmxlZCBga2V5bWFwU2VtaWNvbG9uVG9Jbm5lckFueVBhaXJJbk9wZXJhdG9yUGVuZGluZ01vZGVgPGJyPlxuICAgIENvbmZsaWN0czogYF9gKCBgbW92ZS10by1maXJzdC1jaGFyYWN0ZXItb2YtbGluZS1hbmQtZG93bmAgKSBtb3Rpb24uIFdobyB1c2UgdGhpcz8/XG4gICAgXCJcIlwiXG4gIGtleW1hcFBUb1B1dFdpdGhBdXRvSW5kZW50OlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIFJlbWFwIGBwYCBhbmQgYFBgIHRvIGF1dG8gaW5kZW50IHZlcnNpb24uPGJyPlxuICAgIGBwYCByZW1hcHBlZCB0byBgcHV0LWJlZm9yZS13aXRoLWF1dG8taW5kZW50YCBmcm9tIG9yaWdpbmFsIGBwdXQtYmVmb3JlYDxicj5cbiAgICBgUGAgcmVtYXBwZWQgdG8gYHB1dC1hZnRlci13aXRoLWF1dG8taW5kZW50YCBmcm9tIG9yaWdpbmFsIGBwdXQtYWZ0ZXJgPGJyPlxuICAgIENvbmZsaWN0czogT3JpZ2luYWwgYHB1dC1hZnRlcmAgYW5kIGBwdXQtYmVmb3JlYCBiZWNvbWUgdW5hdmFpbGFibGUgdW5sZXNzIHlvdSBzZXQgZGlmZmVyZW50IGtleW1hcCBieSB5b3Vyc2VsZi5cbiAgICBcIlwiXCJcbiAga2V5bWFwQ0NUb0NoYW5nZUlubmVyU21hcnRXb3JkOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIENhbjogYGMgY2AgdG8gYGNoYW5nZSBpbm5lci1zbWFydC13b3JkYDxicj5cbiAgICBDb25mbGljdHM6IGBjIGNgKCBjaGFuZ2UtY3VycmVudC1saW5lICkga2V5c3Ryb2tlIHdoaWNoIGlzIGVxdWl2YWxlbnQgdG8gYFNgIG9yIGBjIGkgbGAgZXRjLlxuICAgIFwiXCJcIlxuICBrZXltYXBTZW1pY29sb25Ub0lubmVyQW55UGFpckluT3BlcmF0b3JQZW5kaW5nTW9kZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBDYW46IGBjIDtgIHRvIGBjaGFuZ2UgaW5uZXItYW55LXBhaXJgLCBDb25mbGljdHMgd2l0aCBvcmlnaW5hbCBgO2AoIGByZXBlYXQtZmluZGAgKSBtb3Rpb24uPGJyPlxuICAgIENvbmZsaWN0czogYDtgKCBgcmVwZWF0LWZpbmRgICkuXG4gICAgXCJcIlwiXG4gIGtleW1hcFNlbWljb2xvblRvSW5uZXJBbnlQYWlySW5WaXN1YWxNb2RlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIENhbjogYHYgO2AgdG8gYHNlbGVjdCBpbm5lci1hbnktcGFpcmAsIENvbmZsaWN0cyB3aXRoIG9yaWdpbmFsIGA7YCggYHJlcGVhdC1maW5kYCApIG1vdGlvbi48YnI+TFxuICAgIENvbmZsaWN0czogYDtgKCBgcmVwZWF0LWZpbmRgICkuXG4gICAgXCJcIlwiXG4gIGtleW1hcEJhY2tzbGFzaFRvSW5uZXJDb21tZW50T3JQYXJhZ3JhcGhXaGVuVG9nZ2xlTGluZUNvbW1lbnRzSXNQZW5kaW5nOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIENhbjogYGcgLyAvYCB0byBjb21tZW50LWluIGFscmVhZHkgY29tbWVudGVkIHJlZ2lvbiwgYGcgLyAvYCB0byBjb21tZW50LW91dCBwYXJhZ3JhcGguPGJyPlxuICAgIENvbmZsaWN0czogYC9gKCBgc2VhcmNoYCApIG1vdGlvbiBvbmx5IHdoZW4gYGcgL2AgaXMgcGVuZGluZy4geW91IG5vIGxvbmdlIGNhbiBgZyAvYCB3aXRoIHNlYXJjaC5cbiAgICBcIlwiXCJcbiAgc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkbzogdHJ1ZVxuICBzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvU3RyYXRlZ3k6XG4gICAgZGVmYXVsdDogJ3NtYXJ0J1xuICAgIGVudW06IFsnc21hcnQnLCAnc2ltcGxlJ11cbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgV2hlbiB5b3UgdGhpbmsgdW5kby9yZWRvIGN1cnNvciBwb3NpdGlvbiBoYXMgQlVHLCBzZXQgdGhpcyB0byBgc2ltcGxlYC48YnI+XG4gICAgYHNtYXJ0YDogR29vZCBhY2N1cmFjeSBidXQgaGF2ZSBjdXJzb3Itbm90LXVwZGF0ZWQtb24tZGlmZmVyZW50LWVkaXRvciBsaW1pdGF0aW9uPGJyPlxuICAgIGBzaW1wbGVgOiBBbHdheXMgd29yaywgYnV0IGFjY3VyYWN5IGlzIG5vdCBhcyBnb29kIGFzIGBzbWFydGAuPGJyPlxuICAgIFwiXCJcIlxuICBncm91cENoYW5nZXNXaGVuTGVhdmluZ0luc2VydE1vZGU6IHRydWVcbiAgdXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXI6IHRydWVcbiAgZG9udFVwZGF0ZVJlZ2lzdGVyT25DaGFuZ2VPclN1YnN0aXR1dGU6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgV2hlbiBzZXQgdG8gYHRydWVgIGFueSBgY2hhbmdlYCBvciBgc3Vic3RpdHV0ZWAgb3BlcmF0aW9uIG5vIGxvbmdlciB1cGRhdGUgcmVnaXN0ZXIgY29udGVudDxicj5cbiAgICBBZmZlY3RzIGBjYCwgYENgLCBgc2AsIGBTYCBvcGVyYXRvci5cbiAgICBcIlwiXCJcbiAgc3RhcnRJbkluc2VydE1vZGU6IGZhbHNlXG4gIHN0YXJ0SW5JbnNlcnRNb2RlU2NvcGVzOlxuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246ICdTdGFydCBpbiBpbnNlcnQtbW9kZSB3aGVuIGVkaXRvckVsZW1lbnQgbWF0Y2hlcyBzY29wZSdcbiAgY2xlYXJNdWx0aXBsZUN1cnNvcnNPbkVzY2FwZUluc2VydE1vZGU6IGZhbHNlXG4gIGF1dG9TZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uT25PcGVyYXRlOiB0cnVlXG4gIGF1dG9tYXRpY2FsbHlFc2NhcGVJbnNlcnRNb2RlT25BY3RpdmVQYW5lSXRlbUNoYW5nZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRXNjYXBlIGluc2VydC1tb2RlIG9uIHRhYiBzd2l0Y2gsIHBhbmUgc3dpdGNoJ1xuICB3cmFwTGVmdFJpZ2h0TW90aW9uOiBmYWxzZVxuICBudW1iZXJSZWdleDpcbiAgICBkZWZhdWx0OiAnLT9bMC05XSsnXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgICAgVXNlZCB0byBmaW5kIG51bWJlciBpbiBjdHJsLWEvY3RybC14Ljxicj5cbiAgICAgIFRvIGlnbm9yZSBcIi1cIihtaW51cykgY2hhciBpbiBzdHJpbmcgbGlrZSBcImlkZW50aWZpZXItMVwiIHVzZSBgKD86XFxcXEItKT9bMC05XStgXG4gICAgICBcIlwiXCJcbiAgY2xlYXJIaWdobGlnaHRTZWFyY2hPblJlc2V0Tm9ybWFsTW9kZTpcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGVzY3JpcHRpb246ICdDbGVhciBoaWdobGlnaHRTZWFyY2ggb24gYGVzY2FwZWAgaW4gbm9ybWFsLW1vZGUnXG4gIGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbk9uUmVzZXROb3JtYWxNb2RlOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogJ0NsZWFyIHBlcnNpc3RlbnRTZWxlY3Rpb24gb24gYGVzY2FwZWAgaW4gbm9ybWFsLW1vZGUnXG4gIGNoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZDpcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOiB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICAgIENvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIGNoYXJhY3Rlciwgd2hpY2ggYWRkIHNwYWNlIGFyb3VuZCBzdXJyb3VuZGVkIHRleHQuPGJyPlxuICAgICAgRm9yIHZpbS1zdXJyb3VuZCBjb21wYXRpYmxlIGJlaGF2aW9yLCBzZXQgYCgsIHssIFssIDxgLlxuICAgICAgXCJcIlwiXG4gIGlnbm9yZUNhc2VGb3JTZWFyY2g6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0ZvciBgL2AgYW5kIGA/YCdcbiAgdXNlU21hcnRjYXNlRm9yU2VhcmNoOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdGb3IgYC9gIGFuZCBgP2AuIE92ZXJyaWRlIGBpZ25vcmVDYXNlRm9yU2VhcmNoYCdcbiAgaWdub3JlQ2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdGb3IgYCpgIGFuZCBgI2AuJ1xuICB1c2VTbWFydGNhc2VGb3JTZWFyY2hDdXJyZW50V29yZDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRm9yIGAqYCBhbmQgYCNgLiBPdmVycmlkZSBgaWdub3JlQ2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkYCdcbiAgaGlnaGxpZ2h0U2VhcmNoOiB0cnVlXG4gIGhpZ2hsaWdodFNlYXJjaEV4Y2x1ZGVTY29wZXM6XG4gICAgZGVmYXVsdDogW11cbiAgICBpdGVtczogdHlwZTogJ3N0cmluZydcbiAgICBkZXNjcmlwdGlvbjogJ1N1cHByZXNzIGhpZ2hsaWdodFNlYXJjaCB3aGVuIGFueSBvZiB0aGVzZSBjbGFzc2VzIGFyZSBwcmVzZW50IGluIHRoZSBlZGl0b3InXG4gIGluY3JlbWVudGFsU2VhcmNoOiBmYWxzZVxuICBpbmNyZW1lbnRhbFNlYXJjaFZpc2l0RGlyZWN0aW9uOlxuICAgIGRlZmF1bHQ6ICdhYnNvbHV0ZSdcbiAgICBlbnVtOiBbJ2Fic29sdXRlJywgJ3JlbGF0aXZlJ11cbiAgICBkZXNjcmlwdGlvbjogXCJXaGVuIGByZWxhdGl2ZWAsIGB0YWJgLCBhbmQgYHNoaWZ0LXRhYmAgcmVzcGVjdCBzZWFyY2ggZGlyZWN0aW9uKCcvJyBvciAnPycpXCJcbiAgc3RheU9uVHJhbnNmb3JtU3RyaW5nOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRG9uJ3QgbW92ZSBjdXJzb3IgYWZ0ZXIgVHJhbnNmb3JtU3RyaW5nIGUuZyB1cHBlci1jYXNlLCBzdXJyb3VuZFwiXG4gIHN0YXlPbllhbms6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJEb24ndCBtb3ZlIGN1cnNvciBhZnRlciB5YW5rXCJcbiAgc3RheU9uRGVsZXRlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRG9uJ3QgbW92ZSBjdXJzb3IgYWZ0ZXIgZGVsZXRlXCJcbiAgc3RheU9uT2NjdXJyZW5jZTpcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGVzY3JpcHRpb246IFwiRG9uJ3QgbW92ZSBjdXJzb3Igd2hlbiBvcGVyYXRvciB3b3JrcyBvbiBvY2N1cnJlbmNlcyggd2hlbiBgdHJ1ZWAsIG92ZXJyaWRlIG9wZXJhdG9yIHNwZWNpZmljIGBzdGF5T25gIG9wdGlvbnMgKVwiXG4gIGtlZXBDb2x1bW5PblNlbGVjdFRleHRPYmplY3Q6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJLZWVwIGNvbHVtbiBvbiBzZWxlY3QgVGV4dE9iamVjdChQYXJhZ3JhcGgsIEluZGVudGF0aW9uLCBGb2xkLCBGdW5jdGlvbiwgRWRnZSlcIlxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9uVmVydGljYWxNb3Rpb246XG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICAgIEFsbW9zdCBlcXVpdmFsZW50IHRvIGBzdGFydG9mbGluZWAgcHVyZS1WaW0gb3B0aW9uLiBXaGVuIHRydWUsIG1vdmUgY3Vyc29yIHRvIGZpcnN0IGNoYXIuPGJyPlxuICAgICAgQWZmZWN0cyB0byBgY3RybC1mLCBiLCBkLCB1YCwgYEdgLCBgSGAsIGBNYCwgYExgLCBgZ2dgPGJyPlxuICAgICAgVW5saWtlIHB1cmUtVmltLCBgZGAsIGA8PGAsIGA+PmAgYXJlIG5vdCBhZmZlY3RlZCBieSB0aGlzIG9wdGlvbiwgdXNlIGluZGVwZW5kZW50IGBzdGF5T25gIG9wdGlvbnMuXG4gICAgICBcIlwiXCJcbiAgZmxhc2hPblVuZG9SZWRvOiB0cnVlXG4gIGZsYXNoT25Nb3ZlVG9PY2N1cnJlbmNlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiQWZmZWN0cyBub3JtYWwtbW9kZSdzIGB0YWJgLCBgc2hpZnQtdGFiYC5cIlxuICBmbGFzaE9uT3BlcmF0ZTogdHJ1ZVxuICBmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdDpcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOiB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlc2NyaXB0aW9uOiAnQ29tbWEgc2VwYXJhdGVkIGxpc3Qgb2Ygb3BlcmF0b3IgY2xhc3MgbmFtZSB0byBkaXNhYmxlIGZsYXNoIGUuZy4gXCJ5YW5rLCBhdXRvLWluZGVudFwiJ1xuICBmbGFzaE9uU2VhcmNoOiB0cnVlXG4gIGZsYXNoU2NyZWVuT25TZWFyY2hIYXNOb01hdGNoOiB0cnVlXG4gIHNob3dIb3ZlclNlYXJjaENvdW50ZXI6IGZhbHNlXG4gIHNob3dIb3ZlclNlYXJjaENvdW50ZXJEdXJhdGlvbjpcbiAgICBkZWZhdWx0OiA3MDBcbiAgICBkZXNjcmlwdGlvbjogXCJEdXJhdGlvbihtc2VjKSBmb3IgaG92ZXIgc2VhcmNoIGNvdW50ZXJcIlxuICBoaWRlVGFiQmFyT25NYXhpbWl6ZVBhbmU6XG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIGRlc2NyaXB0aW9uOiBcIklmIHNldCB0byBgZmFsc2VgLCB0YWIgc3RpbGwgdmlzaWJsZSBhZnRlciBtYXhpbWl6ZS1wYW5lKCBgY21kLWVudGVyYCApXCJcbiAgaGlkZVN0YXR1c0Jhck9uTWF4aW1pemVQYW5lOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgc21vb3RoU2Nyb2xsT25GdWxsU2Nyb2xsTW90aW9uOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRm9yIGBjdHJsLWZgIGFuZCBgY3RybC1iYFwiXG4gIHNtb290aFNjcm9sbE9uRnVsbFNjcm9sbE1vdGlvbkR1cmF0aW9uOlxuICAgIGRlZmF1bHQ6IDUwMFxuICAgIGRlc2NyaXB0aW9uOiBcIlNtb290aCBzY3JvbGwgZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzIGZvciBgY3RybC1mYCBhbmQgYGN0cmwtYmBcIlxuICBzbW9vdGhTY3JvbGxPbkhhbGZTY3JvbGxNb3Rpb246XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJGb3IgYGN0cmwtZGAgYW5kIGBjdHJsLXVgXCJcbiAgc21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uRHVyYXRpb246XG4gICAgZGVmYXVsdDogNTAwXG4gICAgZGVzY3JpcHRpb246IFwiU21vb3RoIHNjcm9sbCBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgZm9yIGBjdHJsLWRgIGFuZCBgY3RybC11YFwiXG4gIHN0YXR1c0Jhck1vZGVTdHJpbmdTdHlsZTpcbiAgICBkZWZhdWx0OiAnc2hvcnQnXG4gICAgZW51bTogWydzaG9ydCcsICdsb25nJ11cbiAgZGVidWc6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJbRGV2IHVzZV1cIlxuICBzdHJpY3RBc3NlcnRpb246XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJbRGV2IHVzZV0gdG8gY2F0Y2hlIHdpcmVkIHN0YXRlIGluIHZtcC1kZXYsIGVuYWJsZSB0aGlzIGlmIHlvdSB3YW50IGhlbHAgbWVcIlxuIl19
