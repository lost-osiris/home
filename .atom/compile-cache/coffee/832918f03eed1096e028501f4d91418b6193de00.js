
/*
Requires https://github.com/FriendsOfPHP/phpcbf
 */

(function() {
  "use strict";
  var Beautifier, PHPCBF,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PHPCBF = (function(superClass) {
    extend(PHPCBF, superClass);

    function PHPCBF() {
      return PHPCBF.__super__.constructor.apply(this, arguments);
    }

    PHPCBF.prototype.name = "PHPCBF";

    PHPCBF.prototype.link = "http://php.net/manual/en/install.php";

    PHPCBF.prototype.isPreInstalled = false;

    PHPCBF.prototype.options = {
      PHP: {
        phpcbf_path: true,
        phpcbf_version: true,
        standard: true
      }
    };

    PHPCBF.prototype.beautify = function(text, language, options) {
      var isWin, standardFile, standardFiles, tempFile;
      this.debug('phpcbf', options);
      standardFiles = ['phpcs.xml', 'phpcs.xml.dist', 'phpcs.ruleset.xml', 'ruleset.xml'];
      standardFile = this.findFile(atom.project.getPaths()[0], standardFiles);
      if (standardFile) {
        options.standard = standardFile;
      }
      isWin = this.isWindows;
      if (isWin) {
        return this.Promise.all([options.phpcbf_path ? this.which(options.phpcbf_path) : void 0, this.which('phpcbf')]).then((function(_this) {
          return function(paths) {
            var _, exec, isExec, path, phpcbfPath, tempFile;
            _this.debug('phpcbf paths', paths);
            _ = require('lodash');
            path = require('path');
            phpcbfPath = _.find(paths, function(p) {
              return p && path.isAbsolute(p);
            });
            _this.verbose('phpcbfPath', phpcbfPath);
            _this.debug('phpcbfPath', phpcbfPath, paths);
            if (phpcbfPath != null) {
              isExec = path.extname(phpcbfPath) !== '';
              exec = isExec ? phpcbfPath : "php";
              return _this.run(exec, [!isExec ? phpcbfPath : void 0, options.phpcbf_version !== 3 ? "--no-patch" : void 0, options.standard ? "--standard=" + options.standard : void 0, tempFile = _this.tempFile("temp", text)], {
                ignoreReturnCode: true,
                help: {
                  link: "http://php.net/manual/en/install.php"
                },
                onStdin: function(stdin) {
                  return stdin.end();
                }
              }).then(function() {
                return _this.readFile(tempFile);
              });
            } else {
              _this.verbose('phpcbf not found!');
              return _this.Promise.reject(_this.commandNotFoundError('phpcbf', {
                link: "https://github.com/squizlabs/PHP_CodeSniffer",
                program: "phpcbf.phar",
                pathOption: "PHPCBF Path"
              }));
            }
          };
        })(this));
      } else {
        return this.run("phpcbf", ["--no-patch", options.standard ? "--standard=" + options.standard : void 0, tempFile = this.tempFile("temp", text)], {
          ignoreReturnCode: true,
          help: {
            link: "https://github.com/squizlabs/PHP_CodeSniffer"
          },
          onStdin: function(stdin) {
            return stdin.end();
          }
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      }
    };

    return PHPCBF;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3BocGNiZi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsa0JBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3FCQUNyQixJQUFBLEdBQU07O3FCQUNOLElBQUEsR0FBTTs7cUJBQ04sY0FBQSxHQUFnQjs7cUJBRWhCLE9BQUEsR0FBUztNQUNQLEdBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxJQUFiO1FBQ0EsY0FBQSxFQUFnQixJQURoQjtRQUVBLFFBQUEsRUFBVSxJQUZWO09BRks7OztxQkFPVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxDQUFPLFFBQVAsRUFBaUIsT0FBakI7TUFDQSxhQUFBLEdBQWdCLENBQUMsV0FBRCxFQUFjLGdCQUFkLEVBQWdDLG1CQUFoQyxFQUFxRCxhQUFyRDtNQUNoQixZQUFBLEdBQWUsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQUF3QixDQUFBLENBQUEsQ0FBbEMsRUFBc0MsYUFBdEM7TUFFZixJQUFtQyxZQUFuQztRQUFBLE9BQU8sQ0FBQyxRQUFSLEdBQW1CLGFBQW5COztNQUVBLEtBQUEsR0FBUSxJQUFDLENBQUE7TUFDVCxJQUFHLEtBQUg7ZUFFRSxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxDQUNvQixPQUFPLENBQUMsV0FBdkMsR0FBQSxJQUFDLENBQUEsS0FBRCxDQUFPLE9BQU8sQ0FBQyxXQUFmLENBQUEsR0FBQSxNQURXLEVBRVgsSUFBQyxDQUFBLEtBQUQsQ0FBTyxRQUFQLENBRlcsQ0FBYixDQUdFLENBQUMsSUFISCxDQUdRLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsS0FBRDtBQUNOLGdCQUFBO1lBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTyxjQUFQLEVBQXVCLEtBQXZCO1lBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSO1lBQ0osSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSO1lBRVAsVUFBQSxHQUFhLENBQUMsQ0FBQyxJQUFGLENBQU8sS0FBUCxFQUFjLFNBQUMsQ0FBRDtxQkFBTyxDQUFBLElBQU0sSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsQ0FBaEI7WUFBYixDQUFkO1lBQ2IsS0FBQyxDQUFBLE9BQUQsQ0FBUyxZQUFULEVBQXVCLFVBQXZCO1lBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTyxZQUFQLEVBQXFCLFVBQXJCLEVBQWlDLEtBQWpDO1lBRUEsSUFBRyxrQkFBSDtjQUlFLE1BQUEsR0FBUyxJQUFJLENBQUMsT0FBTCxDQUFhLFVBQWIsQ0FBQSxLQUE4QjtjQUN2QyxJQUFBLEdBQVUsTUFBSCxHQUFlLFVBQWYsR0FBK0I7cUJBRXRDLEtBQUMsQ0FBQSxHQUFELENBQUssSUFBTCxFQUFXLENBQ1QsQ0FBa0IsTUFBbEIsR0FBQSxVQUFBLEdBQUEsTUFEUyxFQUVXLE9BQU8sQ0FBQyxjQUFSLEtBQTBCLENBQTlDLEdBQUEsWUFBQSxHQUFBLE1BRlMsRUFHMkIsT0FBTyxDQUFDLFFBQTVDLEdBQUEsYUFBQSxHQUFjLE9BQU8sQ0FBQyxRQUF0QixHQUFBLE1BSFMsRUFJVCxRQUFBLEdBQVcsS0FBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLENBSkYsQ0FBWCxFQUtLO2dCQUNELGdCQUFBLEVBQWtCLElBRGpCO2dCQUVELElBQUEsRUFBTTtrQkFDSixJQUFBLEVBQU0sc0NBREY7aUJBRkw7Z0JBS0QsT0FBQSxFQUFTLFNBQUMsS0FBRDt5QkFDUCxLQUFLLENBQUMsR0FBTixDQUFBO2dCQURPLENBTFI7ZUFMTCxDQWFFLENBQUMsSUFiSCxDQWFRLFNBQUE7dUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO2NBREksQ0FiUixFQVBGO2FBQUEsTUFBQTtjQXdCRSxLQUFDLENBQUEsT0FBRCxDQUFTLG1CQUFUO3FCQUVBLEtBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixLQUFDLENBQUEsb0JBQUQsQ0FDZCxRQURjLEVBRWQ7Z0JBQ0EsSUFBQSxFQUFNLDhDQUROO2dCQUVBLE9BQUEsRUFBUyxhQUZUO2dCQUdBLFVBQUEsRUFBWSxhQUhaO2VBRmMsQ0FBaEIsRUExQkY7O1VBVE07UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSFIsRUFGRjtPQUFBLE1BQUE7ZUFrREUsSUFBQyxDQUFBLEdBQUQsQ0FBSyxRQUFMLEVBQWUsQ0FDYixZQURhLEVBRXVCLE9BQU8sQ0FBQyxRQUE1QyxHQUFBLGFBQUEsR0FBYyxPQUFPLENBQUMsUUFBdEIsR0FBQSxNQUZhLEVBR2IsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQixDQUhFLENBQWYsRUFJSztVQUNELGdCQUFBLEVBQWtCLElBRGpCO1VBRUQsSUFBQSxFQUFNO1lBQ0osSUFBQSxFQUFNLDhDQURGO1dBRkw7VUFLRCxPQUFBLEVBQVMsU0FBQyxLQUFEO21CQUNQLEtBQUssQ0FBQyxHQUFOLENBQUE7VUFETyxDQUxSO1NBSkwsQ0FZRSxDQUFDLElBWkgsQ0FZUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtVQURJO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVpSLEVBbERGOztJQVJROzs7O0tBWjBCO0FBUHRDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL3BocGNiZlxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQSFBDQkYgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiUEhQQ0JGXCJcbiAgbGluazogXCJodHRwOi8vcGhwLm5ldC9tYW51YWwvZW4vaW5zdGFsbC5waHBcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgUEhQOlxuICAgICAgcGhwY2JmX3BhdGg6IHRydWVcbiAgICAgIHBocGNiZl92ZXJzaW9uOiB0cnVlXG4gICAgICBzdGFuZGFyZDogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBAZGVidWcoJ3BocGNiZicsIG9wdGlvbnMpXG4gICAgc3RhbmRhcmRGaWxlcyA9IFsncGhwY3MueG1sJywgJ3BocGNzLnhtbC5kaXN0JywgJ3BocGNzLnJ1bGVzZXQueG1sJywgJ3J1bGVzZXQueG1sJ11cbiAgICBzdGFuZGFyZEZpbGUgPSBAZmluZEZpbGUoYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF0sIHN0YW5kYXJkRmlsZXMpXG5cbiAgICBvcHRpb25zLnN0YW5kYXJkID0gc3RhbmRhcmRGaWxlIGlmIHN0YW5kYXJkRmlsZVxuXG4gICAgaXNXaW4gPSBAaXNXaW5kb3dzXG4gICAgaWYgaXNXaW5cbiAgICAgICMgRmluZCBwaHBjYmYucGhhciBzY3JpcHRcbiAgICAgIEBQcm9taXNlLmFsbChbXG4gICAgICAgIEB3aGljaChvcHRpb25zLnBocGNiZl9wYXRoKSBpZiBvcHRpb25zLnBocGNiZl9wYXRoXG4gICAgICAgIEB3aGljaCgncGhwY2JmJylcbiAgICAgIF0pLnRoZW4oKHBhdGhzKSA9PlxuICAgICAgICBAZGVidWcoJ3BocGNiZiBwYXRocycsIHBhdGhzKVxuICAgICAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuICAgICAgICBwYXRoID0gcmVxdWlyZSAncGF0aCdcbiAgICAgICAgIyBHZXQgZmlyc3QgdmFsaWQsIGFic29sdXRlIHBhdGhcbiAgICAgICAgcGhwY2JmUGF0aCA9IF8uZmluZChwYXRocywgKHApIC0+IHAgYW5kIHBhdGguaXNBYnNvbHV0ZShwKSApXG4gICAgICAgIEB2ZXJib3NlKCdwaHBjYmZQYXRoJywgcGhwY2JmUGF0aClcbiAgICAgICAgQGRlYnVnKCdwaHBjYmZQYXRoJywgcGhwY2JmUGF0aCwgcGF0aHMpXG4gICAgICAgICMgQ2hlY2sgaWYgcGhwY2JmIHBhdGggd2FzIGZvdW5kXG4gICAgICAgIGlmIHBocGNiZlBhdGg/XG4gICAgICAgICAgIyBGb3VuZCBwaHBjYmYgcGF0aFxuXG4gICAgICAgICAgIyBDaGVjayBpZiBwaHBjYmYgaXMgYW4gZXhlY3V0YWJsZVxuICAgICAgICAgIGlzRXhlYyA9IHBhdGguZXh0bmFtZShwaHBjYmZQYXRoKSBpc250ICcnXG4gICAgICAgICAgZXhlYyA9IGlmIGlzRXhlYyB0aGVuIHBocGNiZlBhdGggZWxzZSBcInBocFwiXG5cbiAgICAgICAgICBAcnVuKGV4ZWMsIFtcbiAgICAgICAgICAgIHBocGNiZlBhdGggdW5sZXNzIGlzRXhlY1xuICAgICAgICAgICAgXCItLW5vLXBhdGNoXCIgdW5sZXNzIG9wdGlvbnMucGhwY2JmX3ZlcnNpb24gaXMgM1xuICAgICAgICAgICAgXCItLXN0YW5kYXJkPSN7b3B0aW9ucy5zdGFuZGFyZH1cIiBpZiBvcHRpb25zLnN0YW5kYXJkXG4gICAgICAgICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dClcbiAgICAgICAgICAgIF0sIHtcbiAgICAgICAgICAgICAgaWdub3JlUmV0dXJuQ29kZTogdHJ1ZVxuICAgICAgICAgICAgICBoZWxwOiB7XG4gICAgICAgICAgICAgICAgbGluazogXCJodHRwOi8vcGhwLm5ldC9tYW51YWwvZW4vaW5zdGFsbC5waHBcIlxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG9uU3RkaW46IChzdGRpbikgLT5cbiAgICAgICAgICAgICAgICBzdGRpbi5lbmQoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEB2ZXJib3NlKCdwaHBjYmYgbm90IGZvdW5kIScpXG4gICAgICAgICAgIyBDb3VsZCBub3QgZmluZCBwaHBjYmYgcGF0aFxuICAgICAgICAgIEBQcm9taXNlLnJlamVjdChAY29tbWFuZE5vdEZvdW5kRXJyb3IoXG4gICAgICAgICAgICAncGhwY2JmJ1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vc3F1aXpsYWJzL1BIUF9Db2RlU25pZmZlclwiXG4gICAgICAgICAgICBwcm9ncmFtOiBcInBocGNiZi5waGFyXCJcbiAgICAgICAgICAgIHBhdGhPcHRpb246IFwiUEhQQ0JGIFBhdGhcIlxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApXG4gICAgICApXG4gICAgZWxzZVxuICAgICAgQHJ1bihcInBocGNiZlwiLCBbXG4gICAgICAgIFwiLS1uby1wYXRjaFwiXG4gICAgICAgIFwiLS1zdGFuZGFyZD0je29wdGlvbnMuc3RhbmRhcmR9XCIgaWYgb3B0aW9ucy5zdGFuZGFyZFxuICAgICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dClcbiAgICAgICAgXSwge1xuICAgICAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgICAgICBoZWxwOiB7XG4gICAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9zcXVpemxhYnMvUEhQX0NvZGVTbmlmZmVyXCJcbiAgICAgICAgICB9XG4gICAgICAgICAgb25TdGRpbjogKHN0ZGluKSAtPlxuICAgICAgICAgICAgc3RkaW4uZW5kKClcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgIClcbiJdfQ==
