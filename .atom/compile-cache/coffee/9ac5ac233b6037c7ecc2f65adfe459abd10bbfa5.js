(function() {
  var StatusBarManager, _, createDiv, settings;

  _ = require('underscore-plus');

  settings = require('./settings');

  createDiv = function(arg) {
    var classList, div, id, ref;
    id = arg.id, classList = arg.classList;
    div = document.createElement('div');
    if (id != null) {
      div.id = id;
    }
    if (classList != null) {
      (ref = div.classList).add.apply(ref, classList);
    }
    return div;
  };

  module.exports = StatusBarManager = (function() {
    StatusBarManager.prototype.prefix = 'status-bar-vim-mode-plus';

    function StatusBarManager() {
      this.container = createDiv({
        id: this.prefix + "-container",
        classList: ['inline-block']
      });
      this.container.appendChild(this.element = createDiv({
        id: this.prefix
      }));
    }

    StatusBarManager.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
    };

    StatusBarManager.prototype.update = function(mode, submode) {
      this.element.className = this.prefix + "-" + mode;
      return this.element.textContent = (function() {
        switch (settings.get('statusBarModeStringStyle')) {
          case 'short':
            return this.getShortModeString(mode, submode);
          case 'long':
            return this.getLongModeString(mode, submode);
        }
      }).call(this);
    };

    StatusBarManager.prototype.getShortModeString = function(mode, submode) {
      return (mode[0] + (submode != null ? submode[0] : '')).toUpperCase();
    };

    StatusBarManager.prototype.getLongModeString = function(mode, submode) {
      var modeString;
      modeString = _.humanizeEventName(mode);
      if (submode != null) {
        modeString += " " + _.humanizeEventName(submode);
      }
      return modeString;
    };

    StatusBarManager.prototype.attach = function() {
      return this.tile = this.statusBar.addRightTile({
        item: this.container,
        priority: 20
      });
    };

    StatusBarManager.prototype.detach = function() {
      return this.tile.destroy();
    };

    return StatusBarManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3N0YXR1cy1iYXItbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVYLFNBQUEsR0FBWSxTQUFDLEdBQUQ7QUFDVixRQUFBO0lBRFksYUFBSTtJQUNoQixHQUFBLEdBQU0sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7SUFDTixJQUFlLFVBQWY7TUFBQSxHQUFHLENBQUMsRUFBSixHQUFTLEdBQVQ7O0lBQ0EsSUFBbUMsaUJBQW5DO01BQUEsT0FBQSxHQUFHLENBQUMsU0FBSixDQUFhLENBQUMsR0FBZCxZQUFrQixTQUFsQixFQUFBOztXQUNBO0VBSlU7O0VBTVosTUFBTSxDQUFDLE9BQVAsR0FDTTsrQkFDSixNQUFBLEdBQVE7O0lBRUssMEJBQUE7TUFDWCxJQUFDLENBQUEsU0FBRCxHQUFhLFNBQUEsQ0FBVTtRQUFBLEVBQUEsRUFBTyxJQUFDLENBQUEsTUFBRixHQUFTLFlBQWY7UUFBNEIsU0FBQSxFQUFXLENBQUMsY0FBRCxDQUF2QztPQUFWO01BQ2IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxXQUFYLENBQXVCLElBQUMsQ0FBQSxPQUFELEdBQVcsU0FBQSxDQUFVO1FBQUEsRUFBQSxFQUFJLElBQUMsQ0FBQSxNQUFMO09BQVYsQ0FBbEM7SUFGVzs7K0JBSWIsVUFBQSxHQUFZLFNBQUMsU0FBRDtNQUFDLElBQUMsQ0FBQSxZQUFEO0lBQUQ7OytCQUVaLE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxPQUFQO01BQ04sSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXdCLElBQUMsQ0FBQSxNQUFGLEdBQVMsR0FBVCxHQUFZO2FBQ25DLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVDtBQUNFLGdCQUFPLFFBQVEsQ0FBQyxHQUFULENBQWEsMEJBQWIsQ0FBUDtBQUFBLGVBQ08sT0FEUDttQkFFSSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsSUFBcEIsRUFBMEIsT0FBMUI7QUFGSixlQUdPLE1BSFA7bUJBSUksSUFBQyxDQUFBLGlCQUFELENBQW1CLElBQW5CLEVBQXlCLE9BQXpCO0FBSko7O0lBSEk7OytCQVNSLGtCQUFBLEdBQW9CLFNBQUMsSUFBRCxFQUFPLE9BQVA7YUFDbEIsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVUsQ0FBSSxlQUFILEdBQWlCLE9BQVEsQ0FBQSxDQUFBLENBQXpCLEdBQWlDLEVBQWxDLENBQVgsQ0FBaUQsQ0FBQyxXQUFsRCxDQUFBO0lBRGtCOzsrQkFHcEIsaUJBQUEsR0FBbUIsU0FBQyxJQUFELEVBQU8sT0FBUDtBQUNqQixVQUFBO01BQUEsVUFBQSxHQUFhLENBQUMsQ0FBQyxpQkFBRixDQUFvQixJQUFwQjtNQUNiLElBQW9ELGVBQXBEO1FBQUEsVUFBQSxJQUFjLEdBQUEsR0FBTSxDQUFDLENBQUMsaUJBQUYsQ0FBb0IsT0FBcEIsRUFBcEI7O2FBQ0E7SUFIaUI7OytCQUtuQixNQUFBLEdBQVEsU0FBQTthQUNOLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxZQUFYLENBQXdCO1FBQUEsSUFBQSxFQUFNLElBQUMsQ0FBQSxTQUFQO1FBQWtCLFFBQUEsRUFBVSxFQUE1QjtPQUF4QjtJQURGOzsrQkFHUixNQUFBLEdBQVEsU0FBQTthQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBO0lBRE07Ozs7O0FBdkNWIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY3JlYXRlRGl2ID0gKHtpZCwgY2xhc3NMaXN0fSkgLT5cbiAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgZGl2LmlkID0gaWQgaWYgaWQ/XG4gIGRpdi5jbGFzc0xpc3QuYWRkKGNsYXNzTGlzdC4uLikgaWYgY2xhc3NMaXN0P1xuICBkaXZcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU3RhdHVzQmFyTWFuYWdlclxuICBwcmVmaXg6ICdzdGF0dXMtYmFyLXZpbS1tb2RlLXBsdXMnXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGNvbnRhaW5lciA9IGNyZWF0ZURpdihpZDogXCIje0BwcmVmaXh9LWNvbnRhaW5lclwiLCBjbGFzc0xpc3Q6IFsnaW5saW5lLWJsb2NrJ10pXG4gICAgQGNvbnRhaW5lci5hcHBlbmRDaGlsZChAZWxlbWVudCA9IGNyZWF0ZURpdihpZDogQHByZWZpeCkpXG5cbiAgaW5pdGlhbGl6ZTogKEBzdGF0dXNCYXIpIC0+XG5cbiAgdXBkYXRlOiAobW9kZSwgc3VibW9kZSkgLT5cbiAgICBAZWxlbWVudC5jbGFzc05hbWUgPSBcIiN7QHByZWZpeH0tI3ttb2RlfVwiXG4gICAgQGVsZW1lbnQudGV4dENvbnRlbnQgPVxuICAgICAgc3dpdGNoIHNldHRpbmdzLmdldCgnc3RhdHVzQmFyTW9kZVN0cmluZ1N0eWxlJylcbiAgICAgICAgd2hlbiAnc2hvcnQnXG4gICAgICAgICAgQGdldFNob3J0TW9kZVN0cmluZyhtb2RlLCBzdWJtb2RlKVxuICAgICAgICB3aGVuICdsb25nJ1xuICAgICAgICAgIEBnZXRMb25nTW9kZVN0cmluZyhtb2RlLCBzdWJtb2RlKVxuXG4gIGdldFNob3J0TW9kZVN0cmluZzogKG1vZGUsIHN1Ym1vZGUpIC0+XG4gICAgKG1vZGVbMF0gKyAoaWYgc3VibW9kZT8gdGhlbiBzdWJtb2RlWzBdIGVsc2UgJycpKS50b1VwcGVyQ2FzZSgpXG5cbiAgZ2V0TG9uZ01vZGVTdHJpbmc6IChtb2RlLCBzdWJtb2RlKSAtPlxuICAgIG1vZGVTdHJpbmcgPSBfLmh1bWFuaXplRXZlbnROYW1lKG1vZGUpXG4gICAgbW9kZVN0cmluZyArPSBcIiBcIiArIF8uaHVtYW5pemVFdmVudE5hbWUoc3VibW9kZSkgaWYgc3VibW9kZT9cbiAgICBtb2RlU3RyaW5nXG5cbiAgYXR0YWNoOiAtPlxuICAgIEB0aWxlID0gQHN0YXR1c0Jhci5hZGRSaWdodFRpbGUoaXRlbTogQGNvbnRhaW5lciwgcHJpb3JpdHk6IDIwKVxuXG4gIGRldGFjaDogLT5cbiAgICBAdGlsZS5kZXN0cm95KClcbiJdfQ==
