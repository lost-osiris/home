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
      description: "Can: `_ i (` to replace inner-parenthesis with register's value<br>\nCan: `_ ;` to replace inner-any-pair if you enabled `keymapSemicolonToInnerAnyPairInOperatorPendingMode`<br>\nConflicts: `_`( `move-to-first-character-of-line-and-down` ) motion. Who use this??"
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
    maxFoldableIndentLevel: {
      "default": 20,
      minimum: 0,
      description: 'Folds which startRow exceed this level are not folded on `zm` and `zM`'
    },
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NldHRpbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsYUFBYyxPQUFBLENBQVEsTUFBUjs7RUFFZixTQUFBLEdBQVksU0FBQyxLQUFEO0FBQ1YsWUFBQSxLQUFBO0FBQUEsWUFDTyxNQUFNLENBQUMsU0FBUCxDQUFpQixLQUFqQixDQURQO2VBQ29DO0FBRHBDLFdBRU8sT0FBTyxLQUFQLEtBQWlCLFNBRnhCO2VBRXVDO0FBRnZDLFdBR08sT0FBTyxLQUFQLEtBQWlCLFFBSHhCO2VBR3NDO0FBSHRDLFlBSU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFkLENBSlA7ZUFJaUM7QUFKakM7RUFEVTs7RUFPTjt1QkFDSixnQkFBQSxHQUFrQixDQUNoQix3QkFEZ0I7O3VCQUdsQixzQkFBQSxHQUF3QixTQUFBO0FBQ3RCLFVBQUE7TUFBQSxnQkFBQSxHQUFtQixJQUFDLENBQUEsZ0JBQWdCLENBQUMsTUFBbEIsQ0FBeUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7aUJBQVcsS0FBQyxDQUFBLEdBQUQsQ0FBSyxLQUFMO1FBQVg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO01BQ25CLElBQVUsZ0JBQWdCLENBQUMsTUFBakIsS0FBMkIsQ0FBckM7QUFBQSxlQUFBOztNQUVBLE9BQUEsR0FBVSxDQUNMLElBQUMsQ0FBQSxLQUFGLEdBQVEsZ0NBREYsRUFFUix3Q0FGUTtBQUlWLFdBQUEsa0RBQUE7O1FBQUEsT0FBTyxDQUFDLElBQVIsQ0FBYSxLQUFBLEdBQU0sS0FBTixHQUFZLEdBQXpCO0FBQUE7YUFFQSxZQUFBLEdBQWUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4QixPQUFPLENBQUMsSUFBUixDQUFhLElBQWIsQ0FBOUIsRUFDYjtRQUFBLFdBQUEs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NkpBLHNDQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEdBQVQ7TUFDQSxXQUFBLEVBQWEsa0VBRGI7S0E5SkY7SUFnS0EsOEJBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSwyQkFEYjtLQWpLRjtJQW1LQSxzQ0FBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxHQUFUO01BQ0EsV0FBQSxFQUFhLGtFQURiO0tBcEtGO0lBc0tBLHdCQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE9BQVQ7TUFDQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsT0FBRCxFQUFVLE1BQVYsQ0FETjtLQXZLRjtJQXlLQSxLQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7TUFDQSxXQUFBLEVBQWEsV0FEYjtLQTFLRjtJQTRLQSxlQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7TUFDQSxXQUFBLEVBQWEsNkVBRGI7S0E3S0Y7R0FEbUI7QUF2R3JCIiwic291cmNlc0NvbnRlbnQiOlsie0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuaW5mZXJUeXBlID0gKHZhbHVlKSAtPlxuICBzd2l0Y2hcbiAgICB3aGVuIE51bWJlci5pc0ludGVnZXIodmFsdWUpIHRoZW4gJ2ludGVnZXInXG4gICAgd2hlbiB0eXBlb2YodmFsdWUpIGlzICdib29sZWFuJyB0aGVuICdib29sZWFuJ1xuICAgIHdoZW4gdHlwZW9mKHZhbHVlKSBpcyAnc3RyaW5nJyB0aGVuICdzdHJpbmcnXG4gICAgd2hlbiBBcnJheS5pc0FycmF5KHZhbHVlKSB0aGVuICdhcnJheSdcblxuY2xhc3MgU2V0dGluZ3NcbiAgZGVwcmVjYXRlZFBhcmFtczogW1xuICAgICdzaG93Q3Vyc29ySW5WaXN1YWxNb2RlJ1xuICBdXG4gIG5vdGlmeURlcHJlY2F0ZWRQYXJhbXM6IC0+XG4gICAgZGVwcmVjYXRlZFBhcmFtcyA9IEBkZXByZWNhdGVkUGFyYW1zLmZpbHRlcigocGFyYW0pID0+IEBoYXMocGFyYW0pKVxuICAgIHJldHVybiBpZiBkZXByZWNhdGVkUGFyYW1zLmxlbmd0aCBpcyAwXG5cbiAgICBjb250ZW50ID0gW1xuICAgICAgXCIje0BzY29wZX06IENvbmZpZyBvcHRpb25zIGRlcHJlY2F0ZWQuICBcIixcbiAgICAgIFwiUmVtb3ZlIGZyb20geW91ciBgY29ubmZpZy5jc29uYCBub3c/ICBcIlxuICAgIF1cbiAgICBjb250ZW50LnB1c2ggXCItIGAje3BhcmFtfWBcIiBmb3IgcGFyYW0gaW4gZGVwcmVjYXRlZFBhcmFtc1xuXG4gICAgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgY29udGVudC5qb2luKFwiXFxuXCIpLFxuICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICdSZW1vdmUgQWxsJ1xuICAgICAgICAgIG9uRGlkQ2xpY2s6ID0+XG4gICAgICAgICAgICBAZGVsZXRlKHBhcmFtKSBmb3IgcGFyYW0gaW4gZGVwcmVjYXRlZFBhcmFtc1xuICAgICAgICAgICAgbm90aWZpY2F0aW9uLmRpc21pc3MoKVxuICAgICAgICB9XG4gICAgICBdXG5cbiAgY29uc3RydWN0b3I6IChAc2NvcGUsIEBjb25maWcpIC0+XG4gICAgIyBBdXRvbWF0aWNhbGx5IGluZmVyIGFuZCBpbmplY3QgYHR5cGVgIG9mIGVhY2ggY29uZmlnIHBhcmFtZXRlci5cbiAgICAjIHNraXAgaWYgdmFsdWUgd2hpY2ggYWxlYWR5IGhhdmUgYHR5cGVgIGZpZWxkLlxuICAgICMgQWxzbyB0cmFuc2xhdGUgYmFyZSBgYm9vbGVhbmAgdmFsdWUgdG8ge2RlZmF1bHQ6IGBib29sZWFuYH0gb2JqZWN0XG4gICAgZm9yIGtleSBpbiBPYmplY3Qua2V5cyhAY29uZmlnKVxuICAgICAgaWYgdHlwZW9mKEBjb25maWdba2V5XSkgaXMgJ2Jvb2xlYW4nXG4gICAgICAgIEBjb25maWdba2V5XSA9IHtkZWZhdWx0OiBAY29uZmlnW2tleV19XG4gICAgICB1bmxlc3MgKHZhbHVlID0gQGNvbmZpZ1trZXldKS50eXBlP1xuICAgICAgICB2YWx1ZS50eXBlID0gaW5mZXJUeXBlKHZhbHVlLmRlZmF1bHQpXG5cbiAgICAjIFtDQVVUSU9OXSBpbmplY3Rpbmcgb3JkZXIgcHJvcGV0eSB0byBzZXQgb3JkZXIgc2hvd24gYXQgc2V0dGluZy12aWV3IE1VU1QtQ09NRS1MQVNULlxuICAgIGZvciBuYW1lLCBpIGluIE9iamVjdC5rZXlzKEBjb25maWcpXG4gICAgICBAY29uZmlnW25hbWVdLm9yZGVyID0gaVxuXG4gIGhhczogKHBhcmFtKSAtPlxuICAgIHBhcmFtIG9mIGF0b20uY29uZmlnLmdldChAc2NvcGUpXG5cbiAgZGVsZXRlOiAocGFyYW0pIC0+XG4gICAgQHNldChwYXJhbSwgdW5kZWZpbmVkKVxuXG4gIGdldDogKHBhcmFtKSAtPlxuICAgIGF0b20uY29uZmlnLmdldChcIiN7QHNjb3BlfS4je3BhcmFtfVwiKVxuXG4gIHNldDogKHBhcmFtLCB2YWx1ZSkgLT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCIje0BzY29wZX0uI3twYXJhbX1cIiwgdmFsdWUpXG5cbiAgdG9nZ2xlOiAocGFyYW0pIC0+XG4gICAgQHNldChwYXJhbSwgbm90IEBnZXQocGFyYW0pKVxuXG4gIG9ic2VydmU6IChwYXJhbSwgZm4pIC0+XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZShcIiN7QHNjb3BlfS4je3BhcmFtfVwiLCBmbilcblxuICBvYnNlcnZlQ29uZGl0aW9uYWxLZXltYXBzOiAtPlxuICAgIGNvbmRpdGlvbmFsS2V5bWFwcyA9XG4gICAgICBrZXltYXBVbmRlcnNjb3JlVG9SZXBsYWNlV2l0aFJlZ2lzdGVyOlxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnXyc6ICd2aW0tbW9kZS1wbHVzOnJlcGxhY2Utd2l0aC1yZWdpc3RlcidcbiAgICAgIGtleW1hcFBUb1B1dFdpdGhBdXRvSW5kZW50OlxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpOm5vdCgub3BlcmF0b3ItcGVuZGluZy1tb2RlKSc6XG4gICAgICAgICAgJ1AnOiAndmltLW1vZGUtcGx1czpwdXQtYmVmb3JlLXdpdGgtYXV0by1pbmRlbnQnXG4gICAgICAgICAgJ3AnOiAndmltLW1vZGUtcGx1czpwdXQtYWZ0ZXItd2l0aC1hdXRvLWluZGVudCdcbiAgICAgIGtleW1hcENDVG9DaGFuZ2VJbm5lclNtYXJ0V29yZDpcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5vcGVyYXRvci1wZW5kaW5nLW1vZGUuY2hhbmdlLXBlbmRpbmcnOlxuICAgICAgICAgICdjJzogJ3ZpbS1tb2RlLXBsdXM6aW5uZXItc21hcnQtd29yZCdcbiAgICAgIGtleW1hcFNlbWljb2xvblRvSW5uZXJBbnlQYWlySW5PcGVyYXRvclBlbmRpbmdNb2RlOlxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm9wZXJhdG9yLXBlbmRpbmctbW9kZSc6XG4gICAgICAgICAgJzsnOiAndmltLW1vZGUtcGx1czppbm5lci1hbnktcGFpcidcbiAgICAgIGtleW1hcFNlbWljb2xvblRvSW5uZXJBbnlQYWlySW5WaXN1YWxNb2RlOlxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLnZpc3VhbC1tb2RlJzpcbiAgICAgICAgICAnOyc6ICd2aW0tbW9kZS1wbHVzOmlubmVyLWFueS1wYWlyJ1xuICAgICAga2V5bWFwQmFja3NsYXNoVG9Jbm5lckNvbW1lbnRPclBhcmFncmFwaFdoZW5Ub2dnbGVMaW5lQ29tbWVudHNJc1BlbmRpbmc6XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMub3BlcmF0b3ItcGVuZGluZy1tb2RlLnRvZ2dsZS1saW5lLWNvbW1lbnRzLXBlbmRpbmcnOlxuICAgICAgICAgICcvJzogJ3ZpbS1tb2RlLXBsdXM6aW5uZXItY29tbWVudC1vci1wYXJhZ3JhcGgnXG5cbiAgICBvYnNlcnZlQ29uZGl0aW9uYWxLZXltYXAgPSAocGFyYW0pID0+XG4gICAgICBrZXltYXBTb3VyY2UgPSBcInZpbS1tb2RlLXBsdXMtY29uZGl0aW9uYWwta2V5bWFwOiN7cGFyYW19XCJcbiAgICAgIGRpc3Bvc2FibGUgPSBAb2JzZXJ2ZSBwYXJhbSwgKG5ld1ZhbHVlKSAtPlxuICAgICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICAgIGF0b20ua2V5bWFwcy5hZGQoa2V5bWFwU291cmNlLCBjb25kaXRpb25hbEtleW1hcHNbcGFyYW1dKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXRvbS5rZXltYXBzLnJlbW92ZUJpbmRpbmdzRnJvbVNvdXJjZShrZXltYXBTb3VyY2UpXG5cbiAgICAgIG5ldyBEaXNwb3NhYmxlIC0+XG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICAgIGF0b20ua2V5bWFwcy5yZW1vdmVCaW5kaW5nc0Zyb21Tb3VyY2Uoa2V5bWFwU291cmNlKVxuXG4gICAgIyBSZXR1cm4gZGlzcG9zYWxiZXMgdG8gZGlzcG9zZSBjb25maWcgb2JzZXJ2YXRpb24gYW5kIGNvbmRpdGlvbmFsIGtleW1hcC5cbiAgICByZXR1cm4gT2JqZWN0LmtleXMoY29uZGl0aW9uYWxLZXltYXBzKS5tYXAgKHBhcmFtKSAtPiBvYnNlcnZlQ29uZGl0aW9uYWxLZXltYXAocGFyYW0pXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNldHRpbmdzICd2aW0tbW9kZS1wbHVzJyxcbiAga2V5bWFwVW5kZXJzY29yZVRvUmVwbGFjZVdpdGhSZWdpc3RlcjpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBDYW46IGBfIGkgKGAgdG8gcmVwbGFjZSBpbm5lci1wYXJlbnRoZXNpcyB3aXRoIHJlZ2lzdGVyJ3MgdmFsdWU8YnI+XG4gICAgQ2FuOiBgXyA7YCB0byByZXBsYWNlIGlubmVyLWFueS1wYWlyIGlmIHlvdSBlbmFibGVkIGBrZXltYXBTZW1pY29sb25Ub0lubmVyQW55UGFpckluT3BlcmF0b3JQZW5kaW5nTW9kZWA8YnI+XG4gICAgQ29uZmxpY3RzOiBgX2AoIGBtb3ZlLXRvLWZpcnN0LWNoYXJhY3Rlci1vZi1saW5lLWFuZC1kb3duYCApIG1vdGlvbi4gV2hvIHVzZSB0aGlzPz9cbiAgICBcIlwiXCJcbiAga2V5bWFwUFRvUHV0V2l0aEF1dG9JbmRlbnQ6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgUmVtYXAgYHBgIGFuZCBgUGAgdG8gYXV0byBpbmRlbnQgdmVyc2lvbi48YnI+XG4gICAgYHBgIHJlbWFwcGVkIHRvIGBwdXQtYmVmb3JlLXdpdGgtYXV0by1pbmRlbnRgIGZyb20gb3JpZ2luYWwgYHB1dC1iZWZvcmVgPGJyPlxuICAgIGBQYCByZW1hcHBlZCB0byBgcHV0LWFmdGVyLXdpdGgtYXV0by1pbmRlbnRgIGZyb20gb3JpZ2luYWwgYHB1dC1hZnRlcmA8YnI+XG4gICAgQ29uZmxpY3RzOiBPcmlnaW5hbCBgcHV0LWFmdGVyYCBhbmQgYHB1dC1iZWZvcmVgIGJlY29tZSB1bmF2YWlsYWJsZSB1bmxlc3MgeW91IHNldCBkaWZmZXJlbnQga2V5bWFwIGJ5IHlvdXJzZWxmLlxuICAgIFwiXCJcIlxuICBrZXltYXBDQ1RvQ2hhbmdlSW5uZXJTbWFydFdvcmQ6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgQ2FuOiBgYyBjYCB0byBgY2hhbmdlIGlubmVyLXNtYXJ0LXdvcmRgPGJyPlxuICAgIENvbmZsaWN0czogYGMgY2AoIGNoYW5nZS1jdXJyZW50LWxpbmUgKSBrZXlzdHJva2Ugd2hpY2ggaXMgZXF1aXZhbGVudCB0byBgU2Agb3IgYGMgaSBsYCBldGMuXG4gICAgXCJcIlwiXG4gIGtleW1hcFNlbWljb2xvblRvSW5uZXJBbnlQYWlySW5PcGVyYXRvclBlbmRpbmdNb2RlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIENhbjogYGMgO2AgdG8gYGNoYW5nZSBpbm5lci1hbnktcGFpcmAsIENvbmZsaWN0cyB3aXRoIG9yaWdpbmFsIGA7YCggYHJlcGVhdC1maW5kYCApIG1vdGlvbi48YnI+XG4gICAgQ29uZmxpY3RzOiBgO2AoIGByZXBlYXQtZmluZGAgKS5cbiAgICBcIlwiXCJcbiAga2V5bWFwU2VtaWNvbG9uVG9Jbm5lckFueVBhaXJJblZpc3VhbE1vZGU6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgQ2FuOiBgdiA7YCB0byBgc2VsZWN0IGlubmVyLWFueS1wYWlyYCwgQ29uZmxpY3RzIHdpdGggb3JpZ2luYWwgYDtgKCBgcmVwZWF0LWZpbmRgICkgbW90aW9uLjxicj5MXG4gICAgQ29uZmxpY3RzOiBgO2AoIGByZXBlYXQtZmluZGAgKS5cbiAgICBcIlwiXCJcbiAga2V5bWFwQmFja3NsYXNoVG9Jbm5lckNvbW1lbnRPclBhcmFncmFwaFdoZW5Ub2dnbGVMaW5lQ29tbWVudHNJc1BlbmRpbmc6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgQ2FuOiBgZyAvIC9gIHRvIGNvbW1lbnQtaW4gYWxyZWFkeSBjb21tZW50ZWQgcmVnaW9uLCBgZyAvIC9gIHRvIGNvbW1lbnQtb3V0IHBhcmFncmFwaC48YnI+XG4gICAgQ29uZmxpY3RzOiBgL2AoIGBzZWFyY2hgICkgbW90aW9uIG9ubHkgd2hlbiBgZyAvYCBpcyBwZW5kaW5nLiB5b3Ugbm8gbG9uZ2UgY2FuIGBnIC9gIHdpdGggc2VhcmNoLlxuICAgIFwiXCJcIlxuICBzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvOiB0cnVlXG4gIHNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG9TdHJhdGVneTpcbiAgICBkZWZhdWx0OiAnc21hcnQnXG4gICAgZW51bTogWydzbWFydCcsICdzaW1wbGUnXVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBXaGVuIHlvdSB0aGluayB1bmRvL3JlZG8gY3Vyc29yIHBvc2l0aW9uIGhhcyBCVUcsIHNldCB0aGlzIHRvIGBzaW1wbGVgLjxicj5cbiAgICBgc21hcnRgOiBHb29kIGFjY3VyYWN5IGJ1dCBoYXZlIGN1cnNvci1ub3QtdXBkYXRlZC1vbi1kaWZmZXJlbnQtZWRpdG9yIGxpbWl0YXRpb248YnI+XG4gICAgYHNpbXBsZWA6IEFsd2F5cyB3b3JrLCBidXQgYWNjdXJhY3kgaXMgbm90IGFzIGdvb2QgYXMgYHNtYXJ0YC48YnI+XG4gICAgXCJcIlwiXG4gIGdyb3VwQ2hhbmdlc1doZW5MZWF2aW5nSW5zZXJ0TW9kZTogdHJ1ZVxuICB1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcjogdHJ1ZVxuICBkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBXaGVuIHNldCB0byBgdHJ1ZWAgYW55IGBjaGFuZ2VgIG9yIGBzdWJzdGl0dXRlYCBvcGVyYXRpb24gbm8gbG9uZ2VyIHVwZGF0ZSByZWdpc3RlciBjb250ZW50PGJyPlxuICAgIEFmZmVjdHMgYGNgLCBgQ2AsIGBzYCwgYFNgIG9wZXJhdG9yLlxuICAgIFwiXCJcIlxuICBzdGFydEluSW5zZXJ0TW9kZTogZmFsc2VcbiAgc3RhcnRJbkluc2VydE1vZGVTY29wZXM6XG4gICAgZGVmYXVsdDogW11cbiAgICBpdGVtczogdHlwZTogJ3N0cmluZydcbiAgICBkZXNjcmlwdGlvbjogJ1N0YXJ0IGluIGluc2VydC1tb2RlIHdoZW4gZWRpdG9yRWxlbWVudCBtYXRjaGVzIHNjb3BlJ1xuICBjbGVhck11bHRpcGxlQ3Vyc29yc09uRXNjYXBlSW5zZXJ0TW9kZTogZmFsc2VcbiAgYXV0b1NlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25Pbk9wZXJhdGU6IHRydWVcbiAgYXV0b21hdGljYWxseUVzY2FwZUluc2VydE1vZGVPbkFjdGl2ZVBhbmVJdGVtQ2hhbmdlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdFc2NhcGUgaW5zZXJ0LW1vZGUgb24gdGFiIHN3aXRjaCwgcGFuZSBzd2l0Y2gnXG4gIHdyYXBMZWZ0UmlnaHRNb3Rpb246IGZhbHNlXG4gIG51bWJlclJlZ2V4OlxuICAgIGRlZmF1bHQ6ICctP1swLTldKydcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgICBVc2VkIHRvIGZpbmQgbnVtYmVyIGluIGN0cmwtYS9jdHJsLXguPGJyPlxuICAgICAgVG8gaWdub3JlIFwiLVwiKG1pbnVzKSBjaGFyIGluIHN0cmluZyBsaWtlIFwiaWRlbnRpZmllci0xXCIgdXNlIGAoPzpcXFxcQi0pP1swLTldK2BcbiAgICAgIFwiXCJcIlxuICBjbGVhckhpZ2hsaWdodFNlYXJjaE9uUmVzZXROb3JtYWxNb2RlOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogJ0NsZWFyIGhpZ2hsaWdodFNlYXJjaCBvbiBgZXNjYXBlYCBpbiBub3JtYWwtbW9kZSdcbiAgY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uT25SZXNldE5vcm1hbE1vZGU6XG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIGRlc2NyaXB0aW9uOiAnQ2xlYXIgcGVyc2lzdGVudFNlbGVjdGlvbiBvbiBgZXNjYXBlYCBpbiBub3JtYWwtbW9kZSdcbiAgY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kOlxuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgICAgQ29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgY2hhcmFjdGVyLCB3aGljaCBhZGQgc3BhY2UgYXJvdW5kIHN1cnJvdW5kZWQgdGV4dC48YnI+XG4gICAgICBGb3IgdmltLXN1cnJvdW5kIGNvbXBhdGlibGUgYmVoYXZpb3IsIHNldCBgKCwgeywgWywgPGAuXG4gICAgICBcIlwiXCJcbiAgaWdub3JlQ2FzZUZvclNlYXJjaDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRm9yIGAvYCBhbmQgYD9gJ1xuICB1c2VTbWFydGNhc2VGb3JTZWFyY2g6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0ZvciBgL2AgYW5kIGA/YC4gT3ZlcnJpZGUgYGlnbm9yZUNhc2VGb3JTZWFyY2hgJ1xuICBpZ25vcmVDYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQ6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0ZvciBgKmAgYW5kIGAjYC4nXG4gIHVzZVNtYXJ0Y2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdGb3IgYCpgIGFuZCBgI2AuIE92ZXJyaWRlIGBpZ25vcmVDYXNlRm9yU2VhcmNoQ3VycmVudFdvcmRgJ1xuICBoaWdobGlnaHRTZWFyY2g6IHRydWVcbiAgaGlnaGxpZ2h0U2VhcmNoRXhjbHVkZVNjb3BlczpcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOiB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlc2NyaXB0aW9uOiAnU3VwcHJlc3MgaGlnaGxpZ2h0U2VhcmNoIHdoZW4gYW55IG9mIHRoZXNlIGNsYXNzZXMgYXJlIHByZXNlbnQgaW4gdGhlIGVkaXRvcidcbiAgaW5jcmVtZW50YWxTZWFyY2g6IGZhbHNlXG4gIGluY3JlbWVudGFsU2VhcmNoVmlzaXREaXJlY3Rpb246XG4gICAgZGVmYXVsdDogJ2Fic29sdXRlJ1xuICAgIGVudW06IFsnYWJzb2x1dGUnLCAncmVsYXRpdmUnXVxuICAgIGRlc2NyaXB0aW9uOiBcIldoZW4gYHJlbGF0aXZlYCwgYHRhYmAsIGFuZCBgc2hpZnQtdGFiYCByZXNwZWN0IHNlYXJjaCBkaXJlY3Rpb24oJy8nIG9yICc/JylcIlxuICBzdGF5T25UcmFuc2Zvcm1TdHJpbmc6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJEb24ndCBtb3ZlIGN1cnNvciBhZnRlciBUcmFuc2Zvcm1TdHJpbmcgZS5nIHVwcGVyLWNhc2UsIHN1cnJvdW5kXCJcbiAgc3RheU9uWWFuazpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIHlhbmtcIlxuICBzdGF5T25EZWxldGU6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJEb24ndCBtb3ZlIGN1cnNvciBhZnRlciBkZWxldGVcIlxuICBzdGF5T25PY2N1cnJlbmNlOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogXCJEb24ndCBtb3ZlIGN1cnNvciB3aGVuIG9wZXJhdG9yIHdvcmtzIG9uIG9jY3VycmVuY2VzKCB3aGVuIGB0cnVlYCwgb3ZlcnJpZGUgb3BlcmF0b3Igc3BlY2lmaWMgYHN0YXlPbmAgb3B0aW9ucyApXCJcbiAga2VlcENvbHVtbk9uU2VsZWN0VGV4dE9iamVjdDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIktlZXAgY29sdW1uIG9uIHNlbGVjdCBUZXh0T2JqZWN0KFBhcmFncmFwaCwgSW5kZW50YXRpb24sIEZvbGQsIEZ1bmN0aW9uLCBFZGdlKVwiXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT25WZXJ0aWNhbE1vdGlvbjpcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgICAgQWxtb3N0IGVxdWl2YWxlbnQgdG8gYHN0YXJ0b2ZsaW5lYCBwdXJlLVZpbSBvcHRpb24uIFdoZW4gdHJ1ZSwgbW92ZSBjdXJzb3IgdG8gZmlyc3QgY2hhci48YnI+XG4gICAgICBBZmZlY3RzIHRvIGBjdHJsLWYsIGIsIGQsIHVgLCBgR2AsIGBIYCwgYE1gLCBgTGAsIGBnZ2A8YnI+XG4gICAgICBVbmxpa2UgcHVyZS1WaW0sIGBkYCwgYDw8YCwgYD4+YCBhcmUgbm90IGFmZmVjdGVkIGJ5IHRoaXMgb3B0aW9uLCB1c2UgaW5kZXBlbmRlbnQgYHN0YXlPbmAgb3B0aW9ucy5cbiAgICAgIFwiXCJcIlxuICBmbGFzaE9uVW5kb1JlZG86IHRydWVcbiAgZmxhc2hPbk1vdmVUb09jY3VycmVuY2U6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJBZmZlY3RzIG5vcm1hbC1tb2RlJ3MgYHRhYmAsIGBzaGlmdC10YWJgLlwiXG4gIGZsYXNoT25PcGVyYXRlOiB0cnVlXG4gIGZsYXNoT25PcGVyYXRlQmxhY2tsaXN0OlxuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246ICdDb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBvcGVyYXRvciBjbGFzcyBuYW1lIHRvIGRpc2FibGUgZmxhc2ggZS5nLiBcInlhbmssIGF1dG8taW5kZW50XCInXG4gIGZsYXNoT25TZWFyY2g6IHRydWVcbiAgZmxhc2hTY3JlZW5PblNlYXJjaEhhc05vTWF0Y2g6IHRydWVcbiAgbWF4Rm9sZGFibGVJbmRlbnRMZXZlbDpcbiAgICBkZWZhdWx0OiAyMFxuICAgIG1pbmltdW06IDBcbiAgICBkZXNjcmlwdGlvbjogJ0ZvbGRzIHdoaWNoIHN0YXJ0Um93IGV4Y2VlZCB0aGlzIGxldmVsIGFyZSBub3QgZm9sZGVkIG9uIGB6bWAgYW5kIGB6TWAnXG4gIHNob3dIb3ZlclNlYXJjaENvdW50ZXI6IGZhbHNlXG4gIHNob3dIb3ZlclNlYXJjaENvdW50ZXJEdXJhdGlvbjpcbiAgICBkZWZhdWx0OiA3MDBcbiAgICBkZXNjcmlwdGlvbjogXCJEdXJhdGlvbihtc2VjKSBmb3IgaG92ZXIgc2VhcmNoIGNvdW50ZXJcIlxuICBoaWRlVGFiQmFyT25NYXhpbWl6ZVBhbmU6XG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIGRlc2NyaXB0aW9uOiBcIklmIHNldCB0byBgZmFsc2VgLCB0YWIgc3RpbGwgdmlzaWJsZSBhZnRlciBtYXhpbWl6ZS1wYW5lKCBgY21kLWVudGVyYCApXCJcbiAgaGlkZVN0YXR1c0Jhck9uTWF4aW1pemVQYW5lOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgc21vb3RoU2Nyb2xsT25GdWxsU2Nyb2xsTW90aW9uOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRm9yIGBjdHJsLWZgIGFuZCBgY3RybC1iYFwiXG4gIHNtb290aFNjcm9sbE9uRnVsbFNjcm9sbE1vdGlvbkR1cmF0aW9uOlxuICAgIGRlZmF1bHQ6IDUwMFxuICAgIGRlc2NyaXB0aW9uOiBcIlNtb290aCBzY3JvbGwgZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzIGZvciBgY3RybC1mYCBhbmQgYGN0cmwtYmBcIlxuICBzbW9vdGhTY3JvbGxPbkhhbGZTY3JvbGxNb3Rpb246XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJGb3IgYGN0cmwtZGAgYW5kIGBjdHJsLXVgXCJcbiAgc21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uRHVyYXRpb246XG4gICAgZGVmYXVsdDogNTAwXG4gICAgZGVzY3JpcHRpb246IFwiU21vb3RoIHNjcm9sbCBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgZm9yIGBjdHJsLWRgIGFuZCBgY3RybC11YFwiXG4gIHN0YXR1c0Jhck1vZGVTdHJpbmdTdHlsZTpcbiAgICBkZWZhdWx0OiAnc2hvcnQnXG4gICAgZW51bTogWydzaG9ydCcsICdsb25nJ11cbiAgZGVidWc6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJbRGV2IHVzZV1cIlxuICBzdHJpY3RBc3NlcnRpb246XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJbRGV2IHVzZV0gdG8gY2F0Y2hlIHdpcmVkIHN0YXRlIGluIHZtcC1kZXYsIGVuYWJsZSB0aGlzIGlmIHlvdSB3YW50IGhlbHAgbWVcIlxuIl19
