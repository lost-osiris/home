(function() {
  var CompositeDisposable, CursorStyleManager, Delegato, Disposable, Point, SupportCursorSetVisible, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Point = ref.Point, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Delegato = require('delegato');

  SupportCursorSetVisible = null;

  module.exports = CursorStyleManager = (function() {
    CursorStyleManager.prototype.lineHeight = null;

    Delegato.includeInto(CursorStyleManager);

    CursorStyleManager.delegatesProperty('mode', 'submode', {
      toProperty: 'vimState'
    });

    function CursorStyleManager(vimState) {
      var ref1;
      this.vimState = vimState;
      this.refresh = bind(this.refresh, this);
      this.destroy = bind(this.destroy, this);
      ref1 = this.vimState, this.editorElement = ref1.editorElement, this.editor = ref1.editor;
      if (SupportCursorSetVisible == null) {
        SupportCursorSetVisible = this.editor.getLastCursor().setVisible != null;
      }
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.config.observe('editor.lineHeight', this.refresh));
      this.disposables.add(atom.config.observe('editor.fontSize', this.refresh));
      this.vimState.onDidDestroy(this.destroy);
    }

    CursorStyleManager.prototype.destroy = function() {
      var ref1;
      if ((ref1 = this.styleDisposables) != null) {
        ref1.dispose();
      }
      return this.disposables.dispose();
    };

    CursorStyleManager.prototype.updateCursorStyleOld = function() {
      var cursor, cursorIsVisible, cursorsToShow, i, len, ref1, ref2, results;
      if ((ref1 = this.styleDisposables) != null) {
        ref1.dispose();
      }
      this.styleDisposables = new CompositeDisposable;
      if (this.mode !== 'visual') {
        return;
      }
      if (this.submode === 'blockwise') {
        cursorsToShow = this.vimState.getBlockwiseSelections().map(function(bs) {
          return bs.getHeadSelection().cursor;
        });
      } else {
        cursorsToShow = this.editor.getCursors();
      }
      this.editorElement.component.updateSync();
      ref2 = this.editor.getCursors();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        cursorIsVisible = indexOf.call(cursorsToShow, cursor) >= 0;
        cursor.setVisible(cursorIsVisible);
        if (cursorIsVisible) {
          results.push(this.styleDisposables.add(this.modifyCursorStyle(cursor, this.getCursorStyle(cursor, true))));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    CursorStyleManager.prototype.modifyCursorStyle = function(cursor, cursorStyle) {
      var cursorNode;
      cursorStyle = this.getCursorStyle(cursor, true);
      cursorNode = this.editorElement.component.linesComponent.cursorsComponent.cursorNodesById[cursor.id];
      if (cursorNode) {
        cursorNode.style.setProperty('top', cursorStyle.top);
        cursorNode.style.setProperty('left', cursorStyle.left);
        return new Disposable(function() {
          var ref1, ref2;
          if ((ref1 = cursorNode.style) != null) {
            ref1.removeProperty('top');
          }
          return (ref2 = cursorNode.style) != null ? ref2.removeProperty('left') : void 0;
        });
      } else {
        return new Disposable;
      }
    };

    CursorStyleManager.prototype.updateCursorStyleNew = function() {
      var cursor, cursorsToShow, decoration, i, j, len, len1, ref1, ref2, results;
      ref1 = this.editor.getDecorations({
        type: 'cursor',
        "class": 'vim-mode-plus'
      });
      for (i = 0, len = ref1.length; i < len; i++) {
        decoration = ref1[i];
        decoration.destroy();
      }
      if (this.mode !== 'visual') {
        return;
      }
      if (this.submode === 'blockwise') {
        cursorsToShow = this.vimState.getBlockwiseSelections().map(function(bs) {
          return bs.getHeadSelection().cursor;
        });
      } else {
        cursorsToShow = this.editor.getCursors();
      }
      ref2 = this.editor.getCursors();
      results = [];
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        cursor = ref2[j];
        results.push(this.editor.decorateMarker(cursor.getMarker(), {
          type: 'cursor',
          "class": 'vim-mode-plus',
          style: this.getCursorStyle(cursor, indexOf.call(cursorsToShow, cursor) >= 0)
        }));
      }
      return results;
    };

    CursorStyleManager.prototype.refresh = function() {
      if (atom.inSpecMode()) {
        return;
      }
      this.lineHeight = this.editor.getLineHeightInPixels();
      if (SupportCursorSetVisible) {
        return this.updateCursorStyleOld();
      } else {
        return this.updateCursorStyleNew();
      }
    };

    CursorStyleManager.prototype.getCursorBufferPositionToDisplay = function(selection) {
      var bufferPosition, bufferPositionToDisplay, screenPosition;
      bufferPosition = this.vimState.swrap(selection).getBufferPositionFor('head', {
        from: ['property']
      });
      if (this.editor.hasAtomicSoftTabs() && !selection.isReversed()) {
        screenPosition = this.editor.screenPositionForBufferPosition(bufferPosition.translate([0, +1]), {
          clipDirection: 'forward'
        });
        bufferPositionToDisplay = this.editor.bufferPositionForScreenPosition(screenPosition).translate([0, -1]);
        if (bufferPositionToDisplay.isGreaterThan(bufferPosition)) {
          bufferPosition = bufferPositionToDisplay;
        }
      }
      return this.editor.clipBufferPosition(bufferPosition);
    };

    CursorStyleManager.prototype.getCursorStyle = function(cursor, visible) {
      var bufferPosition, column, ref1, ref2, row, screenPosition;
      if (visible) {
        bufferPosition = this.getCursorBufferPositionToDisplay(cursor.selection);
        if (this.submode === 'linewise' && (this.editor.isSoftWrapped() || this.editor.isFoldedAtBufferRow(bufferPosition.row))) {
          screenPosition = this.editor.screenPositionForBufferPosition(bufferPosition);
          ref1 = screenPosition.traversalFrom(cursor.getScreenPosition()), row = ref1.row, column = ref1.column;
        } else {
          ref2 = bufferPosition.traversalFrom(cursor.getBufferPosition()), row = ref2.row, column = ref2.column;
        }
        return {
          top: this.lineHeight * row + 'px',
          left: column + 'ch',
          visibility: 'visible'
        };
      } else {
        return {
          visibility: 'hidden'
        };
      }
    };

    return CursorStyleManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2N1cnNvci1zdHlsZS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsa0dBQUE7SUFBQTs7O0VBQUEsTUFBMkMsT0FBQSxDQUFRLE1BQVIsQ0FBM0MsRUFBQyxpQkFBRCxFQUFRLDJCQUFSLEVBQW9COztFQUNwQixRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0VBQ1gsdUJBQUEsR0FBMEI7O0VBSTFCLE1BQU0sQ0FBQyxPQUFQLEdBQ007aUNBQ0osVUFBQSxHQUFZOztJQUVaLFFBQVEsQ0FBQyxXQUFULENBQXFCLGtCQUFyQjs7SUFDQSxrQkFBQyxDQUFBLGlCQUFELENBQW1CLE1BQW5CLEVBQTJCLFNBQTNCLEVBQXNDO01BQUEsVUFBQSxFQUFZLFVBQVo7S0FBdEM7O0lBRWEsNEJBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDs7O01BQ1osT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLHFCQUFBLGFBQUYsRUFBaUIsSUFBQyxDQUFBLGNBQUE7O1FBQ2xCLDBCQUEyQjs7TUFDM0IsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJO01BQ25CLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsbUJBQXBCLEVBQXlDLElBQUMsQ0FBQSxPQUExQyxDQUFqQjtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsaUJBQXBCLEVBQXVDLElBQUMsQ0FBQSxPQUF4QyxDQUFqQjtNQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBeEI7SUFOVzs7aUNBUWIsT0FBQSxHQUFTLFNBQUE7QUFD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QyxjQUFBLEdBQWdCLFNBQUMsTUFBRCxFQUFTLE9BQVQ7QUFDZCxVQUFBO01BQUEsSUFBRyxPQUFIO1FBQ0UsY0FBQSxHQUFpQixJQUFDLENBQUEsZ0NBQUQsQ0FBa0MsTUFBTSxDQUFDLFNBQXpDO1FBQ2pCLElBQUcsSUFBQyxDQUFBLE9BQUQsS0FBWSxVQUFaLElBQTJCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsQ0FBQSxJQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLG1CQUFSLENBQTRCLGNBQWMsQ0FBQyxHQUEzQyxDQUE1QixDQUE5QjtVQUNFLGNBQUEsR0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQywrQkFBUixDQUF3QyxjQUF4QztVQUNqQixPQUFnQixjQUFjLENBQUMsYUFBZixDQUE2QixNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUE3QixDQUFoQixFQUFDLGNBQUQsRUFBTSxxQkFGUjtTQUFBLE1BQUE7VUFJRSxPQUFnQixjQUFjLENBQUMsYUFBZixDQUE2QixNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUE3QixDQUFoQixFQUFDLGNBQUQsRUFBTSxxQkFKUjs7QUFNQSxlQUFPO1VBQ0wsR0FBQSxFQUFLLElBQUMsQ0FBQSxVQUFELEdBQWMsR0FBZCxHQUFvQixJQURwQjtVQUVMLElBQUEsRUFBTSxNQUFBLEdBQVMsSUFGVjtVQUdMLFVBQUEsRUFBWSxTQUhQO1VBUlQ7T0FBQSxNQUFBO0FBY0UsZUFBTztVQUFDLFVBQUEsRUFBWSxRQUFiO1VBZFQ7O0lBRGM7Ozs7O0FBdEdsQiIsInNvdXJjZXNDb250ZW50IjpbIntQb2ludCwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuRGVsZWdhdG8gPSByZXF1aXJlICdkZWxlZ2F0bydcblN1cHBvcnRDdXJzb3JTZXRWaXNpYmxlID0gbnVsbFxuXG4jIERpc3BsYXkgY3Vyc29yIGluIHZpc3VhbC1tb2RlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEN1cnNvclN0eWxlTWFuYWdlclxuICBsaW5lSGVpZ2h0OiBudWxsXG5cbiAgRGVsZWdhdG8uaW5jbHVkZUludG8odGhpcylcbiAgQGRlbGVnYXRlc1Byb3BlcnR5KCdtb2RlJywgJ3N1Ym1vZGUnLCB0b1Byb3BlcnR5OiAndmltU3RhdGUnKVxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yRWxlbWVudCwgQGVkaXRvcn0gPSBAdmltU3RhdGVcbiAgICBTdXBwb3J0Q3Vyc29yU2V0VmlzaWJsZSA/PSBAZWRpdG9yLmdldExhc3RDdXJzb3IoKS5zZXRWaXNpYmxlP1xuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlKCdlZGl0b3IubGluZUhlaWdodCcsIEByZWZyZXNoKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSgnZWRpdG9yLmZvbnRTaXplJywgQHJlZnJlc2gpXG4gICAgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveSlcblxuICBkZXN0cm95OiA9PlxuICAgIEBzdHlsZURpc3Bvc2FibGVzPy5kaXNwb3NlKClcbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgdXBkYXRlQ3Vyc29yU3R5bGVPbGQ6IC0+XG4gICAgIyBXZSBtdXN0IGRpc3Bvc2UgcHJldmlvdXMgc3R5bGUgbW9kaWZpY2F0aW9uIGZvciBub24tdmlzdWFsLW1vZGVcbiAgICBAc3R5bGVEaXNwb3NhYmxlcz8uZGlzcG9zZSgpXG4gICAgQHN0eWxlRGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHJldHVybiB1bmxlc3MgQG1vZGUgaXMgJ3Zpc3VhbCdcblxuICAgIGlmIEBzdWJtb2RlIGlzICdibG9ja3dpc2UnXG4gICAgICBjdXJzb3JzVG9TaG93ID0gQHZpbVN0YXRlLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKS5tYXAgKGJzKSAtPiBicy5nZXRIZWFkU2VsZWN0aW9uKCkuY3Vyc29yXG4gICAgZWxzZVxuICAgICAgY3Vyc29yc1RvU2hvdyA9IEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG5cbiAgICAjIEluIHZpc3VhbC1tb2RlIG9yIGluIG9jY3VycmVuY2Ugb3BlcmF0aW9uLCBjdXJzb3IgYXJlIGFkZGVkIGR1cmluZyBvcGVyYXRpb24gYnV0IHNlbGVjdGlvbiBpcyBhZGRlZCBhc3luY2hyb25vdXNseS5cbiAgICAjIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgY29ycmVzcG9uZGluZyBjdXJzb3IncyBkb21Ob2RlIGlzIGF2YWlsYWJsZSBhdCB0aGlzIHBvaW50IHRvIGRpcmVjdGx5IG1vZGlmeSBpdCdzIHN0eWxlLlxuICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudC51cGRhdGVTeW5jKClcbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICBjdXJzb3JJc1Zpc2libGUgPSBjdXJzb3IgaW4gY3Vyc29yc1RvU2hvd1xuICAgICAgY3Vyc29yLnNldFZpc2libGUoY3Vyc29ySXNWaXNpYmxlKVxuICAgICAgaWYgY3Vyc29ySXNWaXNpYmxlXG4gICAgICAgIEBzdHlsZURpc3Bvc2FibGVzLmFkZCBAbW9kaWZ5Q3Vyc29yU3R5bGUoY3Vyc29yLCBAZ2V0Q3Vyc29yU3R5bGUoY3Vyc29yLCB0cnVlKSlcblxuICBtb2RpZnlDdXJzb3JTdHlsZTogKGN1cnNvciwgY3Vyc29yU3R5bGUpIC0+XG4gICAgY3Vyc29yU3R5bGUgPSBAZ2V0Q3Vyc29yU3R5bGUoY3Vyc29yLCB0cnVlKVxuICAgICMgW05PVEVdIFVzaW5nIG5vbi1wdWJsaWMgQVBJXG4gICAgY3Vyc29yTm9kZSA9IEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5saW5lc0NvbXBvbmVudC5jdXJzb3JzQ29tcG9uZW50LmN1cnNvck5vZGVzQnlJZFtjdXJzb3IuaWRdXG4gICAgaWYgY3Vyc29yTm9kZVxuICAgICAgY3Vyc29yTm9kZS5zdHlsZS5zZXRQcm9wZXJ0eSgndG9wJywgY3Vyc29yU3R5bGUudG9wKVxuICAgICAgY3Vyc29yTm9kZS5zdHlsZS5zZXRQcm9wZXJ0eSgnbGVmdCcsIGN1cnNvclN0eWxlLmxlZnQpXG4gICAgICBuZXcgRGlzcG9zYWJsZSAtPlxuICAgICAgICBjdXJzb3JOb2RlLnN0eWxlPy5yZW1vdmVQcm9wZXJ0eSgndG9wJylcbiAgICAgICAgY3Vyc29yTm9kZS5zdHlsZT8ucmVtb3ZlUHJvcGVydHkoJ2xlZnQnKVxuICAgIGVsc2VcbiAgICAgIG5ldyBEaXNwb3NhYmxlXG5cbiAgdXBkYXRlQ3Vyc29yU3R5bGVOZXc6IC0+XG4gICAgIyBXZSBtdXN0IGRpc3Bvc2UgcHJldmlvdXMgc3R5bGUgbW9kaWZpY2F0aW9uIGZvciBub24tdmlzdWFsLW1vZGVcbiAgICAjIEludGVudGlvbmFsbHkgY29sbGVjdCBhbGwgZGVjb3JhdGlvbnMgZnJvbSBlZGl0b3IgaW5zdGVhZCBvZiBtYW5hZ2luZ1xuICAgICMgZGVjb3JhdGlvbnMgd2UgY3JlYXRlZCBleHBsaWNpdGx5LlxuICAgICMgV2h5PyB3aGVuIGludGVyc2VjdGluZyBtdWx0aXBsZSBzZWxlY3Rpb25zIGFyZSBhdXRvLW1lcmdlZCwgaXQncyBnb3Qgd2lyZWRcbiAgICAjIHN0YXRlIHdoZXJlIGRlY29yYXRpb24gY2Fubm90IGJlIGRpc3Bvc2FibGUobm90IGludmVzdGlnYXRlZCB3ZWxsKS5cbiAgICAjIEFuZCBJIHdhbnQgdG8gYXNzdXJlIEFMTCBjdXJzb3Igc3R5bGUgbW9kaWZpY2F0aW9uIGRvbmUgYnkgdm1wIGlzIGNsZWFyZWQuXG4gICAgZm9yIGRlY29yYXRpb24gaW4gQGVkaXRvci5nZXREZWNvcmF0aW9ucyh0eXBlOiAnY3Vyc29yJywgY2xhc3M6ICd2aW0tbW9kZS1wbHVzJylcbiAgICAgIGRlY29yYXRpb24uZGVzdHJveSgpXG5cbiAgICByZXR1cm4gdW5sZXNzIEBtb2RlIGlzICd2aXN1YWwnXG5cbiAgICBpZiBAc3VibW9kZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgY3Vyc29yc1RvU2hvdyA9IEB2aW1TdGF0ZS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkubWFwIChicykgLT4gYnMuZ2V0SGVhZFNlbGVjdGlvbigpLmN1cnNvclxuICAgIGVsc2VcbiAgICAgIGN1cnNvcnNUb1Nob3cgPSBAZWRpdG9yLmdldEN1cnNvcnMoKVxuXG4gICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgQGVkaXRvci5kZWNvcmF0ZU1hcmtlciBjdXJzb3IuZ2V0TWFya2VyKCksXG4gICAgICAgIHR5cGU6ICdjdXJzb3InXG4gICAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cydcbiAgICAgICAgc3R5bGU6IEBnZXRDdXJzb3JTdHlsZShjdXJzb3IsIGN1cnNvciBpbiBjdXJzb3JzVG9TaG93KVxuXG4gIHJlZnJlc2g6ID0+XG4gICAgIyBJbnRlbnRpb25hbGx5IHNraXAgaW4gc3BlYyBtb2RlLCBzaW5jZSBub3QgYWxsIHNwZWMgaGF2ZSBET00gYXR0YWNoZWQoIGFuZCBkb24ndCB3YW50IHRvICkuXG4gICAgcmV0dXJuIGlmIGF0b20uaW5TcGVjTW9kZSgpXG5cbiAgICBAbGluZUhlaWdodCA9IEBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKClcblxuICAgIGlmIFN1cHBvcnRDdXJzb3JTZXRWaXNpYmxlXG4gICAgICBAdXBkYXRlQ3Vyc29yU3R5bGVPbGQoKVxuICAgIGVsc2VcbiAgICAgIEB1cGRhdGVDdXJzb3JTdHlsZU5ldygpXG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXk6IChzZWxlY3Rpb24pIC0+XG4gICAgYnVmZmVyUG9zaXRpb24gPSBAdmltU3RhdGUuc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknXSlcbiAgICBpZiBAZWRpdG9yLmhhc0F0b21pY1NvZnRUYWJzKCkgYW5kIG5vdCBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICBzY3JlZW5Qb3NpdGlvbiA9IEBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbi50cmFuc2xhdGUoWzAsICsxXSksIGNsaXBEaXJlY3Rpb246ICdmb3J3YXJkJylcbiAgICAgIGJ1ZmZlclBvc2l0aW9uVG9EaXNwbGF5ID0gQGVkaXRvci5idWZmZXJQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHNjcmVlblBvc2l0aW9uKS50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICAgIGlmIGJ1ZmZlclBvc2l0aW9uVG9EaXNwbGF5LmlzR3JlYXRlclRoYW4oYnVmZmVyUG9zaXRpb24pXG4gICAgICAgIGJ1ZmZlclBvc2l0aW9uID0gYnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXlcblxuICAgIEBlZGl0b3IuY2xpcEJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuXG4gIGdldEN1cnNvclN0eWxlOiAoY3Vyc29yLCB2aXNpYmxlKSAtPlxuICAgIGlmIHZpc2libGVcbiAgICAgIGJ1ZmZlclBvc2l0aW9uID0gQGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uVG9EaXNwbGF5KGN1cnNvci5zZWxlY3Rpb24pXG4gICAgICBpZiBAc3VibW9kZSBpcyAnbGluZXdpc2UnIGFuZCAoQGVkaXRvci5pc1NvZnRXcmFwcGVkKCkgb3IgQGVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KGJ1ZmZlclBvc2l0aW9uLnJvdykpXG4gICAgICAgIHNjcmVlblBvc2l0aW9uID0gQGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgICB7cm93LCBjb2x1bW59ID0gc2NyZWVuUG9zaXRpb24udHJhdmVyc2FsRnJvbShjdXJzb3IuZ2V0U2NyZWVuUG9zaXRpb24oKSlcbiAgICAgIGVsc2VcbiAgICAgICAge3JvdywgY29sdW1ufSA9IGJ1ZmZlclBvc2l0aW9uLnRyYXZlcnNhbEZyb20oY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRvcDogQGxpbmVIZWlnaHQgKiByb3cgKyAncHgnXG4gICAgICAgIGxlZnQ6IGNvbHVtbiArICdjaCdcbiAgICAgICAgdmlzaWJpbGl0eTogJ3Zpc2libGUnXG4gICAgICB9XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIHt2aXNpYmlsaXR5OiAnaGlkZGVuJ31cbiJdfQ==
