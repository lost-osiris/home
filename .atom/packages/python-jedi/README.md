# python-jedi package

	Python Jedi based autocompletion plugin.

## Features
  - Autocomplete.
  - Goto Definition.

## Installation
  -	Either use Atoms package manager or `apm install python-jedi`. Install autocomplete-plus before installing this package.

### Usage
  - python-jedi uses python3 interpreter in your path by default.(i.e., by default Pathtopython field holds value python3).
  -	Enter the path to python executable in the settings(Pathtopython field) (eg:/home/user/py3pyenv/bin/python3 or /home/user/py2virtualenv/bin/python).

#### To Use Goto Definition
  - Use the keyboard shortcut `ctrl-alt-j`.

### Note
  - You may get spawn error if python executable is not in your path. To avoid frequent spawn errors -> enter the path to python executable in Path2python field (eg: /usr/bin/python3 or /usr/bin/python2 or /usr/bin/python).
  - I do not know whether this extension works in windows os environment. But works in linux with python installed. Still if it is not working., please then create an issue and help in solving the issue.

### Links
  - This package => forked from [autocomplete-plus-jedi](https://github.com/fallenhitokiri/autocomplete-plus-jedi)
  - Jedi library api reference [Jedi](http://jedi.readthedocs.io/en/latest/index.html).
  - Regular expressions testing and debugging using [regex101](https://regex101.com).
  