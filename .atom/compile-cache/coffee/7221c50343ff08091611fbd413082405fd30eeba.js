(function() {
  var AutoIndent, Base, BufferedProcess, CamelCase, ChangeOrder, ChangeSurround, ChangeSurroundAnyPair, ChangeSurroundAnyPairAllowForwarding, CompactSpaces, ConvertToHardTab, ConvertToSoftTab, DashCase, DecodeUriComponent, DeleteSurround, DeleteSurroundAnyPair, DeleteSurroundAnyPairAllowForwarding, EncodeUriComponent, Indent, Join, JoinBase, JoinByInput, JoinByInputWithKeepingSpace, JoinWithKeepingSpace, LowerCase, MapSurround, Operator, Outdent, PascalCase, Range, Reflow, ReflowWithStay, RemoveLeadingWhiteSpaces, Replace, ReplaceCharacter, ReplaceWithRegister, Reverse, ReverseInnerAnyPair, Rotate, RotateArgumentsBackwardsOfInnerPair, RotateArgumentsOfInnerPair, RotateBackwards, SnakeCase, Sort, SortByNumber, SortCaseInsensitively, SplitArguments, SplitArgumentsOfInnerAnyPair, SplitArgumentsWithRemoveSeparator, SplitByCharacter, SplitString, SplitStringWithKeepingSplitter, Surround, SurroundBase, SurroundSmartWord, SurroundWord, SwapWithRegister, TitleCase, ToggleCase, ToggleCaseAndMoveRight, ToggleLineComments, TransformSmartWordBySelectList, TransformString, TransformStringByExternalCommand, TransformStringBySelectList, TransformWordBySelectList, TrimString, UpperCase, _, adjustIndentWithKeepingLayout, getIndentLevelForBufferRow, isLinewiseRange, isSingleLineText, limitNumber, ref, ref1, splitArguments, splitTextByNewLine, toggleCaseForCharacter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    modulo = function(a, b) { return (+a % (b = +b) + b) % b; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  _ = require('underscore-plus');

  ref = require('atom'), BufferedProcess = ref.BufferedProcess, Range = ref.Range;

  ref1 = require('./utils'), isSingleLineText = ref1.isSingleLineText, isLinewiseRange = ref1.isLinewiseRange, limitNumber = ref1.limitNumber, toggleCaseForCharacter = ref1.toggleCaseForCharacter, splitTextByNewLine = ref1.splitTextByNewLine, splitArguments = ref1.splitArguments, getIndentLevelForBufferRow = ref1.getIndentLevelForBufferRow, adjustIndentWithKeepingLayout = ref1.adjustIndentWithKeepingLayout;

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

    TransformString.prototype.autoIndentAfterInsertText = false;

    TransformString.stringTransformers = [];

    TransformString.registerToSelectList = function() {
      return this.stringTransformers.push(this);
    };

    TransformString.prototype.mutateSelection = function(selection) {
      var range, startRow, startRowIndentLevel, text;
      if (text = this.getNewText(selection.getText(), selection)) {
        if (this.autoIndentAfterInsertText) {
          startRow = selection.getBufferRange().start.row;
          startRowIndentLevel = getIndentLevelForBufferRow(this.editor, startRow);
        }
        range = selection.insertText(text, {
          autoIndent: this.autoIndent,
          autoIndentNewline: this.autoIndentNewline
        });
        if (this.autoIndentAfterInsertText) {
          if (this.target.isLinewise()) {
            range = range.translate([0, 0], [-1, 0]);
          }
          this.editor.setIndentationForBufferRow(range.start.row, startRowIndentLevel);
          this.editor.setIndentationForBufferRow(range.end.row, startRowIndentLevel);
          return adjustIndentWithKeepingLayout(this.editor, range.translate([1, 0], [0, 0]));
        }
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

    Replace.registerToSelectList();

    Replace.prototype.flashCheckpoint = 'did-select-occurrence';

    Replace.prototype.input = null;

    Replace.prototype.requireInput = true;

    Replace.prototype.autoIndentNewline = true;

    Replace.prototype.supportEarlySelect = true;

    Replace.prototype.initialize = function() {
      this.onDidSelectTarget((function(_this) {
        return function() {
          return _this.focusInput({
            hideCursor: true
          });
        };
      })(this));
      return Replace.__super__.initialize.apply(this, arguments);
    };

    Replace.prototype.getNewText = function(text) {
      var input;
      if (this.target.is('MoveRightBufferColumn') && text.length !== this.getCount()) {
        return;
      }
      input = this.input || "\n";
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
      var args, command, fn1, i, len, processFinished, processRunning, ref2, ref3, ref4, selection;
      this.stdoutBySelection = new Map;
      processRunning = processFinished = 0;
      ref2 = this.editor.getSelections();
      fn1 = (function(_this) {
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
        fn1(selection);
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
      throw new Error(this.name + " should not be executed");
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

    ToggleLineComments.prototype.wise = 'linewise';

    ToggleLineComments.prototype.mutateSelection = function(selection) {
      return selection.toggleLineComments();
    };

    return ToggleLineComments;

  })(TransformString);

  Reflow = (function(superClass) {
    extend(Reflow, superClass);

    function Reflow() {
      return Reflow.__super__.constructor.apply(this, arguments);
    }

    Reflow.extend();

    Reflow.prototype.mutateSelection = function(selection) {
      return atom.commands.dispatch(this.editorElement, 'autoflow:reflow-selection');
    };

    return Reflow;

  })(TransformString);

  ReflowWithStay = (function(superClass) {
    extend(ReflowWithStay, superClass);

    function ReflowWithStay() {
      return ReflowWithStay.__super__.constructor.apply(this, arguments);
    }

    ReflowWithStay.extend();

    ReflowWithStay.prototype.stayAtSamePosition = true;

    return ReflowWithStay;

  })(Reflow);

  SurroundBase = (function(superClass) {
    extend(SurroundBase, superClass);

    function SurroundBase() {
      return SurroundBase.__super__.constructor.apply(this, arguments);
    }

    SurroundBase.extend(false);

    SurroundBase.prototype.pairs = [['[', ']'], ['(', ')'], ['{', '}'], ['<', '>']];

    SurroundBase.prototype.pairsByAlias = {
      b: ['(', ')'],
      B: ['{', '}'],
      r: ['[', ']'],
      a: ['<', '>']
    };

    SurroundBase.prototype.pairCharsAllowForwarding = '[](){}';

    SurroundBase.prototype.input = null;

    SurroundBase.prototype.requireInput = true;

    SurroundBase.prototype.supportEarlySelect = true;

    SurroundBase.prototype.focusInputForSurroundChar = function() {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm(this.onConfirmSurroundChar.bind(this));
      inputUI.onDidCancel(this.cancelOperation.bind(this));
      return inputUI.focus({
        hideCursor: true
      });
    };

    SurroundBase.prototype.focusInputForTargetPairChar = function() {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm(this.onConfirmTargetPairChar.bind(this));
      inputUI.onDidCancel(this.cancelOperation.bind(this));
      return inputUI.focus();
    };

    SurroundBase.prototype.getPair = function(char) {
      var pair;
      pair = this.pairsByAlias[char];
      if (pair == null) {
        pair = _.detect(this.pairs, function(pair) {
          return indexOf.call(pair, char) >= 0;
        });
      }
      if (pair == null) {
        pair = [char, char];
      }
      return pair;
    };

    SurroundBase.prototype.surround = function(text, char, options) {
      var close, keepLayout, open, ref2, ref3;
      if (options == null) {
        options = {};
      }
      keepLayout = (ref2 = options.keepLayout) != null ? ref2 : false;
      ref3 = this.getPair(char), open = ref3[0], close = ref3[1];
      if ((!keepLayout) && text.endsWith("\n")) {
        this.autoIndentAfterInsertText = true;
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

    SurroundBase.prototype.onConfirmSurroundChar = function(input1) {
      this.input = input1;
      return this.processOperation();
    };

    SurroundBase.prototype.onConfirmTargetPairChar = function(char) {
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
      this.onDidSelectTarget(this.focusInputForSurroundChar.bind(this));
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

    DeleteSurround.prototype.initialize = function() {
      if (this.target == null) {
        this.focusInputForTargetPairChar();
      }
      return DeleteSurround.__super__.initialize.apply(this, arguments);
    };

    DeleteSurround.prototype.onConfirmTargetPairChar = function(input) {
      DeleteSurround.__super__.onConfirmTargetPairChar.apply(this, arguments);
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
      if (this.target != null) {
        this.onDidFailSelectTarget(this.abort.bind(this));
      } else {
        this.onDidFailSelectTarget(this.cancelOperation.bind(this));
        this.focusInputForTargetPairChar();
      }
      ChangeSurround.__super__.initialize.apply(this, arguments);
      return this.onDidSelectTarget((function(_this) {
        return function() {
          _this.showDeleteCharOnHover();
          return _this.focusInputForSurroundChar();
        };
      })(this));
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
      range = selection.getBufferRange();
      if (!(range.isSingleLine() && range.end.row === this.editor.getLastBufferRow())) {
        if (isLinewiseRange(range)) {
          selection.setBufferRange(range.translate([0, 0], [-1, 2e308]));
        }
        selection.joinLines();
      }
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
      if (this.requireInput) {
        this.focusInput({
          charsMax: 10
        });
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
          return _this.focusInput({
            charsMax: 10
          });
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

  SplitArguments = (function(superClass) {
    extend(SplitArguments, superClass);

    function SplitArguments() {
      return SplitArguments.__super__.constructor.apply(this, arguments);
    }

    SplitArguments.extend();

    SplitArguments.registerToSelectList();

    SplitArguments.prototype.keepSeparator = true;

    SplitArguments.prototype.autoIndentAfterInsertText = true;

    SplitArguments.prototype.getNewText = function(text) {
      var allTokens, newText, ref2, type;
      allTokens = splitArguments(text.trim());
      newText = '';
      while (allTokens.length) {
        ref2 = allTokens.shift(), text = ref2.text, type = ref2.type;
        if (type === 'separator') {
          if (this.keepSeparator) {
            text = text.trim() + "\n";
          } else {
            text = "\n";
          }
        }
        newText += text;
      }
      return "\n" + newText + "\n";
    };

    return SplitArguments;

  })(TransformString);

  SplitArgumentsWithRemoveSeparator = (function(superClass) {
    extend(SplitArgumentsWithRemoveSeparator, superClass);

    function SplitArgumentsWithRemoveSeparator() {
      return SplitArgumentsWithRemoveSeparator.__super__.constructor.apply(this, arguments);
    }

    SplitArgumentsWithRemoveSeparator.extend();

    SplitArgumentsWithRemoveSeparator.registerToSelectList();

    SplitArgumentsWithRemoveSeparator.prototype.keepSeparator = false;

    return SplitArgumentsWithRemoveSeparator;

  })(SplitArguments);

  SplitArgumentsOfInnerAnyPair = (function(superClass) {
    extend(SplitArgumentsOfInnerAnyPair, superClass);

    function SplitArgumentsOfInnerAnyPair() {
      return SplitArgumentsOfInnerAnyPair.__super__.constructor.apply(this, arguments);
    }

    SplitArgumentsOfInnerAnyPair.extend();

    SplitArgumentsOfInnerAnyPair.registerToSelectList();

    SplitArgumentsOfInnerAnyPair.prototype.target = "InnerAnyPair";

    return SplitArgumentsOfInnerAnyPair;

  })(SplitArguments);

  ChangeOrder = (function(superClass) {
    extend(ChangeOrder, superClass);

    function ChangeOrder() {
      return ChangeOrder.__super__.constructor.apply(this, arguments);
    }

    ChangeOrder.extend(false);

    ChangeOrder.prototype.getNewText = function(text) {
      if (this.target.isLinewise()) {
        return this.getNewList(splitTextByNewLine(text)).join("\n") + "\n";
      } else {
        return this.sortArgumentsInTextBy(text, (function(_this) {
          return function(args) {
            return _this.getNewList(args);
          };
        })(this));
      }
    };

    ChangeOrder.prototype.sortArgumentsInTextBy = function(text, fn) {
      var allTokens, args, end, leadingSpaces, newArgs, newText, ref2, start, trailingSpaces, type;
      leadingSpaces = trailingSpaces = '';
      start = text.search(/\S/);
      end = text.search(/\s*$/);
      leadingSpaces = trailingSpaces = '';
      if (start !== -1) {
        leadingSpaces = text.slice(0, start);
      }
      if (end !== -1) {
        trailingSpaces = text.slice(end);
      }
      text = text.slice(start, end);
      allTokens = splitArguments(text);
      args = allTokens.filter(function(token) {
        return token.type === 'argument';
      }).map(function(token) {
        return token.text;
      });
      newArgs = fn(args);
      newText = '';
      while (allTokens.length) {
        ref2 = allTokens.shift(), text = ref2.text, type = ref2.type;
        newText += (function() {
          switch (type) {
            case 'separator':
              return text;
            case 'argument':
              return newArgs.shift();
          }
        })();
      }
      return leadingSpaces + newText + trailingSpaces;
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

    Reverse.prototype.getNewList = function(rows) {
      return rows.reverse();
    };

    return Reverse;

  })(ChangeOrder);

  ReverseInnerAnyPair = (function(superClass) {
    extend(ReverseInnerAnyPair, superClass);

    function ReverseInnerAnyPair() {
      return ReverseInnerAnyPair.__super__.constructor.apply(this, arguments);
    }

    ReverseInnerAnyPair.extend();

    ReverseInnerAnyPair.prototype.target = "InnerAnyPair";

    return ReverseInnerAnyPair;

  })(Reverse);

  Rotate = (function(superClass) {
    extend(Rotate, superClass);

    function Rotate() {
      return Rotate.__super__.constructor.apply(this, arguments);
    }

    Rotate.extend();

    Rotate.registerToSelectList();

    Rotate.prototype.backwards = false;

    Rotate.prototype.getNewList = function(rows) {
      if (this.backwards) {
        rows.push(rows.shift());
      } else {
        rows.unshift(rows.pop());
      }
      return rows;
    };

    return Rotate;

  })(ChangeOrder);

  RotateBackwards = (function(superClass) {
    extend(RotateBackwards, superClass);

    function RotateBackwards() {
      return RotateBackwards.__super__.constructor.apply(this, arguments);
    }

    RotateBackwards.extend();

    RotateBackwards.registerToSelectList();

    RotateBackwards.prototype.backwards = true;

    return RotateBackwards;

  })(ChangeOrder);

  RotateArgumentsOfInnerPair = (function(superClass) {
    extend(RotateArgumentsOfInnerPair, superClass);

    function RotateArgumentsOfInnerPair() {
      return RotateArgumentsOfInnerPair.__super__.constructor.apply(this, arguments);
    }

    RotateArgumentsOfInnerPair.extend();

    RotateArgumentsOfInnerPair.prototype.target = "InnerAnyPair";

    return RotateArgumentsOfInnerPair;

  })(Rotate);

  RotateArgumentsBackwardsOfInnerPair = (function(superClass) {
    extend(RotateArgumentsBackwardsOfInnerPair, superClass);

    function RotateArgumentsBackwardsOfInnerPair() {
      return RotateArgumentsBackwardsOfInnerPair.__super__.constructor.apply(this, arguments);
    }

    RotateArgumentsBackwardsOfInnerPair.extend();

    RotateArgumentsBackwardsOfInnerPair.prototype.backwards = true;

    return RotateArgumentsBackwardsOfInnerPair;

  })(RotateArgumentsOfInnerPair);

  Sort = (function(superClass) {
    extend(Sort, superClass);

    function Sort() {
      return Sort.__super__.constructor.apply(this, arguments);
    }

    Sort.extend();

    Sort.registerToSelectList();

    Sort.description = "Sort alphabetically";

    Sort.prototype.getNewList = function(rows) {
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

    SortCaseInsensitively.description = "Sort alphabetically with case insensitively";

    SortCaseInsensitively.prototype.getNewList = function(rows) {
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

    SortByNumber.description = "Sort numerically";

    SortByNumber.prototype.getNewList = function(rows) {
      return _.sortBy(rows, function(row) {
        return Number.parseInt(row) || 2e308;
      });
    };

    return SortByNumber;

  })(ChangeOrder);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxtMUNBQUE7SUFBQTs7Ozs7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUEyQixPQUFBLENBQVEsTUFBUixDQUEzQixFQUFDLHFDQUFELEVBQWtCOztFQUVsQixPQVNJLE9BQUEsQ0FBUSxTQUFSLENBVEosRUFDRSx3Q0FERixFQUVFLHNDQUZGLEVBR0UsOEJBSEYsRUFJRSxvREFKRixFQUtFLDRDQUxGLEVBTUUsb0NBTkYsRUFPRSw0REFQRixFQVFFOztFQUVGLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxVQUFkOztFQUlMOzs7Ozs7O0lBQ0osZUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOzs4QkFDQSxXQUFBLEdBQWE7OzhCQUNiLGNBQUEsR0FBZ0I7OzhCQUNoQixVQUFBLEdBQVk7OzhCQUNaLGlCQUFBLEdBQW1COzs4QkFDbkIseUJBQUEsR0FBMkI7O0lBQzNCLGVBQUMsQ0FBQSxrQkFBRCxHQUFxQjs7SUFFckIsZUFBQyxDQUFBLG9CQUFELEdBQXVCLFNBQUE7YUFDckIsSUFBQyxDQUFBLGtCQUFrQixDQUFDLElBQXBCLENBQXlCLElBQXpCO0lBRHFCOzs4QkFHdkIsZUFBQSxHQUFpQixTQUFDLFNBQUQ7QUFDZixVQUFBO01BQUEsSUFBRyxJQUFBLEdBQU8sSUFBQyxDQUFBLFVBQUQsQ0FBWSxTQUFTLENBQUMsT0FBVixDQUFBLENBQVosRUFBaUMsU0FBakMsQ0FBVjtRQUNFLElBQUcsSUFBQyxDQUFBLHlCQUFKO1VBQ0UsUUFBQSxHQUFXLFNBQVMsQ0FBQyxjQUFWLENBQUEsQ0FBMEIsQ0FBQyxLQUFL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VUFBQSxHQUFZLFNBQUMsSUFBRDthQUNWLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBQyxJQUFELEVBQU8sSUFBUDtlQUNSLElBQUksQ0FBQyxhQUFMLENBQW1CLElBQW5CLEVBQXlCO1VBQUEsV0FBQSxFQUFhLE1BQWI7U0FBekI7TUFEUSxDQUFWO0lBRFU7Ozs7S0FKc0I7O0VBUTlCOzs7Ozs7O0lBQ0osWUFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxZQUFDLENBQUEsb0JBQUQsQ0FBQTs7SUFDQSxZQUFDLENBQUEsV0FBRCxHQUFjOzsyQkFDZCxVQUFBLEdBQVksU0FBQyxJQUFEO2FBQ1YsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQWUsU0FBQyxHQUFEO2VBQ2IsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsR0FBaEIsQ0FBQSxJQUF3QjtNQURYLENBQWY7SUFEVTs7OztLQUphO0FBMXZCM0IiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0J1ZmZlcmVkUHJvY2VzcywgUmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcblxue1xuICBpc1NpbmdsZUxpbmVUZXh0XG4gIGlzTGluZXdpc2VSYW5nZVxuICBsaW1pdE51bWJlclxuICB0b2dnbGVDYXNlRm9yQ2hhcmFjdGVyXG4gIHNwbGl0VGV4dEJ5TmV3TGluZVxuICBzcGxpdEFyZ3VtZW50c1xuICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvd1xuICBhZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dFxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuT3BlcmF0b3IgPSBCYXNlLmdldENsYXNzKCdPcGVyYXRvcicpXG5cbiMgVHJhbnNmb3JtU3RyaW5nXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBUcmFuc2Zvcm1TdHJpbmcgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKGZhbHNlKVxuICB0cmFja0NoYW5nZTogdHJ1ZVxuICBzdGF5T3B0aW9uTmFtZTogJ3N0YXlPblRyYW5zZm9ybVN0cmluZydcbiAgYXV0b0luZGVudDogZmFsc2VcbiAgYXV0b0luZGVudE5ld2xpbmU6IGZhbHNlXG4gIGF1dG9JbmRlbnRBZnRlckluc2VydFRleHQ6IGZhbHNlXG4gIEBzdHJpbmdUcmFuc2Zvcm1lcnM6IFtdXG5cbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0OiAtPlxuICAgIEBzdHJpbmdUcmFuc2Zvcm1lcnMucHVzaCh0aGlzKVxuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBpZiB0ZXh0ID0gQGdldE5ld1RleHQoc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uKVxuICAgICAgaWYgQGF1dG9JbmRlbnRBZnRlckluc2VydFRleHRcbiAgICAgICAgc3RhcnRSb3cgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydC5yb3dcbiAgICAgICAgc3RhcnRSb3dJbmRlbnRMZXZlbCA9IGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KEBlZGl0b3IsIHN0YXJ0Um93KVxuICAgICAgcmFuZ2UgPSBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCB7QGF1dG9JbmRlbnQsIEBhdXRvSW5kZW50TmV3bGluZX0pXG4gICAgICBpZiBAYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dFxuICAgICAgICAjIEN1cnJlbnRseSB1c2VkIGJ5IFNwbGl0QXJndW1lbnRzIGFuZCBTdXJyb3VuZCggbGluZXdpc2UgdGFyZ2V0IG9ubHkgKVxuICAgICAgICByYW5nZSA9IHJhbmdlLnRyYW5zbGF0ZShbMCwgMF0sIFstMSwgMF0pIGlmIEB0YXJnZXQuaXNMaW5ld2lzZSgpXG4gICAgICAgIEBlZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocmFuZ2Uuc3RhcnQucm93LCBzdGFydFJvd0luZGVudExldmVsKVxuICAgICAgICBAZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJhbmdlLmVuZC5yb3csIHN0YXJ0Um93SW5kZW50TGV2ZWwpXG4gICAgICAgICMgQWRqdXN0IGlubmVyIHJhbmdlLCBlbmQucm93IGlzIGFscmVhZHkoIGlmIG5lZWRlZCApIHRyYW5zbGF0ZWQgc28gbm8gbmVlZCB0byByZS10cmFuc2xhdGUuXG4gICAgICAgIGFkanVzdEluZGVudFdpdGhLZWVwaW5nTGF5b3V0KEBlZGl0b3IsIHJhbmdlLnRyYW5zbGF0ZShbMSwgMF0sIFswLCAwXSkpXG5cbmNsYXNzIFRvZ2dsZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG8gV29ybGRgIC0+IGBoRUxMTyB3T1JMRGBcIlxuICBkaXNwbGF5TmFtZTogJ1RvZ2dsZSB+J1xuXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIHRleHQucmVwbGFjZSgvLi9nLCB0b2dnbGVDYXNlRm9yQ2hhcmFjdGVyKVxuXG5jbGFzcyBUb2dnbGVDYXNlQW5kTW92ZVJpZ2h0IGV4dGVuZHMgVG9nZ2xlQ2FzZVxuICBAZXh0ZW5kKClcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHJlc3RvcmVQb3NpdGlvbnM6IGZhbHNlXG4gIHRhcmdldDogJ01vdmVSaWdodCdcblxuY2xhc3MgVXBwZXJDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvIFdvcmxkYCAtPiBgSEVMTE8gV09STERgXCJcbiAgZGlzcGxheU5hbWU6ICdVcHBlcidcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgdGV4dC50b1VwcGVyQ2FzZSgpXG5cbmNsYXNzIExvd2VyQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBIZWxsbyBXb3JsZGAgLT4gYGhlbGxvIHdvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnTG93ZXInXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIHRleHQudG9Mb3dlckNhc2UoKVxuXG4jIFJlcGxhY2VcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgUmVwbGFjZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZmxhc2hDaGVja3BvaW50OiAnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJ1xuICBpbnB1dDogbnVsbFxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgYXV0b0luZGVudE5ld2xpbmU6IHRydWVcbiAgc3VwcG9ydEVhcmx5U2VsZWN0OiB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAb25EaWRTZWxlY3RUYXJnZXQgPT5cbiAgICAgIEBmb2N1c0lucHV0KGhpZGVDdXJzb3I6IHRydWUpXG4gICAgc3VwZXJcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBpZiBAdGFyZ2V0LmlzKCdNb3ZlUmlnaHRCdWZmZXJDb2x1bW4nKSBhbmQgdGV4dC5sZW5ndGggaXNudCBAZ2V0Q291bnQoKVxuICAgICAgcmV0dXJuXG5cbiAgICBpbnB1dCA9IEBpbnB1dCBvciBcIlxcblwiXG4gICAgaWYgaW5wdXQgaXMgXCJcXG5cIlxuICAgICAgQHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuICAgIHRleHQucmVwbGFjZSgvLi9nLCBpbnB1dClcblxuY2xhc3MgUmVwbGFjZUNoYXJhY3RlciBleHRlbmRzIFJlcGxhY2VcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJNb3ZlUmlnaHRCdWZmZXJDb2x1bW5cIlxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgRFVQIG1lYW5pbmcgd2l0aCBTcGxpdFN0cmluZyBuZWVkIGNvbnNvbGlkYXRlLlxuY2xhc3MgU3BsaXRCeUNoYXJhY3RlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgdGV4dC5zcGxpdCgnJykuam9pbignICcpXG5cbmNsYXNzIENhbWVsQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZGlzcGxheU5hbWU6ICdDYW1lbGl6ZSdcbiAgQGRlc2NyaXB0aW9uOiBcImBoZWxsby13b3JsZGAgLT4gYGhlbGxvV29ybGRgXCJcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgXy5jYW1lbGl6ZSh0ZXh0KVxuXG5jbGFzcyBTbmFrZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG9Xb3JsZGAgLT4gYGhlbGxvX3dvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnVW5kZXJzY29yZSBfJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBfLnVuZGVyc2NvcmUodGV4dClcblxuY2xhc3MgUGFzY2FsQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBoZWxsb193b3JsZGAgLT4gYEhlbGxvV29ybGRgXCJcbiAgZGlzcGxheU5hbWU6ICdQYXNjYWxpemUnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKHRleHQpKVxuXG5jbGFzcyBEYXNoQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZGlzcGxheU5hbWU6ICdEYXNoZXJpemUgLSdcbiAgQGRlc2NyaXB0aW9uOiBcIkhlbGxvV29ybGQgLT4gaGVsbG8td29ybGRcIlxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBfLmRhc2hlcml6ZSh0ZXh0KVxuXG5jbGFzcyBUaXRsZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG9Xb3JsZGAgLT4gYEhlbGxvIFdvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnVGl0bGl6ZSdcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgXy5odW1hbml6ZUV2ZW50TmFtZShfLmRhc2hlcml6ZSh0ZXh0KSlcblxuY2xhc3MgRW5jb2RlVXJpQ29tcG9uZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvIFdvcmxkYCAtPiBgSGVsbG8lMjBXb3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ0VuY29kZSBVUkkgQ29tcG9uZW50ICUnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KVxuXG5jbGFzcyBEZWNvZGVVcmlDb21wb25lbnQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG8lMjBXb3JsZGAgLT4gYEhlbGxvIFdvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnRGVjb2RlIFVSSSBDb21wb25lbnQgJSUnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGRlY29kZVVSSUNvbXBvbmVudCh0ZXh0KVxuXG5jbGFzcyBUcmltU3RyaW5nIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYCBoZWxsbyBgIC0+IGBoZWxsb2BcIlxuICBkaXNwbGF5TmFtZTogJ1RyaW0gc3RyaW5nJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICB0ZXh0LnRyaW0oKVxuXG5jbGFzcyBDb21wYWN0U3BhY2VzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYCAgYSAgICBiICAgIGNgIC0+IGBhIGIgY2BcIlxuICBkaXNwbGF5TmFtZTogJ0NvbXBhY3Qgc3BhY2UnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGlmIHRleHQubWF0Y2goL15bIF0rJC8pXG4gICAgICAnICdcbiAgICBlbHNlXG4gICAgICAjIERvbid0IGNvbXBhY3QgZm9yIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlIHNwYWNlcy5cbiAgICAgIHRleHQucmVwbGFjZSAvXihcXHMqKSguKj8pKFxccyopJC9nbSwgKG0sIGxlYWRpbmcsIG1pZGRsZSwgdHJhaWxpbmcpIC0+XG4gICAgICAgIGxlYWRpbmcgKyBtaWRkbGUuc3BsaXQoL1sgXFx0XSsvKS5qb2luKCcgJykgKyB0cmFpbGluZ1xuXG5jbGFzcyBSZW1vdmVMZWFkaW5nV2hpdGVTcGFjZXMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgQGRlc2NyaXB0aW9uOiBcImAgIGEgYiBjYCAtPiBgYSBiIGNgXCJcbiAgZ2V0TmV3VGV4dDogKHRleHQsIHNlbGVjdGlvbikgLT5cbiAgICB0cmltTGVmdCA9ICh0ZXh0KSAtPiB0ZXh0LnRyaW1MZWZ0KClcbiAgICBzcGxpdFRleHRCeU5ld0xpbmUodGV4dCkubWFwKHRyaW1MZWZ0KS5qb2luKFwiXFxuXCIpICsgXCJcXG5cIlxuXG5jbGFzcyBDb252ZXJ0VG9Tb2Z0VGFiIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBkaXNwbGF5TmFtZTogJ1NvZnQgVGFiJ1xuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBzY2FuRm9yd2FyZCAvXFx0L2csIHtzY2FuUmFuZ2U6IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpfSwgKHtyYW5nZSwgcmVwbGFjZX0pID0+XG4gICAgICAjIFJlcGxhY2UgXFx0IHRvIHNwYWNlcyB3aGljaCBsZW5ndGggaXMgdmFyeSBkZXBlbmRpbmcgb24gdGFiU3RvcCBhbmQgdGFiTGVuZ2h0XG4gICAgICAjIFNvIHdlIGRpcmVjdGx5IGNvbnN1bHQgaXQncyBzY3JlZW4gcmVwcmVzZW50aW5nIGxlbmd0aC5cbiAgICAgIGxlbmd0aCA9IEBlZGl0b3Iuc2NyZWVuUmFuZ2VGb3JCdWZmZXJSYW5nZShyYW5nZSkuZ2V0RXh0ZW50KCkuY29sdW1uXG4gICAgICByZXBsYWNlKFwiIFwiLnJlcGVhdChsZW5ndGgpKVxuXG5jbGFzcyBDb252ZXJ0VG9IYXJkVGFiIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBkaXNwbGF5TmFtZTogJ0hhcmQgVGFiJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICB0YWJMZW5ndGggPSBAZWRpdG9yLmdldFRhYkxlbmd0aCgpXG4gICAgQHNjYW5Gb3J3YXJkIC9bIFxcdF0rL2csIHtzY2FuUmFuZ2U6IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpfSwgKHtyYW5nZSwgcmVwbGFjZX0pID0+XG4gICAgICB7c3RhcnQsIGVuZH0gPSBAZWRpdG9yLnNjcmVlblJhbmdlRm9yQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICBzdGFydENvbHVtbiA9IHN0YXJ0LmNvbHVtblxuICAgICAgZW5kQ29sdW1uID0gZW5kLmNvbHVtblxuXG4gICAgICAjIFdlIGNhbid0IG5haXZlbHkgcmVwbGFjZSBzcGFjZXMgdG8gdGFiLCB3ZSBoYXZlIHRvIGNvbnNpZGVyIHZhbGlkIHRhYlN0b3AgY29sdW1uXG4gICAgICAjIElmIG5leHRUYWJTdG9wIGNvbHVtbiBleGNlZWRzIHJlcGxhY2FibGUgcmFuZ2UsIHdlIHBhZCB3aXRoIHNwYWNlcy5cbiAgICAgIG5ld1RleHQgPSAnJ1xuICAgICAgbG9vcFxuICAgICAgICByZW1haW5kZXIgPSBzdGFydENvbHVtbiAlJSB0YWJMZW5ndGhcbiAgICAgICAgbmV4dFRhYlN0b3AgPSBzdGFydENvbHVtbiArIChpZiByZW1haW5kZXIgaXMgMCB0aGVuIHRhYkxlbmd0aCBlbHNlIHJlbWFpbmRlcilcbiAgICAgICAgaWYgbmV4dFRhYlN0b3AgPiBlbmRDb2x1bW5cbiAgICAgICAgICBuZXdUZXh0ICs9IFwiIFwiLnJlcGVhdChlbmRDb2x1bW4gLSBzdGFydENvbHVtbilcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG5ld1RleHQgKz0gXCJcXHRcIlxuICAgICAgICBzdGFydENvbHVtbiA9IG5leHRUYWJTdG9wXG4gICAgICAgIGJyZWFrIGlmIHN0YXJ0Q29sdW1uID49IGVuZENvbHVtblxuXG4gICAgICByZXBsYWNlKG5ld1RleHQpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nQnlFeHRlcm5hbENvbW1hbmQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZChmYWxzZSlcbiAgYXV0b0luZGVudDogdHJ1ZVxuICBjb21tYW5kOiAnJyAjIGUuZy4gY29tbWFuZDogJ3NvcnQnXG4gIGFyZ3M6IFtdICMgZS5nIGFyZ3M6IFsnLXJuJ11cbiAgc3Rkb3V0QnlTZWxlY3Rpb246IG51bGxcblxuICBleGVjdXRlOiAtPlxuICAgIEBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKVxuICAgIGlmIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgbmV3IFByb21pc2UgKHJlc29sdmUpID0+XG4gICAgICAgIEBjb2xsZWN0KHJlc29sdmUpXG4gICAgICAudGhlbiA9PlxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgdGV4dCA9IEBnZXROZXdUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCB7QGF1dG9JbmRlbnR9KVxuICAgICAgICBAcmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgICAgQGFjdGl2YXRlTW9kZShAZmluYWxNb2RlLCBAZmluYWxTdWJtb2RlKVxuXG4gIGNvbGxlY3Q6IChyZXNvbHZlKSAtPlxuICAgIEBzdGRvdXRCeVNlbGVjdGlvbiA9IG5ldyBNYXBcbiAgICBwcm9jZXNzUnVubmluZyA9IHByb2Nlc3NGaW5pc2hlZCA9IDBcbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICB7Y29tbWFuZCwgYXJnc30gPSBAZ2V0Q29tbWFuZChzZWxlY3Rpb24pID8ge31cbiAgICAgIHJldHVybiB1bmxlc3MgKGNvbW1hbmQ/IGFuZCBhcmdzPylcbiAgICAgIHByb2Nlc3NSdW5uaW5nKytcbiAgICAgIGRvIChzZWxlY3Rpb24pID0+XG4gICAgICAgIHN0ZGluID0gQGdldFN0ZGluKHNlbGVjdGlvbilcbiAgICAgICAgc3Rkb3V0ID0gKG91dHB1dCkgPT5cbiAgICAgICAgICBAc3Rkb3V0QnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgb3V0cHV0KVxuICAgICAgICBleGl0ID0gKGNvZGUpIC0+XG4gICAgICAgICAgcHJvY2Vzc0ZpbmlzaGVkKytcbiAgICAgICAgICByZXNvbHZlKCkgaWYgKHByb2Nlc3NSdW5uaW5nIGlzIHByb2Nlc3NGaW5pc2hlZClcbiAgICAgICAgQHJ1bkV4dGVybmFsQ29tbWFuZCB7Y29tbWFuZCwgYXJncywgc3Rkb3V0LCBleGl0LCBzdGRpbn1cblxuICBydW5FeHRlcm5hbENvbW1hbmQ6IChvcHRpb25zKSAtPlxuICAgIHN0ZGluID0gb3B0aW9ucy5zdGRpblxuICAgIGRlbGV0ZSBvcHRpb25zLnN0ZGluXG4gICAgYnVmZmVyZWRQcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2VzcyhvcHRpb25zKVxuICAgIGJ1ZmZlcmVkUHJvY2Vzcy5vbldpbGxUaHJvd0Vycm9yICh7ZXJyb3IsIGhhbmRsZX0pID0+XG4gICAgICAjIFN1cHByZXNzIGNvbW1hbmQgbm90IGZvdW5kIGVycm9yIGludGVudGlvbmFsbHkuXG4gICAgICBpZiBlcnJvci5jb2RlIGlzICdFTk9FTlQnIGFuZCBlcnJvci5zeXNjYWxsLmluZGV4T2YoJ3NwYXduJykgaXMgMFxuICAgICAgICBjb21tYW5kTmFtZSA9IEBjb25zdHJ1Y3Rvci5nZXRDb21tYW5kTmFtZSgpXG4gICAgICAgIGNvbnNvbGUubG9nIFwiI3tjb21tYW5kTmFtZX06IEZhaWxlZCB0byBzcGF3biBjb21tYW5kICN7ZXJyb3IucGF0aH0uXCJcbiAgICAgICAgaGFuZGxlKClcbiAgICAgIEBjYW5jZWxPcGVyYXRpb24oKVxuXG4gICAgaWYgc3RkaW5cbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLndyaXRlKHN0ZGluKVxuICAgICAgYnVmZmVyZWRQcm9jZXNzLnByb2Nlc3Muc3RkaW4uZW5kKClcblxuICBnZXROZXdUZXh0OiAodGV4dCwgc2VsZWN0aW9uKSAtPlxuICAgIEBnZXRTdGRvdXQoc2VsZWN0aW9uKSA/IHRleHRcblxuICAjIEZvciBlYXNpbHkgZXh0ZW5kIGJ5IHZtcCBwbHVnaW4uXG4gIGdldENvbW1hbmQ6IChzZWxlY3Rpb24pIC0+IHtAY29tbWFuZCwgQGFyZ3N9XG4gIGdldFN0ZGluOiAoc2VsZWN0aW9uKSAtPiBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gIGdldFN0ZG91dDogKHNlbGVjdGlvbikgLT4gQHN0ZG91dEJ5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nQnlTZWxlY3RMaXN0IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiSW50ZXJhY3RpdmVseSBjaG9vc2Ugc3RyaW5nIHRyYW5zZm9ybWF0aW9uIG9wZXJhdG9yIGZyb20gc2VsZWN0LWxpc3RcIlxuICBAc2VsZWN0TGlzdEl0ZW1zOiBudWxsXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuXG4gIGdldEl0ZW1zOiAtPlxuICAgIEBjb25zdHJ1Y3Rvci5zZWxlY3RMaXN0SXRlbXMgPz0gQGNvbnN0cnVjdG9yLnN0cmluZ1RyYW5zZm9ybWVycy5tYXAgKGtsYXNzKSAtPlxuICAgICAgaWYga2xhc3M6Omhhc093blByb3BlcnR5KCdkaXNwbGF5TmFtZScpXG4gICAgICAgIGRpc3BsYXlOYW1lID0ga2xhc3M6OmRpc3BsYXlOYW1lXG4gICAgICBlbHNlXG4gICAgICAgIGRpc3BsYXlOYW1lID0gXy5odW1hbml6ZUV2ZW50TmFtZShfLmRhc2hlcml6ZShrbGFzcy5uYW1lKSlcbiAgICAgIHtuYW1lOiBrbGFzcywgZGlzcGxheU5hbWV9XG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuXG4gICAgQHZpbVN0YXRlLm9uRGlkQ29uZmlybVNlbGVjdExpc3QgKGl0ZW0pID0+XG4gICAgICB0cmFuc2Zvcm1lciA9IGl0ZW0ubmFtZVxuICAgICAgQHRhcmdldCA9IHRyYW5zZm9ybWVyOjp0YXJnZXQgaWYgdHJhbnNmb3JtZXI6OnRhcmdldD9cbiAgICAgIEB2aW1TdGF0ZS5yZXNldCgpXG4gICAgICBpZiBAdGFyZ2V0P1xuICAgICAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKHRyYW5zZm9ybWVyLCB7QHRhcmdldH0pXG4gICAgICBlbHNlXG4gICAgICAgIEB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4odHJhbnNmb3JtZXIpXG5cbiAgICBAZm9jdXNTZWxlY3RMaXN0KGl0ZW1zOiBAZ2V0SXRlbXMoKSlcblxuICBleGVjdXRlOiAtPlxuICAgICMgTkVWRVIgYmUgZXhlY3V0ZWQgc2luY2Ugb3BlcmF0aW9uU3RhY2sgaXMgcmVwbGFjZWQgd2l0aCBzZWxlY3RlZCB0cmFuc2Zvcm1lclxuICAgIHRocm93IG5ldyBFcnJvcihcIiN7QG5hbWV9IHNob3VsZCBub3QgYmUgZXhlY3V0ZWRcIilcblxuY2xhc3MgVHJhbnNmb3JtV29yZEJ5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdFxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIklubmVyV29yZFwiXG5cbmNsYXNzIFRyYW5zZm9ybVNtYXJ0V29yZEJ5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlRyYW5zZm9ybSBJbm5lclNtYXJ0V29yZCBieSBgdHJhbnNmb3JtLXN0cmluZy1ieS1zZWxlY3QtbGlzdGBcIlxuICB0YXJnZXQ6IFwiSW5uZXJTbWFydFdvcmRcIlxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFJlcGxhY2VXaXRoUmVnaXN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJSZXBsYWNlIHRhcmdldCB3aXRoIHNwZWNpZmllZCByZWdpc3RlciB2YWx1ZVwiXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KClcblxuIyBTYXZlIHRleHQgdG8gcmVnaXN0ZXIgYmVmb3JlIHJlcGxhY2VcbmNsYXNzIFN3YXBXaXRoUmVnaXN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTd2FwIHJlZ2lzdGVyIHZhbHVlIHdpdGggdGFyZ2V0XCJcbiAgZ2V0TmV3VGV4dDogKHRleHQsIHNlbGVjdGlvbikgLT5cbiAgICBuZXdUZXh0ID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldFRleHQoKVxuICAgIEBzZXRUZXh0VG9SZWdpc3Rlcih0ZXh0LCBzZWxlY3Rpb24pXG4gICAgbmV3VGV4dFxuXG4jIEluZGVudCA8IFRyYW5zZm9ybVN0cmluZ1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBJbmRlbnQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIHN0YXlCeU1hcmtlcjogdHJ1ZVxuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZTogdHJ1ZVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgICMgTmVlZCBjb3VudCB0aW1lcyBpbmRlbnRhdGlvbiBpbiB2aXN1YWwtbW9kZSBhbmQgaXRzIHJlcGVhdChgLmApLlxuICAgIGlmIEB0YXJnZXQuaXMoJ0N1cnJlbnRTZWxlY3Rpb24nKVxuICAgICAgb2xkVGV4dCA9IG51bGxcbiAgICAgICAjIGxpbWl0IHRvIDEwMCB0byBhdm9pZCBmcmVlemluZyBieSBhY2NpZGVudGFsIGJpZyBudW1iZXIuXG4gICAgICBjb3VudCA9IGxpbWl0TnVtYmVyKEBnZXRDb3VudCgpLCBtYXg6IDEwMClcbiAgICAgIEBjb3VudFRpbWVzIGNvdW50LCAoe3N0b3B9KSA9PlxuICAgICAgICBvbGRUZXh0ID0gc2VsZWN0aW9uLmdldFRleHQoKVxuICAgICAgICBAaW5kZW50KHNlbGVjdGlvbilcbiAgICAgICAgc3RvcCgpIGlmIHNlbGVjdGlvbi5nZXRUZXh0KCkgaXMgb2xkVGV4dFxuICAgIGVsc2VcbiAgICAgIEBpbmRlbnQoc2VsZWN0aW9uKVxuXG4gIGluZGVudDogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb24uaW5kZW50U2VsZWN0ZWRSb3dzKClcblxuY2xhc3MgT3V0ZGVudCBleHRlbmRzIEluZGVudFxuICBAZXh0ZW5kKClcbiAgaW5kZW50OiAoc2VsZWN0aW9uKSAtPlxuICAgIHNlbGVjdGlvbi5vdXRkZW50U2VsZWN0ZWRSb3dzKClcblxuY2xhc3MgQXV0b0luZGVudCBleHRlbmRzIEluZGVudFxuICBAZXh0ZW5kKClcbiAgaW5kZW50OiAoc2VsZWN0aW9uKSAtPlxuICAgIHNlbGVjdGlvbi5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKClcblxuY2xhc3MgVG9nZ2xlTGluZUNvbW1lbnRzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBzdGF5QnlNYXJrZXI6IHRydWVcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgc2VsZWN0aW9uLnRvZ2dsZUxpbmVDb21tZW50cygpXG5cbmNsYXNzIFJlZmxvdyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goQGVkaXRvckVsZW1lbnQsICdhdXRvZmxvdzpyZWZsb3ctc2VsZWN0aW9uJylcblxuY2xhc3MgUmVmbG93V2l0aFN0YXkgZXh0ZW5kcyBSZWZsb3dcbiAgQGV4dGVuZCgpXG4gIHN0YXlBdFNhbWVQb3NpdGlvbjogdHJ1ZVxuXG4jIFN1cnJvdW5kIDwgVHJhbnNmb3JtU3RyaW5nXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFN1cnJvdW5kQmFzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKGZhbHNlKVxuICBwYWlyczogW1xuICAgIFsnWycsICddJ11cbiAgICBbJygnLCAnKSddXG4gICAgWyd7JywgJ30nXVxuICAgIFsnPCcsICc+J11cbiAgXVxuICBwYWlyc0J5QWxpYXM6IHtcbiAgICBiOiBbJygnLCAnKSddXG4gICAgQjogWyd7JywgJ30nXVxuICAgIHI6IFsnWycsICddJ11cbiAgICBhOiBbJzwnLCAnPiddXG4gIH1cblxuICBwYWlyQ2hhcnNBbGxvd0ZvcndhcmRpbmc6ICdbXSgpe30nXG4gIGlucHV0OiBudWxsXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuICBzdXBwb3J0RWFybHlTZWxlY3Q6IHRydWUgIyBFeHBlcmltZW50YWxcblxuICBmb2N1c0lucHV0Rm9yU3Vycm91bmRDaGFyOiAtPlxuICAgIGlucHV0VUkgPSBAbmV3SW5wdXRVSSgpXG4gICAgaW5wdXRVSS5vbkRpZENvbmZpcm0oQG9uQ29uZmlybVN1cnJvdW5kQ2hhci5iaW5kKHRoaXMpKVxuICAgIGlucHV0VUkub25EaWRDYW5jZWwoQGNhbmNlbE9wZXJhdGlvbi5iaW5kKHRoaXMpKVxuICAgIGlucHV0VUkuZm9jdXMoaGlkZUN1cnNvcjogdHJ1ZSlcblxuICBmb2N1c0lucHV0Rm9yVGFyZ2V0UGFpckNoYXI6IC0+XG4gICAgaW5wdXRVSSA9IEBuZXdJbnB1dFVJKClcbiAgICBpbnB1dFVJLm9uRGlkQ29uZmlybShAb25Db25maXJtVGFyZ2V0UGFpckNoYXIuYmluZCh0aGlzKSlcbiAgICBpbnB1dFVJLm9uRGlkQ2FuY2VsKEBjYW5jZWxPcGVyYXRpb24uYmluZCh0aGlzKSlcbiAgICBpbnB1dFVJLmZvY3VzKClcblxuICBnZXRQYWlyOiAoY2hhcikgLT5cbiAgICBwYWlyID0gQHBhaXJzQnlBbGlhc1tjaGFyXVxuICAgIHBhaXIgPz0gXy5kZXRlY3QoQHBhaXJzLCAocGFpcikgLT4gY2hhciBpbiBwYWlyKVxuICAgIHBhaXIgPz0gW2NoYXIsIGNoYXJdXG4gICAgcGFpclxuXG4gIHN1cnJvdW5kOiAodGV4dCwgY2hhciwgb3B0aW9ucz17fSkgLT5cbiAgICBrZWVwTGF5b3V0ID0gb3B0aW9ucy5rZWVwTGF5b3V0ID8gZmFsc2VcbiAgICBbb3BlbiwgY2xvc2VdID0gQGdldFBhaXIoY2hhcilcbiAgICBpZiAobm90IGtlZXBMYXlvdXQpIGFuZCB0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpXG4gICAgICBAYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dCA9IHRydWVcbiAgICAgIG9wZW4gKz0gXCJcXG5cIlxuICAgICAgY2xvc2UgKz0gXCJcXG5cIlxuXG4gICAgaWYgY2hhciBpbiBAZ2V0Q29uZmlnKCdjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmQnKSBhbmQgaXNTaW5nbGVMaW5lVGV4dCh0ZXh0KVxuICAgICAgdGV4dCA9ICcgJyArIHRleHQgKyAnICdcblxuICAgIG9wZW4gKyB0ZXh0ICsgY2xvc2VcblxuICBkZWxldGVTdXJyb3VuZDogKHRleHQpIC0+XG4gICAgW29wZW4sIGlubmVyVGV4dC4uLiwgY2xvc2VdID0gdGV4dFxuICAgIGlubmVyVGV4dCA9IGlubmVyVGV4dC5qb2luKCcnKVxuICAgIGlmIGlzU2luZ2xlTGluZVRleHQodGV4dCkgYW5kIChvcGVuIGlzbnQgY2xvc2UpXG4gICAgICBpbm5lclRleHQudHJpbSgpXG4gICAgZWxzZVxuICAgICAgaW5uZXJUZXh0XG5cbiAgb25Db25maXJtU3Vycm91bmRDaGFyOiAoQGlucHV0KSAtPlxuICAgIEBwcm9jZXNzT3BlcmF0aW9uKClcblxuICBvbkNvbmZpcm1UYXJnZXRQYWlyQ2hhcjogKGNoYXIpIC0+XG4gICAgQHNldFRhcmdldCBAbmV3KCdBUGFpcicsIHBhaXI6IEBnZXRQYWlyKGNoYXIpKVxuXG5jbGFzcyBTdXJyb3VuZCBleHRlbmRzIFN1cnJvdW5kQmFzZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlN1cnJvdW5kIHRhcmdldCBieSBzcGVjaWZpZWQgY2hhcmFjdGVyIGxpa2UgYChgLCBgW2AsIGBcXFwiYFwiXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAb25EaWRTZWxlY3RUYXJnZXQoQGZvY3VzSW5wdXRGb3JTdXJyb3VuZENoYXIuYmluZCh0aGlzKSlcbiAgICBzdXBlclxuXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIEBzdXJyb3VuZCh0ZXh0LCBAaW5wdXQpXG5cbmNsYXNzIFN1cnJvdW5kV29yZCBleHRlbmRzIFN1cnJvdW5kXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU3Vycm91bmQgKip3b3JkKipcIlxuICB0YXJnZXQ6ICdJbm5lcldvcmQnXG5cbmNsYXNzIFN1cnJvdW5kU21hcnRXb3JkIGV4dGVuZHMgU3Vycm91bmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTdXJyb3VuZCAqKnNtYXJ0LXdvcmQqKlwiXG4gIHRhcmdldDogJ0lubmVyU21hcnRXb3JkJ1xuXG5jbGFzcyBNYXBTdXJyb3VuZCBleHRlbmRzIFN1cnJvdW5kXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU3Vycm91bmQgZWFjaCB3b3JkKGAvXFx3Ky9gKSB3aXRoaW4gdGFyZ2V0XCJcbiAgb2NjdXJyZW5jZTogdHJ1ZVxuICBwYXR0ZXJuRm9yT2NjdXJyZW5jZTogL1xcdysvZ1xuXG4jIERlbGV0ZSBTdXJyb3VuZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBEZWxldGVTdXJyb3VuZCBleHRlbmRzIFN1cnJvdW5kQmFzZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkRlbGV0ZSBzcGVjaWZpZWQgc3Vycm91bmQgY2hhcmFjdGVyIGxpa2UgYChgLCBgW2AsIGBcXFwiYFwiXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAZm9jdXNJbnB1dEZvclRhcmdldFBhaXJDaGFyKCkgdW5sZXNzIEB0YXJnZXQ/XG4gICAgc3VwZXJcblxuICBvbkNvbmZpcm1UYXJnZXRQYWlyQ2hhcjogKGlucHV0KSAtPlxuICAgIHN1cGVyXG4gICAgQGlucHV0ID0gaW5wdXRcbiAgICBAcHJvY2Vzc09wZXJhdGlvbigpXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgQGRlbGV0ZVN1cnJvdW5kKHRleHQpXG5cbmNsYXNzIERlbGV0ZVN1cnJvdW5kQW55UGFpciBleHRlbmRzIERlbGV0ZVN1cnJvdW5kXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiRGVsZXRlIHN1cnJvdW5kIGNoYXJhY3RlciBieSBhdXRvLWRldGVjdCBwYWlyZWQgY2hhciBmcm9tIGN1cnNvciBlbmNsb3NlZCBwYWlyXCJcbiAgdGFyZ2V0OiAnQUFueVBhaXInXG4gIHJlcXVpcmVJbnB1dDogZmFsc2VcblxuY2xhc3MgRGVsZXRlU3Vycm91bmRBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgRGVsZXRlU3Vycm91bmRBbnlQYWlyXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiRGVsZXRlIHN1cnJvdW5kIGNoYXJhY3RlciBieSBhdXRvLWRldGVjdCBwYWlyZWQgY2hhciBmcm9tIGN1cnNvciBlbmNsb3NlZCBwYWlyIGFuZCBmb3J3YXJkaW5nIHBhaXIgd2l0aGluIHNhbWUgbGluZVwiXG4gIHRhcmdldDogJ0FBbnlQYWlyQWxsb3dGb3J3YXJkaW5nJ1xuXG4jIENoYW5nZSBTdXJyb3VuZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBDaGFuZ2VTdXJyb3VuZCBleHRlbmRzIFN1cnJvdW5kQmFzZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkNoYW5nZSBzdXJyb3VuZCBjaGFyYWN0ZXIsIHNwZWNpZnkgYm90aCBmcm9tIGFuZCB0byBwYWlyIGNoYXJcIlxuXG4gIHNob3dEZWxldGVDaGFyT25Ib3ZlcjogLT5cbiAgICBjaGFyID0gQGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKVswXVxuICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoY2hhciwgQHZpbVN0YXRlLmdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKSlcblxuICBpbml0aWFsaXplOiAtPlxuICAgIGlmIEB0YXJnZXQ/XG4gICAgICBAb25EaWRGYWlsU2VsZWN0VGFyZ2V0KEBhYm9ydC5iaW5kKHRoaXMpKVxuICAgIGVsc2VcbiAgICAgIEBvbkRpZEZhaWxTZWxlY3RUYXJnZXQoQGNhbmNlbE9wZXJhdGlvbi5iaW5kKHRoaXMpKVxuICAgICAgQGZvY3VzSW5wdXRGb3JUYXJnZXRQYWlyQ2hhcigpXG4gICAgc3VwZXJcblxuICAgIEBvbkRpZFNlbGVjdFRhcmdldCA9PlxuICAgICAgQHNob3dEZWxldGVDaGFyT25Ib3ZlcigpXG4gICAgICBAZm9jdXNJbnB1dEZvclN1cnJvdW5kQ2hhcigpXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaW5uZXJUZXh0ID0gQGRlbGV0ZVN1cnJvdW5kKHRleHQpXG4gICAgQHN1cnJvdW5kKGlubmVyVGV4dCwgQGlucHV0LCBrZWVwTGF5b3V0OiB0cnVlKVxuXG5jbGFzcyBDaGFuZ2VTdXJyb3VuZEFueVBhaXIgZXh0ZW5kcyBDaGFuZ2VTdXJyb3VuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkNoYW5nZSBzdXJyb3VuZCBjaGFyYWN0ZXIsIGZyb20gY2hhciBpcyBhdXRvLWRldGVjdGVkXCJcbiAgdGFyZ2V0OiBcIkFBbnlQYWlyXCJcblxuY2xhc3MgQ2hhbmdlU3Vycm91bmRBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQ2hhbmdlU3Vycm91bmRBbnlQYWlyXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiQ2hhbmdlIHN1cnJvdW5kIGNoYXJhY3RlciwgZnJvbSBjaGFyIGlzIGF1dG8tZGV0ZWN0ZWQgZnJvbSBlbmNsb3NlZCBhbmQgZm9yd2FyZGluZyBhcmVhXCJcbiAgdGFyZ2V0OiBcIkFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nXCJcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEZJWE1FXG4jIEN1cnJlbnRseSBuYXRpdmUgZWRpdG9yLmpvaW5MaW5lcygpIGlzIGJldHRlciBmb3IgY3Vyc29yIHBvc2l0aW9uIHNldHRpbmdcbiMgU28gSSB1c2UgbmF0aXZlIG1ldGhvZHMgZm9yIGEgbWVhbndoaWxlLlxuY2xhc3MgSm9pbiBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICByZXN0b3JlUG9zaXRpb25zOiBmYWxzZVxuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICByYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgICAjIFdoZW4gY3Vyc29yIGlzIGF0IGxhc3QgQlVGRkVSIHJvdywgaXQgc2VsZWN0IGxhc3QtYnVmZmVyLXJvdywgdGhlblxuICAgICMgam9pbm5pbmcgcmVzdWx0IGluIFwiY2xlYXIgbGFzdC1idWZmZXItcm93IHRleHRcIi5cbiAgICAjIEkgYmVsaWV2ZSB0aGlzIGlzIEJVRyBvZiB1cHN0cmVhbSBhdG9tLWNvcmUuIGd1YXJkIHRoaXMgc2l0dWF0aW9uIGhlcmVcbiAgICB1bmxlc3MgKHJhbmdlLmlzU2luZ2xlTGluZSgpIGFuZCByYW5nZS5lbmQucm93IGlzIEBlZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpKVxuICAgICAgaWYgaXNMaW5ld2lzZVJhbmdlKHJhbmdlKVxuICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UudHJhbnNsYXRlKFswLCAwXSwgWy0xLCBJbmZpbml0eV0pKVxuICAgICAgc2VsZWN0aW9uLmpvaW5MaW5lcygpXG4gICAgZW5kID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuZW5kXG4gICAgc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihlbmQudHJhbnNsYXRlKFswLCAtMV0pKVxuXG5jbGFzcyBKb2luQmFzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKGZhbHNlKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHRyaW06IGZhbHNlXG4gIHRhcmdldDogXCJNb3ZlVG9SZWxhdGl2ZUxpbmVNaW5pbXVtT25lXCJcblxuICBpbml0aWFsaXplOiAtPlxuICAgIEBmb2N1c0lucHV0KGNoYXJzTWF4OiAxMCkgaWYgQHJlcXVpcmVJbnB1dFxuICAgIHN1cGVyXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaWYgQHRyaW1cbiAgICAgIHBhdHRlcm4gPSAvXFxyP1xcblsgXFx0XSovZ1xuICAgIGVsc2VcbiAgICAgIHBhdHRlcm4gPSAvXFxyP1xcbi9nXG4gICAgdGV4dC50cmltUmlnaHQoKS5yZXBsYWNlKHBhdHRlcm4sIEBpbnB1dCkgKyBcIlxcblwiXG5cbmNsYXNzIEpvaW5XaXRoS2VlcGluZ1NwYWNlIGV4dGVuZHMgSm9pbkJhc2VcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGlucHV0OiAnJ1xuXG5jbGFzcyBKb2luQnlJbnB1dCBleHRlbmRzIEpvaW5CYXNlXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiVHJhbnNmb3JtIG11bHRpLWxpbmUgdG8gc2luZ2xlLWxpbmUgYnkgd2l0aCBzcGVjaWZpZWQgc2VwYXJhdG9yIGNoYXJhY3RlclwiXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuICB0cmltOiB0cnVlXG5cbmNsYXNzIEpvaW5CeUlucHV0V2l0aEtlZXBpbmdTcGFjZSBleHRlbmRzIEpvaW5CeUlucHV0XG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiSm9pbiBsaW5lcyB3aXRob3V0IHBhZGRpbmcgc3BhY2UgYmV0d2VlbiBlYWNoIGxpbmVcIlxuICB0cmltOiBmYWxzZVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgU3RyaW5nIHN1ZmZpeCBpbiBuYW1lIGlzIHRvIGF2b2lkIGNvbmZ1c2lvbiB3aXRoICdzcGxpdCcgd2luZG93LlxuY2xhc3MgU3BsaXRTdHJpbmcgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTcGxpdCBzaW5nbGUtbGluZSBpbnRvIG11bHRpLWxpbmUgYnkgc3BsaXR0aW5nIHNwZWNpZmllZCBzZXBhcmF0b3IgY2hhcnNcIlxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgaW5wdXQ6IG51bGxcbiAgdGFyZ2V0OiBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG4gIGtlZXBTcGxpdHRlcjogZmFsc2VcblxuICBpbml0aWFsaXplOiAtPlxuICAgIEBvbkRpZFNldFRhcmdldCA9PlxuICAgICAgQGZvY3VzSW5wdXQoY2hhcnNNYXg6IDEwKVxuICAgIHN1cGVyXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaW5wdXQgPSBAaW5wdXQgb3IgXCJcXFxcblwiXG4gICAgcmVnZXggPSAvLy8je18uZXNjYXBlUmVnRXhwKGlucHV0KX0vLy9nXG4gICAgaWYgQGtlZXBTcGxpdHRlclxuICAgICAgbGluZVNlcGFyYXRvciA9IEBpbnB1dCArIFwiXFxuXCJcbiAgICBlbHNlXG4gICAgICBsaW5lU2VwYXJhdG9yID0gXCJcXG5cIlxuICAgIHRleHQucmVwbGFjZShyZWdleCwgbGluZVNlcGFyYXRvcilcblxuY2xhc3MgU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyIGV4dGVuZHMgU3BsaXRTdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGtlZXBTcGxpdHRlcjogdHJ1ZVxuXG5jbGFzcyBTcGxpdEFyZ3VtZW50cyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAga2VlcFNlcGFyYXRvcjogdHJ1ZVxuICBhdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0OiB0cnVlXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgYWxsVG9rZW5zID0gc3BsaXRBcmd1bWVudHModGV4dC50cmltKCkpXG4gICAgbmV3VGV4dCA9ICcnXG4gICAgd2hpbGUgYWxsVG9rZW5zLmxlbmd0aFxuICAgICAge3RleHQsIHR5cGV9ID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIGlmIHR5cGUgaXMgJ3NlcGFyYXRvcidcbiAgICAgICAgaWYgQGtlZXBTZXBhcmF0b3JcbiAgICAgICAgICB0ZXh0ID0gdGV4dC50cmltKCkgKyBcIlxcblwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0ZXh0ID0gXCJcXG5cIlxuICAgICAgbmV3VGV4dCArPSB0ZXh0XG4gICAgXCJcXG5cIiArIG5ld1RleHQgKyBcIlxcblwiXG5cbmNsYXNzIFNwbGl0QXJndW1lbnRzV2l0aFJlbW92ZVNlcGFyYXRvciBleHRlbmRzIFNwbGl0QXJndW1lbnRzXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBrZWVwU2VwYXJhdG9yOiBmYWxzZVxuXG5jbGFzcyBTcGxpdEFyZ3VtZW50c09mSW5uZXJBbnlQYWlyIGV4dGVuZHMgU3BsaXRBcmd1bWVudHNcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIHRhcmdldDogXCJJbm5lckFueVBhaXJcIlxuXG5jbGFzcyBDaGFuZ2VPcmRlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKGZhbHNlKVxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBpZiBAdGFyZ2V0LmlzTGluZXdpc2UoKVxuICAgICAgQGdldE5ld0xpc3Qoc3BsaXRUZXh0QnlOZXdMaW5lKHRleHQpKS5qb2luKFwiXFxuXCIpICsgXCJcXG5cIlxuICAgIGVsc2VcbiAgICAgIEBzb3J0QXJndW1lbnRzSW5UZXh0QnkodGV4dCwgKGFyZ3MpID0+IEBnZXROZXdMaXN0KGFyZ3MpKVxuXG4gIHNvcnRBcmd1bWVudHNJblRleHRCeTogKHRleHQsIGZuKSAtPlxuICAgIGxlYWRpbmdTcGFjZXMgPSB0cmFpbGluZ1NwYWNlcyA9ICcnXG4gICAgc3RhcnQgPSB0ZXh0LnNlYXJjaCgvXFxTLylcbiAgICBlbmQgPSB0ZXh0LnNlYXJjaCgvXFxzKiQvKVxuICAgIGxlYWRpbmdTcGFjZXMgPSB0cmFpbGluZ1NwYWNlcyA9ICcnXG4gICAgbGVhZGluZ1NwYWNlcyA9IHRleHRbMC4uLnN0YXJ0XSBpZiBzdGFydCBpc250IC0xXG4gICAgdHJhaWxpbmdTcGFjZXMgPSB0ZXh0W2VuZC4uLl0gaWYgZW5kIGlzbnQgLTFcbiAgICB0ZXh0ID0gdGV4dFtzdGFydC4uLmVuZF1cblxuICAgIGFsbFRva2VucyA9IHNwbGl0QXJndW1lbnRzKHRleHQpXG4gICAgYXJncyA9IGFsbFRva2Vuc1xuICAgICAgLmZpbHRlciAodG9rZW4pIC0+IHRva2VuLnR5cGUgaXMgJ2FyZ3VtZW50J1xuICAgICAgLm1hcCAodG9rZW4pIC0+IHRva2VuLnRleHRcbiAgICBuZXdBcmdzID0gZm4oYXJncylcblxuICAgIG5ld1RleHQgPSAnJ1xuICAgIHdoaWxlIGFsbFRva2Vucy5sZW5ndGhcbiAgICAgIHt0ZXh0LCB0eXBlfSA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICBuZXdUZXh0ICs9IHN3aXRjaCB0eXBlXG4gICAgICAgIHdoZW4gJ3NlcGFyYXRvcicgdGhlbiB0ZXh0XG4gICAgICAgIHdoZW4gJ2FyZ3VtZW50JyB0aGVuIG5ld0FyZ3Muc2hpZnQoKVxuICAgIGxlYWRpbmdTcGFjZXMgKyBuZXdUZXh0ICsgdHJhaWxpbmdTcGFjZXNcblxuY2xhc3MgUmV2ZXJzZSBleHRlbmRzIENoYW5nZU9yZGVyXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBnZXROZXdMaXN0OiAocm93cykgLT5cbiAgICByb3dzLnJldmVyc2UoKVxuXG5jbGFzcyBSZXZlcnNlSW5uZXJBbnlQYWlyIGV4dGVuZHMgUmV2ZXJzZVxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIklubmVyQW55UGFpclwiXG5cbmNsYXNzIFJvdGF0ZSBleHRlbmRzIENoYW5nZU9yZGVyXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBiYWNrd2FyZHM6IGZhbHNlXG4gIGdldE5ld0xpc3Q6IChyb3dzKSAtPlxuICAgIGlmIEBiYWNrd2FyZHNcbiAgICAgIHJvd3MucHVzaChyb3dzLnNoaWZ0KCkpXG4gICAgZWxzZVxuICAgICAgcm93cy51bnNoaWZ0KHJvd3MucG9wKCkpXG4gICAgcm93c1xuXG5jbGFzcyBSb3RhdGVCYWNrd2FyZHMgZXh0ZW5kcyBDaGFuZ2VPcmRlclxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgYmFja3dhcmRzOiB0cnVlXG5cbmNsYXNzIFJvdGF0ZUFyZ3VtZW50c09mSW5uZXJQYWlyIGV4dGVuZHMgUm90YXRlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6IFwiSW5uZXJBbnlQYWlyXCJcblxuY2xhc3MgUm90YXRlQXJndW1lbnRzQmFja3dhcmRzT2ZJbm5lclBhaXIgZXh0ZW5kcyBSb3RhdGVBcmd1bWVudHNPZklubmVyUGFpclxuICBAZXh0ZW5kKClcbiAgYmFja3dhcmRzOiB0cnVlXG5cbmNsYXNzIFNvcnQgZXh0ZW5kcyBDaGFuZ2VPcmRlclxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcIlNvcnQgYWxwaGFiZXRpY2FsbHlcIlxuICBnZXROZXdMaXN0OiAocm93cykgLT5cbiAgICByb3dzLnNvcnQoKVxuXG5jbGFzcyBTb3J0Q2FzZUluc2Vuc2l0aXZlbHkgZXh0ZW5kcyBDaGFuZ2VPcmRlclxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcIlNvcnQgYWxwaGFiZXRpY2FsbHkgd2l0aCBjYXNlIGluc2Vuc2l0aXZlbHlcIlxuICBnZXROZXdMaXN0OiAocm93cykgLT5cbiAgICByb3dzLnNvcnQgKHJvd0EsIHJvd0IpIC0+XG4gICAgICByb3dBLmxvY2FsZUNvbXBhcmUocm93Qiwgc2Vuc2l0aXZpdHk6ICdiYXNlJylcblxuY2xhc3MgU29ydEJ5TnVtYmVyIGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTb3J0IG51bWVyaWNhbGx5XCJcbiAgZ2V0TmV3TGlzdDogKHJvd3MpIC0+XG4gICAgXy5zb3J0Qnkgcm93cywgKHJvdykgLT5cbiAgICAgIE51bWJlci5wYXJzZUludChyb3cpIG9yIEluZmluaXR5XG4iXX0=
