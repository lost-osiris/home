(function() {
  var Disposable, KeymapManager, Point, Range, TextData, VimEditor, _, buildKeydownEvent, buildKeydownEventFromKeystroke, buildTextInputEvent, collectCharPositionsInText, collectIndexInText, dispatch, getView, getVimState, globalState, inspect, isPoint, isRange, normalizeKeystrokes, rawKeystroke, ref, semver, supportedModeClass, toArray, toArrayOfPoint, toArrayOfRange, withMockPlatform,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  semver = require('semver');

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  inspect = require('util').inspect;

  globalState = require('../lib/global-state');

  KeymapManager = atom.keymaps.constructor;

  normalizeKeystrokes = require(atom.config.resourcePath + "/node_modules/atom-keymap/lib/helpers").normalizeKeystrokes;

  supportedModeClass = ['normal-mode', 'visual-mode', 'insert-mode', 'replace', 'linewise', 'blockwise', 'characterwise'];

  beforeEach(function() {
    return globalState.reset();
  });

  getView = function(model) {
    return atom.views.getView(model);
  };

  dispatch = function(target, command) {
    return atom.commands.dispatch(target, command);
  };

  withMockPlatform = function(target, platform, fn) {
    var wrapper;
    wrapper = document.createElement('div');
    wrapper.className = platform;
    wrapper.appendChild(target);
    fn();
    return target.parentNode.removeChild(target);
  };

  buildKeydownEvent = function(key, options) {
    return KeymapManager.buildKeydownEvent(key, options);
  };

  buildKeydownEventFromKeystroke = function(keystroke, target) {
    var j, key, len, modifier, options, part, parts;
    modifier = ['ctrl', 'alt', 'shift', 'cmd'];
    parts = keystroke === '-' ? ['-'] : keystroke.split('-');
    options = {
      target: target
    };
    key = null;
    for (j = 0, len = parts.length; j < len; j++) {
      part = parts[j];
      if (indexOf.call(modifier, part) >= 0) {
        options[part] = true;
      } else {
        key = part;
      }
    }
    if (semver.satisfies(atom.getVersion(), '< 1.12')) {
      if (key === 'space') {
        key = ' ';
      }
    }
    return buildKeydownEvent(key, options);
  };

  buildTextInputEvent = function(key) {
    var event, eventArgs;
    eventArgs = [true, true, window, key];
    event = document.createEvent('TextEvent');
    event.initTextEvent.apply(event, ["textInput"].concat(slice.call(eventArgs)));
    return event;
  };

  rawKeystroke = function(keystrokes, target) {
    var event, j, key, len, ref1, results;
    ref1 = normalizeKeystrokes(keystrokes).split(/\s+/);
    results = [];
    for (j = 0, len = ref1.length; j < len; j++) {
      key = ref1[j];
      event = buildKeydownEventFromKeystroke(key, target);
      results.push(atom.keymaps.handleKeyboardEvent(event));
    }
    return results;
  };

  isPoint = function(obj) {
    if (obj instanceof Point) {
      return true;
    } else {
      return obj.length === 2 && _.isNumber(obj[0]) && _.isNumber(obj[1]);
    }
  };

  isRange = function(obj) {
    if (obj instanceof Range) {
      return true;
    } else {
      return _.all([_.isArray(obj), obj.length === 2, isPoint(obj[0]), isPoint(obj[1])]);
    }
  };

  toArray = function(obj, cond) {
    if (cond == null) {
      cond = null;
    }
    if (_.isArray(cond != null ? cond : obj)) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfPoint = function(obj) {
    if (_.isArray(obj) && isPoint(obj[0])) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfRange = function(obj) {
    if (_.isArray(obj) && _.all(obj.map(function(e) {
      return isRange(e);
    }))) {
      return obj;
    } else {
      return [obj];
    }
  };

  getVimState = function() {
    var args, callback, editor, file, ref1;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    ref1 = [], editor = ref1[0], file = ref1[1], callback = ref1[2];
    switch (args.length) {
      case 1:
        callback = args[0];
        break;
      case 2:
        file = args[0], callback = args[1];
    }
    waitsForPromise(function() {
      return atom.packages.activatePackage('vim-mode-plus');
    });
    waitsForPromise(function() {
      if (file) {
        file = atom.project.resolvePath(file);
      }
      return atom.workspace.open(file).then(function(e) {
        return editor = e;
      });
    });
    return runs(function() {
      var main, vimState;
      main = atom.packages.getActivePackage('vim-mode-plus').mainModule;
      vimState = main.getEditorState(editor);
      return callback(vimState, new VimEditor(vimState));
    });
  };

  TextData = (function() {
    function TextData(rawData) {
      this.rawData = rawData;
      this.lines = this.rawData.split("\n");
    }

    TextData.prototype.getLines = function(lines, arg) {
      var chomp, line, text;
      chomp = (arg != null ? arg : {}).chomp;
      if (chomp == null) {
        chomp = false;
      }
      text = ((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = lines.length; j < len; j++) {
          line = lines[j];
          results.push(this.lines[line]);
        }
        return results;
      }).call(this)).join("\n");
      if (chomp) {
        return text;
      } else {
        return text + "\n";
      }
    };

    TextData.prototype.getRaw = function() {
      return this.rawData;
    };

    return TextData;

  })();

  collectIndexInText = function(char, text) {
    var fromIndex, index, indexes;
    indexes = [];
    fromIndex = 0;
    while ((index = text.indexOf(char, fromIndex)) >= 0) {
      fromIndex = index + 1;
      indexes.push(index);
    }
    return indexes;
  };

  collectCharPositionsInText = function(char, text) {
    var i, index, j, l, len, len1, lineText, positions, ref1, ref2, rowNumber;
    positions = [];
    ref1 = text.split(/\n/);
    for (rowNumber = j = 0, len = ref1.length; j < len; rowNumber = ++j) {
      lineText = ref1[rowNumber];
      ref2 = collectIndexInText(char, lineText);
      for (i = l = 0, len1 = ref2.length; l < len1; i = ++l) {
        index = ref2[i];
        positions.push([rowNumber, index - i]);
      }
    }
    return positions;
  };

  VimEditor = (function() {
    var ensureExclusiveRules, ensureOptionsOrdered, setExclusiveRules, setOptionsOrdered;

    function VimEditor(vimState1) {
      var ref1;
      this.vimState = vimState1;
      this.keystroke = bind(this.keystroke, this);
      this.ensureByDispatch = bind(this.ensureByDispatch, this);
      this.bindEnsureOption = bind(this.bindEnsureOption, this);
      this.ensure = bind(this.ensure, this);
      this.set = bind(this.set, this);
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
    }

    VimEditor.prototype.validateOptions = function(options, validOptions, message) {
      var invalidOptions;
      invalidOptions = _.without.apply(_, [_.keys(options)].concat(slice.call(validOptions)));
      if (invalidOptions.length) {
        throw new Error(message + ": " + (inspect(invalidOptions)));
      }
    };

    VimEditor.prototype.validateExclusiveOptions = function(options, rules) {
      var allOptions, exclusiveOptions, option, results, violatingOptions;
      allOptions = Object.keys(options);
      results = [];
      for (option in rules) {
        exclusiveOptions = rules[option];
        if (!(option in options)) {
          continue;
        }
        violatingOptions = exclusiveOptions.filter(function(exclusiveOption) {
          return indexOf.call(allOptions, exclusiveOption) >= 0;
        });
        if (violatingOptions.length) {
          throw new Error(option + " is exclusive with [" + violatingOptions + "]");
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    setOptionsOrdered = ['text', 'text_', 'textC', 'textC_', 'grammar', 'cursor', 'cursorScreen', 'addCursor', 'cursorScreen', 'register', 'selectedBufferRange'];

    setExclusiveRules = {
      textC: ['cursor', 'cursorScreen'],
      textC_: ['cursor', 'cursorScreen']
    };

    VimEditor.prototype.set = function(options) {
      var j, len, method, name, results;
      this.validateOptions(options, setOptionsOrdered, 'Invalid set options');
      this.validateExclusiveOptions(options, setExclusiveRules);
      results = [];
      for (j = 0, len = setOptionsOrdered.length; j < len; j++) {
        name = setOptionsOrdered[j];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'set' + _.capitalize(_.camelize(name));
        results.push(this[method](options[name]));
      }
      return results;
    };

    VimEditor.prototype.setText = function(text) {
      return this.editor.setText(text);
    };

    VimEditor.prototype.setText_ = function(text) {
      return this.setText(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.setTextC = function(text) {
      var cursors, lastCursor;
      cursors = collectCharPositionsInText('|', text.replace(/!/g, ''));
      lastCursor = collectCharPositionsInText('!', text.replace(/\|/g, ''));
      this.setText(text.replace(/[\|!]/g, ''));
      cursors = cursors.concat(lastCursor);
      if (cursors.length) {
        return this.setCursor(cursors);
      }
    };

    VimEditor.prototype.setTextC_ = function(text) {
      return this.setTextC(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.setGrammar = function(scope) {
      return this.editor.setGrammar(atom.grammars.grammarForScopeName(scope));
    };

    VimEditor.prototype.setCursor = function(points) {
      var j, len, point, results;
      points = toArrayOfPoint(points);
      this.editor.setCursorBufferPosition(points.shift());
      results = [];
      for (j = 0, len = points.length; j < len; j++) {
        point = points[j];
        results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setCursorScreen = function(points) {
      var j, len, point, results;
      points = toArrayOfPoint(points);
      this.editor.setCursorScreenPosition(points.shift());
      results = [];
      for (j = 0, len = points.length; j < len; j++) {
        point = points[j];
        results.push(this.editor.addCursorAtScreenPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setAddCursor = function(points) {
      var j, len, point, ref1, results;
      ref1 = toArrayOfPoint(points);
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        point = ref1[j];
        results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setRegister = function(register) {
      var name, results, value;
      results = [];
      for (name in register) {
        value = register[name];
        results.push(this.vimState.register.set(name, value));
      }
      return results;
    };

    VimEditor.prototype.setSelectedBufferRange = function(range) {
      return this.editor.setSelectedBufferRange(range);
    };

    ensureOptionsOrdered = ['text', 'text_', 'textC', 'textC_', 'selectedText', 'selectedText_', 'selectedTextOrdered', "selectionIsNarrowed", 'cursor', 'cursorScreen', 'numCursors', 'register', 'selectedScreenRange', 'selectedScreenRangeOrdered', 'selectedBufferRange', 'selectedBufferRangeOrdered', 'selectionIsReversed', 'persistentSelectionBufferRange', 'persistentSelectionCount', 'occurrenceCount', 'occurrenceText', 'propertyHead', 'propertyTail', 'scrollTop', 'mark', 'mode'];

    ensureExclusiveRules = {
      textC: ['cursor', 'cursorScreen'],
      textC_: ['cursor', 'cursorScreen']
    };

    VimEditor.prototype.getAndDeleteKeystrokeOptions = function(options) {
      var partialMatchTimeout;
      partialMatchTimeout = options.partialMatchTimeout;
      delete options.partialMatchTimeout;
      return {
        partialMatchTimeout: partialMatchTimeout
      };
    };

    VimEditor.prototype.ensure = function() {
      var args, j, keystroke, keystrokeOptions, len, method, name, options, results;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      switch (args.length) {
        case 1:
          options = args[0];
          break;
        case 2:
          keystroke = args[0], options = args[1];
      }
      if (typeof options !== 'object') {
        throw new Error("Invalid options for 'ensure': must be 'object' but got '" + (typeof options) + "'");
      }
      if ((keystroke != null) && !(typeof keystroke === 'string' || Array.isArray(keystroke))) {
        throw new Error("Invalid keystroke for 'ensure': must be 'string' or 'array' but got '" + (typeof keystroke) + "'");
      }
      keystrokeOptions = this.getAndDeleteKeystrokeOptions(options);
      this.validateOptions(options, ensureOptionsOrdered, 'Invalid ensure option');
      this.validateExclusiveOptions(options, ensureExclusiveRules);
      if (!_.isEmpty(keystroke)) {
        this.keystroke(keystroke, keystrokeOptions);
      }
      results = [];
      for (j = 0, len = ensureOptionsOrdered.length; j < len; j++) {
        name = ensureOptionsOrdered[j];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'ensure' + _.capitalize(_.camelize(name));
        results.push(this[method](options[name]));
      }
      return results;
    };

    VimEditor.prototype.bindEnsureOption = function(optionsBase) {
      return (function(_this) {
        return function(keystroke, options) {
          var intersectingOptions;
          intersectingOptions = _.intersection(_.keys(options), _.keys(optionsBase));
          if (intersectingOptions.length) {
            throw new Error("conflict with bound options " + (inspect(intersectingOptions)));
          }
          return _this.ensure(keystroke, _.defaults(_.clone(options), optionsBase));
        };
      })(this);
    };

    VimEditor.prototype.ensureByDispatch = function(command, options) {
      var j, len, method, name, results;
      dispatch(atom.views.getView(this.editor), command);
      results = [];
      for (j = 0, len = ensureOptionsOrdered.length; j < len; j++) {
        name = ensureOptionsOrdered[j];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'ensure' + _.capitalize(_.camelize(name));
        results.push(this[method](options[name]));
      }
      return results;
    };

    VimEditor.prototype.ensureText = function(text) {
      return expect(this.editor.getText()).toEqual(text);
    };

    VimEditor.prototype.ensureText_ = function(text) {
      return this.ensureText(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.ensureTextC = function(text) {
      var cursors, lastCursor;
      cursors = collectCharPositionsInText('|', text.replace(/!/g, ''));
      lastCursor = collectCharPositionsInText('!', text.replace(/\|/g, ''));
      cursors = cursors.concat(lastCursor);
      cursors = cursors.map(function(point) {
        return Point.fromObject(point);
      }).sort(function(a, b) {
        return a.compare(b);
      });
      this.ensureText(text.replace(/[\|!]/g, ''));
      if (cursors.length) {
        this.ensureCursor(cursors, true);
      }
      if (lastCursor.length) {
        return expect(this.editor.getCursorBufferPosition()).toEqual(lastCursor[0]);
      }
    };

    VimEditor.prototype.ensureTextC_ = function(text) {
      return this.ensureTextC(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.ensureSelectedText = function(text, ordered) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = selections.length; j < len; j++) {
          s = selections[j];
          results.push(s.getText());
        }
        return results;
      })();
      return expect(actual).toEqual(toArray(text));
    };

    VimEditor.prototype.ensureSelectedText_ = function(text, ordered) {
      return this.ensureSelectedText(text.replace(/_/g, ' '), ordered);
    };

    VimEditor.prototype.ensureSelectionIsNarrowed = function(isNarrowed) {
      var actual;
      actual = this.vimState.modeManager.isNarrowed();
      return expect(actual).toEqual(isNarrowed);
    };

    VimEditor.prototype.ensureSelectedTextOrdered = function(text) {
      return this.ensureSelectedText(text, true);
    };

    VimEditor.prototype.ensureCursor = function(points, ordered) {
      var actual;
      if (ordered == null) {
        ordered = false;
      }
      actual = this.editor.getCursorBufferPositions();
      actual = actual.sort(function(a, b) {
        if (ordered) {
          return a.compare(b);
        }
      });
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureCursorScreen = function(points) {
      var actual;
      actual = this.editor.getCursorScreenPositions();
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureRegister = function(register) {
      var _value, ensure, name, property, reg, results, selection;
      results = [];
      for (name in register) {
        ensure = register[name];
        selection = ensure.selection;
        delete ensure.selection;
        reg = this.vimState.register.get(name, selection);
        results.push((function() {
          var results1;
          results1 = [];
          for (property in ensure) {
            _value = ensure[property];
            results1.push(expect(reg[property]).toEqual(_value));
          }
          return results1;
        })());
      }
      return results;
    };

    VimEditor.prototype.ensureNumCursors = function(number) {
      return expect(this.editor.getCursors()).toHaveLength(number);
    };

    VimEditor.prototype._ensureSelectedRangeBy = function(range, ordered, fn) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = selections.length; j < len; j++) {
          s = selections[j];
          results.push(fn(s));
        }
        return results;
      })();
      return expect(actual).toEqual(toArrayOfRange(range));
    };

    VimEditor.prototype.ensureSelectedScreenRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getScreenRange();
      });
    };

    VimEditor.prototype.ensureSelectedScreenRangeOrdered = function(range) {
      return this.ensureSelectedScreenRange(range, true);
    };

    VimEditor.prototype.ensureSelectedBufferRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getBufferRange();
      });
    };

    VimEditor.prototype.ensureSelectedBufferRangeOrdered = function(range) {
      return this.ensureSelectedBufferRange(range, true);
    };

    VimEditor.prototype.ensureSelectionIsReversed = function(reversed) {
      var actual, j, len, ref1, results, selection;
      ref1 = this.editor.getSelections();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        actual = selection.isReversed();
        results.push(expect(actual).toBe(reversed));
      }
      return results;
    };

    VimEditor.prototype.ensurePersistentSelectionBufferRange = function(range) {
      var actual;
      actual = this.vimState.persistentSelection.getMarkerBufferRanges();
      return expect(actual).toEqual(toArrayOfRange(range));
    };

    VimEditor.prototype.ensurePersistentSelectionCount = function(number) {
      var actual;
      actual = this.vimState.persistentSelection.getMarkerCount();
      return expect(actual).toBe(number);
    };

    VimEditor.prototype.ensureOccurrenceCount = function(number) {
      var actual;
      actual = this.vimState.occurrenceManager.getMarkerCount();
      return expect(actual).toBe(number);
    };

    VimEditor.prototype.ensureOccurrenceText = function(text) {
      var actual, markers, r, ranges;
      markers = this.vimState.occurrenceManager.getMarkers();
      ranges = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = markers.length; j < len; j++) {
          r = markers[j];
          results.push(r.getBufferRange());
        }
        return results;
      })();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = ranges.length; j < len; j++) {
          r = ranges[j];
          results.push(this.editor.getTextInBufferRange(r));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArray(text));
    };

    VimEditor.prototype.ensurePropertyHead = function(points) {
      var actual, getHeadProperty, s;
      getHeadProperty = (function(_this) {
        return function(selection) {
          return _this.vimState.swrap(selection).getBufferPositionFor('head', {
            from: ['property']
          });
        };
      })(this);
      actual = (function() {
        var j, len, ref1, results;
        ref1 = this.editor.getSelections();
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          s = ref1[j];
          results.push(getHeadProperty(s));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensurePropertyTail = function(points) {
      var actual, getTailProperty, s;
      getTailProperty = (function(_this) {
        return function(selection) {
          return _this.vimState.swrap(selection).getBufferPositionFor('tail', {
            from: ['property']
          });
        };
      })(this);
      actual = (function() {
        var j, len, ref1, results;
        ref1 = this.editor.getSelections();
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          s = ref1[j];
          results.push(getTailProperty(s));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureScrollTop = function(scrollTop) {
      var actual;
      actual = this.editorElement.getScrollTop();
      return expect(actual).toEqual(scrollTop);
    };

    VimEditor.prototype.ensureMark = function(mark) {
      var actual, name, point, results;
      results = [];
      for (name in mark) {
        point = mark[name];
        actual = this.vimState.mark.get(name);
        results.push(expect(actual).toEqual(point));
      }
      return results;
    };

    VimEditor.prototype.ensureMode = function(mode) {
      var j, l, len, len1, m, ref1, results, shouldNotContainClasses;
      mode = toArray(mode).slice();
      expect((ref1 = this.vimState).isMode.apply(ref1, mode)).toBe(true);
      mode[0] = mode[0] + "-mode";
      mode = mode.filter(function(m) {
        return m;
      });
      expect(this.editorElement.classList.contains('vim-mode-plus')).toBe(true);
      for (j = 0, len = mode.length; j < len; j++) {
        m = mode[j];
        expect(this.editorElement.classList.contains(m)).toBe(true);
      }
      shouldNotContainClasses = _.difference(supportedModeClass, mode);
      results = [];
      for (l = 0, len1 = shouldNotContainClasses.length; l < len1; l++) {
        m = shouldNotContainClasses[l];
        results.push(expect(this.editorElement.classList.contains(m)).toBe(false));
      }
      return results;
    };

    VimEditor.prototype.keystroke = function(keys, options) {
      var _key, finished, j, k, l, len, len1, ref1, ref2, target;
      if (options == null) {
        options = {};
      }
      if (options.waitsForFinish) {
        finished = false;
        this.vimState.onDidFinishOperation(function() {
          return finished = true;
        });
        delete options.waitsForFinish;
        this.keystroke(keys, options);
        waitsFor(function() {
          return finished;
        });
        return;
      }
      target = this.editorElement;
      ref1 = toArray(keys);
      for (j = 0, len = ref1.length; j < len; j++) {
        k = ref1[j];
        if (_.isString(k)) {
          rawKeystroke(k, target);
        } else {
          switch (false) {
            case k.input == null:
              ref2 = k.input.split('');
              for (l = 0, len1 = ref2.length; l < len1; l++) {
                _key = ref2[l];
                rawKeystroke(_key, target);
              }
              break;
            case k.search == null:
              if (k.search) {
                this.vimState.searchInput.editor.insertText(k.search);
              }
              atom.commands.dispatch(this.vimState.searchInput.editorElement, 'core:confirm');
              break;
            default:
              rawKeystroke(k, target);
          }
        }
      }
      if (options.partialMatchTimeout) {
        return advanceClock(atom.keymaps.getPartialMatchTimeout());
      }
    };

    return VimEditor;

  })();

  module.exports = {
    getVimState: getVimState,
    getView: getView,
    dispatch: dispatch,
    TextData: TextData,
    withMockPlatform: withMockPlatform,
    rawKeystroke: rawKeystroke
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9zcGVjLWhlbHBlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhYQUFBO0lBQUE7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDVCxNQUE2QixPQUFBLENBQVEsTUFBUixDQUE3QixFQUFDLGlCQUFELEVBQVEsaUJBQVIsRUFBZTs7RUFDZCxVQUFXLE9BQUEsQ0FBUSxNQUFSOztFQUNaLFdBQUEsR0FBYyxPQUFBLENBQVEscUJBQVI7O0VBRWQsYUFBQSxHQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDOztFQUM1QixzQkFBdUIsT0FBQSxDQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWixHQUEyQix1Q0FBbkM7O0VBRXhCLGtCQUFBLEdBQXFCLENBQ25CLGFBRG1CLEVBRW5CLGFBRm1CLEVBR25CLGFBSG1CLEVBSW5CLFNBSm1CLEVBS25CLFVBTG1CLEVBTW5CLFdBTm1CLEVBT25CLGVBUG1COztFQVlyQixVQUFBLENBQVcsU0FBQTtXQUNULFdBQVcsQ0FBQyxLQUFaLENBQUE7RUFEUyxDQUFYOztFQUtBLE9BQUEsR0FBVSxTQUFDLEtBQUQ7V0FDUixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsS0FBbkI7RUFEUTs7RUFHVixRQUFBLEdBQVcsU0FBQyxNQUFELEVBQVMsT0FBVDtXQUNULElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixNQUF2QixFQUErQixPQUEvQjtFQURTOztFQUdYLGdCQUFBLEdBQW1CLFNBQUMsTUFBRCxFQUFTLFFBQVQsRUFBbUIsRUFBbkI7QUFDakIsUUFBQTtJQUFBLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtJQUNWLE9BQU8sQ0FBQyxTQUFS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ZDtJQUF1QixVQUFBLFFBQXZCO0lBQWlDLFVBQUEsUUFBakM7SUFBMkMsa0JBQUEsZ0JBQTNDO0lBQTZELGNBQUEsWUFBN0Q7O0FBN2RqQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5zZW12ZXIgPSByZXF1aXJlICdzZW12ZXInXG57UmFuZ2UsIFBvaW50LCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57aW5zcGVjdH0gPSByZXF1aXJlICd1dGlsJ1xuZ2xvYmFsU3RhdGUgPSByZXF1aXJlICcuLi9saWIvZ2xvYmFsLXN0YXRlJ1xuXG5LZXltYXBNYW5hZ2VyID0gYXRvbS5rZXltYXBzLmNvbnN0cnVjdG9yXG57bm9ybWFsaXplS2V5c3Ryb2tlc30gPSByZXF1aXJlKGF0b20uY29uZmlnLnJlc291cmNlUGF0aCArIFwiL25vZGVfbW9kdWxlcy9hdG9tLWtleW1hcC9saWIvaGVscGVyc1wiKVxuXG5zdXBwb3J0ZWRNb2RlQ2xhc3MgPSBbXG4gICdub3JtYWwtbW9kZSdcbiAgJ3Zpc3VhbC1tb2RlJ1xuICAnaW5zZXJ0LW1vZGUnXG4gICdyZXBsYWNlJ1xuICAnbGluZXdpc2UnXG4gICdibG9ja3dpc2UnXG4gICdjaGFyYWN0ZXJ3aXNlJ1xuXVxuXG4jIEluaXQgc3BlYyBzdGF0ZVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5iZWZvcmVFYWNoIC0+XG4gIGdsb2JhbFN0YXRlLnJlc2V0KClcblxuIyBVdGlsc1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5nZXRWaWV3ID0gKG1vZGVsKSAtPlxuICBhdG9tLnZpZXdzLmdldFZpZXcobW9kZWwpXG5cbmRpc3BhdGNoID0gKHRhcmdldCwgY29tbWFuZCkgLT5cbiAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0YXJnZXQsIGNvbW1hbmQpXG5cbndpdGhNb2NrUGxhdGZvcm0gPSAodGFyZ2V0LCBwbGF0Zm9ybSwgZm4pIC0+XG4gIHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICB3cmFwcGVyLmNsYXNzTmFtZSA9IHBsYXRmb3JtXG4gIHdyYXBwZXIuYXBwZW5kQ2hpbGQodGFyZ2V0KVxuICBmbigpXG4gIHRhcmdldC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRhcmdldClcblxuYnVpbGRLZXlkb3duRXZlbnQgPSAoa2V5LCBvcHRpb25zKSAtPlxuICBLZXltYXBNYW5hZ2VyLmJ1aWxkS2V5ZG93bkV2ZW50KGtleSwgb3B0aW9ucylcblxuYnVpbGRLZXlkb3duRXZlbnRGcm9tS2V5c3Ryb2tlID0gKGtleXN0cm9rZSwgdGFyZ2V0KSAtPlxuICBtb2RpZmllciA9IFsnY3RybCcsICdhbHQnLCAnc2hpZnQnLCAnY21kJ11cbiAgcGFydHMgPSBpZiBrZXlzdHJva2UgaXMgJy0nXG4gICAgWyctJ11cbiAgZWxzZVxuICAgIGtleXN0cm9rZS5zcGxpdCgnLScpXG5cbiAgb3B0aW9ucyA9IHt0YXJnZXR9XG4gIGtleSA9IG51bGxcbiAgZm9yIHBhcnQgaW4gcGFydHNcbiAgICBpZiBwYXJ0IGluIG1vZGlmaWVyXG4gICAgICBvcHRpb25zW3BhcnRdID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGtleSA9IHBhcnRcblxuICBpZiBzZW12ZXIuc2F0aXNmaWVzKGF0b20uZ2V0VmVyc2lvbigpLCAnPCAxLjEyJylcbiAgICBrZXkgPSAnICcgaWYga2V5IGlzICdzcGFjZSdcbiAgYnVpbGRLZXlkb3duRXZlbnQoa2V5LCBvcHRpb25zKVxuXG5idWlsZFRleHRJbnB1dEV2ZW50ID0gKGtleSkgLT5cbiAgZXZlbnRBcmdzID0gW1xuICAgIHRydWUgIyBidWJibGVzXG4gICAgdHJ1ZSAjIGNhbmNlbGFibGVcbiAgICB3aW5kb3cgIyB2aWV3XG4gICAga2V5ICAjIGtleSBjaGFyXG4gIF1cbiAgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnVGV4dEV2ZW50JylcbiAgZXZlbnQuaW5pdFRleHRFdmVudChcInRleHRJbnB1dFwiLCBldmVudEFyZ3MuLi4pXG4gIGV2ZW50XG5cbnJhd0tleXN0cm9rZSA9IChrZXlzdHJva2VzLCB0YXJnZXQpIC0+XG4gIGZvciBrZXkgaW4gbm9ybWFsaXplS2V5c3Ryb2tlcyhrZXlzdHJva2VzKS5zcGxpdCgvXFxzKy8pXG4gICAgZXZlbnQgPSBidWlsZEtleWRvd25FdmVudEZyb21LZXlzdHJva2Uoa2V5LCB0YXJnZXQpXG4gICAgYXRvbS5rZXltYXBzLmhhbmRsZUtleWJvYXJkRXZlbnQoZXZlbnQpXG5cbmlzUG9pbnQgPSAob2JqKSAtPlxuICBpZiBvYmogaW5zdGFuY2VvZiBQb2ludFxuICAgIHRydWVcbiAgZWxzZVxuICAgIG9iai5sZW5ndGggaXMgMiBhbmQgXy5pc051bWJlcihvYmpbMF0pIGFuZCBfLmlzTnVtYmVyKG9ialsxXSlcblxuaXNSYW5nZSA9IChvYmopIC0+XG4gIGlmIG9iaiBpbnN0YW5jZW9mIFJhbmdlXG4gICAgdHJ1ZVxuICBlbHNlXG4gICAgXy5hbGwoW1xuICAgICAgXy5pc0FycmF5KG9iaiksXG4gICAgICAob2JqLmxlbmd0aCBpcyAyKSxcbiAgICAgIGlzUG9pbnQob2JqWzBdKSxcbiAgICAgIGlzUG9pbnQob2JqWzFdKVxuICAgIF0pXG5cbnRvQXJyYXkgPSAob2JqLCBjb25kPW51bGwpIC0+XG4gIGlmIF8uaXNBcnJheShjb25kID8gb2JqKSB0aGVuIG9iaiBlbHNlIFtvYmpdXG5cbnRvQXJyYXlPZlBvaW50ID0gKG9iaikgLT5cbiAgaWYgXy5pc0FycmF5KG9iaikgYW5kIGlzUG9pbnQob2JqWzBdKVxuICAgIG9ialxuICBlbHNlXG4gICAgW29ial1cblxudG9BcnJheU9mUmFuZ2UgPSAob2JqKSAtPlxuICBpZiBfLmlzQXJyYXkob2JqKSBhbmQgXy5hbGwob2JqLm1hcCAoZSkgLT4gaXNSYW5nZShlKSlcbiAgICBvYmpcbiAgZWxzZVxuICAgIFtvYmpdXG5cbiMgTWFpblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5nZXRWaW1TdGF0ZSA9IChhcmdzLi4uKSAtPlxuICBbZWRpdG9yLCBmaWxlLCBjYWxsYmFja10gPSBbXVxuICBzd2l0Y2ggYXJncy5sZW5ndGhcbiAgICB3aGVuIDEgdGhlbiBbY2FsbGJhY2tdID0gYXJnc1xuICAgIHdoZW4gMiB0aGVuIFtmaWxlLCBjYWxsYmFja10gPSBhcmdzXG5cbiAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKVxuXG4gIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgIGZpbGUgPSBhdG9tLnByb2plY3QucmVzb2x2ZVBhdGgoZmlsZSkgaWYgZmlsZVxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZSkudGhlbiAoZSkgLT4gZWRpdG9yID0gZVxuXG4gIHJ1bnMgLT5cbiAgICBtYWluID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCd2aW0tbW9kZS1wbHVzJykubWFpbk1vZHVsZVxuICAgIHZpbVN0YXRlID0gbWFpbi5nZXRFZGl0b3JTdGF0ZShlZGl0b3IpXG4gICAgY2FsbGJhY2sodmltU3RhdGUsIG5ldyBWaW1FZGl0b3IodmltU3RhdGUpKVxuXG5jbGFzcyBUZXh0RGF0YVxuICBjb25zdHJ1Y3RvcjogKEByYXdEYXRhKSAtPlxuICAgIEBsaW5lcyA9IEByYXdEYXRhLnNwbGl0KFwiXFxuXCIpXG5cbiAgZ2V0TGluZXM6IChsaW5lcywge2Nob21wfT17fSkgLT5cbiAgICBjaG9tcCA/PSBmYWxzZVxuICAgIHRleHQgPSAoQGxpbmVzW2xpbmVdIGZvciBsaW5lIGluIGxpbmVzKS5qb2luKFwiXFxuXCIpXG4gICAgaWYgY2hvbXBcbiAgICAgIHRleHRcbiAgICBlbHNlXG4gICAgICB0ZXh0ICsgXCJcXG5cIlxuXG4gIGdldFJhdzogLT5cbiAgICBAcmF3RGF0YVxuXG5jb2xsZWN0SW5kZXhJblRleHQgPSAoY2hhciwgdGV4dCkgLT5cbiAgaW5kZXhlcyA9IFtdXG4gIGZyb21JbmRleCA9IDBcbiAgd2hpbGUgKGluZGV4ID0gdGV4dC5pbmRleE9mKGNoYXIsIGZyb21JbmRleCkpID49IDBcbiAgICBmcm9tSW5kZXggPSBpbmRleCArIDFcbiAgICBpbmRleGVzLnB1c2goaW5kZXgpXG4gIGluZGV4ZXNcblxuY29sbGVjdENoYXJQb3NpdGlvbnNJblRleHQgPSAoY2hhciwgdGV4dCkgLT5cbiAgcG9zaXRpb25zID0gW11cbiAgZm9yIGxpbmVUZXh0LCByb3dOdW1iZXIgaW4gdGV4dC5zcGxpdCgvXFxuLylcbiAgICBmb3IgaW5kZXgsIGkgaW4gY29sbGVjdEluZGV4SW5UZXh0KGNoYXIsIGxpbmVUZXh0KVxuICAgICAgcG9zaXRpb25zLnB1c2goW3Jvd051bWJlciwgaW5kZXggLSBpXSlcbiAgcG9zaXRpb25zXG5cbmNsYXNzIFZpbUVkaXRvclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG5cbiAgdmFsaWRhdGVPcHRpb25zOiAob3B0aW9ucywgdmFsaWRPcHRpb25zLCBtZXNzYWdlKSAtPlxuICAgIGludmFsaWRPcHRpb25zID0gXy53aXRob3V0KF8ua2V5cyhvcHRpb25zKSwgdmFsaWRPcHRpb25zLi4uKVxuICAgIGlmIGludmFsaWRPcHRpb25zLmxlbmd0aFxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiI3ttZXNzYWdlfTogI3tpbnNwZWN0KGludmFsaWRPcHRpb25zKX1cIilcblxuICB2YWxpZGF0ZUV4Y2x1c2l2ZU9wdGlvbnM6IChvcHRpb25zLCBydWxlcykgLT5cbiAgICBhbGxPcHRpb25zID0gT2JqZWN0LmtleXMob3B0aW9ucylcbiAgICBmb3Igb3B0aW9uLCBleGNsdXNpdmVPcHRpb25zIG9mIHJ1bGVzIHdoZW4gb3B0aW9uIG9mIG9wdGlvbnNcbiAgICAgIHZpb2xhdGluZ09wdGlvbnMgPSBleGNsdXNpdmVPcHRpb25zLmZpbHRlciAoZXhjbHVzaXZlT3B0aW9uKSAtPiBleGNsdXNpdmVPcHRpb24gaW4gYWxsT3B0aW9uc1xuICAgICAgaWYgdmlvbGF0aW5nT3B0aW9ucy5sZW5ndGhcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiI3tvcHRpb259IGlzIGV4Y2x1c2l2ZSB3aXRoIFsje3Zpb2xhdGluZ09wdGlvbnN9XVwiKVxuXG4gIHNldE9wdGlvbnNPcmRlcmVkID0gW1xuICAgICd0ZXh0JywgJ3RleHRfJyxcbiAgICAndGV4dEMnLCAndGV4dENfJyxcbiAgICAnZ3JhbW1hcicsXG4gICAgJ2N1cnNvcicsICdjdXJzb3JTY3JlZW4nXG4gICAgJ2FkZEN1cnNvcicsICdjdXJzb3JTY3JlZW4nXG4gICAgJ3JlZ2lzdGVyJyxcbiAgICAnc2VsZWN0ZWRCdWZmZXJSYW5nZSdcbiAgXVxuXG4gIHNldEV4Y2x1c2l2ZVJ1bGVzID1cbiAgICB0ZXh0QzogWydjdXJzb3InLCAnY3Vyc29yU2NyZWVuJ11cbiAgICB0ZXh0Q186IFsnY3Vyc29yJywgJ2N1cnNvclNjcmVlbiddXG5cbiAgIyBQdWJsaWNcbiAgc2V0OiAob3B0aW9ucykgPT5cbiAgICBAdmFsaWRhdGVPcHRpb25zKG9wdGlvbnMsIHNldE9wdGlvbnNPcmRlcmVkLCAnSW52YWxpZCBzZXQgb3B0aW9ucycpXG4gICAgQHZhbGlkYXRlRXhjbHVzaXZlT3B0aW9ucyhvcHRpb25zLCBzZXRFeGNsdXNpdmVSdWxlcylcblxuICAgIGZvciBuYW1lIGluIHNldE9wdGlvbnNPcmRlcmVkIHdoZW4gb3B0aW9uc1tuYW1lXT9cbiAgICAgIG1ldGhvZCA9ICdzZXQnICsgXy5jYXBpdGFsaXplKF8uY2FtZWxpemUobmFtZSkpXG4gICAgICB0aGlzW21ldGhvZF0ob3B0aW9uc1tuYW1lXSlcblxuICBzZXRUZXh0OiAodGV4dCkgLT5cbiAgICBAZWRpdG9yLnNldFRleHQodGV4dClcblxuICBzZXRUZXh0XzogKHRleHQpIC0+XG4gICAgQHNldFRleHQodGV4dC5yZXBsYWNlKC9fL2csICcgJykpXG5cbiAgc2V0VGV4dEM6ICh0ZXh0KSAtPlxuICAgIGN1cnNvcnMgPSBjb2xsZWN0Q2hhclBvc2l0aW9uc0luVGV4dCgnfCcsIHRleHQucmVwbGFjZSgvIS9nLCAnJykpXG4gICAgbGFzdEN1cnNvciA9IGNvbGxlY3RDaGFyUG9zaXRpb25zSW5UZXh0KCchJywgdGV4dC5yZXBsYWNlKC9cXHwvZywgJycpKVxuICAgIEBzZXRUZXh0KHRleHQucmVwbGFjZSgvW1xcfCFdL2csICcnKSlcbiAgICBjdXJzb3JzID0gY3Vyc29ycy5jb25jYXQobGFzdEN1cnNvcilcbiAgICBpZiBjdXJzb3JzLmxlbmd0aFxuICAgICAgQHNldEN1cnNvcihjdXJzb3JzKVxuXG4gIHNldFRleHRDXzogKHRleHQpIC0+XG4gICAgQHNldFRleHRDKHRleHQucmVwbGFjZSgvXy9nLCAnICcpKVxuXG4gIHNldEdyYW1tYXI6IChzY29wZSkgLT5cbiAgICBAZWRpdG9yLnNldEdyYW1tYXIoYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKHNjb3BlKSlcblxuICBzZXRDdXJzb3I6IChwb2ludHMpIC0+XG4gICAgcG9pbnRzID0gdG9BcnJheU9mUG9pbnQocG9pbnRzKVxuICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ocG9pbnRzLnNoaWZ0KCkpXG4gICAgZm9yIHBvaW50IGluIHBvaW50c1xuICAgICAgQGVkaXRvci5hZGRDdXJzb3JBdEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIHNldEN1cnNvclNjcmVlbjogKHBvaW50cykgLT5cbiAgICBwb2ludHMgPSB0b0FycmF5T2ZQb2ludChwb2ludHMpXG4gICAgQGVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbihwb2ludHMuc2hpZnQoKSlcbiAgICBmb3IgcG9pbnQgaW4gcG9pbnRzXG4gICAgICBAZWRpdG9yLmFkZEN1cnNvckF0U2NyZWVuUG9zaXRpb24ocG9pbnQpXG5cbiAgc2V0QWRkQ3Vyc29yOiAocG9pbnRzKSAtPlxuICAgIGZvciBwb2ludCBpbiB0b0FycmF5T2ZQb2ludChwb2ludHMpXG4gICAgICBAZWRpdG9yLmFkZEN1cnNvckF0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgc2V0UmVnaXN0ZXI6IChyZWdpc3RlcikgLT5cbiAgICBmb3IgbmFtZSwgdmFsdWUgb2YgcmVnaXN0ZXJcbiAgICAgIEB2aW1TdGF0ZS5yZWdpc3Rlci5zZXQobmFtZSwgdmFsdWUpXG5cbiAgc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZTogKHJhbmdlKSAtPlxuICAgIEBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShyYW5nZSlcblxuICBlbnN1cmVPcHRpb25zT3JkZXJlZCA9IFtcbiAgICAndGV4dCcsICd0ZXh0XycsXG4gICAgJ3RleHRDJywgJ3RleHRDXycsXG4gICAgJ3NlbGVjdGVkVGV4dCcsICdzZWxlY3RlZFRleHRfJywgJ3NlbGVjdGVkVGV4dE9yZGVyZWQnLCBcInNlbGVjdGlvbklzTmFycm93ZWRcIlxuICAgICdjdXJzb3InLCAnY3Vyc29yU2NyZWVuJ1xuICAgICdudW1DdXJzb3JzJ1xuICAgICdyZWdpc3RlcicsXG4gICAgJ3NlbGVjdGVkU2NyZWVuUmFuZ2UnLCAnc2VsZWN0ZWRTY3JlZW5SYW5nZU9yZGVyZWQnXG4gICAgJ3NlbGVjdGVkQnVmZmVyUmFuZ2UnLCAnc2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQnXG4gICAgJ3NlbGVjdGlvbklzUmV2ZXJzZWQnLFxuICAgICdwZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2UnLCAncGVyc2lzdGVudFNlbGVjdGlvbkNvdW50J1xuICAgICdvY2N1cnJlbmNlQ291bnQnLCAnb2NjdXJyZW5jZVRleHQnXG4gICAgJ3Byb3BlcnR5SGVhZCdcbiAgICAncHJvcGVydHlUYWlsJ1xuICAgICdzY3JvbGxUb3AnLFxuICAgICdtYXJrJ1xuICAgICdtb2RlJyxcbiAgXVxuICBlbnN1cmVFeGNsdXNpdmVSdWxlcyA9XG4gICAgdGV4dEM6IFsnY3Vyc29yJywgJ2N1cnNvclNjcmVlbiddXG4gICAgdGV4dENfOiBbJ2N1cnNvcicsICdjdXJzb3JTY3JlZW4nXVxuXG4gIGdldEFuZERlbGV0ZUtleXN0cm9rZU9wdGlvbnM6IChvcHRpb25zKSAtPlxuICAgIHtwYXJ0aWFsTWF0Y2hUaW1lb3V0fSA9IG9wdGlvbnNcbiAgICBkZWxldGUgb3B0aW9ucy5wYXJ0aWFsTWF0Y2hUaW1lb3V0XG4gICAge3BhcnRpYWxNYXRjaFRpbWVvdXR9XG5cbiAgIyBQdWJsaWNcbiAgZW5zdXJlOiAoYXJncy4uLikgPT5cbiAgICBzd2l0Y2ggYXJncy5sZW5ndGhcbiAgICAgIHdoZW4gMSB0aGVuIFtvcHRpb25zXSA9IGFyZ3NcbiAgICAgIHdoZW4gMiB0aGVuIFtrZXlzdHJva2UsIG9wdGlvbnNdID0gYXJnc1xuXG4gICAgdW5sZXNzIHR5cGVvZihvcHRpb25zKSBpcyAnb2JqZWN0J1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBvcHRpb25zIGZvciAnZW5zdXJlJzogbXVzdCBiZSAnb2JqZWN0JyBidXQgZ290ICcje3R5cGVvZihvcHRpb25zKX0nXCIpXG4gICAgaWYga2V5c3Ryb2tlPyBhbmQgbm90ICh0eXBlb2Yoa2V5c3Ryb2tlKSBpcyAnc3RyaW5nJyBvciBBcnJheS5pc0FycmF5KGtleXN0cm9rZSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGtleXN0cm9rZSBmb3IgJ2Vuc3VyZSc6IG11c3QgYmUgJ3N0cmluZycgb3IgJ2FycmF5JyBidXQgZ290ICcje3R5cGVvZihrZXlzdHJva2UpfSdcIilcblxuICAgIGtleXN0cm9rZU9wdGlvbnMgPSBAZ2V0QW5kRGVsZXRlS2V5c3Ryb2tlT3B0aW9ucyhvcHRpb25zKVxuXG4gICAgQHZhbGlkYXRlT3B0aW9ucyhvcHRpb25zLCBlbnN1cmVPcHRpb25zT3JkZXJlZCwgJ0ludmFsaWQgZW5zdXJlIG9wdGlvbicpXG4gICAgQHZhbGlkYXRlRXhjbHVzaXZlT3B0aW9ucyhvcHRpb25zLCBlbnN1cmVFeGNsdXNpdmVSdWxlcylcblxuICAgICMgSW5wdXRcbiAgICB1bmxlc3MgXy5pc0VtcHR5KGtleXN0cm9rZSlcbiAgICAgIEBrZXlzdHJva2Uoa2V5c3Ryb2tlLCBrZXlzdHJva2VPcHRpb25zKVxuXG4gICAgZm9yIG5hbWUgaW4gZW5zdXJlT3B0aW9uc09yZGVyZWQgd2hlbiBvcHRpb25zW25hbWVdP1xuICAgICAgbWV0aG9kID0gJ2Vuc3VyZScgKyBfLmNhcGl0YWxpemUoXy5jYW1lbGl6ZShuYW1lKSlcbiAgICAgIHRoaXNbbWV0aG9kXShvcHRpb25zW25hbWVdKVxuXG4gIGJpbmRFbnN1cmVPcHRpb246IChvcHRpb25zQmFzZSkgPT5cbiAgICAoa2V5c3Ryb2tlLCBvcHRpb25zKSA9PlxuICAgICAgaW50ZXJzZWN0aW5nT3B0aW9ucyA9IF8uaW50ZXJzZWN0aW9uKF8ua2V5cyhvcHRpb25zKSwgXy5rZXlzKG9wdGlvbnNCYXNlKSlcbiAgICAgIGlmIGludGVyc2VjdGluZ09wdGlvbnMubGVuZ3RoXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNvbmZsaWN0IHdpdGggYm91bmQgb3B0aW9ucyAje2luc3BlY3QoaW50ZXJzZWN0aW5nT3B0aW9ucyl9XCIpXG5cbiAgICAgIEBlbnN1cmUoa2V5c3Ryb2tlLCBfLmRlZmF1bHRzKF8uY2xvbmUob3B0aW9ucyksIG9wdGlvbnNCYXNlKSlcblxuICBlbnN1cmVCeURpc3BhdGNoOiAoY29tbWFuZCwgb3B0aW9ucykgPT5cbiAgICBkaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoQGVkaXRvciksIGNvbW1hbmQpXG4gICAgZm9yIG5hbWUgaW4gZW5zdXJlT3B0aW9uc09yZGVyZWQgd2hlbiBvcHRpb25zW25hbWVdP1xuICAgICAgbWV0aG9kID0gJ2Vuc3VyZScgKyBfLmNhcGl0YWxpemUoXy5jYW1lbGl6ZShuYW1lKSlcbiAgICAgIHRoaXNbbWV0aG9kXShvcHRpb25zW25hbWVdKVxuXG4gIGVuc3VyZVRleHQ6ICh0ZXh0KSAtPlxuICAgIGV4cGVjdChAZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCh0ZXh0KVxuXG4gIGVuc3VyZVRleHRfOiAodGV4dCkgLT5cbiAgICBAZW5zdXJlVGV4dCh0ZXh0LnJlcGxhY2UoL18vZywgJyAnKSlcblxuICBlbnN1cmVUZXh0QzogKHRleHQpIC0+XG4gICAgY3Vyc29ycyA9IGNvbGxlY3RDaGFyUG9zaXRpb25zSW5UZXh0KCd8JywgdGV4dC5yZXBsYWNlKC8hL2csICcnKSlcbiAgICBsYXN0Q3Vyc29yID0gY29sbGVjdENoYXJQb3NpdGlvbnNJblRleHQoJyEnLCB0ZXh0LnJlcGxhY2UoL1xcfC9nLCAnJykpXG4gICAgY3Vyc29ycyA9IGN1cnNvcnMuY29uY2F0KGxhc3RDdXJzb3IpXG4gICAgY3Vyc29ycyA9IGN1cnNvcnNcbiAgICAgIC5tYXAgKHBvaW50KSAtPiBQb2ludC5mcm9tT2JqZWN0KHBvaW50KVxuICAgICAgLnNvcnQgKGEsIGIpIC0+IGEuY29tcGFyZShiKVxuICAgIEBlbnN1cmVUZXh0KHRleHQucmVwbGFjZSgvW1xcfCFdL2csICcnKSlcbiAgICBpZiBjdXJzb3JzLmxlbmd0aFxuICAgICAgQGVuc3VyZUN1cnNvcihjdXJzb3JzLCB0cnVlKVxuXG4gICAgaWYgbGFzdEN1cnNvci5sZW5ndGhcbiAgICAgIGV4cGVjdChAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwobGFzdEN1cnNvclswXSlcblxuICBlbnN1cmVUZXh0Q186ICh0ZXh0KSAtPlxuICAgIEBlbnN1cmVUZXh0Qyh0ZXh0LnJlcGxhY2UoL18vZywgJyAnKSlcblxuICBlbnN1cmVTZWxlY3RlZFRleHQ6ICh0ZXh0LCBvcmRlcmVkPWZhbHNlKSAtPlxuICAgIHNlbGVjdGlvbnMgPSBpZiBvcmRlcmVkXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICBhY3R1YWwgPSAocy5nZXRUZXh0KCkgZm9yIHMgaW4gc2VsZWN0aW9ucylcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXkodGV4dCkpXG5cbiAgZW5zdXJlU2VsZWN0ZWRUZXh0XzogKHRleHQsIG9yZGVyZWQpIC0+XG4gICAgQGVuc3VyZVNlbGVjdGVkVGV4dCh0ZXh0LnJlcGxhY2UoL18vZywgJyAnKSwgb3JkZXJlZClcblxuICBlbnN1cmVTZWxlY3Rpb25Jc05hcnJvd2VkOiAoaXNOYXJyb3dlZCkgLT5cbiAgICBhY3R1YWwgPSBAdmltU3RhdGUubW9kZU1hbmFnZXIuaXNOYXJyb3dlZCgpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbChpc05hcnJvd2VkKVxuXG4gIGVuc3VyZVNlbGVjdGVkVGV4dE9yZGVyZWQ6ICh0ZXh0KSAtPlxuICAgIEBlbnN1cmVTZWxlY3RlZFRleHQodGV4dCwgdHJ1ZSlcblxuICBlbnN1cmVDdXJzb3I6IChwb2ludHMsIG9yZGVyZWQ9ZmFsc2UpIC0+XG4gICAgYWN0dWFsID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKVxuICAgIGFjdHVhbCA9IGFjdHVhbC5zb3J0IChhLCBiKSAtPiBhLmNvbXBhcmUoYikgaWYgb3JkZXJlZFxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheU9mUG9pbnQocG9pbnRzKSlcblxuICBlbnN1cmVDdXJzb3JTY3JlZW46IChwb2ludHMpIC0+XG4gICAgYWN0dWFsID0gQGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbnMoKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheU9mUG9pbnQocG9pbnRzKSlcblxuICBlbnN1cmVSZWdpc3RlcjogKHJlZ2lzdGVyKSAtPlxuICAgIGZvciBuYW1lLCBlbnN1cmUgb2YgcmVnaXN0ZXJcbiAgICAgIHtzZWxlY3Rpb259ID0gZW5zdXJlXG4gICAgICBkZWxldGUgZW5zdXJlLnNlbGVjdGlvblxuICAgICAgcmVnID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldChuYW1lLCBzZWxlY3Rpb24pXG4gICAgICBmb3IgcHJvcGVydHksIF92YWx1ZSBvZiBlbnN1cmVcbiAgICAgICAgZXhwZWN0KHJlZ1twcm9wZXJ0eV0pLnRvRXF1YWwoX3ZhbHVlKVxuXG4gIGVuc3VyZU51bUN1cnNvcnM6IChudW1iZXIpIC0+XG4gICAgZXhwZWN0KEBlZGl0b3IuZ2V0Q3Vyc29ycygpKS50b0hhdmVMZW5ndGggbnVtYmVyXG5cbiAgX2Vuc3VyZVNlbGVjdGVkUmFuZ2VCeTogKHJhbmdlLCBvcmRlcmVkPWZhbHNlLCBmbikgLT5cbiAgICBzZWxlY3Rpb25zID0gaWYgb3JkZXJlZFxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgYWN0dWFsID0gKGZuKHMpIGZvciBzIGluIHNlbGVjdGlvbnMpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5T2ZSYW5nZShyYW5nZSkpXG5cbiAgZW5zdXJlU2VsZWN0ZWRTY3JlZW5SYW5nZTogKHJhbmdlLCBvcmRlcmVkPWZhbHNlKSAtPlxuICAgIEBfZW5zdXJlU2VsZWN0ZWRSYW5nZUJ5IHJhbmdlLCBvcmRlcmVkLCAocykgLT4gcy5nZXRTY3JlZW5SYW5nZSgpXG5cbiAgZW5zdXJlU2VsZWN0ZWRTY3JlZW5SYW5nZU9yZGVyZWQ6IChyYW5nZSkgLT5cbiAgICBAZW5zdXJlU2VsZWN0ZWRTY3JlZW5SYW5nZShyYW5nZSwgdHJ1ZSlcblxuICBlbnN1cmVTZWxlY3RlZEJ1ZmZlclJhbmdlOiAocmFuZ2UsIG9yZGVyZWQ9ZmFsc2UpIC0+XG4gICAgQF9lbnN1cmVTZWxlY3RlZFJhbmdlQnkgcmFuZ2UsIG9yZGVyZWQsIChzKSAtPiBzLmdldEJ1ZmZlclJhbmdlKClcblxuICBlbnN1cmVTZWxlY3RlZEJ1ZmZlclJhbmdlT3JkZXJlZDogKHJhbmdlKSAtPlxuICAgIEBlbnN1cmVTZWxlY3RlZEJ1ZmZlclJhbmdlKHJhbmdlLCB0cnVlKVxuXG4gIGVuc3VyZVNlbGVjdGlvbklzUmV2ZXJzZWQ6IChyZXZlcnNlZCkgLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBhY3R1YWwgPSBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICBleHBlY3QoYWN0dWFsKS50b0JlKHJldmVyc2VkKVxuXG4gIGVuc3VyZVBlcnNpc3RlbnRTZWxlY3Rpb25CdWZmZXJSYW5nZTogKHJhbmdlKSAtPlxuICAgIGFjdHVhbCA9IEB2aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckJ1ZmZlclJhbmdlcygpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5T2ZSYW5nZShyYW5nZSkpXG5cbiAgZW5zdXJlUGVyc2lzdGVudFNlbGVjdGlvbkNvdW50OiAobnVtYmVyKSAtPlxuICAgIGFjdHVhbCA9IEB2aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckNvdW50KClcbiAgICBleHBlY3QoYWN0dWFsKS50b0JlIG51bWJlclxuXG4gIGVuc3VyZU9jY3VycmVuY2VDb3VudDogKG51bWJlcikgLT5cbiAgICBhY3R1YWwgPSBAdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VyQ291bnQoKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvQmUgbnVtYmVyXG5cbiAgZW5zdXJlT2NjdXJyZW5jZVRleHQ6ICh0ZXh0KSAtPlxuICAgIG1hcmtlcnMgPSBAdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VycygpXG4gICAgcmFuZ2VzID0gKHIuZ2V0QnVmZmVyUmFuZ2UoKSBmb3IgciBpbiBtYXJrZXJzKVxuICAgIGFjdHVhbCA9IChAZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHIpIGZvciByIGluIHJhbmdlcylcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXkodGV4dCkpXG5cbiAgZW5zdXJlUHJvcGVydHlIZWFkOiAocG9pbnRzKSAtPlxuICAgIGdldEhlYWRQcm9wZXJ0eSA9IChzZWxlY3Rpb24pID0+XG4gICAgICBAdmltU3RhdGUuc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknXSlcbiAgICBhY3R1YWwgPSAoZ2V0SGVhZFByb3BlcnR5KHMpIGZvciBzIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheU9mUG9pbnQocG9pbnRzKSlcblxuICBlbnN1cmVQcm9wZXJ0eVRhaWw6IChwb2ludHMpIC0+XG4gICAgZ2V0VGFpbFByb3BlcnR5ID0gKHNlbGVjdGlvbikgPT5cbiAgICAgIEB2aW1TdGF0ZS5zd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCd0YWlsJywgZnJvbTogWydwcm9wZXJ0eSddKVxuICAgIGFjdHVhbCA9IChnZXRUYWlsUHJvcGVydHkocykgZm9yIHMgaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5T2ZQb2ludChwb2ludHMpKVxuXG4gIGVuc3VyZVNjcm9sbFRvcDogKHNjcm9sbFRvcCkgLT5cbiAgICBhY3R1YWwgPSBAZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwgc2Nyb2xsVG9wXG5cbiAgZW5zdXJlTWFyazogKG1hcmspIC0+XG4gICAgZm9yIG5hbWUsIHBvaW50IG9mIG1hcmtcbiAgICAgIGFjdHVhbCA9IEB2aW1TdGF0ZS5tYXJrLmdldChuYW1lKVxuICAgICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbChwb2ludClcblxuICBlbnN1cmVNb2RlOiAobW9kZSkgLT5cbiAgICBtb2RlID0gdG9BcnJheShtb2RlKS5zbGljZSgpXG4gICAgZXhwZWN0KEB2aW1TdGF0ZS5pc01vZGUobW9kZS4uLikpLnRvQmUodHJ1ZSlcblxuICAgIG1vZGVbMF0gPSBcIiN7bW9kZVswXX0tbW9kZVwiXG4gICAgbW9kZSA9IG1vZGUuZmlsdGVyKChtKSAtPiBtKVxuICAgIGV4cGVjdChAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3ZpbS1tb2RlLXBsdXMnKSkudG9CZSh0cnVlKVxuICAgIGZvciBtIGluIG1vZGVcbiAgICAgIGV4cGVjdChAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMobSkpLnRvQmUodHJ1ZSlcbiAgICBzaG91bGROb3RDb250YWluQ2xhc3NlcyA9IF8uZGlmZmVyZW5jZShzdXBwb3J0ZWRNb2RlQ2xhc3MsIG1vZGUpXG4gICAgZm9yIG0gaW4gc2hvdWxkTm90Q29udGFpbkNsYXNzZXNcbiAgICAgIGV4cGVjdChAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMobSkpLnRvQmUoZmFsc2UpXG5cbiAgIyBQdWJsaWNcbiAgIyBvcHRpb25zXG4gICMgLSB3YWl0c0ZvckZpbmlzaFxuICBrZXlzdHJva2U6IChrZXlzLCBvcHRpb25zPXt9KSA9PlxuICAgIGlmIG9wdGlvbnMud2FpdHNGb3JGaW5pc2hcbiAgICAgIGZpbmlzaGVkID0gZmFsc2VcbiAgICAgIEB2aW1TdGF0ZS5vbkRpZEZpbmlzaE9wZXJhdGlvbiAtPiBmaW5pc2hlZCA9IHRydWVcbiAgICAgIGRlbGV0ZSBvcHRpb25zLndhaXRzRm9yRmluaXNoXG4gICAgICBAa2V5c3Ryb2tlKGtleXMsIG9wdGlvbnMpXG4gICAgICB3YWl0c0ZvciAtPiBmaW5pc2hlZFxuICAgICAgcmV0dXJuXG5cbiAgICAjIGtleXMgbXVzdCBiZSBTdHJpbmcgb3IgQXJyYXlcbiAgICAjIE5vdCBzdXBwb3J0IE9iamVjdCBmb3Iga2V5cyB0byBhdm9pZCBhbWJpZ3VpdHkuXG4gICAgdGFyZ2V0ID0gQGVkaXRvckVsZW1lbnRcblxuICAgIGZvciBrIGluIHRvQXJyYXkoa2V5cylcbiAgICAgIGlmIF8uaXNTdHJpbmcoaylcbiAgICAgICAgcmF3S2V5c3Ryb2tlKGssIHRhcmdldClcbiAgICAgIGVsc2VcbiAgICAgICAgc3dpdGNoXG4gICAgICAgICAgd2hlbiBrLmlucHV0P1xuICAgICAgICAgICAgIyBUT0RPIG5vIGxvbmdlciBuZWVkIHRvIHVzZSBbaW5wdXQ6ICdjaGFyJ10gc3R5bGUuXG4gICAgICAgICAgICByYXdLZXlzdHJva2UoX2tleSwgdGFyZ2V0KSBmb3IgX2tleSBpbiBrLmlucHV0LnNwbGl0KCcnKVxuICAgICAgICAgIHdoZW4gay5zZWFyY2g/XG4gICAgICAgICAgICBAdmltU3RhdGUuc2VhcmNoSW5wdXQuZWRpdG9yLmluc2VydFRleHQoay5zZWFyY2gpIGlmIGsuc2VhcmNoXG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKEB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5lZGl0b3JFbGVtZW50LCAnY29yZTpjb25maXJtJylcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByYXdLZXlzdHJva2UoaywgdGFyZ2V0KVxuXG4gICAgaWYgb3B0aW9ucy5wYXJ0aWFsTWF0Y2hUaW1lb3V0XG4gICAgICBhZHZhbmNlQ2xvY2soYXRvbS5rZXltYXBzLmdldFBhcnRpYWxNYXRjaFRpbWVvdXQoKSlcblxubW9kdWxlLmV4cG9ydHMgPSB7Z2V0VmltU3RhdGUsIGdldFZpZXcsIGRpc3BhdGNoLCBUZXh0RGF0YSwgd2l0aE1vY2tQbGF0Zm9ybSwgcmF3S2V5c3Ryb2tlfVxuIl19
