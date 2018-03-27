(function() {
  var $, CompositeDisposable, RemoteSync, configure, disposables, fs, getEventPath, handleEvent, initProject, path, projectDict, reload;

  fs = require('fs-plus');

  CompositeDisposable = null;

  path = null;

  $ = null;

  getEventPath = function(e) {
    var fullPath, projectPath, ref, relativePath, target;
    if ($ == null) {
      $ = require('atom-space-pen-views').$;
    }
    target = $(e.target).closest('.file, .directory, .tab')[0];
    if (target == null) {
      target = atom.workspace.getActiveTextEditor();
    }
    fullPath = target != null ? typeof target.getPath === "function" ? target.getPath() : void 0 : void 0;
    if (!fullPath) {
      return [];
    }
    ref = atom.project.relativizePath(fullPath), projectPath = ref[0], relativePath = ref[1];
    return [projectPath, fullPath];
  };

  projectDict = null;

  disposables = null;

  RemoteSync = null;

  initProject = function(projectPaths) {
    var disposes, err, i, j, len, len1, obj, projectPath, results;
    disposes = [];
    for (projectPath in projectDict) {
      if (projectPaths.indexOf(projectPath) === -1) {
        disposes.push(projectPath);
      }
    }
    for (i = 0, len = disposes.length; i < len; i++) {
      projectPath = disposes[i];
      projectDict[projectPath].dispose();
      delete projectDict[projectPath];
    }
    results = [];
    for (j = 0, len1 = projectPaths.length; j < len1; j++) {
      projectPath = projectPaths[j];
      try {
        projectPath = fs.realpathSync(projectPath);
      } catch (error) {
        err = error;
        continue;
      }
      if (projectDict[projectPath]) {
        continue;
      }
      if (RemoteSync == null) {
        RemoteSync = require("./lib/RemoteSync");
      }
      obj = RemoteSync.create(projectPath);
      if (obj) {
        results.push(projectDict[projectPath] = obj);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  handleEvent = function(e, cmd) {
    var fullPath, projectObj, projectPath, ref;
    ref = getEventPath(e), projectPath = ref[0], fullPath = ref[1];
    if (!projectPath) {
      return;
    }
    projectObj = projectDict[fs.realpathSync(projectPath)];
    return typeof projectObj[cmd] === "function" ? projectObj[cmd](fs.realpathSync(fullPath)) : void 0;
  };

  reload = function(projectPath) {
    var ref;
    if ((ref = projectDict[projectPath]) != null) {
      ref.dispose();
    }
    return projectDict[projectPath] = RemoteSync.create(projectPath);
  };

  configure = function(e) {
    var projectPath;
    projectPath = getEventPath(e)[0];
    if (!projectPath) {
      return;
    }
    projectPath = fs.realpathSync(projectPath);
    if (RemoteSync == null) {
      RemoteSync = require("./lib/RemoteSync");
    }
    return RemoteSync.configure(projectPath, function() {
      return reload(projectPath);
    });
  };

  module.exports = {
    config: {
      logToConsole: {
        type: 'boolean',
        "default": false,
        title: 'Log to console',
        description: 'Log messages to the console instead of the status view at the bottom of the window'
      },
      autoHideLogPanel: {
        type: 'boolean',
        "default": false,
        title: 'Hide log panel after transferring',
        description: 'Hides the status view at the bottom of the window after the transfer operation is done'
      },
      foldLogPanel: {
        type: 'boolean',
        "default": false,
        title: 'Fold log panel by default',
        description: 'Shows only one line in the status view'
      },
      monitorFileAnimation: {
        type: 'boolean',
        "default": true,
        title: 'Monitor file animation',
        description: 'Toggles the pulse animation for a monitored file'
      },
      difftoolCommand: {
        type: 'string',
        "default": '',
        title: 'Diff tool command',
        description: 'The command to run for your diff tool'
      },
      configFileName: {
        type: 'string',
        "default": '.remote-sync.json'
      }
    },
    activate: function(state) {
      projectDict = {};
      initProject(atom.project.getPaths());
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      disposables = new CompositeDisposable;
      disposables.add(atom.commands.add('atom-workspace', {
        'remote-sync:upload-folder': function(e) {
          return handleEvent(e, "uploadFolder");
        },
        'remote-sync:upload-file': function(e) {
          return handleEvent(e, "uploadFile");
        },
        'remote-sync:delete-file': function(e) {
          return handleEvent(e, "deleteFile");
        },
        'remote-sync:delete-folder': function(e) {
          return handleEvent(e, "deleteFile");
        },
        'remote-sync:download-file': function(e) {
          return handleEvent(e, "downloadFile");
        },
        'remote-sync:download-folder': function(e) {
          return handleEvent(e, "downloadFolder");
        },
        'remote-sync:diff-file': function(e) {
          return handleEvent(e, "diffFile");
        },
        'remote-sync:diff-folder': function(e) {
          return handleEvent(e, "diffFolder");
        },
        'remote-sync:upload-git-change': function(e) {
          return handleEvent(e, "uploadGitChange");
        },
        'remote-sync:monitor-file': function(e) {
          return handleEvent(e, "monitorFile");
        },
        'remote-sync:monitor-files-list': function(e) {
          return handleEvent(e, "monitorFilesList");
        },
        'remote-sync:configure': configure
      }));
      disposables.add(atom.project.onDidChangePaths(function(projectPaths) {
        return initProject(projectPaths);
      }));
      return disposables.add(atom.workspace.observeTextEditors(function(editor) {
        var onDidDestroy, onDidSave;
        onDidSave = editor.onDidSave(function(e) {
          var fullPath, projectObj, projectPath, ref, relativePath;
          fullPath = e.path;
          ref = atom.project.relativizePath(fullPath), projectPath = ref[0], relativePath = ref[1];
          if (!projectPath) {
            return;
          }
          projectPath = fs.realpathSync(projectPath);
          projectObj = projectDict[projectPath];
          if (!projectObj) {
            return;
          }
          if (fs.realpathSync(fullPath) === fs.realpathSync(projectObj.configPath)) {
            projectObj = reload(projectPath);
          }
          if (!projectObj.host.uploadOnSave) {
            return;
          }
          return projectObj.uploadFile(fs.realpathSync(fullPath));
        });
        onDidDestroy = editor.onDidDestroy(function() {
          disposables.remove(onDidSave);
          disposables.remove(onDidDestroy);
          onDidDestroy.dispose();
          return onDidSave.dispose();
        });
        disposables.add(onDidSave);
        return disposables.add(onDidDestroy);
      }));
    },
    deactivate: function() {
      var obj, projectPath;
      disposables.dispose();
      disposables = null;
      for (projectPath in projectDict) {
        obj = projectDict[projectPath];
        obj.dispose();
      }
      return projectDict = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3JlbW90ZS1zeW5jL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUVMLG1CQUFBLEdBQXNCOztFQUN0QixJQUFBLEdBQU87O0VBQ1AsQ0FBQSxHQUFJOztFQUVKLFlBQUEsR0FBZSxTQUFDLENBQUQ7QUFDYixRQUFBOztNQUFBLElBQUssT0FBQSxDQUFRLHNCQUFSLENBQStCLENBQUM7O0lBRXJDLE1BQUEsR0FBUyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLE9BQVosQ0FBb0IseUJBQXBCLENBQStDLENBQUEsQ0FBQTs7TUFDeEQsU0FBVSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7O0lBRVYsUUFBQSwyREFBVyxNQUFNLENBQUU7SUFDbkIsSUFBQSxDQUFpQixRQUFqQjtBQUFBLGFBQU8sR0FBUDs7SUFFQSxNQUE4QixJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWIsQ0FBNEIsUUFBNUIsQ0FBOUIsRUFBQyxvQkFBRCxFQUFjO0FBQ2QsV0FBTyxDQUFDLFdBQUQsRUFBYyxRQUFkO0VBVk07O0VBWWYsV0FBQSxHQUFjOztFQUNkLFdBQUEsR0FBYzs7RUFDZCxVQUFBLEdBQWE7O0VBQ2IsV0FBQSxHQUFjLFNBQUMsWUFBRDtBQUNaLFFBQUE7SUFBQSxRQUFBLEdBQVc7QUFDWCxTQUFBLDBCQUFBO01BQ0UsSUFBNkIsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsV0FBckIsQ0FBQSxLQUFxQyxDQUFDLENBQW5FO1FBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxXQUFkLEVBQUE7O0FBREY7QUFHQSxTQUFBLDBDQUFBOztNQUNFLFdBQVksQ0FBQSxXQUFBLENBQVksQ0FBQyxPQUF6QixDQUFBO01BQ0EsT0FBTyxXQUFZLENBQUEsV0FBQTtB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O0lBekJRLENBOUJWO0lBaUZBLFVBQUEsRUFBWSxTQUFBO0FBQ1YsVUFBQTtNQUFBLFdBQVcsQ0FBQyxPQUFaLENBQUE7TUFDQSxXQUFBLEdBQWM7QUFDZCxXQUFBLDBCQUFBOztRQUNFLEdBQUcsQ0FBQyxPQUFKLENBQUE7QUFERjthQUVBLFdBQUEsR0FBYztJQUxKLENBakZaOztBQTVERiIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSgnZnMtcGx1cycpXG5cbkNvbXBvc2l0ZURpc3Bvc2FibGUgPSBudWxsXG5wYXRoID0gbnVsbFxuJCA9IG51bGxcblxuZ2V0RXZlbnRQYXRoID0gKGUpLT5cbiAgJCA/PSByZXF1aXJlKCdhdG9tLXNwYWNlLXBlbi12aWV3cycpLiRcblxuICB0YXJnZXQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZmlsZSwgLmRpcmVjdG9yeSwgLnRhYicpWzBdXG4gIHRhcmdldCA/PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuICBmdWxsUGF0aCA9IHRhcmdldD8uZ2V0UGF0aD8oKVxuICByZXR1cm4gW10gdW5sZXNzIGZ1bGxQYXRoXG5cbiAgW3Byb2plY3RQYXRoLCByZWxhdGl2ZVBhdGhdID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZ1bGxQYXRoKVxuICByZXR1cm4gW3Byb2plY3RQYXRoLCBmdWxsUGF0aF1cblxucHJvamVjdERpY3QgPSBudWxsXG5kaXNwb3NhYmxlcyA9IG51bGxcblJlbW90ZVN5bmMgPSBudWxsXG5pbml0UHJvamVjdCA9IChwcm9qZWN0UGF0aHMpLT5cbiAgZGlzcG9zZXMgPSBbXVxuICBmb3IgcHJvamVjdFBhdGggb2YgcHJvamVjdERpY3RcbiAgICBkaXNwb3Nlcy5wdXNoIHByb2plY3RQYXRoIGlmIHByb2plY3RQYXRocy5pbmRleE9mKHByb2plY3RQYXRoKSA9PSAtMVxuXG4gIGZvciBwcm9qZWN0UGF0aCBpbiBkaXNwb3Nlc1xuICAgIHByb2plY3REaWN0W3Byb2plY3RQYXRoXS5kaXNwb3NlKClcbiAgICBkZWxldGUgcHJvamVjdERpY3RbcHJvamVjdFBhdGhdXG5cbiAgZm9yIHByb2plY3RQYXRoIGluIHByb2plY3RQYXRoc1xuICAgIHRyeVxuICAgICAgICBwcm9qZWN0UGF0aCA9IGZzLnJlYWxwYXRoU3luYyhwcm9qZWN0UGF0aClcbiAgICBjYXRjaCBlcnJcbiAgICAgICAgY29udGludWVcbiAgICBjb250aW51ZSBpZiBwcm9qZWN0RGljdFtwcm9qZWN0UGF0aF1cbiAgICBSZW1vdGVTeW5jID89IHJlcXVpcmUgXCIuL2xpYi9SZW1vdGVTeW5jXCJcbiAgICBvYmogPSBSZW1vdGVTeW5jLmNyZWF0ZShwcm9qZWN0UGF0aClcbiAgICBwcm9qZWN0RGljdFtwcm9qZWN0UGF0aF0gPSBvYmogaWYgb2JqXG5cbmhhbmRsZUV2ZW50ID0gKGUsIGNtZCktPlxuICBbcHJvamVjdFBhdGgsIGZ1bGxQYXRoXSA9IGdldEV2ZW50UGF0aChlKVxuICByZXR1cm4gdW5sZXNzIHByb2plY3RQYXRoXG5cbiAgcHJvamVjdE9iaiA9IHByb2plY3REaWN0W2ZzLnJlYWxwYXRoU3luYyhwcm9qZWN0UGF0aCldXG4gIHByb2plY3RPYmpbY21kXT8oZnMucmVhbHBhdGhTeW5jKGZ1bGxQYXRoKSlcblxucmVsb2FkID0gKHByb2plY3RQYXRoKS0+XG4gIHByb2plY3REaWN0W3Byb2plY3RQYXRoXT8uZGlzcG9zZSgpXG4gIHByb2plY3REaWN0W3Byb2plY3RQYXRoXSA9IFJlbW90ZVN5bmMuY3JlYXRlKHByb2plY3RQYXRoKVxuXG5jb25maWd1cmUgPSAoZSktPlxuICBbcHJvamVjdFBhdGhdID0gZ2V0RXZlbnRQYXRoKGUpXG4gIHJldHVybiB1bmxlc3MgcHJvamVjdFBhdGhcblxuICBwcm9qZWN0UGF0aCA9IGZzLnJlYWxwYXRoU3luYyhwcm9qZWN0UGF0aClcbiAgUmVtb3RlU3luYyA/PSByZXF1aXJlIFwiLi9saWIvUmVtb3RlU3luY1wiXG4gIFJlbW90ZVN5bmMuY29uZmlndXJlIHByb2plY3RQYXRoLCAtPiByZWxvYWQocHJvamVjdFBhdGgpXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOlxuICAgIGxvZ1RvQ29uc29sZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIHRpdGxlOiAnTG9nIHRvIGNvbnNvbGUnXG4gICAgICBkZXNjcmlwdGlvbjogJ0xvZyBtZXNzYWdlcyB0byB0aGUgY29uc29sZSBpbnN0ZWFkIG9mIHRoZSBzdGF0dXMgdmlldyBhdCB0aGUgYm90dG9tIG9mIHRoZSB3aW5kb3cnXG4gICAgYXV0b0hpZGVMb2dQYW5lbDpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIHRpdGxlOiAnSGlkZSBsb2cgcGFuZWwgYWZ0ZXIgdHJhbnNmZXJyaW5nJ1xuICAgICAgZGVzY3JpcHRpb246ICdIaWRlcyB0aGUgc3RhdHVzIHZpZXcgYXQgdGhlIGJvdHRvbSBvZiB0aGUgd2luZG93IGFmdGVyIHRoZSB0cmFuc2ZlciBvcGVyYXRpb24gaXMgZG9uZSdcbiAgICBmb2xkTG9nUGFuZWw6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICB0aXRsZTogJ0ZvbGQgbG9nIHBhbmVsIGJ5IGRlZmF1bHQnXG4gICAgICBkZXNjcmlwdGlvbjogJ1Nob3dzIG9ubHkgb25lIGxpbmUgaW4gdGhlIHN0YXR1cyB2aWV3J1xuICAgIG1vbml0b3JGaWxlQW5pbWF0aW9uOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICB0aXRsZTogJ01vbml0b3IgZmlsZSBhbmltYXRpb24nXG4gICAgICBkZXNjcmlwdGlvbjogJ1RvZ2dsZXMgdGhlIHB1bHNlIGFuaW1hdGlvbiBmb3IgYSBtb25pdG9yZWQgZmlsZSdcbiAgICBkaWZmdG9vbENvbW1hbmQ6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJydcbiAgICAgIHRpdGxlOiAnRGlmZiB0b29sIGNvbW1hbmQnXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBjb21tYW5kIHRvIHJ1biBmb3IgeW91ciBkaWZmIHRvb2wnXG4gICAgY29uZmlnRmlsZU5hbWU6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJy5yZW1vdGUtc3luYy5qc29uJ1xuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgcHJvamVjdERpY3QgPSB7fVxuICAgIGluaXRQcm9qZWN0KGF0b20ucHJvamVjdC5nZXRQYXRocygpKVxuXG4gICAgQ29tcG9zaXRlRGlzcG9zYWJsZSA/PSByZXF1aXJlKCdhdG9tJykuQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAncmVtb3RlLXN5bmM6dXBsb2FkLWZvbGRlcic6IChlKS0+IGhhbmRsZUV2ZW50KGUsIFwidXBsb2FkRm9sZGVyXCIpXG4gICAgICAncmVtb3RlLXN5bmM6dXBsb2FkLWZpbGUnOiAoZSktPiBoYW5kbGVFdmVudChlLCBcInVwbG9hZEZpbGVcIilcbiAgICAgICdyZW1vdGUtc3luYzpkZWxldGUtZmlsZSc6IChlKS0+IGhhbmRsZUV2ZW50KGUsIFwiZGVsZXRlRmlsZVwiKVxuICAgICAgJ3JlbW90ZS1zeW5jOmRlbGV0ZS1mb2xkZXInOiAoZSktPiBoYW5kbGVFdmVudChlLCBcImRlbGV0ZUZpbGVcIilcbiAgICAgICdyZW1vdGUtc3luYzpkb3dubG9hZC1maWxlJzogKGUpLT4gaGFuZGxlRXZlbnQoZSwgXCJkb3dubG9hZEZpbGVcIilcbiAgICAgICdyZW1vdGUtc3luYzpkb3dubG9hZC1mb2xkZXInOiAoZSktPiBoYW5kbGVFdmVudChlLCBcImRvd25sb2FkRm9sZGVyXCIpXG4gICAgICAncmVtb3RlLXN5bmM6ZGlmZi1maWxlJzogKGUpLT4gaGFuZGxlRXZlbnQoZSwgXCJkaWZmRmlsZVwiKVxuICAgICAgJ3JlbW90ZS1zeW5jOmRpZmYtZm9sZGVyJzogKGUpLT4gaGFuZGxlRXZlbnQoZSwgXCJkaWZmRm9sZGVyXCIpXG4gICAgICAncmVtb3RlLXN5bmM6dXBsb2FkLWdpdC1jaGFuZ2UnOiAoZSktPiBoYW5kbGVFdmVudChlLCBcInVwbG9hZEdpdENoYW5nZVwiKVxuICAgICAgJ3JlbW90ZS1zeW5jOm1vbml0b3ItZmlsZSc6IChlKS0+IGhhbmRsZUV2ZW50KGUsIFwibW9uaXRvckZpbGVcIilcbiAgICAgICdyZW1vdGUtc3luYzptb25pdG9yLWZpbGVzLWxpc3QnOiAoZSktPiBoYW5kbGVFdmVudChlLFwibW9uaXRvckZpbGVzTGlzdFwiKVxuICAgICAgJ3JlbW90ZS1zeW5jOmNvbmZpZ3VyZSc6IGNvbmZpZ3VyZVxuICAgIH0pXG5cbiAgICBkaXNwb3NhYmxlcy5hZGQgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMgKHByb2plY3RQYXRocyktPlxuICAgICAgaW5pdFByb2plY3QocHJvamVjdFBhdGhzKVxuXG4gICAgZGlzcG9zYWJsZXMuYWRkIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSAtPlxuICAgICAgb25EaWRTYXZlID0gZWRpdG9yLm9uRGlkU2F2ZSAoZSkgLT5cbiAgICAgICAgZnVsbFBhdGggPSBlLnBhdGhcbiAgICAgICAgW3Byb2plY3RQYXRoLCByZWxhdGl2ZVBhdGhdID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZ1bGxQYXRoKVxuICAgICAgICByZXR1cm4gdW5sZXNzIHByb2plY3RQYXRoXG5cbiAgICAgICAgcHJvamVjdFBhdGggPSBmcy5yZWFscGF0aFN5bmMocHJvamVjdFBhdGgpXG4gICAgICAgIHByb2plY3RPYmogPSBwcm9qZWN0RGljdFtwcm9qZWN0UGF0aF1cbiAgICAgICAgcmV0dXJuIHVubGVzcyBwcm9qZWN0T2JqXG5cbiAgICAgICAgaWYgZnMucmVhbHBhdGhTeW5jKGZ1bGxQYXRoKSA9PSBmcy5yZWFscGF0aFN5bmMocHJvamVjdE9iai5jb25maWdQYXRoKVxuICAgICAgICAgIHByb2plY3RPYmogPSByZWxvYWQocHJvamVjdFBhdGgpXG5cbiAgICAgICAgcmV0dXJuIHVubGVzcyBwcm9qZWN0T2JqLmhvc3QudXBsb2FkT25TYXZlXG4gICAgICAgIHByb2plY3RPYmoudXBsb2FkRmlsZShmcy5yZWFscGF0aFN5bmMoZnVsbFBhdGgpKVxuXG5cbiAgICAgIG9uRGlkRGVzdHJveSA9IGVkaXRvci5vbkRpZERlc3Ryb3kgLT5cbiAgICAgICAgZGlzcG9zYWJsZXMucmVtb3ZlIG9uRGlkU2F2ZVxuICAgICAgICBkaXNwb3NhYmxlcy5yZW1vdmUgb25EaWREZXN0cm95XG4gICAgICAgIG9uRGlkRGVzdHJveS5kaXNwb3NlKClcbiAgICAgICAgb25EaWRTYXZlLmRpc3Bvc2UoKVxuXG4gICAgICBkaXNwb3NhYmxlcy5hZGQgb25EaWRTYXZlXG4gICAgICBkaXNwb3NhYmxlcy5hZGQgb25EaWREZXN0cm95XG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBkaXNwb3NhYmxlcyA9IG51bGxcbiAgICBmb3IgcHJvamVjdFBhdGgsIG9iaiBvZiBwcm9qZWN0RGljdFxuICAgICAgb2JqLmRpc3Bvc2UoKVxuICAgIHByb2plY3REaWN0ID0gbnVsbFxuIl19
