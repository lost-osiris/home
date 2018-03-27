(function() {
  module.exports = {
    name: "Markdown",
    namespace: "markdown",

    /*
    Supported Grammars
     */
    grammars: ["GitHub Markdown"],

    /*
    Supported extensions
     */
    extensions: ["markdown", "md"],
    defaultBeautifier: "Tidy Markdown",
    options: {
      gfm: {
        type: 'boolean',
        "default": true,
        description: 'GitHub Flavoured Markdown'
      },
      yaml: {
        type: 'boolean',
        "default": true,
        description: 'Enables raw YAML front matter to be detected (thus ignoring markdown-like syntax).'
      },
      commonmark: {
        type: 'boolean',
        "default": false,
        description: 'Allows and disallows several constructs.'
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9tYXJrZG93bi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUVmLElBQUEsRUFBTSxVQUZTO0lBR2YsU0FBQSxFQUFXLFVBSEk7O0FBS2Y7OztJQUdBLFFBQUEsRUFBVSxDQUNSLGlCQURRLENBUks7O0FBWWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLFVBRFUsRUFFVixJQUZVLENBZkc7SUFvQmYsaUJBQUEsRUFBbUIsZUFwQko7SUFzQmYsT0FBQSxFQUNFO01BQUEsR0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsMkJBRmI7T0FERjtNQUlBLElBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLG9GQUZiO09BTEY7TUFRQSxVQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSwwQ0FGYjtPQVRGO0tBdkJhOztBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6IFwiTWFya2Rvd25cIlxuICBuYW1lc3BhY2U6IFwibWFya2Rvd25cIlxuXG4gICMjI1xuICBTdXBwb3J0ZWQgR3JhbW1hcnNcbiAgIyMjXG4gIGdyYW1tYXJzOiBbXG4gICAgXCJHaXRIdWIgTWFya2Rvd25cIlxuICBdXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXG4gICMjI1xuICBleHRlbnNpb25zOiBbXG4gICAgXCJtYXJrZG93blwiXG4gICAgXCJtZFwiXG4gIF1cblxuICBkZWZhdWx0QmVhdXRpZmllcjogXCJUaWR5IE1hcmtkb3duXCJcblxuICBvcHRpb25zOlxuICAgIGdmbTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246ICdHaXRIdWIgRmxhdm91cmVkIE1hcmtkb3duJ1xuICAgIHlhbWw6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiAnRW5hYmxlcyByYXcgWUFNTCBmcm9udCBtYXR0ZXIgdG8gYmUgZGV0ZWN0ZWQgKHRodXMgaWdub3JpbmcgbWFya2Rvd24tbGlrZSBzeW50YXgpLidcbiAgICBjb21tb25tYXJrOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246ICdBbGxvd3MgYW5kIGRpc2FsbG93cyBzZXZlcmFsIGNvbnN0cnVjdHMuJ1xufVxuIl19
