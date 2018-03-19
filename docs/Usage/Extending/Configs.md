# Configs

Most projects' configuration files are scattered at the root of your project directory such as `.babelrc`, `postcss.config.js` and `jest.config.js` or even defined in your `package.json`.
To truly embrace Zero Configuration™, `ugo` allows you to define any configuration in a composable and extensible way.

Configs in `ugo` are defined in `ugo.configs` which is a [ChainedMap](../NodeAPI.md#chainedmap)
For convenience, it has an additional method called `define(name)` which creates a new config if it doesn't yet exist.

Any added configuration is encouraged to be an instance of [ChainedMap](../NodeAPI.md#chainedmap) so that it becomes easier for others to perform modifications.

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
