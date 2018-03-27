(function() {
  var BlockwiseSelection, _, __swrap, assertWithException, ref, settings, sortRanges, swrap, trimRange,
    slice = [].slice;

  _ = require('underscore-plus');

  ref = require('./utils'), sortRanges = ref.sortRanges, assertWithException = ref.assertWithException, trimRange = ref.trimRange;

  settings = require('./settings');

  __swrap = null;

  swrap = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (__swrap == null) {
      __swrap = require('./selection-wrapper');
    }
    return __swrap.apply(null, args);
  };

  BlockwiseSelection = (function() {
    BlockwiseSelection.prototype.editor = null;

    BlockwiseSelection.prototype.selections = null;

    BlockwiseSelection.prototype.goalColumn = null;

    BlockwiseSelection.prototype.reversed = false;

    BlockwiseSelection.blockwiseSelectionsByEditor = new Map();

    BlockwiseSelection.clearSelections = function(editor) {
      return this.blockwiseSelectionsByEditor["delete"](editor);
    };

    BlockwiseSelection.has = function(editor) {
      return this.blockwiseSelectionsByEditor.has(editor);
    };

    BlockwiseSelection.getSelections = function(editor) {
      var ref1;
      return (ref1 = this.blockwiseSelectionsByEditor.get(editor)) != null ? ref1 : [];
    };

    BlockwiseSelection.getSelectionsOrderedByBufferPosition = function(editor) {
      return this.getSelections(editor).sort(function(a, b) {
        return a.getStartSelection().compare(b.getStartSelection());
      });
    };

    BlockwiseSelection.getLastSelection = function(editor) {
      return _.last(this.blockwiseSelectionsByEditor.get(editor));
    };

    BlockwiseSelection.saveSelection = function(blockwiseSelection) {
      var editor;
      editor = blockwiseSelection.editor;
      if (!this.has(editor)) {
        this.blockwiseSelectionsByEditor.set(editor, []);
      }
      return this.blockwiseSelectionsByEditor.get(editor).push(blockwiseSelection);
    };

    function BlockwiseSelection(selection) {
      var $memberSelection, $selection, end, endColumn, headColumn, i, j, k, len, len1, memberReversed, memberSelection, range, ranges, ref1, ref2, ref3, ref4, ref5, ref6, results, start, startColumn, tailColumn;
      this.needSkipNormalization = false;
      this.properties = {};
      this.editor = selection.editor;
      $selection = swrap(selection);
      if (!$selection.hasProperties()) {
        if (settings.get('strictAssertion')) {
          assertWithException(false, "Trying to instantiate vB from properties-less selection");
        }
        $selection.saveProperties();
      }
      this.goalColumn = selection.cursor.goalColumn;
      this.reversed = memberReversed = selection.isReversed();
      ref1 = $selection.getProperties(), (ref2 = ref1.head, headColumn = ref2.column), (ref3 = ref1.tail, tailColumn = ref3.column);
      start = $selection.getBufferPositionFor('start', {
        from: ['property']
      });
      end = $selection.getBufferPositionFor('end', {
        from: ['property']
      });
      if ((this.goalColumn === 2e308) && headColumn >= tailColumn) {
        if (selection.isReversed()) {
          start.column = this.goalColumn;
        } else {
          end.column = this.goalColumn;
        }
      }
      if (start.column > end.column) {
        memberReversed = !memberReversed;
        startColumn = end.column;
        endColumn = start.column + 1;
      } else {
        startColumn = start.column;
        endColumn = end.column + 1;
      }
      ranges = (function() {
        results = [];
        for (var i = ref4 = start.row, ref5 = end.row; ref4 <= ref5 ? i <= ref5 : i >= ref5; ref4 <= ref5 ? i++ : i--){ results.push(i); }
        return results;
      }).apply(this).map(function(row) {
        return [[row, startColumn], [row, endColumn]];
      });
      selection.setBufferRange(ranges.shift(), {
        reversed: memberReversed
      });
      this.selections = [selection];
      for (j = 0, len = ranges.length; j < len; j++) {
        range = ranges[j];
        this.selections.push(this.editor.addSelectionForBufferRange(range, {
          reversed: memberReversed
        }));
      }
      this.updateGoalColumn();
      ref6 = this.getSelections();
      for (k = 0, len1 = ref6.length; k < len1; k++) {
        memberSelection = ref6[k];
        if (!($memberSelection = swrap(memberSelection))) {
          continue;
        }
        $memberSelection.saveProperties();
        $memberSelection.getProperties().head.column = headColumn;
        $memberSelection.getProperties().tail.column = tailColumn;
      }
      this.constructor.saveSelection(this);
    }

    BlockwiseSelection.prototype.getSelections = function() {
      return this.selections;
    };

    BlockwiseSelection.prototype.extendMemberSelectionsToEndOfLine = function() {
      var end, i, len, ref1, ref2, results, selection, start;
      ref1 = this.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        ref2 = selection.getBufferRange(), start = ref2.start, end = ref2.end;
        end.column = 2e308;
        results.push(selection.setBufferRange([start, end]));
      }
      return results;
    };

    BlockwiseSelection.prototype.expandMemberSelectionsOverLineWithTrimRange = function() {
      var i, len, range, ref1, results, selection, start;
      ref1 = this.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        start = selection.getBufferRange().start;
        range = trimRange(this.editor, this.editor.bufferRangeForBufferRow(start.row));
        results.push(selection.setBufferRange(range));
      }
      return results;
    };

    BlockwiseSelection.prototype.isReversed = function() {
      return this.reversed;
    };

    BlockwiseSelection.prototype.reverse = function() {
      return this.reversed = !this.reversed;
    };

    BlockwiseSelection.prototype.getProperties = function() {
      return {
        head: swrap(this.getHeadSelection()).getProperties().head,
        tail: swrap(this.getTailSelection()).getProperties().tail
      };
    };

    BlockwiseSelection.prototype.updateGoalColumn = function() {
      var i, len, ref1, results, selection;
      if (this.goalColumn != null) {
        ref1 = this.selections;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          selection = ref1[i];
          results.push(selection.cursor.goalColumn = this.goalColumn);
        }
        return results;
      }
    };

    BlockwiseSelection.prototype.isSingleRow = function() {
      return this.selections.length === 1;
    };

    BlockwiseSelection.prototype.getHeight = function() {
      var endRow, ref1, startRow;
      ref1 = this.getBufferRowRange(), startRow = ref1[0], endRow = ref1[1];
      return (endRow - startRow) + 1;
    };

    BlockwiseSelection.prototype.getStartSelection = function() {
      return this.selections[0];
    };

    BlockwiseSelection.prototype.getEndSelection = function() {
      return _.last(this.selections);
    };

    BlockwiseSelection.prototype.getHeadSelection = function() {
      if (this.isReversed()) {
        return this.getStartSelection();
      } else {
        return this.getEndSelection();
      }
    };

    BlockwiseSelection.prototype.getTailSelection = function() {
      if (this.isReversed()) {
        return this.getEndSelection();
      } else {
        return this.getStartSelection();
      }
    };

    BlockwiseSelection.prototype.getBufferRowRange = function() {
      var endRow, startRow;
      startRow = this.getStartSelection().getBufferRowRange()[0];
      endRow = this.getEndSelection().getBufferRowRange()[0];
      return [startRow, endRow];
    };

    BlockwiseSelection.prototype.setSelectedBufferRanges = function(ranges, arg) {
      var base, goalColumn, head, i, len, range, reversed;
      reversed = arg.reversed;
      sortRanges(ranges);
      range = ranges.shift();
      head = this.getHeadSelection();
      this.removeSelections({
        except: head
      });
      goalColumn = head.cursor.goalColumn;
      head.setBufferRange(range, {
        reversed: reversed
      });
      if (goalColumn != null) {
        if ((base = head.cursor).goalColumn == null) {
          base.goalColumn = goalColumn;
        }
      }
      for (i = 0, len = ranges.length; i < len; i++) {
        range = ranges[i];
        this.selections.push(this.editor.addSelectionForBufferRange(range, {
          reversed: reversed
        }));
      }
      return this.updateGoalColumn();
    };

    BlockwiseSelection.prototype.removeSelections = function(arg) {
      var except, i, len, ref1, results, selection;
      except = (arg != null ? arg : {}).except;
      ref1 = this.selections.slice();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        if (!(selection !== except)) {
          continue;
        }
        swrap(selection).clearProperties();
        _.remove(this.selections, selection);
        results.push(selection.destroy());
      }
      return results;
    };

    BlockwiseSelection.prototype.setHeadBufferPosition = function(point) {
      var head;
      head = this.getHeadSelection();
      this.removeSelections({
        except: head
      });
      return head.cursor.setBufferPosition(point);
    };

    BlockwiseSelection.prototype.skipNormalization = function() {
      return this.needSkipNormalization = true;
    };

    BlockwiseSelection.prototype.normalize = function() {
      var $selection, base, goalColumn, head, properties;
      if (this.needSkipNormalization) {
        return;
      }
      properties = this.getProperties();
      head = this.getHeadSelection();
      this.removeSelections({
        except: head
      });
      goalColumn = head.cursor.goalColumn;
      $selection = swrap(head);
      $selection.selectByProperties(properties);
      $selection.saveProperties(true);
      if (goalColumn) {
        return (base = head.cursor).goalColumn != null ? base.goalColumn : base.goalColumn = goalColumn;
      }
    };

    BlockwiseSelection.prototype.autoscroll = function() {
      return this.getHeadSelection().autoscroll();
    };

    return BlockwiseSelection;

  })();

  module.exports = BlockwiseSelection;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jsb2Nrd2lzZS1zZWxlY3Rpb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnR0FBQTtJQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosTUFBK0MsT0FBQSxDQUFRLFNBQVIsQ0FBL0MsRUFBQywyQkFBRCxFQUFhLDZDQUFiLEVBQWtDOztFQUNsQyxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBRVgsT0FBQSxHQUFVOztFQUNWLEtBQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtJQURPOztNQUNQLFVBQVcsT0FBQSxDQUFRLHFCQUFSOztXQUNYLE9BQUEsYUFBUSxJQUFSO0VBRk07O0VBSUY7aUNBQ0osTUFBQSxHQUFROztpQ0FDUixVQUFBLEdBQVk7O2lDQUNaLFVBQUEsR0FBWTs7aUNBQ1osUUFBQSxHQUFVOztJQUVWLGtCQUFDLENBQUEsMkJBQUQsR0FBbUMsSUFBQSxHQUFBLENBQUE7O0lBRW5DLGtCQUFDLENBQUEsZUFBRCxHQUFrQixTQUFDLE1BQUQ7YUFDaEIsSUFBQyxDQUFBLDJCQUEyQixFQUFDLE1BQUQsRUFBNUIsQ0FBb0MsTUFBcEM7SUFEZ0I7O0lBR2xCLGtCQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsTUFBRDthQUNKLElBQUMsQ0FBQSwyQkFBMkIsQ0FBQyxHQUE3QixDQUFpQyxNQUFqQztJQURJOztJQUdOLGtCQUFDLENBQUEsYUFBRCxHQUFnQixTQUFDLE1BQUQ7QUFDZCxVQUFBO29GQUEyQztJQUQ3Qjs7SUFHaEIsa0JBQUMsQ0FBQSxvQ0FBRCxHQUF1QyxTQUFDLE1BQUQ7YUFDckMsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFmLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsU0FBQyxDQUFELEVBQUksQ0FBSjtlQUMxQixDQUFDLENBQUMsaUJB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QUF4TWpCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxue3NvcnRSYW5nZXMsIGFzc2VydFdpdGhFeGNlcHRpb24sIHRyaW1SYW5nZX0gPSByZXF1aXJlICcuL3V0aWxzJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5fX3N3cmFwID0gbnVsbFxuc3dyYXAgPSAoYXJncy4uLikgLT5cbiAgX19zd3JhcCA/PSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuICBfX3N3cmFwKGFyZ3MuLi4pXG5cbmNsYXNzIEJsb2Nrd2lzZVNlbGVjdGlvblxuICBlZGl0b3I6IG51bGxcbiAgc2VsZWN0aW9uczogbnVsbFxuICBnb2FsQ29sdW1uOiBudWxsXG4gIHJldmVyc2VkOiBmYWxzZVxuXG4gIEBibG9ja3dpc2VTZWxlY3Rpb25zQnlFZGl0b3IgPSBuZXcgTWFwKClcblxuICBAY2xlYXJTZWxlY3Rpb25zOiAoZWRpdG9yKSAtPlxuICAgIEBibG9ja3dpc2VTZWxlY3Rpb25zQnlFZGl0b3IuZGVsZXRlKGVkaXRvcilcblxuICBAaGFzOiAoZWRpdG9yKSAtPlxuICAgIEBibG9ja3dpc2VTZWxlY3Rpb25zQnlFZGl0b3IuaGFzKGVkaXRvcilcblxuICBAZ2V0U2VsZWN0aW9uczogKGVkaXRvcikgLT5cbiAgICBAYmxvY2t3aXNlU2VsZWN0aW9uc0J5RWRpdG9yLmdldChlZGl0b3IpID8gW11cblxuICBAZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uOiAoZWRpdG9yKSAtPlxuICAgIEBnZXRTZWxlY3Rpb25zKGVkaXRvcikuc29ydCAoYSwgYikgLT5cbiAgICAgIGEuZ2V0U3RhcnRTZWxlY3Rpb24oKS5jb21wYXJlKGIuZ2V0U3RhcnRTZWxlY3Rpb24oKSlcblxuICBAZ2V0TGFzdFNlbGVjdGlvbjogKGVkaXRvcikgLT5cbiAgICBfLmxhc3QoQGJsb2Nrd2lzZVNlbGVjdGlvbnNCeUVkaXRvci5nZXQoZWRpdG9yKSlcblxuICBAc2F2ZVNlbGVjdGlvbjogKGJsb2Nrd2lzZVNlbGVjdGlvbikgLT5cbiAgICBlZGl0b3IgPSBibG9ja3dpc2VTZWxlY3Rpb24uZWRpdG9yXG4gICAgQGJsb2Nrd2lzZVNlbGVjdGlvbnNCeUVkaXRvci5zZXQoZWRpdG9yLCBbXSkgdW5sZXNzIEBoYXMoZWRpdG9yKVxuICAgIEBibG9ja3dpc2VTZWxlY3Rpb25zQnlFZGl0b3IuZ2V0KGVkaXRvcikucHVzaChibG9ja3dpc2VTZWxlY3Rpb24pXG5cbiAgY29uc3RydWN0b3I6IChzZWxlY3Rpb24pIC0+XG4gICAgQG5lZWRTa2lwTm9ybWFsaXphdGlvbiA9IGZhbHNlXG4gICAgQHByb3BlcnRpZXMgPSB7fVxuICAgIEBlZGl0b3IgPSBzZWxlY3Rpb24uZWRpdG9yXG4gICAgJHNlbGVjdGlvbiA9IHN3cmFwKHNlbGVjdGlvbilcbiAgICB1bmxlc3MgJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKClcbiAgICAgIGlmIHNldHRpbmdzLmdldCgnc3RyaWN0QXNzZXJ0aW9uJylcbiAgICAgICAgYXNzZXJ0V2l0aEV4Y2VwdGlvbihmYWxzZSwgXCJUcnlpbmcgdG8gaW5zdGFudGlhdGUgdkIgZnJvbSBwcm9wZXJ0aWVzLWxlc3Mgc2VsZWN0aW9uXCIpXG4gICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcblxuICAgIEBnb2FsQ29sdW1uID0gc2VsZWN0aW9uLmN1cnNvci5nb2FsQ29sdW1uXG4gICAgQHJldmVyc2VkID0gbWVtYmVyUmV2ZXJzZWQgPSBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG5cbiAgICB7aGVhZDoge2NvbHVtbjogaGVhZENvbHVtbn0sIHRhaWw6IHtjb2x1bW46IHRhaWxDb2x1bW59fSA9ICRzZWxlY3Rpb24uZ2V0UHJvcGVydGllcygpXG4gICAgc3RhcnQgPSAkc2VsZWN0aW9uLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdzdGFydCcsIGZyb206IFsncHJvcGVydHknXSlcbiAgICBlbmQgPSAkc2VsZWN0aW9uLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdlbmQnLCBmcm9tOiBbJ3Byb3BlcnR5J10pXG5cbiAgICAjIFJlc3BlY3QgZ29hbENvbHVtbiBvbmx5IHdoZW4gaXQncyB2YWx1ZSBpcyBJbmZpbml0eSBhbmQgc2VsZWN0aW9uJ3MgaGVhZC1jb2x1bW4gaXMgYmlnZ2VyIHRoYW4gdGFpbC1jb2x1bW5cbiAgICBpZiAoQGdvYWxDb2x1bW4gaXMgSW5maW5pdHkpIGFuZCBoZWFkQ29sdW1uID49IHRhaWxDb2x1bW5cbiAgICAgIGlmIHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgICAgc3RhcnQuY29sdW1uID0gQGdvYWxDb2x1bW5cbiAgICAgIGVsc2VcbiAgICAgICAgZW5kLmNvbHVtbiA9IEBnb2FsQ29sdW1uXG5cbiAgICBpZiBzdGFydC5jb2x1bW4gPiBlbmQuY29sdW1uXG4gICAgICBtZW1iZXJSZXZlcnNlZCA9IG5vdCBtZW1iZXJSZXZlcnNlZFxuICAgICAgc3RhcnRDb2x1bW4gPSBlbmQuY29sdW1uXG4gICAgICBlbmRDb2x1bW4gPSBzdGFydC5jb2x1bW4gKyAxXG4gICAgZWxzZVxuICAgICAgc3RhcnRDb2x1bW4gPSBzdGFydC5jb2x1bW5cbiAgICAgIGVuZENvbHVtbiA9IGVuZC5jb2x1bW4gKyAxXG5cbiAgICByYW5nZXMgPSBbc3RhcnQucm93Li5lbmQucm93XS5tYXAgKHJvdykgLT5cbiAgICAgIFtbcm93LCBzdGFydENvbHVtbl0sIFtyb3csIGVuZENvbHVtbl1dXG5cbiAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2VzLnNoaWZ0KCksIHJldmVyc2VkOiBtZW1iZXJSZXZlcnNlZClcbiAgICBAc2VsZWN0aW9ucyA9IFtzZWxlY3Rpb25dXG4gICAgZm9yIHJhbmdlIGluIHJhbmdlc1xuICAgICAgQHNlbGVjdGlvbnMucHVzaChAZWRpdG9yLmFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlKHJhbmdlLCByZXZlcnNlZDogbWVtYmVyUmV2ZXJzZWQpKVxuICAgIEB1cGRhdGVHb2FsQ29sdW1uKClcblxuICAgIGZvciBtZW1iZXJTZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoKSB3aGVuICRtZW1iZXJTZWxlY3Rpb24gPSBzd3JhcChtZW1iZXJTZWxlY3Rpb24pXG4gICAgICAkbWVtYmVyU2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKCkgIyBUT0RPIzY5OCAgcmVtb3ZlIHRoaXM/XG4gICAgICAkbWVtYmVyU2VsZWN0aW9uLmdldFByb3BlcnRpZXMoKS5oZWFkLmNvbHVtbiA9IGhlYWRDb2x1bW5cbiAgICAgICRtZW1iZXJTZWxlY3Rpb24uZ2V0UHJvcGVydGllcygpLnRhaWwuY29sdW1uID0gdGFpbENvbHVtblxuXG4gICAgQGNvbnN0cnVjdG9yLnNhdmVTZWxlY3Rpb24odGhpcylcblxuICBnZXRTZWxlY3Rpb25zOiAtPlxuICAgIEBzZWxlY3Rpb25zXG5cbiAgZXh0ZW5kTWVtYmVyU2VsZWN0aW9uc1RvRW5kT2ZMaW5lOiAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoKVxuICAgICAge3N0YXJ0LCBlbmR9ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIGVuZC5jb2x1bW4gPSBJbmZpbml0eVxuICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKFtzdGFydCwgZW5kXSlcblxuICBleHBhbmRNZW1iZXJTZWxlY3Rpb25zT3ZlckxpbmVXaXRoVHJpbVJhbmdlOiAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoKVxuICAgICAgc3RhcnQgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydFxuICAgICAgcmFuZ2UgPSB0cmltUmFuZ2UoQGVkaXRvciwgQGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhzdGFydC5yb3cpKVxuICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlKVxuXG4gIGlzUmV2ZXJzZWQ6IC0+XG4gICAgQHJldmVyc2VkXG5cbiAgcmV2ZXJzZTogLT5cbiAgICBAcmV2ZXJzZWQgPSBub3QgQHJldmVyc2VkXG5cbiAgZ2V0UHJvcGVydGllczogLT5cbiAgICB7XG4gICAgICBoZWFkOiBzd3JhcChAZ2V0SGVhZFNlbGVjdGlvbigpKS5nZXRQcm9wZXJ0aWVzKCkuaGVhZFxuICAgICAgdGFpbDogc3dyYXAoQGdldFRhaWxTZWxlY3Rpb24oKSkuZ2V0UHJvcGVydGllcygpLnRhaWxcbiAgICB9XG5cbiAgdXBkYXRlR29hbENvbHVtbjogLT5cbiAgICBpZiBAZ29hbENvbHVtbj9cbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQHNlbGVjdGlvbnNcbiAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5nb2FsQ29sdW1uID0gQGdvYWxDb2x1bW5cblxuICBpc1NpbmdsZVJvdzogLT5cbiAgICBAc2VsZWN0aW9ucy5sZW5ndGggaXMgMVxuXG4gIGdldEhlaWdodDogLT5cbiAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBAZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICAgIChlbmRSb3cgLSBzdGFydFJvdykgKyAxXG5cbiAgZ2V0U3RhcnRTZWxlY3Rpb246IC0+XG4gICAgQHNlbGVjdGlvbnNbMF1cblxuICBnZXRFbmRTZWxlY3Rpb246IC0+XG4gICAgXy5sYXN0KEBzZWxlY3Rpb25zKVxuXG4gIGdldEhlYWRTZWxlY3Rpb246IC0+XG4gICAgaWYgQGlzUmV2ZXJzZWQoKVxuICAgICAgQGdldFN0YXJ0U2VsZWN0aW9uKClcbiAgICBlbHNlXG4gICAgICBAZ2V0RW5kU2VsZWN0aW9uKClcblxuICBnZXRUYWlsU2VsZWN0aW9uOiAtPlxuICAgIGlmIEBpc1JldmVyc2VkKClcbiAgICAgIEBnZXRFbmRTZWxlY3Rpb24oKVxuICAgIGVsc2VcbiAgICAgIEBnZXRTdGFydFNlbGVjdGlvbigpXG5cbiAgZ2V0QnVmZmVyUm93UmFuZ2U6IC0+XG4gICAgc3RhcnRSb3cgPSBAZ2V0U3RhcnRTZWxlY3Rpb24oKS5nZXRCdWZmZXJSb3dSYW5nZSgpWzBdXG4gICAgZW5kUm93ID0gQGdldEVuZFNlbGVjdGlvbigpLmdldEJ1ZmZlclJvd1JhbmdlKClbMF1cbiAgICBbc3RhcnRSb3csIGVuZFJvd11cblxuICAjIFtOT1RFXSBVc2VkIGJ5IHBsdWdpbiBwYWNrYWdlIHZtcDptb3ZlLXNlbGVjdGVkLXRleHRcbiAgc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXM6IChyYW5nZXMsIHtyZXZlcnNlZH0pIC0+XG4gICAgc29ydFJhbmdlcyhyYW5nZXMpXG4gICAgcmFuZ2UgPSByYW5nZXMuc2hpZnQoKVxuXG4gICAgaGVhZCA9IEBnZXRIZWFkU2VsZWN0aW9uKClcbiAgICBAcmVtb3ZlU2VsZWN0aW9ucyhleGNlcHQ6IGhlYWQpXG4gICAge2dvYWxDb2x1bW59ID0gaGVhZC5jdXJzb3JcbiAgICAjIFdoZW4gcmV2ZXJzZWQgc3RhdGUgb2Ygc2VsZWN0aW9uIGNoYW5nZSwgZ29hbENvbHVtbiBpcyBjbGVhcmVkLlxuICAgICMgQnV0IGhlcmUgZm9yIGJsb2Nrd2lzZSwgSSB3YW50IHRvIGtlZXAgZ29hbENvbHVtbiB1bmNoYW5nZWQuXG4gICAgIyBUaGlzIGJlaGF2aW9yIGlzIG5vdCBjb21wYXRpYmxlIHdpdGggcHVyZS1WaW0gSSBrbm93LlxuICAgICMgQnV0IEkgYmVsaWV2ZSB0aGlzIGlzIG1vcmUgdW5ub2lzeSBhbmQgbGVzcyBjb25mdXNpb24gd2hpbGUgbW92aW5nXG4gICAgIyBjdXJzb3IgaW4gdmlzdWFsLWJsb2NrIG1vZGUuXG4gICAgaGVhZC5zZXRCdWZmZXJSYW5nZShyYW5nZSwge3JldmVyc2VkfSlcbiAgICBoZWFkLmN1cnNvci5nb2FsQ29sdW1uID89IGdvYWxDb2x1bW4gaWYgZ29hbENvbHVtbj9cblxuICAgIGZvciByYW5nZSBpbiByYW5nZXNcbiAgICAgIEBzZWxlY3Rpb25zLnB1c2ggQGVkaXRvci5hZGRTZWxlY3Rpb25Gb3JCdWZmZXJSYW5nZShyYW5nZSwge3JldmVyc2VkfSlcbiAgICBAdXBkYXRlR29hbENvbHVtbigpXG5cbiAgcmVtb3ZlU2VsZWN0aW9uczogKHtleGNlcHR9PXt9KSAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQHNlbGVjdGlvbnMuc2xpY2UoKSB3aGVuIChzZWxlY3Rpb24gaXNudCBleGNlcHQpXG4gICAgICBzd3JhcChzZWxlY3Rpb24pLmNsZWFyUHJvcGVydGllcygpXG4gICAgICBfLnJlbW92ZShAc2VsZWN0aW9ucywgc2VsZWN0aW9uKVxuICAgICAgc2VsZWN0aW9uLmRlc3Ryb3koKVxuXG4gIHNldEhlYWRCdWZmZXJQb3NpdGlvbjogKHBvaW50KSAtPlxuICAgIGhlYWQgPSBAZ2V0SGVhZFNlbGVjdGlvbigpXG4gICAgQHJlbW92ZVNlbGVjdGlvbnMoZXhjZXB0OiBoZWFkKVxuICAgIGhlYWQuY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIHNraXBOb3JtYWxpemF0aW9uOiAtPlxuICAgIEBuZWVkU2tpcE5vcm1hbGl6YXRpb24gPSB0cnVlXG5cbiAgbm9ybWFsaXplOiAtPlxuICAgIHJldHVybiBpZiBAbmVlZFNraXBOb3JtYWxpemF0aW9uXG5cbiAgICBwcm9wZXJ0aWVzID0gQGdldFByb3BlcnRpZXMoKSAjIFNhdmUgcHJvcCBCRUZPUkUgcmVtb3ZpbmcgbWVtYmVyIHNlbGVjdGlvbnMuXG5cbiAgICBoZWFkID0gQGdldEhlYWRTZWxlY3Rpb24oKVxuICAgIEByZW1vdmVTZWxlY3Rpb25zKGV4Y2VwdDogaGVhZClcblxuICAgIHtnb2FsQ29sdW1ufSA9IGhlYWQuY3Vyc29yICMgRklYTUUgdGhpcyBzaG91bGQgbm90IGJlIG5lY2Vzc2FyeVxuICAgICRzZWxlY3Rpb24gPSBzd3JhcChoZWFkKVxuICAgICRzZWxlY3Rpb24uc2VsZWN0QnlQcm9wZXJ0aWVzKHByb3BlcnRpZXMpXG4gICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcyh0cnVlKVxuICAgIGhlYWQuY3Vyc29yLmdvYWxDb2x1bW4gPz0gZ29hbENvbHVtbiBpZiBnb2FsQ29sdW1uICMgRklYTUUgdGhpcyBzaG91bGQgbm90IGJlIG5lY2Vzc2FyeVxuXG4gIGF1dG9zY3JvbGw6IC0+XG4gICAgQGdldEhlYWRTZWxlY3Rpb24oKS5hdXRvc2Nyb2xsKClcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9ja3dpc2VTZWxlY3Rpb25cbiJdfQ==
