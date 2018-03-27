(function() {
  var _, child, filteredEnvironment, fs, path, pty, systemLanguage;

  pty = require('pty.js');

  path = require('path');

  fs = require('fs');

  _ = require('underscore');

  child = require('child_process');

  systemLanguage = (function() {
    var command, language;
    language = "en_US.UTF-8";
    if (process.platform === 'darwin') {
      try {
        command = 'plutil -convert json -o - ~/Library/Preferences/.GlobalPreferences.plist';
        language = (JSON.parse(child.execSync(command).toString()).AppleLocale) + ".UTF-8";
      } catch (error) {}
    }
    return language;
  })();

  filteredEnvironment = (function() {
    var env;
    env = _.omit(process.env, 'ATOM_HOME', 'ELECTRON_RUN_AS_NODE', 'GOOGLE_API_KEY', 'NODE_ENV', 'NODE_PATH', 'userAgent', 'taskPath');
    if (env.LANG == null) {
      env.LANG = systemLanguage;
    }
    env.TERM_PROGRAM = 'platformio-ide-terminal';
    return env;
  })();

  module.exports = function(pwd, shell, args, options) {
    var callback, emitTitle, ptyProcess, title;
    if (options == null) {
      options = {};
    }
    callback = this.async();
    if (/zsh|bash/.test(shell) && args.indexOf('--login') === -1 && process.platform !== 'win32') {
      args.unshift('--login');
    }
    ptyProcess = pty.fork(shell, args, {
      cwd: pwd,
      env: filteredEnvironment,
      name: 'xterm-256color'
    });
    title = shell = path.basename(shell);
    emitTitle = _.throttle(function() {
      return emit('platformio-ide-terminal:title', ptyProcess.process);
    }, 500, true);
    ptyProcess.on('data', function(data) {
      emit('platformio-ide-terminal:data', data);
      return emitTitle();
    });
    ptyProcess.on('exit', function() {
      emit('platformio-ide-terminal:exit');
      return callback();
    });
    return process.on('message', function(arg) {
      var cols, event, ref, rows, text;
      ref = arg != null ? arg : {}, event = ref.event, cols = ref.cols, rows = ref.rows, text = ref.text;
      switch (event) {
        case 'resize':
          return ptyProcess.resize(cols, rows);
        case 'input':
          return ptyProcess.write(text);
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi9wcm9jZXNzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSOztFQUNKLEtBQUEsR0FBUSxPQUFBLENBQVEsZUFBUjs7RUFFUixjQUFBLEdBQW9CLENBQUEsU0FBQTtBQUNsQixRQUFBO0lBQUEsUUFBQSxHQUFXO0lBQ1gsSUFBRyxPQUFPLENBQUMsUUFBUixLQUFvQixRQUF2QjtBQUNFO1FBQ0UsT0FBQSxHQUFVO1FBQ1YsUUFBQSxHQUFhLENBQUMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFlLE9BQWYsQ0FBdUIsQ0FBQyxRQUF4QixDQUFBLENBQVgsQ0FBOEMsQ0FBQyxXQUFoRCxDQUFBLEdBQTRELFNBRjNFO09BQUEsaUJBREY7O0FBSUEsV0FBTztFQU5XLENBQUEsQ0FBSCxDQUFBOztFQVFqQixtQkFBQSxHQUF5QixDQUFBLFNBQUE7QUFDdkIsUUFBQTtJQUFBLEdBQUEsR0FBTSxDQUFDLENBQUMsSUFBRixDQUFPLE9BQU8sQ0FBQyxHQUFmLEVBQW9CLFdBQXBCLEVBQWlDLHNCQUFqQyxFQUF5RCxnQkFBekQsRUFBMkUsVUFBM0UsRUFBdUYsV0FBdkYsRUFBb0csV0FBcEcsRUFBaUgsVUFBakg7O01BQ04sR0FBRyxDQUFDLE9BQVE7O0lBQ1osR0FBRyxDQUFDLFlBQUosR0FBbUI7QUFDbkIsV0FBTztFQUpnQixDQUFBLENBQUgsQ0FBQTs7RUFNdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxHQUFELEVBQU0sS0FBTixFQUFhLElBQWIsRUFBbUIsT0FBbkI7QUFDZixRQUFBOztNQURrQyxVQUFROztJQUMxQyxRQUFBLEdBQVcsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQUVYLElBQUcsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBQSxJQUEyQixJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsQ0FBQSxLQUEyQixDQUFDLENBQXZELElBQTZELE9BQU8sQ0FBQyxRQUFSLEtBQXNCLE9BQXRGO01BQ0UsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBREY7O0lBR0EsVUFBQSxHQUFhLEdBQUcsQ0FBQyxJQUFKLENBQVMsS0FBVCxFQUFnQixJQUFoQixFQUNYO01BQUEsR0FBQSxFQUFLLEdBQUw7TUFDQSxHQUFBLEVBQUssbUJBREw7TUFFQSxJQUFBLEVBQU0sZ0JBRk47S0FEVztJQUtiLEtBQUEsR0FBUSxLQUFBLEdBQVEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFkO0lBRWhCLFNBQUEsR0FBWSxDQUFDLENBQUMsUUFBRixDQUFXLFNBQUE7YUFDckIsSUFBQSxDQUFLLCtCQUFMLEVBQXNDLFVBQVUsQ0FBQyxPQUFqRDtJQURxQixDQUFYLEVBRVYsR0FGVSxFQUVMLElBRks7SUFJWixVQUFVLENBQUMsRUFBWCxDQUFjLE1BQWQsRUFBc0IsU0FBQyxJQUFEO01BQ3BCLElBQUEsQ0FBSyw4QkFBTCxFQUFxQyxJQUFyQzthQUNBLFNBQUEsQ0FBQTtJQUZvQixDQUF0QjtJQUlBLFVBQVUsQ0FBQyxFQUFYLENBQWMsTUFBZCxFQUFzQixTQUFBO01BQ3BCLElBQUEsQ0FBSyw4QkFBTDthQUNBLFFBQUEsQ0FBQTtJQUZvQixDQUF0QjtXQUlBLE9BQU8sQ0FBQyxFQUFSLENBQVcsU0FBWCxFQUFzQixTQUFDLEdBQUQ7QUFDcEIsVUFBQTswQkFEcUIsTUFBMEIsSUFBekIsbUJBQU8saUJBQU0saUJBQU07QUFDekMsY0FBTyxLQUFQO0FBQUEsYUFDTyxRQURQO2lCQUNxQixVQUFVLENBQUMsTUFBWCxDQUFrQixJQUFsQixFQUF3QixJQUF4QjtBQURyQixhQUVPLE9BRlA7aUJBRW9CLFVBQVUsQ0FBQyxLQUFYLENBQWlCLElBQWpCO0FBRnBCO0lBRG9CLENBQXRCO0VBekJlO0FBcEJqQiIsInNvdXJjZXNDb250ZW50IjpbInB0eSA9IHJlcXVpcmUgJ3B0eS5qcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcydcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlJ1xuY2hpbGQgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuXG5zeXN0ZW1MYW5ndWFnZSA9IGRvIC0+XG4gIGxhbmd1YWdlID0gXCJlbl9VUy5VVEYtOFwiXG4gIGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgJ2RhcndpbidcbiAgICB0cnlcbiAgICAgIGNvbW1hbmQgPSAncGx1dGlsIC1jb252ZXJ0IGpzb24gLW8gLSB+L0xpYnJhcnkvUHJlZmVyZW5jZXMvLkdsb2JhbFByZWZlcmVuY2VzLnBsaXN0J1xuICAgICAgbGFuZ3VhZ2UgPSBcIiN7SlNPTi5wYXJzZShjaGlsZC5leGVjU3luYyhjb21tYW5kKS50b1N0cmluZygpKS5BcHBsZUxvY2FsZX0uVVRGLThcIlxuICByZXR1cm4gbGFuZ3VhZ2VcblxuZmlsdGVyZWRFbnZpcm9ubWVudCA9IGRvIC0+XG4gIGVudiA9IF8ub21pdCBwcm9jZXNzLmVudiwgJ0FUT01fSE9NRScsICdFTEVDVFJPTl9SVU5fQVNfTk9ERScsICdHT09HTEVfQVBJX0tFWScsICdOT0RFX0VOVicsICdOT0RFX1BBVEgnLCAndXNlckFnZW50JywgJ3Rhc2tQYXRoJ1xuICBlbnYuTEFORyA/PSBzeXN0ZW1MYW5ndWFnZVxuICBlbnYuVEVSTV9QUk9HUkFNID0gJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsJ1xuICByZXR1cm4gZW52XG5cbm1vZHVsZS5leHBvcnRzID0gKHB3ZCwgc2hlbGwsIGFyZ3MsIG9wdGlvbnM9e30pIC0+XG4gIGNhbGxiYWNrID0gQGFzeW5jKClcblxuICBpZiAvenNofGJhc2gvLnRlc3Qoc2hlbGwpIGFuZCBhcmdzLmluZGV4T2YoJy0tbG9naW4nKSA9PSAtMSBhbmQgcHJvY2Vzcy5wbGF0Zm9ybSBpc250ICd3aW4zMidcbiAgICBhcmdzLnVuc2hpZnQgJy0tbG9naW4nXG5cbiAgcHR5UHJvY2VzcyA9IHB0eS5mb3JrIHNoZWxsLCBhcmdzLFxuICAgIGN3ZDogcHdkLFxuICAgIGVudjogZmlsdGVyZWRFbnZpcm9ubWVudCxcbiAgICBuYW1lOiAneHRlcm0tMjU2Y29sb3InXG5cbiAgdGl0bGUgPSBzaGVsbCA9IHBhdGguYmFzZW5hbWUgc2hlbGxcblxuICBlbWl0VGl0bGUgPSBfLnRocm90dGxlIC0+XG4gICAgZW1pdCgncGxhdGZvcm1pby1pZGUtdGVybWluYWw6dGl0bGUnLCBwdHlQcm9jZXNzLnByb2Nlc3MpXG4gICwgNTAwLCB0cnVlXG5cbiAgcHR5UHJvY2Vzcy5vbiAnZGF0YScsIChkYXRhKSAtPlxuICAgIGVtaXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmRhdGEnLCBkYXRhKVxuICAgIGVtaXRUaXRsZSgpXG5cbiAgcHR5UHJvY2Vzcy5vbiAnZXhpdCcsIC0+XG4gICAgZW1pdCgncGxhdGZvcm1pby1pZGUtdGVybWluYWw6ZXhpdCcpXG4gICAgY2FsbGJhY2soKVxuXG4gIHByb2Nlc3Mub24gJ21lc3NhZ2UnLCAoe2V2ZW50LCBjb2xzLCByb3dzLCB0ZXh0fT17fSkgLT5cbiAgICBzd2l0Y2ggZXZlbnRcbiAgICAgIHdoZW4gJ3Jlc2l6ZScgdGhlbiBwdHlQcm9jZXNzLnJlc2l6ZShjb2xzLCByb3dzKVxuICAgICAgd2hlbiAnaW5wdXQnIHRoZW4gcHR5UHJvY2Vzcy53cml0ZSh0ZXh0KVxuIl19
