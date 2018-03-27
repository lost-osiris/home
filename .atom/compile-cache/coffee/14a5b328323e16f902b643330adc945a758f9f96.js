(function() {
  var TextData, dispatch, getView, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView;

  settings = require('../lib/settings');

  describe("Occurrence", function() {
    var classList, dispatchSearchCommand, editor, editorElement, ensure, inputSearchText, keystroke, ref1, ref2, searchEditor, searchEditorElement, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5], classList = ref1[6];
    ref2 = [], searchEditor = ref2[0], searchEditorElement = ref2[1];
    inputSearchText = function(text) {
      return searchEditor.insertText(text);
    };
    dispatchSearchCommand = function(name) {
      return dispatch(searchEditorElement, name);
    };
    beforeEach(function() {
      getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke;
        classList = editorElement.classList;
        searchEditor = vimState.searchInput.editor;
        return searchEditorElement = vimState.searchInput.editorElement;
      });
      return runs(function() {
        return jasmine.attachToDOM(editorElement);
      });
    });
    describe("operator-modifier-occurrence", function() {
      beforeEach(function() {
        return set({
          text: "\nooo: xxx: ooo:\n---: ooo: xxx: ooo:\nooo: xxx: ---: xxx: ooo:\nxxx: ---: ooo: ooo:\n\nooo: xxx: ooo:\n---: ooo: xxx: ooo:\nooo: xxx: ---: xxx: ooo:\nxxx: ---: ooo: ooo:\n"
        });
      });
      describe("o modifier", function() {
        return it("change occurrence of cursor word in inner-paragraph", function() {
          set({
            cursor: [1, 0]
          });
          ensure("c o i p", {
            mode: 'insert',
            textC: "\n!: xxx: |:\n---: |: xxx: |:\n|: xxx: ---: xxx: |:\nxxx: ---: |: |:\n\nooo: xxx: ooo:\n---: ooo: xxx: ooo:\nooo: xxx: ---: xxx: ooo:\nxxx: ---: ooo: ooo:\n"
          });
          editor.insertText('===');
          ensure("escape", {
            mode: 'normal',
            textC: "\n==!=: xxx: ==|=:\n---: ==|=: xxx: ==|=:\n==|=: xxx: ---: xxx: ==|=:\nxxx: ---: ==|=: ==|=:\n\nooo: xxx: ooo:\n---: ooo: xxx: ooo:\nooo: xxx: ---: xxx: ooo:\nxxx: ---: ooo: ooo:\n"
          });
          return ensure("} j .", {
            mode: 'normal',
            textC: "\n===: xxx: ===:\n---: ===: xxx: ===:\n===: xxx: ---: xxx: ===:\nxxx: ---: ===: ===:\n\n==!=: xxx: ==|=:\n---: ==|=: xxx: ==|=:\n==|=: xxx: ---: xxx: ==|=:\nxxx: ---: ==|=: ==|=:\n"
          });
        });
      });
      describe("O modifier", function() {
        beforeEach(function() {
          return set({
            textC: "\ncamelCa|se Cases\n\"CaseStudy\" SnakeCase\nUP_CASE\n\nother ParagraphCase"
          });
        });
        return it("delete subword-occurrence in paragraph and repeatable", function() {
          ensure("d O p", {
            textC: "\ncamel| Cases\n\"Study\" Snake\nUP_CASE\n\nother ParagraphCase"
          });
          return ensure("G .", {
            textC: "\ncamel Cases\n\"Study\" Snake\nUP_CASE\n\n|other Paragraph"
          });
        });
      });
      describe("apply various operator to occurrence in various target", function() {
        beforeEach(function() {
          return set({
            textC: "ooo: xxx: o!oo:\n===: ooo: xxx: ooo:\nooo: xxx: ===: xxx: ooo:\nxxx: ===: ooo: ooo:"
          });
        });
        it("upper case inner-word", function() {
          ensure("g U o i l", {
            textC: "OOO: xxx: O!OO:\n===: ooo: xxx: ooo:\nooo: xxx: ===: xxx: ooo:\nxxx: ===: ooo: ooo:"
          });
          ensure("2 j .", {
            textC: "OOO: xxx: OOO:\n===: ooo: xxx: ooo:\nOOO: xxx: =!==: xxx: OOO:\nxxx: ===: ooo: ooo:"
          });
          return ensure("j .", {
            textC: "OOO: xxx: OOO:\n===: ooo: xxx: ooo:\nOOO: xxx: ===: xxx: OOO:\nxxx: ===: O!OO: OOO:"
          });
        });
        return describe("clip to mutation end behavior", function() {
          beforeEach(function() {
            return set({
              textC: "\noo|o:xxx:ooo:\nxxx:ooo:xxx\n\n"
            });
          });
          it("[d o p] delete occurrence and cursor is at mutation end", function() {
            return ensure("d o p", {
              textC: "\n|:xxx::\nxxx::xxx\n\n"
            });
          });
          it("[d o j] delete occurrence and cursor is at mutation end", function() {
            return ensure("d o j", {
              textC: "\n|:xxx::\nxxx::xxx\n\n"
            });
          });
          return it("not clip if original cursor not intersects any occurence-marker", function() {
            ensure('g o', {
              occurrenceText: ['ooo', 'ooo', 'ooo'],
              cursor: [1, 2]
            });
            keystroke('j', {
              cursor: [2, 2]
            });
            return ensure("d p", {
              textC: "\n:xxx::\nxx|x::xxx\n\n"
            });
          });
        });
      });
      describe("auto extend target range to include occurrence", function() {
        var textFinal, textOriginal;
        textOriginal = "This text have 3 instance of 'text' in the whole text.\n";
        textFinal = textOriginal.replace(/text/g, '');
        beforeEach(function() {
          return set({
            text: textOriginal
          });
        });
        it("[from start of 1st]", function() {
          set({
            cursor: [0, 5]
          });
          return ensure('d o $', {
            text: textFinal
          });
        });
        it("[from middle of 1st]", function() {
          set({
            cursor: [0, 7]
          });
          return ensure('d o $', {
            text: textFinal
          });
        });
        it("[from end of last]", function() {
          set({
            cursor: [0, 52]
          });
          return ensure('d o 0', {
            text: textFinal
          });
        });
        return it("[from middle of last]", function() {
          set({
            cursor: [0, 51]
          });
          return ensure('d o 0', {
            text: textFinal
          });
        });
      });
      return describe("select-occurrence", function() {
        beforeEach(function() {
          return set({
            text: "vim-mode-plus vim-mode-plus"
          });
        });
        return describe("what the cursor-word", function() {
          var ensureCursorWord;
          ensureCursorWord = function(initialPoint, arg) {
            var selectedText;
            selectedText = arg.selectedText;
            set({
              cursor: initialPoint
            });
            ensure("g cmd-d i p", {
              selectedText: selectedText,
              mode: ['visual', 'characterwise']
            });
            return ensure("escape", {
              mode: "normal"
            });
          };
          describe("cursor is on normal word", function() {
            return it("pick word but not pick partially matched one [by select]", function() {
              ensureCursorWord([0, 0], {
                selectedText: ['vim', 'vim']
              });
              ensureCursorWord([0, 3], {
                selectedText: ['-', '-', '-', '-']
              });
              ensureCursorWord([0, 4], {
                selectedText: ['mode', 'mode']
              });
              return ensureCursorWord([0, 9], {
                selectedText: ['plus', 'plus']
              });
            });
          });
          describe("cursor is at single white space [by delete]", function() {
            return it("pick single white space only", function() {
              set({
                text: "ooo ooo ooo\n ooo ooo ooo",
                cursor: [0, 3]
              });
              return ensure("d o i p", {
                text: "ooooooooo\nooooooooo"
              });
            });
          });
          return describe("cursor is at sequnce of space [by delete]", function() {
            return it("select sequnce of white spaces including partially mached one", function() {
              set({
                cursor: [0, 3],
                text_: "ooo___ooo ooo\n ooo ooo____ooo________ooo"
              });
              return ensure("d o i p", {
                text_: "oooooo ooo\n ooo ooo ooo  ooo"
              });
            });
          });
        });
      });
    });
    describe("stayOnOccurrence settings", function() {
      beforeEach(function() {
        return set({
          textC: "\naaa, bbb, ccc\nbbb, a|aa, aaa\n"
        });
      });
      describe("when true (= default)", function() {
        return it("keep cursor position after operation finished", function() {
          return ensure('g U o p', {
            textC: "\nAAA, bbb, ccc\nbbb, A|AA, AAA\n"
          });
        });
      });
      return describe("when false", function() {
        beforeEach(function() {
          return settings.set('stayOnOccurrence', false);
        });
        return it("move cursor to start of target as like non-ocurrence operator", function() {
          return ensure('g U o p', {
            textC: "\n|AAA, bbb, ccc\nbbb, AAA, AAA\n"
          });
        });
      });
    });
    describe("from visual-mode.is-narrowed", function() {
      beforeEach(function() {
        return set({
          text: "ooo: xxx: ooo\n|||: ooo: xxx: ooo\nooo: xxx: |||: xxx: ooo\nxxx: |||: ooo: ooo",
          cursor: [0, 0]
        });
      });
      describe("[vC] select-occurrence", function() {
        return it("select cursor-word which intersecting selection then apply upper-case", function() {
          ensure("v 2 j cmd-d", {
            selectedText: ['ooo', 'ooo', 'ooo', 'ooo', 'ooo'],
            mode: ['visual', 'characterwise']
          });
          return ensure("U", {
            text: "OOO: xxx: OOO\n|||: OOO: xxx: OOO\nOOO: xxx: |||: xxx: ooo\nxxx: |||: ooo: ooo",
            numCursors: 5,
            mode: 'normal'
          });
        });
      });
      describe("[vL] select-occurrence", function() {
        return it("select cursor-word which intersecting selection then apply upper-case", function() {
          ensure("5 l V 2 j cmd-d", {
            selectedText: ['xxx', 'xxx', 'xxx', 'xxx'],
            mode: ['visual', 'characterwise']
          });
          return ensure("U", {
            text: "ooo: XXX: ooo\n|||: ooo: XXX: ooo\nooo: XXX: |||: XXX: ooo\nxxx: |||: ooo: ooo",
            numCursors: 4,
            mode: 'normal'
          });
        });
      });
      return describe("[vB] select-occurrence", function() {
        it("select cursor-word which intersecting selection then apply upper-case", function() {
          return ensure("W ctrl-v 2 j $ h cmd-d U", {
            text: "ooo: xxx: OOO\n|||: OOO: xxx: OOO\nooo: xxx: |||: xxx: OOO\nxxx: |||: ooo: ooo",
            numCursors: 4
          });
        });
        return it("pick cursor-word from vB range", function() {
          return ensure("ctrl-v 7 l 2 j o cmd-d U", {
            text: "OOO: xxx: ooo\n|||: OOO: xxx: ooo\nOOO: xxx: |||: xxx: ooo\nxxx: |||: ooo: ooo",
            numCursors: 3
          });
        });
      });
    });
    describe("incremental search integration: change-occurrence-from-search, select-occurrence-from-search", function() {
      beforeEach(function() {
        settings.set('incrementalSearch', true);
        return set({
          text: "ooo: xxx: ooo: 0000\n1: ooo: 22: ooo:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:",
          cursor: [0, 0]
        });
      });
      describe("from normal mode", function() {
        it("select occurrence by pattern match", function() {
          keystroke('/');
          inputSearchText('\\d{3,4}');
          dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
          return ensure('i e', {
            selectedText: ['3333', '444', '0000'],
            mode: ['visual', 'characterwise']
          });
        });
        return it("change occurrence by pattern match", function() {
          keystroke('/');
          inputSearchText('^\\w+:');
          dispatchSearchCommand('vim-mode-plus:change-occurrence-from-search');
          ensure('i e', {
            mode: 'insert'
          });
          editor.insertText('hello');
          return ensure({
            text: "hello xxx: ooo: 0000\nhello ooo: 22: ooo:\nhello xxx: |||: xxx: 3333:\nhello |||: ooo: ooo:"
          });
        });
      });
      describe("from visual mode", function() {
        describe("visual characterwise", function() {
          return it("change occurrence in narrowed selection", function() {
            keystroke('v j /');
            inputSearchText('o+');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "OOO: xxx: OOO: 0000\n1: ooo: 22: ooo:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:"
            });
          });
        });
        describe("visual linewise", function() {
          return it("change occurrence in narrowed selection", function() {
            keystroke('V j /');
            inputSearchText('o+');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "OOO: xxx: OOO: 0000\n1: OOO: 22: OOO:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:"
            });
          });
        });
        return describe("visual blockwise", function() {
          return it("change occurrence in narrowed selection", function() {
            set({
              cursor: [0, 5]
            });
            keystroke('ctrl-v 2 j 1 0 l /');
            inputSearchText('o+');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "ooo: xxx: OOO: 0000\n1: OOO: 22: OOO:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:"
            });
          });
        });
      });
      describe("persistent-selection is exists", function() {
        var persistentSelectionBufferRange;
        persistentSelectionBufferRange = null;
        beforeEach(function() {
          atom.keymaps.add("create-persistent-selection", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'm': 'vim-mode-plus:create-persistent-selection'
            }
          });
          set({
            text: "ooo: xxx: ooo:\n|||: ooo: xxx: ooo:\nooo: xxx: |||: xxx: ooo:\nxxx: |||: ooo: ooo:\n",
            cursor: [0, 0]
          });
          persistentSelectionBufferRange = [[[0, 0], [2, 0]], [[3, 0], [4, 0]]];
          return ensure('V j m G m m', {
            persistentSelectionBufferRange: persistentSelectionBufferRange
          });
        });
        describe("when no selection is exists", function() {
          return it("select occurrence in all persistent-selection", function() {
            set({
              cursor: [0, 0]
            });
            keystroke('/');
            inputSearchText('xxx');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "ooo: XXX: ooo:\n|||: ooo: XXX: ooo:\nooo: xxx: |||: xxx: ooo:\nXXX: |||: ooo: ooo:\n",
              persistentSelectionCount: 0
            });
          });
        });
        return describe("when both exits, operator applied to both", function() {
          return it("select all occurrence in selection", function() {
            set({
              cursor: [0, 0]
            });
            keystroke('V 2 j /');
            inputSearchText('xxx');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "ooo: XXX: ooo:\n|||: ooo: XXX: ooo:\nooo: XXX: |||: XXX: ooo:\nXXX: |||: ooo: ooo:\n",
              persistentSelectionCount: 0
            });
          });
        });
      });
      return describe("demonstrate persistent-selection's practical scenario", function() {
        var oldGrammar;
        oldGrammar = [][0];
        afterEach(function() {
          return editor.setGrammar(oldGrammar);
        });
        beforeEach(function() {
          atom.keymaps.add("create-persistent-selection", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'm': 'vim-mode-plus:toggle-persistent-selection'
            }
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-coffee-script');
          });
          runs(function() {
            oldGrammar = editor.getGrammar();
            return editor.setGrammar(atom.grammars.grammarForScopeName('source.coffee'));
          });
          return set({
            text: "constructor: (@main, @editor, @statusBarManager) ->\n  @editorElement = @editor.element\n  @emitter = new Emitter\n  @subscriptions = new CompositeDisposable\n  @modeManager = new ModeManager(this)\n  @mark = new MarkManager(this)\n  @register = new RegisterManager(this)\n  @persistentSelections = []\n\n  @highlightSearchSubscription = @editorElement.onDidChangeScrollTop =>\n    @refreshHighlightSearch()\n\n  @operationStack = new OperationStack(this)\n  @cursorStyleManager = new CursorStyleManager(this)\n\nanotherFunc: ->\n  @hello = []"
          });
        });
        return it('change all assignment("=") of current-function to "?="', function() {
          set({
            cursor: [0, 0]
          });
          ensure([
            'j f', {
              input: '='
            }
          ], {
            cursor: [1, 17]
          });
          runs(function() {
            var textsInBufferRange, textsInBufferRangeIsAllEqualChar;
            keystroke(['g cmd-d', 'i f', 'm'].join(" "));
            textsInBufferRange = vimState.persistentSelection.getMarkerBufferRanges().map(function(range) {
              return editor.getTextInBufferRange(range);
            });
            textsInBufferRangeIsAllEqualChar = textsInBufferRange.every(function(text) {
              return text === '=';
            });
            expect(textsInBufferRangeIsAllEqualChar).toBe(true);
            expect(vimState.persistentSelection.getMarkers()).toHaveLength(11);
            keystroke('2 l');
            ensure([
              '/', {
                search: '=>'
              }
            ], {
              cursor: [9, 69]
            });
            keystroke("m");
            return expect(vimState.persistentSelection.getMarkers()).toHaveLength(10);
          });
          waitsFor(function() {
            return classList.contains('has-persistent-selection');
          });
          return runs(function() {
            keystroke(['ctrl-cmd-g', 'I']);
            editor.insertText('?');
            return ensure('escape', {
              text: "constructor: (@main, @editor, @statusBarManager) ->\n  @editorElement ?= @editor.element\n  @emitter ?= new Emitter\n  @subscriptions ?= new CompositeDisposable\n  @modeManager ?= new ModeManager(this)\n  @mark ?= new MarkManager(this)\n  @register ?= new RegisterManager(this)\n  @persistentSelections ?= []\n\n  @highlightSearchSubscription ?= @editorElement.onDidChangeScrollTop =>\n    @refreshHighlightSearch()\n\n  @operationStack ?= new OperationStack(this)\n  @cursorStyleManager ?= new CursorStyleManager(this)\n\nanotherFunc: ->\n  @hello = []"
            });
          });
        });
      });
    });
    return describe("preset occurrence marker", function() {
      beforeEach(function() {
        return set({
          text: "This text have 3 instance of 'text' in the whole text",
          cursor: [0, 0]
        });
      });
      describe("toggle-preset-occurrence commands", function() {
        describe("in normal-mode", function() {
          describe("add preset occurrence", function() {
            return it('set cursor-ward as preset occurrence marker and not move cursor', function() {
              ensure('g o', {
                occurrenceText: 'This',
                cursor: [0, 0]
              });
              ensure('w', {
                cursor: [0, 5]
              });
              return ensure('g o', {
                occurrenceText: ['This', 'text', 'text', 'text'],
                cursor: [0, 5]
              });
            });
          });
          describe("remove preset occurrence", function() {
            it('removes occurrence one by one separately', function() {
              ensure('g o', {
                occurrenceText: 'This',
                cursor: [0, 0]
              });
              ensure('w', {
                cursor: [0, 5]
              });
              ensure('g o', {
                occurrenceText: ['This', 'text', 'text', 'text'],
                cursor: [0, 5]
              });
              ensure('g o', {
                occurrenceText: ['This', 'text', 'text'],
                cursor: [0, 5]
              });
              return ensure('b g o', {
                occurrenceText: ['text', 'text'],
                cursor: [0, 0]
              });
            });
            it('removes all occurrence in this editor by escape', function() {
              ensure('g o', {
                occurrenceText: 'This',
                cursor: [0, 0]
              });
              ensure('w', {
                cursor: [0, 5]
              });
              ensure('g o', {
                occurrenceText: ['This', 'text', 'text', 'text'],
                cursor: [0, 5]
              });
              return ensure('escape', {
                occurrenceCount: 0
              });
            });
            return it('can recall previously set occurence pattern by `g .`', function() {
              ensure('w v l g o', {
                occurrenceText: ['te', 'te', 'te'],
                cursor: [0, 6]
              });
              ensure('escape', {
                occurrenceCount: 0
              });
              expect(vimState.globalState.get('lastOccurrencePattern')).toEqual(/te/g);
              ensure('w', {
                cursor: [0, 10]
              });
              ensure('g .', {
                occurrenceText: ['te', 'te', 'te'],
                cursor: [0, 10]
              });
              ensure('g U o $', {
                textC: "This text |HAVE 3 instance of 'text' in the whole text"
              });
              return expect(vimState.globalState.get('lastOccurrencePattern')).toEqual(/te/g);
            });
          });
          describe("restore last occurrence marker by add-preset-occurrence-from-last-occurrence-pattern", function() {
            beforeEach(function() {
              return set({
                textC: "camel\ncamelCase\ncamels\ncamel"
              });
            });
            it("can restore occurrence-marker added by `g o` in normal-mode", function() {
              set({
                cursor: [0, 0]
              });
              ensure("g o", {
                occurrenceText: ['camel', 'camel']
              });
              ensure('escape', {
                occurrenceCount: 0
              });
              return ensure("g .", {
                occurrenceText: ['camel', 'camel']
              });
            });
            it("can restore occurrence-marker added by `g o` in visual-mode", function() {
              set({
                cursor: [0, 0]
              });
              ensure("v i w", {
                selectedText: "camel"
              });
              ensure("g o", {
                occurrenceText: ['camel', 'camel', 'camel', 'camel']
              });
              ensure('escape', {
                occurrenceCount: 0
              });
              return ensure("g .", {
                occurrenceText: ['camel', 'camel', 'camel', 'camel']
              });
            });
            return it("can restore occurrence-marker added by `g O` in normal-mode", function() {
              set({
                cursor: [0, 0]
              });
              ensure("g O", {
                occurrenceText: ['camel', 'camel', 'camel']
              });
              ensure('escape', {
                occurrenceCount: 0
              });
              return ensure("g .", {
                occurrenceText: ['camel', 'camel', 'camel']
              });
            });
          });
          return describe("css class has-occurrence", function() {
            describe("manually toggle by toggle-preset-occurrence command", function() {
              return it('is auto-set/unset wheter at least one preset-occurrence was exists or not', function() {
                expect(classList.contains('has-occurrence')).toBe(false);
                ensure('g o', {
                  occurrenceText: 'This',
                  cursor: [0, 0]
                });
                expect(classList.contains('has-occurrence')).toBe(true);
                ensure('g o', {
                  occurrenceCount: 0,
                  cursor: [0, 0]
                });
                return expect(classList.contains('has-occurrence')).toBe(false);
              });
            });
            return describe("change 'INSIDE' of marker", function() {
              var markerLayerUpdated;
              markerLayerUpdated = null;
              beforeEach(function() {
                return markerLayerUpdated = false;
              });
              return it('destroy marker and reflect to "has-occurrence" CSS', function() {
                runs(function() {
                  expect(classList.contains('has-occurrence')).toBe(false);
                  ensure('g o', {
                    occurrenceText: 'This',
                    cursor: [0, 0]
                  });
                  expect(classList.contains('has-occurrence')).toBe(true);
                  ensure('l i', {
                    mode: 'insert'
                  });
                  vimState.occurrenceManager.markerLayer.onDidUpdate(function() {
                    return markerLayerUpdated = true;
                  });
                  editor.insertText('--');
                  return ensure("escape", {
                    textC: "T-|-his text have 3 instance of 'text' in the whole text",
                    mode: 'normal'
                  });
                });
                waitsFor(function() {
                  return markerLayerUpdated;
                });
                return runs(function() {
                  ensure({
                    occurrenceCount: 0
                  });
                  return expect(classList.contains('has-occurrence')).toBe(false);
                });
              });
            });
          });
        });
        describe("in visual-mode", function() {
          describe("add preset occurrence", function() {
            return it('set selected-text as preset occurrence marker and not move cursor', function() {
              ensure('w v l', {
                mode: ['visual', 'characterwise'],
                selectedText: 'te'
              });
              return ensure('g o', {
                mode: 'normal',
                occurrenceText: ['te', 'te', 'te']
              });
            });
          });
          return describe("is-narrowed selection", function() {
            var textOriginal;
            textOriginal = [][0];
            beforeEach(function() {
              textOriginal = "This text have 3 instance of 'text' in the whole text\nThis text have 3 instance of 'text' in the whole text\n";
              return set({
                cursor: [0, 0],
                text: textOriginal
              });
            });
            return it("pick ocurrence-word from cursor position and continue visual-mode", function() {
              ensure('w V j', {
                mode: ['visual', 'linewise'],
                selectedText: textOriginal
              });
              ensure('g o', {
                mode: ['visual', 'linewise'],
                selectedText: textOriginal,
                occurrenceText: ['text', 'text', 'text', 'text', 'text', 'text']
              });
              return ensure([
                'r', {
                  input: '!'
                }
              ], {
                mode: 'normal',
                text: "This !!!! have 3 instance of '!!!!' in the whole !!!!\nThis !!!! have 3 instance of '!!!!' in the whole !!!!\n"
              });
            });
          });
        });
        return describe("in incremental-search", function() {
          beforeEach(function() {
            return settings.set('incrementalSearch', true);
          });
          return describe("add-occurrence-pattern-from-search", function() {
            return it('mark as occurrence which matches regex entered in search-ui', function() {
              keystroke('/');
              inputSearchText('\\bt\\w+');
              dispatchSearchCommand('vim-mode-plus:add-occurrence-pattern-from-search');
              return ensure({
                occurrenceText: ['text', 'text', 'the', 'text']
              });
            });
          });
        });
      });
      describe("mutate preset occurrence", function() {
        beforeEach(function() {
          set({
            text: "ooo: xxx: ooo xxx: ooo:\n!!!: ooo: xxx: ooo xxx: ooo:"
          });
          return {
            cursor: [0, 0]
          };
        });
        describe("normal-mode", function() {
          it('[delete] apply operation to preset-marker intersecting selected target', function() {
            return ensure('l g o D', {
              text: ": xxx:  xxx: :\n!!!: ooo: xxx: ooo xxx: ooo:"
            });
          });
          it('[upcase] apply operation to preset-marker intersecting selected target', function() {
            set({
              cursor: [0, 6]
            });
            return ensure('l g o g U j', {
              text: "ooo: XXX: ooo XXX: ooo:\n!!!: ooo: XXX: ooo XXX: ooo:"
            });
          });
          it('[upcase exclude] won\'t mutate removed marker', function() {
            set({
              cursor: [0, 0]
            });
            ensure('g o', {
              occurrenceCount: 6
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('g U j', {
              text: "ooo: xxx: OOO xxx: OOO:\n!!!: OOO: xxx: OOO xxx: OOO:"
            });
          });
          it('[delete] apply operation to preset-marker intersecting selected target', function() {
            set({
              cursor: [0, 10]
            });
            return ensure('g o g U $', {
              text: "ooo: xxx: OOO xxx: OOO:\n!!!: ooo: xxx: ooo xxx: ooo:"
            });
          });
          it('[change] apply operation to preset-marker intersecting selected target', function() {
            ensure('l g o C', {
              mode: 'insert',
              text: ": xxx:  xxx: :\n!!!: ooo: xxx: ooo xxx: ooo:"
            });
            editor.insertText('YYY');
            return ensure('l g o C', {
              mode: 'insert',
              text: "YYY: xxx: YYY xxx: YYY:\n!!!: ooo: xxx: ooo xxx: ooo:",
              numCursors: 3
            });
          });
          return describe("predefined keymap on when has-occurrence", function() {
            beforeEach(function() {
              return set({
                textC: "Vim is editor I used before\nV|im is editor I used before\nVim is editor I used before\nVim is editor I used before"
              });
            });
            it('[insert-at-start] apply operation to preset-marker intersecting selected target', function() {
              ensure('g o', {
                occurrenceText: ['Vim', 'Vim', 'Vim', 'Vim']
              });
              classList.contains('has-occurrence');
              ensure('v k I', {
                mode: 'insert',
                numCursors: 2
              });
              editor.insertText("pure-");
              return ensure('escape', {
                mode: 'normal',
                textC: "pure!-Vim is editor I used before\npure|-Vim is editor I used before\nVim is editor I used before\nVim is editor I used before"
              });
            });
            return it('[insert-after-start] apply operation to preset-marker intersecting selected target', function() {
              set({
                cursor: [1, 1]
              });
              ensure('g o', {
                occurrenceText: ['Vim', 'Vim', 'Vim', 'Vim']
              });
              classList.contains('has-occurrence');
              ensure('v j A', {
                mode: 'insert',
                numCursors: 2
              });
              editor.insertText(" and Emacs");
              return ensure('escape', {
                mode: 'normal',
                textC: "Vim is editor I used before\nVim and Emac|s is editor I used before\nVim and Emac!s is editor I used before\nVim is editor I used before"
              });
            });
          });
        });
        describe("visual-mode", function() {
          return it('[upcase] apply to preset-marker as long as it intersects selection', function() {
            set({
              textC: "ooo: x|xx: ooo xxx: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('v j U', {
              text: "ooo: XXX: ooo XXX: ooo:\nXXX: ooo: xxx: ooo xxx: ooo:"
            });
          });
        });
        describe("visual-linewise-mode", function() {
          return it('[upcase] apply to preset-marker as long as it intersects selection', function() {
            set({
              cursor: [0, 6],
              text: "ooo: xxx: ooo xxx: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('V U', {
              text: "ooo: XXX: ooo XXX: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
          });
        });
        return describe("visual-blockwise-mode", function() {
          return it('[upcase] apply to preset-marker as long as it intersects selection', function() {
            set({
              cursor: [0, 6],
              text: "ooo: xxx: ooo xxx: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('ctrl-v j 2 w U', {
              text: "ooo: XXX: ooo xxx: ooo:\nxxx: ooo: XXX: ooo xxx: ooo:"
            });
          });
        });
      });
      describe("MoveToNextOccurrence, MoveToPreviousOccurrence", function() {
        beforeEach(function() {
          set({
            textC: "|ooo: xxx: ooo\n___: ooo: xxx:\nooo: xxx: ooo:"
          });
          return ensure('g o', {
            occurrenceText: ['ooo', 'ooo', 'ooo', 'ooo', 'ooo']
          });
        });
        describe("tab, shift-tab", function() {
          describe("cursor is at start of occurrence", function() {
            return it("search next/previous occurrence marker", function() {
              ensure('tab tab', {
                cursor: [1, 5]
              });
              ensure('2 tab', {
                cursor: [2, 10]
              });
              ensure('2 shift-tab', {
                cursor: [1, 5]
              });
              return ensure('2 shift-tab', {
                cursor: [0, 0]
              });
            });
          });
          return describe("when cursor is inside of occurrence", function() {
            beforeEach(function() {
              ensure("escape", {
                occurrenceCount: 0
              });
              set({
                textC: "oooo oo|oo oooo"
              });
              return ensure('g o', {
                occurrenceCount: 3
              });
            });
            describe("tab", function() {
              return it("move to next occurrence", function() {
                return ensure('tab', {
                  textC: 'oooo oooo |oooo'
                });
              });
            });
            return describe("shift-tab", function() {
              return it("move to previous occurrence", function() {
                return ensure('shift-tab', {
                  textC: '|oooo oooo oooo'
                });
              });
            });
          });
        });
        describe("as operator's target", function() {
          describe("tab", function() {
            it("operate on next occurrence and repeatable", function() {
              ensure("g U tab", {
                text: "OOO: xxx: OOO\n___: ooo: xxx:\nooo: xxx: ooo:",
                occurrenceCount: 3
              });
              ensure(".", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nooo: xxx: ooo:",
                occurrenceCount: 2
              });
              ensure("2 .", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 0
              });
              return expect(classList.contains('has-occurrence')).toBe(false);
            });
            return it("[o-modifier] operate on next occurrence and repeatable", function() {
              ensure("escape", {
                mode: 'normal',
                occurrenceCount: 0
              });
              ensure("g U o tab", {
                text: "OOO: xxx: OOO\n___: ooo: xxx:\nooo: xxx: ooo:",
                occurrenceCount: 0
              });
              ensure(".", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nooo: xxx: ooo:",
                occurrenceCount: 0
              });
              return ensure("2 .", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 0
              });
            });
          });
          return describe("shift-tab", function() {
            return it("operate on next previous and repeatable", function() {
              set({
                cursor: [2, 10]
              });
              ensure("g U shift-tab", {
                text: "ooo: xxx: ooo\n___: ooo: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 3
              });
              ensure(".", {
                text: "ooo: xxx: ooo\n___: OOO: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 2
              });
              ensure("2 .", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 0
              });
              return expect(classList.contains('has-occurrence')).toBe(false);
            });
          });
        });
        return describe("excude particular occurence by `.` repeat", function() {
          it("clear preset-occurrence and move to next", function() {
            return ensure('2 tab . g U i p', {
              textC: "OOO: xxx: OOO\n___: |ooo: xxx:\nOOO: xxx: OOO:"
            });
          });
          return it("clear preset-occurrence and move to previous", function() {
            return ensure('2 shift-tab . g U i p', {
              textC: "OOO: xxx: OOO\n___: OOO: xxx:\n|ooo: xxx: OOO:"
            });
          });
        });
      });
      describe("explict operator-modifier o and preset-marker", function() {
        beforeEach(function() {
          return set({
            textC: "|ooo: xxx: ooo xxx: ooo:\n___: ooo: xxx: ooo xxx: ooo:"
          });
        });
        describe("'o' modifier when preset occurrence already exists", function() {
          return it("'o' always pick cursor-word and overwrite existing preset marker)", function() {
            ensure("g o", {
              occurrenceText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"]
            });
            ensure("2 w d o", {
              occurrenceText: ["xxx", "xxx", "xxx", "xxx"],
              mode: 'operator-pending'
            });
            return ensure("j", {
              text: "ooo: : ooo : ooo:\n___: ooo: : ooo : ooo:",
              mode: 'normal'
            });
          });
        });
        return describe("occurrence bound operator don't overwite pre-existing preset marker", function() {
          return it("'o' always pick cursor-word and clear existing preset marker", function() {
            ensure("g o", {
              occurrenceText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"]
            });
            ensure("2 w g cmd-d", {
              occurrenceText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"],
              mode: 'operator-pending'
            });
            return ensure("j", {
              selectedText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"]
            });
          });
        });
      });
      return describe("toggle-preset-subword-occurrence commands", function() {
        beforeEach(function() {
          return set({
            textC: "\ncamelCa|se Cases\n\"CaseStudy\" SnakeCase\nUP_CASE\n\nother ParagraphCase"
          });
        });
        return describe("add preset subword-occurrence", function() {
          return it("mark subword under cursor", function() {
            return ensure('g O', {
              occurrenceText: ['Case', 'Case', 'Case', 'Case']
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9vY2N1cnJlbmNlLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUE2QyxPQUFBLENBQVEsZUFBUixDQUE3QyxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0IsdUJBQXhCLEVBQWtDOztFQUNsQyxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxZQUFULEVBQXVCLFNBQUE7QUFDckIsUUFBQTtJQUFBLE9BQXVFLEVBQXZFLEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsbUJBQWQsRUFBeUIsZ0JBQXpCLEVBQWlDLHVCQUFqQyxFQUFnRCxrQkFBaEQsRUFBMEQ7SUFDMUQsT0FBc0MsRUFBdEMsRUFBQyxzQkFBRCxFQUFlO0lBQ2YsZUFBQSxHQUFrQixTQUFDLElBQUQ7YUFDaEIsWUFBWSxDQUFDLFVBQWIsQ0FBd0IsSUFBeEI7SUFEZ0I7SUFFbEIscUJBQUEsR0FBd0IsU0FBQyxJQUFEO2FBQ3RCLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixJQUE5QjtJQURzQjtJQUd4QixVQUFBLENBQVcsU0FBQTtNQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztRQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjO1FBQ2QsU0FBQSxHQUFZLGFBQWEsQ0FBQztRQUMxQixZQUFBLEdBQWUsUUFBUSxDQUFDLFdBQVcsQ0FBQztlQUNwQyxtQkFBQSxHQUFzQixRQUFRLENBQUMsV0FBVyxDQUFDO01BTmpDLENBQVo7YUFRQSxJQUFBLENBQUssU0FBQTtlQUNILE9BQU8sQ0FBQyxXQUFSLENBQW9CLGFBQXBCO01BREcsQ0FBTDtJQVRTLENBQVg7SUFZQSxRQUFBLENBQVMsOEJBQVQsRUFBeUMsU0FBQTtN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QUFULEVBQTBDLFNBQUE7aUJBQ3hDLEVBQUEsQ0FBRywyQkFBSCxFQUFnQyxTQUFBO21CQUM5QixNQUFBLENBQU8sS0FBUCxFQUFjO2NBQUEsY0FBQSxFQUFnQixDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLE1BQWpCLEVBQXlCLE1BQXpCLENBQWhCO2FBQWQ7VUFEOEIsQ0FBaEM7UUFEd0MsQ0FBMUM7TUFab0QsQ0FBdEQ7SUE5Ym1DLENBQXJDO0VBcGpCcUIsQ0FBdkI7QUFIQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZSwgZGlzcGF0Y2gsIFRleHREYXRhLCBnZXRWaWV3fSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuZGVzY3JpYmUgXCJPY2N1cnJlbmNlXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlLCBjbGFzc0xpc3RdID0gW11cbiAgW3NlYXJjaEVkaXRvciwgc2VhcmNoRWRpdG9yRWxlbWVudF0gPSBbXVxuICBpbnB1dFNlYXJjaFRleHQgPSAodGV4dCkgLT5cbiAgICBzZWFyY2hFZGl0b3IuaW5zZXJ0VGV4dCh0ZXh0KVxuICBkaXNwYXRjaFNlYXJjaENvbW1hbmQgPSAobmFtZSkgLT5cbiAgICBkaXNwYXRjaChzZWFyY2hFZGl0b3JFbGVtZW50LCBuYW1lKVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbVxuICAgICAgY2xhc3NMaXN0ID0gZWRpdG9yRWxlbWVudC5jbGFzc0xpc3RcbiAgICAgIHNlYXJjaEVkaXRvciA9IHZpbVN0YXRlLnNlYXJjaElucHV0LmVkaXRvclxuICAgICAgc2VhcmNoRWRpdG9yRWxlbWVudCA9IHZpbVN0YXRlLnNlYXJjaElucHV0LmVkaXRvckVsZW1lbnRcblxuICAgIHJ1bnMgLT5cbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oZWRpdG9yRWxlbWVudClcblxuICBkZXNjcmliZSBcIm9wZXJhdG9yLW1vZGlmaWVyLW9jY3VycmVuY2VcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG5cbiAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgLS0tOiBvb286IHh4eDogb29vOlxuICAgICAgICBvb286IHh4eDogLS0tOiB4eHg6IG9vbzpcbiAgICAgICAgeHh4OiAtLS06IG9vbzogb29vOlxuXG4gICAgICAgIG9vbzogeHh4OiBvb286XG4gICAgICAgIC0tLTogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgb29vOiB4eHg6IC0tLTogeHh4OiBvb286XG4gICAgICAgIHh4eDogLS0tOiBvb286IG9vbzpcblxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwibyBtb2RpZmllclwiLCAtPlxuICAgICAgaXQgXCJjaGFuZ2Ugb2NjdXJyZW5jZSBvZiBjdXJzb3Igd29yZCBpbiBpbm5lci1wYXJhZ3JhcGhcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSBcImMgbyBpIHBcIixcbiAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgICE6IHh4eDogfDpcbiAgICAgICAgICAtLS06IHw6IHh4eDogfDpcbiAgICAgICAgICB8OiB4eHg6IC0tLTogeHh4OiB8OlxuICAgICAgICAgIHh4eDogLS0tOiB8OiB8OlxuXG4gICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICAtLS06IG9vbzogeHh4OiBvb286XG4gICAgICAgICAgb29vOiB4eHg6IC0tLTogeHh4OiBvb286XG4gICAgICAgICAgeHh4OiAtLS06IG9vbzogb29vOlxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCc9PT0nKVxuICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIixcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgID09IT06IHh4eDogPT18PTpcbiAgICAgICAgICAtLS06ID09fD06IHh4eDogPT18PTpcbiAgICAgICAgICA9PXw9OiB4eHg6IC0tLTogeHh4OiA9PXw9OlxuICAgICAgICAgIHh4eDogLS0tOiA9PXw9OiA9PXw9OlxuXG4gICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICAtLS06IG9vbzogeHh4OiBvb286XG4gICAgICAgICAgb29vOiB4eHg6IC0tLTogeHh4OiBvb286XG4gICAgICAgICAgeHh4OiAtLS06IG9vbzogb29vOlxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZW5zdXJlIFwifSBqIC5cIixcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgID09PTogeHh4OiA9PT06XG4gICAgICAgICAgLS0tOiA9PT06IHh4eDogPT09OlxuICAgICAgICAgID09PTogeHh4OiAtLS06IHh4eDogPT09OlxuICAgICAgICAgIHh4eDogLS0tOiA9PT06ID09PTpcblxuICAgICAgICAgID09IT06IHh4eDogPT18PTpcbiAgICAgICAgICAtLS06ID09fD06IHh4eDogPT18PTpcbiAgICAgICAgICA9PXw9OiB4eHg6IC0tLTogeHh4OiA9PXw9OlxuICAgICAgICAgIHh4eDogLS0tOiA9PXw9OiA9PXw9OlxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIk8gbW9kaWZpZXJcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgY2FtZWxDYXxzZSBDYXNlc1xuICAgICAgICAgIFwiQ2FzZVN0dWR5XCIgU25ha2VDYXNlXG4gICAgICAgICAgVVBfQ0FTRVxuXG4gICAgICAgICAgb3RoZXIgUGFyYWdyYXBoQ2FzZVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJkZWxldGUgc3Vid29yZC1vY2N1cnJlbmNlIGluIHBhcmFncmFwaCBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJkIE8gcFwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIGNhbWVsfCBDYXNlc1xuICAgICAgICAgIFwiU3R1ZHlcIiBTbmFrZVxuICAgICAgICAgIFVQX0NBU0VcblxuICAgICAgICAgIG90aGVyIFBhcmFncmFwaENhc2VcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFwiRyAuXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgY2FtZWwgQ2FzZXNcbiAgICAgICAgICBcIlN0dWR5XCIgU25ha2VcbiAgICAgICAgICBVUF9DQVNFXG5cbiAgICAgICAgICB8b3RoZXIgUGFyYWdyYXBoXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImFwcGx5IHZhcmlvdXMgb3BlcmF0b3IgdG8gb2NjdXJyZW5jZSBpbiB2YXJpb3VzIHRhcmdldFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgb29vOiB4eHg6IG8hb286XG4gICAgICAgICAgPT09OiBvb286IHh4eDogb29vOlxuICAgICAgICAgIG9vbzogeHh4OiA9PT06IHh4eDogb29vOlxuICAgICAgICAgIHh4eDogPT09OiBvb286IG9vbzpcbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwidXBwZXIgY2FzZSBpbm5lci13b3JkXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImcgVSBvIGkgbFwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBPT086IHh4eDogTyFPTzpcbiAgICAgICAgICA9PT06IG9vbzogeHh4OiBvb286XG4gICAgICAgICAgb29vOiB4eHg6ID09PTogeHh4OiBvb286XG4gICAgICAgICAgeHh4OiA9PT06IG9vbzogb29vOlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgXCIyIGogLlwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBPT086IHh4eDogT09POlxuICAgICAgICAgID09PTogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBPT086IHh4eDogPSE9PTogeHh4OiBPT086XG4gICAgICAgICAgeHh4OiA9PT06IG9vbzogb29vOlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgXCJqIC5cIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICA9PT06IG9vbzogeHh4OiBvb286XG4gICAgICAgICAgT09POiB4eHg6ID09PTogeHh4OiBPT086XG4gICAgICAgICAgeHh4OiA9PT06IE8hT086IE9PTzpcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJjbGlwIHRvIG11dGF0aW9uIGVuZCBiZWhhdmlvclwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICAgIG9vfG86eHh4Om9vbzpcbiAgICAgICAgICAgIHh4eDpvb286eHh4XG4gICAgICAgICAgICBcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcIltkIG8gcF0gZGVsZXRlIG9jY3VycmVuY2UgYW5kIGN1cnNvciBpcyBhdCBtdXRhdGlvbiBlbmRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJkIG8gcFwiLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgICB8Onh4eDo6XG4gICAgICAgICAgICB4eHg6Onh4eFxuICAgICAgICAgICAgXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgXCJbZCBvIGpdIGRlbGV0ZSBvY2N1cnJlbmNlIGFuZCBjdXJzb3IgaXMgYXQgbXV0YXRpb24gZW5kXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZCBvIGpcIixcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgICAgfDp4eHg6OlxuICAgICAgICAgICAgeHh4Ojp4eHhcbiAgICAgICAgICAgIFxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwibm90IGNsaXAgaWYgb3JpZ2luYWwgY3Vyc29yIG5vdCBpbnRlcnNlY3RzIGFueSBvY2N1cmVuY2UtbWFya2VyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWydvb28nLCAnb29vJywgJ29vbyddLCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIGtleXN0cm9rZSAnaicsIGN1cnNvcjogWzIsIDJdXG4gICAgICAgICAgZW5zdXJlIFwiZCBwXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICAgIDp4eHg6OlxuICAgICAgICAgICAgeHh8eDo6eHh4XG4gICAgICAgICAgICBcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJhdXRvIGV4dGVuZCB0YXJnZXQgcmFuZ2UgdG8gaW5jbHVkZSBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICB0ZXh0T3JpZ2luYWwgPSBcIlRoaXMgdGV4dCBoYXZlIDMgaW5zdGFuY2Ugb2YgJ3RleHQnIGluIHRoZSB3aG9sZSB0ZXh0LlxcblwiXG4gICAgICB0ZXh0RmluYWwgPSB0ZXh0T3JpZ2luYWwucmVwbGFjZSgvdGV4dC9nLCAnJylcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogdGV4dE9yaWdpbmFsXG5cbiAgICAgIGl0IFwiW2Zyb20gc3RhcnQgb2YgMXN0XVwiLCAtPiBzZXQgY3Vyc29yOiBbMCwgNV07IGVuc3VyZSAnZCBvICQnLCB0ZXh0OiB0ZXh0RmluYWxcbiAgICAgIGl0IFwiW2Zyb20gbWlkZGxlIG9mIDFzdF1cIiwgLT4gc2V0IGN1cnNvcjogWzAsIDddOyBlbnN1cmUgJ2QgbyAkJywgdGV4dDogdGV4dEZpbmFsXG4gICAgICBpdCBcIltmcm9tIGVuZCBvZiBsYXN0XVwiLCAtPiBzZXQgY3Vyc29yOiBbMCwgNTJdOyBlbnN1cmUgJ2QgbyAwJywgdGV4dDogdGV4dEZpbmFsXG4gICAgICBpdCBcIltmcm9tIG1pZGRsZSBvZiBsYXN0XVwiLCAtPiBzZXQgY3Vyc29yOiBbMCwgNTFdOyBlbnN1cmUgJ2QgbyAwJywgdGV4dDogdGV4dEZpbmFsXG5cbiAgICBkZXNjcmliZSBcInNlbGVjdC1vY2N1cnJlbmNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIHZpbS1tb2RlLXBsdXMgdmltLW1vZGUtcGx1c1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJ3aGF0IHRoZSBjdXJzb3Itd29yZFwiLCAtPlxuICAgICAgICBlbnN1cmVDdXJzb3JXb3JkID0gKGluaXRpYWxQb2ludCwge3NlbGVjdGVkVGV4dH0pIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogaW5pdGlhbFBvaW50XG4gICAgICAgICAgZW5zdXJlIFwiZyBjbWQtZCBpIHBcIixcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogc2VsZWN0ZWRUZXh0XG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogXCJub3JtYWxcIlxuXG4gICAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIG5vcm1hbCB3b3JkXCIsIC0+XG4gICAgICAgICAgaXQgXCJwaWNrIHdvcmQgYnV0IG5vdCBwaWNrIHBhcnRpYWxseSBtYXRjaGVkIG9uZSBbYnkgc2VsZWN0XVwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlQ3Vyc29yV29yZChbMCwgMF0sIHNlbGVjdGVkVGV4dDogWyd2aW0nLCAndmltJ10pXG4gICAgICAgICAgICBlbnN1cmVDdXJzb3JXb3JkKFswLCAzXSwgc2VsZWN0ZWRUZXh0OiBbJy0nLCAnLScsICctJywgJy0nXSlcbiAgICAgICAgICAgIGVuc3VyZUN1cnNvcldvcmQoWzAsIDRdLCBzZWxlY3RlZFRleHQ6IFsnbW9kZScsICdtb2RlJ10pXG4gICAgICAgICAgICBlbnN1cmVDdXJzb3JXb3JkKFswLCA5XSwgc2VsZWN0ZWRUZXh0OiBbJ3BsdXMnLCAncGx1cyddKVxuXG4gICAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIGF0IHNpbmdsZSB3aGl0ZSBzcGFjZSBbYnkgZGVsZXRlXVwiLCAtPlxuICAgICAgICAgIGl0IFwicGljayBzaW5nbGUgd2hpdGUgc3BhY2Ugb25seVwiLCAtPlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBvb28gb29vIG9vb1xuICAgICAgICAgICAgICAgb29vIG9vbyBvb29cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgICBlbnN1cmUgXCJkIG8gaSBwXCIsXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBvb29vb29vb29cbiAgICAgICAgICAgICAgb29vb29vb29vXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIGF0IHNlcXVuY2Ugb2Ygc3BhY2UgW2J5IGRlbGV0ZV1cIiwgLT5cbiAgICAgICAgICBpdCBcInNlbGVjdCBzZXF1bmNlIG9mIHdoaXRlIHNwYWNlcyBpbmNsdWRpbmcgcGFydGlhbGx5IG1hY2hlZCBvbmVcIiwgLT5cbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICAgIG9vb19fX29vbyBvb29cbiAgICAgICAgICAgICAgIG9vbyBvb29fX19fb29vX19fX19fX19vb29cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBlbnN1cmUgXCJkIG8gaSBwXCIsXG4gICAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgICAgb29vb29vIG9vb1xuICAgICAgICAgICAgICAgb29vIG9vbyBvb28gIG9vb1xuICAgICAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcInN0YXlPbk9jY3VycmVuY2Ugc2V0dGluZ3NcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgIGFhYSwgYmJiLCBjY2NcbiAgICAgICAgYmJiLCBhfGFhLCBhYWFcblxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiB0cnVlICg9IGRlZmF1bHQpXCIsIC0+XG4gICAgICBpdCBcImtlZXAgY3Vyc29yIHBvc2l0aW9uIGFmdGVyIG9wZXJhdGlvbiBmaW5pc2hlZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgVSBvIHAnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIEFBQSwgYmJiLCBjY2NcbiAgICAgICAgICBiYmIsIEF8QUEsIEFBQVxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZmFsc2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25PY2N1cnJlbmNlJywgZmFsc2UpXG5cbiAgICAgIGl0IFwibW92ZSBjdXJzb3IgdG8gc3RhcnQgb2YgdGFyZ2V0IGFzIGxpa2Ugbm9uLW9jdXJyZW5jZSBvcGVyYXRvclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgVSBvIHAnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIHxBQUEsIGJiYiwgY2NjXG4gICAgICAgICAgYmJiLCBBQUEsIEFBQVxuXG4gICAgICAgICAgXCJcIlwiXG5cblxuICBkZXNjcmliZSBcImZyb20gdmlzdWFsLW1vZGUuaXMtbmFycm93ZWRcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIG9vbzogeHh4OiBvb29cbiAgICAgICAgfHx8OiBvb286IHh4eDogb29vXG4gICAgICAgIG9vbzogeHh4OiB8fHw6IHh4eDogb29vXG4gICAgICAgIHh4eDogfHx8OiBvb286IG9vb1xuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiW3ZDXSBzZWxlY3Qtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3QgY3Vyc29yLXdvcmQgd2hpY2ggaW50ZXJzZWN0aW5nIHNlbGVjdGlvbiB0aGVuIGFwcGx5IHVwcGVyLWNhc2VcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwidiAyIGogY21kLWRcIixcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFsnb29vJywgJ29vbycsICdvb28nLCAnb29vJywgJ29vbyddXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICAgICAgZW5zdXJlIFwiVVwiLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICB8fHw6IE9PTzogeHh4OiBPT09cbiAgICAgICAgICBPT086IHh4eDogfHx8OiB4eHg6IG9vb1xuICAgICAgICAgIHh4eDogfHx8OiBvb286IG9vb1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG51bUN1cnNvcnM6IDVcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgZGVzY3JpYmUgXCJbdkxdIHNlbGVjdC1vY2N1cnJlbmNlXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBjdXJzb3Itd29yZCB3aGljaCBpbnRlcnNlY3Rpbmcgc2VsZWN0aW9uIHRoZW4gYXBwbHkgdXBwZXItY2FzZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCI1IGwgViAyIGogY21kLWRcIixcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFsneHh4JywgJ3h4eCcsICd4eHgnLCAneHh4J11cbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cblxuICAgICAgICBlbnN1cmUgXCJVXCIsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgb29vOiBYWFg6IG9vb1xuICAgICAgICAgIHx8fDogb29vOiBYWFg6IG9vb1xuICAgICAgICAgIG9vbzogWFhYOiB8fHw6IFhYWDogb29vXG4gICAgICAgICAgeHh4OiB8fHw6IG9vbzogb29vXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbnVtQ3Vyc29yczogNFxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICBkZXNjcmliZSBcIlt2Ql0gc2VsZWN0LW9jY3VycmVuY2VcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IGN1cnNvci13b3JkIHdoaWNoIGludGVyc2VjdGluZyBzZWxlY3Rpb24gdGhlbiBhcHBseSB1cHBlci1jYXNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcIlcgY3RybC12IDIgaiAkIGggY21kLWQgVVwiLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIG9vbzogeHh4OiBPT09cbiAgICAgICAgICB8fHw6IE9PTzogeHh4OiBPT09cbiAgICAgICAgICBvb286IHh4eDogfHx8OiB4eHg6IE9PT1xuICAgICAgICAgIHh4eDogfHx8OiBvb286IG9vb1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG51bUN1cnNvcnM6IDRcblxuICAgICAgaXQgXCJwaWNrIGN1cnNvci13b3JkIGZyb20gdkIgcmFuZ2VcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiY3RybC12IDcgbCAyIGogbyBjbWQtZCBVXCIsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgT09POiB4eHg6IG9vb1xuICAgICAgICAgIHx8fDogT09POiB4eHg6IG9vb1xuICAgICAgICAgIE9PTzogeHh4OiB8fHw6IHh4eDogb29vXG4gICAgICAgICAgeHh4OiB8fHw6IG9vbzogb29vXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbnVtQ3Vyc29yczogM1xuXG4gIGRlc2NyaWJlIFwiaW5jcmVtZW50YWwgc2VhcmNoIGludGVncmF0aW9uOiBjaGFuZ2Utb2NjdXJyZW5jZS1mcm9tLXNlYXJjaCwgc2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2hcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXR0aW5ncy5zZXQoJ2luY3JlbWVudGFsU2VhcmNoJywgdHJ1ZSlcbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgb29vOiB4eHg6IG9vbzogMDAwMFxuICAgICAgICAxOiBvb286IDIyOiBvb286XG4gICAgICAgIG9vbzogeHh4OiB8fHw6IHh4eDogMzMzMzpcbiAgICAgICAgNDQ0OiB8fHw6IG9vbzogb29vOlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiZnJvbSBub3JtYWwgbW9kZVwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3Qgb2NjdXJyZW5jZSBieSBwYXR0ZXJuIG1hdGNoXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAnLydcbiAgICAgICAgaW5wdXRTZWFyY2hUZXh0KCdcXFxcZHszLDR9JylcbiAgICAgICAgZGlzcGF0Y2hTZWFyY2hDb21tYW5kKCd2aW0tbW9kZS1wbHVzOnNlbGVjdC1vY2N1cnJlbmNlLWZyb20tc2VhcmNoJylcbiAgICAgICAgZW5zdXJlICdpIGUnLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogWyczMzMzJywgJzQ0NCcsICcwMDAwJ10gIyBXaHkgJzAwMDAnIGNvbWVzIGxhc3QgaXMgJzAwMDAnIGJlY29tZSBsYXN0IHNlbGVjdGlvbi5cbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cblxuICAgICAgaXQgXCJjaGFuZ2Ugb2NjdXJyZW5jZSBieSBwYXR0ZXJuIG1hdGNoXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAnLydcbiAgICAgICAgaW5wdXRTZWFyY2hUZXh0KCdeXFxcXHcrOicpXG4gICAgICAgIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCgndmltLW1vZGUtcGx1czpjaGFuZ2Utb2NjdXJyZW5jZS1mcm9tLXNlYXJjaCcpXG4gICAgICAgIGVuc3VyZSAnaSBlJywgbW9kZTogJ2luc2VydCdcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2hlbGxvJylcbiAgICAgICAgZW5zdXJlXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgaGVsbG8geHh4OiBvb286IDAwMDBcbiAgICAgICAgICBoZWxsbyBvb286IDIyOiBvb286XG4gICAgICAgICAgaGVsbG8geHh4OiB8fHw6IHh4eDogMzMzMzpcbiAgICAgICAgICBoZWxsbyB8fHw6IG9vbzogb29vOlxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBkZXNjcmliZSBcInZpc3VhbCBjaGFyYWN0ZXJ3aXNlXCIsIC0+XG4gICAgICAgIGl0IFwiY2hhbmdlIG9jY3VycmVuY2UgaW4gbmFycm93ZWQgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAga2V5c3Ryb2tlICd2IGogLydcbiAgICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ28rJylcbiAgICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6c2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICAgIGVuc3VyZSAnVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIE9PTzogeHh4OiBPT086IDAwMDBcbiAgICAgICAgICAgIDE6IG9vbzogMjI6IG9vbzpcbiAgICAgICAgICAgIG9vbzogeHh4OiB8fHw6IHh4eDogMzMzMzpcbiAgICAgICAgICAgIDQ0NDogfHx8OiBvb286IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcInZpc3VhbCBsaW5ld2lzZVwiLCAtPlxuICAgICAgICBpdCBcImNoYW5nZSBvY2N1cnJlbmNlIGluIG5hcnJvd2VkIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICAgIGtleXN0cm9rZSAnViBqIC8nXG4gICAgICAgICAgaW5wdXRTZWFyY2hUZXh0KCdvKycpXG4gICAgICAgICAgZGlzcGF0Y2hTZWFyY2hDb21tYW5kKCd2aW0tbW9kZS1wbHVzOnNlbGVjdC1vY2N1cnJlbmNlLWZyb20tc2VhcmNoJylcbiAgICAgICAgICBlbnN1cmUgJ1UnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBPT086IHh4eDogT09POiAwMDAwXG4gICAgICAgICAgICAxOiBPT086IDIyOiBPT086XG4gICAgICAgICAgICBvb286IHh4eDogfHx8OiB4eHg6IDMzMzM6XG4gICAgICAgICAgICA0NDQ6IHx8fDogb29vOiBvb286XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ2aXN1YWwgYmxvY2t3aXNlXCIsIC0+XG4gICAgICAgIGl0IFwiY2hhbmdlIG9jY3VycmVuY2UgaW4gbmFycm93ZWQgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAga2V5c3Ryb2tlICdjdHJsLXYgMiBqIDEgMCBsIC8nXG4gICAgICAgICAgaW5wdXRTZWFyY2hUZXh0KCdvKycpXG4gICAgICAgICAgZGlzcGF0Y2hTZWFyY2hDb21tYW5kKCd2aW0tbW9kZS1wbHVzOnNlbGVjdC1vY2N1cnJlbmNlLWZyb20tc2VhcmNoJylcbiAgICAgICAgICBlbnN1cmUgJ1UnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IHh4eDogT09POiAwMDAwXG4gICAgICAgICAgICAxOiBPT086IDIyOiBPT086XG4gICAgICAgICAgICBvb286IHh4eDogfHx8OiB4eHg6IDMzMzM6XG4gICAgICAgICAgICA0NDQ6IHx8fDogb29vOiBvb286XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwicGVyc2lzdGVudC1zZWxlY3Rpb24gaXMgZXhpc3RzXCIsIC0+XG4gICAgICBwZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2UgPSBudWxsXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJjcmVhdGUtcGVyc2lzdGVudC1zZWxlY3Rpb25cIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICdtJzogJ3ZpbS1tb2RlLXBsdXM6Y3JlYXRlLXBlcnNpc3RlbnQtc2VsZWN0aW9uJ1xuXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIG9vbzogeHh4OiBvb286XG4gICAgICAgICAgfHx8OiBvb286IHh4eDogb29vOlxuICAgICAgICAgIG9vbzogeHh4OiB8fHw6IHh4eDogb29vOlxuICAgICAgICAgIHh4eDogfHx8OiBvb286IG9vbzpcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICAgIHBlcnNpc3RlbnRTZWxlY3Rpb25CdWZmZXJSYW5nZSA9IFtcbiAgICAgICAgICBbWzAsIDBdLCBbMiwgMF1dXG4gICAgICAgICAgW1szLCAwXSwgWzQsIDBdXVxuICAgICAgICBdXG4gICAgICAgIGVuc3VyZSAnViBqIG0gRyBtIG0nLFxuICAgICAgICAgIHBlcnNpc3RlbnRTZWxlY3Rpb25CdWZmZXJSYW5nZTogcGVyc2lzdGVudFNlbGVjdGlvbkJ1ZmZlclJhbmdlXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBubyBzZWxlY3Rpb24gaXMgZXhpc3RzXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0IG9jY3VycmVuY2UgaW4gYWxsIHBlcnNpc3RlbnQtc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAga2V5c3Ryb2tlICcvJ1xuICAgICAgICAgIGlucHV0U2VhcmNoVGV4dCgneHh4JylcbiAgICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6c2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICAgIGVuc3VyZSAnVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogWFhYOiBvb286XG4gICAgICAgICAgICB8fHw6IG9vbzogWFhYOiBvb286XG4gICAgICAgICAgICBvb286IHh4eDogfHx8OiB4eHg6IG9vbzpcbiAgICAgICAgICAgIFhYWDogfHx8OiBvb286IG9vbzpcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgcGVyc2lzdGVudFNlbGVjdGlvbkNvdW50OiAwXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBib3RoIGV4aXRzLCBvcGVyYXRvciBhcHBsaWVkIHRvIGJvdGhcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3QgYWxsIG9jY3VycmVuY2UgaW4gc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAga2V5c3Ryb2tlICdWIDIgaiAvJ1xuICAgICAgICAgIGlucHV0U2VhcmNoVGV4dCgneHh4JylcbiAgICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6c2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICAgIGVuc3VyZSAnVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogWFhYOiBvb286XG4gICAgICAgICAgICB8fHw6IG9vbzogWFhYOiBvb286XG4gICAgICAgICAgICBvb286IFhYWDogfHx8OiBYWFg6IG9vbzpcbiAgICAgICAgICAgIFhYWDogfHx8OiBvb286IG9vbzpcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgcGVyc2lzdGVudFNlbGVjdGlvbkNvdW50OiAwXG5cbiAgICBkZXNjcmliZSBcImRlbW9uc3RyYXRlIHBlcnNpc3RlbnQtc2VsZWN0aW9uJ3MgcHJhY3RpY2FsIHNjZW5hcmlvXCIsIC0+XG4gICAgICBbb2xkR3JhbW1hcl0gPSBbXVxuICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKG9sZEdyYW1tYXIpXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcImNyZWF0ZS1wZXJzaXN0ZW50LXNlbGVjdGlvblwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ20nOiAndmltLW1vZGUtcGx1czp0b2dnbGUtcGVyc2lzdGVudC1zZWxlY3Rpb24nXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBvbGRHcmFtbWFyID0gZWRpdG9yLmdldEdyYW1tYXIoKVxuICAgICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZSgnc291cmNlLmNvZmZlZScpKVxuXG4gICAgICAgIHNldCB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAoQG1haW4sIEBlZGl0b3IsIEBzdGF0dXNCYXJNYW5hZ2VyKSAtPlxuICAgICAgICAgICAgICBAZWRpdG9yRWxlbWVudCA9IEBlZGl0b3IuZWxlbWVudFxuICAgICAgICAgICAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgICAgICAgICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICAgICAgICAgICAgQG1vZGVNYW5hZ2VyID0gbmV3IE1vZGVNYW5hZ2VyKHRoaXMpXG4gICAgICAgICAgICAgIEBtYXJrID0gbmV3IE1hcmtNYW5hZ2VyKHRoaXMpXG4gICAgICAgICAgICAgIEByZWdpc3RlciA9IG5ldyBSZWdpc3Rlck1hbmFnZXIodGhpcylcbiAgICAgICAgICAgICAgQHBlcnNpc3RlbnRTZWxlY3Rpb25zID0gW11cblxuICAgICAgICAgICAgICBAaGlnaGxpZ2h0U2VhcmNoU3Vic2NyaXB0aW9uID0gQGVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxUb3AgPT5cbiAgICAgICAgICAgICAgICBAcmVmcmVzaEhpZ2hsaWdodFNlYXJjaCgpXG5cbiAgICAgICAgICAgICAgQG9wZXJhdGlvblN0YWNrID0gbmV3IE9wZXJhdGlvblN0YWNrKHRoaXMpXG4gICAgICAgICAgICAgIEBjdXJzb3JTdHlsZU1hbmFnZXIgPSBuZXcgQ3Vyc29yU3R5bGVNYW5hZ2VyKHRoaXMpXG5cbiAgICAgICAgICAgIGFub3RoZXJGdW5jOiAtPlxuICAgICAgICAgICAgICBAaGVsbG8gPSBbXVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0ICdjaGFuZ2UgYWxsIGFzc2lnbm1lbnQoXCI9XCIpIG9mIGN1cnJlbnQtZnVuY3Rpb24gdG8gXCI/PVwiJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSBbJ2ogZicsIGlucHV0OiAnPSddLCBjdXJzb3I6IFsxLCAxN11cblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAga2V5c3Ryb2tlIFtcbiAgICAgICAgICAgICdnIGNtZC1kJyAjIHNlbGVjdC1vY2N1cnJlbmNlXG4gICAgICAgICAgICAnaSBmJyAgICAgIyBpbm5lci1mdW5jdGlvbi10ZXh0LW9iamVjdFxuICAgICAgICAgICAgJ20nICAgICAgICMgdG9nZ2xlLXBlcnNpc3RlbnQtc2VsZWN0aW9uXG4gICAgICAgICAgXS5qb2luKFwiIFwiKVxuXG4gICAgICAgICAgdGV4dHNJbkJ1ZmZlclJhbmdlID0gdmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJCdWZmZXJSYW5nZXMoKS5tYXAgKHJhbmdlKSAtPlxuICAgICAgICAgICAgZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICAgIHRleHRzSW5CdWZmZXJSYW5nZUlzQWxsRXF1YWxDaGFyID0gdGV4dHNJbkJ1ZmZlclJhbmdlLmV2ZXJ5KCh0ZXh0KSAtPiB0ZXh0IGlzICc9JylcbiAgICAgICAgICBleHBlY3QodGV4dHNJbkJ1ZmZlclJhbmdlSXNBbGxFcXVhbENoYXIpLnRvQmUodHJ1ZSlcbiAgICAgICAgICBleHBlY3QodmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJzKCkpLnRvSGF2ZUxlbmd0aCgxMSlcblxuICAgICAgICAgIGtleXN0cm9rZSAnMiBsJyAjIHRvIG1vdmUgdG8gb3V0LXNpZGUgb2YgcmFuZ2UtbXJrZXJcbiAgICAgICAgICBlbnN1cmUgWycvJywgc2VhcmNoOiAnPT4nXSwgY3Vyc29yOiBbOSwgNjldXG4gICAgICAgICAga2V5c3Ryb2tlIFwibVwiICMgY2xlYXIgcGVyc2lzdGVudFNlbGVjdGlvbiBhdCBjdXJzb3Igd2hpY2ggaXMgPSBzaWduIHBhcnQgb2YgZmF0IGFycm93LlxuICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlcnMoKSkudG9IYXZlTGVuZ3RoKDEwKVxuXG4gICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtcGVyc2lzdGVudC1zZWxlY3Rpb24nKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBrZXlzdHJva2UgW1xuICAgICAgICAgICAgJ2N0cmwtY21kLWcnICMgc2VsZWN0LXBlcnNpc3RlbnQtc2VsZWN0aW9uXG4gICAgICAgICAgICAnSScgICAgICAgICAgIyBJbnNlcnQgYXQgc3RhcnQgb2Ygc2VsZWN0aW9uXG4gICAgICAgICAgXVxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCc/JylcbiAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAoQG1haW4sIEBlZGl0b3IsIEBzdGF0dXNCYXJNYW5hZ2VyKSAtPlxuICAgICAgICAgICAgICBAZWRpdG9yRWxlbWVudCA/PSBAZWRpdG9yLmVsZW1lbnRcbiAgICAgICAgICAgICAgQGVtaXR0ZXIgPz0gbmV3IEVtaXR0ZXJcbiAgICAgICAgICAgICAgQHN1YnNjcmlwdGlvbnMgPz0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICAgICAgICAgICAgQG1vZGVNYW5hZ2VyID89IG5ldyBNb2RlTWFuYWdlcih0aGlzKVxuICAgICAgICAgICAgICBAbWFyayA/PSBuZXcgTWFya01hbmFnZXIodGhpcylcbiAgICAgICAgICAgICAgQHJlZ2lzdGVyID89IG5ldyBSZWdpc3Rlck1hbmFnZXIodGhpcylcbiAgICAgICAgICAgICAgQHBlcnNpc3RlbnRTZWxlY3Rpb25zID89IFtdXG5cbiAgICAgICAgICAgICAgQGhpZ2hsaWdodFNlYXJjaFN1YnNjcmlwdGlvbiA/PSBAZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbFRvcCA9PlxuICAgICAgICAgICAgICAgIEByZWZyZXNoSGlnaGxpZ2h0U2VhcmNoKClcblxuICAgICAgICAgICAgICBAb3BlcmF0aW9uU3RhY2sgPz0gbmV3IE9wZXJhdGlvblN0YWNrKHRoaXMpXG4gICAgICAgICAgICAgIEBjdXJzb3JTdHlsZU1hbmFnZXIgPz0gbmV3IEN1cnNvclN0eWxlTWFuYWdlcih0aGlzKVxuXG4gICAgICAgICAgICBhbm90aGVyRnVuYzogLT5cbiAgICAgICAgICAgICAgQGhlbGxvID0gW11cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwicHJlc2V0IG9jY3VycmVuY2UgbWFya2VyXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICBUaGlzIHRleHQgaGF2ZSAzIGluc3RhbmNlIG9mICd0ZXh0JyBpbiB0aGUgd2hvbGUgdGV4dFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwidG9nZ2xlLXByZXNldC1vY2N1cnJlbmNlIGNvbW1hbmRzXCIsIC0+XG4gICAgICBkZXNjcmliZSBcImluIG5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwiYWRkIHByZXNldCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgaXQgJ3NldCBjdXJzb3Itd2FyZCBhcyBwcmVzZXQgb2NjdXJyZW5jZSBtYXJrZXIgYW5kIG5vdCBtb3ZlIGN1cnNvcicsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiAnVGhpcycsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWydUaGlzJywgJ3RleHQnLCAndGV4dCcsICd0ZXh0J10sIGN1cnNvcjogWzAsIDVdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJyZW1vdmUgcHJlc2V0IG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICBpdCAncmVtb3ZlcyBvY2N1cnJlbmNlIG9uZSBieSBvbmUgc2VwYXJhdGVseScsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiAnVGhpcycsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWydUaGlzJywgJ3RleHQnLCAndGV4dCcsICd0ZXh0J10sIGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiBbJ1RoaXMnLCAndGV4dCcsICd0ZXh0J10sIGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAgICBlbnN1cmUgJ2IgZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsndGV4dCcsICd0ZXh0J10sIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgaXQgJ3JlbW92ZXMgYWxsIG9jY3VycmVuY2UgaW4gdGhpcyBlZGl0b3IgYnkgZXNjYXBlJywgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6ICdUaGlzJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiBbJ1RoaXMnLCAndGV4dCcsICd0ZXh0JywgJ3RleHQnXSwgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJywgb2NjdXJyZW5jZUNvdW50OiAwXG5cbiAgICAgICAgICBpdCAnY2FuIHJlY2FsbCBwcmV2aW91c2x5IHNldCBvY2N1cmVuY2UgcGF0dGVybiBieSBgZyAuYCcsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3cgdiBsIGcgbycsIG9jY3VycmVuY2VUZXh0OiBbJ3RlJywgJ3RlJywgJ3RlJ10sIGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgZXhwZWN0KHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldCgnbGFzdE9jY3VycmVuY2VQYXR0ZXJuJykpLnRvRXF1YWwoL3RlL2cpXG5cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzAsIDEwXSAjIHRvIG1vdmUgY3Vyc29yIHRvIHRleHQgYGhhdmVgXG4gICAgICAgICAgICBlbnN1cmUgJ2cgLicsIG9jY3VycmVuY2VUZXh0OiBbJ3RlJywgJ3RlJywgJ3RlJ10sIGN1cnNvcjogWzAsIDEwXVxuXG4gICAgICAgICAgICAjIEJ1dCBvcGVyYXRvciBtb2RpZmllciBub3QgdXBkYXRlIGxhc3RPY2N1cnJlbmNlUGF0dGVyblxuICAgICAgICAgICAgZW5zdXJlICdnIFUgbyAkJywgdGV4dEM6IFwiVGhpcyB0ZXh0IHxIQVZFIDMgaW5zdGFuY2Ugb2YgJ3RleHQnIGluIHRoZSB3aG9sZSB0ZXh0XCJcbiAgICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoJ2xhc3RPY2N1cnJlbmNlUGF0dGVybicpKS50b0VxdWFsKC90ZS9nKVxuXG4gICAgICAgIGRlc2NyaWJlIFwicmVzdG9yZSBsYXN0IG9jY3VycmVuY2UgbWFya2VyIGJ5IGFkZC1wcmVzZXQtb2NjdXJyZW5jZS1mcm9tLWxhc3Qtb2NjdXJyZW5jZS1wYXR0ZXJuXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgY2FtZWxcbiAgICAgICAgICAgICAgY2FtZWxDYXNlXG4gICAgICAgICAgICAgIGNhbWVsc1xuICAgICAgICAgICAgICBjYW1lbFxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBpdCBcImNhbiByZXN0b3JlIG9jY3VycmVuY2UtbWFya2VyIGFkZGVkIGJ5IGBnIG9gIGluIG5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIGVuc3VyZSBcImcgb1wiLCBvY2N1cnJlbmNlVGV4dDogWydjYW1lbCcsICdjYW1lbCddXG4gICAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgZW5zdXJlIFwiZyAuXCIsIG9jY3VycmVuY2VUZXh0OiBbJ2NhbWVsJywgJ2NhbWVsJ11cblxuICAgICAgICAgIGl0IFwiY2FuIHJlc3RvcmUgb2NjdXJyZW5jZS1tYXJrZXIgYWRkZWQgYnkgYGcgb2AgaW4gdmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlIFwidiBpIHdcIiwgc2VsZWN0ZWRUZXh0OiBcImNhbWVsXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImcgb1wiLCBvY2N1cnJlbmNlVGV4dDogWydjYW1lbCcsICdjYW1lbCcsICdjYW1lbCcsICdjYW1lbCddXG4gICAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgZW5zdXJlIFwiZyAuXCIsIG9jY3VycmVuY2VUZXh0OiBbJ2NhbWVsJywgJ2NhbWVsJywgJ2NhbWVsJywgJ2NhbWVsJ11cblxuICAgICAgICAgIGl0IFwiY2FuIHJlc3RvcmUgb2NjdXJyZW5jZS1tYXJrZXIgYWRkZWQgYnkgYGcgT2AgaW4gbm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlIFwiZyBPXCIsIG9jY3VycmVuY2VUZXh0OiBbJ2NhbWVsJywgJ2NhbWVsJywgJ2NhbWVsJ11cbiAgICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJywgb2NjdXJyZW5jZUNvdW50OiAwXG4gICAgICAgICAgICBlbnN1cmUgXCJnIC5cIiwgb2NjdXJyZW5jZVRleHQ6IFsnY2FtZWwnLCAnY2FtZWwnLCAnY2FtZWwnXVxuXG4gICAgICAgIGRlc2NyaWJlIFwiY3NzIGNsYXNzIGhhcy1vY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgZGVzY3JpYmUgXCJtYW51YWxseSB0b2dnbGUgYnkgdG9nZ2xlLXByZXNldC1vY2N1cnJlbmNlIGNvbW1hbmRcIiwgLT5cbiAgICAgICAgICAgIGl0ICdpcyBhdXRvLXNldC91bnNldCB3aGV0ZXIgYXQgbGVhc3Qgb25lIHByZXNldC1vY2N1cnJlbmNlIHdhcyBleGlzdHMgb3Igbm90JywgLT5cbiAgICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZShmYWxzZSlcbiAgICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogJ1RoaXMnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgICBleHBlY3QoY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpKS50b0JlKHRydWUpXG4gICAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZUNvdW50OiAwLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgICBleHBlY3QoY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpKS50b0JlKGZhbHNlKVxuXG4gICAgICAgICAgZGVzY3JpYmUgXCJjaGFuZ2UgJ0lOU0lERScgb2YgbWFya2VyXCIsIC0+XG4gICAgICAgICAgICBtYXJrZXJMYXllclVwZGF0ZWQgPSBudWxsXG4gICAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICAgIG1hcmtlckxheWVyVXBkYXRlZCA9IGZhbHNlXG5cbiAgICAgICAgICAgIGl0ICdkZXN0cm95IG1hcmtlciBhbmQgcmVmbGVjdCB0byBcImhhcy1vY2N1cnJlbmNlXCIgQ1NTJywgLT5cbiAgICAgICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgICAgIGV4cGVjdChjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJykpLnRvQmUoZmFsc2UpXG4gICAgICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogJ1RoaXMnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgICAgIGV4cGVjdChjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJykpLnRvQmUodHJ1ZSlcblxuICAgICAgICAgICAgICAgIGVuc3VyZSAnbCBpJywgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICAgICAgICB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5tYXJrZXJMYXllci5vbkRpZFVwZGF0ZSAtPlxuICAgICAgICAgICAgICAgICAgbWFya2VyTGF5ZXJVcGRhdGVkID0gdHJ1ZVxuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJy0tJylcbiAgICAgICAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIixcbiAgICAgICAgICAgICAgICAgIHRleHRDOiBcIlQtfC1oaXMgdGV4dCBoYXZlIDMgaW5zdGFuY2Ugb2YgJ3RleHQnIGluIHRoZSB3aG9sZSB0ZXh0XCJcbiAgICAgICAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICAgICAgICBtYXJrZXJMYXllclVwZGF0ZWRcblxuICAgICAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICAgICAgZW5zdXJlIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgICAgIGV4cGVjdChjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJykpLnRvQmUoZmFsc2UpXG5cbiAgICAgIGRlc2NyaWJlIFwiaW4gdmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgICAgZGVzY3JpYmUgXCJhZGQgcHJlc2V0IG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICBpdCAnc2V0IHNlbGVjdGVkLXRleHQgYXMgcHJlc2V0IG9jY3VycmVuY2UgbWFya2VyIGFuZCBub3QgbW92ZSBjdXJzb3InLCAtPlxuICAgICAgICAgICAgZW5zdXJlICd3IHYgbCcsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXSwgc2VsZWN0ZWRUZXh0OiAndGUnXG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG1vZGU6ICdub3JtYWwnLCBvY2N1cnJlbmNlVGV4dDogWyd0ZScsICd0ZScsICd0ZSddXG4gICAgICAgIGRlc2NyaWJlIFwiaXMtbmFycm93ZWQgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgW3RleHRPcmlnaW5hbF0gPSBbXVxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHRleHRPcmlnaW5hbCA9IFwiXCJcIlxuICAgICAgICAgICAgICBUaGlzIHRleHQgaGF2ZSAzIGluc3RhbmNlIG9mICd0ZXh0JyBpbiB0aGUgd2hvbGUgdGV4dFxuICAgICAgICAgICAgICBUaGlzIHRleHQgaGF2ZSAzIGluc3RhbmNlIG9mICd0ZXh0JyBpbiB0aGUgd2hvbGUgdGV4dFxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgICB0ZXh0OiB0ZXh0T3JpZ2luYWxcbiAgICAgICAgICBpdCBcInBpY2sgb2N1cnJlbmNlLXdvcmQgZnJvbSBjdXJzb3IgcG9zaXRpb24gYW5kIGNvbnRpbnVlIHZpc3VhbC1tb2RlXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3cgViBqJywgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXSwgc2VsZWN0ZWRUZXh0OiB0ZXh0T3JpZ2luYWxcbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJyxcbiAgICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHRPcmlnaW5hbFxuICAgICAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogWyd0ZXh0JywgJ3RleHQnLCAndGV4dCcsICd0ZXh0JywgJ3RleHQnLCAndGV4dCddXG4gICAgICAgICAgICBlbnN1cmUgWydyJywgaW5wdXQ6ICchJ10sXG4gICAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBUaGlzICEhISEgaGF2ZSAzIGluc3RhbmNlIG9mICchISEhJyBpbiB0aGUgd2hvbGUgISEhIVxuICAgICAgICAgICAgICBUaGlzICEhISEgaGF2ZSAzIGluc3RhbmNlIG9mICchISEhJyBpbiB0aGUgd2hvbGUgISEhIVxcblxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJpbiBpbmNyZW1lbnRhbC1zZWFyY2hcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnaW5jcmVtZW50YWxTZWFyY2gnLCB0cnVlKVxuXG4gICAgICAgIGRlc2NyaWJlIFwiYWRkLW9jY3VycmVuY2UtcGF0dGVybi1mcm9tLXNlYXJjaFwiLCAtPlxuICAgICAgICAgIGl0ICdtYXJrIGFzIG9jY3VycmVuY2Ugd2hpY2ggbWF0Y2hlcyByZWdleCBlbnRlcmVkIGluIHNlYXJjaC11aScsIC0+XG4gICAgICAgICAgICBrZXlzdHJva2UgJy8nXG4gICAgICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ1xcXFxidFxcXFx3KycpXG4gICAgICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6YWRkLW9jY3VycmVuY2UtcGF0dGVybi1mcm9tLXNlYXJjaCcpXG4gICAgICAgICAgICBlbnN1cmVcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZVRleHQ6IFsndGV4dCcsICd0ZXh0JywgJ3RoZScsICd0ZXh0J11cblxuICAgIGRlc2NyaWJlIFwibXV0YXRlIHByZXNldCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIlwiXCJcbiAgICAgICAgb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgISEhOiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgICBpdCAnW2RlbGV0ZV0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgZW5zdXJlICdsIGcgbyBEJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgOiB4eHg6ICB4eHg6IDpcbiAgICAgICAgICAgICEhITogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnW3VwY2FzZV0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgZW5zdXJlICdsIGcgbyBnIFUgaicsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogWFhYOiBvb28gWFhYOiBvb286XG4gICAgICAgICAgICAhISE6IG9vbzogWFhYOiBvb28gWFhYOiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgJ1t1cGNhc2UgZXhjbHVkZV0gd29uXFwndCBtdXRhdGUgcmVtb3ZlZCBtYXJrZXInLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZUNvdW50OiA2XG4gICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDVcbiAgICAgICAgICBlbnN1cmUgJ2cgVSBqJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiB4eHg6IE9PTyB4eHg6IE9PTzpcbiAgICAgICAgICAgICEhITogT09POiB4eHg6IE9PTyB4eHg6IE9PTzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnW2RlbGV0ZV0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDEwXVxuICAgICAgICAgIGVuc3VyZSAnZyBvIGcgVSAkJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiB4eHg6IE9PTyB4eHg6IE9PTzpcbiAgICAgICAgICAgICEhITogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnW2NoYW5nZV0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgZW5zdXJlICdsIGcgbyBDJyxcbiAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDogeHh4OiAgeHh4OiA6XG4gICAgICAgICAgICAhISE6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnWVlZJylcbiAgICAgICAgICBlbnN1cmUgJ2wgZyBvIEMnLFxuICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgWVlZOiB4eHg6IFlZWSB4eHg6IFlZWTpcbiAgICAgICAgICAgICEhITogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbnVtQ3Vyc29yczogM1xuICAgICAgICBkZXNjcmliZSBcInByZWRlZmluZWQga2V5bWFwIG9uIHdoZW4gaGFzLW9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVnxpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVmltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgaXQgJ1tpbnNlcnQtYXQtc3RhcnRdIGFwcGx5IG9wZXJhdGlvbiB0byBwcmVzZXQtbWFya2VyIGludGVyc2VjdGluZyBzZWxlY3RlZCB0YXJnZXQnLCAtPlxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWydWaW0nLCAnVmltJywgJ1ZpbScsICdWaW0nXVxuICAgICAgICAgICAgY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpXG4gICAgICAgICAgICBlbnN1cmUgJ3YgayBJJywgbW9kZTogJ2luc2VydCcsIG51bUN1cnNvcnM6IDJcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwicHVyZS1cIilcbiAgICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICBwdXJlIS1WaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgcHVyZXwtVmltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFZpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBpdCAnW2luc2VydC1hZnRlci1zdGFydF0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsnVmltJywgJ1ZpbScsICdWaW0nLCAnVmltJ11cbiAgICAgICAgICAgIGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKVxuICAgICAgICAgICAgZW5zdXJlICd2IGogQScsIG1vZGU6ICdpbnNlcnQnLCBudW1DdXJzb3JzOiAyXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiBhbmQgRW1hY3NcIilcbiAgICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVmltIGFuZCBFbWFjfHMgaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVmltIGFuZCBFbWFjIXMgaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVmltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcInZpc3VhbC1tb2RlXCIsIC0+XG4gICAgICAgIGl0ICdbdXBjYXNlXSBhcHBseSB0byBwcmVzZXQtbWFya2VyIGFzIGxvbmcgYXMgaXQgaW50ZXJzZWN0cyBzZWxlY3Rpb24nLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiB4fHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICB4eHg6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VDb3VudDogNVxuICAgICAgICAgIGVuc3VyZSAndiBqIFUnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IFhYWDogb29vIFhYWDogb29vOlxuICAgICAgICAgICAgWFhYOiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsLWxpbmV3aXNlLW1vZGVcIiwgLT5cbiAgICAgICAgaXQgJ1t1cGNhc2VdIGFwcGx5IHRvIHByZXNldC1tYXJrZXIgYXMgbG9uZyBhcyBpdCBpbnRlcnNlY3RzIHNlbGVjdGlvbicsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgeHh4OiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDVcbiAgICAgICAgICBlbnN1cmUgJ1YgVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogWFhYOiBvb28gWFhYOiBvb286XG4gICAgICAgICAgICB4eHg6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ2aXN1YWwtYmxvY2t3aXNlLW1vZGVcIiwgLT5cbiAgICAgICAgaXQgJ1t1cGNhc2VdIGFwcGx5IHRvIHByZXNldC1tYXJrZXIgYXMgbG9uZyBhcyBpdCBpbnRlcnNlY3RzIHNlbGVjdGlvbicsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgeHh4OiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDVcbiAgICAgICAgICBlbnN1cmUgJ2N0cmwtdiBqIDIgdyBVJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiBYWFg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIHh4eDogb29vOiBYWFg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJNb3ZlVG9OZXh0T2NjdXJyZW5jZSwgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8b29vOiB4eHg6IG9vb1xuICAgICAgICAgIF9fXzogb29vOiB4eHg6XG4gICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBlbnN1cmUgJ2cgbycsXG4gICAgICAgICAgb2NjdXJyZW5jZVRleHQ6IFsnb29vJywgJ29vbycsICdvb28nLCAnb29vJywgJ29vbyddXG5cblxuICAgICAgZGVzY3JpYmUgXCJ0YWIsIHNoaWZ0LXRhYlwiLCAtPlxuICAgICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBhdCBzdGFydCBvZiBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgaXQgXCJzZWFyY2ggbmV4dC9wcmV2aW91cyBvY2N1cnJlbmNlIG1hcmtlclwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICd0YWIgdGFiJywgY3Vyc29yOiBbMSwgNV1cbiAgICAgICAgICAgIGVuc3VyZSAnMiB0YWInLCBjdXJzb3I6IFsyLCAxMF1cbiAgICAgICAgICAgIGVuc3VyZSAnMiBzaGlmdC10YWInLCBjdXJzb3I6IFsxLCA1XVxuICAgICAgICAgICAgZW5zdXJlICcyIHNoaWZ0LXRhYicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBpbnNpZGUgb2Ygb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBvY2N1cnJlbmNlQ291bnQ6IDBcbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJvb29vIG9vfG9vIG9vb29cIlxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDNcblxuICAgICAgICAgIGRlc2NyaWJlIFwidGFiXCIsIC0+XG4gICAgICAgICAgICBpdCBcIm1vdmUgdG8gbmV4dCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgICAgIGVuc3VyZSAndGFiJywgdGV4dEM6ICdvb29vIG9vb28gfG9vb28nXG5cbiAgICAgICAgICBkZXNjcmliZSBcInNoaWZ0LXRhYlwiLCAtPlxuICAgICAgICAgICAgaXQgXCJtb3ZlIHRvIHByZXZpb3VzIG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICAgICAgZW5zdXJlICdzaGlmdC10YWInLCB0ZXh0QzogJ3xvb29vIG9vb28gb29vbydcblxuICAgICAgZGVzY3JpYmUgXCJhcyBvcGVyYXRvcidzIHRhcmdldFwiLCAtPlxuICAgICAgICBkZXNjcmliZSBcInRhYlwiLCAtPlxuICAgICAgICAgIGl0IFwib3BlcmF0ZSBvbiBuZXh0IG9jY3VycmVuY2UgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcImcgVSB0YWJcIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBvb286IHh4eDpcbiAgICAgICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogM1xuICAgICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgICBfX186IE9PTzogeHh4OlxuICAgICAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAyXG4gICAgICAgICAgICBlbnN1cmUgXCIyIC5cIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZShmYWxzZSlcblxuICAgICAgICAgIGl0IFwiW28tbW9kaWZpZXJdIG9wZXJhdGUgb24gbmV4dCBvY2N1cnJlbmNlIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIixcbiAgICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAwXG5cbiAgICAgICAgICAgIGVuc3VyZSBcImcgVSBvIHRhYlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgICBfX186IG9vbzogeHh4OlxuICAgICAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAwXG5cbiAgICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogMFxuXG4gICAgICAgICAgICBlbnN1cmUgXCIyIC5cIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogMFxuXG4gICAgICAgIGRlc2NyaWJlIFwic2hpZnQtdGFiXCIsIC0+XG4gICAgICAgICAgaXQgXCJvcGVyYXRlIG9uIG5leHQgcHJldmlvdXMgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAxMF1cbiAgICAgICAgICAgIGVuc3VyZSBcImcgVSBzaGlmdC10YWJcIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIG9vbzogeHh4OiBvb29cbiAgICAgICAgICAgICAgX19fOiBvb286IHh4eDpcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogM1xuICAgICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgb29vOiB4eHg6IG9vb1xuICAgICAgICAgICAgICBfX186IE9PTzogeHh4OlxuICAgICAgICAgICAgICBPT086IHh4eDogT09POlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAyXG4gICAgICAgICAgICBlbnN1cmUgXCIyIC5cIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZShmYWxzZSlcblxuICAgICAgZGVzY3JpYmUgXCJleGN1ZGUgcGFydGljdWxhciBvY2N1cmVuY2UgYnkgYC5gIHJlcGVhdFwiLCAtPlxuICAgICAgICBpdCBcImNsZWFyIHByZXNldC1vY2N1cnJlbmNlIGFuZCBtb3ZlIHRvIG5leHRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJzIgdGFiIC4gZyBVIGkgcCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBPT086IHh4eDogT09PXG4gICAgICAgICAgICBfX186IHxvb286IHh4eDpcbiAgICAgICAgICAgIE9PTzogeHh4OiBPT086XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcImNsZWFyIHByZXNldC1vY2N1cnJlbmNlIGFuZCBtb3ZlIHRvIHByZXZpb3VzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICcyIHNoaWZ0LXRhYiAuIGcgVSBpIHAnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgIHxvb286IHh4eDogT09POlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImV4cGxpY3Qgb3BlcmF0b3ItbW9kaWZpZXIgbyBhbmQgcHJlc2V0LW1hcmtlclwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgX19fOiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcIidvJyBtb2RpZmllciB3aGVuIHByZXNldCBvY2N1cnJlbmNlIGFscmVhZHkgZXhpc3RzXCIsIC0+XG4gICAgICAgIGl0IFwiJ28nIGFsd2F5cyBwaWNrIGN1cnNvci13b3JkIGFuZCBvdmVyd3JpdGUgZXhpc3RpbmcgcHJlc2V0IG1hcmtlcilcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJnIG9cIixcbiAgICAgICAgICAgIG9jY3VycmVuY2VUZXh0OiBbXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIl1cbiAgICAgICAgICBlbnN1cmUgXCIyIHcgZCBvXCIsXG4gICAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogW1wieHh4XCIsIFwieHh4XCIsIFwieHh4XCIsIFwieHh4XCJdXG4gICAgICAgICAgICBtb2RlOiAnb3BlcmF0b3ItcGVuZGluZydcbiAgICAgICAgICBlbnN1cmUgXCJqXCIsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogOiBvb28gOiBvb286XG4gICAgICAgICAgICBfX186IG9vbzogOiBvb28gOiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGRlc2NyaWJlIFwib2NjdXJyZW5jZSBib3VuZCBvcGVyYXRvciBkb24ndCBvdmVyd2l0ZSBwcmUtZXhpc3RpbmcgcHJlc2V0IG1hcmtlclwiLCAtPlxuICAgICAgICBpdCBcIidvJyBhbHdheXMgcGljayBjdXJzb3Itd29yZCBhbmQgY2xlYXIgZXhpc3RpbmcgcHJlc2V0IG1hcmtlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImcgb1wiLFxuICAgICAgICAgICAgb2NjdXJyZW5jZVRleHQ6IFtcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiXVxuICAgICAgICAgIGVuc3VyZSBcIjIgdyBnIGNtZC1kXCIsXG4gICAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogW1wib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCJdXG4gICAgICAgICAgICBtb2RlOiAnb3BlcmF0b3ItcGVuZGluZydcbiAgICAgICAgICBlbnN1cmUgXCJqXCIsXG4gICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCJdXG5cbiAgICBkZXNjcmliZSBcInRvZ2dsZS1wcmVzZXQtc3Vid29yZC1vY2N1cnJlbmNlIGNvbW1hbmRzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIGNhbWVsQ2F8c2UgQ2FzZXNcbiAgICAgICAgICBcIkNhc2VTdHVkeVwiIFNuYWtlQ2FzZVxuICAgICAgICAgIFVQX0NBU0VcblxuICAgICAgICAgIG90aGVyIFBhcmFncmFwaENhc2VcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJhZGQgcHJlc2V0IHN1YndvcmQtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICBpdCBcIm1hcmsgc3Vid29yZCB1bmRlciBjdXJzb3JcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2cgTycsIG9jY3VycmVuY2VUZXh0OiBbJ0Nhc2UnLCAnQ2FzZScsICdDYXNlJywgJ0Nhc2UnXVxuIl19
