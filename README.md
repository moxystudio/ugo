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

Each time a new project is created, a set of commands and configurations have to be carefully setup. This process is tedious and we get the feeling that we are doing repetitive work, specially when the stack is mostly the same across similar projects.

Usually developers opt for:

1. Copy and pasting from the most recent project or from a boilerplate
2. Using a generator to bootstrap a project
3. Forking [kdc-scripts](https://github.com/kentcdodds/kcd-scripts) or similar and adapt to their needs
4. Using [builder](https://github.com/FormidableLabs/builder) or similar to setup projects' common steps

The first two options yield a maintenance burden because any change that you make is hard to apply to all projects.
The third option is a better solution though it lacks flexibility. Any variation of the tools must be under options, different commands or yet another fork. We feel that the forth approach is the right one, but the existent solutions either lack some composability or are unnecessarily complex.

`ugo` aims to solve this problem by offering an extensible and composable cli where different parties may participate in the definition of commands and configurations.


## Usage

Create a `ugo.config.js` file at the root of your project:

```js
module.exports = [
    (ugo) => {},
    (ugo) => {},
];
```

As you can see from the example above, the config file is composed by an array of functions. Those functions may manipulate `commands` and `configs`.

It's advisable to externalize these functions into plugins and publish them on [npm](https://www.npmjs.com/) so that they may be reused across projects. For instance, you may create `ugo-plugin-babel` that sets up babel compilation.
We also encourage creating presets that combine multiple plugins that are required for the same kind of projects.

Before we dive deeper, `ugo` makes use of [ChainedMap](#chainedmap) for most of its extension points. It's very similar to JavaScript's [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) but has some more useful methods and allows chaining.


### Commands

Commands may be defined via `ugo.command(name)` which returns the Command instance for `name`, creating it if it doesn't yet exist.
You may access the underlying commands via `ugo.commands` which is a [ChainedMap](#chainedmap) instance.

A command may have various steps. For instance, we may have a `build` command with two steps: one to build JavaScript files with [Babel](https://github.com/babel/babel) and one to build CSS files with [PostCSS](https://github.com/postcss/postcss):

```js
module.exports = [
    (ugo) => {
        ugo.command('build')
            .description('Builds the project')
            .step('babel')
                .title('Building with Babel')
                .options({
                    'output-dir': { type: 'string', default: 'dist' },
                    'cache': { type: 'boolean', default: true },
                })
                .task((ctx, task) => ({
                    const { argv, data } = ctx;

                    return Promise.resolve();
                }));
    },
    (ugo) => {
        ugo.command('build')
            .step('postcss')
                .title('Building with Babel')
                .options({
                    'output-dir': { type: 'string', default: 'dist' },
                    'cache': { type: 'boolean', default: true },
                })
                .task((ctx, task) => ({
                    const { argv, data } = ctx;

                    return Promise.resolve();
                }));
    },

    // You may access a command steps via `ugo.command('<name>').steps` which is a ChainedMap
];
```

Each step is a [listr task](https://github.com/SamVerschueren/listr) with an additional `options` property.

#### options

The `options` property allows you to define the step options.

Those options will be exposed as cli arguments. Since we use [yargs](http://yargs.js.org) under the hood, you are able to use the `yargs` [spec](http://yargs.js.org/docs/#api-optionskey-opt) when declaring options.

Besides that, there's an additional `exposeAs` property which allows you to change the name of the exposed option. This is useful to resolve conflicts in case different steps use the same name but have different types.

```js
module.exports = [
    (ugo) => {
        ugo.command('build')
            .step('babel')
                .tap('options', (options) => {
                    options.cache.exposeAs = 'babel-cache';

                    return step;
                })
                .end()
            .step('postcss')
                .tap('options', (options) => {
                    options.cache.exposeAs = 'postcss-cache';

                    return step;
                })
                .end();
    },
];
```

By default, if `ugo` detects a conflict, it will resolve it by implicitly setting `exposeAs` to `<stepName>-<optionName>` (e.g.: `babel-cache`).

#### ctx

The `ctx` argument from each step handler has the following properties:

- `argv`: the step options resolved by [yargs](https://github.com/yargs/yargs)
- `commandArgv`: the command options resolved by [yargs](https://github.com/yargs/yargs) which contains the combined options from all steps, where `exposeAs` was taken into consideration
- `data`: a object to pass around arbitrary data between steps


### Configs

Most projects' configuration files are scattered at the root of your project directory such as `.babelrc`, `postcss.config.js` and `jest.config.js` or even defined in your `package.json`. To truly embrace Zero Configuration™, `ugo` allows you to define any configuration in a composable and extensible way.

Configs may be defined via `ugo.config(name)` which returns the Config instance for `name`, creating it if it doesn't yet exist. You may access the underlying configs via `ugo.configs` which is a [ChainedMap](#chainedmap) instance.

Any configuration defined by the `create` function is encouraged to be an instance of [ChainedMap](#chainedmap). This way, modifiers can apply changes in an easier way.

```js
module.exports = [
    (ugo) => {
        ugo
            .config('babel')
                .create((options) => /* create babel config */)
                .modify('some-mutation', (config, options) => config)
                .modify('some-other-mutation', (config, options) => config)
                .end();
            .config('postcss')
                .create((options) => /* create postcss config */)
                .modify('some-mutation', (config, options) => config)
                .modify('some-other-mutation', (config, options) => config)
    }
];
```

Naturally, command steps will want to obtain and use configs.

To obtain a config, you may call `.resolve([options])`. This will create the config, apply any modifications and return the final produced config.
Alternatively, because the config may be a [ChainedMap](#chainedmap) as we encouraged earlier, you may call `.toObject([options])` which will always resolve to a JavaScript Object.

```js
const babelConfig = ugo.config('babel').resolve();
const babelConfigObject = ugo.config('babel').toObject();
```

#### Externalizing configs

While Zero Configuration™ is awesome, some configuration files must still be saved to disk.
As an example, `.eslintrc.json` and `.stylelintrc.json` files are used by editors to show linting errors directly in the editor graphical interface.

To solve this, you have to mark a config to be saved to disk by calling `.saveTo(path, [options])`.

```js
module.exports = [
    (ugo) => {
        ugo.config('eslint')
            .create((options) => /* create eslint config */)
            .saveTo('.eslintrc.json');
    }
];
```

Since `ugo setup` should be configured as the `postinstall` npm script, all the configs that were marked to be saved will be automatically created when you install a project with `$ npm install`.
Consequentially, you should not put these config files in source-control. If you use `git`, simply put them in the `.gitignore` file.


### CLI

TODO:

`$ ugo-run <command>

`$ ugo-debug list-commands`
`$ ugo-debug list-configs`
`$ ugo-debug print-config`

By default, `ugo` adds an automatic postinstall command that:

- Sets up `package.json` scripts
- Externalize configs flagged to be saved, e.g.: as `.eslintrc` and `.stylelintrc`.
- Warns about conflicts in steps options for each command

### Node API

#### ChainedMap

TODO: Create a separate packaged based on webpack-chain [ChainedMap](https://github.com/mozilla-neutrino/webpack-chain/blob/master/src/ChainedMap.js) and [friends](https://github.com/mozilla-neutrino/webpack-chain/blob/master/src/ChainedSet.js).

#### .run(argv, [options])

TODO:

One of the options must allow changing `ugo.config.js` to something else. This makes it possible to wrap a CLI with a different name.

#### .create([options])

TODO:


## Tests

`$ npm test`   
`$ npm test -- --watch` during development


## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
