import json
import jedi
import sys

def main(read):
    read = json.loads(read)

    if read["type"] == "goto":
        payload = goto_def(read["source"], read["line"], read["column"], read["path"])
        payload = json.dumps(payload)

    else:
        payload = completions(read["source"], read["line"], read["column"], read["path"])
        payload = json.dumps(payload)

    print(payload)

def completions(source, line, column, path):
    script = jedi.api.Script(
        source = source,
        line = line + 1,
        column = column,
        path = path
    )

    completions = []

    try:
        for completion in script.completions():
            completions.append({
                "name": completion.name,
                "description": completion.description,
                "type":completion.type
            })

        return completions
    except:
        return []

def goto_def(source, line, column, path):

    try:
        script = jedi.api.Script( source, line , column ,path)
        defs = script.goto_definitions()
    except:
        return []

    if defs:
        is_built = script.goto_definitions()[0].in_builtin_module()
        module_name = script.goto_definitions()[0].module_name

    defs_string = list()
    for get in defs:
        defs_string.append({
            "type": get.type,
            "description": get.description,
            "module_path": get.module_path,
            "line": get.line,
            "column":get.column,
            "is_built_in": is_built,
            "module_name": module_name
        })
        break

    return defs_string

if __name__ == "__main__":
    read = sys.stdin.read();
    main(read)
