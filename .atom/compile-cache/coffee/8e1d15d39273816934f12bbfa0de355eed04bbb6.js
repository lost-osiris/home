(function() {
  var getVimState, settings,
    slice = [].slice;

  getVimState = require('./spec-helper').getVimState;

  settings = require('../lib/settings');

  describe("Prefixes", function() {
    var editor, editorElement, ensure, keystroke, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], keystroke = ref[2], editor = ref[3], editorElement = ref[4], vimState = ref[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
    });
    describe("Repeat", function() {
      describe("with operations", function() {
        beforeEach(function() {
          return set({
            text: "123456789abc",
            cursor: [0, 0]
          });
        });
        it("repeats N times", function() {
          return ensure('3 x', {
            text: '456789abc'
          });
        });
        return it("repeats NN times", function() {
          return ensure('1 0 x', {
            text: 'bc'
          });
        });
      });
      describe("with motions", function() {
        beforeEach(function() {
          return set({
            text: 'one two three',
            cursor: [0, 0]
          });
        });
        return it("repeats N times", function() {
          return ensure('d 2 w', {
            text: 'three'
          });
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          return set({
            text: 'one two three',
            cursor: [0, 0]
          });
        });
        return it("repeats movements in visual mode", function() {
          return ensure('v 2 w', {
            cursor: [0, 9]
          });
        });
      });
    });
    describe("Register", function() {
      beforeEach(function() {
        return vimState.globalState.reset('register');
      });
      describe("the a register", function() {
        it("saves a value for future reading", function() {
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
        });
        return it("overwrites a value previously in the register", function() {
          set({
            register: {
              a: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
        });
      });
      describe("with yank command", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0],
            text: "aaa bbb ccc"
          });
        });
        it("save to pre specified register", function() {
          ensure('" a y i w', {
            register: {
              a: {
                text: 'aaa'
              }
            }
          });
          ensure('w " b y i w', {
            register: {
              b: {
                text: 'bbb'
              }
            }
          });
          return ensure('w " c y i w', {
            register: {
              c: {
                text: 'ccc'
              }
            }
          });
        });
        return it("work with motion which also require input such as 't'", function() {
          return ensure([
            '" a y t', {
              input: 'c'
            }
          ], {
            register: {
              a: {
                text: 'aaa bbb '
              }
            }
          });
        });
      });
      describe("With p command", function() {
        beforeEach(function() {
          vimState.globalState.reset('register');
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return set({
            text: "abc\ndef",
            cursor: [0, 0]
          });
        });
        describe("when specified register have no text", function() {
          it("can paste from a register", function() {
            ensure({
              mode: "normal"
            });
            return ensure([
              '"', {
                input: 'a'
              }, 'p'
            ], {
              text: "anew contentbc\ndef",
              cursor: [0, 11]
            });
          });
          return it("but do nothing for z register", function() {
            return ensure([
              '"', {
                input: 'z'
              }, 'p'
            ], {
              text: "abc\ndef",
              cursor: [0, 0]
            });
          });
        });
        return describe("blockwise-mode paste just use register have no text", function() {
          return it("paste from a register to each selction", function() {
            return ensure([
              'ctrl-v j "', {
                input: 'a'
              }, 'p'
            ], {
              textC: "!new contentbc\nnew contentef"
            });
          });
        });
      });
      describe("the B register", function() {
        it("saves a value for future reading", function() {
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          ensure({
            register: {
              b: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
        });
        it("appends to a value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              b: {
                text: 'contentnew content'
              }
            }
          });
        });
        it("appends linewise to a linewise value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content\n',
                type: 'linewise'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              b: {
                text: 'content\nnew content\n'
              }
            }
          });
        });
        return it("appends linewise to a character value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content\n',
                type: 'linewise'
              }
            }
          });
          return ensure({
            register: {
              b: {
                text: 'content\nnew content\n'
              }
            }
          });
        });
      });
      describe("the * register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            return ensure({
              register: {
                '*': {
                  text: 'initial clipboard content',
                  type: 'characterwise'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return set({
              register: {
                '*': {
                  text: 'new content'
                }
              }
            });
          });
          return it("overwrites the contents of the system clipboard", function() {
            return expect(atom.clipboard.read()).toEqual('new content');
          });
        });
      });
      describe("the + register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            return ensure({
              register: {
                '*': {
                  text: 'initial clipboard content',
                  type: 'characterwise'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return set({
              register: {
                '*': {
                  text: 'new content'
                }
              }
            });
          });
          return it("overwrites the contents of the system clipboard", function() {
            return expect(atom.clipboard.read()).toEqual('new content');
          });
        });
      });
      describe("the _ register", function() {
        describe("reading", function() {
          return it("is always the empty string", function() {
            return ensure({
              register: {
                '_': {
                  text: ''
                }
              }
            });
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            set({
              register: {
                '_': {
                  text: 'new content'
                }
              }
            });
            return ensure({
              register: {
                '_': {
                  text: ''
                }
              }
            });
          });
        });
      });
      describe("the % register", function() {
        beforeEach(function() {
          return spyOn(editor, 'getURI').andReturn('/Users/atom/known_value.txt');
        });
        describe("reading", function() {
          return it("returns the filename of the current editor", function() {
            return ensure({
              register: {
                '%': {
                  text: '/Users/atom/known_value.txt'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            set({
              register: {
                '%': {
                  text: 'new content'
                }
              }
            });
            return ensure({
              register: {
                '%': {
                  text: '/Users/atom/known_value.txt'
                }
              }
            });
          });
        });
      });
      describe("the ctrl-r command in insert mode", function() {
        beforeEach(function() {
          set({
            register: {
              '"': {
                text: '345'
              }
            }
          });
          set({
            register: {
              'a': {
                text: 'abc'
              }
            }
          });
          set({
            register: {
              '*': {
                text: 'abc'
              }
            }
          });
          atom.clipboard.write("clip");
          set({
            text: "012\n",
            cursor: [0, 2]
          });
          return ensure('i', {
            mode: 'insert'
          });
        });
        describe("useClipboardAsDefaultRegister = true", function() {
          beforeEach(function() {
            settings.set('useClipboardAsDefaultRegister', true);
            set({
              register: {
                '"': {
                  text: '345'
                }
              }
            });
            return atom.clipboard.write("clip");
          });
          return it("inserts contents from clipboard with \"", function() {
            return ensure([
              'ctrl-r', {
                input: '"'
              }
            ], {
              text: '01clip2\n'
            });
          });
        });
        describe("useClipboardAsDefaultRegister = false", function() {
          beforeEach(function() {
            settings.set('useClipboardAsDefaultRegister', false);
            set({
              register: {
                '"': {
                  text: '345'
                }
              }
            });
            return atom.clipboard.write("clip");
          });
          return it("inserts contents from \" with \"", function() {
            return ensure([
              'ctrl-r', {
                input: '"'
              }
            ], {
              text: '013452\n'
            });
          });
        });
        it("inserts contents of the 'a' register", function() {
          return ensure([
            'ctrl-r', {
              input: 'a'
            }
          ], {
            text: '01abc2\n'
          });
        });
        return it("is cancelled with the escape key", function() {
          return ensure('ctrl-r escape', {
            text: '012\n',
            mode: 'insert',
            cursor: [0, 2]
          });
        });
      });
      return describe("per selection clipboard", function() {
        var ensurePerSelectionRegister;
        ensurePerSelectionRegister = function() {
          var i, j, len, ref1, results, selection, texts;
          texts = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          ref1 = editor.getSelections();
          results = [];
          for (i = j = 0, len = ref1.length; j < len; i = ++j) {
            selection = ref1[i];
            results.push(ensure({
              register: {
                '*': {
                  text: texts[i],
                  selection: selection
                }
              }
            }));
          }
          return results;
        };
        beforeEach(function() {
          settings.set('useClipboardAsDefaultRegister', true);
          return set({
            text: "012:\nabc:\ndef:\n",
            cursor: [[0, 1], [1, 1], [2, 1]]
          });
        });
        describe("on selection destroye", function() {
          return it("remove corresponding subscriptin and clipboard entry", function() {
            var clipboardBySelection, j, len, ref1, ref2, selection, subscriptionBySelection;
            ref1 = vimState.register, clipboardBySelection = ref1.clipboardBySelection, subscriptionBySelection = ref1.subscriptionBySelection;
            expect(clipboardBySelection.size).toBe(0);
            expect(subscriptionBySelection.size).toBe(0);
            keystroke("y i w");
            ensurePerSelectionRegister('012', 'abc', 'def');
            expect(clipboardBySelection.size).toBe(3);
            expect(subscriptionBySelection.size).toBe(3);
            ref2 = editor.getSelections();
            for (j = 0, len = ref2.length; j < len; j++) {
              selection = ref2[j];
              selection.destroy();
            }
            expect(clipboardBySelection.size).toBe(0);
            return expect(subscriptionBySelection.size).toBe(0);
          });
        });
        describe("Yank", function() {
          return it("save text to per selection register", function() {
            keystroke("y i w");
            return ensurePerSelectionRegister('012', 'abc', 'def');
          });
        });
        describe("Delete family", function() {
          it("d", function() {
            ensure("d i w", {
              text: ":\n:\n:\n"
            });
            return ensurePerSelectionRegister('012', 'abc', 'def');
          });
          it("x", function() {
            ensure("x", {
              text: "02:\nac:\ndf:\n"
            });
            return ensurePerSelectionRegister('1', 'b', 'e');
          });
          it("X", function() {
            ensure("X", {
              text: "12:\nbc:\nef:\n"
            });
            return ensurePerSelectionRegister('0', 'a', 'd');
          });
          return it("D", function() {
            ensure("D", {
              text: "0\na\nd\n"
            });
            return ensurePerSelectionRegister('12:', 'bc:', 'ef:');
          });
        });
        describe("Put family", function() {
          it("p paste text from per selection register", function() {
            return ensure("y i w $ p", {
              text: "012:012\nabc:abc\ndef:def\n"
            });
          });
          return it("P paste text from per selection register", function() {
            return ensure("y i w $ P", {
              text: "012012:\nabcabc:\ndefdef:\n"
            });
          });
        });
        return describe("ctrl-r in insert mode", function() {
          return it("insert from per selection registe", function() {
            ensure("d i w", {
              text: ":\n:\n:\n"
            });
            ensure('a', {
              mode: 'insert'
            });
            return ensure([
              'ctrl-r', {
                input: '"'
              }
            ], {
              text: ":012\n:abc\n:def\n"
            });
          });
        });
      });
    });
    return describe("Count modifier", function() {
      beforeEach(function() {
        return set({
          text: "000 111 222 333 444 555 666 777 888 999",
          cursor: [0, 0]
        });
      });
      it("repeat operator", function() {
        return ensure('3 d w', {
          text: "333 444 555 666 777 888 999"
        });
      });
      it("repeat motion", function() {
        return ensure('d 2 w', {
          text: "222 333 444 555 666 777 888 999"
        });
      });
      return it("repeat operator and motion respectively", function() {
        return ensure('3 d 2 w', {
          text: "666 777 888 999"
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9wcmVmaXgtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUE7O0VBQUMsY0FBZSxPQUFBLENBQVEsZUFBUjs7RUFDaEIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWCxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBO0FBQ25CLFFBQUE7SUFBQSxNQUE0RCxFQUE1RCxFQUFDLFlBQUQsRUFBTSxlQUFOLEVBQWMsa0JBQWQsRUFBeUIsZUFBekIsRUFBaUMsc0JBQWpDLEVBQWdEO0lBRWhELFVBQUEsQ0FBVyxTQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsYUFBRCxFQUFNLG1CQUFOLEVBQWMseUJBQWQsRUFBMkI7TUFIakIsQ0FBWjtJQURTLENBQVg7SUFNQSxRQUFBLENBQVMsUUFBVCxFQUFtQixTQUFBO01BQ2pCLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBO1FBQzFCLFVBQUEsQ0FBVyxTQUFBO2lCQUNULEdBQUEsQ0FBSTtZQUFBLElBQUEsRUFBTSxjQUFOO1lBQXNCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQTlCO1dBQUo7UUFEUyxDQUFYO1FBR0EsRUFBQSxDQUFHLGlCQUFILEVBQXNCLFNBQUE7aUJBQ3BCLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxJQUFBLEVBQU0sV0FBTjtXQUFkO1FBRG9CLENBQXRCO2VBR0EsRUFBQSxDQUFHLGtCQUFILEVBQXVCLFNBQUE7aUJBQ3JCLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO1lBQUEsSUFBQSxFQUFNLElBQU47V0FBaEI7UUFEcUIsQ0FBdkI7TUFQMEIsQ0FBNUI7TUFVQSxRQUFBLENBQVMsY0FBVCxF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QUFoQjtZQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7Y0FBQSxJQUFBLEVBQU0sUUFBTjthQUFaO21CQUNBLE1BQUEsQ0FBTztjQUFDLFFBQUQsRUFBVztnQkFBQSxLQUFBLEVBQU8sR0FBUDtlQUFYO2FBQVAsRUFDRTtjQUFBLElBQUEsRUFBTSxvQkFBTjthQURGO1VBSHNDLENBQXhDO1FBRGdDLENBQWxDO01BaEVrQyxDQUFwQztJQS9LbUIsQ0FBckI7V0EwUEEsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUE7TUFDekIsVUFBQSxDQUFXLFNBQUE7ZUFDVCxHQUFBLENBQ0U7VUFBQSxJQUFBLEVBQU0seUNBQU47VUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1NBREY7TUFEUyxDQUFYO01BS0EsRUFBQSxDQUFHLGlCQUFILEVBQXNCLFNBQUE7ZUFDcEIsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7VUFBQSxJQUFBLEVBQU0sNkJBQU47U0FBaEI7TUFEb0IsQ0FBdEI7TUFFQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBO2VBQ2xCLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO1VBQUEsSUFBQSxFQUFNLGlDQUFOO1NBQWhCO01BRGtCLENBQXBCO2FBRUEsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUE7ZUFDNUMsTUFBQSxDQUFPLFNBQVAsRUFBa0I7VUFBQSxJQUFBLEVBQU0saUJBQU47U0FBbEI7TUFENEMsQ0FBOUM7SUFWeUIsQ0FBM0I7RUE1Um1CLENBQXJCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGV9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIlByZWZpeGVzXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltXG5cbiAgZGVzY3JpYmUgXCJSZXBlYXRcIiwgLT5cbiAgICBkZXNjcmliZSBcIndpdGggb3BlcmF0aW9uc1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxMjM0NTY3ODlhYmNcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJyZXBlYXRzIE4gdGltZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlICczIHgnLCB0ZXh0OiAnNDU2Nzg5YWJjJ1xuXG4gICAgICBpdCBcInJlcGVhdHMgTk4gdGltZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlICcxIDAgeCcsIHRleHQ6ICdiYydcblxuICAgIGRlc2NyaWJlIFwid2l0aCBtb3Rpb25zXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnb25lIHR3byB0aHJlZScsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwicmVwZWF0cyBOIHRpbWVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCAyIHcnLCB0ZXh0OiAndGhyZWUnXG5cbiAgICBkZXNjcmliZSBcImluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnb25lIHR3byB0aHJlZScsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwicmVwZWF0cyBtb3ZlbWVudHMgaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2IDIgdycsIGN1cnNvcjogWzAsIDldXG5cbiAgZGVzY3JpYmUgXCJSZWdpc3RlclwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHZpbVN0YXRlLmdsb2JhbFN0YXRlLnJlc2V0KCdyZWdpc3RlcicpXG5cbiAgICBkZXNjcmliZSBcInRoZSBhIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBpdCBcInNhdmVzIGEgdmFsdWUgZm9yIGZ1dHVyZSByZWFkaW5nXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYTogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6IGE6IHRleHQ6ICduZXcgY29udGVudCdcblxuICAgICAgaXQgXCJvdmVyd3JpdGVzIGEgdmFsdWUgcHJldmlvdXNseSBpbiB0aGUgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnY29udGVudCdcbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSByZWdpc3RlcjogYTogdGV4dDogJ25ldyBjb250ZW50J1xuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIHlhbmsgY29tbWFuZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGFhYSBiYmIgY2NjXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcInNhdmUgdG8gcHJlIHNwZWNpZmllZCByZWdpc3RlclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1wiIGEgeSBpIHcnLCByZWdpc3RlcjogYTogdGV4dDogJ2FhYSdcbiAgICAgICAgZW5zdXJlICd3IFwiIGIgeSBpIHcnLCByZWdpc3RlcjogYjogdGV4dDogJ2JiYidcbiAgICAgICAgZW5zdXJlICd3IFwiIGMgeSBpIHcnLCByZWdpc3RlcjogYzogdGV4dDogJ2NjYydcblxuICAgICAgaXQgXCJ3b3JrIHdpdGggbW90aW9uIHdoaWNoIGFsc28gcmVxdWlyZSBpbnB1dCBzdWNoIGFzICd0J1wiLCAtPlxuICAgICAgICBlbnN1cmUgWydcIiBhIHkgdCcsIHtpbnB1dDogJ2MnfV0sIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnYWFhIGJiYiAnXG5cbiAgICBkZXNjcmliZSBcIldpdGggcCBjb21tYW5kXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHZpbVN0YXRlLmdsb2JhbFN0YXRlLnJlc2V0KCdyZWdpc3RlcicpXG4gICAgICAgIHNldCByZWdpc3RlcjogYTogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBkZWZcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gc3BlY2lmaWVkIHJlZ2lzdGVyIGhhdmUgbm8gdGV4dFwiLCAtPlxuICAgICAgICBpdCBcImNhbiBwYXN0ZSBmcm9tIGEgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgbW9kZTogXCJub3JtYWxcIlxuICAgICAgICAgIGVuc3VyZSBbJ1wiJywgaW5wdXQ6ICdhJywgJ3AnXSxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYW5ldyBjb250ZW50YmNcbiAgICAgICAgICAgIGRlZlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAxMV1cblxuICAgICAgICBpdCBcImJ1dCBkbyBub3RoaW5nIGZvciB6IHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFsnXCInLCBpbnB1dDogJ3onLCAncCddLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIGRlZlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImJsb2Nrd2lzZS1tb2RlIHBhc3RlIGp1c3QgdXNlIHJlZ2lzdGVyIGhhdmUgbm8gdGV4dFwiLCAtPlxuICAgICAgICBpdCBcInBhc3RlIGZyb20gYSByZWdpc3RlciB0byBlYWNoIHNlbGN0aW9uXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFsnY3RybC12IGogXCInLCBpbnB1dDogJ2EnLCAncCddLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgIW5ldyBjb250ZW50YmNcbiAgICAgICAgICAgIG5ldyBjb250ZW50ZWZcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgQiByZWdpc3RlclwiLCAtPlxuICAgICAgaXQgXCJzYXZlcyBhIHZhbHVlIGZvciBmdXR1cmUgcmVhZGluZ1wiLCAtPlxuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IEI6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSByZWdpc3RlcjogQjogdGV4dDogJ25ldyBjb250ZW50J1xuXG4gICAgICBpdCBcImFwcGVuZHMgdG8gYSB2YWx1ZSBwcmV2aW91c2x5IGluIHRoZSByZWdpc3RlclwiLCAtPlxuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IGI6IHRleHQ6ICdjb250ZW50J1xuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IEI6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnY29udGVudG5ldyBjb250ZW50J1xuXG4gICAgICBpdCBcImFwcGVuZHMgbGluZXdpc2UgdG8gYSBsaW5ld2lzZSB2YWx1ZSBwcmV2aW91c2x5IGluIHRoZSByZWdpc3RlclwiLCAtPlxuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IGI6IHRleHQ6ICdjb250ZW50XFxuJywgdHlwZTogJ2xpbmV3aXNlJ1xuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IEI6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnY29udGVudFxcbm5ldyBjb250ZW50XFxuJ1xuXG4gICAgICBpdCBcImFwcGVuZHMgbGluZXdpc2UgdG8gYSBjaGFyYWN0ZXIgdmFsdWUgcHJldmlvdXNseSBpbiB0aGUgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnY29udGVudCdcbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBCOiB0ZXh0OiAnbmV3IGNvbnRlbnRcXG4nLCB0eXBlOiAnbGluZXdpc2UnXG4gICAgICAgIGVuc3VyZSByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnRcXG5uZXcgY29udGVudFxcbidcblxuICAgIGRlc2NyaWJlIFwidGhlICogcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwicmVhZGluZ1wiLCAtPlxuICAgICAgICBpdCBcImlzIHRoZSBzYW1lIHRoZSBzeXN0ZW0gY2xpcGJvYXJkXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiAnKic6IHRleHQ6ICdpbml0aWFsIGNsaXBib2FyZCBjb250ZW50JywgdHlwZTogJ2NoYXJhY3Rlcndpc2UnXG5cbiAgICAgIGRlc2NyaWJlIFwid3JpdGluZ1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnKic6IHRleHQ6ICduZXcgY29udGVudCdcblxuICAgICAgICBpdCBcIm92ZXJ3cml0ZXMgdGhlIGNvbnRlbnRzIG9mIHRoZSBzeXN0ZW0gY2xpcGJvYXJkXCIsIC0+XG4gICAgICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9FcXVhbCAnbmV3IGNvbnRlbnQnXG5cbiAgICAjIEZJWE1FOiBvbmNlIGxpbnV4IHN1cHBvcnQgY29tZXMgb3V0LCB0aGlzIG5lZWRzIHRvIHJlYWQgZnJvbVxuICAgICMgdGhlIGNvcnJlY3QgY2xpcGJvYXJkLiBGb3Igbm93IGl0IGJlaGF2ZXMganVzdCBsaWtlIHRoZSAqIHJlZ2lzdGVyXG4gICAgIyBTZWUgOmhlbHAgeDExLWN1dC1idWZmZXIgYW5kIDpoZWxwIHJlZ2lzdGVycyBmb3IgbW9yZSBkZXRhaWxzIG9uIGhvdyB0aGVzZVxuICAgICMgcmVnaXN0ZXJzIHdvcmsgb24gYW4gWDExIGJhc2VkIHN5c3RlbS5cbiAgICBkZXNjcmliZSBcInRoZSArIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBkZXNjcmliZSBcInJlYWRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJpcyB0aGUgc2FtZSB0aGUgc3lzdGVtIGNsaXBib2FyZFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSByZWdpc3RlcjpcbiAgICAgICAgICAgICcqJzogdGV4dDogJ2luaXRpYWwgY2xpcGJvYXJkIGNvbnRlbnQnLCB0eXBlOiAnY2hhcmFjdGVyd2lzZSdcblxuICAgICAgZGVzY3JpYmUgXCJ3cml0aW5nXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICcqJzogdGV4dDogJ25ldyBjb250ZW50J1xuXG4gICAgICAgIGl0IFwib3ZlcndyaXRlcyB0aGUgY29udGVudHMgb2YgdGhlIHN5c3RlbSBjbGlwYm9hcmRcIiwgLT5cbiAgICAgICAgICBleHBlY3QoYXRvbS5jbGlwYm9hcmQucmVhZCgpKS50b0VxdWFsICduZXcgY29udGVudCdcblxuICAgIGRlc2NyaWJlIFwidGhlIF8gcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwicmVhZGluZ1wiLCAtPlxuICAgICAgICBpdCBcImlzIGFsd2F5cyB0aGUgZW1wdHkgc3RyaW5nXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiAnXyc6IHRleHQ6ICcnXG5cbiAgICAgIGRlc2NyaWJlIFwid3JpdGluZ1wiLCAtPlxuICAgICAgICBpdCBcInRocm93cyBhd2F5IGFueXRoaW5nIHdyaXR0ZW4gdG8gaXRcIiwgLT5cbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICAgICdfJzogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICAgIGVuc3VyZSByZWdpc3RlcjogJ18nOiB0ZXh0OiAnJ1xuXG4gICAgZGVzY3JpYmUgXCJ0aGUgJSByZWdpc3RlclwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzcHlPbihlZGl0b3IsICdnZXRVUkknKS5hbmRSZXR1cm4gJy9Vc2Vycy9hdG9tL2tub3duX3ZhbHVlLnR4dCdcblxuICAgICAgZGVzY3JpYmUgXCJyZWFkaW5nXCIsIC0+XG4gICAgICAgIGl0IFwicmV0dXJucyB0aGUgZmlsZW5hbWUgb2YgdGhlIGN1cnJlbnQgZWRpdG9yXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiAnJSc6IHRleHQ6ICcvVXNlcnMvYXRvbS9rbm93bl92YWx1ZS50eHQnXG5cbiAgICAgIGRlc2NyaWJlIFwid3JpdGluZ1wiLCAtPlxuICAgICAgICBpdCBcInRocm93cyBhd2F5IGFueXRoaW5nIHdyaXR0ZW4gdG8gaXRcIiwgLT5cbiAgICAgICAgICBzZXQgICAgcmVnaXN0ZXI6ICclJzogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICAgIGVuc3VyZSByZWdpc3RlcjogJyUnOiB0ZXh0OiAnL1VzZXJzL2F0b20va25vd25fdmFsdWUudHh0J1xuXG4gICAgZGVzY3JpYmUgXCJ0aGUgY3RybC1yIGNvbW1hbmQgaW4gaW5zZXJ0IG1vZGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMzQ1J1xuICAgICAgICBzZXQgcmVnaXN0ZXI6ICdhJzogdGV4dDogJ2FiYydcbiAgICAgICAgc2V0IHJlZ2lzdGVyOiAnKic6IHRleHQ6ICdhYmMnXG4gICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlIFwiY2xpcFwiXG4gICAgICAgIHNldCB0ZXh0OiBcIjAxMlxcblwiLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBlbnN1cmUgJ2knLCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgICBkZXNjcmliZSBcInVzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyID0gdHJ1ZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0ICd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIHRydWVcbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICczNDUnXG4gICAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUgXCJjbGlwXCJcblxuICAgICAgICBpdCBcImluc2VydHMgY29udGVudHMgZnJvbSBjbGlwYm9hcmQgd2l0aCBcXFwiXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFsnY3RybC1yJywgaW5wdXQ6ICdcIiddLCB0ZXh0OiAnMDFjbGlwMlxcbidcblxuICAgICAgZGVzY3JpYmUgXCJ1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlciA9IGZhbHNlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQgJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJywgZmFsc2VcbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICczNDUnXG4gICAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUgXCJjbGlwXCJcblxuICAgICAgICBpdCBcImluc2VydHMgY29udGVudHMgZnJvbSBcXFwiIHdpdGggXFxcIlwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBbJ2N0cmwtcicsIGlucHV0OiAnXCInXSwgdGV4dDogJzAxMzQ1MlxcbidcblxuICAgICAgaXQgXCJpbnNlcnRzIGNvbnRlbnRzIG9mIHRoZSAnYScgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgZW5zdXJlIFsnY3RybC1yJywgaW5wdXQ6ICdhJ10sIHRleHQ6ICcwMWFiYzJcXG4nXG5cbiAgICAgIGl0IFwiaXMgY2FuY2VsbGVkIHdpdGggdGhlIGVzY2FwZSBrZXlcIiwgLT5cbiAgICAgICAgZW5zdXJlICdjdHJsLXIgZXNjYXBlJyxcbiAgICAgICAgICB0ZXh0OiAnMDEyXFxuJ1xuICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMl1cblxuICAgIGRlc2NyaWJlIFwicGVyIHNlbGVjdGlvbiBjbGlwYm9hcmRcIiwgLT5cbiAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyID0gKHRleHRzLi4uKSAtPlxuICAgICAgICBmb3Igc2VsZWN0aW9uLCBpIGluIGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6ICcqJzoge3RleHQ6IHRleHRzW2ldLCBzZWxlY3Rpb246IHNlbGVjdGlvbn1cblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQgJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJywgdHJ1ZVxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAxMjpcbiAgICAgICAgICAgIGFiYzpcbiAgICAgICAgICAgIGRlZjpcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogW1swLCAxXSwgWzEsIDFdLCBbMiwgMV1dXG5cbiAgICAgIGRlc2NyaWJlIFwib24gc2VsZWN0aW9uIGRlc3Ryb3llXCIsIC0+XG4gICAgICAgIGl0IFwicmVtb3ZlIGNvcnJlc3BvbmRpbmcgc3Vic2NyaXB0aW4gYW5kIGNsaXBib2FyZCBlbnRyeVwiLCAtPlxuICAgICAgICAgIHtjbGlwYm9hcmRCeVNlbGVjdGlvbiwgc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb259ID0gdmltU3RhdGUucmVnaXN0ZXJcbiAgICAgICAgICBleHBlY3QoY2xpcGJvYXJkQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgwKVxuICAgICAgICAgIGV4cGVjdChzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5zaXplKS50b0JlKDApXG5cbiAgICAgICAgICBrZXlzdHJva2UgXCJ5IGkgd1wiXG4gICAgICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIoJzAxMicsICdhYmMnLCAnZGVmJylcblxuICAgICAgICAgIGV4cGVjdChjbGlwYm9hcmRCeVNlbGVjdGlvbi5zaXplKS50b0JlKDMpXG4gICAgICAgICAgZXhwZWN0KHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLnNpemUpLnRvQmUoMylcbiAgICAgICAgICBzZWxlY3Rpb24uZGVzdHJveSgpIGZvciBzZWxlY3Rpb24gaW4gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIGV4cGVjdChjbGlwYm9hcmRCeVNlbGVjdGlvbi5zaXplKS50b0JlKDApXG4gICAgICAgICAgZXhwZWN0KHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLnNpemUpLnRvQmUoMClcblxuICAgICAgZGVzY3JpYmUgXCJZYW5rXCIsIC0+XG4gICAgICAgIGl0IFwic2F2ZSB0ZXh0IHRvIHBlciBzZWxlY3Rpb24gcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBrZXlzdHJva2UgXCJ5IGkgd1wiXG4gICAgICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIoJzAxMicsICdhYmMnLCAnZGVmJylcblxuICAgICAgZGVzY3JpYmUgXCJEZWxldGUgZmFtaWx5XCIsIC0+XG4gICAgICAgIGl0IFwiZFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImQgaSB3XCIsIHRleHQ6IFwiOlxcbjpcXG46XFxuXCJcbiAgICAgICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlcignMDEyJywgJ2FiYycsICdkZWYnKVxuICAgICAgICBpdCBcInhcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ4XCIsIHRleHQ6IFwiMDI6XFxuYWM6XFxuZGY6XFxuXCJcbiAgICAgICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlcignMScsICdiJywgJ2UnKVxuICAgICAgICBpdCBcIlhcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJYXCIsIHRleHQ6IFwiMTI6XFxuYmM6XFxuZWY6XFxuXCJcbiAgICAgICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlcignMCcsICdhJywgJ2QnKVxuICAgICAgICBpdCBcIkRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJEXCIsIHRleHQ6IFwiMFxcbmFcXG5kXFxuXCJcbiAgICAgICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlcignMTI6JywgJ2JjOicsICdlZjonKVxuXG4gICAgICBkZXNjcmliZSBcIlB1dCBmYW1pbHlcIiwgLT5cbiAgICAgICAgaXQgXCJwIHBhc3RlIHRleHQgZnJvbSBwZXIgc2VsZWN0aW9uIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwieSBpIHcgJCBwXCIsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgMDEyOjAxMlxuICAgICAgICAgICAgICBhYmM6YWJjXG4gICAgICAgICAgICAgIGRlZjpkZWZcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiUCBwYXN0ZSB0ZXh0IGZyb20gcGVyIHNlbGVjdGlvbiByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInkgaSB3ICQgUFwiLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIDAxMjAxMjpcbiAgICAgICAgICAgICAgYWJjYWJjOlxuICAgICAgICAgICAgICBkZWZkZWY6XFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJjdHJsLXIgaW4gaW5zZXJ0IG1vZGVcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnQgZnJvbSBwZXIgc2VsZWN0aW9uIHJlZ2lzdGVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJkIGkgd1wiLCB0ZXh0OiBcIjpcXG46XFxuOlxcblwiXG4gICAgICAgICAgZW5zdXJlICdhJywgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBlbnN1cmUgWydjdHJsLXInLCBpbnB1dDogJ1wiJ10sXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgOjAxMlxuICAgICAgICAgICAgICA6YWJjXG4gICAgICAgICAgICAgIDpkZWZcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJDb3VudCBtb2RpZmllclwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIjAwMCAxMTEgMjIyIDMzMyA0NDQgNTU1IDY2NiA3NzcgODg4IDk5OVwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInJlcGVhdCBvcGVyYXRvclwiLCAtPlxuICAgICAgZW5zdXJlICczIGQgdycsIHRleHQ6IFwiMzMzIDQ0NCA1NTUgNjY2IDc3NyA4ODggOTk5XCJcbiAgICBpdCBcInJlcGVhdCBtb3Rpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAnZCAyIHcnLCB0ZXh0OiBcIjIyMiAzMzMgNDQ0IDU1NSA2NjYgNzc3IDg4OCA5OTlcIlxuICAgIGl0IFwicmVwZWF0IG9wZXJhdG9yIGFuZCBtb3Rpb24gcmVzcGVjdGl2ZWx5XCIsIC0+XG4gICAgICBlbnN1cmUgJzMgZCAyIHcnLCB0ZXh0OiBcIjY2NiA3NzcgODg4IDk5OVwiXG4iXX0=
