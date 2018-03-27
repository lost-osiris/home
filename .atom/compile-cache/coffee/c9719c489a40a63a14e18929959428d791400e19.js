(function() {
  var Base, _, excludeProperties, extractBetween, formatKeymaps, formatReport, genTableOfContent, generateIntrospectionReport, getAncestors, getCommandFromClass, getKeyBindingForCommand, inspectFunction, inspectInstance, inspectObject, packageName, ref, report, sortByAncesstor, util,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  util = require('util');

  _ = require('underscore-plus');

  Base = require('./base');

  ref = require('./utils'), getAncestors = ref.getAncestors, getKeyBindingForCommand = ref.getKeyBindingForCommand;

  packageName = 'vim-mode-plus';

  extractBetween = function(str, s1, s2) {
    return str.substring(str.indexOf(s1) + 1, str.lastIndexOf(s2));
  };

  inspectFunction = function(fn, name) {
    var args, argumentsSignature, defaultConstructor, fnArgs, fnBody, fnString, j, len, line, m, superAsIs, superBase, superSignature, superWithModify;
    superBase = _.escapeRegExp(fn.name + ".__super__." + name);
    superAsIs = superBase + _.escapeRegExp(".apply(this, arguments);");
    defaultConstructor = '^return ' + superAsIs;
    superWithModify = superBase + '\\.call\\((.*)\\)';
    fnString = fn.toString();
    fnBody = extractBetween(fnString, '{', '}').split("\n").map(function(e) {
      return e.trim();
    });
    fnArgs = fnString.split("\n")[0].match(/\((.*)\)/)[1].split(/,\s*/g);
    fnArgs = fnArgs.map(function(arg) {
      var iVarAssign;
      iVarAssign = '^' + _.escapeRegExp("this." + arg + " = " + arg + ";") + '$';
      if (_.detect(fnBody, function(line) {
        return line.match(iVarAssign);
      })) {
        return '@' + arg;
      } else {
        return arg;
      }
    });
    argumentsSignature = '(' + fnArgs.join(', ') + ')';
    superSignature = null;
    for (j = 0, len = fnBody.length; j < len; j++) {
      line = fnBody[j];
      if (name === 'constructor' && line.match(defaultConstructor)) {
        superSignature = 'default';
      } else if (line.match(superAsIs)) {
        superSignature = 'super';
      } else if (m = line.match(superWithModify)) {
        args = m[1].replace(/this,?\s*/, '');
        args = args.replace(/this\./g, '@');
        superSignature = "super(" + args + ")";
      }
      if (superSignature) {
        break;
      }
    }
    return {
      argumentsSignature: argumentsSignature,
      superSignature: superSignature
    };
  };

  excludeProperties = ['__super__'];

  inspectObject = function(obj, options, prototype) {
    var ancesstors, argumentsSignature, excludeList, isOverridden, prefix, prop, ref1, ref2, results, s, superSignature, value;
    if (options == null) {
      options = {};
    }
    if (prototype == null) {
      prototype = false;
    }
    excludeList = excludeProperties.concat((ref1 = options.excludeProperties) != null ? ref1 : []);
    if (options.depth == null) {
      options.depth = 1;
    }
    prefix = '@';
    if (prototype) {
      obj = obj.prototype;
      prefix = '::';
    }
    ancesstors = getAncestors(obj.constructor);
    ancesstors.shift();
    results = [];
    for (prop in obj) {
      if (!hasProp.call(obj, prop)) continue;
      value = obj[prop];
      if (!(indexOf.call(excludeList, prop) < 0)) {
        continue;
      }
      s = "- " + prefix + prop;
      if (value instanceof options.recursiveInspect) {
        s += ":\n" + (inspectInstance(value, options));
      } else if (_.isFunction(value)) {
        ref2 = inspectFunction(value, prop), argumentsSignature = ref2.argumentsSignature, superSignature = ref2.superSignature;
        if ((prop === 'constructor') && (superSignature === 'default')) {
          continue;
        }
        s += "`" + argumentsSignature + "`";
        if (superSignature != null) {
          s += ": `" + superSignature + "`";
        }
      } else {
        s += ": ```" + (util.inspect(value, options)) + "```";
      }
      isOverridden = _.detect(ancesstors, function(ancestor) {
        return ancestor.prototype.hasOwnProperty(prop);
      });
      if (isOverridden) {
        s += ": **Overridden**";
      }
      results.push(s);
    }
    if (!results.length) {
      return null;
    }
    return results.join('\n');
  };

  report = function(obj, options) {
    var name;
    if (options == null) {
      options = {};
    }
    name = obj.name;
    return {
      name: name,
      ancesstorsNames: _.pluck(getAncestors(obj), 'name'),
      command: getCommandFromClass(obj),
      instance: inspectObject(obj, options),
      prototype: inspectObject(obj, options, true)
    };
  };

  sortByAncesstor = function(list) {
    var compare, mapped;
    mapped = list.map(function(obj, i) {
      return {
        index: i,
        value: obj.ancesstorsNames.slice().reverse()
      };
    });
    compare = function(v1, v2) {
      var a, b;
      a = v1.value[0];
      b = v2.value[0];
      switch (false) {
        case !((a === void 0) && (b === void 0)):
          return 0;
        case a !== void 0:
          return -1;
        case b !== void 0:
          return 1;
        case !(a < b):
          return -1;
        case !(a > b):
          return 1;
        default:
          a = {
            index: v1.index,
            value: v1.value.slice(1)
          };
          b = {
            index: v2.index,
            value: v2.value.slice(1)
          };
          return compare(a, b);
      }
    };
    return mapped.sort(compare).map(function(e) {
      return list[e.index];
    });
  };

  genTableOfContent = function(obj) {
    var ancesstorsNames, indent, indentLevel, link, name, s;
    name = obj.name, ancesstorsNames = obj.ancesstorsNames;
    indentLevel = ancesstorsNames.length - 1;
    indent = _.multiplyString('  ', indentLevel);
    link = ancesstorsNames.slice(0, 2).join('--').toLowerCase();
    s = indent + "- [" + name + "](#" + link + ")";
    if (obj.virtual != null) {
      s += ' *Not exported*';
    }
    return s;
  };

  generateIntrospectionReport = function(klasses, options) {
    var ancesstors, body, command, content, date, header, instance, j, keymaps, klass, len, pack, prototype, result, results, s, toc, version;
    pack = atom.packages.getActivePackage(packageName);
    version = pack.metadata.version;
    results = (function() {
      var j, len, results1;
      results1 = [];
      for (j = 0, len = klasses.length; j < len; j++) {
        klass = klasses[j];
        results1.push(report(klass, options));
      }
      return results1;
    })();
    results = sortByAncesstor(results);
    toc = results.map(function(e) {
      return genTableOfContent(e);
    }).join('\n');
    body = [];
    for (j = 0, len = results.length; j < len; j++) {
      result = results[j];
      ancesstors = result.ancesstorsNames.slice(0, 2);
      header = "#" + (_.multiplyString('#', ancesstors.length)) + " " + (ancesstors.join(" < "));
      s = [];
      s.push(header);
      command = result.command, instance = result.instance, prototype = result.prototype;
      if (command != null) {
        s.push("- command: `" + command + "`");
        keymaps = getKeyBindingForCommand(command, {
          packageName: 'vim-mode-plus'
        });
        if (keymaps != null) {
          s.push(formatKeymaps(keymaps));
        }
      }
      if (instance != null) {
        s.push(instance);
      }
      if (prototype != null) {
        s.push(prototype);
      }
      body.push(s.join("\n"));
    }
    date = new Date().toISOString();
    content = [packageName + " version: " + version + "  \n*generated at " + date + "*", toc, body.join("\n\n")].join("\n\n");
    return atom.workspace.open().then(function(editor) {
      editor.setText(content);
      return editor.setGrammar(atom.grammars.grammarForScopeName('source.gfm'));
    });
  };

  formatKeymaps = function(keymaps) {
    var j, keymap, keystrokes, len, s, selector;
    s = [];
    s.push('  - keymaps');
    for (j = 0, len = keymaps.length; j < len; j++) {
      keymap = keymaps[j];
      keystrokes = keymap.keystrokes, selector = keymap.selector;
      keystrokes = keystrokes.replace(/(`|_)/g, '\\$1');
      s.push("    - `" + selector + "`: <kbd>" + keystrokes + "</kbd>");
    }
    return s.join("\n");
  };

  formatReport = function(report) {
    var ancesstorsNames, instance, prototype, s;
    instance = report.instance, prototype = report.prototype, ancesstorsNames = report.ancesstorsNames;
    s = [];
    s.push("# " + (ancesstorsNames.join(" < ")));
    if (instance != null) {
      s.push(instance);
    }
    if (prototype != null) {
      s.push(prototype);
    }
    return s.join("\n");
  };

  inspectInstance = function(obj, options) {
    var indent, ref1, rep;
    if (options == null) {
      options = {};
    }
    indent = _.multiplyString(' ', (ref1 = options.indent) != null ? ref1 : 0);
    rep = report(obj.constructor, options);
    return ["## " + obj + ": " + (rep.ancesstorsNames.slice(0, 2).join(" < ")), inspectObject(obj, options), formatReport(rep)].filter(function(e) {
      return e;
    }).join('\n').split('\n').map(function(e) {
      return indent + e;
    }).join('\n');
  };

  getCommandFromClass = function(klass) {
    if (klass.isCommand()) {
      return klass.getCommandName();
    } else {
      return null;
    }
  };

  module.exports = generateIntrospectionReport;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2ludHJvc3BlY3Rpb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxUkFBQTtJQUFBOzs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsTUFBMEMsT0FBQSxDQUFRLFNBQVIsQ0FBMUMsRUFBQywrQkFBRCxFQUFlOztFQUVmLFdBQUEsR0FBYzs7RUFFZCxjQUFBLEdBQWlCLFNBQUMsR0FBRCxFQUFNLEVBQU4sRUFBVSxFQUFWO1dBQ2YsR0FBRyxDQUFDLFNBQUosQ0FBYyxHQUFHLENBQUMsT0FBSixDQUFZLEVBQVosQ0FBQSxHQUFnQixDQUE5QixFQUFpQyxHQUFHLENBQUMsV0FBSixDQUFnQixFQUFoQixDQUFqQztFQURlOztFQUdqQixlQUFBLEdBQWtCLFNBQUMsRUFBRCxFQUFLLElBQUw7QUFhaEIsUUFBQTtJQUFBLFNBQUEsR0FBWSxDQUFDLENBQUMsWUFBRixDQUFrQixFQUFFLENBQUMsSUFBSixHQUFTLGFBQVQsR0FBc0IsSUFBdkM7SUFDWixTQUFBLEdBQVksU0FBQSxHQUFZLENBQUMsQ0FBQyxZQUFGLENBQWUsMEJBQWY7SUFDeEIsa0JBQUEsR0FBcUIsVUFBQSxHQUFhO0lBQ2xDLGVBQUEsR0FBa0IsU0FBQSxHQUFZO0lBRTlCLFFBQUEsR0FBVyxFQUFFLENBQUMsUUFBSCxDQUFBO0lBQ1gsTUFBQSxHQUFTLGNBQUEsQ0FBZSxRQUFmLEVBQXlCLEdBQXpCLEVBQThCLEdBQTlCLENBQWtDLENBQUMsS0FBbkMsQ0FBeUMsSUFBekMsQ0FBOEMsQ0FBQyxHQUEvQyxDQUFtRCxTQUFDLENBQUQ7YUFBTyxDQUFDLENBQUMsSUFBRixDQUFBO0lBQVAsQ0FB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QUFLLENBQUMsY0FBTixDQUFBLEVBQTFCO0tBQUEsTUFBQTthQUFzRCxLQUF0RDs7RUFEb0I7O0VBR3RCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBbE1qQiIsInNvdXJjZXNDb250ZW50IjpbInV0aWwgPSByZXF1aXJlICd1dGlsJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG57Z2V0QW5jZXN0b3JzLCBnZXRLZXlCaW5kaW5nRm9yQ29tbWFuZH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5wYWNrYWdlTmFtZSA9ICd2aW0tbW9kZS1wbHVzJ1xuXG5leHRyYWN0QmV0d2VlbiA9IChzdHIsIHMxLCBzMikgLT5cbiAgc3RyLnN1YnN0cmluZyhzdHIuaW5kZXhPZihzMSkrMSwgc3RyLmxhc3RJbmRleE9mKHMyKSlcblxuaW5zcGVjdEZ1bmN0aW9uID0gKGZuLCBuYW1lKSAtPlxuICAjIENhbGxpbmcgc3VwZXIgaW4gdGhlIG92ZXJyaWRkZW4gY29uc3RydWN0b3IoKSBmdW5jdGlvbi5cbiAgIyAgQ2FzZS0xOiBObyBvdmVycmlkZS5cbiAgIyAgQ29mZmVlU2NyaXB0IFNvdXJjZTogTi9BXG4gICMgIENvbXBpbGVkIEphdmFTY3JpcHQ6IHJldHVybiBDMS5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgI1xuICAjICBDYXNlLTI6IHN1cGVyIHdpdGhvdXQgcGFyZW50aGVzZXMuXG4gICMgIENvZmZlZVNjcmlwdCBTb3VyY2U6IHN1cGVyXG4gICMgIENvbXBpbGVkIEphdmFTY3JpcHQ6IEMxLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAjXG4gICMgIENhc2UtMzogc3VwZXIgd2l0aCBleHBsaWNpdCBhcmd1bWVudC5cbiAgIyAgQ29mZmVlU2NyaXB0IFNvdXJjZTogc3VwZXIoYTEpXG4gICMgIENvbXBpbGVkIEphdmFTY3JpcHQ6IEMxLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIGExKTtcbiAgc3VwZXJCYXNlID0gXy5lc2NhcGVSZWdFeHAoXCIje2ZuLm5hbWV9Ll9fc3VwZXJfXy4je25hbWV9XCIpXG4gIHN1cGVyQXNJcyA9IHN1cGVyQmFzZSArIF8uZXNjYXBlUmVnRXhwKFwiLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XCIpICMgQ2FzZS0yXG4gIGRlZmF1bHRDb25zdHJ1Y3RvciA9ICdecmV0dXJuICcrICBzdXBlckFzSXMgIyBDYXNlLTFcbiAgc3VwZXJXaXRoTW9kaWZ5ID0gc3VwZXJCYXNlICsgJ1xcXFwuY2FsbFxcXFwoKC4qKVxcXFwpJyAjIENhc2UtM1xuXG4gIGZuU3RyaW5nID0gZm4udG9TdHJpbmcoKVxuICBmbkJvZHkgPSBleHRyYWN0QmV0d2VlbihmblN0cmluZywgJ3snLCAnfScpLnNwbGl0KFwiXFxuXCIpLm1hcCAoZSkgLT4gZS50cmltKClcblxuICAjIEV4dHJhY3QgYXJndW1lbnRzIGZyb20gZm5TdHJpbmcuIGUuZy4gZnVuY3Rpb24oYTEsIGExKXt9IC0+IFsnYTEnLCAnYTInXS5cbiAgZm5BcmdzID0gZm5TdHJpbmcuc3BsaXQoXCJcXG5cIilbMF0ubWF0Y2goL1xcKCguKilcXCkvKVsxXS5zcGxpdCgvLFxccyovZylcblxuICAjIFJlcGxhY2UgWydhcmcxJywgJ2FyZzInXSB0byBbJ0BhcmcxJywgJ0BhcmcyJ10uXG4gICMgT25seSB3aGVuIGluc3RhbmNlIHZhcmlhYmxlIGFzc2lnbm1lbnQgc3RhdGVtZW50IHdhcyBmb3VuZC5cbiAgZm5BcmdzID0gZm5BcmdzLm1hcCAoYXJnKSAtPlxuICAgIGlWYXJBc3NpZ24gPSAnXicgKyBfLmVzY2FwZVJlZ0V4cChcInRoaXMuI3thcmd9ID0gI3thcmd9O1wiKSArICckJ1xuICAgIGlmIChfLmRldGVjdChmbkJvZHksIChsaW5lKSAtPiBsaW5lLm1hdGNoKGlWYXJBc3NpZ24pKSlcbiAgICAgICdAJyArIGFyZ1xuICAgIGVsc2VcbiAgICAgIGFyZ1xuICBhcmd1bWVudHNTaWduYXR1cmUgPSAnKCcgKyBmbkFyZ3Muam9pbignLCAnKSArICcpJ1xuXG4gIHN1cGVyU2lnbmF0dXJlID0gbnVsbFxuICBmb3IgbGluZSBpbiBmbkJvZHlcbiAgICBpZiBuYW1lIGlzICdjb25zdHJ1Y3RvcicgYW5kIGxpbmUubWF0Y2goZGVmYXVsdENvbnN0cnVjdG9yKVxuICAgICAgc3VwZXJTaWduYXR1cmUgPSAnZGVmYXVsdCdcbiAgICBlbHNlIGlmIGxpbmUubWF0Y2goc3VwZXJBc0lzKVxuICAgICAgc3VwZXJTaWduYXR1cmUgPSAnc3VwZXInXG4gICAgZWxzZSBpZiBtID0gbGluZS5tYXRjaChzdXBlcldpdGhNb2RpZnkpXG4gICAgICBhcmdzID0gbVsxXS5yZXBsYWNlKC90aGlzLD9cXHMqLywgJycpICMgRGVsZXRlIDFzdCBhcmcoPXRoaXMpIG9mIGFwcGx5KCkgb3IgY2FsbCgpXG4gICAgICBhcmdzID0gYXJncy5yZXBsYWNlKC90aGlzXFwuL2csICdAJylcbiAgICAgIHN1cGVyU2lnbmF0dXJlID0gXCJzdXBlcigje2FyZ3N9KVwiXG4gICAgYnJlYWsgaWYgc3VwZXJTaWduYXR1cmVcblxuICB7YXJndW1lbnRzU2lnbmF0dXJlLCBzdXBlclNpZ25hdHVyZX1cblxuZXhjbHVkZVByb3BlcnRpZXMgPSBbJ19fc3VwZXJfXyddXG5cbmluc3BlY3RPYmplY3QgPSAob2JqLCBvcHRpb25zPXt9LCBwcm90b3R5cGU9ZmFsc2UpIC0+XG4gIGV4Y2x1ZGVMaXN0ID0gZXhjbHVkZVByb3BlcnRpZXMuY29uY2F0IChvcHRpb25zLmV4Y2x1ZGVQcm9wZXJ0aWVzID8gW10pXG4gIG9wdGlvbnMuZGVwdGggPz0gMVxuICBwcmVmaXggPSAnQCdcbiAgaWYgcHJvdG90eXBlXG4gICAgb2JqID0gb2JqLnByb3RvdHlwZVxuICAgIHByZWZpeCA9ICc6OidcbiAgYW5jZXNzdG9ycyA9IGdldEFuY2VzdG9ycyhvYmouY29uc3RydWN0b3IpXG4gIGFuY2Vzc3RvcnMuc2hpZnQoKSAjIGRyb3AgbXlzZWxmLlxuICByZXN1bHRzID0gW11cbiAgZm9yIG93biBwcm9wLCB2YWx1ZSBvZiBvYmogd2hlbiBwcm9wIG5vdCBpbiBleGNsdWRlTGlzdFxuICAgIHMgPSBcIi0gI3twcmVmaXh9I3twcm9wfVwiXG4gICAgaWYgdmFsdWUgaW5zdGFuY2VvZiBvcHRpb25zLnJlY3Vyc2l2ZUluc3BlY3RcbiAgICAgIHMgKz0gXCI6XFxuI3tpbnNwZWN0SW5zdGFuY2UodmFsdWUsIG9wdGlvbnMpfVwiXG4gICAgZWxzZSBpZiBfLmlzRnVuY3Rpb24odmFsdWUpXG4gICAgICB7YXJndW1lbnRzU2lnbmF0dXJlLCBzdXBlclNpZ25hdHVyZX0gPSBpbnNwZWN0RnVuY3Rpb24odmFsdWUsIHByb3ApXG4gICAgICBpZiAocHJvcCBpcyAnY29uc3RydWN0b3InKSBhbmQgKHN1cGVyU2lnbmF0dXJlIGlzICdkZWZhdWx0JylcbiAgICAgICAgY29udGludWUgIyBoaWRlIGRlZmF1bHQgY29uc3RydWN0b3JcbiAgICAgIHMgKz0gXCJgI3thcmd1bWVudHNTaWduYXR1cmV9YFwiXG4gICAgICBzICs9IFwiOiBgI3tzdXBlclNpZ25hdHVyZX1gXCIgaWYgc3VwZXJTaWduYXR1cmU/XG4gICAgZWxzZVxuICAgICAgcyArPSBcIjogYGBgI3t1dGlsLmluc3BlY3QodmFsdWUsIG9wdGlvbnMpfWBgYFwiXG4gICAgaXNPdmVycmlkZGVuID0gXy5kZXRlY3QoYW5jZXNzdG9ycywgKGFuY2VzdG9yKSAtPiBhbmNlc3Rvcjo6Lmhhc093blByb3BlcnR5KHByb3ApKVxuICAgIHMgKz0gXCI6ICoqT3ZlcnJpZGRlbioqXCIgaWYgaXNPdmVycmlkZGVuXG4gICAgcmVzdWx0cy5wdXNoIHNcblxuICByZXR1cm4gbnVsbCB1bmxlc3MgcmVzdWx0cy5sZW5ndGhcbiAgcmVzdWx0cy5qb2luKCdcXG4nKVxuXG5yZXBvcnQgPSAob2JqLCBvcHRpb25zPXt9KSAtPlxuICBuYW1lID0gb2JqLm5hbWVcbiAge1xuICAgIG5hbWU6IG5hbWVcbiAgICBhbmNlc3N0b3JzTmFtZXM6IF8ucGx1Y2soZ2V0QW5jZXN0b3JzKG9iaiksICduYW1lJylcbiAgICBjb21tYW5kOiBnZXRDb21tYW5kRnJvbUNsYXNzKG9iailcbiAgICBpbnN0YW5jZTogaW5zcGVjdE9iamVjdChvYmosIG9wdGlvbnMpXG4gICAgcHJvdG90eXBlOiBpbnNwZWN0T2JqZWN0KG9iaiwgb3B0aW9ucywgdHJ1ZSlcbiAgfVxuXG5zb3J0QnlBbmNlc3N0b3IgPSAobGlzdCkgLT5cbiAgbWFwcGVkID0gbGlzdC5tYXAgKG9iaiwgaSkgLT5cbiAgICB7aW5kZXg6IGksIHZhbHVlOiBvYmouYW5jZXNzdG9yc05hbWVzLnNsaWNlKCkucmV2ZXJzZSgpfVxuXG4gIGNvbXBhcmUgPSAodjEsIHYyKSAtPlxuICAgIGEgPSB2MS52YWx1ZVswXVxuICAgIGIgPSB2Mi52YWx1ZVswXVxuICAgIHN3aXRjaFxuICAgICAgd2hlbiAoYSBpcyB1bmRlZmluZWQpIGFuZCAoYiBpcyB1bmRlZmluZWQpIHRoZW4gIDBcbiAgICAgIHdoZW4gYSBpcyB1bmRlZmluZWQgdGhlbiAtMVxuICAgICAgd2hlbiBiIGlzIHVuZGVmaW5lZCB0aGVuIDFcbiAgICAgIHdoZW4gYSA8IGIgdGhlbiAtMVxuICAgICAgd2hlbiBhID4gYiB0aGVuIDFcbiAgICAgIGVsc2VcbiAgICAgICAgYSA9IGluZGV4OiB2MS5pbmRleCwgdmFsdWU6IHYxLnZhbHVlWzEuLl1cbiAgICAgICAgYiA9IGluZGV4OiB2Mi5pbmRleCwgdmFsdWU6IHYyLnZhbHVlWzEuLl1cbiAgICAgICAgY29tcGFyZShhLCBiKVxuXG4gIG1hcHBlZC5zb3J0KGNvbXBhcmUpLm1hcCgoZSkgLT4gbGlzdFtlLmluZGV4XSlcblxuZ2VuVGFibGVPZkNvbnRlbnQgPSAob2JqKSAtPlxuICB7bmFtZSwgYW5jZXNzdG9yc05hbWVzfSA9IG9ialxuICBpbmRlbnRMZXZlbCA9IGFuY2Vzc3RvcnNOYW1lcy5sZW5ndGggLSAxXG4gIGluZGVudCA9IF8ubXVsdGlwbHlTdHJpbmcoJyAgJywgaW5kZW50TGV2ZWwpXG4gIGxpbmsgPSBhbmNlc3N0b3JzTmFtZXNbMC4uMV0uam9pbignLS0nKS50b0xvd2VyQ2FzZSgpXG4gIHMgPSBcIiN7aW5kZW50fS0gWyN7bmFtZX1dKCMje2xpbmt9KVwiXG4gIHMgKz0gJyAqTm90IGV4cG9ydGVkKicgaWYgb2JqLnZpcnR1YWw/XG4gIHNcblxuZ2VuZXJhdGVJbnRyb3NwZWN0aW9uUmVwb3J0ID0gKGtsYXNzZXMsIG9wdGlvbnMpIC0+XG4gIHBhY2sgPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UocGFja2FnZU5hbWUpXG4gIHt2ZXJzaW9ufSA9IHBhY2subWV0YWRhdGFcblxuICByZXN1bHRzID0gKHJlcG9ydChrbGFzcywgb3B0aW9ucykgZm9yIGtsYXNzIGluIGtsYXNzZXMpXG4gIHJlc3VsdHMgPSBzb3J0QnlBbmNlc3N0b3IocmVzdWx0cylcblxuICB0b2MgPSByZXN1bHRzLm1hcCgoZSkgLT4gZ2VuVGFibGVPZkNvbnRlbnQoZSkpLmpvaW4oJ1xcbicpXG4gIGJvZHkgPSBbXVxuICBmb3IgcmVzdWx0IGluIHJlc3VsdHNcbiAgICBhbmNlc3N0b3JzID0gcmVzdWx0LmFuY2Vzc3RvcnNOYW1lc1swLi4xXVxuICAgIGhlYWRlciA9IFwiIyN7Xy5tdWx0aXBseVN0cmluZygnIycsIGFuY2Vzc3RvcnMubGVuZ3RoKX0gI3thbmNlc3N0b3JzLmpvaW4oXCIgPCBcIil9XCJcbiAgICBzID0gW11cbiAgICBzLnB1c2ggaGVhZGVyXG4gICAge2NvbW1hbmQsIGluc3RhbmNlLCBwcm90b3R5cGV9ID0gcmVzdWx0XG4gICAgaWYgY29tbWFuZD9cbiAgICAgIHMucHVzaCBcIi0gY29tbWFuZDogYCN7Y29tbWFuZH1gXCJcbiAgICAgIGtleW1hcHMgPSBnZXRLZXlCaW5kaW5nRm9yQ29tbWFuZChjb21tYW5kLCBwYWNrYWdlTmFtZTogJ3ZpbS1tb2RlLXBsdXMnKVxuICAgICAgcy5wdXNoIGZvcm1hdEtleW1hcHMoa2V5bWFwcykgaWYga2V5bWFwcz9cblxuICAgIHMucHVzaCBpbnN0YW5jZSBpZiBpbnN0YW5jZT9cbiAgICBzLnB1c2ggcHJvdG90eXBlIGlmIHByb3RvdHlwZT9cbiAgICBib2R5LnB1c2ggcy5qb2luKFwiXFxuXCIpXG5cbiAgZGF0ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICBjb250ZW50ID0gW1xuICAgIFwiI3twYWNrYWdlTmFtZX0gdmVyc2lvbjogI3t2ZXJzaW9ufSAgXFxuKmdlbmVyYXRlZCBhdCAje2RhdGV9KlwiXG4gICAgdG9jXG4gICAgYm9keS5qb2luKFwiXFxuXFxuXCIpXG4gIF0uam9pbihcIlxcblxcblwiKVxuXG4gIGF0b20ud29ya3NwYWNlLm9wZW4oKS50aGVuIChlZGl0b3IpIC0+XG4gICAgZWRpdG9yLnNldFRleHQgY29udGVudFxuICAgIGVkaXRvci5zZXRHcmFtbWFyIGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZSgnc291cmNlLmdmbScpXG5cbmZvcm1hdEtleW1hcHMgPSAoa2V5bWFwcykgLT5cbiAgcyA9IFtdXG4gIHMucHVzaCAnICAtIGtleW1hcHMnXG4gIGZvciBrZXltYXAgaW4ga2V5bWFwc1xuICAgIHtrZXlzdHJva2VzLCBzZWxlY3Rvcn0gPSBrZXltYXBcbiAgICBrZXlzdHJva2VzID0ga2V5c3Ryb2tlcy5yZXBsYWNlKC8oYHxfKS9nLCAnXFxcXCQxJylcbiAgICBzLnB1c2ggXCIgICAgLSBgI3tzZWxlY3Rvcn1gOiA8a2JkPiN7a2V5c3Ryb2tlc308L2tiZD5cIlxuXG4gIHMuam9pbihcIlxcblwiKVxuXG5mb3JtYXRSZXBvcnQgPSAocmVwb3J0KSAtPlxuICB7aW5zdGFuY2UsIHByb3RvdHlwZSwgYW5jZXNzdG9yc05hbWVzfSA9IHJlcG9ydFxuICBzID0gW11cbiAgcy5wdXNoIFwiIyAje2FuY2Vzc3RvcnNOYW1lcy5qb2luKFwiIDwgXCIpfVwiXG4gIHMucHVzaCBpbnN0YW5jZSBpZiBpbnN0YW5jZT9cbiAgcy5wdXNoIHByb3RvdHlwZSBpZiBwcm90b3R5cGU/XG4gIHMuam9pbihcIlxcblwiKVxuXG5pbnNwZWN0SW5zdGFuY2UgPSAob2JqLCBvcHRpb25zPXt9KSAtPlxuICBpbmRlbnQgPSBfLm11bHRpcGx5U3RyaW5nKCcgJywgb3B0aW9ucy5pbmRlbnQgPyAwKVxuICByZXAgPSByZXBvcnQob2JqLmNvbnN0cnVjdG9yLCBvcHRpb25zKVxuICBbXG4gICAgXCIjIyAje29ian06ICN7cmVwLmFuY2Vzc3RvcnNOYW1lc1swLi4xXS5qb2luKFwiIDwgXCIpfVwiXG4gICAgaW5zcGVjdE9iamVjdChvYmosIG9wdGlvbnMpXG4gICAgZm9ybWF0UmVwb3J0KHJlcClcbiAgXS5maWx0ZXIgKGUpIC0+IGVcbiAgLmpvaW4oJ1xcbicpLnNwbGl0KCdcXG4nKS5tYXAoKGUpIC0+IGluZGVudCArIGUpLmpvaW4oJ1xcbicpXG5cbmdldENvbW1hbmRGcm9tQ2xhc3MgPSAoa2xhc3MpIC0+XG4gIGlmIGtsYXNzLmlzQ29tbWFuZCgpIHRoZW4ga2xhc3MuZ2V0Q29tbWFuZE5hbWUoKSBlbHNlIG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBnZW5lcmF0ZUludHJvc3BlY3Rpb25SZXBvcnRcbiJdfQ==
