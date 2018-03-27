(function() {
  var CompositeDisposable, CursorStyleManager, Delegato, Disposable, Point, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Point = ref.Point, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Delegato = require('delegato');

  CursorStyleManager = (function() {
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

    CursorStyleManager.prototype.refresh = function() {
      var cursor, cursorNode, cursorNodesById, cursorsToShow, i, j, len, len1, ref1, ref2, results;
      if (atom.inSpecMode()) {
        return;
      }
      this.lineHeight = this.editor.getLineHeightInPixels();
      if ((ref1 = this.styleDisposables) != null) {
        ref1.dispose();
      }
      if (this.mode !== 'visual') {
        return;
      }
      this.styleDisposables = new CompositeDisposable;
      if (this.submode === 'blockwise') {
        cursorsToShow = this.vimState.getBlockwiseSelections().map(function(bs) {
          return bs.getHeadSelection().cursor;
        });
      } else {
        cursorsToShow = this.editor.getCursors();
      }
      ref2 = this.editor.getCursors();
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        cursor.setVisible(indexOf.call(cursorsToShow, cursor) >= 0);
      }
      this.editorElement.component.updateSync();
      cursorNodesById = this.editorElement.component.linesComponent.cursorsComponent.cursorNodesById;
      results = [];
      for (j = 0, len1 = cursorsToShow.length; j < len1; j++) {
        cursor = cursorsToShow[j];
        if (cursorNode = cursorNodesById[cursor.id]) {
          results.push(this.styleDisposables.add(this.modifyStyle(cursor, cursorNode)));
        }
      }
      return results;
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

    CursorStyleManager.prototype.modifyStyle = function(cursor, domNode) {
      var bufferPosition, column, ref1, ref2, row, screenPosition, selection, style;
      selection = cursor.selection;
      bufferPosition = this.getCursorBufferPositionToDisplay(selection);
      if (this.submode === 'linewise' && this.editor.isSoftWrapped()) {
        screenPosition = this.editor.screenPositionForBufferPosition(bufferPosition);
        ref1 = screenPosition.traversalFrom(cursor.getScreenPosition()), row = ref1.row, column = ref1.column;
      } else {
        ref2 = bufferPosition.traversalFrom(cursor.getBufferPosition()), row = ref2.row, column = ref2.column;
      }
      style = domNode.style;
      if (row) {
        style.setProperty('top', (this.lineHeight * row) + "px");
      }
      if (column) {
        style.setProperty('left', column + "ch");
      }
      return new Disposable(function() {
        style.removeProperty('top');
        return style.removeProperty('left');
      });
    };

    return CursorStyleManager;

  })();

  module.exports = CursorStyleManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2N1cnNvci1zdHlsZS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEseUVBQUE7SUFBQTs7O0VBQUEsTUFBMkMsT0FBQSxDQUFRLE1BQVIsQ0FBM0MsRUFBQyxpQkFBRCxFQUFRLDJCQUFSLEVBQW9COztFQUNwQixRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0VBSUw7aUNBQ0osVUFBQSxHQUFZOztJQUVaLFFBQVEsQ0FBQyxXQUFULENBQXFCLGtCQUFyQjs7SUFDQSxrQkFBQyxDQUFBLGlCQUFELENBQW1CLE1BQW5CLEVBQTJCLFNBQTNCLEVBQXNDO01BQUEsVUFBQSxFQUFZLFVBQVo7S0FBdEM7O0lBRWEsNEJBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDs7O01BQ1osT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLHFCQUFBLGFBQUYsRUFBaUIsSUFBQyxDQUFBLGNBQUE7TUFDbEIsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJO01BQ25CLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsbUJBQXBCLEVBQXlDLElBQUMsQ0FBQSxPQUExQyxDQUFqQjtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsaUJBQXBCLEVBQXVDLElBQUMsQ0FBQSxPQUF4QyxDQUFqQjtNQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBeEI7SUFMVzs7aUNBT2IsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBOztZQUFpQixDQUFFLE9BQW5CLENBQUE7O2FBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FB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QSxNQUFBO1FBSUUsT0FBZ0IsY0FBYyxDQUFDLGFBQWYsQ0FBNkIsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBN0IsQ0FBaEIsRUFBQyxjQUFELEVBQU0scUJBSlI7O01BTUEsS0FBQSxHQUFRLE9BQU8sQ0FBQztNQUNoQixJQUFzRCxHQUF0RDtRQUFBLEtBQUssQ0FBQyxXQUFOLENBQWtCLEtBQWxCLEVBQTJCLENBQUMsSUFBQyxDQUFBLFVBQUQsR0FBYyxHQUFmLENBQUEsR0FBbUIsSUFBOUMsRUFBQTs7TUFDQSxJQUE0QyxNQUE1QztRQUFBLEtBQUssQ0FBQyxXQUFOLENBQWtCLE1BQWxCLEVBQTZCLE1BQUQsR0FBUSxJQUFwQyxFQUFBOzthQUNJLElBQUEsVUFBQSxDQUFXLFNBQUE7UUFDYixLQUFLLENBQUMsY0FBTixDQUFxQixLQUFyQjtlQUNBLEtBQUssQ0FBQyxjQUFOLENBQXFCLE1BQXJCO01BRmEsQ0FBWDtJQWJPOzs7Ozs7RUFpQmYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE5RWpCIiwic291cmNlc0NvbnRlbnQiOlsie1BvaW50LCBEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5EZWxlZ2F0byA9IHJlcXVpcmUgJ2RlbGVnYXRvJ1xuXG4jIERpc3BsYXkgY3Vyc29yIGluIHZpc3VhbC1tb2RlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEN1cnNvclN0eWxlTWFuYWdlclxuICBsaW5lSGVpZ2h0OiBudWxsXG5cbiAgRGVsZWdhdG8uaW5jbHVkZUludG8odGhpcylcbiAgQGRlbGVnYXRlc1Byb3BlcnR5KCdtb2RlJywgJ3N1Ym1vZGUnLCB0b1Byb3BlcnR5OiAndmltU3RhdGUnKVxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yRWxlbWVudCwgQGVkaXRvcn0gPSBAdmltU3RhdGVcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSgnZWRpdG9yLmxpbmVIZWlnaHQnLCBAcmVmcmVzaClcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUoJ2VkaXRvci5mb250U2l6ZScsIEByZWZyZXNoKVxuICAgIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kpXG5cbiAgZGVzdHJveTogPT5cbiAgICBAc3R5bGVEaXNwb3NhYmxlcz8uZGlzcG9zZSgpXG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuXG4gIHJlZnJlc2g6ID0+XG4gICAgIyBJbnRlbnRpb25hbGx5IHNraXAgaW4gc3BlYyBtb2RlLCBzaW5jZSBub3QgYWxsIHNwZWMgaGF2ZSBET00gYXR0YWNoZWQoIGFuZCBkb24ndCB3YW50IHRvICkuXG4gICAgcmV0dXJuIGlmIGF0b20uaW5TcGVjTW9kZSgpXG4gICAgQGxpbmVIZWlnaHQgPSBAZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG5cbiAgICAjIFdlIG11c3QgZGlzcG9zZSBwcmV2aW91cyBzdHlsZSBtb2RpZmljYXRpb24gZm9yIG5vbi12aXN1YWwtbW9kZVxuICAgIEBzdHlsZURpc3Bvc2FibGVzPy5kaXNwb3NlKClcbiAgICByZXR1cm4gdW5sZXNzIEBtb2RlIGlzICd2aXN1YWwnXG5cbiAgICBAc3R5bGVEaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgaWYgQHN1Ym1vZGUgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIGN1cnNvcnNUb1Nob3cgPSBAdmltU3RhdGUuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpLm1hcCAoYnMpIC0+IGJzLmdldEhlYWRTZWxlY3Rpb24oKS5jdXJzb3JcbiAgICBlbHNlXG4gICAgICBjdXJzb3JzVG9TaG93ID0gQGVkaXRvci5nZXRDdXJzb3JzKClcblxuICAgICMgSW4gYmxvY2t3aXNlLCBzaG93IG9ubHkgYmxvY2t3aXNlLWhlYWQgY3Vyc29yXG4gICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgY3Vyc29yLnNldFZpc2libGUoY3Vyc29yIGluIGN1cnNvcnNUb1Nob3cpXG5cbiAgICAjIEZJWE1FOiBpbiBvY2N1cnJlbmNlLCBpbiB2QiwgbXVsdGktc2VsZWN0aW9ucyBhcmUgYWRkZWQgZHVyaW5nIG9wZXJhdGlvbiBidXQgc2VsZWN0aW9uIGlzIGFkZGVkIGFzeW5jaHJvbm91c2x5LlxuICAgICMgV2UgbmVlZCB0byBtYWtlIHN1cmUgdGhhdCBjb3JyZXNwb25kaW5nIGN1cnNvcidzIGRvbU5vZGUgaXMgYXZhaWxhYmxlIHRvIG1vZGlmeSBpdCdzIHN0eWxlLlxuICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudC51cGRhdGVTeW5jKClcblxuICAgICMgW05PVEVdIFVzaW5nIG5vbi1wdWJsaWMgQVBJXG4gICAgY3Vyc29yTm9kZXNCeUlkID0gQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LmxpbmVzQ29tcG9uZW50LmN1cnNvcnNDb21wb25lbnQuY3Vyc29yTm9kZXNCeUlkXG4gICAgZm9yIGN1cnNvciBpbiBjdXJzb3JzVG9TaG93IHdoZW4gY3Vyc29yTm9kZSA9IGN1cnNvck5vZGVzQnlJZFtjdXJzb3IuaWRdXG4gICAgICBAc3R5bGVEaXNwb3NhYmxlcy5hZGQgQG1vZGlmeVN0eWxlKGN1cnNvciwgY3Vyc29yTm9kZSlcblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvblRvRGlzcGxheTogKHNlbGVjdGlvbikgLT5cbiAgICBidWZmZXJQb3NpdGlvbiA9IEB2aW1TdGF0ZS5zd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eSddKVxuICAgIGlmIEBlZGl0b3IuaGFzQXRvbWljU29mdFRhYnMoKSBhbmQgbm90IHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIHNjcmVlblBvc2l0aW9uID0gQGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uLnRyYW5zbGF0ZShbMCwgKzFdKSwgY2xpcERpcmVjdGlvbjogJ2ZvcndhcmQnKVxuICAgICAgYnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXkgPSBAZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgICAgaWYgYnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXkuaXNHcmVhdGVyVGhhbihidWZmZXJQb3NpdGlvbilcbiAgICAgICAgYnVmZmVyUG9zaXRpb24gPSBidWZmZXJQb3NpdGlvblRvRGlzcGxheVxuXG4gICAgQGVkaXRvci5jbGlwQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG5cbiAgIyBBcHBseSBzZWxlY3Rpb24gcHJvcGVydHkncyB0cmF2ZXJzYWwgZnJvbSBhY3R1YWwgY3Vyc29yIHRvIGN1cnNvck5vZGUncyBzdHlsZVxuICBtb2RpZnlTdHlsZTogKGN1cnNvciwgZG9tTm9kZSkgLT5cbiAgICBzZWxlY3Rpb24gPSBjdXJzb3Iuc2VsZWN0aW9uXG4gICAgYnVmZmVyUG9zaXRpb24gPSBAZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXkoc2VsZWN0aW9uKVxuXG4gICAgaWYgQHN1Ym1vZGUgaXMgJ2xpbmV3aXNlJyBhbmQgQGVkaXRvci5pc1NvZnRXcmFwcGVkKClcbiAgICAgIHNjcmVlblBvc2l0aW9uID0gQGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuICAgICAge3JvdywgY29sdW1ufSA9IHNjcmVlblBvc2l0aW9uLnRyYXZlcnNhbEZyb20oY3Vyc29yLmdldFNjcmVlblBvc2l0aW9uKCkpXG4gICAgZWxzZVxuICAgICAge3JvdywgY29sdW1ufSA9IGJ1ZmZlclBvc2l0aW9uLnRyYXZlcnNhbEZyb20oY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgICBzdHlsZSA9IGRvbU5vZGUuc3R5bGVcbiAgICBzdHlsZS5zZXRQcm9wZXJ0eSgndG9wJywgXCIje0BsaW5lSGVpZ2h0ICogcm93fXB4XCIpIGlmIHJvd1xuICAgIHN0eWxlLnNldFByb3BlcnR5KCdsZWZ0JywgXCIje2NvbHVtbn1jaFwiKSBpZiBjb2x1bW5cbiAgICBuZXcgRGlzcG9zYWJsZSAtPlxuICAgICAgc3R5bGUucmVtb3ZlUHJvcGVydHkoJ3RvcCcpXG4gICAgICBzdHlsZS5yZW1vdmVQcm9wZXJ0eSgnbGVmdCcpXG5cbm1vZHVsZS5leHBvcnRzID0gQ3Vyc29yU3R5bGVNYW5hZ2VyXG4iXX0=
