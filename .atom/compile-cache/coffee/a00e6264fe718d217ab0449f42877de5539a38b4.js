(function() {
  var Dialog, RenameDialog,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require("./dialog");

  module.exports = RenameDialog = (function(superClass) {
    extend(RenameDialog, superClass);

    function RenameDialog(statusIcon) {
      this.statusIcon = statusIcon;
      RenameDialog.__super__.constructor.call(this, {
        prompt: "Rename",
        iconClass: "icon-pencil",
        placeholderText: this.statusIcon.getName()
      });
    }

    RenameDialog.prototype.onConfirm = function(newTitle) {
      this.statusIcon.updateName(newTitle.trim());
      return this.cancel();
    };

    return RenameDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi9yZW5hbWUtZGlhbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0JBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBQ007OztJQUNTLHNCQUFDLFVBQUQ7TUFBQyxJQUFDLENBQUEsYUFBRDtNQUNaLDhDQUNFO1FBQUEsTUFBQSxFQUFRLFFBQVI7UUFDQSxTQUFBLEVBQVcsYUFEWDtRQUVBLGVBQUEsRUFBaUIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQUEsQ0FGakI7T0FERjtJQURXOzsyQkFNYixTQUFBLEdBQVcsU0FBQyxRQUFEO01BQ1QsSUFBQyxDQUFBLFVBQVUsQ0FBQyxVQUFaLENBQXVCLFFBQVEsQ0FBQyxJQUFULENBQUEsQ0FBdkI7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBO0lBRlM7Ozs7S0FQYztBQUgzQiIsInNvdXJjZXNDb250ZW50IjpbIkRpYWxvZyA9IHJlcXVpcmUgXCIuL2RpYWxvZ1wiXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFJlbmFtZURpYWxvZyBleHRlbmRzIERpYWxvZ1xuICBjb25zdHJ1Y3RvcjogKEBzdGF0dXNJY29uKSAtPlxuICAgIHN1cGVyXG4gICAgICBwcm9tcHQ6IFwiUmVuYW1lXCJcbiAgICAgIGljb25DbGFzczogXCJpY29uLXBlbmNpbFwiXG4gICAgICBwbGFjZWhvbGRlclRleHQ6IEBzdGF0dXNJY29uLmdldE5hbWUoKVxuXG4gIG9uQ29uZmlybTogKG5ld1RpdGxlKSAtPlxuICAgIEBzdGF0dXNJY29uLnVwZGF0ZU5hbWUgbmV3VGl0bGUudHJpbSgpXG4gICAgQGNhbmNlbCgpXG4iXX0=
