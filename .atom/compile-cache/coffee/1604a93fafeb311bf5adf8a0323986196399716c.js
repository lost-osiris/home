(function() {
  var AddBlankLineAbove, AddBlankLineBelow, AddPresetOccurrenceFromLastOccurrencePattern, Base, CreatePersistentSelection, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteLine, DeleteRight, DeleteToLastCharacterOfLine, Increase, IncrementNumber, Operator, PutAfter, PutAfterWithAutoIndent, PutBefore, PutBeforeWithAutoIndent, Select, SelectLatestChange, SelectOccurrence, SelectPersistentSelection, SelectPreviousSelection, TogglePersistentSelection, TogglePresetOccurrence, TogglePresetSubwordOccurrence, Yank, YankLine, YankToLastCharacterOfLine, _, adjustIndentWithKeepingLayout, ensureEndsWithNewLineForBufferRow, getSubwordPatternAtBufferPosition, getWordPatternAtBufferPosition, insertTextAtBufferPosition, isEmptyRow, moveCursorToFirstCharacterAtRow, ref, setBufferRow,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  ref = require('./utils'), isEmptyRow = ref.isEmptyRow, getWordPatternAtBufferPosition = ref.getWordPatternAtBufferPosition, getSubwordPatternAtBufferPosition = ref.getSubwordPatternAtBufferPosition, insertTextAtBufferPosition = ref.insertTextAtBufferPosition, setBufferRow = ref.setBufferRow, moveCursorToFirstCharacterAtRow = ref.moveCursorToFirstCharacterAtRow, ensureEndsWithNewLineForBufferRow = ref.ensureEndsWithNewLineForBufferRow, adjustIndentWithKeepingLayout = ref.adjustIndentWithKeepingLayout;

  Base = require('./base');

  Operator = (function(superClass) {
    extend(Operator, superClass);

    Operator.extend(false);

    Operator.operationKind = 'operator';

    Operator.prototype.requireTarget = true;

    Operator.prototype.recordable = true;

    Operator.prototype.wise = null;

    Operator.prototype.occurrence = false;

    Operator.prototype.occurrenceType = 'base';

    Operator.prototype.flashTarget = true;

    Operator.prototype.flashCheckpoint = 'did-finish';

    Operator.prototype.flashType = 'operator';

    Operator.prototype.flashTypeForOccurrence = 'operator-occurrence';

    Operator.prototype.trackChange = false;

    Operator.prototype.patternForOccurrence = null;

    Operator.prototype.stayAtSamePosition = null;

    Operator.prototype.stayOptionName = null;

    Operator.prototype.stayByMarker = false;

    Operator.prototype.restorePositions = true;

    Operator.prototype.setToFirstCharacterOnLinewise = false;

    Operator.prototype.acceptPresetOccurrence = true;

    Operator.prototype.acceptPersistentSelection = true;

    Operator.prototype.bufferCheckpointByPurpose = null;

    Operator.prototype.mutateSelectionOrderd = false;

    Operator.prototype.supportEarlySelect = false;

    Operator.prototype.targetSelected = null;

    Operator.prototype.canEarlySelect = function() {
      return this.supportEarlySelect && !this.repeated;
    };

    Operator.prototype.resetState = function() {
      this.targetSelected = null;
      return this.occurrenceSelected = false;
    };

    Operator.prototype.createBufferCheckpoint = function(purpose) {
      if (this.bufferCheckpointByPurpose == null) {
        this.bufferCheckpointByPurpose = {};
      }
      return this.bufferCheckpointByPurpose[purpose] = this.editor.createCheckpoint();
    };

    Operator.prototype.getBufferCheckpoint = function(purpose) {
      var ref1;
      return (ref1 = this.bufferCheckpointByPurpose) != null ? ref1[purpose] : void 0;
    };

    Operator.prototype.deleteBufferCheckpoint = function(purpose) {
      if (this.bufferCheckpointByPurpose != null) {
        return delete this.bufferCheckpointByPurpose[purpose];
      }
    };

    Operator.prototype.groupChangesSinceBufferCheckpoint = function(purpose) {
      var checkpoint;
      if (checkpoint = this.getBufferCheckpoint(purpose)) {
        this.editor.groupChangesSinceCheckpoint(checkpoint);
        return this.deleteBufferCheckpoint(purpose);
      }
    };

    Operator.prototype.setMarkForChange = function(range) {
      this.vimState.mark.set('[', range.start);
      return this.vimState.mark.set(']', range.end);
    };

    Operator.prototype.needFlash = function() {
      var ref1;
      return this.flashTarget && this.getConfig('flashOnOperate') && (ref1 = this.name, indexOf.call(this.getConfig('flashOnOperateBlacklist'), ref1) < 0) && ((this.mode !== 'visual') || (this.submode !== this.target.wise));
    };

    Operator.prototype.flashIfNecessary = function(ranges) {
      if (this.needFlash()) {
        return this.vimState.flash(ranges, {
          type: this.getFlashType()
        });
      }
    };

    Operator.prototype.flashChangeIfNecessary = function() {
      if (this.needFlash()) {
        return this.onDidFinishOperation((function(_this) {
          return function() {
            var ranges;
            ranges = _this.mutationManager.getSelectedBufferRangesForCheckpoint(_this.flashCheckpoint);
            return _this.vimState.flash(ranges, {
              type: _this.getFlashType()
            });
          };
        })(this));
      }
    };

    Operator.prototype.getFlashType = function() {
      if (this.occurrenceSelected) {
        return this.flashTypeForOccurrence;
      } else {
        return this.flashType;
      }
    };

    Operator.prototype.trackChangeIfNecessary = function() {
      if (!this.trackChange) {
        return;
      }
      return this.onDidFinishOperation((function(_this) {
        return function() {
          var range;
          if (range = _this.mutationManager.getMutatedBufferRangeForSelection(_this.editor.getLastSelection())) {
            return _this.setMarkForChange(range);
          }
        };
      })(this));
    };

    function Operator() {
      var ref1, ref2;
      Operator.__super__.constructor.apply(this, arguments);
      ref1 = this.vimState, this.mutationManager = ref1.mutationManager, this.occurrenceManager = ref1.occurrenceManager, this.persistentSelection = ref1.persistentSelection;
      this.subscribeResetOccurrencePatternIfNeeded();
      this.initialize();
      this.onDidSetOperatorModifier(this.setModifier.bind(this));
      if (this.acceptPresetOccurrence && this.occurrenceManager.hasMarkers()) {
        this.occurrence = true;
      }
      if (this.occurrence && !this.occurrenceManager.hasMarkers()) {
        this.occurrenceManager.addPattern((ref2 = this.patternForOccurrence) != null ? ref2 : this.getPatternForOccurrenceType(this.occurrenceType));
      }
      if (this.selectPersistentSelectionIfNecessary()) {
        if (this.mode !== 'visual') {
          this.vimState.modeManager.activate('visual', this.swrap.detectWise(this.editor));
        }
      }
      if (this.mode === 'visual' && this.requireTarget) {
        this.target = 'CurrentSelection';
      }
      if (_.isString(this.target)) {
        this.setTarget(this["new"](this.target));
      }
    }

    Operator.prototype.subscribeResetOccurrencePatternIfNeeded = function() {
      if (this.occurrence && !this.occurrenceManager.hasMarkers()) {
        return this.onDidResetOperationStack((function(_this) {
          return function() {
            return _this.occurrenceManager.resetPatterns();
          };
        })(this));
      }
    };

    Operator.prototype.setModifier = function(options) {
      var pattern;
      if (options.wise != null) {
        this.wise = options.wise;
        return;
      }
      if (options.occurrence != null) {
        this.occurrence = options.occurrence;
        if (this.occurrence) {
          this.occurrenceType = options.occurrenceType;
          pattern = this.getPatternForOccurrenceType(this.occurrenceType);
          this.occurrenceManager.addPattern(pattern, {
            reset: true,
            occurrenceType: this.occurrenceType
          });
          return this.onDidResetOperationStack((function(_this) {
            return function() {
              return _this.occurrenceManager.resetPatterns();
            };
          })(this));
        }
      }
    };

    Operator.prototype.selectPersistentSelectionIfNecessary = function() {
      var $selection, i, len, ref1;
      if (this.acceptPersistentSelection && this.getConfig('autoSelectPersistentSelectionOnOperate') && !this.persistentSelection.isEmpty()) {
        this.persistentSelection.select();
        this.editor.mergeIntersectingSelections();
        ref1 = this.swrap.getSelections(this.editor);
        for (i = 0, len = ref1.length; i < len; i++) {
          $selection = ref1[i];
          if (!$selection.hasProperties()) {
            $selection.saveProperties();
          }
        }
        return true;
      } else {
        return false;
      }
    };

    Operator.prototype.getPatternForOccurrenceType = function(occurrenceType) {
      switch (occurrenceType) {
        case 'base':
          return getWordPatternAtBufferPosition(this.editor, this.getCursorBufferPosition());
        case 'subword':
          return getSubwordPatternAtBufferPosition(this.editor, this.getCursorBufferPosition());
      }
    };

    Operator.prototype.setTarget = function(target) {
      this.target = target;
      this.target.operator = this;
      this.emitDidSetTarget(this);
      if (this.canEarlySelect()) {
        this.normalizeSelectionsIfNecessary();
        this.createBufferCheckpoint('undo');
        this.selectTarget();
      }
      return this;
    };

    Operator.prototype.setTextToRegisterForSelection = function(selection) {
      return this.setTextToRegister(selection.getText(), selection);
    };

    Operator.prototype.setTextToRegister = function(text, selection) {
      if (this.target.isLinewise() && (!text.endsWith('\n'))) {
        text += "\n";
      }
      if (text) {
        return this.vimState.register.set(null, {
          text: text,
          selection: selection
        });
      }
    };

    Operator.prototype.normalizeSelectionsIfNecessary = function() {
      var ref1;
      if (((ref1 = this.target) != null ? ref1.isMotion() : void 0) && (this.mode === 'visual')) {
        return this.swrap.normalize(this.editor);
      }
    };

    Operator.prototype.startMutation = function(fn) {
      if (this.canEarlySelect()) {
        fn();
        this.emitWillFinishMutation();
        this.groupChangesSinceBufferCheckpoint('undo');
      } else {
        this.normalizeSelectionsIfNecessary();
        this.editor.transact((function(_this) {
          return function() {
            fn();
            return _this.emitWillFinishMutation();
          };
        })(this));
      }
      return this.emitDidFinishMutation();
    };

    Operator.prototype.execute = function() {
      this.startMutation((function(_this) {
        return function() {
          var i, len, selection, selections;
          if (_this.selectTarget()) {
            if (_this.mutateSelectionOrderd) {
              selections = _this.editor.getSelectionsOrderedByBufferPosition();
            } else {
              selections = _this.editor.getSelections();
            }
            for (i = 0, len = selections.length; i < len; i++) {
              selection = selections[i];
              _this.mutateSelection(selection);
            }
            _this.mutationManager.setCheckpoint('did-finish');
            return _this.restoreCursorPositionsIfNecessary();
          }
        };
      })(this));
      return this.activateMode('normal');
    };

    Operator.prototype.selectTarget = function() {
      if (this.targetSelected != null) {
        return this.targetSelected;
      }
      this.mutationManager.init({
        stayByMarker: this.stayByMarker
      });
      if (this.wise != null) {
        this.target.forceWise(this.wise);
      }
      this.emitWillSelectTarget();
      this.mutationManager.setCheckpoint('will-select');
      if (this.repeated && this.occurrence && !this.occurrenceManager.hasMarkers()) {
        this.occurrenceManager.addPattern(this.patternForOccurrence, {
          occurrenceType: this.occurrenceType
        });
      }
      this.target.execute();
      this.mutationManager.setCheckpoint('did-select');
      if (this.occurrence) {
        if (this.patternForOccurrence == null) {
          this.patternForOccurrence = this.occurrenceManager.buildPattern();
        }
        if (this.occurrenceManager.select()) {
          this.occurrenceSelected = true;
          this.mutationManager.setCheckpoint('did-select-occurrence');
        }
      }
      if (this.targetSelected = this.vimState.haveSomeNonEmptySelection() || this.target.name === "Empty") {
        this.emitDidSelectTarget();
        this.flashChangeIfNecessary();
        this.trackChangeIfNecessary();
      } else {
        this.emitDidFailSelectTarget();
      }
      return this.targetSelected;
    };

    Operator.prototype.restoreCursorPositionsIfNecessary = function() {
      var ref1, stay, wise;
      if (!this.restorePositions) {
        return;
      }
      stay = ((ref1 = this.stayAtSamePosition) != null ? ref1 : this.getConfig(this.stayOptionName)) || (this.occurrenceSelected && this.getConfig('stayOnOccurrence'));
      wise = this.occurrenceSelected ? 'characterwise' : this.target.wise;
      return this.mutationManager.restoreCursorPositions({
        stay: stay,
        wise: wise,
        setToFirstCharacterOnLinewise: this.setToFirstCharacterOnLinewise
      });
    };

    return Operator;

  })(Base);

  Select = (function(superClass) {
    extend(Select, superClass);

    function Select() {
      return Select.__super__.constructor.apply(this, arguments);
    }

    Select.extend(false);

    Select.prototype.flashTarget = false;

    Select.prototype.recordable = false;

    Select.prototype.acceptPresetOccurrence = false;

    Select.prototype.acceptPersistentSelection = false;

    Select.prototype.execute = function() {
      this.startMutation(this.selectTarget.bind(this));
      if (this.target.isTextObject() && this.target.selectSucceeded) {
        this.editor.scrollToCursorPosition();
        return this.activateModeIfNecessary('visual', this.target.wise);
      }
    };

    return Select;

  })(Operator);

  SelectLatestChange = (function(superClass) {
    extend(SelectLatestChange, superClass);

    function SelectLatestChange() {
      return SelectLatestChange.__super__.constructor.apply(this, arguments);
    }

    SelectLatestChange.extend();

    SelectLatestChange.description = "Select latest yanked or changed range";

    SelectLatestChange.prototype.target = 'ALatestChange';

    return SelectLatestChange;

  })(Select);

  SelectPreviousSelection = (function(superClass) {
    extend(SelectPreviousSelection, superClass);

    function SelectPreviousSelection() {
      return SelectPreviousSelection.__super__.constructor.apply(this, arguments);
    }

    SelectPreviousSelection.extend();

    SelectPreviousSelection.prototype.target = "PreviousSelection";

    return SelectPreviousSelection;

  })(Select);

  SelectPersistentSelection = (function(superClass) {
    extend(SelectPersistentSelection, superClass);

    function SelectPersistentSelection() {
      return SelectPersistentSelection.__super__.constructor.apply(this, arguments);
    }

    SelectPersistentSelection.extend();

    SelectPersistentSelection.description = "Select persistent-selection and clear all persistent-selection, it's like convert to real-selection";

    SelectPersistentSelection.prototype.target = "APersistentSelection";

    return SelectPersistentSelection;

  })(Select);

  SelectOccurrence = (function(superClass) {
    extend(SelectOccurrence, superClass);

    function SelectOccurrence() {
      return SelectOccurrence.__super__.constructor.apply(this, arguments);
    }

    SelectOccurrence.extend();

    SelectOccurrence.description = "Add selection onto each matching word within target range";

    SelectOccurrence.prototype.occurrence = true;

    SelectOccurrence.prototype.execute = function() {
      return this.startMutation((function(_this) {
        return function() {
          if (_this.selectTarget()) {
            return _this.activateModeIfNecessary('visual', 'characterwise');
          }
        };
      })(this));
    };

    return SelectOccurrence;

  })(Operator);

  CreatePersistentSelection = (function(superClass) {
    extend(CreatePersistentSelection, superClass);

    function CreatePersistentSelection() {
      return CreatePersistentSelection.__super__.constructor.apply(this, arguments);
    }

    CreatePersistentSelection.extend();

    CreatePersistentSelection.prototype.flashTarget = false;

    CreatePersistentSelection.prototype.stayAtSamePosition = true;

    CreatePersistentSelection.prototype.acceptPresetOccurrence = false;

    CreatePersistentSelection.prototype.acceptPersistentSelection = false;

    CreatePersistentSelection.prototype.mutateSelection = function(selection) {
      return this.persistentSelection.markBufferRange(selection.getBufferRange());
    };

    return CreatePersistentSelection;

  })(Operator);

  TogglePersistentSelection = (function(superClass) {
    extend(TogglePersistentSelection, superClass);

    function TogglePersistentSelection() {
      return TogglePersistentSelection.__super__.constructor.apply(this, arguments);
    }

    TogglePersistentSelection.extend();

    TogglePersistentSelection.prototype.isComplete = function() {
      var point;
      point = this.editor.getCursorBufferPosition();
      this.markerToRemove = this.persistentSelection.getMarkerAtPoint(point);
      if (this.markerToRemove) {
        return true;
      } else {
        return TogglePersistentSelection.__super__.isComplete.apply(this, arguments);
      }
    };

    TogglePersistentSelection.prototype.execute = function() {
      if (this.markerToRemove) {
        return this.markerToRemove.destroy();
      } else {
        return TogglePersistentSelection.__super__.execute.apply(this, arguments);
      }
    };

    return TogglePersistentSelection;

  })(CreatePersistentSelection);

  TogglePresetOccurrence = (function(superClass) {
    extend(TogglePresetOccurrence, superClass);

    function TogglePresetOccurrence() {
      return TogglePresetOccurrence.__super__.constructor.apply(this, arguments);
    }

    TogglePresetOccurrence.extend();

    TogglePresetOccurrence.prototype.target = "Empty";

    TogglePresetOccurrence.prototype.flashTarget = false;

    TogglePresetOccurrence.prototype.acceptPresetOccurrence = false;

    TogglePresetOccurrence.prototype.acceptPersistentSelection = false;

    TogglePresetOccurrence.prototype.occurrenceType = 'base';

    TogglePresetOccurrence.prototype.execute = function() {
      var isNarrowed, marker, pattern;
      if (marker = this.occurrenceManager.getMarkerAtPoint(this.editor.getCursorBufferPosition())) {
        return this.occurrenceManager.destroyMarkers([marker]);
      } else {
        pattern = null;
        isNarrowed = this.vimState.modeManager.isNarrowed();
        if (this.mode === 'visual' && !isNarrowed) {
          this.occurrenceType = 'base';
          pattern = new RegExp(_.escapeRegExp(this.editor.getSelectedText()), 'g');
        } else {
          pattern = this.getPatternForOccurrenceType(this.occurrenceType);
        }
        this.occurrenceManager.addPattern(pattern, {
          occurrenceType: this.occurrenceType
        });
        this.occurrenceManager.saveLastPattern(this.occurrenceType);
        if (!isNarrowed) {
          return this.activateMode('normal');
        }
      }
    };

    return TogglePresetOccurrence;

  })(Operator);

  TogglePresetSubwordOccurrence = (function(superClass) {
    extend(TogglePresetSubwordOccurrence, superClass);

    function TogglePresetSubwordOccurrence() {
      return TogglePresetSubwordOccurrence.__super__.constructor.apply(this, arguments);
    }

    TogglePresetSubwordOccurrence.extend();

    TogglePresetSubwordOccurrence.prototype.occurrenceType = 'subword';

    return TogglePresetSubwordOccurrence;

  })(TogglePresetOccurrence);

  AddPresetOccurrenceFromLastOccurrencePattern = (function(superClass) {
    extend(AddPresetOccurrenceFromLastOccurrencePattern, superClass);

    function AddPresetOccurrenceFromLastOccurrencePattern() {
      return AddPresetOccurrenceFromLastOccurrencePattern.__super__.constructor.apply(this, arguments);
    }

    AddPresetOccurrenceFromLastOccurrencePattern.extend();

    AddPresetOccurrenceFromLastOccurrencePattern.prototype.execute = function() {
      var occurrenceType, pattern;
      this.occurrenceManager.resetPatterns();
      if (pattern = this.vimState.globalState.get('lastOccurrencePattern')) {
        occurrenceType = this.vimState.globalState.get("lastOccurrenceType");
        this.occurrenceManager.addPattern(pattern, {
          occurrenceType: occurrenceType
        });
        return this.activateMode('normal');
      }
    };

    return AddPresetOccurrenceFromLastOccurrencePattern;

  })(TogglePresetOccurrence);

  Delete = (function(superClass) {
    extend(Delete, superClass);

    function Delete() {
      this.mutateSelection = bind(this.mutateSelection, this);
      return Delete.__super__.constructor.apply(this, arguments);
    }

    Delete.extend();

    Delete.prototype.trackChange = true;

    Delete.prototype.flashCheckpoint = 'did-select-occurrence';

    Delete.prototype.flashTypeForOccurrence = 'operator-remove-occurrence';

    Delete.prototype.stayOptionName = 'stayOnDelete';

    Delete.prototype.setToFirstCharacterOnLinewise = true;

    Delete.prototype.execute = function() {
      if (this.target.wise === 'blockwise') {
        this.restorePositions = false;
      }
      return Delete.__super__.execute.apply(this, arguments);
    };

    Delete.prototype.mutateSelection = function(selection) {
      this.setTextToRegisterForSelection(selection);
      return selection.deleteSelectedText();
    };

    return Delete;

  })(Operator);

  DeleteRight = (function(superClass) {
    extend(DeleteRight, superClass);

    function DeleteRight() {
      return DeleteRight.__super__.constructor.apply(this, arguments);
    }

    DeleteRight.extend();

    DeleteRight.prototype.target = 'MoveRight';

    return DeleteRight;

  })(Delete);

  DeleteLeft = (function(superClass) {
    extend(DeleteLeft, superClass);

    function DeleteLeft() {
      return DeleteLeft.__super__.constructor.apply(this, arguments);
    }

    DeleteLeft.extend();

    DeleteLeft.prototype.target = 'MoveLeft';

    return DeleteLeft;

  })(Delete);

  DeleteToLastCharacterOfLine = (function(superClass) {
    extend(DeleteToLastCharacterOfLine, superClass);

    function DeleteToLastCharacterOfLine() {
      return DeleteToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    DeleteToLastCharacterOfLine.extend();

    DeleteToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    DeleteToLastCharacterOfLine.prototype.execute = function() {
      if (this.target.wise === 'blockwise') {
        this.onDidSelectTarget((function(_this) {
          return function() {
            var blockwiseSelection, i, len, ref1, results;
            ref1 = _this.getBlockwiseSelections();
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              blockwiseSelection = ref1[i];
              results.push(blockwiseSelection.extendMemberSelectionsToEndOfLine());
            }
            return results;
          };
        })(this));
      }
      return DeleteToLastCharacterOfLine.__super__.execute.apply(this, arguments);
    };

    return DeleteToLastCharacterOfLine;

  })(Delete);

  DeleteLine = (function(superClass) {
    extend(DeleteLine, superClass);

    function DeleteLine() {
      return DeleteLine.__super__.constructor.apply(this, arguments);
    }

    DeleteLine.extend();

    DeleteLine.prototype.wise = 'linewise';

    DeleteLine.prototype.target = "MoveToRelativeLine";

    return DeleteLine;

  })(Delete);

  Yank = (function(superClass) {
    extend(Yank, superClass);

    function Yank() {
      return Yank.__super__.constructor.apply(this, arguments);
    }

    Yank.extend();

    Yank.prototype.trackChange = true;

    Yank.prototype.stayOptionName = 'stayOnYank';

    Yank.prototype.mutateSelection = function(selection) {
      return this.setTextToRegisterForSelection(selection);
    };

    return Yank;

  })(Operator);

  YankLine = (function(superClass) {
    extend(YankLine, superClass);

    function YankLine() {
      return YankLine.__super__.constructor.apply(this, arguments);
    }

    YankLine.extend();

    YankLine.prototype.wise = 'linewise';

    YankLine.prototype.target = "MoveToRelativeLine";

    return YankLine;

  })(Yank);

  YankToLastCharacterOfLine = (function(superClass) {
    extend(YankToLastCharacterOfLine, superClass);

    function YankToLastCharacterOfLine() {
      return YankToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    YankToLastCharacterOfLine.extend();

    YankToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    return YankToLastCharacterOfLine;

  })(Yank);

  Increase = (function(superClass) {
    extend(Increase, superClass);

    function Increase() {
      return Increase.__super__.constructor.apply(this, arguments);
    }

    Increase.extend();

    Increase.prototype.target = "Empty";

    Increase.prototype.flashTarget = false;

    Increase.prototype.restorePositions = false;

    Increase.prototype.step = 1;

    Increase.prototype.execute = function() {
      var ref1;
      this.newRanges = [];
      Increase.__super__.execute.apply(this, arguments);
      if (this.newRanges.length) {
        if (this.getConfig('flashOnOperate') && (ref1 = this.name, indexOf.call(this.getConfig('flashOnOperateBlacklist'), ref1) < 0)) {
          return this.vimState.flash(this.newRanges, {
            type: this.flashTypeForOccurrence
          });
        }
      }
    };

    Increase.prototype.replaceNumberInBufferRange = function(scanRange, fn) {
      var newRanges;
      if (fn == null) {
        fn = null;
      }
      newRanges = [];
      if (this.pattern == null) {
        this.pattern = RegExp("" + (this.getConfig('numberRegex')), "g");
      }
      this.scanForward(this.pattern, {
        scanRange: scanRange
      }, (function(_this) {
        return function(event) {
          var matchText, nextNumber, replace;
          if ((fn != null) && !fn(event)) {
            return;
          }
          matchText = event.matchText, replace = event.replace;
          nextNumber = _this.getNextNumber(matchText);
          return newRanges.push(replace(String(nextNumber)));
        };
      })(this));
      return newRanges;
    };

    Increase.prototype.mutateSelection = function(selection) {
      var cursor, cursorPosition, newRanges, point, ref1, ref2, ref3, scanRange;
      cursor = selection.cursor;
      if (this.target.is('Empty')) {
        cursorPosition = cursor.getBufferPosition();
        scanRange = this.editor.bufferRangeForBufferRow(cursorPosition.row);
        newRanges = this.replaceNumberInBufferRange(scanRange, function(arg) {
          var range, stop;
          range = arg.range, stop = arg.stop;
          if (range.end.isGreaterThan(cursorPosition)) {
            stop();
            return true;
          } else {
            return false;
          }
        });
        point = (ref1 = (ref2 = newRanges[0]) != null ? ref2.end.translate([0, -1]) : void 0) != null ? ref1 : cursorPosition;
        return cursor.setBufferPosition(point);
      } else {
        scanRange = selection.getBufferRange();
        (ref3 = this.newRanges).push.apply(ref3, this.replaceNumberInBufferRange(scanRange));
        return cursor.setBufferPosition(scanRange.start);
      }
    };

    Increase.prototype.getNextNumber = function(numberString) {
      return Number.parseInt(numberString, 10) + this.step * this.getCount();
    };

    return Increase;

  })(Operator);

  Decrease = (function(superClass) {
    extend(Decrease, superClass);

    function Decrease() {
      return Decrease.__super__.constructor.apply(this, arguments);
    }

    Decrease.extend();

    Decrease.prototype.step = -1;

    return Decrease;

  })(Increase);

  IncrementNumber = (function(superClass) {
    extend(IncrementNumber, superClass);

    function IncrementNumber() {
      return IncrementNumber.__super__.constructor.apply(this, arguments);
    }

    IncrementNumber.extend();

    IncrementNumber.prototype.baseNumber = null;

    IncrementNumber.prototype.target = null;

    IncrementNumber.prototype.mutateSelectionOrderd = true;

    IncrementNumber.prototype.getNextNumber = function(numberString) {
      if (this.baseNumber != null) {
        this.baseNumber += this.step * this.getCount();
      } else {
        this.baseNumber = Number.parseInt(numberString, 10);
      }
      return this.baseNumber;
    };

    return IncrementNumber;

  })(Increase);

  DecrementNumber = (function(superClass) {
    extend(DecrementNumber, superClass);

    function DecrementNumber() {
      return DecrementNumber.__super__.constructor.apply(this, arguments);
    }

    DecrementNumber.extend();

    DecrementNumber.prototype.step = -1;

    return DecrementNumber;

  })(IncrementNumber);

  PutBefore = (function(superClass) {
    extend(PutBefore, superClass);

    function PutBefore() {
      return PutBefore.__super__.constructor.apply(this, arguments);
    }

    PutBefore.extend();

    PutBefore.prototype.location = 'before';

    PutBefore.prototype.target = 'Empty';

    PutBefore.prototype.flashType = 'operator-long';

    PutBefore.prototype.restorePositions = false;

    PutBefore.prototype.flashTarget = true;

    PutBefore.prototype.trackChange = false;

    PutBefore.prototype.execute = function() {
      var ref1, text, type;
      this.mutationsBySelection = new Map();
      ref1 = this.vimState.register.get(null, this.editor.getLastSelection()), text = ref1.text, type = ref1.type;
      if (!text) {
        return;
      }
      this.onDidFinishMutation(this.adjustCursorPosition.bind(this));
      this.onDidFinishOperation((function(_this) {
        return function() {
          var newRange, ref2, toRange;
          if (newRange = _this.mutationsBySelection.get(_this.editor.getLastSelection())) {
            _this.setMarkForChange(newRange);
          }
          if (_this.getConfig('flashOnOperate') && (ref2 = _this.name, indexOf.call(_this.getConfig('flashOnOperateBlacklist'), ref2) < 0)) {
            toRange = function(selection) {
              return _this.mutationsBySelection.get(selection);
            };
            return _this.vimState.flash(_this.editor.getSelections().map(toRange), {
              type: _this.getFlashType()
            });
          }
        };
      })(this));
      return PutBefore.__super__.execute.apply(this, arguments);
    };

    PutBefore.prototype.adjustCursorPosition = function() {
      var cursor, end, i, len, newRange, ref1, ref2, results, selection, start;
      ref1 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        if (!(this.mutationsBySelection.has(selection))) {
          continue;
        }
        cursor = selection.cursor;
        ref2 = newRange = this.mutationsBySelection.get(selection), start = ref2.start, end = ref2.end;
        if (this.linewisePaste) {
          results.push(moveCursorToFirstCharacterAtRow(cursor, start.row));
        } else {
          if (newRange.isSingleLine()) {
            results.push(cursor.setBufferPosition(end.translate([0, -1])));
          } else {
            results.push(cursor.setBufferPosition(start));
          }
        }
      }
      return results;
    };

    PutBefore.prototype.mutateSelection = function(selection) {
      var newRange, ref1, text, type;
      ref1 = this.vimState.register.get(null, selection), text = ref1.text, type = ref1.type;
      text = _.multiplyString(text, this.getCount());
      this.linewisePaste = type === 'linewise' || this.isMode('visual', 'linewise');
      newRange = this.paste(selection, text, {
        linewisePaste: this.linewisePaste
      });
      return this.mutationsBySelection.set(selection, newRange);
    };

    PutBefore.prototype.paste = function(selection, text, arg) {
      var linewisePaste;
      linewisePaste = arg.linewisePaste;
      if (linewisePaste) {
        return this.pasteLinewise(selection, text);
      } else {
        return this.pasteCharacterwise(selection, text);
      }
    };

    PutBefore.prototype.pasteCharacterwise = function(selection, text) {
      var cursor;
      cursor = selection.cursor;
      if (selection.isEmpty() && this.location === 'after' && !isEmptyRow(this.editor, cursor.getBufferRow())) {
        cursor.moveRight();
      }
      return selection.insertText(text);
    };

    PutBefore.prototype.pasteLinewise = function(selection, text) {
      var cursor, cursorRow, newRange, targetRow;
      cursor = selection.cursor;
      cursorRow = cursor.getBufferRow();
      if (!text.endsWith("\n")) {
        text += "\n";
      }
      newRange = null;
      if (selection.isEmpty()) {
        if (this.location === 'before') {
          newRange = insertTextAtBufferPosition(this.editor, [cursorRow, 0], text);
          setBufferRow(cursor, newRange.start.row);
        } else if (this.location === 'after') {
          targetRow = this.getFoldEndRowForRow(cursorRow);
          ensureEndsWithNewLineForBufferRow(this.editor, targetRow);
          newRange = insertTextAtBufferPosition(this.editor, [targetRow + 1, 0], text);
        }
      } else {
        if (!this.isMode('visual', 'linewise')) {
          selection.insertText("\n");
        }
        newRange = selection.insertText(text);
      }
      return newRange;
    };

    return PutBefore;

  })(Operator);

  PutAfter = (function(superClass) {
    extend(PutAfter, superClass);

    function PutAfter() {
      return PutAfter.__super__.constructor.apply(this, arguments);
    }

    PutAfter.extend();

    PutAfter.prototype.location = 'after';

    return PutAfter;

  })(PutBefore);

  PutBeforeWithAutoIndent = (function(superClass) {
    extend(PutBeforeWithAutoIndent, superClass);

    function PutBeforeWithAutoIndent() {
      return PutBeforeWithAutoIndent.__super__.constructor.apply(this, arguments);
    }

    PutBeforeWithAutoIndent.extend();

    PutBeforeWithAutoIndent.prototype.pasteLinewise = function(selection, text) {
      var newRange;
      newRange = PutBeforeWithAutoIndent.__super__.pasteLinewise.apply(this, arguments);
      adjustIndentWithKeepingLayout(this.editor, newRange);
      return newRange;
    };

    return PutBeforeWithAutoIndent;

  })(PutBefore);

  PutAfterWithAutoIndent = (function(superClass) {
    extend(PutAfterWithAutoIndent, superClass);

    function PutAfterWithAutoIndent() {
      return PutAfterWithAutoIndent.__super__.constructor.apply(this, arguments);
    }

    PutAfterWithAutoIndent.extend();

    PutAfterWithAutoIndent.prototype.location = 'after';

    return PutAfterWithAutoIndent;

  })(PutBeforeWithAutoIndent);

  AddBlankLineBelow = (function(superClass) {
    extend(AddBlankLineBelow, superClass);

    function AddBlankLineBelow() {
      return AddBlankLineBelow.__super__.constructor.apply(this, arguments);
    }

    AddBlankLineBelow.extend();

    AddBlankLineBelow.prototype.flashTarget = false;

    AddBlankLineBelow.prototype.target = "Empty";

    AddBlankLineBelow.prototype.stayAtSamePosition = true;

    AddBlankLineBelow.prototype.stayByMarker = true;

    AddBlankLineBelow.prototype.where = 'below';

    AddBlankLineBelow.prototype.mutateSelection = function(selection) {
      var point, row;
      row = selection.getHeadBufferPosition().row;
      if (this.where === 'below') {
        row += 1;
      }
      point = [row, 0];
      return this.editor.setTextInBufferRange([point, point], "\n".repeat(this.getCount()));
    };

    return AddBlankLineBelow;

  })(Operator);

  AddBlankLineAbove = (function(superClass) {
    extend(AddBlankLineAbove, superClass);

    function AddBlankLineAbove() {
      return AddBlankLineAbove.__super__.constructor.apply(this, arguments);
    }

    AddBlankLineAbove.extend();

    AddBlankLineAbove.prototype.where = 'above';

    return AddBlankLineAbove;

  })(AddBlankLineBelow);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsc3dCQUFBO0lBQUE7Ozs7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQVNJLE9BQUEsQ0FBUSxTQUFSLENBVEosRUFDRSwyQkFERixFQUVFLG1FQUZGLEVBR0UseUVBSEYsRUFJRSwyREFKRixFQUtFLCtCQUxGLEVBTUUscUVBTkYsRUFPRSx5RUFQRixFQVFFOztFQUVGLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFFRDs7O0lBQ0osUUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOztJQUNBLFFBQUMsQ0FBQSxhQUFELEdBQWdCOzt1QkFDaEIsYUFBQSxHQUFlOzt1QkFDZixVQUFBLEdBQVk7O3VCQUVaLElBQUEsR0FBTTs7dUJBQ04sVUFBQSxHQUFZOzt1QkFDWixjQUFBLEdBQWdCOzt1QkFFaEIsV0FBQSxHQUFhOzt1QkFDYixlQUFBLEdBQWlCOzt1QkFDakIsU0FBQSxHQUFXOzt1QkFDWCxzQkFBQSxHQUF3Qjs7dUJBQ3hCLFdBQUEsR0FBYTs7dUJBRWIsb0JBQUEsR0FBc0I7O3VCQUN0QixrQkFBQSxHQUFvQjs7dUJBQ3BCLGNBQUEsR0FBZ0I7O3VCQUNoQixZQUFBLEdBQWM7O3VCQUNkLGdCQUFBLEdBQWtCOzt1QkFDbEIsNkJBQUEsR0FBK0I7O3VCQUUvQixzQkFBQSxHQUF3Qjs7dUJBQ3hCLHlCQUFBLEdBQTJCOzt1QkFFM0IseUJBQUEsR0FBMkI7O3VCQUMzQixxQkFBQSxHQUF1Qjs7dUJBSXZCLGtCQUFBLEdBQW9COzt1QkFDcEIsY0FBQSxHQUFnQjs7dUJBQ2hCLGNBQUEsR0FBZ0IsU0FBQTthQUNkLElBQUMsQ0FBQSxrQkFBRCxJQUF3QixDQUFJLElBQUMsQ0FBQTtJQURmOzt1QkFNaEIs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LE1BQUQsQ0FBQTs7Z0NBQ0EsV0FBQSxHQUFhOztnQ0FDYixNQUFBLEdBQVE7O2dDQUNSLGtCQUFBLEdBQW9COztnQ0FDcEIsWUFBQSxHQUFjOztnQ0FDZCxLQUFBLEdBQU87O2dDQUVQLGVBQUEsR0FBaUIsU0FBQyxTQUFEO0FBQ2YsVUFBQTtNQUFBLEdBQUEsR0FBTSxTQUFTLENBQUMscUJBQVYsQ0FBQSxDQUFpQyxDQUFDO01BQ3hDLElBQVksSUFBQyxDQUFBLEtBQUQsS0FBVSxPQUF0QjtRQUFBLEdBQUEsSUFBTyxFQUFQOztNQUNBLEtBQUEsR0FBUSxDQUFDLEdBQUQsRUFBTSxDQUFOO2FBQ1IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBUixDQUE2QixDQUFDLEtBQUQsRUFBUSxLQUFSLENBQTdCLEVBQTZDLElBQUksQ0FBQyxNQUFMLENBQVksSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFaLENBQTdDO0lBSmU7Ozs7S0FSYTs7RUFjMUI7Ozs7Ozs7SUFDSixpQkFBQyxDQUFBLE1BQUQsQ0FBQTs7Z0NBQ0EsS0FBQSxHQUFPOzs7O0tBRnVCO0FBdm9CaEMiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue1xuICBpc0VtcHR5Um93XG4gIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvblxuICBnZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb25cbiAgaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb25cbiAgc2V0QnVmZmVyUm93XG4gIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3dcbiAgZW5zdXJlRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93XG4gIGFkanVzdEluZGVudFdpdGhLZWVwaW5nTGF5b3V0XG59ID0gcmVxdWlyZSAnLi91dGlscydcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5cbmNsYXNzIE9wZXJhdG9yIGV4dGVuZHMgQmFzZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBAb3BlcmF0aW9uS2luZDogJ29wZXJhdG9yJ1xuICByZXF1aXJlVGFyZ2V0OiB0cnVlXG4gIHJlY29yZGFibGU6IHRydWVcblxuICB3aXNlOiBudWxsXG4gIG9jY3VycmVuY2U6IGZhbHNlXG4gIG9jY3VycmVuY2VUeXBlOiAnYmFzZSdcblxuICBmbGFzaFRhcmdldDogdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQ6ICdkaWQtZmluaXNoJ1xuICBmbGFzaFR5cGU6ICdvcGVyYXRvcidcbiAgZmxhc2hUeXBlRm9yT2NjdXJyZW5jZTogJ29wZXJhdG9yLW9jY3VycmVuY2UnXG4gIHRyYWNrQ2hhbmdlOiBmYWxzZVxuXG4gIHBhdHRlcm5Gb3JPY2N1cnJlbmNlOiBudWxsXG4gIHN0YXlBdFNhbWVQb3NpdGlvbjogbnVsbFxuICBzdGF5T3B0aW9uTmFtZTogbnVsbFxuICBzdGF5QnlNYXJrZXI6IGZhbHNlXG4gIHJlc3RvcmVQb3NpdGlvbnM6IHRydWVcbiAgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2U6IGZhbHNlXG5cbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZTogdHJ1ZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uOiB0cnVlXG5cbiAgYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZTogbnVsbFxuICBtdXRhdGVTZWxlY3Rpb25PcmRlcmQ6IGZhbHNlXG5cbiAgIyBFeHBlcmltZW50YWx5IGFsbG93IHNlbGVjdFRhcmdldCBiZWZvcmUgaW5wdXQgQ29tcGxldGVcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHN1cHBvcnRFYXJseVNlbGVjdDogZmFsc2VcbiAgdGFyZ2V0U2VsZWN0ZWQ6IG51bGxcbiAgY2FuRWFybHlTZWxlY3Q6IC0+XG4gICAgQHN1cHBvcnRFYXJseVNlbGVjdCBhbmQgbm90IEByZXBlYXRlZFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAjIENhbGxlZCB3aGVuIG9wZXJhdGlvbiBmaW5pc2hlZFxuICAjIFRoaXMgaXMgZXNzZW50aWFsbHkgdG8gcmVzZXQgc3RhdGUgZm9yIGAuYCByZXBlYXQuXG4gIHJlc2V0U3RhdGU6IC0+XG4gICAgQHRhcmdldFNlbGVjdGVkID0gbnVsbFxuICAgIEBvY2N1cnJlbmNlU2VsZWN0ZWQgPSBmYWxzZVxuXG4gICMgVHdvIGNoZWNrcG9pbnQgZm9yIGRpZmZlcmVudCBwdXJwb3NlXG4gICMgLSBvbmUgZm9yIHVuZG8oaGFuZGxlZCBieSBtb2RlTWFuYWdlcilcbiAgIyAtIG9uZSBmb3IgcHJlc2VydmUgbGFzdCBpbnNlcnRlZCB0ZXh0XG4gIGNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlID89IHt9XG4gICAgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV0gPSBAZWRpdG9yLmNyZWF0ZUNoZWNrcG9pbnQoKVxuXG4gIGdldEJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlP1twdXJwb3NlXVxuXG4gIGRlbGV0ZUJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIGlmIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlP1xuICAgICAgZGVsZXRlIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdXG5cbiAgZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50OiAocHVycG9zZSkgLT5cbiAgICBpZiBjaGVja3BvaW50ID0gQGdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICAgIEBlZGl0b3IuZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KGNoZWNrcG9pbnQpXG4gICAgICBAZGVsZXRlQnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuXG4gIHNldE1hcmtGb3JDaGFuZ2U6IChyYW5nZSkgLT5cbiAgICBAdmltU3RhdGUubWFyay5zZXQoJ1snLCByYW5nZS5zdGFydClcbiAgICBAdmltU3RhdGUubWFyay5zZXQoJ10nLCByYW5nZS5lbmQpXG5cbiAgbmVlZEZsYXNoOiAtPlxuICAgIEBmbGFzaFRhcmdldCBhbmQgQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGUnKSBhbmRcbiAgICAgIChAbmFtZSBub3QgaW4gQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGVCbGFja2xpc3QnKSkgYW5kXG4gICAgICAoKEBtb2RlIGlzbnQgJ3Zpc3VhbCcpIG9yIChAc3VibW9kZSBpc250IEB0YXJnZXQud2lzZSkpICMgZS5nLiBZIGluIHZDXG5cbiAgZmxhc2hJZk5lY2Vzc2FyeTogKHJhbmdlcykgLT5cbiAgICBpZiBAbmVlZEZsYXNoKClcbiAgICAgIEB2aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHR5cGU6IEBnZXRGbGFzaFR5cGUoKSlcblxuICBmbGFzaENoYW5nZUlmTmVjZXNzYXJ5OiAtPlxuICAgIGlmIEBuZWVkRmxhc2goKVxuICAgICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICAgIHJhbmdlcyA9IEBtdXRhdGlvbk1hbmFnZXIuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXNGb3JDaGVja3BvaW50KEBmbGFzaENoZWNrcG9pbnQpXG4gICAgICAgIEB2aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHR5cGU6IEBnZXRGbGFzaFR5cGUoKSlcblxuICBnZXRGbGFzaFR5cGU6IC0+XG4gICAgaWYgQG9jY3VycmVuY2VTZWxlY3RlZFxuICAgICAgQGZsYXNoVHlwZUZvck9jY3VycmVuY2VcbiAgICBlbHNlXG4gICAgICBAZmxhc2hUeXBlXG5cbiAgdHJhY2tDaGFuZ2VJZk5lY2Vzc2FyeTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEB0cmFja0NoYW5nZVxuXG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICBpZiByYW5nZSA9IEBtdXRhdGlvbk1hbmFnZXIuZ2V0TXV0YXRlZEJ1ZmZlclJhbmdlRm9yU2VsZWN0aW9uKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgICAgICBAc2V0TWFya0ZvckNoYW5nZShyYW5nZSlcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIHtAbXV0YXRpb25NYW5hZ2VyLCBAb2NjdXJyZW5jZU1hbmFnZXIsIEBwZXJzaXN0ZW50U2VsZWN0aW9ufSA9IEB2aW1TdGF0ZVxuICAgIEBzdWJzY3JpYmVSZXNldE9jY3VycmVuY2VQYXR0ZXJuSWZOZWVkZWQoKVxuICAgIEBpbml0aWFsaXplKClcbiAgICBAb25EaWRTZXRPcGVyYXRvck1vZGlmaWVyKEBzZXRNb2RpZmllci5iaW5kKHRoaXMpKVxuXG4gICAgIyBXaGVuIHByZXNldC1vY2N1cnJlbmNlIHdhcyBleGlzdHMsIG9wZXJhdGUgb24gb2NjdXJyZW5jZS13aXNlXG4gICAgaWYgQGFjY2VwdFByZXNldE9jY3VycmVuY2UgYW5kIEBvY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKClcbiAgICAgIEBvY2N1cnJlbmNlID0gdHJ1ZVxuXG4gICAgIyBbRklYTUVdIE9SREVSLU1BVFRFUlxuICAgICMgVG8gcGljayBjdXJzb3Itd29yZCB0byBmaW5kIG9jY3VycmVuY2UgYmFzZSBwYXR0ZXJuLlxuICAgICMgVGhpcyBoYXMgdG8gYmUgZG9uZSBCRUZPUkUgY29udmVydGluZyBwZXJzaXN0ZW50LXNlbGVjdGlvbiBpbnRvIHJlYWwtc2VsZWN0aW9uLlxuICAgICMgU2luY2Ugd2hlbiBwZXJzaXN0ZW50LXNlbGVjdGlvbiBpcyBhY3R1YWxsIHNlbGVjdGVkLCBpdCBjaGFuZ2UgY3Vyc29yIHBvc2l0aW9uLlxuICAgIGlmIEBvY2N1cnJlbmNlIGFuZCBub3QgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4oQHBhdHRlcm5Gb3JPY2N1cnJlbmNlID8gQGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShAb2NjdXJyZW5jZVR5cGUpKVxuXG5cbiAgICAjIFRoaXMgY2hhbmdlIGN1cnNvciBwb3NpdGlvbi5cbiAgICBpZiBAc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5KClcbiAgICAgICMgW0ZJWE1FXSBzZWxlY3Rpb24td2lzZSBpcyBub3Qgc3luY2hlZCBpZiBpdCBhbHJlYWR5IHZpc3VhbC1tb2RlXG4gICAgICB1bmxlc3MgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgICAgQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmFjdGl2YXRlKCd2aXN1YWwnLCBAc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKSlcblxuICAgIEB0YXJnZXQgPSAnQ3VycmVudFNlbGVjdGlvbicgaWYgQG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIEByZXF1aXJlVGFyZ2V0XG4gICAgQHNldFRhcmdldChAbmV3KEB0YXJnZXQpKSBpZiBfLmlzU3RyaW5nKEB0YXJnZXQpXG5cbiAgc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkOiAtPlxuICAgICMgW0NBVVRJT05dXG4gICAgIyBUaGlzIG1ldGhvZCBoYXMgdG8gYmUgY2FsbGVkIGluIFBST1BFUiB0aW1pbmcuXG4gICAgIyBJZiBvY2N1cnJlbmNlIGlzIHRydWUgYnV0IG5vIHByZXNldC1vY2N1cnJlbmNlXG4gICAgIyBUcmVhdCB0aGF0IGBvY2N1cnJlbmNlYCBpcyBCT1VOREVEIHRvIG9wZXJhdG9yIGl0c2VsZiwgc28gY2xlYW5wIGF0IGZpbmlzaGVkLlxuICAgIGlmIEBvY2N1cnJlbmNlIGFuZCBub3QgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayg9PiBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuXG4gIHNldE1vZGlmaWVyOiAob3B0aW9ucykgLT5cbiAgICBpZiBvcHRpb25zLndpc2U/XG4gICAgICBAd2lzZSA9IG9wdGlvbnMud2lzZVxuICAgICAgcmV0dXJuXG5cbiAgICBpZiBvcHRpb25zLm9jY3VycmVuY2U/XG4gICAgICBAb2NjdXJyZW5jZSA9IG9wdGlvbnMub2NjdXJyZW5jZVxuICAgICAgaWYgQG9jY3VycmVuY2VcbiAgICAgICAgQG9jY3VycmVuY2VUeXBlID0gb3B0aW9ucy5vY2N1cnJlbmNlVHlwZVxuICAgICAgICAjIFRoaXMgaXMgbyBtb2RpZmllciBjYXNlKGUuZy4gYGMgbyBwYCwgYGQgTyBmYClcbiAgICAgICAgIyBXZSBSRVNFVCBleGlzdGluZyBvY2N1cmVuY2UtbWFya2VyIHdoZW4gYG9gIG9yIGBPYCBtb2RpZmllciBpcyB0eXBlZCBieSB1c2VyLlxuICAgICAgICBwYXR0ZXJuID0gQGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShAb2NjdXJyZW5jZVR5cGUpXG4gICAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHBhdHRlcm4sIHtyZXNldDogdHJ1ZSwgQG9jY3VycmVuY2VUeXBlfSlcbiAgICAgICAgQG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayg9PiBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuXG4gICMgcmV0dXJuIHRydWUvZmFsc2UgdG8gaW5kaWNhdGUgc3VjY2Vzc1xuICBzZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uSWZOZWNlc3Nhcnk6IC0+XG4gICAgaWYgQGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gYW5kXG4gICAgICAgIEBnZXRDb25maWcoJ2F1dG9TZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uT25PcGVyYXRlJykgYW5kXG4gICAgICAgIG5vdCBAcGVyc2lzdGVudFNlbGVjdGlvbi5pc0VtcHR5KClcblxuICAgICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24uc2VsZWN0KClcbiAgICAgIEBlZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAgIGZvciAkc2VsZWN0aW9uIGluIEBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpIHdoZW4gbm90ICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG4gICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlOiAob2NjdXJyZW5jZVR5cGUpIC0+XG4gICAgc3dpdGNoIG9jY3VycmVuY2VUeXBlXG4gICAgICB3aGVuICdiYXNlJ1xuICAgICAgICBnZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgQGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICB3aGVuICdzdWJ3b3JkJ1xuICAgICAgICBnZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgQGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgIyB0YXJnZXQgaXMgVGV4dE9iamVjdCBvciBNb3Rpb24gdG8gb3BlcmF0ZSBvbi5cbiAgc2V0VGFyZ2V0OiAoQHRhcmdldCkgLT5cbiAgICBAdGFyZ2V0Lm9wZXJhdG9yID0gdGhpc1xuICAgIEBlbWl0RGlkU2V0VGFyZ2V0KHRoaXMpXG5cbiAgICBpZiBAY2FuRWFybHlTZWxlY3QoKVxuICAgICAgQG5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICBAY3JlYXRlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG4gICAgICBAc2VsZWN0VGFyZ2V0KClcbiAgICB0aGlzXG5cbiAgc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQHNldFRleHRUb1JlZ2lzdGVyKHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcblxuICBzZXRUZXh0VG9SZWdpc3RlcjogKHRleHQsIHNlbGVjdGlvbikgLT5cbiAgICB0ZXh0ICs9IFwiXFxuXCIgaWYgKEB0YXJnZXQuaXNMaW5ld2lzZSgpIGFuZCAobm90IHRleHQuZW5kc1dpdGgoJ1xcbicpKSlcbiAgICBAdmltU3RhdGUucmVnaXN0ZXIuc2V0KG51bGwsIHt0ZXh0LCBzZWxlY3Rpb259KSBpZiB0ZXh0XG5cbiAgbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5OiAtPlxuICAgIGlmIEB0YXJnZXQ/LmlzTW90aW9uKCkgYW5kIChAbW9kZSBpcyAndmlzdWFsJylcbiAgICAgIEBzd3JhcC5ub3JtYWxpemUoQGVkaXRvcilcblxuICBzdGFydE11dGF0aW9uOiAoZm4pIC0+XG4gICAgaWYgQGNhbkVhcmx5U2VsZWN0KClcbiAgICAgICMgLSBTa2lwIHNlbGVjdGlvbiBub3JtYWxpemF0aW9uOiBhbHJlYWR5IG5vcm1hbGl6ZWQgYmVmb3JlIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgIyAtIE1hbnVhbCBjaGVja3BvaW50IGdyb3VwaW5nOiB0byBjcmVhdGUgY2hlY2twb2ludCBiZWZvcmUgQHNlbGVjdFRhcmdldCgpXG4gICAgICBmbigpXG4gICAgICBAZW1pdFdpbGxGaW5pc2hNdXRhdGlvbigpXG4gICAgICBAZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcblxuICAgIGVsc2VcbiAgICAgIEBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKVxuICAgICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgICBmbigpXG4gICAgICAgIEBlbWl0V2lsbEZpbmlzaE11dGF0aW9uKClcblxuICAgIEBlbWl0RGlkRmluaXNoTXV0YXRpb24oKVxuXG4gICMgTWFpblxuICBleGVjdXRlOiAtPlxuICAgIEBzdGFydE11dGF0aW9uID0+XG4gICAgICBpZiBAc2VsZWN0VGFyZ2V0KClcbiAgICAgICAgaWYgQG11dGF0ZVNlbGVjdGlvbk9yZGVyZFxuICAgICAgICAgIHNlbGVjdGlvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBzZWxlY3Rpb25zXG4gICAgICAgICAgQG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLWZpbmlzaCcpXG4gICAgICAgIEByZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKVxuXG4gICAgIyBFdmVuIHRob3VnaCB3ZSBmYWlsIHRvIHNlbGVjdCB0YXJnZXQgYW5kIGZhaWwgdG8gbXV0YXRlLFxuICAgICMgd2UgaGF2ZSB0byByZXR1cm4gdG8gbm9ybWFsLW1vZGUgZnJvbSBvcGVyYXRvci1wZW5kaW5nIG9yIHZpc3VhbFxuICAgIEBhY3RpdmF0ZU1vZGUoJ25vcm1hbCcpXG5cbiAgIyBSZXR1cm4gdHJ1ZSB1bmxlc3MgYWxsIHNlbGVjdGlvbiBpcyBlbXB0eS5cbiAgc2VsZWN0VGFyZ2V0OiAtPlxuICAgIHJldHVybiBAdGFyZ2V0U2VsZWN0ZWQgaWYgQHRhcmdldFNlbGVjdGVkP1xuICAgIEBtdXRhdGlvbk1hbmFnZXIuaW5pdCh7QHN0YXlCeU1hcmtlcn0pXG5cbiAgICBAdGFyZ2V0LmZvcmNlV2lzZShAd2lzZSkgaWYgQHdpc2U/XG4gICAgQGVtaXRXaWxsU2VsZWN0VGFyZ2V0KClcblxuICAgICMgQWxsb3cgY3Vyc29yIHBvc2l0aW9uIGFkanVzdG1lbnQgJ29uLXdpbGwtc2VsZWN0LXRhcmdldCcgaG9vay5cbiAgICAjIHNvIGNoZWNrcG9pbnQgY29tZXMgQUZURVIgQGVtaXRXaWxsU2VsZWN0VGFyZ2V0KClcbiAgICBAbXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ3dpbGwtc2VsZWN0JylcblxuICAgICMgTk9URVxuICAgICMgU2luY2UgTW92ZVRvTmV4dE9jY3VycmVuY2UsIE1vdmVUb1ByZXZpb3VzT2NjdXJyZW5jZSBtb3Rpb24gbW92ZSBieVxuICAgICMgIG9jY3VycmVuY2UtbWFya2VyLCBvY2N1cnJlbmNlLW1hcmtlciBoYXMgdG8gYmUgY3JlYXRlZCBCRUZPUkUgYEB0YXJnZXQuZXhlY3V0ZSgpYFxuICAgICMgQW5kIHdoZW4gcmVwZWF0ZWQsIG9jY3VycmVuY2UgcGF0dGVybiBpcyBhbHJlYWR5IGNhY2hlZCBhdCBAcGF0dGVybkZvck9jY3VycmVuY2VcbiAgICBpZiBAcmVwZWF0ZWQgYW5kIEBvY2N1cnJlbmNlIGFuZCBub3QgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4oQHBhdHRlcm5Gb3JPY2N1cnJlbmNlLCB7QG9jY3VycmVuY2VUeXBlfSlcblxuICAgIEB0YXJnZXQuZXhlY3V0ZSgpXG5cbiAgICBAbXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1zZWxlY3QnKVxuICAgIGlmIEBvY2N1cnJlbmNlXG4gICAgICAjIFRvIHJlcG9lYXQoYC5gKSBvcGVyYXRpb24gd2hlcmUgbXVsdGlwbGUgb2NjdXJyZW5jZSBwYXR0ZXJucyB3YXMgc2V0LlxuICAgICAgIyBIZXJlIHdlIHNhdmUgcGF0dGVybnMgd2hpY2ggcmVwcmVzZW50IHVuaW9uZWQgcmVnZXggd2hpY2ggQG9jY3VycmVuY2VNYW5hZ2VyIGtub3dzLlxuICAgICAgQHBhdHRlcm5Gb3JPY2N1cnJlbmNlID89IEBvY2N1cnJlbmNlTWFuYWdlci5idWlsZFBhdHRlcm4oKVxuXG4gICAgICBpZiBAb2NjdXJyZW5jZU1hbmFnZXIuc2VsZWN0KClcbiAgICAgICAgQG9jY3VycmVuY2VTZWxlY3RlZCA9IHRydWVcbiAgICAgICAgQG11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCdkaWQtc2VsZWN0LW9jY3VycmVuY2UnKVxuXG4gICAgaWYgQHRhcmdldFNlbGVjdGVkID0gQHZpbVN0YXRlLmhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24oKSBvciBAdGFyZ2V0Lm5hbWUgaXMgXCJFbXB0eVwiXG4gICAgICBAZW1pdERpZFNlbGVjdFRhcmdldCgpXG4gICAgICBAZmxhc2hDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgICBAdHJhY2tDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgZWxzZVxuICAgICAgQGVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0KClcbiAgICByZXR1cm4gQHRhcmdldFNlbGVjdGVkXG5cbiAgcmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHJlc3RvcmVQb3NpdGlvbnNcbiAgICBzdGF5ID0gQHN0YXlBdFNhbWVQb3NpdGlvbiA/IEBnZXRDb25maWcoQHN0YXlPcHRpb25OYW1lKSBvciAoQG9jY3VycmVuY2VTZWxlY3RlZCBhbmQgQGdldENvbmZpZygnc3RheU9uT2NjdXJyZW5jZScpKVxuICAgIHdpc2UgPSBpZiBAb2NjdXJyZW5jZVNlbGVjdGVkIHRoZW4gJ2NoYXJhY3Rlcndpc2UnIGVsc2UgQHRhcmdldC53aXNlXG4gICAgQG11dGF0aW9uTWFuYWdlci5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zKHtzdGF5LCB3aXNlLCBAc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2V9KVxuXG4jIFNlbGVjdFxuIyBXaGVuIHRleHQtb2JqZWN0IGlzIGludm9rZWQgZnJvbSBub3JtYWwgb3Igdml1c2FsLW1vZGUsIG9wZXJhdGlvbiB3b3VsZCBiZVxuIyAgPT4gU2VsZWN0IG9wZXJhdG9yIHdpdGggdGFyZ2V0PXRleHQtb2JqZWN0XG4jIFdoZW4gbW90aW9uIGlzIGludm9rZWQgZnJvbSB2aXN1YWwtbW9kZSwgb3BlcmF0aW9uIHdvdWxkIGJlXG4jICA9PiBTZWxlY3Qgb3BlcmF0b3Igd2l0aCB0YXJnZXQ9bW90aW9uKVxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBTZWxlY3QgaXMgdXNlZCBpbiBUV08gc2l0dWF0aW9uLlxuIyAtIHZpc3VhbC1tb2RlIG9wZXJhdGlvblxuIyAgIC0gZS5nOiBgdiBsYCwgYFYgamAsIGB2IGkgcGAuLi5cbiMgLSBEaXJlY3RseSBpbnZva2UgdGV4dC1vYmplY3QgZnJvbSBub3JtYWwtbW9kZVxuIyAgIC0gZS5nOiBJbnZva2UgYElubmVyIFBhcmFncmFwaGAgZnJvbSBjb21tYW5kLXBhbGV0dGUuXG5jbGFzcyBTZWxlY3QgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKGZhbHNlKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgcmVjb3JkYWJsZTogZmFsc2VcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZTogZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbjogZmFsc2VcblxuICBleGVjdXRlOiAtPlxuICAgIEBzdGFydE11dGF0aW9uKEBzZWxlY3RUYXJnZXQuYmluZCh0aGlzKSlcblxuICAgIGlmIEB0YXJnZXQuaXNUZXh0T2JqZWN0KCkgYW5kIEB0YXJnZXQuc2VsZWN0U3VjY2VlZGVkXG4gICAgICBAZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oKVxuICAgICAgQGFjdGl2YXRlTW9kZUlmTmVjZXNzYXJ5KCd2aXN1YWwnLCBAdGFyZ2V0Lndpc2UpXG5cbmNsYXNzIFNlbGVjdExhdGVzdENoYW5nZSBleHRlbmRzIFNlbGVjdFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlNlbGVjdCBsYXRlc3QgeWFua2VkIG9yIGNoYW5nZWQgcmFuZ2VcIlxuICB0YXJnZXQ6ICdBTGF0ZXN0Q2hhbmdlJ1xuXG5jbGFzcyBTZWxlY3RQcmV2aW91c1NlbGVjdGlvbiBleHRlbmRzIFNlbGVjdFxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIlByZXZpb3VzU2VsZWN0aW9uXCJcblxuY2xhc3MgU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIFNlbGVjdFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlNlbGVjdCBwZXJzaXN0ZW50LXNlbGVjdGlvbiBhbmQgY2xlYXIgYWxsIHBlcnNpc3RlbnQtc2VsZWN0aW9uLCBpdCdzIGxpa2UgY29udmVydCB0byByZWFsLXNlbGVjdGlvblwiXG4gIHRhcmdldDogXCJBUGVyc2lzdGVudFNlbGVjdGlvblwiXG5cbmNsYXNzIFNlbGVjdE9jY3VycmVuY2UgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkFkZCBzZWxlY3Rpb24gb250byBlYWNoIG1hdGNoaW5nIHdvcmQgd2l0aGluIHRhcmdldCByYW5nZVwiXG4gIG9jY3VycmVuY2U6IHRydWVcblxuICBleGVjdXRlOiAtPlxuICAgIEBzdGFydE11dGF0aW9uID0+XG4gICAgICBpZiBAc2VsZWN0VGFyZ2V0KClcbiAgICAgICAgQGFjdGl2YXRlTW9kZUlmTmVjZXNzYXJ5KCd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZScpXG5cbiMgUGVyc2lzdGVudCBTZWxlY3Rpb25cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgc3RheUF0U2FtZVBvc2l0aW9uOiB0cnVlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2U6IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IGZhbHNlXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uLm1hcmtCdWZmZXJSYW5nZShzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSlcblxuY2xhc3MgVG9nZ2xlUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIENyZWF0ZVBlcnNpc3RlbnRTZWxlY3Rpb25cbiAgQGV4dGVuZCgpXG5cbiAgaXNDb21wbGV0ZTogLT5cbiAgICBwb2ludCA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIEBtYXJrZXJUb1JlbW92ZSA9IEBwZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckF0UG9pbnQocG9pbnQpXG4gICAgaWYgQG1hcmtlclRvUmVtb3ZlXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgc3VwZXJcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIEBtYXJrZXJUb1JlbW92ZVxuICAgICAgQG1hcmtlclRvUmVtb3ZlLmRlc3Ryb3koKVxuICAgIGVsc2VcbiAgICAgIHN1cGVyXG5cbiMgUHJlc2V0IE9jY3VycmVuY2VcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6IFwiRW1wdHlcIlxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZTogZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbjogZmFsc2VcbiAgb2NjdXJyZW5jZVR5cGU6ICdiYXNlJ1xuXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgbWFya2VyID0gQG9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlckF0UG9pbnQoQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmRlc3Ryb3lNYXJrZXJzKFttYXJrZXJdKVxuICAgIGVsc2VcbiAgICAgIHBhdHRlcm4gPSBudWxsXG4gICAgICBpc05hcnJvd2VkID0gQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmlzTmFycm93ZWQoKVxuXG4gICAgICBpZiBAbW9kZSBpcyAndmlzdWFsJyBhbmQgbm90IGlzTmFycm93ZWRcbiAgICAgICAgQG9jY3VycmVuY2VUeXBlID0gJ2Jhc2UnXG4gICAgICAgIHBhdHRlcm4gPSBuZXcgUmVnRXhwKF8uZXNjYXBlUmVnRXhwKEBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkpLCAnZycpXG4gICAgICBlbHNlXG4gICAgICAgIHBhdHRlcm4gPSBAZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKEBvY2N1cnJlbmNlVHlwZSlcblxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocGF0dGVybiwge0BvY2N1cnJlbmNlVHlwZX0pXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuc2F2ZUxhc3RQYXR0ZXJuKEBvY2N1cnJlbmNlVHlwZSlcblxuICAgICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJykgdW5sZXNzIGlzTmFycm93ZWRcblxuY2xhc3MgVG9nZ2xlUHJlc2V0U3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlXG4gIEBleHRlbmQoKVxuICBvY2N1cnJlbmNlVHlwZTogJ3N1YndvcmQnXG5cbiMgV2FudCB0byByZW5hbWUgUmVzdG9yZU9jY3VycmVuY2VNYXJrZXJcbmNsYXNzIEFkZFByZXNldE9jY3VycmVuY2VGcm9tTGFzdE9jY3VycmVuY2VQYXR0ZXJuIGV4dGVuZHMgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpXG4gICAgaWYgcGF0dGVybiA9IEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoJ2xhc3RPY2N1cnJlbmNlUGF0dGVybicpXG4gICAgICBvY2N1cnJlbmNlVHlwZSA9IEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoXCJsYXN0T2NjdXJyZW5jZVR5cGVcIilcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHBhdHRlcm4sIHtvY2N1cnJlbmNlVHlwZX0pXG4gICAgICBAYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuXG4jIERlbGV0ZVxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgRGVsZXRlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIHRyYWNrQ2hhbmdlOiB0cnVlXG4gIGZsYXNoQ2hlY2twb2ludDogJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZSdcbiAgZmxhc2hUeXBlRm9yT2NjdXJyZW5jZTogJ29wZXJhdG9yLXJlbW92ZS1vY2N1cnJlbmNlJ1xuICBzdGF5T3B0aW9uTmFtZTogJ3N0YXlPbkRlbGV0ZSdcbiAgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2U6IHRydWVcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIEB0YXJnZXQud2lzZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgQHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuICAgIHN1cGVyXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSA9PlxuICAgIEBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgc2VsZWN0aW9uLmRlbGV0ZVNlbGVjdGVkVGV4dCgpXG5cbmNsYXNzIERlbGV0ZVJpZ2h0IGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlUmlnaHQnXG5cbmNsYXNzIERlbGV0ZUxlZnQgZXh0ZW5kcyBEZWxldGVcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVMZWZ0J1xuXG5jbGFzcyBEZWxldGVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBEZWxldGVcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUnXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAdGFyZ2V0Lndpc2UgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIEBvbkRpZFNlbGVjdFRhcmdldCA9PlxuICAgICAgICBmb3IgYmxvY2t3aXNlU2VsZWN0aW9uIGluIEBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKClcbiAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXh0ZW5kTWVtYmVyU2VsZWN0aW9uc1RvRW5kT2ZMaW5lKClcbiAgICBzdXBlclxuXG5jbGFzcyBEZWxldGVMaW5lIGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHRhcmdldDogXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuXG4jIFlhbmtcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgWWFuayBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICB0cmFja0NoYW5nZTogdHJ1ZVxuICBzdGF5T3B0aW9uTmFtZTogJ3N0YXlPbllhbmsnXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG5cbmNsYXNzIFlhbmtMaW5lIGV4dGVuZHMgWWFua1xuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICB0YXJnZXQ6IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcblxuY2xhc3MgWWFua1RvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIFlhbmtcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUnXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBbY3RybC1hXVxuY2xhc3MgSW5jcmVhc2UgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIkVtcHR5XCIgIyBjdHJsLWEgaW4gbm9ybWFsLW1vZGUgZmluZCB0YXJnZXQgbnVtYmVyIGluIGN1cnJlbnQgbGluZSBtYW51YWxseVxuICBmbGFzaFRhcmdldDogZmFsc2UgIyBkbyBtYW51YWxseVxuICByZXN0b3JlUG9zaXRpb25zOiBmYWxzZSAjIGRvIG1hbnVhbGx5XG4gIHN0ZXA6IDFcblxuICBleGVjdXRlOiAtPlxuICAgIEBuZXdSYW5nZXMgPSBbXVxuICAgIHN1cGVyXG4gICAgaWYgQG5ld1Jhbmdlcy5sZW5ndGhcbiAgICAgIGlmIEBnZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlJykgYW5kIEBuYW1lIG5vdCBpbiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdCcpXG4gICAgICAgIEB2aW1TdGF0ZS5mbGFzaChAbmV3UmFuZ2VzLCB0eXBlOiBAZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSlcblxuICByZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZTogKHNjYW5SYW5nZSwgZm49bnVsbCkgLT5cbiAgICBuZXdSYW5nZXMgPSBbXVxuICAgIEBwYXR0ZXJuID89IC8vLyN7QGdldENvbmZpZygnbnVtYmVyUmVnZXgnKX0vLy9nXG4gICAgQHNjYW5Gb3J3YXJkIEBwYXR0ZXJuLCB7c2NhblJhbmdlfSwgKGV2ZW50KSA9PlxuICAgICAgcmV0dXJuIGlmIGZuPyBhbmQgbm90IGZuKGV2ZW50KVxuICAgICAge21hdGNoVGV4dCwgcmVwbGFjZX0gPSBldmVudFxuICAgICAgbmV4dE51bWJlciA9IEBnZXROZXh0TnVtYmVyKG1hdGNoVGV4dClcbiAgICAgIG5ld1Jhbmdlcy5wdXNoKHJlcGxhY2UoU3RyaW5nKG5leHROdW1iZXIpKSlcbiAgICBuZXdSYW5nZXNcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICBpZiBAdGFyZ2V0LmlzKCdFbXB0eScpICMgY3RybC1hLCBjdHJsLXggaW4gYG5vcm1hbC1tb2RlYFxuICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgc2NhblJhbmdlID0gQGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhjdXJzb3JQb3NpdGlvbi5yb3cpXG4gICAgICBuZXdSYW5nZXMgPSBAcmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2Ugc2NhblJhbmdlLCAoe3JhbmdlLCBzdG9wfSkgLT5cbiAgICAgICAgaWYgcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4oY3Vyc29yUG9zaXRpb24pXG4gICAgICAgICAgc3RvcCgpXG4gICAgICAgICAgdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZmFsc2VcblxuICAgICAgcG9pbnQgPSBuZXdSYW5nZXNbMF0/LmVuZC50cmFuc2xhdGUoWzAsIC0xXSkgPyBjdXJzb3JQb3NpdGlvblxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIGVsc2VcbiAgICAgIHNjYW5SYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICBAbmV3UmFuZ2VzLnB1c2goQHJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlKHNjYW5SYW5nZSkuLi4pXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc2NhblJhbmdlLnN0YXJ0KVxuXG4gIGdldE5leHROdW1iZXI6IChudW1iZXJTdHJpbmcpIC0+XG4gICAgTnVtYmVyLnBhcnNlSW50KG51bWJlclN0cmluZywgMTApICsgQHN0ZXAgKiBAZ2V0Q291bnQoKVxuXG4jIFtjdHJsLXhdXG5jbGFzcyBEZWNyZWFzZSBleHRlbmRzIEluY3JlYXNlXG4gIEBleHRlbmQoKVxuICBzdGVwOiAtMVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgW2cgY3RybC1hXVxuY2xhc3MgSW5jcmVtZW50TnVtYmVyIGV4dGVuZHMgSW5jcmVhc2VcbiAgQGV4dGVuZCgpXG4gIGJhc2VOdW1iZXI6IG51bGxcbiAgdGFyZ2V0OiBudWxsXG4gIG11dGF0ZVNlbGVjdGlvbk9yZGVyZDogdHJ1ZVxuXG4gIGdldE5leHROdW1iZXI6IChudW1iZXJTdHJpbmcpIC0+XG4gICAgaWYgQGJhc2VOdW1iZXI/XG4gICAgICBAYmFzZU51bWJlciArPSBAc3RlcCAqIEBnZXRDb3VudCgpXG4gICAgZWxzZVxuICAgICAgQGJhc2VOdW1iZXIgPSBOdW1iZXIucGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMClcbiAgICBAYmFzZU51bWJlclxuXG4jIFtnIGN0cmwteF1cbmNsYXNzIERlY3JlbWVudE51bWJlciBleHRlbmRzIEluY3JlbWVudE51bWJlclxuICBAZXh0ZW5kKClcbiAgc3RlcDogLTFcblxuIyBQdXRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBDdXJzb3IgcGxhY2VtZW50OlxuIyAtIHBsYWNlIGF0IGVuZCBvZiBtdXRhdGlvbjogcGFzdGUgbm9uLW11bHRpbGluZSBjaGFyYWN0ZXJ3aXNlIHRleHRcbiMgLSBwbGFjZSBhdCBzdGFydCBvZiBtdXRhdGlvbjogbm9uLW11bHRpbGluZSBjaGFyYWN0ZXJ3aXNlIHRleHQoY2hhcmFjdGVyd2lzZSwgbGluZXdpc2UpXG5jbGFzcyBQdXRCZWZvcmUgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgbG9jYXRpb246ICdiZWZvcmUnXG4gIHRhcmdldDogJ0VtcHR5J1xuICBmbGFzaFR5cGU6ICdvcGVyYXRvci1sb25nJ1xuICByZXN0b3JlUG9zaXRpb25zOiBmYWxzZSAjIG1hbmFnZSBtYW51YWxseVxuICBmbGFzaFRhcmdldDogdHJ1ZSAjIG1hbmFnZSBtYW51YWxseVxuICB0cmFja0NoYW5nZTogZmFsc2UgIyBtYW5hZ2UgbWFudWFsbHlcblxuICBleGVjdXRlOiAtPlxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbiA9IG5ldyBNYXAoKVxuICAgIHt0ZXh0LCB0eXBlfSA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXQobnVsbCwgQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgcmV0dXJuIHVubGVzcyB0ZXh0XG4gICAgQG9uRGlkRmluaXNoTXV0YXRpb24oQGFkanVzdEN1cnNvclBvc2l0aW9uLmJpbmQodGhpcykpXG5cbiAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgICMgVHJhY2tDaGFuZ2VcbiAgICAgIGlmIG5ld1JhbmdlID0gQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICAgICAgQHNldE1hcmtGb3JDaGFuZ2UobmV3UmFuZ2UpXG5cbiAgICAgICMgRmxhc2hcbiAgICAgIGlmIEBnZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlJykgYW5kIEBuYW1lIG5vdCBpbiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdCcpXG4gICAgICAgIHRvUmFuZ2UgPSAoc2VsZWN0aW9uKSA9PiBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgICAgQHZpbVN0YXRlLmZsYXNoKEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLm1hcCh0b1JhbmdlKSwgdHlwZTogQGdldEZsYXNoVHlwZSgpKVxuXG4gICAgc3VwZXJcblxuICBhZGp1c3RDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpIHdoZW4gQG11dGF0aW9uc0J5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pXG4gICAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgICAge3N0YXJ0LCBlbmR9ID0gbmV3UmFuZ2UgPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgIGlmIEBsaW5ld2lzZVBhc3RlXG4gICAgICAgIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCBzdGFydC5yb3cpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIG5ld1JhbmdlLmlzU2luZ2xlTGluZSgpXG4gICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGVuZC50cmFuc2xhdGUoWzAsIC0xXSkpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc3RhcnQpXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHt0ZXh0LCB0eXBlfSA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXQobnVsbCwgc2VsZWN0aW9uKVxuICAgIHRleHQgPSBfLm11bHRpcGx5U3RyaW5nKHRleHQsIEBnZXRDb3VudCgpKVxuICAgIEBsaW5ld2lzZVBhc3RlID0gdHlwZSBpcyAnbGluZXdpc2UnIG9yIEBpc01vZGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgbmV3UmFuZ2UgPSBAcGFzdGUoc2VsZWN0aW9uLCB0ZXh0LCB7QGxpbmV3aXNlUGFzdGV9KVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBuZXdSYW5nZSlcblxuICBwYXN0ZTogKHNlbGVjdGlvbiwgdGV4dCwge2xpbmV3aXNlUGFzdGV9KSAtPlxuICAgIGlmIGxpbmV3aXNlUGFzdGVcbiAgICAgIEBwYXN0ZUxpbmV3aXNlKHNlbGVjdGlvbiwgdGV4dClcbiAgICBlbHNlXG4gICAgICBAcGFzdGVDaGFyYWN0ZXJ3aXNlKHNlbGVjdGlvbiwgdGV4dClcblxuICBwYXN0ZUNoYXJhY3Rlcndpc2U6IChzZWxlY3Rpb24sIHRleHQpIC0+XG4gICAge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpIGFuZCBAbG9jYXRpb24gaXMgJ2FmdGVyJyBhbmQgbm90IGlzRW1wdHlSb3coQGVkaXRvciwgY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgcmV0dXJuIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG5cbiAgIyBSZXR1cm4gbmV3UmFuZ2VcbiAgcGFzdGVMaW5ld2lzZTogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIHRleHQgKz0gXCJcXG5cIiB1bmxlc3MgdGV4dC5lbmRzV2l0aChcIlxcblwiKVxuICAgIG5ld1JhbmdlID0gbnVsbFxuICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgIGlmIEBsb2NhdGlvbiBpcyAnYmVmb3JlJ1xuICAgICAgICBuZXdSYW5nZSA9IGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIFtjdXJzb3JSb3csIDBdLCB0ZXh0KVxuICAgICAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCBuZXdSYW5nZS5zdGFydC5yb3cpXG4gICAgICBlbHNlIGlmIEBsb2NhdGlvbiBpcyAnYWZ0ZXInXG4gICAgICAgIHRhcmdldFJvdyA9IEBnZXRGb2xkRW5kUm93Rm9yUm93KGN1cnNvclJvdylcbiAgICAgICAgZW5zdXJlRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93KEBlZGl0b3IsIHRhcmdldFJvdylcbiAgICAgICAgbmV3UmFuZ2UgPSBpbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBbdGFyZ2V0Um93ICsgMSwgMF0sIHRleHQpXG4gICAgZWxzZVxuICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoXCJcXG5cIikgdW5sZXNzIEBpc01vZGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgICBuZXdSYW5nZSA9IHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG5cbiAgICByZXR1cm4gbmV3UmFuZ2VcblxuY2xhc3MgUHV0QWZ0ZXIgZXh0ZW5kcyBQdXRCZWZvcmVcbiAgQGV4dGVuZCgpXG4gIGxvY2F0aW9uOiAnYWZ0ZXInXG5cbmNsYXNzIFB1dEJlZm9yZVdpdGhBdXRvSW5kZW50IGV4dGVuZHMgUHV0QmVmb3JlXG4gIEBleHRlbmQoKVxuXG4gIHBhc3RlTGluZXdpc2U6IChzZWxlY3Rpb24sIHRleHQpIC0+XG4gICAgbmV3UmFuZ2UgPSBzdXBlclxuICAgIGFkanVzdEluZGVudFdpdGhLZWVwaW5nTGF5b3V0KEBlZGl0b3IsIG5ld1JhbmdlKVxuICAgIHJldHVybiBuZXdSYW5nZVxuXG5jbGFzcyBQdXRBZnRlcldpdGhBdXRvSW5kZW50IGV4dGVuZHMgUHV0QmVmb3JlV2l0aEF1dG9JbmRlbnRcbiAgQGV4dGVuZCgpXG4gIGxvY2F0aW9uOiAnYWZ0ZXInXG5cbmNsYXNzIEFkZEJsYW5rTGluZUJlbG93IGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICB0YXJnZXQ6IFwiRW1wdHlcIlxuICBzdGF5QXRTYW1lUG9zaXRpb246IHRydWVcbiAgc3RheUJ5TWFya2VyOiB0cnVlXG4gIHdoZXJlOiAnYmVsb3cnXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJvdyA9IHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKS5yb3dcbiAgICByb3cgKz0gMSBpZiBAd2hlcmUgaXMgJ2JlbG93J1xuICAgIHBvaW50ID0gW3JvdywgMF1cbiAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtwb2ludCwgcG9pbnRdLCBcIlxcblwiLnJlcGVhdChAZ2V0Q291bnQoKSkpXG5cbmNsYXNzIEFkZEJsYW5rTGluZUFib3ZlIGV4dGVuZHMgQWRkQmxhbmtMaW5lQmVsb3dcbiAgQGV4dGVuZCgpXG4gIHdoZXJlOiAnYWJvdmUnXG4iXX0=
