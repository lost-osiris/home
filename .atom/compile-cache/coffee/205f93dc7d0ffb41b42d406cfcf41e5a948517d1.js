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
      return this.subscriptions.add({
        dispose: (function(_this) {
          return function() {
            return _this.off('focus', _this.focus);
          };
        })(this)
      });
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

    PlatformIOTerminalView.prototype.focus = function() {
      this.resizeTerminalToView();
      this.focusTerminal();
      this.statusBar.setActiveTerminalView(this);
      return PlatformIOTerminalView.__super__.focus.call(this);
    };

    PlatformIOTerminalView.prototype.blur = function() {
      this.blurTerminal();
      return PlatformIOTerminalView.__super__.blur.call(this);
    };

    PlatformIOTerminalView.prototype.focusTerminal = function() {
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

    PlatformIOTerminalView.prototype.blurTerminal = function() {
      if (!this.terminal) {
        return;
      }
      this.terminal.blur();
      return this.terminal.element.blur();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi92aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUpBQUE7SUFBQTs7OztFQUFBLE1BQXVDLE9BQUEsQ0FBUSxNQUFSLENBQXZDLEVBQUMsZUFBRCxFQUFPLDZDQUFQLEVBQTRCOztFQUM1QixPQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaLEVBQUMsVUFBRCxFQUFJOztFQUVKLEdBQUEsR0FBTSxPQUFPLENBQUMsT0FBUixDQUFnQixXQUFoQjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLFNBQVI7O0VBQ1gsV0FBQSxHQUFjOztFQUVkLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsY0FBQSxHQUFpQjs7RUFDakIsaUJBQUEsR0FBb0I7O0VBRXBCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUNBQ0osU0FBQSxHQUFXOztxQ0FDWCxFQUFBLEdBQUk7O3FDQUNKLFNBQUEsR0FBVzs7cUNBQ1gsTUFBQSxHQUFROztxQ0FDUixHQUFBLEdBQUs7O3FDQUNMLFlBQUEsR0FBYyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBOztxQ0FDZCxTQUFBLEdBQVc7O3FDQUNYLEtBQUEsR0FBTzs7cUNBQ1AsT0FBQSxHQUFTOztJQUVULHNCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx1Q0FBUDtRQUFnRCxNQUFBLEVBQVEsd0JBQXhEO09BQUwsRUFBdUYsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3JGLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGVBQVA7WUFBd0IsTUFBQSxFQUFRLGNBQWhDO1dBQUw7VUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUFQO1lBQXNCLE1BQUEsRUFBTyxTQUE3QjtXQUFMLEVBQTZDLFNBQUE7WUFDM0MsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLE1BQUEsRUFBUSxVQUFSO2NBQW9CLENBQUEsS0FBQSxDQUFBLEVBQU8sOEJBQTNCO2NBQTJELEtBQUEsRUFBTyxTQUFsRTthQUFSLEVBQXFGLFNBQUE7cUJBQ25GLEtBQUMsQ0FBQSxJQUFELENBQU07Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUFQO2VBQU47WUFEbUYsQ0FBckY7WUFFQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsTUFBQSxFQUFRLFNBQVI7Y0FBbUIsQ0FBQSxLQUFBLENBQUEsRUFBTyw4QkFBMUI7Y0FBMEQsS0FBQSxFQUFPLE1BQWpFO2FBQVIsRUFBaUYsU0FBQTtxQkFDL0UsS0FBQyxDQUFBLElBQUQsQ0FBTTtnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHdCQUFQO2VBQU47WUFEK0UsQ0FBakY7WUFFQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsTUFBQSxFQUFRLGFBQVI7Y0FBdUIsQ0FBQSxLQUFBLENBQUEsRUFBTyw4QkFBOUI7Y0FBOEQsS0FBQSxFQUFPLFVBQXJFO2FBQVIsRUFBeUYsU0FBQTtxQkFDdkYsS0FBQyxDQUFBLElBQUQsQ0FBTTtnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHVCQUFQO2VBQU47WUFEdUYsQ0FBekY7bUJBRUEsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLE1BQUEsRUFBUSxVQUFSO2NBQW9CLENBQUEsS0FBQSxDQUFBLEVBQU8sNkJBQTNCO2NBQTBELEtBQUEsRUFBTyxhQUFqRTthQUFSLEVBQXdGLFNBQUE7cUJBQ3RGLEtBQUMsQ0FBQSxJQUFELENBQU07Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxvQkFBUDtlQUFOO1lBRHNGLENBQXhGO1VBUDJDLENBQTdDO2lCQVNBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE9BQVA7WUFBZ0IsTUFBQSxFQUFRLE9BQXhCO1dBQUw7UUFYcUY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZGO0lBRFE7O0lBY1Ysc0JBQUMsQ0FBQSxrQkFBRCxHQUFxQixTQUFBO0FBQ25CLGFBQU8sUUFBUSxDQUFDLFFBQVEsQ0FBQztJQUROOztxQ0FHckIsVUFBQSxHQUFZLFNBQUMsRUFBRCxFQUFNLEdBQU4sRUFBWSxVQUFaLEVBQXlCLFNBQXpCLEVBQXFDLEtBQXJDLEVBQTZDLElBQTdDLEVBQXVELE9BQXZEO0FBQ1YsVUFBQTtNQURXLElBQUMsQ0FBQSxLQUFEO01BQUssSUFBQyxDQUFBLE1BQUQ7TUFBTSxJQUFDLENBQUEsYUFBRDtNQUFhLElBQUMsQ0FBQSxZQUFEO01BQVksSUFBQyxDQUFBLFFBQUQ7TUFBUSxJQUFDLENBQUEsc0JBQUQsT0FBTTtNQUFJLElBQUMsQ0FBQSw0QkFBRCxVQUFTO01BQzFFLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BRWYsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsUUFBbkIsRUFDakI7UUFBQSxLQUFBLEVBQU8sT0FBUDtPQURpQixDQUFuQjtNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLE9BQW5CLEVBQ2pCO1FBQUEsS0FBQSxFQUFPLE1BQVA7T0FEaUIsQ0FBbkI7TUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLEdBQXVCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsV0FBbkIsRUFDeEM7UUFBQSxLQUFBLEVBQU8sWUFBUDtPQUR3QyxDQUExQztNQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixHQUFvQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFFBQW5CLEVBQ2xCO1FBQUEsS0FBQSxFQUFPLGFBQVA7T0FEa0I7TUFHcEIsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0RBQWhCO01BQ2QsSUFBRyxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBb0IsR0FBcEIsQ0FBQSxHQUEyQixDQUE5QjtRQUNFLE9BQUEsR0FBVSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsVUFBQSxDQUFXLElBQUMsQ0FBQSxVQUFaLENBQUEsR0FBMEIsS0FBbkMsRUFBMEMsQ0FBMUMsQ0FBVDtRQUNWLFlBQUEsR0FBZSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxRQUF2QixDQUFnQyxnQkFBaEMsQ0FBaUQsQ0FBQyxNQUFsRCxDQUFBLENBQUEsSUFBOEQ7UUFDN0UsSUFBQyxDQUFBLFVBQUQsR0FBYyxPQUFBLEdBQVUsQ0FBQyxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLE1BQWpCLENBQUEsQ0FBQSxHQUE0QixZQUE3QixFQUgxQjs7TUFJQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxDQUFkO01BRUEsSUFBQyxDQUFBLGlCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLDhDQUF4QixFQUF3RSxJQUFDLENBQUEsaUJBQXpFLENBQW5CO01BRUEsUUFBQSxHQUFXLFNBQUMsS0FBRDtRQUNULElBQVUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBakMsQ0FBeUMseUJBQXpDLENBQUEsS0FBdUUsTUFBakY7QUFBQSxpQkFBQTs7UUFDQSxLQUFLLENBQUMsY0FBTixDQUFBO2VBQ0EsS0FBSyxDQUFDLGVBQU4sQ0FBQTtNQUhTO01BS1gsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsU0FBVixFQUFxQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtBQUNuQixjQUFBO1VBQUEsSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLENBQWxCO1lBQ0UsSUFBQSxHQUFPLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBcUIsQ0FBQyxRQUF0QixDQUFBO1lBQ1AsSUFBOEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDhDQUFoQixDQUFBLElBQW9FLElBQWxHO2NBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFmLENBQXFCLElBQXJCLEVBQUE7O1lBQ0EsSUFBQSxDQUFPLElBQVA7cUJBQ0UsS0FBQyxDQUFBLEtBQUQsQ0FBQSxFQURGO2FBSEY7O1FBRG1CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtNQU1BLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFdBQVYsRUFBdUIsUUFBdkI7TUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxVQUFWLEVBQXNCLFFBQXRCO01BQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixJQUFDLENBQUEsaUJBQW5CO01BRUEsSUFBQyxDQUFBLEVBQUQsQ0FBSSxPQUFKLEVBQWEsSUFBQyxDQUFBLEtBQWQ7YUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUI7UUFBQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDMUIsS0FBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLEVBQWMsS0FBQyxDQUFBLEtBQWY7VUFEMEI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7T0FBbkI7SUF2Q1U7O3FDQTBDWixNQUFBLEdBQVEsU0FBQTtNQUNOLElBQVUsa0JBQVY7QUFBQSxlQUFBOzthQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFmLENBQThCO1FBQUEsSUFBQSxFQUFNLElBQU47UUFBWSxPQUFBLEVBQVMsS0FBckI7T0FBOUI7SUFGSDs7cUNBSVIsaUJBQUEsR0FBbUIsU0FBQTtNQUNqQixJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsOENBQWhCO01BQ2xCLElBQXlCLElBQUMsQ0FBQSxjQUFELEtBQW1CLENBQTVDO1FBQUEsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBbEI7O2FBRUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsWUFBWCxFQUF5QixTQUFBLEdBQVMsQ0FBQyxJQUFBLEdBQU8sSUFBQyxDQUFBLGNBQVQsQ0FBVCxHQUFpQyxVQUExRDtJQUppQjs7cUNBTW5CLGlCQUFBLEdBQW1CLFNBQUMsS0FBRDtBQUNqQixVQUFBO01BQUEsS0FBSyxDQUFDLGNBQU4sQ0FBQTtNQUNBLEtBQUssQ0FBQyxlQUFOLENBQUE7TUFDQyxlQUFnQixLQUFLLENBQUM7TUFFdkIsSUFBRyxZQUFZLENBQUMsT0FBYixDQUFxQixZQUFyQixDQUFBLEtBQXNDLE1BQXpDO1FBQ0UsUUFBQSxHQUFXLFlBQVksQ0FBQyxPQUFiLENBQXFCLFlBQXJCO1FBQ1gsSUFBeUIsUUFBekI7aUJBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBVSxRQUFELEdBQVUsR0FBbkIsRUFBQTtTQUZGO09BQUEsTUFHSyxJQUFHLFFBQUEsR0FBVyxZQUFZLENBQUMsT0FBYixDQUFxQixhQUFyQixDQUFkO2VBQ0gsSUFBQyxDQUFBLEtBQUQsQ0FBVSxRQUFELEdBQVUsR0FBbkIsRUFERztPQUFBLE1BRUEsSUFBRyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQW5CLEdBQTRCLENBQS9CO0FBQ0g7QUFBQTthQUFBLHNDQUFBOzt1QkFDRSxJQUFDLENBQUEsS0FBRCxDQUFVLElBQUksQ0FBQyxJQUFOLEdBQVcsR0FBcEI7QUFERjt1QkFERzs7SUFWWTs7cUNBY25CLGNBQUEsR0FBZ0IsU0FBQTthQUNkLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixFQUFlLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBQyxDQUFBLEdBQWQsQ0FBZixFQUFtQyxJQUFDLENBQUEsS0FBcEMsRUFBMkMsSUFBQyxDQUFBLElBQTVDLEVBQWtELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNoRCxLQUFDLENBQUEsS0FBRCxHQUFTLFNBQUEsR0FBQTtpQkFDVCxLQUFDLENBQUEsTUFBRCxHQUFVLFNBQUEsR0FBQTtRQUZzQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEQ7SUFEYzs7cUNBS2hCLEtBQUEsR0FBTyxTQUFBO0FBQ0wsYUFBTyxJQUFDLENBQUE7SUFESDs7cUNBR1AsZUFBQSxHQUFpQixTQUFBO0FBQ2YsVUFBQTtNQUFBLE9BQWUsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFmLEVBQUMsZ0JBQUQsRUFBTztNQUNQLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLGNBQUQsQ0FBQTtNQUVkLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsUUFBQSxDQUFTO1FBQ3ZCLFdBQUEsRUFBa0IsS0FESztRQUV2QixVQUFBLEVBQWtCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5Q0FBaEIsQ0FGSztRQUd2QixNQUFBLElBSHVCO1FBR2pCLE1BQUEsSUFIaUI7T0FBVDtNQU1oQixJQUFDLENBQUEsZUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLGtCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsa0JBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLENBQVgsQ0FBZjtJQWJlOztxQ0FlakIsZUFBQSxHQUFpQixTQUFBO01BQ2YsSUFBQyxDQUFBLFVBQVUsQ0FBQyxFQUFaLENBQWUsOEJBQWYsRUFBK0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7aUJBQzdDLEtBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUFnQixJQUFoQjtRQUQ2QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0M7TUFHQSxJQUFDLENBQUEsVUFBVSxDQUFDLEVBQVosQ0FBZSw4QkFBZixFQUErQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDN0MsSUFBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMkNBQWhCLENBQWQ7bUJBQUEsS0FBQyxDQUFBLE9BQUQsQ0FBQSxFQUFBOztRQUQ2QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0M7TUFHQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsR0FBZ0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFFaEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxFQUFWLENBQWEsTUFBYixFQUFxQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtpQkFDbkIsS0FBQyxDQUFBLEtBQUQsQ0FBTyxJQUFQO1FBRG1CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtNQUdBLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBWixDQUFlLCtCQUFmLEVBQWdELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO2lCQUM5QyxLQUFDLENBQUEsT0FBRCxHQUFXO1FBRG1DO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoRDtNQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsRUFBVixDQUFhLE9BQWIsRUFBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7aUJBQ3BCLEtBQUMsQ0FBQSxLQUFELEdBQVM7UUFEVztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7YUFHQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxNQUFmLEVBQXVCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNyQixjQUFBO1VBQUEsS0FBQyxDQUFBLFVBQUQsQ0FBQTtVQUNBLEtBQUMsQ0FBQSxvQkFBRCxDQUFBO1VBRUEsSUFBYyxxQ0FBZDtBQUFBLG1CQUFBOztVQUNBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZDQUFoQjtVQUNqQixJQUF1QyxjQUF2QztZQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sRUFBQSxHQUFHLGNBQUgsR0FBb0IsRUFBRSxDQUFDLEdBQTlCLEVBQUE7O0FBQ0E7QUFBQTtlQUFBLHNDQUFBOzt5QkFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLEVBQUEsR0FBRyxPQUFILEdBQWEsRUFBRSxDQUFDLEdBQXZCO0FBQUE7O1FBUHFCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QjtJQWpCZTs7cUNBMEJqQixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtNQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBO01BQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxrQkFBWCxDQUE4QixJQUE5QjtNQUNBLElBQUMsQ0FBQSxrQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLGtCQUFELENBQUE7TUFFQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFBLENBQUg7UUFDRSxJQUFDLENBQUEsSUFBRCxDQUFBO1FBQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQixFQUZGO09BQUEsTUFBQTtRQUlFLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBLEVBSkY7O01BTUEsSUFBRyxJQUFDLENBQUEsVUFBRCxJQUFnQixJQUFDLENBQUEsVUFBVSxDQUFDLFVBQS9CO1FBQ0UsSUFBQyxDQUFBLFVBQVUsQ0FBQyxVQUFVLENBQUMsV0FBdkIsQ0FBbUMsSUFBQyxDQUFBLFVBQXBDLEVBREY7OztZQUdXLENBQUUsU0FBYixDQUFBOztrREFDUyxDQUFFLE9BQVgsQ0FBQTtJQWpCTzs7cUNBbUJULFFBQUEsR0FBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFzQixJQUFDLENBQUEsV0FBVyxDQUFDLE9BQW5DO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBckIsQ0FBQTtNQUVBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLFVBQUQsR0FBYyxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLE1BQWpCLENBQUE7TUFDM0IsR0FBQSxHQUFNLElBQUMsQ0FBQSxXQUFXLENBQUMsUUFBYixDQUFzQixNQUF0QjtNQUNOLElBQUMsQ0FBQSxlQUFELENBQWlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsS0FBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO01BRUEsSUFBRyxJQUFDLENBQUEsU0FBSjtRQUNFLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixHQUF1QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFdBQW5CLEVBQ3JCO1VBQUEsS0FBQSxFQUFPLFlBQVA7U0FEcUI7UUFFdkIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBaEM7UUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxVQUFmO1FBQ0EsR0FBRyxDQUFDLFdBQUosQ0FBZ0Isb0JBQWhCLENBQXFDLENBQUMsUUFBdEMsQ0FBK0Msa0JBQS9DO2VBQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxNQU5mO09BQUEsTUFBQTtRQVFFLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixHQUF1QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFdBQW5CLEVBQ3JCO1VBQUEsS0FBQSxFQUFPLFFBQVA7U0FEcUI7UUFFdkIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBaEM7UUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxTQUFmO1FBQ0EsR0FBRyxDQUFDLFdBQUosQ0FBZ0Isa0JBQWhCLENBQW1DLENBQUMsUUFBcEMsQ0FBNkMsb0JBQTdDO2VBQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxLQWJmOztJQVJROztxQ0F1QlYsSUFBQSxHQUFNLFNBQUE7QUFDSixVQUFBOztRQUFBLG9CQUFxQixDQUFBLENBQUUsUUFBUSxDQUFDLGFBQVg7O01BRXJCLElBQUcsY0FBQSxJQUFtQixjQUFBLEtBQWtCLElBQXhDO1FBQ0UsSUFBRyxjQUFjLENBQUMsU0FBbEI7VUFDRSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFuQztVQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQXJCLENBQUE7VUFDQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFdBQVcsQ0FBQyxRQUFiLENBQXNCLE1BQXRCO1VBRVAsSUFBQyxDQUFBLFNBQUQsR0FBYSxjQUFjLENBQUM7VUFDNUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLEdBQXVCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsV0FBbkIsRUFDckI7WUFBQSxLQUFBLEVBQU8sUUFBUDtXQURxQjtVQUV2QixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFoQztVQUNBLElBQUksQ0FBQyxXQUFMLENBQWlCLGtCQUFqQixDQUFvQyxDQUFDLFFBQXJDLENBQThDLG9CQUE5QztVQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsS0FWZjs7UUFXQSxjQUFjLENBQUMsSUFBZixDQUFBLEVBWkY7O01BY0EsY0FBQSxHQUFpQjtNQUNqQixJQUFDLENBQUEsU0FBUyxDQUFDLHFCQUFYLENBQWlDLElBQWpDO01BQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQUE7TUFFQSxJQUFDLENBQUEsZUFBRCxDQUFpQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDZixJQUFHLENBQUksS0FBQyxDQUFBLE1BQVI7WUFDRSxLQUFDLENBQUEsTUFBRCxHQUFVO1lBQ1YsS0FBQyxDQUFBLGVBQUQsQ0FBQTtZQUNBLEtBQUMsQ0FBQSxVQUFELEdBQWMsS0FBQyxDQUFBLFVBQUQsQ0FBWSxLQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQUFaO21CQUNkLEtBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLEtBQUMsQ0FBQSxVQUFmLEVBSkY7V0FBQSxNQUFBO21CQU1FLEtBQUMsQ0FBQSxLQUFELENBQUEsRUFORjs7UUFEZTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakI7TUFTQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTtNQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLENBQWQ7TUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhO2FBQ2IsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWlCLElBQUMsQ0FBQSxTQUFKLEdBQW1CLElBQUMsQ0FBQSxTQUFwQixHQUFtQyxJQUFDLENBQUEsVUFBbEQ7SUFqQ0k7O3FDQW1DTixJQUFBLEdBQU0sU0FBQTtBQUNKLFVBQUE7O1lBQVMsQ0FBRSxJQUFYLENBQUE7O01BQ0EsY0FBQSxHQUFpQjtNQUNqQixJQUFDLENBQUEsVUFBVSxDQUFDLFVBQVosQ0FBQTtNQUVBLElBQUMsQ0FBQSxlQUFELENBQWlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNmLEtBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBO1VBQ0EsSUFBTyxzQkFBUDtZQUNFLElBQUcseUJBQUg7Y0FDRSxpQkFBaUIsQ0FBQyxLQUFsQixDQUFBO3FCQUNBLGlCQUFBLEdBQW9CLEtBRnRCO2FBREY7O1FBRmU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO01BT0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWlCLElBQUMsQ0FBQSxTQUFKLEdBQW1CLElBQUMsQ0FBQSxTQUFwQixHQUFtQyxJQUFDLENBQUEsVUFBbEQ7TUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhO2FBQ2IsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsQ0FBZDtJQWRJOztxQ0FnQk4sTUFBQSxHQUFRLFNBQUE7TUFDTixJQUFVLElBQUMsQ0FBQSxTQUFYO0FBQUEsZUFBQTs7TUFFQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFBLENBQUg7ZUFDRSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLElBQUQsQ0FBQSxFQUhGOztJQUhNOztxQ0FRUixLQUFBLEdBQU8sU0FBQyxJQUFEO01BQ0wsSUFBYyxvQ0FBZDtBQUFBLGVBQUE7O01BRUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxhQUFWLENBQUE7YUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUI7UUFBQSxLQUFBLEVBQU8sT0FBUDtRQUFnQixJQUFBLEVBQU0sSUFBdEI7T0FBakI7SUFKSzs7cUNBTVAsTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLElBQVA7TUFDTixJQUFjLG9DQUFkO0FBQUEsZUFBQTs7YUFFQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUI7UUFBQyxLQUFBLEVBQU8sUUFBUjtRQUFrQixNQUFBLElBQWxCO1FBQXdCLE1BQUEsSUFBeEI7T0FBakI7SUFITTs7cUNBS1IsVUFBQSxHQUFZLFNBQUE7QUFDVixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5QkFBaEI7TUFFVCxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBZ0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUE3QjtNQUNBLElBQWtDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBakQ7UUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBZ0IsY0FBaEIsRUFBQTs7TUFFQSxVQUFBLEdBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1CQUFoQjtNQUNiLFdBQUEsR0FBYztNQUNkLFlBQUEsR0FBZSxNQUFNLENBQUMsS0FBSyxDQUFDO01BQzVCLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUF4QixHQUFxQyxZQUFBLElBQWdCLFVBQWhCLElBQThCO01BRW5FLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0IsbUJBQXhCLEVBQTZDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO1VBQzlELFVBQUEsR0FBYSxLQUFLLENBQUM7aUJBQ25CLEtBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUF4QixHQUFxQyxZQUFBLElBQWdCLFVBQWhCLElBQThCO1FBRkw7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdDLENBQW5CO01BR0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QiwwQ0FBeEIsRUFBb0UsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7VUFDckYsWUFBQSxHQUFlLEtBQUssQ0FBQztpQkFDckIsS0FBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQXhCLEdBQXFDLFlBQUEsSUFBZ0IsVUFBaEIsSUFBOEI7UUFGa0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBFLENBQW5CO01BSUEsY0FBQSxHQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUJBQWhCO01BQ2pCLGdCQUFBLEdBQW1CLE1BQU0sQ0FBQyxLQUFLLENBQUM7TUFDaEMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQXhCLEdBQXFDLENBQUMsZ0JBQUEsSUFBb0IsY0FBckIsQ0FBQSxHQUFvQztNQUV6RSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLGlCQUF4QixFQUEyQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtVQUM1RCxjQUFBLEdBQWlCLEtBQUssQ0FBQztVQUN2QixLQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBeEIsR0FBcUMsQ0FBQyxnQkFBQSxJQUFvQixjQUFyQixDQUFBLEdBQW9DO2lCQUN6RSxLQUFDLENBQUEsb0JBQUQsQ0FBQTtRQUg0RDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0MsQ0FBbkI7TUFJQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLHdDQUF4QixFQUFrRSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtVQUNuRixnQkFBQSxHQUFtQixLQUFLLENBQUM7VUFDekIsS0FBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQXhCLEdBQXFDLENBQUMsZ0JBQUEsSUFBb0IsY0FBckIsQ0FBQSxHQUFvQztpQkFDekUsS0FBQyxDQUFBLG9CQUFELENBQUE7UUFIbUY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxFLENBQW5CO01BTUEsMkRBQXlCLENBQ3ZCLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUEvQixDQUFBLENBRHVCLEVBRXZCLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUE3QixDQUFBLENBRnVCLEVBR3ZCLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUEvQixDQUFBLENBSHVCLEVBSXZCLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFoQyxDQUFBLENBSnVCLEVBS3ZCLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUE5QixDQUFBLENBTHVCLEVBTXZCLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFqQyxDQUFBLENBTnVCLEVBT3ZCLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUE5QixDQUFBLENBUHVCLEVBUXZCLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUEvQixDQUFBLENBUnVCLENBQXpCLElBQXlCO2FBV3pCLENBQUEsMkRBQTBCLENBQ3hCLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUF0QyxDQUFBLENBRHdCLEVBRXhCLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFwQyxDQUFBLENBRndCLEVBR3hCLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUF0QyxDQUFBLENBSHdCLEVBSXhCLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxXQUF2QyxDQUFBLENBSndCLEVBS3hCLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFyQyxDQUFBLENBTHdCLEVBTXhCLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxXQUF4QyxDQUFBLENBTndCLEVBT3hCLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFyQyxDQUFBLENBUHdCLEVBUXhCLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUF0QyxDQUFBLENBUndCLENBQTFCLElBQTBCLElBQTFCO0lBM0NVOztxQ0FzRFosa0JBQUEsR0FBb0IsU0FBQTthQUNsQixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsRUFBVixDQUFhLFFBQWIsRUFBdUIsSUFBQyxDQUFBLGNBQXhCO0lBRGtCOztxQ0FHcEIsa0JBQUEsR0FBb0IsU0FBQTthQUNsQixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsR0FBVixDQUFjLFFBQWQsRUFBd0IsSUFBQyxDQUFBLGNBQXpCO0lBRGtCOztxQ0FHcEIsa0JBQUEsR0FBb0IsU0FBQTthQUNsQixJQUFDLENBQUEsWUFBWSxDQUFDLEVBQWQsQ0FBaUIsV0FBakIsRUFBOEIsSUFBQyxDQUFBLGFBQS9CO0lBRGtCOztxQ0FHcEIsa0JBQUEsR0FBb0IsU0FBQTthQUNsQixJQUFDLENBQUEsWUFBWSxDQUFDLEdBQWQsQ0FBa0IsV0FBbEI7SUFEa0I7O3FDQUdwQixjQUFBLEdBQWdCLFNBQUE7QUFDZCxVQUFBO01BQUEsSUFBRyxDQUFJLElBQUMsQ0FBQSxPQUFSO1FBQ0UsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsWUFBWCxFQUF5QixFQUF6QjtRQUNBLFNBQUEsR0FBWSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBO1FBQ1osV0FBQSxHQUFjLENBQUEsQ0FBRSw2QkFBRixDQUFnQyxDQUFDLEtBQWpDLENBQUEsQ0FBd0MsQ0FBQyxHQUF6QyxDQUE2QyxDQUE3QztRQUNkLFFBQUEsR0FBVyxXQUFXLENBQUMsWUFBWixHQUEyQixXQUFXLENBQUM7UUFFbEQsS0FBQSxHQUFRLFNBQUEsR0FBWSxJQUFDLENBQUE7UUFDckIsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7UUFFaEIsSUFBRyxJQUFDLENBQUEsU0FBSjtVQUNFLE9BQUEsR0FBVSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUMsQ0FBQSxTQUFELEdBQWEsS0FBdEIsRUFBNkIsSUFBQyxDQUFBLFNBQTlCO1VBRVYsSUFBeUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQUEsQ0FBekI7WUFBQSxJQUFDLENBQUEsWUFBRCxDQUFjLE9BQWQsRUFBQTs7VUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhO1VBRWIsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUMsQ0FBQSxVQUFWLEVBQXNCLElBQUMsQ0FBQSxTQUF2QixFQU5oQjtTQUFBLE1BT0ssSUFBRyxRQUFBLEdBQVcsQ0FBZDtVQUNILE9BQUEsR0FBVSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUMsQ0FBQSxVQUFELENBQVksSUFBQyxDQUFBLFVBQUQsR0FBYyxLQUExQixDQUFULEVBQTJDLElBQUMsQ0FBQSxTQUE1QztVQUVWLElBQXlCLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFBLENBQXpCO1lBQUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxPQUFkLEVBQUE7O1VBQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxRQUpYOztRQU1MLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFlBQVgsRUFBeUIsU0FBQSxHQUFTLENBQUMsSUFBQSxHQUFPLElBQUMsQ0FBQSxjQUFULENBQVQsR0FBaUMsVUFBMUQsRUF0QkY7O2FBdUJBLElBQUMsQ0FBQSxvQkFBRCxDQUFBO0lBeEJjOztxQ0EwQmhCLGFBQUEsR0FBZSxTQUFBO01BQ2IsSUFBVSxJQUFDLENBQUEsU0FBWDtBQUFBLGVBQUE7O01BQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsVUFBRCxHQUFjLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsTUFBakIsQ0FBQTtNQUMzQixDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLFdBQWYsRUFBNEIsSUFBQyxDQUFBLFdBQTdCO01BQ0EsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEVBQVosQ0FBZSxTQUFmLEVBQTBCLElBQUMsQ0FBQSxhQUEzQjthQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFlBQVgsRUFBeUIsRUFBekI7SUFMYTs7cUNBT2YsYUFBQSxHQUFlLFNBQUE7TUFDYixDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsR0FBWixDQUFnQixXQUFoQixFQUE2QixJQUFDLENBQUEsV0FBOUI7TUFDQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsR0FBWixDQUFnQixTQUFoQixFQUEyQixJQUFDLENBQUEsYUFBNUI7YUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLEVBQXlCLFNBQUEsR0FBUyxDQUFDLElBQUEsR0FBTyxJQUFDLENBQUEsY0FBVCxDQUFULEdBQWlDLFVBQTFEO0lBSGE7O3FDQUtmLFVBQUEsR0FBWSxTQUFDLEtBQUQ7QUFDVixVQUFBO01BQUEsSUFBQSxjQUFPLFFBQVMsSUFBQyxDQUFBO0FBQ2pCLGFBQU8sSUFBQSxHQUFPLElBQUMsQ0FBQTtJQUZMOztxQ0FJWixXQUFBLEdBQWEsU0FBQyxLQUFEO0FBQ1gsVUFBQTtNQUFBLElBQStCLEtBQUssQ0FBQyxLQUFOLEtBQWUsQ0FBOUM7QUFBQSxlQUFPLElBQUMsQ0FBQSxhQUFELENBQUEsRUFBUDs7TUFFQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBQSxDQUFBLEdBQXFCLEtBQUssQ0FBQztNQUNwQyxLQUFBLEdBQVEsTUFBQSxHQUFTLENBQUEsQ0FBRSw2QkFBRixDQUFnQyxDQUFDLE1BQWpDLENBQUE7TUFDakIsSUFBQSxDQUFBLENBQWMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQUEsR0FBa0IsQ0FBQyxJQUFDLENBQUEsU0FBRCxHQUFhLENBQWIsR0FBaUIsQ0FBbEIsQ0FBaEMsQ0FBQTtBQUFBLGVBQUE7O01BRUEsT0FBQSxHQUFVLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBQTFCLENBQVQsRUFBMkMsSUFBQyxDQUFBLFNBQTVDO01BQ1YsSUFBVSxPQUFBLEdBQVUsSUFBQyxDQUFBLFNBQXJCO0FBQUEsZUFBQTs7TUFFQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxPQUFkO01BQ0EsQ0FBQSxDQUFFLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBWixDQUFvQixDQUFDLE1BQXJCLENBQTRCLE9BQTVCO01BQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYzthQUVkLElBQUMsQ0FBQSxvQkFBRCxDQUFBO0lBZFc7O3FDQWdCYixZQUFBLEdBQWMsU0FBQyxNQUFEO01BQ1osSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsTUFBZDthQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVosQ0FBb0IsQ0FBQyxNQUFyQixDQUE0QixNQUE1QjtJQUZZOztxQ0FJZCxJQUFBLEdBQU0sU0FBQTtBQUNKLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBYjtRQUNFLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBUSxDQUFDLGVBQVYsQ0FBQTtRQUNYLElBQUEsR0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FDTCxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQURmLEVBQ21CLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBUyxDQUFDLEVBRHZDLEVBRUwsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFGZixFQUVtQixJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUZ2QyxFQUZUO09BQUEsTUFBQTtRQU1FLE9BQUEsR0FBVSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxZQUFsQixDQUFBLENBQWdDLENBQUMsUUFBakMsQ0FBQTtRQUNWLFFBQUEsR0FBVyxPQUFPLENBQUMsS0FBUixDQUFjLFFBQWQ7UUFDWCxLQUFBLEdBQVEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxTQUFDLElBQUQ7aUJBQ25CLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBYixFQUFvQixHQUFwQixDQUF3QixDQUFDLFNBQXpCLENBQUE7UUFEbUIsQ0FBYjtRQUVSLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsRUFWVDs7YUFXQSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQWYsQ0FBcUIsSUFBckI7SUFaSTs7cUNBY04sS0FBQSxHQUFPLFNBQUE7YUFDTCxJQUFDLENBQUEsS0FBRCxDQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFBLENBQVA7SUFESzs7cUNBR1AsZUFBQSxHQUFpQixTQUFDLFVBQUQ7QUFDZixVQUFBO01BQUEsSUFBQSxDQUFjLENBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQWQ7QUFBQSxlQUFBOztNQUNBLFVBQUEsR0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaURBQWhCO01BQ2IsYUFBQSxHQUFnQjtNQUNoQixJQUFHLFNBQUEsR0FBWSxNQUFNLENBQUMsZUFBUCxDQUFBLENBQWY7UUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLGFBQVYsQ0FBQTtRQUNBLGFBQUEsR0FBZ0IsVUFGbEI7T0FBQSxNQUdLLElBQUcsTUFBQSxHQUFTLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQVo7UUFDSCxJQUFBLEdBQU8sTUFBTSxDQUFDLG9CQUFQLENBQTRCLE1BQU0sQ0FBQyxHQUFuQztRQUNQLElBQUMsQ0FBQSxRQUFRLENBQUMsYUFBVixDQUFBO1FBQ0EsYUFBQSxHQUFnQjtRQUNoQixNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFoQixFQUpHOzthQUtMLElBQUMsQ0FBQSxLQUFELENBQU8sRUFBQSxHQUFFLENBQUMsVUFBVSxDQUNsQixPQURRLENBQ0EsS0FEQSxFQUNPLEVBQUEsR0FBRSxDQUFDLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQWdDLENBQUMsR0FBakMsR0FBdUMsQ0FBeEMsQ0FEVCxDQUNxRCxDQUM3RCxPQUZRLENBRUEsS0FGQSxFQUVPLElBQUksQ0FBQyxRQUFMLG9GQUFrQyxDQUFFLCtCQUFwQyxDQUZQLENBRWlELENBQ3pELE9BSFEsQ0FHQSxLQUhBLEVBR08sSUFBSSxDQUFDLE9BQUwsb0ZBQWlDLENBQUUsK0JBQW5DLENBSFAsQ0FHZ0QsQ0FDeEQsT0FKUSxDQUlBLEtBSkEsRUFJTyxhQUpQLENBSXFCLENBQzdCLE9BTFEsQ0FLQSxNQUxBLEVBS1EsR0FMUixDQUFELENBQUYsR0FLaUIsQ0FBSSxVQUFILEdBQW1CLEVBQUUsQ0FBQyxHQUF0QixHQUErQixFQUFoQyxDQUx4QjtJQVplOztxQ0FtQmpCLEtBQUEsR0FBTyxTQUFBO01BQ0wsSUFBQyxDQUFBLG9CQUFELENBQUE7TUFDQSxJQUFDLENBQUEsYUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxxQkFBWCxDQUFpQyxJQUFqQzthQUNBLGdEQUFBO0lBSks7O3FDQU1QLElBQUEsR0FBTSxTQUFBO01BQ0osSUFBQyxDQUFBLFlBQUQsQ0FBQTthQUNBLCtDQUFBO0lBRkk7O3FDQUlOLGFBQUEsR0FBZSxTQUFBO01BQ2IsSUFBQSxDQUFjLElBQUMsQ0FBQSxRQUFmO0FBQUEsZUFBQTs7TUFFQSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBQTtNQUNBLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFiO2VBQ0UsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBcEIsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQWxCLENBQUEsRUFIRjs7SUFKYTs7cUNBU2YsWUFBQSxHQUFjLFNBQUE7TUFDWixJQUFBLENBQWMsSUFBQyxDQUFBLFFBQWY7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBbEIsQ0FBQTtJQUpZOztxQ0FNZCxvQkFBQSxHQUFzQixTQUFBO0FBQ3BCLFVBQUE7TUFBQSxJQUFBLENBQUEsQ0FBYyxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBQSxDQUFBLElBQXNCLElBQUMsQ0FBQSxPQUFyQyxDQUFBO0FBQUEsZUFBQTs7TUFFQSxPQUFlLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBZixFQUFDLGdCQUFELEVBQU87TUFDUCxJQUFBLENBQUEsQ0FBYyxJQUFBLEdBQU8sQ0FBUCxJQUFhLElBQUEsR0FBTyxDQUFsQyxDQUFBO0FBQUEsZUFBQTs7TUFDQSxJQUFBLENBQWMsSUFBQyxDQUFBLFFBQWY7QUFBQSxlQUFBOztNQUNBLElBQVUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLEtBQWtCLElBQWxCLElBQTJCLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixLQUFrQixJQUF2RDtBQUFBLGVBQUE7O01BRUEsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFSLEVBQWMsSUFBZDthQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixJQUFqQixFQUF1QixJQUF2QjtJQVRvQjs7cUNBV3RCLGFBQUEsR0FBZSxTQUFBO0FBQ2IsVUFBQTtNQUFBLE9BQUEsR0FBVSxDQUFBLENBQUUsZ0NBQUY7TUFFVixJQUFHLElBQUMsQ0FBQSxRQUFKO1FBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBTSxXQUFOLENBQWtCLENBQUMsTUFBbkIsQ0FBMEIsT0FBMUI7UUFDQSxPQUFBLEdBQVUsT0FBTyxDQUFDLFFBQVIsQ0FBQSxDQUFrQixDQUFDLEtBQW5CLENBQUEsQ0FBMkIsQ0FBQSxDQUFBLENBQUUsQ0FBQyxxQkFBOUIsQ0FBQTtRQUNWLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBLENBQUEsR0FBaUIsQ0FBQyxPQUFPLENBQUMsS0FBUixJQUFpQixDQUFsQixDQUE1QjtRQUNQLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFBLENBQUEsR0FBa0IsQ0FBQyxPQUFPLENBQUMsTUFBUixJQUFrQixFQUFuQixDQUE3QjtRQUNQLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDO1FBQ3JCLE9BQU8sQ0FBQyxNQUFSLENBQUEsRUFORjtPQUFBLE1BQUE7UUFRRSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQSxDQUFBLEdBQWlCLENBQTVCO1FBQ1AsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FBQSxHQUFrQixFQUE3QixFQVRUOzthQVdBO1FBQUMsTUFBQSxJQUFEO1FBQU8sTUFBQSxJQUFQOztJQWRhOztxQ0FnQmYsZUFBQSxHQUFpQixTQUFDLFFBQUQ7YUFDZixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxxQkFBWCxFQUFrQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDaEMsUUFBQSxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxTQUFELEdBQWE7UUFGbUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDO0lBRGU7O3FDQUtqQixXQUFBLEdBQWEsU0FBQTtBQUNYLFVBQUE7O1FBQUEsY0FBZSxPQUFBLENBQVEsZ0JBQVI7O01BQ2YsTUFBQSxHQUFhLElBQUEsV0FBQSxDQUFZLElBQVo7YUFDYixNQUFNLENBQUMsTUFBUCxDQUFBO0lBSFc7O3FDQUtiLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQUE7SUFETTs7cUNBR1IsYUFBQSxHQUFlLFNBQUE7TUFDYixJQUFHLElBQUMsQ0FBQSxPQUFKO1FBQ0UsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWYsQ0FBOEI7VUFBQSxJQUFBLEVBQU0sSUFBTjtVQUFZLE9BQUEsRUFBUyxLQUFyQjtTQUE5QjtRQUNULElBQUMsQ0FBQSxrQkFBRCxDQUFBO1FBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQUE7UUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBQTtRQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFBO2VBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxNQU5iO09BQUEsTUFBQTtRQVFFLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBO1FBQ0EsSUFBQyxDQUFBLGtCQUFELENBQUE7UUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBQTtRQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFBO1FBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQUE7UUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLEVBQXFCLEVBQXJCO1FBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztRQUNYLElBQXlCLGNBQUEsS0FBa0IsSUFBM0M7aUJBQUEsY0FBQSxHQUFpQixLQUFqQjtTQWZGOztJQURhOztxQ0FrQmYsUUFBQSxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQSxDQUFBLElBQXlCO0lBRGpCOztxQ0FHVixXQUFBLEdBQWEsU0FBQTthQUNYO0lBRFc7O3FDQUdiLFFBQUEsR0FBVSxTQUFBO0FBQ1IsYUFBTyxJQUFJLENBQUMsUUFBTCxDQUFjLElBQUMsQ0FBQSxLQUFmO0lBREM7O3FDQUdWLFlBQUEsR0FBYyxTQUFBO0FBQ1osYUFBTyxJQUFDLENBQUE7SUFESTs7cUNBR2QsSUFBQSxHQUFNLFNBQUMsS0FBRCxFQUFRLElBQVI7YUFDSixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxLQUFkLEVBQXFCLElBQXJCO0lBREk7O3FDQUdOLGdCQUFBLEdBQWtCLFNBQUMsUUFBRDthQUNoQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxrQkFBWixFQUFnQyxRQUFoQztJQURnQjs7cUNBR2xCLE9BQUEsR0FBUyxTQUFBO0FBQ1AsYUFBTyxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtJQURBOztxQ0FHVCxnQkFBQSxHQUFrQixTQUFBO0FBQ2hCLGFBQU8sSUFBQyxDQUFBLEtBQUQsSUFBVSxJQUFDLENBQUE7SUFERjs7cUNBR2xCLFdBQUEsR0FBYSxTQUFBO0FBQ1gsYUFBTyxJQUFDLENBQUE7SUFERzs7cUNBR2IsV0FBQSxHQUFhLFNBQUE7QUFDWCxhQUFPLElBQUMsQ0FBQTtJQURHOzs7O0tBamhCc0I7QUFkckMiLCJzb3VyY2VzQ29udGVudCI6WyJ7VGFzaywgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gPSByZXF1aXJlICdhdG9tJ1xueyQsIFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cblB0eSA9IHJlcXVpcmUucmVzb2x2ZSAnLi9wcm9jZXNzJ1xuVGVybWluYWwgPSByZXF1aXJlICd0ZXJtLmpzJ1xuSW5wdXREaWFsb2cgPSBudWxsXG5cbnBhdGggPSByZXF1aXJlICdwYXRoJ1xub3MgPSByZXF1aXJlICdvcydcblxubGFzdE9wZW5lZFZpZXcgPSBudWxsXG5sYXN0QWN0aXZlRWxlbWVudCA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUGxhdGZvcm1JT1Rlcm1pbmFsVmlldyBleHRlbmRzIFZpZXdcbiAgYW5pbWF0aW5nOiBmYWxzZVxuICBpZDogJydcbiAgbWF4aW1pemVkOiBmYWxzZVxuICBvcGVuZWQ6IGZhbHNlXG4gIHB3ZDogJydcbiAgd2luZG93SGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KClcbiAgcm93SGVpZ2h0OiAyMFxuICBzaGVsbDogJydcbiAgdGFiVmlldzogZmFsc2VcblxuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAncGxhdGZvcm1pby1pZGUtdGVybWluYWwgdGVybWluYWwtdmlldycsIG91dGxldDogJ3BsYXRmb3JtSU9UZXJtaW5hbFZpZXcnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ3BhbmVsLWRpdmlkZXInLCBvdXRsZXQ6ICdwYW5lbERpdmlkZXInXG4gICAgICBAZGl2IGNsYXNzOiAnYnRuLXRvb2xiYXInLCBvdXRsZXQ6J3Rvb2xiYXInLCA9PlxuICAgICAgICBAYnV0dG9uIG91dGxldDogJ2Nsb3NlQnRuJywgY2xhc3M6ICdidG4gaW5saW5lLWJsb2NrLXRpZ2h0IHJpZ2h0JywgY2xpY2s6ICdkZXN0cm95JywgPT5cbiAgICAgICAgICBAc3BhbiBjbGFzczogJ2ljb24gaWNvbi14J1xuICAgICAgICBAYnV0dG9uIG91dGxldDogJ2hpZGVCdG4nLCBjbGFzczogJ2J0biBpbmxpbmUtYmxvY2stdGlnaHQgcmlnaHQnLCBjbGljazogJ2hpZGUnLCA9PlxuICAgICAgICAgIEBzcGFuIGNsYXNzOiAnaWNvbiBpY29uLWNoZXZyb24tZG93bidcbiAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdtYXhpbWl6ZUJ0bicsIGNsYXNzOiAnYnRuIGlubGluZS1ibG9jay10aWdodCByaWdodCcsIGNsaWNrOiAnbWF4aW1pemUnLCA9PlxuICAgICAgICAgIEBzcGFuIGNsYXNzOiAnaWNvbiBpY29uLXNjcmVlbi1mdWxsJ1xuICAgICAgICBAYnV0dG9uIG91dGxldDogJ2lucHV0QnRuJywgY2xhc3M6ICdidG4gaW5saW5lLWJsb2NrLXRpZ2h0IGxlZnQnLCBjbGljazogJ2lucHV0RGlhbG9nJywgPT5cbiAgICAgICAgICBAc3BhbiBjbGFzczogJ2ljb24gaWNvbi1rZXlib2FyZCdcbiAgICAgIEBkaXYgY2xhc3M6ICd4dGVybScsIG91dGxldDogJ3h0ZXJtJ1xuXG4gIEBnZXRGb2N1c2VkVGVybWluYWw6IC0+XG4gICAgcmV0dXJuIFRlcm1pbmFsLlRlcm1pbmFsLmZvY3VzXG5cbiAgaW5pdGlhbGl6ZTogKEBpZCwgQHB3ZCwgQHN0YXR1c0ljb24sIEBzdGF0dXNCYXIsIEBzaGVsbCwgQGFyZ3M9W10sIEBhdXRvUnVuPVtdKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGNsb3NlQnRuLFxuICAgICAgdGl0bGU6ICdDbG9zZSdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGhpZGVCdG4sXG4gICAgICB0aXRsZTogJ0hpZGUnXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBtYXhpbWl6ZUJ0bi50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQgQG1heGltaXplQnRuLFxuICAgICAgdGl0bGU6ICdGdWxsc2NyZWVuJ1xuICAgIEBpbnB1dEJ0bi50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQgQGlucHV0QnRuLFxuICAgICAgdGl0bGU6ICdJbnNlcnQgVGV4dCdcblxuICAgIEBwcmV2SGVpZ2h0ID0gYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5zdHlsZS5kZWZhdWx0UGFuZWxIZWlnaHQnKVxuICAgIGlmIEBwcmV2SGVpZ2h0LmluZGV4T2YoJyUnKSA+IDBcbiAgICAgIHBlcmNlbnQgPSBNYXRoLmFicyhNYXRoLm1pbihwYXJzZUZsb2F0KEBwcmV2SGVpZ2h0KSAvIDEwMC4wLCAxKSlcbiAgICAgIGJvdHRvbUhlaWdodCA9ICQoJ2F0b20tcGFuZWwuYm90dG9tJykuY2hpbGRyZW4oXCIudGVybWluYWwtdmlld1wiKS5oZWlnaHQoKSBvciAwXG4gICAgICBAcHJldkhlaWdodCA9IHBlcmNlbnQgKiAoJCgnLml0ZW0tdmlld3MnKS5oZWlnaHQoKSArIGJvdHRvbUhlaWdodClcbiAgICBAeHRlcm0uaGVpZ2h0IDBcblxuICAgIEBzZXRBbmltYXRpb25TcGVlZCgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5zdHlsZS5hbmltYXRpb25TcGVlZCcsIEBzZXRBbmltYXRpb25TcGVlZFxuXG4gICAgb3ZlcnJpZGUgPSAoZXZlbnQpIC0+XG4gICAgICByZXR1cm4gaWYgZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YSgncGxhdGZvcm1pby1pZGUtdGVybWluYWwnKSBpcyAndHJ1ZSdcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICBAeHRlcm0ub24gJ21vdXNldXAnLCAoZXZlbnQpID0+XG4gICAgICBpZiBldmVudC53aGljaCAhPSAzXG4gICAgICAgIHRleHQgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkudG9TdHJpbmcoKVxuICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSh0ZXh0KSBpZiBhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLnRvZ2dsZXMuc2VsZWN0VG9Db3B5JykgYW5kIHRleHRcbiAgICAgICAgdW5sZXNzIHRleHRcbiAgICAgICAgICBAZm9jdXMoKVxuICAgIEB4dGVybS5vbiAnZHJhZ2VudGVyJywgb3ZlcnJpZGVcbiAgICBAeHRlcm0ub24gJ2RyYWdvdmVyJywgb3ZlcnJpZGVcbiAgICBAeHRlcm0ub24gJ2Ryb3AnLCBAcmVjaWV2ZUl0ZW1PckZpbGVcblxuICAgIEBvbiAnZm9jdXMnLCBAZm9jdXNcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZGlzcG9zZTogPT5cbiAgICAgIEBvZmYgJ2ZvY3VzJywgQGZvY3VzXG5cbiAgYXR0YWNoOiAtPlxuICAgIHJldHVybiBpZiBAcGFuZWw/XG4gICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoaXRlbTogdGhpcywgdmlzaWJsZTogZmFsc2UpXG5cbiAgc2V0QW5pbWF0aW9uU3BlZWQ6ID0+XG4gICAgQGFuaW1hdGlvblNwZWVkID0gYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5zdHlsZS5hbmltYXRpb25TcGVlZCcpXG4gICAgQGFuaW1hdGlvblNwZWVkID0gMTAwIGlmIEBhbmltYXRpb25TcGVlZCBpcyAwXG5cbiAgICBAeHRlcm0uY3NzICd0cmFuc2l0aW9uJywgXCJoZWlnaHQgI3swLjI1IC8gQGFuaW1hdGlvblNwZWVkfXMgbGluZWFyXCJcblxuICByZWNpZXZlSXRlbU9yRmlsZTogKGV2ZW50KSA9PlxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIHtkYXRhVHJhbnNmZXJ9ID0gZXZlbnQub3JpZ2luYWxFdmVudFxuXG4gICAgaWYgZGF0YVRyYW5zZmVyLmdldERhdGEoJ2F0b20tZXZlbnQnKSBpcyAndHJ1ZSdcbiAgICAgIGZpbGVQYXRoID0gZGF0YVRyYW5zZmVyLmdldERhdGEoJ3RleHQvcGxhaW4nKVxuICAgICAgQGlucHV0IFwiI3tmaWxlUGF0aH0gXCIgaWYgZmlsZVBhdGhcbiAgICBlbHNlIGlmIGZpbGVQYXRoID0gZGF0YVRyYW5zZmVyLmdldERhdGEoJ2luaXRpYWxQYXRoJylcbiAgICAgIEBpbnB1dCBcIiN7ZmlsZVBhdGh9IFwiXG4gICAgZWxzZSBpZiBkYXRhVHJhbnNmZXIuZmlsZXMubGVuZ3RoID4gMFxuICAgICAgZm9yIGZpbGUgaW4gZGF0YVRyYW5zZmVyLmZpbGVzXG4gICAgICAgIEBpbnB1dCBcIiN7ZmlsZS5wYXRofSBcIlxuXG4gIGZvcmtQdHlQcm9jZXNzOiAtPlxuICAgIFRhc2sub25jZSBQdHksIHBhdGgucmVzb2x2ZShAcHdkKSwgQHNoZWxsLCBAYXJncywgPT5cbiAgICAgIEBpbnB1dCA9IC0+XG4gICAgICBAcmVzaXplID0gLT5cblxuICBnZXRJZDogLT5cbiAgICByZXR1cm4gQGlkXG5cbiAgZGlzcGxheVRlcm1pbmFsOiAtPlxuICAgIHtjb2xzLCByb3dzfSA9IEBnZXREaW1lbnNpb25zKClcbiAgICBAcHR5UHJvY2VzcyA9IEBmb3JrUHR5UHJvY2VzcygpXG5cbiAgICBAdGVybWluYWwgPSBuZXcgVGVybWluYWwge1xuICAgICAgY3Vyc29yQmxpbmsgICAgIDogZmFsc2VcbiAgICAgIHNjcm9sbGJhY2sgICAgICA6IGF0b20uY29uZmlnLmdldCAncGxhdGZvcm1pby1pZGUtdGVybWluYWwuY29yZS5zY3JvbGxiYWNrJ1xuICAgICAgY29scywgcm93c1xuICAgIH1cblxuICAgIEBhdHRhY2hMaXN0ZW5lcnMoKVxuICAgIEBhdHRhY2hSZXNpemVFdmVudHMoKVxuICAgIEBhdHRhY2hXaW5kb3dFdmVudHMoKVxuICAgIEB0ZXJtaW5hbC5vcGVuIEB4dGVybS5nZXQoMClcblxuICBhdHRhY2hMaXN0ZW5lcnM6IC0+XG4gICAgQHB0eVByb2Nlc3Mub24gXCJwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpkYXRhXCIsIChkYXRhKSA9PlxuICAgICAgQHRlcm1pbmFsLndyaXRlIGRhdGFcblxuICAgIEBwdHlQcm9jZXNzLm9uIFwicGxhdGZvcm1pby1pZGUtdGVybWluYWw6ZXhpdFwiLCA9PlxuICAgICAgQGRlc3Ryb3koKSBpZiBhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLnRvZ2dsZXMuYXV0b0Nsb3NlJylcblxuICAgIEB0ZXJtaW5hbC5lbmQgPSA9PiBAZGVzdHJveSgpXG5cbiAgICBAdGVybWluYWwub24gXCJkYXRhXCIsIChkYXRhKSA9PlxuICAgICAgQGlucHV0IGRhdGFcblxuICAgIEBwdHlQcm9jZXNzLm9uIFwicGxhdGZvcm1pby1pZGUtdGVybWluYWw6dGl0bGVcIiwgKHRpdGxlKSA9PlxuICAgICAgQHByb2Nlc3MgPSB0aXRsZVxuICAgIEB0ZXJtaW5hbC5vbiBcInRpdGxlXCIsICh0aXRsZSkgPT5cbiAgICAgIEB0aXRsZSA9IHRpdGxlXG5cbiAgICBAdGVybWluYWwub25jZSBcIm9wZW5cIiwgPT5cbiAgICAgIEBhcHBseVN0eWxlKClcbiAgICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG5cbiAgICAgIHJldHVybiB1bmxlc3MgQHB0eVByb2Nlc3MuY2hpbGRQcm9jZXNzP1xuICAgICAgYXV0b1J1bkNvbW1hbmQgPSBhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLmNvcmUuYXV0b1J1bkNvbW1hbmQnKVxuICAgICAgQGlucHV0IFwiI3thdXRvUnVuQ29tbWFuZH0je29zLkVPTH1cIiBpZiBhdXRvUnVuQ29tbWFuZFxuICAgICAgQGlucHV0IFwiI3tjb21tYW5kfSN7b3MuRU9MfVwiIGZvciBjb21tYW5kIGluIEBhdXRvUnVuXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAc3RhdHVzSWNvbi5kZXN0cm95KClcbiAgICBAc3RhdHVzQmFyLnJlbW92ZVRlcm1pbmFsVmlldyB0aGlzXG4gICAgQGRldGFjaFJlc2l6ZUV2ZW50cygpXG4gICAgQGRldGFjaFdpbmRvd0V2ZW50cygpXG5cbiAgICBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgIEBoaWRlKClcbiAgICAgIEBvblRyYW5zaXRpb25FbmQgPT4gQHBhbmVsLmRlc3Ryb3koKVxuICAgIGVsc2VcbiAgICAgIEBwYW5lbC5kZXN0cm95KClcblxuICAgIGlmIEBzdGF0dXNJY29uIGFuZCBAc3RhdHVzSWNvbi5wYXJlbnROb2RlXG4gICAgICBAc3RhdHVzSWNvbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKEBzdGF0dXNJY29uKVxuXG4gICAgQHB0eVByb2Nlc3M/LnRlcm1pbmF0ZSgpXG4gICAgQHRlcm1pbmFsPy5kZXN0cm95KClcblxuICBtYXhpbWl6ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUgQG1heGltaXplQnRuLnRvb2x0aXBcbiAgICBAbWF4aW1pemVCdG4udG9vbHRpcC5kaXNwb3NlKClcblxuICAgIEBtYXhIZWlnaHQgPSBAcHJldkhlaWdodCArICQoJy5pdGVtLXZpZXdzJykuaGVpZ2h0KClcbiAgICBidG4gPSBAbWF4aW1pemVCdG4uY2hpbGRyZW4oJ3NwYW4nKVxuICAgIEBvblRyYW5zaXRpb25FbmQgPT4gQGZvY3VzKClcblxuICAgIGlmIEBtYXhpbWl6ZWRcbiAgICAgIEBtYXhpbWl6ZUJ0bi50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQgQG1heGltaXplQnRuLFxuICAgICAgICB0aXRsZTogJ0Z1bGxzY3JlZW4nXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1heGltaXplQnRuLnRvb2x0aXBcbiAgICAgIEBhZGp1c3RIZWlnaHQgQHByZXZIZWlnaHRcbiAgICAgIGJ0bi5yZW1vdmVDbGFzcygnaWNvbi1zY3JlZW4tbm9ybWFsJykuYWRkQ2xhc3MoJ2ljb24tc2NyZWVuLWZ1bGwnKVxuICAgICAgQG1heGltaXplZCA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgQG1heGltaXplQnRuLnRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCBAbWF4aW1pemVCdG4sXG4gICAgICAgIHRpdGxlOiAnTm9ybWFsJ1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBtYXhpbWl6ZUJ0bi50b29sdGlwXG4gICAgICBAYWRqdXN0SGVpZ2h0IEBtYXhIZWlnaHRcbiAgICAgIGJ0bi5yZW1vdmVDbGFzcygnaWNvbi1zY3JlZW4tZnVsbCcpLmFkZENsYXNzKCdpY29uLXNjcmVlbi1ub3JtYWwnKVxuICAgICAgQG1heGltaXplZCA9IHRydWVcblxuICBvcGVuOiA9PlxuICAgIGxhc3RBY3RpdmVFbGVtZW50ID89ICQoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcblxuICAgIGlmIGxhc3RPcGVuZWRWaWV3IGFuZCBsYXN0T3BlbmVkVmlldyAhPSB0aGlzXG4gICAgICBpZiBsYXN0T3BlbmVkVmlldy5tYXhpbWl6ZWRcbiAgICAgICAgQHN1YnNjcmlwdGlvbnMucmVtb3ZlIEBtYXhpbWl6ZUJ0bi50b29sdGlwXG4gICAgICAgIEBtYXhpbWl6ZUJ0bi50b29sdGlwLmRpc3Bvc2UoKVxuICAgICAgICBpY29uID0gQG1heGltaXplQnRuLmNoaWxkcmVuKCdzcGFuJylcblxuICAgICAgICBAbWF4SGVpZ2h0ID0gbGFzdE9wZW5lZFZpZXcubWF4SGVpZ2h0XG4gICAgICAgIEBtYXhpbWl6ZUJ0bi50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQgQG1heGltaXplQnRuLFxuICAgICAgICAgIHRpdGxlOiAnTm9ybWFsJ1xuICAgICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1heGltaXplQnRuLnRvb2x0aXBcbiAgICAgICAgaWNvbi5yZW1vdmVDbGFzcygnaWNvbi1zY3JlZW4tZnVsbCcpLmFkZENsYXNzKCdpY29uLXNjcmVlbi1ub3JtYWwnKVxuICAgICAgICBAbWF4aW1pemVkID0gdHJ1ZVxuICAgICAgbGFzdE9wZW5lZFZpZXcuaGlkZSgpXG5cbiAgICBsYXN0T3BlbmVkVmlldyA9IHRoaXNcbiAgICBAc3RhdHVzQmFyLnNldEFjdGl2ZVRlcm1pbmFsVmlldyB0aGlzXG4gICAgQHN0YXR1c0ljb24uYWN0aXZhdGUoKVxuXG4gICAgQG9uVHJhbnNpdGlvbkVuZCA9PlxuICAgICAgaWYgbm90IEBvcGVuZWRcbiAgICAgICAgQG9wZW5lZCA9IHRydWVcbiAgICAgICAgQGRpc3BsYXlUZXJtaW5hbCgpXG4gICAgICAgIEBwcmV2SGVpZ2h0ID0gQG5lYXJlc3RSb3coQHh0ZXJtLmhlaWdodCgpKVxuICAgICAgICBAeHRlcm0uaGVpZ2h0KEBwcmV2SGVpZ2h0KVxuICAgICAgZWxzZVxuICAgICAgICBAZm9jdXMoKVxuXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEB4dGVybS5oZWlnaHQgMFxuICAgIEBhbmltYXRpbmcgPSB0cnVlXG4gICAgQHh0ZXJtLmhlaWdodCBpZiBAbWF4aW1pemVkIHRoZW4gQG1heEhlaWdodCBlbHNlIEBwcmV2SGVpZ2h0XG5cbiAgaGlkZTogPT5cbiAgICBAdGVybWluYWw/LmJsdXIoKVxuICAgIGxhc3RPcGVuZWRWaWV3ID0gbnVsbFxuICAgIEBzdGF0dXNJY29uLmRlYWN0aXZhdGUoKVxuXG4gICAgQG9uVHJhbnNpdGlvbkVuZCA9PlxuICAgICAgQHBhbmVsLmhpZGUoKVxuICAgICAgdW5sZXNzIGxhc3RPcGVuZWRWaWV3P1xuICAgICAgICBpZiBsYXN0QWN0aXZlRWxlbWVudD9cbiAgICAgICAgICBsYXN0QWN0aXZlRWxlbWVudC5mb2N1cygpXG4gICAgICAgICAgbGFzdEFjdGl2ZUVsZW1lbnQgPSBudWxsXG5cbiAgICBAeHRlcm0uaGVpZ2h0IGlmIEBtYXhpbWl6ZWQgdGhlbiBAbWF4SGVpZ2h0IGVsc2UgQHByZXZIZWlnaHRcbiAgICBAYW5pbWF0aW5nID0gdHJ1ZVxuICAgIEB4dGVybS5oZWlnaHQgMFxuXG4gIHRvZ2dsZTogLT5cbiAgICByZXR1cm4gaWYgQGFuaW1hdGluZ1xuXG4gICAgaWYgQHBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICBAaGlkZSgpXG4gICAgZWxzZVxuICAgICAgQG9wZW4oKVxuXG4gIGlucHV0OiAoZGF0YSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBwdHlQcm9jZXNzLmNoaWxkUHJvY2Vzcz9cblxuICAgIEB0ZXJtaW5hbC5zdG9wU2Nyb2xsaW5nKClcbiAgICBAcHR5UHJvY2Vzcy5zZW5kIGV2ZW50OiAnaW5wdXQnLCB0ZXh0OiBkYXRhXG5cbiAgcmVzaXplOiAoY29scywgcm93cykgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBwdHlQcm9jZXNzLmNoaWxkUHJvY2Vzcz9cblxuICAgIEBwdHlQcm9jZXNzLnNlbmQge2V2ZW50OiAncmVzaXplJywgcm93cywgY29sc31cblxuICBhcHBseVN0eWxlOiAtPlxuICAgIGNvbmZpZyA9IGF0b20uY29uZmlnLmdldCAncGxhdGZvcm1pby1pZGUtdGVybWluYWwnXG5cbiAgICBAeHRlcm0uYWRkQ2xhc3MgY29uZmlnLnN0eWxlLnRoZW1lXG4gICAgQHh0ZXJtLmFkZENsYXNzICdjdXJzb3ItYmxpbmsnIGlmIGNvbmZpZy50b2dnbGVzLmN1cnNvckJsaW5rXG5cbiAgICBlZGl0b3JGb250ID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IuZm9udEZhbWlseScpXG4gICAgZGVmYXVsdEZvbnQgPSBcIk1lbmxvLCBDb25zb2xhcywgJ0RlamFWdSBTYW5zIE1vbm8nLCBtb25vc3BhY2VcIlxuICAgIG92ZXJyaWRlRm9udCA9IGNvbmZpZy5zdHlsZS5mb250RmFtaWx5XG4gICAgQHRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuZm9udEZhbWlseSA9IG92ZXJyaWRlRm9udCBvciBlZGl0b3JGb250IG9yIGRlZmF1bHRGb250XG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2VkaXRvci5mb250RmFtaWx5JywgKGV2ZW50KSA9PlxuICAgICAgZWRpdG9yRm9udCA9IGV2ZW50Lm5ld1ZhbHVlXG4gICAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250RmFtaWx5ID0gb3ZlcnJpZGVGb250IG9yIGVkaXRvckZvbnQgb3IgZGVmYXVsdEZvbnRcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLnN0eWxlLmZvbnRGYW1pbHknLCAoZXZlbnQpID0+XG4gICAgICBvdmVycmlkZUZvbnQgPSBldmVudC5uZXdWYWx1ZVxuICAgICAgQHRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuZm9udEZhbWlseSA9IG92ZXJyaWRlRm9udCBvciBlZGl0b3JGb250IG9yIGRlZmF1bHRGb250XG5cbiAgICBlZGl0b3JGb250U2l6ZSA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLmZvbnRTaXplJylcbiAgICBvdmVycmlkZUZvbnRTaXplID0gY29uZmlnLnN0eWxlLmZvbnRTaXplXG4gICAgQHRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuZm9udFNpemUgPSBcIiN7b3ZlcnJpZGVGb250U2l6ZSBvciBlZGl0b3JGb250U2l6ZX1weFwiXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2VkaXRvci5mb250U2l6ZScsIChldmVudCkgPT5cbiAgICAgIGVkaXRvckZvbnRTaXplID0gZXZlbnQubmV3VmFsdWVcbiAgICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRTaXplID0gXCIje292ZXJyaWRlRm9udFNpemUgb3IgZWRpdG9yRm9udFNpemV9cHhcIlxuICAgICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLnN0eWxlLmZvbnRTaXplJywgKGV2ZW50KSA9PlxuICAgICAgb3ZlcnJpZGVGb250U2l6ZSA9IGV2ZW50Lm5ld1ZhbHVlXG4gICAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250U2l6ZSA9IFwiI3tvdmVycmlkZUZvbnRTaXplIG9yIGVkaXRvckZvbnRTaXplfXB4XCJcbiAgICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG5cbiAgICAjIGZpcnN0IDggY29sb3JzIGkuZS4gJ2RhcmsnIGNvbG9yc1xuICAgIEB0ZXJtaW5hbC5jb2xvcnNbMC4uN10gPSBbXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwuYmxhY2sudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLnJlZC50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwuZ3JlZW4udG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLnllbGxvdy50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwuYmx1ZS50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwubWFnZW50YS50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwuY3lhbi50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwud2hpdGUudG9IZXhTdHJpbmcoKVxuICAgIF1cbiAgICAjICdicmlnaHQnIGNvbG9yc1xuICAgIEB0ZXJtaW5hbC5jb2xvcnNbOC4uMTVdID0gW1xuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRCbGFjay50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodFJlZC50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodEdyZWVuLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0WWVsbG93LnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0Qmx1ZS50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodE1hZ2VudGEudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRDeWFuLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0V2hpdGUudG9IZXhTdHJpbmcoKVxuICAgIF1cblxuICBhdHRhY2hXaW5kb3dFdmVudHM6IC0+XG4gICAgJCh3aW5kb3cpLm9uICdyZXNpemUnLCBAb25XaW5kb3dSZXNpemVcblxuICBkZXRhY2hXaW5kb3dFdmVudHM6IC0+XG4gICAgJCh3aW5kb3cpLm9mZiAncmVzaXplJywgQG9uV2luZG93UmVzaXplXG5cbiAgYXR0YWNoUmVzaXplRXZlbnRzOiAtPlxuICAgIEBwYW5lbERpdmlkZXIub24gJ21vdXNlZG93bicsIEByZXNpemVTdGFydGVkXG5cbiAgZGV0YWNoUmVzaXplRXZlbnRzOiAtPlxuICAgIEBwYW5lbERpdmlkZXIub2ZmICdtb3VzZWRvd24nXG5cbiAgb25XaW5kb3dSZXNpemU6ID0+XG4gICAgaWYgbm90IEB0YWJWaWV3XG4gICAgICBAeHRlcm0uY3NzICd0cmFuc2l0aW9uJywgJydcbiAgICAgIG5ld0hlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKVxuICAgICAgYm90dG9tUGFuZWwgPSAkKCdhdG9tLXBhbmVsLWNvbnRhaW5lci5ib3R0b20nKS5maXJzdCgpLmdldCgwKVxuICAgICAgb3ZlcmZsb3cgPSBib3R0b21QYW5lbC5zY3JvbGxIZWlnaHQgLSBib3R0b21QYW5lbC5vZmZzZXRIZWlnaHRcblxuICAgICAgZGVsdGEgPSBuZXdIZWlnaHQgLSBAd2luZG93SGVpZ2h0XG4gICAgICBAd2luZG93SGVpZ2h0ID0gbmV3SGVpZ2h0XG5cbiAgICAgIGlmIEBtYXhpbWl6ZWRcbiAgICAgICAgY2xhbXBlZCA9IE1hdGgubWF4KEBtYXhIZWlnaHQgKyBkZWx0YSwgQHJvd0hlaWdodClcblxuICAgICAgICBAYWRqdXN0SGVpZ2h0IGNsYW1wZWQgaWYgQHBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICAgIEBtYXhIZWlnaHQgPSBjbGFtcGVkXG5cbiAgICAgICAgQHByZXZIZWlnaHQgPSBNYXRoLm1pbihAcHJldkhlaWdodCwgQG1heEhlaWdodClcbiAgICAgIGVsc2UgaWYgb3ZlcmZsb3cgPiAwXG4gICAgICAgIGNsYW1wZWQgPSBNYXRoLm1heChAbmVhcmVzdFJvdyhAcHJldkhlaWdodCArIGRlbHRhKSwgQHJvd0hlaWdodClcblxuICAgICAgICBAYWRqdXN0SGVpZ2h0IGNsYW1wZWQgaWYgQHBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICAgIEBwcmV2SGVpZ2h0ID0gY2xhbXBlZFxuXG4gICAgICBAeHRlcm0uY3NzICd0cmFuc2l0aW9uJywgXCJoZWlnaHQgI3swLjI1IC8gQGFuaW1hdGlvblNwZWVkfXMgbGluZWFyXCJcbiAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuXG4gIHJlc2l6ZVN0YXJ0ZWQ6ID0+XG4gICAgcmV0dXJuIGlmIEBtYXhpbWl6ZWRcbiAgICBAbWF4SGVpZ2h0ID0gQHByZXZIZWlnaHQgKyAkKCcuaXRlbS12aWV3cycpLmhlaWdodCgpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIEByZXNpemVQYW5lbClcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsIEByZXNpemVTdG9wcGVkKVxuICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCAnJ1xuXG4gIHJlc2l6ZVN0b3BwZWQ6ID0+XG4gICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZW1vdmUnLCBAcmVzaXplUGFuZWwpXG4gICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZXVwJywgQHJlc2l6ZVN0b3BwZWQpXG4gICAgQHh0ZXJtLmNzcyAndHJhbnNpdGlvbicsIFwiaGVpZ2h0ICN7MC4yNSAvIEBhbmltYXRpb25TcGVlZH1zIGxpbmVhclwiXG5cbiAgbmVhcmVzdFJvdzogKHZhbHVlKSAtPlxuICAgIHJvd3MgPSB2YWx1ZSAvLyBAcm93SGVpZ2h0XG4gICAgcmV0dXJuIHJvd3MgKiBAcm93SGVpZ2h0XG5cbiAgcmVzaXplUGFuZWw6IChldmVudCkgPT5cbiAgICByZXR1cm4gQHJlc2l6ZVN0b3BwZWQoKSB1bmxlc3MgZXZlbnQud2hpY2ggaXMgMVxuXG4gICAgbW91c2VZID0gJCh3aW5kb3cpLmhlaWdodCgpIC0gZXZlbnQucGFnZVlcbiAgICBkZWx0YSA9IG1vdXNlWSAtICQoJ2F0b20tcGFuZWwtY29udGFpbmVyLmJvdHRvbScpLmhlaWdodCgpXG4gICAgcmV0dXJuIHVubGVzcyBNYXRoLmFicyhkZWx0YSkgPiAoQHJvd0hlaWdodCAqIDUgLyA2KVxuXG4gICAgY2xhbXBlZCA9IE1hdGgubWF4KEBuZWFyZXN0Um93KEBwcmV2SGVpZ2h0ICsgZGVsdGEpLCBAcm93SGVpZ2h0KVxuICAgIHJldHVybiBpZiBjbGFtcGVkID4gQG1heEhlaWdodFxuXG4gICAgQHh0ZXJtLmhlaWdodCBjbGFtcGVkXG4gICAgJChAdGVybWluYWwuZWxlbWVudCkuaGVpZ2h0IGNsYW1wZWRcbiAgICBAcHJldkhlaWdodCA9IGNsYW1wZWRcblxuICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG5cbiAgYWRqdXN0SGVpZ2h0OiAoaGVpZ2h0KSAtPlxuICAgIEB4dGVybS5oZWlnaHQgaGVpZ2h0XG4gICAgJChAdGVybWluYWwuZWxlbWVudCkuaGVpZ2h0IGhlaWdodFxuXG4gIGNvcHk6IC0+XG4gICAgaWYgQHRlcm1pbmFsLl9zZWxlY3RlZFxuICAgICAgdGV4dGFyZWEgPSBAdGVybWluYWwuZ2V0Q29weVRleHRhcmVhKClcbiAgICAgIHRleHQgPSBAdGVybWluYWwuZ3JhYlRleHQoXG4gICAgICAgIEB0ZXJtaW5hbC5fc2VsZWN0ZWQueDEsIEB0ZXJtaW5hbC5fc2VsZWN0ZWQueDIsXG4gICAgICAgIEB0ZXJtaW5hbC5fc2VsZWN0ZWQueTEsIEB0ZXJtaW5hbC5fc2VsZWN0ZWQueTIpXG4gICAgZWxzZVxuICAgICAgcmF3VGV4dCA9IEB0ZXJtaW5hbC5jb250ZXh0LmdldFNlbGVjdGlvbigpLnRvU3RyaW5nKClcbiAgICAgIHJhd0xpbmVzID0gcmF3VGV4dC5zcGxpdCgvXFxyP1xcbi9nKVxuICAgICAgbGluZXMgPSByYXdMaW5lcy5tYXAgKGxpbmUpIC0+XG4gICAgICAgIGxpbmUucmVwbGFjZSgvXFxzL2csIFwiIFwiKS50cmltUmlnaHQoKVxuICAgICAgdGV4dCA9IGxpbmVzLmpvaW4oXCJcXG5cIilcbiAgICBhdG9tLmNsaXBib2FyZC53cml0ZSB0ZXh0XG5cbiAgcGFzdGU6IC0+XG4gICAgQGlucHV0IGF0b20uY2xpcGJvYXJkLnJlYWQoKVxuXG4gIGluc2VydFNlbGVjdGlvbjogKGN1c3RvbVRleHQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBydW5Db21tYW5kID0gYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC50b2dnbGVzLnJ1bkluc2VydGVkVGV4dCcpXG4gICAgc2VsZWN0aW9uVGV4dCA9ICcnXG4gICAgaWYgc2VsZWN0aW9uID0gZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpXG4gICAgICBAdGVybWluYWwuc3RvcFNjcm9sbGluZygpXG4gICAgICBzZWxlY3Rpb25UZXh0ID0gc2VsZWN0aW9uXG4gICAgZWxzZSBpZiBjdXJzb3IgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhjdXJzb3Iucm93KVxuICAgICAgQHRlcm1pbmFsLnN0b3BTY3JvbGxpbmcoKVxuICAgICAgc2VsZWN0aW9uVGV4dCA9IGxpbmVcbiAgICAgIGVkaXRvci5tb3ZlRG93bigxKTtcbiAgICBAaW5wdXQgXCIje2N1c3RvbVRleHQuXG4gICAgICByZXBsYWNlKC9cXCRMLywgXCIje2VkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdyArIDF9XCIpLlxuICAgICAgcmVwbGFjZSgvXFwkRi8sIHBhdGguYmFzZW5hbWUoZWRpdG9yPy5idWZmZXI/LmZpbGU/LnBhdGgpKS5cbiAgICAgIHJlcGxhY2UoL1xcJEQvLCBwYXRoLmRpcm5hbWUoZWRpdG9yPy5idWZmZXI/LmZpbGU/LnBhdGgpKS5cbiAgICAgIHJlcGxhY2UoL1xcJFMvLCBzZWxlY3Rpb25UZXh0KS5cbiAgICAgIHJlcGxhY2UoL1xcJFxcJC8sICckJyl9I3tpZiBydW5Db21tYW5kIHRoZW4gb3MuRU9MIGVsc2UgJyd9XCJcblxuICBmb2N1czogPT5cbiAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuICAgIEBmb2N1c1Rlcm1pbmFsKClcbiAgICBAc3RhdHVzQmFyLnNldEFjdGl2ZVRlcm1pbmFsVmlldyh0aGlzKVxuICAgIHN1cGVyKClcblxuICBibHVyOiA9PlxuICAgIEBibHVyVGVybWluYWwoKVxuICAgIHN1cGVyKClcblxuICBmb2N1c1Rlcm1pbmFsOiA9PlxuICAgIHJldHVybiB1bmxlc3MgQHRlcm1pbmFsXG5cbiAgICBAdGVybWluYWwuZm9jdXMoKVxuICAgIGlmIEB0ZXJtaW5hbC5fdGV4dGFyZWFcbiAgICAgIEB0ZXJtaW5hbC5fdGV4dGFyZWEuZm9jdXMoKVxuICAgIGVsc2VcbiAgICAgIEB0ZXJtaW5hbC5lbGVtZW50LmZvY3VzKClcblxuICBibHVyVGVybWluYWw6ID0+XG4gICAgcmV0dXJuIHVubGVzcyBAdGVybWluYWxcblxuICAgIEB0ZXJtaW5hbC5ibHVyKClcbiAgICBAdGVybWluYWwuZWxlbWVudC5ibHVyKClcblxuICByZXNpemVUZXJtaW5hbFRvVmlldzogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBwYW5lbC5pc1Zpc2libGUoKSBvciBAdGFiVmlld1xuXG4gICAge2NvbHMsIHJvd3N9ID0gQGdldERpbWVuc2lvbnMoKVxuICAgIHJldHVybiB1bmxlc3MgY29scyA+IDAgYW5kIHJvd3MgPiAwXG4gICAgcmV0dXJuIHVubGVzcyBAdGVybWluYWxcbiAgICByZXR1cm4gaWYgQHRlcm1pbmFsLnJvd3MgaXMgcm93cyBhbmQgQHRlcm1pbmFsLmNvbHMgaXMgY29sc1xuXG4gICAgQHJlc2l6ZSBjb2xzLCByb3dzXG4gICAgQHRlcm1pbmFsLnJlc2l6ZSBjb2xzLCByb3dzXG5cbiAgZ2V0RGltZW5zaW9uczogLT5cbiAgICBmYWtlUm93ID0gJChcIjxkaXY+PHNwYW4+Jm5ic3A7PC9zcGFuPjwvZGl2PlwiKVxuXG4gICAgaWYgQHRlcm1pbmFsXG4gICAgICBAZmluZCgnLnRlcm1pbmFsJykuYXBwZW5kIGZha2VSb3dcbiAgICAgIGZha2VDb2wgPSBmYWtlUm93LmNoaWxkcmVuKCkuZmlyc3QoKVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29scyA9IE1hdGguZmxvb3IgQHh0ZXJtLndpZHRoKCkgLyAoZmFrZUNvbC53aWR0aCBvciA5KVxuICAgICAgcm93cyA9IE1hdGguZmxvb3IgQHh0ZXJtLmhlaWdodCgpIC8gKGZha2VDb2wuaGVpZ2h0IG9yIDIwKVxuICAgICAgQHJvd0hlaWdodCA9IGZha2VDb2wuaGVpZ2h0XG4gICAgICBmYWtlUm93LnJlbW92ZSgpXG4gICAgZWxzZVxuICAgICAgY29scyA9IE1hdGguZmxvb3IgQHh0ZXJtLndpZHRoKCkgLyA5XG4gICAgICByb3dzID0gTWF0aC5mbG9vciBAeHRlcm0uaGVpZ2h0KCkgLyAyMFxuXG4gICAge2NvbHMsIHJvd3N9XG5cbiAgb25UcmFuc2l0aW9uRW5kOiAoY2FsbGJhY2spIC0+XG4gICAgQHh0ZXJtLm9uZSAnd2Via2l0VHJhbnNpdGlvbkVuZCcsID0+XG4gICAgICBjYWxsYmFjaygpXG4gICAgICBAYW5pbWF0aW5nID0gZmFsc2VcblxuICBpbnB1dERpYWxvZzogLT5cbiAgICBJbnB1dERpYWxvZyA/PSByZXF1aXJlKCcuL2lucHV0LWRpYWxvZycpXG4gICAgZGlhbG9nID0gbmV3IElucHV0RGlhbG9nIHRoaXNcbiAgICBkaWFsb2cuYXR0YWNoKClcblxuICByZW5hbWU6IC0+XG4gICAgQHN0YXR1c0ljb24ucmVuYW1lKClcblxuICB0b2dnbGVUYWJWaWV3OiAtPlxuICAgIGlmIEB0YWJWaWV3XG4gICAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiB0aGlzLCB2aXNpYmxlOiBmYWxzZSlcbiAgICAgIEBhdHRhY2hSZXNpemVFdmVudHMoKVxuICAgICAgQGNsb3NlQnRuLnNob3coKVxuICAgICAgQGhpZGVCdG4uc2hvdygpXG4gICAgICBAbWF4aW1pemVCdG4uc2hvdygpXG4gICAgICBAdGFiVmlldyA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgQHBhbmVsLmRlc3Ryb3koKVxuICAgICAgQGRldGFjaFJlc2l6ZUV2ZW50cygpXG4gICAgICBAY2xvc2VCdG4uaGlkZSgpXG4gICAgICBAaGlkZUJ0bi5oaWRlKClcbiAgICAgIEBtYXhpbWl6ZUJ0bi5oaWRlKClcbiAgICAgIEB4dGVybS5jc3MgXCJoZWlnaHRcIiwgXCJcIlxuICAgICAgQHRhYlZpZXcgPSB0cnVlXG4gICAgICBsYXN0T3BlbmVkVmlldyA9IG51bGwgaWYgbGFzdE9wZW5lZFZpZXcgPT0gdGhpc1xuXG4gIGdldFRpdGxlOiAtPlxuICAgIEBzdGF0dXNJY29uLmdldE5hbWUoKSBvciBcInBsYXRmb3JtaW8taWRlLXRlcm1pbmFsXCJcblxuICBnZXRJY29uTmFtZTogLT5cbiAgICBcInRlcm1pbmFsXCJcblxuICBnZXRTaGVsbDogLT5cbiAgICByZXR1cm4gcGF0aC5iYXNlbmFtZSBAc2hlbGxcblxuICBnZXRTaGVsbFBhdGg6IC0+XG4gICAgcmV0dXJuIEBzaGVsbFxuXG4gIGVtaXQ6IChldmVudCwgZGF0YSkgLT5cbiAgICBAZW1pdHRlci5lbWl0IGV2ZW50LCBkYXRhXG5cbiAgb25EaWRDaGFuZ2VUaXRsZTogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtY2hhbmdlLXRpdGxlJywgY2FsbGJhY2tcblxuICBnZXRQYXRoOiAtPlxuICAgIHJldHVybiBAZ2V0VGVybWluYWxUaXRsZSgpXG5cbiAgZ2V0VGVybWluYWxUaXRsZTogLT5cbiAgICByZXR1cm4gQHRpdGxlIG9yIEBwcm9jZXNzXG5cbiAgZ2V0VGVybWluYWw6IC0+XG4gICAgcmV0dXJuIEB0ZXJtaW5hbFxuXG4gIGlzQW5pbWF0aW5nOiAtPlxuICAgIHJldHVybiBAYW5pbWF0aW5nXG4iXX0=
