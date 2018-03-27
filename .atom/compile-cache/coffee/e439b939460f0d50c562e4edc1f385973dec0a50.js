(function() {
  var $, CompositeDisposable, Emitter, InputDialog, Pty, Task, Terminal, TerminalPlusView, View, lastActiveElement, lastOpenedView, os, path, ref, ref1,
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

  module.exports = TerminalPlusView = (function(superClass) {
    extend(TerminalPlusView, superClass);

    function TerminalPlusView() {
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
      return TerminalPlusView.__super__.constructor.apply(this, arguments);
    }

    TerminalPlusView.prototype.animating = false;

    TerminalPlusView.prototype.id = '';

    TerminalPlusView.prototype.maximized = false;

    TerminalPlusView.prototype.opened = false;

    TerminalPlusView.prototype.pwd = '';

    TerminalPlusView.prototype.windowHeight = $(window).height();

    TerminalPlusView.prototype.rowHeight = 20;

    TerminalPlusView.prototype.shell = '';

    TerminalPlusView.prototype.tabView = false;

    TerminalPlusView.content = function() {
      return this.div({
        "class": 'terminal-plus terminal-view',
        outlet: 'terminalPlusView'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-divider',
            outlet: 'panelDivider'
          });
          _this.div({
            "class": 'btn-toolbar',
            outlet: 'toolbar'
          }, function() {
            _this.button({
              outlet: 'closeBtn',
              "class": 'btn inline-block-tight right',
              click: 'destroy'
            }, function() {
              return _this.span({
                "class": 'icon icon-x'
              });
            });
            _this.button({
              outlet: 'hideBtn',
              "class": 'btn inline-block-tight right',
              click: 'hide'
            }, function() {
              return _this.span({
                "class": 'icon icon-chevron-down'
              });
            });
            _this.button({
              outlet: 'maximizeBtn',
              "class": 'btn inline-block-tight right',
              click: 'maximize'
            }, function() {
              return _this.span({
                "class": 'icon icon-screen-full'
              });
            });
            return _this.button({
              outlet: 'inputBtn',
              "class": 'btn inline-block-tight left',
              click: 'inputDialog'
            }, function() {
              return _this.span({
                "class": 'icon icon-keyboard'
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

    TerminalPlusView.getFocusedTerminal = function() {
      return Terminal.Terminal.focus;
    };

    TerminalPlusView.prototype.initialize = function(id, pwd, statusIcon, statusBar, shell, args) {
      var bottomHeight, override, percent;
      this.id = id;
      this.pwd = pwd;
      this.statusIcon = statusIcon;
      this.statusBar = statusBar;
      this.shell = shell;
      this.args = args != null ? args : [];
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
      this.prevHeight = atom.config.get('terminal-plus.style.defaultPanelHeight');
      if (this.prevHeight.indexOf('%') > 0) {
        percent = Math.abs(Math.min(parseFloat(this.prevHeight) / 100.0, 1));
        bottomHeight = $('atom-panel.bottom').children(".terminal-view").height() || 0;
        this.prevHeight = percent * ($('.item-views').height() + bottomHeight);
      }
      this.xterm.height(0);
      this.setAnimationSpeed();
      this.subscriptions.add(atom.config.onDidChange('terminal-plus.style.animationSpeed', this.setAnimationSpeed));
      override = function(event) {
        if (event.originalEvent.dataTransfer.getData('terminal-plus') === 'true') {
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
      return this.subscriptions.add({
        dispose: (function(_this) {
          return function() {
            return _this.off('focus', _this.focus);
          };
        })(this)
      });
    };

    TerminalPlusView.prototype.attach = function() {
      if (this.panel != null) {
        return;
      }
      return this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
    };

    TerminalPlusView.prototype.setAnimationSpeed = function() {
      this.animationSpeed = atom.config.get('terminal-plus.style.animationSpeed');
      if (this.animationSpeed === 0) {
        this.animationSpeed = 100;
      }
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    TerminalPlusView.prototype.recieveItemOrFile = function(event) {
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

    TerminalPlusView.prototype.forkPtyProcess = function() {
      return Task.once(Pty, path.resolve(this.pwd), this.shell, this.args, (function(_this) {
        return function() {
          _this.input = function() {};
          return _this.resize = function() {};
        };
      })(this));
    };

    TerminalPlusView.prototype.getId = function() {
      return this.id;
    };

    TerminalPlusView.prototype.displayTerminal = function() {
      var cols, ref2, rows;
      ref2 = this.getDimensions(), cols = ref2.cols, rows = ref2.rows;
      this.ptyProcess = this.forkPtyProcess();
      this.terminal = new Terminal({
        cursorBlink: false,
        scrollback: atom.config.get('terminal-plus.core.scrollback'),
        cols: cols,
        rows: rows
      });
      this.attachListeners();
      this.attachResizeEvents();
      this.attachWindowEvents();
      return this.terminal.open(this.xterm.get(0));
    };

    TerminalPlusView.prototype.attachListeners = function() {
      this.ptyProcess.on("terminal-plus:data", (function(_this) {
        return function(data) {
          return _this.terminal.write(data);
        };
      })(this));
      this.ptyProcess.on("terminal-plus:exit", (function(_this) {
        return function() {
          if (atom.config.get('terminal-plus.toggles.autoClose')) {
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
      this.ptyProcess.on("terminal-plus:title", (function(_this) {
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
          var autoRunCommand;
          _this.applyStyle();
          _this.resizeTerminalToView();
          if (_this.ptyProcess.childProcess == null) {
            return;
          }
          autoRunCommand = atom.config.get('terminal-plus.core.autoRunCommand');
          if (autoRunCommand) {
            return _this.input("" + autoRunCommand + os.EOL);
          }
        };
      })(this));
    };

    TerminalPlusView.prototype.destroy = function() {
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

    TerminalPlusView.prototype.maximize = function() {
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

    TerminalPlusView.prototype.open = function() {
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
            return _this.xterm.height(_this.prevHeight);
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

    TerminalPlusView.prototype.hide = function() {
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

    TerminalPlusView.prototype.toggle = function() {
      if (this.animating) {
        return;
      }
      if (this.panel.isVisible()) {
        return this.hide();
      } else {
        return this.open();
      }
    };

    TerminalPlusView.prototype.input = function(data) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      this.terminal.stopScrolling();
      return this.ptyProcess.send({
        event: 'input',
        text: data
      });
    };

    TerminalPlusView.prototype.resize = function(cols, rows) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      return this.ptyProcess.send({
        event: 'resize',
        rows: rows,
        cols: cols
      });
    };

    TerminalPlusView.prototype.applyStyle = function() {
      var config, defaultFont, editorFont, editorFontSize, overrideFont, overrideFontSize, ref2, ref3;
      config = atom.config.get('terminal-plus');
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
      this.subscriptions.add(atom.config.onDidChange('terminal-plus.style.fontFamily', (function(_this) {
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
      this.subscriptions.add(atom.config.onDidChange('terminal-plus.style.fontSize', (function(_this) {
        return function(event) {
          overrideFontSize = event.newValue;
          _this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
          return _this.resizeTerminalToView();
        };
      })(this)));
      [].splice.apply(this.terminal.colors, [0, 8].concat(ref2 = [config.ansiColors.normal.black.toHexString(), config.ansiColors.normal.red.toHexString(), config.ansiColors.normal.green.toHexString(), config.ansiColors.normal.yellow.toHexString(), config.ansiColors.normal.blue.toHexString(), config.ansiColors.normal.magenta.toHexString(), config.ansiColors.normal.cyan.toHexString(), config.ansiColors.normal.white.toHexString()])), ref2;
      return ([].splice.apply(this.terminal.colors, [8, 8].concat(ref3 = [config.ansiColors.zBright.brightBlack.toHexString(), config.ansiColors.zBright.brightRed.toHexString(), config.ansiColors.zBright.brightGreen.toHexString(), config.ansiColors.zBright.brightYellow.toHexString(), config.ansiColors.zBright.brightBlue.toHexString(), config.ansiColors.zBright.brightMagenta.toHexString(), config.ansiColors.zBright.brightCyan.toHexString(), config.ansiColors.zBright.brightWhite.toHexString()])), ref3);
    };

    TerminalPlusView.prototype.attachWindowEvents = function() {
      return $(window).on('resize', this.onWindowResize);
    };

    TerminalPlusView.prototype.detachWindowEvents = function() {
      return $(window).off('resize', this.onWindowResize);
    };

    TerminalPlusView.prototype.attachResizeEvents = function() {
      return this.panelDivider.on('mousedown', this.resizeStarted);
    };

    TerminalPlusView.prototype.detachResizeEvents = function() {
      return this.panelDivider.off('mousedown');
    };

    TerminalPlusView.prototype.onWindowResize = function() {
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

    TerminalPlusView.prototype.resizeStarted = function() {
      if (this.maximized) {
        return;
      }
      this.maxHeight = this.prevHeight + $('.item-views').height();
      $(document).on('mousemove', this.resizePanel);
      $(document).on('mouseup', this.resizeStopped);
      return this.xterm.css('transition', '');
    };

    TerminalPlusView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizePanel);
      $(document).off('mouseup', this.resizeStopped);
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    TerminalPlusView.prototype.nearestRow = function(value) {
      var rows;
      rows = Math.floor(value / this.rowHeight);
      return rows * this.rowHeight;
    };

    TerminalPlusView.prototype.resizePanel = function(event) {
      var clamped, delta, mouseY;
      if (event.which !== 1) {
        return this.resizeStopped();
      }
      mouseY = $(window).height() - event.pageY;
      delta = mouseY - $('atom-panel-container.bottom').height();
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

    TerminalPlusView.prototype.adjustHeight = function(height) {
      this.xterm.height(height);
      return $(this.terminal.element).height(height);
    };

    TerminalPlusView.prototype.copy = function() {
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

    TerminalPlusView.prototype.paste = function() {
      return this.input(atom.clipboard.read());
    };

    TerminalPlusView.prototype.insertSelection = function() {
      var cursor, editor, line, runCommand, selection;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      runCommand = atom.config.get('terminal-plus.toggles.runInsertedText');
      if (selection = editor.getSelectedText()) {
        this.terminal.stopScrolling();
        return this.input("" + selection + (runCommand ? os.EOL : ''));
      } else if (cursor = editor.getCursorBufferPosition()) {
        line = editor.lineTextForBufferRow(cursor.row);
        this.terminal.stopScrolling();
        this.input("" + line + (runCommand ? os.EOL : ''));
        return editor.moveDown(1);
      }
    };

    TerminalPlusView.prototype.focus = function() {
      this.resizeTerminalToView();
      this.focusTerminal();
      this.statusBar.setActiveTerminalView(this);
      return TerminalPlusView.__super__.focus.call(this);
    };

    TerminalPlusView.prototype.blur = function() {
      this.blurTerminal();
      return TerminalPlusView.__super__.blur.call(this);
    };

    TerminalPlusView.prototype.focusTerminal = function() {
      if (!this.terminal) {
        return;
      }
      this.terminal.focus();
      if (this.terminal._textarea) {
        return this.terminal._textarea.focus();
      } else {
        return this.terminal.element.focus();
      }
    };

    TerminalPlusView.prototype.blurTerminal = function() {
      if (!this.terminal) {
        return;
      }
      this.terminal.blur();
      return this.terminal.element.blur();
    };

    TerminalPlusView.prototype.resizeTerminalToView = function() {
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

    TerminalPlusView.prototype.getDimensions = function() {
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

    TerminalPlusView.prototype.onTransitionEnd = function(callback) {
      return this.xterm.one('webkitTransitionEnd', (function(_this) {
        return function() {
          callback();
          return _this.animating = false;
        };
      })(this));
    };

    TerminalPlusView.prototype.inputDialog = function() {
      var dialog;
      if (InputDialog == null) {
        InputDialog = require('./input-dialog');
      }
      dialog = new InputDialog(this);
      return dialog.attach();
    };

    TerminalPlusView.prototype.rename = function() {
      return this.statusIcon.rename();
    };

    TerminalPlusView.prototype.toggleTabView = function() {
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

    TerminalPlusView.prototype.getTitle = function() {
      return this.statusIcon.getName() || "Terminal-Plus";
    };

    TerminalPlusView.prototype.getIconName = function() {
      return "terminal";
    };

    TerminalPlusView.prototype.getShell = function() {
      return path.basename(this.shell);
    };

    TerminalPlusView.prototype.getShellPath = function() {
      return this.shell;
    };

    TerminalPlusView.prototype.emit = function(event, data) {
      return this.emitter.emit(event, data);
    };

    TerminalPlusView.prototype.onDidChangeTitle = function(callback) {
      return this.emitter.on('did-change-title', callback);
    };

    TerminalPlusView.prototype.getPath = function() {
      return this.getTerminalTitle();
    };

    TerminalPlusView.prototype.getTerminalTitle = function() {
      return this.title || this.process;
    };

    TerminalPlusView.prototype.getTerminal = function() {
      return this.terminal;
    };

    TerminalPlusView.prototype.isAnimating = function() {
      return this.animating;
    };

    return TerminalPlusView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmFsLXBsdXMvbGliL3ZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpSkFBQTtJQUFBOzs7O0VBQUEsTUFBdUMsT0FBQSxDQUFRLE1BQVIsQ0FBdkMsRUFBQyxlQUFELEVBQU8sNkNBQVAsRUFBNEI7O0VBQzVCLE9BQVksT0FBQSxDQUFRLHNCQUFSLENBQVosRUFBQyxVQUFELEVBQUk7O0VBRUosR0FBQSxHQUFNLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFdBQWhCOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsU0FBUjs7RUFDWCxXQUFBLEdBQWM7O0VBRWQsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFFTCxjQUFBLEdBQWlCOztFQUNqQixpQkFBQSxHQUFvQjs7RUFFcEIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsrQkFDSixTQUFBLEdBQVc7OytCQUNYLEVBQUEsR0FBSTs7K0JBQ0osU0FBQSxHQUFXOzsrQkFDWCxNQUFBLEdBQVE7OytCQUNSLEdBQUEsR0FBSzs7K0JBQ0wsWUFBQSxHQUFjLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQUE7OytCQUNkLFNBQUEsR0FBVzs7K0JBQ1gsS0FBQSxHQUFPOzsrQkFDUCxPQUFBLEdBQVM7O0lBRVQsZ0JBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLDZCQUFQO1FBQXNDLE1BQUEsRUFBUSxrQkFBOUM7T0FBTCxFQUF1RSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDckUsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sZUFBUDtZQUF3QixNQUFBLEVBQVEsY0FBaEM7V0FBTDtVQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGFBQVA7WUFBc0IsTUFBQSxFQUFPLFNBQTdCO1dBQUwsRUFBNkMsU0FBQTtZQUMzQyxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsTUFBQSxFQUFRLFVBQVI7Y0FBb0IsQ0FBQSxLQUFBLENBQUEsRUFBTyw4QkFBM0I7Y0FBMkQsS0FBQSxFQUFPLFNBQWxFO2FBQVIsRUFBcUYsU0FBQTtxQkFDbkYsS0FBQyxDQUFBLElBQUQsQ0FBTTtnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGFBQVA7ZUFBTjtZQURtRixDQUFyRjtZQUVBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxNQUFBLEVBQVEsU0FBUjtjQUFtQixDQUFBLEtBQUEsQ0FBQSxFQUFPLDhCQUExQjtjQUEwRCxLQUFBLEVBQU8sTUFBakU7YUFBUixFQUFpRixTQUFBO3FCQUMvRSxLQUFDLENBQUEsSUFBRCxDQUFNO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sd0JBQVA7ZUFBTjtZQUQrRSxDQUFqRjtZQUVBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxNQUFBLEVBQVEsYUFBUjtjQUF1QixDQUFBLEtBQUEsQ0FBQSxFQUFPLDhCQUE5QjtjQUE4RCxLQUFBLEVBQU8sVUFBckU7YUFBUixFQUF5RixTQUFBO3FCQUN2RixLQUFDLENBQUEsSUFBRCxDQUFNO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sdUJBQVA7ZUFBTjtZQUR1RixDQUF6RjttQkFFQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsTUFBQSxFQUFRLFVBQVI7Y0FBb0IsQ0FBQSxLQUFBLENBQUEsRUFBTyw2QkFBM0I7Y0FBMEQsS0FBQSxFQUFPLGFBQWpFO2FBQVIsRUFBd0YsU0FBQTtxQkFDdEYsS0FBQyxDQUFBLElBQUQsQ0FBTTtnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG9CQUFQO2VBQU47WUFEc0YsQ0FBeEY7VUFQMkMsQ0FBN0M7aUJBU0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sT0FBUDtZQUFnQixNQUFBLEVBQVEsT0FBeEI7V0FBTDtRQVhxRTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkU7SUFEUTs7SUFjVixnQkFBQyxDQUFBLGtCQUFELEdBQXFCLFNBQUE7QUFDbkIsYUFBTyxRQUFRLENBQUMsUUFBUSxDQUFDO0lBRE47OytCQUdyQixVQUFBLEdBQVksU0FBQyxFQUFELEVBQU0sR0FBTixFQUFZLFVBQVosRUFBeUIsU0FBekIsRUFBcUMsS0FBckMsRUFBNkMsSUFBN0M7QUFDVixVQUFBO01BRFcsSUFBQyxDQUFBLEtBQUQ7TUFBSyxJQUFDLENBQUEsTUFBRDtNQUFNLElBQUMsQ0FBQSxhQUFEO01BQWEsSUFBQyxDQUFBLFlBQUQ7TUFBWSxJQUFDLENBQUEsUUFBRDtNQUFRLElBQUMsQ0FBQSxzQkFBRCxPQUFNO01BQzdELElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BRWYsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsUUFBbkIsRUFDakI7UUFBQSxLQUFBLEVBQU8sT0FBUDtPQURpQixDQUFuQjtNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLE9BQW5CLEVBQ2pCO1FBQUEsS0FBQSxFQUFPLE1BQVA7T0FEaUIsQ0FBbkI7TUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLEdBQXVCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsV0FBbkIsRUFDeEM7UUFBQSxLQUFBLEVBQU8sWUFBUDtPQUR3QyxDQUExQztNQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixHQUFvQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFFBQW5CLEVBQ2xCO1FBQUEsS0FBQSxFQUFPLGFBQVA7T0FEa0I7TUFHcEIsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhCO01BQ2QsSUFBRyxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBb0IsR0FBcEIsQ0FBQSxHQUEyQixDQUE5QjtRQUNFLE9BQUEsR0FBVSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsVUFBQSxDQUFXLElBQUMsQ0FBQSxVQUFaLENBQUEsR0FBMEIsS0FBbkMsRUFBMEMsQ0FBMUMsQ0FBVDtRQUNWLFlBQUEsR0FBZSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxRQUF2QixDQUFnQyxnQkFBaEMsQ0FBaUQsQ0FBQyxNQUFsRCxDQUFBLENBQUEsSUFBOEQ7UUFDN0UsSUFBQyxDQUFBLFVBQUQsR0FBYyxPQUFBLEdBQVUsQ0FBQyxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLE1BQWpCLENBQUEsQ0FBQSxHQUE0QixZQUE3QixFQUgxQjs7TUFJQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxDQUFkO01BRUEsSUFBQyxDQUFBLGlCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLG9DQUF4QixFQUE4RCxJQUFDLENBQUEsaUJBQS9ELENBQW5CO01BRUEsUUFBQSxHQUFXLFNBQUMsS0FBRDtRQUNULElBQVUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBakMsQ0FBeUMsZUFBekMsQ0FBQSxLQUE2RCxNQUF2RTtBQUFBLGlCQUFBOztRQUNBLEtBQUssQ0FBQyxjQUFOLENBQUE7ZUFDQSxLQUFLLENBQUMsZUFBTixDQUFBO01BSFM7TUFLWCxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxTQUFWLEVBQXFCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO0FBQ25CLGNBQUE7VUFBQSxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsQ0FBbEI7WUFDRSxJQUFBLEdBQU8sTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFxQixDQUFDLFFBQXRCLENBQUE7WUFDUCxJQUFBLENBQU8sSUFBUDtxQkFDRSxLQUFDLENBQUEsS0FBRCxDQUFBLEVBREY7YUFGRjs7UUFEbUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCO01BS0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsV0FBVixFQUF1QixRQUF2QjtNQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFVBQVYsRUFBc0IsUUFBdEI7TUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxNQUFWLEVBQWtCLElBQUMsQ0FBQSxpQkFBbkI7TUFFQSxJQUFDLENBQUEsRUFBRCxDQUFJLE9BQUosRUFBYSxJQUFDLENBQUEsS0FBZDthQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQjtRQUFBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUMxQixLQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsRUFBYyxLQUFDLENBQUEsS0FBZjtVQUQwQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtPQUFuQjtJQXRDVTs7K0JBeUNaLE1BQUEsR0FBUSxTQUFBO01BQ04sSUFBVSxrQkFBVjtBQUFBLGVBQUE7O2FBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWYsQ0FBOEI7UUFBQSxJQUFBLEVBQU0sSUFBTjtRQUFZLE9BQUEsRUFBUyxLQUFyQjtPQUE5QjtJQUZIOzsrQkFJUixpQkFBQSxHQUFtQixTQUFBO01BQ2pCLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQ0FBaEI7TUFDbEIsSUFBeUIsSUFBQyxDQUFBLGNBQUQsS0FBbUIsQ0FBNUM7UUFBQSxJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFsQjs7YUFFQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLEVBQXlCLFNBQUEsR0FBUyxDQUFDLElBQUEsR0FBTyxJQUFDLENBQUEsY0FBVCxDQUFULEdBQWlDLFVBQTFEO0lBSmlCOzsrQkFNbkIsaUJBQUEsR0FBbUIsU0FBQyxLQUFEO0FBQ2pCLFVBQUE7TUFBQSxLQUFLLENBQUMsY0FBTixDQUFBO01BQ0EsS0FBSyxDQUFDLGVBQU4sQ0FBQTtNQUNDLGVBQWdCLEtBQUssQ0FBQztNQUV2QixJQUFHLFlBQVksQ0FBQyxPQUFiLENBQXFCLFlBQXJCLENBQUEsS0FBc0MsTUFBekM7UUFDRSxRQUFBLEdBQVcsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsWUFBckI7UUFDWCxJQUF5QixRQUF6QjtpQkFBQSxJQUFDLENBQUEsS0FBRCxDQUFVLFFBQUQsR0FBVSxHQUFuQixFQUFBO1NBRkY7T0FBQSxNQUdLLElBQUcsUUFBQSxHQUFXLFlBQVksQ0FBQyxPQUFiLENBQXFCLGFBQXJCLENBQWQ7ZUFDSCxJQUFDLENBQUEsS0FBRCxDQUFVLFFBQUQsR0FBVSxHQUFuQixFQURHO09BQUEsTUFFQSxJQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBbkIsR0FBNEIsQ0FBL0I7QUFDSDtBQUFBO2FBQUEsc0NBQUE7O3VCQUNFLElBQUMsQ0FBQSxLQUFELENBQVUsSUFBSSxDQUFDLElBQU4sR0FBVyxHQUFwQjtBQURGO3VCQURHOztJQVZZOzsrQkFjbkIsY0FBQSxHQUFnQixTQUFBO2FBQ2QsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLEVBQWUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFDLENBQUEsR0FBZCxDQUFmLEVBQW1DLElBQUMsQ0FBQSxLQUFwQyxFQUEyQyxJQUFDLENBQUEsSUFBNUMsRUFBa0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ2hELEtBQUMsQ0FBQSxLQUFELEdBQVMsU0FBQSxHQUFBO2lCQUNULEtBQUMsQ0FBQSxNQUFELEdBQVUsU0FBQSxHQUFBO1FBRnNDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsRDtJQURjOzsrQkFLaEIsS0FBQSxHQUFPLFNBQUE7QUFDTCxhQUFPLElBQUMsQ0FBQTtJQURIOzsrQkFHUCxlQUFBLEdBQWlCLFNBQUE7QUFDZixVQUFBO01BQUEsT0FBZSxJQUFDLENBQUEsYUFBRCxDQUFBLENBQWYsRUFBQyxnQkFBRCxFQUFPO01BQ1AsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsY0FBRCxDQUFBO01BRWQsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxRQUFBLENBQVM7UUFDdkIsV0FBQSxFQUFrQixLQURLO1FBRXZCLFVBQUEsRUFBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLCtCQUFoQixDQUZLO1FBR3ZCLE1BQUEsSUFIdUI7UUFHakIsTUFBQSxJQUhpQjtPQUFUO01BTWhCLElBQUMsQ0FBQSxlQUFELENBQUE7TUFDQSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxrQkFBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsQ0FBWCxDQUFmO0lBYmU7OytCQWVqQixlQUFBLEdBQWlCLFNBQUE7TUFDZixJQUFDLENBQUEsVUFBVSxDQUFDLEVBQVosQ0FBZSxvQkFBZixFQUFxQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtpQkFDbkMsS0FBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQWdCLElBQWhCO1FBRG1DO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQztNQUdBLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBWixDQUFlLG9CQUFmLEVBQXFDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNuQyxJQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQ0FBaEIsQ0FBZDttQkFBQSxLQUFDLENBQUEsT0FBRCxDQUFBLEVBQUE7O1FBRG1DO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQztNQUdBLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixHQUFnQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQUVoQixJQUFDLENBQUEsUUFBUSxDQUFDLEVBQVYsQ0FBYSxNQUFiLEVBQXFCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO2lCQUNuQixLQUFDLENBQUEsS0FBRCxDQUFPLElBQVA7UUFEbUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCO01BR0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxFQUFaLENBQWUscUJBQWYsRUFBc0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7aUJBQ3BDLEtBQUMsQ0FBQSxPQUFELEdBQVc7UUFEeUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRDO01BRUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxFQUFWLENBQWEsT0FBYixFQUFzQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtpQkFDcEIsS0FBQyxDQUFBLEtBQUQsR0FBUztRQURXO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjthQUdBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLE1BQWYsRUFBdUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ3JCLGNBQUE7VUFBQSxLQUFDLENBQUEsVUFBRCxDQUFBO1VBQ0EsS0FBQyxDQUFBLG9CQUFELENBQUE7VUFFQSxJQUFjLHFDQUFkO0FBQUEsbUJBQUE7O1VBQ0EsY0FBQSxHQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUNBQWhCO1VBQ2pCLElBQXVDLGNBQXZDO21CQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sRUFBQSxHQUFHLGNBQUgsR0FBb0IsRUFBRSxDQUFDLEdBQTlCLEVBQUE7O1FBTnFCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QjtJQWpCZTs7K0JBeUJqQixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtNQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBO01BQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxrQkFBWCxDQUE4QixJQUE5QjtNQUNBLElBQUMsQ0FBQSxrQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLGtCQUFELENBQUE7TUFFQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFBLENBQUg7UUFDRSxJQUFDLENBQUEsSUFBRCxDQUFBO1FBQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQixFQUZGO09BQUEsTUFBQTtRQUlFLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBLEVBSkY7O01BTUEsSUFBRyxJQUFDLENBQUEsVUFBRCxJQUFnQixJQUFDLENBQUEsVUFBVSxDQUFDLFVBQS9CO1FBQ0UsSUFBQyxDQUFBLFVBQVUsQ0FBQyxVQUFVLENBQUMsV0FBdkIsQ0FBbUMsSUFBQyxDQUFBLFVBQXBDLEVBREY7OztZQUdXLENBQUUsU0FBYixDQUFBOztrREFDUyxDQUFFLE9BQVgsQ0FBQTtJQWpCTzs7K0JBbUJULFFBQUEsR0FBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFzQixJQUFDLENBQUEsV0FBVyxDQUFDLE9BQW5DO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBckIsQ0FBQTtNQUVBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLFVBQUQsR0FBYyxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLE1BQWpCLENBQUE7TUFDM0IsR0FBQSxHQUFNLElBQUMsQ0FBQSxXQUFXLENBQUMsUUFBYixDQUFzQixNQUF0QjtNQUNOLElBQUMsQ0FBQSxlQUFELENBQWlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsS0FBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO01BRUEsSUFBRyxJQUFDLENBQUEsU0FBSjtRQUNFLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixHQUF1QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFdBQW5CLEVBQ3JCO1VBQUEsS0FBQSxFQUFPLFlBQVA7U0FEcUI7UUFFdkIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBaEM7UUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxVQUFmO1FBQ0EsR0FBRyxDQUFDLFdBQUosQ0FBZ0Isb0JBQWhCLENBQXFDLENBQUMsUUFBdEMsQ0FBK0Msa0JBQS9DO2VBQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxNQU5mO09BQUEsTUFBQTtRQVFFLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixHQUF1QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFdBQW5CLEVBQ3JCO1VBQUEsS0FBQSxFQUFPLFFBQVA7U0FEcUI7UUFFdkIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBaEM7UUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxTQUFmO1FBQ0EsR0FBRyxDQUFDLFdBQUosQ0FBZ0Isa0JBQWhCLENBQW1DLENBQUMsUUFBcEMsQ0FBNkMsb0JBQTdDO2VBQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxLQWJmOztJQVJROzsrQkF1QlYsSUFBQSxHQUFNLFNBQUE7QUFDSixVQUFBOztRQUFBLG9CQUFxQixDQUFBLENBQUUsUUFBUSxDQUFDLGFBQVg7O01BRXJCLElBQUcsY0FBQSxJQUFtQixjQUFBLEtBQWtCLElBQXhDO1FBQ0UsSUFBRyxjQUFjLENBQUMsU0FBbEI7VUFDRSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFuQztVQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQXJCLENBQUE7VUFDQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFdBQVcsQ0FBQyxRQUFiLENBQXNCLE1BQXRCO1VBRVAsSUFBQyxDQUFBLFNBQUQsR0FBYSxjQUFjLENBQUM7VUFDNUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLEdBQXVCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsV0FBbkIsRUFDckI7WUFBQSxLQUFBLEVBQU8sUUFBUDtXQURxQjtVQUV2QixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFoQztVQUNBLElBQUksQ0FBQyxXQUFMLENBQWlCLGtCQUFqQixDQUFvQyxDQUFDLFFBQXJDLENBQThDLG9CQUE5QztVQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsS0FWZjs7UUFXQSxjQUFjLENBQUMsSUFBZixDQUFBLEVBWkY7O01BY0EsY0FBQSxHQUFpQjtNQUNqQixJQUFDLENBQUEsU0FBUyxDQUFDLHFCQUFYLENBQWlDLElBQWpDO01BQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQUE7TUFFQSxJQUFDLENBQUEsZUFBRCxDQUFpQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDZixJQUFHLENBQUksS0FBQyxDQUFBLE1BQVI7WUFDRSxLQUFDLENBQUEsTUFBRCxHQUFVO1lBQ1YsS0FBQyxDQUFBLGVBQUQsQ0FBQTtZQUNBLEtBQUMsQ0FBQSxVQUFELEdBQWMsS0FBQyxDQUFBLFVBQUQsQ0FBWSxLQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQUFaO21CQUNkLEtBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLEtBQUMsQ0FBQSxVQUFmLEVBSkY7V0FBQSxNQUFBO21CQU1FLEtBQUMsQ0FBQSxLQUFELENBQUEsRUFORjs7UUFEZTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakI7TUFTQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTtNQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLENBQWQ7TUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhO2FBQ2IsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWlCLElBQUMsQ0FBQSxTQUFKLEdBQW1CLElBQUMsQ0FBQSxTQUFwQixHQUFtQyxJQUFDLENBQUEsVUFBbEQ7SUFqQ0k7OytCQW1DTixJQUFBLEdBQU0sU0FBQTtBQUNKLFVBQUE7O1lBQVMsQ0FBRSxJQUFYLENBQUE7O01BQ0EsY0FBQSxHQUFpQjtNQUNqQixJQUFDLENBQUEsVUFBVSxDQUFDLFVBQVosQ0FBQTtNQUVBLElBQUMsQ0FBQSxlQUFELENBQWlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNmLEtBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBO1VBQ0EsSUFBTyxzQkFBUDtZQUNFLElBQUcseUJBQUg7Y0FDRSxpQkFBaUIsQ0FBQyxLQUFsQixDQUFBO3FCQUNBLGlCQUFBLEdBQW9CLEtBRnRCO2FBREY7O1FBRmU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO01BT0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWlCLElBQUMsQ0FBQSxTQUFKLEdBQW1CLElBQUMsQ0FBQSxTQUFwQixHQUFtQyxJQUFDLENBQUEsVUFBbEQ7TUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhO2FBQ2IsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsQ0FBZDtJQWRJOzsrQkFnQk4sTUFBQSxHQUFRLFNBQUE7TUFDTixJQUFVLElBQUMsQ0FBQSxTQUFYO0FBQUEsZUFBQTs7TUFFQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFBLENBQUg7ZUFDRSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLElBQUQsQ0FBQSxFQUhGOztJQUhNOzsrQkFRUixLQUFBLEdBQU8sU0FBQyxJQUFEO01BQ0wsSUFBYyxvQ0FBZDtBQUFBLGVBQUE7O01BRUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxhQUFWLENBQUE7YUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUI7UUFBQSxLQUFBLEVBQU8sT0FBUDtRQUFnQixJQUFBLEVBQU0sSUFBdEI7T0FBakI7SUFKSzs7K0JBTVAsTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLElBQVA7TUFDTixJQUFjLG9DQUFkO0FBQUEsZUFBQTs7YUFFQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUI7UUFBQyxLQUFBLEVBQU8sUUFBUjtRQUFrQixNQUFBLElBQWxCO1FBQXdCLE1BQUEsSUFBeEI7T0FBakI7SUFITTs7K0JBS1IsVUFBQSxHQUFZLFNBQUE7QUFDVixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixlQUFoQjtNQUVULElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUCxDQUFnQixNQUFNLENBQUMsS0FBSyxDQUFDLEtBQTdCO01BQ0EsSUFBa0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFqRDtRQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUCxDQUFnQixjQUFoQixFQUFBOztNQUVBLFVBQUEsR0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUJBQWhCO01BQ2IsV0FBQSxHQUFjO01BQ2QsWUFBQSxHQUFlLE1BQU0sQ0FBQyxLQUFLLENBQUM7TUFDNUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQXhCLEdBQXFDLFlBQUEsSUFBZ0IsVUFBaEIsSUFBOEI7TUFFbkUsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixtQkFBeEIsRUFBNkMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7VUFDOUQsVUFBQSxHQUFhLEtBQUssQ0FBQztpQkFDbkIsS0FBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQXhCLEdBQXFDLFlBQUEsSUFBZ0IsVUFBaEIsSUFBOEI7UUFGTDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0MsQ0FBbkI7TUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLGdDQUF4QixFQUEwRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtVQUMzRSxZQUFBLEdBQWUsS0FBSyxDQUFDO2lCQUNyQixLQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBeEIsR0FBcUMsWUFBQSxJQUFnQixVQUFoQixJQUE4QjtRQUZRO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExRCxDQUFuQjtNQUlBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlCQUFoQjtNQUNqQixnQkFBQSxHQUFtQixNQUFNLENBQUMsS0FBSyxDQUFDO01BQ2hDLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUF4QixHQUFxQyxDQUFDLGdCQUFBLElBQW9CLGNBQXJCLENBQUEsR0FBb0M7TUFFekUsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixpQkFBeEIsRUFBMkMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7VUFDNUQsY0FBQSxHQUFpQixLQUFLLENBQUM7VUFDdkIsS0FBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQXhCLEdBQXFDLENBQUMsZ0JBQUEsSUFBb0IsY0FBckIsQ0FBQSxHQUFvQztpQkFDekUsS0FBQyxDQUFBLG9CQUFELENBQUE7UUFINEQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNDLENBQW5CO01BSUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3Qiw4QkFBeEIsRUFBd0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7VUFDekUsZ0JBQUEsR0FBbUIsS0FBSyxDQUFDO1VBQ3pCLEtBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUF4QixHQUFxQyxDQUFDLGdCQUFBLElBQW9CLGNBQXJCLENBQUEsR0FBb0M7aUJBQ3pFLEtBQUMsQ0FBQSxvQkFBRCxDQUFBO1FBSHlFO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4RCxDQUFuQjtNQU1BLDJEQUF5QixDQUN2QixNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBL0IsQ0FBQSxDQUR1QixFQUV2QixNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBN0IsQ0FBQSxDQUZ1QixFQUd2QixNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBL0IsQ0FBQSxDQUh1QixFQUl2QixNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBaEMsQ0FBQSxDQUp1QixFQUt2QixNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBOUIsQ0FBQSxDQUx1QixFQU12QixNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBakMsQ0FBQSxDQU51QixFQU92QixNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBOUIsQ0FBQSxDQVB1QixFQVF2QixNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBL0IsQ0FBQSxDQVJ1QixDQUF6QixJQUF5QjthQVd6QixDQUFBLDJEQUEwQixDQUN4QixNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsV0FBdEMsQ0FBQSxDQUR3QixFQUV4QixNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsV0FBcEMsQ0FBQSxDQUZ3QixFQUd4QixNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsV0FBdEMsQ0FBQSxDQUh3QixFQUl4QixNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsV0FBdkMsQ0FBQSxDQUp3QixFQUt4QixNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBckMsQ0FBQSxDQUx3QixFQU14QixNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsV0FBeEMsQ0FBQSxDQU53QixFQU94QixNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBckMsQ0FBQSxDQVB3QixFQVF4QixNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsV0FBdEMsQ0FBQSxDQVJ3QixDQUExQixJQUEwQixJQUExQjtJQTNDVTs7K0JBc0RaLGtCQUFBLEdBQW9CLFNBQUE7YUFDbEIsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEVBQVYsQ0FBYSxRQUFiLEVBQXVCLElBQUMsQ0FBQSxjQUF4QjtJQURrQjs7K0JBR3BCLGtCQUFBLEdBQW9CLFNBQUE7YUFDbEIsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEdBQVYsQ0FBYyxRQUFkLEVBQXdCLElBQUMsQ0FBQSxjQUF6QjtJQURrQjs7K0JBR3BCLGtCQUFBLEdBQW9CLFNBQUE7YUFDbEIsSUFBQyxDQUFBLFlBQVksQ0FBQyxFQUFkLENBQWlCLFdBQWpCLEVBQThCLElBQUMsQ0FBQSxhQUEvQjtJQURrQjs7K0JBR3BCLGtCQUFBLEdBQW9CLFNBQUE7YUFDbEIsSUFBQyxDQUFBLFlBQVksQ0FBQyxHQUFkLENBQWtCLFdBQWxCO0lBRGtCOzsrQkFHcEIsY0FBQSxHQUFnQixTQUFBO0FBQ2QsVUFBQTtNQUFBLElBQUcsQ0FBSSxJQUFDLENBQUEsT0FBUjtRQUNFLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFlBQVgsRUFBeUIsRUFBekI7UUFDQSxTQUFBLEdBQVksQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBQTtRQUNaLFdBQUEsR0FBYyxDQUFBLENBQUUsNkJBQUYsQ0FBZ0MsQ0FBQyxLQUFqQyxDQUFBLENBQXdDLENBQUMsR0FBekMsQ0FBNkMsQ0FBN0M7UUFDZCxRQUFBLEdBQVcsV0FBVyxDQUFDLFlBQVosR0FBMkIsV0FBVyxDQUFDO1FBRWxELEtBQUEsR0FBUSxTQUFBLEdBQVksSUFBQyxDQUFBO1FBQ3JCLElBQUMsQ0FBQSxZQUFELEdBQWdCO1FBRWhCLElBQUcsSUFBQyxDQUFBLFNBQUo7VUFDRSxPQUFBLEdBQVUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsU0FBRCxHQUFhLEtBQXRCLEVBQTZCLElBQUMsQ0FBQSxTQUE5QjtVQUVWLElBQXlCLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFBLENBQXpCO1lBQUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxPQUFkLEVBQUE7O1VBQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYTtVQUViLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsVUFBVixFQUFzQixJQUFDLENBQUEsU0FBdkIsRUFOaEI7U0FBQSxNQU9LLElBQUcsUUFBQSxHQUFXLENBQWQ7VUFDSCxPQUFBLEdBQVUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsVUFBRCxDQUFZLElBQUMsQ0FBQSxVQUFELEdBQWMsS0FBMUIsQ0FBVCxFQUEyQyxJQUFDLENBQUEsU0FBNUM7VUFFVixJQUF5QixJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBQSxDQUF6QjtZQUFBLElBQUMsQ0FBQSxZQUFELENBQWMsT0FBZCxFQUFBOztVQUNBLElBQUMsQ0FBQSxVQUFELEdBQWMsUUFKWDs7UUFNTCxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLEVBQXlCLFNBQUEsR0FBUyxDQUFDLElBQUEsR0FBTyxJQUFDLENBQUEsY0FBVCxDQUFULEdBQWlDLFVBQTFELEVBdEJGOzthQXVCQSxJQUFDLENBQUEsb0JBQUQsQ0FBQTtJQXhCYzs7K0JBMEJoQixhQUFBLEdBQWUsU0FBQTtNQUNiLElBQVUsSUFBQyxDQUFBLFNBQVg7QUFBQSxlQUFBOztNQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLFVBQUQsR0FBYyxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLE1BQWpCLENBQUE7TUFDM0IsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEVBQVosQ0FBZSxXQUFmLEVBQTRCLElBQUMsQ0FBQSxXQUE3QjtNQUNBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsU0FBZixFQUEwQixJQUFDLENBQUEsYUFBM0I7YUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLEVBQXlCLEVBQXpCO0lBTGE7OytCQU9mLGFBQUEsR0FBZSxTQUFBO01BQ2IsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEdBQVosQ0FBZ0IsV0FBaEIsRUFBNkIsSUFBQyxDQUFBLFdBQTlCO01BQ0EsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEdBQVosQ0FBZ0IsU0FBaEIsRUFBMkIsSUFBQyxDQUFBLGFBQTVCO2FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsWUFBWCxFQUF5QixTQUFBLEdBQVMsQ0FBQyxJQUFBLEdBQU8sSUFBQyxDQUFBLGNBQVQsQ0FBVCxHQUFpQyxVQUExRDtJQUhhOzsrQkFLZixVQUFBLEdBQVksU0FBQyxLQUFEO0FBQ1YsVUFBQTtNQUFBLElBQUEsY0FBTyxRQUFTLElBQUMsQ0FBQTtBQUNqQixhQUFPLElBQUEsR0FBTyxJQUFDLENBQUE7SUFGTDs7K0JBSVosV0FBQSxHQUFhLFNBQUMsS0FBRDtBQUNYLFVBQUE7TUFBQSxJQUErQixLQUFLLENBQUMsS0FBTixLQUFlLENBQTlDO0FBQUEsZUFBTyxJQUFDLENBQUEsYUFBRCxDQUFBLEVBQVA7O01BRUEsTUFBQSxHQUFTLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQUEsQ0FBQSxHQUFxQixLQUFLLENBQUM7TUFDcEMsS0FBQSxHQUFRLE1BQUEsR0FBUyxDQUFBLENBQUUsNkJBQUYsQ0FBZ0MsQ0FBQyxNQUFqQyxDQUFBO01BQ2pCLElBQUEsQ0FBQSxDQUFjLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFBLEdBQWtCLENBQUMsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFiLEdBQWlCLENBQWxCLENBQWhDLENBQUE7QUFBQSxlQUFBOztNQUVBLE9BQUEsR0FBVSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUMsQ0FBQSxVQUFELENBQVksSUFBQyxDQUFBLFVBQUQsR0FBYyxLQUExQixDQUFULEVBQTJDLElBQUMsQ0FBQSxTQUE1QztNQUNWLElBQVUsT0FBQSxHQUFVLElBQUMsQ0FBQSxTQUFyQjtBQUFBLGVBQUE7O01BRUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsT0FBZDtNQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVosQ0FBb0IsQ0FBQyxNQUFyQixDQUE0QixPQUE1QjtNQUNBLElBQUMsQ0FBQSxVQUFELEdBQWM7YUFFZCxJQUFDLENBQUEsb0JBQUQsQ0FBQTtJQWRXOzsrQkFnQmIsWUFBQSxHQUFjLFNBQUMsTUFBRDtNQUNaLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLE1BQWQ7YUFDQSxDQUFBLENBQUUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFaLENBQW9CLENBQUMsTUFBckIsQ0FBNEIsTUFBNUI7SUFGWTs7K0JBSWQsSUFBQSxHQUFNLFNBQUE7QUFDSixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQWI7UUFDRSxRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxlQUFWLENBQUE7UUFDWCxJQUFBLEdBQU8sSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLENBQ0wsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFEZixFQUNtQixJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUR2QyxFQUVMLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBUyxDQUFDLEVBRmYsRUFFbUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFGdkMsRUFGVDtPQUFBLE1BQUE7UUFNRSxPQUFBLEdBQVUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsWUFBbEIsQ0FBQSxDQUFnQyxDQUFDLFFBQWpDLENBQUE7UUFDVixRQUFBLEdBQVcsT0FBTyxDQUFDLEtBQVIsQ0FBYyxRQUFkO1FBQ1gsS0FBQSxHQUFRLFFBQVEsQ0FBQyxHQUFULENBQWEsU0FBQyxJQUFEO2lCQUNuQixJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsRUFBb0IsR0FBcEIsQ0FBd0IsQ0FBQyxTQUF6QixDQUFBO1FBRG1CLENBQWI7UUFFUixJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLEVBVlQ7O2FBV0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFmLENBQXFCLElBQXJCO0lBWkk7OytCQWNOLEtBQUEsR0FBTyxTQUFBO2FBQ0wsSUFBQyxDQUFBLEtBQUQsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBQSxDQUFQO0lBREs7OytCQUdQLGVBQUEsR0FBaUIsU0FBQTtBQUNmLFVBQUE7TUFBQSxJQUFBLENBQWMsQ0FBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVQsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsVUFBQSxHQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1Q0FBaEI7TUFFYixJQUFHLFNBQUEsR0FBWSxNQUFNLENBQUMsZUFBUCxDQUFBLENBQWY7UUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLGFBQVYsQ0FBQTtlQUNBLElBQUMsQ0FBQSxLQUFELENBQU8sRUFBQSxHQUFHLFNBQUgsR0FBYyxDQUFJLFVBQUgsR0FBbUIsRUFBRSxDQUFDLEdBQXRCLEdBQStCLEVBQWhDLENBQXJCLEVBRkY7T0FBQSxNQUdLLElBQUcsTUFBQSxHQUFTLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQVo7UUFDSCxJQUFBLEdBQU8sTUFBTSxDQUFDLG9CQUFQLENBQTRCLE1BQU0sQ0FBQyxHQUFuQztRQUNQLElBQUMsQ0FBQSxRQUFRLENBQUMsYUFBVixDQUFBO1FBQ0EsSUFBQyxDQUFBLEtBQUQsQ0FBTyxFQUFBLEdBQUcsSUFBSCxHQUFTLENBQUksVUFBSCxHQUFtQixFQUFFLENBQUMsR0FBdEIsR0FBK0IsRUFBaEMsQ0FBaEI7ZUFDQSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFoQixFQUpHOztJQVBVOzsrQkFhakIsS0FBQSxHQUFPLFNBQUE7TUFDTCxJQUFDLENBQUEsb0JBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxhQUFELENBQUE7TUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLHFCQUFYLENBQWlDLElBQWpDO2FBQ0EsMENBQUE7SUFKSzs7K0JBTVAsSUFBQSxHQUFNLFNBQUE7TUFDSixJQUFDLENBQUEsWUFBRCxDQUFBO2FBQ0EseUNBQUE7SUFGSTs7K0JBSU4sYUFBQSxHQUFlLFNBQUE7TUFDYixJQUFBLENBQWMsSUFBQyxDQUFBLFFBQWY7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUFBO01BQ0EsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQWI7ZUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFwQixDQUFBLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBbEIsQ0FBQSxFQUhGOztJQUphOzsrQkFTZixZQUFBLEdBQWMsU0FBQTtNQUNaLElBQUEsQ0FBYyxJQUFDLENBQUEsUUFBZjtBQUFBLGVBQUE7O01BRUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQUE7YUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFsQixDQUFBO0lBSlk7OytCQU1kLG9CQUFBLEdBQXNCLFNBQUE7QUFDcEIsVUFBQTtNQUFBLElBQUEsQ0FBQSxDQUFjLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFBLENBQUEsSUFBc0IsSUFBQyxDQUFBLE9BQXJDLENBQUE7QUFBQSxlQUFBOztNQUVBLE9BQWUsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFmLEVBQUMsZ0JBQUQsRUFBTztNQUNQLElBQUEsQ0FBQSxDQUFjLElBQUEsR0FBTyxDQUFQLElBQWEsSUFBQSxHQUFPLENBQWxDLENBQUE7QUFBQSxlQUFBOztNQUNBLElBQUEsQ0FBYyxJQUFDLENBQUEsUUFBZjtBQUFBLGVBQUE7O01BQ0EsSUFBVSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsS0FBa0IsSUFBbEIsSUFBMkIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLEtBQWtCLElBQXZEO0FBQUEsZUFBQTs7TUFFQSxJQUFDLENBQUEsTUFBRCxDQUFRLElBQVIsRUFBYyxJQUFkO2FBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLElBQWpCLEVBQXVCLElBQXZCO0lBVG9COzsrQkFXdEIsYUFBQSxHQUFlLFNBQUE7QUFDYixVQUFBO01BQUEsT0FBQSxHQUFVLENBQUEsQ0FBRSxnQ0FBRjtNQUVWLElBQUcsSUFBQyxDQUFBLFFBQUo7UUFDRSxJQUFDLENBQUEsSUFBRCxDQUFNLFdBQU4sQ0FBa0IsQ0FBQyxNQUFuQixDQUEwQixPQUExQjtRQUNBLE9BQUEsR0FBVSxPQUFPLENBQUMsUUFBUixDQUFBLENBQWtCLENBQUMsS0FBbkIsQ0FBQSxDQUEyQixDQUFBLENBQUEsQ0FBRSxDQUFDLHFCQUE5QixDQUFBO1FBQ1YsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUEsQ0FBQSxHQUFpQixDQUFDLE9BQU8sQ0FBQyxLQUFSLElBQWlCLENBQWxCLENBQTVCO1FBQ1AsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FBQSxHQUFrQixDQUFDLE9BQU8sQ0FBQyxNQUFSLElBQWtCLEVBQW5CLENBQTdCO1FBQ1AsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFPLENBQUM7UUFDckIsT0FBTyxDQUFDLE1BQVIsQ0FBQSxFQU5GO09BQUEsTUFBQTtRQVFFLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBLENBQUEsR0FBaUIsQ0FBNUI7UUFDUCxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQUFBLEdBQWtCLEVBQTdCLEVBVFQ7O2FBV0E7UUFBQyxNQUFBLElBQUQ7UUFBTyxNQUFBLElBQVA7O0lBZGE7OytCQWdCZixlQUFBLEdBQWlCLFNBQUMsUUFBRDthQUNmLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLHFCQUFYLEVBQWtDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNoQyxRQUFBLENBQUE7aUJBQ0EsS0FBQyxDQUFBLFNBQUQsR0FBYTtRQUZtQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEM7SUFEZTs7K0JBS2pCLFdBQUEsR0FBYSxTQUFBO0FBQ1gsVUFBQTs7UUFBQSxjQUFlLE9BQUEsQ0FBUSxnQkFBUjs7TUFDZixNQUFBLEdBQWEsSUFBQSxXQUFBLENBQVksSUFBWjthQUNiLE1BQU0sQ0FBQyxNQUFQLENBQUE7SUFIVzs7K0JBS2IsTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBQTtJQURNOzsrQkFHUixhQUFBLEdBQWUsU0FBQTtNQUNiLElBQUcsSUFBQyxDQUFBLE9BQUo7UUFDRSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBZixDQUE4QjtVQUFBLElBQUEsRUFBTSxJQUFOO1VBQVksT0FBQSxFQUFTLEtBQXJCO1NBQTlCO1FBQ1QsSUFBQyxDQUFBLGtCQUFELENBQUE7UUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBQTtRQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFBO1FBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQUE7ZUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLE1BTmI7T0FBQSxNQUFBO1FBUUUsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQUE7UUFDQSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtRQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFBO1FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQUE7UUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBQTtRQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFFBQVgsRUFBcUIsRUFBckI7UUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXO1FBQ1gsSUFBeUIsY0FBQSxLQUFrQixJQUEzQztpQkFBQSxjQUFBLEdBQWlCLEtBQWpCO1NBZkY7O0lBRGE7OytCQWtCZixRQUFBLEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBLENBQUEsSUFBeUI7SUFEakI7OytCQUdWLFdBQUEsR0FBYSxTQUFBO2FBQ1g7SUFEVzs7K0JBR2IsUUFBQSxHQUFVLFNBQUE7QUFDUixhQUFPLElBQUksQ0FBQyxRQUFMLENBQWMsSUFBQyxDQUFBLEtBQWY7SUFEQzs7K0JBR1YsWUFBQSxHQUFjLFNBQUE7QUFDWixhQUFPLElBQUMsQ0FBQTtJQURJOzsrQkFHZCxJQUFBLEdBQU0sU0FBQyxLQUFELEVBQVEsSUFBUjthQUNKLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLEtBQWQsRUFBcUIsSUFBckI7SUFESTs7K0JBR04sZ0JBQUEsR0FBa0IsU0FBQyxRQUFEO2FBQ2hCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGtCQUFaLEVBQWdDLFFBQWhDO0lBRGdCOzsrQkFHbEIsT0FBQSxHQUFTLFNBQUE7QUFDUCxhQUFPLElBQUMsQ0FBQSxnQkFBRCxDQUFBO0lBREE7OytCQUdULGdCQUFBLEdBQWtCLFNBQUE7QUFDaEIsYUFBTyxJQUFDLENBQUEsS0FBRCxJQUFVLElBQUMsQ0FBQTtJQURGOzsrQkFHbEIsV0FBQSxHQUFhLFNBQUE7QUFDWCxhQUFPLElBQUMsQ0FBQTtJQURHOzsrQkFHYixXQUFBLEdBQWEsU0FBQTtBQUNYLGFBQU8sSUFBQyxDQUFBO0lBREc7Ozs7S0F6Z0JnQjtBQWQvQiIsInNvdXJjZXNDb250ZW50IjpbIntUYXNrLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuUHR5ID0gcmVxdWlyZS5yZXNvbHZlICcuL3Byb2Nlc3MnXG5UZXJtaW5hbCA9IHJlcXVpcmUgJ3Rlcm0uanMnXG5JbnB1dERpYWxvZyA9IG51bGxcblxucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5vcyA9IHJlcXVpcmUgJ29zJ1xuXG5sYXN0T3BlbmVkVmlldyA9IG51bGxcbmxhc3RBY3RpdmVFbGVtZW50ID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBUZXJtaW5hbFBsdXNWaWV3IGV4dGVuZHMgVmlld1xuICBhbmltYXRpbmc6IGZhbHNlXG4gIGlkOiAnJ1xuICBtYXhpbWl6ZWQ6IGZhbHNlXG4gIG9wZW5lZDogZmFsc2VcbiAgcHdkOiAnJ1xuICB3aW5kb3dIZWlnaHQ6ICQod2luZG93KS5oZWlnaHQoKVxuICByb3dIZWlnaHQ6IDIwXG4gIHNoZWxsOiAnJ1xuICB0YWJWaWV3OiBmYWxzZVxuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICd0ZXJtaW5hbC1wbHVzIHRlcm1pbmFsLXZpZXcnLCBvdXRsZXQ6ICd0ZXJtaW5hbFBsdXNWaWV3JywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdwYW5lbC1kaXZpZGVyJywgb3V0bGV0OiAncGFuZWxEaXZpZGVyJ1xuICAgICAgQGRpdiBjbGFzczogJ2J0bi10b29sYmFyJywgb3V0bGV0Oid0b29sYmFyJywgPT5cbiAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdjbG9zZUJ0bicsIGNsYXNzOiAnYnRuIGlubGluZS1ibG9jay10aWdodCByaWdodCcsIGNsaWNrOiAnZGVzdHJveScsID0+XG4gICAgICAgICAgQHNwYW4gY2xhc3M6ICdpY29uIGljb24teCdcbiAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdoaWRlQnRuJywgY2xhc3M6ICdidG4gaW5saW5lLWJsb2NrLXRpZ2h0IHJpZ2h0JywgY2xpY2s6ICdoaWRlJywgPT5cbiAgICAgICAgICBAc3BhbiBjbGFzczogJ2ljb24gaWNvbi1jaGV2cm9uLWRvd24nXG4gICAgICAgIEBidXR0b24gb3V0bGV0OiAnbWF4aW1pemVCdG4nLCBjbGFzczogJ2J0biBpbmxpbmUtYmxvY2stdGlnaHQgcmlnaHQnLCBjbGljazogJ21heGltaXplJywgPT5cbiAgICAgICAgICBAc3BhbiBjbGFzczogJ2ljb24gaWNvbi1zY3JlZW4tZnVsbCdcbiAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdpbnB1dEJ0bicsIGNsYXNzOiAnYnRuIGlubGluZS1ibG9jay10aWdodCBsZWZ0JywgY2xpY2s6ICdpbnB1dERpYWxvZycsID0+XG4gICAgICAgICAgQHNwYW4gY2xhc3M6ICdpY29uIGljb24ta2V5Ym9hcmQnXG4gICAgICBAZGl2IGNsYXNzOiAneHRlcm0nLCBvdXRsZXQ6ICd4dGVybSdcblxuICBAZ2V0Rm9jdXNlZFRlcm1pbmFsOiAtPlxuICAgIHJldHVybiBUZXJtaW5hbC5UZXJtaW5hbC5mb2N1c1xuXG4gIGluaXRpYWxpemU6IChAaWQsIEBwd2QsIEBzdGF0dXNJY29uLCBAc3RhdHVzQmFyLCBAc2hlbGwsIEBhcmdzPVtdKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGNsb3NlQnRuLFxuICAgICAgdGl0bGU6ICdDbG9zZSdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGhpZGVCdG4sXG4gICAgICB0aXRsZTogJ0hpZGUnXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBtYXhpbWl6ZUJ0bi50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQgQG1heGltaXplQnRuLFxuICAgICAgdGl0bGU6ICdGdWxsc2NyZWVuJ1xuICAgIEBpbnB1dEJ0bi50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQgQGlucHV0QnRuLFxuICAgICAgdGl0bGU6ICdJbnNlcnQgVGV4dCdcblxuICAgIEBwcmV2SGVpZ2h0ID0gYXRvbS5jb25maWcuZ2V0KCd0ZXJtaW5hbC1wbHVzLnN0eWxlLmRlZmF1bHRQYW5lbEhlaWdodCcpXG4gICAgaWYgQHByZXZIZWlnaHQuaW5kZXhPZignJScpID4gMFxuICAgICAgcGVyY2VudCA9IE1hdGguYWJzKE1hdGgubWluKHBhcnNlRmxvYXQoQHByZXZIZWlnaHQpIC8gMTAwLjAsIDEpKVxuICAgICAgYm90dG9tSGVpZ2h0ID0gJCgnYXRvbS1wYW5lbC5ib3R0b20nKS5jaGlsZHJlbihcIi50ZXJtaW5hbC12aWV3XCIpLmhlaWdodCgpIG9yIDBcbiAgICAgIEBwcmV2SGVpZ2h0ID0gcGVyY2VudCAqICgkKCcuaXRlbS12aWV3cycpLmhlaWdodCgpICsgYm90dG9tSGVpZ2h0KVxuICAgIEB4dGVybS5oZWlnaHQgMFxuXG4gICAgQHNldEFuaW1hdGlvblNwZWVkKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3Rlcm1pbmFsLXBsdXMuc3R5bGUuYW5pbWF0aW9uU3BlZWQnLCBAc2V0QW5pbWF0aW9uU3BlZWRcblxuICAgIG92ZXJyaWRlID0gKGV2ZW50KSAtPlxuICAgICAgcmV0dXJuIGlmIGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoJ3Rlcm1pbmFsLXBsdXMnKSBpcyAndHJ1ZSdcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICBAeHRlcm0ub24gJ21vdXNldXAnLCAoZXZlbnQpID0+XG4gICAgICBpZiBldmVudC53aGljaCAhPSAzXG4gICAgICAgIHRleHQgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkudG9TdHJpbmcoKVxuICAgICAgICB1bmxlc3MgdGV4dFxuICAgICAgICAgIEBmb2N1cygpXG4gICAgQHh0ZXJtLm9uICdkcmFnZW50ZXInLCBvdmVycmlkZVxuICAgIEB4dGVybS5vbiAnZHJhZ292ZXInLCBvdmVycmlkZVxuICAgIEB4dGVybS5vbiAnZHJvcCcsIEByZWNpZXZlSXRlbU9yRmlsZVxuXG4gICAgQG9uICdmb2N1cycsIEBmb2N1c1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBkaXNwb3NlOiA9PlxuICAgICAgQG9mZiAnZm9jdXMnLCBAZm9jdXNcblxuICBhdHRhY2g6IC0+XG4gICAgcmV0dXJuIGlmIEBwYW5lbD9cbiAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiB0aGlzLCB2aXNpYmxlOiBmYWxzZSlcblxuICBzZXRBbmltYXRpb25TcGVlZDogPT5cbiAgICBAYW5pbWF0aW9uU3BlZWQgPSBhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmFsLXBsdXMuc3R5bGUuYW5pbWF0aW9uU3BlZWQnKVxuICAgIEBhbmltYXRpb25TcGVlZCA9IDEwMCBpZiBAYW5pbWF0aW9uU3BlZWQgaXMgMFxuXG4gICAgQHh0ZXJtLmNzcyAndHJhbnNpdGlvbicsIFwiaGVpZ2h0ICN7MC4yNSAvIEBhbmltYXRpb25TcGVlZH1zIGxpbmVhclwiXG5cbiAgcmVjaWV2ZUl0ZW1PckZpbGU6IChldmVudCkgPT5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICB7ZGF0YVRyYW5zZmVyfSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnRcblxuICAgIGlmIGRhdGFUcmFuc2Zlci5nZXREYXRhKCdhdG9tLWV2ZW50JykgaXMgJ3RydWUnXG4gICAgICBmaWxlUGF0aCA9IGRhdGFUcmFuc2Zlci5nZXREYXRhKCd0ZXh0L3BsYWluJylcbiAgICAgIEBpbnB1dCBcIiN7ZmlsZVBhdGh9IFwiIGlmIGZpbGVQYXRoXG4gICAgZWxzZSBpZiBmaWxlUGF0aCA9IGRhdGFUcmFuc2Zlci5nZXREYXRhKCdpbml0aWFsUGF0aCcpXG4gICAgICBAaW5wdXQgXCIje2ZpbGVQYXRofSBcIlxuICAgIGVsc2UgaWYgZGF0YVRyYW5zZmVyLmZpbGVzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBmaWxlIGluIGRhdGFUcmFuc2Zlci5maWxlc1xuICAgICAgICBAaW5wdXQgXCIje2ZpbGUucGF0aH0gXCJcblxuICBmb3JrUHR5UHJvY2VzczogLT5cbiAgICBUYXNrLm9uY2UgUHR5LCBwYXRoLnJlc29sdmUoQHB3ZCksIEBzaGVsbCwgQGFyZ3MsID0+XG4gICAgICBAaW5wdXQgPSAtPlxuICAgICAgQHJlc2l6ZSA9IC0+XG5cbiAgZ2V0SWQ6IC0+XG4gICAgcmV0dXJuIEBpZFxuXG4gIGRpc3BsYXlUZXJtaW5hbDogLT5cbiAgICB7Y29scywgcm93c30gPSBAZ2V0RGltZW5zaW9ucygpXG4gICAgQHB0eVByb2Nlc3MgPSBAZm9ya1B0eVByb2Nlc3MoKVxuXG4gICAgQHRlcm1pbmFsID0gbmV3IFRlcm1pbmFsIHtcbiAgICAgIGN1cnNvckJsaW5rICAgICA6IGZhbHNlXG4gICAgICBzY3JvbGxiYWNrICAgICAgOiBhdG9tLmNvbmZpZy5nZXQgJ3Rlcm1pbmFsLXBsdXMuY29yZS5zY3JvbGxiYWNrJ1xuICAgICAgY29scywgcm93c1xuICAgIH1cblxuICAgIEBhdHRhY2hMaXN0ZW5lcnMoKVxuICAgIEBhdHRhY2hSZXNpemVFdmVudHMoKVxuICAgIEBhdHRhY2hXaW5kb3dFdmVudHMoKVxuICAgIEB0ZXJtaW5hbC5vcGVuIEB4dGVybS5nZXQoMClcblxuICBhdHRhY2hMaXN0ZW5lcnM6IC0+XG4gICAgQHB0eVByb2Nlc3Mub24gXCJ0ZXJtaW5hbC1wbHVzOmRhdGFcIiwgKGRhdGEpID0+XG4gICAgICBAdGVybWluYWwud3JpdGUgZGF0YVxuXG4gICAgQHB0eVByb2Nlc3Mub24gXCJ0ZXJtaW5hbC1wbHVzOmV4aXRcIiwgPT5cbiAgICAgIEBkZXN0cm95KCkgaWYgYXRvbS5jb25maWcuZ2V0KCd0ZXJtaW5hbC1wbHVzLnRvZ2dsZXMuYXV0b0Nsb3NlJylcblxuICAgIEB0ZXJtaW5hbC5lbmQgPSA9PiBAZGVzdHJveSgpXG5cbiAgICBAdGVybWluYWwub24gXCJkYXRhXCIsIChkYXRhKSA9PlxuICAgICAgQGlucHV0IGRhdGFcblxuICAgIEBwdHlQcm9jZXNzLm9uIFwidGVybWluYWwtcGx1czp0aXRsZVwiLCAodGl0bGUpID0+XG4gICAgICBAcHJvY2VzcyA9IHRpdGxlXG4gICAgQHRlcm1pbmFsLm9uIFwidGl0bGVcIiwgKHRpdGxlKSA9PlxuICAgICAgQHRpdGxlID0gdGl0bGVcblxuICAgIEB0ZXJtaW5hbC5vbmNlIFwib3BlblwiLCA9PlxuICAgICAgQGFwcGx5U3R5bGUoKVxuICAgICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcblxuICAgICAgcmV0dXJuIHVubGVzcyBAcHR5UHJvY2Vzcy5jaGlsZFByb2Nlc3M/XG4gICAgICBhdXRvUnVuQ29tbWFuZCA9IGF0b20uY29uZmlnLmdldCgndGVybWluYWwtcGx1cy5jb3JlLmF1dG9SdW5Db21tYW5kJylcbiAgICAgIEBpbnB1dCBcIiN7YXV0b1J1bkNvbW1hbmR9I3tvcy5FT0x9XCIgaWYgYXV0b1J1bkNvbW1hbmRcblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBzdGF0dXNJY29uLmRlc3Ryb3koKVxuICAgIEBzdGF0dXNCYXIucmVtb3ZlVGVybWluYWxWaWV3IHRoaXNcbiAgICBAZGV0YWNoUmVzaXplRXZlbnRzKClcbiAgICBAZGV0YWNoV2luZG93RXZlbnRzKClcblxuICAgIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgQGhpZGUoKVxuICAgICAgQG9uVHJhbnNpdGlvbkVuZCA9PiBAcGFuZWwuZGVzdHJveSgpXG4gICAgZWxzZVxuICAgICAgQHBhbmVsLmRlc3Ryb3koKVxuXG4gICAgaWYgQHN0YXR1c0ljb24gYW5kIEBzdGF0dXNJY29uLnBhcmVudE5vZGVcbiAgICAgIEBzdGF0dXNJY29uLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoQHN0YXR1c0ljb24pXG5cbiAgICBAcHR5UHJvY2Vzcz8udGVybWluYXRlKClcbiAgICBAdGVybWluYWw/LmRlc3Ryb3koKVxuXG4gIG1heGltaXplOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLnJlbW92ZSBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgIEBtYXhpbWl6ZUJ0bi50b29sdGlwLmRpc3Bvc2UoKVxuXG4gICAgQG1heEhlaWdodCA9IEBwcmV2SGVpZ2h0ICsgJCgnLml0ZW0tdmlld3MnKS5oZWlnaHQoKVxuICAgIGJ0biA9IEBtYXhpbWl6ZUJ0bi5jaGlsZHJlbignc3BhbicpXG4gICAgQG9uVHJhbnNpdGlvbkVuZCA9PiBAZm9jdXMoKVxuXG4gICAgaWYgQG1heGltaXplZFxuICAgICAgQG1heGltaXplQnRuLnRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCBAbWF4aW1pemVCdG4sXG4gICAgICAgIHRpdGxlOiAnRnVsbHNjcmVlbidcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgICAgQGFkanVzdEhlaWdodCBAcHJldkhlaWdodFxuICAgICAgYnRuLnJlbW92ZUNsYXNzKCdpY29uLXNjcmVlbi1ub3JtYWwnKS5hZGRDbGFzcygnaWNvbi1zY3JlZW4tZnVsbCcpXG4gICAgICBAbWF4aW1pemVkID0gZmFsc2VcbiAgICBlbHNlXG4gICAgICBAbWF4aW1pemVCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBtYXhpbWl6ZUJ0bixcbiAgICAgICAgdGl0bGU6ICdOb3JtYWwnXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1heGltaXplQnRuLnRvb2x0aXBcbiAgICAgIEBhZGp1c3RIZWlnaHQgQG1heEhlaWdodFxuICAgICAgYnRuLnJlbW92ZUNsYXNzKCdpY29uLXNjcmVlbi1mdWxsJykuYWRkQ2xhc3MoJ2ljb24tc2NyZWVuLW5vcm1hbCcpXG4gICAgICBAbWF4aW1pemVkID0gdHJ1ZVxuXG4gIG9wZW46ID0+XG4gICAgbGFzdEFjdGl2ZUVsZW1lbnQgPz0gJChkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuXG4gICAgaWYgbGFzdE9wZW5lZFZpZXcgYW5kIGxhc3RPcGVuZWRWaWV3ICE9IHRoaXNcbiAgICAgIGlmIGxhc3RPcGVuZWRWaWV3Lm1heGltaXplZFxuICAgICAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUgQG1heGltaXplQnRuLnRvb2x0aXBcbiAgICAgICAgQG1heGltaXplQnRuLnRvb2x0aXAuZGlzcG9zZSgpXG4gICAgICAgIGljb24gPSBAbWF4aW1pemVCdG4uY2hpbGRyZW4oJ3NwYW4nKVxuXG4gICAgICAgIEBtYXhIZWlnaHQgPSBsYXN0T3BlbmVkVmlldy5tYXhIZWlnaHRcbiAgICAgICAgQG1heGltaXplQnRuLnRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCBAbWF4aW1pemVCdG4sXG4gICAgICAgICAgdGl0bGU6ICdOb3JtYWwnXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgICAgICBpY29uLnJlbW92ZUNsYXNzKCdpY29uLXNjcmVlbi1mdWxsJykuYWRkQ2xhc3MoJ2ljb24tc2NyZWVuLW5vcm1hbCcpXG4gICAgICAgIEBtYXhpbWl6ZWQgPSB0cnVlXG4gICAgICBsYXN0T3BlbmVkVmlldy5oaWRlKClcblxuICAgIGxhc3RPcGVuZWRWaWV3ID0gdGhpc1xuICAgIEBzdGF0dXNCYXIuc2V0QWN0aXZlVGVybWluYWxWaWV3IHRoaXNcbiAgICBAc3RhdHVzSWNvbi5hY3RpdmF0ZSgpXG5cbiAgICBAb25UcmFuc2l0aW9uRW5kID0+XG4gICAgICBpZiBub3QgQG9wZW5lZFxuICAgICAgICBAb3BlbmVkID0gdHJ1ZVxuICAgICAgICBAZGlzcGxheVRlcm1pbmFsKClcbiAgICAgICAgQHByZXZIZWlnaHQgPSBAbmVhcmVzdFJvdyhAeHRlcm0uaGVpZ2h0KCkpXG4gICAgICAgIEB4dGVybS5oZWlnaHQoQHByZXZIZWlnaHQpXG4gICAgICBlbHNlXG4gICAgICAgIEBmb2N1cygpXG5cbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQHh0ZXJtLmhlaWdodCAwXG4gICAgQGFuaW1hdGluZyA9IHRydWVcbiAgICBAeHRlcm0uaGVpZ2h0IGlmIEBtYXhpbWl6ZWQgdGhlbiBAbWF4SGVpZ2h0IGVsc2UgQHByZXZIZWlnaHRcblxuICBoaWRlOiA9PlxuICAgIEB0ZXJtaW5hbD8uYmx1cigpXG4gICAgbGFzdE9wZW5lZFZpZXcgPSBudWxsXG4gICAgQHN0YXR1c0ljb24uZGVhY3RpdmF0ZSgpXG5cbiAgICBAb25UcmFuc2l0aW9uRW5kID0+XG4gICAgICBAcGFuZWwuaGlkZSgpXG4gICAgICB1bmxlc3MgbGFzdE9wZW5lZFZpZXc/XG4gICAgICAgIGlmIGxhc3RBY3RpdmVFbGVtZW50P1xuICAgICAgICAgIGxhc3RBY3RpdmVFbGVtZW50LmZvY3VzKClcbiAgICAgICAgICBsYXN0QWN0aXZlRWxlbWVudCA9IG51bGxcblxuICAgIEB4dGVybS5oZWlnaHQgaWYgQG1heGltaXplZCB0aGVuIEBtYXhIZWlnaHQgZWxzZSBAcHJldkhlaWdodFxuICAgIEBhbmltYXRpbmcgPSB0cnVlXG4gICAgQHh0ZXJtLmhlaWdodCAwXG5cbiAgdG9nZ2xlOiAtPlxuICAgIHJldHVybiBpZiBAYW5pbWF0aW5nXG5cbiAgICBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgIEBoaWRlKClcbiAgICBlbHNlXG4gICAgICBAb3BlbigpXG5cbiAgaW5wdXQ6IChkYXRhKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQHB0eVByb2Nlc3MuY2hpbGRQcm9jZXNzP1xuXG4gICAgQHRlcm1pbmFsLnN0b3BTY3JvbGxpbmcoKVxuICAgIEBwdHlQcm9jZXNzLnNlbmQgZXZlbnQ6ICdpbnB1dCcsIHRleHQ6IGRhdGFcblxuICByZXNpemU6IChjb2xzLCByb3dzKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQHB0eVByb2Nlc3MuY2hpbGRQcm9jZXNzP1xuXG4gICAgQHB0eVByb2Nlc3Muc2VuZCB7ZXZlbnQ6ICdyZXNpemUnLCByb3dzLCBjb2xzfVxuXG4gIGFwcGx5U3R5bGU6IC0+XG4gICAgY29uZmlnID0gYXRvbS5jb25maWcuZ2V0ICd0ZXJtaW5hbC1wbHVzJ1xuXG4gICAgQHh0ZXJtLmFkZENsYXNzIGNvbmZpZy5zdHlsZS50aGVtZVxuICAgIEB4dGVybS5hZGRDbGFzcyAnY3Vyc29yLWJsaW5rJyBpZiBjb25maWcudG9nZ2xlcy5jdXJzb3JCbGlua1xuXG4gICAgZWRpdG9yRm9udCA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLmZvbnRGYW1pbHknKVxuICAgIGRlZmF1bHRGb250ID0gXCJNZW5sbywgQ29uc29sYXMsICdEZWphVnUgU2FucyBNb25vJywgbW9ub3NwYWNlXCJcbiAgICBvdmVycmlkZUZvbnQgPSBjb25maWcuc3R5bGUuZm9udEZhbWlseVxuICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRGYW1pbHkgPSBvdmVycmlkZUZvbnQgb3IgZWRpdG9yRm9udCBvciBkZWZhdWx0Rm9udFxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdlZGl0b3IuZm9udEZhbWlseScsIChldmVudCkgPT5cbiAgICAgIGVkaXRvckZvbnQgPSBldmVudC5uZXdWYWx1ZVxuICAgICAgQHRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuZm9udEZhbWlseSA9IG92ZXJyaWRlRm9udCBvciBlZGl0b3JGb250IG9yIGRlZmF1bHRGb250XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICd0ZXJtaW5hbC1wbHVzLnN0eWxlLmZvbnRGYW1pbHknLCAoZXZlbnQpID0+XG4gICAgICBvdmVycmlkZUZvbnQgPSBldmVudC5uZXdWYWx1ZVxuICAgICAgQHRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuZm9udEZhbWlseSA9IG92ZXJyaWRlRm9udCBvciBlZGl0b3JGb250IG9yIGRlZmF1bHRGb250XG5cbiAgICBlZGl0b3JGb250U2l6ZSA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLmZvbnRTaXplJylcbiAgICBvdmVycmlkZUZvbnRTaXplID0gY29uZmlnLnN0eWxlLmZvbnRTaXplXG4gICAgQHRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuZm9udFNpemUgPSBcIiN7b3ZlcnJpZGVGb250U2l6ZSBvciBlZGl0b3JGb250U2l6ZX1weFwiXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2VkaXRvci5mb250U2l6ZScsIChldmVudCkgPT5cbiAgICAgIGVkaXRvckZvbnRTaXplID0gZXZlbnQubmV3VmFsdWVcbiAgICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRTaXplID0gXCIje292ZXJyaWRlRm9udFNpemUgb3IgZWRpdG9yRm9udFNpemV9cHhcIlxuICAgICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3Rlcm1pbmFsLXBsdXMuc3R5bGUuZm9udFNpemUnLCAoZXZlbnQpID0+XG4gICAgICBvdmVycmlkZUZvbnRTaXplID0gZXZlbnQubmV3VmFsdWVcbiAgICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRTaXplID0gXCIje292ZXJyaWRlRm9udFNpemUgb3IgZWRpdG9yRm9udFNpemV9cHhcIlxuICAgICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcblxuICAgICMgZmlyc3QgOCBjb2xvcnMgaS5lLiAnZGFyaycgY29sb3JzXG4gICAgQHRlcm1pbmFsLmNvbG9yc1swLi43XSA9IFtcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5ibGFjay50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwucmVkLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5ncmVlbi50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwueWVsbG93LnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5ibHVlLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5tYWdlbnRhLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5jeWFuLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC53aGl0ZS50b0hleFN0cmluZygpXG4gICAgXVxuICAgICMgJ2JyaWdodCcgY29sb3JzXG4gICAgQHRlcm1pbmFsLmNvbG9yc1s4Li4xNV0gPSBbXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodEJsYWNrLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0UmVkLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0R3JlZW4udG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRZZWxsb3cudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRCbHVlLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0TWFnZW50YS50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodEN5YW4udG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRXaGl0ZS50b0hleFN0cmluZygpXG4gICAgXVxuXG4gIGF0dGFjaFdpbmRvd0V2ZW50czogLT5cbiAgICAkKHdpbmRvdykub24gJ3Jlc2l6ZScsIEBvbldpbmRvd1Jlc2l6ZVxuXG4gIGRldGFjaFdpbmRvd0V2ZW50czogLT5cbiAgICAkKHdpbmRvdykub2ZmICdyZXNpemUnLCBAb25XaW5kb3dSZXNpemVcblxuICBhdHRhY2hSZXNpemVFdmVudHM6IC0+XG4gICAgQHBhbmVsRGl2aWRlci5vbiAnbW91c2Vkb3duJywgQHJlc2l6ZVN0YXJ0ZWRcblxuICBkZXRhY2hSZXNpemVFdmVudHM6IC0+XG4gICAgQHBhbmVsRGl2aWRlci5vZmYgJ21vdXNlZG93bidcblxuICBvbldpbmRvd1Jlc2l6ZTogPT5cbiAgICBpZiBub3QgQHRhYlZpZXdcbiAgICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCAnJ1xuICAgICAgbmV3SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXG4gICAgICBib3R0b21QYW5lbCA9ICQoJ2F0b20tcGFuZWwtY29udGFpbmVyLmJvdHRvbScpLmZpcnN0KCkuZ2V0KDApXG4gICAgICBvdmVyZmxvdyA9IGJvdHRvbVBhbmVsLnNjcm9sbEhlaWdodCAtIGJvdHRvbVBhbmVsLm9mZnNldEhlaWdodFxuXG4gICAgICBkZWx0YSA9IG5ld0hlaWdodCAtIEB3aW5kb3dIZWlnaHRcbiAgICAgIEB3aW5kb3dIZWlnaHQgPSBuZXdIZWlnaHRcblxuICAgICAgaWYgQG1heGltaXplZFxuICAgICAgICBjbGFtcGVkID0gTWF0aC5tYXgoQG1heEhlaWdodCArIGRlbHRhLCBAcm93SGVpZ2h0KVxuXG4gICAgICAgIEBhZGp1c3RIZWlnaHQgY2xhbXBlZCBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgICAgQG1heEhlaWdodCA9IGNsYW1wZWRcblxuICAgICAgICBAcHJldkhlaWdodCA9IE1hdGgubWluKEBwcmV2SGVpZ2h0LCBAbWF4SGVpZ2h0KVxuICAgICAgZWxzZSBpZiBvdmVyZmxvdyA+IDBcbiAgICAgICAgY2xhbXBlZCA9IE1hdGgubWF4KEBuZWFyZXN0Um93KEBwcmV2SGVpZ2h0ICsgZGVsdGEpLCBAcm93SGVpZ2h0KVxuXG4gICAgICAgIEBhZGp1c3RIZWlnaHQgY2xhbXBlZCBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgICAgQHByZXZIZWlnaHQgPSBjbGFtcGVkXG5cbiAgICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCBcImhlaWdodCAjezAuMjUgLyBAYW5pbWF0aW9uU3BlZWR9cyBsaW5lYXJcIlxuICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG5cbiAgcmVzaXplU3RhcnRlZDogPT5cbiAgICByZXR1cm4gaWYgQG1heGltaXplZFxuICAgIEBtYXhIZWlnaHQgPSBAcHJldkhlaWdodCArICQoJy5pdGVtLXZpZXdzJykuaGVpZ2h0KClcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgQHJlc2l6ZVBhbmVsKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgQHJlc2l6ZVN0b3BwZWQpXG4gICAgQHh0ZXJtLmNzcyAndHJhbnNpdGlvbicsICcnXG5cbiAgcmVzaXplU3RvcHBlZDogPT5cbiAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNlbW92ZScsIEByZXNpemVQYW5lbClcbiAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNldXAnLCBAcmVzaXplU3RvcHBlZClcbiAgICBAeHRlcm0uY3NzICd0cmFuc2l0aW9uJywgXCJoZWlnaHQgI3swLjI1IC8gQGFuaW1hdGlvblNwZWVkfXMgbGluZWFyXCJcblxuICBuZWFyZXN0Um93OiAodmFsdWUpIC0+XG4gICAgcm93cyA9IHZhbHVlIC8vIEByb3dIZWlnaHRcbiAgICByZXR1cm4gcm93cyAqIEByb3dIZWlnaHRcblxuICByZXNpemVQYW5lbDogKGV2ZW50KSA9PlxuICAgIHJldHVybiBAcmVzaXplU3RvcHBlZCgpIHVubGVzcyBldmVudC53aGljaCBpcyAxXG5cbiAgICBtb3VzZVkgPSAkKHdpbmRvdykuaGVpZ2h0KCkgLSBldmVudC5wYWdlWVxuICAgIGRlbHRhID0gbW91c2VZIC0gJCgnYXRvbS1wYW5lbC1jb250YWluZXIuYm90dG9tJykuaGVpZ2h0KClcbiAgICByZXR1cm4gdW5sZXNzIE1hdGguYWJzKGRlbHRhKSA+IChAcm93SGVpZ2h0ICogNSAvIDYpXG5cbiAgICBjbGFtcGVkID0gTWF0aC5tYXgoQG5lYXJlc3RSb3coQHByZXZIZWlnaHQgKyBkZWx0YSksIEByb3dIZWlnaHQpXG4gICAgcmV0dXJuIGlmIGNsYW1wZWQgPiBAbWF4SGVpZ2h0XG5cbiAgICBAeHRlcm0uaGVpZ2h0IGNsYW1wZWRcbiAgICAkKEB0ZXJtaW5hbC5lbGVtZW50KS5oZWlnaHQgY2xhbXBlZFxuICAgIEBwcmV2SGVpZ2h0ID0gY2xhbXBlZFxuXG4gICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcblxuICBhZGp1c3RIZWlnaHQ6IChoZWlnaHQpIC0+XG4gICAgQHh0ZXJtLmhlaWdodCBoZWlnaHRcbiAgICAkKEB0ZXJtaW5hbC5lbGVtZW50KS5oZWlnaHQgaGVpZ2h0XG5cbiAgY29weTogLT5cbiAgICBpZiBAdGVybWluYWwuX3NlbGVjdGVkXG4gICAgICB0ZXh0YXJlYSA9IEB0ZXJtaW5hbC5nZXRDb3B5VGV4dGFyZWEoKVxuICAgICAgdGV4dCA9IEB0ZXJtaW5hbC5ncmFiVGV4dChcbiAgICAgICAgQHRlcm1pbmFsLl9zZWxlY3RlZC54MSwgQHRlcm1pbmFsLl9zZWxlY3RlZC54MixcbiAgICAgICAgQHRlcm1pbmFsLl9zZWxlY3RlZC55MSwgQHRlcm1pbmFsLl9zZWxlY3RlZC55MilcbiAgICBlbHNlXG4gICAgICByYXdUZXh0ID0gQHRlcm1pbmFsLmNvbnRleHQuZ2V0U2VsZWN0aW9uKCkudG9TdHJpbmcoKVxuICAgICAgcmF3TGluZXMgPSByYXdUZXh0LnNwbGl0KC9cXHI/XFxuL2cpXG4gICAgICBsaW5lcyA9IHJhd0xpbmVzLm1hcCAobGluZSkgLT5cbiAgICAgICAgbGluZS5yZXBsYWNlKC9cXHMvZywgXCIgXCIpLnRyaW1SaWdodCgpXG4gICAgICB0ZXh0ID0gbGluZXMuam9pbihcIlxcblwiKVxuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlIHRleHRcblxuICBwYXN0ZTogLT5cbiAgICBAaW5wdXQgYXRvbS5jbGlwYm9hcmQucmVhZCgpXG5cbiAgaW5zZXJ0U2VsZWN0aW9uOiAtPlxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcnVuQ29tbWFuZCA9IGF0b20uY29uZmlnLmdldCgndGVybWluYWwtcGx1cy50b2dnbGVzLnJ1bkluc2VydGVkVGV4dCcpXG5cbiAgICBpZiBzZWxlY3Rpb24gPSBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KClcbiAgICAgIEB0ZXJtaW5hbC5zdG9wU2Nyb2xsaW5nKClcbiAgICAgIEBpbnB1dCBcIiN7c2VsZWN0aW9ufSN7aWYgcnVuQ29tbWFuZCB0aGVuIG9zLkVPTCBlbHNlICcnfVwiXG4gICAgZWxzZSBpZiBjdXJzb3IgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhjdXJzb3Iucm93KVxuICAgICAgQHRlcm1pbmFsLnN0b3BTY3JvbGxpbmcoKVxuICAgICAgQGlucHV0IFwiI3tsaW5lfSN7aWYgcnVuQ29tbWFuZCB0aGVuIG9zLkVPTCBlbHNlICcnfVwiXG4gICAgICBlZGl0b3IubW92ZURvd24oMSk7XG5cbiAgZm9jdXM6ID0+XG4gICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcbiAgICBAZm9jdXNUZXJtaW5hbCgpXG4gICAgQHN0YXR1c0Jhci5zZXRBY3RpdmVUZXJtaW5hbFZpZXcodGhpcylcbiAgICBzdXBlcigpXG5cbiAgYmx1cjogPT5cbiAgICBAYmx1clRlcm1pbmFsKClcbiAgICBzdXBlcigpXG5cbiAgZm9jdXNUZXJtaW5hbDogPT5cbiAgICByZXR1cm4gdW5sZXNzIEB0ZXJtaW5hbFxuXG4gICAgQHRlcm1pbmFsLmZvY3VzKClcbiAgICBpZiBAdGVybWluYWwuX3RleHRhcmVhXG4gICAgICBAdGVybWluYWwuX3RleHRhcmVhLmZvY3VzKClcbiAgICBlbHNlXG4gICAgICBAdGVybWluYWwuZWxlbWVudC5mb2N1cygpXG5cbiAgYmx1clRlcm1pbmFsOiA9PlxuICAgIHJldHVybiB1bmxlc3MgQHRlcm1pbmFsXG5cbiAgICBAdGVybWluYWwuYmx1cigpXG4gICAgQHRlcm1pbmFsLmVsZW1lbnQuYmx1cigpXG5cbiAgcmVzaXplVGVybWluYWxUb1ZpZXc6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcGFuZWwuaXNWaXNpYmxlKCkgb3IgQHRhYlZpZXdcblxuICAgIHtjb2xzLCByb3dzfSA9IEBnZXREaW1lbnNpb25zKClcbiAgICByZXR1cm4gdW5sZXNzIGNvbHMgPiAwIGFuZCByb3dzID4gMFxuICAgIHJldHVybiB1bmxlc3MgQHRlcm1pbmFsXG4gICAgcmV0dXJuIGlmIEB0ZXJtaW5hbC5yb3dzIGlzIHJvd3MgYW5kIEB0ZXJtaW5hbC5jb2xzIGlzIGNvbHNcblxuICAgIEByZXNpemUgY29scywgcm93c1xuICAgIEB0ZXJtaW5hbC5yZXNpemUgY29scywgcm93c1xuXG4gIGdldERpbWVuc2lvbnM6IC0+XG4gICAgZmFrZVJvdyA9ICQoXCI8ZGl2PjxzcGFuPiZuYnNwOzwvc3Bhbj48L2Rpdj5cIilcblxuICAgIGlmIEB0ZXJtaW5hbFxuICAgICAgQGZpbmQoJy50ZXJtaW5hbCcpLmFwcGVuZCBmYWtlUm93XG4gICAgICBmYWtlQ29sID0gZmFrZVJvdy5jaGlsZHJlbigpLmZpcnN0KClbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGNvbHMgPSBNYXRoLmZsb29yIEB4dGVybS53aWR0aCgpIC8gKGZha2VDb2wud2lkdGggb3IgOSlcbiAgICAgIHJvd3MgPSBNYXRoLmZsb29yIEB4dGVybS5oZWlnaHQoKSAvIChmYWtlQ29sLmhlaWdodCBvciAyMClcbiAgICAgIEByb3dIZWlnaHQgPSBmYWtlQ29sLmhlaWdodFxuICAgICAgZmFrZVJvdy5yZW1vdmUoKVxuICAgIGVsc2VcbiAgICAgIGNvbHMgPSBNYXRoLmZsb29yIEB4dGVybS53aWR0aCgpIC8gOVxuICAgICAgcm93cyA9IE1hdGguZmxvb3IgQHh0ZXJtLmhlaWdodCgpIC8gMjBcblxuICAgIHtjb2xzLCByb3dzfVxuXG4gIG9uVHJhbnNpdGlvbkVuZDogKGNhbGxiYWNrKSAtPlxuICAgIEB4dGVybS5vbmUgJ3dlYmtpdFRyYW5zaXRpb25FbmQnLCA9PlxuICAgICAgY2FsbGJhY2soKVxuICAgICAgQGFuaW1hdGluZyA9IGZhbHNlXG5cbiAgaW5wdXREaWFsb2c6IC0+XG4gICAgSW5wdXREaWFsb2cgPz0gcmVxdWlyZSgnLi9pbnB1dC1kaWFsb2cnKVxuICAgIGRpYWxvZyA9IG5ldyBJbnB1dERpYWxvZyB0aGlzXG4gICAgZGlhbG9nLmF0dGFjaCgpXG5cbiAgcmVuYW1lOiAtPlxuICAgIEBzdGF0dXNJY29uLnJlbmFtZSgpXG5cbiAgdG9nZ2xlVGFiVmlldzogLT5cbiAgICBpZiBAdGFiVmlld1xuICAgICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoaXRlbTogdGhpcywgdmlzaWJsZTogZmFsc2UpXG4gICAgICBAYXR0YWNoUmVzaXplRXZlbnRzKClcbiAgICAgIEBjbG9zZUJ0bi5zaG93KClcbiAgICAgIEBoaWRlQnRuLnNob3coKVxuICAgICAgQG1heGltaXplQnRuLnNob3coKVxuICAgICAgQHRhYlZpZXcgPSBmYWxzZVxuICAgIGVsc2VcbiAgICAgIEBwYW5lbC5kZXN0cm95KClcbiAgICAgIEBkZXRhY2hSZXNpemVFdmVudHMoKVxuICAgICAgQGNsb3NlQnRuLmhpZGUoKVxuICAgICAgQGhpZGVCdG4uaGlkZSgpXG4gICAgICBAbWF4aW1pemVCdG4uaGlkZSgpXG4gICAgICBAeHRlcm0uY3NzIFwiaGVpZ2h0XCIsIFwiXCJcbiAgICAgIEB0YWJWaWV3ID0gdHJ1ZVxuICAgICAgbGFzdE9wZW5lZFZpZXcgPSBudWxsIGlmIGxhc3RPcGVuZWRWaWV3ID09IHRoaXNcblxuICBnZXRUaXRsZTogLT5cbiAgICBAc3RhdHVzSWNvbi5nZXROYW1lKCkgb3IgXCJUZXJtaW5hbC1QbHVzXCJcblxuICBnZXRJY29uTmFtZTogLT5cbiAgICBcInRlcm1pbmFsXCJcblxuICBnZXRTaGVsbDogLT5cbiAgICByZXR1cm4gcGF0aC5iYXNlbmFtZSBAc2hlbGxcblxuICBnZXRTaGVsbFBhdGg6IC0+XG4gICAgcmV0dXJuIEBzaGVsbFxuXG4gIGVtaXQ6IChldmVudCwgZGF0YSkgLT5cbiAgICBAZW1pdHRlci5lbWl0IGV2ZW50LCBkYXRhXG5cbiAgb25EaWRDaGFuZ2VUaXRsZTogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtY2hhbmdlLXRpdGxlJywgY2FsbGJhY2tcblxuICBnZXRQYXRoOiAtPlxuICAgIHJldHVybiBAZ2V0VGVybWluYWxUaXRsZSgpXG5cbiAgZ2V0VGVybWluYWxUaXRsZTogLT5cbiAgICByZXR1cm4gQHRpdGxlIG9yIEBwcm9jZXNzXG5cbiAgZ2V0VGVybWluYWw6IC0+XG4gICAgcmV0dXJuIEB0ZXJtaW5hbFxuXG4gIGlzQW5pbWF0aW5nOiAtPlxuICAgIHJldHVybiBAYW5pbWF0aW5nXG4iXX0=
