(function() {
  var $, CompositeDisposable, Emitter, InputDialog, PlatformIOTerminalView, Pty, Task, Terminal, View, lastActiveElement, lastOpenedView, os, path, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Task = ref.Task, CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, View = ref1.View;

  Pty = require.resolve('./process');

  Terminal = require('term.js');

  InputDialog = null;

  path = require('path');

  os = require('os');

  lastOpenedView = null;

  lastActiveElement = null;

  module.exports = PlatformIOTerminalView = (function(superClass) {
    extend(PlatformIOTerminalView, superClass);

    function PlatformIOTerminalView() {
      this.blurTerminal = bind(this.blurTerminal, this);
      this.focusTerminal = bind(this.focusTerminal, this);
      this.blur = bind(this.blur, this);
      this.focus = bind(this.focus, this);
      this.resizePanel = bind(this.resizePanel, this);
      this.resizeStopped = bind(this.resizeStopped, this);
      this.resizeStarted = bind(this.resizeStarted, this);
      this.onWindowResize = bind(this.onWindowResize, this);
      this.hide = bind(this.hide, this);
      this.open = bind(this.open, this);
      this.recieveItemOrFile = bind(this.recieveItemOrFile, this);
      this.setAnimationSpeed = bind(this.setAnimationSpeed, this);
      return PlatformIOTerminalView.__super__.constructor.apply(this, arguments);
    }

    PlatformIOTerminalView.prototype.animating = false;

    PlatformIOTerminalView.prototype.id = '';

    PlatformIOTerminalView.prototype.maximized = false;

    PlatformIOTerminalView.prototype.opened = false;

    PlatformIOTerminalView.prototype.pwd = '';

    PlatformIOTerminalView.prototype.windowHeight = $(window).height();

    PlatformIOTerminalView.prototype.rowHeight = 20;

    PlatformIOTerminalView.prototype.shell = '';

    PlatformIOTerminalView.prototype.tabView = false;

    PlatformIOTerminalView.content = function() {
      return this.div({
        "class": 'platformio-ide-terminal terminal-view',
        outlet: 'platformIOTerminalView'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-divider',
            outlet: 'panelDivider'
          });
          _this.section({
            "class": 'input-block'
          }, function() {
            return _this.div({
              "class": 'btn-toolbar'
            }, function() {
              _this.div({
                "class": 'btn-group'
              }, function() {
                return _this.button({
                  outlet: 'inputBtn',
                  "class": 'btn icon icon-keyboard',
                  click: 'inputDialog'
                });
              });
              return _this.div({
                "class": 'btn-group right'
              }, function() {
                _this.button({
                  outlet: 'hideBtn',
                  "class": 'btn icon icon-chevron-down',
                  click: 'hide'
                });
                _this.button({
                  outlet: 'maximizeBtn',
                  "class": 'btn icon icon-screen-full',
                  click: 'maximize'
                });
                return _this.button({
                  outlet: 'closeBtn',
                  "class": 'btn icon icon-x',
                  click: 'destroy'
                });
              });
            });
          });
          return _this.div({
            "class": 'xterm',
            outlet: 'xterm'
          });
        };
      })(this));
    };

    PlatformIOTerminalView.getFocusedTerminal = function() {
      return Terminal.Terminal.focus;
    };

    PlatformIOTerminalView.prototype.initialize = function(id, pwd, statusIcon, statusBar, shell, args, autoRun) {
      var bottomHeight, override, percent;
      this.id = id;
      this.pwd = pwd;
      this.statusIcon = statusIcon;
      this.statusBar = statusBar;
      this.shell = shell;
      this.args = args != null ? args : [];
      this.autoRun = autoRun != null ? autoRun : [];
      this.subscriptions = new CompositeDisposable;
      this.emitter = new Emitter;
      this.subscriptions.add(atom.tooltips.add(this.closeBtn, {
        title: 'Close'
      }));
      this.subscriptions.add(atom.tooltips.add(this.hideBtn, {
        title: 'Hide'
      }));
      this.subscriptions.add(this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
        title: 'Fullscreen'
      }));
      this.inputBtn.tooltip = atom.tooltips.add(this.inputBtn, {
        title: 'Insert Text'
      });
      this.prevHeight = atom.config.get('platformio-ide-terminal.style.defaultPanelHeight');
      if (this.prevHeight.indexOf('%') > 0) {
        percent = Math.abs(Math.min(parseFloat(this.prevHeight) / 100.0, 1));
        bottomHeight = $('atom-panel.bottom').children(".terminal-view").height() || 0;
        this.prevHeight = percent * ($('.item-views').height() + bottomHeight);
      }
      this.xterm.height(0);
      this.setAnimationSpeed();
      this.subscriptions.add(atom.config.onDidChange('platformio-ide-terminal.style.animationSpeed', this.setAnimationSpeed));
      override = function(event) {
        if (event.originalEvent.dataTransfer.getData('platformio-ide-terminal') === 'true') {
          return;
        }
        event.preventDefault();
        return event.stopPropagation();
      };
      this.xterm.on('mouseup', (function(_this) {
        return function(event) {
          var text;
          if (event.which !== 3) {
            text = window.getSelection().toString();
            if (atom.config.get('platformio-ide-terminal.toggles.selectToCopy') && text) {
              atom.clipboard.write(text);
            }
            if (!text) {
              return _this.focus();
            }
          }
        };
      })(this));
      this.xterm.on('dragenter', override);
      this.xterm.on('dragover', override);
      this.xterm.on('drop', this.recieveItemOrFile);
      this.on('focus', this.focus);
      this.subscriptions.add({
        dispose: (function(_this) {
          return function() {
            return _this.off('focus', _this.focus);
          };
        })(this)
      });
      if (/zsh|bash/.test(this.shell) && this.args.indexOf('--login') === -1 && Pty.platform !== 'win32' && atom.config.get('platformio-ide-terminal.toggles.loginShell')) {
        return this.args.unshift('--login');
      }
    };

    PlatformIOTerminalView.prototype.attach = function() {
      if (this.panel != null) {
        return;
      }
      return this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
    };

    PlatformIOTerminalView.prototype.setAnimationSpeed = function() {
      this.animationSpeed = atom.config.get('platformio-ide-terminal.style.animationSpeed');
      if (this.animationSpeed === 0) {
        this.animationSpeed = 100;
      }
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    PlatformIOTerminalView.prototype.recieveItemOrFile = function(event) {
      var dataTransfer, file, filePath, i, len, ref2, results;
      event.preventDefault();
      event.stopPropagation();
      dataTransfer = event.originalEvent.dataTransfer;
      if (dataTransfer.getData('atom-event') === 'true') {
        filePath = dataTransfer.getData('text/plain');
        if (filePath) {
          return this.input(filePath + " ");
        }
      } else if (filePath = dataTransfer.getData('initialPath')) {
        return this.input(filePath + " ");
      } else if (dataTransfer.files.length > 0) {
        ref2 = dataTransfer.files;
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          file = ref2[i];
          results.push(this.input(file.path + " "));
        }
        return results;
      }
    };

    PlatformIOTerminalView.prototype.forkPtyProcess = function() {
      return Task.once(Pty, path.resolve(this.pwd), this.shell, this.args, (function(_this) {
        return function() {
          _this.input = function() {};
          return _this.resize = function() {};
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.getId = function() {
      return this.id;
    };

    PlatformIOTerminalView.prototype.displayTerminal = function() {
      var cols, ref2, rows;
      ref2 = this.getDimensions(), cols = ref2.cols, rows = ref2.rows;
      this.ptyProcess = this.forkPtyProcess();
      this.terminal = new Terminal({
        cursorBlink: false,
        scrollback: atom.config.get('platformio-ide-terminal.core.scrollback'),
        cols: cols,
        rows: rows
      });
      this.attachListeners();
      this.attachResizeEvents();
      this.attachWindowEvents();
      return this.terminal.open(this.xterm.get(0));
    };

    PlatformIOTerminalView.prototype.attachListeners = function() {
      this.ptyProcess.on("platformio-ide-terminal:data", (function(_this) {
        return function(data) {
          return _this.terminal.write(data);
        };
      })(this));
      this.ptyProcess.on("platformio-ide-terminal:exit", (function(_this) {
        return function() {
          if (atom.config.get('platformio-ide-terminal.toggles.autoClose')) {
            return _this.destroy();
          }
        };
      })(this));
      this.terminal.end = (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this);
      this.terminal.on("data", (function(_this) {
        return function(data) {
          return _this.input(data);
        };
      })(this));
      this.ptyProcess.on("platformio-ide-terminal:title", (function(_this) {
        return function(title) {
          return _this.process = title;
        };
      })(this));
      this.terminal.on("title", (function(_this) {
        return function(title) {
          return _this.title = title;
        };
      })(this));
      return this.terminal.once("open", (function(_this) {
        return function() {
          var autoRunCommand, command, i, len, ref2, results;
          _this.applyStyle();
          _this.resizeTerminalToView();
          if (_this.ptyProcess.childProcess == null) {
            return;
          }
          autoRunCommand = atom.config.get('platformio-ide-terminal.core.autoRunCommand');
          if (autoRunCommand) {
            _this.input("" + autoRunCommand + os.EOL);
          }
          ref2 = _this.autoRun;
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            command = ref2[i];
            results.push(_this.input("" + command + os.EOL));
          }
          return results;
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.destroy = function() {
      var ref2, ref3;
      this.subscriptions.dispose();
      this.statusIcon.destroy();
      this.statusBar.removeTerminalView(this);
      this.detachResizeEvents();
      this.detachWindowEvents();
      if (this.panel.isVisible()) {
        this.hide();
        this.onTransitionEnd((function(_this) {
          return function() {
            return _this.panel.destroy();
          };
        })(this));
      } else {
        this.panel.destroy();
      }
      if (this.statusIcon && this.statusIcon.parentNode) {
        this.statusIcon.parentNode.removeChild(this.statusIcon);
      }
      if ((ref2 = this.ptyProcess) != null) {
        ref2.terminate();
      }
      return (ref3 = this.terminal) != null ? ref3.destroy() : void 0;
    };

    PlatformIOTerminalView.prototype.maximize = function() {
      var btn;
      this.subscriptions.remove(this.maximizeBtn.tooltip);
      this.maximizeBtn.tooltip.dispose();
      this.maxHeight = this.prevHeight + $('.item-views').height();
      btn = this.maximizeBtn.children('span');
      this.onTransitionEnd((function(_this) {
        return function() {
          return _this.focus();
        };
      })(this));
      if (this.maximized) {
        this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
          title: 'Fullscreen'
        });
        this.subscriptions.add(this.maximizeBtn.tooltip);
        this.adjustHeight(this.prevHeight);
        btn.removeClass('icon-screen-normal').addClass('icon-screen-full');
        return this.maximized = false;
      } else {
        this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
          title: 'Normal'
        });
        this.subscriptions.add(this.maximizeBtn.tooltip);
        this.adjustHeight(this.maxHeight);
        btn.removeClass('icon-screen-full').addClass('icon-screen-normal');
        return this.maximized = true;
      }
    };

    PlatformIOTerminalView.prototype.open = function() {
      var icon;
      if (lastActiveElement == null) {
        lastActiveElement = $(document.activeElement);
      }
      if (lastOpenedView && lastOpenedView !== this) {
        if (lastOpenedView.maximized) {
          this.subscriptions.remove(this.maximizeBtn.tooltip);
          this.maximizeBtn.tooltip.dispose();
          icon = this.maximizeBtn.children('span');
          this.maxHeight = lastOpenedView.maxHeight;
          this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
            title: 'Normal'
          });
          this.subscriptions.add(this.maximizeBtn.tooltip);
          icon.removeClass('icon-screen-full').addClass('icon-screen-normal');
          this.maximized = true;
        }
        lastOpenedView.hide();
      }
      lastOpenedView = this;
      this.statusBar.setActiveTerminalView(this);
      this.statusIcon.activate();
      this.onTransitionEnd((function(_this) {
        return function() {
          if (!_this.opened) {
            _this.opened = true;
            _this.displayTerminal();
            _this.prevHeight = _this.nearestRow(_this.xterm.height());
            _this.xterm.height(_this.prevHeight);
            return _this.emit("platformio-ide-terminal:terminal-open");
          } else {
            return _this.focus();
          }
        };
      })(this));
      this.panel.show();
      this.xterm.height(0);
      this.animating = true;
      return this.xterm.height(this.maximized ? this.maxHeight : this.prevHeight);
    };

    PlatformIOTerminalView.prototype.hide = function() {
      var ref2;
      if ((ref2 = this.terminal) != null) {
        ref2.blur();
      }
      lastOpenedView = null;
      this.statusIcon.deactivate();
      this.onTransitionEnd((function(_this) {
        return function() {
          _this.panel.hide();
          if (lastOpenedView == null) {
            if (lastActiveElement != null) {
              lastActiveElement.focus();
              return lastActiveElement = null;
            }
          }
        };
      })(this));
      this.xterm.height(this.maximized ? this.maxHeight : this.prevHeight);
      this.animating = true;
      return this.xterm.height(0);
    };

    PlatformIOTerminalView.prototype.toggle = function() {
      if (this.animating) {
        return;
      }
      if (this.panel.isVisible()) {
        return this.hide();
      } else {
        return this.open();
      }
    };

    PlatformIOTerminalView.prototype.input = function(data) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      this.terminal.stopScrolling();
      return this.ptyProcess.send({
        event: 'input',
        text: data
      });
    };

    PlatformIOTerminalView.prototype.resize = function(cols, rows) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      return this.ptyProcess.send({
        event: 'resize',
        rows: rows,
        cols: cols
      });
    };

    PlatformIOTerminalView.prototype.pty = function() {
      var wait;
      if (!this.opened) {
        wait = new Promise((function(_this) {
          return function(resolve, reject) {
            _this.emitter.on("platformio-ide-terminal:terminal-open", function() {
              return resolve();
            });
            return setTimeout(reject, 1000);
          };
        })(this));
        return wait.then((function(_this) {
          return function() {
            return _this.ptyPromise();
          };
        })(this));
      } else {
        return this.ptyPromise();
      }
    };

    PlatformIOTerminalView.prototype.ptyPromise = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          if (_this.ptyProcess != null) {
            _this.ptyProcess.on("platformio-ide-terminal:pty", function(pty) {
              return resolve(pty);
            });
            _this.ptyProcess.send({
              event: 'pty'
            });
            return setTimeout(reject, 1000);
          } else {
            return reject();
          }
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.applyStyle = function() {
      var config, defaultFont, editorFont, editorFontSize, overrideFont, overrideFontSize, ref2, ref3;
      config = atom.config.get('platformio-ide-terminal');
      this.xterm.addClass(config.style.theme);
      if (config.toggles.cursorBlink) {
        this.xterm.addClass('cursor-blink');
      }
      editorFont = atom.config.get('editor.fontFamily');
      defaultFont = "Menlo, Consolas, 'DejaVu Sans Mono', monospace";
      overrideFont = config.style.fontFamily;
      this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
      this.subscriptions.add(atom.config.onDidChange('editor.fontFamily', (function(_this) {
        return function(event) {
          editorFont = event.newValue;
          return _this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('platformio-ide-terminal.style.fontFamily', (function(_this) {
        return function(event) {
          overrideFont = event.newValue;
          return _this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
        };
      })(this)));
      editorFontSize = atom.config.get('editor.fontSize');
      overrideFontSize = config.style.fontSize;
      this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
      this.subscriptions.add(atom.config.onDidChange('editor.fontSize', (function(_this) {
        return function(event) {
          editorFontSize = event.newValue;
          _this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
          return _this.resizeTerminalToView();
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('platformio-ide-terminal.style.fontSize', (function(_this) {
        return function(event) {
          overrideFontSize = event.newValue;
          _this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
          return _this.resizeTerminalToView();
        };
      })(this)));
      [].splice.apply(this.terminal.colors, [0, 8].concat(ref2 = [config.ansiColors.normal.black.toHexString(), config.ansiColors.normal.red.toHexString(), config.ansiColors.normal.green.toHexString(), config.ansiColors.normal.yellow.toHexString(), config.ansiColors.normal.blue.toHexString(), config.ansiColors.normal.magenta.toHexString(), config.ansiColors.normal.cyan.toHexString(), config.ansiColors.normal.white.toHexString()])), ref2;
      return ([].splice.apply(this.terminal.colors, [8, 8].concat(ref3 = [config.ansiColors.zBright.brightBlack.toHexString(), config.ansiColors.zBright.brightRed.toHexString(), config.ansiColors.zBright.brightGreen.toHexString(), config.ansiColors.zBright.brightYellow.toHexString(), config.ansiColors.zBright.brightBlue.toHexString(), config.ansiColors.zBright.brightMagenta.toHexString(), config.ansiColors.zBright.brightCyan.toHexString(), config.ansiColors.zBright.brightWhite.toHexString()])), ref3);
    };

    PlatformIOTerminalView.prototype.attachWindowEvents = function() {
      return $(window).on('resize', this.onWindowResize);
    };

    PlatformIOTerminalView.prototype.detachWindowEvents = function() {
      return $(window).off('resize', this.onWindowResize);
    };

    PlatformIOTerminalView.prototype.attachResizeEvents = function() {
      return this.panelDivider.on('mousedown', this.resizeStarted);
    };

    PlatformIOTerminalView.prototype.detachResizeEvents = function() {
      return this.panelDivider.off('mousedown');
    };

    PlatformIOTerminalView.prototype.onWindowResize = function() {
      var bottomPanel, clamped, delta, newHeight, overflow;
      if (!this.tabView) {
        this.xterm.css('transition', '');
        newHeight = $(window).height();
        bottomPanel = $('atom-panel-container.bottom').first().get(0);
        overflow = bottomPanel.scrollHeight - bottomPanel.offsetHeight;
        delta = newHeight - this.windowHeight;
        this.windowHeight = newHeight;
        if (this.maximized) {
          clamped = Math.max(this.maxHeight + delta, this.rowHeight);
          if (this.panel.isVisible()) {
            this.adjustHeight(clamped);
          }
          this.maxHeight = clamped;
          this.prevHeight = Math.min(this.prevHeight, this.maxHeight);
        } else if (overflow > 0) {
          clamped = Math.max(this.nearestRow(this.prevHeight + delta), this.rowHeight);
          if (this.panel.isVisible()) {
            this.adjustHeight(clamped);
          }
          this.prevHeight = clamped;
        }
        this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
      }
      return this.resizeTerminalToView();
    };

    PlatformIOTerminalView.prototype.resizeStarted = function() {
      if (this.maximized) {
        return;
      }
      this.maxHeight = this.prevHeight + $('.item-views').height();
      $(document).on('mousemove', this.resizePanel);
      $(document).on('mouseup', this.resizeStopped);
      return this.xterm.css('transition', '');
    };

    PlatformIOTerminalView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizePanel);
      $(document).off('mouseup', this.resizeStopped);
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    PlatformIOTerminalView.prototype.nearestRow = function(value) {
      var rows;
      rows = Math.floor(value / this.rowHeight);
      return rows * this.rowHeight;
    };

    PlatformIOTerminalView.prototype.resizePanel = function(event) {
      var clamped, delta, mouseY;
      if (event.which !== 1) {
        return this.resizeStopped();
      }
      mouseY = $(window).height() - event.pageY;
      delta = mouseY - $('atom-panel-container.bottom').height() - $('atom-panel-container.footer').height();
      if (!(Math.abs(delta) > (this.rowHeight * 5 / 6))) {
        return;
      }
      clamped = Math.max(this.nearestRow(this.prevHeight + delta), this.rowHeight);
      if (clamped > this.maxHeight) {
        return;
      }
      this.xterm.height(clamped);
      $(this.terminal.element).height(clamped);
      this.prevHeight = clamped;
      return this.resizeTerminalToView();
    };

    PlatformIOTerminalView.prototype.adjustHeight = function(height) {
      this.xterm.height(height);
      return $(this.terminal.element).height(height);
    };

    PlatformIOTerminalView.prototype.copy = function() {
      var lines, rawLines, rawText, text, textarea;
      if (this.terminal._selected) {
        textarea = this.terminal.getCopyTextarea();
        text = this.terminal.grabText(this.terminal._selected.x1, this.terminal._selected.x2, this.terminal._selected.y1, this.terminal._selected.y2);
      } else {
        rawText = this.terminal.context.getSelection().toString();
        rawLines = rawText.split(/\r?\n/g);
        lines = rawLines.map(function(line) {
          return line.replace(/\s/g, " ").trimRight();
        });
        text = lines.join("\n");
      }
      return atom.clipboard.write(text);
    };

    PlatformIOTerminalView.prototype.paste = function() {
      return this.input(atom.clipboard.read());
    };

    PlatformIOTerminalView.prototype.insertSelection = function(customText) {
      var cursor, editor, line, ref2, ref3, ref4, ref5, runCommand, selection, selectionText;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      runCommand = atom.config.get('platformio-ide-terminal.toggles.runInsertedText');
      selectionText = '';
      if (selection = editor.getSelectedText()) {
        this.terminal.stopScrolling();
        selectionText = selection;
      } else if (cursor = editor.getCursorBufferPosition()) {
        line = editor.lineTextForBufferRow(cursor.row);
        this.terminal.stopScrolling();
        selectionText = line;
        editor.moveDown(1);
      }
      return this.input("" + (customText.replace(/\$L/, "" + (editor.getCursorBufferPosition().row + 1)).replace(/\$F/, path.basename(editor != null ? (ref4 = editor.buffer) != null ? (ref5 = ref4.file) != null ? ref5.path : void 0 : void 0 : void 0)).replace(/\$D/, path.dirname(editor != null ? (ref2 = editor.buffer) != null ? (ref3 = ref2.file) != null ? ref3.path : void 0 : void 0 : void 0)).replace(/\$S/, selectionText).replace(/\$\$/, '$')) + (runCommand ? os.EOL : ''));
    };

    PlatformIOTerminalView.prototype.focus = function(fromWindowEvent) {
      this.resizeTerminalToView();
      this.focusTerminal(fromWindowEvent);
      this.statusBar.setActiveTerminalView(this);
      return PlatformIOTerminalView.__super__.focus.call(this);
    };

    PlatformIOTerminalView.prototype.blur = function() {
      this.blurTerminal();
      return PlatformIOTerminalView.__super__.blur.call(this);
    };

    PlatformIOTerminalView.prototype.focusTerminal = function(fromWindowEvent) {
      if (!this.terminal) {
        return;
      }
      lastActiveElement = $(document.activeElement);
      if (fromWindowEvent && !(lastActiveElement.is('div.terminal') || lastActiveElement.parents('div.terminal').length)) {
        return;
      }
      this.terminal.focus();
      if (this.terminal._textarea) {
        return this.terminal._textarea.focus();
      } else {
        return this.terminal.element.focus();
      }
    };

    PlatformIOTerminalView.prototype.blurTerminal = function() {
      if (!this.terminal) {
        return;
      }
      this.terminal.blur();
      this.terminal.element.blur();
      if (lastActiveElement != null) {
        return lastActiveElement.focus();
      }
    };

    PlatformIOTerminalView.prototype.resizeTerminalToView = function() {
      var cols, ref2, rows;
      if (!(this.panel.isVisible() || this.tabView)) {
        return;
      }
      ref2 = this.getDimensions(), cols = ref2.cols, rows = ref2.rows;
      if (!(cols > 0 && rows > 0)) {
        return;
      }
      if (!this.terminal) {
        return;
      }
      if (this.terminal.rows === rows && this.terminal.cols === cols) {
        return;
      }
      this.resize(cols, rows);
      return this.terminal.resize(cols, rows);
    };

    PlatformIOTerminalView.prototype.getDimensions = function() {
      var cols, fakeCol, fakeRow, rows;
      fakeRow = $("<div><span>&nbsp;</span></div>");
      if (this.terminal) {
        this.find('.terminal').append(fakeRow);
        fakeCol = fakeRow.children().first()[0].getBoundingClientRect();
        cols = Math.floor(this.xterm.width() / (fakeCol.width || 9));
        rows = Math.floor(this.xterm.height() / (fakeCol.height || 20));
        this.rowHeight = fakeCol.height;
        fakeRow.remove();
      } else {
        cols = Math.floor(this.xterm.width() / 9);
        rows = Math.floor(this.xterm.height() / 20);
      }
      return {
        cols: cols,
        rows: rows
      };
    };

    PlatformIOTerminalView.prototype.onTransitionEnd = function(callback) {
      return this.xterm.one('webkitTransitionEnd', (function(_this) {
        return function() {
          callback();
          return _this.animating = false;
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.inputDialog = function() {
      var dialog;
      if (InputDialog == null) {
        InputDialog = require('./input-dialog');
      }
      dialog = new InputDialog(this);
      return dialog.attach();
    };

    PlatformIOTerminalView.prototype.rename = function() {
      return this.statusIcon.rename();
    };

    PlatformIOTerminalView.prototype.toggleTabView = function() {
      if (this.tabView) {
        this.panel = atom.workspace.addBottomPanel({
          item: this,
          visible: false
        });
        this.attachResizeEvents();
        this.closeBtn.show();
        this.hideBtn.show();
        this.maximizeBtn.show();
        return this.tabView = false;
      } else {
        this.panel.destroy();
        this.detachResizeEvents();
        this.closeBtn.hide();
        this.hideBtn.hide();
        this.maximizeBtn.hide();
        this.xterm.css("height", "");
        this.tabView = true;
        if (lastOpenedView === this) {
          return lastOpenedView = null;
        }
      }
    };

    PlatformIOTerminalView.prototype.getTitle = function() {
      return this.statusIcon.getName() || "platformio-ide-terminal";
    };

    PlatformIOTerminalView.prototype.getIconName = function() {
      return "terminal";
    };

    PlatformIOTerminalView.prototype.getShell = function() {
      return path.basename(this.shell);
    };

    PlatformIOTerminalView.prototype.getShellPath = function() {
      return this.shell;
    };

    PlatformIOTerminalView.prototype.emit = function(event, data) {
      return this.emitter.emit(event, data);
    };

    PlatformIOTerminalView.prototype.onDidChangeTitle = function(callback) {
      return this.emitter.on('did-change-title', callback);
    };

    PlatformIOTerminalView.prototype.getPath = function() {
      return this.getTerminalTitle();
    };

    PlatformIOTerminalView.prototype.getTerminalTitle = function() {
      return this.title || this.process;
    };

    PlatformIOTerminalView.prototype.getTerminal = function() {
      return this.terminal;
    };

    PlatformIOTerminalView.prototype.isAnimating = function() {
      return this.animating;
    };

    return PlatformIOTerminalView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi92aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUpBQUE7SUFBQTs7OztFQUFBLE1BQXVDLE9BQUEsQ0FBUSxNQUFSLENBQXZDLEVBQUMsZUFBRCxFQUFPLDZDQUFQLEVBQTRCOztFQUM1QixPQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaLEVBQUMsVUFBRCxFQUFJOztFQUVKLEdBQUEsR0FBTSxPQUFPLENBQUMsT0FBUixDQUFnQixXQUFoQjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLFNBQVI7O0VBQ1gsV0FBQSxHQUFjOztFQUVkLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsY0FBQSxHQUFpQjs7RUFDakIsaUJBQUEsR0FBb0I7O0VBRXBCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUNBQ0osU0FBQSxHQUFXOztxQ0FDWCxFQUFBLEdBQUk7O3FDQUNKLFNBQUEsR0FBVzs7cUNBQ1gsTUFBQSxHQUFROztxQ0FDUixHQUFBLEdBQUs7O3FDQUNMLFlBQUEsR0FBYyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBOztxQ0FDZCxTQUFBLEdBQVc7O3FDQUNYLEtBQUEsR0FBTzs7cUNBQ1AsT0FBQSxHQUFTOztJQUVULHNCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx1Q0FBUDtRQUFnRCxNQUFBLEVBQVEsd0JBQXhEO09BQUwsRUFBdUYsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3JGLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGVB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Q0FHbEIsT0FBQSxHQUFTLFNBQUE7QUFDUCxhQUFPLElBQUMsQ0FBQSxnQkFBRCxDQUFBO0lBREE7O3FDQUdULGdCQUFBLEdBQWtCLFNBQUE7QUFDaEIsYUFBTyxJQUFDLENBQUEsS0FBRCxJQUFVLElBQUMsQ0FBQTtJQURGOztxQ0FHbEIsV0FBQSxHQUFhLFNBQUE7QUFDWCxhQUFPLElBQUMsQ0FBQTtJQURHOztxQ0FHYixXQUFBLEdBQWEsU0FBQTtBQUNYLGFBQU8sSUFBQyxDQUFBO0lBREc7Ozs7S0FoakJzQjtBQWRyQyIsInNvdXJjZXNDb250ZW50IjpbIntUYXNrLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuUHR5ID0gcmVxdWlyZS5yZXNvbHZlICcuL3Byb2Nlc3MnXG5UZXJtaW5hbCA9IHJlcXVpcmUgJ3Rlcm0uanMnXG5JbnB1dERpYWxvZyA9IG51bGxcblxucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5vcyA9IHJlcXVpcmUgJ29zJ1xuXG5sYXN0T3BlbmVkVmlldyA9IG51bGxcbmxhc3RBY3RpdmVFbGVtZW50ID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBQbGF0Zm9ybUlPVGVybWluYWxWaWV3IGV4dGVuZHMgVmlld1xuICBhbmltYXRpbmc6IGZhbHNlXG4gIGlkOiAnJ1xuICBtYXhpbWl6ZWQ6IGZhbHNlXG4gIG9wZW5lZDogZmFsc2VcbiAgcHdkOiAnJ1xuICB3aW5kb3dIZWlnaHQ6ICQod2luZG93KS5oZWlnaHQoKVxuICByb3dIZWlnaHQ6IDIwXG4gIHNoZWxsOiAnJ1xuICB0YWJWaWV3OiBmYWxzZVxuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbCB0ZXJtaW5hbC12aWV3Jywgb3V0bGV0OiAncGxhdGZvcm1JT1Rlcm1pbmFsVmlldycsID0+XG4gICAgICBAZGl2IGNsYXNzOiAncGFuZWwtZGl2aWRlcicsIG91dGxldDogJ3BhbmVsRGl2aWRlcidcbiAgICAgIEBzZWN0aW9uIGNsYXNzOiAnaW5wdXQtYmxvY2snLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnYnRuLXRvb2xiYXInLCA9PlxuICAgICAgICAgIEBkaXYgY2xhc3M6ICdidG4tZ3JvdXAnLCA9PlxuICAgICAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdpbnB1dEJ0bicsIGNsYXNzOiAnYnRuIGljb24gaWNvbi1rZXlib2FyZCcsIGNsaWNrOiAnaW5wdXREaWFsb2cnXG4gICAgICAgICAgQGRpdiBjbGFzczogJ2J0bi1ncm91cCByaWdodCcsID0+XG4gICAgICAgICAgICBAYnV0dG9uIG91dGxldDogJ2hpZGVCdG4nLCBjbGFzczogJ2J0biBpY29uIGljb24tY2hldnJvbi1kb3duJywgY2xpY2s6ICdoaWRlJ1xuICAgICAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdtYXhpbWl6ZUJ0bicsIGNsYXNzOiAnYnRuIGljb24gaWNvbi1zY3JlZW4tZnVsbCcsIGNsaWNrOiAnbWF4aW1pemUnXG4gICAgICAgICAgICBAYnV0dG9uIG91dGxldDogJ2Nsb3NlQnRuJywgY2xhc3M6ICdidG4gaWNvbiBpY29uLXgnLCBjbGljazogJ2Rlc3Ryb3knXG4gICAgICBAZGl2IGNsYXNzOiAneHRlcm0nLCBvdXRsZXQ6ICd4dGVybSdcblxuICBAZ2V0Rm9jdXNlZFRlcm1pbmFsOiAtPlxuICAgIHJldHVybiBUZXJtaW5hbC5UZXJtaW5hbC5mb2N1c1xuXG4gIGluaXRpYWxpemU6IChAaWQsIEBwd2QsIEBzdGF0dXNJY29uLCBAc3RhdHVzQmFyLCBAc2hlbGwsIEBhcmdzPVtdLCBAYXV0b1J1bj1bXSkgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBjbG9zZUJ0bixcbiAgICAgIHRpdGxlOiAnQ2xvc2UnXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBoaWRlQnRuLFxuICAgICAgdGl0bGU6ICdIaWRlJ1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWF4aW1pemVCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBtYXhpbWl6ZUJ0bixcbiAgICAgIHRpdGxlOiAnRnVsbHNjcmVlbidcbiAgICBAaW5wdXRCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBpbnB1dEJ0bixcbiAgICAgIHRpdGxlOiAnSW5zZXJ0IFRleHQnXG5cbiAgICBAcHJldkhlaWdodCA9IGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuc3R5bGUuZGVmYXVsdFBhbmVsSGVpZ2h0JylcbiAgICBpZiBAcHJldkhlaWdodC5pbmRleE9mKCclJykgPiAwXG4gICAgICBwZXJjZW50ID0gTWF0aC5hYnMoTWF0aC5taW4ocGFyc2VGbG9hdChAcHJldkhlaWdodCkgLyAxMDAuMCwgMSkpXG4gICAgICBib3R0b21IZWlnaHQgPSAkKCdhdG9tLXBhbmVsLmJvdHRvbScpLmNoaWxkcmVuKFwiLnRlcm1pbmFsLXZpZXdcIikuaGVpZ2h0KCkgb3IgMFxuICAgICAgQHByZXZIZWlnaHQgPSBwZXJjZW50ICogKCQoJy5pdGVtLXZpZXdzJykuaGVpZ2h0KCkgKyBib3R0b21IZWlnaHQpXG4gICAgQHh0ZXJtLmhlaWdodCAwXG5cbiAgICBAc2V0QW5pbWF0aW9uU3BlZWQoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAncGxhdGZvcm1pby1pZGUtdGVybWluYWwuc3R5bGUuYW5pbWF0aW9uU3BlZWQnLCBAc2V0QW5pbWF0aW9uU3BlZWRcblxuICAgIG92ZXJyaWRlID0gKGV2ZW50KSAtPlxuICAgICAgcmV0dXJuIGlmIGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsJykgaXMgJ3RydWUnXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgQHh0ZXJtLm9uICdtb3VzZXVwJywgKGV2ZW50KSA9PlxuICAgICAgaWYgZXZlbnQud2hpY2ggIT0gM1xuICAgICAgICB0ZXh0ID0gd2luZG93LmdldFNlbGVjdGlvbigpLnRvU3RyaW5nKClcbiAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUodGV4dCkgaWYgYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC50b2dnbGVzLnNlbGVjdFRvQ29weScpIGFuZCB0ZXh0XG4gICAgICAgIHVubGVzcyB0ZXh0XG4gICAgICAgICAgQGZvY3VzKClcbiAgICBAeHRlcm0ub24gJ2RyYWdlbnRlcicsIG92ZXJyaWRlXG4gICAgQHh0ZXJtLm9uICdkcmFnb3ZlcicsIG92ZXJyaWRlXG4gICAgQHh0ZXJtLm9uICdkcm9wJywgQHJlY2lldmVJdGVtT3JGaWxlXG5cbiAgICBAb24gJ2ZvY3VzJywgQGZvY3VzXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGRpc3Bvc2U6ID0+XG4gICAgICBAb2ZmICdmb2N1cycsIEBmb2N1c1xuXG4gICAgaWYgL3pzaHxiYXNoLy50ZXN0KEBzaGVsbCkgYW5kIEBhcmdzLmluZGV4T2YoJy0tbG9naW4nKSA9PSAtMSBhbmQgUHR5LnBsYXRmb3JtIGlzbnQgJ3dpbjMyJyBhbmQgYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC50b2dnbGVzLmxvZ2luU2hlbGwnKVxuICAgICAgQGFyZ3MudW5zaGlmdCAnLS1sb2dpbidcblxuICBhdHRhY2g6IC0+XG4gICAgcmV0dXJuIGlmIEBwYW5lbD9cbiAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiB0aGlzLCB2aXNpYmxlOiBmYWxzZSlcblxuICBzZXRBbmltYXRpb25TcGVlZDogPT5cbiAgICBAYW5pbWF0aW9uU3BlZWQgPSBhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLnN0eWxlLmFuaW1hdGlvblNwZWVkJylcbiAgICBAYW5pbWF0aW9uU3BlZWQgPSAxMDAgaWYgQGFuaW1hdGlvblNwZWVkIGlzIDBcblxuICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCBcImhlaWdodCAjezAuMjUgLyBAYW5pbWF0aW9uU3BlZWR9cyBsaW5lYXJcIlxuXG4gIHJlY2lldmVJdGVtT3JGaWxlOiAoZXZlbnQpID0+XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAge2RhdGFUcmFuc2Zlcn0gPSBldmVudC5vcmlnaW5hbEV2ZW50XG5cbiAgICBpZiBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnYXRvbS1ldmVudCcpIGlzICd0cnVlJ1xuICAgICAgZmlsZVBhdGggPSBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGV4dC9wbGFpbicpXG4gICAgICBAaW5wdXQgXCIje2ZpbGVQYXRofSBcIiBpZiBmaWxlUGF0aFxuICAgIGVsc2UgaWYgZmlsZVBhdGggPSBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnaW5pdGlhbFBhdGgnKVxuICAgICAgQGlucHV0IFwiI3tmaWxlUGF0aH0gXCJcbiAgICBlbHNlIGlmIGRhdGFUcmFuc2Zlci5maWxlcy5sZW5ndGggPiAwXG4gICAgICBmb3IgZmlsZSBpbiBkYXRhVHJhbnNmZXIuZmlsZXNcbiAgICAgICAgQGlucHV0IFwiI3tmaWxlLnBhdGh9IFwiXG5cbiAgZm9ya1B0eVByb2Nlc3M6IC0+XG4gICAgVGFzay5vbmNlIFB0eSwgcGF0aC5yZXNvbHZlKEBwd2QpLCBAc2hlbGwsIEBhcmdzLCA9PlxuICAgICAgQGlucHV0ID0gLT5cbiAgICAgIEByZXNpemUgPSAtPlxuXG4gIGdldElkOiAtPlxuICAgIHJldHVybiBAaWRcblxuICBkaXNwbGF5VGVybWluYWw6IC0+XG4gICAge2NvbHMsIHJvd3N9ID0gQGdldERpbWVuc2lvbnMoKVxuICAgIEBwdHlQcm9jZXNzID0gQGZvcmtQdHlQcm9jZXNzKClcblxuICAgIEB0ZXJtaW5hbCA9IG5ldyBUZXJtaW5hbCB7XG4gICAgICBjdXJzb3JCbGluayAgICAgOiBmYWxzZVxuICAgICAgc2Nyb2xsYmFjayAgICAgIDogYXRvbS5jb25maWcuZ2V0ICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5jb3JlLnNjcm9sbGJhY2snXG4gICAgICBjb2xzLCByb3dzXG4gICAgfVxuXG4gICAgQGF0dGFjaExpc3RlbmVycygpXG4gICAgQGF0dGFjaFJlc2l6ZUV2ZW50cygpXG4gICAgQGF0dGFjaFdpbmRvd0V2ZW50cygpXG4gICAgQHRlcm1pbmFsLm9wZW4gQHh0ZXJtLmdldCgwKVxuXG4gIGF0dGFjaExpc3RlbmVyczogLT5cbiAgICBAcHR5UHJvY2Vzcy5vbiBcInBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmRhdGFcIiwgKGRhdGEpID0+XG4gICAgICBAdGVybWluYWwud3JpdGUgZGF0YVxuXG4gICAgQHB0eVByb2Nlc3Mub24gXCJwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpleGl0XCIsID0+XG4gICAgICBAZGVzdHJveSgpIGlmIGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwudG9nZ2xlcy5hdXRvQ2xvc2UnKVxuXG4gICAgQHRlcm1pbmFsLmVuZCA9ID0+IEBkZXN0cm95KClcblxuICAgIEB0ZXJtaW5hbC5vbiBcImRhdGFcIiwgKGRhdGEpID0+XG4gICAgICBAaW5wdXQgZGF0YVxuXG4gICAgQHB0eVByb2Nlc3Mub24gXCJwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDp0aXRsZVwiLCAodGl0bGUpID0+XG4gICAgICBAcHJvY2VzcyA9IHRpdGxlXG4gICAgQHRlcm1pbmFsLm9uIFwidGl0bGVcIiwgKHRpdGxlKSA9PlxuICAgICAgQHRpdGxlID0gdGl0bGVcblxuICAgIEB0ZXJtaW5hbC5vbmNlIFwib3BlblwiLCA9PlxuICAgICAgQGFwcGx5U3R5bGUoKVxuICAgICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcblxuICAgICAgcmV0dXJuIHVubGVzcyBAcHR5UHJvY2Vzcy5jaGlsZFByb2Nlc3M/XG4gICAgICBhdXRvUnVuQ29tbWFuZCA9IGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuY29yZS5hdXRvUnVuQ29tbWFuZCcpXG4gICAgICBAaW5wdXQgXCIje2F1dG9SdW5Db21tYW5kfSN7b3MuRU9MfVwiIGlmIGF1dG9SdW5Db21tYW5kXG4gICAgICBAaW5wdXQgXCIje2NvbW1hbmR9I3tvcy5FT0x9XCIgZm9yIGNvbW1hbmQgaW4gQGF1dG9SdW5cblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBzdGF0dXNJY29uLmRlc3Ryb3koKVxuICAgIEBzdGF0dXNCYXIucmVtb3ZlVGVybWluYWxWaWV3IHRoaXNcbiAgICBAZGV0YWNoUmVzaXplRXZlbnRzKClcbiAgICBAZGV0YWNoV2luZG93RXZlbnRzKClcblxuICAgIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgQGhpZGUoKVxuICAgICAgQG9uVHJhbnNpdGlvbkVuZCA9PiBAcGFuZWwuZGVzdHJveSgpXG4gICAgZWxzZVxuICAgICAgQHBhbmVsLmRlc3Ryb3koKVxuXG4gICAgaWYgQHN0YXR1c0ljb24gYW5kIEBzdGF0dXNJY29uLnBhcmVudE5vZGVcbiAgICAgIEBzdGF0dXNJY29uLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoQHN0YXR1c0ljb24pXG5cbiAgICBAcHR5UHJvY2Vzcz8udGVybWluYXRlKClcbiAgICBAdGVybWluYWw/LmRlc3Ryb3koKVxuXG4gIG1heGltaXplOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLnJlbW92ZSBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgIEBtYXhpbWl6ZUJ0bi50b29sdGlwLmRpc3Bvc2UoKVxuXG4gICAgQG1heEhlaWdodCA9IEBwcmV2SGVpZ2h0ICsgJCgnLml0ZW0tdmlld3MnKS5oZWlnaHQoKVxuICAgIGJ0biA9IEBtYXhpbWl6ZUJ0bi5jaGlsZHJlbignc3BhbicpXG4gICAgQG9uVHJhbnNpdGlvbkVuZCA9PiBAZm9jdXMoKVxuXG4gICAgaWYgQG1heGltaXplZFxuICAgICAgQG1heGltaXplQnRuLnRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCBAbWF4aW1pemVCdG4sXG4gICAgICAgIHRpdGxlOiAnRnVsbHNjcmVlbidcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgICAgQGFkanVzdEhlaWdodCBAcHJldkhlaWdodFxuICAgICAgYnRuLnJlbW92ZUNsYXNzKCdpY29uLXNjcmVlbi1ub3JtYWwnKS5hZGRDbGFzcygnaWNvbi1zY3JlZW4tZnVsbCcpXG4gICAgICBAbWF4aW1pemVkID0gZmFsc2VcbiAgICBlbHNlXG4gICAgICBAbWF4aW1pemVCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBtYXhpbWl6ZUJ0bixcbiAgICAgICAgdGl0bGU6ICdOb3JtYWwnXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1heGltaXplQnRuLnRvb2x0aXBcbiAgICAgIEBhZGp1c3RIZWlnaHQgQG1heEhlaWdodFxuICAgICAgYnRuLnJlbW92ZUNsYXNzKCdpY29uLXNjcmVlbi1mdWxsJykuYWRkQ2xhc3MoJ2ljb24tc2NyZWVuLW5vcm1hbCcpXG4gICAgICBAbWF4aW1pemVkID0gdHJ1ZVxuXG4gIG9wZW46ID0+XG4gICAgbGFzdEFjdGl2ZUVsZW1lbnQgPz0gJChkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuXG4gICAgaWYgbGFzdE9wZW5lZFZpZXcgYW5kIGxhc3RPcGVuZWRWaWV3ICE9IHRoaXNcbiAgICAgIGlmIGxhc3RPcGVuZWRWaWV3Lm1heGltaXplZFxuICAgICAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUgQG1heGltaXplQnRuLnRvb2x0aXBcbiAgICAgICAgQG1heGltaXplQnRuLnRvb2x0aXAuZGlzcG9zZSgpXG4gICAgICAgIGljb24gPSBAbWF4aW1pemVCdG4uY2hpbGRyZW4oJ3NwYW4nKVxuXG4gICAgICAgIEBtYXhIZWlnaHQgPSBsYXN0T3BlbmVkVmlldy5tYXhIZWlnaHRcbiAgICAgICAgQG1heGltaXplQnRuLnRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCBAbWF4aW1pemVCdG4sXG4gICAgICAgICAgdGl0bGU6ICdOb3JtYWwnXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgICAgICBpY29uLnJlbW92ZUNsYXNzKCdpY29uLXNjcmVlbi1mdWxsJykuYWRkQ2xhc3MoJ2ljb24tc2NyZWVuLW5vcm1hbCcpXG4gICAgICAgIEBtYXhpbWl6ZWQgPSB0cnVlXG4gICAgICBsYXN0T3BlbmVkVmlldy5oaWRlKClcblxuICAgIGxhc3RPcGVuZWRWaWV3ID0gdGhpc1xuICAgIEBzdGF0dXNCYXIuc2V0QWN0aXZlVGVybWluYWxWaWV3IHRoaXNcbiAgICBAc3RhdHVzSWNvbi5hY3RpdmF0ZSgpXG5cbiAgICBAb25UcmFuc2l0aW9uRW5kID0+XG4gICAgICBpZiBub3QgQG9wZW5lZFxuICAgICAgICBAb3BlbmVkID0gdHJ1ZVxuICAgICAgICBAZGlzcGxheVRlcm1pbmFsKClcbiAgICAgICAgQHByZXZIZWlnaHQgPSBAbmVhcmVzdFJvdyhAeHRlcm0uaGVpZ2h0KCkpXG4gICAgICAgIEB4dGVybS5oZWlnaHQoQHByZXZIZWlnaHQpXG4gICAgICAgIEBlbWl0IFwicGxhdGZvcm1pby1pZGUtdGVybWluYWw6dGVybWluYWwtb3BlblwiXG4gICAgICBlbHNlXG4gICAgICAgIEBmb2N1cygpXG5cbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQHh0ZXJtLmhlaWdodCAwXG4gICAgQGFuaW1hdGluZyA9IHRydWVcbiAgICBAeHRlcm0uaGVpZ2h0IGlmIEBtYXhpbWl6ZWQgdGhlbiBAbWF4SGVpZ2h0IGVsc2UgQHByZXZIZWlnaHRcblxuICBoaWRlOiA9PlxuICAgIEB0ZXJtaW5hbD8uYmx1cigpXG4gICAgbGFzdE9wZW5lZFZpZXcgPSBudWxsXG4gICAgQHN0YXR1c0ljb24uZGVhY3RpdmF0ZSgpXG5cbiAgICBAb25UcmFuc2l0aW9uRW5kID0+XG4gICAgICBAcGFuZWwuaGlkZSgpXG4gICAgICB1bmxlc3MgbGFzdE9wZW5lZFZpZXc/XG4gICAgICAgIGlmIGxhc3RBY3RpdmVFbGVtZW50P1xuICAgICAgICAgIGxhc3RBY3RpdmVFbGVtZW50LmZvY3VzKClcbiAgICAgICAgICBsYXN0QWN0aXZlRWxlbWVudCA9IG51bGxcblxuICAgIEB4dGVybS5oZWlnaHQgaWYgQG1heGltaXplZCB0aGVuIEBtYXhIZWlnaHQgZWxzZSBAcHJldkhlaWdodFxuICAgIEBhbmltYXRpbmcgPSB0cnVlXG4gICAgQHh0ZXJtLmhlaWdodCAwXG5cbiAgdG9nZ2xlOiAtPlxuICAgIHJldHVybiBpZiBAYW5pbWF0aW5nXG5cbiAgICBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgIEBoaWRlKClcbiAgICBlbHNlXG4gICAgICBAb3BlbigpXG5cbiAgaW5wdXQ6IChkYXRhKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQHB0eVByb2Nlc3MuY2hpbGRQcm9jZXNzP1xuXG4gICAgQHRlcm1pbmFsLnN0b3BTY3JvbGxpbmcoKVxuICAgIEBwdHlQcm9jZXNzLnNlbmQgZXZlbnQ6ICdpbnB1dCcsIHRleHQ6IGRhdGFcblxuICByZXNpemU6IChjb2xzLCByb3dzKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQHB0eVByb2Nlc3MuY2hpbGRQcm9jZXNzP1xuXG4gICAgQHB0eVByb2Nlc3Muc2VuZCB7ZXZlbnQ6ICdyZXNpemUnLCByb3dzLCBjb2xzfVxuXG4gIHB0eTogKCkgLT5cbiAgICBpZiBub3QgQG9wZW5lZFxuICAgICAgd2FpdCA9IG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICAgIEBlbWl0dGVyLm9uIFwicGxhdGZvcm1pby1pZGUtdGVybWluYWw6dGVybWluYWwtb3BlblwiLCAoKSA9PlxuICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICBzZXRUaW1lb3V0IHJlamVjdCwgMTAwMFxuXG4gICAgICB3YWl0LnRoZW4gKCkgPT5cbiAgICAgICAgQHB0eVByb21pc2UoKVxuICAgIGVsc2VcbiAgICAgIEBwdHlQcm9taXNlKClcblxuICBwdHlQcm9taXNlOiAoKSAtPlxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBpZiBAcHR5UHJvY2Vzcz9cbiAgICAgICAgQHB0eVByb2Nlc3Mub24gXCJwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpwdHlcIiwgKHB0eSkgPT5cbiAgICAgICAgICByZXNvbHZlKHB0eSlcbiAgICAgICAgQHB0eVByb2Nlc3Muc2VuZCB7ZXZlbnQ6ICdwdHknfVxuICAgICAgICBzZXRUaW1lb3V0IHJlamVjdCwgMTAwMFxuICAgICAgZWxzZVxuICAgICAgICByZWplY3QoKVxuXG4gIGFwcGx5U3R5bGU6IC0+XG4gICAgY29uZmlnID0gYXRvbS5jb25maWcuZ2V0ICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbCdcblxuICAgIEB4dGVybS5hZGRDbGFzcyBjb25maWcuc3R5bGUudGhlbWVcbiAgICBAeHRlcm0uYWRkQ2xhc3MgJ2N1cnNvci1ibGluaycgaWYgY29uZmlnLnRvZ2dsZXMuY3Vyc29yQmxpbmtcblxuICAgIGVkaXRvckZvbnQgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250RmFtaWx5JylcbiAgICBkZWZhdWx0Rm9udCA9IFwiTWVubG8sIENvbnNvbGFzLCAnRGVqYVZ1IFNhbnMgTW9ubycsIG1vbm9zcGFjZVwiXG4gICAgb3ZlcnJpZGVGb250ID0gY29uZmlnLnN0eWxlLmZvbnRGYW1pbHlcbiAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250RmFtaWx5ID0gb3ZlcnJpZGVGb250IG9yIGVkaXRvckZvbnQgb3IgZGVmYXVsdEZvbnRcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnZWRpdG9yLmZvbnRGYW1pbHknLCAoZXZlbnQpID0+XG4gICAgICBlZGl0b3JGb250ID0gZXZlbnQubmV3VmFsdWVcbiAgICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRGYW1pbHkgPSBvdmVycmlkZUZvbnQgb3IgZWRpdG9yRm9udCBvciBkZWZhdWx0Rm9udFxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAncGxhdGZvcm1pby1pZGUtdGVybWluYWwuc3R5bGUuZm9udEZhbWlseScsIChldmVudCkgPT5cbiAgICAgIG92ZXJyaWRlRm9udCA9IGV2ZW50Lm5ld1ZhbHVlXG4gICAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250RmFtaWx5ID0gb3ZlcnJpZGVGb250IG9yIGVkaXRvckZvbnQgb3IgZGVmYXVsdEZvbnRcblxuICAgIGVkaXRvckZvbnRTaXplID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IuZm9udFNpemUnKVxuICAgIG92ZXJyaWRlRm9udFNpemUgPSBjb25maWcuc3R5bGUuZm9udFNpemVcbiAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250U2l6ZSA9IFwiI3tvdmVycmlkZUZvbnRTaXplIG9yIGVkaXRvckZvbnRTaXplfXB4XCJcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnZWRpdG9yLmZvbnRTaXplJywgKGV2ZW50KSA9PlxuICAgICAgZWRpdG9yRm9udFNpemUgPSBldmVudC5uZXdWYWx1ZVxuICAgICAgQHRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuZm9udFNpemUgPSBcIiN7b3ZlcnJpZGVGb250U2l6ZSBvciBlZGl0b3JGb250U2l6ZX1weFwiXG4gICAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAncGxhdGZvcm1pby1pZGUtdGVybWluYWwuc3R5bGUuZm9udFNpemUnLCAoZXZlbnQpID0+XG4gICAgICBvdmVycmlkZUZvbnRTaXplID0gZXZlbnQubmV3VmFsdWVcbiAgICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRTaXplID0gXCIje292ZXJyaWRlRm9udFNpemUgb3IgZWRpdG9yRm9udFNpemV9cHhcIlxuICAgICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcblxuICAgICMgZmlyc3QgOCBjb2xvcnMgaS5lLiAnZGFyaycgY29sb3JzXG4gICAgQHRlcm1pbmFsLmNvbG9yc1swLi43XSA9IFtcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5ibGFjay50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwucmVkLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5ncmVlbi50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwueWVsbG93LnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5ibHVlLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5tYWdlbnRhLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5jeWFuLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC53aGl0ZS50b0hleFN0cmluZygpXG4gICAgXVxuICAgICMgJ2JyaWdodCcgY29sb3JzXG4gICAgQHRlcm1pbmFsLmNvbG9yc1s4Li4xNV0gPSBbXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodEJsYWNrLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0UmVkLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0R3JlZW4udG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRZZWxsb3cudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRCbHVlLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0TWFnZW50YS50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodEN5YW4udG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRXaGl0ZS50b0hleFN0cmluZygpXG4gICAgXVxuXG4gIGF0dGFjaFdpbmRvd0V2ZW50czogLT5cbiAgICAkKHdpbmRvdykub24gJ3Jlc2l6ZScsIEBvbldpbmRvd1Jlc2l6ZVxuXG4gIGRldGFjaFdpbmRvd0V2ZW50czogLT5cbiAgICAkKHdpbmRvdykub2ZmICdyZXNpemUnLCBAb25XaW5kb3dSZXNpemVcblxuICBhdHRhY2hSZXNpemVFdmVudHM6IC0+XG4gICAgQHBhbmVsRGl2aWRlci5vbiAnbW91c2Vkb3duJywgQHJlc2l6ZVN0YXJ0ZWRcblxuICBkZXRhY2hSZXNpemVFdmVudHM6IC0+XG4gICAgQHBhbmVsRGl2aWRlci5vZmYgJ21vdXNlZG93bidcblxuICBvbldpbmRvd1Jlc2l6ZTogPT5cbiAgICBpZiBub3QgQHRhYlZpZXdcbiAgICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCAnJ1xuICAgICAgbmV3SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXG4gICAgICBib3R0b21QYW5lbCA9ICQoJ2F0b20tcGFuZWwtY29udGFpbmVyLmJvdHRvbScpLmZpcnN0KCkuZ2V0KDApXG4gICAgICBvdmVyZmxvdyA9IGJvdHRvbVBhbmVsLnNjcm9sbEhlaWdodCAtIGJvdHRvbVBhbmVsLm9mZnNldEhlaWdodFxuXG4gICAgICBkZWx0YSA9IG5ld0hlaWdodCAtIEB3aW5kb3dIZWlnaHRcbiAgICAgIEB3aW5kb3dIZWlnaHQgPSBuZXdIZWlnaHRcblxuICAgICAgaWYgQG1heGltaXplZFxuICAgICAgICBjbGFtcGVkID0gTWF0aC5tYXgoQG1heEhlaWdodCArIGRlbHRhLCBAcm93SGVpZ2h0KVxuXG4gICAgICAgIEBhZGp1c3RIZWlnaHQgY2xhbXBlZCBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgICAgQG1heEhlaWdodCA9IGNsYW1wZWRcblxuICAgICAgICBAcHJldkhlaWdodCA9IE1hdGgubWluKEBwcmV2SGVpZ2h0LCBAbWF4SGVpZ2h0KVxuICAgICAgZWxzZSBpZiBvdmVyZmxvdyA+IDBcbiAgICAgICAgY2xhbXBlZCA9IE1hdGgubWF4KEBuZWFyZXN0Um93KEBwcmV2SGVpZ2h0ICsgZGVsdGEpLCBAcm93SGVpZ2h0KVxuXG4gICAgICAgIEBhZGp1c3RIZWlnaHQgY2xhbXBlZCBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgICAgQHByZXZIZWlnaHQgPSBjbGFtcGVkXG5cbiAgICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCBcImhlaWdodCAjezAuMjUgLyBAYW5pbWF0aW9uU3BlZWR9cyBsaW5lYXJcIlxuICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG5cbiAgcmVzaXplU3RhcnRlZDogPT5cbiAgICByZXR1cm4gaWYgQG1heGltaXplZFxuICAgIEBtYXhIZWlnaHQgPSBAcHJldkhlaWdodCArICQoJy5pdGVtLXZpZXdzJykuaGVpZ2h0KClcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgQHJlc2l6ZVBhbmVsKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgQHJlc2l6ZVN0b3BwZWQpXG4gICAgQHh0ZXJtLmNzcyAndHJhbnNpdGlvbicsICcnXG5cbiAgcmVzaXplU3RvcHBlZDogPT5cbiAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNlbW92ZScsIEByZXNpemVQYW5lbClcbiAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNldXAnLCBAcmVzaXplU3RvcHBlZClcbiAgICBAeHRlcm0uY3NzICd0cmFuc2l0aW9uJywgXCJoZWlnaHQgI3swLjI1IC8gQGFuaW1hdGlvblNwZWVkfXMgbGluZWFyXCJcblxuICBuZWFyZXN0Um93OiAodmFsdWUpIC0+XG4gICAgcm93cyA9IHZhbHVlIC8vIEByb3dIZWlnaHRcbiAgICByZXR1cm4gcm93cyAqIEByb3dIZWlnaHRcblxuICByZXNpemVQYW5lbDogKGV2ZW50KSA9PlxuICAgIHJldHVybiBAcmVzaXplU3RvcHBlZCgpIHVubGVzcyBldmVudC53aGljaCBpcyAxXG5cbiAgICBtb3VzZVkgPSAkKHdpbmRvdykuaGVpZ2h0KCkgLSBldmVudC5wYWdlWVxuICAgIGRlbHRhID0gbW91c2VZIC0gJCgnYXRvbS1wYW5lbC1jb250YWluZXIuYm90dG9tJykuaGVpZ2h0KCkgLSAkKCdhdG9tLXBhbmVsLWNvbnRhaW5lci5mb290ZXInKS5oZWlnaHQoKVxuICAgIHJldHVybiB1bmxlc3MgTWF0aC5hYnMoZGVsdGEpID4gKEByb3dIZWlnaHQgKiA1IC8gNilcblxuICAgIGNsYW1wZWQgPSBNYXRoLm1heChAbmVhcmVzdFJvdyhAcHJldkhlaWdodCArIGRlbHRhKSwgQHJvd0hlaWdodClcbiAgICByZXR1cm4gaWYgY2xhbXBlZCA+IEBtYXhIZWlnaHRcblxuICAgIEB4dGVybS5oZWlnaHQgY2xhbXBlZFxuICAgICQoQHRlcm1pbmFsLmVsZW1lbnQpLmhlaWdodCBjbGFtcGVkXG4gICAgQHByZXZIZWlnaHQgPSBjbGFtcGVkXG5cbiAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuXG4gIGFkanVzdEhlaWdodDogKGhlaWdodCkgLT5cbiAgICBAeHRlcm0uaGVpZ2h0IGhlaWdodFxuICAgICQoQHRlcm1pbmFsLmVsZW1lbnQpLmhlaWdodCBoZWlnaHRcblxuICBjb3B5OiAtPlxuICAgIGlmIEB0ZXJtaW5hbC5fc2VsZWN0ZWRcbiAgICAgIHRleHRhcmVhID0gQHRlcm1pbmFsLmdldENvcHlUZXh0YXJlYSgpXG4gICAgICB0ZXh0ID0gQHRlcm1pbmFsLmdyYWJUZXh0KFxuICAgICAgICBAdGVybWluYWwuX3NlbGVjdGVkLngxLCBAdGVybWluYWwuX3NlbGVjdGVkLngyLFxuICAgICAgICBAdGVybWluYWwuX3NlbGVjdGVkLnkxLCBAdGVybWluYWwuX3NlbGVjdGVkLnkyKVxuICAgIGVsc2VcbiAgICAgIHJhd1RleHQgPSBAdGVybWluYWwuY29udGV4dC5nZXRTZWxlY3Rpb24oKS50b1N0cmluZygpXG4gICAgICByYXdMaW5lcyA9IHJhd1RleHQuc3BsaXQoL1xccj9cXG4vZylcbiAgICAgIGxpbmVzID0gcmF3TGluZXMubWFwIChsaW5lKSAtPlxuICAgICAgICBsaW5lLnJlcGxhY2UoL1xccy9nLCBcIiBcIikudHJpbVJpZ2h0KClcbiAgICAgIHRleHQgPSBsaW5lcy5qb2luKFwiXFxuXCIpXG4gICAgYXRvbS5jbGlwYm9hcmQud3JpdGUgdGV4dFxuXG4gIHBhc3RlOiAtPlxuICAgIEBpbnB1dCBhdG9tLmNsaXBib2FyZC5yZWFkKClcblxuICBpbnNlcnRTZWxlY3Rpb246IChjdXN0b21UZXh0KSAtPlxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcnVuQ29tbWFuZCA9IGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwudG9nZ2xlcy5ydW5JbnNlcnRlZFRleHQnKVxuICAgIHNlbGVjdGlvblRleHQgPSAnJ1xuICAgIGlmIHNlbGVjdGlvbiA9IGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKVxuICAgICAgQHRlcm1pbmFsLnN0b3BTY3JvbGxpbmcoKVxuICAgICAgc2VsZWN0aW9uVGV4dCA9IHNlbGVjdGlvblxuICAgIGVsc2UgaWYgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coY3Vyc29yLnJvdylcbiAgICAgIEB0ZXJtaW5hbC5zdG9wU2Nyb2xsaW5nKClcbiAgICAgIHNlbGVjdGlvblRleHQgPSBsaW5lXG4gICAgICBlZGl0b3IubW92ZURvd24oMSk7XG4gICAgQGlucHV0IFwiI3tjdXN0b21UZXh0LlxuICAgICAgcmVwbGFjZSgvXFwkTC8sIFwiI3tlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3cgKyAxfVwiKS5cbiAgICAgIHJlcGxhY2UoL1xcJEYvLCBwYXRoLmJhc2VuYW1lKGVkaXRvcj8uYnVmZmVyPy5maWxlPy5wYXRoKSkuXG4gICAgICByZXBsYWNlKC9cXCRELywgcGF0aC5kaXJuYW1lKGVkaXRvcj8uYnVmZmVyPy5maWxlPy5wYXRoKSkuXG4gICAgICByZXBsYWNlKC9cXCRTLywgc2VsZWN0aW9uVGV4dCkuXG4gICAgICByZXBsYWNlKC9cXCRcXCQvLCAnJCcpfSN7aWYgcnVuQ29tbWFuZCB0aGVuIG9zLkVPTCBlbHNlICcnfVwiXG5cbiAgZm9jdXM6IChmcm9tV2luZG93RXZlbnQpID0+XG4gICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcbiAgICBAZm9jdXNUZXJtaW5hbChmcm9tV2luZG93RXZlbnQpXG4gICAgQHN0YXR1c0Jhci5zZXRBY3RpdmVUZXJtaW5hbFZpZXcodGhpcylcbiAgICBzdXBlcigpXG5cbiAgYmx1cjogPT5cbiAgICBAYmx1clRlcm1pbmFsKClcbiAgICBzdXBlcigpXG5cbiAgZm9jdXNUZXJtaW5hbDogKGZyb21XaW5kb3dFdmVudCkgPT5cbiAgICByZXR1cm4gdW5sZXNzIEB0ZXJtaW5hbFxuXG4gICAgbGFzdEFjdGl2ZUVsZW1lbnQgPSAkKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG4gICAgcmV0dXJuIGlmIGZyb21XaW5kb3dFdmVudCBhbmQgbm90IChsYXN0QWN0aXZlRWxlbWVudC5pcygnZGl2LnRlcm1pbmFsJykgb3IgbGFzdEFjdGl2ZUVsZW1lbnQucGFyZW50cygnZGl2LnRlcm1pbmFsJykubGVuZ3RoKVxuXG4gICAgQHRlcm1pbmFsLmZvY3VzKClcbiAgICBpZiBAdGVybWluYWwuX3RleHRhcmVhXG4gICAgICBAdGVybWluYWwuX3RleHRhcmVhLmZvY3VzKClcbiAgICBlbHNlXG4gICAgICBAdGVybWluYWwuZWxlbWVudC5mb2N1cygpXG5cbiAgYmx1clRlcm1pbmFsOiA9PlxuICAgIHJldHVybiB1bmxlc3MgQHRlcm1pbmFsXG5cbiAgICBAdGVybWluYWwuYmx1cigpXG4gICAgQHRlcm1pbmFsLmVsZW1lbnQuYmx1cigpXG5cbiAgICBpZiBsYXN0QWN0aXZlRWxlbWVudD9cbiAgICAgIGxhc3RBY3RpdmVFbGVtZW50LmZvY3VzKClcblxuICByZXNpemVUZXJtaW5hbFRvVmlldzogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBwYW5lbC5pc1Zpc2libGUoKSBvciBAdGFiVmlld1xuXG4gICAge2NvbHMsIHJvd3N9ID0gQGdldERpbWVuc2lvbnMoKVxuICAgIHJldHVybiB1bmxlc3MgY29scyA+IDAgYW5kIHJvd3MgPiAwXG4gICAgcmV0dXJuIHVubGVzcyBAdGVybWluYWxcbiAgICByZXR1cm4gaWYgQHRlcm1pbmFsLnJvd3MgaXMgcm93cyBhbmQgQHRlcm1pbmFsLmNvbHMgaXMgY29sc1xuXG4gICAgQHJlc2l6ZSBjb2xzLCByb3dzXG4gICAgQHRlcm1pbmFsLnJlc2l6ZSBjb2xzLCByb3dzXG5cbiAgZ2V0RGltZW5zaW9uczogLT5cbiAgICBmYWtlUm93ID0gJChcIjxkaXY+PHNwYW4+Jm5ic3A7PC9zcGFuPjwvZGl2PlwiKVxuXG4gICAgaWYgQHRlcm1pbmFsXG4gICAgICBAZmluZCgnLnRlcm1pbmFsJykuYXBwZW5kIGZha2VSb3dcbiAgICAgIGZha2VDb2wgPSBmYWtlUm93LmNoaWxkcmVuKCkuZmlyc3QoKVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29scyA9IE1hdGguZmxvb3IgQHh0ZXJtLndpZHRoKCkgLyAoZmFrZUNvbC53aWR0aCBvciA5KVxuICAgICAgcm93cyA9IE1hdGguZmxvb3IgQHh0ZXJtLmhlaWdodCgpIC8gKGZha2VDb2wuaGVpZ2h0IG9yIDIwKVxuICAgICAgQHJvd0hlaWdodCA9IGZha2VDb2wuaGVpZ2h0XG4gICAgICBmYWtlUm93LnJlbW92ZSgpXG4gICAgZWxzZVxuICAgICAgY29scyA9IE1hdGguZmxvb3IgQHh0ZXJtLndpZHRoKCkgLyA5XG4gICAgICByb3dzID0gTWF0aC5mbG9vciBAeHRlcm0uaGVpZ2h0KCkgLyAyMFxuXG4gICAge2NvbHMsIHJvd3N9XG5cbiAgb25UcmFuc2l0aW9uRW5kOiAoY2FsbGJhY2spIC0+XG4gICAgQHh0ZXJtLm9uZSAnd2Via2l0VHJhbnNpdGlvbkVuZCcsID0+XG4gICAgICBjYWxsYmFjaygpXG4gICAgICBAYW5pbWF0aW5nID0gZmFsc2VcblxuICBpbnB1dERpYWxvZzogLT5cbiAgICBJbnB1dERpYWxvZyA/PSByZXF1aXJlKCcuL2lucHV0LWRpYWxvZycpXG4gICAgZGlhbG9nID0gbmV3IElucHV0RGlhbG9nIHRoaXNcbiAgICBkaWFsb2cuYXR0YWNoKClcblxuICByZW5hbWU6IC0+XG4gICAgQHN0YXR1c0ljb24ucmVuYW1lKClcblxuICB0b2dnbGVUYWJWaWV3OiAtPlxuICAgIGlmIEB0YWJWaWV3XG4gICAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiB0aGlzLCB2aXNpYmxlOiBmYWxzZSlcbiAgICAgIEBhdHRhY2hSZXNpemVFdmVudHMoKVxuICAgICAgQGNsb3NlQnRuLnNob3coKVxuICAgICAgQGhpZGVCdG4uc2hvdygpXG4gICAgICBAbWF4aW1pemVCdG4uc2hvdygpXG4gICAgICBAdGFiVmlldyA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgQHBhbmVsLmRlc3Ryb3koKVxuICAgICAgQGRldGFjaFJlc2l6ZUV2ZW50cygpXG4gICAgICBAY2xvc2VCdG4uaGlkZSgpXG4gICAgICBAaGlkZUJ0bi5oaWRlKClcbiAgICAgIEBtYXhpbWl6ZUJ0bi5oaWRlKClcbiAgICAgIEB4dGVybS5jc3MgXCJoZWlnaHRcIiwgXCJcIlxuICAgICAgQHRhYlZpZXcgPSB0cnVlXG4gICAgICBsYXN0T3BlbmVkVmlldyA9IG51bGwgaWYgbGFzdE9wZW5lZFZpZXcgPT0gdGhpc1xuXG4gIGdldFRpdGxlOiAtPlxuICAgIEBzdGF0dXNJY29uLmdldE5hbWUoKSBvciBcInBsYXRmb3JtaW8taWRlLXRlcm1pbmFsXCJcblxuICBnZXRJY29uTmFtZTogLT5cbiAgICBcInRlcm1pbmFsXCJcblxuICBnZXRTaGVsbDogLT5cbiAgICByZXR1cm4gcGF0aC5iYXNlbmFtZSBAc2hlbGxcblxuICBnZXRTaGVsbFBhdGg6IC0+XG4gICAgcmV0dXJuIEBzaGVsbFxuXG4gIGVtaXQ6IChldmVudCwgZGF0YSkgLT5cbiAgICBAZW1pdHRlci5lbWl0IGV2ZW50LCBkYXRhXG5cbiAgb25EaWRDaGFuZ2VUaXRsZTogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtY2hhbmdlLXRpdGxlJywgY2FsbGJhY2tcblxuICBnZXRQYXRoOiAtPlxuICAgIHJldHVybiBAZ2V0VGVybWluYWxUaXRsZSgpXG5cbiAgZ2V0VGVybWluYWxUaXRsZTogLT5cbiAgICByZXR1cm4gQHRpdGxlIG9yIEBwcm9jZXNzXG5cbiAgZ2V0VGVybWluYWw6IC0+XG4gICAgcmV0dXJuIEB0ZXJtaW5hbFxuXG4gIGlzQW5pbWF0aW5nOiAtPlxuICAgIHJldHVybiBAYW5pbWF0aW5nXG4iXX0=
