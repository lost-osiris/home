(function() {
  var CompositeDisposable, CursorStyleManager, Delegato, Disposable, Point, ref, swrap,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Point = ref.Point, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Delegato = require('delegato');

  swrap = require('./selection-wrapper');

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
      ref1 = this.vimState, this.editorElement = ref1.editorElement, this.editor = ref1.editor;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('editor.lineHeight', this.refresh));
      this.subscriptions.add(atom.config.observe('editor.fontSize', this.refresh));
    }

    CursorStyleManager.prototype.destroy = function() {
      var ref1;
      if ((ref1 = this.styleDisposables) != null) {
        ref1.dispose();
      }
      return this.subscriptions.dispose();
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
      if (!(this.mode === 'visual' && this.vimState.getConfig('showCursorInVisualMode'))) {
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
      bufferPosition = swrap(selection).getBufferPositionFor('head', {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2N1cnNvci1zdHlsZS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZ0ZBQUE7SUFBQTs7O0VBQUEsTUFBMkMsT0FBQSxDQUFRLE1BQVIsQ0FBM0MsRUFBQyxpQkFBRCxFQUFRLDJCQUFSLEVBQW9COztFQUNwQixRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0VBQ1gsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFJRjtpQ0FDSixVQUFBLEdBQVk7O0lBRVosUUFBUSxDQUFDLFdBQVQsQ0FBcUIsa0JBQXJCOztJQUNBLGtCQUFDLENBQUEsaUJBQUQsQ0FBbUIsTUFBbkIsRUFBMkIsU0FBM0IsRUFBc0M7TUFBQSxVQUFBLEVBQVksVUFBWjtLQUF0Qzs7SUFFYSw0QkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEOztNQUNaLE9BQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxxQkFBQSxhQUFGLEVBQWlCLElBQUMsQ0FBQSxjQUFBO01BQ2xCLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixtQkFBcEIsRUFBeUMsSUFBQyxDQUFBLE9BQTFDLENBQW5CO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixpQkFBcEIsRUFBdUMsSUFBQyxDQUFBLE9BQXhDLENBQW5CO0lBSlc7O2lDQU1iLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTs7WUFBaUIsQ0FBRSxPQUFuQixDQUFBOzthQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO0lBRk87O2lD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QUMsY0FBRCxFQUFNLHFCQUZSO09BQUEsTUFBQTtRQUlFLE9BQWdCLGNBQWMsQ0FBQyxhQUFmLENBQTZCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQTdCLENBQWhCLEVBQUMsY0FBRCxFQUFNLHFCQUpSOztNQU1BLEtBQUEsR0FBUSxPQUFPLENBQUM7TUFDaEIsSUFBc0QsR0FBdEQ7UUFBQSxLQUFLLENBQUMsV0FBTixDQUFrQixLQUFsQixFQUEyQixDQUFDLElBQUMsQ0FBQSxVQUFELEdBQWMsR0FBZixDQUFBLEdBQW1CLElBQTlDLEVBQUE7O01BQ0EsSUFBNEMsTUFBNUM7UUFBQSxLQUFLLENBQUMsV0FBTixDQUFrQixNQUFsQixFQUE2QixNQUFELEdBQVEsSUFBcEMsRUFBQTs7YUFDSSxJQUFBLFVBQUEsQ0FBVyxTQUFBO1FBQ2IsS0FBSyxDQUFDLGNBQU4sQ0FBcUIsS0FBckI7ZUFDQSxLQUFLLENBQUMsY0FBTixDQUFxQixNQUFyQjtNQUZhLENBQVg7SUFiTzs7Ozs7O0VBaUJmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBOUVqQiIsInNvdXJjZXNDb250ZW50IjpbIntQb2ludCwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuRGVsZWdhdG8gPSByZXF1aXJlICdkZWxlZ2F0bydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcblxuIyBEaXNwbGF5IGN1cnNvciBpbiB2aXN1YWwtbW9kZVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBDdXJzb3JTdHlsZU1hbmFnZXJcbiAgbGluZUhlaWdodDogbnVsbFxuXG4gIERlbGVnYXRvLmluY2x1ZGVJbnRvKHRoaXMpXG4gIEBkZWxlZ2F0ZXNQcm9wZXJ0eSgnbW9kZScsICdzdWJtb2RlJywgdG9Qcm9wZXJ0eTogJ3ZpbVN0YXRlJylcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvckVsZW1lbnQsIEBlZGl0b3J9ID0gQHZpbVN0YXRlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlKCdlZGl0b3IubGluZUhlaWdodCcsIEByZWZyZXNoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlKCdlZGl0b3IuZm9udFNpemUnLCBAcmVmcmVzaClcblxuICBkZXN0cm95OiAtPlxuICAgIEBzdHlsZURpc3Bvc2FibGVzPy5kaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICByZWZyZXNoOiA9PlxuICAgICMgSW50ZW50aW9uYWxseSBza2lwIGluIHNwZWMgbW9kZSwgc2luY2Ugbm90IGFsbCBzcGVjIGhhdmUgRE9NIGF0dGFjaGVkKCBhbmQgZG9uJ3Qgd2FudCB0byApLlxuICAgIHJldHVybiBpZiBhdG9tLmluU3BlY01vZGUoKVxuICAgIEBsaW5lSGVpZ2h0ID0gQGVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKVxuXG4gICAgIyBXZSBtdXN0IGRpc3Bvc2UgcHJldmlvdXMgc3R5bGUgbW9kaWZpY2F0aW9uIGZvciBub24tdmlzdWFsLW1vZGVcbiAgICBAc3R5bGVEaXNwb3NhYmxlcz8uZGlzcG9zZSgpXG4gICAgcmV0dXJuIHVubGVzcyAoQG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIEB2aW1TdGF0ZS5nZXRDb25maWcoJ3Nob3dDdXJzb3JJblZpc3VhbE1vZGUnKSlcblxuICAgIEBzdHlsZURpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBpZiBAc3VibW9kZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgY3Vyc29yc1RvU2hvdyA9IEB2aW1TdGF0ZS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkubWFwIChicykgLT4gYnMuZ2V0SGVhZFNlbGVjdGlvbigpLmN1cnNvclxuICAgIGVsc2VcbiAgICAgIGN1cnNvcnNUb1Nob3cgPSBAZWRpdG9yLmdldEN1cnNvcnMoKVxuXG4gICAgIyBJbiBibG9ja3dpc2UsIHNob3cgb25seSBibG9ja3dpc2UtaGVhZCBjdXJzb3JcbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICBjdXJzb3Iuc2V0VmlzaWJsZShjdXJzb3IgaW4gY3Vyc29yc1RvU2hvdylcblxuICAgICMgRklYTUU6IGluIG9jY3VycmVuY2UsIGluIHZCLCBtdWx0aS1zZWxlY3Rpb25zIGFyZSBhZGRlZCBkdXJpbmcgb3BlcmF0aW9uIGJ1dCBzZWxlY3Rpb24gaXMgYWRkZWQgYXN5bmNocm9ub3VzbHkuXG4gICAgIyBXZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGNvcnJlc3BvbmRpbmcgY3Vyc29yJ3MgZG9tTm9kZSBpcyBhdmFpbGFibGUgdG8gbW9kaWZ5IGl0J3Mgc3R5bGUuXG4gICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnVwZGF0ZVN5bmMoKVxuXG4gICAgIyBbTk9URV0gVXNpbmcgbm9uLXB1YmxpYyBBUElcbiAgICBjdXJzb3JOb2Rlc0J5SWQgPSBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQubGluZXNDb21wb25lbnQuY3Vyc29yc0NvbXBvbmVudC5jdXJzb3JOb2Rlc0J5SWRcbiAgICBmb3IgY3Vyc29yIGluIGN1cnNvcnNUb1Nob3cgd2hlbiBjdXJzb3JOb2RlID0gY3Vyc29yTm9kZXNCeUlkW2N1cnNvci5pZF1cbiAgICAgIEBzdHlsZURpc3Bvc2FibGVzLmFkZCBAbW9kaWZ5U3R5bGUoY3Vyc29yLCBjdXJzb3JOb2RlKVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uVG9EaXNwbGF5OiAoc2VsZWN0aW9uKSAtPlxuICAgIGJ1ZmZlclBvc2l0aW9uID0gc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknXSlcbiAgICBpZiBAZWRpdG9yLmhhc0F0b21pY1NvZnRUYWJzKCkgYW5kIG5vdCBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICBzY3JlZW5Qb3NpdGlvbiA9IEBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbi50cmFuc2xhdGUoWzAsICsxXSksIGNsaXBEaXJlY3Rpb246ICdmb3J3YXJkJylcbiAgICAgIGJ1ZmZlclBvc2l0aW9uVG9EaXNwbGF5ID0gQGVkaXRvci5idWZmZXJQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHNjcmVlblBvc2l0aW9uKS50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICAgIGlmIGJ1ZmZlclBvc2l0aW9uVG9EaXNwbGF5LmlzR3JlYXRlclRoYW4oYnVmZmVyUG9zaXRpb24pXG4gICAgICAgIGJ1ZmZlclBvc2l0aW9uID0gYnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXlcblxuICAgIEBlZGl0b3IuY2xpcEJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuXG4gICMgQXBwbHkgc2VsZWN0aW9uIHByb3BlcnR5J3MgdHJhdmVyc2FsIGZyb20gYWN0dWFsIGN1cnNvciB0byBjdXJzb3JOb2RlJ3Mgc3R5bGVcbiAgbW9kaWZ5U3R5bGU6IChjdXJzb3IsIGRvbU5vZGUpIC0+XG4gICAgc2VsZWN0aW9uID0gY3Vyc29yLnNlbGVjdGlvblxuICAgIGJ1ZmZlclBvc2l0aW9uID0gQGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uVG9EaXNwbGF5KHNlbGVjdGlvbilcblxuICAgIGlmIEBzdWJtb2RlIGlzICdsaW5ld2lzZScgYW5kIEBlZGl0b3IuaXNTb2Z0V3JhcHBlZCgpXG4gICAgICBzY3JlZW5Qb3NpdGlvbiA9IEBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbilcbiAgICAgIHtyb3csIGNvbHVtbn0gPSBzY3JlZW5Qb3NpdGlvbi50cmF2ZXJzYWxGcm9tKGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKVxuICAgIGVsc2VcbiAgICAgIHtyb3csIGNvbHVtbn0gPSBidWZmZXJQb3NpdGlvbi50cmF2ZXJzYWxGcm9tKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuXG4gICAgc3R5bGUgPSBkb21Ob2RlLnN0eWxlXG4gICAgc3R5bGUuc2V0UHJvcGVydHkoJ3RvcCcsIFwiI3tAbGluZUhlaWdodCAqIHJvd31weFwiKSBpZiByb3dcbiAgICBzdHlsZS5zZXRQcm9wZXJ0eSgnbGVmdCcsIFwiI3tjb2x1bW59Y2hcIikgaWYgY29sdW1uXG4gICAgbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgIHN0eWxlLnJlbW92ZVByb3BlcnR5KCd0b3AnKVxuICAgICAgc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2xlZnQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEN1cnNvclN0eWxlTWFuYWdlclxuIl19
