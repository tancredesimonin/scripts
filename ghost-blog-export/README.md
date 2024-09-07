ghost-blog-export
=================

export ghost blog data


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ghost-blog-export.svg)](https://npmjs.org/package/ghost-blog-export)
[![Downloads/week](https://img.shields.io/npm/dw/ghost-blog-export.svg)](https://npmjs.org/package/ghost-blog-export)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g ghost-blog-export
$ ghost-blog-export COMMAND
running command...
$ ghost-blog-export (--version)
ghost-blog-export/0.0.0 darwin-arm64 node-v20.10.0
$ ghost-blog-export --help [COMMAND]
USAGE
  $ ghost-blog-export COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ghost-blog-export hello PERSON`](#ghost-blog-export-hello-person)
* [`ghost-blog-export hello world`](#ghost-blog-export-hello-world)
* [`ghost-blog-export help [COMMAND]`](#ghost-blog-export-help-command)
* [`ghost-blog-export plugins`](#ghost-blog-export-plugins)
* [`ghost-blog-export plugins add PLUGIN`](#ghost-blog-export-plugins-add-plugin)
* [`ghost-blog-export plugins:inspect PLUGIN...`](#ghost-blog-export-pluginsinspect-plugin)
* [`ghost-blog-export plugins install PLUGIN`](#ghost-blog-export-plugins-install-plugin)
* [`ghost-blog-export plugins link PATH`](#ghost-blog-export-plugins-link-path)
* [`ghost-blog-export plugins remove [PLUGIN]`](#ghost-blog-export-plugins-remove-plugin)
* [`ghost-blog-export plugins reset`](#ghost-blog-export-plugins-reset)
* [`ghost-blog-export plugins uninstall [PLUGIN]`](#ghost-blog-export-plugins-uninstall-plugin)
* [`ghost-blog-export plugins unlink [PLUGIN]`](#ghost-blog-export-plugins-unlink-plugin)
* [`ghost-blog-export plugins update`](#ghost-blog-export-plugins-update)

## `ghost-blog-export hello PERSON`

Say hello

```
USAGE
  $ ghost-blog-export hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ ghost-blog-export hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/tancredesimonin/ghost-blog-export/blob/v0.0.0/src/commands/hello/index.ts)_

## `ghost-blog-export hello world`

Say hello world

```
USAGE
  $ ghost-blog-export hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ ghost-blog-export hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/tancredesimonin/ghost-blog-export/blob/v0.0.0/src/commands/hello/world.ts)_

## `ghost-blog-export help [COMMAND]`

Display help for ghost-blog-export.

```
USAGE
  $ ghost-blog-export help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for ghost-blog-export.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.10/src/commands/help.ts)_

## `ghost-blog-export plugins`

List installed plugins.

```
USAGE
  $ ghost-blog-export plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ ghost-blog-export plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.6/src/commands/plugins/index.ts)_

## `ghost-blog-export plugins add PLUGIN`

Installs a plugin into ghost-blog-export.

```
USAGE
  $ ghost-blog-export plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into ghost-blog-export.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the GHOST_BLOG_EXPORT_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the GHOST_BLOG_EXPORT_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ ghost-blog-export plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ ghost-blog-export plugins add myplugin

  Install a plugin from a github url.

    $ ghost-blog-export plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ ghost-blog-export plugins add someuser/someplugin
```

## `ghost-blog-export plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ ghost-blog-export plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ ghost-blog-export plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.6/src/commands/plugins/inspect.ts)_

## `ghost-blog-export plugins install PLUGIN`

Installs a plugin into ghost-blog-export.

```
USAGE
  $ ghost-blog-export plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into ghost-blog-export.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the GHOST_BLOG_EXPORT_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the GHOST_BLOG_EXPORT_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ ghost-blog-export plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ ghost-blog-export plugins install myplugin

  Install a plugin from a github url.

    $ ghost-blog-export plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ ghost-blog-export plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.6/src/commands/plugins/install.ts)_

## `ghost-blog-export plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ ghost-blog-export plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ ghost-blog-export plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.6/src/commands/plugins/link.ts)_

## `ghost-blog-export plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ ghost-blog-export plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ghost-blog-export plugins unlink
  $ ghost-blog-export plugins remove

EXAMPLES
  $ ghost-blog-export plugins remove myplugin
```

## `ghost-blog-export plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ ghost-blog-export plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.6/src/commands/plugins/reset.ts)_

## `ghost-blog-export plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ ghost-blog-export plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ghost-blog-export plugins unlink
  $ ghost-blog-export plugins remove

EXAMPLES
  $ ghost-blog-export plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.6/src/commands/plugins/uninstall.ts)_

## `ghost-blog-export plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ ghost-blog-export plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ghost-blog-export plugins unlink
  $ ghost-blog-export plugins remove

EXAMPLES
  $ ghost-blog-export plugins unlink myplugin
```

## `ghost-blog-export plugins update`

Update installed plugins.

```
USAGE
  $ ghost-blog-export plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.6/src/commands/plugins/update.ts)_
<!-- commandsstop -->
