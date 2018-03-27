(function() {
  var AutoIndent, Point, Range, fs, path, ref;

  ref = require('atom'), Range = ref.Range, Point = ref.Point;

  fs = require('fs-plus');

  path = require('path');

  AutoIndent = require('../lib/auto-indent');

  describe('auto-indent', function() {
    var autoIndent, editor, indentJSXRange, notifications, ref1, sourceCode, sourceCodeRange;
    ref1 = [], autoIndent = ref1[0], editor = ref1[1], notifications = ref1[2], sourceCode = ref1[3], sourceCodeRange = ref1[4], indentJSXRange = ref1[5];
    beforeEach(function() {
      return waitsForPromise(function() {
        return atom.packages.activatePackage('language-babel');
      });
    });
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.workspace.open('non-existent.js').then(function(o) {
          return editor = o;
        });
      });
      return runs(function() {
        autoIndent = new AutoIndent(editor);
        return notifications = atom.notifications;
      });
    });
    describe('::constructor', function() {
      return it(' should setup some valid indentation defaults', function() {
        var expectedResult;
        expectedResult = {
          jsxIndent: [1, 1],
          jsxIndentProps: [1, 1],
          jsxClosingBracketLocation: [
            1, {
              selfClosing: 'tag-aligned',
              nonEmpty: 'tag-aligned'
            }
          ]
        };
        return expect(autoIndent.eslintIndentOptions).toEqual(expectedResult);
      });
    });
    describe('::getEslintrcFilename', function() {
      it('returns a correct project path for the source file', function() {
        return expect(path.dirname(autoIndent.getEslintrcFilename())).toEqual(path.dirname(editor.getPath()));
      });
      return it('returns a .eslintrc file name', function() {
        return expect(path.basename(autoIndent.getEslintrcFilename())).toEqual('.eslintrc');
      });
    });
    return describe('::readEslintrcOptions', function() {
      it('returns an empty object on a missing .eslintrc', function() {
        return expect(autoIndent.readEslintrcOptions('.missing')).toEqual({});
      });
      it('returns and empty Object and a notification message on bad eslint', function() {
        var obj;
        spyOn(fs, 'existsSync').andReturn(true);
        spyOn(fs, 'readFileSync').andReturn('{');
        spyOn(notifications, 'addError').andCallThrough();
        obj = autoIndent.readEslintrcOptions();
        expect(notifications.addError).toHaveBeenCalled();
        return expect(obj).toEqual({});
      });
      it('returns an empty Object when eslint with no rules is read', function() {
        var obj;
        spyOn(fs, 'existsSync').andReturn(true);
        spyOn(fs, 'readFileSync').andReturn('{}');
        spyOn(notifications, 'addError').andCallThrough();
        obj = autoIndent.readEslintrcOptions();
        expect(notifications.addError).not.toHaveBeenCalled();
        return expect(obj).toEqual({});
      });
      describe('::translateIndentOptions', function() {
        it('should return expected defaults when no object is input', function() {
          var expectedResult, result;
          result = autoIndent.translateIndentOptions();
          expectedResult = {
            jsxIndent: [1, 1],
            jsxIndentProps: [1, 1],
            jsxClosingBracketLocation: [
              1, {
                selfClosing: 'tag-aligned',
                nonEmpty: 'tag-aligned'
              }
            ]
          };
          return expect(result).toEqual(expectedResult);
        });
        it('should return expected defaults when no valid object is input', function() {
          var expectedResult, result;
          result = autoIndent.translateIndentOptions({});
          expectedResult = {
            jsxIndent: [1, 1],
            jsxIndentProps: [1, 1],
            jsxClosingBracketLocation: [
              1, {
                selfClosing: 'tag-aligned',
                nonEmpty: 'tag-aligned'
              }
            ]
          };
          return expect(result).toEqual(expectedResult);
        });
        it('should return two tab markers for jsx and props when an indent of 4 spaces is found', function() {
          var expectedResult, result, rules;
          rules = {
            "indent": [1, 4]
          };
          result = autoIndent.translateIndentOptions(rules);
          expectedResult = {
            jsxIndent: [1, 2],
            jsxIndentProps: [1, 2],
            jsxClosingBracketLocation: [
              1, {
                selfClosing: 'tag-aligned',
                nonEmpty: 'tag-aligned'
              }
            ]
          };
          return expect(result).toEqual(expectedResult);
        });
        it('should return one tab markers for jsx and props when an indent "tab" is found', function() {
          var expectedResult, result, rules;
          rules = {
            "indent": [1, "tab"]
          };
          result = autoIndent.translateIndentOptions(rules);
          expectedResult = {
            jsxIndent: [1, 1],
            jsxIndentProps: [1, 1],
            jsxClosingBracketLocation: [
              1, {
                selfClosing: 'tag-aligned',
                nonEmpty: 'tag-aligned'
              }
            ]
          };
          return expect(result).toEqual(expectedResult);
        });
        it('should return jsxIndent of 2 tabs and jsxIndentProps of 3', function() {
          var expectedResult, result, rules;
          rules = {
            "indent": [1, 6],
            "react/jsx-indent": ["warn", 4]
          };
          result = autoIndent.translateIndentOptions(rules);
          expectedResult = {
            jsxIndent: ['warn', 2],
            jsxIndentProps: [1, 3],
            jsxClosingBracketLocation: [
              1, {
                selfClosing: 'tag-aligned',
                nonEmpty: 'tag-aligned'
              }
            ]
          };
          return expect(result).toEqual(expectedResult);
        });
        it('should return jsxIndent of 2 tabs and jsxIndentProps of 2', function() {
          var expectedResult, result, rules;
          rules = {
            "indent": [1, 6],
            "react/jsx-indent": ["warn", 4],
            "react/jsx-indent-props": [2, 4]
          };
          result = autoIndent.translateIndentOptions(rules);
          expectedResult = {
            jsxIndent: ['warn', 2],
            jsxIndentProps: [2, 2],
            jsxClosingBracketLocation: [
              1, {
                selfClosing: 'tag-aligned',
                nonEmpty: 'tag-aligned'
              }
            ]
          };
          return expect(result).toEqual(expectedResult);
        });
        it('should return jsxIndent of 2 tabs and jsxIndentProps of 2, line-aligned', function() {
          var expectedResult, result, rules;
          rules = {
            "indent": [1, 6],
            "react/jsx-indent": ["warn", 4],
            "react/jsx-indent-props": [2, 4],
            'react/jsx-closing-bracket-location': [1, 'line-aligned']
          };
          result = autoIndent.translateIndentOptions(rules);
          expectedResult = {
            jsxIndent: ['warn', 2],
            jsxIndentProps: [2, 2],
            jsxClosingBracketLocation: [
              1, {
                selfClosing: 'line-aligned',
                nonEmpty: 'line-aligned'
              }
            ]
          };
          return expect(result).toEqual(expectedResult);
        });
        return it('should return jsxIndent of 2 tabs and jsxIndentProps of 2, line-aligned and props-aligned', function() {
          var expectedResult, result, rules;
          rules = {
            "indent": [1, 6],
            "react/jsx-indent": ["warn", 4],
            "react/jsx-indent-props": [2, 4],
            "react/jsx-closing-bracket-location": [
              1, {
                "nonEmpty": "props-aligned",
                "selfClosing": "line-aligned"
              }
            ]
          };
          result = autoIndent.translateIndentOptions(rules);
          expectedResult = {
            jsxIndent: ['warn', 2],
            jsxIndentProps: [2, 2],
            jsxClosingBracketLocation: [
              1, {
                selfClosing: 'line-aligned',
                nonEmpty: 'props-aligned'
              }
            ]
          };
          return expect(result).toEqual(expectedResult);
        });
      });
      describe('::indentJSX', function() {
        beforeEach(function() {
          sourceCode = "<div className={rootClass}>\n{this._renderPlaceholder()}\n<div\nclassName={cx('DraftEditor/editorContainer')}\nkey={'editor' + this.state.containerKey}\nref=\"editorContainer\"\n>\n<div\naria-activedescendant={\nreadOnly ? null : this.props.ariaActiveDescendantID\n}\naria-autocomplete={readOnly ? null : this.props.ariaAutoComplete}\n>\n{this._renderPlaceholder()}\n<Component p1\np2\n/>\n</div>\n{ // tests inline JSX\ntrainerProfile.backgroundImageLink\n? <Image style={styles.video} source={{uri: `${AppConfig.apiURL}${trainerProfile.backgroundImageLink}`}} />\n: <Image style={styles.video} source={{uri: `https://placehold.it/375x140`}} />\n}\n{\ncond ?\n<span/>:\n<span></span>\n}\n</div>\n</div>\n";
          editor.insertText(sourceCode);
          sourceCodeRange = new Range(new Point(0, 0), new Point(31, 0));
          return indentJSXRange = new Range(new Point(0, 0), new Point(30, 1));
        });
        it('should indent JSX according to eslint rules', function() {
          var indentedCode;
          indentedCode = "<div className={rootClass}>\n  {this._renderPlaceholder()}\n  <div\n    className={cx('DraftEditor/editorContainer')}\n    key={'editor' + this.state.containerKey}\n    ref=\"editorContainer\"\n  >\n    <div\n      aria-activedescendant={\n        readOnly ? null : this.props.ariaActiveDescendantID\n      }\n      aria-autocomplete={readOnly ? null : this.props.ariaAutoComplete}\n    >\n      {this._renderPlaceholder()}\n      <Component p1\n        p2\n      />\n    </div>\n    { // tests inline JSX\n      trainerProfile.backgroundImageLink\n        ? <Image style={styles.video} source={{uri: `${AppConfig.apiURL}${trainerProfile.backgroundImageLink}`}} />\n        : <Image style={styles.video} source={{uri: `https://placehold.it/375x140`}} />\n    }\n    {\n      cond ?\n        <span/>:\n        <span></span>\n    }\n  </div>\n</div>\n";
          autoIndent.eslintIndentOptions = {
            jsxIndent: [1, 1],
            jsxIndentProps: [1, 1],
            jsxClosingBracketLocation: [
              1, {
                selfClosing: 'tag-aligned',
                nonEmpty: 'tag-aligned'
              }
            ]
          };
          autoIndent.autoJsx = true;
          autoIndent.indentJSX(indentJSXRange);
          return expect(editor.getTextInBufferRange(sourceCodeRange)).toEqual(indentedCode);
        });
        return it('should indent JSX according to eslint rules and tag closing alignment', function() {
          var indentedCode;
          indentedCode = "<div className={rootClass}>\n    {this._renderPlaceholder()}\n    <div\n        className={cx('DraftEditor/editorContainer')}\n        key={'editor' + this.state.containerKey}\n        ref=\"editorContainer\"\n        >\n        <div\n            aria-activedescendant={\n                readOnly ? null : this.props.ariaActiveDescendantID\n            }\n            aria-autocomplete={readOnly ? null : this.props.ariaAutoComplete}\n            >\n            {this._renderPlaceholder()}\n            <Component p1\n                p2\n                />\n        </div>\n        { // tests inline JSX\n            trainerProfile.backgroundImageLink\n                ? <Image style={styles.video} source={{uri: `${AppConfig.apiURL}${trainerProfile.backgroundImageLink}`}} />\n                : <Image style={styles.video} source={{uri: `https://placehold.it/375x140`}} />\n        }\n        {\n            cond ?\n                <span/>:\n                <span></span>\n        }\n    </div>\n</div>\n";
          autoIndent.eslintIndentOptions = {
            jsxIndent: [1, 2],
            jsxIndentProps: [1, 2],
            jsxClosingBracketLocation: [
              1, {
                selfClosing: 'props-aligned',
                nonEmpty: 'props-aligned'
              }
            ]
          };
          autoIndent.autoJsx = true;
          autoIndent.indentJSX(indentJSXRange);
          return expect(editor.getTextInBufferRange(sourceCodeRange)).toEqual(indentedCode);
        });
      });
      return describe('insert-nl-jsx', function() {
        return it('should insert two new lines and position cursor between JSX tags', function() {
          autoIndent.eslintIndentOptions = {
            jsxIndent: [1, 1],
            jsxIndentProps: [1, 1],
            jsxClosingBracketLocation: [
              1, {
                selfClosing: 'tabs-aligned',
                nonEmpty: 'tabs-aligned'
              }
            ]
          };
          autoIndent.autoJsx = true;
          editor.insertText('<div></div>');
          editor.setCursorBufferPosition([0, 5]);
          editor.insertText('\n');
          expect(editor.getTextInBufferRange([[0, 0], [0, 5]])).toEqual("<div>");
          expect(editor.getTextInBufferRange([[1, 0], [1, 2]])).toEqual("  ");
          expect(editor.getTextInBufferRange([[2, 0], [2, 6]])).toEqual("</div>");
          return expect(editor.getCursorBufferPosition()).toEqual([1, 2]);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWJhYmVsL3NwZWMvYXV0by1pbmRlbnQtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7QUFBQSxNQUFBOztFQUFBLE1BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsaUJBQUQsRUFBUTs7RUFDUixFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFVBQUEsR0FBYSxPQUFBLENBQVEsb0JBQVI7O0VBRWIsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQTtBQUN0QixRQUFBO0lBQUEsT0FBbUYsRUFBbkYsRUFBQyxvQkFBRCxFQUFhLGdCQUFiLEVBQXFCLHVCQUFyQixFQUFvQyxvQkFBcEMsRUFBZ0QseUJBQWhELEVBQWlFO0lBRWpFLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsZUFBQSxDQUFnQixTQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGdCQUE5QjtNQURjLENBQWhCO0lBRFMsQ0FBWDtJQUlBLFVBQUEsQ0FBVyxTQUFBO01BQ1QsZUFBQSxDQUFnQixTQUFBO2VBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLGlCQUFwQixDQUFzQyxDQUFDLElBQXZDLENBQTRDLFNBQUMsQ0FBRDtpQkFBTyxNQUFBLEdBQVM7UUFBaEIsQ0FBNUM7TUFEYyxDQUFoQjthQUdBLElBQUEsQ0FBSyxTQUFBO1FBQ0gsVUFBQSxHQUFpQixJQUFBLFVBQUEsQ0FBVyxNQUFYO2VBQ2pCLGFBQUEsR0FBZ0IsSUFBSSxDQUFDO01BRmxCLENBQUw7SUFKUyxDQUFYO0lBVUEsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQTthQUN4QixFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQTtBQUNsRCxZQUFBO1FBQUEsY0FBQSxHQUNFO1VBQUEsU0FBQSxF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QUEyQjtjQUFFLENBQUYsRUFDekI7Z0JBQUEsV0FBQSxFQUFhLGNBQWI7Z0JBQ0EsUUFBQSxFQUFVLGNBRFY7ZUFEeUI7YUFGM0I7O1VBS0YsVUFBVSxDQUFDLE9BQVgsR0FBcUI7VUFDckIsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsYUFBbEI7VUFDQSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUEvQjtVQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLElBQWxCO1VBRUEsTUFBQSxDQUFPLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixDQUFDLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBRCxFQUFPLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBUCxDQUE1QixDQUFQLENBQWtELENBQUMsT0FBbkQsQ0FBMkQsT0FBM0Q7VUFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLG9CQUFQLENBQTRCLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQU8sQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFQLENBQTVCLENBQVAsQ0FBa0QsQ0FBQyxPQUFuRCxDQUEyRCxJQUEzRDtVQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsQ0FBQyxDQUFDLENBQUQsRUFBRyxDQUFILENBQUQsRUFBTyxDQUFDLENBQUQsRUFBRyxDQUFILENBQVAsQ0FBNUIsQ0FBUCxDQUFrRCxDQUFDLE9BQW5ELENBQTJELFFBQTNEO2lCQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFQLENBQXdDLENBQUMsT0FBekMsQ0FBaUQsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFqRDtRQWhCcUUsQ0FBdkU7TUFGd0IsQ0FBMUI7SUFsUGdDLENBQWxDO0VBbENzQixDQUF4QjtBQUxBIiwic291cmNlc0NvbnRlbnQiOlsiIyBUZXN0cyBmb3IgQXV0byBJbmRlbnRpbmcgSlNYXG5cbntSYW5nZSwgUG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuQXV0b0luZGVudCA9IHJlcXVpcmUgJy4uL2xpYi9hdXRvLWluZGVudCdcblxuZGVzY3JpYmUgJ2F1dG8taW5kZW50JywgLT5cbiAgW2F1dG9JbmRlbnQsIGVkaXRvciwgbm90aWZpY2F0aW9ucywgc291cmNlQ29kZSwgc291cmNlQ29kZVJhbmdlLCBpbmRlbnRKU1hSYW5nZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1iYWJlbCcpXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbignbm9uLWV4aXN0ZW50LmpzJykudGhlbiAobykgLT4gZWRpdG9yID0gb1xuXG4gICAgcnVucyAtPlxuICAgICAgYXV0b0luZGVudCA9IG5ldyBBdXRvSW5kZW50KGVkaXRvcilcbiAgICAgIG5vdGlmaWNhdGlvbnMgPSBhdG9tLm5vdGlmaWNhdGlvbnNcblxuXG4gICMgOjogY29uc3RydWN0b3JcbiAgZGVzY3JpYmUgJzo6Y29uc3RydWN0b3InLCAtPlxuICAgIGl0ICcgc2hvdWxkIHNldHVwIHNvbWUgdmFsaWQgaW5kZW50YXRpb24gZGVmYXVsdHMnLCAtPlxuICAgICAgZXhwZWN0ZWRSZXN1bHQgPVxuICAgICAgICBqc3hJbmRlbnQ6IFsxLDFdXG4gICAgICAgIGpzeEluZGVudFByb3BzOiBbMSwxXVxuICAgICAgICBqc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uOiBbIDEsIHsgc2VsZkNsb3Npbmc6ICd0YWctYWxpZ25lZCcsIG5vbkVtcHR5OiAndGFnLWFsaWduZWQnfSBdXG4gICAgICBleHBlY3QoYXV0b0luZGVudC5lc2xpbnRJbmRlbnRPcHRpb25zKS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KVxuXG4gICMgOjpnZXRFc2xpbnRyY0ZpbGVuYW1lXG4gIGRlc2NyaWJlICc6OmdldEVzbGludHJjRmlsZW5hbWUnLCAtPlxuICAgIGl0ICdyZXR1cm5zIGEgY29ycmVjdCBwcm9qZWN0IHBhdGggZm9yIHRoZSBzb3VyY2UgZmlsZScsIC0+XG4gICAgICBleHBlY3QocGF0aC5kaXJuYW1lKGF1dG9JbmRlbnQuZ2V0RXNsaW50cmNGaWxlbmFtZSgpKSkudG9FcXVhbChwYXRoLmRpcm5hbWUoZWRpdG9yLmdldFBhdGgoKSkpXG5cbiAgICBpdCAncmV0dXJucyBhIC5lc2xpbnRyYyBmaWxlIG5hbWUnLCAtPlxuICAgICAgZXhwZWN0KHBhdGguYmFzZW5hbWUoYXV0b0luZGVudC5nZXRFc2xpbnRyY0ZpbGVuYW1lKCkpKS50b0VxdWFsKCcuZXNsaW50cmMnKVxuXG4gICMgOjpyZWFkRXNsaW50cmNPcHRpb25zXG4gIGRlc2NyaWJlICc6OnJlYWRFc2xpbnRyY09wdGlvbnMnLCAtPlxuICAgIGl0ICdyZXR1cm5zIGFuIGVtcHR5IG9iamVjdCBvbiBhIG1pc3NpbmcgLmVzbGludHJjJywgLT5cbiAgICAgIGV4cGVjdChhdXRvSW5kZW50LnJlYWRFc2xpbnRyY09wdGlvbnMoJy5taXNzaW5nJykpLnRvRXF1YWwoe30pXG5cbiAgICBpdCAncmV0dXJucyBhbmQgZW1wdHkgT2JqZWN0IGFuZCBhIG5vdGlmaWNhdGlvbiBtZXNzYWdlIG9uIGJhZCBlc2xpbnQnLCAtPlxuICAgICAgc3B5T24oZnMsICdleGlzdHNTeW5jJykuYW5kUmV0dXJuKHRydWUpXG4gICAgICBzcHlPbihmcywgJ3JlYWRGaWxlU3luYycpLmFuZFJldHVybigneycpXG4gICAgICBzcHlPbihub3RpZmljYXRpb25zLCAnYWRkRXJyb3InKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBvYmogPSBhdXRvSW5kZW50LnJlYWRFc2xpbnRyY09wdGlvbnMoKVxuICAgICAgZXhwZWN0KG5vdGlmaWNhdGlvbnMuYWRkRXJyb3IpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZXhwZWN0KG9iaikudG9FcXVhbCh7fSlcblxuICAgIGl0ICdyZXR1cm5zIGFuIGVtcHR5IE9iamVjdCB3aGVuIGVzbGludCB3aXRoIG5vIHJ1bGVzIGlzIHJlYWQnLCAtPlxuICAgICAgc3B5T24oZnMsICdleGlzdHNTeW5jJykuYW5kUmV0dXJuKHRydWUpXG4gICAgICBzcHlPbihmcywgJ3JlYWRGaWxlU3luYycpLmFuZFJldHVybigne30nKVxuICAgICAgc3B5T24obm90aWZpY2F0aW9ucywgJ2FkZEVycm9yJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgb2JqID0gYXV0b0luZGVudC5yZWFkRXNsaW50cmNPcHRpb25zKClcbiAgICAgIGV4cGVjdChub3RpZmljYXRpb25zLmFkZEVycm9yKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICBleHBlY3Qob2JqKS50b0VxdWFsKHt9KVxuXG4gICAgIyA6OnRyYW5zbGF0ZUluZGVudE9wdGlvbnNcbiAgICBkZXNjcmliZSAnOjp0cmFuc2xhdGVJbmRlbnRPcHRpb25zJywgLT5cbiAgICAgIGl0ICdzaG91bGQgcmV0dXJuIGV4cGVjdGVkIGRlZmF1bHRzIHdoZW4gbm8gb2JqZWN0IGlzIGlucHV0JywgLT5cbiAgICAgICAgcmVzdWx0ID0gYXV0b0luZGVudC50cmFuc2xhdGVJbmRlbnRPcHRpb25zKClcbiAgICAgICAgZXhwZWN0ZWRSZXN1bHQgPVxuICAgICAgICAgIGpzeEluZGVudDogWzEsMV1cbiAgICAgICAgICBqc3hJbmRlbnRQcm9wczogWzEsMV1cbiAgICAgICAgICBqc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uOiBbIDEsIHsgc2VsZkNsb3Npbmc6ICd0YWctYWxpZ25lZCcsIG5vbkVtcHR5OiAndGFnLWFsaWduZWQnfSBdXG4gICAgICAgIGV4cGVjdChyZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpXG5cbiAgICAgIGl0ICdzaG91bGQgcmV0dXJuIGV4cGVjdGVkIGRlZmF1bHRzIHdoZW4gbm8gdmFsaWQgb2JqZWN0IGlzIGlucHV0JywgLT5cbiAgICAgICAgcmVzdWx0ID0gYXV0b0luZGVudC50cmFuc2xhdGVJbmRlbnRPcHRpb25zKHt9KVxuICAgICAgICBleHBlY3RlZFJlc3VsdCA9XG4gICAgICAgICAganN4SW5kZW50OiBbMSwxXVxuICAgICAgICAgIGpzeEluZGVudFByb3BzOiBbMSwxXVxuICAgICAgICAgIGpzeENsb3NpbmdCcmFja2V0TG9jYXRpb246IFsgMSwgeyBzZWxmQ2xvc2luZzogJ3RhZy1hbGlnbmVkJywgbm9uRW1wdHk6ICd0YWctYWxpZ25lZCd9IF1cbiAgICAgICAgZXhwZWN0KHJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdClcblxuICAgICAgaXQgJ3Nob3VsZCByZXR1cm4gdHdvIHRhYiBtYXJrZXJzIGZvciBqc3ggYW5kIHByb3BzIHdoZW4gYW4gaW5kZW50IG9mIDQgc3BhY2VzIGlzIGZvdW5kJywgLT5cbiAgICAgICAgcnVsZXMgPVxuICAgICAgICAgIFwiaW5kZW50XCI6IFsxLCA0XVxuICAgICAgICByZXN1bHQgPSBhdXRvSW5kZW50LnRyYW5zbGF0ZUluZGVudE9wdGlvbnMocnVsZXMpXG4gICAgICAgIGV4cGVjdGVkUmVzdWx0ID1cbiAgICAgICAgICBqc3hJbmRlbnQ6IFsxLDJdXG4gICAgICAgICAganN4SW5kZW50UHJvcHM6IFsxLDJdXG4gICAgICAgICAganN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvbjogWyAxLCB7IHNlbGZDbG9zaW5nOiAndGFnLWFsaWduZWQnLCBub25FbXB0eTogJ3RhZy1hbGlnbmVkJ30gXVxuICAgICAgICBleHBlY3QocmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KVxuXG4gICAgICBpdCAnc2hvdWxkIHJldHVybiBvbmUgdGFiIG1hcmtlcnMgZm9yIGpzeCBhbmQgcHJvcHMgd2hlbiBhbiBpbmRlbnQgXCJ0YWJcIiBpcyBmb3VuZCcsIC0+XG4gICAgICAgIHJ1bGVzID1cbiAgICAgICAgICBcImluZGVudFwiOiBbMSwgXCJ0YWJcIl1cbiAgICAgICAgcmVzdWx0ID0gYXV0b0luZGVudC50cmFuc2xhdGVJbmRlbnRPcHRpb25zKHJ1bGVzKVxuICAgICAgICBleHBlY3RlZFJlc3VsdCA9XG4gICAgICAgICAganN4SW5kZW50OiBbMSwxXVxuICAgICAgICAgIGpzeEluZGVudFByb3BzOiBbMSwxXVxuICAgICAgICAgIGpzeENsb3NpbmdCcmFja2V0TG9jYXRpb246IFsgMSwgeyBzZWxmQ2xvc2luZzogJ3RhZy1hbGlnbmVkJywgbm9uRW1wdHk6ICd0YWctYWxpZ25lZCd9IF1cbiAgICAgICAgZXhwZWN0KHJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdClcblxuICAgICAgaXQgJ3Nob3VsZCByZXR1cm4ganN4SW5kZW50IG9mIDIgdGFicyBhbmQganN4SW5kZW50UHJvcHMgb2YgMycsIC0+XG4gICAgICAgIHJ1bGVzID1cbiAgICAgICAgICBcImluZGVudFwiOiBbMSwgNl1cbiAgICAgICAgICBcInJlYWN0L2pzeC1pbmRlbnRcIjogW1wid2FyblwiLCA0XVxuICAgICAgICByZXN1bHQgPSBhdXRvSW5kZW50LnRyYW5zbGF0ZUluZGVudE9wdGlvbnMocnVsZXMpXG4gICAgICAgIGV4cGVjdGVkUmVzdWx0ID1cbiAgICAgICAgICBqc3hJbmRlbnQ6IFsnd2FybicsIDJdXG4gICAgICAgICAganN4SW5kZW50UHJvcHM6IFsxLCAzXVxuICAgICAgICAgIGpzeENsb3NpbmdCcmFja2V0TG9jYXRpb246IFsgMSwgeyBzZWxmQ2xvc2luZzogJ3RhZy1hbGlnbmVkJywgbm9uRW1wdHk6ICd0YWctYWxpZ25lZCd9IF1cbiAgICAgICAgZXhwZWN0KHJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdClcblxuICAgICAgaXQgJ3Nob3VsZCByZXR1cm4ganN4SW5kZW50IG9mIDIgdGFicyBhbmQganN4SW5kZW50UHJvcHMgb2YgMicsIC0+XG4gICAgICAgIHJ1bGVzID1cbiAgICAgICAgICBcImluZGVudFwiOiBbMSwgNl1cbiAgICAgICAgICBcInJlYWN0L2pzeC1pbmRlbnRcIjogW1wid2FyblwiLCA0XVxuICAgICAgICAgIFwicmVhY3QvanN4LWluZGVudC1wcm9wc1wiOiBbMiwgNF1cbiAgICAgICAgcmVzdWx0ID0gYXV0b0luZGVudC50cmFuc2xhdGVJbmRlbnRPcHRpb25zKHJ1bGVzKVxuICAgICAgICBleHBlY3RlZFJlc3VsdCA9XG4gICAgICAgICAganN4SW5kZW50OiBbJ3dhcm4nLCAyXVxuICAgICAgICAgIGpzeEluZGVudFByb3BzOiBbMiwgMl1cbiAgICAgICAgICBqc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uOiBbIDEsIHsgc2VsZkNsb3Npbmc6ICd0YWctYWxpZ25lZCcsIG5vbkVtcHR5OiAndGFnLWFsaWduZWQnfSBdXG4gICAgICAgIGV4cGVjdChyZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpXG5cbiAgICAgIGl0ICdzaG91bGQgcmV0dXJuIGpzeEluZGVudCBvZiAyIHRhYnMgYW5kIGpzeEluZGVudFByb3BzIG9mIDIsIGxpbmUtYWxpZ25lZCcsIC0+XG4gICAgICAgIHJ1bGVzID1cbiAgICAgICAgICBcImluZGVudFwiOiBbMSwgNl1cbiAgICAgICAgICBcInJlYWN0L2pzeC1pbmRlbnRcIjogW1wid2FyblwiLCA0XVxuICAgICAgICAgIFwicmVhY3QvanN4LWluZGVudC1wcm9wc1wiOiBbMiwgNF1cbiAgICAgICAgICAncmVhY3QvanN4LWNsb3NpbmctYnJhY2tldC1sb2NhdGlvbic6IFsxLCAnbGluZS1hbGlnbmVkJ11cbiAgICAgICAgcmVzdWx0ID0gYXV0b0luZGVudC50cmFuc2xhdGVJbmRlbnRPcHRpb25zKHJ1bGVzKVxuICAgICAgICBleHBlY3RlZFJlc3VsdCA9XG4gICAgICAgICAganN4SW5kZW50OiBbJ3dhcm4nLCAyXVxuICAgICAgICAgIGpzeEluZGVudFByb3BzOiBbMiwgMl1cbiAgICAgICAgICBqc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uOiBbIDEsIHsgc2VsZkNsb3Npbmc6ICdsaW5lLWFsaWduZWQnLCBub25FbXB0eTogJ2xpbmUtYWxpZ25lZCd9IF1cbiAgICAgICAgZXhwZWN0KHJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdClcblxuICAgICAgaXQgJ3Nob3VsZCByZXR1cm4ganN4SW5kZW50IG9mIDIgdGFicyBhbmQganN4SW5kZW50UHJvcHMgb2YgMiwgbGluZS1hbGlnbmVkIGFuZCBwcm9wcy1hbGlnbmVkJywgLT5cbiAgICAgICAgcnVsZXMgPVxuICAgICAgICAgIFwiaW5kZW50XCI6IFsxLCA2XVxuICAgICAgICAgIFwicmVhY3QvanN4LWluZGVudFwiOiBbXCJ3YXJuXCIsIDRdXG4gICAgICAgICAgXCJyZWFjdC9qc3gtaW5kZW50LXByb3BzXCI6IFsyLCA0XVxuICAgICAgICAgIFwicmVhY3QvanN4LWNsb3NpbmctYnJhY2tldC1sb2NhdGlvblwiOiBbIDEsXG4gICAgICAgICAgICBcIm5vbkVtcHR5XCI6IFwicHJvcHMtYWxpZ25lZFwiLFxuICAgICAgICAgICAgXCJzZWxmQ2xvc2luZ1wiOiBcImxpbmUtYWxpZ25lZFwiXG4gICAgICAgICAgXVxuICAgICAgICByZXN1bHQgPSBhdXRvSW5kZW50LnRyYW5zbGF0ZUluZGVudE9wdGlvbnMocnVsZXMpXG4gICAgICAgIGV4cGVjdGVkUmVzdWx0ID1cbiAgICAgICAgICBqc3hJbmRlbnQ6IFsnd2FybicsIDJdXG4gICAgICAgICAganN4SW5kZW50UHJvcHM6IFsyLCAyXVxuICAgICAgICAgIGpzeENsb3NpbmdCcmFja2V0TG9jYXRpb246IFsgMSwgeyBzZWxmQ2xvc2luZzogJ2xpbmUtYWxpZ25lZCcsIG5vbkVtcHR5OiAncHJvcHMtYWxpZ25lZCd9IF1cbiAgICAgICAgZXhwZWN0KHJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdClcblxuICAgICM6IGluZGVudEpTWFxuICAgIGRlc2NyaWJlICc6OmluZGVudEpTWCcsIC0+XG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc291cmNlQ29kZSA9IFwiXCJcIlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtyb290Q2xhc3N9PlxuICAgICAgICAgIHt0aGlzLl9yZW5kZXJQbGFjZWhvbGRlcigpfVxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9e2N4KCdEcmFmdEVkaXRvci9lZGl0b3JDb250YWluZXInKX1cbiAgICAgICAgICBrZXk9eydlZGl0b3InICsgdGhpcy5zdGF0ZS5jb250YWluZXJLZXl9XG4gICAgICAgICAgcmVmPVwiZWRpdG9yQ29udGFpbmVyXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgPGRpdlxuICAgICAgICAgIGFyaWEtYWN0aXZlZGVzY2VuZGFudD17XG4gICAgICAgICAgcmVhZE9ubHkgPyBudWxsIDogdGhpcy5wcm9wcy5hcmlhQWN0aXZlRGVzY2VuZGFudElEXG4gICAgICAgICAgfVxuICAgICAgICAgIGFyaWEtYXV0b2NvbXBsZXRlPXtyZWFkT25seSA/IG51bGwgOiB0aGlzLnByb3BzLmFyaWFBdXRvQ29tcGxldGV9XG4gICAgICAgICAgPlxuICAgICAgICAgIHt0aGlzLl9yZW5kZXJQbGFjZWhvbGRlcigpfVxuICAgICAgICAgIDxDb21wb25lbnQgcDFcbiAgICAgICAgICBwMlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgeyAvLyB0ZXN0cyBpbmxpbmUgSlNYXG4gICAgICAgICAgdHJhaW5lclByb2ZpbGUuYmFja2dyb3VuZEltYWdlTGlua1xuICAgICAgICAgID8gPEltYWdlIHN0eWxlPXtzdHlsZXMudmlkZW99IHNvdXJjZT17e3VyaTogYCR7QXBwQ29uZmlnLmFwaVVSTH0ke3RyYWluZXJQcm9maWxlLmJhY2tncm91bmRJbWFnZUxpbmt9YH19IC8+XG4gICAgICAgICAgOiA8SW1hZ2Ugc3R5bGU9e3N0eWxlcy52aWRlb30gc291cmNlPXt7dXJpOiBgaHR0cHM6Ly9wbGFjZWhvbGQuaXQvMzc1eDE0MGB9fSAvPlxuICAgICAgICAgIH1cbiAgICAgICAgICB7XG4gICAgICAgICAgY29uZCA/XG4gICAgICAgICAgPHNwYW4vPjpcbiAgICAgICAgICA8c3Bhbj48L3NwYW4+XG4gICAgICAgICAgfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KHNvdXJjZUNvZGUpXG4gICAgICAgIHNvdXJjZUNvZGVSYW5nZSA9IG5ldyBSYW5nZShuZXcgUG9pbnQoMCwwKSwgbmV3IFBvaW50KDMxLDApKVxuICAgICAgICBpbmRlbnRKU1hSYW5nZSA9IG5ldyBSYW5nZShuZXcgUG9pbnQoMCwwKSwgbmV3IFBvaW50KDMwLDEpKVxuXG4gICAgICBpdCAnc2hvdWxkIGluZGVudCBKU1ggYWNjb3JkaW5nIHRvIGVzbGludCBydWxlcycsIC0+XG4gICAgICAgIGluZGVudGVkQ29kZSA9IFwiXCJcIlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtyb290Q2xhc3N9PlxuICAgICAgICAgICAge3RoaXMuX3JlbmRlclBsYWNlaG9sZGVyKCl9XG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17Y3goJ0RyYWZ0RWRpdG9yL2VkaXRvckNvbnRhaW5lcicpfVxuICAgICAgICAgICAgICBrZXk9eydlZGl0b3InICsgdGhpcy5zdGF0ZS5jb250YWluZXJLZXl9XG4gICAgICAgICAgICAgIHJlZj1cImVkaXRvckNvbnRhaW5lclwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBhcmlhLWFjdGl2ZWRlc2NlbmRhbnQ9e1xuICAgICAgICAgICAgICAgICAgcmVhZE9ubHkgPyBudWxsIDogdGhpcy5wcm9wcy5hcmlhQWN0aXZlRGVzY2VuZGFudElEXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFyaWEtYXV0b2NvbXBsZXRlPXtyZWFkT25seSA/IG51bGwgOiB0aGlzLnByb3BzLmFyaWFBdXRvQ29tcGxldGV9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7dGhpcy5fcmVuZGVyUGxhY2Vob2xkZXIoKX1cbiAgICAgICAgICAgICAgICA8Q29tcG9uZW50IHAxXG4gICAgICAgICAgICAgICAgICBwMlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICB7IC8vIHRlc3RzIGlubGluZSBKU1hcbiAgICAgICAgICAgICAgICB0cmFpbmVyUHJvZmlsZS5iYWNrZ3JvdW5kSW1hZ2VMaW5rXG4gICAgICAgICAgICAgICAgICA/IDxJbWFnZSBzdHlsZT17c3R5bGVzLnZpZGVvfSBzb3VyY2U9e3t1cmk6IGAke0FwcENvbmZpZy5hcGlVUkx9JHt0cmFpbmVyUHJvZmlsZS5iYWNrZ3JvdW5kSW1hZ2VMaW5rfWB9fSAvPlxuICAgICAgICAgICAgICAgICAgOiA8SW1hZ2Ugc3R5bGU9e3N0eWxlcy52aWRlb30gc291cmNlPXt7dXJpOiBgaHR0cHM6Ly9wbGFjZWhvbGQuaXQvMzc1eDE0MGB9fSAvPlxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25kID9cbiAgICAgICAgICAgICAgICAgIDxzcGFuLz46XG4gICAgICAgICAgICAgICAgICA8c3Bhbj48L3NwYW4+XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICMgcmVtZW1iZXIgdGhpcyBpcyB0YWJzIGJhc2VkIG9uIGF0b20gZGVmYXVsdFxuICAgICAgICBhdXRvSW5kZW50LmVzbGludEluZGVudE9wdGlvbnMgPVxuICAgICAgICAgIGpzeEluZGVudDogWzEsIDFdXG4gICAgICAgICAganN4SW5kZW50UHJvcHM6IFsxLCAxXVxuICAgICAgICAgIGpzeENsb3NpbmdCcmFja2V0TG9jYXRpb246IFsgMSxcbiAgICAgICAgICAgc2VsZkNsb3Npbmc6ICd0YWctYWxpZ25lZCdcbiAgICAgICAgICAgbm9uRW1wdHk6ICd0YWctYWxpZ25lZCcgXVxuICAgICAgICAgYXV0b0luZGVudC5hdXRvSnN4ID0gdHJ1ZVxuICAgICAgICAgYXV0b0luZGVudC5pbmRlbnRKU1goaW5kZW50SlNYUmFuZ2UpXG4gICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHNvdXJjZUNvZGVSYW5nZSkpLnRvRXF1YWwoaW5kZW50ZWRDb2RlKVxuXG4gICAgICBpdCAnc2hvdWxkIGluZGVudCBKU1ggYWNjb3JkaW5nIHRvIGVzbGludCBydWxlcyBhbmQgdGFnIGNsb3NpbmcgYWxpZ25tZW50JywgLT5cbiAgICAgICAgaW5kZW50ZWRDb2RlID0gXCJcIlwiXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Jvb3RDbGFzc30+XG4gICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJQbGFjZWhvbGRlcigpfVxuICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2N4KCdEcmFmdEVkaXRvci9lZGl0b3JDb250YWluZXInKX1cbiAgICAgICAgICAgICAgICAgIGtleT17J2VkaXRvcicgKyB0aGlzLnN0YXRlLmNvbnRhaW5lcktleX1cbiAgICAgICAgICAgICAgICAgIHJlZj1cImVkaXRvckNvbnRhaW5lclwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgYXJpYS1hY3RpdmVkZXNjZW5kYW50PXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZE9ubHkgPyBudWxsIDogdGhpcy5wcm9wcy5hcmlhQWN0aXZlRGVzY2VuZGFudElEXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIGFyaWEtYXV0b2NvbXBsZXRlPXtyZWFkT25seSA/IG51bGwgOiB0aGlzLnByb3BzLmFyaWFBdXRvQ29tcGxldGV9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJQbGFjZWhvbGRlcigpfVxuICAgICAgICAgICAgICAgICAgICAgIDxDb21wb25lbnQgcDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcDJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgeyAvLyB0ZXN0cyBpbmxpbmUgSlNYXG4gICAgICAgICAgICAgICAgICAgICAgdHJhaW5lclByb2ZpbGUuYmFja2dyb3VuZEltYWdlTGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgICA/IDxJbWFnZSBzdHlsZT17c3R5bGVzLnZpZGVvfSBzb3VyY2U9e3t1cmk6IGAke0FwcENvbmZpZy5hcGlVUkx9JHt0cmFpbmVyUHJvZmlsZS5iYWNrZ3JvdW5kSW1hZ2VMaW5rfWB9fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IDxJbWFnZSBzdHlsZT17c3R5bGVzLnZpZGVvfSBzb3VyY2U9e3t1cmk6IGBodHRwczovL3BsYWNlaG9sZC5pdC8zNzV4MTQwYH19IC8+XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uZCA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuLz46XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgIyByZW1lbWJlciB0aGlzIGlzIHRhYnMgYmFzZWQgb24gYXRvbSBkZWZhdWx0XG4gICAgICAgIGF1dG9JbmRlbnQuZXNsaW50SW5kZW50T3B0aW9ucyA9XG4gICAgICAgICAganN4SW5kZW50OiBbMSwgMl1cbiAgICAgICAgICBqc3hJbmRlbnRQcm9wczogWzEsIDJdXG4gICAgICAgICAganN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvbjogWyAxLFxuICAgICAgICAgICAgc2VsZkNsb3Npbmc6ICdwcm9wcy1hbGlnbmVkJ1xuICAgICAgICAgICAgbm9uRW1wdHk6ICdwcm9wcy1hbGlnbmVkJyBdXG4gICAgICAgICBhdXRvSW5kZW50LmF1dG9Kc3ggPSB0cnVlXG4gICAgICAgICBhdXRvSW5kZW50LmluZGVudEpTWChpbmRlbnRKU1hSYW5nZSlcbiAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2Uoc291cmNlQ29kZVJhbmdlKSkudG9FcXVhbChpbmRlbnRlZENvZGUpXG5cbiAgICAjIHRlc3QgaW5zZXJ0IG5ld2xpbmUgYmV0d2VlbiBvcGVuaW5nIGNsb3NpbmcgSlNYIHRhZ3NcbiAgICBkZXNjcmliZSAnaW5zZXJ0LW5sLWpzeCcsIC0+XG5cbiAgICAgIGl0ICdzaG91bGQgaW5zZXJ0IHR3byBuZXcgbGluZXMgYW5kIHBvc2l0aW9uIGN1cnNvciBiZXR3ZWVuIEpTWCB0YWdzJywgLT5cbiAgICAgICAgIyByZW1lbWJlciB0aGlzIGlzIHRhYnMgYmFzZWQgb24gYXRvbSBkZWZhdWx0XG4gICAgICAgIGF1dG9JbmRlbnQuZXNsaW50SW5kZW50T3B0aW9ucyA9XG4gICAgICAgICAganN4SW5kZW50OiBbMSwgMV1cbiAgICAgICAgICBqc3hJbmRlbnRQcm9wczogWzEsIDFdXG4gICAgICAgICAganN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvbjogWyAxLFxuICAgICAgICAgICAgc2VsZkNsb3Npbmc6ICd0YWJzLWFsaWduZWQnXG4gICAgICAgICAgICBub25FbXB0eTogJ3RhYnMtYWxpZ25lZCcgXVxuICAgICAgICBhdXRvSW5kZW50LmF1dG9Kc3ggPSB0cnVlXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCc8ZGl2PjwvZGl2PicpXG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCw1XSlcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ1xcbicpXG5cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbWzAsMF0sWzAsNV1dKSkudG9FcXVhbChcIjxkaXY+XCIpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW1sxLDBdLFsxLDJdXSkpLnRvRXF1YWwoXCIgIFwiKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbMiwwXSxbMiw2XV0pKS50b0VxdWFsKFwiPC9kaXY+XCIpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbChbMSwyXSlcbiJdfQ==
