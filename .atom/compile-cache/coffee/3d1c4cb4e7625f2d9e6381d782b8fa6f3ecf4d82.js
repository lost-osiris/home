(function() {
  var TextData, dispatch, getView, getVimState, rawKeystroke, ref, settings, withMockPlatform;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView, withMockPlatform = ref.withMockPlatform, rawKeystroke = ref.rawKeystroke;

  settings = require('../lib/settings');

  describe("Operator modifier", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
      return runs(function() {
        return jasmine.attachToDOM(editorElement);
      });
    });
    return describe("operator-modifier to force wise", function() {
      beforeEach(function() {
        return set({
          text: "012345 789\nABCDEF EFG"
        });
      });
      describe("operator-modifier-characterwise", function() {
        describe("when target is linewise", function() {
          return it("operate characterwisely and exclusively", function() {
            set({
              cursor: [0, 1]
            });
            return ensure("d v j", {
              text: "0BCDEF EFG"
            });
          });
        });
        return describe("when target is characterwise", function() {
          it("operate inclusively for exclusive target", function() {
            set({
              cursor: [0, 9]
            });
            return ensure("d v b", {
              cursor: [0, 6],
              text_: "012345_\nABCDEF EFG"
            });
          });
          return it("operate exclusively for inclusive target", function() {
            set({
              cursor: [0, 0]
            });
            return ensure("d v e", {
              cursor: [0, 0],
              text: "5 789\nABCDEF EFG"
            });
          });
        });
      });
      return describe("operator-modifier-linewise", function() {
        return it("operate linewisely for characterwise target", function() {
          set({
            cursor: [0, 1]
          });
          return ensure([
            'd V /', {
              search: 'DEF'
            }
          ], {
            cursor: [0, 0],
            text: ""
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9vcGVyYXRvci1tb2RpZmllci1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBNkUsT0FBQSxDQUFRLGVBQVIsQ0FBN0UsRUFBQyw2QkFBRCxFQUFjLHVCQUFkLEVBQXdCLHVCQUF4QixFQUFrQyxxQkFBbEMsRUFBMkMsdUNBQTNDLEVBQTZEOztFQUM3RCxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBO0FBQzVCLFFBQUE7SUFBQSxPQUE0RCxFQUE1RCxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLG1CQUFkLEVBQXlCLGdCQUF6QixFQUFpQyx1QkFBakMsRUFBZ0Q7SUFFaEQsVUFBQSxDQUFXLFNBQUE7TUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixhQUFELEVBQU0sbUJBQU4sRUFBYyx5QkFBZCxFQUEyQjtNQUhqQixDQUFaO2FBS0EsSUFBQSxDQUFLLFNBQUE7ZUFDSCxPQUFPLENBQUMsV0FBUixDQUFvQixhQUFwQjtNQURHLENBQUw7SUFOUyxDQUFYO1dBU0EsUUFBQSxDQUFTLGlDQUFULEVBQTRDLFNBQUE7TUFDMUMsVUFBQSxDQUFXLFNBQUE7ZUFDVCxHQUFBLENBQ0U7VUFBQSxJQUFBLEVBQU0sd0JBQU47U0FERjtNQURTLENBQVg7TUFNQSxRQUFBLENBQVMsaUNBQVQsRUFBNEMsU0FBQTtRQUMxQyxRQUFBLENBQVMseUJBQVQsRUFBb0MsU0FBQTtpQkFDbEMsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUE7WUFDNUMsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO21CQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQ0U7Y0FBQSxJQUFBLEVBQU0sWUFBTjthQURGO1VBRjRDLENBQTlDO1FBRGtDLENBQXBDO2VBT0EsUUFBQSxDQUFTLDhCQUFULEVBQXlDLFNBQUE7VUFDdkMsRUFBQSxDQUFHLDBDQUFILEVBQStDLFNBQUE7WUFDN0MsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO21CQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQ0U7Y0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2NBQ0EsS0FBQSxFQUFPLHFCQURQO2FBREY7VUFGNkMsQ0FBL0M7aUJBUUEsRUFBQSxDQUFHLDBDQUFILEVBQStDLFNBQUE7WUFDN0MsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO21CQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQ0U7Y0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2NBQ0EsSUFBQSxFQUFNLG1CQUROO2FBREY7VUFGNkMsQ0FBL0M7UUFUdUMsQ0FBekM7TUFSMEMsQ0FBNUM7YUF5QkEsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUE7ZUFDckMsRUFBQSxDQUFHLDZDQUFILEVBQWtELFNBQUE7VUFDaEQsR0FBQSxDQUFJO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKO2lCQUNBLE1BQUEsQ0FBTztZQUFDLE9BQUQsRUFBVTtjQUFBLE1BQUEsRUFBUSxLQUFSO2FBQVY7V0FBUCxFQUNFO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtZQUNBLElBQUEsRUFBTSxFQUROO1dBREY7UUFGZ0QsQ0FBbEQ7TUFEcUMsQ0FBdkM7SUFoQzBDLENBQTVDO0VBWjRCLENBQTlCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNoLCBUZXh0RGF0YSwgZ2V0Vmlldywgd2l0aE1vY2tQbGF0Zm9ybSwgcmF3S2V5c3Ryb2tlfSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuZGVzY3JpYmUgXCJPcGVyYXRvciBtb2RpZmllclwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbVxuXG4gICAgcnVucyAtPlxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShlZGl0b3JFbGVtZW50KVxuXG4gIGRlc2NyaWJlIFwib3BlcmF0b3ItbW9kaWZpZXIgdG8gZm9yY2Ugd2lzZVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgMDEyMzQ1IDc4OVxuICAgICAgICBBQkNERUYgRUZHXG4gICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlIFwib3BlcmF0b3ItbW9kaWZpZXItY2hhcmFjdGVyd2lzZVwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHRhcmdldCBpcyBsaW5ld2lzZVwiLCAtPlxuICAgICAgICBpdCBcIm9wZXJhdGUgY2hhcmFjdGVyd2lzZWx5IGFuZCBleGNsdXNpdmVseVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgICAgIGVuc3VyZSBcImQgdiBqXCIsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDBCQ0RFRiBFRkdcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHRhcmdldCBpcyBjaGFyYWN0ZXJ3aXNlXCIsIC0+XG4gICAgICAgIGl0IFwib3BlcmF0ZSBpbmNsdXNpdmVseSBmb3IgZXhjbHVzaXZlIHRhcmdldFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA5XVxuICAgICAgICAgIGVuc3VyZSBcImQgdiBiXCIsXG4gICAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgMDEyMzQ1X1xuICAgICAgICAgICAgQUJDREVGIEVGR1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwib3BlcmF0ZSBleGNsdXNpdmVseSBmb3IgaW5jbHVzaXZlIHRhcmdldFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSBcImQgdiBlXCIsXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICA1IDc4OVxuICAgICAgICAgICAgQUJDREVGIEVGR1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgZGVzY3JpYmUgXCJvcGVyYXRvci1tb2RpZmllci1saW5ld2lzZVwiLCAtPlxuICAgICAgaXQgXCJvcGVyYXRlIGxpbmV3aXNlbHkgZm9yIGNoYXJhY3Rlcndpc2UgdGFyZ2V0XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBlbnN1cmUgWydkIFYgLycsIHNlYXJjaDogJ0RFRiddLFxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgdGV4dDogXCJcIlxuIl19
