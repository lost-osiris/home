Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getNodePrefixPath = getNodePrefixPath;
exports.findESLintDirectory = findESLintDirectory;
exports.getESLintFromDirectory = getESLintFromDirectory;
exports.refreshModulesPath = refreshModulesPath;
exports.getESLintInstance = getESLintInstance;
exports.getConfigPath = getConfigPath;
exports.getRelativePath = getRelativePath;
exports.getCLIEngineOptions = getCLIEngineOptions;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _resolveEnv = require('resolve-env');

var _resolveEnv2 = _interopRequireDefault(_resolveEnv);

var _atomLinter = require('atom-linter');

var _consistentPath = require('consistent-path');

var _consistentPath2 = _interopRequireDefault(_consistentPath);

'use babel';

var Cache = {
  ESLINT_LOCAL_PATH: _path2['default'].normalize(_path2['default'].join(__dirname, '..', 'node_modules', 'eslint')),
  NODE_PREFIX_PATH: null,
  LAST_MODULES_PATH: null
};

function getNodePrefixPath() {
  if (Cache.NODE_PREFIX_PATH === null) {
    var npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    try {
      Cache.NODE_PREFIX_PATH = _child_process2['default'].spawnSync(npmCommand, ['get', 'prefix'], {
        env: Object.assign(Object.assign({}, process.env), { PATH: (0, _consistentPath2['default'])() })
      }).output[1].toString().trim();
    } catch (e) {
      throw new Error('Unable to execute `npm get prefix`. Please make sure Atom is getting $PATH correctly.');
    }
  }
  return Cache.NODE_PREFIX_PATH;
}

function isDirectory(dirPath) {
  var isDir = undefined;
  try {
    isDir = _fs2['default'].statSync(dirPath).isDirectory();
  } catch (e) {
    isDir = false;
  }
  return isDir;
}

function findESLintDirectory(modulesDir, config, projectPath) {
  var eslintDir = null;
  var locationType = null;
  if (config.useGlobalEslint) {
    locationType = 'global';
    var prefixPath = config.globalNodePath || getNodePrefixPath();
    // NPM on Windows and Yarn on all platforms
    eslintDir = _path2['default'].join(prefixPath, 'node_modules', 'eslint');
    if (!isDirectory(eslintDir)) {
      // NPM on platforms other than Windows
      eslintDir = _path2['default'].join(prefixPath, 'lib', 'node_modules', 'eslint');
    }
  } else if (!config.advancedLocalNodeModules) {
    locationType = 'local project';
    eslintDir = _path2['default'].join(modulesDir || '', 'eslint');
  } else if (_path2['default'].isAbsolute(config.advancedLocalNodeModules)) {
    locationType = 'advanced specified';
    eslintDir = _path2['default'].join(config.advancedLocalNodeModules || '', 'eslint');
  } else {
    locationType = 'advanced specified';
    eslintDir = _path2['default'].join(projectPath, config.advancedLocalNodeModules, 'eslint');
  }
  if (isDirectory(eslintDir)) {
    return {
      path: eslintDir,
      type: locationType
    };
  } else if (config.useGlobalEslint) {
    throw new Error('ESLint not found, please ensure the global Node path is set correctly.');
  }
  return {
    path: Cache.ESLINT_LOCAL_PATH,
    type: 'bundled fallback'
  };
}

function getESLintFromDirectory(modulesDir, config, projectPath) {
  var _findESLintDirectory = findESLintDirectory(modulesDir, config, projectPath);

  var ESLintDirectory = _findESLintDirectory.path;

  try {
    // eslint-disable-next-line import/no-dynamic-require
    return require(ESLintDirectory);
  } catch (e) {
    if (config.useGlobalEslint && e.code === 'MODULE_NOT_FOUND') {
      throw new Error('ESLint not found, try restarting Atom to clear caches.');
    }
    // eslint-disable-next-line import/no-dynamic-require
    return require(Cache.ESLINT_LOCAL_PATH);
  }
}

