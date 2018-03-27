(function() {
  var AutoFlow, AutoIndent, Base, BufferedProcess, CamelCase, ChangeOrder, ChangeSurround, ChangeSurroundAnyPair, ChangeSurroundAnyPairAllowForwarding, CompactSpaces, ConvertToHardTab, ConvertToSoftTab, DashCase, DecodeUriComponent, DeleteSurround, DeleteSurroundAnyPair, DeleteSurroundAnyPairAllowForwarding, EncodeUriComponent, Indent, Join, JoinBase, JoinByInput, JoinByInputWithKeepingSpace, JoinWithKeepingSpace, LineEndingRegExp, LowerCase, MapSurround, Operator, Outdent, PascalCase, Range, RemoveLeadingWhiteSpaces, Replace, ReplaceCharacter, ReplaceWithRegister, Reverse, SnakeCase, Sort, SortByNumber, SortCaseInsensitively, SplitByCharacter, SplitString, SplitStringWithKeepingSplitter, Surround, SurroundBase, SurroundSmartWord, SurroundWord, SwapWithRegister, TitleCase, ToggleCase, ToggleCaseAndMoveRight, ToggleLineComments, TransformSmartWordBySelectList, TransformString, TransformStringByExternalCommand, TransformStringBySelectList, TransformWordBySelectList, TrimString, UpperCase, _, isLinewiseRange, isSingleLineText, limitNumber, ref, ref1, splitTextByNewLine, swrap, toggleCaseForCharacter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    modulo = function(a, b) { return (+a % (b = +b) + b) % b; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  LineEndingRegExp = /(?:\n|\r\n)$/;

  _ = require('underscore-plus');

  ref = require('atom'), BufferedProcess = ref.BufferedProcess, Range = ref.Range;

  ref1 = require('./utils'), isSingleLineText = ref1.isSingleLineText, isLinewiseRange = ref1.isLinewiseRange, limitNumber = ref1.limitNumber, toggleCaseForCharacter = ref1.toggleCaseForCharacter, splitTextByNewLine = ref1.splitTextByNewLine;

  swrap = require('./selection-wrapper');

  Base = require('./base');

  Operator = Base.getClass('Operator');

  TransformString = (function(superClass) {
    extend(TransformString, superClass);

    function TransformString() {
      return TransformString.__super__.constructor.apply(this, arguments);
    }

    TransformString.extend(false);

    TransformString.prototype.trackChange = true;

    TransformString.prototype.stayOptionName = 'stayOnTransformString';

    TransformString.prototype.autoIndent = false;

    TransformString.prototype.autoIndentNewline = false;

    TransformString.stringTransformers = [];

    TransformString.registerToSelectList = function() {
      return this.stringTransformers.push(this);
    };

    TransformString.prototype.mutateSelection = function(selection) {
      var text;
      if (text = this.getNewText(selection.getText(), selection)) {
        return selection.insertText(text, {
          autoIndent: this.autoIndent
        });
      }
    };

    return TransformString;

  })(Operator);

  ToggleCase = (function(superClass) {
    extend(ToggleCase, superClass);

    function ToggleCase() {
      return ToggleCase.__super__.constructor.apply(this, arguments);
    }

    ToggleCase.extend();

    ToggleCase.registerToSelectList();

    ToggleCase.description = "`Hello World` -> `hELLO wORLD`";

    ToggleCase.prototype.displayName = 'Toggle ~';

    ToggleCase.prototype.getNewText = function(text) {
      return text.replace(/./g, toggleCaseForCharacter);
    };

    return ToggleCase;

  })(TransformString);

  ToggleCaseAndMoveRight = (function(superClass) {
    extend(ToggleCaseAndMoveRight, superClass);

    function ToggleCaseAndMoveRight() {
      return ToggleCaseAndMoveRight.__super__.constructor.apply(this, arguments);
    }

    ToggleCaseAndMoveRight.extend();

    ToggleCaseAndMoveRight.prototype.flashTarget = false;

    ToggleCaseAndMoveRight.prototype.restorePositions = false;

    ToggleCaseAndMoveRight.prototype.target = 'MoveRight';

    return ToggleCaseAndMoveRight;

  })(ToggleCase);

  UpperCase = (function(superClass) {
    extend(UpperCase, superClass);

    function UpperCase() {
      return UpperCase.__super__.constructor.apply(this, arguments);
    }

    UpperCase.extend();

    UpperCase.registerToSelectList();

    UpperCase.description = "`Hello World` -> `HELLO WORLD`";

    UpperCase.prototype.displayName = 'Upper';

    UpperCase.prototype.getNewText = function(text) {
      return text.toUpperCase();
    };

    return UpperCase;

  })(TransformString);

  LowerCase = (function(superClass) {
    extend(LowerCase, superClass);

    function LowerCase() {
      return LowerCase.__super__.constructor.apply(this, arguments);
    }

    LowerCase.extend();

    LowerCase.registerToSelectList();

    LowerCase.description = "`Hello World` -> `hello world`";

    LowerCase.prototype.displayName = 'Lower';

    LowerCase.prototype.getNewText = function(text) {
      return text.toLowerCase();
    };

    return LowerCase;

  })(TransformString);

  Replace = (function(superClass) {
    extend(Replace, superClass);

    function Replace() {
      return Replace.__super__.constructor.apply(this, arguments);
    }

    Replace.extend();

    Replace.prototype.input = null;

    Replace.prototype.flashCheckpoint = 'did-select-occurrence';

    Replace.prototype.requireInput = true;

    Replace.prototype.autoIndentNewline = true;

    Replace.prototype.supportEarlySelect = true;

    Replace.prototype.initialize = function() {
      this.onDidSelectTarget(this.focusInput.bind(this));
      return Replace.__super__.initialize.apply(this, arguments);
    };

    Replace.prototype.getNewText = function(text) {
      var input;
      if (this.target.is('MoveRightBufferColumn') && text.length !== this.getCount()) {
        return;
      }
      input = this.getInput() || "\n";
      if (input === "\n") {
        this.restorePositions = false;
      }
      return text.replace(/./g, input);
    };

    return Replace;

  })(TransformString);

  ReplaceCharacter = (function(superClass) {
    extend(ReplaceCharacter, superClass);

    function ReplaceCharacter() {
      return ReplaceCharacter.__super__.constructor.apply(this, arguments);
    }

    ReplaceCharacter.extend();

    ReplaceCharacter.prototype.target = "MoveRightBufferColumn";

    return ReplaceCharacter;

  })(Replace);

  SplitByCharacter = (function(superClass) {
    extend(SplitByCharacter, superClass);

    function SplitByCharacter() {
      return SplitByCharacter.__super__.constructor.apply(this, arguments);
    }

    SplitByCharacter.extend();

    SplitByCharacter.registerToSelectList();

    SplitByCharacter.prototype.getNewText = function(text) {
      return text.split('').join(' ');
    };

    return SplitByCharacter;

  })(TransformString);

  CamelCase = (function(superClass) {
    extend(CamelCase, superClass);

    function CamelCase() {
      return CamelCase.__super__.constructor.apply(this, arguments);
    }

    CamelCase.extend();

    CamelCase.registerToSelectList();

    CamelCase.prototype.displayName = 'Camelize';

    CamelCase.description = "`hello-world` -> `helloWorld`";

    CamelCase.prototype.getNewText = function(text) {
      return _.camelize(text);
    };

    return CamelCase;

  })(TransformString);

  SnakeCase = (function(superClass) {
    extend(SnakeCase, superClass);

    function SnakeCase() {
      return SnakeCase.__super__.constructor.apply(this, arguments);
    }

    SnakeCase.extend();

    SnakeCase.registerToSelectList();

    SnakeCase.description = "`HelloWorld` -> `hello_world`";

    SnakeCase.prototype.displayName = 'Underscore _';

    SnakeCase.prototype.getNewText = function(text) {
      return _.underscore(text);
    };

    return SnakeCase;

  })(TransformString);

  PascalCase = (function(superClass) {
    extend(PascalCase, superClass);

    function PascalCase() {
      return PascalCase.__super__.constructor.apply(this, arguments);
    }

    PascalCase.extend();

    PascalCase.registerToSelectList();

    PascalCase.description = "`hello_world` -> `HelloWorld`";

    PascalCase.prototype.displayName = 'Pascalize';

    PascalCase.prototype.getNewText = function(text) {
      return _.capitalize(_.camelize(text));
    };

    return PascalCase;

  })(TransformString);

  DashCase = (function(superClass) {
    extend(DashCase, superClass);

    function DashCase() {
      return DashCase.__super__.constructor.apply(this, arguments);
    }

    DashCase.extend();

    DashCase.registerToSelectList();

    DashCase.prototype.displayName = 'Dasherize -';

    DashCase.description = "HelloWorld -> hello-world";

    DashCase.prototype.getNewText = function(text) {
      return _.dasherize(text);
    };

    return DashCase;

  })(TransformString);

  TitleCase = (function(superClass) {
    extend(TitleCase, superClass);

    function TitleCase() {
      return TitleCase.__super__.constructor.apply(this, arguments);
    }

    TitleCase.extend();

    TitleCase.registerToSelectList();

    TitleCase.description = "`HelloWorld` -> `Hello World`";

    TitleCase.prototype.displayName = 'Titlize';

    TitleCase.prototype.getNewText = function(text) {
      return _.humanizeEventName(_.dasherize(text));
    };

    return TitleCase;

  })(TransformString);

  EncodeUriComponent = (function(superClass) {
    extend(EncodeUriComponent, superClass);

    function EncodeUriComponent() {
      return EncodeUriComponent.__super__.constructor.apply(this, arguments);
    }

    EncodeUriComponent.extend();

    EncodeUriComponent.registerToSelectList();

    EncodeUriComponent.description = "`Hello World` -> `Hello%20World`";

    EncodeUriComponent.prototype.displayName = 'Encode URI Component %';

    EncodeUriComponent.prototype.getNewText = function(text) {
      return encodeURIComponent(text);
    };

    return EncodeUriComponent;

  })(TransformString);

  DecodeUriComponent = (function(superClass) {
    extend(DecodeUriComponent, superClass);

    function DecodeUriComponent() {
      return DecodeUriComponent.__super__.constructor.apply(this, arguments);
    }

    DecodeUriComponent.extend();

    DecodeUriComponent.registerToSelectList();

    DecodeUriComponent.description = "`Hello%20World` -> `Hello World`";

    DecodeUriComponent.prototype.displayName = 'Decode URI Component %%';

    DecodeUriComponent.prototype.getNewText = function(text) {
      return decodeURIComponent(text);
    };

    return DecodeUriComponent;

  })(TransformString);

  TrimString = (function(superClass) {
    extend(TrimString, superClass);

    function TrimString() {
      return TrimString.__super__.constructor.apply(this, arguments);
    }

    TrimString.extend();

    TrimString.registerToSelectList();

    TrimString.description = "` hello ` -> `hello`";

    TrimString.prototype.displayName = 'Trim string';

    TrimString.prototype.getNewText = function(text) {
      return text.trim();
    };

    return TrimString;

  })(TransformString);

  CompactSpaces = (function(superClass) {
    extend(CompactSpaces, superClass);

    function CompactSpaces() {
      return CompactSpaces.__super__.constructor.apply(this, arguments);
    }

    CompactSpaces.extend();

    CompactSpaces.registerToSelectList();

    CompactSpaces.description = "`  a    b    c` -> `a b c`";

    CompactSpaces.prototype.displayName = 'Compact space';

    CompactSpaces.prototype.getNewText = function(text) {
      if (text.match(/^[ ]+$/)) {
        return ' ';
      } else {
        return text.replace(/^(\s*)(.*?)(\s*)$/gm, function(m, leading, middle, trailing) {
          return leading + middle.split(/[ \t]+/).join(' ') + trailing;
        });
      }
    };

    return CompactSpaces;

  })(TransformString);

  RemoveLeadingWhiteSpaces = (function(superClass) {
    extend(RemoveLeadingWhiteSpaces, superClass);

    function RemoveLeadingWhiteSpaces() {
      return RemoveLeadingWhiteSpaces.__super__.constructor.apply(this, arguments);
    }

    RemoveLeadingWhiteSpaces.extend();

    RemoveLeadingWhiteSpaces.registerToSelectList();

    RemoveLeadingWhiteSpaces.prototype.wise = 'linewise';

    RemoveLeadingWhiteSpaces.description = "`  a b c` -> `a b c`";

    RemoveLeadingWhiteSpaces.prototype.getNewText = function(text, selection) {
      var trimLeft;
      trimLeft = function(text) {
        return text.trimLeft();
      };
      return splitTextByNewLine(text).map(trimLeft).join("\n") + "\n";
    };

    return RemoveLeadingWhiteSpaces;

  })(TransformString);

  ConvertToSoftTab = (function(superClass) {
    extend(ConvertToSoftTab, superClass);

    function ConvertToSoftTab() {
      return ConvertToSoftTab.__super__.constructor.apply(this, arguments);
    }

    ConvertToSoftTab.extend();

    ConvertToSoftTab.registerToSelectList();

    ConvertToSoftTab.prototype.displayName = 'Soft Tab';

    ConvertToSoftTab.prototype.wise = 'linewise';

    ConvertToSoftTab.prototype.mutateSelection = function(selection) {
      return this.scanForward(/\t/g, {
        scanRange: selection.getBufferRange()
      }, (function(_this) {
        return function(arg) {
          var length, range, replace;
          range = arg.range, replace = arg.replace;
          length = _this.editor.screenRangeForBufferRange(range).getExtent().column;
          return replace(" ".repeat(length));
        };
      })(this));
    };

    return ConvertToSoftTab;

  })(TransformString);

  ConvertToHardTab = (function(superClass) {
    extend(ConvertToHardTab, superClass);

    function ConvertToHardTab() {
      return ConvertToHardTab.__super__.constructor.apply(this, arguments);
    }

    ConvertToHardTab.extend();

    ConvertToHardTab.registerToSelectList();

    ConvertToHardTab.prototype.displayName = 'Hard Tab';

    ConvertToHardTab.prototype.mutateSelection = function(selection) {
      var tabLength;
      tabLength = this.editor.getTabLength();
      return this.scanForward(/[ \t]+/g, {
        scanRange: selection.getBufferRange()
      }, (function(_this) {
        return function(arg) {
          var end, endColumn, newText, nextTabStop, range, ref2, remainder, replace, start, startColumn;
          range = arg.range, replace = arg.replace;
          ref2 = _this.editor.screenRangeForBufferRange(range), start = ref2.start, end = ref2.end;
          startColumn = start.column;
          endColumn = end.column;
          newText = '';
          while (true) {
            remainder = modulo(startColumn, tabLength);
            nextTabStop = startColumn + (remainder === 0 ? tabLength : remainder);
            if (nextTabStop > endColumn) {
              newText += " ".repeat(endColumn - startColumn);
            } else {
              newText += "\t";
            }
            startColumn = nextTabStop;
            if (startColumn >= endColumn) {
              break;
            }
          }
          return replace(newText);
        };
      })(this));
    };

    return ConvertToHardTab;

  })(TransformString);

  TransformStringByExternalCommand = (function(superClass) {
    extend(TransformStringByExternalCommand, superClass);

    function TransformStringByExternalCommand() {
      return TransformStringByExternalCommand.__super__.constructor.apply(this, arguments);
    }

    TransformStringByExternalCommand.extend(false);

    TransformStringByExternalCommand.prototype.autoIndent = true;

    TransformStringByExternalCommand.prototype.command = '';

    TransformStringByExternalCommand.prototype.args = [];

    TransformStringByExternalCommand.prototype.stdoutBySelection = null;

    TransformStringByExternalCommand.prototype.execute = function() {
      this.normalizeSelectionsIfNecessary();
      if (this.selectTarget()) {
        return new Promise((function(_this) {
          return function(resolve) {
            return _this.collect(resolve);
          };
        })(this)).then((function(_this) {
          return function() {
            var i, len, ref2, selection, text;
            ref2 = _this.editor.getSelections();
            for (i = 0, len = ref2.length; i < len; i++) {
              selection = ref2[i];
              text = _this.getNewText(selection.getText(), selection);
              selection.insertText(text, {
                autoIndent: _this.autoIndent
              });
            }
            _this.restoreCursorPositionsIfNecessary();
            return _this.activateMode(_this.finalMode, _this.finalSubmode);
          };
        })(this));
      }
    };

    TransformStringByExternalCommand.prototype.collect = function(resolve) {
      var args, command, fn, i, len, processFinished, processRunning, ref2, ref3, ref4, selection;
      this.stdoutBySelection = new Map;
      processRunning = processFinished = 0;
      ref2 = this.editor.getSelections();
      fn = (function(_this) {
        return function(selection) {
          var exit, stdin, stdout;
          stdin = _this.getStdin(selection);
          stdout = function(output) {
            return _this.stdoutBySelection.set(selection, output);
          };
          exit = function(code) {
            processFinished++;
            if (processRunning === processFinished) {
              return resolve();
            }
          };
          return _this.runExternalCommand({
            command: command,
            args: args,
            stdout: stdout,
            exit: exit,
            stdin: stdin
          });
        };
      })(this);
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        ref4 = (ref3 = this.getCommand(selection)) != null ? ref3 : {}, command = ref4.command, args = ref4.args;
        if (!((command != null) && (args != null))) {
          return;
        }
        processRunning++;
        fn(selection);
      }
    };

    TransformStringByExternalCommand.prototype.runExternalCommand = function(options) {
      var bufferedProcess, stdin;
      stdin = options.stdin;
      delete options.stdin;
      bufferedProcess = new BufferedProcess(options);
      bufferedProcess.onWillThrowError((function(_this) {
        return function(arg) {
          var commandName, error, handle;
          error = arg.error, handle = arg.handle;
          if (error.code === 'ENOENT' && error.syscall.indexOf('spawn') === 0) {
            commandName = _this.constructor.getCommandName();
            console.log(commandName + ": Failed to spawn command " + error.path + ".");
            handle();
          }
          return _this.cancelOperation();
        };
      })(this));
      if (stdin) {
        bufferedProcess.process.stdin.write(stdin);
        return bufferedProcess.process.stdin.end();
      }
    };

    TransformStringByExternalCommand.prototype.getNewText = function(text, selection) {
      var ref2;
      return (ref2 = this.getStdout(selection)) != null ? ref2 : text;
    };

    TransformStringByExternalCommand.prototype.getCommand = function(selection) {
      return {
        command: this.command,
        args: this.args
      };
    };

    TransformStringByExternalCommand.prototype.getStdin = function(selection) {
      return selection.getText();
    };

    TransformStringByExternalCommand.prototype.getStdout = function(selection) {
      return this.stdoutBySelection.get(selection);
    };

    return TransformStringByExternalCommand;

  })(TransformString);

  TransformStringBySelectList = (function(superClass) {
    extend(TransformStringBySelectList, superClass);

    function TransformStringBySelectList() {
      return TransformStringBySelectList.__super__.constructor.apply(this, arguments);
    }

    TransformStringBySelectList.extend();

    TransformStringBySelectList.description = "Interactively choose string transformation operator from select-list";

    TransformStringBySelectList.selectListItems = null;

    TransformStringBySelectList.prototype.requireInput = true;

    TransformStringBySelectList.prototype.getItems = function() {
      var base;
      return (base = this.constructor).selectListItems != null ? base.selectListItems : base.selectListItems = this.constructor.stringTransformers.map(function(klass) {
        var displayName;
        if (klass.prototype.hasOwnProperty('displayName')) {
          displayName = klass.prototype.displayName;
        } else {
          displayName = _.humanizeEventName(_.dasherize(klass.name));
        }
        return {
          name: klass,
          displayName: displayName
        };
      });
    };

    TransformStringBySelectList.prototype.initialize = function() {
      TransformStringBySelectList.__super__.initialize.apply(this, arguments);
      this.vimState.onDidConfirmSelectList((function(_this) {
        return function(item) {
          var transformer;
          transformer = item.name;
          if (transformer.prototype.target != null) {
            _this.target = transformer.prototype.target;
          }
          _this.vimState.reset();
          if (_this.target != null) {
            return _this.vimState.operationStack.run(transformer, {
              target: _this.target
            });
          } else {
            return _this.vimState.operationStack.run(transformer);
          }
        };
      })(this));
      return this.focusSelectList({
        items: this.getItems()
      });
    };

    TransformStringBySelectList.prototype.execute = function() {
      throw new Error((this.getName()) + " should not be executed");
    };

    return TransformStringBySelectList;

  })(TransformString);

  TransformWordBySelectList = (function(superClass) {
    extend(TransformWordBySelectList, superClass);

    function TransformWordBySelectList() {
      return TransformWordBySelectList.__super__.constructor.apply(this, arguments);
    }

    TransformWordBySelectList.extend();

    TransformWordBySelectList.prototype.target = "InnerWord";

    return TransformWordBySelectList;

  })(TransformStringBySelectList);

  TransformSmartWordBySelectList = (function(superClass) {
    extend(TransformSmartWordBySelectList, superClass);

    function TransformSmartWordBySelectList() {
      return TransformSmartWordBySelectList.__super__.constructor.apply(this, arguments);
    }

    TransformSmartWordBySelectList.extend();

    TransformSmartWordBySelectList.description = "Transform InnerSmartWord by `transform-string-by-select-list`";

    TransformSmartWordBySelectList.prototype.target = "InnerSmartWord";

    return TransformSmartWordBySelectList;

  })(TransformStringBySelectList);

  ReplaceWithRegister = (function(superClass) {
    extend(ReplaceWithRegister, superClass);

    function ReplaceWithRegister() {
      return ReplaceWithRegister.__super__.constructor.apply(this, arguments);
    }

    ReplaceWithRegister.extend();

    ReplaceWithRegister.description = "Replace target with specified register value";

    ReplaceWithRegister.prototype.getNewText = function(text) {
      return this.vimState.register.getText();
    };

    return ReplaceWithRegister;

  })(TransformString);

  SwapWithRegister = (function(superClass) {
    extend(SwapWithRegister, superClass);

    function SwapWithRegister() {
      return SwapWithRegister.__super__.constructor.apply(this, arguments);
    }

    SwapWithRegister.extend();

    SwapWithRegister.description = "Swap register value with target";

    SwapWithRegister.prototype.getNewText = function(text, selection) {
      var newText;
      newText = this.vimState.register.getText();
      this.setTextToRegister(text, selection);
      return newText;
    };

    return SwapWithRegister;

  })(TransformString);

  Indent = (function(superClass) {
    extend(Indent, superClass);

    function Indent() {
      return Indent.__super__.constructor.apply(this, arguments);
    }

    Indent.extend();

    Indent.prototype.stayByMarker = true;

    Indent.prototype.setToFirstCharacterOnLinewise = true;

    Indent.prototype.wise = 'linewise';

    Indent.prototype.mutateSelection = function(selection) {
      var count, oldText;
      if (this.target.is('CurrentSelection')) {
        oldText = null;
        count = limitNumber(this.getCount(), {
          max: 100
        });
        return this.countTimes(count, (function(_this) {
          return function(arg) {
            var stop;
            stop = arg.stop;
            oldText = selection.getText();
            _this.indent(selection);
            if (selection.getText() === oldText) {
              return stop();
            }
          };
        })(this));
      } else {
        return this.indent(selection);
      }
    };

    Indent.prototype.indent = function(selection) {
      return selection.indentSelectedRows();
    };

    return Indent;

  })(TransformString);

  Outdent = (function(superClass) {
    extend(Outdent, superClass);

    function Outdent() {
      return Outdent.__super__.constructor.apply(this, arguments);
    }

    Outdent.extend();

    Outdent.prototype.indent = function(selection) {
      return selection.outdentSelectedRows();
    };

    return Outdent;

  })(Indent);

  AutoIndent = (function(superClass) {
    extend(AutoIndent, superClass);

    function AutoIndent() {
      return AutoIndent.__super__.constructor.apply(this, arguments);
    }

    AutoIndent.extend();

    AutoIndent.prototype.indent = function(selection) {
      return selection.autoIndentSelectedRows();
    };

    return AutoIndent;

  })(Indent);

  ToggleLineComments = (function(superClass) {
    extend(ToggleLineComments, superClass);

    function ToggleLineComments() {
      return ToggleLineComments.__super__.constructor.apply(this, arguments);
    }

    ToggleLineComments.extend();

    ToggleLineComments.prototype.stayByMarker = true;

    ToggleLineComments.prototype.mutateSelection = function(selection) {
      return selection.toggleLineComments();
    };

    return ToggleLineComments;

  })(TransformString);

  AutoFlow = (function(superClass) {
    extend(AutoFlow, superClass);

    function AutoFlow() {
      return AutoFlow.__super__.constructor.apply(this, arguments);
    }

    AutoFlow.extend();

    AutoFlow.prototype.mutateSelection = function(selection) {
      return atom.commands.dispatch(this.editorElement, 'autoflow:reflow-selection');
    };

    return AutoFlow;

  })(TransformString);

  SurroundBase = (function(superClass) {
    extend(SurroundBase, superClass);

    function SurroundBase() {
      return SurroundBase.__super__.constructor.apply(this, arguments);
    }

    SurroundBase.extend(false);

    SurroundBase.prototype.pairs = [['[', ']'], ['(', ')'], ['{', '}'], ['<', '>']];

    SurroundBase.prototype.pairCharsAllowForwarding = '[](){}';

    SurroundBase.prototype.input = null;

    SurroundBase.prototype.autoIndent = false;

    SurroundBase.prototype.requireInput = true;

    SurroundBase.prototype.requireTarget = true;

    SurroundBase.prototype.supportEarlySelect = true;

    SurroundBase.prototype.focusInputForSurround = function() {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm(this.onConfirmSurround.bind(this));
      inputUI.onDidCancel(this.cancelOperation.bind(this));
      return inputUI.focus();
    };

    SurroundBase.prototype.focusInputForDeleteSurround = function() {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm(this.onConfirmDeleteSurround.bind(this));
      inputUI.onDidCancel(this.cancelOperation.bind(this));
      return inputUI.focus();
    };

    SurroundBase.prototype.getPair = function(char) {
      var pair;
      if (pair = _.detect(this.pairs, function(pair) {
        return indexOf.call(pair, char) >= 0;
      })) {
        return pair;
      } else {
        return [char, char];
      }
    };

    SurroundBase.prototype.surround = function(text, char, options) {
      var close, keepLayout, open, ref2, ref3;
      if (options == null) {
        options = {};
      }
      keepLayout = (ref2 = options.keepLayout) != null ? ref2 : false;
      ref3 = this.getPair(char), open = ref3[0], close = ref3[1];
      if ((!keepLayout) && LineEndingRegExp.test(text)) {
        this.autoIndent = true;
        open += "\n";
        close += "\n";
      }
      if (indexOf.call(this.getConfig('charactersToAddSpaceOnSurround'), char) >= 0 && isSingleLineText(text)) {
        text = ' ' + text + ' ';
      }
      return open + text + close;
    };

    SurroundBase.prototype.deleteSurround = function(text) {
      var close, i, innerText, open;
      open = text[0], innerText = 3 <= text.length ? slice.call(text, 1, i = text.length - 1) : (i = 1, []), close = text[i++];
      innerText = innerText.join('');
      if (isSingleLineText(text) && (open !== close)) {
        return innerText.trim();
      } else {
        return innerText;
      }
    };

    SurroundBase.prototype.onConfirmSurround = function(input1) {
      this.input = input1;
      return this.processOperation();
    };

    SurroundBase.prototype.onConfirmDeleteSurround = function(char) {
      return this.setTarget(this["new"]('APair', {
        pair: this.getPair(char)
      }));
    };

    return SurroundBase;

  })(TransformString);

  Surround = (function(superClass) {
    extend(Surround, superClass);

    function Surround() {
      return Surround.__super__.constructor.apply(this, arguments);
    }

    Surround.extend();

    Surround.description = "Surround target by specified character like `(`, `[`, `\"`";

    Surround.prototype.initialize = function() {
      this.onDidSelectTarget(this.focusInputForSurround.bind(this));
      return Surround.__super__.initialize.apply(this, arguments);
    };

    Surround.prototype.getNewText = function(text) {
      return this.surround(text, this.input);
    };

    return Surround;

  })(SurroundBase);

  SurroundWord = (function(superClass) {
    extend(SurroundWord, superClass);

    function SurroundWord() {
      return SurroundWord.__super__.constructor.apply(this, arguments);
    }

    SurroundWord.extend();

    SurroundWord.description = "Surround **word**";

    SurroundWord.prototype.target = 'InnerWord';

    return SurroundWord;

  })(Surround);

  SurroundSmartWord = (function(superClass) {
    extend(SurroundSmartWord, superClass);

    function SurroundSmartWord() {
      return SurroundSmartWord.__super__.constructor.apply(this, arguments);
    }

    SurroundSmartWord.extend();

    SurroundSmartWord.description = "Surround **smart-word**";

    SurroundSmartWord.prototype.target = 'InnerSmartWord';

    return SurroundSmartWord;

  })(Surround);

  MapSurround = (function(superClass) {
    extend(MapSurround, superClass);

    function MapSurround() {
      return MapSurround.__super__.constructor.apply(this, arguments);
    }

    MapSurround.extend();

    MapSurround.description = "Surround each word(`/\w+/`) within target";

    MapSurround.prototype.occurrence = true;

    MapSurround.prototype.patternForOccurrence = /\w+/g;

    return MapSurround;

  })(Surround);

  DeleteSurround = (function(superClass) {
    extend(DeleteSurround, superClass);

    function DeleteSurround() {
      return DeleteSurround.__super__.constructor.apply(this, arguments);
    }

    DeleteSurround.extend();

    DeleteSurround.description = "Delete specified surround character like `(`, `[`, `\"`";

    DeleteSurround.prototype.requireTarget = false;

    DeleteSurround.prototype.initialize = function() {
      if (!this.hasTarget()) {
        this.focusInputForDeleteSurround();
      }
      return DeleteSurround.__super__.initialize.apply(this, arguments);
    };

    DeleteSurround.prototype.onConfirmDeleteSurround = function(input) {
      DeleteSurround.__super__.onConfirmDeleteSurround.apply(this, arguments);
      this.input = input;
      return this.processOperation();
    };

    DeleteSurround.prototype.getNewText = function(text) {
      return this.deleteSurround(text);
    };

    return DeleteSurround;

  })(SurroundBase);

  DeleteSurroundAnyPair = (function(superClass) {
    extend(DeleteSurroundAnyPair, superClass);

    function DeleteSurroundAnyPair() {
      return DeleteSurroundAnyPair.__super__.constructor.apply(this, arguments);
    }

    DeleteSurroundAnyPair.extend();

    DeleteSurroundAnyPair.description = "Delete surround character by auto-detect paired char from cursor enclosed pair";

    DeleteSurroundAnyPair.prototype.target = 'AAnyPair';

    DeleteSurroundAnyPair.prototype.requireInput = false;

    return DeleteSurroundAnyPair;

  })(DeleteSurround);

  DeleteSurroundAnyPairAllowForwarding = (function(superClass) {
    extend(DeleteSurroundAnyPairAllowForwarding, superClass);

    function DeleteSurroundAnyPairAllowForwarding() {
      return DeleteSurroundAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    DeleteSurroundAnyPairAllowForwarding.extend();

    DeleteSurroundAnyPairAllowForwarding.description = "Delete surround character by auto-detect paired char from cursor enclosed pair and forwarding pair within same line";

    DeleteSurroundAnyPairAllowForwarding.prototype.target = 'AAnyPairAllowForwarding';

    return DeleteSurroundAnyPairAllowForwarding;

  })(DeleteSurroundAnyPair);

  ChangeSurround = (function(superClass) {
    extend(ChangeSurround, superClass);

    function ChangeSurround() {
      return ChangeSurround.__super__.constructor.apply(this, arguments);
    }

    ChangeSurround.extend();

    ChangeSurround.description = "Change surround character, specify both from and to pair char";

    ChangeSurround.prototype.showDeleteCharOnHover = function() {
      var char;
      char = this.editor.getSelectedText()[0];
      return this.vimState.hover.set(char, this.vimState.getOriginalCursorPosition());
    };

    ChangeSurround.prototype.initialize = function() {
      if (this.hasTarget()) {
        this.onDidFailSelectTarget(this.abort.bind(this));
      } else {
        this.onDidFailSelectTarget(this.cancelOperation.bind(this));
        this.focusInputForDeleteSurround();
      }
      ChangeSurround.__super__.initialize.apply(this, arguments);
      return this.onDidSelectTarget((function(_this) {
        return function() {
          _this.showDeleteCharOnHover();
          return _this.focusInputForSurround();
        };
      })(this));
    };

    ChangeSurround.prototype.onConfirmSurround = function(input1) {
      this.input = input1;
      return this.processOperation();
    };

    ChangeSurround.prototype.getNewText = function(text) {
      var innerText;
      innerText = this.deleteSurround(text);
      return this.surround(innerText, this.input, {
        keepLayout: true
      });
    };

    return ChangeSurround;

  })(SurroundBase);

  ChangeSurroundAnyPair = (function(superClass) {
    extend(ChangeSurroundAnyPair, superClass);

    function ChangeSurroundAnyPair() {
      return ChangeSurroundAnyPair.__super__.constructor.apply(this, arguments);
    }

    ChangeSurroundAnyPair.extend();

    ChangeSurroundAnyPair.description = "Change surround character, from char is auto-detected";

    ChangeSurroundAnyPair.prototype.target = "AAnyPair";

    return ChangeSurroundAnyPair;

  })(ChangeSurround);

  ChangeSurroundAnyPairAllowForwarding = (function(superClass) {
    extend(ChangeSurroundAnyPairAllowForwarding, superClass);

    function ChangeSurroundAnyPairAllowForwarding() {
      return ChangeSurroundAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    ChangeSurroundAnyPairAllowForwarding.extend();

    ChangeSurroundAnyPairAllowForwarding.description = "Change surround character, from char is auto-detected from enclosed and forwarding area";

    ChangeSurroundAnyPairAllowForwarding.prototype.target = "AAnyPairAllowForwarding";

    return ChangeSurroundAnyPairAllowForwarding;

  })(ChangeSurroundAnyPair);

  Join = (function(superClass) {
    extend(Join, superClass);

    function Join() {
      return Join.__super__.constructor.apply(this, arguments);
    }

    Join.extend();

    Join.prototype.target = "MoveToRelativeLine";

    Join.prototype.flashTarget = false;

    Join.prototype.restorePositions = false;

    Join.prototype.mutateSelection = function(selection) {
      var end, range;
      if (isLinewiseRange(range = selection.getBufferRange())) {
        selection.setBufferRange(range.translate([0, 0], [-1, 2e308]));
      }
      selection.joinLines();
      end = selection.getBufferRange().end;
      return selection.cursor.setBufferPosition(end.translate([0, -1]));
    };

    return Join;

  })(TransformString);

  JoinBase = (function(superClass) {
    extend(JoinBase, superClass);

    function JoinBase() {
      return JoinBase.__super__.constructor.apply(this, arguments);
    }

    JoinBase.extend(false);

    JoinBase.prototype.wise = 'linewise';

    JoinBase.prototype.trim = false;

    JoinBase.prototype.target = "MoveToRelativeLineMinimumOne";

    JoinBase.prototype.initialize = function() {
      if (this.isRequireInput()) {
        this.focusInput(10);
      }
      return JoinBase.__super__.initialize.apply(this, arguments);
    };

    JoinBase.prototype.getNewText = function(text) {
      var pattern;
      if (this.trim) {
        pattern = /\r?\n[ \t]*/g;
      } else {
        pattern = /\r?\n/g;
      }
      return text.trimRight().replace(pattern, this.input) + "\n";
    };

    return JoinBase;

  })(TransformString);

  JoinWithKeepingSpace = (function(superClass) {
    extend(JoinWithKeepingSpace, superClass);

    function JoinWithKeepingSpace() {
      return JoinWithKeepingSpace.__super__.constructor.apply(this, arguments);
    }

    JoinWithKeepingSpace.extend();

    JoinWithKeepingSpace.registerToSelectList();

    JoinWithKeepingSpace.prototype.input = '';

    return JoinWithKeepingSpace;

  })(JoinBase);

  JoinByInput = (function(superClass) {
    extend(JoinByInput, superClass);

    function JoinByInput() {
      return JoinByInput.__super__.constructor.apply(this, arguments);
    }

    JoinByInput.extend();

    JoinByInput.registerToSelectList();

    JoinByInput.description = "Transform multi-line to single-line by with specified separator character";

    JoinByInput.prototype.requireInput = true;

    JoinByInput.prototype.trim = true;

    return JoinByInput;

  })(JoinBase);

  JoinByInputWithKeepingSpace = (function(superClass) {
    extend(JoinByInputWithKeepingSpace, superClass);

    function JoinByInputWithKeepingSpace() {
      return JoinByInputWithKeepingSpace.__super__.constructor.apply(this, arguments);
    }

    JoinByInputWithKeepingSpace.extend();

    JoinByInputWithKeepingSpace.registerToSelectList();

    JoinByInputWithKeepingSpace.description = "Join lines without padding space between each line";

    JoinByInputWithKeepingSpace.prototype.trim = false;

    return JoinByInputWithKeepingSpace;

  })(JoinByInput);

  SplitString = (function(superClass) {
    extend(SplitString, superClass);

    function SplitString() {
      return SplitString.__super__.constructor.apply(this, arguments);
    }

    SplitString.extend();

    SplitString.registerToSelectList();

    SplitString.description = "Split single-line into multi-line by splitting specified separator chars";

    SplitString.prototype.requireInput = true;

    SplitString.prototype.input = null;

    SplitString.prototype.target = "MoveToRelativeLine";

    SplitString.prototype.keepSplitter = false;

    SplitString.prototype.initialize = function() {
      this.onDidSetTarget((function(_this) {
        return function() {
          return _this.focusInput(10);
        };
      })(this));
      return SplitString.__super__.initialize.apply(this, arguments);
    };

    SplitString.prototype.getNewText = function(text) {
      var input, lineSeparator, regex;
      input = this.input || "\\n";
      regex = RegExp("" + (_.escapeRegExp(input)), "g");
      if (this.keepSplitter) {
        lineSeparator = this.input + "\n";
      } else {
        lineSeparator = "\n";
      }
      return text.replace(regex, lineSeparator);
    };

    return SplitString;

  })(TransformString);

  SplitStringWithKeepingSplitter = (function(superClass) {
    extend(SplitStringWithKeepingSplitter, superClass);

    function SplitStringWithKeepingSplitter() {
      return SplitStringWithKeepingSplitter.__super__.constructor.apply(this, arguments);
    }

    SplitStringWithKeepingSplitter.extend();

    SplitStringWithKeepingSplitter.registerToSelectList();

    SplitStringWithKeepingSplitter.prototype.keepSplitter = true;

    return SplitStringWithKeepingSplitter;

  })(SplitString);

  ChangeOrder = (function(superClass) {
    extend(ChangeOrder, superClass);

    function ChangeOrder() {
      return ChangeOrder.__super__.constructor.apply(this, arguments);
    }

    ChangeOrder.extend(false);

    ChangeOrder.prototype.wise = 'linewise';

    ChangeOrder.prototype.getNewText = function(text) {
      return this.getNewRows(splitTextByNewLine(text)).join("\n") + "\n";
    };

    return ChangeOrder;

  })(TransformString);

  Reverse = (function(superClass) {
    extend(Reverse, superClass);

    function Reverse() {
      return Reverse.__super__.constructor.apply(this, arguments);
    }

    Reverse.extend();

    Reverse.registerToSelectList();

    Reverse.description = "Reverse lines(e.g reverse selected three line)";

    Reverse.prototype.getNewRows = function(rows) {
      return rows.reverse();
    };

    return Reverse;

  })(ChangeOrder);

  Sort = (function(superClass) {
    extend(Sort, superClass);

    function Sort() {
      return Sort.__super__.constructor.apply(this, arguments);
    }

    Sort.extend();

    Sort.registerToSelectList();

    Sort.description = "Sort lines alphabetically";

    Sort.prototype.getNewRows = function(rows) {
      return rows.sort();
    };

    return Sort;

  })(ChangeOrder);

  SortCaseInsensitively = (function(superClass) {
    extend(SortCaseInsensitively, superClass);

    function SortCaseInsensitively() {
      return SortCaseInsensitively.__super__.constructor.apply(this, arguments);
    }

    SortCaseInsensitively.extend();

    SortCaseInsensitively.registerToSelectList();

    SortCaseInsensitively.description = "Sort lines alphabetically (case insensitive)";

    SortCaseInsensitively.prototype.getNewRows = function(rows) {
      return rows.sort(function(rowA, rowB) {
        return rowA.localeCompare(rowB, {
          sensitivity: 'base'
        });
      });
    };

    return SortCaseInsensitively;

  })(ChangeOrder);

  SortByNumber = (function(superClass) {
    extend(SortByNumber, superClass);

    function SortByNumber() {
      return SortByNumber.__super__.constructor.apply(this, arguments);
    }

    SortByNumber.extend();

    SortByNumber.registerToSelectList();

    SortByNumber.description = "Sort lines numerically";

    SortByNumber.prototype.getNewRows = function(rows) {
      return _.sortBy(rows, function(row) {
        return Number.parseInt(row) || 2e308;
      });
    };

    return SortByNumber;

  })(ChangeOrder);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxtbENBQUE7SUFBQTs7Ozs7O0VBQUEsZ0JBQUEsR0FBbUI7O0VBQ25CLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBMkIsT0FBQSxDQUFRLE1BQVIsQ0FBM0IsRUFBQyxxQ0FBRCxFQUFrQjs7RUFFbEIsT0FNSSxPQUFBLENBQVEsU0FBUixDQU5KLEVBQ0Usd0NBREYsRUFFRSxzQ0FGRixFQUdFLDhCQUhGLEVBSUUsb0RBSkYsRUFLRTs7RUFFRixLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUNSLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxVQUFkOztFQUlMOzs7Ozs7O0lBQ0osZUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOzs4QkFDQSxXQUFBLEdBQWE7OzhCQUNiLGNBQUEsR0FBZ0I7OzhCQUNoQixVQUFBLEdBQVk7OzhCQUNaLGlCQUFBLEdBQW1COztJQUNuQixlQUFDLENBQUEsa0JBQUQsR0FBcUI7O0lBRXJCLGVBQUMsQ0FBQSxvQkFBRCxHQUF1QixTQUFBO2FBQ3JCLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxJQUFwQixDQUF5QixJQUF6QjtJQURxQjs7OEJBR3ZCLGVBQUEsR0FBaUIsU0FBQyxTQUFEO0FBQ2YsVUFBQTtNQUFBLElBQUcsSUFBQSxHQUFPLElBQUMsQ0FBQSxVQUFELENBQVksU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFaLEVBQWlDLFNBQWpDLENBQVY7ZUFDRSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixFQUEyQjtVQUFFLFlBQUQsSUFBQyxDQUFBLFVBQUY7U0FBM0IsRUFERjs7SUFE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XG58XFxyXFxuKSQvXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0J1ZmZlcmVkUHJvY2VzcywgUmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcblxue1xuICBpc1NpbmdsZUxpbmVUZXh0XG4gIGlzTGluZXdpc2VSYW5nZVxuICBsaW1pdE51bWJlclxuICB0b2dnbGVDYXNlRm9yQ2hhcmFjdGVyXG4gIHNwbGl0VGV4dEJ5TmV3TGluZVxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuT3BlcmF0b3IgPSBCYXNlLmdldENsYXNzKCdPcGVyYXRvcicpXG5cbiMgVHJhbnNmb3JtU3RyaW5nXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBUcmFuc2Zvcm1TdHJpbmcgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKGZhbHNlKVxuICB0cmFja0NoYW5nZTogdHJ1ZVxuICBzdGF5T3B0aW9uTmFtZTogJ3N0YXlPblRyYW5zZm9ybVN0cmluZydcbiAgYXV0b0luZGVudDogZmFsc2VcbiAgYXV0b0luZGVudE5ld2xpbmU6IGZhbHNlXG4gIEBzdHJpbmdUcmFuc2Zvcm1lcnM6IFtdXG5cbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0OiAtPlxuICAgIEBzdHJpbmdUcmFuc2Zvcm1lcnMucHVzaCh0aGlzKVxuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBpZiB0ZXh0ID0gQGdldE5ld1RleHQoc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uKVxuICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwge0BhdXRvSW5kZW50fSlcblxuY2xhc3MgVG9nZ2xlQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBIZWxsbyBXb3JsZGAgLT4gYGhFTExPIHdPUkxEYFwiXG4gIGRpc3BsYXlOYW1lOiAnVG9nZ2xlIH4nXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgdGV4dC5yZXBsYWNlKC8uL2csIHRvZ2dsZUNhc2VGb3JDaGFyYWN0ZXIpXG5cbmNsYXNzIFRvZ2dsZUNhc2VBbmRNb3ZlUmlnaHQgZXh0ZW5kcyBUb2dnbGVDYXNlXG4gIEBleHRlbmQoKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9uczogZmFsc2VcbiAgdGFyZ2V0OiAnTW92ZVJpZ2h0J1xuXG5jbGFzcyBVcHBlckNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG8gV29ybGRgIC0+IGBIRUxMTyBXT1JMRGBcIlxuICBkaXNwbGF5TmFtZTogJ1VwcGVyJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICB0ZXh0LnRvVXBwZXJDYXNlKClcblxuY2xhc3MgTG93ZXJDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvIFdvcmxkYCAtPiBgaGVsbG8gd29ybGRgXCJcbiAgZGlzcGxheU5hbWU6ICdMb3dlcidcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgdGV4dC50b0xvd2VyQ2FzZSgpXG5cbiMgUmVwbGFjZVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBSZXBsYWNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBpbnB1dDogbnVsbFxuICBmbGFzaENoZWNrcG9pbnQ6ICdkaWQtc2VsZWN0LW9jY3VycmVuY2UnXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuICBhdXRvSW5kZW50TmV3bGluZTogdHJ1ZVxuICBzdXBwb3J0RWFybHlTZWxlY3Q6IHRydWVcblxuICBpbml0aWFsaXplOiAtPlxuICAgIEBvbkRpZFNlbGVjdFRhcmdldChAZm9jdXNJbnB1dC5iaW5kKHRoaXMpKVxuICAgIHN1cGVyXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaWYgQHRhcmdldC5pcygnTW92ZVJpZ2h0QnVmZmVyQ29sdW1uJykgYW5kIHRleHQubGVuZ3RoIGlzbnQgQGdldENvdW50KClcbiAgICAgIHJldHVyblxuXG4gICAgaW5wdXQgPSBAZ2V0SW5wdXQoKSBvciBcIlxcblwiXG4gICAgaWYgaW5wdXQgaXMgXCJcXG5cIlxuICAgICAgQHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuICAgIHRleHQucmVwbGFjZSgvLi9nLCBpbnB1dClcblxuY2xhc3MgUmVwbGFjZUNoYXJhY3RlciBleHRlbmRzIFJlcGxhY2VcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJNb3ZlUmlnaHRCdWZmZXJDb2x1bW5cIlxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgRFVQIG1lYW5pbmcgd2l0aCBTcGxpdFN0cmluZyBuZWVkIGNvbnNvbGlkYXRlLlxuY2xhc3MgU3BsaXRCeUNoYXJhY3RlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgdGV4dC5zcGxpdCgnJykuam9pbignICcpXG5cbmNsYXNzIENhbWVsQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZGlzcGxheU5hbWU6ICdDYW1lbGl6ZSdcbiAgQGRlc2NyaXB0aW9uOiBcImBoZWxsby13b3JsZGAgLT4gYGhlbGxvV29ybGRgXCJcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgXy5jYW1lbGl6ZSh0ZXh0KVxuXG5jbGFzcyBTbmFrZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG9Xb3JsZGAgLT4gYGhlbGxvX3dvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnVW5kZXJzY29yZSBfJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBfLnVuZGVyc2NvcmUodGV4dClcblxuY2xhc3MgUGFzY2FsQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBoZWxsb193b3JsZGAgLT4gYEhlbGxvV29ybGRgXCJcbiAgZGlzcGxheU5hbWU6ICdQYXNjYWxpemUnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKHRleHQpKVxuXG5jbGFzcyBEYXNoQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZGlzcGxheU5hbWU6ICdEYXNoZXJpemUgLSdcbiAgQGRlc2NyaXB0aW9uOiBcIkhlbGxvV29ybGQgLT4gaGVsbG8td29ybGRcIlxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBfLmRhc2hlcml6ZSh0ZXh0KVxuXG5jbGFzcyBUaXRsZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG9Xb3JsZGAgLT4gYEhlbGxvIFdvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnVGl0bGl6ZSdcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgXy5odW1hbml6ZUV2ZW50TmFtZShfLmRhc2hlcml6ZSh0ZXh0KSlcblxuY2xhc3MgRW5jb2RlVXJpQ29tcG9uZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvIFdvcmxkYCAtPiBgSGVsbG8lMjBXb3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ0VuY29kZSBVUkkgQ29tcG9uZW50ICUnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KVxuXG5jbGFzcyBEZWNvZGVVcmlDb21wb25lbnQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG8lMjBXb3JsZGAgLT4gYEhlbGxvIFdvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnRGVjb2RlIFVSSSBDb21wb25lbnQgJSUnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGRlY29kZVVSSUNvbXBvbmVudCh0ZXh0KVxuXG5jbGFzcyBUcmltU3RyaW5nIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYCBoZWxsbyBgIC0+IGBoZWxsb2BcIlxuICBkaXNwbGF5TmFtZTogJ1RyaW0gc3RyaW5nJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICB0ZXh0LnRyaW0oKVxuXG5jbGFzcyBDb21wYWN0U3BhY2VzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYCAgYSAgICBiICAgIGNgIC0+IGBhIGIgY2BcIlxuICBkaXNwbGF5TmFtZTogJ0NvbXBhY3Qgc3BhY2UnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGlmIHRleHQubWF0Y2goL15bIF0rJC8pXG4gICAgICAnICdcbiAgICBlbHNlXG4gICAgICAjIERvbid0IGNvbXBhY3QgZm9yIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlIHNwYWNlcy5cbiAgICAgIHRleHQucmVwbGFjZSAvXihcXHMqKSguKj8pKFxccyopJC9nbSwgKG0sIGxlYWRpbmcsIG1pZGRsZSwgdHJhaWxpbmcpIC0+XG4gICAgICAgIGxlYWRpbmcgKyBtaWRkbGUuc3BsaXQoL1sgXFx0XSsvKS5qb2luKCcgJykgKyB0cmFpbGluZ1xuXG5jbGFzcyBSZW1vdmVMZWFkaW5nV2hpdGVTcGFjZXMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgQGRlc2NyaXB0aW9uOiBcImAgIGEgYiBjYCAtPiBgYSBiIGNgXCJcbiAgZ2V0TmV3VGV4dDogKHRleHQsIHNlbGVjdGlvbikgLT5cbiAgICB0cmltTGVmdCA9ICh0ZXh0KSAtPiB0ZXh0LnRyaW1MZWZ0KClcbiAgICBzcGxpdFRleHRCeU5ld0xpbmUodGV4dCkubWFwKHRyaW1MZWZ0KS5qb2luKFwiXFxuXCIpICsgXCJcXG5cIlxuXG5jbGFzcyBDb252ZXJ0VG9Tb2Z0VGFiIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBkaXNwbGF5TmFtZTogJ1NvZnQgVGFiJ1xuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBzY2FuRm9yd2FyZCAvXFx0L2csIHtzY2FuUmFuZ2U6IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpfSwgKHtyYW5nZSwgcmVwbGFjZX0pID0+XG4gICAgICAjIFJlcGxhY2UgXFx0IHRvIHNwYWNlcyB3aGljaCBsZW5ndGggaXMgdmFyeSBkZXBlbmRpbmcgb24gdGFiU3RvcCBhbmQgdGFiTGVuZ2h0XG4gICAgICAjIFNvIHdlIGRpcmVjdGx5IGNvbnN1bHQgaXQncyBzY3JlZW4gcmVwcmVzZW50aW5nIGxlbmd0aC5cbiAgICAgIGxlbmd0aCA9IEBlZGl0b3Iuc2NyZWVuUmFuZ2VGb3JCdWZmZXJSYW5nZShyYW5nZSkuZ2V0RXh0ZW50KCkuY29sdW1uXG4gICAgICByZXBsYWNlKFwiIFwiLnJlcGVhdChsZW5ndGgpKVxuXG5jbGFzcyBDb252ZXJ0VG9IYXJkVGFiIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBkaXNwbGF5TmFtZTogJ0hhcmQgVGFiJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICB0YWJMZW5ndGggPSBAZWRpdG9yLmdldFRhYkxlbmd0aCgpXG4gICAgQHNjYW5Gb3J3YXJkIC9bIFxcdF0rL2csIHtzY2FuUmFuZ2U6IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpfSwgKHtyYW5nZSwgcmVwbGFjZX0pID0+XG4gICAgICB7c3RhcnQsIGVuZH0gPSBAZWRpdG9yLnNjcmVlblJhbmdlRm9yQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICBzdGFydENvbHVtbiA9IHN0YXJ0LmNvbHVtblxuICAgICAgZW5kQ29sdW1uID0gZW5kLmNvbHVtblxuXG4gICAgICAjIFdlIGNhbid0IG5haXZlbHkgcmVwbGFjZSBzcGFjZXMgdG8gdGFiLCB3ZSBoYXZlIHRvIGNvbnNpZGVyIHZhbGlkIHRhYlN0b3AgY29sdW1uXG4gICAgICAjIElmIG5leHRUYWJTdG9wIGNvbHVtbiBleGNlZWRzIHJlcGxhY2FibGUgcmFuZ2UsIHdlIHBhZCB3aXRoIHNwYWNlcy5cbiAgICAgIG5ld1RleHQgPSAnJ1xuICAgICAgbG9vcFxuICAgICAgICByZW1haW5kZXIgPSBzdGFydENvbHVtbiAlJSB0YWJMZW5ndGhcbiAgICAgICAgbmV4dFRhYlN0b3AgPSBzdGFydENvbHVtbiArIChpZiByZW1haW5kZXIgaXMgMCB0aGVuIHRhYkxlbmd0aCBlbHNlIHJlbWFpbmRlcilcbiAgICAgICAgaWYgbmV4dFRhYlN0b3AgPiBlbmRDb2x1bW5cbiAgICAgICAgICBuZXdUZXh0ICs9IFwiIFwiLnJlcGVhdChlbmRDb2x1bW4gLSBzdGFydENvbHVtbilcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG5ld1RleHQgKz0gXCJcXHRcIlxuICAgICAgICBzdGFydENvbHVtbiA9IG5leHRUYWJTdG9wXG4gICAgICAgIGJyZWFrIGlmIHN0YXJ0Q29sdW1uID49IGVuZENvbHVtblxuXG4gICAgICByZXBsYWNlKG5ld1RleHQpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nQnlFeHRlcm5hbENvbW1hbmQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZChmYWxzZSlcbiAgYXV0b0luZGVudDogdHJ1ZVxuICBjb21tYW5kOiAnJyAjIGUuZy4gY29tbWFuZDogJ3NvcnQnXG4gIGFyZ3M6IFtdICMgZS5nIGFyZ3M6IFsnLXJuJ11cbiAgc3Rkb3V0QnlTZWxlY3Rpb246IG51bGxcblxuICBleGVjdXRlOiAtPlxuICAgIEBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKVxuICAgIGlmIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgbmV3IFByb21pc2UgKHJlc29sdmUpID0+XG4gICAgICAgIEBjb2xsZWN0KHJlc29sdmUpXG4gICAgICAudGhlbiA9PlxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgdGV4dCA9IEBnZXROZXdUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCB7QGF1dG9JbmRlbnR9KVxuICAgICAgICBAcmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgICAgQGFjdGl2YXRlTW9kZShAZmluYWxNb2RlLCBAZmluYWxTdWJtb2RlKVxuXG4gIGNvbGxlY3Q6IChyZXNvbHZlKSAtPlxuICAgIEBzdGRvdXRCeVNlbGVjdGlvbiA9IG5ldyBNYXBcbiAgICBwcm9jZXNzUnVubmluZyA9IHByb2Nlc3NGaW5pc2hlZCA9IDBcbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICB7Y29tbWFuZCwgYXJnc30gPSBAZ2V0Q29tbWFuZChzZWxlY3Rpb24pID8ge31cbiAgICAgIHJldHVybiB1bmxlc3MgKGNvbW1hbmQ/IGFuZCBhcmdzPylcbiAgICAgIHByb2Nlc3NSdW5uaW5nKytcbiAgICAgIGRvIChzZWxlY3Rpb24pID0+XG4gICAgICAgIHN0ZGluID0gQGdldFN0ZGluKHNlbGVjdGlvbilcbiAgICAgICAgc3Rkb3V0ID0gKG91dHB1dCkgPT5cbiAgICAgICAgICBAc3Rkb3V0QnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgb3V0cHV0KVxuICAgICAgICBleGl0ID0gKGNvZGUpIC0+XG4gICAgICAgICAgcHJvY2Vzc0ZpbmlzaGVkKytcbiAgICAgICAgICByZXNvbHZlKCkgaWYgKHByb2Nlc3NSdW5uaW5nIGlzIHByb2Nlc3NGaW5pc2hlZClcbiAgICAgICAgQHJ1bkV4dGVybmFsQ29tbWFuZCB7Y29tbWFuZCwgYXJncywgc3Rkb3V0LCBleGl0LCBzdGRpbn1cblxuICBydW5FeHRlcm5hbENvbW1hbmQ6IChvcHRpb25zKSAtPlxuICAgIHN0ZGluID0gb3B0aW9ucy5zdGRpblxuICAgIGRlbGV0ZSBvcHRpb25zLnN0ZGluXG4gICAgYnVmZmVyZWRQcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2VzcyhvcHRpb25zKVxuICAgIGJ1ZmZlcmVkUHJvY2Vzcy5vbldpbGxUaHJvd0Vycm9yICh7ZXJyb3IsIGhhbmRsZX0pID0+XG4gICAgICAjIFN1cHByZXNzIGNvbW1hbmQgbm90IGZvdW5kIGVycm9yIGludGVudGlvbmFsbHkuXG4gICAgICBpZiBlcnJvci5jb2RlIGlzICdFTk9FTlQnIGFuZCBlcnJvci5zeXNjYWxsLmluZGV4T2YoJ3NwYXduJykgaXMgMFxuICAgICAgICBjb21tYW5kTmFtZSA9IEBjb25zdHJ1Y3Rvci5nZXRDb21tYW5kTmFtZSgpXG4gICAgICAgIGNvbnNvbGUubG9nIFwiI3tjb21tYW5kTmFtZX06IEZhaWxlZCB0byBzcGF3biBjb21tYW5kICN7ZXJyb3IucGF0aH0uXCJcbiAgICAgICAgaGFuZGxlKClcbiAgICAgIEBjYW5jZWxPcGVyYXRpb24oKVxuXG4gICAgaWYgc3RkaW5cbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLndyaXRlKHN0ZGluKVxuICAgICAgYnVmZmVyZWRQcm9jZXNzLnByb2Nlc3Muc3RkaW4uZW5kKClcblxuICBnZXROZXdUZXh0OiAodGV4dCwgc2VsZWN0aW9uKSAtPlxuICAgIEBnZXRTdGRvdXQoc2VsZWN0aW9uKSA/IHRleHRcblxuICAjIEZvciBlYXNpbHkgZXh0ZW5kIGJ5IHZtcCBwbHVnaW4uXG4gIGdldENvbW1hbmQ6IChzZWxlY3Rpb24pIC0+IHtAY29tbWFuZCwgQGFyZ3N9XG4gIGdldFN0ZGluOiAoc2VsZWN0aW9uKSAtPiBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gIGdldFN0ZG91dDogKHNlbGVjdGlvbikgLT4gQHN0ZG91dEJ5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nQnlTZWxlY3RMaXN0IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiSW50ZXJhY3RpdmVseSBjaG9vc2Ugc3RyaW5nIHRyYW5zZm9ybWF0aW9uIG9wZXJhdG9yIGZyb20gc2VsZWN0LWxpc3RcIlxuICBAc2VsZWN0TGlzdEl0ZW1zOiBudWxsXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuXG4gIGdldEl0ZW1zOiAtPlxuICAgIEBjb25zdHJ1Y3Rvci5zZWxlY3RMaXN0SXRlbXMgPz0gQGNvbnN0cnVjdG9yLnN0cmluZ1RyYW5zZm9ybWVycy5tYXAgKGtsYXNzKSAtPlxuICAgICAgaWYga2xhc3M6Omhhc093blByb3BlcnR5KCdkaXNwbGF5TmFtZScpXG4gICAgICAgIGRpc3BsYXlOYW1lID0ga2xhc3M6OmRpc3BsYXlOYW1lXG4gICAgICBlbHNlXG4gICAgICAgIGRpc3BsYXlOYW1lID0gXy5odW1hbml6ZUV2ZW50TmFtZShfLmRhc2hlcml6ZShrbGFzcy5uYW1lKSlcbiAgICAgIHtuYW1lOiBrbGFzcywgZGlzcGxheU5hbWV9XG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuXG4gICAgQHZpbVN0YXRlLm9uRGlkQ29uZmlybVNlbGVjdExpc3QgKGl0ZW0pID0+XG4gICAgICB0cmFuc2Zvcm1lciA9IGl0ZW0ubmFtZVxuICAgICAgQHRhcmdldCA9IHRyYW5zZm9ybWVyOjp0YXJnZXQgaWYgdHJhbnNmb3JtZXI6OnRhcmdldD9cbiAgICAgIEB2aW1TdGF0ZS5yZXNldCgpXG4gICAgICBpZiBAdGFyZ2V0P1xuICAgICAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKHRyYW5zZm9ybWVyLCB7QHRhcmdldH0pXG4gICAgICBlbHNlXG4gICAgICAgIEB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4odHJhbnNmb3JtZXIpXG5cbiAgICBAZm9jdXNTZWxlY3RMaXN0KGl0ZW1zOiBAZ2V0SXRlbXMoKSlcblxuICBleGVjdXRlOiAtPlxuICAgICMgTkVWRVIgYmUgZXhlY3V0ZWQgc2luY2Ugb3BlcmF0aW9uU3RhY2sgaXMgcmVwbGFjZWQgd2l0aCBzZWxlY3RlZCB0cmFuc2Zvcm1lclxuICAgIHRocm93IG5ldyBFcnJvcihcIiN7QGdldE5hbWUoKX0gc2hvdWxkIG5vdCBiZSBleGVjdXRlZFwiKVxuXG5jbGFzcyBUcmFuc2Zvcm1Xb3JkQnlTZWxlY3RMaXN0IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nQnlTZWxlY3RMaXN0XG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6IFwiSW5uZXJXb3JkXCJcblxuY2xhc3MgVHJhbnNmb3JtU21hcnRXb3JkQnlTZWxlY3RMaXN0IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nQnlTZWxlY3RMaXN0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiVHJhbnNmb3JtIElubmVyU21hcnRXb3JkIGJ5IGB0cmFuc2Zvcm0tc3RyaW5nLWJ5LXNlbGVjdC1saXN0YFwiXG4gIHRhcmdldDogXCJJbm5lclNtYXJ0V29yZFwiXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgUmVwbGFjZVdpdGhSZWdpc3RlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlJlcGxhY2UgdGFyZ2V0IHdpdGggc3BlY2lmaWVkIHJlZ2lzdGVyIHZhbHVlXCJcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgQHZpbVN0YXRlLnJlZ2lzdGVyLmdldFRleHQoKVxuXG4jIFNhdmUgdGV4dCB0byByZWdpc3RlciBiZWZvcmUgcmVwbGFjZVxuY2xhc3MgU3dhcFdpdGhSZWdpc3RlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlN3YXAgcmVnaXN0ZXIgdmFsdWUgd2l0aCB0YXJnZXRcIlxuICBnZXROZXdUZXh0OiAodGV4dCwgc2VsZWN0aW9uKSAtPlxuICAgIG5ld1RleHQgPSBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dCgpXG4gICAgQHNldFRleHRUb1JlZ2lzdGVyKHRleHQsIHNlbGVjdGlvbilcbiAgICBuZXdUZXh0XG5cbiMgSW5kZW50IDwgVHJhbnNmb3JtU3RyaW5nXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEluZGVudCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgc3RheUJ5TWFya2VyOiB0cnVlXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlOiB0cnVlXG4gIHdpc2U6ICdsaW5ld2lzZSdcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgIyBOZWVkIGNvdW50IHRpbWVzIGluZGVudGF0aW9uIGluIHZpc3VhbC1tb2RlIGFuZCBpdHMgcmVwZWF0KGAuYCkuXG4gICAgaWYgQHRhcmdldC5pcygnQ3VycmVudFNlbGVjdGlvbicpXG4gICAgICBvbGRUZXh0ID0gbnVsbFxuICAgICAgICMgbGltaXQgdG8gMTAwIHRvIGF2b2lkIGZyZWV6aW5nIGJ5IGFjY2lkZW50YWwgYmlnIG51bWJlci5cbiAgICAgIGNvdW50ID0gbGltaXROdW1iZXIoQGdldENvdW50KCksIG1heDogMTAwKVxuICAgICAgQGNvdW50VGltZXMgY291bnQsICh7c3RvcH0pID0+XG4gICAgICAgIG9sZFRleHQgPSBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gICAgICAgIEBpbmRlbnQoc2VsZWN0aW9uKVxuICAgICAgICBzdG9wKCkgaWYgc2VsZWN0aW9uLmdldFRleHQoKSBpcyBvbGRUZXh0XG4gICAgZWxzZVxuICAgICAgQGluZGVudChzZWxlY3Rpb24pXG5cbiAgaW5kZW50OiAoc2VsZWN0aW9uKSAtPlxuICAgIHNlbGVjdGlvbi5pbmRlbnRTZWxlY3RlZFJvd3MoKVxuXG5jbGFzcyBPdXRkZW50IGV4dGVuZHMgSW5kZW50XG4gIEBleHRlbmQoKVxuICBpbmRlbnQ6IChzZWxlY3Rpb24pIC0+XG4gICAgc2VsZWN0aW9uLm91dGRlbnRTZWxlY3RlZFJvd3MoKVxuXG5jbGFzcyBBdXRvSW5kZW50IGV4dGVuZHMgSW5kZW50XG4gIEBleHRlbmQoKVxuICBpbmRlbnQ6IChzZWxlY3Rpb24pIC0+XG4gICAgc2VsZWN0aW9uLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoKVxuXG5jbGFzcyBUb2dnbGVMaW5lQ29tbWVudHMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIHN0YXlCeU1hcmtlcjogdHJ1ZVxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgc2VsZWN0aW9uLnRvZ2dsZUxpbmVDb21tZW50cygpXG5cbmNsYXNzIEF1dG9GbG93IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChAZWRpdG9yRWxlbWVudCwgJ2F1dG9mbG93OnJlZmxvdy1zZWxlY3Rpb24nKVxuXG4jIFN1cnJvdW5kIDwgVHJhbnNmb3JtU3RyaW5nXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFN1cnJvdW5kQmFzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKGZhbHNlKVxuICBwYWlyczogW1xuICAgIFsnWycsICddJ11cbiAgICBbJygnLCAnKSddXG4gICAgWyd7JywgJ30nXVxuICAgIFsnPCcsICc+J11cbiAgXVxuICBwYWlyQ2hhcnNBbGxvd0ZvcndhcmRpbmc6ICdbXSgpe30nXG4gIGlucHV0OiBudWxsXG4gIGF1dG9JbmRlbnQ6IGZhbHNlXG5cbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIHJlcXVpcmVUYXJnZXQ6IHRydWVcbiAgc3VwcG9ydEVhcmx5U2VsZWN0OiB0cnVlICMgRXhwZXJpbWVudGFsXG5cbiAgZm9jdXNJbnB1dEZvclN1cnJvdW5kOiAtPlxuICAgIGlucHV0VUkgPSBAbmV3SW5wdXRVSSgpXG4gICAgaW5wdXRVSS5vbkRpZENvbmZpcm0oQG9uQ29uZmlybVN1cnJvdW5kLmJpbmQodGhpcykpXG4gICAgaW5wdXRVSS5vbkRpZENhbmNlbChAY2FuY2VsT3BlcmF0aW9uLmJpbmQodGhpcykpXG4gICAgaW5wdXRVSS5mb2N1cygpXG5cbiAgZm9jdXNJbnB1dEZvckRlbGV0ZVN1cnJvdW5kOiAtPlxuICAgIGlucHV0VUkgPSBAbmV3SW5wdXRVSSgpXG4gICAgaW5wdXRVSS5vbkRpZENvbmZpcm0oQG9uQ29uZmlybURlbGV0ZVN1cnJvdW5kLmJpbmQodGhpcykpXG4gICAgaW5wdXRVSS5vbkRpZENhbmNlbChAY2FuY2VsT3BlcmF0aW9uLmJpbmQodGhpcykpXG4gICAgaW5wdXRVSS5mb2N1cygpXG5cbiAgZ2V0UGFpcjogKGNoYXIpIC0+XG4gICAgaWYgcGFpciA9IF8uZGV0ZWN0KEBwYWlycywgKHBhaXIpIC0+IGNoYXIgaW4gcGFpcilcbiAgICAgIHBhaXJcbiAgICBlbHNlXG4gICAgICBbY2hhciwgY2hhcl1cblxuICBzdXJyb3VuZDogKHRleHQsIGNoYXIsIG9wdGlvbnM9e30pIC0+XG4gICAga2VlcExheW91dCA9IG9wdGlvbnMua2VlcExheW91dCA/IGZhbHNlXG4gICAgW29wZW4sIGNsb3NlXSA9IEBnZXRQYWlyKGNoYXIpXG4gICAgaWYgKG5vdCBrZWVwTGF5b3V0KSBhbmQgTGluZUVuZGluZ1JlZ0V4cC50ZXN0KHRleHQpXG4gICAgICBAYXV0b0luZGVudCA9IHRydWUgIyBbRklYTUVdXG4gICAgICBvcGVuICs9IFwiXFxuXCJcbiAgICAgIGNsb3NlICs9IFwiXFxuXCJcblxuICAgIGlmIGNoYXIgaW4gQGdldENvbmZpZygnY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJykgYW5kIGlzU2luZ2xlTGluZVRleHQodGV4dClcbiAgICAgIHRleHQgPSAnICcgKyB0ZXh0ICsgJyAnXG5cbiAgICBvcGVuICsgdGV4dCArIGNsb3NlXG5cbiAgZGVsZXRlU3Vycm91bmQ6ICh0ZXh0KSAtPlxuICAgIFtvcGVuLCBpbm5lclRleHQuLi4sIGNsb3NlXSA9IHRleHRcbiAgICBpbm5lclRleHQgPSBpbm5lclRleHQuam9pbignJylcbiAgICBpZiBpc1NpbmdsZUxpbmVUZXh0KHRleHQpIGFuZCAob3BlbiBpc250IGNsb3NlKVxuICAgICAgaW5uZXJUZXh0LnRyaW0oKVxuICAgIGVsc2VcbiAgICAgIGlubmVyVGV4dFxuXG4gIG9uQ29uZmlybVN1cnJvdW5kOiAoQGlucHV0KSAtPlxuICAgIEBwcm9jZXNzT3BlcmF0aW9uKClcblxuICBvbkNvbmZpcm1EZWxldGVTdXJyb3VuZDogKGNoYXIpIC0+XG4gICAgQHNldFRhcmdldCBAbmV3KCdBUGFpcicsIHBhaXI6IEBnZXRQYWlyKGNoYXIpKVxuXG5jbGFzcyBTdXJyb3VuZCBleHRlbmRzIFN1cnJvdW5kQmFzZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlN1cnJvdW5kIHRhcmdldCBieSBzcGVjaWZpZWQgY2hhcmFjdGVyIGxpa2UgYChgLCBgW2AsIGBcXFwiYFwiXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAb25EaWRTZWxlY3RUYXJnZXQoQGZvY3VzSW5wdXRGb3JTdXJyb3VuZC5iaW5kKHRoaXMpKVxuICAgIHN1cGVyXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgQHN1cnJvdW5kKHRleHQsIEBpbnB1dClcblxuY2xhc3MgU3Vycm91bmRXb3JkIGV4dGVuZHMgU3Vycm91bmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTdXJyb3VuZCAqKndvcmQqKlwiXG4gIHRhcmdldDogJ0lubmVyV29yZCdcblxuY2xhc3MgU3Vycm91bmRTbWFydFdvcmQgZXh0ZW5kcyBTdXJyb3VuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlN1cnJvdW5kICoqc21hcnQtd29yZCoqXCJcbiAgdGFyZ2V0OiAnSW5uZXJTbWFydFdvcmQnXG5cbmNsYXNzIE1hcFN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTdXJyb3VuZCBlYWNoIHdvcmQoYC9cXHcrL2ApIHdpdGhpbiB0YXJnZXRcIlxuICBvY2N1cnJlbmNlOiB0cnVlXG4gIHBhdHRlcm5Gb3JPY2N1cnJlbmNlOiAvXFx3Ky9nXG5cbiMgRGVsZXRlIFN1cnJvdW5kXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIERlbGV0ZVN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRCYXNlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiRGVsZXRlIHNwZWNpZmllZCBzdXJyb3VuZCBjaGFyYWN0ZXIgbGlrZSBgKGAsIGBbYCwgYFxcXCJgXCJcbiAgcmVxdWlyZVRhcmdldDogZmFsc2VcblxuICBpbml0aWFsaXplOiAtPlxuICAgIEBmb2N1c0lucHV0Rm9yRGVsZXRlU3Vycm91bmQoKSB1bmxlc3MgQGhhc1RhcmdldCgpXG4gICAgc3VwZXJcblxuICBvbkNvbmZpcm1EZWxldGVTdXJyb3VuZDogKGlucHV0KSAtPlxuICAgIHN1cGVyXG4gICAgQGlucHV0ID0gaW5wdXRcbiAgICBAcHJvY2Vzc09wZXJhdGlvbigpXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgQGRlbGV0ZVN1cnJvdW5kKHRleHQpXG5cbmNsYXNzIERlbGV0ZVN1cnJvdW5kQW55UGFpciBleHRlbmRzIERlbGV0ZVN1cnJvdW5kXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiRGVsZXRlIHN1cnJvdW5kIGNoYXJhY3RlciBieSBhdXRvLWRldGVjdCBwYWlyZWQgY2hhciBmcm9tIGN1cnNvciBlbmNsb3NlZCBwYWlyXCJcbiAgdGFyZ2V0OiAnQUFueVBhaXInXG4gIHJlcXVpcmVJbnB1dDogZmFsc2VcblxuY2xhc3MgRGVsZXRlU3Vycm91bmRBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgRGVsZXRlU3Vycm91bmRBbnlQYWlyXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiRGVsZXRlIHN1cnJvdW5kIGNoYXJhY3RlciBieSBhdXRvLWRldGVjdCBwYWlyZWQgY2hhciBmcm9tIGN1cnNvciBlbmNsb3NlZCBwYWlyIGFuZCBmb3J3YXJkaW5nIHBhaXIgd2l0aGluIHNhbWUgbGluZVwiXG4gIHRhcmdldDogJ0FBbnlQYWlyQWxsb3dGb3J3YXJkaW5nJ1xuXG4jIENoYW5nZSBTdXJyb3VuZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBDaGFuZ2VTdXJyb3VuZCBleHRlbmRzIFN1cnJvdW5kQmFzZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkNoYW5nZSBzdXJyb3VuZCBjaGFyYWN0ZXIsIHNwZWNpZnkgYm90aCBmcm9tIGFuZCB0byBwYWlyIGNoYXJcIlxuXG4gIHNob3dEZWxldGVDaGFyT25Ib3ZlcjogLT5cbiAgICBjaGFyID0gQGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKVswXVxuICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoY2hhciwgQHZpbVN0YXRlLmdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKSlcblxuICBpbml0aWFsaXplOiAtPlxuICAgIGlmIEBoYXNUYXJnZXQoKVxuICAgICAgQG9uRGlkRmFpbFNlbGVjdFRhcmdldChAYWJvcnQuYmluZCh0aGlzKSlcbiAgICBlbHNlXG4gICAgICBAb25EaWRGYWlsU2VsZWN0VGFyZ2V0KEBjYW5jZWxPcGVyYXRpb24uYmluZCh0aGlzKSlcbiAgICAgIEBmb2N1c0lucHV0Rm9yRGVsZXRlU3Vycm91bmQoKVxuICAgIHN1cGVyXG5cbiAgICBAb25EaWRTZWxlY3RUYXJnZXQgPT5cbiAgICAgIEBzaG93RGVsZXRlQ2hhck9uSG92ZXIoKVxuICAgICAgQGZvY3VzSW5wdXRGb3JTdXJyb3VuZCgpXG5cbiAgb25Db25maXJtU3Vycm91bmQ6IChAaW5wdXQpIC0+XG4gICAgQHByb2Nlc3NPcGVyYXRpb24oKVxuXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGlubmVyVGV4dCA9IEBkZWxldGVTdXJyb3VuZCh0ZXh0KVxuICAgIEBzdXJyb3VuZChpbm5lclRleHQsIEBpbnB1dCwga2VlcExheW91dDogdHJ1ZSlcblxuY2xhc3MgQ2hhbmdlU3Vycm91bmRBbnlQYWlyIGV4dGVuZHMgQ2hhbmdlU3Vycm91bmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJDaGFuZ2Ugc3Vycm91bmQgY2hhcmFjdGVyLCBmcm9tIGNoYXIgaXMgYXV0by1kZXRlY3RlZFwiXG4gIHRhcmdldDogXCJBQW55UGFpclwiXG5cbmNsYXNzIENoYW5nZVN1cnJvdW5kQW55UGFpckFsbG93Rm9yd2FyZGluZyBleHRlbmRzIENoYW5nZVN1cnJvdW5kQW55UGFpclxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkNoYW5nZSBzdXJyb3VuZCBjaGFyYWN0ZXIsIGZyb20gY2hhciBpcyBhdXRvLWRldGVjdGVkIGZyb20gZW5jbG9zZWQgYW5kIGZvcndhcmRpbmcgYXJlYVwiXG4gIHRhcmdldDogXCJBQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBGSVhNRVxuIyBDdXJyZW50bHkgbmF0aXZlIGVkaXRvci5qb2luTGluZXMoKSBpcyBiZXR0ZXIgZm9yIGN1cnNvciBwb3NpdGlvbiBzZXR0aW5nXG4jIFNvIEkgdXNlIG5hdGl2ZSBtZXRob2RzIGZvciBhIG1lYW53aGlsZS5cbmNsYXNzIEpvaW4gZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9uczogZmFsc2VcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgaWYgaXNMaW5ld2lzZVJhbmdlKHJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkpXG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UudHJhbnNsYXRlKFswLCAwXSwgWy0xLCBJbmZpbml0eV0pKVxuICAgIHNlbGVjdGlvbi5qb2luTGluZXMoKVxuICAgIGVuZCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmVuZFxuICAgIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSlcblxuY2xhc3MgSm9pbkJhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZChmYWxzZSlcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICB0cmltOiBmYWxzZVxuICB0YXJnZXQ6IFwiTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bU9uZVwiXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAZm9jdXNJbnB1dCgxMCkgaWYgQGlzUmVxdWlyZUlucHV0KClcbiAgICBzdXBlclxuXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGlmIEB0cmltXG4gICAgICBwYXR0ZXJuID0gL1xccj9cXG5bIFxcdF0qL2dcbiAgICBlbHNlXG4gICAgICBwYXR0ZXJuID0gL1xccj9cXG4vZ1xuICAgIHRleHQudHJpbVJpZ2h0KCkucmVwbGFjZShwYXR0ZXJuLCBAaW5wdXQpICsgXCJcXG5cIlxuXG5jbGFzcyBKb2luV2l0aEtlZXBpbmdTcGFjZSBleHRlbmRzIEpvaW5CYXNlXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBpbnB1dDogJydcblxuY2xhc3MgSm9pbkJ5SW5wdXQgZXh0ZW5kcyBKb2luQmFzZVxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcIlRyYW5zZm9ybSBtdWx0aS1saW5lIHRvIHNpbmdsZS1saW5lIGJ5IHdpdGggc3BlY2lmaWVkIHNlcGFyYXRvciBjaGFyYWN0ZXJcIlxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgdHJpbTogdHJ1ZVxuXG5jbGFzcyBKb2luQnlJbnB1dFdpdGhLZWVwaW5nU3BhY2UgZXh0ZW5kcyBKb2luQnlJbnB1dFxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcIkpvaW4gbGluZXMgd2l0aG91dCBwYWRkaW5nIHNwYWNlIGJldHdlZW4gZWFjaCBsaW5lXCJcbiAgdHJpbTogZmFsc2VcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFN0cmluZyBzdWZmaXggaW4gbmFtZSBpcyB0byBhdm9pZCBjb25mdXNpb24gd2l0aCAnc3BsaXQnIHdpbmRvdy5cbmNsYXNzIFNwbGl0U3RyaW5nIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiU3BsaXQgc2luZ2xlLWxpbmUgaW50byBtdWx0aS1saW5lIGJ5IHNwbGl0dGluZyBzcGVjaWZpZWQgc2VwYXJhdG9yIGNoYXJzXCJcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIGlucHV0OiBudWxsXG4gIHRhcmdldDogXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuICBrZWVwU3BsaXR0ZXI6IGZhbHNlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAb25EaWRTZXRUYXJnZXQgPT5cbiAgICAgIEBmb2N1c0lucHV0KDEwKVxuICAgIHN1cGVyXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaW5wdXQgPSBAaW5wdXQgb3IgXCJcXFxcblwiXG4gICAgcmVnZXggPSAvLy8je18uZXNjYXBlUmVnRXhwKGlucHV0KX0vLy9nXG4gICAgaWYgQGtlZXBTcGxpdHRlclxuICAgICAgbGluZVNlcGFyYXRvciA9IEBpbnB1dCArIFwiXFxuXCJcbiAgICBlbHNlXG4gICAgICBsaW5lU2VwYXJhdG9yID0gXCJcXG5cIlxuICAgIHRleHQucmVwbGFjZShyZWdleCwgbGluZVNlcGFyYXRvcilcblxuY2xhc3MgU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyIGV4dGVuZHMgU3BsaXRTdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGtlZXBTcGxpdHRlcjogdHJ1ZVxuXG5jbGFzcyBDaGFuZ2VPcmRlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKGZhbHNlKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgQGdldE5ld1Jvd3Moc3BsaXRUZXh0QnlOZXdMaW5lKHRleHQpKS5qb2luKFwiXFxuXCIpICsgXCJcXG5cIlxuXG5jbGFzcyBSZXZlcnNlIGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJSZXZlcnNlIGxpbmVzKGUuZyByZXZlcnNlIHNlbGVjdGVkIHRocmVlIGxpbmUpXCJcbiAgZ2V0TmV3Um93czogKHJvd3MpIC0+XG4gICAgcm93cy5yZXZlcnNlKClcblxuY2xhc3MgU29ydCBleHRlbmRzIENoYW5nZU9yZGVyXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiU29ydCBsaW5lcyBhbHBoYWJldGljYWxseVwiXG4gIGdldE5ld1Jvd3M6IChyb3dzKSAtPlxuICAgIHJvd3Muc29ydCgpXG5cbmNsYXNzIFNvcnRDYXNlSW5zZW5zaXRpdmVseSBleHRlbmRzIENoYW5nZU9yZGVyXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiU29ydCBsaW5lcyBhbHBoYWJldGljYWxseSAoY2FzZSBpbnNlbnNpdGl2ZSlcIlxuICBnZXROZXdSb3dzOiAocm93cykgLT5cbiAgICByb3dzLnNvcnQgKHJvd0EsIHJvd0IpIC0+XG4gICAgICByb3dBLmxvY2FsZUNvbXBhcmUocm93Qiwgc2Vuc2l0aXZpdHk6ICdiYXNlJylcblxuY2xhc3MgU29ydEJ5TnVtYmVyIGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTb3J0IGxpbmVzIG51bWVyaWNhbGx5XCJcbiAgZ2V0TmV3Um93czogKHJvd3MpIC0+XG4gICAgXy5zb3J0Qnkgcm93cywgKHJvdykgLT5cbiAgICAgIE51bWJlci5wYXJzZUludChyb3cpIG9yIEluZmluaXR5XG4iXX0=
