(function() {
  module.exports = {
    name: "Bash",
    namespace: "bash",
    scope: ['source.sh', 'source.bash'],

    /*
    Supported Grammars
     */
    grammars: ["Shell Script"],
    defaultBeautifier: "beautysh",

    /*
    Supported extensions
     */
    extensions: ["bash", "sh"],
    options: {
      indent_size: {
        type: 'integer',
        "default": null,
        minimum: 0,
        description: "Indentation size/length"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbW93ZW5zLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9iYXNoLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBRWYsSUFBQSxFQUFNLE1BRlM7SUFHZixTQUFBLEVBQVcsTUFISTtJQUlmLEtBQUEsRUFBTyxDQUFDLFdBQUQsRUFBYyxhQUFkLENBSlE7O0FBTWY7OztJQUdBLFFBQUEsRUFBVSxDQUNSLGNBRFEsQ0FUSztJQWFmLGlCQUFBLEVBQW1CLFVBYko7O0FBZWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLE1BRFUsRUFFVixJQUZVLENBbEJHO0lBdUJmLE9BQUEsRUFDRTtNQUFBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsT0FBQSxFQUFTLENBRlQ7UUFHQSxXQUFBLEVBQWEseUJBSGI7T0FERjtLQXhCYTs7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiBcIkJhc2hcIlxuICBuYW1lc3BhY2U6IFwiYmFzaFwiXG4gIHNjb3BlOiBbJ3NvdXJjZS5zaCcsICdzb3VyY2UuYmFzaCddXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBHcmFtbWFyc1xuICAjIyNcbiAgZ3JhbW1hcnM6IFtcbiAgICBcIlNoZWxsIFNjcmlwdFwiXG4gIF1cblxuICBkZWZhdWx0QmVhdXRpZmllcjogXCJiZWF1dHlzaFwiXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXG4gICMjI1xuICBleHRlbnNpb25zOiBbXG4gICAgXCJiYXNoXCJcbiAgICBcInNoXCJcbiAgXVxuXG4gIG9wdGlvbnM6XG4gICAgaW5kZW50X3NpemU6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIHNpemUvbGVuZ3RoXCJcblxufVxuIl19
