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
    if (shell) {
      ptyProcess = pty.fork(shell, args, {
        cwd: pwd,
        env: filteredEnvironment,
        name: 'xterm-256color'
      });
      title = shell = path.basename(shell);
    } else {
      ptyProcess = pty.open();
    }
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
        case 'pty':
          return emit('platformio-ide-terminal:pty', ptyProcess.pty);
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi9wcm9jZXNzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSOztFQUNKLEtBQUEsR0FBUSxPQUFBLENBQVEsZUFBUjs7RUFFUixjQUFBLEdBQW9CLENBQUEsU0FBQTtBQUNsQixRQUFBO0lBQUEsUUFBQSxHQUFXO0lBQ1gsSUFBRyxPQUFPLENBQUMsUUFBUixLQUFvQixRQUF2QjtBQUNFO1FBQ0UsT0FBQSxHQUFVO1FBQ1YsUUFBQSxHQUFhLENBQUMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFlLE9BQWYsQ0FBdUIsQ0FBQyxRQUF4QixDQUFBLENBQVgsQ0FBOEMsQ0FBQyxXQUFoRCxDQUFBLEdBQTRELFNBRjNFO09BQUEsaUJBREY7O0FBSUEsV0FBTztFQU5XLENBQUEsQ0FBSCxDQUFBOztFQVFqQixtQkFBQSxHQUF5QixDQUFBLFNBQUE7QUFDdkIsUUFBQTtJQUFBLEdBQUEsR0FBTSxDQUFDLENBQUMsSUFBRixDQUFPLE9BQU8sQ0FBQyxHQUFmLEVBQW9CLFdBQXBCLEVBQWlDLHNCQUFqQyxFQUF5RCxnQkFBekQsRUFBMkUsVUFBM0UsRUFBdUYsV0FBdkYsRUFBb0csV0FBcEcsRUFBaUgsVUFBakg7O01BQ04sR0FBRyxDQUFDLE9BQVE7O0lBQ1osR0FBRyxDQUFDLFlBQUosR0FBbUI7QUFDbkIsV0FBTztFQUpnQixDQUFBLENBQUgsQ0FBQTs7RUFNdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxHQUFELEVBQU0sS0FBTixFQUFhLElBQWIsRUFBbUIsT0FBbkI7QUFDZixRQUFBOztNQURrQyxVQUFROztJQUMxQyxRQUFBLEdBQVcsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQUVYLElBQUcsS0FBSDtNQUNFLFVBQUEsR0FBYSxHQUFHLENBQUMsSUFBSixDQUFTLEtBQVQsRUFBZ0IsSUFBaEIsRUFDWDtRQUFBLEdBQUEsRUFBSyxHQUFMO1FBQ0EsR0FBQSxFQUFLLG1CQURMO1FBRUEsSUFBQSxFQUFNLGdCQUZOO09BRFc7TUFLYixLQUFBLEdBQVEsS0FBQSxHQUFRLElBQUksQ0FBQyxRQUFMLENBQWMsS0FBZCxFQU5sQjtLQUFBLE1BQUE7TUFRRSxVQUFBLEdBQWEsR0FBRyxDQUFDLElBQUosQ0FBQSxFQVJmOztJQVVBLFNBQUEsR0FBWSxDQUFDLENBQUMsUUFBRixDQUFXLFNBQUE7YUFDckIsSUFBQSxDQUFLLCtCQUFMLEVBQXNDLFVBQVUsQ0FBQyxPQUFqRDtJQURxQixDQUFYLEVBRVYsR0FGVSxFQUVMLElBRks7SUFJWixVQUFVLENBQUMsRUFBWCxDQUFjLE1BQWQsRUFBc0IsU0FBQyxJQUFEO01BQ3BCLElBQUEsQ0FBSyw4QkFBTCxFQUFxQyxJQUFyQzthQUNBLFNBQUEsQ0FBQTtJQUZvQixDQUF0QjtJQUlBLFVBQVUsQ0FBQyxFQUFYLENBQWMsTUFBZCxFQUFzQixTQUFBO01BQ3BCLElBQUEsQ0FBSyw4QkFBTDthQUNBLFFBQUEsQ0FBQTtJQUZvQixDQUF0QjtXQUlBLE9BQU8sQ0FBQyxFQUFSLENBQVcsU0FBWCxFQUFzQixTQUFDLEdBQUQ7QUFDcEIsVUFBQTswQkFEcUIsTUFBMEIsSUFBekIsbUJBQU8saUJBQU0saUJBQU07QUFDekMsY0FBTyxLQUFQO0FBQUEsYUFDTyxRQURQO2lCQUNxQixVQUFVLENBQUMsTUFBWCxDQUFrQixJQUFsQixFQUF3QixJQUF4QjtBQURyQixhQUVPLE9BRlA7aUJBRW9CLFVBQVUsQ0FBQyxLQUFYLENBQWlCLElBQWpCO0FBRnBCLGFBR08sS0FIUDtpQkFHa0IsSUFBQSxDQUFLLDZCQUFMLEVBQW9DLFVBQVUsQ0FBQyxHQUEvQztBQUhsQjtJQURvQixDQUF0QjtFQXpCZTtBQXBCakIiLCJzb3VyY2VzQ29udGVudCI6WyJwdHkgPSByZXF1aXJlICdwdHkuanMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMnXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZSdcbmNoaWxkID0gcmVxdWlyZSAnY2hpbGRfcHJvY2Vzcydcblxuc3lzdGVtTGFuZ3VhZ2UgPSBkbyAtPlxuICBsYW5ndWFnZSA9IFwiZW5fVVMuVVRGLThcIlxuICBpZiBwcm9jZXNzLnBsYXRmb3JtIGlzICdkYXJ3aW4nXG4gICAgdHJ5XG4gICAgICBjb21tYW5kID0gJ3BsdXRpbCAtY29udmVydCBqc29uIC1vIC0gfi9MaWJyYXJ5L1ByZWZlcmVuY2VzLy5HbG9iYWxQcmVmZXJlbmNlcy5wbGlzdCdcbiAgICAgIGxhbmd1YWdlID0gXCIje0pTT04ucGFyc2UoY2hpbGQuZXhlY1N5bmMoY29tbWFuZCkudG9TdHJpbmcoKSkuQXBwbGVMb2NhbGV9LlVURi04XCJcbiAgcmV0dXJuIGxhbmd1YWdlXG5cbmZpbHRlcmVkRW52aXJvbm1lbnQgPSBkbyAtPlxuICBlbnYgPSBfLm9taXQgcHJvY2Vzcy5lbnYsICdBVE9NX0hPTUUnLCAnRUxFQ1RST05fUlVOX0FTX05PREUnLCAnR09PR0xFX0FQSV9LRVknLCAnTk9ERV9FTlYnLCAnTk9ERV9QQVRIJywgJ3VzZXJBZ2VudCcsICd0YXNrUGF0aCdcbiAgZW52LkxBTkcgPz0gc3lzdGVtTGFuZ3VhZ2VcbiAgZW52LlRFUk1fUFJPR1JBTSA9ICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbCdcbiAgcmV0dXJuIGVudlxuXG5tb2R1bGUuZXhwb3J0cyA9IChwd2QsIHNoZWxsLCBhcmdzLCBvcHRpb25zPXt9KSAtPlxuICBjYWxsYmFjayA9IEBhc3luYygpXG5cbiAgaWYgc2hlbGxcbiAgICBwdHlQcm9jZXNzID0gcHR5LmZvcmsgc2hlbGwsIGFyZ3MsXG4gICAgICBjd2Q6IHB3ZCxcbiAgICAgIGVudjogZmlsdGVyZWRFbnZpcm9ubWVudCxcbiAgICAgIG5hbWU6ICd4dGVybS0yNTZjb2xvcidcblxuICAgIHRpdGxlID0gc2hlbGwgPSBwYXRoLmJhc2VuYW1lIHNoZWxsXG4gIGVsc2VcbiAgICBwdHlQcm9jZXNzID0gcHR5Lm9wZW4oKVxuXG4gIGVtaXRUaXRsZSA9IF8udGhyb3R0bGUgLT5cbiAgICBlbWl0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDp0aXRsZScsIHB0eVByb2Nlc3MucHJvY2VzcylcbiAgLCA1MDAsIHRydWVcblxuICBwdHlQcm9jZXNzLm9uICdkYXRhJywgKGRhdGEpIC0+XG4gICAgZW1pdCgncGxhdGZvcm1pby1pZGUtdGVybWluYWw6ZGF0YScsIGRhdGEpXG4gICAgZW1pdFRpdGxlKClcblxuICBwdHlQcm9jZXNzLm9uICdleGl0JywgLT5cbiAgICBlbWl0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpleGl0JylcbiAgICBjYWxsYmFjaygpXG5cbiAgcHJvY2Vzcy5vbiAnbWVzc2FnZScsICh7ZXZlbnQsIGNvbHMsIHJvd3MsIHRleHR9PXt9KSAtPlxuICAgIHN3aXRjaCBldmVudFxuICAgICAgd2hlbiAncmVzaXplJyB0aGVuIHB0eVByb2Nlc3MucmVzaXplKGNvbHMsIHJvd3MpXG4gICAgICB3aGVuICdpbnB1dCcgdGhlbiBwdHlQcm9jZXNzLndyaXRlKHRleHQpXG4gICAgICB3aGVuICdwdHknIHRoZW4gZW1pdCgncGxhdGZvcm1pby1pZGUtdGVybWluYWw6cHR5JywgcHR5UHJvY2Vzcy5wdHkpXG4iXX0=
