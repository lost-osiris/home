function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* eslint-disable import/prefer-default-export */

var _userHome = require('user-home');

var _userHome2 = _interopRequireDefault(_userHome);

var _path = require('path');

/**
 * Check if a config is directly inside a user's home directory.
 * Such config files are used by ESLint as a fallback, only for situations
 * when there is no other config file between a file being linted and root.
 *
 * @param  {string}  configPath - The path of the config file being checked
 * @return {Boolean}              True if the file is directly in the current user's home
 */
'use babel';module.exports = function isConfigAtHomeRoot(configPath) {
  return (0, _path.dirname)(configPath) === _userHome2['default'];
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NyYy9pcy1jb25maWctYXQtaG9tZS1yb290LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7d0JBSXFCLFdBQVc7Ozs7b0JBQ1IsTUFBTTs7Ozs7Ozs7OztBQUw5QixXQUFXLENBQUEsQUFlWCxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsa0JBQWtCLENBQUMsVUFBVSxFQUFFO0FBQ3ZELFNBQVEsbUJBQVEsVUFBVSxDQUFDLDBCQUFhLENBQUM7Q0FDMUMsQ0FBQSIsImZpbGUiOiIvaG9tZS9tb3dlbnMvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvaXMtY29uZmlnLWF0LWhvbWUtcm9vdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbi8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9wcmVmZXItZGVmYXVsdC1leHBvcnQgKi9cblxuaW1wb3J0IHVzZXJIb21lIGZyb20gJ3VzZXItaG9tZSdcbmltcG9ydCB7IGRpcm5hbWUgfSBmcm9tICdwYXRoJ1xuXG4vKipcbiAqIENoZWNrIGlmIGEgY29uZmlnIGlzIGRpcmVjdGx5IGluc2lkZSBhIHVzZXIncyBob21lIGRpcmVjdG9yeS5cbiAqIFN1Y2ggY29uZmlnIGZpbGVzIGFyZSB1c2VkIGJ5IEVTTGludCBhcyBhIGZhbGxiYWNrLCBvbmx5IGZvciBzaXR1YXRpb25zXG4gKiB3aGVuIHRoZXJlIGlzIG5vIG90aGVyIGNvbmZpZyBmaWxlIGJldHdlZW4gYSBmaWxlIGJlaW5nIGxpbnRlZCBhbmQgcm9vdC5cbiAqXG4gKiBAcGFyYW0gIHtzdHJpbmd9ICBjb25maWdQYXRoIC0gVGhlIHBhdGggb2YgdGhlIGNvbmZpZyBmaWxlIGJlaW5nIGNoZWNrZWRcbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgICAgICBUcnVlIGlmIHRoZSBmaWxlIGlzIGRpcmVjdGx5IGluIHRoZSBjdXJyZW50IHVzZXIncyBob21lXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDb25maWdBdEhvbWVSb290KGNvbmZpZ1BhdGgpIHtcbiAgcmV0dXJuIChkaXJuYW1lKGNvbmZpZ1BhdGgpID09PSB1c2VySG9tZSlcbn1cbiJdfQ==