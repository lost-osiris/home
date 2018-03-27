(function() {
  var SASSLINT_DOC_URL, VALID_SYNTAXES, path, ref;

  path = require('path');

  ref = require('./constants.coffee'), SASSLINT_DOC_URL = ref.SASSLINT_DOC_URL, VALID_SYNTAXES = ref.VALID_SYNTAXES;

  module.exports = {

    /**
     * Function to construct the rule URI from the rule ID provided
     * @param {string} ruleId - The rule name / id
     * @return {string} The rule URL
     */
    getRuleURI: function(ruleId) {
      return SASSLINT_DOC_URL + '/' + ruleId + '.md';
    },

    /**
     * Function to check a file base / extension for valid extensions to use with sass-lint
     * @param {string} syntax - The syntax to check
     * @return {boolean} Whether or not the syntax is valid for sass-lint
     */
    isValidSyntax: function(syntax) {
      return VALID_SYNTAXES.indexOf(syntax) !== -1;
    },

    /**
     * Function to check a file base / extension for valid extensions to use with sass-lint
     * @param {string} filePath - The filepath to check
     * @return {string} The syntax we wish to pass to sass-lint
     */
    getFileSyntax: function(filePath) {
      var base, existingSyntax, item, syntax;
      existingSyntax = path.extname(filePath).slice(1);
      if (this.isValidSyntax(existingSyntax) === false) {
        base = path.parse(filePath).base.split('.');
        syntax = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = base.length; i < len; i++) {
            item = base[i];
            if (this.isValidSyntax(item)) {
              results.push(item);
            }
          }
          return results;
        }).call(this);
        if (syntax.length) {
          return syntax[0];
        }
      }
      return existingSyntax;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zYXNzLWxpbnQvbGliL2hlbHBlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsTUFBcUMsT0FBQSxDQUFRLG9CQUFSLENBQXJDLEVBQUMsdUNBQUQsRUFBbUI7O0VBRW5CLE1BQU0sQ0FBQyxPQUFQLEdBRUU7O0FBQUE7Ozs7O0lBS0EsVUFBQSxFQUFZLFNBQUMsTUFBRDtBQUNWLGFBQU8sZ0JBQUEsR0FBbUIsR0FBbkIsR0FBeUIsTUFBekIsR0FBa0M7SUFEL0IsQ0FMWjs7QUFRQTs7Ozs7SUFLQSxhQUFBLEVBQWUsU0FBQyxNQUFEO0FBQ2IsYUFBTyxjQUFjLENBQUMsT0FBZixDQUF1QixNQUF2QixDQUFBLEtBQW9DLENBQUM7SUFEL0IsQ0FiZjs7QUFnQkE7Ozs7O0lBS0EsYUFBQSxFQUFlLFNBQUMsUUFBRDtBQUNiLFVBQUE7TUFBQSxjQUFBLEdBQWlCLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixDQUFzQixDQUFDLEtBQXZCLENBQTZCLENBQTdCO01BQ2pCLElBQUcsSUFBQyxDQUFBLGFBQUQsQ0FBZSxjQUFmLENBQUEsS0FBa0MsS0FBckM7UUFDRSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFYLENBQW9CLENBQUMsSUFBSSxDQUFDLEtBQTFCLENBQWdDLEdBQWhDO1FBQ1AsTUFBQTs7QUFBVTtlQUFBLHNDQUFBOztnQkFBMkIsSUFBQyxDQUFBLGFBQUQsQ0FBZSxJQUFmOzJCQUEzQjs7QUFBQTs7O1FBQ1YsSUFBRyxNQUFNLENBQUMsTUFBVjtBQUNFLGlCQUFPLE1BQU8sQ0FBQSxDQUFBLEVBRGhCO1NBSEY7O0FBTUEsYUFBTztJQVJNLENBckJmOztBQUxGIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG57U0FTU0xJTlRfRE9DX1VSTCwgVkFMSURfU1lOVEFYRVN9ID0gcmVxdWlyZSAnLi9jb25zdGFudHMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgIyMjKlxuICAgKiBGdW5jdGlvbiB0byBjb25zdHJ1Y3QgdGhlIHJ1bGUgVVJJIGZyb20gdGhlIHJ1bGUgSUQgcHJvdmlkZWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJ1bGVJZCAtIFRoZSBydWxlIG5hbWUgLyBpZFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBydWxlIFVSTFxuICAgIyMjXG4gIGdldFJ1bGVVUkk6IChydWxlSWQpIC0+XG4gICAgcmV0dXJuIFNBU1NMSU5UX0RPQ19VUkwgKyAnLycgKyBydWxlSWQgKyAnLm1kJ1xuXG4gICMjIypcbiAgICogRnVuY3Rpb24gdG8gY2hlY2sgYSBmaWxlIGJhc2UgLyBleHRlbnNpb24gZm9yIHZhbGlkIGV4dGVuc2lvbnMgdG8gdXNlIHdpdGggc2Fzcy1saW50XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzeW50YXggLSBUaGUgc3ludGF4IHRvIGNoZWNrXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBzeW50YXggaXMgdmFsaWQgZm9yIHNhc3MtbGludFxuICAgIyMjXG4gIGlzVmFsaWRTeW50YXg6IChzeW50YXgpIC0+XG4gICAgcmV0dXJuIFZBTElEX1NZTlRBWEVTLmluZGV4T2Yoc3ludGF4KSBpc250IC0xXG5cbiAgIyMjKlxuICAgKiBGdW5jdGlvbiB0byBjaGVjayBhIGZpbGUgYmFzZSAvIGV4dGVuc2lvbiBmb3IgdmFsaWQgZXh0ZW5zaW9ucyB0byB1c2Ugd2l0aCBzYXNzLWxpbnRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVQYXRoIC0gVGhlIGZpbGVwYXRoIHRvIGNoZWNrXG4gICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHN5bnRheCB3ZSB3aXNoIHRvIHBhc3MgdG8gc2Fzcy1saW50XG4gICAjIyNcbiAgZ2V0RmlsZVN5bnRheDogKGZpbGVQYXRoKSAtPlxuICAgIGV4aXN0aW5nU3ludGF4ID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKS5zbGljZSgxKVxuICAgIGlmIEBpc1ZhbGlkU3ludGF4KGV4aXN0aW5nU3ludGF4KSBpcyBmYWxzZVxuICAgICAgYmFzZSA9IHBhdGgucGFyc2UoZmlsZVBhdGgpLmJhc2Uuc3BsaXQoJy4nKVxuICAgICAgc3ludGF4ID0gKGl0ZW0gZm9yIGl0ZW0gaW4gYmFzZSB3aGVuIEBpc1ZhbGlkU3ludGF4KGl0ZW0pKVxuICAgICAgaWYgc3ludGF4Lmxlbmd0aFxuICAgICAgICByZXR1cm4gc3ludGF4WzBdXG5cbiAgICByZXR1cm4gZXhpc3RpbmdTeW50YXhcbiJdfQ==
