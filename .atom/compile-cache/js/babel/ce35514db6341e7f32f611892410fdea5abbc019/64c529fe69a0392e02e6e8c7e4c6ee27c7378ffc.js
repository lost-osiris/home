Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _tabsSettings = require('./tabs-settings');

var _tabsSettings2 = _interopRequireDefault(_tabsSettings);

'use babel';
'use strict';

var panels = document.querySelectorAll('atom-panel-container');
var observerConfig = { childList: true };
var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function () {
        return toggleBlendTreeView(atom.config.get('atom-material-ui.treeView.blendTabs'));
    });
});

// Observe panels for DOM mutations
Array.prototype.forEach.call(panels, function (panel) {
    return observer.observe(panel, observerConfig);
});

function getTreeViews() {
    var treeViews = [document.querySelector('.tree-view-resizer:not(.nuclide-ui-panel-component)'), document.querySelector('.remote-ftp-view'), (function () {
        var nuclideTreeView = document.querySelector('.nuclide-file-tree-toolbar-container');

        if (nuclideTreeView) {
            return nuclideTreeView.closest('div[style*="display: flex;"]');
        }
    })()];

    return treeViews;
}

function removeBlendingEl(treeView) {

    if (treeView) {
        var blendingEl = treeView.querySelector('.tabBlender');

        if (blendingEl) {
            treeView.removeChild(blendingEl);
        }
    }
}

function toggleBlendTreeView(bool) {
    var treeViews = getTreeViews();

    setImmediate(function () {
        treeViews.forEach(function (treeView) {
            if (treeView) {
                var blendingEl = document.createElement('div');
                var title = document.createElement('span');

                blendingEl.classList.add('tabBlender');
                blendingEl.appendChild(title);

                if (treeView && bool) {
                    if (treeView.querySelector('.tabBlender')) {
                        removeBlendingEl(treeView);
                    }
                    treeView.insertBefore(blendingEl, treeView.firstChild);
                } else if (treeView && !bool) {
                    removeBlendingEl(treeView);
                } else if (!treeView && bool) {
                    if (atom.packages.getActivePackage('tree-view') || atom.packages.getActivePackage('Remote-FTP') || atom.packages.getActivePackage('nuclide')) {
                        return setTimeout(function () {
                            toggleBlendTreeView(bool);
                            setImmediate(function () {
                                return _tabsSettings2['default'].apply();
                            });
                        }, 2000);
                    }
                }
            }
        });
    });
}

atom.packages.onDidActivatePackage(function (pkg) {
    if (pkg.name === 'nuclide-file-tree') {
        toggleBlendTreeView(atom.config.get('atom-material-ui.treeView.blendTabs'));
    }
});

