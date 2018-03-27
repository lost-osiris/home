(function() {
  var TextData, dispatch, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData;

  settings = require('../lib/settings');

  describe("TextObject", function() {
    var editor, editorElement, ensure, getCheckFunctionFor, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    getCheckFunctionFor = function(textObject) {
      return function(initialPoint, keystroke, options) {
        set({
          cursor: initialPoint
        });
        return ensure(keystroke + " " + textObject, options);
      };
    };
    beforeEach(function() {
      return getVimState(function(state, vimEditor) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
      });
    });
    describe("TextObject", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return getVimState('sample.coffee', function(state, vimEditor) {
          editor = state.editor, editorElement = state.editorElement;
          return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      return describe("when TextObject is excuted directly", function() {
        return it("select that TextObject", function() {
          set({
            cursor: [8, 7]
          });
          dispatch(editorElement, 'vim-mode-plus:inner-word');
          return ensure({
            selectedText: 'QuickSort'
          });
        });
      });
    });
    describe("Word", function() {
      describe("inner-word", function() {
        beforeEach(function() {
          return set({
            text: "12345 abcde ABCDE",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current word in operator-pending mode", function() {
          return ensure('d i w', {
            text: "12345  ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: 'abcde'
              }
            },
            mode: 'normal'
          });
        });
        it("selects inside the current word in visual mode", function() {
          return ensure('v i w', {
            selectedScreenRange: [[0, 6], [0, 11]]
          });
        });
        it("works with multiple cursors", function() {
          set({
            addCursor: [0, 1]
          });
          return ensure('v i w', {
            selectedBufferRange: [[[0, 6], [0, 11]], [[0, 0], [0, 5]]]
          });
        });
        describe("cursor is on next to NonWordCharacter", function() {
          beforeEach(function() {
            return set({
              text: "abc(def)",
              cursor: [0, 4]
            });
          });
          it("change inside word", function() {
            return ensure('c i w', {
              text: "abc()",
              mode: "insert"
            });
          });
          return it("delete inside word", function() {
            return ensure('d i w', {
              text: "abc()",
              mode: "normal"
            });
          });
        });
        return describe("cursor's next char is NonWordCharacter", function() {
          beforeEach(function() {
            return set({
              text: "abc(def)",
              cursor: [0, 6]
            });
          });
          it("change inside word", function() {
            return ensure('c i w', {
              text: "abc()",
              mode: "insert"
            });
          });
          return it("delete inside word", function() {
            return ensure('d i w', {
              text: "abc()",
              mode: "normal"
            });
          });
        });
      });
      return describe("a-word", function() {
        beforeEach(function() {
          return set({
            text: "12345 abcde ABCDE",
            cursor: [0, 9]
          });
        });
        it("select current-word and trailing white space", function() {
          return ensure('d a w', {
            text: "12345 ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: "abcde "
              }
            }
          });
        });
        it("select current-word and leading white space in case trailing white space wasn't there", function() {
          set({
            cursor: [0, 15]
          });
          return ensure('d a w', {
            text: "12345 abcde",
            cursor: [0, 10],
            register: {
              '"': {
                text: " ABCDE"
              }
            }
          });
        });
        it("selects from the start of the current word to the start of the next word in visual mode", function() {
          return ensure('v a w', {
            selectedScreenRange: [[0, 6], [0, 12]]
          });
        });
        it("doesn't span newlines", function() {
          set({
            text: "12345\nabcde ABCDE",
            cursor: [0, 3]
          });
          return ensure('v a w', {
            selectedBufferRange: [[0, 0], [0, 5]]
          });
        });
        return it("doesn't span special characters", function() {
          set({
            text: "1(345\nabcde ABCDE",
            cursor: [0, 3]
          });
          return ensure('v a w', {
            selectedBufferRange: [[0, 2], [0, 5]]
          });
        });
      });
    });
    describe("WholeWord", function() {
      describe("inner-whole-word", function() {
        beforeEach(function() {
          return set({
            text: "12(45 ab'de ABCDE",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current whole word in operator-pending mode", function() {
          return ensure('d i W', {
            text: "12(45  ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: "ab'de"
              }
            }
          });
        });
        return it("selects inside the current whole word in visual mode", function() {
          return ensure('v i W', {
            selectedScreenRange: [[0, 6], [0, 11]]
          });
        });
      });
      return describe("a-whole-word", function() {
        beforeEach(function() {
          return set({
            text: "12(45 ab'de ABCDE",
            cursor: [0, 9]
          });
        });
        it("select whole-word and trailing white space", function() {
          return ensure('d a W', {
            text: "12(45 ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: "ab'de "
              }
            },
            mode: 'normal'
          });
        });
        it("select whole-word and leading white space in case trailing white space wasn't there", function() {
          set({
            cursor: [0, 15]
          });
          return ensure('d a w', {
            text: "12(45 ab'de",
            cursor: [0, 10],
            register: {
              '"': {
                text: " ABCDE"
              }
            }
          });
        });
        it("selects from the start of the current whole word to the start of the next whole word in visual mode", function() {
          return ensure('v a W', {
            selectedScreenRange: [[0, 6], [0, 12]]
          });
        });
        return it("doesn't span newlines", function() {
          set({
            text: "12(45\nab'de ABCDE",
            cursor: [0, 4]
          });
          return ensure('v a W', {
            selectedBufferRange: [[0, 0], [0, 5]]
          });
        });
      });
    });
    describe("Subword", function() {
      var escape;
      escape = function() {
        return keystroke('escape');
      };
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus.operator-pending-mode, atom-text-editor.vim-mode-plus.visual-mode': {
            'a q': 'vim-mode-plus:a-subword',
            'i q': 'vim-mode-plus:inner-subword'
          }
        });
      });
      describe("inner-subword", function() {
        return it("select subword", function() {
          set({
            textC: "cam|elCase"
          });
          ensure("v i q", {
            selectedText: "camel"
          });
          escape();
          set({
            textC: "came|lCase"
          });
          ensure("v i q", {
            selectedText: "camel"
          });
          escape();
          set({
            textC: "camel|Case"
          });
          ensure("v i q", {
            selectedText: "Case"
          });
          escape();
          set({
            textC: "camelCas|e"
          });
          ensure("v i q", {
            selectedText: "Case"
          });
          escape();
          set({
            textC: "|_snake__case_"
          });
          ensure("v i q", {
            selectedText: "_snake"
          });
          escape();
          set({
            textC: "_snak|e__case_"
          });
          ensure("v i q", {
            selectedText: "_snake"
          });
          escape();
          set({
            textC: "_snake|__case_"
          });
          ensure("v i q", {
            selectedText: "__case"
          });
          escape();
          set({
            textC: "_snake_|_case_"
          });
          ensure("v i q", {
            selectedText: "__case"
          });
          escape();
          set({
            textC: "_snake__cas|e_"
          });
          ensure("v i q", {
            selectedText: "__case"
          });
          escape();
          set({
            textC: "_snake__case|_"
          });
          ensure("v i q", {
            selectedText: "_"
          });
          return escape();
        });
      });
      return describe("a-subword", function() {
        return it("select subword and spaces", function() {
          set({
            textC: "camelCa|se  NextCamel"
          });
          ensure("v a q", {
            selectedText: "Case  "
          });
          escape();
          set({
            textC: "camelCase  Ne|xtCamel"
          });
          ensure("v a q", {
            selectedText: "  Next"
          });
          escape();
          set({
            textC: "snake_c|ase  next_snake"
          });
          ensure("v a q", {
            selectedText: "_case  "
          });
          escape();
          set({
            textC: "snake_case  ne|xt_snake"
          });
          ensure("v a q", {
            selectedText: "  next"
          });
          return escape();
        });
      });
    });
    describe("AnyPair", function() {
      var complexText, ref2, simpleText;
      ref2 = {}, simpleText = ref2.simpleText, complexText = ref2.complexText;
      beforeEach(function() {
        simpleText = ".... \"abc\" ....\n.... 'abc' ....\n.... `abc` ....\n.... {abc} ....\n.... <abc> ....\n.... [abc] ....\n.... (abc) ....";
        complexText = "[4s\n--{3s\n----\"2s(1s-1e)2e\"\n---3e}-4e\n]";
        return set({
          text: simpleText,
          cursor: [0, 7]
        });
      });
      describe("inner-any-pair", function() {
        it("applies operators any inner-pair and repeatable", function() {
          ensure('d i s', {
            text: ".... \"\" ....\n.... 'abc' ....\n.... `abc` ....\n.... {abc} ....\n.... <abc> ....\n.... [abc] ....\n.... (abc) ...."
          });
          return ensure('j . j . j . j . j . j . j .', {
            text: ".... \"\" ....\n.... '' ....\n.... `` ....\n.... {} ....\n.... <> ....\n.... [] ....\n.... () ...."
          });
        });
        return it("can expand selection", function() {
          set({
            text: complexText,
            cursor: [2, 8]
          });
          keystroke('v');
          ensure('i s', {
            selectedText: "1s-1e"
          });
          ensure('i s', {
            selectedText: "2s(1s-1e)2e"
          });
          ensure('i s', {
            selectedText: "3s\n----\"2s(1s-1e)2e\"\n---3e"
          });
          return ensure('i s', {
            selectedText: "4s\n--{3s\n----\"2s(1s-1e)2e\"\n---3e}-4e"
          });
        });
      });
      return describe("a-any-pair", function() {
        it("applies operators any a-pair and repeatable", function() {
          ensure('d a s', {
            text: "....  ....\n.... 'abc' ....\n.... `abc` ....\n.... {abc} ....\n.... <abc> ....\n.... [abc] ....\n.... (abc) ...."
          });
          return ensure('j . j . j . j . j . j . j .', {
            text: "....  ....\n....  ....\n....  ....\n....  ....\n....  ....\n....  ....\n....  ...."
          });
        });
        return it("can expand selection", function() {
          set({
            text: complexText,
            cursor: [2, 8]
          });
          keystroke('v');
          ensure('a s', {
            selectedText: "(1s-1e)"
          });
          ensure('a s', {
            selectedText: "\"2s(1s-1e)2e\""
          });
          ensure('a s', {
            selectedText: "{3s\n----\"2s(1s-1e)2e\"\n---3e}"
          });
          return ensure('a s', {
            selectedText: "[4s\n--{3s\n----\"2s(1s-1e)2e\"\n---3e}-4e\n]"
          });
        });
      });
    });
    describe("AnyQuote", function() {
      beforeEach(function() {
        return set({
          text: "--\"abc\" `def`  'efg'--",
          cursor: [0, 0]
        });
      });
      describe("inner-any-quote", function() {
        it("applies operators any inner-pair and repeatable", function() {
          ensure('d i q', {
            text: "--\"\" `def`  'efg'--"
          });
          ensure('.', {
            text: "--\"\" ``  'efg'--"
          });
          return ensure('.', {
            text: "--\"\" ``  ''--"
          });
        });
        return it("can select next quote", function() {
          keystroke('v');
          ensure('i q', {
            selectedText: 'abc'
          });
          ensure('i q', {
            selectedText: 'def'
          });
          return ensure('i q', {
            selectedText: 'efg'
          });
        });
      });
      return describe("a-any-quote", function() {
        it("applies operators any a-quote and repeatable", function() {
          ensure('d a q', {
            text: "-- `def`  'efg'--"
          });
          ensure('.', {
            text: "--   'efg'--"
          });
          return ensure('.', {
            text: "--   --"
          });
        });
        return it("can select next quote", function() {
          keystroke('v');
          ensure('a q', {
            selectedText: '"abc"'
          });
          ensure('a q', {
            selectedText: '`def`'
          });
          return ensure('a q', {
            selectedText: "'efg'"
          });
        });
      });
    });
    describe("DoubleQuote", function() {
      describe("issue-635 new behavior of inner-double-quote", function() {
        beforeEach(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'g r': 'vim-mode-plus:replace'
            }
          });
        });
        describe("quote is un-balanced", function() {
          it("case1", function() {
            set({
              textC_: '_|_"____"____"'
            });
            return ensure('g r i " +', {
              textC_: '__"|++++"____"'
            });
          });
          it("case2", function() {
            set({
              textC_: '__"__|__"____"'
            });
            return ensure('g r i " +', {
              textC_: '__"|++++"____"'
            });
          });
          it("case3", function() {
            set({
              textC_: '__"____"__|__"'
            });
            return ensure('g r i " +', {
              textC_: '__"____"|++++"'
            });
          });
          it("case4", function() {
            set({
              textC_: '__|"____"____"'
            });
            return ensure('g r i " +', {
              textC_: '__"|++++"____"'
            });
          });
          it("case5", function() {
            set({
              textC_: '__"____|"____"'
            });
            return ensure('g r i " +', {
              textC_: '__"|++++"____"'
            });
          });
          return it("case6", function() {
            set({
              textC_: '__"____"____|"'
            });
            return ensure('g r i " +', {
              textC_: '__"____"|++++"'
            });
          });
        });
        return describe("quote is balanced", function() {
          it("case1", function() {
            set({
              textC_: '_|_"===="____"==="'
            });
            return ensure('g r i " +', {
              textC_: '__"|++++"____"==="'
            });
          });
          it("case2", function() {
            set({
              textC_: '__"==|=="____"==="'
            });
            return ensure('g r i " +', {
              textC_: '__"|++++"____"==="'
            });
          });
          it("case3", function() {
            set({
              textC_: '__"===="__|__"==="'
            });
            return ensure('g r i " +', {
              textC_: '__"===="|++++"==="'
            });
          });
          it("case4", function() {
            set({
              textC_: '__"===="____"=|=="'
            });
            return ensure('g r i " +', {
              textC_: '__"===="____"|+++"'
            });
          });
          it("case5", function() {
            set({
              textC_: '__|"===="____"==="'
            });
            return ensure('g r i " +', {
              textC_: '__"|++++"____"==="'
            });
          });
          it("case6", function() {
            set({
              textC_: '__"====|"____"==="'
            });
            return ensure('g r i " +', {
              textC_: '__"|++++"____"==="'
            });
          });
          return it("case7", function() {
            set({
              textC_: '__"===="____|"==="'
            });
            return ensure('g r i " +', {
              textC_: '__"===="____"|+++"'
            });
          });
        });
      });
      describe("inner-double-quote", function() {
        beforeEach(function() {
          return set({
            text: '" something in here and in "here" " and over here',
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current string in operator-pending mode", function() {
          return ensure('d i "', {
            text: '""here" " and over here',
            cursor: [0, 1]
          });
        });
        it("applies operators inside the current string in operator-pending mode", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i "', {
            text: '" something in here and in "" " and over here',
            cursor: [0, 28]
          });
        });
        it("makes no change if past the last string on a line", function() {
          set({
            cursor: [0, 39]
          });
          return ensure('d i "', {
            text: '" something in here and in "here" " and over here',
            cursor: [0, 39]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i "');
          text = '-"+"-';
          textFinal = '-""-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-double-quote", function() {
        var originalText;
        originalText = '" something in here and in "here" "';
        beforeEach(function() {
          return set({
            text: originalText,
            cursor: [0, 9]
          });
        });
        it("applies operators around the current double quotes in operator-pending mode", function() {
          return ensure('d a "', {
            text: 'here" "',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("delete a-double-quote", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a "', {
            text: '" something in here and in  "',
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('a "');
          text = '-"+"-';
          textFinal = '--';
          selectedText = '"+"';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("SingleQuote", function() {
      describe("inner-single-quote", function() {
        beforeEach(function() {
          return set({
            text: "' something in here and in 'here' ' and over here",
            cursor: [0, 9]
          });
        });
        describe("don't treat literal backslash(double backslash) as escape char", function() {
          beforeEach(function() {
            return set({
              text: "'some-key-here\\\\': 'here-is-the-val'"
            });
          });
          it("case-1", function() {
            set({
              cursor: [0, 2]
            });
            return ensure("d i '", {
              text: "'': 'here-is-the-val'",
              cursor: [0, 1]
            });
          });
          return it("case-2", function() {
            set({
              cursor: [0, 19]
            });
            return ensure("d i '", {
              text: "'some-key-here\\\\': ''",
              cursor: [0, 20]
            });
          });
        });
        describe("treat backslash(single backslash) as escape char", function() {
          beforeEach(function() {
            return set({
              text: "'some-key-here\\'': 'here-is-the-val'"
            });
          });
          it("case-1", function() {
            set({
              cursor: [0, 2]
            });
            return ensure("d i '", {
              text: "'': 'here-is-the-val'",
              cursor: [0, 1]
            });
          });
          return it("case-2", function() {
            set({
              cursor: [0, 17]
            });
            return ensure("d i '", {
              text: "'some-key-here\\'''here-is-the-val'",
              cursor: [0, 17]
            });
          });
        });
        it("applies operators inside the current string in operator-pending mode", function() {
          return ensure("d i '", {
            text: "''here' ' and over here",
            cursor: [0, 1]
          });
        });
        it("applies operators inside the next string in operator-pending mode (if not in a string)", function() {
          set({
            cursor: [0, 26]
          });
          return ensure("d i '", {
            text: "''here' ' and over here",
            cursor: [0, 1]
          });
        });
        it("makes no change if past the last string on a line", function() {
          set({
            cursor: [0, 39]
          });
          return ensure("d i '", {
            text: "' something in here and in 'here' ' and over here",
            cursor: [0, 39]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("i '");
          text = "-'+'-";
          textFinal = "-''-";
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-single-quote", function() {
        var originalText;
        originalText = "' something in here and in 'here' '";
        beforeEach(function() {
          return set({
            text: originalText,
            cursor: [0, 9]
          });
        });
        it("applies operators around the current single quotes in operator-pending mode", function() {
          return ensure("d a '", {
            text: "here' '",
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators inside the next string in operator-pending mode (if not in a string)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure("d a '", {
            text: "' something in here and in  '",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a '");
          text = "-'+'-";
          textFinal = "--";
          selectedText = "'+'";
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("BackTick", function() {
      var originalText;
      originalText = "this is `sample` text.";
      beforeEach(function() {
        return set({
          text: originalText,
          cursor: [0, 9]
        });
      });
      describe("inner-back-tick", function() {
        it("applies operators inner-area", function() {
          return ensure("d i `", {
            text: "this is `` text.",
            cursor: [0, 9]
          });
        });
        it("do nothing when pair range is not under cursor", function() {
          set({
            cursor: [0, 16]
          });
          return ensure("d i `", {
            text: originalText,
            cursor: [0, 16]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i `');
          text = '-`+`-';
          textFinal = '-``-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-back-tick", function() {
        it("applies operators inner-area", function() {
          return ensure("d a `", {
            text: "this is  text.",
            cursor: [0, 8]
          });
        });
        it("do nothing when pair range is not under cursor", function() {
          set({
            cursor: [0, 16]
          });
          return ensure("d a `", {
            text: originalText,
            cursor: [0, 16]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a `");
          text = "-`+`-";
          textFinal = "--";
          selectedText = "`+`";
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("CurlyBracket", function() {
      describe("scope awareness of bracket", function() {
        it("[search from outside of double-quote] skips bracket in within-line-balanced-double-quotes", function() {
          set({
            textC: "{ | \"hello {\" }"
          });
          return ensure("v a {", {
            selectedText: "{  \"hello {\" }"
          });
        });
        it("Not ignore bracket in within-line-not-balanced-double-quotes", function() {
          set({
            textC: "{  \"hello {\" | '\"' }"
          });
          return ensure("v a {", {
            selectedText: "{\"  '\"' }"
          });
        });
        it("[search from inside of double-quote] skips bracket in within-line-balanced-double-quotes", function() {
          set({
            textC: "{  \"h|ello {\" }"
          });
          return ensure("v a {", {
            selectedText: "{  \"hello {\" }"
          });
        });
        return beforeEach(function() {
          return set({
            textC_: ""
          });
        });
      });
      describe("inner-curly-bracket", function() {
        beforeEach(function() {
          return set({
            text: "{ something in here and in {here} }",
            cursor: [0, 9]
          });
        });
        it("applies operators to inner-area in operator-pending mode", function() {
          return ensure('d i {', {
            text: "{}",
            cursor: [0, 1]
          });
        });
        it("applies operators to inner-area in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i {', {
            text: "{ something in here and in {} }",
            cursor: [0, 28]
          });
        });
        describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i {');
          text = '-{+}-';
          textFinal = '-{}-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
        return describe("change mode to characterwise", function() {
          var textSelected;
          textSelected = "__1,\n__2,\n__3".replace(/_/g, ' ');
          beforeEach(function() {
            set({
              textC: "{\n  |1,\n  2,\n  3\n}"
            });
            return ensure({
              mode: 'normal'
            });
          });
          it("from vC, final-mode is 'characterwise'", function() {
            ensure('v', {
              selectedText: ['1'],
              mode: ['visual', 'characterwise']
            });
            return ensure('i B', {
              selectedText: textSelected,
              mode: ['visual', 'characterwise']
            });
          });
          it("from vL, final-mode is 'characterwise'", function() {
            ensure('V', {
              selectedText: ["  1,\n"],
              mode: ['visual', 'linewise']
            });
            return ensure('i B', {
              selectedText: textSelected,
              mode: ['visual', 'characterwise']
            });
          });
          it("from vB, final-mode is 'characterwise'", function() {
            ensure('ctrl-v', {
              selectedText: ["1"],
              mode: ['visual', 'blockwise']
            });
            return ensure('i B', {
              selectedText: textSelected,
              mode: ['visual', 'characterwise']
            });
          });
          return describe("as operator target", function() {
            it("change inner-pair", function() {
              return ensure("c i B", {
                textC: "{\n|\n}",
                mode: 'insert'
              });
            });
            return it("delete inner-pair", function() {
              return ensure("d i B", {
                textC: "{\n|}",
                mode: 'normal'
              });
            });
          });
        });
      });
      return describe("a-curly-bracket", function() {
        beforeEach(function() {
          return set({
            text: "{ something in here and in {here} }",
            cursor: [0, 9]
          });
        });
        it("applies operators to a-area in operator-pending mode", function() {
          return ensure('d a {', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators to a-area in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a {', {
            text: "{ something in here and in  }",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a {");
          text = "-{+}-";
          textFinal = "--";
          selectedText = "{+}";
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
        return describe("change mode to characterwise", function() {
          var textSelected;
          textSelected = "{\n  1,\n  2,\n  3\n}";
          beforeEach(function() {
            set({
              textC: "{\n  |1,\n  2,\n  3\n}\n\nhello"
            });
            return ensure({
              mode: 'normal'
            });
          });
          it("from vC, final-mode is 'characterwise'", function() {
            ensure('v', {
              selectedText: ['1'],
              mode: ['visual', 'characterwise']
            });
            return ensure('a B', {
              selectedText: textSelected,
              mode: ['visual', 'characterwise']
            });
          });
          it("from vL, final-mode is 'characterwise'", function() {
            ensure('V', {
              selectedText: ["  1,\n"],
              mode: ['visual', 'linewise']
            });
            return ensure('a B', {
              selectedText: textSelected,
              mode: ['visual', 'characterwise']
            });
          });
          it("from vB, final-mode is 'characterwise'", function() {
            ensure('ctrl-v', {
              selectedText: ["1"],
              mode: ['visual', 'blockwise']
            });
            return ensure('a B', {
              selectedText: textSelected,
              mode: ['visual', 'characterwise']
            });
          });
          return describe("as operator target", function() {
            it("change inner-pair", function() {
              return ensure("c a B", {
                textC: "|\n\nhello",
                mode: 'insert'
              });
            });
            return it("delete inner-pair", function() {
              return ensure("d a B", {
                textC: "|\n\nhello",
                mode: 'normal'
              });
            });
          });
        });
      });
    });
    describe("AngleBracket", function() {
      describe("inner-angle-bracket", function() {
        beforeEach(function() {
          return set({
            text: "< something in here and in <here> >",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current word in operator-pending mode", function() {
          return ensure('d i <', {
            text: "<>",
            cursor: [0, 1]
          });
        });
        it("applies operators inside the current word in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i <', {
            text: "< something in here and in <> >",
            cursor: [0, 28]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i <');
          text = '-<+>-';
          textFinal = '-<>-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-angle-bracket", function() {
        beforeEach(function() {
          return set({
            text: "< something in here and in <here> >",
            cursor: [0, 9]
          });
        });
        it("applies operators around the current angle brackets in operator-pending mode", function() {
          return ensure('d a <', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators around the current angle brackets in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a <', {
            text: "< something in here and in  >",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a <");
          text = "-<+>-";
          textFinal = "--";
          selectedText = "<+>";
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("AllowForwarding family", function() {
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus.operator-pending-mode, atom-text-editor.vim-mode-plus.visual-mode': {
            'i }': 'vim-mode-plus:inner-curly-bracket-allow-forwarding',
            'i >': 'vim-mode-plus:inner-angle-bracket-allow-forwarding',
            'i ]': 'vim-mode-plus:inner-square-bracket-allow-forwarding',
            'i )': 'vim-mode-plus:inner-parenthesis-allow-forwarding',
            'a }': 'vim-mode-plus:a-curly-bracket-allow-forwarding',
            'a >': 'vim-mode-plus:a-angle-bracket-allow-forwarding',
            'a ]': 'vim-mode-plus:a-square-bracket-allow-forwarding',
            'a )': 'vim-mode-plus:a-parenthesis-allow-forwarding'
          }
        });
        return set({
          text: "__{000}__\n__<111>__\n__[222]__\n__(333)__"
        });
      });
      describe("inner", function() {
        return it("select forwarding range", function() {
          set({
            cursor: [0, 0]
          });
          ensure('escape v i }', {
            selectedText: "000"
          });
          set({
            cursor: [1, 0]
          });
          ensure('escape v i >', {
            selectedText: "111"
          });
          set({
            cursor: [2, 0]
          });
          ensure('escape v i ]', {
            selectedText: "222"
          });
          set({
            cursor: [3, 0]
          });
          return ensure('escape v i )', {
            selectedText: "333"
          });
        });
      });
      describe("a", function() {
        return it("select forwarding range", function() {
          set({
            cursor: [0, 0]
          });
          ensure('escape v a }', {
            selectedText: "{000}"
          });
          set({
            cursor: [1, 0]
          });
          ensure('escape v a >', {
            selectedText: "<111>"
          });
          set({
            cursor: [2, 0]
          });
          ensure('escape v a ]', {
            selectedText: "[222]"
          });
          set({
            cursor: [3, 0]
          });
          return ensure('escape v a )', {
            selectedText: "(333)"
          });
        });
      });
      return describe("multi line text", function() {
        var ref2, textOneA, textOneInner;
        ref2 = [], textOneInner = ref2[0], textOneA = ref2[1];
        beforeEach(function() {
          set({
            text: "000\n000{11\n111{22}\n111\n111}"
          });
          textOneInner = "11\n111{22}\n111\n111";
          return textOneA = "{11\n111{22}\n111\n111}";
        });
        describe("forwarding inner", function() {
          it("select forwarding range", function() {
            set({
              cursor: [1, 0]
            });
            return ensure("v i }", {
              selectedText: textOneInner
            });
          });
          it("select forwarding range", function() {
            set({
              cursor: [2, 0]
            });
            return ensure("v i }", {
              selectedText: "22"
            });
          });
          it("[case-1] no forwarding open pair, fail to find", function() {
            set({
              cursor: [0, 0]
            });
            return ensure("v i }", {
              selectedText: '0',
              cursor: [0, 1]
            });
          });
          it("[case-2] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [1, 4]
            });
            return ensure("v i }", {
              selectedText: textOneInner
            });
          });
          it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [3, 0]
            });
            return ensure("v i }", {
              selectedText: textOneInner
            });
          });
          return it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [4, 0]
            });
            return ensure("v i }", {
              selectedText: textOneInner
            });
          });
        });
        return describe("forwarding a", function() {
          it("select forwarding range", function() {
            set({
              cursor: [1, 0]
            });
            return ensure("v a }", {
              selectedText: textOneA
            });
          });
          it("select forwarding range", function() {
            set({
              cursor: [2, 0]
            });
            return ensure("v a }", {
              selectedText: "{22}"
            });
          });
          it("[case-1] no forwarding open pair, fail to find", function() {
            set({
              cursor: [0, 0]
            });
            return ensure("v a }", {
              selectedText: '0',
              cursor: [0, 1]
            });
          });
          it("[case-2] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [1, 4]
            });
            return ensure("v a }", {
              selectedText: textOneA
            });
          });
          it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [3, 0]
            });
            return ensure("v a }", {
              selectedText: textOneA
            });
          });
          return it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [4, 0]
            });
            return ensure("v a }", {
              selectedText: textOneA
            });
          });
        });
      });
    });
    describe("AnyPairAllowForwarding", function() {
      beforeEach(function() {
        atom.keymaps.add("text", {
          'atom-text-editor.vim-mode-plus.operator-pending-mode, atom-text-editor.vim-mode-plus.visual-mode': {
            ";": 'vim-mode-plus:inner-any-pair-allow-forwarding',
            ":": 'vim-mode-plus:a-any-pair-allow-forwarding'
          }
        });
        return set({
          text: "00\n00[11\n11\"222\"11{333}11(\n444()444\n)\n111]00{555}"
        });
      });
      describe("inner", function() {
        return it("select forwarding range within enclosed range(if exists)", function() {
          set({
            cursor: [2, 0]
          });
          keystroke('v');
          ensure(';', {
            selectedText: "222"
          });
          ensure(';', {
            selectedText: "333"
          });
          return ensure(';', {
            selectedText: "444()444"
          });
        });
      });
      return describe("a", function() {
        return it("select forwarding range within enclosed range(if exists)", function() {
          set({
            cursor: [2, 0]
          });
          keystroke('v');
          ensure(':', {
            selectedText: '"222"'
          });
          ensure(':', {
            selectedText: "{333}"
          });
          ensure(':', {
            selectedText: "(\n444()444\n)"
          });
          return ensure(':', {
            selectedText: "[11\n11\"222\"11{333}11(\n444()444\n)\n111]"
          });
        });
      });
    });
    describe("Tag", function() {
      var ensureSelectedText;
      ensureSelectedText = [][0];
      ensureSelectedText = function(start, keystroke, selectedText) {
        set({
          cursor: start
        });
        return ensure(keystroke, {
          selectedText: selectedText
        });
      };
      describe("inner-tag", function() {
        describe("precisely select inner", function() {
          var check, innerABC, selectedText, text, textAfterDeleted;
          check = getCheckFunctionFor('i t');
          text = "<abc>\n  <title>TITLE</title>\n</abc>";
          selectedText = "TITLE";
          innerABC = "\n  <title>TITLE</title>\n";
          textAfterDeleted = "<abc>\n  <title></title>\n</abc>";
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("[1] forwarding", function() {
            return check([1, 0], 'v', {
              selectedText: selectedText
            });
          });
          it("[2] openTag leftmost", function() {
            return check([1, 2], 'v', {
              selectedText: selectedText
            });
          });
          it("[3] openTag rightmost", function() {
            return check([1, 8], 'v', {
              selectedText: selectedText
            });
          });
          it("[4] Inner text", function() {
            return check([1, 10], 'v', {
              selectedText: selectedText
            });
          });
          it("[5] closeTag leftmost", function() {
            return check([1, 14], 'v', {
              selectedText: selectedText
            });
          });
          it("[6] closeTag rightmost", function() {
            return check([1, 21], 'v', {
              selectedText: selectedText
            });
          });
          it("[7] right of closeTag", function() {
            return check([2, 0], 'v', {
              selectedText: innerABC
            });
          });
          it("[8] forwarding", function() {
            return check([1, 0], 'd', {
              text: textAfterDeleted
            });
          });
          it("[9] openTag leftmost", function() {
            return check([1, 2], 'd', {
              text: textAfterDeleted
            });
          });
          it("[10] openTag rightmost", function() {
            return check([1, 8], 'd', {
              text: textAfterDeleted
            });
          });
          it("[11] Inner text", function() {
            return check([1, 10], 'd', {
              text: textAfterDeleted
            });
          });
          it("[12] closeTag leftmost", function() {
            return check([1, 14], 'd', {
              text: textAfterDeleted
            });
          });
          it("[13] closeTag rightmost", function() {
            return check([1, 21], 'd', {
              text: textAfterDeleted
            });
          });
          return it("[14] right of closeTag", function() {
            return check([2, 0], 'd', {
              text: "<abc></abc>"
            });
          });
        });
        describe("expansion and deletion", function() {
          beforeEach(function() {
            var htmlLikeText;
            htmlLikeText = "<DOCTYPE html>\n<html lang=\"en\">\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body>\n__<div>\n____<div>\n|______<div>\n________<p><a>\n______</div>\n____</div>\n__</div>\n</body>\n</html>\n";
            return set({
              textC_: htmlLikeText
            });
          });
          it("can expand selection when repeated", function() {
            ensure('v i t', {
              selectedText_: "\n________<p><a>\n______"
            });
            ensure('i t', {
              selectedText_: "\n______<div>\n________<p><a>\n______</div>\n____"
            });
            ensure('i t', {
              selectedText_: "\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__"
            });
            ensure('i t', {
              selectedText_: "\n__<div>\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__</div>\n"
            });
            return ensure('i t', {
              selectedText_: "\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body>\n__<div>\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__</div>\n</body>\n"
            });
          });
          return it('delete inner-tag and repatable', function() {
            set({
              cursor: [9, 0]
            });
            ensure("d i t", {
              text_: "<DOCTYPE html>\n<html lang=\"en\">\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body>\n__<div>\n____<div>\n______<div></div>\n____</div>\n__</div>\n</body>\n</html>\n"
            });
            ensure("3 .", {
              text_: "<DOCTYPE html>\n<html lang=\"en\">\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body></body>\n</html>\n"
            });
            return ensure(".", {
              text_: "<DOCTYPE html>\n<html lang=\"en\"></html>\n"
            });
          });
        });
        return describe("tag's IN-tag/Off-tag recognition", function() {
          describe("When tagStart's row contains NO NON-whitespaece till tagStart", function() {
            return it("[multi-line] select forwarding tag", function() {
              set({
                textC: "<span>\n  |  <span>inner</span>\n</span>"
              });
              return ensure("d i t", {
                text: "<span>\n    <span></span>\n</span>"
              });
            });
          });
          return describe("When tagStart's row contains SOME NON-whitespaece till tagStart", function() {
            it("[multi-line] select enclosing tag", function() {
              set({
                textC: "<span>\nhello | <span>inner</span>\n</span>"
              });
              return ensure("d i t", {
                text: "<span></span>"
              });
            });
            it("[one-line-1] select enclosing tag", function() {
              set({
                textC: "<span> | <span>inner</span></span>"
              });
              return ensure("d i t", {
                text: "<span></span>"
              });
            });
            return it("[one-line-2] select enclosing tag", function() {
              set({
                textC: "<span>h|ello<span>inner</span></span>"
              });
              return ensure("d i t", {
                text: "<span></span>"
              });
            });
          });
        });
      });
      return describe("a-tag", function() {
        return describe("precisely select a", function() {
          var aABC, check, selectedText, text, textAfterDeleted;
          check = getCheckFunctionFor('a t');
          text = "<abc>\n  <title>TITLE</title>\n</abc>";
          selectedText = "<title>TITLE</title>";
          aABC = text;
          textAfterDeleted = "<abc>\n__\n</abc>".replace(/_/g, ' ');
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("[1] forwarding", function() {
            return check([1, 0], 'v', {
              selectedText: selectedText
            });
          });
          it("[2] openTag leftmost", function() {
            return check([1, 2], 'v', {
              selectedText: selectedText
            });
          });
          it("[3] openTag rightmost", function() {
            return check([1, 8], 'v', {
              selectedText: selectedText
            });
          });
          it("[4] Inner text", function() {
            return check([1, 10], 'v', {
              selectedText: selectedText
            });
          });
          it("[5] closeTag leftmost", function() {
            return check([1, 14], 'v', {
              selectedText: selectedText
            });
          });
          it("[6] closeTag rightmost", function() {
            return check([1, 21], 'v', {
              selectedText: selectedText
            });
          });
          it("[7] right of closeTag", function() {
            return check([2, 0], 'v', {
              selectedText: aABC
            });
          });
          it("[8] forwarding", function() {
            return check([1, 0], 'd', {
              text: textAfterDeleted
            });
          });
          it("[9] openTag leftmost", function() {
            return check([1, 2], 'd', {
              text: textAfterDeleted
            });
          });
          it("[10] openTag rightmost", function() {
            return check([1, 8], 'd', {
              text: textAfterDeleted
            });
          });
          it("[11] Inner text", function() {
            return check([1, 10], 'd', {
              text: textAfterDeleted
            });
          });
          it("[12] closeTag leftmost", function() {
            return check([1, 14], 'd', {
              text: textAfterDeleted
            });
          });
          it("[13] closeTag rightmost", function() {
            return check([1, 21], 'd', {
              text: textAfterDeleted
            });
          });
          return it("[14] right of closeTag", function() {
            return check([2, 0], 'd', {
              text: ""
            });
          });
        });
      });
    });
    describe("SquareBracket", function() {
      describe("inner-square-bracket", function() {
        beforeEach(function() {
          return set({
            text: "[ something in here and in [here] ]",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current word in operator-pending mode", function() {
          return ensure('d i [', {
            text: "[]",
            cursor: [0, 1]
          });
        });
        return it("applies operators inside the current word in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i [', {
            text: "[ something in here and in [] ]",
            cursor: [0, 28]
          });
        });
      });
      return describe("a-square-bracket", function() {
        beforeEach(function() {
          return set({
            text: "[ something in here and in [here] ]",
            cursor: [0, 9]
          });
        });
        it("applies operators around the current square brackets in operator-pending mode", function() {
          return ensure('d a [', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators around the current square brackets in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a [', {
            text: "[ something in here and in  ]",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i [');
          text = '-[+]-';
          textFinal = '-[]-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('a [');
          text = '-[+]-';
          textFinal = '--';
          selectedText = '[+]';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("Parenthesis", function() {
      describe("inner-parenthesis", function() {
        beforeEach(function() {
          return set({
            text: "( something in here and in (here) )",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current word in operator-pending mode", function() {
          return ensure('d i (', {
            text: "()",
            cursor: [0, 1]
          });
        });
        it("applies operators inside the current word in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i (', {
            text: "( something in here and in () )",
            cursor: [0, 28]
          });
        });
        it("select inner () by skipping nesting pair", function() {
          set({
            text: 'expect(editor.getScrollTop())',
            cursor: [0, 7]
          });
          return ensure('v i (', {
            selectedText: 'editor.getScrollTop()'
          });
        });
        it("skip escaped pair case-1", function() {
          set({
            text: 'expect(editor.g\\(etScrollTp())',
            cursor: [0, 20]
          });
          return ensure('v i (', {
            selectedText: 'editor.g\\(etScrollTp()'
          });
        });
        it("dont skip literal backslash", function() {
          set({
            text: 'expect(editor.g\\\\(etScrollTp())',
            cursor: [0, 20]
          });
          return ensure('v i (', {
            selectedText: 'etScrollTp()'
          });
        });
        it("skip escaped pair case-2", function() {
          set({
            text: 'expect(editor.getSc\\)rollTp())',
            cursor: [0, 7]
          });
          return ensure('v i (', {
            selectedText: 'editor.getSc\\)rollTp()'
          });
        });
        it("skip escaped pair case-3", function() {
          set({
            text: 'expect(editor.ge\\(tSc\\)rollTp())',
            cursor: [0, 7]
          });
          return ensure('v i (', {
            selectedText: 'editor.ge\\(tSc\\)rollTp()'
          });
        });
        it("works with multiple cursors", function() {
          set({
            text: "( a b ) cde ( f g h ) ijk",
            cursor: [[0, 2], [0, 18]]
          });
          return ensure('v i (', {
            selectedBufferRange: [[[0, 1], [0, 6]], [[0, 13], [0, 20]]]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i (');
          text = '-(+)-';
          textFinal = '-()-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-parenthesis", function() {
        beforeEach(function() {
          return set({
            text: "( something in here and in (here) )",
            cursor: [0, 9]
          });
        });
        it("applies operators around the current parentheses in operator-pending mode", function() {
          return ensure('d a (', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators around the current parentheses in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a (', {
            text: "( something in here and in  )",
            cursor: [0, 27]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('a (');
          text = '-(+)-';
          textFinal = '--';
          selectedText = '(+)';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("Paragraph", function() {
      var ensureParagraph, text;
      text = null;
      ensureParagraph = function(keystroke, options) {
        if (!options.setCursor) {
          throw new Errow("no setCursor provided");
        }
        set({
          cursor: options.setCursor
        });
        delete options.setCursor;
        ensure(keystroke, options);
        return ensure('escape', {
          mode: 'normal'
        });
      };
      beforeEach(function() {
        text = new TextData("\n1: P-1\n\n3: P-2\n4: P-2\n\n\n7: P-3\n8: P-3\n9: P-3\n\n");
        return set({
          cursor: [1, 0],
          text: text.getRaw()
        });
      });
      describe("inner-paragraph", function() {
        it("select consequtive blank rows", function() {
          ensureParagraph('v i p', {
            setCursor: [0, 0],
            selectedText: text.getLines([0])
          });
          ensureParagraph('v i p', {
            setCursor: [2, 0],
            selectedText: text.getLines([2])
          });
          return ensureParagraph('v i p', {
            setCursor: [5, 0],
            selectedText: text.getLines([5, 6])
          });
        });
        it("select consequtive non-blank rows", function() {
          ensureParagraph('v i p', {
            setCursor: [1, 0],
            selectedText: text.getLines([1])
          });
          ensureParagraph('v i p', {
            setCursor: [3, 0],
            selectedText: text.getLines([3, 4])
          });
          return ensureParagraph('v i p', {
            setCursor: [7, 0],
            selectedText: text.getLines([7, 8, 9])
          });
        });
        return it("operate on inner paragraph", function() {
          return ensureParagraph('y i p', {
            setCursor: [7, 0],
            register: {
              '"': {
                text: text.getLines([7, 8, 9])
              }
            }
          });
        });
      });
      return describe("a-paragraph", function() {
        it("select two paragraph as one operation", function() {
          ensureParagraph('v a p', {
            setCursor: [0, 0],
            selectedText: text.getLines([0, 1])
          });
          ensureParagraph('v a p', {
            setCursor: [2, 0],
            selectedText: text.getLines([2, 3, 4])
          });
          return ensureParagraph('v a p', {
            setCursor: [5, 0],
            selectedText: text.getLines([5, 6, 7, 8, 9])
          });
        });
        it("select two paragraph as one operation", function() {
          ensureParagraph('v a p', {
            setCursor: [1, 0],
            selectedText: text.getLines([1, 2])
          });
          ensureParagraph('v a p', {
            setCursor: [3, 0],
            selectedText: text.getLines([3, 4, 5, 6])
          });
          return ensureParagraph('v a p', {
            setCursor: [7, 0],
            selectedText: text.getLines([7, 8, 9, 10])
          });
        });
        return it("operate on a paragraph", function() {
          return ensureParagraph('y a p', {
            setCursor: [3, 0],
            register: {
              '"': {
                text: text.getLines([3, 4, 5, 6])
              }
            }
          });
        });
      });
    });
    describe('Comment', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return runs(function() {
          return set({
            grammar: 'source.coffee',
            text: "###\nmultiline comment\n###\n\n# One line comment\n\n# Comment\n# border\nclass QuickSort"
          });
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      return describe('inner-comment', function() {
        it('select inner comment block', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('v i /', {
            selectedText: '###\nmultiline comment\n###\n',
            selectedBufferRange: [[0, 0], [3, 0]]
          });
        });
        it('select one line comment', function() {
          set({
            cursor: [4, 0]
          });
          return ensure('v i /', {
            selectedText: '# One line comment\n',
            selectedBufferRange: [[4, 0], [5, 0]]
          });
        });
        return it('not select non-comment line', function() {
          set({
            cursor: [6, 0]
          });
          return ensure('v i /', {
            selectedText: '# Comment\n# border\n',
            selectedBufferRange: [[6, 0], [8, 0]]
          });
        });
      });
    });
    describe('Indentation', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return getVimState('sample.coffee', function(vimState, vim) {
          editor = vimState.editor, editorElement = vimState.editorElement;
          return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe('inner-indentation', function() {
        return it('select lines with deeper indent-level', function() {
          set({
            cursor: [12, 0]
          });
          return ensure('v i i', {
            selectedBufferRange: [[12, 0], [15, 0]]
          });
        });
      });
      return describe('a-indentation', function() {
        return it('wont stop on blank line when selecting indent', function() {
          set({
            cursor: [12, 0]
          });
          return ensure('v a i', {
            selectedBufferRange: [[10, 0], [27, 0]]
          });
        });
      });
    });
    describe('Fold', function() {
      var rangeForRows;
      rangeForRows = function(startRow, endRow) {
        return [[startRow, 0], [endRow + 1, 0]];
      };
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return getVimState('sample.coffee', function(vimState, vim) {
          editor = vimState.editor, editorElement = vimState.editorElement;
          return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe('inner-fold', function() {
        it("select inner range of fold", function() {
          set({
            cursor: [13, 0]
          });
          return ensure('v i z', {
            selectedBufferRange: rangeForRows(10, 25)
          });
        });
        it("select inner range of fold", function() {
          set({
            cursor: [19, 0]
          });
          return ensure('v i z', {
            selectedBufferRange: rangeForRows(19, 23)
          });
        });
        it("can expand selection", function() {
          set({
            cursor: [23, 0]
          });
          keystroke('v');
          ensure('i z', {
            selectedBufferRange: rangeForRows(23, 23)
          });
          ensure('i z', {
            selectedBufferRange: rangeForRows(19, 23)
          });
          ensure('i z', {
            selectedBufferRange: rangeForRows(10, 25)
          });
          return ensure('i z', {
            selectedBufferRange: rangeForRows(9, 28)
          });
        });
        describe("when startRow of selection is on fold startRow", function() {
          return it('select inner fold', function() {
            set({
              cursor: [20, 7]
            });
            return ensure('v i z', {
              selectedBufferRange: rangeForRows(21, 21)
            });
          });
        });
        describe("when containing fold are not found", function() {
          return it("do nothing", function() {
            set({
              cursor: [20, 0]
            });
            ensure('V G', {
              selectedBufferRange: rangeForRows(20, 30)
            });
            return ensure('i z', {
              selectedBufferRange: rangeForRows(20, 30)
            });
          });
        });
        return describe("when indent level of fold startRow and endRow is same", function() {
          beforeEach(function() {
            waitsForPromise(function() {
              return atom.packages.activatePackage('language-javascript');
            });
            return getVimState('sample.js', function(state, vimEditor) {
              editor = state.editor, editorElement = state.editorElement;
              return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
            });
          });
          afterEach(function() {
            return atom.packages.deactivatePackage('language-javascript');
          });
          return it("doesn't select fold endRow", function() {
            set({
              cursor: [5, 0]
            });
            ensure('v i z', {
              selectedBufferRange: rangeForRows(5, 6)
            });
            return ensure('a z', {
              selectedBufferRange: rangeForRows(4, 7)
            });
          });
        });
      });
      return describe('a-fold', function() {
        it('select fold row range', function() {
          set({
            cursor: [13, 0]
          });
          return ensure('v a z', {
            selectedBufferRange: rangeForRows(9, 25)
          });
        });
        it('select fold row range', function() {
          set({
            cursor: [19, 0]
          });
          return ensure('v a z', {
            selectedBufferRange: rangeForRows(18, 23)
          });
        });
        it('can expand selection', function() {
          set({
            cursor: [23, 0]
          });
          keystroke('v');
          ensure('a z', {
            selectedBufferRange: rangeForRows(22, 23)
          });
          ensure('a z', {
            selectedBufferRange: rangeForRows(18, 23)
          });
          ensure('a z', {
            selectedBufferRange: rangeForRows(9, 25)
          });
          return ensure('a z', {
            selectedBufferRange: rangeForRows(8, 28)
          });
        });
        describe("when startRow of selection is on fold startRow", function() {
          return it('select fold starting from current row', function() {
            set({
              cursor: [20, 7]
            });
            return ensure('v a z', {
              selectedBufferRange: rangeForRows(20, 21)
            });
          });
        });
        return describe("when containing fold are not found", function() {
          return it("do nothing", function() {
            set({
              cursor: [20, 0]
            });
            ensure('V G', {
              selectedBufferRange: rangeForRows(20, 30)
            });
            return ensure('a z', {
              selectedBufferRange: rangeForRows(20, 30)
            });
          });
        });
      });
    });
    describe('Function', function() {
      describe('coffee', function() {
        var pack, scope;
        pack = 'language-coffee-script';
        scope = 'source.coffee';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          set({
            text: "# Commment\n\nhello = ->\n  a = 1\n  b = 2\n  c = 3\n\n# Commment",
            cursor: [3, 0]
          });
          return runs(function() {
            var grammar;
            grammar = atom.grammars.grammarForScopeName(scope);
            return editor.setGrammar(grammar);
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        describe('inner-function for coffee', function() {
          return it('select except start row', function() {
            return ensure('v i f', {
              selectedBufferRange: [[3, 0], [6, 0]]
            });
          });
        });
        return describe('a-function for coffee', function() {
          return it('select function', function() {
            return ensure('v a f', {
              selectedBufferRange: [[2, 0], [6, 0]]
            });
          });
        });
      });
      describe('ruby', function() {
        var pack, scope;
        pack = 'language-ruby';
        scope = 'source.ruby';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          set({
            text: "# Commment\n\ndef hello\n  a = 1\n  b = 2\n  c = 3\nend\n\n# Commment",
            cursor: [3, 0]
          });
          return runs(function() {
            var grammar;
            grammar = atom.grammars.grammarForScopeName(scope);
            return editor.setGrammar(grammar);
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        describe('inner-function for ruby', function() {
          return it('select except start row', function() {
            return ensure('v i f', {
              selectedBufferRange: [[3, 0], [6, 0]]
            });
          });
        });
        return describe('a-function for ruby', function() {
          return it('select function', function() {
            return ensure('v a f', {
              selectedBufferRange: [[2, 0], [7, 0]]
            });
          });
        });
      });
      return describe('go', function() {
        var pack, scope;
        pack = 'language-go';
        scope = 'source.go';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          set({
            text: "// Commment\n\nfunc main() {\n  a := 1\n  b := 2\n  c := 3\n}\n\n// Commment",
            cursor: [3, 0]
          });
          return runs(function() {
            var grammar;
            grammar = atom.grammars.grammarForScopeName(scope);
            return editor.setGrammar(grammar);
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        describe('inner-function for go', function() {
          return it('select except start row', function() {
            return ensure('v i f', {
              selectedBufferRange: [[3, 0], [6, 0]]
            });
          });
        });
        return describe('a-function for go', function() {
          return it('select function', function() {
            return ensure('v a f', {
              selectedBufferRange: [[2, 0], [7, 0]]
            });
          });
        });
      });
    });
    describe('CurrentLine', function() {
      beforeEach(function() {
        return set({
          text: "This is\n  multi line\ntext"
        });
      });
      describe('inner-current-line', function() {
        it('select current line without including last newline', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('v i l', {
            selectedText: 'This is'
          });
        });
        return it('also skip leading white space', function() {
          set({
            cursor: [1, 0]
          });
          return ensure('v i l', {
            selectedText: 'multi line'
          });
        });
      });
      return describe('a-current-line', function() {
        it('select current line without including last newline as like `vil`', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('v a l', {
            selectedText: 'This is'
          });
        });
        return it('wont skip leading white space not like `vil`', function() {
          set({
            cursor: [1, 0]
          });
          return ensure('v a l', {
            selectedText: '  multi line'
          });
        });
      });
    });
    describe('Arguments', function() {
      describe('auto-detect inner-pair target', function() {
        describe('inner-pair is comma separated', function() {
          it("target inner-paren by auto-detect", function() {
            set({
              textC: "(1|st, 2nd)"
            });
            ensure('d i ,', {
              textC: "(|, 2nd)"
            });
            set({
              textC: "(1|st, 2nd)"
            });
            ensure('d a ,', {
              textC: "(|2nd)"
            });
            set({
              textC: "(1st, 2|nd)"
            });
            ensure('d i ,', {
              textC: "(1st, |)"
            });
            set({
              textC: "(1st, 2|nd)"
            });
            return ensure('d a ,', {
              textC: "(1st|)"
            });
          });
          it("target inner-curly-bracket by auto-detect", function() {
            set({
              textC: "{1|st, 2nd}"
            });
            ensure('d i ,', {
              textC: "{|, 2nd}"
            });
            set({
              textC: "{1|st, 2nd}"
            });
            ensure('d a ,', {
              textC: "{|2nd}"
            });
            set({
              textC: "{1st, 2|nd}"
            });
            ensure('d i ,', {
              textC: "{1st, |}"
            });
            set({
              textC: "{1st, 2|nd}"
            });
            return ensure('d a ,', {
              textC: "{1st|}"
            });
          });
          return it("target inner-square-bracket by auto-detect", function() {
            set({
              textC: "[1|st, 2nd]"
            });
            ensure('d i ,', {
              textC: "[|, 2nd]"
            });
            set({
              textC: "[1|st, 2nd]"
            });
            ensure('d a ,', {
              textC: "[|2nd]"
            });
            set({
              textC: "[1st, 2|nd]"
            });
            ensure('d i ,', {
              textC: "[1st, |]"
            });
            set({
              textC: "[1st, 2|nd]"
            });
            return ensure('d a ,', {
              textC: "[1st|]"
            });
          });
        });
        return describe('inner-pair is space separated', function() {
          it("target inner-paren by auto-detect", function() {
            set({
              textC: "(1|st 2nd)"
            });
            ensure('d i ,', {
              textC: "(| 2nd)"
            });
            set({
              textC: "(1|st 2nd)"
            });
            ensure('d a ,', {
              textC: "(|2nd)"
            });
            set({
              textC: "(1st 2|nd)"
            });
            ensure('d i ,', {
              textC: "(1st |)"
            });
            set({
              textC: "(1st 2|nd)"
            });
            return ensure('d a ,', {
              textC: "(1st|)"
            });
          });
          it("target inner-curly-bracket by auto-detect", function() {
            set({
              textC: "{1|st 2nd}"
            });
            ensure('d i ,', {
              textC: "{| 2nd}"
            });
            set({
              textC: "{1|st 2nd}"
            });
            ensure('d a ,', {
              textC: "{|2nd}"
            });
            set({
              textC: "{1st 2|nd}"
            });
            ensure('d i ,', {
              textC: "{1st |}"
            });
            set({
              textC: "{1st 2|nd}"
            });
            return ensure('d a ,', {
              textC: "{1st|}"
            });
          });
          return it("target inner-square-bracket by auto-detect", function() {
            set({
              textC: "[1|st 2nd]"
            });
            ensure('d i ,', {
              textC: "[| 2nd]"
            });
            set({
              textC: "[1|st 2nd]"
            });
            ensure('d a ,', {
              textC: "[|2nd]"
            });
            set({
              textC: "[1st 2|nd]"
            });
            ensure('d i ,', {
              textC: "[1st |]"
            });
            set({
              textC: "[1st 2|nd]"
            });
            return ensure('d a ,', {
              textC: "[1st|]"
            });
          });
        });
      });
      describe("[fallback] when auto-detect failed, target current-line", function() {
        beforeEach(function() {
          return set({
            text: "if hello(world) and good(bye) {\n  1st;\n  2nd;\n}"
          });
        });
        it("delete 1st elem of inner-curly-bracket when auto-detect succeeded", function() {
          set({
            cursor: [1, 3]
          });
          return ensure('d a ,', {
            textC: "if hello(world) and good(bye) {\n  |2nd;\n}"
          });
        });
        it("delete 2st elem of inner-curly-bracket when auto-detect succeeded", function() {
          set({
            cursor: [2, 3]
          });
          return ensure('d a ,', {
            textC: "if hello(world) and good(bye) {\n  1st|;\n}"
          });
        });
        it("delete 1st elem of current-line when auto-detect failed", function() {
          set({
            cursor: [0, 0]
          });
          return ensure('d a ,', {
            textC: "|hello(world) and good(bye) {\n  1st;\n  2nd;\n}"
          });
        });
        it("delete 2nd elem of current-line when auto-detect failed", function() {
          set({
            cursor: [0, 3]
          });
          return ensure('d a ,', {
            textC: "if |and good(bye) {\n  1st;\n  2nd;\n}"
          });
        });
        it("delete 3rd elem of current-line when auto-detect failed", function() {
          set({
            cursor: [0, 16]
          });
          return ensure('d a ,', {
            textC: "if hello(world) |good(bye) {\n  1st;\n  2nd;\n}"
          });
        });
        return it("delete 4th elem of current-line when auto-detect failed", function() {
          set({
            cursor: [0, 20]
          });
          return ensure('d a ,', {
            textC: "if hello(world) and |{\n  1st;\n  2nd;\n}"
          });
        });
      });
      describe('slingle line comma separated text', function() {
        describe("change 1st arg", function() {
          beforeEach(function() {
            return set({
              textC: "var a = func(f|irst(1, 2, 3), second(), 3)"
            });
          });
          it('change', function() {
            return ensure('c i ,', {
              textC: "var a = func(|, second(), 3)"
            });
          });
          return it('change', function() {
            return ensure('c a ,', {
              textC: "var a = func(|second(), 3)"
            });
          });
        });
        describe('change 2nd arg', function() {
          beforeEach(function() {
            return set({
              textC: "var a = func(first(1, 2, 3),| second(), 3)"
            });
          });
          it('change', function() {
            return ensure('c i ,', {
              textC: "var a = func(first(1, 2, 3), |, 3)"
            });
          });
          return it('change', function() {
            return ensure('c a ,', {
              textC: "var a = func(first(1, 2, 3), |3)"
            });
          });
        });
        describe('change 3rd arg', function() {
          beforeEach(function() {
            return set({
              textC: "var a = func(first(1, 2, 3), second(),| 3)"
            });
          });
          it('change', function() {
            return ensure('c i ,', {
              textC: "var a = func(first(1, 2, 3), second(), |)"
            });
          });
          return it('change', function() {
            return ensure('c a ,', {
              textC: "var a = func(first(1, 2, 3), second()|)"
            });
          });
        });
        describe('when cursor is on-comma-separator, it affects preceeding arg', function() {
          beforeEach(function() {
            return set({
              textC: "var a = func(first(1, 2, 3)|, second(), 3)"
            });
          });
          it('change 1st', function() {
            return ensure('c i ,', {
              textC: "var a = func(|, second(), 3)"
            });
          });
          return it('change 1st', function() {
            return ensure('c a ,', {
              textC: "var a = func(|second(), 3)"
            });
          });
        });
        describe('cursor-is-on-white-space, it affects followed arg', function() {
          beforeEach(function() {
            return set({
              textC: "var a = func(first(1, 2, 3),| second(), 3)"
            });
          });
          it('change 2nd', function() {
            return ensure('c i ,', {
              textC: "var a = func(first(1, 2, 3), |, 3)"
            });
          });
          return it('change 2nd', function() {
            return ensure('c a ,', {
              textC: "var a = func(first(1, 2, 3), |3)"
            });
          });
        });
        describe("cursor-is-on-parehthesis, it wont target inner-parent", function() {
          it('change 1st of outer-paren', function() {
            set({
              textC: "var a = func(first|(1, 2, 3), second(), 3)"
            });
            return ensure('c i ,', {
              textC: "var a = func(|, second(), 3)"
            });
          });
          return it('change 3rd of outer-paren', function() {
            set({
              textC: "var a = func(first(1, 2, 3|), second(), 3)"
            });
            return ensure('c i ,', {
              textC: "var a = func(|, second(), 3)"
            });
          });
        });
        return describe("cursor-is-next-or-before parehthesis, it target inner-parent", function() {
          it('change 1st of inner-paren', function() {
            set({
              textC: "var a = func(first(|1, 2, 3), second(), 3)"
            });
            return ensure('c i ,', {
              textC: "var a = func(first(|, 2, 3), second(), 3)"
            });
          });
          return it('change 3rd of inner-paren', function() {
            set({
              textC: "var a = func(first(1, 2, |3), second(), 3)"
            });
            return ensure('c i ,', {
              textC: "var a = func(first(1, 2, |), second(), 3)"
            });
          });
        });
      });
      describe('slingle line space separated text', function() {
        describe("change 1st arg", function() {
          beforeEach(function() {
            return set({
              textC: "%w(|1st 2nd 3rd)"
            });
          });
          it('change', function() {
            return ensure('c i ,', {
              textC: "%w(| 2nd 3rd)"
            });
          });
          return it('change', function() {
            return ensure('c a ,', {
              textC: "%w(|2nd 3rd)"
            });
          });
        });
        describe("change 2nd arg", function() {
          beforeEach(function() {
            return set({
              textC: "%w(1st |2nd 3rd)"
            });
          });
          it('change', function() {
            return ensure('c i ,', {
              textC: "%w(1st | 3rd)"
            });
          });
          return it('change', function() {
            return ensure('c a ,', {
              textC: "%w(1st |3rd)"
            });
          });
        });
        return describe("change 2nd arg", function() {
          beforeEach(function() {
            return set({
              textC: "%w(1st 2nd |3rd)"
            });
          });
          it('change', function() {
            return ensure('c i ,', {
              textC: "%w(1st 2nd |)"
            });
          });
          return it('change', function() {
            return ensure('c a ,', {
              textC: "%w(1st 2nd|)"
            });
          });
        });
      });
      describe('multi line comma separated text', function() {
        beforeEach(function() {
          return set({
            textC_: "[\n  \"1st elem is string\",\n  () => hello('2nd elm is function'),\n  3rdElmHasTrailingComma,\n]"
          });
        });
        return describe("change 1st arg", function() {
          it('change 1st inner-arg', function() {
            set({
              cursor: [1, 0]
            });
            return ensure('c i ,', {
              textC: "[\n  |,\n  () => hello('2nd elm is function'),\n  3rdElmHasTrailingComma,\n]"
            });
          });
          it('change 1st a-arg', function() {
            set({
              cursor: [1, 0]
            });
            return ensure('c a ,', {
              textC: "[\n  |() => hello('2nd elm is function'),\n  3rdElmHasTrailingComma,\n]"
            });
          });
          it('change 2nd inner-arg', function() {
            set({
              cursor: [2, 0]
            });
            return ensure('c i ,', {
              textC: "[\n  \"1st elem is string\",\n  |,\n  3rdElmHasTrailingComma,\n]"
            });
          });
          it('change 2nd a-arg', function() {
            set({
              cursor: [2, 0]
            });
            return ensure('c a ,', {
              textC: "[\n  \"1st elem is string\",\n  |3rdElmHasTrailingComma,\n]"
            });
          });
          it('change 3rd inner-arg', function() {
            set({
              cursor: [3, 0]
            });
            return ensure('c i ,', {
              textC: "[\n  \"1st elem is string\",\n  () => hello('2nd elm is function'),\n  |,\n]"
            });
          });
          return it('change 3rd a-arg', function() {
            set({
              cursor: [3, 0]
            });
            return ensure('c a ,', {
              textC: "[\n  \"1st elem is string\",\n  () => hello('2nd elm is function')|,\n]"
            });
          });
        });
      });
      return describe('when it coudnt find inner-pair from cursor it target current-line', function() {
        beforeEach(function() {
          return set({
            textC_: "if |isMorning(time, of, the, day) {\n  helllo(\"world\");\n}"
          });
        });
        it("change inner-arg", function() {
          return ensure("c i ,", {
            textC_: "if | {\n  helllo(\"world\");\n}"
          });
        });
        return it("change a-arg", function() {
          return ensure("c a ,", {
            textC_: "if |{\n  helllo(\"world\");\n}"
          });
        });
      });
    });
    describe('Entire', function() {
      var text;
      text = "This is\n  multi line\ntext";
      beforeEach(function() {
        return set({
          text: text,
          cursor: [0, 0]
        });
      });
      describe('inner-entire', function() {
        return it('select entire buffer', function() {
          ensure('escape', {
            selectedText: ''
          });
          ensure('v i e', {
            selectedText: text
          });
          ensure('escape', {
            selectedText: ''
          });
          return ensure('j j v i e', {
            selectedText: text
          });
        });
      });
      return describe('a-entire', function() {
        return it('select entire buffer', function() {
          ensure('escape', {
            selectedText: ''
          });
          ensure('v a e', {
            selectedText: text
          });
          ensure('escape', {
            selectedText: ''
          });
          return ensure('j j v a e', {
            selectedText: text
          });
        });
      });
    });
    return describe('SearchMatchForward, SearchBackwards', function() {
      var text;
      text = "0 xxx\n1 abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc\n";
      beforeEach(function() {
        jasmine.attachToDOM(atom.views.getView(atom.workspace));
        set({
          text: text,
          cursor: [0, 0]
        });
        ensure([
          '/', {
            search: 'abc'
          }
        ], {
          cursor: [1, 2],
          mode: 'normal'
        });
        return expect(vimState.globalState.get('lastSearchPattern')).toEqual(/abc/g);
      });
      describe('gn from normal mode', function() {
        return it('select ranges matches to last search pattern and extend selection', function() {
          ensure('g n', {
            cursor: [1, 5],
            mode: ['visual', 'characterwise'],
            selectionIsReversed: false,
            selectedText: 'abc'
          });
          ensure('g n', {
            selectionIsReversed: false,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc"
          });
          ensure('g n', {
            selectionIsReversed: false,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
          return ensure('g n', {
            selectionIsReversed: false,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
        });
      });
      describe('gN from normal mode', function() {
        beforeEach(function() {
          return set({
            cursor: [4, 3]
          });
        });
        return it('select ranges matches to last search pattern and extend selection', function() {
          ensure('g N', {
            cursor: [4, 2],
            mode: ['visual', 'characterwise'],
            selectionIsReversed: true,
            selectedText: 'abc'
          });
          ensure('g N', {
            selectionIsReversed: true,
            mode: ['visual', 'characterwise'],
            selectedText: "abc\n4 abc"
          });
          ensure('g N', {
            selectionIsReversed: true,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
          return ensure('g N', {
            selectionIsReversed: true,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
        });
      });
      return describe('as operator target', function() {
        it('delete next occurrence of last search pattern', function() {
          ensure('d g n', {
            cursor: [1, 2],
            mode: 'normal',
            text: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx abc\n4 abc\n"
          });
          ensure('.', {
            cursor: [3, 5],
            mode: 'normal',
            text_: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx_\n4 abc\n"
          });
          return ensure('.', {
            cursor: [4, 1],
            mode: 'normal',
            text_: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx_\n4 \n"
          });
        });
        return it('change next occurrence of last search pattern', function() {
          ensure('c g n', {
            cursor: [1, 2],
            mode: 'insert',
            text: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx abc\n4 abc\n"
          });
          keystroke('escape');
          set({
            cursor: [4, 0]
          });
          return ensure('c g N', {
            cursor: [3, 6],
            mode: 'insert',
            text_: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx_\n4 abc\n"
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy90ZXh0LW9iamVjdC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBb0MsT0FBQSxDQUFRLGVBQVIsQ0FBcEMsRUFBQyw2QkFBRCxFQUFjLHVCQUFkLEVBQXdCOztFQUN4QixRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxZQUFULEVBQXVCLFNBQUE7QUFDckIsUUFBQTtJQUFBLE9BQTRELEVBQTVELEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsbUJBQWQsRUFBeUIsZ0JBQXpCLEVBQWlDLHVCQUFqQyxFQUFnRDtJQUVoRCxtQkFBQSxHQUFzQixTQUFDLFVBQUQ7YUFDcEIsU0FBQyxZQUFELEVBQWUsU0FBZixFQUEwQixPQUExQjtRQUNFLEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxZQUFSO1NBQUo7ZUFDQSxNQUFBLENBQVUsU0FBRCxHQUFXLEdBQVgsR0FBYyxVQUF2QixFQUFxQyxPQUFyQztNQUZGO0lBRG9CO0lBS3RCLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLFNBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsbUJBQUQsRUFBTSx5QkFBTixFQUFjLCtCQUFkLEVBQTJCO01BSGpCLENBQVo7SUFEUyxDQUFYO0lBTUEsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQTtNQUNyQixVQUFBLENBQVcsU0FBQTtRQUNULGVBQUEsQ0FBZ0IsU0FBQTtpQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsd0JBQTlCO1FBRGMsQ0FBaEI7ZUFFQSxXQUFBLENBQVksZUFBWixFQUE2QixTQUFDLEtBQUQsRUFBUSxTQUFSO1VBQzFCLHFCQUFELEVBQVM7aUJBQ1IsbUJBQUQs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RUFBb0QsU0FBQTtVQUNsRCxNQUFBLENBQU8sT0FBUCxFQUNFO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtZQUNBLElBQUEsRUFBTSxRQUROO1lBRUEsSUFBQSxFQUFNLGdEQUZOO1dBREY7VUFVQSxNQUFBLENBQU8sR0FBUCxFQUNFO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtZQUNBLElBQUEsRUFBTSxRQUROO1lBRUEsS0FBQSxFQUFPLDZDQUZQO1dBREY7aUJBVUEsTUFBQSxDQUFPLEdBQVAsRUFDRTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7WUFDQSxJQUFBLEVBQU0sUUFETjtZQUVBLEtBQUEsRUFBTywwQ0FGUDtXQURGO1FBckJrRCxDQUFwRDtlQStCQSxFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQTtVQUNsRCxNQUFBLENBQU8sT0FBUCxFQUNFO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtZQUNBLElBQUEsRUFBTSxRQUROO1lBRUEsSUFBQSxFQUFNLGdEQUZOO1dBREY7VUFVQSxTQUFBLENBQVUsUUFBVjtVQUNBLEdBQUEsQ0FBSTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSjtpQkFDQSxNQUFBLENBQU8sT0FBUCxFQUNFO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtZQUNBLElBQUEsRUFBTSxRQUROO1lBRUEsS0FBQSxFQUFPLDZDQUZQO1dBREY7UUFia0QsQ0FBcEQ7TUFoQzZCLENBQS9CO0lBbEY4QyxDQUFoRDtFQTMzRHFCLENBQXZCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNoLCBUZXh0RGF0YX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiVGV4dE9iamVjdFwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGdldENoZWNrRnVuY3Rpb25Gb3IgPSAodGV4dE9iamVjdCkgLT5cbiAgICAoaW5pdGlhbFBvaW50LCBrZXlzdHJva2UsIG9wdGlvbnMpIC0+XG4gICAgICBzZXQgY3Vyc29yOiBpbml0aWFsUG9pbnRcbiAgICAgIGVuc3VyZSBcIiN7a2V5c3Ryb2tlfSAje3RleHRPYmplY3R9XCIsIG9wdGlvbnNcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCB2aW1FZGl0b3IpIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSB2aW1FZGl0b3JcblxuICBkZXNjcmliZSBcIlRleHRPYmplY3RcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuICAgICAgZ2V0VmltU3RhdGUgJ3NhbXBsZS5jb2ZmZWUnLCAoc3RhdGUsIHZpbUVkaXRvcikgLT5cbiAgICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSBzdGF0ZVxuICAgICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSB2aW1FZGl0b3JcbiAgICBhZnRlckVhY2ggLT5cbiAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIFRleHRPYmplY3QgaXMgZXhjdXRlZCBkaXJlY3RseVwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3QgdGhhdCBUZXh0T2JqZWN0XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs4LCA3XVxuICAgICAgICBkaXNwYXRjaChlZGl0b3JFbGVtZW50LCAndmltLW1vZGUtcGx1czppbm5lci13b3JkJylcbiAgICAgICAgZW5zdXJlIHNlbGVjdGVkVGV4dDogJ1F1aWNrU29ydCdcblxuICBkZXNjcmliZSBcIldvcmRcIiwgLT5cbiAgICBkZXNjcmliZSBcImlubmVyLXdvcmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIxMjM0NSBhYmNkZSBBQkNERVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBpbnNpZGUgdGhlIGN1cnJlbnQgd29yZCBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGkgdycsXG4gICAgICAgICAgdGV4dDogICAgIFwiMTIzNDUgIEFCQ0RFXCJcbiAgICAgICAgICBjdXJzb3I6ICAgWzAsIDZdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYmNkZSdcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBpdCBcInNlbGVjdHMgaW5zaWRlIHRoZSBjdXJyZW50IHdvcmQgaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2IGkgdycsXG4gICAgICAgICAgc2VsZWN0ZWRTY3JlZW5SYW5nZTogW1swLCA2XSwgWzAsIDExXV1cblxuICAgICAgaXQgXCJ3b3JrcyB3aXRoIG11bHRpcGxlIGN1cnNvcnNcIiwgLT5cbiAgICAgICAgc2V0IGFkZEN1cnNvcjogWzAsIDFdXG4gICAgICAgIGVuc3VyZSAndiBpIHcnLFxuICAgICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtcbiAgICAgICAgICAgIFtbMCwgNl0sIFswLCAxMV1dXG4gICAgICAgICAgICBbWzAsIDBdLCBbMCwgNV1dXG4gICAgICAgICAgXVxuXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiBuZXh0IHRvIE5vbldvcmRDaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJhYmMoZGVmKVwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCA0XVxuXG4gICAgICAgIGl0IFwiY2hhbmdlIGluc2lkZSB3b3JkXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdjIGkgdycsIHRleHQ6IFwiYWJjKClcIiwgbW9kZTogXCJpbnNlcnRcIlxuXG4gICAgICAgIGl0IFwiZGVsZXRlIGluc2lkZSB3b3JkXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIGkgdycsIHRleHQ6IFwiYWJjKClcIiwgbW9kZTogXCJub3JtYWxcIlxuXG4gICAgICBkZXNjcmliZSBcImN1cnNvcidzIG5leHQgY2hhciBpcyBOb25Xb3JkQ2hhcmFjdGVyXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiYWJjKGRlZilcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgNl1cblxuICAgICAgICBpdCBcImNoYW5nZSBpbnNpZGUgd29yZFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnYyBpIHcnLCB0ZXh0OiBcImFiYygpXCIsIG1vZGU6IFwiaW5zZXJ0XCJcblxuICAgICAgICBpdCBcImRlbGV0ZSBpbnNpZGUgd29yZFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBpIHcnLCB0ZXh0OiBcImFiYygpXCIsIG1vZGU6IFwibm9ybWFsXCJcblxuICAgIGRlc2NyaWJlIFwiYS13b3JkXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyMzQ1IGFiY2RlIEFCQ0RFXCIsIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGl0IFwic2VsZWN0IGN1cnJlbnQtd29yZCBhbmQgdHJhaWxpbmcgd2hpdGUgc3BhY2VcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGEgdycsXG4gICAgICAgICAgdGV4dDogXCIxMjM0NSBBQkNERVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJhYmNkZSBcIlxuXG4gICAgICBpdCBcInNlbGVjdCBjdXJyZW50LXdvcmQgYW5kIGxlYWRpbmcgd2hpdGUgc3BhY2UgaW4gY2FzZSB0cmFpbGluZyB3aGl0ZSBzcGFjZSB3YXNuJ3QgdGhlcmVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDE1XVxuICAgICAgICBlbnN1cmUgJ2QgYSB3JyxcbiAgICAgICAgICB0ZXh0OiBcIjEyMzQ1IGFiY2RlXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAxMF1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIgQUJDREVcIlxuXG4gICAgICBpdCBcInNlbGVjdHMgZnJvbSB0aGUgc3RhcnQgb2YgdGhlIGN1cnJlbnQgd29yZCB0byB0aGUgc3RhcnQgb2YgdGhlIG5leHQgd29yZCBpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YgYSB3Jywgc2VsZWN0ZWRTY3JlZW5SYW5nZTogW1swLCA2XSwgWzAsIDEyXV1cblxuICAgICAgaXQgXCJkb2Vzbid0IHNwYW4gbmV3bGluZXNcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMTIzNDVcXG5hYmNkZSBBQkNERVwiLCBjdXJzb3I6IFswLCAzXVxuICAgICAgICBlbnN1cmUgJ3YgYSB3Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1swLCAwXSwgWzAsIDVdXVxuXG4gICAgICBpdCBcImRvZXNuJ3Qgc3BhbiBzcGVjaWFsIGNoYXJhY3RlcnNcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMSgzNDVcXG5hYmNkZSBBQkNERVwiLCBjdXJzb3I6IFswLCAzXVxuICAgICAgICBlbnN1cmUgJ3YgYSB3Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1swLCAyXSwgWzAsIDVdXVxuXG4gIGRlc2NyaWJlIFwiV2hvbGVXb3JkXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJpbm5lci13aG9sZS13b3JkXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyKDQ1IGFiJ2RlIEFCQ0RFXCIsIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgaW5zaWRlIHRoZSBjdXJyZW50IHdob2xlIHdvcmQgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBpIFcnLCB0ZXh0OiBcIjEyKDQ1ICBBQkNERVwiLCBjdXJzb3I6IFswLCA2XSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiYWInZGVcIlxuXG4gICAgICBpdCBcInNlbGVjdHMgaW5zaWRlIHRoZSBjdXJyZW50IHdob2xlIHdvcmQgaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2IGkgVycsIHNlbGVjdGVkU2NyZWVuUmFuZ2U6IFtbMCwgNl0sIFswLCAxMV1dXG4gICAgZGVzY3JpYmUgXCJhLXdob2xlLXdvcmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMTIoNDUgYWInZGUgQUJDREVcIiwgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgaXQgXCJzZWxlY3Qgd2hvbGUtd29yZCBhbmQgdHJhaWxpbmcgd2hpdGUgc3BhY2VcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGEgVycsXG4gICAgICAgICAgdGV4dDogXCIxMig0NSBBQkNERVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJhYidkZSBcIlxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGl0IFwic2VsZWN0IHdob2xlLXdvcmQgYW5kIGxlYWRpbmcgd2hpdGUgc3BhY2UgaW4gY2FzZSB0cmFpbGluZyB3aGl0ZSBzcGFjZSB3YXNuJ3QgdGhlcmVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDE1XVxuICAgICAgICBlbnN1cmUgJ2QgYSB3JyxcbiAgICAgICAgICB0ZXh0OiBcIjEyKDQ1IGFiJ2RlXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAxMF1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIgQUJDREVcIlxuXG4gICAgICBpdCBcInNlbGVjdHMgZnJvbSB0aGUgc3RhcnQgb2YgdGhlIGN1cnJlbnQgd2hvbGUgd29yZCB0byB0aGUgc3RhcnQgb2YgdGhlIG5leHQgd2hvbGUgd29yZCBpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YgYSBXJywgc2VsZWN0ZWRTY3JlZW5SYW5nZTogW1swLCA2XSwgWzAsIDEyXV1cblxuICAgICAgaXQgXCJkb2Vzbid0IHNwYW4gbmV3bGluZXNcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMTIoNDVcXG5hYidkZSBBQkNERVwiLCBjdXJzb3I6IFswLCA0XVxuICAgICAgICBlbnN1cmUgJ3YgYSBXJywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1swLCAwXSwgWzAsIDVdXVxuXG4gIGRlc2NyaWJlIFwiU3Vid29yZFwiLCAtPlxuICAgIGVzY2FwZSA9IC0+IGtleXN0cm9rZSgnZXNjYXBlJylcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm9wZXJhdG9yLXBlbmRpbmctbW9kZSwgYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLnZpc3VhbC1tb2RlJzpcbiAgICAgICAgICAnYSBxJzogJ3ZpbS1tb2RlLXBsdXM6YS1zdWJ3b3JkJ1xuICAgICAgICAgICdpIHEnOiAndmltLW1vZGUtcGx1czppbm5lci1zdWJ3b3JkJ1xuXG4gICAgZGVzY3JpYmUgXCJpbm5lci1zdWJ3b3JkXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBzdWJ3b3JkXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0QzogXCJjYW18ZWxDYXNlXCI7IGVuc3VyZSBcInYgaSBxXCIsIHNlbGVjdGVkVGV4dDogXCJjYW1lbFwiOyBlc2NhcGUoKVxuICAgICAgICBzZXQgdGV4dEM6IFwiY2FtZXxsQ2FzZVwiOyBlbnN1cmUgXCJ2IGkgcVwiLCBzZWxlY3RlZFRleHQ6IFwiY2FtZWxcIjsgZXNjYXBlKClcbiAgICAgICAgc2V0IHRleHRDOiBcImNhbWVsfENhc2VcIjsgZW5zdXJlIFwidiBpIHFcIiwgc2VsZWN0ZWRUZXh0OiBcIkNhc2VcIjsgZXNjYXBlKClcbiAgICAgICAgc2V0IHRleHRDOiBcImNhbWVsQ2FzfGVcIjsgZW5zdXJlIFwidiBpIHFcIiwgc2VsZWN0ZWRUZXh0OiBcIkNhc2VcIjsgZXNjYXBlKClcblxuICAgICAgICBzZXQgdGV4dEM6IFwifF9zbmFrZV9fY2FzZV9cIjsgZW5zdXJlIFwidiBpIHFcIiwgc2VsZWN0ZWRUZXh0OiBcIl9zbmFrZVwiOyBlc2NhcGUoKVxuICAgICAgICBzZXQgdGV4dEM6IFwiX3NuYWt8ZV9fY2FzZV9cIjsgZW5zdXJlIFwidiBpIHFcIiwgc2VsZWN0ZWRUZXh0OiBcIl9zbmFrZVwiOyBlc2NhcGUoKVxuICAgICAgICBzZXQgdGV4dEM6IFwiX3NuYWtlfF9fY2FzZV9cIjsgZW5zdXJlIFwidiBpIHFcIiwgc2VsZWN0ZWRUZXh0OiBcIl9fY2FzZVwiOyBlc2NhcGUoKVxuICAgICAgICBzZXQgdGV4dEM6IFwiX3NuYWtlX3xfY2FzZV9cIjsgZW5zdXJlIFwidiBpIHFcIiwgc2VsZWN0ZWRUZXh0OiBcIl9fY2FzZVwiOyBlc2NhcGUoKVxuICAgICAgICBzZXQgdGV4dEM6IFwiX3NuYWtlX19jYXN8ZV9cIjsgZW5zdXJlIFwidiBpIHFcIiwgc2VsZWN0ZWRUZXh0OiBcIl9fY2FzZVwiOyBlc2NhcGUoKVxuICAgICAgICBzZXQgdGV4dEM6IFwiX3NuYWtlX19jYXNlfF9cIjsgZW5zdXJlIFwidiBpIHFcIiwgc2VsZWN0ZWRUZXh0OiBcIl9cIjsgZXNjYXBlKClcblxuICAgIGRlc2NyaWJlIFwiYS1zdWJ3b3JkXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBzdWJ3b3JkIGFuZCBzcGFjZXNcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcImNhbWVsQ2F8c2UgIE5leHRDYW1lbFwiOyBlbnN1cmUgXCJ2IGEgcVwiLCBzZWxlY3RlZFRleHQ6IFwiQ2FzZSAgXCI7IGVzY2FwZSgpXG4gICAgICAgIHNldCB0ZXh0QzogXCJjYW1lbENhc2UgIE5lfHh0Q2FtZWxcIjsgZW5zdXJlIFwidiBhIHFcIiwgc2VsZWN0ZWRUZXh0OiBcIiAgTmV4dFwiOyBlc2NhcGUoKVxuICAgICAgICBzZXQgdGV4dEM6IFwic25ha2VfY3xhc2UgIG5leHRfc25ha2VcIjsgZW5zdXJlIFwidiBhIHFcIiwgc2VsZWN0ZWRUZXh0OiBcIl9jYXNlICBcIjsgZXNjYXBlKClcbiAgICAgICAgc2V0IHRleHRDOiBcInNuYWtlX2Nhc2UgIG5lfHh0X3NuYWtlXCI7IGVuc3VyZSBcInYgYSBxXCIsIHNlbGVjdGVkVGV4dDogXCIgIG5leHRcIjsgZXNjYXBlKClcblxuICBkZXNjcmliZSBcIkFueVBhaXJcIiwgLT5cbiAgICB7c2ltcGxlVGV4dCwgY29tcGxleFRleHR9ID0ge31cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzaW1wbGVUZXh0ID0gXCJcIlwiXG4gICAgICAgIC4uLi4gXCJhYmNcIiAuLi4uXG4gICAgICAgIC4uLi4gJ2FiYycgLi4uLlxuICAgICAgICAuLi4uIGBhYmNgIC4uLi5cbiAgICAgICAgLi4uLiB7YWJjfSAuLi4uXG4gICAgICAgIC4uLi4gPGFiYz4gLi4uLlxuICAgICAgICAuLi4uIFthYmNdIC4uLi5cbiAgICAgICAgLi4uLiAoYWJjKSAuLi4uXG4gICAgICAgIFwiXCJcIlxuICAgICAgY29tcGxleFRleHQgPSBcIlwiXCJcbiAgICAgICAgWzRzXG4gICAgICAgIC0tezNzXG4gICAgICAgIC0tLS1cIjJzKDFzLTFlKTJlXCJcbiAgICAgICAgLS0tM2V9LTRlXG4gICAgICAgIF1cbiAgICAgICAgXCJcIlwiXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogc2ltcGxlVGV4dFxuICAgICAgICBjdXJzb3I6IFswLCA3XVxuICAgIGRlc2NyaWJlIFwiaW5uZXItYW55LXBhaXJcIiwgLT5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgYW55IGlubmVyLXBhaXIgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGkgcycsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAuLi4uIFwiXCIgLi4uLlxuICAgICAgICAgICAgLi4uLiAnYWJjJyAuLi4uXG4gICAgICAgICAgICAuLi4uIGBhYmNgIC4uLi5cbiAgICAgICAgICAgIC4uLi4ge2FiY30gLi4uLlxuICAgICAgICAgICAgLi4uLiA8YWJjPiAuLi4uXG4gICAgICAgICAgICAuLi4uIFthYmNdIC4uLi5cbiAgICAgICAgICAgIC4uLi4gKGFiYykgLi4uLlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnaiAuIGogLiBqIC4gaiAuIGogLiBqIC4gaiAuJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIC4uLi4gXCJcIiAuLi4uXG4gICAgICAgICAgICAuLi4uICcnIC4uLi5cbiAgICAgICAgICAgIC4uLi4gYGAgLi4uLlxuICAgICAgICAgICAgLi4uLiB7fSAuLi4uXG4gICAgICAgICAgICAuLi4uIDw+IC4uLi5cbiAgICAgICAgICAgIC4uLi4gW10gLi4uLlxuICAgICAgICAgICAgLi4uLiAoKSAuLi4uXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiY2FuIGV4cGFuZCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IGNvbXBsZXhUZXh0LCBjdXJzb3I6IFsyLCA4XVxuICAgICAgICBrZXlzdHJva2UgJ3YnXG4gICAgICAgIGVuc3VyZSAnaSBzJywgc2VsZWN0ZWRUZXh0OiBcIlwiXCIxcy0xZVwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2kgcycsIHNlbGVjdGVkVGV4dDogXCJcIlwiMnMoMXMtMWUpMmVcIlwiXCJcbiAgICAgICAgZW5zdXJlICdpIHMnLCBzZWxlY3RlZFRleHQ6IFwiXCJcIjNzXFxuLS0tLVwiMnMoMXMtMWUpMmVcIlxcbi0tLTNlXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnaSBzJywgc2VsZWN0ZWRUZXh0OiBcIlwiXCI0c1xcbi0tezNzXFxuLS0tLVwiMnMoMXMtMWUpMmVcIlxcbi0tLTNlfS00ZVwiXCJcIlxuICAgIGRlc2NyaWJlIFwiYS1hbnktcGFpclwiLCAtPlxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBhbnkgYS1wYWlyIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBhIHMnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgLi4uLiAgLi4uLlxuICAgICAgICAgICAgLi4uLiAnYWJjJyAuLi4uXG4gICAgICAgICAgICAuLi4uIGBhYmNgIC4uLi5cbiAgICAgICAgICAgIC4uLi4ge2FiY30gLi4uLlxuICAgICAgICAgICAgLi4uLiA8YWJjPiAuLi4uXG4gICAgICAgICAgICAuLi4uIFthYmNdIC4uLi5cbiAgICAgICAgICAgIC4uLi4gKGFiYykgLi4uLlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnaiAuIGogLiBqIC4gaiAuIGogLiBqIC4gaiAuJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIC4uLi4gIC4uLi5cbiAgICAgICAgICAgIC4uLi4gIC4uLi5cbiAgICAgICAgICAgIC4uLi4gIC4uLi5cbiAgICAgICAgICAgIC4uLi4gIC4uLi5cbiAgICAgICAgICAgIC4uLi4gIC4uLi5cbiAgICAgICAgICAgIC4uLi4gIC4uLi5cbiAgICAgICAgICAgIC4uLi4gIC4uLi5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJjYW4gZXhwYW5kIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogY29tcGxleFRleHQsIGN1cnNvcjogWzIsIDhdXG4gICAgICAgIGtleXN0cm9rZSAndidcbiAgICAgICAgZW5zdXJlICdhIHMnLCBzZWxlY3RlZFRleHQ6IFwiXCJcIigxcy0xZSlcIlwiXCJcbiAgICAgICAgZW5zdXJlICdhIHMnLCBzZWxlY3RlZFRleHQ6IFwiXCJcIlxcXCIycygxcy0xZSkyZVxcXCJcIlwiXCJcbiAgICAgICAgZW5zdXJlICdhIHMnLCBzZWxlY3RlZFRleHQ6IFwiXCJcInszc1xcbi0tLS1cIjJzKDFzLTFlKTJlXCJcXG4tLS0zZX1cIlwiXCJcbiAgICAgICAgZW5zdXJlICdhIHMnLCBzZWxlY3RlZFRleHQ6IFwiXCJcIls0c1xcbi0tezNzXFxuLS0tLVwiMnMoMXMtMWUpMmVcIlxcbi0tLTNlfS00ZVxcbl1cIlwiXCJcblxuICBkZXNjcmliZSBcIkFueVF1b3RlXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAtLVwiYWJjXCIgYGRlZmAgICdlZmcnLS1cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgZGVzY3JpYmUgXCJpbm5lci1hbnktcXVvdGVcIiwgLT5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgYW55IGlubmVyLXBhaXIgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGkgcScsIHRleHQ6IFwiXCJcIi0tXCJcIiBgZGVmYCAgJ2VmZyctLVwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIlwiXCItLVwiXCIgYGAgICdlZmcnLS1cIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJywgdGV4dDogXCJcIlwiLS1cIlwiIGBgICAnJy0tXCJcIlwiXG4gICAgICBpdCBcImNhbiBzZWxlY3QgbmV4dCBxdW90ZVwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ3YnXG4gICAgICAgIGVuc3VyZSAnaSBxJywgc2VsZWN0ZWRUZXh0OiAnYWJjJ1xuICAgICAgICBlbnN1cmUgJ2kgcScsIHNlbGVjdGVkVGV4dDogJ2RlZidcbiAgICAgICAgZW5zdXJlICdpIHEnLCBzZWxlY3RlZFRleHQ6ICdlZmcnXG4gICAgZGVzY3JpYmUgXCJhLWFueS1xdW90ZVwiLCAtPlxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBhbnkgYS1xdW90ZSBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgYSBxJywgdGV4dDogXCJcIlwiLS0gYGRlZmAgICdlZmcnLS1cIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyAgLCB0ZXh0OiBcIlwiXCItLSAgICdlZmcnLS1cIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyAgLCB0ZXh0OiBcIlwiXCItLSAgIC0tXCJcIlwiXG4gICAgICBpdCBcImNhbiBzZWxlY3QgbmV4dCBxdW90ZVwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ3YnXG4gICAgICAgIGVuc3VyZSAnYSBxJywgc2VsZWN0ZWRUZXh0OiAnXCJhYmNcIidcbiAgICAgICAgZW5zdXJlICdhIHEnLCBzZWxlY3RlZFRleHQ6ICdgZGVmYCdcbiAgICAgICAgZW5zdXJlICdhIHEnLCBzZWxlY3RlZFRleHQ6IFwiJ2VmZydcIlxuXG4gIGRlc2NyaWJlIFwiRG91YmxlUXVvdGVcIiwgLT5cbiAgICBkZXNjcmliZSBcImlzc3VlLTYzNSBuZXcgYmVoYXZpb3Igb2YgaW5uZXItZG91YmxlLXF1b3RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgICAnZyByJzogJ3ZpbS1tb2RlLXBsdXM6cmVwbGFjZSdcblxuICAgICAgZGVzY3JpYmUgXCJxdW90ZSBpcyB1bi1iYWxhbmNlZFwiLCAtPlxuICAgICAgICBpdCBcImNhc2UxXCIsIC0+XG4gICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0Q186ICdffF9cIl9fX19cIl9fX19cIidcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpIFwiICsnLCB0ZXh0Q186ICdfX1wifCsrKytcIl9fX19cIidcbiAgICAgICAgaXQgXCJjYXNlMlwiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgdGV4dENfOiAnX19cIl9ffF9fXCJfX19fXCInXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSBcIiArJywgdGV4dENfOiAnX19cInwrKysrXCJfX19fXCInXG4gICAgICAgIGl0IFwiY2FzZTNcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgIHRleHRDXzogJ19fXCJfX19fXCJfX3xfX1wiJ1xuICAgICAgICAgIGVuc3VyZSAnZyByIGkgXCIgKycsIHRleHRDXzogJ19fXCJfX19fXCJ8KysrK1wiJ1xuICAgICAgICBpdCBcImNhc2U0XCIsIC0+XG4gICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0Q186ICdfX3xcIl9fX19cIl9fX19cIidcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpIFwiICsnLCB0ZXh0Q186ICdfX1wifCsrKytcIl9fX19cIidcbiAgICAgICAgaXQgXCJjYXNlNVwiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgdGV4dENfOiAnX19cIl9fX198XCJfX19fXCInXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSBcIiArJywgdGV4dENfOiAnX19cInwrKysrXCJfX19fXCInXG4gICAgICAgIGl0IFwiY2FzZTZcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgIHRleHRDXzogJ19fXCJfX19fXCJfX19ffFwiJ1xuICAgICAgICAgIGVuc3VyZSAnZyByIGkgXCIgKycsIHRleHRDXzogJ19fXCJfX19fXCJ8KysrK1wiJ1xuXG4gICAgICBkZXNjcmliZSBcInF1b3RlIGlzIGJhbGFuY2VkXCIsIC0+XG4gICAgICAgIGl0IFwiY2FzZTFcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgIHRleHRDXzogJ198X1wiPT09PVwiX19fX1wiPT09XCInXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSBcIiArJywgdGV4dENfOiAnX19cInwrKysrXCJfX19fXCI9PT1cIidcbiAgICAgICAgaXQgXCJjYXNlMlwiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgdGV4dENfOiAnX19cIj09fD09XCJfX19fXCI9PT1cIidcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpIFwiICsnLCB0ZXh0Q186ICdfX1wifCsrKytcIl9fX19cIj09PVwiJ1xuICAgICAgICBpdCBcImNhc2UzXCIsIC0+XG4gICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0Q186ICdfX1wiPT09PVwiX198X19cIj09PVwiJ1xuICAgICAgICAgIGVuc3VyZSAnZyByIGkgXCIgKycsIHRleHRDXzogJ19fXCI9PT09XCJ8KysrK1wiPT09XCInXG4gICAgICAgIGl0IFwiY2FzZTRcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgIHRleHRDXzogJ19fXCI9PT09XCJfX19fXCI9fD09XCInXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSBcIiArJywgdGV4dENfOiAnX19cIj09PT1cIl9fX19cInwrKytcIidcbiAgICAgICAgaXQgXCJjYXNlNVwiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgdGV4dENfOiAnX198XCI9PT09XCJfX19fXCI9PT1cIidcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpIFwiICsnLCB0ZXh0Q186ICdfX1wifCsrKytcIl9fX19cIj09PVwiJ1xuICAgICAgICBpdCBcImNhc2U2XCIsIC0+XG4gICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0Q186ICdfX1wiPT09PXxcIl9fX19cIj09PVwiJ1xuICAgICAgICAgIGVuc3VyZSAnZyByIGkgXCIgKycsIHRleHRDXzogJ19fXCJ8KysrK1wiX19fX1wiPT09XCInXG4gICAgICAgIGl0IFwiY2FzZTdcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgIHRleHRDXzogJ19fXCI9PT09XCJfX19ffFwiPT09XCInXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSBcIiArJywgdGV4dENfOiAnX19cIj09PT1cIl9fX19cInwrKytcIidcblxuICAgIGRlc2NyaWJlIFwiaW5uZXItZG91YmxlLXF1b3RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6ICdcIiBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gXCJoZXJlXCIgXCIgYW5kIG92ZXIgaGVyZSdcbiAgICAgICAgICBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGluc2lkZSB0aGUgY3VycmVudCBzdHJpbmcgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBpIFwiJyxcbiAgICAgICAgICB0ZXh0OiAnXCJcImhlcmVcIiBcIiBhbmQgb3ZlciBoZXJlJ1xuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgaW5zaWRlIHRoZSBjdXJyZW50IHN0cmluZyBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDI5XVxuICAgICAgICBlbnN1cmUgJ2QgaSBcIicsXG4gICAgICAgICAgdGV4dDogJ1wiIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiBcIlwiIFwiIGFuZCBvdmVyIGhlcmUnXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMjhdXG5cbiAgICAgIGl0IFwibWFrZXMgbm8gY2hhbmdlIGlmIHBhc3QgdGhlIGxhc3Qgc3RyaW5nIG9uIGEgbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMzldXG4gICAgICAgIGVuc3VyZSAnZCBpIFwiJyxcbiAgICAgICAgICB0ZXh0OiAnXCIgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluIFwiaGVyZVwiIFwiIGFuZCBvdmVyIGhlcmUnXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMzldXG5cbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIHRoZSBwYWlyIGNoYXJcIiwgLT5cbiAgICAgICAgY2hlY2sgPSBnZXRDaGVja0Z1bmN0aW9uRm9yKCdpIFwiJylcbiAgICAgICAgdGV4dCA9ICctXCIrXCItJ1xuICAgICAgICB0ZXh0RmluYWwgPSAnLVwiXCItJ1xuICAgICAgICBzZWxlY3RlZFRleHQgPSAnKydcbiAgICAgICAgb3BlbiA9IFswLCAxXVxuICAgICAgICBjbG9zZSA9IFswLCAzXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHt0ZXh0fVxuICAgICAgICBpdCBcImNhc2UtMSBub3JtYWxcIiwgLT4gY2hlY2sgb3BlbiwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0IFwiY2FzZS0yIG5vcm1hbFwiLCAtPiBjaGVjayBjbG9zZSwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0IFwiY2FzZS0zIHZpc3VhbFwiLCAtPiBjaGVjayBvcGVuLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiY2FzZS00IHZpc3VhbFwiLCAtPiBjaGVjayBjbG9zZSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgIGRlc2NyaWJlIFwiYS1kb3VibGUtcXVvdGVcIiwgLT5cbiAgICAgIG9yaWdpbmFsVGV4dCA9ICdcIiBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gXCJoZXJlXCIgXCInXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHQsIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgYXJvdW5kIHRoZSBjdXJyZW50IGRvdWJsZSBxdW90ZXMgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBhIFwiJyxcbiAgICAgICAgICB0ZXh0OiAnaGVyZVwiIFwiJ1xuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgaXQgXCJkZWxldGUgYS1kb3VibGUtcXVvdGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDI5XVxuICAgICAgICBlbnN1cmUgJ2QgYSBcIicsXG4gICAgICAgICAgdGV4dDogJ1wiIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiAgXCInXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMjddXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIHRoZSBwYWlyIGNoYXJcIiwgLT5cbiAgICAgICAgY2hlY2sgPSBnZXRDaGVja0Z1bmN0aW9uRm9yKCdhIFwiJylcbiAgICAgICAgdGV4dCA9ICctXCIrXCItJ1xuICAgICAgICB0ZXh0RmluYWwgPSAnLS0nXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9ICdcIitcIidcbiAgICAgICAgb3BlbiA9IFswLCAxXVxuICAgICAgICBjbG9zZSA9IFswLCAzXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHt0ZXh0fVxuICAgICAgICBpdCBcImNhc2UtMSBub3JtYWxcIiwgLT4gY2hlY2sgb3BlbiwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiY2FzZS0yIG5vcm1hbFwiLCAtPiBjaGVjayBjbG9zZSwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiY2FzZS0zIHZpc3VhbFwiLCAtPiBjaGVjayBvcGVuLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiY2FzZS00IHZpc3VhbFwiLCAtPiBjaGVjayBjbG9zZSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICBkZXNjcmliZSBcIlNpbmdsZVF1b3RlXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJpbm5lci1zaW5nbGUtcXVvdGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCInIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiAnaGVyZScgJyBhbmQgb3ZlciBoZXJlXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBkZXNjcmliZSBcImRvbid0IHRyZWF0IGxpdGVyYWwgYmFja3NsYXNoKGRvdWJsZSBiYWNrc2xhc2gpIGFzIGVzY2FwZSBjaGFyXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiJ3NvbWUta2V5LWhlcmVcXFxcXFxcXCc6ICdoZXJlLWlzLXRoZS12YWwnXCJcbiAgICAgICAgaXQgXCJjYXNlLTFcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgICBlbnN1cmUgXCJkIGkgJ1wiLFxuICAgICAgICAgICAgdGV4dDogXCInJzogJ2hlcmUtaXMtdGhlLXZhbCdcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgICBpdCBcImNhc2UtMlwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAxOV1cbiAgICAgICAgICBlbnN1cmUgXCJkIGkgJ1wiLFxuICAgICAgICAgICAgdGV4dDogXCInc29tZS1rZXktaGVyZVxcXFxcXFxcJzogJydcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMjBdXG5cbiAgICAgIGRlc2NyaWJlIFwidHJlYXQgYmFja3NsYXNoKHNpbmdsZSBiYWNrc2xhc2gpIGFzIGVzY2FwZSBjaGFyXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiJ3NvbWUta2V5LWhlcmVcXFxcJyc6ICdoZXJlLWlzLXRoZS12YWwnXCJcblxuICAgICAgICBpdCBcImNhc2UtMVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgICAgIGVuc3VyZSBcImQgaSAnXCIsXG4gICAgICAgICAgICB0ZXh0OiBcIicnOiAnaGVyZS1pcy10aGUtdmFsJ1wiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcImNhc2UtMlwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAxN11cbiAgICAgICAgICBlbnN1cmUgXCJkIGkgJ1wiLFxuICAgICAgICAgICAgdGV4dDogXCInc29tZS1rZXktaGVyZVxcXFwnJydoZXJlLWlzLXRoZS12YWwnXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDE3XVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGluc2lkZSB0aGUgY3VycmVudCBzdHJpbmcgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImQgaSAnXCIsXG4gICAgICAgICAgdGV4dDogXCInJ2hlcmUnICcgYW5kIG92ZXIgaGVyZVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgIyBbTk9URV1cbiAgICAgICMgSSBkb24ndCBsaWtlIG9yaWdpbmFsIGJlaGF2aW9yLCB0aGlzIGlzIGNvdW50ZXIgaW50dWl0aXZlLlxuICAgICAgIyBTaW1wbHkgc2VsZWN0aW5nIGFyZWEgYmV0d2VlbiBxdW90ZSBpcyB0aGF0IG5vcm1hbCB1c2VyIGV4cGVjdHMuXG4gICAgICAjIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgaW5zaWRlIHRoZSBuZXh0IHN0cmluZyBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGUgKGlmIG5vdCBpbiBhIHN0cmluZylcIiwgLT5cbiAgICAgICMgPT4gUmV2ZXJ0ZWQgdG8gb3JpZ2luYWwgYmVoYXZpb3IsIGJ1dCBuZWVkIGNhcmVmdWwgY29uc2lkZXJhdGlvbiB3aGF0IGlzIGJlc3QuXG5cbiAgICAgICMgaXQgXCJbQ2hhbmdlZCBiZWhhdmlvcl0gYXBwbGllcyBvcGVyYXRvcnMgaW5zaWRlIGFyZWEgYmV0d2VlbiBxdW90ZVwiLCAtPlxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBpbnNpZGUgdGhlIG5leHQgc3RyaW5nIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZSAoaWYgbm90IGluIGEgc3RyaW5nKVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMjZdXG4gICAgICAgIGVuc3VyZSBcImQgaSAnXCIsXG4gICAgICAgICAgdGV4dDogXCInJ2hlcmUnICcgYW5kIG92ZXIgaGVyZVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgaXQgXCJtYWtlcyBubyBjaGFuZ2UgaWYgcGFzdCB0aGUgbGFzdCBzdHJpbmcgb24gYSBsaW5lXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAzOV1cbiAgICAgICAgZW5zdXJlIFwiZCBpICdcIixcbiAgICAgICAgICB0ZXh0OiBcIicgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluICdoZXJlJyAnIGFuZCBvdmVyIGhlcmVcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDM5XVxuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gdGhlIHBhaXIgY2hhclwiLCAtPlxuICAgICAgICBjaGVjayA9IGdldENoZWNrRnVuY3Rpb25Gb3IoXCJpICdcIilcbiAgICAgICAgdGV4dCA9IFwiLScrJy1cIlxuICAgICAgICB0ZXh0RmluYWwgPSBcIi0nJy1cIlxuICAgICAgICBzZWxlY3RlZFRleHQgPSAnKydcbiAgICAgICAgb3BlbiA9IFswLCAxXVxuICAgICAgICBjbG9zZSA9IFswLCAzXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHt0ZXh0fVxuICAgICAgICBpdCBcImNhc2UtMSBub3JtYWxcIiwgLT4gY2hlY2sgb3BlbiwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0IFwiY2FzZS0yIG5vcm1hbFwiLCAtPiBjaGVjayBjbG9zZSwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0IFwiY2FzZS0zIHZpc3VhbFwiLCAtPiBjaGVjayBvcGVuLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiY2FzZS00IHZpc3VhbFwiLCAtPiBjaGVjayBjbG9zZSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgIGRlc2NyaWJlIFwiYS1zaW5nbGUtcXVvdGVcIiwgLT5cbiAgICAgIG9yaWdpbmFsVGV4dCA9IFwiJyBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gJ2hlcmUnICdcIlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogb3JpZ2luYWxUZXh0LCBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGFyb3VuZCB0aGUgY3VycmVudCBzaW5nbGUgcXVvdGVzIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJkIGEgJ1wiLFxuICAgICAgICAgIHRleHQ6IFwiaGVyZScgJ1wiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGluc2lkZSB0aGUgbmV4dCBzdHJpbmcgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlIChpZiBub3QgaW4gYSBzdHJpbmcpXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyOV1cbiAgICAgICAgZW5zdXJlIFwiZCBhICdcIixcbiAgICAgICAgICB0ZXh0OiBcIicgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluICAnXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAyN11cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gdGhlIHBhaXIgY2hhclwiLCAtPlxuICAgICAgICBjaGVjayA9IGdldENoZWNrRnVuY3Rpb25Gb3IoXCJhICdcIilcbiAgICAgICAgdGV4dCA9IFwiLScrJy1cIlxuICAgICAgICB0ZXh0RmluYWwgPSBcIi0tXCJcbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gXCInKydcIlxuICAgICAgICBvcGVuID0gWzAsIDFdXG4gICAgICAgIGNsb3NlID0gWzAsIDNdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQge3RleHR9XG4gICAgICAgIGl0IFwiY2FzZS0xIG5vcm1hbFwiLCAtPiBjaGVjayBvcGVuLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJjYXNlLTIgbm9ybWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJjYXNlLTMgdmlzdWFsXCIsIC0+IGNoZWNrIG9wZW4sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTQgdmlzdWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAndicsIHtzZWxlY3RlZFRleHR9XG4gIGRlc2NyaWJlIFwiQmFja1RpY2tcIiwgLT5cbiAgICBvcmlnaW5hbFRleHQgPSBcInRoaXMgaXMgYHNhbXBsZWAgdGV4dC5cIlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHQsIGN1cnNvcjogWzAsIDldXG5cbiAgICBkZXNjcmliZSBcImlubmVyLWJhY2stdGlja1wiLCAtPlxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBpbm5lci1hcmVhXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImQgaSBgXCIsIHRleHQ6IFwidGhpcyBpcyBgYCB0ZXh0LlwiLCBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBpdCBcImRvIG5vdGhpbmcgd2hlbiBwYWlyIHJhbmdlIGlzIG5vdCB1bmRlciBjdXJzb3JcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDE2XVxuICAgICAgICBlbnN1cmUgXCJkIGkgYFwiLCB0ZXh0OiBvcmlnaW5hbFRleHQsIGN1cnNvcjogWzAsIDE2XVxuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gdGhlIHBhaXIgY2hhclwiLCAtPlxuICAgICAgICBjaGVjayA9IGdldENoZWNrRnVuY3Rpb25Gb3IoJ2kgYCcpXG4gICAgICAgIHRleHQgPSAnLWArYC0nXG4gICAgICAgIHRleHRGaW5hbCA9ICctYGAtJ1xuICAgICAgICBzZWxlY3RlZFRleHQgPSAnKydcbiAgICAgICAgb3BlbiA9IFswLCAxXVxuICAgICAgICBjbG9zZSA9IFswLCAzXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHt0ZXh0fVxuICAgICAgICBpdCBcImNhc2UtMSBub3JtYWxcIiwgLT4gY2hlY2sgb3BlbiwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0IFwiY2FzZS0yIG5vcm1hbFwiLCAtPiBjaGVjayBjbG9zZSwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0IFwiY2FzZS0zIHZpc3VhbFwiLCAtPiBjaGVjayBvcGVuLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiY2FzZS00IHZpc3VhbFwiLCAtPiBjaGVjayBjbG9zZSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgIGRlc2NyaWJlIFwiYS1iYWNrLXRpY2tcIiwgLT5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgaW5uZXItYXJlYVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJkIGEgYFwiLCB0ZXh0OiBcInRoaXMgaXMgIHRleHQuXCIsIGN1cnNvcjogWzAsIDhdXG5cbiAgICAgIGl0IFwiZG8gbm90aGluZyB3aGVuIHBhaXIgcmFuZ2UgaXMgbm90IHVuZGVyIGN1cnNvclwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTZdXG4gICAgICAgIGVuc3VyZSBcImQgYSBgXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgY3Vyc29yOiBbMCwgMTZdXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiB0aGUgcGFpciBjaGFyXCIsIC0+XG4gICAgICAgIGNoZWNrID0gZ2V0Q2hlY2tGdW5jdGlvbkZvcihcImEgYFwiKVxuICAgICAgICB0ZXh0ID0gXCItYCtgLVwiXG4gICAgICAgIHRleHRGaW5hbCA9IFwiLS1cIlxuICAgICAgICBzZWxlY3RlZFRleHQgPSBcImArYFwiXG4gICAgICAgIG9wZW4gPSBbMCwgMV1cbiAgICAgICAgY2xvc2UgPSBbMCwgM11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB7dGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTEgbm9ybWFsXCIsIC0+IGNoZWNrIG9wZW4sICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcImNhc2UtMiBub3JtYWxcIiwgLT4gY2hlY2sgY2xvc2UsICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcImNhc2UtMyB2aXN1YWxcIiwgLT4gY2hlY2sgb3BlbiwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcImNhc2UtNCB2aXN1YWxcIiwgLT4gY2hlY2sgY2xvc2UsICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgZGVzY3JpYmUgXCJDdXJseUJyYWNrZXRcIiwgLT5cbiAgICBkZXNjcmliZSBcInNjb3BlIGF3YXJlbmVzcyBvZiBicmFja2V0XCIsIC0+XG4gICAgICBpdCBcIltzZWFyY2ggZnJvbSBvdXRzaWRlIG9mIGRvdWJsZS1xdW90ZV0gc2tpcHMgYnJhY2tldCBpbiB3aXRoaW4tbGluZS1iYWxhbmNlZC1kb3VibGUtcXVvdGVzXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB7IHwgXCJoZWxsbyB7XCIgfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgXCJ2IGEge1wiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAgeyAgXCJoZWxsbyB7XCIgfVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcIk5vdCBpZ25vcmUgYnJhY2tldCBpbiB3aXRoaW4tbGluZS1ub3QtYmFsYW5jZWQtZG91YmxlLXF1b3Rlc1wiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgeyAgXCJoZWxsbyB7XCIgfCAnXCInIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFwidiBhIHtcIixcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgIHtcIiAgJ1wiJyB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcIltzZWFyY2ggZnJvbSBpbnNpZGUgb2YgZG91YmxlLXF1b3RlXSBza2lwcyBicmFja2V0IGluIHdpdGhpbi1saW5lLWJhbGFuY2VkLWRvdWJsZS1xdW90ZXNcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHsgIFwiaHxlbGxvIHtcIiB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcInYgYSB7XCIsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICB7ICBcImhlbGxvIHtcIiB9XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcblxuICAgICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlIFwiaW5uZXItY3VybHktYnJhY2tldFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcInsgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluIHtoZXJlfSB9XCJcbiAgICAgICAgICBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIHRvIGlubmVyLWFyZWEgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBpIHsnLFxuICAgICAgICAgIHRleHQ6IFwie31cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgdG8gaW5uZXItYXJlYSBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGUgKHNlY29uZCB0ZXN0KVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICBjdXJzb3I6IFswLCAyOV1cbiAgICAgICAgZW5zdXJlICdkIGkgeycsXG4gICAgICAgICAgdGV4dDogXCJ7IHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiB7fSB9XCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAyOF1cblxuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gdGhlIHBhaXIgY2hhclwiLCAtPlxuICAgICAgICBjaGVjayA9IGdldENoZWNrRnVuY3Rpb25Gb3IoJ2kgeycpXG4gICAgICAgIHRleHQgPSAnLXsrfS0nXG4gICAgICAgIHRleHRGaW5hbCA9ICcte30tJ1xuICAgICAgICBzZWxlY3RlZFRleHQgPSAnKydcbiAgICAgICAgb3BlbiA9IFswLCAxXVxuICAgICAgICBjbG9zZSA9IFswLCAzXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHt0ZXh0fVxuICAgICAgICBpdCBcImNhc2UtMSBub3JtYWxcIiwgLT4gY2hlY2sgb3BlbiwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0IFwiY2FzZS0yIG5vcm1hbFwiLCAtPiBjaGVjayBjbG9zZSwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0IFwiY2FzZS0zIHZpc3VhbFwiLCAtPiBjaGVjayBvcGVuLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiY2FzZS00IHZpc3VhbFwiLCAtPiBjaGVjayBjbG9zZSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuXG4gICAgICBkZXNjcmliZSBcImNoYW5nZSBtb2RlIHRvIGNoYXJhY3Rlcndpc2VcIiwgLT5cbiAgICAgICAgIyBGSVhNRSBsYXN0IFwiXFxuXCIgc2hvdWxkIG5vdCBiZSBzZWxlY3RlZFxuICAgICAgICB0ZXh0U2VsZWN0ZWQgPSBcIlwiXCJcbiAgICAgICAgX18xLFxuICAgICAgICBfXzIsXG4gICAgICAgIF9fM1xuICAgICAgICBcIlwiXCIucmVwbGFjZSgvXy9nLCAnICcpXG5cblxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHwxLFxuICAgICAgICAgICAgICAyLFxuICAgICAgICAgICAgICAzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICBpdCBcImZyb20gdkMsIGZpbmFsLW1vZGUgaXMgJ2NoYXJhY3Rlcndpc2UnXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd2JyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogWycxJ11cbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIGVuc3VyZSAnaSBCJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dFNlbGVjdGVkXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cblxuICAgICAgICBpdCBcImZyb20gdkwsIGZpbmFsLW1vZGUgaXMgJ2NoYXJhY3Rlcndpc2UnXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdWJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wiICAxLFxcblwiXVxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgICAgIGVuc3VyZSAnaSBCJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dFNlbGVjdGVkXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cblxuICAgICAgICBpdCBcImZyb20gdkIsIGZpbmFsLW1vZGUgaXMgJ2NoYXJhY3Rlcndpc2UnXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdjdHJsLXYnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbXCIxXCJdXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICAgIGVuc3VyZSAnaSBCJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dFNlbGVjdGVkXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cblxuICAgICAgICBkZXNjcmliZSBcImFzIG9wZXJhdG9yIHRhcmdldFwiLCAtPlxuICAgICAgICAgIGl0IFwiY2hhbmdlIGlubmVyLXBhaXJcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcImMgaSBCXCIsXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICB8XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgaXQgXCJkZWxldGUgaW5uZXItcGFpclwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlIFwiZCBpIEJcIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHx9XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgZGVzY3JpYmUgXCJhLWN1cmx5LWJyYWNrZXRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJ7IHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiB7aGVyZX0gfVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyB0byBhLWFyZWEgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBhIHsnLFxuICAgICAgICAgIHRleHQ6ICcnXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIHRvIGEtYXJlYSBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGUgKHNlY29uZCB0ZXN0KVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMjldXG4gICAgICAgIGVuc3VyZSAnZCBhIHsnLFxuICAgICAgICAgIHRleHQ6IFwieyBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gIH1cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDI3XVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiB0aGUgcGFpciBjaGFyXCIsIC0+XG4gICAgICAgIGNoZWNrID0gZ2V0Q2hlY2tGdW5jdGlvbkZvcihcImEge1wiKVxuICAgICAgICB0ZXh0ID0gXCIteyt9LVwiXG4gICAgICAgIHRleHRGaW5hbCA9IFwiLS1cIlxuICAgICAgICBzZWxlY3RlZFRleHQgPSBcInsrfVwiXG4gICAgICAgIG9wZW4gPSBbMCwgMV1cbiAgICAgICAgY2xvc2UgPSBbMCwgM11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB7dGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTEgbm9ybWFsXCIsIC0+IGNoZWNrIG9wZW4sICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcImNhc2UtMiBub3JtYWxcIiwgLT4gY2hlY2sgY2xvc2UsICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcImNhc2UtMyB2aXN1YWxcIiwgLT4gY2hlY2sgb3BlbiwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcImNhc2UtNCB2aXN1YWxcIiwgLT4gY2hlY2sgY2xvc2UsICd2Jywge3NlbGVjdGVkVGV4dH1cblxuICAgICAgZGVzY3JpYmUgXCJjaGFuZ2UgbW9kZSB0byBjaGFyYWN0ZXJ3aXNlXCIsIC0+XG4gICAgICAgIHRleHRTZWxlY3RlZCA9IFwiXCJcIlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgM1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB8MSxcbiAgICAgICAgICAgICAgMixcbiAgICAgICAgICAgICAgM1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBoZWxsb1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgaXQgXCJmcm9tIHZDLCBmaW5hbC1tb2RlIGlzICdjaGFyYWN0ZXJ3aXNlJ1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAndicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFsnMSddXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgJ2EgQicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHRTZWxlY3RlZFxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICAgICAgaXQgXCJmcm9tIHZMLCBmaW5hbC1tb2RlIGlzICdjaGFyYWN0ZXJ3aXNlJ1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnVicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFtcIiAgMSxcXG5cIl1cbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgJ2EgQicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHRTZWxlY3RlZFxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICAgICAgaXQgXCJmcm9tIHZCLCBmaW5hbC1tb2RlIGlzICdjaGFyYWN0ZXJ3aXNlJ1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnY3RybC12JyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wiMVwiXVxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgJ2EgQicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHRTZWxlY3RlZFxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICAgICAgZGVzY3JpYmUgXCJhcyBvcGVyYXRvciB0YXJnZXRcIiwgLT5cbiAgICAgICAgICBpdCBcImNoYW5nZSBpbm5lci1wYWlyXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJjIGEgQlwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIHxcblxuICAgICAgICAgICAgICBoZWxsb1xuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBpdCBcImRlbGV0ZSBpbm5lci1wYWlyXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJkIGEgQlwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIHxcblxuICAgICAgICAgICAgICBoZWxsb1xuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuXG4gIGRlc2NyaWJlIFwiQW5nbGVCcmFja2V0XCIsIC0+XG4gICAgZGVzY3JpYmUgXCJpbm5lci1hbmdsZS1icmFja2V0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiPCBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gPGhlcmU+ID5cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgaW5zaWRlIHRoZSBjdXJyZW50IHdvcmQgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBpIDwnLFxuICAgICAgICAgIHRleHQ6IFwiPD5cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgaW5zaWRlIHRoZSBjdXJyZW50IHdvcmQgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlIChzZWNvbmQgdGVzdClcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDI5XVxuICAgICAgICBlbnN1cmUgJ2QgaSA8JyxcbiAgICAgICAgICB0ZXh0OiBcIjwgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluIDw+ID5cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDI4XVxuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gdGhlIHBhaXIgY2hhclwiLCAtPlxuICAgICAgICBjaGVjayA9IGdldENoZWNrRnVuY3Rpb25Gb3IoJ2kgPCcpXG4gICAgICAgIHRleHQgPSAnLTwrPi0nXG4gICAgICAgIHRleHRGaW5hbCA9ICctPD4tJ1xuICAgICAgICBzZWxlY3RlZFRleHQgPSAnKydcbiAgICAgICAgb3BlbiA9IFswLCAxXVxuICAgICAgICBjbG9zZSA9IFswLCAzXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHt0ZXh0fVxuICAgICAgICBpdCBcImNhc2UtMSBub3JtYWxcIiwgLT4gY2hlY2sgb3BlbiwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0IFwiY2FzZS0yIG5vcm1hbFwiLCAtPiBjaGVjayBjbG9zZSwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0IFwiY2FzZS0zIHZpc3VhbFwiLCAtPiBjaGVjayBvcGVuLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiY2FzZS00IHZpc3VhbFwiLCAtPiBjaGVjayBjbG9zZSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgIGRlc2NyaWJlIFwiYS1hbmdsZS1icmFja2V0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiPCBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gPGhlcmU+ID5cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgYXJvdW5kIHRoZSBjdXJyZW50IGFuZ2xlIGJyYWNrZXRzIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgYSA8JyxcbiAgICAgICAgICB0ZXh0OiAnJ1xuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBhcm91bmQgdGhlIGN1cnJlbnQgYW5nbGUgYnJhY2tldHMgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlIChzZWNvbmQgdGVzdClcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDI5XVxuICAgICAgICBlbnN1cmUgJ2QgYSA8JyxcbiAgICAgICAgICB0ZXh0OiBcIjwgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluICA+XCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAyN11cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gdGhlIHBhaXIgY2hhclwiLCAtPlxuICAgICAgICBjaGVjayA9IGdldENoZWNrRnVuY3Rpb25Gb3IoXCJhIDxcIilcbiAgICAgICAgdGV4dCA9IFwiLTwrPi1cIlxuICAgICAgICB0ZXh0RmluYWwgPSBcIi0tXCJcbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gXCI8Kz5cIlxuICAgICAgICBvcGVuID0gWzAsIDFdXG4gICAgICAgIGNsb3NlID0gWzAsIDNdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQge3RleHR9XG4gICAgICAgIGl0IFwiY2FzZS0xIG5vcm1hbFwiLCAtPiBjaGVjayBvcGVuLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJjYXNlLTIgbm9ybWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJjYXNlLTMgdmlzdWFsXCIsIC0+IGNoZWNrIG9wZW4sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTQgdmlzdWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAndicsIHtzZWxlY3RlZFRleHR9XG5cbiAgZGVzY3JpYmUgXCJBbGxvd0ZvcndhcmRpbmcgZmFtaWx5XCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5vcGVyYXRvci1wZW5kaW5nLW1vZGUsIGF0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy52aXN1YWwtbW9kZSc6XG4gICAgICAgICAgJ2kgfSc6ICAndmltLW1vZGUtcGx1czppbm5lci1jdXJseS1icmFja2V0LWFsbG93LWZvcndhcmRpbmcnXG4gICAgICAgICAgJ2kgPic6ICAndmltLW1vZGUtcGx1czppbm5lci1hbmdsZS1icmFja2V0LWFsbG93LWZvcndhcmRpbmcnXG4gICAgICAgICAgJ2kgXSc6ICAndmltLW1vZGUtcGx1czppbm5lci1zcXVhcmUtYnJhY2tldC1hbGxvdy1mb3J3YXJkaW5nJ1xuICAgICAgICAgICdpICknOiAgJ3ZpbS1tb2RlLXBsdXM6aW5uZXItcGFyZW50aGVzaXMtYWxsb3ctZm9yd2FyZGluZydcblxuICAgICAgICAgICdhIH0nOiAgJ3ZpbS1tb2RlLXBsdXM6YS1jdXJseS1icmFja2V0LWFsbG93LWZvcndhcmRpbmcnXG4gICAgICAgICAgJ2EgPic6ICAndmltLW1vZGUtcGx1czphLWFuZ2xlLWJyYWNrZXQtYWxsb3ctZm9yd2FyZGluZydcbiAgICAgICAgICAnYSBdJzogICd2aW0tbW9kZS1wbHVzOmEtc3F1YXJlLWJyYWNrZXQtYWxsb3ctZm9yd2FyZGluZydcbiAgICAgICAgICAnYSApJzogICd2aW0tbW9kZS1wbHVzOmEtcGFyZW50aGVzaXMtYWxsb3ctZm9yd2FyZGluZydcblxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICBfX3swMDB9X19cbiAgICAgICAgX188MTExPl9fXG4gICAgICAgIF9fWzIyMl1fX1xuICAgICAgICBfXygzMzMpX19cbiAgICAgICAgXCJcIlwiXG4gICAgZGVzY3JpYmUgXCJpbm5lclwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3QgZm9yd2FyZGluZyByYW5nZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF07IGVuc3VyZSAnZXNjYXBlIHYgaSB9Jywgc2VsZWN0ZWRUZXh0OiBcIjAwMFwiXG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXTsgZW5zdXJlICdlc2NhcGUgdiBpID4nLCBzZWxlY3RlZFRleHQ6IFwiMTExXCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdOyBlbnN1cmUgJ2VzY2FwZSB2IGkgXScsIHNlbGVjdGVkVGV4dDogXCIyMjJcIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMywgMF07IGVuc3VyZSAnZXNjYXBlIHYgaSApJywgc2VsZWN0ZWRUZXh0OiBcIjMzM1wiXG4gICAgZGVzY3JpYmUgXCJhXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBmb3J3YXJkaW5nIHJhbmdlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXTsgZW5zdXJlICdlc2NhcGUgdiBhIH0nLCBzZWxlY3RlZFRleHQ6IFwiezAwMH1cIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF07IGVuc3VyZSAnZXNjYXBlIHYgYSA+Jywgc2VsZWN0ZWRUZXh0OiBcIjwxMTE+XCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdOyBlbnN1cmUgJ2VzY2FwZSB2IGEgXScsIHNlbGVjdGVkVGV4dDogXCJbMjIyXVwiXG4gICAgICAgIHNldCBjdXJzb3I6IFszLCAwXTsgZW5zdXJlICdlc2NhcGUgdiBhICknLCBzZWxlY3RlZFRleHQ6IFwiKDMzMylcIlxuICAgIGRlc2NyaWJlIFwibXVsdGkgbGluZSB0ZXh0XCIsIC0+XG4gICAgICBbdGV4dE9uZUlubmVyLCB0ZXh0T25lQV0gPSBbXVxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAwMDBcbiAgICAgICAgICAwMDB7MTFcbiAgICAgICAgICAxMTF7MjJ9XG4gICAgICAgICAgMTExXG4gICAgICAgICAgMTExfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICB0ZXh0T25lSW5uZXIgPSBcIlwiXCJcbiAgICAgICAgICAxMVxuICAgICAgICAgIDExMXsyMn1cbiAgICAgICAgICAxMTFcbiAgICAgICAgICAxMTFcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgdGV4dE9uZUEgPSBcIlwiXCJcbiAgICAgICAgICB7MTFcbiAgICAgICAgICAxMTF7MjJ9XG4gICAgICAgICAgMTExXG4gICAgICAgICAgMTExfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJmb3J3YXJkaW5nIGlubmVyXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0IGZvcndhcmRpbmcgcmFuZ2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF07IGVuc3VyZSBcInYgaSB9XCIsIHNlbGVjdGVkVGV4dDogdGV4dE9uZUlubmVyXG4gICAgICAgIGl0IFwic2VsZWN0IGZvcndhcmRpbmcgcmFuZ2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF07IGVuc3VyZSBcInYgaSB9XCIsIHNlbGVjdGVkVGV4dDogXCIyMlwiXG4gICAgICAgIGl0IFwiW2Nhc2UtMV0gbm8gZm9yd2FyZGluZyBvcGVuIHBhaXIsIGZhaWwgdG8gZmluZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXTsgZW5zdXJlIFwidiBpIH1cIiwgc2VsZWN0ZWRUZXh0OiAnMCcsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiW2Nhc2UtMl0gbm8gZm9yd2FyZGluZyBvcGVuIHBhaXIsIHNlbGVjdCBlbmNsb3NlZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCA0XTsgZW5zdXJlIFwidiBpIH1cIiwgc2VsZWN0ZWRUZXh0OiB0ZXh0T25lSW5uZXJcbiAgICAgICAgaXQgXCJbY2FzZS0zXSBubyBmb3J3YXJkaW5nIG9wZW4gcGFpciwgc2VsZWN0IGVuY2xvc2VkXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzMsIDBdOyBlbnN1cmUgXCJ2IGkgfVwiLCBzZWxlY3RlZFRleHQ6IHRleHRPbmVJbm5lclxuICAgICAgICBpdCBcIltjYXNlLTNdIG5vIGZvcndhcmRpbmcgb3BlbiBwYWlyLCBzZWxlY3QgZW5jbG9zZWRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbNCwgMF07IGVuc3VyZSBcInYgaSB9XCIsIHNlbGVjdGVkVGV4dDogdGV4dE9uZUlubmVyXG4gICAgICBkZXNjcmliZSBcImZvcndhcmRpbmcgYVwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdCBmb3J3YXJkaW5nIHJhbmdlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdOyBlbnN1cmUgXCJ2IGEgfVwiLCBzZWxlY3RlZFRleHQ6IHRleHRPbmVBXG4gICAgICAgIGl0IFwic2VsZWN0IGZvcndhcmRpbmcgcmFuZ2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF07IGVuc3VyZSBcInYgYSB9XCIsIHNlbGVjdGVkVGV4dDogXCJ7MjJ9XCJcbiAgICAgICAgaXQgXCJbY2FzZS0xXSBubyBmb3J3YXJkaW5nIG9wZW4gcGFpciwgZmFpbCB0byBmaW5kXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdOyBlbnN1cmUgXCJ2IGEgfVwiLCBzZWxlY3RlZFRleHQ6ICcwJywgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJbY2FzZS0yXSBubyBmb3J3YXJkaW5nIG9wZW4gcGFpciwgc2VsZWN0IGVuY2xvc2VkXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDRdOyBlbnN1cmUgXCJ2IGEgfVwiLCBzZWxlY3RlZFRleHQ6IHRleHRPbmVBXG4gICAgICAgIGl0IFwiW2Nhc2UtM10gbm8gZm9yd2FyZGluZyBvcGVuIHBhaXIsIHNlbGVjdCBlbmNsb3NlZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFszLCAwXTsgZW5zdXJlIFwidiBhIH1cIiwgc2VsZWN0ZWRUZXh0OiB0ZXh0T25lQVxuICAgICAgICBpdCBcIltjYXNlLTNdIG5vIGZvcndhcmRpbmcgb3BlbiBwYWlyLCBzZWxlY3QgZW5jbG9zZWRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbNCwgMF07IGVuc3VyZSBcInYgYSB9XCIsIHNlbGVjdGVkVGV4dDogdGV4dE9uZUFcblxuICBkZXNjcmliZSBcIkFueVBhaXJBbGxvd0ZvcndhcmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGV4dFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm9wZXJhdG9yLXBlbmRpbmctbW9kZSwgYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLnZpc3VhbC1tb2RlJzpcbiAgICAgICAgICBcIjtcIjogJ3ZpbS1tb2RlLXBsdXM6aW5uZXItYW55LXBhaXItYWxsb3ctZm9yd2FyZGluZydcbiAgICAgICAgICBcIjpcIjogJ3ZpbS1tb2RlLXBsdXM6YS1hbnktcGFpci1hbGxvdy1mb3J3YXJkaW5nJ1xuXG4gICAgICBzZXQgdGV4dDogXCJcIlwiXG4gICAgICAgIDAwXG4gICAgICAgIDAwWzExXG4gICAgICAgIDExXCIyMjJcIjExezMzM30xMShcbiAgICAgICAgNDQ0KCk0NDRcbiAgICAgICAgKVxuICAgICAgICAxMTFdMDB7NTU1fVxuICAgICAgICBcIlwiXCJcbiAgICBkZXNjcmliZSBcImlubmVyXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBmb3J3YXJkaW5nIHJhbmdlIHdpdGhpbiBlbmNsb3NlZCByYW5nZShpZiBleGlzdHMpXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBrZXlzdHJva2UgJ3YnXG4gICAgICAgIGVuc3VyZSAnOycsIHNlbGVjdGVkVGV4dDogXCIyMjJcIlxuICAgICAgICBlbnN1cmUgJzsnLCBzZWxlY3RlZFRleHQ6IFwiMzMzXCJcbiAgICAgICAgZW5zdXJlICc7Jywgc2VsZWN0ZWRUZXh0OiBcIjQ0NCgpNDQ0XCJcbiAgICBkZXNjcmliZSBcImFcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IGZvcndhcmRpbmcgcmFuZ2Ugd2l0aGluIGVuY2xvc2VkIHJhbmdlKGlmIGV4aXN0cylcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGtleXN0cm9rZSAndidcbiAgICAgICAgZW5zdXJlICc6Jywgc2VsZWN0ZWRUZXh0OiAnXCIyMjJcIidcbiAgICAgICAgZW5zdXJlICc6Jywgc2VsZWN0ZWRUZXh0OiBcInszMzN9XCJcbiAgICAgICAgZW5zdXJlICc6Jywgc2VsZWN0ZWRUZXh0OiBcIihcXG40NDQoKTQ0NFxcbilcIlxuICAgICAgICBlbnN1cmUgJzonLCBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICBbMTFcbiAgICAgICAgMTFcIjIyMlwiMTF7MzMzfTExKFxuICAgICAgICA0NDQoKTQ0NFxuICAgICAgICApXG4gICAgICAgIDExMV1cbiAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJUYWdcIiwgLT5cbiAgICBbZW5zdXJlU2VsZWN0ZWRUZXh0XSA9IFtdXG4gICAgZW5zdXJlU2VsZWN0ZWRUZXh0ID0gKHN0YXJ0LCBrZXlzdHJva2UsIHNlbGVjdGVkVGV4dCkgLT5cbiAgICAgIHNldCBjdXJzb3I6IHN0YXJ0XG4gICAgICBlbnN1cmUga2V5c3Ryb2tlLCB7c2VsZWN0ZWRUZXh0fVxuXG4gICAgZGVzY3JpYmUgXCJpbm5lci10YWdcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwicHJlY2lzZWx5IHNlbGVjdCBpbm5lclwiLCAtPlxuICAgICAgICBjaGVjayA9IGdldENoZWNrRnVuY3Rpb25Gb3IoJ2kgdCcpXG4gICAgICAgIHRleHQgPSBcIlwiXCJcbiAgICAgICAgICA8YWJjPlxuICAgICAgICAgICAgPHRpdGxlPlRJVExFPC90aXRsZT5cbiAgICAgICAgICA8L2FiYz5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gXCJUSVRMRVwiXG4gICAgICAgIGlubmVyQUJDID0gXCJcXG4gIDx0aXRsZT5USVRMRTwvdGl0bGU+XFxuXCJcbiAgICAgICAgdGV4dEFmdGVyRGVsZXRlZCA9IFwiXCJcIlxuICAgICAgICAgIDxhYmM+XG4gICAgICAgICAgICA8dGl0bGU+PC90aXRsZT5cbiAgICAgICAgICA8L2FiYz5cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHt0ZXh0fVxuXG4gICAgICAgICMgU2VsZWN0XG4gICAgICAgIGl0IFwiWzFdIGZvcndhcmRpbmdcIiwgLT4gY2hlY2sgWzEsIDBdLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiWzJdIG9wZW5UYWcgbGVmdG1vc3RcIiwgLT4gY2hlY2sgWzEsIDJdLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiWzNdIG9wZW5UYWcgcmlnaHRtb3N0XCIsIC0+IGNoZWNrIFsxLCA4XSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcIls0XSBJbm5lciB0ZXh0XCIsIC0+IGNoZWNrIFsxLCAxMF0sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJbNV0gY2xvc2VUYWcgbGVmdG1vc3RcIiwgLT4gY2hlY2sgWzEsIDE0XSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcIls2XSBjbG9zZVRhZyByaWdodG1vc3RcIiwgLT4gY2hlY2sgWzEsIDIxXSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcIls3XSByaWdodCBvZiBjbG9zZVRhZ1wiLCAtPiBjaGVjayBbMiwgMF0sICd2Jywge3NlbGVjdGVkVGV4dDogaW5uZXJBQkN9XG5cbiAgICAgICAgIyBEZWxldGVcbiAgICAgICAgaXQgXCJbOF0gZm9yd2FyZGluZ1wiLCAtPiBjaGVjayBbMSwgMF0sICdkJywge3RleHQ6IHRleHRBZnRlckRlbGV0ZWR9XG4gICAgICAgIGl0IFwiWzldIG9wZW5UYWcgbGVmdG1vc3RcIiwgLT4gY2hlY2sgWzEsIDJdLCAnZCcsIHt0ZXh0OiB0ZXh0QWZ0ZXJEZWxldGVkfVxuICAgICAgICBpdCBcIlsxMF0gb3BlblRhZyByaWdodG1vc3RcIiwgLT4gY2hlY2sgWzEsIDhdLCAnZCcsIHt0ZXh0OiB0ZXh0QWZ0ZXJEZWxldGVkfVxuICAgICAgICBpdCBcIlsxMV0gSW5uZXIgdGV4dFwiLCAtPiBjaGVjayBbMSwgMTBdLCAnZCcsIHt0ZXh0OiB0ZXh0QWZ0ZXJEZWxldGVkfVxuICAgICAgICBpdCBcIlsxMl0gY2xvc2VUYWcgbGVmdG1vc3RcIiwgLT4gY2hlY2sgWzEsIDE0XSwgJ2QnLCB7dGV4dDogdGV4dEFmdGVyRGVsZXRlZH1cbiAgICAgICAgaXQgXCJbMTNdIGNsb3NlVGFnIHJpZ2h0bW9zdFwiLCAtPiBjaGVjayBbMSwgMjFdLCAnZCcsIHt0ZXh0OiB0ZXh0QWZ0ZXJEZWxldGVkfVxuICAgICAgICBpdCBcIlsxNF0gcmlnaHQgb2YgY2xvc2VUYWdcIiwgLT4gY2hlY2sgWzIsIDBdLCAnZCcsIHt0ZXh0OiBcIjxhYmM+PC9hYmM+XCJ9XG5cbiAgICAgIGRlc2NyaWJlIFwiZXhwYW5zaW9uIGFuZCBkZWxldGlvblwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgIyBbTk9URV0gSW50ZW50aW9uYWxseSBvbWl0IGAhYCBwcmVmaXggb2YgRE9DVFlQRSBzaW5jZSBpdCByZXByZXNlbnQgbGFzdCBjdXJzb3IgaW4gdGV4dEMuXG4gICAgICAgICAgaHRtbExpa2VUZXh0ID0gXCJcIlwiXG4gICAgICAgICAgPERPQ1RZUEUgaHRtbD5cbiAgICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICBfXzxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiIC8+XG4gICAgICAgICAgX188dGl0bGU+RG9jdW1lbnQ8L3RpdGxlPlxuICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICA8Ym9keT5cbiAgICAgICAgICBfXzxkaXY+XG4gICAgICAgICAgX19fXzxkaXY+XG4gICAgICAgICAgfF9fX19fXzxkaXY+XG4gICAgICAgICAgX19fX19fX188cD48YT5cbiAgICAgICAgICBfX19fX188L2Rpdj5cbiAgICAgICAgICBfX19fPC9kaXY+XG4gICAgICAgICAgX188L2Rpdj5cbiAgICAgICAgICA8L2JvZHk+XG4gICAgICAgICAgPC9odG1sPlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIHNldCB0ZXh0Q186IGh0bWxMaWtlVGV4dFxuXG4gICAgICAgIGl0IFwiY2FuIGV4cGFuZCBzZWxlY3Rpb24gd2hlbiByZXBlYXRlZFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAndiBpIHQnLCBzZWxlY3RlZFRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIFxcbl9fX19fX19fPHA+PGE+XG4gICAgICAgICAgICBfX19fX19cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnaSB0Jywgc2VsZWN0ZWRUZXh0XzogXCJcIlwiXG4gICAgICAgICAgICBcXG5fX19fX188ZGl2PlxuICAgICAgICAgICAgX19fX19fX188cD48YT5cbiAgICAgICAgICAgIF9fX19fXzwvZGl2PlxuICAgICAgICAgICAgX19fX1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdpIHQnLCBzZWxlY3RlZFRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIFxcbl9fX188ZGl2PlxuICAgICAgICAgICAgX19fX19fPGRpdj5cbiAgICAgICAgICAgIF9fX19fX19fPHA+PGE+XG4gICAgICAgICAgICBfX19fX188L2Rpdj5cbiAgICAgICAgICAgIF9fX188L2Rpdj5cbiAgICAgICAgICAgIF9fXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2kgdCcsIHNlbGVjdGVkVGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgXFxuX188ZGl2PlxuICAgICAgICAgICAgX19fXzxkaXY+XG4gICAgICAgICAgICBfX19fX188ZGl2PlxuICAgICAgICAgICAgX19fX19fX188cD48YT5cbiAgICAgICAgICAgIF9fX19fXzwvZGl2PlxuICAgICAgICAgICAgX19fXzwvZGl2PlxuICAgICAgICAgICAgX188L2Rpdj5cXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnaSB0Jywgc2VsZWN0ZWRUZXh0XzogXCJcIlwiXG4gICAgICAgICAgICBcXG48aGVhZD5cbiAgICAgICAgICAgIF9fPG1ldGEgY2hhcnNldD1cIlVURi04XCIgLz5cbiAgICAgICAgICAgIF9fPHRpdGxlPkRvY3VtZW50PC90aXRsZT5cbiAgICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICAgIDxib2R5PlxuICAgICAgICAgICAgX188ZGl2PlxuICAgICAgICAgICAgX19fXzxkaXY+XG4gICAgICAgICAgICBfX19fX188ZGl2PlxuICAgICAgICAgICAgX19fX19fX188cD48YT5cbiAgICAgICAgICAgIF9fX19fXzwvZGl2PlxuICAgICAgICAgICAgX19fXzwvZGl2PlxuICAgICAgICAgICAgX188L2Rpdj5cbiAgICAgICAgICAgIDwvYm9keT5cXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnZGVsZXRlIGlubmVyLXRhZyBhbmQgcmVwYXRhYmxlJywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbOSwgMF1cbiAgICAgICAgICBlbnN1cmUgXCJkIGkgdFwiLCB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICA8RE9DVFlQRSBodG1sPlxuICAgICAgICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgIF9fPG1ldGEgY2hhcnNldD1cIlVURi04XCIgLz5cbiAgICAgICAgICAgIF9fPHRpdGxlPkRvY3VtZW50PC90aXRsZT5cbiAgICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICAgIDxib2R5PlxuICAgICAgICAgICAgX188ZGl2PlxuICAgICAgICAgICAgX19fXzxkaXY+XG4gICAgICAgICAgICBfX19fX188ZGl2PjwvZGl2PlxuICAgICAgICAgICAgX19fXzwvZGl2PlxuICAgICAgICAgICAgX188L2Rpdj5cbiAgICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICAgIDwvaHRtbD5cXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSBcIjMgLlwiLCB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICA8RE9DVFlQRSBodG1sPlxuICAgICAgICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgIF9fPG1ldGEgY2hhcnNldD1cIlVURi04XCIgLz5cbiAgICAgICAgICAgIF9fPHRpdGxlPkRvY3VtZW50PC90aXRsZT5cbiAgICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICAgIDxib2R5PjwvYm9keT5cbiAgICAgICAgICAgIDwvaHRtbD5cXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSBcIi5cIiwgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgPERPQ1RZUEUgaHRtbD5cbiAgICAgICAgICAgIDxodG1sIGxhbmc9XCJlblwiPjwvaHRtbD5cXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcInRhZydzIElOLXRhZy9PZmYtdGFnIHJlY29nbml0aW9uXCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwiV2hlbiB0YWdTdGFydCdzIHJvdyBjb250YWlucyBOTyBOT04td2hpdGVzcGFlY2UgdGlsbCB0YWdTdGFydFwiLCAtPlxuICAgICAgICAgIGl0IFwiW211bHRpLWxpbmVdIHNlbGVjdCBmb3J3YXJkaW5nIHRhZ1wiLCAtPlxuICAgICAgICAgICAgc2V0IHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgfCAgPHNwYW4+aW5uZXI8L3NwYW4+XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBlbnN1cmUgXCJkIGkgdFwiLCB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgICA8c3Bhbj48L3NwYW4+XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZGVzY3JpYmUgXCJXaGVuIHRhZ1N0YXJ0J3Mgcm93IGNvbnRhaW5zIFNPTUUgTk9OLXdoaXRlc3BhZWNlIHRpbGwgdGFnU3RhcnRcIiwgLT5cbiAgICAgICAgICBpdCBcIlttdWx0aS1saW5lXSBzZWxlY3QgZW5jbG9zaW5nIHRhZ1wiLCAtPlxuICAgICAgICAgICAgc2V0IHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgaGVsbG8gfCA8c3Bhbj5pbm5lcjwvc3Bhbj5cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZW5zdXJlIFwiZCBpIHRcIiwgdGV4dDogXCI8c3Bhbj48L3NwYW4+XCJcblxuICAgICAgICAgIGl0IFwiW29uZS1saW5lLTFdIHNlbGVjdCBlbmNsb3NpbmcgdGFnXCIsIC0+XG4gICAgICAgICAgICBzZXQgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICA8c3Bhbj4gfCA8c3Bhbj5pbm5lcjwvc3Bhbj48L3NwYW4+XG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgICBlbnN1cmUgXCJkIGkgdFwiLCB0ZXh0OiBcIjxzcGFuPjwvc3Bhbj5cIlxuXG4gICAgICAgICAgaXQgXCJbb25lLWxpbmUtMl0gc2VsZWN0IGVuY2xvc2luZyB0YWdcIiwgLT5cbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIDxzcGFuPmh8ZWxsbzxzcGFuPmlubmVyPC9zcGFuPjwvc3Bhbj5cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICAgIGVuc3VyZSBcImQgaSB0XCIsIHRleHQ6IFwiPHNwYW4+PC9zcGFuPlwiXG5cbiAgICBkZXNjcmliZSBcImEtdGFnXCIsIC0+XG4gICAgICBkZXNjcmliZSBcInByZWNpc2VseSBzZWxlY3QgYVwiLCAtPlxuICAgICAgICBjaGVjayA9IGdldENoZWNrRnVuY3Rpb25Gb3IoJ2EgdCcpXG4gICAgICAgIHRleHQgPSBcIlwiXCJcbiAgICAgICAgICA8YWJjPlxuICAgICAgICAgICAgPHRpdGxlPlRJVExFPC90aXRsZT5cbiAgICAgICAgICA8L2FiYz5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gXCI8dGl0bGU+VElUTEU8L3RpdGxlPlwiXG4gICAgICAgIGFBQkMgPSB0ZXh0XG4gICAgICAgIHRleHRBZnRlckRlbGV0ZWQgPSBcIlwiXCJcbiAgICAgICAgICA8YWJjPlxuICAgICAgICAgIF9fXG4gICAgICAgICAgPC9hYmM+XG4gICAgICAgICAgXCJcIlwiLnJlcGxhY2UoL18vZywgJyAnKVxuXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQge3RleHR9XG5cbiAgICAgICAgIyBTZWxlY3RcbiAgICAgICAgaXQgXCJbMV0gZm9yd2FyZGluZ1wiLCAtPiBjaGVjayBbMSwgMF0sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJbMl0gb3BlblRhZyBsZWZ0bW9zdFwiLCAtPiBjaGVjayBbMSwgMl0sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJbM10gb3BlblRhZyByaWdodG1vc3RcIiwgLT4gY2hlY2sgWzEsIDhdLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiWzRdIElubmVyIHRleHRcIiwgLT4gY2hlY2sgWzEsIDEwXSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcIls1XSBjbG9zZVRhZyBsZWZ0bW9zdFwiLCAtPiBjaGVjayBbMSwgMTRdLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiWzZdIGNsb3NlVGFnIHJpZ2h0bW9zdFwiLCAtPiBjaGVjayBbMSwgMjFdLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiWzddIHJpZ2h0IG9mIGNsb3NlVGFnXCIsIC0+IGNoZWNrIFsyLCAwXSwgJ3YnLCB7c2VsZWN0ZWRUZXh0OiBhQUJDfVxuXG4gICAgICAgICMgRGVsZXRlXG4gICAgICAgIGl0IFwiWzhdIGZvcndhcmRpbmdcIiwgLT4gY2hlY2sgWzEsIDBdLCAnZCcsIHt0ZXh0OiB0ZXh0QWZ0ZXJEZWxldGVkfVxuICAgICAgICBpdCBcIls5XSBvcGVuVGFnIGxlZnRtb3N0XCIsIC0+IGNoZWNrIFsxLCAyXSwgJ2QnLCB7dGV4dDogdGV4dEFmdGVyRGVsZXRlZH1cbiAgICAgICAgaXQgXCJbMTBdIG9wZW5UYWcgcmlnaHRtb3N0XCIsIC0+IGNoZWNrIFsxLCA4XSwgJ2QnLCB7dGV4dDogdGV4dEFmdGVyRGVsZXRlZH1cbiAgICAgICAgaXQgXCJbMTFdIElubmVyIHRleHRcIiwgLT4gY2hlY2sgWzEsIDEwXSwgJ2QnLCB7dGV4dDogdGV4dEFmdGVyRGVsZXRlZH1cbiAgICAgICAgaXQgXCJbMTJdIGNsb3NlVGFnIGxlZnRtb3N0XCIsIC0+IGNoZWNrIFsxLCAxNF0sICdkJywge3RleHQ6IHRleHRBZnRlckRlbGV0ZWR9XG4gICAgICAgIGl0IFwiWzEzXSBjbG9zZVRhZyByaWdodG1vc3RcIiwgLT4gY2hlY2sgWzEsIDIxXSwgJ2QnLCB7dGV4dDogdGV4dEFmdGVyRGVsZXRlZH1cbiAgICAgICAgaXQgXCJbMTRdIHJpZ2h0IG9mIGNsb3NlVGFnXCIsIC0+IGNoZWNrIFsyLCAwXSwgJ2QnLCB7dGV4dDogXCJcIn1cblxuICBkZXNjcmliZSBcIlNxdWFyZUJyYWNrZXRcIiwgLT5cbiAgICBkZXNjcmliZSBcImlubmVyLXNxdWFyZS1icmFja2V0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiWyBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gW2hlcmVdIF1cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgaW5zaWRlIHRoZSBjdXJyZW50IHdvcmQgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBpIFsnLFxuICAgICAgICAgIHRleHQ6IFwiW11cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgaW5zaWRlIHRoZSBjdXJyZW50IHdvcmQgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlIChzZWNvbmQgdGVzdClcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMCwgMjldXG4gICAgICAgIGVuc3VyZSAnZCBpIFsnLFxuICAgICAgICAgIHRleHQ6IFwiWyBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gW10gXVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMjhdXG4gICAgZGVzY3JpYmUgXCJhLXNxdWFyZS1icmFja2V0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiWyBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gW2hlcmVdIF1cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgYXJvdW5kIHRoZSBjdXJyZW50IHNxdWFyZSBicmFja2V0cyBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGEgWycsXG4gICAgICAgICAgdGV4dDogJydcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgYXJvdW5kIHRoZSBjdXJyZW50IHNxdWFyZSBicmFja2V0cyBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGUgKHNlY29uZCB0ZXN0KVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMjldXG4gICAgICAgIGVuc3VyZSAnZCBhIFsnLFxuICAgICAgICAgIHRleHQ6IFwiWyBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gIF1cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDI3XVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiB0aGUgcGFpciBjaGFyXCIsIC0+XG4gICAgICAgIGNoZWNrID0gZ2V0Q2hlY2tGdW5jdGlvbkZvcignaSBbJylcbiAgICAgICAgdGV4dCA9ICctWytdLSdcbiAgICAgICAgdGV4dEZpbmFsID0gJy1bXS0nXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9ICcrJ1xuICAgICAgICBvcGVuID0gWzAsIDFdXG4gICAgICAgIGNsb3NlID0gWzAsIDNdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQge3RleHR9XG4gICAgICAgIGl0IFwiY2FzZS0xIG5vcm1hbFwiLCAtPiBjaGVjayBvcGVuLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgXCJjYXNlLTIgbm9ybWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgXCJjYXNlLTMgdmlzdWFsXCIsIC0+IGNoZWNrIG9wZW4sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTQgdmlzdWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiB0aGUgcGFpciBjaGFyXCIsIC0+XG4gICAgICAgIGNoZWNrID0gZ2V0Q2hlY2tGdW5jdGlvbkZvcignYSBbJylcbiAgICAgICAgdGV4dCA9ICctWytdLSdcbiAgICAgICAgdGV4dEZpbmFsID0gJy0tJ1xuICAgICAgICBzZWxlY3RlZFRleHQgPSAnWytdJ1xuICAgICAgICBvcGVuID0gWzAsIDFdXG4gICAgICAgIGNsb3NlID0gWzAsIDNdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQge3RleHR9XG4gICAgICAgIGl0IFwiY2FzZS0xIG5vcm1hbFwiLCAtPiBjaGVjayBvcGVuLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJjYXNlLTIgbm9ybWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJjYXNlLTMgdmlzdWFsXCIsIC0+IGNoZWNrIG9wZW4sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTQgdmlzdWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAndicsIHtzZWxlY3RlZFRleHR9XG4gIGRlc2NyaWJlIFwiUGFyZW50aGVzaXNcIiwgLT5cbiAgICBkZXNjcmliZSBcImlubmVyLXBhcmVudGhlc2lzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiKCBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gKGhlcmUpIClcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgaW5zaWRlIHRoZSBjdXJyZW50IHdvcmQgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBpICgnLFxuICAgICAgICAgIHRleHQ6IFwiKClcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgaW5zaWRlIHRoZSBjdXJyZW50IHdvcmQgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlIChzZWNvbmQgdGVzdClcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDI5XVxuICAgICAgICBlbnN1cmUgJ2QgaSAoJyxcbiAgICAgICAgICB0ZXh0OiBcIiggc29tZXRoaW5nIGluIGhlcmUgYW5kIGluICgpIClcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDI4XVxuXG4gICAgICBpdCBcInNlbGVjdCBpbm5lciAoKSBieSBza2lwcGluZyBuZXN0aW5nIHBhaXJcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogJ2V4cGVjdChlZGl0b3IuZ2V0U2Nyb2xsVG9wKCkpJ1xuICAgICAgICAgIGN1cnNvcjogWzAsIDddXG4gICAgICAgIGVuc3VyZSAndiBpICgnLCBzZWxlY3RlZFRleHQ6ICdlZGl0b3IuZ2V0U2Nyb2xsVG9wKCknXG5cbiAgICAgIGl0IFwic2tpcCBlc2NhcGVkIHBhaXIgY2FzZS0xXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnZXhwZWN0KGVkaXRvci5nXFxcXChldFNjcm9sbFRwKCkpJywgY3Vyc29yOiBbMCwgMjBdXG4gICAgICAgIGVuc3VyZSAndiBpICgnLCBzZWxlY3RlZFRleHQ6ICdlZGl0b3IuZ1xcXFwoZXRTY3JvbGxUcCgpJ1xuXG4gICAgICBpdCBcImRvbnQgc2tpcCBsaXRlcmFsIGJhY2tzbGFzaFwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogJ2V4cGVjdChlZGl0b3IuZ1xcXFxcXFxcKGV0U2Nyb2xsVHAoKSknLCBjdXJzb3I6IFswLCAyMF1cbiAgICAgICAgZW5zdXJlICd2IGkgKCcsIHNlbGVjdGVkVGV4dDogJ2V0U2Nyb2xsVHAoKSdcblxuICAgICAgaXQgXCJza2lwIGVzY2FwZWQgcGFpciBjYXNlLTJcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6ICdleHBlY3QoZWRpdG9yLmdldFNjXFxcXClyb2xsVHAoKSknLCBjdXJzb3I6IFswLCA3XVxuICAgICAgICBlbnN1cmUgJ3YgaSAoJywgc2VsZWN0ZWRUZXh0OiAnZWRpdG9yLmdldFNjXFxcXClyb2xsVHAoKSdcblxuICAgICAgaXQgXCJza2lwIGVzY2FwZWQgcGFpciBjYXNlLTNcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6ICdleHBlY3QoZWRpdG9yLmdlXFxcXCh0U2NcXFxcKXJvbGxUcCgpKScsIGN1cnNvcjogWzAsIDddXG4gICAgICAgIGVuc3VyZSAndiBpICgnLCBzZWxlY3RlZFRleHQ6ICdlZGl0b3IuZ2VcXFxcKHRTY1xcXFwpcm9sbFRwKCknXG5cbiAgICAgIGl0IFwid29ya3Mgd2l0aCBtdWx0aXBsZSBjdXJzb3JzXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiKCBhIGIgKSBjZGUgKCBmIGcgaCApIGlqa1wiXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDJdLCBbMCwgMThdXVxuICAgICAgICBlbnN1cmUgJ3YgaSAoJyxcbiAgICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbXG4gICAgICAgICAgICBbWzAsIDFdLCAgWzAsIDZdXVxuICAgICAgICAgICAgW1swLCAxM10sIFswLCAyMF1dXG4gICAgICAgICAgXVxuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gdGhlIHBhaXIgY2hhclwiLCAtPlxuICAgICAgICBjaGVjayA9IGdldENoZWNrRnVuY3Rpb25Gb3IoJ2kgKCcpXG4gICAgICAgIHRleHQgPSAnLSgrKS0nXG4gICAgICAgIHRleHRGaW5hbCA9ICctKCktJ1xuICAgICAgICBzZWxlY3RlZFRleHQgPSAnKydcbiAgICAgICAgb3BlbiA9IFswLCAxXVxuICAgICAgICBjbG9zZSA9IFswLCAzXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHt0ZXh0fVxuICAgICAgICBpdCBcImNhc2UtMSBub3JtYWxcIiwgLT4gY2hlY2sgb3BlbiwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0IFwiY2FzZS0yIG5vcm1hbFwiLCAtPiBjaGVjayBjbG9zZSwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0IFwiY2FzZS0zIHZpc3VhbFwiLCAtPiBjaGVjayBvcGVuLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiY2FzZS00IHZpc3VhbFwiLCAtPiBjaGVjayBjbG9zZSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuXG4gICAgZGVzY3JpYmUgXCJhLXBhcmVudGhlc2lzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiKCBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gKGhlcmUpIClcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgYXJvdW5kIHRoZSBjdXJyZW50IHBhcmVudGhlc2VzIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgYSAoJyxcbiAgICAgICAgICB0ZXh0OiAnJ1xuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBhcm91bmQgdGhlIGN1cnJlbnQgcGFyZW50aGVzZXMgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlIChzZWNvbmQgdGVzdClcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDI5XVxuICAgICAgICBlbnN1cmUgJ2QgYSAoJyxcbiAgICAgICAgICB0ZXh0OiBcIiggc29tZXRoaW5nIGluIGhlcmUgYW5kIGluICApXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAyN11cbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIHRoZSBwYWlyIGNoYXJcIiwgLT5cbiAgICAgICAgY2hlY2sgPSBnZXRDaGVja0Z1bmN0aW9uRm9yKCdhICgnKVxuICAgICAgICB0ZXh0ID0gJy0oKyktJ1xuICAgICAgICB0ZXh0RmluYWwgPSAnLS0nXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9ICcoKyknXG4gICAgICAgIG9wZW4gPSBbMCwgMV1cbiAgICAgICAgY2xvc2UgPSBbMCwgM11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB7dGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTEgbm9ybWFsXCIsIC0+IGNoZWNrIG9wZW4sICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcImNhc2UtMiBub3JtYWxcIiwgLT4gY2hlY2sgY2xvc2UsICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcImNhc2UtMyB2aXN1YWxcIiwgLT4gY2hlY2sgb3BlbiwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcImNhc2UtNCB2aXN1YWxcIiwgLT4gY2hlY2sgY2xvc2UsICd2Jywge3NlbGVjdGVkVGV4dH1cblxuICBkZXNjcmliZSBcIlBhcmFncmFwaFwiLCAtPlxuICAgIHRleHQgPSBudWxsXG4gICAgZW5zdXJlUGFyYWdyYXBoID0gKGtleXN0cm9rZSwgb3B0aW9ucykgLT5cbiAgICAgIHVubGVzcyBvcHRpb25zLnNldEN1cnNvclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3coXCJubyBzZXRDdXJzb3IgcHJvdmlkZWRcIilcbiAgICAgIHNldCBjdXJzb3I6IG9wdGlvbnMuc2V0Q3Vyc29yXG4gICAgICBkZWxldGUgb3B0aW9ucy5zZXRDdXJzb3JcbiAgICAgIGVuc3VyZShrZXlzdHJva2UsIG9wdGlvbnMpXG4gICAgICBlbnN1cmUoJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnKVxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgdGV4dCA9IG5ldyBUZXh0RGF0YSBcIlwiXCJcblxuICAgICAgICAxOiBQLTFcblxuICAgICAgICAzOiBQLTJcbiAgICAgICAgNDogUC0yXG5cblxuICAgICAgICA3OiBQLTNcbiAgICAgICAgODogUC0zXG4gICAgICAgIDk6IFAtM1xuXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICBzZXRcbiAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgdGV4dDogdGV4dC5nZXRSYXcoKVxuXG4gICAgZGVzY3JpYmUgXCJpbm5lci1wYXJhZ3JhcGhcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IGNvbnNlcXV0aXZlIGJsYW5rIHJvd3NcIiwgLT5cbiAgICAgICAgZW5zdXJlUGFyYWdyYXBoICd2IGkgcCcsIHNldEN1cnNvcjogWzAsIDBdLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzBdKVxuICAgICAgICBlbnN1cmVQYXJhZ3JhcGggJ3YgaSBwJywgc2V0Q3Vyc29yOiBbMiwgMF0sIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMl0pXG4gICAgICAgIGVuc3VyZVBhcmFncmFwaCAndiBpIHAnLCBzZXRDdXJzb3I6IFs1LCAwXSwgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFs1Li42XSlcbiAgICAgIGl0IFwic2VsZWN0IGNvbnNlcXV0aXZlIG5vbi1ibGFuayByb3dzXCIsIC0+XG4gICAgICAgIGVuc3VyZVBhcmFncmFwaCAndiBpIHAnLCBzZXRDdXJzb3I6IFsxLCAwXSwgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxXSlcbiAgICAgICAgZW5zdXJlUGFyYWdyYXBoICd2IGkgcCcsIHNldEN1cnNvcjogWzMsIDBdLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzMuLjRdKVxuICAgICAgICBlbnN1cmVQYXJhZ3JhcGggJ3YgaSBwJywgc2V0Q3Vyc29yOiBbNywgMF0sIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbNy4uOV0pXG4gICAgICBpdCBcIm9wZXJhdGUgb24gaW5uZXIgcGFyYWdyYXBoXCIsIC0+XG4gICAgICAgIGVuc3VyZVBhcmFncmFwaCAneSBpIHAnLCBzZXRDdXJzb3I6IFs3LCAwXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IHRleHQuZ2V0TGluZXMoWzcsIDgsIDldKVxuXG4gICAgZGVzY3JpYmUgXCJhLXBhcmFncmFwaFwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3QgdHdvIHBhcmFncmFwaCBhcyBvbmUgb3BlcmF0aW9uXCIsIC0+XG4gICAgICAgIGVuc3VyZVBhcmFncmFwaCAndiBhIHAnLCBzZXRDdXJzb3I6IFswLCAwXSwgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLCAxXSlcbiAgICAgICAgZW5zdXJlUGFyYWdyYXBoICd2IGEgcCcsIHNldEN1cnNvcjogWzIsIDBdLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzIuLjRdKVxuICAgICAgICBlbnN1cmVQYXJhZ3JhcGggJ3YgYSBwJywgc2V0Q3Vyc29yOiBbNSwgMF0sIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbNS4uOV0pXG4gICAgICBpdCBcInNlbGVjdCB0d28gcGFyYWdyYXBoIGFzIG9uZSBvcGVyYXRpb25cIiwgLT5cbiAgICAgICAgZW5zdXJlUGFyYWdyYXBoICd2IGEgcCcsIHNldEN1cnNvcjogWzEsIDBdLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzEuLjJdKVxuICAgICAgICBlbnN1cmVQYXJhZ3JhcGggJ3YgYSBwJywgc2V0Q3Vyc29yOiBbMywgMF0sIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMy4uNl0pXG4gICAgICAgIGVuc3VyZVBhcmFncmFwaCAndiBhIHAnLCBzZXRDdXJzb3I6IFs3LCAwXSwgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFs3Li4xMF0pXG4gICAgICBpdCBcIm9wZXJhdGUgb24gYSBwYXJhZ3JhcGhcIiwgLT5cbiAgICAgICAgZW5zdXJlUGFyYWdyYXBoICd5IGEgcCcsIHNldEN1cnNvcjogWzMsIDBdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogdGV4dC5nZXRMaW5lcyhbMy4uNl0pXG5cbiAgZGVzY3JpYmUgJ0NvbW1lbnQnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG4gICAgICBydW5zIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIGdyYW1tYXI6ICdzb3VyY2UuY29mZmVlJ1xuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICMjI1xuICAgICAgICAgIG11bHRpbGluZSBjb21tZW50XG4gICAgICAgICAgIyMjXG5cbiAgICAgICAgICAjIE9uZSBsaW5lIGNvbW1lbnRcblxuICAgICAgICAgICMgQ29tbWVudFxuICAgICAgICAgICMgYm9yZGVyXG4gICAgICAgICAgY2xhc3MgUXVpY2tTb3J0XG4gICAgICAgICAgXCJcIlwiXG4gICAgYWZ0ZXJFYWNoIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcblxuICAgIGRlc2NyaWJlICdpbm5lci1jb21tZW50JywgLT5cbiAgICAgIGl0ICdzZWxlY3QgaW5uZXIgY29tbWVudCBibG9jaycsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ3YgaSAvJyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6ICcjIyNcXG5tdWx0aWxpbmUgY29tbWVudFxcbiMjI1xcbidcbiAgICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzAsIDBdLCBbMywgMF1dXG5cbiAgICAgIGl0ICdzZWxlY3Qgb25lIGxpbmUgY29tbWVudCcsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCAwXVxuICAgICAgICBlbnN1cmUgJ3YgaSAvJyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6ICcjIE9uZSBsaW5lIGNvbW1lbnRcXG4nXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1s0LCAwXSwgWzUsIDBdXVxuXG4gICAgICBpdCAnbm90IHNlbGVjdCBub24tY29tbWVudCBsaW5lJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzYsIDBdXG4gICAgICAgIGVuc3VyZSAndiBpIC8nLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogJyMgQ29tbWVudFxcbiMgYm9yZGVyXFxuJ1xuICAgICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbNiwgMF0sIFs4LCAwXV1cblxuICBkZXNjcmliZSAnSW5kZW50YXRpb24nLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG4gICAgICBnZXRWaW1TdGF0ZSAnc2FtcGxlLmNvZmZlZScsICh2aW1TdGF0ZSwgdmltKSAtPlxuICAgICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbVxuICAgIGFmdGVyRWFjaCAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG5cbiAgICBkZXNjcmliZSAnaW5uZXItaW5kZW50YXRpb24nLCAtPlxuICAgICAgaXQgJ3NlbGVjdCBsaW5lcyB3aXRoIGRlZXBlciBpbmRlbnQtbGV2ZWwnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMTIsIDBdXG4gICAgICAgIGVuc3VyZSAndiBpIGknLFxuICAgICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMTIsIDBdLCBbMTUsIDBdXVxuICAgIGRlc2NyaWJlICdhLWluZGVudGF0aW9uJywgLT5cbiAgICAgIGl0ICd3b250IHN0b3Agb24gYmxhbmsgbGluZSB3aGVuIHNlbGVjdGluZyBpbmRlbnQnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMTIsIDBdXG4gICAgICAgIGVuc3VyZSAndiBhIGknLFxuICAgICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMTAsIDBdLCBbMjcsIDBdXVxuXG4gIGRlc2NyaWJlICdGb2xkJywgLT5cbiAgICByYW5nZUZvclJvd3MgPSAoc3RhcnRSb3csIGVuZFJvdykgLT5cbiAgICAgIFtbc3RhcnRSb3csIDBdLCBbZW5kUm93ICsgMSwgMF1dXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuICAgICAgZ2V0VmltU3RhdGUgJ3NhbXBsZS5jb2ZmZWUnLCAodmltU3RhdGUsIHZpbSkgLT5cbiAgICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSB2aW1cbiAgICBhZnRlckVhY2ggLT5cbiAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuXG4gICAgZGVzY3JpYmUgJ2lubmVyLWZvbGQnLCAtPlxuICAgICAgaXQgXCJzZWxlY3QgaW5uZXIgcmFuZ2Ugb2YgZm9sZFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMTMsIDBdXG4gICAgICAgIGVuc3VyZSAndiBpIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoMTAsIDI1KVxuXG4gICAgICBpdCBcInNlbGVjdCBpbm5lciByYW5nZSBvZiBmb2xkXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxOSwgMF1cbiAgICAgICAgZW5zdXJlICd2IGkgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cygxOSwgMjMpXG5cbiAgICAgIGl0IFwiY2FuIGV4cGFuZCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIzLCAwXVxuICAgICAgICBrZXlzdHJva2UgJ3YnXG4gICAgICAgIGVuc3VyZSAnaSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDIzLCAyMylcbiAgICAgICAgZW5zdXJlICdpIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoMTksIDIzKVxuICAgICAgICBlbnN1cmUgJ2kgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cygxMCwgMjUpXG4gICAgICAgIGVuc3VyZSAnaSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDksIDI4KVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gc3RhcnRSb3cgb2Ygc2VsZWN0aW9uIGlzIG9uIGZvbGQgc3RhcnRSb3dcIiwgLT5cbiAgICAgICAgaXQgJ3NlbGVjdCBpbm5lciBmb2xkJywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMjAsIDddXG4gICAgICAgICAgZW5zdXJlICd2IGkgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cygyMSwgMjEpXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjb250YWluaW5nIGZvbGQgYXJlIG5vdCBmb3VuZFwiLCAtPlxuICAgICAgICBpdCBcImRvIG5vdGhpbmdcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMjAsIDBdXG4gICAgICAgICAgZW5zdXJlICdWIEcnLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoMjAsIDMwKVxuICAgICAgICAgIGVuc3VyZSAnaSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDIwLCAzMClcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGluZGVudCBsZXZlbCBvZiBmb2xkIHN0YXJ0Um93IGFuZCBlbmRSb3cgaXMgc2FtZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtamF2YXNjcmlwdCcpXG4gICAgICAgICAgZ2V0VmltU3RhdGUgJ3NhbXBsZS5qcycsIChzdGF0ZSwgdmltRWRpdG9yKSAtPlxuICAgICAgICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSBzdGF0ZVxuICAgICAgICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltRWRpdG9yXG4gICAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKVxuXG4gICAgICAgIGl0IFwiZG9lc24ndCBzZWxlY3QgZm9sZCBlbmRSb3dcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbNSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ3YgaSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDUsIDYpXG4gICAgICAgICAgZW5zdXJlICdhIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoNCwgNylcblxuICAgIGRlc2NyaWJlICdhLWZvbGQnLCAtPlxuICAgICAgaXQgJ3NlbGVjdCBmb2xkIHJvdyByYW5nZScsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxMywgMF1cbiAgICAgICAgZW5zdXJlICd2IGEgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cyg5LCAyNSlcblxuICAgICAgaXQgJ3NlbGVjdCBmb2xkIHJvdyByYW5nZScsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxOSwgMF1cbiAgICAgICAgZW5zdXJlICd2IGEgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cygxOCwgMjMpXG5cbiAgICAgIGl0ICdjYW4gZXhwYW5kIHNlbGVjdGlvbicsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyMywgMF1cbiAgICAgICAga2V5c3Ryb2tlICd2J1xuICAgICAgICBlbnN1cmUgJ2EgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cygyMiwgMjMpXG4gICAgICAgIGVuc3VyZSAnYSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDE4LCAyMylcbiAgICAgICAgZW5zdXJlICdhIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoOSwgMjUpXG4gICAgICAgIGVuc3VyZSAnYSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDgsIDI4KVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gc3RhcnRSb3cgb2Ygc2VsZWN0aW9uIGlzIG9uIGZvbGQgc3RhcnRSb3dcIiwgLT5cbiAgICAgICAgaXQgJ3NlbGVjdCBmb2xkIHN0YXJ0aW5nIGZyb20gY3VycmVudCByb3cnLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyMCwgN11cbiAgICAgICAgICBlbnN1cmUgJ3YgYSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDIwLCAyMSlcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGNvbnRhaW5pbmcgZm9sZCBhcmUgbm90IGZvdW5kXCIsIC0+XG4gICAgICAgIGl0IFwiZG8gbm90aGluZ1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ1YgRycsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cygyMCwgMzApXG4gICAgICAgICAgZW5zdXJlICdhIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoMjAsIDMwKVxuXG4gICMgQWx0aG91Z2ggZm9sbG93aW5nIHRlc3QgcGlja3Mgc3BlY2lmaWMgbGFuZ3VhZ2UsIG90aGVyIGxhbmdhdWFnZXMgYXJlIGFsc29lIHN1cHBvcnRlZC5cbiAgZGVzY3JpYmUgJ0Z1bmN0aW9uJywgLT5cbiAgICBkZXNjcmliZSAnY29mZmVlJywgLT5cbiAgICAgIHBhY2sgPSAnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCdcbiAgICAgIHNjb3BlID0gJ3NvdXJjZS5jb2ZmZWUnXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAjIENvbW1tZW50XG5cbiAgICAgICAgICAgIGhlbGxvID0gLT5cbiAgICAgICAgICAgICAgYSA9IDFcbiAgICAgICAgICAgICAgYiA9IDJcbiAgICAgICAgICAgICAgYyA9IDNcblxuICAgICAgICAgICAgIyBDb21tbWVudFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMywgMF1cblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZShzY29wZSlcbiAgICAgICAgICBlZGl0b3Iuc2V0R3JhbW1hcihncmFtbWFyKVxuICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UocGFjaylcblxuICAgICAgZGVzY3JpYmUgJ2lubmVyLWZ1bmN0aW9uIGZvciBjb2ZmZWUnLCAtPlxuICAgICAgICBpdCAnc2VsZWN0IGV4Y2VwdCBzdGFydCByb3cnLCAtPlxuICAgICAgICAgIGVuc3VyZSAndiBpIGYnLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzMsIDBdLCBbNiwgMF1dXG5cbiAgICAgIGRlc2NyaWJlICdhLWZ1bmN0aW9uIGZvciBjb2ZmZWUnLCAtPlxuICAgICAgICBpdCAnc2VsZWN0IGZ1bmN0aW9uJywgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YgYSBmJywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1syLCAwXSwgWzYsIDBdXVxuXG4gICAgZGVzY3JpYmUgJ3J1YnknLCAtPlxuICAgICAgcGFjayA9ICdsYW5ndWFnZS1ydWJ5J1xuICAgICAgc2NvcGUgPSAnc291cmNlLnJ1YnknXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKHBhY2spXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgIyBDb21tbWVudFxuXG4gICAgICAgICAgICBkZWYgaGVsbG9cbiAgICAgICAgICAgICAgYSA9IDFcbiAgICAgICAgICAgICAgYiA9IDJcbiAgICAgICAgICAgICAgYyA9IDNcbiAgICAgICAgICAgIGVuZFxuXG4gICAgICAgICAgICAjIENvbW1tZW50XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFszLCAwXVxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZShzY29wZSlcbiAgICAgICAgICBlZGl0b3Iuc2V0R3JhbW1hcihncmFtbWFyKVxuICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UocGFjaylcblxuICAgICAgZGVzY3JpYmUgJ2lubmVyLWZ1bmN0aW9uIGZvciBydWJ5JywgLT5cbiAgICAgICAgaXQgJ3NlbGVjdCBleGNlcHQgc3RhcnQgcm93JywgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YgaSBmJywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1szLCAwXSwgWzYsIDBdXVxuICAgICAgZGVzY3JpYmUgJ2EtZnVuY3Rpb24gZm9yIHJ1YnknLCAtPlxuICAgICAgICBpdCAnc2VsZWN0IGZ1bmN0aW9uJywgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YgYSBmJywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1syLCAwXSwgWzcsIDBdXVxuXG4gICAgZGVzY3JpYmUgJ2dvJywgLT5cbiAgICAgIHBhY2sgPSAnbGFuZ3VhZ2UtZ28nXG4gICAgICBzY29wZSA9ICdzb3VyY2UuZ28nXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKHBhY2spXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgLy8gQ29tbW1lbnRcblxuICAgICAgICAgICAgZnVuYyBtYWluKCkge1xuICAgICAgICAgICAgICBhIDo9IDFcbiAgICAgICAgICAgICAgYiA6PSAyXG4gICAgICAgICAgICAgIGMgOj0gM1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDb21tbWVudFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoc2NvcGUpXG4gICAgICAgICAgZWRpdG9yLnNldEdyYW1tYXIoZ3JhbW1hcilcbiAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICAgIGRlc2NyaWJlICdpbm5lci1mdW5jdGlvbiBmb3IgZ28nLCAtPlxuICAgICAgICBpdCAnc2VsZWN0IGV4Y2VwdCBzdGFydCByb3cnLCAtPlxuICAgICAgICAgIGVuc3VyZSAndiBpIGYnLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzMsIDBdLCBbNiwgMF1dXG5cbiAgICAgIGRlc2NyaWJlICdhLWZ1bmN0aW9uIGZvciBnbycsIC0+XG4gICAgICAgIGl0ICdzZWxlY3QgZnVuY3Rpb24nLCAtPlxuICAgICAgICAgIGVuc3VyZSAndiBhIGYnLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzIsIDBdLCBbNywgMF1dXG5cbiAgZGVzY3JpYmUgJ0N1cnJlbnRMaW5lJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgVGhpcyBpc1xuICAgICAgICAgICAgbXVsdGkgbGluZVxuICAgICAgICAgIHRleHRcbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlICdpbm5lci1jdXJyZW50LWxpbmUnLCAtPlxuICAgICAgaXQgJ3NlbGVjdCBjdXJyZW50IGxpbmUgd2l0aG91dCBpbmNsdWRpbmcgbGFzdCBuZXdsaW5lJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAndiBpIGwnLCBzZWxlY3RlZFRleHQ6ICdUaGlzIGlzJ1xuICAgICAgaXQgJ2Fsc28gc2tpcCBsZWFkaW5nIHdoaXRlIHNwYWNlJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAndiBpIGwnLCBzZWxlY3RlZFRleHQ6ICdtdWx0aSBsaW5lJ1xuICAgIGRlc2NyaWJlICdhLWN1cnJlbnQtbGluZScsIC0+XG4gICAgICBpdCAnc2VsZWN0IGN1cnJlbnQgbGluZSB3aXRob3V0IGluY2x1ZGluZyBsYXN0IG5ld2xpbmUgYXMgbGlrZSBgdmlsYCcsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ3YgYSBsJywgc2VsZWN0ZWRUZXh0OiAnVGhpcyBpcydcbiAgICAgIGl0ICd3b250IHNraXAgbGVhZGluZyB3aGl0ZSBzcGFjZSBub3QgbGlrZSBgdmlsYCcsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJ3YgYSBsJywgc2VsZWN0ZWRUZXh0OiAnICBtdWx0aSBsaW5lJ1xuXG4gIGRlc2NyaWJlICdBcmd1bWVudHMnLCAtPlxuICAgIGRlc2NyaWJlICdhdXRvLWRldGVjdCBpbm5lci1wYWlyIHRhcmdldCcsIC0+XG4gICAgICBkZXNjcmliZSAnaW5uZXItcGFpciBpcyBjb21tYSBzZXBhcmF0ZWQnLCAtPlxuICAgICAgICBpdCBcInRhcmdldCBpbm5lci1wYXJlbiBieSBhdXRvLWRldGVjdFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIoMXxzdCwgMm5kKVwiOyBlbnN1cmUgJ2QgaSAsJywgdGV4dEM6IFwiKHwsIDJuZClcIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIoMXxzdCwgMm5kKVwiOyBlbnN1cmUgJ2QgYSAsJywgdGV4dEM6IFwiKHwybmQpXCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiKDFzdCwgMnxuZClcIjsgZW5zdXJlICdkIGkgLCcsIHRleHRDOiBcIigxc3QsIHwpXCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiKDFzdCwgMnxuZClcIjsgZW5zdXJlICdkIGEgLCcsIHRleHRDOiBcIigxc3R8KVwiXG4gICAgICAgIGl0IFwidGFyZ2V0IGlubmVyLWN1cmx5LWJyYWNrZXQgYnkgYXV0by1kZXRlY3RcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiezF8c3QsIDJuZH1cIjsgZW5zdXJlICdkIGkgLCcsIHRleHRDOiBcInt8LCAybmR9XCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiezF8c3QsIDJuZH1cIjsgZW5zdXJlICdkIGEgLCcsIHRleHRDOiBcInt8Mm5kfVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcInsxc3QsIDJ8bmR9XCI7IGVuc3VyZSAnZCBpICwnLCB0ZXh0QzogXCJ7MXN0LCB8fVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcInsxc3QsIDJ8bmR9XCI7IGVuc3VyZSAnZCBhICwnLCB0ZXh0QzogXCJ7MXN0fH1cIlxuICAgICAgICBpdCBcInRhcmdldCBpbm5lci1zcXVhcmUtYnJhY2tldCBieSBhdXRvLWRldGVjdFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJbMXxzdCwgMm5kXVwiOyBlbnN1cmUgJ2QgaSAsJywgdGV4dEM6IFwiW3wsIDJuZF1cIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJbMXxzdCwgMm5kXVwiOyBlbnN1cmUgJ2QgYSAsJywgdGV4dEM6IFwiW3wybmRdXCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiWzFzdCwgMnxuZF1cIjsgZW5zdXJlICdkIGkgLCcsIHRleHRDOiBcIlsxc3QsIHxdXCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiWzFzdCwgMnxuZF1cIjsgZW5zdXJlICdkIGEgLCcsIHRleHRDOiBcIlsxc3R8XVwiXG4gICAgICBkZXNjcmliZSAnaW5uZXItcGFpciBpcyBzcGFjZSBzZXBhcmF0ZWQnLCAtPlxuICAgICAgICBpdCBcInRhcmdldCBpbm5lci1wYXJlbiBieSBhdXRvLWRldGVjdFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIoMXxzdCAybmQpXCI7IGVuc3VyZSAnZCBpICwnLCB0ZXh0QzogXCIofCAybmQpXCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiKDF8c3QgMm5kKVwiOyBlbnN1cmUgJ2QgYSAsJywgdGV4dEM6IFwiKHwybmQpXCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiKDFzdCAyfG5kKVwiOyBlbnN1cmUgJ2QgaSAsJywgdGV4dEM6IFwiKDFzdCB8KVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcIigxc3QgMnxuZClcIjsgZW5zdXJlICdkIGEgLCcsIHRleHRDOiBcIigxc3R8KVwiXG4gICAgICAgIGl0IFwidGFyZ2V0IGlubmVyLWN1cmx5LWJyYWNrZXQgYnkgYXV0by1kZXRlY3RcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiezF8c3QgMm5kfVwiOyBlbnN1cmUgJ2QgaSAsJywgdGV4dEM6IFwie3wgMm5kfVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcInsxfHN0IDJuZH1cIjsgZW5zdXJlICdkIGEgLCcsIHRleHRDOiBcInt8Mm5kfVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcInsxc3QgMnxuZH1cIjsgZW5zdXJlICdkIGkgLCcsIHRleHRDOiBcInsxc3QgfH1cIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ7MXN0IDJ8bmR9XCI7IGVuc3VyZSAnZCBhICwnLCB0ZXh0QzogXCJ7MXN0fH1cIlxuICAgICAgICBpdCBcInRhcmdldCBpbm5lci1zcXVhcmUtYnJhY2tldCBieSBhdXRvLWRldGVjdFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJbMXxzdCAybmRdXCI7IGVuc3VyZSAnZCBpICwnLCB0ZXh0QzogXCJbfCAybmRdXCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiWzF8c3QgMm5kXVwiOyBlbnN1cmUgJ2QgYSAsJywgdGV4dEM6IFwiW3wybmRdXCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiWzFzdCAyfG5kXVwiOyBlbnN1cmUgJ2QgaSAsJywgdGV4dEM6IFwiWzFzdCB8XVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcIlsxc3QgMnxuZF1cIjsgZW5zdXJlICdkIGEgLCcsIHRleHRDOiBcIlsxc3R8XVwiXG4gICAgZGVzY3JpYmUgXCJbZmFsbGJhY2tdIHdoZW4gYXV0by1kZXRlY3QgZmFpbGVkLCB0YXJnZXQgY3VycmVudC1saW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGlmIGhlbGxvKHdvcmxkKSBhbmQgZ29vZChieWUpIHtcbiAgICAgICAgICAgIDFzdDtcbiAgICAgICAgICAgIDJuZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiZGVsZXRlIDFzdCBlbGVtIG9mIGlubmVyLWN1cmx5LWJyYWNrZXQgd2hlbiBhdXRvLWRldGVjdCBzdWNjZWVkZWRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSAnZCBhICwnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBpZiBoZWxsbyh3b3JsZCkgYW5kIGdvb2QoYnllKSB7XG4gICAgICAgICAgICB8Mm5kO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiZGVsZXRlIDJzdCBlbGVtIG9mIGlubmVyLWN1cmx5LWJyYWNrZXQgd2hlbiBhdXRvLWRldGVjdCBzdWNjZWVkZWRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDNdXG4gICAgICAgIGVuc3VyZSAnZCBhICwnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBpZiBoZWxsbyh3b3JsZCkgYW5kIGdvb2QoYnllKSB7XG4gICAgICAgICAgICAxc3R8O1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiZGVsZXRlIDFzdCBlbGVtIG9mIGN1cnJlbnQtbGluZSB3aGVuIGF1dG8tZGV0ZWN0IGZhaWxlZFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdkIGEgLCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHxoZWxsbyh3b3JsZCkgYW5kIGdvb2QoYnllKSB7XG4gICAgICAgICAgICAxc3Q7XG4gICAgICAgICAgICAybmQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJkZWxldGUgMm5kIGVsZW0gb2YgY3VycmVudC1saW5lIHdoZW4gYXV0by1kZXRlY3QgZmFpbGVkXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICBlbnN1cmUgJ2QgYSAsJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgaWYgfGFuZCBnb29kKGJ5ZSkge1xuICAgICAgICAgICAgMXN0O1xuICAgICAgICAgICAgMm5kO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiZGVsZXRlIDNyZCBlbGVtIG9mIGN1cnJlbnQtbGluZSB3aGVuIGF1dG8tZGV0ZWN0IGZhaWxlZFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTZdXG4gICAgICAgIGVuc3VyZSAnZCBhICwnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBpZiBoZWxsbyh3b3JsZCkgfGdvb2QoYnllKSB7XG4gICAgICAgICAgICAxc3Q7XG4gICAgICAgICAgICAybmQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJkZWxldGUgNHRoIGVsZW0gb2YgY3VycmVudC1saW5lIHdoZW4gYXV0by1kZXRlY3QgZmFpbGVkXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyMF1cbiAgICAgICAgZW5zdXJlICdkIGEgLCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGlmIGhlbGxvKHdvcmxkKSBhbmQgfHtcbiAgICAgICAgICAgIDFzdDtcbiAgICAgICAgICAgIDJuZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSAnc2xpbmdsZSBsaW5lIGNvbW1hIHNlcGFyYXRlZCB0ZXh0JywgLT5cbiAgICAgIGRlc2NyaWJlIFwiY2hhbmdlIDFzdCBhcmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiAgICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZnxpcnN0KDEsIDIsIDMpLCBzZWNvbmQoKSwgMylcIlxuICAgICAgICBpdCAnY2hhbmdlJywgLT4gZW5zdXJlICdjIGkgLCcsIHRleHRDOiBcInZhciBhID0gZnVuYyh8LCBzZWNvbmQoKSwgMylcIlxuICAgICAgICBpdCAnY2hhbmdlJywgLT4gZW5zdXJlICdjIGEgLCcsIHRleHRDOiBcInZhciBhID0gZnVuYyh8c2Vjb25kKCksIDMpXCJcblxuICAgICAgZGVzY3JpYmUgJ2NoYW5nZSAybmQgYXJnJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiAgICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZmlyc3QoMSwgMiwgMyksfCBzZWNvbmQoKSwgMylcIlxuICAgICAgICBpdCAnY2hhbmdlJywgLT4gZW5zdXJlICdjIGkgLCcsIHRleHRDOiBcInZhciBhID0gZnVuYyhmaXJzdCgxLCAyLCAzKSwgfCwgMylcIlxuICAgICAgICBpdCAnY2hhbmdlJywgLT4gZW5zdXJlICdjIGEgLCcsIHRleHRDOiBcInZhciBhID0gZnVuYyhmaXJzdCgxLCAyLCAzKSwgfDMpXCJcblxuICAgICAgZGVzY3JpYmUgJ2NoYW5nZSAzcmQgYXJnJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiAgICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZmlyc3QoMSwgMiwgMyksIHNlY29uZCgpLHwgMylcIlxuICAgICAgICBpdCAnY2hhbmdlJywgLT4gZW5zdXJlICdjIGkgLCcsIHRleHRDOiBcInZhciBhID0gZnVuYyhmaXJzdCgxLCAyLCAzKSwgc2Vjb25kKCksIHwpXCJcbiAgICAgICAgaXQgJ2NoYW5nZScsIC0+IGVuc3VyZSAnYyBhICwnLCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZmlyc3QoMSwgMiwgMyksIHNlY29uZCgpfClcIlxuXG4gICAgICBkZXNjcmliZSAnd2hlbiBjdXJzb3IgaXMgb24tY29tbWEtc2VwYXJhdG9yLCBpdCBhZmZlY3RzIHByZWNlZWRpbmcgYXJnJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiAgICAgICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZpcnN0KDEsIDIsIDMpfCwgc2Vjb25kKCksIDMpXCJcbiAgICAgICAgaXQgJ2NoYW5nZSAxc3QnLCAtPiBlbnN1cmUgJ2MgaSAsJywgdGV4dEM6IFwidmFyIGEgPSBmdW5jKHwsIHNlY29uZCgpLCAzKVwiXG4gICAgICAgIGl0ICdjaGFuZ2UgMXN0JywgLT4gZW5zdXJlICdjIGEgLCcsIHRleHRDOiBcInZhciBhID0gZnVuYyh8c2Vjb25kKCksIDMpXCJcblxuICAgICAgZGVzY3JpYmUgJ2N1cnNvci1pcy1vbi13aGl0ZS1zcGFjZSwgaXQgYWZmZWN0cyBmb2xsb3dlZCBhcmcnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+ICAgICAgICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZmlyc3QoMSwgMiwgMyksfCBzZWNvbmQoKSwgMylcIlxuICAgICAgICBpdCAnY2hhbmdlIDJuZCcsIC0+IGVuc3VyZSAnYyBpICwnLCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZmlyc3QoMSwgMiwgMyksIHwsIDMpXCJcbiAgICAgICAgaXQgJ2NoYW5nZSAybmQnLCAtPiBlbnN1cmUgJ2MgYSAsJywgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZpcnN0KDEsIDIsIDMpLCB8MylcIlxuXG4gICAgICBkZXNjcmliZSBcImN1cnNvci1pcy1vbi1wYXJlaHRoZXNpcywgaXQgd29udCB0YXJnZXQgaW5uZXItcGFyZW50XCIsIC0+XG4gICAgICAgIGl0ICdjaGFuZ2UgMXN0IG9mIG91dGVyLXBhcmVuJywgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZpcnN0fCgxLCAyLCAzKSwgc2Vjb25kKCksIDMpXCJcbiAgICAgICAgICBlbnN1cmUgJ2MgaSAsJywgdGV4dEM6IFwidmFyIGEgPSBmdW5jKHwsIHNlY29uZCgpLCAzKVwiXG4gICAgICAgIGl0ICdjaGFuZ2UgM3JkIG9mIG91dGVyLXBhcmVuJywgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZpcnN0KDEsIDIsIDN8KSwgc2Vjb25kKCksIDMpXCJcbiAgICAgICAgICBlbnN1cmUgJ2MgaSAsJywgdGV4dEM6IFwidmFyIGEgPSBmdW5jKHwsIHNlY29uZCgpLCAzKVwiXG5cbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yLWlzLW5leHQtb3ItYmVmb3JlIHBhcmVodGhlc2lzLCBpdCB0YXJnZXQgaW5uZXItcGFyZW50XCIsIC0+XG4gICAgICAgIGl0ICdjaGFuZ2UgMXN0IG9mIGlubmVyLXBhcmVuJywgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZpcnN0KHwxLCAyLCAzKSwgc2Vjb25kKCksIDMpXCJcbiAgICAgICAgICBlbnN1cmUgJ2MgaSAsJywgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZpcnN0KHwsIDIsIDMpLCBzZWNvbmQoKSwgMylcIlxuICAgICAgICBpdCAnY2hhbmdlIDNyZCBvZiBpbm5lci1wYXJlbicsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcInZhciBhID0gZnVuYyhmaXJzdCgxLCAyLCB8MyksIHNlY29uZCgpLCAzKVwiXG4gICAgICAgICAgZW5zdXJlICdjIGkgLCcsIHRleHRDOiBcInZhciBhID0gZnVuYyhmaXJzdCgxLCAyLCB8KSwgc2Vjb25kKCksIDMpXCJcblxuICAgIGRlc2NyaWJlICdzbGluZ2xlIGxpbmUgc3BhY2Ugc2VwYXJhdGVkIHRleHQnLCAtPlxuICAgICAgZGVzY3JpYmUgXCJjaGFuZ2UgMXN0IGFyZ1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+ICAgICAgICAgICAgICAgc2V0IHRleHRDOiBcIiV3KHwxc3QgMm5kIDNyZClcIlxuICAgICAgICBpdCAnY2hhbmdlJywgLT4gZW5zdXJlICdjIGkgLCcsIHRleHRDOiBcIiV3KHwgMm5kIDNyZClcIlxuICAgICAgICBpdCAnY2hhbmdlJywgLT4gZW5zdXJlICdjIGEgLCcsIHRleHRDOiBcIiV3KHwybmQgM3JkKVwiXG4gICAgICBkZXNjcmliZSBcImNoYW5nZSAybmQgYXJnXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwiJXcoMXN0IHwybmQgM3JkKVwiXG4gICAgICAgIGl0ICdjaGFuZ2UnLCAtPiBlbnN1cmUgJ2MgaSAsJywgdGV4dEM6IFwiJXcoMXN0IHwgM3JkKVwiXG4gICAgICAgIGl0ICdjaGFuZ2UnLCAtPiBlbnN1cmUgJ2MgYSAsJywgdGV4dEM6IFwiJXcoMXN0IHwzcmQpXCJcbiAgICAgIGRlc2NyaWJlIFwiY2hhbmdlIDJuZCBhcmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiAgICAgICAgICAgICAgIHNldCB0ZXh0QzogXCIldygxc3QgMm5kIHwzcmQpXCJcbiAgICAgICAgaXQgJ2NoYW5nZScsIC0+IGVuc3VyZSAnYyBpICwnLCB0ZXh0QzogXCIldygxc3QgMm5kIHwpXCJcbiAgICAgICAgaXQgJ2NoYW5nZScsIC0+IGVuc3VyZSAnYyBhICwnLCB0ZXh0QzogXCIldygxc3QgMm5kfClcIlxuXG4gICAgZGVzY3JpYmUgJ211bHRpIGxpbmUgY29tbWEgc2VwYXJhdGVkIHRleHQnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIFtcbiAgICAgICAgICAgIFwiMXN0IGVsZW0gaXMgc3RyaW5nXCIsXG4gICAgICAgICAgICAoKSA9PiBoZWxsbygnMm5kIGVsbSBpcyBmdW5jdGlvbicpLFxuICAgICAgICAgICAgM3JkRWxtSGFzVHJhaWxpbmdDb21tYSxcbiAgICAgICAgICBdXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcImNoYW5nZSAxc3QgYXJnXCIsIC0+XG4gICAgICAgIGl0ICdjaGFuZ2UgMXN0IGlubmVyLWFyZycsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdjIGkgLCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIHwsXG4gICAgICAgICAgICAgICgpID0+IGhlbGxvKCcybmQgZWxtIGlzIGZ1bmN0aW9uJyksXG4gICAgICAgICAgICAgIDNyZEVsbUhhc1RyYWlsaW5nQ29tbWEsXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgJ2NoYW5nZSAxc3QgYS1hcmcnLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnYyBhICwnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICB8KCkgPT4gaGVsbG8oJzJuZCBlbG0gaXMgZnVuY3Rpb24nKSxcbiAgICAgICAgICAgICAgM3JkRWxtSGFzVHJhaWxpbmdDb21tYSxcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnY2hhbmdlIDJuZCBpbm5lci1hcmcnLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgIGVuc3VyZSAnYyBpICwnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICBcIjFzdCBlbGVtIGlzIHN0cmluZ1wiLFxuICAgICAgICAgICAgICB8LFxuICAgICAgICAgICAgICAzcmRFbG1IYXNUcmFpbGluZ0NvbW1hLFxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0ICdjaGFuZ2UgMm5kIGEtYXJnJywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2MgYSAsJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgXCIxc3QgZWxlbSBpcyBzdHJpbmdcIixcbiAgICAgICAgICAgICAgfDNyZEVsbUhhc1RyYWlsaW5nQ29tbWEsXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgJ2NoYW5nZSAzcmQgaW5uZXItYXJnJywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgICBlbnN1cmUgJ2MgaSAsJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgXCIxc3QgZWxlbSBpcyBzdHJpbmdcIixcbiAgICAgICAgICAgICAgKCkgPT4gaGVsbG8oJzJuZCBlbG0gaXMgZnVuY3Rpb24nKSxcbiAgICAgICAgICAgICAgfCxcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnY2hhbmdlIDNyZCBhLWFyZycsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzMsIDBdXG4gICAgICAgICAgZW5zdXJlICdjIGEgLCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIFwiMXN0IGVsZW0gaXMgc3RyaW5nXCIsXG4gICAgICAgICAgICAgICgpID0+IGhlbGxvKCcybmQgZWxtIGlzIGZ1bmN0aW9uJyl8LFxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSAnd2hlbiBpdCBjb3VkbnQgZmluZCBpbm5lci1wYWlyIGZyb20gY3Vyc29yIGl0IHRhcmdldCBjdXJyZW50LWxpbmUnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIGlmIHxpc01vcm5pbmcodGltZSwgb2YsIHRoZSwgZGF5KSB7XG4gICAgICAgICAgICBoZWxsbG8oXCJ3b3JsZFwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImNoYW5nZSBpbm5lci1hcmdcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiYyBpICxcIixcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIGlmIHwge1xuICAgICAgICAgICAgaGVsbGxvKFwid29ybGRcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJjaGFuZ2UgYS1hcmdcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiYyBhICxcIixcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIGlmIHx7XG4gICAgICAgICAgICBoZWxsbG8oXCJ3b3JsZFwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgJ0VudGlyZScsIC0+XG4gICAgdGV4dCA9IFwiXCJcIlxuICAgICAgVGhpcyBpc1xuICAgICAgICBtdWx0aSBsaW5lXG4gICAgICB0ZXh0XG4gICAgICBcIlwiXCJcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogdGV4dCwgY3Vyc29yOiBbMCwgMF1cbiAgICBkZXNjcmliZSAnaW5uZXItZW50aXJlJywgLT5cbiAgICAgIGl0ICdzZWxlY3QgZW50aXJlIGJ1ZmZlcicsIC0+XG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgc2VsZWN0ZWRUZXh0OiAnJ1xuICAgICAgICBlbnN1cmUgJ3YgaSBlJywgc2VsZWN0ZWRUZXh0OiB0ZXh0XG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgc2VsZWN0ZWRUZXh0OiAnJ1xuICAgICAgICBlbnN1cmUgJ2ogaiB2IGkgZScsIHNlbGVjdGVkVGV4dDogdGV4dFxuICAgIGRlc2NyaWJlICdhLWVudGlyZScsIC0+XG4gICAgICBpdCAnc2VsZWN0IGVudGlyZSBidWZmZXInLCAtPlxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHNlbGVjdGVkVGV4dDogJydcbiAgICAgICAgZW5zdXJlICd2IGEgZScsIHNlbGVjdGVkVGV4dDogdGV4dFxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHNlbGVjdGVkVGV4dDogJydcbiAgICAgICAgZW5zdXJlICdqIGogdiBhIGUnLCBzZWxlY3RlZFRleHQ6IHRleHRcblxuICBkZXNjcmliZSAnU2VhcmNoTWF0Y2hGb3J3YXJkLCBTZWFyY2hCYWNrd2FyZHMnLCAtPlxuICAgIHRleHQgPSBcIlwiXCJcbiAgICAgIDAgeHh4XG4gICAgICAxIGFiYyB4eHhcbiAgICAgIDIgICB4eHggeXl5XG4gICAgICAzIHh4eCBhYmNcbiAgICAgIDQgYWJjXFxuXG4gICAgICBcIlwiXCJcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSkpXG5cbiAgICAgIHNldCB0ZXh0OiB0ZXh0LCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlIFsnLycsIHNlYXJjaDogJ2FiYyddLCBjdXJzb3I6IFsxLCAyXSwgbW9kZTogJ25vcm1hbCdcbiAgICAgIGV4cGVjdCh2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoJ2xhc3RTZWFyY2hQYXR0ZXJuJykpLnRvRXF1YWwgL2FiYy9nXG5cbiAgICBkZXNjcmliZSAnZ24gZnJvbSBub3JtYWwgbW9kZScsIC0+XG4gICAgICBpdCAnc2VsZWN0IHJhbmdlcyBtYXRjaGVzIHRvIGxhc3Qgc2VhcmNoIHBhdHRlcm4gYW5kIGV4dGVuZCBzZWxlY3Rpb24nLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgbicsXG4gICAgICAgICAgY3Vyc29yOiBbMSwgNV1cbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBzZWxlY3Rpb25Jc1JldmVyc2VkOiBmYWxzZVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogJ2FiYydcbiAgICAgICAgZW5zdXJlICdnIG4nLFxuICAgICAgICAgIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IGZhbHNlXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFiYyB4eHhcbiAgICAgICAgICAgIDIgICB4eHggeXl5XG4gICAgICAgICAgICAzIHh4eCBhYmNcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2cgbicsXG4gICAgICAgICAgc2VsZWN0aW9uSXNSZXZlcnNlZDogZmFsc2VcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjIHh4eFxuICAgICAgICAgICAgMiAgIHh4eCB5eXlcbiAgICAgICAgICAgIDMgeHh4IGFiY1xuICAgICAgICAgICAgNCBhYmNcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2cgbicsICMgRG8gbm90aGluZ1xuICAgICAgICAgIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IGZhbHNlXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFiYyB4eHhcbiAgICAgICAgICAgIDIgICB4eHggeXl5XG4gICAgICAgICAgICAzIHh4eCBhYmNcbiAgICAgICAgICAgIDQgYWJjXG4gICAgICAgICAgICBcIlwiXCJcbiAgICBkZXNjcmliZSAnZ04gZnJvbSBub3JtYWwgbW9kZScsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCAzXVxuICAgICAgaXQgJ3NlbGVjdCByYW5nZXMgbWF0Y2hlcyB0byBsYXN0IHNlYXJjaCBwYXR0ZXJuIGFuZCBleHRlbmQgc2VsZWN0aW9uJywgLT5cbiAgICAgICAgZW5zdXJlICdnIE4nLFxuICAgICAgICAgIGN1cnNvcjogWzQsIDJdXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgc2VsZWN0aW9uSXNSZXZlcnNlZDogdHJ1ZVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogJ2FiYydcbiAgICAgICAgZW5zdXJlICdnIE4nLFxuICAgICAgICAgIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IHRydWVcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICA0IGFiY1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnZyBOJyxcbiAgICAgICAgICBzZWxlY3Rpb25Jc1JldmVyc2VkOiB0cnVlXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFiYyB4eHhcbiAgICAgICAgICAgIDIgICB4eHggeXl5XG4gICAgICAgICAgICAzIHh4eCBhYmNcbiAgICAgICAgICAgIDQgYWJjXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdnIE4nLCAjIERvIG5vdGhpbmdcbiAgICAgICAgICBzZWxlY3Rpb25Jc1JldmVyc2VkOiB0cnVlXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFiYyB4eHhcbiAgICAgICAgICAgIDIgICB4eHggeXl5XG4gICAgICAgICAgICAzIHh4eCBhYmNcbiAgICAgICAgICAgIDQgYWJjXG4gICAgICAgICAgICBcIlwiXCJcbiAgICBkZXNjcmliZSAnYXMgb3BlcmF0b3IgdGFyZ2V0JywgLT5cbiAgICAgIGl0ICdkZWxldGUgbmV4dCBvY2N1cnJlbmNlIG9mIGxhc3Qgc2VhcmNoIHBhdHRlcm4nLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgZyBuJyxcbiAgICAgICAgICBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwIHh4eFxuICAgICAgICAgICAgMSAgeHh4XG4gICAgICAgICAgICAyICAgeHh4IHl5eVxuICAgICAgICAgICAgMyB4eHggYWJjXG4gICAgICAgICAgICA0IGFiY1xcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgY3Vyc29yOiBbMywgNV1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIDAgeHh4XG4gICAgICAgICAgICAxICB4eHhcbiAgICAgICAgICAgIDIgICB4eHggeXl5XG4gICAgICAgICAgICAzIHh4eF9cbiAgICAgICAgICAgIDQgYWJjXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICBjdXJzb3I6IFs0LCAxXVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgMCB4eHhcbiAgICAgICAgICAgIDEgIHh4eFxuICAgICAgICAgICAgMiAgIHh4eCB5eXlcbiAgICAgICAgICAgIDMgeHh4X1xuICAgICAgICAgICAgNCBcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgJ2NoYW5nZSBuZXh0IG9jY3VycmVuY2Ugb2YgbGFzdCBzZWFyY2ggcGF0dGVybicsIC0+XG4gICAgICAgIGVuc3VyZSAnYyBnIG4nLFxuICAgICAgICAgIGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAgeHh4XG4gICAgICAgICAgICAxICB4eHhcbiAgICAgICAgICAgIDIgICB4eHggeXl5XG4gICAgICAgICAgICAzIHh4eCBhYmNcbiAgICAgICAgICAgIDQgYWJjXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAga2V5c3Ryb2tlICdlc2NhcGUnXG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCAwXVxuICAgICAgICBlbnN1cmUgJ2MgZyBOJyxcbiAgICAgICAgICBjdXJzb3I6IFszLCA2XVxuICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgMCB4eHhcbiAgICAgICAgICAgIDEgIHh4eFxuICAgICAgICAgICAgMiAgIHh4eCB5eXlcbiAgICAgICAgICAgIDMgeHh4X1xuICAgICAgICAgICAgNCBhYmNcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuIl19
