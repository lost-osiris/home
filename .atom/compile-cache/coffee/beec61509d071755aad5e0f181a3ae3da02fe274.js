(function() {
  var CompositeDisposable, RenameDialog, StatusIcon,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  RenameDialog = null;

  module.exports = StatusIcon = (function(superClass) {
    extend(StatusIcon, superClass);

    function StatusIcon() {
      return StatusIcon.__super__.constructor.apply(this, arguments);
    }

    StatusIcon.prototype.active = false;

    StatusIcon.prototype.initialize = function(terminalView) {
      var ref;
      this.terminalView = terminalView;
      this.classList.add('pio-terminal-status-icon');
      this.icon = document.createElement('i');
      this.icon.classList.add('icon', 'icon-terminal');
      this.appendChild(this.icon);
      this.name = document.createElement('span');
      this.name.classList.add('name');
      this.appendChild(this.name);
      this.dataset.type = (ref = this.terminalView.constructor) != null ? ref.name : void 0;
      this.addEventListener('click', (function(_this) {
        return function(arg) {
          var ctrlKey, which;
          which = arg.which, ctrlKey = arg.ctrlKey;
          if (which === 1) {
            _this.terminalView.toggle();
            return true;
          } else if (which === 2) {
            _this.terminalView.destroy();
            return false;
          }
        };
      })(this));
      return this.setupTooltip();
    };

    StatusIcon.prototype.setupTooltip = function() {
      var onMouseEnter;
      onMouseEnter = (function(_this) {
        return function(event) {
          if (event.detail === 'platformio-ide-terminal') {
            return;
          }
          return _this.updateTooltip();
        };
      })(this);
      this.mouseEnterSubscription = {
        dispose: (function(_this) {
          return function() {
            _this.removeEventListener('mouseenter', onMouseEnter);
            return _this.mouseEnterSubscription = null;
          };
        })(this)
      };
      return this.addEventListener('mouseenter', onMouseEnter);
    };

    StatusIcon.prototype.updateTooltip = function() {
      var process;
      this.removeTooltip();
      if (process = this.terminalView.getTerminalTitle()) {
        this.tooltip = atom.tooltips.add(this, {
          title: process,
          html: false,
          delay: {
            show: 1000,
            hide: 100
          }
        });
      }
      return this.dispatchEvent(new CustomEvent('mouseenter', {
        bubbles: true,
        detail: 'platformio-ide-terminal'
      }));
    };

    StatusIcon.prototype.removeTooltip = function() {
      if (this.tooltip) {
        this.tooltip.dispose();
      }
      return this.tooltip = null;
    };

    StatusIcon.prototype.destroy = function() {
      this.removeTooltip();
      if (this.mouseEnterSubscription) {
        this.mouseEnterSubscription.dispose();
      }
      return this.remove();
    };

    StatusIcon.prototype.activate = function() {
      this.classList.add('active');
      return this.active = true;
    };

    StatusIcon.prototype.isActive = function() {
      return this.classList.contains('active');
    };

    StatusIcon.prototype.deactivate = function() {
      this.classList.remove('active');
      return this.active = false;
    };

    StatusIcon.prototype.toggle = function() {
      if (this.active) {
        this.classList.remove('active');
      } else {
        this.classList.add('active');
      }
      return this.active = !this.active;
    };

    StatusIcon.prototype.isActive = function() {
      return this.active;
    };

    StatusIcon.prototype.rename = function() {
      var dialog;
      if (RenameDialog == null) {
        RenameDialog = require('./rename-dialog');
      }
      dialog = new RenameDialog(this);
      return dialog.attach();
    };

    StatusIcon.prototype.getName = function() {
      return this.name.textContent.substring(1);
    };

    StatusIcon.prototype.updateName = function(name) {
      if (name !== this.getName()) {
        if (name) {
          name = "&nbsp;" + name;
        }
        this.name.innerHTML = name;
        return this.terminalView.emit('did-change-title');
      }
    };

    return StatusIcon;

  })(HTMLElement);

  module.exports = document.registerElement('pio-terminal-status-icon', {
    prototype: StatusIcon.prototype,
    "extends": 'li'
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi9zdGF0dXMtaWNvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDZDQUFBO0lBQUE7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsWUFBQSxHQUFlOztFQUVmLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7eUJBQ0osTUFBQSxHQUFROzt5QkFFUixVQUFBLEdBQVksU0FBQyxZQUFEO0FBQ1YsVUFBQTtNQURXLElBQUMsQ0FBQSxlQUFEO01BQ1gsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsMEJBQWY7TUFFQSxJQUFDLENBQUEsSUFBRCxHQUFRLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCO01BQ1IsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBaEIsQ0FBb0IsTUFBcEIsRUFBNEIsZUFBNUI7TUFDQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxJQUFkO01BRUEsSUFBQyxDQUFBLElBQUQsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QjtNQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWhCLENBQW9CLE1BQXBCO01BQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsSUFBZDtNQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxzREFBeUMsQ0FBRTtNQUUzQyxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsT0FBbEIsRUFBMkIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDekIsY0FBQTtVQUQyQixtQkFBTztVQUNsQyxJQUFHLEtBQUEsS0FBUyxDQUFaO1lBQ0UsS0FBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLENBQUE7bUJBQ0EsS0FGRjtXQUFBLE1BR0ssSUFBRyxLQUFBLEtB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O2FBQ2IsTUFBTSxDQUFDLE1BQVAsQ0FBQTtJQUhNOzt5QkFLUixPQUFBLEdBQVMsU0FBQTthQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQWxCLENBQTRCLENBQTVCO0lBQUg7O3lCQUVULFVBQUEsR0FBWSxTQUFDLElBQUQ7TUFDVixJQUFHLElBQUEsS0FBVSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQWI7UUFDRSxJQUEwQixJQUExQjtVQUFBLElBQUEsR0FBTyxRQUFBLEdBQVcsS0FBbEI7O1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCO2VBQ2xCLElBQUMsQ0FBQSxZQUFZLENBQUMsSUFBZCxDQUFtQixrQkFBbkIsRUFIRjs7SUFEVTs7OztLQXhGVzs7RUE4RnpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQVEsQ0FBQyxlQUFULENBQXlCLDBCQUF6QixFQUFxRDtJQUFBLFNBQUEsRUFBVyxVQUFVLENBQUMsU0FBdEI7SUFBaUMsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUExQztHQUFyRDtBQW5HakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5SZW5hbWVEaWFsb2cgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFN0YXR1c0ljb24gZXh0ZW5kcyBIVE1MRWxlbWVudFxuICBhY3RpdmU6IGZhbHNlXG5cbiAgaW5pdGlhbGl6ZTogKEB0ZXJtaW5hbFZpZXcpIC0+XG4gICAgQGNsYXNzTGlzdC5hZGQgJ3Bpby10ZXJtaW5hbC1zdGF0dXMtaWNvbidcblxuICAgIEBpY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaScpXG4gICAgQGljb24uY2xhc3NMaXN0LmFkZCAnaWNvbicsICdpY29uLXRlcm1pbmFsJ1xuICAgIEBhcHBlbmRDaGlsZChAaWNvbilcblxuICAgIEBuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgQG5hbWUuY2xhc3NMaXN0LmFkZCAnbmFtZSdcbiAgICBAYXBwZW5kQ2hpbGQoQG5hbWUpXG5cbiAgICBAZGF0YXNldC50eXBlID0gQHRlcm1pbmFsVmlldy5jb25zdHJ1Y3Rvcj8ubmFtZVxuXG4gICAgQGFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgKHt3aGljaCwgY3RybEtleX0pID0+XG4gICAgICBpZiB3aGljaCBpcyAxXG4gICAgICAgIEB0ZXJtaW5hbFZpZXcudG9nZ2xlKClcbiAgICAgICAgdHJ1ZVxuICAgICAgZWxzZSBpZiB3aGljaCBpcyAyXG4gICAgICAgIEB0ZXJtaW5hbFZpZXcuZGVzdHJveSgpXG4gICAgICAgIGZhbHNlXG5cbiAgICBAc2V0dXBUb29sdGlwKClcblxuICBzZXR1cFRvb2x0aXA6IC0+XG5cbiAgICBvbk1vdXNlRW50ZXIgPSAoZXZlbnQpID0+XG4gICAgICByZXR1cm4gaWYgZXZlbnQuZGV0YWlsIGlzICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbCdcbiAgICAgIEB1cGRhdGVUb29sdGlwKClcblxuICAgIEBtb3VzZUVudGVyU3Vic2NyaXB0aW9uID0gZGlzcG9zZTogPT5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuICAgICAgQG1vdXNlRW50ZXJTdWJzY3JpcHRpb24gPSBudWxsXG5cbiAgICBAYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblxuICB1cGRhdGVUb29sdGlwOiAtPlxuICAgIEByZW1vdmVUb29sdGlwKClcblxuICAgIGlmIHByb2Nlc3MgPSBAdGVybWluYWxWaWV3LmdldFRlcm1pbmFsVGl0bGUoKVxuICAgICAgQHRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCB0aGlzLFxuICAgICAgICB0aXRsZTogcHJvY2Vzc1xuICAgICAgICBodG1sOiBmYWxzZVxuICAgICAgICBkZWxheTpcbiAgICAgICAgICBzaG93OiAxMDAwXG4gICAgICAgICAgaGlkZTogMTAwXG5cbiAgICBAZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ21vdXNlZW50ZXInLCBidWJibGVzOiB0cnVlLCBkZXRhaWw6ICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbCcpKVxuXG4gIHJlbW92ZVRvb2x0aXA6IC0+XG4gICAgQHRvb2x0aXAuZGlzcG9zZSgpIGlmIEB0b29sdGlwXG4gICAgQHRvb2x0aXAgPSBudWxsXG5cbiAgZGVzdHJveTogLT5cbiAgICBAcmVtb3ZlVG9vbHRpcCgpXG4gICAgQG1vdXNlRW50ZXJTdWJzY3JpcHRpb24uZGlzcG9zZSgpIGlmIEBtb3VzZUVudGVyU3Vic2NyaXB0aW9uXG4gICAgQHJlbW92ZSgpXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgQGNsYXNzTGlzdC5hZGQgJ2FjdGl2ZSdcbiAgICBAYWN0aXZlID0gdHJ1ZVxuXG4gIGlzQWN0aXZlOiAtPlxuICAgIEBjbGFzc0xpc3QuY29udGFpbnMgJ2FjdGl2ZSdcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBjbGFzc0xpc3QucmVtb3ZlICdhY3RpdmUnXG4gICAgQGFjdGl2ZSA9IGZhbHNlXG5cbiAgdG9nZ2xlOiAtPlxuICAgIGlmIEBhY3RpdmVcbiAgICAgIEBjbGFzc0xpc3QucmVtb3ZlICdhY3RpdmUnXG4gICAgZWxzZVxuICAgICAgQGNsYXNzTGlzdC5hZGQgJ2FjdGl2ZSdcbiAgICBAYWN0aXZlID0gIUBhY3RpdmVcblxuICBpc0FjdGl2ZTogLT5cbiAgICByZXR1cm4gQGFjdGl2ZVxuXG4gIHJlbmFtZTogLT5cbiAgICBSZW5hbWVEaWFsb2cgPz0gcmVxdWlyZSAnLi9yZW5hbWUtZGlhbG9nJ1xuICAgIGRpYWxvZyA9IG5ldyBSZW5hbWVEaWFsb2cgdGhpc1xuICAgIGRpYWxvZy5hdHRhY2goKVxuXG4gIGdldE5hbWU6IC0+IEBuYW1lLnRleHRDb250ZW50LnN1YnN0cmluZygxKVxuXG4gIHVwZGF0ZU5hbWU6IChuYW1lKSAtPlxuICAgIGlmIG5hbWUgaXNudCBAZ2V0TmFtZSgpXG4gICAgICBuYW1lID0gXCImbmJzcDtcIiArIG5hbWUgaWYgbmFtZVxuICAgICAgQG5hbWUuaW5uZXJIVE1MID0gbmFtZVxuICAgICAgQHRlcm1pbmFsVmlldy5lbWl0ICdkaWQtY2hhbmdlLXRpdGxlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudCgncGlvLXRlcm1pbmFsLXN0YXR1cy1pY29uJywgcHJvdG90eXBlOiBTdGF0dXNJY29uLnByb3RvdHlwZSwgZXh0ZW5kczogJ2xpJylcbiJdfQ==
