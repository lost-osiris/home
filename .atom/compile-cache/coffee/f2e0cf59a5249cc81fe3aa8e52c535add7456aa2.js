(function() {
  var Beautifiers, JsDiff, beautifier, fs, isWindows, path, shellEnv, unsupportedLangs;

  Beautifiers = require("../src/beautifiers");

  beautifier = new Beautifiers();

  fs = require("fs");

  path = require("path");

  JsDiff = require('diff');

  shellEnv = require('shell-env');

  process.env = shellEnv.sync();

  isWindows = process.platform === 'win32' || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';

  unsupportedLangs = {
    all: [],
    windows: ["ocaml", "r", "clojure", "apex", "bash", "csharp", "d", "elm", "java", "objectivec", "opencl"]
  };

  describe("BeautifyLanguages", function() {
    var allLanguages, config, configs, dependentPackages, fn, i, j, lang, len, len1, optionsDir, results;
    optionsDir = path.resolve(__dirname, "../examples");
    allLanguages = ["c", "clojure", "coffee-script", "css", "d", "html", "java", "javascript", "json", "less", "mustache", "objective-c", "perl", "php", "python", "ruby", "sass", "sql", "svg", "xml", "csharp", "gfm", "marko", "go", "html-swig", "lua"];
    dependentPackages = ['autocomplete-plus'];
    fn = function(lang) {
      return dependentPackages.push("language-" + lang);
    };
    for (i = 0, len = allLanguages.length; i < len; i++) {
      lang = allLanguages[i];
      fn(lang);
    }
    beforeEach(function() {
      var fn1, j, len1, packageName;
      fn1 = function(packageName) {
        return waitsForPromise(function() {
          return atom.packages.activatePackage(packageName);
        });
      };
      for (j = 0, len1 = dependentPackages.length; j < len1; j++) {
        packageName = dependentPackages[j];
        fn1(packageName);
      }
      return waitsForPromise(function() {
        var activationPromise, pack;
        activationPromise = atom.packages.activatePackage('atom-beautify');
        pack = atom.packages.getLoadedPackage("atom-beautify");
        pack.activateNow();
        atom.config.set('atom-beautify.general.loggerLevel', 'info');
        return activationPromise;
      });
    });

    /*
    Directory structure:
     - examples
       - config1
         - lang1
           - original
             - 1 - test.ext
           - expected
             - 1 - test.ext
         - lang2
       - config2
     */
    configs = fs.readdirSync(optionsDir);
    results = [];
    for (j = 0, len1 = configs.length; j < len1; j++) {
      config = configs[j];
      results.push((function(config) {
        var langsDir, optionStats;
        langsDir = path.resolve(optionsDir, config);
        optionStats = fs.lstatSync(langsDir);
        if (optionStats.isDirectory()) {
          return describe("when using configuration '" + config + "'", function() {
            var k, langNames, len2, results1, shouldSkipLang;
            langNames = fs.readdirSync(langsDir);
            results1 = [];
            for (k = 0, len2 = langNames.length; k < len2; k++) {
              lang = langNames[k];
              shouldSkipLang = false;
              if (unsupportedLangs.all.indexOf(lang) !== -1) {
                shouldSkipLang = true;
              }
              if (isWindows && unsupportedLangs.windows.indexOf(lang) !== -1) {
                console.warn("Tests for Windows do not support " + lang);
                shouldSkipLang = true;
              }
              results1.push((function(lang) {
                var expectedDir, langStats, originalDir, testsDir;
                testsDir = path.resolve(langsDir, lang);
                langStats = fs.lstatSync(testsDir);
                if (langStats.isDirectory()) {
                  originalDir = path.resolve(testsDir, "original");
                  if (!fs.existsSync(originalDir)) {
                    console.warn("Directory for test originals/inputs not found." + (" Making it at " + originalDir + "."));
                    fs.mkdirSync(originalDir);
                  }
                  expectedDir = path.resolve(testsDir, "expected");
                  if (!fs.existsSync(expectedDir)) {
                    console.warn("Directory for test expected/results not found." + ("Making it at " + expectedDir + "."));
                    fs.mkdirSync(expectedDir);
                  }
                  return describe((shouldSkipLang ? '#' : '') + "when beautifying language '" + lang + "'", function() {
                    var l, len3, results2, testFileName, testNames;
                    testNames = fs.readdirSync(originalDir);
                    results2 = [];
                    for (l = 0, len3 = testNames.length; l < len3; l++) {
                      testFileName = testNames[l];
                      results2.push((function(testFileName) {
                        var ext, shouldSkip, testName;
                        ext = path.extname(testFileName);
                        testName = path.basename(testFileName, ext);
                        shouldSkip = false;
                        if (testFileName[0] === '_') {
                          shouldSkip = true;
                        }
                        return it("" + (shouldSkip ? '# ' : '') + testName + " " + testFileName, function() {
                          var allOptions, beautifyCompleted, completionFun, expectedContents, expectedTestPath, grammar, grammarName, language, originalContents, originalTestPath, ref, ref1;
                          originalTestPath = path.resolve(originalDir, testFileName);
                          expectedTestPath = path.resolve(expectedDir, testFileName);
                          originalContents = (ref = fs.readFileSync(originalTestPath)) != null ? ref.toString() : void 0;
                          if (!fs.existsSync(expectedTestPath)) {
                            throw new Error(("No matching expected test result found for '" + testName + "' ") + ("at '" + expectedTestPath + "'."));
                          }
                          expectedContents = (ref1 = fs.readFileSync(expectedTestPath)) != null ? ref1.toString() : void 0;
                          grammar = atom.grammars.selectGrammar(originalTestPath, originalContents);
                          grammarName = grammar.name;
                          allOptions = beautifier.getOptionsForPath(originalTestPath);
                          language = beautifier.getLanguage(grammarName, testFileName);
                          beautifyCompleted = false;
                          completionFun = function(text) {
                            var diff, e, fileName, newHeader, newStr, oldHeader, oldStr, opts, selectedBeautifier;
                            try {
                              expect(text instanceof Error).not.toEqual(true, text.message || text.toString());
                              if (text instanceof Error) {
                                return beautifyCompleted = true;
                              }
                              expect(text).not.toEqual(null, "Language or Beautifier not found");
                              if (text === null) {
                                return beautifyCompleted = true;
                              }
                              expect(typeof text).toEqual("string", "Text: " + text);
                              if (typeof text !== "string") {
                                return beautifyCompleted = true;
                              }
                              text = text.replace(/(?:\r\n|\r|\n)/g, '⏎\n');
                              expectedContents = expectedContents.replace(/(?:\r\n|\r|\n)/g, '⏎\n');
                              text = text.replace(/(?:\t)/g, '↹');
                              expectedContents = expectedContents.replace(/(?:\t)/g, '↹');
                              text = text.replace(/(?:\ )/g, '␣');
                              expectedContents = expectedContents.replace(/(?:\ )/g, '␣');
                              if (text !== expectedContents) {
                                fileName = expectedTestPath;
                                oldStr = text;
                                newStr = expectedContents;
                                oldHeader = "beautified";
                                newHeader = "expected";
                                diff = JsDiff.createPatch(fileName, oldStr, newStr, oldHeader, newHeader);
                                opts = beautifier.getOptionsForLanguage(allOptions, language);
                                selectedBeautifier = beautifier.getBeautifierForLanguage(language);
                                if (selectedBeautifier != null) {
                                  opts = beautifier.transformOptions(selectedBeautifier, language.name, opts);
                                }
                                expect(text).toEqual(expectedContents, "Beautifier '" + (selectedBeautifier != null ? selectedBeautifier.name : void 0) + "' output does not match expected output:\n" + diff + "\n\nWith options:\n" + (JSON.stringify(opts, void 0, 4)));
                              }
                              return beautifyCompleted = true;
                            } catch (error) {
                              e = error;
                              console.error(e);
                              return beautifyCompleted = e;
                            }
                          };
                          runs(function() {
                            var e;
                            try {
                              return beautifier.beautify(originalContents, allOptions, grammarName, testFileName).then(completionFun)["catch"](completionFun);
                            } catch (error) {
                              e = error;
                              return beautifyCompleted = e;
                            }
                          });
                          return waitsFor(function() {
                            if (beautifyCompleted instanceof Error) {
                              throw beautifyCompleted;
                            } else {
                              return beautifyCompleted;
                            }
                          }, "Waiting for beautification to complete", 60000);
                        });
                      })(testFileName));
                    }
                    return results2;
                  });
                }
              })(lang));
            }
            return results1;
          });
        }
      })(config));
    }
    return results;
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3BlYy9iZWF1dGlmeS1sYW5ndWFnZXMtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBOztFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsb0JBQVI7O0VBQ2QsVUFBQSxHQUFpQixJQUFBLFdBQUEsQ0FBQTs7RUFDakIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxNQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0VBQ1QsUUFBQSxHQUFXLE9BQUEsQ0FBUSxXQUFSOztFQUdYLE9BQU8sQ0FBQyxHQUFSLEdBQWMsUUFBUSxDQUFDLElBQVQsQ0FBQTs7RUFRZCxTQUFBLEdBQVksT0FBTyxDQUFDLFFBQVIsS0FBb0IsT0FBcEIsSUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQVosS0FBc0IsUUFEWixJQUVWLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBWixLQUFzQjs7RUFFeEIsZ0JBQUEsR0FBbUI7SUFDakIsR0FBQSxFQUFLLEVBRFk7SUFHakIsT0FBQSxFQUFTLENBQ1AsT0FETyxFQUVQLEdBRk8sRUFHUCxTQUhPLEVBS1AsTUFMTyxFQU1QLE1BTk8sRUFPUCxRQVBPLEVBUVAsR0FSTyxFQVNQLEtBVE8sRUFVUCxNQVZPLEVBV1AsWUFYTyxFQVlQLFFBWk8sQ0FIUTs7O0VBbUJuQixRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQTtBQUU1QixRQUFBO0lBQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixhQUF4QjtJQUdiLFlBQUEsR0FBZSxDQUNiLEdBRGEsRUFDUixTQURRLEVBQ0csZUFESCxFQUNvQixLQURwQixFQUMyQixHQUQzQixFQUNnQyxNQURoQyxFQUViLE1BRmEsRUFFTCxZQUZLLEVBRVMs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QW9CLEVBcER0Qjs7MEJBRGM7MEJBdURoQixJQUFBLENBQUssU0FBQTtBQUNILGdDQUFBO0FBQUE7cUNBQ0UsVUFBVSxDQUFDLFFBQVgsQ0FBb0IsZ0JBQXBCLEVBQXNDLFVBQXRDLEVBQWtELFdBQWxELEVBQStELFlBQS9ELENBQ0EsQ0FBQyxJQURELENBQ00sYUFETixDQUVBLEVBQUMsS0FBRCxFQUZBLENBRU8sYUFGUCxFQURGOzZCQUFBLGFBQUE7OEJBSU07cUNBQ0osaUJBQUEsR0FBb0IsRUFMdEI7OzBCQURHLENBQUw7aUNBUUEsUUFBQSxDQUFTLFNBQUE7NEJBQ1AsSUFBRyxpQkFBQSxZQUE2QixLQUFoQztBQUNFLG9DQUFNLGtCQURSOzZCQUFBLE1BQUE7QUFHRSxxQ0FBTyxrQkFIVDs7MEJBRE8sQ0FBVCxFQUtFLHdDQUxGLEVBSzRDLEtBTDVDO3dCQTNGa0UsQ0FBcEU7c0JBVEMsQ0FBQSxDQUFILENBQUksWUFBSjtBQURGOztrQkFKbUYsQ0FBckYsRUFmRjs7Y0FMQyxDQUFBLENBQUgsQ0FBSSxJQUFKO0FBVEY7O1VBSCtDLENBQWpELEVBRkY7O01BTEMsQ0FBQSxDQUFILENBQUksTUFBSjtBQURGOztFQWxFNEIsQ0FBOUI7QUF2Q0EiLCJzb3VyY2VzQ29udGVudCI6WyIjIEJlYXV0aWZ5ID0gcmVxdWlyZSAnLi4vc3JjL2JlYXV0aWZ5J1xuQmVhdXRpZmllcnMgPSByZXF1aXJlIFwiLi4vc3JjL2JlYXV0aWZpZXJzXCJcbmJlYXV0aWZpZXIgPSBuZXcgQmVhdXRpZmllcnMoKVxuZnMgPSByZXF1aXJlIFwiZnNcIlxucGF0aCA9IHJlcXVpcmUgXCJwYXRoXCJcbkpzRGlmZiA9IHJlcXVpcmUoJ2RpZmYnKVxuc2hlbGxFbnYgPSByZXF1aXJlKCdzaGVsbC1lbnYnKVxuXG4jIEZpeCBodHRwczovL2Rpc2N1c3MuYXRvbS5pby90L3NwZWNzLWRvLW5vdC1sb2FkLXNoZWxsLWVudmlyb25tZW50LXZhcmlhYmxlcy1hY3RpdmF0aW9uaG9va3MtY29yZS1sb2FkZWQtc2hlbGwtZW52aXJvbm1lbnQvNDQxOTlcbnByb2Nlc3MuZW52ID0gc2hlbGxFbnYuc3luYygpXG5cbiMgVXNlIHRoZSBjb21tYW5kIGB3aW5kb3c6cnVuLXBhY2thZ2Utc3BlY3NgIChjbWQtYWx0LWN0cmwtcCkgdG8gcnVuIHNwZWNzLlxuI1xuIyBUbyBydW4gYSBzcGVjaWZpYyBgaXRgIG9yIGBkZXNjcmliZWAgYmxvY2sgYWRkIGFuIGBmYCB0byB0aGUgZnJvbnQgKGUuZy4gYGZpdGBcbiMgb3IgYGZkZXNjcmliZWApLiBSZW1vdmUgdGhlIGBmYCB0byB1bmZvY3VzIHRoZSBibG9jay5cblxuIyBDaGVjayBpZiBXaW5kb3dzXG5pc1dpbmRvd3MgPSBwcm9jZXNzLnBsYXRmb3JtIGlzICd3aW4zMicgb3JcbiAgcHJvY2Vzcy5lbnYuT1NUWVBFIGlzICdjeWd3aW4nIG9yXG4gIHByb2Nlc3MuZW52Lk9TVFlQRSBpcyAnbXN5cydcblxudW5zdXBwb3J0ZWRMYW5ncyA9IHtcbiAgYWxsOiBbXG4gIF1cbiAgd2luZG93czogW1xuICAgIFwib2NhbWxcIlxuICAgIFwiclwiXG4gICAgXCJjbG9qdXJlXCJcbiAgICAjIEJyb2tlblxuICAgIFwiYXBleFwiXG4gICAgXCJiYXNoXCJcbiAgICBcImNzaGFycFwiXG4gICAgXCJkXCJcbiAgICBcImVsbVwiXG4gICAgXCJqYXZhXCJcbiAgICBcIm9iamVjdGl2ZWNcIlxuICAgIFwib3BlbmNsXCJcbiAgXVxufVxuXG5kZXNjcmliZSBcIkJlYXV0aWZ5TGFuZ3VhZ2VzXCIsIC0+XG5cbiAgb3B0aW9uc0RpciA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vZXhhbXBsZXNcIilcblxuICAjIEFjdGl2YXRlIGFsbCBvZiB0aGUgbGFuZ3VhZ2VzXG4gIGFsbExhbmd1YWdlcyA9IFtcbiAgICBcImNcIiwgXCJjbG9qdXJlXCIsIFwiY29mZmVlLXNjcmlwdFwiLCBcImNzc1wiLCBcImRcIiwgXCJodG1sXCIsXG4gICAgXCJqYXZhXCIsIFwiamF2YXNjcmlwdFwiLCBcImpzb25cIiwgXCJsZXNzXCIsXG4gICAgXCJtdXN0YWNoZVwiLCBcIm9iamVjdGl2ZS1jXCIsIFwicGVybFwiLCBcInBocFwiLFxuICAgIFwicHl0aG9uXCIsIFwicnVieVwiLCBcInNhc3NcIiwgXCJzcWxcIiwgXCJzdmdcIixcbiAgICBcInhtbFwiLCBcImNzaGFycFwiLCBcImdmbVwiLCBcIm1hcmtvXCIsXG4gICAgXCJnb1wiLCBcImh0bWwtc3dpZ1wiLCBcImx1YVwiXG4gICAgXVxuICAjIEFsbCBBdG9tIHBhY2thZ2VzIHRoYXQgQXRvbSBCZWF1dGlmeSBpcyBkZXBlbmRlbnQgb25cbiAgZGVwZW5kZW50UGFja2FnZXMgPSBbXG4gICAgJ2F1dG9jb21wbGV0ZS1wbHVzJ1xuICAgICMgJ2xpbnRlcidcbiAgICAjICAgJ2F0b20tdHlwZXNjcmlwdCcgIyBpdCBsb2dzIHRvbyBtdWNoLi4uXG4gIF1cbiAgIyBBZGQgbGFuZ3VhZ2UgcGFja2FnZXMgdG8gZGVwZW5kZW50UGFja2FnZXNcbiAgZm9yIGxhbmcgaW4gYWxsTGFuZ3VhZ2VzXG4gICAgZG8gKGxhbmcpIC0+XG4gICAgICBkZXBlbmRlbnRQYWNrYWdlcy5wdXNoKFwibGFuZ3VhZ2UtI3tsYW5nfVwiKVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICAjIEluc3RhbGwgYWxsIG9mIHRoZSBsYW5ndWFnZXNcbiAgICBmb3IgcGFja2FnZU5hbWUgaW4gZGVwZW5kZW50UGFja2FnZXNcbiAgICAgIGRvIChwYWNrYWdlTmFtZSkgLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UocGFja2FnZU5hbWUpXG5cbiAgICAjIEFjdGl2YXRlIHBhY2thZ2VcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGFjdGl2YXRpb25Qcm9taXNlID0gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F0b20tYmVhdXRpZnknKVxuICAgICAgIyBGb3JjZSBhY3RpdmF0ZSBwYWNrYWdlXG4gICAgICBwYWNrID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKFwiYXRvbS1iZWF1dGlmeVwiKVxuICAgICAgcGFjay5hY3RpdmF0ZU5vdygpXG4gICAgICAjIE5lZWQgbW9yZSBkZWJ1Z2dpbmcgb24gV2luZG93c1xuICAgICAgIyBDaGFuZ2UgbG9nZ2VyIGxldmVsXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F0b20tYmVhdXRpZnkuZ2VuZXJhbC5sb2dnZXJMZXZlbCcsICdpbmZvJylcbiAgICAgICMgUmV0dXJuIHByb21pc2VcbiAgICAgIHJldHVybiBhY3RpdmF0aW9uUHJvbWlzZVxuXG4gICAgIyBTZXQgVW5jcnVzdGlmeSBjb25maWcgcGF0aFxuICAgICMgdW5jcnVzdGlmeUNvbmZpZ1BhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL2V4YW1wbGVzL25lc3RlZC1qc2JlYXV0aWZ5cmMvdW5jcnVzdGlmeS5jZmdcIilcbiAgICAjIHVuY3J1c3RpZnlMYW5ncyA9IFtcImFwZXhcIiwgXCJjXCIsIFwiY3BwXCIsIFwib2JqZWN0aXZlY1wiLCBcImNzXCIsIFwiZFwiLCBcImphdmFcIiwgXCJwYXduXCIsIFwidmFsYVwiXVxuICAgICMgZm9yIGxhbmcgaW4gdW5jcnVzdGlmeUxhbmdzXG4gICAgIyAgICAgZG8gKGxhbmcpIC0+XG4gICAgICAjIGF0b20uY29uZmlnLnNldChcImF0b20tYmVhdXRpZnkuI3tsYW5nfV9jb25maWdQYXRoXCIsIHVuY3J1c3RpZnlDb25maWdQYXRoKVxuICAgICAgIyBleHBlY3QoYXRvbS5jb25maWcuZ2V0KFwiYXRvbS1iZWF1dGlmeS4je2xhbmd9X2NvbmZpZ1BhdGhcIikpLnRvRXF1YWwoXCJURVNUXCIpXG5cbiAgIyMjXG4gIERpcmVjdG9yeSBzdHJ1Y3R1cmU6XG4gICAtIGV4YW1wbGVzXG4gICAgIC0gY29uZmlnMVxuICAgICAgIC0gbGFuZzFcbiAgICAgICAgIC0gb3JpZ2luYWxcbiAgICAgICAgICAgLSAxIC0gdGVzdC5leHRcbiAgICAgICAgIC0gZXhwZWN0ZWRcbiAgICAgICAgICAgLSAxIC0gdGVzdC5leHRcbiAgICAgICAtIGxhbmcyXG4gICAgIC0gY29uZmlnMlxuICAjIyNcblxuICAjIEFsbCBDb25maWd1cmF0aW9uc1xuICBjb25maWdzID0gZnMucmVhZGRpclN5bmMob3B0aW9uc0RpcilcbiAgZm9yIGNvbmZpZyBpbiBjb25maWdzXG4gICAgZG8gKGNvbmZpZykgLT5cbiAgICAgICMgR2VuZXJhdGUgdGhlIHBhdGggdG8gd2hlcmUgYWxsIG9mIHRoZSBsYW5ndWFnZXMgYXJlXG4gICAgICBsYW5nc0RpciA9IHBhdGgucmVzb2x2ZShvcHRpb25zRGlyLCBjb25maWcpXG4gICAgICBvcHRpb25TdGF0cyA9IGZzLmxzdGF0U3luYyhsYW5nc0RpcilcbiAgICAgICMgQ29uZmlybSB0aGF0IHRoaXMgcGF0aCBpcyBhIGRpcmVjdG9yeVxuICAgICAgaWYgb3B0aW9uU3RhdHMuaXNEaXJlY3RvcnkoKVxuICAgICAgICAjIENyZWF0ZSB0ZXN0aW5nIGdyb3VwIGZvciBjb25maWd1cmF0aW9uXG4gICAgICAgIGRlc2NyaWJlIFwid2hlbiB1c2luZyBjb25maWd1cmF0aW9uICcje2NvbmZpZ30nXCIsIC0+XG4gICAgICAgICAgIyBBbGwgTGFuZ3VhZ2VzIGZvciBjb25maWd1cmF0aW9uXG4gICAgICAgICAgbGFuZ05hbWVzID0gZnMucmVhZGRpclN5bmMobGFuZ3NEaXIpXG4gICAgICAgICAgZm9yIGxhbmcgaW4gbGFuZ05hbWVzXG5cbiAgICAgICAgICAgIHNob3VsZFNraXBMYW5nID0gZmFsc2VcbiAgICAgICAgICAgIGlmIHVuc3VwcG9ydGVkTGFuZ3MuYWxsLmluZGV4T2YobGFuZykgaXNudCAtMVxuICAgICAgICAgICAgICBzaG91bGRTa2lwTGFuZyA9IHRydWVcbiAgICAgICAgICAgIGlmIGlzV2luZG93cyBhbmQgdW5zdXBwb3J0ZWRMYW5ncy53aW5kb3dzLmluZGV4T2YobGFuZykgaXNudCAtMVxuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJUZXN0cyBmb3IgV2luZG93cyBkbyBub3Qgc3VwcG9ydCAje2xhbmd9XCIpXG4gICAgICAgICAgICAgIHNob3VsZFNraXBMYW5nID0gdHJ1ZVxuXG4gICAgICAgICAgICBkbyAobGFuZykgLT5cbiAgICAgICAgICAgICAgIyBHZW5lcmF0ZSB0aGUgcGF0aCB0byB3aGVyZSBhbCBvZiB0aGUgdGVzdHMgYXJlXG4gICAgICAgICAgICAgIHRlc3RzRGlyID0gcGF0aC5yZXNvbHZlKGxhbmdzRGlyLCBsYW5nKVxuICAgICAgICAgICAgICBsYW5nU3RhdHMgPSBmcy5sc3RhdFN5bmModGVzdHNEaXIpXG4gICAgICAgICAgICAgICMgQ29uZmlybSB0aGF0IHRoaXMgcGF0aCBpcyBhIGRpcmVjdG9yeVxuICAgICAgICAgICAgICBpZiBsYW5nU3RhdHMuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICAgICMgT3JpZ2luYWxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbERpciA9IHBhdGgucmVzb2x2ZSh0ZXN0c0RpciwgXCJvcmlnaW5hbFwiKVxuICAgICAgICAgICAgICAgIGlmIG5vdCBmcy5leGlzdHNTeW5jKG9yaWdpbmFsRGlyKVxuICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiRGlyZWN0b3J5IGZvciB0ZXN0IG9yaWdpbmFscy9pbnB1dHMgbm90IGZvdW5kLlwiICtcbiAgICAgICAgICAgICAgICAgICAgXCIgTWFraW5nIGl0IGF0ICN7b3JpZ2luYWxEaXJ9LlwiKVxuICAgICAgICAgICAgICAgICAgZnMubWtkaXJTeW5jKG9yaWdpbmFsRGlyKVxuICAgICAgICAgICAgICAgICMgRXhwZWN0ZWRcbiAgICAgICAgICAgICAgICBleHBlY3RlZERpciA9IHBhdGgucmVzb2x2ZSh0ZXN0c0RpciwgXCJleHBlY3RlZFwiKVxuICAgICAgICAgICAgICAgIGlmIG5vdCBmcy5leGlzdHNTeW5jKGV4cGVjdGVkRGlyKVxuICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiRGlyZWN0b3J5IGZvciB0ZXN0IGV4cGVjdGVkL3Jlc3VsdHMgbm90IGZvdW5kLlwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJNYWtpbmcgaXQgYXQgI3tleHBlY3RlZERpcn0uXCIpXG4gICAgICAgICAgICAgICAgICBmcy5ta2RpclN5bmMoZXhwZWN0ZWREaXIpXG5cbiAgICAgICAgICAgICAgICAjIExhbmd1YWdlIGdyb3VwIHRlc3RzXG4gICAgICAgICAgICAgICAgZGVzY3JpYmUgXCIje2lmIHNob3VsZFNraXBMYW5nIHRoZW4gJyMnIGVsc2UgJyd9d2hlbiBiZWF1dGlmeWluZyBsYW5ndWFnZSAnI3tsYW5nfSdcIiwgLT5cblxuICAgICAgICAgICAgICAgICAgIyBBbGwgdGVzdHMgZm9yIGxhbmd1YWdlXG4gICAgICAgICAgICAgICAgICB0ZXN0TmFtZXMgPSBmcy5yZWFkZGlyU3luYyhvcmlnaW5hbERpcilcbiAgICAgICAgICAgICAgICAgIGZvciB0ZXN0RmlsZU5hbWUgaW4gdGVzdE5hbWVzXG4gICAgICAgICAgICAgICAgICAgIGRvICh0ZXN0RmlsZU5hbWUpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgZXh0ID0gcGF0aC5leHRuYW1lKHRlc3RGaWxlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICB0ZXN0TmFtZSA9IHBhdGguYmFzZW5hbWUodGVzdEZpbGVOYW1lLCBleHQpXG4gICAgICAgICAgICAgICAgICAgICAgIyBJZiBwcmVmaXhlZCB3aXRoIHVuZGVyc2NvcmUgKF8pIHRoZW4gdGhpcyBpcyBhIGhpZGRlbiB0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgc2hvdWxkU2tpcCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgaWYgdGVzdEZpbGVOYW1lWzBdIGlzICdfJ1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBEbyBub3Qgc2hvdyB0aGlzIHRlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZFNraXAgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgIyBDb25maXJtIHRoaXMgaXMgYSB0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgaXQgXCIje2lmIHNob3VsZFNraXAgdGhlbiAnIyAnIGVsc2UgJyd9I3t0ZXN0TmFtZX0gI3t0ZXN0RmlsZU5hbWV9XCIsIC0+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgR2VuZXJhdGUgcGF0aHMgdG8gdGVzdCBmaWxlc1xuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxUZXN0UGF0aCA9IHBhdGgucmVzb2x2ZShvcmlnaW5hbERpciwgdGVzdEZpbGVOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWRUZXN0UGF0aCA9IHBhdGgucmVzb2x2ZShleHBlY3RlZERpciwgdGVzdEZpbGVOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBHZXQgY29udGVudHMgb2Ygb3JpZ2luYWwgdGVzdCBmaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbENvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKG9yaWdpbmFsVGVzdFBhdGgpPy50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAjIENoZWNrIGlmIHRoZXJlIGlzIGEgbWF0Y2hpbmcgZXhwZWN0ZWQgdGVzdCByZXN1dFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm90IGZzLmV4aXN0c1N5bmMoZXhwZWN0ZWRUZXN0UGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gbWF0Y2hpbmcgZXhwZWN0ZWQgdGVzdCByZXN1bHQgZm91bmQgZm9yICcje3Rlc3ROYW1lfScgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXQgJyN7ZXhwZWN0ZWRUZXN0UGF0aH0nLlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAjIGVyciA9IGZzLndyaXRlRmlsZVN5bmMoZXhwZWN0ZWRUZXN0UGF0aCwgb3JpZ2luYWxDb250ZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIyB0aHJvdyBlcnIgaWYgZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEdldCBjb250ZW50cyBvZiBleHBlY3RlZCB0ZXN0IGZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkQ29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoZXhwZWN0ZWRUZXN0UGF0aCk/LnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICMgZXhwZWN0KGV4cGVjdGVkQ29udGVudHMpLm5vdC50b0VxdWFsIG9yaWdpbmFsQ29udGVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICMgZXhwZWN0KGF0b20uZ3JhbW1hcnMuZ2V0R3JhbW1hcnMoKSkudG9FcXVhbCBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuc2VsZWN0R3JhbW1hcihvcmlnaW5hbFRlc3RQYXRoLCBvcmlnaW5hbENvbnRlbnRzKVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBleHBlY3QoZ3JhbW1hcikudG9FcXVhbChcInRlc3RcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyYW1tYXJOYW1lID0gZ3JhbW1hci5uYW1lXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgR2V0IHRoZSBvcHRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxPcHRpb25zID0gYmVhdXRpZmllci5nZXRPcHRpb25zRm9yUGF0aChvcmlnaW5hbFRlc3RQYXRoKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEdldCBsYW5ndWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2UgPSBiZWF1dGlmaWVyLmdldExhbmd1YWdlKGdyYW1tYXJOYW1lLCB0ZXN0RmlsZU5hbWUpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJlYXV0aWZ5Q29tcGxldGVkID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRpb25GdW4gPSAodGV4dCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0KHRleHQgaW5zdGFuY2VvZiBFcnJvcikubm90LnRvRXF1YWwodHJ1ZSwgdGV4dC5tZXNzYWdlIG9yIHRleHQudG9TdHJpbmcoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmVhdXRpZnlDb21wbGV0ZWQgPSB0cnVlIGlmIHRleHQgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAjICAgbG9nZ2VyLnZlcmJvc2UoZXhwZWN0ZWRUZXN0UGF0aCwgdGV4dCkgaWYgZXh0IGlzIFwiLmxlc3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAjICAgaWYgdGV4dCBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICMgICAgIHJldHVybiBiZWF1dGlmeUNvbXBsZXRlZCA9IHRleHQgIyB0ZXh0ID09IEVycm9yXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3QodGV4dCkubm90LnRvRXF1YWwobnVsbCwgXCJMYW5ndWFnZSBvciBCZWF1dGlmaWVyIG5vdCBmb3VuZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBiZWF1dGlmeUNvbXBsZXRlZCA9IHRydWUgaWYgdGV4dCBpcyBudWxsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3QodHlwZW9mIHRleHQpLnRvRXF1YWwoXCJzdHJpbmdcIiwgXCJUZXh0OiAje3RleHR9XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJlYXV0aWZ5Q29tcGxldGVkID0gdHJ1ZSBpZiB0eXBlb2YgdGV4dCBpc250IFwic3RyaW5nXCJcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgUmVwbGFjZSBOZXdsaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyg/OlxcclxcbnxcXHJ8XFxuKS9nLCAn4o+OXFxuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZENvbnRlbnRzID0gZXhwZWN0ZWRDb250ZW50c1xcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKD86XFxyXFxufFxccnxcXG4pL2csICfij45cXG4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgUmVwbGFjZSB0YWJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvKD86XFx0KS9nLCAn4oa5JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZENvbnRlbnRzID0gZXhwZWN0ZWRDb250ZW50c1xcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKD86XFx0KS9nLCAn4oa5JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIFJlcGxhY2Ugc3BhY2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvKD86XFwgKS9nLCAn4pCjJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZENvbnRlbnRzID0gZXhwZWN0ZWRDb250ZW50c1xcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKD86XFwgKS9nLCAn4pCjJylcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgQ2hlY2sgZm9yIGJlYXV0aWZpY2F0aW9uIGVycm9yc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHRleHQgaXNudCBleHBlY3RlZENvbnRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIGNvbnNvbGUud2FybihhbGxPcHRpb25zLCB0ZXh0LCBleHBlY3RlZENvbnRlbnRzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUgPSBleHBlY3RlZFRlc3RQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRTdHI9dGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RyPWV4cGVjdGVkQ29udGVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZEhlYWRlcj1cImJlYXV0aWZpZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3SGVhZGVyPVwiZXhwZWN0ZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IEpzRGlmZi5jcmVhdGVQYXRjaChmaWxlTmFtZSwgb2xkU3RyLCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTdHIsIG9sZEhlYWRlciwgbmV3SGVhZGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBHZXQgb3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0cyA9IGJlYXV0aWZpZXIuZ2V0T3B0aW9uc0Zvckxhbmd1YWdlKGFsbE9wdGlvbnMsIGxhbmd1YWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRCZWF1dGlmaWVyID0gYmVhdXRpZmllci5nZXRCZWF1dGlmaWVyRm9yTGFuZ3VhZ2UobGFuZ3VhZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBzZWxlY3RlZEJlYXV0aWZpZXI/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdHMgPSBiZWF1dGlmaWVyLnRyYW5zZm9ybU9wdGlvbnMoc2VsZWN0ZWRCZWF1dGlmaWVyLCBsYW5ndWFnZS5uYW1lLCBvcHRzKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIFNob3cgZXJyb3IgbWVzc2FnZSB3aXRoIGRlYnVnIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3QodGV4dCkudG9FcXVhbChleHBlY3RlZENvbnRlbnRzLCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkJlYXV0aWZpZXIgJyN7c2VsZWN0ZWRCZWF1dGlmaWVyPy5uYW1lfScgb3V0cHV0IGRvZXMgbm90IG1hdGNoIGV4cGVjdGVkIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDpcXG4je2RpZmZ9XFxuXFxuXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV2l0aCBvcHRpb25zOlxcblxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICN7SlNPTi5zdHJpbmdpZnkob3B0cywgdW5kZWZpbmVkLCA0KX1cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIEFsbCBkb25lIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlYXV0aWZ5Q29tcGxldGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlYXV0aWZ5Q29tcGxldGVkID0gZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlYXV0aWZpZXIuYmVhdXRpZnkob3JpZ2luYWxDb250ZW50cywgYWxsT3B0aW9ucywgZ3JhbW1hck5hbWUsIHRlc3RGaWxlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihjb21wbGV0aW9uRnVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChjb21wbGV0aW9uRnVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVhdXRpZnlDb21wbGV0ZWQgPSBlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdhaXRzRm9yKC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGJlYXV0aWZ5Q29tcGxldGVkIGluc3RhbmNlb2YgRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBiZWF1dGlmeUNvbXBsZXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJlYXV0aWZ5Q29tcGxldGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAsIFwiV2FpdGluZyBmb3IgYmVhdXRpZmljYXRpb24gdG8gY29tcGxldGVcIiwgNjAwMDApXG4iXX0=