exports['default'] = { toggleBlendTreeView: toggleBlendTreeView };
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9hdG9tLW1hdGVyaWFsLXVpL2xpYi90cmVlLXZpZXctc2V0dGluZ3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzRCQUd5QixpQkFBaUI7Ozs7QUFIMUMsV0FBVyxDQUFDO0FBQ1osWUFBWSxDQUFDOztBQUliLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQy9ELElBQUksY0FBYyxHQUFHLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ3pDLElBQUksUUFBUSxHQUFHLElBQUksZ0JBQWdCLENBQUMsVUFBQyxTQUFTLEVBQUs7QUFDbEQsYUFBUyxDQUFDLE9BQU8sQ0FBQztlQUFNLG1CQUFtQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7S0FBQSxDQUFDLENBQUM7Q0FDckcsQ0FBQyxDQUFDOzs7QUFHSCxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQUMsS0FBSztXQUFLLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLGNBQWMsQ0FBQztDQUFBLENBQUMsQ0FBQzs7QUFFekYsU0FBUyxZQUFZLEdBQUc7QUFDcEIsUUFBSSxTQUFTLEdBQUcsQ0FDWixRQUFRLENBQUMsYUFBYSxDQUFDLHFEQUFxRCxDQUFDLEVBQzdFLFFBQVEsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsRUFDMUMsQ0FBQyxZQUFZO0FBQ1QsWUFBSSxlQUFlLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDOztBQUVyRixZQUFJLGVBQWUsRUFBRTtBQUNqQixtQkFBTyxlQUFlLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7U0FDbEU7S0FDSixDQUFBLEVBQUcsQ0FDUCxDQUFDOztBQUVGLFdBQU8sU0FBUyxDQUFDO0NBQ3BCOztBQUVELFNBQVMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFOztBQUVoQyxRQUFJLFFBQVEsRUFBRTtBQUNWLFlBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7O0FBRXZELFlBQUksVUFBVSxFQUFFO0FBQ1osb0JBQVEsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDcEM7S0FDSjtDQUVKOztBQUVELFNBQVMsbUJBQW1CLENBQUMsSUFBSSxFQUFFO0FBQy9CLFFBQUksU0FBUyxHQUFHLFlBQVksRUFBRSxDQUFDOztBQUUvQixnQkFBWSxDQUFDLFlBQU07QUFDZixpQkFBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVEsRUFBSztBQUM1QixnQkFBSSxRQUFRLEVBQUU7QUFDVixvQkFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMvQyxvQkFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFM0MsMEJBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3ZDLDBCQUFVLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUU5QixvQkFBSSxRQUFRLElBQUksSUFBSSxFQUFFO0FBQ2xCLHdCQUFJLFFBQVEsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLEVBQUU7QUFDdkMsd0NBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQzlCO0FBQ0QsNEJBQVEsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDMUQsTUFBTSxJQUFJLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtBQUMxQixvQ0FBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDOUIsTUFBTSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtBQUMxQix3QkFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUMxSSwrQkFBTyxVQUFVLENBQUMsWUFBTTtBQUNwQiwrQ0FBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQix3Q0FBWSxDQUFDO3VDQUFNLDBCQUFhLEtBQUssRUFBRTs2QkFBQSxDQUFDLENBQUM7eUJBQzVDLEVBQUUsSUFBSSxDQUFDLENBQUM7cUJBQ1o7aUJBQ0o7YUFDSjtTQUNKLENBQUMsQ0FBQztLQUNOLENBQUMsQ0FBQztDQUNOOztBQUVELElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsVUFBQyxHQUFHLEVBQUs7QUFDeEMsUUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLG1CQUFtQixFQUFFO0FBQ2xDLDJCQUFtQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLENBQUMsQ0FBQztLQUMvRTtDQUNKLENBQUMsQ0FBQzs7cUJBRVksRUFBRSxtQkFBbUIsRUFBbkIsbUJBQW1CLEVBQUUiLCJmaWxlIjoiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tbWF0ZXJpYWwtdWkvbGliL3RyZWUtdmlldy1zZXR0aW5ncy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgdGFic1NldHRpbmdzIGZyb20gJy4vdGFicy1zZXR0aW5ncyc7XG5cbnZhciBwYW5lbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdhdG9tLXBhbmVsLWNvbnRhaW5lcicpO1xudmFyIG9ic2VydmVyQ29uZmlnID0geyBjaGlsZExpc3Q6IHRydWUgfTtcbnZhciBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnMpID0+IHtcblx0bXV0YXRpb25zLmZvckVhY2goKCkgPT4gdG9nZ2xlQmxlbmRUcmVlVmlldyhhdG9tLmNvbmZpZy5nZXQoJ2F0b20tbWF0ZXJpYWwtdWkudHJlZVZpZXcuYmxlbmRUYWJzJykpKTtcbn0pO1xuXG4vLyBPYnNlcnZlIHBhbmVscyBmb3IgRE9NIG11dGF0aW9uc1xuQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChwYW5lbHMsIChwYW5lbCkgPT4gb2JzZXJ2ZXIub2JzZXJ2ZShwYW5lbCwgb2JzZXJ2ZXJDb25maWcpKTtcblxuZnVuY3Rpb24gZ2V0VHJlZVZpZXdzKCkge1xuICAgIHZhciB0cmVlVmlld3MgPSBbXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50cmVlLXZpZXctcmVzaXplcjpub3QoLm51Y2xpZGUtdWktcGFuZWwtY29tcG9uZW50KScpLFxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVtb3RlLWZ0cC12aWV3JyksXG4gICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbnVjbGlkZVRyZWVWaWV3ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm51Y2xpZGUtZmlsZS10cmVlLXRvb2xiYXItY29udGFpbmVyJyk7XG5cbiAgICAgICAgICAgIGlmIChudWNsaWRlVHJlZVZpZXcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVjbGlkZVRyZWVWaWV3LmNsb3Nlc3QoJ2RpdltzdHlsZSo9XCJkaXNwbGF5OiBmbGV4O1wiXScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSgpXG4gICAgXTtcblxuICAgIHJldHVybiB0cmVlVmlld3M7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUJsZW5kaW5nRWwodHJlZVZpZXcpIHtcblxuICAgIGlmICh0cmVlVmlldykge1xuICAgICAgICB2YXIgYmxlbmRpbmdFbCA9IHRyZWVWaWV3LnF1ZXJ5U2VsZWN0b3IoJy50YWJCbGVuZGVyJyk7XG5cbiAgICAgICAgaWYgKGJsZW5kaW5nRWwpIHtcbiAgICAgICAgICAgIHRyZWVWaWV3LnJlbW92ZUNoaWxkKGJsZW5kaW5nRWwpO1xuICAgICAgICB9XG4gICAgfVxuXG59XG5cbmZ1bmN0aW9uIHRvZ2dsZUJsZW5kVHJlZVZpZXcoYm9vbCkge1xuICAgIHZhciB0cmVlVmlld3MgPSBnZXRUcmVlVmlld3MoKTtcblxuICAgIHNldEltbWVkaWF0ZSgoKSA9PiB7XG4gICAgICAgIHRyZWVWaWV3cy5mb3JFYWNoKCh0cmVlVmlldykgPT4ge1xuICAgICAgICAgICAgaWYgKHRyZWVWaWV3KSB7XG4gICAgICAgICAgICAgICAgdmFyIGJsZW5kaW5nRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICB2YXIgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG5cbiAgICAgICAgICAgICAgICBibGVuZGluZ0VsLmNsYXNzTGlzdC5hZGQoJ3RhYkJsZW5kZXInKTtcbiAgICAgICAgICAgICAgICBibGVuZGluZ0VsLmFwcGVuZENoaWxkKHRpdGxlKTtcblxuICAgICAgICAgICAgICAgIGlmICh0cmVlVmlldyAmJiBib29sKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmVlVmlldy5xdWVyeVNlbGVjdG9yKCcudGFiQmxlbmRlcicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVCbGVuZGluZ0VsKHRyZWVWaWV3KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0cmVlVmlldy5pbnNlcnRCZWZvcmUoYmxlbmRpbmdFbCwgdHJlZVZpZXcuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0cmVlVmlldyAmJiAhYm9vbCkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVCbGVuZGluZ0VsKHRyZWVWaWV3KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCF0cmVlVmlldyAmJiBib29sKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoJ3RyZWUtdmlldycpIHx8IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZSgnUmVtb3RlLUZUUCcpIHx8IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZSgnbnVjbGlkZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlQmxlbmRUcmVlVmlldyhib29sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4gdGFic1NldHRpbmdzLmFwcGx5KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5hdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlKChwa2cpID0+IHtcbiAgICBpZiAocGtnLm5hbWUgPT09ICdudWNsaWRlLWZpbGUtdHJlZScpIHtcbiAgICAgICAgdG9nZ2xlQmxlbmRUcmVlVmlldyhhdG9tLmNvbmZpZy5nZXQoJ2F0b20tbWF0ZXJpYWwtdWkudHJlZVZpZXcuYmxlbmRUYWJzJykpO1xuICAgIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCB7IHRvZ2dsZUJsZW5kVHJlZVZpZXcgfTtcbiJdfQ==