Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.$range = $range;
exports.$file = $file;
exports.copySelection = copySelection;
exports.getPathOfMessage = getPathOfMessage;
exports.getEditorsMap = getEditorsMap;
exports.filterMessages = filterMessages;
exports.filterMessagesByRangeOrPoint = filterMessagesByRangeOrPoint;
exports.visitMessage = visitMessage;
exports.htmlToText = htmlToText;
exports.openExternally = openExternally;
exports.sortMessages = sortMessages;
exports.sortSolutions = sortSolutions;
exports.applySolution = applySolution;

var _atom = require('atom');

var _electron = require('electron');

var severityScore = {
  error: 3,
  warning: 2,
  info: 1
};

exports.severityScore = severityScore;
var severityNames = {
  error: 'Error',
  warning: 'Warning',
  info: 'Info'
};

exports.severityNames = severityNames;

function $range(message) {
  return message.version === 1 ? message.range : message.location.position;
}

function $file(message) {
  return message.version === 1 ? message.filePath : message.location.file;
}

function copySelection() {
  var selection = getSelection();
  if (selection) {
    atom.clipboard.write(selection.toString());
  }
}

function getPathOfMessage(message) {
  return atom.project.relativizePath($file(message) || '')[1];
}

function getEditorsMap(editors) {
  var editorsMap = {};
  var filePaths = [];
  for (var entry of editors.editors) {
    var filePath = entry.textEditor.getPath();
    if (editorsMap[filePath]) {
      editorsMap[filePath].editors.push(entry);
    } else {
      editorsMap[filePath] = {
        added: [],
        removed: [],
        editors: [entry]
      };
      filePaths.push(filePath);
    }
  }
  return { editorsMap: editorsMap, filePaths: filePaths };
}

function filterMessages(messages, filePath) {
  var severity = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var filtered = [];
  messages.forEach(function (message) {
    if ((filePath === null || $file(message) === filePath) && (!severity || message.severity === severity)) {
      filtered.push(message);
    }
  });
  return filtered;
}

function filterMessagesByRangeOrPoint(messages, filePath, rangeOrPoint) {
  var filtered = [];
  var expectedRange = rangeOrPoint.constructor.name === 'Point' ? new _atom.Range(rangeOrPoint, rangeOrPoint) : _atom.Range.fromObject(rangeOrPoint);
  messages.forEach(function (message) {
    var file = $file(message);
    var range = $range(message);
    if (file && range && file === filePath && range.intersectsWith(expectedRange)) {
      filtered.push(message);
    }
  });
  return filtered;
}

function visitMessage(message) {
  var reference = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var messageFile = undefined;
  var messagePosition = undefined;
  if (reference) {
    if (message.version !== 2) {
      console.warn('[Linter-UI-Default] Only messages v2 are allowed in jump to reference. Ignoring');
      return;
    }
    if (!message.reference || !message.reference.file) {
      console.warn('[Linter-UI-Default] Message does not have a valid reference. Ignoring');
      return;
    }
    messageFile = message.reference.file;
    messagePosition = message.reference.position;
  } else {
    var messageRange = $range(message);
    messageFile = $file(message);
    if (messageRange) {
      messagePosition = messageRange.start;
    }
  }
  atom.workspace.open(messageFile, { searchAllPanes: true }).then(function () {
    var textEditor = atom.workspace.getActiveTextEditor();
    if (messagePosition && textEditor && textEditor.getPath() === messageFile) {
      textEditor.setCursorBufferPosition(messagePosition);
    }
  });
}

// NOTE: Code Point 160 === &nbsp;
var replacementRegex = new RegExp(String.fromCodePoint(160), 'g');

function htmlToText(html) {
  var element = document.createElement('div');
  if (typeof html === 'string') {
    element.innerHTML = html;
  } else {
    element.appendChild(html.cloneNode(true));
  }
  // NOTE: Convert &nbsp; to regular whitespace
  return element.textContent.replace(replacementRegex, ' ');
}

