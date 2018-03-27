(function() {
  var Executable, HybridExecutable, Promise, _, fs, os, parentConfigKey, path, semver, spawn, which,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Promise = require('bluebird');

  _ = require('lodash');

  which = require('which');

  spawn = require('child_process').spawn;

  path = require('path');

  semver = require('semver');

  os = require('os');

  fs = require('fs');

  parentConfigKey = "atom-beautify.executables";

  Executable = (function() {
    var isInstalled, version;

    Executable.prototype.name = null;

    Executable.prototype.cmd = null;

    Executable.prototype.key = null;

    Executable.prototype.homepage = null;

    Executable.prototype.installation = null;

    Executable.prototype.versionArgs = ['--version'];

    Executable.prototype.versionParse = function(text) {
      return semver.clean(text);
    };

    Executable.prototype.versionRunOptions = {};

    Executable.prototype.versionsSupported = '>= 0.0.0';

    Executable.prototype.required = true;

    function Executable(options) {
      var versionOptions;
      if (options.cmd == null) {
        throw new Error("The command (i.e. cmd property) is required for an Executable.");
      }
      this.name = options.name;
      this.cmd = options.cmd;
      this.key = this.cmd;
      this.homepage = options.homepage;
      this.installation = options.installation;
      this.required = !options.optional;
      if (options.version != null) {
        versionOptions = options.version;
        if (versionOptions.args) {
          this.versionArgs = versionOptions.args;
        }
        if (versionOptions.parse) {
          this.versionParse = versionOptions.parse;
        }
        if (versionOptions.runOptions) {
          this.versionRunOptions = versionOptions.runOptions;
        }
        if (versionOptions.supported) {
          this.versionsSupported = versionOptions.supported;
        }
      }
      this.setupLogger();
    }

    Executable.prototype.init = function() {
      return Promise.all([this.loadVersion()]).then((function(_this) {
        return function() {
          return _this.verbose("Done init of " + _this.name);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this;
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          if (!_this.required) {
            return _this;
          } else {
            return Promise.reject(error);
          }
        };
      })(this));
    };


    /*
    Logger instance
     */

    Executable.prototype.logger = null;


    /*
    Initialize and configure Logger
     */

    Executable.prototype.setupLogger = function() {
      var key, method, ref;
      this.logger = require('../logger')(this.name + " Executable");
      ref = this.logger;
      for (key in ref) {
        method = ref[key];
        this[key] = method;
      }
      return this.verbose(this.name + " executable logger has been initialized.");
    };

    isInstalled = null;

    version = null;

    Executable.prototype.loadVersion = function(force) {
      if (force == null) {
        force = false;
      }
      this.verbose("loadVersion", this.version, force);
      if (force || (this.version == null)) {
        this.verbose("Loading version without cache");
        return this.runVersion().then((function(_this) {
          return function(text) {
            return _this.saveVersion(text);
          };
        })(this));
      } else {
        this.verbose("Loading cached version");
        return Promise.resolve(this.version);
      }
    };

    Executable.prototype.runVersion = function() {
      return this.run(this.versionArgs, this.versionRunOptions).then((function(_this) {
        return function(version) {
          _this.info("Version text: " + version);
          return version;
        };
      })(this));
    };

    Executable.prototype.saveVersion = function(text) {
      return Promise.resolve().then((function(_this) {
        return function() {
          return _this.versionParse(text);
        };
      })(this)).then(function(version) {
        var valid;
        valid = Boolean(semver.valid(version));
        if (!valid) {
          throw new Error("Version is not valid: " + version);
        }
        return version;
      }).then((function(_this) {
        return function(version) {
          _this.isInstalled = true;
          return _this.version = version;
        };
      })(this)).then((function(_this) {
        return function(version) {
          _this.info(_this.cmd + " version: " + version);
          return version;
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          var help;
          _this.isInstalled = false;
          _this.error(error);
          help = {
            program: _this.cmd,
            link: _this.installation || _this.homepage,
            pathOption: "Executable - " + (_this.name || _this.cmd) + " - Path"
          };
          return Promise.reject(_this.commandNotFoundError(_this.name || _this.cmd, help));
        };
      })(this));
    };

    Executable.prototype.isSupported = function() {
      return this.isVersion(this.versionsSupported);
    };

    Executable.prototype.isVersion = function(range) {
      return this.versionSatisfies(this.version, range);
    };

    Executable.prototype.versionSatisfies = function(version, range) {
      return semver.satisfies(version, range);
    };

    Executable.prototype.getConfig = function() {
      return (typeof atom !== "undefined" && atom !== null ? atom.config.get(parentConfigKey + "." + this.key) : void 0) || {};
    };


    /*
    Run command-line interface command
     */

    Executable.prototype.run = function(args, options) {
      var cmd, cwd, exeName, help, ignoreReturnCode, onStdin, returnStderr, returnStdoutOrStderr;
      if (options == null) {
        options = {};
      }
      this.debug("Run: ", this.cmd, args, options);
      cmd = options.cmd, cwd = options.cwd, ignoreReturnCode = options.ignoreReturnCode, help = options.help, onStdin = options.onStdin, returnStderr = options.returnStderr, returnStdoutOrStderr = options.returnStdoutOrStderr;
      exeName = cmd || this.cmd;
      if (cwd == null) {
        cwd = os.tmpDir();
      }
      if (help == null) {
        help = {
          program: this.cmd,
          link: this.installation || this.homepage,
          pathOption: "Executable - " + (this.name || this.cmd) + " - Path"
        };
      }
      return Promise.all([this.shellEnv(), this.resolveArgs(args)]).then((function(_this) {
        return function(arg1) {
          var args, env, exePath;
          env = arg1[0], args = arg1[1];
          _this.debug('exeName, args:', exeName, args);
          exePath = _this.path(exeName);
          return Promise.all([exeName, args, env, exePath]);
        };
      })(this)).then((function(_this) {
        return function(arg1) {
          var args, env, exe, exeName, exePath, spawnOptions;
          exeName = arg1[0], args = arg1[1], env = arg1[2], exePath = arg1[3];
          _this.debug('exePath:', exePath);
          _this.debug('env:', env);
          _this.debug('PATH:', env.PATH);
          _this.debug('args', args);
          args = _this.relativizePaths(args);
          _this.debug('relativized args', args);
          exe = exePath != null ? exePath : exeName;
          spawnOptions = {
            cwd: cwd,
            env: env
          };
          _this.debug('spawnOptions', spawnOptions);
          return _this.spawn(exe, args, spawnOptions, onStdin).then(function(arg2) {
            var returnCode, stderr, stdout, windowsProgramNotFoundMsg;
            returnCode = arg2.returnCode, stdout = arg2.stdout, stderr = arg2.stderr;
            _this.verbose('spawn result, returnCode', returnCode);
            _this.verbose('spawn result, stdout', stdout);
            _this.verbose('spawn result, stderr', stderr);
            if (!ignoreReturnCode && returnCode !== 0) {
              windowsProgramNotFoundMsg = "is not recognized as an internal or external command";
              _this.verbose(stderr, windowsProgramNotFoundMsg);
              if (_this.isWindows() && returnCode === 1 && stderr.indexOf(windowsProgramNotFoundMsg) !== -1) {
                throw _this.commandNotFoundError(exeName, help);
              } else {
                throw new Error(stderr || stdout);
              }
            } else {
              if (returnStdoutOrStderr) {
                return stdout || stderr;
              } else if (returnStderr) {
                return stderr;
              } else {
                return stdout;
              }
            }
          })["catch"](function(err) {
            _this.debug('error', err);
            if (err.code === 'ENOENT' || err.errno === 'ENOENT') {
              throw _this.commandNotFoundError(exeName, help);
            } else {
              throw err;
            }
          });
        };
      })(this));
    };

    Executable.prototype.path = function(cmd) {
      var config, exeName;
      if (cmd == null) {
        cmd = this.cmd;
      }
      config = this.getConfig();
      if (config && config.path) {
        return Promise.resolve(config.path);
      } else {
        exeName = cmd;
        return this.which(exeName);
      }
    };

    Executable.prototype.resolveArgs = function(args) {
      args = _.flatten(args);
      return Promise.all(args);
    };

    Executable.prototype.relativizePaths = function(args) {
      var newArgs, tmpDir;
      tmpDir = os.tmpDir();
      newArgs = args.map(function(arg) {
        var isTmpFile;
        isTmpFile = typeof arg === 'string' && !arg.includes(':') && path.isAbsolute(arg) && path.dirname(arg).startsWith(tmpDir);
        if (isTmpFile) {
          return path.relative(tmpDir, arg);
        }
        return arg;
      });
      return newArgs;
    };


    /*
    Spawn
     */

    Executable.prototype.spawn = function(exe, args, options, onStdin) {
      args = _.without(args, void 0);
      args = _.without(args, null);
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var cmd, stderr, stdout;
          _this.debug('spawn', exe, args);
          cmd = spawn(exe, args, options);
          stdout = "";
          stderr = "";
          cmd.stdout.on('data', function(data) {
            return stdout += data;
          });
          cmd.stderr.on('data', function(data) {
            return stderr += data;
          });
          cmd.on('close', function(returnCode) {
            _this.debug('spawn done', returnCode, stderr, stdout);
            return resolve({
              returnCode: returnCode,
              stdout: stdout,
              stderr: stderr
            });
          });
          cmd.on('error', function(err) {
            _this.debug('error', err);
            return reject(err);
          });
          if (onStdin) {
            return onStdin(cmd.stdin);
          }
        };
      })(this));
    };


    /*
    Add help to error.description
    
    Note: error.description is not officially used in JavaScript,
    however it is used internally for Atom Beautify when displaying errors.
     */

    Executable.prototype.commandNotFoundError = function(exe, help) {
      if (exe == null) {
        exe = this.name || this.cmd;
      }
      return this.constructor.commandNotFoundError(exe, help);
    };

    Executable.commandNotFoundError = function(exe, help) {
      var docsLink, er, helpStr, message;
      message = "Could not find '" + exe + "'. The program may not be installed.";
      er = new Error(message);
      er.code = 'CommandNotFound';
      er.errno = er.code;
      er.syscall = 'beautifier::run';
      er.file = exe;
      if (help != null) {
        if (typeof help === "object") {
          docsLink = "https://github.com/Glavin001/atom-beautify#beautifiers";
          helpStr = "See " + exe + " installation instructions at " + docsLink + (help.link ? ' or go to ' + help.link : '') + "\n";
          if (help.pathOption) {
            helpStr += "You can configure Atom Beautify with the absolute path to '" + (help.program || exe) + "' by setting '" + help.pathOption + "' in the Atom Beautify package settings.\n";
          }
          helpStr += "Your program is properly installed if running '" + (this.isWindows() ? 'where.exe' : 'which') + " " + exe + "' in your " + (this.isWindows() ? 'CMD prompt' : 'Terminal') + " returns an absolute path to the executable.\n";
          if (help.additional) {
            helpStr += help.additional;
          }
          er.description = helpStr;
        } else {
          er.description = help;
        }
      }
      return er;
    };

    Executable._envCache = null;

    Executable.prototype.shellEnv = function() {
      var env;
      env = this.constructor.shellEnv();
      this.debug("env", env);
      return env;
    };

    Executable.shellEnv = function() {
      return Promise.resolve(process.env);
    };


    /*
    Like the unix which utility.
    
    Finds the first instance of a specified executable in the PATH environment variable.
    Does not cache the results,
    so hash -r is not needed when the PATH changes.
    See https://github.com/isaacs/node-which
     */

    Executable.prototype.which = function(exe, options) {
      return this.constructor.which(exe, options);
    };

    Executable._whichCache = {};

    Executable.which = function(exe, options) {
      if (options == null) {
        options = {};
      }
      if (this._whichCache[exe]) {
        return Promise.resolve(this._whichCache[exe]);
      }
      return this.shellEnv().then((function(_this) {
        return function(env) {
          return new Promise(function(resolve, reject) {
            var i, ref;
            if (options.path == null) {
              options.path = env.PATH;
            }
            if (_this.isWindows()) {
              if (!options.path) {
                for (i in env) {
                  if (i.toLowerCase() === "path") {
                    options.path = env[i];
                    break;
                  }
                }
              }
              if (options.pathExt == null) {
                options.pathExt = ((ref = process.env.PATHEXT) != null ? ref : '.EXE') + ";";
              }
            }
            return which(exe, options, function(err, path) {
              if (err) {
                return resolve(exe);
              }
              _this._whichCache[exe] = path;
              return resolve(path);
            });
          });
        };
      })(this));
    };


    /*
    If platform is Windows
     */

    Executable.prototype.isWindows = function() {
      return this.constructor.isWindows();
    };

    Executable.isWindows = function() {
      return new RegExp('^win').test(process.platform);
    };

    return Executable;

  })();

  HybridExecutable = (function(superClass) {
    extend(HybridExecutable, superClass);

    HybridExecutable.prototype.dockerOptions = {
      image: void 0,
      workingDir: "/workdir"
    };

    function HybridExecutable(options) {
      HybridExecutable.__super__.constructor.call(this, options);
      if (options.docker != null) {
        this.dockerOptions = Object.assign({}, this.dockerOptions, options.docker);
        this.docker = this.constructor.dockerExecutable();
      }
    }

    HybridExecutable.docker = void 0;

    HybridExecutable.dockerExecutable = function() {
      if (this.docker == null) {
        this.docker = new Executable({
          name: "Docker",
          cmd: "docker",
          homepage: "https://www.docker.com/",
          installation: "https://www.docker.com/get-docker",
          version: {
            parse: function(text) {
              return text.match(/version [0]*([1-9]\d*).[0]*([1-9]\d*).[0]*([1-9]\d*)/).slice(1).join('.');
            }
          }
        });
      }
      return this.docker;
    };

    HybridExecutable.prototype.installedWithDocker = false;

    HybridExecutable.prototype.init = function() {
      return HybridExecutable.__super__.init.call(this)["catch"]((function(_this) {
        return function(error) {
          if (_this.docker == null) {
            return Promise.reject(error);
          }
          return _this.docker.init().then(function() {
            return _this.runImage(_this.versionArgs, _this.versionRunOptions);
          }).then(function(text) {
            return _this.saveVersion(text);
          }).then(function() {
            return _this.installedWithDocker = true;
          }).then(function() {
            return _this;
          })["catch"](function(dockerError) {
            _this.debug(dockerError);
            return Promise.reject(error);
          });
        };
      })(this));
    };

    HybridExecutable.prototype.run = function(args, options) {
      if (options == null) {
        options = {};
      }
      if (this.installedWithDocker && this.docker && this.docker.isInstalled) {
        return this.runImage(args, options);
      }
      return HybridExecutable.__super__.run.call(this, args, options);
    };

    HybridExecutable.prototype.runImage = function(args, options) {
      this.debug("Run Docker executable: ", args, options);
      return this.resolveArgs(args).then((function(_this) {
        return function(args) {
          var cwd, image, newArgs, pwd, rootPath, tmpDir, workingDir;
          cwd = options.cwd;
          tmpDir = os.tmpDir();
          pwd = fs.realpathSync(cwd || tmpDir);
          image = _this.dockerOptions.image;
          workingDir = _this.dockerOptions.workingDir;
          rootPath = '/mountedRoot';
          newArgs = args.map(function(arg) {
            if (typeof arg === 'string' && !arg.includes(':') && path.isAbsolute(arg) && !path.dirname(arg).startsWith(tmpDir)) {
              return path.join(rootPath, arg);
            } else {
              return arg;
            }
          });
          return _this.docker.run(["run", "--volume", pwd + ":" + workingDir, "--volume", (path.resolve('/')) + ":" + rootPath, "--workdir", workingDir, image, newArgs], options);
        };
      })(this));
    };

    return HybridExecutable;

  })(Executable);

  module.exports = HybridExecutable;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2V4ZWN1dGFibGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw2RkFBQTtJQUFBOzs7RUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0VBQ1YsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUNKLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUjs7RUFDUixLQUFBLEdBQVEsT0FBQSxDQUFRLGVBQVIsQ0FBd0IsQ0FBQzs7RUFDakMsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDVCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUVMLGVBQUEsR0FBa0I7O0VBR1o7QUFFSixRQUFBOzt5QkFBQSxJQUFBLEdBQU07O3lCQUNOLEdBQUEsR0FBSzs7eUJBQ0wsR0FBQSxHQUFLOzt5QkFDTCxRQUFBLEdBQVU7O3lCQUNWLFlBQUEsR0FBYzs7eUJBQ2QsV0FBQSxHQUFhLENBQUMsV0FBRDs7eUJBQ2IsWUFBQSxHQUFjLFNBQUMsSUFBRDthQUFVLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBYjtJQUFWOzt5QkFDZCxpQkFBQSxHQUFtQjs7eUJBQ25CLGlCQUFBLEdBQW1COzt5QkFDbkIsUUFBQSxHQUFVOztJQUVHLG9CQUFDLE9BQUQ7QUFFWCxVQUFBO01BQUEsSUFBSSxtQkFBSjtBQUNFLGNBQVUsSUFBQSxLQUFBLENBQU0sZ0VBQU4sRUFEWjs7TUFFQSxJQUFDLENBQUEsSUFBRCxHQUFRLE9BQU8sQ0FBQztNQUNoQixJQUFDLENBQUEsR0FBRCxHQUFPLE9BQU8sQ0FBQztNQUNmLElBQUMsQ0FBQSxHQUFELEdBQU8sSUFBQyxDQUFBO01BQ1IsSUFBQyxD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QUFJLEdBQUcsQ0FBQyxRQUFKLENBQWEsR0FBYixDQUEvQixJQUNFLElBQUksQ0FBQyxVQUFMLENBQWdCLEdBQWhCLENBREYsSUFDMkIsQ0FBSSxJQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsQ0FBaUIsQ0FBQyxVQUFsQixDQUE2QixNQUE3QixDQURuQztxQkFFTyxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsRUFBb0IsR0FBcEIsRUFGUDthQUFBLE1BQUE7cUJBRXFDLElBRnJDOztVQURpQixDQUFUO2lCQU1WLEtBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLENBQ1IsS0FEUSxFQUVSLFVBRlEsRUFFTyxHQUFELEdBQUssR0FBTCxHQUFRLFVBRmQsRUFHUixVQUhRLEVBR00sQ0FBQyxJQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsQ0FBRCxDQUFBLEdBQW1CLEdBQW5CLEdBQXNCLFFBSDVCLEVBSVIsV0FKUSxFQUlLLFVBSkwsRUFLUixLQUxRLEVBTVIsT0FOUSxDQUFaLEVBUUUsT0FSRjtRQWRJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURSO0lBRlE7Ozs7S0FoRG1COztFQThFL0IsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFyYmpCIiwic291cmNlc0NvbnRlbnQiOlsiUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJylcbl8gPSByZXF1aXJlKCdsb2Rhc2gnKVxud2hpY2ggPSByZXF1aXJlKCd3aGljaCcpXG5zcGF3biA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5zcGF3blxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuc2VtdmVyID0gcmVxdWlyZSgnc2VtdmVyJylcbm9zID0gcmVxdWlyZSgnb3MnKVxuZnMgPSByZXF1aXJlKCdmcycpXG5cbnBhcmVudENvbmZpZ0tleSA9IFwiYXRvbS1iZWF1dGlmeS5leGVjdXRhYmxlc1wiXG5cblxuY2xhc3MgRXhlY3V0YWJsZVxuXG4gIG5hbWU6IG51bGxcbiAgY21kOiBudWxsXG4gIGtleTogbnVsbFxuICBob21lcGFnZTogbnVsbFxuICBpbnN0YWxsYXRpb246IG51bGxcbiAgdmVyc2lvbkFyZ3M6IFsnLS12ZXJzaW9uJ11cbiAgdmVyc2lvblBhcnNlOiAodGV4dCkgLT4gc2VtdmVyLmNsZWFuKHRleHQpXG4gIHZlcnNpb25SdW5PcHRpb25zOiB7fVxuICB2ZXJzaW9uc1N1cHBvcnRlZDogJz49IDAuMC4wJ1xuICByZXF1aXJlZDogdHJ1ZVxuXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICAjIFZhbGlkYXRpb25cbiAgICBpZiAhb3B0aW9ucy5jbWQ/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgY29tbWFuZCAoaS5lLiBjbWQgcHJvcGVydHkpIGlzIHJlcXVpcmVkIGZvciBhbiBFeGVjdXRhYmxlLlwiKVxuICAgIEBuYW1lID0gb3B0aW9ucy5uYW1lXG4gICAgQGNtZCA9IG9wdGlvbnMuY21kXG4gICAgQGtleSA9IEBjbWRcbiAgICBAaG9tZXBhZ2UgPSBvcHRpb25zLmhvbWVwYWdlXG4gICAgQGluc3RhbGxhdGlvbiA9IG9wdGlvbnMuaW5zdGFsbGF0aW9uXG4gICAgQHJlcXVpcmVkID0gbm90IG9wdGlvbnMub3B0aW9uYWxcbiAgICBpZiBvcHRpb25zLnZlcnNpb24/XG4gICAgICB2ZXJzaW9uT3B0aW9ucyA9IG9wdGlvbnMudmVyc2lvblxuICAgICAgQHZlcnNpb25BcmdzID0gdmVyc2lvbk9wdGlvbnMuYXJncyBpZiB2ZXJzaW9uT3B0aW9ucy5hcmdzXG4gICAgICBAdmVyc2lvblBhcnNlID0gdmVyc2lvbk9wdGlvbnMucGFyc2UgaWYgdmVyc2lvbk9wdGlvbnMucGFyc2VcbiAgICAgIEB2ZXJzaW9uUnVuT3B0aW9ucyA9IHZlcnNpb25PcHRpb25zLnJ1bk9wdGlvbnMgaWYgdmVyc2lvbk9wdGlvbnMucnVuT3B0aW9uc1xuICAgICAgQHZlcnNpb25zU3VwcG9ydGVkID0gdmVyc2lvbk9wdGlvbnMuc3VwcG9ydGVkIGlmIHZlcnNpb25PcHRpb25zLnN1cHBvcnRlZFxuICAgIEBzZXR1cExvZ2dlcigpXG5cbiAgaW5pdDogKCkgLT5cbiAgICBQcm9taXNlLmFsbChbXG4gICAgICBAbG9hZFZlcnNpb24oKVxuICAgIF0pXG4gICAgICAudGhlbigoKSA9PiBAdmVyYm9zZShcIkRvbmUgaW5pdCBvZiAje0BuYW1lfVwiKSlcbiAgICAgIC50aGVuKCgpID0+IEApXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PlxuICAgICAgICBpZiBub3QgQC5yZXF1aXJlZFxuICAgICAgICAgIEBcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFByb21pc2UucmVqZWN0KGVycm9yKVxuICAgICAgKVxuXG4gICMjI1xuICBMb2dnZXIgaW5zdGFuY2VcbiAgIyMjXG4gIGxvZ2dlcjogbnVsbFxuICAjIyNcbiAgSW5pdGlhbGl6ZSBhbmQgY29uZmlndXJlIExvZ2dlclxuICAjIyNcbiAgc2V0dXBMb2dnZXI6IC0+XG4gICAgQGxvZ2dlciA9IHJlcXVpcmUoJy4uL2xvZ2dlcicpKFwiI3tAbmFtZX0gRXhlY3V0YWJsZVwiKVxuICAgIGZvciBrZXksIG1ldGhvZCBvZiBAbG9nZ2VyXG4gICAgICBAW2tleV0gPSBtZXRob2RcbiAgICBAdmVyYm9zZShcIiN7QG5hbWV9IGV4ZWN1dGFibGUgbG9nZ2VyIGhhcyBiZWVuIGluaXRpYWxpemVkLlwiKVxuXG4gIGlzSW5zdGFsbGVkID0gbnVsbFxuICB2ZXJzaW9uID0gbnVsbFxuICBsb2FkVmVyc2lvbjogKGZvcmNlID0gZmFsc2UpIC0+XG4gICAgQHZlcmJvc2UoXCJsb2FkVmVyc2lvblwiLCBAdmVyc2lvbiwgZm9yY2UpXG4gICAgaWYgZm9yY2Ugb3IgIUB2ZXJzaW9uP1xuICAgICAgQHZlcmJvc2UoXCJMb2FkaW5nIHZlcnNpb24gd2l0aG91dCBjYWNoZVwiKVxuICAgICAgQHJ1blZlcnNpb24oKVxuICAgICAgICAudGhlbigodGV4dCkgPT4gQHNhdmVWZXJzaW9uKHRleHQpKVxuICAgIGVsc2VcbiAgICAgIEB2ZXJib3NlKFwiTG9hZGluZyBjYWNoZWQgdmVyc2lvblwiKVxuICAgICAgUHJvbWlzZS5yZXNvbHZlKEB2ZXJzaW9uKVxuXG4gIHJ1blZlcnNpb246ICgpIC0+XG4gICAgQHJ1bihAdmVyc2lvbkFyZ3MsIEB2ZXJzaW9uUnVuT3B0aW9ucylcbiAgICAgIC50aGVuKCh2ZXJzaW9uKSA9PlxuICAgICAgICBAaW5mbyhcIlZlcnNpb24gdGV4dDogXCIgKyB2ZXJzaW9uKVxuICAgICAgICB2ZXJzaW9uXG4gICAgICApXG5cbiAgc2F2ZVZlcnNpb246ICh0ZXh0KSAtPlxuICAgIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAudGhlbiggPT4gQHZlcnNpb25QYXJzZSh0ZXh0KSlcbiAgICAgIC50aGVuKCh2ZXJzaW9uKSAtPlxuICAgICAgICB2YWxpZCA9IEJvb2xlYW4oc2VtdmVyLnZhbGlkKHZlcnNpb24pKVxuICAgICAgICBpZiBub3QgdmFsaWRcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWZXJzaW9uIGlzIG5vdCB2YWxpZDogXCIrdmVyc2lvbilcbiAgICAgICAgdmVyc2lvblxuICAgICAgKVxuICAgICAgLnRoZW4oKHZlcnNpb24pID0+XG4gICAgICAgIEBpc0luc3RhbGxlZCA9IHRydWVcbiAgICAgICAgQHZlcnNpb24gPSB2ZXJzaW9uXG4gICAgICApXG4gICAgICAudGhlbigodmVyc2lvbikgPT5cbiAgICAgICAgQGluZm8oXCIje0BjbWR9IHZlcnNpb246ICN7dmVyc2lvbn1cIilcbiAgICAgICAgdmVyc2lvblxuICAgICAgKVxuICAgICAgLmNhdGNoKChlcnJvcikgPT5cbiAgICAgICAgQGlzSW5zdGFsbGVkID0gZmFsc2VcbiAgICAgICAgQGVycm9yKGVycm9yKVxuICAgICAgICBoZWxwID0ge1xuICAgICAgICAgIHByb2dyYW06IEBjbWRcbiAgICAgICAgICBsaW5rOiBAaW5zdGFsbGF0aW9uIG9yIEBob21lcGFnZVxuICAgICAgICAgIHBhdGhPcHRpb246IFwiRXhlY3V0YWJsZSAtICN7QG5hbWUgb3IgQGNtZH0gLSBQYXRoXCJcbiAgICAgICAgfVxuICAgICAgICBQcm9taXNlLnJlamVjdChAY29tbWFuZE5vdEZvdW5kRXJyb3IoQG5hbWUgb3IgQGNtZCwgaGVscCkpXG4gICAgICApXG5cbiAgaXNTdXBwb3J0ZWQ6ICgpIC0+XG4gICAgQGlzVmVyc2lvbihAdmVyc2lvbnNTdXBwb3J0ZWQpXG5cbiAgaXNWZXJzaW9uOiAocmFuZ2UpIC0+XG4gICAgQHZlcnNpb25TYXRpc2ZpZXMoQHZlcnNpb24sIHJhbmdlKVxuXG4gIHZlcnNpb25TYXRpc2ZpZXM6ICh2ZXJzaW9uLCByYW5nZSkgLT5cbiAgICBzZW12ZXIuc2F0aXNmaWVzKHZlcnNpb24sIHJhbmdlKVxuXG4gIGdldENvbmZpZzogKCkgLT5cbiAgICBhdG9tPy5jb25maWcuZ2V0KFwiI3twYXJlbnRDb25maWdLZXl9LiN7QGtleX1cIikgb3Ige31cblxuICAjIyNcbiAgUnVuIGNvbW1hbmQtbGluZSBpbnRlcmZhY2UgY29tbWFuZFxuICAjIyNcbiAgcnVuOiAoYXJncywgb3B0aW9ucyA9IHt9KSAtPlxuICAgIEBkZWJ1ZyhcIlJ1bjogXCIsIEBjbWQsIGFyZ3MsIG9wdGlvbnMpXG4gICAgeyBjbWQsIGN3ZCwgaWdub3JlUmV0dXJuQ29kZSwgaGVscCwgb25TdGRpbiwgcmV0dXJuU3RkZXJyLCByZXR1cm5TdGRvdXRPclN0ZGVyciB9ID0gb3B0aW9uc1xuICAgIGV4ZU5hbWUgPSBjbWQgb3IgQGNtZFxuICAgIGN3ZCA/PSBvcy50bXBEaXIoKVxuICAgIGhlbHAgPz0ge1xuICAgICAgcHJvZ3JhbTogQGNtZFxuICAgICAgbGluazogQGluc3RhbGxhdGlvbiBvciBAaG9tZXBhZ2VcbiAgICAgIHBhdGhPcHRpb246IFwiRXhlY3V0YWJsZSAtICN7QG5hbWUgb3IgQGNtZH0gLSBQYXRoXCJcbiAgICB9XG5cbiAgICAjIFJlc29sdmUgZXhlY3V0YWJsZSBhbmQgYWxsIGFyZ3NcbiAgICBQcm9taXNlLmFsbChbQHNoZWxsRW52KCksIHRoaXMucmVzb2x2ZUFyZ3MoYXJncyldKVxuICAgICAgLnRoZW4oKFtlbnYsIGFyZ3NdKSA9PlxuICAgICAgICBAZGVidWcoJ2V4ZU5hbWUsIGFyZ3M6JywgZXhlTmFtZSwgYXJncylcbiAgICAgICAgIyBHZXQgUEFUSCBhbmQgb3RoZXIgZW52aXJvbm1lbnQgdmFyaWFibGVzXG4gICAgICAgIGV4ZVBhdGggPSBAcGF0aChleGVOYW1lKVxuICAgICAgICBQcm9taXNlLmFsbChbZXhlTmFtZSwgYXJncywgZW52LCBleGVQYXRoXSlcbiAgICAgIClcbiAgICAgIC50aGVuKChbZXhlTmFtZSwgYXJncywgZW52LCBleGVQYXRoXSkgPT5cbiAgICAgICAgQGRlYnVnKCdleGVQYXRoOicsIGV4ZVBhdGgpXG4gICAgICAgIEBkZWJ1ZygnZW52OicsIGVudilcbiAgICAgICAgQGRlYnVnKCdQQVRIOicsIGVudi5QQVRIKVxuICAgICAgICBAZGVidWcoJ2FyZ3MnLCBhcmdzKVxuICAgICAgICBhcmdzID0gdGhpcy5yZWxhdGl2aXplUGF0aHMoYXJncylcbiAgICAgICAgQGRlYnVnKCdyZWxhdGl2aXplZCBhcmdzJywgYXJncylcblxuICAgICAgICBleGUgPSBleGVQYXRoID8gZXhlTmFtZVxuICAgICAgICBzcGF3bk9wdGlvbnMgPSB7XG4gICAgICAgICAgY3dkOiBjd2RcbiAgICAgICAgICBlbnY6IGVudlxuICAgICAgICB9XG4gICAgICAgIEBkZWJ1Zygnc3Bhd25PcHRpb25zJywgc3Bhd25PcHRpb25zKVxuXG4gICAgICAgIEBzcGF3bihleGUsIGFyZ3MsIHNwYXduT3B0aW9ucywgb25TdGRpbilcbiAgICAgICAgICAudGhlbigoe3JldHVybkNvZGUsIHN0ZG91dCwgc3RkZXJyfSkgPT5cbiAgICAgICAgICAgIEB2ZXJib3NlKCdzcGF3biByZXN1bHQsIHJldHVybkNvZGUnLCByZXR1cm5Db2RlKVxuICAgICAgICAgICAgQHZlcmJvc2UoJ3NwYXduIHJlc3VsdCwgc3Rkb3V0Jywgc3Rkb3V0KVxuICAgICAgICAgICAgQHZlcmJvc2UoJ3NwYXduIHJlc3VsdCwgc3RkZXJyJywgc3RkZXJyKVxuXG4gICAgICAgICAgICAjIElmIHJldHVybiBjb2RlIGlzIG5vdCAwIHRoZW4gZXJyb3Igb2NjdXJlZFxuICAgICAgICAgICAgaWYgbm90IGlnbm9yZVJldHVybkNvZGUgYW5kIHJldHVybkNvZGUgaXNudCAwXG4gICAgICAgICAgICAgICMgb3BlcmFibGUgcHJvZ3JhbSBvciBiYXRjaCBmaWxlXG4gICAgICAgICAgICAgIHdpbmRvd3NQcm9ncmFtTm90Rm91bmRNc2cgPSBcImlzIG5vdCByZWNvZ25pemVkIGFzIGFuIGludGVybmFsIG9yIGV4dGVybmFsIGNvbW1hbmRcIlxuXG4gICAgICAgICAgICAgIEB2ZXJib3NlKHN0ZGVyciwgd2luZG93c1Byb2dyYW1Ob3RGb3VuZE1zZylcblxuICAgICAgICAgICAgICBpZiBAaXNXaW5kb3dzKCkgYW5kIHJldHVybkNvZGUgaXMgMSBhbmQgc3RkZXJyLmluZGV4T2Yod2luZG93c1Byb2dyYW1Ob3RGb3VuZE1zZykgaXNudCAtMVxuICAgICAgICAgICAgICAgIHRocm93IEBjb21tYW5kTm90Rm91bmRFcnJvcihleGVOYW1lLCBoZWxwKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHN0ZGVyciBvciBzdGRvdXQpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGlmIHJldHVyblN0ZG91dE9yU3RkZXJyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0ZG91dCBvciBzdGRlcnJcbiAgICAgICAgICAgICAgZWxzZSBpZiByZXR1cm5TdGRlcnJcbiAgICAgICAgICAgICAgICBzdGRlcnJcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHN0ZG91dFxuICAgICAgICAgIClcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT5cbiAgICAgICAgICAgIEBkZWJ1ZygnZXJyb3InLCBlcnIpXG5cbiAgICAgICAgICAgICMgQ2hlY2sgaWYgZXJyb3IgaXMgRU5PRU5UIChjb21tYW5kIGNvdWxkIG5vdCBiZSBmb3VuZClcbiAgICAgICAgICAgIGlmIGVyci5jb2RlIGlzICdFTk9FTlQnIG9yIGVyci5lcnJubyBpcyAnRU5PRU5UJ1xuICAgICAgICAgICAgICB0aHJvdyBAY29tbWFuZE5vdEZvdW5kRXJyb3IoZXhlTmFtZSwgaGVscClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgIyBjb250aW51ZSBhcyBub3JtYWwgZXJyb3JcbiAgICAgICAgICAgICAgdGhyb3cgZXJyXG4gICAgICAgICAgKVxuICAgICAgKVxuXG4gIHBhdGg6IChjbWQgPSBAY21kKSAtPlxuICAgIGNvbmZpZyA9IEBnZXRDb25maWcoKVxuICAgIGlmIGNvbmZpZyBhbmQgY29uZmlnLnBhdGhcbiAgICAgIFByb21pc2UucmVzb2x2ZShjb25maWcucGF0aClcbiAgICBlbHNlXG4gICAgICBleGVOYW1lID0gY21kXG4gICAgICBAd2hpY2goZXhlTmFtZSlcblxuICByZXNvbHZlQXJnczogKGFyZ3MpIC0+XG4gICAgYXJncyA9IF8uZmxhdHRlbihhcmdzKVxuICAgIFByb21pc2UuYWxsKGFyZ3MpXG5cbiAgcmVsYXRpdml6ZVBhdGhzOiAoYXJncykgLT5cbiAgICB0bXBEaXIgPSBvcy50bXBEaXIoKVxuICAgIG5ld0FyZ3MgPSBhcmdzLm1hcCgoYXJnKSAtPlxuICAgICAgaXNUbXBGaWxlID0gKHR5cGVvZiBhcmcgaXMgJ3N0cmluZycgYW5kIG5vdCBhcmcuaW5jbHVkZXMoJzonKSBhbmQgXFxcbiAgICAgICAgcGF0aC5pc0Fic29sdXRlKGFyZykgYW5kIHBhdGguZGlybmFtZShhcmcpLnN0YXJ0c1dpdGgodG1wRGlyKSlcbiAgICAgIGlmIGlzVG1wRmlsZVxuICAgICAgICByZXR1cm4gcGF0aC5yZWxhdGl2ZSh0bXBEaXIsIGFyZylcbiAgICAgIHJldHVybiBhcmdcbiAgICApXG4gICAgbmV3QXJnc1xuXG4gICMjI1xuICBTcGF3blxuICAjIyNcbiAgc3Bhd246IChleGUsIGFyZ3MsIG9wdGlvbnMsIG9uU3RkaW4pIC0+XG4gICAgIyBSZW1vdmUgdW5kZWZpbmVkL251bGwgdmFsdWVzXG4gICAgYXJncyA9IF8ud2l0aG91dChhcmdzLCB1bmRlZmluZWQpXG4gICAgYXJncyA9IF8ud2l0aG91dChhcmdzLCBudWxsKVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBAZGVidWcoJ3NwYXduJywgZXhlLCBhcmdzKVxuXG4gICAgICBjbWQgPSBzcGF3bihleGUsIGFyZ3MsIG9wdGlvbnMpXG4gICAgICBzdGRvdXQgPSBcIlwiXG4gICAgICBzdGRlcnIgPSBcIlwiXG5cbiAgICAgIGNtZC5zdGRvdXQub24oJ2RhdGEnLCAoZGF0YSkgLT5cbiAgICAgICAgc3Rkb3V0ICs9IGRhdGFcbiAgICAgIClcbiAgICAgIGNtZC5zdGRlcnIub24oJ2RhdGEnLCAoZGF0YSkgLT5cbiAgICAgICAgc3RkZXJyICs9IGRhdGFcbiAgICAgIClcbiAgICAgIGNtZC5vbignY2xvc2UnLCAocmV0dXJuQ29kZSkgPT5cbiAgICAgICAgQGRlYnVnKCdzcGF3biBkb25lJywgcmV0dXJuQ29kZSwgc3RkZXJyLCBzdGRvdXQpXG4gICAgICAgIHJlc29sdmUoe3JldHVybkNvZGUsIHN0ZG91dCwgc3RkZXJyfSlcbiAgICAgIClcbiAgICAgIGNtZC5vbignZXJyb3InLCAoZXJyKSA9PlxuICAgICAgICBAZGVidWcoJ2Vycm9yJywgZXJyKVxuICAgICAgICByZWplY3QoZXJyKVxuICAgICAgKVxuXG4gICAgICBvblN0ZGluIGNtZC5zdGRpbiBpZiBvblN0ZGluXG4gICAgKVxuXG5cbiAgIyMjXG4gIEFkZCBoZWxwIHRvIGVycm9yLmRlc2NyaXB0aW9uXG5cbiAgTm90ZTogZXJyb3IuZGVzY3JpcHRpb24gaXMgbm90IG9mZmljaWFsbHkgdXNlZCBpbiBKYXZhU2NyaXB0LFxuICBob3dldmVyIGl0IGlzIHVzZWQgaW50ZXJuYWxseSBmb3IgQXRvbSBCZWF1dGlmeSB3aGVuIGRpc3BsYXlpbmcgZXJyb3JzLlxuICAjIyNcbiAgY29tbWFuZE5vdEZvdW5kRXJyb3I6IChleGUsIGhlbHApIC0+XG4gICAgZXhlID89IEBuYW1lIG9yIEBjbWRcbiAgICBAY29uc3RydWN0b3IuY29tbWFuZE5vdEZvdW5kRXJyb3IoZXhlLCBoZWxwKVxuXG4gIEBjb21tYW5kTm90Rm91bmRFcnJvcjogKGV4ZSwgaGVscCkgLT5cbiAgICAjIENyZWF0ZSBuZXcgaW1wcm92ZWQgZXJyb3JcbiAgICAjIG5vdGlmeSB1c2VyIHRoYXQgaXQgbWF5IG5vdCBiZVxuICAgICMgaW5zdGFsbGVkIG9yIGluIHBhdGhcbiAgICBtZXNzYWdlID0gXCJDb3VsZCBub3QgZmluZCAnI3tleGV9Jy4gXFxcbiAgICAgICAgICAgIFRoZSBwcm9ncmFtIG1heSBub3QgYmUgaW5zdGFsbGVkLlwiXG4gICAgZXIgPSBuZXcgRXJyb3IobWVzc2FnZSlcbiAgICBlci5jb2RlID0gJ0NvbW1hbmROb3RGb3VuZCdcbiAgICBlci5lcnJubyA9IGVyLmNvZGVcbiAgICBlci5zeXNjYWxsID0gJ2JlYXV0aWZpZXI6OnJ1bidcbiAgICBlci5maWxlID0gZXhlXG4gICAgaWYgaGVscD9cbiAgICAgIGlmIHR5cGVvZiBoZWxwIGlzIFwib2JqZWN0XCJcbiAgICAgICAgIyBCYXNpYyBub3RpY2VcbiAgICAgICAgZG9jc0xpbmsgPSBcImh0dHBzOi8vZ2l0aHViLmNvbS9HbGF2aW4wMDEvYXRvbS1iZWF1dGlmeSNiZWF1dGlmaWVyc1wiXG4gICAgICAgIGhlbHBTdHIgPSBcIlNlZSAje2V4ZX0gaW5zdGFsbGF0aW9uIGluc3RydWN0aW9ucyBhdCAje2RvY3NMaW5rfSN7aWYgaGVscC5saW5rIHRoZW4gKCcgb3IgZ28gdG8gJytoZWxwLmxpbmspIGVsc2UgJyd9XFxuXCJcbiAgICAgICAgIyAjIEhlbHAgdG8gY29uZmlndXJlIEF0b20gQmVhdXRpZnkgZm9yIHByb2dyYW0ncyBwYXRoXG4gICAgICAgIGhlbHBTdHIgKz0gXCJZb3UgY2FuIGNvbmZpZ3VyZSBBdG9tIEJlYXV0aWZ5IFxcXG4gICAgICAgICAgICAgICAgICAgIHdpdGggdGhlIGFic29sdXRlIHBhdGggXFxcbiAgICAgICAgICAgICAgICAgICAgdG8gJyN7aGVscC5wcm9ncmFtIG9yIGV4ZX0nIGJ5IHNldHRpbmcgXFxcbiAgICAgICAgICAgICAgICAgICAgJyN7aGVscC5wYXRoT3B0aW9ufScgaW4gXFxcbiAgICAgICAgICAgICAgICAgICAgdGhlIEF0b20gQmVhdXRpZnkgcGFja2FnZSBzZXR0aW5ncy5cXG5cIiBpZiBoZWxwLnBhdGhPcHRpb25cbiAgICAgICAgaGVscFN0ciArPSBcIllvdXIgcHJvZ3JhbSBpcyBwcm9wZXJseSBpbnN0YWxsZWQgaWYgcnVubmluZyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcje2lmIEBpc1dpbmRvd3MoKSB0aGVuICd3aGVyZS5leGUnIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSAnd2hpY2gnfSAje2V4ZX0nIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW4geW91ciAje2lmIEBpc1dpbmRvd3MoKSB0aGVuICdDTUQgcHJvbXB0JyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgJ1Rlcm1pbmFsJ30gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5zIGFuIGFic29sdXRlIHBhdGggdG8gdGhlIGV4ZWN1dGFibGUuXFxuXCJcbiAgICAgICAgIyAjIE9wdGlvbmFsLCBhZGRpdGlvbmFsIGhlbHBcbiAgICAgICAgaGVscFN0ciArPSBoZWxwLmFkZGl0aW9uYWwgaWYgaGVscC5hZGRpdGlvbmFsXG4gICAgICAgIGVyLmRlc2NyaXB0aW9uID0gaGVscFN0clxuICAgICAgZWxzZSAjaWYgdHlwZW9mIGhlbHAgaXMgXCJzdHJpbmdcIlxuICAgICAgICBlci5kZXNjcmlwdGlvbiA9IGhlbHBcbiAgICByZXR1cm4gZXJcblxuXG4gIEBfZW52Q2FjaGUgPSBudWxsXG4gIHNoZWxsRW52OiAoKSAtPlxuICAgIGVudiA9IEBjb25zdHJ1Y3Rvci5zaGVsbEVudigpXG4gICAgQGRlYnVnKFwiZW52XCIsIGVudilcbiAgICByZXR1cm4gZW52XG4gIEBzaGVsbEVudjogKCkgLT5cbiAgICBQcm9taXNlLnJlc29sdmUocHJvY2Vzcy5lbnYpXG5cbiAgIyMjXG4gIExpa2UgdGhlIHVuaXggd2hpY2ggdXRpbGl0eS5cblxuICBGaW5kcyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgYSBzcGVjaWZpZWQgZXhlY3V0YWJsZSBpbiB0aGUgUEFUSCBlbnZpcm9ubWVudCB2YXJpYWJsZS5cbiAgRG9lcyBub3QgY2FjaGUgdGhlIHJlc3VsdHMsXG4gIHNvIGhhc2ggLXIgaXMgbm90IG5lZWRlZCB3aGVuIHRoZSBQQVRIIGNoYW5nZXMuXG4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vaXNhYWNzL25vZGUtd2hpY2hcbiAgIyMjXG4gIHdoaWNoOiAoZXhlLCBvcHRpb25zKSAtPlxuICAgIEAuY29uc3RydWN0b3Iud2hpY2goZXhlLCBvcHRpb25zKVxuICBAX3doaWNoQ2FjaGUgPSB7fVxuICBAd2hpY2g6IChleGUsIG9wdGlvbnMgPSB7fSkgLT5cbiAgICBpZiBAX3doaWNoQ2FjaGVbZXhlXVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShAX3doaWNoQ2FjaGVbZXhlXSlcbiAgICAjIEdldCBQQVRIIGFuZCBvdGhlciBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAgICBAc2hlbGxFbnYoKVxuICAgICAgLnRoZW4oKGVudikgPT5cbiAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICAgICBvcHRpb25zLnBhdGggPz0gZW52LlBBVEhcbiAgICAgICAgICBpZiBAaXNXaW5kb3dzKClcbiAgICAgICAgICAgICMgRW52aXJvbm1lbnQgdmFyaWFibGVzIGFyZSBjYXNlLWluc2Vuc2l0aXZlIGluIHdpbmRvd3NcbiAgICAgICAgICAgICMgQ2hlY2sgZW52IGZvciBhIGNhc2UtaW5zZW5zaXRpdmUgJ3BhdGgnIHZhcmlhYmxlXG4gICAgICAgICAgICBpZiAhb3B0aW9ucy5wYXRoXG4gICAgICAgICAgICAgIGZvciBpIG9mIGVudlxuICAgICAgICAgICAgICAgIGlmIGkudG9Mb3dlckNhc2UoKSBpcyBcInBhdGhcIlxuICAgICAgICAgICAgICAgICAgb3B0aW9ucy5wYXRoID0gZW52W2ldXG4gICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICAjIFRyaWNrIG5vZGUtd2hpY2ggaW50byBpbmNsdWRpbmcgZmlsZXNcbiAgICAgICAgICAgICMgd2l0aCBubyBleHRlbnNpb24gYXMgZXhlY3V0YWJsZXMuXG4gICAgICAgICAgICAjIFB1dCBlbXB0eSBleHRlbnNpb24gbGFzdCB0byBhbGxvdyBmb3Igb3RoZXIgcmVhbCBleHRlbnNpb25zIGZpcnN0XG4gICAgICAgICAgICBvcHRpb25zLnBhdGhFeHQgPz0gXCIje3Byb2Nlc3MuZW52LlBBVEhFWFQgPyAnLkVYRSd9O1wiXG4gICAgICAgICAgd2hpY2goZXhlLCBvcHRpb25zLCAoZXJyLCBwYXRoKSA9PlxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZXhlKSBpZiBlcnJcbiAgICAgICAgICAgIEBfd2hpY2hDYWNoZVtleGVdID0gcGF0aFxuICAgICAgICAgICAgcmVzb2x2ZShwYXRoKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuXG4gICMjI1xuICBJZiBwbGF0Zm9ybSBpcyBXaW5kb3dzXG4gICMjI1xuICBpc1dpbmRvd3M6ICgpIC0+IEBjb25zdHJ1Y3Rvci5pc1dpbmRvd3MoKVxuICBAaXNXaW5kb3dzOiAoKSAtPiBuZXcgUmVnRXhwKCded2luJykudGVzdChwcm9jZXNzLnBsYXRmb3JtKVxuXG5jbGFzcyBIeWJyaWRFeGVjdXRhYmxlIGV4dGVuZHMgRXhlY3V0YWJsZVxuXG4gIGRvY2tlck9wdGlvbnM6IHtcbiAgICBpbWFnZTogdW5kZWZpbmVkXG4gICAgd29ya2luZ0RpcjogXCIvd29ya2RpclwiXG4gIH1cblxuICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIob3B0aW9ucylcbiAgICBpZiBvcHRpb25zLmRvY2tlcj9cbiAgICAgIEBkb2NrZXJPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgQGRvY2tlck9wdGlvbnMsIG9wdGlvbnMuZG9ja2VyKVxuICAgICAgQGRvY2tlciA9IEBjb25zdHJ1Y3Rvci5kb2NrZXJFeGVjdXRhYmxlKClcblxuICBAZG9ja2VyOiB1bmRlZmluZWRcbiAgQGRvY2tlckV4ZWN1dGFibGU6ICgpIC0+XG4gICAgaWYgbm90IEBkb2NrZXI/XG4gICAgICBAZG9ja2VyID0gbmV3IEV4ZWN1dGFibGUoe1xuICAgICAgICBuYW1lOiBcIkRvY2tlclwiXG4gICAgICAgIGNtZDogXCJkb2NrZXJcIlxuICAgICAgICBob21lcGFnZTogXCJodHRwczovL3d3dy5kb2NrZXIuY29tL1wiXG4gICAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL3d3dy5kb2NrZXIuY29tL2dldC1kb2NrZXJcIlxuICAgICAgICB2ZXJzaW9uOiB7XG4gICAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPiB0ZXh0Lm1hdGNoKC92ZXJzaW9uIFswXSooWzEtOV1cXGQqKS5bMF0qKFsxLTldXFxkKikuWzBdKihbMS05XVxcZCopLykuc2xpY2UoMSkuam9pbignLicpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgcmV0dXJuIEBkb2NrZXJcblxuICBpbnN0YWxsZWRXaXRoRG9ja2VyOiBmYWxzZVxuICBpbml0OiAoKSAtPlxuICAgIHN1cGVyKClcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcikgaWYgbm90IEBkb2NrZXI/XG4gICAgICAgIEBkb2NrZXIuaW5pdCgpXG4gICAgICAgICAgLnRoZW4oPT4gQHJ1bkltYWdlKEB2ZXJzaW9uQXJncywgQHZlcnNpb25SdW5PcHRpb25zKSlcbiAgICAgICAgICAudGhlbigodGV4dCkgPT4gQHNhdmVWZXJzaW9uKHRleHQpKVxuICAgICAgICAgIC50aGVuKCgpID0+IEBpbnN0YWxsZWRXaXRoRG9ja2VyID0gdHJ1ZSlcbiAgICAgICAgICAudGhlbig9PiBAKVxuICAgICAgICAgIC5jYXRjaCgoZG9ja2VyRXJyb3IpID0+XG4gICAgICAgICAgICBAZGVidWcoZG9ja2VyRXJyb3IpXG4gICAgICAgICAgICBQcm9taXNlLnJlamVjdChlcnJvcilcbiAgICAgICAgICApXG4gICAgICApXG5cbiAgcnVuOiAoYXJncywgb3B0aW9ucyA9IHt9KSAtPlxuICAgIGlmIEBpbnN0YWxsZWRXaXRoRG9ja2VyIGFuZCBAZG9ja2VyIGFuZCBAZG9ja2VyLmlzSW5zdGFsbGVkXG4gICAgICByZXR1cm4gQHJ1bkltYWdlKGFyZ3MsIG9wdGlvbnMpXG4gICAgc3VwZXIoYXJncywgb3B0aW9ucylcblxuICBydW5JbWFnZTogKGFyZ3MsIG9wdGlvbnMpIC0+XG4gICAgQGRlYnVnKFwiUnVuIERvY2tlciBleGVjdXRhYmxlOiBcIiwgYXJncywgb3B0aW9ucylcbiAgICB0aGlzLnJlc29sdmVBcmdzKGFyZ3MpXG4gICAgICAudGhlbigoYXJncykgPT5cbiAgICAgICAgeyBjd2QgfSA9IG9wdGlvbnNcbiAgICAgICAgdG1wRGlyID0gb3MudG1wRGlyKClcbiAgICAgICAgcHdkID0gZnMucmVhbHBhdGhTeW5jKGN3ZCBvciB0bXBEaXIpXG4gICAgICAgIGltYWdlID0gQGRvY2tlck9wdGlvbnMuaW1hZ2VcbiAgICAgICAgd29ya2luZ0RpciA9IEBkb2NrZXJPcHRpb25zLndvcmtpbmdEaXJcblxuICAgICAgICByb290UGF0aCA9ICcvbW91bnRlZFJvb3QnXG4gICAgICAgIG5ld0FyZ3MgPSBhcmdzLm1hcCgoYXJnKSAtPlxuICAgICAgICAgIGlmICh0eXBlb2YgYXJnIGlzICdzdHJpbmcnIGFuZCBub3QgYXJnLmluY2x1ZGVzKCc6JykgXFxcbiAgICAgICAgICAgIGFuZCBwYXRoLmlzQWJzb2x1dGUoYXJnKSBhbmQgbm90IHBhdGguZGlybmFtZShhcmcpLnN0YXJ0c1dpdGgodG1wRGlyKSlcbiAgICAgICAgICAgIHRoZW4gcGF0aC5qb2luKHJvb3RQYXRoLCBhcmcpIGVsc2UgYXJnXG4gICAgICAgIClcblxuICAgICAgICBAZG9ja2VyLnJ1bihbXG4gICAgICAgICAgICBcInJ1blwiLFxuICAgICAgICAgICAgXCItLXZvbHVtZVwiLCBcIiN7cHdkfToje3dvcmtpbmdEaXJ9XCIsXG4gICAgICAgICAgICBcIi0tdm9sdW1lXCIsIFwiI3twYXRoLnJlc29sdmUoJy8nKX06I3tyb290UGF0aH1cIixcbiAgICAgICAgICAgIFwiLS13b3JrZGlyXCIsIHdvcmtpbmdEaXIsXG4gICAgICAgICAgICBpbWFnZSxcbiAgICAgICAgICAgIG5ld0FyZ3NcbiAgICAgICAgICBdLFxuICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgKVxuICAgICAgKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gSHlicmlkRXhlY3V0YWJsZVxuIl19
