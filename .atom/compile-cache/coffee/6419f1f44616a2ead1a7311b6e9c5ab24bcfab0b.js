(function() {
  var dispatch, getVimState, inspect, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch;

  settings = require('../lib/settings');

  inspect = require('util').inspect;

  describe("Operator ActivateInsertMode family", function() {
    var bindEnsureOption, editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], bindEnsureOption = ref1[2], keystroke = ref1[3], editor = ref1[4], editorElement = ref1[5], vimState = ref1[6];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, bindEnsureOption = vim.bindEnsureOption, vim;
      });
    });
    describe("the s keybinding", function() {
      beforeEach(function() {
        return set({
          text: '012345',
          cursor: [0, 1]
        });
      });
      it("deletes the character to the right and enters insert mode", function() {
        return ensure('s', {
          mode: 'insert',
          text: '02345',
          cursor: [0, 1],
          register: {
            '"': {
              text: '1'
            }
          }
        });
      });
      it("is repeatable", function() {
        set({
          cursor: [0, 0]
        });
        keystroke('3 s');
        editor.insertText('ab');
        ensure('escape', {
          text: 'ab345'
        });
        set({
          cursor: [0, 2]
        });
        return ensure('.', {
          text: 'abab'
        });
      });
      it("is undoable", function() {
        set({
          cursor: [0, 0]
        });
        keystroke('3 s');
        editor.insertText('ab');
        ensure('escape', {
          text: 'ab345'
        });
        return ensure('u', {
          text: '012345',
          selectedText: ''
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          return keystroke('v l s');
        });
        return it("deletes the selected characters and enters insert mode", function() {
          return ensure({
            mode: 'insert',
            text: '0345',
            cursor: [0, 1],
            register: {
              '"': {
                text: '12'
              }
            }
          });
        });
      });
    });
    describe("the S keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE",
          cursor: [1, 3]
        });
      });
      it("deletes the entire line and enters insert mode", function() {
        return ensure('S', {
          mode: 'insert',
          text: "12345\n\nABCDE",
          register: {
            '"': {
              text: 'abcde\n',
              type: 'linewise'
            }
          }
        });
      });
      it("is repeatable", function() {
        keystroke('S');
        editor.insertText('abc');
        ensure('escape', {
          text: '12345\nabc\nABCDE'
        });
        set({
          cursor: [2, 3]
        });
        return ensure('.', {
          text: '12345\nabc\nabc'
        });
      });
      it("is undoable", function() {
        keystroke('S');
        editor.insertText('abc');
        ensure('escape', {
          text: '12345\nabc\nABCDE'
        });
        return ensure('u', {
          text: "12345\nabcde\nABCDE",
          selectedText: ''
        });
      });
      it("works when the cursor's goal column is greater than its current column", function() {
        set({
          text: "\n12345",
          cursor: [1, 2e308]
        });
        return ensure('k S', {
          text: '\n12345'
        });
      });
      return xit("respects indentation", function() {});
    });
    describe("the c keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE"
        });
      });
      describe("when followed by a c", function() {
        describe("with autoindent", function() {
          beforeEach(function() {
            set({
              text: "12345\n  abcde\nABCDE\n"
            });
            set({
              cursor: [1, 1]
            });
            spyOn(editor, 'shouldAutoIndent').andReturn(true);
            spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
              return editor.indent();
            });
            return spyOn(editor.languageMode, 'suggestedIndentForLineAtBufferRow').andCallFake(function() {
              return 1;
            });
          });
          it("deletes the current line and enters insert mode", function() {
            set({
              cursor: [1, 1]
            });
            return ensure('c c', {
              text: "12345\n  \nABCDE\n",
              cursor: [1, 2],
              mode: 'insert'
            });
          });
          it("is repeatable", function() {
            keystroke('c c');
            editor.insertText("abc");
            ensure('escape', {
              text: "12345\n  abc\nABCDE\n"
            });
            set({
              cursor: [2, 3]
            });
            return ensure('.', {
              text: "12345\n  abc\n  abc\n"
            });
          });
          return it("is undoable", function() {
            keystroke('c c');
            editor.insertText("abc");
            ensure('escape', {
              text: "12345\n  abc\nABCDE\n"
            });
            return ensure('u', {
              text: "12345\n  abcde\nABCDE\n",
              selectedText: ''
            });
          });
        });
        describe("when the cursor is on the last line", function() {
          return it("deletes the line's content and enters insert mode on the last line", function() {
            set({
              cursor: [2, 1]
            });
            return ensure('c c', {
              text: "12345\nabcde\n",
              cursor: [2, 0],
              mode: 'insert'
            });
          });
        });
        return describe("when the cursor is on the only line", function() {
          return it("deletes the line's content and enters insert mode", function() {
            set({
              text: "12345",
              cursor: [0, 2]
            });
            return ensure('c c', {
              text: "",
              cursor: [0, 0],
              mode: 'insert'
            });
          });
        });
      });
      describe("when followed by i w", function() {
        it("undo's and redo's completely", function() {
          set({
            cursor: [1, 1]
          });
          ensure('c i w', {
            text: "12345\n\nABCDE",
            cursor: [1, 0],
            mode: 'insert'
          });
          set({
            text: "12345\nfg\nABCDE"
          });
          ensure('escape', {
            text: "12345\nfg\nABCDE",
            mode: 'normal'
          });
          ensure('u', {
            text: "12345\nabcde\nABCDE"
          });
          return ensure('ctrl-r', {
            text: "12345\nfg\nABCDE"
          });
        });
        return it("repeatable", function() {
          set({
            cursor: [1, 1]
          });
          ensure('c i w', {
            text: "12345\n\nABCDE",
            cursor: [1, 0],
            mode: 'insert'
          });
          return ensure('escape j .', {
            text: "12345\n\n",
            cursor: [2, 0],
            mode: 'normal'
          });
        });
      });
      describe("when followed by a w", function() {
        return it("changes the word", function() {
          set({
            text: "word1 word2 word3",
            cursor: [0, 7]
          });
          return ensure('c w escape', {
            text: "word1 w word3"
          });
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE\n";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('c G escape', {
              text: '12345\n\n'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('c G escape', {
              text: '12345\n\n'
            });
          });
        });
      });
      return describe("when followed by a goto line G", function() {
        beforeEach(function() {
          return set({
            text: "12345\nabcde\nABCDE"
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes all the text on the line", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('c 2 G escape', {
              text: '12345\n\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes all the text on the line", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('c 2 G escape', {
              text: '12345\n\nABCDE'
            });
          });
        });
      });
    });
    describe("the C keybinding", function() {
      beforeEach(function() {
        return set({
          cursor: [1, 2],
          text: "0!!!!!!\n1!!!!!!\n2!!!!!!\n3!!!!!!\n"
        });
      });
      describe("in normal-mode", function() {
        return it("deletes till the EOL then enter insert-mode", function() {
          return ensure('C', {
            cursor: [1, 2],
            mode: 'insert',
            text: "0!!!!!!\n1!\n2!!!!!!\n3!!!!!!\n"
          });
        });
      });
      return describe("in visual-mode.characterwise", function() {
        return it("delete whole lines and enter insert-mode", function() {
          return ensure('v j C', {
            cursor: [1, 0],
            mode: 'insert',
            text: "0!!!!!!\n\n3!!!!!!\n"
          });
        });
      });
    });
    describe("dontUpdateRegisterOnChangeOrSubstitute settings", function() {
      var resultTextC;
      resultTextC = null;
      beforeEach(function() {
        set({
          register: {
            '"': {
              text: 'initial-value'
            }
          },
          textC: "0abc\n1|def\n2ghi\n"
        });
        return resultTextC = {
          cl: "0abc\n1|ef\n2ghi\n",
          C: "0abc\n1|\n2ghi\n",
          s: "0abc\n1|ef\n2ghi\n",
          S: "0abc\n|\n2ghi\n"
        };
      });
      describe("when dontUpdateRegisterOnChangeOrSubstitute=false", function() {
        var ensure_;
        ensure_ = null;
        beforeEach(function() {
          ensure_ = bindEnsureOption({
            mode: 'insert'
          });
          return settings.set("dontUpdateRegisterOnChangeOrSubstitute", false);
        });
        it('c mutate register', function() {
          return ensure_('c l', {
            textC: resultTextC.cl,
            register: {
              '"': {
                text: 'd'
              }
            }
          });
        });
        it('C mutate register', function() {
          return ensure_('C', {
            textC: resultTextC.C,
            register: {
              '"': {
                text: 'def'
              }
            }
          });
        });
        it('s mutate register', function() {
          return ensure_('s', {
            textC: resultTextC.s,
            register: {
              '"': {
                text: 'd'
              }
            }
          });
        });
        return it('S mutate register', function() {
          return ensure_('S', {
            textC: resultTextC.S,
            register: {
              '"': {
                text: '1def\n'
              }
            }
          });
        });
      });
      return describe("when dontUpdateRegisterOnChangeOrSubstitute=true", function() {
        var ensure_;
        ensure_ = null;
        beforeEach(function() {
          ensure_ = bindEnsureOption({
            mode: 'insert',
            register: {
              '"': {
                text: 'initial-value'
              }
            }
          });
          return settings.set("dontUpdateRegisterOnChangeOrSubstitute", true);
        });
        it('c mutate register', function() {
          return ensure_('c l', {
            textC: resultTextC.cl
          });
        });
        it('C mutate register', function() {
          return ensure_('C', {
            textC: resultTextC.C
          });
        });
        it('s mutate register', function() {
          return ensure_('s', {
            textC: resultTextC.s
          });
        });
        return it('S mutate register', function() {
          return ensure_('S', {
            textC: resultTextC.S
          });
        });
      });
    });
    describe("the O keybinding", function() {
      beforeEach(function() {
        spyOn(editor, 'shouldAutoIndent').andReturn(true);
        spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
          return editor.indent();
        });
        return set({
          textC_: "__abc\n_|_012\n"
        });
      });
      it("switches to insert and adds a newline above the current one", function() {
        keystroke('O');
        return ensure({
          textC_: "__abc\n__|\n__012\n",
          mode: 'insert'
        });
      });
      it("is repeatable", function() {
        set({
          textC_: "__abc\n__|012\n____4spaces\n"
        });
        keystroke('O');
        editor.insertText("def");
        ensure('escape', {
          textC_: "__abc\n__de|f\n__012\n____4spaces\n"
        });
        ensure('.', {
          textC_: "__abc\n__de|f\n__def\n__012\n____4spaces\n"
        });
        set({
          cursor: [4, 0]
        });
        return ensure('.', {
          textC_: "__abc\n__def\n__def\n__012\n____de|f\n____4spaces\n"
        });
      });
      return it("is undoable", function() {
        keystroke('O');
        editor.insertText("def");
        ensure('escape', {
          textC_: "__abc\n__def\n__012\n"
        });
        return ensure('u', {
          textC_: "__abc\n__012\n"
        });
      });
    });
    describe("the o keybinding", function() {
      beforeEach(function() {
        spyOn(editor, 'shouldAutoIndent').andReturn(true);
        spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
          return editor.indent();
        });
        return set({
          text: "abc\n  012\n",
          cursor: [1, 2]
        });
      });
      it("switches to insert and adds a newline above the current one", function() {
        return ensure('o', {
          text: "abc\n  012\n  \n",
          mode: 'insert',
          cursor: [2, 2]
        });
      });
      xit("is repeatable", function() {
        set({
          text: "  abc\n  012\n    4spaces\n",
          cursor: [1, 1]
        });
        keystroke('o');
        editor.insertText("def");
        ensure('escape', {
          text: "  abc\n  012\n  def\n    4spaces\n"
        });
        ensure('.', {
          text: "  abc\n  012\n  def\n  def\n    4spaces\n"
        });
        set({
          cursor: [4, 1]
        });
        return ensure('.', {
          text: "  abc\n  def\n  def\n  012\n    4spaces\n    def\n"
        });
      });
      return it("is undoable", function() {
        keystroke('o');
        editor.insertText("def");
        ensure('escape', {
          text: "abc\n  012\n  def\n"
        });
        return ensure('u', {
          text: "abc\n  012\n"
        });
      });
    });
    describe("undo/redo for `o` and `O`", function() {
      beforeEach(function() {
        return set({
          textC: "----|=="
        });
      });
      it("undo and redo by keeping cursor at o started position", function() {
        ensure('o', {
          mode: 'insert'
        });
        editor.insertText('@@');
        ensure("escape", {
          textC: "----==\n@|@"
        });
        ensure("u", {
          textC: "----|=="
        });
        return ensure("ctrl-r", {
          textC: "----|==\n@@"
        });
      });
      return it("undo and redo by keeping cursor at O started position", function() {
        ensure('O', {
          mode: 'insert'
        });
        editor.insertText('@@');
        ensure("escape", {
          textC: "@|@\n----=="
        });
        ensure("u", {
          textC: "----|=="
        });
        return ensure("ctrl-r", {
          textC: "@@\n----|=="
        });
      });
    });
    describe("the a keybinding", function() {
      beforeEach(function() {
        return set({
          text: "012\n"
        });
      });
      describe("at the beginning of the line", function() {
        beforeEach(function() {
          set({
            cursor: [0, 0]
          });
          return keystroke('a');
        });
        return it("switches to insert mode and shifts to the right", function() {
          return ensure({
            cursor: [0, 1],
            mode: 'insert'
          });
        });
      });
      return describe("at the end of the line", function() {
        beforeEach(function() {
          set({
            cursor: [0, 3]
          });
          return keystroke('a');
        });
        return it("doesn't linewrap", function() {
          return ensure({
            cursor: [0, 3]
          });
        });
      });
    });
    describe("the A keybinding", function() {
      beforeEach(function() {
        return set({
          text: "11\n22\n"
        });
      });
      return describe("at the beginning of a line", function() {
        it("switches to insert mode at the end of the line", function() {
          set({
            cursor: [0, 0]
          });
          return ensure('A', {
            mode: 'insert',
            cursor: [0, 2]
          });
        });
        return it("repeats always as insert at the end of the line", function() {
          set({
            cursor: [0, 0]
          });
          keystroke('A');
          editor.insertText("abc");
          keystroke('escape');
          set({
            cursor: [1, 0]
          });
          return ensure('.', {
            text: "11abc\n22abc\n",
            mode: 'normal',
            cursor: [1, 4]
          });
        });
      });
    });
    describe("the I keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "__0: 3456 890\n1: 3456 890\n__2: 3456 890\n____3: 3456 890"
        });
      });
      describe("in normal-mode", function() {
        describe("I", function() {
          return it("insert at first char of line", function() {
            set({
              cursor: [0, 5]
            });
            ensure('I', {
              cursor: [0, 2],
              mode: 'insert'
            });
            ensure("escape", {
              mode: 'normal'
            });
            set({
              cursor: [1, 5]
            });
            ensure('I', {
              cursor: [1, 0],
              mode: 'insert'
            });
            ensure("escape", {
              mode: 'normal'
            });
            set({
              cursor: [1, 0]
            });
            ensure('I', {
              cursor: [1, 0],
              mode: 'insert'
            });
            return ensure("escape", {
              mode: 'normal'
            });
          });
        });
        return describe("A", function() {
          return it("insert at end of line", function() {
            set({
              cursor: [0, 5]
            });
            ensure('A', {
              cursor: [0, 13],
              mode: 'insert'
            });
            ensure("escape", {
              mode: 'normal'
            });
            set({
              cursor: [1, 5]
            });
            ensure('A', {
              cursor: [1, 11],
              mode: 'insert'
            });
            ensure("escape", {
              mode: 'normal'
            });
            set({
              cursor: [1, 11]
            });
            ensure('A', {
              cursor: [1, 11],
              mode: 'insert'
            });
            return ensure("escape", {
              mode: 'normal'
            });
          });
        });
      });
      describe("visual-mode.linewise", function() {
        beforeEach(function() {
          set({
            cursor: [1, 3]
          });
          return ensure("V 2 j", {
            selectedText: "1: 3456 890\n  2: 3456 890\n    3: 3456 890",
            mode: ['visual', 'linewise']
          });
        });
        describe("I", function() {
          return it("insert at first char of line *of each selected line*", function() {
            return ensure("I", {
              cursor: [[1, 0], [2, 2], [3, 4]],
              mode: "insert"
            });
          });
        });
        return describe("A", function() {
          return it("insert at end of line *of each selected line*", function() {
            return ensure("A", {
              cursor: [[1, 11], [2, 13], [3, 15]],
              mode: "insert"
            });
          });
        });
      });
      describe("visual-mode.blockwise", function() {
        beforeEach(function() {
          set({
            cursor: [1, 4]
          });
          return ensure("ctrl-v 2 j", {
            selectedText: ["4", " ", "3"],
            mode: ['visual', 'blockwise']
          });
        });
        describe("I", function() {
          it("insert at column of start of selection for *each selection*", function() {
            return ensure("I", {
              cursor: [[1, 4], [2, 4], [3, 4]],
              mode: "insert"
            });
          });
          return it("can repeat after insert AFTER clearing multiple cursor", function() {
            ensure("escape", {
              mode: 'normal'
            });
            set({
              textC: "|line0\nline1\nline2"
            });
            ensure("ctrl-v j I", {
              textC: "|line0\n|line1\nline2",
              mode: 'insert'
            });
            editor.insertText("ABC");
            ensure("escape", {
              textC: "AB|Cline0\nAB!Cline1\nline2",
              mode: 'normal'
            });
            ensure("escape k", {
              textC: "AB!Cline0\nABCline1\nline2",
              mode: 'normal'
            });
            return ensure("l .", {
              textC: "ABCAB|Cline0\nABCAB!Cline1\nline2",
              mode: 'normal'
            });
          });
        });
        return describe("A", function() {
          return it("insert at column of end of selection for *each selection*", function() {
            return ensure("A", {
              cursor: [[1, 5], [2, 5], [3, 5]],
              mode: "insert"
            });
          });
        });
      });
      describe("visual-mode.characterwise", function() {
        beforeEach(function() {
          set({
            cursor: [1, 4]
          });
          return ensure("v 2 j", {
            selectedText: "456 890\n  2: 3456 890\n    3",
            mode: ['visual', 'characterwise']
          });
        });
        describe("I is short hand of `ctrl-v I`", function() {
          return it("insert at colum of start of selection for *each selected lines*", function() {
            return ensure("I", {
              cursor: [[1, 4], [2, 4], [3, 4]],
              mode: "insert"
            });
          });
        });
        return describe("A is short hand of `ctrl-v A`", function() {
          return it("insert at column of end of selection for *each selected lines*", function() {
            return ensure("A", {
              cursor: [[1, 5], [2, 5], [3, 5]],
              mode: "insert"
            });
          });
        });
      });
      return describe("when occurrence marker interselcts I and A no longer behave blockwise in vC/vL", function() {
        beforeEach(function() {
          jasmine.attachToDOM(editorElement);
          set({
            cursor: [1, 3]
          });
          return ensure('g o', {
            occurrenceText: ['3456', '3456', '3456', '3456'],
            cursor: [1, 3]
          });
        });
        describe("vC", function() {
          return describe("I and A NOT behave as `ctrl-v I`", function() {
            it("I insert at start of each vsually selected occurrence", function() {
              return ensure("v j j I", {
                mode: 'insert',
                textC_: "__0: 3456 890\n1: !3456 890\n__2: |3456 890\n____3: 3456 890"
              });
            });
            return it("A insert at end of each vsually selected occurrence", function() {
              return ensure("v j j A", {
                mode: 'insert',
                textC_: "__0: 3456 890\n1: 3456! 890\n__2: 3456| 890\n____3: 3456 890"
              });
            });
          });
        });
        return describe("vL", function() {
          return describe("I and A NOT behave as `ctrl-v I`", function() {
            it("I insert at start of each vsually selected occurrence", function() {
              return ensure("V j j I", {
                mode: 'insert',
                textC_: "__0: 3456 890\n1: |3456 890\n _2: |3456 890\n____3: !3456 890"
              });
            });
            return it("A insert at end of each vsually selected occurrence", function() {
              return ensure("V j j A", {
                mode: 'insert',
                textC_: "__0: 3456 890\n1: 3456| 890\n__2: 3456| 890\n____3: 3456! 890"
              });
            });
          });
        });
      });
    });
    describe("the gI keybinding", function() {
      beforeEach(function() {
        return set({
          text: "__this is text"
        });
      });
      describe("in normal-mode.", function() {
        return it("start at insert at column 0 regardless of current column", function() {
          set({
            cursor: [0, 5]
          });
          ensure("g I", {
            cursor: [0, 0],
            mode: 'insert'
          });
          ensure("escape", {
            mode: 'normal'
          });
          set({
            cursor: [0, 0]
          });
          ensure("g I", {
            cursor: [0, 0],
            mode: 'insert'
          });
          ensure("escape", {
            mode: 'normal'
          });
          set({
            cursor: [0, 13]
          });
          return ensure("g I", {
            cursor: [0, 0],
            mode: 'insert'
          });
        });
      });
      return describe("in visual-mode", function() {
        beforeEach(function() {
          return set({
            text_: "__0: 3456 890\n1: 3456 890\n__2: 3456 890\n____3: 3456 890"
          });
        });
        it("[characterwise]", function() {
          set({
            cursor: [1, 4]
          });
          ensure("v 2 j", {
            selectedText: "456 890\n  2: 3456 890\n    3",
            mode: ['visual', 'characterwise']
          });
          return ensure("g I", {
            cursor: [[1, 0], [2, 0], [3, 0]],
            mode: "insert"
          });
        });
        it("[linewise]", function() {
          set({
            cursor: [1, 3]
          });
          ensure("V 2 j", {
            selectedText: "1: 3456 890\n  2: 3456 890\n    3: 3456 890",
            mode: ['visual', 'linewise']
          });
          return ensure("g I", {
            cursor: [[1, 0], [2, 0], [3, 0]],
            mode: "insert"
          });
        });
        return it("[blockwise]", function() {
          set({
            cursor: [1, 4]
          });
          ensure("ctrl-v 2 j", {
            selectedText: ["4", " ", "3"],
            mode: ['visual', 'blockwise']
          });
          return ensure("g I", {
            cursor: [[1, 0], [2, 0], [3, 0]],
            mode: "insert"
          });
        });
      });
    });
    describe("InsertAtPreviousFoldStart and Next", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        getVimState('sample.coffee', function(state, vim) {
          editor = state.editor, editorElement = state.editorElement;
          return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
        });
        return runs(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'g [': 'vim-mode-plus:insert-at-previous-fold-start',
              'g ]': 'vim-mode-plus:insert-at-next-fold-start'
            }
          });
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe("when cursor is not at fold start row", function() {
        beforeEach(function() {
          return set({
            cursor: [16, 0]
          });
        });
        it("insert at previous fold start row", function() {
          return ensure('g [', {
            cursor: [9, 2],
            mode: 'insert'
          });
        });
        return it("insert at next fold start row", function() {
          return ensure('g ]', {
            cursor: [18, 4],
            mode: 'insert'
          });
        });
      });
      return describe("when cursor is at fold start row", function() {
        beforeEach(function() {
          return set({
            cursor: [20, 6]
          });
        });
        it("insert at previous fold start row", function() {
          return ensure('g [', {
            cursor: [18, 4],
            mode: 'insert'
          });
        });
        return it("insert at next fold start row", function() {
          return ensure('g ]', {
            cursor: [22, 6],
            mode: 'insert'
          });
        });
      });
    });
    describe("the i keybinding", function() {
      beforeEach(function() {
        return set({
          textC: "|123\n|4567"
        });
      });
      it("allows undoing an entire batch of typing", function() {
        keystroke('i');
        editor.insertText("abcXX");
        editor.backspace();
        editor.backspace();
        ensure('escape', {
          text: "abc123\nabc4567"
        });
        keystroke('i');
        editor.insertText("d");
        editor.insertText("e");
        editor.insertText("f");
        ensure('escape', {
          text: "abdefc123\nabdefc4567"
        });
        ensure('u', {
          text: "abc123\nabc4567"
        });
        return ensure('u', {
          text: "123\n4567"
        });
      });
      it("allows repeating typing", function() {
        keystroke('i');
        editor.insertText("abcXX");
        editor.backspace();
        editor.backspace();
        ensure('escape', {
          text: "abc123\nabc4567"
        });
        ensure('.', {
          text: "ababcc123\nababcc4567"
        });
        return ensure('.', {
          text: "abababccc123\nabababccc4567"
        });
      });
      return describe('with nonlinear input', function() {
        beforeEach(function() {
          return set({
            text: '',
            cursor: [0, 0]
          });
        });
        it('deals with auto-matched brackets', function() {
          keystroke('i');
          editor.insertText('()');
          editor.moveLeft();
          editor.insertText('a');
          editor.moveRight();
          editor.insertText('b\n');
          ensure('escape', {
            cursor: [1, 0]
          });
          return ensure('.', {
            text: '(a)b\n(a)b\n',
            cursor: [2, 0]
          });
        });
        return it('deals with autocomplete', function() {
          keystroke('i');
          editor.insertText('a');
          editor.insertText('d');
          editor.insertText('d');
          editor.setTextInBufferRange([[0, 0], [0, 3]], 'addFoo');
          ensure('escape', {
            cursor: [0, 5],
            text: 'addFoo'
          });
          return ensure('.', {
            text: 'addFoaddFooo',
            cursor: [0, 10]
          });
        });
      });
    });
    describe('the a keybinding', function() {
      beforeEach(function() {
        return set({
          text: '',
          cursor: [0, 0]
        });
      });
      it("can be undone in one go", function() {
        keystroke('a');
        editor.insertText("abc");
        ensure('escape', {
          text: "abc"
        });
        return ensure('u', {
          text: ""
        });
      });
      return it("repeats correctly", function() {
        keystroke('a');
        editor.insertText("abc");
        ensure('escape', {
          text: "abc",
          cursor: [0, 2]
        });
        return ensure('.', {
          text: "abcabc",
          cursor: [0, 5]
        });
      });
    });
    describe('preserve inserted text', function() {
      var ensureDotRegister;
      ensureDotRegister = null;
      beforeEach(function() {
        ensureDotRegister = function(key, arg) {
          var text;
          text = arg.text;
          ensure(key, {
            mode: 'insert'
          });
          editor.insertText(text);
          return ensure("escape", {
            register: {
              '.': {
                text: text
              }
            }
          });
        };
        return set({
          text: "\n\n",
          cursor: [0, 0]
        });
      });
      it("[case-i]", function() {
        return ensureDotRegister('i', {
          text: 'iabc'
        });
      });
      it("[case-o]", function() {
        return ensureDotRegister('o', {
          text: 'oabc'
        });
      });
      it("[case-c]", function() {
        return ensureDotRegister('c l', {
          text: 'cabc'
        });
      });
      it("[case-C]", function() {
        return ensureDotRegister('C', {
          text: 'Cabc'
        });
      });
      return it("[case-s]", function() {
        return ensureDotRegister('s', {
          text: 'sabc'
        });
      });
    });
    describe("repeat backspace/delete happened in insert-mode", function() {
      describe("single cursor operation", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0],
            text: "123\n123"
          });
        });
        it("can repeat backspace only mutation: case-i", function() {
          set({
            cursor: [0, 1]
          });
          keystroke('i');
          editor.backspace();
          ensure('escape', {
            text: "23\n123",
            cursor: [0, 0]
          });
          ensure('j .', {
            text: "23\n123"
          });
          return ensure('l .', {
            text: "23\n23"
          });
        });
        it("can repeat backspace only mutation: case-a", function() {
          keystroke('a');
          editor.backspace();
          ensure('escape', {
            text: "23\n123",
            cursor: [0, 0]
          });
          ensure('.', {
            text: "3\n123",
            cursor: [0, 0]
          });
          return ensure('j . .', {
            text: "3\n3"
          });
        });
        it("can repeat delete only mutation: case-i", function() {
          keystroke('i');
          editor["delete"]();
          ensure('escape', {
            text: "23\n123"
          });
          return ensure('j .', {
            text: "23\n23"
          });
        });
        it("can repeat delete only mutation: case-a", function() {
          keystroke('a');
          editor["delete"]();
          ensure('escape', {
            text: "13\n123"
          });
          return ensure('j .', {
            text: "13\n13"
          });
        });
        it("can repeat backspace and insert mutation: case-i", function() {
          set({
            cursor: [0, 1]
          });
          keystroke('i');
          editor.backspace();
          editor.insertText("!!!");
          ensure('escape', {
            text: "!!!23\n123"
          });
          set({
            cursor: [1, 1]
          });
          return ensure('.', {
            text: "!!!23\n!!!23"
          });
        });
        it("can repeat backspace and insert mutation: case-a", function() {
          keystroke('a');
          editor.backspace();
          editor.insertText("!!!");
          ensure('escape', {
            text: "!!!23\n123"
          });
          return ensure('j 0 .', {
            text: "!!!23\n!!!23"
          });
        });
        it("can repeat delete and insert mutation: case-i", function() {
          keystroke('i');
          editor["delete"]();
          editor.insertText("!!!");
          ensure('escape', {
            text: "!!!23\n123"
          });
          return ensure('j 0 .', {
            text: "!!!23\n!!!23"
          });
        });
        return it("can repeat delete and insert mutation: case-a", function() {
          keystroke('a');
          editor["delete"]();
          editor.insertText("!!!");
          ensure('escape', {
            text: "1!!!3\n123"
          });
          return ensure('j 0 .', {
            text: "1!!!3\n1!!!3"
          });
        });
      });
      return describe("multi-cursors operation", function() {
        beforeEach(function() {
          return set({
            textC: "|123\n\n|1234\n\n|12345"
          });
        });
        it("can repeat backspace only mutation: case-multi-cursors", function() {
          ensure('A', {
            cursor: [[0, 3], [2, 4], [4, 5]],
            mode: 'insert'
          });
          editor.backspace();
          ensure('escape', {
            text: "12\n\n123\n\n1234",
            cursor: [[0, 1], [2, 2], [4, 3]]
          });
          return ensure('.', {
            text: "1\n\n12\n\n123",
            cursor: [[0, 0], [2, 1], [4, 2]]
          });
        });
        return it("can repeat delete only mutation: case-multi-cursors", function() {
          var cursors;
          ensure('I', {
            mode: 'insert'
          });
          editor["delete"]();
          cursors = [[0, 0], [2, 0], [4, 0]];
          ensure('escape', {
            text: "23\n\n234\n\n2345",
            cursor: cursors
          });
          ensure('.', {
            text: "3\n\n34\n\n345",
            cursor: cursors
          });
          ensure('.', {
            text: "\n\n4\n\n45",
            cursor: cursors
          });
          ensure('.', {
            text: "\n\n\n\n5",
            cursor: cursors
          });
          return ensure('.', {
            text: "\n\n\n\n",
            cursor: cursors
          });
        });
      });
    });
    return describe('specify insertion count', function() {
      var ensureInsertionCount;
      ensureInsertionCount = function(key, arg) {
        var cursor, insert, text;
        insert = arg.insert, text = arg.text, cursor = arg.cursor;
        keystroke(key);
        editor.insertText(insert);
        return ensure("escape", {
          text: text,
          cursor: cursor
        });
      };
      beforeEach(function() {
        var initialText;
        initialText = "*\n*\n";
        set({
          text: "",
          cursor: [0, 0]
        });
        keystroke('i');
        editor.insertText(initialText);
        return ensure("escape g g", {
          text: initialText,
          cursor: [0, 0]
        });
      });
      describe("repeat insertion count times", function() {
        it("[case-i]", function() {
          return ensureInsertionCount('3 i', {
            insert: '=',
            text: "===*\n*\n",
            cursor: [0, 2]
          });
        });
        it("[case-o]", function() {
          return ensureInsertionCount('3 o', {
            insert: '=',
            text: "*\n=\n=\n=\n*\n",
            cursor: [3, 0]
          });
        });
        it("[case-O]", function() {
          return ensureInsertionCount('3 O', {
            insert: '=',
            text: "=\n=\n=\n*\n*\n",
            cursor: [2, 0]
          });
        });
        return describe("children of Change operation won't repeate insertion count times", function() {
          beforeEach(function() {
            set({
              text: "",
              cursor: [0, 0]
            });
            keystroke('i');
            editor.insertText('*');
            return ensure('escape g g', {
              text: '*',
              cursor: [0, 0]
            });
          });
          it("[case-c]", function() {
            return ensureInsertionCount('3 c w', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          it("[case-C]", function() {
            return ensureInsertionCount('3 C', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          it("[case-s]", function() {
            return ensureInsertionCount('3 s', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          return it("[case-S]", function() {
            return ensureInsertionCount('3 S', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("throttoling intertion count to 100 at maximum", function() {
        return it("insert 100 times at maximum even if big count was given", function() {
          set({
            text: ''
          });
          expect(editor.getLastBufferRow()).toBe(0);
          ensure('5 5 5 5 5 5 5 i', {
            mode: 'insert'
          });
          editor.insertText("a\n");
          ensure('escape', {
            mode: 'normal'
          });
          return expect(editor.getLastBufferRow()).toBe(101);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9vcGVyYXRvci1hY3RpdmF0ZS1pbnNlcnQtbW9kZS1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBMEIsT0FBQSxDQUFRLGVBQVIsQ0FBMUIsRUFBQyw2QkFBRCxFQUFjOztFQUNkLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBQ1YsVUFBVyxPQUFBLENBQVEsTUFBUjs7RUFFWixRQUFBLENBQVMsb0NBQVQsRUFBK0MsU0FBQTtBQUM3QyxRQUFBO0lBQUEsT0FBOEUsRUFBOUUsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYywwQkFBZCxFQUFnQyxtQkFBaEMsRUFBMkMsZ0JBQTNDLEVBQW1ELHVCQUFuRCxFQUFrRTtJQUVsRSxVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjLHlCQUFkLEVBQXlCLHVDQUF6QixFQUE2QztNQUhuQyxDQUFaO0lBRFMsQ0FBWDtJQU1BLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO01BQzNCLFVBQUEsQ0FBVyxTQUFBO2VBQ1QsR0FBQSxDQUFJO1VBQUEsSUFBQSxFQUFNLFFBQU47VUFBZ0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBeEI7U0FBSjtNQURTLENBQVg7TUFHQSxFQUFBLENBQUcsMkRBQUgsRUFBZ0UsU0FBQTtlQUM5RCxNQUFBLENBQU8sR0FBUCxFQUNFO1VBQUEsSUFBQSxFQUFNLFFBQU47VUFDQSxJQUFBLEVBQU0sT0FETjtVQUVBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRlI7VUFHQSxRQUFBLEVBQVU7WUFBQSxHQUFBLEVBQUs7Y0FB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UjtjQUFhLElBQUEsRUFBTSxHQUFuQjtjQUF3QixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFoQzthQUE1QjtVQUFILENBQWY7aUJBQ0EsRUFBQSxDQUFHLFVBQUgsRUFBZSxTQUFBO21CQUFHLG9CQUFBLENBQXFCLEtBQXJCLEVBQTRCO2NBQUEsTUFBQSxFQUFRLEdBQVI7Y0FBYSxJQUFBLEVBQU0sR0FBbkI7Y0FBd0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBaEM7YUFBNUI7VUFBSCxDQUFmO1FBVjJFLENBQTdFO01BTHVDLENBQXpDO2FBaUJBLFFBQUEsQ0FBUywrQ0FBVCxFQUEwRCxTQUFBO2VBQ3hELEVBQUEsQ0FBRyx5REFBSCxFQUE4RCxTQUFBO1VBQzVELEdBQUEsQ0FBSTtZQUFBLElBQUEsRUFBTSxFQUFOO1dBQUo7VUFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLGdCQUFQLENBQUEsQ0FBUCxDQUFpQyxDQUFDLElBQWxDLENBQXVDLENBQXZDO1VBQ0EsTUFBQSxDQUFPLGlCQUFQLEVBQTBCO1lBQUEsSUFBQSxFQUFNLFFBQU47V0FBMUI7VUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQjtVQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1lBQUEsSUFBQSxFQUFNLFFBQU47V0FBakI7aUJBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxnQkFBUCxDQUFBLENBQVAsQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxHQUF2QztRQU40RCxDQUE5RDtNQUR3RCxDQUExRDtJQTlCa0MsQ0FBcEM7RUFwNkI2QyxDQUEvQztBQUpBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBkaXNwYXRjaH0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG57aW5zcGVjdH0gPSByZXF1aXJlICd1dGlsJ1xuXG5kZXNjcmliZSBcIk9wZXJhdG9yIEFjdGl2YXRlSW5zZXJ0TW9kZSBmYW1pbHlcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBiaW5kRW5zdXJlT3B0aW9uLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCB2aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgYmluZEVuc3VyZU9wdGlvbn0gPSB2aW1cblxuICBkZXNjcmliZSBcInRoZSBzIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogJzAxMjM0NScsIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCBcImRlbGV0ZXMgdGhlIGNoYXJhY3RlciB0byB0aGUgcmlnaHQgYW5kIGVudGVycyBpbnNlcnQgbW9kZVwiLCAtPlxuICAgICAgZW5zdXJlICdzJyxcbiAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgdGV4dDogJzAyMzQ1J1xuICAgICAgICBjdXJzb3I6IFswLCAxXVxuICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJzEnXG5cbiAgICBpdCBcImlzIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAga2V5c3Ryb2tlICczIHMnXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnYWInXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6ICdhYjM0NSdcbiAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICcuJywgdGV4dDogJ2FiYWInXG5cbiAgICBpdCBcImlzIHVuZG9hYmxlXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGtleXN0cm9rZSAnMyBzJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgJ2FiJ1xuICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiAnYWIzNDUnXG4gICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiAnMDEyMzQ1Jywgc2VsZWN0ZWRUZXh0OiAnJ1xuXG4gICAgZGVzY3JpYmUgXCJpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBrZXlzdHJva2UgJ3YgbCBzJ1xuXG4gICAgICBpdCBcImRlbGV0ZXMgdGhlIHNlbGVjdGVkIGNoYXJhY3RlcnMgYW5kIGVudGVycyBpbnNlcnQgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmVcbiAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIHRleHQ6ICcwMzQ1J1xuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcxMidcblxuICBkZXNjcmliZSBcInRoZSBTIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCIxMjM0NVxcbmFiY2RlXFxuQUJDREVcIlxuICAgICAgICBjdXJzb3I6IFsxLCAzXVxuXG4gICAgaXQgXCJkZWxldGVzIHRoZSBlbnRpcmUgbGluZSBhbmQgZW50ZXJzIGluc2VydCBtb2RlXCIsIC0+XG4gICAgICBlbnN1cmUgJ1MnLFxuICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuXFxuQUJDREVcIlxuICAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdhYmNkZVxcbicsIHR5cGU6ICdsaW5ld2lzZSd9XG5cbiAgICBpdCBcImlzIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgIGtleXN0cm9rZSAnUydcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICdhYmMnXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6ICcxMjM0NVxcbmFiY1xcbkFCQ0RFJ1xuICAgICAgc2V0IGN1cnNvcjogWzIsIDNdXG4gICAgICBlbnN1cmUgJy4nLCB0ZXh0OiAnMTIzNDVcXG5hYmNcXG5hYmMnXG5cbiAgICBpdCBcImlzIHVuZG9hYmxlXCIsIC0+XG4gICAgICBrZXlzdHJva2UgJ1MnXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnYWJjJ1xuICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiAnMTIzNDVcXG5hYmNcXG5BQkNERSdcbiAgICAgIGVuc3VyZSAndScsIHRleHQ6IFwiMTIzNDVcXG5hYmNkZVxcbkFCQ0RFXCIsIHNlbGVjdGVkVGV4dDogJydcblxuICAgICMgSGVyZSBpcyBvcmlnaW5hbCBzcGVjIEkgYmVsaWV2ZSBpdHMgbm90IGNvcnJlY3QsIGlmIGl0IHNheXMgJ3dvcmtzJ1xuICAgICMgdGV4dCByZXN1bHQgc2hvdWxkIGJlICdcXG4nIHNpbmNlIFMgZGVsZXRlIGN1cnJlbnQgbGluZS5cbiAgICAjIEl0cyBvcmlnbmFsbHkgYWRkZWQgaW4gZm9sbG93aW5nIGNvbW1pdCwgYXMgZml4IG9mIFMoZnJvbSBkZXNjcmlwdGlvbikuXG4gICAgIyBCdXQgb3JpZ2luYWwgU3Vic3RpdHV0ZUxpbmUgcmVwbGFjZWQgd2l0aCBDaGFuZ2UgYW5kIE1vdmVUb1JlbGF0aXZlTGluZSBjb21iby5cbiAgICAjIEkgYmVsaWV2ZSB0aGlzIHNwZWMgc2hvdWxkIGhhdmUgYmVlbiBmYWlsZWQgYXQgdGhhdCB0aW1lLCBidXQgaGF2ZW50Jy5cbiAgICAjIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL3ZpbS1tb2RlL2NvbW1pdC82YWNmZmQyNTU5ZTU2ZjdjMThhNGQ3NjZmMGFkOTJjOWVkNjIxMmFlXG4gICAgI1xuICAgICMgaXQgXCJ3b3JrcyB3aGVuIHRoZSBjdXJzb3IncyBnb2FsIGNvbHVtbiBpcyBncmVhdGVyIHRoYW4gaXRzIGN1cnJlbnQgY29sdW1uXCIsIC0+XG4gICAgIyAgIHNldCB0ZXh0OiBcIlxcbjEyMzQ1XCIsIGN1cnNvcjogWzEsIEluZmluaXR5XVxuICAgICMgICBlbnN1cmUgJ2tTJywgdGV4dDogJ1xcbjEyMzQ1J1xuXG4gICAgaXQgXCJ3b3JrcyB3aGVuIHRoZSBjdXJzb3IncyBnb2FsIGNvbHVtbiBpcyBncmVhdGVyIHRoYW4gaXRzIGN1cnJlbnQgY29sdW1uXCIsIC0+XG4gICAgICBzZXQgdGV4dDogXCJcXG4xMjM0NVwiLCBjdXJzb3I6IFsxLCBJbmZpbml0eV1cbiAgICAgICMgU2hvdWxkIGJlIGhlcmUsIGJ1dCBJIGNvbW1lbnRlZCBvdXQgYmVmb3JlIEkgaGF2ZSBjb25maWRlbmNlLlxuICAgICAgIyBlbnN1cmUgJ2tTJywgdGV4dDogJ1xcbidcbiAgICAgICMgRm9sb3dpbmcgbGluZSBpbmNsdWRlIEJ1ZyBpYmVsaWV2ZS5cbiAgICAgIGVuc3VyZSAnayBTJywgdGV4dDogJ1xcbjEyMzQ1J1xuICAgICMgQ2FuJ3QgYmUgdGVzdGVkIHdpdGhvdXQgc2V0dGluZyBncmFtbWFyIG9mIHRlc3QgYnVmZmVyXG4gICAgeGl0IFwicmVzcGVjdHMgaW5kZW50YXRpb25cIiwgLT5cblxuICBkZXNjcmliZSBcInRoZSBjIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCJcIlwiXG4gICAgICAgIDEyMzQ1XG4gICAgICAgIGFiY2RlXG4gICAgICAgIEFCQ0RFXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgY1wiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIGF1dG9pbmRlbnRcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcIjEyMzQ1XFxuICBhYmNkZVxcbkFCQ0RFXFxuXCJcbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICBzcHlPbihlZGl0b3IsICdzaG91bGRBdXRvSW5kZW50JykuYW5kUmV0dXJuKHRydWUpXG4gICAgICAgICAgc3B5T24oZWRpdG9yLCAnYXV0b0luZGVudEJ1ZmZlclJvdycpLmFuZENhbGxGYWtlIChsaW5lKSAtPlxuICAgICAgICAgICAgZWRpdG9yLmluZGVudCgpXG4gICAgICAgICAgc3B5T24oZWRpdG9yLmxhbmd1YWdlTW9kZSwgJ3N1Z2dlc3RlZEluZGVudEZvckxpbmVBdEJ1ZmZlclJvdycpLmFuZENhbGxGYWtlIC0+IDFcblxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGN1cnJlbnQgbGluZSBhbmQgZW50ZXJzIGluc2VydCBtb2RlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICAgICAgZW5zdXJlICdjIGMnLFxuICAgICAgICAgICAgdGV4dDogXCIxMjM0NVxcbiAgXFxuQUJDREVcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgICAgaXQgXCJpcyByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgICAga2V5c3Ryb2tlICdjIGMnXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhYmNcIilcbiAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiMTIzNDVcXG4gIGFiY1xcbkFCQ0RFXFxuXCJcbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgM11cbiAgICAgICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIjEyMzQ1XFxuICBhYmNcXG4gIGFiY1xcblwiXG5cbiAgICAgICAgaXQgXCJpcyB1bmRvYWJsZVwiLCAtPlxuICAgICAgICAgIGtleXN0cm9rZSAnYyBjJ1xuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYWJjXCIpXG4gICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIjEyMzQ1XFxuICBhYmNcXG5BQkNERVxcblwiXG4gICAgICAgICAgZW5zdXJlICd1JywgdGV4dDogXCIxMjM0NVxcbiAgYWJjZGVcXG5BQkNERVxcblwiLCBzZWxlY3RlZFRleHQ6ICcnXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgY3Vyc29yIGlzIG9uIHRoZSBsYXN0IGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBsaW5lJ3MgY29udGVudCBhbmQgZW50ZXJzIGluc2VydCBtb2RlIG9uIHRoZSBsYXN0IGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMV1cbiAgICAgICAgICBlbnN1cmUgJ2MgYycsXG4gICAgICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuYWJjZGVcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgY3Vyc29yIGlzIG9uIHRoZSBvbmx5IGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBsaW5lJ3MgY29udGVudCBhbmQgZW50ZXJzIGluc2VydCBtb2RlXCIsIC0+XG4gICAgICAgICAgc2V0IHRleHQ6IFwiMTIzNDVcIiwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgICBlbnN1cmUgJ2MgYycsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBpIHdcIiwgLT5cbiAgICAgIGl0IFwidW5kbydzIGFuZCByZWRvJ3MgY29tcGxldGVseVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgZW5zdXJlICdjIGkgdycsXG4gICAgICAgICAgdGV4dDogXCIxMjM0NVxcblxcbkFCQ0RFXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgICAgIyBKdXN0IGNhbm5vdCBnZXQgXCJ0eXBpbmdcIiB0byB3b3JrIGNvcnJlY3RseSBpbiB0ZXN0LlxuICAgICAgICBzZXQgdGV4dDogXCIxMjM0NVxcbmZnXFxuQUJDREVcIlxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsXG4gICAgICAgICAgdGV4dDogXCIxMjM0NVxcbmZnXFxuQUJDREVcIlxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGVuc3VyZSAndScsIHRleHQ6IFwiMTIzNDVcXG5hYmNkZVxcbkFCQ0RFXCJcbiAgICAgICAgZW5zdXJlICdjdHJsLXInLCB0ZXh0OiBcIjEyMzQ1XFxuZmdcXG5BQkNERVwiXG5cbiAgICAgIGl0IFwicmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgZW5zdXJlICdjIGkgdycsXG4gICAgICAgICAgdGV4dDogXCIxMjM0NVxcblxcbkFCQ0RFXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgICAgZW5zdXJlICdlc2NhcGUgaiAuJyxcbiAgICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuXFxuXCJcbiAgICAgICAgICBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSB3XCIsIC0+XG4gICAgICBpdCBcImNoYW5nZXMgdGhlIHdvcmRcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwid29yZDEgd29yZDIgd29yZDNcIiwgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgZW5zdXJlICdjIHcgZXNjYXBlJywgdGV4dDogXCJ3b3JkMSB3IHdvcmQzXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIEdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgb3JpZ2luYWxUZXh0ID0gXCIxMjM0NVxcbmFiY2RlXFxuQUJDREVcXG5cIlxuICAgICAgICBzZXQgdGV4dDogb3JpZ2luYWxUZXh0XG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIGJlZ2lubmluZyBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBib3R0b20gdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdjIEcgZXNjYXBlJywgdGV4dDogJzEyMzQ1XFxuXFxuJ1xuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBtaWRkbGUgb2YgdGhlIHNlY29uZCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgYm90dG9tIHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIGVuc3VyZSAnYyBHIGVzY2FwZScsIHRleHQ6ICcxMjM0NVxcblxcbidcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIGdvdG8gbGluZSBHXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVwiXG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIGJlZ2lubmluZyBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIGFsbCB0aGUgdGV4dCBvbiB0aGUgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnYyAyIEcgZXNjYXBlJywgdGV4dDogJzEyMzQ1XFxuXFxuQUJDREUnXG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIG1pZGRsZSBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIGFsbCB0aGUgdGV4dCBvbiB0aGUgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIGVuc3VyZSAnYyAyIEcgZXNjYXBlJywgdGV4dDogJzEyMzQ1XFxuXFxuQUJDREUnXG5cbiAgZGVzY3JpYmUgXCJ0aGUgQyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIGN1cnNvcjogWzEsIDJdXG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAwISEhISEhXG4gICAgICAgIDEhISEhISFcbiAgICAgICAgMiEhISEhIVxuICAgICAgICAzISEhISEhXFxuXG4gICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlIFwiaW4gbm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgIGl0IFwiZGVsZXRlcyB0aWxsIHRoZSBFT0wgdGhlbiBlbnRlciBpbnNlcnQtbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ0MnLFxuICAgICAgICAgIGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAhISEhISFcbiAgICAgICAgICAgIDEhXG4gICAgICAgICAgICAyISEhISEhXG4gICAgICAgICAgICAzISEhISEhXFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiaW4gdmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZVwiLCAtPlxuICAgICAgaXQgXCJkZWxldGUgd2hvbGUgbGluZXMgYW5kIGVudGVyIGluc2VydC1tb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndiBqIEMnLFxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAhISEhISFcblxuICAgICAgICAgICAgMyEhISEhIVxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZSBzZXR0aW5nc1wiLCAtPlxuICAgIHJlc3VsdFRleHRDID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2luaXRpYWwtdmFsdWUnXG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgMGFiY1xuICAgICAgICAxfGRlZlxuICAgICAgICAyZ2hpXFxuXG4gICAgICAgIFwiXCJcIlxuICAgICAgcmVzdWx0VGV4dEMgPVxuICAgICAgICBjbDogXCJcIlwiXG4gICAgICAgICAgMGFiY1xuICAgICAgICAgIDF8ZWZcbiAgICAgICAgICAyZ2hpXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIEM6IFwiXCJcIlxuICAgICAgICAgIDBhYmNcbiAgICAgICAgICAxfFxuICAgICAgICAgIDJnaGlcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgczogXCJcIlwiXG4gICAgICAgICAgMGFiY1xuICAgICAgICAgIDF8ZWZcbiAgICAgICAgICAyZ2hpXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIFM6IFwiXCJcIlxuICAgICAgICAgIDBhYmNcbiAgICAgICAgICB8XG4gICAgICAgICAgMmdoaVxcblxuICAgICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlIFwid2hlbiBkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZT1mYWxzZVwiLCAtPlxuICAgICAgZW5zdXJlXyA9IG51bGxcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZW5zdXJlXyA9IGJpbmRFbnN1cmVPcHRpb24obW9kZTogJ2luc2VydCcpXG4gICAgICAgIHNldHRpbmdzLnNldChcImRvbnRVcGRhdGVSZWdpc3Rlck9uQ2hhbmdlT3JTdWJzdGl0dXRlXCIsIGZhbHNlKVxuICAgICAgaXQgJ2MgbXV0YXRlIHJlZ2lzdGVyJywgLT4gZW5zdXJlXyAnYyBsJywgdGV4dEM6IHJlc3VsdFRleHRDLmNsLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICdkJ31cbiAgICAgIGl0ICdDIG11dGF0ZSByZWdpc3RlcicsIC0+IGVuc3VyZV8gJ0MnLCB0ZXh0QzogcmVzdWx0VGV4dEMuQywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnZGVmJ31cbiAgICAgIGl0ICdzIG11dGF0ZSByZWdpc3RlcicsIC0+IGVuc3VyZV8gJ3MnLCB0ZXh0QzogcmVzdWx0VGV4dEMucywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnZCd9XG4gICAgICBpdCAnUyBtdXRhdGUgcmVnaXN0ZXInLCAtPiBlbnN1cmVfICdTJywgdGV4dEM6IHJlc3VsdFRleHRDLlMsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJzFkZWZcXG4nfVxuICAgIGRlc2NyaWJlIFwid2hlbiBkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZT10cnVlXCIsIC0+XG4gICAgICBlbnN1cmVfID0gbnVsbFxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlbnN1cmVfID0gYmluZEVuc3VyZU9wdGlvbihtb2RlOiAnaW5zZXJ0JywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnaW5pdGlhbC12YWx1ZSd9KVxuICAgICAgICBzZXR0aW5ncy5zZXQoXCJkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZVwiLCB0cnVlKVxuICAgICAgaXQgJ2MgbXV0YXRlIHJlZ2lzdGVyJywgLT4gZW5zdXJlXyAnYyBsJywgdGV4dEM6IHJlc3VsdFRleHRDLmNsXG4gICAgICBpdCAnQyBtdXRhdGUgcmVnaXN0ZXInLCAtPiBlbnN1cmVfICdDJywgdGV4dEM6IHJlc3VsdFRleHRDLkNcbiAgICAgIGl0ICdzIG11dGF0ZSByZWdpc3RlcicsIC0+IGVuc3VyZV8gJ3MnLCB0ZXh0QzogcmVzdWx0VGV4dEMuc1xuICAgICAgaXQgJ1MgbXV0YXRlIHJlZ2lzdGVyJywgLT4gZW5zdXJlXyAnUycsIHRleHRDOiByZXN1bHRUZXh0Qy5TXG5cbiAgZGVzY3JpYmUgXCJ0aGUgTyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc3B5T24oZWRpdG9yLCAnc2hvdWxkQXV0b0luZGVudCcpLmFuZFJldHVybih0cnVlKVxuICAgICAgc3B5T24oZWRpdG9yLCAnYXV0b0luZGVudEJ1ZmZlclJvdycpLmFuZENhbGxGYWtlIChsaW5lKSAtPlxuICAgICAgICBlZGl0b3IuaW5kZW50KClcblxuICAgICAgc2V0XG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgIF9fYWJjXG4gICAgICAgIF98XzAxMlxcblxuICAgICAgICBcIlwiXCJcblxuICAgIGl0IFwic3dpdGNoZXMgdG8gaW5zZXJ0IGFuZCBhZGRzIGEgbmV3bGluZSBhYm92ZSB0aGUgY3VycmVudCBvbmVcIiwgLT5cbiAgICAgIGtleXN0cm9rZSAnTydcbiAgICAgIGVuc3VyZVxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICBfX2FiY1xuICAgICAgICBfX3xcbiAgICAgICAgX18wMTJcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIG1vZGU6ICdpbnNlcnQnXG5cbiAgICBpdCBcImlzIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fYWJjXG4gICAgICAgICAgX198MDEyXG4gICAgICAgICAgX19fXzRzcGFjZXNcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICMgc2V0XG4gICAgICAjICAgdGV4dDogXCIgIGFiY1xcbiAgMDEyXFxuICAgIDRzcGFjZXNcXG5cIiwgY3Vyc29yOiBbMSwgMV1cbiAgICAgIGtleXN0cm9rZSAnTydcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiZGVmXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfX2FiY1xuICAgICAgICAgIF9fZGV8ZlxuICAgICAgICAgIF9fMDEyXG4gICAgICAgICAgX19fXzRzcGFjZXNcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgIF9fYWJjXG4gICAgICAgIF9fZGV8ZlxuICAgICAgICBfX2RlZlxuICAgICAgICBfXzAxMlxuICAgICAgICBfX19fNHNwYWNlc1xcblxuICAgICAgICBcIlwiXCJcbiAgICAgIHNldCBjdXJzb3I6IFs0LCAwXVxuICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgX19hYmNcbiAgICAgICAgX19kZWZcbiAgICAgICAgX19kZWZcbiAgICAgICAgX18wMTJcbiAgICAgICAgX19fX2RlfGZcbiAgICAgICAgX19fXzRzcGFjZXNcXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCBcImlzIHVuZG9hYmxlXCIsIC0+XG4gICAgICBrZXlzdHJva2UgJ08nXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImRlZlwiXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsXG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgIF9fYWJjXG4gICAgICAgIF9fZGVmXG4gICAgICAgIF9fMDEyXFxuXG4gICAgICAgIFwiXCJcIlxuICAgICAgZW5zdXJlICd1JyxcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgX19hYmNcbiAgICAgICAgX18wMTJcXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgbyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc3B5T24oZWRpdG9yLCAnc2hvdWxkQXV0b0luZGVudCcpLmFuZFJldHVybih0cnVlKVxuICAgICAgc3B5T24oZWRpdG9yLCAnYXV0b0luZGVudEJ1ZmZlclJvdycpLmFuZENhbGxGYWtlIChsaW5lKSAtPlxuICAgICAgICBlZGl0b3IuaW5kZW50KClcblxuICAgICAgc2V0IHRleHQ6IFwiYWJjXFxuICAwMTJcXG5cIiwgY3Vyc29yOiBbMSwgMl1cblxuICAgIGl0IFwic3dpdGNoZXMgdG8gaW5zZXJ0IGFuZCBhZGRzIGEgbmV3bGluZSBhYm92ZSB0aGUgY3VycmVudCBvbmVcIiwgLT5cbiAgICAgIGVuc3VyZSAnbycsXG4gICAgICAgIHRleHQ6IFwiYWJjXFxuICAwMTJcXG4gIFxcblwiXG4gICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIGN1cnNvcjogWzIsIDJdXG5cbiAgICAjIFRoaXMgd29ya3MgaW4gcHJhY3RpY2UsIGJ1dCB0aGUgZWRpdG9yIGRvZXNuJ3QgcmVzcGVjdCB0aGUgaW5kZW50YXRpb25cbiAgICAjIHJ1bGVzIHdpdGhvdXQgYSBzeW50YXggZ3JhbW1hci4gTmVlZCB0byBzZXQgdGhlIGVkaXRvcidzIGdyYW1tYXJcbiAgICAjIHRvIGZpeCBpdC5cbiAgICB4aXQgXCJpcyByZXBlYXRhYmxlXCIsIC0+XG4gICAgICBzZXQgdGV4dDogXCIgIGFiY1xcbiAgMDEyXFxuICAgIDRzcGFjZXNcXG5cIiwgY3Vyc29yOiBbMSwgMV1cbiAgICAgIGtleXN0cm9rZSAnbydcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiZGVmXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIgIGFiY1xcbiAgMDEyXFxuICBkZWZcXG4gICAgNHNwYWNlc1xcblwiXG4gICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIiAgYWJjXFxuICAwMTJcXG4gIGRlZlxcbiAgZGVmXFxuICAgIDRzcGFjZXNcXG5cIlxuICAgICAgc2V0IGN1cnNvcjogWzQsIDFdXG4gICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIiAgYWJjXFxuICBkZWZcXG4gIGRlZlxcbiAgMDEyXFxuICAgIDRzcGFjZXNcXG4gICAgZGVmXFxuXCJcblxuICAgIGl0IFwiaXMgdW5kb2FibGVcIiwgLT5cbiAgICAgIGtleXN0cm9rZSAnbydcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiZGVmXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCJhYmNcXG4gIDAxMlxcbiAgZGVmXFxuXCJcbiAgICAgIGVuc3VyZSAndScsIHRleHQ6IFwiYWJjXFxuICAwMTJcXG5cIlxuXG4gIGRlc2NyaWJlIFwidW5kby9yZWRvIGZvciBgb2AgYW5kIGBPYFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0QzogXCItLS0tfD09XCJcbiAgICBpdCBcInVuZG8gYW5kIHJlZG8gYnkga2VlcGluZyBjdXJzb3IgYXQgbyBzdGFydGVkIHBvc2l0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ28nLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgZWRpdG9yLmluc2VydFRleHQoJ0BAJylcbiAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCB0ZXh0QzogXCItLS0tPT1cXG5AfEBcIlxuICAgICAgZW5zdXJlIFwidVwiLCB0ZXh0QzogXCItLS0tfD09XCJcbiAgICAgIGVuc3VyZSBcImN0cmwtclwiLCB0ZXh0QzogXCItLS0tfD09XFxuQEBcIlxuICAgIGl0IFwidW5kbyBhbmQgcmVkbyBieSBrZWVwaW5nIGN1cnNvciBhdCBPIHN0YXJ0ZWQgcG9zaXRpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAnTycsIG1vZGU6ICdpbnNlcnQnXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnQEAnKVxuICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIHRleHRDOiBcIkB8QFxcbi0tLS09PVwiXG4gICAgICBlbnN1cmUgXCJ1XCIsIHRleHRDOiBcIi0tLS18PT1cIlxuICAgICAgZW5zdXJlIFwiY3RybC1yXCIsIHRleHRDOiBcIkBAXFxuLS0tLXw9PVwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgYSBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IFwiMDEyXFxuXCJcblxuICAgIGRlc2NyaWJlIFwiYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAga2V5c3Ryb2tlICdhJ1xuXG4gICAgICBpdCBcInN3aXRjaGVzIHRvIGluc2VydCBtb2RlIGFuZCBzaGlmdHMgdG8gdGhlIHJpZ2h0XCIsIC0+XG4gICAgICAgIGVuc3VyZSBjdXJzb3I6IFswLCAxXSwgbW9kZTogJ2luc2VydCdcblxuICAgIGRlc2NyaWJlIFwiYXQgdGhlIGVuZCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgICAga2V5c3Ryb2tlICdhJ1xuXG4gICAgICBpdCBcImRvZXNuJ3QgbGluZXdyYXBcIiwgLT5cbiAgICAgICAgZW5zdXJlIGN1cnNvcjogWzAsIDNdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgQSBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IFwiMTFcXG4yMlxcblwiXG5cbiAgICBkZXNjcmliZSBcImF0IHRoZSBiZWdpbm5pbmcgb2YgYSBsaW5lXCIsIC0+XG4gICAgICBpdCBcInN3aXRjaGVzIHRvIGluc2VydCBtb2RlIGF0IHRoZSBlbmQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnQScsXG4gICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBpdCBcInJlcGVhdHMgYWx3YXlzIGFzIGluc2VydCBhdCB0aGUgZW5kIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBrZXlzdHJva2UgJ0EnXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYWJjXCIpXG4gICAgICAgIGtleXN0cm9rZSAnZXNjYXBlJ1xuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIHRleHQ6IFwiMTFhYmNcXG4yMmFiY1xcblwiXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICBjdXJzb3I6IFsxLCA0XVxuXG4gIGRlc2NyaWJlIFwidGhlIEkga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgIF9fMDogMzQ1NiA4OTBcbiAgICAgICAgMTogMzQ1NiA4OTBcbiAgICAgICAgX18yOiAzNDU2IDg5MFxuICAgICAgICBfX19fMzogMzQ1NiA4OTBcbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImluIG5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIklcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnQgYXQgZmlyc3QgY2hhciBvZiBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAgZW5zdXJlICdJJywgY3Vyc29yOiBbMCwgMl0sIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgNV1cbiAgICAgICAgICBlbnN1cmUgJ0knLCBjdXJzb3I6IFsxLCAwXSwgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnSScsIGN1cnNvcjogWzEsIDBdLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBkZXNjcmliZSBcIkFcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnQgYXQgZW5kIG9mIGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICBlbnN1cmUgJ0EnLCBjdXJzb3I6IFswLCAxM10sIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgNV1cbiAgICAgICAgICBlbnN1cmUgJ0EnLCBjdXJzb3I6IFsxLCAxMV0sIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMTFdXG4gICAgICAgICAgZW5zdXJlICdBJywgY3Vyc29yOiBbMSwgMTFdLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgZGVzY3JpYmUgXCJ2aXN1YWwtbW9kZS5saW5ld2lzZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlIFwiViAyIGpcIixcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgIDE6IDM0NTYgODkwXG4gICAgICAgICAgICAyOiAzNDU2IDg5MFxuICAgICAgICAgICAgICAzOiAzNDU2IDg5MFxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cblxuICAgICAgZGVzY3JpYmUgXCJJXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0IGF0IGZpcnN0IGNoYXIgb2YgbGluZSAqb2YgZWFjaCBzZWxlY3RlZCBsaW5lKlwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIklcIiwgY3Vyc29yOiBbWzEsIDBdLCBbMiwgMl0sIFszLCA0XV0sIG1vZGU6IFwiaW5zZXJ0XCJcbiAgICAgIGRlc2NyaWJlIFwiQVwiLCAtPlxuICAgICAgICBpdCBcImluc2VydCBhdCBlbmQgb2YgbGluZSAqb2YgZWFjaCBzZWxlY3RlZCBsaW5lKlwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIkFcIiwgY3Vyc29yOiBbWzEsIDExXSwgWzIsIDEzXSwgWzMsIDE1XV0sIG1vZGU6IFwiaW5zZXJ0XCJcblxuICAgIGRlc2NyaWJlIFwidmlzdWFsLW1vZGUuYmxvY2t3aXNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCA0XVxuICAgICAgICBlbnN1cmUgXCJjdHJsLXYgMiBqXCIsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbXCI0XCIsIFwiIFwiLCBcIjNcIl1cbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuXG4gICAgICBkZXNjcmliZSBcIklcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnQgYXQgY29sdW1uIG9mIHN0YXJ0IG9mIHNlbGVjdGlvbiBmb3IgKmVhY2ggc2VsZWN0aW9uKlwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIklcIiwgY3Vyc29yOiBbWzEsIDRdLCBbMiwgNF0sIFszLCA0XV0sIG1vZGU6IFwiaW5zZXJ0XCJcblxuICAgICAgICBpdCBcImNhbiByZXBlYXQgYWZ0ZXIgaW5zZXJ0IEFGVEVSIGNsZWFyaW5nIG11bHRpcGxlIGN1cnNvclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfGxpbmUwXG4gICAgICAgICAgICBsaW5lMVxuICAgICAgICAgICAgbGluZTJcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgZW5zdXJlIFwiY3RybC12IGogSVwiLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfGxpbmUwXG4gICAgICAgICAgICB8bGluZTFcbiAgICAgICAgICAgIGxpbmUyXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIkFCQ1wiKVxuXG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBBQnxDbGluZTBcbiAgICAgICAgICAgIEFCIUNsaW5lMVxuICAgICAgICAgICAgbGluZTJcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICAgICMgRklYTUUgc2hvdWxkIHB1dCBsYXN0LWN1cnNvciBwb3NpdGlvbiBhdCB0b3Agb2YgYmxvY2tTZWxlY3Rpb25cbiAgICAgICAgICAjICB0byByZW1vdmUgYGtgIG1vdGlvblxuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZSBrXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBBQiFDbGluZTBcbiAgICAgICAgICAgIEFCQ2xpbmUxXG4gICAgICAgICAgICBsaW5lMlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgICAgIyBUaGlzIHNob3VsZCBzdWNjZXNzXG4gICAgICAgICAgZW5zdXJlIFwibCAuXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBBQkNBQnxDbGluZTBcbiAgICAgICAgICAgIEFCQ0FCIUNsaW5lMVxuICAgICAgICAgICAgbGluZTJcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgZGVzY3JpYmUgXCJBXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0IGF0IGNvbHVtbiBvZiBlbmQgb2Ygc2VsZWN0aW9uIGZvciAqZWFjaCBzZWxlY3Rpb24qXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiQVwiLCBjdXJzb3I6IFtbMSwgNV0sIFsyLCA1XSwgWzMsIDVdXSwgbW9kZTogXCJpbnNlcnRcIlxuXG4gICAgZGVzY3JpYmUgXCJ2aXN1YWwtbW9kZS5jaGFyYWN0ZXJ3aXNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCA0XVxuICAgICAgICBlbnN1cmUgXCJ2IDIgalwiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAgNDU2IDg5MFxuICAgICAgICAgICAgMjogMzQ1NiA4OTBcbiAgICAgICAgICAgICAgM1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICBkZXNjcmliZSBcIkkgaXMgc2hvcnQgaGFuZCBvZiBgY3RybC12IElgXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0IGF0IGNvbHVtIG9mIHN0YXJ0IG9mIHNlbGVjdGlvbiBmb3IgKmVhY2ggc2VsZWN0ZWQgbGluZXMqXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiSVwiLCBjdXJzb3I6IFtbMSwgNF0sIFsyLCA0XSwgWzMsIDRdXSwgbW9kZTogXCJpbnNlcnRcIlxuICAgICAgZGVzY3JpYmUgXCJBIGlzIHNob3J0IGhhbmQgb2YgYGN0cmwtdiBBYFwiLCAtPlxuICAgICAgICBpdCBcImluc2VydCBhdCBjb2x1bW4gb2YgZW5kIG9mIHNlbGVjdGlvbiBmb3IgKmVhY2ggc2VsZWN0ZWQgbGluZXMqXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiQVwiLCBjdXJzb3I6IFtbMSwgNV0sIFsyLCA1XSwgWzMsIDVdXSwgbW9kZTogXCJpbnNlcnRcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIG9jY3VycmVuY2UgbWFya2VyIGludGVyc2VsY3RzIEkgYW5kIEEgbm8gbG9uZ2VyIGJlaGF2ZSBibG9ja3dpc2UgaW4gdkMvdkxcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShlZGl0b3JFbGVtZW50KVxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWyczNDU2JywgJzM0NTYnLCAnMzQ1NicsICczNDU2J10sIGN1cnNvcjogWzEsIDNdXG4gICAgICBkZXNjcmliZSBcInZDXCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwiSSBhbmQgQSBOT1QgYmVoYXZlIGFzIGBjdHJsLXYgSWBcIiwgLT5cbiAgICAgICAgICBpdCBcIkkgaW5zZXJ0IGF0IHN0YXJ0IG9mIGVhY2ggdnN1YWxseSBzZWxlY3RlZCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJ2IGogaiBJXCIsXG4gICAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICAgICAgX18wOiAzNDU2IDg5MFxuICAgICAgICAgICAgICAgIDE6ICEzNDU2IDg5MFxuICAgICAgICAgICAgICAgIF9fMjogfDM0NTYgODkwXG4gICAgICAgICAgICAgICAgX19fXzM6IDM0NTYgODkwXG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgaXQgXCJBIGluc2VydCBhdCBlbmQgb2YgZWFjaCB2c3VhbGx5IHNlbGVjdGVkIG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcInYgaiBqIEFcIixcbiAgICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgICAgICBfXzA6IDM0NTYgODkwXG4gICAgICAgICAgICAgICAgMTogMzQ1NiEgODkwXG4gICAgICAgICAgICAgICAgX18yOiAzNDU2fCA4OTBcbiAgICAgICAgICAgICAgICBfX19fMzogMzQ1NiA4OTBcbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwidkxcIiwgLT5cbiAgICAgICAgZGVzY3JpYmUgXCJJIGFuZCBBIE5PVCBiZWhhdmUgYXMgYGN0cmwtdiBJYFwiLCAtPlxuICAgICAgICAgIGl0IFwiSSBpbnNlcnQgYXQgc3RhcnQgb2YgZWFjaCB2c3VhbGx5IHNlbGVjdGVkIG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcIlYgaiBqIElcIixcbiAgICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgICAgICBfXzA6IDM0NTYgODkwXG4gICAgICAgICAgICAgICAgMTogfDM0NTYgODkwXG4gICAgICAgICAgICAgICAgIF8yOiB8MzQ1NiA4OTBcbiAgICAgICAgICAgICAgICBfX19fMzogITM0NTYgODkwXG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgaXQgXCJBIGluc2VydCBhdCBlbmQgb2YgZWFjaCB2c3VhbGx5IHNlbGVjdGVkIG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcIlYgaiBqIEFcIixcbiAgICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgICAgICBfXzA6IDM0NTYgODkwXG4gICAgICAgICAgICAgICAgMTogMzQ1NnwgODkwXG4gICAgICAgICAgICAgICAgX18yOiAzNDU2fCA4OTBcbiAgICAgICAgICAgICAgICBfX19fMzogMzQ1NiEgODkwXG4gICAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgZ0kga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgX190aGlzIGlzIHRleHRcbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImluIG5vcm1hbC1tb2RlLlwiLCAtPlxuICAgICAgaXQgXCJzdGFydCBhdCBpbnNlcnQgYXQgY29sdW1uIDAgcmVnYXJkbGVzcyBvZiBjdXJyZW50IGNvbHVtblwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgZW5zdXJlIFwiZyBJXCIsIGN1cnNvcjogWzAsIDBdLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlIFwiZyBJXCIsIGN1cnNvcjogWzAsIDBdLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTNdXG4gICAgICAgIGVuc3VyZSBcImcgSVwiLCBjdXJzb3I6IFswLCAwXSwgbW9kZTogJ2luc2VydCdcblxuICAgIGRlc2NyaWJlIFwiaW4gdmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIF9fMDogMzQ1NiA4OTBcbiAgICAgICAgICAxOiAzNDU2IDg5MFxuICAgICAgICAgIF9fMjogMzQ1NiA4OTBcbiAgICAgICAgICBfX19fMzogMzQ1NiA4OTBcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJbY2hhcmFjdGVyd2lzZV1cIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDRdXG4gICAgICAgIGVuc3VyZSBcInYgMiBqXCIsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICA0NTYgODkwXG4gICAgICAgICAgICAyOiAzNDU2IDg5MFxuICAgICAgICAgICAgICAzXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgIGVuc3VyZSBcImcgSVwiLFxuICAgICAgICAgIGN1cnNvcjogW1sxLCAwXSwgWzIsIDBdLCBbMywgMF1dLCBtb2RlOiBcImluc2VydFwiXG5cbiAgICAgIGl0IFwiW2xpbmV3aXNlXVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlIFwiViAyIGpcIixcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgIDE6IDM0NTYgODkwXG4gICAgICAgICAgICAyOiAzNDU2IDg5MFxuICAgICAgICAgICAgICAzOiAzNDU2IDg5MFxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgZW5zdXJlIFwiZyBJXCIsXG4gICAgICAgICAgY3Vyc29yOiBbWzEsIDBdLCBbMiwgMF0sIFszLCAwXV0sIG1vZGU6IFwiaW5zZXJ0XCJcblxuICAgICAgaXQgXCJbYmxvY2t3aXNlXVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgNF1cbiAgICAgICAgZW5zdXJlIFwiY3RybC12IDIgalwiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wiNFwiLCBcIiBcIiwgXCIzXCJdXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgICAgZW5zdXJlIFwiZyBJXCIsXG4gICAgICAgICAgY3Vyc29yOiBbWzEsIDBdLCBbMiwgMF0sIFszLCAwXV0sIG1vZGU6IFwiaW5zZXJ0XCJcblxuICBkZXNjcmliZSBcIkluc2VydEF0UHJldmlvdXNGb2xkU3RhcnQgYW5kIE5leHRcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuICAgICAgZ2V0VmltU3RhdGUgJ3NhbXBsZS5jb2ZmZWUnLCAoc3RhdGUsIHZpbSkgLT5cbiAgICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSBzdGF0ZVxuICAgICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSB2aW1cblxuICAgICAgcnVucyAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMubm9ybWFsLW1vZGUnOlxuICAgICAgICAgICAgJ2cgWyc6ICd2aW0tbW9kZS1wbHVzOmluc2VydC1hdC1wcmV2aW91cy1mb2xkLXN0YXJ0J1xuICAgICAgICAgICAgJ2cgXSc6ICd2aW0tbW9kZS1wbHVzOmluc2VydC1hdC1uZXh0LWZvbGQtc3RhcnQnXG5cbiAgICBhZnRlckVhY2ggLT5cbiAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBub3QgYXQgZm9sZCBzdGFydCByb3dcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzE2LCAwXVxuICAgICAgaXQgXCJpbnNlcnQgYXQgcHJldmlvdXMgZm9sZCBzdGFydCByb3dcIiwgLT5cbiAgICAgICAgZW5zdXJlICdnIFsnLCBjdXJzb3I6IFs5LCAyXSwgbW9kZTogJ2luc2VydCdcbiAgICAgIGl0IFwiaW5zZXJ0IGF0IG5leHQgZm9sZCBzdGFydCByb3dcIiwgLT5cbiAgICAgICAgZW5zdXJlICdnIF0nLCBjdXJzb3I6IFsxOCwgNF0sIG1vZGU6ICdpbnNlcnQnXG5cbiAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIGF0IGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICAjIE5vdGhpbmcgc3BlY2lhbCB3aGVuIGN1cnNvciBpcyBhdCBmb2xkIHN0YXJ0IHJvdyxcbiAgICAgICMgb25seSBmb3IgdGVzdCBzY2VuYXJpbyB0aHJvdWdobmVzcy5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIwLCA2XVxuICAgICAgaXQgXCJpbnNlcnQgYXQgcHJldmlvdXMgZm9sZCBzdGFydCByb3dcIiwgLT5cbiAgICAgICAgZW5zdXJlICdnIFsnLCBjdXJzb3I6IFsxOCwgNF0sIG1vZGU6ICdpbnNlcnQnXG4gICAgICBpdCBcImluc2VydCBhdCBuZXh0IGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBdJywgY3Vyc29yOiBbMjIsIDZdLCBtb2RlOiAnaW5zZXJ0J1xuXG4gIGRlc2NyaWJlIFwidGhlIGkga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfDEyM1xuICAgICAgICAgIHw0NTY3XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBpdCBcImFsbG93cyB1bmRvaW5nIGFuIGVudGlyZSBiYXRjaCBvZiB0eXBpbmdcIiwgLT5cbiAgICAgIGtleXN0cm9rZSAnaSdcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYWJjWFhcIilcbiAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgZWRpdG9yLmJhY2tzcGFjZSgpXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiYWJjMTIzXFxuYWJjNDU2N1wiXG5cbiAgICAgIGtleXN0cm9rZSAnaSdcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiZFwiXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImVcIlxuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJmXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCJhYmRlZmMxMjNcXG5hYmRlZmM0NTY3XCJcbiAgICAgIGVuc3VyZSAndScsIHRleHQ6IFwiYWJjMTIzXFxuYWJjNDU2N1wiXG4gICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiBcIjEyM1xcbjQ1NjdcIlxuXG4gICAgaXQgXCJhbGxvd3MgcmVwZWF0aW5nIHR5cGluZ1wiLCAtPlxuICAgICAga2V5c3Ryb2tlICdpJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhYmNYWFwiKVxuICAgICAgZWRpdG9yLmJhY2tzcGFjZSgpXG4gICAgICBlZGl0b3IuYmFja3NwYWNlKClcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCJhYmMxMjNcXG5hYmM0NTY3XCJcbiAgICAgIGVuc3VyZSAnLicsICAgICAgdGV4dDogXCJhYmFiY2MxMjNcXG5hYmFiY2M0NTY3XCJcbiAgICAgIGVuc3VyZSAnLicsICAgICAgdGV4dDogXCJhYmFiYWJjY2MxMjNcXG5hYmFiYWJjY2M0NTY3XCJcblxuICAgIGRlc2NyaWJlICd3aXRoIG5vbmxpbmVhciBpbnB1dCcsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgJ2RlYWxzIHdpdGggYXV0by1tYXRjaGVkIGJyYWNrZXRzJywgLT5cbiAgICAgICAga2V5c3Ryb2tlICdpJ1xuICAgICAgICAjIHRoaXMgc2VxdWVuY2Ugc2ltdWxhdGVzIHdoYXQgdGhlIGJyYWNrZXQtbWF0Y2hlciBwYWNrYWdlIGRvZXNcbiAgICAgICAgIyB3aGVuIHRoZSB1c2VyIHR5cGVzIChhKWI8ZW50ZXI+XG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICcoKSdcbiAgICAgICAgZWRpdG9yLm1vdmVMZWZ0KClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgJ2EnXG4gICAgICAgIGVkaXRvci5tb3ZlUmlnaHQoKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnYlxcbidcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBjdXJzb3I6IFsxLCAgMF1cbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0OiAnKGEpYlxcbihhKWJcXG4nXG4gICAgICAgICAgY3Vyc29yOiBbMiwgIDBdXG5cbiAgICAgIGl0ICdkZWFscyB3aXRoIGF1dG9jb21wbGV0ZScsIC0+XG4gICAgICAgIGtleXN0cm9rZSAnaSdcbiAgICAgICAgIyB0aGlzIHNlcXVlbmNlIHNpbXVsYXRlcyBhdXRvY29tcGxldGlvbiBvZiAnYWRkJyB0byAnYWRkRm9vJ1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnYSdcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgJ2QnXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICdkJ1xuICAgICAgICBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UgW1swLCAwXSwgWzAsIDNdXSwgJ2FkZEZvbydcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICAgIGN1cnNvcjogWzAsICA1XVxuICAgICAgICAgIHRleHQ6ICdhZGRGb28nXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dDogJ2FkZEZvYWRkRm9vbydcbiAgICAgICAgICBjdXJzb3I6IFswLCAgMTBdXG5cbiAgZGVzY3JpYmUgJ3RoZSBhIGtleWJpbmRpbmcnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiAnJ1xuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJjYW4gYmUgdW5kb25lIGluIG9uZSBnb1wiLCAtPlxuICAgICAga2V5c3Ryb2tlICdhJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhYmNcIilcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCJhYmNcIlxuICAgICAgZW5zdXJlICd1JywgdGV4dDogXCJcIlxuXG4gICAgaXQgXCJyZXBlYXRzIGNvcnJlY3RseVwiLCAtPlxuICAgICAga2V5c3Ryb2tlICdhJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhYmNcIilcbiAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgdGV4dDogXCJhYmNcIlxuICAgICAgICBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgdGV4dDogXCJhYmNhYmNcIlxuICAgICAgICBjdXJzb3I6IFswLCA1XVxuXG4gIGRlc2NyaWJlICdwcmVzZXJ2ZSBpbnNlcnRlZCB0ZXh0JywgLT5cbiAgICBlbnN1cmVEb3RSZWdpc3RlciA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBlbnN1cmVEb3RSZWdpc3RlciA9IChrZXksIHt0ZXh0fSkgLT5cbiAgICAgICAgZW5zdXJlIGtleSwgbW9kZTogJ2luc2VydCdcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQodGV4dClcbiAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIHJlZ2lzdGVyOiAnLic6IHRleHQ6IHRleHRcblxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXFxuXFxuXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwiW2Nhc2UtaV1cIiwgLT4gZW5zdXJlRG90UmVnaXN0ZXIgJ2knLCB0ZXh0OiAnaWFiYydcbiAgICBpdCBcIltjYXNlLW9dXCIsIC0+IGVuc3VyZURvdFJlZ2lzdGVyICdvJywgdGV4dDogJ29hYmMnXG4gICAgaXQgXCJbY2FzZS1jXVwiLCAtPiBlbnN1cmVEb3RSZWdpc3RlciAnYyBsJywgdGV4dDogJ2NhYmMnXG4gICAgaXQgXCJbY2FzZS1DXVwiLCAtPiBlbnN1cmVEb3RSZWdpc3RlciAnQycsIHRleHQ6ICdDYWJjJ1xuICAgIGl0IFwiW2Nhc2Utc11cIiwgLT4gZW5zdXJlRG90UmVnaXN0ZXIgJ3MnLCB0ZXh0OiAnc2FiYydcblxuICBkZXNjcmliZSBcInJlcGVhdCBiYWNrc3BhY2UvZGVsZXRlIGhhcHBlbmVkIGluIGluc2VydC1tb2RlXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJzaW5nbGUgY3Vyc29yIG9wZXJhdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDEyM1xuICAgICAgICAgIDEyM1xuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcImNhbiByZXBlYXQgYmFja3NwYWNlIG9ubHkgbXV0YXRpb246IGNhc2UtaVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAga2V5c3Ryb2tlICdpJ1xuICAgICAgICBlZGl0b3IuYmFja3NwYWNlKClcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIjIzXFxuMTIzXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnaiAuJywgdGV4dDogXCIyM1xcbjEyM1wiICMgbm90aGluZyBoYXBwZW5cbiAgICAgICAgZW5zdXJlICdsIC4nLCB0ZXh0OiBcIjIzXFxuMjNcIlxuXG4gICAgICBpdCBcImNhbiByZXBlYXQgYmFja3NwYWNlIG9ubHkgbXV0YXRpb246IGNhc2UtYVwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ2EnXG4gICAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiMjNcXG4xMjNcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIzXFxuMTIzXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnaiAuIC4nLCB0ZXh0OiBcIjNcXG4zXCJcblxuICAgICAgaXQgXCJjYW4gcmVwZWF0IGRlbGV0ZSBvbmx5IG11dGF0aW9uOiBjYXNlLWlcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICdpJ1xuICAgICAgICBlZGl0b3IuZGVsZXRlKClcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIjIzXFxuMTIzXCJcbiAgICAgICAgZW5zdXJlICdqIC4nLCB0ZXh0OiBcIjIzXFxuMjNcIlxuXG4gICAgICBpdCBcImNhbiByZXBlYXQgZGVsZXRlIG9ubHkgbXV0YXRpb246IGNhc2UtYVwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ2EnXG4gICAgICAgIGVkaXRvci5kZWxldGUoKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiMTNcXG4xMjNcIlxuICAgICAgICBlbnN1cmUgJ2ogLicsIHRleHQ6IFwiMTNcXG4xM1wiXG5cbiAgICAgIGl0IFwiY2FuIHJlcGVhdCBiYWNrc3BhY2UgYW5kIGluc2VydCBtdXRhdGlvbjogY2FzZS1pXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBrZXlzdHJva2UgJ2knXG4gICAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiEhIVwiKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiISEhMjNcXG4xMjNcIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIhISEyM1xcbiEhITIzXCJcblxuICAgICAgaXQgXCJjYW4gcmVwZWF0IGJhY2tzcGFjZSBhbmQgaW5zZXJ0IG11dGF0aW9uOiBjYXNlLWFcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICdhJ1xuICAgICAgICBlZGl0b3IuYmFja3NwYWNlKClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCIhISFcIilcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIiEhITIzXFxuMTIzXCJcbiAgICAgICAgZW5zdXJlICdqIDAgLicsIHRleHQ6IFwiISEhMjNcXG4hISEyM1wiXG5cbiAgICAgIGl0IFwiY2FuIHJlcGVhdCBkZWxldGUgYW5kIGluc2VydCBtdXRhdGlvbjogY2FzZS1pXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAnaSdcbiAgICAgICAgZWRpdG9yLmRlbGV0ZSgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiISEhXCIpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIhISEyM1xcbjEyM1wiXG4gICAgICAgIGVuc3VyZSAnaiAwIC4nLCB0ZXh0OiBcIiEhITIzXFxuISEhMjNcIlxuXG4gICAgICBpdCBcImNhbiByZXBlYXQgZGVsZXRlIGFuZCBpbnNlcnQgbXV0YXRpb246IGNhc2UtYVwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ2EnXG4gICAgICAgIGVkaXRvci5kZWxldGUoKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiEhIVwiKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiMSEhITNcXG4xMjNcIlxuICAgICAgICBlbnN1cmUgJ2ogMCAuJywgdGV4dDogXCIxISEhM1xcbjEhISEzXCJcblxuICAgIGRlc2NyaWJlIFwibXVsdGktY3Vyc29ycyBvcGVyYXRpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHwxMjNcblxuICAgICAgICAgIHwxMjM0XG5cbiAgICAgICAgICB8MTIzNDVcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJjYW4gcmVwZWF0IGJhY2tzcGFjZSBvbmx5IG11dGF0aW9uOiBjYXNlLW11bHRpLWN1cnNvcnNcIiwgLT5cbiAgICAgICAgZW5zdXJlICdBJywgY3Vyc29yOiBbWzAsIDNdLCBbMiwgNF0sIFs0LCA1XV0sIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiMTJcXG5cXG4xMjNcXG5cXG4xMjM0XCIsIGN1cnNvcjogW1swLCAxXSwgWzIsIDJdLCBbNCwgM11dXG4gICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiMVxcblxcbjEyXFxuXFxuMTIzXCIsIGN1cnNvcjogW1swLCAwXSwgWzIsIDFdLCBbNCwgMl1dXG5cbiAgICAgIGl0IFwiY2FuIHJlcGVhdCBkZWxldGUgb25seSBtdXRhdGlvbjogY2FzZS1tdWx0aS1jdXJzb3JzXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnSScsIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIGVkaXRvci5kZWxldGUoKVxuICAgICAgICBjdXJzb3JzID0gW1swLCAwXSwgWzIsIDBdLCBbNCwgMF1dXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIyM1xcblxcbjIzNFxcblxcbjIzNDVcIiwgY3Vyc29yOiBjdXJzb3JzXG4gICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiM1xcblxcbjM0XFxuXFxuMzQ1XCIsIGN1cnNvcjogY3Vyc29yc1xuICAgICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIlxcblxcbjRcXG5cXG40NVwiLCBjdXJzb3I6IGN1cnNvcnNcbiAgICAgICAgZW5zdXJlICcuJywgdGV4dDogXCJcXG5cXG5cXG5cXG41XCIsIGN1cnNvcjogY3Vyc29yc1xuICAgICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIlxcblxcblxcblxcblwiLCBjdXJzb3I6IGN1cnNvcnNcblxuICBkZXNjcmliZSAnc3BlY2lmeSBpbnNlcnRpb24gY291bnQnLCAtPlxuICAgIGVuc3VyZUluc2VydGlvbkNvdW50ID0gKGtleSwge2luc2VydCwgdGV4dCwgY3Vyc29yfSkgLT5cbiAgICAgIGtleXN0cm9rZSBrZXlcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KGluc2VydClcbiAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCB0ZXh0OiB0ZXh0LCBjdXJzb3I6IGN1cnNvclxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgaW5pdGlhbFRleHQgPSBcIipcXG4qXFxuXCJcbiAgICAgIHNldCB0ZXh0OiBcIlwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAga2V5c3Ryb2tlICdpJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQoaW5pdGlhbFRleHQpXG4gICAgICBlbnN1cmUgXCJlc2NhcGUgZyBnXCIsIHRleHQ6IGluaXRpYWxUZXh0LCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJyZXBlYXQgaW5zZXJ0aW9uIGNvdW50IHRpbWVzXCIsIC0+XG4gICAgICBpdCBcIltjYXNlLWldXCIsIC0+IGVuc3VyZUluc2VydGlvbkNvdW50ICczIGknLCBpbnNlcnQ6ICc9JywgdGV4dDogXCI9PT0qXFxuKlxcblwiLCBjdXJzb3I6IFswLCAyXVxuICAgICAgaXQgXCJbY2FzZS1vXVwiLCAtPiBlbnN1cmVJbnNlcnRpb25Db3VudCAnMyBvJywgaW5zZXJ0OiAnPScsIHRleHQ6IFwiKlxcbj1cXG49XFxuPVxcbipcXG5cIiwgY3Vyc29yOiBbMywgMF1cbiAgICAgIGl0IFwiW2Nhc2UtT11cIiwgLT4gZW5zdXJlSW5zZXJ0aW9uQ291bnQgJzMgTycsIGluc2VydDogJz0nLCB0ZXh0OiBcIj1cXG49XFxuPVxcbipcXG4qXFxuXCIsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiY2hpbGRyZW4gb2YgQ2hhbmdlIG9wZXJhdGlvbiB3b24ndCByZXBlYXRlIGluc2VydGlvbiBjb3VudCB0aW1lc1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHRleHQ6IFwiXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAga2V5c3Ryb2tlICdpJ1xuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCcqJylcbiAgICAgICAgICBlbnN1cmUgJ2VzY2FwZSBnIGcnLCB0ZXh0OiAnKicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgaXQgXCJbY2FzZS1jXVwiLCAtPiBlbnN1cmVJbnNlcnRpb25Db3VudCAnMyBjIHcnLCBpbnNlcnQ6ICc9JywgdGV4dDogXCI9XCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGl0IFwiW2Nhc2UtQ11cIiwgLT4gZW5zdXJlSW5zZXJ0aW9uQ291bnQgJzMgQycsIGluc2VydDogJz0nLCB0ZXh0OiBcIj1cIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgaXQgXCJbY2FzZS1zXVwiLCAtPiBlbnN1cmVJbnNlcnRpb25Db3VudCAnMyBzJywgaW5zZXJ0OiAnPScsIHRleHQ6IFwiPVwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBpdCBcIltjYXNlLVNdXCIsIC0+IGVuc3VyZUluc2VydGlvbkNvdW50ICczIFMnLCBpbnNlcnQ6ICc9JywgdGV4dDogXCI9XCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcInRocm90dG9saW5nIGludGVydGlvbiBjb3VudCB0byAxMDAgYXQgbWF4aW11bVwiLCAtPlxuICAgICAgaXQgXCJpbnNlcnQgMTAwIHRpbWVzIGF0IG1heGltdW0gZXZlbiBpZiBiaWcgY291bnQgd2FzIGdpdmVuXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnJ1xuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKSkudG9CZSgwKVxuICAgICAgICBlbnN1cmUgJzUgNSA1IDUgNSA1IDUgaScsIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYVxcblwiKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpKS50b0JlKDEwMSlcbiJdfQ==
