(function() {
  'use strict';
  var Beautifier, HOST, MULTI_LINE_OUTPUT_TABLE, PORT, PythonBeautifier, format, net,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  net = require('net');

  Beautifier = require('./beautifier');

  HOST = '127.0.0.1';

  PORT = 36805;

  MULTI_LINE_OUTPUT_TABLE = {
    'Grid': 0,
    'Vertical': 1,
    'Hanging Indent': 2,
    'Vertical Hanging Indent': 3,
    'Hanging Grid': 4,
    'Hanging Grid Grouped': 5,
    'NOQA': 6
  };

  format = function(data, formaters) {
    return new Promise(function(resolve, reject) {
      var client;
      client = new net.Socket();
      client.on('error', function(error) {
        client.destroy();
        return reject(error);
      });
      return client.connect(PORT, HOST, function() {
        var response;
        client.setEncoding('utf8');
        client.write(JSON.stringify({
          'data': data,
          'formaters': formaters
        }));
        response = '';
        client.on('data', function(chunk) {
          return response += chunk;
        });
        return client.on('end', function() {
          response = JSON.parse(response);
          if (response.error != null) {
            reject(Error(response.error));
          } else {
            resolve(response.data);
          }
          return client.destroy();
        });
      });
    });
  };

  module.exports = PythonBeautifier = (function(superClass) {
    extend(PythonBeautifier, superClass);

    function PythonBeautifier() {
      return PythonBeautifier.__super__.constructor.apply(this, arguments);
    }

    PythonBeautifier.prototype.name = "pybeautifier";

    PythonBeautifier.prototype.link = "https://github.com/guyskk/pybeautifier";

    PythonBeautifier.prototype.isPreInstalled = false;

    PythonBeautifier.prototype.options = {
      Python: true
    };

    PythonBeautifier.prototype.beautify = function(text, language, options) {
      var formater, formaters, multi_line_output;
      formater = {
        'name': options.formater
      };
      if (options.formater === 'autopep8') {
        formater.config = {
          'ignore': options.ignore,
          'max_line_length': options.max_line_length
        };
      } else if (options.formater === 'yapf') {
        formater.config = {
          'style_config': options.style_config
        };
      }
      formaters = [formater];
      if (options.sort_imports) {
        multi_line_output = MULTI_LINE_OUTPUT_TABLE[options.multi_line_output];
        formaters.push({
          'name': 'isort',
          'config': {
            'multi_line_output': multi_line_output
          }
        });
      }
      return new this.Promise(function(resolve, reject) {
        return format(text, formaters).then(function(data) {
          return resolve(data);
        })["catch"](function(error) {
          return reject(error);
        });
      });
    };

    return PythonBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3B5YmVhdXRpZmllci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEsOEVBQUE7SUFBQTs7O0VBQ0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSOztFQUNOLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixJQUFBLEdBQU87O0VBQ1AsSUFBQSxHQUFPOztFQUNQLHVCQUFBLEdBQTBCO0lBQ3hCLE1BQUEsRUFBUSxDQURnQjtJQUV4QixVQUFBLEVBQVksQ0FGWTtJQUd4QixnQkFBQSxFQUFrQixDQUhNO0lBSXhCLHlCQUFBLEVBQTJCLENBSkg7SUFLeEIsY0FBQSxFQUFnQixDQUxRO0lBTXhCLHNCQUFBLEVBQXdCLENBTkE7SUFPeEIsTUFBQSxFQUFRLENBUGdCOzs7RUFVMUIsTUFBQSxHQUFTLFNBQUMsSUFBRCxFQUFPLFNBQVA7QUFDUCxXQUFXLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDakIsVUFBQTtNQUFBLE1BQUEsR0FBYSxJQUFBLEdBQUcsQ0FBQyxNQUFKLENBQUE7TUFDYixNQUFNLENBQUMsRUFBUCxDQUFVLE9BQVYsRUFBbUIsU0FBQyxLQUFEO1FBQ2pCLE1BQU0sQ0FBQyxPQUFQLENBQUE7ZUFDQSxNQUFBLENBQU8sS0FBUDtNQUZpQixDQUFuQjthQUdBLE1BQU0sQ0FBQyxPQUFQLENBQWUsSUFBZixFQUFxQixJQUFyQixFQUEyQixTQUFBO0FBQ3pCLFlBQUE7UUFBQSxNQUFNLENBQUMsV0FBUCxDQUFtQixNQUFuQjtRQUNBLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBSSxDQUFDLFNBQUwsQ0FBZTtVQUFDLE1BQUEsRUFBUSxJQUFUO1VBQWUsV0FBQSxFQUFhLFNBQTVCO1NBQWYsQ0FBYjtRQUNBLFFBQUEsR0FBVztRQUNYLE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixTQUFDLEtBQUQ7aUJBQ2hCLFFBQUEsSUFBWTtRQURJLENBQWxCO2VBRUEsTUFBTSxDQUFDLEVBQVAsQ0FBVSxLQUFWLEVBQWlCLFNBQUE7VUFDZixRQUFBLEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFYO1VBQ1gsSUFBRyxzQkFBSDtZQUNFLE1BQUEsQ0FBTyxLQUFBLENBQU0sUUFBUSxDQUFDLEtBQWYsQ0FBUCxFQURGO1dBQUEsTUFBQTtZQUdFLE9BQUEsQ0FBUSxRQUFRLENBQUMsSUFBakIsRUFIRjs7aUJBSUEsTUFBTSxDQUFDLE9BQVAsQ0FBQTtRQU5lLENBQWpCO01BTnlCLENBQTNCO0lBTGlCLENBQVI7RUFESjs7RUFvQlQsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7K0JBRXJCLElBQUEsR0FBTTs7K0JBQ04sSUFBQSxHQUFNOzsrQkFDTixjQUFBLEdBQWdCOzsrQkFFaEIsT0FBQSxHQUFTO01BQ1AsTUFBQSxFQUFRLElBREQ7OzsrQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7TUFBQSxRQUFBLEdBQVc7UUFBQyxNQUFBLEVBQVEsT0FBTyxDQUFDLFFBQWpCOztNQUNYLElBQUcsT0FBTyxDQUFDLFFBQVIsS0FBb0IsVUFBdkI7UUFDRSxRQUFRLENBQUMsTUFBVCxHQUFrQjtVQUNoQixRQUFBLEVBQVUsT0FBTyxDQUFDLE1BREY7VUFFaEIsaUJBQUEsRUFBbUIsT0FBTyxDQUFDLGVBRlg7VUFEcEI7T0FBQSxNQUtLLElBQUcsT0FBTyxDQUFDLFFBQVIsS0FBb0IsTUFBdkI7UUFDSCxRQUFRLENBQUMsTUFBVCxHQUFrQjtVQUFDLGNBQUEsRUFBZ0IsT0FBTyxDQUFDLFlBQXpCO1VBRGY7O01BRUwsU0FBQSxHQUFZLENBQUMsUUFBRDtNQUNaLElBQUcsT0FBTyxDQUFDLFlBQVg7UUFDRSxpQkFBQSxHQUFvQix1QkFBd0IsQ0FBQSxPQUFPLENBQUMsaUJBQVI7UUFDNUMsU0FBUyxDQUFDLElBQVYsQ0FDRTtVQUFBLE1BQUEsRUFBUSxPQUFSO1VBQ0EsUUFBQSxFQUFVO1lBQUMsbUJBQUEsRUFBcUIsaUJBQXRCO1dBRFY7U0FERixFQUZGOztBQUtBLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVY7ZUFDbEIsTUFBQSxDQUFPLElBQVAsRUFBYSxTQUFiLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO2lCQUNKLE9BQUEsQ0FBUSxJQUFSO1FBREksQ0FETixDQUdBLEVBQUMsS0FBRCxFQUhBLENBR08sU0FBQyxLQUFEO2lCQUNMLE1BQUEsQ0FBTyxLQUFQO1FBREssQ0FIUDtNQURrQixDQUFUO0lBZkg7Ozs7S0FWb0M7QUFwQ2hEIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnXG5uZXQgPSByZXF1aXJlKCduZXQnKVxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbkhPU1QgPSAnMTI3LjAuMC4xJ1xuUE9SVCA9IDM2ODA1XG5NVUxUSV9MSU5FX09VVFBVVF9UQUJMRSA9IHtcbiAgJ0dyaWQnOiAwLFxuICAnVmVydGljYWwnOiAxLFxuICAnSGFuZ2luZyBJbmRlbnQnOiAyLFxuICAnVmVydGljYWwgSGFuZ2luZyBJbmRlbnQnOiAzLFxuICAnSGFuZ2luZyBHcmlkJzogNCxcbiAgJ0hhbmdpbmcgR3JpZCBHcm91cGVkJzogNSxcbiAgJ05PUUEnOiA2XG59XG5cbmZvcm1hdCA9IChkYXRhLCBmb3JtYXRlcnMpIC0+XG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIGNsaWVudCA9IG5ldyBuZXQuU29ja2V0KClcbiAgICBjbGllbnQub24gJ2Vycm9yJywgKGVycm9yKSAtPlxuICAgICAgY2xpZW50LmRlc3Ryb3koKVxuICAgICAgcmVqZWN0KGVycm9yKVxuICAgIGNsaWVudC5jb25uZWN0IFBPUlQsIEhPU1QsIC0+XG4gICAgICBjbGllbnQuc2V0RW5jb2RpbmcoJ3V0ZjgnKVxuICAgICAgY2xpZW50LndyaXRlKEpTT04uc3RyaW5naWZ5KHsnZGF0YSc6IGRhdGEsICdmb3JtYXRlcnMnOiBmb3JtYXRlcnN9KSlcbiAgICAgIHJlc3BvbnNlID0gJydcbiAgICAgIGNsaWVudC5vbiAnZGF0YScsIChjaHVuaykgLT5cbiAgICAgICAgcmVzcG9uc2UgKz0gY2h1bmtcbiAgICAgIGNsaWVudC5vbiAnZW5kJywgLT5cbiAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlKVxuICAgICAgICBpZiByZXNwb25zZS5lcnJvcj9cbiAgICAgICAgICByZWplY3QoRXJyb3IocmVzcG9uc2UuZXJyb3IpKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmVzb2x2ZShyZXNwb25zZS5kYXRhKVxuICAgICAgICBjbGllbnQuZGVzdHJveSgpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUHl0aG9uQmVhdXRpZmllciBleHRlbmRzIEJlYXV0aWZpZXJcblxuICBuYW1lOiBcInB5YmVhdXRpZmllclwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2d1eXNray9weWJlYXV0aWZpZXJcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgUHl0aG9uOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIGZvcm1hdGVyID0geyduYW1lJzogb3B0aW9ucy5mb3JtYXRlcn1cbiAgICBpZiBvcHRpb25zLmZvcm1hdGVyID09ICdhdXRvcGVwOCdcbiAgICAgIGZvcm1hdGVyLmNvbmZpZyA9IHtcbiAgICAgICAgJ2lnbm9yZSc6IG9wdGlvbnMuaWdub3JlXG4gICAgICAgICdtYXhfbGluZV9sZW5ndGgnOiBvcHRpb25zLm1heF9saW5lX2xlbmd0aFxuICAgICAgfVxuICAgIGVsc2UgaWYgb3B0aW9ucy5mb3JtYXRlciA9PSAneWFwZidcbiAgICAgIGZvcm1hdGVyLmNvbmZpZyA9IHsnc3R5bGVfY29uZmlnJzogb3B0aW9ucy5zdHlsZV9jb25maWd9XG4gICAgZm9ybWF0ZXJzID0gW2Zvcm1hdGVyXVxuICAgIGlmIG9wdGlvbnMuc29ydF9pbXBvcnRzXG4gICAgICBtdWx0aV9saW5lX291dHB1dCA9IE1VTFRJX0xJTkVfT1VUUFVUX1RBQkxFW29wdGlvbnMubXVsdGlfbGluZV9vdXRwdXRdXG4gICAgICBmb3JtYXRlcnMucHVzaFxuICAgICAgICAnbmFtZSc6ICdpc29ydCdcbiAgICAgICAgJ2NvbmZpZyc6IHsnbXVsdGlfbGluZV9vdXRwdXQnOiBtdWx0aV9saW5lX291dHB1dH1cbiAgICByZXR1cm4gbmV3IEBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICBmb3JtYXQodGV4dCwgZm9ybWF0ZXJzKVxuICAgICAgLnRoZW4gKGRhdGEpIC0+XG4gICAgICAgIHJlc29sdmUoZGF0YSlcbiAgICAgIC5jYXRjaCAoZXJyb3IpIC0+XG4gICAgICAgIHJlamVjdChlcnJvcilcbiJdfQ==
