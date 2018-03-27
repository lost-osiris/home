(function() {
  var TextData, dispatch, getView, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView;

  settings = require('../lib/settings');

  describe("Motion Search", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      jasmine.attachToDOM(getView(atom.workspace));
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
    });
    describe("the / keybinding", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        pane = {
          activate: jasmine.createSpy("activate")
        };
        set({
          text: "abc\ndef\nabc\ndef\n",
          cursor: [0, 0]
        });
        return spyOn(atom.workspace, 'getActivePane').andReturn(pane);
      });
      describe("as a motion", function() {
        it("moves the cursor to the specified search pattern", function() {
          ensure([
            '/', {
              search: 'def'
            }
          ], {
            cursor: [1, 0]
          });
          return expect(pane.activate).toHaveBeenCalled();
        });
        it("loops back around", function() {
          set({
            cursor: [3, 0]
          });
          return ensure([
            '/', {
              search: 'def'
            }
          ], {
            cursor: [1, 0]
          });
        });
        it("uses a valid regex as a regex", function() {
          ensure([
            '/', {
              search: '[abc]'
            }
          ], {
            cursor: [0, 1]
          });
          return ensure('n', {
            cursor: [0, 2]
          });
        });
        it("uses an invalid regex as a literal string", function() {
          set({
            text: "abc\n[abc]\n"
          });
          ensure([
            '/', {
              search: '[abc'
            }
          ], {
            cursor: [1, 0]
          });
          return ensure('n', {
            cursor: [1, 0]
          });
        });
        it("uses ? as a literal string", function() {
          set({
            text: "abc\n[a?c?\n"
          });
          ensure([
            '/', {
              search: '?'
            }
          ], {
            cursor: [1, 2]
          });
          return ensure('n', {
            cursor: [1, 4]
          });
        });
        it('works with selection in visual mode', function() {
          set({
            text: 'one two three'
          });
          ensure([
            'v /', {
              search: 'th'
            }
          ], {
            cursor: [0, 9]
          });
          return ensure('d', {
            text: 'hree'
          });
        });
        it('extends selection when repeating search in visual mode', function() {
          set({
            text: "line1\nline2\nline3"
          });
          ensure([
            'v /', {
              search: 'line'
            }
          ], {
            selectedBufferRange: [[0, 0], [1, 1]]
          });
          return ensure('n', {
            selectedBufferRange: [[0, 0], [2, 1]]
          });
        });
        it('searches to the correct column in visual linewise mode', function() {
          return ensure([
            'V /', {
              search: 'ef'
            }
          ], {
            selectedText: "abc\ndef\n",
            propertyHead: [1, 1],
            cursor: [2, 0],
            mode: ['visual', 'linewise']
          });
        });
        it('not extend linwise selection if search matches on same line', function() {
          set({
            text: "abc def\ndef\n"
          });
          return ensure([
            'V /', {
              search: 'ef'
            }
          ], {
            selectedText: "abc def\n"
          });
        });
        describe("case sensitivity", function() {
          beforeEach(function() {
            return set({
              text: "\nabc\nABC\n",
              cursor: [0, 0]
            });
          });
          it("works in case sensitive mode", function() {
            ensure([
              '/', {
                search: 'ABC'
              }
            ], {
              cursor: [2, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          it("works in case insensitive mode", function() {
            ensure([
              '/', {
                search: '\\cAbC'
              }
            ], {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          it("works in case insensitive mode wherever \\c is", function() {
            ensure([
              '/', {
                search: 'AbC\\c'
              }
            ], {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          describe("when ignoreCaseForSearch is enabled", function() {
            beforeEach(function() {
              return settings.set('ignoreCaseForSearch', true);
            });
            it("ignore case when search [case-1]", function() {
              ensure([
                '/', {
                  search: 'abc'
                }
              ], {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
            return it("ignore case when search [case-2]", function() {
              ensure([
                '/', {
                  search: 'ABC'
                }
              ], {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
          });
          return describe("when useSmartcaseForSearch is enabled", function() {
            beforeEach(function() {
              return settings.set('useSmartcaseForSearch', true);
            });
            it("ignore case when searh term includes A-Z", function() {
              ensure([
                '/', {
                  search: 'ABC'
                }
              ], {
                cursor: [2, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
            it("ignore case when searh term NOT includes A-Z regardress of `ignoreCaseForSearch`", function() {
              settings.set('ignoreCaseForSearch', false);
              ensure([
                '/', {
                  search: 'abc'
                }
              ], {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
            return it("ignore case when searh term NOT includes A-Z regardress of `ignoreCaseForSearch`", function() {
              settings.set('ignoreCaseForSearch', true);
              ensure([
                '/', {
                  search: 'abc'
                }
              ], {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
          });
        });
        describe("repeating", function() {
          return it("does nothing with no search history", function() {
            set({
              cursor: [0, 0]
            });
            ensure('n', {
              cursor: [0, 0]
            });
            set({
              cursor: [1, 1]
            });
            return ensure('n', {
              cursor: [1, 1]
            });
          });
        });
        describe("repeating with search history", function() {
          beforeEach(function() {
            return keystroke([
              '/', {
                search: 'def'
              }
            ]);
          });
          it("repeats previous search with /<enter>", function() {
            return ensure([
              '/', {
                search: ''
              }
            ], {
              cursor: [3, 0]
            });
          });
          it("repeats previous search with //", function() {
            return ensure([
              '/', {
                search: '/'
              }
            ], {
              cursor: [3, 0]
            });
          });
          describe("the n keybinding", function() {
            return it("repeats the last search", function() {
              return ensure('n', {
                cursor: [3, 0]
              });
            });
          });
          return describe("the N keybinding", function() {
            return it("repeats the last search backwards", function() {
              set({
                cursor: [0, 0]
              });
              ensure('N', {
                cursor: [3, 0]
              });
              return ensure('N', {
                cursor: [1, 0]
              });
            });
          });
        });
        return describe("composing", function() {
          it("composes with operators", function() {
            return ensure([
              'd /', {
                search: 'def'
              }
            ], {
              text: "def\nabc\ndef\n"
            });
          });
          return it("repeats correctly with operators", function() {
            return ensure([
              'd /', {
                search: 'def'
              }, '.'
            ], {
              text: "def\n"
            });
          });
        });
      });
      describe("when reversed as ?", function() {
        it("moves the cursor backwards to the specified search pattern", function() {
          return ensure([
            '?', {
              search: 'def'
            }
          ], {
            cursor: [3, 0]
          });
        });
        it("accepts / as a literal search pattern", function() {
          set({
            text: "abc\nd/f\nabc\nd/f\n",
            cursor: [0, 0]
          });
          ensure([
            '?', {
              search: '/'
            }
          ], {
            cursor: [3, 1]
          });
          return ensure([
            '?', {
              search: '/'
            }
          ], {
            cursor: [1, 1]
          });
        });
        return describe("repeating", function() {
          beforeEach(function() {
            return keystroke([
              '?', {
                search: 'def'
              }
            ]);
          });
          it("repeats previous search as reversed with ?<enter>", function() {
            return ensure([
              '?', {
                search: ''
              }
            ], {
              cursor: [1, 0]
            });
          });
          it("repeats previous search as reversed with ??", function() {
            return ensure([
              '?', {
                search: '?'
              }
            ], {
              cursor: [1, 0]
            });
          });
          describe('the n keybinding', function() {
            return it("repeats the last search backwards", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('n', {
                cursor: [3, 0]
              });
            });
          });
          return describe('the N keybinding', function() {
            return it("repeats the last search forwards", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('N', {
                cursor: [1, 0]
              });
            });
          });
        });
      });
      describe("using search history", function() {
        var ensureInputEditor, inputEditor;
        inputEditor = null;
        ensureInputEditor = function(command, arg) {
          var text;
          text = arg.text;
          dispatch(inputEditor, command);
          return expect(inputEditor.getModel().getText()).toEqual(text);
        };
        beforeEach(function() {
          ensure([
            '/', {
              search: 'def'
            }
          ], {
            cursor: [1, 0]
          });
          ensure([
            '/', {
              search: 'abc'
            }
          ], {
            cursor: [2, 0]
          });
          return inputEditor = vimState.searchInput.editorElement;
        });
        it("allows searching history in the search field", function() {
          keystroke('/');
          ensureInputEditor('core:move-up', {
            text: 'abc'
          });
          ensureInputEditor('core:move-up', {
            text: 'def'
          });
          return ensureInputEditor('core:move-up', {
            text: 'def'
          });
        });
        return it("resets the search field to empty when scrolling back", function() {
          keystroke('/');
          ensureInputEditor('core:move-up', {
            text: 'abc'
          });
          ensureInputEditor('core:move-up', {
            text: 'def'
          });
          ensureInputEditor('core:move-down', {
            text: 'abc'
          });
          return ensureInputEditor('core:move-down', {
            text: ''
          });
        });
      });
      return describe("highlightSearch", function() {
        var ensureHightlightSearch, textForMarker;
        textForMarker = function(marker) {
          return editor.getTextInBufferRange(marker.getBufferRange());
        };
        ensureHightlightSearch = function(options) {
          var markers, text;
          markers = vimState.highlightSearch.getMarkers();
          if (options.length != null) {
            expect(markers).toHaveLength(options.length);
          }
          if (options.text != null) {
            text = markers.map(function(marker) {
              return textForMarker(marker);
            });
            expect(text).toEqual(options.text);
          }
          if (options.mode != null) {
            return ensure({
              mode: options.mode
            });
          }
        };
        beforeEach(function() {
          jasmine.attachToDOM(getView(atom.workspace));
          settings.set('highlightSearch', true);
          expect(vimState.highlightSearch.hasMarkers()).toBe(false);
          return ensure([
            '/', {
              search: 'def'
            }
          ], {
            cursor: [1, 0]
          });
        });
        describe("clearHighlightSearch command", function() {
          return it("clear highlightSearch marker", function() {
            ensureHightlightSearch({
              length: 2,
              text: ["def", "def"],
              mode: 'normal'
            });
            dispatch(editorElement, 'vim-mode-plus:clear-highlight-search');
            return expect(vimState.highlightSearch.hasMarkers()).toBe(false);
          });
        });
        return describe("clearHighlightSearchOnResetNormalMode", function() {
          describe("when disabled", function() {
            return it("it won't clear highlightSearch", function() {
              settings.set('clearHighlightSearchOnResetNormalMode', false);
              ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
              ensure("escape", {
                mode: 'normal'
              });
              return ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
            });
          });
          return describe("when enabled", function() {
            return it("it clear highlightSearch on reset-normal-mode", function() {
              settings.set('clearHighlightSearchOnResetNormalMode', true);
              ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
              ensure("escape", {
                mode: 'normal'
              });
              expect(vimState.highlightSearch.hasMarkers()).toBe(false);
              return ensure({
                mode: 'normal'
              });
            });
          });
        });
      });
    });
    describe("IncrementalSearch", function() {
      beforeEach(function() {
        settings.set('incrementalSearch', true);
        return jasmine.attachToDOM(getView(atom.workspace));
      });
      describe("with multiple-cursors", function() {
        beforeEach(function() {
          return set({
            text: "0:    abc\n1:    abc\n2:    abc\n3:    abc",
            cursor: [[0, 0], [1, 0]]
          });
        });
        it("[forward] move each cursor to match", function() {
          return ensure([
            '/', {
              search: 'abc'
            }
          ], {
            cursor: [[0, 6], [1, 6]]
          });
        });
        it("[forward: count specified], move each cursor to match", function() {
          return ensure([
            '2 /', {
              search: 'abc'
            }
          ], {
            cursor: [[1, 6], [2, 6]]
          });
        });
        it("[backward] move each cursor to match", function() {
          return ensure([
            '?', {
              search: 'abc'
            }
          ], {
            cursor: [[3, 6], [0, 6]]
          });
        });
        return it("[backward: count specified] move each cursor to match", function() {
          return ensure([
            '2 ?', {
              search: 'abc'
            }
          ], {
            cursor: [[2, 6], [3, 6]]
          });
        });
      });
      return describe("blank input repeat last search", function() {
        beforeEach(function() {
          return set({
            text: "0:    abc\n1:    abc\n2:    abc\n3:    abc\n4:"
          });
        });
        it("Do nothing when search history is empty", function() {
          set({
            cursor: [2, 1]
          });
          ensure([
            '/', {
              search: ''
            }
          ], {
            cursor: [2, 1]
          });
          return ensure([
            '?', {
              search: ''
            }
          ], {
            cursor: [2, 1]
          });
        });
        it("Repeat forward direction", function() {
          set({
            cursor: [0, 0]
          });
          ensure([
            '/', {
              search: 'abc'
            }
          ], {
            cursor: [0, 6]
          });
          ensure([
            '/', {
              search: ''
            }
          ], {
            cursor: [1, 6]
          });
          return ensure([
            '2 /', {
              search: ''
            }
          ], {
            cursor: [3, 6]
          });
        });
        return it("Repeat backward direction", function() {
          set({
            cursor: [4, 0]
          });
          ensure([
            '?', {
              search: 'abc'
            }
          ], {
            cursor: [3, 6]
          });
          ensure([
            '?', {
              search: ''
            }
          ], {
            cursor: [2, 6]
          });
          return ensure([
            '2 ?', {
              search: ''
            }
          ], {
            cursor: [0, 6]
          });
        });
      });
    });
    describe("the * keybinding", function() {
      beforeEach(function() {
        return set({
          text: "abd\n@def\nabd\ndef\n",
          cursor: [0, 0]
        });
      });
      describe("as a motion", function() {
        it("moves cursor to next occurrence of word under cursor", function() {
          return ensure('*', {
            cursor: [2, 0]
          });
        });
        it("repeats with the n key", function() {
          ensure('*', {
            cursor: [2, 0]
          });
          return ensure('n', {
            cursor: [0, 0]
          });
        });
        it("doesn't move cursor unless next occurrence is the exact word (no partial matches)", function() {
          set({
            text: "abc\ndef\nghiabc\njkl\nabcdef",
            cursor: [0, 0]
          });
          return ensure('*', {
            cursor: [0, 0]
          });
        });
        describe("with words that contain 'non-word' characters", function() {
          it("skips non-word-char when picking cursor-word then place cursor to next occurrence of word", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursor: [1, 0]
            });
            return ensure('*', {
              cursor: [3, 1]
            });
          });
          it("doesn't move cursor unless next match has exact word ending", function() {
            set({
              text: "abc\n@def\nabc\n@def1\n",
              cursor: [1, 1]
            });
            return ensure('*', {
              cursor: [1, 1]
            });
          });
          return it("moves cursor to the start of valid word char", function() {
            set({
              text: "abc\ndef\nabc\n@def\n",
              cursor: [1, 0]
            });
            return ensure('*', {
              cursor: [3, 1]
            });
          });
        });
        describe("when cursor is on non-word char column", function() {
          return it("matches only the non-word char", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursor: [1, 0]
            });
            return ensure('*', {
              cursor: [3, 1]
            });
          });
        });
        describe("when cursor is not on a word", function() {
          return it("does a match with the next word", function() {
            set({
              text: "abc\na  @def\n abc\n @def",
              cursor: [1, 1]
            });
            return ensure('*', {
              cursor: [3, 2]
            });
          });
        });
        return describe("when cursor is at EOF", function() {
          return it("doesn't try to do any match", function() {
            set({
              text: "abc\n@def\nabc\n ",
              cursor: [3, 0]
            });
            return ensure('*', {
              cursor: [3, 0]
            });
          });
        });
      });
      return describe("caseSensitivity setting", function() {
        beforeEach(function() {
          return set({
            text: "abc\nABC\nabC\nabc\nABC",
            cursor: [0, 0]
          });
        });
        it("search case sensitively when `ignoreCaseForSearchCurrentWord` is false(=default)", function() {
          expect(settings.get('ignoreCaseForSearchCurrentWord')).toBe(false);
          ensure('*', {
            cursor: [3, 0]
          });
          return ensure('n', {
            cursor: [0, 0]
          });
        });
        it("search case insensitively when `ignoreCaseForSearchCurrentWord` true", function() {
          settings.set('ignoreCaseForSearchCurrentWord', true);
          ensure('*', {
            cursor: [1, 0]
          });
          ensure('n', {
            cursor: [2, 0]
          });
          ensure('n', {
            cursor: [3, 0]
          });
          return ensure('n', {
            cursor: [4, 0]
          });
        });
        return describe("useSmartcaseForSearchCurrentWord is enabled", function() {
          beforeEach(function() {
            return settings.set('useSmartcaseForSearchCurrentWord', true);
          });
          it("search case sensitively when enable and search term includes uppercase", function() {
            set({
              cursor: [1, 0]
            });
            ensure('*', {
              cursor: [4, 0]
            });
            return ensure('n', {
              cursor: [1, 0]
            });
          });
          return it("search case insensitively when enable and search term NOT includes uppercase", function() {
            set({
              cursor: [0, 0]
            });
            ensure('*', {
              cursor: [1, 0]
            });
            ensure('n', {
              cursor: [2, 0]
            });
            ensure('n', {
              cursor: [3, 0]
            });
            return ensure('n', {
              cursor: [4, 0]
            });
          });
        });
      });
    });
    describe("the hash keybinding", function() {
      describe("as a motion", function() {
        it("moves cursor to previous occurrence of word under cursor", function() {
          set({
            text: "abc\n@def\nabc\ndef\n",
            cursor: [2, 1]
          });
          return ensure('#', {
            cursor: [0, 0]
          });
        });
        it("repeats with n", function() {
          set({
            text: "abc\n@def\nabc\ndef\nabc\n",
            cursor: [2, 1]
          });
          ensure('#', {
            cursor: [0, 0]
          });
          ensure('n', {
            cursor: [4, 0]
          });
          return ensure('n', {
            cursor: [2, 0]
          });
        });
        it("doesn't move cursor unless next occurrence is the exact word (no partial matches)", function() {
          set({
            text: "abc\ndef\nghiabc\njkl\nabcdef",
            cursor: [0, 0]
          });
          return ensure('#', {
            cursor: [0, 0]
          });
        });
        describe("with words that containt 'non-word' characters", function() {
          it("moves cursor to next occurrence of word under cursor", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursor: [3, 0]
            });
            return ensure('#', {
              cursor: [1, 1]
            });
          });
          return it("moves cursor to the start of valid word char", function() {
            set({
              text: "abc\n@def\nabc\ndef\n",
              cursor: [3, 0]
            });
            return ensure('#', {
              cursor: [1, 1]
            });
          });
        });
        return describe("when cursor is on non-word char column", function() {
          return it("matches only the non-word char", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursor: [1, 0]
            });
            return ensure('*', {
              cursor: [3, 1]
            });
          });
        });
      });
      return describe("caseSensitivity setting", function() {
        beforeEach(function() {
          return set({
            text: "abc\nABC\nabC\nabc\nABC",
            cursor: [4, 0]
          });
        });
        it("search case sensitively when `ignoreCaseForSearchCurrentWord` is false(=default)", function() {
          expect(settings.get('ignoreCaseForSearchCurrentWord')).toBe(false);
          ensure('#', {
            cursor: [1, 0]
          });
          return ensure('n', {
            cursor: [4, 0]
          });
        });
        it("search case insensitively when `ignoreCaseForSearchCurrentWord` true", function() {
          settings.set('ignoreCaseForSearchCurrentWord', true);
          ensure('#', {
            cursor: [3, 0]
          });
          ensure('n', {
            cursor: [2, 0]
          });
          ensure('n', {
            cursor: [1, 0]
          });
          return ensure('n', {
            cursor: [0, 0]
          });
        });
        return describe("useSmartcaseForSearchCurrentWord is enabled", function() {
          beforeEach(function() {
            return settings.set('useSmartcaseForSearchCurrentWord', true);
          });
          it("search case sensitively when enable and search term includes uppercase", function() {
            set({
              cursor: [4, 0]
            });
            ensure('#', {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [4, 0]
            });
          });
          return it("search case insensitively when enable and search term NOT includes uppercase", function() {
            set({
              cursor: [0, 0]
            });
            ensure('#', {
              cursor: [4, 0]
            });
            ensure('n', {
              cursor: [3, 0]
            });
            ensure('n', {
              cursor: [2, 0]
            });
            ensure('n', {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [0, 0]
            });
          });
        });
      });
    });
    return describe('the % motion', function() {
      describe("Parenthesis", function() {
        beforeEach(function() {
          return set({
            text: "(___)"
          });
        });
        describe("as operator target", function() {
          beforeEach(function() {
            return set({
              text: "(_(_)_)"
            });
          });
          it('behave inclusively when is at open pair', function() {
            set({
              cursor: [0, 2]
            });
            return ensure('d %', {
              text: "(__)"
            });
          });
          return it('behave inclusively when is at open pair', function() {
            set({
              cursor: [0, 4]
            });
            return ensure('d %', {
              text: "(__)"
            });
          });
        });
        describe("cursor is at pair char", function() {
          it("cursor is at open pair, it move to closing pair", function() {
            set({
              cursor: [0, 0]
            });
            ensure('%', {
              cursor: [0, 4]
            });
            return ensure('%', {
              cursor: [0, 0]
            });
          });
          return it("cursor is at close pair, it move to open pair", function() {
            set({
              cursor: [0, 4]
            });
            ensure('%', {
              cursor: [0, 0]
            });
            return ensure('%', {
              cursor: [0, 4]
            });
          });
        });
        describe("cursor is enclosed by pair", function() {
          beforeEach(function() {
            return set({
              text: "(___)",
              cursor: [0, 2]
            });
          });
          return it("move to open pair", function() {
            return ensure('%', {
              cursor: [0, 0]
            });
          });
        });
        describe("cursor is bofore open pair", function() {
          beforeEach(function() {
            return set({
              text: "__(___)",
              cursor: [0, 0]
            });
          });
          return it("move to open pair", function() {
            return ensure('%', {
              cursor: [0, 6]
            });
          });
        });
        describe("cursor is after close pair", function() {
          beforeEach(function() {
            return set({
              text: "__(___)__",
              cursor: [0, 7]
            });
          });
          return it("fail to move", function() {
            return ensure('%', {
              cursor: [0, 7]
            });
          });
        });
        return describe("multi line", function() {
          beforeEach(function() {
            return set({
              text: "___\n___(__\n___\n___)"
            });
          });
          describe("when open and close pair is not at cursor line", function() {
            it("fail to move", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('%', {
                cursor: [0, 0]
              });
            });
            return it("fail to move", function() {
              set({
                cursor: [2, 0]
              });
              return ensure('%', {
                cursor: [2, 0]
              });
            });
          });
          describe("when open pair is forwarding to cursor in same row", function() {
            return it("move to closing pair", function() {
              set({
                cursor: [1, 0]
              });
              return ensure('%', {
                cursor: [3, 3]
              });
            });
          });
          describe("when cursor position is greater than open pair", function() {
            return it("fail to move", function() {
              set({
                cursor: [1, 4]
              });
              return ensure('%', {
                cursor: [1, 4]
              });
            });
          });
          return describe("when close pair is forwarding to cursor in same row", function() {
            return it("move to closing pair", function() {
              set({
                cursor: [3, 0]
              });
              return ensure('%', {
                cursor: [1, 3]
              });
            });
          });
        });
      });
      describe("CurlyBracket", function() {
        beforeEach(function() {
          return set({
            text: "{___}"
          });
        });
        it("cursor is at open pair, it move to closing pair", function() {
          set({
            cursor: [0, 0]
          });
          ensure('%', {
            cursor: [0, 4]
          });
          return ensure('%', {
            cursor: [0, 0]
          });
        });
        return it("cursor is at close pair, it move to open pair", function() {
          set({
            cursor: [0, 4]
          });
          ensure('%', {
            cursor: [0, 0]
          });
          return ensure('%', {
            cursor: [0, 4]
          });
        });
      });
      describe("SquareBracket", function() {
        beforeEach(function() {
          return set({
            text: "[___]"
          });
        });
        it("cursor is at open pair, it move to closing pair", function() {
          set({
            cursor: [0, 0]
          });
          ensure('%', {
            cursor: [0, 4]
          });
          return ensure('%', {
            cursor: [0, 0]
          });
        });
        return it("cursor is at close pair, it move to open pair", function() {
          set({
            cursor: [0, 4]
          });
          ensure('%', {
            cursor: [0, 0]
          });
          return ensure('%', {
            cursor: [0, 4]
          });
        });
      });
      describe("complex situation", function() {
        beforeEach(function() {
          return set({
            text: "(_____)__{__[___]__}\n_"
          });
        });
        it('move to closing pair which open pair come first', function() {
          set({
            cursor: [0, 7]
          });
          ensure('%', {
            cursor: [0, 19]
          });
          set({
            cursor: [0, 10]
          });
          return ensure('%', {
            cursor: [0, 16]
          });
        });
        return it('enclosing pair is prioritized over forwarding range', function() {
          set({
            cursor: [0, 2]
          });
          return ensure('%', {
            cursor: [0, 0]
          });
        });
      });
      return describe("complex situation with html tag", function() {
        beforeEach(function() {
          return set({
            text: "<div>\n  <span>\n    some text\n  </span>\n</div>"
          });
        });
        return it('move to pair tag only when cursor is on open or close tag but not on AngleBracket(<, >)', function() {
          set({
            cursor: [0, 1]
          });
          ensure('%', {
            cursor: [4, 1]
          });
          set({
            cursor: [0, 2]
          });
          ensure('%', {
            cursor: [4, 1]
          });
          set({
            cursor: [0, 3]
          });
          ensure('%', {
            cursor: [4, 1]
          });
          set({
            cursor: [4, 1]
          });
          ensure('%', {
            cursor: [0, 1]
          });
          set({
            cursor: [4, 2]
          });
          ensure('%', {
            cursor: [0, 1]
          });
          set({
            cursor: [4, 3]
          });
          ensure('%', {
            cursor: [0, 1]
          });
          set({
            cursor: [4, 4]
          });
          return ensure('%', {
            cursor: [0, 1]
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9tb3Rpb24tc2VhcmNoLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUE2QyxPQUFBLENBQVEsZUFBUixDQUE3QyxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0IsdUJBQXhCLEVBQWtDOztFQUNsQyxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUE7QUFDeEIsUUFBQTtJQUFBLE9BQTRELEVBQTVELEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsbUJBQWQsRUFBeUIsZ0JBQXpCLEVBQWlDLHVCQUFqQyxFQUFnRDtJQUVoRCxVQUFBLENBQVcsU0FBQTtNQUNULE9BQU8sQ0FBQyxXQUFSLENBQW9CLE9BQUEsQ0FBUSxJQUFJLENBQUMsU0FBYixDQUFwQjthQUNBLFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxJQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGNBQUQsRUFBTSxvQkFBTixFQUFjLDBCQUFkLEVBQTJCO01BSGpCLENBQVo7SUFGUyxDQUFYO0lBT0EsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7QUFDM0IsVUFBQTtNQUFBLElBQUEsR0FBTztNQUVQLFVBQUEsQ0FBVyxTQUFBO1FBQ1QsSUFBQSxHQUFPO1VBQUMsUUFBQSxFQUFVLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFVBQWxCLENBQVg7O1FBQ1AsR0FBQSxDQUNFO1VBQUEsSUFBQSxFQUFNLHNCQUFOO1VBTUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FOUjtTQURGO2VBUUEsS0FBQSxDQUFNLElBQUksQ0FBQyxTQUFYLEVBQXNCLGVBQXRCLENBQXNDLENBQUMsU0FBdkMsQ0FBaUQsSUFBakQ7TUFWUyxDQUFY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e2dldFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGEsIGdldFZpZXd9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIk1vdGlvbiBTZWFyY2hcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgamFzbWluZS5hdHRhY2hUb0RPTShnZXRWaWV3KGF0b20ud29ya3NwYWNlKSlcbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIF92aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlICMgdG8gcmVmZXIgYXMgdmltU3RhdGUgbGF0ZXIuXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSBfdmltXG5cbiAgZGVzY3JpYmUgXCJ0aGUgLyBrZXliaW5kaW5nXCIsIC0+XG4gICAgcGFuZSA9IG51bGxcblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHBhbmUgPSB7YWN0aXZhdGU6IGphc21pbmUuY3JlYXRlU3B5KFwiYWN0aXZhdGVcIil9XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIGRlZlxuICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICBkZWZcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnZ2V0QWN0aXZlUGFuZScpLmFuZFJldHVybihwYW5lKVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBzcGVjaWZpZWQgc2VhcmNoIHBhdHRlcm5cIiwgLT5cbiAgICAgICAgZW5zdXJlIFsnLycsIHNlYXJjaDogJ2RlZiddLFxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGV4cGVjdChwYW5lLmFjdGl2YXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgICAgaXQgXCJsb29wcyBiYWNrIGFyb3VuZFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgZW5zdXJlIFsnLycsIHNlYXJjaDogJ2RlZiddLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBpdCBcInVzZXMgYSB2YWxpZCByZWdleCBhcyBhIHJlZ2V4XCIsIC0+XG4gICAgICAgICMgQ3ljbGUgdGhyb3VnaCB0aGUgJ2FiYycgb24gdGhlIGZpcnN0IGxpbmUgd2l0aCBhIGNoYXJhY3RlciBwYXR0ZXJuXG4gICAgICAgIGVuc3VyZSBbJy8nLCBzZWFyY2g6ICdbYWJjXSddLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBpdCBcInVzZXMgYW4gaW52YWxpZCByZWdleCBhcyBhIGxpdGVyYWwgc3RyaW5nXCIsIC0+XG4gICAgICAgICMgR28gc3RyYWlnaHQgdG8gdGhlIGxpdGVyYWwgW2FiY1xuICAgICAgICBzZXQgdGV4dDogXCJhYmNcXG5bYWJjXVxcblwiXG4gICAgICAgIGVuc3VyZSBbJy8nLCBzZWFyY2g6ICdbYWJjJ10sIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGl0IFwidXNlcyA/IGFzIGEgbGl0ZXJhbCBzdHJpbmdcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiYWJjXFxuW2E/Yz9cXG5cIlxuICAgICAgICBlbnN1cmUgWycvJywgc2VhcmNoOiAnPyddLCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsxLCA0XVxuXG4gICAgICBpdCAnd29ya3Mgd2l0aCBzZWxlY3Rpb24gaW4gdmlzdWFsIG1vZGUnLCAtPlxuICAgICAgICBzZXQgdGV4dDogJ29uZSB0d28gdGhyZWUnXG4gICAgICAgIGVuc3VyZSBbJ3YgLycsIHNlYXJjaDogJ3RoJ10sIGN1cnNvcjogWzAsIDldXG4gICAgICAgIGVuc3VyZSAnZCcsIHRleHQ6ICdocmVlJ1xuXG4gICAgICBpdCAnZXh0ZW5kcyBzZWxlY3Rpb24gd2hlbiByZXBlYXRpbmcgc2VhcmNoIGluIHZpc3VhbCBtb2RlJywgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGxpbmUxXG4gICAgICAgICAgbGluZTJcbiAgICAgICAgICBsaW5lM1xuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGVuc3VyZSBbJ3YgLycsIHNlYXJjaDogJ2xpbmUnXSxcbiAgICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzAsIDBdLCBbMSwgMV1dXG4gICAgICAgIGVuc3VyZSAnbicsXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1swLCAwXSwgWzIsIDFdXVxuXG4gICAgICBpdCAnc2VhcmNoZXMgdG8gdGhlIGNvcnJlY3QgY29sdW1uIGluIHZpc3VhbCBsaW5ld2lzZSBtb2RlJywgLT5cbiAgICAgICAgZW5zdXJlIFsnViAvJywgc2VhcmNoOiAnZWYnXSxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiYWJjXFxuZGVmXFxuXCIsXG4gICAgICAgICAgcHJvcGVydHlIZWFkOiBbMSwgMV1cbiAgICAgICAgICBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cblxuICAgICAgaXQgJ25vdCBleHRlbmQgbGlud2lzZSBzZWxlY3Rpb24gaWYgc2VhcmNoIG1hdGNoZXMgb24gc2FtZSBsaW5lJywgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGFiYyBkZWZcbiAgICAgICAgICBkZWZcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFsnViAvJywgc2VhcmNoOiAnZWYnXSxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiYWJjIGRlZlxcblwiLFxuXG4gICAgICBkZXNjcmliZSBcImNhc2Ugc2Vuc2l0aXZpdHlcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcXG5hYmNcXG5BQkNcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBpdCBcIndvcmtzIGluIGNhc2Ugc2Vuc2l0aXZlIG1vZGVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgWycvJywgc2VhcmNoOiAnQUJDJ10sIGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgICBpdCBcIndvcmtzIGluIGNhc2UgaW5zZW5zaXRpdmUgbW9kZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBbJy8nLCBzZWFyY2g6ICdcXFxcY0FiQyddLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgICAgaXQgXCJ3b3JrcyBpbiBjYXNlIGluc2Vuc2l0aXZlIG1vZGUgd2hlcmV2ZXIgXFxcXGMgaXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgWycvJywgc2VhcmNoOiAnQWJDXFxcXGMnXSwgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICAgIGRlc2NyaWJlIFwid2hlbiBpZ25vcmVDYXNlRm9yU2VhcmNoIGlzIGVuYWJsZWRcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXR0aW5ncy5zZXQgJ2lnbm9yZUNhc2VGb3JTZWFyY2gnLCB0cnVlXG5cbiAgICAgICAgICBpdCBcImlnbm9yZSBjYXNlIHdoZW4gc2VhcmNoIFtjYXNlLTFdXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgWycvJywgc2VhcmNoOiAnYWJjJ10sIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICAgICAgaXQgXCJpZ25vcmUgY2FzZSB3aGVuIHNlYXJjaCBbY2FzZS0yXVwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlIFsnLycsIHNlYXJjaDogJ0FCQyddLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgICBkZXNjcmliZSBcIndoZW4gdXNlU21hcnRjYXNlRm9yU2VhcmNoIGlzIGVuYWJsZWRcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXR0aW5ncy5zZXQgJ3VzZVNtYXJ0Y2FzZUZvclNlYXJjaCcsIHRydWVcblxuICAgICAgICAgIGl0IFwiaWdub3JlIGNhc2Ugd2hlbiBzZWFyaCB0ZXJtIGluY2x1ZGVzIEEtWlwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlIFsnLycsIHNlYXJjaDogJ0FCQyddLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgICAgIGl0IFwiaWdub3JlIGNhc2Ugd2hlbiBzZWFyaCB0ZXJtIE5PVCBpbmNsdWRlcyBBLVogcmVnYXJkcmVzcyBvZiBgaWdub3JlQ2FzZUZvclNlYXJjaGBcIiwgLT5cbiAgICAgICAgICAgIHNldHRpbmdzLnNldCAnaWdub3JlQ2FzZUZvclNlYXJjaCcsIGZhbHNlICMgZGVmYXVsdFxuICAgICAgICAgICAgZW5zdXJlIFsnLycsIHNlYXJjaDogJ2FiYyddLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgICAgIGl0IFwiaWdub3JlIGNhc2Ugd2hlbiBzZWFyaCB0ZXJtIE5PVCBpbmNsdWRlcyBBLVogcmVnYXJkcmVzcyBvZiBgaWdub3JlQ2FzZUZvclNlYXJjaGBcIiwgLT5cbiAgICAgICAgICAgIHNldHRpbmdzLnNldCAnaWdub3JlQ2FzZUZvclNlYXJjaCcsIHRydWUgIyBkZWZhdWx0XG4gICAgICAgICAgICBlbnN1cmUgWycvJywgc2VhcmNoOiAnYWJjJ10sIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICBkZXNjcmliZSBcInJlcGVhdGluZ1wiLCAtPlxuICAgICAgICBpdCBcImRvZXMgbm90aGluZyB3aXRoIG5vIHNlYXJjaCBoaXN0b3J5XCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsxLCAxXVxuXG4gICAgICBkZXNjcmliZSBcInJlcGVhdGluZyB3aXRoIHNlYXJjaCBoaXN0b3J5XCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBrZXlzdHJva2UgWycvJywgc2VhcmNoOiAnZGVmJ11cblxuICAgICAgICBpdCBcInJlcGVhdHMgcHJldmlvdXMgc2VhcmNoIHdpdGggLzxlbnRlcj5cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgWycvJywgc2VhcmNoOiAnJ10sIGN1cnNvcjogWzMsIDBdXG5cbiAgICAgICAgaXQgXCJyZXBlYXRzIHByZXZpb3VzIHNlYXJjaCB3aXRoIC8vXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFsnLycsIHNlYXJjaDogJy8nXSwgY3Vyc29yOiBbMywgMF1cblxuICAgICAgICBkZXNjcmliZSBcInRoZSBuIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgICAgICBpdCBcInJlcGVhdHMgdGhlIGxhc3Qgc2VhcmNoXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFszLCAwXVxuXG4gICAgICAgIGRlc2NyaWJlIFwidGhlIE4ga2V5YmluZGluZ1wiLCAtPlxuICAgICAgICAgIGl0IFwicmVwZWF0cyB0aGUgbGFzdCBzZWFyY2ggYmFja3dhcmRzXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAnTicsIGN1cnNvcjogWzMsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ04nLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImNvbXBvc2luZ1wiLCAtPlxuICAgICAgICBpdCBcImNvbXBvc2VzIHdpdGggb3BlcmF0b3JzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFsnZCAvJywgc2VhcmNoOiAnZGVmJ10sIHRleHQ6IFwiZGVmXFxuYWJjXFxuZGVmXFxuXCJcblxuICAgICAgICBpdCBcInJlcGVhdHMgY29ycmVjdGx5IHdpdGggb3BlcmF0b3JzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFsnZCAvJywgc2VhcmNoOiAnZGVmJywgJy4nXSxcbiAgICAgICAgICAgIHRleHQ6IFwiZGVmXFxuXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiByZXZlcnNlZCBhcyA/XCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgYmFja3dhcmRzIHRvIHRoZSBzcGVjaWZpZWQgc2VhcmNoIHBhdHRlcm5cIiwgLT5cbiAgICAgICAgZW5zdXJlIFsnPycsIHNlYXJjaDogJ2RlZiddLCBjdXJzb3I6IFszLCAwXVxuXG4gICAgICBpdCBcImFjY2VwdHMgLyBhcyBhIGxpdGVyYWwgc2VhcmNoIHBhdHRlcm5cIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJhYmNcXG5kL2ZcXG5hYmNcXG5kL2ZcXG5cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSBbJz8nLCBzZWFyY2g6ICcvJ10sIGN1cnNvcjogWzMsIDFdXG4gICAgICAgIGVuc3VyZSBbJz8nLCBzZWFyY2g6ICcvJ10sIGN1cnNvcjogWzEsIDFdXG5cbiAgICAgIGRlc2NyaWJlIFwicmVwZWF0aW5nXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBrZXlzdHJva2UgWyc/Jywgc2VhcmNoOiAnZGVmJ11cblxuICAgICAgICBpdCBcInJlcGVhdHMgcHJldmlvdXMgc2VhcmNoIGFzIHJldmVyc2VkIHdpdGggPzxlbnRlcj5cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgWyc/Jywgc2VhcmNoOiAnJ10sIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgICAgaXQgXCJyZXBlYXRzIHByZXZpb3VzIHNlYXJjaCBhcyByZXZlcnNlZCB3aXRoID8/XCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFsnPycsIHNlYXJjaDogJz8nXSwgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgICBkZXNjcmliZSAndGhlIG4ga2V5YmluZGluZycsIC0+XG4gICAgICAgICAgaXQgXCJyZXBlYXRzIHRoZSBsYXN0IHNlYXJjaCBiYWNrd2FyZHNcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMywgMF1cblxuICAgICAgICBkZXNjcmliZSAndGhlIE4ga2V5YmluZGluZycsIC0+XG4gICAgICAgICAgaXQgXCJyZXBlYXRzIHRoZSBsYXN0IHNlYXJjaCBmb3J3YXJkc1wiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ04nLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ1c2luZyBzZWFyY2ggaGlzdG9yeVwiLCAtPlxuICAgICAgaW5wdXRFZGl0b3IgPSBudWxsXG4gICAgICBlbnN1cmVJbnB1dEVkaXRvciA9IChjb21tYW5kLCB7dGV4dH0pIC0+XG4gICAgICAgIGRpc3BhdGNoKGlucHV0RWRpdG9yLCBjb21tYW5kKVxuICAgICAgICBleHBlY3QoaW5wdXRFZGl0b3IuZ2V0TW9kZWwoKS5nZXRUZXh0KCkpLnRvRXF1YWwodGV4dClcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlbnN1cmUgWycvJywgc2VhcmNoOiAnZGVmJ10sIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSBbJy8nLCBzZWFyY2g6ICdhYmMnXSwgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgaW5wdXRFZGl0b3IgPSB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5lZGl0b3JFbGVtZW50XG5cbiAgICAgIGl0IFwiYWxsb3dzIHNlYXJjaGluZyBoaXN0b3J5IGluIHRoZSBzZWFyY2ggZmllbGRcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICcvJ1xuICAgICAgICBlbnN1cmVJbnB1dEVkaXRvciAnY29yZTptb3ZlLXVwJywgdGV4dDogJ2FiYydcbiAgICAgICAgZW5zdXJlSW5wdXRFZGl0b3IgJ2NvcmU6bW92ZS11cCcsIHRleHQ6ICdkZWYnXG4gICAgICAgIGVuc3VyZUlucHV0RWRpdG9yICdjb3JlOm1vdmUtdXAnLCB0ZXh0OiAnZGVmJ1xuXG4gICAgICBpdCBcInJlc2V0cyB0aGUgc2VhcmNoIGZpZWxkIHRvIGVtcHR5IHdoZW4gc2Nyb2xsaW5nIGJhY2tcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICcvJ1xuICAgICAgICBlbnN1cmVJbnB1dEVkaXRvciAnY29yZTptb3ZlLXVwJywgdGV4dDogJ2FiYydcbiAgICAgICAgZW5zdXJlSW5wdXRFZGl0b3IgJ2NvcmU6bW92ZS11cCcsIHRleHQ6ICdkZWYnXG4gICAgICAgIGVuc3VyZUlucHV0RWRpdG9yICdjb3JlOm1vdmUtZG93bicsIHRleHQ6ICdhYmMnXG4gICAgICAgIGVuc3VyZUlucHV0RWRpdG9yICdjb3JlOm1vdmUtZG93bicsIHRleHQ6ICcnXG5cbiAgICBkZXNjcmliZSBcImhpZ2hsaWdodFNlYXJjaFwiLCAtPlxuICAgICAgdGV4dEZvck1hcmtlciA9IChtYXJrZXIpIC0+XG4gICAgICAgIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSlcblxuICAgICAgZW5zdXJlSGlnaHRsaWdodFNlYXJjaCA9IChvcHRpb25zKSAtPlxuICAgICAgICBtYXJrZXJzID0gdmltU3RhdGUuaGlnaGxpZ2h0U2VhcmNoLmdldE1hcmtlcnMoKVxuICAgICAgICBpZiBvcHRpb25zLmxlbmd0aD9cbiAgICAgICAgICBleHBlY3QobWFya2VycykudG9IYXZlTGVuZ3RoKG9wdGlvbnMubGVuZ3RoKVxuXG4gICAgICAgIGlmIG9wdGlvbnMudGV4dD9cbiAgICAgICAgICB0ZXh0ID0gbWFya2Vycy5tYXAgKG1hcmtlcikgLT4gdGV4dEZvck1hcmtlcihtYXJrZXIpXG4gICAgICAgICAgZXhwZWN0KHRleHQpLnRvRXF1YWwob3B0aW9ucy50ZXh0KVxuXG4gICAgICAgIGlmIG9wdGlvbnMubW9kZT9cbiAgICAgICAgICBlbnN1cmUge21vZGU6IG9wdGlvbnMubW9kZX1cblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpKVxuICAgICAgICBzZXR0aW5ncy5zZXQoJ2hpZ2hsaWdodFNlYXJjaCcsIHRydWUpXG4gICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5oaWdobGlnaHRTZWFyY2guaGFzTWFya2VycygpKS50b0JlKGZhbHNlKVxuICAgICAgICBlbnN1cmUgWycvJywgc2VhcmNoOiAnZGVmJ10sIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiY2xlYXJIaWdobGlnaHRTZWFyY2ggY29tbWFuZFwiLCAtPlxuICAgICAgICBpdCBcImNsZWFyIGhpZ2hsaWdodFNlYXJjaCBtYXJrZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmVIaWdodGxpZ2h0U2VhcmNoIGxlbmd0aDogMiwgdGV4dDogW1wiZGVmXCIsIFwiZGVmXCJdLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIGRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICd2aW0tbW9kZS1wbHVzOmNsZWFyLWhpZ2hsaWdodC1zZWFyY2gnKVxuICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5oaWdobGlnaHRTZWFyY2guaGFzTWFya2VycygpKS50b0JlKGZhbHNlKVxuXG4gICAgICBkZXNjcmliZSBcImNsZWFySGlnaGxpZ2h0U2VhcmNoT25SZXNldE5vcm1hbE1vZGVcIiwgLT5cbiAgICAgICAgZGVzY3JpYmUgXCJ3aGVuIGRpc2FibGVkXCIsIC0+XG4gICAgICAgICAgaXQgXCJpdCB3b24ndCBjbGVhciBoaWdobGlnaHRTZWFyY2hcIiwgLT5cbiAgICAgICAgICAgIHNldHRpbmdzLnNldCgnY2xlYXJIaWdobGlnaHRTZWFyY2hPblJlc2V0Tm9ybWFsTW9kZScsIGZhbHNlKVxuICAgICAgICAgICAgZW5zdXJlSGlnaHRsaWdodFNlYXJjaCBsZW5ndGg6IDIsIHRleHQ6IFtcImRlZlwiLCBcImRlZlwiXSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgZW5zdXJlSGlnaHRsaWdodFNlYXJjaCBsZW5ndGg6IDIsIHRleHQ6IFtcImRlZlwiLCBcImRlZlwiXSwgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICBkZXNjcmliZSBcIndoZW4gZW5hYmxlZFwiLCAtPlxuICAgICAgICAgIGl0IFwiaXQgY2xlYXIgaGlnaGxpZ2h0U2VhcmNoIG9uIHJlc2V0LW5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgICAgICBzZXR0aW5ncy5zZXQoJ2NsZWFySGlnaGxpZ2h0U2VhcmNoT25SZXNldE5vcm1hbE1vZGUnLCB0cnVlKVxuICAgICAgICAgICAgZW5zdXJlSGlnaHRsaWdodFNlYXJjaCBsZW5ndGg6IDIsIHRleHQ6IFtcImRlZlwiLCBcImRlZlwiXSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgZXhwZWN0KHZpbVN0YXRlLmhpZ2hsaWdodFNlYXJjaC5oYXNNYXJrZXJzKCkpLnRvQmUoZmFsc2UpXG4gICAgICAgICAgICBlbnN1cmUgbW9kZTogJ25vcm1hbCdcblxuICBkZXNjcmliZSBcIkluY3JlbWVudGFsU2VhcmNoXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0dGluZ3Muc2V0KCdpbmNyZW1lbnRhbFNlYXJjaCcsIHRydWUpXG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpKVxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIG11bHRpcGxlLWN1cnNvcnNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMDogICAgYWJjXG4gICAgICAgICAgMTogICAgYWJjXG4gICAgICAgICAgMjogICAgYWJjXG4gICAgICAgICAgMzogICAgYWJjXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDBdLCBbMSwgMF1dXG5cbiAgICAgIGl0IFwiW2ZvcndhcmRdIG1vdmUgZWFjaCBjdXJzb3IgdG8gbWF0Y2hcIiwgLT5cbiAgICAgICAgZW5zdXJlIFsnLycsIHNlYXJjaDogJ2FiYyddLCBjdXJzb3I6IFtbMCwgNl0sIFsxLCA2XV1cbiAgICAgIGl0IFwiW2ZvcndhcmQ6IGNvdW50IHNwZWNpZmllZF0sIG1vdmUgZWFjaCBjdXJzb3IgdG8gbWF0Y2hcIiwgLT5cbiAgICAgICAgZW5zdXJlIFsnMiAvJywgc2VhcmNoOiAnYWJjJ10sIGN1cnNvcjogW1sxLCA2XSwgWzIsIDZdXVxuXG4gICAgICBpdCBcIltiYWNrd2FyZF0gbW92ZSBlYWNoIGN1cnNvciB0byBtYXRjaFwiLCAtPlxuICAgICAgICBlbnN1cmUgWyc/Jywgc2VhcmNoOiAnYWJjJ10sIGN1cnNvcjogW1szLCA2XSwgWzAsIDZdXVxuICAgICAgaXQgXCJbYmFja3dhcmQ6IGNvdW50IHNwZWNpZmllZF0gbW92ZSBlYWNoIGN1cnNvciB0byBtYXRjaFwiLCAtPlxuICAgICAgICBlbnN1cmUgWycyID8nLCBzZWFyY2g6ICdhYmMnXSwgY3Vyc29yOiBbWzIsIDZdLCBbMywgNl1dXG5cbiAgICBkZXNjcmliZSBcImJsYW5rIGlucHV0IHJlcGVhdCBsYXN0IHNlYXJjaFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAwOiAgICBhYmNcbiAgICAgICAgICAxOiAgICBhYmNcbiAgICAgICAgICAyOiAgICBhYmNcbiAgICAgICAgICAzOiAgICBhYmNcbiAgICAgICAgICA0OlxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcIkRvIG5vdGhpbmcgd2hlbiBzZWFyY2ggaGlzdG9yeSBpcyBlbXB0eVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMV1cbiAgICAgICAgZW5zdXJlIFsnLycsIHNlYXJjaDogJyddLCBjdXJzb3I6IFsyLCAxXVxuICAgICAgICBlbnN1cmUgWyc/Jywgc2VhcmNoOiAnJ10sIGN1cnNvcjogWzIsIDFdXG5cbiAgICAgIGl0IFwiUmVwZWF0IGZvcndhcmQgZGlyZWN0aW9uXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgWycvJywgc2VhcmNoOiAnYWJjJ10sIGN1cnNvcjogWzAsIDZdXG4gICAgICAgIGVuc3VyZSBbJy8nLCBzZWFyY2g6ICcnXSwgY3Vyc29yOiBbMSwgNl1cbiAgICAgICAgZW5zdXJlIFsnMiAvJywgc2VhcmNoOiAnJ10sIGN1cnNvcjogWzMsIDZdXG5cbiAgICAgIGl0IFwiUmVwZWF0IGJhY2t3YXJkIGRpcmVjdGlvblwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgMF1cbiAgICAgICAgZW5zdXJlIFsnPycsIHNlYXJjaDogJ2FiYyddLCBjdXJzb3I6IFszLCA2XVxuICAgICAgICBlbnN1cmUgWyc/Jywgc2VhcmNoOiAnJ10sIGN1cnNvcjogWzIsIDZdXG4gICAgICAgIGVuc3VyZSBbJzIgPycsIHNlYXJjaDogJyddLCBjdXJzb3I6IFswLCA2XVxuXG4gIGRlc2NyaWJlIFwidGhlICoga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcImFiZFxcbkBkZWZcXG5hYmRcXG5kZWZcXG5cIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyBjdXJzb3IgdG8gbmV4dCBvY2N1cnJlbmNlIG9mIHdvcmQgdW5kZXIgY3Vyc29yXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnKicsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgIGl0IFwicmVwZWF0cyB3aXRoIHRoZSBuIGtleVwiLCAtPlxuICAgICAgICBlbnN1cmUgJyonLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcImRvZXNuJ3QgbW92ZSBjdXJzb3IgdW5sZXNzIG5leHQgb2NjdXJyZW5jZSBpcyB0aGUgZXhhY3Qgd29yZCAobm8gcGFydGlhbCBtYXRjaGVzKVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcImFiY1xcbmRlZlxcbmdoaWFiY1xcbmprbFxcbmFiY2RlZlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICcqJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIHdvcmRzIHRoYXQgY29udGFpbiAnbm9uLXdvcmQnIGNoYXJhY3RlcnNcIiwgLT5cbiAgICAgICAgaXQgXCJza2lwcyBub24td29yZC1jaGFyIHdoZW4gcGlja2luZyBjdXJzb3Itd29yZCB0aGVuIHBsYWNlIGN1cnNvciB0byBuZXh0IG9jY3VycmVuY2Ugb2Ygd29yZFwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIEBkZWZcbiAgICAgICAgICAgIGFiY1xuICAgICAgICAgICAgQGRlZlxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnKicsIGN1cnNvcjogWzMsIDFdXG5cbiAgICAgICAgaXQgXCJkb2Vzbid0IG1vdmUgY3Vyc29yIHVubGVzcyBuZXh0IG1hdGNoIGhhcyBleGFjdCB3b3JkIGVuZGluZ1wiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIEBkZWZcbiAgICAgICAgICAgIGFiY1xuICAgICAgICAgICAgQGRlZjFcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICBlbnN1cmUgJyonLCBjdXJzb3I6IFsxLCAxXVxuXG4gICAgICAgIGl0IFwibW92ZXMgY3Vyc29yIHRvIHRoZSBzdGFydCBvZiB2YWxpZCB3b3JkIGNoYXJcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiYWJjXFxuZGVmXFxuYWJjXFxuQGRlZlxcblwiXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnKicsIGN1cnNvcjogWzMsIDFdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgb24gbm9uLXdvcmQgY2hhciBjb2x1bW5cIiwgLT5cbiAgICAgICAgaXQgXCJtYXRjaGVzIG9ubHkgdGhlIG5vbi13b3JkIGNoYXJcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiYWJjXFxuQGRlZlxcbmFiY1xcbkBkZWZcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJyonLCBjdXJzb3I6IFszLCAxXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIG5vdCBvbiBhIHdvcmRcIiwgLT5cbiAgICAgICAgaXQgXCJkb2VzIGEgbWF0Y2ggd2l0aCB0aGUgbmV4dCB3b3JkXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcImFiY1xcbmEgIEBkZWZcXG4gYWJjXFxuIEBkZWZcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICBlbnN1cmUgJyonLCBjdXJzb3I6IFszLCAyXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIGF0IEVPRlwiLCAtPlxuICAgICAgICBpdCBcImRvZXNuJ3QgdHJ5IHRvIGRvIGFueSBtYXRjaFwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJhYmNcXG5AZGVmXFxuYWJjXFxuIFwiXG4gICAgICAgICAgICBjdXJzb3I6IFszLCAwXVxuICAgICAgICAgIGVuc3VyZSAnKicsIGN1cnNvcjogWzMsIDBdXG5cbiAgICBkZXNjcmliZSBcImNhc2VTZW5zaXRpdml0eSBzZXR0aW5nXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGFiY1xuICAgICAgICAgIEFCQ1xuICAgICAgICAgIGFiQ1xuICAgICAgICAgIGFiY1xuICAgICAgICAgIEFCQ1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwic2VhcmNoIGNhc2Ugc2Vuc2l0aXZlbHkgd2hlbiBgaWdub3JlQ2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkYCBpcyBmYWxzZSg9ZGVmYXVsdClcIiwgLT5cbiAgICAgICAgZXhwZWN0KHNldHRpbmdzLmdldCgnaWdub3JlQ2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkJykpLnRvQmUoZmFsc2UpXG4gICAgICAgIGVuc3VyZSAnKicsIGN1cnNvcjogWzMsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwic2VhcmNoIGNhc2UgaW5zZW5zaXRpdmVseSB3aGVuIGBpZ25vcmVDYXNlRm9yU2VhcmNoQ3VycmVudFdvcmRgIHRydWVcIiwgLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0ICdpZ25vcmVDYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQnLCB0cnVlXG4gICAgICAgIGVuc3VyZSAnKicsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzMsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzQsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwidXNlU21hcnRjYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQgaXMgZW5hYmxlZFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0ICd1c2VTbWFydGNhc2VGb3JTZWFyY2hDdXJyZW50V29yZCcsIHRydWVcblxuICAgICAgICBpdCBcInNlYXJjaCBjYXNlIHNlbnNpdGl2ZWx5IHdoZW4gZW5hYmxlIGFuZCBzZWFyY2ggdGVybSBpbmNsdWRlcyB1cHBlcmNhc2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJyonLCBjdXJzb3I6IFs0LCAwXVxuICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgICAgaXQgXCJzZWFyY2ggY2FzZSBpbnNlbnNpdGl2ZWx5IHdoZW4gZW5hYmxlIGFuZCBzZWFyY2ggdGVybSBOT1QgaW5jbHVkZXMgdXBwZXJjYXNlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICcqJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzMsIDBdXG4gICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbNCwgMF1cblxuICBkZXNjcmliZSBcInRoZSBoYXNoIGtleWJpbmRpbmdcIiwgLT5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIGN1cnNvciB0byBwcmV2aW91cyBvY2N1cnJlbmNlIG9mIHdvcmQgdW5kZXIgY3Vyc29yXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiYWJjXFxuQGRlZlxcbmFiY1xcbmRlZlxcblwiXG4gICAgICAgICAgY3Vyc29yOiBbMiwgMV1cbiAgICAgICAgZW5zdXJlICcjJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJyZXBlYXRzIHdpdGggblwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcImFiY1xcbkBkZWZcXG5hYmNcXG5kZWZcXG5hYmNcXG5cIlxuICAgICAgICAgIGN1cnNvcjogWzIsIDFdXG4gICAgICAgIGVuc3VyZSAnIycsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzQsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgIGl0IFwiZG9lc24ndCBtb3ZlIGN1cnNvciB1bmxlc3MgbmV4dCBvY2N1cnJlbmNlIGlzIHRoZSBleGFjdCB3b3JkIChubyBwYXJ0aWFsIG1hdGNoZXMpXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiYWJjXFxuZGVmXFxuZ2hpYWJjXFxuamtsXFxuYWJjZGVmXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJyMnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcIndpdGggd29yZHMgdGhhdCBjb250YWludCAnbm9uLXdvcmQnIGNoYXJhY3RlcnNcIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyBjdXJzb3IgdG8gbmV4dCBvY2N1cnJlbmNlIG9mIHdvcmQgdW5kZXIgY3Vyc29yXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcImFiY1xcbkBkZWZcXG5hYmNcXG5AZGVmXFxuXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzMsIDBdXG4gICAgICAgICAgZW5zdXJlICcjJywgY3Vyc29yOiBbMSwgMV1cblxuICAgICAgICBpdCBcIm1vdmVzIGN1cnNvciB0byB0aGUgc3RhcnQgb2YgdmFsaWQgd29yZCBjaGFyXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcImFiY1xcbkBkZWZcXG5hYmNcXG5kZWZcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgICBlbnN1cmUgJyMnLCBjdXJzb3I6IFsxLCAxXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIG9uIG5vbi13b3JkIGNoYXIgY29sdW1uXCIsIC0+XG4gICAgICAgIGl0IFwibWF0Y2hlcyBvbmx5IHRoZSBub24td29yZCBjaGFyXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcImFiY1xcbkBkZWZcXG5hYmNcXG5AZGVmXFxuXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICcqJywgY3Vyc29yOiBbMywgMV1cblxuICAgIGRlc2NyaWJlIFwiY2FzZVNlbnNpdGl2aXR5IHNldHRpbmdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgQUJDXG4gICAgICAgICAgYWJDXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgQUJDXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbNCwgMF1cblxuICAgICAgaXQgXCJzZWFyY2ggY2FzZSBzZW5zaXRpdmVseSB3aGVuIGBpZ25vcmVDYXNlRm9yU2VhcmNoQ3VycmVudFdvcmRgIGlzIGZhbHNlKD1kZWZhdWx0KVwiLCAtPlxuICAgICAgICBleHBlY3Qoc2V0dGluZ3MuZ2V0KCdpZ25vcmVDYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQnKSkudG9CZShmYWxzZSlcbiAgICAgICAgZW5zdXJlICcjJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbNCwgMF1cblxuICAgICAgaXQgXCJzZWFyY2ggY2FzZSBpbnNlbnNpdGl2ZWx5IHdoZW4gYGlnbm9yZUNhc2VGb3JTZWFyY2hDdXJyZW50V29yZGAgdHJ1ZVwiLCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQgJ2lnbm9yZUNhc2VGb3JTZWFyY2hDdXJyZW50V29yZCcsIHRydWVcbiAgICAgICAgZW5zdXJlICcjJywgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJ1c2VTbWFydGNhc2VGb3JTZWFyY2hDdXJyZW50V29yZCBpcyBlbmFibGVkXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQgJ3VzZVNtYXJ0Y2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkJywgdHJ1ZVxuXG4gICAgICAgIGl0IFwic2VhcmNoIGNhc2Ugc2Vuc2l0aXZlbHkgd2hlbiBlbmFibGUgYW5kIHNlYXJjaCB0ZXJtIGluY2x1ZGVzIHVwcGVyY2FzZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFs0LCAwXVxuICAgICAgICAgIGVuc3VyZSAnIycsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbNCwgMF1cblxuICAgICAgICBpdCBcInNlYXJjaCBjYXNlIGluc2Vuc2l0aXZlbHkgd2hlbiBlbmFibGUgYW5kIHNlYXJjaCB0ZXJtIE5PVCBpbmNsdWRlcyB1cHBlcmNhc2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJyMnLCBjdXJzb3I6IFs0LCAwXVxuICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzMsIDBdXG4gICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzAsIDBdXG5cbiAgIyBGSVhNRTogTm8gbG9uZ2VyIGNoaWxkIG9mIHNlYXJjaCBzbyBtb3ZlIHRvIG1vdGlvbi1nZW5lcmFsLXNwZWMuY29mZmU/XG4gIGRlc2NyaWJlICd0aGUgJSBtb3Rpb24nLCAtPlxuICAgIGRlc2NyaWJlIFwiUGFyZW50aGVzaXNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiKF9fXylcIlxuICAgICAgZGVzY3JpYmUgXCJhcyBvcGVyYXRvciB0YXJnZXRcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcIihfKF8pXylcIlxuICAgICAgICBpdCAnYmVoYXZlIGluY2x1c2l2ZWx5IHdoZW4gaXMgYXQgb3BlbiBwYWlyJywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgICBlbnN1cmUgJ2QgJScsIHRleHQ6IFwiKF9fKVwiXG4gICAgICAgIGl0ICdiZWhhdmUgaW5jbHVzaXZlbHkgd2hlbiBpcyBhdCBvcGVuIHBhaXInLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA0XVxuICAgICAgICAgIGVuc3VyZSAnZCAlJywgdGV4dDogXCIoX18pXCJcbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIGF0IHBhaXIgY2hhclwiLCAtPlxuICAgICAgICBpdCBcImN1cnNvciBpcyBhdCBvcGVuIHBhaXIsIGl0IG1vdmUgdG8gY2xvc2luZyBwYWlyXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBpdCBcImN1cnNvciBpcyBhdCBjbG9zZSBwYWlyLCBpdCBtb3ZlIHRvIG9wZW4gcGFpclwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA0XVxuICAgICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgNF1cbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIGVuY2xvc2VkIGJ5IHBhaXJcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCIoX19fKVwiLFxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgXCJtb3ZlIHRvIG9wZW4gcGFpclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDBdXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBib2ZvcmUgb3BlbiBwYWlyXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiX18oX19fKVwiLFxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgaXQgXCJtb3ZlIHRvIG9wZW4gcGFpclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDZdXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBhZnRlciBjbG9zZSBwYWlyXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiX18oX19fKV9fXCIsXG4gICAgICAgICAgICBjdXJzb3I6IFswLCA3XVxuICAgICAgICBpdCBcImZhaWwgdG8gbW92ZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDddXG4gICAgICBkZXNjcmliZSBcIm11bHRpIGxpbmVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBfX19cbiAgICAgICAgICAgIF9fXyhfX1xuICAgICAgICAgICAgX19fXG4gICAgICAgICAgICBfX18pXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZGVzY3JpYmUgXCJ3aGVuIG9wZW4gYW5kIGNsb3NlIHBhaXIgaXMgbm90IGF0IGN1cnNvciBsaW5lXCIsIC0+XG4gICAgICAgICAgaXQgXCJmYWlsIHRvIG1vdmVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBpdCBcImZhaWwgdG8gbW92ZVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBkZXNjcmliZSBcIndoZW4gb3BlbiBwYWlyIGlzIGZvcndhcmRpbmcgdG8gY3Vyc29yIGluIHNhbWUgcm93XCIsIC0+XG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGNsb3NpbmcgcGFpclwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFszLCAzXVxuICAgICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIHBvc2l0aW9uIGlzIGdyZWF0ZXIgdGhhbiBvcGVuIHBhaXJcIiwgLT5cbiAgICAgICAgICBpdCBcImZhaWwgdG8gbW92ZVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDRdXG4gICAgICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFsxLCA0XVxuICAgICAgICBkZXNjcmliZSBcIndoZW4gY2xvc2UgcGFpciBpcyBmb3J3YXJkaW5nIHRvIGN1cnNvciBpbiBzYW1lIHJvd1wiLCAtPlxuICAgICAgICAgIGl0IFwibW92ZSB0byBjbG9zaW5nIHBhaXJcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFszLCAwXVxuICAgICAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMSwgM11cblxuICAgIGRlc2NyaWJlIFwiQ3VybHlCcmFja2V0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIntfX199XCJcbiAgICAgIGl0IFwiY3Vyc29yIGlzIGF0IG9wZW4gcGFpciwgaXQgbW92ZSB0byBjbG9zaW5nIHBhaXJcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDRdXG4gICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcImN1cnNvciBpcyBhdCBjbG9zZSBwYWlyLCBpdCBtb3ZlIHRvIG9wZW4gcGFpclwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgNF1cblxuICAgIGRlc2NyaWJlIFwiU3F1YXJlQnJhY2tldFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJbX19fXVwiXG4gICAgICBpdCBcImN1cnNvciBpcyBhdCBvcGVuIHBhaXIsIGl0IG1vdmUgdG8gY2xvc2luZyBwYWlyXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCA0XVxuICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJjdXJzb3IgaXMgYXQgY2xvc2UgcGFpciwgaXQgbW92ZSB0byBvcGVuIHBhaXJcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDRdXG4gICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDRdXG5cbiAgICBkZXNjcmliZSBcImNvbXBsZXggc2l0dWF0aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIChfX19fXylfX3tfX1tfX19dX199XG4gICAgICAgICAgX1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgJ21vdmUgdG8gY2xvc2luZyBwYWlyIHdoaWNoIG9wZW4gcGFpciBjb21lIGZpcnN0JywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDddXG4gICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDE5XVxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTBdXG4gICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDE2XVxuICAgICAgaXQgJ2VuY2xvc2luZyBwYWlyIGlzIHByaW9yaXRpemVkIG92ZXIgZm9yd2FyZGluZyByYW5nZScsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJjb21wbGV4IHNpdHVhdGlvbiB3aXRoIGh0bWwgdGFnXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgc29tZSB0ZXh0XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCAnbW92ZSB0byBwYWlyIHRhZyBvbmx5IHdoZW4gY3Vyc29yIGlzIG9uIG9wZW4gb3IgY2xvc2UgdGFnIGJ1dCBub3Qgb24gQW5nbGVCcmFja2V0KDwsID4pJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdOyBlbnN1cmUgJyUnLCBjdXJzb3I6IFs0LCAxXVxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMl07IGVuc3VyZSAnJScsIGN1cnNvcjogWzQsIDFdXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAzXTsgZW5zdXJlICclJywgY3Vyc29yOiBbNCwgMV1cblxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgMV07IGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCAyXTsgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDNdOyBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgNF07IGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDFdXG4iXX0=
