function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/* global emit */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atomLinter = require('atom-linter');

var _workerHelpers = require('./worker-helpers');

var Helpers = _interopRequireWildcard(_workerHelpers);

var _isConfigAtHomeRoot = require('./is-config-at-home-root');

var _isConfigAtHomeRoot2 = _interopRequireDefault(_isConfigAtHomeRoot);

'use babel';

process.title = 'linter-eslint helper';

function lintJob(_ref) {
  var cliEngineOptions = _ref.cliEngineOptions;
  var contents = _ref.contents;
  var eslint = _ref.eslint;
  var filePath = _ref.filePath;

  var cliEngine = new eslint.CLIEngine(cliEngineOptions);
  return cliEngine.executeOnText(contents, filePath);
}

function fixJob(_ref2) {
  var cliEngineOptions = _ref2.cliEngineOptions;
  var contents = _ref2.contents;
  var eslint = _ref2.eslint;
  var filePath = _ref2.filePath;

  var report = lintJob({ cliEngineOptions: cliEngineOptions, contents: contents, eslint: eslint, filePath: filePath });

  eslint.CLIEngine.outputFixes(report);

  if (!report.results.length || !report.results[0].messages.length) {
    return 'Linter-ESLint: Fix complete.';
  }
  return 'Linter-ESLint: Fix attempt complete, but linting errors remain.';
}

