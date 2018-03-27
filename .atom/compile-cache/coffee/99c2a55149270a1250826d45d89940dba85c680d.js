(function() {
  var LongModeStringTable, StatusBarManager, createDiv, settings;

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

  LongModeStringTable = {
    'normal': "Normal",
    'operator-pending': "Operator Pending",
    'visual.characterwise': "Visual Characterwise",
    'visual.blockwise': "Visual Blockwise",
    'visual.linewise': "Visual Linewise",
    'insert': "Insert",
    'insert.replace': "Insert Replace"
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
            return (mode[0] + (submode != null ? submode[0] : '')).toUpperCase();
          case 'long':
            return LongModeStringTable[mode + (submode != null ? '.' + submode : '')];
        }
      })();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3N0YXR1cy1iYXItbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFFWCxTQUFBLEdBQVksU0FBQyxHQUFEO0FBQ1YsUUFBQTtJQURZLGFBQUk7SUFDaEIsR0FBQSxHQUFNLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO0lBQ04sSUFBZSxVQUFmO01BQUEsR0FBRyxDQUFDLEVBQUosR0FBUyxHQUFUOztJQUNBLElBQW1DLGlCQUFuQztNQUFBLE9BQUEsR0FBRyxDQUFDLFNBQUosQ0FBYSxDQUFDLEdBQWQsWUFBa0IsU0FBbEIsRUFBQTs7V0FDQTtFQUpVOztFQU1aLG1CQUFBLEdBQ0U7SUFBQSxRQUFBLEVBQVUsUUFBVjtJQUNBLGtCQUFBLEVBQW9CLGtCQURwQjtJQUVBLHNCQUFBLEVBQXdCLHNCQUZ4QjtJQUdBLGtCQUFBLEVBQW9CLGtCQUhwQjtJQUlBLGlCQUFBLEVBQW1CLGlCQUpuQjtJQUtBLFFBQUEsRUFBVSxRQUxWO0lBTUEsZ0JBQUEsRUFBa0IsZ0JBTmxCOzs7RUFRRixNQUFNLENBQUMsT0FBUCxHQUNNOytCQUNKLE1BQUEsR0FBUTs7SUFFSywwQkFBQTtNQUNYLElBQUMsQ0FBQSxTQUFELEdBQWEsU0FBQSxDQUFVO1FBQUEsRUFBQSxFQUFPLElBQUMsQ0FBQSxNQUFGLEdBQVMsWUFBZjtRQUE0QixTQUFBLEVBQVcsQ0FBQyxjQUFELENBQXZDO09BQVY7TUFDYixJQUFDLENBQUEsU0FBUyxDQUFDLFdBQVgsQ0FBdUIsSUFBQyxDQUFBLE9BQUQsR0FBVyxTQUFBLENBQVU7UUFBQSxFQUFBLEVBQUksSUFBQyxDQUFBLE1BQUw7T0FBVixDQUFsQztJQUZXOzsrQkFJYixVQUFBLEdBQVksU0FBQyxTQUFEO01BQUMsSUFBQyxDQUFBLFlBQUQ7SUFBRDs7K0JBRVosTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLE9BQVA7TUFDTixJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBd0IsSUFBQyxDQUFBLE1BQUYsR0FBUyxHQUFULEdBQVk7YUFDbkMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFUO0FBQ0UsZ0JBQU8sUUFBUSxDQUFDLEdBQVQsQ0FBYSwwQkFBYixDQUFQO0FBQUEsZUFDTyxPQURQO21CQUVJLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBTCxHQUFVLENBQUksZUFBSCxHQUFpQixPQUFRLENBQUEsQ0FBQSxDQUF6QixHQUFpQyxFQUFsQyxDQUFYLENBQWlELENBQUMsV0FBbEQsQ0FBQTtBQUZKLGVBR08sTUFIUDttQkFJSSxtQkFBb0IsQ0FBQSxJQUFBLEdBQU8sQ0FBSSxlQUFILEdBQWlCLEdBQUEsR0FBTSxPQUF2QixHQUFvQyxFQUFyQyxDQUFQO0FBSnhCOztJQUhJOzsrQkFTUixNQUFBLEdBQVEsU0FBQTthQUNOLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxZQUFYLENBQXdCO1FBQUEsSUFBQSxFQUFNLElBQUMsQ0FBQSxTQUFQO1FBQWtCLFFBQUEsRUFBVSxFQUE1QjtPQUF4QjtJQURGOzsrQkFHUixNQUFBLEdBQVEsU0FBQTthQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBO0lBRE07Ozs7O0FBdkNWIiwic291cmNlc0NvbnRlbnQiOlsic2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jcmVhdGVEaXYgPSAoe2lkLCBjbGFzc0xpc3R9KSAtPlxuICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBkaXYuaWQgPSBpZCBpZiBpZD9cbiAgZGl2LmNsYXNzTGlzdC5hZGQoY2xhc3NMaXN0Li4uKSBpZiBjbGFzc0xpc3Q/XG4gIGRpdlxuXG5Mb25nTW9kZVN0cmluZ1RhYmxlID1cbiAgJ25vcm1hbCc6IFwiTm9ybWFsXCJcbiAgJ29wZXJhdG9yLXBlbmRpbmcnOiBcIk9wZXJhdG9yIFBlbmRpbmdcIlxuICAndmlzdWFsLmNoYXJhY3Rlcndpc2UnOiBcIlZpc3VhbCBDaGFyYWN0ZXJ3aXNlXCJcbiAgJ3Zpc3VhbC5ibG9ja3dpc2UnOiBcIlZpc3VhbCBCbG9ja3dpc2VcIlxuICAndmlzdWFsLmxpbmV3aXNlJzogXCJWaXN1YWwgTGluZXdpc2VcIlxuICAnaW5zZXJ0JzogXCJJbnNlcnRcIlxuICAnaW5zZXJ0LnJlcGxhY2UnOiBcIkluc2VydCBSZXBsYWNlXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU3RhdHVzQmFyTWFuYWdlclxuICBwcmVmaXg6ICdzdGF0dXMtYmFyLXZpbS1tb2RlLXBsdXMnXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGNvbnRhaW5lciA9IGNyZWF0ZURpdihpZDogXCIje0BwcmVmaXh9LWNvbnRhaW5lclwiLCBjbGFzc0xpc3Q6IFsnaW5saW5lLWJsb2NrJ10pXG4gICAgQGNvbnRhaW5lci5hcHBlbmRDaGlsZChAZWxlbWVudCA9IGNyZWF0ZURpdihpZDogQHByZWZpeCkpXG5cbiAgaW5pdGlhbGl6ZTogKEBzdGF0dXNCYXIpIC0+XG5cbiAgdXBkYXRlOiAobW9kZSwgc3VibW9kZSkgLT5cbiAgICBAZWxlbWVudC5jbGFzc05hbWUgPSBcIiN7QHByZWZpeH0tI3ttb2RlfVwiXG4gICAgQGVsZW1lbnQudGV4dENvbnRlbnQgPVxuICAgICAgc3dpdGNoIHNldHRpbmdzLmdldCgnc3RhdHVzQmFyTW9kZVN0cmluZ1N0eWxlJylcbiAgICAgICAgd2hlbiAnc2hvcnQnXG4gICAgICAgICAgKG1vZGVbMF0gKyAoaWYgc3VibW9kZT8gdGhlbiBzdWJtb2RlWzBdIGVsc2UgJycpKS50b1VwcGVyQ2FzZSgpXG4gICAgICAgIHdoZW4gJ2xvbmcnXG4gICAgICAgICAgTG9uZ01vZGVTdHJpbmdUYWJsZVttb2RlICsgKGlmIHN1Ym1vZGU/IHRoZW4gJy4nICsgc3VibW9kZSBlbHNlICcnKV1cblxuICBhdHRhY2g6IC0+XG4gICAgQHRpbGUgPSBAc3RhdHVzQmFyLmFkZFJpZ2h0VGlsZShpdGVtOiBAY29udGFpbmVyLCBwcmlvcml0eTogMjApXG5cbiAgZGV0YWNoOiAtPlxuICAgIEB0aWxlLmRlc3Ryb3koKVxuIl19
