# ugo

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url] [![Greenkeeper badge][greenkeeper-image]][greenkeeper-url]

[npm-url]:https://npmjs.org/package/ugo
[downloads-image]:http://img.shields.io/npm/dm/ugo.svg
[npm-image]:http://img.shields.io/npm/v/ugo.svg
[travis-url]:https://travis-ci.org/moxystudio/ugo
[travis-image]:http://img.shields.io/travis/moxystudio/ugo/master.svg
[codecov-url]:https://codecov.io/gh/moxystudio/ugo
[codecov-image]:https://img.shields.io/codecov/c/github/moxystudio/ugo/master.svg
[david-dm-url]:https://david-dm.org/moxystudio/ugo
[david-dm-image]:https://img.shields.io/david/moxystudio/ugo.svg
[david-dm-dev-url]:https://david-dm.org/moxystudio/ugo?type=dev
[david-dm-dev-image]:https://img.shields.io/david/dev/moxystudio/ugo.svg
[greenkeeper-image]:https://badges.greenkeeper.io/moxystudio/ugo.svg
[greenkeeper-url]:https://greenkeeper.io/

> /yougo/

An extensible and composable cli.


## Installation

`$ npm install ugo`


## Motivation

Each time a new project is created, a set of commands and configurations have to be carefully setup.
This process is tedious and we get the feeling that we are doing repetitive work, specially when the stack is mostly the same across similar projects.

Usually developers opt for:

1. Copy and pasting from the most recent project
2. Using a generator to bootstrap a project
3. Forking [kdc-scripts](https://github.com/kentcdodds/kcd-scripts) or similar and adapt to their needs
4. Using [builder](https://github.com/FormidableLabs/builder) or similar to setup the project tasks

The first two options yield a huge maintenance burden because any change will require you to apply it all projects.   
The third option is better but it lacks flexibility. Any variation of the tools must be under options, different commands or yet another fork.   
We feel that the fourth approach is the right one but the existent solutions either lack composability or are unnecessarily complex.

`ugo` aims to solve this problem by offering an extensible and composable cli where different parties may participate in the definition of commands and configurations.


## Usage

Create a `ugo.config.js` file at the root of your project:

```js
module.exports = [
    (ugo) => {},
    (ugo) => {},
];
```

The config file is composed by an array of functions that may manipulate `commands` and `configs`.

We encourage externalizing these functions into plugins and publish them on [npm](https://www.npmjs.com/) so that they may be reused across projects.
For instance, you may create `ugo-plugin-babel` that sets up babel compilation.
We also encourage creating presets that combine multiple plugins that are required for the same kind of projects.

Before we dive deeper, it's important to mention that `ugo` makes use of [ChainedMap](#chainedmap) for most of its extension points.
It's very similar to JavaScript's [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) but has some more useful methods and allows chaining.


### Commands

Commands in `ugo` are defined in `ugo.commands` which is a [ChainedMap](#chainedmap).
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

#### Logger

TODO


### Configs

Most projects' configuration files are scattered at the root of your project directory such as `.babelrc`, `postcss.config.js` and `jest.config.js` or even defined in your `package.json`.
To truly embrace Zero Configuration™, `ugo` allows you to define any configuration in a composable and extensible way.

Configs in `ugo` are defined in `ugo.configs` which is a [ChainedMap](#chainedmap).
For convenience, it has an additional method called `define(name)` which creates a new config if it doesn't yet exist.

Any added configuration is encouraged to be an instance of [ChainedMap](#chainedmap) so its easier for others to manipulate it.

```js
module.exports = [
    (ugo) => {
        ugo.configs
            .define('babel')
                .create(() => /* create babel config */)
                .modifiers
                    .set('some-mutation', (config) => config)
                    .set('some-other-mutation', (config) => config)
                    .end()
                .end()
            .define('postcss')
                .create(() => /* create postcss config */)
                .modifiers
                    .set('some-mutation', (config) => config)
                    .set('some-other-mutation', (config) => config);

        // Or use the `config` and `modify` aliases:
        ugo
            .config('babel')
                .create(() => /* create babel config */)
                .modify('some-mutation', (config) => config)
                .modify('some-other-mutation', (config) => config)
                .end()
            .config('postcss')
                .create(() => /* create postcss config */)
                .modify('some-mutation', (config) => config)
                .modify('some-other-mutation', (config) => config);
    }
];
```

To obtain a configuration, you may call `.resolve([args])` which will create the config, apply any modifications and return the final produced configuration.
Since `create` and `modify` may return promises to allow asynchronous execution, `resolve` also returns a promise.

```js
const babelConfig = ugo.config('babel').resolve();
```


### CLI

TODO:

`$ ugo run <command`>

`$ ugo setup`

- Sets up `package.json` scripts
- Externalize files flagged to be saved, e.g.: as `.eslintrc` and `.stylelintrc`.

`$ ugo ???`


### Node API

#### ChainedMap

```js
// Remove all entries from a Map.
clear()

// Remove a single entry from a Map given its key.
// key: *
delete(key)

// Fetch the value from a Map located at the corresponding key.
// key: *
// returns: value
get(key)

// Set a value on the Map stored at the `key` location.
// key: *
// value: *
set(key, value)

// Marks the entry to be added before `key`
// key: *
before(key)

// Marks the entry to be added after `key`
// key: *
after(key)

// Returns `true` or `false` based on whether a Map as has a value set at a particular key.
// key: *
// returns: Boolean
has(key)

// Returns an array of all the values stored in the Map.
// returns: Array
values()

// Returns an object of all the entries in the backing Map
// where the key is the object property, and the value
// corresponding to the key. Will return `undefined` if the backing
// Map is empty.
// This will order properties by their name if the value is
// a ChainedMap that used .before() or .after().
// returns: Object, undefined if empty
entries()

// Provide an object which maps its properties and values
// into the backing Map as keys and values.
// You can also provide an array as the second argument
// for property names to omit from being merged.
// obj: Object
// omit: Optional Array
merge(obj, omit)

// Execute a function against the current configuration context
// handler: Function -> ChainedMap
// A function which is given a single argument of the ChainedMap instance
batch(handler)

// Conditionally execute a function to continue configuration
// condition: Boolean
// whenTruthy: Function -> ChainedMap
// invoked when condition is truthy, given a single argument of the ChainedMap instance
// whenFalsy: Optional Function -> ChainedMap
// invoked when condition is falsy, given a single argument of the ChainedMap instance
when(condition, whenTruthy, whenFalsy)
```

#### .run(argv)

TODO:

#### .resolveConfig(name)

TODO:


## Tests

`$ npm test`   
`$ npm test -- --watch` during development


## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
