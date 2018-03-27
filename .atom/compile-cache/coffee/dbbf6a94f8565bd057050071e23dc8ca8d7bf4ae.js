(function() {
  var _, getVimState;

  _ = require('underscore-plus');

  getVimState = require('./spec-helper').getVimState;

  xdescribe("visual-mode performance", function() {
    var editor, editorElement, ensure, keystroke, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], keystroke = ref[2], editor = ref[3], editorElement = ref[4], vimState = ref[5];
    beforeEach(function() {
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
    });
    afterEach(function() {
      vimState.resetNormalMode();
      return vimState.globalState.reset();
    });
    return describe("slow down editor", function() {
      var measureWithTimeEnd, moveRightAndLeftCheck;
      moveRightAndLeftCheck = function(scenario, modeSig) {
        var moveBySelect, moveByVMP, moveCount;
        console.log([scenario, modeSig, atom.getVersion(), atom.packages.getActivePackage('vim-mode-plus').metadata.version]);
        moveCount = 89;
        switch (scenario) {
          case 'vmp':
            moveByVMP = function() {
              _.times(moveCount, function() {
                return keystroke('l');
              });
              return _.times(moveCount, function() {
                return keystroke('h');
              });
            };
            return _.times(10, function() {
              return measureWithTimeEnd(moveByVMP);
            });
          case 'sel':
            moveBySelect = function() {
              _.times(moveCount, function() {
                return editor.getLastSelection().selectRight();
              });
              return _.times(moveCount, function() {
                return editor.getLastSelection().selectLeft();
              });
            };
            return _.times(15, function() {
              return measureWithTimeEnd(moveBySelect);
            });
        }
      };
      measureWithTimeEnd = function(fn) {
        console.time(fn.name);
        fn();
        return console.timeEnd(fn.name);
      };
      beforeEach(function() {
        return set({
          cursor: [0, 0],
          text: "012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789"
        });
      });
      return describe("vmp", function() {
        it("[normal] slow down editor", function() {
          return moveRightAndLeftCheck('vmp', 'moveCount');
        });
        it("[vC] slow down editor", function() {
          ensure('v', {
            mode: ['visual', 'characterwise']
          });
          moveRightAndLeftCheck('vmp', 'vC');
          ensure('escape', {
            mode: 'normal'
          });
          ensure('v', {
            mode: ['visual', 'characterwise']
          });
          moveRightAndLeftCheck('vmp', 'vC');
          return ensure('escape', {
            mode: 'normal'
          });
        });
        return it("[vC] slow down editor", function() {
          return moveRightAndLeftCheck('sel', 'vC');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9wZXJmb3JtYW5jZS1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSCxjQUFlLE9BQUEsQ0FBUSxlQUFSOztFQUVoQixTQUFBLENBQVUseUJBQVYsRUFBcUMsU0FBQTtBQUNuQyxRQUFBO0lBQUEsTUFBNEQsRUFBNUQsRUFBQyxZQUFELEVBQU0sZUFBTixFQUFjLGtCQUFkLEVBQXlCLGVBQXpCLEVBQWlDLHNCQUFqQyxFQUFnRDtJQUVoRCxVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxJQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGNBQUQsRUFBTSxvQkFBTixFQUFjLDBCQUFkLEVBQTJCO01BSGpCLENBQVo7SUFEUyxDQUFYO0lBTUEsU0FBQSxDQUFVLFNBQUE7TUFDUixRQUFRLENBQUMsZUFBVCxDQUFBO2FBQ0EsUUFBUSxDQUFDLFdBQVcsQ0FBQyxLQUFyQixDQUFBO0lBRlEsQ0FBVjtXQUlBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO0FBQzNCLFVBQUE7TUFBQSxxQkFBQSxHQUF3QixTQUFDLFFBQUQsRUFBVyxPQUFYO0FBQ3RCLFlBQUE7UUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUMsUUFBRCxFQUFXLE9BQVgsRUFBb0IsSUFBSSxDQUFDLFVBQUwsQ0FBQSxDQUFwQixFQUF1QyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLGVBQS9CLENBQStDLENBQUMsUUFBUSxDQUFDLE9BQWhHLENBQVo7UUFFQSxTQUFBLEdBQVk7QUFDWixnQkFBTyxRQUFQO0FBQUEsZUFDTyxLQURQO1lBRUksU0FBQSxHQUFZLFNBQUE7Y0FDVixDQUFDLENBQUMsS0FBRixDQUFRLFNBQVIsRUFBbUIsU0FBQTt1QkFBRyxTQUFBLENBQVUsR0FBVjtjQUFILENBQW5CO3FCQUNBLENBQUMsQ0FBQyxLQUFGLENBQVEsU0FBUixFQUFtQixTQUFBO3VCQUFHLFNBQUEsQ0FBVSxHQUFWO2NBQUgsQ0FBbkI7WUFGVTttQkFHWixDQUFDLENBQUMsS0FBRixDQUFRLEVBQVIsRUFBWSxTQUFBO3FCQUFHLGtCQUFBLENBQW1CLFNBQW5CO1lBQUgsQ0FBWjtBQUxKLGVBTU8sS0FOUDtZQU9JLFlBQUEsR0FBZSxTQUFBO2NBQ2IsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxTQUFSLEVBQW1CLFNBQUE7dUJBQUcsTUFBTSxDQUFDLGdCQUFQLENBQUEsQ0FBeUIsQ0FBQyxXQUExQixDQUFBO2NBQUgsQ0FBbkI7cUJBQ0EsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxTQUFSLEVBQW1CLFNBQUE7dUJBQUcsTUFBTSxDQUFDLGdCQUFQLENBQUEsQ0FBeUIsQ0FBQyxVQUExQixDQUFBO2NBQUgsQ0FBbkI7WUFGYTttQkFHZixDQUFDLENBQUMsS0FBRixDQUFRLEVBQVIsRUFBWSxTQUFBO3FCQUFHLGtCQUFBLENBQW1CLFlBQW5CO1lBQUgsQ0FBWjtBQVZKO01BSnNCO01BZ0J4QixrQkFBQSxHQUFxQixTQUFDLEVBQUQ7UUFDbkIsT0FBTyxDQUFDLElBQVIsQ0FBYSxFQUFFLENBQUMsSUFBaEI7UUFDQSxFQUFBLENBQUE7ZUFDQSxPQUFPLENBQUMsT0FBUixDQUFnQixFQUFFLENBQUMsSUFBbkI7TUFIbUI7TUFLckIsVUFBQSxDQUFXLFNBQUE7ZUFDVCxHQUFBLENBQ0U7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1VBQ0EsSUFBQSxFQUFNLDRGQUROO1NBREY7TUFEUyxDQUFYO2FBT0EsUUFBQSxDQUFTLEtBQVQsRUFBZ0IsU0FBQTtRQUVkLEVBQUEsQ0FBRywyQkFBSCxFQUFnQyxTQUFBO2lCQUM5QixxQkFBQSxDQUFzQixLQUF0QixFQUE2QixXQUE3QjtRQUQ4QixDQUFoQztRQUVBLEVBQUEsQ0FBRyx1QkFBSCxFQUE0QixTQUFBO1VBQzFCLE1BQUEsQ0FBTyxHQUFQLEVBQVk7WUFBQSxJQUFBLEVBQU0sQ0FBQyxRQUFELEVBQVcsZUFBWCxDQUFOO1dBQVo7VUFDQSxxQkFBQSxDQUFzQixLQUF0QixFQUE2QixJQUE3QjtVQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1lBQUEsSUFBQSxFQUFNLFFBQU47V0FBakI7VUFFQSxNQUFBLENBQU8sR0FBUCxFQUFZO1lBQUEsSUFBQSxFQUFNLENBQUMsUUFBRCxFQUFXLGVBQVgsQ0FBTjtXQUFaO1VBQ0EscUJBQUEsQ0FBc0IsS0FBdEIsRUFBNkIsSUFBN0I7aUJBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7WUFBQSxJQUFBLEVBQU0sUUFBTjtXQUFqQjtRQVAwQixDQUE1QjtlQVNBLEVBQUEsQ0FBRyx1QkFBSCxFQUE0QixTQUFBO2lCQUUxQixxQkFBQSxDQUFzQixLQUF0QixFQUE2QixJQUE3QjtRQUYwQixDQUE1QjtNQWJjLENBQWhCO0lBN0IyQixDQUE3QjtFQWJtQyxDQUFyQztBQUpBIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxue2dldFZpbVN0YXRlfSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5cbnhkZXNjcmliZSBcInZpc3VhbC1tb2RlIHBlcmZvcm1hbmNlXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgX3ZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGUgIyB0byByZWZlciBhcyB2aW1TdGF0ZSBsYXRlci5cbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IF92aW1cblxuICBhZnRlckVhY2ggLT5cbiAgICB2aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKVxuICAgIHZpbVN0YXRlLmdsb2JhbFN0YXRlLnJlc2V0KClcblxuICBkZXNjcmliZSBcInNsb3cgZG93biBlZGl0b3JcIiwgLT5cbiAgICBtb3ZlUmlnaHRBbmRMZWZ0Q2hlY2sgPSAoc2NlbmFyaW8sIG1vZGVTaWcpIC0+XG4gICAgICBjb25zb2xlLmxvZyBbc2NlbmFyaW8sIG1vZGVTaWcsIGF0b20uZ2V0VmVyc2lvbigpLCBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKS5tZXRhZGF0YS52ZXJzaW9uXVxuXG4gICAgICBtb3ZlQ291bnQgPSA4OVxuICAgICAgc3dpdGNoIHNjZW5hcmlvXG4gICAgICAgIHdoZW4gJ3ZtcCdcbiAgICAgICAgICBtb3ZlQnlWTVAgPSAtPlxuICAgICAgICAgICAgXy50aW1lcyBtb3ZlQ291bnQsIC0+IGtleXN0cm9rZSAnbCdcbiAgICAgICAgICAgIF8udGltZXMgbW92ZUNvdW50LCAtPiBrZXlzdHJva2UgJ2gnXG4gICAgICAgICAgXy50aW1lcyAxMCwgLT4gbWVhc3VyZVdpdGhUaW1lRW5kKG1vdmVCeVZNUClcbiAgICAgICAgd2hlbiAnc2VsJ1xuICAgICAgICAgIG1vdmVCeVNlbGVjdCA9IC0+XG4gICAgICAgICAgICBfLnRpbWVzIG1vdmVDb3VudCwgLT4gZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5zZWxlY3RSaWdodCgpXG4gICAgICAgICAgICBfLnRpbWVzIG1vdmVDb3VudCwgLT4gZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5zZWxlY3RMZWZ0KClcbiAgICAgICAgICBfLnRpbWVzIDE1LCAtPiBtZWFzdXJlV2l0aFRpbWVFbmQobW92ZUJ5U2VsZWN0KVxuXG4gICAgbWVhc3VyZVdpdGhUaW1lRW5kID0gKGZuKSAtPlxuICAgICAgY29uc29sZS50aW1lKGZuLm5hbWUpXG4gICAgICBmbigpXG4gICAgICBjb25zb2xlLnRpbWVFbmQoZm4ubmFtZSlcblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODlcbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwidm1wXCIsIC0+XG4gICAgICAjIGJlZm9yZUVhY2ggLT5cbiAgICAgIGl0IFwiW25vcm1hbF0gc2xvdyBkb3duIGVkaXRvclwiLCAtPlxuICAgICAgICBtb3ZlUmlnaHRBbmRMZWZ0Q2hlY2soJ3ZtcCcsICdtb3ZlQ291bnQnKVxuICAgICAgaXQgXCJbdkNdIHNsb3cgZG93biBlZGl0b3JcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2JywgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgIG1vdmVSaWdodEFuZExlZnRDaGVjaygndm1wJywgJ3ZDJylcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgIGVuc3VyZSAndicsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICBtb3ZlUmlnaHRBbmRMZWZ0Q2hlY2soJ3ZtcCcsICd2QycpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCdcblxuICAgICAgaXQgXCJbdkNdIHNsb3cgZG93biBlZGl0b3JcIiwgLT5cbiAgICAgICAgIyBlbnN1cmUgJ3YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgbW92ZVJpZ2h0QW5kTGVmdENoZWNrKCdzZWwnLCAndkMnKVxuIl19
