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
    Is the beautifier a command-line interface beautifier?
     */

    Beautifier.prototype.isPreInstalled = true;


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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2JlYXV0aWZpZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0VBQ1YsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUNKLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLEtBQWhCLENBQUE7O0VBQ1AsUUFBQSxHQUFXLE9BQU8sQ0FBQyxTQUFSLENBQWtCLEVBQUUsQ0FBQyxRQUFyQjs7RUFDWCxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxlQUFSLENBQXdCLENBQUM7O0VBQ2pDLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7QUFFckI7Ozt5QkFHQSxPQUFBLEdBQVM7OztBQUVUOzs7O3lCQUdBLElBQUEsR0FBTTs7O0FBRU47Ozs7Ozs7Ozs7O3lCQVVBLE9BQUEsR0FBUzs7O0FBRVQ7Ozs7eUJBR0EsY0FBQSxHQUFnQjs7O0FBRWhCOzs7Ozs7eUJBS0EsU0FBQSxHQUFXOzs7QUFFWDs7Ozs7O3lCQUtBLFFBQUEsR0FBVTs7O0FBRVY7Ozs7eUJBR0EsU0FBQSxHQUFXLFNBQUMsT0FBRDtBQUNULFVBQUE7cURBQWtCLENBQUUsVUFBcEIsQ0FBK0IsT0FBL0I7SUFEUzs7O0FBR1g7Ozs7eUJBR0EsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUE4QixRQUE5QixFQUE2QyxHQUE3Qzs7UUFBQyxPQUFPOzs7UUFBc0IsV0FBVzs7O1FBQUksTUFBTTs7QUFDM0QsYUFBVyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRCxF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T0FBUCxLQUFrQixRQUFyQjtjQUNILElBQUMsQ0FBQSxPQUFRLENBQUEsSUFBQSxDQUFULEdBQWlCLENBQUMsQ0FBQyxLQUFGLENBQVEsYUFBUixFQUF1QixPQUF2QixFQURkO2FBQUEsTUFBQTtjQUdILElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQSwyQkFBQSxHQUEyQixDQUFDLE9BQU8sT0FBUixDQUEzQixHQUEyQyxnQkFBM0MsR0FBMkQsSUFBM0QsR0FBZ0UsSUFBaEUsQ0FBQSxHQUFxRSxPQUEzRSxFQUhHOztBQUxQLFdBRkY7U0FKRjs7TUFlQSxJQUFDLENBQUEsT0FBRCxDQUFTLGNBQUEsR0FBZSxJQUFDLENBQUEsSUFBaEIsR0FBcUIsR0FBOUIsRUFBa0MsSUFBQyxDQUFBLE9BQW5DO01BRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFDLENBQUMsSUFBRixDQUFPLElBQUMsQ0FBQSxPQUFSO0lBckJGOzs7OztBQS9XZiIsInNvdXJjZXNDb250ZW50IjpbIlByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpXG5fID0gcmVxdWlyZSgnbG9kYXNoJylcbmZzID0gcmVxdWlyZSgnZnMnKVxudGVtcCA9IHJlcXVpcmUoJ3RlbXAnKS50cmFjaygpXG5yZWFkRmlsZSA9IFByb21pc2UucHJvbWlzaWZ5KGZzLnJlYWRGaWxlKVxud2hpY2ggPSByZXF1aXJlKCd3aGljaCcpXG5zcGF3biA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5zcGF3blxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEJlYXV0aWZpZXJcblxuICAjIyNcbiAgUHJvbWlzZVxuICAjIyNcbiAgUHJvbWlzZTogUHJvbWlzZVxuXG4gICMjI1xuICBOYW1lIG9mIEJlYXV0aWZpZXJcbiAgIyMjXG4gIG5hbWU6ICdCZWF1dGlmaWVyJ1xuXG4gICMjI1xuICBTdXBwb3J0ZWQgT3B0aW9uc1xuXG4gIEVuYWJsZSBvcHRpb25zIGZvciBzdXBwb3J0ZWQgbGFuZ3VhZ2VzLlxuICAtIDxzdHJpbmc6bGFuZ3VhZ2U+Ojxib29sZWFuOmFsbF9vcHRpb25zX2VuYWJsZWQ+XG4gIC0gPHN0cmluZzpsYW5ndWFnZT46PHN0cmluZzpvcHRpb25fa2V5Pjo8Ym9vbGVhbjplbmFibGVkPlxuICAtIDxzdHJpbmc6bGFuZ3VhZ2U+OjxzdHJpbmc6b3B0aW9uX2tleT46PHN0cmluZzpyZW5hbWU+XG4gIC0gPHN0cmluZzpsYW5ndWFnZT46PHN0cmluZzpvcHRpb25fa2V5Pjo8ZnVuY3Rpb246dHJhbnNmb3JtPlxuICAtIDxzdHJpbmc6bGFuZ3VhZ2U+OjxzdHJpbmc6b3B0aW9uX2tleT46PGFycmF5Om1hcHBlcj5cbiAgIyMjXG4gIG9wdGlvbnM6IHt9XG5cbiAgIyMjXG4gIElzIHRoZSBiZWF1dGlmaWVyIGEgY29tbWFuZC1saW5lIGludGVyZmFjZSBiZWF1dGlmaWVyP1xuICAjIyNcbiAgaXNQcmVJbnN0YWxsZWQ6IHRydWVcblxuICAjIyNcbiAgU3VwcG9ydGVkIGxhbmd1YWdlcyBieSB0aGlzIEJlYXV0aWZpZXJcblxuICBFeHRyYWN0ZWQgZnJvbSB0aGUga2V5cyBvZiB0aGUgYG9wdGlvbnNgIGZpZWxkLlxuICAjIyNcbiAgbGFuZ3VhZ2VzOiBudWxsXG5cbiAgIyMjXG4gIEJlYXV0aWZ5IHRleHRcblxuICBPdmVycmlkZSB0aGlzIG1ldGhvZCBpbiBzdWJjbGFzc2VzXG4gICMjI1xuICBiZWF1dGlmeTogbnVsbFxuXG4gICMjI1xuICBTaG93IGRlcHJlY2F0aW9uIHdhcm5pbmcgdG8gdXNlci5cbiAgIyMjXG4gIGRlcHJlY2F0ZTogKHdhcm5pbmcpIC0+XG4gICAgYXRvbS5ub3RpZmljYXRpb25zPy5hZGRXYXJuaW5nKHdhcm5pbmcpXG5cbiAgIyMjXG4gIENyZWF0ZSB0ZW1wb3JhcnkgZmlsZVxuICAjIyNcbiAgdGVtcEZpbGU6IChuYW1lID0gXCJhdG9tLWJlYXV0aWZ5LXRlbXBcIiwgY29udGVudHMgPSBcIlwiLCBleHQgPSBcIlwiKSAtPlxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgIyBjcmVhdGUgdGVtcCBmaWxlXG4gICAgICB0ZW1wLm9wZW4oe3ByZWZpeDogbmFtZSwgc3VmZml4OiBleHR9LCAoZXJyLCBpbmZvKSA9PlxuICAgICAgICBAZGVidWcoJ3RlbXBGaWxlJywgbmFtZSwgZXJyLCBpbmZvKVxuICAgICAgICByZXR1cm4gcmVqZWN0KGVycikgaWYgZXJyXG4gICAgICAgIGZzLndyaXRlKGluZm8uZmQsIGNvbnRlbnRzLCAoZXJyKSAtPlxuICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcbiAgICAgICAgICBmcy5jbG9zZShpbmZvLmZkLCAoZXJyKSAtPlxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxuICAgICAgICAgICAgcmVzb2x2ZShpbmZvLnBhdGgpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgKVxuXG4gICMjI1xuICBSZWFkIGZpbGVcbiAgIyMjXG4gIHJlYWRGaWxlOiAoZmlsZVBhdGgpIC0+XG4gICAgUHJvbWlzZS5yZXNvbHZlKGZpbGVQYXRoKVxuICAgIC50aGVuKChmaWxlUGF0aCkgLT5cbiAgICAgIHJldHVybiByZWFkRmlsZShmaWxlUGF0aCwgXCJ1dGY4XCIpXG4gICAgKVxuXG4gICMjI1xuICBGaW5kIGZpbGVcbiAgIyMjXG4gIGZpbmRGaWxlOiAoc3RhcnREaXIsIGZpbGVOYW1lcykgLT5cbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJTcGVjaWZ5IGZpbGUgbmFtZXMgdG8gZmluZC5cIiB1bmxlc3MgYXJndW1lbnRzLmxlbmd0aFxuICAgIHVubGVzcyBmaWxlTmFtZXMgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgZmlsZU5hbWVzID0gW2ZpbGVOYW1lc11cbiAgICBzdGFydERpciA9IHN0YXJ0RGlyLnNwbGl0KHBhdGguc2VwKVxuICAgIHdoaWxlIHN0YXJ0RGlyLmxlbmd0aFxuICAgICAgY3VycmVudERpciA9IHN0YXJ0RGlyLmpvaW4ocGF0aC5zZXApXG4gICAgICBmb3IgZmlsZU5hbWUgaW4gZmlsZU5hbWVzXG4gICAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKGN1cnJlbnREaXIsIGZpbGVOYW1lKVxuICAgICAgICB0cnlcbiAgICAgICAgICBmcy5hY2Nlc3NTeW5jKGZpbGVQYXRoLCBmcy5SX09LKVxuICAgICAgICAgIHJldHVybiBmaWxlUGF0aFxuICAgICAgc3RhcnREaXIucG9wKClcbiAgICByZXR1cm4gbnVsbFxuXG4gICMjI1xuICBJZiBwbGF0Zm9ybSBpcyBXaW5kb3dzXG4gICMjI1xuICBpc1dpbmRvd3M6IGRvIC0+XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoJ153aW4nKS50ZXN0KHByb2Nlc3MucGxhdGZvcm0pXG5cbiAgIyMjXG4gIEdldCBTaGVsbCBFbnZpcm9ubWVudCB2YXJpYWJsZXNcblxuICBTcGVjaWFsIHRoYW5rIHlvdSB0byBAaW9xdWF0aXhcbiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9pb3F1YXRpeC9zY3JpcHQtcnVubmVyL2Jsb2IvdjEuNS4wL2xpYi9zY3JpcHQtcnVubmVyLmNvZmZlZSNMNDUtTDYzXG4gICMjI1xuICBfZW52Q2FjaGU6IG51bGxcbiAgX2VudkNhY2hlRGF0ZTogbnVsbFxuICBfZW52Q2FjaGVFeHBpcnk6IDEwMDAwICMgMTAgc2Vjb25kc1xuICBnZXRTaGVsbEVudmlyb25tZW50OiAtPlxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgIyBDaGVjayBDYWNoZVxuICAgICAgaWYgQF9lbnZDYWNoZT8gYW5kIEBfZW52Q2FjaGVEYXRlP1xuICAgICAgICAjIENoZWNrIGlmIENhY2hlIGlzIG9sZFxuICAgICAgICBpZiAobmV3IERhdGUoKSAtIEBfZW52Q2FjaGVEYXRlKSA8IEBfZW52Q2FjaGVFeHBpcnlcbiAgICAgICAgICAjIFN0aWxsIGZyZXNoXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoQF9lbnZDYWNoZSlcblxuICAgICAgIyBDaGVjayBpZiBXaW5kb3dzXG4gICAgICBpZiBAaXNXaW5kb3dzXG4gICAgICAgICMgV2luZG93c1xuICAgICAgICAjIFVzZSBkZWZhdWx0XG4gICAgICAgIHJlc29sdmUocHJvY2Vzcy5lbnYpXG4gICAgICBlbHNlXG4gICAgICAgICMgTWFjICYgTGludXhcbiAgICAgICAgIyBJIHRyaWVkIHVzaW5nIENoaWxkUHJvY2Vzcy5leGVjRmlsZSBidXQgdGhlcmUgaXMgbm8gd2F5IHRvIHNldCBkZXRhY2hlZCBhbmRcbiAgICAgICAgIyB0aGlzIGNhdXNlcyB0aGUgY2hpbGQgc2hlbGwgdG8gbG9jayB1cC5cbiAgICAgICAgIyBUaGlzIGNvbW1hbmQgcnVucyBhbiBpbnRlcmFjdGl2ZSBsb2dpbiBzaGVsbCBhbmRcbiAgICAgICAgIyBleGVjdXRlcyB0aGUgZXhwb3J0IGNvbW1hbmQgdG8gZ2V0IGEgbGlzdCBvZiBlbnZpcm9ubWVudCB2YXJpYWJsZXMuXG4gICAgICAgICMgV2UgdGhlbiB1c2UgdGhlc2UgdG8gcnVuIHRoZSBzY3JpcHQ6XG4gICAgICAgIGNoaWxkID0gc3Bhd24gcHJvY2Vzcy5lbnYuU0hFTEwsIFsnLWlsYycsICdlbnYnXSxcbiAgICAgICAgICAjIFRoaXMgaXMgZXNzZW50aWFsIGZvciBpbnRlcmFjdGl2ZSBzaGVsbHMsIG90aGVyd2lzZSBpdCBuZXZlciBmaW5pc2hlczpcbiAgICAgICAgICBkZXRhY2hlZDogdHJ1ZSxcbiAgICAgICAgICAjIFdlIGRvbid0IGNhcmUgYWJvdXQgc3RkaW4sIHN0ZGVyciBjYW4gZ28gb3V0IHRoZSB1c3VhbCB3YXk6XG4gICAgICAgICAgc3RkaW86IFsnaWdub3JlJywgJ3BpcGUnLCBwcm9jZXNzLnN0ZGVycl1cbiAgICAgICAgIyBXZSBidWZmZXIgc3Rkb3V0OlxuICAgICAgICBidWZmZXIgPSAnJ1xuICAgICAgICBjaGlsZC5zdGRvdXQub24gJ2RhdGEnLCAoZGF0YSkgLT4gYnVmZmVyICs9IGRhdGFcbiAgICAgICAgIyBXaGVuIHRoZSBwcm9jZXNzIGZpbmlzaGVzLCBleHRyYWN0IHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMgYW5kIHBhc3MgdGhlbSB0byB0aGUgY2FsbGJhY2s6XG4gICAgICAgIGNoaWxkLm9uICdjbG9zZScsIChjb2RlLCBzaWduYWwpID0+XG4gICAgICAgICAgaWYgY29kZSBpc250IDBcbiAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKFwiQ291bGQgbm90IGdldCBTaGVsbCBFbnZpcm9ubWVudC4gRXhpdCBjb2RlOiBcIitjb2RlK1wiLCBTaWduYWw6IFwiK3NpZ25hbCkpXG4gICAgICAgICAgZW52aXJvbm1lbnQgPSB7fVxuICAgICAgICAgIGZvciBkZWZpbml0aW9uIGluIGJ1ZmZlci5zcGxpdCgnXFxuJylcbiAgICAgICAgICAgIFtrZXksIHZhbHVlXSA9IGRlZmluaXRpb24uc3BsaXQoJz0nLCAyKVxuICAgICAgICAgICAgZW52aXJvbm1lbnRba2V5XSA9IHZhbHVlIGlmIGtleSAhPSAnJ1xuICAgICAgICAgICMgQ2FjaGUgRW52aXJvbm1lbnRcbiAgICAgICAgICBAX2VudkNhY2hlID0gZW52aXJvbm1lbnRcbiAgICAgICAgICBAX2VudkNhY2hlRGF0ZSA9IG5ldyBEYXRlKClcbiAgICAgICAgICByZXNvbHZlKGVudmlyb25tZW50KVxuICAgICAgKVxuXG4gICMjI1xuICBMaWtlIHRoZSB1bml4IHdoaWNoIHV0aWxpdHkuXG5cbiAgRmluZHMgdGhlIGZpcnN0IGluc3RhbmNlIG9mIGEgc3BlY2lmaWVkIGV4ZWN1dGFibGUgaW4gdGhlIFBBVEggZW52aXJvbm1lbnQgdmFyaWFibGUuXG4gIERvZXMgbm90IGNhY2hlIHRoZSByZXN1bHRzLFxuICBzbyBoYXNoIC1yIGlzIG5vdCBuZWVkZWQgd2hlbiB0aGUgUEFUSCBjaGFuZ2VzLlxuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2lzYWFjcy9ub2RlLXdoaWNoXG4gICMjI1xuICB3aGljaDogKGV4ZSwgb3B0aW9ucyA9IHt9KSAtPlxuICAgICMgR2V0IFBBVEggYW5kIG90aGVyIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICAgIEBnZXRTaGVsbEVudmlyb25tZW50KClcbiAgICAudGhlbigoZW52KSA9PlxuICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICAgb3B0aW9ucy5wYXRoID89IGVudi5QQVRIXG4gICAgICAgIGlmIEBpc1dpbmRvd3NcbiAgICAgICAgICAjIEVudmlyb25tZW50IHZhcmlhYmxlcyBhcmUgY2FzZS1pbnNlbnNpdGl2ZSBpbiB3aW5kb3dzXG4gICAgICAgICAgIyBDaGVjayBlbnYgZm9yIGEgY2FzZS1pbnNlbnNpdGl2ZSAncGF0aCcgdmFyaWFibGVcbiAgICAgICAgICBpZiAhb3B0aW9ucy5wYXRoXG4gICAgICAgICAgICBmb3IgaSBvZiBlbnZcbiAgICAgICAgICAgICAgaWYgaS50b0xvd2VyQ2FzZSgpIGlzIFwicGF0aFwiXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5wYXRoID0gZW52W2ldXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICMgVHJpY2sgbm9kZS13aGljaCBpbnRvIGluY2x1ZGluZyBmaWxlc1xuICAgICAgICAgICMgd2l0aCBubyBleHRlbnNpb24gYXMgZXhlY3V0YWJsZXMuXG4gICAgICAgICAgIyBQdXQgZW1wdHkgZXh0ZW5zaW9uIGxhc3QgdG8gYWxsb3cgZm9yIG90aGVyIHJlYWwgZXh0ZW5zaW9ucyBmaXJzdFxuICAgICAgICAgIG9wdGlvbnMucGF0aEV4dCA/PSBcIiN7cHJvY2Vzcy5lbnYuUEFUSEVYVCA/ICcuRVhFJ307XCJcbiAgICAgICAgd2hpY2goZXhlLCBvcHRpb25zLCAoZXJyLCBwYXRoKSAtPlxuICAgICAgICAgIHJlc29sdmUoZXhlKSBpZiBlcnJcbiAgICAgICAgICByZXNvbHZlKHBhdGgpXG4gICAgICAgIClcbiAgICAgIClcbiAgICApXG5cbiAgIyMjXG4gIEFkZCBoZWxwIHRvIGVycm9yLmRlc2NyaXB0aW9uXG5cbiAgTm90ZTogZXJyb3IuZGVzY3JpcHRpb24gaXMgbm90IG9mZmljaWFsbHkgdXNlZCBpbiBKYXZhU2NyaXB0LFxuICBob3dldmVyIGl0IGlzIHVzZWQgaW50ZXJuYWxseSBmb3IgQXRvbSBCZWF1dGlmeSB3aGVuIGRpc3BsYXlpbmcgZXJyb3JzLlxuICAjIyNcbiAgY29tbWFuZE5vdEZvdW5kRXJyb3I6IChleGUsIGhlbHApIC0+XG4gICAgIyBDcmVhdGUgbmV3IGltcHJvdmVkIGVycm9yXG4gICAgIyBub3RpZnkgdXNlciB0aGF0IGl0IG1heSBub3QgYmVcbiAgICAjIGluc3RhbGxlZCBvciBpbiBwYXRoXG4gICAgbWVzc2FnZSA9IFwiQ291bGQgbm90IGZpbmQgJyN7ZXhlfScuIFxcXG4gICAgICAgICAgICBUaGUgcHJvZ3JhbSBtYXkgbm90IGJlIGluc3RhbGxlZC5cIlxuICAgIGVyID0gbmV3IEVycm9yKG1lc3NhZ2UpXG4gICAgZXIuY29kZSA9ICdDb21tYW5kTm90Rm91bmQnXG4gICAgZXIuZXJybm8gPSBlci5jb2RlXG4gICAgZXIuc3lzY2FsbCA9ICdiZWF1dGlmaWVyOjpydW4nXG4gICAgZXIuZmlsZSA9IGV4ZVxuICAgIGlmIGhlbHA/XG4gICAgICBpZiB0eXBlb2YgaGVscCBpcyBcIm9iamVjdFwiXG4gICAgICAgICMgQmFzaWMgbm90aWNlXG4gICAgICAgIGhlbHBTdHIgPSBcIlNlZSAje2hlbHAubGlua30gZm9yIHByb2dyYW0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YWxsYXRpb24gaW5zdHJ1Y3Rpb25zLlxcblwiXG4gICAgICAgICMgSGVscCB0byBjb25maWd1cmUgQXRvbSBCZWF1dGlmeSBmb3IgcHJvZ3JhbSdzIHBhdGhcbiAgICAgICAgaGVscFN0ciArPSBcIllvdSBjYW4gY29uZmlndXJlIEF0b20gQmVhdXRpZnkgXFxcbiAgICAgICAgICAgICAgICAgICAgd2l0aCB0aGUgYWJzb2x1dGUgcGF0aCBcXFxuICAgICAgICAgICAgICAgICAgICB0byAnI3toZWxwLnByb2dyYW0gb3IgZXhlfScgYnkgc2V0dGluZyBcXFxuICAgICAgICAgICAgICAgICAgICAnI3toZWxwLnBhdGhPcHRpb259JyBpbiBcXFxuICAgICAgICAgICAgICAgICAgICB0aGUgQXRvbSBCZWF1dGlmeSBwYWNrYWdlIHNldHRpbmdzLlxcblwiIGlmIGhlbHAucGF0aE9wdGlvblxuICAgICAgICAjIE9wdGlvbmFsLCBhZGRpdGlvbmFsIGhlbHBcbiAgICAgICAgaGVscFN0ciArPSBoZWxwLmFkZGl0aW9uYWwgaWYgaGVscC5hZGRpdGlvbmFsXG4gICAgICAgICMgQ29tbW9uIEhlbHBcbiAgICAgICAgaXNzdWVTZWFyY2hMaW5rID1cbiAgICAgICAgICBcImh0dHBzOi8vZ2l0aHViLmNvbS9HbGF2aW4wMDEvYXRvbS1iZWF1dGlmeS9cXFxuICAgICAgICAgICAgICAgICAgc2VhcmNoP3E9I3tleGV9JnR5cGU9SXNzdWVzXCJcbiAgICAgICAgZG9jc0xpbmsgPSBcImh0dHBzOi8vZ2l0aHViLmNvbS9HbGF2aW4wMDEvXFxcbiAgICAgICAgICAgICAgICAgIGF0b20tYmVhdXRpZnkvdHJlZS9tYXN0ZXIvZG9jc1wiXG4gICAgICAgIGhlbHBTdHIgKz0gXCJZb3VyIHByb2dyYW0gaXMgcHJvcGVybHkgaW5zdGFsbGVkIGlmIHJ1bm5pbmcgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3tpZiBAaXNXaW5kb3dzIHRoZW4gJ3doZXJlLmV4ZScgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlICd3aGljaCd9ICN7ZXhlfScgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbiB5b3VyICN7aWYgQGlzV2luZG93cyB0aGVuICdDTUQgcHJvbXB0JyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgJ1Rlcm1pbmFsJ30gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5zIGFuIGFic29sdXRlIHBhdGggdG8gdGhlIGV4ZWN1dGFibGUuIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSWYgdGhpcyBkb2VzIG5vdCB3b3JrIHRoZW4geW91IGhhdmUgbm90IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFsbGVkIHRoZSBwcm9ncmFtIGNvcnJlY3RseSBhbmQgc28gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBdG9tIEJlYXV0aWZ5IHdpbGwgbm90IGZpbmQgdGhlIHByb2dyYW0uIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXRvbSBCZWF1dGlmeSByZXF1aXJlcyB0aGF0IHRoZSBwcm9ncmFtIGJlIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgaW4geW91ciBQQVRIIGVudmlyb25tZW50IHZhcmlhYmxlLiBcXG5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGUgdGhhdCB0aGlzIGlzIG5vdCBhbiBBdG9tIEJlYXV0aWZ5IGlzc3VlIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgYmVhdXRpZmljYXRpb24gZG9lcyBub3Qgd29yayBhbmQgdGhlIGFib3ZlIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZCBhbHNvIGRvZXMgbm90IHdvcms6IHRoaXMgaXMgZXhwZWN0ZWQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWhhdmlvdXIsIHNpbmNlIHlvdSBoYXZlIG5vdCBwcm9wZXJseSBpbnN0YWxsZWQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5b3VyIHByb2dyYW0uIFBsZWFzZSBwcm9wZXJseSBzZXR1cCB0aGUgcHJvZ3JhbSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZCBzZWFyY2ggdGhyb3VnaCBleGlzdGluZyBBdG9tIEJlYXV0aWZ5IGlzc3VlcyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlZm9yZSBjcmVhdGluZyBhIG5ldyBpc3N1ZS4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTZWUgI3tpc3N1ZVNlYXJjaExpbmt9IGZvciByZWxhdGVkIElzc3VlcyBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAje2RvY3NMaW5rfSBmb3IgZG9jdW1lbnRhdGlvbi4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBJZiB5b3UgYXJlIHN0aWxsIHVuYWJsZSB0byByZXNvbHZlIHRoaXMgaXNzdWUgb24gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5b3VyIG93biB0aGVuIHBsZWFzZSBjcmVhdGUgYSBuZXcgaXNzdWUgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNrIGZvciBoZWxwLlxcblwiXG4gICAgICAgIGVyLmRlc2NyaXB0aW9uID0gaGVscFN0clxuICAgICAgZWxzZSAjaWYgdHlwZW9mIGhlbHAgaXMgXCJzdHJpbmdcIlxuICAgICAgICBlci5kZXNjcmlwdGlvbiA9IGhlbHBcbiAgICByZXR1cm4gZXJcblxuICAjIyNcbiAgUnVuIGNvbW1hbmQtbGluZSBpbnRlcmZhY2UgY29tbWFuZFxuICAjIyNcbiAgcnVuOiAoZXhlY3V0YWJsZSwgYXJncywge2N3ZCwgaWdub3JlUmV0dXJuQ29kZSwgaGVscCwgb25TdGRpbn0gPSB7fSkgLT5cbiAgICAjIEZsYXR0ZW4gYXJncyBmaXJzdFxuICAgIGFyZ3MgPSBfLmZsYXR0ZW4oYXJncylcblxuICAgICMgUmVzb2x2ZSBleGVjdXRhYmxlIGFuZCBhbGwgYXJnc1xuICAgIFByb21pc2UuYWxsKFtleGVjdXRhYmxlLCBQcm9taXNlLmFsbChhcmdzKV0pXG4gICAgICAudGhlbigoW2V4ZU5hbWUsIGFyZ3NdKSA9PlxuICAgICAgICBAZGVidWcoJ2V4ZU5hbWUsIGFyZ3M6JywgZXhlTmFtZSwgYXJncylcblxuICAgICAgICAjIEdldCBQQVRIIGFuZCBvdGhlciBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAgICAgICAgUHJvbWlzZS5hbGwoW2V4ZU5hbWUsIGFyZ3MsIEBnZXRTaGVsbEVudmlyb25tZW50KCksIEB3aGljaChleGVOYW1lKV0pXG4gICAgICApXG4gICAgICAudGhlbigoW2V4ZU5hbWUsIGFyZ3MsIGVudiwgZXhlUGF0aF0pID0+XG4gICAgICAgIEBkZWJ1ZygnZXhlUGF0aCwgZW52OicsIGV4ZVBhdGgsIGVudilcbiAgICAgICAgQGRlYnVnKCdhcmdzJywgYXJncylcblxuICAgICAgICBleGUgPSBleGVQYXRoID8gZXhlTmFtZVxuICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgIGN3ZDogY3dkXG4gICAgICAgICAgZW52OiBlbnZcbiAgICAgICAgfVxuXG4gICAgICAgIEBzcGF3bihleGUsIGFyZ3MsIG9wdGlvbnMsIG9uU3RkaW4pXG4gICAgICAgICAgLnRoZW4oKHtyZXR1cm5Db2RlLCBzdGRvdXQsIHN0ZGVycn0pID0+XG4gICAgICAgICAgICBAdmVyYm9zZSgnc3Bhd24gcmVzdWx0JywgcmV0dXJuQ29kZSwgc3Rkb3V0LCBzdGRlcnIpXG5cbiAgICAgICAgICAgICMgSWYgcmV0dXJuIGNvZGUgaXMgbm90IDAgdGhlbiBlcnJvciBvY2N1cmVkXG4gICAgICAgICAgICBpZiBub3QgaWdub3JlUmV0dXJuQ29kZSBhbmQgcmV0dXJuQ29kZSBpc250IDBcbiAgICAgICAgICAgICAgIyBvcGVyYWJsZSBwcm9ncmFtIG9yIGJhdGNoIGZpbGVcbiAgICAgICAgICAgICAgd2luZG93c1Byb2dyYW1Ob3RGb3VuZE1zZyA9IFwiaXMgbm90IHJlY29nbml6ZWQgYXMgYW4gaW50ZXJuYWwgb3IgZXh0ZXJuYWwgY29tbWFuZFwiXG5cbiAgICAgICAgICAgICAgQHZlcmJvc2Uoc3RkZXJyLCB3aW5kb3dzUHJvZ3JhbU5vdEZvdW5kTXNnKVxuXG4gICAgICAgICAgICAgIGlmIEBpc1dpbmRvd3MgYW5kIHJldHVybkNvZGUgaXMgMSBhbmQgc3RkZXJyLmluZGV4T2Yod2luZG93c1Byb2dyYW1Ob3RGb3VuZE1zZykgaXNudCAtMVxuICAgICAgICAgICAgICAgIHRocm93IEBjb21tYW5kTm90Rm91bmRFcnJvcihleGVOYW1lLCBoZWxwKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHN0ZGVycilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgc3Rkb3V0XG4gICAgICAgICAgKVxuICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PlxuICAgICAgICAgICAgQGRlYnVnKCdlcnJvcicsIGVycilcblxuICAgICAgICAgICAgIyBDaGVjayBpZiBlcnJvciBpcyBFTk9FTlQgKGNvbW1hbmQgY291bGQgbm90IGJlIGZvdW5kKVxuICAgICAgICAgICAgaWYgZXJyLmNvZGUgaXMgJ0VOT0VOVCcgb3IgZXJyLmVycm5vIGlzICdFTk9FTlQnXG4gICAgICAgICAgICAgIHRocm93IEBjb21tYW5kTm90Rm91bmRFcnJvcihleGVOYW1lLCBoZWxwKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAjIGNvbnRpbnVlIGFzIG5vcm1hbCBlcnJvclxuICAgICAgICAgICAgICB0aHJvdyBlcnJcbiAgICAgICAgICApXG4gICAgICApXG5cbiAgIyMjXG4gIFNwYXduXG4gICMjI1xuICBzcGF3bjogKGV4ZSwgYXJncywgb3B0aW9ucywgb25TdGRpbikgLT5cbiAgICAjIFJlbW92ZSB1bmRlZmluZWQvbnVsbCB2YWx1ZXNcbiAgICBhcmdzID0gXy53aXRob3V0KGFyZ3MsIHVuZGVmaW5lZClcbiAgICBhcmdzID0gXy53aXRob3V0KGFyZ3MsIG51bGwpXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIEBkZWJ1Zygnc3Bhd24nLCBleGUsIGFyZ3MpXG5cbiAgICAgIGNtZCA9IHNwYXduKGV4ZSwgYXJncywgb3B0aW9ucylcbiAgICAgIHN0ZG91dCA9IFwiXCJcbiAgICAgIHN0ZGVyciA9IFwiXCJcblxuICAgICAgY21kLnN0ZG91dC5vbignZGF0YScsIChkYXRhKSAtPlxuICAgICAgICBzdGRvdXQgKz0gZGF0YVxuICAgICAgKVxuICAgICAgY21kLnN0ZGVyci5vbignZGF0YScsIChkYXRhKSAtPlxuICAgICAgICBzdGRlcnIgKz0gZGF0YVxuICAgICAgKVxuICAgICAgY21kLm9uKCdjbG9zZScsIChyZXR1cm5Db2RlKSA9PlxuICAgICAgICBAZGVidWcoJ3NwYXduIGRvbmUnLCByZXR1cm5Db2RlLCBzdGRlcnIsIHN0ZG91dClcbiAgICAgICAgcmVzb2x2ZSh7cmV0dXJuQ29kZSwgc3Rkb3V0LCBzdGRlcnJ9KVxuICAgICAgKVxuICAgICAgY21kLm9uKCdlcnJvcicsIChlcnIpID0+XG4gICAgICAgIEBkZWJ1ZygnZXJyb3InLCBlcnIpXG4gICAgICAgIHJlamVjdChlcnIpXG4gICAgICApXG5cbiAgICAgIG9uU3RkaW4gY21kLnN0ZGluIGlmIG9uU3RkaW5cbiAgICApXG5cbiAgIyMjXG4gIExvZ2dlciBpbnN0YW5jZVxuICAjIyNcbiAgbG9nZ2VyOiBudWxsXG4gICMjI1xuICBJbml0aWFsaXplIGFuZCBjb25maWd1cmUgTG9nZ2VyXG4gICMjI1xuICBzZXR1cExvZ2dlcjogLT5cbiAgICBAbG9nZ2VyID0gcmVxdWlyZSgnLi4vbG9nZ2VyJykoX19maWxlbmFtZSlcbiAgICAjIEB2ZXJib3NlKEBsb2dnZXIpXG4gICAgIyBNZXJnZSBsb2dnZXIgbWV0aG9kcyBpbnRvIGJlYXV0aWZpZXIgY2xhc3NcbiAgICBmb3Iga2V5LCBtZXRob2Qgb2YgQGxvZ2dlclxuICAgICAgIyBAdmVyYm9zZShrZXksIG1ldGhvZClcbiAgICAgIEBba2V5XSA9IG1ldGhvZFxuICAgIEB2ZXJib3NlKFwiI3tAbmFtZX0gYmVhdXRpZmllciBsb2dnZXIgaGFzIGJlZW4gaW5pdGlhbGl6ZWQuXCIpXG5cbiAgIyMjXG4gIENvbnN0cnVjdG9yIHRvIHNldHVwIGJlYXV0aWZlclxuICAjIyNcbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgIyBTZXR1cCBsb2dnZXJcbiAgICBAc2V0dXBMb2dnZXIoKVxuICAgICMgSGFuZGxlIGdsb2JhbCBvcHRpb25zXG4gICAgaWYgQG9wdGlvbnMuXz9cbiAgICAgIGdsb2JhbE9wdGlvbnMgPSBAb3B0aW9ucy5fXG4gICAgICBkZWxldGUgQG9wdGlvbnMuX1xuICAgICAgIyBPbmx5IG1lcmdlIGlmIGdsb2JhbE9wdGlvbnMgaXMgYW4gb2JqZWN0XG4gICAgICBpZiB0eXBlb2YgZ2xvYmFsT3B0aW9ucyBpcyBcIm9iamVjdFwiXG4gICAgICAgICMgSXRlcmF0ZSBvdmVyIGFsbCBzdXBwb3J0ZWQgbGFuZ3VhZ2VzXG4gICAgICAgIGZvciBsYW5nLCBvcHRpb25zIG9mIEBvcHRpb25zXG4gICAgICAgICAgI1xuICAgICAgICAgIGlmIHR5cGVvZiBvcHRpb25zIGlzIFwiYm9vbGVhblwiXG4gICAgICAgICAgICBpZiBvcHRpb25zIGlzIHRydWVcbiAgICAgICAgICAgICAgQG9wdGlvbnNbbGFuZ10gPSBnbG9iYWxPcHRpb25zXG4gICAgICAgICAgZWxzZSBpZiB0eXBlb2Ygb3B0aW9ucyBpcyBcIm9iamVjdFwiXG4gICAgICAgICAgICBAb3B0aW9uc1tsYW5nXSA9IF8ubWVyZ2UoZ2xvYmFsT3B0aW9ucywgb3B0aW9ucylcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAd2FybihcIlVuc3VwcG9ydGVkIG9wdGlvbnMgdHlwZSAje3R5cGVvZiBvcHRpb25zfSBmb3IgbGFuZ3VhZ2UgI3tsYW5nfTogXCIrIG9wdGlvbnMpXG4gICAgQHZlcmJvc2UoXCJPcHRpb25zIGZvciAje0BuYW1lfTpcIiwgQG9wdGlvbnMpXG4gICAgIyBTZXQgc3VwcG9ydGVkIGxhbmd1YWdlc1xuICAgIEBsYW5ndWFnZXMgPSBfLmtleXMoQG9wdGlvbnMpXG4iXX0=
