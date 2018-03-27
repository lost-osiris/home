(function() {
  var CompositeDisposable, HighlightedAreaView;

  CompositeDisposable = require("atom").CompositeDisposable;

  HighlightedAreaView = require('./highlighted-area-view');

  module.exports = {
    config: {
      onlyHighlightWholeWords: {
        type: 'boolean',
        "default": true
      },
      hideHighlightOnSelectedWord: {
        type: 'boolean',
        "default": false
      },
      ignoreCase: {
        type: 'boolean',
        "default": false
      },
      lightTheme: {
        type: 'boolean',
        "default": false
      },
      highlightBackground: {
        type: 'boolean',
        "default": false
      },
      minimumLength: {
        type: 'integer',
        "default": 2
      },
      timeout: {
        type: 'integer',
        "default": 20,
        description: 'Defers searching for matching strings for X ms'
      },
      showInStatusBar: {
        type: 'boolean',
        "default": true,
        description: 'Show how many matches there are'
      },
      highlightInPanes: {
        type: 'boolean',
        "default": true,
        description: 'Highlight selection in another panes'
      }
    },
    areaView: null,
    activate: function(state) {
      this.areaView = new HighlightedAreaView();
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add("atom-workspace", {
        'highlight-selected:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
    },
    deactivate: function() {
      var ref, ref1;
      if ((ref = this.areaView) != null) {
        ref.destroy();
      }
      this.areaView = null;
      if ((ref1 = this.subscriptions) != null) {
        ref1.dispose();
      }
      return this.subscriptions = null;
    },
    provideHighlightSelectedV1Deprecated: function() {
      return this.areaView;
    },
    provideHighlightSelectedV2: function() {
      return this.areaView;
    },
    consumeStatusBar: function(statusBar) {
      return this.areaView.setStatusBar(statusBar);
    },
    toggle: function() {
      if (this.areaView.disabled) {
        return this.areaView.enable();
      } else {
        return this.areaView.disable();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2hpZ2hsaWdodC1zZWxlY3RlZC9saWIvaGlnaGxpZ2h0LXNlbGVjdGVkLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixtQkFBQSxHQUFzQixPQUFBLENBQVEseUJBQVI7O0VBRXRCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSx1QkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7T0FERjtNQUdBLDJCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtPQUpGO01BTUEsVUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7T0FQRjtNQVNBLFVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO09BVkY7TUFZQSxtQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7T0FiRjtNQWVBLGFBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQURUO09BaEJGO01Ba0JBLE9BQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsV0FBQSxFQUFhLGdEQUZiO09BbkJGO01Bc0JBLGVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLGlDQUZiO09BdkJGO01BMEJBLGdCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFBYSxzQ0FGYjtPQTNCRjtLQURGO0lBZ0NBLFFBQUEsRUFBVSxJQWhDVjtJQWtDQSxRQUFBLEVBQVUsU0FBQyxLQUFEO01BQ1IsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxtQkFBQSxDQUFBO01BQ2hCLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7YUFFckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDZjtRQUFBLDJCQUFBLEVBQTZCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QjtPQURlLENBQW5CO0lBSlEsQ0FsQ1Y7SUF5Q0EsVUFBQSxFQUFZLFNBQUE7QUFDVixVQUFBOztXQUFTLENBQUUsT0FBWCxDQUFBOztNQUNBLElBQUMsQ0FBQSxRQUFELEdBQVk7O1lBQ0UsQ0FBRSxPQUFoQixDQUFBOzthQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBSlAsQ0F6Q1o7SUErQ0Esb0NBQUEsRUFBc0MsU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKLENBL0N0QztJQWlEQSwwQkFBQSxFQUE0QixTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUosQ0FqRDVCO0lBbURBLGdCQUFBLEVBQWtCLFNBQUMsU0FBRDthQUNoQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsU0FBdkI7SUFEZ0IsQ0FuRGxCO0lBc0RBLE1BQUEsRUFBUSxTQUFBO01BQ04sSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQWI7ZUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFBLEVBSEY7O0lBRE0sQ0F0RFI7O0FBSkYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlIFwiYXRvbVwiXG5IaWdobGlnaHRlZEFyZWFWaWV3ID0gcmVxdWlyZSAnLi9oaWdobGlnaHRlZC1hcmVhLXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOlxuICAgIG9ubHlIaWdobGlnaHRXaG9sZVdvcmRzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgaGlkZUhpZ2hsaWdodE9uU2VsZWN0ZWRXb3JkOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGlnbm9yZUNhc2U6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgbGlnaHRUaGVtZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICBoaWdobGlnaHRCYWNrZ3JvdW5kOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIG1pbmltdW1MZW5ndGg6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDJcbiAgICB0aW1lb3V0OlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAyMFxuICAgICAgZGVzY3JpcHRpb246ICdEZWZlcnMgc2VhcmNoaW5nIGZvciBtYXRjaGluZyBzdHJpbmdzIGZvciBYIG1zJ1xuICAgIHNob3dJblN0YXR1c0JhcjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246ICdTaG93IGhvdyBtYW55IG1hdGNoZXMgdGhlcmUgYXJlJ1xuICAgIGhpZ2hsaWdodEluUGFuZXM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiAnSGlnaGxpZ2h0IHNlbGVjdGlvbiBpbiBhbm90aGVyIHBhbmVzJ1xuXG4gIGFyZWFWaWV3OiBudWxsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAYXJlYVZpZXcgPSBuZXcgSGlnaGxpZ2h0ZWRBcmVhVmlldygpXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIixcbiAgICAgICAgJ2hpZ2hsaWdodC1zZWxlY3RlZDp0b2dnbGUnOiA9PiBAdG9nZ2xlKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBhcmVhVmlldz8uZGVzdHJveSgpXG4gICAgQGFyZWFWaWV3ID0gbnVsbFxuICAgIEBzdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG51bGxcblxuICBwcm92aWRlSGlnaGxpZ2h0U2VsZWN0ZWRWMURlcHJlY2F0ZWQ6IC0+IEBhcmVhVmlld1xuXG4gIHByb3ZpZGVIaWdobGlnaHRTZWxlY3RlZFYyOiAtPiBAYXJlYVZpZXdcblxuICBjb25zdW1lU3RhdHVzQmFyOiAoc3RhdHVzQmFyKSAtPlxuICAgIEBhcmVhVmlldy5zZXRTdGF0dXNCYXIgc3RhdHVzQmFyXG5cbiAgdG9nZ2xlOiAtPlxuICAgIGlmIEBhcmVhVmlldy5kaXNhYmxlZFxuICAgICAgQGFyZWFWaWV3LmVuYWJsZSgpXG4gICAgZWxzZVxuICAgICAgQGFyZWFWaWV3LmRpc2FibGUoKVxuIl19
