(function() {
  var Beautifier, Promise, _, fs, path, readFile, spawn, temp, which;

  Promise = require('bluebird');

  _ = require('lodash');

  fs = require('fs');

  temp = require('temp').track();

  readFile = Promise.promisify(fs.readFile);

  which = require('which');

  spawn = require('child_process').spawn;

  path = require('path');

  module.exports = Beautifier = (function() {

    /*
    Promise
     */
    Beautifier.prototype.Promise = Promise;


    /*
    Name of Beautifier
     */

    Beautifier.prototype.name = 'Beautifier';


    /*
    Supported Options
    
    Enable options for supported languages.
    - <string:language>:<boolean:all_options_enabled>
    - <string:language>:<string:option_key>:<boolean:enabled>
    - <string:language>:<string:option_key>:<string:rename>
    - <string:language>:<string:option_key>:<function:transform>
    - <string:language>:<string:option_key>:<array:mapper>
     */

    Beautifier.prototype.options = {};


    /*
    Supported languages by this Beautifier
    
    Extracted from the keys of the `options` field.
     */

    Beautifier.prototype.languages = null;


    /*
    Beautify text
    
    Override this method in subclasses
     */

    Beautifier.prototype.beautify = null;


    /*
    Show deprecation warning to user.
     */

    Beautifier.prototype.deprecate = function(warning) {
      var ref;
      return (ref = atom.notifications) != null ? ref.addWarning(warning) : void 0;
    };


    /*
    Create temporary file
     */

    Beautifier.prototype.tempFile = function(name, contents, ext) {
      if (name == null) {
        name = "atom-beautify-temp";
      }
      if (contents == null) {
        contents = "";
      }
      if (ext == null) {
        ext = "";
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return temp.open({
            prefix: name,
            suffix: ext
          }, function(err, info) {
            _this.debug('tempFile', name, err, info);
            if (err) {
              return reject(err);
            }
            return fs.write(info.fd, contents, function(err) {
              if (err) {
                return reject(err);
              }
              return fs.close(info.fd, function(err) {
                if (err) {
                  return reject(err);
                }
                return resolve(info.path);
              });
            });
          });
        };
      })(this));
    };


    /*
    Read file
     */

    Beautifier.prototype.readFile = function(filePath) {
      return Promise.resolve(filePath).then(function(filePath) {
        return readFile(filePath, "utf8");
      });
    };


    /*
    Find file
     */

    Beautifier.prototype.findFile = function(startDir, fileNames) {
      var currentDir, fileName, filePath, j, len;
      if (!arguments.length) {
        throw new Error("Specify file names to find.");
      }
      if (!(fileNames instanceof Array)) {
        fileNames = [fileNames];
      }
      startDir = startDir.split(path.sep);
      while (startDir.length) {
        currentDir = startDir.join(path.sep);
        for (j = 0, len = fileNames.length; j < len; j++) {
          fileName = fileNames[j];
          filePath = path.join(currentDir, fileName);
          try {
            fs.accessSync(filePath, fs.R_OK);
            return filePath;
          } catch (error) {}
        }
        startDir.pop();
      }
      return null;
    };


    /*
    If platform is Windows
     */

    Beautifier.prototype.isWindows = (function() {
      return new RegExp('^win').test(process.platform);
    })();


    /*
    Get Shell Environment variables
    
    Special thank you to @ioquatix
    See https://github.com/ioquatix/script-runner/blob/v1.5.0/lib/script-runner.coffee#L45-L63
     */

    Beautifier.prototype._envCache = null;

    Beautifier.prototype._envCacheDate = null;

    Beautifier.prototype._envCacheExpiry = 10000;

    Beautifier.prototype.getShellEnvironment = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var buffer, child;
          if ((_this._envCache != null) && (_this._envCacheDate != null)) {
            if ((new Date() - _this._envCacheDate) < _this._envCacheExpiry) {
              return resolve(_this._envCache);
            }
          }
          if (_this.isWindows) {
            return resolve(process.env);
          } else {
            child = spawn(process.env.SHELL, ['-ilc', 'env'], {
              detached: true,
              stdio: ['ignore', 'pipe', process.stderr]
            });
            buffer = '';
            child.stdout.on('data', function(data) {
              return buffer += data;
            });
            return child.on('close', function(code, signal) {
              var definition, environment, j, key, len, ref, ref1, value;
              if (code !== 0) {
                return reject(new Error("Could not get Shell Environment. Exit code: " + code + ", Signal: " + signal));
              }
              environment = {};
              ref = buffer.split('\n');
              for (j = 0, len = ref.length; j < len; j++) {
                definition = ref[j];
                ref1 = definition.split('=', 2), key = ref1[0], value = ref1[1];
                if (key !== '') {
                  environment[key] = value;
                }
              }
              _this._envCache = environment;
              _this._envCacheDate = new Date();
              return resolve(environment);
            });
          }
        };
      })(this));
    };


    /*
    Like the unix which utility.
    
    Finds the first instance of a specified executable in the PATH environment variable.
    Does not cache the results,
    so hash -r is not needed when the PATH changes.
    See https://github.com/isaacs/node-which
     */

    Beautifier.prototype.which = function(exe, options) {
      if (options == null) {
        options = {};
      }
      return this.getShellEnvironment().then((function(_this) {
        return function(env) {
          return new Promise(function(resolve, reject) {
            var i, ref;
            if (options.path == null) {
              options.path = env.PATH;
            }
            if (_this.isWindows) {
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
                resolve(exe);
              }
              return resolve(path);
            });
          });
        };
      })(this));
    };


    /*
    Add help to error.description
    
    Note: error.description is not officially used in JavaScript,
    however it is used internally for Atom Beautify when displaying errors.
     */

    Beautifier.prototype.commandNotFoundError = function(exe, help) {
      var docsLink, er, helpStr, issueSearchLink, message;
      message = "Could not find '" + exe + "'. The program may not be installed.";
      er = new Error(message);
      er.code = 'CommandNotFound';
      er.errno = er.code;
      er.syscall = 'beautifier::run';
      er.file = exe;
      if (help != null) {
        if (typeof help === "object") {
          helpStr = "See " + help.link + " for program installation instructions.\n";
          if (help.pathOption) {
            helpStr += "You can configure Atom Beautify with the absolute path to '" + (help.program || exe) + "' by setting '" + help.pathOption + "' in the Atom Beautify package settings.\n";
          }
          if (help.additional) {
            helpStr += help.additional;
          }
          issueSearchLink = "https://github.com/Glavin001/atom-beautify/search?q=" + exe + "&type=Issues";
          docsLink = "https://github.com/Glavin001/atom-beautify/tree/master/docs";
          helpStr += "Your program is properly installed if running '" + (this.isWindows ? 'where.exe' : 'which') + " " + exe + "' in your " + (this.isWindows ? 'CMD prompt' : 'Terminal') + " returns an absolute path to the executable. If this does not work then you have not installed the program correctly and so Atom Beautify will not find the program. Atom Beautify requires that the program be found in your PATH environment variable. \nNote that this is not an Atom Beautify issue if beautification does not work and the above command also does not work: this is expected behaviour, since you have not properly installed your program. Please properly setup the program and search through existing Atom Beautify issues before creating a new issue. See " + issueSearchLink + " for related Issues and " + docsLink + " for documentation. If you are still unable to resolve this issue on your own then please create a new issue and ask for help.\n";
          er.description = helpStr;
        } else {
          er.description = help;
        }
      }
      return er;
    };


    /*
    Run command-line interface command
     */

    Beautifier.prototype.run = function(executable, args, arg) {
      var cwd, help, ignoreReturnCode, onStdin, ref;
      ref = arg != null ? arg : {}, cwd = ref.cwd, ignoreReturnCode = ref.ignoreReturnCode, help = ref.help, onStdin = ref.onStdin;
      args = _.flatten(args);
      return Promise.all([executable, Promise.all(args)]).then((function(_this) {
        return function(arg1) {
          var args, exeName;
          exeName = arg1[0], args = arg1[1];
          _this.debug('exeName, args:', exeName, args);
          return Promise.all([exeName, args, _this.getShellEnvironment(), _this.which(exeName)]);
        };
      })(this)).then((function(_this) {
        return function(arg1) {
          var args, env, exe, exeName, exePath, options;
          exeName = arg1[0], args = arg1[1], env = arg1[2], exePath = arg1[3];
          _this.debug('exePath, env:', exePath, env);
          _this.debug('args', args);
          exe = exePath != null ? exePath : exeName;
          options = {
            cwd: cwd,
            env: env
          };
          return _this.spawn(exe, args, options, onStdin).then(function(arg2) {
            var returnCode, stderr, stdout, windowsProgramNotFoundMsg;
            returnCode = arg2.returnCode, stdout = arg2.stdout, stderr = arg2.stderr;
            _this.verbose('spawn result', returnCode, stdout, stderr);
            if (!ignoreReturnCode && returnCode !== 0) {
              windowsProgramNotFoundMsg = "is not recognized as an internal or external command";
              _this.verbose(stderr, windowsProgramNotFoundMsg);
              if (_this.isWindows && returnCode === 1 && stderr.indexOf(windowsProgramNotFoundMsg) !== -1) {
                throw _this.commandNotFoundError(exeName, help);
              } else {
                throw new Error(stderr);
              }
            } else {
              return stdout;
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


    /*
    Spawn
     */

    Beautifier.prototype.spawn = function(exe, args, options, onStdin) {
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
    Logger instance
     */

    Beautifier.prototype.logger = null;


    /*
    Initialize and configure Logger
     */

    Beautifier.prototype.setupLogger = function() {
      var key, method, ref;
      this.logger = require('../logger')(__filename);
      ref = this.logger;
      for (key in ref) {
        method = ref[key];
        this[key] = method;
      }
      return this.verbose(this.name + " beautifier logger has been initialized.");
    };


    /*
    Constructor to setup beautifer
     */

    function Beautifier() {
      var globalOptions, lang, options, ref;
      this.setupLogger();
      if (this.options._ != null) {
        globalOptions = this.options._;
        delete this.options._;
        if (typeof globalOptions === "object") {
          ref = this.options;
          for (lang in ref) {
            options = ref[lang];
            if (typeof options === "boolean") {
              if (options === true) {
                this.options[lang] = globalOptions;
              }
            } else if (typeof options === "object") {
              this.options[lang] = _.merge(globalOptions, options);
            } else {
              this.warn(("Unsupported options type " + (typeof options) + " for language " + lang + ": ") + options);
            }
          }
        }
      }
      this.verbose("Options for " + this.name + ":", this.options);
      this.languages = _.keys(this.options);
    }

    return Beautifier;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2JlYXV0aWZpZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0VBQ1YsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUNKLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLEtBQWhCLENBQUE7O0VBQ1AsUUFBQSxHQUFXLE9BQU8sQ0FBQyxTQUFSLENBQWtCLEVBQUUsQ0FBQyxRQUFyQjs7RUFDWCxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxlQUFSLENBQXdCLENBQUM7O0VBQ2pDLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7QUFFckI7Ozt5QkFHQSxPQUFBLEdBQVM7OztBQUVUOzs7O3lCQUdBLElBQUEsR0FBTTs7O0FBRU47Ozs7Ozs7Ozs7O3lCQVVBLE9BQUEsR0FBUzs7O0FBRVQ7Ozs7Ozt5QkFLQSxTQUFBLEdBQVc7OztBQUVYOzs7Ozs7eUJBS0EsUUFBQSxHQUFVOzs7QUFFVjs7Ozt5QkFHQSxTQUFBLEdBQVcsU0FBQyxPQUFEO0FBQ1QsVUFBQTtxREFBa0IsQ0FBRSxVQUFwQixDQUErQixPQUEvQjtJQURTOzs7QUFHWDs7Ozt5QkFHQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQThCLFFBQTlCLEVBQTZDLEdBQTdDOztRQUFDLE9BQU87OztRQUFzQixXQUFXOzs7UUFBSSxNQUFNOztBQUMzRCxhQUFXLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVjtpQkFFakIsSUFBSSxDQUFDLElBQUwsQ0FBVTtZQUFDLE1BQUEsRUFBUSxJQUFUO1lBQWUsTUFBQSxFQUFRLEdBQXZCO1dBQVYsRUFBdUMsU0FBQyxHQUFELEVBQU0sSUFBTjtZQUNyQyxLQUFDLENBQUEsS0FBRCxDQUFPLFVBQVAsRUFBbUIsSUFBbkIsRUFBeUIsR0FBekIsRUFBOEIsSUFBOUI7WUFDQSxJQUFzQixHQUF0QjtBQUFBLHFCQUFPLE1BQUEsQ0FBTyxHQUFQLEVBQVA7O21CQUNBLEVBQUUsQ0FBQyxLQUFILENBQVMsSUFBSSxDQUFDLEVBQWQsRUFBa0IsUUFBbEIsRUFBNEIsU0FBQyxHQUFEO2NBQzFCLElBQXNCLEdBQXRCO0FBQUEsdUJBQU8sTUFBQSxDQUFPLEdBQVAsRUFBUDs7cUJBQ0EsRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFJLENBQUMsRUFBZCxFQUFrQixTQUFDLEdBQUQ7Z0JBQ2hCLElBQXNCLEdBQXRCO0FBQUEseUJBQU8sTUFBQSxDQUFPLEdBQVAsRUFBUDs7dUJBQ0EsT0FBQSxDQUFRLElBQUksQ0FBQyxJQUFiO2NBRmdCLENBQWxCO1lBRjBCLENBQTVCO1VBSHFDLENBQXZDO1FBRmlCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSO0lBREg7OztBQWdCVjs7Ozt5QkFHQSxRQUFBLEdBQVUsU0FBQyxRQUFEO2FBQ1IsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsUUFBaEIsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLFFBQUQ7QUFDSixlQUFPLFFBQUEsQ0FBUyxRQUFULEVBQW1CLE1BQW5CO01BREgsQ0FETjtJQURROzs7QUFNVjs7Ozt5QkFHQSxRQUFBLEdBQVUsU0FBQyxRQUFELEVBQVcsU0FBWDtBQUNSLFVBQUE7TUFBQSxJQUFBLENBQXFELFNBQVMsQ0FBQyxNQUEvRDtBQUFBLGNBQVUsSUFBQSxLQUFBLENBQU0sNkJBQU4sRUFBVjs7TUFDQSxJQUFBLENBQUEsQ0FBTyxTQUFBLFlBQXFCLEtBQTVCLENBQUE7UUFDRSxTQUFBLEdBQVksQ0FBQyxTQUFELEVBRGQ7O01BRUEsUUFBQSxHQUFXLFFBQVEsQ0FBQyxLQUFULENBQWUsSUFBSSxDQUFDLEdBQXBCO0FBQ1gsYUFBTSxRQUFRLENBQUMsTUFBZjtRQUNFLFVBQUEsR0FBYSxRQUFRLENBQUMsSUFBVCxDQUFjLElBQUksQ0FBQyxHQUFuQjtBQUNiLGFBQUEsMkNBQUE7O1VBQ0UsUUFBQSxHQUFXLElBQUksQ0FBQyxJQUFMLENBQVUsVUFBVixFQUFzQixRQUF0QjtBQUNYO1lBQ0UsRUFBRSxDQUFDLFVBQUgsQ0FBYyxRQUFkLEVBQXdCLEVBQUUsQ0FBQyxJQUEzQjtBQUNBLG1CQUFPLFNBRlQ7V0FBQTtBQUZGO1FBS0EsUUFBUSxDQUFDLEdBQVQsQ0FBQTtNQVBGO0FBUUEsYUFBTztJQWJDOzs7QUFlVjs7Ozt5QkFHQSxTQUFBLEdBQWMsQ0FBQSxTQUFBO0FBQ1osYUFBVyxJQUFBLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxJQUFmLENBQW9CLE9BQU8sQ0FBQyxRQUE1QjtJQURDLENBQUEsQ0FBSCxDQUFBOzs7QUFHWDs7Ozs7Ozt5QkFNQSxTQUFBLEdBQVc7O3lCQUNYLGFBQUEsR0FBZTs7eUJBQ2YsZUFBQSxHQUFpQjs7eUJBQ2pCLG1CQUFBLEdBQXFCLFNBQUE7QUFDbkIsYUFBVyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFFakIsY0FBQTtVQUFBLElBQUcseUJBQUEsSUFBZ0IsNkJBQW5CO1lBRUUsSUFBRyxDQUFLLElBQUEsSUFBQSxDQUFBLENBQUosR0FBYSxLQUFDLENBQUEsYUFBZixDQUFBLEdBQWdDLEtBQUMsQ0FBQSxlQUFwQztBQUVFLHFCQUFPLE9BQUEsQ0FBUSxLQUFDLENBQUEsU0FBVCxFQUZUO2FBRkY7O1VBT0EsSUFBRyxLQUFDLENBQUEsU0FBSjttQkFHRSxPQUFBLENBQVEsT0FBTyxDQUFDLEdBQWhCLEVBSEY7V0FBQSxNQUFBO1lBV0UsS0FBQSxHQUFRLEtBQUEsQ0FBTSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQWxCLEVBQXlCLENBQUMsTUFBRCxFQUFTLEtBQVQsQ0FBekIsRUFFTjtjQUFBLFFBQUEsRUFBVSxJQUFWO2NBRUEsS0FBQSxFQUFPLENBQUMsUUFBRCxFQUFXLE1BQVgsRUFBbUIsT0FBTyxDQUFDLE1BQTNCLENBRlA7YUFGTTtZQU1SLE1BQUEsR0FBUztZQUNULEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBYixDQUFnQixNQUFoQixFQUF3QixTQUFDLElBQUQ7cUJBQVUsTUFBQSxJQUFVO1lBQXBCLENBQXhCO21CQUVBLEtBQUssQ0FBQyxFQUFOLENBQVMsT0FBVCxFQUFrQixTQUFDLElBQUQsRUFBTyxNQUFQO0FBQ2hCLGtCQUFBO2NBQUEsSUFBRyxJQUFBLEtBQVUsQ0FBYjtBQUNFLHVCQUFPLE1BQUEsQ0FBVyxJQUFBLEtBQUEsQ0FBTSw4Q0FBQSxHQUErQyxJQUEvQyxHQUFvRCxZQUFwRCxHQUFpRSxNQUF2RSxDQUFYLEVBRFQ7O2NBRUEsV0FBQSxHQUFjO0FBQ2Q7QUFBQSxtQkFBQSxxQ0FBQTs7Z0JBQ0UsT0FBZSxVQUFVLENBQUMsS0FBWCxDQUFpQixHQUFqQixFQUFzQixDQUF0QixDQUFmLEVBQUMsYUFBRCxFQUFNO2dCQUNOLElBQTRCLEdBQUEsS0FBTyxFQUFuQztrQkFBQSxXQUFZLENBQUEsR0FBQSxDQUFaLEdBQW1CLE1BQW5COztBQUZGO2NBSUEsS0FBQyxDQUFBLFNBQUQsR0FBYTtjQUNiLEtBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsSUFBQSxDQUFBO3FCQUNyQixPQUFBLENBQVEsV0FBUjtZQVZnQixDQUFsQixFQXBCRjs7UUFUaUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVI7SUFEUTs7O0FBMkNyQjs7Ozs7Ozs7O3lCQVFBLEtBQUEsR0FBTyxTQUFDLEdBQUQsRUFBTSxPQUFOOztRQUFNLFVBQVU7O2FBRXJCLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQ0EsQ0FBQyxJQURELENBQ00sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7aUJBQ0EsSUFBQSxPQUFBLENBQVEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNWLGdCQUFBOztjQUFBLE9BQU8sQ0FBQyxPQUFRLEdBQUcsQ0FBQzs7WUFDcEIsSUFBRyxLQUFDLENBQUEsU0FBSjtjQUdFLElBQUcsQ0FBQyxPQUFPLENBQUMsSUFBWjtBQUNFLHFCQUFBLFFBQUE7a0JBQ0UsSUFBRyxDQUFDLENBQUMsV0FBRixDQUFBLENBQUEsS0FBbUIsTUFBdEI7b0JBQ0UsT0FBTyxDQUFDLElBQVIsR0FBZSxHQUFJLENBQUEsQ0FBQTtBQUNuQiwwQkFGRjs7QUFERixpQkFERjs7O2dCQVNBLE9BQU8sQ0FBQyxVQUFhLDZDQUF1QixNQUF2QixDQUFBLEdBQThCO2VBWnJEOzttQkFhQSxLQUFBLENBQU0sR0FBTixFQUFXLE9BQVgsRUFBb0IsU0FBQyxHQUFELEVBQU0sSUFBTjtjQUNsQixJQUFnQixHQUFoQjtnQkFBQSxPQUFBLENBQVEsR0FBUixFQUFBOztxQkFDQSxPQUFBLENBQVEsSUFBUjtZQUZrQixDQUFwQjtVQWZVLENBQVI7UUFEQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETjtJQUZLOzs7QUEwQlA7Ozs7Ozs7eUJBTUEsb0JBQUEsR0FBc0IsU0FBQyxHQUFELEVBQU0sSUFBTjtBQUlwQixVQUFBO01BQUEsT0FBQSxHQUFVLGtCQUFBLEdBQW1CLEdBQW5CLEdBQXVCO01BRWpDLEVBQUEsR0FBUyxJQUFBLEtBQUEsQ0FBTSxPQUFOO01BQ1QsRUFBRSxDQUFDLElBQUgsR0FBVTtNQUNWLEVBQUUsQ0FBQyxLQUFILEdBQVcsRUFBRSxDQUFDO01BQ2QsRUFBRSxDQUFDLE9BQUgsR0FBYTtNQUNiLEVBQUUsQ0FBQyxJQUFILEdBQVU7TUFDVixJQUFHLFlBQUg7UUFDRSxJQUFHLE9BQU8sSUFBUCxLQUFlLFFBQWxCO1VBRUUsT0FBQSxHQUFVLE1BQUEsR0FBTyxJQUFJLENBQUMsSUFBWixHQUFpQjtVQUczQixJQUlzRCxJQUFJLENBQUMsVUFKM0Q7WUFBQSxPQUFBLElBQVcsNkRBQUEsR0FFTSxDQUFDLElBQUksQ0FBQyxPQUFMLElBQWdCLEdBQWpCLENBRk4sR0FFMkIsZ0JBRjNCLEdBR0ksSUFBSSxDQUFDLFVBSFQsR0FHb0IsNkNBSC9COztVQU1BLElBQThCLElBQUksQ0FBQyxVQUFuQztZQUFBLE9BQUEsSUFBVyxJQUFJLENBQUMsV0FBaEI7O1VBRUEsZUFBQSxHQUNFLHNEQUFBLEdBQ21CLEdBRG5CLEdBQ3VCO1VBQ3pCLFFBQUEsR0FBVztVQUVYLE9BQUEsSUFBVyxpREFBQSxHQUNXLENBQUksSUFBQyxDQUFBLFNBQUosR0FBbUIsV0FBbkIsR0FDRSxPQURILENBRFgsR0FFc0IsR0FGdEIsR0FFeUIsR0FGekIsR0FFNkIsWUFGN0IsR0FHa0IsQ0FBSSxJQUFDLENBQUEsU0FBSixHQUFtQixZQUFuQixHQUNMLFVBREksQ0FIbEIsR0FJeUIsd2pCQUp6QixHQWtCZSxlQWxCZixHQWtCK0IsMEJBbEIvQixHQW1CVyxRQW5CWCxHQW1Cb0I7VUFJL0IsRUFBRSxDQUFDLFdBQUgsR0FBaUIsUUF6Q25CO1NBQUEsTUFBQTtVQTJDRSxFQUFFLENBQUMsV0FBSCxHQUFpQixLQTNDbkI7U0FERjs7QUE2Q0EsYUFBTztJQXhEYTs7O0FBMER0Qjs7Ozt5QkFHQSxHQUFBLEdBQUssU0FBQyxVQUFELEVBQWEsSUFBYixFQUFtQixHQUFuQjtBQUVILFVBQUE7MEJBRnNCLE1BQXlDLElBQXhDLGVBQUsseUNBQWtCLGlCQUFNO01BRXBELElBQUEsR0FBTyxDQUFDLENBQUMsT0FBRixDQUFVLElBQVY7YUFHUCxPQUFPLENBQUMsR0FBUixDQUFZLENBQUMsVUFBRCxFQUFhLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWixDQUFiLENBQVosQ0FDRSxDQUFDLElBREgsQ0FDUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtBQUNKLGNBQUE7VUFETSxtQkFBUztVQUNmLEtBQUMsQ0FBQSxLQUFELENBQU8sZ0JBQVAsRUFBeUIsT0FBekIsRUFBa0MsSUFBbEM7aUJBR0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFDLE9BQUQsRUFBVSxJQUFWLEVBQWdCLEtBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQWhCLEVBQXdDLEtBQUMsQ0FBQSxLQUFELENBQU8sT0FBUCxDQUF4QyxDQUFaO1FBSkk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRFIsQ0FPRSxDQUFDLElBUEgsQ0FPUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtBQUNKLGNBQUE7VUFETSxtQkFBUyxnQkFBTSxlQUFLO1VBQzFCLEtBQUMsQ0FBQSxLQUFELENBQU8sZUFBUCxFQUF3QixPQUF4QixFQUFpQyxHQUFqQztVQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sTUFBUCxFQUFlLElBQWY7VUFFQSxHQUFBLHFCQUFNLFVBQVU7VUFDaEIsT0FBQSxHQUFVO1lBQ1IsR0FBQSxFQUFLLEdBREc7WUFFUixHQUFBLEVBQUssR0FGRzs7aUJBS1YsS0FBQyxDQUFBLEtBQUQsQ0FBTyxHQUFQLEVBQVksSUFBWixFQUFrQixPQUFsQixFQUEyQixPQUEzQixDQUNFLENBQUMsSUFESCxDQUNRLFNBQUMsSUFBRDtBQUNKLGdCQUFBO1lBRE0sOEJBQVksc0JBQVE7WUFDMUIsS0FBQyxDQUFBLE9BQUQsQ0FBUyxjQUFULEVBQXlCLFVBQXpCLEVBQXFDLE1BQXJDLEVBQTZDLE1BQTdDO1lBR0EsSUFBRyxDQUFJLGdCQUFKLElBQXlCLFVBQUEsS0FBZ0IsQ0FBNUM7Y0FFRSx5QkFBQSxHQUE0QjtjQUU1QixLQUFDLENBQUEsT0FBRCxDQUFTLE1BQVQsRUFBaUIseUJBQWpCO2NBRUEsSUFBRyxLQUFDLENBQUEsU0FBRCxJQUFlLFVBQUEsS0FBYyxDQUE3QixJQUFtQyxNQUFNLENBQUMsT0FBUCxDQUFlLHlCQUFmLENBQUEsS0FBK0MsQ0FBQyxDQUF0RjtBQUNFLHNCQUFNLEtBQUMsQ0FBQSxvQkFBRCxDQUFzQixPQUF0QixFQUErQixJQUEvQixFQURSO2VBQUEsTUFBQTtBQUdFLHNCQUFVLElBQUEsS0FBQSxDQUFNLE1BQU4sRUFIWjtlQU5GO2FBQUEsTUFBQTtxQkFXRSxPQVhGOztVQUpJLENBRFIsQ0FrQkUsRUFBQyxLQUFELEVBbEJGLENBa0JTLFNBQUMsR0FBRDtZQUNMLEtBQUMsQ0FBQSxLQUFELENBQU8sT0FBUCxFQUFnQixHQUFoQjtZQUdBLElBQUcsR0FBRyxDQUFDLElBQUosS0FBWSxRQUFaLElBQXdCLEdBQUcsQ0FBQyxLQUFKLEtBQWEsUUFBeEM7QUFDRSxvQkFBTSxLQUFDLENBQUEsb0JBQUQsQ0FBc0IsT0FBdEIsRUFBK0IsSUFBL0IsRUFEUjthQUFBLE1BQUE7QUFJRSxvQkFBTSxJQUpSOztVQUpLLENBbEJUO1FBVkk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUFI7SUFMRzs7O0FBb0RMOzs7O3lCQUdBLEtBQUEsR0FBTyxTQUFDLEdBQUQsRUFBTSxJQUFOLEVBQVksT0FBWixFQUFxQixPQUFyQjtNQUVMLElBQUEsR0FBTyxDQUFDLENBQUMsT0FBRixDQUFVLElBQVYsRUFBZ0IsTUFBaEI7TUFDUCxJQUFBLEdBQU8sQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFWLEVBQWdCLElBQWhCO0FBRVAsYUFBVyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDakIsY0FBQTtVQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sT0FBUCxFQUFnQixHQUFoQixFQUFxQixJQUFyQjtVQUVBLEdBQUEsR0FBTSxLQUFBLENBQU0sR0FBTixFQUFXLElBQVgsRUFBaUIsT0FBakI7VUFDTixNQUFBLEdBQVM7VUFDVCxNQUFBLEdBQVM7VUFFVCxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQVgsQ0FBYyxNQUFkLEVBQXNCLFNBQUMsSUFBRDttQkFDcEIsTUFBQSxJQUFVO1VBRFUsQ0FBdEI7VUFHQSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQVgsQ0FBYyxNQUFkLEVBQXNCLFNBQUMsSUFBRDttQkFDcEIsTUFBQSxJQUFVO1VBRFUsQ0FBdEI7VUFHQSxHQUFHLENBQUMsRUFBSixDQUFPLE9BQVAsRUFBZ0IsU0FBQyxVQUFEO1lBQ2QsS0FBQyxDQUFBLEtBQUQsQ0FBTyxZQUFQLEVBQXFCLFVBQXJCLEVBQWlDLE1BQWpDLEVBQXlDLE1BQXpDO21CQUNBLE9BQUEsQ0FBUTtjQUFDLFlBQUEsVUFBRDtjQUFhLFFBQUEsTUFBYjtjQUFxQixRQUFBLE1BQXJCO2FBQVI7VUFGYyxDQUFoQjtVQUlBLEdBQUcsQ0FBQyxFQUFKLENBQU8sT0FBUCxFQUFnQixTQUFDLEdBQUQ7WUFDZCxLQUFDLENBQUEsS0FBRCxDQUFPLE9BQVAsRUFBZ0IsR0FBaEI7bUJBQ0EsTUFBQSxDQUFPLEdBQVA7VUFGYyxDQUFoQjtVQUtBLElBQXFCLE9BQXJCO21CQUFBLE9BQUEsQ0FBUSxHQUFHLENBQUMsS0FBWixFQUFBOztRQXRCaUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVI7SUFMTjs7O0FBOEJQOzs7O3lCQUdBLE1BQUEsR0FBUTs7O0FBQ1I7Ozs7eUJBR0EsV0FBQSxHQUFhLFNBQUE7QUFDWCxVQUFBO01BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFBLENBQVEsV0FBUixDQUFBLENBQXFCLFVBQXJCO0FBR1Y7QUFBQSxXQUFBLFVBQUE7O1FBRUUsSUFBRSxDQUFBLEdBQUEsQ0FBRixHQUFTO0FBRlg7YUFHQSxJQUFDLENBQUEsT0FBRCxDQUFZLElBQUMsQ0FBQSxJQUFGLEdBQU8sMENBQWxCO0lBUFc7OztBQVNiOzs7O0lBR2Esb0JBQUE7QUFFWCxVQUFBO01BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBQTtNQUVBLElBQUcsc0JBQUg7UUFDRSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxPQUFPLENBQUM7UUFDekIsT0FBTyxJQUFDLENBQUEsT0FBTyxDQUFDO1FBRWhCLElBQUcsT0FBTyxhQUFQLEtBQXdCLFFBQTNCO0FBRUU7QUFBQSxlQUFBLFdBQUE7O1lBRUUsSUFBRyxPQUFPLE9BQVAsS0FBa0IsU0FBckI7Y0FDRSxJQUFHLE9BQUEsS0FBVyxJQUFkO2dCQUNFLElBQUMsQ0FBQSxPQUFRLENBQUEsSUFBQSxDQUFULEdBQWlCLGNBRG5CO2VBREY7YUFBQSxNQUdLLElBQUcsT0FBTyxPQUFQLEtBQWtCLFFBQXJCO2NBQ0gsSUFBQyxDQUFBLE9BQVEsQ0FBQSxJQUFBLENBQVQsR0FBaUIsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxhQUFSLEVBQXVCLE9BQXZCLEVBRGQ7YUFBQSxNQUFBO2NBR0gsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFBLDJCQUFBLEdBQTJCLENBQUMsT0FBTyxPQUFSLENBQTNCLEdBQTJDLGdCQUEzQyxHQUEyRCxJQUEzRCxHQUFnRSxJQUFoRSxDQUFBLEdBQXFFLE9BQTNFLEVBSEc7O0FBTFAsV0FGRjtTQUpGOztNQWVBLElBQUMsQ0FBQSxPQUFELENBQVMsY0FBQSxHQUFlLElBQUMsQ0FBQSxJQUFoQixHQUFxQixHQUE5QixFQUFrQyxJQUFDLENBQUEsT0FBbkM7TUFFQSxJQUFDLENBQUEsU0FBRCxHQUFhLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLE9BQVI7SUFyQkY7Ozs7O0FBMVdmIiwic291cmNlc0NvbnRlbnQiOlsiUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJylcbl8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuZnMgPSByZXF1aXJlKCdmcycpXG50ZW1wID0gcmVxdWlyZSgndGVtcCcpLnRyYWNrKClcbnJlYWRGaWxlID0gUHJvbWlzZS5wcm9taXNpZnkoZnMucmVhZEZpbGUpXG53aGljaCA9IHJlcXVpcmUoJ3doaWNoJylcbnNwYXduID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLnNwYXduXG5wYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQmVhdXRpZmllclxuXG4gICMjI1xuICBQcm9taXNlXG4gICMjI1xuICBQcm9taXNlOiBQcm9taXNlXG5cbiAgIyMjXG4gIE5hbWUgb2YgQmVhdXRpZmllclxuICAjIyNcbiAgbmFtZTogJ0JlYXV0aWZpZXInXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBPcHRpb25zXG5cbiAgRW5hYmxlIG9wdGlvbnMgZm9yIHN1cHBvcnRlZCBsYW5ndWFnZXMuXG4gIC0gPHN0cmluZzpsYW5ndWFnZT46PGJvb2xlYW46YWxsX29wdGlvbnNfZW5hYmxlZD5cbiAgLSA8c3RyaW5nOmxhbmd1YWdlPjo8c3RyaW5nOm9wdGlvbl9rZXk+Ojxib29sZWFuOmVuYWJsZWQ+XG4gIC0gPHN0cmluZzpsYW5ndWFnZT46PHN0cmluZzpvcHRpb25fa2V5Pjo8c3RyaW5nOnJlbmFtZT5cbiAgLSA8c3RyaW5nOmxhbmd1YWdlPjo8c3RyaW5nOm9wdGlvbl9rZXk+OjxmdW5jdGlvbjp0cmFuc2Zvcm0+XG4gIC0gPHN0cmluZzpsYW5ndWFnZT46PHN0cmluZzpvcHRpb25fa2V5Pjo8YXJyYXk6bWFwcGVyPlxuICAjIyNcbiAgb3B0aW9uczoge31cblxuICAjIyNcbiAgU3VwcG9ydGVkIGxhbmd1YWdlcyBieSB0aGlzIEJlYXV0aWZpZXJcblxuICBFeHRyYWN0ZWQgZnJvbSB0aGUga2V5cyBvZiB0aGUgYG9wdGlvbnNgIGZpZWxkLlxuICAjIyNcbiAgbGFuZ3VhZ2VzOiBudWxsXG5cbiAgIyMjXG4gIEJlYXV0aWZ5IHRleHRcblxuICBPdmVycmlkZSB0aGlzIG1ldGhvZCBpbiBzdWJjbGFzc2VzXG4gICMjI1xuICBiZWF1dGlmeTogbnVsbFxuXG4gICMjI1xuICBTaG93IGRlcHJlY2F0aW9uIHdhcm5pbmcgdG8gdXNlci5cbiAgIyMjXG4gIGRlcHJlY2F0ZTogKHdhcm5pbmcpIC0+XG4gICAgYXRvbS5ub3RpZmljYXRpb25zPy5hZGRXYXJuaW5nKHdhcm5pbmcpXG5cbiAgIyMjXG4gIENyZWF0ZSB0ZW1wb3JhcnkgZmlsZVxuICAjIyNcbiAgdGVtcEZpbGU6IChuYW1lID0gXCJhdG9tLWJlYXV0aWZ5LXRlbXBcIiwgY29udGVudHMgPSBcIlwiLCBleHQgPSBcIlwiKSAtPlxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgIyBjcmVhdGUgdGVtcCBmaWxlXG4gICAgICB0ZW1wLm9wZW4oe3ByZWZpeDogbmFtZSwgc3VmZml4OiBleHR9LCAoZXJyLCBpbmZvKSA9PlxuICAgICAgICBAZGVidWcoJ3RlbXBGaWxlJywgbmFtZSwgZXJyLCBpbmZvKVxuICAgICAgICByZXR1cm4gcmVqZWN0KGVycikgaWYgZXJyXG4gICAgICAgIGZzLndyaXRlKGluZm8uZmQsIGNvbnRlbnRzLCAoZXJyKSAtPlxuICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcbiAgICAgICAgICBmcy5jbG9zZShpbmZvLmZkLCAoZXJyKSAtPlxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxuICAgICAgICAgICAgcmVzb2x2ZShpbmZvLnBhdGgpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgKVxuXG4gICMjI1xuICBSZWFkIGZpbGVcbiAgIyMjXG4gIHJlYWRGaWxlOiAoZmlsZVBhdGgpIC0+XG4gICAgUHJvbWlzZS5yZXNvbHZlKGZpbGVQYXRoKVxuICAgIC50aGVuKChmaWxlUGF0aCkgLT5cbiAgICAgIHJldHVybiByZWFkRmlsZShmaWxlUGF0aCwgXCJ1dGY4XCIpXG4gICAgKVxuXG4gICMjI1xuICBGaW5kIGZpbGVcbiAgIyMjXG4gIGZpbmRGaWxlOiAoc3RhcnREaXIsIGZpbGVOYW1lcykgLT5cbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJTcGVjaWZ5IGZpbGUgbmFtZXMgdG8gZmluZC5cIiB1bmxlc3MgYXJndW1lbnRzLmxlbmd0aFxuICAgIHVubGVzcyBmaWxlTmFtZXMgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgZmlsZU5hbWVzID0gW2ZpbGVOYW1lc11cbiAgICBzdGFydERpciA9IHN0YXJ0RGlyLnNwbGl0KHBhdGguc2VwKVxuICAgIHdoaWxlIHN0YXJ0RGlyLmxlbmd0aFxuICAgICAgY3VycmVudERpciA9IHN0YXJ0RGlyLmpvaW4ocGF0aC5zZXApXG4gICAgICBmb3IgZmlsZU5hbWUgaW4gZmlsZU5hbWVzXG4gICAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKGN1cnJlbnREaXIsIGZpbGVOYW1lKVxuICAgICAgICB0cnlcbiAgICAgICAgICBmcy5hY2Nlc3NTeW5jKGZpbGVQYXRoLCBmcy5SX09LKVxuICAgICAgICAgIHJldHVybiBmaWxlUGF0aFxuICAgICAgc3RhcnREaXIucG9wKClcbiAgICByZXR1cm4gbnVsbFxuXG4gICMjI1xuICBJZiBwbGF0Zm9ybSBpcyBXaW5kb3dzXG4gICMjI1xuICBpc1dpbmRvd3M6IGRvIC0+XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoJ153aW4nKS50ZXN0KHByb2Nlc3MucGxhdGZvcm0pXG5cbiAgIyMjXG4gIEdldCBTaGVsbCBFbnZpcm9ubWVudCB2YXJpYWJsZXNcblxuICBTcGVjaWFsIHRoYW5rIHlvdSB0byBAaW9xdWF0aXhcbiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9pb3F1YXRpeC9zY3JpcHQtcnVubmVyL2Jsb2IvdjEuNS4wL2xpYi9zY3JpcHQtcnVubmVyLmNvZmZlZSNMNDUtTDYzXG4gICMjI1xuICBfZW52Q2FjaGU6IG51bGxcbiAgX2VudkNhY2hlRGF0ZTogbnVsbFxuICBfZW52Q2FjaGVFeHBpcnk6IDEwMDAwICMgMTAgc2Vjb25kc1xuICBnZXRTaGVsbEVudmlyb25tZW50OiAtPlxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgIyBDaGVjayBDYWNoZVxuICAgICAgaWYgQF9lbnZDYWNoZT8gYW5kIEBfZW52Q2FjaGVEYXRlP1xuICAgICAgICAjIENoZWNrIGlmIENhY2hlIGlzIG9sZFxuICAgICAgICBpZiAobmV3IERhdGUoKSAtIEBfZW52Q2FjaGVEYXRlKSA8IEBfZW52Q2FjaGVFeHBpcnlcbiAgICAgICAgICAjIFN0aWxsIGZyZXNoXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoQF9lbnZDYWNoZSlcblxuICAgICAgIyBDaGVjayBpZiBXaW5kb3dzXG4gICAgICBpZiBAaXNXaW5kb3dzXG4gICAgICAgICMgV2luZG93c1xuICAgICAgICAjIFVzZSBkZWZhdWx0XG4gICAgICAgIHJlc29sdmUocHJvY2Vzcy5lbnYpXG4gICAgICBlbHNlXG4gICAgICAgICMgTWFjICYgTGludXhcbiAgICAgICAgIyBJIHRyaWVkIHVzaW5nIENoaWxkUHJvY2Vzcy5leGVjRmlsZSBidXQgdGhlcmUgaXMgbm8gd2F5IHRvIHNldCBkZXRhY2hlZCBhbmRcbiAgICAgICAgIyB0aGlzIGNhdXNlcyB0aGUgY2hpbGQgc2hlbGwgdG8gbG9jayB1cC5cbiAgICAgICAgIyBUaGlzIGNvbW1hbmQgcnVucyBhbiBpbnRlcmFjdGl2ZSBsb2dpbiBzaGVsbCBhbmRcbiAgICAgICAgIyBleGVjdXRlcyB0aGUgZXhwb3J0IGNvbW1hbmQgdG8gZ2V0IGEgbGlzdCBvZiBlbnZpcm9ubWVudCB2YXJpYWJsZXMuXG4gICAgICAgICMgV2UgdGhlbiB1c2UgdGhlc2UgdG8gcnVuIHRoZSBzY3JpcHQ6XG4gICAgICAgIGNoaWxkID0gc3Bhd24gcHJvY2Vzcy5lbnYuU0hFTEwsIFsnLWlsYycsICdlbnYnXSxcbiAgICAgICAgICAjIFRoaXMgaXMgZXNzZW50aWFsIGZvciBpbnRlcmFjdGl2ZSBzaGVsbHMsIG90aGVyd2lzZSBpdCBuZXZlciBmaW5pc2hlczpcbiAgICAgICAgICBkZXRhY2hlZDogdHJ1ZSxcbiAgICAgICAgICAjIFdlIGRvbid0IGNhcmUgYWJvdXQgc3RkaW4sIHN0ZGVyciBjYW4gZ28gb3V0IHRoZSB1c3VhbCB3YXk6XG4gICAgICAgICAgc3RkaW86IFsnaWdub3JlJywgJ3BpcGUnLCBwcm9jZXNzLnN0ZGVycl1cbiAgICAgICAgIyBXZSBidWZmZXIgc3Rkb3V0OlxuICAgICAgICBidWZmZXIgPSAnJ1xuICAgICAgICBjaGlsZC5zdGRvdXQub24gJ2RhdGEnLCAoZGF0YSkgLT4gYnVmZmVyICs9IGRhdGFcbiAgICAgICAgIyBXaGVuIHRoZSBwcm9jZXNzIGZpbmlzaGVzLCBleHRyYWN0IHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMgYW5kIHBhc3MgdGhlbSB0byB0aGUgY2FsbGJhY2s6XG4gICAgICAgIGNoaWxkLm9uICdjbG9zZScsIChjb2RlLCBzaWduYWwpID0+XG4gICAgICAgICAgaWYgY29kZSBpc250IDBcbiAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKFwiQ291bGQgbm90IGdldCBTaGVsbCBFbnZpcm9ubWVudC4gRXhpdCBjb2RlOiBcIitjb2RlK1wiLCBTaWduYWw6IFwiK3NpZ25hbCkpXG4gICAgICAgICAgZW52aXJvbm1lbnQgPSB7fVxuICAgICAgICAgIGZvciBkZWZpbml0aW9uIGluIGJ1ZmZlci5zcGxpdCgnXFxuJylcbiAgICAgICAgICAgIFtrZXksIHZhbHVlXSA9IGRlZmluaXRpb24uc3BsaXQoJz0nLCAyKVxuICAgICAgICAgICAgZW52aXJvbm1lbnRba2V5XSA9IHZhbHVlIGlmIGtleSAhPSAnJ1xuICAgICAgICAgICMgQ2FjaGUgRW52aXJvbm1lbnRcbiAgICAgICAgICBAX2VudkNhY2hlID0gZW52aXJvbm1lbnRcbiAgICAgICAgICBAX2VudkNhY2hlRGF0ZSA9IG5ldyBEYXRlKClcbiAgICAgICAgICByZXNvbHZlKGVudmlyb25tZW50KVxuICAgICAgKVxuXG4gICMjI1xuICBMaWtlIHRoZSB1bml4IHdoaWNoIHV0aWxpdHkuXG5cbiAgRmluZHMgdGhlIGZpcnN0IGluc3RhbmNlIG9mIGEgc3BlY2lmaWVkIGV4ZWN1dGFibGUgaW4gdGhlIFBBVEggZW52aXJvbm1lbnQgdmFyaWFibGUuXG4gIERvZXMgbm90IGNhY2hlIHRoZSByZXN1bHRzLFxuICBzbyBoYXNoIC1yIGlzIG5vdCBuZWVkZWQgd2hlbiB0aGUgUEFUSCBjaGFuZ2VzLlxuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2lzYWFjcy9ub2RlLXdoaWNoXG4gICMjI1xuICB3aGljaDogKGV4ZSwgb3B0aW9ucyA9IHt9KSAtPlxuICAgICMgR2V0IFBBVEggYW5kIG90aGVyIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICAgIEBnZXRTaGVsbEVudmlyb25tZW50KClcbiAgICAudGhlbigoZW52KSA9PlxuICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICAgb3B0aW9ucy5wYXRoID89IGVudi5QQVRIXG4gICAgICAgIGlmIEBpc1dpbmRvd3NcbiAgICAgICAgICAjIEVudmlyb25tZW50IHZhcmlhYmxlcyBhcmUgY2FzZS1pbnNlbnNpdGl2ZSBpbiB3aW5kb3dzXG4gICAgICAgICAgIyBDaGVjayBlbnYgZm9yIGEgY2FzZS1pbnNlbnNpdGl2ZSAncGF0aCcgdmFyaWFibGVcbiAgICAgICAgICBpZiAhb3B0aW9ucy5wYXRoXG4gICAgICAgICAgICBmb3IgaSBvZiBlbnZcbiAgICAgICAgICAgICAgaWYgaS50b0xvd2VyQ2FzZSgpIGlzIFwicGF0aFwiXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5wYXRoID0gZW52W2ldXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICMgVHJpY2sgbm9kZS13aGljaCBpbnRvIGluY2x1ZGluZyBmaWxlc1xuICAgICAgICAgICMgd2l0aCBubyBleHRlbnNpb24gYXMgZXhlY3V0YWJsZXMuXG4gICAgICAgICAgIyBQdXQgZW1wdHkgZXh0ZW5zaW9uIGxhc3QgdG8gYWxsb3cgZm9yIG90aGVyIHJlYWwgZXh0ZW5zaW9ucyBmaXJzdFxuICAgICAgICAgIG9wdGlvbnMucGF0aEV4dCA/PSBcIiN7cHJvY2Vzcy5lbnYuUEFUSEVYVCA/ICcuRVhFJ307XCJcbiAgICAgICAgd2hpY2goZXhlLCBvcHRpb25zLCAoZXJyLCBwYXRoKSAtPlxuICAgICAgICAgIHJlc29sdmUoZXhlKSBpZiBlcnJcbiAgICAgICAgICByZXNvbHZlKHBhdGgpXG4gICAgICAgIClcbiAgICAgIClcbiAgICApXG5cbiAgIyMjXG4gIEFkZCBoZWxwIHRvIGVycm9yLmRlc2NyaXB0aW9uXG5cbiAgTm90ZTogZXJyb3IuZGVzY3JpcHRpb24gaXMgbm90IG9mZmljaWFsbHkgdXNlZCBpbiBKYXZhU2NyaXB0LFxuICBob3dldmVyIGl0IGlzIHVzZWQgaW50ZXJuYWxseSBmb3IgQXRvbSBCZWF1dGlmeSB3aGVuIGRpc3BsYXlpbmcgZXJyb3JzLlxuICAjIyNcbiAgY29tbWFuZE5vdEZvdW5kRXJyb3I6IChleGUsIGhlbHApIC0+XG4gICAgIyBDcmVhdGUgbmV3IGltcHJvdmVkIGVycm9yXG4gICAgIyBub3RpZnkgdXNlciB0aGF0IGl0IG1heSBub3QgYmVcbiAgICAjIGluc3RhbGxlZCBvciBpbiBwYXRoXG4gICAgbWVzc2FnZSA9IFwiQ291bGQgbm90IGZpbmQgJyN7ZXhlfScuIFxcXG4gICAgICAgICAgICBUaGUgcHJvZ3JhbSBtYXkgbm90IGJlIGluc3RhbGxlZC5cIlxuICAgIGVyID0gbmV3IEVycm9yKG1lc3NhZ2UpXG4gICAgZXIuY29kZSA9ICdDb21tYW5kTm90Rm91bmQnXG4gICAgZXIuZXJybm8gPSBlci5jb2RlXG4gICAgZXIuc3lzY2FsbCA9ICdiZWF1dGlmaWVyOjpydW4nXG4gICAgZXIuZmlsZSA9IGV4ZVxuICAgIGlmIGhlbHA/XG4gICAgICBpZiB0eXBlb2YgaGVscCBpcyBcIm9iamVjdFwiXG4gICAgICAgICMgQmFzaWMgbm90aWNlXG4gICAgICAgIGhlbHBTdHIgPSBcIlNlZSAje2hlbHAubGlua30gZm9yIHByb2dyYW0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YWxsYXRpb24gaW5zdHJ1Y3Rpb25zLlxcblwiXG4gICAgICAgICMgSGVscCB0byBjb25maWd1cmUgQXRvbSBCZWF1dGlmeSBmb3IgcHJvZ3JhbSdzIHBhdGhcbiAgICAgICAgaGVscFN0ciArPSBcIllvdSBjYW4gY29uZmlndXJlIEF0b20gQmVhdXRpZnkgXFxcbiAgICAgICAgICAgICAgICAgICAgd2l0aCB0aGUgYWJzb2x1dGUgcGF0aCBcXFxuICAgICAgICAgICAgICAgICAgICB0byAnI3toZWxwLnByb2dyYW0gb3IgZXhlfScgYnkgc2V0dGluZyBcXFxuICAgICAgICAgICAgICAgICAgICAnI3toZWxwLnBhdGhPcHRpb259JyBpbiBcXFxuICAgICAgICAgICAgICAgICAgICB0aGUgQXRvbSBCZWF1dGlmeSBwYWNrYWdlIHNldHRpbmdzLlxcblwiIGlmIGhlbHAucGF0aE9wdGlvblxuICAgICAgICAjIE9wdGlvbmFsLCBhZGRpdGlvbmFsIGhlbHBcbiAgICAgICAgaGVscFN0ciArPSBoZWxwLmFkZGl0aW9uYWwgaWYgaGVscC5hZGRpdGlvbmFsXG4gICAgICAgICMgQ29tbW9uIEhlbHBcbiAgICAgICAgaXNzdWVTZWFyY2hMaW5rID1cbiAgICAgICAgICBcImh0dHBzOi8vZ2l0aHViLmNvbS9HbGF2aW4wMDEvYXRvbS1iZWF1dGlmeS9cXFxuICAgICAgICAgICAgICAgICAgc2VhcmNoP3E9I3tleGV9JnR5cGU9SXNzdWVzXCJcbiAgICAgICAgZG9jc0xpbmsgPSBcImh0dHBzOi8vZ2l0aHViLmNvbS9HbGF2aW4wMDEvXFxcbiAgICAgICAgICAgICAgICAgIGF0b20tYmVhdXRpZnkvdHJlZS9tYXN0ZXIvZG9jc1wiXG4gICAgICAgIGhlbHBTdHIgKz0gXCJZb3VyIHByb2dyYW0gaXMgcHJvcGVybHkgaW5zdGFsbGVkIGlmIHJ1bm5pbmcgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3tpZiBAaXNXaW5kb3dzIHRoZW4gJ3doZXJlLmV4ZScgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlICd3aGljaCd9ICN7ZXhlfScgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbiB5b3VyICN7aWYgQGlzV2luZG93cyB0aGVuICdDTUQgcHJvbXB0JyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgJ1Rlcm1pbmFsJ30gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5zIGFuIGFic29sdXRlIHBhdGggdG8gdGhlIGV4ZWN1dGFibGUuIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSWYgdGhpcyBkb2VzIG5vdCB3b3JrIHRoZW4geW91IGhhdmUgbm90IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFsbGVkIHRoZSBwcm9ncmFtIGNvcnJlY3RseSBhbmQgc28gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBdG9tIEJlYXV0aWZ5IHdpbGwgbm90IGZpbmQgdGhlIHByb2dyYW0uIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXRvbSBCZWF1dGlmeSByZXF1aXJlcyB0aGF0IHRoZSBwcm9ncmFtIGJlIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgaW4geW91ciBQQVRIIGVudmlyb25tZW50IHZhcmlhYmxlLiBcXG5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGUgdGhhdCB0aGlzIGlzIG5vdCBhbiBBdG9tIEJlYXV0aWZ5IGlzc3VlIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgYmVhdXRpZmljYXRpb24gZG9lcyBub3Qgd29yayBhbmQgdGhlIGFib3ZlIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZCBhbHNvIGRvZXMgbm90IHdvcms6IHRoaXMgaXMgZXhwZWN0ZWQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWhhdmlvdXIsIHNpbmNlIHlvdSBoYXZlIG5vdCBwcm9wZXJseSBpbnN0YWxsZWQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5b3VyIHByb2dyYW0uIFBsZWFzZSBwcm9wZXJseSBzZXR1cCB0aGUgcHJvZ3JhbSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZCBzZWFyY2ggdGhyb3VnaCBleGlzdGluZyBBdG9tIEJlYXV0aWZ5IGlzc3VlcyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlZm9yZSBjcmVhdGluZyBhIG5ldyBpc3N1ZS4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTZWUgI3tpc3N1ZVNlYXJjaExpbmt9IGZvciByZWxhdGVkIElzc3VlcyBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAje2RvY3NMaW5rfSBmb3IgZG9jdW1lbnRhdGlvbi4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBJZiB5b3UgYXJlIHN0aWxsIHVuYWJsZSB0byByZXNvbHZlIHRoaXMgaXNzdWUgb24gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5b3VyIG93biB0aGVuIHBsZWFzZSBjcmVhdGUgYSBuZXcgaXNzdWUgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNrIGZvciBoZWxwLlxcblwiXG4gICAgICAgIGVyLmRlc2NyaXB0aW9uID0gaGVscFN0clxuICAgICAgZWxzZSAjaWYgdHlwZW9mIGhlbHAgaXMgXCJzdHJpbmdcIlxuICAgICAgICBlci5kZXNjcmlwdGlvbiA9IGhlbHBcbiAgICByZXR1cm4gZXJcblxuICAjIyNcbiAgUnVuIGNvbW1hbmQtbGluZSBpbnRlcmZhY2UgY29tbWFuZFxuICAjIyNcbiAgcnVuOiAoZXhlY3V0YWJsZSwgYXJncywge2N3ZCwgaWdub3JlUmV0dXJuQ29kZSwgaGVscCwgb25TdGRpbn0gPSB7fSkgLT5cbiAgICAjIEZsYXR0ZW4gYXJncyBmaXJzdFxuICAgIGFyZ3MgPSBfLmZsYXR0ZW4oYXJncylcblxuICAgICMgUmVzb2x2ZSBleGVjdXRhYmxlIGFuZCBhbGwgYXJnc1xuICAgIFByb21pc2UuYWxsKFtleGVjdXRhYmxlLCBQcm9taXNlLmFsbChhcmdzKV0pXG4gICAgICAudGhlbigoW2V4ZU5hbWUsIGFyZ3NdKSA9PlxuICAgICAgICBAZGVidWcoJ2V4ZU5hbWUsIGFyZ3M6JywgZXhlTmFtZSwgYXJncylcblxuICAgICAgICAjIEdldCBQQVRIIGFuZCBvdGhlciBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAgICAgICAgUHJvbWlzZS5hbGwoW2V4ZU5hbWUsIGFyZ3MsIEBnZXRTaGVsbEVudmlyb25tZW50KCksIEB3aGljaChleGVOYW1lKV0pXG4gICAgICApXG4gICAgICAudGhlbigoW2V4ZU5hbWUsIGFyZ3MsIGVudiwgZXhlUGF0aF0pID0+XG4gICAgICAgIEBkZWJ1ZygnZXhlUGF0aCwgZW52OicsIGV4ZVBhdGgsIGVudilcbiAgICAgICAgQGRlYnVnKCdhcmdzJywgYXJncylcblxuICAgICAgICBleGUgPSBleGVQYXRoID8gZXhlTmFtZVxuICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgIGN3ZDogY3dkXG4gICAgICAgICAgZW52OiBlbnZcbiAgICAgICAgfVxuXG4gICAgICAgIEBzcGF3bihleGUsIGFyZ3MsIG9wdGlvbnMsIG9uU3RkaW4pXG4gICAgICAgICAgLnRoZW4oKHtyZXR1cm5Db2RlLCBzdGRvdXQsIHN0ZGVycn0pID0+XG4gICAgICAgICAgICBAdmVyYm9zZSgnc3Bhd24gcmVzdWx0JywgcmV0dXJuQ29kZSwgc3Rkb3V0LCBzdGRlcnIpXG5cbiAgICAgICAgICAgICMgSWYgcmV0dXJuIGNvZGUgaXMgbm90IDAgdGhlbiBlcnJvciBvY2N1cmVkXG4gICAgICAgICAgICBpZiBub3QgaWdub3JlUmV0dXJuQ29kZSBhbmQgcmV0dXJuQ29kZSBpc250IDBcbiAgICAgICAgICAgICAgIyBvcGVyYWJsZSBwcm9ncmFtIG9yIGJhdGNoIGZpbGVcbiAgICAgICAgICAgICAgd2luZG93c1Byb2dyYW1Ob3RGb3VuZE1zZyA9IFwiaXMgbm90IHJlY29nbml6ZWQgYXMgYW4gaW50ZXJuYWwgb3IgZXh0ZXJuYWwgY29tbWFuZFwiXG5cbiAgICAgICAgICAgICAgQHZlcmJvc2Uoc3RkZXJyLCB3aW5kb3dzUHJvZ3JhbU5vdEZvdW5kTXNnKVxuXG4gICAgICAgICAgICAgIGlmIEBpc1dpbmRvd3MgYW5kIHJldHVybkNvZGUgaXMgMSBhbmQgc3RkZXJyLmluZGV4T2Yod2luZG93c1Byb2dyYW1Ob3RGb3VuZE1zZykgaXNudCAtMVxuICAgICAgICAgICAgICAgIHRocm93IEBjb21tYW5kTm90Rm91bmRFcnJvcihleGVOYW1lLCBoZWxwKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHN0ZGVycilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgc3Rkb3V0XG4gICAgICAgICAgKVxuICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PlxuICAgICAgICAgICAgQGRlYnVnKCdlcnJvcicsIGVycilcblxuICAgICAgICAgICAgIyBDaGVjayBpZiBlcnJvciBpcyBFTk9FTlQgKGNvbW1hbmQgY291bGQgbm90IGJlIGZvdW5kKVxuICAgICAgICAgICAgaWYgZXJyLmNvZGUgaXMgJ0VOT0VOVCcgb3IgZXJyLmVycm5vIGlzICdFTk9FTlQnXG4gICAgICAgICAgICAgIHRocm93IEBjb21tYW5kTm90Rm91bmRFcnJvcihleGVOYW1lLCBoZWxwKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAjIGNvbnRpbnVlIGFzIG5vcm1hbCBlcnJvclxuICAgICAgICAgICAgICB0aHJvdyBlcnJcbiAgICAgICAgICApXG4gICAgICApXG5cbiAgIyMjXG4gIFNwYXduXG4gICMjI1xuICBzcGF3bjogKGV4ZSwgYXJncywgb3B0aW9ucywgb25TdGRpbikgLT5cbiAgICAjIFJlbW92ZSB1bmRlZmluZWQvbnVsbCB2YWx1ZXNcbiAgICBhcmdzID0gXy53aXRob3V0KGFyZ3MsIHVuZGVmaW5lZClcbiAgICBhcmdzID0gXy53aXRob3V0KGFyZ3MsIG51bGwpXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIEBkZWJ1Zygnc3Bhd24nLCBleGUsIGFyZ3MpXG5cbiAgICAgIGNtZCA9IHNwYXduKGV4ZSwgYXJncywgb3B0aW9ucylcbiAgICAgIHN0ZG91dCA9IFwiXCJcbiAgICAgIHN0ZGVyciA9IFwiXCJcblxuICAgICAgY21kLnN0ZG91dC5vbignZGF0YScsIChkYXRhKSAtPlxuICAgICAgICBzdGRvdXQgKz0gZGF0YVxuICAgICAgKVxuICAgICAgY21kLnN0ZGVyci5vbignZGF0YScsIChkYXRhKSAtPlxuICAgICAgICBzdGRlcnIgKz0gZGF0YVxuICAgICAgKVxuICAgICAgY21kLm9uKCdjbG9zZScsIChyZXR1cm5Db2RlKSA9PlxuICAgICAgICBAZGVidWcoJ3NwYXduIGRvbmUnLCByZXR1cm5Db2RlLCBzdGRlcnIsIHN0ZG91dClcbiAgICAgICAgcmVzb2x2ZSh7cmV0dXJuQ29kZSwgc3Rkb3V0LCBzdGRlcnJ9KVxuICAgICAgKVxuICAgICAgY21kLm9uKCdlcnJvcicsIChlcnIpID0+XG4gICAgICAgIEBkZWJ1ZygnZXJyb3InLCBlcnIpXG4gICAgICAgIHJlamVjdChlcnIpXG4gICAgICApXG5cbiAgICAgIG9uU3RkaW4gY21kLnN0ZGluIGlmIG9uU3RkaW5cbiAgICApXG5cbiAgIyMjXG4gIExvZ2dlciBpbnN0YW5jZVxuICAjIyNcbiAgbG9nZ2VyOiBudWxsXG4gICMjI1xuICBJbml0aWFsaXplIGFuZCBjb25maWd1cmUgTG9nZ2VyXG4gICMjI1xuICBzZXR1cExvZ2dlcjogLT5cbiAgICBAbG9nZ2VyID0gcmVxdWlyZSgnLi4vbG9nZ2VyJykoX19maWxlbmFtZSlcbiAgICAjIEB2ZXJib3NlKEBsb2dnZXIpXG4gICAgIyBNZXJnZSBsb2dnZXIgbWV0aG9kcyBpbnRvIGJlYXV0aWZpZXIgY2xhc3NcbiAgICBmb3Iga2V5LCBtZXRob2Qgb2YgQGxvZ2dlclxuICAgICAgIyBAdmVyYm9zZShrZXksIG1ldGhvZClcbiAgICAgIEBba2V5XSA9IG1ldGhvZFxuICAgIEB2ZXJib3NlKFwiI3tAbmFtZX0gYmVhdXRpZmllciBsb2dnZXIgaGFzIGJlZW4gaW5pdGlhbGl6ZWQuXCIpXG5cbiAgIyMjXG4gIENvbnN0cnVjdG9yIHRvIHNldHVwIGJlYXV0aWZlclxuICAjIyNcbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgIyBTZXR1cCBsb2dnZXJcbiAgICBAc2V0dXBMb2dnZXIoKVxuICAgICMgSGFuZGxlIGdsb2JhbCBvcHRpb25zXG4gICAgaWYgQG9wdGlvbnMuXz9cbiAgICAgIGdsb2JhbE9wdGlvbnMgPSBAb3B0aW9ucy5fXG4gICAgICBkZWxldGUgQG9wdGlvbnMuX1xuICAgICAgIyBPbmx5IG1lcmdlIGlmIGdsb2JhbE9wdGlvbnMgaXMgYW4gb2JqZWN0XG4gICAgICBpZiB0eXBlb2YgZ2xvYmFsT3B0aW9ucyBpcyBcIm9iamVjdFwiXG4gICAgICAgICMgSXRlcmF0ZSBvdmVyIGFsbCBzdXBwb3J0ZWQgbGFuZ3VhZ2VzXG4gICAgICAgIGZvciBsYW5nLCBvcHRpb25zIG9mIEBvcHRpb25zXG4gICAgICAgICAgI1xuICAgICAgICAgIGlmIHR5cGVvZiBvcHRpb25zIGlzIFwiYm9vbGVhblwiXG4gICAgICAgICAgICBpZiBvcHRpb25zIGlzIHRydWVcbiAgICAgICAgICAgICAgQG9wdGlvbnNbbGFuZ10gPSBnbG9iYWxPcHRpb25zXG4gICAgICAgICAgZWxzZSBpZiB0eXBlb2Ygb3B0aW9ucyBpcyBcIm9iamVjdFwiXG4gICAgICAgICAgICBAb3B0aW9uc1tsYW5nXSA9IF8ubWVyZ2UoZ2xvYmFsT3B0aW9ucywgb3B0aW9ucylcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAd2FybihcIlVuc3VwcG9ydGVkIG9wdGlvbnMgdHlwZSAje3R5cGVvZiBvcHRpb25zfSBmb3IgbGFuZ3VhZ2UgI3tsYW5nfTogXCIrIG9wdGlvbnMpXG4gICAgQHZlcmJvc2UoXCJPcHRpb25zIGZvciAje0BuYW1lfTpcIiwgQG9wdGlvbnMpXG4gICAgIyBTZXQgc3VwcG9ydGVkIGxhbmd1YWdlc1xuICAgIEBsYW5ndWFnZXMgPSBfLmtleXMoQG9wdGlvbnMpXG4iXX0=
