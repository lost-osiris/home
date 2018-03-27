(function() {
  module.exports = {
    general: {
      title: 'General',
      type: 'object',
      collapsed: true,
      order: -1,
      description: 'General options for Atom Beautify',
      properties: {
        analytics: {
          title: 'Anonymous Analytics',
          type: 'boolean',
          "default": true,
          description: "[Google Analytics](http://www.google.com/analytics/) is used to track what languages are being used the most and causing the most errors, as well as other stats such as performance. Everything is anonymized and no personal information, such as source code, is sent. See https://github.com/Glavin001/atom-beautify/issues/47 for more details."
        },
        _analyticsUserId: {
          title: 'Analytics User Id',
          type: 'string',
          "default": "",
          description: "Unique identifier for this user for tracking usage analytics"
        },
        loggerLevel: {
          title: "Logger Level",
          type: 'string',
          "default": 'warn',
          description: 'Set the level for the logger',
          "enum": ['verbose', 'debug', 'info', 'warn', 'error']
        },
        beautifyEntireFileOnSave: {
          title: "Beautify Entire File On Save",
          type: 'boolean',
          "default": true,
          description: "When beautifying on save, use the entire file, even if there is selected text in the editor. Important: The `beautify on save` option for the specific language must be enabled for this to be applicable. This option is not `beautify on save`."
        },
        muteUnsupportedLanguageErrors: {
          title: "Mute Unsupported Language Errors",
          type: 'boolean',
          "default": false,
          description: "Do not show \"Unsupported Language\" errors when they occur"
        },
        muteAllErrors: {
          title: "Mute All Errors",
          type: 'boolean',
          "default": false,
          description: "Do not show any/all errors when they occur"
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2NvbmZpZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUNmLE9BQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxTQUFQO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxTQUFBLEVBQVcsSUFGWDtNQUdBLEtBQUEsRUFBTyxDQUFDLENBSFI7TUFJQSxXQUFBLEVBQWEsbUNBSmI7TUFLQSxVQUFBLEVBQ0U7UUFBQSxTQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8scUJBQVA7VUFDQSxJQUFBLEVBQU8sU0FEUDtVQUVBLENBQUEsT0FBQSxDQUFBLEVBQVUsSUFGVjtVQUdBLFdBQUEsRUFBYyxzVkFIZDtTQURGO1FBVUEsZ0JBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxtQkFBUDtVQUNBLElBQUEsRUFBTyxRQURQO1VBRUEsQ0FBQSxPQUFBLENBQUEsRUFBVSxFQUZWO1VBR0EsV0FBQSxFQUFjLDhEQUhkO1NBWEY7UUFlQSxXQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sY0FBUDtVQUNBLElBQUEsRUFBTyxRQURQO1VBRUEsQ0FBQSxPQUFBLENBQUEsRUFBVSxNQUZWO1VBR0EsV0FBQSxFQUFjLDhCQUhkO1VBSUEsQ0FBQSxJQUFBLENBQUEsRUFBTyxDQUFDLFNBQUQsRUFBWSxPQUFaLEVBQXFCLE1BQXJCLEVBQTZCLE1BQTdCLEVBQXFDLE9BQXJDLENBSlA7U0FoQkY7UUFxQkEsd0JBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyw4QkFBUDtVQUNBLElBQUEsRUFBTyxTQURQO1VBRUEsQ0FBQSxPQUFBLENBQUEsRUFBVSxJQUZWO1VBR0EsV0FBQSxFQUFjLG1QQUhkO1NBdEJGO1FBMEJBLDZCQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sa0NBQVA7VUFDQSxJQUFBLEVBQU8sU0FEUDtVQUVBLENBQUEsT0FBQSxDQUFBLEVBQVUsS0FGVjtVQUdBLFdBQUEsRUFBYyw2REFIZDtTQTNCRjtRQStCQSxhQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8saUJBQVA7VUFDQSxJQUFBLEVBQU8sU0FEUDtVQUVBLENBQUEsT0FBQSxDQUFBLEVBQVUsS0FGVjtVQUdBLFdBQUEsRUFBYyw0Q0FIZDtTQWhDRjtPQU5GO0tBRmE7O0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdlbmVyYWw6XG4gICAgdGl0bGU6ICdHZW5lcmFsJ1xuICAgIHR5cGU6ICdvYmplY3QnXG4gICAgY29sbGFwc2VkOiB0cnVlXG4gICAgb3JkZXI6IC0xXG4gICAgZGVzY3JpcHRpb246ICdHZW5lcmFsIG9wdGlvbnMgZm9yIEF0b20gQmVhdXRpZnknXG4gICAgcHJvcGVydGllczpcbiAgICAgIGFuYWx5dGljcyA6XG4gICAgICAgIHRpdGxlOiAnQW5vbnltb3VzIEFuYWx5dGljcydcbiAgICAgICAgdHlwZSA6ICdib29sZWFuJ1xuICAgICAgICBkZWZhdWx0IDogdHJ1ZVxuICAgICAgICBkZXNjcmlwdGlvbiA6IFwiW0dvb2dsZVxuICAgICAgICAgICAgICAgIEFuYWx5dGljc10oaHR0cDovL3d3dy5nb29nbGUuY29tL2FuYWx5dGljcy8pIGlzIHVzZWQgdG8gdHJhY2sgd2hhdCBsYW5ndWFnZXMgYXJlIGJlaW5nXG4gICAgICAgICAgICAgICAgdXNlZCB0aGUgbW9zdCBhbmQgY2F1c2luZyB0aGUgbW9zdCBlcnJvcnMsIGFzIHdlbGwgYXMgb3RoZXIgc3RhdHMgc3VjaCBhcyBwZXJmb3JtYW5jZS5cbiAgICAgICAgICAgICAgICBFdmVyeXRoaW5nIGlzIGFub255bWl6ZWQgYW5kIG5vIHBlcnNvbmFsXG4gICAgICAgICAgICAgICAgaW5mb3JtYXRpb24sIHN1Y2ggYXMgc291cmNlIGNvZGUsIGlzIHNlbnQuXG4gICAgICAgICAgICAgICAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9HbGF2aW4wMDEvYXRvbS1iZWF1dGlmeS9pc3N1ZXMvNDcgZm9yIG1vcmUgZGV0YWlscy5cIlxuICAgICAgX2FuYWx5dGljc1VzZXJJZCA6XG4gICAgICAgIHRpdGxlOiAnQW5hbHl0aWNzIFVzZXIgSWQnXG4gICAgICAgIHR5cGUgOiAnc3RyaW5nJ1xuICAgICAgICBkZWZhdWx0IDogXCJcIlxuICAgICAgICBkZXNjcmlwdGlvbiA6IFwiVW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoaXMgdXNlciBmb3IgdHJhY2tpbmcgdXNhZ2UgYW5hbHl0aWNzXCJcbiAgICAgIGxvZ2dlckxldmVsIDpcbiAgICAgICAgdGl0bGU6IFwiTG9nZ2VyIExldmVsXCJcbiAgICAgICAgdHlwZSA6ICdzdHJpbmcnXG4gICAgICAgIGRlZmF1bHQgOiAnd2FybidcbiAgICAgICAgZGVzY3JpcHRpb24gOiAnU2V0IHRoZSBsZXZlbCBmb3IgdGhlIGxvZ2dlcidcbiAgICAgICAgZW51bSA6IFsndmVyYm9zZScsICdkZWJ1ZycsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXVxuICAgICAgYmVhdXRpZnlFbnRpcmVGaWxlT25TYXZlIDpcbiAgICAgICAgdGl0bGU6IFwiQmVhdXRpZnkgRW50aXJlIEZpbGUgT24gU2F2ZVwiXG4gICAgICAgIHR5cGUgOiAnYm9vbGVhbidcbiAgICAgICAgZGVmYXVsdCA6IHRydWVcbiAgICAgICAgZGVzY3JpcHRpb24gOiBcIldoZW4gYmVhdXRpZnlpbmcgb24gc2F2ZSwgdXNlIHRoZSBlbnRpcmUgZmlsZSwgZXZlbiBpZiB0aGVyZSBpcyBzZWxlY3RlZCB0ZXh0IGluIHRoZSBlZGl0b3IuIEltcG9ydGFudDogVGhlIGBiZWF1dGlmeSBvbiBzYXZlYCBvcHRpb24gZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBtdXN0IGJlIGVuYWJsZWQgZm9yIHRoaXMgdG8gYmUgYXBwbGljYWJsZS4gVGhpcyBvcHRpb24gaXMgbm90IGBiZWF1dGlmeSBvbiBzYXZlYC5cIlxuICAgICAgbXV0ZVVuc3VwcG9ydGVkTGFuZ3VhZ2VFcnJvcnMgOlxuICAgICAgICB0aXRsZTogXCJNdXRlIFVuc3VwcG9ydGVkIExhbmd1YWdlIEVycm9yc1wiXG4gICAgICAgIHR5cGUgOiAnYm9vbGVhbidcbiAgICAgICAgZGVmYXVsdCA6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uIDogXCJEbyBub3Qgc2hvdyBcXFwiVW5zdXBwb3J0ZWQgTGFuZ3VhZ2VcXFwiIGVycm9ycyB3aGVuIHRoZXkgb2NjdXJcIlxuICAgICAgbXV0ZUFsbEVycm9ycyA6XG4gICAgICAgIHRpdGxlOiBcIk11dGUgQWxsIEVycm9yc1wiXG4gICAgICAgIHR5cGUgOiAnYm9vbGVhbidcbiAgICAgICAgZGVmYXVsdCA6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uIDogXCJEbyBub3Qgc2hvdyBhbnkvYWxsIGVycm9ycyB3aGVuIHRoZXkgb2NjdXJcIlxuICAgIH1cbiJdfQ==
