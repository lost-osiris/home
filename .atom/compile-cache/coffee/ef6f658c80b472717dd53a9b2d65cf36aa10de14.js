(function() {
  var Mutation, MutationManager, Point,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Point = require('atom').Point;

  module.exports = MutationManager = (function() {
    function MutationManager(vimState) {
      var ref;
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      ref = this.vimState, this.editor = ref.editor, this.swrap = ref.swrap;
      this.vimState.onDidDestroy(this.destroy);
      this.markerLayer = this.editor.addMarkerLayer();
      this.mutationsBySelection = new Map;
    }

    MutationManager.prototype.destroy = function() {
      this.markerLayer.destroy();
      return this.mutationsBySelection.clear();
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
      var i, len, ref, results, selection;
      ref = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        selection = ref[i];
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
        initialPoint = this.swrap(selection).getBufferPositionFor('head', {
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
          checkpoint: checkpoint,
          swrap: this.swrap
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
      var blockwiseSelection, head, i, j, k, len, len1, len2, mutation, point, ref, ref1, ref2, ref3, results, results1, selection, setToFirstCharacterOnLinewise, stay, tail, wise;
      stay = arg.stay, wise = arg.wise, setToFirstCharacterOnLinewise = arg.setToFirstCharacterOnLinewise;
      if (wise === 'blockwise') {
        ref = this.vimState.getBlockwiseSelections();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          blockwiseSelection = ref[i];
          ref1 = blockwiseSelection.getProperties(), head = ref1.head, tail = ref1.tail;
          point = stay ? head : Point.min(head, tail);
          blockwiseSelection.setHeadBufferPosition(point);
          results.push(blockwiseSelection.skipNormalization());
        }
        return results;
      } else {
        ref2 = this.editor.getSelections();
        for (j = 0, len1 = ref2.length; j < len1; j++) {
          selection = ref2[j];
          if (mutation = this.mutationsBySelection.get(selection)) {
            if (mutation.createdAt !== 'will-select') {
              selection.destroy();
            }
          }
        }
        ref3 = this.editor.getSelections();
        results1 = [];
        for (k = 0, len2 = ref3.length; k < len2; k++) {
          selection = ref3[k];
          if (!(mutation = this.mutationsBySelection.get(selection))) {
            continue;
          }
          if (stay) {
            point = this.clipPoint(mutation.getStayPosition(wise));
          } else {
            point = this.clipPoint(mutation.startPositionOnDidSelect);
            if (setToFirstCharacterOnLinewise && wise === 'linewise') {
              point = this.vimState.utils.getFirstCharacterPositionForBufferRow(this.editor, point.row);
            }
          }
          results1.push(selection.cursor.setBufferPosition(point));
        }
        return results1;
      }
    };

    MutationManager.prototype.clipPoint = function(point) {
      point.row = Math.min(this.vimState.utils.getVimLastBufferRow(this.editor), point.row);
      return this.editor.clipBufferPosition(point);
    };

    return MutationManager;

  })();

  Mutation = (function() {
    function Mutation(options) {
      var checkpoint;
      this.selection = options.selection, this.initialPoint = options.initialPoint, this.initialPointMarker = options.initialPointMarker, checkpoint = options.checkpoint, this.swrap = options.swrap;
      this.createdAt = checkpoint;
      this.bufferRangeByCheckpoint = {};
      this.marker = null;
      this.startPositionOnDidSelect = null;
    }

    Mutation.prototype.update = function(checkpoint, marker, mode) {
      var from, ref;
      if (marker != null) {
        if ((ref = this.marker) != null) {
          ref.destroy();
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
        return this.startPositionOnDidSelect = this.swrap(this.selection).getBufferPositionFor('start', {
          from: from
        });
      }
    };

    Mutation.prototype.getStayPosition = function(wise) {
      var end, point, ref, ref1, ref2, ref3, selectedRange, start;
      point = (ref = (ref1 = this.initialPointMarker) != null ? ref1.getHeadBufferPosition() : void 0) != null ? ref : this.initialPoint;
      selectedRange = (ref2 = this.bufferRangeByCheckpoint['did-select-occurrence']) != null ? ref2 : this.bufferRangeByCheckpoint['did-select'];
      if (selectedRange.isEqual(this.marker.getBufferRange())) {
        return point;
      } else {
        ref3 = this.marker.getBufferRange(), start = ref3.start, end = ref3.end;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL211dGF0aW9uLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnQ0FBQTtJQUFBOztFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVI7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHlCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7O01BQ1osTUFBb0IsSUFBQyxDQUFBLFFBQXJCLEVBQUMsSUFBQyxDQUFBLGFBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxZQUFBO01BQ1gsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUF4QjtNQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUE7TUFDZixJQUFDLENBQUEsb0JBQUQsR0FBd0IsSUFBSTtJQUxqQjs7OEJBT2IsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTthQUNBLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxLQUF0QixDQUFBO0lBRk87OzhCQUlULElBQUEsR0FBTSxTQUFDLEdBQUQ7TUFBRSxJQUFDLENBQUEsZUFBRixJQUFFO2FBQ1AsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQURJOzs4QkFHTixLQUFBLEdBQU8sU0FBQTtNQUNMLElBQUMsQ0FBQSxXQUFXLENBQUMsS0FBYixDQUFBO2FBQ0EsSUFBQyxDQUFBLG9CQUFvQixDQUFDLEtBQXRCLENBQUE7SUFGSzs7OEJBSVAsYUFBQSxHQUFlLFNBQUMsVUFBRDtBQUNiLFVBQUE7QUFBQTtBQUFBO1dBQUEscUNBQUE7O3FCQUNFLElBQUMsQ0FBQSx5QkFBRCxDQUEyQixTQUEzQixFQUFzQyxVQUF0QztBQURGOztJQURhOzs4QkFJZix5QkFBQSxH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RSxNQURGO09BQUEsTUFBQTtRQUdFLE9BQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUEsQ0FBZixFQUFDLGtCQUFELEVBQVE7UUFDUixHQUFBLEdBQU0sS0FBSyxDQUFDLEdBQU4sQ0FBVSxLQUFWLEVBQWlCLEdBQUcsQ0FBQyxTQUFKLENBQWMsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFMLENBQWQsQ0FBakI7UUFDTixJQUFHLElBQUEsS0FBUSxVQUFYO1VBQ0UsS0FBSyxDQUFDLEdBQU4sR0FBWSxJQUFJLENBQUMsR0FBTCxDQUFTLEdBQUcsQ0FBQyxHQUFiLEVBQWtCLEtBQUssQ0FBQyxHQUF4QjtpQkFDWixNQUZGO1NBQUEsTUFBQTtpQkFJRSxLQUFLLENBQUMsR0FBTixDQUFVLEdBQVYsRUFBZSxLQUFmLEVBSkY7U0FMRjs7SUFIZTs7Ozs7QUFuSG5CIiwic291cmNlc0NvbnRlbnQiOlsie1BvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIE11dGF0aW9uTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQHN3cmFwfSA9IEB2aW1TdGF0ZVxuICAgIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kpXG5cbiAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmFkZE1hcmtlckxheWVyKClcbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24gPSBuZXcgTWFwXG5cbiAgZGVzdHJveTogPT5cbiAgICBAbWFya2VyTGF5ZXIuZGVzdHJveSgpXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmNsZWFyKClcblxuICBpbml0OiAoe0BzdGF5QnlNYXJrZXJ9KSAtPlxuICAgIEByZXNldCgpXG5cbiAgcmVzZXQ6IC0+XG4gICAgQG1hcmtlckxheWVyLmNsZWFyKClcbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uY2xlYXIoKVxuXG4gIHNldENoZWNrcG9pbnQ6IChjaGVja3BvaW50KSAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIEBzZXRDaGVja3BvaW50Rm9yU2VsZWN0aW9uKHNlbGVjdGlvbiwgY2hlY2twb2ludClcblxuICBzZXRDaGVja3BvaW50Rm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uLCBjaGVja3BvaW50KSAtPlxuICAgIGlmIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKVxuICAgICAgIyBDdXJyZW50IG5vbi1lbXB0eSBzZWxlY3Rpb24gaXMgcHJpb3JpdGl6ZWQgb3ZlciBleGlzdGluZyBtYXJrZXIncyByYW5nZS5cbiAgICAgICMgV2UgaW52YWxpZGF0ZSBvbGQgbWFya2VyIHRvIHJlLXRyYWNrIGZyb20gY3VycmVudCBzZWxlY3Rpb24uXG4gICAgICByZXNldE1hcmtlciA9IG5vdCBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5pc0VtcHR5KClcbiAgICBlbHNlXG4gICAgICByZXNldE1hcmtlciA9IHRydWVcbiAgICAgIGluaXRpYWxQb2ludCA9IEBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXSlcbiAgICAgIGlmIEBzdGF5QnlNYXJrZXJcbiAgICAgICAgaW5pdGlhbFBvaW50TWFya2VyID0gQG1hcmtlckxheWVyLm1hcmtCdWZmZXJQb3NpdGlvbihpbml0aWFsUG9pbnQsIGludmFsaWRhdGU6ICduZXZlcicpXG5cbiAgICAgIG9wdGlvbnMgPSB7c2VsZWN0aW9uLCBpbml0aWFsUG9pbnQsIGluaXRpYWxQb2ludE1hcmtlciwgY2hlY2twb2ludCwgQHN3cmFwfVxuICAgICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIG5ldyBNdXRhdGlvbihvcHRpb25zKSlcblxuICAgIGlmIHJlc2V0TWFya2VyXG4gICAgICBtYXJrZXIgPSBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclJhbmdlKHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLCBpbnZhbGlkYXRlOiAnbmV2ZXInKVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKS51cGRhdGUoY2hlY2twb2ludCwgbWFya2VyLCBAdmltU3RhdGUubW9kZSlcblxuICBtaWdyYXRlTXV0YXRpb246IChvbGRTZWxlY3Rpb24sIG5ld1NlbGVjdGlvbikgLT5cbiAgICBtdXRhdGlvbiA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQob2xkU2VsZWN0aW9uKVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5kZWxldGUob2xkU2VsZWN0aW9uKVxuICAgIG11dGF0aW9uLnNlbGVjdGlvbiA9IG5ld1NlbGVjdGlvblxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5zZXQobmV3U2VsZWN0aW9uLCBtdXRhdGlvbilcblxuICBnZXRNdXRhdGVkQnVmZmVyUmFuZ2VGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgaWYgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pXG4gICAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbikubWFya2VyLmdldEJ1ZmZlclJhbmdlKClcblxuICBnZXRTZWxlY3RlZEJ1ZmZlclJhbmdlc0ZvckNoZWNrcG9pbnQ6IChjaGVja3BvaW50KSAtPlxuICAgIHJhbmdlcyA9IFtdXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmZvckVhY2ggKG11dGF0aW9uKSAtPlxuICAgICAgaWYgcmFuZ2UgPSBtdXRhdGlvbi5idWZmZXJSYW5nZUJ5Q2hlY2twb2ludFtjaGVja3BvaW50XVxuICAgICAgICByYW5nZXMucHVzaChyYW5nZSlcbiAgICByYW5nZXNcblxuICByZXN0b3JlQ3Vyc29yUG9zaXRpb25zOiAoe3N0YXksIHdpc2UsIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlfSkgLT5cbiAgICBpZiB3aXNlIGlzICdibG9ja3dpc2UnXG4gICAgICBmb3IgYmxvY2t3aXNlU2VsZWN0aW9uIGluIEB2aW1TdGF0ZS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKClcbiAgICAgICAge2hlYWQsIHRhaWx9ID0gYmxvY2t3aXNlU2VsZWN0aW9uLmdldFByb3BlcnRpZXMoKVxuICAgICAgICBwb2ludCA9IGlmIHN0YXkgdGhlbiBoZWFkIGVsc2UgUG9pbnQubWluKGhlYWQsIHRhaWwpXG4gICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5zZXRIZWFkQnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5za2lwTm9ybWFsaXphdGlvbigpXG4gICAgZWxzZVxuICAgICAgIyBNYWtlIHN1cmUgZGVzdHJveWluZyBhbGwgdGVtcG9yYWwgc2VsZWN0aW9uIEJFRk9SRSBzdGFydGluZyB0byBzZXQgY3Vyc29ycyB0byBmaW5hbCBwb3NpdGlvbi5cbiAgICAgICMgVGhpcyBpcyBpbXBvcnRhbnQgdG8gYXZvaWQgZGVzdHJveSBvcmRlciBkZXBlbmRlbnQgYnVncy5cbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkgd2hlbiBtdXRhdGlvbiA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgICBpZiBtdXRhdGlvbi5jcmVhdGVkQXQgaXNudCAnd2lsbC1zZWxlY3QnXG4gICAgICAgICAgc2VsZWN0aW9uLmRlc3Ryb3koKVxuXG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpIHdoZW4gbXV0YXRpb24gPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgICAgaWYgc3RheVxuICAgICAgICAgIHBvaW50ID0gQGNsaXBQb2ludChtdXRhdGlvbi5nZXRTdGF5UG9zaXRpb24od2lzZSkpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBwb2ludCA9IEBjbGlwUG9pbnQobXV0YXRpb24uc3RhcnRQb3NpdGlvbk9uRGlkU2VsZWN0KVxuICAgICAgICAgIGlmIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlIGFuZCB3aXNlIGlzICdsaW5ld2lzZSdcbiAgICAgICAgICAgIHBvaW50ID0gQHZpbVN0YXRlLnV0aWxzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coQGVkaXRvciwgcG9pbnQucm93KVxuICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIGNsaXBQb2ludDogKHBvaW50KSAtPlxuICAgIHBvaW50LnJvdyA9IE1hdGgubWluKEB2aW1TdGF0ZS51dGlscy5nZXRWaW1MYXN0QnVmZmVyUm93KEBlZGl0b3IpLCBwb2ludC5yb3cpXG4gICAgQGVkaXRvci5jbGlwQnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiMgTXV0YXRpb24gaW5mb3JtYXRpb24gaXMgY3JlYXRlZCBldmVuIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcbiMgU28gdGhhdCB3ZSBjYW4gZmlsdGVyIHNlbGVjdGlvbiBieSB3aGVuIGl0IHdhcyBjcmVhdGVkLlxuIyAgZS5nLiBTb21lIHNlbGVjdGlvbiBpcyBjcmVhdGVkIGF0ICd3aWxsLXNlbGVjdCcgY2hlY2twb2ludCwgb3RoZXJzIGF0ICdkaWQtc2VsZWN0JyBvciAnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJ1xuY2xhc3MgTXV0YXRpb25cbiAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgIHtAc2VsZWN0aW9uLCBAaW5pdGlhbFBvaW50LCBAaW5pdGlhbFBvaW50TWFya2VyLCBjaGVja3BvaW50LCBAc3dyYXB9ID0gb3B0aW9uc1xuICAgIEBjcmVhdGVkQXQgPSBjaGVja3BvaW50XG4gICAgQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50ID0ge31cbiAgICBAbWFya2VyID0gbnVsbFxuICAgIEBzdGFydFBvc2l0aW9uT25EaWRTZWxlY3QgPSBudWxsXG5cbiAgdXBkYXRlOiAoY2hlY2twb2ludCwgbWFya2VyLCBtb2RlKSAtPlxuICAgIGlmIG1hcmtlcj9cbiAgICAgIEBtYXJrZXI/LmRlc3Ryb3koKVxuICAgICAgQG1hcmtlciA9IG1hcmtlclxuICAgIEBidWZmZXJSYW5nZUJ5Q2hlY2twb2ludFtjaGVja3BvaW50XSA9IEBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICMgTk9URTogc3R1cGlkbHkgcmVzcGVjdCBwdXJlLVZpbSdzIGJlaGF2aW9yIHdoaWNoIGlzIGluY29uc2lzdGVudC5cbiAgICAjIE1heWJlIEknbGwgcmVtb3ZlIHRoaXMgYmxpbmRseS1mb2xsb3dpbmctdG8tcHVyZS1WaW0gY29kZS5cbiAgICAjICAtIGBWIGsgeWA6IGRvbid0IG1vdmUgY3Vyc29yXG4gICAgIyAgLSBgViBqIHlgOiBtb3ZlIGN1cm9yIHRvIHN0YXJ0IG9mIHNlbGVjdGVkIGxpbmUuKEluY29uc2lzdGVudCEpXG4gICAgaWYgY2hlY2twb2ludCBpcyAnZGlkLXNlbGVjdCdcbiAgICAgIGlmIChtb2RlIGlzICd2aXN1YWwnIGFuZCBub3QgQHNlbGVjdGlvbi5pc1JldmVyc2VkKCkpXG4gICAgICAgIGZyb20gPSBbJ3NlbGVjdGlvbiddXG4gICAgICBlbHNlXG4gICAgICAgIGZyb20gPSBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddXG4gICAgICBAc3RhcnRQb3NpdGlvbk9uRGlkU2VsZWN0ID0gQHN3cmFwKEBzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdzdGFydCcsIHtmcm9tfSlcblxuICBnZXRTdGF5UG9zaXRpb246ICh3aXNlKSAtPlxuICAgIHBvaW50ID0gQGluaXRpYWxQb2ludE1hcmtlcj8uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKCkgPyBAaW5pdGlhbFBvaW50XG4gICAgc2VsZWN0ZWRSYW5nZSA9IEBidWZmZXJSYW5nZUJ5Q2hlY2twb2ludFsnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJ10gPyBAYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnRbJ2RpZC1zZWxlY3QnXVxuICAgIGlmIHNlbGVjdGVkUmFuZ2UuaXNFcXVhbChAbWFya2VyLmdldEJ1ZmZlclJhbmdlKCkpICMgQ2hlY2sgaWYgbmVlZCBDbGlwXG4gICAgICBwb2ludFxuICAgIGVsc2VcbiAgICAgIHtzdGFydCwgZW5kfSA9IEBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgZW5kID0gUG9pbnQubWF4KHN0YXJ0LCBlbmQudHJhbnNsYXRlKFswLCAtMV0pKVxuICAgICAgaWYgd2lzZSBpcyAnbGluZXdpc2UnXG4gICAgICAgIHBvaW50LnJvdyA9IE1hdGgubWluKGVuZC5yb3csIHBvaW50LnJvdylcbiAgICAgICAgcG9pbnRcbiAgICAgIGVsc2VcbiAgICAgICAgUG9pbnQubWluKGVuZCwgcG9pbnQpXG4iXX0=
