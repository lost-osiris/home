(function() {
  var Beautifier, Beautifiers, Executable, Languages, Promise, _, beautifiers, fs, isWindows, path, temp;

  Beautifiers = require("../src/beautifiers");

  Executable = require("../src/beautifiers/executable");

  beautifiers = new Beautifiers();

  Beautifier = require("../src/beautifiers/beautifier");

  Languages = require('../src/languages/');

  _ = require('lodash');

  fs = require('fs');

  path = require('path');

  Promise = require("bluebird");

  temp = require('temp');

  temp.track();

  isWindows = process.platform === 'win32' || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';

  describe("Atom-Beautify", function() {
    beforeEach(function() {
      return waitsForPromise(function() {
        var activationPromise, pack;
        activationPromise = atom.packages.activatePackage('atom-beautify');
        pack = atom.packages.getLoadedPackage("atom-beautify");
        pack.activateNow();
        atom.config.set('atom-beautify.general.loggerLevel', 'info');
        return activationPromise;
      });
    });
    afterEach(function() {
      return temp.cleanupSync();
    });
    describe("Beautifiers", function() {
      var beautifier;
      beautifier = null;
      beforeEach(function() {
        return beautifier = new Beautifier();
      });
      return describe("Beautifier::run", function() {
        it("should error when beautifier's program not found", function() {
          expect(beautifier).not.toBe(null);
          expect(beautifier instanceof Beautifier).toBe(true);
          return waitsForPromise({
            shouldReject: true
          }, function() {
            var cb, p;
            p = beautifier.run("program", []);
            expect(p).not.toBe(null);
            expect(p instanceof beautifier.Promise).toBe(true);
            cb = function(v) {
              expect(v).not.toBe(null);
              expect(v instanceof Error).toBe(true);
              expect(v.code).toBe("CommandNotFound");
              expect(typeof v.description).toBe("string", 'Error should have a description.');
              expect(v.description.indexOf("Executable - Beautifier - Path")).toBe(-1, "Error should not have pathOption.");
              return v;
            };
            p.then(cb, cb);
            return p;
          });
        });
        it("should error with help description when beautifier's program not found", function() {
          expect(beautifier).not.toBe(null);
          expect(beautifier instanceof Beautifier).toBe(true);
          return waitsForPromise({
            shouldReject: true
          }, function() {
            var cb, help, p;
            help = {
              link: "http://test.com",
              program: "test-program",
              pathOption: "Lang - Test Program Path"
            };
            p = beautifier.run("program", [], {
              help: help
            });
            expect(p).not.toBe(null);
            expect(p instanceof beautifier.Promise).toBe(true);
            cb = function(v) {
              expect(v).not.toBe(null);
              expect(v instanceof Error).toBe(true);
              expect(v.code).toBe("CommandNotFound");
              expect(v.description).not.toBe(null);
              expect(v.description.indexOf(help.link)).not.toBe(-1);
              expect(v.description.indexOf(help.program)).not.toBe(-1);
              expect(v.description.indexOf(help.pathOption)).not.toBe(-1, "Error should have a description.");
              return v;
            };
            p.then(cb, cb);
            return p;
          });
        });
        it("should error with Windows-specific help description when beautifier's program not found", function() {
          expect(beautifier).not.toBe(null);
          expect(beautifier instanceof Beautifier).toBe(true);
          return waitsForPromise({
            shouldReject: true
          }, function() {
            var cb, help, p, terminal, whichCmd;
            help = {
              link: "http://test.com",
              program: "test-program",
              pathOption: "Lang - Test Program Path"
            };
            Executable.isWindows = function() {
              return true;
            };
            terminal = 'CMD prompt';
            whichCmd = "where.exe";
            p = beautifier.run("program", [], {
              help: help
            });
            expect(p).not.toBe(null);
            expect(p instanceof beautifier.Promise).toBe(true);
            cb = function(v) {
              console.log("error", v, v.description);
              expect(v).not.toBe(null);
              expect(v instanceof Error).toBe(true);
              expect(v.code).toBe("CommandNotFound");
              expect(v.description).not.toBe(null);
              expect(v.description.indexOf(help.link)).not.toBe(-1);
              expect(v.description.indexOf(help.program)).not.toBe(-1);
              expect(v.description.indexOf(help.pathOption)).not.toBe(-1, "Error should have a description.");
              expect(v.description.indexOf(terminal)).not.toBe(-1, "Error should have a description including '" + terminal + "' in message.");
              expect(v.description.indexOf(whichCmd)).not.toBe(-1, "Error should have a description including '" + whichCmd + "' in message.");
              return v;
            };
            p.then(cb, cb);
            return p;
          });
        });
        if (!isWindows) {
          return it("should error with Mac/Linux-specific help description when beautifier's program not found", function() {
            expect(beautifier).not.toBe(null);
            expect(beautifier instanceof Beautifier).toBe(true);
            return waitsForPromise({
              shouldReject: true
            }, function() {
              var cb, help, p, terminal, whichCmd;
              help = {
                link: "http://test.com",
                program: "test-program",
                pathOption: "Lang - Test Program Path"
              };
              Executable.isWindows = function() {
                return false;
              };
              terminal = "Terminal";
              whichCmd = "which";
              p = beautifier.run("program", [], {
                help: help
              });
              expect(p).not.toBe(null);
              expect(p instanceof beautifier.Promise).toBe(true);
              cb = function(v) {
                expect(v).not.toBe(null);
                expect(v instanceof Error).toBe(true);
                expect(v.code).toBe("CommandNotFound");
                expect(v.description).not.toBe(null);
                expect(v.description.indexOf(help.link)).not.toBe(-1);
                expect(v.description.indexOf(help.program)).not.toBe(-1);
                expect(v.description.indexOf(terminal)).not.toBe(-1, "Error should have a description including '" + terminal + "' in message.");
                expect(v.description.indexOf(whichCmd)).not.toBe(-1, "Error should have a description including '" + whichCmd + "' in message.");
                return v;
              };
              p.then(cb, cb);
              return p;
            });
          });
        }
      });
    });
    return describe("Options", function() {
      var beautifier, beautifyEditor, editor, workspaceElement;
      editor = null;
      beautifier = null;
      workspaceElement = atom.views.getView(atom.workspace);
      beforeEach(function() {
        beautifier = new Beautifiers();
        return waitsForPromise(function() {
          return atom.workspace.open().then(function(e) {
            editor = e;
            return expect(editor.getText()).toEqual("");
          });
        });
      });
      describe("Migrate Settings", function() {
        var migrateSettings;
        migrateSettings = function(beforeKey, afterKey, val) {
          atom.config.set("atom-beautify." + beforeKey, val);
          atom.commands.dispatch(workspaceElement, "atom-beautify:migrate-settings");
          expect(_.has(atom.config.get('atom-beautify'), beforeKey)).toBe(false);
          return expect(atom.config.get("atom-beautify." + afterKey)).toBe(val);
        };
        it("should migrate js_indent_size to js.indent_size", function() {
          migrateSettings("js_indent_size", "js.indent_size", 1);
          return migrateSettings("js_indent_size", "js.indent_size", 10);
        });
        it("should migrate analytics to general.analytics", function() {
          migrateSettings("analytics", "general.analytics", true);
          return migrateSettings("analytics", "general.analytics", false);
        });
        it("should migrate _analyticsUserId to general._analyticsUserId", function() {
          migrateSettings("_analyticsUserId", "general._analyticsUserId", "userid");
          return migrateSettings("_analyticsUserId", "general._analyticsUserId", "userid2");
        });
        it("should migrate language_js_disabled to js.disabled", function() {
          migrateSettings("language_js_disabled", "js.disabled", false);
          return migrateSettings("language_js_disabled", "js.disabled", true);
        });
        it("should migrate language_js_default_beautifier to js.default_beautifier", function() {
          migrateSettings("language_js_default_beautifier", "js.default_beautifier", "Pretty Diff");
          return migrateSettings("language_js_default_beautifier", "js.default_beautifier", "JS Beautify");
        });
        return it("should migrate language_js_beautify_on_save to js.beautify_on_save", function() {
          migrateSettings("language_js_beautify_on_save", "js.beautify_on_save", true);
          return migrateSettings("language_js_beautify_on_save", "js.beautify_on_save", false);
        });
      });
      beautifyEditor = function(callback) {
        var beforeText, delay, isComplete;
        isComplete = false;
        beforeText = null;
        delay = 500;
        runs(function() {
          beforeText = editor.getText();
          atom.commands.dispatch(workspaceElement, "atom-beautify:beautify-editor");
          return setTimeout(function() {
            return isComplete = true;
          }, delay);
        });
        waitsFor(function() {
          return isComplete;
        });
        return runs(function() {
          var afterText;
          afterText = editor.getText();
          expect(typeof beforeText).toBe('string');
          expect(typeof afterText).toBe('string');
          return callback(beforeText, afterText);
        });
      };
      return describe("JavaScript", function() {
        beforeEach(function() {
          waitsForPromise(function() {
            var packName;
            packName = 'language-javascript';
            return atom.packages.activatePackage(packName);
          });
          return runs(function() {
            var code, grammar;
            code = "var hello='world';function(){console.log('hello '+hello)}";
            editor.setText(code);
            grammar = atom.grammars.selectGrammar('source.js');
            expect(grammar.name).toBe('JavaScript');
            editor.setGrammar(grammar);
            expect(editor.getGrammar().name).toBe('JavaScript');
            return jasmine.unspy(window, 'setTimeout');
          });
        });
        describe(".jsbeautifyrc", function() {
          return it("should look at directories above file", function() {
            var cb, isDone;
            isDone = false;
            cb = function(err) {
              isDone = true;
              return expect(err).toBe(void 0);
            };
            runs(function() {
              var err;
              try {
                return temp.mkdir('dir1', function(err, dirPath) {
                  var myData, myData1, rcPath;
                  if (err) {
                    return cb(err);
                  }
                  rcPath = path.join(dirPath, '.jsbeautifyrc');
                  myData1 = {
                    indent_size: 1,
                    indent_char: '\t'
                  };
                  myData = JSON.stringify(myData1);
                  return fs.writeFile(rcPath, myData, function(err) {
                    if (err) {
                      return cb(err);
                    }
                    dirPath = path.join(dirPath, 'dir2');
                    return fs.mkdir(dirPath, function(err) {
                      var myData2;
                      if (err) {
                        return cb(err);
                      }
                      rcPath = path.join(dirPath, '.jsbeautifyrc');
                      myData2 = {
                        indent_size: 2,
                        indent_char: ' '
                      };
                      myData = JSON.stringify(myData2);
                      return fs.writeFile(rcPath, myData, function(err) {
                        if (err) {
                          return cb(err);
                        }
                        return Promise.all(beautifier.getOptionsForPath(rcPath, null)).then(function(allOptions) {
                          var config1, config2, configOptions, editorConfigOptions, editorOptions, homeOptions, projectOptions, ref;
                          editorOptions = allOptions[0], configOptions = allOptions[1], homeOptions = allOptions[2], editorConfigOptions = allOptions[3];
                          projectOptions = allOptions.slice(4);
                          ref = projectOptions.slice(-2), config1 = ref[0], config2 = ref[1];
                          expect(_.get(config1, '_default.indent_size')).toBe(myData1.indent_size);
                          expect(_.get(config2, '_default.indent_size')).toBe(myData2.indent_size);
                          expect(_.get(config1, '_default.indent_char')).toBe(myData1.indent_char);
                          expect(_.get(config2, '_default.indent_char')).toBe(myData2.indent_char);
                          return cb();
                        });
                      });
                    });
                  });
                });
              } catch (error) {
                err = error;
                return cb(err);
              }
            });
            return waitsFor(function() {
              return isDone;
            });
          });
        });
        return describe("Package settings", function() {
          var getOptions;
          getOptions = function(callback) {
            var options;
            options = null;
            waitsForPromise(function() {
              var allOptions;
              allOptions = beautifier.getOptionsForPath(null, null);
              return Promise.all(allOptions).then(function(allOptions) {
                return options = allOptions;
              });
            });
            return runs(function() {
              return callback(options);
            });
          };
          it("should change indent_size to 1", function() {
            atom.config.set('atom-beautify.js.indent_size', 1);
            return getOptions(function(allOptions) {
              var configOptions;
              expect(typeof allOptions).toBe('object');
              configOptions = allOptions[1];
              expect(typeof configOptions).toBe('object');
              expect(configOptions.js.indent_size).toBe(1);
              return beautifyEditor(function(beforeText, afterText) {
                return expect(afterText).toBe("var hello = 'world';\n\nfunction() {\n console.log('hello ' + hello)\n}");
              });
            });
          });
          return it("should change indent_size to 10", function() {
            atom.config.set('atom-beautify.js.indent_size', 10);
            return getOptions(function(allOptions) {
              var configOptions;
              expect(typeof allOptions).toBe('object');
              configOptions = allOptions[1];
              expect(typeof configOptions).toBe('object');
              expect(configOptions.js.indent_size).toBe(10);
              return beautifyEditor(function(beforeText, afterText) {
                return expect(afterText).toBe("var hello = 'world';\n\nfunction() {\n          console.log('hello ' + hello)\n}");
              });
            });
          });
        });
      });
    });
  });

  describe("Languages", function() {
    var languages;
    languages = null;
    beforeEach(function() {
      return languages = new Languages();
    });
    return describe("Languages::namespace", function() {
      return it("should verify that multiple languages do not share the same namespace", function() {
        var namespaceGroups, namespaceOverlap, namespacePairs;
        namespaceGroups = _.groupBy(languages.languages, "namespace");
        namespacePairs = _.toPairs(namespaceGroups);
        namespaceOverlap = _.filter(namespacePairs, function(arg) {
          var group, namespace;
          namespace = arg[0], group = arg[1];
          return group.length > 1;
        });
        return expect(namespaceOverlap.length).toBe(0, "Language namespaces are overlapping.\nNamespaces are unique: only one language for each namespace.\n" + _.map(namespaceOverlap, function(arg) {
          var group, namespace;
          namespace = arg[0], group = arg[1];
          return "- '" + namespace + "': Check languages " + (_.map(group, 'name').join(', ')) + " for using namespace '" + namespace + "'.";
        }).join('\n'));
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3BlYy9hdG9tLWJlYXV0aWZ5LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLG9CQUFSOztFQUNkLFVBQUEsR0FBYSxPQUFBLENBQVEsK0JBQVI7O0VBQ2IsV0FBQSxHQUFrQixJQUFBLFdBQUEsQ0FBQTs7RUFDbEIsVUFBQSxHQUFhLE9BQUEsQ0FBUSwrQkFBUjs7RUFDYixTQUFBLEdBQVksT0FBQSxDQUFRLG1CQUFSOztFQUNaLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7RUFDSixFQUFBLEdBQU8sT0FBQSxDQUFRLElBQVI7O0VBQ1AsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7RUFDVixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsSUFBSSxDQUFDLEtBQUwsQ0FBQTs7RUFRQSxTQUFBLEdBQVksT0FBTyxDQUFDLFFBQVIsS0FBb0IsT0FBcEIsSUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQVosS0FBc0IsUUFEWixJQUVWLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBWixLQUFzQjs7RUFFeEIsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQTtJQUV4QixVQUFBLENBQVcsU0FBQTthQUdULGVBQUEsQ0FBZ0IsU0FBQTtBQUNkLFlBQUE7UUFBQSxpQkFBQSxHQUFvQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsZUFBOUI7UUFFcEIsSUFBQSxHQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsZUFBL0I7UUFDUCxJQUFJLENBQUMsV0FBTCxDQUFBO1FBRUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1DQUFoQixFQUFxRCxNQUFyRDtB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VyxLQUFLLENBQUMsTUFBTixHQUFlO1FBQXZDLENBQXpCO2VBRW5CLE1BQUEsQ0FBTyxnQkFBZ0IsQ0FBQyxNQUF4QixDQUErQixDQUFDLElBQWhDLENBQXFDLENBQXJDLEVBQ0Usc0dBQUEsR0FFQSxDQUFDLENBQUMsR0FBRixDQUFNLGdCQUFOLEVBQXdCLFNBQUMsR0FBRDtBQUF3QixjQUFBO1VBQXRCLG9CQUFXO2lCQUFXLEtBQUEsR0FBTSxTQUFOLEdBQWdCLHFCQUFoQixHQUFvQyxDQUFDLENBQUMsQ0FBQyxHQUFGLENBQU0sS0FBTixFQUFhLE1BQWIsQ0FBb0IsQ0FBQyxJQUFyQixDQUEwQixJQUExQixDQUFELENBQXBDLEdBQXFFLHdCQUFyRSxHQUE2RixTQUE3RixHQUF1RztRQUEvSCxDQUF4QixDQUEySixDQUFDLElBQTVKLENBQWlLLElBQWpLLENBSEY7TUFOMEUsQ0FBNUU7SUFGK0IsQ0FBakM7RUFQb0IsQ0FBdEI7QUE1WkEiLCJzb3VyY2VzQ29udGVudCI6WyJCZWF1dGlmaWVycyA9IHJlcXVpcmUgXCIuLi9zcmMvYmVhdXRpZmllcnNcIlxuRXhlY3V0YWJsZSA9IHJlcXVpcmUgXCIuLi9zcmMvYmVhdXRpZmllcnMvZXhlY3V0YWJsZVwiXG5iZWF1dGlmaWVycyA9IG5ldyBCZWF1dGlmaWVycygpXG5CZWF1dGlmaWVyID0gcmVxdWlyZSBcIi4uL3NyYy9iZWF1dGlmaWVycy9iZWF1dGlmaWVyXCJcbkxhbmd1YWdlcyA9IHJlcXVpcmUoJy4uL3NyYy9sYW5ndWFnZXMvJylcbl8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuZnMgICA9IHJlcXVpcmUoJ2ZzJylcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcblByb21pc2UgPSByZXF1aXJlKFwiYmx1ZWJpcmRcIilcbnRlbXAgPSByZXF1aXJlKCd0ZW1wJylcbnRlbXAudHJhY2soKVxuXG4jIFVzZSB0aGUgY29tbWFuZCBgd2luZG93OnJ1bi1wYWNrYWdlLXNwZWNzYCAoY21kLWFsdC1jdHJsLXApIHRvIHJ1biBzcGVjcy5cbiNcbiMgVG8gcnVuIGEgc3BlY2lmaWMgYGl0YCBvciBgZGVzY3JpYmVgIGJsb2NrIGFkZCBhbiBgZmAgdG8gdGhlIGZyb250IChlLmcuIGBmaXRgXG4jIG9yIGBmZGVzY3JpYmVgKS4gUmVtb3ZlIHRoZSBgZmAgdG8gdW5mb2N1cyB0aGUgYmxvY2suXG5cbiMgQ2hlY2sgaWYgV2luZG93c1xuaXNXaW5kb3dzID0gcHJvY2Vzcy5wbGF0Zm9ybSBpcyAnd2luMzInIG9yXG4gIHByb2Nlc3MuZW52Lk9TVFlQRSBpcyAnY3lnd2luJyBvclxuICBwcm9jZXNzLmVudi5PU1RZUEUgaXMgJ21zeXMnXG5cbmRlc2NyaWJlIFwiQXRvbS1CZWF1dGlmeVwiLCAtPlxuXG4gIGJlZm9yZUVhY2ggLT5cblxuICAgICMgQWN0aXZhdGUgcGFja2FnZVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYWN0aXZhdGlvblByb21pc2UgPSBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYXRvbS1iZWF1dGlmeScpXG4gICAgICAjIEZvcmNlIGFjdGl2YXRlIHBhY2thZ2VcbiAgICAgIHBhY2sgPSBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoXCJhdG9tLWJlYXV0aWZ5XCIpXG4gICAgICBwYWNrLmFjdGl2YXRlTm93KClcbiAgICAgICMgQ2hhbmdlIGxvZ2dlciBsZXZlbFxuICAgICAgYXRvbS5jb25maWcuc2V0KCdhdG9tLWJlYXV0aWZ5LmdlbmVyYWwubG9nZ2VyTGV2ZWwnLCAnaW5mbycpXG4gICAgICAjIFJldHVybiBwcm9taXNlXG4gICAgICByZXR1cm4gYWN0aXZhdGlvblByb21pc2VcblxuICBhZnRlckVhY2ggLT5cbiAgICB0ZW1wLmNsZWFudXBTeW5jKClcblxuICBkZXNjcmliZSBcIkJlYXV0aWZpZXJzXCIsIC0+XG5cbiAgICBiZWF1dGlmaWVyID0gbnVsbFxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYmVhdXRpZmllciA9IG5ldyBCZWF1dGlmaWVyKClcblxuICAgIGRlc2NyaWJlIFwiQmVhdXRpZmllcjo6cnVuXCIsIC0+XG5cbiAgICAgIGl0IFwic2hvdWxkIGVycm9yIHdoZW4gYmVhdXRpZmllcidzIHByb2dyYW0gbm90IGZvdW5kXCIsIC0+XG4gICAgICAgIGV4cGVjdChiZWF1dGlmaWVyKS5ub3QudG9CZShudWxsKVxuICAgICAgICBleHBlY3QoYmVhdXRpZmllciBpbnN0YW5jZW9mIEJlYXV0aWZpZXIpLnRvQmUodHJ1ZSlcblxuICAgICAgICAjIHdhaXRzRm9yUnVucyA9IChmbiwgbWVzc2FnZSwgdGltZW91dCkgLT5cbiAgICAgICAgIyAgICAgaXNDb21wbGV0ZWQgPSBmYWxzZVxuICAgICAgICAjICAgICBjb21wbGV0ZWQgPSAtPlxuICAgICAgICAjICAgICAgICAgY29uc29sZS5sb2coJ2NvbXBsZXRlZCcpXG4gICAgICAgICMgICAgICAgICBpc0NvbXBsZXRlZCA9IHRydWVcbiAgICAgICAgIyAgICAgcnVucyAtPlxuICAgICAgICAjICAgICAgICAgY29uc29sZS5sb2coJ3J1bnMnKVxuICAgICAgICAjICAgICAgICAgZm4oY29tcGxldGVkKVxuICAgICAgICAjICAgICB3YWl0c0ZvcigtPlxuICAgICAgICAjICAgICAgICAgY29uc29sZS5sb2coJ3dhaXRzRm9yJywgaXNDb21wbGV0ZWQpXG4gICAgICAgICMgICAgICAgICBpc0NvbXBsZXRlZFxuICAgICAgICAjICAgICAsIG1lc3NhZ2UsIHRpbWVvdXQpXG4gICAgICAgICNcbiAgICAgICAgIyB3YWl0c0ZvclJ1bnMoKGNiKSAtPlxuICAgICAgICAjICAgICBjb25zb2xlLmxvZygnd2FpdHNGb3JSdW5zJywgY2IpXG4gICAgICAgICMgICAgIHNldFRpbWVvdXQoY2IsIDIwMDApXG4gICAgICAgICMgLCBcIldhaXRpbmcgZm9yIGJlYXV0aWZpY2F0aW9uIHRvIGNvbXBsZXRlXCIsIDUwMDApXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIHNob3VsZFJlamVjdDogdHJ1ZSwgLT5cbiAgICAgICAgICBwID0gYmVhdXRpZmllci5ydW4oXCJwcm9ncmFtXCIsIFtdKVxuICAgICAgICAgIGV4cGVjdChwKS5ub3QudG9CZShudWxsKVxuICAgICAgICAgIGV4cGVjdChwIGluc3RhbmNlb2YgYmVhdXRpZmllci5Qcm9taXNlKS50b0JlKHRydWUpXG4gICAgICAgICAgY2IgPSAodikgLT5cbiAgICAgICAgICAgICMgY29uc29sZS5sb2codilcbiAgICAgICAgICAgIGV4cGVjdCh2KS5ub3QudG9CZShudWxsKVxuICAgICAgICAgICAgZXhwZWN0KHYgaW5zdGFuY2VvZiBFcnJvcikudG9CZSh0cnVlKVxuICAgICAgICAgICAgZXhwZWN0KHYuY29kZSkudG9CZShcIkNvbW1hbmROb3RGb3VuZFwiKVxuICAgICAgICAgICAgZXhwZWN0KHR5cGVvZiB2LmRlc2NyaXB0aW9uKS50b0JlKFwic3RyaW5nXCIsIFxcXG4gICAgICAgICAgICAgICdFcnJvciBzaG91bGQgaGF2ZSBhIGRlc2NyaXB0aW9uLicpXG4gICAgICAgICAgICBleHBlY3Qodi5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAuaW5kZXhPZihcIkV4ZWN1dGFibGUgLSBCZWF1dGlmaWVyIC0gUGF0aFwiKSkudG9CZSgtMSwgXFxcbiAgICAgICAgICAgICAgXCJFcnJvciBzaG91bGQgbm90IGhhdmUgcGF0aE9wdGlvbi5cIilcbiAgICAgICAgICAgIHJldHVybiB2XG4gICAgICAgICAgcC50aGVuKGNiLCBjYilcbiAgICAgICAgICByZXR1cm4gcFxuXG4gICAgICBpdCBcInNob3VsZCBlcnJvciB3aXRoIGhlbHAgZGVzY3JpcHRpb24gXFxcbiAgICAgICAgICAgICAgICB3aGVuIGJlYXV0aWZpZXIncyBwcm9ncmFtIG5vdCBmb3VuZFwiLCAtPlxuICAgICAgICBleHBlY3QoYmVhdXRpZmllcikubm90LnRvQmUobnVsbClcbiAgICAgICAgZXhwZWN0KGJlYXV0aWZpZXIgaW5zdGFuY2VvZiBCZWF1dGlmaWVyKS50b0JlKHRydWUpXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIHNob3VsZFJlamVjdDogdHJ1ZSwgLT5cbiAgICAgICAgICBoZWxwID0ge1xuICAgICAgICAgICAgbGluazogXCJodHRwOi8vdGVzdC5jb21cIlxuICAgICAgICAgICAgcHJvZ3JhbTogXCJ0ZXN0LXByb2dyYW1cIlxuICAgICAgICAgICAgcGF0aE9wdGlvbjogXCJMYW5nIC0gVGVzdCBQcm9ncmFtIFBhdGhcIlxuICAgICAgICAgIH1cbiAgICAgICAgICBwID0gYmVhdXRpZmllci5ydW4oXCJwcm9ncmFtXCIsIFtdLCBoZWxwOiBoZWxwKVxuICAgICAgICAgIGV4cGVjdChwKS5ub3QudG9CZShudWxsKVxuICAgICAgICAgIGV4cGVjdChwIGluc3RhbmNlb2YgYmVhdXRpZmllci5Qcm9taXNlKS50b0JlKHRydWUpXG4gICAgICAgICAgY2IgPSAodikgLT5cbiAgICAgICAgICAgICMgY29uc29sZS5sb2codilcbiAgICAgICAgICAgIGV4cGVjdCh2KS5ub3QudG9CZShudWxsKVxuICAgICAgICAgICAgZXhwZWN0KHYgaW5zdGFuY2VvZiBFcnJvcikudG9CZSh0cnVlKVxuICAgICAgICAgICAgZXhwZWN0KHYuY29kZSkudG9CZShcIkNvbW1hbmROb3RGb3VuZFwiKVxuICAgICAgICAgICAgZXhwZWN0KHYuZGVzY3JpcHRpb24pLm5vdC50b0JlKG51bGwpXG4gICAgICAgICAgICBleHBlY3Qodi5kZXNjcmlwdGlvbi5pbmRleE9mKGhlbHAubGluaykpLm5vdC50b0JlKC0xKVxuICAgICAgICAgICAgZXhwZWN0KHYuZGVzY3JpcHRpb24uaW5kZXhPZihoZWxwLnByb2dyYW0pKS5ub3QudG9CZSgtMSlcbiAgICAgICAgICAgIGV4cGVjdCh2LmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgIC5pbmRleE9mKGhlbHAucGF0aE9wdGlvbikpLm5vdC50b0JlKC0xLCBcXFxuICAgICAgICAgICAgICBcIkVycm9yIHNob3VsZCBoYXZlIGEgZGVzY3JpcHRpb24uXCIpXG4gICAgICAgICAgICByZXR1cm4gdlxuICAgICAgICAgIHAudGhlbihjYiwgY2IpXG4gICAgICAgICAgcmV0dXJuIHBcblxuICAgICAgaXQgXCJzaG91bGQgZXJyb3Igd2l0aCBXaW5kb3dzLXNwZWNpZmljIGhlbHAgZGVzY3JpcHRpb24gXFxcbiAgICAgICAgICAgICAgICB3aGVuIGJlYXV0aWZpZXIncyBwcm9ncmFtIG5vdCBmb3VuZFwiLCAtPlxuICAgICAgICBleHBlY3QoYmVhdXRpZmllcikubm90LnRvQmUobnVsbClcbiAgICAgICAgZXhwZWN0KGJlYXV0aWZpZXIgaW5zdGFuY2VvZiBCZWF1dGlmaWVyKS50b0JlKHRydWUpXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIHNob3VsZFJlamVjdDogdHJ1ZSwgLT5cbiAgICAgICAgICBoZWxwID0ge1xuICAgICAgICAgICAgbGluazogXCJodHRwOi8vdGVzdC5jb21cIlxuICAgICAgICAgICAgcHJvZ3JhbTogXCJ0ZXN0LXByb2dyYW1cIlxuICAgICAgICAgICAgcGF0aE9wdGlvbjogXCJMYW5nIC0gVGVzdCBQcm9ncmFtIFBhdGhcIlxuICAgICAgICAgIH1cbiAgICAgICAgICAjIEZvcmNlIHRvIGJlIFdpbmRvd3NcbiAgICAgICAgICBFeGVjdXRhYmxlLmlzV2luZG93cyA9ICgpIC0+dHJ1ZVxuICAgICAgICAgIHRlcm1pbmFsID0gJ0NNRCBwcm9tcHQnXG4gICAgICAgICAgd2hpY2hDbWQgPSBcIndoZXJlLmV4ZVwiXG4gICAgICAgICAgIyBQcm9jZXNzXG4gICAgICAgICAgcCA9IGJlYXV0aWZpZXIucnVuKFwicHJvZ3JhbVwiLCBbXSwgaGVscDogaGVscClcbiAgICAgICAgICBleHBlY3QocCkubm90LnRvQmUobnVsbClcbiAgICAgICAgICBleHBlY3QocCBpbnN0YW5jZW9mIGJlYXV0aWZpZXIuUHJvbWlzZSkudG9CZSh0cnVlKVxuICAgICAgICAgIGNiID0gKHYpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yXCIsIHYsIHYuZGVzY3JpcHRpb24pXG4gICAgICAgICAgICBleHBlY3Qodikubm90LnRvQmUobnVsbClcbiAgICAgICAgICAgIGV4cGVjdCh2IGluc3RhbmNlb2YgRXJyb3IpLnRvQmUodHJ1ZSlcbiAgICAgICAgICAgIGV4cGVjdCh2LmNvZGUpLnRvQmUoXCJDb21tYW5kTm90Rm91bmRcIilcbiAgICAgICAgICAgIGV4cGVjdCh2LmRlc2NyaXB0aW9uKS5ub3QudG9CZShudWxsKVxuICAgICAgICAgICAgZXhwZWN0KHYuZGVzY3JpcHRpb24uaW5kZXhPZihoZWxwLmxpbmspKS5ub3QudG9CZSgtMSlcbiAgICAgICAgICAgIGV4cGVjdCh2LmRlc2NyaXB0aW9uLmluZGV4T2YoaGVscC5wcm9ncmFtKSkubm90LnRvQmUoLTEpXG4gICAgICAgICAgICBleHBlY3Qodi5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAuaW5kZXhPZihoZWxwLnBhdGhPcHRpb24pKS5ub3QudG9CZSgtMSwgXFxcbiAgICAgICAgICAgICAgXCJFcnJvciBzaG91bGQgaGF2ZSBhIGRlc2NyaXB0aW9uLlwiKVxuICAgICAgICAgICAgZXhwZWN0KHYuZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgLmluZGV4T2YodGVybWluYWwpKS5ub3QudG9CZSgtMSwgXFxcbiAgICAgICAgICAgICAgXCJFcnJvciBzaG91bGQgaGF2ZSBhIGRlc2NyaXB0aW9uIGluY2x1ZGluZyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcje3Rlcm1pbmFsfScgaW4gbWVzc2FnZS5cIilcbiAgICAgICAgICAgIGV4cGVjdCh2LmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgIC5pbmRleE9mKHdoaWNoQ21kKSkubm90LnRvQmUoLTEsIFxcXG4gICAgICAgICAgICAgIFwiRXJyb3Igc2hvdWxkIGhhdmUgYSBkZXNjcmlwdGlvbiBpbmNsdWRpbmcgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3t3aGljaENtZH0nIGluIG1lc3NhZ2UuXCIpXG4gICAgICAgICAgICByZXR1cm4gdlxuICAgICAgICAgIHAudGhlbihjYiwgY2IpXG4gICAgICAgICAgcmV0dXJuIHBcblxuICAgICAgdW5sZXNzIGlzV2luZG93c1xuICAgICAgICBpdCBcInNob3VsZCBlcnJvciB3aXRoIE1hYy9MaW51eC1zcGVjaWZpYyBoZWxwIGRlc2NyaXB0aW9uIFxcXG4gICAgICAgICAgICAgICAgICB3aGVuIGJlYXV0aWZpZXIncyBwcm9ncmFtIG5vdCBmb3VuZFwiLCAtPlxuICAgICAgICAgIGV4cGVjdChiZWF1dGlmaWVyKS5ub3QudG9CZShudWxsKVxuICAgICAgICAgIGV4cGVjdChiZWF1dGlmaWVyIGluc3RhbmNlb2YgQmVhdXRpZmllcikudG9CZSh0cnVlKVxuXG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlIHNob3VsZFJlamVjdDogdHJ1ZSwgLT5cbiAgICAgICAgICAgIGhlbHAgPSB7XG4gICAgICAgICAgICAgIGxpbms6IFwiaHR0cDovL3Rlc3QuY29tXCJcbiAgICAgICAgICAgICAgcHJvZ3JhbTogXCJ0ZXN0LXByb2dyYW1cIlxuICAgICAgICAgICAgICBwYXRoT3B0aW9uOiBcIkxhbmcgLSBUZXN0IFByb2dyYW0gUGF0aFwiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjIEZvcmNlIHRvIGJlIE1hYy9MaW51eCAobm90IFdpbmRvd3MpXG4gICAgICAgICAgICBFeGVjdXRhYmxlLmlzV2luZG93cyA9ICgpIC0+ZmFsc2VcbiAgICAgICAgICAgIHRlcm1pbmFsID0gXCJUZXJtaW5hbFwiXG4gICAgICAgICAgICB3aGljaENtZCA9IFwid2hpY2hcIlxuICAgICAgICAgICAgIyBQcm9jZXNzXG4gICAgICAgICAgICBwID0gYmVhdXRpZmllci5ydW4oXCJwcm9ncmFtXCIsIFtdLCBoZWxwOiBoZWxwKVxuICAgICAgICAgICAgZXhwZWN0KHApLm5vdC50b0JlKG51bGwpXG4gICAgICAgICAgICBleHBlY3QocCBpbnN0YW5jZW9mIGJlYXV0aWZpZXIuUHJvbWlzZSkudG9CZSh0cnVlKVxuICAgICAgICAgICAgY2IgPSAodikgLT5cbiAgICAgICAgICAgICAgIyBjb25zb2xlLmxvZyh2KVxuICAgICAgICAgICAgICBleHBlY3Qodikubm90LnRvQmUobnVsbClcbiAgICAgICAgICAgICAgZXhwZWN0KHYgaW5zdGFuY2VvZiBFcnJvcikudG9CZSh0cnVlKVxuICAgICAgICAgICAgICBleHBlY3Qodi5jb2RlKS50b0JlKFwiQ29tbWFuZE5vdEZvdW5kXCIpXG4gICAgICAgICAgICAgIGV4cGVjdCh2LmRlc2NyaXB0aW9uKS5ub3QudG9CZShudWxsKVxuICAgICAgICAgICAgICBleHBlY3Qodi5kZXNjcmlwdGlvbi5pbmRleE9mKGhlbHAubGluaykpLm5vdC50b0JlKC0xKVxuICAgICAgICAgICAgICBleHBlY3Qodi5kZXNjcmlwdGlvbi5pbmRleE9mKGhlbHAucHJvZ3JhbSkpLm5vdC50b0JlKC0xKVxuICAgICAgICAgICAgICBleHBlY3Qodi5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIC5pbmRleE9mKHRlcm1pbmFsKSkubm90LnRvQmUoLTEsIFxcXG4gICAgICAgICAgICAgICAgXCJFcnJvciBzaG91bGQgaGF2ZSBhIGRlc2NyaXB0aW9uIGluY2x1ZGluZyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyN7dGVybWluYWx9JyBpbiBtZXNzYWdlLlwiKVxuICAgICAgICAgICAgICBleHBlY3Qodi5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIC5pbmRleE9mKHdoaWNoQ21kKSkubm90LnRvQmUoLTEsIFxcXG4gICAgICAgICAgICAgICAgXCJFcnJvciBzaG91bGQgaGF2ZSBhIGRlc2NyaXB0aW9uIGluY2x1ZGluZyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyN7d2hpY2hDbWR9JyBpbiBtZXNzYWdlLlwiKVxuICAgICAgICAgICAgICByZXR1cm4gdlxuICAgICAgICAgICAgcC50aGVuKGNiLCBjYilcbiAgICAgICAgICAgIHJldHVybiBwXG5cbiAgZGVzY3JpYmUgXCJPcHRpb25zXCIsIC0+XG5cbiAgICBlZGl0b3IgPSBudWxsXG4gICAgYmVhdXRpZmllciA9IG51bGxcbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGJlYXV0aWZpZXIgPSBuZXcgQmVhdXRpZmllcnMoKVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oKS50aGVuIChlKSAtPlxuICAgICAgICAgIGVkaXRvciA9IGVcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbChcIlwiKVxuXG4gICAgZGVzY3JpYmUgXCJNaWdyYXRlIFNldHRpbmdzXCIsIC0+XG5cbiAgICAgIG1pZ3JhdGVTZXR0aW5ncyA9IChiZWZvcmVLZXksIGFmdGVyS2V5LCB2YWwpIC0+XG4gICAgICAgICMgc2V0IG9sZCBvcHRpb25zXG4gICAgICAgIGF0b20uY29uZmlnLnNldChcImF0b20tYmVhdXRpZnkuI3tiZWZvcmVLZXl9XCIsIHZhbClcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCBcImF0b20tYmVhdXRpZnk6bWlncmF0ZS1zZXR0aW5nc1wiXG4gICAgICAgICMgQ2hlY2sgcmVzdWx0aW5nIGNvbmZpZ1xuICAgICAgICBleHBlY3QoXy5oYXMoYXRvbS5jb25maWcuZ2V0KCdhdG9tLWJlYXV0aWZ5JyksIGJlZm9yZUtleSkpLnRvQmUoZmFsc2UpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoXCJhdG9tLWJlYXV0aWZ5LiN7YWZ0ZXJLZXl9XCIpKS50b0JlKHZhbClcblxuICAgICAgaXQgXCJzaG91bGQgbWlncmF0ZSBqc19pbmRlbnRfc2l6ZSB0byBqcy5pbmRlbnRfc2l6ZVwiLCAtPlxuICAgICAgICBtaWdyYXRlU2V0dGluZ3MoXCJqc19pbmRlbnRfc2l6ZVwiLFwianMuaW5kZW50X3NpemVcIiwgMSlcbiAgICAgICAgbWlncmF0ZVNldHRpbmdzKFwianNfaW5kZW50X3NpemVcIixcImpzLmluZGVudF9zaXplXCIsIDEwKVxuXG4gICAgICBpdCBcInNob3VsZCBtaWdyYXRlIGFuYWx5dGljcyB0byBnZW5lcmFsLmFuYWx5dGljc1wiLCAtPlxuICAgICAgICBtaWdyYXRlU2V0dGluZ3MoXCJhbmFseXRpY3NcIixcImdlbmVyYWwuYW5hbHl0aWNzXCIsIHRydWUpXG4gICAgICAgIG1pZ3JhdGVTZXR0aW5ncyhcImFuYWx5dGljc1wiLFwiZ2VuZXJhbC5hbmFseXRpY3NcIiwgZmFsc2UpXG5cbiAgICAgIGl0IFwic2hvdWxkIG1pZ3JhdGUgX2FuYWx5dGljc1VzZXJJZCB0byBnZW5lcmFsLl9hbmFseXRpY3NVc2VySWRcIiwgLT5cbiAgICAgICAgbWlncmF0ZVNldHRpbmdzKFwiX2FuYWx5dGljc1VzZXJJZFwiLFwiZ2VuZXJhbC5fYW5hbHl0aWNzVXNlcklkXCIsIFwidXNlcmlkXCIpXG4gICAgICAgIG1pZ3JhdGVTZXR0aW5ncyhcIl9hbmFseXRpY3NVc2VySWRcIixcImdlbmVyYWwuX2FuYWx5dGljc1VzZXJJZFwiLCBcInVzZXJpZDJcIilcblxuICAgICAgaXQgXCJzaG91bGQgbWlncmF0ZSBsYW5ndWFnZV9qc19kaXNhYmxlZCB0byBqcy5kaXNhYmxlZFwiLCAtPlxuICAgICAgICBtaWdyYXRlU2V0dGluZ3MoXCJsYW5ndWFnZV9qc19kaXNhYmxlZFwiLFwianMuZGlzYWJsZWRcIiwgZmFsc2UpXG4gICAgICAgIG1pZ3JhdGVTZXR0aW5ncyhcImxhbmd1YWdlX2pzX2Rpc2FibGVkXCIsXCJqcy5kaXNhYmxlZFwiLCB0cnVlKVxuXG4gICAgICBpdCBcInNob3VsZCBtaWdyYXRlIGxhbmd1YWdlX2pzX2RlZmF1bHRfYmVhdXRpZmllciB0byBqcy5kZWZhdWx0X2JlYXV0aWZpZXJcIiwgLT5cbiAgICAgICAgbWlncmF0ZVNldHRpbmdzKFwibGFuZ3VhZ2VfanNfZGVmYXVsdF9iZWF1dGlmaWVyXCIsXCJqcy5kZWZhdWx0X2JlYXV0aWZpZXJcIiwgXCJQcmV0dHkgRGlmZlwiKVxuICAgICAgICBtaWdyYXRlU2V0dGluZ3MoXCJsYW5ndWFnZV9qc19kZWZhdWx0X2JlYXV0aWZpZXJcIixcImpzLmRlZmF1bHRfYmVhdXRpZmllclwiLCBcIkpTIEJlYXV0aWZ5XCIpXG5cbiAgICAgIGl0IFwic2hvdWxkIG1pZ3JhdGUgbGFuZ3VhZ2VfanNfYmVhdXRpZnlfb25fc2F2ZSB0byBqcy5iZWF1dGlmeV9vbl9zYXZlXCIsIC0+XG4gICAgICAgIG1pZ3JhdGVTZXR0aW5ncyhcImxhbmd1YWdlX2pzX2JlYXV0aWZ5X29uX3NhdmVcIixcImpzLmJlYXV0aWZ5X29uX3NhdmVcIiwgdHJ1ZSlcbiAgICAgICAgbWlncmF0ZVNldHRpbmdzKFwibGFuZ3VhZ2VfanNfYmVhdXRpZnlfb25fc2F2ZVwiLFwianMuYmVhdXRpZnlfb25fc2F2ZVwiLCBmYWxzZSlcblxuICAgIGJlYXV0aWZ5RWRpdG9yID0gKGNhbGxiYWNrKSAtPlxuICAgICAgaXNDb21wbGV0ZSA9IGZhbHNlXG4gICAgICBiZWZvcmVUZXh0ID0gbnVsbFxuICAgICAgZGVsYXkgPSA1MDBcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgYmVmb3JlVGV4dCA9IGVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCBcImF0b20tYmVhdXRpZnk6YmVhdXRpZnktZWRpdG9yXCJcbiAgICAgICAgc2V0VGltZW91dCgtPlxuICAgICAgICAgIGlzQ29tcGxldGUgPSB0cnVlXG4gICAgICAgICwgZGVsYXkpXG4gICAgICB3YWl0c0ZvciAtPlxuICAgICAgICBpc0NvbXBsZXRlXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgYWZ0ZXJUZXh0ID0gZWRpdG9yLmdldFRleHQoKVxuICAgICAgICBleHBlY3QodHlwZW9mIGJlZm9yZVRleHQpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgIGV4cGVjdCh0eXBlb2YgYWZ0ZXJUZXh0KS50b0JlKCdzdHJpbmcnKVxuICAgICAgICByZXR1cm4gY2FsbGJhY2soYmVmb3JlVGV4dCwgYWZ0ZXJUZXh0KVxuXG4gICAgZGVzY3JpYmUgXCJKYXZhU2NyaXB0XCIsIC0+XG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cblxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBwYWNrTmFtZSA9ICdsYW5ndWFnZS1qYXZhc2NyaXB0J1xuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKHBhY2tOYW1lKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAjIFNldHVwIEVkaXRvclxuICAgICAgICAgIGNvZGUgPSBcInZhciBoZWxsbz0nd29ybGQnO2Z1bmN0aW9uKCl7Y29uc29sZS5sb2coJ2hlbGxvICcraGVsbG8pfVwiXG4gICAgICAgICAgZWRpdG9yLnNldFRleHQoY29kZSlcbiAgICAgICAgICAjIGNvbnNvbGUubG9nKGF0b20uZ3JhbW1hcnMuZ3JhbW1hcnNCeVNjb3BlTmFtZSlcbiAgICAgICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5zZWxlY3RHcmFtbWFyKCdzb3VyY2UuanMnKVxuICAgICAgICAgIGV4cGVjdChncmFtbWFyLm5hbWUpLnRvQmUoJ0phdmFTY3JpcHQnKVxuICAgICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGdyYW1tYXIpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRHcmFtbWFyKCkubmFtZSkudG9CZSgnSmF2YVNjcmlwdCcpXG5cbiAgICAgICAgICAjIFNlZSBodHRwczovL2Rpc2N1c3MuYXRvbS5pby90L3NvbHZlZC1zZXR0aW1lb3V0LW5vdC13b3JraW5nLWZpcmluZy1pbi1zcGVjcy10ZXN0cy8xMTQyNy8xN1xuICAgICAgICAgIGphc21pbmUudW5zcHkod2luZG93LCAnc2V0VGltZW91dCcpXG5cbiAgICAgICMgYWZ0ZXJFYWNoIC0+XG4gICAgICAjICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZXMoKVxuICAgICAgIyAgIGF0b20ucGFja2FnZXMudW5sb2FkUGFja2FnZXMoKVxuXG4gICAgICBkZXNjcmliZSBcIi5qc2JlYXV0aWZ5cmNcIiwgLT5cblxuICAgICAgICBpdCBcInNob3VsZCBsb29rIGF0IGRpcmVjdG9yaWVzIGFib3ZlIGZpbGVcIiwgLT5cbiAgICAgICAgICBpc0RvbmUgPSBmYWxzZVxuICAgICAgICAgIGNiID0gKGVycikgLT5cbiAgICAgICAgICAgIGlzRG9uZSA9IHRydWVcbiAgICAgICAgICAgIGV4cGVjdChlcnIpLnRvQmUodW5kZWZpbmVkKVxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAjIGNvbnNvbGUubG9nKCdydW5zJylcbiAgICAgICAgICAgICAgIyBNYWtlIHRvcCBkaXJlY3RvcnlcbiAgICAgICAgICAgICAgdGVtcC5ta2RpcignZGlyMScsIChlcnIsIGRpclBhdGgpIC0+XG4gICAgICAgICAgICAgICAgIyBjb25zb2xlLmxvZyhhcmd1bWVudHMpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNiKGVycikgaWYgZXJyXG4gICAgICAgICAgICAgICAgIyBBZGQgLmpzYmVhdXRpZnlyYyBmaWxlXG4gICAgICAgICAgICAgICAgcmNQYXRoID0gcGF0aC5qb2luKGRpclBhdGgsICcuanNiZWF1dGlmeXJjJylcbiAgICAgICAgICAgICAgICBteURhdGExID0ge1xuICAgICAgICAgICAgICAgICAgaW5kZW50X3NpemU6IDEsXG4gICAgICAgICAgICAgICAgICBpbmRlbnRfY2hhcjogJ1xcdCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbXlEYXRhID0gSlNPTi5zdHJpbmdpZnkobXlEYXRhMSlcbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGUocmNQYXRoLCBteURhdGEsIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAjIGNvbnNvbGUubG9nKGFyZ3VtZW50cylcbiAgICAgICAgICAgICAgICAgIHJldHVybiBjYihlcnIpIGlmIGVyclxuICAgICAgICAgICAgICAgICAgIyBNYWtlIG5leHQgZGlyZWN0b3J5XG4gICAgICAgICAgICAgICAgICBkaXJQYXRoID0gcGF0aC5qb2luKGRpclBhdGgsICdkaXIyJylcbiAgICAgICAgICAgICAgICAgIGZzLm1rZGlyKGRpclBhdGgsIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAgICMgY29uc29sZS5sb2coYXJndW1lbnRzKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2IoZXJyKSBpZiBlcnJcbiAgICAgICAgICAgICAgICAgICAgIyBBZGQgLmpzYmVhdXRpZnlyYyBmaWxlXG4gICAgICAgICAgICAgICAgICAgIHJjUGF0aCA9IHBhdGguam9pbihkaXJQYXRoLCAnLmpzYmVhdXRpZnlyYycpXG4gICAgICAgICAgICAgICAgICAgIG15RGF0YTIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgaW5kZW50X3NpemU6IDIsXG4gICAgICAgICAgICAgICAgICAgICAgaW5kZW50X2NoYXI6ICcgJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG15RGF0YSA9IEpTT04uc3RyaW5naWZ5KG15RGF0YTIpXG4gICAgICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZShyY1BhdGgsIG15RGF0YSwgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAjIGNvbnNvbGUubG9nKGFyZ3VtZW50cylcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2IoZXJyKSBpZiBlcnJcbiAgICAgICAgICAgICAgICAgICAgICBQcm9taXNlLmFsbChiZWF1dGlmaWVyLmdldE9wdGlvbnNGb3JQYXRoKHJjUGF0aCwgbnVsbCkpXG4gICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGFsbE9wdGlvbnMpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAjIGNvbnNvbGUubG9nKCdhbGxPcHRpb25zJywgYWxsT3B0aW9ucylcblxuICAgICAgICAgICAgICAgICAgICAgICAgIyBFeHRyYWN0IG9wdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0b3JPcHRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnT3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvbWVPcHRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRpdG9yQ29uZmlnT3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgXSA9IGFsbE9wdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RPcHRpb25zID0gYWxsT3B0aW9uc1s0Li5dXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgQ2hlY2sgdGhhdCB3ZSBleHRyYWN0ZWQgLmpzYmVhdXRpZnlyYyBmaWxlc1xuICAgICAgICAgICAgICAgICAgICAgICAgW2NvbmZpZzEsIGNvbmZpZzJdID0gcHJvamVjdE9wdGlvbnNbLTIuLl1cblxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0KF8uZ2V0KGNvbmZpZzEsJ19kZWZhdWx0LmluZGVudF9zaXplJykpLnRvQmUobXlEYXRhMS5pbmRlbnRfc2l6ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdChfLmdldChjb25maWcyLCdfZGVmYXVsdC5pbmRlbnRfc2l6ZScpKS50b0JlKG15RGF0YTIuaW5kZW50X3NpemUpXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBlY3QoXy5nZXQoY29uZmlnMSwnX2RlZmF1bHQuaW5kZW50X2NoYXInKSkudG9CZShteURhdGExLmluZGVudF9jaGFyKVxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0KF8uZ2V0KGNvbmZpZzIsJ19kZWZhdWx0LmluZGVudF9jaGFyJykpLnRvQmUobXlEYXRhMi5pbmRlbnRfY2hhcilcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgIGNiKGVycilcbiAgICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgICAgaXNEb25lXG5cblxuICAgICAgZGVzY3JpYmUgXCJQYWNrYWdlIHNldHRpbmdzXCIsIC0+XG5cbiAgICAgICAgZ2V0T3B0aW9ucyA9IChjYWxsYmFjaykgLT5cbiAgICAgICAgICBvcHRpb25zID0gbnVsbFxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgICAgIyBjb25zb2xlLmxvZygnYmVhdXRpZmllcicsIGJlYXV0aWZpZXIuZ2V0T3B0aW9uc0ZvclBhdGgsIGJlYXV0aWZpZXIpXG4gICAgICAgICAgICBhbGxPcHRpb25zID0gYmVhdXRpZmllci5nZXRPcHRpb25zRm9yUGF0aChudWxsLCBudWxsKVxuICAgICAgICAgICAgIyBSZXNvbHZlIG9wdGlvbnMgd2l0aCBwcm9taXNlc1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKGFsbE9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbigoYWxsT3B0aW9ucykgLT5cbiAgICAgICAgICAgICAgb3B0aW9ucyA9IGFsbE9wdGlvbnNcbiAgICAgICAgICAgIClcbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBjYWxsYmFjayhvcHRpb25zKVxuXG4gICAgICAgIGl0IFwic2hvdWxkIGNoYW5nZSBpbmRlbnRfc2l6ZSB0byAxXCIsIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhdG9tLWJlYXV0aWZ5LmpzLmluZGVudF9zaXplJywgMSlcblxuICAgICAgICAgIGdldE9wdGlvbnMgKGFsbE9wdGlvbnMpIC0+XG4gICAgICAgICAgICBleHBlY3QodHlwZW9mIGFsbE9wdGlvbnMpLnRvQmUoJ29iamVjdCcpXG4gICAgICAgICAgICBjb25maWdPcHRpb25zID0gYWxsT3B0aW9uc1sxXVxuICAgICAgICAgICAgZXhwZWN0KHR5cGVvZiBjb25maWdPcHRpb25zKS50b0JlKCdvYmplY3QnKVxuICAgICAgICAgICAgZXhwZWN0KGNvbmZpZ09wdGlvbnMuanMuaW5kZW50X3NpemUpLnRvQmUoMSlcblxuICAgICAgICAgICAgYmVhdXRpZnlFZGl0b3IgKGJlZm9yZVRleHQsIGFmdGVyVGV4dCkgLT5cbiAgICAgICAgICAgICAgIyBjb25zb2xlLmxvZyhiZWZvcmVUZXh0LCBhZnRlclRleHQsIGVkaXRvcilcbiAgICAgICAgICAgICAgZXhwZWN0KGFmdGVyVGV4dCkudG9CZShcIlwiXCJ2YXIgaGVsbG8gPSAnd29ybGQnO1xuXG4gICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2hlbGxvICcgKyBoZWxsbylcbiAgICAgICAgICAgICAgfVwiXCJcIilcblxuICAgICAgICBpdCBcInNob3VsZCBjaGFuZ2UgaW5kZW50X3NpemUgdG8gMTBcIiwgLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F0b20tYmVhdXRpZnkuanMuaW5kZW50X3NpemUnLCAxMClcblxuICAgICAgICAgIGdldE9wdGlvbnMgKGFsbE9wdGlvbnMpIC0+XG4gICAgICAgICAgICBleHBlY3QodHlwZW9mIGFsbE9wdGlvbnMpLnRvQmUoJ29iamVjdCcpXG4gICAgICAgICAgICBjb25maWdPcHRpb25zID0gYWxsT3B0aW9uc1sxXVxuICAgICAgICAgICAgZXhwZWN0KHR5cGVvZiBjb25maWdPcHRpb25zKS50b0JlKCdvYmplY3QnKVxuICAgICAgICAgICAgZXhwZWN0KGNvbmZpZ09wdGlvbnMuanMuaW5kZW50X3NpemUpLnRvQmUoMTApXG5cbiAgICAgICAgICAgIGJlYXV0aWZ5RWRpdG9yIChiZWZvcmVUZXh0LCBhZnRlclRleHQpIC0+XG4gICAgICAgICAgICAgICMgY29uc29sZS5sb2coYmVmb3JlVGV4dCwgYWZ0ZXJUZXh0LCBlZGl0b3IpXG4gICAgICAgICAgICAgIGV4cGVjdChhZnRlclRleHQpLnRvQmUoXCJcIlwidmFyIGhlbGxvID0gJ3dvcmxkJztcblxuICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdoZWxsbyAnICsgaGVsbG8pXG4gICAgICAgICAgICAgIH1cIlwiXCIpXG5cblxuZGVzY3JpYmUgXCJMYW5ndWFnZXNcIiwgLT5cblxuICBsYW5ndWFnZXMgPSBudWxsXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGxhbmd1YWdlcyA9IG5ldyBMYW5ndWFnZXMoKVxuXG4gIGRlc2NyaWJlIFwiTGFuZ3VhZ2VzOjpuYW1lc3BhY2VcIiwgLT5cblxuICAgIGl0IFwic2hvdWxkIHZlcmlmeSB0aGF0IG11bHRpcGxlIGxhbmd1YWdlcyBkbyBub3Qgc2hhcmUgdGhlIHNhbWUgbmFtZXNwYWNlXCIsIC0+XG5cbiAgICAgIG5hbWVzcGFjZUdyb3VwcyA9IF8uZ3JvdXBCeShsYW5ndWFnZXMubGFuZ3VhZ2VzLCBcIm5hbWVzcGFjZVwiKVxuICAgICAgbmFtZXNwYWNlUGFpcnMgPSBfLnRvUGFpcnMobmFtZXNwYWNlR3JvdXBzKVxuICAgICAgbmFtZXNwYWNlT3ZlcmxhcCA9IF8uZmlsdGVyKG5hbWVzcGFjZVBhaXJzLCAoW25hbWVzcGFjZSwgZ3JvdXBdKSAtPiBncm91cC5sZW5ndGggPiAxKVxuICAgICAgIyBjb25zb2xlLmxvZygnbmFtZXNwYWNlcycsIG5hbWVzcGFjZUdyb3VwcywgbmFtZXNwYWNlUGFpcnMsIG5hbWVzcGFjZU92ZXJsYXApXG4gICAgICBleHBlY3QobmFtZXNwYWNlT3ZlcmxhcC5sZW5ndGgpLnRvQmUoMCwgXFxcbiAgICAgICAgXCJMYW5ndWFnZSBuYW1lc3BhY2VzIGFyZSBvdmVybGFwcGluZy5cXG5cXFxuICAgICAgICBOYW1lc3BhY2VzIGFyZSB1bmlxdWU6IG9ubHkgb25lIGxhbmd1YWdlIGZvciBlYWNoIG5hbWVzcGFjZS5cXG5cIitcbiAgICAgICAgXy5tYXAobmFtZXNwYWNlT3ZlcmxhcCwgKFtuYW1lc3BhY2UsIGdyb3VwXSkgLT4gXCItICcje25hbWVzcGFjZX0nOiBDaGVjayBsYW5ndWFnZXMgI3tfLm1hcChncm91cCwgJ25hbWUnKS5qb2luKCcsICcpfSBmb3IgdXNpbmcgbmFtZXNwYWNlICcje25hbWVzcGFjZX0nLlwiKS5qb2luKCdcXG4nKVxuICAgICAgICApXG4iXX0=
