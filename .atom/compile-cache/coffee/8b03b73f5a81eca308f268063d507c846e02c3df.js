(function() {
  var TextData, dispatch, getView, getVimState, ref, settings,
    slice = [].slice;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView;

  settings = require('../lib/settings');

  describe("Persistent Selection", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
      return runs(function() {
        return jasmine.attachToDOM(editorElement);
      });
    });
    return describe("CreatePersistentSelection operator", function() {
      var ensurePersistentSelection, textForMarker;
      textForMarker = function(marker) {
        return editor.getTextInBufferRange(marker.getBufferRange());
      };
      ensurePersistentSelection = function() {
        var _keystroke, args, markers, options, text;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        switch (args.length) {
          case 1:
            options = args[0];
            break;
          case 2:
            _keystroke = args[0], options = args[1];
        }
        if (_keystroke != null) {
          keystroke(_keystroke);
        }
        markers = vimState.persistentSelection.getMarkers();
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
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g m': 'vim-mode-plus:create-persistent-selection'
          }
        });
        set({
          text: "ooo xxx ooo\nxxx ooo xxx\n\nooo xxx ooo\nxxx ooo xxx\n\nooo xxx ooo\nxxx ooo xxx\n",
          cursor: [0, 0]
        });
        return expect(vimState.persistentSelection.hasMarkers()).toBe(false);
      });
      describe("basic behavior", function() {
        describe("create-persistent-selection", function() {
          it("create-persistent-selection", function() {
            ensurePersistentSelection('g m i w', {
              length: 1,
              text: ['ooo']
            });
            return ensurePersistentSelection('j .', {
              length: 2,
              text: ['ooo', 'xxx']
            });
          });
          return it("create-persistent-selection forr current selection and repeatable by .", function() {
            ensurePersistentSelection('v enter', {
              length: 1,
              text: ['o']
            });
            return ensurePersistentSelection('j .', {
              length: 2,
              text: ['o', 'x']
            });
          });
        });
        return describe("[No behavior diff currently] inner-persistent-selection and a-persistent-selection", function() {
          return it("apply operator to across all persistent-selections", function() {
            ensurePersistentSelection('g m i w j . 2 j g m i p', {
              length: 3,
              text: ['ooo', 'xxx', "ooo xxx ooo\nxxx ooo xxx\n"]
            });
            return ensure('g U a r', {
              text: "OOO xxx ooo\nXXX ooo xxx\n\nOOO XXX OOO\nXXX OOO XXX\n\nooo xxx ooo\nxxx ooo xxx\n"
            });
          });
        });
      });
      describe("practical scenario", function() {
        return describe("persistent-selection is treated in same way as real selection", function() {
          beforeEach(function() {
            set({
              textC: "|0 ==========\n1 ==========\n2 ==========\n3 ==========\n4 ==========\n5 =========="
            });
            ensurePersistentSelection('V j enter', {
              text: ['0 ==========\n1 ==========\n']
            });
            return ensure('2 j V j', {
              selectedText: ['3 ==========\n4 ==========\n'],
              mode: ['visual', 'linewise']
            });
          });
          it("I in vL-mode with persistent-selection", function() {
            return ensure('I', {
              mode: 'insert',
              textC: "|0 ==========\n|1 ==========\n2 ==========\n|3 ==========\n|4 ==========\n5 =========="
            });
          });
          return it("A in vL-mode with persistent-selection", function() {
            return ensure('A', {
              mode: 'insert',
              textC: "0 ==========|\n1 ==========|\n2 ==========\n3 ==========|\n4 ==========|\n5 =========="
            });
          });
        });
      });
      describe("select-occurrence-in-a-persistent-selection", function() {
        return it("select all instance of cursor word only within marked range", function() {
          runs(function() {
            var paragraphText;
            paragraphText = "ooo xxx ooo\nxxx ooo xxx\n";
            return ensurePersistentSelection('g m i p } } j .', {
              length: 2,
              text: [paragraphText, paragraphText]
            });
          });
          return runs(function() {
            ensure('g cmd-d', {
              selectedText: ['ooo', 'ooo', 'ooo', 'ooo', 'ooo', 'ooo']
            });
            keystroke('c');
            editor.insertText('!!!');
            return ensure({
              text: "!!! xxx !!!\nxxx !!! xxx\n\nooo xxx ooo\nxxx ooo xxx\n\n!!! xxx !!!\nxxx !!! xxx\n"
            });
          });
        });
      });
      describe("clear-persistent-selections command", function() {
        return it("clear persistentSelections", function() {
          ensurePersistentSelection('g m i w', {
            length: 1,
            text: ['ooo']
          });
          dispatch(editorElement, 'vim-mode-plus:clear-persistent-selection');
          return expect(vimState.persistentSelection.hasMarkers()).toBe(false);
        });
      });
      return describe("clearPersistentSelectionOnResetNormalMode", function() {
        describe("when disabled", function() {
          return it("it won't clear persistentSelection", function() {
            settings.set('clearPersistentSelectionOnResetNormalMode', false);
            ensurePersistentSelection('g m i w', {
              length: 1,
              text: ['ooo']
            });
            ensure("escape", {
              mode: 'normal'
            });
            return ensurePersistentSelection({
              length: 1,
              text: ['ooo']
            });
          });
        });
        return describe("when enabled", function() {
          return it("it clear persistentSelection on reset-normal-mode", function() {
            settings.set('clearPersistentSelectionOnResetNormalMode', true);
            ensurePersistentSelection('g m i w', {
              length: 1,
              text: ['ooo']
            });
            ensure("escape", {
              mode: 'normal'
            });
            return expect(vimState.persistentSelection.hasMarkers()).toBe(false);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9wZXJzaXN0ZW50LXNlbGVjdGlvbi1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdURBQUE7SUFBQTs7RUFBQSxNQUE2QyxPQUFBLENBQVEsZUFBUixDQUE3QyxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0IsdUJBQXhCLEVBQWtDOztFQUNsQyxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBO0FBQy9CLFFBQUE7SUFBQSxPQUE0RCxFQUE1RCxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLG1CQUFkLEVBQXlCLGdCQUF6QixFQUFpQyx1QkFBakMsRUFBZ0Q7SUFFaEQsVUFBQSxDQUFXLFNBQUE7TUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsSUFBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixjQUFELEVBQU0sb0JBQU4sRUFBYywwQkFBZCxFQUEyQjtNQUhqQixDQUFaO2FBSUEsSUFBQSxDQUFLLFNBQUE7ZUFDSCxPQUFPLENBQUMsV0FBUixDQUFvQixhQUFwQjtNQURHLENBQUw7SUFMUyxDQUFYO1dBUUEsUUFBQSxDQUFTLG9DQUFULEVBQStDLFNBQUE7QUFDN0MsVUFBQTtNQUFBLGFBQUEsR0FBZ0IsU0FBQyxNQUFEO2VBQ2QsTUFBTSxDQUFDLG9CQUFQLENBQTRCLE1BQU0sQ0FBQyxjQUFQLENBQUEsQ0FBNUI7TUFEYztNQUdoQix5QkFBQSxHQUE0QixTQUFBO0FBQzFCLFlBQUE7UUFEMkI7QUFDM0IsZ0JBQU8sSUFBSSxDQUFDLE1BQVo7QUFBQSxlQUNPLENBRFA7WUFDZSxVQUFXO0FBQW5CO0FBRFAsZUFFTyxDQUZQO1lBRWUsb0JBQUQsRUFBYTtBQUYzQjtRQUlBLElBQUcsa0JBQUg7VUFDRSxTQUFBLENBQVUsVUFBVixFQURGOztRQUdBLE9BQUEsR0FBVSxRQUFRLENBQUMsbUJBQW1CLENBQUMsVUFBN0IsQ0FBQTtRQUNWLElBQUcsc0JBQUg7VUFDRSxNQUFBLENBQU8sT0FBUCxDQUFlLENBQUMsWUFBaEIsQ0FBNkIsT0FBTyxDQUFDLE1BQXJDLEVBREY7O1FBR0EsSUFBRyxvQkFBSDtVQUNFLElBQUEsR0FBTyxPQUFPLENBQUMsR0FBUixDQUFZLFNBQUMsTUFBRDttQkFBWSxhQUFBLENBQWMsTUFBZDtVQUFaLENBQVo7VUFDUCxNQUFBLENBQU8sSUFBUCxDQUFZLENBQUMsT0FBYixDQUFxQixPQUFPLENBQUMsSUFBN0IsRUFGRjs7UUFJQSxJQUFHLG9CQUFIO2lCQUNFLE1BQUEsQ0FBTztZQUFBLElBQUEsRUFBTSxPQUFPLENBQUMsSUFBZDtXQUFQLEVBREY7O01BaEIwQjtNQW1CNUIsVUFBQSxDQUFXLFNBQUE7UUFDVCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQWIsQ0FBaUIsTUFBakIsRUFDRTtVQUFBLGtEQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sMkNBQVA7V0FERjtTQURGO1FBR0EsR0FBQSxDQUNFO1VBQUEsSUFBQSxFQUFNLG9GQUFOO1VBVUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FWUjtTQURGO2VBWUEsTUFBQSxDQUFPLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxVQUE3QixDQUFBLENBQVAsQ0FBaUQsQ0FBQyxJQUFsRCxDQUF1RCxLQUF2RDtNQWhCUyxDQUFYO01Ba0JBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO1FBQ3pCLFFBQUEsQ0FBUyw2QkFBVCxFQUF3QyxTQUFBO1VBQ3RDLEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBO1lBQ2hDLHlCQUFBLENBQTBCLFNBQTFCLEVBQ0U7Y0FBQSxNQUFBLEVBQVEsQ0FBUjtjQUNBLElBQUEsRUFBTSxDQUFDLEtBQUQsQ0FETjthQURGO21CQUdBLHlCQUFBLENBQTBCLEtBQTFCLEVBQ0U7Y0FBQSxNQUFBLEVBQVEsQ0FBUjtjQUNBLElBQUEsRUFBTSxDQUFDLEtBQUQsRUFBUSxLQUFSLENBRE47YUFERjtVQUpnQyxDQUFsQztpQkFPQSxFQUFBLENBQUcsd0VBQUgsRUFBNkUsU0FBQTtZQUMzRSx5QkFBQSxDQUEwQixTQUExQixFQUNFO2NBQUEsTUFBQSxFQUFRLENBQVI7Y0FDQSxJQUFBLEVBQU0sQ0FBQyxHQUFELENBRE47YUFERjttQkFHQSx5QkFBQSxDQUEwQixLQUExQixFQUNFO2NBQUEsTUFBQSxFQUFRLENBQVI7Y0FDQSxJQUFBLEVBQU0sQ0FBQyxHQUFELEVBQU0sR0FBTixDQUROO2FBREY7VUFKMkUsQ0FBN0U7UUFSc0MsQ0FBeEM7ZUFnQkEsUUFBQSxDQUFTLG9GQUFULEVBQStGLFNBQUE7aUJBQzdGLEVBQUEsQ0FBRyxvREFBSCxFQUF5RCxTQUFBO1lBQ3ZELHlCQUFBLENBQTBCLHlCQUExQixFQUNFO2NBQUEsTUFBQSxFQUFRLENBQVI7Y0FDQSxJQUFBLEVBQU0sQ0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLDRCQUFmLENBRE47YUFERjttQkFJQSxNQUFBLENBQU8sU0FBUCxFQUNFO2NBQUEsSUFBQSxFQUFNLG9GQUFOO2FBREY7VUFMdUQsQ0FBekQ7UUFENkYsQ0FBL0Y7TUFqQnlCLENBQTNCO01BbUNBLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBO2VBQzdCLFFBQUEsQ0FBUywrREFBVCxFQUEwRSxTQUFBO1VBQ3hFLFVBQUEsQ0FBVyxTQUFBO1lBQ1QsR0FBQSxDQUNFO2NBQUEsS0FBQSxFQUFPLHFGQUFQO2FBREY7WUFVQSx5QkFBQSxDQUEwQixXQUExQixFQUNFO2NBQUEsSUFBQSxFQUFNLENBQUMsOEJBQUQsQ0FBTjthQURGO21CQUdBLE1BQUEsQ0FBTyxTQUFQLEVBQ0U7Y0FBQSxZQUFBLEVBQWMsQ0FBQyw4QkFBRCxDQUFkO2NBQ0EsSUFBQSxFQUFNLENBQUMsUUFBRCxFQUFXLFVBQVgsQ0FETjthQURGO1VBZFMsQ0FBWDtVQWtCQSxFQUFBLENBQUcsd0NBQUgsRUFBNkMsU0FBQTttQkFDM0MsTUFBQSxDQUFPLEdBQVAsRUFDRTtjQUFBLElBQUEsRUFBTSxRQUFOO2NBQ0EsS0FBQSxFQUFPLHdGQURQO2FBREY7VUFEMkMsQ0FBN0M7aUJBYUEsRUFBQSxDQUFHLHdDQUFILEVBQTZDLFNBQUE7bUJBQzNDLE1BQUEsQ0FBTyxHQUFQLEVBQ0U7Y0FBQSxJQUFBLEVBQU0sUUFBTjtjQUNBLEtBQUEsRUFBTyx3RkFEUDthQURGO1VBRDJDLENBQTdDO1FBaEN3RSxDQUExRTtNQUQ2QixDQUEvQjtNQThDQSxRQUFBLENBQVMsNkNBQVQsRUFBd0QsU0FBQTtlQUN0RCxFQUFBLENBQUcsNkRBQUgsRUFBa0UsU0FBQTtVQUNoRSxJQUFBLENBQUssU0FBQTtBQUNILGdCQUFBO1lBQUEsYUFBQSxHQUFnQjttQkFJaEIseUJBQUEsQ0FBMEIsaUJBQTFCLEVBQ0U7Y0FBQSxNQUFBLEVBQVEsQ0FBUjtjQUNBLElBQUEsRUFBTSxDQUFDLGFBQUQsRUFBZ0IsYUFBaEIsQ0FETjthQURGO1VBTEcsQ0FBTDtpQkFTQSxJQUFBLENBQUssU0FBQTtZQUNILE1BQUEsQ0FBTyxTQUFQLEVBQ0U7Y0FBQSxZQUFBLEVBQWMsQ0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLEtBQWYsRUFBc0IsS0FBdEIsRUFBNkIsS0FBN0IsRUFBb0MsS0FBcEMsQ0FBZDthQURGO1lBRUEsU0FBQSxDQUFVLEdBQVY7WUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQjttQkFDQSxNQUFBLENBQ0U7Y0FBQSxJQUFBLEVBQU0sb0ZBQU47YUFERjtVQUxHLENBQUw7UUFWZ0UsQ0FBbEU7TUFEc0QsQ0FBeEQ7TUE0QkEsUUFBQSxDQUFTLHFDQUFULEVBQWdELFNBQUE7ZUFDOUMsRUFBQSxDQUFHLDRCQUFILEVBQWlDLFNBQUE7VUFDL0IseUJBQUEsQ0FBMEIsU0FBMUIsRUFDRTtZQUFBLE1BQUEsRUFBUSxDQUFSO1lBQ0EsSUFBQSxFQUFNLENBQUMsS0FBRCxDQUROO1dBREY7VUFJQSxRQUFBLENBQVMsYUFBVCxFQUF3QiwwQ0FBeEI7aUJBQ0EsTUFBQSxDQUFPLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxVQUE3QixDQUFBLENBQVAsQ0FBaUQsQ0FBQyxJQUFsRCxDQUF1RCxLQUF2RDtRQU4rQixDQUFqQztNQUQ4QyxDQUFoRDthQVNBLFFBQUEsQ0FBUywyQ0FBVCxFQUFzRCxTQUFBO1FBQ3BELFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUE7aUJBQ3hCLEVBQUEsQ0FBRyxvQ0FBSCxFQUF5QyxTQUFBO1lBQ3ZDLFFBQVEsQ0FBQyxHQUFULENBQWEsMkNBQWIsRUFBMEQsS0FBMUQ7WUFDQSx5QkFBQSxDQUEwQixTQUExQixFQUNFO2NBQUEsTUFBQSxFQUFRLENBQVI7Y0FDQSxJQUFBLEVBQU0sQ0FBQyxLQUFELENBRE47YUFERjtZQUlBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO2NBQUEsSUFBQSxFQUFNLFFBQU47YUFBakI7bUJBQ0EseUJBQUEsQ0FBMEI7Y0FBQSxNQUFBLEVBQVEsQ0FBUjtjQUFXLElBQUEsRUFBTSxDQUFDLEtBQUQsQ0FBakI7YUFBMUI7VUFQdUMsQ0FBekM7UUFEd0IsQ0FBMUI7ZUFVQSxRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBO2lCQUN2QixFQUFBLENBQUcsbURBQUgsRUFBd0QsU0FBQTtZQUN0RCxRQUFRLENBQUMsR0FBVCxDQUFhLDJDQUFiLEVBQTBELElBQTFEO1lBQ0EseUJBQUEsQ0FBMEIsU0FBMUIsRUFDRTtjQUFBLE1BQUEsRUFBUSxDQUFSO2NBQ0EsSUFBQSxFQUFNLENBQUMsS0FBRCxDQUROO2FBREY7WUFHQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtjQUFBLElBQUEsRUFBTSxRQUFOO2FBQWpCO21CQUNBLE1BQUEsQ0FBTyxRQUFRLENBQUMsbUJBQW1CLENBQUMsVUFBN0IsQ0FBQSxDQUFQLENBQWlELENBQUMsSUFBbEQsQ0FBdUQsS0FBdkQ7VUFOc0QsQ0FBeEQ7UUFEdUIsQ0FBekI7TUFYb0QsQ0FBdEQ7SUEvSjZDLENBQS9DO0VBWCtCLENBQWpDO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNoLCBUZXh0RGF0YSwgZ2V0Vmlld30gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiUGVyc2lzdGVudCBTZWxlY3Rpb25cIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCBfdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gX3ZpbVxuICAgIHJ1bnMgLT5cbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oZWRpdG9yRWxlbWVudClcblxuICBkZXNjcmliZSBcIkNyZWF0ZVBlcnNpc3RlbnRTZWxlY3Rpb24gb3BlcmF0b3JcIiwgLT5cbiAgICB0ZXh0Rm9yTWFya2VyID0gKG1hcmtlcikgLT5cbiAgICAgIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSlcblxuICAgIGVuc3VyZVBlcnNpc3RlbnRTZWxlY3Rpb24gPSAoYXJncy4uLikgLT5cbiAgICAgIHN3aXRjaCBhcmdzLmxlbmd0aFxuICAgICAgICB3aGVuIDEgdGhlbiBbb3B0aW9uc10gPSBhcmdzXG4gICAgICAgIHdoZW4gMiB0aGVuIFtfa2V5c3Ryb2tlLCBvcHRpb25zXSA9IGFyZ3NcblxuICAgICAgaWYgX2tleXN0cm9rZT9cbiAgICAgICAga2V5c3Ryb2tlKF9rZXlzdHJva2UpXG5cbiAgICAgIG1hcmtlcnMgPSB2aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlcnMoKVxuICAgICAgaWYgb3B0aW9ucy5sZW5ndGg/XG4gICAgICAgIGV4cGVjdChtYXJrZXJzKS50b0hhdmVMZW5ndGgob3B0aW9ucy5sZW5ndGgpXG5cbiAgICAgIGlmIG9wdGlvbnMudGV4dD9cbiAgICAgICAgdGV4dCA9IG1hcmtlcnMubWFwIChtYXJrZXIpIC0+IHRleHRGb3JNYXJrZXIobWFya2VyKVxuICAgICAgICBleHBlY3QodGV4dCkudG9FcXVhbChvcHRpb25zLnRleHQpXG5cbiAgICAgIGlmIG9wdGlvbnMubW9kZT9cbiAgICAgICAgZW5zdXJlIG1vZGU6IG9wdGlvbnMubW9kZVxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ2cgbSc6ICd2aW0tbW9kZS1wbHVzOmNyZWF0ZS1wZXJzaXN0ZW50LXNlbGVjdGlvbidcbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgb29vIHh4eCBvb29cbiAgICAgICAgeHh4IG9vbyB4eHhcblxuICAgICAgICBvb28geHh4IG9vb1xuICAgICAgICB4eHggb29vIHh4eFxuXG4gICAgICAgIG9vbyB4eHggb29vXG4gICAgICAgIHh4eCBvb28geHh4XFxuXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgZXhwZWN0KHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uaGFzTWFya2VycygpKS50b0JlKGZhbHNlKVxuXG4gICAgZGVzY3JpYmUgXCJiYXNpYyBiZWhhdmlvclwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJjcmVhdGUtcGVyc2lzdGVudC1zZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJjcmVhdGUtcGVyc2lzdGVudC1zZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uICdnIG0gaSB3JyxcbiAgICAgICAgICAgIGxlbmd0aDogMVxuICAgICAgICAgICAgdGV4dDogWydvb28nXVxuICAgICAgICAgIGVuc3VyZVBlcnNpc3RlbnRTZWxlY3Rpb24gJ2ogLicsXG4gICAgICAgICAgICBsZW5ndGg6IDJcbiAgICAgICAgICAgIHRleHQ6IFsnb29vJywgJ3h4eCddXG4gICAgICAgIGl0IFwiY3JlYXRlLXBlcnNpc3RlbnQtc2VsZWN0aW9uIGZvcnIgY3VycmVudCBzZWxlY3Rpb24gYW5kIHJlcGVhdGFibGUgYnkgLlwiLCAtPlxuICAgICAgICAgIGVuc3VyZVBlcnNpc3RlbnRTZWxlY3Rpb24gJ3YgZW50ZXInLFxuICAgICAgICAgICAgbGVuZ3RoOiAxXG4gICAgICAgICAgICB0ZXh0OiBbJ28nXVxuICAgICAgICAgIGVuc3VyZVBlcnNpc3RlbnRTZWxlY3Rpb24gJ2ogLicsXG4gICAgICAgICAgICBsZW5ndGg6IDJcbiAgICAgICAgICAgIHRleHQ6IFsnbycsICd4J11cblxuICAgICAgZGVzY3JpYmUgXCJbTm8gYmVoYXZpb3IgZGlmZiBjdXJyZW50bHldIGlubmVyLXBlcnNpc3RlbnQtc2VsZWN0aW9uIGFuZCBhLXBlcnNpc3RlbnQtc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiYXBwbHkgb3BlcmF0b3IgdG8gYWNyb3NzIGFsbCBwZXJzaXN0ZW50LXNlbGVjdGlvbnNcIiwgLT5cbiAgICAgICAgICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uICdnIG0gaSB3IGogLiAyIGogZyBtIGkgcCcsICAjIE1hcmsgMiBpbm5lci13b3JkIGFuZCAxIGlubmVyLXBhcmFncmFwaFxuICAgICAgICAgICAgbGVuZ3RoOiAzXG4gICAgICAgICAgICB0ZXh0OiBbJ29vbycsICd4eHgnLCBcIm9vbyB4eHggb29vXFxueHh4IG9vbyB4eHhcXG5cIl1cblxuICAgICAgICAgIGVuc3VyZSAnZyBVIGEgcicsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIE9PTyB4eHggb29vXG4gICAgICAgICAgICBYWFggb29vIHh4eFxuXG4gICAgICAgICAgICBPT08gWFhYIE9PT1xuICAgICAgICAgICAgWFhYIE9PTyBYWFhcblxuICAgICAgICAgICAgb29vIHh4eCBvb29cbiAgICAgICAgICAgIHh4eCBvb28geHh4XFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwicHJhY3RpY2FsIHNjZW5hcmlvXCIsIC0+XG4gICAgICBkZXNjcmliZSBcInBlcnNpc3RlbnQtc2VsZWN0aW9uIGlzIHRyZWF0ZWQgaW4gc2FtZSB3YXkgYXMgcmVhbCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfDAgPT09PT09PT09PVxuICAgICAgICAgICAgMSA9PT09PT09PT09XG4gICAgICAgICAgICAyID09PT09PT09PT1cbiAgICAgICAgICAgIDMgPT09PT09PT09PVxuICAgICAgICAgICAgNCA9PT09PT09PT09XG4gICAgICAgICAgICA1ID09PT09PT09PT1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgZW5zdXJlUGVyc2lzdGVudFNlbGVjdGlvbiAnViBqIGVudGVyJyxcbiAgICAgICAgICAgIHRleHQ6IFsnMCA9PT09PT09PT09XFxuMSA9PT09PT09PT09XFxuJ11cblxuICAgICAgICAgIGVuc3VyZSAnMiBqIFYgaicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFsnMyA9PT09PT09PT09XFxuNCA9PT09PT09PT09XFxuJ11cbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cblxuICAgICAgICBpdCBcIkkgaW4gdkwtbW9kZSB3aXRoIHBlcnNpc3RlbnQtc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdJJyxcbiAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB8MCA9PT09PT09PT09XG4gICAgICAgICAgICB8MSA9PT09PT09PT09XG4gICAgICAgICAgICAyID09PT09PT09PT1cbiAgICAgICAgICAgIHwzID09PT09PT09PT1cbiAgICAgICAgICAgIHw0ID09PT09PT09PT1cbiAgICAgICAgICAgIDUgPT09PT09PT09PVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAjIGN1cnNvcjogW1szLCAwXSwgWzQsIDBdLCBbMCwgMF0sIFsxLCAwXV1cblxuICAgICAgICBpdCBcIkEgaW4gdkwtbW9kZSB3aXRoIHBlcnNpc3RlbnQtc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdBJyxcbiAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAwID09PT09PT09PT18XG4gICAgICAgICAgICAxID09PT09PT09PT18XG4gICAgICAgICAgICAyID09PT09PT09PT1cbiAgICAgICAgICAgIDMgPT09PT09PT09PXxcbiAgICAgICAgICAgIDQgPT09PT09PT09PXxcbiAgICAgICAgICAgIDUgPT09PT09PT09PVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAjIGN1cnNvcjogW1szLCAxMl0sIFs0LCAxMl0sIFswLCAxMl0sIFsxLCAxMl1dXG5cbiAgICBkZXNjcmliZSBcInNlbGVjdC1vY2N1cnJlbmNlLWluLWEtcGVyc2lzdGVudC1zZWxlY3Rpb25cIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IGFsbCBpbnN0YW5jZSBvZiBjdXJzb3Igd29yZCBvbmx5IHdpdGhpbiBtYXJrZWQgcmFuZ2VcIiwgLT5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHBhcmFncmFwaFRleHQgPSBcIlwiXCJcbiAgICAgICAgICAgIG9vbyB4eHggb29vXG4gICAgICAgICAgICB4eHggb29vIHh4eFxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlUGVyc2lzdGVudFNlbGVjdGlvbiAnZyBtIGkgcCB9IH0gaiAuJywgIyBNYXJrIDIgaW5uZXItd29yZCBhbmQgMSBpbm5lci1wYXJhZ3JhcGhcbiAgICAgICAgICAgIGxlbmd0aDogMlxuICAgICAgICAgICAgdGV4dDogW3BhcmFncmFwaFRleHQsIHBhcmFncmFwaFRleHRdXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGVuc3VyZSAnZyBjbWQtZCcsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFsnb29vJywgJ29vbycsICdvb28nLCAnb29vJywgJ29vbycsICdvb28nIF1cbiAgICAgICAgICBrZXlzdHJva2UgJ2MnXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQgJyEhISdcbiAgICAgICAgICBlbnN1cmVcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgISEhIHh4eCAhISFcbiAgICAgICAgICAgIHh4eCAhISEgeHh4XG5cbiAgICAgICAgICAgIG9vbyB4eHggb29vXG4gICAgICAgICAgICB4eHggb29vIHh4eFxuXG4gICAgICAgICAgICAhISEgeHh4ICEhIVxuICAgICAgICAgICAgeHh4ICEhISB4eHhcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJjbGVhci1wZXJzaXN0ZW50LXNlbGVjdGlvbnMgY29tbWFuZFwiLCAtPlxuICAgICAgaXQgXCJjbGVhciBwZXJzaXN0ZW50U2VsZWN0aW9uc1wiLCAtPlxuICAgICAgICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uICdnIG0gaSB3JyxcbiAgICAgICAgICBsZW5ndGg6IDFcbiAgICAgICAgICB0ZXh0OiBbJ29vbyddXG5cbiAgICAgICAgZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ3ZpbS1tb2RlLXBsdXM6Y2xlYXItcGVyc2lzdGVudC1zZWxlY3Rpb24nKVxuICAgICAgICBleHBlY3QodmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5oYXNNYXJrZXJzKCkpLnRvQmUoZmFsc2UpXG5cbiAgICBkZXNjcmliZSBcImNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbk9uUmVzZXROb3JtYWxNb2RlXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndoZW4gZGlzYWJsZWRcIiwgLT5cbiAgICAgICAgaXQgXCJpdCB3b24ndCBjbGVhciBwZXJzaXN0ZW50U2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCdjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25PblJlc2V0Tm9ybWFsTW9kZScsIGZhbHNlKVxuICAgICAgICAgIGVuc3VyZVBlcnNpc3RlbnRTZWxlY3Rpb24gJ2cgbSBpIHcnLFxuICAgICAgICAgICAgbGVuZ3RoOiAxXG4gICAgICAgICAgICB0ZXh0OiBbJ29vbyddXG5cbiAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uIGxlbmd0aDogMSwgdGV4dDogWydvb28nXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gZW5hYmxlZFwiLCAtPlxuICAgICAgICBpdCBcIml0IGNsZWFyIHBlcnNpc3RlbnRTZWxlY3Rpb24gb24gcmVzZXQtbm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ2NsZWFyUGVyc2lzdGVudFNlbGVjdGlvbk9uUmVzZXROb3JtYWxNb2RlJywgdHJ1ZSlcbiAgICAgICAgICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uICdnIG0gaSB3JyxcbiAgICAgICAgICAgIGxlbmd0aDogMVxuICAgICAgICAgICAgdGV4dDogWydvb28nXVxuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uLmhhc01hcmtlcnMoKSkudG9CZShmYWxzZSlcbiJdfQ==
