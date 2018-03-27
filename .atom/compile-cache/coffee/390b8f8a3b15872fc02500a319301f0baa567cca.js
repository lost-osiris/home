(function() {
  var FTPConnection, FtpTransport, fs, mkdirp, path;

  FTPConnection = null;

  mkdirp = null;

  fs = null;

  path = require("path");

  module.exports = FtpTransport = (function() {
    function FtpTransport(logger, settings, projectPath) {
      this.logger = logger;
      this.settings = settings;
      this.projectPath = projectPath;
    }

    FtpTransport.prototype.dispose = function() {
      if (this.connection) {
        this.connection.end();
        return this.connection = null;
      }
    };

    FtpTransport.prototype["delete"] = function(localFilePath, callback) {
      var errorHandler, targetFilePath;
      targetFilePath = path.join(this.settings.target, path.relative(this.projectPath, localFilePath)).replace(/\\/g, "/");
      errorHandler = (function(_this) {
        return function(err) {
          _this.logger.error(err);
          return callback();
        };
      })(this);
      return this._getConnection((function(_this) {
        return function(err, c) {
          var end;
          if (err) {
            return errorHandler(err);
          }
          end = _this.logger.log("Remote delete: " + targetFilePath + " ...");
          return c["delete"](targetFilePath, function(err) {
            if (err) {
              return errorHandler(err);
            }
            end();
            return callback();
          });
        };
      })(this));
    };

    FtpTransport.prototype.upload = function(localFilePath, callback) {
      var errorHandler, targetFilePath;
      targetFilePath = path.join(this.settings.target, path.relative(this.projectPath, localFilePath)).replace(/\\/g, "/");
      errorHandler = (function(_this) {
        return function(err) {
          _this.logger.error(err);
          return callback();
        };
      })(this);
      return this._getConnection((function(_this) {
        return function(err, c) {
          var end, mpath;
          if (err) {
            return errorHandler(err);
          }
          end = _this.logger.log("Upload: " + localFilePath + " to " + targetFilePath + " ...");
          mpath = path.dirname(targetFilePath);
          return c.mkdir(mpath, true, function(err) {
            if (err && mpath !== "/") {
              return errorHandler(err);
            }
            return c.put(localFilePath, targetFilePath, function(err) {
              if (err) {
                return errorHandler(err);
              }
              end();
              return callback();
            });
          });
        };
      })(this));
    };

    FtpTransport.prototype.download = function(targetFilePath, localFilePath, callback) {
      var errorHandler;
      if (!localFilePath) {
        localFilePath = this.projectPath;
      }
      localFilePath = path.resolve(localFilePath, path.relative(this.settings.target, targetFilePath));
      errorHandler = (function(_this) {
        return function(err) {
          return _this.logger.error(err);
        };
      })(this);
      return this._getConnection((function(_this) {
        return function(err, c) {
          var end;
          if (err) {
            return errorHandler(err);
          }
          end = _this.logger.log("Download: " + targetFilePath + " to " + localFilePath + " ...");
          if (!mkdirp) {
            mkdirp = require("mkdirp");
          }
          return mkdirp(path.dirname(localFilePath), function(err) {
            if (err) {
              return errorHandler(err);
            }
            return c.get(targetFilePath, function(err, readableStream) {
              var writableStream;
              if (err) {
                return errorHandler(err);
              }
              if (!fs) {
                fs = require("fs-plus");
              }
              writableStream = fs.createWriteStream(localFilePath);
              writableStream.on("unpipe", function() {
                end();
                return typeof callback === "function" ? callback() : void 0;
              });
              return readableStream.pipe(writableStream);
            });
          });
        };
      })(this));
    };

    FtpTransport.prototype.fetchFileTree = function(localPath, callback) {
      var isIgnore, targetPath;
      targetPath = path.join(this.settings.target, path.relative(this.projectPath, localPath)).replace(/\\/g, "/");
      isIgnore = this.settings.isIgnore;
      return this._getConnection(function(err, c) {
        var directories, directory, files;
        if (err) {
          return callback(err);
        }
        files = [];
        directories = 0;
        directory = function(dir) {
          directories++;
          return c.list(dir, function(err, list) {
            if (err) {
              return callback(err);
            }
            if (list != null) {
              list.forEach(function(item, i) {
                var ref;
                if (item.type === "-" && !isIgnore(item.name, dir)) {
                  files.push(dir + "/" + item.name);
                }
                if (item.type === "d" && ((ref = item.name) !== "." && ref !== "..")) {
                  return directory(dir + "/" + item.name);
                }
              });
            }
            directories--;
            if (directories === 0) {
              return callback(null, files);
            }
          });
        };
        return directory(targetPath);
      });
    };

    FtpTransport.prototype._getConnection = function(callback) {
      var FtpConnection, connection, hostname, password, port, ref, secure, username, wasReady;
      ref = this.settings, hostname = ref.hostname, port = ref.port, username = ref.username, password = ref.password, secure = ref.secure;
      if (this.connection) {
        return callback(null, this.connection);
      }
      this.logger.log("Connecting: " + username + "@" + hostname + ":" + port);
      if (!FtpConnection) {
        FtpConnection = require("ftp");
      }
      connection = new FtpConnection;
      wasReady = false;
      connection.on("ready", function() {
        wasReady = true;
        return callback(null, connection);
      });
      connection.on("error", (function(_this) {
        return function(err) {
          if (!wasReady) {
            callback(err);
          }
          return _this.connection = null;
        };
      })(this));
      connection.on("end", (function(_this) {
        return function() {
          return _this.connection = null;
        };
      })(this));
      connection.connect({
        host: hostname,
        port: port,
        user: username,
        password: password,
        secure: secure
      });
      return this.connection = connection;
    };

    return FtpTransport;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3JlbW90ZS1zeW5jL2xpYi90cmFuc3BvcnRzL0Z0cFRyYW5zcG9ydC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGFBQUEsR0FBZ0I7O0VBQ2hCLE1BQUEsR0FBUzs7RUFDVCxFQUFBLEdBQUs7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxzQkFBQyxNQUFELEVBQVUsUUFBVixFQUFxQixXQUFyQjtNQUFDLElBQUMsQ0FBQSxTQUFEO01BQVMsSUFBQyxDQUFBLFdBQUQ7TUFBVyxJQUFDLENBQUEsY0FBRDtJQUFyQjs7MkJBRWIsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFHLElBQUMsQ0FBQSxVQUFKO1FBQ0UsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQUE7ZUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBRmhCOztJQURPOzs0QkFLVCxRQUFBLEdBQVEsU0FBQyxhQUFELEVBQWdCLFFBQWhCO0FBQ04sVUFBQTtNQUFBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQXBCLEVBQ1csSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFDLENBQUEsV0FBZixFQUE0QixhQUE1QixDQURYLENBRVcsQ0FBQyxPQUZaLENBRW9CLEtBRnBCLEVBRTJCLEdBRjNCO01BSWpCLFlBQUEsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtVQUNiLEtBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFjLEdBQWQ7aUJBQ0EsUUFBQSxDQUFBO1FBRmE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO2FBSWYsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQsRUFBTSxDQUFO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QUFoQixFQURUOztNQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLGNBQUEsR0FBZSxRQUFmLEdBQXdCLEdBQXhCLEdBQTJCLFFBQTNCLEdBQW9DLEdBQXBDLEdBQXVDLElBQW5EO01BRUEsSUFBaUMsQ0FBSSxhQUFyQztRQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLEtBQVIsRUFBaEI7O01BRUEsVUFBQSxHQUFhLElBQUk7TUFDakIsUUFBQSxHQUFXO01BRVgsVUFBVSxDQUFDLEVBQVgsQ0FBYyxPQUFkLEVBQXVCLFNBQUE7UUFDckIsUUFBQSxHQUFXO2VBQ1gsUUFBQSxDQUFTLElBQVQsRUFBZSxVQUFmO01BRnFCLENBQXZCO01BSUEsVUFBVSxDQUFDLEVBQVgsQ0FBYyxPQUFkLEVBQXVCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO1VBQ3JCLElBQUEsQ0FBTyxRQUFQO1lBQ0UsUUFBQSxDQUFTLEdBQVQsRUFERjs7aUJBRUEsS0FBQyxDQUFBLFVBQUQsR0FBYztRQUhPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QjtNQUtBLFVBQVUsQ0FBQyxFQUFYLENBQWMsS0FBZCxFQUFxQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ25CLEtBQUMsQ0FBQSxVQUFELEdBQWM7UUFESztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckI7TUFHQSxVQUFVLENBQUMsT0FBWCxDQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxJQUFBLEVBQU0sSUFETjtRQUVBLElBQUEsRUFBTSxRQUZOO1FBR0EsUUFBQSxFQUFVLFFBSFY7UUFJQSxNQUFBLEVBQVEsTUFKUjtPQURGO2FBT0EsSUFBQyxDQUFBLFVBQUQsR0FBYztJQWhDQTs7Ozs7QUFuSGxCIiwic291cmNlc0NvbnRlbnQiOlsiRlRQQ29ubmVjdGlvbiA9IG51bGxcbm1rZGlycCA9IG51bGxcbmZzID0gbnVsbFxucGF0aCA9IHJlcXVpcmUgXCJwYXRoXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRnRwVHJhbnNwb3J0XG4gIGNvbnN0cnVjdG9yOiAoQGxvZ2dlciwgQHNldHRpbmdzLCBAcHJvamVjdFBhdGgpIC0+XG5cbiAgZGlzcG9zZTogLT5cbiAgICBpZiBAY29ubmVjdGlvblxuICAgICAgQGNvbm5lY3Rpb24uZW5kKClcbiAgICAgIEBjb25uZWN0aW9uID0gbnVsbFxuXG4gIGRlbGV0ZTogKGxvY2FsRmlsZVBhdGgsIGNhbGxiYWNrKSAtPlxuICAgIHRhcmdldEZpbGVQYXRoID0gcGF0aC5qb2luKEBzZXR0aW5ncy50YXJnZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgucmVsYXRpdmUoQHByb2plY3RQYXRoLCBsb2NhbEZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpXG5cbiAgICBlcnJvckhhbmRsZXIgPSAoZXJyKSA9PlxuICAgICAgQGxvZ2dlci5lcnJvciBlcnJcbiAgICAgIGNhbGxiYWNrKClcblxuICAgIEBfZ2V0Q29ubmVjdGlvbiAoZXJyLCBjKSA9PlxuICAgICAgcmV0dXJuIGVycm9ySGFuZGxlciBlcnIgaWYgZXJyXG5cbiAgICAgIGVuZCA9IEBsb2dnZXIubG9nIFwiUmVtb3RlIGRlbGV0ZTogI3t0YXJnZXRGaWxlUGF0aH0gLi4uXCJcblxuICAgICAgYy5kZWxldGUgdGFyZ2V0RmlsZVBhdGgsIChlcnIpIC0+XG4gICAgICAgIHJldHVybiBlcnJvckhhbmRsZXIgZXJyIGlmIGVyclxuXG4gICAgICAgIGVuZCgpXG5cbiAgICAgICAgY2FsbGJhY2soKVxuXG4gIHVwbG9hZDogKGxvY2FsRmlsZVBhdGgsIGNhbGxiYWNrKSAtPlxuICAgIHRhcmdldEZpbGVQYXRoID0gcGF0aC5qb2luKEBzZXR0aW5ncy50YXJnZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgucmVsYXRpdmUoQHByb2plY3RQYXRoLCBsb2NhbEZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpXG5cbiAgICBlcnJvckhhbmRsZXIgPSAoZXJyKSA9PlxuICAgICAgQGxvZ2dlci5lcnJvciBlcnJcbiAgICAgIGNhbGxiYWNrKClcblxuICAgIEBfZ2V0Q29ubmVjdGlvbiAoZXJyLCBjKSA9PlxuICAgICAgcmV0dXJuIGVycm9ySGFuZGxlciBlcnIgaWYgZXJyXG5cbiAgICAgIGVuZCA9IEBsb2dnZXIubG9nIFwiVXBsb2FkOiAje2xvY2FsRmlsZVBhdGh9IHRvICN7dGFyZ2V0RmlsZVBhdGh9IC4uLlwiXG4gICAgICBtcGF0aCA9IHBhdGguZGlybmFtZSh0YXJnZXRGaWxlUGF0aClcblxuICAgICAgYy5ta2RpciBtcGF0aCwgdHJ1ZSwgKGVycikgLT5cbiAgICAgICAgcmV0dXJuIGVycm9ySGFuZGxlciBlcnIgaWYgZXJyIGFuZCBtcGF0aCAhPSBcIi9cIlxuXG4gICAgICAgIGMucHV0IGxvY2FsRmlsZVBhdGgsIHRhcmdldEZpbGVQYXRoLCAoZXJyKSAtPlxuICAgICAgICAgIHJldHVybiBlcnJvckhhbmRsZXIgZXJyIGlmIGVyclxuXG4gICAgICAgICAgZW5kKClcblxuICAgICAgICAgIGNhbGxiYWNrKClcblxuICBkb3dubG9hZDogKHRhcmdldEZpbGVQYXRoLCBsb2NhbEZpbGVQYXRoLCBjYWxsYmFjaykgLT5cbiAgICBpZiBub3QgbG9jYWxGaWxlUGF0aFxuICAgICAgbG9jYWxGaWxlUGF0aCA9IEBwcm9qZWN0UGF0aFxuXG4gICAgbG9jYWxGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShsb2NhbEZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLnJlbGF0aXZlKEBzZXR0aW5ncy50YXJnZXQsIHRhcmdldEZpbGVQYXRoKSlcblxuICAgIGVycm9ySGFuZGxlciA9IChlcnIpID0+XG4gICAgICBAbG9nZ2VyLmVycm9yIGVyclxuXG4gICAgQF9nZXRDb25uZWN0aW9uIChlcnIsIGMpID0+XG4gICAgICByZXR1cm4gZXJyb3JIYW5kbGVyIGVyciBpZiBlcnJcblxuICAgICAgZW5kID0gQGxvZ2dlci5sb2cgXCJEb3dubG9hZDogI3t0YXJnZXRGaWxlUGF0aH0gdG8gI3tsb2NhbEZpbGVQYXRofSAuLi5cIlxuXG4gICAgICBta2RpcnAgPSByZXF1aXJlIFwibWtkaXJwXCIgaWYgbm90IG1rZGlycFxuICAgICAgbWtkaXJwIHBhdGguZGlybmFtZShsb2NhbEZpbGVQYXRoKSwgKGVycikgLT5cbiAgICAgICAgcmV0dXJuIGVycm9ySGFuZGxlciBlcnIgaWYgZXJyXG5cbiAgICAgICAgYy5nZXQgdGFyZ2V0RmlsZVBhdGgsIChlcnIsIHJlYWRhYmxlU3RyZWFtKSAtPlxuICAgICAgICAgIHJldHVybiBlcnJvckhhbmRsZXIgZXJyIGlmIGVyclxuXG4gICAgICAgICAgZnMgPSByZXF1aXJlIFwiZnMtcGx1c1wiIGlmIG5vdCBmc1xuICAgICAgICAgIHdyaXRhYmxlU3RyZWFtID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0obG9jYWxGaWxlUGF0aClcbiAgICAgICAgICB3cml0YWJsZVN0cmVhbS5vbiBcInVucGlwZVwiLCAtPlxuICAgICAgICAgICAgZW5kKClcbiAgICAgICAgICAgIGNhbGxiYWNrPygpXG4gICAgICAgICAgcmVhZGFibGVTdHJlYW0ucGlwZSB3cml0YWJsZVN0cmVhbVxuXG4gIGZldGNoRmlsZVRyZWU6IChsb2NhbFBhdGgsIGNhbGxiYWNrKSAtPlxuICAgIHRhcmdldFBhdGggPSBwYXRoLmpvaW4oQHNldHRpbmdzLnRhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5yZWxhdGl2ZShAcHJvamVjdFBhdGgsIGxvY2FsUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKVxuICAgIGlzSWdub3JlID0gQHNldHRpbmdzLmlzSWdub3JlXG5cbiAgICBAX2dldENvbm5lY3Rpb24gKGVyciwgYykgLT5cbiAgICAgIHJldHVybiBjYWxsYmFjayBlcnIgaWYgZXJyXG5cbiAgICAgIGZpbGVzID0gW11cbiAgICAgIGRpcmVjdG9yaWVzID0gMFxuXG4gICAgICBkaXJlY3RvcnkgPSAoZGlyKSAtPlxuICAgICAgICBkaXJlY3RvcmllcysrXG4gICAgICAgIGMubGlzdCBkaXIsIChlcnIsIGxpc3QpIC0+XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrIGVyciBpZiBlcnJcblxuICAgICAgICAgIGxpc3Q/LmZvckVhY2ggKGl0ZW0sIGkpIC0+XG4gICAgICAgICAgICBmaWxlcy5wdXNoIGRpciArIFwiL1wiICsgaXRlbS5uYW1lIGlmIGl0ZW0udHlwZSBpcyBcIi1cIiBhbmQgbm90IGlzSWdub3JlKGl0ZW0ubmFtZSwgZGlyKVxuICAgICAgICAgICAgZGlyZWN0b3J5IGRpciArIFwiL1wiICsgaXRlbS5uYW1lIGlmIGl0ZW0udHlwZSBpcyBcImRcIiBhbmQgaXRlbS5uYW1lIG5vdCBpbiBbXCIuXCIsIFwiLi5cIl1cblxuICAgICAgICAgIGRpcmVjdG9yaWVzLS1cbiAgICAgICAgICBjYWxsYmFjayBudWxsLCBmaWxlcyAgaWYgZGlyZWN0b3JpZXMgaXMgMFxuXG4gICAgICBkaXJlY3RvcnkodGFyZ2V0UGF0aClcblxuICBfZ2V0Q29ubmVjdGlvbjogKGNhbGxiYWNrKSAtPlxuICAgIHtob3N0bmFtZSwgcG9ydCwgdXNlcm5hbWUsIHBhc3N3b3JkLCBzZWN1cmV9ID0gQHNldHRpbmdzXG5cbiAgICBpZiBAY29ubmVjdGlvblxuICAgICAgcmV0dXJuIGNhbGxiYWNrIG51bGwsIEBjb25uZWN0aW9uXG5cbiAgICBAbG9nZ2VyLmxvZyBcIkNvbm5lY3Rpbmc6ICN7dXNlcm5hbWV9QCN7aG9zdG5hbWV9OiN7cG9ydH1cIlxuXG4gICAgRnRwQ29ubmVjdGlvbiA9IHJlcXVpcmUgXCJmdHBcIiBpZiBub3QgRnRwQ29ubmVjdGlvblxuXG4gICAgY29ubmVjdGlvbiA9IG5ldyBGdHBDb25uZWN0aW9uXG4gICAgd2FzUmVhZHkgPSBmYWxzZVxuXG4gICAgY29ubmVjdGlvbi5vbiBcInJlYWR5XCIsIC0+XG4gICAgICB3YXNSZWFkeSA9IHRydWVcbiAgICAgIGNhbGxiYWNrIG51bGwsIGNvbm5lY3Rpb25cblxuICAgIGNvbm5lY3Rpb24ub24gXCJlcnJvclwiLCAoZXJyKSA9PlxuICAgICAgdW5sZXNzIHdhc1JlYWR5XG4gICAgICAgIGNhbGxiYWNrIGVyclxuICAgICAgQGNvbm5lY3Rpb24gPSBudWxsXG5cbiAgICBjb25uZWN0aW9uLm9uIFwiZW5kXCIsID0+XG4gICAgICBAY29ubmVjdGlvbiA9IG51bGxcblxuICAgIGNvbm5lY3Rpb24uY29ubmVjdFxuICAgICAgaG9zdDogaG9zdG5hbWVcbiAgICAgIHBvcnQ6IHBvcnRcbiAgICAgIHVzZXI6IHVzZXJuYW1lXG4gICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgIHNlY3VyZTogc2VjdXJlXG5cbiAgICBAY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25cbiJdfQ==
