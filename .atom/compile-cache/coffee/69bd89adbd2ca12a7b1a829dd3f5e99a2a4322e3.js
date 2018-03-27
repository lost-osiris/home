(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  describe("dirty work for fast package activation", function() {
    var ensureRequiredFiles, withCleanActivation;
    withCleanActivation = null;
    ensureRequiredFiles = null;
    beforeEach(function() {
      return runs(function() {
        var cleanRequireCache, getRequiredLibOrNodeModulePaths, packPath;
        packPath = atom.packages.loadPackage('vim-mode-plus').path;
        getRequiredLibOrNodeModulePaths = function() {
          return Object.keys(require.cache).filter(function(p) {
            return p.startsWith(packPath + 'lib') || p.startsWith(packPath + 'node_modules');
          });
        };
        cleanRequireCache = function() {
          var oldPaths, savedCache;
          savedCache = {};
          oldPaths = getRequiredLibOrNodeModulePaths();
          oldPaths.forEach(function(p) {
            savedCache[p] = require.cache[p];
            return delete require.cache[p];
          });
          return function() {
            oldPaths.forEach(function(p) {
              return require.cache[p] = savedCache[p];
            });
            return getRequiredLibOrNodeModulePaths().forEach(function(p) {
              if (indexOf.call(oldPaths, p) < 0) {
                return delete require.cache[p];
              }
            });
          };
        };
        withCleanActivation = function(fn) {
          var restoreRequireCache;
          restoreRequireCache = null;
          runs(function() {
            return restoreRequireCache = cleanRequireCache();
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('vim-mode-plus').then(fn);
          });
          return runs(function() {
            return restoreRequireCache();
          });
        };
        return ensureRequiredFiles = function(files) {
          var should;
          should = files.map(function(file) {
            return packPath + file;
          });
          return expect(getRequiredLibOrNodeModulePaths()).toEqual(should);
        };
      });
    });
    describe("requrie as minimum num of file as possible on startup", function() {
      var shouldRequireFilesInOrdered;
      shouldRequireFilesInOrdered = ["lib/main.coffee", "lib/base.coffee", "node_modules/delegato/lib/delegator.js", "node_modules/mixto/lib/mixin.js", "lib/settings.coffee", "lib/global-state.coffee", "lib/vim-state.coffee", "lib/mode-manager.coffee", "lib/command-table.coffee"];
      if (atom.inDevMode()) {
        shouldRequireFilesInOrdered.push('lib/developer.coffee');
      }
      it("THIS IS WORKAROUND FOR Travis-CI's", function() {
        return withCleanActivation(function() {
          return null;
        });
      });
      it("require minimum set of files", function() {
        return withCleanActivation(function() {
          return ensureRequiredFiles(shouldRequireFilesInOrdered);
        });
      });
      it("[one editor opened] require minimum set of files", function() {
        return withCleanActivation(function() {
          waitsForPromise(function() {
            return atom.workspace.open();
          });
          return runs(function() {
            var files;
            files = shouldRequireFilesInOrdered.concat('lib/status-bar-manager.coffee');
            return ensureRequiredFiles(files);
          });
        });
      });
      return it("[after motion executed] require minimum set of files", function() {
        return withCleanActivation(function() {
          waitsForPromise(function() {
            return atom.workspace.open().then(function(e) {
              return atom.commands.dispatch(e.element, 'vim-mode-plus:move-right');
            });
          });
          return runs(function() {
            var extraShouldRequireFilesInOrdered, files;
            extraShouldRequireFilesInOrdered = ["lib/status-bar-manager.coffee", "lib/operation-stack.coffee", "lib/selection-wrapper.coffee", "lib/utils.coffee", "node_modules/underscore-plus/lib/underscore-plus.js", "node_modules/underscore/underscore.js", "lib/blockwise-selection.coffee", "lib/motion.coffee", "lib/cursor-style-manager.coffee"];
            files = shouldRequireFilesInOrdered.concat(extraShouldRequireFilesInOrdered);
            return ensureRequiredFiles(files);
          });
        });
      });
    });
    return describe("command-table", function() {
      describe("initial classRegistry", function() {
        return it("contains one entry and it's Base class", function() {
          return withCleanActivation(function(pack) {
            var Base, classRegistry, keys;
            Base = pack.mainModule.provideVimModePlus().Base;
            classRegistry = Base.getClassRegistry();
            keys = Object.keys(classRegistry);
            expect(keys).toHaveLength(1);
            expect(keys[0]).toBe("Base");
            return expect(classRegistry[keys[0]]).toBe(Base);
          });
        });
      });
      describe("fully populated classRegistry", function() {
        return it("generateCommandTableByEagerLoad populate all registry eagerly", function() {
          return withCleanActivation(function(pack) {
            var Base, newRegistriesLength, oldRegistries, oldRegistriesLength;
            Base = pack.mainModule.provideVimModePlus().Base;
            oldRegistries = Base.getClassRegistry();
            oldRegistriesLength = Object.keys(oldRegistries).length;
            expect(Object.keys(oldRegistries)).toHaveLength(1);
            Base.generateCommandTableByEagerLoad();
            newRegistriesLength = Object.keys(Base.getClassRegistry()).length;
            return expect(newRegistriesLength).toBeGreaterThan(oldRegistriesLength);
          });
        });
      });
      return describe("make sure cmd-table is NOT out-of-date", function() {
        return it("generateCommandTableByEagerLoad return table which is equals to initially loaded command table", function() {
          return withCleanActivation(function(pack) {
            var Base, loadedCommandTable, newCommandTable, oldCommandTable, ref;
            Base = pack.mainModule.provideVimModePlus().Base;
            ref = [], oldCommandTable = ref[0], newCommandTable = ref[1];
            oldCommandTable = Base.commandTable;
            newCommandTable = Base.generateCommandTableByEagerLoad();
            loadedCommandTable = require('../lib/command-table');
            expect(oldCommandTable).not.toBe(newCommandTable);
            expect(loadedCommandTable).toEqual(oldCommandTable);
            return expect(loadedCommandTable).toEqual(newCommandTable);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9mYXN0LWFjdGl2YXRpb24tc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBa0JBO0FBQUEsTUFBQTs7RUFBQSxRQUFBLENBQVMsd0NBQVQsRUFBbUQsU0FBQTtBQUNqRCxRQUFBO0lBQUEsbUJBQUEsR0FBc0I7SUFDdEIsbUJBQUEsR0FBc0I7SUFFdEIsVUFBQSxDQUFXLFNBQUE7YUFDVCxJQUFBLENBQUssU0FBQTtBQUNILFlBQUE7UUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFkLENBQTBCLGVBQTFCLENBQTBDLENBQUM7UUFFdEQsK0JBQUEsR0FBa0MsU0FBQTtpQkFDaEMsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFPLENBQUMsS0FBcEIsQ0FBMEIsQ0FBQyxNQUEzQixDQUFrQyxTQUFDLENBQUQ7bUJBQ2hDLENBQUMsQ0FBQyxVQUFGLENBQWEsUUFBQSxHQUFXLEtBQXhCLENBQUEsSUFBa0MsQ0FBQyxDQUFDLFVBQUYsQ0FBYSxRQUFBLEdBQVcsY0FBeEI7VUFERixDQUFsQztRQURnQztRQUtsQyxpQkFBQSxHQUFvQixTQUFBO0FBQ2xCLGNBQUE7VUFBQSxVQUFBLEdBQWE7VUFDYixRQUFBLEdBQVcsK0JBQUEsQ0FBQTtVQUNYLFFBQVEsQ0FBQyxPQUFULENBQWlCLFNBQUMsQ0FBRDtZQUNmLFVBQVcsQ0FBQSxDQUFBLENBQVgsR0FBZ0IsT0FBTyxDQUFDLEtBQU0sQ0FBQSxDQUFBO21CQUM5QixPQUFPLE9BQU8sQ0FBQyxLQUFNLENBQUEsQ0FBQTtVQUZOLENBQWpCO0FBSUEsaUJBQU8sU0FBQTtZQUNMLFFBQVEsQ0FBQyxPQUFULENBQWlCLFNBQUMsQ0FBRDtxQkFDZixPQUFPLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBZCxHQUFtQixVQUFXLENBQUEsQ0FBQTtZQURmLENBQWpC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QUMsK0JBQUwsQ0FBQTtZQUNBLG1CQUFBLEdBQXNCLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBSSxDQUFDLGdCQUFMLENBQUEsQ0FBWixDQUFvQyxDQUFDO21CQUMzRCxNQUFBLENBQU8sbUJBQVAsQ0FBMkIsQ0FBQyxlQUE1QixDQUE0QyxtQkFBNUM7VUFSa0IsQ0FBcEI7UUFEa0UsQ0FBcEU7TUFEd0MsQ0FBMUM7YUFZQSxRQUFBLENBQVMsd0NBQVQsRUFBbUQsU0FBQTtlQUNqRCxFQUFBLENBQUcsZ0dBQUgsRUFBcUcsU0FBQTtpQkFDbkcsbUJBQUEsQ0FBb0IsU0FBQyxJQUFEO0FBQ2xCLGdCQUFBO1lBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWhCLENBQUEsQ0FBb0MsQ0FBQztZQUM1QyxNQUFxQyxFQUFyQyxFQUFDLHdCQUFELEVBQWtCO1lBRWxCLGVBQUEsR0FBa0IsSUFBSSxDQUFDO1lBQ3ZCLGVBQUEsR0FBa0IsSUFBSSxDQUFDLCtCQUFMLENBQUE7WUFDbEIsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHNCQUFSO1lBRXJCLE1BQUEsQ0FBTyxlQUFQLENBQXVCLENBQUMsR0FBRyxDQUFDLElBQTVCLENBQWlDLGVBQWpDO1lBQ0EsTUFBQSxDQUFPLGtCQUFQLENBQTBCLENBQUMsT0FBM0IsQ0FBbUMsZUFBbkM7bUJBQ0EsTUFBQSxDQUFPLGtCQUFQLENBQTBCLENBQUMsT0FBM0IsQ0FBbUMsZUFBbkM7VUFWa0IsQ0FBcEI7UUFEbUcsQ0FBckc7TUFEaUQsQ0FBbkQ7SUE3QndCLENBQTFCO0VBbEdpRCxDQUFuRDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiIyBbREFOR0VSXVxuIyBXaGF0IEknbSBkb2luZyBpbiB0aGlzIHRlc3Qtc3BlYyBpcyBTVVBFUiBoYWNreSwgYW5kIEkgZG9uJ3QgbGlrZSB0aGlzLlxuI1xuIyAtIFdoYXQgSSdtIGRvaW5nIGFuZCB3aHlcbiMgIC0gSW52YWxpZGF0ZSByZXF1aXJlLmNhY2hlIHRvIFwib2JzZXJ2ZSByZXF1aXJlZCBmaWxlIG9uIHN0YXJ0dXBcIi5cbiMgIC0gVGhlbiByZXN0b3JlIHJlcXVpcmUuY2FjaGUgdG8gb3JpZ2luYWwgc3RhdGUuXG4jXG4jIC0gSnVzdCBpbnZhbGlkYXRpbmcgaXMgbm90IGVub3VnaCB1bmxlc3MgcmVzdG9yZWluZyBvdGhlciBzcGVjIGZpbGUgZmFpbC5cbiNcbiMgLSBXaGF0IGhhcHBlbnMganVzdCBpbnZhbGlkYXRlIHJlcXVpcmUuY2FjaGUgYW5kIE5PVCByZXN0b3JlZCB0byBvcmlnaW5hbCByZXF1aXJlLmNhY2hlP1xuIyAgLSBGb3IgbW9kdWxlIHN1Y2ggbGlrZSBgZ2xvYmxhbC1zdGF0ZS5jb2ZmZWVgIGl0IGluc3RhbnRpYXRlZCBhdCByZXF1aXJlZCB0aW1lLlxuIyAgLSBJbnZhbGlkYXRpbmcgcmVxdWlyZS5jYWNoZSBmb3IgYGdsb2JhbC1zdGF0ZS5jb2ZmZWVgIG1lYW5zLCBpdCdzIHJlbG9hZGVkIGFnYWluLlxuIyAgLSBUaGlzIDJuZCByZWxvYWQgcmV0dXJuIERJRkZFUkVOVCBnbG9iYWxTdGF0ZSBpbnN0YW5jZS5cbiMgIC0gU28gZ2xvYmFsU3RhdGUgaXMgbm93IG5vIGxvbmdlciBnbG9iYWxseSByZWZlcmVuY2luZyBzYW1lIHNhbWUgb2JqZWN0LCBpdCdzIGJyb2tlbi5cbiMgIC0gVGhpcyBzaXR1YXRpb24gaXMgY2F1c2VkIGJ5IGV4cGxpY2l0IGNhY2hlIGludmFsaWRhdGlvbiBhbmQgbm90IGhhcHBlbiBpbiByZWFsIHVzYWdlLlxuI1xuIyAtIEkga25vdyB0aGlzIHNwZWMgaXMgc3RpbGwgc3VwZXIgaGFja3kgYW5kIEkgd2FudCB0byBmaW5kIHNhZmVyIHdheS5cbiMgIC0gQnV0IEkgbmVlZCB0aGlzIHNwZWMgdG8gZGV0ZWN0IHVud2FudGVkIGZpbGUgaXMgcmVxdWlyZWQgYXQgc3RhcnR1cCggdm1wIGdldCBzbG93ZXIgc3RhcnR1cCApLlxuZGVzY3JpYmUgXCJkaXJ0eSB3b3JrIGZvciBmYXN0IHBhY2thZ2UgYWN0aXZhdGlvblwiLCAtPlxuICB3aXRoQ2xlYW5BY3RpdmF0aW9uID0gbnVsbFxuICBlbnN1cmVSZXF1aXJlZEZpbGVzID0gbnVsbFxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBydW5zIC0+XG4gICAgICBwYWNrUGF0aCA9IGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKS5wYXRoXG5cbiAgICAgIGdldFJlcXVpcmVkTGliT3JOb2RlTW9kdWxlUGF0aHMgPSAtPlxuICAgICAgICBPYmplY3Qua2V5cyhyZXF1aXJlLmNhY2hlKS5maWx0ZXIgKHApIC0+XG4gICAgICAgICAgcC5zdGFydHNXaXRoKHBhY2tQYXRoICsgJ2xpYicpIG9yIHAuc3RhcnRzV2l0aChwYWNrUGF0aCArICdub2RlX21vZHVsZXMnKVxuXG4gICAgICAjIFJldHVybiBmdW5jdGlvbiB0byByZXN0b3JlIG9yaWdpbmFsIHJlcXVpcmUuY2FjaGUgb2YgaW50ZXJlc3RcbiAgICAgIGNsZWFuUmVxdWlyZUNhY2hlID0gLT5cbiAgICAgICAgc2F2ZWRDYWNoZSA9IHt9XG4gICAgICAgIG9sZFBhdGhzID0gZ2V0UmVxdWlyZWRMaWJPck5vZGVNb2R1bGVQYXRocygpXG4gICAgICAgIG9sZFBhdGhzLmZvckVhY2ggKHApIC0+XG4gICAgICAgICAgc2F2ZWRDYWNoZVtwXSA9IHJlcXVpcmUuY2FjaGVbcF1cbiAgICAgICAgICBkZWxldGUgcmVxdWlyZS5jYWNoZVtwXVxuXG4gICAgICAgIHJldHVybiAtPlxuICAgICAgICAgIG9sZFBhdGhzLmZvckVhY2ggKHApIC0+XG4gICAgICAgICAgICByZXF1aXJlLmNhY2hlW3BdID0gc2F2ZWRDYWNoZVtwXVxuICAgICAgICAgIGdldFJlcXVpcmVkTGliT3JOb2RlTW9kdWxlUGF0aHMoKS5mb3JFYWNoIChwKSAtPlxuICAgICAgICAgICAgaWYgcCBub3QgaW4gb2xkUGF0aHNcbiAgICAgICAgICAgICAgZGVsZXRlIHJlcXVpcmUuY2FjaGVbcF1cblxuICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiA9IChmbikgLT5cbiAgICAgICAgcmVzdG9yZVJlcXVpcmVDYWNoZSA9IG51bGxcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHJlc3RvcmVSZXF1aXJlQ2FjaGUgPSBjbGVhblJlcXVpcmVDYWNoZSgpXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCd2aW0tbW9kZS1wbHVzJykudGhlbihmbilcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHJlc3RvcmVSZXF1aXJlQ2FjaGUoKVxuXG4gICAgICBlbnN1cmVSZXF1aXJlZEZpbGVzID0gKGZpbGVzKSAtPlxuICAgICAgICBzaG91bGQgPSBmaWxlcy5tYXAoKGZpbGUpIC0+IHBhY2tQYXRoICsgZmlsZSlcbiAgICAgICAgZXhwZWN0KGdldFJlcXVpcmVkTGliT3JOb2RlTW9kdWxlUGF0aHMoKSkudG9FcXVhbChzaG91bGQpXG5cbiAgIyAqIFRvIHJlZHVjZSBJTyBhbmQgY29tcGlsZS1ldmFsdWF0aW9uIG9mIGpzIGZpbGUgb24gc3RhcnR1cFxuICBkZXNjcmliZSBcInJlcXVyaWUgYXMgbWluaW11bSBudW0gb2YgZmlsZSBhcyBwb3NzaWJsZSBvbiBzdGFydHVwXCIsIC0+XG4gICAgc2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkID0gW1xuICAgICAgXCJsaWIvbWFpbi5jb2ZmZWVcIlxuICAgICAgXCJsaWIvYmFzZS5jb2ZmZWVcIlxuICAgICAgXCJub2RlX21vZHVsZXMvZGVsZWdhdG8vbGliL2RlbGVnYXRvci5qc1wiXG4gICAgICBcIm5vZGVfbW9kdWxlcy9taXh0by9saWIvbWl4aW4uanNcIlxuICAgICAgXCJsaWIvc2V0dGluZ3MuY29mZmVlXCJcbiAgICAgIFwibGliL2dsb2JhbC1zdGF0ZS5jb2ZmZWVcIlxuICAgICAgXCJsaWIvdmltLXN0YXRlLmNvZmZlZVwiXG4gICAgICBcImxpYi9tb2RlLW1hbmFnZXIuY29mZmVlXCJcbiAgICAgIFwibGliL2NvbW1hbmQtdGFibGUuY29mZmVlXCJcbiAgICBdXG4gICAgaWYgYXRvbS5pbkRldk1vZGUoKVxuICAgICAgc2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkLnB1c2goJ2xpYi9kZXZlbG9wZXIuY29mZmVlJylcblxuICAgIGl0IFwiVEhJUyBJUyBXT1JLQVJPVU5EIEZPUiBUcmF2aXMtQ0knc1wiLCAtPlxuICAgICAgIyBIQUNLOlxuICAgICAgIyBBZnRlciB2ZXJ5IGZpcnN0IGNhbGwgb2YgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKVxuICAgICAgIyByZXF1aXJlLmNhY2hlIGlzIE5PVCBwb3B1bGF0ZWQgeWV0IG9uIFRyYXZpcy1DSS5cbiAgICAgICMgSXQgZG9lc24ndCBpbmNsdWRlIGxpYi9tYWluLmNvZmZlZSggdGhpcyBpcyBvZGQgc3RhdGUhICkuXG4gICAgICAjIFRoaXMgb25seSBoYXBwZW5zIGluIHZlcnkgZmlyc3QgYWN0aXZhdGlvbi5cbiAgICAgICMgU28gcHV0aW5nIGhlcmUgdXNlbGVzcyB0ZXN0IGp1c3QgYWN0aXZhdGUgcGFja2FnZSBjYW4gYmUgd29ya2Fyb3VuZC5cbiAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gLT5cbiAgICAgICAgbnVsbFxuXG4gICAgaXQgXCJyZXF1aXJlIG1pbmltdW0gc2V0IG9mIGZpbGVzXCIsIC0+XG4gICAgICB3aXRoQ2xlYW5BY3RpdmF0aW9uIC0+XG4gICAgICAgIGVuc3VyZVJlcXVpcmVkRmlsZXMoc2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkKVxuXG4gICAgaXQgXCJbb25lIGVkaXRvciBvcGVuZWRdIHJlcXVpcmUgbWluaW11bSBzZXQgb2YgZmlsZXNcIiwgLT5cbiAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBmaWxlcyA9IHNob3VsZFJlcXVpcmVGaWxlc0luT3JkZXJlZC5jb25jYXQoJ2xpYi9zdGF0dXMtYmFyLW1hbmFnZXIuY29mZmVlJylcbiAgICAgICAgICBlbnN1cmVSZXF1aXJlZEZpbGVzKGZpbGVzKVxuXG4gICAgaXQgXCJbYWZ0ZXIgbW90aW9uIGV4ZWN1dGVkXSByZXF1aXJlIG1pbmltdW0gc2V0IG9mIGZpbGVzXCIsIC0+XG4gICAgICB3aXRoQ2xlYW5BY3RpdmF0aW9uIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oKS50aGVuIChlKSAtPlxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlLmVsZW1lbnQsICd2aW0tbW9kZS1wbHVzOm1vdmUtcmlnaHQnKVxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXh0cmFTaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQgPSBbXG4gICAgICAgICAgICBcImxpYi9zdGF0dXMtYmFyLW1hbmFnZXIuY29mZmVlXCJcbiAgICAgICAgICAgIFwibGliL29wZXJhdGlvbi1zdGFjay5jb2ZmZWVcIlxuICAgICAgICAgICAgXCJsaWIvc2VsZWN0aW9uLXdyYXBwZXIuY29mZmVlXCJcbiAgICAgICAgICAgIFwibGliL3V0aWxzLmNvZmZlZVwiXG4gICAgICAgICAgICBcIm5vZGVfbW9kdWxlcy91bmRlcnNjb3JlLXBsdXMvbGliL3VuZGVyc2NvcmUtcGx1cy5qc1wiXG4gICAgICAgICAgICBcIm5vZGVfbW9kdWxlcy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuanNcIlxuICAgICAgICAgICAgXCJsaWIvYmxvY2t3aXNlLXNlbGVjdGlvbi5jb2ZmZWVcIlxuICAgICAgICAgICAgXCJsaWIvbW90aW9uLmNvZmZlZVwiXG4gICAgICAgICAgICBcImxpYi9jdXJzb3Itc3R5bGUtbWFuYWdlci5jb2ZmZWVcIlxuICAgICAgICAgIF1cbiAgICAgICAgICBmaWxlcyA9IHNob3VsZFJlcXVpcmVGaWxlc0luT3JkZXJlZC5jb25jYXQoZXh0cmFTaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQpXG4gICAgICAgICAgZW5zdXJlUmVxdWlyZWRGaWxlcyhmaWxlcylcblxuICBkZXNjcmliZSBcImNvbW1hbmQtdGFibGVcIiwgLT5cbiAgICAjICogTG9hZGluZyBhdG9tIGNvbW1hbmRzIGZyb20gcHJlLWdlbmVyYXRlZCBjb21tYW5kLXRhYmxlLlxuICAgICMgKiBXaHk/XG4gICAgIyAgdm1wIGFkZHMgYWJvdXQgMzAwIGNtZHMsIHdoaWNoIGlzIGh1Z2UsIGR5bmFtaWNhbGx5IGNhbGN1bGF0aW5nIGFuZCByZWdpc3RlciBjbWRzXG4gICAgIyAgdG9vayB2ZXJ5IGxvbmcgdGltZS5cbiAgICAjICBTbyBjYWxjbHVhdGUgbm9uLWR5bmFtaWMgcGFyIHRoZW4gc2F2ZSB0byBjb21tYW5kLXRhYmxlLmNvZmZlIGFuZCBsb2FkIGluIG9uIHN0YXJ0dXAuXG4gICAgIyAgV2hlbiBjb21tYW5kIGFyZSBleGVjdXRlZCwgbmVjZXNzYXJ5IGNvbW1hbmQgY2xhc3MgZmlsZSBpcyBsYXp5LXJlcXVpcmVkLlxuICAgIGRlc2NyaWJlIFwiaW5pdGlhbCBjbGFzc1JlZ2lzdHJ5XCIsIC0+XG4gICAgICBpdCBcImNvbnRhaW5zIG9uZSBlbnRyeSBhbmQgaXQncyBCYXNlIGNsYXNzXCIsIC0+XG4gICAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gKHBhY2spIC0+XG4gICAgICAgICAgQmFzZSA9IHBhY2subWFpbk1vZHVsZS5wcm92aWRlVmltTW9kZVBsdXMoKS5CYXNlXG4gICAgICAgICAgY2xhc3NSZWdpc3RyeSA9IEJhc2UuZ2V0Q2xhc3NSZWdpc3RyeSgpXG4gICAgICAgICAga2V5cyA9IE9iamVjdC5rZXlzKGNsYXNzUmVnaXN0cnkpXG4gICAgICAgICAgZXhwZWN0KGtleXMpLnRvSGF2ZUxlbmd0aCgxKVxuICAgICAgICAgIGV4cGVjdChrZXlzWzBdKS50b0JlKFwiQmFzZVwiKVxuICAgICAgICAgIGV4cGVjdChjbGFzc1JlZ2lzdHJ5W2tleXNbMF1dKS50b0JlKEJhc2UpXG5cbiAgICBkZXNjcmliZSBcImZ1bGx5IHBvcHVsYXRlZCBjbGFzc1JlZ2lzdHJ5XCIsIC0+XG4gICAgICBpdCBcImdlbmVyYXRlQ29tbWFuZFRhYmxlQnlFYWdlckxvYWQgcG9wdWxhdGUgYWxsIHJlZ2lzdHJ5IGVhZ2VybHlcIiwgLT5cbiAgICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAocGFjaykgLT5cbiAgICAgICAgICBCYXNlID0gcGFjay5tYWluTW9kdWxlLnByb3ZpZGVWaW1Nb2RlUGx1cygpLkJhc2VcbiAgICAgICAgICBvbGRSZWdpc3RyaWVzID0gQmFzZS5nZXRDbGFzc1JlZ2lzdHJ5KClcbiAgICAgICAgICBvbGRSZWdpc3RyaWVzTGVuZ3RoID0gT2JqZWN0LmtleXMob2xkUmVnaXN0cmllcykubGVuZ3RoXG4gICAgICAgICAgZXhwZWN0KE9iamVjdC5rZXlzKG9sZFJlZ2lzdHJpZXMpKS50b0hhdmVMZW5ndGgoMSlcblxuICAgICAgICAgIEJhc2UuZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZCgpXG4gICAgICAgICAgbmV3UmVnaXN0cmllc0xlbmd0aCA9IE9iamVjdC5rZXlzKEJhc2UuZ2V0Q2xhc3NSZWdpc3RyeSgpKS5sZW5ndGhcbiAgICAgICAgICBleHBlY3QobmV3UmVnaXN0cmllc0xlbmd0aCkudG9CZUdyZWF0ZXJUaGFuKG9sZFJlZ2lzdHJpZXNMZW5ndGgpXG5cbiAgICBkZXNjcmliZSBcIm1ha2Ugc3VyZSBjbWQtdGFibGUgaXMgTk9UIG91dC1vZi1kYXRlXCIsIC0+XG4gICAgICBpdCBcImdlbmVyYXRlQ29tbWFuZFRhYmxlQnlFYWdlckxvYWQgcmV0dXJuIHRhYmxlIHdoaWNoIGlzIGVxdWFscyB0byBpbml0aWFsbHkgbG9hZGVkIGNvbW1hbmQgdGFibGVcIiwgLT5cbiAgICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAocGFjaykgLT5cbiAgICAgICAgICBCYXNlID0gcGFjay5tYWluTW9kdWxlLnByb3ZpZGVWaW1Nb2RlUGx1cygpLkJhc2VcbiAgICAgICAgICBbb2xkQ29tbWFuZFRhYmxlLCBuZXdDb21tYW5kVGFibGVdID0gW11cblxuICAgICAgICAgIG9sZENvbW1hbmRUYWJsZSA9IEJhc2UuY29tbWFuZFRhYmxlXG4gICAgICAgICAgbmV3Q29tbWFuZFRhYmxlID0gQmFzZS5nZW5lcmF0ZUNvbW1hbmRUYWJsZUJ5RWFnZXJMb2FkKClcbiAgICAgICAgICBsb2FkZWRDb21tYW5kVGFibGUgPSByZXF1aXJlKCcuLi9saWIvY29tbWFuZC10YWJsZScpXG5cbiAgICAgICAgICBleHBlY3Qob2xkQ29tbWFuZFRhYmxlKS5ub3QudG9CZShuZXdDb21tYW5kVGFibGUpXG4gICAgICAgICAgZXhwZWN0KGxvYWRlZENvbW1hbmRUYWJsZSkudG9FcXVhbChvbGRDb21tYW5kVGFibGUpXG4gICAgICAgICAgZXhwZWN0KGxvYWRlZENvbW1hbmRUYWJsZSkudG9FcXVhbChuZXdDb21tYW5kVGFibGUpXG4iXX0=
