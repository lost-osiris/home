(function() {
  var Base, CSON, Delegato, Input, OperationAbortedError, VMP_LOADED_FILES, VMP_LOADING_FILE, __plus, _plus, getEditorState, loadVmpOperationFile, path, ref, selectList, settings, vimStateMethods,
    slice = [].slice,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  __plus = null;

  _plus = function() {
    return __plus != null ? __plus : __plus = require('underscore-plus');
  };

  Delegato = require('delegato');

  settings = require('./settings');

  ref = [], CSON = ref[0], path = ref[1], Input = ref[2], selectList = ref[3], getEditorState = ref[4];

  VMP_LOADING_FILE = null;

  VMP_LOADED_FILES = [];

  loadVmpOperationFile = function(filename) {
    var loaded;
    VMP_LOADING_FILE = filename;
    loaded = require(filename);
    VMP_LOADING_FILE = null;
    VMP_LOADED_FILES.push(filename);
    return loaded;
  };

  OperationAbortedError = null;

  vimStateMethods = ["onDidChangeSearch", "onDidConfirmSearch", "onDidCancelSearch", "onDidCommandSearch", "onDidSetTarget", "emitDidSetTarget", "onWillSelectTarget", "emitWillSelectTarget", "onDidSelectTarget", "emitDidSelectTarget", "onDidFailSelectTarget", "emitDidFailSelectTarget", "onWillFinishMutation", "emitWillFinishMutation", "onDidFinishMutation", "emitDidFinishMutation", "onDidFinishOperation", "onDidResetOperationStack", "onDidSetOperatorModifier", "onWillActivateMode", "onDidActivateMode", "preemptWillDeactivateMode", "onWillDeactivateMode", "onDidDeactivateMode", "onDidCancelSelectList", "subscribe", "isMode", "getBlockwiseSelections", "getLastBlockwiseSelection", "addToClassList", "getConfig"];

  Base = (function() {
    var classRegistry;

    Delegato.includeInto(Base);

    Base.delegatesMethods.apply(Base, slice.call(vimStateMethods).concat([{
      toProperty: 'vimState'
    }]));

    Base.delegatesProperty('mode', 'submode', 'swrap', 'utils', {
      toProperty: 'vimState'
    });

    function Base(vimState1, properties) {
      var ref1;
      this.vimState = vimState1;
      if (properties == null) {
        properties = null;
      }
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement, this.globalState = ref1.globalState, this.swrap = ref1.swrap;
      this.name = this.constructor.name;
      if (properties != null) {
        Object.assign(this, properties);
      }
    }

    Base.prototype.initialize = function() {};

    Base.prototype.isComplete = function() {
      var ref1;
      if (this.requireInput && (this.input == null)) {
        return false;
      } else if (this.requireTarget) {
        return (ref1 = this.target) != null ? typeof ref1.isComplete === "function" ? ref1.isComplete() : void 0 : void 0;
      } else {
        return true;
      }
    };

    Base.prototype.requireTarget = false;

    Base.prototype.requireInput = false;

    Base.prototype.recordable = false;

    Base.prototype.repeated = false;

    Base.prototype.target = null;

    Base.prototype.operator = null;

    Base.prototype.isAsTargetExceptSelect = function() {
      return (this.operator != null) && !this.operator["instanceof"]('Select');
    };

    Base.prototype.abort = function() {
      if (OperationAbortedError == null) {
        OperationAbortedError = require('./errors');
      }
      throw new OperationAbortedError('aborted');
    };

    Base.prototype.count = null;

    Base.prototype.defaultCount = 1;

    Base.prototype.getCount = function(offset) {
      var ref1;
      if (offset == null) {
        offset = 0;
      }
      if (this.count == null) {
        this.count = (ref1 = this.vimState.getCount()) != null ? ref1 : this.defaultCount;
      }
      return this.count + offset;
    };

    Base.prototype.resetCount = function() {
      return this.count = null;
    };

    Base.prototype.isDefaultCount = function() {
      return this.count === this.defaultCount;
    };

    Base.prototype.countTimes = function(last, fn) {
      var count, i, isFinal, ref1, results, stop, stopped;
      if (last < 1) {
        return;
      }
      stopped = false;
      stop = function() {
        return stopped = true;
      };
      results = [];
      for (count = i = 1, ref1 = last; 1 <= ref1 ? i <= ref1 : i >= ref1; count = 1 <= ref1 ? ++i : --i) {
        isFinal = count === last;
        fn({
          count: count,
          isFinal: isFinal,
          stop: stop
        });
        if (stopped) {
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Base.prototype.activateMode = function(mode, submode) {
      return this.onDidFinishOperation((function(_this) {
        return function() {
          return _this.vimState.activate(mode, submode);
        };
      })(this));
    };

    Base.prototype.activateModeIfNecessary = function(mode, submode) {
      if (!this.vimState.isMode(mode, submode)) {
        return this.activateMode(mode, submode);
      }
    };

    Base.prototype["new"] = function(name, properties) {
      var klass;
      klass = Base.getClass(name);
      return new klass(this.vimState, properties);
    };

    Base.prototype.newInputUI = function() {
      if (Input == null) {
        Input = require('./input');
      }
      return new Input(this.vimState);
    };

    Base.prototype.clone = function(vimState) {
      var excludeProperties, key, klass, properties, ref1, value;
      properties = {};
      excludeProperties = ['editor', 'editorElement', 'globalState', 'vimState', 'operator'];
      ref1 = this;
      for (key in ref1) {
        if (!hasProp.call(ref1, key)) continue;
        value = ref1[key];
        if (indexOf.call(excludeProperties, key) < 0) {
          properties[key] = value;
        }
      }
      klass = this.constructor;
      return new klass(vimState, properties);
    };

    Base.prototype.cancelOperation = function() {
      return this.vimState.operationStack.cancel();
    };

    Base.prototype.processOperation = function() {
      return this.vimState.operationStack.process();
    };

    Base.prototype.focusSelectList = function(options) {
      if (options == null) {
        options = {};
      }
      this.onDidCancelSelectList((function(_this) {
        return function() {
          return _this.cancelOperation();
        };
      })(this));
      if (selectList == null) {
        selectList = require('./select-list');
      }
      return selectList.show(this.vimState, options);
    };

    Base.prototype.input = null;

    Base.prototype.focusInput = function(options) {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm((function(_this) {
        return function(input) {
          _this.input = input;
          return _this.processOperation();
        };
      })(this));
      if ((options != null ? options.charsMax : void 0) > 1) {
        inputUI.onDidChange((function(_this) {
          return function(input) {
            return _this.vimState.hover.set(input);
          };
        })(this));
      }
      inputUI.onDidCancel(this.cancelOperation.bind(this));
      return inputUI.focus(options);
    };

    Base.prototype.getVimEofBufferPosition = function() {
      return this.utils.getVimEofBufferPosition(this.editor);
    };

    Base.prototype.getVimLastBufferRow = function() {
      return this.utils.getVimLastBufferRow(this.editor);
    };

    Base.prototype.getVimLastScreenRow = function() {
      return this.utils.getVimLastScreenRow(this.editor);
    };

    Base.prototype.getWordBufferRangeAndKindAtBufferPosition = function(point, options) {
      return this.utils.getWordBufferRangeAndKindAtBufferPosition(this.editor, point, options);
    };

    Base.prototype.getFirstCharacterPositionForBufferRow = function(row) {
      return this.utils.getFirstCharacterPositionForBufferRow(this.editor, row);
    };

    Base.prototype.getBufferRangeForRowRange = function(rowRange) {
      return this.utils.getBufferRangeForRowRange(this.editor, rowRange);
    };

    Base.prototype.getIndentLevelForBufferRow = function(row) {
      return this.utils.getIndentLevelForBufferRow(this.editor, row);
    };

    Base.prototype.scanForward = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.utils).scanEditorInDirection.apply(ref1, [this.editor, 'forward'].concat(slice.call(args)));
    };

    Base.prototype.scanBackward = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.utils).scanEditorInDirection.apply(ref1, [this.editor, 'backward'].concat(slice.call(args)));
    };

    Base.prototype["instanceof"] = function(klassName) {
      return this instanceof Base.getClass(klassName);
    };

    Base.prototype.is = function(klassName) {
      return this.constructor === Base.getClass(klassName);
    };

    Base.prototype.isOperator = function() {
      return this.constructor.operationKind === 'operator';
    };

    Base.prototype.isMotion = function() {
      return this.constructor.operationKind === 'motion';
    };

    Base.prototype.isTextObject = function() {
      return this.constructor.operationKind === 'text-object';
    };

    Base.prototype.getCursorBufferPosition = function() {
      if (this.mode === 'visual') {
        return this.getCursorPositionForSelection(this.editor.getLastSelection());
      } else {
        return this.editor.getCursorBufferPosition();
      }
    };

    Base.prototype.getCursorBufferPositions = function() {
      if (this.mode === 'visual') {
        return this.editor.getSelections().map(this.getCursorPositionForSelection.bind(this));
      } else {
        return this.editor.getCursorBufferPositions();
      }
    };

    Base.prototype.getBufferPositionForCursor = function(cursor) {
      if (this.mode === 'visual') {
        return this.getCursorPositionForSelection(cursor.selection);
      } else {
        return cursor.getBufferPosition();
      }
    };

    Base.prototype.getCursorPositionForSelection = function(selection) {
      return this.swrap(selection).getBufferPositionFor('head', {
        from: ['property', 'selection']
      });
    };

    Base.prototype.toString = function() {
      var str;
      str = this.name;
      if (this.target != null) {
        return str += ", target=" + this.target.name + ", target.wise=" + this.target.wise + " ";
      } else if (this.operator != null) {
        return str += ", wise=" + this.wise + " , operator=" + this.operator.name;
      } else {
        return str;
      }
    };

    Base.writeCommandTableOnDisk = function() {
      var _, commandTable, commandTablePath, loadableCSONText;
      commandTable = this.generateCommandTableByEagerLoad();
      _ = _plus();
      if (_.isEqual(this.commandTable, commandTable)) {
        atom.notifications.addInfo("No change commandTable", {
          dismissable: true
        });
        return;
      }
      if (CSON == null) {
        CSON = require('season');
      }
      if (path == null) {
        path = require('path');
      }
      loadableCSONText = "module.exports =\n" + CSON.stringify(commandTable) + "\n";
      commandTablePath = path.join(__dirname, "command-table.coffee");
      return atom.workspace.open(commandTablePath, {
        activateItem: false
      }).then(function(editor) {
        editor.setText(loadableCSONText);
        editor.save();
        editor.destroy();
        return atom.notifications.addInfo("Updated commandTable", {
          dismissable: true
        });
      });
    };

    Base.generateCommandTableByEagerLoad = function() {
      var _, commandTable, file, filesToLoad, i, j, klass, klasses, klassesGroupedByFile, len, len1, ref1;
      filesToLoad = ['./operator', './operator-insert', './operator-transform-string', './motion', './motion-search', './text-object', './misc-command'];
      filesToLoad.forEach(loadVmpOperationFile);
      _ = _plus();
      klasses = _.values(this.getClassRegistry());
      klassesGroupedByFile = _.groupBy(klasses, function(klass) {
        return klass.VMP_LOADING_FILE;
      });
      commandTable = {};
      for (i = 0, len = filesToLoad.length; i < len; i++) {
        file = filesToLoad[i];
        ref1 = klassesGroupedByFile[file];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          klass = ref1[j];
          commandTable[klass.name] = klass.getSpec();
        }
      }
      return commandTable;
    };

    Base.commandTable = null;

    Base.init = function(_getEditorState) {
      var name, ref1, spec, subscriptions;
      getEditorState = _getEditorState;
      this.commandTable = require('./command-table');
      subscriptions = [];
      ref1 = this.commandTable;
      for (name in ref1) {
        spec = ref1[name];
        if (spec.commandName != null) {
          subscriptions.push(this.registerCommandFromSpec(name, spec));
        }
      }
      return subscriptions;
    };

    classRegistry = {
      Base: Base
    };

    Base.extend = function(command1) {
      this.command = command1 != null ? command1 : true;
      this.VMP_LOADING_FILE = VMP_LOADING_FILE;
      if (this.name in classRegistry) {
        throw new Error("Duplicate constructor " + this.name);
      }
      return classRegistry[this.name] = this;
    };

    Base.getSpec = function() {
      if (this.isCommand()) {
        return {
          file: this.VMP_LOADING_FILE,
          commandName: this.getCommandName(),
          commandScope: this.getCommandScope()
        };
      } else {
        return {
          file: this.VMP_LOADING_FILE
        };
      }
    };

    Base.getClass = function(name) {
      var fileToLoad, klass;
      if ((klass = classRegistry[name])) {
        return klass;
      }
      fileToLoad = this.commandTable[name].file;
      if (indexOf.call(VMP_LOADED_FILES, fileToLoad) < 0) {
        if (atom.inDevMode() && settings.get('debug')) {
          console.log("lazy-require: " + fileToLoad + " for " + name);
        }
        loadVmpOperationFile(fileToLoad);
        if ((klass = classRegistry[name])) {
          return klass;
        }
      }
      throw new Error("class '" + name + "' not found");
    };

    Base.getClassRegistry = function() {
      return classRegistry;
    };

    Base.isCommand = function() {
      return this.command;
    };

    Base.commandPrefix = 'vim-mode-plus';

    Base.getCommandName = function() {
      return this.commandPrefix + ':' + _plus().dasherize(this.name);
    };

    Base.getCommandNameWithoutPrefix = function() {
      return _plus().dasherize(this.name);
    };

    Base.commandScope = 'atom-text-editor';

    Base.getCommandScope = function() {
      return this.commandScope;
    };

    Base.getDesctiption = function() {
      if (this.hasOwnProperty("description")) {
        return this.description;
      } else {
        return null;
      }
    };

    Base.registerCommand = function() {
      var klass;
      klass = this;
      return atom.commands.add(this.getCommandScope(), this.getCommandName(), function(event) {
        var ref1, vimState;
        vimState = (ref1 = getEditorState(this.getModel())) != null ? ref1 : getEditorState(atom.workspace.getActiveTextEditor());
        if (vimState != null) {
          vimState.operationStack.run(klass);
        }
        return event.stopPropagation();
      });
    };

    Base.registerCommandFromSpec = function(name, spec) {
      var commandName, commandPrefix, commandScope, getClass;
      commandScope = spec.commandScope, commandPrefix = spec.commandPrefix, commandName = spec.commandName, getClass = spec.getClass;
      if (commandScope == null) {
        commandScope = 'atom-text-editor';
      }
      if (commandName == null) {
        commandName = (commandPrefix != null ? commandPrefix : 'vim-mode-plus') + ':' + _plus().dasherize(name);
      }
      return atom.commands.add(commandScope, commandName, function(event) {
        var ref1, vimState;
        vimState = (ref1 = getEditorState(this.getModel())) != null ? ref1 : getEditorState(atom.workspace.getActiveTextEditor());
        if (vimState != null) {
          if (getClass != null) {
            vimState.operationStack.run(getClass(name));
          } else {
            vimState.operationStack.run(name);
          }
        }
        return event.stopPropagation();
      });
    };

    Base.operationKind = null;

    Base.getKindForCommandName = function(command) {
      var _, name;
      _ = _plus();
      name = _.capitalize(_.camelize(command));
      if (name in classRegistry) {
        return classRegistry[name].operationKind;
      }
    };

    return Base;

  })();

  module.exports = Base;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQSw2TEFBQTtJQUFBOzs7O0VBQUEsTUFBQSxHQUFTOztFQUNULEtBQUEsR0FBUSxTQUFBOzRCQUNOLFNBQUEsU0FBVSxPQUFBLENBQVEsaUJBQVI7RUFESjs7RUFHUixRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0VBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVYLE1BTUksRUFOSixFQUNFLGFBREYsRUFFRSxhQUZGLEVBR0UsY0FIRixFQUlFLG1CQUpGLEVBS0U7O0VBR0YsZ0JBQUEsR0FBbUI7O0VBQ25CLGdCQUFBLEdBQW1COztFQUVuQixvQkFBQSxHQUF1QixTQUFDLFFBQUQ7QUFDckIsUUFBQTtJQUFBLGdCQUFBLEdBQW1CO0lBQ25CLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjtJQUNULGdCQUFBLEdBQW1CO0lBQ25CLGdCQUFnQixDQUFDLElBQWpCLENBQXNCLFFBQXRCO1dBQ0E7RUFMcUI7O0VBT3ZCLHFCQUFBLEdBQXdCOztFQUV4QixlQUFBLEdBQWtCLENBQ2hCLG1CQURnQixFQUVoQixvQkFGZ0IsRUFHaEIsbUJBSGdCLEVBSWhCLG9CQUpnQixFQU9oQixnQkFQZ0IsRUFPRSxrQkFQRixFQVFkLG9CQVJjLEVBUVEsc0JBUlIsRUFTZCxtQkFUYyxFQVNPLHFCQVRQLEVBVWQsdUJBVmMsRUFVVyx5QkFWWCxFQVlkLHNCQVpjLEVBWVUsd0JBWlYsRUFhZCxxQkFiYyxFQWFTLHVCQWJULEVBY2hCLHNCQWRnQixFQWVoQiwwQkFmZ0IsRUFpQmhCLDBCQWpCZ0IsRUFtQmhCLG9CQW5CZ0IsRUFvQmhCLG1CQXBCZ0IsRUFxQmhCLDJCQXJCZ0IsRUFzQmhCLHNCQXRCZ0IsRUF1QmhCLHFCQXZCZ0IsRUF5QmhCLHVCQXpC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QWEsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxPQUFYLENBQWI7TUFDUCxJQUFHLElBQUEsSUFBUSxhQUFYO2VBQ0UsYUFBYyxDQUFBLElBQUEsQ0FBSyxDQUFDLGNBRHRCOztJQUhzQjs7Ozs7O0VBTTFCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBelhqQiIsInNvdXJjZXNDb250ZW50IjpbIiMgVG8gYXZvaWQgbG9hZGluZyB1bmRlcnNjb3JlLXBsdXMgYW5kIGRlcGVuZGluZyB1bmRlcnNjb3JlIG9uIHN0YXJ0dXBcbl9fcGx1cyA9IG51bGxcbl9wbHVzID0gLT5cbiAgX19wbHVzID89IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuRGVsZWdhdG8gPSByZXF1aXJlICdkZWxlZ2F0bydcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuW1xuICBDU09OXG4gIHBhdGhcbiAgSW5wdXRcbiAgc2VsZWN0TGlzdFxuICBnZXRFZGl0b3JTdGF0ZSAgIyBzZXQgYnkgQmFzZS5pbml0KClcbl0gPSBbXSAjIHNldCBudWxsXG5cblZNUF9MT0FESU5HX0ZJTEUgPSBudWxsXG5WTVBfTE9BREVEX0ZJTEVTID0gW11cblxubG9hZFZtcE9wZXJhdGlvbkZpbGUgPSAoZmlsZW5hbWUpIC0+XG4gIFZNUF9MT0FESU5HX0ZJTEUgPSBmaWxlbmFtZVxuICBsb2FkZWQgPSByZXF1aXJlKGZpbGVuYW1lKVxuICBWTVBfTE9BRElOR19GSUxFID0gbnVsbFxuICBWTVBfTE9BREVEX0ZJTEVTLnB1c2goZmlsZW5hbWUpXG4gIGxvYWRlZFxuXG5PcGVyYXRpb25BYm9ydGVkRXJyb3IgPSBudWxsXG5cbnZpbVN0YXRlTWV0aG9kcyA9IFtcbiAgXCJvbkRpZENoYW5nZVNlYXJjaFwiXG4gIFwib25EaWRDb25maXJtU2VhcmNoXCJcbiAgXCJvbkRpZENhbmNlbFNlYXJjaFwiXG4gIFwib25EaWRDb21tYW5kU2VhcmNoXCJcblxuICAjIExpZmUgY3ljbGUgb2Ygb3BlcmF0aW9uU3RhY2tcbiAgXCJvbkRpZFNldFRhcmdldFwiLCBcImVtaXREaWRTZXRUYXJnZXRcIlxuICAgIFwib25XaWxsU2VsZWN0VGFyZ2V0XCIsIFwiZW1pdFdpbGxTZWxlY3RUYXJnZXRcIlxuICAgIFwib25EaWRTZWxlY3RUYXJnZXRcIiwgXCJlbWl0RGlkU2VsZWN0VGFyZ2V0XCJcbiAgICBcIm9uRGlkRmFpbFNlbGVjdFRhcmdldFwiLCBcImVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0XCJcblxuICAgIFwib25XaWxsRmluaXNoTXV0YXRpb25cIiwgXCJlbWl0V2lsbEZpbmlzaE11dGF0aW9uXCJcbiAgICBcIm9uRGlkRmluaXNoTXV0YXRpb25cIiwgXCJlbWl0RGlkRmluaXNoTXV0YXRpb25cIlxuICBcIm9uRGlkRmluaXNoT3BlcmF0aW9uXCJcbiAgXCJvbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2tcIlxuXG4gIFwib25EaWRTZXRPcGVyYXRvck1vZGlmaWVyXCJcblxuICBcIm9uV2lsbEFjdGl2YXRlTW9kZVwiXG4gIFwib25EaWRBY3RpdmF0ZU1vZGVcIlxuICBcInByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGVcIlxuICBcIm9uV2lsbERlYWN0aXZhdGVNb2RlXCJcbiAgXCJvbkRpZERlYWN0aXZhdGVNb2RlXCJcblxuICBcIm9uRGlkQ2FuY2VsU2VsZWN0TGlzdFwiXG4gIFwic3Vic2NyaWJlXCJcbiAgXCJpc01vZGVcIlxuICBcImdldEJsb2Nrd2lzZVNlbGVjdGlvbnNcIlxuICBcImdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb25cIlxuICBcImFkZFRvQ2xhc3NMaXN0XCJcbiAgXCJnZXRDb25maWdcIlxuXVxuXG5jbGFzcyBCYXNlXG4gIERlbGVnYXRvLmluY2x1ZGVJbnRvKHRoaXMpXG4gIEBkZWxlZ2F0ZXNNZXRob2RzKHZpbVN0YXRlTWV0aG9kcy4uLiwgdG9Qcm9wZXJ0eTogJ3ZpbVN0YXRlJylcbiAgQGRlbGVnYXRlc1Byb3BlcnR5KCdtb2RlJywgJ3N1Ym1vZGUnLCAnc3dyYXAnLCAndXRpbHMnLCB0b1Byb3BlcnR5OiAndmltU3RhdGUnKVxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlLCBwcm9wZXJ0aWVzPW51bGwpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAZ2xvYmFsU3RhdGUsIEBzd3JhcH0gPSBAdmltU3RhdGVcbiAgICBAbmFtZSA9IEBjb25zdHJ1Y3Rvci5uYW1lXG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCBwcm9wZXJ0aWVzKSBpZiBwcm9wZXJ0aWVzP1xuXG4gICMgVG8gb3ZlcnJpZGVcbiAgaW5pdGlhbGl6ZTogLT5cblxuICAjIE9wZXJhdGlvbiBwcm9jZXNzb3IgZXhlY3V0ZSBvbmx5IHdoZW4gaXNDb21wbGV0ZSgpIHJldHVybiB0cnVlLlxuICAjIElmIGZhbHNlLCBvcGVyYXRpb24gcHJvY2Vzc29yIHBvc3Rwb25lIGl0cyBleGVjdXRpb24uXG4gIGlzQ29tcGxldGU6IC0+XG4gICAgaWYgQHJlcXVpcmVJbnB1dCBhbmQgbm90IEBpbnB1dD9cbiAgICAgIGZhbHNlXG4gICAgZWxzZSBpZiBAcmVxdWlyZVRhcmdldFxuICAgICAgIyBXaGVuIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGluIEJhc2U6OmNvbnN0cnVjdG9yXG4gICAgICAjIHRhZ2VydCBpcyBzdGlsbCBzdHJpbmcgbGlrZSBgTW92ZVRvUmlnaHRgLCBpbiB0aGlzIGNhc2UgaXNDb21wbGV0ZVxuICAgICAgIyBpcyBub3QgYXZhaWxhYmxlLlxuICAgICAgQHRhcmdldD8uaXNDb21wbGV0ZT8oKVxuICAgIGVsc2VcbiAgICAgIHRydWVcblxuICByZXF1aXJlVGFyZ2V0OiBmYWxzZVxuICByZXF1aXJlSW5wdXQ6IGZhbHNlXG4gIHJlY29yZGFibGU6IGZhbHNlXG4gIHJlcGVhdGVkOiBmYWxzZVxuICB0YXJnZXQ6IG51bGwgIyBTZXQgaW4gT3BlcmF0b3JcbiAgb3BlcmF0b3I6IG51bGwgIyBTZXQgaW4gb3BlcmF0b3IncyB0YXJnZXQoIE1vdGlvbiBvciBUZXh0T2JqZWN0IClcbiAgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdDogLT5cbiAgICBAb3BlcmF0b3I/IGFuZCBub3QgQG9wZXJhdG9yLmluc3RhbmNlb2YoJ1NlbGVjdCcpXG5cbiAgYWJvcnQ6IC0+XG4gICAgT3BlcmF0aW9uQWJvcnRlZEVycm9yID89IHJlcXVpcmUgJy4vZXJyb3JzJ1xuICAgIHRocm93IG5ldyBPcGVyYXRpb25BYm9ydGVkRXJyb3IoJ2Fib3J0ZWQnKVxuXG4gICMgQ291bnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvdW50OiBudWxsXG4gIGRlZmF1bHRDb3VudDogMVxuICBnZXRDb3VudDogKG9mZnNldD0wKSAtPlxuICAgIEBjb3VudCA/PSBAdmltU3RhdGUuZ2V0Q291bnQoKSA/IEBkZWZhdWx0Q291bnRcbiAgICBAY291bnQgKyBvZmZzZXRcblxuICByZXNldENvdW50OiAtPlxuICAgIEBjb3VudCA9IG51bGxcblxuICBpc0RlZmF1bHRDb3VudDogLT5cbiAgICBAY291bnQgaXMgQGRlZmF1bHRDb3VudFxuXG4gICMgTWlzY1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY291bnRUaW1lczogKGxhc3QsIGZuKSAtPlxuICAgIHJldHVybiBpZiBsYXN0IDwgMVxuXG4gICAgc3RvcHBlZCA9IGZhbHNlXG4gICAgc3RvcCA9IC0+IHN0b3BwZWQgPSB0cnVlXG4gICAgZm9yIGNvdW50IGluIFsxLi5sYXN0XVxuICAgICAgaXNGaW5hbCA9IGNvdW50IGlzIGxhc3RcbiAgICAgIGZuKHtjb3VudCwgaXNGaW5hbCwgc3RvcH0pXG4gICAgICBicmVhayBpZiBzdG9wcGVkXG5cbiAgYWN0aXZhdGVNb2RlOiAobW9kZSwgc3VibW9kZSkgLT5cbiAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgIEB2aW1TdGF0ZS5hY3RpdmF0ZShtb2RlLCBzdWJtb2RlKVxuXG4gIGFjdGl2YXRlTW9kZUlmTmVjZXNzYXJ5OiAobW9kZSwgc3VibW9kZSkgLT5cbiAgICB1bmxlc3MgQHZpbVN0YXRlLmlzTW9kZShtb2RlLCBzdWJtb2RlKVxuICAgICAgQGFjdGl2YXRlTW9kZShtb2RlLCBzdWJtb2RlKVxuXG4gIG5ldzogKG5hbWUsIHByb3BlcnRpZXMpIC0+XG4gICAga2xhc3MgPSBCYXNlLmdldENsYXNzKG5hbWUpXG4gICAgbmV3IGtsYXNzKEB2aW1TdGF0ZSwgcHJvcGVydGllcylcblxuICBuZXdJbnB1dFVJOiAtPlxuICAgIElucHV0ID89IHJlcXVpcmUgJy4vaW5wdXQnXG4gICAgbmV3IElucHV0KEB2aW1TdGF0ZSlcblxuICAjIEZJWE1FOiBUaGlzIGlzIHVzZWQgdG8gY2xvbmUgTW90aW9uOjpTZWFyY2ggdG8gc3VwcG9ydCBgbmAgYW5kIGBOYFxuICAjIEJ1dCBtYW51YWwgcmVzZXRpbmcgYW5kIG92ZXJyaWRpbmcgcHJvcGVydHkgaXMgYnVnIHByb25lLlxuICAjIFNob3VsZCBleHRyYWN0IGFzIHNlYXJjaCBzcGVjIG9iamVjdCBhbmQgdXNlIGl0IGJ5XG4gICMgY3JlYXRpbmcgY2xlYW4gaW5zdGFuY2Ugb2YgU2VhcmNoLlxuICBjbG9uZTogKHZpbVN0YXRlKSAtPlxuICAgIHByb3BlcnRpZXMgPSB7fVxuICAgIGV4Y2x1ZGVQcm9wZXJ0aWVzID0gWydlZGl0b3InLCAnZWRpdG9yRWxlbWVudCcsICdnbG9iYWxTdGF0ZScsICd2aW1TdGF0ZScsICdvcGVyYXRvciddXG4gICAgZm9yIG93biBrZXksIHZhbHVlIG9mIHRoaXMgd2hlbiBrZXkgbm90IGluIGV4Y2x1ZGVQcm9wZXJ0aWVzXG4gICAgICBwcm9wZXJ0aWVzW2tleV0gPSB2YWx1ZVxuICAgIGtsYXNzID0gdGhpcy5jb25zdHJ1Y3RvclxuICAgIG5ldyBrbGFzcyh2aW1TdGF0ZSwgcHJvcGVydGllcylcblxuICBjYW5jZWxPcGVyYXRpb246IC0+XG4gICAgQHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmNhbmNlbCgpXG5cbiAgcHJvY2Vzc09wZXJhdGlvbjogLT5cbiAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucHJvY2VzcygpXG5cbiAgZm9jdXNTZWxlY3RMaXN0OiAob3B0aW9ucz17fSkgLT5cbiAgICBAb25EaWRDYW5jZWxTZWxlY3RMaXN0ID0+XG4gICAgICBAY2FuY2VsT3BlcmF0aW9uKClcbiAgICBzZWxlY3RMaXN0ID89IHJlcXVpcmUgJy4vc2VsZWN0LWxpc3QnXG4gICAgc2VsZWN0TGlzdC5zaG93KEB2aW1TdGF0ZSwgb3B0aW9ucylcblxuICBpbnB1dDogbnVsbFxuICBmb2N1c0lucHV0OiAob3B0aW9ucykgLT5cbiAgICBpbnB1dFVJID0gQG5ld0lucHV0VUkoKVxuICAgIGlucHV0VUkub25EaWRDb25maXJtIChpbnB1dCkgPT5cbiAgICAgIEBpbnB1dCA9IGlucHV0XG4gICAgICBAcHJvY2Vzc09wZXJhdGlvbigpXG5cbiAgICBpZiBvcHRpb25zPy5jaGFyc01heCA+IDFcbiAgICAgIGlucHV0VUkub25EaWRDaGFuZ2UgKGlucHV0KSA9PlxuICAgICAgICBAdmltU3RhdGUuaG92ZXIuc2V0KGlucHV0KVxuXG4gICAgaW5wdXRVSS5vbkRpZENhbmNlbChAY2FuY2VsT3BlcmF0aW9uLmJpbmQodGhpcykpXG4gICAgaW5wdXRVSS5mb2N1cyhvcHRpb25zKVxuXG4gIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIEB1dGlscy5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihAZWRpdG9yKVxuXG4gIGdldFZpbUxhc3RCdWZmZXJSb3c6IC0+XG4gICAgQHV0aWxzLmdldFZpbUxhc3RCdWZmZXJSb3coQGVkaXRvcilcblxuICBnZXRWaW1MYXN0U2NyZWVuUm93OiAtPlxuICAgIEB1dGlscy5nZXRWaW1MYXN0U2NyZWVuUm93KEBlZGl0b3IpXG5cbiAgZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb246IChwb2ludCwgb3B0aW9ucykgLT5cbiAgICBAdXRpbHMuZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgcG9pbnQsIG9wdGlvbnMpXG5cbiAgZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdzogKHJvdykgLT5cbiAgICBAdXRpbHMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhAZWRpdG9yLCByb3cpXG5cbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZTogKHJvd1JhbmdlKSAtPlxuICAgIEB1dGlscy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKEBlZGl0b3IsIHJvd1JhbmdlKVxuXG4gIGdldEluZGVudExldmVsRm9yQnVmZmVyUm93OiAocm93KSAtPlxuICAgIEB1dGlscy5nZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhAZWRpdG9yLCByb3cpXG5cbiAgc2NhbkZvcndhcmQ6IChhcmdzLi4uKSAtPlxuICAgIEB1dGlscy5zY2FuRWRpdG9ySW5EaXJlY3Rpb24oQGVkaXRvciwgJ2ZvcndhcmQnLCBhcmdzLi4uKVxuXG4gIHNjYW5CYWNrd2FyZDogKGFyZ3MuLi4pIC0+XG4gICAgQHV0aWxzLnNjYW5FZGl0b3JJbkRpcmVjdGlvbihAZWRpdG9yLCAnYmFja3dhcmQnLCBhcmdzLi4uKVxuXG4gIGluc3RhbmNlb2Y6IChrbGFzc05hbWUpIC0+XG4gICAgdGhpcyBpbnN0YW5jZW9mIEJhc2UuZ2V0Q2xhc3Moa2xhc3NOYW1lKVxuXG4gIGlzOiAoa2xhc3NOYW1lKSAtPlxuICAgIHRoaXMuY29uc3RydWN0b3IgaXMgQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG5cbiAgaXNPcGVyYXRvcjogLT5cbiAgICBAY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCBpcyAnb3BlcmF0b3InXG5cbiAgaXNNb3Rpb246IC0+XG4gICAgQGNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgaXMgJ21vdGlvbidcblxuICBpc1RleHRPYmplY3Q6IC0+XG4gICAgQGNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgaXMgJ3RleHQtb2JqZWN0J1xuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zOiAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5tYXAoQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uLmJpbmQodGhpcykpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKVxuXG4gIGdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oY3Vyc29yLnNlbGVjdGlvbilcbiAgICBlbHNlXG4gICAgICBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gIGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXSlcblxuICB0b1N0cmluZzogLT5cbiAgICBzdHIgPSBAbmFtZVxuICAgIGlmIEB0YXJnZXQ/XG4gICAgICBzdHIgKz0gXCIsIHRhcmdldD0je0B0YXJnZXQubmFtZX0sIHRhcmdldC53aXNlPSN7QHRhcmdldC53aXNlfSBcIlxuICAgIGVsc2UgaWYgQG9wZXJhdG9yP1xuICAgICAgc3RyICs9IFwiLCB3aXNlPSN7QHdpc2V9ICwgb3BlcmF0b3I9I3tAb3BlcmF0b3IubmFtZX1cIlxuICAgIGVsc2VcbiAgICAgIHN0clxuXG4gICMgQ2xhc3MgbWV0aG9kc1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQHdyaXRlQ29tbWFuZFRhYmxlT25EaXNrOiAtPlxuICAgIGNvbW1hbmRUYWJsZSA9IEBnZW5lcmF0ZUNvbW1hbmRUYWJsZUJ5RWFnZXJMb2FkKClcbiAgICBfID0gX3BsdXMoKVxuICAgIGlmIF8uaXNFcXVhbChAY29tbWFuZFRhYmxlLCBjb21tYW5kVGFibGUpXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIk5vIGNoYW5nZSBjb21tYW5kVGFibGVcIiwgZGlzbWlzc2FibGU6IHRydWUpXG4gICAgICByZXR1cm5cblxuICAgIENTT04gPz0gcmVxdWlyZSAnc2Vhc29uJ1xuICAgIHBhdGggPz0gcmVxdWlyZSgncGF0aCcpXG5cbiAgICBsb2FkYWJsZUNTT05UZXh0ID0gXCJtb2R1bGUuZXhwb3J0cyA9XFxuXCIgKyBDU09OLnN0cmluZ2lmeShjb21tYW5kVGFibGUpICsgXCJcXG5cIlxuICAgIGNvbW1hbmRUYWJsZVBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCBcImNvbW1hbmQtdGFibGUuY29mZmVlXCIpXG4gICAgYXRvbS53b3Jrc3BhY2Uub3Blbihjb21tYW5kVGFibGVQYXRoLCBhY3RpdmF0ZUl0ZW06IGZhbHNlKS50aGVuIChlZGl0b3IpIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dChsb2FkYWJsZUNTT05UZXh0KVxuICAgICAgZWRpdG9yLnNhdmUoKVxuICAgICAgZWRpdG9yLmRlc3Ryb3koKVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJVcGRhdGVkIGNvbW1hbmRUYWJsZVwiLCBkaXNtaXNzYWJsZTogdHJ1ZSlcblxuICBAZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZDogLT5cbiAgICAjIE5PVEU6IGNoYW5naW5nIG9yZGVyIGFmZmVjdHMgb3V0cHV0IG9mIGxpYi9jb21tYW5kLXRhYmxlLmNvZmZlZVxuICAgIGZpbGVzVG9Mb2FkID0gW1xuICAgICAgJy4vb3BlcmF0b3InLCAnLi9vcGVyYXRvci1pbnNlcnQnLCAnLi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nJyxcbiAgICAgICcuL21vdGlvbicsICcuL21vdGlvbi1zZWFyY2gnLCAnLi90ZXh0LW9iamVjdCcsICcuL21pc2MtY29tbWFuZCdcbiAgICBdXG4gICAgZmlsZXNUb0xvYWQuZm9yRWFjaChsb2FkVm1wT3BlcmF0aW9uRmlsZSlcbiAgICBfID0gX3BsdXMoKVxuICAgIGtsYXNzZXMgPSBfLnZhbHVlcyhAZ2V0Q2xhc3NSZWdpc3RyeSgpKVxuICAgIGtsYXNzZXNHcm91cGVkQnlGaWxlID0gXy5ncm91cEJ5KGtsYXNzZXMsIChrbGFzcykgLT4ga2xhc3MuVk1QX0xPQURJTkdfRklMRSlcblxuICAgIGNvbW1hbmRUYWJsZSA9IHt9XG4gICAgZm9yIGZpbGUgaW4gZmlsZXNUb0xvYWRcbiAgICAgIGZvciBrbGFzcyBpbiBrbGFzc2VzR3JvdXBlZEJ5RmlsZVtmaWxlXVxuICAgICAgICBjb21tYW5kVGFibGVba2xhc3MubmFtZV0gPSBrbGFzcy5nZXRTcGVjKClcbiAgICBjb21tYW5kVGFibGVcblxuICBAY29tbWFuZFRhYmxlOiBudWxsXG4gIEBpbml0OiAoX2dldEVkaXRvclN0YXRlKSAtPlxuICAgIGdldEVkaXRvclN0YXRlID0gX2dldEVkaXRvclN0YXRlXG4gICAgQGNvbW1hbmRUYWJsZSA9IHJlcXVpcmUoJy4vY29tbWFuZC10YWJsZScpXG4gICAgc3Vic2NyaXB0aW9ucyA9IFtdXG4gICAgZm9yIG5hbWUsIHNwZWMgb2YgQGNvbW1hbmRUYWJsZSB3aGVuIHNwZWMuY29tbWFuZE5hbWU/XG4gICAgICBzdWJzY3JpcHRpb25zLnB1c2goQHJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKG5hbWUsIHNwZWMpKVxuICAgIHJldHVybiBzdWJzY3JpcHRpb25zXG5cbiAgY2xhc3NSZWdpc3RyeSA9IHtCYXNlfVxuICBAZXh0ZW5kOiAoQGNvbW1hbmQ9dHJ1ZSkgLT5cbiAgICBAVk1QX0xPQURJTkdfRklMRSA9IFZNUF9MT0FESU5HX0ZJTEVcbiAgICBpZiBAbmFtZSBvZiBjbGFzc1JlZ2lzdHJ5XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEdXBsaWNhdGUgY29uc3RydWN0b3IgI3tAbmFtZX1cIilcbiAgICBjbGFzc1JlZ2lzdHJ5W0BuYW1lXSA9IHRoaXNcblxuICBAZ2V0U3BlYzogLT5cbiAgICBpZiBAaXNDb21tYW5kKClcbiAgICAgIGZpbGU6IEBWTVBfTE9BRElOR19GSUxFXG4gICAgICBjb21tYW5kTmFtZTogQGdldENvbW1hbmROYW1lKClcbiAgICAgIGNvbW1hbmRTY29wZTogQGdldENvbW1hbmRTY29wZSgpXG4gICAgZWxzZVxuICAgICAgZmlsZTogQFZNUF9MT0FESU5HX0ZJTEVcblxuICBAZ2V0Q2xhc3M6IChuYW1lKSAtPlxuICAgIHJldHVybiBrbGFzcyBpZiAoa2xhc3MgPSBjbGFzc1JlZ2lzdHJ5W25hbWVdKVxuXG4gICAgZmlsZVRvTG9hZCA9IEBjb21tYW5kVGFibGVbbmFtZV0uZmlsZVxuICAgIGlmIGZpbGVUb0xvYWQgbm90IGluIFZNUF9MT0FERURfRklMRVNcbiAgICAgIGlmIGF0b20uaW5EZXZNb2RlKCkgYW5kIHNldHRpbmdzLmdldCgnZGVidWcnKVxuICAgICAgICBjb25zb2xlLmxvZyBcImxhenktcmVxdWlyZTogI3tmaWxlVG9Mb2FkfSBmb3IgI3tuYW1lfVwiXG4gICAgICBsb2FkVm1wT3BlcmF0aW9uRmlsZShmaWxlVG9Mb2FkKVxuICAgICAgcmV0dXJuIGtsYXNzIGlmIChrbGFzcyA9IGNsYXNzUmVnaXN0cnlbbmFtZV0pXG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJjbGFzcyAnI3tuYW1lfScgbm90IGZvdW5kXCIpXG5cbiAgQGdldENsYXNzUmVnaXN0cnk6IC0+XG4gICAgY2xhc3NSZWdpc3RyeVxuXG4gIEBpc0NvbW1hbmQ6IC0+XG4gICAgQGNvbW1hbmRcblxuICBAY29tbWFuZFByZWZpeDogJ3ZpbS1tb2RlLXBsdXMnXG4gIEBnZXRDb21tYW5kTmFtZTogLT5cbiAgICBAY29tbWFuZFByZWZpeCArICc6JyArIF9wbHVzKCkuZGFzaGVyaXplKEBuYW1lKVxuXG4gIEBnZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXg6IC0+XG4gICAgX3BsdXMoKS5kYXNoZXJpemUoQG5hbWUpXG5cbiAgQGNvbW1hbmRTY29wZTogJ2F0b20tdGV4dC1lZGl0b3InXG4gIEBnZXRDb21tYW5kU2NvcGU6IC0+XG4gICAgQGNvbW1hbmRTY29wZVxuXG4gIEBnZXREZXNjdGlwdGlvbjogLT5cbiAgICBpZiBAaGFzT3duUHJvcGVydHkoXCJkZXNjcmlwdGlvblwiKVxuICAgICAgQGRlc2NyaXB0aW9uXG4gICAgZWxzZVxuICAgICAgbnVsbFxuXG4gIEByZWdpc3RlckNvbW1hbmQ6IC0+XG4gICAga2xhc3MgPSB0aGlzXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgQGdldENvbW1hbmRTY29wZSgpLCBAZ2V0Q29tbWFuZE5hbWUoKSwgKGV2ZW50KSAtPlxuICAgICAgdmltU3RhdGUgPSBnZXRFZGl0b3JTdGF0ZShAZ2V0TW9kZWwoKSkgPyBnZXRFZGl0b3JTdGF0ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gICAgICBpZiB2aW1TdGF0ZT8gIyBQb3NzaWJseSB1bmRlZmluZWQgU2VlICM4NVxuICAgICAgICB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4oa2xhc3MpXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gIEByZWdpc3RlckNvbW1hbmRGcm9tU3BlYzogKG5hbWUsIHNwZWMpIC0+XG4gICAge2NvbW1hbmRTY29wZSwgY29tbWFuZFByZWZpeCwgY29tbWFuZE5hbWUsIGdldENsYXNzfSA9IHNwZWNcbiAgICBjb21tYW5kU2NvcGUgPz0gJ2F0b20tdGV4dC1lZGl0b3InXG4gICAgY29tbWFuZE5hbWUgPz0gKGNvbW1hbmRQcmVmaXggPyAndmltLW1vZGUtcGx1cycpICsgJzonICsgX3BsdXMoKS5kYXNoZXJpemUobmFtZSlcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBjb21tYW5kU2NvcGUsIGNvbW1hbmROYW1lLCAoZXZlbnQpIC0+XG4gICAgICB2aW1TdGF0ZSA9IGdldEVkaXRvclN0YXRlKEBnZXRNb2RlbCgpKSA/IGdldEVkaXRvclN0YXRlKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICAgIGlmIHZpbVN0YXRlPyAjIFBvc3NpYmx5IHVuZGVmaW5lZCBTZWUgIzg1XG4gICAgICAgIGlmIGdldENsYXNzP1xuICAgICAgICAgIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihnZXRDbGFzcyhuYW1lKSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihuYW1lKVxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAjIEZvciBkZW1vLW1vZGUgcGtnIGludGVncmF0aW9uXG4gIEBvcGVyYXRpb25LaW5kOiBudWxsXG4gIEBnZXRLaW5kRm9yQ29tbWFuZE5hbWU6IChjb21tYW5kKSAtPlxuICAgIF8gPSBfcGx1cygpXG4gICAgbmFtZSA9IF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKGNvbW1hbmQpKVxuICAgIGlmIG5hbWUgb2YgY2xhc3NSZWdpc3RyeVxuICAgICAgY2xhc3NSZWdpc3RyeVtuYW1lXS5vcGVyYXRpb25LaW5kXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuIl19
