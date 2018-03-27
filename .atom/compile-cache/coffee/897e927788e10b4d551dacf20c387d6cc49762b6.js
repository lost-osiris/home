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
      this.classList.add('status-icon');
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
          if (event.detail === 'terminal-plus') {
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
        detail: 'terminal-plus'
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

  module.exports = document.registerElement('status-icon', {
    prototype: StatusIcon.prototype,
    "extends": 'li'
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmFsLXBsdXMvbGliL3N0YXR1cy1pY29uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNkNBQUE7SUFBQTs7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixZQUFBLEdBQWU7O0VBRWYsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozt5QkFDSixNQUFBLEdBQVE7O3lCQUVSLFVBQUEsR0FBWSxTQUFDLFlBQUQ7QUFDVixVQUFBO01BRFcsSUFBQyxDQUFBLGVBQUQ7TUFDWCxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxhQUFmO01BRUEsSUFBQyxDQUFBLElBQUQsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixHQUF2QjtNQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWhCLENBQW9CLE1BQXBCLEVBQTRCLGVBQTVCO01BQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsSUFBZDtNQUVBLElBQUMsQ0FBQSxJQUFELEdBQVEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsTUFBdkI7TUFDUixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFoQixDQUFvQixNQUFwQjtNQUNBLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBQyxDQUFBLElBQWQ7TUFFQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsc0RBQXlDLENBQUU7TUFFM0MsSUFBQyxDQUFBLGdCQUFELENBQWtCLE9BQWxCLEVBQTJCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQ3pCLGNBQUE7VUFEMkIsbUJBQU87VUFDbEMsSUFBRyxLQUFBLEtBQVMsQ0FBWjtZQUNFLEtBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxDQUFBO21CQUNBLEtBRkY7V0FBQSxNQUdLLElBQUcsS0FBQSxLQUFTLENBQVo7WUFD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QUMsTUFBUCxDQUFBO0lBSE07O3lCQUtSLE9BQUEsR0FBUyxTQUFBO2FBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBbEIsQ0FBNEIsQ0FBNUI7SUFBSDs7eUJBRVQsVUFBQSxHQUFZLFNBQUMsSUFBRDtNQUNWLElBQUcsSUFBQSxLQUFVLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBYjtRQUNFLElBQTBCLElBQTFCO1VBQUEsSUFBQSxHQUFPLFFBQUEsR0FBVyxLQUFsQjs7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7ZUFDbEIsSUFBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQW1CLGtCQUFuQixFQUhGOztJQURVOzs7O0tBeEZXOztFQThGekIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsUUFBUSxDQUFDLGVBQVQsQ0FBeUIsYUFBekIsRUFBd0M7SUFBQSxTQUFBLEVBQVcsVUFBVSxDQUFDLFNBQXRCO0lBQWlDLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFBMUM7R0FBeEM7QUFuR2pCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuUmVuYW1lRGlhbG9nID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTdGF0dXNJY29uIGV4dGVuZHMgSFRNTEVsZW1lbnRcbiAgYWN0aXZlOiBmYWxzZVxuXG4gIGluaXRpYWxpemU6IChAdGVybWluYWxWaWV3KSAtPlxuICAgIEBjbGFzc0xpc3QuYWRkICdzdGF0dXMtaWNvbidcblxuICAgIEBpY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaScpXG4gICAgQGljb24uY2xhc3NMaXN0LmFkZCAnaWNvbicsICdpY29uLXRlcm1pbmFsJ1xuICAgIEBhcHBlbmRDaGlsZChAaWNvbilcblxuICAgIEBuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgQG5hbWUuY2xhc3NMaXN0LmFkZCAnbmFtZSdcbiAgICBAYXBwZW5kQ2hpbGQoQG5hbWUpXG5cbiAgICBAZGF0YXNldC50eXBlID0gQHRlcm1pbmFsVmlldy5jb25zdHJ1Y3Rvcj8ubmFtZVxuXG4gICAgQGFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgKHt3aGljaCwgY3RybEtleX0pID0+XG4gICAgICBpZiB3aGljaCBpcyAxXG4gICAgICAgIEB0ZXJtaW5hbFZpZXcudG9nZ2xlKClcbiAgICAgICAgdHJ1ZVxuICAgICAgZWxzZSBpZiB3aGljaCBpcyAyXG4gICAgICAgIEB0ZXJtaW5hbFZpZXcuZGVzdHJveSgpXG4gICAgICAgIGZhbHNlXG5cbiAgICBAc2V0dXBUb29sdGlwKClcblxuICBzZXR1cFRvb2x0aXA6IC0+XG5cbiAgICBvbk1vdXNlRW50ZXIgPSAoZXZlbnQpID0+XG4gICAgICByZXR1cm4gaWYgZXZlbnQuZGV0YWlsIGlzICd0ZXJtaW5hbC1wbHVzJ1xuICAgICAgQHVwZGF0ZVRvb2x0aXAoKVxuXG4gICAgQG1vdXNlRW50ZXJTdWJzY3JpcHRpb24gPSBkaXNwb3NlOiA9PlxuICAgICAgQHJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG4gICAgICBAbW91c2VFbnRlclN1YnNjcmlwdGlvbiA9IG51bGxcblxuICAgIEBhZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuXG4gIHVwZGF0ZVRvb2x0aXA6IC0+XG4gICAgQHJlbW92ZVRvb2x0aXAoKVxuXG4gICAgaWYgcHJvY2VzcyA9IEB0ZXJtaW5hbFZpZXcuZ2V0VGVybWluYWxUaXRsZSgpXG4gICAgICBAdG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIHRoaXMsXG4gICAgICAgIHRpdGxlOiBwcm9jZXNzXG4gICAgICAgIGh0bWw6IGZhbHNlXG4gICAgICAgIGRlbGF5OlxuICAgICAgICAgIHNob3c6IDEwMDBcbiAgICAgICAgICBoaWRlOiAxMDBcblxuICAgIEBkaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnbW91c2VlbnRlcicsIGJ1YmJsZXM6IHRydWUsIGRldGFpbDogJ3Rlcm1pbmFsLXBsdXMnKSlcblxuICByZW1vdmVUb29sdGlwOiAtPlxuICAgIEB0b29sdGlwLmRpc3Bvc2UoKSBpZiBAdG9vbHRpcFxuICAgIEB0b29sdGlwID0gbnVsbFxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHJlbW92ZVRvb2x0aXAoKVxuICAgIEBtb3VzZUVudGVyU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKSBpZiBAbW91c2VFbnRlclN1YnNjcmlwdGlvblxuICAgIEByZW1vdmUoKVxuXG4gIGFjdGl2YXRlOiAtPlxuICAgIEBjbGFzc0xpc3QuYWRkICdhY3RpdmUnXG4gICAgQGFjdGl2ZSA9IHRydWVcblxuICBpc0FjdGl2ZTogLT5cbiAgICBAY2xhc3NMaXN0LmNvbnRhaW5zICdhY3RpdmUnXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAY2xhc3NMaXN0LnJlbW92ZSAnYWN0aXZlJ1xuICAgIEBhY3RpdmUgPSBmYWxzZVxuXG4gIHRvZ2dsZTogLT5cbiAgICBpZiBAYWN0aXZlXG4gICAgICBAY2xhc3NMaXN0LnJlbW92ZSAnYWN0aXZlJ1xuICAgIGVsc2VcbiAgICAgIEBjbGFzc0xpc3QuYWRkICdhY3RpdmUnXG4gICAgQGFjdGl2ZSA9ICFAYWN0aXZlXG5cbiAgaXNBY3RpdmU6IC0+XG4gICAgcmV0dXJuIEBhY3RpdmVcblxuICByZW5hbWU6IC0+XG4gICAgUmVuYW1lRGlhbG9nID89IHJlcXVpcmUgJy4vcmVuYW1lLWRpYWxvZydcbiAgICBkaWFsb2cgPSBuZXcgUmVuYW1lRGlhbG9nIHRoaXNcbiAgICBkaWFsb2cuYXR0YWNoKClcblxuICBnZXROYW1lOiAtPiBAbmFtZS50ZXh0Q29udGVudC5zdWJzdHJpbmcoMSlcblxuICB1cGRhdGVOYW1lOiAobmFtZSkgLT5cbiAgICBpZiBuYW1lIGlzbnQgQGdldE5hbWUoKVxuICAgICAgbmFtZSA9IFwiJm5ic3A7XCIgKyBuYW1lIGlmIG5hbWVcbiAgICAgIEBuYW1lLmlubmVySFRNTCA9IG5hbWVcbiAgICAgIEB0ZXJtaW5hbFZpZXcuZW1pdCAnZGlkLWNoYW5nZS10aXRsZSdcblxubW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ3N0YXR1cy1pY29uJywgcHJvdG90eXBlOiBTdGF0dXNJY29uLnByb3RvdHlwZSwgZXh0ZW5kczogJ2xpJylcbiJdfQ==
