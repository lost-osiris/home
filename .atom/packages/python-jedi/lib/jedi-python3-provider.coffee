{BufferedProcess} = require 'atom'
command = atom.config.get('python-jedi.Pathtopython')
jedipy_filename = '/python3_jedi.py'

resetJedi= (newValue) ->
  try
    atom.packages.disablePackage('python-jedi')
  catch error
    console.log error

  atom.packages.enablePackage('python-jedi')
  command = atom.config.get('python-jedi.Pathtopython')

module.exports =
class JediProvider
  id: 'python-jedi'
  selector: '.source.python'
  providerblacklist: null
  opts = {stdio: ['pipe', null, null]}

  constructor: ->
    @providerblacklist =
      'autocomplete-plus-fuzzyprovider': '.source.python'
      'autocomplete-plus-symbolprovider': '.source.python'

  goto_def:(source, row, column, path)->

    payload =
      source: source
      line: row
      column: column
      path: path
      type: "goto"
    data = JSON.stringify(payload)
    args = [__dirname + jedipy_filename]

    stdout = (data) ->
      goto_info_objects = JSON.parse(data)
      for key,value of goto_info_objects
        if value['module_path'] != null && value['line'] != null
          atom.workspace.open(value['module_path'],({'initialLine':(value['line']-1),'searchAllPanes':true}))
        else if value['is_built_in'] && value['type'] = ("module" || "class" || "function")
          atom.notifications.addInfo("Built In "+value['type'],
          ({dismissable: true,'detail':"Description: "+value['description']+
          ".\nThis is a builtin "+value['type']+". Doesn't have module path"}))
    stderr = (error) ->
      console.log error
    exit = (code) ->
      goto_def_process.kill()
    callback = (errorObject) ->
      console.log errorObject.error
    goto_def_process = new BufferedProcess({command, args, opts, stdout , stderr, exit})
    goto_def_process.process.stdin.write(data);
    goto_def_process.process.stdin.end();
    goto_def_process.onWillThrowError(callback)

  requestHandler: (options) ->
    return new Promise (resolve) ->

      suggestions = []
      if atom.packages.isPackageDisabled('python-jedi')
        resolve(suggestions)

      bufferPosition = options.cursor.getBufferPosition()

      text = options.editor.getText()
      row = options.cursor.getBufferPosition().row
      column = options.cursor.getBufferPosition().column
      path = options.editor.getPath()

      resolve(suggestions) unless column isnt 0

      payload =
        source: text
        line: row
        column: column
        path: path
        type:'autocomplete'

      prefixRegex_others = /[\s()\[\]{}=\-@!$%\^&\?'"\/|\\`~;:<>,*+]/g
      prefixRegex = /\b((\w+))$/g

      if options.prefix.match(prefixRegex)
        prefix = options.prefix.match(prefixRegex)[0]

      line = options.editor.getTextInRange([[bufferPosition.row, 0], bufferPosition])
      hash = line.search(/(\#)/g)
      prefixcheck = not prefixRegex_others.test(options.cursor.getCurrentWordPrefix())

      if hash < 0 && prefixcheck

        data = JSON.stringify(payload)
        args = [__dirname + jedipy_filename]

        stdout = (data) ->
          list_of_objects = JSON.parse(data)
          if list_of_objects.length isnt 0
            for key, value of list_of_objects
              label = value.description
              type = value.type
              name = value.name

              if label.length > 80
                label = label.substr(0, 80)
              suggestions.push
                text: name
                replacementPrefix: prefix
                label: label
                type: type

            resolve(suggestions)
          else
            resolve(suggestions)

        stderr = (error) ->
          console.log error
        exit = (code)->
          completion_process.kill()
        callback = (errorObject) ->
          console.log errorObject.error

        completion_process = new BufferedProcess({command, args, opts, stdout, stderr, exit})
        completion_process.process.stdin.write(data);
        completion_process.process.stdin.end();
        completion_process.onWillThrowError(callback)
      else
        resolve(suggestions)

  error: (data) ->
    console.log data

#observe settings
atom.config.observe 'python-jedi.Pathtopython', (newValue) ->
  atom.config.set('python-jedi.Pathtopython', newValue)
  resetJedi(newValue)
