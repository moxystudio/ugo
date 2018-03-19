# Commands

Commands in `ugo` are defined in `ugo.commands` which is a [ChainedMap](../NodeAPI.md#chainedmap).
For convenience, it has an additional method called `define(name)` which creates a new command if it doesn't yet exist.

A command may have various actors. For instance, we may have a `build` command where we build a project using [Babel](https://github.com/babel/babel) and [PostCSS](https://github.com/postcss/postcss):

```js
module.exports = [
    (ugo) => {
        ugo.commands.define('build')
            .set('babel', {
                builder: (yargs) => yargs,
                handler: (ctx) => {},
            })
            .set('postcss', {
                builder: (yargs) => yargs,
                handler: (ctx) => {},
            });

        // Or use the `command` alias:
        ugo.command('build')
            .set('babel', {
                builder: (yargs) => yargs,
                handler: (ctx) => {},
            })
            .set('postcss', {
                builder: (yargs) => yargs,
                handler: (ctx) => {},
            });
    },
];
```

Each command actor has a `builder` and a `handler`. The `builder` manipulates a [yargs](http://yargs.js.org/docs) instance, defining any command flags. The `handler` function is responsible for handling the command and may return a promise. The next `handler` function is called only when the previous handler promise is resolved.

You may have noticed the `ctx` argument. It's a simple object containing:

- `argv`: the command line arguments resolved by [yargs](https://github.com/yargs/yargs)
- `log`: a [Logger](#logger) instance that produces logs in a standard way
- `data`: an object that may be used to pass arbitrary data to be used by other command actors


## Logger

TODO
