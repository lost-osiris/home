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
    env = _.omit(process.env, 'ATOM_HOME', 'ATOM_SHELL_INTERNAL_RUN_AS_NODE', 'GOOGLE_API_KEY', 'NODE_ENV', 'NODE_PATH', 'userAgent', 'taskPath');
    if (env.LANG == null) {
      env.LANG = systemLanguage;
    }
    env.TERM_PROGRAM = 'Terminal-Plus';
    return env;
  })();

  module.exports = function(pwd, shell, args, options) {
    var callback, emitTitle, ptyProcess, title;
    if (options == null) {
      options = {};
    }
    callback = this.async();
    if (/zsh|bash/.test(shell) && args.indexOf('--login') === -1) {
      args.unshift('--login');
    }
    ptyProcess = pty.fork(shell, args, {
      cwd: pwd,
      env: filteredEnvironment,
      name: 'xterm-256color'
    });
    title = shell = path.basename(shell);
    emitTitle = _.throttle(function() {
      return emit('terminal-plus:title', ptyProcess.process);
    }, 500, true);
    ptyProcess.on('data', function(data) {
      emit('terminal-plus:data', data);
      return emitTitle();
    });
    ptyProcess.on('exit', function() {
      emit('terminal-plus:exit');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmFsLXBsdXMvbGliL3Byb2Nlc3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLFlBQVI7O0VBQ0osS0FBQSxHQUFRLE9BQUEsQ0FBUSxlQUFSOztFQUVSLGNBQUEsR0FBb0IsQ0FBQSxTQUFBO0FBQ2xCLFFBQUE7SUFBQSxRQUFBLEdBQVc7SUFDWCxJQUFHLE9BQU8sQ0FBQyxRQUFSLEtBQW9CLFFBQXZCO0FBQ0U7UUFDRSxPQUFBLEdBQVU7UUFDVixRQUFBLEdBQWEsQ0FBQyxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQUssQ0FBQyxRQUFOLENBQWUsT0FBZixDQUF1QixDQUFDLFFBQXhCLENBQUEsQ0FBWCxDQUE4QyxDQUFDLFdBQWhELENBQUEsR0FBNEQsU0FGM0U7T0FBQSxpQkFERjs7QUFJQSxXQUFPO0VBTlcsQ0FBQSxDQUFILENBQUE7O0VBUWpCLG1CQUFBLEdBQXlCLENBQUEsU0FBQTtBQUN2QixRQUFBO0lBQUEsR0FBQSxHQUFNLENBQUMsQ0FBQyxJQUFGLENBQU8sT0FBTyxDQUFDLEdBQWYsRUFBb0IsV0FBcEIsRUFBaUMsaUNBQWpDLEVBQW9FLGdCQUFwRSxFQUFzRixVQUF0RixFQUFrRyxXQUFsRyxFQUErRyxXQUEvRyxFQUE0SCxVQUE1SDs7TUFDTixHQUFHLENBQUMsT0FBUTs7SUFDWixHQUFHLENBQUMsWUFBSixHQUFtQjtBQUNuQixXQUFPO0VBSmdCLENBQUEsQ0FBSCxDQUFBOztFQU10QixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsSUFBYixFQUFtQixPQUFuQjtBQUNmLFFBQUE7O01BRGtDLFVBQVE7O0lBQzFDLFFBQUEsR0FBVyxJQUFDLENBQUEsS0FBRCxDQUFBO0lBRVgsSUFBRyxVQUFVLENBQUMsSUFBWCxDQUFnQixLQUFoQixDQUFBLElBQTJCLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixDQUFBLEtBQTJCLENBQUMsQ0FBMUQ7TUFDRSxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFERjs7SUFHQSxVQUFBLEdBQWEsR0FBRyxDQUFDLElBQUosQ0FBUyxLQUFULEVBQWdCLElBQWhCLEVBQ1g7TUFBQSxHQUFBLEVBQUssR0FBTDtNQUNBLEdBQUEsRUFBSyxtQkFETDtNQUVBLElBQUEsRUFBTSxnQkFGTjtLQURXO0lBS2IsS0FBQSxHQUFRLEtBQUEsR0FBUSxJQUFJLENBQUMsUUFBTCxDQUFjLEtBQWQ7SUFFaEIsU0FBQSxHQUFZLENBQUMsQ0FBQyxRQUFGLENBQVcsU0FBQTthQUNyQixJQUFBLENBQUsscUJBQUwsRUFBNEIsVUFBVSxDQUFDLE9BQXZDO0lBRHFCLENBQVgsRUFFVixHQUZVLEVBRUwsSUFGSztJQUlaLFVBQVUsQ0FBQyxFQUFYLENBQWMsTUFBZCxFQUFzQixTQUFDLElBQUQ7TUFDcEIsSUFBQSxDQUFLLG9CQUFMLEVBQTJCLElBQTNCO2FBQ0EsU0FBQSxDQUFBO0lBRm9CLENBQXRCO0lBSUEsVUFBVSxDQUFDLEVBQVgsQ0FBYyxNQUFkLEVBQXNCLFNBQUE7TUFDcEIsSUFBQSxDQUFLLG9CQUFMO2FBQ0EsUUFBQSxDQUFBO0lBRm9CLENBQXRCO1dBSUEsT0FBTyxDQUFDLEVBQVIsQ0FBVyxTQUFYLEVBQXNCLFNBQUMsR0FBRDtBQUNwQixVQUFBOzBCQURxQixNQUEwQixJQUF6QixtQkFBTyxpQkFBTSxpQkFBTTtBQUN6QyxjQUFPLEtBQVA7QUFBQSxhQUNPLFFBRFA7aUJBQ3FCLFVBQVUsQ0FBQyxNQUFYLENBQWtCLElBQWxCLEVBQXdCLElBQXhCO0FBRHJCLGFBRU8sT0FGUDtpQkFFb0IsVUFBVSxDQUFDLEtBQVgsQ0FBaUIsSUFBakI7QUFGcEI7SUFEb0IsQ0FBdEI7RUF6QmU7QUFwQmpCIiwic291cmNlc0NvbnRlbnQiOlsicHR5ID0gcmVxdWlyZSAncHR5LmpzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUnXG5jaGlsZCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG5cbnN5c3RlbUxhbmd1YWdlID0gZG8gLT5cbiAgbGFuZ3VhZ2UgPSBcImVuX1VTLlVURi04XCJcbiAgaWYgcHJvY2Vzcy5wbGF0Zm9ybSBpcyAnZGFyd2luJ1xuICAgIHRyeVxuICAgICAgY29tbWFuZCA9ICdwbHV0aWwgLWNvbnZlcnQganNvbiAtbyAtIH4vTGlicmFyeS9QcmVmZXJlbmNlcy8uR2xvYmFsUHJlZmVyZW5jZXMucGxpc3QnXG4gICAgICBsYW5ndWFnZSA9IFwiI3tKU09OLnBhcnNlKGNoaWxkLmV4ZWNTeW5jKGNvbW1hbmQpLnRvU3RyaW5nKCkpLkFwcGxlTG9jYWxlfS5VVEYtOFwiXG4gIHJldHVybiBsYW5ndWFnZVxuXG5maWx0ZXJlZEVudmlyb25tZW50ID0gZG8gLT5cbiAgZW52ID0gXy5vbWl0IHByb2Nlc3MuZW52LCAnQVRPTV9IT01FJywgJ0FUT01fU0hFTExfSU5URVJOQUxfUlVOX0FTX05PREUnLCAnR09PR0xFX0FQSV9LRVknLCAnTk9ERV9FTlYnLCAnTk9ERV9QQVRIJywgJ3VzZXJBZ2VudCcsICd0YXNrUGF0aCdcbiAgZW52LkxBTkcgPz0gc3lzdGVtTGFuZ3VhZ2VcbiAgZW52LlRFUk1fUFJPR1JBTSA9ICdUZXJtaW5hbC1QbHVzJ1xuICByZXR1cm4gZW52XG5cbm1vZHVsZS5leHBvcnRzID0gKHB3ZCwgc2hlbGwsIGFyZ3MsIG9wdGlvbnM9e30pIC0+XG4gIGNhbGxiYWNrID0gQGFzeW5jKClcblxuICBpZiAvenNofGJhc2gvLnRlc3Qoc2hlbGwpIGFuZCBhcmdzLmluZGV4T2YoJy0tbG9naW4nKSA9PSAtMVxuICAgIGFyZ3MudW5zaGlmdCAnLS1sb2dpbidcblxuICBwdHlQcm9jZXNzID0gcHR5LmZvcmsgc2hlbGwsIGFyZ3MsXG4gICAgY3dkOiBwd2QsXG4gICAgZW52OiBmaWx0ZXJlZEVudmlyb25tZW50LFxuICAgIG5hbWU6ICd4dGVybS0yNTZjb2xvcidcblxuICB0aXRsZSA9IHNoZWxsID0gcGF0aC5iYXNlbmFtZSBzaGVsbFxuXG4gIGVtaXRUaXRsZSA9IF8udGhyb3R0bGUgLT5cbiAgICBlbWl0KCd0ZXJtaW5hbC1wbHVzOnRpdGxlJywgcHR5UHJvY2Vzcy5wcm9jZXNzKVxuICAsIDUwMCwgdHJ1ZVxuXG4gIHB0eVByb2Nlc3Mub24gJ2RhdGEnLCAoZGF0YSkgLT5cbiAgICBlbWl0KCd0ZXJtaW5hbC1wbHVzOmRhdGEnLCBkYXRhKVxuICAgIGVtaXRUaXRsZSgpXG5cbiAgcHR5UHJvY2Vzcy5vbiAnZXhpdCcsIC0+XG4gICAgZW1pdCgndGVybWluYWwtcGx1czpleGl0JylcbiAgICBjYWxsYmFjaygpXG5cbiAgcHJvY2Vzcy5vbiAnbWVzc2FnZScsICh7ZXZlbnQsIGNvbHMsIHJvd3MsIHRleHR9PXt9KSAtPlxuICAgIHN3aXRjaCBldmVudFxuICAgICAgd2hlbiAncmVzaXplJyB0aGVuIHB0eVByb2Nlc3MucmVzaXplKGNvbHMsIHJvd3MpXG4gICAgICB3aGVuICdpbnB1dCcgdGhlbiBwdHlQcm9jZXNzLndyaXRlKHRleHQpXG4iXX0=