function openExternally(message) {
  if (message.version === 1 && message.type.toLowerCase() === 'trace') {
    visitMessage(message);
    return;
  }

  var link = undefined;
  var searchTerm = '';
  if (message.version === 2 && message.url) {
    link = message.url;
  } else {
    // $FlowIgnore: Flow is dumb
    searchTerm = message.linterName + ' ' + (message.excerpt || String(message.text) || htmlToText(message.html || ''));
  }
  link = link || 'https://google.com/search?q=' + encodeURIComponent(searchTerm);
  _electron.shell.openExternal(link);
}

function sortMessages(sortInfo, rows) {
  var sortColumns = {};

  sortInfo.forEach(function (entry) {
    sortColumns[entry.column] = entry.type;
  });

  return rows.slice().sort(function (a, b) {
    if (sortColumns.severity) {
      var multiplyWith = sortColumns.severity === 'asc' ? 1 : -1;
      var severityA = severityScore[a.severity];
      var severityB = severityScore[b.severity];
      if (severityA !== severityB) {
        return multiplyWith * (severityA > severityB ? 1 : -1);
      }
    }
    if (sortColumns.linterName) {
      var multiplyWith = sortColumns.linterName === 'asc' ? 1 : -1;
      var sortValue = a.severity.localeCompare(b.severity);
      if (sortValue !== 0) {
        return multiplyWith * sortValue;
      }
    }
    if (sortColumns.file) {
      var multiplyWith = sortColumns.file === 'asc' ? 1 : -1;
      var fileA = getPathOfMessage(a);
      var fileALength = fileA.length;
      var fileB = getPathOfMessage(b);
      var fileBLength = fileB.length;
      if (fileALength !== fileBLength) {
        return multiplyWith * (fileALength > fileBLength ? 1 : -1);
      } else if (fileA !== fileB) {
        return multiplyWith * fileA.localeCompare(fileB);
      }
    }
    if (sortColumns.line) {
      var multiplyWith = sortColumns.line === 'asc' ? 1 : -1;
      var rangeA = $range(a);
      var rangeB = $range(b);
      if (rangeA && !rangeB) {
        return 1;
      } else if (rangeB && !rangeA) {
        return -1;
      } else if (rangeA && rangeB) {
        if (rangeA.start.row !== rangeB.start.row) {
          return multiplyWith * (rangeA.start.row > rangeB.start.row ? 1 : -1);
        }
        if (rangeA.start.column !== rangeB.start.column) {
          return multiplyWith * (rangeA.start.column > rangeB.start.column ? 1 : -1);
        }
      }
    }

    return 0;
  });
}

function sortSolutions(solutions) {
  return solutions.slice().sort(function (a, b) {
    return b.priority - a.priority;
  });
}

