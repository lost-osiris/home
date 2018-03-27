(function() {
  var LB, chai, defaultConfig, expect, fs, grammarTest, path, temp;

  chai = require('../node_modules/chai');

  expect = chai.expect;

  fs = require('fs-plus');

  path = require('path');

  defaultConfig = require('./default-config');

  grammarTest = require('atom-grammar-test');

  temp = require('temp');

  LB = 'language-babel';

  describe('language-babel', function() {
    var config, lb;
    lb = null;
    config = {};
    beforeEach(function() {
      temp.cleanup();
      waitsForPromise(function() {
        return atom.packages.activatePackage(LB);
      });
      config = JSON.parse(JSON.stringify(defaultConfig));
      return runs(function() {
        return lb = atom.packages.getActivePackage(LB).mainModule.transpiler;
      });
    });
    describe('Reading real config', function() {
      return it('should read all possible configuration keys', function() {
        var key, realConfig, results, value;
        realConfig = lb.getConfig();
        results = [];
        for (key in config) {
          value = config[key];
          results.push(expect(realConfig).to.contain.all.keys(key));
        }
        return results;
      });
    });
    describe(':getPaths', function() {
      if (!process.platform.match(/^win/)) {
        it('returns paths for a named sourcefile with default config', function() {
          var ret, tempProj1, tempProj2;
          tempProj1 = temp.mkdirSync();
          tempProj2 = temp.mkdirSync();
          atom.project.setPaths([tempProj1, tempProj2]);
          ret = lb.getPaths(tempProj1 + '/source/dira/fauxfile.js', config);
          expect(ret.sourceFile).to.equal(tempProj1 + '/source/dira/fauxfile.js');
          expect(ret.sourceFileDir).to.equal(tempProj1 + '/source/dira');
          expect(ret.mapFile).to.equal(tempProj1 + '/source/dira/fauxfile.js.map');
          expect(ret.transpiledFile).to.equal(tempProj1 + '/source/dira/fauxfile.js');
          expect(ret.sourceRoot).to.equal(tempProj1);
          return expect(ret.projectPath).to.equal(tempProj1);
        });
        it('returns paths config with target & source paths set', function() {
          var ret, tempProj1, tempProj2;
          tempProj1 = temp.mkdirSync();
          tempProj2 = temp.mkdirSync();
          atom.project.setPaths([tempProj1, tempProj2]);
          config.babelSourcePath = '/source';
          config.babelMapsPath = 'mapspath';
          config.babelTranspilePath = '/transpath';
          ret = lb.getPaths(tempProj1 + '/source/dira/fauxfile.js', config);
          expect(ret.sourceFile).to.equal(tempProj1 + '/source/dira/fauxfile.js');
          expect(ret.sourceFileDir).to.equal(tempProj1 + '/source/dira');
          expect(ret.mapFile).to.equal(tempProj1 + '/mapspath/dira/fauxfile.js.map');
          expect(ret.transpiledFile).to.equal(tempProj1 + '/transpath/dira/fauxfile.js');
          expect(ret.sourceRoot).to.equal(tempProj1 + '/source');
          return expect(ret.projectPath).to.equal(tempProj1);
        });
        it('returns correct paths with project in root directory', function() {
          var ret, tempProj1, tempProj2;
          tempProj1 = temp.mkdirSync();
          tempProj2 = temp.mkdirSync();
          atom.project.setPaths(['/']);
          config.babelSourcePath = 'source';
          config.babelMapsPath = 'mapspath';
          config.babelTranspilePath = 'transpath';
          ret = lb.getPaths('/source/dira/fauxfile.js', config);
          expect(ret.sourceFile).to.equal('/source/dira/fauxfile.js');
          expect(ret.sourceFileDir).to.equal('/source/dira');
          expect(ret.mapFile).to.equal('/mapspath/dira/fauxfile.js.map');
          expect(ret.transpiledFile).to.equal('/transpath/dira/fauxfile.js');
          expect(ret.sourceRoot).to.equal('/source');
          return expect(ret.projectPath).to.equal('/');
        });
      }
      if (process.platform.match(/^win/)) {
        it('returns paths for a named sourcefile with default config', function() {
          var ret, tempProj1, tempProj2;
          tempProj1 = temp.mkdirSync();
          tempProj2 = temp.mkdirSync();
          atom.project.setPaths([tempProj1, tempProj2]);
          ret = lb.getPaths(tempProj1 + '\\source\\dira\\fauxfile.js', config);
          expect(ret.sourceFile).to.equal(tempProj1 + '\\source\\dira\\fauxfile.js');
          expect(ret.sourceFileDir).to.equal(tempProj1 + '\\source\\dira');
          expect(ret.mapFile).to.equal(tempProj1 + '\\source\\dira\\fauxfile.js.map');
          expect(ret.transpiledFile).to.equal(tempProj1 + '\\source\\dira\\fauxfile.js');
          expect(ret.sourceRoot).to.equal(tempProj1);
          return expect(ret.projectPath).to.equal(tempProj1);
        });
        it('returns paths config with target & source paths set', function() {
          var ret, tempProj1, tempProj2;
          tempProj1 = temp.mkdirSync();
          tempProj2 = temp.mkdirSync();
          atom.project.setPaths([tempProj1, tempProj2]);
          config.babelSourcePath = '\\source';
          config.babelMapsPath = 'mapspath';
          config.babelTranspilePath = '\\transpath';
          ret = lb.getPaths(tempProj1 + '\\source\\dira\\fauxfile.js', config);
          expect(ret.sourceFile).to.equal(tempProj1 + '\\source\\dira\\fauxfile.js');
          expect(ret.sourceFileDir).to.equal(tempProj1 + '\\source\\dira');
          expect(ret.mapFile).to.equal(tempProj1 + '\\mapspath\\dira\\fauxfile.js.map');
          expect(ret.transpiledFile).to.equal(tempProj1 + '\\transpath\\dira\\fauxfile.js');
          expect(ret.sourceRoot).to.equal(tempProj1 + '\\source');
          return expect(ret.projectPath).to.equal(tempProj1);
        });
        return it('returns correct paths with project in root directory', function() {
          var ret;
          atom.project.setPaths(['C:\\']);
          config.babelSourcePath = 'source';
          config.babelMapsPath = 'mapspath';
          config.babelTranspilePath = 'transpath';
          ret = lb.getPaths('C:\\source\\dira\\fauxfile.js', config);
          expect(ret.sourceFile).to.equal('C:\\source\\dira\\fauxfile.js');
          expect(ret.sourceFileDir).to.equal('C:\\source\\dira');
          expect(ret.mapFile).to.equal('C:\\mapspath\\dira\\fauxfile.js.map');
          expect(ret.transpiledFile).to.equal('C:\\transpath\\dira\\fauxfile.js');
          expect(ret.sourceRoot).to.equal('C:\\source');
          return expect(ret.projectPath).to.equal('C:\\');
        });
      }
    });
    return describe(':transpile', function() {
      var notification, notificationSpy, writeFileName, writeFileStub;
      notificationSpy = null;
      notification = null;
      writeFileStub = null;
      writeFileName = null;
      beforeEach(function() {
        notificationSpy = jasmine.createSpy('notificationSpy');
        notification = atom.notifications.onDidAddNotification(notificationSpy);
        writeFileName = null;
        return writeFileStub = spyOn(fs, 'writeFileSync').andCallFake(function(path) {
          return writeFileName = path;
        });
      });
      afterEach(function() {
        return notification.dispose();
      });
      describe('when transpileOnSave is false', function() {
        return it('does nothing', function() {
          config.transpileOnSave = false;
          spyOn(lb, 'getConfig').andCallFake(function() {
            return config;
          });
          lb.transpile('somefilename');
          expect(notificationSpy.callCount).to.equal(0);
          return expect(writeFileStub.callCount).to.equal(0);
        });
      });
      describe('When a source file is outside the "babelSourcePath" & suppress msgs false', function() {
        return it('notifies sourcefile is not inside sourcepath', function() {
          var msg, type;
          atom.project.setPaths([__dirname]);
          config.babelSourcePath = 'fixtures';
          config.babelTranspilePath = 'fixtures';
          config.babelMapsPath = 'fixtures';
          spyOn(lb, 'getConfig').andCallFake(function() {
            return config;
          });
          lb.transpile(__dirname + '/fake.js');
          expect(notificationSpy.callCount).to.equal(1);
          msg = notificationSpy.calls[0].args[0].message;
          type = notificationSpy.calls[0].args[0].type;
          expect(msg).to.match(/^LB: Babel file is not inside/);
          return expect(writeFileStub.callCount).to.equal(0);
        });
      });
      describe('When a source file is outside the "babelSourcePath" & suppress msgs true', function() {
        return it('exects no notifications', function() {
          atom.project.setPaths([__dirname]);
          config.babelSourcePath = 'fixtures';
          config.babelTranspilePath = 'fixtures';
          config.babelMapsPath = 'fixtures';
          config.suppressSourcePathMessages = true;
          spyOn(lb, 'getConfig').andCallFake(function() {
            return config;
          });
          lb.transpile(__dirname + '/fake.js');
          expect(notificationSpy.callCount).to.equal(0);
          return expect(writeFileStub.callCount).to.equal(0);
        });
      });
      describe('When a js files is transpiled and gets an error', function() {
        return it('it issues a notification error message', function() {
          atom.project.setPaths([__dirname]);
          config.babelSourcePath = 'fixtures';
          config.babelTranspilePath = 'fixtures';
          config.babelMapsPath = 'fixtures';
          spyOn(lb, 'getConfig').andCallFake(function() {
            return config;
          });
          lb.transpile(path.resolve(__dirname, 'fixtures/dira/dira.1/dira.2/bad.js'));
          waitsFor(function() {
            return notificationSpy.callCount;
          });
          return runs(function() {
            var msg;
            expect(notificationSpy.callCount).to.equal(1);
            msg = notificationSpy.calls[0].args[0].message;
            expect(msg).to.match(/^LB: Babel.*Transpiler Error/);
            return expect(writeFileStub.callCount).to.equal(0);
          });
        });
      });
      describe('When a js file saved but no output is set', function() {
        return it('calls the transpiler but doesnt save output', function() {
          atom.project.setPaths([__dirname]);
          config.babelSourcePath = 'fixtures';
          config.babelTranspilePath = 'fixtures';
          config.babelMapsPath = 'fixtures';
          config.createTranspiledCode = false;
          spyOn(lb, 'getConfig').andCallFake(function() {
            return config;
          });
          lb.transpile(path.resolve(__dirname, 'fixtures/dira/dira.1/dira.2/react.jsx'));
          waitsFor(function() {
            return notificationSpy.callCount > 1;
          });
          return runs(function() {
            var msg;
            expect(notificationSpy.callCount).to.equal(2);
            msg = notificationSpy.calls[0].args[0].message;
            expect(msg).to.match(/^LB: Babel.*Transpiler Success/);
            msg = notificationSpy.calls[1].args[0].message;
            expect(msg).to.match(/^LB: No transpiled output configured/);
            return expect(writeFileStub.callCount).to.equal(0);
          });
        });
      });
      describe('When a js file saved but no transpile path is set', function() {
        return it('calls the transpiler and transpiles OK but doesnt save and issues msg', function() {
          atom.project.setPaths([__dirname]);
          config.babelSourcePath = 'fixtures';
          config.babelTranspilePath = 'fixtures';
          config.babelMapsPath = 'fixtures';
          spyOn(lb, 'getConfig').andCallFake(function() {
            return config;
          });
          lb.transpile(path.resolve(__dirname, 'fixtures/dira/dira.1/dira.2/good.js'));
          waitsFor(function() {
            return notificationSpy.callCount > 1;
          });
          return runs(function() {
            var msg;
            expect(notificationSpy.callCount).to.equal(2);
            msg = notificationSpy.calls[0].args[0].message;
            expect(msg).to.match(/^LB: Babel.*Transpiler Success/);
            msg = notificationSpy.calls[1].args[0].message;
            expect(msg).to.match(/^LB: Transpiled file would overwrite source file/);
            return expect(writeFileStub.callCount).to.equal(0);
          });
        });
      });
      describe('When a jsx file saved,transpile path is set, source maps enabled', function() {
        return it('calls the transpiler and transpiles OK, saves as .js and issues msg', function() {
          atom.project.setPaths([__dirname]);
          config.babelSourcePath = 'fixtures';
          config.babelTranspilePath = 'fixtures-transpiled';
          config.babelMapsPath = 'fixtures-maps';
          config.createMap = true;
          spyOn(lb, 'getConfig').andCallFake(function() {
            return config;
          });
          lb.transpile(path.resolve(__dirname, 'fixtures/dira/dira.1/dira.2/react.jsx'));
          waitsFor(function() {
            return writeFileStub.callCount;
          });
          return runs(function() {
            var expectedFileName, msg, savedFilename;
            expect(notificationSpy.callCount).to.equal(1);
            msg = notificationSpy.calls[0].args[0].message;
            expect(msg).to.match(/^LB: Babel.*Transpiler Success/);
            expect(writeFileStub.callCount).to.equal(2);
            savedFilename = writeFileStub.calls[0].args[0];
            expectedFileName = path.resolve(__dirname, 'fixtures-transpiled/dira/dira.1/dira.2/react.js');
            expect(savedFilename).to.equal(expectedFileName);
            savedFilename = writeFileStub.calls[1].args[0];
            expectedFileName = path.resolve(__dirname, 'fixtures-maps/dira/dira.1/dira.2/react.js.map');
            return expect(savedFilename).to.equal(expectedFileName);
          });
        });
      });
      describe('When a jsx file saved,transpile path is set, source maps enabled, success suppressed', function() {
        return it('calls the transpiler and transpiles OK, saves as .js and issues msg', function() {
          atom.project.setPaths([__dirname]);
          config.babelSourcePath = 'fixtures';
          config.babelTranspilePath = 'fixtures-transpiled';
          config.babelMapsPath = 'fixtures-maps';
          config.createMap = true;
          config.suppressTranspileOnSaveMessages = true;
          spyOn(lb, 'getConfig').andCallFake(function() {
            return config;
          });
          lb.transpile(path.resolve(__dirname, 'fixtures/dira/dira.1/dira.2/react.jsx'));
          waitsFor(function() {
            return writeFileStub.callCount;
          });
          return runs(function() {
            var expectedFileName, savedFilename;
            expect(notificationSpy.callCount).to.equal(0);
            expect(writeFileStub.callCount).to.equal(2);
            savedFilename = writeFileStub.calls[0].args[0];
            expectedFileName = path.resolve(__dirname, 'fixtures-transpiled/dira/dira.1/dira.2/react.js');
            expect(savedFilename).to.equal(expectedFileName);
            savedFilename = writeFileStub.calls[1].args[0];
            expectedFileName = path.resolve(__dirname, 'fixtures-maps/dira/dira.1/dira.2/react.js.map');
            return expect(savedFilename).to.equal(expectedFileName);
          });
        });
      });
      describe('When a js file saved , babelrc in path and flag disableWhenNoBabelrcFileInPath is set', function() {
        return it('calls the transpiler', function() {
          atom.project.setPaths([__dirname]);
          config.babelSourcePath = 'fixtures';
          config.babelTranspilePath = 'fixtures';
          config.babelMapsPath = 'fixtures';
          config.createTranspiledCode = false;
          config.disableWhenNoBabelrcFileInPath = true;
          spyOn(lb, 'getConfig').andCallFake(function() {
            return config;
          });
          lb.transpile(path.resolve(__dirname, 'fixtures/dira/dira.1/dira.2/good.js'));
          waitsFor(function() {
            return notificationSpy.callCount;
          });
          return runs(function() {
            var msg;
            expect(notificationSpy.callCount).to.equal(2);
            msg = notificationSpy.calls[0].args[0].message;
            expect(msg).to.match(/^LB: Babel.*Transpiler Success/);
            msg = notificationSpy.calls[1].args[0].message;
            expect(msg).to.match(/^LB: No transpiled output configured/);
            return expect(writeFileStub.callCount).to.equal(0);
          });
        });
      });
      describe('When a js file saved , babelrc in not in path and flag disableWhenNoBabelrcFileInPath is set', function() {
        return it('does nothing', function() {
          atom.project.setPaths([__dirname]);
          config.babelSourcePath = 'fixtures';
          config.babelTranspilePath = 'fixtures';
          config.babelMapsPath = 'fixtures';
          config.createTranspiledCode = false;
          config.disableWhenNoBabelrcFileInPath = true;
          spyOn(lb, 'getConfig').andCallFake(function() {
            return config;
          });
          lb.transpile(path.resolve(__dirname, 'fixtures/dirb/good.js'));
          expect(notificationSpy.callCount).to.equal(0);
          return expect(writeFileStub.callCount).to.equal(0);
        });
      });
      describe('When a js file saved in a nested project', function() {
        return it('creates a file in the correct location based upon .languagebabel', function() {
          var sourceFile, targetFile;
          atom.project.setPaths([__dirname]);
          config.allowLocalOverride = true;
          spyOn(lb, 'getConfig').andCallFake(function() {
            return config;
          });
          sourceFile = path.resolve(__dirname, 'fixtures/projectRoot/src/test.js');
          targetFile = path.resolve(__dirname, 'fixtures/projectRoot/test.js');
          lb.transpile(sourceFile);
          waitsFor(function() {
            return writeFileStub.callCount;
          });
          return runs(function() {
            return expect(writeFileName).to.equal(targetFile);
          });
        });
      });
      return describe('When a directory is compiled', function() {
        return it('transpiles the js,jsx,es,es6,babel files but ignores minified files', function() {
          var sourceDir;
          atom.project.setPaths([__dirname]);
          config.allowLocalOverride = true;
          spyOn(lb, 'getConfig').andCallFake(function() {
            return config;
          });
          sourceDir = path.resolve(__dirname, 'fixtures/projectRoot/src/');
          lb.transpileDirectory({
            directory: sourceDir
          });
          waitsFor(function() {
            return writeFileStub.callCount >= 5;
          });
          return runs(function() {
            return expect(writeFileStub.callCount).to.equal(5);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWJhYmVsL3NwZWMvdHJhbnNwaWxlLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLHNCQUFSOztFQUNQLE1BQUEsR0FBUyxJQUFJLENBQUM7O0VBQ2QsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUjs7RUFDaEIsV0FBQSxHQUFjLE9BQUEsQ0FBUSxtQkFBUjs7RUFDZCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsRUFBQSxHQUFLOztFQVFMLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO0FBQ3pCLFFBQUE7SUFBQSxFQUFBLEdBQUs7SUFDTCxNQUFBLEdBQVU7SUFDVixVQUFBLENBQVcsU0FBQTtNQUNULElBQUksQ0FBQyxPQUFMLENBQUE7TUFDQSxlQUFBLENBQWdCLFNBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsRUFBOUI7TUFEYyxDQUFoQjtNQUVBLE1BQUEsR0FBUyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxTQUFMLENBQWUsYUFBZixDQUFYO2FBRVQsSUFBQSxDQUFLLFNBQUE7ZUFDSCxFQUFBLEdBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixFQUEvQixDQUFrQyxDQUFDLFVBQVUsQ0FBQztNQURoRCxDQUFMO0lBTlMsQ0FBWDtJQVNBLFFBQUEsQ0FBUyxxQkFBVCxFQUFnQyxTQUFBO2FBQzlCLEVBQUEsQ0FBRyw2Q0FBSCxFQUFrRCxTQUFBO0FBQ2hELFlBQUE7UUFBQSxVQUFBLEdBQWEsRUFBRSxDQUFDLFNBQUgsQ0FBQTtBQUNiO2FBQUEsYUFBQTs7dUJBQUEs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VUFFNUIsS0FBQSxDQUFNLEVBQU4sRUFBVSxXQUFWLENBQXNCLENBQUMsV0FBdkIsQ0FBbUMsU0FBQTttQkFBRztVQUFILENBQW5DO1VBQ0EsU0FBQSxHQUFZLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QiwyQkFBeEI7VUFDWixFQUFFLENBQUMsa0JBQUgsQ0FBc0I7WUFBQyxTQUFBLEVBQVcsU0FBWjtXQUF0QjtVQUNBLFFBQUEsQ0FBUyxTQUFBO21CQUNQLGFBQWEsQ0FBQyxTQUFkLElBQTJCO1VBRHBCLENBQVQ7aUJBRUEsSUFBQSxDQUFLLFNBQUE7bUJBQ0gsTUFBQSxDQUFPLGFBQWEsQ0FBQyxTQUFyQixDQUErQixDQUFDLEVBQUUsQ0FBQyxLQUFuQyxDQUF5QyxDQUF6QztVQURHLENBQUw7UUFUd0UsQ0FBMUU7TUFEdUMsQ0FBekM7SUFuTnFCLENBQXZCO0VBbkh5QixDQUEzQjtBQWhCQSIsInNvdXJjZXNDb250ZW50IjpbImNoYWkgPSByZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvY2hhaSdcbmV4cGVjdCA9IGNoYWkuZXhwZWN0XG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbmRlZmF1bHRDb25maWcgPSByZXF1aXJlICcuL2RlZmF1bHQtY29uZmlnJ1xuZ3JhbW1hclRlc3QgPSByZXF1aXJlICdhdG9tLWdyYW1tYXItdGVzdCdcbnRlbXAgPSByZXF1aXJlKCd0ZW1wJyk7XG5cbkxCID0gJ2xhbmd1YWdlLWJhYmVsJ1xuIyB3ZSB1c2UgYXRvbSBzZXRQYXRocyBpbiB0aGlzIHNwZWMuIHNldFBhdGhzIGNoZWNrcyBpZiBkaXJlY3RvcmllcyBleGlzdFxuIyB0aHVzOi0gc2V0UGF0aHMoWycvcm9vdC9Qcm9qZWN0MSddKSBtYXkgZmluZCAvcm9vdCBidXQgbm90IC9yb290L1Byb2plY3QxXG4jIGFuZCBzZXRzIHRoZSBwcm9qIGRpciBhcyAvcm9vdCByYXRoZXIgdGhhbiAvcm9vdC9Qcm9qZWN0MS4gSWYgL3Jvb3QvUHJvamVjdDFcbiMgd2VyZSBubyBmb3VuZCwgYXRvbSBzZXRzIHRoZSBkaXJlY3RvcnkgdG8gdGhlIGZ1bGwgbmFtZS5cbiMgV2UgbmVlZCBzb21lIHByZWZpeCBkaXJlY3RvcnkgZmF1eCBuYW1lcyBmb3IgcG9zaXggYW5kIHdpbmRvd3MgdG8gZW5zdXJlXG4jIHdlIGFsd2F5cyBnZXQgYSBwcm9qZWN0IG5hbWUgd2Ugc2V0XG5cbmRlc2NyaWJlICdsYW5ndWFnZS1iYWJlbCcsIC0+XG4gIGxiID0gbnVsbFxuICBjb25maWcgPSAge31cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHRlbXAuY2xlYW51cCgpXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShMQilcbiAgICBjb25maWcgPSBKU09OLnBhcnNlIEpTT04uc3RyaW5naWZ5IGRlZmF1bHRDb25maWdcblxuICAgIHJ1bnMgLT5cbiAgICAgIGxiID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKExCKS5tYWluTW9kdWxlLnRyYW5zcGlsZXJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGRlc2NyaWJlICdSZWFkaW5nIHJlYWwgY29uZmlnJywgLT5cbiAgICBpdCAnc2hvdWxkIHJlYWQgYWxsIHBvc3NpYmxlIGNvbmZpZ3VyYXRpb24ga2V5cycsIC0+XG4gICAgICByZWFsQ29uZmlnID0gbGIuZ2V0Q29uZmlnKClcbiAgICAgIGV4cGVjdChyZWFsQ29uZmlnKS50by5jb250YWluLmFsbC5rZXlzIGtleSBmb3Iga2V5LCB2YWx1ZSBvZiBjb25maWdcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGRlc2NyaWJlICc6Z2V0UGF0aHMnLCAtPlxuXG4gICAgaWYgbm90IHByb2Nlc3MucGxhdGZvcm0ubWF0Y2ggL153aW4vXG4gICAgICBpdCAncmV0dXJucyBwYXRocyBmb3IgYSBuYW1lZCBzb3VyY2VmaWxlIHdpdGggZGVmYXVsdCBjb25maWcnLCAtPlxuICAgICAgICB0ZW1wUHJvajEgPSB0ZW1wLm1rZGlyU3luYygpXG4gICAgICAgIHRlbXBQcm9qMiA9IHRlbXAubWtkaXJTeW5jKClcbiAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFt0ZW1wUHJvajEsdGVtcFByb2oyXSlcblxuICAgICAgICByZXQgPSBsYi5nZXRQYXRocyh0ZW1wUHJvajErJy9zb3VyY2UvZGlyYS9mYXV4ZmlsZS5qcycsY29uZmlnKVxuXG4gICAgICAgIGV4cGVjdChyZXQuc291cmNlRmlsZSkudG8uZXF1YWwodGVtcFByb2oxKycvc291cmNlL2RpcmEvZmF1eGZpbGUuanMnKVxuICAgICAgICBleHBlY3QocmV0LnNvdXJjZUZpbGVEaXIpLnRvLmVxdWFsKHRlbXBQcm9qMSsnL3NvdXJjZS9kaXJhJylcbiAgICAgICAgZXhwZWN0KHJldC5tYXBGaWxlKS50by5lcXVhbCh0ZW1wUHJvajErJy9zb3VyY2UvZGlyYS9mYXV4ZmlsZS5qcy5tYXAnKVxuICAgICAgICBleHBlY3QocmV0LnRyYW5zcGlsZWRGaWxlKS50by5lcXVhbCh0ZW1wUHJvajErJy9zb3VyY2UvZGlyYS9mYXV4ZmlsZS5qcycpXG4gICAgICAgIGV4cGVjdChyZXQuc291cmNlUm9vdCkudG8uZXF1YWwodGVtcFByb2oxKVxuICAgICAgICBleHBlY3QocmV0LnByb2plY3RQYXRoKS50by5lcXVhbCh0ZW1wUHJvajEpXG5cbiAgICAgIGl0ICdyZXR1cm5zIHBhdGhzIGNvbmZpZyB3aXRoIHRhcmdldCAmIHNvdXJjZSBwYXRocyBzZXQnLCAtPlxuICAgICAgICB0ZW1wUHJvajEgPSB0ZW1wLm1rZGlyU3luYygpXG4gICAgICAgIHRlbXBQcm9qMiA9IHRlbXAubWtkaXJTeW5jKClcbiAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFt0ZW1wUHJvajEsdGVtcFByb2oyXSlcbiAgICAgICAgY29uZmlnLmJhYmVsU291cmNlUGF0aCA9ICcvc291cmNlJyAjIHdpdGggZGlyIHByZWZpeFxuICAgICAgICBjb25maWcuYmFiZWxNYXBzUGF0aCA9J21hcHNwYXRoJyAjIGFuZCB3aXRob3V0XG4gICAgICAgIGNvbmZpZy5iYWJlbFRyYW5zcGlsZVBhdGggPSAnL3RyYW5zcGF0aCdcblxuICAgICAgICByZXQgPSBsYi5nZXRQYXRocyh0ZW1wUHJvajErJy9zb3VyY2UvZGlyYS9mYXV4ZmlsZS5qcycsY29uZmlnKVxuXG4gICAgICAgIGV4cGVjdChyZXQuc291cmNlRmlsZSkudG8uZXF1YWwodGVtcFByb2oxKycvc291cmNlL2RpcmEvZmF1eGZpbGUuanMnKVxuICAgICAgICBleHBlY3QocmV0LnNvdXJjZUZpbGVEaXIpLnRvLmVxdWFsKHRlbXBQcm9qMSsnL3NvdXJjZS9kaXJhJylcbiAgICAgICAgZXhwZWN0KHJldC5tYXBGaWxlKS50by5lcXVhbCh0ZW1wUHJvajErJy9tYXBzcGF0aC9kaXJhL2ZhdXhmaWxlLmpzLm1hcCcpXG4gICAgICAgIGV4cGVjdChyZXQudHJhbnNwaWxlZEZpbGUpLnRvLmVxdWFsKHRlbXBQcm9qMSsnL3RyYW5zcGF0aC9kaXJhL2ZhdXhmaWxlLmpzJylcbiAgICAgICAgZXhwZWN0KHJldC5zb3VyY2VSb290KS50by5lcXVhbCh0ZW1wUHJvajErJy9zb3VyY2UnKVxuICAgICAgICBleHBlY3QocmV0LnByb2plY3RQYXRoKS50by5lcXVhbCh0ZW1wUHJvajEpXG5cbiAgICAgIGl0ICdyZXR1cm5zIGNvcnJlY3QgcGF0aHMgd2l0aCBwcm9qZWN0IGluIHJvb3QgZGlyZWN0b3J5JywgLT5cbiAgICAgICAgdGVtcFByb2oxID0gdGVtcC5ta2RpclN5bmMoKVxuICAgICAgICB0ZW1wUHJvajIgPSB0ZW1wLm1rZGlyU3luYygpXG4gICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbJy8nXSlcbiAgICAgICAgY29uZmlnLmJhYmVsU291cmNlUGF0aCA9ICdzb3VyY2UnXG4gICAgICAgIGNvbmZpZy5iYWJlbE1hcHNQYXRoID0nbWFwc3BhdGgnXG4gICAgICAgIGNvbmZpZy5iYWJlbFRyYW5zcGlsZVBhdGggPSAndHJhbnNwYXRoJ1xuXG4gICAgICAgIHJldCA9IGxiLmdldFBhdGhzKCcvc291cmNlL2RpcmEvZmF1eGZpbGUuanMnLGNvbmZpZylcblxuICAgICAgICBleHBlY3QocmV0LnNvdXJjZUZpbGUpLnRvLmVxdWFsKCcvc291cmNlL2RpcmEvZmF1eGZpbGUuanMnKVxuICAgICAgICBleHBlY3QocmV0LnNvdXJjZUZpbGVEaXIpLnRvLmVxdWFsKCcvc291cmNlL2RpcmEnKVxuICAgICAgICBleHBlY3QocmV0Lm1hcEZpbGUpLnRvLmVxdWFsKCcvbWFwc3BhdGgvZGlyYS9mYXV4ZmlsZS5qcy5tYXAnKVxuICAgICAgICBleHBlY3QocmV0LnRyYW5zcGlsZWRGaWxlKS50by5lcXVhbCgnL3RyYW5zcGF0aC9kaXJhL2ZhdXhmaWxlLmpzJylcbiAgICAgICAgZXhwZWN0KHJldC5zb3VyY2VSb290KS50by5lcXVhbCgnL3NvdXJjZScpXG4gICAgICAgIGV4cGVjdChyZXQucHJvamVjdFBhdGgpLnRvLmVxdWFsKCcvJylcblxuICAgIGlmIHByb2Nlc3MucGxhdGZvcm0ubWF0Y2ggL153aW4vXG4gICAgICBpdCAncmV0dXJucyBwYXRocyBmb3IgYSBuYW1lZCBzb3VyY2VmaWxlIHdpdGggZGVmYXVsdCBjb25maWcnLCAtPlxuICAgICAgICB0ZW1wUHJvajEgPSB0ZW1wLm1rZGlyU3luYygpXG4gICAgICAgIHRlbXBQcm9qMiA9IHRlbXAubWtkaXJTeW5jKClcbiAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFt0ZW1wUHJvajEsdGVtcFByb2oyXSlcblxuICAgICAgICByZXQgPSBsYi5nZXRQYXRocyh0ZW1wUHJvajErJ1xcXFxzb3VyY2VcXFxcZGlyYVxcXFxmYXV4ZmlsZS5qcycsY29uZmlnKVxuXG4gICAgICAgIGV4cGVjdChyZXQuc291cmNlRmlsZSkudG8uZXF1YWwodGVtcFByb2oxKydcXFxcc291cmNlXFxcXGRpcmFcXFxcZmF1eGZpbGUuanMnKVxuICAgICAgICBleHBlY3QocmV0LnNvdXJjZUZpbGVEaXIpLnRvLmVxdWFsKHRlbXBQcm9qMSsnXFxcXHNvdXJjZVxcXFxkaXJhJylcbiAgICAgICAgZXhwZWN0KHJldC5tYXBGaWxlKS50by5lcXVhbCh0ZW1wUHJvajErJ1xcXFxzb3VyY2VcXFxcZGlyYVxcXFxmYXV4ZmlsZS5qcy5tYXAnKVxuICAgICAgICBleHBlY3QocmV0LnRyYW5zcGlsZWRGaWxlKS50by5lcXVhbCh0ZW1wUHJvajErJ1xcXFxzb3VyY2VcXFxcZGlyYVxcXFxmYXV4ZmlsZS5qcycpXG4gICAgICAgIGV4cGVjdChyZXQuc291cmNlUm9vdCkudG8uZXF1YWwodGVtcFByb2oxKVxuICAgICAgICBleHBlY3QocmV0LnByb2plY3RQYXRoKS50by5lcXVhbCh0ZW1wUHJvajEpXG5cbiAgICAgIGl0ICdyZXR1cm5zIHBhdGhzIGNvbmZpZyB3aXRoIHRhcmdldCAmIHNvdXJjZSBwYXRocyBzZXQnLCAtPlxuICAgICAgICB0ZW1wUHJvajEgPSB0ZW1wLm1rZGlyU3luYygpXG4gICAgICAgIHRlbXBQcm9qMiA9IHRlbXAubWtkaXJTeW5jKClcbiAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFt0ZW1wUHJvajEsIHRlbXBQcm9qMl0pXG4gICAgICAgIGNvbmZpZy5iYWJlbFNvdXJjZVBhdGggPSAnXFxcXHNvdXJjZScgIyB3aXRoIGRpciBwcmVmaXhcbiAgICAgICAgY29uZmlnLmJhYmVsTWFwc1BhdGggPSdtYXBzcGF0aCcgIyBhbmQgd2l0aG91dFxuICAgICAgICBjb25maWcuYmFiZWxUcmFuc3BpbGVQYXRoID0gJ1xcXFx0cmFuc3BhdGgnXG5cbiAgICAgICAgcmV0ID0gbGIuZ2V0UGF0aHModGVtcFByb2oxKydcXFxcc291cmNlXFxcXGRpcmFcXFxcZmF1eGZpbGUuanMnLGNvbmZpZylcblxuICAgICAgICBleHBlY3QocmV0LnNvdXJjZUZpbGUpLnRvLmVxdWFsKHRlbXBQcm9qMSsnXFxcXHNvdXJjZVxcXFxkaXJhXFxcXGZhdXhmaWxlLmpzJylcbiAgICAgICAgZXhwZWN0KHJldC5zb3VyY2VGaWxlRGlyKS50by5lcXVhbCh0ZW1wUHJvajErJ1xcXFxzb3VyY2VcXFxcZGlyYScpXG4gICAgICAgIGV4cGVjdChyZXQubWFwRmlsZSkudG8uZXF1YWwodGVtcFByb2oxKydcXFxcbWFwc3BhdGhcXFxcZGlyYVxcXFxmYXV4ZmlsZS5qcy5tYXAnKVxuICAgICAgICBleHBlY3QocmV0LnRyYW5zcGlsZWRGaWxlKS50by5lcXVhbCh0ZW1wUHJvajErJ1xcXFx0cmFuc3BhdGhcXFxcZGlyYVxcXFxmYXV4ZmlsZS5qcycpXG4gICAgICAgIGV4cGVjdChyZXQuc291cmNlUm9vdCkudG8uZXF1YWwodGVtcFByb2oxKydcXFxcc291cmNlJylcbiAgICAgICAgZXhwZWN0KHJldC5wcm9qZWN0UGF0aCkudG8uZXF1YWwodGVtcFByb2oxKVxuXG4gICAgICBpdCAncmV0dXJucyBjb3JyZWN0IHBhdGhzIHdpdGggcHJvamVjdCBpbiByb290IGRpcmVjdG9yeScsIC0+XG4gICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbJ0M6XFxcXCddKVxuICAgICAgICBjb25maWcuYmFiZWxTb3VyY2VQYXRoID0gJ3NvdXJjZSdcbiAgICAgICAgY29uZmlnLmJhYmVsTWFwc1BhdGggPSdtYXBzcGF0aCdcbiAgICAgICAgY29uZmlnLmJhYmVsVHJhbnNwaWxlUGF0aCA9ICd0cmFuc3BhdGgnXG5cbiAgICAgICAgcmV0ID0gbGIuZ2V0UGF0aHMoJ0M6XFxcXHNvdXJjZVxcXFxkaXJhXFxcXGZhdXhmaWxlLmpzJyxjb25maWcpXG5cbiAgICAgICAgZXhwZWN0KHJldC5zb3VyY2VGaWxlKS50by5lcXVhbCgnQzpcXFxcc291cmNlXFxcXGRpcmFcXFxcZmF1eGZpbGUuanMnKVxuICAgICAgICBleHBlY3QocmV0LnNvdXJjZUZpbGVEaXIpLnRvLmVxdWFsKCdDOlxcXFxzb3VyY2VcXFxcZGlyYScpXG4gICAgICAgIGV4cGVjdChyZXQubWFwRmlsZSkudG8uZXF1YWwoJ0M6XFxcXG1hcHNwYXRoXFxcXGRpcmFcXFxcZmF1eGZpbGUuanMubWFwJylcbiAgICAgICAgZXhwZWN0KHJldC50cmFuc3BpbGVkRmlsZSkudG8uZXF1YWwoJ0M6XFxcXHRyYW5zcGF0aFxcXFxkaXJhXFxcXGZhdXhmaWxlLmpzJylcbiAgICAgICAgZXhwZWN0KHJldC5zb3VyY2VSb290KS50by5lcXVhbCgnQzpcXFxcc291cmNlJylcbiAgICAgICAgZXhwZWN0KHJldC5wcm9qZWN0UGF0aCkudG8uZXF1YWwoJ0M6XFxcXCcpXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBkZXNjcmliZSAnOnRyYW5zcGlsZScsIC0+XG4gICAgbm90aWZpY2F0aW9uU3B5ID0gbnVsbFxuICAgIG5vdGlmaWNhdGlvbiA9IG51bGxcbiAgICB3cml0ZUZpbGVTdHViID0gbnVsbFxuICAgIHdyaXRlRmlsZU5hbWUgPSBudWxsXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBub3RpZmljYXRpb25TcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSAnbm90aWZpY2F0aW9uU3B5J1xuICAgICAgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLm9uRGlkQWRkTm90aWZpY2F0aW9uIG5vdGlmaWNhdGlvblNweVxuICAgICAgd3JpdGVGaWxlTmFtZSA9IG51bGxcbiAgICAgIHdyaXRlRmlsZVN0dWIgPSBzcHlPbihmcywnd3JpdGVGaWxlU3luYycpLmFuZENhbGxGYWtlIChwYXRoKS0+XG4gICAgICAgIHdyaXRlRmlsZU5hbWUgPSBwYXRoXG4gICAgYWZ0ZXJFYWNoIC0+XG4gICAgICBub3RpZmljYXRpb24uZGlzcG9zZSgpXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0cmFuc3BpbGVPblNhdmUgaXMgZmFsc2UnLCAtPlxuICAgICAgaXQgJ2RvZXMgbm90aGluZycsIC0+XG4gICAgICAgIGNvbmZpZy50cmFuc3BpbGVPblNhdmUgPSBmYWxzZVxuXG4gICAgICAgIHNweU9uKGxiLCAnZ2V0Q29uZmlnJykuYW5kQ2FsbEZha2UgLT4gY29uZmlnXG4gICAgICAgIGxiLnRyYW5zcGlsZSgnc29tZWZpbGVuYW1lJylcbiAgICAgICAgZXhwZWN0KG5vdGlmaWNhdGlvblNweS5jYWxsQ291bnQpLnRvLmVxdWFsKDApXG4gICAgICAgIGV4cGVjdCh3cml0ZUZpbGVTdHViLmNhbGxDb3VudCkudG8uZXF1YWwoMClcblxuICAgIGRlc2NyaWJlICdXaGVuIGEgc291cmNlIGZpbGUgaXMgb3V0c2lkZSB0aGUgXCJiYWJlbFNvdXJjZVBhdGhcIiAmIHN1cHByZXNzIG1zZ3MgZmFsc2UnLCAtPlxuICAgICAgaXQgJ25vdGlmaWVzIHNvdXJjZWZpbGUgaXMgbm90IGluc2lkZSBzb3VyY2VwYXRoJywgLT5cbiAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtfX2Rpcm5hbWVdKVxuICAgICAgICBjb25maWcuYmFiZWxTb3VyY2VQYXRoID0gJ2ZpeHR1cmVzJ1xuICAgICAgICBjb25maWcuYmFiZWxUcmFuc3BpbGVQYXRoID0gJ2ZpeHR1cmVzJ1xuICAgICAgICBjb25maWcuYmFiZWxNYXBzUGF0aCA9ICdmaXh0dXJlcydcblxuICAgICAgICBzcHlPbihsYiwgJ2dldENvbmZpZycpLmFuZENhbGxGYWtlIC0+IGNvbmZpZ1xuICAgICAgICBsYi50cmFuc3BpbGUoX19kaXJuYW1lKycvZmFrZS5qcycpXG4gICAgICAgIGV4cGVjdChub3RpZmljYXRpb25TcHkuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICBtc2cgPSBub3RpZmljYXRpb25TcHkuY2FsbHNbMF0uYXJnc1swXS5tZXNzYWdlICMgZmlyc3QgY2FsbCwgZmlyc3QgYXJnXG4gICAgICAgIHR5cGUgPSBub3RpZmljYXRpb25TcHkuY2FsbHNbMF0uYXJnc1swXS50eXBlXG4gICAgICAgIGV4cGVjdChtc2cpLnRvLm1hdGNoKC9eTEI6IEJhYmVsIGZpbGUgaXMgbm90IGluc2lkZS8pXG4gICAgICAgIGV4cGVjdCh3cml0ZUZpbGVTdHViLmNhbGxDb3VudCkudG8uZXF1YWwoMClcblxuICAgIGRlc2NyaWJlICdXaGVuIGEgc291cmNlIGZpbGUgaXMgb3V0c2lkZSB0aGUgXCJiYWJlbFNvdXJjZVBhdGhcIiAmIHN1cHByZXNzIG1zZ3MgdHJ1ZScsIC0+XG4gICAgICBpdCAnZXhlY3RzIG5vIG5vdGlmaWNhdGlvbnMnLCAtPlxuICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW19fZGlybmFtZV0pXG4gICAgICAgIGNvbmZpZy5iYWJlbFNvdXJjZVBhdGggPSAnZml4dHVyZXMnXG4gICAgICAgIGNvbmZpZy5iYWJlbFRyYW5zcGlsZVBhdGggPSAnZml4dHVyZXMnXG4gICAgICAgIGNvbmZpZy5iYWJlbE1hcHNQYXRoID0gJ2ZpeHR1cmVzJ1xuICAgICAgICBjb25maWcuc3VwcHJlc3NTb3VyY2VQYXRoTWVzc2FnZXMgPSB0cnVlXG5cbiAgICAgICAgc3B5T24obGIsICdnZXRDb25maWcnKS5hbmRDYWxsRmFrZSAtPiBjb25maWdcbiAgICAgICAgbGIudHJhbnNwaWxlKF9fZGlybmFtZSsnL2Zha2UuanMnKVxuICAgICAgICBleHBlY3Qobm90aWZpY2F0aW9uU3B5LmNhbGxDb3VudCkudG8uZXF1YWwoMClcbiAgICAgICAgZXhwZWN0KHdyaXRlRmlsZVN0dWIuY2FsbENvdW50KS50by5lcXVhbCgwKVxuXG4gICAgZGVzY3JpYmUgJ1doZW4gYSBqcyBmaWxlcyBpcyB0cmFuc3BpbGVkIGFuZCBnZXRzIGFuIGVycm9yJywgLT5cbiAgICAgIGl0ICdpdCBpc3N1ZXMgYSBub3RpZmljYXRpb24gZXJyb3IgbWVzc2FnZScsIC0+XG4gICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbX19kaXJuYW1lXSlcbiAgICAgICAgY29uZmlnLmJhYmVsU291cmNlUGF0aCA9ICdmaXh0dXJlcydcbiAgICAgICAgY29uZmlnLmJhYmVsVHJhbnNwaWxlUGF0aCA9ICdmaXh0dXJlcydcbiAgICAgICAgY29uZmlnLmJhYmVsTWFwc1BhdGggPSAnZml4dHVyZXMnXG5cbiAgICAgICAgc3B5T24obGIsICdnZXRDb25maWcnKS5hbmRDYWxsRmFrZSAtPmNvbmZpZ1xuICAgICAgICBsYi50cmFuc3BpbGUocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2ZpeHR1cmVzL2RpcmEvZGlyYS4xL2RpcmEuMi9iYWQuanMnKSlcbiAgICAgICAgI21heSB0YWtlIGEgd2hpbGUgZm9yIHRoZSB0cmFuc3BpbGVyIHRvIHJ1biBhbmQgY2FsbCBob21lXG4gICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgbm90aWZpY2F0aW9uU3B5LmNhbGxDb3VudFxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0KG5vdGlmaWNhdGlvblNweS5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICAgICAgbXNnID0gbm90aWZpY2F0aW9uU3B5LmNhbGxzWzBdLmFyZ3NbMF0ubWVzc2FnZVxuICAgICAgICAgIGV4cGVjdChtc2cpLnRvLm1hdGNoKC9eTEI6IEJhYmVsLipUcmFuc3BpbGVyIEVycm9yLylcbiAgICAgICAgICBleHBlY3Qod3JpdGVGaWxlU3R1Yi5jYWxsQ291bnQpLnRvLmVxdWFsKDApXG5cbiAgICBkZXNjcmliZSAnV2hlbiBhIGpzIGZpbGUgc2F2ZWQgYnV0IG5vIG91dHB1dCBpcyBzZXQnLCAtPlxuICAgICAgaXQgJ2NhbGxzIHRoZSB0cmFuc3BpbGVyIGJ1dCBkb2VzbnQgc2F2ZSBvdXRwdXQnLCAtPlxuICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW19fZGlybmFtZV0pXG4gICAgICAgIGNvbmZpZy5iYWJlbFNvdXJjZVBhdGggPSAnZml4dHVyZXMnXG4gICAgICAgIGNvbmZpZy5iYWJlbFRyYW5zcGlsZVBhdGggPSAnZml4dHVyZXMnXG4gICAgICAgIGNvbmZpZy5iYWJlbE1hcHNQYXRoID0gJ2ZpeHR1cmVzJ1xuICAgICAgICBjb25maWcuY3JlYXRlVHJhbnNwaWxlZENvZGUgPSBmYWxzZVxuXG4gICAgICAgIHNweU9uKGxiLCAnZ2V0Q29uZmlnJykuYW5kQ2FsbEZha2UgLT5jb25maWdcbiAgICAgICAgbGIudHJhbnNwaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdmaXh0dXJlcy9kaXJhL2RpcmEuMS9kaXJhLjIvcmVhY3QuanN4JykpXG4gICAgICAgICNtYXkgdGFrZSBhIHdoaWxlIGZvciB0aGUgdHJhbnNwaWxlciB0byBydW4gYW5kIGNhbGwgaG9tZVxuICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgIG5vdGlmaWNhdGlvblNweS5jYWxsQ291bnQgPiAxXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3Qobm90aWZpY2F0aW9uU3B5LmNhbGxDb3VudCkudG8uZXF1YWwoMilcbiAgICAgICAgICBtc2cgPSBub3RpZmljYXRpb25TcHkuY2FsbHNbMF0uYXJnc1swXS5tZXNzYWdlXG4gICAgICAgICAgZXhwZWN0KG1zZykudG8ubWF0Y2goL15MQjogQmFiZWwuKlRyYW5zcGlsZXIgU3VjY2Vzcy8pXG4gICAgICAgICAgbXNnID0gbm90aWZpY2F0aW9uU3B5LmNhbGxzWzFdLmFyZ3NbMF0ubWVzc2FnZVxuICAgICAgICAgIGV4cGVjdChtc2cpLnRvLm1hdGNoKC9eTEI6IE5vIHRyYW5zcGlsZWQgb3V0cHV0IGNvbmZpZ3VyZWQvKVxuICAgICAgICAgIGV4cGVjdCh3cml0ZUZpbGVTdHViLmNhbGxDb3VudCkudG8uZXF1YWwoMClcblxuXG4gICAgZGVzY3JpYmUgJ1doZW4gYSBqcyBmaWxlIHNhdmVkIGJ1dCBubyB0cmFuc3BpbGUgcGF0aCBpcyBzZXQnLCAtPlxuICAgICAgaXQgJ2NhbGxzIHRoZSB0cmFuc3BpbGVyIGFuZCB0cmFuc3BpbGVzIE9LIGJ1dCBkb2VzbnQgc2F2ZSBhbmQgaXNzdWVzIG1zZycsIC0+XG4gICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbX19kaXJuYW1lXSlcbiAgICAgICAgY29uZmlnLmJhYmVsU291cmNlUGF0aCA9ICdmaXh0dXJlcydcbiAgICAgICAgY29uZmlnLmJhYmVsVHJhbnNwaWxlUGF0aCA9ICdmaXh0dXJlcydcbiAgICAgICAgY29uZmlnLmJhYmVsTWFwc1BhdGggPSAnZml4dHVyZXMnXG5cbiAgICAgICAgc3B5T24obGIsICdnZXRDb25maWcnKS5hbmRDYWxsRmFrZSAtPmNvbmZpZ1xuICAgICAgICBsYi50cmFuc3BpbGUocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2ZpeHR1cmVzL2RpcmEvZGlyYS4xL2RpcmEuMi9nb29kLmpzJykpXG4gICAgICAgICNtYXkgdGFrZSBhIHdoaWxlIGZvciB0aGUgdHJhbnNwaWxlciB0byBydW4gYW5kIGNhbGwgaG9tZVxuICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgIG5vdGlmaWNhdGlvblNweS5jYWxsQ291bnQgPiAxXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3Qobm90aWZpY2F0aW9uU3B5LmNhbGxDb3VudCkudG8uZXF1YWwoMilcbiAgICAgICAgICBtc2cgPSBub3RpZmljYXRpb25TcHkuY2FsbHNbMF0uYXJnc1swXS5tZXNzYWdlICMgZmlyc3QgY2FsbCwgZmlyc3QgYXJnXG4gICAgICAgICAgZXhwZWN0KG1zZykudG8ubWF0Y2goL15MQjogQmFiZWwuKlRyYW5zcGlsZXIgU3VjY2Vzcy8pXG4gICAgICAgICAgbXNnID0gbm90aWZpY2F0aW9uU3B5LmNhbGxzWzFdLmFyZ3NbMF0ubWVzc2FnZVxuICAgICAgICAgIGV4cGVjdChtc2cpLnRvLm1hdGNoKC9eTEI6IFRyYW5zcGlsZWQgZmlsZSB3b3VsZCBvdmVyd3JpdGUgc291cmNlIGZpbGUvKVxuICAgICAgICAgIGV4cGVjdCh3cml0ZUZpbGVTdHViLmNhbGxDb3VudCkudG8uZXF1YWwoMClcblxuICAgIGRlc2NyaWJlICdXaGVuIGEganN4IGZpbGUgc2F2ZWQsdHJhbnNwaWxlIHBhdGggaXMgc2V0LCBzb3VyY2UgbWFwcyBlbmFibGVkJywgLT5cbiAgICAgIGl0ICdjYWxscyB0aGUgdHJhbnNwaWxlciBhbmQgdHJhbnNwaWxlcyBPSywgc2F2ZXMgYXMgLmpzIGFuZCBpc3N1ZXMgbXNnJywgLT5cbiAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtfX2Rpcm5hbWVdKVxuICAgICAgICBjb25maWcuYmFiZWxTb3VyY2VQYXRoID0gJ2ZpeHR1cmVzJ1xuICAgICAgICBjb25maWcuYmFiZWxUcmFuc3BpbGVQYXRoID0gJ2ZpeHR1cmVzLXRyYW5zcGlsZWQnXG4gICAgICAgIGNvbmZpZy5iYWJlbE1hcHNQYXRoID0gJ2ZpeHR1cmVzLW1hcHMnXG4gICAgICAgIGNvbmZpZy5jcmVhdGVNYXAgPSB0cnVlXG5cbiAgICAgICAgc3B5T24obGIsICdnZXRDb25maWcnKS5hbmRDYWxsRmFrZSAtPmNvbmZpZ1xuICAgICAgICBsYi50cmFuc3BpbGUocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2ZpeHR1cmVzL2RpcmEvZGlyYS4xL2RpcmEuMi9yZWFjdC5qc3gnKSlcbiAgICAgICAgI21heSB0YWtlIGEgd2hpbGUgZm9yIHRoZSB0cmFuc3BpbGVyIHRvIHJ1biBhbmQgY2FsbCBob21lXG4gICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgd3JpdGVGaWxlU3R1Yi5jYWxsQ291bnRcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChub3RpZmljYXRpb25TcHkuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICAgIG1zZyA9IG5vdGlmaWNhdGlvblNweS5jYWxsc1swXS5hcmdzWzBdLm1lc3NhZ2UgIyBmaXJzdCBjYWxsLCBmaXJzdCBhcmdcbiAgICAgICAgICBleHBlY3QobXNnKS50by5tYXRjaCgvXkxCOiBCYWJlbC4qVHJhbnNwaWxlciBTdWNjZXNzLylcbiAgICAgICAgICBleHBlY3Qod3JpdGVGaWxlU3R1Yi5jYWxsQ291bnQpLnRvLmVxdWFsKDIpXG4gICAgICAgICAgc2F2ZWRGaWxlbmFtZSA9IHdyaXRlRmlsZVN0dWIuY2FsbHNbMF0uYXJnc1swXVxuICAgICAgICAgIGV4cGVjdGVkRmlsZU5hbWUgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnZml4dHVyZXMtdHJhbnNwaWxlZC9kaXJhL2RpcmEuMS9kaXJhLjIvcmVhY3QuanMnKVxuICAgICAgICAgIGV4cGVjdChzYXZlZEZpbGVuYW1lKS50by5lcXVhbChleHBlY3RlZEZpbGVOYW1lKVxuICAgICAgICAgIHNhdmVkRmlsZW5hbWUgPSB3cml0ZUZpbGVTdHViLmNhbGxzWzFdLmFyZ3NbMF1cbiAgICAgICAgICBleHBlY3RlZEZpbGVOYW1lID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2ZpeHR1cmVzLW1hcHMvZGlyYS9kaXJhLjEvZGlyYS4yL3JlYWN0LmpzLm1hcCcpXG4gICAgICAgICAgZXhwZWN0KHNhdmVkRmlsZW5hbWUpLnRvLmVxdWFsKGV4cGVjdGVkRmlsZU5hbWUpXG5cbiAgICBkZXNjcmliZSAnV2hlbiBhIGpzeCBmaWxlIHNhdmVkLHRyYW5zcGlsZSBwYXRoIGlzIHNldCwgc291cmNlIG1hcHMgZW5hYmxlZCwgc3VjY2VzcyBzdXBwcmVzc2VkJywgLT5cbiAgICAgIGl0ICdjYWxscyB0aGUgdHJhbnNwaWxlciBhbmQgdHJhbnNwaWxlcyBPSywgc2F2ZXMgYXMgLmpzIGFuZCBpc3N1ZXMgbXNnJywgLT5cbiAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtfX2Rpcm5hbWVdKVxuICAgICAgICBjb25maWcuYmFiZWxTb3VyY2VQYXRoID0gJ2ZpeHR1cmVzJ1xuICAgICAgICBjb25maWcuYmFiZWxUcmFuc3BpbGVQYXRoID0gJ2ZpeHR1cmVzLXRyYW5zcGlsZWQnXG4gICAgICAgIGNvbmZpZy5iYWJlbE1hcHNQYXRoID0gJ2ZpeHR1cmVzLW1hcHMnXG4gICAgICAgIGNvbmZpZy5jcmVhdGVNYXAgPSB0cnVlXG4gICAgICAgIGNvbmZpZy5zdXBwcmVzc1RyYW5zcGlsZU9uU2F2ZU1lc3NhZ2VzID0gdHJ1ZVxuXG4gICAgICAgIHNweU9uKGxiLCAnZ2V0Q29uZmlnJykuYW5kQ2FsbEZha2UgLT5jb25maWdcbiAgICAgICAgbGIudHJhbnNwaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdmaXh0dXJlcy9kaXJhL2RpcmEuMS9kaXJhLjIvcmVhY3QuanN4JykpXG4gICAgICAgICNtYXkgdGFrZSBhIHdoaWxlIGZvciB0aGUgdHJhbnNwaWxlciB0byBydW4gYW5kIGNhbGwgaG9tZVxuICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgIHdyaXRlRmlsZVN0dWIuY2FsbENvdW50XG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3Qobm90aWZpY2F0aW9uU3B5LmNhbGxDb3VudCkudG8uZXF1YWwoMClcbiAgICAgICAgICBleHBlY3Qod3JpdGVGaWxlU3R1Yi5jYWxsQ291bnQpLnRvLmVxdWFsKDIpXG4gICAgICAgICAgc2F2ZWRGaWxlbmFtZSA9IHdyaXRlRmlsZVN0dWIuY2FsbHNbMF0uYXJnc1swXVxuICAgICAgICAgIGV4cGVjdGVkRmlsZU5hbWUgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnZml4dHVyZXMtdHJhbnNwaWxlZC9kaXJhL2RpcmEuMS9kaXJhLjIvcmVhY3QuanMnKVxuICAgICAgICAgIGV4cGVjdChzYXZlZEZpbGVuYW1lKS50by5lcXVhbChleHBlY3RlZEZpbGVOYW1lKVxuICAgICAgICAgIHNhdmVkRmlsZW5hbWUgPSB3cml0ZUZpbGVTdHViLmNhbGxzWzFdLmFyZ3NbMF1cbiAgICAgICAgICBleHBlY3RlZEZpbGVOYW1lID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2ZpeHR1cmVzLW1hcHMvZGlyYS9kaXJhLjEvZGlyYS4yL3JlYWN0LmpzLm1hcCcpXG4gICAgICAgICAgZXhwZWN0KHNhdmVkRmlsZW5hbWUpLnRvLmVxdWFsKGV4cGVjdGVkRmlsZU5hbWUpXG5cbiAgICBkZXNjcmliZSAnV2hlbiBhIGpzIGZpbGUgc2F2ZWQgLCBiYWJlbHJjIGluIHBhdGggYW5kIGZsYWcgZGlzYWJsZVdoZW5Ob0JhYmVscmNGaWxlSW5QYXRoIGlzIHNldCcsIC0+XG4gICAgICBpdCAnY2FsbHMgdGhlIHRyYW5zcGlsZXInLCAtPlxuICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW19fZGlybmFtZV0pXG4gICAgICAgIGNvbmZpZy5iYWJlbFNvdXJjZVBhdGggPSAnZml4dHVyZXMnXG4gICAgICAgIGNvbmZpZy5iYWJlbFRyYW5zcGlsZVBhdGggPSAnZml4dHVyZXMnXG4gICAgICAgIGNvbmZpZy5iYWJlbE1hcHNQYXRoID0gJ2ZpeHR1cmVzJ1xuICAgICAgICBjb25maWcuY3JlYXRlVHJhbnNwaWxlZENvZGUgPSBmYWxzZVxuICAgICAgICBjb25maWcuZGlzYWJsZVdoZW5Ob0JhYmVscmNGaWxlSW5QYXRoID0gdHJ1ZVxuXG4gICAgICAgIHNweU9uKGxiLCAnZ2V0Q29uZmlnJykuYW5kQ2FsbEZha2UgLT5jb25maWdcbiAgICAgICAgbGIudHJhbnNwaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdmaXh0dXJlcy9kaXJhL2RpcmEuMS9kaXJhLjIvZ29vZC5qcycpKVxuICAgICAgICAjbWF5IHRha2UgYSB3aGlsZSBmb3IgdGhlIHRyYW5zcGlsZXIgdG8gcnVuIGFuZCBjYWxsIGhvbWVcbiAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICBub3RpZmljYXRpb25TcHkuY2FsbENvdW50XG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3Qobm90aWZpY2F0aW9uU3B5LmNhbGxDb3VudCkudG8uZXF1YWwoMilcbiAgICAgICAgICBtc2cgPSBub3RpZmljYXRpb25TcHkuY2FsbHNbMF0uYXJnc1swXS5tZXNzYWdlXG4gICAgICAgICAgZXhwZWN0KG1zZykudG8ubWF0Y2goL15MQjogQmFiZWwuKlRyYW5zcGlsZXIgU3VjY2Vzcy8pXG4gICAgICAgICAgbXNnID0gbm90aWZpY2F0aW9uU3B5LmNhbGxzWzFdLmFyZ3NbMF0ubWVzc2FnZVxuICAgICAgICAgIGV4cGVjdChtc2cpLnRvLm1hdGNoKC9eTEI6IE5vIHRyYW5zcGlsZWQgb3V0cHV0IGNvbmZpZ3VyZWQvKVxuICAgICAgICAgIGV4cGVjdCh3cml0ZUZpbGVTdHViLmNhbGxDb3VudCkudG8uZXF1YWwoMClcblxuICAgIGRlc2NyaWJlICdXaGVuIGEganMgZmlsZSBzYXZlZCAsIGJhYmVscmMgaW4gbm90IGluIHBhdGggYW5kIGZsYWcgZGlzYWJsZVdoZW5Ob0JhYmVscmNGaWxlSW5QYXRoIGlzIHNldCcsIC0+XG4gICAgICBpdCAnZG9lcyBub3RoaW5nJywgLT5cbiAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtfX2Rpcm5hbWVdKVxuICAgICAgICBjb25maWcuYmFiZWxTb3VyY2VQYXRoID0gJ2ZpeHR1cmVzJ1xuICAgICAgICBjb25maWcuYmFiZWxUcmFuc3BpbGVQYXRoID0gJ2ZpeHR1cmVzJ1xuICAgICAgICBjb25maWcuYmFiZWxNYXBzUGF0aCA9ICdmaXh0dXJlcydcbiAgICAgICAgY29uZmlnLmNyZWF0ZVRyYW5zcGlsZWRDb2RlID0gZmFsc2VcbiAgICAgICAgY29uZmlnLmRpc2FibGVXaGVuTm9CYWJlbHJjRmlsZUluUGF0aCA9IHRydWVcblxuICAgICAgICBzcHlPbihsYiwgJ2dldENvbmZpZycpLmFuZENhbGxGYWtlIC0+Y29uZmlnXG4gICAgICAgIGxiLnRyYW5zcGlsZShwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnZml4dHVyZXMvZGlyYi9nb29kLmpzJykpXG4gICAgICAgIGV4cGVjdChub3RpZmljYXRpb25TcHkuY2FsbENvdW50KS50by5lcXVhbCgwKVxuICAgICAgICBleHBlY3Qod3JpdGVGaWxlU3R1Yi5jYWxsQ291bnQpLnRvLmVxdWFsKDApXG5cbiAgICBkZXNjcmliZSAnV2hlbiBhIGpzIGZpbGUgc2F2ZWQgaW4gYSBuZXN0ZWQgcHJvamVjdCcsIC0+XG4gICAgICBpdCAnY3JlYXRlcyBhIGZpbGUgaW4gdGhlIGNvcnJlY3QgbG9jYXRpb24gYmFzZWQgdXBvbiAubGFuZ3VhZ2ViYWJlbCcsIC0+XG4gICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbX19kaXJuYW1lXSlcbiAgICAgICAgY29uZmlnLmFsbG93TG9jYWxPdmVycmlkZSA9IHRydWVcblxuICAgICAgICBzcHlPbihsYiwgJ2dldENvbmZpZycpLmFuZENhbGxGYWtlIC0+IGNvbmZpZ1xuICAgICAgICBzb3VyY2VGaWxlID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2ZpeHR1cmVzL3Byb2plY3RSb290L3NyYy90ZXN0LmpzJylcbiAgICAgICAgdGFyZ2V0RmlsZSA9ICBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnZml4dHVyZXMvcHJvamVjdFJvb3QvdGVzdC5qcycpXG4gICAgICAgIGxiLnRyYW5zcGlsZShzb3VyY2VGaWxlKVxuICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgIHdyaXRlRmlsZVN0dWIuY2FsbENvdW50XG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3Qod3JpdGVGaWxlTmFtZSkudG8uZXF1YWwodGFyZ2V0RmlsZSlcblxuICAgIGRlc2NyaWJlICdXaGVuIGEgZGlyZWN0b3J5IGlzIGNvbXBpbGVkJywgLT5cbiAgICAgIGl0ICd0cmFuc3BpbGVzIHRoZSBqcyxqc3gsZXMsZXM2LGJhYmVsIGZpbGVzIGJ1dCBpZ25vcmVzIG1pbmlmaWVkIGZpbGVzJywgLT5cbiAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtfX2Rpcm5hbWVdKVxuICAgICAgICBjb25maWcuYWxsb3dMb2NhbE92ZXJyaWRlID0gdHJ1ZVxuXG4gICAgICAgIHNweU9uKGxiLCAnZ2V0Q29uZmlnJykuYW5kQ2FsbEZha2UgLT4gY29uZmlnXG4gICAgICAgIHNvdXJjZURpciA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdmaXh0dXJlcy9wcm9qZWN0Um9vdC9zcmMvJylcbiAgICAgICAgbGIudHJhbnNwaWxlRGlyZWN0b3J5KHtkaXJlY3Rvcnk6IHNvdXJjZURpcn0pXG4gICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgd3JpdGVGaWxlU3R1Yi5jYWxsQ291bnQgPj0gNVxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0KHdyaXRlRmlsZVN0dWIuY2FsbENvdW50KS50by5lcXVhbCg1KVxuIl19
