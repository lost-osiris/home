(function() {
  var fs, log, os, path,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  os = require('os');

  path = require('path');

  log = require('./log');

  module.exports = {
    pythonExecutableRe: function() {
      if (/^win/.test(process.platform)) {
        return /^python(\d+(.\d+)?)?\.exe$/;
      } else {
        return /^python(\d+(.\d+)?)?$/;
      }
    },
    possibleGlobalPythonPaths: function() {
      if (/^win/.test(process.platform)) {
        return ['C:\\Python2.7', 'C:\\Python3.4', 'C:\\Python3.5', 'C:\\Program Files (x86)\\Python 2.7', 'C:\\Program Files (x86)\\Python 3.4', 'C:\\Program Files (x86)\\Python 3.5', 'C:\\Program Files (x64)\\Python 2.7', 'C:\\Program Files (x64)\\Python 3.4', 'C:\\Program Files (x64)\\Python 3.5', 'C:\\Program Files\\Python 2.7', 'C:\\Program Files\\Python 3.4', 'C:\\Program Files\\Python 3.5', "" + (os.homedir()) + "\\AppData\\Local\\Programs\\Python\\Python35-32"];
      } else {
        return ['/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin'];
      }
    },
    readDir: function(dirPath) {
      try {
        return fs.readdirSync(dirPath);
      } catch (_error) {
        return [];
      }
    },
    isBinary: function(filePath) {
      try {
        fs.accessSync(filePath, fs.X_OK);
        return true;
      } catch (_error) {
        return false;
      }
    },
    lookupInterpreters: function(dirPath) {
      var f, fileName, files, interpreters, matches, potentialInterpreter, _i, _len;
      interpreters = new Set();
      files = this.readDir(dirPath);
      matches = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          f = files[_i];
          if (this.pythonExecutableRe().test(f)) {
            _results.push(f);
          }
        }
        return _results;
      }).call(this);
      for (_i = 0, _len = matches.length; _i < _len; _i++) {
        fileName = matches[_i];
        potentialInterpreter = path.join(dirPath, fileName);
        if (this.isBinary(potentialInterpreter)) {
          interpreters.add(potentialInterpreter);
        }
      }
      return interpreters;
    },
    applySubstitutions: function(paths) {
      var modPaths, p, project, projectName, _i, _j, _len, _len1, _ref, _ref1;
      modPaths = [];
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        p = paths[_i];
        _ref = atom.project.getPaths();
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          project = _ref[_j];
          _ref1 = project.split(path.sep), projectName = _ref1[_ref1.length - 1];
          p = p.replace(/\$PROJECT_NAME/i, projectName);
          p = p.replace(/\$PROJECT/i, project);
          if (__indexOf.call(modPaths, p) < 0) {
            modPaths.push(p);
          }
        }
      }
      return modPaths;
    },
    getInterpreter: function() {
      var envPath, f, interpreters, p, project, userDefinedPythonPaths, _i, _j, _len, _len1, _ref, _ref1;
      userDefinedPythonPaths = this.applySubstitutions(atom.config.get('autocomplete-python.pythonPaths').split(';'));
      interpreters = new Set((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = userDefinedPythonPaths.length; _i < _len; _i++) {
          p = userDefinedPythonPaths[_i];
          if (this.isBinary(p)) {
            _results.push(p);
          }
        }
        return _results;
      }).call(this));
      if (interpreters.size > 0) {
        log.debug('User defined interpreters found', interpreters);
        return interpreters.keys().next().value;
      }
      log.debug('No user defined interpreter found, trying automatic lookup');
      interpreters = new Set();
      _ref = atom.project.getPaths();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        project = _ref[_i];
        _ref1 = this.readDir(project);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          f = _ref1[_j];
          this.lookupInterpreters(path.join(project, f, 'bin')).forEach(function(i) {
            return interpreters.add(i);
          });
        }
      }
      log.debug('Project level interpreters found', interpreters);
      envPath = (process.env.PATH || '').split(path.delimiter);
      envPath = new Set(envPath.concat(this.possibleGlobalPythonPaths()));
      envPath.forEach((function(_this) {
        return function(potentialPath) {
          return _this.lookupInterpreters(potentialPath).forEach(function(i) {
            return interpreters.add(i);
          });
        };
      })(this));
      log.debug('Total automatically found interpreters', interpreters);
      if (interpreters.size > 0) {
        return interpreters.keys().next().value;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL2ludGVycHJldGVycy1sb29rdXAuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlCQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVIsQ0FITixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsa0JBQUEsRUFBb0IsU0FBQSxHQUFBO0FBQ2xCLE1BQUEsSUFBRyxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQU8sQ0FBQyxRQUFwQixDQUFIO0FBQ0UsZUFBTyw0QkFBUCxDQURGO09BQUEsTUFBQTtBQUdFLGVBQU8sdUJBQVAsQ0FIRjtPQURrQjtJQUFBLENBQXBCO0FBQUEsSUFNQSx5QkFBQSxFQUEyQixTQUFBLEdBQUE7QUFDekIsTUFBQSxJQUFHLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBTyxDQUFDLFFBQXBCLENBQUg7QUFDRSxlQUFPLENBQ0wsZUFESyxFQUVMLGVBRkssRUFHTCxlQUhLLEVBSUwscUNBSkssRUFLTCxxQ0FMSyxFQU1MLHFDQU5LLEVBT0wscUNBUEssRUFRTCxxQ0FSSyxFQVNMLHFDQVRLLEVBVUwsK0JBVkssRUFXTCwrQkFYSyxFQVlMLCtCQVpLLEVBYUwsRUFBQSxHQUFFLENBQUMsRUFBRSxDQUFDLE9BQUgsQ0FBQSxDQUFELENBQUYsR0FBZ0IsaURBYlgsQ0FBUCxDQURGO09BQUEsTUFB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

//# sourceURL=/home/mowens/.atom/packages/autocomplete-python/lib/interpreters-lookup.coffee
