(function() {
  var AddBlankLineAbove, AddBlankLineBelow, AddPresetOccurrenceFromLastOccurrencePattern, Base, CreatePersistentSelection, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteLine, DeleteRight, DeleteToLastCharacterOfLine, Increase, IncrementNumber, Operator, PutAfter, PutBefore, Select, SelectLatestChange, SelectOccurrence, SelectPersistentSelection, SelectPreviousSelection, TogglePersistentSelection, TogglePresetOccurrence, TogglePresetSubwordOccurrence, Yank, YankLine, YankToLastCharacterOfLine, _, assertWithException, ensureEndsWithNewLineForBufferRow, getSubwordPatternAtBufferPosition, getWordPatternAtBufferPosition, haveSomeNonEmptySelection, insertTextAtBufferPosition, isEmptyRow, moveCursorToFirstCharacterAtRow, ref, setBufferRow, swrap,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  ref = require('./utils'), haveSomeNonEmptySelection = ref.haveSomeNonEmptySelection, isEmptyRow = ref.isEmptyRow, getWordPatternAtBufferPosition = ref.getWordPatternAtBufferPosition, getSubwordPatternAtBufferPosition = ref.getSubwordPatternAtBufferPosition, insertTextAtBufferPosition = ref.insertTextAtBufferPosition, setBufferRow = ref.setBufferRow, moveCursorToFirstCharacterAtRow = ref.moveCursorToFirstCharacterAtRow, ensureEndsWithNewLineForBufferRow = ref.ensureEndsWithNewLineForBufferRow, assertWithException = ref.assertWithException;

  swrap = require('./selection-wrapper');

  Base = require('./base');

  Operator = (function(superClass) {
    extend(Operator, superClass);

    Operator.extend(false);

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
      return this.supportEarlySelect && !this.isRepeated();
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
      return this.vimState.mark.setRange('[', ']', range);
    };

    Operator.prototype.needFlash = function() {
      var ref1;
      if (!this.flashTarget) {
        return;
      }
      if (!this.getConfig('flashOnOperate')) {
        return;
      }
      if (ref1 = this.getName(), indexOf.call(this.getConfig('flashOnOperateBlacklist'), ref1) >= 0) {
        return;
      }
      return (this.mode !== 'visual') || (this.submode !== this.target.wise);
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
            return _this.vimState.flash(_this.mutationManager.getBufferRangesForCheckpoint(_this.flashCheckpoint), {
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
          if (range = _this.mutationManager.getMutatedBufferRange(_this.editor.getLastSelection())) {
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
          this.vimState.modeManager.activate('visual', swrap.detectWise(this.editor));
        }
      }
      if (this.mode === 'visual') {
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
        ref1 = swrap.getSelections(this.editor);
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
      this.target.setOperator(this);
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
        return this.vimState.register.set({
          text: text,
          selection: selection
        });
      }
    };

    Operator.prototype.normalizeSelectionsIfNecessary = function() {
      var ref1;
      if (((ref1 = this.target) != null ? ref1.isMotion() : void 0) && (this.mode === 'visual')) {
        return swrap.normalize(this.editor);
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
      if (this.isRepeated() && this.occurrence && !this.occurrenceManager.hasMarkers()) {
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
          swrap.clearProperties(this.editor);
          this.occurrenceSelected = true;
          this.mutationManager.setCheckpoint('did-select-occurrence');
        }
      }
      if (haveSomeNonEmptySelection(this.editor) || this.target.getName() === "Empty") {
        this.emitDidSelectTarget();
        this.flashChangeIfNecessary();
        this.trackChangeIfNecessary();
        this.targetSelected = true;
        return true;
      } else {
        this.emitDidFailSelectTarget();
        this.targetSelected = false;
        return false;
      }
    };

    Operator.prototype.restoreCursorPositionsIfNecessary = function() {
      var ref1, stay, wise;
      if (!this.restorePositions) {
        return;
      }
      stay = ((ref1 = this.stayAtSamePosition) != null ? ref1 : this.getConfig(this.stayOptionName)) || (this.occurrenceSelected && this.getConfig('stayOnOccurrence'));
      wise = this.target.wise;
      this.mutationManager.restoreCursorPositions({
        stay: stay,
        wise: wise,
        occurrenceSelected: this.occurrenceSelected,
        setToFirstCharacterOnLinewise: this.setToFirstCharacterOnLinewise
      });
      return this.emitDidRestoreCursorPositions({
        stay: stay
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

    TogglePresetOccurrence.prototype.flashTarget = false;

    TogglePresetOccurrence.prototype.requireTarget = false;

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
        if (this.getConfig('flashOnOperate') && (ref1 = this.getName(), indexOf.call(this.getConfig('flashOnOperateBlacklist'), ref1) < 0)) {
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
          if (_this.getConfig('flashOnOperate') && (ref2 = _this.getName(), indexOf.call(_this.getConfig('flashOnOperateBlacklist'), ref2) < 0)) {
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
      var cursor, cursorRow, newRange;
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
          ensureEndsWithNewLineForBufferRow(this.editor, cursorRow);
          newRange = insertTextAtBufferPosition(this.editor, [cursorRow + 1, 0], text);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNnVCQUFBO0lBQUE7Ozs7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQVVJLE9BQUEsQ0FBUSxTQUFSLENBVkosRUFDRSx5REFERixFQUVFLDJCQUZGLEVBR0UsbUVBSEYsRUFJRSx5RUFKRixFQUtFLDJEQUxGLEVBTUUsK0JBTkYsRUFPRSxxRUFQRixFQVFFLHlFQVJGLEVBU0U7O0VBRUYsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFDUixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBRUQ7OztJQUNKLFFBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7dUJBQ0EsYUFBQSxHQUFlOzt1QkFDZixVQUFBLEdBQVk7O3VCQUVaLElBQUEsR0FBTTs7dUJBQ04sVUFBQSxHQUFZOzt1QkFDWixjQUFBLEdBQWdCOzt1QkFFaEIsV0FBQSxHQUFhOzt1QkFDYixlQUFBLEdBQWlCOzt1QkFDakIsU0FBQSxHQUFXOzt1QkFDWCxzQkFBQSxHQUF3Qjs7dUJBQ3hCLFdBQUEsR0FBYTs7dUJBRWIsb0JBQUEsR0FBc0I7O3VCQUN0QixrQkFBQSxHQUFvQjs7dUJBQ3BCLGNBQUEsR0FBZ0I7O3VCQUNoQixZQUFBLEdBQWM7O3VCQUNkLGdCQUFBLEdBQWtCOzt1QkFDbEIsNkJBQUEsR0FBK0I7O3VCQUUvQixzQkFBQSxHQUF3Qjs7dUJBQ3hCLHlCQUFBLEdBQTJCOzt1QkFFM0IseUJBQUEsR0FBMkI7O3VCQUMzQixxQkFBQSxHQUF1Qjs7dUJBSXZCLGtCQUFBLEdBQW9COzt1QkFDcEIsY0FBQSxHQUFnQjs7dUJBQ2hCLGNBQUEsR0FBZ0IsU0FBQTthQUNkLElBQUMsQ0FBQSxrQkFBRCxJQUF3QixDQUFJLElBQUMsQ0FB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QUFELEVBQU0sQ0FBTjthQUNSLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsQ0FBQyxLQUFELEVBQVEsS0FBUixDQUE3QixFQUE2QyxJQUFJLENBQUMsTUFBTCxDQUFZLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBWixDQUE3QztJQUplOzs7O0tBUmE7O0VBYzFCOzs7Ozs7O0lBQ0osaUJBQUMsQ0FBQSxNQUFELENBQUE7O2dDQUNBLEtBQUEsR0FBTzs7OztLQUZ1QjtBQTNuQmhDIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntcbiAgaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvblxuICBpc0VtcHR5Um93XG4gIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvblxuICBnZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb25cbiAgaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb25cbiAgc2V0QnVmZmVyUm93XG4gIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3dcbiAgZW5zdXJlRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93XG4gIGFzc2VydFdpdGhFeGNlcHRpb25cbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcblxuY2xhc3MgT3BlcmF0b3IgZXh0ZW5kcyBCYXNlXG4gIEBleHRlbmQoZmFsc2UpXG4gIHJlcXVpcmVUYXJnZXQ6IHRydWVcbiAgcmVjb3JkYWJsZTogdHJ1ZVxuXG4gIHdpc2U6IG51bGxcbiAgb2NjdXJyZW5jZTogZmFsc2VcbiAgb2NjdXJyZW5jZVR5cGU6ICdiYXNlJ1xuXG4gIGZsYXNoVGFyZ2V0OiB0cnVlXG4gIGZsYXNoQ2hlY2twb2ludDogJ2RpZC1maW5pc2gnXG4gIGZsYXNoVHlwZTogJ29wZXJhdG9yJ1xuICBmbGFzaFR5cGVGb3JPY2N1cnJlbmNlOiAnb3BlcmF0b3Itb2NjdXJyZW5jZSdcbiAgdHJhY2tDaGFuZ2U6IGZhbHNlXG5cbiAgcGF0dGVybkZvck9jY3VycmVuY2U6IG51bGxcbiAgc3RheUF0U2FtZVBvc2l0aW9uOiBudWxsXG4gIHN0YXlPcHRpb25OYW1lOiBudWxsXG4gIHN0YXlCeU1hcmtlcjogZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9uczogdHJ1ZVxuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZTogZmFsc2VcblxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlOiB0cnVlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IHRydWVcblxuICBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlOiBudWxsXG4gIG11dGF0ZVNlbGVjdGlvbk9yZGVyZDogZmFsc2VcblxuICAjIEV4cGVyaW1lbnRhbHkgYWxsb3cgc2VsZWN0VGFyZ2V0IGJlZm9yZSBpbnB1dCBDb21wbGV0ZVxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc3VwcG9ydEVhcmx5U2VsZWN0OiBmYWxzZVxuICB0YXJnZXRTZWxlY3RlZDogbnVsbFxuICBjYW5FYXJseVNlbGVjdDogLT5cbiAgICBAc3VwcG9ydEVhcmx5U2VsZWN0IGFuZCBub3QgQGlzUmVwZWF0ZWQoKVxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAjIENhbGxlZCB3aGVuIG9wZXJhdGlvbiBmaW5pc2hlZFxuICAjIFRoaXMgaXMgZXNzZW50aWFsbHkgdG8gcmVzZXQgc3RhdGUgZm9yIGAuYCByZXBlYXQuXG4gIHJlc2V0U3RhdGU6IC0+XG4gICAgQHRhcmdldFNlbGVjdGVkID0gbnVsbFxuICAgIEBvY2N1cnJlbmNlU2VsZWN0ZWQgPSBmYWxzZVxuXG4gICMgVHdvIGNoZWNrcG9pbnQgZm9yIGRpZmZlcmVudCBwdXJwb3NlXG4gICMgLSBvbmUgZm9yIHVuZG8oaGFuZGxlZCBieSBtb2RlTWFuYWdlcilcbiAgIyAtIG9uZSBmb3IgcHJlc2VydmUgbGFzdCBpbnNlcnRlZCB0ZXh0XG4gIGNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlID89IHt9XG4gICAgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV0gPSBAZWRpdG9yLmNyZWF0ZUNoZWNrcG9pbnQoKVxuXG4gIGdldEJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlP1twdXJwb3NlXVxuXG4gIGRlbGV0ZUJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIGlmIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlP1xuICAgICAgZGVsZXRlIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdXG5cbiAgZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50OiAocHVycG9zZSkgLT5cbiAgICBpZiBjaGVja3BvaW50ID0gQGdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICAgIEBlZGl0b3IuZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KGNoZWNrcG9pbnQpXG4gICAgICBAZGVsZXRlQnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuXG4gIHNldE1hcmtGb3JDaGFuZ2U6IChyYW5nZSkgLT5cbiAgICBAdmltU3RhdGUubWFyay5zZXRSYW5nZSgnWycsICddJywgcmFuZ2UpXG5cbiAgbmVlZEZsYXNoOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGZsYXNoVGFyZ2V0XG4gICAgcmV0dXJuIHVubGVzcyBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZScpXG4gICAgcmV0dXJuIGlmIEBnZXROYW1lKCkgaW4gQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGVCbGFja2xpc3QnKVxuICAgIChAbW9kZSBpc250ICd2aXN1YWwnKSBvciAoQHN1Ym1vZGUgaXNudCBAdGFyZ2V0Lndpc2UpICMgZS5nLiBZIGluIHZDXG5cbiAgZmxhc2hJZk5lY2Vzc2FyeTogKHJhbmdlcykgLT5cbiAgICBpZiBAbmVlZEZsYXNoKClcbiAgICAgIEB2aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHR5cGU6IEBnZXRGbGFzaFR5cGUoKSlcblxuICBmbGFzaENoYW5nZUlmTmVjZXNzYXJ5OiAtPlxuICAgIGlmIEBuZWVkRmxhc2goKVxuICAgICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICAgIEB2aW1TdGF0ZS5mbGFzaChAbXV0YXRpb25NYW5hZ2VyLmdldEJ1ZmZlclJhbmdlc0ZvckNoZWNrcG9pbnQoQGZsYXNoQ2hlY2twb2ludCksIHR5cGU6IEBnZXRGbGFzaFR5cGUoKSlcblxuICBnZXRGbGFzaFR5cGU6IC0+XG4gICAgaWYgQG9jY3VycmVuY2VTZWxlY3RlZFxuICAgICAgQGZsYXNoVHlwZUZvck9jY3VycmVuY2VcbiAgICBlbHNlXG4gICAgICBAZmxhc2hUeXBlXG5cbiAgdHJhY2tDaGFuZ2VJZk5lY2Vzc2FyeTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEB0cmFja0NoYW5nZVxuXG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICBpZiByYW5nZSA9IEBtdXRhdGlvbk1hbmFnZXIuZ2V0TXV0YXRlZEJ1ZmZlclJhbmdlKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgICAgICBAc2V0TWFya0ZvckNoYW5nZShyYW5nZSlcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIHtAbXV0YXRpb25NYW5hZ2VyLCBAb2NjdXJyZW5jZU1hbmFnZXIsIEBwZXJzaXN0ZW50U2VsZWN0aW9ufSA9IEB2aW1TdGF0ZVxuICAgIEBzdWJzY3JpYmVSZXNldE9jY3VycmVuY2VQYXR0ZXJuSWZOZWVkZWQoKVxuICAgIEBpbml0aWFsaXplKClcbiAgICBAb25EaWRTZXRPcGVyYXRvck1vZGlmaWVyKEBzZXRNb2RpZmllci5iaW5kKHRoaXMpKVxuXG4gICAgIyBXaGVuIHByZXNldC1vY2N1cnJlbmNlIHdhcyBleGlzdHMsIG9wZXJhdGUgb24gb2NjdXJyZW5jZS13aXNlXG4gICAgaWYgQGFjY2VwdFByZXNldE9jY3VycmVuY2UgYW5kIEBvY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKClcbiAgICAgIEBvY2N1cnJlbmNlID0gdHJ1ZVxuXG4gICAgIyBbRklYTUVdIE9SREVSLU1BVFRFUlxuICAgICMgVG8gcGljayBjdXJzb3Itd29yZCB0byBmaW5kIG9jY3VycmVuY2UgYmFzZSBwYXR0ZXJuLlxuICAgICMgVGhpcyBoYXMgdG8gYmUgZG9uZSBCRUZPUkUgY29udmVydGluZyBwZXJzaXN0ZW50LXNlbGVjdGlvbiBpbnRvIHJlYWwtc2VsZWN0aW9uLlxuICAgICMgU2luY2Ugd2hlbiBwZXJzaXN0ZW50LXNlbGVjdGlvbiBpcyBhY3R1YWxsIHNlbGVjdGVkLCBpdCBjaGFuZ2UgY3Vyc29yIHBvc2l0aW9uLlxuICAgIGlmIEBvY2N1cnJlbmNlIGFuZCBub3QgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4oQHBhdHRlcm5Gb3JPY2N1cnJlbmNlID8gQGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShAb2NjdXJyZW5jZVR5cGUpKVxuXG4gICAgIyBUaGlzIGNoYW5nZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgaWYgQHNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25JZk5lY2Vzc2FyeSgpXG4gICAgICAjIFtGSVhNRV0gc2VsZWN0aW9uLXdpc2UgaXMgbm90IHN5bmNoZWQgaWYgaXQgYWxyZWFkeSB2aXN1YWwtbW9kZVxuICAgICAgdW5sZXNzIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICAgIEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5hY3RpdmF0ZSgndmlzdWFsJywgc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKSlcblxuICAgIEB0YXJnZXQgPSAnQ3VycmVudFNlbGVjdGlvbicgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICBAc2V0VGFyZ2V0KEBuZXcoQHRhcmdldCkpIGlmIF8uaXNTdHJpbmcoQHRhcmdldClcblxuICBzdWJzY3JpYmVSZXNldE9jY3VycmVuY2VQYXR0ZXJuSWZOZWVkZWQ6IC0+XG4gICAgIyBbQ0FVVElPTl1cbiAgICAjIFRoaXMgbWV0aG9kIGhhcyB0byBiZSBjYWxsZWQgaW4gUFJPUEVSIHRpbWluZy5cbiAgICAjIElmIG9jY3VycmVuY2UgaXMgdHJ1ZSBidXQgbm8gcHJlc2V0LW9jY3VycmVuY2VcbiAgICAjIFRyZWF0IHRoYXQgYG9jY3VycmVuY2VgIGlzIEJPVU5ERUQgdG8gb3BlcmF0b3IgaXRzZWxmLCBzbyBjbGVhbnAgYXQgZmluaXNoZWQuXG4gICAgaWYgQG9jY3VycmVuY2UgYW5kIG5vdCBAb2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpXG4gICAgICBAb25EaWRSZXNldE9wZXJhdGlvblN0YWNrKD0+IEBvY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKCkpXG5cbiAgc2V0TW9kaWZpZXI6IChvcHRpb25zKSAtPlxuICAgIGlmIG9wdGlvbnMud2lzZT9cbiAgICAgIEB3aXNlID0gb3B0aW9ucy53aXNlXG4gICAgICByZXR1cm5cblxuICAgIGlmIG9wdGlvbnMub2NjdXJyZW5jZT9cbiAgICAgIEBvY2N1cnJlbmNlID0gb3B0aW9ucy5vY2N1cnJlbmNlXG4gICAgICBpZiBAb2NjdXJyZW5jZVxuICAgICAgICBAb2NjdXJyZW5jZVR5cGUgPSBvcHRpb25zLm9jY3VycmVuY2VUeXBlXG4gICAgICAgICMgVGhpcyBpcyBvIG1vZGlmaWVyIGNhc2UoZS5nLiBgYyBvIHBgLCBgZCBPIGZgKVxuICAgICAgICAjIFdlIFJFU0VUIGV4aXN0aW5nIG9jY3VyZW5jZS1tYXJrZXIgd2hlbiBgb2Agb3IgYE9gIG1vZGlmaWVyIGlzIHR5cGVkIGJ5IHVzZXIuXG4gICAgICAgIHBhdHRlcm4gPSBAZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKEBvY2N1cnJlbmNlVHlwZSlcbiAgICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocGF0dGVybiwge3Jlc2V0OiB0cnVlLCBAb2NjdXJyZW5jZVR5cGV9KVxuICAgICAgICBAb25EaWRSZXNldE9wZXJhdGlvblN0YWNrKD0+IEBvY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKCkpXG5cbiAgIyByZXR1cm4gdHJ1ZS9mYWxzZSB0byBpbmRpY2F0ZSBzdWNjZXNzXG4gIHNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25JZk5lY2Vzc2FyeTogLT5cbiAgICBpZiBAYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiBhbmRcbiAgICAgICAgQGdldENvbmZpZygnYXV0b1NlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25Pbk9wZXJhdGUnKSBhbmRcbiAgICAgICAgbm90IEBwZXJzaXN0ZW50U2VsZWN0aW9uLmlzRW1wdHkoKVxuXG4gICAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5zZWxlY3QoKVxuICAgICAgQGVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuICAgICAgZm9yICRzZWxlY3Rpb24gaW4gc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKSB3aGVuIG5vdCAkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKVxuICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gIGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZTogKG9jY3VycmVuY2VUeXBlKSAtPlxuICAgIHN3aXRjaCBvY2N1cnJlbmNlVHlwZVxuICAgICAgd2hlbiAnYmFzZSdcbiAgICAgICAgZ2V0V29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIEBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgd2hlbiAnc3Vid29yZCdcbiAgICAgICAgZ2V0U3Vid29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIEBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuXG4gICMgdGFyZ2V0IGlzIFRleHRPYmplY3Qgb3IgTW90aW9uIHRvIG9wZXJhdGUgb24uXG4gIHNldFRhcmdldDogKEB0YXJnZXQpIC0+XG4gICAgQHRhcmdldC5zZXRPcGVyYXRvcih0aGlzKVxuICAgIEBlbWl0RGlkU2V0VGFyZ2V0KHRoaXMpXG5cbiAgICBpZiBAY2FuRWFybHlTZWxlY3QoKVxuICAgICAgQG5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICBAY3JlYXRlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG4gICAgICBAc2VsZWN0VGFyZ2V0KClcbiAgICB0aGlzXG5cbiAgc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQHNldFRleHRUb1JlZ2lzdGVyKHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcblxuICBzZXRUZXh0VG9SZWdpc3RlcjogKHRleHQsIHNlbGVjdGlvbikgLT5cbiAgICB0ZXh0ICs9IFwiXFxuXCIgaWYgKEB0YXJnZXQuaXNMaW5ld2lzZSgpIGFuZCAobm90IHRleHQuZW5kc1dpdGgoJ1xcbicpKSlcbiAgICBAdmltU3RhdGUucmVnaXN0ZXIuc2V0KHt0ZXh0LCBzZWxlY3Rpb259KSBpZiB0ZXh0XG5cbiAgbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5OiAtPlxuICAgIGlmIEB0YXJnZXQ/LmlzTW90aW9uKCkgYW5kIChAbW9kZSBpcyAndmlzdWFsJylcbiAgICAgIHN3cmFwLm5vcm1hbGl6ZShAZWRpdG9yKVxuXG4gIHN0YXJ0TXV0YXRpb246IChmbikgLT5cbiAgICBpZiBAY2FuRWFybHlTZWxlY3QoKVxuICAgICAgIyAtIFNraXAgc2VsZWN0aW9uIG5vcm1hbGl6YXRpb246IGFscmVhZHkgbm9ybWFsaXplZCBiZWZvcmUgQHNlbGVjdFRhcmdldCgpXG4gICAgICAjIC0gTWFudWFsIGNoZWNrcG9pbnQgZ3JvdXBpbmc6IHRvIGNyZWF0ZSBjaGVja3BvaW50IGJlZm9yZSBAc2VsZWN0VGFyZ2V0KClcbiAgICAgIGZuKClcbiAgICAgIEBlbWl0V2lsbEZpbmlzaE11dGF0aW9uKClcbiAgICAgIEBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQoJ3VuZG8nKVxuXG4gICAgZWxzZVxuICAgICAgQG5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICAgIGZuKClcbiAgICAgICAgQGVtaXRXaWxsRmluaXNoTXV0YXRpb24oKVxuXG4gICAgQGVtaXREaWRGaW5pc2hNdXRhdGlvbigpXG5cbiAgIyBNYWluXG4gIGV4ZWN1dGU6IC0+XG4gICAgQHN0YXJ0TXV0YXRpb24gPT5cbiAgICAgIGlmIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgICBpZiBAbXV0YXRlU2VsZWN0aW9uT3JkZXJkXG4gICAgICAgICAgc2VsZWN0aW9ucyA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNlbGVjdGlvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIHNlbGVjdGlvbnNcbiAgICAgICAgICBAbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgICAgQG11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCdkaWQtZmluaXNoJylcbiAgICAgICAgQHJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeSgpXG5cbiAgICAjIEV2ZW4gdGhvdWdoIHdlIGZhaWwgdG8gc2VsZWN0IHRhcmdldCBhbmQgZmFpbCB0byBtdXRhdGUsXG4gICAgIyB3ZSBoYXZlIHRvIHJldHVybiB0byBub3JtYWwtbW9kZSBmcm9tIG9wZXJhdG9yLXBlbmRpbmcgb3IgdmlzdWFsXG4gICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJylcblxuICAjIFJldHVybiB0cnVlIHVubGVzcyBhbGwgc2VsZWN0aW9uIGlzIGVtcHR5LlxuICBzZWxlY3RUYXJnZXQ6IC0+XG4gICAgcmV0dXJuIEB0YXJnZXRTZWxlY3RlZCBpZiBAdGFyZ2V0U2VsZWN0ZWQ/XG4gICAgQG11dGF0aW9uTWFuYWdlci5pbml0KHtAc3RheUJ5TWFya2VyfSlcblxuICAgIEB0YXJnZXQuZm9yY2VXaXNlKEB3aXNlKSBpZiBAd2lzZT9cbiAgICBAZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuXG4gICAgIyBBbGxvdyBjdXJzb3IgcG9zaXRpb24gYWRqdXN0bWVudCAnb24td2lsbC1zZWxlY3QtdGFyZ2V0JyBob29rLlxuICAgICMgc28gY2hlY2twb2ludCBjb21lcyBBRlRFUiBAZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnd2lsbC1zZWxlY3QnKVxuXG4gICAgIyBOT1RFXG4gICAgIyBTaW5jZSBNb3ZlVG9OZXh0T2NjdXJyZW5jZSwgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlIG1vdGlvbiBtb3ZlIGJ5XG4gICAgIyAgb2NjdXJyZW5jZS1tYXJrZXIsIG9jY3VycmVuY2UtbWFya2VyIGhhcyB0byBiZSBjcmVhdGVkIEJFRk9SRSBgQHRhcmdldC5leGVjdXRlKClgXG4gICAgIyBBbmQgd2hlbiByZXBlYXRlZCwgb2NjdXJyZW5jZSBwYXR0ZXJuIGlzIGFscmVhZHkgY2FjaGVkIGF0IEBwYXR0ZXJuRm9yT2NjdXJyZW5jZVxuICAgIGlmIEBpc1JlcGVhdGVkKCkgYW5kIEBvY2N1cnJlbmNlIGFuZCBub3QgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4oQHBhdHRlcm5Gb3JPY2N1cnJlbmNlLCB7QG9jY3VycmVuY2VUeXBlfSlcblxuICAgIEB0YXJnZXQuZXhlY3V0ZSgpXG5cbiAgICBAbXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1zZWxlY3QnKVxuICAgIGlmIEBvY2N1cnJlbmNlXG4gICAgICAjIFRvIHJlcG9lYXQoYC5gKSBvcGVyYXRpb24gd2hlcmUgbXVsdGlwbGUgb2NjdXJyZW5jZSBwYXR0ZXJucyB3YXMgc2V0LlxuICAgICAgIyBIZXJlIHdlIHNhdmUgcGF0dGVybnMgd2hpY2ggcmVwcmVzZW50IHVuaW9uZWQgcmVnZXggd2hpY2ggQG9jY3VycmVuY2VNYW5hZ2VyIGtub3dzLlxuICAgICAgQHBhdHRlcm5Gb3JPY2N1cnJlbmNlID89IEBvY2N1cnJlbmNlTWFuYWdlci5idWlsZFBhdHRlcm4oKVxuXG4gICAgICBpZiBAb2NjdXJyZW5jZU1hbmFnZXIuc2VsZWN0KClcbiAgICAgICAgIyBUbyBza2lwIHJlc3RvcmVpbmcgcG9zaXRpb24gZnJvbSBzZWxlY3Rpb24gcHJvcCB3aGVuIHNoaWZ0IHZpc3VhbC1tb2RlIHN1Ym1vZGUgb24gU2VsZWN0T2NjdXJyZW5jZVxuICAgICAgICBzd3JhcC5jbGVhclByb3BlcnRpZXMoQGVkaXRvcilcblxuICAgICAgICBAb2NjdXJyZW5jZVNlbGVjdGVkID0gdHJ1ZVxuICAgICAgICBAbXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZScpXG5cbiAgICBpZiBoYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uKEBlZGl0b3IpIG9yIEB0YXJnZXQuZ2V0TmFtZSgpIGlzIFwiRW1wdHlcIlxuICAgICAgQGVtaXREaWRTZWxlY3RUYXJnZXQoKVxuICAgICAgQGZsYXNoQ2hhbmdlSWZOZWNlc3NhcnkoKVxuICAgICAgQHRyYWNrQ2hhbmdlSWZOZWNlc3NhcnkoKVxuICAgICAgQHRhcmdldFNlbGVjdGVkID0gdHJ1ZVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIEBlbWl0RGlkRmFpbFNlbGVjdFRhcmdldCgpXG4gICAgICBAdGFyZ2V0U2VsZWN0ZWQgPSBmYWxzZVxuICAgICAgZmFsc2VcblxuICByZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3Nhcnk6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcmVzdG9yZVBvc2l0aW9uc1xuICAgIHN0YXkgPSBAc3RheUF0U2FtZVBvc2l0aW9uID8gQGdldENvbmZpZyhAc3RheU9wdGlvbk5hbWUpIG9yIChAb2NjdXJyZW5jZVNlbGVjdGVkIGFuZCBAZ2V0Q29uZmlnKCdzdGF5T25PY2N1cnJlbmNlJykpXG4gICAgd2lzZSA9IEB0YXJnZXQud2lzZVxuICAgIEBtdXRhdGlvbk1hbmFnZXIucmVzdG9yZUN1cnNvclBvc2l0aW9ucyh7c3RheSwgd2lzZSwgQG9jY3VycmVuY2VTZWxlY3RlZCwgQHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlfSlcbiAgICBAZW1pdERpZFJlc3RvcmVDdXJzb3JQb3NpdGlvbnMoe3N0YXl9KVxuXG4jIFNlbGVjdFxuIyBXaGVuIHRleHQtb2JqZWN0IGlzIGludm9rZWQgZnJvbSBub3JtYWwgb3Igdml1c2FsLW1vZGUsIG9wZXJhdGlvbiB3b3VsZCBiZVxuIyAgPT4gU2VsZWN0IG9wZXJhdG9yIHdpdGggdGFyZ2V0PXRleHQtb2JqZWN0XG4jIFdoZW4gbW90aW9uIGlzIGludm9rZWQgZnJvbSB2aXN1YWwtbW9kZSwgb3BlcmF0aW9uIHdvdWxkIGJlXG4jICA9PiBTZWxlY3Qgb3BlcmF0b3Igd2l0aCB0YXJnZXQ9bW90aW9uKVxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgU2VsZWN0IGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZChmYWxzZSlcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHJlY29yZGFibGU6IGZhbHNlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2U6IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IGZhbHNlXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAc3RhcnRNdXRhdGlvbihAc2VsZWN0VGFyZ2V0LmJpbmQodGhpcykpXG5cbiAgICBpZiBAdGFyZ2V0LmlzVGV4dE9iamVjdCgpIGFuZCBAdGFyZ2V0LnNlbGVjdFN1Y2NlZWRlZFxuICAgICAgQGVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKClcbiAgICAgIEBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeSgndmlzdWFsJywgQHRhcmdldC53aXNlKVxuXG5jbGFzcyBTZWxlY3RMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBTZWxlY3RcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTZWxlY3QgbGF0ZXN0IHlhbmtlZCBvciBjaGFuZ2VkIHJhbmdlXCJcbiAgdGFyZ2V0OiAnQUxhdGVzdENoYW5nZSdcblxuY2xhc3MgU2VsZWN0UHJldmlvdXNTZWxlY3Rpb24gZXh0ZW5kcyBTZWxlY3RcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJQcmV2aW91c1NlbGVjdGlvblwiXG5cbmNsYXNzIFNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBTZWxlY3RcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTZWxlY3QgcGVyc2lzdGVudC1zZWxlY3Rpb24gYW5kIGNsZWFyIGFsbCBwZXJzaXN0ZW50LXNlbGVjdGlvbiwgaXQncyBsaWtlIGNvbnZlcnQgdG8gcmVhbC1zZWxlY3Rpb25cIlxuICB0YXJnZXQ6IFwiQVBlcnNpc3RlbnRTZWxlY3Rpb25cIlxuXG5jbGFzcyBTZWxlY3RPY2N1cnJlbmNlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJBZGQgc2VsZWN0aW9uIG9udG8gZWFjaCBtYXRjaGluZyB3b3JkIHdpdGhpbiB0YXJnZXQgcmFuZ2VcIlxuICBvY2N1cnJlbmNlOiB0cnVlXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAc3RhcnRNdXRhdGlvbiA9PlxuICAgICAgaWYgQHNlbGVjdFRhcmdldCgpXG4gICAgICAgIEBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeSgndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnKVxuXG4jIFBlcnNpc3RlbnQgU2VsZWN0aW9uXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENyZWF0ZVBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHN0YXlBdFNhbWVQb3NpdGlvbjogdHJ1ZVxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlOiBmYWxzZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uOiBmYWxzZVxuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5tYXJrQnVmZmVyUmFuZ2Uoc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkpXG5cbmNsYXNzIFRvZ2dsZVBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uXG4gIEBleHRlbmQoKVxuXG4gIGlzQ29tcGxldGU6IC0+XG4gICAgcG9pbnQgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBAbWFya2VyVG9SZW1vdmUgPSBAcGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJBdFBvaW50KHBvaW50KVxuICAgIGlmIEBtYXJrZXJUb1JlbW92ZVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIHN1cGVyXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAbWFya2VyVG9SZW1vdmVcbiAgICAgIEBtYXJrZXJUb1JlbW92ZS5kZXN0cm95KClcbiAgICBlbHNlXG4gICAgICBzdXBlclxuXG4jIFByZXNldCBPY2N1cnJlbmNlXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFRvZ2dsZVByZXNldE9jY3VycmVuY2UgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHJlcXVpcmVUYXJnZXQ6IGZhbHNlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2U6IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IGZhbHNlXG4gIG9jY3VycmVuY2VUeXBlOiAnYmFzZSdcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIG1hcmtlciA9IEBvY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJBdFBvaW50KEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5kZXN0cm95TWFya2VycyhbbWFya2VyXSlcbiAgICBlbHNlXG4gICAgICBwYXR0ZXJuID0gbnVsbFxuICAgICAgaXNOYXJyb3dlZCA9IEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5pc05hcnJvd2VkKClcblxuICAgICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIG5vdCBpc05hcnJvd2VkXG4gICAgICAgIEBvY2N1cnJlbmNlVHlwZSA9ICdiYXNlJ1xuICAgICAgICBwYXR0ZXJuID0gbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cChAZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpKSwgJ2cnKVxuICAgICAgZWxzZVxuICAgICAgICBwYXR0ZXJuID0gQGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShAb2NjdXJyZW5jZVR5cGUpXG5cbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHBhdHRlcm4sIHtAb2NjdXJyZW5jZVR5cGV9KVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLnNhdmVMYXN0UGF0dGVybihAb2NjdXJyZW5jZVR5cGUpXG5cbiAgICAgIEBhY3RpdmF0ZU1vZGUoJ25vcm1hbCcpIHVubGVzcyBpc05hcnJvd2VkXG5cbmNsYXNzIFRvZ2dsZVByZXNldFN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZVxuICBAZXh0ZW5kKClcbiAgb2NjdXJyZW5jZVR5cGU6ICdzdWJ3b3JkJ1xuXG4jIFdhbnQgdG8gcmVuYW1lIFJlc3RvcmVPY2N1cnJlbmNlTWFya2VyXG5jbGFzcyBBZGRQcmVzZXRPY2N1cnJlbmNlRnJvbUxhc3RPY2N1cnJlbmNlUGF0dGVybiBleHRlbmRzIFRvZ2dsZVByZXNldE9jY3VycmVuY2VcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKVxuICAgIGlmIHBhdHRlcm4gPSBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0T2NjdXJyZW5jZVBhdHRlcm4nKVxuICAgICAgb2NjdXJyZW5jZVR5cGUgPSBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KFwibGFzdE9jY3VycmVuY2VUeXBlXCIpXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihwYXR0ZXJuLCB7b2NjdXJyZW5jZVR5cGV9KVxuICAgICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJylcblxuIyBEZWxldGVcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIERlbGV0ZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICB0cmFja0NoYW5nZTogdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQ6ICdkaWQtc2VsZWN0LW9jY3VycmVuY2UnXG4gIGZsYXNoVHlwZUZvck9jY3VycmVuY2U6ICdvcGVyYXRvci1yZW1vdmUtb2NjdXJyZW5jZSdcbiAgc3RheU9wdGlvbk5hbWU6ICdzdGF5T25EZWxldGUnXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlOiB0cnVlXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAdGFyZ2V0Lndpc2UgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIEByZXN0b3JlUG9zaXRpb25zID0gZmFsc2VcbiAgICBzdXBlclxuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgPT5cbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIHNlbGVjdGlvbi5kZWxldGVTZWxlY3RlZFRleHQoKVxuXG5jbGFzcyBEZWxldGVSaWdodCBleHRlbmRzIERlbGV0ZVxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiAnTW92ZVJpZ2h0J1xuXG5jbGFzcyBEZWxldGVMZWZ0IGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlTGVmdCdcblxuY2xhc3MgRGVsZXRlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lJ1xuXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgQHRhcmdldC53aXNlIGlzICdibG9ja3dpc2UnXG4gICAgICBAb25EaWRTZWxlY3RUYXJnZXQgPT5cbiAgICAgICAgZm9yIGJsb2Nrd2lzZVNlbGVjdGlvbiBpbiBAZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpXG4gICAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLmV4dGVuZE1lbWJlclNlbGVjdGlvbnNUb0VuZE9mTGluZSgpXG4gICAgc3VwZXJcblxuY2xhc3MgRGVsZXRlTGluZSBleHRlbmRzIERlbGV0ZVxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICB0YXJnZXQ6IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcblxuIyBZYW5rXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFlhbmsgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgdHJhY2tDaGFuZ2U6IHRydWVcbiAgc3RheU9wdGlvbk5hbWU6ICdzdGF5T25ZYW5rJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuXG5jbGFzcyBZYW5rTGluZSBleHRlbmRzIFlhbmtcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgdGFyZ2V0OiBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG5cbmNsYXNzIFlhbmtUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBZYW5rXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lJ1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgW2N0cmwtYV1cbmNsYXNzIEluY3JlYXNlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJFbXB0eVwiICMgY3RybC1hIGluIG5vcm1hbC1tb2RlIGZpbmQgdGFyZ2V0IG51bWJlciBpbiBjdXJyZW50IGxpbmUgbWFudWFsbHlcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlICMgZG8gbWFudWFsbHlcbiAgcmVzdG9yZVBvc2l0aW9uczogZmFsc2UgIyBkbyBtYW51YWxseVxuICBzdGVwOiAxXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAbmV3UmFuZ2VzID0gW11cbiAgICBzdXBlclxuICAgIGlmIEBuZXdSYW5nZXMubGVuZ3RoXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZScpIGFuZCAoQGdldE5hbWUoKSBub3QgaW4gQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGVCbGFja2xpc3QnKSlcbiAgICAgICAgQHZpbVN0YXRlLmZsYXNoKEBuZXdSYW5nZXMsIHR5cGU6IEBmbGFzaFR5cGVGb3JPY2N1cnJlbmNlKVxuXG4gIHJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlOiAoc2NhblJhbmdlLCBmbj1udWxsKSAtPlxuICAgIG5ld1JhbmdlcyA9IFtdXG4gICAgQHBhdHRlcm4gPz0gLy8vI3tAZ2V0Q29uZmlnKCdudW1iZXJSZWdleCcpfS8vL2dcbiAgICBAc2NhbkZvcndhcmQgQHBhdHRlcm4sIHtzY2FuUmFuZ2V9LCAoZXZlbnQpID0+XG4gICAgICByZXR1cm4gaWYgZm4/IGFuZCBub3QgZm4oZXZlbnQpXG4gICAgICB7bWF0Y2hUZXh0LCByZXBsYWNlfSA9IGV2ZW50XG4gICAgICBuZXh0TnVtYmVyID0gQGdldE5leHROdW1iZXIobWF0Y2hUZXh0KVxuICAgICAgbmV3UmFuZ2VzLnB1c2gocmVwbGFjZShTdHJpbmcobmV4dE51bWJlcikpKVxuICAgIG5ld1Jhbmdlc1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGlmIEB0YXJnZXQuaXMoJ0VtcHR5JykgIyBjdHJsLWEsIGN0cmwteCBpbiBgbm9ybWFsLW1vZGVgXG4gICAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBzY2FuUmFuZ2UgPSBAZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KGN1cnNvclBvc2l0aW9uLnJvdylcbiAgICAgIG5ld1JhbmdlcyA9IEByZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZSBzY2FuUmFuZ2UsICh7cmFuZ2UsIHN0b3B9KSAtPlxuICAgICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihjdXJzb3JQb3NpdGlvbilcbiAgICAgICAgICBzdG9wKClcbiAgICAgICAgICB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmYWxzZVxuXG4gICAgICBwb2ludCA9IG5ld1Jhbmdlc1swXT8uZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSA/IGN1cnNvclBvc2l0aW9uXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgZWxzZVxuICAgICAgc2NhblJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIEBuZXdSYW5nZXMucHVzaChAcmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2Uoc2NhblJhbmdlKS4uLilcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihzY2FuUmFuZ2Uuc3RhcnQpXG5cbiAgZ2V0TmV4dE51bWJlcjogKG51bWJlclN0cmluZykgLT5cbiAgICBOdW1iZXIucGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMCkgKyBAc3RlcCAqIEBnZXRDb3VudCgpXG5cbiMgW2N0cmwteF1cbmNsYXNzIERlY3JlYXNlIGV4dGVuZHMgSW5jcmVhc2VcbiAgQGV4dGVuZCgpXG4gIHN0ZXA6IC0xXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBbZyBjdHJsLWFdXG5jbGFzcyBJbmNyZW1lbnROdW1iZXIgZXh0ZW5kcyBJbmNyZWFzZVxuICBAZXh0ZW5kKClcbiAgYmFzZU51bWJlcjogbnVsbFxuICB0YXJnZXQ6IG51bGxcbiAgbXV0YXRlU2VsZWN0aW9uT3JkZXJkOiB0cnVlXG5cbiAgZ2V0TmV4dE51bWJlcjogKG51bWJlclN0cmluZykgLT5cbiAgICBpZiBAYmFzZU51bWJlcj9cbiAgICAgIEBiYXNlTnVtYmVyICs9IEBzdGVwICogQGdldENvdW50KClcbiAgICBlbHNlXG4gICAgICBAYmFzZU51bWJlciA9IE51bWJlci5wYXJzZUludChudW1iZXJTdHJpbmcsIDEwKVxuICAgIEBiYXNlTnVtYmVyXG5cbiMgW2cgY3RybC14XVxuY2xhc3MgRGVjcmVtZW50TnVtYmVyIGV4dGVuZHMgSW5jcmVtZW50TnVtYmVyXG4gIEBleHRlbmQoKVxuICBzdGVwOiAtMVxuXG4jIFB1dFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEN1cnNvciBwbGFjZW1lbnQ6XG4jIC0gcGxhY2UgYXQgZW5kIG9mIG11dGF0aW9uOiBwYXN0ZSBub24tbXVsdGlsaW5lIGNoYXJhY3Rlcndpc2UgdGV4dFxuIyAtIHBsYWNlIGF0IHN0YXJ0IG9mIG11dGF0aW9uOiBub24tbXVsdGlsaW5lIGNoYXJhY3Rlcndpc2UgdGV4dChjaGFyYWN0ZXJ3aXNlLCBsaW5ld2lzZSlcbmNsYXNzIFB1dEJlZm9yZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBsb2NhdGlvbjogJ2JlZm9yZSdcbiAgdGFyZ2V0OiAnRW1wdHknXG4gIGZsYXNoVHlwZTogJ29wZXJhdG9yLWxvbmcnXG4gIHJlc3RvcmVQb3NpdGlvbnM6IGZhbHNlICMgbWFuYWdlIG1hbnVhbGx5XG4gIGZsYXNoVGFyZ2V0OiB0cnVlICMgbWFuYWdlIG1hbnVhbGx5XG4gIHRyYWNrQ2hhbmdlOiBmYWxzZSAjIG1hbmFnZSBtYW51YWxseVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uID0gbmV3IE1hcCgpXG4gICAge3RleHQsIHR5cGV9ID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldChudWxsLCBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICByZXR1cm4gdW5sZXNzIHRleHRcbiAgICBAb25EaWRGaW5pc2hNdXRhdGlvbihAYWRqdXN0Q3Vyc29yUG9zaXRpb24uYmluZCh0aGlzKSlcblxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgIyBUcmFja0NoYW5nZVxuICAgICAgaWYgbmV3UmFuZ2UgPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgICAgICBAc2V0TWFya0ZvckNoYW5nZShuZXdSYW5nZSlcblxuICAgICAgIyBGbGFzaFxuICAgICAgaWYgQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGUnKSBhbmQgKEBnZXROYW1lKCkgbm90IGluIEBnZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlQmxhY2tsaXN0JykpXG4gICAgICAgIHRvUmFuZ2UgPSAoc2VsZWN0aW9uKSA9PiBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgICAgQHZpbVN0YXRlLmZsYXNoKEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLm1hcCh0b1JhbmdlKSwgdHlwZTogQGdldEZsYXNoVHlwZSgpKVxuXG4gICAgc3VwZXJcblxuICBhZGp1c3RDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgICAge3N0YXJ0LCBlbmR9ID0gbmV3UmFuZ2UgPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgIGlmIEBsaW5ld2lzZVBhc3RlXG4gICAgICAgIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCBzdGFydC5yb3cpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIG5ld1JhbmdlLmlzU2luZ2xlTGluZSgpXG4gICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGVuZC50cmFuc2xhdGUoWzAsIC0xXSkpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc3RhcnQpXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHt0ZXh0LCB0eXBlfSA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXQobnVsbCwgc2VsZWN0aW9uKVxuICAgIHRleHQgPSBfLm11bHRpcGx5U3RyaW5nKHRleHQsIEBnZXRDb3VudCgpKVxuICAgIEBsaW5ld2lzZVBhc3RlID0gdHlwZSBpcyAnbGluZXdpc2UnIG9yIEBpc01vZGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgbmV3UmFuZ2UgPSBAcGFzdGUoc2VsZWN0aW9uLCB0ZXh0LCB7QGxpbmV3aXNlUGFzdGV9KVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBuZXdSYW5nZSlcblxuICBwYXN0ZTogKHNlbGVjdGlvbiwgdGV4dCwge2xpbmV3aXNlUGFzdGV9KSAtPlxuICAgIGlmIGxpbmV3aXNlUGFzdGVcbiAgICAgIEBwYXN0ZUxpbmV3aXNlKHNlbGVjdGlvbiwgdGV4dClcbiAgICBlbHNlXG4gICAgICBAcGFzdGVDaGFyYWN0ZXJ3aXNlKHNlbGVjdGlvbiwgdGV4dClcblxuICBwYXN0ZUNoYXJhY3Rlcndpc2U6IChzZWxlY3Rpb24sIHRleHQpIC0+XG4gICAge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpIGFuZCBAbG9jYXRpb24gaXMgJ2FmdGVyJyBhbmQgbm90IGlzRW1wdHlSb3coQGVkaXRvciwgY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgcmV0dXJuIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG5cbiAgIyBSZXR1cm4gbmV3UmFuZ2VcbiAgcGFzdGVMaW5ld2lzZTogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIHRleHQgKz0gXCJcXG5cIiB1bmxlc3MgdGV4dC5lbmRzV2l0aChcIlxcblwiKVxuICAgIG5ld1JhbmdlID0gbnVsbFxuICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgIGlmIEBsb2NhdGlvbiBpcyAnYmVmb3JlJ1xuICAgICAgICBuZXdSYW5nZSA9IGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIFtjdXJzb3JSb3csIDBdLCB0ZXh0KVxuICAgICAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCBuZXdSYW5nZS5zdGFydC5yb3cpXG4gICAgICBlbHNlIGlmIEBsb2NhdGlvbiBpcyAnYWZ0ZXInXG4gICAgICAgIGVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyhAZWRpdG9yLCBjdXJzb3JSb3cpXG4gICAgICAgIG5ld1JhbmdlID0gaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgW2N1cnNvclJvdyArIDEsIDBdLCB0ZXh0KVxuICAgIGVsc2VcbiAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXFxuXCIpIHVubGVzcyBAaXNNb2RlKCd2aXN1YWwnLCAnbGluZXdpc2UnKVxuICAgICAgbmV3UmFuZ2UgPSBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuXG4gICAgcmV0dXJuIG5ld1JhbmdlXG5cbmNsYXNzIFB1dEFmdGVyIGV4dGVuZHMgUHV0QmVmb3JlXG4gIEBleHRlbmQoKVxuICBsb2NhdGlvbjogJ2FmdGVyJ1xuXG5jbGFzcyBBZGRCbGFua0xpbmVCZWxvdyBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgdGFyZ2V0OiBcIkVtcHR5XCJcbiAgc3RheUF0U2FtZVBvc2l0aW9uOiB0cnVlXG4gIHN0YXlCeU1hcmtlcjogdHJ1ZVxuICB3aGVyZTogJ2JlbG93J1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICByb3cgPSBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKCkucm93XG4gICAgcm93ICs9IDEgaWYgQHdoZXJlIGlzICdiZWxvdydcbiAgICBwb2ludCA9IFtyb3csIDBdXG4gICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbcG9pbnQsIHBvaW50XSwgXCJcXG5cIi5yZXBlYXQoQGdldENvdW50KCkpKVxuXG5jbGFzcyBBZGRCbGFua0xpbmVBYm92ZSBleHRlbmRzIEFkZEJsYW5rTGluZUJlbG93XG4gIEBleHRlbmQoKVxuICB3aGVyZTogJ2Fib3ZlJ1xuIl19
