(function() {
  var CompositeDisposable, Mutation, MutationManager, Point, getFirstCharacterPositionForBufferRow, getVimLastBufferRow, ref, ref1, swrap;

  ref = require('atom'), Point = ref.Point, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('./utils'), getFirstCharacterPositionForBufferRow = ref1.getFirstCharacterPositionForBufferRow, getVimLastBufferRow = ref1.getVimLastBufferRow;

  swrap = require('./selection-wrapper');

  module.exports = MutationManager = (function() {
    function MutationManager(vimState) {
      this.vimState = vimState;
      this.editor = this.vimState.editor;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.markerLayer = this.editor.addMarkerLayer();
      this.mutationsBySelection = new Map;
    }

    MutationManager.prototype.destroy = function() {
      var ref2;
      this.reset();
      return ref2 = {}, this.mutationsBySelection = ref2.mutationsBySelection, this.editor = ref2.editor, this.vimState = ref2.vimState, ref2;
    };

    MutationManager.prototype.init = function(arg) {
      this.stayByMarker = arg.stayByMarker;
      return this.reset();
    };

    MutationManager.prototype.reset = function() {
      this.markerLayer.clear();
      return this.mutationsBySelection.clear();
    };

    MutationManager.prototype.setCheckpoint = function(checkpoint) {
      var i, len, ref2, results, selection;
      ref2 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        results.push(this.setCheckpointForSelection(selection, checkpoint));
      }
      return results;
    };

    MutationManager.prototype.setCheckpointForSelection = function(selection, checkpoint) {
      var initialPoint, initialPointMarker, marker, options, resetMarker;
      if (this.mutationsBySelection.has(selection)) {
        resetMarker = !selection.getBufferRange().isEmpty();
      } else {
        resetMarker = true;
        initialPoint = swrap(selection).getBufferPositionFor('head', {
          from: ['property', 'selection']
        });
        if (this.stayByMarker) {
          initialPointMarker = this.markerLayer.markBufferPosition(initialPoint, {
            invalidate: 'never'
          });
        }
        options = {
          selection: selection,
          initialPoint: initialPoint,
          initialPointMarker: initialPointMarker,
          checkpoint: checkpoint
        };
        this.mutationsBySelection.set(selection, new Mutation(options));
      }
      if (resetMarker) {
        marker = this.markerLayer.markBufferRange(selection.getBufferRange(), {
          invalidate: 'never'
        });
      }
      return this.mutationsBySelection.get(selection).update(checkpoint, marker, this.vimState.mode);
    };

    MutationManager.prototype.migrateMutation = function(oldSelection, newSelection) {
      var mutation;
      mutation = this.mutationsBySelection.get(oldSelection);
      this.mutationsBySelection["delete"](oldSelection);
      mutation.selection = newSelection;
      return this.mutationsBySelection.set(newSelection, mutation);
    };

    MutationManager.prototype.getMutatedBufferRangeForSelection = function(selection) {
      if (this.mutationsBySelection.has(selection)) {
        return this.mutationsBySelection.get(selection).marker.getBufferRange();
      }
    };

    MutationManager.prototype.getSelectedBufferRangesForCheckpoint = function(checkpoint) {
      var ranges;
      ranges = [];
      this.mutationsBySelection.forEach(function(mutation) {
        var range;
        if (range = mutation.bufferRangeByCheckpoint[checkpoint]) {
          return ranges.push(range);
        }
      });
      return ranges;
    };

    MutationManager.prototype.restoreCursorPositions = function(arg) {
      var blockwiseSelection, head, i, j, k, len, len1, len2, mutation, point, ref2, ref3, ref4, ref5, results, results1, selection, setToFirstCharacterOnLinewise, stay, tail, wise;
      stay = arg.stay, wise = arg.wise, setToFirstCharacterOnLinewise = arg.setToFirstCharacterOnLinewise;
      if (wise === 'blockwise') {
        ref2 = this.vimState.getBlockwiseSelections();
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          blockwiseSelection = ref2[i];
          ref3 = blockwiseSelection.getProperties(), head = ref3.head, tail = ref3.tail;
          point = stay ? head : Point.min(head, tail);
          blockwiseSelection.setHeadBufferPosition(point);
          results.push(blockwiseSelection.skipNormalization());
        }
        return results;
      } else {
        ref4 = this.editor.getSelections();
        for (j = 0, len1 = ref4.length; j < len1; j++) {
          selection = ref4[j];
          if (mutation = this.mutationsBySelection.get(selection)) {
            if (mutation.createdAt !== 'will-select') {
              selection.destroy();
            }
          }
        }
        ref5 = this.editor.getSelections();
        results1 = [];
        for (k = 0, len2 = ref5.length; k < len2; k++) {
          selection = ref5[k];
          if (!(mutation = this.mutationsBySelection.get(selection))) {
            continue;
          }
          if (stay) {
            point = this.clipPoint(mutation.getStayPosition(wise));
          } else {
            point = this.clipPoint(mutation.startPositionOnDidSelect);
            if (setToFirstCharacterOnLinewise && wise === 'linewise') {
              point = getFirstCharacterPositionForBufferRow(this.editor, point.row);
            }
          }
          results1.push(selection.cursor.setBufferPosition(point));
        }
        return results1;
      }
    };

    MutationManager.prototype.clipPoint = function(point) {
      point.row = Math.min(getVimLastBufferRow(this.editor), point.row);
      return this.editor.clipBufferPosition(point);
    };

    return MutationManager;

  })();

  Mutation = (function() {
    function Mutation(options) {
      var checkpoint;
      this.selection = options.selection, this.initialPoint = options.initialPoint, this.initialPointMarker = options.initialPointMarker, checkpoint = options.checkpoint;
      this.createdAt = checkpoint;
      this.bufferRangeByCheckpoint = {};
      this.marker = null;
      this.startPositionOnDidSelect = null;
    }

    Mutation.prototype.update = function(checkpoint, marker, mode) {
      var from, ref2;
      if (marker != null) {
        if ((ref2 = this.marker) != null) {
          ref2.destroy();
        }
        this.marker = marker;
      }
      this.bufferRangeByCheckpoint[checkpoint] = this.marker.getBufferRange();
      if (checkpoint === 'did-select') {
        if (mode === 'visual' && !this.selection.isReversed()) {
          from = ['selection'];
        } else {
          from = ['property', 'selection'];
        }
        return this.startPositionOnDidSelect = swrap(this.selection).getBufferPositionFor('start', {
          from: from
        });
      }
    };

    Mutation.prototype.getStayPosition = function(wise) {
      var end, point, ref2, ref3, ref4, ref5, selectedRange, start;
      point = (ref2 = (ref3 = this.initialPointMarker) != null ? ref3.getHeadBufferPosition() : void 0) != null ? ref2 : this.initialPoint;
      selectedRange = (ref4 = this.bufferRangeByCheckpoint['did-select-occurrence']) != null ? ref4 : this.bufferRangeByCheckpoint['did-select'];
      if (selectedRange.isEqual(this.marker.getBufferRange())) {
        return point;
      } else {
        ref5 = this.marker.getBufferRange(), start = ref5.start, end = ref5.end;
        end = Point.max(start, end.translate([0, -1]));
        if (wise === 'linewise') {
          point.row = Math.min(end.row, point.row);
          return point;
        } else {
          return Point.min(end, point);
        }
      }
    };

    return Mutation;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL211dGF0aW9uLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUErQixPQUFBLENBQVEsTUFBUixDQUEvQixFQUFDLGlCQUFELEVBQVE7O0VBQ1IsT0FBK0QsT0FBQSxDQUFRLFNBQVIsQ0FBL0QsRUFBQyxrRkFBRCxFQUF3Qzs7RUFDeEMsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFFUixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MseUJBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxXQUFEO01BQ1gsSUFBQyxDQUFBLFNBQVUsSUFBQyxDQUFBLFNBQVg7TUFFRixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQXZCLENBQWpCO01BRUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQTtNQUNmLElBQUMsQ0FBQSxvQkFBRCxHQUF3QixJQUFJO0lBUGpCOzs4QkFTYixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBO2FBQ0EsT0FBOEMsRUFBOUMsRUFBQyxJQUFDLENBQUEsNEJBQUEsb0JBQUYsRUFBd0IsSUFBQyxDQUFBLGNBQUEsTUFBekIsRUFBaUMsSUFBQyxDQUFBLGdCQUFBLFFBQWxDLEVBQUE7SUFGTzs7OEJBSVQsSUFBQSxHQUFNLFNBQUMsR0FBRDtNQUFFLElBQUMsQ0FBQSxlQUFGLElBQUU7YUFDUCxJQUFDLENBQUEsS0FBRCxDQUFBO0lBREk7OzhCQUdOLEtBQUEsR0FBTyxTQUFBO01B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QUcsYUFBYSxDQUFDLE9BQWQsQ0FBc0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUEsQ0FBdEIsQ0FBSDtlQUNFLE1BREY7T0FBQSxNQUFBO1FBR0UsT0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQSxDQUFmLEVBQUMsa0JBQUQsRUFBUTtRQUNSLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBTixDQUFVLEtBQVYsRUFBaUIsR0FBRyxDQUFDLFNBQUosQ0FBYyxDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsQ0FBZCxDQUFqQjtRQUNOLElBQUcsSUFBQSxLQUFRLFVBQVg7VUFDRSxLQUFLLENBQUMsR0FBTixHQUFZLElBQUksQ0FBQyxHQUFMLENBQVMsR0FBRyxDQUFDLEdBQWIsRUFBa0IsS0FBSyxDQUFDLEdBQXhCO2lCQUNaLE1BRkY7U0FBQSxNQUFBO2lCQUlFLEtBQUssQ0FBQyxHQUFOLENBQVUsR0FBVixFQUFlLEtBQWYsRUFKRjtTQUxGOztJQUhlOzs7OztBQXZIbkIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UG9pbnQsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93LCBnZXRWaW1MYXN0QnVmZmVyUm93fSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIE11dGF0aW9uTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvcn0gPSBAdmltU3RhdGVcblxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG5cbiAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmFkZE1hcmtlckxheWVyKClcbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24gPSBuZXcgTWFwXG5cbiAgZGVzdHJveTogLT5cbiAgICBAcmVzZXQoKVxuICAgIHtAbXV0YXRpb25zQnlTZWxlY3Rpb24sIEBlZGl0b3IsIEB2aW1TdGF0ZX0gPSB7fVxuXG4gIGluaXQ6ICh7QHN0YXlCeU1hcmtlcn0pIC0+XG4gICAgQHJlc2V0KClcblxuICByZXNldDogLT5cbiAgICBAbWFya2VyTGF5ZXIuY2xlYXIoKVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5jbGVhcigpXG5cbiAgc2V0Q2hlY2twb2ludDogKGNoZWNrcG9pbnQpIC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgQHNldENoZWNrcG9pbnRGb3JTZWxlY3Rpb24oc2VsZWN0aW9uLCBjaGVja3BvaW50KVxuXG4gIHNldENoZWNrcG9pbnRGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24sIGNoZWNrcG9pbnQpIC0+XG4gICAgaWYgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pXG4gICAgICAjIEN1cnJlbnQgbm9uLWVtcHR5IHNlbGVjdGlvbiBpcyBwcmlvcml0aXplZCBvdmVyIGV4aXN0aW5nIG1hcmtlcidzIHJhbmdlLlxuICAgICAgIyBXZSBpbnZhbGlkYXRlIG9sZCBtYXJrZXIgdG8gcmUtdHJhY2sgZnJvbSBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICAgIHJlc2V0TWFya2VyID0gbm90IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmlzRW1wdHkoKVxuICAgIGVsc2VcbiAgICAgIHJlc2V0TWFya2VyID0gdHJ1ZVxuICAgICAgaW5pdGlhbFBvaW50ID0gc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknLCAnc2VsZWN0aW9uJ10pXG4gICAgICBpZiBAc3RheUJ5TWFya2VyXG4gICAgICAgIGluaXRpYWxQb2ludE1hcmtlciA9IEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUG9zaXRpb24oaW5pdGlhbFBvaW50LCBpbnZhbGlkYXRlOiAnbmV2ZXInKVxuXG4gICAgICBvcHRpb25zID0ge3NlbGVjdGlvbiwgaW5pdGlhbFBvaW50LCBpbml0aWFsUG9pbnRNYXJrZXIsIGNoZWNrcG9pbnR9XG4gICAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgbmV3IE11dGF0aW9uKG9wdGlvbnMpKVxuXG4gICAgaWYgcmVzZXRNYXJrZXJcbiAgICAgIG1hcmtlciA9IEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUmFuZ2Uoc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCksIGludmFsaWRhdGU6ICduZXZlcicpXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pLnVwZGF0ZShjaGVja3BvaW50LCBtYXJrZXIsIEB2aW1TdGF0ZS5tb2RlKVxuXG4gIG1pZ3JhdGVNdXRhdGlvbjogKG9sZFNlbGVjdGlvbiwgbmV3U2VsZWN0aW9uKSAtPlxuICAgIG11dGF0aW9uID0gQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChvbGRTZWxlY3Rpb24pXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmRlbGV0ZShvbGRTZWxlY3Rpb24pXG4gICAgbXV0YXRpb24uc2VsZWN0aW9uID0gbmV3U2VsZWN0aW9uXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLnNldChuZXdTZWxlY3Rpb24sIG11dGF0aW9uKVxuXG4gIGdldE11dGF0ZWRCdWZmZXJSYW5nZUZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBpZiBAbXV0YXRpb25zQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKS5tYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGdldFNlbGVjdGVkQnVmZmVyUmFuZ2VzRm9yQ2hlY2twb2ludDogKGNoZWNrcG9pbnQpIC0+XG4gICAgcmFuZ2VzID0gW11cbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZm9yRWFjaCAobXV0YXRpb24pIC0+XG4gICAgICBpZiByYW5nZSA9IG11dGF0aW9uLmJ1ZmZlclJhbmdlQnlDaGVja3BvaW50W2NoZWNrcG9pbnRdXG4gICAgICAgIHJhbmdlcy5wdXNoKHJhbmdlKVxuICAgIHJhbmdlc1xuXG4gIHJlc3RvcmVDdXJzb3JQb3NpdGlvbnM6ICh7c3RheSwgd2lzZSwgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2V9KSAtPlxuICAgIGlmIHdpc2UgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQHZpbVN0YXRlLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuICAgICAgICB7aGVhZCwgdGFpbH0gPSBibG9ja3dpc2VTZWxlY3Rpb24uZ2V0UHJvcGVydGllcygpXG4gICAgICAgIHBvaW50ID0gaWYgc3RheSB0aGVuIGhlYWQgZWxzZSBQb2ludC5taW4oaGVhZCwgdGFpbClcbiAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnNldEhlYWRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnNraXBOb3JtYWxpemF0aW9uKClcbiAgICBlbHNlXG4gICAgICAjIE1ha2Ugc3VyZSBkZXN0cm95aW5nIGFsbCB0ZW1wb3JhbCBzZWxlY3Rpb24gQkVGT1JFIHN0YXJ0aW5nIHRvIHNldCBjdXJzb3JzIHRvIGZpbmFsIHBvc2l0aW9uLlxuICAgICAgIyBUaGlzIGlzIGltcG9ydGFudCB0byBhdm9pZCBkZXN0cm95IG9yZGVyIGRlcGVuZGVudCBidWdzLlxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKSB3aGVuIG11dGF0aW9uID0gQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG4gICAgICAgIGlmIG11dGF0aW9uLmNyZWF0ZWRBdCBpc250ICd3aWxsLXNlbGVjdCdcbiAgICAgICAgICBzZWxlY3Rpb24uZGVzdHJveSgpXG5cbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkgd2hlbiBtdXRhdGlvbiA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgICBpZiBzdGF5XG4gICAgICAgICAgcG9pbnQgPSBAY2xpcFBvaW50KG11dGF0aW9uLmdldFN0YXlQb3NpdGlvbih3aXNlKSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHBvaW50ID0gQGNsaXBQb2ludChtdXRhdGlvbi5zdGFydFBvc2l0aW9uT25EaWRTZWxlY3QpXG4gICAgICAgICAgaWYgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2UgYW5kIHdpc2UgaXMgJ2xpbmV3aXNlJ1xuICAgICAgICAgICAgcG9pbnQgPSBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KEBlZGl0b3IsIHBvaW50LnJvdylcbiAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBjbGlwUG9pbnQ6IChwb2ludCkgLT5cbiAgICBwb2ludC5yb3cgPSBNYXRoLm1pbihnZXRWaW1MYXN0QnVmZmVyUm93KEBlZGl0b3IpLCBwb2ludC5yb3cpXG4gICAgQGVkaXRvci5jbGlwQnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiMgTXV0YXRpb24gaW5mb3JtYXRpb24gaXMgY3JlYXRlZCBldmVuIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcbiMgU28gdGhhdCB3ZSBjYW4gZmlsdGVyIHNlbGVjdGlvbiBieSB3aGVuIGl0IHdhcyBjcmVhdGVkLlxuIyAgZS5nLiBTb21lIHNlbGVjdGlvbiBpcyBjcmVhdGVkIGF0ICd3aWxsLXNlbGVjdCcgY2hlY2twb2ludCwgb3RoZXJzIGF0ICdkaWQtc2VsZWN0JyBvciAnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJ1xuY2xhc3MgTXV0YXRpb25cbiAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgIHtAc2VsZWN0aW9uLCBAaW5pdGlhbFBvaW50LCBAaW5pdGlhbFBvaW50TWFya2VyLCBjaGVja3BvaW50fSA9IG9wdGlvbnNcbiAgICBAY3JlYXRlZEF0ID0gY2hlY2twb2ludFxuICAgIEBidWZmZXJSYW5nZUJ5Q2hlY2twb2ludCA9IHt9XG4gICAgQG1hcmtlciA9IG51bGxcbiAgICBAc3RhcnRQb3NpdGlvbk9uRGlkU2VsZWN0ID0gbnVsbFxuXG4gIHVwZGF0ZTogKGNoZWNrcG9pbnQsIG1hcmtlciwgbW9kZSkgLT5cbiAgICBpZiBtYXJrZXI/XG4gICAgICBAbWFya2VyPy5kZXN0cm95KClcbiAgICAgIEBtYXJrZXIgPSBtYXJrZXJcbiAgICBAYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnRbY2hlY2twb2ludF0gPSBAbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcbiAgICAjIE5PVEU6IHN0dXBpZGx5IHJlc3BlY3QgcHVyZS1WaW0ncyBiZWhhdmlvciB3aGljaCBpcyBpbmNvbnNpc3RlbnQuXG4gICAgIyBNYXliZSBJJ2xsIHJlbW92ZSB0aGlzIGJsaW5kbHktZm9sbG93aW5nLXRvLXB1cmUtVmltIGNvZGUuXG4gICAgIyAgLSBgViBrIHlgOiBkb24ndCBtb3ZlIGN1cnNvclxuICAgICMgIC0gYFYgaiB5YDogbW92ZSBjdXJvciB0byBzdGFydCBvZiBzZWxlY3RlZCBsaW5lLihJbmNvbnNpc3RlbnQhKVxuICAgIGlmIGNoZWNrcG9pbnQgaXMgJ2RpZC1zZWxlY3QnXG4gICAgICBpZiAobW9kZSBpcyAndmlzdWFsJyBhbmQgbm90IEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpKVxuICAgICAgICBmcm9tID0gWydzZWxlY3Rpb24nXVxuICAgICAgZWxzZVxuICAgICAgICBmcm9tID0gWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXVxuICAgICAgQHN0YXJ0UG9zaXRpb25PbkRpZFNlbGVjdCA9IHN3cmFwKEBzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdzdGFydCcsIHtmcm9tfSlcblxuICBnZXRTdGF5UG9zaXRpb246ICh3aXNlKSAtPlxuICAgIHBvaW50ID0gQGluaXRpYWxQb2ludE1hcmtlcj8uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKCkgPyBAaW5pdGlhbFBvaW50XG4gICAgc2VsZWN0ZWRSYW5nZSA9IEBidWZmZXJSYW5nZUJ5Q2hlY2twb2ludFsnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJ10gPyBAYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnRbJ2RpZC1zZWxlY3QnXVxuICAgIGlmIHNlbGVjdGVkUmFuZ2UuaXNFcXVhbChAbWFya2VyLmdldEJ1ZmZlclJhbmdlKCkpICMgQ2hlY2sgaWYgbmVlZCBDbGlwXG4gICAgICBwb2ludFxuICAgIGVsc2VcbiAgICAgIHtzdGFydCwgZW5kfSA9IEBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgZW5kID0gUG9pbnQubWF4KHN0YXJ0LCBlbmQudHJhbnNsYXRlKFswLCAtMV0pKVxuICAgICAgaWYgd2lzZSBpcyAnbGluZXdpc2UnXG4gICAgICAgIHBvaW50LnJvdyA9IE1hdGgubWluKGVuZC5yb3csIHBvaW50LnJvdylcbiAgICAgICAgcG9pbnRcbiAgICAgIGVsc2VcbiAgICAgICAgUG9pbnQubWluKGVuZCwgcG9pbnQpXG4iXX0=
