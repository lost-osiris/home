(function() {
  var Dom;

  Dom = require(atom.packages.getLoadedPackage('seti-ui').path + '/lib/dom');

  module.exports = {
    addWhenFalse: function(obj) {
      if (!Array.isArray(obj.el)) {
        obj.el = [obj.el];
      }
      return obj.el.forEach(function(element) {
        var el;
        el = Dom.queryAll(element);
        if (!obj.bool) {
          return Dom.addClass(el, obj.className);
        } else {
          return Dom.removeClass(el, obj.className);
        }
      });
    },
    addWhenTrue: function(obj) {
      if (!Array.isArray(obj.el)) {
        obj.el = [obj.el];
      }
      return obj.el.forEach(function(element) {
        var el;
        el = Dom.queryAll(element);
        if (obj.bool) {
          return Dom.addClass(el, obj.className);
        } else {
          return Dom.removeClass(el, obj.className);
        }
      });
    },
    applySetting: function(obj) {
      atom.config.set(obj.config, obj.val);
      return this[obj.action]({
        el: obj.el,
        className: obj.className,
        bool: obj.val
      }, atom.config.onDidChange(obj.config, function(value) {
        if (value.oldValue !== value.newValue && typeof obj.cb === 'function') {
          return obj.cb(value.newValue);
        }
      }));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3NldGktdWkvbGliL3V0aWxpdHkuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsU0FBL0IsQ0FBeUMsQ0FBQyxJQUExQyxHQUFpRCxVQUF6RDs7RUFFTixNQUFNLENBQUMsT0FBUCxHQUdFO0lBQUEsWUFBQSxFQUFjLFNBQUMsR0FBRDtNQUlaLElBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTixDQUFjLEdBQUcsQ0FBQyxFQUFsQixDQUFKO1FBQ0UsR0FBRyxDQUFDLEVBQUosR0FBUyxDQUFFLEdBQUcsQ0FBQyxFQUFOLEVBRFg7O2FBR0EsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFQLENBQWUsU0FBQyxPQUFEO0FBRWIsWUFBQTtRQUFBLEVBQUEsR0FBSyxHQUFHLENBQUMsUUFBSixDQUFhLE9BQWI7UUFFTCxJQUFHLENBQUMsR0FBRyxDQUFDLElBQVI7aUJBQ0UsR0FBRyxDQUFDLFFBQUosQ0FBYSxFQUFiLEVBQWlCLEdBQUcsQ0FBQyxTQUFyQixFQURGO1NBQUEsTUFBQTtpQkFHRSxHQUFHLENBQUMsV0FBSixDQUFnQixFQUFoQixFQUFvQixHQUFHLENBQUMsU0FBeEIsRUFIRjs7TUFKYSxDQUFmO0lBUFksQ0FBZDtJQWtCQSxXQUFBLEVBQWEsU0FBQyxHQUFEO01BSVgsSUFBRyxDQUFDLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBRyxDQUFDLEVBQWxCLENBQUo7UUFDRSxHQUFHLENBQUMsRUFBSixHQUFTLENBQUUsR0FBRyxDQUFDLEVBQU4sRUFEWDs7YUFHQSxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQVAsQ0FBZSxTQUFDLE9BQUQ7QUFFYixZQUFBO1FBQUEsRUFBQSxHQUFLLEdBQUcsQ0FBQyxRQUFKLENBQWEsT0FBYjtRQUVMLElBQUcsR0FBRyxDQUFDLElBQVA7aUJBQ0UsR0FBRyxDQUFDLFFBQUosQ0FBYSxFQUFiLEVBQWlCLEdBQUcsQ0FBQyxTQUFyQixFQURGO1NBQUEsTUFBQTtpQkFHRSxHQUFHLENBQUMsV0FBSixDQUFnQixFQUFoQixFQUFvQixHQUFHLENBQUMsU0FBeEIsRUFIRjs7TUFKYSxDQUFmO0lBUFcsQ0FsQmI7SUFtQ0EsWUFBQSxFQUFjLFNBQUMsR0FBRDtNQUlaLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixHQUFHLENBQUMsTUFBcEIsRUFBNEIsR0FBRyxDQUFDLEdBQWhDO2FBRUEsSUFBRSxDQUFBLEdBQUcsQ0FBQyxNQUFKLENBQUYsQ0FDRTtRQUFBLEVBQUEsRUFBSSxHQUFHLENBQUMsRUFBUjtRQUNBLFNBQUEsRUFBVyxHQUFHLENBQUMsU0FEZjtRQUVBLElBQUEsRUFBTSxHQUFHLENBQUMsR0FGVjtPQURGLEVBS0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLEdBQUcsQ0FBQyxNQUE1QixFQUFvQyxTQUFDLEtBQUQ7UUFDbEMsSUFBRyxLQUFLLENBQUMsUUFBTixLQUFrQixLQUFLLENBQUMsUUFBeEIsSUFBcUMsT0FBTyxHQUFHLENBQUMsRUFBWCxLQUFpQixVQUF6RDtpQkFDRSxHQUFHLENBQUMsRUFBSixDQUFPLEtBQUssQ0FBQyxRQUFiLEVBREY7O01BRGtDLENBQXBDLENBTEY7SUFOWSxDQW5DZDs7QUFMRiIsInNvdXJjZXNDb250ZW50IjpbIkRvbSA9IHJlcXVpcmUoYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKCdzZXRpLXVpJykucGF0aCArICcvbGliL2RvbScpXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAjIEFERCBDTEFTUyBXSEVOIENPTkRJVElPTkFMIElTIEZBTFNFXG4gIGFkZFdoZW5GYWxzZTogKG9iaikgLT5cblxuXG4gICAgIyBDT05WRVJUIFRPIEFOIEFSUkFZIElGIE5PVFxuICAgIGlmICFBcnJheS5pc0FycmF5KG9iai5lbClcbiAgICAgIG9iai5lbCA9IFsgb2JqLmVsIF1cblxuICAgIG9iai5lbC5mb3JFYWNoIChlbGVtZW50KSAtPlxuXG4gICAgICBlbCA9IERvbS5xdWVyeUFsbChlbGVtZW50KSAjRklORCBFTEVNRU5UIElOIERPTVxuXG4gICAgICBpZiAhb2JqLmJvb2xcbiAgICAgICAgRG9tLmFkZENsYXNzIGVsLCBvYmouY2xhc3NOYW1lICMgQUREIENMQVNTXG4gICAgICBlbHNlXG4gICAgICAgIERvbS5yZW1vdmVDbGFzcyBlbCwgb2JqLmNsYXNzTmFtZSAjIFJFTU9WRSBDTEFTU1xuXG5cbiAgIyBBREQgQ0xBU1MgV0hFTiBDT05ESVRJT05BTCBJUyBUUlVFXG4gIGFkZFdoZW5UcnVlOiAob2JqKSAtPlxuXG5cbiAgICAjIENPTlZFUlQgVE8gQU4gQVJSQVkgSUYgTk9UXG4gICAgaWYgIUFycmF5LmlzQXJyYXkob2JqLmVsKVxuICAgICAgb2JqLmVsID0gWyBvYmouZWwgXVxuXG4gICAgb2JqLmVsLmZvckVhY2ggKGVsZW1lbnQpIC0+XG5cbiAgICAgIGVsID0gRG9tLnF1ZXJ5QWxsKGVsZW1lbnQpICNGSU5EIEVMRU1FTlQgSU4gRE9NXG5cbiAgICAgIGlmIG9iai5ib29sXG4gICAgICAgIERvbS5hZGRDbGFzcyBlbCwgb2JqLmNsYXNzTmFtZSAjIEFERCBDTEFTU1xuICAgICAgZWxzZVxuICAgICAgICBEb20ucmVtb3ZlQ2xhc3MgZWwsIG9iai5jbGFzc05hbWUgIyBSRU1PVkUgQ0xBU1NcblxuXG4gIGFwcGx5U2V0dGluZzogKG9iaikgLT5cblxuXG4gICAgIyBBUFBMWSBBIE5FVyBTRVRUSU5HXG4gICAgYXRvbS5jb25maWcuc2V0IG9iai5jb25maWcsIG9iai52YWxcblxuICAgIEBbb2JqLmFjdGlvbl1cbiAgICAgIGVsOiBvYmouZWxcbiAgICAgIGNsYXNzTmFtZTogb2JqLmNsYXNzTmFtZVxuICAgICAgYm9vbDogb2JqLnZhbFxuXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSBvYmouY29uZmlnLCAodmFsdWUpIC0+XG4gICAgICAgIGlmIHZhbHVlLm9sZFZhbHVlICE9IHZhbHVlLm5ld1ZhbHVlIGFuZCB0eXBlb2Ygb2JqLmNiID09ICdmdW5jdGlvbidcbiAgICAgICAgICBvYmouY2IgdmFsdWUubmV3VmFsdWVcbiJdfQ==
