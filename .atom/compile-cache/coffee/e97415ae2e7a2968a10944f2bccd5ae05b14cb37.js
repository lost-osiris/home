(function() {
  var AutoIndent, CompositeDisposable, INTERFILESAVETIME, LB, autoCompleteJSX, autoCompleteStyledComponents, observeStatusBarGrammarNameTimer, observeStatusBarGrammarNameTimerCalled, ttlGrammar;

  CompositeDisposable = require('atom').CompositeDisposable;

  autoCompleteJSX = require('./auto-complete-jsx');

  autoCompleteStyledComponents = require('./auto-complete-styled-components');

  AutoIndent = require('./auto-indent');

  ttlGrammar = require('./create-ttl-grammar');

  INTERFILESAVETIME = 1000;

  LB = 'language-babel';

  observeStatusBarGrammarNameTimer = null;

  observeStatusBarGrammarNameTimerCalled = 0;

  module.exports = {
    activate: function(state) {
      observeStatusBarGrammarNameTimer = setInterval(this.observeStatusBarGrammarName.bind(this), 1000);
      autoCompleteStyledComponents.loadProperties();
      if (this.transpiler == null) {
        this.transpiler = new (require('./transpiler'));
      }
      this.ttlGrammar = new ttlGrammar(true);
      this.disposable = new CompositeDisposable;
      this.textEditors = {};
      this.fileSaveTimes = {};
      this.disposable.add(atom.packages.onDidActivatePackage(this.isPackageCompatible));
      this.disposable.add(atom.project.onDidChangePaths((function(_this) {
        return function() {
          return _this.transpiler.stopUnusedTasks();
        };
      })(this)));
      return this.disposable.add(atom.workspace.observeTextEditors((function(_this) {
        return function(textEditor) {
          _this.textEditors[textEditor.id] = new CompositeDisposable;
          _this.textEditors[textEditor.id].add(textEditor.observeGrammar(function(grammar) {
            var ref, ref1, ref2;
            if (textEditor.getGrammar().packageName === LB) {
              return _this.textEditors[textEditor.id].autoIndent = new AutoIndent(textEditor);
            } else {
              if ((ref = _this.textEditors[textEditor.id]) != null) {
                if ((ref1 = ref.autoIndent) != null) {
                  ref1.destroy();
                }
              }
              return delete (((ref2 = _this.textEditors[textEditor.id]) != null ? ref2.autoIndent : void 0) != null);
            }
          }));
          _this.textEditors[textEditor.id].add(textEditor.onDidSave(function(event) {
            var filePath, lastSaveTime, ref;
            if (textEditor.getGrammar().packageName === LB) {
              filePath = textEditor.getPath();
              lastSaveTime = (ref = _this.fileSaveTimes[filePath]) != null ? ref : 0;
              _this.fileSaveTimes[filePath] = Date.now();
              if (lastSaveTime < (_this.fileSaveTimes[filePath] - INTERFILESAVETIME)) {
                return _this.transpiler.transpile(filePath, textEditor);
              }
            }
          }));
          return _this.textEditors[textEditor.id].add(textEditor.onDidDestroy(function() {
            var filePath, ref, ref1, ref2;
            if ((ref = _this.textEditors[textEditor.id]) != null) {
              if ((ref1 = ref.autoIndent) != null) {
                ref1.destroy();
              }
            }
            delete (((ref2 = _this.textEditors[textEditor.id]) != null ? ref2.autoIndent : void 0) != null);
            filePath = textEditor.getPath();
            if (_this.fileSaveTimes[filePath] != null) {
              delete _this.fileSaveTimes[filePath];
            }
            _this.textEditors[textEditor.id].dispose();
            return delete _this.textEditors[textEditor.id];
          }));
        };
      })(this)));
    },
    deactivate: function() {
      var disposeable, id, ref, ref1;
      this.disposable.dispose();
      ref = this.textEditors;
      for (id in ref) {
        disposeable = ref[id];
        if (this.textEditors[id].autoIndent != null) {
          this.textEditors[id].autoIndent.destroy();
          delete this.textEditors[id].autoIndent;
        }
        disposeable.dispose();
      }
      this.transpiler.stopAllTranspilerTask();
      this.transpiler.disposables.dispose();
      this.ttlGrammar.destroy();
      return (ref1 = this.mutateStatusGrammarNameObserver) != null ? ref1.disconnet() : void 0;
    },
    isPackageCompatible: function(activatedPackage) {
      var incompatiblePackage, incompatiblePackages, reason, results;
      incompatiblePackages = {
        'source-preview-babel': "Both vie to preview the same file.",
        'source-preview-react': "Both vie to preview the same file.",
        'react': "The Atom community package 'react' (not to be confused \nwith Facebook React) monkey patches the atom methods \nthat provide autoindent features for JSX. \nAs it detects JSX scopes without regard to the grammar being used, \nit tries to auto indent JSX that is highlighted by language-babel. \nAs language-babel also attempts to do auto indentation using \nstandard atom API's, this creates a potential conflict."
      };
      results = [];
      for (incompatiblePackage in incompatiblePackages) {
        reason = incompatiblePackages[incompatiblePackage];
        if (activatedPackage.name === incompatiblePackage) {
          results.push(atom.notifications.addInfo('Incompatible Package Detected', {
            dismissable: true,
            detail: "language-babel has detected the presence of an incompatible Atom package named '" + activatedPackage.name + "'. \n \nIt is recommended that you disable either '" + activatedPackage.name + "' or language-babel \n \nReason:\n \n" + reason
          }));
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    autoCompleteProvider: function() {
      return [autoCompleteJSX, autoCompleteStyledComponents];
    },
    provide: function() {
      return this.transpiler;
    },
    observeStatusBarGrammarName: function() {
      var config, mutateStatusGrammarNameObserver, ref, target;
      target = document.getElementsByTagName('grammar-selector-status');
      if (++observeStatusBarGrammarNameTimerCalled > 60) {
        clearInterval(observeStatusBarGrammarNameTimer);
        observeStatusBarGrammarNameTimerCalled = 0;
      }
      if (target.length === 1) {
        target = (ref = target[0].childNodes) != null ? ref[0] : void 0;
        if (target) {
          clearInterval(observeStatusBarGrammarNameTimer);
          this.mutateStatusBarGrammarName(target);
          mutateStatusGrammarNameObserver = new MutationObserver((function(_this) {
            return function(mutations) {
              return mutations.forEach(function(mutation) {
                return _this.mutateStatusBarGrammarName(mutation.target);
              });
            };
          })(this));
          config = {
            attributes: true,
            childList: false,
            characterData: false
          };
          return mutateStatusGrammarNameObserver.observe(target, config);
        }
      }
    },
    mutateStatusBarGrammarName: function(elem) {
      if ((elem != null ? elem.innerHTML : void 0) === 'Babel ES6 JavaScript') {
        return elem.innerHTML = 'Babel';
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWJhYmVsL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixlQUFBLEdBQWtCLE9BQUEsQ0FBUSxxQkFBUjs7RUFDbEIsNEJBQUEsR0FBK0IsT0FBQSxDQUFRLG1DQUFSOztFQUMvQixVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBQ2IsVUFBQSxHQUFhLE9BQUEsQ0FBUSxzQkFBUjs7RUFFYixpQkFBQSxHQUFvQjs7RUFDcEIsRUFBQSxHQUFLOztFQUNMLGdDQUFBLEdBQW1DOztFQUNuQyxzQ0FBQSxHQUF5Qzs7RUFFekMsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFFUixnQ0FBQSxHQUFtQyxXQUFBLENBQVksSUFBQyxDQUFBLDJCQUEyQixDQUFDLElBQTdCLENBQWtDLElBQWxDLENBQVosRUFBa0QsSUFBbEQ7TUFDbkMsNEJBQTRCLENBQUMsY0FBN0IsQ0FBQTs7UUFDQSxJQUFDLENBQUEsYUFBYyxJQUFJLENBQUMsT0FBQSxDQUFRLGNBQVIsQ0FBRDs7TUFDbkIsSUFBQyxDQUFBLFVBQUQsR0FBa0IsSUFBQSxVQUFBLENBQVcsSUFBWDtNQUVsQixJQUFDLENBQUEsVUFBRCxHQUFjLElBQUk7TUFDbEIsSUFBQyxDQUFBLFdBQUQsR0FBZTtNQUNmLElBQUMsQ0FBQSxhQUFELEdBQWlCO01BRWpCLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFnQixJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFkLENBQW1DLElBQUMsQ0FBQSxtQkFBcEMsQ0FBaEI7TUFFQSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBYixDQUE4QixDQUFBLFNBQUEs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RDtxQkFDckQsU0FBUyxDQUFDLE9BQVYsQ0FBbUIsU0FBQyxRQUFEO3VCQUNmLEtBQUMsQ0FBQSwwQkFBRCxDQUE0QixRQUFRLENBQUMsTUFBckM7Y0FEZSxDQUFuQjtZQURxRDtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakI7VUFLdEMsTUFBQSxHQUFTO1lBQUUsVUFBQSxFQUFZLElBQWQ7WUFBb0IsU0FBQSxFQUFXLEtBQS9CO1lBQXNDLGFBQUEsRUFBZSxLQUFyRDs7aUJBR1QsK0JBQStCLENBQUMsT0FBaEMsQ0FBd0MsTUFBeEMsRUFBZ0QsTUFBaEQsRUFmRjtTQUhGOztJQVYyQixDQTdGN0I7SUE2SEEsMEJBQUEsRUFBNEIsU0FBQyxJQUFEO01BQzFCLG9CQUFHLElBQUksQ0FBRSxtQkFBTixLQUFtQixzQkFBdEI7ZUFDRSxJQUFJLENBQUMsU0FBTCxHQUFpQixRQURuQjs7SUFEMEIsQ0E3SDVCOztBQVpGIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbmF1dG9Db21wbGV0ZUpTWCA9IHJlcXVpcmUgJy4vYXV0by1jb21wbGV0ZS1qc3gnXG5hdXRvQ29tcGxldGVTdHlsZWRDb21wb25lbnRzID0gcmVxdWlyZSAnLi9hdXRvLWNvbXBsZXRlLXN0eWxlZC1jb21wb25lbnRzJ1xuQXV0b0luZGVudCA9IHJlcXVpcmUgJy4vYXV0by1pbmRlbnQnXG50dGxHcmFtbWFyID0gcmVxdWlyZSAnLi9jcmVhdGUtdHRsLWdyYW1tYXInXG5cbklOVEVSRklMRVNBVkVUSU1FID0gMTAwMFxuTEIgPSAnbGFuZ3VhZ2UtYmFiZWwnXG5vYnNlcnZlU3RhdHVzQmFyR3JhbW1hck5hbWVUaW1lciA9IG51bGxcbm9ic2VydmVTdGF0dXNCYXJHcmFtbWFyTmFtZVRpbWVyQ2FsbGVkID0gMFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgIyBydW4gb2JzZXJ2ZVN0YXR1c0JhckdyYW1tYXJOYW1lIHVudGlsIEF0b20gaGFzIGNyZWF0ZWQgdGhlIFN0YXR1cyBCYXIgR3JhbW1hciBOYW1lIERPTSBub2RlXG4gICAgb2JzZXJ2ZVN0YXR1c0JhckdyYW1tYXJOYW1lVGltZXIgPSBzZXRJbnRlcnZhbChAb2JzZXJ2ZVN0YXR1c0JhckdyYW1tYXJOYW1lLmJpbmQoQCksIDEwMDApXG4gICAgYXV0b0NvbXBsZXRlU3R5bGVkQ29tcG9uZW50cy5sb2FkUHJvcGVydGllcygpXG4gICAgQHRyYW5zcGlsZXIgPz0gbmV3IChyZXF1aXJlICcuL3RyYW5zcGlsZXInKVxuICAgIEB0dGxHcmFtbWFyID0gbmV3IHR0bEdyYW1tYXIodHJ1ZSlcbiAgICAjIHRyYWNrIGFueSBmaWxlIHNhdmUgZXZlbnRzIGFuZCB0cmFuc3BpbGUgaWYgYmFiZWxcbiAgICBAZGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHRleHRFZGl0b3JzID0ge31cbiAgICBAZmlsZVNhdmVUaW1lcyA9IHt9XG5cbiAgICBAZGlzcG9zYWJsZS5hZGQgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSBAaXNQYWNrYWdlQ29tcGF0aWJsZVxuXG4gICAgQGRpc3Bvc2FibGUuYWRkIGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzID0+XG4gICAgICBAdHJhbnNwaWxlci5zdG9wVW51c2VkVGFza3MoKVxuXG4gICAgQGRpc3Bvc2FibGUuYWRkIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAodGV4dEVkaXRvcikgPT5cbiAgICAgIEB0ZXh0RWRpdG9yc1t0ZXh0RWRpdG9yLmlkXSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICAgIEB0ZXh0RWRpdG9yc1t0ZXh0RWRpdG9yLmlkXS5hZGQgdGV4dEVkaXRvci5vYnNlcnZlR3JhbW1hciAoZ3JhbW1hcikgPT5cbiAgICAgICAgIyBJbnN0YW50aWF0ZSBpbmRlbnRvciBmb3IgbGFuZ3VhZ2UtYmFiZWwgZmlsZXNcbiAgICAgICAgaWYgdGV4dEVkaXRvci5nZXRHcmFtbWFyKCkucGFja2FnZU5hbWUgaXMgTEJcbiAgICAgICAgICBAdGV4dEVkaXRvcnNbdGV4dEVkaXRvci5pZF0uYXV0b0luZGVudCA9IG5ldyBBdXRvSW5kZW50KHRleHRFZGl0b3IpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAdGV4dEVkaXRvcnNbdGV4dEVkaXRvci5pZF0/LmF1dG9JbmRlbnQ/LmRlc3Ryb3koKVxuICAgICAgICAgIGRlbGV0ZSBAdGV4dEVkaXRvcnNbdGV4dEVkaXRvci5pZF0/LmF1dG9JbmRlbnQ/XG5cbiAgICAgIEB0ZXh0RWRpdG9yc1t0ZXh0RWRpdG9yLmlkXS5hZGQgdGV4dEVkaXRvci5vbkRpZFNhdmUgKGV2ZW50KSA9PlxuICAgICAgICBpZiB0ZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5wYWNrYWdlTmFtZSBpcyBMQlxuICAgICAgICAgIGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgICBsYXN0U2F2ZVRpbWUgPSBAZmlsZVNhdmVUaW1lc1tmaWxlUGF0aF0gPyAwXG4gICAgICAgICAgQGZpbGVTYXZlVGltZXNbZmlsZVBhdGhdID0gRGF0ZS5ub3coKVxuICAgICAgICAgIGlmICAobGFzdFNhdmVUaW1lIDwgKEBmaWxlU2F2ZVRpbWVzW2ZpbGVQYXRoXSAtIElOVEVSRklMRVNBVkVUSU1FKSlcbiAgICAgICAgICAgIEB0cmFuc3BpbGVyLnRyYW5zcGlsZShmaWxlUGF0aCwgdGV4dEVkaXRvcilcblxuICAgICAgQHRleHRFZGl0b3JzW3RleHRFZGl0b3IuaWRdLmFkZCB0ZXh0RWRpdG9yLm9uRGlkRGVzdHJveSAoKSA9PlxuICAgICAgICBAdGV4dEVkaXRvcnNbdGV4dEVkaXRvci5pZF0/LmF1dG9JbmRlbnQ/LmRlc3Ryb3koKVxuICAgICAgICBkZWxldGUgQHRleHRFZGl0b3JzW3RleHRFZGl0b3IuaWRdPy5hdXRvSW5kZW50P1xuICAgICAgICBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIGlmIEBmaWxlU2F2ZVRpbWVzW2ZpbGVQYXRoXT8gdGhlbiBkZWxldGUgQGZpbGVTYXZlVGltZXNbZmlsZVBhdGhdXG4gICAgICAgIEB0ZXh0RWRpdG9yc1t0ZXh0RWRpdG9yLmlkXS5kaXNwb3NlKClcbiAgICAgICAgZGVsZXRlIEB0ZXh0RWRpdG9yc1t0ZXh0RWRpdG9yLmlkXVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgZm9yIGlkLCBkaXNwb3NlYWJsZSBvZiBAdGV4dEVkaXRvcnNcbiAgICAgIGlmIEB0ZXh0RWRpdG9yc1tpZF0uYXV0b0luZGVudD9cbiAgICAgICAgQHRleHRFZGl0b3JzW2lkXS5hdXRvSW5kZW50LmRlc3Ryb3koKVxuICAgICAgICBkZWxldGUgQHRleHRFZGl0b3JzW2lkXS5hdXRvSW5kZW50XG4gICAgICBkaXNwb3NlYWJsZS5kaXNwb3NlKClcbiAgICBAdHJhbnNwaWxlci5zdG9wQWxsVHJhbnNwaWxlclRhc2soKVxuICAgIEB0cmFuc3BpbGVyLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIEB0dGxHcmFtbWFyLmRlc3Ryb3koKVxuICAgIEBtdXRhdGVTdGF0dXNHcmFtbWFyTmFtZU9ic2VydmVyPy5kaXNjb25uZXQoKVxuXG4gICMgd2FybnMgaWYgYW4gYWN0aXZhdGVkIHBhY2thZ2UgaXMgb24gdGhlIGluY29tcGF0aWJsZSBsaXN0XG4gIGlzUGFja2FnZUNvbXBhdGlibGU6IChhY3RpdmF0ZWRQYWNrYWdlKSAtPlxuICAgIGluY29tcGF0aWJsZVBhY2thZ2VzID0ge1xuICAgICAgJ3NvdXJjZS1wcmV2aWV3LWJhYmVsJzpcbiAgICAgICAgXCJCb3RoIHZpZSB0byBwcmV2aWV3IHRoZSBzYW1lIGZpbGUuXCJcbiAgICAgICdzb3VyY2UtcHJldmlldy1yZWFjdCc6XG4gICAgICAgIFwiQm90aCB2aWUgdG8gcHJldmlldyB0aGUgc2FtZSBmaWxlLlwiXG4gICAgICAncmVhY3QnOlxuICAgICAgICBcIlRoZSBBdG9tIGNvbW11bml0eSBwYWNrYWdlICdyZWFjdCcgKG5vdCB0byBiZSBjb25mdXNlZFxuICAgICAgICBcXG53aXRoIEZhY2Vib29rIFJlYWN0KSBtb25rZXkgcGF0Y2hlcyB0aGUgYXRvbSBtZXRob2RzXG4gICAgICAgIFxcbnRoYXQgcHJvdmlkZSBhdXRvaW5kZW50IGZlYXR1cmVzIGZvciBKU1guXG4gICAgICAgIFxcbkFzIGl0IGRldGVjdHMgSlNYIHNjb3BlcyB3aXRob3V0IHJlZ2FyZCB0byB0aGUgZ3JhbW1hciBiZWluZyB1c2VkLFxuICAgICAgICBcXG5pdCB0cmllcyB0byBhdXRvIGluZGVudCBKU1ggdGhhdCBpcyBoaWdobGlnaHRlZCBieSBsYW5ndWFnZS1iYWJlbC5cbiAgICAgICAgXFxuQXMgbGFuZ3VhZ2UtYmFiZWwgYWxzbyBhdHRlbXB0cyB0byBkbyBhdXRvIGluZGVudGF0aW9uIHVzaW5nXG4gICAgICAgIFxcbnN0YW5kYXJkIGF0b20gQVBJJ3MsIHRoaXMgY3JlYXRlcyBhIHBvdGVudGlhbCBjb25mbGljdC5cIlxuICAgIH1cblxuICAgIGZvciBpbmNvbXBhdGlibGVQYWNrYWdlLCByZWFzb24gb2YgaW5jb21wYXRpYmxlUGFja2FnZXNcbiAgICAgIGlmIGFjdGl2YXRlZFBhY2thZ2UubmFtZSBpcyBpbmNvbXBhdGlibGVQYWNrYWdlXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvICdJbmNvbXBhdGlibGUgUGFja2FnZSBEZXRlY3RlZCcsXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICBkZXRhaWw6IFwibGFuZ3VhZ2UtYmFiZWwgaGFzIGRldGVjdGVkIHRoZSBwcmVzZW5jZSBvZiBhblxuICAgICAgICAgICAgICAgICAgaW5jb21wYXRpYmxlIEF0b20gcGFja2FnZSBuYW1lZCAnI3thY3RpdmF0ZWRQYWNrYWdlLm5hbWV9Jy5cbiAgICAgICAgICAgICAgICAgIFxcbiBcXG5JdCBpcyByZWNvbW1lbmRlZCB0aGF0IHlvdSBkaXNhYmxlIGVpdGhlciAnI3thY3RpdmF0ZWRQYWNrYWdlLm5hbWV9JyBvciBsYW5ndWFnZS1iYWJlbFxuICAgICAgICAgICAgICAgICAgXFxuIFxcblJlYXNvbjpcXG4gXFxuI3tyZWFzb259XCJcblxuICAjIGF1dG9jb21wbGV0ZS1wbHVzIHByb3ZpZGVyc1xuICBhdXRvQ29tcGxldGVQcm92aWRlcjogLT5cbiAgICBbYXV0b0NvbXBsZXRlSlNYLCBhdXRvQ29tcGxldGVTdHlsZWRDb21wb25lbnRzXVxuXG4gICMgcHJldmlldyB0cmFucGlsZSBwcm92aWRlclxuICBwcm92aWRlOi0+XG4gICAgQHRyYW5zcGlsZXJcblxuXG4gICMgS2x1ZGdlIHRvIGNoYW5nZSB0aGUgZ3JhbW1hciBuYW1lIGluIHRoZSBzdGF0dXMgYmFyIGZyb20gQmFiZWwgRVM2IEphdmFTY2lwdCB0byBCYWJlbFxuICAjIFRoZSBncmFtbWFyIG5hbWUgc3RpbGwgcmVtYWlucyB0aGUgc2FtZSBmb3IgY29tcGF0aWJpbHR5IHdpdGggb3RoZXIgcGFja2FnZXMgc3VjaCBhcyBhdG9tLWJlYXV0aWZ5XG4gICMgYnV0IGlzIG1vcmUgbWVhbmluZ2Z1bCBhbmQgc2hvcnRlciBvbiB0aGUgc3RhdHVzIGJhci5cbiAgb2JzZXJ2ZVN0YXR1c0JhckdyYW1tYXJOYW1lOiAtPlxuICAgICMgc2VsZWN0IHRoZSB0YXJnZXQgbm9kZVxuICAgIHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdncmFtbWFyLXNlbGVjdG9yLXN0YXR1cycpO1xuXG4gICAgIyBvbmx5IHJ1biB0aGlzIGZvciBzbyBtYW55IGN5Y2xlcyB3aXRob3V0IGdldHRpbmcgYSB2YWxpZCBkb20gbm9kZVxuICAgIGlmICsrb2JzZXJ2ZVN0YXR1c0JhckdyYW1tYXJOYW1lVGltZXJDYWxsZWQgPiA2MFxuICAgICAgY2xlYXJJbnRlcnZhbChvYnNlcnZlU3RhdHVzQmFyR3JhbW1hck5hbWVUaW1lcilcbiAgICAgIG9ic2VydmVTdGF0dXNCYXJHcmFtbWFyTmFtZVRpbWVyQ2FsbGVkID0gMFxuXG4gICAgIyBvbmx5IGV4cGVjdCBhIHNpbmdsZSBjaGlsZCAoZ3JhbW1hciBuYW1lKSBmb3IgdGhpcyBET00gTm9kZVxuICAgIGlmIHRhcmdldC5sZW5ndGggaXMgMVxuICAgICAgdGFyZ2V0ID0gdGFyZ2V0WzBdLmNoaWxkTm9kZXM/WzBdXG5cbiAgICAgIGlmIHRhcmdldFxuICAgICAgICAjIGRvbid0IHJ1biBhZ2FpbiBhcyB3ZSBhcmUgbm93IG9ic2VydmluZ1xuICAgICAgICBjbGVhckludGVydmFsKG9ic2VydmVTdGF0dXNCYXJHcmFtbWFyTmFtZVRpbWVyKVxuXG4gICAgICAgIEBtdXRhdGVTdGF0dXNCYXJHcmFtbWFyTmFtZSh0YXJnZXQpXG5cbiAgICAgICAgIyBjcmVhdGUgYW4gb2JzZXJ2ZXIgaW5zdGFuY2VcbiAgICAgICAgbXV0YXRlU3RhdHVzR3JhbW1hck5hbWVPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyIChtdXRhdGlvbnMpID0+XG4gICAgICAgICAgbXV0YXRpb25zLmZvckVhY2ggIChtdXRhdGlvbikgPT5cbiAgICAgICAgICAgICAgQG11dGF0ZVN0YXR1c0JhckdyYW1tYXJOYW1lKG11dGF0aW9uLnRhcmdldClcblxuICAgICAgICAjIGNvbmZpZ3VyYXRpb24gb2YgdGhlIG9ic2VydmVyOlxuICAgICAgICBjb25maWcgPSB7IGF0dHJpYnV0ZXM6IHRydWUsIGNoaWxkTGlzdDogZmFsc2UsIGNoYXJhY3RlckRhdGE6IGZhbHNlIH1cblxuICAgICAgICAjIHBhc3MgaW4gdGhlIHRhcmdldCBub2RlLCBhcyB3ZWxsIGFzIHRoZSBvYnNlcnZlciBvcHRpb25zXG4gICAgICAgIG11dGF0ZVN0YXR1c0dyYW1tYXJOYW1lT2JzZXJ2ZXIub2JzZXJ2ZSh0YXJnZXQsIGNvbmZpZyk7XG5cblxuICAjIGNoYW5nZSBuYW1lIGluIHN0YXR1cyBiYXJcbiAgbXV0YXRlU3RhdHVzQmFyR3JhbW1hck5hbWU6IChlbGVtKSAtPlxuICAgIGlmIGVsZW0/LmlubmVySFRNTCBpcyAnQmFiZWwgRVM2IEphdmFTY3JpcHQnXG4gICAgICBlbGVtLmlubmVySFRNTCA9ICdCYWJlbCdcbiJdfQ==
