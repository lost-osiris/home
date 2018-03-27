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
    showCursorInVisualMode: true,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NldHRpbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsYUFBYyxPQUFBLENBQVEsTUFBUjs7RUFFZixTQUFBLEdBQVksU0FBQyxLQUFEO0FBQ1YsWUFBQSxLQUFBO0FBQUEsWUFDTyxNQUFNLENBQUMsU0FBUCxDQUFpQixLQUFqQixDQURQO2VBQ29DO0FBRHBDLFdBRU8sT0FBTyxLQUFQLEtBQWlCLFNBRnhCO2VBRXVDO0FBRnZDLFdBR08sT0FBTyxLQUFQLEtBQWlCLFFBSHhCO2VBR3NDO0FBSHRDLFlBSU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFkLENBSlA7ZUFJaUM7QUFKakM7RUFEVTs7RUFPTjtJQUNTLGtCQUFDLEtBQUQsRUFBUyxNQUFUO0FBSVgsVUFBQTtNQUpZLElBQUMsQ0FBQSxRQUFEO01BQVEsSUFBQyxDQUFBLFNBQUQ7QUFJcEI7QUFBQSxXQUFBLHFDQUFBOztRQUNFLElBQUcsT0FBTyxJQUFDLENBQUEsTUFBTyxDQUFBLEdBQUEsQ0FBZixLQUF3QixTQUEzQjtVQUNFLElBQUMsQ0FBQSxNQUFPLENBQUEsR0FBQSxDQUFSLEdBQWU7WUFBQyxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBQUMsQ0FBQSxNQUFPLENBQUEsR0FBQSxDQUFsQjtZQURqQjs7UUFFQSxJQUFPLHVDQUFQO1VBQ0UsS0FBSyxDQUFDLElBQU4sR0FBYSxTQUFBLENBQVUsS0FBSyxFQUFDLE9BQUQsRUFBZixFQURmOztBQUhGO0FBT0E7QUFBQSxXQUFBLGdEQUFBOztRQUNFLElBQUMsQ0FBQSxNQUFPLENBQUEsSUFBQSxDQUFLLENBQUMsS0FBZCxHQUFzQjtBQUR4QjtJQVhXOzt1QkFjYixHQUFBLEdBQUssU0FBQyxLQUFEO2FBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQW1CLElB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QSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQUFUO01BQ0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxNQUFWLENBRE47S0E1SkY7SUE4SkEsS0FBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUFUO01BQ0EsV0FBQSxFQUFhLFdBRGI7S0EvSkY7SUFpS0EsZUFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUFUO01BQ0EsV0FBQSxFQUFhLDZFQURiO0tBbEtGO0dBRG1CO0FBckVyQiIsInNvdXJjZXNDb250ZW50IjpbIntEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbmluZmVyVHlwZSA9ICh2YWx1ZSkgLT5cbiAgc3dpdGNoXG4gICAgd2hlbiBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSB0aGVuICdpbnRlZ2VyJ1xuICAgIHdoZW4gdHlwZW9mKHZhbHVlKSBpcyAnYm9vbGVhbicgdGhlbiAnYm9vbGVhbidcbiAgICB3aGVuIHR5cGVvZih2YWx1ZSkgaXMgJ3N0cmluZycgdGhlbiAnc3RyaW5nJ1xuICAgIHdoZW4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgdGhlbiAnYXJyYXknXG5cbmNsYXNzIFNldHRpbmdzXG4gIGNvbnN0cnVjdG9yOiAoQHNjb3BlLCBAY29uZmlnKSAtPlxuICAgICMgQXV0b21hdGljYWxseSBpbmZlciBhbmQgaW5qZWN0IGB0eXBlYCBvZiBlYWNoIGNvbmZpZyBwYXJhbWV0ZXIuXG4gICAgIyBza2lwIGlmIHZhbHVlIHdoaWNoIGFsZWFkeSBoYXZlIGB0eXBlYCBmaWVsZC5cbiAgICAjIEFsc28gdHJhbnNsYXRlIGJhcmUgYGJvb2xlYW5gIHZhbHVlIHRvIHtkZWZhdWx0OiBgYm9vbGVhbmB9IG9iamVjdFxuICAgIGZvciBrZXkgaW4gT2JqZWN0LmtleXMoQGNvbmZpZylcbiAgICAgIGlmIHR5cGVvZihAY29uZmlnW2tleV0pIGlzICdib29sZWFuJ1xuICAgICAgICBAY29uZmlnW2tleV0gPSB7ZGVmYXVsdDogQGNvbmZpZ1trZXldfVxuICAgICAgdW5sZXNzICh2YWx1ZSA9IEBjb25maWdba2V5XSkudHlwZT9cbiAgICAgICAgdmFsdWUudHlwZSA9IGluZmVyVHlwZSh2YWx1ZS5kZWZhdWx0KVxuXG4gICAgIyBbQ0FVVElPTl0gaW5qZWN0aW5nIG9yZGVyIHByb3BldHkgdG8gc2V0IG9yZGVyIHNob3duIGF0IHNldHRpbmctdmlldyBNVVNULUNPTUUtTEFTVC5cbiAgICBmb3IgbmFtZSwgaSBpbiBPYmplY3Qua2V5cyhAY29uZmlnKVxuICAgICAgQGNvbmZpZ1tuYW1lXS5vcmRlciA9IGlcblxuICBnZXQ6IChwYXJhbSkgLT5cbiAgICBhdG9tLmNvbmZpZy5nZXQoXCIje0BzY29wZX0uI3twYXJhbX1cIilcblxuICBzZXQ6IChwYXJhbSwgdmFsdWUpIC0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiI3tAc2NvcGV9LiN7cGFyYW19XCIsIHZhbHVlKVxuXG4gIHRvZ2dsZTogKHBhcmFtKSAtPlxuICAgIEBzZXQocGFyYW0sIG5vdCBAZ2V0KHBhcmFtKSlcblxuICBvYnNlcnZlOiAocGFyYW0sIGZuKSAtPlxuICAgIGF0b20uY29uZmlnLm9ic2VydmUoXCIje0BzY29wZX0uI3twYXJhbX1cIiwgZm4pXG5cbiAgb2JzZXJ2ZUNvbmRpdGlvbmFsS2V5bWFwczogLT5cbiAgICBjb25kaXRpb25hbEtleW1hcHMgPVxuICAgICAga2V5bWFwVW5kZXJzY29yZVRvUmVwbGFjZVdpdGhSZWdpc3RlcjpcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ18nOiAndmltLW1vZGUtcGx1czpyZXBsYWNlLXdpdGgtcmVnaXN0ZXInXG4gICAgICBrZXltYXBDQ1RvQ2hhbmdlSW5uZXJTbWFydFdvcmQ6XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMub3BlcmF0b3ItcGVuZGluZy1tb2RlLmNoYW5nZS1wZW5kaW5nJzpcbiAgICAgICAgICAnYyc6ICd2aW0tbW9kZS1wbHVzOmlubmVyLXNtYXJ0LXdvcmQnXG4gICAgICBrZXltYXBTZW1pY29sb25Ub0lubmVyQW55UGFpckluT3BlcmF0b3JQZW5kaW5nTW9kZTpcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5vcGVyYXRvci1wZW5kaW5nLW1vZGUnOlxuICAgICAgICAgICc7JzogJ3ZpbS1tb2RlLXBsdXM6aW5uZXItYW55LXBhaXInXG4gICAgICBrZXltYXBTZW1pY29sb25Ub0lubmVyQW55UGFpckluVmlzdWFsTW9kZTpcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy52aXN1YWwtbW9kZSc6XG4gICAgICAgICAgJzsnOiAndmltLW1vZGUtcGx1czppbm5lci1hbnktcGFpcidcbiAgICAgIGtleW1hcEJhY2tzbGFzaFRvSW5uZXJDb21tZW50T3JQYXJhZ3JhcGhXaGVuVG9nZ2xlTGluZUNvbW1lbnRzSXNQZW5kaW5nOlxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm9wZXJhdG9yLXBlbmRpbmctbW9kZS50b2dnbGUtbGluZS1jb21tZW50cy1wZW5kaW5nJzpcbiAgICAgICAgICAnLyc6ICd2aW0tbW9kZS1wbHVzOmlubmVyLWNvbW1lbnQtb3ItcGFyYWdyYXBoJ1xuXG4gICAgb2JzZXJ2ZUNvbmRpdGlvbmFsS2V5bWFwID0gKHBhcmFtKSA9PlxuICAgICAga2V5bWFwU291cmNlID0gXCJ2aW0tbW9kZS1wbHVzLWNvbmRpdGlvbmFsLWtleW1hcDoje3BhcmFtfVwiXG4gICAgICBkaXNwb3NhYmxlID0gQG9ic2VydmUgcGFyYW0sIChuZXdWYWx1ZSkgLT5cbiAgICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgICBhdG9tLmtleW1hcHMuYWRkKGtleW1hcFNvdXJjZSwgY29uZGl0aW9uYWxLZXltYXBzW3BhcmFtXSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGF0b20ua2V5bWFwcy5yZW1vdmVCaW5kaW5nc0Zyb21Tb3VyY2Uoa2V5bWFwU291cmNlKVxuXG4gICAgICBuZXcgRGlzcG9zYWJsZSAtPlxuICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgICBhdG9tLmtleW1hcHMucmVtb3ZlQmluZGluZ3NGcm9tU291cmNlKGtleW1hcFNvdXJjZSlcblxuICAgICMgUmV0dXJuIGRpc3Bvc2FsYmVzIHRvIGRpc3Bvc2UgY29uZmlnIG9ic2VydmF0aW9uIGFuZCBjb25kaXRpb25hbCBrZXltYXAuXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGNvbmRpdGlvbmFsS2V5bWFwcykubWFwIChwYXJhbSkgLT4gb2JzZXJ2ZUNvbmRpdGlvbmFsS2V5bWFwKHBhcmFtKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZXR0aW5ncyAndmltLW1vZGUtcGx1cycsXG4gIGtleW1hcFVuZGVyc2NvcmVUb1JlcGxhY2VXaXRoUmVnaXN0ZXI6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgQ2FuOiBgXyBpIChgIHRvIHJlcGxhY2UgaW5uZXItcGFyZW50aGVzaXMgd2l0aCByZWdpc3RlcidzIHZhbHVlPGJyPlxuICAgIENhbjogYF8gaSA7YCB0byByZXBsYWNlIGlubmVyLWFueS1wYWlyIGlmIHlvdSBlbmFibGVkIGBrZXltYXBTZW1pY29sb25Ub0lubmVyQW55UGFpckluT3BlcmF0b3JQZW5kaW5nTW9kZWA8YnI+XG4gICAgQ29uZmxpY3RzOiBgX2AoIGBtb3ZlLXRvLWZpcnN0LWNoYXJhY3Rlci1vZi1saW5lLWFuZC1kb3duYCApIG1vdGlvbi4gV2hvIHVzZSB0aGlzPz9cbiAgICBcIlwiXCJcbiAga2V5bWFwQ0NUb0NoYW5nZUlubmVyU21hcnRXb3JkOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIENhbjogYGMgY2AgdG8gYGNoYW5nZSBpbm5lci1zbWFydC13b3JkYDxicj5cbiAgICBDb25mbGljdHM6IGBjIGNgKCBjaGFuZ2UtY3VycmVudC1saW5lICkga2V5c3Ryb2tlIHdoaWNoIGlzIGVxdWl2YWxlbnQgdG8gYFNgIG9yIGBjIGkgbGAgZXRjLlxuICAgIFwiXCJcIlxuICBrZXltYXBTZW1pY29sb25Ub0lubmVyQW55UGFpckluT3BlcmF0b3JQZW5kaW5nTW9kZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBDYW46IGBjIDtgIHRvIGBjaGFuZ2UgaW5uZXItYW55LXBhaXJgLCBDb25mbGljdHMgd2l0aCBvcmlnaW5hbCBgO2AoIGByZXBlYXQtZmluZGAgKSBtb3Rpb24uPGJyPlxuICAgIENvbmZsaWN0czogYDtgKCBgcmVwZWF0LWZpbmRgICkuXG4gICAgXCJcIlwiXG4gIGtleW1hcFNlbWljb2xvblRvSW5uZXJBbnlQYWlySW5WaXN1YWxNb2RlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIENhbjogYHYgO2AgdG8gYHNlbGVjdCBpbm5lci1hbnktcGFpcmAsIENvbmZsaWN0cyB3aXRoIG9yaWdpbmFsIGA7YCggYHJlcGVhdC1maW5kYCApIG1vdGlvbi48YnI+TFxuICAgIENvbmZsaWN0czogYDtgKCBgcmVwZWF0LWZpbmRgICkuXG4gICAgXCJcIlwiXG4gIGtleW1hcEJhY2tzbGFzaFRvSW5uZXJDb21tZW50T3JQYXJhZ3JhcGhXaGVuVG9nZ2xlTGluZUNvbW1lbnRzSXNQZW5kaW5nOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIENhbjogYGcgLyAvYCB0byBjb21tZW50LWluIGFscmVhZHkgY29tbWVudGVkIHJlZ2lvbiwgYGcgLyAvYCB0byBjb21tZW50LW91dCBwYXJhZ3JhcGguPGJyPlxuICAgIENvbmZsaWN0czogYC9gKCBgc2VhcmNoYCApIG1vdGlvbiBvbmx5IHdoZW4gYGcgL2AgaXMgcGVuZGluZy4geW91IG5vIGxvbmdlIGNhbiBgZyAvYCB3aXRoIHNlYXJjaC5cbiAgICBcIlwiXCJcbiAgc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkbzogdHJ1ZVxuICBzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvU3RyYXRlZ3k6XG4gICAgZGVmYXVsdDogJ3NtYXJ0J1xuICAgIGVudW06IFsnc21hcnQnLCAnc2ltcGxlJ11cbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgV2hlbiB5b3UgdGhpbmsgdW5kby9yZWRvIGN1cnNvciBwb3NpdGlvbiBoYXMgQlVHLCBzZXQgdGhpcyB0byBgc2ltcGxlYC48YnI+XG4gICAgYHNtYXJ0YDogR29vZCBhY2N1cmFjeSBidXQgaGF2ZSBjdXJzb3Itbm90LXVwZGF0ZWQtb24tZGlmZmVyZW50LWVkaXRvciBsaW1pdGF0aW9uPGJyPlxuICAgIGBzaW1wbGVgOiBBbHdheXMgd29yaywgYnV0IGFjY3VyYWN5IGlzIG5vdCBhcyBnb29kIGFzIGBzbWFydGAuPGJyPlxuICAgIFwiXCJcIlxuICBncm91cENoYW5nZXNXaGVuTGVhdmluZ0luc2VydE1vZGU6IHRydWVcbiAgdXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXI6IHRydWVcbiAgZG9udFVwZGF0ZVJlZ2lzdGVyT25DaGFuZ2VPclN1YnN0aXR1dGU6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgV2hlbiBzZXQgdG8gYHRydWVgIGFueSBgY2hhbmdlYCBvciBgc3Vic3RpdHV0ZWAgb3BlcmF0aW9uIG5vIGxvbmdlciB1cGRhdGUgcmVnaXN0ZXIgY29udGVudDxicj5cbiAgICBBZmZlY3RzIGBjYCwgYENgLCBgc2AsIGBTYCBvcGVyYXRvci5cbiAgICBcIlwiXCJcbiAgc3RhcnRJbkluc2VydE1vZGU6IGZhbHNlXG4gIHN0YXJ0SW5JbnNlcnRNb2RlU2NvcGVzOlxuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246ICdTdGFydCBpbiBpbnNlcnQtbW9kZSB3aGVuIGVkaXRvckVsZW1lbnQgbWF0Y2hlcyBzY29wZSdcbiAgY2xlYXJNdWx0aXBsZUN1cnNvcnNPbkVzY2FwZUluc2VydE1vZGU6IGZhbHNlXG4gIGF1dG9TZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uT25PcGVyYXRlOiB0cnVlXG4gIGF1dG9tYXRpY2FsbHlFc2NhcGVJbnNlcnRNb2RlT25BY3RpdmVQYW5lSXRlbUNoYW5nZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRXNjYXBlIGluc2VydC1tb2RlIG9uIHRhYiBzd2l0Y2gsIHBhbmUgc3dpdGNoJ1xuICB3cmFwTGVmdFJpZ2h0TW90aW9uOiBmYWxzZVxuICBudW1iZXJSZWdleDpcbiAgICBkZWZhdWx0OiAnLT9bMC05XSsnXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgICAgVXNlZCB0byBmaW5kIG51bWJlciBpbiBjdHJsLWEvY3RybC14Ljxicj5cbiAgICAgIFRvIGlnbm9yZSBcIi1cIihtaW51cykgY2hhciBpbiBzdHJpbmcgbGlrZSBcImlkZW50aWZpZXItMVwiIHVzZSBgKD86XFxcXEItKT9bMC05XStgXG4gICAgICBcIlwiXCJcbiAgY2xlYXJIaWdobGlnaHRTZWFyY2hPblJlc2V0Tm9ybWFsTW9kZTpcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGVzY3JpcHRpb246ICdDbGVhciBoaWdobGlnaHRTZWFyY2ggb24gYGVzY2FwZWAgaW4gbm9ybWFsLW1vZGUnXG4gIGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbk9uUmVzZXROb3JtYWxNb2RlOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogJ0NsZWFyIHBlcnNpc3RlbnRTZWxlY3Rpb24gb24gYGVzY2FwZWAgaW4gbm9ybWFsLW1vZGUnXG4gIGNoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZDpcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOiB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICAgIENvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIGNoYXJhY3Rlciwgd2hpY2ggYWRkIHNwYWNlIGFyb3VuZCBzdXJyb3VuZGVkIHRleHQuPGJyPlxuICAgICAgRm9yIHZpbS1zdXJyb3VuZCBjb21wYXRpYmxlIGJlaGF2aW9yLCBzZXQgYCgsIHssIFssIDxgLlxuICAgICAgXCJcIlwiXG4gIHNob3dDdXJzb3JJblZpc3VhbE1vZGU6IHRydWVcbiAgaWdub3JlQ2FzZUZvclNlYXJjaDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRm9yIGAvYCBhbmQgYD9gJ1xuICB1c2VTbWFydGNhc2VGb3JTZWFyY2g6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0ZvciBgL2AgYW5kIGA/YC4gT3ZlcnJpZGUgYGlnbm9yZUNhc2VGb3JTZWFyY2hgJ1xuICBpZ25vcmVDYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQ6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0ZvciBgKmAgYW5kIGAjYC4nXG4gIHVzZVNtYXJ0Y2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdGb3IgYCpgIGFuZCBgI2AuIE92ZXJyaWRlIGBpZ25vcmVDYXNlRm9yU2VhcmNoQ3VycmVudFdvcmRgJ1xuICBoaWdobGlnaHRTZWFyY2g6IHRydWVcbiAgaGlnaGxpZ2h0U2VhcmNoRXhjbHVkZVNjb3BlczpcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOiB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlc2NyaXB0aW9uOiAnU3VwcHJlc3MgaGlnaGxpZ2h0U2VhcmNoIHdoZW4gYW55IG9mIHRoZXNlIGNsYXNzZXMgYXJlIHByZXNlbnQgaW4gdGhlIGVkaXRvcidcbiAgaW5jcmVtZW50YWxTZWFyY2g6IGZhbHNlXG4gIGluY3JlbWVudGFsU2VhcmNoVmlzaXREaXJlY3Rpb246XG4gICAgZGVmYXVsdDogJ2Fic29sdXRlJ1xuICAgIGVudW06IFsnYWJzb2x1dGUnLCAncmVsYXRpdmUnXVxuICAgIGRlc2NyaXB0aW9uOiBcIldoZW4gYHJlbGF0aXZlYCwgYHRhYmAsIGFuZCBgc2hpZnQtdGFiYCByZXNwZWN0IHNlYXJjaCBkaXJlY3Rpb24oJy8nIG9yICc/JylcIlxuICBzdGF5T25UcmFuc2Zvcm1TdHJpbmc6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJEb24ndCBtb3ZlIGN1cnNvciBhZnRlciBUcmFuc2Zvcm1TdHJpbmcgZS5nIHVwcGVyLWNhc2UsIHN1cnJvdW5kXCJcbiAgc3RheU9uWWFuazpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIHlhbmtcIlxuICBzdGF5T25EZWxldGU6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJEb24ndCBtb3ZlIGN1cnNvciBhZnRlciBkZWxldGVcIlxuICBzdGF5T25PY2N1cnJlbmNlOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogXCJEb24ndCBtb3ZlIGN1cnNvciB3aGVuIG9wZXJhdG9yIHdvcmtzIG9uIG9jY3VycmVuY2VzKCB3aGVuIGB0cnVlYCwgb3ZlcnJpZGUgb3BlcmF0b3Igc3BlY2lmaWMgYHN0YXlPbmAgb3B0aW9ucyApXCJcbiAga2VlcENvbHVtbk9uU2VsZWN0VGV4dE9iamVjdDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIktlZXAgY29sdW1uIG9uIHNlbGVjdCBUZXh0T2JqZWN0KFBhcmFncmFwaCwgSW5kZW50YXRpb24sIEZvbGQsIEZ1bmN0aW9uLCBFZGdlKVwiXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT25WZXJ0aWNhbE1vdGlvbjpcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgICAgQWxtb3N0IGVxdWl2YWxlbnQgdG8gYHN0YXJ0b2ZsaW5lYCBwdXJlLVZpbSBvcHRpb24uIFdoZW4gdHJ1ZSwgbW92ZSBjdXJzb3IgdG8gZmlyc3QgY2hhci48YnI+XG4gICAgICBBZmZlY3RzIHRvIGBjdHJsLWYsIGIsIGQsIHVgLCBgR2AsIGBIYCwgYE1gLCBgTGAsIGBnZ2A8YnI+XG4gICAgICBVbmxpa2UgcHVyZS1WaW0sIGBkYCwgYDw8YCwgYD4+YCBhcmUgbm90IGFmZmVjdGVkIGJ5IHRoaXMgb3B0aW9uLCB1c2UgaW5kZXBlbmRlbnQgYHN0YXlPbmAgb3B0aW9ucy5cbiAgICAgIFwiXCJcIlxuICBmbGFzaE9uVW5kb1JlZG86IHRydWVcbiAgZmxhc2hPbk1vdmVUb09jY3VycmVuY2U6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJBZmZlY3RzIG5vcm1hbC1tb2RlJ3MgYHRhYmAsIGBzaGlmdC10YWJgLlwiXG4gIGZsYXNoT25PcGVyYXRlOiB0cnVlXG4gIGZsYXNoT25PcGVyYXRlQmxhY2tsaXN0OlxuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246ICdDb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBvcGVyYXRvciBjbGFzcyBuYW1lIHRvIGRpc2FibGUgZmxhc2ggZS5nLiBcInlhbmssIGF1dG8taW5kZW50XCInXG4gIGZsYXNoT25TZWFyY2g6IHRydWVcbiAgZmxhc2hTY3JlZW5PblNlYXJjaEhhc05vTWF0Y2g6IHRydWVcbiAgc2hvd0hvdmVyU2VhcmNoQ291bnRlcjogZmFsc2VcbiAgc2hvd0hvdmVyU2VhcmNoQ291bnRlckR1cmF0aW9uOlxuICAgIGRlZmF1bHQ6IDcwMFxuICAgIGRlc2NyaXB0aW9uOiBcIkR1cmF0aW9uKG1zZWMpIGZvciBob3ZlciBzZWFyY2ggY291bnRlclwiXG4gIGhpZGVUYWJCYXJPbk1heGltaXplUGFuZTpcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGVzY3JpcHRpb246IFwiSWYgc2V0IHRvIGBmYWxzZWAsIHRhYiBzdGlsbCB2aXNpYmxlIGFmdGVyIG1heGltaXplLXBhbmUoIGBjbWQtZW50ZXJgIClcIlxuICBoaWRlU3RhdHVzQmFyT25NYXhpbWl6ZVBhbmU6XG4gICAgZGVmYXVsdDogdHJ1ZVxuICBzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb246XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJGb3IgYGN0cmwtZmAgYW5kIGBjdHJsLWJgXCJcbiAgc21vb3RoU2Nyb2xsT25GdWxsU2Nyb2xsTW90aW9uRHVyYXRpb246XG4gICAgZGVmYXVsdDogNTAwXG4gICAgZGVzY3JpcHRpb246IFwiU21vb3RoIHNjcm9sbCBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgZm9yIGBjdHJsLWZgIGFuZCBgY3RybC1iYFwiXG4gIHNtb290aFNjcm9sbE9uSGFsZlNjcm9sbE1vdGlvbjpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkZvciBgY3RybC1kYCBhbmQgYGN0cmwtdWBcIlxuICBzbW9vdGhTY3JvbGxPbkhhbGZTY3JvbGxNb3Rpb25EdXJhdGlvbjpcbiAgICBkZWZhdWx0OiA1MDBcbiAgICBkZXNjcmlwdGlvbjogXCJTbW9vdGggc2Nyb2xsIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyBmb3IgYGN0cmwtZGAgYW5kIGBjdHJsLXVgXCJcbiAgc3RhdHVzQmFyTW9kZVN0cmluZ1N0eWxlOlxuICAgIGRlZmF1bHQ6ICdzaG9ydCdcbiAgICBlbnVtOiBbJ3Nob3J0JywgJ2xvbmcnXVxuICBkZWJ1ZzpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIltEZXYgdXNlXVwiXG4gIHN0cmljdEFzc2VydGlvbjpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIltEZXYgdXNlXSB0byBjYXRjaGUgd2lyZWQgc3RhdGUgaW4gdm1wLWRldiwgZW5hYmxlIHRoaXMgaWYgeW91IHdhbnQgaGVscCBtZVwiXG4iXX0=
