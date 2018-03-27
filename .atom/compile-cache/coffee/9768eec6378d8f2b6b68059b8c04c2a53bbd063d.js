(function() {
  module.exports = {
    name: "SQL",
    namespace: "sql",
    scope: ['source.sql'],

    /*
    Supported Grammars
     */
    grammars: ["SQL (Rails)", "SQL"],

    /*
    Supported extensions
     */
    extensions: ["sql"],
    options: {
      indent_size: {
        type: 'integer',
        "default": null,
        minimum: 0,
        description: "Indentation size/length"
      },
      keywords: {
        type: 'string',
        "default": "upper",
        description: "Change case of keywords",
        "enum": ["unchanged", "lower", "upper", "capitalize"]
      },
      identifiers: {
        type: 'string',
        "default": "unchanged",
        description: "Change case of identifiers",
        "enum": ["unchanged", "lower", "upper", "capitalize"]
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9zcWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sS0FGUztJQUdmLFNBQUEsRUFBVyxLQUhJO0lBSWYsS0FBQSxFQUFPLENBQUMsWUFBRCxDQUpROztBQU1mOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixhQURRLEVBRVIsS0FGUSxDQVRLOztBQWNmOzs7SUFHQSxVQUFBLEVBQVksQ0FDVixLQURVLENBakJHO0lBcUJmLE9BQUEsRUFFRTtNQUFBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsT0FBQSxFQUFTLENBRlQ7UUFHQSxXQUFBLEVBQWEseUJBSGI7T0FERjtNQUtBLFFBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQURUO1FBRUEsV0FBQSxFQUFhLHlCQUZiO1FBR0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLFdBQUQsRUFBYSxPQUFiLEVBQXFCLE9BQXJCLEVBQTZCLFlBQTdCLENBSE47T0FORjtNQVVBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxXQURUO1FBRUEsV0FBQSxFQUFhLDRCQUZiO1FBR0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLFdBQUQsRUFBYSxPQUFiLEVBQXFCLE9BQXJCLEVBQTZCLFlBQTdCLENBSE47T0FYRjtLQXZCYTs7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiBcIlNRTFwiXG4gIG5hbWVzcGFjZTogXCJzcWxcIlxuICBzY29wZTogWydzb3VyY2Uuc3FsJ11cblxuICAjIyNcbiAgU3VwcG9ydGVkIEdyYW1tYXJzXG4gICMjI1xuICBncmFtbWFyczogW1xuICAgIFwiU1FMIChSYWlscylcIlxuICAgIFwiU1FMXCJcbiAgXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgZXh0ZW5zaW9uc1xuICAjIyNcbiAgZXh0ZW5zaW9uczogW1xuICAgIFwic3FsXCJcbiAgXVxuXG4gIG9wdGlvbnM6XG4gICAgIyBTUUxcbiAgICBpbmRlbnRfc2l6ZTpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgbWluaW11bTogMFxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gc2l6ZS9sZW5ndGhcIlxuICAgIGtleXdvcmRzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwidXBwZXJcIlxuICAgICAgZGVzY3JpcHRpb246IFwiQ2hhbmdlIGNhc2Ugb2Yga2V5d29yZHNcIlxuICAgICAgZW51bTogW1widW5jaGFuZ2VkXCIsXCJsb3dlclwiLFwidXBwZXJcIixcImNhcGl0YWxpemVcIl1cbiAgICBpZGVudGlmaWVyczpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcInVuY2hhbmdlZFwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJDaGFuZ2UgY2FzZSBvZiBpZGVudGlmaWVyc1wiXG4gICAgICBlbnVtOiBbXCJ1bmNoYW5nZWRcIixcImxvd2VyXCIsXCJ1cHBlclwiLFwiY2FwaXRhbGl6ZVwiXVxuXG59XG4iXX0=
