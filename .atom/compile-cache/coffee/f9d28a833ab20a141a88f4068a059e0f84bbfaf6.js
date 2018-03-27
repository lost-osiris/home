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

    Base.prototype.getFoldEndRowForRow = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.utils).getFoldEndRowForRow.apply(ref1, [this.editor].concat(slice.call(args)));
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
      console.warn(commandTable);
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
      loadableCSONText = "# This file is auto generated by `vim-mode-plus:write-command-table-on-disk` command.\n# DONT edit manually.\nmodule.exports =\n" + (CSON.stringify(commandTable)) + "\n";
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
        console.warn("Duplicate constructor " + this.name);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQSw2TEFBQTtJQUFBOzs7O0VBQUEsTUFBQSxHQUFTOztFQUNULEtBQUEsR0FBUSxTQUFBOzRCQUNOLFNBQUEsU0FBVSxPQUFBLENBQVEsaUJBQVI7RUFESjs7RUFHUixRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0VBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVYLE1BTUksRUFOSixFQUNFLGFBREYsRUFFRSxhQUZGLEVBR0UsY0FIRixFQUlFLG1CQUpGLEVBS0U7O0VBR0YsZ0JBQUEsR0FBbUI7O0VBQ25CLGdCQUFBLEdBQW1COztFQUVuQixvQkFBQSxHQUF1QixTQUFDLFFBQUQ7QUFDckIsUUFBQTtJQUFBLGdCQUFBLEdBQW1CO0lBQ25CLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjtJQUNULGdCQUFBLEdBQW1CO0lBQ25CLGdCQUFnQixDQUFDLElBQWpCLENBQXNCLFFBQXRCO1dBQ0E7RUFMcUI7O0VBT3ZCLHFCQUFBLEdBQXdCOztFQUV4QixlQUFBLEdBQWtCLENBQ2hCLG1CQURnQixFQUVoQixvQkFGZ0IsRUFHaEIsbUJBSGdCLEVBSWhCLG9CQUpnQixFQU9oQixnQkFQZ0IsRUFPRSxrQkFQRixFQVFkLG9CQVJjLEVBUVEsc0JBUlIsRUFTZCxtQkFUYyxFQVNPLHFCQVRQLEVBVWQsdUJBVmMsRUFVVyx5QkFWWCxFQVlkLHNCQVpjLEVBWVUsd0JBWlYsRUFhZCxxQkFiYyxFQWFTLHVCQWJULEVBY2hCLHNCQWRnQixFQWVoQiwwQkFmZ0IsRUFpQmhCLDBCQWpCZ0IsRUFtQmhCLG9CQW5CZ0IsRUFvQmhCLG1CQXBCZ0IsRUFxQmhCLDJCQXJCZ0IsRUFzQmhCLHNCQXRCZ0IsRUF1QmhCLHFCQXZCZ0IsRUF5QmhCLHVCQXpC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REY7O2VBS0EsS0FBSyxDQUFDLGVBQU4sQ0FBQTtNQVAyQyxDQUE3QztJQUp3Qjs7SUFjMUIsSUFBQyxDQUFBLGFBQUQsR0FBZ0I7O0lBQ2hCLElBQUMsQ0FBQSxxQkFBRCxHQUF3QixTQUFDLE9BQUQ7QUFDdEIsVUFBQTtNQUFBLENBQUEsR0FBSSxLQUFBLENBQUE7TUFDSixJQUFBLEdBQU8sQ0FBQyxDQUFDLFVBQUYsQ0FBYSxDQUFDLENBQUMsUUFBRixDQUFXLE9BQVgsQ0FBYjtNQUNQLElBQUcsSUFBQSxJQUFRLGFBQVg7ZUFDRSxhQUFjLENBQUEsSUFBQSxDQUFLLENBQUMsY0FEdEI7O0lBSHNCOzs7Ozs7RUFNMUIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFsWWpCIiwic291cmNlc0NvbnRlbnQiOlsiIyBUbyBhdm9pZCBsb2FkaW5nIHVuZGVyc2NvcmUtcGx1cyBhbmQgZGVwZW5kaW5nIHVuZGVyc2NvcmUgb24gc3RhcnR1cFxuX19wbHVzID0gbnVsbFxuX3BsdXMgPSAtPlxuICBfX3BsdXMgPz0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5EZWxlZ2F0byA9IHJlcXVpcmUgJ2RlbGVnYXRvJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5bXG4gIENTT05cbiAgcGF0aFxuICBJbnB1dFxuICBzZWxlY3RMaXN0XG4gIGdldEVkaXRvclN0YXRlICAjIHNldCBieSBCYXNlLmluaXQoKVxuXSA9IFtdICMgc2V0IG51bGxcblxuVk1QX0xPQURJTkdfRklMRSA9IG51bGxcblZNUF9MT0FERURfRklMRVMgPSBbXVxuXG5sb2FkVm1wT3BlcmF0aW9uRmlsZSA9IChmaWxlbmFtZSkgLT5cbiAgVk1QX0xPQURJTkdfRklMRSA9IGZpbGVuYW1lXG4gIGxvYWRlZCA9IHJlcXVpcmUoZmlsZW5hbWUpXG4gIFZNUF9MT0FESU5HX0ZJTEUgPSBudWxsXG4gIFZNUF9MT0FERURfRklMRVMucHVzaChmaWxlbmFtZSlcbiAgbG9hZGVkXG5cbk9wZXJhdGlvbkFib3J0ZWRFcnJvciA9IG51bGxcblxudmltU3RhdGVNZXRob2RzID0gW1xuICBcIm9uRGlkQ2hhbmdlU2VhcmNoXCJcbiAgXCJvbkRpZENvbmZpcm1TZWFyY2hcIlxuICBcIm9uRGlkQ2FuY2VsU2VhcmNoXCJcbiAgXCJvbkRpZENvbW1hbmRTZWFyY2hcIlxuXG4gICMgTGlmZSBjeWNsZSBvZiBvcGVyYXRpb25TdGFja1xuICBcIm9uRGlkU2V0VGFyZ2V0XCIsIFwiZW1pdERpZFNldFRhcmdldFwiXG4gICAgXCJvbldpbGxTZWxlY3RUYXJnZXRcIiwgXCJlbWl0V2lsbFNlbGVjdFRhcmdldFwiXG4gICAgXCJvbkRpZFNlbGVjdFRhcmdldFwiLCBcImVtaXREaWRTZWxlY3RUYXJnZXRcIlxuICAgIFwib25EaWRGYWlsU2VsZWN0VGFyZ2V0XCIsIFwiZW1pdERpZEZhaWxTZWxlY3RUYXJnZXRcIlxuXG4gICAgXCJvbldpbGxGaW5pc2hNdXRhdGlvblwiLCBcImVtaXRXaWxsRmluaXNoTXV0YXRpb25cIlxuICAgIFwib25EaWRGaW5pc2hNdXRhdGlvblwiLCBcImVtaXREaWRGaW5pc2hNdXRhdGlvblwiXG4gIFwib25EaWRGaW5pc2hPcGVyYXRpb25cIlxuICBcIm9uRGlkUmVzZXRPcGVyYXRpb25TdGFja1wiXG5cbiAgXCJvbkRpZFNldE9wZXJhdG9yTW9kaWZpZXJcIlxuXG4gIFwib25XaWxsQWN0aXZhdGVNb2RlXCJcbiAgXCJvbkRpZEFjdGl2YXRlTW9kZVwiXG4gIFwicHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZVwiXG4gIFwib25XaWxsRGVhY3RpdmF0ZU1vZGVcIlxuICBcIm9uRGlkRGVhY3RpdmF0ZU1vZGVcIlxuXG4gIFwib25EaWRDYW5jZWxTZWxlY3RMaXN0XCJcbiAgXCJzdWJzY3JpYmVcIlxuICBcImlzTW9kZVwiXG4gIFwiZ2V0QmxvY2t3aXNlU2VsZWN0aW9uc1wiXG4gIFwiZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvblwiXG4gIFwiYWRkVG9DbGFzc0xpc3RcIlxuICBcImdldENvbmZpZ1wiXG5dXG5cbmNsYXNzIEJhc2VcbiAgRGVsZWdhdG8uaW5jbHVkZUludG8odGhpcylcbiAgQGRlbGVnYXRlc01ldGhvZHModmltU3RhdGVNZXRob2RzLi4uLCB0b1Byb3BlcnR5OiAndmltU3RhdGUnKVxuICBAZGVsZWdhdGVzUHJvcGVydHkoJ21vZGUnLCAnc3VibW9kZScsICdzd3JhcCcsICd1dGlscycsIHRvUHJvcGVydHk6ICd2aW1TdGF0ZScpXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUsIHByb3BlcnRpZXM9bnVsbCkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBnbG9iYWxTdGF0ZSwgQHN3cmFwfSA9IEB2aW1TdGF0ZVxuICAgIEBuYW1lID0gQGNvbnN0cnVjdG9yLm5hbWVcbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIHByb3BlcnRpZXMpIGlmIHByb3BlcnRpZXM/XG5cbiAgIyBUbyBvdmVycmlkZVxuICBpbml0aWFsaXplOiAtPlxuXG4gICMgT3BlcmF0aW9uIHByb2Nlc3NvciBleGVjdXRlIG9ubHkgd2hlbiBpc0NvbXBsZXRlKCkgcmV0dXJuIHRydWUuXG4gICMgSWYgZmFsc2UsIG9wZXJhdGlvbiBwcm9jZXNzb3IgcG9zdHBvbmUgaXRzIGV4ZWN1dGlvbi5cbiAgaXNDb21wbGV0ZTogLT5cbiAgICBpZiBAcmVxdWlyZUlucHV0IGFuZCBub3QgQGlucHV0P1xuICAgICAgZmFsc2VcbiAgICBlbHNlIGlmIEByZXF1aXJlVGFyZ2V0XG4gICAgICAjIFdoZW4gdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgaW4gQmFzZTo6Y29uc3RydWN0b3JcbiAgICAgICMgdGFnZXJ0IGlzIHN0aWxsIHN0cmluZyBsaWtlIGBNb3ZlVG9SaWdodGAsIGluIHRoaXMgY2FzZSBpc0NvbXBsZXRlXG4gICAgICAjIGlzIG5vdCBhdmFpbGFibGUuXG4gICAgICBAdGFyZ2V0Py5pc0NvbXBsZXRlPygpXG4gICAgZWxzZVxuICAgICAgdHJ1ZVxuXG4gIHJlcXVpcmVUYXJnZXQ6IGZhbHNlXG4gIHJlcXVpcmVJbnB1dDogZmFsc2VcbiAgcmVjb3JkYWJsZTogZmFsc2VcbiAgcmVwZWF0ZWQ6IGZhbHNlXG4gIHRhcmdldDogbnVsbCAjIFNldCBpbiBPcGVyYXRvclxuICBvcGVyYXRvcjogbnVsbCAjIFNldCBpbiBvcGVyYXRvcidzIHRhcmdldCggTW90aW9uIG9yIFRleHRPYmplY3QgKVxuICBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0OiAtPlxuICAgIEBvcGVyYXRvcj8gYW5kIG5vdCBAb3BlcmF0b3IuaW5zdGFuY2VvZignU2VsZWN0JylcblxuICBhYm9ydDogLT5cbiAgICBPcGVyYXRpb25BYm9ydGVkRXJyb3IgPz0gcmVxdWlyZSAnLi9lcnJvcnMnXG4gICAgdGhyb3cgbmV3IE9wZXJhdGlvbkFib3J0ZWRFcnJvcignYWJvcnRlZCcpXG5cbiAgIyBDb3VudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY291bnQ6IG51bGxcbiAgZGVmYXVsdENvdW50OiAxXG4gIGdldENvdW50OiAob2Zmc2V0PTApIC0+XG4gICAgQGNvdW50ID89IEB2aW1TdGF0ZS5nZXRDb3VudCgpID8gQGRlZmF1bHRDb3VudFxuICAgIEBjb3VudCArIG9mZnNldFxuXG4gIHJlc2V0Q291bnQ6IC0+XG4gICAgQGNvdW50ID0gbnVsbFxuXG4gIGlzRGVmYXVsdENvdW50OiAtPlxuICAgIEBjb3VudCBpcyBAZGVmYXVsdENvdW50XG5cbiAgIyBNaXNjXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb3VudFRpbWVzOiAobGFzdCwgZm4pIC0+XG4gICAgcmV0dXJuIGlmIGxhc3QgPCAxXG5cbiAgICBzdG9wcGVkID0gZmFsc2VcbiAgICBzdG9wID0gLT4gc3RvcHBlZCA9IHRydWVcbiAgICBmb3IgY291bnQgaW4gWzEuLmxhc3RdXG4gICAgICBpc0ZpbmFsID0gY291bnQgaXMgbGFzdFxuICAgICAgZm4oe2NvdW50LCBpc0ZpbmFsLCBzdG9wfSlcbiAgICAgIGJyZWFrIGlmIHN0b3BwZWRcblxuICBhY3RpdmF0ZU1vZGU6IChtb2RlLCBzdWJtb2RlKSAtPlxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgQHZpbVN0YXRlLmFjdGl2YXRlKG1vZGUsIHN1Ym1vZGUpXG5cbiAgYWN0aXZhdGVNb2RlSWZOZWNlc3Nhcnk6IChtb2RlLCBzdWJtb2RlKSAtPlxuICAgIHVubGVzcyBAdmltU3RhdGUuaXNNb2RlKG1vZGUsIHN1Ym1vZGUpXG4gICAgICBAYWN0aXZhdGVNb2RlKG1vZGUsIHN1Ym1vZGUpXG5cbiAgbmV3OiAobmFtZSwgcHJvcGVydGllcykgLT5cbiAgICBrbGFzcyA9IEJhc2UuZ2V0Q2xhc3MobmFtZSlcbiAgICBuZXcga2xhc3MoQHZpbVN0YXRlLCBwcm9wZXJ0aWVzKVxuXG4gIG5ld0lucHV0VUk6IC0+XG4gICAgSW5wdXQgPz0gcmVxdWlyZSAnLi9pbnB1dCdcbiAgICBuZXcgSW5wdXQoQHZpbVN0YXRlKVxuXG4gICMgRklYTUU6IFRoaXMgaXMgdXNlZCB0byBjbG9uZSBNb3Rpb246OlNlYXJjaCB0byBzdXBwb3J0IGBuYCBhbmQgYE5gXG4gICMgQnV0IG1hbnVhbCByZXNldGluZyBhbmQgb3ZlcnJpZGluZyBwcm9wZXJ0eSBpcyBidWcgcHJvbmUuXG4gICMgU2hvdWxkIGV4dHJhY3QgYXMgc2VhcmNoIHNwZWMgb2JqZWN0IGFuZCB1c2UgaXQgYnlcbiAgIyBjcmVhdGluZyBjbGVhbiBpbnN0YW5jZSBvZiBTZWFyY2guXG4gIGNsb25lOiAodmltU3RhdGUpIC0+XG4gICAgcHJvcGVydGllcyA9IHt9XG4gICAgZXhjbHVkZVByb3BlcnRpZXMgPSBbJ2VkaXRvcicsICdlZGl0b3JFbGVtZW50JywgJ2dsb2JhbFN0YXRlJywgJ3ZpbVN0YXRlJywgJ29wZXJhdG9yJ11cbiAgICBmb3Igb3duIGtleSwgdmFsdWUgb2YgdGhpcyB3aGVuIGtleSBub3QgaW4gZXhjbHVkZVByb3BlcnRpZXNcbiAgICAgIHByb3BlcnRpZXNba2V5XSA9IHZhbHVlXG4gICAga2xhc3MgPSB0aGlzLmNvbnN0cnVjdG9yXG4gICAgbmV3IGtsYXNzKHZpbVN0YXRlLCBwcm9wZXJ0aWVzKVxuXG4gIGNhbmNlbE9wZXJhdGlvbjogLT5cbiAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2suY2FuY2VsKClcblxuICBwcm9jZXNzT3BlcmF0aW9uOiAtPlxuICAgIEB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5wcm9jZXNzKClcblxuICBmb2N1c1NlbGVjdExpc3Q6IChvcHRpb25zPXt9KSAtPlxuICAgIEBvbkRpZENhbmNlbFNlbGVjdExpc3QgPT5cbiAgICAgIEBjYW5jZWxPcGVyYXRpb24oKVxuICAgIHNlbGVjdExpc3QgPz0gcmVxdWlyZSAnLi9zZWxlY3QtbGlzdCdcbiAgICBzZWxlY3RMaXN0LnNob3coQHZpbVN0YXRlLCBvcHRpb25zKVxuXG4gIGlucHV0OiBudWxsXG4gIGZvY3VzSW5wdXQ6IChvcHRpb25zKSAtPlxuICAgIGlucHV0VUkgPSBAbmV3SW5wdXRVSSgpXG4gICAgaW5wdXRVSS5vbkRpZENvbmZpcm0gKGlucHV0KSA9PlxuICAgICAgQGlucHV0ID0gaW5wdXRcbiAgICAgIEBwcm9jZXNzT3BlcmF0aW9uKClcblxuICAgIGlmIG9wdGlvbnM/LmNoYXJzTWF4ID4gMVxuICAgICAgaW5wdXRVSS5vbkRpZENoYW5nZSAoaW5wdXQpID0+XG4gICAgICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoaW5wdXQpXG5cbiAgICBpbnB1dFVJLm9uRGlkQ2FuY2VsKEBjYW5jZWxPcGVyYXRpb24uYmluZCh0aGlzKSlcbiAgICBpbnB1dFVJLmZvY3VzKG9wdGlvbnMpXG5cbiAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb246IC0+XG4gICAgQHV0aWxzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IpXG5cbiAgZ2V0VmltTGFzdEJ1ZmZlclJvdzogLT5cbiAgICBAdXRpbHMuZ2V0VmltTGFzdEJ1ZmZlclJvdyhAZWRpdG9yKVxuXG4gIGdldFZpbUxhc3RTY3JlZW5Sb3c6IC0+XG4gICAgQHV0aWxzLmdldFZpbUxhc3RTY3JlZW5Sb3coQGVkaXRvcilcblxuICBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbjogKHBvaW50LCBvcHRpb25zKSAtPlxuICAgIEB1dGlscy5nZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBwb2ludCwgb3B0aW9ucylcblxuICBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93OiAocm93KSAtPlxuICAgIEB1dGlscy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KEBlZGl0b3IsIHJvdylcblxuICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlOiAocm93UmFuZ2UpIC0+XG4gICAgQHV0aWxzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UoQGVkaXRvciwgcm93UmFuZ2UpXG5cbiAgZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3c6IChyb3cpIC0+XG4gICAgQHV0aWxzLmdldEluZGVudExldmVsRm9yQnVmZmVyUm93KEBlZGl0b3IsIHJvdylcblxuICBzY2FuRm9yd2FyZDogKGFyZ3MuLi4pIC0+XG4gICAgQHV0aWxzLnNjYW5FZGl0b3JJbkRpcmVjdGlvbihAZWRpdG9yLCAnZm9yd2FyZCcsIGFyZ3MuLi4pXG5cbiAgc2NhbkJhY2t3YXJkOiAoYXJncy4uLikgLT5cbiAgICBAdXRpbHMuc2NhbkVkaXRvckluRGlyZWN0aW9uKEBlZGl0b3IsICdiYWNrd2FyZCcsIGFyZ3MuLi4pXG5cbiAgZ2V0Rm9sZEVuZFJvd0ZvclJvdzogKGFyZ3MuLi4pIC0+XG4gICAgQHV0aWxzLmdldEZvbGRFbmRSb3dGb3JSb3coQGVkaXRvciwgYXJncy4uLilcblxuICBpbnN0YW5jZW9mOiAoa2xhc3NOYW1lKSAtPlxuICAgIHRoaXMgaW5zdGFuY2VvZiBCYXNlLmdldENsYXNzKGtsYXNzTmFtZSlcblxuICBpczogKGtsYXNzTmFtZSkgLT5cbiAgICB0aGlzLmNvbnN0cnVjdG9yIGlzIEJhc2UuZ2V0Q2xhc3Moa2xhc3NOYW1lKVxuXG4gIGlzT3BlcmF0b3I6IC0+XG4gICAgQGNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgaXMgJ29wZXJhdG9yJ1xuXG4gIGlzTW90aW9uOiAtPlxuICAgIEBjb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kIGlzICdtb3Rpb24nXG5cbiAgaXNUZXh0T2JqZWN0OiAtPlxuICAgIEBjb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kIGlzICd0ZXh0LW9iamVjdCdcblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uczogLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkubWFwKEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbi5iaW5kKHRoaXMpKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKClcblxuICBnZXRCdWZmZXJQb3NpdGlvbkZvckN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKGN1cnNvci5zZWxlY3Rpb24pXG4gICAgZWxzZVxuICAgICAgY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknLCAnc2VsZWN0aW9uJ10pXG5cbiAgdG9TdHJpbmc6IC0+XG4gICAgc3RyID0gQG5hbWVcbiAgICBpZiBAdGFyZ2V0P1xuICAgICAgc3RyICs9IFwiLCB0YXJnZXQ9I3tAdGFyZ2V0Lm5hbWV9LCB0YXJnZXQud2lzZT0je0B0YXJnZXQud2lzZX0gXCJcbiAgICBlbHNlIGlmIEBvcGVyYXRvcj9cbiAgICAgIHN0ciArPSBcIiwgd2lzZT0je0B3aXNlfSAsIG9wZXJhdG9yPSN7QG9wZXJhdG9yLm5hbWV9XCJcbiAgICBlbHNlXG4gICAgICBzdHJcblxuICAjIENsYXNzIG1ldGhvZHNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEB3cml0ZUNvbW1hbmRUYWJsZU9uRGlzazogLT5cbiAgICBjb21tYW5kVGFibGUgPSBAZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZCgpXG4gICAgY29uc29sZS53YXJuIGNvbW1hbmRUYWJsZSAjIGludmVzdGlnYXRlIHdoeSBzb21ldGltZSB0aGlzIGdldCBlbXB0eT9cbiAgICBfID0gX3BsdXMoKVxuICAgIGlmIF8uaXNFcXVhbChAY29tbWFuZFRhYmxlLCBjb21tYW5kVGFibGUpXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIk5vIGNoYW5nZSBjb21tYW5kVGFibGVcIiwgZGlzbWlzc2FibGU6IHRydWUpXG4gICAgICByZXR1cm5cblxuICAgIENTT04gPz0gcmVxdWlyZSAnc2Vhc29uJ1xuICAgIHBhdGggPz0gcmVxdWlyZSgncGF0aCcpXG5cbiAgICBsb2FkYWJsZUNTT05UZXh0ID0gXCJcIlwiXG4gICAgICAjIFRoaXMgZmlsZSBpcyBhdXRvIGdlbmVyYXRlZCBieSBgdmltLW1vZGUtcGx1czp3cml0ZS1jb21tYW5kLXRhYmxlLW9uLWRpc2tgIGNvbW1hbmQuXG4gICAgICAjIERPTlQgZWRpdCBtYW51YWxseS5cbiAgICAgIG1vZHVsZS5leHBvcnRzID1cbiAgICAgICN7Q1NPTi5zdHJpbmdpZnkoY29tbWFuZFRhYmxlKX1cXG5cbiAgICAgIFwiXCJcIlxuICAgIGNvbW1hbmRUYWJsZVBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCBcImNvbW1hbmQtdGFibGUuY29mZmVlXCIpXG4gICAgYXRvbS53b3Jrc3BhY2Uub3Blbihjb21tYW5kVGFibGVQYXRoLCBhY3RpdmF0ZUl0ZW06IGZhbHNlKS50aGVuIChlZGl0b3IpIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dChsb2FkYWJsZUNTT05UZXh0KVxuICAgICAgZWRpdG9yLnNhdmUoKVxuICAgICAgZWRpdG9yLmRlc3Ryb3koKVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJVcGRhdGVkIGNvbW1hbmRUYWJsZVwiLCBkaXNtaXNzYWJsZTogdHJ1ZSlcblxuICBAZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZDogLT5cbiAgICAjIE5PVEU6IGNoYW5naW5nIG9yZGVyIGFmZmVjdHMgb3V0cHV0IG9mIGxpYi9jb21tYW5kLXRhYmxlLmNvZmZlZVxuICAgIGZpbGVzVG9Mb2FkID0gW1xuICAgICAgJy4vb3BlcmF0b3InLCAnLi9vcGVyYXRvci1pbnNlcnQnLCAnLi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nJyxcbiAgICAgICcuL21vdGlvbicsICcuL21vdGlvbi1zZWFyY2gnLCAnLi90ZXh0LW9iamVjdCcsICcuL21pc2MtY29tbWFuZCdcbiAgICBdXG4gICAgZmlsZXNUb0xvYWQuZm9yRWFjaChsb2FkVm1wT3BlcmF0aW9uRmlsZSlcbiAgICBfID0gX3BsdXMoKVxuICAgIGtsYXNzZXMgPSBfLnZhbHVlcyhAZ2V0Q2xhc3NSZWdpc3RyeSgpKVxuICAgIGtsYXNzZXNHcm91cGVkQnlGaWxlID0gXy5ncm91cEJ5KGtsYXNzZXMsIChrbGFzcykgLT4ga2xhc3MuVk1QX0xPQURJTkdfRklMRSlcblxuICAgIGNvbW1hbmRUYWJsZSA9IHt9XG4gICAgZm9yIGZpbGUgaW4gZmlsZXNUb0xvYWRcbiAgICAgIGZvciBrbGFzcyBpbiBrbGFzc2VzR3JvdXBlZEJ5RmlsZVtmaWxlXVxuICAgICAgICBjb21tYW5kVGFibGVba2xhc3MubmFtZV0gPSBrbGFzcy5nZXRTcGVjKClcbiAgICBjb21tYW5kVGFibGVcblxuICBAY29tbWFuZFRhYmxlOiBudWxsXG4gIEBpbml0OiAoX2dldEVkaXRvclN0YXRlKSAtPlxuICAgIGdldEVkaXRvclN0YXRlID0gX2dldEVkaXRvclN0YXRlXG4gICAgQGNvbW1hbmRUYWJsZSA9IHJlcXVpcmUoJy4vY29tbWFuZC10YWJsZScpXG4gICAgc3Vic2NyaXB0aW9ucyA9IFtdXG4gICAgZm9yIG5hbWUsIHNwZWMgb2YgQGNvbW1hbmRUYWJsZSB3aGVuIHNwZWMuY29tbWFuZE5hbWU/XG4gICAgICBzdWJzY3JpcHRpb25zLnB1c2goQHJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKG5hbWUsIHNwZWMpKVxuICAgIHJldHVybiBzdWJzY3JpcHRpb25zXG5cbiAgY2xhc3NSZWdpc3RyeSA9IHtCYXNlfVxuICBAZXh0ZW5kOiAoQGNvbW1hbmQ9dHJ1ZSkgLT5cbiAgICBAVk1QX0xPQURJTkdfRklMRSA9IFZNUF9MT0FESU5HX0ZJTEVcbiAgICBpZiBAbmFtZSBvZiBjbGFzc1JlZ2lzdHJ5XG4gICAgICBjb25zb2xlLndhcm4oXCJEdXBsaWNhdGUgY29uc3RydWN0b3IgI3tAbmFtZX1cIilcbiAgICBjbGFzc1JlZ2lzdHJ5W0BuYW1lXSA9IHRoaXNcblxuICBAZ2V0U3BlYzogLT5cbiAgICBpZiBAaXNDb21tYW5kKClcbiAgICAgIGZpbGU6IEBWTVBfTE9BRElOR19GSUxFXG4gICAgICBjb21tYW5kTmFtZTogQGdldENvbW1hbmROYW1lKClcbiAgICAgIGNvbW1hbmRTY29wZTogQGdldENvbW1hbmRTY29wZSgpXG4gICAgZWxzZVxuICAgICAgZmlsZTogQFZNUF9MT0FESU5HX0ZJTEVcblxuICBAZ2V0Q2xhc3M6IChuYW1lKSAtPlxuICAgIHJldHVybiBrbGFzcyBpZiAoa2xhc3MgPSBjbGFzc1JlZ2lzdHJ5W25hbWVdKVxuXG4gICAgZmlsZVRvTG9hZCA9IEBjb21tYW5kVGFibGVbbmFtZV0uZmlsZVxuICAgIGlmIGZpbGVUb0xvYWQgbm90IGluIFZNUF9MT0FERURfRklMRVNcbiAgICAgIGlmIGF0b20uaW5EZXZNb2RlKCkgYW5kIHNldHRpbmdzLmdldCgnZGVidWcnKVxuICAgICAgICBjb25zb2xlLmxvZyBcImxhenktcmVxdWlyZTogI3tmaWxlVG9Mb2FkfSBmb3IgI3tuYW1lfVwiXG4gICAgICBsb2FkVm1wT3BlcmF0aW9uRmlsZShmaWxlVG9Mb2FkKVxuICAgICAgcmV0dXJuIGtsYXNzIGlmIChrbGFzcyA9IGNsYXNzUmVnaXN0cnlbbmFtZV0pXG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJjbGFzcyAnI3tuYW1lfScgbm90IGZvdW5kXCIpXG5cbiAgQGdldENsYXNzUmVnaXN0cnk6IC0+XG4gICAgY2xhc3NSZWdpc3RyeVxuXG4gIEBpc0NvbW1hbmQ6IC0+XG4gICAgQGNvbW1hbmRcblxuICBAY29tbWFuZFByZWZpeDogJ3ZpbS1tb2RlLXBsdXMnXG4gIEBnZXRDb21tYW5kTmFtZTogLT5cbiAgICBAY29tbWFuZFByZWZpeCArICc6JyArIF9wbHVzKCkuZGFzaGVyaXplKEBuYW1lKVxuXG4gIEBnZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXg6IC0+XG4gICAgX3BsdXMoKS5kYXNoZXJpemUoQG5hbWUpXG5cbiAgQGNvbW1hbmRTY29wZTogJ2F0b20tdGV4dC1lZGl0b3InXG4gIEBnZXRDb21tYW5kU2NvcGU6IC0+XG4gICAgQGNvbW1hbmRTY29wZVxuXG4gIEBnZXREZXNjdGlwdGlvbjogLT5cbiAgICBpZiBAaGFzT3duUHJvcGVydHkoXCJkZXNjcmlwdGlvblwiKVxuICAgICAgQGRlc2NyaXB0aW9uXG4gICAgZWxzZVxuICAgICAgbnVsbFxuXG4gIEByZWdpc3RlckNvbW1hbmQ6IC0+XG4gICAga2xhc3MgPSB0aGlzXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgQGdldENvbW1hbmRTY29wZSgpLCBAZ2V0Q29tbWFuZE5hbWUoKSwgKGV2ZW50KSAtPlxuICAgICAgdmltU3RhdGUgPSBnZXRFZGl0b3JTdGF0ZShAZ2V0TW9kZWwoKSkgPyBnZXRFZGl0b3JTdGF0ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gICAgICBpZiB2aW1TdGF0ZT8gIyBQb3NzaWJseSB1bmRlZmluZWQgU2VlICM4NVxuICAgICAgICB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4oa2xhc3MpXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gIEByZWdpc3RlckNvbW1hbmRGcm9tU3BlYzogKG5hbWUsIHNwZWMpIC0+XG4gICAge2NvbW1hbmRTY29wZSwgY29tbWFuZFByZWZpeCwgY29tbWFuZE5hbWUsIGdldENsYXNzfSA9IHNwZWNcbiAgICBjb21tYW5kU2NvcGUgPz0gJ2F0b20tdGV4dC1lZGl0b3InXG4gICAgY29tbWFuZE5hbWUgPz0gKGNvbW1hbmRQcmVmaXggPyAndmltLW1vZGUtcGx1cycpICsgJzonICsgX3BsdXMoKS5kYXNoZXJpemUobmFtZSlcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBjb21tYW5kU2NvcGUsIGNvbW1hbmROYW1lLCAoZXZlbnQpIC0+XG4gICAgICB2aW1TdGF0ZSA9IGdldEVkaXRvclN0YXRlKEBnZXRNb2RlbCgpKSA/IGdldEVkaXRvclN0YXRlKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICAgIGlmIHZpbVN0YXRlPyAjIFBvc3NpYmx5IHVuZGVmaW5lZCBTZWUgIzg1XG4gICAgICAgIGlmIGdldENsYXNzP1xuICAgICAgICAgIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihnZXRDbGFzcyhuYW1lKSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihuYW1lKVxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAjIEZvciBkZW1vLW1vZGUgcGtnIGludGVncmF0aW9uXG4gIEBvcGVyYXRpb25LaW5kOiBudWxsXG4gIEBnZXRLaW5kRm9yQ29tbWFuZE5hbWU6IChjb21tYW5kKSAtPlxuICAgIF8gPSBfcGx1cygpXG4gICAgbmFtZSA9IF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKGNvbW1hbmQpKVxuICAgIGlmIG5hbWUgb2YgY2xhc3NSZWdpc3RyeVxuICAgICAgY2xhc3NSZWdpc3RyeVtuYW1lXS5vcGVyYXRpb25LaW5kXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuIl19
