{CompositeDisposable} = require 'atom'

JediProvider = require './jedi-python3-provider'

module.exports =

  subscriptions: null
  # python-jedi config schema
  config:
    Pathtopython:
      description:'Python virtual environment path (eg:/home/user/py3pyenv/bin/python3 or home/user/py2virtualenv/bin/python)'
      type: 'string'
      default: 'python3'

  provider: null

  activate: ->
    isPathtopython = atom.config.get('python-jedi.enablePathtopython')
    @provider = new JediProvider()
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.commands.add 'atom-workspace',
      'jedi-python3-autocomplete:goto_definitions': => @goto_definitions()

  deactivate: ->
     @subscriptions.dispose()

  getProvider: ->
    return {providers: [@provider]}

  goto_definitions: ->
     if editor = atom.workspace.getActiveTextEditor()
       title =  editor.getTitle().slice(-2)
       if title == 'py'
         source = editor.getText()
         row = editor.getCursorBufferPosition().row + 1
         column = editor.getCursorBufferPosition().column + 1
         path = editor.getPath()
         @provider.goto_def(source, row, column, path)
