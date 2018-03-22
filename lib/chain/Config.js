'use strict';

const assert = require('assert');
const ChainedMap = require('webpack-chain/src/ChainedMap');

class Config extends ChainedMap {
    constructor(parent, name) {
        super(parent);

        this.modifiers = new ChainedMap(this);
        this.extend(['create']);

        this.set('name', name);
    }

    modify(name, fn) {
        this.modifiers.set(name, fn);

        return this;
    }

    resolve(...args) {
        const create = this.get('create');

        assert(create, `You must specificy a \`create\` function for the \`${this.get('name')}\``);

        let config = create(...args);

        config = this.modifiers.values().reduce((config, modifier) => modifier(config, ...args), config);

        return config;
    }

    toObject(...args) {
        let resolvedConfig = this.resolve(...args);

        if (resolvedConfig.toObject) {
            resolvedConfig = resolvedConfig.toObject();
        }

        return resolvedConfig;
    }
}

module.exports = Config;
