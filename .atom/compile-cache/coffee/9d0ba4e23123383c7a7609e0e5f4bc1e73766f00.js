(function() {
  var TextData, dispatch, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData;

  settings = require('../lib/settings');

  describe("Motion Find", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      settings.set('useExperimentalFasterInput', true);
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
    });
    describe('the f/F keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it('moves to the first specified character it finds', function() {
        return ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 2]
        });
      });
      it('extends visual selection in visual-mode and repetable', function() {
        ensure('v', {
          mode: ['visual', 'characterwise']
        });
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          selectedText: 'abc',
          cursor: [0, 3]
        });
        ensure(';', {
          selectedText: 'abcabc',
          cursor: [0, 6]
        });
        return ensure(',', {
          selectedText: 'abc',
          cursor: [0, 3]
        });
      });
      it('moves backwards to the first specified character it finds', function() {
        set({
          cursor: [0, 2]
        });
        return ensure([
          'F', {
            input: 'a'
          }
        ], {
          cursor: [0, 0]
        });
      });
      it('respects count forward', function() {
        return ensure([
          '2 f', {
            input: 'a'
          }
        ], {
          cursor: [0, 6]
        });
      });
      it('respects count backward', function() {
        ({
          cursor: [0, 6]
        });
        return ensure([
          '2 F', {
            input: 'a'
          }
        ], {
          cursor: [0, 0]
        });
      });
      it("doesn't move if the character specified isn't found", function() {
        return ensure([
          'f', {
            input: 'd'
          }
        ], {
          cursor: [0, 0]
        });
      });
      it("doesn't move if there aren't the specified count of the specified character", function() {
        ensure([
          '1 0 f', {
            input: 'a'
          }
        ], {
          cursor: [0, 0]
        });
        ensure([
          '1 1 f', {
            input: 'a'
          }
        ], {
          cursor: [0, 0]
        });
        set({
          cursor: [0, 6]
        });
        ensure([
          '1 0 F', {
            input: 'a'
          }
        ], {
          cursor: [0, 6]
        });
        return ensure([
          '1 1 F', {
            input: 'a'
          }
        ], {
          cursor: [0, 6]
        });
      });
      it("composes with d", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd 2 f', {
            input: 'a'
          }
        ], {
          text: 'abcbc\n'
        });
      });
      return it("F behaves exclusively when composes with operator", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd F', {
            input: 'a'
          }
        ], {
          text: 'abcabcabc\n'
        });
      });
    });
    describe('the t/T keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it('moves to the character previous to the first specified character it finds', function() {
        ensure([
          't', {
            input: 'a'
          }
        ], {
          cursor: [0, 2]
        });
        return ensure([
          't', {
            input: 'a'
          }
        ], {
          cursor: [0, 2]
        });
      });
      it('moves backwards to the character after the first specified character it finds', function() {
        set({
          cursor: [0, 2]
        });
        return ensure([
          'T', {
            input: 'a'
          }
        ], {
          cursor: [0, 1]
        });
      });
      it('respects count forward', function() {
        return ensure([
          '2 t', {
            input: 'a'
          }
        ], {
          cursor: [0, 5]
        });
      });
      it('respects count backward', function() {
        set({
          cursor: [0, 6]
        });
        return ensure([
          '2 T', {
            input: 'a'
          }
        ], {
          cursor: [0, 1]
        });
      });
      it("doesn't move if the character specified isn't found", function() {
        return ensure([
          't', {
            input: 'd'
          }
        ], {
          cursor: [0, 0]
        });
      });
      it("doesn't move if there aren't the specified count of the specified character", function() {
        ensure([
          '1 0 t', {
            input: 'd'
          }
        ], {
          cursor: [0, 0]
        });
        ensure([
          '1 1 t', {
            input: 'a'
          }
        ], {
          cursor: [0, 0]
        });
        set({
          cursor: [0, 6]
        });
        ensure([
          '1 0 T', {
            input: 'a'
          }
        ], {
          cursor: [0, 6]
        });
        return ensure([
          '1 1 T', {
            input: 'a'
          }
        ], {
          cursor: [0, 6]
        });
      });
      it("composes with d", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd 2 t', {
            input: 'b'
          }
        ], {
          text: 'abcbcabc\n'
        });
      });
      it("delete char under cursor even when no movement happens since it's inclusive motion", function() {
        set({
          cursor: [0, 0]
        });
        return ensure([
          'd t', {
            input: 'b'
          }
        ], {
          text: 'bcabcabcabc\n'
        });
      });
      it("do nothing when inclusiveness inverted by v operator-modifier", function() {
        ({
          text: "abcabcabcabc\n"
        });
        set({
          cursor: [0, 0]
        });
        return ensure([
          'd v t', {
            input: 'b'
          }
        ], {
          text: 'abcabcabcabc\n'
        });
      });
      it("T behaves exclusively when composes with operator", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd T', {
            input: 'b'
          }
        ], {
          text: 'ababcabcabc\n'
        });
      });
      return it("T don't delete character under cursor even when no movement happens", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd T', {
            input: 'c'
          }
        ], {
          text: 'abcabcabcabc\n'
        });
      });
    });
    describe('the ; and , keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it("repeat f in same direction", function() {
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 2]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(';', {
          cursor: [0, 8]
        });
      });
      it("repeat F in same direction", function() {
        set({
          cursor: [0, 10]
        });
        ensure([
          'F', {
            input: 'c'
          }
        ], {
          cursor: [0, 8]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(';', {
          cursor: [0, 2]
        });
      });
      it("repeat f in opposite direction", function() {
        set({
          cursor: [0, 6]
        });
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 8]
        });
        ensure(',', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 2]
        });
      });
      it("repeat F in opposite direction", function() {
        set({
          cursor: [0, 4]
        });
        ensure([
          'F', {
            input: 'c'
          }
        ], {
          cursor: [0, 2]
        });
        ensure(',', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 8]
        });
      });
      it("alternate repeat f in same direction and reverse", function() {
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 2]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 2]
        });
      });
      it("alternate repeat F in same direction and reverse", function() {
        set({
          cursor: [0, 10]
        });
        ensure([
          'F', {
            input: 'c'
          }
        ], {
          cursor: [0, 8]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 8]
        });
      });
      it("repeat t in same direction", function() {
        ensure([
          't', {
            input: 'c'
          }
        ], {
          cursor: [0, 1]
        });
        return ensure(';', {
          cursor: [0, 4]
        });
      });
      it("repeat T in same direction", function() {
        set({
          cursor: [0, 10]
        });
        ensure([
          'T', {
            input: 'c'
          }
        ], {
          cursor: [0, 9]
        });
        return ensure(';', {
          cursor: [0, 6]
        });
      });
      it("repeat t in opposite direction first, and then reverse", function() {
        set({
          cursor: [0, 3]
        });
        ensure([
          't', {
            input: 'c'
          }
        ], {
          cursor: [0, 4]
        });
        ensure(',', {
          cursor: [0, 3]
        });
        return ensure(';', {
          cursor: [0, 4]
        });
      });
      it("repeat T in opposite direction first, and then reverse", function() {
        set({
          cursor: [0, 4]
        });
        ensure([
          'T', {
            input: 'c'
          }
        ], {
          cursor: [0, 3]
        });
        ensure(',', {
          cursor: [0, 4]
        });
        return ensure(';', {
          cursor: [0, 3]
        });
      });
      it("repeat with count in same direction", function() {
        set({
          cursor: [0, 0]
        });
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 2]
        });
        return ensure('2 ;', {
          cursor: [0, 8]
        });
      });
      return it("repeat with count in reverse direction", function() {
        set({
          cursor: [0, 6]
        });
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 8]
        });
        return ensure('2 ,', {
          cursor: [0, 2]
        });
      });
    });
    return describe("last find/till is repeatable on other editor", function() {
      var other, otherEditor, pane, ref2;
      ref2 = [], other = ref2[0], otherEditor = ref2[1], pane = ref2[2];
      beforeEach(function() {
        return getVimState(function(otherVimState, _other) {
          set({
            text: "a baz bar\n",
            cursor: [0, 0]
          });
          other = _other;
          other.set({
            text: "foo bar baz",
            cursor: [0, 0]
          });
          otherEditor = otherVimState.editor;
          pane = atom.workspace.getActivePane();
          return pane.activateItem(editor);
        });
      });
      it("shares the most recent find/till command with other editors", function() {
        ensure([
          'f', {
            input: 'b'
          }
        ], {
          cursor: [0, 2]
        });
        other.ensure({
          cursor: [0, 0]
        });
        pane.activateItem(otherEditor);
        other.keystroke(';');
        ensure({
          cursor: [0, 2]
        });
        other.ensure({
          cursor: [0, 4]
        });
        other.keystroke([
          't', {
            input: 'r'
          }
        ]);
        ensure({
          cursor: [0, 2]
        });
        other.ensure({
          cursor: [0, 5]
        });
        pane.activateItem(editor);
        ensure(';', {
          cursor: [0, 7]
        });
        return other.ensure({
          cursor: [0, 5]
        });
      });
      return it("is still repeatable after original editor was destroyed", function() {
        ensure([
          'f', {
            input: 'b'
          }
        ], {
          cursor: [0, 2]
        });
        other.ensure({
          cursor: [0, 0]
        });
        pane.activateItem(otherEditor);
        editor.destroy();
        expect(editor.isAlive()).toBe(false);
        other.ensure(';', {
          cursor: [0, 4]
        });
        other.ensure(';', {
          cursor: [0, 8]
        });
        return other.ensure(',', {
          cursor: [0, 4]
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9tb3Rpb24tZmluZC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBb0MsT0FBQSxDQUFRLGVBQVIsQ0FBcEMsRUFBQyw2QkFBRCxFQUFjLHVCQUFkLEVBQXdCOztFQUN4QixRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUE7QUFDdEIsUUFBQTtJQUFBLE9BQTRELEVBQTVELEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsbUJBQWQsRUFBeUIsZ0JBQXpCLEVBQWlDLHVCQUFqQyxFQUFnRDtJQUVoRCxVQUFBLENBQVcsU0FBQTtNQUNULFFBQVEsQ0FBQyxHQUFULENBQWEsNEJBQWIsRUFBMkMsSUFBM0M7YUFDQSxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsSUFBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixjQUFELEVBQU0sb0JBQU4sRUFBYywwQkFBZCxFQUEyQjtNQUhqQixDQUFaO0lBRlMsQ0FBWDtJQU9BLFFBQUEsQ0FBUyxxQkFBVCxFQUFnQyxTQUFBO01BQzlCLFVBQUEsQ0FBVyxTQUFBO2VBQ1QsR0FBQSxDQUNFO1VBQUEsSUFBQSxFQUFNLGdCQUFOO1VBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtTQURGO01BRFMsQ0FBWDtNQUtBLEVBQUEsQ0FBRyxpREFBSCxFQUFzRCxTQUFBO2VBQ3BELE1BQUEsQ0FBTztVQUFDLEdBQUQsRUFBTTtZQUFBLEtBQUEsRUFBTyxHQUFQO1dBQU47U0FBUCxFQUEwQjtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBMUI7TUFEb0QsQ0FBdEQ7TUFHQSxFQUFBLENBQUcsdURBQUgsRUFBNEQsU0FB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SUFBSSxDQUFDLFlBQUwsQ0FBa0IsTUFBbEI7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFaO2VBQ0EsS0FBSyxDQUFDLE1BQU4sQ0FBYTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBYjtNQWxCZ0UsQ0FBbEU7YUFvQkEsRUFBQSxDQUFHLHlEQUFILEVBQThELFNBQUE7UUFDNUQsTUFBQSxDQUFPO1VBQUMsR0FBRCxFQUFNO1lBQUEsS0FBQSxFQUFPLEdBQVA7V0FBTjtTQUFQLEVBQTBCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUExQjtRQUNBLEtBQUssQ0FBQyxNQUFOLENBQWE7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWI7UUFFQSxJQUFJLENBQUMsWUFBTCxDQUFrQixXQUFsQjtRQUNBLE1BQU0sQ0FBQyxPQUFQLENBQUE7UUFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsS0FBOUI7UUFDQSxLQUFLLENBQUMsTUFBTixDQUFhLEdBQWIsRUFBa0I7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWxCO1FBQ0EsS0FBSyxDQUFDLE1BQU4sQ0FBYSxHQUFiLEVBQWtCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFsQjtlQUNBLEtBQUssQ0FBQyxNQUFOLENBQWEsR0FBYixFQUFrQjtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBbEI7TUFUNEQsQ0FBOUQ7SUFyQ3VELENBQXpEO0VBMUxzQixDQUF4QjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGF9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIk1vdGlvbiBGaW5kXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHNldHRpbmdzLnNldCgndXNlRXhwZXJpbWVudGFsRmFzdGVySW5wdXQnLCB0cnVlKVxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgX3ZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGUgIyB0byByZWZlciBhcyB2aW1TdGF0ZSBsYXRlci5cbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IF92aW1cblxuICBkZXNjcmliZSAndGhlIGYvRiBrZXliaW5kaW5ncycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiYWJjYWJjYWJjYWJjXFxuXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0ICdtb3ZlcyB0byB0aGUgZmlyc3Qgc3BlY2lmaWVkIGNoYXJhY3RlciBpdCBmaW5kcycsIC0+XG4gICAgICBlbnN1cmUgWydmJywgaW5wdXQ6ICdjJ10sIGN1cnNvcjogWzAsIDJdXG5cbiAgICBpdCAnZXh0ZW5kcyB2aXN1YWwgc2VsZWN0aW9uIGluIHZpc3VhbC1tb2RlIGFuZCByZXBldGFibGUnLCAtPlxuICAgICAgZW5zdXJlICd2JywgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICBlbnN1cmUgWydmJywgaW5wdXQ6ICdjJ10sIHNlbGVjdGVkVGV4dDogJ2FiYycsIGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgJzsnLCBzZWxlY3RlZFRleHQ6ICdhYmNhYmMnLCBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlICcsJywgc2VsZWN0ZWRUZXh0OiAnYWJjJywgY3Vyc29yOiBbMCwgM11cblxuICAgIGl0ICdtb3ZlcyBiYWNrd2FyZHMgdG8gdGhlIGZpcnN0IHNwZWNpZmllZCBjaGFyYWN0ZXIgaXQgZmluZHMnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgWydGJywgaW5wdXQ6ICdhJ10sIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCAncmVzcGVjdHMgY291bnQgZm9yd2FyZCcsIC0+XG4gICAgICBlbnN1cmUgWycyIGYnLCBpbnB1dDogJ2EnXSwgY3Vyc29yOiBbMCwgNl1cblxuICAgIGl0ICdyZXNwZWN0cyBjb3VudCBiYWNrd2FyZCcsIC0+XG4gICAgICBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlIFsnMiBGJywgaW5wdXQ6ICdhJ10sIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcImRvZXNuJ3QgbW92ZSBpZiB0aGUgY2hhcmFjdGVyIHNwZWNpZmllZCBpc24ndCBmb3VuZFwiLCAtPlxuICAgICAgZW5zdXJlIFsnZicsIGlucHV0OiAnZCddLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJkb2Vzbid0IG1vdmUgaWYgdGhlcmUgYXJlbid0IHRoZSBzcGVjaWZpZWQgY291bnQgb2YgdGhlIHNwZWNpZmllZCBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgIGVuc3VyZSBbJzEgMCBmJywgaW5wdXQ6ICdhJ10sIGN1cnNvcjogWzAsIDBdXG4gICAgICAjIGEgYnVnIHdhcyBtYWtpbmcgdGhpcyBiZWhhdmlvdXIgZGVwZW5kIG9uIHRoZSBjb3VudFxuICAgICAgZW5zdXJlIFsnMSAxIGYnLCBpbnB1dDogJ2EnXSwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICMgYW5kIGJhY2t3YXJkcyBub3dcbiAgICAgIHNldCBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlIFsnMSAwIEYnLCBpbnB1dDogJ2EnXSwgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSBbJzEgMSBGJywgaW5wdXQ6ICdhJ10sIGN1cnNvcjogWzAsIDZdXG5cbiAgICBpdCBcImNvbXBvc2VzIHdpdGggZFwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgWydkIDIgZicsIGlucHV0OiAnYSddLCB0ZXh0OiAnYWJjYmNcXG4nXG5cbiAgICBpdCBcIkYgYmVoYXZlcyBleGNsdXNpdmVseSB3aGVuIGNvbXBvc2VzIHdpdGggb3BlcmF0b3JcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlIFsnZCBGJywgaW5wdXQ6ICdhJ10sIHRleHQ6ICdhYmNhYmNhYmNcXG4nXG5cbiAgZGVzY3JpYmUgJ3RoZSB0L1Qga2V5YmluZGluZ3MnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcImFiY2FiY2FiY2FiY1xcblwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCAnbW92ZXMgdG8gdGhlIGNoYXJhY3RlciBwcmV2aW91cyB0byB0aGUgZmlyc3Qgc3BlY2lmaWVkIGNoYXJhY3RlciBpdCBmaW5kcycsIC0+XG4gICAgICBlbnN1cmUgWyd0JywgaW5wdXQ6ICdhJ10sIGN1cnNvcjogWzAsIDJdXG4gICAgICAjIG9yIHN0YXlzIHB1dCB3aGVuIGl0J3MgYWxyZWFkeSB0aGVyZVxuICAgICAgZW5zdXJlIFsndCcsIGlucHV0OiAnYSddLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgaXQgJ21vdmVzIGJhY2t3YXJkcyB0byB0aGUgY2hhcmFjdGVyIGFmdGVyIHRoZSBmaXJzdCBzcGVjaWZpZWQgY2hhcmFjdGVyIGl0IGZpbmRzJywgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlIFsnVCcsIGlucHV0OiAnYSddLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgaXQgJ3Jlc3BlY3RzIGNvdW50IGZvcndhcmQnLCAtPlxuICAgICAgZW5zdXJlIFsnMiB0JywgaW5wdXQ6ICdhJ10sIGN1cnNvcjogWzAsIDVdXG5cbiAgICBpdCAncmVzcGVjdHMgY291bnQgYmFja3dhcmQnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgWycyIFQnLCBpbnB1dDogJ2EnXSwgY3Vyc29yOiBbMCwgMV1cblxuICAgIGl0IFwiZG9lc24ndCBtb3ZlIGlmIHRoZSBjaGFyYWN0ZXIgc3BlY2lmaWVkIGlzbid0IGZvdW5kXCIsIC0+XG4gICAgICBlbnN1cmUgWyd0JywgaW5wdXQ6ICdkJ10sIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcImRvZXNuJ3QgbW92ZSBpZiB0aGVyZSBhcmVuJ3QgdGhlIHNwZWNpZmllZCBjb3VudCBvZiB0aGUgc3BlY2lmaWVkIGNoYXJhY3RlclwiLCAtPlxuICAgICAgZW5zdXJlIFsnMSAwIHQnLCBpbnB1dDogJ2QnXSwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICMgYSBidWcgd2FzIG1ha2luZyB0aGlzIGJlaGF2aW91ciBkZXBlbmQgb24gdGhlIGNvdW50XG4gICAgICBlbnN1cmUgWycxIDEgdCcsIGlucHV0OiAnYSddLCBjdXJzb3I6IFswLCAwXVxuICAgICAgIyBhbmQgYmFja3dhcmRzIG5vd1xuICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgWycxIDAgVCcsIGlucHV0OiAnYSddLCBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlIFsnMSAxIFQnLCBpbnB1dDogJ2EnXSwgY3Vyc29yOiBbMCwgNl1cblxuICAgIGl0IFwiY29tcG9zZXMgd2l0aCBkXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSBbJ2QgMiB0JywgaW5wdXQ6ICdiJ10sXG4gICAgICAgIHRleHQ6ICdhYmNiY2FiY1xcbidcblxuICAgIGl0IFwiZGVsZXRlIGNoYXIgdW5kZXIgY3Vyc29yIGV2ZW4gd2hlbiBubyBtb3ZlbWVudCBoYXBwZW5zIHNpbmNlIGl0J3MgaW5jbHVzaXZlIG1vdGlvblwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgWydkIHQnLCBpbnB1dDogJ2InXSxcbiAgICAgICAgdGV4dDogJ2JjYWJjYWJjYWJjXFxuJ1xuICAgIGl0IFwiZG8gbm90aGluZyB3aGVuIGluY2x1c2l2ZW5lc3MgaW52ZXJ0ZWQgYnkgdiBvcGVyYXRvci1tb2RpZmllclwiLCAtPlxuICAgICAgdGV4dDogXCJhYmNhYmNhYmNhYmNcXG5cIlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgWydkIHYgdCcsIGlucHV0OiAnYiddLFxuICAgICAgICB0ZXh0OiAnYWJjYWJjYWJjYWJjXFxuJ1xuXG4gICAgaXQgXCJUIGJlaGF2ZXMgZXhjbHVzaXZlbHkgd2hlbiBjb21wb3NlcyB3aXRoIG9wZXJhdG9yXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSBbJ2QgVCcsIGlucHV0OiAnYiddLFxuICAgICAgICB0ZXh0OiAnYWJhYmNhYmNhYmNcXG4nXG5cbiAgICBpdCBcIlQgZG9uJ3QgZGVsZXRlIGNoYXJhY3RlciB1bmRlciBjdXJzb3IgZXZlbiB3aGVuIG5vIG1vdmVtZW50IGhhcHBlbnNcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlIFsnZCBUJywgaW5wdXQ6ICdjJ10sXG4gICAgICAgIHRleHQ6ICdhYmNhYmNhYmNhYmNcXG4nXG5cbiAgZGVzY3JpYmUgJ3RoZSA7IGFuZCAsIGtleWJpbmRpbmdzJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJhYmNhYmNhYmNhYmNcXG5cIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJyZXBlYXQgZiBpbiBzYW1lIGRpcmVjdGlvblwiLCAtPlxuICAgICAgZW5zdXJlIFsnZicsIGlucHV0OiAnYyddLCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgNV1cbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDhdXG5cbiAgICBpdCBcInJlcGVhdCBGIGluIHNhbWUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMTBdXG4gICAgICBlbnN1cmUgWydGJywgaW5wdXQ6ICdjJ10sIGN1cnNvcjogWzAsIDhdXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgMl1cblxuICAgIGl0IFwicmVwZWF0IGYgaW4gb3Bwb3NpdGUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSBbJ2YnLCBpbnB1dDogJ2MnXSwgY3Vyc29yOiBbMCwgOF1cbiAgICAgIGVuc3VyZSAnLCcsIGN1cnNvcjogWzAsIDVdXG4gICAgICBlbnN1cmUgJywnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgaXQgXCJyZXBlYXQgRiBpbiBvcHBvc2l0ZSBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCA0XVxuICAgICAgZW5zdXJlIFsnRicsIGlucHV0OiAnYyddLCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgNV1cbiAgICAgIGVuc3VyZSAnLCcsIGN1cnNvcjogWzAsIDhdXG5cbiAgICBpdCBcImFsdGVybmF0ZSByZXBlYXQgZiBpbiBzYW1lIGRpcmVjdGlvbiBhbmQgcmV2ZXJzZVwiLCAtPlxuICAgICAgZW5zdXJlIFsnZicsIGlucHV0OiAnYyddLCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgNV1cbiAgICAgIGVuc3VyZSAnLCcsIGN1cnNvcjogWzAsIDJdXG5cbiAgICBpdCBcImFsdGVybmF0ZSByZXBlYXQgRiBpbiBzYW1lIGRpcmVjdGlvbiBhbmQgcmV2ZXJzZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDEwXVxuICAgICAgZW5zdXJlIFsnRicsIGlucHV0OiAnYyddLCBjdXJzb3I6IFswLCA4XVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgNV1cbiAgICAgIGVuc3VyZSAnLCcsIGN1cnNvcjogWzAsIDhdXG5cbiAgICBpdCBcInJlcGVhdCB0IGluIHNhbWUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgWyd0JywgaW5wdXQ6ICdjJ10sIGN1cnNvcjogWzAsIDFdXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA0XVxuXG4gICAgaXQgXCJyZXBlYXQgVCBpbiBzYW1lIGRpcmVjdGlvblwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDEwXVxuICAgICAgZW5zdXJlIFsnVCcsIGlucHV0OiAnYyddLCBjdXJzb3I6IFswLCA5XVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgNl1cblxuICAgIGl0IFwicmVwZWF0IHQgaW4gb3Bwb3NpdGUgZGlyZWN0aW9uIGZpcnN0LCBhbmQgdGhlbiByZXZlcnNlXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSBbJ3QnLCBpbnB1dDogJ2MnXSwgY3Vyc29yOiBbMCwgNF1cbiAgICAgIGVuc3VyZSAnLCcsIGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA0XVxuXG4gICAgaXQgXCJyZXBlYXQgVCBpbiBvcHBvc2l0ZSBkaXJlY3Rpb24gZmlyc3QsIGFuZCB0aGVuIHJldmVyc2VcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCA0XVxuICAgICAgZW5zdXJlIFsnVCcsIGlucHV0OiAnYyddLCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgNF1cbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDNdXG5cbiAgICBpdCBcInJlcGVhdCB3aXRoIGNvdW50IGluIHNhbWUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSBbJ2YnLCBpbnB1dDogJ2MnXSwgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGVuc3VyZSAnMiA7JywgY3Vyc29yOiBbMCwgOF1cblxuICAgIGl0IFwicmVwZWF0IHdpdGggY291bnQgaW4gcmV2ZXJzZSBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlIFsnZicsIGlucHV0OiAnYyddLCBjdXJzb3I6IFswLCA4XVxuICAgICAgZW5zdXJlICcyICwnLCBjdXJzb3I6IFswLCAyXVxuXG4gIGRlc2NyaWJlIFwibGFzdCBmaW5kL3RpbGwgaXMgcmVwZWF0YWJsZSBvbiBvdGhlciBlZGl0b3JcIiwgLT5cbiAgICBbb3RoZXIsIG90aGVyRWRpdG9yLCBwYW5lXSA9IFtdXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZ2V0VmltU3RhdGUgKG90aGVyVmltU3RhdGUsIF9vdGhlcikgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJhIGJheiBiYXJcXG5cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgb3RoZXIgPSBfb3RoZXJcbiAgICAgICAgb3RoZXIuc2V0XG4gICAgICAgICAgdGV4dDogXCJmb28gYmFyIGJhelwiLFxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIG90aGVyRWRpdG9yID0gb3RoZXJWaW1TdGF0ZS5lZGl0b3JcblxuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKGVkaXRvcilcblxuICAgIGl0IFwic2hhcmVzIHRoZSBtb3N0IHJlY2VudCBmaW5kL3RpbGwgY29tbWFuZCB3aXRoIG90aGVyIGVkaXRvcnNcIiwgLT5cbiAgICAgIGVuc3VyZSBbJ2YnLCBpbnB1dDogJ2InXSwgY3Vyc29yOiBbMCwgMl1cbiAgICAgIG90aGVyLmVuc3VyZSBjdXJzb3I6IFswLCAwXVxuXG4gICAgICAjIHJlcGxheSBzYW1lIGZpbmQgaW4gdGhlIG90aGVyIGVkaXRvclxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0ob3RoZXJFZGl0b3IpXG4gICAgICBvdGhlci5rZXlzdHJva2UgJzsnXG4gICAgICBlbnN1cmUgY3Vyc29yOiBbMCwgMl1cbiAgICAgIG90aGVyLmVuc3VyZSBjdXJzb3I6IFswLCA0XVxuXG4gICAgICAjIGRvIGEgdGlsbCBpbiB0aGUgb3RoZXIgZWRpdG9yXG4gICAgICBvdGhlci5rZXlzdHJva2UgWyd0JywgaW5wdXQ6ICdyJ11cbiAgICAgIGVuc3VyZSBjdXJzb3I6IFswLCAyXVxuICAgICAgb3RoZXIuZW5zdXJlIGN1cnNvcjogWzAsIDVdXG5cbiAgICAgICMgYW5kIHJlcGxheSBpbiB0aGUgbm9ybWFsIGVkaXRvclxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0oZWRpdG9yKVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgN11cbiAgICAgIG90aGVyLmVuc3VyZSBjdXJzb3I6IFswLCA1XVxuXG4gICAgaXQgXCJpcyBzdGlsbCByZXBlYXRhYmxlIGFmdGVyIG9yaWdpbmFsIGVkaXRvciB3YXMgZGVzdHJveWVkXCIsIC0+XG4gICAgICBlbnN1cmUgWydmJywgaW5wdXQ6ICdiJ10sIGN1cnNvcjogWzAsIDJdXG4gICAgICBvdGhlci5lbnN1cmUgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0ob3RoZXJFZGl0b3IpXG4gICAgICBlZGl0b3IuZGVzdHJveSgpXG4gICAgICBleHBlY3QoZWRpdG9yLmlzQWxpdmUoKSkudG9CZShmYWxzZSlcbiAgICAgIG90aGVyLmVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDRdXG4gICAgICBvdGhlci5lbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA4XVxuICAgICAgb3RoZXIuZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgNF1cbiJdfQ==
