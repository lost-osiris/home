(function() {
  var $, CompositeDisposable, ConfigView, TextEditorView, View, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $ = ref.$, View = ref.View, TextEditorView = ref.TextEditorView;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = ConfigView = (function(superClass) {
    extend(ConfigView, superClass);

    function ConfigView() {
      return ConfigView.__super__.constructor.apply(this, arguments);
    }

    ConfigView.prototype.panel = null;

    ConfigView.content = function() {
      return this.div({
        "class": 'remote-sync'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'block'
          }, function() {
            return _this.div({
              "class": 'btn-group',
              outlet: 'transportGroup'
            }, function() {
              _this.button({
                "class": 'btn  selected',
                targetBlock: 'authenticationButtonsBlock'
              }, 'SCP/SFTP');
              return _this.button({
                "class": 'btn',
                targetBlock: 'ftpPasswordBlock'
              }, 'FTP');
            });
          });
          _this.label('Hostname');
          _this.subview('hostname', new TextEditorView({
            mini: true
          }));
          _this.label('Port');
          _this.subview('port', new TextEditorView({
            mini: true
          }));
          _this.label('Target directory');
          _this.subview('target', new TextEditorView({
            mini: true
          }));
          _this.label('Ignore Paths');
          _this.subview('ignore', new TextEditorView({
            mini: true,
            placeholderText: "Default: .remote-sync.json, .git/**"
          }));
          _this.label('Username');
          _this.subview('username', new TextEditorView({
            mini: true
          }));
          _this.div({
            "class": 'block',
            outlet: 'authenticationButtonsBlock'
          }, function() {
            _this.div({
              "class": 'btn-group'
            }, function() {
              _this.a({
                "class": 'btn  selected',
                targetBlock: 'privateKeyBlock'
              }, 'privatekey');
              _this.a({
                "class": 'btn',
                targetBlock: 'passwordBlock'
              }, 'password');
              return _this.a({
                "class": 'btn',
                outlet: 'userAgentButton'
              }, 'useAgent');
            });
            _this.div({
              "class": 'block',
              outlet: 'privateKeyBlock'
            }, function() {
              _this.label('Keyfile path');
              _this.subview('privateKeyPath', new TextEditorView({
                mini: true
              }));
              _this.label('Passphrase');
              return _this.subview('privateKeyPassphrase', new TextEditorView({
                mini: true,
                placeholderText: "leave blank if private key is unencrypted"
              }));
            });
            return _this.div({
              "class": 'block',
              outlet: 'passwordBlock',
              style: 'display:none'
            }, function() {
              _this.label('Password');
              return _this.subview('password', new TextEditorView({
                mini: true
              }));
            });
          });
          _this.div({
            "class": 'block',
            outlet: 'ftpPasswordBlock',
            style: 'display:none'
          }, function() {
            return _this.label('Password');
          });
          _this.label('Watch automatically');
          _this.subview('watch', new TextEditorView({
            mini: true,
            placeholderText: "Files that will be automatically watched on project open"
          }));
          _this.div(function() {
            return _this.label(" uploadOnSave", function() {
              return _this.input({
                type: 'checkbox',
                outlet: 'uploadOnSave'
              });
            });
          });
          _this.div(function() {
            return _this.label(" useAtomicWrites", function() {
              return _this.input({
                type: 'checkbox',
                outlet: 'useAtomicWrites'
              });
            });
          });
          _this.label(" Delete local file/folder upon remote delete", function() {
            return _this.input({
              type: 'checkbox',
              outlet: 'deleteLocal'
            });
          });
          return _this.div({
            "class": 'block pull-right'
          }, function() {
            _this.button({
              "class": 'inline-block-tight btn',
              outlet: 'cancelButton',
              click: 'close'
            }, 'Cancel');
            return _this.button({
              "class": 'inline-block-tight btn',
              outlet: 'saveButton',
              click: 'confirm'
            }, 'Save');
          });
        };
      })(this));
    };

    ConfigView.prototype.initialize = function(host) {
      this.host = host;
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.commands.add('atom-workspace', {
        'core:confirm': (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function(event) {
            _this.close();
            return event.stopPropagation();
          };
        })(this)
      }));
      this.transportGroup.on('click', (function(_this) {
        return function(e) {
          var btn, targetBlock;
          e.preventDefault();
          btn = $(e.target);
          targetBlock = btn.addClass('selected').siblings('.selected').removeClass('selected').attr("targetBlock");
          if (targetBlock) {
            _this[targetBlock].hide();
          }
          targetBlock = btn.attr("targetBlock");
          if (targetBlock) {
            _this[targetBlock].show();
          }
          _this.host.transport = btn.text().split("/")[0].toLowerCase();
          if (_this.host.transport === "scp") {
            return _this.passwordBlock.append(_this.password);
          } else {
            return _this.ftpPasswordBlock.append(_this.password);
          }
        };
      })(this));
      return $('.btn-group .btn', this.authenticationButtonsBlock).on('click', (function(_this) {
        return function(e) {
          var targetBlock;
          e.preventDefault();
          targetBlock = $(e.target).addClass('selected').siblings('.selected').removeClass('selected').attr("targetBlock");
          if (targetBlock) {
            _this[targetBlock].hide();
          }
          targetBlock = $(e.target).attr("targetBlock");
          if (targetBlock) {
            return _this[targetBlock].show().find(".editor").first().focus();
          }
        };
      })(this));
    };

    ConfigView.prototype.attach = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.find(".editor").each((function(_this) {
        return function(i, editor) {
          var dataName;
          dataName = $(editor).prev().text().split(" ")[0].toLowerCase();
          return $(editor).view().setText(_this.host[dataName] || "");
        };
      })(this));
      this.uploadOnSave.prop('checked', this.host.uploadOnSave);
      this.useAtomicWrites.prop('checked', this.host.useAtomicWrites);
      this.deleteLocal.prop('checked', this.host.deleteLocal);
      if (this.host.transport) {
        $(":contains('" + this.host.transport.toUpperCase() + "')", this.transportGroup).click();
      }
      if (this.host.transport === "scp") {
        return $('.btn-group .btn', this.authenticationButtonsBlock).each((function(_this) {
          return function(i, btn) {
            btn = $(btn);
            if (!_this.host[btn.text()]) {
              return;
            }
            btn.click();
            return false;
          };
        })(this));
      }
    };

    ConfigView.prototype.close = function() {
      this.detach();
      this.panel.destroy();
      this.panel = null;
      return this.disposables.dispose();
    };

    ConfigView.prototype.confirm = function() {
      this.host.uploadOnSave = this.uploadOnSave.prop('checked');
      this.host.useAtomicWrites = this.useAtomicWrites.prop('checked');
      this.host.deleteLocal = this.deleteLocal.prop('checked');
      this.find(".editor").each((function(_this) {
        return function(i, editor) {
          var dataName, val, view;
          dataName = $(editor).prev().text().split(" ")[0].toLowerCase();
          view = $(editor).view();
          val = view.getText();
          if (val === "" || view.parent().isHidden() || view.parent().parent().isHidden()) {
            val = void 0;
          }
          return _this.host[dataName] = val;
        };
      })(this));
      if ((this.host.transport === void 0 || this.host.transport === "scp") && this.userAgentButton.hasClass('selected')) {
        this.host.useAgent = true;
      } else {
        this.host.useAgent = void 0;
      }
      this.host.saveJSON();
      return this.close();
    };

    return ConfigView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3JlbW90ZS1zeW5jL2xpYi92aWV3L2hvc3Qtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDZEQUFBO0lBQUE7OztFQUFBLE1BQTRCLE9BQUEsQ0FBUSxzQkFBUixDQUE1QixFQUFDLFNBQUQsRUFBSSxlQUFKLEVBQVU7O0VBQ1Qsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O3lCQUNKLEtBQUEsR0FBTzs7SUFFUCxVQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUFQO09BQUwsRUFBMkIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3pCLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLE9BQU47V0FBTCxFQUFvQixTQUFBO21CQUNsQixLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxXQUFQO2NBQW9CLE1BQUEsRUFBUSxnQkFBNUI7YUFBTCxFQUFtRCxTQUFBO2NBQ2pELEtBQUMsQ0FBQSxNQUFELENBQVE7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxlQUFQO2dCQUF3QixXQUFBLEVBQWEsNEJBQXJDO2VBQVIsRUFBMkUsVUFBM0U7cUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLEtBQVA7Z0JBQWMsV0FBQSxFQUFZLGtCQUExQjtlQUFSLEVBQXNELEtBQXREO1lBRmlELENBQW5EO1VBRGtCLENBQXBCO1VBS0EsS0FBQyxDQUFBLEtBQUQsQ0FBTyxVQUFQO1VBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBUyxVQUFULEVBQXlCLElBQUEsY0FBQSxDQUFlO1lBQUEs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QUFqQixDQUFBLENBQXVCLENBQUMsS0FBeEIsQ0FBOEIsR0FBOUIsQ0FBbUMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUF0QyxDQUFBO1VBQ1gsSUFBQSxHQUFPLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQUE7VUFDUCxHQUFBLEdBQU0sSUFBSSxDQUFDLE9BQUwsQ0FBQTtVQUNOLElBQW1CLEdBQUEsS0FBTyxFQUFQLElBQWEsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFhLENBQUMsUUFBZCxDQUFBLENBQWIsSUFBeUMsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFhLENBQUMsTUFBZCxDQUFBLENBQXNCLENBQUMsUUFBdkIsQ0FBQSxDQUE1RDtZQUFBLEdBQUEsR0FBTSxPQUFOOztpQkFDQSxLQUFDLENBQUEsSUFBSyxDQUFBLFFBQUEsQ0FBTixHQUFrQjtRQUxFO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtNQU9BLElBQUcsQ0FBQyxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sS0FBbUIsTUFBbkIsSUFBZ0MsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEtBQW1CLEtBQXBELENBQUEsSUFBK0QsSUFBQyxDQUFBLGVBQWUsQ0FBQyxRQUFqQixDQUEwQixVQUExQixDQUFsRTtRQUNFLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTixHQUFpQixLQURuQjtPQUFBLE1BQUE7UUFHRSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQU4sR0FBaUIsT0FIbkI7O01BS0EsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFOLENBQUE7YUFDQSxJQUFDLENBQUEsS0FBRCxDQUFBO0lBakJPOzs7O0tBcEhjO0FBSnpCIiwic291cmNlc0NvbnRlbnQiOlsieyQsIFZpZXcsIFRleHRFZGl0b3JWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ29uZmlnVmlldyBleHRlbmRzIFZpZXdcbiAgcGFuZWw6IG51bGxcblxuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAncmVtb3RlLXN5bmMnLCA9PlxuICAgICAgQGRpdiBjbGFzczonYmxvY2snLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnYnRuLWdyb3VwJywgb3V0bGV0OiAndHJhbnNwb3J0R3JvdXAnLCA9PlxuICAgICAgICAgIEBidXR0b24gY2xhc3M6ICdidG4gIHNlbGVjdGVkJywgdGFyZ2V0QmxvY2s6ICdhdXRoZW50aWNhdGlvbkJ1dHRvbnNCbG9jaycsICdTQ1AvU0ZUUCdcbiAgICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuJywgdGFyZ2V0QmxvY2s6J2Z0cFBhc3N3b3JkQmxvY2snLCAnRlRQJ1xuXG4gICAgICBAbGFiZWwgJ0hvc3RuYW1lJ1xuICAgICAgQHN1YnZpZXcgJ2hvc3RuYW1lJywgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUpXG5cbiAgICAgIEBsYWJlbCAnUG9ydCdcbiAgICAgIEBzdWJ2aWV3ICdwb3J0JywgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUpXG5cbiAgICAgIEBsYWJlbCAnVGFyZ2V0IGRpcmVjdG9yeSdcbiAgICAgIEBzdWJ2aWV3ICd0YXJnZXQnLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSlcblxuICAgICAgQGxhYmVsICdJZ25vcmUgUGF0aHMnXG4gICAgICBAc3VidmlldyAnaWdub3JlJywgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUsIHBsYWNlaG9sZGVyVGV4dDogXCJEZWZhdWx0OiAucmVtb3RlLXN5bmMuanNvbiwgLmdpdC8qKlwiKVxuXG4gICAgICBAbGFiZWwgJ1VzZXJuYW1lJ1xuICAgICAgQHN1YnZpZXcgJ3VzZXJuYW1lJywgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUpXG5cbiAgICAgIEBkaXYgY2xhc3M6ICdibG9jaycsIG91dGxldDogJ2F1dGhlbnRpY2F0aW9uQnV0dG9uc0Jsb2NrJywgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ2J0bi1ncm91cCcsID0+XG4gICAgICAgICAgQGEgY2xhc3M6ICdidG4gIHNlbGVjdGVkJywgdGFyZ2V0QmxvY2s6ICdwcml2YXRlS2V5QmxvY2snLCAncHJpdmF0ZWtleSdcbiAgICAgICAgICBAYSBjbGFzczogJ2J0bicsIHRhcmdldEJsb2NrOiAncGFzc3dvcmRCbG9jaycsICdwYXNzd29yZCdcbiAgICAgICAgICBAYSBjbGFzczogJ2J0bicsIG91dGxldDogJ3VzZXJBZ2VudEJ1dHRvbicsICd1c2VBZ2VudCdcblxuICAgICAgICBAZGl2IGNsYXNzOiAnYmxvY2snLCBvdXRsZXQ6ICdwcml2YXRlS2V5QmxvY2snLCA9PlxuICAgICAgICAgIEBsYWJlbCAnS2V5ZmlsZSBwYXRoJ1xuICAgICAgICAgIEBzdWJ2aWV3ICdwcml2YXRlS2V5UGF0aCcsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlKVxuICAgICAgICAgIEBsYWJlbCAnUGFzc3BocmFzZSdcbiAgICAgICAgICBAc3VidmlldyAncHJpdmF0ZUtleVBhc3NwaHJhc2UnLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSwgcGxhY2Vob2xkZXJUZXh0OiBcImxlYXZlIGJsYW5rIGlmIHByaXZhdGUga2V5IGlzIHVuZW5jcnlwdGVkXCIpXG5cbiAgICAgICAgQGRpdiBjbGFzczogJ2Jsb2NrJywgb3V0bGV0OiAncGFzc3dvcmRCbG9jaycsIHN0eWxlOiAnZGlzcGxheTpub25lJywgPT5cbiAgICAgICAgICBAbGFiZWwgJ1Bhc3N3b3JkJ1xuICAgICAgICAgIEBzdWJ2aWV3ICdwYXNzd29yZCcsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlKVxuXG4gICAgICBAZGl2IGNsYXNzOiAnYmxvY2snLCBvdXRsZXQ6ICdmdHBQYXNzd29yZEJsb2NrJywgc3R5bGU6ICdkaXNwbGF5Om5vbmUnLCA9PlxuICAgICAgICBAbGFiZWwgJ1Bhc3N3b3JkJ1xuXG4gICAgICBAbGFiZWwgJ1dhdGNoIGF1dG9tYXRpY2FsbHknXG4gICAgICBAc3VidmlldyAnd2F0Y2gnLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSwgcGxhY2Vob2xkZXJUZXh0OiBcIkZpbGVzIHRoYXQgd2lsbCBiZSBhdXRvbWF0aWNhbGx5IHdhdGNoZWQgb24gcHJvamVjdCBvcGVuXCIpXG5cbiAgICAgIEBkaXYgPT5cbiAgICAgICAgQGxhYmVsIFwiIHVwbG9hZE9uU2F2ZVwiLCA9PlxuICAgICAgICAgIEBpbnB1dCB0eXBlOiAnY2hlY2tib3gnLCBvdXRsZXQ6ICd1cGxvYWRPblNhdmUnXG5cbiAgICAgIEBkaXYgPT5cbiAgICAgICAgQGxhYmVsIFwiIHVzZUF0b21pY1dyaXRlc1wiLCA9PlxuICAgICAgICAgIEBpbnB1dCB0eXBlOiAnY2hlY2tib3gnLCBvdXRsZXQ6ICd1c2VBdG9taWNXcml0ZXMnXG5cbiAgICAgIEBsYWJlbCBcIiBEZWxldGUgbG9jYWwgZmlsZS9mb2xkZXIgdXBvbiByZW1vdGUgZGVsZXRlXCIsID0+XG4gICAgICAgIEBpbnB1dCB0eXBlOiAnY2hlY2tib3gnLCBvdXRsZXQ6ICdkZWxldGVMb2NhbCdcblxuICAgICAgQGRpdiBjbGFzczogJ2Jsb2NrIHB1bGwtcmlnaHQnLCA9PlxuICAgICAgICBAYnV0dG9uIGNsYXNzOiAnaW5saW5lLWJsb2NrLXRpZ2h0IGJ0bicsIG91dGxldDogJ2NhbmNlbEJ1dHRvbicsIGNsaWNrOiAnY2xvc2UnLCAnQ2FuY2VsJ1xuICAgICAgICBAYnV0dG9uIGNsYXNzOiAnaW5saW5lLWJsb2NrLXRpZ2h0IGJ0bicsIG91dGxldDogJ3NhdmVCdXR0b24nLCBjbGljazogJ2NvbmZpcm0nLCAnU2F2ZSdcblxuICBpbml0aWFsaXplOiAoQGhvc3QpIC0+XG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAgICdjb3JlOmNvbmZpcm0nOiA9PiBAY29uZmlybSgpXG4gICAgICAgICdjb3JlOmNhbmNlbCc6IChldmVudCkgPT5cbiAgICAgICAgICBAY2xvc2UoKVxuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICBAdHJhbnNwb3J0R3JvdXAub24gJ2NsaWNrJywgKGUpPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgYnRuID0gJChlLnRhcmdldClcbiAgICAgIHRhcmdldEJsb2NrID0gYnRuLmFkZENsYXNzKCdzZWxlY3RlZCcpLnNpYmxpbmdzKCcuc2VsZWN0ZWQnKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKS5hdHRyKFwidGFyZ2V0QmxvY2tcIilcbiAgICAgIHRoaXNbdGFyZ2V0QmxvY2tdLmhpZGUoKSBpZiB0YXJnZXRCbG9ja1xuXG4gICAgICB0YXJnZXRCbG9jayA9IGJ0bi5hdHRyKFwidGFyZ2V0QmxvY2tcIilcbiAgICAgIHRoaXNbdGFyZ2V0QmxvY2tdLnNob3coKSBpZiB0YXJnZXRCbG9ja1xuICAgICAgQGhvc3QudHJhbnNwb3J0ID0gYnRuLnRleHQoKS5zcGxpdChcIi9cIilbMF0udG9Mb3dlckNhc2UoKVxuICAgICAgaWYgQGhvc3QudHJhbnNwb3J0ID09IFwic2NwXCJcbiAgICAgICAgQHBhc3N3b3JkQmxvY2suYXBwZW5kKEBwYXNzd29yZClcbiAgICAgIGVsc2VcbiAgICAgICAgQGZ0cFBhc3N3b3JkQmxvY2suYXBwZW5kKEBwYXNzd29yZClcblxuICAgICQoJy5idG4tZ3JvdXAgLmJ0bicsIEBhdXRoZW50aWNhdGlvbkJ1dHRvbnNCbG9jaykub24gJ2NsaWNrJywgKGUpPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGFyZ2V0QmxvY2sgPSAkKGUudGFyZ2V0KS5hZGRDbGFzcygnc2VsZWN0ZWQnKS5zaWJsaW5ncygnLnNlbGVjdGVkJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJykuYXR0cihcInRhcmdldEJsb2NrXCIpXG4gICAgICB0aGlzW3RhcmdldEJsb2NrXS5oaWRlKCkgaWYgdGFyZ2V0QmxvY2tcblxuICAgICAgdGFyZ2V0QmxvY2sgPSAkKGUudGFyZ2V0KS5hdHRyKFwidGFyZ2V0QmxvY2tcIilcbiAgICAgIHRoaXNbdGFyZ2V0QmxvY2tdLnNob3coKS5maW5kKFwiLmVkaXRvclwiKS5maXJzdCgpLmZvY3VzKCkgaWYgdGFyZ2V0QmxvY2tcblxuICBhdHRhY2g6IC0+XG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwgaXRlbTogdGhpc1xuXG4gICAgQGZpbmQoXCIuZWRpdG9yXCIpLmVhY2ggKGksIGVkaXRvcik9PlxuICAgICAgZGF0YU5hbWUgPSAkKGVkaXRvcikucHJldigpLnRleHQoKS5zcGxpdChcIiBcIilbMF0udG9Mb3dlckNhc2UoKVxuICAgICAgJChlZGl0b3IpLnZpZXcoKS5zZXRUZXh0KEBob3N0W2RhdGFOYW1lXSBvciBcIlwiKVxuXG4gICAgQHVwbG9hZE9uU2F2ZS5wcm9wKCdjaGVja2VkJywgQGhvc3QudXBsb2FkT25TYXZlKVxuICAgIEB1c2VBdG9taWNXcml0ZXMucHJvcCgnY2hlY2tlZCcsIEBob3N0LnVzZUF0b21pY1dyaXRlcylcbiAgICBAZGVsZXRlTG9jYWwucHJvcCgnY2hlY2tlZCcsIEBob3N0LmRlbGV0ZUxvY2FsKVxuICAgICQoXCI6Y29udGFpbnMoJ1wiK0Bob3N0LnRyYW5zcG9ydC50b1VwcGVyQ2FzZSgpK1wiJylcIiwgQHRyYW5zcG9ydEdyb3VwKS5jbGljaygpIGlmIEBob3N0LnRyYW5zcG9ydFxuICAgIGlmIEBob3N0LnRyYW5zcG9ydCBpcyBcInNjcFwiXG4gICAgICAkKCcuYnRuLWdyb3VwIC5idG4nLCBAYXV0aGVudGljYXRpb25CdXR0b25zQmxvY2spLmVhY2ggKGksIGJ0bik9PlxuICAgICAgICBidG4gPSAkKGJ0bilcbiAgICAgICAgcmV0dXJuIHVubGVzcyBAaG9zdFtidG4udGV4dCgpXVxuICAgICAgICBidG4uY2xpY2soKVxuICAgICAgICByZXR1cm4gZmFsc2VcblxuICBjbG9zZTogLT5cbiAgICBAZGV0YWNoKClcbiAgICBAcGFuZWwuZGVzdHJveSgpXG4gICAgQHBhbmVsID0gbnVsbFxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICBjb25maXJtOiAtPlxuICAgIEBob3N0LnVwbG9hZE9uU2F2ZSA9IEB1cGxvYWRPblNhdmUucHJvcCgnY2hlY2tlZCcpXG4gICAgQGhvc3QudXNlQXRvbWljV3JpdGVzID0gQHVzZUF0b21pY1dyaXRlcy5wcm9wKCdjaGVja2VkJylcbiAgICBAaG9zdC5kZWxldGVMb2NhbCA9IEBkZWxldGVMb2NhbC5wcm9wKCdjaGVja2VkJylcbiAgICBAZmluZChcIi5lZGl0b3JcIikuZWFjaCAoaSwgZWRpdG9yKT0+XG4gICAgICBkYXRhTmFtZSA9ICQoZWRpdG9yKS5wcmV2KCkudGV4dCgpLnNwbGl0KFwiIFwiKVswXS50b0xvd2VyQ2FzZSgpXG4gICAgICB2aWV3ID0gJChlZGl0b3IpLnZpZXcoKVxuICAgICAgdmFsID0gdmlldy5nZXRUZXh0KClcbiAgICAgIHZhbCA9IHVuZGVmaW5lZCBpZiB2YWwgPT0gXCJcIiBvciB2aWV3LnBhcmVudCgpLmlzSGlkZGVuKCkgb3Igdmlldy5wYXJlbnQoKS5wYXJlbnQoKS5pc0hpZGRlbigpXG4gICAgICBAaG9zdFtkYXRhTmFtZV0gPSB2YWxcblxuICAgIGlmIChAaG9zdC50cmFuc3BvcnQgPT0gdW5kZWZpbmVkIG9yIEBob3N0LnRyYW5zcG9ydCA9PSBcInNjcFwiKSBhbmQgQHVzZXJBZ2VudEJ1dHRvbi5oYXNDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgQGhvc3QudXNlQWdlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgQGhvc3QudXNlQWdlbnQgPSB1bmRlZmluZWRcblxuICAgIEBob3N0LnNhdmVKU09OKClcbiAgICBAY2xvc2UoKVxuIl19
