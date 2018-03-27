(function() {
  var TextData, dispatch, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData;

  settings = require('../lib/settings');

  describe("Motion Scroll", function() {
    var editor, editorElement, ensure, keystroke, lines, n, ref1, set, text, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    lines = ((function() {
      var i, results;
      results = [];
      for (n = i = 0; i < 100; n = ++i) {
        results.push(n + " " + 'X'.repeat(10));
      }
      return results;
    })()).join("\n");
    text = new TextData(lines);
    beforeEach(function() {
      getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
      return runs(function() {
        jasmine.attachToDOM(editorElement);
        set({
          text: text.getRaw()
        });
        editorElement.setHeight(20 * 10);
        editorElement.style.lineHeight = "10px";
        if (editorElement.measureDimensions != null) {
          editorElement.measureDimensions();
        } else {
          atom.views.performDocumentPoll();
        }
        editorElement.setScrollTop(40 * 10);
        return set({
          cursor: [42, 0]
        });
      });
    });
    describe("the ctrl-u keybinding", function() {
      it("moves the screen down by half screen size and keeps cursor onscreen", function() {
        return ensure('ctrl-u', {
          scrollTop: 300,
          cursor: [32, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-u', {
          selectedText: text.getLines([32, 33, 34, 35, 36, 37, 38, 39, 40, 41]) + "42"
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-u', {
          selectedText: text.getLines([32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42])
        });
      });
    });
    describe("the ctrl-b keybinding", function() {
      it("moves screen up one page", function() {
        return ensure('ctrl-b', {
          scrollTop: 200,
          cursor: [22, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-b', {
          selectedText: text.getLines([22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41]) + "42"
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-b', {
          selectedText: text.getLines([22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42])
        });
      });
    });
    describe("the ctrl-d keybinding", function() {
      it("moves the screen down by half screen size and keeps cursor onscreen", function() {
        return ensure('ctrl-d', {
          scrollTop: 500,
          cursor: [52, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-d', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51]).slice(1) + "5"
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-d', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52])
        });
      });
    });
    describe("the ctrl-f keybinding", function() {
      it("moves screen down one page", function() {
        return ensure('ctrl-f', {
          scrollTop: 600,
          cursor: [62, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-f', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61]).slice(1) + "6"
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-f', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62])
        });
      });
    });
    return describe("ctrl-f, ctrl-b, ctrl-d, ctrl-u", function() {
      beforeEach(function() {
        settings.set('moveToFirstCharacterOnVerticalMotion', false);
        set({
          cursor: [42, 10]
        });
        return ensure({
          scrollTop: 400
        });
      });
      return it("go to row with keep column and respect cursor.goalColum", function() {
        ensure('ctrl-b', {
          scrollTop: 200,
          cursor: [22, 10]
        });
        ensure('ctrl-f', {
          scrollTop: 400,
          cursor: [42, 10]
        });
        ensure('ctrl-u', {
          scrollTop: 300,
          cursor: [32, 10]
        });
        ensure('ctrl-d', {
          scrollTop: 400,
          cursor: [42, 10]
        });
        ensure('$', {
          cursor: [42, 12]
        });
        expect(editor.getLastCursor().goalColumn).toBe(2e308);
        ensure('ctrl-b', {
          scrollTop: 200,
          cursor: [22, 12]
        });
        ensure('ctrl-b', {
          scrollTop: 0,
          cursor: [2, 11]
        });
        ensure('ctrl-f', {
          scrollTop: 200,
          cursor: [22, 12]
        });
        ensure('ctrl-f', {
          scrollTop: 400,
          cursor: [42, 12]
        });
        ensure('ctrl-u', {
          scrollTop: 300,
          cursor: [32, 12]
        });
        ensure('ctrl-d', {
          scrollTop: 400,
          cursor: [42, 12]
        });
        return expect(editor.getLastCursor().goalColumn).toBe(2e308);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9tb3Rpb24tc2Nyb2xsLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFvQyxPQUFBLENBQVEsZUFBUixDQUFwQyxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0I7O0VBQ3hCLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQTtBQUN4QixRQUFBO0lBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdEO0lBQ2hELEtBQUEsR0FBUTs7QUFBQztXQUFrQywyQkFBbEM7cUJBQUEsQ0FBQSxHQUFJLEdBQUosR0FBVSxHQUFHLENBQUMsTUFBSixDQUFXLEVBQVg7QUFBVjs7UUFBRCxDQUE2QyxDQUFDLElBQTlDLENBQW1ELElBQW5EO0lBQ1IsSUFBQSxHQUFXLElBQUEsUUFBQSxDQUFTLEtBQVQ7SUFFWCxVQUFBLENBQVcsU0FBQTtNQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxJQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGNBQUQsRUFBTSxvQkFBTixFQUFjLDBCQUFkLEVBQTJCO01BSGpCLENBQVo7YUFLQSxJQUFBLENBQUssU0FBQTtRQUNILE9BQU8sQ0FBQyxXQUFSLENBQW9CLGFBQXBCO1FBQ0EsR0FBQSxDQUFJO1VBQUEsSUFBQSxFQUFNLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBTjtTQUFKO1FBRUEsYUFBYSxDQUFDLFNBQWQsQ0FBd0IsRUFBQSxHQUFLLEVBQTdCO1FBQ0EsYUFBYSxDQUFDLEtBQUssQ0FBQyxVQUFwQixHQUFpQztRQUVqQyxJQUFHLHVDQUFIO1VBRUUsYUFBYSxDQUFD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QyxVQUE5QixDQUF5QyxDQUFDLElBQTFDLENBQStDLEtBQS9DO01BYjRELENBQTlEO0lBTnlDLENBQTNDO0VBeEZ3QixDQUExQjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGF9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIk1vdGlvbiBTY3JvbGxcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cbiAgbGluZXMgPSAobiArIFwiIFwiICsgJ1gnLnJlcGVhdCgxMCkgZm9yIG4gaW4gWzAuLi4xMDBdKS5qb2luKFwiXFxuXCIpXG4gIHRleHQgPSBuZXcgVGV4dERhdGEobGluZXMpXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgX3ZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGUgIyB0byByZWZlciBhcyB2aW1TdGF0ZSBsYXRlci5cbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IF92aW1cblxuICAgIHJ1bnMgLT5cbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oZWRpdG9yRWxlbWVudClcbiAgICAgIHNldCB0ZXh0OiB0ZXh0LmdldFJhdygpXG5cbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDIwICogMTApXG4gICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmxpbmVIZWlnaHQgPSBcIjEwcHhcIlxuXG4gICAgICBpZiBlZGl0b3JFbGVtZW50Lm1lYXN1cmVEaW1lbnNpb25zP1xuICAgICAgICAjIEZvciBBdG9tLXYxLjE5XG4gICAgICAgIGVkaXRvckVsZW1lbnQubWVhc3VyZURpbWVuc2lvbnMoKVxuICAgICAgZWxzZSAjIEZvciBBdG9tLXYxLjE4XG4gICAgICAgICMgW1RPRE9dIFJlbW92ZSB3aGVuIHYuMS4xOSBiZWNvbWUgc3RhYmxlXG4gICAgICAgIGF0b20udmlld3MucGVyZm9ybURvY3VtZW50UG9sbCgpXG5cbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDQwICogMTApXG4gICAgICBzZXQgY3Vyc29yOiBbNDIsIDBdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgY3RybC11IGtleWJpbmRpbmdcIiwgLT5cbiAgICBpdCBcIm1vdmVzIHRoZSBzY3JlZW4gZG93biBieSBoYWxmIHNjcmVlbiBzaXplIGFuZCBrZWVwcyBjdXJzb3Igb25zY3JlZW5cIiwgLT5cbiAgICAgIGVuc3VyZSAnY3RybC11JyxcbiAgICAgICAgc2Nyb2xsVG9wOiAzMDBcbiAgICAgICAgY3Vyc29yOiBbMzIsIDBdXG5cbiAgICBpdCBcInNlbGVjdHMgb24gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFs0MiwgMV1cbiAgICAgIGVuc3VyZSAndiBjdHJsLXUnLFxuICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzMyLi40MV0pICsgXCI0MlwiXG5cbiAgICBpdCBcInNlbGVjdHMgb24gbGluZXdpc2UgbW9kZVwiLCAtPlxuICAgICAgZW5zdXJlICdWIGN0cmwtdScsXG4gICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMzIuLjQyXSlcblxuICBkZXNjcmliZSBcInRoZSBjdHJsLWIga2V5YmluZGluZ1wiLCAtPlxuICAgIGl0IFwibW92ZXMgc2NyZWVuIHVwIG9uZSBwYWdlXCIsIC0+XG4gICAgICBlbnN1cmUgJ2N0cmwtYicsXG4gICAgICAgIHNjcm9sbFRvcDogMjAwXG4gICAgICAgIGN1cnNvcjogWzIyLCAwXVxuXG4gICAgaXQgXCJzZWxlY3RzIG9uIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbNDIsIDFdXG4gICAgICBlbnN1cmUgJ3YgY3RybC1iJyxcbiAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsyMi4uNDFdKSArIFwiNDJcIlxuXG4gICAgaXQgXCJzZWxlY3RzIG9uIGxpbmV3aXNlIG1vZGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnViBjdHJsLWInLFxuICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzIyLi40Ml0pXG5cbiAgZGVzY3JpYmUgXCJ0aGUgY3RybC1kIGtleWJpbmRpbmdcIiwgLT5cbiAgICBpdCBcIm1vdmVzIHRoZSBzY3JlZW4gZG93biBieSBoYWxmIHNjcmVlbiBzaXplIGFuZCBrZWVwcyBjdXJzb3Igb25zY3JlZW5cIiwgLT5cbiAgICAgIGVuc3VyZSAnY3RybC1kJyxcbiAgICAgICAgc2Nyb2xsVG9wOiA1MDBcbiAgICAgICAgY3Vyc29yOiBbNTIsIDBdXG5cbiAgICBpdCBcInNlbGVjdHMgb24gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFs0MiwgMV1cbiAgICAgIGVuc3VyZSAndiBjdHJsLWQnLFxuICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzQyLi41MV0pLnNsaWNlKDEpICsgXCI1XCJcblxuICAgIGl0IFwic2VsZWN0cyBvbiBsaW5ld2lzZSBtb2RlXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgY3RybC1kJyxcbiAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFs0Mi4uNTJdKVxuXG4gIGRlc2NyaWJlIFwidGhlIGN0cmwtZiBrZXliaW5kaW5nXCIsIC0+XG4gICAgaXQgXCJtb3ZlcyBzY3JlZW4gZG93biBvbmUgcGFnZVwiLCAtPlxuICAgICAgZW5zdXJlICdjdHJsLWYnLFxuICAgICAgICBzY3JvbGxUb3A6IDYwMFxuICAgICAgICBjdXJzb3I6IFs2MiwgMF1cblxuICAgIGl0IFwic2VsZWN0cyBvbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzQyLCAxXVxuICAgICAgZW5zdXJlICd2IGN0cmwtZicsXG4gICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbNDIuLjYxXSkuc2xpY2UoMSkgKyBcIjZcIlxuXG4gICAgaXQgXCJzZWxlY3RzIG9uIGxpbmV3aXNlIG1vZGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnViBjdHJsLWYnLFxuICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzQyLi42Ml0pXG5cbiAgZGVzY3JpYmUgXCJjdHJsLWYsIGN0cmwtYiwgY3RybC1kLCBjdHJsLXVcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXR0aW5ncy5zZXQoJ21vdmVUb0ZpcnN0Q2hhcmFjdGVyT25WZXJ0aWNhbE1vdGlvbicsIGZhbHNlKVxuICAgICAgc2V0IGN1cnNvcjogWzQyLCAxMF1cbiAgICAgIGVuc3VyZSBzY3JvbGxUb3A6IDQwMFxuXG4gICAgaXQgXCJnbyB0byByb3cgd2l0aCBrZWVwIGNvbHVtbiBhbmQgcmVzcGVjdCBjdXJzb3IuZ29hbENvbHVtXCIsIC0+XG4gICAgICBlbnN1cmUgJ2N0cmwtYicsIHNjcm9sbFRvcDogMjAwLCBjdXJzb3I6IFsyMiwgMTBdXG4gICAgICBlbnN1cmUgJ2N0cmwtZicsIHNjcm9sbFRvcDogNDAwLCBjdXJzb3I6IFs0MiwgMTBdXG4gICAgICBlbnN1cmUgJ2N0cmwtdScsIHNjcm9sbFRvcDogMzAwLCBjdXJzb3I6IFszMiwgMTBdXG4gICAgICBlbnN1cmUgJ2N0cmwtZCcsIHNjcm9sbFRvcDogNDAwLCBjdXJzb3I6IFs0MiwgMTBdXG4gICAgICBlbnN1cmUgJyQnLCBjdXJzb3I6IFs0MiwgMTJdXG4gICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nb2FsQ29sdW1uKS50b0JlKEluZmluaXR5KVxuICAgICAgZW5zdXJlICdjdHJsLWInLCBzY3JvbGxUb3A6IDIwMCwgY3Vyc29yOiBbMjIsIDEyXVxuICAgICAgZW5zdXJlICdjdHJsLWInLCBzY3JvbGxUb3A6ICAgMCwgY3Vyc29yOiBbIDIsIDExXVxuICAgICAgZW5zdXJlICdjdHJsLWYnLCBzY3JvbGxUb3A6IDIwMCwgY3Vyc29yOiBbMjIsIDEyXVxuICAgICAgZW5zdXJlICdjdHJsLWYnLCBzY3JvbGxUb3A6IDQwMCwgY3Vyc29yOiBbNDIsIDEyXVxuICAgICAgZW5zdXJlICdjdHJsLXUnLCBzY3JvbGxUb3A6IDMwMCwgY3Vyc29yOiBbMzIsIDEyXVxuICAgICAgZW5zdXJlICdjdHJsLWQnLCBzY3JvbGxUb3A6IDQwMCwgY3Vyc29yOiBbNDIsIDEyXVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ29hbENvbHVtbikudG9CZShJbmZpbml0eSlcbiJdfQ==