function refreshModulesPath(modulesDir) {
  if (Cache.LAST_MODULES_PATH !== modulesDir) {
    Cache.LAST_MODULES_PATH = modulesDir;
    process.env.NODE_PATH = modulesDir || '';
    require('module').Module._initPaths();
  }
}

function getESLintInstance(fileDir, config, projectPath) {
  var modulesDir = _path2['default'].dirname((0, _atomLinter.findCached)(fileDir, 'node_modules/eslint') || '');
  refreshModulesPath(modulesDir);
  return getESLintFromDirectory(modulesDir, config, projectPath || '');
}

function getConfigPath(_x) {
  var _again = true;

  _function: while (_again) {
    var fileDir = _x;
    _again = false;

    var configFile = (0, _atomLinter.findCached)(fileDir, ['.eslintrc.js', '.eslintrc.yaml', '.eslintrc.yml', '.eslintrc.json', '.eslintrc', 'package.json']);
    if (configFile) {
      if (_path2['default'].basename(configFile) === 'package.json') {
        // eslint-disable-next-line import/no-dynamic-require
        if (require(configFile).eslintConfig) {
          return configFile;
        }
        // If we are here, we found a package.json without an eslint config
        // in a dir without any other eslint config files
        // (because 'package.json' is last in the call to findCached)
        // So, keep looking from the parent directory
        _x = _path2['default'].resolve(_path2['default'].dirname(configFile), '..');
        _again = true;
        configFile = undefined;
        continue _function;
      }
      return configFile;
    }
    return null;
  }
}

function getRelativePath(fileDir, filePath, config) {
  var ignoreFile = config.disableEslintIgnore ? null : (0, _atomLinter.findCached)(fileDir, '.eslintignore');

  if (ignoreFile) {
    var ignoreDir = _path2['default'].dirname(ignoreFile);
    process.chdir(ignoreDir);
    return _path2['default'].relative(ignoreDir, filePath);
  }
  process.chdir(fileDir);
  return _path2['default'].basename(filePath);
}

