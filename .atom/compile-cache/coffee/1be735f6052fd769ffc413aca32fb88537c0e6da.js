(function() {
  var $, $$, $$$, MessageView, View, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require("atom-space-pen-views"), $ = ref.$, $$ = ref.$$, $$$ = ref.$$$, View = ref.View;

  module.exports = MessageView = (function(superClass) {
    extend(MessageView, superClass);

    MessageView.prototype.messages = [];

    MessageView.content = function() {
      return this.div({
        "class": 'atom-beautify message-panel'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'overlay from-top'
          }, function() {
            return _this.div({
              "class": "tool-panel panel-bottom"
            }, function() {
              return _this.div({
                "class": "inset-panel"
              }, function() {
                _this.div({
                  "class": "panel-heading"
                }, function() {
                  _this.div({
                    "class": 'btn-toolbar pull-right'
                  }, function() {
                    return _this.button({
                      "class": 'btn',
                      click: 'clearMessages'
                    }, 'Clear');
                  });
                  return _this.span({
                    "class": '',
                    outlet: 'title'
                  }, 'Atom Beautify Message');
                });
                return _this.div({
                  "class": "panel-body padded select-list",
                  outlet: 'body'
                }, function() {
                  return _this.ol({
                    "class": 'list-group',
                    outlet: 'messageItems'
                  }, function() {
                    _this.li({
                      "class": 'two-lines'
                    }, function() {
                      _this.div({
                        "class": 'status status-removed icon icon-diff-added'
                      }, '');
                      _this.div({
                        "class": 'primary-line icon icon-alert'
                      }, 'This is the title');
                      return _this.div({
                        "class": 'secondary-line no-icon'
                      }, 'Secondary line');
                    });
                    _this.li({
                      "class": 'two-lines'
                    }, function() {
                      _this.div({
                        "class": 'status status-removed icon icon-diff-added'
                      }, '');
                      _this.div({
                        "class": 'primary-line icon icon-alert'
                      }, 'This is the title Currently there is no way to display a message to the user, such as errors or warnings or deprecation notices (see #40). Let\'s put a little overlay on the top for displaying such information.');
                      return _this.div({
                        "class": 'secondary-line no-icon'
                      }, 'This is the title Currently there is no way to display a message to the user, such as errors or warnings or deprecation notices (see #40). Let\'s put a little overlay on the top for displaying such information.');
                    });
                    _this.li({
                      "class": 'two-lines'
                    }, function() {
                      _this.div({
                        "class": 'status status-removed icon icon-diff-added'
                      }, '');
                      _this.div({
                        "class": 'primary-line icon icon-alert'
                      }, 'test');
                      return _this.div({
                        "class": 'secondary-line no-icon'
                      }, 'Secondary line');
                    });
                    _this.li({
                      "class": 'two-lines'
                    }, function() {
                      _this.div({
                        "class": 'status status-removed icon icon-diff-added'
                      }, '');
                      _this.div({
                        "class": 'primary-line icon icon-alert'
                      }, 'This is the title');
                      return _this.div({
                        "class": 'secondary-line no-icon'
                      }, 'Secondary line');
                    });
                    _this.li({
                      "class": 'two-lines'
                    }, function() {
                      _this.div({
                        "class": 'status status-removed icon icon-diff-added'
                      }, '');
                      _this.div({
                        "class": 'primary-line icon icon-alert'
                      }, 'This is the title');
                      return _this.div({
                        "class": 'secondary-line no-icon'
                      }, 'Secondary line');
                    });
                    return _this.li({
                      "class": 'two-lines'
                    }, function() {
                      _this.div({
                        "class": 'status status-added icon icon-diff-added'
                      }, '');
                      _this.div({
                        "class": 'primary-line icon icon-file-text'
                      }, 'Primary line');
                      return _this.div({
                        "class": 'secondary-line no-icon'
                      }, 'Secondary line');
                    });
                  });
                });
              });
            });
          });
        };
      })(this));
    };

    function MessageView() {
      this.refresh = bind(this.refresh, this);
      this.show = bind(this.show, this);
      this.close = bind(this.close, this);
      this.clearMessages = bind(this.clearMessages, this);
      this.addMessage = bind(this.addMessage, this);
      MessageView.__super__.constructor.apply(this, arguments);
    }

    MessageView.prototype.destroy = function() {};

    MessageView.prototype.addMessage = function(message) {
      this.messages.push(message);
      return this.refresh();
    };

    MessageView.prototype.clearMessages = function() {
      this.messages = [];
      return this.refresh();
    };

    MessageView.prototype.close = function(event, element) {
      return this.detach();
    };

    MessageView.prototype.show = function() {
      if (!this.hasParent()) {
        return atom.workspaceView.appendToTop(this);
      }
    };

    MessageView.prototype.refresh = function() {
      if (this.messages.length === 0) {
        return this.close();
      } else {
        return this.show();
      }
    };

    return MessageView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL3ZpZXdzL21lc3NhZ2Utdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGtDQUFBO0lBQUE7Ozs7RUFBQSxNQUFxQixPQUFBLENBQVEsc0JBQVIsQ0FBckIsRUFBQyxTQUFELEVBQUksV0FBSixFQUFRLGFBQVIsRUFBYTs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUNNOzs7MEJBQ0osUUFBQSxHQUFVOztJQUNWLFdBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQ0U7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLDZCQUFQO09BREYsRUFDd0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNwQyxLQUFDLENBQUEsR0FBRCxDQUNFO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxrQkFBUDtXQURGLEVBQzZCLFNBQUE7bUJBQ3pCLEtBQUMsQ0FBQSxHQUFELENBQUs7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHlCQUFQO2FBQUwsRUFBdUMsU0FBQTtxQkFDckMsS0FBQyxDQUFBLEdBQUQsQ0FBSztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGFBQVA7ZUFBTCxFQUEyQixTQUFBO2dCQUN6QixLQUFDLENBQUEsR0FBRCxDQUFLO2tCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sZUFBUDtpQkFBTCxFQUE2QixTQUFBO2tCQUMzQixLQUFDLENBQUEsR0FBRCxDQUFLO29CQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sd0JBQVA7bUJBQUwsRUFBc0MsU0FBQTsyQkFDcEMsS0FBQyxDQUFBLE1BQUQsQ0FDRTtzQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLEtBQVA7c0JBQ0EsS0FBQSxFQUFPLGVBRFA7cUJBREYsRUFHRSxPQUhGO2tCQURvQyxDQUF0Qzt5QkFLQSxL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K0IsSUFBL0IsRUFERjs7SUFESTs7MEJBSU4sT0FBQSxHQUFTLFNBQUE7TUFFUCxJQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixLQUFvQixDQUF2QjtlQUNFLElBQUMsQ0FBQSxLQUFELENBQUEsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBSEY7O0lBRk87Ozs7S0F4RWU7QUFIMUIiLCJzb3VyY2VzQ29udGVudCI6WyJ7JCwgJCQsICQkJCwgVmlld30gPSByZXF1aXJlIFwiYXRvbS1zcGFjZS1wZW4tdmlld3NcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBNZXNzYWdlVmlldyBleHRlbmRzIFZpZXdcbiAgbWVzc2FnZXM6IFtdXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXZcbiAgICAgIGNsYXNzOiAnYXRvbS1iZWF1dGlmeSBtZXNzYWdlLXBhbmVsJywgPT5cbiAgICAgICAgQGRpdlxuICAgICAgICAgIGNsYXNzOiAnb3ZlcmxheSBmcm9tLXRvcCcsID0+XG4gICAgICAgICAgICBAZGl2IGNsYXNzOiBcInRvb2wtcGFuZWwgcGFuZWwtYm90dG9tXCIsID0+XG4gICAgICAgICAgICAgIEBkaXYgY2xhc3M6IFwiaW5zZXQtcGFuZWxcIiwgPT5cbiAgICAgICAgICAgICAgICBAZGl2IGNsYXNzOiBcInBhbmVsLWhlYWRpbmdcIiwgPT5cbiAgICAgICAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdidG4tdG9vbGJhciBwdWxsLXJpZ2h0JywgPT5cbiAgICAgICAgICAgICAgICAgICAgQGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiAnYnRuJ1xuICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiAnY2xlYXJNZXNzYWdlcydcbiAgICAgICAgICAgICAgICAgICAgICAnQ2xlYXInXG4gICAgICAgICAgICAgICAgICBAc3BhblxuICAgICAgICAgICAgICAgICAgICBjbGFzczogJydcbiAgICAgICAgICAgICAgICAgICAgb3V0bGV0OiAndGl0bGUnXG4gICAgICAgICAgICAgICAgICAgICdBdG9tIEJlYXV0aWZ5IE1lc3NhZ2UnXG4gICAgICAgICAgICAgICAgQGRpdlxuICAgICAgICAgICAgICAgICAgY2xhc3M6IFwicGFuZWwtYm9keSBwYWRkZWQgc2VsZWN0LWxpc3RcIlxuICAgICAgICAgICAgICAgICAgb3V0bGV0OiAnYm9keSdcbiAgICAgICAgICAgICAgICAgID0+XG4gICAgICAgICAgICAgICAgICAgIEBvbFxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiAnbGlzdC1ncm91cCcsXG4gICAgICAgICAgICAgICAgICAgICAgb3V0bGV0OiAnbWVzc2FnZUl0ZW1zJ1xuICAgICAgICAgICAgICAgICAgICAgID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBAbGkgY2xhc3M6ICd0d28tbGluZXMnLCA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICBAZGl2IGNsYXNzOiAnc3RhdHVzIHN0YXR1cy1yZW1vdmVkIGljb24gaWNvbi1kaWZmLWFkZGVkJywgJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgQGRpdiBjbGFzczogJ3ByaW1hcnktbGluZSBpY29uIGljb24tYWxlcnQnLCAnVGhpcyBpcyB0aGUgdGl0bGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdzZWNvbmRhcnktbGluZSBuby1pY29uJywgJ1NlY29uZGFyeSBsaW5lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgQGxpIGNsYXNzOiAndHdvLWxpbmVzJywgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgQGRpdiBjbGFzczogJ3N0YXR1cyBzdGF0dXMtcmVtb3ZlZCBpY29uIGljb24tZGlmZi1hZGRlZCcsICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdwcmltYXJ5LWxpbmUgaWNvbiBpY29uLWFsZXJ0JywgJ1RoaXMgaXMgdGhlIHRpdGxlIEN1cnJlbnRseSB0aGVyZSBpcyBubyB3YXkgdG8gZGlzcGxheSBhIG1lc3NhZ2UgdG8gdGhlIHVzZXIsIHN1Y2ggYXMgZXJyb3JzIG9yIHdhcm5pbmdzIG9yIGRlcHJlY2F0aW9uIG5vdGljZXMgKHNlZSAjNDApLiBMZXRcXCdzIHB1dCBhIGxpdHRsZSBvdmVybGF5IG9uIHRoZSB0b3AgZm9yIGRpc3BsYXlpbmcgc3VjaCBpbmZvcm1hdGlvbi4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdzZWNvbmRhcnktbGluZSBuby1pY29uJywgJ1RoaXMgaXMgdGhlIHRpdGxlIEN1cnJlbnRseSB0aGVyZSBpcyBubyB3YXkgdG8gZGlzcGxheSBhIG1lc3NhZ2UgdG8gdGhlIHVzZXIsIHN1Y2ggYXMgZXJyb3JzIG9yIHdhcm5pbmdzIG9yIGRlcHJlY2F0aW9uIG5vdGljZXMgKHNlZSAjNDApLiBMZXRcXCdzIHB1dCBhIGxpdHRsZSBvdmVybGF5IG9uIHRoZSB0b3AgZm9yIGRpc3BsYXlpbmcgc3VjaCBpbmZvcm1hdGlvbi4nXG4gICAgICAgICAgICAgICAgICAgICAgICBAbGkgY2xhc3M6ICd0d28tbGluZXMnLCA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICBAZGl2IGNsYXNzOiAnc3RhdHVzIHN0YXR1cy1yZW1vdmVkIGljb24gaWNvbi1kaWZmLWFkZGVkJywgJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgQGRpdiBjbGFzczogJ3ByaW1hcnktbGluZSBpY29uIGljb24tYWxlcnQnLCAndGVzdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgQGRpdiBjbGFzczogJ3NlY29uZGFyeS1saW5lIG5vLWljb24nLCAnU2Vjb25kYXJ5IGxpbmUnXG4gICAgICAgICAgICAgICAgICAgICAgICBAbGkgY2xhc3M6ICd0d28tbGluZXMnLCA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICBAZGl2IGNsYXNzOiAnc3RhdHVzIHN0YXR1cy1yZW1vdmVkIGljb24gaWNvbi1kaWZmLWFkZGVkJywgJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgQGRpdiBjbGFzczogJ3ByaW1hcnktbGluZSBpY29uIGljb24tYWxlcnQnLCAnVGhpcyBpcyB0aGUgdGl0bGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdzZWNvbmRhcnktbGluZSBuby1pY29uJywgJ1NlY29uZGFyeSBsaW5lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgQGxpIGNsYXNzOiAndHdvLWxpbmVzJywgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgQGRpdiBjbGFzczogJ3N0YXR1cyBzdGF0dXMtcmVtb3ZlZCBpY29uIGljb24tZGlmZi1hZGRlZCcsICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdwcmltYXJ5LWxpbmUgaWNvbiBpY29uLWFsZXJ0JywgJ1RoaXMgaXMgdGhlIHRpdGxlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICBAZGl2IGNsYXNzOiAnc2Vjb25kYXJ5LWxpbmUgbm8taWNvbicsICdTZWNvbmRhcnkgbGluZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIEBsaSBjbGFzczogJ3R3by1saW5lcycsID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdzdGF0dXMgc3RhdHVzLWFkZGVkIGljb24gaWNvbi1kaWZmLWFkZGVkJywgJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgQGRpdiBjbGFzczogJ3ByaW1hcnktbGluZSBpY29uIGljb24tZmlsZS10ZXh0JywgJ1ByaW1hcnkgbGluZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgQGRpdiBjbGFzczogJ3NlY29uZGFyeS1saW5lIG5vLWljb24nLCAnU2Vjb25kYXJ5IGxpbmUnXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcblxuICBkZXN0cm95OiAtPlxuXG4gIGFkZE1lc3NhZ2U6IChtZXNzYWdlKSA9PlxuICAgIEBtZXNzYWdlcy5wdXNoKG1lc3NhZ2UpXG4gICAgQHJlZnJlc2goKVxuXG4gIGNsZWFyTWVzc2FnZXM6ID0+XG4gICAgQG1lc3NhZ2VzID0gW11cbiAgICBAcmVmcmVzaCgpXG5cbiAgY2xvc2U6IChldmVudCwgZWxlbWVudCkgPT5cbiAgICBAZGV0YWNoKClcblxuICBzaG93OiA9PlxuICAgIGlmIG5vdCBALmhhc1BhcmVudCgpXG4gICAgICBhdG9tLndvcmtzcGFjZVZpZXcuYXBwZW5kVG9Ub3AgQFxuXG4gIHJlZnJlc2g6ID0+XG4gICAgIyBJZiB0aGUgbWVzc2FnZXMgbGlzdCBpcyBlbXB0eSwgdmlldyBzaG91bGQgYmUgY2xvc2VkLlxuICAgIGlmIEBtZXNzYWdlcy5sZW5ndGggaXMgMFxuICAgICAgQGNsb3NlKClcbiAgICBlbHNlXG4gICAgICBAc2hvdygpXG4iXX0=
