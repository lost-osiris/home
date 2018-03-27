(function() {
  var SSHConnection, ScpTransport, fs, mkdirp, path;

  SSHConnection = null;

  mkdirp = null;

  fs = null;

  path = require("path");

  module.exports = ScpTransport = (function() {
    function ScpTransport(logger, settings, projectPath) {
      this.logger = logger;
      this.settings = settings;
      this.projectPath = projectPath;
    }

    ScpTransport.prototype.dispose = function() {
      if (this.connection) {
        this.connection.end();
        return this.connection = null;
      }
    };

    ScpTransport.prototype["delete"] = function(localFilePath, callback) {
      var errorHandler, targetFilePath;
      targetFilePath = path.join(this.settings.target, path.relative(this.projectPath, localFilePath)).replace(/\\/g, "/");
      errorHandler = (function(_this) {
        return function(err) {
          _this.logger.error(err);
          return callback(err);
        };
      })(this);
      return this._getConnection((function(_this) {
        return function(err, c) {
          var end;
          if (err) {
            return errorHandler(err);
          }
          end = _this.logger.log("Remote delete: " + targetFilePath + " ...");
          return c.sftp(function(err, sftp) {
            if (err) {
              return errorHandler(err);
            }
            return c.exec("rm -rf \"" + targetFilePath + "\"", function(err) {
              if (err) {
                return errorHandler(err);
              }
              end();
              sftp.end();
              return callback();
            });
          });
        };
      })(this));
    };

    ScpTransport.prototype.upload = function(localFilePath, callback) {
      var errorHandler, targetFilePath;
      if (!fs) {
        fs = require("fs");
      }
      if (!fs.existsSync(localFilePath)) {
        callback();
        return false;
      }
      targetFilePath = path.join(this.settings.target, path.relative(fs.realpathSync(this.projectPath), fs.realpathSync(localFilePath))).replace(/\\/g, "/");
      errorHandler = (function(_this) {
        return function(err) {
          _this.logger.error(err);
          return callback(err);
        };
      })(this);
      return this._getConnection((function(_this) {
        return function(err, c) {
          var end;
          if (err) {
            return errorHandler(err);
          }
          end = _this.logger.log("Upload: " + localFilePath + " to " + targetFilePath + " ...");
          return c.exec("mkdir -p \"" + (path.dirname(targetFilePath)) + "\"", function(err) {
            if (err) {
              return errorHandler(err);
            }
            return c.sftp(function(err, sftp) {
              var uploadFilePath;
              if (err) {
                return errorHandler(err);
              }
              uploadFilePath = _this.settings.useAtomicWrites ? targetFilePath + ".temp" : "" + targetFilePath;
              return sftp.fastPut(localFilePath, uploadFilePath, function(err) {
                if (err) {
                  return errorHandler(err);
                }
                sftp.end();
                if (_this.settings.useAtomicWrites) {
                  return c.exec("cp \"" + uploadFilePath + "\" \"" + targetFilePath + "\"; rm \"" + uploadFilePath + "\"", function(err) {
                    if (err) {
                      return errorHandler(err);
                    }
                    end();
                    return callback();
                  });
                } else {
                  end();
                  return callback();
                }
              });
            });
          });
        };
      })(this));
    };

    ScpTransport.prototype.download = function(targetFilePath, localFilePath, callback) {
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
          return c.sftp(function(err, sftp) {
            if (err) {
              return errorHandler(err);
            }
            if (!mkdirp) {
              mkdirp = require("mkdirp");
            }
            return mkdirp(path.dirname(localFilePath), function(err) {
              if (err) {
                return errorHandler(err);
              }
              return sftp.fastGet(targetFilePath, localFilePath, function(err) {
                if (err) {
                  return errorHandler(err);
                }
                end();
                sftp.end();
                return typeof callback === "function" ? callback() : void 0;
              });
            });
          });
        };
      })(this));
    };

    ScpTransport.prototype.fetchFileTree = function(localPath, callback) {
      var isIgnore, ref, target, targetPath;
      ref = this.settings, target = ref.target, isIgnore = ref.isIgnore;
      targetPath = path.join(target, path.relative(this.projectPath, localPath)).replace(/\\/g, "/");
      return this._getConnection(function(err, c) {
        if (err) {
          return callback(err);
        }
        return c.exec("find \"" + targetPath + "\" -type f", function(err, result) {
          var buf;
          if (err) {
            return callback(err);
          }
          buf = "";
          result.on("data", function(data) {
            return buf += data.toString();
          });
          return result.on("end", function() {
            var files;
            files = buf.split("\n").filter(function(f) {
              return f && !isIgnore(f, target);
            });
            return callback(null, files);
          });
        });
      });
    };

    ScpTransport.prototype._getConnection = function(callback) {
      var agent, connection, err, hostname, keyfile, passphrase, password, port, privateKey, readyTimeout, ref, useAgent, username, wasReady;
      ref = this.settings, hostname = ref.hostname, port = ref.port, username = ref.username, password = ref.password, keyfile = ref.keyfile, useAgent = ref.useAgent, passphrase = ref.passphrase, readyTimeout = ref.readyTimeout;
      if (this.connection) {
        return callback(null, this.connection);
      }
      this.logger.log("Connecting: " + username + "@" + hostname + ":" + port);
      if (!SSHConnection) {
        SSHConnection = require("ssh2");
      }
      connection = new SSHConnection;
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
      if (keyfile) {
        if (!fs) {
          fs = require("fs");
        }
        try {
          privateKey = fs.readFileSync(keyfile);
        } catch (error) {
          err = error;
          callback(err);
          return false;
        }
      } else {
        privateKey = null;
      }
      agent = (function() {
        switch (false) {
          case useAgent !== true:
            if (/windows/i.test(process.env['OS'])) {
              return process.env['SSH_AUTH_SOCK'] || "pageant";
            } else {
              return process.env['SSH_AUTH_SOCK'] || null;
            }
            break;
          case typeof useAgent !== "string":
            return useAgent;
          default:
            return null;
        }
      })();
      connection.connect({
        host: hostname,
        port: port,
        username: username,
        password: password,
        privateKey: privateKey,
        passphrase: passphrase,
        readyTimeout: readyTimeout,
        agent: agent
      });
      return this.connection = connection;
    };

    return ScpTransport;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3JlbW90ZS1zeW5jL2xpYi90cmFuc3BvcnRzL1NjcFRyYW5zcG9ydC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGFBQUEsR0FBZ0I7O0VBQ2hCLE1BQUEsR0FBUzs7RUFDVCxFQUFBLEdBQUs7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxzQkFBQyxNQUFELEVBQVUsUUFBVixFQUFxQixXQUFyQjtNQUFDLElBQUMsQ0FBQSxTQUFEO01BQVMsSUFBQyxDQUFBLFdBQUQ7TUFBVyxJQUFDLENBQUEsY0FBRDtJQUFyQjs7MkJBRWIsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFHLElBQUMsQ0FBQSxVQUFKO1FBQ0UsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQUE7ZUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBRmhCOztJQURPOzs0QkFLVCxRQUFBLEdBQVEsU0FBQyxhQUFELEVBQWdCLFFBQWhCO0FBQ04sVUFBQTtNQUFBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQXBCLEVBQ0ssSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFDLENBQUEsV0FBZixFQUE0QixhQUE1QixDQURMLENBRUssQ0FBQyxPQUZOLENBRWMsS0FGZCxFQUVxQixHQUZyQjtNQUlqQixZQUFBLEdBQWUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7VUFDYixLQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBYyxHQUFkO2lCQUNBLFFBQUEsQ0FBUyxHQUFUO1FBRmE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO2FBSWYsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQsRUFBTSxD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VUFBQSxFQUFZLFVBSlo7UUFLQSxVQUFBLEVBQVksVUFMWjtRQU1BLFlBQUEsRUFBYyxZQU5kO1FBT0EsS0FBQSxFQUFPLEtBUFA7T0FERjthQVVBLElBQUMsQ0FBQSxVQUFELEdBQWM7SUF4REE7Ozs7O0FBcElsQiIsInNvdXJjZXNDb250ZW50IjpbIlNTSENvbm5lY3Rpb24gPSBudWxsXG5ta2RpcnAgPSBudWxsXG5mcyA9IG51bGxcbnBhdGggPSByZXF1aXJlIFwicGF0aFwiXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFNjcFRyYW5zcG9ydFxuICBjb25zdHJ1Y3RvcjogKEBsb2dnZXIsIEBzZXR0aW5ncywgQHByb2plY3RQYXRoKSAtPlxuXG4gIGRpc3Bvc2U6IC0+XG4gICAgaWYgQGNvbm5lY3Rpb25cbiAgICAgIEBjb25uZWN0aW9uLmVuZCgpXG4gICAgICBAY29ubmVjdGlvbiA9IG51bGxcblxuICBkZWxldGU6IChsb2NhbEZpbGVQYXRoLCBjYWxsYmFjaykgLT5cbiAgICB0YXJnZXRGaWxlUGF0aCA9IHBhdGguam9pbihAc2V0dGluZ3MudGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLnJlbGF0aXZlKEBwcm9qZWN0UGF0aCwgbG9jYWxGaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKVxuXG4gICAgZXJyb3JIYW5kbGVyID0gKGVycikgPT5cbiAgICAgIEBsb2dnZXIuZXJyb3IgZXJyXG4gICAgICBjYWxsYmFjayhlcnIpXG5cbiAgICBAX2dldENvbm5lY3Rpb24gKGVyciwgYykgPT5cbiAgICAgIHJldHVybiBlcnJvckhhbmRsZXIgZXJyIGlmIGVyclxuXG4gICAgICBlbmQgPSBAbG9nZ2VyLmxvZyBcIlJlbW90ZSBkZWxldGU6ICN7dGFyZ2V0RmlsZVBhdGh9IC4uLlwiXG5cbiAgICAgIGMuc2Z0cCAoZXJyLCBzZnRwKSAtPlxuICAgICAgICByZXR1cm4gZXJyb3JIYW5kbGVyIGVyciBpZiBlcnJcblxuICAgICAgICBjLmV4ZWMgXCJybSAtcmYgXFxcIiN7dGFyZ2V0RmlsZVBhdGh9XFxcIlwiLCAoZXJyKSAtPlxuICAgICAgICAgIHJldHVybiBlcnJvckhhbmRsZXIgZXJyIGlmIGVyclxuXG4gICAgICAgICAgZW5kKClcbiAgICAgICAgICBzZnRwLmVuZCgpXG4gICAgICAgICAgY2FsbGJhY2soKVxuXG4gIHVwbG9hZDogKGxvY2FsRmlsZVBhdGgsIGNhbGxiYWNrKSAtPlxuICAgIGZzID0gcmVxdWlyZSBcImZzXCIgaWYgbm90IGZzXG5cbiAgICBpZiBub3QgZnMuZXhpc3RzU3luYyBsb2NhbEZpbGVQYXRoXG4gICAgICBjYWxsYmFjaygpXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIHRhcmdldEZpbGVQYXRoID0gcGF0aC5qb2luKEBzZXR0aW5ncy50YXJnZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgucmVsYXRpdmUoZnMucmVhbHBhdGhTeW5jKEBwcm9qZWN0UGF0aCksIGZzLnJlYWxwYXRoU3luYyhsb2NhbEZpbGVQYXRoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKVxuXG4gICAgZXJyb3JIYW5kbGVyID0gKGVycikgPT5cbiAgICAgIEBsb2dnZXIuZXJyb3IgZXJyXG4gICAgICBjYWxsYmFjayhlcnIpXG5cbiAgICBAX2dldENvbm5lY3Rpb24gKGVyciwgYykgPT5cbiAgICAgIHJldHVybiBlcnJvckhhbmRsZXIgZXJyIGlmIGVyclxuXG4gICAgICBlbmQgPSBAbG9nZ2VyLmxvZyBcIlVwbG9hZDogI3tsb2NhbEZpbGVQYXRofSB0byAje3RhcmdldEZpbGVQYXRofSAuLi5cIlxuXG4gICAgICBjLmV4ZWMgXCJta2RpciAtcCBcXFwiI3twYXRoLmRpcm5hbWUodGFyZ2V0RmlsZVBhdGgpfVxcXCJcIiwgKGVycikgPT5cbiAgICAgICAgcmV0dXJuIGVycm9ySGFuZGxlciBlcnIgaWYgZXJyXG5cbiAgICAgICAgYy5zZnRwIChlcnIsIHNmdHApID0+XG4gICAgICAgICAgcmV0dXJuIGVycm9ySGFuZGxlciBlcnIgaWYgZXJyXG5cblxuICAgICAgICAgIHVwbG9hZEZpbGVQYXRoID0gaWYgQHNldHRpbmdzLnVzZUF0b21pY1dyaXRlcyB0aGVuIFwiI3t0YXJnZXRGaWxlUGF0aH0udGVtcFwiIGVsc2UgXCIje3RhcmdldEZpbGVQYXRofVwiXG5cbiAgICAgICAgICBzZnRwLmZhc3RQdXQgbG9jYWxGaWxlUGF0aCwgdXBsb2FkRmlsZVBhdGgsIChlcnIpID0+XG4gICAgICAgICAgICByZXR1cm4gZXJyb3JIYW5kbGVyIGVyciBpZiBlcnJcblxuICAgICAgICAgICAgc2Z0cC5lbmQoKVxuXG4gICAgICAgICAgICBpZiBAc2V0dGluZ3MudXNlQXRvbWljV3JpdGVzXG4gICAgICAgICAgICAgIGMuZXhlYyBcImNwIFxcXCIje3VwbG9hZEZpbGVQYXRofVxcXCIgXFxcIiN7dGFyZ2V0RmlsZVBhdGh9XFxcIjsgcm0gXFxcIiN7dXBsb2FkRmlsZVBhdGh9XFxcIlwiLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvckhhbmRsZXIgZXJyIGlmIGVyclxuICAgICAgICAgICAgICAgIGVuZCgpXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBlbmQoKVxuICAgICAgICAgICAgICBjYWxsYmFjaygpXG5cbiAgZG93bmxvYWQ6ICh0YXJnZXRGaWxlUGF0aCwgbG9jYWxGaWxlUGF0aCwgY2FsbGJhY2spIC0+XG4gICAgaWYgbm90IGxvY2FsRmlsZVBhdGhcbiAgICAgIGxvY2FsRmlsZVBhdGggPSBAcHJvamVjdFBhdGhcblxuICAgIGxvY2FsRmlsZVBhdGggPSBwYXRoLnJlc29sdmUobG9jYWxGaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5yZWxhdGl2ZShAc2V0dGluZ3MudGFyZ2V0LCB0YXJnZXRGaWxlUGF0aCkpXG5cbiAgICBlcnJvckhhbmRsZXIgPSAoZXJyKSA9PlxuICAgICAgQGxvZ2dlci5lcnJvciBlcnJcblxuICAgIEBfZ2V0Q29ubmVjdGlvbiAoZXJyLCBjKSA9PlxuICAgICAgcmV0dXJuIGVycm9ySGFuZGxlciBlcnIgaWYgZXJyXG5cbiAgICAgIGVuZCA9IEBsb2dnZXIubG9nIFwiRG93bmxvYWQ6ICN7dGFyZ2V0RmlsZVBhdGh9IHRvICN7bG9jYWxGaWxlUGF0aH0gLi4uXCJcblxuICAgICAgYy5zZnRwIChlcnIsIHNmdHApIC0+XG4gICAgICAgIHJldHVybiBlcnJvckhhbmRsZXIgZXJyIGlmIGVyclxuICAgICAgICBta2RpcnAgPSByZXF1aXJlIFwibWtkaXJwXCIgaWYgbm90IG1rZGlycFxuICAgICAgICBta2RpcnAgcGF0aC5kaXJuYW1lKGxvY2FsRmlsZVBhdGgpLCAoZXJyKSAtPlxuICAgICAgICAgIHJldHVybiBlcnJvckhhbmRsZXIgZXJyIGlmIGVyclxuXG4gICAgICAgICAgc2Z0cC5mYXN0R2V0IHRhcmdldEZpbGVQYXRoLCBsb2NhbEZpbGVQYXRoLCAoZXJyKSAtPlxuICAgICAgICAgICAgcmV0dXJuIGVycm9ySGFuZGxlciBlcnIgaWYgZXJyXG5cbiAgICAgICAgICAgIGVuZCgpXG5cbiAgICAgICAgICAgIHNmdHAuZW5kKClcbiAgICAgICAgICAgIGNhbGxiYWNrPygpXG5cbiAgZmV0Y2hGaWxlVHJlZTogKGxvY2FsUGF0aCwgY2FsbGJhY2spIC0+XG4gICAge3RhcmdldCwgaXNJZ25vcmV9ID0gQHNldHRpbmdzXG5cbiAgICB0YXJnZXRQYXRoID0gcGF0aC5qb2luKHRhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5yZWxhdGl2ZShAcHJvamVjdFBhdGgsIGxvY2FsUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKVxuXG5cbiAgICBAX2dldENvbm5lY3Rpb24gKGVyciwgYykgLT5cbiAgICAgIHJldHVybiBjYWxsYmFjayBlcnIgaWYgZXJyXG5cbiAgICAgIGMuZXhlYyBcImZpbmQgXFxcIiN7dGFyZ2V0UGF0aH1cXFwiIC10eXBlIGZcIiwgKGVyciwgcmVzdWx0KSAtPlxuICAgICAgICByZXR1cm4gY2FsbGJhY2sgZXJyIGlmIGVyclxuXG4gICAgICAgIGJ1ZiA9IFwiXCJcbiAgICAgICAgcmVzdWx0Lm9uIFwiZGF0YVwiLCAoZGF0YSkgLT4gYnVmICs9IGRhdGEudG9TdHJpbmcoKVxuICAgICAgICByZXN1bHQub24gXCJlbmRcIiwgLT5cbiAgICAgICAgICBmaWxlcyA9IGJ1Zi5zcGxpdChcIlxcblwiKS5maWx0ZXIoKGYpIC0+XG4gICAgICAgICAgICByZXR1cm4gZiBhbmQgbm90IGlzSWdub3JlKGYsIHRhcmdldCkpXG5cbiAgICAgICAgICBjYWxsYmFjayBudWxsLCBmaWxlc1xuXG4gIF9nZXRDb25uZWN0aW9uOiAoY2FsbGJhY2spIC0+XG4gICAge2hvc3RuYW1lLCBwb3J0LCB1c2VybmFtZSwgcGFzc3dvcmQsIGtleWZpbGUsIHVzZUFnZW50LCBwYXNzcGhyYXNlLCByZWFkeVRpbWVvdXR9ID0gQHNldHRpbmdzXG5cbiAgICBpZiBAY29ubmVjdGlvblxuICAgICAgcmV0dXJuIGNhbGxiYWNrIG51bGwsIEBjb25uZWN0aW9uXG5cbiAgICBAbG9nZ2VyLmxvZyBcIkNvbm5lY3Rpbmc6ICN7dXNlcm5hbWV9QCN7aG9zdG5hbWV9OiN7cG9ydH1cIlxuXG4gICAgU1NIQ29ubmVjdGlvbiA9IHJlcXVpcmUgXCJzc2gyXCIgaWYgbm90IFNTSENvbm5lY3Rpb25cblxuICAgIGNvbm5lY3Rpb24gPSBuZXcgU1NIQ29ubmVjdGlvblxuICAgIHdhc1JlYWR5ID0gZmFsc2VcblxuICAgIGNvbm5lY3Rpb24ub24gXCJyZWFkeVwiLCAtPlxuICAgICAgd2FzUmVhZHkgPSB0cnVlXG4gICAgICBjYWxsYmFjayBudWxsLCBjb25uZWN0aW9uXG5cbiAgICBjb25uZWN0aW9uLm9uIFwiZXJyb3JcIiwgKGVycikgPT5cbiAgICAgIHVubGVzcyB3YXNSZWFkeVxuICAgICAgICBjYWxsYmFjayBlcnJcbiAgICAgIEBjb25uZWN0aW9uID0gbnVsbFxuXG4gICAgY29ubmVjdGlvbi5vbiBcImVuZFwiLCA9PlxuICAgICAgQGNvbm5lY3Rpb24gPSBudWxsXG5cbiAgICBpZiBrZXlmaWxlXG4gICAgICBmcyA9IHJlcXVpcmUgXCJmc1wiIGlmIG5vdCBmc1xuICAgICAgdHJ5XG4gICAgICAgIHByaXZhdGVLZXkgPSBmcy5yZWFkRmlsZVN5bmMga2V5ZmlsZVxuICAgICAgY2F0Y2ggZXJyXG4gICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBlbHNlXG4gICAgICBwcml2YXRlS2V5ID0gbnVsbFxuXG4gICAgYWdlbnQgPSBzd2l0Y2hcbiAgICAgIHdoZW4gdXNlQWdlbnQgaXMgdHJ1ZVxuICAgICAgICBpZiAvd2luZG93cy9pLnRlc3QgcHJvY2Vzcy5lbnZbJ09TJ11cbiAgICAgICAgICBwcm9jZXNzLmVudlsnU1NIX0FVVEhfU09DSyddIG9yIFwicGFnZWFudFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBwcm9jZXNzLmVudlsnU1NIX0FVVEhfU09DSyddIG9yIG51bGxcbiAgICAgIHdoZW4gdHlwZW9mIHVzZUFnZW50IGlzIFwic3RyaW5nXCJcbiAgICAgICAgdXNlQWdlbnRcbiAgICAgIGVsc2VcbiAgICAgICAgbnVsbFxuXG4gICAgY29ubmVjdGlvbi5jb25uZWN0XG4gICAgICBob3N0OiBob3N0bmFtZVxuICAgICAgcG9ydDogcG9ydFxuICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lXG4gICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgIHByaXZhdGVLZXk6IHByaXZhdGVLZXlcbiAgICAgIHBhc3NwaHJhc2U6IHBhc3NwaHJhc2VcbiAgICAgIHJlYWR5VGltZW91dDogcmVhZHlUaW1lb3V0XG4gICAgICBhZ2VudDogYWdlbnRcblxuICAgIEBjb25uZWN0aW9uID0gY29ubmVjdGlvblxuIl19