function getCLIEngineOptions(type, config, rules, filePath, fileDir, givenConfigPath) {
  var cliEngineConfig = {
    rules: rules,
    ignore: !config.disableEslintIgnore,
    warnIgnored: false,
    fix: type === 'fix'
  };

  var ignoreFile = config.disableEslintIgnore ? null : (0, _atomLinter.findCached)(fileDir, '.eslintignore');
  if (ignoreFile) {
    cliEngineConfig.ignorePath = ignoreFile;
  }

  if (config.eslintRulesDir) {
    var rulesDir = (0, _resolveEnv2['default'])(config.eslintRulesDir);
    if (!_path2['default'].isAbsolute(rulesDir)) {
      rulesDir = (0, _atomLinter.findCached)(fileDir, rulesDir);
    }
    if (rulesDir) {
      cliEngineConfig.rulePaths = [rulesDir];
    }
  }

  if (givenConfigPath === null && config.eslintrcPath) {
    // If we didn't find a configuration use the fallback from the settings
    cliEngineConfig.configFile = (0, _resolveEnv2['default'])(config.eslintrcPath);
  }

  return cliEngineConfig;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NyYy93b3JrZXItaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztvQkFFaUIsTUFBTTs7OztrQkFDUixJQUFJOzs7OzZCQUNNLGVBQWU7Ozs7MEJBQ2pCLGFBQWE7Ozs7MEJBQ1QsYUFBYTs7OEJBQ3BCLGlCQUFpQjs7OztBQVByQyxXQUFXLENBQUE7O0FBU1gsSUFBTSxLQUFLLEdBQUc7QUFDWixtQkFBaUIsRUFBRSxrQkFBSyxTQUFTLENBQUMsa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZGLGtCQUFnQixFQUFFLElBQUk7QUFDdEIsbUJBQWlCLEVBQUUsSUFBSTtDQUN4QixDQUFBOztBQUVNLFNBQVMsaUJBQWlCLEdBQUc7QUFDbEMsTUFBSSxLQUFLLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxFQUFFO0FBQ25DLFFBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEtBQUssT0FBTyxHQUFHLFNBQVMsR0FBRyxLQUFLLENBQUE7QUFDbkUsUUFBSTtBQUNGLFdBQUssQ0FBQyxnQkFBZ0IsR0FDcEIsMkJBQWEsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRTtBQUNwRCxXQUFHLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsa0NBQVMsRUFBRSxDQUFDO09BQ3hFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUE7S0FDakMsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLFlBQU0sSUFBSSxLQUFLLENBQ2IsdUZBQXVGLENBQ3hGLENBQUE7S0FD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QUFBO0tBQ3pDO0FBQ0QsUUFBSSxRQUFRLEVBQUU7QUFDWixxQkFBZSxDQUFDLFNBQVMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQ3ZDO0dBQ0Y7O0FBRUQsTUFBSSxlQUFlLEtBQUssSUFBSSxJQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUU7O0FBRW5ELG1CQUFlLENBQUMsVUFBVSxHQUFHLDZCQUFXLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQTtHQUM3RDs7QUFFRCxTQUFPLGVBQWUsQ0FBQTtDQUN2QiIsImZpbGUiOiIvaG9tZS9tb3dlbnMvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvd29ya2VyLWhlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IENoaWxkUHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0IHJlc29sdmVFbnYgZnJvbSAncmVzb2x2ZS1lbnYnXG5pbXBvcnQgeyBmaW5kQ2FjaGVkIH0gZnJvbSAnYXRvbS1saW50ZXInXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICdjb25zaXN0ZW50LXBhdGgnXG5cbmNvbnN0IENhY2hlID0ge1xuICBFU0xJTlRfTE9DQUxfUEFUSDogUGF0aC5ub3JtYWxpemUoUGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJ25vZGVfbW9kdWxlcycsICdlc2xpbnQnKSksXG4gIE5PREVfUFJFRklYX1BBVEg6IG51bGwsXG4gIExBU1RfTU9EVUxFU19QQVRIOiBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb2RlUHJlZml4UGF0aCgpIHtcbiAgaWYgKENhY2hlLk5PREVfUFJFRklYX1BBVEggPT09IG51bGwpIHtcbiAgICBjb25zdCBucG1Db21tYW5kID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyA/ICducG0uY21kJyA6ICducG0nXG4gICAgdHJ5IHtcbiAgICAgIENhY2hlLk5PREVfUFJFRklYX1BBVEggPVxuICAgICAgICBDaGlsZFByb2Nlc3Muc3Bhd25TeW5jKG5wbUNvbW1hbmQsIFsnZ2V0JywgJ3ByZWZpeCddLCB7XG4gICAgICAgICAgZW52OiBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHByb2Nlc3MuZW52KSwgeyBQQVRIOiBnZXRQYXRoKCkgfSlcbiAgICAgICAgfSkub3V0cHV0WzFdLnRvU3RyaW5nKCkudHJpbSgpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnVW5hYmxlIHRvIGV4ZWN1dGUgYG5wbSBnZXQgcHJlZml4YC4gUGxlYXNlIG1ha2Ugc3VyZSBBdG9tIGlzIGdldHRpbmcgJFBBVEggY29ycmVjdGx5LidcbiAgICAgIClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIENhY2hlLk5PREVfUFJFRklYX1BBVEhcbn1cblxuZnVuY3Rpb24gaXNEaXJlY3RvcnkoZGlyUGF0aCkge1xuICBsZXQgaXNEaXJcbiAgdHJ5IHtcbiAgICBpc0RpciA9IGZzLnN0YXRTeW5jKGRpclBhdGgpLmlzRGlyZWN0b3J5KClcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlzRGlyID0gZmFsc2VcbiAgfVxuICByZXR1cm4gaXNEaXJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRFU0xpbnREaXJlY3RvcnkobW9kdWxlc0RpciwgY29uZmlnLCBwcm9qZWN0UGF0aCkge1xuICBsZXQgZXNsaW50RGlyID0gbnVsbFxuICBsZXQgbG9jYXRpb25UeXBlID0gbnVsbFxuICBpZiAoY29uZmlnLnVzZUdsb2JhbEVzbGludCkge1xuICAgIGxvY2F0aW9uVHlwZSA9ICdnbG9iYWwnXG4gICAgY29uc3QgcHJlZml4UGF0aCA9IGNvbmZpZy5nbG9iYWxOb2RlUGF0aCB8fCBnZXROb2RlUHJlZml4UGF0aCgpXG4gICAgLy8gTlBNIG9uIFdpbmRvd3MgYW5kIFlhcm4gb24gYWxsIHBsYXRmb3Jtc1xuICAgIGVzbGludERpciA9IFBhdGguam9pbihwcmVmaXhQYXRoLCAnbm9kZV9tb2R1bGVzJywgJ2VzbGludCcpXG4gICAgaWYgKCFpc0RpcmVjdG9yeShlc2xpbnREaXIpKSB7XG4gICAgICAvLyBOUE0gb24gcGxhdGZvcm1zIG90aGVyIHRoYW4gV2luZG93c1xuICAgICAgZXNsaW50RGlyID0gUGF0aC5qb2luKHByZWZpeFBhdGgsICdsaWInLCAnbm9kZV9tb2R1bGVzJywgJ2VzbGludCcpXG4gICAgfVxuICB9IGVsc2UgaWYgKCFjb25maWcuYWR2YW5jZWRMb2NhbE5vZGVNb2R1bGVzKSB7XG4gICAgbG9jYXRpb25UeXBlID0gJ2xvY2FsIHByb2plY3QnXG4gICAgZXNsaW50RGlyID0gUGF0aC5qb2luKG1vZHVsZXNEaXIgfHwgJycsICdlc2xpbnQnKVxuICB9IGVsc2UgaWYgKFBhdGguaXNBYnNvbHV0ZShjb25maWcuYWR2YW5jZWRMb2NhbE5vZGVNb2R1bGVzKSkge1xuICAgIGxvY2F0aW9uVHlwZSA9ICdhZHZhbmNlZCBzcGVjaWZpZWQnXG4gICAgZXNsaW50RGlyID0gUGF0aC5qb2luKGNvbmZpZy5hZHZhbmNlZExvY2FsTm9kZU1vZHVsZXMgfHwgJycsICdlc2xpbnQnKVxuICB9IGVsc2Uge1xuICAgIGxvY2F0aW9uVHlwZSA9ICdhZHZhbmNlZCBzcGVjaWZpZWQnXG4gICAgZXNsaW50RGlyID0gUGF0aC5qb2luKHByb2plY3RQYXRoLCBjb25maWcuYWR2YW5jZWRMb2NhbE5vZGVNb2R1bGVzLCAnZXNsaW50JylcbiAgfVxuICBpZiAoaXNEaXJlY3RvcnkoZXNsaW50RGlyKSkge1xuICAgIHJldHVybiB7XG4gICAgICBwYXRoOiBlc2xpbnREaXIsXG4gICAgICB0eXBlOiBsb2NhdGlvblR5cGUsXG4gICAgfVxuICB9IGVsc2UgaWYgKGNvbmZpZy51c2VHbG9iYWxFc2xpbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0VTTGludCBub3QgZm91bmQsIHBsZWFzZSBlbnN1cmUgdGhlIGdsb2JhbCBOb2RlIHBhdGggaXMgc2V0IGNvcnJlY3RseS4nKVxuICB9XG4gIHJldHVybiB7XG4gICAgcGF0aDogQ2FjaGUuRVNMSU5UX0xPQ0FMX1BBVEgsXG4gICAgdHlwZTogJ2J1bmRsZWQgZmFsbGJhY2snLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFU0xpbnRGcm9tRGlyZWN0b3J5KG1vZHVsZXNEaXIsIGNvbmZpZywgcHJvamVjdFBhdGgpIHtcbiAgY29uc3QgeyBwYXRoOiBFU0xpbnREaXJlY3RvcnkgfSA9IGZpbmRFU0xpbnREaXJlY3RvcnkobW9kdWxlc0RpciwgY29uZmlnLCBwcm9qZWN0UGF0aClcbiAgdHJ5IHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWR5bmFtaWMtcmVxdWlyZVxuICAgIHJldHVybiByZXF1aXJlKEVTTGludERpcmVjdG9yeSlcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChjb25maWcudXNlR2xvYmFsRXNsaW50ICYmIGUuY29kZSA9PT0gJ01PRFVMRV9OT1RfRk9VTkQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VTTGludCBub3QgZm91bmQsIHRyeSByZXN0YXJ0aW5nIEF0b20gdG8gY2xlYXIgY2FjaGVzLicpXG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZHluYW1pYy1yZXF1aXJlXG4gICAgcmV0dXJuIHJlcXVpcmUoQ2FjaGUuRVNMSU5UX0xPQ0FMX1BBVEgpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZnJlc2hNb2R1bGVzUGF0aChtb2R1bGVzRGlyKSB7XG4gIGlmIChDYWNoZS5MQVNUX01PRFVMRVNfUEFUSCAhPT0gbW9kdWxlc0Rpcikge1xuICAgIENhY2hlLkxBU1RfTU9EVUxFU19QQVRIID0gbW9kdWxlc0RpclxuICAgIHByb2Nlc3MuZW52Lk5PREVfUEFUSCA9IG1vZHVsZXNEaXIgfHwgJydcbiAgICByZXF1aXJlKCdtb2R1bGUnKS5Nb2R1bGUuX2luaXRQYXRocygpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVTTGludEluc3RhbmNlKGZpbGVEaXIsIGNvbmZpZywgcHJvamVjdFBhdGgpIHtcbiAgY29uc3QgbW9kdWxlc0RpciA9IFBhdGguZGlybmFtZShmaW5kQ2FjaGVkKGZpbGVEaXIsICdub2RlX21vZHVsZXMvZXNsaW50JykgfHwgJycpXG4gIHJlZnJlc2hNb2R1bGVzUGF0aChtb2R1bGVzRGlyKVxuICByZXR1cm4gZ2V0RVNMaW50RnJvbURpcmVjdG9yeShtb2R1bGVzRGlyLCBjb25maWcsIHByb2plY3RQYXRoIHx8ICcnKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnUGF0aChmaWxlRGlyKSB7XG4gIGNvbnN0IGNvbmZpZ0ZpbGUgPVxuICAgIGZpbmRDYWNoZWQoZmlsZURpciwgW1xuICAgICAgJy5lc2xpbnRyYy5qcycsICcuZXNsaW50cmMueWFtbCcsICcuZXNsaW50cmMueW1sJywgJy5lc2xpbnRyYy5qc29uJywgJy5lc2xpbnRyYycsICdwYWNrYWdlLmpzb24nXG4gICAgXSlcbiAgaWYgKGNvbmZpZ0ZpbGUpIHtcbiAgICBpZiAoUGF0aC5iYXNlbmFtZShjb25maWdGaWxlKSA9PT0gJ3BhY2thZ2UuanNvbicpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZHluYW1pYy1yZXF1aXJlXG4gICAgICBpZiAocmVxdWlyZShjb25maWdGaWxlKS5lc2xpbnRDb25maWcpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ0ZpbGVcbiAgICAgIH1cbiAgICAgIC8vIElmIHdlIGFyZSBoZXJlLCB3ZSBmb3VuZCBhIHBhY2thZ2UuanNvbiB3aXRob3V0IGFuIGVzbGludCBjb25maWdcbiAgICAgIC8vIGluIGEgZGlyIHdpdGhvdXQgYW55IG90aGVyIGVzbGludCBjb25maWcgZmlsZXNcbiAgICAgIC8vIChiZWNhdXNlICdwYWNrYWdlLmpzb24nIGlzIGxhc3QgaW4gdGhlIGNhbGwgdG8gZmluZENhY2hlZClcbiAgICAgIC8vIFNvLCBrZWVwIGxvb2tpbmcgZnJvbSB0aGUgcGFyZW50IGRpcmVjdG9yeVxuICAgICAgcmV0dXJuIGdldENvbmZpZ1BhdGgoUGF0aC5yZXNvbHZlKFBhdGguZGlybmFtZShjb25maWdGaWxlKSwgJy4uJykpXG4gICAgfVxuICAgIHJldHVybiBjb25maWdGaWxlXG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJlbGF0aXZlUGF0aChmaWxlRGlyLCBmaWxlUGF0aCwgY29uZmlnKSB7XG4gIGNvbnN0IGlnbm9yZUZpbGUgPSBjb25maWcuZGlzYWJsZUVzbGludElnbm9yZSA/IG51bGwgOiBmaW5kQ2FjaGVkKGZpbGVEaXIsICcuZXNsaW50aWdub3JlJylcblxuICBpZiAoaWdub3JlRmlsZSkge1xuICAgIGNvbnN0IGlnbm9yZURpciA9IFBhdGguZGlybmFtZShpZ25vcmVGaWxlKVxuICAgIHByb2Nlc3MuY2hkaXIoaWdub3JlRGlyKVxuICAgIHJldHVybiBQYXRoLnJlbGF0aXZlKGlnbm9yZURpciwgZmlsZVBhdGgpXG4gIH1cbiAgcHJvY2Vzcy5jaGRpcihmaWxlRGlyKVxuICByZXR1cm4gUGF0aC5iYXNlbmFtZShmaWxlUGF0aClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENMSUVuZ2luZU9wdGlvbnModHlwZSwgY29uZmlnLCBydWxlcywgZmlsZVBhdGgsIGZpbGVEaXIsIGdpdmVuQ29uZmlnUGF0aCkge1xuICBjb25zdCBjbGlFbmdpbmVDb25maWcgPSB7XG4gICAgcnVsZXMsXG4gICAgaWdub3JlOiAhY29uZmlnLmRpc2FibGVFc2xpbnRJZ25vcmUsXG4gICAgd2Fybklnbm9yZWQ6IGZhbHNlLFxuICAgIGZpeDogdHlwZSA9PT0gJ2ZpeCdcbiAgfVxuXG4gIGNvbnN0IGlnbm9yZUZpbGUgPSBjb25maWcuZGlzYWJsZUVzbGludElnbm9yZSA/IG51bGwgOiBmaW5kQ2FjaGVkKGZpbGVEaXIsICcuZXNsaW50aWdub3JlJylcbiAgaWYgKGlnbm9yZUZpbGUpIHtcbiAgICBjbGlFbmdpbmVDb25maWcuaWdub3JlUGF0aCA9IGlnbm9yZUZpbGVcbiAgfVxuXG4gIGlmIChjb25maWcuZXNsaW50UnVsZXNEaXIpIHtcbiAgICBsZXQgcnVsZXNEaXIgPSByZXNvbHZlRW52KGNvbmZpZy5lc2xpbnRSdWxlc0RpcilcbiAgICBpZiAoIVBhdGguaXNBYnNvbHV0ZShydWxlc0RpcikpIHtcbiAgICAgIHJ1bGVzRGlyID0gZmluZENhY2hlZChmaWxlRGlyLCBydWxlc0RpcilcbiAgICB9XG4gICAgaWYgKHJ1bGVzRGlyKSB7XG4gICAgICBjbGlFbmdpbmVDb25maWcucnVsZVBhdGhzID0gW3J1bGVzRGlyXVxuICAgIH1cbiAgfVxuXG4gIGlmIChnaXZlbkNvbmZpZ1BhdGggPT09IG51bGwgJiYgY29uZmlnLmVzbGludHJjUGF0aCkge1xuICAgIC8vIElmIHdlIGRpZG4ndCBmaW5kIGEgY29uZmlndXJhdGlvbiB1c2UgdGhlIGZhbGxiYWNrIGZyb20gdGhlIHNldHRpbmdzXG4gICAgY2xpRW5naW5lQ29uZmlnLmNvbmZpZ0ZpbGUgPSByZXNvbHZlRW52KGNvbmZpZy5lc2xpbnRyY1BhdGgpXG4gIH1cblxuICByZXR1cm4gY2xpRW5naW5lQ29uZmlnXG59XG4iXX0=