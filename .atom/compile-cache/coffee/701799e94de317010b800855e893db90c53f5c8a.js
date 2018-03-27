(function() {
  var CompositeDisposable, Mutation, MutationManager, Point, getFirstCharacterPositionForBufferRow, getValidVimBufferRow, ref, ref1, swrap;

  ref = require('atom'), Point = ref.Point, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('./utils'), getFirstCharacterPositionForBufferRow = ref1.getFirstCharacterPositionForBufferRow, getValidVimBufferRow = ref1.getValidVimBufferRow;

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
      var initialPoint, options;
      if (this.mutationsBySelection.has(selection)) {
        return this.mutationsBySelection.get(selection).update(checkpoint);
      } else {
        initialPoint = swrap(selection).getBufferPositionFor('head', {
          from: ['property', 'selection']
        });
        options = {
          selection: selection,
          initialPoint: initialPoint,
          checkpoint: checkpoint,
          markerLayer: this.markerLayer,
          stayByMarker: this.stayByMarker,
          vimState: this.vimState
        };
        return this.mutationsBySelection.set(selection, new Mutation(options));
      }
    };

    MutationManager.prototype.getMutatedBufferRange = function(selection) {
      var marker, ref2;
      if (marker = (ref2 = this.getMutationForSelection(selection)) != null ? ref2.marker : void 0) {
        return marker.getBufferRange();
      }
    };

    MutationManager.prototype.getMutationForSelection = function(selection) {
      return this.mutationsBySelection.get(selection);
    };

    MutationManager.prototype.getBufferRangesForCheckpoint = function(checkpoint) {
      var ranges;
      ranges = [];
      this.mutationsBySelection.forEach(function(mutation) {
        var range;
        if (range = mutation.getBufferRangeForCheckpoint(checkpoint)) {
          return ranges.push(range);
        }
      });
      return ranges;
    };

    MutationManager.prototype.restoreCursorPositions = function(options) {
      var blockwiseSelection, head, i, j, len, len1, mutation, occurrenceSelected, point, ref2, ref3, ref4, results, results1, selection, setToFirstCharacterOnLinewise, stay, tail, wise;
      stay = options.stay, wise = options.wise, occurrenceSelected = options.occurrenceSelected, setToFirstCharacterOnLinewise = options.setToFirstCharacterOnLinewise;
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
        results1 = [];
        for (j = 0, len1 = ref4.length; j < len1; j++) {
          selection = ref4[j];
          if (!(mutation = this.mutationsBySelection.get(selection))) {
            continue;
          }
          if (occurrenceSelected && !mutation.isCreatedAt('will-select')) {
            selection.destroy();
          }
          if (occurrenceSelected && stay) {
            point = this.clipToMutationEndIfSomeMutationContainsPoint(this.vimState.getOriginalCursorPosition());
            results1.push(selection.cursor.setBufferPosition(point));
          } else if (point = mutation.getRestorePoint({
            stay: stay,
            wise: wise
          })) {
            if ((!stay) && setToFirstCharacterOnLinewise && (wise === 'linewise')) {
              point = getFirstCharacterPositionForBufferRow(this.editor, point.row);
            }
            results1.push(selection.cursor.setBufferPosition(point));
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }
    };

    MutationManager.prototype.clipToMutationEndIfSomeMutationContainsPoint = function(point) {
      var mutation;
      if (mutation = this.findMutationContainsPointAtCheckpoint(point, 'did-select-occurrence')) {
        return Point.min(mutation.getEndBufferPosition(), point);
      } else {
        return point;
      }
    };

    MutationManager.prototype.findMutationContainsPointAtCheckpoint = function(point, checkpoint) {
      var entry, iterator, mutation;
      iterator = this.mutationsBySelection.values();
      while ((entry = iterator.next()) && !entry.done) {
        mutation = entry.value;
        if (mutation.getBufferRangeForCheckpoint(checkpoint).containsPoint(point)) {
          return mutation;
        }
      }
    };

    return MutationManager;

  })();

  Mutation = (function() {
    function Mutation(options) {
      var checkpoint;
      this.selection = options.selection, this.initialPoint = options.initialPoint, checkpoint = options.checkpoint, this.markerLayer = options.markerLayer, this.stayByMarker = options.stayByMarker, this.vimState = options.vimState;
      this.createdAt = checkpoint;
      if (this.stayByMarker) {
        this.initialPointMarker = this.markerLayer.markBufferPosition(this.initialPoint, {
          invalidate: 'never'
        });
      }
      this.bufferRangeByCheckpoint = {};
      this.marker = null;
      this.update(checkpoint);
    }

    Mutation.prototype.isCreatedAt = function(timing) {
      return this.createdAt === timing;
    };

    Mutation.prototype.update = function(checkpoint) {
      var ref2;
      if (!this.selection.getBufferRange().isEmpty()) {
        if ((ref2 = this.marker) != null) {
          ref2.destroy();
        }
        this.marker = null;
      }
      if (this.marker == null) {
        this.marker = this.markerLayer.markBufferRange(this.selection.getBufferRange(), {
          invalidate: 'never'
        });
      }
      return this.bufferRangeByCheckpoint[checkpoint] = this.marker.getBufferRange();
    };

    Mutation.prototype.getStartBufferPosition = function() {
      return this.marker.getBufferRange().start;
    };

    Mutation.prototype.getEndBufferPosition = function() {
      var end, point, ref2, start;
      ref2 = this.marker.getBufferRange(), start = ref2.start, end = ref2.end;
      point = Point.max(start, end.translate([0, -1]));
      return this.selection.editor.clipBufferPosition(point);
    };

    Mutation.prototype.getInitialPoint = function(arg) {
      var clip, point, ref2, ref3, ref4, ref5, wise;
      ref2 = arg != null ? arg : {}, clip = ref2.clip, wise = ref2.wise;
      point = (ref3 = (ref4 = this.initialPointMarker) != null ? ref4.getHeadBufferPosition() : void 0) != null ? ref3 : this.initialPoint;
      if (clip == null) {
        clip = !((ref5 = this.getBufferRangeForCheckpoint('did-select')) != null ? ref5.isEqual(this.marker.getBufferRange()) : void 0);
      }
      if (clip) {
        if (wise === 'linewise') {
          return Point.min([this.getEndBufferPosition().row, point.column], point);
        } else {
          return Point.min(this.getEndBufferPosition(), point);
        }
      } else {
        return point;
      }
    };

    Mutation.prototype.getBufferRangeForCheckpoint = function(checkpoint) {
      return this.bufferRangeByCheckpoint[checkpoint];
    };

    Mutation.prototype.getRestorePoint = function(arg) {
      var mode, point, ref2, ref3, ref4, stay, submode, wise;
      ref2 = arg != null ? arg : {}, stay = ref2.stay, wise = ref2.wise;
      if (stay) {
        point = this.getInitialPoint({
          wise: wise
        });
      } else {
        ref3 = this.vimState, mode = ref3.mode, submode = ref3.submode;
        if ((mode !== 'visual') || (submode === 'linewise' && this.selection.isReversed())) {
          point = swrap(this.selection).getBufferPositionFor('start', {
            from: ['property']
          });
        }
        point = point != null ? point : (ref4 = this.bufferRangeByCheckpoint['did-select']) != null ? ref4.start : void 0;
      }
      if (point != null) {
        point.row = getValidVimBufferRow(this.selection.editor, point.row);
      }
      return point;
    };

    return Mutation;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL211dGF0aW9uLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUErQixPQUFBLENBQVEsTUFBUixDQUEvQixFQUFDLGlCQUFELEVBQVE7O0VBQ1IsT0FBZ0UsT0FBQSxDQUFRLFNBQVIsQ0FBaEUsRUFBQyxrRkFBRCxFQUF3Qzs7RUFDeEMsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFhUixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MseUJBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxXQUFEO01BQ1gsSUFBQyxDQUFBLFNBQVUsSUFBQyxDQUFBLFNBQVg7TUFFRixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQXZCLENBQWpCO01BRUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQTtNQUNmLElBQUMsQ0FBQSxvQkFBRCxHQUF3QixJQUFJO0lBUGpCOzs4QkFTYixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBO2FBQ0EsT0FBOEMsRUFBOUMsRUFBQyxJQUFDLENBQUEsNEJBQUEsb0JBQUYsRUFBd0IsSUFBQyxDQUFBLGNBQUEsTUFBekIsRUFBaUMsSUFBQyxDQUFBLGdCQUFBLFFBQWxDLEVBQUE7SUFGTzs7OEJBSVQsSUFBQSxHQUFNLFNBQUMsR0FBRDtNQUFFLElBQUMsQ0FBQSxlQUFGLElBQUU7YUFDUCxJQUFDLENBQUEsS0FBRCxDQUFBO0lBREk7OzhCQUdOLEtBQUEsR0FBTyxTQUFBO01B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UUFBbkIsRUFBQyxnQkFBRCxFQUFPO1FBQ1AsSUFBRyxDQUFDLElBQUEsS0FBVSxRQUFYLENBQUEsSUFBd0IsQ0FBQyxPQUFBLEtBQVcsVUFBWCxJQUEwQixJQUFDLENBQUEsU0FBUyxDQUFDLFVBQVgsQ0FBQSxDQUEzQixDQUEzQjtVQUNFLEtBQUEsR0FBUSxLQUFBLENBQU0sSUFBQyxDQUFBLFNBQVAsQ0FBaUIsQ0FBQyxvQkFBbEIsQ0FBdUMsT0FBdkMsRUFBZ0Q7WUFBQSxJQUFBLEVBQU0sQ0FBQyxVQUFELENBQU47V0FBaEQsRUFEVjs7UUFFQSxLQUFBLG1CQUFRLDBFQUE4QyxDQUFFLGVBTjFEOztNQVFBLElBQUcsYUFBSDtRQUNFLEtBQUssQ0FBQyxHQUFOLEdBQVksb0JBQUEsQ0FBcUIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFoQyxFQUF3QyxLQUFLLENBQUMsR0FBOUMsRUFEZDs7YUFFQTtJQVhlOzs7OztBQXBKbkIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UG9pbnQsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93LCBnZXRWYWxpZFZpbUJ1ZmZlclJvd30gPSByZXF1aXJlICcuL3V0aWxzJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuXG4jIGtlZXAgbXV0YXRpb24gc25hcHNob3QgbmVjZXNzYXJ5IGZvciBPcGVyYXRvciBwcm9jZXNzaW5nLlxuIyBtdXRhdGlvbiBzdG9yZWQgYnkgZWFjaCBTZWxlY3Rpb24gaGF2ZSBmb2xsb3dpbmcgZmllbGRcbiMgIG1hcmtlcjpcbiMgICAgbWFya2VyIHRvIHRyYWNrIG11dGF0aW9uLiBtYXJrZXIgaXMgY3JlYXRlZCB3aGVuIGBzZXRDaGVja3BvaW50YFxuIyAgY3JlYXRlZEF0OlxuIyAgICAnc3RyaW5nJyByZXByZXNlbnRpbmcgd2hlbiBtYXJrZXIgd2FzIGNyZWF0ZWQuXG4jICBjaGVja3BvaW50OiB7fVxuIyAgICBrZXkgaXMgWyd3aWxsLXNlbGVjdCcsICdkaWQtc2VsZWN0JywgJ3dpbGwtbXV0YXRlJywgJ2RpZC1tdXRhdGUnXVxuIyAgICBrZXkgaXMgY2hlY2twb2ludCwgdmFsdWUgaXMgYnVmZmVyUmFuZ2UgZm9yIG1hcmtlciBhdCB0aGF0IGNoZWNrcG9pbnRcbiMgIHNlbGVjdGlvbjpcbiMgICAgU2VsZWN0aW9uIGJlZWluZyB0cmFja2VkXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBNdXRhdGlvbk1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3J9ID0gQHZpbVN0YXRlXG5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gICAgQG1hcmtlckxheWVyID0gQGVkaXRvci5hZGRNYXJrZXJMYXllcigpXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uID0gbmV3IE1hcFxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHJlc2V0KClcbiAgICB7QG11dGF0aW9uc0J5U2VsZWN0aW9uLCBAZWRpdG9yLCBAdmltU3RhdGV9ID0ge31cblxuICBpbml0OiAoe0BzdGF5QnlNYXJrZXJ9KSAtPlxuICAgIEByZXNldCgpXG5cbiAgcmVzZXQ6IC0+XG4gICAgQG1hcmtlckxheWVyLmNsZWFyKClcbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uY2xlYXIoKVxuXG4gIHNldENoZWNrcG9pbnQ6IChjaGVja3BvaW50KSAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIEBzZXRDaGVja3BvaW50Rm9yU2VsZWN0aW9uKHNlbGVjdGlvbiwgY2hlY2twb2ludClcblxuICBzZXRDaGVja3BvaW50Rm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uLCBjaGVja3BvaW50KSAtPlxuICAgIGlmIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKVxuICAgICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pLnVwZGF0ZShjaGVja3BvaW50KVxuICAgIGVsc2VcbiAgICAgIGluaXRpYWxQb2ludCA9IHN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddKVxuICAgICAgb3B0aW9ucyA9IHtzZWxlY3Rpb24sIGluaXRpYWxQb2ludCwgY2hlY2twb2ludCwgQG1hcmtlckxheWVyLCBAc3RheUJ5TWFya2VyLCBAdmltU3RhdGV9XG4gICAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgbmV3IE11dGF0aW9uKG9wdGlvbnMpKVxuXG4gIGdldE11dGF0ZWRCdWZmZXJSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBpZiBtYXJrZXIgPSBAZ2V0TXV0YXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKT8ubWFya2VyXG4gICAgICBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGdldE11dGF0aW9uRm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuXG4gIGdldEJ1ZmZlclJhbmdlc0ZvckNoZWNrcG9pbnQ6IChjaGVja3BvaW50KSAtPlxuICAgIHJhbmdlcyA9IFtdXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmZvckVhY2ggKG11dGF0aW9uKSAtPlxuICAgICAgaWYgcmFuZ2UgPSBtdXRhdGlvbi5nZXRCdWZmZXJSYW5nZUZvckNoZWNrcG9pbnQoY2hlY2twb2ludClcbiAgICAgICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gICAgcmFuZ2VzXG5cbiAgcmVzdG9yZUN1cnNvclBvc2l0aW9uczogKG9wdGlvbnMpIC0+XG4gICAge3N0YXksIHdpc2UsIG9jY3VycmVuY2VTZWxlY3RlZCwgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2V9ID0gb3B0aW9uc1xuICAgIGlmIHdpc2UgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQHZpbVN0YXRlLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuICAgICAgICB7aGVhZCwgdGFpbH0gPSBibG9ja3dpc2VTZWxlY3Rpb24uZ2V0UHJvcGVydGllcygpXG4gICAgICAgIHBvaW50ID0gaWYgc3RheSB0aGVuIGhlYWQgZWxzZSBQb2ludC5taW4oaGVhZCwgdGFpbClcbiAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnNldEhlYWRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnNraXBOb3JtYWxpemF0aW9uKClcbiAgICBlbHNlXG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpIHdoZW4gbXV0YXRpb24gPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgICAgaWYgb2NjdXJyZW5jZVNlbGVjdGVkIGFuZCBub3QgbXV0YXRpb24uaXNDcmVhdGVkQXQoJ3dpbGwtc2VsZWN0JylcbiAgICAgICAgICBzZWxlY3Rpb24uZGVzdHJveSgpXG5cbiAgICAgICAgaWYgb2NjdXJyZW5jZVNlbGVjdGVkIGFuZCBzdGF5XG4gICAgICAgICAgIyBUaGlzIGlzIGVzc2VuY2lhbGx5IHRvIGNsaXBUb011dGF0aW9uRW5kIHdoZW4gYGQgbyBmYCwgYGQgbyBwYCBjYXNlLlxuICAgICAgICAgIHBvaW50ID0gQGNsaXBUb011dGF0aW9uRW5kSWZTb21lTXV0YXRpb25Db250YWluc1BvaW50KEB2aW1TdGF0ZS5nZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uKCkpXG4gICAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgICAgZWxzZSBpZiBwb2ludCA9IG11dGF0aW9uLmdldFJlc3RvcmVQb2ludCh7c3RheSwgd2lzZX0pXG4gICAgICAgICAgaWYgKG5vdCBzdGF5KSBhbmQgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2UgYW5kICh3aXNlIGlzICdsaW5ld2lzZScpXG4gICAgICAgICAgICBwb2ludCA9IGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coQGVkaXRvciwgcG9pbnQucm93KVxuICAgICAgICAgIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgY2xpcFRvTXV0YXRpb25FbmRJZlNvbWVNdXRhdGlvbkNvbnRhaW5zUG9pbnQ6IChwb2ludCkgLT5cbiAgICBpZiBtdXRhdGlvbiA9IEBmaW5kTXV0YXRpb25Db250YWluc1BvaW50QXRDaGVja3BvaW50KHBvaW50LCAnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJylcbiAgICAgIFBvaW50Lm1pbihtdXRhdGlvbi5nZXRFbmRCdWZmZXJQb3NpdGlvbigpLCBwb2ludClcbiAgICBlbHNlXG4gICAgICBwb2ludFxuXG4gIGZpbmRNdXRhdGlvbkNvbnRhaW5zUG9pbnRBdENoZWNrcG9pbnQ6IChwb2ludCwgY2hlY2twb2ludCkgLT5cbiAgICAjIENvZmZlZXNjcmlwdCBjYW5ub3QgaXRlcmF0ZSBvdmVyIGl0ZXJhdG9yIGJ5IEphdmFTY3JpcHQncyAnb2YnIGJlY2F1c2Ugb2Ygc3ludGF4IGNvbmZsaWN0cy5cbiAgICBpdGVyYXRvciA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi52YWx1ZXMoKVxuICAgIHdoaWxlIChlbnRyeSA9IGl0ZXJhdG9yLm5leHQoKSkgYW5kIG5vdCBlbnRyeS5kb25lXG4gICAgICBtdXRhdGlvbiA9IGVudHJ5LnZhbHVlXG4gICAgICBpZiBtdXRhdGlvbi5nZXRCdWZmZXJSYW5nZUZvckNoZWNrcG9pbnQoY2hlY2twb2ludCkuY29udGFpbnNQb2ludChwb2ludClcbiAgICAgICAgcmV0dXJuIG11dGF0aW9uXG5cbiMgTXV0YXRpb24gaW5mb3JtYXRpb24gaXMgY3JlYXRlZCBldmVuIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcbiMgU28gdGhhdCB3ZSBjYW4gZmlsdGVyIHNlbGVjdGlvbiBieSB3aGVuIGl0IHdhcyBjcmVhdGVkLlxuIyAgZS5nLiBTb21lIHNlbGVjdGlvbiBpcyBjcmVhdGVkIGF0ICd3aWxsLXNlbGVjdCcgY2hlY2twb2ludCwgb3RoZXJzIGF0ICdkaWQtc2VsZWN0JyBvciAnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJ1xuY2xhc3MgTXV0YXRpb25cbiAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgIHtAc2VsZWN0aW9uLCBAaW5pdGlhbFBvaW50LCBjaGVja3BvaW50LCBAbWFya2VyTGF5ZXIsIEBzdGF5QnlNYXJrZXIsIEB2aW1TdGF0ZX0gPSBvcHRpb25zXG5cbiAgICBAY3JlYXRlZEF0ID0gY2hlY2twb2ludFxuICAgIGlmIEBzdGF5QnlNYXJrZXJcbiAgICAgIEBpbml0aWFsUG9pbnRNYXJrZXIgPSBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclBvc2l0aW9uKEBpbml0aWFsUG9pbnQsIGludmFsaWRhdGU6ICduZXZlcicpXG4gICAgQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50ID0ge31cbiAgICBAbWFya2VyID0gbnVsbFxuICAgIEB1cGRhdGUoY2hlY2twb2ludClcblxuICBpc0NyZWF0ZWRBdDogKHRpbWluZykgLT5cbiAgICBAY3JlYXRlZEF0IGlzIHRpbWluZ1xuXG4gIHVwZGF0ZTogKGNoZWNrcG9pbnQpIC0+XG4gICAgIyBDdXJyZW50IG5vbi1lbXB0eSBzZWxlY3Rpb24gaXMgcHJpb3JpdGl6ZWQgb3ZlciBleGlzdGluZyBtYXJrZXIncyByYW5nZS5cbiAgICAjIFdlIGludmFsaWRhdGUgb2xkIG1hcmtlciB0byByZS10cmFjayBmcm9tIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgIHVubGVzcyBAc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuaXNFbXB0eSgpXG4gICAgICBAbWFya2VyPy5kZXN0cm95KClcbiAgICAgIEBtYXJrZXIgPSBudWxsXG5cbiAgICBAbWFya2VyID89IEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUmFuZ2UoQHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLCBpbnZhbGlkYXRlOiAnbmV2ZXInKVxuICAgIEBidWZmZXJSYW5nZUJ5Q2hlY2twb2ludFtjaGVja3BvaW50XSA9IEBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGdldFN0YXJ0QnVmZmVyUG9zaXRpb246IC0+XG4gICAgQG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG5cbiAgZ2V0RW5kQnVmZmVyUG9zaXRpb246IC0+XG4gICAge3N0YXJ0LCBlbmR9ID0gQG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG4gICAgcG9pbnQgPSBQb2ludC5tYXgoc3RhcnQsIGVuZC50cmFuc2xhdGUoWzAsIC0xXSkpXG4gICAgQHNlbGVjdGlvbi5lZGl0b3IuY2xpcEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIGdldEluaXRpYWxQb2ludDogKHtjbGlwLCB3aXNlfT17fSkgLT5cbiAgICBwb2ludCA9IEBpbml0aWFsUG9pbnRNYXJrZXI/LmdldEhlYWRCdWZmZXJQb3NpdGlvbigpID8gQGluaXRpYWxQb2ludFxuICAgIGNsaXAgPz0gbm90IEBnZXRCdWZmZXJSYW5nZUZvckNoZWNrcG9pbnQoJ2RpZC1zZWxlY3QnKT8uaXNFcXVhbChAbWFya2VyLmdldEJ1ZmZlclJhbmdlKCkpXG4gICAgaWYgY2xpcFxuICAgICAgaWYgd2lzZSBpcyAnbGluZXdpc2UnXG4gICAgICAgIFBvaW50Lm1pbihbQGdldEVuZEJ1ZmZlclBvc2l0aW9uKCkucm93LCBwb2ludC5jb2x1bW5dLCBwb2ludClcbiAgICAgIGVsc2VcbiAgICAgICAgUG9pbnQubWluKEBnZXRFbmRCdWZmZXJQb3NpdGlvbigpLCBwb2ludClcbiAgICBlbHNlXG4gICAgICBwb2ludFxuXG4gIGdldEJ1ZmZlclJhbmdlRm9yQ2hlY2twb2ludDogKGNoZWNrcG9pbnQpIC0+XG4gICAgQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50W2NoZWNrcG9pbnRdXG5cbiAgZ2V0UmVzdG9yZVBvaW50OiAoe3N0YXksIHdpc2V9PXt9KSAtPlxuICAgIGlmIHN0YXlcbiAgICAgIHBvaW50ID0gQGdldEluaXRpYWxQb2ludCh7d2lzZX0pXG4gICAgZWxzZVxuICAgICAge21vZGUsIHN1Ym1vZGV9ID0gQHZpbVN0YXRlXG4gICAgICBpZiAobW9kZSBpc250ICd2aXN1YWwnKSBvciAoc3VibW9kZSBpcyAnbGluZXdpc2UnIGFuZCBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSlcbiAgICAgICAgcG9pbnQgPSBzd3JhcChAc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignc3RhcnQnLCBmcm9tOiBbJ3Byb3BlcnR5J10pXG4gICAgICBwb2ludCA9IHBvaW50ID8gQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50WydkaWQtc2VsZWN0J10/LnN0YXJ0XG5cbiAgICBpZiBwb2ludD9cbiAgICAgIHBvaW50LnJvdyA9IGdldFZhbGlkVmltQnVmZmVyUm93KEBzZWxlY3Rpb24uZWRpdG9yLCBwb2ludC5yb3cpXG4gICAgcG9pbnRcbiJdfQ==
