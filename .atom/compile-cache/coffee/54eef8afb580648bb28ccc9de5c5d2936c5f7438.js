(function() {
  var AutoHideTimer, Logger, PlainMessageView;

  PlainMessageView = null;

  AutoHideTimer = null;

  module.exports = Logger = (function() {
    function Logger(title) {
      this.title = title;
    }

    Logger.prototype.showInPanel = function(message, className) {
      var MessagePanelView, msg, ref;
      if (!this.panel) {
        ref = require("atom-message-panel"), MessagePanelView = ref.MessagePanelView, PlainMessageView = ref.PlainMessageView;
        this.panel = new MessagePanelView({
          title: this.title
        });
      }
      this.panel.attach();
      msg = new PlainMessageView({
        message: message,
        className: className
      });
      this.panel.add(msg);
      this.panel.setSummary({
        summary: message,
        className: className
      });
      this.panel.body.scrollTop(1e10);
      if (atom.config.get("remote-sync.foldLogPanel") && !this.foldedPanel) {
        this.panel.toggle();
        this.foldedPanel = true;
      }
      return msg;
    };

    Logger.prototype.log = function(message) {
      var date, msg, startTime;
      date = new Date;
      startTime = date.getTime();
      message = "[" + (date.toLocaleTimeString()) + "] " + message;
      if (atom.config.get("remote-sync.logToConsole")) {
        console.log(message);
        return function() {
          return console.log(message + " Complete (" + (Date.now() - startTime) + "ms)");
        };
      } else {
        if (AutoHideTimer) {
          clearTimeout(AutoHideTimer);
          AutoHideTimer = null;
        }
        msg = this.showInPanel(message, "text-info");
        return (function(_this) {
          return function() {
            var endMsg;
            endMsg = " Complete (" + (Date.now() - startTime) + "ms)";
            msg.append(endMsg);
            _this.panel.setSummary({
              summary: message + " " + endMsg,
              className: "text-info"
            });
            if (atom.config.get("remote-sync.autoHideLogPanel")) {
              return AutoHideTimer = setTimeout(_this.panel.close.bind(_this.panel), 1000);
            }
          };
        })(this);
      }
    };

    Logger.prototype.error = function(message) {
      return this.showInPanel("" + message, "text-error");
    };

    return Logger;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3JlbW90ZS1zeW5jL2xpYi9Mb2dnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxnQkFBQSxHQUFtQjs7RUFDbkIsYUFBQSxHQUFnQjs7RUFFaEIsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLGdCQUFDLEtBQUQ7TUFBQyxJQUFDLENBQUEsUUFBRDtJQUFEOztxQkFFYixXQUFBLEdBQWEsU0FBQyxPQUFELEVBQVUsU0FBVjtBQUNYLFVBQUE7TUFBQSxJQUFHLENBQUksSUFBQyxDQUFBLEtBQVI7UUFDRSxNQUF1QyxPQUFBLENBQVEsb0JBQVIsQ0FBdkMsRUFBQyx1Q0FBRCxFQUFtQjtRQUNuQixJQUFDLENBQUEsS0FBRCxHQUFhLElBQUEsZ0JBQUEsQ0FDWDtVQUFBLEtBQUEsRUFBTyxJQUFDLENBQUEsS0FBUjtTQURXLEVBRmY7O01BS0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUE7TUFDQSxHQUFBLEdBQVUsSUFBQSxnQkFBQSxDQUNSO1FBQUEsT0FBQSxFQUFTLE9BQVQ7UUFDQSxTQUFBLEVBQVcsU0FEWDtPQURRO01BSVYsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsR0FBWDtNQUVBLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBUCxDQUNFO1FBQUEsT0FBQSxFQUFTLE9BQVQ7UUFDQSxTQUFBLEVBQVcsU0FEWDtPQURGO01BSUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBWixDQUFzQixJQUF0QjtNQUVBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDBCQUFoQixDQUFBLElBQWdELENBQUksSUFBQyxDQUFBLFdBQXhEO1FBQ0UsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUE7UUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLEtBRmpCOzthQUlBO0lBdkJXOztxQkF5QmIsR0FBQSxHQUFLLFNBQUMsT0FBRDtBQUNILFVBQUE7TUFBQSxJQUFBLEdBQU8sSUFBSTtNQUNYLFNBQUEsR0FBWSxJQUFJLENBQUMsT0FBTCxDQUFBO01BQ1osT0FBQSxHQUFVLEdBQUEsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBTCxDQUFBLENBQUQsQ0FBSCxHQUE4QixJQUE5QixHQUFrQztNQUM1QyxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwwQkFBaEIsQ0FBSDtRQUNFLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWjtlQUNBLFNBQUE7aUJBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBZSxPQUFELEdBQVMsYUFBVCxHQUFxQixDQUFDLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FBQSxHQUFhLFNBQWQsQ0FBckIsR0FBNkMsS0FBM0Q7UUFERixFQUZGO09BQUEsTUFBQTtRQUtFLElBQUcsYUFBSDtVQUNFLFlBQUEsQ0FBYSxhQUFiO1VBQ0EsYUFBQSxHQUFnQixLQUZsQjs7UUFHQSxHQUFBLEdBQU0sSUFBQyxDQUFBLFdBQUQsQ0FBYSxPQUFiLEVBQXNCLFdBQXRCO2VBQ04sQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtBQUNJLGdCQUFBO1lBQUEsTUFBQSxHQUFTLGFBQUEsR0FBYSxDQUFDLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FBQSxHQUFhLFNBQWQsQ0FBYixHQUFxQztZQUM5QyxHQUFHLENBQUMsTUFBSixDQUFXLE1BQVg7WUFDQSxLQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FDRTtjQUFBLE9BQUEsRUFBWSxPQUFELEdBQVMsR0FBVCxHQUFZLE1BQXZCO2NBQ0EsU0FBQSxFQUFXLFdBRFg7YUFERjtZQUdBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDhCQUFoQixDQUFIO3FCQUNFLGFBQUEsR0FBZ0IsVUFBQSxDQUFXLEtBQUMsQ0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQWIsQ0FBa0IsS0FBQyxDQUFBLEtBQW5CLENBQVgsRUFBc0MsSUFBdEMsRUFEbEI7O1VBTko7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLEVBVEY7O0lBSkc7O3FCQXNCTCxLQUFBLEdBQU8sU0FBQyxPQUFEO2FBQ0wsSUFBQyxDQUFBLFdBQUQsQ0FBYSxFQUFBLEdBQUcsT0FBaEIsRUFBMEIsWUFBMUI7SUFESzs7Ozs7QUF0RFQiLCJzb3VyY2VzQ29udGVudCI6WyJQbGFpbk1lc3NhZ2VWaWV3ID0gbnVsbFxuQXV0b0hpZGVUaW1lciA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTG9nZ2VyXG4gIGNvbnN0cnVjdG9yOiAoQHRpdGxlKSAtPlxuXG4gIHNob3dJblBhbmVsOiAobWVzc2FnZSwgY2xhc3NOYW1lKSAtPlxuICAgIGlmIG5vdCBAcGFuZWxcbiAgICAgIHtNZXNzYWdlUGFuZWxWaWV3LCBQbGFpbk1lc3NhZ2VWaWV3fSA9IHJlcXVpcmUgXCJhdG9tLW1lc3NhZ2UtcGFuZWxcIlxuICAgICAgQHBhbmVsID0gbmV3IE1lc3NhZ2VQYW5lbFZpZXdcbiAgICAgICAgdGl0bGU6IEB0aXRsZVxuXG4gICAgQHBhbmVsLmF0dGFjaCgpXG4gICAgbXNnID0gbmV3IFBsYWluTWVzc2FnZVZpZXdcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcbiAgICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lXG5cbiAgICBAcGFuZWwuYWRkIG1zZ1xuXG4gICAgQHBhbmVsLnNldFN1bW1hcnlcbiAgICAgIHN1bW1hcnk6IG1lc3NhZ2VcbiAgICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lXG5cbiAgICBAcGFuZWwuYm9keS5zY3JvbGxUb3AoMWUxMClcblxuICAgIGlmIGF0b20uY29uZmlnLmdldChcInJlbW90ZS1zeW5jLmZvbGRMb2dQYW5lbFwiKSBhbmQgbm90IEBmb2xkZWRQYW5lbFxuICAgICAgQHBhbmVsLnRvZ2dsZSgpXG4gICAgICBAZm9sZGVkUGFuZWwgPSB0cnVlXG5cbiAgICBtc2dcblxuICBsb2c6IChtZXNzYWdlKSAtPlxuICAgIGRhdGUgPSBuZXcgRGF0ZVxuICAgIHN0YXJ0VGltZSA9IGRhdGUuZ2V0VGltZSgpXG4gICAgbWVzc2FnZSA9IFwiWyN7ZGF0ZS50b0xvY2FsZVRpbWVTdHJpbmcoKX1dICN7bWVzc2FnZX1cIlxuICAgIGlmIGF0b20uY29uZmlnLmdldChcInJlbW90ZS1zeW5jLmxvZ1RvQ29uc29sZVwiKVxuICAgICAgY29uc29sZS5sb2cgbWVzc2FnZVxuICAgICAgKCktPlxuICAgICAgICBjb25zb2xlLmxvZyBcIiN7bWVzc2FnZX0gQ29tcGxldGUgKCN7RGF0ZS5ub3coKSAtIHN0YXJ0VGltZX1tcylcIlxuICAgIGVsc2VcbiAgICAgIGlmIEF1dG9IaWRlVGltZXJcbiAgICAgICAgY2xlYXJUaW1lb3V0IEF1dG9IaWRlVGltZXJcbiAgICAgICAgQXV0b0hpZGVUaW1lciA9IG51bGxcbiAgICAgIG1zZyA9IEBzaG93SW5QYW5lbCBtZXNzYWdlLCBcInRleHQtaW5mb1wiXG4gICAgICAoKT0+XG4gICAgICAgICAgZW5kTXNnID0gXCIgQ29tcGxldGUgKCN7RGF0ZS5ub3coKSAtIHN0YXJ0VGltZX1tcylcIlxuICAgICAgICAgIG1zZy5hcHBlbmQgZW5kTXNnXG4gICAgICAgICAgQHBhbmVsLnNldFN1bW1hcnlcbiAgICAgICAgICAgIHN1bW1hcnk6IFwiI3ttZXNzYWdlfSAje2VuZE1zZ31cIlxuICAgICAgICAgICAgY2xhc3NOYW1lOiBcInRleHQtaW5mb1wiXG4gICAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KFwicmVtb3RlLXN5bmMuYXV0b0hpZGVMb2dQYW5lbFwiKVxuICAgICAgICAgICAgQXV0b0hpZGVUaW1lciA9IHNldFRpbWVvdXQgQHBhbmVsLmNsb3NlLmJpbmQoQHBhbmVsKSwgMTAwMFxuXG4gIGVycm9yOiAobWVzc2FnZSkgLT5cbiAgICBAc2hvd0luUGFuZWwgXCIje21lc3NhZ2V9XCIsXCJ0ZXh0LWVycm9yXCJcbiJdfQ==
