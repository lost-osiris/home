(function() {
  atom.packages.activatePackage('tree-view').then(function(tree) {
    var IS_ANCHORED_CLASSNAME, projectRoots, treeView, updateTreeViewHeaderPosition;
    IS_ANCHORED_CLASSNAME = 'is--anchored';
    treeView = tree.mainModule.treeView;
    projectRoots = treeView.roots;
    updateTreeViewHeaderPosition = function() {
      var i, len, project, projectClassList, projectHeaderHeight, projectHeight, projectOffsetY, ref, results, yScrollPosition;
      yScrollPosition = ((ref = treeView.scroller[0]) != null ? ref : treeView.scroller).scrollTop;
      results = [];
      for (i = 0, len = projectRoots.length; i < len; i++) {
        project = projectRoots[i];
        projectHeaderHeight = project.header.offsetHeight;
        projectClassList = project.classList;
        projectOffsetY = project.offsetTop;
        projectHeight = project.offsetHeight;
        if (yScrollPosition > projectOffsetY) {
          if (yScrollPosition > projectOffsetY + projectHeight - projectHeaderHeight) {
            project.header.style.top = 'auto';
            results.push(projectClassList.add(IS_ANCHORED_CLASSNAME));
          } else {
            project.header.style.top = (yScrollPosition - projectOffsetY) + 'px';
            results.push(projectClassList.remove(IS_ANCHORED_CLASSNAME));
          }
        } else {
          project.header.style.top = '0';
          results.push(projectClassList.remove(IS_ANCHORED_CLASSNAME));
        }
      }
      return results;
    };
    atom.project.onDidChangePaths(function() {
      projectRoots = treeView.roots;
      return updateTreeViewHeaderPosition();
    });
    atom.config.onDidChange('seti-ui', function() {
      return setTimeout(function() {
        return updateTreeViewHeaderPosition();
      });
    });
    if (typeof treeView.scroller.on === 'function') {
      treeView.scroller.on('scroll', updateTreeViewHeaderPosition);
    } else {
      treeView.scroller.addEventListener('scroll', function() {
        return updateTreeViewHeaderPosition();
      });
    }
    return setTimeout(function() {
      return updateTreeViewHeaderPosition();
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3NldGktdWkvbGliL2hlYWRlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFdBQTlCLENBQTBDLENBQUMsSUFBM0MsQ0FBZ0QsU0FBQyxJQUFEO0FBQzlDLFFBQUE7SUFBQSxxQkFBQSxHQUF3QjtJQUV4QixRQUFBLEdBQVcsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixZQUFBLEdBQWUsUUFBUSxDQUFDO0lBRXhCLDRCQUFBLEdBQStCLFNBQUE7QUFDN0IsVUFBQTtNQUFBLGVBQUEsR0FBa0IsOENBQXdCLFFBQVEsQ0FBQyxRQUFqQyxDQUEwQyxDQUFDO0FBRTdEO1dBQUEsOENBQUE7O1FBQ0UsbUJBQUEsR0FBc0IsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUNyQyxnQkFBQSxHQUFtQixPQUFPLENBQUM7UUFDM0IsY0FBQSxHQUFpQixPQUFPLENBQUM7UUFDekIsYUFBQSxHQUFnQixPQUFPLENBQUM7UUFFeEIsSUFBRyxlQUFBLEdBQWtCLGNBQXJCO1VBQ0UsSUFBRyxlQUFBLEdBQWtCLGNBQUEsR0FBaUIsYUFBakIsR0FBaUMsbUJBQXREO1lBQ0UsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBckIsR0FBMkI7eUJBQzNCLGdCQUFnQixDQUFDLEdBQWpCLENBQXFCLHFCQUFyQixHQUZGO1dBQUEsTUFBQTtZQUlFLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQXJCLEdBQTJCLENBQUMsZUFBQSxHQUFrQixjQUFuQixDQUFBLEdBQXFDO3lCQUNoRSxnQkFBZ0IsQ0FBQyxNQUFqQixDQUF3QixxQkFBeEIsR0FMRjtXQURGO1NBQUEsTUFBQTtVQVFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQXJCLEdBQTJCO3VCQUMzQixnQkFBZ0IsQ0FBQyxNQUFqQixDQUF3QixxQkFBeEIsR0FURjs7QUFORjs7SUFINkI7SUFvQi9CLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWIsQ0FBOEIsU0FBQTtNQUM1QixZQUFBLEdBQWUsUUFBUSxDQUFDO2FBQ3hCLDRCQUFBLENBQUE7SUFGNEIsQ0FBOUI7SUFJQSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0IsU0FBeEIsRUFBbUMsU0FBQTthQUdqQyxVQUFBLENBQVcsU0FBQTtlQUFHLDRCQUFBLENBQUE7TUFBSCxDQUFYO0lBSGlDLENBQW5DO0lBSUEsSUFBRyxPQUFPLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBekIsS0FBK0IsVUFBbEM7TUFDRSxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQWxCLENBQXFCLFFBQXJCLEVBQStCLDRCQUEvQixFQURGO0tBQUEsTUFBQTtNQUdFLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWxCLENBQW1DLFFBQW5DLEVBQTZDLFNBQUE7ZUFDM0MsNEJBQUEsQ0FBQTtNQUQyQyxDQUE3QyxFQUhGOztXQU1BLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsNEJBQUEsQ0FBQTtJQURTLENBQVg7RUF4QzhDLENBQWhEO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgndHJlZS12aWV3JykudGhlbiAodHJlZSkgLT5cbiAgSVNfQU5DSE9SRURfQ0xBU1NOQU1FID0gJ2lzLS1hbmNob3JlZCdcblxuICB0cmVlVmlldyA9IHRyZWUubWFpbk1vZHVsZS50cmVlVmlld1xuICBwcm9qZWN0Um9vdHMgPSB0cmVlVmlldy5yb290c1xuXG4gIHVwZGF0ZVRyZWVWaWV3SGVhZGVyUG9zaXRpb24gPSAtPlxuICAgIHlTY3JvbGxQb3NpdGlvbiA9ICh0cmVlVmlldy5zY3JvbGxlclswXSA/IHRyZWVWaWV3LnNjcm9sbGVyKS5zY3JvbGxUb3BcblxuICAgIGZvciBwcm9qZWN0IGluIHByb2plY3RSb290c1xuICAgICAgcHJvamVjdEhlYWRlckhlaWdodCA9IHByb2plY3QuaGVhZGVyLm9mZnNldEhlaWdodFxuICAgICAgcHJvamVjdENsYXNzTGlzdCA9IHByb2plY3QuY2xhc3NMaXN0XG4gICAgICBwcm9qZWN0T2Zmc2V0WSA9IHByb2plY3Qub2Zmc2V0VG9wXG4gICAgICBwcm9qZWN0SGVpZ2h0ID0gcHJvamVjdC5vZmZzZXRIZWlnaHRcblxuICAgICAgaWYgeVNjcm9sbFBvc2l0aW9uID4gcHJvamVjdE9mZnNldFlcbiAgICAgICAgaWYgeVNjcm9sbFBvc2l0aW9uID4gcHJvamVjdE9mZnNldFkgKyBwcm9qZWN0SGVpZ2h0IC0gcHJvamVjdEhlYWRlckhlaWdodFxuICAgICAgICAgIHByb2plY3QuaGVhZGVyLnN0eWxlLnRvcCA9ICdhdXRvJ1xuICAgICAgICAgIHByb2plY3RDbGFzc0xpc3QuYWRkIElTX0FOQ0hPUkVEX0NMQVNTTkFNRVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcHJvamVjdC5oZWFkZXIuc3R5bGUudG9wID0gKHlTY3JvbGxQb3NpdGlvbiAtIHByb2plY3RPZmZzZXRZKSArICdweCdcbiAgICAgICAgICBwcm9qZWN0Q2xhc3NMaXN0LnJlbW92ZSBJU19BTkNIT1JFRF9DTEFTU05BTUVcbiAgICAgIGVsc2VcbiAgICAgICAgcHJvamVjdC5oZWFkZXIuc3R5bGUudG9wID0gJzAnXG4gICAgICAgIHByb2plY3RDbGFzc0xpc3QucmVtb3ZlIElTX0FOQ0hPUkVEX0NMQVNTTkFNRVxuXG4gIGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzIC0+XG4gICAgcHJvamVjdFJvb3RzID0gdHJlZVZpZXcucm9vdHNcbiAgICB1cGRhdGVUcmVlVmlld0hlYWRlclBvc2l0aW9uKClcblxuICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnc2V0aS11aScsIC0+XG4gICAgIyBUT0RPIHNvbWV0aGluZyBvdGhlciB0aGFuIHNldFRpbWVvdXQ/IGl0J3MgYSBoYWNrIHRvIHRyaWdnZXIgdGhlIHVwZGF0ZVxuICAgICMgYWZ0ZXIgdGhlIENTUyBjaGFuZ2VzIGhhdmUgb2NjdXJyZWQuIGEgZ2FtYmxlLCBwcm9iYWJseSBpbmFjY3VyYXRlXG4gICAgc2V0VGltZW91dCAtPiB1cGRhdGVUcmVlVmlld0hlYWRlclBvc2l0aW9uKClcbiAgaWYgdHlwZW9mIHRyZWVWaWV3LnNjcm9sbGVyLm9uIGlzICdmdW5jdGlvbidcbiAgICB0cmVlVmlldy5zY3JvbGxlci5vbiAnc2Nyb2xsJywgdXBkYXRlVHJlZVZpZXdIZWFkZXJQb3NpdGlvblxuICBlbHNlXG4gICAgdHJlZVZpZXcuc2Nyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lciAnc2Nyb2xsJywgLT5cbiAgICAgIHVwZGF0ZVRyZWVWaWV3SGVhZGVyUG9zaXRpb24oKVxuXG4gIHNldFRpbWVvdXQgLT4gIyBUT0RPIHNvbWV0aGluZyBvdGhlciB0aGFuIHNldFRpbWVvdXQ/XG4gICAgdXBkYXRlVHJlZVZpZXdIZWFkZXJQb3NpdGlvbigpXG4iXX0=
