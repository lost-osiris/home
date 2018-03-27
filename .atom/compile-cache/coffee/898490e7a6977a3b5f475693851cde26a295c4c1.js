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
        if (this.submode === 'linewise' && this.editor.isSoftWrapped()) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2N1cnNvci1zdHlsZS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsa0dBQUE7SUFBQTs7O0VBQUEsTUFBMkMsT0FBQSxDQUFRLE1BQVIsQ0FBM0MsRUFBQyxpQkFBRCxFQUFRLDJCQUFSLEVBQW9COztFQUNwQixRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0VBQ1gsdUJBQUEsR0FBMEI7O0VBSTFCLE1BQU0sQ0FBQyxPQUFQLEdBQ007aUNBQ0osVUFBQSxHQUFZOztJQUVaLFFBQVEsQ0FBQyxXQUFULENBQXFCLGtCQUFyQjs7SUFDQSxrQkFBQyxDQUFBLGlCQUFELENBQW1CLE1BQW5CLEVBQTJCLFNBQTNCLEVBQXNDO01BQUEsVUFBQSxFQUFZLFVBQVo7S0FBdEM7O0lBRWEsNEJBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDs7O01BQ1osT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLHFCQUFBLGFBQUYsRUFBaUIsSUFBQyxDQUFBLGNBQUE7O1FBQ2xCLDBCQUEyQjs7TUFDM0IsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJO01BQ25CLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsbUJBQXBCLEVBQXlDLElBQUMsQ0FBQSxPQUExQyxDQUFqQjtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsaUJBQXBCLEVBQXVDLElBQUMsQ0FBQSxPQUF4QyxDQUFqQjtNQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBeEI7SUFOVzs7aUNBUWIsT0FBQSxHQUFTLFNBQUE7QUFD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QyxjQUFBLEdBQWdCLFNBQUMsTUFBRCxFQUFTLE9BQVQ7QUFDZCxVQUFBO01BQUEsSUFBRyxPQUFIO1FBQ0UsY0FBQSxHQUFpQixJQUFDLENBQUEsZ0NBQUQsQ0FBa0MsTUFBTSxDQUFDLFNBQXpDO1FBQ2pCLElBQUcsSUFBQyxDQUFBLE9BQUQsS0FBWSxVQUFaLElBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBLENBQTlCO1VBQ0UsY0FBQSxHQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLCtCQUFSLENBQXdDLGNBQXhDO1VBQ2pCLE9BQWdCLGNBQWMsQ0FBQyxhQUFmLENBQTZCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQTdCLENBQWhCLEVBQUMsY0FBRCxFQUFNLHFCQUZSO1NBQUEsTUFBQTtVQUlFLE9BQWdCLGNBQWMsQ0FBQyxhQUFmLENBQTZCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQTdCLENBQWhCLEVBQUMsY0FBRCxFQUFNLHFCQUpSOztBQU1BLGVBQU87VUFDTCxHQUFBLEVBQUssSUFBQyxDQUFBLFVBQUQsR0FBYyxHQUFkLEdBQW9CLElBRHBCO1VBRUwsSUFBQSxFQUFNLE1BQUEsR0FBUyxJQUZWO1VBR0wsVUFBQSxFQUFZLFNBSFA7VUFSVDtPQUFBLE1BQUE7QUFjRSxlQUFPO1VBQUMsVUFBQSxFQUFZLFFBQWI7VUFkVDs7SUFEYzs7Ozs7QUF0R2xCIiwic291cmNlc0NvbnRlbnQiOlsie1BvaW50LCBEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5EZWxlZ2F0byA9IHJlcXVpcmUgJ2RlbGVnYXRvJ1xuU3VwcG9ydEN1cnNvclNldFZpc2libGUgPSBudWxsXG5cbiMgRGlzcGxheSBjdXJzb3IgaW4gdmlzdWFsLW1vZGVcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ3Vyc29yU3R5bGVNYW5hZ2VyXG4gIGxpbmVIZWlnaHQ6IG51bGxcblxuICBEZWxlZ2F0by5pbmNsdWRlSW50byh0aGlzKVxuICBAZGVsZWdhdGVzUHJvcGVydHkoJ21vZGUnLCAnc3VibW9kZScsIHRvUHJvcGVydHk6ICd2aW1TdGF0ZScpXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3JFbGVtZW50LCBAZWRpdG9yfSA9IEB2aW1TdGF0ZVxuICAgIFN1cHBvcnRDdXJzb3JTZXRWaXNpYmxlID89IEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLnNldFZpc2libGU/XG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUoJ2VkaXRvci5saW5lSGVpZ2h0JywgQHJlZnJlc2gpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlKCdlZGl0b3IuZm9udFNpemUnLCBAcmVmcmVzaClcbiAgICBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95KVxuXG4gIGRlc3Ryb3k6ID0+XG4gICAgQHN0eWxlRGlzcG9zYWJsZXM/LmRpc3Bvc2UoKVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICB1cGRhdGVDdXJzb3JTdHlsZU9sZDogLT5cbiAgICAjIFdlIG11c3QgZGlzcG9zZSBwcmV2aW91cyBzdHlsZSBtb2RpZmljYXRpb24gZm9yIG5vbi12aXN1YWwtbW9kZVxuICAgIEBzdHlsZURpc3Bvc2FibGVzPy5kaXNwb3NlKClcbiAgICBAc3R5bGVEaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgcmV0dXJuIHVubGVzcyBAbW9kZSBpcyAndmlzdWFsJ1xuXG4gICAgaWYgQHN1Ym1vZGUgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIGN1cnNvcnNUb1Nob3cgPSBAdmltU3RhdGUuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpLm1hcCAoYnMpIC0+IGJzLmdldEhlYWRTZWxlY3Rpb24oKS5jdXJzb3JcbiAgICBlbHNlXG4gICAgICBjdXJzb3JzVG9TaG93ID0gQGVkaXRvci5nZXRDdXJzb3JzKClcblxuICAgICMgSW4gdmlzdWFsLW1vZGUgb3IgaW4gb2NjdXJyZW5jZSBvcGVyYXRpb24sIGN1cnNvciBhcmUgYWRkZWQgZHVyaW5nIG9wZXJhdGlvbiBidXQgc2VsZWN0aW9uIGlzIGFkZGVkIGFzeW5jaHJvbm91c2x5LlxuICAgICMgV2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCBjb3JyZXNwb25kaW5nIGN1cnNvcidzIGRvbU5vZGUgaXMgYXZhaWxhYmxlIGF0IHRoaXMgcG9pbnQgdG8gZGlyZWN0bHkgbW9kaWZ5IGl0J3Mgc3R5bGUuXG4gICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnVwZGF0ZVN5bmMoKVxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICAgIGN1cnNvcklzVmlzaWJsZSA9IGN1cnNvciBpbiBjdXJzb3JzVG9TaG93XG4gICAgICBjdXJzb3Iuc2V0VmlzaWJsZShjdXJzb3JJc1Zpc2libGUpXG4gICAgICBpZiBjdXJzb3JJc1Zpc2libGVcbiAgICAgICAgQHN0eWxlRGlzcG9zYWJsZXMuYWRkIEBtb2RpZnlDdXJzb3JTdHlsZShjdXJzb3IsIEBnZXRDdXJzb3JTdHlsZShjdXJzb3IsIHRydWUpKVxuXG4gIG1vZGlmeUN1cnNvclN0eWxlOiAoY3Vyc29yLCBjdXJzb3JTdHlsZSkgLT5cbiAgICBjdXJzb3JTdHlsZSA9IEBnZXRDdXJzb3JTdHlsZShjdXJzb3IsIHRydWUpXG4gICAgIyBbTk9URV0gVXNpbmcgbm9uLXB1YmxpYyBBUElcbiAgICBjdXJzb3JOb2RlID0gQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LmxpbmVzQ29tcG9uZW50LmN1cnNvcnNDb21wb25lbnQuY3Vyc29yTm9kZXNCeUlkW2N1cnNvci5pZF1cbiAgICBpZiBjdXJzb3JOb2RlXG4gICAgICBjdXJzb3JOb2RlLnN0eWxlLnNldFByb3BlcnR5KCd0b3AnLCBjdXJzb3JTdHlsZS50b3ApXG4gICAgICBjdXJzb3JOb2RlLnN0eWxlLnNldFByb3BlcnR5KCdsZWZ0JywgY3Vyc29yU3R5bGUubGVmdClcbiAgICAgIG5ldyBEaXNwb3NhYmxlIC0+XG4gICAgICAgIGN1cnNvck5vZGUuc3R5bGU/LnJlbW92ZVByb3BlcnR5KCd0b3AnKVxuICAgICAgICBjdXJzb3JOb2RlLnN0eWxlPy5yZW1vdmVQcm9wZXJ0eSgnbGVmdCcpXG4gICAgZWxzZVxuICAgICAgbmV3IERpc3Bvc2FibGVcblxuICB1cGRhdGVDdXJzb3JTdHlsZU5ldzogLT5cbiAgICAjIFdlIG11c3QgZGlzcG9zZSBwcmV2aW91cyBzdHlsZSBtb2RpZmljYXRpb24gZm9yIG5vbi12aXN1YWwtbW9kZVxuICAgICMgSW50ZW50aW9uYWxseSBjb2xsZWN0IGFsbCBkZWNvcmF0aW9ucyBmcm9tIGVkaXRvciBpbnN0ZWFkIG9mIG1hbmFnaW5nXG4gICAgIyBkZWNvcmF0aW9ucyB3ZSBjcmVhdGVkIGV4cGxpY2l0bHkuXG4gICAgIyBXaHk/IHdoZW4gaW50ZXJzZWN0aW5nIG11bHRpcGxlIHNlbGVjdGlvbnMgYXJlIGF1dG8tbWVyZ2VkLCBpdCdzIGdvdCB3aXJlZFxuICAgICMgc3RhdGUgd2hlcmUgZGVjb3JhdGlvbiBjYW5ub3QgYmUgZGlzcG9zYWJsZShub3QgaW52ZXN0aWdhdGVkIHdlbGwpLlxuICAgICMgQW5kIEkgd2FudCB0byBhc3N1cmUgQUxMIGN1cnNvciBzdHlsZSBtb2RpZmljYXRpb24gZG9uZSBieSB2bXAgaXMgY2xlYXJlZC5cbiAgICBmb3IgZGVjb3JhdGlvbiBpbiBAZWRpdG9yLmdldERlY29yYXRpb25zKHR5cGU6ICdjdXJzb3InLCBjbGFzczogJ3ZpbS1tb2RlLXBsdXMnKVxuICAgICAgZGVjb3JhdGlvbi5kZXN0cm95KClcblxuICAgIHJldHVybiB1bmxlc3MgQG1vZGUgaXMgJ3Zpc3VhbCdcblxuICAgIGlmIEBzdWJtb2RlIGlzICdibG9ja3dpc2UnXG4gICAgICBjdXJzb3JzVG9TaG93ID0gQHZpbVN0YXRlLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKS5tYXAgKGJzKSAtPiBicy5nZXRIZWFkU2VsZWN0aW9uKCkuY3Vyc29yXG4gICAgZWxzZVxuICAgICAgY3Vyc29yc1RvU2hvdyA9IEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICBAZWRpdG9yLmRlY29yYXRlTWFya2VyIGN1cnNvci5nZXRNYXJrZXIoKSxcbiAgICAgICAgdHlwZTogJ2N1cnNvcidcbiAgICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzJ1xuICAgICAgICBzdHlsZTogQGdldEN1cnNvclN0eWxlKGN1cnNvciwgY3Vyc29yIGluIGN1cnNvcnNUb1Nob3cpXG5cbiAgcmVmcmVzaDogPT5cbiAgICAjIEludGVudGlvbmFsbHkgc2tpcCBpbiBzcGVjIG1vZGUsIHNpbmNlIG5vdCBhbGwgc3BlYyBoYXZlIERPTSBhdHRhY2hlZCggYW5kIGRvbid0IHdhbnQgdG8gKS5cbiAgICByZXR1cm4gaWYgYXRvbS5pblNwZWNNb2RlKClcblxuICAgIEBsaW5lSGVpZ2h0ID0gQGVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKVxuXG4gICAgaWYgU3VwcG9ydEN1cnNvclNldFZpc2libGVcbiAgICAgIEB1cGRhdGVDdXJzb3JTdHlsZU9sZCgpXG4gICAgZWxzZVxuICAgICAgQHVwZGF0ZUN1cnNvclN0eWxlTmV3KClcblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvblRvRGlzcGxheTogKHNlbGVjdGlvbikgLT5cbiAgICBidWZmZXJQb3NpdGlvbiA9IEB2aW1TdGF0ZS5zd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eSddKVxuICAgIGlmIEBlZGl0b3IuaGFzQXRvbWljU29mdFRhYnMoKSBhbmQgbm90IHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIHNjcmVlblBvc2l0aW9uID0gQGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uLnRyYW5zbGF0ZShbMCwgKzFdKSwgY2xpcERpcmVjdGlvbjogJ2ZvcndhcmQnKVxuICAgICAgYnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXkgPSBAZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgICAgaWYgYnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXkuaXNHcmVhdGVyVGhhbihidWZmZXJQb3NpdGlvbilcbiAgICAgICAgYnVmZmVyUG9zaXRpb24gPSBidWZmZXJQb3NpdGlvblRvRGlzcGxheVxuXG4gICAgQGVkaXRvci5jbGlwQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG5cbiAgZ2V0Q3Vyc29yU3R5bGU6IChjdXJzb3IsIHZpc2libGUpIC0+XG4gICAgaWYgdmlzaWJsZVxuICAgICAgYnVmZmVyUG9zaXRpb24gPSBAZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXkoY3Vyc29yLnNlbGVjdGlvbilcbiAgICAgIGlmIEBzdWJtb2RlIGlzICdsaW5ld2lzZScgYW5kIEBlZGl0b3IuaXNTb2Z0V3JhcHBlZCgpXG4gICAgICAgIHNjcmVlblBvc2l0aW9uID0gQGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgICB7cm93LCBjb2x1bW59ID0gc2NyZWVuUG9zaXRpb24udHJhdmVyc2FsRnJvbShjdXJzb3IuZ2V0U2NyZWVuUG9zaXRpb24oKSlcbiAgICAgIGVsc2VcbiAgICAgICAge3JvdywgY29sdW1ufSA9IGJ1ZmZlclBvc2l0aW9uLnRyYXZlcnNhbEZyb20oY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRvcDogQGxpbmVIZWlnaHQgKiByb3cgKyAncHgnXG4gICAgICAgIGxlZnQ6IGNvbHVtbiArICdjaCdcbiAgICAgICAgdmlzaWJpbGl0eTogJ3Zpc2libGUnXG4gICAgICB9XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIHt2aXNpYmlsaXR5OiAnaGlkZGVuJ31cbiJdfQ==
