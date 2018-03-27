(function() {
  var DownloadCmd, EventEmitter, FtpTransport, Host, HostView, MonitoredFiles, RemoteSync, ScpTransport, chokidar, exec, fs, getLogger, logger, minimatch, path, randomize, uploadCmd, watchChangeSet, watchFiles, watcher,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require("path");

  fs = require("fs-plus");

  chokidar = require("chokidar");

  randomize = require("randomatic");

  exec = null;

  minimatch = null;

  ScpTransport = null;

  FtpTransport = null;

  uploadCmd = null;

  DownloadCmd = null;

  Host = null;

  HostView = null;

  EventEmitter = null;

  MonitoredFiles = [];

  watchFiles = {};

  watchChangeSet = false;

  watcher = chokidar.watch();

  logger = null;

  getLogger = function() {
    var Logger;
    if (!logger) {
      Logger = require("./Logger");
      logger = new Logger("Remote Sync");
    }
    return logger;
  };

  RemoteSync = (function() {
    function RemoteSync(projectPath1, configPath1) {
      var ref;
      this.projectPath = projectPath1;
      this.configPath = configPath1;
      if (Host == null) {
        Host = require('./model/host');
      }
      this.host = new Host(this.configPath);
      watchFiles = (ref = this.host.watch) != null ? ref.split(",").filter(Boolean) : void 0;
      if (this.host.source) {
        this.projectPath = path.join(this.projectPath, this.host.source);
      }
      if (watchFiles != null) {
        this.initAutoFileWatch(this.projectPath);
      }
      this.initIgnore(this.host);
      this.initMonitor();
    }

    RemoteSync.prototype.initIgnore = function(host) {
      var ignore, ref;
      ignore = (ref = host.ignore) != null ? ref.split(",") : void 0;
      return host.isIgnore = (function(_this) {
        return function(filePath, relativizePath) {
          var i, len, pattern;
          if (!(relativizePath || _this.inPath(_this.projectPath, filePath))) {
            return true;
          }
          if (!ignore) {
            return false;
          }
          if (!relativizePath) {
            relativizePath = _this.projectPath;
          }
          filePath = path.relative(relativizePath, filePath);
          if (minimatch == null) {
            minimatch = require("minimatch");
          }
          for (i = 0, len = ignore.length; i < len; i++) {
            pattern = ignore[i];
            if (minimatch(filePath, pattern, {
              matchBase: true,
              dot: true
            })) {
              return true;
            }
          }
          return false;
        };
      })(this);
    };

    RemoteSync.prototype.isIgnore = function(filePath, relativizePath) {
      return this.host.isIgnore(filePath, relativizePath);
    };

    RemoteSync.prototype.inPath = function(rootPath, localPath) {
      if (fs.isDirectorySync(localPath)) {
        localPath = localPath + path.sep;
      }
      return localPath.indexOf(rootPath + path.sep) === 0;
    };

    RemoteSync.prototype.dispose = function() {
      if (this.transport) {
        this.transport.dispose();
        return this.transport = null;
      }
    };

    RemoteSync.prototype.deleteFile = function(filePath) {
      var UploadListener, i, len, ref, t;
      if (this.isIgnore(filePath)) {
        return;
      }
      if (!uploadCmd) {
        UploadListener = require("./UploadListener");
        uploadCmd = new UploadListener(getLogger());
      }
      uploadCmd.handleDelete(filePath, this.getTransport());
      ref = this.getUploadMirrors();
      for (i = 0, len = ref.length; i < len; i++) {
        t = ref[i];
        uploadCmd.handleDelete(filePath, t);
      }
      if (this.host.deleteLocal) {
        return fs.removeSync(filePath);
      }
    };

    RemoteSync.prototype.downloadFolder = function(localPath, targetPath, callback) {
      if (DownloadCmd == null) {
        DownloadCmd = require('./commands/DownloadAllCommand');
      }
      return DownloadCmd.run(getLogger(), this.getTransport(), localPath, targetPath, callback);
    };

    RemoteSync.prototype.downloadFile = function(localPath) {
      var realPath;
      if (this.isIgnore(localPath)) {
        return;
      }
      realPath = path.relative(this.projectPath, localPath);
      realPath = path.join(this.host.target, realPath).replace(/\\/g, "/");
      return this.getTransport().download(realPath);
    };

    RemoteSync.prototype.uploadFile = function(filePath) {
      var UploadListener, e, i, j, len, len1, ref, ref1, results, t;
      if (this.isIgnore(filePath)) {
        return;
      }
      if (!uploadCmd) {
        UploadListener = require("./UploadListener");
        uploadCmd = new UploadListener(getLogger());
      }
      if (this.host.saveOnUpload) {
        ref = atom.workspace.getTextEditors();
        for (i = 0, len = ref.length; i < len; i++) {
          e = ref[i];
          if (e.getPath() === filePath && e.isModified()) {
            e.save();
            if (this.host.uploadOnSave) {
              return;
            }
          }
        }
      }
      uploadCmd.handleSave(filePath, this.getTransport());
      ref1 = this.getUploadMirrors();
      results = [];
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        t = ref1[j];
        results.push(uploadCmd.handleSave(filePath, t));
      }
      return results;
    };

    RemoteSync.prototype.uploadFolder = function(dirPath) {
      return fs.traverseTree(dirPath, this.uploadFile.bind(this), (function(_this) {
        return function() {
          return !_this.isIgnore(dirPath);
        };
      })(this));
    };

    RemoteSync.prototype.initMonitor = function() {
      var _this;
      _this = this;
      return setTimeout(function() {
        var MutationObserver, observer, targetObject;
        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        observer = new MutationObserver(function(mutations, observer) {
          _this.monitorStyles();
        });
        targetObject = document.querySelector('.tree-view');
        if (targetObject !== null) {
          return observer.observe(targetObject, {
            subtree: true,
            attributes: false,
            childList: true
          });
        }
      }, 250);
    };

    RemoteSync.prototype.monitorFile = function(dirPath, toggle, notifications) {
      var _this, fileName, index;
      if (toggle == null) {
        toggle = true;
      }
      if (notifications == null) {
        notifications = true;
      }
      if (!this.fileExists(dirPath) && !this.isDirectory(dirPath)) {
        return;
      }
      fileName = this.monitorFileName(dirPath);
      if (indexOf.call(MonitoredFiles, dirPath) < 0) {
        MonitoredFiles.push(dirPath);
        watcher.add(dirPath);
        if (notifications) {
          atom.notifications.addInfo("remote-sync: Watching file - *" + fileName + "*");
        }
        if (!watchChangeSet) {
          _this = this;
          watcher.on('change', function(path) {
            return _this.uploadFile(path);
          });
          watcher.on('unlink', function(path) {
            return _this.deleteFile(path);
          });
          watchChangeSet = true;
        }
      } else if (toggle) {
        watcher.unwatch(dirPath);
        index = MonitoredFiles.indexOf(dirPath);
        MonitoredFiles.splice(index, 1);
        if (notifications) {
          atom.notifications.addInfo("remote-sync: Unwatching file - *" + fileName + "*");
        }
      }
      return this.monitorStyles();
    };

    RemoteSync.prototype.monitorStyles = function() {
      var file, file_name, i, icon_file, item, j, len, len1, list_item, monitorClass, monitored, pulseClass, results;
      monitorClass = 'file-monitoring';
      pulseClass = 'pulse';
      monitored = document.querySelectorAll('.' + monitorClass);
      if (monitored !== null && monitored.length !== 0) {
        for (i = 0, len = monitored.length; i < len; i++) {
          item = monitored[i];
          item.classList.remove(monitorClass);
        }
      }
      results = [];
      for (j = 0, len1 = MonitoredFiles.length; j < len1; j++) {
        file = MonitoredFiles[j];
        file_name = file.replace(/(['"])/g, "\\$1");
        file_name = file.replace(/\\/g, '\\\\');
        icon_file = document.querySelector('[data-path="' + file_name + '"]');
        if (icon_file !== null) {
          list_item = icon_file.parentNode;
          list_item.classList.add(monitorClass);
          if (atom.config.get("remote-sync.monitorFileAnimation")) {
            results.push(list_item.classList.add(pulseClass));
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    RemoteSync.prototype.monitorFilesList = function() {
      var file, files, i, k, len, ref, v, watchedPaths;
      files = "";
      watchedPaths = watcher.getWatched();
      for (k in watchedPaths) {
        v = watchedPaths[k];
        ref = watchedPaths[k];
        for (i = 0, len = ref.length; i < len; i++) {
          file = ref[i];
          files += file + "<br/>";
        }
      }
      if (files !== "") {
        return atom.notifications.addInfo("remote-sync: Currently watching:<br/>*" + files + "*");
      } else {
        return atom.notifications.addWarning("remote-sync: Currently not watching any files");
      }
    };

    RemoteSync.prototype.fileExists = function(dirPath) {
      var e, exists, file_name;
      file_name = this.monitorFileName(dirPath);
      try {
        exists = fs.statSync(dirPath);
        return true;
      } catch (error) {
        e = error;
        atom.notifications.addWarning("remote-sync: cannot find *" + file_name + "* to watch");
        return false;
      }
    };

    RemoteSync.prototype.isDirectory = function(dirPath) {
      var directory;
      if (directory = fs.statSync(dirPath).isDirectory()) {
        atom.notifications.addWarning("remote-sync: cannot watch directory - *" + dirPath + "*");
        return false;
      }
      return true;
    };

    RemoteSync.prototype.monitorFileName = function(dirPath) {
      var file;
      file = dirPath.split('\\').pop().split('/').pop();
      return file;
    };

    RemoteSync.prototype.initAutoFileWatch = function(projectPath) {
      var _this, filesName, i, len;
      _this = this;
      if (watchFiles.length !== 0) {
        for (i = 0, len = watchFiles.length; i < len; i++) {
          filesName = watchFiles[i];
          _this.setupAutoFileWatch(filesName, projectPath);
        }
        setTimeout(function() {
          return _this.monitorFilesList();
        }, 1500);
      }
    };

    RemoteSync.prototype.setupAutoFileWatch = function(filesName, projectPath) {
      var _this;
      _this = this;
      return setTimeout(function() {
        var fullpath;
        if (process.platform === "win32") {
          filesName = filesName.replace(/\//g, '\\');
        }
        fullpath = projectPath + filesName.replace(/^\s+|\s+$/g, "");
        return _this.monitorFile(fullpath, false, false);
      }, 250);
    };

    RemoteSync.prototype.uploadGitChange = function(dirPath) {
      var curRepo, i, isChangedPath, len, repo, repos, workingDirectory;
      repos = atom.project.getRepositories();
      curRepo = null;
      for (i = 0, len = repos.length; i < len; i++) {
        repo = repos[i];
        if (!repo) {
          continue;
        }
        workingDirectory = repo.getWorkingDirectory();
        if (this.inPath(workingDirectory, this.projectPath)) {
          curRepo = repo;
          break;
        }
      }
      if (!curRepo) {
        return;
      }
      isChangedPath = function(path) {
        var status;
        status = curRepo.getCachedPathStatus(path);
        return curRepo.isStatusModified(status) || curRepo.isStatusNew(status);
      };
      return fs.traverseTree(dirPath, (function(_this) {
        return function(path) {
          if (isChangedPath(path)) {
            return _this.uploadFile(path);
          }
        };
      })(this), (function(_this) {
        return function(path) {
          return !_this.isIgnore(path);
        };
      })(this));
    };

    RemoteSync.prototype.createTransport = function(host) {
      var Transport;
      if (host.transport === 'scp' || host.transport === 'sftp') {
        if (ScpTransport == null) {
          ScpTransport = require("./transports/ScpTransport");
        }
        Transport = ScpTransport;
      } else if (host.transport === 'ftp') {
        if (FtpTransport == null) {
          FtpTransport = require("./transports/FtpTransport");
        }
        Transport = FtpTransport;
      } else {
        throw new Error("[remote-sync] invalid transport: " + host.transport + " in " + this.configPath);
      }
      return new Transport(getLogger(), host, this.projectPath);
    };

    RemoteSync.prototype.getTransport = function() {
      if (this.transport) {
        return this.transport;
      }
      this.transport = this.createTransport(this.host);
      return this.transport;
    };

    RemoteSync.prototype.getUploadMirrors = function() {
      var host, i, len, ref;
      if (this.mirrorTransports) {
        return this.mirrorTransports;
      }
      this.mirrorTransports = [];
      if (this.host.uploadMirrors) {
        ref = this.host.uploadMirrors;
        for (i = 0, len = ref.length; i < len; i++) {
          host = ref[i];
          this.initIgnore(host);
          this.mirrorTransports.push(this.createTransport(host));
        }
      }
      return this.mirrorTransports;
    };

    RemoteSync.prototype.diffFile = function(localPath) {
      var os, realPath, targetPath;
      realPath = path.relative(this.projectPath, localPath);
      realPath = path.join(this.host.target, realPath).replace(/\\/g, "/");
      if (!os) {
        os = require("os");
      }
      targetPath = path.join(os.tmpDir(), "remote-sync", randomize('A0', 16));
      return this.getTransport().download(realPath, targetPath, (function(_this) {
        return function() {
          return _this.diff(localPath, targetPath);
        };
      })(this));
    };

    RemoteSync.prototype.diffFolder = function(localPath) {
      var os, targetPath;
      if (!os) {
        os = require("os");
      }
      targetPath = path.join(os.tmpDir(), "remote-sync", randomize('A0', 16));
      return this.downloadFolder(localPath, targetPath, (function(_this) {
        return function() {
          return _this.diff(localPath, targetPath);
        };
      })(this));
    };

    RemoteSync.prototype.diff = function(localPath, targetPath) {
      var diffCmd;
      if (this.isIgnore(localPath)) {
        return;
      }
      targetPath = path.join(targetPath, path.relative(this.projectPath, localPath));
      diffCmd = atom.config.get('remote-sync.difftoolCommand');
      if (exec == null) {
        exec = require("child_process").exec;
      }
      return exec("\"" + diffCmd + "\" \"" + localPath + "\" \"" + targetPath + "\"", function(err) {
        if (!err) {
          return;
        }
        return getLogger().error("Check [difftool Command] in your settings (remote-sync).\nCommand error: " + err + "\ncommand: " + diffCmd + " " + localPath + " " + targetPath);
      });
    };

    return RemoteSync;

  })();

  module.exports = {
    create: function(projectPath) {
      var configPath;
      configPath = path.join(projectPath, atom.config.get('remote-sync.configFileName'));
      if (!fs.existsSync(configPath)) {
        return;
      }
      return new RemoteSync(projectPath, configPath);
    },
    configure: function(projectPath, callback) {
      var configPath, emitter, host, view;
      if (HostView == null) {
        HostView = require('./view/host-view');
      }
      if (Host == null) {
        Host = require('./model/host');
      }
      if (EventEmitter == null) {
        EventEmitter = require("events").EventEmitter;
      }
      emitter = new EventEmitter();
      emitter.on("configured", callback);
      configPath = path.join(projectPath, atom.config.get('remote-sync.configFileName'));
      host = new Host(configPath, emitter);
      view = new HostView(host);
      return view.attach();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3JlbW90ZS1zeW5jL2xpYi9SZW1vdGVTeW5jLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb05BQUE7SUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDWCxTQUFBLEdBQVksT0FBQSxDQUFRLFlBQVI7O0VBRVosSUFBQSxHQUFPOztFQUNQLFNBQUEsR0FBWTs7RUFFWixZQUFBLEdBQWU7O0VBQ2YsWUFBQSxHQUFlOztFQUVmLFNBQUEsR0FBWTs7RUFDWixXQUFBLEdBQWM7O0VBQ2QsSUFBQSxHQUFPOztFQUVQLFFBQUEsR0FBVzs7RUFDWCxZQUFBLEdBQWU7O0VBRWYsY0FBQSxHQUFpQjs7RUFDakIsVUFBQSxHQUFpQjs7RUFDakIsY0FBQSxHQUFpQjs7RUFDakIsT0FBQSxHQUFpQixRQUFRLENBQUMsS0FBVCxDQUFBOztFQUdqQixNQUFBLEdBQVM7O0VBQ1QsU0FBQSxHQUFZLFNBQUE7QUFDVixRQUFBO0lBQUEsSUFBRyxDQUFJLE1BQVA7TUFDRSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7TUFDVCxNQUFBLEdBQWEsSUFBQSxNQUFBLENBQU8sYUFBUCxFQUZmOztBQUdBLFdBQU87RUFKRzs7RUFNTjtJQUNTLG9CQUFDLFlBQUQsRUFBZSxXQUFmO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxjQUFEO01BQWMsSUFBQyxDQUFBLGFBQUQ7O1FBQzFCLE9BQVEsT0FBQSxDQUFRLGNBQVI7O01BRVIsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFBLElBQUEsQ0FBSyxJQUFDLENBQUEsVUFBTjtNQUNaLFVBQUEsd0NBQXdCLENBQUUsS0FBYixDQUFtQixHQUFuQixDQUF1QixDQUFDLE1BQXhCLENB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QUFILENBQWMsVUFBZCxDQUFkO0FBQUEsZUFBQTs7QUFDQSxhQUFXLElBQUEsVUFBQSxDQUFXLFdBQVgsRUFBd0IsVUFBeEI7SUFITCxDQUFSO0lBS0EsU0FBQSxFQUFXLFNBQUMsV0FBRCxFQUFjLFFBQWQ7QUFDVCxVQUFBOztRQUFBLFdBQVksT0FBQSxDQUFRLGtCQUFSOzs7UUFDWixPQUFRLE9BQUEsQ0FBUSxjQUFSOzs7UUFDUixlQUFnQixPQUFBLENBQVEsUUFBUixDQUFpQixDQUFDOztNQUVsQyxPQUFBLEdBQWMsSUFBQSxZQUFBLENBQUE7TUFDZCxPQUFPLENBQUMsRUFBUixDQUFXLFlBQVgsRUFBeUIsUUFBekI7TUFFQSxVQUFBLEdBQWEsSUFBSSxDQUFDLElBQUwsQ0FBVSxXQUFWLEVBQXVCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0QkFBaEIsQ0FBdkI7TUFDYixJQUFBLEdBQVcsSUFBQSxJQUFBLENBQUssVUFBTCxFQUFpQixPQUFqQjtNQUNYLElBQUEsR0FBVyxJQUFBLFFBQUEsQ0FBUyxJQUFUO2FBQ1gsSUFBSSxDQUFDLE1BQUwsQ0FBQTtJQVhTLENBTFg7O0FBOVNGIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgXCJwYXRoXCJcbmZzID0gcmVxdWlyZSBcImZzLXBsdXNcIlxuY2hva2lkYXIgPSByZXF1aXJlIFwiY2hva2lkYXJcIlxucmFuZG9taXplID0gcmVxdWlyZSBcInJhbmRvbWF0aWNcIlxuXG5leGVjID0gbnVsbFxubWluaW1hdGNoID0gbnVsbFxuXG5TY3BUcmFuc3BvcnQgPSBudWxsXG5GdHBUcmFuc3BvcnQgPSBudWxsXG5cbnVwbG9hZENtZCA9IG51bGxcbkRvd25sb2FkQ21kID0gbnVsbFxuSG9zdCA9IG51bGxcblxuSG9zdFZpZXcgPSBudWxsXG5FdmVudEVtaXR0ZXIgPSBudWxsXG5cbk1vbml0b3JlZEZpbGVzID0gW11cbndhdGNoRmlsZXMgICAgID0ge31cbndhdGNoQ2hhbmdlU2V0ID0gZmFsc2VcbndhdGNoZXIgICAgICAgID0gY2hva2lkYXIud2F0Y2goKVxuXG5cbmxvZ2dlciA9IG51bGxcbmdldExvZ2dlciA9IC0+XG4gIGlmIG5vdCBsb2dnZXJcbiAgICBMb2dnZXIgPSByZXF1aXJlIFwiLi9Mb2dnZXJcIlxuICAgIGxvZ2dlciA9IG5ldyBMb2dnZXIgXCJSZW1vdGUgU3luY1wiXG4gIHJldHVybiBsb2dnZXJcblxuY2xhc3MgUmVtb3RlU3luY1xuICBjb25zdHJ1Y3RvcjogKEBwcm9qZWN0UGF0aCwgQGNvbmZpZ1BhdGgpIC0+XG4gICAgSG9zdCA/PSByZXF1aXJlICcuL21vZGVsL2hvc3QnXG5cbiAgICBAaG9zdCA9IG5ldyBIb3N0KEBjb25maWdQYXRoKVxuICAgIHdhdGNoRmlsZXMgPSBAaG9zdC53YXRjaD8uc3BsaXQoXCIsXCIpLmZpbHRlcihCb29sZWFuKVxuICAgIEBwcm9qZWN0UGF0aCA9IHBhdGguam9pbihAcHJvamVjdFBhdGgsIEBob3N0LnNvdXJjZSkgaWYgQGhvc3Quc291cmNlXG4gICAgaWYgd2F0Y2hGaWxlcz9cbiAgICAgIEBpbml0QXV0b0ZpbGVXYXRjaChAcHJvamVjdFBhdGgpXG4gICAgQGluaXRJZ25vcmUoQGhvc3QpXG4gICAgQGluaXRNb25pdG9yKClcblxuICBpbml0SWdub3JlOiAoaG9zdCktPlxuICAgIGlnbm9yZSA9IGhvc3QuaWdub3JlPy5zcGxpdChcIixcIilcbiAgICBob3N0LmlzSWdub3JlID0gKGZpbGVQYXRoLCByZWxhdGl2aXplUGF0aCkgPT5cbiAgICAgIHJldHVybiB0cnVlIHVubGVzcyByZWxhdGl2aXplUGF0aCBvciBAaW5QYXRoKEBwcm9qZWN0UGF0aCwgZmlsZVBhdGgpXG4gICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGlnbm9yZVxuXG4gICAgICByZWxhdGl2aXplUGF0aCA9IEBwcm9qZWN0UGF0aCB1bmxlc3MgcmVsYXRpdml6ZVBhdGhcbiAgICAgIGZpbGVQYXRoID0gcGF0aC5yZWxhdGl2ZSByZWxhdGl2aXplUGF0aCwgZmlsZVBhdGhcblxuICAgICAgbWluaW1hdGNoID89IHJlcXVpcmUgXCJtaW5pbWF0Y2hcIlxuICAgICAgZm9yIHBhdHRlcm4gaW4gaWdub3JlXG4gICAgICAgIHJldHVybiB0cnVlIGlmIG1pbmltYXRjaCBmaWxlUGF0aCwgcGF0dGVybiwgeyBtYXRjaEJhc2U6IHRydWUsIGRvdDogdHJ1ZSB9XG4gICAgICByZXR1cm4gZmFsc2VcblxuICBpc0lnbm9yZTogKGZpbGVQYXRoLCByZWxhdGl2aXplUGF0aCktPlxuICAgIHJldHVybiBAaG9zdC5pc0lnbm9yZShmaWxlUGF0aCwgcmVsYXRpdml6ZVBhdGgpXG5cbiAgaW5QYXRoOiAocm9vdFBhdGgsIGxvY2FsUGF0aCktPlxuICAgIGxvY2FsUGF0aCA9IGxvY2FsUGF0aCArIHBhdGguc2VwIGlmIGZzLmlzRGlyZWN0b3J5U3luYyhsb2NhbFBhdGgpXG4gICAgcmV0dXJuIGxvY2FsUGF0aC5pbmRleE9mKHJvb3RQYXRoICsgcGF0aC5zZXApID09IDBcblxuICBkaXNwb3NlOiAtPlxuICAgIGlmIEB0cmFuc3BvcnRcbiAgICAgIEB0cmFuc3BvcnQuZGlzcG9zZSgpXG4gICAgICBAdHJhbnNwb3J0ID0gbnVsbFxuXG4gIGRlbGV0ZUZpbGU6IChmaWxlUGF0aCkgLT5cbiAgICByZXR1cm4gaWYgQGlzSWdub3JlKGZpbGVQYXRoKVxuXG4gICAgaWYgbm90IHVwbG9hZENtZFxuICAgICAgVXBsb2FkTGlzdGVuZXIgPSByZXF1aXJlIFwiLi9VcGxvYWRMaXN0ZW5lclwiXG4gICAgICB1cGxvYWRDbWQgPSBuZXcgVXBsb2FkTGlzdGVuZXIgZ2V0TG9nZ2VyKClcblxuICAgIHVwbG9hZENtZC5oYW5kbGVEZWxldGUoZmlsZVBhdGgsIEBnZXRUcmFuc3BvcnQoKSlcbiAgICBmb3IgdCBpbiBAZ2V0VXBsb2FkTWlycm9ycygpXG4gICAgICB1cGxvYWRDbWQuaGFuZGxlRGVsZXRlKGZpbGVQYXRoLCB0KVxuXG4gICAgaWYgQGhvc3QuZGVsZXRlTG9jYWxcbiAgICAgIGZzLnJlbW92ZVN5bmMoZmlsZVBhdGgpXG5cbiAgZG93bmxvYWRGb2xkZXI6IChsb2NhbFBhdGgsIHRhcmdldFBhdGgsIGNhbGxiYWNrKS0+XG4gICAgRG93bmxvYWRDbWQgPz0gcmVxdWlyZSAnLi9jb21tYW5kcy9Eb3dubG9hZEFsbENvbW1hbmQnXG4gICAgRG93bmxvYWRDbWQucnVuKGdldExvZ2dlcigpLCBAZ2V0VHJhbnNwb3J0KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsUGF0aCwgdGFyZ2V0UGF0aCwgY2FsbGJhY2spXG5cbiAgZG93bmxvYWRGaWxlOiAobG9jYWxQYXRoKS0+XG4gICAgcmV0dXJuIGlmIEBpc0lnbm9yZShsb2NhbFBhdGgpXG4gICAgcmVhbFBhdGggPSBwYXRoLnJlbGF0aXZlKEBwcm9qZWN0UGF0aCwgbG9jYWxQYXRoKVxuICAgIHJlYWxQYXRoID0gcGF0aC5qb2luKEBob3N0LnRhcmdldCwgcmVhbFBhdGgpLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpXG4gICAgQGdldFRyYW5zcG9ydCgpLmRvd25sb2FkKHJlYWxQYXRoKVxuXG4gIHVwbG9hZEZpbGU6IChmaWxlUGF0aCkgLT5cbiAgICByZXR1cm4gaWYgQGlzSWdub3JlKGZpbGVQYXRoKVxuXG4gICAgaWYgbm90IHVwbG9hZENtZFxuICAgICAgVXBsb2FkTGlzdGVuZXIgPSByZXF1aXJlIFwiLi9VcGxvYWRMaXN0ZW5lclwiXG4gICAgICB1cGxvYWRDbWQgPSBuZXcgVXBsb2FkTGlzdGVuZXIgZ2V0TG9nZ2VyKClcblxuICAgIGlmIEBob3N0LnNhdmVPblVwbG9hZFxuICAgICAgZm9yIGUgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKVxuICAgICAgICBpZiBlLmdldFBhdGgoKSBpcyBmaWxlUGF0aCBhbmQgZS5pc01vZGlmaWVkKClcbiAgICAgICAgICBlLnNhdmUoKVxuICAgICAgICAgIHJldHVybiBpZiBAaG9zdC51cGxvYWRPblNhdmVcblxuICAgIHVwbG9hZENtZC5oYW5kbGVTYXZlKGZpbGVQYXRoLCBAZ2V0VHJhbnNwb3J0KCkpXG4gICAgZm9yIHQgaW4gQGdldFVwbG9hZE1pcnJvcnMoKVxuICAgICAgdXBsb2FkQ21kLmhhbmRsZVNhdmUoZmlsZVBhdGgsIHQpXG5cbiAgdXBsb2FkRm9sZGVyOiAoZGlyUGF0aCktPlxuICAgIGZzLnRyYXZlcnNlVHJlZSBkaXJQYXRoLCBAdXBsb2FkRmlsZS5iaW5kKEApLCA9PlxuICAgICAgcmV0dXJuIG5vdCBAaXNJZ25vcmUoZGlyUGF0aClcblxuICBpbml0TW9uaXRvcjogKCktPlxuICAgIF90aGlzID0gQFxuICAgIHNldFRpbWVvdXQgLT5cbiAgICAgIE11dGF0aW9uT2JzZXJ2ZXIgPSB3aW5kb3cuTXV0YXRpb25PYnNlcnZlciBvciB3aW5kb3cuV2ViS2l0TXV0YXRpb25PYnNlcnZlclxuICAgICAgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zLCBvYnNlcnZlcikgLT5cbiAgICAgICAgX3RoaXMubW9uaXRvclN0eWxlcygpXG4gICAgICAgIHJldHVyblxuICAgICAgKVxuXG4gICAgICB0YXJnZXRPYmplY3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yICcudHJlZS12aWV3J1xuICAgICAgaWYgdGFyZ2V0T2JqZWN0ICE9IG51bGxcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZSB0YXJnZXRPYmplY3QsXG4gICAgICAgICAgc3VidHJlZTogdHJ1ZVxuICAgICAgICAgIGF0dHJpYnV0ZXM6IGZhbHNlXG4gICAgICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgLCAyNTBcblxuICBtb25pdG9yRmlsZTogKGRpclBhdGgsIHRvZ2dsZSA9IHRydWUsIG5vdGlmaWNhdGlvbnMgPSB0cnVlKS0+XG4gICAgcmV0dXJuIGlmICFAZmlsZUV4aXN0cyhkaXJQYXRoKSAmJiAhQGlzRGlyZWN0b3J5KGRpclBhdGgpXG5cbiAgICBmaWxlTmFtZSA9IEAubW9uaXRvckZpbGVOYW1lKGRpclBhdGgpXG4gICAgaWYgZGlyUGF0aCBub3QgaW4gTW9uaXRvcmVkRmlsZXNcbiAgICAgIE1vbml0b3JlZEZpbGVzLnB1c2ggZGlyUGF0aFxuICAgICAgd2F0Y2hlci5hZGQoZGlyUGF0aClcbiAgICAgIGlmIG5vdGlmaWNhdGlvbnNcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8gXCJyZW1vdGUtc3luYzogV2F0Y2hpbmcgZmlsZSAtICpcIitmaWxlTmFtZStcIipcIlxuXG4gICAgICBpZiAhd2F0Y2hDaGFuZ2VTZXRcbiAgICAgICAgX3RoaXMgPSBAXG4gICAgICAgIHdhdGNoZXIub24oJ2NoYW5nZScsIChwYXRoKSAtPlxuICAgICAgICAgIF90aGlzLnVwbG9hZEZpbGUocGF0aClcbiAgICAgICAgKVxuICAgICAgICB3YXRjaGVyLm9uKCd1bmxpbmsnLCAocGF0aCkgLT5cbiAgICAgICAgICBfdGhpcy5kZWxldGVGaWxlKHBhdGgpXG4gICAgICAgIClcbiAgICAgICAgd2F0Y2hDaGFuZ2VTZXQgPSB0cnVlXG4gICAgZWxzZSBpZiB0b2dnbGVcbiAgICAgIHdhdGNoZXIudW53YXRjaChkaXJQYXRoKVxuICAgICAgaW5kZXggPSBNb25pdG9yZWRGaWxlcy5pbmRleE9mKGRpclBhdGgpXG4gICAgICBNb25pdG9yZWRGaWxlcy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICBpZiBub3RpZmljYXRpb25zXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvIFwicmVtb3RlLXN5bmM6IFVud2F0Y2hpbmcgZmlsZSAtICpcIitmaWxlTmFtZStcIipcIlxuICAgIEAubW9uaXRvclN0eWxlcygpXG5cbiAgbW9uaXRvclN0eWxlczogKCktPlxuICAgIG1vbml0b3JDbGFzcyAgPSAnZmlsZS1tb25pdG9yaW5nJ1xuICAgIHB1bHNlQ2xhc3MgICAgPSAncHVsc2UnXG4gICAgbW9uaXRvcmVkICAgICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwgJy4nK21vbml0b3JDbGFzc1xuXG4gICAgaWYgbW9uaXRvcmVkICE9IG51bGwgYW5kIG1vbml0b3JlZC5sZW5ndGggIT0gMFxuICAgICAgZm9yIGl0ZW0gaW4gbW9uaXRvcmVkXG4gICAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSBtb25pdG9yQ2xhc3NcblxuICAgIGZvciBmaWxlIGluIE1vbml0b3JlZEZpbGVzXG4gICAgICBmaWxlX25hbWUgPSBmaWxlLnJlcGxhY2UoLyhbJ1wiXSkvZywgXCJcXFxcJDFcIik7XG4gICAgICBmaWxlX25hbWUgPSBmaWxlLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJyk7XG4gICAgICBpY29uX2ZpbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yICdbZGF0YS1wYXRoPVwiJytmaWxlX25hbWUrJ1wiXSdcbiAgICAgIGlmIGljb25fZmlsZSAhPSBudWxsXG4gICAgICAgIGxpc3RfaXRlbSA9IGljb25fZmlsZS5wYXJlbnROb2RlXG4gICAgICAgIGxpc3RfaXRlbS5jbGFzc0xpc3QuYWRkIG1vbml0b3JDbGFzc1xuICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoXCJyZW1vdGUtc3luYy5tb25pdG9yRmlsZUFuaW1hdGlvblwiKVxuICAgICAgICAgIGxpc3RfaXRlbS5jbGFzc0xpc3QuYWRkIHB1bHNlQ2xhc3NcblxuICBtb25pdG9yRmlsZXNMaXN0OiAoKS0+XG4gICAgZmlsZXMgICAgICAgID0gXCJcIlxuICAgIHdhdGNoZWRQYXRocyA9IHdhdGNoZXIuZ2V0V2F0Y2hlZCgpXG4gICAgZm9yIGssdiBvZiB3YXRjaGVkUGF0aHNcbiAgICAgIGZvciBmaWxlIGluIHdhdGNoZWRQYXRoc1trXVxuICAgICAgICBmaWxlcyArPSBmaWxlK1wiPGJyLz5cIlxuICAgIGlmIGZpbGVzICE9IFwiXCJcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvIFwicmVtb3RlLXN5bmM6IEN1cnJlbnRseSB3YXRjaGluZzo8YnIvPipcIitmaWxlcytcIipcIlxuICAgIGVsc2VcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIFwicmVtb3RlLXN5bmM6IEN1cnJlbnRseSBub3Qgd2F0Y2hpbmcgYW55IGZpbGVzXCJcblxuICBmaWxlRXhpc3RzOiAoZGlyUGF0aCkgLT5cbiAgICBmaWxlX25hbWUgPSBAbW9uaXRvckZpbGVOYW1lKGRpclBhdGgpXG4gICAgdHJ5XG4gICAgICBleGlzdHMgPSBmcy5zdGF0U3luYyhkaXJQYXRoKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBjYXRjaCBlXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyBcInJlbW90ZS1zeW5jOiBjYW5ub3QgZmluZCAqXCIrZmlsZV9uYW1lK1wiKiB0byB3YXRjaFwiXG4gICAgICByZXR1cm4gZmFsc2VcblxuICBpc0RpcmVjdG9yeTogKGRpclBhdGgpIC0+XG4gICAgaWYgZGlyZWN0b3J5ID0gZnMuc3RhdFN5bmMoZGlyUGF0aCkuaXNEaXJlY3RvcnkoKVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgXCJyZW1vdGUtc3luYzogY2Fubm90IHdhdGNoIGRpcmVjdG9yeSAtICpcIitkaXJQYXRoK1wiKlwiXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIHJldHVybiB0cnVlXG5cbiAgbW9uaXRvckZpbGVOYW1lOiAoZGlyUGF0aCktPlxuICAgIGZpbGUgPSBkaXJQYXRoLnNwbGl0KCdcXFxcJykucG9wKCkuc3BsaXQoJy8nKS5wb3AoKVxuICAgIHJldHVybiBmaWxlXG5cbiAgaW5pdEF1dG9GaWxlV2F0Y2g6IChwcm9qZWN0UGF0aCkgLT5cbiAgICBfdGhpcyA9IEBcbiAgICBpZiB3YXRjaEZpbGVzLmxlbmd0aCAhPSAwXG4gICAgICBfdGhpcy5zZXR1cEF1dG9GaWxlV2F0Y2ggZmlsZXNOYW1lLHByb2plY3RQYXRoIGZvciBmaWxlc05hbWUgaW4gd2F0Y2hGaWxlc1xuICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICBfdGhpcy5tb25pdG9yRmlsZXNMaXN0KClcbiAgICAgICwgMTUwMFxuICAgICAgcmV0dXJuXG5cbiAgc2V0dXBBdXRvRmlsZVdhdGNoOiAoZmlsZXNOYW1lLHByb2plY3RQYXRoKSAtPlxuICAgIF90aGlzID0gQFxuICAgIHNldFRpbWVvdXQgLT5cbiAgICAgIGlmIHByb2Nlc3MucGxhdGZvcm0gPT0gXCJ3aW4zMlwiXG4gICAgICAgIGZpbGVzTmFtZSA9IGZpbGVzTmFtZS5yZXBsYWNlKC9cXC8vZywgJ1xcXFwnKVxuICAgICAgZnVsbHBhdGggPSBwcm9qZWN0UGF0aCArIGZpbGVzTmFtZS5yZXBsYWNlIC9eXFxzK3xcXHMrJC9nLCBcIlwiXG4gICAgICBfdGhpcy5tb25pdG9yRmlsZShmdWxscGF0aCxmYWxzZSxmYWxzZSlcbiAgICAsIDI1MFxuXG5cbiAgdXBsb2FkR2l0Q2hhbmdlOiAoZGlyUGF0aCktPlxuICAgIHJlcG9zID0gYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpXG4gICAgY3VyUmVwbyA9IG51bGxcbiAgICBmb3IgcmVwbyBpbiByZXBvc1xuICAgICAgY29udGludWUgdW5sZXNzIHJlcG9cbiAgICAgIHdvcmtpbmdEaXJlY3RvcnkgPSByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuICAgICAgaWYgQGluUGF0aCh3b3JraW5nRGlyZWN0b3J5LCBAcHJvamVjdFBhdGgpXG4gICAgICAgIGN1clJlcG8gPSByZXBvXG4gICAgICAgIGJyZWFrXG4gICAgcmV0dXJuIHVubGVzcyBjdXJSZXBvXG5cbiAgICBpc0NoYW5nZWRQYXRoID0gKHBhdGgpLT5cbiAgICAgIHN0YXR1cyA9IGN1clJlcG8uZ2V0Q2FjaGVkUGF0aFN0YXR1cyhwYXRoKVxuICAgICAgcmV0dXJuIGN1clJlcG8uaXNTdGF0dXNNb2RpZmllZChzdGF0dXMpIG9yIGN1clJlcG8uaXNTdGF0dXNOZXcoc3RhdHVzKVxuXG4gICAgZnMudHJhdmVyc2VUcmVlIGRpclBhdGgsIChwYXRoKT0+XG4gICAgICBAdXBsb2FkRmlsZShwYXRoKSBpZiBpc0NoYW5nZWRQYXRoKHBhdGgpXG4gICAgLCAocGF0aCk9PiByZXR1cm4gbm90IEBpc0lnbm9yZShwYXRoKVxuXG4gIGNyZWF0ZVRyYW5zcG9ydDogKGhvc3QpLT5cbiAgICBpZiBob3N0LnRyYW5zcG9ydCBpcyAnc2NwJyBvciBob3N0LnRyYW5zcG9ydCBpcyAnc2Z0cCdcbiAgICAgIFNjcFRyYW5zcG9ydCA/PSByZXF1aXJlIFwiLi90cmFuc3BvcnRzL1NjcFRyYW5zcG9ydFwiXG4gICAgICBUcmFuc3BvcnQgPSBTY3BUcmFuc3BvcnRcbiAgICBlbHNlIGlmIGhvc3QudHJhbnNwb3J0IGlzICdmdHAnXG4gICAgICBGdHBUcmFuc3BvcnQgPz0gcmVxdWlyZSBcIi4vdHJhbnNwb3J0cy9GdHBUcmFuc3BvcnRcIlxuICAgICAgVHJhbnNwb3J0ID0gRnRwVHJhbnNwb3J0XG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiW3JlbW90ZS1zeW5jXSBpbnZhbGlkIHRyYW5zcG9ydDogXCIgKyBob3N0LnRyYW5zcG9ydCArIFwiIGluIFwiICsgQGNvbmZpZ1BhdGgpXG5cbiAgICByZXR1cm4gbmV3IFRyYW5zcG9ydChnZXRMb2dnZXIoKSwgaG9zdCwgQHByb2plY3RQYXRoKVxuXG4gIGdldFRyYW5zcG9ydDogLT5cbiAgICByZXR1cm4gQHRyYW5zcG9ydCBpZiBAdHJhbnNwb3J0XG4gICAgQHRyYW5zcG9ydCA9IEBjcmVhdGVUcmFuc3BvcnQoQGhvc3QpXG4gICAgcmV0dXJuIEB0cmFuc3BvcnRcblxuICBnZXRVcGxvYWRNaXJyb3JzOiAtPlxuICAgIHJldHVybiBAbWlycm9yVHJhbnNwb3J0cyBpZiBAbWlycm9yVHJhbnNwb3J0c1xuICAgIEBtaXJyb3JUcmFuc3BvcnRzID0gW11cbiAgICBpZiBAaG9zdC51cGxvYWRNaXJyb3JzXG4gICAgICBmb3IgaG9zdCBpbiBAaG9zdC51cGxvYWRNaXJyb3JzXG4gICAgICAgIEBpbml0SWdub3JlKGhvc3QpXG4gICAgICAgIEBtaXJyb3JUcmFuc3BvcnRzLnB1c2ggQGNyZWF0ZVRyYW5zcG9ydChob3N0KVxuICAgIHJldHVybiBAbWlycm9yVHJhbnNwb3J0c1xuXG4gIGRpZmZGaWxlOiAobG9jYWxQYXRoKS0+XG4gICAgcmVhbFBhdGggPSBwYXRoLnJlbGF0aXZlKEBwcm9qZWN0UGF0aCwgbG9jYWxQYXRoKVxuICAgIHJlYWxQYXRoID0gcGF0aC5qb2luKEBob3N0LnRhcmdldCwgcmVhbFBhdGgpLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpXG5cbiAgICBvcyA9IHJlcXVpcmUgXCJvc1wiIGlmIG5vdCBvc1xuICAgIHRhcmdldFBhdGggPSBwYXRoLmpvaW4gb3MudG1wRGlyKCksIFwicmVtb3RlLXN5bmNcIiwgcmFuZG9taXplKCdBMCcsIDE2KVxuXG4gICAgQGdldFRyYW5zcG9ydCgpLmRvd25sb2FkIHJlYWxQYXRoLCB0YXJnZXRQYXRoLCA9PlxuICAgICAgQGRpZmYgbG9jYWxQYXRoLCB0YXJnZXRQYXRoXG5cbiAgZGlmZkZvbGRlcjogKGxvY2FsUGF0aCktPlxuICAgIG9zID0gcmVxdWlyZSBcIm9zXCIgaWYgbm90IG9zXG4gICAgdGFyZ2V0UGF0aCA9IHBhdGguam9pbiBvcy50bXBEaXIoKSwgXCJyZW1vdGUtc3luY1wiLCByYW5kb21pemUoJ0EwJywgMTYpXG4gICAgQGRvd25sb2FkRm9sZGVyIGxvY2FsUGF0aCwgdGFyZ2V0UGF0aCwgPT5cbiAgICAgIEBkaWZmIGxvY2FsUGF0aCwgdGFyZ2V0UGF0aFxuXG4gIGRpZmY6IChsb2NhbFBhdGgsIHRhcmdldFBhdGgpIC0+XG4gICAgcmV0dXJuIGlmIEBpc0lnbm9yZShsb2NhbFBhdGgpXG4gICAgdGFyZ2V0UGF0aCA9IHBhdGguam9pbih0YXJnZXRQYXRoLCBwYXRoLnJlbGF0aXZlKEBwcm9qZWN0UGF0aCwgbG9jYWxQYXRoKSlcbiAgICBkaWZmQ21kID0gYXRvbS5jb25maWcuZ2V0KCdyZW1vdGUtc3luYy5kaWZmdG9vbENvbW1hbmQnKVxuICAgIGV4ZWMgPz0gcmVxdWlyZShcImNoaWxkX3Byb2Nlc3NcIikuZXhlY1xuICAgIGV4ZWMgXCJcXFwiI3tkaWZmQ21kfVxcXCIgXFxcIiN7bG9jYWxQYXRofVxcXCIgXFxcIiN7dGFyZ2V0UGF0aH1cXFwiXCIsIChlcnIpLT5cbiAgICAgIHJldHVybiBpZiBub3QgZXJyXG4gICAgICBnZXRMb2dnZXIoKS5lcnJvciBcIlwiXCJDaGVjayBbZGlmZnRvb2wgQ29tbWFuZF0gaW4geW91ciBzZXR0aW5ncyAocmVtb3RlLXN5bmMpLlxuICAgICAgIENvbW1hbmQgZXJyb3I6ICN7ZXJyfVxuICAgICAgIGNvbW1hbmQ6ICN7ZGlmZkNtZH0gI3tsb2NhbFBhdGh9ICN7dGFyZ2V0UGF0aH1cbiAgICAgIFwiXCJcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNyZWF0ZTogKHByb2plY3RQYXRoKS0+XG4gICAgY29uZmlnUGF0aCA9IHBhdGguam9pbiBwcm9qZWN0UGF0aCwgYXRvbS5jb25maWcuZ2V0KCdyZW1vdGUtc3luYy5jb25maWdGaWxlTmFtZScpXG4gICAgcmV0dXJuIHVubGVzcyBmcy5leGlzdHNTeW5jIGNvbmZpZ1BhdGhcbiAgICByZXR1cm4gbmV3IFJlbW90ZVN5bmMocHJvamVjdFBhdGgsIGNvbmZpZ1BhdGgpXG5cbiAgY29uZmlndXJlOiAocHJvamVjdFBhdGgsIGNhbGxiYWNrKS0+XG4gICAgSG9zdFZpZXcgPz0gcmVxdWlyZSAnLi92aWV3L2hvc3QtdmlldydcbiAgICBIb3N0ID89IHJlcXVpcmUgJy4vbW9kZWwvaG9zdCdcbiAgICBFdmVudEVtaXR0ZXIgPz0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXJcblxuICAgIGVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKClcbiAgICBlbWl0dGVyLm9uIFwiY29uZmlndXJlZFwiLCBjYWxsYmFja1xuXG4gICAgY29uZmlnUGF0aCA9IHBhdGguam9pbiBwcm9qZWN0UGF0aCwgYXRvbS5jb25maWcuZ2V0KCdyZW1vdGUtc3luYy5jb25maWdGaWxlTmFtZScpXG4gICAgaG9zdCA9IG5ldyBIb3N0KGNvbmZpZ1BhdGgsIGVtaXR0ZXIpXG4gICAgdmlldyA9IG5ldyBIb3N0Vmlldyhob3N0KVxuICAgIHZpZXcuYXR0YWNoKClcbiJdfQ==
