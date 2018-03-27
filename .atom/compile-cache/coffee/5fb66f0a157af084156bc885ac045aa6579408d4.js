(function() {
  var UploadListener, async, minimatch;

  minimatch = null;

  async = null;

  module.exports = UploadListener = (function() {
    function UploadListener() {}

    UploadListener.prototype.handleSave = function(localFilePath, transport) {
      return this.handleAction(localFilePath, transport, 'upload');
    };

    UploadListener.prototype.handleDelete = function(localFilePath, transport) {
      return this.handleAction(localFilePath, transport, 'delete');
    };

    UploadListener.prototype.handleAction = function(localFilePath, transport, action) {
      var task;
      if (!this.queue) {
        if (!async) {
          async = require("async");
        }
        this.queue = async.queue(this.processFile.bind(this), 1);
      }
      if (this.queue.length()) {
        task = this.queue._tasks.head;
        while (task) {
          if (task.data.localFilePath === localFilePath && task.data.action === action && task.data.transport.settings.transport === transport.settings.transport && task.data.transport.settings.hostname === transport.settings.hostname && task.data.transport.settings.port === transport.settings.port && task.data.transport.settings.target === transport.settings.target) {
            task.data.discard = true;
          }
          task = task.next;
        }
      }
      this.queue.resume();
      return this.queue.push({
        localFilePath: localFilePath,
        transport: transport,
        action: action,
        discard: false
      });
    };

    UploadListener.prototype.processFile = function(task, callback) {
      var action, cb, discard, localFilePath, transport;
      localFilePath = task.localFilePath, transport = task.transport, action = task.action, discard = task.discard;
      cb = (function(_this) {
        return function(err) {
          if (err) {
            _this.queue.pause();
            _this.queue.unshift(task);
          }
          return callback(err);
        };
      })(this);
      if (discard) {
        callback();
        return;
      }
      if (action === 'upload') {
        return transport.upload(localFilePath, cb);
      } else {
        return transport["delete"](localFilePath, cb);
      }
    };

    return UploadListener;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3JlbW90ZS1zeW5jL2xpYi9VcGxvYWRMaXN0ZW5lci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBOztFQUFBLFNBQUEsR0FBWTs7RUFDWixLQUFBLEdBQVE7O0VBRVIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7OzZCQUNKLFVBQUEsR0FBWSxTQUFDLGFBQUQsRUFBZ0IsU0FBaEI7YUFDVixJQUFDLENBQUEsWUFBRCxDQUFjLGFBQWQsRUFBNkIsU0FBN0IsRUFBd0MsUUFBeEM7SUFEVTs7NkJBR1osWUFBQSxHQUFjLFNBQUMsYUFBRCxFQUFnQixTQUFoQjthQUNaLElBQUMsQ0FBQSxZQUFELENBQWMsYUFBZCxFQUE2QixTQUE3QixFQUF3QyxRQUF4QztJQURZOzs2QkFHZCxZQUFBLEdBQWMsU0FBQyxhQUFELEVBQWdCLFNBQWhCLEVBQTJCLE1BQTNCO0FBQ1osVUFBQTtNQUFBLElBQUcsQ0FBSSxJQUFDLENBQUEsS0FBUjtRQUNFLElBQTJCLENBQUksS0FBL0I7VUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVIsRUFBUjs7UUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLElBQWxCLENBQVosRUFBa0MsQ0FBbEMsRUFGWDs7TUFLQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFBLENBQUg7UUFDRSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDckIsZUFBTSxJQUFOO1VBQ0MsSUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQVYsS0FBMkIsYUFBM0IsSUFBNEMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFWLEtBQW9CLE1BQWhFLElBQTBFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUE3QixLQUEwQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQXZJLElBQW9KLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUE3QixLQUF5QyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQWhOLElBQTROLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUE3QixLQUFxQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQXBSLElBQTRSLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUE3QixLQUF1QyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQXpWO1lBQ0UsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFWLEdBQW9CLEtBRHRCOztVQUVBLElBQUEsR0FBTyxJQUFJLENBQUM7UUFIYixDQUZGOztNQU9BLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFBO2FBRUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQ0U7UUFBQSxhQUFBLEVBQWUsYUFBZjtRQUNBLFNBQUEsRUFBVyxTQURYO1FBRUEsTUFBQSxFQUFRLE1BRlI7UUFHQSxPQUFBLEVBQVMsS0FIVDtPQURGO0lBZlk7OzZCQXFCZCxXQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sUUFBUDtBQUNYLFVBQUE7TUFBQyxrQ0FBRCxFQUFnQiwwQkFBaEIsRUFBMkIsb0JBQTNCLEVBQW1DO01BRW5DLEVBQUEsR0FBSyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtVQUNILElBQUcsR0FBSDtZQUNFLEtBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBO1lBQ0EsS0FBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQWUsSUFBZixFQUZGOztpQkFHQSxRQUFBLENBQVMsR0FBVDtRQUpHO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQU1MLElBQUcsT0FBSDtRQUNFLFFBQUEsQ0FBQTtBQUNBLGVBRkY7O01BSUEsSUFBRyxNQUFBLEtBQVUsUUFBYjtlQUNFLFNBQVMsQ0FBQyxNQUFWLENBQWlCLGFBQWpCLEVBQWdDLEVBQWhDLEVBREY7T0FBQSxNQUFBO2VBR0UsU0FBUyxFQUFDLE1BQUQsRUFBVCxDQUFpQixhQUFqQixFQUFnQyxFQUFoQyxFQUhGOztJQWJXOzs7OztBQWhDZiIsInNvdXJjZXNDb250ZW50IjpbIlxubWluaW1hdGNoID0gbnVsbFxuYXN5bmMgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFVwbG9hZExpc3RlbmVyXG4gIGhhbmRsZVNhdmU6IChsb2NhbEZpbGVQYXRoLCB0cmFuc3BvcnQpIC0+XG4gICAgQGhhbmRsZUFjdGlvbiBsb2NhbEZpbGVQYXRoLCB0cmFuc3BvcnQsICd1cGxvYWQnXG5cbiAgaGFuZGxlRGVsZXRlOiAobG9jYWxGaWxlUGF0aCwgdHJhbnNwb3J0KSAtPlxuICAgIEBoYW5kbGVBY3Rpb24gbG9jYWxGaWxlUGF0aCwgdHJhbnNwb3J0LCAnZGVsZXRlJ1xuXG4gIGhhbmRsZUFjdGlvbjogKGxvY2FsRmlsZVBhdGgsIHRyYW5zcG9ydCwgYWN0aW9uKSAtPlxuICAgIGlmIG5vdCBAcXVldWVcbiAgICAgIGFzeW5jID0gcmVxdWlyZSBcImFzeW5jXCIgaWYgbm90IGFzeW5jXG4gICAgICBAcXVldWUgPSBhc3luYy5xdWV1ZShAcHJvY2Vzc0ZpbGUuYmluZChAKSwgMSlcblxuXG4gICAgaWYgQHF1ZXVlLmxlbmd0aCgpXG4gICAgICB0YXNrID0gQHF1ZXVlLl90YXNrcy5oZWFkXG4gICAgICB3aGlsZSB0YXNrXG4gICAgICAgaWYgdGFzay5kYXRhLmxvY2FsRmlsZVBhdGggPT0gbG9jYWxGaWxlUGF0aCAmJiB0YXNrLmRhdGEuYWN0aW9uID09IGFjdGlvbiAmJiB0YXNrLmRhdGEudHJhbnNwb3J0LnNldHRpbmdzLnRyYW5zcG9ydCA9PSB0cmFuc3BvcnQuc2V0dGluZ3MudHJhbnNwb3J0ICYmIHRhc2suZGF0YS50cmFuc3BvcnQuc2V0dGluZ3MuaG9zdG5hbWUgPT0gdHJhbnNwb3J0LnNldHRpbmdzLmhvc3RuYW1lICYmIHRhc2suZGF0YS50cmFuc3BvcnQuc2V0dGluZ3MucG9ydCA9PSB0cmFuc3BvcnQuc2V0dGluZ3MucG9ydCAmJiB0YXNrLmRhdGEudHJhbnNwb3J0LnNldHRpbmdzLnRhcmdldCA9PSB0cmFuc3BvcnQuc2V0dGluZ3MudGFyZ2V0XG4gICAgICAgICB0YXNrLmRhdGEuZGlzY2FyZCA9IHRydWVcbiAgICAgICB0YXNrID0gdGFzay5uZXh0XG5cbiAgICBAcXVldWUucmVzdW1lKClcblxuICAgIEBxdWV1ZS5wdXNoXG4gICAgICBsb2NhbEZpbGVQYXRoOiBsb2NhbEZpbGVQYXRoXG4gICAgICB0cmFuc3BvcnQ6IHRyYW5zcG9ydFxuICAgICAgYWN0aW9uOiBhY3Rpb25cbiAgICAgIGRpc2NhcmQ6IGZhbHNlXG5cbiAgcHJvY2Vzc0ZpbGU6ICh0YXNrLCBjYWxsYmFjaykgLT5cbiAgICB7bG9jYWxGaWxlUGF0aCwgdHJhbnNwb3J0LCBhY3Rpb24sIGRpc2NhcmR9ID0gdGFza1xuXG4gICAgY2IgPSAoZXJyKSA9PlxuICAgICAgaWYgZXJyXG4gICAgICAgIEBxdWV1ZS5wYXVzZSgpXG4gICAgICAgIEBxdWV1ZS51bnNoaWZ0IHRhc2tcbiAgICAgIGNhbGxiYWNrKGVycilcblxuICAgIGlmIGRpc2NhcmRcbiAgICAgIGNhbGxiYWNrKClcbiAgICAgIHJldHVyblxuXG4gICAgaWYgYWN0aW9uID09ICd1cGxvYWQnXG4gICAgICB0cmFuc3BvcnQudXBsb2FkIGxvY2FsRmlsZVBhdGgsIGNiXG4gICAgZWxzZVxuICAgICAgdHJhbnNwb3J0LmRlbGV0ZSBsb2NhbEZpbGVQYXRoLCBjYlxuIl19
