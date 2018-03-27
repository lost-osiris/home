(function() {
  var $, CompositeDisposable, PlatformIOTerminalView, StatusBar, StatusIcon, View, os, path, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, View = ref.View;

  PlatformIOTerminalView = require('./view');

  StatusIcon = require('./status-icon');

  os = require('os');

  path = require('path');

  module.exports = StatusBar = (function(superClass) {
    extend(StatusBar, superClass);

    function StatusBar() {
      this.moveTerminalView = bind(this.moveTerminalView, this);
      this.onDropTabBar = bind(this.onDropTabBar, this);
      this.onDrop = bind(this.onDrop, this);
      this.onDragOver = bind(this.onDragOver, this);
      this.onDragEnd = bind(this.onDragEnd, this);
      this.onDragLeave = bind(this.onDragLeave, this);
      this.onDragStart = bind(this.onDragStart, this);
      this.closeAll = bind(this.closeAll, this);
      return StatusBar.__super__.constructor.apply(this, arguments);
    }

    StatusBar.prototype.terminalViews = [];

    StatusBar.prototype.activeTerminal = null;

    StatusBar.prototype.returnFocus = null;

    StatusBar.content = function() {
      return this.div({
        "class": 'platformio-ide-terminal status-bar',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.i({
            "class": "icon icon-plus",
            click: 'newTerminalView',
            outlet: 'plusBtn'
          });
          _this.ul({
            "class": "list-inline status-container",
            tabindex: '-1',
            outlet: 'statusContainer',
            is: 'space-pen-ul'
          });
          return _this.i({
            "class": "icon icon-x",
            click: 'closeAll',
            outlet: 'closeBtn'
          });
        };
      })(this));
    };

    StatusBar.prototype.initialize = function(statusBarProvider) {
      var handleBlur, handleFocus;
      this.statusBarProvider = statusBarProvider;
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'platformio-ide-terminal:focus': (function(_this) {
          return function() {
            return _this.activeTerminal.focusTerminal();
          };
        })(this),
        'platformio-ide-terminal:new': (function(_this) {
          return function() {
            return _this.newTerminalView();
          };
        })(this),
        'platformio-ide-terminal:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'platformio-ide-terminal:next': (function(_this) {
          return function() {
            if (!_this.activeTerminal) {
              return;
            }
            if (_this.activeTerminal.isAnimating()) {
              return;
            }
            if (_this.activeNextTerminalView()) {
              return _this.activeTerminal.open();
            }
          };
        })(this),
        'platformio-ide-terminal:prev': (function(_this) {
          return function() {
            if (!_this.activeTerminal) {
              return;
            }
            if (_this.activeTerminal.isAnimating()) {
              return;
            }
            if (_this.activePrevTerminalView()) {
              return _this.activeTerminal.open();
            }
          };
        })(this),
        'platformio-ide-terminal:close': (function(_this) {
          return function() {
            return _this.destroyActiveTerm();
          };
        })(this),
        'platformio-ide-terminal:close-all': (function(_this) {
          return function() {
            return _this.closeAll();
          };
        })(this),
        'platformio-ide-terminal:rename': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.rename();
            });
          };
        })(this),
        'platformio-ide-terminal:insert-selected-text': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection('$S');
            });
          };
        })(this),
        'platformio-ide-terminal:insert-text': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.inputDialog();
            });
          };
        })(this),
        'platformio-ide-terminal:insert-custom-text-1': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('platformio-ide-terminal.customTexts.customText1'));
            });
          };
        })(this),
        'platformio-ide-terminal:insert-custom-text-2': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('platformio-ide-terminal.customTexts.customText2'));
            });
          };
        })(this),
        'platformio-ide-terminal:insert-custom-text-3': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('platformio-ide-terminal.customTexts.customText3'));
            });
          };
        })(this),
        'platformio-ide-terminal:insert-custom-text-4': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('platformio-ide-terminal.customTexts.customText4'));
            });
          };
        })(this),
        'platformio-ide-terminal:insert-custom-text-5': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('platformio-ide-terminal.customTexts.customText5'));
            });
          };
        })(this),
        'platformio-ide-terminal:insert-custom-text-6': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('platformio-ide-terminal.customTexts.customText6'));
            });
          };
        })(this),
        'platformio-ide-terminal:insert-custom-text-7': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('platformio-ide-terminal.customTexts.customText7'));
            });
          };
        })(this),
        'platformio-ide-terminal:insert-custom-text-8': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('platformio-ide-terminal.customTexts.customText8'));
            });
          };
        })(this),
        'platformio-ide-terminal:fullscreen': (function(_this) {
          return function() {
            return _this.activeTerminal.maximize();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('.xterm', {
        'platformio-ide-terminal:paste': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.paste();
            });
          };
        })(this),
        'platformio-ide-terminal:copy': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.copy();
            });
          };
        })(this)
      }));
      this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(item) {
          var mapping, nextTerminal, prevTerminal;
          if (item == null) {
            return;
          }
          if (item.constructor.name === "PlatformIOTerminalView") {
            return setTimeout(item.focus, 100);
          } else if (item.constructor.name === "TextEditor") {
            mapping = atom.config.get('platformio-ide-terminal.core.mapTerminalsTo');
            if (mapping === 'None') {
              return;
            }
            switch (mapping) {
              case 'File':
                nextTerminal = _this.getTerminalById(item.getPath(), function(view) {
                  return view.getId().filePath;
                });
                break;
              case 'Folder':
                nextTerminal = _this.getTerminalById(path.dirname(item.getPath()), function(view) {
                  return view.getId().folderPath;
                });
            }
            prevTerminal = _this.getActiveTerminalView();
            if (prevTerminal !== nextTerminal) {
              if (nextTerminal == null) {
                if (item.getTitle() !== 'untitled') {
                  if (atom.config.get('platformio-ide-terminal.core.mapTerminalsToAutoOpen')) {
                    return nextTerminal = _this.createTerminalView();
                  }
                }
              } else {
                _this.setActiveTerminalView(nextTerminal);
                if (prevTerminal != null ? prevTerminal.panel.isVisible() : void 0) {
                  return nextTerminal.toggle();
                }
              }
            }
          }
        };
      })(this)));
      this.registerContextMenu();
      this.subscriptions.add(atom.tooltips.add(this.plusBtn, {
        title: 'New Terminal'
      }));
      this.subscriptions.add(atom.tooltips.add(this.closeBtn, {
        title: 'Close All'
      }));
      this.statusContainer.on('dblclick', (function(_this) {
        return function(event) {
          if (event.target === event.delegateTarget) {
            return _this.newTerminalView();
          }
        };
      })(this));
      this.statusContainer.on('dragstart', '.pio-terminal-status-icon', this.onDragStart);
      this.statusContainer.on('dragend', '.pio-terminal-status-icon', this.onDragEnd);
      this.statusContainer.on('dragleave', this.onDragLeave);
      this.statusContainer.on('dragover', this.onDragOver);
      this.statusContainer.on('drop', this.onDrop);
      handleBlur = (function(_this) {
        return function() {
          var terminal;
          if (terminal = PlatformIOTerminalView.getFocusedTerminal()) {
            _this.returnFocus = _this.terminalViewForTerminal(terminal);
            return terminal.blur();
          }
        };
      })(this);
      handleFocus = (function(_this) {
        return function() {
          if (_this.returnFocus) {
            return setTimeout(function() {
              var ref1;
              if ((ref1 = _this.returnFocus) != null) {
                ref1.focus();
              }
              return _this.returnFocus = null;
            }, 100);
          }
        };
      })(this);
      window.addEventListener('blur', handleBlur);
      this.subscriptions.add({
        dispose: function() {
          return window.removeEventListener('blur', handleBlur);
        }
      });
      window.addEventListener('focus', handleFocus);
      this.subscriptions.add({
        dispose: function() {
          return window.removeEventListener('focus', handleFocus);
        }
      });
      return this.attach();
    };

    StatusBar.prototype.registerContextMenu = function() {
      return this.subscriptions.add(atom.commands.add('.platformio-ide-terminal.status-bar', {
        'platformio-ide-terminal:status-red': this.setStatusColor,
        'platformio-ide-terminal:status-orange': this.setStatusColor,
        'platformio-ide-terminal:status-yellow': this.setStatusColor,
        'platformio-ide-terminal:status-green': this.setStatusColor,
        'platformio-ide-terminal:status-blue': this.setStatusColor,
        'platformio-ide-terminal:status-purple': this.setStatusColor,
        'platformio-ide-terminal:status-pink': this.setStatusColor,
        'platformio-ide-terminal:status-cyan': this.setStatusColor,
        'platformio-ide-terminal:status-magenta': this.setStatusColor,
        'platformio-ide-terminal:status-default': this.clearStatusColor,
        'platformio-ide-terminal:context-close': function(event) {
          return $(event.target).closest('.pio-terminal-status-icon')[0].terminalView.destroy();
        },
        'platformio-ide-terminal:context-hide': function(event) {
          var statusIcon;
          statusIcon = $(event.target).closest('.pio-terminal-status-icon')[0];
          if (statusIcon.isActive()) {
            return statusIcon.terminalView.hide();
          }
        },
        'platformio-ide-terminal:context-rename': function(event) {
          return $(event.target).closest('.pio-terminal-status-icon')[0].rename();
        }
      }));
    };

    StatusBar.prototype.registerPaneSubscription = function() {
      return this.subscriptions.add(this.paneSubscription = atom.workspace.observePanes((function(_this) {
        return function(pane) {
          var paneElement, tabBar;
          paneElement = $(atom.views.getView(pane));
          tabBar = paneElement.find('ul');
          tabBar.on('drop', function(event) {
            return _this.onDropTabBar(event, pane);
          });
          tabBar.on('dragstart', function(event) {
            var ref1;
            if (((ref1 = event.target.item) != null ? ref1.constructor.name : void 0) !== 'PlatformIOTerminalView') {
              return;
            }
            return event.originalEvent.dataTransfer.setData('platformio-ide-terminal-tab', 'true');
          });
          return pane.onDidDestroy(function() {
            return tabBar.off('drop', this.onDropTabBar);
          });
        };
      })(this)));
    };

    StatusBar.prototype.createTerminalView = function(autoRun) {
      var args, directory, editorFolder, editorPath, home, id, j, len, platformIOTerminalView, projectFolder, pwd, ref1, ref2, shell, shellArguments, statusIcon;
      if (this.paneSubscription == null) {
        this.registerPaneSubscription();
      }
      projectFolder = atom.project.getPaths()[0];
      editorPath = (ref1 = atom.workspace.getActiveTextEditor()) != null ? ref1.getPath() : void 0;
      if (editorPath != null) {
        editorFolder = path.dirname(editorPath);
        ref2 = atom.project.getPaths();
        for (j = 0, len = ref2.length; j < len; j++) {
          directory = ref2[j];
          if (editorPath.indexOf(directory) >= 0) {
            projectFolder = directory;
          }
        }
      }
      if ((projectFolder != null ? projectFolder.indexOf('atom://') : void 0) >= 0) {
        projectFolder = void 0;
      }
      home = process.platform === 'win32' ? process.env.HOMEPATH : process.env.HOME;
      switch (atom.config.get('platformio-ide-terminal.core.workingDirectory')) {
        case 'Project':
          pwd = projectFolder || editorFolder || home;
          break;
        case 'Active File':
          pwd = editorFolder || projectFolder || home;
          break;
        default:
          pwd = home;
      }
      id = editorPath || projectFolder || home;
      id = {
        filePath: id,
        folderPath: path.dirname(id)
      };
      shell = atom.config.get('platformio-ide-terminal.core.shell');
      shellArguments = atom.config.get('platformio-ide-terminal.core.shellArguments');
      args = shellArguments.split(/\s+/g).filter(function(arg) {
        return arg;
      });
      statusIcon = new StatusIcon();
      platformIOTerminalView = new PlatformIOTerminalView(id, pwd, statusIcon, this, shell, args, autoRun);
      statusIcon.initialize(platformIOTerminalView);
      platformIOTerminalView.attach();
      this.terminalViews.push(platformIOTerminalView);
      this.statusContainer.append(statusIcon);
      return platformIOTerminalView;
    };

    StatusBar.prototype.activeNextTerminalView = function() {
      var index;
      index = this.indexOf(this.activeTerminal);
      if (index < 0) {
        return false;
      }
      return this.activeTerminalView(index + 1);
    };

    StatusBar.prototype.activePrevTerminalView = function() {
      var index;
      index = this.indexOf(this.activeTerminal);
      if (index < 0) {
        return false;
      }
      return this.activeTerminalView(index - 1);
    };

    StatusBar.prototype.indexOf = function(view) {
      return this.terminalViews.indexOf(view);
    };

    StatusBar.prototype.activeTerminalView = function(index) {
      if (this.terminalViews.length < 2) {
        return false;
      }
      if (index >= this.terminalViews.length) {
        index = 0;
      }
      if (index < 0) {
        index = this.terminalViews.length - 1;
      }
      this.activeTerminal = this.terminalViews[index];
      return true;
    };

    StatusBar.prototype.getActiveTerminalView = function() {
      return this.activeTerminal;
    };

    StatusBar.prototype.getTerminalById = function(target, selector) {
      var index, j, ref1, terminal;
      if (selector == null) {
        selector = function(terminal) {
          return terminal.id;
        };
      }
      for (index = j = 0, ref1 = this.terminalViews.length; 0 <= ref1 ? j <= ref1 : j >= ref1; index = 0 <= ref1 ? ++j : --j) {
        terminal = this.terminalViews[index];
        if (terminal != null) {
          if (selector(terminal) === target) {
            return terminal;
          }
        }
      }
      return null;
    };

    StatusBar.prototype.terminalViewForTerminal = function(terminal) {
      var index, j, ref1, terminalView;
      for (index = j = 0, ref1 = this.terminalViews.length; 0 <= ref1 ? j <= ref1 : j >= ref1; index = 0 <= ref1 ? ++j : --j) {
        terminalView = this.terminalViews[index];
        if (terminalView != null) {
          if (terminalView.getTerminal() === terminal) {
            return terminalView;
          }
        }
      }
      return null;
    };

    StatusBar.prototype.runInActiveView = function(callback) {
      var view;
      view = this.getActiveTerminalView();
      if (view != null) {
        return callback(view);
      }
      return null;
    };

    StatusBar.prototype.runCommandInNewTerminal = function(commands) {
      this.activeTerminal = this.createTerminalView(commands);
      return this.activeTerminal.toggle();
    };

    StatusBar.prototype.runInOpenView = function(callback) {
      var view;
      view = this.getActiveTerminalView();
      if ((view != null) && view.panel.isVisible()) {
        return callback(view);
      }
      return null;
    };

    StatusBar.prototype.setActiveTerminalView = function(view) {
      return this.activeTerminal = view;
    };

    StatusBar.prototype.removeTerminalView = function(view) {
      var index;
      index = this.indexOf(view);
      if (index < 0) {
        return;
      }
      this.terminalViews.splice(index, 1);
      return this.activateAdjacentTerminal(index);
    };

    StatusBar.prototype.activateAdjacentTerminal = function(index) {
      if (index == null) {
        index = 0;
      }
      if (!(this.terminalViews.length > 0)) {
        return false;
      }
      index = Math.max(0, index - 1);
      this.activeTerminal = this.terminalViews[index];
      return true;
    };

    StatusBar.prototype.newTerminalView = function() {
      var ref1;
      if ((ref1 = this.activeTerminal) != null ? ref1.animating : void 0) {
        return;
      }
      this.activeTerminal = this.createTerminalView();
      return this.activeTerminal.toggle();
    };

    StatusBar.prototype.attach = function() {
      return this.statusBarProvider.addLeftTile({
        item: this,
        priority: -93
      });
    };

    StatusBar.prototype.destroyActiveTerm = function() {
      var index;
      if (this.activeTerminal == null) {
        return;
      }
      index = this.indexOf(this.activeTerminal);
      this.activeTerminal.destroy();
      this.activeTerminal = null;
      return this.activateAdjacentTerminal(index);
    };

    StatusBar.prototype.closeAll = function() {
      var index, j, ref1, view;
      for (index = j = ref1 = this.terminalViews.length; ref1 <= 0 ? j <= 0 : j >= 0; index = ref1 <= 0 ? ++j : --j) {
        view = this.terminalViews[index];
        if (view != null) {
          view.destroy();
        }
      }
      return this.activeTerminal = null;
    };

    StatusBar.prototype.destroy = function() {
      var j, len, ref1, view;
      this.subscriptions.dispose();
      ref1 = this.terminalViews;
      for (j = 0, len = ref1.length; j < len; j++) {
        view = ref1[j];
        view.ptyProcess.terminate();
        view.terminal.destroy();
      }
      return this.detach();
    };

    StatusBar.prototype.toggle = function() {
      if (this.terminalViews.length === 0) {
        this.activeTerminal = this.createTerminalView();
      } else if (this.activeTerminal === null) {
        this.activeTerminal = this.terminalViews[0];
      }
      return this.activeTerminal.toggle();
    };

    StatusBar.prototype.setStatusColor = function(event) {
      var color;
      color = event.type.match(/\w+$/)[0];
      color = atom.config.get("platformio-ide-terminal.iconColors." + color).toRGBAString();
      return $(event.target).closest('.pio-terminal-status-icon').css('color', color);
    };

    StatusBar.prototype.clearStatusColor = function(event) {
      return $(event.target).closest('.pio-terminal-status-icon').css('color', '');
    };

    StatusBar.prototype.onDragStart = function(event) {
      var element;
      event.originalEvent.dataTransfer.setData('platformio-ide-terminal-panel', 'true');
      element = $(event.target).closest('.pio-terminal-status-icon');
      element.addClass('is-dragging');
      return event.originalEvent.dataTransfer.setData('from-index', element.index());
    };

    StatusBar.prototype.onDragLeave = function(event) {
      return this.removePlaceholder();
    };

    StatusBar.prototype.onDragEnd = function(event) {
      return this.clearDropTarget();
    };

    StatusBar.prototype.onDragOver = function(event) {
      var element, newDropTargetIndex, statusIcons;
      event.preventDefault();
      event.stopPropagation();
      if (event.originalEvent.dataTransfer.getData('platformio-ide-terminal') !== 'true') {
        return;
      }
      newDropTargetIndex = this.getDropTargetIndex(event);
      if (newDropTargetIndex == null) {
        return;
      }
      this.removeDropTargetClasses();
      statusIcons = this.statusContainer.children('.pio-terminal-status-icon');
      if (newDropTargetIndex < statusIcons.length) {
        element = statusIcons.eq(newDropTargetIndex).addClass('is-drop-target');
        return this.getPlaceholder().insertBefore(element);
      } else {
        element = statusIcons.eq(newDropTargetIndex - 1).addClass('drop-target-is-after');
        return this.getPlaceholder().insertAfter(element);
      }
    };

    StatusBar.prototype.onDrop = function(event) {
      var dataTransfer, fromIndex, pane, paneIndex, panelEvent, tabEvent, toIndex, view;
      dataTransfer = event.originalEvent.dataTransfer;
      panelEvent = dataTransfer.getData('platformio-ide-terminal-panel') === 'true';
      tabEvent = dataTransfer.getData('platformio-ide-terminal-tab') === 'true';
      if (!(panelEvent || tabEvent)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      toIndex = this.getDropTargetIndex(event);
      this.clearDropTarget();
      if (tabEvent) {
        fromIndex = parseInt(dataTransfer.getData('sortable-index'));
        paneIndex = parseInt(dataTransfer.getData('from-pane-index'));
        pane = atom.workspace.getPanes()[paneIndex];
        view = pane.itemAtIndex(fromIndex);
        pane.removeItem(view, false);
        view.show();
        view.toggleTabView();
        this.terminalViews.push(view);
        if (view.statusIcon.isActive()) {
          view.open();
        }
        this.statusContainer.append(view.statusIcon);
        fromIndex = this.terminalViews.length - 1;
      } else {
        fromIndex = parseInt(dataTransfer.getData('from-index'));
      }
      return this.updateOrder(fromIndex, toIndex);
    };

    StatusBar.prototype.onDropTabBar = function(event, pane) {
      var dataTransfer, fromIndex, tabBar, view;
      dataTransfer = event.originalEvent.dataTransfer;
      if (dataTransfer.getData('platformio-ide-terminal-panel') !== 'true') {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.clearDropTarget();
      fromIndex = parseInt(dataTransfer.getData('from-index'));
      view = this.terminalViews[fromIndex];
      view.css("height", "");
      view.terminal.element.style.height = "";
      tabBar = $(event.target).closest('.tab-bar');
      view.toggleTabView();
      this.removeTerminalView(view);
      this.statusContainer.children().eq(fromIndex).detach();
      view.statusIcon.removeTooltip();
      pane.addItem(view, pane.getItems().length);
      pane.activateItem(view);
      return view.focus();
    };

    StatusBar.prototype.clearDropTarget = function() {
      var element;
      element = this.find('.is-dragging');
      element.removeClass('is-dragging');
      this.removeDropTargetClasses();
      return this.removePlaceholder();
    };

    StatusBar.prototype.removeDropTargetClasses = function() {
      this.statusContainer.find('.is-drop-target').removeClass('is-drop-target');
      return this.statusContainer.find('.drop-target-is-after').removeClass('drop-target-is-after');
    };

    StatusBar.prototype.getDropTargetIndex = function(event) {
      var element, elementCenter, statusIcons, target;
      target = $(event.target);
      if (this.isPlaceholder(target)) {
        return;
      }
      statusIcons = this.statusContainer.children('.pio-terminal-status-icon');
      element = target.closest('.pio-terminal-status-icon');
      if (element.length === 0) {
        element = statusIcons.last();
      }
      if (!element.length) {
        return 0;
      }
      elementCenter = element.offset().left + element.width() / 2;
      if (event.originalEvent.pageX < elementCenter) {
        return statusIcons.index(element);
      } else if (element.next('.pio-terminal-status-icon').length > 0) {
        return statusIcons.index(element.next('.pio-terminal-status-icon'));
      } else {
        return statusIcons.index(element) + 1;
      }
    };

    StatusBar.prototype.getPlaceholder = function() {
      return this.placeholderEl != null ? this.placeholderEl : this.placeholderEl = $('<li class="placeholder"></li>');
    };

    StatusBar.prototype.removePlaceholder = function() {
      var ref1;
      if ((ref1 = this.placeholderEl) != null) {
        ref1.remove();
      }
      return this.placeholderEl = null;
    };

    StatusBar.prototype.isPlaceholder = function(element) {
      return element.is('.placeholder');
    };

    StatusBar.prototype.iconAtIndex = function(index) {
      return this.getStatusIcons().eq(index);
    };

    StatusBar.prototype.getStatusIcons = function() {
      return this.statusContainer.children('.pio-terminal-status-icon');
    };

    StatusBar.prototype.moveIconToIndex = function(icon, toIndex) {
      var container, followingIcon;
      followingIcon = this.getStatusIcons()[toIndex];
      container = this.statusContainer[0];
      if (followingIcon != null) {
        return container.insertBefore(icon, followingIcon);
      } else {
        return container.appendChild(icon);
      }
    };

    StatusBar.prototype.moveTerminalView = function(fromIndex, toIndex) {
      var activeTerminal, view;
      activeTerminal = this.getActiveTerminalView();
      view = this.terminalViews.splice(fromIndex, 1)[0];
      this.terminalViews.splice(toIndex, 0, view);
      return this.setActiveTerminalView(activeTerminal);
    };

    StatusBar.prototype.updateOrder = function(fromIndex, toIndex) {
      var icon;
      if (fromIndex === toIndex) {
        return;
      }
      if (fromIndex < toIndex) {
        toIndex--;
      }
      icon = this.getStatusIcons().eq(fromIndex).detach();
      this.moveIconToIndex(icon.get(0), toIndex);
      this.moveTerminalView(fromIndex, toIndex);
      icon.addClass('inserted');
      return icon.one('webkitAnimationEnd', function() {
        return icon.removeClass('inserted');
      });
    };

    return StatusBar;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi9zdGF0dXMtYmFyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMEZBQUE7SUFBQTs7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsTUFBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFNBQUQsRUFBSTs7RUFFSixzQkFBQSxHQUF5QixPQUFBLENBQVEsUUFBUjs7RUFDekIsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUViLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozs7Ozs7Ozs7O3dCQUNKLGFBQUEsR0FBZTs7d0JBQ2YsY0FBQSxHQUFnQjs7d0JBQ2hCLFdBQUEsR0FBYTs7SUFFYixTQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxvQ0FBUDtRQUE2QyxRQUFBLEVBQVUsQ0FBQyxDQUF4RDtPQUFMLEVBQWdFLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUM5RCxLQUFDLENBQUEsQ0FBRCxDQUFHO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxnQkFBUDtZQUF5QixLQUFBLEVBQU8saUJBQWhDO1lBQW1ELE1BQUEsRUFBUSxTQUEzRDtXQUFIO1VBQ0EsS0FBQyxDQUFBLEVBQUQsQ0FBSTtZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sOEJBQVA7WUFBdUMsUUFBQSxFQUFVLElBQWpEO1lBQXVELE1BQUEsRUFBUSxpQkFBL0Q7WUFBa0YsRUFBQSxFQUFJLGNBQXRGO1dBQUo7aUJBQ0EsS0FBQyxDQUFBLENBQUQsQ0FBRztZQUFBLENBQUEsS0FBQSxD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RjtPQUFBLE1BQUE7ZUFHRSxTQUFTLENBQUMsV0FBVixDQUFzQixJQUF0QixFQUhGOztJQUhlOzt3QkFRakIsZ0JBQUEsR0FBa0IsU0FBQyxTQUFELEVBQVksT0FBWjtBQUNoQixVQUFBO01BQUEsY0FBQSxHQUFpQixJQUFDLENBQUEscUJBQUQsQ0FBQTtNQUNqQixJQUFBLEdBQU8sSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQXNCLFNBQXRCLEVBQWlDLENBQWpDLENBQW9DLENBQUEsQ0FBQTtNQUMzQyxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsT0FBdEIsRUFBK0IsQ0FBL0IsRUFBa0MsSUFBbEM7YUFDQSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsY0FBdkI7SUFKZ0I7O3dCQU1sQixXQUFBLEdBQWEsU0FBQyxTQUFELEVBQVksT0FBWjtBQUNYLFVBQUE7TUFBQSxJQUFVLFNBQUEsS0FBYSxPQUF2QjtBQUFBLGVBQUE7O01BQ0EsSUFBYSxTQUFBLEdBQVksT0FBekI7UUFBQSxPQUFBLEdBQUE7O01BRUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBaUIsQ0FBQyxFQUFsQixDQUFxQixTQUFyQixDQUErQixDQUFDLE1BQWhDLENBQUE7TUFDUCxJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsQ0FBakIsRUFBOEIsT0FBOUI7TUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsU0FBbEIsRUFBNkIsT0FBN0I7TUFDQSxJQUFJLENBQUMsUUFBTCxDQUFjLFVBQWQ7YUFDQSxJQUFJLENBQUMsR0FBTCxDQUFTLG9CQUFULEVBQStCLFNBQUE7ZUFBRyxJQUFJLENBQUMsV0FBTCxDQUFpQixVQUFqQjtNQUFILENBQS9CO0lBUlc7Ozs7S0E1YlM7QUFWeEIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xueyQsIFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cblBsYXRmb3JtSU9UZXJtaW5hbFZpZXcgPSByZXF1aXJlICcuL3ZpZXcnXG5TdGF0dXNJY29uID0gcmVxdWlyZSAnLi9zdGF0dXMtaWNvbidcblxub3MgPSByZXF1aXJlICdvcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTdGF0dXNCYXIgZXh0ZW5kcyBWaWV3XG4gIHRlcm1pbmFsVmlld3M6IFtdXG4gIGFjdGl2ZVRlcm1pbmFsOiBudWxsXG4gIHJldHVybkZvY3VzOiBudWxsXG5cbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsIHN0YXR1cy1iYXInLCB0YWJpbmRleDogLTEsID0+XG4gICAgICBAaSBjbGFzczogXCJpY29uIGljb24tcGx1c1wiLCBjbGljazogJ25ld1Rlcm1pbmFsVmlldycsIG91dGxldDogJ3BsdXNCdG4nXG4gICAgICBAdWwgY2xhc3M6IFwibGlzdC1pbmxpbmUgc3RhdHVzLWNvbnRhaW5lclwiLCB0YWJpbmRleDogJy0xJywgb3V0bGV0OiAnc3RhdHVzQ29udGFpbmVyJywgaXM6ICdzcGFjZS1wZW4tdWwnXG4gICAgICBAaSBjbGFzczogXCJpY29uIGljb24teFwiLCBjbGljazogJ2Nsb3NlQWxsJywgb3V0bGV0OiAnY2xvc2VCdG4nXG5cbiAgaW5pdGlhbGl6ZTogKEBzdGF0dXNCYXJQcm92aWRlcikgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmZvY3VzJzogPT4gQGFjdGl2ZVRlcm1pbmFsLmZvY3VzVGVybWluYWwoKVxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOm5ldyc6ID0+IEBuZXdUZXJtaW5hbFZpZXcoKVxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnRvZ2dsZSc6ID0+IEB0b2dnbGUoKVxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOm5leHQnOiA9PlxuICAgICAgICByZXR1cm4gdW5sZXNzIEBhY3RpdmVUZXJtaW5hbFxuICAgICAgICByZXR1cm4gaWYgQGFjdGl2ZVRlcm1pbmFsLmlzQW5pbWF0aW5nKClcbiAgICAgICAgQGFjdGl2ZVRlcm1pbmFsLm9wZW4oKSBpZiBAYWN0aXZlTmV4dFRlcm1pbmFsVmlldygpXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6cHJldic6ID0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVRlcm1pbmFsXG4gICAgICAgIHJldHVybiBpZiBAYWN0aXZlVGVybWluYWwuaXNBbmltYXRpbmcoKVxuICAgICAgICBAYWN0aXZlVGVybWluYWwub3BlbigpIGlmIEBhY3RpdmVQcmV2VGVybWluYWxWaWV3KClcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpjbG9zZSc6ID0+IEBkZXN0cm95QWN0aXZlVGVybSgpXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6Y2xvc2UtYWxsJzogPT4gQGNsb3NlQWxsKClcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpyZW5hbWUnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLnJlbmFtZSgpXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LXNlbGVjdGVkLXRleHQnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbignJFMnKVxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmluc2VydC10ZXh0JzogPT4gQHJ1bkluQWN0aXZlVmlldyAoaSkgLT4gaS5pbnB1dERpYWxvZygpXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTEnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLmN1c3RvbVRleHRzLmN1c3RvbVRleHQxJykpXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTInOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLmN1c3RvbVRleHRzLmN1c3RvbVRleHQyJykpXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTMnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLmN1c3RvbVRleHRzLmN1c3RvbVRleHQzJykpXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTQnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLmN1c3RvbVRleHRzLmN1c3RvbVRleHQ0JykpXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTUnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLmN1c3RvbVRleHRzLmN1c3RvbVRleHQ1JykpXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTYnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLmN1c3RvbVRleHRzLmN1c3RvbVRleHQ2JykpXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTcnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLmN1c3RvbVRleHRzLmN1c3RvbVRleHQ3JykpXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTgnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLmN1c3RvbVRleHRzLmN1c3RvbVRleHQ4JykpXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6ZnVsbHNjcmVlbic6ID0+IEBhY3RpdmVUZXJtaW5hbC5tYXhpbWl6ZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJy54dGVybScsXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6cGFzdGUnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLnBhc3RlKClcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpjb3B5JzogPT4gQHJ1bkluQWN0aXZlVmlldyAoaSkgLT4gaS5jb3B5KClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIChpdGVtKSA9PlxuICAgICAgcmV0dXJuIHVubGVzcyBpdGVtP1xuXG4gICAgICBpZiBpdGVtLmNvbnN0cnVjdG9yLm5hbWUgaXMgXCJQbGF0Zm9ybUlPVGVybWluYWxWaWV3XCJcbiAgICAgICAgc2V0VGltZW91dCBpdGVtLmZvY3VzLCAxMDBcbiAgICAgIGVsc2UgaWYgaXRlbS5jb25zdHJ1Y3Rvci5uYW1lIGlzIFwiVGV4dEVkaXRvclwiXG4gICAgICAgIG1hcHBpbmcgPSBhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLmNvcmUubWFwVGVybWluYWxzVG8nKVxuICAgICAgICByZXR1cm4gaWYgbWFwcGluZyBpcyAnTm9uZSdcblxuICAgICAgICBzd2l0Y2ggbWFwcGluZ1xuICAgICAgICAgIHdoZW4gJ0ZpbGUnXG4gICAgICAgICAgICBuZXh0VGVybWluYWwgPSBAZ2V0VGVybWluYWxCeUlkIGl0ZW0uZ2V0UGF0aCgpLCAodmlldykgLT4gdmlldy5nZXRJZCgpLmZpbGVQYXRoXG4gICAgICAgICAgd2hlbiAnRm9sZGVyJ1xuICAgICAgICAgICAgbmV4dFRlcm1pbmFsID0gQGdldFRlcm1pbmFsQnlJZCBwYXRoLmRpcm5hbWUoaXRlbS5nZXRQYXRoKCkpLCAodmlldykgLT4gdmlldy5nZXRJZCgpLmZvbGRlclBhdGhcblxuICAgICAgICBwcmV2VGVybWluYWwgPSBAZ2V0QWN0aXZlVGVybWluYWxWaWV3KClcbiAgICAgICAgaWYgcHJldlRlcm1pbmFsICE9IG5leHRUZXJtaW5hbFxuICAgICAgICAgIGlmIG5vdCBuZXh0VGVybWluYWw/XG4gICAgICAgICAgICBpZiBpdGVtLmdldFRpdGxlKCkgaXNudCAndW50aXRsZWQnXG4gICAgICAgICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuY29yZS5tYXBUZXJtaW5hbHNUb0F1dG9PcGVuJylcbiAgICAgICAgICAgICAgICBuZXh0VGVybWluYWwgPSBAY3JlYXRlVGVybWluYWxWaWV3KClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0QWN0aXZlVGVybWluYWxWaWV3KG5leHRUZXJtaW5hbClcbiAgICAgICAgICAgIG5leHRUZXJtaW5hbC50b2dnbGUoKSBpZiBwcmV2VGVybWluYWw/LnBhbmVsLmlzVmlzaWJsZSgpXG5cbiAgICBAcmVnaXN0ZXJDb250ZXh0TWVudSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQHBsdXNCdG4sIHRpdGxlOiAnTmV3IFRlcm1pbmFsJ1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnRvb2x0aXBzLmFkZCBAY2xvc2VCdG4sIHRpdGxlOiAnQ2xvc2UgQWxsJ1xuXG4gICAgQHN0YXR1c0NvbnRhaW5lci5vbiAnZGJsY2xpY2snLCAoZXZlbnQpID0+XG4gICAgICBAbmV3VGVybWluYWxWaWV3KCkgdW5sZXNzIGV2ZW50LnRhcmdldCAhPSBldmVudC5kZWxlZ2F0ZVRhcmdldFxuXG4gICAgQHN0YXR1c0NvbnRhaW5lci5vbiAnZHJhZ3N0YXJ0JywgJy5waW8tdGVybWluYWwtc3RhdHVzLWljb24nLCBAb25EcmFnU3RhcnRcbiAgICBAc3RhdHVzQ29udGFpbmVyLm9uICdkcmFnZW5kJywgJy5waW8tdGVybWluYWwtc3RhdHVzLWljb24nLCBAb25EcmFnRW5kXG4gICAgQHN0YXR1c0NvbnRhaW5lci5vbiAnZHJhZ2xlYXZlJywgQG9uRHJhZ0xlYXZlXG4gICAgQHN0YXR1c0NvbnRhaW5lci5vbiAnZHJhZ292ZXInLCBAb25EcmFnT3ZlclxuICAgIEBzdGF0dXNDb250YWluZXIub24gJ2Ryb3AnLCBAb25Ecm9wXG5cbiAgICBoYW5kbGVCbHVyID0gPT5cbiAgICAgIGlmIHRlcm1pbmFsID0gUGxhdGZvcm1JT1Rlcm1pbmFsVmlldy5nZXRGb2N1c2VkVGVybWluYWwoKVxuICAgICAgICBAcmV0dXJuRm9jdXMgPSBAdGVybWluYWxWaWV3Rm9yVGVybWluYWwodGVybWluYWwpXG4gICAgICAgIHRlcm1pbmFsLmJsdXIoKVxuXG4gICAgaGFuZGxlRm9jdXMgPSA9PlxuICAgICAgaWYgQHJldHVybkZvY3VzXG4gICAgICAgIHNldFRpbWVvdXQgPT5cbiAgICAgICAgICBAcmV0dXJuRm9jdXM/LmZvY3VzKClcbiAgICAgICAgICBAcmV0dXJuRm9jdXMgPSBudWxsXG4gICAgICAgICwgMTAwXG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnYmx1cicsIGhhbmRsZUJsdXJcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZGlzcG9zZTogLT5cbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICdibHVyJywgaGFuZGxlQmx1clxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2ZvY3VzJywgaGFuZGxlRm9jdXNcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZGlzcG9zZTogLT5cbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICdmb2N1cycsIGhhbmRsZUZvY3VzXG5cbiAgICBAYXR0YWNoKClcblxuICByZWdpc3RlckNvbnRleHRNZW51OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnLnBsYXRmb3JtaW8taWRlLXRlcm1pbmFsLnN0YXR1cy1iYXInLFxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnN0YXR1cy1yZWQnOiBAc2V0U3RhdHVzQ29sb3JcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpzdGF0dXMtb3JhbmdlJzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6c3RhdHVzLXllbGxvdyc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnN0YXR1cy1ncmVlbic6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnN0YXR1cy1ibHVlJzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6c3RhdHVzLXB1cnBsZSc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnN0YXR1cy1waW5rJzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6c3RhdHVzLWN5YW4nOiBAc2V0U3RhdHVzQ29sb3JcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpzdGF0dXMtbWFnZW50YSc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnN0YXR1cy1kZWZhdWx0JzogQGNsZWFyU3RhdHVzQ29sb3JcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpjb250ZXh0LWNsb3NlJzogKGV2ZW50KSAtPlxuICAgICAgICAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnBpby10ZXJtaW5hbC1zdGF0dXMtaWNvbicpWzBdLnRlcm1pbmFsVmlldy5kZXN0cm95KClcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpjb250ZXh0LWhpZGUnOiAoZXZlbnQpIC0+XG4gICAgICAgIHN0YXR1c0ljb24gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnBpby10ZXJtaW5hbC1zdGF0dXMtaWNvbicpWzBdXG4gICAgICAgIHN0YXR1c0ljb24udGVybWluYWxWaWV3LmhpZGUoKSBpZiBzdGF0dXNJY29uLmlzQWN0aXZlKClcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpjb250ZXh0LXJlbmFtZSc6IChldmVudCkgLT5cbiAgICAgICAgJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5waW8tdGVybWluYWwtc3RhdHVzLWljb24nKVswXS5yZW5hbWUoKVxuXG4gIHJlZ2lzdGVyUGFuZVN1YnNjcmlwdGlvbjogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHBhbmVTdWJzY3JpcHRpb24gPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlUGFuZXMgKHBhbmUpID0+XG4gICAgICBwYW5lRWxlbWVudCA9ICQoYXRvbS52aWV3cy5nZXRWaWV3KHBhbmUpKVxuICAgICAgdGFiQmFyID0gcGFuZUVsZW1lbnQuZmluZCgndWwnKVxuXG4gICAgICB0YWJCYXIub24gJ2Ryb3AnLCAoZXZlbnQpID0+IEBvbkRyb3BUYWJCYXIoZXZlbnQsIHBhbmUpXG4gICAgICB0YWJCYXIub24gJ2RyYWdzdGFydCcsIChldmVudCkgLT5cbiAgICAgICAgcmV0dXJuIHVubGVzcyBldmVudC50YXJnZXQuaXRlbT8uY29uc3RydWN0b3IubmFtZSBpcyAnUGxhdGZvcm1JT1Rlcm1pbmFsVmlldydcbiAgICAgICAgZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YSAncGxhdGZvcm1pby1pZGUtdGVybWluYWwtdGFiJywgJ3RydWUnXG4gICAgICBwYW5lLm9uRGlkRGVzdHJveSAtPiB0YWJCYXIub2ZmICdkcm9wJywgQG9uRHJvcFRhYkJhclxuXG4gIGNyZWF0ZVRlcm1pbmFsVmlldzogKGF1dG9SdW4pIC0+XG4gICAgQHJlZ2lzdGVyUGFuZVN1YnNjcmlwdGlvbigpIHVubGVzcyBAcGFuZVN1YnNjcmlwdGlvbj9cblxuICAgIHByb2plY3RGb2xkZXIgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXVxuICAgIGVkaXRvclBhdGggPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk/LmdldFBhdGgoKVxuXG4gICAgaWYgZWRpdG9yUGF0aD9cbiAgICAgIGVkaXRvckZvbGRlciA9IHBhdGguZGlybmFtZShlZGl0b3JQYXRoKVxuICAgICAgZm9yIGRpcmVjdG9yeSBpbiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgICAgICBpZiBlZGl0b3JQYXRoLmluZGV4T2YoZGlyZWN0b3J5KSA+PSAwXG4gICAgICAgICAgcHJvamVjdEZvbGRlciA9IGRpcmVjdG9yeVxuXG4gICAgcHJvamVjdEZvbGRlciA9IHVuZGVmaW5lZCBpZiBwcm9qZWN0Rm9sZGVyPy5pbmRleE9mKCdhdG9tOi8vJykgPj0gMFxuXG4gICAgaG9tZSA9IGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgJ3dpbjMyJyB0aGVuIHByb2Nlc3MuZW52LkhPTUVQQVRIIGVsc2UgcHJvY2Vzcy5lbnYuSE9NRVxuXG4gICAgc3dpdGNoIGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuY29yZS53b3JraW5nRGlyZWN0b3J5JylcbiAgICAgIHdoZW4gJ1Byb2plY3QnIHRoZW4gcHdkID0gcHJvamVjdEZvbGRlciBvciBlZGl0b3JGb2xkZXIgb3IgaG9tZVxuICAgICAgd2hlbiAnQWN0aXZlIEZpbGUnIHRoZW4gcHdkID0gZWRpdG9yRm9sZGVyIG9yIHByb2plY3RGb2xkZXIgb3IgaG9tZVxuICAgICAgZWxzZSBwd2QgPSBob21lXG5cbiAgICBpZCA9IGVkaXRvclBhdGggb3IgcHJvamVjdEZvbGRlciBvciBob21lXG4gICAgaWQgPSBmaWxlUGF0aDogaWQsIGZvbGRlclBhdGg6IHBhdGguZGlybmFtZShpZClcblxuICAgIHNoZWxsID0gYXRvbS5jb25maWcuZ2V0ICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5jb3JlLnNoZWxsJ1xuICAgIHNoZWxsQXJndW1lbnRzID0gYXRvbS5jb25maWcuZ2V0ICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5jb3JlLnNoZWxsQXJndW1lbnRzJ1xuICAgIGFyZ3MgPSBzaGVsbEFyZ3VtZW50cy5zcGxpdCgvXFxzKy9nKS5maWx0ZXIgKGFyZykgLT4gYXJnXG5cbiAgICBzdGF0dXNJY29uID0gbmV3IFN0YXR1c0ljb24oKVxuICAgIHBsYXRmb3JtSU9UZXJtaW5hbFZpZXcgPSBuZXcgUGxhdGZvcm1JT1Rlcm1pbmFsVmlldyhpZCwgcHdkLCBzdGF0dXNJY29uLCB0aGlzLCBzaGVsbCwgYXJncywgYXV0b1J1bilcbiAgICBzdGF0dXNJY29uLmluaXRpYWxpemUocGxhdGZvcm1JT1Rlcm1pbmFsVmlldylcblxuICAgIHBsYXRmb3JtSU9UZXJtaW5hbFZpZXcuYXR0YWNoKClcblxuICAgIEB0ZXJtaW5hbFZpZXdzLnB1c2ggcGxhdGZvcm1JT1Rlcm1pbmFsVmlld1xuICAgIEBzdGF0dXNDb250YWluZXIuYXBwZW5kIHN0YXR1c0ljb25cbiAgICByZXR1cm4gcGxhdGZvcm1JT1Rlcm1pbmFsVmlld1xuXG4gIGFjdGl2ZU5leHRUZXJtaW5hbFZpZXc6IC0+XG4gICAgaW5kZXggPSBAaW5kZXhPZihAYWN0aXZlVGVybWluYWwpXG4gICAgcmV0dXJuIGZhbHNlIGlmIGluZGV4IDwgMFxuICAgIEBhY3RpdmVUZXJtaW5hbFZpZXcgaW5kZXggKyAxXG5cbiAgYWN0aXZlUHJldlRlcm1pbmFsVmlldzogLT5cbiAgICBpbmRleCA9IEBpbmRleE9mKEBhY3RpdmVUZXJtaW5hbClcbiAgICByZXR1cm4gZmFsc2UgaWYgaW5kZXggPCAwXG4gICAgQGFjdGl2ZVRlcm1pbmFsVmlldyBpbmRleCAtIDFcblxuICBpbmRleE9mOiAodmlldykgLT5cbiAgICBAdGVybWluYWxWaWV3cy5pbmRleE9mKHZpZXcpXG5cbiAgYWN0aXZlVGVybWluYWxWaWV3OiAoaW5kZXgpIC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIEB0ZXJtaW5hbFZpZXdzLmxlbmd0aCA8IDJcblxuICAgIGlmIGluZGV4ID49IEB0ZXJtaW5hbFZpZXdzLmxlbmd0aFxuICAgICAgaW5kZXggPSAwXG4gICAgaWYgaW5kZXggPCAwXG4gICAgICBpbmRleCA9IEB0ZXJtaW5hbFZpZXdzLmxlbmd0aCAtIDFcblxuICAgIEBhY3RpdmVUZXJtaW5hbCA9IEB0ZXJtaW5hbFZpZXdzW2luZGV4XVxuICAgIHJldHVybiB0cnVlXG5cbiAgZ2V0QWN0aXZlVGVybWluYWxWaWV3OiAtPlxuICAgIHJldHVybiBAYWN0aXZlVGVybWluYWxcblxuICBnZXRUZXJtaW5hbEJ5SWQ6ICh0YXJnZXQsIHNlbGVjdG9yKSAtPlxuICAgIHNlbGVjdG9yID89ICh0ZXJtaW5hbCkgLT4gdGVybWluYWwuaWRcblxuICAgIGZvciBpbmRleCBpbiBbMCAuLiBAdGVybWluYWxWaWV3cy5sZW5ndGhdXG4gICAgICB0ZXJtaW5hbCA9IEB0ZXJtaW5hbFZpZXdzW2luZGV4XVxuICAgICAgaWYgdGVybWluYWw/XG4gICAgICAgIHJldHVybiB0ZXJtaW5hbCBpZiBzZWxlY3Rvcih0ZXJtaW5hbCkgPT0gdGFyZ2V0XG5cbiAgICByZXR1cm4gbnVsbFxuXG4gIHRlcm1pbmFsVmlld0ZvclRlcm1pbmFsOiAodGVybWluYWwpIC0+XG4gICAgZm9yIGluZGV4IGluIFswIC4uIEB0ZXJtaW5hbFZpZXdzLmxlbmd0aF1cbiAgICAgIHRlcm1pbmFsVmlldyA9IEB0ZXJtaW5hbFZpZXdzW2luZGV4XVxuICAgICAgaWYgdGVybWluYWxWaWV3P1xuICAgICAgICByZXR1cm4gdGVybWluYWxWaWV3IGlmIHRlcm1pbmFsVmlldy5nZXRUZXJtaW5hbCgpID09IHRlcm1pbmFsXG5cbiAgICByZXR1cm4gbnVsbFxuXG4gIHJ1bkluQWN0aXZlVmlldzogKGNhbGxiYWNrKSAtPlxuICAgIHZpZXcgPSBAZ2V0QWN0aXZlVGVybWluYWxWaWV3KClcbiAgICBpZiB2aWV3P1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKHZpZXcpXG4gICAgcmV0dXJuIG51bGxcblxuICBydW5Db21tYW5kSW5OZXdUZXJtaW5hbDogKGNvbW1hbmRzKSAtPlxuICAgIEBhY3RpdmVUZXJtaW5hbCA9IEBjcmVhdGVUZXJtaW5hbFZpZXcoY29tbWFuZHMpXG4gICAgQGFjdGl2ZVRlcm1pbmFsLnRvZ2dsZSgpXG5cbiAgcnVuSW5PcGVuVmlldzogKGNhbGxiYWNrKSAtPlxuICAgIHZpZXcgPSBAZ2V0QWN0aXZlVGVybWluYWxWaWV3KClcbiAgICBpZiB2aWV3PyBhbmQgdmlldy5wYW5lbC5pc1Zpc2libGUoKVxuICAgICAgcmV0dXJuIGNhbGxiYWNrKHZpZXcpXG4gICAgcmV0dXJuIG51bGxcblxuICBzZXRBY3RpdmVUZXJtaW5hbFZpZXc6ICh2aWV3KSAtPlxuICAgIEBhY3RpdmVUZXJtaW5hbCA9IHZpZXdcblxuICByZW1vdmVUZXJtaW5hbFZpZXc6ICh2aWV3KSAtPlxuICAgIGluZGV4ID0gQGluZGV4T2Ygdmlld1xuICAgIHJldHVybiBpZiBpbmRleCA8IDBcbiAgICBAdGVybWluYWxWaWV3cy5zcGxpY2UgaW5kZXgsIDFcblxuICAgIEBhY3RpdmF0ZUFkamFjZW50VGVybWluYWwgaW5kZXhcblxuICBhY3RpdmF0ZUFkamFjZW50VGVybWluYWw6IChpbmRleD0wKSAtPlxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgQHRlcm1pbmFsVmlld3MubGVuZ3RoID4gMFxuXG4gICAgaW5kZXggPSBNYXRoLm1heCgwLCBpbmRleCAtIDEpXG4gICAgQGFjdGl2ZVRlcm1pbmFsID0gQHRlcm1pbmFsVmlld3NbaW5kZXhdXG5cbiAgICByZXR1cm4gdHJ1ZVxuXG4gIG5ld1Rlcm1pbmFsVmlldzogLT5cbiAgICByZXR1cm4gaWYgQGFjdGl2ZVRlcm1pbmFsPy5hbmltYXRpbmdcblxuICAgIEBhY3RpdmVUZXJtaW5hbCA9IEBjcmVhdGVUZXJtaW5hbFZpZXcoKVxuICAgIEBhY3RpdmVUZXJtaW5hbC50b2dnbGUoKVxuXG4gIGF0dGFjaDogLT5cbiAgICBAc3RhdHVzQmFyUHJvdmlkZXIuYWRkTGVmdFRpbGUoaXRlbTogdGhpcywgcHJpb3JpdHk6IC05MylcblxuICBkZXN0cm95QWN0aXZlVGVybTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBhY3RpdmVUZXJtaW5hbD9cblxuICAgIGluZGV4ID0gQGluZGV4T2YoQGFjdGl2ZVRlcm1pbmFsKVxuICAgIEBhY3RpdmVUZXJtaW5hbC5kZXN0cm95KClcbiAgICBAYWN0aXZlVGVybWluYWwgPSBudWxsXG5cbiAgICBAYWN0aXZhdGVBZGphY2VudFRlcm1pbmFsIGluZGV4XG5cbiAgY2xvc2VBbGw6ID0+XG4gICAgZm9yIGluZGV4IGluIFtAdGVybWluYWxWaWV3cy5sZW5ndGggLi4gMF1cbiAgICAgIHZpZXcgPSBAdGVybWluYWxWaWV3c1tpbmRleF1cbiAgICAgIGlmIHZpZXc/XG4gICAgICAgIHZpZXcuZGVzdHJveSgpXG4gICAgQGFjdGl2ZVRlcm1pbmFsID0gbnVsbFxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgZm9yIHZpZXcgaW4gQHRlcm1pbmFsVmlld3NcbiAgICAgIHZpZXcucHR5UHJvY2Vzcy50ZXJtaW5hdGUoKVxuICAgICAgdmlldy50ZXJtaW5hbC5kZXN0cm95KClcbiAgICBAZGV0YWNoKClcblxuICB0b2dnbGU6IC0+XG4gICAgaWYgQHRlcm1pbmFsVmlld3MubGVuZ3RoID09IDBcbiAgICAgIEBhY3RpdmVUZXJtaW5hbCA9IEBjcmVhdGVUZXJtaW5hbFZpZXcoKVxuICAgIGVsc2UgaWYgQGFjdGl2ZVRlcm1pbmFsID09IG51bGxcbiAgICAgIEBhY3RpdmVUZXJtaW5hbCA9IEB0ZXJtaW5hbFZpZXdzWzBdXG4gICAgQGFjdGl2ZVRlcm1pbmFsLnRvZ2dsZSgpXG5cbiAgc2V0U3RhdHVzQ29sb3I6IChldmVudCkgLT5cbiAgICBjb2xvciA9IGV2ZW50LnR5cGUubWF0Y2goL1xcdyskLylbMF1cbiAgICBjb2xvciA9IGF0b20uY29uZmlnLmdldChcInBsYXRmb3JtaW8taWRlLXRlcm1pbmFsLmljb25Db2xvcnMuI3tjb2xvcn1cIikudG9SR0JBU3RyaW5nKClcbiAgICAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnBpby10ZXJtaW5hbC1zdGF0dXMtaWNvbicpLmNzcyAnY29sb3InLCBjb2xvclxuXG4gIGNsZWFyU3RhdHVzQ29sb3I6IChldmVudCkgLT5cbiAgICAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnBpby10ZXJtaW5hbC1zdGF0dXMtaWNvbicpLmNzcyAnY29sb3InLCAnJ1xuXG4gIG9uRHJhZ1N0YXJ0OiAoZXZlbnQpID0+XG4gICAgZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YSAncGxhdGZvcm1pby1pZGUtdGVybWluYWwtcGFuZWwnLCAndHJ1ZSdcblxuICAgIGVsZW1lbnQgPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnBpby10ZXJtaW5hbC1zdGF0dXMtaWNvbicpXG4gICAgZWxlbWVudC5hZGRDbGFzcyAnaXMtZHJhZ2dpbmcnXG4gICAgZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YSAnZnJvbS1pbmRleCcsIGVsZW1lbnQuaW5kZXgoKVxuXG4gIG9uRHJhZ0xlYXZlOiAoZXZlbnQpID0+XG4gICAgQHJlbW92ZVBsYWNlaG9sZGVyKClcblxuICBvbkRyYWdFbmQ6IChldmVudCkgPT5cbiAgICBAY2xlYXJEcm9wVGFyZ2V0KClcblxuICBvbkRyYWdPdmVyOiAoZXZlbnQpID0+XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgdW5sZXNzIGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsJykgaXMgJ3RydWUnXG4gICAgICByZXR1cm5cblxuICAgIG5ld0Ryb3BUYXJnZXRJbmRleCA9IEBnZXREcm9wVGFyZ2V0SW5kZXgoZXZlbnQpXG4gICAgcmV0dXJuIHVubGVzcyBuZXdEcm9wVGFyZ2V0SW5kZXg/XG4gICAgQHJlbW92ZURyb3BUYXJnZXRDbGFzc2VzKClcbiAgICBzdGF0dXNJY29ucyA9IEBzdGF0dXNDb250YWluZXIuY2hpbGRyZW4gJy5waW8tdGVybWluYWwtc3RhdHVzLWljb24nXG5cbiAgICBpZiBuZXdEcm9wVGFyZ2V0SW5kZXggPCBzdGF0dXNJY29ucy5sZW5ndGhcbiAgICAgIGVsZW1lbnQgPSBzdGF0dXNJY29ucy5lcShuZXdEcm9wVGFyZ2V0SW5kZXgpLmFkZENsYXNzICdpcy1kcm9wLXRhcmdldCdcbiAgICAgIEBnZXRQbGFjZWhvbGRlcigpLmluc2VydEJlZm9yZShlbGVtZW50KVxuICAgIGVsc2VcbiAgICAgIGVsZW1lbnQgPSBzdGF0dXNJY29ucy5lcShuZXdEcm9wVGFyZ2V0SW5kZXggLSAxKS5hZGRDbGFzcyAnZHJvcC10YXJnZXQtaXMtYWZ0ZXInXG4gICAgICBAZ2V0UGxhY2Vob2xkZXIoKS5pbnNlcnRBZnRlcihlbGVtZW50KVxuXG4gIG9uRHJvcDogKGV2ZW50KSA9PlxuICAgIHtkYXRhVHJhbnNmZXJ9ID0gZXZlbnQub3JpZ2luYWxFdmVudFxuICAgIHBhbmVsRXZlbnQgPSBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgncGxhdGZvcm1pby1pZGUtdGVybWluYWwtcGFuZWwnKSBpcyAndHJ1ZSdcbiAgICB0YWJFdmVudCA9IGRhdGFUcmFuc2Zlci5nZXREYXRhKCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC10YWInKSBpcyAndHJ1ZSdcbiAgICByZXR1cm4gdW5sZXNzIHBhbmVsRXZlbnQgb3IgdGFiRXZlbnRcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgdG9JbmRleCA9IEBnZXREcm9wVGFyZ2V0SW5kZXgoZXZlbnQpXG4gICAgQGNsZWFyRHJvcFRhcmdldCgpXG5cbiAgICBpZiB0YWJFdmVudFxuICAgICAgZnJvbUluZGV4ID0gcGFyc2VJbnQoZGF0YVRyYW5zZmVyLmdldERhdGEoJ3NvcnRhYmxlLWluZGV4JykpXG4gICAgICBwYW5lSW5kZXggPSBwYXJzZUludChkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnZnJvbS1wYW5lLWluZGV4JykpXG4gICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVtwYW5lSW5kZXhdXG4gICAgICB2aWV3ID0gcGFuZS5pdGVtQXRJbmRleChmcm9tSW5kZXgpXG4gICAgICBwYW5lLnJlbW92ZUl0ZW0odmlldywgZmFsc2UpXG4gICAgICB2aWV3LnNob3coKVxuXG4gICAgICB2aWV3LnRvZ2dsZVRhYlZpZXcoKVxuICAgICAgQHRlcm1pbmFsVmlld3MucHVzaCB2aWV3XG4gICAgICB2aWV3Lm9wZW4oKSBpZiB2aWV3LnN0YXR1c0ljb24uaXNBY3RpdmUoKVxuICAgICAgQHN0YXR1c0NvbnRhaW5lci5hcHBlbmQgdmlldy5zdGF0dXNJY29uXG4gICAgICBmcm9tSW5kZXggPSBAdGVybWluYWxWaWV3cy5sZW5ndGggLSAxXG4gICAgZWxzZVxuICAgICAgZnJvbUluZGV4ID0gcGFyc2VJbnQoZGF0YVRyYW5zZmVyLmdldERhdGEoJ2Zyb20taW5kZXgnKSlcbiAgICBAdXBkYXRlT3JkZXIoZnJvbUluZGV4LCB0b0luZGV4KVxuXG4gIG9uRHJvcFRhYkJhcjogKGV2ZW50LCBwYW5lKSA9PlxuICAgIHtkYXRhVHJhbnNmZXJ9ID0gZXZlbnQub3JpZ2luYWxFdmVudFxuICAgIHJldHVybiB1bmxlc3MgZGF0YVRyYW5zZmVyLmdldERhdGEoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLXBhbmVsJykgaXMgJ3RydWUnXG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBAY2xlYXJEcm9wVGFyZ2V0KClcblxuICAgIGZyb21JbmRleCA9IHBhcnNlSW50KGRhdGFUcmFuc2Zlci5nZXREYXRhKCdmcm9tLWluZGV4JykpXG4gICAgdmlldyA9IEB0ZXJtaW5hbFZpZXdzW2Zyb21JbmRleF1cbiAgICB2aWV3LmNzcyBcImhlaWdodFwiLCBcIlwiXG4gICAgdmlldy50ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmhlaWdodCA9IFwiXCJcbiAgICB0YWJCYXIgPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnRhYi1iYXInKVxuXG4gICAgdmlldy50b2dnbGVUYWJWaWV3KClcbiAgICBAcmVtb3ZlVGVybWluYWxWaWV3IHZpZXdcbiAgICBAc3RhdHVzQ29udGFpbmVyLmNoaWxkcmVuKCkuZXEoZnJvbUluZGV4KS5kZXRhY2goKVxuICAgIHZpZXcuc3RhdHVzSWNvbi5yZW1vdmVUb29sdGlwKClcblxuICAgIHBhbmUuYWRkSXRlbSB2aWV3LCBwYW5lLmdldEl0ZW1zKCkubGVuZ3RoXG4gICAgcGFuZS5hY3RpdmF0ZUl0ZW0gdmlld1xuXG4gICAgdmlldy5mb2N1cygpXG5cbiAgY2xlYXJEcm9wVGFyZ2V0OiAtPlxuICAgIGVsZW1lbnQgPSBAZmluZCgnLmlzLWRyYWdnaW5nJylcbiAgICBlbGVtZW50LnJlbW92ZUNsYXNzICdpcy1kcmFnZ2luZydcbiAgICBAcmVtb3ZlRHJvcFRhcmdldENsYXNzZXMoKVxuICAgIEByZW1vdmVQbGFjZWhvbGRlcigpXG5cbiAgcmVtb3ZlRHJvcFRhcmdldENsYXNzZXM6IC0+XG4gICAgQHN0YXR1c0NvbnRhaW5lci5maW5kKCcuaXMtZHJvcC10YXJnZXQnKS5yZW1vdmVDbGFzcyAnaXMtZHJvcC10YXJnZXQnXG4gICAgQHN0YXR1c0NvbnRhaW5lci5maW5kKCcuZHJvcC10YXJnZXQtaXMtYWZ0ZXInKS5yZW1vdmVDbGFzcyAnZHJvcC10YXJnZXQtaXMtYWZ0ZXInXG5cbiAgZ2V0RHJvcFRhcmdldEluZGV4OiAoZXZlbnQpIC0+XG4gICAgdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgcmV0dXJuIGlmIEBpc1BsYWNlaG9sZGVyKHRhcmdldClcblxuICAgIHN0YXR1c0ljb25zID0gQHN0YXR1c0NvbnRhaW5lci5jaGlsZHJlbignLnBpby10ZXJtaW5hbC1zdGF0dXMtaWNvbicpXG4gICAgZWxlbWVudCA9IHRhcmdldC5jbG9zZXN0KCcucGlvLXRlcm1pbmFsLXN0YXR1cy1pY29uJylcbiAgICBlbGVtZW50ID0gc3RhdHVzSWNvbnMubGFzdCgpIGlmIGVsZW1lbnQubGVuZ3RoIGlzIDBcblxuICAgIHJldHVybiAwIHVubGVzcyBlbGVtZW50Lmxlbmd0aFxuXG4gICAgZWxlbWVudENlbnRlciA9IGVsZW1lbnQub2Zmc2V0KCkubGVmdCArIGVsZW1lbnQud2lkdGgoKSAvIDJcblxuICAgIGlmIGV2ZW50Lm9yaWdpbmFsRXZlbnQucGFnZVggPCBlbGVtZW50Q2VudGVyXG4gICAgICBzdGF0dXNJY29ucy5pbmRleChlbGVtZW50KVxuICAgIGVsc2UgaWYgZWxlbWVudC5uZXh0KCcucGlvLXRlcm1pbmFsLXN0YXR1cy1pY29uJykubGVuZ3RoID4gMFxuICAgICAgc3RhdHVzSWNvbnMuaW5kZXgoZWxlbWVudC5uZXh0KCcucGlvLXRlcm1pbmFsLXN0YXR1cy1pY29uJykpXG4gICAgZWxzZVxuICAgICAgc3RhdHVzSWNvbnMuaW5kZXgoZWxlbWVudCkgKyAxXG5cbiAgZ2V0UGxhY2Vob2xkZXI6IC0+XG4gICAgQHBsYWNlaG9sZGVyRWwgPz0gJCgnPGxpIGNsYXNzPVwicGxhY2Vob2xkZXJcIj48L2xpPicpXG5cbiAgcmVtb3ZlUGxhY2Vob2xkZXI6IC0+XG4gICAgQHBsYWNlaG9sZGVyRWw/LnJlbW92ZSgpXG4gICAgQHBsYWNlaG9sZGVyRWwgPSBudWxsXG5cbiAgaXNQbGFjZWhvbGRlcjogKGVsZW1lbnQpIC0+XG4gICAgZWxlbWVudC5pcygnLnBsYWNlaG9sZGVyJylcblxuICBpY29uQXRJbmRleDogKGluZGV4KSAtPlxuICAgIEBnZXRTdGF0dXNJY29ucygpLmVxKGluZGV4KVxuXG4gIGdldFN0YXR1c0ljb25zOiAtPlxuICAgIEBzdGF0dXNDb250YWluZXIuY2hpbGRyZW4oJy5waW8tdGVybWluYWwtc3RhdHVzLWljb24nKVxuXG4gIG1vdmVJY29uVG9JbmRleDogKGljb24sIHRvSW5kZXgpIC0+XG4gICAgZm9sbG93aW5nSWNvbiA9IEBnZXRTdGF0dXNJY29ucygpW3RvSW5kZXhdXG4gICAgY29udGFpbmVyID0gQHN0YXR1c0NvbnRhaW5lclswXVxuICAgIGlmIGZvbGxvd2luZ0ljb24/XG4gICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKGljb24sIGZvbGxvd2luZ0ljb24pXG4gICAgZWxzZVxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGljb24pXG5cbiAgbW92ZVRlcm1pbmFsVmlldzogKGZyb21JbmRleCwgdG9JbmRleCkgPT5cbiAgICBhY3RpdmVUZXJtaW5hbCA9IEBnZXRBY3RpdmVUZXJtaW5hbFZpZXcoKVxuICAgIHZpZXcgPSBAdGVybWluYWxWaWV3cy5zcGxpY2UoZnJvbUluZGV4LCAxKVswXVxuICAgIEB0ZXJtaW5hbFZpZXdzLnNwbGljZSB0b0luZGV4LCAwLCB2aWV3XG4gICAgQHNldEFjdGl2ZVRlcm1pbmFsVmlldyBhY3RpdmVUZXJtaW5hbFxuXG4gIHVwZGF0ZU9yZGVyOiAoZnJvbUluZGV4LCB0b0luZGV4KSAtPlxuICAgIHJldHVybiBpZiBmcm9tSW5kZXggaXMgdG9JbmRleFxuICAgIHRvSW5kZXgtLSBpZiBmcm9tSW5kZXggPCB0b0luZGV4XG5cbiAgICBpY29uID0gQGdldFN0YXR1c0ljb25zKCkuZXEoZnJvbUluZGV4KS5kZXRhY2goKVxuICAgIEBtb3ZlSWNvblRvSW5kZXggaWNvbi5nZXQoMCksIHRvSW5kZXhcbiAgICBAbW92ZVRlcm1pbmFsVmlldyBmcm9tSW5kZXgsIHRvSW5kZXhcbiAgICBpY29uLmFkZENsYXNzICdpbnNlcnRlZCdcbiAgICBpY29uLm9uZSAnd2Via2l0QW5pbWF0aW9uRW5kJywgLT4gaWNvbi5yZW1vdmVDbGFzcygnaW5zZXJ0ZWQnKVxuIl19