function applySolution(textEditor, version, solution) {
  if (solution.apply) {
    solution.apply();
    return true;
  }
  var range = version === 1 ? solution.range : solution.position;
  var currentText = version === 1 ? solution.oldText : solution.currentText;
  var replaceWith = version === 1 ? solution.newText : solution.replaceWith;
  if (currentText) {
    var textInRange = textEditor.getTextInBufferRange(range);
    if (currentText !== textInRange) {
      console.warn('[linter-ui-default] Not applying fix because text did not match the expected one', 'expected', currentText, 'but got', textInRange);
      return false;
    }
  }
  textEditor.setTextInBufferRange(range, replaceWith);
  return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21vd2Vucy8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztvQkFFc0IsTUFBTTs7d0JBQ04sVUFBVTs7QUFLekIsSUFBTSxhQUFhLEdBQUc7QUFDM0IsT0FBSyxFQUFFLENBQUM7QUFDUixTQUFPLEVBQUUsQ0FBQztBQUNWLE1BQUksRUFBRSxDQUFDO0NBQ1IsQ0FBQTs7O0FBRU0sSUFBTSxhQUFhLEdBQUc7QUFDM0IsT0FBSyxFQUFFLE9BQU87QUFDZCxTQUFPLEVBQUUsU0FBUztBQUNsQixNQUFJLEVBQUUsTUFBTTtDQUNiLENBQUE7Ozs7QUFFTSxTQUFTLE1BQU0sQ0FBQyxPQUFzQixFQUFXO0FBQ3RELFNBQU8sT0FBTyxDQUFDLE9BQU8sS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQTtDQUN6RTs7QUFDTSxTQUFTLEtBQUssQ0FBQyxPQUFzQixFQUFXO0FBQ3JELFNBQU8sT0FBTyxDQUFDLE9BQU8sS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQTtDQUN4RTs7QUFDTSxTQUFTLGFBQWEsR0FBRztBQUM5QixNQUFNLFNBQVMsR0FBRyxZQUFZLEVBQUUsQ0FBQTtBQUNoQyxNQUFJLFNBQVMsRUFBRTtBQUNiLFFBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO0dBQzNDO0NBQ0Y7O0FBQ00sU0FBUyxnQkFBZ0IsQ0FBQyxPQUFzQixFQUFVO0FBQy9ELFNBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0NBQzVEOztBQUVNLFNBQVMs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Q1oiLCJmaWxlIjoiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9oZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgUmFuZ2UgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHsgc2hlbGwgfSBmcm9tICdlbGVjdHJvbidcbmltcG9ydCB0eXBlIHsgUG9pbnQsIFRleHRFZGl0b3IgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHR5cGUgRWRpdG9ycyBmcm9tICcuL2VkaXRvcnMnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgY29uc3Qgc2V2ZXJpdHlTY29yZSA9IHtcbiAgZXJyb3I6IDMsXG4gIHdhcm5pbmc6IDIsXG4gIGluZm86IDEsXG59XG5cbmV4cG9ydCBjb25zdCBzZXZlcml0eU5hbWVzID0ge1xuICBlcnJvcjogJ0Vycm9yJyxcbiAgd2FybmluZzogJ1dhcm5pbmcnLFxuICBpbmZvOiAnSW5mbycsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiAkcmFuZ2UobWVzc2FnZTogTGludGVyTWVzc2FnZSk6ID9PYmplY3Qge1xuICByZXR1cm4gbWVzc2FnZS52ZXJzaW9uID09PSAxID8gbWVzc2FnZS5yYW5nZSA6IG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb25cbn1cbmV4cG9ydCBmdW5jdGlvbiAkZmlsZShtZXNzYWdlOiBMaW50ZXJNZXNzYWdlKTogP3N0cmluZyB7XG4gIHJldHVybiBtZXNzYWdlLnZlcnNpb24gPT09IDEgPyBtZXNzYWdlLmZpbGVQYXRoIDogbWVzc2FnZS5sb2NhdGlvbi5maWxlXG59XG5leHBvcnQgZnVuY3Rpb24gY29weVNlbGVjdGlvbigpIHtcbiAgY29uc3Qgc2VsZWN0aW9uID0gZ2V0U2VsZWN0aW9uKClcbiAgaWYgKHNlbGVjdGlvbikge1xuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHNlbGVjdGlvbi50b1N0cmluZygpKVxuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0UGF0aE9mTWVzc2FnZShtZXNzYWdlOiBMaW50ZXJNZXNzYWdlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aCgkZmlsZShtZXNzYWdlKSB8fCAnJylbMV1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVkaXRvcnNNYXAoZWRpdG9yczogRWRpdG9ycyk6IHsgZWRpdG9yc01hcDogT2JqZWN0LCBmaWxlUGF0aHM6IEFycmF5PHN0cmluZz4gfSB7XG4gIGNvbnN0IGVkaXRvcnNNYXAgPSB7fVxuICBjb25zdCBmaWxlUGF0aHMgPSBbXVxuICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVkaXRvcnMuZWRpdG9ycykge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gZW50cnkudGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICBpZiAoZWRpdG9yc01hcFtmaWxlUGF0aF0pIHtcbiAgICAgIGVkaXRvcnNNYXBbZmlsZVBhdGhdLmVkaXRvcnMucHVzaChlbnRyeSlcbiAgICB9IGVsc2Uge1xuICAgICAgZWRpdG9yc01hcFtmaWxlUGF0aF0gPSB7XG4gICAgICAgIGFkZGVkOiBbXSxcbiAgICAgICAgcmVtb3ZlZDogW10sXG4gICAgICAgIGVkaXRvcnM6IFtlbnRyeV0sXG4gICAgICB9XG4gICAgICBmaWxlUGF0aHMucHVzaChmaWxlUGF0aClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHsgZWRpdG9yc01hcCwgZmlsZVBhdGhzIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlck1lc3NhZ2VzKG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPiwgZmlsZVBhdGg6ID9zdHJpbmcsIHNldmVyaXR5OiA/c3RyaW5nID0gbnVsbCk6IEFycmF5PExpbnRlck1lc3NhZ2U+IHtcbiAgY29uc3QgZmlsdGVyZWQgPSBbXVxuICBtZXNzYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICBpZiAoKGZpbGVQYXRoID09PSBudWxsIHx8ICRmaWxlKG1lc3NhZ2UpID09PSBmaWxlUGF0aCkgJiYgKCFzZXZlcml0eSB8fCBtZXNzYWdlLnNldmVyaXR5ID09PSBzZXZlcml0eSkpIHtcbiAgICAgIGZpbHRlcmVkLnB1c2gobWVzc2FnZSlcbiAgICB9XG4gIH0pXG4gIHJldHVybiBmaWx0ZXJlZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyTWVzc2FnZXNCeVJhbmdlT3JQb2ludChtZXNzYWdlczogU2V0PExpbnRlck1lc3NhZ2U+IHwgQXJyYXk8TGludGVyTWVzc2FnZT4sIGZpbGVQYXRoOiBzdHJpbmcsIHJhbmdlT3JQb2ludDogUG9pbnQgfCBSYW5nZSk6IEFycmF5PExpbnRlck1lc3NhZ2U+IHtcbiAgY29uc3QgZmlsdGVyZWQgPSBbXVxuICBjb25zdCBleHBlY3RlZFJhbmdlID0gcmFuZ2VPclBvaW50LmNvbnN0cnVjdG9yLm5hbWUgPT09ICdQb2ludCcgPyBuZXcgUmFuZ2UocmFuZ2VPclBvaW50LCByYW5nZU9yUG9pbnQpIDogUmFuZ2UuZnJvbU9iamVjdChyYW5nZU9yUG9pbnQpXG4gIG1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIGNvbnN0IGZpbGUgPSAkZmlsZShtZXNzYWdlKVxuICAgIGNvbnN0IHJhbmdlID0gJHJhbmdlKG1lc3NhZ2UpXG4gICAgaWYgKGZpbGUgJiYgcmFuZ2UgJiYgZmlsZSA9PT0gZmlsZVBhdGggJiYgcmFuZ2UuaW50ZXJzZWN0c1dpdGgoZXhwZWN0ZWRSYW5nZSkpIHtcbiAgICAgIGZpbHRlcmVkLnB1c2gobWVzc2FnZSlcbiAgICB9XG4gIH0pXG4gIHJldHVybiBmaWx0ZXJlZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmlzaXRNZXNzYWdlKG1lc3NhZ2U6IExpbnRlck1lc3NhZ2UsIHJlZmVyZW5jZTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gIGxldCBtZXNzYWdlRmlsZVxuICBsZXQgbWVzc2FnZVBvc2l0aW9uXG4gIGlmIChyZWZlcmVuY2UpIHtcbiAgICBpZiAobWVzc2FnZS52ZXJzaW9uICE9PSAyKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tMaW50ZXItVUktRGVmYXVsdF0gT25seSBtZXNzYWdlcyB2MiBhcmUgYWxsb3dlZCBpbiBqdW1wIHRvIHJlZmVyZW5jZS4gSWdub3JpbmcnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICghbWVzc2FnZS5yZWZlcmVuY2UgfHwgIW1lc3NhZ2UucmVmZXJlbmNlLmZpbGUpIHtcbiAgICAgIGNvbnNvbGUud2FybignW0xpbnRlci1VSS1EZWZhdWx0XSBNZXNzYWdlIGRvZXMgbm90IGhhdmUgYSB2YWxpZCByZWZlcmVuY2UuIElnbm9yaW5nJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBtZXNzYWdlRmlsZSA9IG1lc3NhZ2UucmVmZXJlbmNlLmZpbGVcbiAgICBtZXNzYWdlUG9zaXRpb24gPSBtZXNzYWdlLnJlZmVyZW5jZS5wb3NpdGlvblxuICB9IGVsc2Uge1xuICAgIGNvbnN0IG1lc3NhZ2VSYW5nZSA9ICRyYW5nZShtZXNzYWdlKVxuICAgIG1lc3NhZ2VGaWxlID0gJGZpbGUobWVzc2FnZSlcbiAgICBpZiAobWVzc2FnZVJhbmdlKSB7XG4gICAgICBtZXNzYWdlUG9zaXRpb24gPSBtZXNzYWdlUmFuZ2Uuc3RhcnRcbiAgICB9XG4gIH1cbiAgYXRvbS53b3Jrc3BhY2Uub3BlbihtZXNzYWdlRmlsZSwgeyBzZWFyY2hBbGxQYW5lczogdHJ1ZSB9KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpZiAobWVzc2FnZVBvc2l0aW9uICYmIHRleHRFZGl0b3IgJiYgdGV4dEVkaXRvci5nZXRQYXRoKCkgPT09IG1lc3NhZ2VGaWxlKSB7XG4gICAgICB0ZXh0RWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKG1lc3NhZ2VQb3NpdGlvbilcbiAgICB9XG4gIH0pXG59XG5cbi8vIE5PVEU6IENvZGUgUG9pbnQgMTYwID09PSAmbmJzcDtcbmNvbnN0IHJlcGxhY2VtZW50UmVnZXggPSBuZXcgUmVnRXhwKFN0cmluZy5mcm9tQ29kZVBvaW50KDE2MCksICdnJylcbmV4cG9ydCBmdW5jdGlvbiBodG1sVG9UZXh0KGh0bWw6IGFueSk6IHN0cmluZyB7XG4gIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBpZiAodHlwZW9mIGh0bWwgPT09ICdzdHJpbmcnKSB7XG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSBodG1sXG4gIH0gZWxzZSB7XG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZChodG1sLmNsb25lTm9kZSh0cnVlKSlcbiAgfVxuICAvLyBOT1RFOiBDb252ZXJ0ICZuYnNwOyB0byByZWd1bGFyIHdoaXRlc3BhY2VcbiAgcmV0dXJuIGVsZW1lbnQudGV4dENvbnRlbnQucmVwbGFjZShyZXBsYWNlbWVudFJlZ2V4LCAnICcpXG59XG5leHBvcnQgZnVuY3Rpb24gb3BlbkV4dGVybmFsbHkobWVzc2FnZTogTGludGVyTWVzc2FnZSk6IHZvaWQge1xuICBpZiAobWVzc2FnZS52ZXJzaW9uID09PSAxICYmIG1lc3NhZ2UudHlwZS50b0xvd2VyQ2FzZSgpID09PSAndHJhY2UnKSB7XG4gICAgdmlzaXRNZXNzYWdlKG1lc3NhZ2UpXG4gICAgcmV0dXJuXG4gIH1cblxuICBsZXQgbGlua1xuICBsZXQgc2VhcmNoVGVybSA9ICcnXG4gIGlmIChtZXNzYWdlLnZlcnNpb24gPT09IDIgJiYgbWVzc2FnZS51cmwpIHtcbiAgICBsaW5rID0gbWVzc2FnZS51cmxcbiAgfSBlbHNlIHtcbiAgICAvLyAkRmxvd0lnbm9yZTogRmxvdyBpcyBkdW1iXG4gICAgc2VhcmNoVGVybSA9IGAke21lc3NhZ2UubGludGVyTmFtZX0gJHttZXNzYWdlLmV4Y2VycHQgfHwgKFN0cmluZyhtZXNzYWdlLnRleHQpIHx8IGh0bWxUb1RleHQobWVzc2FnZS5odG1sIHx8ICcnKSl9YFxuICB9XG4gIGxpbmsgPSBsaW5rIHx8IGBodHRwczovL2dvb2dsZS5jb20vc2VhcmNoP3E9JHtlbmNvZGVVUklDb21wb25lbnQoc2VhcmNoVGVybSl9YFxuICBzaGVsbC5vcGVuRXh0ZXJuYWwobGluaylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvcnRNZXNzYWdlcyhzb3J0SW5mbzogQXJyYXk8eyBjb2x1bW46IHN0cmluZywgdHlwZTogJ2FzYycgfCAnZGVzYycgfT4sIHJvd3M6IEFycmF5PExpbnRlck1lc3NhZ2U+KTogQXJyYXk8TGludGVyTWVzc2FnZT4ge1xuICBjb25zdCBzb3J0Q29sdW1ucyA6IHtcbiAgICBzZXZlcml0eT86ICdhc2MnIHwgJ2Rlc2MnLFxuICAgIGxpbnRlck5hbWU/OiAnYXNjJyB8ICdkZXNjJyxcbiAgICBmaWxlPzogJ2FzYycgfCAnZGVzYycsXG4gICAgbGluZT86ICdhc2MnIHwgJ2Rlc2MnXG4gIH0gPSB7fVxuXG4gIHNvcnRJbmZvLmZvckVhY2goZnVuY3Rpb24oZW50cnkpIHtcbiAgICBzb3J0Q29sdW1uc1tlbnRyeS5jb2x1bW5dID0gZW50cnkudHlwZVxuICB9KVxuXG4gIHJldHVybiByb3dzLnNsaWNlKCkuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgaWYgKHNvcnRDb2x1bW5zLnNldmVyaXR5KSB7XG4gICAgICBjb25zdCBtdWx0aXBseVdpdGggPSBzb3J0Q29sdW1ucy5zZXZlcml0eSA9PT0gJ2FzYycgPyAxIDogLTFcbiAgICAgIGNvbnN0IHNldmVyaXR5QSA9IHNldmVyaXR5U2NvcmVbYS5zZXZlcml0eV1cbiAgICAgIGNvbnN0IHNldmVyaXR5QiA9IHNldmVyaXR5U2NvcmVbYi5zZXZlcml0eV1cbiAgICAgIGlmIChzZXZlcml0eUEgIT09IHNldmVyaXR5Qikge1xuICAgICAgICByZXR1cm4gbXVsdGlwbHlXaXRoICogKHNldmVyaXR5QSA+IHNldmVyaXR5QiA/IDEgOiAtMSlcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNvcnRDb2x1bW5zLmxpbnRlck5hbWUpIHtcbiAgICAgIGNvbnN0IG11bHRpcGx5V2l0aCA9IHNvcnRDb2x1bW5zLmxpbnRlck5hbWUgPT09ICdhc2MnID8gMSA6IC0xXG4gICAgICBjb25zdCBzb3J0VmFsdWUgPSBhLnNldmVyaXR5LmxvY2FsZUNvbXBhcmUoYi5zZXZlcml0eSlcbiAgICAgIGlmIChzb3J0VmFsdWUgIT09IDApIHtcbiAgICAgICAgcmV0dXJuIG11bHRpcGx5V2l0aCAqIHNvcnRWYWx1ZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc29ydENvbHVtbnMuZmlsZSkge1xuICAgICAgY29uc3QgbXVsdGlwbHlXaXRoID0gc29ydENvbHVtbnMuZmlsZSA9PT0gJ2FzYycgPyAxIDogLTFcbiAgICAgIGNvbnN0IGZpbGVBID0gZ2V0UGF0aE9mTWVzc2FnZShhKVxuICAgICAgY29uc3QgZmlsZUFMZW5ndGggPSBmaWxlQS5sZW5ndGhcbiAgICAgIGNvbnN0IGZpbGVCID0gZ2V0UGF0aE9mTWVzc2FnZShiKVxuICAgICAgY29uc3QgZmlsZUJMZW5ndGggPSBmaWxlQi5sZW5ndGhcbiAgICAgIGlmIChmaWxlQUxlbmd0aCAhPT0gZmlsZUJMZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG11bHRpcGx5V2l0aCAqIChmaWxlQUxlbmd0aCA+IGZpbGVCTGVuZ3RoID8gMSA6IC0xKVxuICAgICAgfSBlbHNlIGlmIChmaWxlQSAhPT0gZmlsZUIpIHtcbiAgICAgICAgcmV0dXJuIG11bHRpcGx5V2l0aCAqIGZpbGVBLmxvY2FsZUNvbXBhcmUoZmlsZUIpXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzb3J0Q29sdW1ucy5saW5lKSB7XG4gICAgICBjb25zdCBtdWx0aXBseVdpdGggPSBzb3J0Q29sdW1ucy5saW5lID09PSAnYXNjJyA/IDEgOiAtMVxuICAgICAgY29uc3QgcmFuZ2VBID0gJHJhbmdlKGEpXG4gICAgICBjb25zdCByYW5nZUIgPSAkcmFuZ2UoYilcbiAgICAgIGlmIChyYW5nZUEgJiYgIXJhbmdlQikge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfSBlbHNlIGlmIChyYW5nZUIgJiYgIXJhbmdlQSkge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH0gZWxzZSBpZiAocmFuZ2VBICYmIHJhbmdlQikge1xuICAgICAgICBpZiAocmFuZ2VBLnN0YXJ0LnJvdyAhPT0gcmFuZ2VCLnN0YXJ0LnJvdykge1xuICAgICAgICAgIHJldHVybiBtdWx0aXBseVdpdGggKiAocmFuZ2VBLnN0YXJ0LnJvdyA+IHJhbmdlQi5zdGFydC5yb3cgPyAxIDogLTEpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJhbmdlQS5zdGFydC5jb2x1bW4gIT09IHJhbmdlQi5zdGFydC5jb2x1bW4pIHtcbiAgICAgICAgICByZXR1cm4gbXVsdGlwbHlXaXRoICogKHJhbmdlQS5zdGFydC5jb2x1bW4gPiByYW5nZUIuc3RhcnQuY29sdW1uID8gMSA6IC0xKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIDBcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvcnRTb2x1dGlvbnMoc29sdXRpb25zOiBBcnJheTxPYmplY3Q+KTogQXJyYXk8T2JqZWN0PiB7XG4gIHJldHVybiBzb2x1dGlvbnMuc2xpY2UoKS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYi5wcmlvcml0eSAtIGEucHJpb3JpdHlcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5U29sdXRpb24odGV4dEVkaXRvcjogVGV4dEVkaXRvciwgdmVyc2lvbjogMSB8IDIsIHNvbHV0aW9uOiBPYmplY3QpOiBib29sZWFuIHtcbiAgaWYgKHNvbHV0aW9uLmFwcGx5KSB7XG4gICAgc29sdXRpb24uYXBwbHkoKVxuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgY29uc3QgcmFuZ2UgPSB2ZXJzaW9uID09PSAxID8gc29sdXRpb24ucmFuZ2UgOiBzb2x1dGlvbi5wb3NpdGlvblxuICBjb25zdCBjdXJyZW50VGV4dCA9IHZlcnNpb24gPT09IDEgPyBzb2x1dGlvbi5vbGRUZXh0IDogc29sdXRpb24uY3VycmVudFRleHRcbiAgY29uc3QgcmVwbGFjZVdpdGggPSB2ZXJzaW9uID09PSAxID8gc29sdXRpb24ubmV3VGV4dCA6IHNvbHV0aW9uLnJlcGxhY2VXaXRoXG4gIGlmIChjdXJyZW50VGV4dCkge1xuICAgIGNvbnN0IHRleHRJblJhbmdlID0gdGV4dEVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICBpZiAoY3VycmVudFRleHQgIT09IHRleHRJblJhbmdlKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tsaW50ZXItdWktZGVmYXVsdF0gTm90IGFwcGx5aW5nIGZpeCBiZWNhdXNlIHRleHQgZGlkIG5vdCBtYXRjaCB0aGUgZXhwZWN0ZWQgb25lJywgJ2V4cGVjdGVkJywgY3VycmVudFRleHQsICdidXQgZ290JywgdGV4dEluUmFuZ2UpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgdGV4dEVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSwgcmVwbGFjZVdpdGgpXG4gIHJldHVybiB0cnVlXG59XG4iXX0=