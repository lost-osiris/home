(function() {
  var CompositeDisposable, Task, Transpiler, fs, languagebabelSchema, path, pathIsInside, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ref = require('atom'), Task = ref.Task, CompositeDisposable = ref.CompositeDisposable;

  fs = require('fs-plus');

  path = require('path');

  pathIsInside = require('../node_modules/path-is-inside');

  languagebabelSchema = {
    type: 'object',
    properties: {
      babelMapsPath: {
        type: 'string'
      },
      babelMapsAddUrl: {
        type: 'boolean'
      },
      babelSourcePath: {
        type: 'string'
      },
      babelTranspilePath: {
        type: 'string'
      },
      createMap: {
        type: 'boolean'
      },
      createTargetDirectories: {
        type: 'boolean'
      },
      createTranspiledCode: {
        type: 'boolean'
      },
      disableWhenNoBabelrcFileInPath: {
        type: 'boolean'
      },
      projectRoot: {
        type: 'boolean'
      },
      suppressSourcePathMessages: {
        type: 'boolean'
      },
      suppressTranspileOnSaveMessages: {
        type: 'boolean'
      },
      transpileOnSave: {
        type: 'boolean'
      }
    },
    additionalProperties: false
  };

  Transpiler = (function() {
    Transpiler.prototype.fromGrammarName = 'Babel ES6 JavaScript';

    Transpiler.prototype.fromScopeName = 'source.js.jsx';

    Transpiler.prototype.toScopeName = 'source.js.jsx';

    function Transpiler() {
      this.commandTranspileDirectories = bind(this.commandTranspileDirectories, this);
      this.commandTranspileDirectory = bind(this.commandTranspileDirectory, this);
      this.reqId = 0;
      this.babelTranspilerTasks = {};
      this.babelTransformerPath = require.resolve('./transpiler-task');
      this.transpileErrorNotifications = {};
      this.deprecateConfig();
      this.disposables = new CompositeDisposable();
      if (this.getConfig().transpileOnSave || this.getConfig().allowLocalOverride) {
        this.disposables.add(atom.contextMenu.add({
          '.tree-view .directory > .header > .name': [
            {
              label: 'Language-Babel',
              submenu: [
                {
                  label: 'Transpile Directory ',
                  command: 'language-babel:transpile-directory'
                }, {
                  label: 'Transpile Directories',
                  command: 'language-babel:transpile-directories'
                }
              ]
            }, {
              'type': 'separator'
            }
          ]
        }));
        this.disposables.add(atom.commands.add('.tree-view .directory > .header > .name', 'language-babel:transpile-directory', this.commandTranspileDirectory));
        this.disposables.add(atom.commands.add('.tree-view .directory > .header > .name', 'language-babel:transpile-directories', this.commandTranspileDirectories));
      }
    }

    Transpiler.prototype.transform = function(code, arg) {
      var babelOptions, config, filePath, msgObject, pathTo, reqId, sourceMap;
      filePath = arg.filePath, sourceMap = arg.sourceMap;
      config = this.getConfig();
      pathTo = this.getPaths(filePath, config);
      this.createTask(pathTo.projectPath);
      babelOptions = {
        filename: filePath,
        ast: false
      };
      if (sourceMap) {
        babelOptions.sourceMaps = sourceMap;
      }
      if (this.babelTranspilerTasks[pathTo.projectPath]) {
        reqId = this.reqId++;
        msgObject = {
          reqId: reqId,
          command: 'transpileCode',
          pathTo: pathTo,
          code: code,
          babelOptions: babelOptions
        };
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var err;
          try {
            _this.babelTranspilerTasks[pathTo.projectPath].send(msgObject);
          } catch (error) {
            err = error;
            delete _this.babelTranspilerTasks[pathTo.projectPath];
            reject("Error " + err + " sending to transpile task with PID " + _this.babelTranspilerTasks[pathTo.projectPath].childProcess.pid);
          }
          return _this.babelTranspilerTasks[pathTo.projectPath].once("transpile:" + reqId, function(msgRet) {
            if (msgRet.err != null) {
              return reject("Babel v" + msgRet.babelVersion + "\n" + msgRet.err.message + "\n" + msgRet.babelCoreUsed);
            } else {
              msgRet.sourceMap = msgRet.map;
              return resolve(msgRet);
            }
          });
        };
      })(this));
    };

    Transpiler.prototype.commandTranspileDirectory = function(arg) {
      var target;
      target = arg.target;
      return this.transpileDirectory({
        directory: target.dataset.path
      });
    };

    Transpiler.prototype.commandTranspileDirectories = function(arg) {
      var target;
      target = arg.target;
      return this.transpileDirectory({
        directory: target.dataset.path,
        recursive: true
      });
    };

    Transpiler.prototype.transpileDirectory = function(options) {
      var directory, recursive;
      directory = options.directory;
      recursive = options.recursive || false;
      return fs.readdir(directory, (function(_this) {
        return function(err, files) {
          if (err == null) {
            return files.map(function(file) {
              var fqFileName;
              fqFileName = path.join(directory, file);
              return fs.stat(fqFileName, function(err, stats) {
                if (err == null) {
                  if (stats.isFile()) {
                    if (/\.min\.[a-z]+$/.test(fqFileName)) {
                      return;
                    }
                    if (/\.(js|jsx|es|es6|babel)$/.test(fqFileName)) {
                      return _this.transpile(file, null, _this.getConfigAndPathTo(fqFileName));
                    }
                  } else if (recursive && stats.isDirectory()) {
                    return _this.transpileDirectory({
                      directory: fqFileName,
                      recursive: true
                    });
                  }
                }
              });
            });
          }
        };
      })(this));
    };

    Transpiler.prototype.transpile = function(sourceFile, textEditor, configAndPathTo) {
      var babelOptions, config, err, msgObject, pathTo, ref1, reqId;
      if (configAndPathTo != null) {
        config = configAndPathTo.config, pathTo = configAndPathTo.pathTo;
      } else {
        ref1 = this.getConfigAndPathTo(sourceFile), config = ref1.config, pathTo = ref1.pathTo;
      }
      if (config.transpileOnSave !== true) {
        return;
      }
      if (config.disableWhenNoBabelrcFileInPath) {
        if (!this.isBabelrcInPath(pathTo.sourceFileDir)) {
          return;
        }
      }
      if (!pathIsInside(pathTo.sourceFile, pathTo.sourceRoot)) {
        if (!config.suppressSourcePathMessages) {
          atom.notifications.addWarning('LB: Babel file is not inside the "Babel Source Path" directory.', {
            dismissable: false,
            detail: "No transpiled code output for file \n" + pathTo.sourceFile + " \n\nTo suppress these 'invalid source path' messages use language-babel package settings"
          });
        }
        return;
      }
      babelOptions = this.getBabelOptions(config);
      this.cleanNotifications(pathTo);
      this.createTask(pathTo.projectPath);
      if (this.babelTranspilerTasks[pathTo.projectPath]) {
        reqId = this.reqId++;
        msgObject = {
          reqId: reqId,
          command: 'transpile',
          pathTo: pathTo,
          babelOptions: babelOptions
        };
        try {
          this.babelTranspilerTasks[pathTo.projectPath].send(msgObject);
        } catch (error) {
          err = error;
          console.log("Error " + err + " sending to transpile task with PID " + this.babelTranspilerTasks[pathTo.projectPath].childProcess.pid);
          delete this.babelTranspilerTasks[pathTo.projectPath];
          this.createTask(pathTo.projectPath);
          console.log("Restarted transpile task with PID " + this.babelTranspilerTasks[pathTo.projectPath].childProcess.pid);
          this.babelTranspilerTasks[pathTo.projectPath].send(msgObject);
        }
        return this.babelTranspilerTasks[pathTo.projectPath].once("transpile:" + reqId, (function(_this) {
          return function(msgRet) {
            var mapJson, ref2, ref3, ref4, xssiProtection;
            if ((ref2 = msgRet.result) != null ? ref2.ignored : void 0) {
              return;
            }
            if (msgRet.err) {
              if (msgRet.err.stack) {
                return _this.transpileErrorNotifications[pathTo.sourceFile] = atom.notifications.addError("LB: Babel Transpiler Error", {
                  dismissable: true,
                  detail: msgRet.err.message + "\n \n" + msgRet.babelCoreUsed + "\n \n" + msgRet.err.stack
                });
              } else {
                _this.transpileErrorNotifications[pathTo.sourceFile] = atom.notifications.addError("LB: Babel v" + msgRet.babelVersion + " Transpiler Error", {
                  dismissable: true,
                  detail: msgRet.err.message + "\n \n" + msgRet.babelCoreUsed + "\n \n" + msgRet.err.codeFrame
                });
                if ((((ref3 = msgRet.err.loc) != null ? ref3.line : void 0) != null) && (textEditor != null ? textEditor.alive : void 0)) {
                  return textEditor.setCursorBufferPosition([msgRet.err.loc.line - 1, msgRet.err.loc.column]);
                }
              }
            } else {
              if (!config.suppressTranspileOnSaveMessages) {
                atom.notifications.addInfo("LB: Babel v" + msgRet.babelVersion + " Transpiler Success", {
                  detail: pathTo.sourceFile + "\n \n" + msgRet.babelCoreUsed
                });
              }
              if (!config.createTranspiledCode) {
                if (!config.suppressTranspileOnSaveMessages) {
                  atom.notifications.addInfo('LB: No transpiled output configured');
                }
                return;
              }
              if (pathTo.sourceFile === pathTo.transpiledFile) {
                atom.notifications.addWarning('LB: Transpiled file would overwrite source file. Aborted!', {
                  dismissable: true,
                  detail: pathTo.sourceFile
                });
                return;
              }
              if (config.createTargetDirectories) {
                fs.makeTreeSync(path.parse(pathTo.transpiledFile).dir);
              }
              if (config.babelMapsAddUrl) {
                msgRet.result.code = msgRet.result.code + '\n' + '//# sourceMappingURL=' + pathTo.mapFile;
              }
              fs.writeFileSync(pathTo.transpiledFile, msgRet.result.code);
              if (config.createMap && ((ref4 = msgRet.result.map) != null ? ref4.version : void 0)) {
                if (config.createTargetDirectories) {
                  fs.makeTreeSync(path.parse(pathTo.mapFile).dir);
                }
                mapJson = {
                  version: msgRet.result.map.version,
                  sources: pathTo.sourceFile,
                  file: pathTo.transpiledFile,
                  sourceRoot: '',
                  names: msgRet.result.map.names,
                  mappings: msgRet.result.map.mappings
                };
                xssiProtection = ')]}\n';
                return fs.writeFileSync(pathTo.mapFile, xssiProtection + JSON.stringify(mapJson, null, ' '));
              }
            }
          };
        })(this));
      }
    };

    Transpiler.prototype.cleanNotifications = function(pathTo) {
      var i, n, ref1, results, sf;
      if (this.transpileErrorNotifications[pathTo.sourceFile] != null) {
        this.transpileErrorNotifications[pathTo.sourceFile].dismiss();
        delete this.transpileErrorNotifications[pathTo.sourceFile];
      }
      ref1 = this.transpileErrorNotifications;
      for (sf in ref1) {
        n = ref1[sf];
        if (n.dismissed) {
          delete this.transpileErrorNotifications[sf];
        }
      }
      i = atom.notifications.notifications.length - 1;
      results = [];
      while (i >= 0) {
        if (atom.notifications.notifications[i].dismissed && atom.notifications.notifications[i].message.substring(0, 3) === "LB:") {
          atom.notifications.notifications.splice(i, 1);
        }
        results.push(i--);
      }
      return results;
    };

    Transpiler.prototype.createTask = function(projectPath) {
      var base;
      return (base = this.babelTranspilerTasks)[projectPath] != null ? base[projectPath] : base[projectPath] = Task.once(this.babelTransformerPath, projectPath, (function(_this) {
        return function() {
          return delete _this.babelTranspilerTasks[projectPath];
        };
      })(this));
    };

    Transpiler.prototype.deprecateConfig = function() {
      if (atom.config.get('language-babel.supressTranspileOnSaveMessages') != null) {
        atom.config.set('language-babel.suppressTranspileOnSaveMessages', atom.config.get('language-babel.supressTranspileOnSaveMessages'));
      }
      if (atom.config.get('language-babel.supressSourcePathMessages') != null) {
        atom.config.set('language-babel.suppressSourcePathMessages', atom.config.get('language-babel.supressSourcePathMessages'));
      }
      atom.config.unset('language-babel.supressTranspileOnSaveMessages');
      atom.config.unset('language-babel.supressSourcePathMessages');
      atom.config.unset('language-babel.useInternalScanner');
      atom.config.unset('language-babel.stopAtProjectDirectory');
      atom.config.unset('language-babel.babelStage');
      atom.config.unset('language-babel.externalHelpers');
      atom.config.unset('language-babel.moduleLoader');
      atom.config.unset('language-babel.blacklistTransformers');
      atom.config.unset('language-babel.whitelistTransformers');
      atom.config.unset('language-babel.looseTransformers');
      atom.config.unset('language-babel.optionalTransformers');
      atom.config.unset('language-babel.plugins');
      atom.config.unset('language-babel.presets');
      return atom.config.unset('language-babel.formatJSX');
    };

    Transpiler.prototype.getBabelOptions = function(config) {
      var babelOptions;
      babelOptions = {
        code: true
      };
      if (config.createMap) {
        babelOptions.sourceMaps = config.createMap;
      }
      return babelOptions;
    };

    Transpiler.prototype.getConfigAndPathTo = function(sourceFile) {
      var config, localConfig, pathTo;
      config = this.getConfig();
      pathTo = this.getPaths(sourceFile, config);
      if (config.allowLocalOverride) {
        if (this.jsonSchema == null) {
          this.jsonSchema = (require('../node_modules/jjv'))();
          this.jsonSchema.addSchema('localConfig', languagebabelSchema);
        }
        localConfig = this.getLocalConfig(pathTo.sourceFileDir, pathTo.projectPath, {});
        this.merge(config, localConfig);
        pathTo = this.getPaths(sourceFile, config);
      }
      return {
        config: config,
        pathTo: pathTo
      };
    };

    Transpiler.prototype.getConfig = function() {
      return atom.config.get('language-babel');
    };

    Transpiler.prototype.getLocalConfig = function(fromDir, toDir, localConfig) {
      var err, fileContent, isProjectRoot, jsonContent, languageBabelCfgFile, localConfigFile, schemaErrors;
      localConfigFile = '.languagebabel';
      languageBabelCfgFile = path.join(fromDir, localConfigFile);
      if (fs.existsSync(languageBabelCfgFile)) {
        fileContent = fs.readFileSync(languageBabelCfgFile, 'utf8');
        try {
          jsonContent = JSON.parse(fileContent);
        } catch (error) {
          err = error;
          atom.notifications.addError("LB: " + localConfigFile + " " + err.message, {
            dismissable: true,
            detail: "File = " + languageBabelCfgFile + "\n\n" + fileContent
          });
          return;
        }
        schemaErrors = this.jsonSchema.validate('localConfig', jsonContent);
        if (schemaErrors) {
          atom.notifications.addError("LB: " + localConfigFile + " configuration error", {
            dismissable: true,
            detail: "File = " + languageBabelCfgFile + "\n\n" + fileContent
          });
        } else {
          isProjectRoot = jsonContent.projectRoot;
          this.merge(jsonContent, localConfig);
          if (isProjectRoot) {
            jsonContent.projectRootDir = fromDir;
          }
          localConfig = jsonContent;
        }
      }
      if (fromDir !== toDir) {
        if (fromDir === path.dirname(fromDir)) {
          return localConfig;
        }
        if (isProjectRoot) {
          return localConfig;
        }
        return this.getLocalConfig(path.dirname(fromDir), toDir, localConfig);
      } else {
        return localConfig;
      }
    };

    Transpiler.prototype.getPaths = function(sourceFile, config) {
      var absMapFile, absMapsRoot, absProjectPath, absSourceRoot, absTranspileRoot, absTranspiledFile, parsedSourceFile, projectContainingSource, relMapsPath, relSourcePath, relSourceRootToSourceFile, relTranspilePath, sourceFileInProject;
      projectContainingSource = atom.project.relativizePath(sourceFile);
      if (projectContainingSource[0] === null) {
        sourceFileInProject = false;
      } else {
        sourceFileInProject = true;
      }
      if (config.projectRootDir != null) {
        absProjectPath = path.normalize(config.projectRootDir);
      } else if (projectContainingSource[0] === null) {
        absProjectPath = path.parse(sourceFile).root;
      } else {
        absProjectPath = path.normalize(path.join(projectContainingSource[0], '.'));
      }
      relSourcePath = path.normalize(config.babelSourcePath);
      relTranspilePath = path.normalize(config.babelTranspilePath);
      relMapsPath = path.normalize(config.babelMapsPath);
      absSourceRoot = path.join(absProjectPath, relSourcePath);
      absTranspileRoot = path.join(absProjectPath, relTranspilePath);
      absMapsRoot = path.join(absProjectPath, relMapsPath);
      parsedSourceFile = path.parse(sourceFile);
      relSourceRootToSourceFile = path.relative(absSourceRoot, parsedSourceFile.dir);
      absTranspiledFile = path.join(absTranspileRoot, relSourceRootToSourceFile, parsedSourceFile.name + '.js');
      absMapFile = path.join(absMapsRoot, relSourceRootToSourceFile, parsedSourceFile.name + '.js.map');
      return {
        sourceFileInProject: sourceFileInProject,
        sourceFile: sourceFile,
        sourceFileDir: parsedSourceFile.dir,
        mapFile: absMapFile,
        transpiledFile: absTranspiledFile,
        sourceRoot: absSourceRoot,
        projectPath: absProjectPath
      };
    };

    Transpiler.prototype.isBabelrcInPath = function(fromDir) {
      var babelrc, babelrcFile;
      babelrc = '.babelrc';
      babelrcFile = path.join(fromDir, babelrc);
      if (fs.existsSync(babelrcFile)) {
        return true;
      }
      if (fromDir !== path.dirname(fromDir)) {
        return this.isBabelrcInPath(path.dirname(fromDir));
      } else {
        return false;
      }
    };

    Transpiler.prototype.merge = function(targetObj, sourceObj) {
      var prop, results, val;
      results = [];
      for (prop in sourceObj) {
        val = sourceObj[prop];
        results.push(targetObj[prop] = val);
      }
      return results;
    };

    Transpiler.prototype.stopTranspilerTask = function(projectPath) {
      var msgObject;
      msgObject = {
        command: 'stop'
      };
      return this.babelTranspilerTasks[projectPath].send(msgObject);
    };

    Transpiler.prototype.stopAllTranspilerTask = function() {
      var projectPath, ref1, results, v;
      ref1 = this.babelTranspilerTasks;
      results = [];
      for (projectPath in ref1) {
        v = ref1[projectPath];
        results.push(this.stopTranspilerTask(projectPath));
      }
      return results;
    };

    Transpiler.prototype.stopUnusedTasks = function() {
      var atomProjectPath, atomProjectPaths, isTaskInCurrentProject, j, len, projectTaskPath, ref1, results, v;
      atomProjectPaths = atom.project.getPaths();
      ref1 = this.babelTranspilerTasks;
      results = [];
      for (projectTaskPath in ref1) {
        v = ref1[projectTaskPath];
        isTaskInCurrentProject = false;
        for (j = 0, len = atomProjectPaths.length; j < len; j++) {
          atomProjectPath = atomProjectPaths[j];
          if (pathIsInside(projectTaskPath, atomProjectPath)) {
            isTaskInCurrentProject = true;
            break;
          }
        }
        if (!isTaskInCurrentProject) {
          results.push(this.stopTranspilerTask(projectTaskPath));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    return Transpiler;

  })();

  module.exports = Transpiler;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWJhYmVsL2xpYi90cmFuc3BpbGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUZBQUE7SUFBQTs7RUFBQSxNQUErQixPQUFBLENBQVEsTUFBUixDQUEvQixFQUFDLGVBQUQsRUFBTzs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFlBQUEsR0FBZSxPQUFBLENBQVEsZ0NBQVI7O0VBR2YsbUJBQUEsR0FBc0I7SUFDcEIsSUFBQSxFQUFNLFFBRGM7SUFFcEIsVUFBQSxFQUFZO01BQ1YsYUFBQSxFQUFrQztRQUFFLElBQUEsRUFBTSxRQUFSO09BRHhCO01BRVYsZUFBQSxFQUFrQztRQUFFLElBQUEsRUFBTSxTQUFSO09BRnhCO01BR1YsZUFBQSxFQUFrQztRQUFFLElBQUEsRUFBTSxRQUFSO09BSHhCO01BSVYsa0JBQUEsRUFBa0M7UUFBRSxJQUFBLEVBQU0sUUFBUjtPQUp4QjtNQUtWLFNBQUEsRUFBa0M7UUFBRSxJQUFBLEVBQU0sU0FBUjtPQUx4QjtNQU1WLHVCQUFBLEVBQWtDO1FBQUUsSUFBQSxFQUFNLFNBQVI7T0FOeEI7TUFPVixvQkFBQSxFQUFrQztRQUFFLElBQUEsRUFBTSxTQUFSO09BUHhCO01BUVYsOEJBQUEsRUFBa0M7UUFBRSxJQUFBLEVBQU0sU0FBUjtPQVJ4QjtNQVNWLFdBQUEsRUFBa0M7UUFBRSxJQUFBLEVBQU0sU0FBUjtPQVR4QjtNQVVWLDBCQUFBLEVBQWtDO1FBQUUsSUFBQSxFQUFNLFNBQVI7T0FWeEI7TUFXViwrQkFBQSxFQUFrQztRQUFFLElBQUEsRUFBTSxTQUFSO09BWHhCO01BWVYsZUFBQSxFQUFrQztRQUFFLElBQUEsRUFBTSxTQUFSO09BWnhCO0tBRlE7SUFnQnBCLG9CQUFBLEVBQXNCLEtBaEJGOzs7RUFtQmhCO3lCQUVKLGVBQUEsR0FBaUI7O3lCQUNqQixhQUFBLEdBQWU7O3lCQUNmLFdBQUEsR0FBYTs7SUFFQSxvQkFBQTs7O01BQ1gsSUFBQyxDQUFBLEtBQUQsR0FBUztNQUNULElBQUMsQ0FBQSxvQkFBRCxHQUF3QjtNQUN4QixJQUFDLENBQUEsb0JBQUQsR0FBd0IsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsbUJBQWhCO01BQ3hCLElBQUMsQ0FBQSwyQkFBRCxHQUErQjtNQUMvQixJQUFDLENBQUEsZUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxtQkFBQSxDQUFBO01BQ25CLElBQUcsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFZLENBQUMsZUFBYixJQUFnQyxJQUFDLENBQUEsU0FBRCxDQUFBLENBQVksQ0FBQyxrQkFBaEQ7UUFDRSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFqQixDQUFxQjtVQUNwQyx5Q0FBQSxFQUEyQztZQUN2QztjQUNFLEtBQUEsRUFBTyxnQkFEVDtjQUVFLE9BQUEsRUFBUztnQkFDUDtrQkFBQyxLQUFBLEVBQU8sc0JBQVI7a0JBQWdDLE9BQUEsRUFBUyxvQ0FBekM7aUJBRE8sRUFFUDtrQkFBQyxLQUFBLEVBQU8sdUJBQVI7a0JBQWlDLE9BQUEsRUFBUyxzQ0FBMUM7aUJBRk87ZUFGWDthQUR1QyxFQVF2QztjQUFDLE1BQUEsRUFBUSxXQUFUO2FBUnVDO1dBRFA7U0FBckIsQ0FBakI7UUFZQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLHlDQUFsQixFQUE2RCxvQ0FBN0QsRUFBbUcsSUFBQyxDQUFBLHlCQUFwRyxDQUFqQjtRQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IseUNBQWxCLEVBQTZELHNDQUE3RCxFQUFxRyxJQUFDLENBQUEsMkJBQXRHLENBQWpCLEVBZEY7O0lBUFc7O3lCQXdCYixTQUFBLEdBQVcsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUNULFVBQUE7TUFEaUIseUJBQVU7TUFDM0IsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQUE7TUFDVCxNQUFBLEdBQVMsSUFBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBQW9CLE1BQXBCO01BRVQsSUFBQyxDQUFBLFVBQUQsQ0FBWSxNQUFNLENBQUMsV0FBbkI7TUFDQSxZQUFBLEdBQ0U7UUFBQSxRQUFBLEVBQVUsUUFBVjtRQUNBLEdBQUEsRUFBSyxLQURMOztNQUVGLElBQUcsU0FBSDtRQUFrQixZQUFZLENBQUMsVUFBYixHQUEwQixVQUE1Qzs7TUFFQSxJQUFHLElBQUMsQ0FBQSxvQkFBcUIsQ0FBQSxNQUFNLENBQUMsV0FBUCxDQUF6QjtRQUNFLEtBQUEsR0FBUSxJQUFDLENBQUEsS0FBRDtRQUNSLFNBQUEsR0FDRTtVQUFBLEtBQUEsRUFBTyxLQUFQO1VBQ0EsT0FBQSxFQUFTLGVBRFQ7VUFFQSxNQUFBLEVBQVEsTUFGUjtVQUdBLElBQUEsRUFBTSxJQUhOO1VBSUEsWUFBQSxFQUFjLFlBSmQ7VUFISjs7YUFTSSxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFFVixjQUFBO0FBQUE7WUFDRSxLQUFDLENBQUEsb0JBQXFCLENBQUEsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsQ0FBQyxJQUExQyxDQUErQyxTQUEvQyxFQURGO1dBQUEsYUFBQTtZQUVNO1lBQ0osT0FBTyxLQUFDLENBQUEsb0JBQXFCLENBQUEsTUFBTSxDQUFDLFdBQVA7WUFDN0IsTUFBQSxDQUFPLFFBQUEsR0FBUyxHQUFULEdBQWEsc0NBQWIsR0FBbUQsS0FBQyxDQUFBLG9CQUFxQixDQUFBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLENBQUMsWUFBWSxDQUFDLEdBQWpILEVBSkY7O2lCQU1BLEtBQUMsQ0FBQSxvQkFBcUIsQ0FBQSxNQUFNLENBQUMsV0FBUCxDQUFtQixDQUFDLElBQTFDLENBQStDLFlBQUEsR0FBYSxLQUE1RCxFQUFxRSxTQUFDLE1BQUQ7WUFDbkUsSUFBRyxrQkFBSDtxQkFDRSxNQUFBLENBQU8sU0FBQSxHQUFVLE1BQU0sQ0FBQyxZQUFqQixHQUE4QixJQUE5QixHQUFrQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQTdDLEdBQXFELElBQXJELEdBQXlELE1BQU0sQ0FBQyxhQUF2RSxFQURGO2FBQUEsTUFBQTtjQUdFLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLE1BQU0sQ0FBQztxQkFDMUIsT0FBQSxDQUFRLE1BQVIsRUFKRjs7VUFEbUUsQ0FBckU7UUFSVTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUjtJQW5CSzs7eUJBbUNYLHlCQUFBLEdBQTJCLFNBQUMsR0FBRDtBQUN6QixVQUFBO01BRDJCLFNBQUQ7YUFDMUIsSUFBQyxDQUFBLGtCQUFELENBQW9CO1FBQUMsU0FBQSxFQUFXLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBM0I7T0FBcEI7SUFEeUI7O3lCQUkzQiwyQkFBQSxHQUE2QixTQUFDLEdBQUQ7QUFDM0IsVUFBQTtNQUQ2QixTQUFEO2FBQzVCLElBQUMsQ0FBQSxrQkFBRCxDQUFvQjtRQUFDLFNBQUEsRUFBVyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQTNCO1FBQWlDLFNBQUEsRUFBVyxJQUE1QztPQUFwQjtJQUQyQjs7eUJBSzdCLGtCQUFBLEdBQW9CLFNBQUMsT0FBRDtBQUNsQixVQUFBO01BQUEsU0FBQSxHQUFZLE9BQU8sQ0FBQztNQUNwQixTQUFBLEdBQVksT0FBTyxDQUFDLFNBQVIsSUFBcUI7YUFDakMsRUFBRSxDQUFDLE9BQUgsQ0FBVyxTQUFYLEVBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFELEVBQUssS0FBTDtVQUNwQixJQUFPLFdBQVA7bUJBQ0UsS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFDLElBQUQ7QUFDUixrQkFBQTtjQUFBLFVBQUEsR0FBYSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsSUFBckI7cUJBQ2IsRUFBRSxDQUFDLElBQUgsQ0FBUSxVQUFSLEVBQW9CLFNBQUMsR0FBRCxFQUFNLEtBQU47Z0JBQ2xCLElBQU8sV0FBUDtrQkFDRSxJQUFHLEtBQUssQ0FBQyxNQUFOLENBQUEsQ0FBSDtvQkFDRSxJQUFVLGdCQUFnQixDQUFDLElBQWpCLENBQXNCLFVBQXRCLENBQVY7QUFBQSw2QkFBQTs7b0JBQ0EsSUFBRywwQkFBMEIsQ0FBQyxJQUEzQixDQUFnQyxVQUFoQyxDQUFIOzZCQUNFLEtBQUMsQ0FBQSxTQUFELENBQVcsSUFBWCxFQUFpQixJQUFqQixFQUF1QixLQUFDLENBQUEsa0JBQUQsQ0FBb0IsVUFBcEIsQ0FBdkIsRUFERjtxQkFGRjttQkFBQSxNQUlLLElBQUcsU0FBQSxJQUFjLEtBQUssQ0FBQyxXQUFOLENBQUEsQ0FBakI7MkJBQ0gsS0FBQyxDQUFBLGtCQUFELENBQW9CO3NCQUFDLFNBQUEsRUFBVyxVQUFaO3NCQUF3QixTQUFBLEVBQVcsSUFBbkM7cUJBQXBCLEVBREc7bUJBTFA7O2NBRGtCLENBQXBCO1lBRlEsQ0FBVixFQURGOztRQURvQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7SUFIa0I7O3lCQWlCcEIsU0FBQSxHQUFXLFNBQUMsVUFBRCxFQUFhLFVBQWIsRUFBeUIsZUFBekI7QUFFVCxVQUFBO01BQUEsSUFBRyx1QkFBSDtRQUNJLCtCQUFGLEVBQVUsZ0NBRFo7T0FBQSxNQUFBO1FBR0UsT0FBb0IsSUFBQyxDQUFBLGtCQUFELENBQW9CLFVBQXBCLENBQXBCLEVBQUMsb0JBQUQsRUFBUyxxQkFIWDs7TUFLQSxJQUFVLE1BQU0sQ0FBQyxlQUFQLEtBQTRCLElBQXRDO0FBQUEsZUFBQTs7TUFFQSxJQUFHLE1BQU0sQ0FBQyw4QkFBVjtRQUNFLElBQUcsQ0FBSSxJQUFDLENBQUEsZUFBRCxDQUFpQixNQUFNLENBQUMsYUFBeEIsQ0FBUDtBQUNFLGlCQURGO1NBREY7O01BSUEsSUFBRyxDQUFJLFlBQUEsQ0FBYSxNQUFNLENBQUMsVUFBcEIsRUFBZ0MsTUFBTSxDQUFDLFVBQXZDLENBQVA7UUFDRSxJQUFHLENBQUksTUFBTSxDQUFDLDBCQUFkO1VBQ0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4QixpRUFBOUIsRUFDRTtZQUFBLFdBQUEsRUFBYSxLQUFiO1lBQ0EsTUFBQSxFQUFRLHVDQUFBLEdBQXdDLE1BQU0sQ0FBQyxVQUEvQyxHQUEwRCwyRkFEbEU7V0FERixFQURGOztBQU1BLGVBUEY7O01BU0EsWUFBQSxHQUFlLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQWpCO01BRWYsSUFBQyxDQUFBLGtCQUFELENBQW9CLE1BQXBCO01BR0EsSUFBQyxDQUFBLFVBQUQsQ0FBWSxNQUFNLENBQUMsV0FBbkI7TUFHQSxJQUFHLElBQUMsQ0FBQSxvQkFBcUIsQ0FBQSxNQUFNLENBQUMsV0FBUCxDQUF6QjtRQUNFLEtBQUEsR0FBUSxJQUFDLENBQUEsS0FBRDtRQUNSLFNBQUEsR0FDRTtVQUFBLEtBQUEsRUFBTyxLQUFQO1VBQ0EsT0FBQSxFQUFTLFdBRFQ7VUFFQSxNQUFBLEVBQVEsTUFGUjtVQUdBLFlBQUEsRUFBYyxZQUhkOztBQU1GO1VBQ0UsSUFBQyxDQUFBLG9CQUFxQixDQUFBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLENBQUMsSUFBMUMsQ0FBK0MsU0FBL0MsRUFERjtTQUFBLGFBQUE7VUFFTTtVQUNKLE9BQU8sQ0FBQyxHQUFSLENBQVksUUFBQSxHQUFTLEdBQVQsR0FBYSxzQ0FBYixHQUFtRCxJQUFDLENBQUEsb0JBQXFCLENBQUEsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsQ0FBQyxZQUFZLENBQUMsR0FBdEg7VUFDQSxPQUFPLElBQUMsQ0FBQSxvQkFBcUIsQ0FBQSxNQUFNLENBQUMsV0FBUDtVQUM3QixJQUFDLENBQUEsVUFBRCxDQUFZLE1BQU0sQ0FBQyxXQUFuQjtVQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksb0NBQUEsR0FBcUMsSUFBQyxDQUFBLG9CQUFxQixDQUFBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLENBQUMsWUFBWSxDQUFDLEdBQXhHO1VBQ0EsSUFBQyxDQUFBLG9CQUFxQixDQUFBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLENBQUMsSUFBMUMsQ0FBK0MsU0FBL0MsRUFQRjs7ZUFVQSxJQUFDLENBQUEsb0JBQXFCLENBQUEsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsQ0FBQyxJQUExQyxDQUErQyxZQUFBLEdBQWEsS0FBNUQsRUFBcUUsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxNQUFEO0FBRW5FLGdCQUFBO1lBQUEseUNBQWdCLENBQUUsZ0JBQWxCO0FBQStCLHFCQUEvQjs7WUFDQSxJQUFHLE1BQU0sQ0FBQyxHQUFWO2NBQ0UsSUFBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQWQ7dUJBQ0UsS0FBQyxDQUFBLDJCQUE0QixDQUFBLE1BQU0sQ0FBQyxVQUFQLENBQTdCLEdBQ0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0Qiw0QkFBNUIsRUFDRTtrQkFBQSxXQUFBLEVBQWEsSUFBYjtrQkFDQSxNQUFBLEVBQVcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFaLEdBQW9CLE9BQXBCLEdBQTJCLE1BQU0sQ0FBQyxhQUFsQyxHQUFnRCxPQUFoRCxHQUF1RCxNQUFNLENBQUMsR0FBRyxDQUFDLEtBRDVFO2lCQURGLEVBRko7ZUFBQSxNQUFBO2dCQU1FLEtBQUMsQ0FBQSwyQkFBNEIsQ0FBQSxNQUFNLENBQUMsVUFBUCxDQUE3QixHQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsYUFBQSxHQUFjLE1BQU0sQ0FBQyxZQUFyQixHQUFrQyxtQkFBOUQsRUFDRTtrQkFBQSxXQUFBLEVBQWEsSUFBYjtrQkFDQSxNQUFBLEVBQVcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFaLEdBQW9CLE9BQXBCLEdBQTJCLE1BQU0sQ0FBQyxhQUFsQyxHQUFnRCxPQUFoRCxHQUF1RCxNQUFNLENBQUMsR0FBRyxDQUFDLFNBRDVFO2lCQURGO2dCQUlGLElBQUcsZ0VBQUEsMEJBQTBCLFVBQVUsQ0FBRSxlQUF6Qzt5QkFDRSxVQUFVLENBQUMsdUJBQVgsQ0FBbUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFmLEdBQW9CLENBQXJCLEVBQXdCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQXZDLENBQW5DLEVBREY7aUJBWEY7ZUFERjthQUFBLE1BQUE7Y0FlRSxJQUFHLENBQUksTUFBTSxDQUFDLCtCQUFkO2dCQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsYUFBQSxHQUFjLE1BQU0sQ0FBQyxZQUFyQixHQUFrQyxxQkFBN0QsRUFDRTtrQkFBQSxNQUFBLEVBQVcsTUFBTSxDQUFDLFVBQVIsR0FBbUIsT0FBbkIsR0FBMEIsTUFBTSxDQUFDLGFBQTNDO2lCQURGLEVBREY7O2NBSUEsSUFBRyxDQUFJLE1BQU0sQ0FBQyxvQkFBZDtnQkFDRSxJQUFHLENBQUksTUFBTSxDQUFDLCtCQUFkO2tCQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIscUNBQTNCLEVBREY7O0FBRUEsdUJBSEY7O2NBSUEsSUFBRyxNQUFNLENBQUMsVUFBUCxLQUFxQixNQUFNLENBQUMsY0FBL0I7Z0JBQ0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4QiwyREFBOUIsRUFDRTtrQkFBQSxXQUFBLEVBQWEsSUFBYjtrQkFDQSxNQUFBLEVBQVEsTUFBTSxDQUFDLFVBRGY7aUJBREY7QUFHQSx1QkFKRjs7Y0FPQSxJQUFHLE1BQU0sQ0FBQyx1QkFBVjtnQkFDRSxFQUFFLENBQUMsWUFBSCxDQUFpQixJQUFJLENBQUMsS0FBTCxDQUFZLE1BQU0sQ0FBQyxjQUFuQixDQUFrQyxDQUFDLEdBQXBELEVBREY7O2NBSUEsSUFBRyxNQUFNLENBQUMsZUFBVjtnQkFDRSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQWQsR0FBcUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFkLEdBQXFCLElBQXJCLEdBQTRCLHVCQUE1QixHQUFvRCxNQUFNLENBQUMsUUFEbEY7O2NBR0EsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsTUFBTSxDQUFDLGNBQXhCLEVBQXdDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBdEQ7Y0FHQSxJQUFHLE1BQU0sQ0FBQyxTQUFQLDhDQUFzQyxDQUFFLGlCQUEzQztnQkFDRSxJQUFHLE1BQU0sQ0FBQyx1QkFBVjtrQkFDRSxFQUFFLENBQUMsWUFBSCxDQUFnQixJQUFJLENBQUMsS0FBTCxDQUFXLE1BQU0sQ0FBQyxPQUFsQixDQUEwQixDQUFDLEdBQTNDLEVBREY7O2dCQUVBLE9BQUEsR0FDRTtrQkFBQSxPQUFBLEVBQVMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBM0I7a0JBQ0EsT0FBQSxFQUFVLE1BQU0sQ0FBQyxVQURqQjtrQkFFQSxJQUFBLEVBQU0sTUFBTSxDQUFDLGNBRmI7a0JBR0EsVUFBQSxFQUFZLEVBSFo7a0JBSUEsS0FBQSxFQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBSnpCO2tCQUtBLFFBQUEsRUFBVSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUw1Qjs7Z0JBTUYsY0FBQSxHQUFpQjt1QkFDakIsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsTUFBTSxDQUFDLE9BQXhCLEVBQ0UsY0FBQSxHQUFpQixJQUFJLENBQUMsU0FBTCxDQUFlLE9BQWYsRUFBd0IsSUFBeEIsRUFBOEIsR0FBOUIsQ0FEbkIsRUFYRjtlQXhDRjs7VUFIbUU7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJFLEVBbkJGOztJQTlCUzs7eUJBMkdYLGtCQUFBLEdBQW9CLFNBQUMsTUFBRDtBQUVsQixVQUFBO01BQUEsSUFBRywyREFBSDtRQUNFLElBQUMsQ0FBQSwyQkFBNEIsQ0FBQSxNQUFNLENBQUMsVUFBUCxDQUFrQixDQUFDLE9BQWhELENBQUE7UUFDQSxPQUFPLElBQUMsQ0FBQSwyQkFBNEIsQ0FBQSxNQUFNLENBQUMsVUFBUCxFQUZ0Qzs7QUFJQTtBQUFBLFdBQUEsVUFBQTs7UUFDRSxJQUFHLENBQUMsQ0FBQyxTQUFMO1VBQ0UsT0FBTyxJQUFDLENBQUEsMkJBQTRCLENBQUEsRUFBQSxFQUR0Qzs7QUFERjtNQU9BLENBQUEsR0FBSSxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUFqQyxHQUEwQztBQUM5QzthQUFNLENBQUEsSUFBSyxDQUFYO1FBQ0UsSUFBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUFwQyxJQUNILElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQU8sQ0FBQyxTQUE1QyxDQUFzRCxDQUF0RCxFQUF3RCxDQUF4RCxDQUFBLEtBQThELEtBRDlEO1VBRUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBakMsQ0FBd0MsQ0FBeEMsRUFBMkMsQ0FBM0MsRUFGRjs7cUJBR0EsQ0FBQTtNQUpGLENBQUE7O0lBZGtCOzt5QkFxQnBCLFVBQUEsR0FBWSxTQUFDLFdBQUQ7QUFDVixVQUFBOzJFQUFzQixDQUFBLFdBQUEsUUFBQSxDQUFBLFdBQUEsSUFDcEIsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFDLENBQUEsb0JBQVgsRUFBaUMsV0FBakMsRUFBOEMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUU1QyxPQUFPLEtBQUMsQ0FBQSxvQkFBcUIsQ0FBQSxXQUFBO1FBRmU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlDO0lBRlE7O3lCQU9aLGVBQUEsR0FBaUIsU0FBQTtNQUNmLElBQUcsd0VBQUg7UUFDRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0RBQWhCLEVBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLCtDQUFoQixDQURGLEVBREY7O01BR0EsSUFBRyxtRUFBSDtRQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwyQ0FBaEIsRUFDRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMENBQWhCLENBREYsRUFERjs7TUFHQSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQVosQ0FBa0IsK0NBQWxCO01BQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFaLENBQWtCLDBDQUFsQjtNQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBWixDQUFrQixtQ0FBbEI7TUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQVosQ0FBa0IsdUNBQWxCO01BRUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFaLENBQWtCLDJCQUFsQjtNQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBWixDQUFrQixnQ0FBbEI7TUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQVosQ0FBa0IsNkJBQWxCO01BQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFaLENBQWtCLHNDQUFsQjtNQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBWixDQUFrQixzQ0FBbEI7TUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQVosQ0FBa0Isa0NBQWxCO01BQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFaLENBQWtCLHFDQUFsQjtNQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBWixDQUFrQix3QkFBbEI7TUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQVosQ0FBa0Isd0JBQWxCO2FBRUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFaLENBQWtCLDBCQUFsQjtJQXRCZTs7eUJBMEJqQixlQUFBLEdBQWlCLFNBQUMsTUFBRDtBQUVmLFVBQUE7TUFBQSxZQUFBLEdBQ0U7UUFBQSxJQUFBLEVBQU0sSUFBTjs7TUFDRixJQUFHLE1BQU0sQ0FBQyxTQUFWO1FBQTBCLFlBQVksQ0FBQyxVQUFiLEdBQTBCLE1BQU0sQ0FBQyxVQUEzRDs7YUFDQTtJQUxlOzt5QkFRakIsa0JBQUEsR0FBb0IsU0FBQyxVQUFEO0FBQ2xCLFVBQUE7TUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBQTtNQUNULE1BQUEsR0FBUyxJQUFDLENBQUEsUUFBRCxDQUFVLFVBQVYsRUFBc0IsTUFBdEI7TUFFVCxJQUFHLE1BQU0sQ0FBQyxrQkFBVjtRQUNFLElBQU8sdUJBQVA7VUFDRSxJQUFDLENBQUEsVUFBRCxHQUFjLENBQUMsT0FBQSxDQUFRLHFCQUFSLENBQUQsQ0FBQSxDQUFBO1VBQ2QsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFaLENBQXNCLGFBQXRCLEVBQXFDLG1CQUFyQyxFQUZGOztRQUdBLFdBQUEsR0FBYyxJQUFDLENBQUEsY0FBRCxDQUFnQixNQUFNLENBQUMsYUFBdkIsRUFBc0MsTUFBTSxDQUFDLFdBQTdDLEVBQTBELEVBQTFEO1FBRWQsSUFBQyxDQUFBLEtBQUQsQ0FBTyxNQUFQLEVBQWUsV0FBZjtRQUVBLE1BQUEsR0FBUyxJQUFDLENBQUEsUUFBRCxDQUFVLFVBQVYsRUFBc0IsTUFBdEIsRUFSWDs7QUFTQSxhQUFPO1FBQUUsUUFBQSxNQUFGO1FBQVUsUUFBQSxNQUFWOztJQWJXOzt5QkFnQnBCLFNBQUEsR0FBVyxTQUFBO2FBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdCQUFoQjtJQUFIOzt5QkFNWCxjQUFBLEdBQWdCLFNBQUMsT0FBRCxFQUFVLEtBQVYsRUFBaUIsV0FBakI7QUFFZCxVQUFBO01BQUEsZUFBQSxHQUFrQjtNQUNsQixvQkFBQSxHQUF1QixJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsZUFBbkI7TUFDdkIsSUFBRyxFQUFFLENBQUMsVUFBSCxDQUFjLG9CQUFkLENBQUg7UUFDRSxXQUFBLEdBQWEsRUFBRSxDQUFDLFlBQUgsQ0FBZ0Isb0JBQWhCLEVBQXNDLE1BQXRDO0FBQ2I7VUFDRSxXQUFBLEdBQWMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxXQUFYLEVBRGhCO1NBQUEsYUFBQTtVQUVNO1VBQ0osSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0QixNQUFBLEdBQU8sZUFBUCxHQUF1QixHQUF2QixHQUEwQixHQUFHLENBQUMsT0FBMUQsRUFDRTtZQUFBLFdBQUEsRUFBYSxJQUFiO1lBQ0EsTUFBQSxFQUFRLFNBQUEsR0FBVSxvQkFBVixHQUErQixNQUEvQixHQUFxQyxXQUQ3QztXQURGO0FBR0EsaUJBTkY7O1FBUUEsWUFBQSxHQUFlLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFxQixhQUFyQixFQUFvQyxXQUFwQztRQUNmLElBQUcsWUFBSDtVQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsTUFBQSxHQUFPLGVBQVAsR0FBdUIsc0JBQW5ELEVBQ0U7WUFBQSxXQUFBLEVBQWEsSUFBYjtZQUNBLE1BQUEsRUFBUSxTQUFBLEdBQVUsb0JBQVYsR0FBK0IsTUFBL0IsR0FBcUMsV0FEN0M7V0FERixFQURGO1NBQUEsTUFBQTtVQU9FLGFBQUEsR0FBZ0IsV0FBVyxDQUFDO1VBQzVCLElBQUMsQ0FBQSxLQUFELENBQVEsV0FBUixFQUFxQixXQUFyQjtVQUNBLElBQUcsYUFBSDtZQUFzQixXQUFXLENBQUMsY0FBWixHQUE2QixRQUFuRDs7VUFDQSxXQUFBLEdBQWMsWUFWaEI7U0FYRjs7TUFzQkEsSUFBRyxPQUFBLEtBQWEsS0FBaEI7UUFFRSxJQUFHLE9BQUEsS0FBVyxJQUFJLENBQUMsT0FBTCxDQUFhLE9BQWIsQ0FBZDtBQUF5QyxpQkFBTyxZQUFoRDs7UUFFQSxJQUFHLGFBQUg7QUFBc0IsaUJBQU8sWUFBN0I7O0FBQ0EsZUFBTyxJQUFDLENBQUEsY0FBRCxDQUFnQixJQUFJLENBQUMsT0FBTCxDQUFhLE9BQWIsQ0FBaEIsRUFBdUMsS0FBdkMsRUFBOEMsV0FBOUMsRUFMVDtPQUFBLE1BQUE7QUFNSyxlQUFPLFlBTlo7O0lBMUJjOzt5QkFxQ2hCLFFBQUEsR0FBVyxTQUFDLFVBQUQsRUFBYSxNQUFiO0FBQ1QsVUFBQTtNQUFBLHVCQUFBLEdBQTBCLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUE0QixVQUE1QjtNQUUxQixJQUFHLHVCQUF3QixDQUFBLENBQUEsQ0FBeEIsS0FBOEIsSUFBakM7UUFDRSxtQkFBQSxHQUFzQixNQUR4QjtPQUFBLE1BQUE7UUFFSyxtQkFBQSxHQUFzQixLQUYzQjs7TUFPQSxJQUFHLDZCQUFIO1FBQ0UsY0FBQSxHQUFpQixJQUFJLENBQUMsU0FBTCxDQUFlLE1BQU0sQ0FBQyxjQUF0QixFQURuQjtPQUFBLE1BRUssSUFBRyx1QkFBd0IsQ0FBQSxDQUFBLENBQXhCLEtBQThCLElBQWpDO1FBQ0gsY0FBQSxHQUFpQixJQUFJLENBQUMsS0FBTCxDQUFXLFVBQVgsQ0FBc0IsQ0FBQyxLQURyQztPQUFBLE1BQUE7UUFLSCxjQUFBLEdBQWlCLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBSSxDQUFDLElBQUwsQ0FBVSx1QkFBd0IsQ0FBQSxDQUFBLENBQWxDLEVBQXFDLEdBQXJDLENBQWYsRUFMZDs7TUFNTCxhQUFBLEdBQWdCLElBQUksQ0FBQyxTQUFMLENBQWUsTUFBTSxDQUFDLGVBQXRCO01BQ2hCLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxTQUFMLENBQWUsTUFBTSxDQUFDLGtCQUF0QjtNQUNuQixXQUFBLEdBQWMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxNQUFNLENBQUMsYUFBdEI7TUFFZCxhQUFBLEdBQWdCLElBQUksQ0FBQyxJQUFMLENBQVUsY0FBVixFQUEyQixhQUEzQjtNQUNoQixnQkFBQSxHQUFtQixJQUFJLENBQUMsSUFBTCxDQUFVLGNBQVYsRUFBMkIsZ0JBQTNCO01BQ25CLFdBQUEsR0FBYyxJQUFJLENBQUMsSUFBTCxDQUFVLGNBQVYsRUFBMkIsV0FBM0I7TUFFZCxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBTCxDQUFXLFVBQVg7TUFDbkIseUJBQUEsR0FBNEIsSUFBSSxDQUFDLFFBQUwsQ0FBYyxhQUFkLEVBQTZCLGdCQUFnQixDQUFDLEdBQTlDO01BQzVCLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxJQUFMLENBQVUsZ0JBQVYsRUFBNEIseUJBQTVCLEVBQXdELGdCQUFnQixDQUFDLElBQWpCLEdBQXlCLEtBQWpGO01BQ3BCLFVBQUEsR0FBYSxJQUFJLENBQUMsSUFBTCxDQUFVLFdBQVYsRUFBdUIseUJBQXZCLEVBQW1ELGdCQUFnQixDQUFDLElBQWpCLEdBQXlCLFNBQTVFO2FBRWI7UUFBQSxtQkFBQSxFQUFxQixtQkFBckI7UUFDQSxVQUFBLEVBQVksVUFEWjtRQUVBLGFBQUEsRUFBZSxnQkFBZ0IsQ0FBQyxHQUZoQztRQUdBLE9BQUEsRUFBUyxVQUhUO1FBSUEsY0FBQSxFQUFnQixpQkFKaEI7UUFLQSxVQUFBLEVBQVksYUFMWjtRQU1BLFdBQUEsRUFBYSxjQU5iOztJQS9CUzs7eUJBd0NYLGVBQUEsR0FBaUIsU0FBQyxPQUFEO0FBRWYsVUFBQTtNQUFBLE9BQUEsR0FBVTtNQUNWLFdBQUEsR0FBYyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsT0FBbkI7TUFDZCxJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsV0FBZCxDQUFIO0FBQ0UsZUFBTyxLQURUOztNQUVBLElBQUcsT0FBQSxLQUFXLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBYixDQUFkO0FBQ0UsZUFBTyxJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFJLENBQUMsT0FBTCxDQUFhLE9BQWIsQ0FBakIsRUFEVDtPQUFBLE1BQUE7QUFFSyxlQUFPLE1BRlo7O0lBTmU7O3lCQVdqQixLQUFBLEdBQU8sU0FBQyxTQUFELEVBQVksU0FBWjtBQUNMLFVBQUE7QUFBQTtXQUFBLGlCQUFBOztxQkFDRSxTQUFVLENBQUEsSUFBQSxDQUFWLEdBQWtCO0FBRHBCOztJQURLOzt5QkFLUCxrQkFBQSxHQUFvQixTQUFDLFdBQUQ7QUFDbEIsVUFBQTtNQUFBLFNBQUEsR0FDRTtRQUFBLE9BQUEsRUFBUyxNQUFUOzthQUNGLElBQUMsQ0FBQSxvQkFBcUIsQ0FBQSxXQUFBLENBQVksQ0FBQyxJQUFuQyxDQUF3QyxTQUF4QztJQUhrQjs7eUJBTXBCLHFCQUFBLEdBQXVCLFNBQUE7QUFDckIsVUFBQTtBQUFBO0FBQUE7V0FBQSxtQkFBQTs7cUJBQ0UsSUFBQyxDQUFBLGtCQUFELENBQW9CLFdBQXBCO0FBREY7O0lBRHFCOzt5QkFNdkIsZUFBQSxHQUFpQixTQUFBO0FBQ2YsVUFBQTtNQUFBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBO0FBQ25CO0FBQUE7V0FBQSx1QkFBQTs7UUFDRSxzQkFBQSxHQUF5QjtBQUN6QixhQUFBLGtEQUFBOztVQUNFLElBQUcsWUFBQSxDQUFhLGVBQWIsRUFBOEIsZUFBOUIsQ0FBSDtZQUNFLHNCQUFBLEdBQXlCO0FBQ3pCLGtCQUZGOztBQURGO1FBSUEsSUFBRyxDQUFJLHNCQUFQO3VCQUFtQyxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsZUFBcEIsR0FBbkM7U0FBQSxNQUFBOytCQUFBOztBQU5GOztJQUZlOzs7Ozs7RUFVbkIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF0YWpCIiwic291cmNlc0NvbnRlbnQiOlsie1Rhc2ssIENvbXBvc2l0ZURpc3Bvc2FibGUgfSA9IHJlcXVpcmUgJ2F0b20nXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbnBhdGhJc0luc2lkZSA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9wYXRoLWlzLWluc2lkZSdcblxuIyBzZXR1cCBKU09OIFNjaGVtYSB0byBwYXJzZSAubGFuZ3VhZ2ViYWJlbCBjb25maWdzXG5sYW5ndWFnZWJhYmVsU2NoZW1hID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIGJhYmVsTWFwc1BhdGg6ICAgICAgICAgICAgICAgICAgICB7IHR5cGU6ICdzdHJpbmcnIH0sXG4gICAgYmFiZWxNYXBzQWRkVXJsOiAgICAgICAgICAgICAgICAgIHsgdHlwZTogJ2Jvb2xlYW4nIH0sXG4gICAgYmFiZWxTb3VyY2VQYXRoOiAgICAgICAgICAgICAgICAgIHsgdHlwZTogJ3N0cmluZycgfSxcbiAgICBiYWJlbFRyYW5zcGlsZVBhdGg6ICAgICAgICAgICAgICAgeyB0eXBlOiAnc3RyaW5nJyB9LFxuICAgIGNyZWF0ZU1hcDogICAgICAgICAgICAgICAgICAgICAgICB7IHR5cGU6ICdib29sZWFuJyB9LFxuICAgIGNyZWF0ZVRhcmdldERpcmVjdG9yaWVzOiAgICAgICAgICB7IHR5cGU6ICdib29sZWFuJyB9LFxuICAgIGNyZWF0ZVRyYW5zcGlsZWRDb2RlOiAgICAgICAgICAgICB7IHR5cGU6ICdib29sZWFuJyB9LFxuICAgIGRpc2FibGVXaGVuTm9CYWJlbHJjRmlsZUluUGF0aDogICB7IHR5cGU6ICdib29sZWFuJyB9LFxuICAgIHByb2plY3RSb290OiAgICAgICAgICAgICAgICAgICAgICB7IHR5cGU6ICdib29sZWFuJyB9LFxuICAgIHN1cHByZXNzU291cmNlUGF0aE1lc3NhZ2VzOiAgICAgICB7IHR5cGU6ICdib29sZWFuJyB9LFxuICAgIHN1cHByZXNzVHJhbnNwaWxlT25TYXZlTWVzc2FnZXM6ICB7IHR5cGU6ICdib29sZWFuJyB9LFxuICAgIHRyYW5zcGlsZU9uU2F2ZTogICAgICAgICAgICAgICAgICB7IHR5cGU6ICdib29sZWFuJyB9XG4gIH0sXG4gIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZVxufVxuXG5jbGFzcyBUcmFuc3BpbGVyXG5cbiAgZnJvbUdyYW1tYXJOYW1lOiAnQmFiZWwgRVM2IEphdmFTY3JpcHQnXG4gIGZyb21TY29wZU5hbWU6ICdzb3VyY2UuanMuanN4J1xuICB0b1Njb3BlTmFtZTogJ3NvdXJjZS5qcy5qc3gnXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQHJlcUlkID0gMFxuICAgIEBiYWJlbFRyYW5zcGlsZXJUYXNrcyA9IHt9XG4gICAgQGJhYmVsVHJhbnNmb3JtZXJQYXRoID0gcmVxdWlyZS5yZXNvbHZlICcuL3RyYW5zcGlsZXItdGFzaydcbiAgICBAdHJhbnNwaWxlRXJyb3JOb3RpZmljYXRpb25zID0ge31cbiAgICBAZGVwcmVjYXRlQ29uZmlnKClcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgaWYgQGdldENvbmZpZygpLnRyYW5zcGlsZU9uU2F2ZSBvciBAZ2V0Q29uZmlnKCkuYWxsb3dMb2NhbE92ZXJyaWRlXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29udGV4dE1lbnUuYWRkIHtcbiAgICAgICAgJy50cmVlLXZpZXcgLmRpcmVjdG9yeSA+IC5oZWFkZXIgPiAubmFtZSc6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbGFiZWw6ICdMYW5ndWFnZS1CYWJlbCdcbiAgICAgICAgICAgICAgc3VibWVudTogW1xuICAgICAgICAgICAgICAgIHtsYWJlbDogJ1RyYW5zcGlsZSBEaXJlY3RvcnkgJywgY29tbWFuZDogJ2xhbmd1YWdlLWJhYmVsOnRyYW5zcGlsZS1kaXJlY3RvcnknfVxuICAgICAgICAgICAgICAgIHtsYWJlbDogJ1RyYW5zcGlsZSBEaXJlY3RvcmllcycsIGNvbW1hbmQ6ICdsYW5ndWFnZS1iYWJlbDp0cmFuc3BpbGUtZGlyZWN0b3JpZXMnfVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB7J3R5cGUnOiAnc2VwYXJhdG9yJyB9XG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICcudHJlZS12aWV3IC5kaXJlY3RvcnkgPiAuaGVhZGVyID4gLm5hbWUnLCAnbGFuZ3VhZ2UtYmFiZWw6dHJhbnNwaWxlLWRpcmVjdG9yeScsIEBjb21tYW5kVHJhbnNwaWxlRGlyZWN0b3J5XG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICcudHJlZS12aWV3IC5kaXJlY3RvcnkgPiAuaGVhZGVyID4gLm5hbWUnLCAnbGFuZ3VhZ2UtYmFiZWw6dHJhbnNwaWxlLWRpcmVjdG9yaWVzJywgQGNvbW1hbmRUcmFuc3BpbGVEaXJlY3Rvcmllc1xuXG4gICMgbWV0aG9kIHVzZWQgYnkgc291cmNlLXByZXZpZXcgdG8gc2VlIHRyYW5zcGlsZWQgY29kZVxuICB0cmFuc2Zvcm06IChjb2RlLCB7ZmlsZVBhdGgsIHNvdXJjZU1hcH0pIC0+XG4gICAgY29uZmlnID0gQGdldENvbmZpZygpXG4gICAgcGF0aFRvID0gQGdldFBhdGhzIGZpbGVQYXRoLCBjb25maWdcbiAgICAjIGNyZWF0ZSBiYWJlbCB0cmFuc2Zvcm1lciB0YXNrcyAtIG9uZSBwZXIgcHJvamVjdCBhcyBuZWVkZWRcbiAgICBAY3JlYXRlVGFzayBwYXRoVG8ucHJvamVjdFBhdGhcbiAgICBiYWJlbE9wdGlvbnMgPVxuICAgICAgZmlsZW5hbWU6IGZpbGVQYXRoXG4gICAgICBhc3Q6IGZhbHNlXG4gICAgaWYgc291cmNlTWFwIHRoZW4gYmFiZWxPcHRpb25zLnNvdXJjZU1hcHMgPSBzb3VyY2VNYXBcbiAgICAjIG9rIG5vdyB0cmFuc3BpbGUgaW4gdGhlIHRhc2sgYW5kIHdhaXQgb24gdGhlIHJlc3VsdFxuICAgIGlmIEBiYWJlbFRyYW5zcGlsZXJUYXNrc1twYXRoVG8ucHJvamVjdFBhdGhdXG4gICAgICByZXFJZCA9IEByZXFJZCsrXG4gICAgICBtc2dPYmplY3QgPVxuICAgICAgICByZXFJZDogcmVxSWRcbiAgICAgICAgY29tbWFuZDogJ3RyYW5zcGlsZUNvZGUnXG4gICAgICAgIHBhdGhUbzogcGF0aFRvXG4gICAgICAgIGNvZGU6IGNvZGVcbiAgICAgICAgYmFiZWxPcHRpb25zOiBiYWJlbE9wdGlvbnNcblxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QgKSA9PlxuICAgICAgIyB0cmFuc3BpbGUgaW4gdGFza1xuICAgICAgdHJ5XG4gICAgICAgIEBiYWJlbFRyYW5zcGlsZXJUYXNrc1twYXRoVG8ucHJvamVjdFBhdGhdLnNlbmQobXNnT2JqZWN0KVxuICAgICAgY2F0Y2ggZXJyXG4gICAgICAgIGRlbGV0ZSBAYmFiZWxUcmFuc3BpbGVyVGFza3NbcGF0aFRvLnByb2plY3RQYXRoXVxuICAgICAgICByZWplY3QoXCJFcnJvciAje2Vycn0gc2VuZGluZyB0byB0cmFuc3BpbGUgdGFzayB3aXRoIFBJRCAje0BiYWJlbFRyYW5zcGlsZXJUYXNrc1twYXRoVG8ucHJvamVjdFBhdGhdLmNoaWxkUHJvY2Vzcy5waWR9XCIpXG4gICAgICAjIGdldCByZXN1bHQgZnJvbSB0YXNrIGZvciB0aGlzIHJlcUlkXG4gICAgICBAYmFiZWxUcmFuc3BpbGVyVGFza3NbcGF0aFRvLnByb2plY3RQYXRoXS5vbmNlIFwidHJhbnNwaWxlOiN7cmVxSWR9XCIsIChtc2dSZXQpID0+XG4gICAgICAgIGlmIG1zZ1JldC5lcnI/XG4gICAgICAgICAgcmVqZWN0KFwiQmFiZWwgdiN7bXNnUmV0LmJhYmVsVmVyc2lvbn1cXG4je21zZ1JldC5lcnIubWVzc2FnZX1cXG4je21zZ1JldC5iYWJlbENvcmVVc2VkfVwiKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbXNnUmV0LnNvdXJjZU1hcCA9IG1zZ1JldC5tYXBcbiAgICAgICAgICByZXNvbHZlKG1zZ1JldClcblxuICAjIGNhbGxlZCBieSBjb21tYW5kXG4gIGNvbW1hbmRUcmFuc3BpbGVEaXJlY3Rvcnk6ICh7dGFyZ2V0fSkgPT5cbiAgICBAdHJhbnNwaWxlRGlyZWN0b3J5IHtkaXJlY3Rvcnk6IHRhcmdldC5kYXRhc2V0LnBhdGggfVxuXG4gICMgY2FsbGVkIGJ5IGNvbW1hbmRcbiAgY29tbWFuZFRyYW5zcGlsZURpcmVjdG9yaWVzOiAoe3RhcmdldH0pID0+XG4gICAgQHRyYW5zcGlsZURpcmVjdG9yeSB7ZGlyZWN0b3J5OiB0YXJnZXQuZGF0YXNldC5wYXRoLCByZWN1cnNpdmU6IHRydWV9XG5cbiAgIyB0cmFuc3BpbGUgYWxsIGZpbGVzIGluIGEgZGlyZWN0b3J5IG9yIHJlY3Vyc2l2ZSBkaXJlY3Rvcmllc1xuICAjIG9wdGlvbnMgYXJlIHsgZGlyZWN0b3J5OiBuYW1lLCByZWN1cnNpdmU6IHRydWV8ZmFsc2V9XG4gIHRyYW5zcGlsZURpcmVjdG9yeTogKG9wdGlvbnMpIC0+XG4gICAgZGlyZWN0b3J5ID0gb3B0aW9ucy5kaXJlY3RvcnlcbiAgICByZWN1cnNpdmUgPSBvcHRpb25zLnJlY3Vyc2l2ZSBvciBmYWxzZVxuICAgIGZzLnJlYWRkaXIgZGlyZWN0b3J5LCAoZXJyLGZpbGVzKSA9PlxuICAgICAgaWYgbm90IGVycj9cbiAgICAgICAgZmlsZXMubWFwIChmaWxlKSA9PlxuICAgICAgICAgIGZxRmlsZU5hbWUgPSBwYXRoLmpvaW4oZGlyZWN0b3J5LCBmaWxlKVxuICAgICAgICAgIGZzLnN0YXQgZnFGaWxlTmFtZSwgKGVyciwgc3RhdHMpID0+XG4gICAgICAgICAgICBpZiBub3QgZXJyP1xuICAgICAgICAgICAgICBpZiBzdGF0cy5pc0ZpbGUoKVxuICAgICAgICAgICAgICAgIHJldHVybiBpZiAvXFwubWluXFwuW2Etel0rJC8udGVzdCBmcUZpbGVOYW1lICMgbm8gbWluaW1pemVkIGZpbGVzXG4gICAgICAgICAgICAgICAgaWYgL1xcLihqc3xqc3h8ZXN8ZXM2fGJhYmVsKSQvLnRlc3QgZnFGaWxlTmFtZSAjIG9ubHkganNcbiAgICAgICAgICAgICAgICAgIEB0cmFuc3BpbGUgZmlsZSwgbnVsbCwgQGdldENvbmZpZ0FuZFBhdGhUbyBmcUZpbGVOYW1lXG4gICAgICAgICAgICAgIGVsc2UgaWYgcmVjdXJzaXZlIGFuZCBzdGF0cy5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICAgICAgQHRyYW5zcGlsZURpcmVjdG9yeSB7ZGlyZWN0b3J5OiBmcUZpbGVOYW1lLCByZWN1cnNpdmU6IHRydWV9XG5cbiAgIyB0cmFuc3BpbGUgc291cmNlRmlsZSBlZGl0ZWQgYnkgdGhlIG9wdGlvbmFsIHRleHRFZGl0b3JcbiAgdHJhbnNwaWxlOiAoc291cmNlRmlsZSwgdGV4dEVkaXRvciwgY29uZmlnQW5kUGF0aFRvKSAtPlxuICAgICMgZ2V0IGNvbmZpZ1xuICAgIGlmIGNvbmZpZ0FuZFBhdGhUbz9cbiAgICAgIHsgY29uZmlnLCBwYXRoVG8gfSA9IGNvbmZpZ0FuZFBhdGhUb1xuICAgIGVsc2VcbiAgICAgIHtjb25maWcsIHBhdGhUbyB9ID0gQGdldENvbmZpZ0FuZFBhdGhUbyhzb3VyY2VGaWxlKVxuXG4gICAgcmV0dXJuIGlmIGNvbmZpZy50cmFuc3BpbGVPblNhdmUgaXNudCB0cnVlXG5cbiAgICBpZiBjb25maWcuZGlzYWJsZVdoZW5Ob0JhYmVscmNGaWxlSW5QYXRoXG4gICAgICBpZiBub3QgQGlzQmFiZWxyY0luUGF0aCBwYXRoVG8uc291cmNlRmlsZURpclxuICAgICAgICByZXR1cm5cblxuICAgIGlmIG5vdCBwYXRoSXNJbnNpZGUocGF0aFRvLnNvdXJjZUZpbGUsIHBhdGhUby5zb3VyY2VSb290KVxuICAgICAgaWYgbm90IGNvbmZpZy5zdXBwcmVzc1NvdXJjZVBhdGhNZXNzYWdlc1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyAnTEI6IEJhYmVsIGZpbGUgaXMgbm90IGluc2lkZSB0aGUgXCJCYWJlbCBTb3VyY2UgUGF0aFwiIGRpcmVjdG9yeS4nLFxuICAgICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZVxuICAgICAgICAgIGRldGFpbDogXCJObyB0cmFuc3BpbGVkIGNvZGUgb3V0cHV0IGZvciBmaWxlIFxcbiN7cGF0aFRvLnNvdXJjZUZpbGV9XG4gICAgICAgICAgICBcXG5cXG5UbyBzdXBwcmVzcyB0aGVzZSAnaW52YWxpZCBzb3VyY2UgcGF0aCdcbiAgICAgICAgICAgIG1lc3NhZ2VzIHVzZSBsYW5ndWFnZS1iYWJlbCBwYWNrYWdlIHNldHRpbmdzXCJcbiAgICAgIHJldHVyblxuXG4gICAgYmFiZWxPcHRpb25zID0gQGdldEJhYmVsT3B0aW9ucyBjb25maWdcblxuICAgIEBjbGVhbk5vdGlmaWNhdGlvbnMocGF0aFRvKVxuXG4gICAgIyBjcmVhdGUgYmFiZWwgdHJhbnNmb3JtZXIgdGFza3MgLSBvbmUgcGVyIHByb2plY3QgYXMgbmVlZGVkXG4gICAgQGNyZWF0ZVRhc2sgcGF0aFRvLnByb2plY3RQYXRoXG5cbiAgICAjIG9rIG5vdyB0cmFuc3BpbGUgaW4gdGhlIHRhc2sgYW5kIHdhaXQgb24gdGhlIHJlc3VsdFxuICAgIGlmIEBiYWJlbFRyYW5zcGlsZXJUYXNrc1twYXRoVG8ucHJvamVjdFBhdGhdXG4gICAgICByZXFJZCA9IEByZXFJZCsrXG4gICAgICBtc2dPYmplY3QgPVxuICAgICAgICByZXFJZDogcmVxSWRcbiAgICAgICAgY29tbWFuZDogJ3RyYW5zcGlsZSdcbiAgICAgICAgcGF0aFRvOiBwYXRoVG9cbiAgICAgICAgYmFiZWxPcHRpb25zOiBiYWJlbE9wdGlvbnNcblxuICAgICAgIyB0cmFuc3BpbGUgaW4gdGFza1xuICAgICAgdHJ5XG4gICAgICAgIEBiYWJlbFRyYW5zcGlsZXJUYXNrc1twYXRoVG8ucHJvamVjdFBhdGhdLnNlbmQobXNnT2JqZWN0KVxuICAgICAgY2F0Y2ggZXJyXG4gICAgICAgIGNvbnNvbGUubG9nIFwiRXJyb3IgI3tlcnJ9IHNlbmRpbmcgdG8gdHJhbnNwaWxlIHRhc2sgd2l0aCBQSUQgI3tAYmFiZWxUcmFuc3BpbGVyVGFza3NbcGF0aFRvLnByb2plY3RQYXRoXS5jaGlsZFByb2Nlc3MucGlkfVwiXG4gICAgICAgIGRlbGV0ZSBAYmFiZWxUcmFuc3BpbGVyVGFza3NbcGF0aFRvLnByb2plY3RQYXRoXVxuICAgICAgICBAY3JlYXRlVGFzayBwYXRoVG8ucHJvamVjdFBhdGhcbiAgICAgICAgY29uc29sZS5sb2cgXCJSZXN0YXJ0ZWQgdHJhbnNwaWxlIHRhc2sgd2l0aCBQSUQgI3tAYmFiZWxUcmFuc3BpbGVyVGFza3NbcGF0aFRvLnByb2plY3RQYXRoXS5jaGlsZFByb2Nlc3MucGlkfVwiXG4gICAgICAgIEBiYWJlbFRyYW5zcGlsZXJUYXNrc1twYXRoVG8ucHJvamVjdFBhdGhdLnNlbmQobXNnT2JqZWN0KVxuXG4gICAgICAjIGdldCByZXN1bHQgZnJvbSB0YXNrIGZvciB0aGlzIHJlcUlkXG4gICAgICBAYmFiZWxUcmFuc3BpbGVyVGFza3NbcGF0aFRvLnByb2plY3RQYXRoXS5vbmNlIFwidHJhbnNwaWxlOiN7cmVxSWR9XCIsIChtc2dSZXQpID0+XG4gICAgICAgICMgLmlnbm9yZWQgaXMgcmV0dXJuZWQgd2hlbiAuYmFiZWxyYyBpZ25vcmUvb25seSBmbGFncyBhcmUgdXNlZFxuICAgICAgICBpZiBtc2dSZXQucmVzdWx0Py5pZ25vcmVkIHRoZW4gcmV0dXJuXG4gICAgICAgIGlmIG1zZ1JldC5lcnJcbiAgICAgICAgICBpZiBtc2dSZXQuZXJyLnN0YWNrXG4gICAgICAgICAgICBAdHJhbnNwaWxlRXJyb3JOb3RpZmljYXRpb25zW3BhdGhUby5zb3VyY2VGaWxlXSA9XG4gICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcIkxCOiBCYWJlbCBUcmFuc3BpbGVyIEVycm9yXCIsXG4gICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICAgICAgICBkZXRhaWw6IFwiI3ttc2dSZXQuZXJyLm1lc3NhZ2V9XFxuIFxcbiN7bXNnUmV0LmJhYmVsQ29yZVVzZWR9XFxuIFxcbiN7bXNnUmV0LmVyci5zdGFja31cIlxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0cmFuc3BpbGVFcnJvck5vdGlmaWNhdGlvbnNbcGF0aFRvLnNvdXJjZUZpbGVdID1cbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwiTEI6IEJhYmVsIHYje21zZ1JldC5iYWJlbFZlcnNpb259IFRyYW5zcGlsZXIgRXJyb3JcIixcbiAgICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIGRldGFpbDogXCIje21zZ1JldC5lcnIubWVzc2FnZX1cXG4gXFxuI3ttc2dSZXQuYmFiZWxDb3JlVXNlZH1cXG4gXFxuI3ttc2dSZXQuZXJyLmNvZGVGcmFtZX1cIlxuICAgICAgICAgICAgIyBpZiB3ZSBoYXZlIGEgbGluZS9jb2wgc3ludGF4IGVycm9yIGp1bXAgdG8gdGhlIHBvc2l0aW9uXG4gICAgICAgICAgICBpZiBtc2dSZXQuZXJyLmxvYz8ubGluZT8gYW5kIHRleHRFZGl0b3I/LmFsaXZlXG4gICAgICAgICAgICAgIHRleHRFZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24gW21zZ1JldC5lcnIubG9jLmxpbmUtMSwgbXNnUmV0LmVyci5sb2MuY29sdW1uXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgaWYgbm90IGNvbmZpZy5zdXBwcmVzc1RyYW5zcGlsZU9uU2F2ZU1lc3NhZ2VzXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyBcIkxCOiBCYWJlbCB2I3ttc2dSZXQuYmFiZWxWZXJzaW9ufSBUcmFuc3BpbGVyIFN1Y2Nlc3NcIixcbiAgICAgICAgICAgICAgZGV0YWlsOiBcIiN7cGF0aFRvLnNvdXJjZUZpbGV9XFxuIFxcbiN7bXNnUmV0LmJhYmVsQ29yZVVzZWR9XCJcblxuICAgICAgICAgIGlmIG5vdCBjb25maWcuY3JlYXRlVHJhbnNwaWxlZENvZGVcbiAgICAgICAgICAgIGlmIG5vdCBjb25maWcuc3VwcHJlc3NUcmFuc3BpbGVPblNhdmVNZXNzYWdlc1xuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyAnTEI6IE5vIHRyYW5zcGlsZWQgb3V0cHV0IGNvbmZpZ3VyZWQnXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICBpZiBwYXRoVG8uc291cmNlRmlsZSBpcyBwYXRoVG8udHJhbnNwaWxlZEZpbGVcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nICdMQjogVHJhbnNwaWxlZCBmaWxlIHdvdWxkIG92ZXJ3cml0ZSBzb3VyY2UgZmlsZS4gQWJvcnRlZCEnLFxuICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICBkZXRhaWw6IHBhdGhUby5zb3VyY2VGaWxlXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAgICMgd3JpdGUgY29kZSBhbmQgbWFwc1xuICAgICAgICAgIGlmIGNvbmZpZy5jcmVhdGVUYXJnZXREaXJlY3Rvcmllc1xuICAgICAgICAgICAgZnMubWFrZVRyZWVTeW5jKCBwYXRoLnBhcnNlKCBwYXRoVG8udHJhbnNwaWxlZEZpbGUpLmRpcilcblxuICAgICAgICAgICMgYWRkIHNvdXJjZSBtYXAgdXJsIHRvIGNvZGUgaWYgZmlsZSBpc24ndCBpZ25vcmVkXG4gICAgICAgICAgaWYgY29uZmlnLmJhYmVsTWFwc0FkZFVybFxuICAgICAgICAgICAgbXNnUmV0LnJlc3VsdC5jb2RlID0gbXNnUmV0LnJlc3VsdC5jb2RlICsgJ1xcbicgKyAnLy8jIHNvdXJjZU1hcHBpbmdVUkw9JytwYXRoVG8ubWFwRmlsZVxuXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBwYXRoVG8udHJhbnNwaWxlZEZpbGUsIG1zZ1JldC5yZXN1bHQuY29kZVxuXG4gICAgICAgICAgIyB3cml0ZSBzb3VyY2UgbWFwIGlmIHJldHVybmVkIGFuZCBpZiBhc2tlZFxuICAgICAgICAgIGlmIGNvbmZpZy5jcmVhdGVNYXAgYW5kIG1zZ1JldC5yZXN1bHQubWFwPy52ZXJzaW9uXG4gICAgICAgICAgICBpZiBjb25maWcuY3JlYXRlVGFyZ2V0RGlyZWN0b3JpZXNcbiAgICAgICAgICAgICAgZnMubWFrZVRyZWVTeW5jKHBhdGgucGFyc2UocGF0aFRvLm1hcEZpbGUpLmRpcilcbiAgICAgICAgICAgIG1hcEpzb24gPVxuICAgICAgICAgICAgICB2ZXJzaW9uOiBtc2dSZXQucmVzdWx0Lm1hcC52ZXJzaW9uXG4gICAgICAgICAgICAgIHNvdXJjZXM6ICBwYXRoVG8uc291cmNlRmlsZVxuICAgICAgICAgICAgICBmaWxlOiBwYXRoVG8udHJhbnNwaWxlZEZpbGVcbiAgICAgICAgICAgICAgc291cmNlUm9vdDogJydcbiAgICAgICAgICAgICAgbmFtZXM6IG1zZ1JldC5yZXN1bHQubWFwLm5hbWVzXG4gICAgICAgICAgICAgIG1hcHBpbmdzOiBtc2dSZXQucmVzdWx0Lm1hcC5tYXBwaW5nc1xuICAgICAgICAgICAgeHNzaVByb3RlY3Rpb24gPSAnKV19XFxuJ1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBwYXRoVG8ubWFwRmlsZSxcbiAgICAgICAgICAgICAgeHNzaVByb3RlY3Rpb24gKyBKU09OLnN0cmluZ2lmeSBtYXBKc29uLCBudWxsLCAnICdcblxuICAjIGNsZWFuIG5vdGlmaWNhdGlvbiBtZXNzYWdlc1xuICBjbGVhbk5vdGlmaWNhdGlvbnM6IChwYXRoVG8pIC0+XG4gICAgIyBhdXRvIGRpc21pc3MgcHJldmlvdXMgdHJhbnNwaWxlIGVycm9yIG5vdGlmaWNhdGlvbnMgZm9yIHRoaXMgc291cmNlIGZpbGVcbiAgICBpZiBAdHJhbnNwaWxlRXJyb3JOb3RpZmljYXRpb25zW3BhdGhUby5zb3VyY2VGaWxlXT9cbiAgICAgIEB0cmFuc3BpbGVFcnJvck5vdGlmaWNhdGlvbnNbcGF0aFRvLnNvdXJjZUZpbGVdLmRpc21pc3MoKVxuICAgICAgZGVsZXRlIEB0cmFuc3BpbGVFcnJvck5vdGlmaWNhdGlvbnNbcGF0aFRvLnNvdXJjZUZpbGVdXG4gICAgIyByZW1vdmUgYW55IHVzZXIgZGlzbWlzc2VkIG5vdGlmaWNhdGlvbiBvYmplY3QgcmVmZXJlbmNlc1xuICAgIGZvciBzZiwgbiBvZiBAdHJhbnNwaWxlRXJyb3JOb3RpZmljYXRpb25zXG4gICAgICBpZiBuLmRpc21pc3NlZFxuICAgICAgICBkZWxldGUgQHRyYW5zcGlsZUVycm9yTm90aWZpY2F0aW9uc1tzZl1cbiAgICAjIEZJWCBmb3IgYXRvbSBub3RpZmljYXRpb25zLiBkaXNtaXNzZWQgbm9mdGlmaWNhdGlvbnMgdmlhIHdoYXRldmVyIG1lYW5zXG4gICAgIyBhcmUgbmV2ZXIgYWN0dWFsbHkgcmVtb3ZlZCBmcm9tIG1lbW9yeS4gSSBjb25zaWRlciB0aGlzIGEgbWVtb3J5IGxlYWtcbiAgICAjIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2lzc3Vlcy84NjE0IHNvIHJlbW92ZSBhbnkgZGlzbWlzc2VkXG4gICAgIyBub3RpZmljYXRpb24gb2JqZWN0cyBwcmVmaXhlZCB3aXRoIGEgbWVzc2FnZSBwcmVmaXggb2YgTEI6IGZyb20gbWVtb3J5XG4gICAgaSA9IGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zLmxlbmd0aCAtIDFcbiAgICB3aGlsZSBpID49IDBcbiAgICAgIGlmIGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zW2ldLmRpc21pc3NlZCBhbmRcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zW2ldLm1lc3NhZ2Uuc3Vic3RyaW5nKDAsMykgaXMgXCJMQjpcIlxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9ucy5zcGxpY2UgaSwgMVxuICAgICAgaS0tXG5cbiAgIyBjcmVhdGUgYmFiZWwgdHJhbnNmb3JtZXIgdGFza3MgLSBvbmUgcGVyIHByb2plY3QgYXMgbmVlZGVkXG4gIGNyZWF0ZVRhc2s6IChwcm9qZWN0UGF0aCkgLT5cbiAgICBAYmFiZWxUcmFuc3BpbGVyVGFza3NbcHJvamVjdFBhdGhdID89XG4gICAgICBUYXNrLm9uY2UgQGJhYmVsVHJhbnNmb3JtZXJQYXRoLCBwcm9qZWN0UGF0aCwgPT5cbiAgICAgICAgIyB0YXNrIGVuZGVkXG4gICAgICAgIGRlbGV0ZSBAYmFiZWxUcmFuc3BpbGVyVGFza3NbcHJvamVjdFBhdGhdXG5cbiAgIyBtb2RpZmllcyBjb25maWcgb3B0aW9ucyBmb3IgY2hhbmdlZCBvciBkZXByZWNhdGVkIGNvbmZpZ3NcbiAgZGVwcmVjYXRlQ29uZmlnOiAtPlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnbGFuZ3VhZ2UtYmFiZWwuc3VwcmVzc1RyYW5zcGlsZU9uU2F2ZU1lc3NhZ2VzJyk/XG4gICAgICBhdG9tLmNvbmZpZy5zZXQgJ2xhbmd1YWdlLWJhYmVsLnN1cHByZXNzVHJhbnNwaWxlT25TYXZlTWVzc2FnZXMnLFxuICAgICAgICBhdG9tLmNvbmZpZy5nZXQoJ2xhbmd1YWdlLWJhYmVsLnN1cHJlc3NUcmFuc3BpbGVPblNhdmVNZXNzYWdlcycpXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdsYW5ndWFnZS1iYWJlbC5zdXByZXNzU291cmNlUGF0aE1lc3NhZ2VzJyk/XG4gICAgICBhdG9tLmNvbmZpZy5zZXQgJ2xhbmd1YWdlLWJhYmVsLnN1cHByZXNzU291cmNlUGF0aE1lc3NhZ2VzJyxcbiAgICAgICAgYXRvbS5jb25maWcuZ2V0KCdsYW5ndWFnZS1iYWJlbC5zdXByZXNzU291cmNlUGF0aE1lc3NhZ2VzJylcbiAgICBhdG9tLmNvbmZpZy51bnNldCgnbGFuZ3VhZ2UtYmFiZWwuc3VwcmVzc1RyYW5zcGlsZU9uU2F2ZU1lc3NhZ2VzJylcbiAgICBhdG9tLmNvbmZpZy51bnNldCgnbGFuZ3VhZ2UtYmFiZWwuc3VwcmVzc1NvdXJjZVBhdGhNZXNzYWdlcycpXG4gICAgYXRvbS5jb25maWcudW5zZXQoJ2xhbmd1YWdlLWJhYmVsLnVzZUludGVybmFsU2Nhbm5lcicpXG4gICAgYXRvbS5jb25maWcudW5zZXQoJ2xhbmd1YWdlLWJhYmVsLnN0b3BBdFByb2plY3REaXJlY3RvcnknKVxuICAgICMgcmVtb3ZlIGJhYmVsIFY1IG9wdGlvbnNcbiAgICBhdG9tLmNvbmZpZy51bnNldCgnbGFuZ3VhZ2UtYmFiZWwuYmFiZWxTdGFnZScpXG4gICAgYXRvbS5jb25maWcudW5zZXQoJ2xhbmd1YWdlLWJhYmVsLmV4dGVybmFsSGVscGVycycpXG4gICAgYXRvbS5jb25maWcudW5zZXQoJ2xhbmd1YWdlLWJhYmVsLm1vZHVsZUxvYWRlcicpXG4gICAgYXRvbS5jb25maWcudW5zZXQoJ2xhbmd1YWdlLWJhYmVsLmJsYWNrbGlzdFRyYW5zZm9ybWVycycpXG4gICAgYXRvbS5jb25maWcudW5zZXQoJ2xhbmd1YWdlLWJhYmVsLndoaXRlbGlzdFRyYW5zZm9ybWVycycpXG4gICAgYXRvbS5jb25maWcudW5zZXQoJ2xhbmd1YWdlLWJhYmVsLmxvb3NlVHJhbnNmb3JtZXJzJylcbiAgICBhdG9tLmNvbmZpZy51bnNldCgnbGFuZ3VhZ2UtYmFiZWwub3B0aW9uYWxUcmFuc2Zvcm1lcnMnKVxuICAgIGF0b20uY29uZmlnLnVuc2V0KCdsYW5ndWFnZS1iYWJlbC5wbHVnaW5zJylcbiAgICBhdG9tLmNvbmZpZy51bnNldCgnbGFuZ3VhZ2UtYmFiZWwucHJlc2V0cycpXG4gICAgIyByZW1vdmUgb2xkIG5hbWUgaW5kZW50IG9wdGlvbnNcbiAgICBhdG9tLmNvbmZpZy51bnNldCgnbGFuZ3VhZ2UtYmFiZWwuZm9ybWF0SlNYJylcblxuICAjIGNhbGN1bGF0ZSBiYWJlbCBvcHRpb25zIGJhc2VkIHVwb24gcGFja2FnZSBjb25maWcsIGJhYmVscmMgZmlsZXMgYW5kXG4gICMgd2hldGhlciBpbnRlcm5hbFNjYW5uZXIgaXMgdXNlZC5cbiAgZ2V0QmFiZWxPcHRpb25zOiAoY29uZmlnKS0+XG4gICAgIyBzZXQgdHJhbnNwaWxlciBvcHRpb25zIGZyb20gcGFja2FnZSBjb25maWd1cmF0aW9uLlxuICAgIGJhYmVsT3B0aW9ucyA9XG4gICAgICBjb2RlOiB0cnVlXG4gICAgaWYgY29uZmlnLmNyZWF0ZU1hcCAgdGhlbiBiYWJlbE9wdGlvbnMuc291cmNlTWFwcyA9IGNvbmZpZy5jcmVhdGVNYXBcbiAgICBiYWJlbE9wdGlvbnNcblxuICAjZ2V0IGNvbmZpZ3VyYXRpb24gYW5kIHBhdGhzXG4gIGdldENvbmZpZ0FuZFBhdGhUbzogKHNvdXJjZUZpbGUpIC0+XG4gICAgY29uZmlnID0gQGdldENvbmZpZygpXG4gICAgcGF0aFRvID0gQGdldFBhdGhzIHNvdXJjZUZpbGUsIGNvbmZpZ1xuXG4gICAgaWYgY29uZmlnLmFsbG93TG9jYWxPdmVycmlkZVxuICAgICAgaWYgbm90IEBqc29uU2NoZW1hP1xuICAgICAgICBAanNvblNjaGVtYSA9IChyZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvamp2JykoKSAjIHVzZSBqanYgYXMgaXQgcnVucyB3aXRob3V0IENTUCBpc3N1ZXNcbiAgICAgICAgQGpzb25TY2hlbWEuYWRkU2NoZW1hICdsb2NhbENvbmZpZycsIGxhbmd1YWdlYmFiZWxTY2hlbWFcbiAgICAgIGxvY2FsQ29uZmlnID0gQGdldExvY2FsQ29uZmlnIHBhdGhUby5zb3VyY2VGaWxlRGlyLCBwYXRoVG8ucHJvamVjdFBhdGgsIHt9XG4gICAgICAjIG1lcmdlIGxvY2FsIGNvbmZpZ3Mgd2l0aCBnbG9iYWwuIGxvY2FsIHdpbnNcbiAgICAgIEBtZXJnZSBjb25maWcsIGxvY2FsQ29uZmlnXG4gICAgICAjIHJlY2FsYyBwYXRoc1xuICAgICAgcGF0aFRvID0gQGdldFBhdGhzIHNvdXJjZUZpbGUsIGNvbmZpZ1xuICAgIHJldHVybiB7IGNvbmZpZywgcGF0aFRvIH1cblxuICAjIGdldCBnbG9iYWwgY29uZmlndXJhdGlvbiBmb3IgbGFuZ3VhZ2UtYmFiZWxcbiAgZ2V0Q29uZmlnOiAtPiBhdG9tLmNvbmZpZy5nZXQoJ2xhbmd1YWdlLWJhYmVsJylcblxuIyBjaGVjayBmb3IgcHJlc2NlbmNlIG9mIGEgLmxhbmd1YWdlYmFiZWwgZmlsZSBwYXRoIGZyb21EaXIgdG9EaXJcbiMgcmVhZCwgdmFsaWRhdGUgYW5kIG92ZXJ3cml0ZSBjb25maWcgYXMgcmVxdWlyZWRcbiMgdG9EaXIgaXMgbm9ybWFsbHkgdGhlIGltcGxpY2l0IEF0b20gcHJvamVjdCBmb2xkZXJzIHJvb3QgYnV0IHdlXG4jIHdpbGwgc3RvcCBvZiBhIHByb2plY3RSb290IHRydWUgaXMgZm91bmQgYXMgd2VsbFxuICBnZXRMb2NhbENvbmZpZzogKGZyb21EaXIsIHRvRGlyLCBsb2NhbENvbmZpZykgLT5cbiAgICAjIGdldCBsb2NhbCBwYXRoIG92ZXJpZGVzXG4gICAgbG9jYWxDb25maWdGaWxlID0gJy5sYW5ndWFnZWJhYmVsJ1xuICAgIGxhbmd1YWdlQmFiZWxDZmdGaWxlID0gcGF0aC5qb2luIGZyb21EaXIsIGxvY2FsQ29uZmlnRmlsZVxuICAgIGlmIGZzLmV4aXN0c1N5bmMgbGFuZ3VhZ2VCYWJlbENmZ0ZpbGVcbiAgICAgIGZpbGVDb250ZW50PSBmcy5yZWFkRmlsZVN5bmMgbGFuZ3VhZ2VCYWJlbENmZ0ZpbGUsICd1dGY4J1xuICAgICAgdHJ5XG4gICAgICAgIGpzb25Db250ZW50ID0gSlNPTi5wYXJzZSBmaWxlQ29udGVudFxuICAgICAgY2F0Y2ggZXJyXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcIkxCOiAje2xvY2FsQ29uZmlnRmlsZX0gI3tlcnIubWVzc2FnZX1cIixcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgIGRldGFpbDogXCJGaWxlID0gI3tsYW5ndWFnZUJhYmVsQ2ZnRmlsZX1cXG5cXG4je2ZpbGVDb250ZW50fVwiXG4gICAgICAgIHJldHVyblxuXG4gICAgICBzY2hlbWFFcnJvcnMgPSBAanNvblNjaGVtYS52YWxpZGF0ZSAnbG9jYWxDb25maWcnLCBqc29uQ29udGVudFxuICAgICAgaWYgc2NoZW1hRXJyb3JzXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcIkxCOiAje2xvY2FsQ29uZmlnRmlsZX0gY29uZmlndXJhdGlvbiBlcnJvclwiLFxuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgZGV0YWlsOiBcIkZpbGUgPSAje2xhbmd1YWdlQmFiZWxDZmdGaWxlfVxcblxcbiN7ZmlsZUNvbnRlbnR9XCJcbiAgICAgIGVsc2VcbiAgICAgICAgIyBtZXJnZSBsb2NhbCBjb25maWcuIGNvbmZpZyBjbG9zZXN0IHNvdXJjZUZpbGUgd2luc1xuICAgICAgICAjIGFwYXJ0IGZyb20gcHJvamVjdFJvb3Qgd2hpY2ggd2lucyBvbiB0cnVlXG4gICAgICAgIGlzUHJvamVjdFJvb3QgPSBqc29uQ29udGVudC5wcm9qZWN0Um9vdFxuICAgICAgICBAbWVyZ2UgIGpzb25Db250ZW50LCBsb2NhbENvbmZpZ1xuICAgICAgICBpZiBpc1Byb2plY3RSb290IHRoZW4ganNvbkNvbnRlbnQucHJvamVjdFJvb3REaXIgPSBmcm9tRGlyXG4gICAgICAgIGxvY2FsQ29uZmlnID0ganNvbkNvbnRlbnRcbiAgICBpZiBmcm9tRGlyIGlzbnQgdG9EaXJcbiAgICAgICMgc3RvcCBpbmZpbml0ZSByZWN1cnNpb24gaHR0cHM6Ly9naXRodWIuY29tL2dhbmRtL2xhbmd1YWdlLWJhYmVsL2lzc3Vlcy82NlxuICAgICAgaWYgZnJvbURpciA9PSBwYXRoLmRpcm5hbWUoZnJvbURpcikgdGhlbiByZXR1cm4gbG9jYWxDb25maWdcbiAgICAgICMgY2hlY2sgcHJvamVjdFJvb3QgcHJvcGVydHkgYW5kIGVuZCByZWN1cnNpb24gaWYgdHJ1ZVxuICAgICAgaWYgaXNQcm9qZWN0Um9vdCB0aGVuIHJldHVybiBsb2NhbENvbmZpZ1xuICAgICAgcmV0dXJuIEBnZXRMb2NhbENvbmZpZyBwYXRoLmRpcm5hbWUoZnJvbURpciksIHRvRGlyLCBsb2NhbENvbmZpZ1xuICAgIGVsc2UgcmV0dXJuIGxvY2FsQ29uZmlnXG5cbiAgIyBjYWxjdWxhdGUgYWJzb3VsdGUgcGF0aHMgb2YgYmFiZWwgc291cmNlLCB0YXJnZXQganMgYW5kIG1hcHMgZmlsZXNcbiAgIyBiYXNlZCB1cG9uIHRoZSBwcm9qZWN0IGRpcmVjdG9yeSBjb250YWluaW5nIHRoZSBzb3VyY2VcbiAgIyBhbmQgdGhlIHJvb3RzIG9mIHNvdXJjZSwgdHJhbnNwaWxlIHBhdGggYW5kIG1hcHMgcGF0aHMgZGVmaW5lZCBpbiBjb25maWdcbiAgZ2V0UGF0aHM6ICAoc291cmNlRmlsZSwgY29uZmlnKSAtPlxuICAgIHByb2plY3RDb250YWluaW5nU291cmNlID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoIHNvdXJjZUZpbGVcbiAgICAjIElzIHRoZSBzb3VyY2VGaWxlIGxvY2F0ZWQgaW5zaWRlIGFuIEF0b20gcHJvamVjdCBmb2xkZXI/XG4gICAgaWYgcHJvamVjdENvbnRhaW5pbmdTb3VyY2VbMF0gaXMgbnVsbFxuICAgICAgc291cmNlRmlsZUluUHJvamVjdCA9IGZhbHNlXG4gICAgZWxzZSBzb3VyY2VGaWxlSW5Qcm9qZWN0ID0gdHJ1ZVxuICAgICMgZGV0ZXJtaW5lcyB0aGUgcHJvamVjdCByb290IGRpciBmcm9tIC5sYW5ndWFnZWJhYmVsIG9yIGZyb20gQXRvbVxuICAgICMgaWYgYSBwcm9qZWN0IGlzIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiBhdG9tIHBhc3NlcyBiYWNrIGEgbnVsbCBmb3JcbiAgICAjIHRoZSBwcm9qZWN0IHBhdGggaWYgdGhlIGZpbGUgaXNuJ3QgaW4gYSBwcm9qZWN0IGZvbGRlclxuICAgICMgc28gbWFrZSB0aGUgcm9vdCBkaXIgdGhhdCBzb3VyY2UgZmlsZSB0aGUgcHJvamVjdFxuICAgIGlmIGNvbmZpZy5wcm9qZWN0Um9vdERpcj9cbiAgICAgIGFic1Byb2plY3RQYXRoID0gcGF0aC5ub3JtYWxpemUoY29uZmlnLnByb2plY3RSb290RGlyKVxuICAgIGVsc2UgaWYgcHJvamVjdENvbnRhaW5pbmdTb3VyY2VbMF0gaXMgbnVsbFxuICAgICAgYWJzUHJvamVjdFBhdGggPSBwYXRoLnBhcnNlKHNvdXJjZUZpbGUpLnJvb3RcbiAgICBlbHNlXG4gICAgICAjIEF0b20gMS44IHJldHVybmluZyBkcml2ZSBhcyBwcm9qZWN0IHJvb3Qgb24gd2luZG93cyBlLmcuIGM6IG5vdCBjOlxcXG4gICAgICAjIHVzaW5nIHBhdGguam9pbiB0byAnLicgZml4ZXMgaXQuXG4gICAgICBhYnNQcm9qZWN0UGF0aCA9IHBhdGgubm9ybWFsaXplKHBhdGguam9pbihwcm9qZWN0Q29udGFpbmluZ1NvdXJjZVswXSwnLicpKVxuICAgIHJlbFNvdXJjZVBhdGggPSBwYXRoLm5vcm1hbGl6ZShjb25maWcuYmFiZWxTb3VyY2VQYXRoKVxuICAgIHJlbFRyYW5zcGlsZVBhdGggPSBwYXRoLm5vcm1hbGl6ZShjb25maWcuYmFiZWxUcmFuc3BpbGVQYXRoKVxuICAgIHJlbE1hcHNQYXRoID0gcGF0aC5ub3JtYWxpemUoY29uZmlnLmJhYmVsTWFwc1BhdGgpXG5cbiAgICBhYnNTb3VyY2VSb290ID0gcGF0aC5qb2luKGFic1Byb2plY3RQYXRoICwgcmVsU291cmNlUGF0aClcbiAgICBhYnNUcmFuc3BpbGVSb290ID0gcGF0aC5qb2luKGFic1Byb2plY3RQYXRoICwgcmVsVHJhbnNwaWxlUGF0aClcbiAgICBhYnNNYXBzUm9vdCA9IHBhdGguam9pbihhYnNQcm9qZWN0UGF0aCAsIHJlbE1hcHNQYXRoKVxuXG4gICAgcGFyc2VkU291cmNlRmlsZSA9IHBhdGgucGFyc2Uoc291cmNlRmlsZSlcbiAgICByZWxTb3VyY2VSb290VG9Tb3VyY2VGaWxlID0gcGF0aC5yZWxhdGl2ZShhYnNTb3VyY2VSb290LCBwYXJzZWRTb3VyY2VGaWxlLmRpcilcbiAgICBhYnNUcmFuc3BpbGVkRmlsZSA9IHBhdGguam9pbihhYnNUcmFuc3BpbGVSb290LCByZWxTb3VyY2VSb290VG9Tb3VyY2VGaWxlICwgcGFyc2VkU291cmNlRmlsZS5uYW1lICArICcuanMnKVxuICAgIGFic01hcEZpbGUgPSBwYXRoLmpvaW4oYWJzTWFwc1Jvb3QsIHJlbFNvdXJjZVJvb3RUb1NvdXJjZUZpbGUgLCBwYXJzZWRTb3VyY2VGaWxlLm5hbWUgICsgJy5qcy5tYXAnKVxuXG4gICAgc291cmNlRmlsZUluUHJvamVjdDogc291cmNlRmlsZUluUHJvamVjdFxuICAgIHNvdXJjZUZpbGU6IHNvdXJjZUZpbGVcbiAgICBzb3VyY2VGaWxlRGlyOiBwYXJzZWRTb3VyY2VGaWxlLmRpclxuICAgIG1hcEZpbGU6IGFic01hcEZpbGVcbiAgICB0cmFuc3BpbGVkRmlsZTogYWJzVHJhbnNwaWxlZEZpbGVcbiAgICBzb3VyY2VSb290OiBhYnNTb3VyY2VSb290XG4gICAgcHJvamVjdFBhdGg6IGFic1Byb2plY3RQYXRoXG5cbiMgY2hlY2sgZm9yIHByZXNjZW5jZSBvZiBhIC5iYWJlbHJjIGZpbGUgcGF0aCBmcm9tRGlyIHRvIHJvb3RcbiAgaXNCYWJlbHJjSW5QYXRoOiAoZnJvbURpcikgLT5cbiAgICAjIGVudmlyb21uZW50cyB1c2VkIGluIGJhYmVscmNcbiAgICBiYWJlbHJjID0gJy5iYWJlbHJjJ1xuICAgIGJhYmVscmNGaWxlID0gcGF0aC5qb2luIGZyb21EaXIsIGJhYmVscmNcbiAgICBpZiBmcy5leGlzdHNTeW5jIGJhYmVscmNGaWxlXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGlmIGZyb21EaXIgIT0gcGF0aC5kaXJuYW1lKGZyb21EaXIpXG4gICAgICByZXR1cm4gQGlzQmFiZWxyY0luUGF0aCBwYXRoLmRpcm5hbWUoZnJvbURpcilcbiAgICBlbHNlIHJldHVybiBmYWxzZVxuXG4jIHNpbXBsZSBtZXJnZSBvZiBvYmplY3RzXG4gIG1lcmdlOiAodGFyZ2V0T2JqLCBzb3VyY2VPYmopIC0+XG4gICAgZm9yIHByb3AsIHZhbCBvZiBzb3VyY2VPYmpcbiAgICAgIHRhcmdldE9ialtwcm9wXSA9IHZhbFxuXG4jIHN0b3AgdHJhbnNwaWxlciB0YXNrXG4gIHN0b3BUcmFuc3BpbGVyVGFzazogKHByb2plY3RQYXRoKSAtPlxuICAgIG1zZ09iamVjdCA9XG4gICAgICBjb21tYW5kOiAnc3RvcCdcbiAgICBAYmFiZWxUcmFuc3BpbGVyVGFza3NbcHJvamVjdFBhdGhdLnNlbmQobXNnT2JqZWN0KVxuXG4jIHN0b3AgYWxsIHRyYW5zcGlsZXIgdGFza3NcbiAgc3RvcEFsbFRyYW5zcGlsZXJUYXNrOiAoKSAtPlxuICAgIGZvciBwcm9qZWN0UGF0aCwgdiBvZiBAYmFiZWxUcmFuc3BpbGVyVGFza3NcbiAgICAgIEBzdG9wVHJhbnNwaWxlclRhc2socHJvamVjdFBhdGgpXG5cbiMgc3RvcCB1bnN1ZWQgdHJhbnNwaWxlciB0YXNrcyBpZiBpdHMgcGF0aCBpc24ndCBwcmVzZW50IGluIGEgY3VycmVudFxuIyBBdG9tIHByb2plY3QgZm9sZGVyXG4gIHN0b3BVbnVzZWRUYXNrczogKCkgLT5cbiAgICBhdG9tUHJvamVjdFBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICBmb3IgcHJvamVjdFRhc2tQYXRoLHYgb2YgQGJhYmVsVHJhbnNwaWxlclRhc2tzXG4gICAgICBpc1Rhc2tJbkN1cnJlbnRQcm9qZWN0ID0gZmFsc2VcbiAgICAgIGZvciBhdG9tUHJvamVjdFBhdGggaW4gYXRvbVByb2plY3RQYXRoc1xuICAgICAgICBpZiBwYXRoSXNJbnNpZGUocHJvamVjdFRhc2tQYXRoLCBhdG9tUHJvamVjdFBhdGgpXG4gICAgICAgICAgaXNUYXNrSW5DdXJyZW50UHJvamVjdCA9IHRydWVcbiAgICAgICAgICBicmVha1xuICAgICAgaWYgbm90IGlzVGFza0luQ3VycmVudFByb2plY3QgdGhlbiBAc3RvcFRyYW5zcGlsZXJUYXNrKHByb2plY3RUYXNrUGF0aClcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc3BpbGVyXG4iXX0=
