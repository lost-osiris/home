(function() {
  var getView, getVimState, packageName, ref;

  ref = require('./spec-helper'), getVimState = ref.getVimState, getView = ref.getView;

  packageName = 'vim-mode-plus';

  describe("vim-mode-plus", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState, workspaceElement;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5], workspaceElement = ref1[6];
    beforeEach(function() {
      getVimState(function(_vimState, vim) {
        vimState = _vimState;
        editor = _vimState.editor, editorElement = _vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
      workspaceElement = getView(atom.workspace);
      return waitsForPromise(function() {
        return atom.packages.activatePackage('status-bar');
      });
    });
    describe(".activate", function() {
      it("puts the editor in normal-mode initially by default", function() {
        return ensure({
          mode: 'normal'
        });
      });
      return it("shows the current vim mode in the status bar", function() {
        var statusBarTile;
        statusBarTile = null;
        waitsFor(function() {
          return statusBarTile = workspaceElement.querySelector("#status-bar-vim-mode-plus");
        });
        return runs(function() {
          expect(statusBarTile.textContent).toBe("N");
          ensure('i', {
            mode: 'insert'
          });
          return expect(statusBarTile.textContent).toBe("I");
        });
      });
    });
    return describe(".deactivate", function() {
      it("removes the vim classes from the editor", function() {
        atom.packages.deactivatePackage(packageName);
        expect(editorElement.classList.contains("vim-mode-plus")).toBe(false);
        return expect(editorElement.classList.contains("normal-mode")).toBe(false);
      });
      return it("removes the vim commands from the editor element", function() {
        var vimCommands;
        vimCommands = function() {
          return atom.commands.findCommands({
            target: editorElement
          }).filter(function(cmd) {
            return cmd.name.startsWith("vim-mode-plus:");
          });
        };
        expect(vimCommands().length).toBeGreaterThan(0);
        atom.packages.deactivatePackage(packageName);
        return expect(vimCommands().length).toBe(0);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy92aW0tbW9kZS1wbHVzLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUF5QixPQUFBLENBQVEsZUFBUixDQUF6QixFQUFDLDZCQUFELEVBQWM7O0VBRWQsV0FBQSxHQUFjOztFQUNkLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUE7QUFDeEIsUUFBQTtJQUFBLE9BQThFLEVBQTlFLEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsbUJBQWQsRUFBeUIsZ0JBQXpCLEVBQWlDLHVCQUFqQyxFQUFnRCxrQkFBaEQsRUFBMEQ7SUFFMUQsVUFBQSxDQUFXLFNBQUE7TUFDVCxXQUFBLENBQVksU0FBQyxTQUFELEVBQVksR0FBWjtRQUNWLFFBQUEsR0FBVztRQUNWLHlCQUFELEVBQVM7ZUFDUixhQUFELEVBQU0sbUJBQU4sRUFBYyx5QkFBZCxFQUEyQjtNQUhqQixDQUFaO01BS0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLElBQUksQ0FBQyxTQUFiO2FBRW5CLGVBQUEsQ0FBZ0IsU0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixZQUE5QjtNQURjLENBQWhCO0lBUlMsQ0FBWDtJQVdBLFFBQUEsQ0FBUyxXQUFULEVBQXNCLFNBQUE7TUFDcEIsRUFBQSxDQUFHLHFEQUFILEVBQTBELFNBQUE7ZUFDeEQsTUFBQSxDQUFPO1VBQUEsSUFBQSxFQUFNLFFBQU47U0FBUDtNQUR3RCxDQUExRDthQUdBLEVBQUEsQ0FBRyw4Q0FBSCxFQUFtRCxTQUFBO0FBQ2pELFlBQUE7UUFBQSxhQUFBLEdBQWdCO1FBRWhCLFFBQUEsQ0FBUyxTQUFBO2lCQUNQLGFBQUEsR0FBZ0IsZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0IsMkJBQS9CO1FBRFQsQ0FBVDtlQUdBLElBQUEsQ0FBSyxTQUFBO1VBQ0gsTUFBQSxDQUFPLGFBQWEsQ0FBQyxXQUFyQixDQUFpQyxDQUFDLElBQWxDLENBQXVDLEdBQXZDO1VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtZQUFBLElBQUEsRUFBTSxRQUFOO1dBQVo7aUJBQ0EsTUFBQSxDQUFPLGFBQWEsQ0FBQyxXQUFyQixDQUFpQyxDQUFDLElBQWxDLENBQXVDLEdBQXZDO1FBSEcsQ0FBTDtNQU5pRCxDQUFuRDtJQUpvQixDQUF0QjtXQWVBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUE7TUFDdEIsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUE7UUFDNUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBZCxDQUFnQyxXQUFoQztRQUNBLE1BQUEsQ0FBTyxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQXhCLENBQWlDLGVBQWpDLENBQVAsQ0FBeUQsQ0FBQyxJQUExRCxDQUErRCxLQUEvRDtlQUNBLE1BQUEsQ0FBTyxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQXhCLENBQWlDLGFBQWpDLENBQVAsQ0FBdUQsQ0FBQyxJQUF4RCxDQUE2RCxLQUE3RDtNQUg0QyxDQUE5QzthQUtBLEVBQUEsQ0FBRyxrREFBSCxFQUF1RCxTQUFBO0FBQ3JELFlBQUE7UUFBQSxXQUFBLEdBQWMsU0FBQTtpQkFDWixJQUFJLENBQUMsUUFBUSxDQUFDLFlBQWQsQ0FBMkI7WUFBQSxNQUFBLEVBQVEsYUFBUjtXQUEzQixDQUFpRCxDQUFDLE1BQWxELENBQXlELFNBQUMsR0FBRDttQkFDdkQsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFULENBQW9CLGdCQUFwQjtVQUR1RCxDQUF6RDtRQURZO1FBSWQsTUFBQSxDQUFPLFdBQUEsQ0FBQSxDQUFhLENBQUMsTUFBckIsQ0FBNEIsQ0FBQyxlQUE3QixDQUE2QyxDQUE3QztRQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWQsQ0FBZ0MsV0FBaEM7ZUFDQSxNQUFBLENBQU8sV0FBQSxDQUFBLENBQWEsQ0FBQyxNQUFyQixDQUE0QixDQUFDLElBQTdCLENBQWtDLENBQWxDO01BUHFELENBQXZEO0lBTnNCLENBQXhCO0VBN0J3QixDQUExQjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBnZXRWaWV3fSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5cbnBhY2thZ2VOYW1lID0gJ3ZpbS1tb2RlLXBsdXMnXG5kZXNjcmliZSBcInZpbS1tb2RlLXBsdXNcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGUsIHdvcmtzcGFjZUVsZW1lbnRdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKF92aW1TdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBfdmltU3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gX3ZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSB2aW1cblxuICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBnZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnc3RhdHVzLWJhcicpXG5cbiAgZGVzY3JpYmUgXCIuYWN0aXZhdGVcIiwgLT5cbiAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbiBub3JtYWwtbW9kZSBpbml0aWFsbHkgYnkgZGVmYXVsdFwiLCAtPlxuICAgICAgZW5zdXJlIG1vZGU6ICdub3JtYWwnXG5cbiAgICBpdCBcInNob3dzIHRoZSBjdXJyZW50IHZpbSBtb2RlIGluIHRoZSBzdGF0dXMgYmFyXCIsIC0+XG4gICAgICBzdGF0dXNCYXJUaWxlID0gbnVsbFxuXG4gICAgICB3YWl0c0ZvciAtPlxuICAgICAgICBzdGF0dXNCYXJUaWxlID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXR1cy1iYXItdmltLW1vZGUtcGx1c1wiKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChzdGF0dXNCYXJUaWxlLnRleHRDb250ZW50KS50b0JlKFwiTlwiKVxuICAgICAgICBlbnN1cmUgJ2knLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICBleHBlY3Qoc3RhdHVzQmFyVGlsZS50ZXh0Q29udGVudCkudG9CZShcIklcIilcblxuICBkZXNjcmliZSBcIi5kZWFjdGl2YXRlXCIsIC0+XG4gICAgaXQgXCJyZW1vdmVzIHRoZSB2aW0gY2xhc3NlcyBmcm9tIHRoZSBlZGl0b3JcIiwgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UocGFja2FnZU5hbWUpXG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJ2aW0tbW9kZS1wbHVzXCIpKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibm9ybWFsLW1vZGVcIikpLnRvQmUoZmFsc2UpXG5cbiAgICBpdCBcInJlbW92ZXMgdGhlIHZpbSBjb21tYW5kcyBmcm9tIHRoZSBlZGl0b3IgZWxlbWVudFwiLCAtPlxuICAgICAgdmltQ29tbWFuZHMgPSAtPlxuICAgICAgICBhdG9tLmNvbW1hbmRzLmZpbmRDb21tYW5kcyh0YXJnZXQ6IGVkaXRvckVsZW1lbnQpLmZpbHRlciAoY21kKSAtPlxuICAgICAgICAgIGNtZC5uYW1lLnN0YXJ0c1dpdGgoXCJ2aW0tbW9kZS1wbHVzOlwiKVxuXG4gICAgICBleHBlY3QodmltQ29tbWFuZHMoKS5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbigwKVxuICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrYWdlTmFtZSlcbiAgICAgIGV4cGVjdCh2aW1Db21tYW5kcygpLmxlbmd0aCkudG9CZSgwKVxuIl19