module.exports = _asyncToGenerator(function* () {
  process.on('message', function (jobConfig) {
    var contents = jobConfig.contents;
    var type = jobConfig.type;
    var config = jobConfig.config;
    var filePath = jobConfig.filePath;
    var projectPath = jobConfig.projectPath;
    var rules = jobConfig.rules;
    var emitKey = jobConfig.emitKey;

    if (config.disableFSCache) {
      _atomLinter.FindCache.clear();
    }

    var fileDir = _path2['default'].dirname(filePath);
    var eslint = Helpers.getESLintInstance(fileDir, config, projectPath);
    var configPath = Helpers.getConfigPath(fileDir);
    var noProjectConfig = configPath === null || (0, _isConfigAtHomeRoot2['default'])(configPath);
    if (noProjectConfig && config.disableWhenNoEslintConfig) {
      emit(emitKey, []);
      return;
    }

    var relativeFilePath = Helpers.getRelativePath(fileDir, filePath, config);

    var cliEngineOptions = Helpers.getCLIEngineOptions(type, config, rules, relativeFilePath, fileDir, configPath);

    var response = undefined;
    if (type === 'lint') {
      var report = lintJob({ cliEngineOptions: cliEngineOptions, contents: contents, eslint: eslint, filePath: filePath });
      response = report.results.length ? report.results[0].messages : [];
    } else if (type === 'fix') {
      response = fixJob({ cliEngineOptions: cliEngineOptions, contents: contents, eslint: eslint, filePath: filePath });
    } else if (type === 'debug') {
      var modulesDir = _path2['default'].dirname((0, _atomLinter.findCached)(fileDir, 'node_modules/eslint') || '');
      response = Helpers.findESLintDirectory(modulesDir, config);
    }
    emit(emitKey, response);
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NyYy93b3JrZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBSWlCLE1BQU07Ozs7MEJBQ2UsYUFBYTs7NkJBQzFCLGtCQUFrQjs7SUFBL0IsT0FBTzs7a0NBQ1ksMEJBQTBCOzs7O0FBUHpELFdBQVcsQ0FBQTs7QUFTWCxPQUFPLENBQUMsS0FBSyxHQUFHLHNCQUFzQixDQUFBOztBQUV0QyxTQUFTLE9BQU8sQ0FBQyxJQUFnRCxFQUFFO01BQWhELGdCQUFnQixHQUFsQixJQUFnRCxDQUE5QyxnQkFBZ0I7TUFBRSxRQUFRLEdBQTVCLElBQWdELENBQTVCLFFBQVE7TUFBRSxNQUFNLEdBQXBDLElBQWdELENBQWxCLE1BQU07TUFBRSxRQUFRLEdBQTlDLElBQWdELENBQVYsUUFBUTs7QUFDN0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUE7QUFDeEQsU0FBTyxTQUFTLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtDQUNuRDs7QUFFRCxTQUFTLE1BQU0sQ0FBQyxLQUFnRCxFQUFFO01BQWhELGdCQUFnQixHQUFsQixLQUFnRCxDQUE5QyxnQkFBZ0I7TUFBRSxRQUFRLEdBQTVCLEtBQWdELENBQTVCLFFBQVE7TUFBRSxNQUFNLEdBQXBDLEtBQWdELENBQWxCLE1BQU07TUFBRSxRQUFRLEdBQTlDLEtBQWdELENBQVYsUUFBUTs7QUFDNUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEVBQUUsZ0JBQWdCLEVBQWhCLGdCQUFnQixFQUFFLFFBQVEsRUFBUixRQUFRLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxRQUFRLEVBQVIsUUFBUSxFQUFFLENBQUMsQ0FBQTs7QUFFeEUsUUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUE7O0FBRXBDLE1BQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUNoRSxXQUFPLDhCQUE4QixDQUFBO0dBQ3RDO0FBQ0QsU0FBTyxpRUFBaUUsQ0FBQTtDQUN6RTs7QUFFRCxNQUFNLENBQUMsT0FBTyxxQkFBRyxhQUFrQjtBQUNqQyxTQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFDLFNBQVMsRUFBSztRQUMzQixRQUFRLEdBQTBELFNBQVMsQ0FBM0UsUUFBUTtRQUFFLElBQUksR0FBb0QsU0FBUyxDQUFqRSxJQUFJO1FBQUUsTUFBTSxHQUE0QyxTQUFTLENBQTNELE1BQU07UUFBRSxRQUFRLEdBQWtDLFNBQVMsQ0FBbkQsUUFBUTtRQUFFLFdBQVcsR0FBcUIsU0FBUyxDQUF6QyxXQUFXO1FBQUUsS0FBSyxHQUFjLFNBQVMsQ0FBNUIsS0FBSztRQUFFLE9BQU8sR0FBSyxTQUFTLENBQXJCLE9BQU87O0FBQ3JFLFFBQUksTUFBTSxDQUFDLGNBQWMsRUFBRTtBQUN6Qiw0QkFBVSxLQUFLLEVBQUUsQ0FBQTtLQUNsQjs7QUFFRCxRQUFNLE9BQU8sR0FBRyxrQkFBSyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDdEMsUUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUE7QUFDdEUsUUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNqRCxRQUFNLGVBQWUsR0FBSSxVQUFVLEtBQUssSUFBSSxJQUFJLHFDQUFtQixVQUFVLENBQUMsQUFBQyxDQUFBO0FBQy9FLFFBQUksZUFBZSxJQUFJLE1BQU0sQ0FBQyx5QkFBeUIsRUFBRTtBQUN2RCxVQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ2pCLGFBQU07S0FDUDs7QUFFRCxRQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQTs7QUFFM0UsUUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQ2xELElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxVQUFVLENBQzNELENBQUE7O0FBRUQsUUFBSSxRQUFRLFlBQUEsQ0FBQTtBQUNaLFFBQUksSUFBSSxLQUFLLE1BQU0sRUFBRTtBQUNuQixVQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsRUFBRSxnQkFBZ0IsRUFBaEIsZ0JBQWdCLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFFLFFBQVEsRUFBUixRQUFRLEVBQUUsQ0FBQyxDQUFBO0FBQ3hFLGNBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7S0FDbkUsTUFBTSxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUU7QUFDekIsY0FBUSxHQUFHLE1BQU0sQ0FBQyxFQUFFLGdCQUFnQixFQUFoQixnQkFBZ0IsRUFBRSxRQUFRLEVBQVIsUUFBUSxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBRSxDQUFDLENBQUE7S0FDcEUsTUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLEVBQUU7QUFDM0IsVUFBTSxVQUFVLEdBQUcsa0JBQUssT0FBTyxDQUFDLDRCQUFXLE9BQU8sRUFBRSxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQ2pGLGNBQVEsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0tBQzNEO0FBQ0QsUUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQTtHQUN4QixDQUFDLENBQUE7Q0FDSCxDQUFBLENBQUEiLCJmaWxlIjoiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL3dvcmtlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbi8qIGdsb2JhbCBlbWl0ICovXG5cbmltcG9ydCBQYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBGaW5kQ2FjaGUsIGZpbmRDYWNoZWQgfSBmcm9tICdhdG9tLWxpbnRlcidcbmltcG9ydCAqIGFzIEhlbHBlcnMgZnJvbSAnLi93b3JrZXItaGVscGVycydcbmltcG9ydCBpc0NvbmZpZ0F0SG9tZVJvb3QgZnJvbSAnLi9pcy1jb25maWctYXQtaG9tZS1yb290J1xuXG5wcm9jZXNzLnRpdGxlID0gJ2xpbnRlci1lc2xpbnQgaGVscGVyJ1xuXG5mdW5jdGlvbiBsaW50Sm9iKHsgY2xpRW5naW5lT3B0aW9ucywgY29udGVudHMsIGVzbGludCwgZmlsZVBhdGggfSkge1xuICBjb25zdCBjbGlFbmdpbmUgPSBuZXcgZXNsaW50LkNMSUVuZ2luZShjbGlFbmdpbmVPcHRpb25zKVxuICByZXR1cm4gY2xpRW5naW5lLmV4ZWN1dGVPblRleHQoY29udGVudHMsIGZpbGVQYXRoKVxufVxuXG5mdW5jdGlvbiBmaXhKb2IoeyBjbGlFbmdpbmVPcHRpb25zLCBjb250ZW50cywgZXNsaW50LCBmaWxlUGF0aCB9KSB7XG4gIGNvbnN0IHJlcG9ydCA9IGxpbnRKb2IoeyBjbGlFbmdpbmVPcHRpb25zLCBjb250ZW50cywgZXNsaW50LCBmaWxlUGF0aCB9KVxuXG4gIGVzbGludC5DTElFbmdpbmUub3V0cHV0Rml4ZXMocmVwb3J0KVxuXG4gIGlmICghcmVwb3J0LnJlc3VsdHMubGVuZ3RoIHx8ICFyZXBvcnQucmVzdWx0c1swXS5tZXNzYWdlcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gJ0xpbnRlci1FU0xpbnQ6IEZpeCBjb21wbGV0ZS4nXG4gIH1cbiAgcmV0dXJuICdMaW50ZXItRVNMaW50OiBGaXggYXR0ZW1wdCBjb21wbGV0ZSwgYnV0IGxpbnRpbmcgZXJyb3JzIHJlbWFpbi4nXG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuICBwcm9jZXNzLm9uKCdtZXNzYWdlJywgKGpvYkNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHsgY29udGVudHMsIHR5cGUsIGNvbmZpZywgZmlsZVBhdGgsIHByb2plY3RQYXRoLCBydWxlcywgZW1pdEtleSB9ID0gam9iQ29uZmlnXG4gICAgaWYgKGNvbmZpZy5kaXNhYmxlRlNDYWNoZSkge1xuICAgICAgRmluZENhY2hlLmNsZWFyKClcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlRGlyID0gUGF0aC5kaXJuYW1lKGZpbGVQYXRoKVxuICAgIGNvbnN0IGVzbGludCA9IEhlbHBlcnMuZ2V0RVNMaW50SW5zdGFuY2UoZmlsZURpciwgY29uZmlnLCBwcm9qZWN0UGF0aClcbiAgICBjb25zdCBjb25maWdQYXRoID0gSGVscGVycy5nZXRDb25maWdQYXRoKGZpbGVEaXIpXG4gICAgY29uc3Qgbm9Qcm9qZWN0Q29uZmlnID0gKGNvbmZpZ1BhdGggPT09IG51bGwgfHwgaXNDb25maWdBdEhvbWVSb290KGNvbmZpZ1BhdGgpKVxuICAgIGlmIChub1Byb2plY3RDb25maWcgJiYgY29uZmlnLmRpc2FibGVXaGVuTm9Fc2xpbnRDb25maWcpIHtcbiAgICAgIGVtaXQoZW1pdEtleSwgW10pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCByZWxhdGl2ZUZpbGVQYXRoID0gSGVscGVycy5nZXRSZWxhdGl2ZVBhdGgoZmlsZURpciwgZmlsZVBhdGgsIGNvbmZpZylcblxuICAgIGNvbnN0IGNsaUVuZ2luZU9wdGlvbnMgPSBIZWxwZXJzLmdldENMSUVuZ2luZU9wdGlvbnMoXG4gICAgICB0eXBlLCBjb25maWcsIHJ1bGVzLCByZWxhdGl2ZUZpbGVQYXRoLCBmaWxlRGlyLCBjb25maWdQYXRoXG4gICAgKVxuXG4gICAgbGV0IHJlc3BvbnNlXG4gICAgaWYgKHR5cGUgPT09ICdsaW50Jykge1xuICAgICAgY29uc3QgcmVwb3J0ID0gbGludEpvYih7IGNsaUVuZ2luZU9wdGlvbnMsIGNvbnRlbnRzLCBlc2xpbnQsIGZpbGVQYXRoIH0pXG4gICAgICByZXNwb25zZSA9IHJlcG9ydC5yZXN1bHRzLmxlbmd0aCA/IHJlcG9ydC5yZXN1bHRzWzBdLm1lc3NhZ2VzIDogW11cbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdmaXgnKSB7XG4gICAgICByZXNwb25zZSA9IGZpeEpvYih7IGNsaUVuZ2luZU9wdGlvbnMsIGNvbnRlbnRzLCBlc2xpbnQsIGZpbGVQYXRoIH0pXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnZGVidWcnKSB7XG4gICAgICBjb25zdCBtb2R1bGVzRGlyID0gUGF0aC5kaXJuYW1lKGZpbmRDYWNoZWQoZmlsZURpciwgJ25vZGVfbW9kdWxlcy9lc2xpbnQnKSB8fCAnJylcbiAgICAgIHJlc3BvbnNlID0gSGVscGVycy5maW5kRVNMaW50RGlyZWN0b3J5KG1vZHVsZXNEaXIsIGNvbmZpZylcbiAgICB9XG4gICAgZW1pdChlbWl0S2V5LCByZXNwb25zZSlcbiAgfSlcbn1cbiJdfQ==