# Extending

Create a `ugo.config.js` file at the root of your project:

```js
module.exports = [
    (ugo) => {},
    (ugo) => {},
];
```

The config file is composed by an array of functions that may manipulate `commands` and `configs`.

It's important to mention that `ugo` makes use of [ChainedMap](../NodeAPI.md#chainedmap) for most of its extension points.
It's very similar to JavaScript's [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) but has some more useful methods and allows chaining.

We encourage externalizing any reusable functions into plugins and publish them on [npm](https://www.npmjs.com/).
There's probably already a plugin made by the community that solves the problem you are trying to resolve.
You may look at the [official list of plugins](../../Ecosystem/OfficialPlugins.md) or search for [ugo plugins]([search](https://npms.io/search?q=keywords%3Augo-plugin) in npm.
Consider [creating a plugin](../../Ecosystem/CreatingAPlugin) if you couldn't find one from the ecosystem. You could even submit it to become part of the official list of plugins.

We also encourage [creating presets](../../Ecosystem/CreatingAPreset.md) that combine multiple plugins required for the same kind of projects.
