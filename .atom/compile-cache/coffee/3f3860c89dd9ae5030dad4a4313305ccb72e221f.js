(function() {
  var LoadingView, TextEditorView, View, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), View = ref.View, TextEditorView = ref.TextEditorView;

  module.exports = LoadingView = (function(superClass) {
    extend(LoadingView, superClass);

    function LoadingView() {
      this.show = bind(this.show, this);
      this.hide = bind(this.hide, this);
      return LoadingView.__super__.constructor.apply(this, arguments);
    }

    LoadingView.content = function() {
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
                      click: 'hide'
                    }, 'Hide');
                  });
                  return _this.span({
                    "class": 'text-primary',
                    outlet: 'title'
                  }, 'Atom Beautify');
                });
                return _this.div({
                  "class": "panel-body padded select-list text-center",
                  outlet: 'body'
                }, function() {
                  return _this.div(function() {
                    _this.span({
                      "class": 'text-center loading loading-spinner-large inline-block'
                    });
                    return _this.div({
                      "class": ''
                    }, 'Beautification in progress.');
                  });
                });
              });
            });
          });
        };
      })(this));
    };

    LoadingView.prototype.hide = function(event, element) {
      return this.detach();
    };

    LoadingView.prototype.show = function() {
      if (!this.hasParent()) {
        return atom.workspace.addTopPanel({
          item: this
        });
      }
    };

    return LoadingView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL3ZpZXdzL2xvYWRpbmctdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHNDQUFBO0lBQUE7Ozs7RUFBQSxNQUF5QixPQUFBLENBQVEsc0JBQVIsQ0FBekIsRUFBQyxlQUFELEVBQU87O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozs7O0lBQ0osV0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FDRTtRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sNkJBQVA7T0FERixFQUN3QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3BDLEtBQUMsQ0FBQSxHQUFELENBQ0U7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGtCQUFQO1dBREYsRUFDNkIsU0FBQTttQkFDekIsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8seUJBQVA7YUFBTCxFQUF1QyxTQUFBO3FCQUNyQyxLQUFDLENBQUEsR0FBRCxDQUFLO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sYUFBUDtlQUFMLEVBQTJCLFNBQUE7Z0JBQ3pCLEtBQUMsQ0FBQSxHQUFELENBQUs7a0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxlQUFQO2lCQUFMLEVBQTZCLFNBQUE7a0JBQzNCLEtBQUMsQ0FBQSxHQUFELENBQUs7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx3QkFBUDttQkFBTCxFQUFzQyxTQUFBOzJCQUNwQyxLQUFDLENBQUEsTUFBRCxDQUNFO3NCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sS0FBUDtzQkFDQSxLQUFBLEVBQU8sTUFEUDtxQkFERixFQUdFLE1BSEY7a0JBRG9DLENBQXRDO3lCQUtBLEtBQUMsQ0FBQSxJQUFELENBQ0U7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxjQUFQO29CQUNBLE1BQUEsRUFBUSxPQURSO21CQURGLEVBR0UsZUFIRjtnQkFOMkIsQ0FBN0I7dUJBVUEsS0FBQyxDQUFBLEdBQUQsQ0FDRTtrQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLDJDQUFQO2tCQUNBLE1BQUEsRUFBUSxNQURSO2lCQURGLEVBR0UsU0FBQTt5QkFDRSxLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUE7b0JBQ0gsS0FBQyxDQUFBLElBQUQsQ0FDRTtzQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHdEQUFQO3FCQURGOzJCQUVBLEtBQUMsQ0FBQSxHQUFELENBQ0U7c0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxFQUFQO3FCQURGLEVBRUUsNkJBRkY7a0JBSEcsQ0FBTDtnQkFERixDQUhGO2NBWHlCLENBQTNCO1lBRHFDLENBQXZDO1VBRHlCLENBRDdCO1FBRG9DO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUR4QztJQURROzswQkE0QlYsSUFBQSxHQUFNLFNBQUMsS0FBRCxFQUFRLE9BQVI7YUFDSixJQUFDLENBQUEsTUFBRCxDQUFBO0lBREk7OzBCQUdOLElBQUEsR0FBTSxTQUFBO01BQ0osSUFBRyxDQUFJLElBQUMsQ0FBQyxTQUFGLENBQUEsQ0FBUDtlQUNFLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBZixDQUEyQjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTNCLEVBREY7O0lBREk7Ozs7S0FoQ2tCO0FBSDFCIiwic291cmNlc0NvbnRlbnQiOlsie1ZpZXcsIFRleHRFZGl0b3JWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMb2FkaW5nVmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdlxuICAgICAgY2xhc3M6ICdhdG9tLWJlYXV0aWZ5IG1lc3NhZ2UtcGFuZWwnLCA9PlxuICAgICAgICBAZGl2XG4gICAgICAgICAgY2xhc3M6ICdvdmVybGF5IGZyb20tdG9wJywgPT5cbiAgICAgICAgICAgIEBkaXYgY2xhc3M6IFwidG9vbC1wYW5lbCBwYW5lbC1ib3R0b21cIiwgPT5cbiAgICAgICAgICAgICAgQGRpdiBjbGFzczogXCJpbnNldC1wYW5lbFwiLCA9PlxuICAgICAgICAgICAgICAgIEBkaXYgY2xhc3M6IFwicGFuZWwtaGVhZGluZ1wiLCA9PlxuICAgICAgICAgICAgICAgICAgQGRpdiBjbGFzczogJ2J0bi10b29sYmFyIHB1bGwtcmlnaHQnLCA9PlxuICAgICAgICAgICAgICAgICAgICBAYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3M6ICdidG4nXG4gICAgICAgICAgICAgICAgICAgICAgY2xpY2s6ICdoaWRlJ1xuICAgICAgICAgICAgICAgICAgICAgICdIaWRlJ1xuICAgICAgICAgICAgICAgICAgQHNwYW5cbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6ICd0ZXh0LXByaW1hcnknXG4gICAgICAgICAgICAgICAgICAgIG91dGxldDogJ3RpdGxlJ1xuICAgICAgICAgICAgICAgICAgICAnQXRvbSBCZWF1dGlmeSdcbiAgICAgICAgICAgICAgICBAZGl2XG4gICAgICAgICAgICAgICAgICBjbGFzczogXCJwYW5lbC1ib2R5IHBhZGRlZCBzZWxlY3QtbGlzdCB0ZXh0LWNlbnRlclwiXG4gICAgICAgICAgICAgICAgICBvdXRsZXQ6ICdib2R5J1xuICAgICAgICAgICAgICAgICAgPT5cbiAgICAgICAgICAgICAgICAgICAgQGRpdiA9PlxuICAgICAgICAgICAgICAgICAgICAgIEBzcGFuXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogJ3RleHQtY2VudGVyIGxvYWRpbmcgbG9hZGluZy1zcGlubmVyLWxhcmdlIGlubGluZS1ibG9jaydcbiAgICAgICAgICAgICAgICAgICAgICBAZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogJydcbiAgICAgICAgICAgICAgICAgICAgICAgICdCZWF1dGlmaWNhdGlvbiBpbiBwcm9ncmVzcy4nXG5cbiAgaGlkZTogKGV2ZW50LCBlbGVtZW50KSA9PlxuICAgIEBkZXRhY2goKVxuXG4gIHNob3c6ID0+XG4gICAgaWYgbm90IEAuaGFzUGFyZW50KClcbiAgICAgIGF0b20ud29ya3NwYWNlLmFkZFRvcFBhbmVsKGl0ZW06IEApXG4iXX0=
